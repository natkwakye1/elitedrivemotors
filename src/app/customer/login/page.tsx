"use client";
// src/app/customer/login/page.tsx

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Ic } from "@/src/components/ui/Icons";
import { useCustomerAuth, MOCK_CUSTOMERS } from "@/src/context/Customerauthcontext";
import { useTheme } from "@/src/context/ThemeContext";

export default function CustomerLoginPage() {
  const router = useRouter();
  const { login } = useCustomerAuth();
  const { dark, setDark, t } = useTheme();
  const panelBg = dark ? "#0a0a0a" : "#111111";

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleLogin = async () => {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) router.push(result.redirect ?? "/customer/dashboard");
    else setError(result.error ?? "Login failed.");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${t.bg}; font-family: 'DM Sans', sans-serif; }
        input::placeholder { color: ${t.inputText}; }
      `}</style>

      <div style={{ display:"flex", height:"100vh", fontFamily:"'DM Sans',sans-serif", overflow:"hidden" }}>

        {/* ── LEFT dark panel ── */}
        <div style={{ width:"44%", flexShrink:0, background:panelBg, display: isMobile ? "none" : "flex", flexDirection:"column", position:"relative", overflow:"hidden" }}>

          {/* dot grid */}
          <div style={{ position:"absolute", inset:0, opacity:0.04, pointerEvents:"none", zIndex:0 }}>
            <svg width="100%" height="100%">
              <defs><pattern id="dots" width="50" height="50" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1.5" fill="white"/></pattern></defs>
              <rect width="100%" height="100%" fill="url(#dots)"/>
            </svg>
          </div>

          {/* bottom vignette */}
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"38%", background:`linear-gradient(to top, ${panelBg} 0%, transparent 100%)`, pointerEvents:"none", zIndex:2 }}/>

          {/* car image */}
          <div style={{ position:"absolute", bottom:"6%", left:"-8%", width:"116%", height:"58%", zIndex:1, pointerEvents:"none" }}>
            <div style={{ position:"absolute", bottom:0, left:"10%", right:"10%", height:"18%", background:"radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.07) 0%, transparent 70%)" }}/>
            <Image
              src="/images/cars/blackbenz.png"
              alt="Elite Drive Motors"
              fill sizes="50vw"
              style={{ objectFit:"contain", objectPosition:"center bottom", filter:"drop-shadow(0 24px 50px rgba(0,0,0,0.85)) brightness(0.95) contrast(1.08) saturate(1.1)" }}
              priority
            />
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

          {/* Hero copy */}
          <div style={{ padding:"28px 40px 0", position:"relative", zIndex:3 }}>
            <div style={{ fontSize:36, fontWeight:800, color:"#fff", lineHeight:1.18, marginBottom:12 }}>Your cars,<br/>your account.</div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.48)", lineHeight:1.75, maxWidth:280, marginBottom:22 }}>
              Sign in to manage your rentals, purchases, swap requests and bookings — all in one place.
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {[
                { label:"Rentals",   icon: Ic.Rentals  },
                { label:"Purchases", icon: Ic.Buy      },
                { label:"Bookings",  icon: Ic.Booking  },
                { label:"Swaps",     icon: Ic.Swap     },
              ].map(f => (
                <span key={f.label} style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:20, padding:"5px 12px", fontSize:11.5, color:"rgba(255,255,255,0.6)", display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ display:"flex", opacity:0.7 }}>{f.icon("rgba(255,255,255,0.6)")}</span>
                  {f.label}
                </span>
              ))}
            </div>
          </div>

          <div style={{ flex:1 }}/>

          <div style={{ padding:"20px 40px 32px", position:"relative", zIndex:3, borderTop:"1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>Use the Quick Login shortcuts on the right to demo the app.</div>
          </div>
        </div>

        {/* ── RIGHT form panel ── */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

          {/* top strip — exact match admin */}
          <div style={{ height:52, flexShrink:0, borderBottom:`1px solid ${t.border}`, background:t.cardBg, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px" }}>
            <span style={{ fontSize:12, color:t.textMuted }}>Customer Portal</span>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>router.push("/auth/login")} style={{ fontSize:12, fontWeight:600, color:t.textSec, background:"none", border:`1px solid ${t.border}`, borderRadius:7, padding:"5px 12px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                Admin Login
              </button>
              <button onClick={()=>setDark(!dark)} style={{ width:34, height:34, borderRadius:8, border:`1px solid ${t.border}`, background:t.bg, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                {dark ? Ic.Sun(t.textMuted) : Ic.Moon(t.textMuted)}
              </button>
            </div>
          </div>

          {/* form — exact match admin layout */}
          <div style={{ flex:1, overflowY:"auto", display:"flex", alignItems:"center", justifyContent:"center", padding:"40px" }}>
            <div style={{ width:"100%", maxWidth:400 }}>

              {/* Heading */}
              <div style={{ marginBottom:28 }}>
                <div style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:10, fontWeight:700, letterSpacing:1, background:t.accent+"12", color:t.accent, border:`1px solid ${t.accent}25`, borderRadius:20, padding:"4px 12px", marginBottom:12 }}>
                  {Ic.Rentals(t.accent)} CUSTOMER LOGIN
                </div>
                <h1 style={{ fontSize:24, fontWeight:800, color:t.textPri, marginBottom:5 }}>Welcome back</h1>
                <p style={{ fontSize:13, color:t.textMuted }}>Sign in to your EliteDriveMotors account</p>
              </div>

              {/* Error */}
              {error && (
                <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:8, padding:"10px 14px", fontSize:12, color:"#EF4444", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
                  {Ic.Alert("#EF4444")} {error}
                </div>
              )}

              {/* Email — no left icon, matches admin Input component */}
              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontSize:11, fontWeight:600, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:7, fontFamily:"'DM Sans',sans-serif" }}>Email</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  onKeyDown={e=>e.key==="Enter" && handleLogin()}
                  style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1.5px solid ${t.border}`, background:t.inputBg, color:t.textPri, fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box", transition:"border-color 0.15s" }}
                  onFocus={e=>(e.target.style.borderColor=t.accent)}
                  onBlur={e=>(e.target.style.borderColor=t.border)}
                />
              </div>

              {/* Password — no left icon, eye toggle on right, matches admin */}
              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontSize:11, fontWeight:600, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:7, fontFamily:"'DM Sans',sans-serif" }}>Password</label>
                <div style={{ position:"relative" }}>
                  <input type={showPw?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)}
                    placeholder="••••••••"
                    onKeyDown={e=>e.key==="Enter" && handleLogin()}
                    style={{ width:"100%", padding:"11px 44px 11px 14px", borderRadius:10, border:`1.5px solid ${t.border}`, background:t.inputBg, color:t.textPri, fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box", transition:"border-color 0.15s" }}
                    onFocus={e=>(e.target.style.borderColor=t.accent)}
                    onBlur={e=>(e.target.style.borderColor=t.border)}
                  />
                  <button type="button" onClick={()=>setShowPw(s=>!s)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", padding:0 }}>
                    {showPw ? Ic.EyeOff(t.textMuted) : Ic.Eye(t.textMuted)}
                  </button>
                </div>
              </div>

              {/* Forgot password — right-aligned below input, matches admin */}
              <div style={{ textAlign:"right", marginBottom:22, marginTop:-6 }}>
                <span onClick={()=>router.push("/auth/forgot-password")} style={{ fontSize:12, color:t.accent, fontWeight:600, cursor:"pointer" }}>Forgot password?</span>
              </div>

              {/* Submit */}
              <button onClick={handleLogin} disabled={loading}
                style={{ width:"100%", padding:"12px 0", borderRadius:10, border:"none", background:t.accent, color: dark ? "#000000" : "#ffffff", fontSize:14, fontWeight:700, cursor:loading?"not-allowed":"pointer", fontFamily:"'DM Sans',sans-serif", opacity:loading?0.75:1, transition:"opacity 0.2s", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                {loading
                  ? <>{Ic.Spinner(dark ? "#000" : "#fff")} Signing in…</>
                  : <>Sign In {Ic.ArrowRight(dark ? "#000" : "#fff")}</>}
              </button>

              {/* Divider — matches admin */}
              <div style={{ height:1, background:t.divider, margin:"24px 0" }}/>

              {/* Register card — matches "Not an admin?" card */}
              <div onClick={()=>router.push("/auth/register")}
                style={{ padding:"12px 16px", borderRadius:10, border:`1px solid ${t.border}`, background:t.cardBg, display:"flex", alignItems:"center", gap:10, cursor:"pointer", transition:"border-color 0.15s" }}
                onMouseEnter={e=>((e.currentTarget as HTMLDivElement).style.borderColor=t.accent)}
                onMouseLeave={e=>((e.currentTarget as HTMLDivElement).style.borderColor=t.border)}>
                <span style={{ display:"flex", opacity:0.6 }}>{Ic.ChevronRight(t.textMuted)}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:t.textPri }}>New here?</div>
                  <div style={{ fontSize:11, color:t.textMuted, marginTop:1 }}>Create a free account</div>
                </div>
                {Ic.ChevronRight(t.textMuted)}
              </div>

              {/* Quick login — demo customers */}
              <div style={{ marginTop:24 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                  <div style={{ flex:1, height:1, background:t.divider }}/>
                  <span style={{ fontSize:10, fontWeight:600, color:t.textMuted, letterSpacing:0.8, textTransform:"uppercase" }}>Quick Login</span>
                  <div style={{ flex:1, height:1, background:t.divider }}/>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {MOCK_CUSTOMERS.map(c => (
                    <button
                      key={c.id}
                      onClick={async () => {
                        setEmail(c.email);
                        setPassword("password123");
                        setError("");
                        setLoading(true);
                        const result = await login(c.email, "password123");
                        setLoading(false);
                        if (result.ok) router.push(result.redirect ?? "/customer/dashboard");
                        else setError(result.error ?? "Login failed.");
                      }}
                      style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", borderRadius:10, border:`1px solid ${t.border}`, background:t.cardBg, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s", textAlign:"left" }}
                      onMouseEnter={e=>{ (e.currentTarget as HTMLButtonElement).style.borderColor = t.accent; (e.currentTarget as HTMLButtonElement).style.background = t.accent+"0A"; }}
                      onMouseLeave={e=>{ (e.currentTarget as HTMLButtonElement).style.borderColor = t.border; (e.currentTarget as HTMLButtonElement).style.background = t.cardBg; }}
                    >
                      {/* Avatar */}
                      <div style={{ width:36, height:36, borderRadius:"50%", background:t.accent, color:t.accentFg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, flexShrink:0 }}>
                        {c.avatar}
                      </div>
                      {/* Info */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:t.textPri, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.name}</div>
                        <div style={{ fontSize:11, color:t.textMuted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.email}</div>
                      </div>
                      {/* Plan badge */}
                      <span style={{ fontSize:9, fontWeight:700, color:t.accent, background:t.accent+"18", border:`1px solid ${t.accent}30`, borderRadius:10, padding:"2px 8px", flexShrink:0 }}>{c.plan}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}