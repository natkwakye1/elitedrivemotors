"use client";
// src/app/dealers/page.tsx
// Public dealership directory — every registered dealership on EliteDriveMotors platform.

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/src/context/ThemeContext";
import { SAAS_STORAGE } from "@/src/lib/saas-types";
import type { Company } from "@/src/lib/saas-types";
import { Ic } from "@/src/components/ui/Icons";

const MOCK_DEALERS: Company[] = [
  { id:"DEMO-1", name:"Prestige Auto Gh",  slug:"prestigeautogh",  industry:"Car Sales",    size:20,  plan:"starter",    ownerId:"", createdAt:"", onboardingComplete:true, address:"East Legon, Accra",    phone:"+233 20 111 0001" },
  { id:"DEMO-2", name:"AO Motors",         slug:"aomotors",        industry:"Car Rental",   size:10,  plan:"free",       ownerId:"", createdAt:"", onboardingComplete:true, address:"Adum, Kumasi",          phone:"+233 20 111 0002" },
  { id:"DEMO-3", name:"DriveHub GH",       slug:"drivehubgh",      industry:"Multi-Service Dealer", size:50, plan:"pro", ownerId:"", createdAt:"", onboardingComplete:true, address:"Tema, Greater Accra",  phone:"+233 20 111 0003" },
  { id:"DEMO-4", name:"Volta Wheels",      slug:"voltawheels",     industry:"Used Cars",    size:8,   plan:"free",       ownerId:"", createdAt:"", onboardingComplete:true, address:"Ho, Volta Region",      phone:"+233 20 111 0004" },
  { id:"DEMO-5", name:"Cape Rides",        slug:"caperides",       industry:"Car Rental",   size:12,  plan:"starter",    ownerId:"", createdAt:"", onboardingComplete:true, address:"Cape Coast, CR",        phone:"+233 20 111 0005" },
  { id:"DEMO-6", name:"Takoradi Motors",   slug:"takoradimotors",  industry:"Car Sales",    size:25,  plan:"pro",        ownerId:"", createdAt:"", onboardingComplete:true, address:"Takoradi, WR",          phone:"+233 20 111 0006" },
  { id:"DEMO-7", name:"Luxury Drive GH",   slug:"luxurydrivergh",  industry:"Luxury Cars",  size:15,  plan:"starter",    ownerId:"", createdAt:"", onboardingComplete:true, address:"Airport Res, Accra",    phone:"+233 20 111 0007" },
  { id:"DEMO-8", name:"SwapZone Motors",   slug:"swapzonemotors",  industry:"Car Swap",     size:9,   plan:"free",       ownerId:"", createdAt:"", onboardingComplete:true, address:"Spintex, Accra",        phone:"+233 20 111 0008" },
];

const INDUSTRIES = ["All", "Car Sales", "Car Rental", "Car Swap", "Luxury Cars", "Used Cars", "Multi-Service Dealer", "Electric Vehicles", "Fleet Management"];

function initials(name:string) { return name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2); }

function RevealDiv({ children, delay=0 }: { children:React.ReactNode; delay?:number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.style.opacity="1"; el.style.transform="translateY(0)"; obs.disconnect(); }
    }, { threshold:0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity:0, transform:"translateY(20px)", transition:`opacity 0.5s ${delay}ms ease, transform 0.5s ${delay}ms ease` }}>
      {children}
    </div>
  );
}

export default function DealersPage() {
  const router = useRouter();
  const { dark, setDark } = useTheme();
  const [query,    setQuery]    = useState("");
  const [industry, setIndustry] = useState("All");
  const [lsDealers, setLsDealers] = useState<Company[]>([]);

  // Load real registered companies from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAAS_STORAGE.companies);
      if (raw) setLsDealers(JSON.parse(raw));
    } catch {}
  }, []);

  const ACC    = dark ? "#ffffff" : "#111111";
  const ACC_FG = dark ? "#000000" : "#ffffff";
  const BG     = dark ? "#0a0a0a" : "#f5f5f5";
  const CARD   = dark ? "#141414" : "#ffffff";
  const BORDER = dark ? "rgba(255,255,255,0.08)" : "#e8e8e8";
  const MUTED  = dark ? "rgba(255,255,255,0.42)" : "#888888";
  const HEAD   = dark ? "#f0f0f0" : "#111111";
  const SUBTLE = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";
  const NAVBG  = dark ? "rgba(10,10,10,0.95)" : "rgba(250,250,250,0.95)";

  // Merge mock + real, dedupe by slug
  const allDealers = [...lsDealers, ...MOCK_DEALERS.filter(m => !lsDealers.some(l => l.slug === m.slug))];

  const filtered = allDealers.filter(d => {
    const q = query.toLowerCase();
    const matchQ = !q || d.name.toLowerCase().includes(q) || d.industry.toLowerCase().includes(q) || (d.address ?? "").toLowerCase().includes(q);
    const matchI = industry === "All" || d.industry === industry;
    return matchQ && matchI;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,600;9..40,700;9..40,800;9..40,900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{background:${BG};font-family:'DM Sans',sans-serif;color:${HEAD}}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:${dark?"rgba(255,255,255,0.12)":"#ddd"};border-radius:4px}
        input::placeholder{color:${MUTED}}
        input{outline:none;font-family:'DM Sans',sans-serif}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .hero-in{animation:fadeUp 0.65s ease both}
        .hero-in2{animation:fadeUp 0.65s 0.12s ease both}
        .hero-in3{animation:fadeUp 0.65s 0.24s ease both}
        .d-card{transition:border-color 0.2s,transform 0.2s,box-shadow 0.2s;cursor:pointer}
        .d-card:hover{border-color:${ACC}!important;transform:translateY(-4px);box-shadow:0 10px 32px rgba(0,0,0,0.1)}
        .pill{transition:all 0.15s;cursor:pointer}
        .pill:hover{border-color:${ACC}!important;color:${HEAD}!important}
      `}</style>

      {/* Navbar */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:50, height:60, background:NAVBG, backdropFilter:"blur(16px)", borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", padding:"0 clamp(16px,4vw,56px)", gap:16 }}>
        <div onClick={()=>router.push("/")} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
          <div style={{ width:28, height:28, borderRadius:7, background:ACC, display:"flex", alignItems:"center", justifyContent:"center" }}>
            {Ic.CarLogo(ACC_FG)}
          </div>
          <span style={{ fontSize:12, fontWeight:800, color:HEAD, letterSpacing:2 }}>ELITE DRIVE</span>
        </div>
        <div style={{ flex:1 }}/>
        <button onClick={()=>router.push("/login")} style={{ padding:"7px 16px", borderRadius:8, border:`1px solid ${BORDER}`, background:"transparent", color:MUTED, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Sign In</button>
        <button onClick={()=>router.push("/onboarding")} style={{ padding:"7px 16px", borderRadius:8, border:"none", background:ACC, color:ACC_FG, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>List Your Dealership</button>
        <button onClick={()=>setDark(!dark)} style={{ width:34, height:34, borderRadius:8, border:`1px solid ${BORDER}`, background:SUBTLE, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
          {dark?Ic.Sun(MUTED):Ic.Moon(MUTED)}
        </button>
      </nav>

      <div style={{ paddingTop:60 }}>

        {/* Hero */}
        <div style={{ padding:"56px clamp(16px,5vw,80px) 40px", borderBottom:`1px solid ${BORDER}` }}>
          <div style={{ maxWidth:700 }}>
            <div className="hero-in" style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:2, textTransform:"uppercase", marginBottom:14 }}>
              {allDealers.length} dealerships on platform
            </div>
            <h1 className="hero-in2" style={{ fontSize:"clamp(32px,5vw,52px)", fontWeight:900, color:HEAD, lineHeight:1.12, marginBottom:16 }}>
              Browse every dealership<br/>on EliteDriveMotors
            </h1>
            <p className="hero-in3" style={{ fontSize:15, color:MUTED, lineHeight:1.75, maxWidth:500, marginBottom:28 }}>
              Rent, buy or swap — explore cars from every dealership on our platform. All verified, all in one place.
            </p>

            {/* Search */}
            <div className="hero-in3" style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              <div style={{ position:"relative", flex:1, minWidth:220 }}>
                <div style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }}>
                  {Ic.Search(MUTED)}
                </div>
                <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search dealerships…"
                  style={{ width:"100%", padding:"11px 14px 11px 38px", borderRadius:10, border:`1.5px solid ${BORDER}`, background:CARD, color:HEAD, fontSize:13, boxSizing:"border-box" as const }}
                  onFocus={e=>(e.target.style.borderColor=ACC)}
                  onBlur={e=>(e.target.style.borderColor=BORDER)}/>
              </div>
            </div>
          </div>
        </div>

        {/* Industry filter pills */}
        <div style={{ padding:"16px clamp(16px,5vw,80px)", borderBottom:`1px solid ${BORDER}`, overflowX:"auto", display:"flex", gap:8, flexWrap:"nowrap" }}>
          {INDUSTRIES.map(ind => (
            <button key={ind} className="pill" onClick={()=>setIndustry(ind)}
              style={{ padding:"6px 14px", borderRadius:20, border:`1px solid ${industry===ind?ACC:BORDER}`, background:industry===ind?`${ACC}10`:SUBTLE, color:industry===ind?ACC:MUTED, fontSize:12, fontWeight:industry===ind?700:500, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" as const, flexShrink:0 }}>
              {ind}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ padding:"36px clamp(16px,5vw,80px) 60px" }}>
          <div style={{ fontSize:12, color:MUTED, marginBottom:22 }}>{filtered.length} dealership{filtered.length!==1?"s":""} found</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:18 }}>
            {filtered.map((d, i) => (
              <RevealDiv key={d.id} delay={i * 40}>
                <div className="d-card" onClick={()=>router.push(`/dealers/${d.slug}`)}
                  style={{ background:CARD, borderRadius:16, border:`1px solid ${BORDER}`, padding:"22px 24px", height:"100%", display:"flex", flexDirection:"column", gap:16 }}>

                  {/* Header */}
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <div style={{ width:48, height:48, borderRadius:12, background: (d as any).logoDataUrl ? "transparent" : ACC, overflow:"hidden", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {(d as any).logoDataUrl
                        ? <img src={(d as any).logoDataUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                        : <span style={{ fontSize:14, fontWeight:800, color:ACC_FG }}>{initials(d.name)}</span>}
                    </div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:14, fontWeight:800, color:HEAD, whiteSpace:"nowrap" as const, overflow:"hidden", textOverflow:"ellipsis" }}>{d.name}</div>
                      <div style={{ fontSize:11, color:MUTED }}>{d.industry}</div>
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {d.address && (
                      <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:MUTED }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.6"/></svg>
                        {d.address}
                      </div>
                    )}
                    {d.phone && (
                      <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:MUTED }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                        {d.phone}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div style={{ marginTop:"auto", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <span style={{ fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:20, background:SUBTLE, color:MUTED, border:`1px solid ${BORDER}`, textTransform:"uppercase" as const, letterSpacing:0.5 }}>
                      {d.plan === "free" ? "Free" : d.plan}
                    </span>
                    <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:ACC, fontWeight:700 }}>
                      View Cars
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                </div>
              </RevealDiv>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ padding:"80px 0", textAlign:"center", color:MUTED }}>
              <div style={{ fontSize:32, marginBottom:12 }}>—</div>
              <div style={{ fontSize:14, fontWeight:600, color:HEAD, marginBottom:8 }}>No dealerships found</div>
              <div style={{ fontSize:13, color:MUTED }}>Try a different search or filter</div>
            </div>
          )}

          {/* CTA */}
          <div style={{ marginTop:60, padding:"40px", background:CARD, borderRadius:20, border:`1px solid ${BORDER}`, textAlign:"center" }}>
            <RevealDiv>
              <div style={{ fontSize:22, fontWeight:900, color:HEAD, marginBottom:10 }}>Own a dealership?</div>
              <div style={{ fontSize:14, color:MUTED, marginBottom:24 }}>Join EliteDriveMotors — list your cars, manage your team, accept payments. Free to start.</div>
              <button onClick={()=>router.push("/onboarding")}
                style={{ padding:"12px 32px", borderRadius:10, border:"none", background:ACC, color:ACC_FG, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                Get Started — Free
              </button>
            </RevealDiv>
          </div>
        </div>
      </div>
    </>
  );
}
