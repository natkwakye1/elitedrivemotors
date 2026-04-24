"use client";
// src/app/auth/forgot-password/page.tsx

import { useTheme } from "@/src/context/ThemeContext";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Ic } from "@/src/components/ui/Icons";

type Step = "email" | "otp" | "reset" | "done";

// ─── Reusable Input ───────────────────────────────────────────────────────────
function Input({ label, type = "text", value, onChange, placeholder, icon, t }: {
  label: string; type?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string; icon?: (c: string) => React.ReactNode; t: any;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display:"block", fontSize:11, fontWeight:600, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:7 }}>
        {label}
      </label>
      <div style={{ position:"relative" }}>
        {icon && (
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", display:"flex", opacity:0.4 }}>
            {icon(t.textMuted)}
          </span>
        )}
        <input
          type={isPassword ? (show ? "text" : "password") : type}
          value={value} onChange={onChange} placeholder={placeholder}
          style={{
            width:"100%",
            padding: icon ? "11px 14px 11px 34px" : "11px 14px",
            paddingRight: isPassword ? 44 : 14,
            borderRadius:10, border:`1.5px solid ${t.border}`,
            background:t.inputBg, color:t.textPri, fontSize:13,
            outline:"none", fontFamily:"'DM Sans',sans-serif",
            boxSizing:"border-box", transition:"border-color 0.15s",
          }}
          onFocus={e => (e.target.style.borderColor = t.accent)}
          onBlur={e  => (e.target.style.borderColor = t.border)}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(s => !s)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", padding:0 }}>
            {show ? Ic.EyeOff(t.textMuted) : Ic.Eye(t.textMuted)}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Step progress bar ────────────────────────────────────────────────────────
const STEPS: { key: Step; label: string }[] = [
  { key:"email", label:"Email"    },
  { key:"otp",   label:"Verify"   },
  { key:"reset", label:"Reset"    },
  { key:"done",  label:"Complete" },
];

function StepBar({ current, t }: { current: Step; t: any }) {
  const idx = STEPS.findIndex(s => s.key === current);
  return (
    <div style={{ display:"flex", alignItems:"center", marginBottom:32 }}>
      {STEPS.map((s, i) => {
        const done   = i < idx;
        const active = i === idx;
        return (
          <div key={s.key} style={{ display:"flex", alignItems:"center", flex: i < STEPS.length - 1 ? 1 : 0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
              <div style={{
                width:26, height:26, borderRadius:"50%",
                display:"flex", alignItems:"center", justifyContent:"center",
                background: done ? "#10B981" : active ? t.accent : t.bg,
                border:`2px solid ${done ? "#10B981" : active ? t.accent : t.border}`,
                transition:"all 0.2s",
              }}>
                {done
                  ? <span style={{ display:"flex" }}>{Ic.Check()}</span>
                  : <span style={{ fontSize:10, fontWeight:700, color: active ? "#fff" : t.textMuted }}>{i + 1}</span>
                }
              </div>
              <span style={{ fontSize:11, fontWeight: active ? 700 : 400, color: active ? t.textPri : t.textMuted }}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex:1, height:1, background: done ? "#10B981" : t.border, margin:"0 10px", transition:"background 0.2s" }}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const router = useRouter();
  const { dark, setDark, t } = useTheme();
  const [step, setStep]     = useState<Step>("email");
  const [email, setEmail]   = useState("");
  const [otp, setOtp]       = useState(["","","","","",""]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]   = useState("");

  const panelBg = dark ? "#16162A" : "#111111";

  const sendOtp = () => {
    if (!email) { setError("Please enter your email address."); return; }
    setError(""); setStep("otp");
  };

  const verifyOtp = () => {
    if (otp.join("").length < 6) { setError("Please enter the full 6-digit code."); return; }
    setError(""); setStep("reset");
  };

  const resetPassword = () => {
    if (!password)              { setError("Please enter a new password."); return; }
    if (password !== confirm)   { setError("Passwords do not match."); return; }
    if (password.length < 8)    { setError("Password must be at least 8 characters."); return; }
    setError(""); setStep("done");
  };

  const setOtpDigit = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    if (v.length > 1) return;
    const next = [...otp]; next[i] = v; setOtp(next);
    if (v && i < 5) (document.getElementById(`otp-${i + 1}`) as HTMLInputElement)?.focus();
    if (!v && i > 0) (document.getElementById(`otp-${i - 1}`) as HTMLInputElement)?.focus();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${t.bg}; font-family: 'DM Sans', sans-serif; transition: background 0.25s; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${t.scrollThumb}; border-radius: 4px; }
        input::placeholder { color: ${t.inputText}; }
      `}</style>

      <div style={{ display:"flex", height:"100vh", fontFamily:"'DM Sans',sans-serif", background:t.bg, overflow:"hidden" }}>

        {/* ══════════════════════════════════════════
            LEFT — dark branding panel (same as login)
        ══════════════════════════════════════════ */}
        <div style={{ width:"44%", flexShrink:0, background:panelBg, display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"36px 40px", position:"relative", overflow:"hidden" }}>

          {/* dot grid */}
          <div style={{ position:"absolute", inset:0, opacity:0.04, pointerEvents:"none" }}>
            <svg width="100%" height="100%">
              <defs>
                <pattern id="dots" width="50" height="50" patternUnits="userSpaceOnUse">
                  <circle cx="25" cy="25" r="1.5" fill="white"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)"/>
            </svg>
          </div>

          {/* Logo */}
          <div onClick={() => router.push("/")} style={{ display:"flex", alignItems:"center", gap:9, cursor:"pointer", width:"fit-content", position:"relative", zIndex:1 }}>
            <div style={{ width:34, height:34, background:"#fff", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center" }}>
              {Ic.CarLogo("#111")}
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:800, color:"#fff", letterSpacing:2, lineHeight:1.1 }}>AUTO</div>
              <div style={{ fontSize:9.5, fontWeight:600, color:"rgba(255,255,255,0.38)", letterSpacing:1.5 }}>ULTIMATE</div>
            </div>
          </div>

          {/* copy */}
          <div style={{ position:"relative", zIndex:1 }}>
            <div style={{ fontSize:36, fontWeight:800, color:"#fff", lineHeight:1.18, marginBottom:14 }}>
              Recover your<br />account access.
            </div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.48)", lineHeight:1.75, maxWidth:280, marginBottom:28 }}>
              Follow the steps to verify your identity and set a new password securely.
            </div>

            {/* step indicators on left panel */}
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {[
                { icon:(c:string)=>Ic.Contact(c),  label:"Enter your email address"       },
                { icon:(c:string)=>Ic.Notes(c),    label:"Enter the 6-digit OTP code"     },
                { icon:(c:string)=>Ic.License(c),  label:"Set your new password"          },
              ].map((row, i) => {
                const stepIdx = STEPS.findIndex(s => s.key === step);
                const done    = stepIdx > i;
                const active  = stepIdx === i;
                return (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:32, height:32, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, background: done ? "rgba(16,185,129,0.2)" : active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)", border:`1px solid ${done ? "rgba(16,185,129,0.4)" : active ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)"}`, transition:"all 0.2s" }}>
                      <span style={{ display:"flex", opacity: done ? 1 : active ? 0.9 : 0.35 }}>
                        {done ? Ic.Check() : row.icon("rgba(255,255,255,0.8)")}
                      </span>
                    </div>
                    <span style={{ fontSize:13, color: done ? "rgba(255,255,255,0.6)" : active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)", fontWeight: active ? 600 : 400, transition:"all 0.2s" }}>
                      {row.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* bottom note */}
          <div style={{ position:"relative", zIndex:1, borderTop:"1px solid rgba(255,255,255,0.09)", paddingTop:20 }}>
            <div style={{ fontSize:12.5, color:"rgba(255,255,255,0.4)", fontStyle:"italic", lineHeight:1.65 }}>
              "Your security is our priority. All reset codes expire in 10 minutes."
            </div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.25)", marginTop:6 }}>
              — EliteDriveMotors Security Team
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            RIGHT — form panel (same as login)
        ══════════════════════════════════════════ */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

          {/* TopBar strip */}
          <div style={{ height:52, flexShrink:0, borderBottom:`1px solid ${t.border}`, background:t.cardBg, display:"flex", alignItems:"center", justifyContent:"flex-end", padding:"0 20px" }}>
            <button onClick={() => setDark(!dark)} style={{ width:34, height:34, borderRadius:8, border:`1px solid ${t.border}`, background:t.bg, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              {dark ? Ic.Sun(t.textMuted) : Ic.Moon(t.textMuted)}
            </button>
          </div>

          {/* scrollable form */}
          <div style={{ flex:1, overflowY:"auto", display:"flex", alignItems:"center", justifyContent:"center", padding:"40px" }}>
            <div style={{ width:"100%", maxWidth:420 }}>

              {/* ── STEP: email ── */}
              {step === "email" && (
                <>
                  <div style={{ marginBottom:28 }}>
                    <h1 style={{ fontSize:24, fontWeight:800, color:t.textPri, marginBottom:5 }}>Forgot password?</h1>
                    <p style={{ fontSize:13, color:t.textMuted }}>Enter your email and we'll send you a reset code.</p>
                  </div>

                  <StepBar current={step} t={t}/>

                  {error && (
                    <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:8, padding:"10px 14px", fontSize:12, color:"#EF4444", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
                      {Ic.Alert("#EF4444")}{error}
                    </div>
                  )}

                  <Input label="Email Address" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com" icon={Ic.Contact} t={t}/>

                  <button onClick={sendOtp} style={{ width:"100%", padding:"12px 0", borderRadius:10, border:"none", background:t.accent, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:4 }}>
                    Send Reset Code {Ic.ArrowRight("#fff")}
                  </button>

                  <p style={{ textAlign:"center", fontSize:13, color:t.textMuted, marginTop:22 }}>
                    Remember it?{" "}
                    <span onClick={()=>router.push("/auth/login")} style={{ color:t.accent, fontWeight:700, cursor:"pointer" }}>Back to sign in</span>
                  </p>
                </>
              )}

              {/* ── STEP: otp ── */}
              {step === "otp" && (
                <>
                  <div style={{ marginBottom:28 }}>
                    <h1 style={{ fontSize:24, fontWeight:800, color:t.textPri, marginBottom:5 }}>Check your email</h1>
                    <p style={{ fontSize:13, color:t.textMuted, lineHeight:1.65 }}>
                      We sent a 6-digit code to <strong style={{ color:t.textPri }}>{email}</strong>. Enter it below.
                    </p>
                  </div>

                  <StepBar current={step} t={t}/>

                  {error && (
                    <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:8, padding:"10px 14px", fontSize:12, color:"#EF4444", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
                      {Ic.Alert("#EF4444")}{error}
                    </div>
                  )}

                  {/* OTP boxes */}
                  <div style={{ marginBottom:8 }}>
                    <label style={{ display:"block", fontSize:11, fontWeight:600, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:14 }}>Verification Code</label>
                    <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
                      {otp.map((d, i) => (
                        <input
                          key={i} id={`otp-${i}`} value={d} maxLength={1}
                          onChange={e => setOtpDigit(i, e.target.value)}
                          onKeyDown={e => { if (e.key === "Backspace" && !d && i > 0) (document.getElementById(`otp-${i-1}`) as HTMLInputElement)?.focus(); }}
                          style={{
                            width:52, height:58, textAlign:"center",
                            fontSize:22, fontWeight:800,
                            borderRadius:10,
                            border:`1.5px solid ${d ? t.accent : t.border}`,
                            background:t.inputBg, color:t.textPri,
                            outline:"none", fontFamily:"'DM Sans',sans-serif",
                            transition:"border-color 0.15s",
                          }}
                          onFocus={e => (e.target.style.borderColor = t.accent)}
                          onBlur={e  => (e.target.style.borderColor = d ? t.accent : t.border)}
                        />
                      ))}
                    </div>
                  </div>

                  <button onClick={verifyOtp} style={{ width:"100%", padding:"12px 0", borderRadius:10, border:"none", background:t.accent, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:20, marginBottom:14 }}>
                    Verify Code {Ic.ArrowRight("#fff")}
                  </button>

                  <p style={{ textAlign:"center", fontSize:12, color:t.textMuted }}>
                    Didn't receive it?{" "}
                    <span onClick={() => setOtp(["","","","","",""])} style={{ color:t.accent, fontWeight:700, cursor:"pointer" }}>Resend code</span>
                  </p>
                </>
              )}

              {/* ── STEP: reset ── */}
              {step === "reset" && (
                <>
                  <div style={{ marginBottom:28 }}>
                    <h1 style={{ fontSize:24, fontWeight:800, color:t.textPri, marginBottom:5 }}>Set new password</h1>
                    <p style={{ fontSize:13, color:t.textMuted }}>Choose a strong password of at least 8 characters.</p>
                  </div>

                  <StepBar current={step} t={t}/>

                  {error && (
                    <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:8, padding:"10px 14px", fontSize:12, color:"#EF4444", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
                      {Ic.Alert("#EF4444")}{error}
                    </div>
                  )}

                  <Input label="New Password"     type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" t={t}/>
                  <Input label="Confirm Password" type="password" value={confirm}  onChange={e=>setConfirm(e.target.value)}  placeholder="••••••••" t={t}/>

                  {/* strength indicator */}
                  {password.length > 0 && (
                    <div style={{ marginBottom:16, marginTop:-8 }}>
                      <div style={{ display:"flex", gap:4, marginBottom:5 }}>
                        {[1,2,3,4].map(n => (
                          <div key={n} style={{ flex:1, height:3, borderRadius:2, background: password.length >= n*2 ? (password.length >= 8 ? "#10B981" : "#F59E0B") : t.border, transition:"background 0.2s" }}/>
                        ))}
                      </div>
                      <span style={{ fontSize:11, color: password.length >= 8 ? "#10B981" : "#F59E0B" }}>
                        {password.length < 4 ? "Weak" : password.length < 8 ? "Fair" : "Strong"}
                      </span>
                    </div>
                  )}

                  <button onClick={resetPassword} style={{ width:"100%", padding:"12px 0", borderRadius:10, border:"none", background:t.accent, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                    <span style={{ display:"flex" }}>{Ic.Check()}</span> Reset Password
                  </button>
                </>
              )}

              {/* ── STEP: done ── */}
              {step === "done" && (
                <div style={{ textAlign:"center" }}>
                  <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(16,185,129,0.12)", border:"2px solid rgba(16,185,129,0.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
                    <span style={{ display:"flex", transform:"scale(1.4)", color:"#10B981" }}>{Ic.Check()}</span>
                  </div>

                  <h1 style={{ fontSize:24, fontWeight:800, color:t.textPri, marginBottom:8 }}>Password reset</h1>
                  <p style={{ fontSize:13, color:t.textMuted, lineHeight:1.7, marginBottom:32 }}>
                    Your password has been updated successfully. You can now sign in with your new password.
                  </p>

                  <div style={{ height:1, background:t.divider, marginBottom:28 }}/>

                  <button onClick={()=>router.push("/auth/login")} style={{ width:"100%", padding:"12px 0", borderRadius:10, border:"none", background:t.accent, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                    Sign In {Ic.ArrowRight("#fff")}
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </>
  );
}