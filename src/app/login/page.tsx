"use client";
// src/app/login/page.tsx

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTheme } from "@/src/context/ThemeContext";
import { useSaas } from "@/src/context/SaasContext";
import { useAdminAuth } from "@/src/context/AdminAuthContext";
import { useCustomerAuth } from "@/src/context/Customerauthcontext";
import { Ic } from "@/src/components/ui/Icons";

type LoginMode = "company" | "customer" | "admin";

const MODE_META: Record<LoginMode, { label:string; hint:string; badge:string }> = {
  company:  { label:"Company Login",  hint:"Sign in with your company email",  badge:"CO" },
  customer: { label:"Customer Login", hint:"Access your bookings and account",  badge:"CU" },
  admin:    { label:"Admin Login",    hint:"Super-admin access",                badge:"AD" },
};

export default function UniversalLoginPage() {
  const router = useRouter();
  const { dark, setDark } = useTheme();
  const { saasLogin }          = useSaas();
  const { login: adminLogin }  = useAdminAuth();
  const { login: custLogin }   = useCustomerAuth();

  const [mode,     setMode]    = useState<LoginMode>("company");
  const [email,    setEmail]   = useState("");
  const [password, setPassword]= useState("");
  const [showPw,   setShowPw]  = useState(false);
  const [error,    setError]   = useState("");
  const [loading,  setLoading] = useState(false);
  const [isMobile, setIsMobile]= useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Theme tokens
  const ACC    = dark ? "#ffffff" : "#111111";
  const ACC_FG = dark ? "#000000" : "#ffffff";
  const BG     = dark ? "#0a0a0a" : "#f5f5f5";
  const CARD   = dark ? "#141414" : "#ffffff";
  const BORDER = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const MUTED  = dark ? "rgba(255,255,255,0.42)" : "#777";
  const HEAD   = dark ? "#ffffff" : "#0a0a0a";
  const SUBTLE = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";
  const panelBg = dark ? "#0a0a0a" : "#111";

  const meta = MODE_META[mode];

  const handleLogin = async () => {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    try {
      if (mode === "company") {
        const result = await saasLogin(email, password);
        if (result.ok) { router.push(result.redirect ?? "/company/portal/admin"); return; }
        setError(result.error ?? "Login failed.");
      } else if (mode === "admin") {
        const result = await adminLogin(email, password);
        if (result.ok) { router.push("/dashboard/super-admin"); return; }
        setError(result.error ?? "Login failed.");
      } else {
        const result = await custLogin(email, password);
        if (result.ok) { router.push(result.redirect ?? "/customer/dashboard"); return; }
        setError(result.error ?? "Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const ModeIcon = ({ m }: { m: LoginMode }) => (
    <div style={{ width:28, height:28, borderRadius:7, background: m===mode ? ACC : `${ACC}15`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <span style={{ fontSize:9, fontWeight:800, color: m===mode ? ACC_FG : MUTED, letterSpacing:0.5, fontFamily:"'DM Sans',sans-serif" }}>
        {MODE_META[m].badge}
      </span>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${BG}; font-family: 'DM Sans', sans-serif; }
        input::placeholder { color: ${MUTED}; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .form-fade { animation: fadeIn 0.25s ease both; }
      `}</style>

      <div style={{ display:"flex", height:"100vh", fontFamily:"'DM Sans',sans-serif", overflow:"hidden" }}>

        {/* ── Left dark panel ── */}
        {!isMobile && (
          <div style={{ width:"42%", flexShrink:0, background:panelBg, display:"flex", flexDirection:"column", position:"relative", overflow:"hidden" }}>
            {/* Dot grid */}
            <div style={{ position:"absolute", inset:0, opacity:0.05, pointerEvents:"none" }}>
              <svg width="100%" height="100%">
                <defs><pattern id="dots" width="50" height="50" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1.5" fill="white"/></pattern></defs>
                <rect width="100%" height="100%" fill="url(#dots)"/>
              </svg>
            </div>
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"40%", background:`linear-gradient(to top, ${panelBg} 0%, transparent 100%)`, pointerEvents:"none", zIndex:2 }}/>

            {/* Car */}
            <div style={{ position:"absolute", bottom:"8%", left:"-8%", width:"116%", height:"55%", zIndex:1, pointerEvents:"none" }}>
              <div style={{ position:"absolute", bottom:0, left:"10%", right:"10%", height:"18%", background:"radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.07) 0%, transparent 70%)" }}/>
              <Image src="/images/cars/blackbenz.png" alt="Elite Drive" fill sizes="50vw"
                style={{ objectFit:"contain", objectPosition:"center bottom", filter:"drop-shadow(0 24px 50px rgba(0,0,0,0.85)) brightness(0.95)" }} priority/>
            </div>

            {/* Logo */}
            <div style={{ padding:"36px 40px 0", position:"relative", zIndex:3 }}>
              <div onClick={()=>router.push("/")} style={{ display:"flex", alignItems:"center", gap:9, cursor:"pointer", width:"fit-content" }}>
                <div style={{ width:34, height:34, background:"#fff", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center" }}>{Ic.CarLogo("#111")}</div>
                <div>
                  <div style={{ fontSize:11, fontWeight:800, color:"#fff", letterSpacing:2, lineHeight:1.1 }}>ELITE</div>
                  <div style={{ fontSize:9.5, fontWeight:600, color:"rgba(255,255,255,0.38)", letterSpacing:1.5 }}>DRIVE MOTORS</div>
                </div>
              </div>
            </div>

            {/* Copy */}
            <div style={{ padding:"28px 40px 0", position:"relative", zIndex:3 }}>
              <div style={{ fontSize:34, fontWeight:900, color:"#fff", lineHeight:1.18, marginBottom:14 }}>
                One platform.<br/>Every role.
              </div>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.48)", lineHeight:1.75, maxWidth:270, marginBottom:24 }}>
                Company admins, finance teams, employees, and customers — all sign in from the same page and land exactly where they belong.
              </p>

              {/* Mode selector */}
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {(["company","customer","admin"] as LoginMode[]).map(m => (
                  <button key={m} onClick={()=>{ setMode(m); setError(""); }}
                    style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:12, border:`1px solid ${mode===m?"rgba(255,255,255,0.25)":"rgba(255,255,255,0.1)"}`, background: mode===m?"rgba(255,255,255,0.1)":"transparent", cursor:"pointer", textAlign:"left", transition:"all 0.2s", fontFamily:"'DM Sans',sans-serif" }}>
                    <ModeIcon m={m}/>
                    <span style={{ fontSize:13, fontWeight:600, color: mode===m?"#fff":"rgba(255,255,255,0.55)" }}>{MODE_META[m].label}</span>
                    {mode===m && <div style={{ marginLeft:"auto", width:6, height:6, borderRadius:"50%", background:"rgba(255,255,255,0.6)" }}/>}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ flex:1 }}/>
            <div style={{ padding:"20px 40px 32px", position:"relative", zIndex:3, borderTop:"1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.28)", lineHeight:1.6 }}>
                New dealership?{" "}
                <span onClick={()=>router.push("/onboarding")} style={{ color:"rgba(255,255,255,0.55)", cursor:"pointer", textDecoration:"underline" }}>Create your company portal</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Right form panel ── */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

          {/* Top strip */}
          <div style={{ height:52, flexShrink:0, borderBottom:`1px solid ${BORDER}`, background:CARD, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px" }}>
            {isMobile && (
              <div onClick={()=>router.push("/")} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                <div style={{ width:26, height:26, borderRadius:7, background:HEAD, display:"flex", alignItems:"center", justifyContent:"center" }}>{Ic.CarLogo(dark?"#000":"#fff")}</div>
                <span style={{ fontSize:11, fontWeight:800, color:HEAD, letterSpacing:2 }}>ELITE</span>
              </div>
            )}
            {!isMobile && <span style={{ fontSize:12, color:MUTED }}>EliteDriveMotors Login</span>}
            <div style={{ display:"flex", gap:8 }}>
              {isMobile && (
                <div style={{ display:"flex", gap:6 }}>
                  {(["company","customer","admin"] as LoginMode[]).map(m => (
                    <button key={m} onClick={()=>{ setMode(m); setError(""); }}
                      style={{ padding:"5px 10px", borderRadius:7, border:`1px solid ${mode===m?ACC:BORDER}`, background: mode===m?`${ACC}12`:"transparent", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700, color: mode===m?ACC:MUTED }}>
                      {MODE_META[m].badge}
                    </button>
                  ))}
                </div>
              )}
              <button onClick={()=>setDark(!dark)} style={{ width:34, height:34, borderRadius:8, border:`1px solid ${BORDER}`, background:BG, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                {dark ? Ic.Sun(MUTED) : Ic.Moon(MUTED)}
              </button>
            </div>
          </div>

          {/* Form */}
          <div style={{ flex:1, overflowY:"auto", display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px" }}>
            <div className="form-fade" key={mode} style={{ width:"100%", maxWidth:400 }}>

              {/* Mode badge */}
              <div style={{ marginBottom:28 }}>
                <div style={{ display:"inline-flex", alignItems:"center", gap:7, fontSize:10, fontWeight:700, letterSpacing:1, background:`${ACC}10`, color:HEAD, border:`1px solid ${BORDER}`, borderRadius:20, padding:"5px 12px", marginBottom:14 }}>
                  <span style={{ fontSize:9, fontWeight:800 }}>{meta.badge}</span>
                  {meta.label.toUpperCase()}
                </div>
                <h1 style={{ fontSize:26, fontWeight:900, color:HEAD, marginBottom:6 }}>Welcome back</h1>
                <p style={{ fontSize:13, color:MUTED }}>{meta.hint}</p>
              </div>

              {/* Error */}
              {error && (
                <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:9, padding:"10px 14px", fontSize:12, color:"#EF4444", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
                  {Ic.Alert("#EF4444")} {error}
                </div>
              )}

              {/* Email */}
              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:1, marginBottom:7 }}>Email</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                  placeholder={mode==="company" ? "yourname@company.com" : mode==="admin" ? "admin@elitedrivemotors.com" : "you@gmail.com"}
                  onKeyDown={e=>e.key==="Enter"&&handleLogin()}
                  style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1.5px solid ${BORDER}`, background:CARD, color:HEAD, fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box", transition:"border-color 0.15s" }}
                  onFocus={e=>(e.target.style.borderColor=ACC)}
                  onBlur={e=>(e.target.style.borderColor=BORDER)}/>
              </div>

              {/* Password */}
              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:1, marginBottom:7 }}>Password</label>
                <div style={{ position:"relative" }}>
                  <input type={showPw?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)}
                    placeholder="••••••••"
                    onKeyDown={e=>e.key==="Enter"&&handleLogin()}
                    style={{ width:"100%", padding:"11px 44px 11px 14px", borderRadius:10, border:`1.5px solid ${BORDER}`, background:CARD, color:HEAD, fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box", transition:"border-color 0.15s" }}
                    onFocus={e=>(e.target.style.borderColor=ACC)}
                    onBlur={e=>(e.target.style.borderColor=BORDER)}/>
                  <button type="button" onClick={()=>setShowPw(s=>!s)}
                    style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", padding:0 }}>
                    {showPw ? Ic.EyeOff(MUTED) : Ic.Eye(MUTED)}
                  </button>
                </div>
              </div>

              {/* Forgot */}
              <div style={{ textAlign:"right", marginBottom:22, marginTop:-4 }}>
                <span style={{ fontSize:12, color:MUTED, fontWeight:600, cursor:"pointer" }}>Forgot password?</span>
              </div>

              {/* Submit */}
              <button onClick={handleLogin} disabled={loading}
                style={{ width:"100%", padding:"13px 0", borderRadius:10, border:"none", background:ACC, color:ACC_FG, fontSize:14, fontWeight:700, cursor:loading?"not-allowed":"pointer", fontFamily:"'DM Sans',sans-serif", opacity:loading?0.7:1, transition:"opacity 0.2s, transform 0.15s", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
                onMouseEnter={e=>{ if(!loading) e.currentTarget.style.transform="translateY(-1px)"; }}
                onMouseLeave={e=>(e.currentTarget.style.transform="translateY(0)")}>
                {loading ? <>{Ic.Spinner(ACC_FG)} Signing in…</> : <>Sign In {Ic.ArrowRight(ACC_FG)}</>}
              </button>

              <div style={{ height:1, background:BORDER, margin:"24px 0" }}/>

              {/* Bottom links */}
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {mode !== "company" && (
                  <div onClick={()=>{ setMode("company"); setError(""); }}
                    style={{ padding:"12px 16px", borderRadius:10, border:`1px solid ${BORDER}`, background:CARD, display:"flex", alignItems:"center", gap:10, cursor:"pointer", transition:"border-color 0.15s" }}
                    onMouseEnter={e=>(e.currentTarget.style.borderColor=ACC)}
                    onMouseLeave={e=>(e.currentTarget.style.borderColor=BORDER)}>
                    <div style={{ width:32, height:32, borderRadius:8, background:SUBTLE, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <span style={{ fontSize:9, fontWeight:800, color:MUTED, fontFamily:"'DM Sans',sans-serif" }}>CO</span>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:HEAD }}>Company Staff?</div>
                      <div style={{ fontSize:11, color:MUTED }}>Sign in with your company portal</div>
                    </div>
                    {Ic.ChevronRight(MUTED)}
                  </div>
                )}
                {mode === "company" && (
                  <div onClick={()=>router.push("/onboarding")}
                    style={{ padding:"12px 16px", borderRadius:10, border:`1px solid ${BORDER}`, background:CARD, display:"flex", alignItems:"center", gap:10, cursor:"pointer", transition:"border-color 0.15s" }}
                    onMouseEnter={e=>(e.currentTarget.style.borderColor=ACC)}
                    onMouseLeave={e=>(e.currentTarget.style.borderColor=BORDER)}>
                    <div style={{ width:32, height:32, borderRadius:8, background:SUBTLE, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke={MUTED} strokeWidth="2" strokeLinecap="round"/></svg>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:HEAD }}>New dealership?</div>
                      <div style={{ fontSize:11, color:MUTED }}>Create your company portal — free</div>
                    </div>
                    {Ic.ChevronRight(MUTED)}
                  </div>
                )}
              </div>

              {/* Demo credentials */}
              {mode === "admin" && (
                <div style={{ marginTop:16, padding:"12px 14px", borderRadius:9, background:SUBTLE, border:`1px solid ${BORDER}`, fontSize:11, color:MUTED, lineHeight:1.7 }}>
                  Demo: <strong style={{ color:HEAD }}>admin@elitedrivemotors.com</strong> / <strong style={{ color:HEAD }}>admin123</strong>
                </div>
              )}
              {mode === "customer" && (
                <div style={{ marginTop:16, padding:"12px 14px", borderRadius:9, background:SUBTLE, border:`1px solid ${BORDER}`, fontSize:11, color:MUTED, lineHeight:1.7 }}>
                  Demo: <strong style={{ color:HEAD }}>kwame@gmail.com</strong> / <strong style={{ color:HEAD }}>password123</strong>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
