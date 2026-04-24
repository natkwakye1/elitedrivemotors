"use client";
// src/app/page.tsx — Elite Drive Motors public landing page

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Ic } from "@/src/components/ui/Icons";
import { CARS } from "@/src/lib/data/cars";
import { useTheme } from "@/src/context/ThemeContext";

const SERVICES = [
  { icon: (c: string) => Ic.Rentals(c), title: "Rent a Car",     desc: "Flexible daily, weekly or monthly rentals. Pick up anywhere in Accra — same day availability on most vehicles.", cta: "Browse Rentals", href: "/customer/rent-car"  },
  { icon: (c: string) => Ic.Buy(c),     title: "Buy a Car",      desc: "Certified pre-owned and brand-new vehicles. Full inspection reports, warranty included, easy financing options.",   cta: "Cars for Sale",  href: "/customer/buy-car"   },
  { icon: (c: string) => Ic.Swap(c),    title: "Swap Your Car",  desc: "Trade your current vehicle for something new. Our swap program gives you fair value and a seamless upgrade.",       cta: "Start a Swap",   href: "/customer/swap-car"  },
  { icon: (c: string) => Ic.Map(c),     title: "Live Tracking",  desc: "Know where your rental is at all times. Real-time GPS tracking, driver info, and live ETA — all from your phone.",  cta: "View Live Map",  href: "/customer/live-map"  },
];

const STATS = [
  { value: "500+", label: "Cars in Fleet"     },
  { value: "12k+", label: "Happy Customers"   },
  { value: "4",    label: "Cities in Ghana"   },
  { value: "98%",  label: "Satisfaction Rate" },
];

const STEPS = [
  { n: "01", title: "Create Your Account", desc: "Sign up in under 2 minutes. No paperwork, no long forms — just your email and you're in." },
  { n: "02", title: "Pick Your Car",        desc: "Browse our fleet, filter by type, price and availability, then select your perfect match." },
  { n: "03", title: "Drive & Enjoy",        desc: "Confirm your booking, pick up your car or have it delivered, and hit the road." },
];

const TESTIMONIALS = [
  { name: "Kwame Asante", role: "Business Executive", text: "Booked a BMW in under 3 minutes. Picked it up the same afternoon. Best car service in Accra, no question.",    initial: "K" },
  { name: "Abena Osei",   role: "Entrepreneur",       text: "The swap program saved me so much stress. Got full value for my old car and drove out with a Tesla the same day.", initial: "A" },
  { name: "Kofi Mensah",  role: "Doctor",             text: "Live tracking gives me peace of mind. I always know exactly where my rental is. Incredibly professional service.",  initial: "K" },
];

const FEATURED_IDS = [1, 7, 10, 3, 5, 11];

export default function LandingPage() {
  const router = useRouter();
  const { dark, setDark } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  // ── Black & White theme tokens ───────────────────────────────────────────
  const BG        = dark ? "#0a0a0a" : "#fafafa";
  const CARD      = dark ? "#141414" : "#ffffff";
  const SECT2     = dark ? "#0f0f0f" : "#f2f2f2";
  const FOOTER_BG = dark ? "#000000" : "#0a0a0a";
  const BORDER    = dark ? "rgba(255,255,255,0.1)"  : "rgba(0,0,0,0.1)";
  const MUTED     = dark ? "rgba(255,255,255,0.42)" : "#777777";
  const SUBTLE    = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const HEAD      = dark ? "#ffffff"  : "#0a0a0a";
  const NAVBG     = dark ? "rgba(10,10,10,0.92)" : "rgba(250,250,250,0.92)";
  const SCROLLT   = dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)";
  const BODY      = dark ? "rgba(255,255,255,0.68)" : "rgba(0,0,0,0.6)";
  const FOOTERTXT = dark ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.35)";

  // Primary accent — white in dark mode, black in light mode
  const ACC  = dark ? "#ffffff"  : "#0a0a0a";
  const ACC2 = dark ? "#e5e5e5"  : "#2a2a2a";   // secondary: slightly lighter/darker
  const ACC3 = dark ? "#9a9a9a"  : "#777777";   // tertiary grey
  const BTN  = dark ? "#0a0a0a"  : "#ffffff";   // text on filled ACC button

  // Service card accent shades (monochromatic)
  const SVC_COLORS = [ACC, ACC2, ACC3, dark ? "#6b6b6b" : "#aaaaaa"];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const featuredCars = CARS.filter(c => FEATURED_IDS.includes(c.id));

  const SALE_PRICES: Record<number, string> = {
    1:"$24,900", 3:"$27,000", 5:"$52,000",
    7:"$68,000", 10:"$38,000", 11:"$44,000",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: ${BG}; font-family: 'DM Sans', sans-serif; color: ${HEAD}; overflow-x: hidden; transition: background 0.25s, color 0.25s; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${SCROLLT}; border-radius: 4px; }
        @keyframes fadeUp   { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes floatCar { 0%,100% { transform: translateY(0px) rotate(-2deg); } 50% { transform: translateY(-14px) rotate(-2deg); } }
        @keyframes pulse    { 0%,100% { opacity:0.4; } 50% { opacity:0.9; } }
        .fade-up   { animation: fadeUp 0.7s ease both; }
        .fade-up-2 { animation: fadeUp 0.7s 0.15s ease both; }
        .fade-up-3 { animation: fadeUp 0.7s 0.3s ease both; }
        .float-car { animation: floatCar 4s ease-in-out infinite; }
        .nav-link  { font-size:13px; font-weight:600; color:${MUTED}; text-decoration:none; transition:color 0.15s; cursor:pointer; }
        .nav-link:hover { color:${HEAD}; }
        .service-card { transition: all 0.25s; }
        .service-card:hover { border-color: ${ACC} !important; transform: translateY(-4px); }
        .car-card { transition: all 0.25s; }
        .car-card:hover { transform: translateY(-4px); border-color: ${ACC} !important; }
      `}</style>

      {/* ══ NAVBAR ══════════════════════════════════════════════════════════ */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100, height:64,
        background: scrolled ? NAVBG : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled ? `1px solid ${BORDER}` : "none",
        transition:"all 0.3s",
        display:"flex", alignItems:"center", padding:"0 clamp(20px,5vw,80px)",
      }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:9, cursor:"pointer", flexShrink:0 }}
          onClick={()=>router.push("/")}>
          <div style={{ width:34, height:34, background:ACC, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center" }}>
            {Ic.CarLogo(BTN)}
          </div>
          <div>
            <div style={{ fontSize:11, fontWeight:800, color:HEAD, letterSpacing:2, lineHeight:1.1 }}>ELITE</div>
            <div style={{ fontSize:9, fontWeight:600, color:MUTED, letterSpacing:1.5 }}>DRIVE MOTORS</div>
          </div>
        </div>

        {/* Links */}
        <div style={{ display:"flex", alignItems:"center", gap:28, margin:"0 auto" }}>
          {[["Services","#services"],["Fleet","#fleet"],["How It Works","#how"],["Testimonials","#testimonials"]].map(([label,href])=>(
            <a key={label} className="nav-link" href={href}>{label}</a>
          ))}
        </div>

        {/* Theme toggle + CTAs */}
        <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
          <button onClick={()=>setDark(!dark)}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:20, background:SUBTLE, border:`1px solid ${BORDER}`, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, color:MUTED, transition:"all 0.2s" }}
            onMouseEnter={e=>(e.currentTarget.style.borderColor=ACC)}
            onMouseLeave={e=>(e.currentTarget.style.borderColor=BORDER)}>
            {dark ? (
              <><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="5" stroke={MUTED} strokeWidth="2"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={MUTED} strokeWidth="2" strokeLinecap="round"/></svg>Light</>
            ) : (
              <><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke={MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Dark</>
            )}
          </button>
          <button onClick={()=>router.push("/customer/login")}
            style={{ fontSize:13, fontWeight:600, color:HEAD, background:"transparent", border:`1px solid ${BORDER}`, borderRadius:8, padding:"8px 18px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"border-color 0.15s" }}
            onMouseEnter={e=>(e.currentTarget.style.borderColor=ACC)}
            onMouseLeave={e=>(e.currentTarget.style.borderColor=BORDER)}>
            Sign In
          </button>
          <button onClick={()=>router.push("/customer/login")}
            style={{ fontSize:13, fontWeight:700, color:BTN, background:ACC, border:"none", borderRadius:8, padding:"8px 18px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"opacity 0.15s" }}
            onMouseEnter={e=>(e.currentTarget.style.opacity="0.82")}
            onMouseLeave={e=>(e.currentTarget.style.opacity="1")}>
            Get Started
          </button>
        </div>
      </nav>

      {/* ══ HERO ════════════════════════════════════════════════════════════ */}
      <section style={{ minHeight:"100vh", background:BG, display:"flex", flexDirection:"column", justifyContent:"center", padding:"100px clamp(20px,5vw,80px) 60px", position:"relative", overflow:"hidden" }}>
        {/* subtle glow */}
        <div style={{ position:"absolute", top:"20%", left:"5%", width:500, height:500, borderRadius:"50%", background:`radial-gradient(circle, ${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.04)"} 0%, transparent 70%)`, pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:"10%", right:"5%", width:400, height:400, borderRadius:"50%", background:`radial-gradient(circle, ${dark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.03)"} 0%, transparent 70%)`, pointerEvents:"none" }}/>

        {/* dot grid */}
        <div style={{ position:"absolute", inset:0, opacity:dark?0.06:0.04, pointerEvents:"none" }}>
          <svg width="100%" height="100%">
            <defs><pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill={dark?"white":"black"}/></pattern></defs>
            <rect width="100%" height="100%" fill="url(#dots)"/>
          </svg>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:60, position:"relative", zIndex:1, maxWidth:1200, margin:"0 auto", width:"100%" }}>
          {/* Left copy */}
          <div style={{ flex:1, minWidth:0 }}>
            <div className="fade-up" style={{ display:"inline-flex", alignItems:"center", gap:8, background:SUBTLE, border:`1px solid ${BORDER}`, borderRadius:20, padding:"6px 16px", marginBottom:24 }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:"#10B981", display:"inline-block", animation:"pulse 2s infinite" }}/>
              <span style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:1 }}>NOW SERVING ACCRA & BEYOND</span>
            </div>

            <h1 className="fade-up-2" style={{ fontSize:"clamp(36px,5vw,68px)", fontWeight:900, color:HEAD, lineHeight:1.08, marginBottom:20 }}>
              Ghana's #1<br/>
              <span style={{ color: ACC3 }}>
                Car Platform
              </span>
            </h1>

            <p className="fade-up-3" style={{ fontSize:16, color:MUTED, lineHeight:1.75, maxWidth:480, marginBottom:36 }}>
              Rent, buy, swap and track vehicles — all in one place. From daily rentals to full ownership, we have the car for every journey.
            </p>

            <div className="fade-up-3" style={{ display:"flex", gap:14, flexWrap:"wrap", marginBottom:48 }}>
              <button onClick={()=>router.push("/customer/login")}
                style={{ display:"flex", alignItems:"center", gap:8, padding:"14px 28px", borderRadius:10, border:"none", background:ACC, color:BTN, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"opacity 0.15s" }}
                onMouseEnter={e=>(e.currentTarget.style.opacity="0.82")}
                onMouseLeave={e=>(e.currentTarget.style.opacity="1")}>
                <span style={{ display:"flex" }}>{Ic.Rentals(BTN)}</span>
                Rent a Car Today
              </button>
              <button onClick={()=>router.push("/customer/buy-car")}
                style={{ display:"flex", alignItems:"center", gap:8, padding:"14px 28px", borderRadius:10, border:`1px solid ${BORDER}`, background:"transparent", color:HEAD, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"border-color 0.15s" }}
                onMouseEnter={e=>(e.currentTarget.style.borderColor=ACC)}
                onMouseLeave={e=>(e.currentTarget.style.borderColor=BORDER)}>
                <span style={{ display:"flex", opacity:0.6 }}>{Ic.Buy(HEAD)}</span>
                Browse Cars for Sale
              </button>
            </div>

            {/* trust badges */}
            <div className="fade-up-3" style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
              {["No Hidden Fees","Free Cancellation","24/7 Support"].map(b=>(
                <div key={b} style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <span style={{ width:18, height:18, borderRadius:"50%", background:SUBTLE, border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-4" stroke={HEAD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  <span style={{ fontSize:12, color:MUTED }}>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right car image */}
          <div style={{ flex:"0 0 50%", position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 50% 80%, ${dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.06)"} 0%, transparent 65%)`, pointerEvents:"none" }}/>
            <div className="float-car" style={{ width:"100%", maxWidth:620, position:"relative" }}>
              <Image src="/images/cars/blackbenz.png" alt="Elite Drive Motors" width={620} height={360}
                style={{ width:"100%", height:"auto", objectFit:"contain", filter:`drop-shadow(0 30px 60px ${dark?"rgba(0,0,0,0.7)":"rgba(0,0,0,0.25)"})` }}
                priority/>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ position:"relative", zIndex:1, maxWidth:1200, margin:"60px auto 0", width:"100%" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:1, background:BORDER, borderRadius:16, overflow:"hidden", border:`1px solid ${BORDER}` }}>
            {STATS.map(s=>(
              <div key={s.label} style={{ background:CARD, padding:"24px 28px", textAlign:"center" }}>
                <div style={{ fontSize:32, fontWeight:900, color:HEAD, marginBottom:4 }}>{s.value}</div>
                <div style={{ fontSize:12, color:MUTED, fontWeight:500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SERVICES ════════════════════════════════════════════════════════ */}
      <section id="services" style={{ padding:"80px clamp(20px,5vw,80px)", background:SECT2 }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <div style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:2, marginBottom:12, textTransform:"uppercase" }}>What We Offer</div>
            <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:800, color:HEAD, marginBottom:14 }}>Everything you need<br/>in one platform</h2>
            <p style={{ fontSize:15, color:MUTED, maxWidth:480, margin:"0 auto" }}>Whether you're renting for a day or buying for a lifetime, we've got a service built for you.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:20 }}>
            {SERVICES.map((s,i)=>{
              const col = SVC_COLORS[i];
              return (
                <div key={s.title} className="service-card"
                  style={{ background:CARD, borderRadius:16, border:`1px solid ${BORDER}`, padding:"28px 24px", cursor:"pointer" }}
                  onClick={()=>router.push(s.href)}>
                  <div style={{ width:48, height:48, borderRadius:13, background:SUBTLE, border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:20 }}>
                    <span style={{ display:"flex" }}>{s.icon(col)}</span>
                  </div>
                  <div style={{ fontSize:17, fontWeight:700, color:HEAD, marginBottom:10 }}>{s.title}</div>
                  <p style={{ fontSize:13, color:MUTED, lineHeight:1.7, marginBottom:20 }}>{s.desc}</p>
                  <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, fontWeight:700, color:col }}>
                    {s.cta}
                    <span style={{ display:"flex" }}>{Ic.ChevronRight(col)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════════════════════════ */}
      <section id="how" style={{ padding:"80px clamp(20px,5vw,80px)", background:BG }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <div style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:2, marginBottom:12, textTransform:"uppercase" }}>Simple Process</div>
            <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:800, color:HEAD, marginBottom:14 }}>Drive in 3 easy steps</h2>
            <p style={{ fontSize:15, color:MUTED }}>Getting behind the wheel has never been this simple.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:32 }}>
            {STEPS.map(step=>(
              <div key={step.n}>
                <div style={{ fontSize:56, fontWeight:900, color:ACC3, lineHeight:1 }}>{step.n}</div>
                <div style={{ fontSize:18, fontWeight:700, color:HEAD, marginBottom:10, marginTop:8 }}>{step.title}</div>
                <p style={{ fontSize:14, color:MUTED, lineHeight:1.75 }}>{step.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop:52, display:"flex", justifyContent:"center" }}>
            <button onClick={()=>router.push("/customer/login")}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"14px 32px", borderRadius:10, border:"none", background:ACC, color:BTN, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"opacity 0.15s" }}
              onMouseEnter={e=>(e.currentTarget.style.opacity="0.82")}
              onMouseLeave={e=>(e.currentTarget.style.opacity="1")}>
              <span style={{ display:"flex" }}>{Ic.Booking(BTN)}</span>
              Create Free Account
            </button>
          </div>
        </div>
      </section>

      {/* ══ FEATURED FLEET ══════════════════════════════════════════════════ */}
      <section id="fleet" style={{ padding:"80px clamp(20px,5vw,80px)", background:SECT2 }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:40, flexWrap:"wrap", gap:16 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:2, marginBottom:12, textTransform:"uppercase" }}>Our Fleet</div>
              <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:800, color:HEAD }}>Featured Vehicles</h2>
            </div>
            <button onClick={()=>router.push("/customer/cars")}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 20px", borderRadius:9, border:`1px solid ${BORDER}`, background:"transparent", color:HEAD, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"border-color 0.15s", flexShrink:0 }}
              onMouseEnter={e=>(e.currentTarget.style.borderColor=ACC)}
              onMouseLeave={e=>(e.currentTarget.style.borderColor=BORDER)}>
              View all cars <span style={{ display:"flex" }}>{Ic.ChevronRight(HEAD)}</span>
            </button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:20 }}>
            {featuredCars.map(car=>(
              <div key={car.id} className="car-card"
                style={{ background:CARD, borderRadius:14, border:`1px solid ${BORDER}`, overflow:"hidden", cursor:"pointer" }}
                onClick={()=>router.push("/customer/cars")}>
                <div style={{ position:"relative", height:150, background:dark?"#1a1a1a":"#e8e8e8", overflow:"hidden" }}>
                  <Image src={car.image} alt={car.name} fill sizes="260px" style={{ objectFit:"cover", objectPosition:"center" }}/>
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)", pointerEvents:"none" }}/>
                  <span style={{ position:"absolute", top:10, left:10, fontSize:9, fontWeight:700, color:"#10B981", background:"rgba(16,185,129,0.15)", border:"1px solid rgba(16,185,129,0.3)", borderRadius:20, padding:"3px 9px" }}>Available</span>
                </div>
                <div style={{ padding:"14px 16px" }}>
                  <div style={{ fontSize:14, fontWeight:700, color:HEAD, marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{car.name}</div>
                  <div style={{ fontSize:11, color:MUTED, marginBottom:12, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{car.spec}</div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div>
                      <div style={{ fontSize:9, color:MUTED, marginBottom:1 }}>From</div>
                      <div style={{ fontSize:15, fontWeight:800, color:HEAD }}>${car.price}<span style={{ fontSize:10, color:MUTED, fontWeight:400 }}>/day</span></div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:9, color:MUTED, marginBottom:1 }}>Sale price</div>
                      <div style={{ fontSize:13, fontWeight:700, color:HEAD }}>{SALE_PRICES[car.id] ?? "—"}</div>
                    </div>
                  </div>
                  <div style={{ marginTop:12, display:"flex", gap:6 }}>
                    {[car.fuel, car.transmission, car.type].map(tag=>(
                      <span key={tag} style={{ fontSize:9, fontWeight:600, color:MUTED, background:SUBTLE, borderRadius:6, padding:"3px 8px", border:`1px solid ${BORDER}` }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHY CHOOSE US ═══════════════════════════════════════════════════ */}
      <section style={{ padding:"80px clamp(20px,5vw,80px)", background:BG }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", gap:60, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:280 }}>
            <div style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:2, marginBottom:12, textTransform:"uppercase" }}>Why Elite Drive</div>
            <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:800, color:HEAD, marginBottom:16, lineHeight:1.15 }}>Built for the modern Ghanaian driver</h2>
            <p style={{ fontSize:15, color:MUTED, lineHeight:1.75, marginBottom:32 }}>We combine premium vehicles, technology-driven tracking, and world-class customer service — all at competitive Ghanaian prices.</p>
            <button onClick={()=>router.push("/customer/login")}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"13px 26px", borderRadius:9, border:"none", background:ACC, color:BTN, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"opacity 0.15s" }}
              onMouseEnter={e=>(e.currentTarget.style.opacity="0.82")}
              onMouseLeave={e=>(e.currentTarget.style.opacity="1")}>
              Get Started Free
            </button>
          </div>
          <div style={{ flex:1, minWidth:280, display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {[
              { icon:(c:string)=>Ic.Tracking(c), title:"Real-Time GPS",   desc:"Track every vehicle live from your dashboard or phone."        },
              { icon:(c:string)=>Ic.Payment(c),  title:"Secure Payments", desc:"Mobile Money, card, and bank transfer — all accepted."         },
              { icon:(c:string)=>Ic.Support(c),  title:"24/7 Support",    desc:"Our team is always on call — day, night, or weekend."          },
              { icon:(c:string)=>Ic.License(c),  title:"Verified Fleet",  desc:"Every car is fully inspected, insured and road-certified."     },
              { icon:(c:string)=>Ic.Booking(c),  title:"Instant Booking", desc:"Confirm your rental in under 3 minutes — no queues."           },
              { icon:(c:string)=>Ic.Swap(c),     title:"Easy Trade-In",   desc:"Get a fair valuation and upgrade your car on the spot."        },
            ].map(f=>(
              <div key={f.title} style={{ background:CARD, borderRadius:12, border:`1px solid ${BORDER}`, padding:"18px 16px", transition:"border-color 0.2s" }}
                onMouseEnter={e=>(e.currentTarget.style.borderColor=ACC)}
                onMouseLeave={e=>(e.currentTarget.style.borderColor=BORDER)}>
                <div style={{ width:36, height:36, borderRadius:9, background:SUBTLE, border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12 }}>
                  <span style={{ display:"flex" }}>{f.icon(HEAD)}</span>
                </div>
                <div style={{ fontSize:13, fontWeight:700, color:HEAD, marginBottom:5 }}>{f.title}</div>
                <div style={{ fontSize:11, color:MUTED, lineHeight:1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ════════════════════════════════════════════════════ */}
      <section id="testimonials" style={{ padding:"80px clamp(20px,5vw,80px)", background:SECT2 }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:2, marginBottom:12, textTransform:"uppercase" }}>Testimonials</div>
            <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:800, color:HEAD }}>Trusted by thousands</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:20 }}>
            {TESTIMONIALS.map(t=>(
              <div key={t.name} style={{ background:CARD, borderRadius:16, border:`1px solid ${BORDER}`, padding:"28px 24px", transition:"border-color 0.2s" }}
                onMouseEnter={e=>(e.currentTarget.style.borderColor=ACC)}
                onMouseLeave={e=>(e.currentTarget.style.borderColor=BORDER)}>
                <div style={{ display:"flex", gap:3, marginBottom:18 }}>
                  {[1,2,3,4,5].map(i=>(
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  ))}
                </div>
                <p style={{ fontSize:14, color:BODY, lineHeight:1.75, marginBottom:22, fontStyle:"italic" }}>"{t.text}"</p>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:40, height:40, borderRadius:"50%", background:SUBTLE, border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:HEAD, flexShrink:0 }}>
                    {t.initial}
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:HEAD }}>{t.name}</div>
                    <div style={{ fontSize:11, color:MUTED }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ══════════════════════════════════════════════════════ */}
      <section style={{ padding:"80px clamp(20px,5vw,80px)", background:BG }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ background:ACC, borderRadius:24, padding:"60px clamp(24px,5vw,72px)", textAlign:"center", position:"relative", overflow:"hidden" }}>
            {/* subtle texture */}
            <div style={{ position:"absolute", inset:0, opacity:0.04, pointerEvents:"none" }}>
              <svg width="100%" height="100%">
                <defs><pattern id="dots2" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill={BTN}/></pattern></defs>
                <rect width="100%" height="100%" fill="url(#dots2)"/>
              </svg>
            </div>
            <div style={{ position:"relative", zIndex:1 }}>
              <h2 style={{ fontSize:"clamp(26px,4vw,44px)", fontWeight:900, color:BTN, marginBottom:14, lineHeight:1.15 }}>
                Ready to hit the road?
              </h2>
              <p style={{ fontSize:15, color:dark?"rgba(0,0,0,0.55)":"rgba(255,255,255,0.7)", maxWidth:460, margin:"0 auto 36px", lineHeight:1.75 }}>
                Join thousands of Ghanaians who trust Elite Drive Motors for all their car needs. Sign up free today.
              </p>
              <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
                <button onClick={()=>router.push("/customer/login")}
                  style={{ display:"flex", alignItems:"center", gap:8, padding:"14px 32px", borderRadius:10, border:`2px solid ${BTN}`, background:"transparent", color:BTN, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.background=BTN; e.currentTarget.style.color=ACC; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.color=BTN; }}>
                  <span style={{ display:"flex" }}>{Ic.Booking(BTN)}</span>
                  Start for Free
                </button>
                <button onClick={()=>router.push("/customer/cars")}
                  style={{ display:"flex", alignItems:"center", gap:8, padding:"14px 32px", borderRadius:10, border:`2px solid ${dark?"rgba(0,0,0,0.2)":"rgba(255,255,255,0.3)"}`, background:dark?"rgba(0,0,0,0.08)":"rgba(255,255,255,0.12)", color:BTN, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s" }}>
                  <span style={{ display:"flex", opacity:0.7 }}>{Ic.Vehicles(BTN)}</span>
                  Browse Fleet
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════════════════════ */}
      <footer style={{ background:FOOTER_BG, borderTop:"1px solid rgba(255,255,255,0.06)", padding:"56px clamp(20px,5vw,80px) 32px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:48, marginBottom:48 }}>

            {/* Brand */}
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:16 }}>
                <div style={{ width:34, height:34, background:"#ffffff", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {Ic.CarLogo("#0a0a0a")}
                </div>
                <div>
                  <div style={{ fontSize:11, fontWeight:800, color:"#ffffff", letterSpacing:2, lineHeight:1.1 }}>ELITE</div>
                  <div style={{ fontSize:9, fontWeight:600, color:"rgba(255,255,255,0.35)", letterSpacing:1.5 }}>DRIVE MOTORS</div>
                </div>
              </div>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.38)", lineHeight:1.8, maxWidth:240, marginBottom:20 }}>
                Ghana's complete car platform. Rent, buy, swap and track — all in one place.
              </p>
              <div style={{ display:"flex", gap:10 }}>
                {["F","T","I","L"].map((s,i)=>(
                  <div key={i} style={{ width:32, height:32, borderRadius:8, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.4)", transition:"border-color 0.15s" }}
                    onMouseEnter={e=>(e.currentTarget.style.borderColor="rgba(255,255,255,0.3)")}
                    onMouseLeave={e=>(e.currentTarget.style.borderColor="rgba(255,255,255,0.1)")}>
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"#ffffff", letterSpacing:1.5, marginBottom:16, textTransform:"uppercase" }}>Services</div>
              {[["Rent a Car","/customer/rent-car"],["Buy a Car","/customer/buy-car"],["Swap Your Car","/customer/swap-car"],["Live Tracking","/customer/live-map"],["Browse Fleet","/customer/cars"]].map(([l,h])=>(
                <div key={l} onClick={()=>router.push(h)} style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginBottom:10, cursor:"pointer", transition:"color 0.15s" }}
                  onMouseEnter={e=>(e.currentTarget.style.color="#ffffff")}
                  onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.4)")}>{l}</div>
              ))}
            </div>

            {/* Company */}
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"#ffffff", letterSpacing:1.5, marginBottom:16, textTransform:"uppercase" }}>Company</div>
              {[["About Us","#"],["Careers","#"],["Blog","#"],["Press","#"],["Contact Us","#"]].map(([l,h])=>(
                <div key={l} onClick={()=>router.push(h)} style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginBottom:10, cursor:"pointer", transition:"color 0.15s" }}
                  onMouseEnter={e=>(e.currentTarget.style.color="#ffffff")}
                  onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.4)")}>{l}</div>
              ))}
            </div>

            {/* Contact */}
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"#ffffff", letterSpacing:1.5, marginBottom:16, textTransform:"uppercase" }}>Contact</div>
              {["East Legon, Accra, Ghana","+233 20 000 0000","hello@elitedrivemotors.com","Mon–Sat: 7am – 9pm"].map(c=>(
                <div key={c} style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginBottom:10, lineHeight:1.5 }}>{c}</div>
              ))}
            </div>
          </div>

          <div style={{ borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:24, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
            <div style={{ fontSize:12, color:FOOTERTXT }}>© 2025 Elite Drive Motors. All rights reserved.</div>
            <div style={{ display:"flex", gap:20 }}>
              {["Privacy Policy","Terms of Service","Cookie Policy"].map(l=>(
                <span key={l} style={{ fontSize:12, color:FOOTERTXT, cursor:"pointer", transition:"color 0.15s" }}
                  onMouseEnter={e=>(e.currentTarget.style.color="rgba(255,255,255,0.6)")}
                  onMouseLeave={e=>(e.currentTarget.style.color=FOOTERTXT)}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
