"use client";
// src/app/dashboard/super-admin/page.tsx

import { useTheme } from "@/src/context/ThemeContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/src/context/AdminAuthContext";
import Image from "next/image";
import dynamic from "next/dynamic";

import { Ic } from "@/src/components/ui/Icons";
import AppShell from "@/src/components/layout/Appshell";
import TopBar from "@/src/components/layout/Topbar";

// ── Pull real car images from your CARS data ──────────────────────────────────
import { CARS } from "@/src/lib/data/cars";

const LeafletMap = dynamic(() => import("@/src/components/tracking/LeafletMap"), { ssr: false });

// ─── KPI Data ─────────────────────────────────────────────────────────────────
const STATS = [
  { label:"Total Revenue",  value:"$48,290", delta:"+12.4%", up:true,  sub:"vs last month",   icon:(c:string)=>Ic.Sales(c)    },
  { label:"Active Rentals", value:"34",       delta:"+3",     up:true,  sub:"on the road now", icon:(c:string)=>Ic.Rentals(c)  },
  { label:"Fleet Cars",     value:"87",       delta:"+2",     up:true,  sub:"total vehicles",  icon:(c:string)=>Ic.Vehicles(c) },
  { label:"Total Users",    value:"1,204",    delta:"+89",    up:true,  sub:"registered",      icon:(c:string)=>Ic.Users(c)    },
  { label:"Pending Swaps",  value:"12",       delta:"-4",     up:false, sub:"awaiting review", icon:(c:string)=>Ic.Swap(c)     },
  { label:"Open Payments",  value:"$6,140",   delta:"+$820",  up:true,  sub:"outstanding",     icon:(c:string)=>Ic.Payment(c)  },
  { label:"In Service",     value:"5",        delta:"+1",     up:false, sub:"maintenance",     icon:(c:string)=>Ic.Monitor(c)  },
  { label:"Sales Closed",   value:"28",       delta:"+6",     up:true,  sub:"this month",      icon:(c:string)=>Ic.Buy(c)      },
];

const REVENUE_BARS = [38, 52, 44, 61, 55, 72, 68, 83, 76, 91, 85, 96];
const MONTHS       = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ── Fleet cars — use IDs that match your CARS data (numeric 1–12) ─────────────
// We attach live tracking data (location, coords, speed, fuel) here.
const FLEET_CARS = [
  {
    carId: 1,   // → Audi A4  (id:1 in CARS)
    plate: "GR-4421-22", status:"Moving",    daily:"$86",
    driver:"Kwame Asante", speed:"62 km/h",  fuel:78,
    location:"N1 Highway, Accra",
    lat:5.6037, lng:-0.1870,
  },
  {
    carId: 7,   // → Tesla Model S
    plate: "GW-1122-24", status:"Parked",    daily:"$170",
    driver:"Abena Osei",   speed:"0 km/h",  fuel:84,
    location:"Osu, Accra",
    lat:5.5557, lng:-0.1963,
  },
  {
    carId: 10,  // → BMW 3 Series
    plate: "GR-2341-22", status:"Moving",    daily:"$86",
    driver:"Kofi Mensah",  speed:"45 km/h", fuel:55,
    location:"Spintex Road",
    lat:5.6167, lng:-0.1500,
  },
  {
    carId: 11,  // → Mercedes C-Class
    plate: "GN-8821-22", status:"In Service",daily:"$96",
    driver:"—",            speed:"0 km/h",  fuel:32,
    location:"East Legon Workshop",
    lat:5.6354, lng:-0.1613,
  },
];

const STATUS_COLOR: Record<string,string> = {
  Moving:      "#10B981",
  Parked:      "#4F46E5",
  "In Service":"#F59E0B",
};

const ACTIVITY = [
  { user:"Kwame Asante", action:"Booked Audi A4",            time:"2 min ago",  amount:"+$342",  kind:"rental",  up:true  },
  { user:"Abena Osei",   action:"Purchased Tesla Model S",   time:"18 min ago", amount:"+$45k",  kind:"sale",    up:true  },
  { user:"Kofi Mensah",  action:"Swap request: VW → BMW",   time:"34 min ago", amount:"Pending",kind:"swap",    up:null  },
  { user:"Ama Darko",    action:"Returned Mercedes C-Class", time:"1 hr ago",   amount:"+$900",  kind:"rental",  up:true  },
  { user:"Yaw Boateng",  action:"Payment overdue — Tiguan", time:"2 hrs ago",  amount:"-$630",  kind:"payment", up:false },
];

const KIND_COLOR: Record<string,string> = {
  rental:"#10B981", sale:"#4F46E5", swap:"#F59E0B", payment:"#EF4444", user:"#8B5CF6",
};
const KIND_ICON: Record<string,(c:string)=>React.ReactNode> = {
  rental:(c)=>Ic.Rentals(c), sale:(c)=>Ic.Buy(c),
  swap:(c)=>Ic.Swap(c), payment:(c)=>Ic.Payment(c), user:(c)=>Ic.Profile(c),
};

const QUICK = [
  { label:"Users",    href:"/dashboard/super-admin/users",    icon:(c:string)=>Ic.Users(c)    },
  { label:"Fleet",    href:"/dashboard/super-admin/cars",     icon:(c:string)=>Ic.Vehicles(c) },
  { label:"Rentals",  href:"/dashboard/super-admin/rentals",  icon:(c:string)=>Ic.Rentals(c)  },
  { label:"Sales",    href:"/dashboard/super-admin/sales",    icon:(c:string)=>Ic.Sales(c)    },
  { label:"Swaps",    href:"/dashboard/super-admin/swaps",    icon:(c:string)=>Ic.Swap(c)     },
  { label:"Payments", href:"/dashboard/super-admin/payments", icon:(c:string)=>Ic.Payment(c)  },
  { label:"Reports",  href:"/dashboard/super-admin/reports",  icon:(c:string)=>Ic.Reports(c)  },
  { label:"Settings", href:"/dashboard/super-admin/settings", icon:(c:string)=>Ic.Settings(c) },
];

const TOP_CUSTOMERS = [
  { name:"Abena Osei",   spent:"$21,400", tag:"Buyer",  pct:100 },
  { name:"Kwame Asante", spent:"$9,870",  tag:"Renter", pct:46  },
  { name:"Ama Darko",    spent:"$7,320",  tag:"Renter", pct:34  },
  { name:"Kofi Mensah",  spent:"$4,900",  tag:"Swap",   pct:23  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SuperAdminDashboard() {
  const router          = useRouter();
  const { admin, logout } = useAdminAuth();
  const { dark, setDark, t } = useTheme();
  const maxBar          = Math.max(...REVENUE_BARS);

  // selected car for side panel
  const [selectedCarId, setSelectedCarId] = useState<number|null>(null);

  const handleCarClick = (carId: number) => {
    // toggle panel — click same car again to close
    setSelectedCarId(prev => prev === carId ? null : carId);
  };

  // get full fleet entry + matching CARS record
  const selectedFleet = FLEET_CARS.find(f => f.carId === selectedCarId);
  const selectedCar   = selectedFleet ? CARS.find(c => c.id === selectedFleet.carId) : null;

  return (
    <AppShell active="Admin Panel" dark={dark} setDark={setDark} t={t}>
      <TopBar
        title="Super Admin Dashboard"
        subtitle="EliteDriveMotors — full platform overview"
        breadcrumb={["dashboard", "super-admin", "Overview"]}
        dark={dark} setDark={setDark} t={t}
        actions={
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:10, fontWeight:700, letterSpacing:1, background:dark?"rgba(79,70,229,0.2)":"rgba(79,70,229,0.08)", color:dark?"#A0A0FF":"#4F46E5", border:"1px solid rgba(79,70,229,0.25)", borderRadius:20, padding:"4px 12px" }}>
              {admin?.name ?? "SUPER ADMIN"}
            </span>
            <button
              onClick={() => { logout(); router.replace("/auth/login"); }}
              style={{ fontSize:12, fontWeight:600, color:"#EF4444", background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:8, padding:"6px 14px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
            >
              Logout
            </button>
          </div>
        }
      />

      <div style={{ flex:1, overflowY:"auto", padding:"20px 22px 40px", background:t.bg }}>

        {/* ══ ROW 1 — hero KPI cards ══ */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:12 }}>
          {STATS.slice(0,4).map(s => (
            <div key={s.label}
              style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"18px 20px", position:"relative", overflow:"hidden", cursor:"pointer", transition:"border-color 0.15s, transform 0.15s" }}
              onMouseEnter={e=>{ (e.currentTarget as HTMLDivElement).style.borderColor=t.accent; (e.currentTarget as HTMLDivElement).style.transform="translateY(-2px)"; }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLDivElement).style.borderColor=t.border; (e.currentTarget as HTMLDivElement).style.transform="translateY(0)"; }}
            >
              <div style={{ position:"absolute", top:-24, right:-24, width:88, height:88, borderRadius:"50%", background:t.accent+"0d", pointerEvents:"none" }}/>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12 }}>
                <div style={{ width:34, height:34, borderRadius:9, background:t.accent+"15", border:`1px solid ${t.accent}22`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ display:"flex" }}>{s.icon(t.accent)}</span>
                </div>
                <span style={{ fontSize:10, fontWeight:700, color:s.up?"#10B981":"#EF4444", background:s.up?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.1)", borderRadius:20, padding:"3px 8px" }}>{s.delta}</span>
              </div>
              <div style={{ fontSize:26, fontWeight:800, color:t.textPri, lineHeight:1, marginBottom:5 }}>{s.value}</div>
              <div style={{ fontSize:12, fontWeight:600, color:t.textSec }}>{s.label}</div>
              <div style={{ fontSize:11, color:t.textMuted, marginTop:2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ══ ROW 1b — compact KPI cards ══ */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
          {STATS.slice(4).map(s => (
            <div key={s.label}
              style={{ background:t.cardBg, borderRadius:12, border:`1px solid ${t.border}`, padding:"12px 16px", display:"flex", alignItems:"center", gap:11, transition:"border-color 0.15s" }}
              onMouseEnter={e=>(e.currentTarget.style.borderColor=t.accent)}
              onMouseLeave={e=>(e.currentTarget.style.borderColor=t.border)}
            >
              <div style={{ width:30, height:30, borderRadius:8, background:t.accent+"12", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span style={{ display:"flex" }}>{s.icon(t.accent)}</span>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:10, color:t.textMuted, marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.label}</div>
                <div style={{ fontSize:17, fontWeight:800, color:t.textPri, lineHeight:1 }}>{s.value}</div>
              </div>
              <span style={{ fontSize:10, fontWeight:700, color:s.up?"#10B981":"#EF4444", flexShrink:0 }}>{s.delta}</span>
            </div>
          ))}
        </div>

        {/* ══ ROW 2 — Featured fleet + optional side panel ══ */}
        <div style={{ marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:t.textPri }}>Featured Fleet</div>
              <div style={{ fontSize:11, color:t.textMuted, marginTop:2 }}>
                Click any car to see live location &amp; details
              </div>
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              {selectedCarId && (
                <button onClick={()=>setSelectedCarId(null)}
                  style={{ fontSize:11, fontWeight:600, color:t.textMuted, background:"none", border:`1px solid ${t.border}`, padding:"5px 12px", borderRadius:7, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                  Close panel
                </button>
              )}
              <button onClick={()=>router.push("/dashboard/super-admin/cars")}
                style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, fontWeight:600, color:t.accent, background:"none", border:`1px solid ${t.border}`, padding:"6px 14px", borderRadius:8, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"border-color 0.15s" }}
                onMouseEnter={e=>((e.currentTarget as HTMLButtonElement).style.borderColor=t.accent)}
                onMouseLeave={e=>((e.currentTarget as HTMLButtonElement).style.borderColor=t.border)}
              >
                <span style={{ display:"flex" }}>{Ic.Vehicles(t.accent)}</span>
                View all cars
              </button>
            </div>
          </div>

          {/* car cards — always full width */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
            {FLEET_CARS.map(fleet => {
              const car     = CARS.find(c => c.id === fleet.carId);
              if (!car) return null;
              const sColor  = STATUS_COLOR[fleet.status] ?? t.accent;
              const isActive = selectedCarId === fleet.carId;

              return (
                <div key={fleet.carId}
                  onClick={() => handleCarClick(fleet.carId)}
                  style={{
                    background:t.cardBg, borderRadius:14,
                    border:`1.5px solid ${isActive ? t.accent : t.border}`,
                    overflow:"hidden", cursor:"pointer",
                    transition:"border-color 0.15s, transform 0.15s, box-shadow 0.15s",
                    boxShadow: isActive ? `0 0 0 3px ${t.accent}20` : "none",
                    transform: isActive ? "translateY(-2px)" : "translateY(0)",
                  }}
                  onMouseEnter={e=>{
                    if(!isActive) {
                      (e.currentTarget as HTMLDivElement).style.borderColor=t.accent;
                      (e.currentTarget as HTMLDivElement).style.transform="translateY(-2px)";
                    }
                  }}
                  onMouseLeave={e=>{
                    if(!isActive) {
                      (e.currentTarget as HTMLDivElement).style.borderColor=t.border;
                      (e.currentTarget as HTMLDivElement).style.transform="translateY(0)";
                    }
                  }}
                >
                  <div style={{ position:"relative", height:110, background:dark?"#111122":"#f0f0f6", overflow:"hidden" }}>
                    <Image src={car.image} alt={car.name} fill sizes="20vw" style={{ objectFit:"cover", objectPosition:"center" }}/>
                    <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)", pointerEvents:"none" }}/>
                    <span style={{ position:"absolute", top:8, left:8, fontSize:9, fontWeight:700, color:sColor, background:sColor+"22", border:`1px solid ${sColor}40`, borderRadius:20, padding:"3px 9px", backdropFilter:"blur(4px)" }}>
                      {fleet.status}
                    </span>
                    {fleet.status === "Moving" && (
                      <span style={{ position:"absolute", top:10, right:10 }}>
                        <span style={{ display:"block", width:8, height:8, borderRadius:"50%", background:"#10B981", boxShadow:"0 0 0 3px rgba(16,185,129,0.3)" }}/>
                      </span>
                    )}
                    {isActive && <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3, background:t.accent }}/>}
                  </div>
                  <div style={{ padding:"11px 13px" }}>
                    <div style={{ fontSize:12, fontWeight:700, color:t.textPri, marginBottom:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{car.name}</div>
                    <div style={{ fontSize:10, color:t.textMuted, marginBottom:8 }}>{fleet.plate}</div>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <span style={{ fontSize:13, fontWeight:800, color:t.textPri }}>{fleet.daily}<span style={{ fontSize:9, color:t.textMuted, fontWeight:400 }}>/day</span></span>
                      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                        <span style={{ display:"flex", opacity:0.4 }}>{Ic.Pin(t.textMuted)}</span>
                        <span style={{ fontSize:9, color:t.textMuted, maxWidth:60, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{fleet.location.split(",")[0]}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Full-height drawer sliding in from the right ── */}
        <style>{`
          @keyframes drawerSlideIn  { from { transform: translateX(100%); } to { transform: translateX(0); } }
          @keyframes drawerSlideOut { from { transform: translateX(0); }   to { transform: translateX(100%); } }
        `}</style>

        {selectedFleet && selectedCar && (
          <>
            {/* dim backdrop */}
            <div
              onClick={() => setSelectedCarId(null)}
              style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.25)", zIndex:40, backdropFilter:"blur(1px)" }}
            />

            {/* drawer */}
            <div style={{
              position:"fixed", top:0, right:0, bottom:0,
              width:400, zIndex:50,
              background:t.cardBg,
              borderLeft:`1px solid ${t.border}`,
              display:"flex", flexDirection:"column",
              boxShadow:"-8px 0 40px rgba(0,0,0,0.18)",
              animation:"drawerSlideIn 0.28s cubic-bezier(0.4,0,0.2,1)",
            }}>

              {/* car image header */}
              <div style={{ position:"relative", height:200, background:dark?"#111122":"#f0f0f6", flexShrink:0, overflow:"hidden" }}>
                <Image src={selectedCar.image} alt={selectedCar.name} fill sizes="400px" style={{ objectFit:"cover", objectPosition:"center" }} priority/>
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)", pointerEvents:"none" }}/>
                <div style={{ position:"absolute", bottom:16, left:18, right:18 }}>
                  <div style={{ fontSize:18, fontWeight:800, color:"#fff", marginBottom:3 }}>{selectedCar.name}</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)" }}>{selectedFleet.plate} · {selectedFleet.location}</div>
                </div>
                <button onClick={() => setSelectedCarId(null)}
                  style={{ position:"absolute", top:12, right:12, width:28, height:28, borderRadius:"50%", background:"rgba(0,0,0,0.55)", border:"1px solid rgba(255,255,255,0.15)", cursor:"pointer", color:"#fff", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  ✕
                </button>
              </div>

              {/* scrollable body */}
              <div style={{ flex:1, overflowY:"auto", padding:"20px 20px 28px" }}>

                {/* status + view details */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:STATUS_COLOR[selectedFleet.status]??t.accent, background:(STATUS_COLOR[selectedFleet.status]??t.accent)+"18", border:`1px solid ${(STATUS_COLOR[selectedFleet.status]??t.accent)}30`, borderRadius:20, padding:"5px 14px" }}>
                    {selectedFleet.status}
                  </span>
                  <button onClick={()=>router.push(`/cars/${selectedFleet.carId}`)}
                    style={{ fontSize:12, fontWeight:600, color:t.accent, background:"none", border:`1px solid ${t.border}`, padding:"5px 14px", borderRadius:8, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                    View details
                  </button>
                </div>

                {/* live stats grid */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
                  {[
                    { label:"Speed",  value:selectedFleet.speed,        icon:(c:string)=>Ic.Tracking(c) },
                    { label:"Driver", value:selectedFleet.driver,       icon:(c:string)=>Ic.Profile(c)  },
                    { label:"Fuel",   value:`${selectedFleet.fuel}%`,   icon:(c:string)=>Ic.Monitor(c)  },
                    { label:"Rate",   value:selectedFleet.daily+"/day", icon:(c:string)=>Ic.Payment(c)  },
                  ].map(row => (
                    <div key={row.label} style={{ background:t.bg, borderRadius:10, border:`1px solid ${t.border}`, padding:"12px 14px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:4 }}>
                        <span style={{ display:"flex", opacity:0.4 }}>{row.icon(t.textMuted)}</span>
                        <span style={{ fontSize:9, color:t.textMuted, textTransform:"uppercase", letterSpacing:0.5 }}>{row.label}</span>
                      </div>
                      <div style={{ fontSize:13, fontWeight:700, color:t.textPri }}>{row.value}</div>
                    </div>
                  ))}
                </div>

                {/* fuel bar */}
                <div style={{ marginBottom:18 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontSize:11, color:t.textMuted }}>Fuel level</span>
                    <span style={{ fontSize:11, fontWeight:700, color: selectedFleet.fuel > 50 ? "#10B981" : "#F59E0B" }}>{selectedFleet.fuel}%</span>
                  </div>
                  <div style={{ height:6, borderRadius:4, background:dark?"#2a2a3a":"#ebebf0", overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${selectedFleet.fuel}%`, background: selectedFleet.fuel > 50 ? "#10B981" : "#F59E0B", borderRadius:4, transition:"width 0.5s" }}/>
                  </div>
                </div>

                {/* location row */}
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18, padding:"10px 12px", background:t.bg, borderRadius:10, border:`1px solid ${t.border}` }}>
                  <span style={{ display:"flex", opacity:0.5 }}>{Ic.Pin(t.textMuted)}</span>
                  <span style={{ fontSize:12, color:t.textSec }}>{selectedFleet.location}</span>
                </div>

                {/* mini map */}
                <div style={{ borderRadius:12, overflow:"hidden", border:`1px solid ${t.border}`, marginBottom:18, height:180 }}>
                  <LeafletMap
                    dark={dark}
                    t={t}
                    vehicles={[{
                      id:       selectedFleet.plate,
                      car:      selectedCar.name,
                      plate:    selectedFleet.plate,
                      status:   selectedFleet.status === "Moving" ? "In Transit" : selectedFleet.status === "In Service" ? "Idle" : "Parked",
                      driver:   selectedFleet.driver,
                      speed:    selectedFleet.speed,
                      location: selectedFleet.location,
                      eta:      "—",
                    }]}
                    center={{ lat: selectedFleet.lat, lng: selectedFleet.lng }}
                    zoom={14}
                  />
                </div>

                {/* coords */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:20 }}>
                  {[
                    { label:"Latitude",  value:selectedFleet.lat.toFixed(4) },
                    { label:"Longitude", value:selectedFleet.lng.toFixed(4) },
                  ].map(c => (
                    <div key={c.label} style={{ background:t.bg, borderRadius:8, border:`1px solid ${t.border}`, padding:"9px 12px" }}>
                      <div style={{ fontSize:9, color:t.textMuted, marginBottom:2, textTransform:"uppercase", letterSpacing:0.5 }}>{c.label}</div>
                      <div style={{ fontSize:13, fontWeight:700, color:t.textPri }}>{c.value}</div>
                    </div>
                  ))}
                </div>

                {/* open live map CTA */}
                <button onClick={()=>router.push("/tracking/live-map")}
                  style={{ width:"100%", padding:"12px 0", borderRadius:10, border:"none", background:t.accent, color:t.accentFg, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  <span style={{ display:"flex" }}>{Ic.Map(t.accentFg)}</span>
                  Open Full Live Map
                </button>
              </div>
            </div>
          </>
        )}

        {/* ══ ROW 3 — Revenue chart + Quick access ══ */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 260px", gap:16, marginBottom:16 }}>
          <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"22px 24px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:t.textPri, marginBottom:3 }}>Revenue Overview</div>
                <div style={{ fontSize:12, color:t.textMuted }}>Jan – Dec 2025</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:24, fontWeight:800, color:t.textPri, lineHeight:1 }}>$48,290</div>
                <div style={{ fontSize:11, color:"#10B981", fontWeight:700, marginTop:4, display:"flex", alignItems:"center", gap:4, justifyContent:"flex-end" }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"#10B981", display:"inline-block" }}/>
                  +12.4% this month
                </div>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"flex-end", gap:7, height:100 }}>
              {REVENUE_BARS.map((h, i) => {
                const isLast = i === REVENUE_BARS.length - 1;
                const recent = i >= 9;
                return (
                  <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:5, height:"100%" }}>
                    <div style={{ flex:1, width:"100%", display:"flex", alignItems:"flex-end" }}>
                      <div style={{ width:"100%", height:`${(h/maxBar)*100}%`, background:isLast?t.accent:recent?t.accent+"55":dark?"#2A2A4A":"#EAEAF4", borderRadius:"4px 4px 0 0", minHeight:4, transition:"height 0.3s" }}/>
                    </div>
                    <span style={{ fontSize:8.5, color:isLast?t.accent:t.textMuted, fontWeight:isLast?700:400 }}>{MONTHS[i]}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ display:"flex", gap:14, marginTop:12, paddingTop:12, borderTop:`1px solid ${t.divider}` }}>
              {[{ label:"Historical",color:dark?"#2A2A4A":"#EAEAF4"},{ label:"Recent",color:t.accent+"55"},{ label:"Current",color:t.accent}].map(l=>(
                <div key={l.label} style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <div style={{ width:9, height:9, borderRadius:2, background:l.color }}/>
                  <span style={{ fontSize:10, color:t.textMuted }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"18px" }}>
            <div style={{ fontSize:13, fontWeight:700, color:t.textPri, marginBottom:12 }}>Quick Access</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {QUICK.map(q => (
                <div key={q.label} onClick={()=>router.push(q.href)}
                  style={{ display:"flex", alignItems:"center", gap:8, padding:"10px", borderRadius:10, border:`1px solid ${t.border}`, background:t.bg, cursor:"pointer", transition:"all 0.15s" }}
                  onMouseEnter={e=>{ (e.currentTarget as HTMLDivElement).style.borderColor=t.accent; (e.currentTarget as HTMLDivElement).style.background=dark?"#1a1a2e":"#f5f5fc"; }}
                  onMouseLeave={e=>{ (e.currentTarget as HTMLDivElement).style.borderColor=t.border; (e.currentTarget as HTMLDivElement).style.background=t.bg; }}
                >
                  <span style={{ display:"flex", opacity:0.55 }}>{q.icon(t.textPri)}</span>
                  <span style={{ fontSize:11, fontWeight:600, color:t.textSec }}>{q.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ ROW 4 — Activity + Fleet status + Top customers ══ */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 260px", gap:16 }}>
          <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"20px 22px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:700, color:t.textPri }}>Recent Activity</div>
              <button onClick={()=>router.push("/dashboard/super-admin/reports")}
                style={{ fontSize:11, fontWeight:600, color:t.accent, background:"none", border:`1px solid ${t.border}`, cursor:"pointer", padding:"4px 12px", borderRadius:7, fontFamily:"'DM Sans',sans-serif", transition:"border-color 0.15s" }}
                onMouseEnter={e=>((e.currentTarget as HTMLButtonElement).style.borderColor=t.accent)}
                onMouseLeave={e=>((e.currentTarget as HTMLButtonElement).style.borderColor=t.border)}
              >View all</button>
            </div>
            {ACTIVITY.map((a, i) => {
              const col = KIND_COLOR[a.kind];
              return (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 0", borderBottom:i<ACTIVITY.length-1?`1px solid ${t.divider}`:"none" }}>
                  <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, background:col+"14", border:`1px solid ${col}22`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ display:"flex" }}>{KIND_ICON[a.kind](col)}</span>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:t.textPri, marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.action}</div>
                    <div style={{ fontSize:11, color:t.textMuted }}>{a.user}</div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:a.up===false?"#EF4444":a.up===null?t.textMuted:t.textPri }}>{a.amount}</div>
                    <div style={{ fontSize:10, color:t.textMuted, marginTop:1 }}>{a.time}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"18px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                <div style={{ fontSize:13, fontWeight:700, color:t.textPri }}>Fleet Status</div>
                <span style={{ fontSize:10, color:t.textMuted }}>87 total</span>
              </div>
              {[
                { label:"Available",  value:70, total:87, color:"#10B981" },
                { label:"Rented",     value:34, total:87, color:t.accent  },
                { label:"In Service", value:5,  total:87, color:"#F59E0B" },
              ].map(fs => (
                <div key={fs.label} style={{ marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <div style={{ width:7, height:7, borderRadius:"50%", background:fs.color }}/>
                      <span style={{ fontSize:12, color:t.textSec }}>{fs.label}</span>
                    </div>
                    <span style={{ fontSize:12, fontWeight:700, color:t.textPri }}>{fs.value}</span>
                  </div>
                  <div style={{ height:5, borderRadius:3, background:dark?"#2a2a3a":"#ebebf0", overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${(fs.value/fs.total)*100}%`, background:fs.color, borderRadius:3, transition:"width 0.5s" }}/>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"18px", flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <div style={{ fontSize:13, fontWeight:700, color:t.textPri }}>Top Customers</div>
                <span style={{ fontSize:10, color:t.textMuted, background:t.bg, border:`1px solid ${t.border}`, borderRadius:6, padding:"2px 8px" }}>Month</span>
              </div>
              {TOP_CUSTOMERS.map((cu, i) => (
                <div key={i} style={{ marginBottom:11 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                    <div style={{ width:26, height:26, borderRadius:"50%", background:t.accent+"1a", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:t.accent, flexShrink:0 }}>
                      {cu.name[0]}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:11, fontWeight:600, color:t.textPri, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{cu.name}</div>
                      <div style={{ fontSize:9, color:t.textMuted }}>{cu.tag}</div>
                    </div>
                    <div style={{ fontSize:11, fontWeight:700, color:t.textPri, flexShrink:0 }}>{cu.spent}</div>
                  </div>
                  <div style={{ height:3, borderRadius:2, background:dark?"#2a2a3a":"#ebebf0", overflow:"hidden", marginLeft:34 }}>
                    <div style={{ height:"100%", width:`${cu.pct}%`, background:i===0?t.accent:t.accent+"50", borderRadius:2, transition:"width 0.5s" }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}