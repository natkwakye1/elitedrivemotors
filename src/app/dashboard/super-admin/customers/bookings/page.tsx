"use client";
// src/app/dashboard/super-admin/customers/bookings/page.tsx

import { useTheme } from "@/src/context/ThemeContext";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import AppShell from "@/src/components/layout/Appshell";
import TopBar   from "@/src/components/layout/Topbar";
import AdminSidebar from "@/src/components/layout/AdminSidebar";
import type { AdminFilters } from "@/src/components/layout/AdminSidebar";
import { Ic }   from "@/src/components/ui/Icons";

// ─── Data ─────────────────────────────────────────────────────────────────────
const BOOKINGS = [
  { id:"BKG-001", car:"BMW 3 Series", plate:"GR-2341-22", image:"https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&q=80", date:"May 01, 2025", time:"09:00 AM", pickup:"Accra Central", dropoff:"Tema", days:3, daily:85, amount:"$255.00", status:"Confirmed", driver:"Kwame Asante", fuel:"Petrol" },
  { id:"BKG-002", car:"Tesla Model S", plate:"GW-1122-24", image:"https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&q=80", date:"May 12, 2025", time:"02:00 PM", pickup:"Airport Accra", dropoff:"Kumasi", days:2, daily:170, amount:"$340.00", status:"Pending", driver:"Abena Osei", fuel:"Electric" },
  { id:"BKG-003", car:"Mercedes C-Class", plate:"GN-8821-22", image:"https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&q=80", date:"Apr 20, 2025", time:"11:00 AM", pickup:"Osu, Accra", dropoff:"Osu, Accra", days:1, daily:96, amount:"$96.00", status:"Completed", driver:"Kofi Mensah", fuel:"Diesel" },
  { id:"BKG-004", car:"Audi Q5", plate:"GA-5544-23", image:"https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&q=80", date:"Mar 15, 2025", time:"08:30 AM", pickup:"East Legon", dropoff:"Cantonments", days:4, daily:120, amount:"$480.00", status:"Cancelled", driver:"—", fuel:"Petrol" },
  { id:"BKG-005", car:"Honda CR-V", plate:"GH-3310-24", image:"https://images.unsplash.com/photo-1546614042-7df3c24c9e5d?w=400&q=80", date:"Jun 05, 2025", time:"10:00 AM", pickup:"Achimota", dropoff:"Spintex", days:2, daily:95, amount:"$190.00", status:"Confirmed", driver:"Ama Darko", fuel:"Hybrid" },
];

const STATUS_COLOR: Record<string,string> = { Confirmed:"#10B981", Pending:"#F59E0B", Completed:"#4F46E5", Cancelled:"#EF4444" };
const STATUSES = ["Confirmed","Pending","Completed","Cancelled"];
const totalSpent = BOOKINGS.filter(b => b.status !== "Cancelled").reduce((s,b) => s + parseFloat(b.amount.replace(/\D/g,"")), 0);

export default function BookingsPage() {
  const router = useRouter();
  const { dark, setDark, t } = useTheme();
  const [filters, setFilters] = useState<AdminFilters>({ search: "", status: "All" });
  const [selId, setSelId] = useState<string|null>(null);

  const statusCounts = useMemo(() => {
    const c: Record<string,number> = {};
    STATUSES.forEach(s => { c[s] = BOOKINGS.filter(b => b.status === s).length; });
    return c;
  }, []);

  const filtered = useMemo(() => BOOKINGS.filter(b => {
    if (filters.status !== "All" && b.status !== filters.status) return false;
    if (filters.search) {
      const q = (filters.search as string).toLowerCase();
      if (!b.car.toLowerCase().includes(q) && !b.id.toLowerCase().includes(q) && !b.pickup.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [filters]);

  const selected = BOOKINGS.find(b => b.id === selId) ?? null;

  return (
    <AppShell active="Bookings" dark={dark} setDark={setDark} t={t}>
      <TopBar
        title="My Bookings" subtitle={`${BOOKINGS.length} total bookings`}
        breadcrumb={["dashboard","super-admin","Customers","Bookings"]}
        dark={dark} setDark={setDark} t={t}
        actions={
          <button onClick={() => router.push("/rentals/booking")}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8, border:"none", background:t.accent, color:t.accentFg, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
            <span style={{ display:"flex" }}>{Ic.Booking(t.accentFg)}</span>
            New Booking
          </button>
        }
      />
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        <AdminSidebar
          filters={filters} setFilters={setFilters}
          searchPlaceholder="Search bookings…" t={t}
          groups={[
            { key:"status", label:"Status", options:STATUSES, colors:STATUS_COLOR, counts:statusCounts },
          ]}
        />
        <div style={{ flex:1, overflowY:"auto", padding:24, background:t.bg }}>
          {/* KPI cards */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
            {[
              { label:"Total Bookings", value:`${BOOKINGS.length}`, icon:(c:string)=>Ic.Booking(c) },
              { label:"Confirmed", value:`${statusCounts.Confirmed}`, icon:(c:string)=>Ic.Check() },
              { label:"Pending", value:`${statusCounts.Pending}`, icon:(c:string)=>Ic.History(c) },
              { label:"Total Spent", value:`$${totalSpent.toLocaleString()}`, icon:(c:string)=>Ic.Payment(c) },
            ].map(s => (
              <div key={s.label} style={{ background:t.cardBg, borderRadius:12, border:`1px solid ${t.border}`, padding:"16px 20px", transition:"border-color 0.15s" }}
                onMouseEnter={e=>(e.currentTarget.style.borderColor=t.accent)}
                onMouseLeave={e=>(e.currentTarget.style.borderColor=t.border)}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <span style={{ fontSize:11, fontWeight:600, color:t.textMuted, textTransform:"uppercase", letterSpacing:1 }}>{s.label}</span>
                  <span style={{ display:"flex", opacity:0.4 }}>{s.icon(t.textMuted)}</span>
                </div>
                <div style={{ fontSize:24, fontWeight:800, color:t.textPri }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Main layout */}
          <div style={{ display:"grid", gridTemplateColumns: selId ? "1fr 340px" : "1fr", gap:20, alignItems:"start" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {filtered.length === 0 ? (
                <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:48, textAlign:"center" }}>
                  <div style={{ fontSize:13, fontWeight:600, color:t.textSec, marginBottom:4 }}>No bookings found</div>
                  <div style={{ fontSize:12, color:t.textMuted }}>Try a different filter or search term</div>
                </div>
              ) : filtered.map(b => {
                const sCol = STATUS_COLOR[b.status];
                const isSel = selId === b.id;
                return (
                  <div key={b.id} onClick={() => setSelId(prev => prev === b.id ? null : b.id)}
                    style={{ background:t.cardBg, borderRadius:14, cursor:"pointer", border:`1.5px solid ${isSel ? t.accent : t.border}`, overflow:"hidden", transition:"border-color 0.15s", boxShadow: isSel ? `0 0 0 3px ${t.accent}18` : "none" }}
                    onMouseEnter={e=>{ if(!isSel)(e.currentTarget as HTMLDivElement).style.borderColor=t.accent; }}
                    onMouseLeave={e=>{ if(!isSel)(e.currentTarget as HTMLDivElement).style.borderColor=t.border; }}>
                    <div style={{ display:"flex", alignItems:"center", gap:16, padding:"16px 20px" }}>
                      <div style={{ width:72, height:52, borderRadius:10, overflow:"hidden", flexShrink:0, position:"relative", background:dark?"#111122":"#f0f0f6", border:`1px solid ${isSel?t.accent:t.border}` }}>
                        <Image src={b.image} alt={b.car} fill style={{ objectFit:"cover" }}/>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:14, fontWeight:700, color:t.textPri, marginBottom:5 }}>{b.car}</div>
                        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                          <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:t.textMuted }}><span style={{ display:"flex", opacity:0.4 }}>{Ic.Booking(t.textMuted)}</span>{b.date}</span>
                          <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:t.textMuted }}><span style={{ display:"flex", opacity:0.4 }}>{Ic.History(t.textMuted)}</span>{b.time}</span>
                          <span style={{ fontSize:11, color:t.textMuted }}>{b.days} day{b.days>1?"s":""} · {b.plate}</span>
                        </div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                        <div style={{ textAlign:"right" }}><div style={{ fontSize:9, color:t.textMuted, marginBottom:2, textTransform:"uppercase", letterSpacing:0.5 }}>Pickup</div><div style={{ fontSize:12, fontWeight:600, color:t.textPri }}>{b.pickup}</div></div>
                        <span style={{ display:"flex", opacity:0.3 }}>{Ic.ArrowRight(t.textMuted)}</span>
                        <div><div style={{ fontSize:9, color:t.textMuted, marginBottom:2, textTransform:"uppercase", letterSpacing:0.5 }}>Drop-off</div><div style={{ fontSize:12, fontWeight:600, color:t.textPri }}>{b.dropoff}</div></div>
                      </div>
                      <div style={{ textAlign:"right", flexShrink:0 }}>
                        <div style={{ fontSize:17, fontWeight:800, color:t.textPri, marginBottom:5 }}>{b.amount}</div>
                        <span style={{ fontSize:9, fontWeight:700, color:sCol, background:sCol+"18", border:`1px solid ${sCol}30`, borderRadius:20, padding:"3px 10px" }}>{b.status}</span>
                      </div>
                    </div>
                    {isSel && (
                      <div style={{ padding:"10px 20px", borderTop:`1px solid ${t.divider}`, background:t.navActiveBg, display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ display:"flex", opacity:0.4 }}>{Ic.Pin(t.textMuted)}</span>
                        <span style={{ fontSize:11, color:t.textSec }}>{b.pickup}</span>
                        <span style={{ display:"flex", opacity:0.3 }}>{Ic.ArrowRight(t.textMuted)}</span>
                        <span style={{ fontSize:11, color:t.textSec }}>{b.dropoff}</span>
                        <span style={{ marginLeft:"auto", fontSize:11, fontWeight:600, color:t.textSec }}>${b.daily}/day × {b.days} days</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Detail panel */}
            {selected && (
              <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, overflow:"hidden", position:"sticky", top:0 }}>
                <div style={{ position:"relative", height:160 }}>
                  <Image src={selected.image} alt={selected.car} fill style={{ objectFit:"cover" }}/>
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)", pointerEvents:"none" }}/>
                  <div style={{ position:"absolute", bottom:12, left:16, right:40 }}><div style={{ fontSize:16, fontWeight:800, color:"#fff" }}>{selected.car}</div><div style={{ fontSize:10, color:"rgba(255,255,255,0.55)", marginTop:2 }}>{selected.plate}</div></div>
                  <span style={{ position:"absolute", top:10, left:10, fontSize:9, fontWeight:700, color:STATUS_COLOR[selected.status], background:STATUS_COLOR[selected.status]+"25", border:`1px solid ${STATUS_COLOR[selected.status]}44`, borderRadius:20, padding:"3px 10px" }}>{selected.status}</span>
                  <button onClick={()=>setSelId(null)} style={{ position:"absolute", top:10, right:10, width:26, height:26, borderRadius:"50%", background:"rgba(0,0,0,0.5)", border:"none", cursor:"pointer", color:"#fff", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                </div>
                <div style={{ padding:18 }}>
                  <div style={{ background:t.bg, borderRadius:10, border:`1px solid ${t.border}`, padding:"14px 16px", marginBottom:16 }}>
                    <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", paddingTop:4, flexShrink:0 }}><div style={{ width:9, height:9, borderRadius:"50%", background:"#10B981", border:"2px solid #10B981" }}/><div style={{ width:1, height:32, background:t.divider }}/><div style={{ width:9, height:9, borderRadius:"50%", background:"#EF4444", border:"2px solid #EF4444" }}/></div>
                      <div style={{ flex:1 }}><div style={{ marginBottom:22 }}><div style={{ fontSize:9, color:t.textMuted, marginBottom:3, textTransform:"uppercase", letterSpacing:0.5 }}>Pickup · {selected.time}</div><div style={{ fontSize:13, fontWeight:600, color:t.textPri }}>{selected.pickup}</div></div><div><div style={{ fontSize:9, color:t.textMuted, marginBottom:3, textTransform:"uppercase", letterSpacing:0.5 }}>Drop-off</div><div style={{ fontSize:13, fontWeight:600, color:t.textPri }}>{selected.dropoff}</div></div></div>
                    </div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                    {[{label:"Date",value:selected.date,icon:(c:string)=>Ic.Booking(c)},{label:"Time",value:selected.time,icon:(c:string)=>Ic.History(c)},{label:"Days",value:`${selected.days} day${selected.days>1?"s":""}`,icon:(c:string)=>Ic.Walk(c)},{label:"Driver",value:selected.driver,icon:(c:string)=>Ic.Profile(c)},{label:"Fuel",value:selected.fuel,icon:(c:string)=>Ic.Monitor(c)},{label:"Rate",value:`$${selected.daily}/day`,icon:(c:string)=>Ic.Payment(c)}].map(row => (
                      <div key={row.label} style={{ background:t.bg, borderRadius:9, border:`1px solid ${t.border}`, padding:"10px 12px", display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ display:"flex", opacity:0.38 }}>{row.icon(t.textMuted)}</span>
                        <div style={{ minWidth:0 }}><div style={{ fontSize:9, color:t.textMuted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:2 }}>{row.label}</div><div style={{ fontSize:11, fontWeight:700, color:t.textPri, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{row.value}</div></div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", background:t.bg, borderRadius:10, border:`1px solid ${t.border}`, marginBottom:14 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}><span style={{ display:"flex", opacity:0.4 }}>{Ic.Payment(t.textMuted)}</span><span style={{ fontSize:12, color:t.textSec }}>Total cost</span></div>
                    <span style={{ fontSize:18, fontWeight:800, color:t.textPri }}>{selected.amount}</span>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                    <button onClick={()=>router.push(`/cars/${selected.id}`)} style={{ padding:"11px 0", borderRadius:9, border:`1px solid ${t.border}`, background:t.bg, color:t.textSec, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>View Car</button>
                    <button onClick={()=>router.push("/rentals/booking")} style={{ padding:"11px 0", borderRadius:9, border:"none", background:t.accent, color:t.accentFg, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}><span style={{ display:"flex" }}>{Ic.Booking(t.accentFg)}</span>Book Again</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
