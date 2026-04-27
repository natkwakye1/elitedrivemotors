"use client";
// src/app/dealers/[slug]/page.tsx

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { useTheme } from "@/src/context/ThemeContext";
import { SAAS_STORAGE } from "@/src/lib/saas-types";
import type { Company, CompanyCar } from "@/src/lib/saas-types";
import { CARS } from "@/src/lib/data/cars";
import { Ic } from "@/src/components/ui/Icons";

type ServiceTab = "all" | "rental" | "sale" | "swap";

const SLUG_CAR_MAP: Record<string, number[]> = {
  prestigeautogh: [1,2,10,11,5,12],
  aomotors:       [3,4,6,8],
  drivehubgh:     [7,9,13,1,3,5,11],
  voltawheels:    [2,4,6,8],
  caperides:      [1,3,7,9],
  takoradimotors: [5,10,11,12,13],
  luxurydrivergh: [7,11,12,13,5],
  swapzonemotors: [1,2,3,4,6,8],
};

const MOCK_DB: Record<string, Partial<Company>> = {
  prestigeautogh: { name:"Prestige Auto Gh", industry:"Car Sales",            address:"East Legon, Accra",   phone:"+233 20 111 0001", website:"https://prestigeautogh.com" },
  aomotors:       { name:"AO Motors",        industry:"Car Rental",           address:"Adum, Kumasi",         phone:"+233 20 111 0002" },
  drivehubgh:     { name:"DriveHub GH",      industry:"Multi-Service Dealer", address:"Tema, Greater Accra", phone:"+233 20 111 0003" },
  voltawheels:    { name:"Volta Wheels",     industry:"Used Cars",            address:"Ho, Volta Region",     phone:"+233 20 111 0004" },
  caperides:      { name:"Cape Rides",       industry:"Car Rental",           address:"Cape Coast, CR",       phone:"+233 20 111 0005" },
  takoradimotors: { name:"Takoradi Motors",  industry:"Car Sales",            address:"Takoradi, WR",         phone:"+233 20 111 0006" },
  luxurydrivergh: { name:"Luxury Drive GH",  industry:"Luxury Cars",          address:"Airport Res, Accra",   phone:"+233 20 111 0007" },
  swapzonemotors: { name:"SwapZone Motors",  industry:"Car Swap",             address:"Spintex, Accra",       phone:"+233 20 111 0008" },
};

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function RevealDiv({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.style.opacity = "1"; el.style.transform = "translateY(0)"; obs.disconnect(); }
    }, { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: 0, transform: "translateY(24px)", transition: `opacity 0.55s ${delay}ms ease, transform 0.55s ${delay}ms ease`, ...style }}>
      {children}
    </div>
  );
}

export default function DealerPage() {
  const router = useRouter();
  const { slug } = useParams() as { slug: string };
  const { dark, setDark } = useTheme();

  const [dealer,   setDealer]   = useState<Partial<Company> | null>(null);
  const [tab,      setTab]      = useState<ServiceTab>("all");
  const [search,   setSearch]   = useState("");
  const [notFound, setNotFound] = useState(false);
  const [realCars, setRealCars] = useState<CompanyCar[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAAS_STORAGE.companies);
      if (raw) {
        const companies: Company[] = JSON.parse(raw);
        const found = companies.find(c => c.slug === slug);
        if (found) {
          setDealer(found);
          try {
            const carsRaw = localStorage.getItem(SAAS_STORAGE.cars);
            if (carsRaw) {
              const allCars: CompanyCar[] = JSON.parse(carsRaw);
              setRealCars(allCars.filter(c => c.companyId === found.id));
            }
          } catch {}
          return;
        }
      }
    } catch {}
    if (MOCK_DB[slug]) { setDealer(MOCK_DB[slug]); return; }
    setNotFound(true);
  }, [slug]);

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const ACC    = dark ? "#ffffff" : "#111111";
  const ACC_FG = dark ? "#000000" : "#ffffff";
  const BG     = dark ? "#0a0a0a" : "#f5f5f5";
  const CARD   = dark ? "#141414" : "#ffffff";
  const BORDER = dark ? "rgba(255,255,255,0.08)" : "#e8e8e8";
  const MUTED  = dark ? "rgba(255,255,255,0.42)" : "#888888";
  const HEAD   = dark ? "#f0f0f0" : "#111111";
  const SUBTLE = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";
  const NAVBG  = dark ? "rgba(10,10,10,0.92)" : "rgba(255,255,255,0.92)";

  // ── Unified car shape ─────────────────────────────────────────────────────
  type DisplayCar = {
    key: string; name: string; spec: string; fuel: string; transmission: string;
    bodyType: string; seats: number; year: number; service: ServiceTab;
    price: number; currency: string; imageUrl: string; status: string; isReal: boolean;
    rating?: number; reviews?: number;
  };

  const displayCars: DisplayCar[] = realCars.length > 0
    ? realCars.map(c => ({
        key: c.id, name: c.name, spec: c.spec, fuel: c.fuel,
        transmission: c.transmission, bodyType: c.bodyType,
        seats: c.seats, year: c.year, service: c.serviceType as ServiceTab,
        price: c.price, currency: c.currency,
        imageUrl: c.imageUrl, status: c.status, isReal: true,
      }))
    : (() => {
        const carIds    = SLUG_CAR_MAP[slug] ?? CARS.slice(0, 6).map(c => c.id);
        const dealerCars = CARS.filter(c => carIds.includes(c.id));
        const services: ServiceTab[] = ["rental", "sale", "swap"];
        const SALE_PRICES: Record<number, number> = {
          1:152000,2:98000,3:165000,4:136000,5:318000,6:142000,
          7:416000,8:125000,9:188000,10:232000,11:269000,12:385000,13:310000,
        };
        return dealerCars.map((c, i) => ({
          key: String(c.id), name: c.name, spec: c.spec, fuel: c.fuel,
          transmission: c.transmission, bodyType: c.type,
          seats: c.seats ?? 5, year: 2022,
          service: services[i % 3],
          price: services[i % 3] === "rental" ? c.price * 6 : (SALE_PRICES[c.id] ?? 120000),
          currency: "GHS", imageUrl: c.image, status: "available", isReal: false,
          rating: c.rating, reviews: c.reviews,
        }));
      })();

  const filtered = displayCars.filter(c => {
    const matchTab = tab === "all" || c.service === tab;
    const q = search.toLowerCase();
    const matchQ = !q || c.name.toLowerCase().includes(q) || c.bodyType.toLowerCase().includes(q) || c.fuel.toLowerCase().includes(q);
    return matchTab && matchQ;
  });

  const rentalCount = displayCars.filter(c => c.service === "rental").length;
  const saleCount   = displayCars.filter(c => c.service === "sale").length;
  const swapCount   = displayCars.filter(c => c.service === "swap").length;
  const serviceCount = [rentalCount, saleCount, swapCount].filter(n => n > 0).length;

  if (notFound) return (
    <div style={{ minHeight:"100vh", background:BG, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ fontSize:15, fontWeight:700, color:HEAD, marginBottom:8 }}>Dealership not found</div>
      <div style={{ fontSize:13, color:MUTED, marginBottom:24 }}>This dealer may not be registered on EliteDriveMotors.</div>
      <button onClick={() => router.push("/dealers")} style={{ padding:"10px 24px", borderRadius:9, border:"none", background:ACC, color:ACC_FG, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Browse All Dealers</button>
    </div>
  );

  if (!dealer) return <div style={{ minHeight:"100vh", background:BG }} />;

  const logoDataUrl = (dealer as any).logoDataUrl as string | undefined;
  const dealerName  = dealer.name ?? "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:${BG};font-family:'DM Sans',sans-serif;color:${HEAD}}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:${dark?"rgba(255,255,255,0.14)":"#ddd"};border-radius:4px}
        input{outline:none;font-family:'DM Sans',sans-serif}
        input::placeholder{color:${MUTED}}
        input:focus{border-color:${ACC}!important}
        @keyframes heroFade{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
        @keyframes heroFade2{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
        .hero-1{animation:heroFade 0.7s ease both}
        .hero-2{animation:heroFade2 0.7s 0.15s ease both}
        .hero-3{animation:heroFade2 0.7s 0.28s ease both}
        .car-card{transition:transform 0.22s,box-shadow 0.22s,border-color 0.22s}
        .car-card:hover{transform:translateY(-6px);box-shadow:0 20px 48px rgba(0,0,0,0.14);border-color:${ACC}!important}
        .svc-card{transition:transform 0.2s,border-color 0.2s,background 0.2s}
        .svc-card:hover{transform:translateY(-4px);border-color:${ACC}!important}
        .tab-btn{transition:all 0.15s;cursor:pointer;font-family:'DM Sans',sans-serif}
        .cta-btn{transition:opacity 0.15s,transform 0.15s}
        .cta-btn:hover{opacity:0.85;transform:translateY(-2px)}
        @media(max-width:700px){
          .hero-meta{flex-direction:column!important;align-items:flex-start!important}
          .hero-actions{flex-direction:column!important;width:100%!important}
          .hero-actions a,.hero-actions button{width:100%!important;text-align:center!important;justify-content:center!important}
          .stats-row{gap:20px!important}
          .svc-grid{grid-template-columns:1fr!important}
          .car-grid{grid-template-columns:1fr 1fr!important;gap:12px!important}
          .filter-bar{flex-direction:column!important;align-items:stretch!important}
          .tab-group{overflow-x:auto;padding-bottom:4px}
          .cta-section{flex-direction:column!important;text-align:center!important}
        }
        @media(max-width:480px){
          .car-grid{grid-template-columns:1fr!important}
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, height:58, background:NAVBG, backdropFilter:"blur(18px)", WebkitBackdropFilter:"blur(18px)", borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", padding:"0 clamp(16px,4vw,56px)", gap:10 }}>
        <div onClick={() => router.push("/")} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", flexShrink:0 }}>
          <div style={{ width:28, height:28, borderRadius:7, background:ACC, display:"flex", alignItems:"center", justifyContent:"center" }}>{Ic.CarLogo(ACC_FG)}</div>
          <span style={{ fontSize:11, fontWeight:800, color:HEAD, letterSpacing:2 }}>ELITE DRIVE</span>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink:0 }}><path d="M9 18l6-6-6-6" stroke={MUTED} strokeWidth="2" strokeLinecap="round"/></svg>
        <span onClick={() => router.push("/dealers")} style={{ fontSize:12, color:MUTED, cursor:"pointer", fontWeight:600, flexShrink:0 }}>Dealers</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink:0 }}><path d="M9 18l6-6-6-6" stroke={MUTED} strokeWidth="2" strokeLinecap="round"/></svg>
        <span style={{ fontSize:12, color:HEAD, fontWeight:700, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{dealerName}</span>
        <div style={{ flex:1 }} />
        {dealer.phone && (
          <a href={`tel:${dealer.phone}`} style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:8, border:`1px solid ${BORDER}`, background:"transparent", color:MUTED, fontSize:12, fontWeight:600, textDecoration:"none", flexShrink:0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 013 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 17.92z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
            <span style={{ display:"none" }} className="nav-phone-text">Call</span>
          </a>
        )}
        <button onClick={() => router.push("/customer/login")} style={{ padding:"7px 16px", borderRadius:8, border:"none", background:ACC, color:ACC_FG, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", flexShrink:0 }}>Book Now</button>
        <button onClick={() => setDark(!dark)} style={{ width:34, height:34, borderRadius:8, border:`1px solid ${BORDER}`, background:SUBTLE, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
          {dark ? Ic.Sun(MUTED) : Ic.Moon(MUTED)}
        </button>
      </nav>

      <div style={{ paddingTop:58 }}>

        {/* ── HERO ── */}
        <div style={{ position:"relative", background: dark ? "#0d0d0d" : "#111111", overflow:"hidden", minHeight:380, display:"flex", alignItems:"center" }}>
          {/* Background pattern */}
          <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(circle at 20% 50%, ${dark?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.06)"} 0%, transparent 60%), radial-gradient(circle at 80% 20%, ${dark?"rgba(255,255,255,0.03)":"rgba(255,255,255,0.04)"} 0%, transparent 50%)`, pointerEvents:"none" }}/>
          {/* Decorative line grid */}
          <div style={{ position:"absolute", inset:0, backgroundImage:`linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`, backgroundSize:"60px 60px", pointerEvents:"none" }}/>

          <div style={{ position:"relative", zIndex:1, maxWidth:1100, margin:"0 auto", padding:"60px clamp(20px,5vw,80px)", width:"100%", display:"flex", alignItems:"center", gap:40, flexWrap:"wrap" }}>
            {/* Left: branding */}
            <div style={{ flex:1, minWidth:280 }}>
              {/* Verified badge */}
              <div className="hero-1" style={{ display:"inline-flex", alignItems:"center", gap:7, background:"rgba(16,185,129,0.12)", border:"1px solid rgba(16,185,129,0.3)", borderRadius:20, padding:"4px 12px", marginBottom:20 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round"/></svg>
                <span style={{ fontSize:10, fontWeight:700, color:"#10B981", letterSpacing:0.5 }}>VERIFIED DEALERSHIP</span>
              </div>

              <div className="hero-1" style={{ display:"flex", alignItems:"center", gap:18, marginBottom:20, flexWrap:"wrap" }}>
                {/* Logo */}
                <div style={{ width:72, height:72, borderRadius:18, background: logoDataUrl ? "transparent" : "rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.15)", overflow:"hidden", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {logoDataUrl
                    ? <img src={logoDataUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    : <span style={{ fontSize:24, fontWeight:900, color:"#ffffff" }}>{initials(dealerName)}</span>}
                </div>
                <div>
                  <h1 style={{ fontSize:"clamp(26px,4vw,44px)", fontWeight:900, color:"#ffffff", lineHeight:1.1, marginBottom:6 }}>{dealerName}</h1>
                  {dealer.industry && <div style={{ fontSize:13, color:"rgba(255,255,255,0.55)", fontWeight:500 }}>{dealer.industry}</div>}
                </div>
              </div>

              {/* Meta info */}
              <div className="hero-2 hero-meta" style={{ display:"flex", alignItems:"center", gap:18, flexWrap:"wrap", marginBottom:28 }}>
                {dealer.address && (
                  <span style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"rgba(255,255,255,0.5)" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.6"/></svg>
                    {dealer.address}
                  </span>
                )}
                {dealer.phone && (
                  <span style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"rgba(255,255,255,0.5)" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 013 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 17.92z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                    {dealer.phone}
                  </span>
                )}
                {dealer.website && (
                  <a href={dealer.website} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"rgba(255,255,255,0.5)", textDecoration:"none" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                    Website
                  </a>
                )}
              </div>

              {/* CTA buttons */}
              <div className="hero-3 hero-actions" style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                <button className="cta-btn" onClick={() => router.push("/customer/login")}
                  style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 26px", borderRadius:10, border:"none", background:"#ffffff", color:"#111111", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  Browse Fleet
                </button>
                {dealer.phone && (
                  <a className="cta-btn" href={`tel:${dealer.phone}`}
                    style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 26px", borderRadius:10, border:"1px solid rgba(255,255,255,0.2)", background:"rgba(255,255,255,0.08)", color:"#ffffff", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", textDecoration:"none" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 013 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 17.92z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                    Call Dealer
                  </a>
                )}
              </div>
            </div>

            {/* Right: stat cards */}
            <div className="hero-3" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, minWidth:220 }}>
              {[
                { label:"Cars Listed",    value: displayCars.length, icon:"🚗" },
                { label:"Service Types",  value: serviceCount,       icon:"⚡" },
                { label:"Available Now",  value: displayCars.filter(c=>c.status==="available").length, icon:"✓" },
                { label:"Platform",       value: "Verified",         icon:"★" },
              ].map(s => (
                <div key={s.label} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, padding:"16px 18px" }}>
                  <div style={{ fontSize:22, fontWeight:900, color:"#ffffff", lineHeight:1 }}>{s.value}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", marginTop:5 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SERVICES STRIP ── */}
        {serviceCount > 1 && (
          <div style={{ background:CARD, borderBottom:`1px solid ${BORDER}` }}>
            <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 clamp(20px,5vw,80px)" }}>
              <div className="svc-grid" style={{ display:"grid", gridTemplateColumns:`repeat(${serviceCount},1fr)`, gap:0 }}>
                {rentalCount > 0 && (
                  <button onClick={() => setTab("rental")}
                    style={{ display:"flex", alignItems:"center", gap:14, padding:"20px 24px", border:"none", background:"transparent", borderRight:`1px solid ${BORDER}`, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", textAlign:"left", transition:"background 0.15s" }}
                    onMouseEnter={e=>(e.currentTarget.style.background=SUBTLE)}
                    onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                    <div style={{ width:40, height:40, borderRadius:10, background:tab==="rental"?ACC:SUBTLE, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"background 0.15s" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 17H3a2 2 0 01-2-2v-5l2.5-5h13l2.5 5v5a2 2 0 01-2 2h-2M7 17a2 2 0 104 0 2 2 0 00-4 0zm6 0a2 2 0 104 0 2 2 0 00-4 0z" stroke={tab==="rental"?ACC_FG:MUTED} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:HEAD }}>Car Rental</div>
                      <div style={{ fontSize:11, color:MUTED }}>{rentalCount} vehicle{rentalCount!==1?"s":""} available</div>
                    </div>
                  </button>
                )}
                {saleCount > 0 && (
                  <button onClick={() => setTab("sale")}
                    style={{ display:"flex", alignItems:"center", gap:14, padding:"20px 24px", border:"none", background:"transparent", borderRight:`1px solid ${BORDER}`, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", textAlign:"left", transition:"background 0.15s" }}
                    onMouseEnter={e=>(e.currentTarget.style.background=SUBTLE)}
                    onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                    <div style={{ width:40, height:40, borderRadius:10, background:tab==="sale"?ACC:SUBTLE, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"background 0.15s" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" stroke={tab==="sale"?ACC_FG:MUTED} strokeWidth="1.7" strokeLinecap="round"/><circle cx="7" cy="7" r="1.5" fill={tab==="sale"?ACC_FG:MUTED}/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:HEAD }}>Cars for Sale</div>
                      <div style={{ fontSize:11, color:MUTED }}>{saleCount} listing{saleCount!==1?"s":""}</div>
                    </div>
                  </button>
                )}
                {swapCount > 0 && (
                  <button onClick={() => setTab("swap")}
                    style={{ display:"flex", alignItems:"center", gap:14, padding:"20px 24px", border:"none", background:"transparent", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", textAlign:"left", transition:"background 0.15s" }}
                    onMouseEnter={e=>(e.currentTarget.style.background=SUBTLE)}
                    onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                    <div style={{ width:40, height:40, borderRadius:10, background:tab==="swap"?ACC:SUBTLE, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"background 0.15s" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M7 16H3v-4M17 8h4v4M3 12a9 9 0 0114-7.46M21 12a9 9 0 01-14 7.46" stroke={tab==="swap"?ACC_FG:MUTED} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:HEAD }}>Car Swap</div>
                      <div style={{ fontSize:11, color:MUTED }}>{swapCount} offer{swapCount!==1?"s":""}</div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── CAR INVENTORY ── */}
        <div style={{ padding:"44px clamp(16px,5vw,80px) 60px", maxWidth:1200, margin:"0 auto" }}>
          <RevealDiv>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:12 }}>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:1.5, textTransform:"uppercase", marginBottom:6 }}>Our Inventory</div>
                <h2 style={{ fontSize:"clamp(22px,3vw,32px)", fontWeight:800, color:HEAD }}>
                  {tab === "all" ? "Full Fleet" : tab === "rental" ? "Available for Rent" : tab === "sale" ? "Cars for Sale" : "Swap Offers"}
                  <span style={{ fontSize:14, fontWeight:500, color:MUTED, marginLeft:12 }}>{filtered.length} vehicle{filtered.length!==1?"s":""}</span>
                </h2>
              </div>
            </div>
          </RevealDiv>

          {/* Filter bar */}
          <RevealDiv delay={60}>
            <div className="filter-bar" style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28, flexWrap:"wrap" }}>
              <div className="tab-group" style={{ display:"flex", gap:6 }}>
                {(["all","rental","sale","swap"] as ServiceTab[]).map(t => (
                  <button key={t} className="tab-btn" onClick={() => setTab(t)}
                    style={{ padding:"8px 18px", borderRadius:20, border:`1.5px solid ${tab===t?ACC:BORDER}`, background:tab===t?ACC:"transparent", color:tab===t?ACC_FG:MUTED, fontSize:12, fontWeight:tab===t?700:500, whiteSpace:"nowrap" as const }}>
                    {t === "all" ? `All (${displayCars.length})` : t === "rental" ? `Rental (${rentalCount})` : t === "sale" ? `For Sale (${saleCount})` : `Swap (${swapCount})`}
                  </button>
                ))}
              </div>
              <div style={{ flex:1, minWidth:180, position:"relative" }}>
                <div style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>{Ic.Search(MUTED)}</div>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, type, fuel…"
                  style={{ width:"100%", padding:"9px 12px 9px 36px", borderRadius:10, border:`1.5px solid ${BORDER}`, background:CARD, color:HEAD, fontSize:12, boxSizing:"border-box" as const }} />
              </div>
            </div>
          </RevealDiv>

          {/* Car grid */}
          <div className="car-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:20 }}>
            {filtered.map((car, i) => {
              const serviceColor = car.service === "rental" ? "#6366f1" : car.service === "sale" ? "#10B981" : "#F59E0B";
              const serviceLabel = car.service === "rental" ? "For Rent" : car.service === "sale" ? "For Sale" : "For Swap";
              return (
                <RevealDiv key={car.key} delay={i * 45}>
                  <div className="car-card" style={{ background:CARD, borderRadius:18, border:`1px solid ${BORDER}`, overflow:"hidden", display:"flex", flexDirection:"column" }}>
                    {/* Image */}
                    <div style={{ position:"relative", height:190, overflow:"hidden", background:SUBTLE }}>
                      {car.isReal ? (
                        <img src={car.imageUrl} alt={car.name}
                          style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.4s" }}
                          onMouseEnter={e => (e.currentTarget.style.transform="scale(1.07)")}
                          onMouseLeave={e => (e.currentTarget.style.transform="scale(1)")}
                          onError={e => { (e.target as HTMLImageElement).src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='190'%3E%3Crect fill='%23222' width='280' height='190'/%3E%3Ctext fill='%23555' font-size='13' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E"; }} />
                      ) : (
                        <Image src={car.imageUrl} alt={car.name} fill sizes="320px"
                          style={{ objectFit:"cover", transition:"transform 0.4s" }}
                          onMouseEnter={e => (e.currentTarget.style.transform="scale(1.07)")}
                          onMouseLeave={e => (e.currentTarget.style.transform="scale(1)")} />
                      )}
                      {/* Gradient overlay */}
                      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)", pointerEvents:"none" }} />
                      {/* Service badge */}
                      <div style={{ position:"absolute", top:12, left:12, fontSize:10, fontWeight:700, padding:"4px 11px", borderRadius:20, background:`${serviceColor}CC`, color:"#fff", backdropFilter:"blur(6px)", letterSpacing:0.3 }}>
                        {serviceLabel}
                      </div>
                      {/* Status badge */}
                      {car.status !== "available" && (
                        <div style={{ position:"absolute", top:12, right:12, fontSize:10, fontWeight:700, padding:"4px 11px", borderRadius:20, background:"rgba(0,0,0,0.75)", color: car.status==="booked"?"#F59E0B":"#EF4444", backdropFilter:"blur(6px)" }}>
                          {car.status.charAt(0).toUpperCase()+car.status.slice(1)}
                        </div>
                      )}
                      {/* Price pinned to bottom of image */}
                      <div style={{ position:"absolute", bottom:12, left:12 }}>
                        <div style={{ fontSize:18, fontWeight:900, color:"#fff", lineHeight:1 }}>
                          GHS {car.price.toLocaleString()}
                          {car.service === "rental" && <span style={{ fontSize:11, fontWeight:500, opacity:0.75 }}>/day</span>}
                        </div>
                      </div>
                      {/* Rating */}
                      {!car.isReal && car.rating != null && (
                        <div style={{ position:"absolute", bottom:12, right:12, display:"flex", alignItems:"center", gap:4, background:"rgba(0,0,0,0.6)", borderRadius:20, padding:"3px 8px", backdropFilter:"blur(4px)" }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="#F59E0B"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          <span style={{ fontSize:11, fontWeight:700, color:"#fff" }}>{car.rating}</span>
                          <span style={{ fontSize:10, color:"rgba(255,255,255,0.6)" }}>({car.reviews})</span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div style={{ padding:"16px 18px", flex:1, display:"flex", flexDirection:"column", gap:10 }}>
                      <div>
                        <div style={{ fontSize:15, fontWeight:800, color:HEAD, marginBottom:3, lineHeight:1.2 }}>{car.name}</div>
                        {car.spec && <div style={{ fontSize:11, color:MUTED, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const }}>{car.spec}</div>}
                      </div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                        {[car.bodyType, car.fuel, car.transmission, `${car.seats} seats`, String(car.year)].map(tag => (
                          <span key={tag} style={{ fontSize:10, padding:"3px 9px", borderRadius:20, background:SUBTLE, color:MUTED, border:`1px solid ${BORDER}` }}>{tag}</span>
                        ))}
                      </div>
                      {/* Action */}
                      <button onClick={() => router.push("/customer/login")}
                        style={{ width:"100%", padding:"10px 0", borderRadius:10, border:"none", background:car.status==="available"?ACC:BORDER, color:car.status==="available"?ACC_FG:MUTED, fontSize:13, fontWeight:700, cursor:car.status==="available"?"pointer":"default", fontFamily:"'DM Sans',sans-serif", marginTop:"auto", transition:"opacity 0.15s" }}
                        onMouseEnter={e=>{ if(car.status==="available") e.currentTarget.style.opacity="0.85"; }}
                        onMouseLeave={e=>(e.currentTarget.style.opacity="1")}>
                        {car.status === "available" ? (car.service === "rental" ? "Book Rental" : car.service === "sale" ? "Enquire to Buy" : "Request Swap") : car.status.charAt(0).toUpperCase()+car.status.slice(1)}
                      </button>
                    </div>
                  </div>
                </RevealDiv>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div style={{ padding:"80px 0", textAlign:"center" }}>
              <div style={{ fontSize:40, marginBottom:12, opacity:0.3 }}>🚗</div>
              <div style={{ fontSize:15, fontWeight:700, color:HEAD, marginBottom:8 }}>No vehicles match your filter</div>
              <div style={{ fontSize:13, color:MUTED, marginBottom:20 }}>Try a different service type or clear your search</div>
              <button onClick={() => { setTab("all"); setSearch(""); }} style={{ padding:"9px 22px", borderRadius:9, border:`1px solid ${BORDER}`, background:"transparent", color:HEAD, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Clear Filters</button>
            </div>
          )}
        </div>

        {/* ── WHY CHOOSE US ── */}
        <div style={{ background:CARD, borderTop:`1px solid ${BORDER}`, borderBottom:`1px solid ${BORDER}`, padding:"60px clamp(16px,5vw,80px)" }}>
          <div style={{ maxWidth:1100, margin:"0 auto" }}>
            <RevealDiv>
              <div style={{ textAlign:"center", marginBottom:44 }}>
                <div style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:1.5, textTransform:"uppercase", marginBottom:10 }}>Why Choose Us</div>
                <h2 style={{ fontSize:"clamp(22px,3vw,34px)", fontWeight:900, color:HEAD }}>Your trusted car partner in Ghana</h2>
              </div>
            </RevealDiv>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:20 }}>
              {[
                { icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" stroke="#10B981" strokeWidth="1.7" strokeLinecap="round"/></svg>, title:"Verified & Trusted", desc:"Every dealership on our platform is reviewed and verified for quality assurance." },
                { icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#6366f1" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>, title:"Secure Bookings", desc:"All transactions and bookings are handled securely through the EliteDriveMotors platform." },
                { icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#F59E0B" strokeWidth="1.7"/><path d="M12 6v6l4 2" stroke="#F59E0B" strokeWidth="1.7" strokeLinecap="round"/></svg>, title:"Quick Response", desc:"Get responses fast — most dealers reply within the hour during business hours." },
                { icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9M17 13l2 9M9 21h6" stroke="#EF4444" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>, title:"Wide Selection", desc:"Browse rental, sale, and swap options all in one place with detailed specs." },
              ].map((f, i) => (
                <RevealDiv key={f.title} delay={i*70}>
                  <div style={{ background:BG, borderRadius:16, border:`1px solid ${BORDER}`, padding:"24px 22px" }}>
                    <div style={{ width:46, height:46, borderRadius:12, background:SUBTLE, border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
                      {f.icon}
                    </div>
                    <div style={{ fontSize:14, fontWeight:700, color:HEAD, marginBottom:8 }}>{f.title}</div>
                    <div style={{ fontSize:12, color:MUTED, lineHeight:1.7 }}>{f.desc}</div>
                  </div>
                </RevealDiv>
              ))}
            </div>
          </div>
        </div>

        {/* ── CONTACT CTA BANNER ── */}
        <RevealDiv>
          <div style={{ background: dark?"#111111":"#111111", padding:"60px clamp(20px,5vw,80px)" }}>
            <div style={{ maxWidth:800, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", gap:28, flexWrap:"wrap" }} className="cta-section">
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.4)", letterSpacing:1.5, textTransform:"uppercase", marginBottom:10 }}>Ready to drive?</div>
                <h2 style={{ fontSize:"clamp(22px,3vw,36px)", fontWeight:900, color:"#ffffff", lineHeight:1.2, marginBottom:10 }}>
                  Find your perfect car<br/>with {dealerName}
                </h2>
                <p style={{ fontSize:13, color:"rgba(255,255,255,0.5)", lineHeight:1.7 }}>
                  Browse the full fleet, make enquiries, and book instantly through our secure platform.
                </p>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:12, flexShrink:0, minWidth:200 }}>
                <button className="cta-btn" onClick={() => router.push("/customer/login")}
                  style={{ padding:"13px 28px", borderRadius:10, border:"none", background:"#ffffff", color:"#111111", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                  Book Now
                </button>
                {dealer.phone && (
                  <a className="cta-btn" href={`tel:${dealer.phone}`}
                    style={{ padding:"12px 28px", borderRadius:10, border:"1px solid rgba(255,255,255,0.2)", background:"transparent", color:"rgba(255,255,255,0.8)", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", textDecoration:"none", textAlign:"center" }}>
                    {dealer.phone}
                  </a>
                )}
              </div>
            </div>
          </div>
        </RevealDiv>

        {/* ── FOOTER ── */}
        <footer style={{ background: dark?"#0d0d0d":"#111111", borderTop:`1px solid rgba(255,255,255,0.07)`, padding:"48px clamp(20px,5vw,80px) 28px" }}>
          <div style={{ maxWidth:1100, margin:"0 auto" }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:40, marginBottom:40 }}>

              {/* Dealer info */}
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                  <div style={{ width:38, height:38, borderRadius:10, background: logoDataUrl?"transparent":"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.12)", overflow:"hidden", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {logoDataUrl
                      ? <img src={logoDataUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                      : <span style={{ fontSize:13, fontWeight:900, color:"#fff" }}>{initials(dealerName)}</span>}
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:800, color:"#ffffff" }}>{dealerName}</div>
                    {dealer.industry && <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>{dealer.industry}</div>}
                  </div>
                </div>
                {dealer.address && <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)", lineHeight:1.7, marginBottom:8 }}>{dealer.address}</div>}
                {dealer.phone && (
                  <a href={`tel:${dealer.phone}`} style={{ fontSize:12, color:"rgba(255,255,255,0.45)", textDecoration:"none", display:"flex", alignItems:"center", gap:6 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 013 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 17.92z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                    {dealer.phone}
                  </a>
                )}
              </div>

              {/* Fleet */}
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.3)", letterSpacing:1.2, textTransform:"uppercase", marginBottom:16 }}>Our Fleet</div>
                {[
                  rentalCount > 0 && `${rentalCount} Rental Vehicle${rentalCount!==1?"s":""}`,
                  saleCount   > 0 && `${saleCount} Car${saleCount!==1?"s":""} for Sale`,
                  swapCount   > 0 && `${swapCount} Swap Offer${swapCount!==1?"s":""}`,
                ].filter(Boolean).map(label => (
                  <div key={String(label)} style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginBottom:10, lineHeight:1.5 }}>{label}</div>
                ))}
              </div>

              {/* Quick Links */}
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.3)", letterSpacing:1.2, textTransform:"uppercase", marginBottom:16 }}>Quick Links</div>
                {[
                  { label:"Browse All Dealers", action:()=>router.push("/dealers") },
                  { label:"Sign In / Register",  action:()=>router.push("/customer/login") },
                  { label:"Book a Vehicle",      action:()=>router.push("/customer/login") },
                  { label:"Home",                action:()=>router.push("/") },
                ].map(l => (
                  <button key={l.label} onClick={l.action}
                    style={{ display:"block", fontSize:12, color:"rgba(255,255,255,0.4)", background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", padding:"0 0 10px", textAlign:"left", transition:"color 0.15s" }}
                    onMouseEnter={e=>(e.currentTarget.style.color="rgba(255,255,255,0.85)")}
                    onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.4)")}>
                    {l.label}
                  </button>
                ))}
              </div>

              {/* Platform */}
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.3)", letterSpacing:1.2, textTransform:"uppercase", marginBottom:16 }}>Platform</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)", lineHeight:1.8, marginBottom:16 }}>
                  Powered by EliteDriveMotors — Ghana's premier car dealership platform.
                </div>
                <button onClick={() => router.push("/onboarding")}
                  style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"8px 16px", borderRadius:8, border:"1px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.6)", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"border-color 0.15s,color 0.15s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,0.3)"; e.currentTarget.style.color="#fff"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,0.15)"; e.currentTarget.style.color="rgba(255,255,255,0.6)"; }}>
                  <div style={{ width:18, height:18, borderRadius:5, background:"rgba(255,255,255,0.12)", display:"flex", alignItems:"center", justifyContent:"center" }}>{Ic.CarLogo("rgba(255,255,255,0.7)")}</div>
                  List your dealership
                </button>
              </div>
            </div>

            {/* Bottom bar */}
            <div style={{ borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:20, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.25)" }}>
                © {new Date().getFullYear()} {dealerName}. Powered by <span style={{ color:"rgba(255,255,255,0.4)", fontWeight:600 }}>EliteDriveMotors</span>.
              </div>
              <div style={{ display:"flex", gap:16 }}>
                {[
                  { label:"Privacy", href:"#" },
                  { label:"Terms",   href:"#" },
                  { label:"Support", href:"#" },
                ].map(l => (
                  <a key={l.label} href={l.href} style={{ fontSize:11, color:"rgba(255,255,255,0.25)", textDecoration:"none", transition:"color 0.15s" }}
                    onMouseEnter={e=>(e.currentTarget.style.color="rgba(255,255,255,0.6)")}
                    onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.25)")}>
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
