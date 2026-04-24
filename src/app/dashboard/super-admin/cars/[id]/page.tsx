"use client";
// src/app/dashboard/super-admin/cars/[id]/page.tsx
// Admin Fleet — full vehicle detail page.

import { useTheme } from "@/src/context/ThemeContext";
import { useRouter, useParams } from "next/navigation";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import AppShell from "@/src/components/layout/Appshell";
import TopBar from "@/src/components/layout/Topbar";
import { Ic } from "@/src/components/ui/Icons";
import { CARS } from "@/src/lib/data/cars";

const LeafletMap = dynamic(() => import("@/src/components/tracking/LeafletMap"), { ssr: false });

// ── Fleet operational data (same source as fleet page) ────────────────────────
const FLEET_DATA: Record<number, {
  status:      "Available" | "Rented" | "In Service";
  plate:       string;
  mileage:     number;
  lastService: string;
  nextService: string;
  driver:      string;
  location:    string;
  rentalRate:  number;
  salePrice:   number;
  year:        number;
}> = {
  1:  { status:"Available",  plate:"GR-4421-22", mileage:34200, lastService:"Jan 15, 2026", nextService:"Jul 15, 2026", driver:"—",            location:"Liberation Rd, Accra",        rentalRate:85,  salePrice:24900, year:2022 },
  2:  { status:"Rented",     plate:"GT-2819-23", mileage:51800, lastService:"Dec 20, 2025", nextService:"Jun 20, 2026", driver:"Ama Darko",    location:"East Legon",                   rentalRate:65,  salePrice:18500, year:2023 },
  3:  { status:"Rented",     plate:"GN-0032-23", mileage:29400, lastService:"Feb 01, 2026", nextService:"Aug 01, 2026", driver:"Kofi Mensah",  location:"Spintex Road",                 rentalRate:95,  salePrice:27000, year:2023 },
  4:  { status:"Available",  plate:"GS-7731-24", mileage:11300, lastService:"Mar 02, 2026", nextService:"Sep 02, 2026", driver:"—",            location:"Oxford Street, Osu",           rentalRate:72,  salePrice:21500, year:2024 },
  5:  { status:"Rented",     plate:"GE-9912-23", mileage:42600, lastService:"Jan 28, 2026", nextService:"Jul 28, 2026", driver:"Yaw Boateng",  location:"Airport Bypass",               rentalRate:145, salePrice:52000, year:2023 },
  6:  { status:"In Service", plate:"GR-2341-22", mileage:67900, lastService:"Mar 10, 2026", nextService:"Sep 10, 2026", driver:"—",            location:"Community 11 Workshop, Tema",  rentalRate:75,  salePrice:22800, year:2022 },
  7:  { status:"Available",  plate:"GW-1122-24", mileage:8900,  lastService:"Feb 20, 2026", nextService:"Aug 20, 2026", driver:"—",            location:"Cantonments Rd",               rentalRate:195, salePrice:68000, year:2024 },
  8:  { status:"Available",  plate:"GT-5512-23", mileage:23100, lastService:"Jan 05, 2026", nextService:"Jul 05, 2026", driver:"—",            location:"Achimota",                     rentalRate:62,  salePrice:19900, year:2023 },
  9:  { status:"Rented",     plate:"GW-9908-22", mileage:55700, lastService:"Dec 10, 2025", nextService:"Jun 10, 2026", driver:"Abena Osei",   location:"Adjiringanor Rd, East Legon",  rentalRate:98,  salePrice:29500, year:2022 },
  10: { status:"Rented",     plate:"GR-5521-22", mileage:38400, lastService:"Feb 14, 2026", nextService:"Aug 14, 2026", driver:"Kwame Asante", location:"Ring Rd Central",              rentalRate:125, salePrice:38000, year:2022 },
  11: { status:"In Service", plate:"GN-8821-22", mileage:72100, lastService:"Mar 12, 2026", nextService:"Sep 12, 2026", driver:"—",            location:"East Legon Workshop",          rentalRate:148, salePrice:44000, year:2022 },
  12: { status:"Available",  plate:"GE-4490-23", mileage:15600, lastService:"Mar 01, 2026", nextService:"Sep 01, 2026", driver:"—",            location:"High Street, Accra",           rentalRate:235, salePrice:72000, year:2023 },
};

const STATUS_COLOR: Record<string, string> = {
  Available:    "#10B981",
  Rented:       "#3B82F6",
  "In Service": "#F59E0B",
};

// ── Mock rental history ───────────────────────────────────────────────────────
const RENTAL_HISTORY = [
  { customer:"Ama Darko",    from:"Feb 10, 2026", to:"Mar 01, 2026", revenue:"GH₵ 1,360", status:"Completed" },
  { customer:"Kofi Mensah",  from:"Jan 05, 2026", to:"Jan 20, 2026", revenue:"GH₵ 1,020", status:"Completed" },
  { customer:"Yaw Boateng",  from:"Dec 01, 2025", to:"Dec 18, 2025", revenue:"GH₵ 1,190", status:"Completed" },
];

const SERVICE_HISTORY = [
  { type:"Oil Change",          date:"Mar 10, 2026", cost:"GH₵ 350",  notes:"Full synthetic" },
  { type:"Tire Rotation",       date:"Jan 15, 2026", cost:"GH₵ 120",  notes:"All 4 tires" },
  { type:"Brake Inspection",    date:"Nov 20, 2025", cost:"GH₵ 200",  notes:"Pads at 60%" },
  { type:"AC Service",          date:"Oct 05, 2025", cost:"GH₵ 480",  notes:"Recharged + filter" },
];

export default function CarDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { dark, setDark, t } = useTheme();

  const carId = Number(params.id);
  const car   = useMemo(() => CARS.find(c => c.id === carId), [carId]);
  const fleet = car ? FLEET_DATA[car.id] : null;

  if (!car || !fleet) {
    return (
      <AppShell active="Fleet Cars" dark={dark} setDark={setDark} t={t}>
        <TopBar title="Vehicle Not Found" subtitle="Invalid vehicle ID" dark={dark} setDark={setDark} t={t} />
        <div style={{ padding:40, textAlign:"center" }}>
          <div style={{ fontSize:14, fontWeight:700, color:t.textSec, marginBottom:12 }}>Vehicle not found</div>
          <button onClick={() => router.push("/dashboard/super-admin/cars")}
            style={{ fontSize:12, color:t.accent, background:"none", border:`1px solid ${t.accent}`, borderRadius:8, padding:"8px 20px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
            Back to Fleet
          </button>
        </div>
      </AppShell>
    );
  }

  const sColor = STATUS_COLOR[fleet.status];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${t.bg}; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${t.scrollThumb}; border-radius: 4px; }
      `}</style>

      <AppShell active="Fleet Cars" dark={dark} setDark={setDark} t={t}>
        <TopBar
          title={car.name}
          subtitle={`${fleet.plate} · ${fleet.year} · ${car.spec}`}
          dark={dark} setDark={setDark} t={t}
          actions={
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <button onClick={() => router.push("/dashboard/super-admin/cars")}
                style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 13px", borderRadius:8, border:`1px solid ${t.border}`, background:t.bg, color:t.textSec, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                <svg width="8" height="12" viewBox="0 0 8 12" fill="none"><path d="M6.5 1l-5 5 5 5" stroke={t.textMuted} strokeWidth="1.5" strokeLinecap="round"/></svg>
                Back to Fleet
              </button>
              <button onClick={() => router.push(`/dashboard/super-admin/cars/edit?id=${car.id}`)}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8, border:"none", background:t.accent, color:t.accentFg, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Edit Vehicle
              </button>
            </div>
          }
        />

        {/* ── Page content ── */}
        <div style={{ flex:1, overflowY:"auto", padding:24, background:t.bg }}>

          {/* ── Hero section: Image + key info ── */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:24 }}>

            {/* Car image */}
            <div style={{ position:"relative", height:320, borderRadius:16, overflow:"hidden", background:dark?"#111":"#f0f0f6", border:`1px solid ${t.border}` }}>
              <Image src={car.image} alt={car.name} fill sizes="600px" style={{ objectFit:"cover" }} />
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)" }}/>
              {/* Status badge */}
              <span style={{ position:"absolute", top:14, left:14, fontSize:11, fontWeight:700, color:sColor, background:sColor+"22", border:`1px solid ${sColor}44`, borderRadius:20, padding:"5px 14px" }}>
                <span style={{ display:"inline-block", width:7, height:7, borderRadius:"50%", background:sColor, marginRight:6, verticalAlign:"middle" }}/>
                {fleet.status}
              </span>
              {/* Plate */}
              <span style={{ position:"absolute", top:14, right:14, fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.9)", background:"rgba(0,0,0,0.55)", borderRadius:8, padding:"5px 12px" }}>
                {fleet.plate}
              </span>
              {/* Name overlay */}
              <div style={{ position:"absolute", bottom:18, left:18 }}>
                <div style={{ fontSize:22, fontWeight:800, color:"#fff" }}>{car.name}</div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,0.6)", marginTop:3 }}>{car.spec}</div>
              </div>
            </div>

            {/* Key info cards */}
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {/* Quick stats */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                {[
                  { label:"Daily Rate",    value:`GH₵ ${fleet.rentalRate}`,                  color:t.accent },
                  { label:"Sale Price",    value:`$${fleet.salePrice.toLocaleString()}`,     color:"#10B981" },
                  { label:"Mileage",       value:`${fleet.mileage.toLocaleString()} km`,     color:t.textPri },
                ].map(s => (
                  <div key={s.label} style={{ background:t.cardBg, borderRadius:12, border:`1px solid ${t.border}`, padding:"14px 16px" }}>
                    <div style={{ fontSize:9, color:t.textMuted, textTransform:"uppercase", letterSpacing:0.8, marginBottom:6 }}>{s.label}</div>
                    <div style={{ fontSize:18, fontWeight:800, color:s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Vehicle specs */}
              <div style={{ background:t.cardBg, borderRadius:12, border:`1px solid ${t.border}`, padding:"16px 18px", flex:1 }}>
                <div style={{ fontSize:10, color:t.textMuted, textTransform:"uppercase", letterSpacing:0.8, marginBottom:12, fontWeight:700 }}>Vehicle Specifications</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {[
                    { label:"Body Type",     value:car.type },
                    { label:"Fuel",          value:car.fuel },
                    { label:"Transmission",  value:car.transmission },
                    { label:"Seats",         value:String(car.seats) },
                    { label:"Year",          value:String(fleet.year) },
                    { label:"Rating",        value:`★ ${car.rating} (${car.reviews})` },
                  ].map(r => (
                    <div key={r.label} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid ${t.divider}` }}>
                      <span style={{ fontSize:12, color:t.textSec }}>{r.label}</span>
                      <span style={{ fontSize:12, fontWeight:700, color:t.textPri }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Location & Assignment + Map ── */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:24 }}>

            {/* Current assignment */}
            <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"18px 20px" }}>
              <div style={{ fontSize:10, color:t.textMuted, textTransform:"uppercase", letterSpacing:0.8, marginBottom:14, fontWeight:700 }}>Current Assignment</div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {[
                  { label:"Driver",        value:fleet.driver },
                  { label:"Location",      value:fleet.location },
                  { label:"Last Service",  value:fleet.lastService },
                  { label:"Next Service",  value:fleet.nextService },
                ].map(r => (
                  <div key={r.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:12, color:t.textSec }}>{r.label}</span>
                    <span style={{ fontSize:12, fontWeight:700, color:t.textPri, textAlign:"right", maxWidth:200 }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live location map */}
            <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, overflow:"hidden" }}>
              <div style={{ padding:"14px 18px 0", fontSize:10, color:t.textMuted, textTransform:"uppercase", letterSpacing:0.8, fontWeight:700 }}>Live Location</div>
              <div style={{ height:220, margin:"10px 10px 10px", borderRadius:10, overflow:"hidden", border:`1px solid ${t.border}` }}>
                <LeafletMap
                  dark={dark}
                  t={t}
                  singleCar={{
                    id: car.id, name: car.name, spec: car.spec,
                    price: car.price, image: car.image, type: car.type,
                    fuel: car.fuel, transmission: car.transmission,
                    rating: car.rating,
                    status: fleet.status === "Rented" ? "In Transit" : "Parked",
                  }}
                  zoom={15}
                />
              </div>
            </div>
          </div>

          {/* ── Rental History ── */}
          <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"18px 20px", marginBottom:24 }}>
            <div style={{ fontSize:10, color:t.textMuted, textTransform:"uppercase", letterSpacing:0.8, marginBottom:14, fontWeight:700 }}>Rental History</div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:"'DM Sans',sans-serif" }}>
                <thead>
                  <tr>
                    {["Customer","From","To","Revenue","Status"].map(h => (
                      <th key={h} style={{ fontSize:10, fontWeight:700, color:t.textMuted, textTransform:"uppercase", letterSpacing:0.6, padding:"8px 12px", textAlign:"left", borderBottom:`1px solid ${t.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RENTAL_HISTORY.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontSize:12, fontWeight:600, color:t.textPri, padding:"10px 12px", borderBottom:`1px solid ${t.divider}` }}>{r.customer}</td>
                      <td style={{ fontSize:12, color:t.textSec, padding:"10px 12px", borderBottom:`1px solid ${t.divider}` }}>{r.from}</td>
                      <td style={{ fontSize:12, color:t.textSec, padding:"10px 12px", borderBottom:`1px solid ${t.divider}` }}>{r.to}</td>
                      <td style={{ fontSize:12, fontWeight:700, color:"#10B981", padding:"10px 12px", borderBottom:`1px solid ${t.divider}` }}>{r.revenue}</td>
                      <td style={{ padding:"10px 12px", borderBottom:`1px solid ${t.divider}` }}>
                        <span style={{ fontSize:10, fontWeight:700, color:"#10B981", background:"#10B98118", borderRadius:12, padding:"3px 10px" }}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Service History ── */}
          <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"18px 20px", marginBottom:24 }}>
            <div style={{ fontSize:10, color:t.textMuted, textTransform:"uppercase", letterSpacing:0.8, marginBottom:14, fontWeight:700 }}>Service History</div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:"'DM Sans',sans-serif" }}>
                <thead>
                  <tr>
                    {["Service Type","Date","Cost","Notes"].map(h => (
                      <th key={h} style={{ fontSize:10, fontWeight:700, color:t.textMuted, textTransform:"uppercase", letterSpacing:0.6, padding:"8px 12px", textAlign:"left", borderBottom:`1px solid ${t.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SERVICE_HISTORY.map((s, i) => (
                    <tr key={i}>
                      <td style={{ fontSize:12, fontWeight:600, color:t.textPri, padding:"10px 12px", borderBottom:`1px solid ${t.divider}` }}>{s.type}</td>
                      <td style={{ fontSize:12, color:t.textSec, padding:"10px 12px", borderBottom:`1px solid ${t.divider}` }}>{s.date}</td>
                      <td style={{ fontSize:12, fontWeight:700, color:"#F59E0B", padding:"10px 12px", borderBottom:`1px solid ${t.divider}` }}>{s.cost}</td>
                      <td style={{ fontSize:12, color:t.textSec, padding:"10px 12px", borderBottom:`1px solid ${t.divider}` }}>{s.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </AppShell>
    </>
  );
}
