"use client";
// src/app/onboarding/page.tsx

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@/src/context/ThemeContext";
import { useSaas } from "@/src/context/SaasContext";
import { PLANS, PlanTier } from "@/src/lib/saas-types";
import { Ic } from "@/src/components/ui/Icons";

const INDUSTRIES = [
  "Car Rental","Car Sales","Car Swap","Multi-Service Dealer",
  "Luxury Cars","Used Cars","Electric Vehicles","Fleet Management","Other",
];

const SIZES = [
  { label: "1–5 employees",    value: 5,   plan: "free"       as PlanTier },
  { label: "6–20 employees",   value: 20,  plan: "starter"    as PlanTier },
  { label: "21–100 employees", value: 100, plan: "pro"        as PlanTier },
  { label: "100+",             value: 999, plan: "enterprise" as PlanTier },
];

const STEPS = [
  { id: 1, label: "Company" },
  { id: 2, label: "Details" },
  { id: 3, label: "Account" },
  { id: 4, label: "Go Live"  },
];

export default function OnboardingPage() {
  return <Suspense><OnboardingInner /></Suspense>;
}

function OnboardingInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { dark } = useTheme();
  const { createCompany } = useSaas();

  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);

  // Step 1
  const [companyName, setCompanyName] = useState("");
  const [industry,    setIndustry]    = useState("");
  const [sizeIdx,     setSizeIdx]     = useState(0);

  // Pre-select plan from ?plan= query param (set by pricing section)
  useEffect(() => {
    const tier = searchParams.get("plan") as PlanTier | null;
    if (!tier) return;
    const idx = SIZES.findIndex(s => s.plan === tier);
    if (idx !== -1) setSizeIdx(idx);
  }, [searchParams]);
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>();
  const [logoBad,     setLogoBad]     = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Step 2
  const [address,      setAddress]      = useState("");
  const [phone,        setPhone]        = useState("");
  const [website,      setWebsite]      = useState("");
  const [primaryColor, setPrimaryColor] = useState(dark ? "#ffffff" : "#111111");

  // Step 3
  const [ownerName,    setOwnerName]    = useState("");
  const [ownerPw,      setOwnerPw]      = useState("");
  const [ownerPwConf,  setOwnerPwConf]  = useState("");
  const [showPw,       setShowPw]       = useState(false);

  const selectedSize = SIZES[sizeIdx];
  const plan = PLANS.find(p => p.tier === selectedSize.plan)!;

  // Theme tokens
  const ACC    = dark ? "#ffffff" : "#111111";
  const ACC_FG = dark ? "#000000" : "#ffffff";
  const BG     = dark ? "#0a0a0a" : "#f5f5f5";
  const CARD   = dark ? "#141414" : "#ffffff";
  const BORDER = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const MUTED  = dark ? "rgba(255,255,255,0.42)" : "#777";
  const HEAD   = dark ? "#ffffff" : "#0a0a0a";
  const SUBTLE = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";

  const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20) || "yourcompany";

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new window.Image();
      img.onload = () => {
        setLogoBad(img.width < 80 || img.height < 80);
        setLogoDataUrl(dataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  function validate(): boolean {
    setError("");
    if (step === 1) {
      if (!companyName.trim()) { setError("Please enter your company name."); return false; }
      if (!industry)           { setError("Please select your industry."); return false; }
      return true;
    }
    if (step === 3) {
      if (!ownerName.trim())       { setError("Please enter your full name."); return false; }
      if (ownerPw.length < 8)      { setError("Password must be at least 8 characters."); return false; }
      if (ownerPw !== ownerPwConf) { setError("Passwords do not match."); return false; }
      return true;
    }
    return true;
  }

  async function handleNext() {
    if (!validate()) return;
    if (step < 4) { setStep(s => s + 1); return; }
    setLoading(true); setError("");
    const result = await createCompany({
      name: companyName.trim(), industry,
      size: selectedSize.value, plan: selectedSize.plan,
      address: address || undefined, phone: phone || undefined,
      website: website || undefined, logoDataUrl, primaryColor,
      ownerName: ownerName.trim(), ownerPassword: ownerPw,
    });
    setLoading(false);
    if (result.ok) { setSuccess(true); }
    else { setError(result.error ?? "Something went wrong. Please try again."); setStep(1); }
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (success) {
    const emailPreview = `${ownerName.split(" ")[0].toLowerCase()}@${slug}.com`;
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700;9..40,800;9..40,900&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: ${BG}; font-family: 'DM Sans', sans-serif; }
          @keyframes checkIn { 0% { transform:scale(0) rotate(-180deg); opacity:0; } 80% { transform:scale(1.15) rotate(10deg); } 100% { transform:scale(1) rotate(0); opacity:1; } }
          @keyframes fadeUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        `}</style>
        <div style={{ minHeight:"100vh", background:BG, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px" }}>
          <div style={{ maxWidth:520, width:"100%", textAlign:"center" }}>

            <div style={{ width:80, height:80, borderRadius:"50%", background:`${ACC}12`, border:`2px solid ${ACC}25`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 28px", animation:"checkIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both" }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={ACC} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>

            <h1 style={{ fontSize:32, fontWeight:900, color:HEAD, marginBottom:12, animation:"fadeUp 0.5s 0.2s ease both" }}>
              Welcome to EliteDriveMotors
            </h1>
            <p style={{ fontSize:15, color:MUTED, lineHeight:1.75, marginBottom:32, animation:"fadeUp 0.5s 0.35s ease both" }}>
              Your company <strong style={{ color:HEAD }}>{companyName}</strong> is live. Save your login credentials.
            </p>

            <div style={{ background:CARD, borderRadius:16, border:`1px solid ${BORDER}`, padding:"28px 24px", marginBottom:28, textAlign:"left", animation:"fadeUp 0.5s 0.45s ease both" }}>
              <div style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:16 }}>Admin Credentials</div>
              {[
                { label:"Login URL", value:"/login" },
                { label:"Email",     value:emailPreview },
                { label:"Password",  value:"The one you just set" },
                { label:"Company",   value:companyName },
                { label:"Plan",      value:plan.name },
              ].map(row => (
                <div key={row.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${BORDER}` }}>
                  <span style={{ fontSize:13, color:MUTED }}>{row.label}</span>
                  <span style={{ fontSize:13, fontWeight:600, color:HEAD, fontFamily:"monospace" }}>{row.value}</span>
                </div>
              ))}
            </div>

            {plan.price === 0 && (
              <div style={{ background:SUBTLE, border:`1px solid ${BORDER}`, borderRadius:12, padding:"14px 18px", marginBottom:28, fontSize:13, color:MUTED, animation:"fadeUp 0.5s 0.55s ease both" }}>
                You're on the Free plan — up to 5 team members, forever free. Upgrade anytime from settings.
              </div>
            )}

            <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center", animation:"fadeUp 0.5s 0.6s ease both" }}>
              <button onClick={()=>router.push("/login")}
                style={{ flex:1, minWidth:160, padding:"13px 24px", borderRadius:10, border:"none", background:ACC, color:ACC_FG, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                Go to Portal
              </button>
              <button onClick={()=>router.push("/company/portal/admin")}
                style={{ flex:1, minWidth:160, padding:"13px 24px", borderRadius:10, border:`1px solid ${BORDER}`, background:"transparent", color:HEAD, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                Add Team Members
              </button>
            </div>

          </div>
        </div>
      </>
    );
  }

  // ── Wizard ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${BG}; font-family: 'DM Sans', sans-serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .step-card { animation: fadeUp 0.35s ease both; }
        input, select, textarea { outline:none; font-family: 'DM Sans', sans-serif; }
        input:focus, select:focus, textarea:focus { border-color:${ACC} !important; }
        input::placeholder, textarea::placeholder { color:${MUTED}; }
      `}</style>

      <div style={{ minHeight:"100vh", background:BG, display:"flex", flexDirection:"column" }}>

        {/* Top bar */}
        <div style={{ height:60, borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", padding:"0 clamp(16px,4vw,48px)", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }} onClick={()=>router.push("/")}>
            <div style={{ width:28, height:28, borderRadius:7, background:HEAD, display:"flex", alignItems:"center", justifyContent:"center" }}>
              {Ic.CarLogo(dark?"#000":"#fff")}
            </div>
            <span style={{ fontSize:12, fontWeight:800, color:HEAD, letterSpacing:2 }}>ELITE DRIVE</span>
          </div>
          <div style={{ flex:1 }}/>
          <span style={{ fontSize:12, color:MUTED }}>Setting up your dealership</span>
        </div>

        {/* Progress stepper */}
        <div style={{ padding:"28px clamp(16px,4vw,48px) 0" }}>
          <div style={{ maxWidth:700, margin:"0 auto", display:"flex", alignItems:"center" }}>
            {STEPS.map((s, i) => {
              const done   = step > s.id;
              const active = step === s.id;
              const isLast = i === STEPS.length - 1;
              return (
                <div key={s.id} style={{ display:"flex", alignItems:"center", flex: isLast ? "none" : 1 }}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                    <div style={{
                      width:38, height:38, borderRadius:"50%",
                      background: done || active ? ACC : SUBTLE,
                      border: done || active ? "none" : `2px solid ${BORDER}`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      transition:"all 0.25s",
                    }}>
                      {done
                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={ACC_FG} strokeWidth="2.5" strokeLinecap="round"/></svg>
                        : <span style={{ fontSize:11, fontWeight:800, color: active ? ACC_FG : MUTED, fontFamily:"monospace" }}>{String(s.id).padStart(2,"0")}</span>
                      }
                    </div>
                    <span style={{ fontSize:10, fontWeight:700, color: active||done ? HEAD : MUTED, letterSpacing:0.5, whiteSpace:"nowrap" }}>{s.label}</span>
                  </div>
                  {!isLast && (
                    <div style={{ flex:1, height:2, background: done ? ACC : BORDER, transition:"background 0.3s", margin:"0 8px", marginBottom:20 }}/>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step content */}
        <div style={{ flex:1, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"32px clamp(16px,4vw,48px) 48px" }}>
          <div className="step-card" key={step} style={{ maxWidth:600, width:"100%" }}>

            {/* STEP 1 — Company basics */}
            {step === 1 && (
              <div>
                <h2 style={{ fontSize:26, fontWeight:900, color:HEAD, marginBottom:8 }}>Tell us about your company</h2>
                <p style={{ fontSize:14, color:MUTED, marginBottom:32, lineHeight:1.7 }}>
                  This creates your branded portal on EliteDriveMotors. Your company name becomes your team's email domain.
                </p>

                {/* Logo upload */}
                <div style={{ marginBottom:24 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Company Logo</div>
                  <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                    <div
                      onClick={()=>fileRef.current?.click()}
                      style={{ width:72, height:72, borderRadius:16, border:`2px dashed ${logoBad?"#ef4444":BORDER}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", overflow:"hidden", background: logoDataUrl ? "transparent" : SUBTLE, transition:"border-color 0.2s, transform 0.15s" }}
                      onMouseEnter={e=>(e.currentTarget.style.transform="scale(1.04)")}
                      onMouseLeave={e=>(e.currentTarget.style.transform="scale(1)")}>
                      {logoDataUrl
                        ? <img src={logoDataUrl} alt="logo" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                        : <>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span style={{ fontSize:9, color:MUTED, marginTop:4 }}>Upload</span>
                          </>
                      }
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display:"none" }}/>
                    <div>
                      <div style={{ fontSize:13, color:HEAD, fontWeight:600, marginBottom:4 }}>{logoDataUrl ? "Logo uploaded" : "Upload your logo"}</div>
                      <div style={{ fontSize:11, color:MUTED, lineHeight:1.6 }}>PNG or JPG, minimum 80×80px for best clarity</div>
                      {logoBad && (
                        <div style={{ fontSize:11, color:"#ef4444", marginTop:4, display:"flex", alignItems:"center", gap:4 }}>
                          {Ic.Alert("#ef4444")} Image is small — it may appear blurry. Use a higher resolution.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Field label="Company Name" required>
                  <input value={companyName} onChange={e=>setCompanyName(e.target.value)} placeholder="e.g. Prestige Auto Gh"
                    style={inputStyle(BORDER, CARD, HEAD)}/>
                  {companyName && (
                    <div style={{ fontSize:11, color:MUTED, marginTop:6 }}>
                      Your team will log in as: <strong style={{ color:HEAD }}>{`name@${slug}.com`}</strong>
                    </div>
                  )}
                </Field>

                <Field label="Industry" required>
                  <select value={industry} onChange={e=>setIndustry(e.target.value)} style={{ ...inputStyle(BORDER, CARD, HEAD), color: industry ? HEAD : MUTED }}>
                    <option value="" disabled>Select your industry</option>
                    {INDUSTRIES.map(i=><option key={i} value={i} style={{ color:"#000" }}>{i}</option>)}
                  </select>
                </Field>

                <Field label="Team Size">
                  <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                    {SIZES.map((s, i) => (
                      <button key={s.label} onClick={()=>setSizeIdx(i)}
                        style={{ padding:"10px 16px", borderRadius:9, border:`1.5px solid ${sizeIdx===i?ACC:BORDER}`, background: sizeIdx===i?`${ACC}12`:"transparent", color: sizeIdx===i?ACC:MUTED, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s" }}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                  <div style={{ marginTop:10, fontSize:12, color:MUTED }}>
                    Selected plan: <strong style={{ color: selectedSize.plan==="free" ? "#10B981" : HEAD }}>{plan.name}</strong>
                    {selectedSize.plan === "free" && " — Free forever for your first 5 team members"}
                  </div>
                </Field>
              </div>
            )}

            {/* STEP 2 — Details */}
            {step === 2 && (
              <div>
                <h2 style={{ fontSize:26, fontWeight:900, color:HEAD, marginBottom:8 }}>Company details</h2>
                <p style={{ fontSize:14, color:MUTED, marginBottom:32, lineHeight:1.7 }}>
                  Optional — helps customers find and trust your dealership. You can fill this in later from settings.
                </p>
                <Field label="Business Address">
                  <input value={address} onChange={e=>setAddress(e.target.value)} placeholder="e.g. East Legon, Accra" style={inputStyle(BORDER, CARD, HEAD)}/>
                </Field>
                <Field label="Business Phone">
                  <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+233 20 000 0000" style={inputStyle(BORDER, CARD, HEAD)}/>
                </Field>
                <Field label="Website">
                  <input value={website} onChange={e=>setWebsite(e.target.value)} placeholder="https://yourcompany.com" style={inputStyle(BORDER, CARD, HEAD)}/>
                </Field>
                <Field label="Brand Color">
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <input type="color" value={primaryColor} onChange={e=>setPrimaryColor(e.target.value)}
                      style={{ width:44, height:44, borderRadius:9, border:`1px solid ${BORDER}`, cursor:"pointer", padding:4, background:CARD }}/>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:HEAD }}>{primaryColor}</div>
                      <div style={{ fontSize:11, color:MUTED }}>Used as your portal's accent color</div>
                    </div>
                  </div>
                </Field>
              </div>
            )}

            {/* STEP 3 — Admin account */}
            {step === 3 && (
              <div>
                <h2 style={{ fontSize:26, fontWeight:900, color:HEAD, marginBottom:8 }}>Create your admin account</h2>
                <p style={{ fontSize:14, color:MUTED, marginBottom:12, lineHeight:1.7 }}>
                  This is the owner account for <strong style={{ color:HEAD }}>{companyName}</strong>. Your email will be:
                </p>
                <div style={{ background:SUBTLE, border:`1px solid ${BORDER}`, borderRadius:10, padding:"12px 16px", marginBottom:28, fontSize:13, fontFamily:"monospace", color:HEAD }}>
                  {`${ownerName ? ownerName.split(" ")[0].toLowerCase() : "yourname"}@${slug}.com`}
                </div>

                <Field label="Your Full Name" required>
                  <input value={ownerName} onChange={e=>setOwnerName(e.target.value)} placeholder="e.g. Kwame Asante" style={inputStyle(BORDER, CARD, HEAD)}/>
                </Field>
                <Field label="Password" required>
                  <div style={{ position:"relative" }}>
                    <input type={showPw?"text":"password"} value={ownerPw} onChange={e=>setOwnerPw(e.target.value)} placeholder="Min. 8 characters"
                      style={{ ...inputStyle(BORDER, CARD, HEAD), paddingRight:44 }}/>
                    <button type="button" onClick={()=>setShowPw(s=>!s)}
                      style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", color:MUTED }}>
                      {showPw ? Ic.EyeOff(MUTED) : Ic.Eye(MUTED)}
                    </button>
                  </div>
                </Field>
                <Field label="Confirm Password" required>
                  <input type={showPw?"text":"password"} value={ownerPwConf} onChange={e=>setOwnerPwConf(e.target.value)} placeholder="Re-enter password"
                    style={{ ...inputStyle(BORDER, CARD, HEAD), borderColor: ownerPwConf && ownerPw !== ownerPwConf ? "#ef4444" : BORDER }}/>
                  {ownerPwConf && ownerPw !== ownerPwConf && <div style={{ fontSize:11, color:"#ef4444", marginTop:5 }}>Passwords do not match</div>}
                </Field>
              </div>
            )}

            {/* STEP 4 — Review & Go Live */}
            {step === 4 && (
              <div>
                <h2 style={{ fontSize:26, fontWeight:900, color:HEAD, marginBottom:8 }}>Review & Go Live</h2>
                <p style={{ fontSize:14, color:MUTED, marginBottom:28, lineHeight:1.7 }}>Everything looks good? Hit <strong style={{ color:HEAD }}>Create Company</strong> to launch your portal.</p>

                <div style={{ background:CARD, borderRadius:16, border:`1px solid ${BORDER}`, padding:"24px", marginBottom:28 }}>
                  {logoDataUrl && (
                    <img src={logoDataUrl} alt="logo" style={{ width:60, height:60, borderRadius:12, objectFit:"cover", marginBottom:16, border:`1px solid ${BORDER}` }}/>
                  )}
                  <div style={{ fontSize:20, fontWeight:800, color:HEAD, marginBottom:4 }}>{companyName}</div>
                  <div style={{ fontSize:13, color:MUTED, marginBottom:16 }}>{industry} · {selectedSize.label}</div>
                  {[
                    { label:"Email domain", value:`name@${slug}.com` },
                    { label:"Admin email",  value:`${ownerName.split(" ")[0].toLowerCase() || "you"}@${slug}.com` },
                    { label:"Plan",         value:plan.name + (plan.price===0?" (Free)":` — GHS ${plan.price}/mo`) },
                    ...(address ? [{ label:"Address", value:address }] : []),
                    ...(phone   ? [{ label:"Phone",   value:phone   }] : []),
                  ].map(row => (
                    <div key={row.label} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${BORDER}`, fontSize:13 }}>
                      <span style={{ color:MUTED }}>{row.label}</span>
                      <span style={{ fontWeight:600, color:HEAD, fontFamily:"monospace", fontSize:12 }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background:SUBTLE, border:`1px solid ${BORDER}`, borderRadius:10, padding:"12px 16px", fontSize:13, color:MUTED, lineHeight:1.6, marginBottom:28 }}>
                  After creating your company you can invite your team, add your first cars, and start accepting bookings immediately.
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:9, padding:"10px 14px", fontSize:12, color:"#ef4444", marginTop:16, display:"flex", alignItems:"center", gap:8 }}>
                {Ic.Alert("#ef4444")} {error}
              </div>
            )}

            {/* Navigation */}
            <div style={{ display:"flex", gap:12, marginTop:32 }}>
              {step > 1 && (
                <button onClick={()=>setStep(s=>s-1)}
                  style={{ padding:"12px 24px", borderRadius:10, border:`1px solid ${BORDER}`, background:"transparent", color:HEAD, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                  Back
                </button>
              )}
              <button onClick={handleNext} disabled={loading}
                style={{ flex:1, padding:"13px 24px", borderRadius:10, border:"none", background: loading ? `${ACC}60` : ACC, color:ACC_FG, fontSize:14, fontWeight:700, cursor:loading?"not-allowed":"pointer", fontFamily:"'DM Sans',sans-serif", transition:"opacity 0.15s", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                {loading
                  ? <>{Ic.Spinner(ACC_FG)} Creating your company…</>
                  : step === 4 ? "Create My Company" : `Continue to ${STEPS[step]?.label ?? "Finish"}`}
              </button>
            </div>

            {step < 4 && (
              <div style={{ textAlign:"center", marginTop:16 }}>
                <span onClick={()=>setStep(4)} style={{ fontSize:12, color:MUTED, cursor:"pointer", textDecoration:"underline" }}>
                  Skip to review
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Field({ label, required, children }: { label:string; required?:boolean; children:React.ReactNode }) {
  const { dark } = useTheme();
  const MUTED = dark ? "rgba(255,255,255,0.42)" : "#777";
  return (
    <div style={{ marginBottom:20 }}>
      <label style={{ display:"block", fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>
        {label}{required && <span style={{ color:"#ef4444", marginLeft:2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function inputStyle(BORDER:string, CARD:string, HEAD:string): React.CSSProperties {
  return {
    width:"100%", padding:"11px 14px", borderRadius:10,
    border:`1.5px solid ${BORDER}`, background:CARD, color:HEAD,
    fontSize:13, fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box" as const,
    transition:"border-color 0.15s",
  };
}
