"use client";
// src/app/tracking/trip-history/page.tsx

import { useTheme } from "@/src/context/ThemeContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import AppShell from "@/src/components/layout/Appshell";
import TopBar   from "@/src/components/layout/Topbar";
import { Ic }   from "@/src/components/ui/Icons";

// ─── Data ─────────────────────────────────────────────────────────────────────
const TRIPS = [
  { id:"TRP-001", car:"BMW 3 Series",    image:"https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&q=80", from:"Accra Mall, Spintex Rd", to:"Kotoka Intl Airport",  date:"Jun 10, 2025", start:"09:00", end:"09:32", km:18.4, dur:"32 min",  cost:38.00, stops:0 },
  { id:"TRP-002", car:"Tesla Model S",   image:"https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&q=80", from:"Tema Community 1",      to:"Osu, Oxford Street",   date:"May 28, 2025", start:"14:00", end:"14:51", km:31.2, dur:"51 min",  cost:45.00, stops:1 },
  { id:"TRP-003", car:"Mini Countryman", image:"https://images.unsplash.com/photo-1546614042-7df3c24c9e5d?w=400&q=80", from:"East Legon Hills",      to:"Achimota Mall",        date:"May 15, 2025", start:"08:00", end:"08:24", km:12.8, dur:"24 min",  cost:28.50, stops:0 },
  { id:"TRP-004", car:"Porsche Macan",   image:"https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80", from:"Cantonments",        to:"Labadi Beach",         date:"Apr 5, 2025",  start:"09:00", end:"14:10", km:72.0, dur:"5h 10m",  cost:55.00, stops:3 },
  { id:"TRP-005", car:"Ford Focus ST",   image:"https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&q=80", from:"Dome Market",          to:"University of Ghana",  date:"Mar 22, 2025", start:"07:30", end:"08:02", km:9.3,  dur:"32 min",  cost:26.75, stops:0 },
];

const TOTAL_KM    = TRIPS.reduce((s,t) => s + t.km, 0).toFixed(1);
const TOTAL_SPENT = TRIPS.reduce((s,t) => s + t.cost, 0).toFixed(2);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TripHistoryPage() {
  const router = useRouter();
  const { dark, setDark, t } = useTheme();
  const [sel, setSel]       = useState<string|null>(null);
  const [search, setSearch] = useState("");

  const filtered = TRIPS.filter(tr =>
    tr.car.toLowerCase().includes(search.toLowerCase()) ||
    tr.from.toLowerCase().includes(search.toLowerCase()) ||
    tr.to.toLowerCase().includes(search.toLowerCase())
  );
  const selected = TRIPS.find(tr => tr.id === sel) ?? null;

  return (
    <AppShell active="Trip History" dark={dark} setDark={setDark} t={t}>
      <TopBar
        title="Trip History" subtitle={`${TRIPS.length} trips recorded`}
        dark={dark} setDark={setDark} t={t}
        actions={
          <button
            onClick={() => router.push("/rentals/booking")}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8, border:"none", background:t.accent, color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
          >
            <span style={{ display:"flex" }}>{Ic.Booking("#fff")}</span>
            Book a Rental
          </button>
        }
      />

      <div style={{ flex:1, overflowY:"auto", padding:"24px", background:t.bg }}>

        {/* ── Summary KPI cards ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
          {[
            { label:"Total Trips",    value:`${TRIPS.length}`,      icon:(c:string)=>Ic.History(c)  },
            { label:"Total Distance", value:`${TOTAL_KM} km`,       icon:(c:string)=>Ic.Walk(c)     },
            { label:"Total Time",     value:"2h 29m",               icon:(c:string)=>Ic.Booking(c)  },
            { label:"Total Spent",    value:`$${TOTAL_SPENT}`,      icon:(c:string)=>Ic.Payment(c)  },
          ].map(s => (
            <div key={s.label}
              style={{ background:t.cardBg, borderRadius:12, border:`1px solid ${t.border}`, padding:"16px 20px", transition:"border-color 0.15s" }}
              onMouseEnter={e=>(e.currentTarget.style.borderColor=t.accent)}
              onMouseLeave={e=>(e.currentTarget.style.borderColor=t.border)}
            >
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <span style={{ fontSize:11, fontWeight:600, color:t.textMuted, textTransform:"uppercase", letterSpacing:1 }}>{s.label}</span>
                <span style={{ display:"flex", opacity:0.4 }}>{s.icon(t.textMuted)}</span>
              </div>
              <div style={{ fontSize:22, fontWeight:800, color:t.textPri }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* ── Main layout: list + optional detail panel ── */}
        <div style={{ display:"grid", gridTemplateColumns: sel ? "1fr 360px" : "1fr", gap:20, alignItems:"start" }}>

          {/* Trip list */}
          <div>
            {/* search */}
            <div style={{ position:"relative", marginBottom:16, maxWidth:360 }}>
              <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", display:"flex" }}>{Ic.Search(t.textMuted)}</span>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by car, pickup or destination…"
                style={{ width:"100%", padding:"9px 14px 9px 32px", borderRadius:10, border:`1px solid ${t.border}`, background:t.cardBg, color:t.textPri, fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box" }}
                onFocus={e=>(e.target.style.borderColor=t.accent)}
                onBlur={e=>(e.target.style.borderColor=t.border)}
              />
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {filtered.map(tr => {
                const isSelected = sel === tr.id;
                return (
                  <div key={tr.id}
                    onClick={() => setSel(isSelected ? null : tr.id)}
                    style={{
                      background:t.cardBg, borderRadius:14,
                      border:`1.5px solid ${isSelected ? t.accent : t.border}`,
                      padding:"16px 20px", cursor:"pointer",
                      display:"flex", alignItems:"center", gap:16,
                      transition:"border-color 0.15s, transform 0.15s",
                      boxShadow: isSelected ? `0 0 0 3px ${t.accent}18` : "none",
                    }}
                    onMouseEnter={e=>{ if(!isSelected)(e.currentTarget as HTMLDivElement).style.borderColor=t.accent; }}
                    onMouseLeave={e=>{ if(!isSelected)(e.currentTarget as HTMLDivElement).style.borderColor=t.border; }}
                  >
                    {/* car image */}
                    <div style={{ width:80, height:56, borderRadius:10, overflow:"hidden", flexShrink:0, position:"relative", background:dark?"#111122":"#f0f0f6" }}>
                      <Image src={tr.image} alt={tr.car} fill style={{ objectFit:"cover" }}/>
                    </div>

                    {/* trip info */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:14, fontWeight:700, color:t.textPri, marginBottom:5 }}>{tr.car}</div>

                      {/* route */}
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                          <span style={{ display:"flex", opacity:0.45 }}>{Ic.Pin(t.textMuted)}</span>
                          <span style={{ fontSize:12, color:t.textSec, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:120 }}>{tr.from}</span>
                        </div>
                        <span style={{ display:"flex", opacity:0.3 }}>{Ic.ArrowRight(t.textMuted)}</span>
                        <span style={{ fontSize:12, color:t.textSec, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:120 }}>{tr.to}</span>
                      </div>

                      {/* meta pills */}
                      <div style={{ display:"flex", gap:8 }}>
                        {[
                          { icon:(c:string)=>Ic.Booking(c), val:tr.date  },
                          { icon:(c:string)=>Ic.History(c), val:tr.dur   },
                          { icon:(c:string)=>Ic.Walk(c),    val:`${tr.km} km` },
                        ].map((m,i) => (
                          <span key={i} style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:t.textMuted, background:t.bg, border:`1px solid ${t.border}`, borderRadius:20, padding:"2px 9px" }}>
                            <span style={{ display:"flex", opacity:0.5 }}>{m.icon(t.textMuted)}</span>
                            {m.val}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* cost + time */}
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontSize:17, fontWeight:800, color:t.textPri, marginBottom:3 }}>${tr.cost.toFixed(2)}</div>
                      <div style={{ fontSize:11, color:t.textMuted }}>{tr.start} – {tr.end}</div>
                      <div style={{ marginTop:6 }}>
                        <span style={{ fontSize:9, fontWeight:700, color:"#10B981", background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:20, padding:"2px 8px" }}>
                          Completed
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div style={{ textAlign:"center", padding:"48px 20px", color:t.textMuted }}>
                  <span style={{ display:"flex", justifyContent:"center", opacity:0.3, marginBottom:12, transform:"scale(2)" }}>{Ic.History(t.textMuted)}</span>
                  <div style={{ fontSize:14, fontWeight:600, color:t.textSec, marginBottom:6 }}>No trips found</div>
                  <div style={{ fontSize:12 }}>Try a different search term</div>
                </div>
              )}
            </div>
          </div>

          {/* ── Detail panel ── */}
          {selected && (
            <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, overflow:"hidden", position:"sticky", top:0 }}>

              {/* car image header */}
              <div style={{ position:"relative", height:160 }}>
                <Image src={selected.image} alt={selected.car} fill style={{ objectFit:"cover" }}/>
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 50%)", pointerEvents:"none" }}/>
                <div style={{ position:"absolute", bottom:14, left:16, right:16, display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
                  <div>
                    <div style={{ fontSize:16, fontWeight:800, color:"#fff" }}>{selected.car}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", marginTop:2 }}>{selected.id}</div>
                  </div>
                  <span style={{ fontSize:9, fontWeight:700, color:"#10B981", background:"rgba(16,185,129,0.2)", border:"1px solid rgba(16,185,129,0.4)", borderRadius:20, padding:"4px 10px" }}>
                    Completed
                  </span>
                </div>
                <button onClick={() => setSel(null)}
                  style={{ position:"absolute", top:10, right:10, width:26, height:26, borderRadius:"50%", background:"rgba(0,0,0,0.5)", border:"none", cursor:"pointer", color:"#fff", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  ✕
                </button>
              </div>

              <div style={{ padding:"18px" }}>
                {/* route visual */}
                <div style={{ background:t.bg, borderRadius:10, border:`1px solid ${t.border}`, padding:"14px 16px", marginBottom:16 }}>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                    {/* timeline line */}
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:0, flexShrink:0, paddingTop:3 }}>
                      <div style={{ width:9, height:9, borderRadius:"50%", background:"#10B981", border:"2px solid #10B981" }}/>
                      <div style={{ width:1, height:28, background:t.divider }}/>
                      {selected.stops > 0 && (
                        <>
                          <div style={{ width:7, height:7, borderRadius:"50%", background:t.accent, border:`2px solid ${t.accent}` }}/>
                          <div style={{ width:1, height:28, background:t.divider }}/>
                        </>
                      )}
                      <div style={{ width:9, height:9, borderRadius:"50%", background:"#EF4444", border:"2px solid #EF4444" }}/>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ marginBottom: selected.stops > 0 ? 18 : 28 }}>
                        <div style={{ fontSize:11, color:t.textMuted, marginBottom:2 }}>Pickup · {selected.start}</div>
                        <div style={{ fontSize:13, fontWeight:600, color:t.textPri }}>{selected.from}</div>
                      </div>
                      {selected.stops > 0 && (
                        <div style={{ marginBottom:18 }}>
                          <div style={{ fontSize:11, color:t.textMuted, marginBottom:2 }}>{selected.stops} stop{selected.stops>1?"s":""}</div>
                          <div style={{ fontSize:13, fontWeight:600, color:t.textSec }}>En route</div>
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize:11, color:t.textMuted, marginBottom:2 }}>Drop-off · {selected.end}</div>
                        <div style={{ fontSize:13, fontWeight:600, color:t.textPri }}>{selected.to}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* stats grid */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                  {[
                    { label:"Distance",  value:`${selected.km} km`,      icon:(c:string)=>Ic.Walk(c)     },
                    { label:"Duration",  value:selected.dur,              icon:(c:string)=>Ic.History(c)  },
                    { label:"Departed",  value:selected.start,            icon:(c:string)=>Ic.Booking(c)  },
                    { label:"Arrived",   value:selected.end,              icon:(c:string)=>Ic.Pin(c)      },
                  ].map(row => (
                    <div key={row.label} style={{ background:t.bg, borderRadius:9, border:`1px solid ${t.border}`, padding:"10px 12px", display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ display:"flex", opacity:0.4 }}>{row.icon(t.textMuted)}</span>
                      <div>
                        <div style={{ fontSize:9, color:t.textMuted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:2 }}>{row.label}</div>
                        <div style={{ fontSize:12, fontWeight:700, color:t.textPri }}>{row.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* cost row */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", background:t.bg, borderRadius:10, border:`1px solid ${t.border}`, marginBottom:14 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ display:"flex", opacity:0.4 }}>{Ic.Payment(t.textMuted)}</span>
                    <span style={{ fontSize:12, color:t.textSec }}>Trip cost</span>
                  </div>
                  <span style={{ fontSize:18, fontWeight:800, color:t.textPri }}>${selected.cost.toFixed(2)}</span>
                </div>

                {/* CTA */}
                <button onClick={() => router.push("/rentals/booking")}
                  style={{ width:"100%", padding:"12px 0", borderRadius:10, border:"none", background:t.accent, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
                  <span style={{ display:"flex" }}>{Ic.Booking("#fff")}</span>
                  Book This Car Again
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </AppShell>
  );
}