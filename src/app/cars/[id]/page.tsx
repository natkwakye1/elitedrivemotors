"use client";
// src/app/cars/[id]/page.tsx

import { useTheme } from "@/src/context/ThemeContext";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

import AppShell from "@/src/components/layout/Appshell";
import TopBar   from "@/src/components/layout/Topbar";
import { Ic }   from "@/src/components/ui/Icons";
import { CARS } from "@/src/lib/data/cars";

// ─── Extra detail data keyed by car id (not in the CARS list) ─────────────────
// Add more entries as you build out your data layer.
// All values fall back to the "default" entry if no match found.
const EXTRA: Record<number | "default", {
  year: number; mileage: string; color: string; seats: number;
  engine: string; power: string; torque: string;
  topSpeed: string; acceleration: string;
  location: string; description: string; features: string[];
}> = {
  1:  { year:2023, mileage:"12,400 km", color:"Phantom Black",  seats:5, engine:"2.0L TFSI",   power:"249 hp", torque:"370 Nm", topSpeed:"250 km/h", acceleration:"5.8s", location:"Accra Central",  description:"This 2023 Audi A4 TFSI is in pristine condition with full service history. Single owner from new, always dealer maintained. Features Audi MMI navigation, Bang & Olufsen sound, heated seats and panoramic sunroof.", features:["Panoramic Sunroof","Heated Seats","LED Headlights","Navigation","Parking Sensors","Reverse Camera","Cruise Control","Keyless Entry"] },
  2:  { year:2022, mileage:"28,000 km", color:"Pearl White",    seats:5, engine:"2.0L Turbo",   power:"230 hp", torque:"350 Nm", topSpeed:"240 km/h", acceleration:"6.8s", location:"East Legon",     description:"Well-maintained 2022 Opel Insignia Grand Sport. Low mileage, full service history. Features a spacious cabin, advanced driver assistance and premium sound system.", features:["Apple CarPlay","Android Auto","LED Headlights","Parking Sensors","Reverse Camera","Cruise Control","Keyless Entry","Bluetooth"] },
  3:  { year:2023, mileage:"8,200 km",  color:"Midnight Black", seats:5, engine:"2.0L Cooper S", power:"189 hp", torque:"280 Nm", topSpeed:"230 km/h", acceleration:"6.5s", location:"Spintex Road",   description:"Nearly new 2023 Mini Countryman Cooper S. Only 8,200 km on the clock. Features the iconic Mini design with modern tech, panoramic roof and JCW sports package.", features:["Panoramic Sunroof","Apple CarPlay","LED Headlights","Harman Kardon Sound","Parking Sensors","Sport Seats","Keyless Entry","Heads-Up Display"] },
  4:  { year:2022, mileage:"22,000 km", color:"Soul Red",       seats:5, engine:"2.5L Turbo",   power:"250 hp", torque:"420 Nm", topSpeed:"235 km/h", acceleration:"5.7s", location:"Osu, Accra",     description:"Top-rated Mazda 6 in stunning Soul Red. The 2.5 Turbo Premium delivers exhilarating performance wrapped in a premium interior. Full MAZDA Connected Service history.", features:["Bose Sound System","Heated Seats","LED Headlights","Navigation","Wireless Charging","Parking Sensors","Reverse Camera","Adaptive Cruise"] },
  5:  { year:2022, mileage:"34,000 km", color:"Obsidian Black", seats:7, engine:"6.2L V8",       power:"420 hp", torque:"624 Nm", topSpeed:"250 km/h", acceleration:"5.1s", location:"Airport Accra",  description:"Commanding 2022 Cadillac Escalade Platinum. The pinnacle of American luxury SUVs with a massive V8, curved OLED display and seating for 7. Perfect for executive travel.", features:["OLED Display","Magnetic Ride Control","Bose Performance Audio","7-Seat Configuration","Heated/Ventilated Seats","Night Vision","Wireless Charging","Super Cruise"] },
  6:  { year:2022, mileage:"18,600 km", color:"Race Red",       seats:5, engine:"2.3L EcoBoost", power:"280 hp", torque:"420 Nm", topSpeed:"250 km/h", acceleration:"5.7s", location:"Tema",           description:"Hot hatch enthusiast's dream — 2022 Ford Focus ST with the 2.3 EcoBoost and a Recaro sport package. Manual gearbox, track-ready suspension and performance brakes.", features:["Recaro Sport Seats","Ford SYNC 4","LED Headlights","Performance Brakes","Mechanical LSD","Launch Control","Heated Seats","Wireless Charging"] },
  7:  { year:2023, mileage:"5,100 km",  color:"Midnight Silver",seats:5, engine:"Dual Motor EV", power:"670 hp", torque:"1,020 Nm",topSpeed:"250 km/h",acceleration:"2.1s", location:"Cantonments",    description:"Nearly new 2023 Tesla Model S Long Range. 0-100 in 2.1 seconds, 600+ km range. Full self-driving hardware, over-the-air updates and exclusive access to the Supercharger network in Accra.", features:["Full Self-Driving","17-inch Display","Supercharger Access","Air Suspension","Heated Seats","Panoramic Glass Roof","Wireless Charging","Over-the-Air Updates"] },
  8:  { year:2023, mileage:"9,800 km",  color:"Ceramic White",  seats:5, engine:"2.5L Skyactiv", power:"186 hp", torque:"252 Nm", topSpeed:"215 km/h", acceleration:"7.5s", location:"Achimota",       description:"5-star rated 2023 Mazda 3 Hatchback. Elegant Kodo design, plush interior and exceptional Skyactiv-G efficiency. The most awarded car in its class — three years running.", features:["Bose Sound System","Heads-Up Display","LED Headlights","i-Activsense Safety","Reverse Camera","Blind Spot Monitor","Wireless Charging","Heated Seats"] },
  9:  { year:2022, mileage:"26,400 km", color:"Platinum Grey",  seats:5, engine:"2.0L TSI",       power:"184 hp", torque:"320 Nm", topSpeed:"213 km/h", acceleration:"7.5s", location:"East Legon",     description:"Sporty 2022 VW Tiguan R-Line with the 4Motion AWD system. Practical SUV with a premium cabin, Digital Cockpit Pro and IQ.DRIVE assistance systems.", features:["Digital Cockpit Pro","IQ.DRIVE Assist","Panoramic Sunroof","LED Matrix Headlights","Keyless Entry","Wireless Charging","3-Zone Climate","Parking Plus"] },
  10: { year:2023, mileage:"14,200 km", color:"Mineral White",  seats:5, engine:"2.0L TwinPower", power:"255 hp", torque:"400 Nm", topSpeed:"250 km/h", acceleration:"5.8s", location:"Airport Accra",  description:"Iconic 2023 BMW 3 Series 330i in Mineral White. The benchmark sports sedan — perfectly balanced, driver-focused and packed with BMW Live Cockpit Professional.", features:["BMW Live Cockpit","Harman Kardon Sound","LED Headlights","Adaptive Suspension","Heated Seats","Wireless Charging","Parking Assist","Gesture Control"] },
  11: { year:2023, mileage:"11,000 km", color:"Obsidian Black", seats:5, engine:"2.0L Turbo",     power:"255 hp", torque:"400 Nm", topSpeed:"250 km/h", acceleration:"5.9s", location:"Cantonments",    description:"Stunning 2023 Mercedes-Benz C-Class AMG Line. The MBUX infotainment system with voice control, ambient lighting and the signature star grille make this the go-to luxury sedan.", features:["MBUX Infotainment","Burmester Sound","AMG Body Kit","LED Headlights","Heated Seats","Panoramic Sunroof","64-Colour Ambient Light","Wireless Charging"] },
  12: { year:2023, mileage:"7,600 km",  color:"Miami Blue",     seats:5, engine:"2.9L Twin-Turbo","power":"348 hp", torque:"500 Nm", topSpeed:"254 km/h", acceleration:"4.7s", location:"Accra Central", description:"Head-turning 2023 Porsche Macan S in Miami Blue. Exhilarating performance with everyday usability. Sport Chrono package, BOSE surround sound and Porsche Traction Management.", features:["Sport Chrono Package","BOSE Surround Sound","Sport Seats Plus","PASM Sport Suspension","LED Matrix Headlights","Wireless Charging","Porsche Connect","Heated Seats"] },
  default: { year:2023, mileage:"15,000 km", color:"White", seats:5, engine:"2.0L", power:"150 hp", torque:"250 Nm", topSpeed:"200 km/h", acceleration:"8.0s", location:"Accra, Ghana", description:"A well-maintained vehicle in excellent condition with full service history.", features:["Apple CarPlay","Android Auto","LED Headlights","Parking Sensors","Reverse Camera","Cruise Control","Keyless Entry","Bluetooth"] },
};

const getExtra = (id: number) => EXTRA[id] ?? EXTRA["default"];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CarDetailPage() {
  const router             = useRouter();
  const params             = useParams();
  const { dark, setDark, t } = useTheme();
  const [tab, setTab]      = useState<"overview"|"specs"|"features">("overview");
  const [liked, setLiked]  = useState(false);

  // ── id from URL is a string — parse to number to match CARS data ──────────
  const numId = parseInt((params?.id as string) ?? "0", 10);
  const car   = CARS.find(c => c.id === numId);
  const extra = getExtra(numId);

  // ── Similar cars: same type or fuel, exclude current ─────────────────────
  const similar = car
    ? CARS.filter(c => c.id !== car.id && (c.fuel === car.fuel || c.type === car.type)).slice(0, 3)
    : [];

  // ── 404 ───────────────────────────────────────────────────────────────────
  if (!car) {
    return (
      <AppShell active="Browse Cars" dark={dark} setDark={setDark} t={t}>
        <TopBar title="Car Not Found" dark={dark} setDark={setDark} t={t}/>
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", background:t.bg }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:48, fontWeight:800, color:t.textMuted, marginBottom:12 }}>404</div>
            <div style={{ fontSize:16, color:t.textPri, marginBottom:20 }}>Car not found</div>
            <button onClick={()=>router.push("/cars")} style={{ padding:"10px 24px", borderRadius:10, border:"none", background:t.accent, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
              Back to Cars
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  const displayPrice   = `$${car.price.toLocaleString()}/hr`;
  const displayDayRate = `$${(car.price * 24).toFixed(0)}`;

  const SPECS = [
    { label:"Year",         value:`${extra.year}`,        icon:(c:string)=>Ic.History(c)  },
    { label:"Mileage",      value:extra.mileage,          icon:(c:string)=>Ic.Walk(c)     },
    { label:"Fuel Type",    value:car.fuel,               icon:(c:string)=>Ic.Monitor(c)  },
    { label:"Transmission", value:car.transmission,       icon:(c:string)=>Ic.Settings(c) },
    { label:"Seats",        value:`${extra.seats} seats`, icon:(c:string)=>Ic.Profile(c)  },
    { label:"Color",        value:extra.color,            icon:(c:string)=>Ic.Notes(c)    },
    { label:"Engine",       value:extra.engine,           icon:(c:string)=>Ic.Tracking(c) },
    { label:"Power",        value:extra.power,            icon:(c:string)=>Ic.Sales(c)    },
  ];

  return (
    <AppShell active="Browse Cars" dark={dark} setDark={setDark} t={t}>
      <TopBar
        title={car.name} subtitle={car.spec}
        dark={dark} setDark={setDark} t={t}
        actions={
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>setLiked(l=>!l)}
              style={{ width:34, height:34, borderRadius:8, border:`1px solid ${liked?"#EF4444":t.border}`, background:liked?"rgba(239,68,68,0.08)":t.cardBg, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.15s" }}>
              {Ic.Heart(liked?"#EF4444":t.textMuted, liked)}
            </button>
            <button onClick={()=>router.back()}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8, border:`1px solid ${t.border}`, background:t.cardBg, color:t.textPri, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
              Back
            </button>
          </div>
        }
      />

      <div style={{ flex:1, overflowY:"auto", background:t.bg }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 24px 48px", display:"grid", gridTemplateColumns:"1fr 320px", gap:20, alignItems:"start" }}>

          {/* ══════════ LEFT ══════════ */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* Hero image */}
            <div style={{ background:dark?"#111122":"#f4f4f8", borderRadius:16, border:`1px solid ${t.border}`, overflow:"hidden", position:"relative", height:300 }}>
              <Image
                src={car.image} alt={car.name} fill sizes="60vw"
                style={{ objectFit:"cover", objectPosition:"center" }}
                priority
              />
              {/* gradient overlay */}
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)", pointerEvents:"none" }}/>

              {/* badges */}
              <div style={{ position:"absolute", top:14, left:14, display:"flex", gap:6 }}>
                <span style={{ fontSize:10, fontWeight:700, background:t.accent, color:"#fff", borderRadius:20, padding:"4px 12px" }}>For Sale & Rent</span>
                <span style={{ fontSize:10, fontWeight:700, color:"#10B981", background:"rgba(16,185,129,0.18)", border:"1px solid rgba(16,185,129,0.4)", borderRadius:20, padding:"4px 12px" }}>Available</span>
              </div>

              {/* bottom strip over gradient */}
              <div style={{ position:"absolute", bottom:16, left:20, right:20, display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontSize:20, fontWeight:800, color:"#fff" }}>{car.name}</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.65)", marginTop:3 }}>{car.spec}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:22, fontWeight:800, color:"#fff" }}>{displayPrice}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)" }}>{displayDayRate}/day</div>
                </div>
              </div>
            </div>

            {/* Quick specs strip */}
            <div style={{ background:t.cardBg, borderRadius:12, border:`1px solid ${t.border}`, padding:"14px 20px", display:"flex" }}>
              {[
                { icon:(c:string)=>Ic.Walk(c),    label:"Mileage", value:extra.mileage      },
                { icon:(c:string)=>Ic.Monitor(c),  label:"Fuel",    value:car.fuel           },
                { icon:(c:string)=>Ic.Settings(c), label:"Gearbox", value:car.transmission   },
                { icon:(c:string)=>Ic.Profile(c),  label:"Seats",   value:`${extra.seats}`   },
                { icon:(c:string)=>Ic.Tracking(c), label:"Engine",  value:extra.engine       },
                { icon:(c:string)=>Ic.Sales(c),    label:"Power",   value:extra.power        },
              ].map((s, i, arr) => (
                <div key={s.label} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:5, padding:"0 10px", borderRight:i<arr.length-1?`1px solid ${t.divider}`:"none" }}>
                  <span style={{ display:"flex", opacity:0.45 }}>{s.icon(t.textMuted)}</span>
                  <div style={{ fontSize:12, fontWeight:700, color:t.textPri, textAlign:"center" }}>{s.value}</div>
                  <div style={{ fontSize:9.5, color:t.textMuted, textTransform:"uppercase", letterSpacing:0.5 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Tab bar */}
            <div style={{ display:"flex", background:t.cardBg, borderRadius:10, border:`1px solid ${t.border}`, padding:4 }}>
              {(["overview","specs","features"] as const).map(tb => (
                <button key={tb} onClick={()=>setTab(tb)} style={{ flex:1, padding:"9px 0", borderRadius:8, border:"none", background:tab===tb?t.accent:"transparent", color:tab===tb?"#fff":t.textSec, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", textTransform:"capitalize", transition:"all 0.15s" }}>
                  {tb}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"22px" }}>

              {tab === "overview" && (
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:t.textPri, marginBottom:12 }}>About this car</div>
                  <p style={{ fontSize:13, color:t.textSec, lineHeight:1.8, marginBottom:20 }}>{extra.description}</p>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    {[
                      { label:"Top Speed",   value:extra.topSpeed,     icon:(c:string)=>Ic.Tracking(c) },
                      { label:"0–100 km/h",  value:extra.acceleration, icon:(c:string)=>Ic.History(c)  },
                      { label:"Torque",      value:extra.torque,       icon:(c:string)=>Ic.Sales(c)    },
                      { label:"Location",    value:extra.location,     icon:(c:string)=>Ic.Pin(c)      },
                    ].map(s => (
                      <div key={s.label} style={{ background:t.bg, borderRadius:10, border:`1px solid ${t.border}`, padding:"14px 16px", display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:32, height:32, borderRadius:8, background:t.accent+"15", border:`1px solid ${t.accent}25`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          <span style={{ display:"flex" }}>{s.icon(t.accent)}</span>
                        </div>
                        <div>
                          <div style={{ fontSize:10, color:t.textMuted, marginBottom:3, textTransform:"uppercase", letterSpacing:0.5 }}>{s.label}</div>
                          <div style={{ fontSize:14, fontWeight:700, color:t.textPri }}>{s.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === "specs" && (
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:t.textPri, marginBottom:16 }}>Full Specifications</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    {SPECS.map(s => (
                      <div key={s.label} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:t.bg, borderRadius:10, border:`1px solid ${t.border}` }}>
                        <span style={{ display:"flex", opacity:0.4 }}>{s.icon(t.textMuted)}</span>
                        <div>
                          <div style={{ fontSize:10, color:t.textMuted, marginBottom:3, textTransform:"uppercase", letterSpacing:0.6 }}>{s.label}</div>
                          <div style={{ fontSize:13, fontWeight:600, color:t.textPri }}>{s.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === "features" && (
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:t.textPri, marginBottom:16 }}>Features & Extras</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    {extra.features.map(f => (
                      <div key={f} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", background:t.bg, borderRadius:10, border:`1px solid ${t.border}` }}>
                        <div style={{ width:20, height:20, borderRadius:"50%", background:"rgba(16,185,129,0.15)", border:"1px solid rgba(16,185,129,0.3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          <span style={{ display:"flex" }}>{Ic.Check()}</span>
                        </div>
                        <span style={{ fontSize:13, color:t.textSec, fontWeight:500 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ══════════ RIGHT ══════════ */}
          <div style={{ display:"flex", flexDirection:"column", gap:14, position:"sticky", top:24 }}>

            {/* Price + CTA */}
            <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"22px", overflow:"hidden", position:"relative" }}>
              <div style={{ position:"absolute", top:-30, right:-30, width:100, height:100, borderRadius:"50%", background:t.accent+"10", pointerEvents:"none" }}/>
              <div style={{ fontSize:13, color:t.textMuted, marginBottom:4 }}>Rental rate</div>
              <div style={{ fontSize:30, fontWeight:800, color:t.textPri, lineHeight:1, marginBottom:3 }}>{displayPrice}</div>
              <div style={{ fontSize:12, color:t.textMuted, marginBottom:20 }}>
                or <strong style={{ color:t.textPri }}>{displayDayRate}</strong>/day · est.
              </div>
              <button onClick={()=>router.push(`/rentals/booking?car=${car.id}`)}
                style={{ width:"100%", padding:"13px 0", borderRadius:10, border:"none", background:t.accent, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", marginBottom:10, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                <span style={{ display:"flex" }}>{Ic.Booking("#fff")}</span> Book a Rental
              </button>
              <button onClick={()=>router.push(`/buy/checkout?car=${car.id}`)}
                style={{ width:"100%", padding:"12px 0", borderRadius:10, border:`1.5px solid ${t.accent}`, background:"transparent", color:t.accent, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                <span style={{ display:"flex" }}>{Ic.Buy(t.accent)}</span> Buy this Car
              </button>
            </div>

            {/* Ratings */}
            <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"18px" }}>
              <div style={{ fontSize:13, fontWeight:700, color:t.textPri, marginBottom:12 }}>Rating</div>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ fontSize:36, fontWeight:800, color:t.textPri, lineHeight:1 }}>{car.rating}</div>
                <div>
                  <div style={{ display:"flex", gap:2, marginBottom:4 }}>
                    {[1,2,3,4,5].map(n => (
                      <div key={n} style={{ width:14, height:14, borderRadius:3, background: n <= Math.round(car.rating) ? t.accent : t.border }}/>
                    ))}
                  </div>
                  <div style={{ fontSize:11, color:t.textMuted }}>{car.reviews} reviews</div>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"18px" }}>
              <div style={{ fontSize:13, fontWeight:700, color:t.textPri, marginBottom:12 }}>Availability</div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10, padding:"10px 12px", background:"rgba(16,185,129,0.06)", borderRadius:9, border:"1px solid rgba(16,185,129,0.2)" }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:"#10B981", display:"inline-block", flexShrink:0 }}/>
                <span style={{ fontSize:12, fontWeight:600, color:"#10B981" }}>Available now</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <span style={{ display:"flex", opacity:0.4 }}>{Ic.Pin(t.textMuted)}</span>
                <span style={{ fontSize:12, color:t.textSec }}>{extra.location}</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ display:"flex", opacity:0.4 }}>{Ic.Walk(t.textMuted)}</span>
                <span style={{ fontSize:12, color:t.textSec }}>{car.dist} away · {car.walkMin} min walk</span>
              </div>
            </div>

            {/* Contact */}
            <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"18px" }}>
              <div style={{ fontSize:13, fontWeight:700, color:t.textPri, marginBottom:12 }}>Contact Dealer</div>
              <button onClick={()=>router.push("/dashboard/contact")}
                style={{ width:"100%", padding:"10px 0", borderRadius:10, border:`1px solid ${t.border}`, background:t.bg, color:t.textPri, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:7, transition:"border-color 0.15s" }}
                onMouseEnter={e=>((e.currentTarget as HTMLButtonElement).style.borderColor=t.accent)}
                onMouseLeave={e=>((e.currentTarget as HTMLButtonElement).style.borderColor=t.border)}
              >
                <span style={{ display:"flex" }}>{Ic.Chat(t.textMuted)}</span> Send a Message
              </button>
            </div>

            {/* Similar cars */}
            {similar.length > 0 && (
              <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"18px" }}>
                <div style={{ fontSize:13, fontWeight:700, color:t.textPri, marginBottom:12 }}>Similar Cars</div>
                {similar.map((sc, i) => (
                  <div key={sc.id} onClick={()=>router.push(`/cars/${sc.id}`)}
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:i<similar.length-1?`1px solid ${t.divider}`:"none", cursor:"pointer", transition:"opacity 0.15s" }}
                    onMouseEnter={e=>(e.currentTarget.style.opacity="0.7")}
                    onMouseLeave={e=>(e.currentTarget.style.opacity="1")}
                  >
                    <div style={{ width:52, height:38, borderRadius:8, overflow:"hidden", flexShrink:0, position:"relative", background:dark?"#111122":"#f4f4f8", border:`1px solid ${t.border}` }}>
                      <Image src={sc.image} alt={sc.name} fill style={{ objectFit:"cover" }}/>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:t.textPri, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{sc.name}</div>
                      <div style={{ fontSize:11, color:t.textMuted, marginTop:1 }}>{sc.fuel} · ${sc.price}/hr</div>
                    </div>
                    <span style={{ display:"flex", opacity:0.4, flexShrink:0 }}>{Ic.ChevronRight(t.textMuted)}</span>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </AppShell>
  );
}