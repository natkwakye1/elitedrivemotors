"use client";
// src/app/dashboard/super-admin/sales/page.tsx

import { useTheme } from "@/src/context/ThemeContext";
import { useState, useMemo } from "react";
import Image from "next/image";

import AppShell from "@/src/components/layout/Appshell";
import TopBar   from "@/src/components/layout/Topbar";
import AdminSidebar from "@/src/components/layout/AdminSidebar";
import type { AdminFilters } from "@/src/components/layout/AdminSidebar";
import { Ic }   from "@/src/components/ui/Icons";

const SALES = [
  { id:"SAL-001", customer:"Abena Osei", car:"Audi A4 2023", image:"https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=200&q=70", price:"$18,500", date:"Feb 14, 2025", method:"Bank Transfer", status:"Completed" },
  { id:"SAL-002", customer:"Kwame Asante", car:"Toyota Corolla 2022", image:"https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=200&q=70", price:"$11,200", date:"Aug 30, 2024", method:"Cash", status:"Completed" },
  { id:"SAL-003", customer:"Ama Darko", car:"BMW 3 Series 2022", image:"https://images.unsplash.com/photo-1555215695-3004980ad54e?w=200&q=70", price:"$22,000", date:"Oct 15, 2024", method:"Bank Transfer", status:"Completed" },
  { id:"SAL-004", customer:"Yaw Boateng", car:"Honda Accord 2023", image:"https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=200&q=70", price:"$13,500", date:"Dec 03, 2024", method:"Installment", status:"Pending" },
  { id:"SAL-005", customer:"Efua Asare", car:"Mazda 6 2022", image:"https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=200&q=70", price:"$14,800", date:"Jan 20, 2025", method:"Cash", status:"Completed" },
];

const STATUS_COLOR: Record<string,string> = { Completed:"#10B981", Pending:"#F59E0B", Cancelled:"#EF4444" };
const STATUSES = ["Completed","Pending","Cancelled"];
const METHOD_COLOR: Record<string,string> = { "Bank Transfer":"#3B82F6", Cash:"#10B981", Installment:"#8B5CF6" };
const METHODS = ["Bank Transfer","Cash","Installment"];
const totalRev = SALES.filter(s=>s.status==="Completed").reduce((sum,s)=>sum+parseInt(s.price.replace(/\D/g,"")),0);

export default function AdminSalesPage() {
  const { dark, setDark, t } = useTheme();
  const [filters, setFilters] = useState<AdminFilters>({ search:"", status:"All", method:"All" });

  const statusCounts = useMemo(() => {
    const c: Record<string,number> = {};
    STATUSES.forEach(s => { c[s] = SALES.filter(sl => sl.status === s).length; });
    return c;
  }, []);
  const methodCounts = useMemo(() => {
    const c: Record<string,number> = {};
    METHODS.forEach(m => { c[m] = SALES.filter(sl => sl.method === m).length; });
    return c;
  }, []);

  const filtered = useMemo(() => SALES.filter(s => {
    if (filters.status !== "All" && s.status !== filters.status) return false;
    if (filters.method !== "All" && s.method !== filters.method) return false;
    if (filters.search) {
      const q = (filters.search as string).toLowerCase();
      if (!s.customer.toLowerCase().includes(q) && !s.car.toLowerCase().includes(q) && !s.id.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [filters]);

  return (
    <AppShell active="Sales" dark={dark} setDark={setDark} t={t}>
      <TopBar title="Sales" subtitle={`${SALES.length} total sales`} breadcrumb={["dashboard","super-admin","Sales"]} dark={dark} setDark={setDark} t={t} />
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        <AdminSidebar filters={filters} setFilters={setFilters} searchPlaceholder="Search sales…" t={t}
          groups={[
            { key:"status", label:"Status", options:STATUSES, colors:STATUS_COLOR, counts:statusCounts },
            { key:"method", label:"Payment Method", options:METHODS, colors:METHOD_COLOR, counts:methodCounts },
          ]}
        />
        <div style={{ flex:1, overflowY:"auto", padding:24, background:t.bg }}>
          {/* KPI */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
            {[
              {l:"Total Sales", v:SALES.length, icon:(c:string)=>Ic.Buy(c)},
              {l:"Completed", v:statusCounts.Completed??0, icon:(c:string)=>Ic.Check()},
              {l:"Pending", v:statusCounts.Pending??0, icon:(c:string)=>Ic.History(c)},
              {l:"Revenue", v:`$${totalRev.toLocaleString()}`, icon:(c:string)=>Ic.Payment(c)},
            ].map(s=>(
              <div key={s.l} style={{ background:t.cardBg, borderRadius:12, border:`1px solid ${t.border}`, padding:"16px 20px", transition:"border-color 0.15s" }} onMouseEnter={e=>(e.currentTarget.style.borderColor=t.accent)} onMouseLeave={e=>(e.currentTarget.style.borderColor=t.border)}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <span style={{ fontSize:11, fontWeight:600, color:t.textMuted, textTransform:"uppercase", letterSpacing:1 }}>{s.l}</span>
                  <span style={{ display:"flex", opacity:0.4 }}>{s.icon(t.textMuted)}</span>
                </div>
                <div style={{ fontSize:24, fontWeight:800, color:t.textPri }}>{s.v}</div>
              </div>
            ))}
          </div>

          {/* Cards */}
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {filtered.length === 0 ? (
              <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:48, textAlign:"center", color:t.textMuted, fontSize:13 }}>No sales found.</div>
            ) : filtered.map(s => {
              const sCol = STATUS_COLOR[s.status];
              return (
                <div key={s.id} style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"16px 20px", display:"flex", alignItems:"center", gap:16, transition:"border-color 0.15s" }} onMouseEnter={e=>(e.currentTarget.style.borderColor=t.accent)} onMouseLeave={e=>(e.currentTarget.style.borderColor=t.border)}>
                  <div style={{ width:80, height:56, borderRadius:10, overflow:"hidden", flexShrink:0, position:"relative", background:dark?"#111122":"#f0f0f6" }}>
                    <Image src={s.image} alt={s.car} fill style={{ objectFit:"cover" }}/>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:t.textPri, marginBottom:4 }}>{s.car}</div>
                    <div style={{ display:"flex", gap:12, fontSize:11, color:t.textMuted }}>
                      <span style={{ display:"flex", alignItems:"center", gap:4 }}><span style={{ display:"flex", opacity:0.4 }}>{Ic.Profile(t.textMuted)}</span>{s.customer}</span>
                      <span style={{ display:"flex", alignItems:"center", gap:4 }}><span style={{ display:"flex", opacity:0.4 }}>{Ic.Booking(t.textMuted)}</span>{s.date}</span>
                      <span style={{ display:"flex", alignItems:"center", gap:4 }}><span style={{ display:"flex", opacity:0.4 }}>{Ic.Payment(t.textMuted)}</span>{s.method}</span>
                    </div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:18, fontWeight:800, color:t.textPri, marginBottom:6 }}>{s.price}</div>
                    <span style={{ fontSize:9, fontWeight:700, color:sCol, background:sCol+"18", border:`1px solid ${sCol}30`, borderRadius:20, padding:"3px 10px" }}>{s.status}</span>
                  </div>
                  <span style={{ fontSize:10, fontWeight:600, color:t.textMuted, background:t.bg, border:`1px solid ${t.border}`, borderRadius:6, padding:"4px 10px", flexShrink:0 }}>{s.id}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
