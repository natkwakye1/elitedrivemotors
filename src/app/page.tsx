"use client";
// src/app/page.tsx — Elite Drive Motors SaaS Landing Page

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Ic } from "@/src/components/ui/Icons";
import { CARS } from "@/src/lib/data/cars";
import { useTheme } from "@/src/context/ThemeContext";
import { PLANS } from "@/src/lib/saas-types";

const SERVICES = [
  { icon: (c:string) => Ic.Rentals(c),  title:"Rent a Car",    desc:"Flexible daily, weekly or monthly rentals. Pick up anywhere in Accra.",                cta:"Browse Rentals", href:"/customer/rent-car"  },
  { icon: (c:string) => Ic.Buy(c),      title:"Buy a Car",     desc:"Certified pre-owned and brand-new vehicles. Full inspection, warranty included.",      cta:"Cars for Sale",  href:"/customer/buy-car"   },
  { icon: (c:string) => Ic.Swap(c),     title:"Swap Your Car", desc:"Trade your current vehicle. Our swap program gives you fair value every time.",         cta:"Start a Swap",   href:"/customer/swap-car"  },
  { icon: (c:string) => Ic.Map(c),      title:"Live Tracking", desc:"Real-time GPS tracking, driver info, and live ETA — all from your phone.",              cta:"View Live Map",  href:"/customer/live-map"  },
];

const STATS = [
  { value:"500+", label:"Cars in Fleet"     },
  { value:"12k+", label:"Happy Customers"   },
  { value:"80+",  label:"Partner Dealers"   },
  { value:"98%",  label:"Satisfaction Rate" },
];

const CUSTOMER_STEPS = [
  { n:"01", title:"Create Your Account", desc:"Sign up in under 2 minutes. No paperwork — just your email and you're in." },
  { n:"02", title:"Pick Your Car",        desc:"Browse our fleet, filter by type, price and availability, then select your match." },
  { n:"03", title:"Drive & Enjoy",        desc:"Confirm your booking, pick up your car or have it delivered, and hit the road." },
];

const DEALER_STEPS = [
  { n:"01", title:"Create Your Company", desc:"Name your dealership, upload your logo, set your team size — done in 5 minutes." },
  { n:"02", title:"Invite Your Team",    desc:"Add admin, finance and employees. They receive login credentials automatically." },
  { n:"03", title:"Go Live",             desc:"List your cars for sale, rental or swap. Start taking bookings and payments." },
];

const DEALER_FEATURES = [
  { icon:(c:string)=>Ic.Users(c),    title:"Team Management",  desc:"Add employees, assign roles, control every permission from one place."    },
  { icon:(c:string)=>Ic.Payment(c),  title:"Payments",         desc:"Accept card, Mobile Money and bank transfers out of the box."             },
  { icon:(c:string)=>Ic.Reports(c),  title:"Analytics",        desc:"Revenue, booking trends and customer insights in real time."              },
  { icon:(c:string)=>Ic.Vehicles(c), title:"Fleet Control",    desc:"List cars for sale, rental or swap — any time, from any device."          },
  { icon:(c:string)=>Ic.Booking(c),  title:"Booking System",   desc:"Customers book directly from your portal — no third-party friction."      },
  { icon:(c:string)=>Ic.Settings(c), title:"Role Control",     desc:"Grant or deny any specific access to any team member at any time."        },
];

const TESTIMONIALS = [
  { name:"Kwame Asante",  role:"Business Executive",    text:"Booked a BMW in under 3 minutes. Picked it up the same afternoon. Best car service in Accra.", dealer:false },
  { name:"Abena Osei",    role:"Dealer — AO Motors",    text:"The dealer portal transformed how we manage our fleet. Every booking, payment and swap — one dashboard.", dealer:true },
  { name:"Kofi Mensah",   role:"Doctor",                text:"Live tracking gives me complete peace of mind. Incredibly professional service from start to finish.", dealer:false },
  { name:"Ernest Boateng",role:"CEO — Prestige Auto Gh",text:"We moved from spreadsheets to a fully digital operation in one afternoon. Revenue up 40% in 3 months.", dealer:true },
];

const MOCK_DEALERS = [
  { name:"Prestige Auto Gh", city:"Accra",      cars:48, init:"PA" },
  { name:"AO Motors",        city:"Kumasi",     cars:32, init:"AO" },
  { name:"DriveHub GH",      city:"Tema",       cars:27, init:"DH" },
  { name:"Volta Wheels",     city:"Ho",         cars:19, init:"VW" },
  { name:"Cape Rides",       city:"Cape Coast", cars:15, init:"CR" },
  { name:"Takoradi Motors",  city:"Takoradi",   cars:23, init:"TM" },
];

const FEATURED_IDS  = [1,7,10,3,5,11,14,12,13,15];
const SALE_PRICES: Record<number,string> = {
  1:"GHS 152,000", 3:"GHS 165,000",  5:"GHS 318,000",
  7:"GHS 416,000", 10:"GHS 232,000", 11:"GHS 269,000",
  12:"GHS 385,000",13:"GHS 310,000", 14:"GHS 428,000", 15:"GHS 850,000",
};

// ── Scroll-reveal helper ──────────────────────────────────────────────────────
function RevealDiv({ children, delay=0, style={} }: { children:React.ReactNode; delay?:number; style?:React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.style.opacity="1"; el.style.transform="translateY(0)"; obs.disconnect(); }
    }, { threshold:0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity:0, transform:"translateY(24px)", transition:`opacity 0.55s ${delay}ms ease, transform 0.55s ${delay}ms ease`, ...style }}>
      {children}
    </div>
  );
}

// ── Animated counter ─────────────────────────────────────────────────────────
function CountUp({ target, suffix="" }: { target:number; suffix?:string }) {
  const ref   = useRef<HTMLSpanElement>(null);
  const start = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !start.current) {
        start.current = true;
        const dur = 1600;
        const t0  = performance.now();
        const tick = (now:number) => {
          const progress = Math.min((now - t0) / dur, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(ease * target) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.disconnect();
      }
    }, { threshold:0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

export default function LandingPage() {
  const router  = useRouter();
  const { dark, setDark } = useTheme();

  const [scrollY,    setScrollY]    = useState(0);
  const [isMobile,   setIsMobile]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [activeTab,  setActiveTab]  = useState<"customers"|"dealers">("customers");
  const [navVisible, setNavVisible] = useState(true);
  const lastY = useRef(0);

  // ── Tokens ────────────────────────────────────────────────────────────────
  const BG        = dark ? "#0a0a0a" : "#fafafa";
  const CARD      = dark ? "#141414" : "#ffffff";
  const SECT2     = dark ? "#0f0f0f" : "#f2f2f2";
  const FOOTER_BG = dark ? "#000000" : "#0a0a0a";
  const BORDER    = dark ? "rgba(255,255,255,0.08)" : "#e8e8e8";
  const MUTED     = dark ? "rgba(255,255,255,0.42)" : "#888888";
  const SUBTLE    = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";
  const HEAD      = dark ? "#f0f0f0" : "#111111";
  const NAVBG     = dark ? "rgba(10,10,10,0.94)" : "rgba(250,250,250,0.94)";
  const BODY      = dark ? "rgba(255,255,255,0.68)" : "rgba(0,0,0,0.6)";
  const ACC       = dark ? "#ffffff" : "#111111";
  const ACC_FG    = dark ? "#000000" : "#ffffff";
  const ACC3      = dark ? "#888888" : "#777777";
  const SCROLLT   = dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";
  const FOOTERTXT = dark ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.35)";
  const scrolled  = scrollY > 40;

  useEffect(() => {
    const fn = () => {
      const y = window.scrollY;
      setNavVisible(y < lastY.current || y < 100);
      lastY.current = y;
      setScrollY(y);
    };
    window.addEventListener("scroll", fn, { passive:true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const featuredCars = CARS.filter(c => FEATURED_IDS.includes(c.id));

  const NAV_LINKS = [
    { label:"Services",    href:"#services"  },
    { label:"Fleet",       href:"#fleet"     },
    { label:"Dealerships", href:"/dealers", isRoute:true },
    { label:"For Dealers", href:"#dealers"   },
    { label:"Pricing",     href:"#pricing"   },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html { scroll-behavior:smooth; }
        body { background:${BG}; font-family:'DM Sans',sans-serif; color:${HEAD}; overflow-x:hidden; transition:background 0.25s,color 0.25s; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:${SCROLLT}; border-radius:4px; }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatCar  { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-14px) rotate(-2deg)} }
        @keyframes pulse     { 0%,100%{opacity:0.4} 50%{opacity:0.9} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes driftA    { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-30px) scale(1.06)} 66%{transform:translate(-20px,20px) scale(0.96)} }
        @keyframes driftB    { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(-35px,25px) scale(1.04)} 70%{transform:translate(25px,-15px) scale(0.97)} }
        @keyframes lineGrow  { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes countUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer   { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes badgeSlide{ from{opacity:0;transform:translateX(-22px)} to{opacity:1;transform:translateX(0)} }
        .fade-up   { animation:fadeUp 0.7s ease both; }
        .fade-up-2 { animation:fadeUp 0.7s 0.12s ease both; }
        .fade-up-3 { animation:fadeUp 0.7s 0.24s ease both; }
        .badge-slide{ animation:badgeSlide 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .float-car { animation:floatCar 4s ease-in-out infinite; }
        .nav-link  { font-size:13px; font-weight:600; color:${MUTED}; text-decoration:none; cursor:pointer; padding-bottom:2px; border-bottom:2px solid transparent; transition:color 0.15s,border-color 0.15s; }
        .nav-link:hover { color:${HEAD}; border-bottom-color:${HEAD}; }
        .nav-bar   { transition:transform 0.32s cubic-bezier(0.4,0,0.2,1),background 0.3s,border-color 0.3s,box-shadow 0.3s; }
        .s-card { transition:all 0.22s; }
        .s-card:hover { border-color:${ACC} !important; transform:translateY(-4px); box-shadow:0 8px 28px rgba(0,0,0,0.1); }
        .c-card { transition:all 0.22s; }
        .c-card:hover { transform:translateY(-4px); border-color:${ACC} !important; box-shadow:0 8px 28px rgba(0,0,0,0.1); }
        .f-card { transition:all 0.22s; }
        .f-card:hover { border-color:${ACC} !important; transform:translateY(-3px); }
        .d-card { transition:all 0.22s; }
        .d-card:hover { border-color:${ACC} !important; transform:translateY(-4px); box-shadow:0 8px 28px rgba(0,0,0,0.1); }
        .p-card { transition:all 0.22s; }
        .p-card:hover { transform:translateY(-4px); box-shadow:0 12px 40px rgba(0,0,0,0.12); }
        .orb-a { position:absolute; border-radius:50%; pointer-events:none; animation:driftA 18s ease-in-out infinite; }
        .orb-b { position:absolute; border-radius:50%; pointer-events:none; animation:driftB 22s ease-in-out infinite; }
        .stat-line { transform-origin:left; animation:lineGrow 0.8s cubic-bezier(0.16,1,0.3,1) both; }
        @media (max-width:767px) { .float-car { animation:none !important; } }
        .fleet-grid { display:grid; gap:20px; grid-template-columns:repeat(5,1fr); }
        @media (max-width:1100px) { .fleet-grid { grid-template-columns:repeat(3,1fr); } }
        @media (max-width:700px)  { .fleet-grid { grid-template-columns:repeat(2,1fr); gap:12px; } }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className="nav-bar" style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100, height:64,
        background: scrolled||menuOpen ? NAVBG : "transparent",
        backdropFilter: scrolled||menuOpen ? "blur(18px)" : "none",
        borderBottom: scrolled||menuOpen ? `1px solid ${BORDER}` : "none",
        boxShadow: scrolled ? `0 1px 20px rgba(0,0,0,${dark?0.3:0.06})` : "none",
        transform: navVisible ? "translateY(0)" : "translateY(-100%)",
        display:"flex", alignItems:"center", padding:"0 clamp(16px,4vw,80px)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:9, cursor:"pointer", flexShrink:0 }} onClick={()=>router.push("/")}>
          <div style={{ width:34, height:34, background:ACC, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center" }}>
            {Ic.CarLogo(ACC_FG)}
          </div>
          <div>
            <div style={{ fontSize:11, fontWeight:800, color:HEAD, letterSpacing:2, lineHeight:1.1 }}>ELITE</div>
            <div style={{ fontSize:9, fontWeight:600, color:MUTED, letterSpacing:1.5 }}>DRIVE MOTORS</div>
          </div>
        </div>

        {!isMobile && (
          <div style={{ display:"flex", alignItems:"center", gap:28, margin:"0 auto" }}>
            {NAV_LINKS.map(l => l.isRoute
              ? <span key={l.label} className="nav-link" onClick={()=>router.push(l.href)}>{l.label}</span>
              : <a key={l.label} className="nav-link" href={l.href}>{l.label}</a>
            )}
          </div>
        )}
        {isMobile && <div style={{ flex:1 }}/>}

        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          {!isMobile && (
            <button onClick={()=>setDark(!dark)}
              style={{ width:34, height:34, borderRadius:8, background:SUBTLE, border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"border-color 0.15s" }}
              onMouseEnter={e=>(e.currentTarget.style.borderColor=ACC)}
              onMouseLeave={e=>(e.currentTarget.style.borderColor=BORDER)}>
              {dark ? Ic.Sun(MUTED) : Ic.Moon(MUTED)}
            </button>
          )}
          {!isMobile && (
            <button onClick={()=>router.push("/login")}
              style={{ fontSize:13, fontWeight:600, color:HEAD, background:"transparent", border:`1px solid ${BORDER}`, borderRadius:8, padding:"7px 16px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"border-color 0.15s" }}
              onMouseEnter={e=>(e.currentTarget.style.borderColor=ACC)}
              onMouseLeave={e=>(e.currentTarget.style.borderColor=BORDER)}>
              Sign In
            </button>
          )}
          {!isMobile && (
            <button onClick={()=>router.push("/onboarding")}
              style={{ fontSize:13, fontWeight:700, color:ACC_FG, background:ACC, border:"none", borderRadius:8, padding:"7px 18px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"opacity 0.15s,transform 0.15s" }}
              onMouseEnter={e=>{ e.currentTarget.style.opacity="0.82"; e.currentTarget.style.transform="translateY(-1px)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.opacity="1"; e.currentTarget.style.transform="translateY(0)"; }}>
              Get Started
            </button>
          )}
          {isMobile && (
            <button onClick={()=>setMenuOpen(o=>!o)}
              style={{ width:40, height:40, borderRadius:9, background:SUBTLE, border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:HEAD }}>
              {menuOpen
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 12h18M3 6h18M3 18h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              }
            </button>
          )}
        </div>
      </nav>

      {/* Mobile dropdown */}
      {isMobile && menuOpen && (
        <div style={{ position:"fixed", top:64, left:0, right:0, zIndex:99, background:NAVBG, backdropFilter:"blur(18px)", borderBottom:`1px solid ${BORDER}`, padding:"16px 20px 20px", animation:"slideDown 0.2s ease" }}>
          {NAV_LINKS.map(l => (
            <a key={l.label} href={l.href} onClick={()=>setMenuOpen(false)}
              style={{ display:"block", fontSize:15, fontWeight:600, color:HEAD, textDecoration:"none", padding:"12px 0", borderBottom:`1px solid ${BORDER}` }}>
              {l.label}
            </a>
          ))}
          <div style={{ display:"flex", gap:10, marginTop:16 }}>
            <button onClick={()=>{ router.push("/login"); setMenuOpen(false); }}
              style={{ flex:1, padding:"11px", borderRadius:9, border:`1px solid ${BORDER}`, background:"transparent", color:HEAD, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
              Sign In
            </button>
            <button onClick={()=>{ router.push("/onboarding"); setMenuOpen(false); }}
              style={{ flex:1, padding:"11px", borderRadius:9, border:"none", background:ACC, color:ACC_FG, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
              Get Started
            </button>
          </div>
          <div style={{ marginTop:14, display:"flex", justifyContent:"center" }}>
            <button onClick={()=>setDark(!dark)}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 16px", borderRadius:20, background:SUBTLE, border:`1px solid ${BORDER}`, cursor:"pointer", fontSize:12, fontWeight:600, color:MUTED, fontFamily:"'DM Sans',sans-serif" }}>
              {dark ? Ic.Sun(MUTED) : Ic.Moon(MUTED)}
              <span>{dark ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section style={{ minHeight:"100vh", background:BG, display:"flex", flexDirection:"column", justifyContent:"center", padding: isMobile?"100px 20px 60px":"100px clamp(20px,5vw,80px) 60px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, opacity:dark?0.06:0.03, pointerEvents:"none" }}>
          <svg width="100%" height="100%">
            <defs><pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill={dark?"white":"black"}/></pattern></defs>
            <rect width="100%" height="100%" fill="url(#dots)"/>
          </svg>
        </div>
        {/* Floating gradient orbs */}
        <div className="orb-a" style={{ width:500, height:500, top:"-15%", right:"-8%", background: dark?"radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)":"radial-gradient(circle, rgba(0,0,0,0.04) 0%, transparent 70%)" }}/>
        <div className="orb-b" style={{ width:380, height:380, bottom:"5%", left:"-6%", background: dark?"radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)":"radial-gradient(circle, rgba(0,0,0,0.03) 0%, transparent 70%)" }}/>
        <div className="orb-a" style={{ width:260, height:260, top:"30%", left:"20%", animationDelay:"-6s", background: dark?"radial-gradient(circle, rgba(255,255,255,0.025) 0%, transparent 70%)":"radial-gradient(circle, rgba(0,0,0,0.025) 0%, transparent 70%)" }}/>

        {/* Tab switcher */}
        <div className="fade-up" style={{ position:"relative", zIndex:1, display:"flex", justifyContent: isMobile?"center":"flex-start", maxWidth:1200, margin:"0 auto", width:"100%", marginBottom:32 }}>
          <div style={{ display:"inline-flex", background:SUBTLE, border:`1px solid ${BORDER}`, borderRadius:12, padding:4, gap:2 }}>
            {(["customers","dealers"] as const).map(tab => (
              <button key={tab} onClick={()=>setActiveTab(tab)}
                style={{ padding:"8px 20px", borderRadius:9, border:"none", background: activeTab===tab ? ACC : "transparent", color: activeTab===tab ? ACC_FG : MUTED, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}>
                {tab === "customers" ? "I Need a Car" : "I Run a Dealership"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap: isMobile?32:60, flexDirection: isMobile?"column":"row", position:"relative", zIndex:1, maxWidth:1200, margin:"0 auto", width:"100%" }}>
          <div style={{ flex:1, minWidth:0 }}>
            {activeTab === "customers" ? (
              <>
                <div className="badge-slide" style={{ display:"inline-flex", alignItems:"center", gap:8, background:SUBTLE, border:`1px solid ${BORDER}`, borderRadius:20, padding:"6px 16px", marginBottom:24 }}>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:"#10B981", display:"inline-block", animation:"pulse 2s infinite" }}/>
                  <span style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:1 }}>NOW SERVING ACCRA & BEYOND</span>
                </div>
                <h1 className="fade-up-2" style={{ fontSize:"clamp(36px,5vw,68px)", fontWeight:900, color:HEAD, lineHeight:1.08, marginBottom:20 }}>
                  Ghana's #1<br/><span style={{ color:ACC3 }}>Car Platform</span>
                </h1>
                <p className="fade-up-3" style={{ fontSize:16, color:MUTED, lineHeight:1.75, maxWidth:480, marginBottom:36 }}>
                  Rent, buy, swap and track vehicles — all in one place. From daily rentals to full ownership, we have the car for every journey.
                </p>
                <div className="fade-up-3" style={{ display:"flex", gap:12, flexWrap:"wrap", flexDirection: isMobile?"column":"row", marginBottom:40 }}>
                  <button onClick={()=>router.push("/customer/login")}
                    style={{ display:"flex", alignItems:"center", gap:8, padding:"14px 28px", borderRadius:10, border:"none", background:ACC, color:ACC_FG, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"opacity 0.15s,transform 0.15s" }}
                    onMouseEnter={e=>{ e.currentTarget.style.opacity="0.82"; e.currentTarget.style.transform="translateY(-2px)"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.opacity="1"; e.currentTarget.style.transform="translateY(0)"; }}>
                    <span style={{ display:"flex" }}>{Ic.Rentals(ACC_FG)}</span> Rent a Car Today
                  </button>
                  <button onClick={()=>router.push("/cars")}
                    style={{ display:"flex", alignItems:"center", gap:8, padding:"14px 28px", borderRadius:10, border:`1px solid ${BORDER}`, background:"transparent", color:HEAD, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"border-color 0.15s" }}
                    onMouseEnter={e=>(e.currentTarget.style.borderColor=ACC)}
                    onMouseLeave={e=>(e.currentTarget.style.borderColor=BORDER)}>
                    <span style={{ display:"flex", opacity:0.55 }}>{Ic.Buy(HEAD)}</span> Browse Cars for Sale
                  </button>
                  <button onClick={()=>router.push("/dealers")}
                    style={{ display:"flex", alignItems:"center", gap:8, padding:"14px 28px", borderRadius:10, border:`1px solid ${BORDER}`, background:"transparent", color:HEAD, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"border-color 0.15s" }}
                    onMouseEnter={e=>(e.currentTarget.style.borderColor=ACC)}
                    onMouseLeave={e=>(e.currentTarget.style.borderColor=BORDER)}>
                    View All Dealerships
                  </button>
                </div>
                <div className="fade-up-3" style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
                  {["No Hidden Fees","Free Cancellation","24/7 Support"].map(b => (
                    <div key={b} style={{ display:"flex", alignItems:"center", gap:7 }}>
                      <span style={{ width:18, height:18, borderRadius:"50%", background:SUBTLE, border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-4" stroke={HEAD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                      <span style={{ fontSize:12, color:MUTED }}>{b}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="badge-slide" style={{ display:"inline-flex", alignItems:"center", gap:8, background:SUBTLE, border:`1px solid ${BORDER}`, borderRadius:20, padding:"6px 16px", marginBottom:24 }}>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:"#10B981", display:"inline-block", animation:"pulse 2s infinite" }}/>
                  <span style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:1 }}>FOR CAR DEALERSHIPS</span>
                </div>
                <h1 className="fade-up-2" style={{ fontSize:"clamp(36px,5vw,64px)", fontWeight:900, color:HEAD, lineHeight:1.08, marginBottom:20 }}>
                  Run your dealership<br/><span style={{ color:ACC3 }}>digitally</span>
                </h1>
                <p className="fade-up-3" style={{ fontSize:16, color:MUTED, lineHeight:1.75, maxWidth:480, marginBottom:36 }}>
                  Create your company portal in minutes. Manage your fleet, team, bookings and payments — all from one dashboard.
                </p>
                <div className="fade-up-3" style={{ display:"flex", gap:12, flexWrap:"wrap", flexDirection: isMobile?"column":"row", marginBottom:40 }}>
                  <button onClick={()=>router.push("/onboarding")}
                    style={{ display:"flex", alignItems:"center", gap:8, padding:"14px 28px", borderRadius:10, border:"none", background:ACC, color:ACC_FG, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"opacity 0.15s,transform 0.15s" }}
                    onMouseEnter={e=>{ e.currentTarget.style.opacity="0.82"; e.currentTarget.style.transform="translateY(-2px)"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.opacity="1"; e.currentTarget.style.transform="translateY(0)"; }}>
                    Start Free — Set Up Your Company
                  </button>
                  <button onClick={()=>{ document.getElementById("pricing")?.scrollIntoView({behavior:"smooth"}); }}
                    style={{ display:"flex", alignItems:"center", gap:8, padding:"14px 28px", borderRadius:10, border:`1px solid ${BORDER}`, background:"transparent", color:HEAD, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"border-color 0.15s" }}
                    onMouseEnter={e=>(e.currentTarget.style.borderColor=ACC)}
                    onMouseLeave={e=>(e.currentTarget.style.borderColor=BORDER)}>
                    View Pricing
                  </button>
                </div>
                <div className="fade-up-3" style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
                  {["Free for 5 employees","Setup in 5 minutes","No technical skills needed"].map(b => (
                    <div key={b} style={{ display:"flex", alignItems:"center", gap:7 }}>
                      <span style={{ width:18, height:18, borderRadius:"50%", background:SUBTLE, border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-4" stroke={HEAD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                      <span style={{ fontSize:12, color:MUTED }}>{b}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Car image */}
          <div style={{ flex: isMobile?"0 0 auto":"0 0 50%", width: isMobile?"100%":"auto", maxWidth: isMobile?340:"none", position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 50% 80%, ${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.05)"} 0%, transparent 65%)`, pointerEvents:"none" }}/>
            <div className="float-car" style={{ width:"100%", maxWidth:620, position:"relative" }}>
              <Image src="/images/cars/blackbenz.png" alt="Elite Drive Motors" width={620} height={360}
                style={{ width:"100%", height:"auto", objectFit:"contain", filter:`drop-shadow(0 30px 60px ${dark?"rgba(0,0,0,0.7)":"rgba(0,0,0,0.22)"})` }} priority/>
            </div>
          </div>
        </div>

        {/* Stats bar — animated counters */}
        <div style={{ position:"relative", zIndex:1, maxWidth:1200, margin:"60px auto 0", width:"100%" }}>
          <div style={{ display:"grid", gridTemplateColumns: isMobile?"1fr 1fr":"repeat(4,1fr)", gap:1, background:BORDER, borderRadius:16, overflow:"hidden", border:`1px solid ${BORDER}` }}>
            {[
              { target:500, suffix:"+", label:"Cars in Fleet" },
              { target:12,  suffix:"k+",label:"Happy Customers" },
              { target:80,  suffix:"+", label:"Partner Dealers" },
              { target:98,  suffix:"%" ,label:"Satisfaction Rate" },
            ].map(s => (
              <div key={s.label} style={{ background:CARD, padding:"24px 28px", textAlign:"center" }}>
                <div style={{ fontSize:32, fontWeight:900, color:HEAD, marginBottom:4 }}>
                  <CountUp target={s.target} suffix={s.suffix}/>
                </div>
                <div style={{ fontSize:12, color:MUTED, fontWeight:500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" style={{ padding:"80px clamp(20px,5vw,80px)", background:SECT2 }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <RevealDiv style={{ textAlign:"center", marginBottom:56 }}>
            <div style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:2, marginBottom:12, textTransform:"uppercase" }}>What We Offer</div>
            <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:800, color:HEAD, marginBottom:14 }}>Everything in one platform</h2>
            <p style={{ fontSize:15, color:MUTED, maxWidth:460, margin:"0 auto" }}>Whether you're renting for a day or buying for a lifetime, we have a service built for you.</p>
          </RevealDiv>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:20 }}>
            {SERVICES.map((s,i) => (
              <RevealDiv key={s.title} delay={i*80}>
                <div className="s-card" style={{ background:CARD, borderRadius:16, border:`1px solid ${BORDER}`, padding:"28px 24px", cursor:"pointer", height:"100%" }} onClick={()=>router.push(s.href)}>
                  <div style={{ width:48, height:48, borderRadius:13, background:SUBTLE, border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:20 }}>
                    <span style={{ display:"flex" }}>{s.icon(HEAD)}</span>
                  </div>
                  <div style={{ fontSize:17, fontWeight:700, color:HEAD, marginBottom:10 }}>{s.title}</div>
                  <p style={{ fontSize:13, color:MUTED, lineHeight:1.7, marginBottom:20 }}>{s.desc}</p>
                  <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, fontWeight:700, color:HEAD }}>
                    {s.cta} <span style={{ display:"flex" }}>{Ic.ChevronRight(HEAD)}</span>
                  </div>
                </div>
              </RevealDiv>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ padding:"80px clamp(20px,5vw,80px)", background:BG }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <RevealDiv style={{ textAlign:"center", marginBottom:56 }}>
            <div style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:2, marginBottom:12, textTransform:"uppercase" }}>Simple Process</div>
            <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:800, color:HEAD, marginBottom:14 }}>Drive in 3 easy steps</h2>
            <p style={{ fontSize:15, color:MUTED }}>Getting behind the wheel has never been this simple.</p>
          </RevealDiv>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:32 }}>
            {CUSTOMER_STEPS.map((s,i) => (
              <RevealDiv key={s.n} delay={i*100}>
                <div style={{ fontSize:56, fontWeight:900, color:ACC3, lineHeight:1 }}>{s.n}</div>
                <div style={{ fontSize:18, fontWeight:700, color:HEAD, marginBottom:10, marginTop:8 }}>{s.title}</div>
                <p style={{ fontSize:14, color:MUTED, lineHeight:1.75 }}>{s.desc}</p>
              </RevealDiv>
            ))}
          </div>
          <div style={{ marginTop:52, display:"flex", justifyContent:"center" }}>
            <button onClick={()=>router.push("/customer/login")}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"14px 32px", borderRadius:10, border:"none", background:ACC, color:ACC_FG, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"opacity 0.15s,transform 0.15s" }}
              onMouseEnter={e=>{ e.currentTarget.style.opacity="0.82"; e.currentTarget.style.transform="translateY(-2px)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.opacity="1"; e.currentTarget.style.transform="translateY(0)"; }}>
              <span style={{ display:"flex" }}>{Ic.Booking(ACC_FG)}</span> Create Free Account
            </button>
          </div>
        </div>
      </section>

      {/* ── FEATURED FLEET ── */}
      <section id="fleet" style={{ padding:"80px clamp(20px,5vw,80px)", background:SECT2 }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <RevealDiv style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:40, flexWrap:"wrap", gap:16 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:2, marginBottom:12, textTransform:"uppercase" }}>Our Fleet</div>
              <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:800, color:HEAD }}>Featured Vehicles</h2>
            </div>
            <button onClick={()=>router.push("/cars")}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 20px", borderRadius:9, border:`1px solid ${BORDER}`, background:"transparent", color:HEAD, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"border-color 0.15s", flexShrink:0 }}
              onMouseEnter={e=>(e.currentTarget.style.borderColor=ACC)}
              onMouseLeave={e=>(e.currentTarget.style.borderColor=BORDER)}>
              View all cars <span style={{ display:"flex" }}>{Ic.ChevronRight(HEAD)}</span>
            </button>
          </RevealDiv>
          <div className="fleet-grid">
            {featuredCars.map((car,i) => (
              <RevealDiv key={car.id} delay={i*60}>
                <div className="c-card" style={{ background:CARD, borderRadius:14, border:`1px solid ${BORDER}`, overflow:"hidden", cursor:"pointer" }} onClick={()=>router.push("/cars")}>
                  <div style={{ position:"relative", height:150, background:dark?"#1a1a1a":"#e8e8e8", overflow:"hidden" }}>
                    <Image src={car.image} alt={car.name} fill sizes="260px" style={{ objectFit:"cover" }}/>
                    <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.45) 0%,transparent 55%)", pointerEvents:"none" }}/>
                    <span style={{ position:"absolute", top:10, left:10, fontSize:9, fontWeight:700, color:"#10B981", background:"rgba(16,185,129,0.15)", border:"1px solid rgba(16,185,129,0.3)", borderRadius:20, padding:"3px 9px" }}>Available</span>
                  </div>
                  <div style={{ padding:"14px 16px" }}>
                    <div style={{ fontSize:14, fontWeight:700, color:HEAD, marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{car.name}</div>
                    <div style={{ fontSize:11, color:MUTED, marginBottom:12, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{car.spec}</div>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <div>
                        <div style={{ fontSize:9, color:MUTED, marginBottom:1 }}>Rent from</div>
                        <div style={{ fontSize:15, fontWeight:800, color:HEAD }}>GHS {car.price*6}<span style={{ fontSize:10, color:MUTED, fontWeight:400 }}>/day</span></div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:9, color:MUTED, marginBottom:1 }}>Buy from</div>
                        <div style={{ fontSize:13, fontWeight:700, color:HEAD }}>{SALE_PRICES[car.id] ?? "—"}</div>
                      </div>
                    </div>
                    <div style={{ marginTop:12, display:"flex", gap:6, flexWrap:"wrap" }}>
                      {[car.fuel,car.transmission,car.type].map(tag => (
                        <span key={tag} style={{ fontSize:9, fontWeight:600, color:MUTED, background:SUBTLE, borderRadius:6, padding:"3px 8px", border:`1px solid ${BORDER}` }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </RevealDiv>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR DEALERS ── */}
      <section id="dealers" style={{ padding:"80px clamp(20px,5vw,80px)", background:BG }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ display:"flex", gap: isMobile?40:60, alignItems:"flex-start", flexWrap:"wrap", marginBottom:60 }}>
            <RevealDiv style={{ flex:1, minWidth:280 }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:SUBTLE, border:`1px solid ${BORDER}`, borderRadius:20, padding:"5px 14px", marginBottom:20 }}>
                <span style={{ display:"flex", opacity:0.7 }}>{Ic.Vehicles(HEAD)}</span>
                <span style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:1 }}>FOR CAR DEALERS</span>
              </div>
              <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:800, color:HEAD, lineHeight:1.15, marginBottom:16 }}>
                Sell more cars.<br/>Manage your team.<br/>Grow your business.
              </h2>
              <p style={{ fontSize:15, color:MUTED, lineHeight:1.75, maxWidth:440, marginBottom:32 }}>
                EliteDriveMotors is a full platform for Ghanaian car dealerships. Get your own branded portal, manage roles, accept payments, and reach thousands of buyers — all in one place.
              </p>
              <button onClick={()=>router.push("/onboarding")}
                style={{ display:"flex", alignItems:"center", gap:8, padding:"13px 26px", borderRadius:10, border:"none", background:ACC, color:ACC_FG, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"opacity 0.15s,transform 0.15s" }}
                onMouseEnter={e=>{ e.currentTarget.style.opacity="0.82"; e.currentTarget.style.transform="translateY(-2px)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.opacity="1"; e.currentTarget.style.transform="translateY(0)"; }}>
                Create Your Company Portal
              </button>
            </RevealDiv>
            <div style={{ flex:1, minWidth:280, display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              {DEALER_FEATURES.map((f,i) => (
                <RevealDiv key={f.title} delay={i*60}>
                  <div className="f-card" style={{ background:CARD, borderRadius:12, border:`1px solid ${BORDER}`, padding:"18px 16px" }}>
                    <div style={{ width:36, height:36, borderRadius:9, background:SUBTLE, border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12 }}>
                      <span style={{ display:"flex" }}>{f.icon(HEAD)}</span>
                    </div>
                    <div style={{ fontSize:13, fontWeight:700, color:HEAD, marginBottom:5 }}>{f.title}</div>
                    <div style={{ fontSize:11, color:MUTED, lineHeight:1.6 }}>{f.desc}</div>
                  </div>
                </RevealDiv>
              ))}
            </div>
          </div>

          {/* Dealer onboarding steps */}
          <RevealDiv>
            <div style={{ background:CARD, borderRadius:20, border:`1px solid ${BORDER}`, padding: isMobile?"24px":"40px", marginBottom:60 }}>
              <div style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:2, marginBottom:8, textTransform:"uppercase" }}>Onboarding</div>
              <h3 style={{ fontSize:22, fontWeight:800, color:HEAD, marginBottom:32 }}>Set up your dealership in 3 steps</h3>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:32 }}>
                {DEALER_STEPS.map(s => (
                  <div key={s.n}>
                    <div style={{ fontSize:40, fontWeight:900, color:ACC3, lineHeight:1, marginBottom:14 }}>{s.n}</div>
                    <div style={{ fontSize:16, fontWeight:700, color:HEAD, marginBottom:8 }}>{s.title}</div>
                    <p style={{ fontSize:13, color:MUTED, lineHeight:1.7 }}>{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </RevealDiv>

          {/* Partner dealerships showcase */}
          <RevealDiv style={{ textAlign:"center", marginBottom:32 }}>
            <div style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Trusted by dealers across Ghana</div>
            <h3 style={{ fontSize:"clamp(22px,3vw,34px)", fontWeight:800, color:HEAD }}>Our Partner Dealerships</h3>
          </RevealDiv>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))", gap:16 }}>
            {MOCK_DEALERS.map((d,i) => (
              <RevealDiv key={d.name} delay={i*60}>
                <div className="d-card" style={{ background:CARD, borderRadius:14, border:`1px solid ${BORDER}`, padding:"20px 18px", cursor:"pointer", textAlign:"center" }}>
                  <div style={{ width:52, height:52, borderRadius:14, background:SUBTLE, border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", fontSize:15, fontWeight:800, color:HEAD }}>
                    {d.init}
                  </div>
                  <div style={{ fontSize:13, fontWeight:700, color:HEAD, marginBottom:4 }}>{d.name}</div>
                  <div style={{ fontSize:11, color:MUTED, marginBottom:10 }}>{d.city}</div>
                  <div style={{ fontSize:10, fontWeight:600, color:MUTED, background:SUBTLE, border:`1px solid ${BORDER}`, borderRadius:20, padding:"3px 10px", display:"inline-block" }}>{d.cars} cars listed</div>
                </div>
              </RevealDiv>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section style={{ padding:"80px clamp(20px,5vw,80px)", background:SECT2 }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", gap:60, alignItems:"center", flexWrap:"wrap" }}>
          <RevealDiv style={{ flex:1, minWidth:280 }}>
            <div style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:2, marginBottom:12, textTransform:"uppercase" }}>Why Elite Drive</div>
            <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:800, color:HEAD, marginBottom:16, lineHeight:1.15 }}>Built for the modern Ghanaian driver</h2>
            <p style={{ fontSize:15, color:MUTED, lineHeight:1.75, marginBottom:32 }}>Premium vehicles, technology-driven tracking, and world-class customer service — all at competitive Ghanaian prices.</p>
            <button onClick={()=>router.push("/customer/login")}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"13px 26px", borderRadius:9, border:"none", background:ACC, color:ACC_FG, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"opacity 0.15s,transform 0.15s" }}
              onMouseEnter={e=>{ e.currentTarget.style.opacity="0.82"; e.currentTarget.style.transform="translateY(-2px)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.opacity="1"; e.currentTarget.style.transform="translateY(0)"; }}>
              Get Started Free
            </button>
          </RevealDiv>
          <div style={{ flex:1, minWidth:280, display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {[
              { icon:(c:string)=>Ic.Tracking(c), title:"Real-Time GPS",   desc:"Track every vehicle live from your phone or dashboard." },
              { icon:(c:string)=>Ic.Payment(c),  title:"Secure Payments", desc:"Mobile Money, card, and bank transfer — all accepted." },
              { icon:(c:string)=>Ic.Support(c),  title:"24/7 Support",    desc:"Our team is always on call — day, night, or weekend." },
              { icon:(c:string)=>Ic.License(c),  title:"Verified Fleet",  desc:"Every car is inspected, insured and road-certified." },
              { icon:(c:string)=>Ic.Booking(c),  title:"Instant Booking", desc:"Confirm your rental in under 3 minutes — no queues." },
              { icon:(c:string)=>Ic.Swap(c),     title:"Easy Trade-In",   desc:"Get a fair valuation and upgrade your car on the spot." },
            ].map((f,i) => (
              <RevealDiv key={f.title} delay={i*60}>
                <div className="f-card" style={{ background:CARD, borderRadius:12, border:`1px solid ${BORDER}`, padding:"18px 16px" }}>
                  <div style={{ width:36, height:36, borderRadius:9, background:SUBTLE, border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12 }}>
                    <span style={{ display:"flex" }}>{f.icon(HEAD)}</span>
                  </div>
                  <div style={{ fontSize:13, fontWeight:700, color:HEAD, marginBottom:5 }}>{f.title}</div>
                  <div style={{ fontSize:11, color:MUTED, lineHeight:1.6 }}>{f.desc}</div>
                </div>
              </RevealDiv>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding:"80px clamp(20px,5vw,80px)", background:BG }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <RevealDiv style={{ textAlign:"center", marginBottom:56 }}>
            <div style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:2, marginBottom:12, textTransform:"uppercase" }}>Pricing</div>
            <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:800, color:HEAD, marginBottom:14 }}>Simple, transparent pricing</h2>
            <p style={{ fontSize:15, color:MUTED, maxWidth:460, margin:"0 auto" }}>Start free — scale when you're ready. No contracts, cancel any time.</p>
          </RevealDiv>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:20 }}>
            {PLANS.map((plan,i) => (
              <RevealDiv key={plan.tier} delay={i*80}>
                <div className="p-card" style={{ background: plan.popular ? ACC : CARD, borderRadius:20, border: plan.popular ? "none" : `1px solid ${BORDER}`, padding:"32px 28px", position:"relative", height:"100%" }}>
                  {plan.popular && (
                    <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:"#10B981", color:"#fff", fontSize:10, fontWeight:700, borderRadius:20, padding:"3px 14px", letterSpacing:1, whiteSpace:"nowrap" }}>
                      MOST POPULAR
                    </div>
                  )}
                  <div style={{ marginBottom:24 }}>
                    <div style={{ fontSize:13, fontWeight:700, color: plan.popular ? ACC_FG+"99" : MUTED, marginBottom:8, textTransform:"uppercase", letterSpacing:1 }}>{plan.name}</div>
                    {plan.price === -1 ? (
                      <div style={{ fontSize:32, fontWeight:900, color: plan.popular ? ACC_FG : HEAD }}>Custom</div>
                    ) : (
                      <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
                        <span style={{ fontSize:36, fontWeight:900, color: plan.popular ? ACC_FG : HEAD }}>
                          {plan.price === 0 ? "Free" : `GHS ${plan.price}`}
                        </span>
                        {plan.price > 0 && <span style={{ fontSize:12, color: plan.popular ? ACC_FG+"66" : MUTED }}>/month</span>}
                      </div>
                    )}
                    <div style={{ fontSize:12, color: plan.popular ? ACC_FG+"77" : MUTED, marginTop:6 }}>
                      {plan.employeeLimit === Infinity ? "Unlimited team members" : `Up to ${plan.employeeLimit} team members`}
                    </div>
                  </div>
                  <div style={{ marginBottom:28 }}>
                    {plan.features.map(f => (
                      <div key={f} style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:12 }}>
                        <span style={{ width:18, height:18, borderRadius:"50%", background: plan.popular ? `${ACC_FG}20` : SUBTLE, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                          <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-4" stroke={plan.popular ? ACC_FG : HEAD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </span>
                        <span style={{ fontSize:13, color: plan.popular ? ACC_FG+"CC" : MUTED, lineHeight:1.5 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>router.push(plan.tier==="enterprise"?"#":`/onboarding?plan=${plan.tier}`)}
                    style={{ width:"100%", padding:"12px 0", borderRadius:10, border: plan.popular ? "none" : `1px solid ${BORDER}`, background: plan.popular ? ACC_FG : "transparent", color: plan.popular ? ACC : HEAD, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}
                    onMouseEnter={e=>{ if(!plan.popular){ e.currentTarget.style.borderColor=ACC; e.currentTarget.style.background=SUBTLE; } else { e.currentTarget.style.opacity="0.88"; } }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor=BORDER; e.currentTarget.style.background=plan.popular?ACC_FG:"transparent"; e.currentTarget.style.opacity="1"; }}>
                    {plan.tier==="enterprise" ? "Contact Sales" : plan.price===0 ? "Get Started Free" : "Start Trial"}
                  </button>
                </div>
              </RevealDiv>
            ))}
          </div>
          <RevealDiv style={{ marginTop:28, textAlign:"center" }}>
            <p style={{ fontSize:13, color:MUTED }}>All plans include a 14-day free trial. No credit card required.</p>
          </RevealDiv>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" style={{ padding:"80px clamp(20px,5vw,80px)", background:SECT2 }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <RevealDiv style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:2, marginBottom:12, textTransform:"uppercase" }}>Testimonials</div>
            <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:800, color:HEAD }}>Loved by customers and dealers</h2>
          </RevealDiv>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:20 }}>
            {TESTIMONIALS.map((t,i) => (
              <RevealDiv key={t.name} delay={i*80}>
                <div className="f-card" style={{ background:CARD, borderRadius:16, border:`1px solid ${BORDER}`, padding:"28px 24px", height:"100%" }}>
                  {t.dealer && (
                    <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:SUBTLE, border:`1px solid ${BORDER}`, borderRadius:20, padding:"3px 10px", marginBottom:14, fontSize:10, fontWeight:700, color:HEAD, letterSpacing:0.5 }}>
                      DEALER
                    </div>
                  )}
                  <div style={{ display:"flex", gap:3, marginBottom:18 }}>
                    {[1,2,3,4,5].map(n => <svg key={n} width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
                  </div>
                  <p style={{ fontSize:14, color:BODY, lineHeight:1.75, marginBottom:22, fontStyle:"italic" }}>"{t.text}"</p>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:40, height:40, borderRadius:"50%", background:SUBTLE, border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:HEAD, flexShrink:0 }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:HEAD }}>{t.name}</div>
                      <div style={{ fontSize:11, color:MUTED }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </RevealDiv>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding:"80px clamp(20px,5vw,80px)", background:BG }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <RevealDiv>
            <div style={{ background:ACC, borderRadius:24, padding:"60px clamp(24px,5vw,72px)", textAlign:"center", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", inset:0, opacity:0.04, pointerEvents:"none" }}>
                <svg width="100%" height="100%"><defs><pattern id="dots2" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill={ACC_FG}/></pattern></defs><rect width="100%" height="100%" fill="url(#dots2)"/></svg>
              </div>
              <div style={{ position:"relative", zIndex:1 }}>
                <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:`${ACC_FG}14`, borderRadius:20, padding:"5px 16px", marginBottom:20, fontSize:11, fontWeight:700, color:ACC_FG, letterSpacing:1 }}>
                  START TODAY — NO CREDIT CARD REQUIRED
                </div>
                <h2 style={{ fontSize:"clamp(26px,4vw,44px)", fontWeight:900, color:ACC_FG, marginBottom:14, lineHeight:1.15 }}>
                  Ready to grow your business?
                </h2>
                <p style={{ fontSize:15, color:`${ACC_FG}99`, maxWidth:460, margin:"0 auto 36px", lineHeight:1.75 }}>
                  Join 80+ Ghanaian dealerships who manage their entire operation on EliteDriveMotors. Free for your first 5 employees — forever.
                </p>
                <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
                  <button onClick={()=>router.push("/onboarding")}
                    style={{ display:"flex", alignItems:"center", gap:8, padding:"14px 32px", borderRadius:10, border:"none", background:ACC_FG, color:ACC, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"opacity 0.15s,transform 0.15s" }}
                    onMouseEnter={e=>{ e.currentTarget.style.opacity="0.88"; e.currentTarget.style.transform="translateY(-2px)"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.opacity="1"; e.currentTarget.style.transform="translateY(0)"; }}>
                    Create Your Company Portal
                  </button>
                  <button onClick={()=>router.push("/customer/login")}
                    style={{ display:"flex", alignItems:"center", gap:8, padding:"14px 32px", borderRadius:10, border:`2px solid ${ACC_FG}44`, background:`${ACC_FG}10`, color:ACC_FG, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"border-color 0.15s" }}
                    onMouseEnter={e=>(e.currentTarget.style.borderColor=`${ACC_FG}88`)}
                    onMouseLeave={e=>(e.currentTarget.style.borderColor=`${ACC_FG}44`)}>
                    I Need a Car
                  </button>
                </div>
              </div>
            </div>
          </RevealDiv>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:FOOTER_BG, borderTop:"1px solid rgba(255,255,255,0.06)", padding:"56px clamp(20px,5vw,80px) 32px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns: isMobile?"1fr 1fr":"2fr 1fr 1fr 1fr", gap: isMobile?28:48, marginBottom:48 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:16 }}>
                <div style={{ width:34, height:34, background:"#ffffff", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center" }}>{Ic.CarLogo("#0a0a0a")}</div>
                <div>
                  <div style={{ fontSize:11, fontWeight:800, color:"#ffffff", letterSpacing:2, lineHeight:1.1 }}>ELITE</div>
                  <div style={{ fontSize:9, fontWeight:600, color:"rgba(255,255,255,0.35)", letterSpacing:1.5 }}>DRIVE MOTORS</div>
                </div>
              </div>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.38)", lineHeight:1.8, maxWidth:240, marginBottom:20 }}>
                Ghana's complete car platform. Rent, buy, swap, track — and run your dealership digitally.
              </p>
              <div style={{ display:"flex", gap:10 }}>
                {["f","t","in","yt"].map(s => (
                  <div key={s} style={{ width:32, height:32, borderRadius:8, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.4)", transition:"border-color 0.15s" }}
                    onMouseEnter={e=>(e.currentTarget.style.borderColor="rgba(255,255,255,0.3)")}
                    onMouseLeave={e=>(e.currentTarget.style.borderColor="rgba(255,255,255,0.1)")}>
                    {s}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"#fff", letterSpacing:1.5, marginBottom:16, textTransform:"uppercase" }}>Services</div>
              {[["Rent a Car","/customer/rent-car"],["Buy a Car","/customer/buy-car"],["Swap Your Car","/customer/swap-car"],["Live Tracking","/customer/live-map"],["Browse Fleet","/cars"]].map(([l,h]) => (
                <div key={l} onClick={()=>router.push(h)} style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginBottom:10, cursor:"pointer", transition:"color 0.15s" }}
                  onMouseEnter={e=>(e.currentTarget.style.color="#fff")} onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.4)")}>{l}</div>
              ))}
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"#fff", letterSpacing:1.5, marginBottom:16, textTransform:"uppercase" }}>For Business</div>
              {[["Create Company","/onboarding"],["Pricing","#pricing"],["Sign In","/login"],["Dealer Portal","/company/portal/admin"]].map(([l,h]) => (
                <div key={l} onClick={()=>router.push(h)} style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginBottom:10, cursor:"pointer", transition:"color 0.15s" }}
                  onMouseEnter={e=>(e.currentTarget.style.color="#fff")} onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.4)")}>{l}</div>
              ))}
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"#fff", letterSpacing:1.5, marginBottom:16, textTransform:"uppercase" }}>Contact</div>
              {["East Legon, Accra, Ghana","+233 20 000 0000","hello@elitedrivemotors.com","Mon–Sat: 7am – 9pm"].map(c => (
                <div key={c} style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginBottom:10, lineHeight:1.5 }}>{c}</div>
              ))}
            </div>
          </div>
          <div style={{ borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:24, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
            <div style={{ fontSize:12, color:FOOTERTXT }}>© 2025 Elite Drive Motors. All rights reserved.</div>
            <div style={{ display:"flex", gap:20 }}>
              {["Privacy Policy","Terms of Service","Cookie Policy"].map(l => (
                <span key={l} style={{ fontSize:12, color:FOOTERTXT, cursor:"pointer", transition:"color 0.15s" }}
                  onMouseEnter={e=>(e.currentTarget.style.color="rgba(255,255,255,0.6)")} onMouseLeave={e=>(e.currentTarget.style.color=FOOTERTXT)}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
