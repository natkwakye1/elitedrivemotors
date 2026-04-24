"use client";
// src/app/dashboard/super-admin/cars/page.tsx
// Admin Fleet Management — vertical sidebar filter, map view with car list, detail drawer.

import { useTheme } from "@/src/context/ThemeContext";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import { CARS } from "@/src/lib/data/cars";
import AppShell from "@/src/components/layout/Appshell";
import TopBar from "@/src/components/layout/Topbar";
import Sidebar from "@/src/components/layout/Sidebar";
import { Ic } from "@/src/components/ui/Icons";
import type { Car } from "@/src/types/car";
import { DEFAULT_FILTERS } from "@/src/types/car";
import type { Filters } from "@/src/types/car";
import type { CarPin } from "@/src/components/tracking/LeafletMap";

const LeafletMap = dynamic(() => import("@/src/components/tracking/LeafletMap"), { ssr: false });

import { FLEET_DATA, DEFAULT_FLEET_ENTRY } from "@/src/lib/data/fleet";

const STATUS_COLOR: Record<string, string> = {
  Available:    "#10B981",
  Rented:       "#3B82F6",
  "In Service": "#F59E0B",
};

const STATUS_OPTS = ["All", "Available", "Rented", "In Service"];

export default function AdminFleetPage() {
  const router = useRouter();
  const { dark, setDark, t } = useTheme();

  const [filters,      setFilters]      = useState<Filters>(DEFAULT_FILTERS);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected,     setSelected]     = useState<Car | null>(null);
  const [showMap,      setShowMap]      = useState(false);

  const filtered = useMemo(() => CARS.filter(c => {
    const fleet = FLEET_DATA[c.id];
    if (statusFilter !== "All" && fleet?.status !== statusFilter) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (![c.name, c.spec, c.type, c.fuel, fleet?.plate ?? ""].some(s => s.toLowerCase().includes(q))) return false;
    }
    if (filters.bodyTypes.length > 0 && !filters.bodyTypes.includes(c.type)) return false;
    if (filters.fuelTypes.length > 0 && !filters.fuelTypes.includes(c.fuel)) return false;
    if (filters.transmission !== "Any" && c.transmission !== filters.transmission) return false;
    if (c.price < filters.priceMin || c.price > filters.priceMax) return false;
    if (filters.availableNow && fleet?.status !== "Available") return false;
    return true;
  }), [filters, statusFilter]);

  const totalAvail   = Object.values(FLEET_DATA).filter(f => f.status === "Available").length;
  const totalRented  = Object.values(FLEET_DATA).filter(f => f.status === "Rented").length;
  const totalService = Object.values(FLEET_DATA).filter(f => f.status === "In Service").length;

  const selFleet: FleetEntry = selected ? (FLEET_DATA[selected.id] ?? DEFAULT_FLEET_ENTRY) : DEFAULT_FLEET_ENTRY;
  const selColor = selFleet ? STATUS_COLOR[selFleet.status] : "#10B981";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${t.bg}; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${t.scrollThumb}; border-radius: 4px; }
        input::placeholder { color: ${t.inputText}; }
        @keyframes drawerIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>

      <AppShell active="Fleet Cars" dark={dark} setDark={setDark} t={t}>
        <TopBar
          title="Fleet Management"
          subtitle={`${CARS.length} vehicles · ${totalAvail} available`}
          dark={dark} setDark={setDark} t={t}
          actions={
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <button
                onClick={() => setShowMap(v => !v)}
                style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 13px", borderRadius:8, border:`1px solid ${showMap ? t.accent : t.border}`, background:showMap ? t.accent+"18" : t.bg, color:showMap ? t.accent : t.textSec, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s" }}
              >
                <span style={{ display:"flex" }}>{Ic.Map(showMap ? t.accent : t.textMuted)}</span>
                {showMap ? "Hide Map" : "Show Map"}
              </button>
              <button
                onClick={() => router.push("/dashboard/super-admin/cars/add")}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8, border:"none", background:t.accent, color:t.accentFg, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                Add Vehicle
              </button>
            </div>
          }
        />

        {/* ── Summary strip with status filter pills ── */}
        <div style={{ padding:"10px 20px", borderBottom:`1px solid ${t.border}`, background:t.cardBg, display:"flex", gap:12, alignItems:"center", flexShrink:0, flexWrap:"wrap" }}>
          {[
            { label:"Total Fleet",  value:CARS.length,   color:t.textPri },
            { label:"Available",    value:totalAvail,    color:t.textPri },
            { label:"Rented Out",   value:totalRented,   color:t.textPri },
            { label:"In Service",   value:totalService,  color:t.textPri },
          ].map((s, i) => (
            <div key={s.label} style={{ display:"flex", alignItems:"center", gap:8, paddingRight:12, borderRight:i < 3 ? `1px solid ${t.border}` : "none" }}>
              <span style={{ fontSize:20, fontWeight:800, color:s.color, lineHeight:1 }}>{s.value}</span>
              <span style={{ fontSize:11, color:t.textPri, lineHeight:1.3 }}>{s.label}</span>
            </div>
          ))}

          <div style={{ width:1, height:24, background:t.border, margin:"0 4px" }}/>

          <div style={{ display:"flex", gap:4, alignItems:"center" }}>
            <span style={{ fontSize:11, color:t.textPri, fontWeight:600 }}>Status:</span>
            {STATUS_OPTS.map(s => {
              const sc = s === "All" ? t.accent : STATUS_COLOR[s];
              return (
                <button key={s} onClick={() => setStatusFilter(s)}
                  style={{ padding:"5px 11px", borderRadius:20, cursor:"pointer", border:`1px solid ${statusFilter===s ? sc : t.border}`, background:statusFilter===s ? sc+"18" : "transparent", color:statusFilter===s ? sc : t.textSec, fontSize:11, fontWeight:statusFilter===s ? 700 : 500, fontFamily:"'DM Sans',sans-serif", transition:"all 0.12s" }}>
                  {s}
                </button>
              );
            })}
          </div>

          <span style={{ marginLeft:"auto", fontSize:11, color:t.textPri }}>{filtered.length} shown</span>
        </div>

        {/* ── Main layout ── */}
        <div style={{ flex:1, display:"flex", overflow:"hidden", position:"relative" }}>

          {/* Vertical filter sidebar — hidden in map mode */}
          {!showMap && <Sidebar f={filters} sf={setFilters} t={t} />}

          {showMap ? (
            /* ═══════════════════════════════════════════════════════════════════
               MAP VIEW — vertical car list (left) + map (right)
               ═══════════════════════════════════════════════════════════════════ */
            <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

              {/* ── Vertical car list panel ── */}
              <div style={{ width:280, flexShrink:0, background:t.cardBg, borderRight:`1px solid ${t.border}`, display:"flex", flexDirection:"column", overflow:"hidden" }}>
                <div style={{ padding:"12px 14px 10px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span style={{ fontSize:12, fontWeight:700, color:t.textPri }}>{filtered.length} Vehicles</span>
                  <span style={{ fontSize:10, color:t.textMuted }}>Live Tracking</span>
                </div>
                <div style={{ flex:1, overflowY:"auto" }}>
                  {filtered.map(car => {
                    const fleet     = FLEET_DATA[car.id];
                    const sColor    = STATUS_COLOR[fleet?.status ?? "Available"];
                    const isActive  = selected?.id === car.id;
                    const isRented  = fleet?.status === "Rented";
                    return (
                      <div key={car.id}
                        onClick={() => setSelected(isActive ? null : car)}
                        style={{
                          padding:"10px 14px", cursor:"pointer",
                          borderBottom:`1px solid ${t.divider}`,
                          background: isActive ? t.accent+"0D" : "transparent",
                          borderLeft: isActive ? `3px solid ${t.accent}` : "3px solid transparent",
                          transition:"all 0.15s",
                        }}
                        onMouseEnter={e => { if (!isActive) (e.currentTarget.style.background = t.bg); }}
                        onMouseLeave={e => { if (!isActive) (e.currentTarget.style.background = "transparent"); }}
                      >
                        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                          {/* Thumbnail */}
                          <div style={{ width:52, height:40, borderRadius:8, overflow:"hidden", position:"relative", flexShrink:0, background:dark?"#222":"#eee" }}>
                            <Image src={car.image} alt={car.name} fill sizes="52px" style={{ objectFit:"cover" }} />
                          </div>
                          {/* Info */}
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                              <span style={{ fontSize:12, fontWeight:700, color:t.textPri, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{car.name}</span>
                            </div>
                            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                              <span style={{ fontSize:10, color:t.textMuted }}>{fleet?.plate}</span>
                              <span style={{ fontSize:9, fontWeight:700, color:sColor, background:sColor+"18", borderRadius:10, padding:"1px 7px", display:"flex", alignItems:"center", gap:3 }}>
                                {isRented && (
                                  <span style={{ width:5, height:5, borderRadius:"50%", background:sColor, display:"inline-block", animation:"pulse 1.5s ease-in-out infinite" }}/>
                                )}
                                {!isRented && (
                                  <span style={{ width:5, height:5, borderRadius:"50%", background:sColor, display:"inline-block" }}/>
                                )}
                                {fleet?.status}
                              </span>
                            </div>
                            {isRented && (
                              <div style={{ fontSize:9, color:t.textSec, marginTop:2, display:"flex", alignItems:"center", gap:4 }}>
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={t.textMuted} strokeWidth="2"/><path d="M12 6v6l4 2" stroke={t.textMuted} strokeWidth="2" strokeLinecap="round"/></svg>
                                Driver: {fleet?.driver}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Map area ── */}
              <div style={{ flex:1, position:"relative" }}>
                <LeafletMap
                  dark={dark}
                  t={t}
                  cars={filtered.map((c): CarPin => {
                    const fleet = FLEET_DATA[c.id];
                    return {
                      id: c.id, name: c.name, spec: c.spec, price: c.price,
                      image: c.image, type: c.type, fuel: c.fuel,
                      transmission: c.transmission, rating: c.rating,
                      status: fleet?.status === "Rented" ? "In Transit" : "Parked",
                      salePrice: fleet?.plate ?? "",
                    };
                  })}
                  center={{ lat: 5.5908, lng: -0.2043 }}
                  zoom={13}
                  onCarClick={id => {
                    const car = CARS.find(c => c.id === id);
                    if (car) setSelected(car);
                  }}
                />
                {/* Map legend */}
                <div style={{
                  position:"absolute", bottom:16, left:16, zIndex:1000,
                  background:t.cardBg, borderRadius:10, border:`1px solid ${t.border}`,
                  padding:"10px 14px", display:"flex", gap:14,
                  boxShadow: dark ? "0 4px 16px rgba(0,0,0,0.5)" : "0 4px 16px rgba(0,0,0,0.1)",
                }}>
                  {[
                    { label:"Available", color:"#10B981" },
                    { label:"Rented",    color:"#3B82F6" },
                    { label:"In Service",color:"#F59E0B" },
                  ].map(l => (
                    <div key={l.label} style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <span style={{ width:8, height:8, borderRadius:"50%", background:l.color, display:"inline-block" }}/>
                      <span style={{ fontSize:10, fontWeight:600, color:t.textSec }}>{l.label}</span>
                    </div>
                  ))}
                  <span style={{ fontSize:10, color:t.textMuted }}>{filtered.length} vehicles</span>
                </div>

                {/* Live indicator */}
                <div style={{
                  position:"absolute", top:16, right:16, zIndex:1000,
                  background:t.cardBg, borderRadius:8, border:`1px solid ${t.border}`,
                  padding:"6px 12px", display:"flex", alignItems:"center", gap:6,
                  boxShadow: dark ? "0 2px 8px rgba(0,0,0,0.5)" : "0 2px 8px rgba(0,0,0,0.1)",
                }}>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:"#EF4444", display:"inline-block", animation:"pulse 1.5s ease-in-out infinite" }}/>
                  <span style={{ fontSize:10, fontWeight:700, color:t.textPri }}>LIVE</span>
                  <span style={{ fontSize:10, color:t.textMuted }}>{totalRented} in transit</span>
                </div>
              </div>
            </div>
          ) : (
            /* ═══════════════════════════════════════════════════════════════════
               GRID VIEW — car cards
               ═══════════════════════════════════════════════════════════════════ */
            <div style={{ flex:1, overflowY:"auto", padding:20, background:t.bg, display:"flex", flexDirection:"column" }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign:"center", padding:"80px 20px" }}>
                  <div style={{ fontSize:14, fontWeight:700, color:t.textSec, marginBottom:8 }}>No vehicles match your filters</div>
                  <div style={{ fontSize:12, color:t.textMuted, marginBottom:16 }}>Adjust the filters to see results</div>
                  <button onClick={() => { setFilters(DEFAULT_FILTERS); setStatusFilter("All"); }}
                    style={{ fontSize:12, color:t.accent, background:"none", border:`1px solid ${t.accent}`, borderRadius:8, padding:"7px 18px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                    Reset filters
                  </button>
                </div>
              ) : (
                <div style={{ display:"grid", gridTemplateColumns:`repeat(auto-fill, minmax(${selected ? "260px" : "280px"}, 1fr))`, gap:14, alignContent:"start" }}>
                  {filtered.map(car => {
                    const fleet  = FLEET_DATA[car.id];
                    const sColor = STATUS_COLOR[fleet?.status ?? "Available"];
                    const isSelected = selected?.id === car.id;
                    return (
                      <div key={car.id}
                        onClick={() => setSelected(isSelected ? null : car)}
                        style={{ background:t.cardBg, borderRadius:14, border:`${isSelected?"2px":"1px"} solid ${isSelected ? t.accent : t.border}`, overflow:"hidden", cursor:"pointer", transition:"all 0.15s",
                          transform: isSelected ? "translateY(-2px)" : "none",
                          boxShadow: isSelected ? `0 0 0 3px ${t.accent}18` : "none" }}
                        onMouseEnter={e => { if (!isSelected) { (e.currentTarget as HTMLDivElement).style.borderColor = t.accent+"88"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; } }}
                        onMouseLeave={e => { if (!isSelected) { (e.currentTarget as HTMLDivElement).style.borderColor = t.border; (e.currentTarget as HTMLDivElement).style.transform = "none"; } }}
                      >
                        {/* Image */}
                        <div style={{ position:"relative", height:150, background:dark?"#111":"#f0f0f6", overflow:"hidden" }}>
                          <Image src={car.image} alt={car.name} fill sizes="300px" style={{ objectFit:"cover" }} />
                          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)" }}/>
                          <span style={{ position:"absolute", top:9, left:9, fontSize:10, fontWeight:700, color:sColor, background:sColor+"22", border:`1px solid ${sColor}44`, borderRadius:20, padding:"3px 9px" }}>
                            <span style={{ display:"inline-block", width:5, height:5, borderRadius:"50%", background:sColor, marginRight:4, verticalAlign:"middle" }}/>
                            {fleet?.status}
                          </span>
                          <span style={{ position:"absolute", top:9, right:9, fontSize:10, fontWeight:600, color:"rgba(255,255,255,0.9)", background:"rgba(0,0,0,0.55)", borderRadius:6, padding:"3px 8px" }}>
                            {fleet?.plate}
                          </span>
                          <div style={{ position:"absolute", bottom:10, left:12 }}>
                            <div style={{ fontSize:14, fontWeight:800, color:"#fff" }}>{car.name}</div>
                            <div style={{ fontSize:10, color:"rgba(255,255,255,0.6)" }}>{car.type} · {car.fuel}</div>
                          </div>
                        </div>

                        {/* Info row */}
                        <div style={{ padding:"12px 14px 10px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                          {[
                            { label:"Mileage",   value:`${(fleet?.mileage??0).toLocaleString()} km` },
                            { label:"Driver",    value:fleet?.driver ?? "—" },
                          ].map(r => (
                            <div key={r.label} style={{ background:t.bg, borderRadius:7, padding:"7px 9px", border:`1px solid ${t.border}` }}>
                              <div style={{ fontSize:9, color:t.textMuted, textTransform:"uppercase", letterSpacing:0.5 }}>{r.label}</div>
                              <div style={{ fontSize:11, fontWeight:700, color:t.textPri, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.value}</div>
                            </div>
                          ))}
                        </div>

                        {/* Action buttons */}
                        <div style={{ padding:"0 14px 12px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
                          <button
                            onClick={e => { e.stopPropagation(); router.push(`/dashboard/super-admin/cars/edit?id=${car.id}`); }}
                            style={{ padding:"8px 0", borderRadius:8, border:`1.5px solid ${t.accent}`, background:"transparent", color:t.accent, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); setSelected(isSelected ? null : car); }}
                            style={{ padding:"8px 0", borderRadius:8, border:"none", background:t.accent, color:t.accentFg, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
                          >
                            {isSelected ? "Close" : "Details"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Slide-in detail drawer ── */}
          {selected && (
            <div style={{
              width:360, flexShrink:0, background:t.cardBg, borderLeft:`1px solid ${t.border}`,
              display:"flex", flexDirection:"column", overflow:"hidden",
              animation:"drawerIn 0.25s cubic-bezier(0.4,0,0.2,1)",
            }}>
              {/* Image header */}
              <div style={{ position:"relative", height:200, background:dark?"#111":"#f0f0f6", flexShrink:0 }}>
                <Image src={selected.image} alt={selected.name} fill sizes="360px" style={{ objectFit:"cover" }} />
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%)" }}/>
                <button onClick={() => setSelected(null)} style={{ position:"absolute", top:12, right:12, width:30, height:30, borderRadius:"50%", background:"rgba(0,0,0,0.5)", border:"1px solid rgba(255,255,255,0.15)", color:"#fff", fontSize:18, lineHeight:1, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
                <span style={{ position:"absolute", top:12, left:12, fontSize:10, fontWeight:700, color:selColor, background:selColor+"25", border:`1px solid ${selColor}44`, borderRadius:20, padding:"4px 11px" }}>
                  <span style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", background:selColor, marginRight:5, verticalAlign:"middle" }}/>
                  {selFleet.status}
                </span>
                <div style={{ position:"absolute", bottom:14, left:14 }}>
                  <div style={{ fontSize:18, fontWeight:800, color:"#fff" }}>{selected.name}</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.65)", marginTop:2 }}>{selected.spec}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginTop:1 }}>{selFleet.plate} · {selFleet.year}</div>
                </div>
              </div>

              {/* Scrollable content */}
              <div style={{ flex:1, overflowY:"auto", padding:"16px 18px" }}>

                {/* Key stats grid */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
                  {[
                    { label:"Mileage",       value:`${selFleet.mileage.toLocaleString()} km`  },
                    { label:"Last Service",  value:selFleet.lastService                        },
                    { label:"Next Service",  value:selFleet.nextService                        },
                    { label:"Daily Rate",    value:`GH₵ ${selFleet.rentalRate}/day`            },
                    { label:"Sale Price",    value:`$${selFleet.salePrice.toLocaleString()}`   },
                    { label:"Year",          value:String(selFleet.year)                       },
                  ].map(r => (
                    <div key={r.label} style={{ background:t.bg, borderRadius:9, padding:"10px 12px", border:`1px solid ${t.border}` }}>
                      <div style={{ fontSize:9, color:t.textMuted, textTransform:"uppercase", letterSpacing:0.6, marginBottom:3 }}>{r.label}</div>
                      <div style={{ fontSize:12, fontWeight:700, color:t.textPri }}>{r.value}</div>
                    </div>
                  ))}
                </div>

                {/* Location & Driver */}
                <div style={{ background:t.bg, borderRadius:10, border:`1px solid ${t.border}`, padding:"12px 14px", marginBottom:12 }}>
                  <div style={{ fontSize:10, color:t.textMuted, textTransform:"uppercase", letterSpacing:0.6, marginBottom:8 }}>Current Assignment</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <span style={{ fontSize:11, color:t.textSec }}>Driver</span>
                      <span style={{ fontSize:11, fontWeight:700, color:t.textPri }}>{selFleet.driver}</span>
                    </div>
                    <div style={{ height:1, background:t.divider }}/>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <span style={{ fontSize:11, color:t.textSec }}>Location</span>
                      <span style={{ fontSize:11, fontWeight:700, color:t.textPri, textAlign:"right", maxWidth:180 }}>{selFleet.location}</span>
                    </div>
                  </div>
                  {/* Mini map */}
                  <div style={{ height:140, borderRadius:8, overflow:"hidden", border:`1px solid ${t.border}`, marginTop:10 }}>
                    <LeafletMap
                      dark={dark}
                      t={t}
                      singleCar={{
                        id: selected.id, name: selected.name, spec: selected.spec,
                        price: selected.price, image: selected.image, type: selected.type,
                        fuel: selected.fuel, transmission: selected.transmission,
                        rating: selected.rating,
                        status: selFleet.status === "Rented" ? "In Transit" : "Parked",
                      }}
                      zoom={15}
                    />
                  </div>
                </div>

                {/* Specs */}
                <div style={{ background:t.bg, borderRadius:10, border:`1px solid ${t.border}`, padding:"12px 14px", marginBottom:16 }}>
                  <div style={{ fontSize:10, color:t.textMuted, textTransform:"uppercase", letterSpacing:0.6, marginBottom:8 }}>Specifications</div>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {[selected.type, selected.fuel, selected.transmission, `${selected.seats} seats`].map(s => (
                      <span key={s} style={{ fontSize:10, fontWeight:600, color:t.textSec, background:t.cardBg, border:`1px solid ${t.border}`, borderRadius:6, padding:"4px 10px" }}>{s}</span>
                    ))}
                  </div>
                  <div style={{ marginTop:10, display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontSize:11, color:t.textSec }}>Rating</span>
                    <span style={{ fontSize:11, fontWeight:700, color:t.textPri }}>
                      <span style={{ color:"#F59E0B" }}>★</span> {selected.rating} ({selected.reviews} reviews)
                    </span>
                  </div>
                </div>

                {/* Admin actions */}
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {/* View Details — full page */}
                  <button
                    onClick={() => router.push(`/dashboard/super-admin/cars/${selected.id}`)}
                    style={{ width:"100%", padding:"11px", borderRadius:10, border:"none", background:t.accent, color:t.accentFg, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/></svg>
                    View Details
                  </button>
                  {/* Edit Vehicle */}
                  <button
                    onClick={() => router.push(`/dashboard/super-admin/cars/edit?id=${selected.id}`)}
                    style={{ width:"100%", padding:"11px", borderRadius:10, border:`1.5px solid ${t.accent}`, background:"transparent", color:t.accent, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Edit Vehicle
                  </button>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <button
                      onClick={() => router.push(`/dashboard/super-admin/customers`)}
                      style={{ padding:"10px", borderRadius:10, border:`1px solid ${t.border}`, background:"transparent", color:t.textSec, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
                    >
                      View Rentals
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/super-admin/reports`)}
                      style={{ padding:"10px", borderRadius:10, border:`1px solid ${t.border}`, background:"transparent", color:t.textSec, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
                    >
                      View Reports
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </>
  );
}
