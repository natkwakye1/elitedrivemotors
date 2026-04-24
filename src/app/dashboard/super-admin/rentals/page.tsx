"use client";
// src/app/dashboard/super-admin/rentals/page.tsx
import { useTheme } from "@/src/context/ThemeContext";
import { useState, useMemo } from "react";

import AppShell from "@/src/components/layout/Appshell";
import TopBar from "@/src/components/layout/Topbar";
import AdminSidebar from "@/src/components/layout/AdminSidebar";
import type { AdminFilters } from "@/src/components/layout/AdminSidebar";

const RENTALS = [
  { id:"EDM-84921", customer:"Kwame Asante",   car:"BMW 3 Series",    from:"2025-06-10", to:"2025-06-11", hours:9,  total:342.00, status:"active",    avatar:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&q=80" },
  { id:"EDM-73310", customer:"Abena Osei",     car:"Tesla Model S",   from:"2025-06-08", to:"2025-06-09", hours:20, total:900.00, status:"active",    avatar:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=48&q=80" },
  { id:"EDM-61204", customer:"Ama Darko",      car:"Mini Countryman", from:"2025-06-05", to:"2025-06-05", hours:12, total:342.00, status:"completed", avatar:"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=48&q=80" },
  { id:"EDM-58832", customer:"Yaw Boateng",    car:"Ford Focus ST",   from:"2025-06-04", to:"2025-06-04", hours:6,  total:160.50, status:"cancelled", avatar:"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&q=80" },
  { id:"EDM-44510", customer:"Efua Asare",     car:"Porsche Macan",   from:"2025-06-02", to:"2025-06-03", hours:24, total:1320.00,status:"completed", avatar:"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=48&q=80" },
  { id:"EDM-39981", customer:"Nana Adjei",     car:"Audi A4",         from:"2025-06-01", to:"2025-06-01", hours:8,  total:196.72, status:"completed", avatar:"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=48&q=80" },
];

const RS: Record<string,{bg:string;color:string}> = {
  active:    {bg:"rgba(245,158,11,0.12)",  color:"#F59E0B"},
  completed: {bg:"rgba(16,185,129,0.12)",  color:"#10B981"},
  cancelled: {bg:"rgba(239,68,68,0.12)",   color:"#EF4444"},
};
const STATUS_COLOR: Record<string,string> = { active:"#F59E0B", completed:"#10B981", cancelled:"#EF4444" };
const STATUSES = ["active","completed","cancelled"];
const totalRev = RENTALS.filter(r=>r.status==="completed").reduce((s,r)=>s+r.total,0);

export default function AdminRentalsPage() {
  const { dark, setDark, t } = useTheme();
  const [filters, setFilters] = useState<AdminFilters>({ search:"", status:"All" });

  const statusCounts = useMemo(() => {
    const c: Record<string,number> = {};
    STATUSES.forEach(s => { c[s] = RENTALS.filter(r => r.status === s).length; });
    return c;
  }, []);

  const filtered = useMemo(() => RENTALS.filter(r => {
    if (filters.status !== "All" && r.status !== filters.status) return false;
    if (filters.search) {
      const q = (filters.search as string).toLowerCase();
      if (!r.customer.toLowerCase().includes(q) && !r.car.toLowerCase().includes(q) && !r.id.includes(q)) return false;
    }
    return true;
  }), [filters]);

  return (
    <AppShell active="All Rentals" dark={dark} setDark={setDark} t={t}>
      <TopBar title="All Rentals" subtitle={`${RENTALS.length} total · $${totalRev.toLocaleString()} collected`} breadcrumb={["dashboard","super-admin","Rentals"]} dark={dark} setDark={setDark} t={t} />
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        <AdminSidebar filters={filters} setFilters={setFilters} searchPlaceholder="Search rentals…" t={t}
          groups={[{ key:"status", label:"Status", options:STATUSES, colors:STATUS_COLOR, counts:statusCounts }]}
        />
        <div style={{ flex:1, overflowY:"auto", padding:"24px 28px", background:t.bg }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
            {[{l:"Total",v:RENTALS.length},{l:"Active",v:statusCounts.active??0},{l:"Completed",v:statusCounts.completed??0},{l:"Revenue",v:`$${totalRev.toLocaleString()}`}].map(s=>(
              <div key={s.l} style={{background:t.cardBg,borderRadius:12,border:`1px solid ${t.border}`,padding:"16px 20px"}}>
                <div style={{fontSize:11,color:t.textMuted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{s.l}</div>
                <div style={{fontSize:24,fontWeight:800,color:t.textPri}}>{s.v}</div>
              </div>
            ))}
          </div>
          <div style={{background:t.cardBg,borderRadius:14,border:`1px solid ${t.border}`,overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1.5fr 1.5fr 1fr 1fr 1fr 1fr",padding:"12px 20px",borderBottom:`1px solid ${t.border}`,fontSize:11,fontWeight:600,color:t.textMuted,textTransform:"uppercase",letterSpacing:1}}>
              <span>ID</span><span>Customer</span><span>Vehicle</span><span>From</span><span>Hours</span><span>Total</span><span>Status</span>
            </div>
            {filtered.map((r,i)=>{
              const sc=RS[r.status];
              return (
                <div key={r.id} style={{display:"grid",gridTemplateColumns:"1fr 1.5fr 1.5fr 1fr 1fr 1fr 1fr",padding:"13px 20px",borderBottom:i<filtered.length-1?`1px solid ${t.divider}`:"none",alignItems:"center",fontSize:13}}>
                  <span style={{color:t.textMuted,fontSize:11,fontFamily:"monospace"}}>{r.id}</span>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <img src={r.avatar} alt="" style={{width:28,height:28,borderRadius:"50%",objectFit:"cover"}}/>
                    <span style={{color:t.textPri,fontWeight:600}}>{r.customer}</span>
                  </div>
                  <span style={{color:t.textSec}}>{r.car}</span>
                  <span style={{color:t.textMuted,fontSize:12}}>{r.from}</span>
                  <span style={{color:t.textPri,fontWeight:600}}>{r.hours}h</span>
                  <span style={{color:t.textPri,fontWeight:700}}>${r.total.toFixed(2)}</span>
                  <span style={{fontSize:11,background:sc.bg,color:sc.color,borderRadius:20,padding:"3px 10px",fontWeight:600,textTransform:"capitalize",width:"fit-content"}}>{r.status}</span>
                </div>
              );
            })}
            {filtered.length === 0 && <div style={{ padding:40, textAlign:"center", color:t.textMuted, fontSize:13 }}>No rentals found.</div>}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
