"use client";
// src/app/auth/register/page.tsx

import { useTheme } from "@/src/context/ThemeContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ic } from "@/src/components/ui/Icons";
import DatePicker from "@/src/components/ui/DatePicker";

function Input({ label, type = "text", value, onChange, placeholder, t }: any) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={isPassword ? (show ? "text" : "password") : type}
          value={value} onChange={onChange} placeholder={placeholder}
          style={{ width: "100%", padding: "11px 14px", paddingRight: isPassword ? 52 : 14, borderRadius: 10, border: `1.5px solid ${t.border}`, background: t.inputBg, color: t.textPri, fontSize: 13, outline: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box" }}
          onFocus={e => (e.target.style.borderColor = t.accent)}
          onBlur={e => (e.target.style.borderColor = t.border)}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: t.textMuted, fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>
            {show ? "Hide" : "Show"}
          </button>
        )}
      </div>
    </div>
  );
}

const UploadIcon = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const STEPS = ["Account", "Personal", "Verify"];

export default function RegisterPage() {
  const router = useRouter();
  const { dark, setDark, t } = useTheme();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: "", password: "", confirm: "", firstName: "", lastName: "", phone: "", dob: "", idType: "Ghana Card", idNumber: "", agree: false });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const next = () => {
    if (step === 1) {
      if (!form.email || !form.password) { setError("Fill in email and password."); return; }
      if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    }
    if (step === 2) {
      if (!form.firstName || !form.lastName || !form.phone) { setError("Fill in all personal details."); return; }
    }
    setError(""); setStep(s => s + 1);
  };

  const submit = () => {
    if (!form.idNumber) { setError("Enter your ID number."); return; }
    if (!form.agree) { setError("Please accept the terms."); return; }
    setDone(true);
  };

  if (done) return (
    <>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}body{background:${t.bg};font-family:'DM Sans',sans-serif;}`}</style>
      <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", background: t.cardBg, borderRadius: 20, border: `1px solid ${t.border}`, padding: "48px 40px", maxWidth: 400, width: "90%" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(16,185,129,0.15)", border: "1.5px solid rgba(16,185,129,0.35)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: t.textPri, marginBottom: 8 }}>Account Created</div>
          <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.7, marginBottom: 28 }}>Welcome to EliteDriveMotors, {form.firstName}. Your account is ready to go.</div>
          <button onClick={() => router.push("/auth/login")} style={{ display: "block", width: "100%", background: t.accent, color: t.accentFg, borderRadius: 10, padding: "12px 0", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
            Sign In
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:${t.bg};font-family:'DM Sans',sans-serif;}
        input::placeholder{color:${t.inputText};}
        select{font-family:'DM Sans',sans-serif;}
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", background: t.bg, transition: "background 0.25s" }}>

        {/* Left panel */}
        <div style={{ width: "44%", background: dark ? "#16162A" : "#111111", padding: "48px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.035 }}>
            <svg width="100%" height="100%"><defs><pattern id="dots2" width="50" height="50" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1.5" fill="white"/></pattern></defs><rect width="100%" height="100%" fill="url(#dots2)"/></svg>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 56, position: "relative" }}>
            <div style={{ width: 40, height: 40, background: "#fff", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.CarLogo("#111")}</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", letterSpacing: 2 }}>ELITE DRIVE</div>
              <div style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.38)", letterSpacing: 1.5 }}>MOTORS</div>
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: 16 }}>Join thousands of happy drivers.</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, marginBottom: 36 }}>Create your free account and access Ghana's best car platform.</div>
            {[
              "Book any car in minutes",
              "Full insurance options available",
              "Live tracking on every rental",
              "24/7 customer support",
            ].map(text => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(16,185,129,0.25)", border: "1px solid rgba(16,185,129,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: form */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 40px", position: "relative" }}>
          <button onClick={() => setDark(!dark)} style={{ position: "absolute", top: 24, right: 24, width: 36, height: 36, borderRadius: 8, border: `1px solid ${t.border}`, background: t.cardBg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            {dark ? Ic.Sun(t.textMuted) : Ic.Moon(t.textMuted)}
          </button>

          <div style={{ width: "100%", maxWidth: 420 }}>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: t.textPri, marginBottom: 6 }}>Create your account</h1>
              <p style={{ fontSize: 13, color: t.textMuted }}>
                Already have one?{" "}
                <button onClick={() => router.push("/auth/login")} style={{ color: t.accent, fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 13, padding: 0 }}>Sign in</button>
              </p>
            </div>

            {/* Step indicator */}
            <div style={{ display: "flex", gap: 6, marginBottom: 28, alignItems: "center" }}>
              {STEPS.map((s, i) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: step > i + 1 ? "#10B981" : step === i + 1 ? t.accent : t.toggleOff, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s", flexShrink: 0 }}>
                    {step > i + 1
                      ? <svg width="11" height="11" viewBox="0 0 11 9" fill="none"><path d="M1 4.5l3 3L10 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      : <span style={{ fontSize: 11, fontWeight: 700, color: step >= i + 1 ? "#fff" : t.textMuted }}>{i + 1}</span>
                    }
                  </div>
                  <span style={{ fontSize: 12, fontWeight: step === i + 1 ? 700 : 400, color: step === i + 1 ? t.textPri : t.textMuted }}>{s}</span>
                  {i < STEPS.length - 1 && <div style={{ width: 24, height: 1, background: t.border, marginLeft: 2 }} />}
                </div>
              ))}
            </div>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#EF4444", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "flex", flexShrink: 0 }}>{Ic.Alert("#EF4444")}</span>
                {error}
              </div>
            )}

            {step === 1 && (
              <div>
                <Input label="Email Address" type="email" value={form.email} onChange={(e: any) => set("email", e.target.value)} placeholder="you@email.com" t={t} />
                <Input label="Password" type="password" value={form.password} onChange={(e: any) => set("password", e.target.value)} placeholder="Min 8 characters" t={t} />
                <Input label="Confirm Password" type="password" value={form.confirm} onChange={(e: any) => set("confirm", e.target.value)} placeholder="Repeat password" t={t} />
                {form.password && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ height: 4, background: t.toggleOff, borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: form.password.length > 11 ? "100%" : form.password.length > 7 ? "66%" : "33%", background: form.password.length > 11 ? "#10B981" : form.password.length > 7 ? "#F59E0B" : "#EF4444", borderRadius: 2, transition: "width 0.3s" }} />
                    </div>
                    <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>
                      {form.password.length > 11 ? "Strong password" : form.password.length > 7 ? "Medium — try adding symbols" : "Weak — too short"}
                    </div>
                  </div>
                )}
                <button onClick={next} style={{ width: "100%", padding: "13px 0", borderRadius: 10, border: "none", background: t.accent, color: t.accentFg, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Continue</button>
              </div>
            )}

            {step === 2 && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
                  <Input label="First Name" value={form.firstName} onChange={(e: any) => set("firstName", e.target.value)} placeholder="John" t={t} />
                  <Input label="Last Name" value={form.lastName} onChange={(e: any) => set("lastName", e.target.value)} placeholder="Mensah" t={t} />
                </div>
                <Input label="Phone Number" value={form.phone} onChange={(e: any) => set("phone", e.target.value)} placeholder="+233 XX XXX XXXX" t={t} />
                <div style={{ marginBottom: 14 }}>
                  <DatePicker label="Date of Birth" value={form.dob} onChange={(v) => set("dob", v)} placeholder="Select date of birth" />
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <button onClick={() => setStep(1)} style={{ flex: 1, padding: "12px 0", borderRadius: 10, border: `1px solid ${t.border}`, background: t.cardBg, color: t.textSec, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Back</button>
                  <button onClick={next} style={{ flex: 2, padding: "12px 0", borderRadius: 10, border: "none", background: t.accent, color: t.accentFg, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Continue</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>ID Type</label>
                  <select value={form.idType} onChange={e => set("idType", e.target.value)} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${t.border}`, background: t.inputBg, color: t.textPri, fontSize: 13, outline: "none" }}>
                    <option>Ghana Card</option>
                    <option>Passport</option>
                    <option>Driver's License</option>
                    <option>Voter ID</option>
                  </select>
                </div>
                <Input label={`${form.idType} Number`} value={form.idNumber} onChange={(e: any) => set("idNumber", e.target.value)} placeholder="Enter ID number" t={t} />

                {/* ID upload */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Upload ID Document</label>
                  <div style={{ height: 88, borderRadius: 10, border: `2px dashed ${t.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7, cursor: "pointer", background: t.bg, transition: "border-color 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = t.accent)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = t.border)}>
                    <UploadIcon color={t.textMuted} />
                    <div style={{ fontSize: 12, color: t.textMuted }}>Click to upload front of ID</div>
                  </div>
                </div>

                {/* Terms */}
                <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginBottom: 20 }}>
                  <div onClick={() => set("agree", !form.agree)} style={{ width: 17, height: 17, borderRadius: 4, border: `2px solid ${form.agree ? t.accent : t.checkBorder}`, background: form.agree ? t.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, transition: "all 0.15s" }}>
                    {form.agree && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5l2.5 2.5L8 1" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span style={{ fontSize: 12, color: t.textSec, lineHeight: 1.6 }}>
                    I agree to the{" "}
                    <span style={{ color: t.accent, fontWeight: 600, cursor: "pointer" }}>Terms of Service</span>
                    {" "}and{" "}
                    <span style={{ color: t.accent, fontWeight: 600, cursor: "pointer" }}>Privacy Policy</span>
                  </span>
                </label>

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setStep(2)} style={{ flex: 1, padding: "12px 0", borderRadius: 10, border: `1px solid ${t.border}`, background: t.cardBg, color: t.textSec, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Back</button>
                  <button onClick={submit} style={{ flex: 2, padding: "12px 0", borderRadius: 10, border: "none", background: t.accent, color: t.accentFg, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Create Account</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
