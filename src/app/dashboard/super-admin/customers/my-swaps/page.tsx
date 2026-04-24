"use client";
// src/app/dashboard/super-admin/customers/my-swaps/page.tsx

import { useTheme } from "@/src/context/ThemeContext";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

import AppShell from "@/src/components/layout/Appshell";
import TopBar   from "@/src/components/layout/Topbar";
import AdminSidebar from "@/src/components/layout/AdminSidebar";
import type { AdminFilters } from "@/src/components/layout/AdminSidebar";
import { Ic }   from "@/src/components/ui/Icons";

const SWAPS = [
  { id:"SWP-001", offering:"VW Golf 2021", offeringImg:"https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=200&q=70", offering_spec:"1.4 TSI · Manual · 46,000 km", wanting:"Mazda CX-5", wanting_spec:"2.5 SkyActiv · Automatic", date:"Mar 10, 2025", status:"Pending", note:"Good condition, full service history. Open to negotiation on minor differences in value." },
  { id:"SWP-002", offering:"Honda Civic 2020", offeringImg:"https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=200&q=70", offering_spec:"1.5 VTEC Turbo · Auto · 32,000 km", wanting:"Toyota RAV4", wanting_spec:"2.5 Hybrid · Automatic", date:"Jan 22, 2025", status:"Approved", note:"Low mileage, second owner, all documents available. Dealer maintained throughout." },
  { id:"SWP-003", offering:"Hyundai Elantra", offeringImg:"https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=200&q=70", offering_spec:"2.0 MPI · Automatic · 61,200 km", wanting:"Kia Sportage", wanting_spec:"1.6 T-GDI · Automatic", date:"Nov 05, 2024", status:"Completed", note:"Negotiable on extras. Car is in excellent external and mechanical condition." },
  { id:"SWP-004", offering:"Ford Focus 2019", offeringImg:"https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=200&q=70", offering_spec:"1.5 EcoBoost · Manual · 74,000 km", wanting:"Nissan X-Trail", wanting_spec:"2.5 · CVT · 4WD", date:"Sep 18, 2024", status:"Rejected", note:"All documents ready, roadworthy certificate valid. Looking for a quick swap." },
];

const STATUS_COLOR: Record<string,string> = { Pending:"#F59E0B", Approved:"#10B981", Completed:"#4F46E5", Rejected:"#EF4444" };
const STATUSES = ["Pending","Approved","Completed","Rejected"];

export default function MySwapsPage() {
  const router = useRouter();
  const { dark, setDark, t } = useTheme();
  const [filters, setFilters] = useState<AdminFilters>({ search: "", status: "All" });
  const [selId, setSelId] = useState<string|null>(null);

  const statusCounts = useMemo(() => {
    const c: Record<string,number> = {};
    STATUSES.forEach(s => { c[s] = SWAPS.filter(sw => sw.status === s).length; });
    return c;
  }, []);

  const filtered = useMemo(() => SWAPS.filter(sw => {
    if (filters.status !== "All" && sw.status !== filters.status) return false;
    if (filters.search) {
      const q = (filters.search as string).toLowerCase();
      if (!sw.offering.toLowerCase().includes(q) && !sw.wanting.toLowerCase().includes(q) && !sw.id.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [filters]);

  const selected = SWAPS.find(s => s.id === selId) ?? null;

  return (
    <AppShell active="My Swaps" dark={dark} setDark={setDark} t={t}>
      <TopBar title="My Swaps" subtitle={`${SWAPS.length} swap requests`} breadcrumb={["dashboard","super-admin","Customers","Swaps"]} dark={dark} setDark={setDark} t={t}
        actions={<button onClick={()=>router.push("/swap/request")} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8, border:"none", background:t.accent, color:t.accentFg, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}><span style={{ display:"flex" }}>{Ic.Swap(t.accentFg)}</span>New Swap Request</button>}
      />
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        <AdminSidebar filters={filters} setFilters={setFilters} searchPlaceholder="Search swaps…" t={t}
          groups={[{ key:"status", label:"Status", options:STATUSES, colors:STATUS_COLOR, counts:statusCounts }]}
        />
        <div style={{ flex:1, overflowY:"auto", padding:24, background:t.bg }}>
          {/* KPI */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
            {[
              { label:"Total Swaps", value:SWAPS.length, icon:(c:string)=>Ic.Swap(c) },
              { label:"Pending", value:statusCounts.Pending??0, icon:(c:string)=>Ic.History(c) },
              { label:"Approved", value:statusCounts.Approved??0, icon:(c:string)=>Ic.Check() },
              { label:"Completed", value:statusCounts.Completed??0, icon:(c:string)=>Ic.Favs(c) },
            ].map(s=>(
              <div key={s.label} style={{ background:t.cardBg, borderRadius:12, border:`1px solid ${t.border}`, padding:"16px 20px", transition:"border-color 0.15s" }} onMouseEnter={e=>(e.currentTarget.style.borderColor=t.accent)} onMouseLeave={e=>(e.currentTarget.style.borderColor=t.border)}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}><span style={{ fontSize:11, fontWeight:600, color:t.textMuted, textTransform:"uppercase", letterSpacing:1 }}>{s.label}</span><span style={{ display:"flex", opacity:0.4 }}>{s.icon(t.textMuted)}</span></div>
                <div style={{ fontSize:24, fontWeight:800, color:t.textPri }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display:"grid", gridTemplateColumns: selId ? "1fr 320px" : "1fr", gap:20, alignItems:"start" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {filtered.length === 0 ? (
                <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:48, textAlign:"center", color:t.textMuted }}><div style={{ fontSize:13, fontWeight:600, color:t.textSec, marginBottom:4 }}>No swaps found</div><div style={{ fontSize:12 }}>Try a different filter</div></div>
              ) : filtered.map(sw => {
                const sCol = STATUS_COLOR[sw.status]; const isSel = selId === sw.id;
                return (
                  <div key={sw.id} onClick={()=>setSelId(prev=>prev===sw.id?null:sw.id)}
                    style={{ background:t.cardBg, borderRadius:14, cursor:"pointer", border:`1.5px solid ${isSel?t.accent:t.border}`, overflow:"hidden", transition:"border-color 0.15s, transform 0.15s", boxShadow:isSel?`0 0 0 3px ${t.accent}18`:"none" }}
                    onMouseEnter={e=>{if(!isSel)(e.currentTarget as HTMLDivElement).style.borderColor=t.accent;}} onMouseLeave={e=>{if(!isSel)(e.currentTarget as HTMLDivElement).style.borderColor=t.border;}}>
                    <div style={{ padding:"18px 20px" }}>
                      <div style={{ display:"flex", alignItems:"center" }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:9, fontWeight:700, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Offering</div>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div style={{ width:52, height:38, borderRadius:8, overflow:"hidden", flexShrink:0, position:"relative", background:dark?"#111122":"#f0f0f6", border:`1px solid ${t.border}` }}><img src={sw.offeringImg} alt={sw.offering} style={{ width:"100%", height:"100%", objectFit:"cover" }}/></div>
                            <div style={{ minWidth:0 }}><div style={{ fontSize:13, fontWeight:700, color:t.textPri, marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{sw.offering}</div><div style={{ fontSize:10, color:t.textMuted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{sw.offering_spec}</div></div>
                          </div>
                        </div>
                        <div style={{ padding:"0 20px", display:"flex", flexDirection:"column", alignItems:"center", gap:4, flexShrink:0 }}>
                          <div style={{ width:32, height:32, borderRadius:"50%", background:t.accent+"15", border:`1px solid ${t.accent}25`, display:"flex", alignItems:"center", justifyContent:"center" }}><span style={{ display:"flex" }}>{Ic.Swap(t.accent)}</span></div>
                          <span style={{ fontSize:9, color:t.textMuted }}>swap</span>
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:9, fontWeight:700, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Wanting</div>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div style={{ width:52, height:38, borderRadius:8, background:t.bg, border:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><span style={{ display:"flex", opacity:0.3 }}>{Ic.Vehicles(t.textMuted)}</span></div>
                            <div style={{ minWidth:0 }}><div style={{ fontSize:13, fontWeight:700, color:t.textPri, marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{sw.wanting}</div><div style={{ fontSize:10, color:t.textMuted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{sw.wanting_spec}</div></div>
                          </div>
                        </div>
                        <div style={{ textAlign:"right", flexShrink:0, marginLeft:20 }}>
                          <span style={{ fontSize:9, fontWeight:700, color:sCol, background:sCol+"18", border:`1px solid ${sCol}30`, borderRadius:20, padding:"4px 12px", display:"inline-block", marginBottom:8 }}>{sw.status}</span>
                          <div style={{ fontSize:11, color:t.textMuted }}>{sw.date}</div>
                          <div style={{ fontSize:10, color:t.textMuted, marginTop:2, opacity:0.6 }}>{sw.id}</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ padding:"11px 20px", borderTop:`1px solid ${t.divider}`, background:isSel?t.navActiveBg:"transparent", display:"flex", alignItems:"flex-start", gap:8 }}>
                      <span style={{ display:"flex", opacity:0.4, flexShrink:0, marginTop:1 }}>{Ic.Notes(t.textMuted)}</span>
                      <span style={{ fontSize:12, color:t.textMuted, lineHeight:1.6 }}>{sw.note}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {selected && (
              <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, overflow:"hidden", position:"sticky", top:0 }}>
                <div style={{ padding:"16px 18px 14px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}><div><div style={{ fontSize:13, fontWeight:700, color:t.textPri }}>Swap Details</div><div style={{ fontSize:10, color:t.textMuted, marginTop:2 }}>{selected.id}</div></div><button onClick={()=>setSelId(null)} style={{ width:26, height:26, borderRadius:"50%", background:t.bg, border:`1px solid ${t.border}`, cursor:"pointer", color:t.textMuted, fontSize:12, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button></div>
                <div style={{ padding:"16px 18px" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}><span style={{ fontSize:11, fontWeight:700, color:STATUS_COLOR[selected.status], background:STATUS_COLOR[selected.status]+"15", border:`1px solid ${STATUS_COLOR[selected.status]}30`, borderRadius:20, padding:"5px 14px" }}>{selected.status}</span><span style={{ fontSize:11, color:t.textMuted, display:"flex", alignItems:"center", gap:5 }}><span style={{ display:"flex", opacity:0.4 }}>{Ic.Booking(t.textMuted)}</span>{selected.date}</span></div>
                  <div style={{ marginBottom:12 }}><div style={{ fontSize:9, fontWeight:700, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Your Car (Offering)</div><div style={{ background:t.bg, borderRadius:10, border:`1px solid ${t.border}`, overflow:"hidden" }}><div style={{ position:"relative", height:100 }}><img src={selected.offeringImg} alt={selected.offering} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/><div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)", pointerEvents:"none" }}/><div style={{ position:"absolute", bottom:8, left:10, right:10 }}><div style={{ fontSize:12, fontWeight:700, color:"#fff" }}>{selected.offering}</div><div style={{ fontSize:10, color:"rgba(255,255,255,0.6)", marginTop:1 }}>{selected.offering_spec}</div></div></div></div></div>
                  <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}><div style={{ width:36, height:36, borderRadius:"50%", background:t.accent+"15", border:`1px solid ${t.accent}30`, display:"flex", alignItems:"center", justifyContent:"center" }}><span style={{ display:"flex" }}>{Ic.Swap(t.accent)}</span></div></div>
                  <div style={{ marginBottom:16 }}><div style={{ fontSize:9, fontWeight:700, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Desired Car (Wanting)</div><div style={{ background:t.bg, borderRadius:10, border:`1px solid ${t.border}`, padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}><div style={{ width:48, height:40, borderRadius:8, background:t.cardBg, border:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><span style={{ display:"flex", opacity:0.3 }}>{Ic.Vehicles(t.textMuted)}</span></div><div><div style={{ fontSize:13, fontWeight:700, color:t.textPri, marginBottom:2 }}>{selected.wanting}</div><div style={{ fontSize:11, color:t.textMuted }}>{selected.wanting_spec}</div></div></div></div>
                  <div style={{ background:t.bg, borderRadius:10, border:`1px solid ${t.border}`, padding:"12px 14px", marginBottom:16 }}><div style={{ fontSize:9, fontWeight:700, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Note</div><div style={{ fontSize:12, color:t.textSec, lineHeight:1.7 }}>{selected.note}</div></div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                    <button onClick={()=>router.push("/swap")} style={{ padding:"11px 0", borderRadius:9, border:`1px solid ${t.border}`, background:t.bg, color:t.textSec, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Browse Swaps</button>
                    <button onClick={()=>router.push("/swap/request")} style={{ padding:"11px 0", borderRadius:9, border:"none", background:t.accent, color:t.accentFg, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}><span style={{ display:"flex" }}>{Ic.Swap(t.accentFg)}</span>New Swap</button>
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
