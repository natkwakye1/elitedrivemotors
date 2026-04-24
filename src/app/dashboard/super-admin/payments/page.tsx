"use client";
// src/app/dashboard/super-admin/payments/page.tsx
import { useTheme } from "@/src/context/ThemeContext";
import { useState, useMemo } from "react";

import AppShell from "@/src/components/layout/Appshell";
import TopBar from "@/src/components/layout/Topbar";
import AdminSidebar from "@/src/components/layout/AdminSidebar";
import type { AdminFilters } from "@/src/components/layout/AdminSidebar";

const PAYMENTS = [
  { id:"PAY-8821", user:"Kwame Asante",   type:"Rental",  amount:342.00,  method:"Mobile Money", date:"2025-06-10", status:"paid",    ref:"EDM-84921" },
  { id:"PAY-8820", user:"Efua Asare",     type:"Rental",  amount:1320.00, method:"Credit Card",  date:"2025-06-09", status:"paid",    ref:"EDM-44510" },
  { id:"PAY-8819", user:"Abena Osei",     type:"Purchase",amount:29900.00,method:"Bank Transfer", date:"2025-06-07", status:"paid",    ref:"SL-002" },
  { id:"PAY-8818", user:"Yaw Boateng",    type:"Rental",  amount:630.00,  method:"Mobile Money", date:"2025-06-04", status:"overdue", ref:"EDM-58890" },
  { id:"PAY-8817", user:"Nana Adjei",     type:"Rental",  amount:196.72,  method:"Credit Card",  date:"2025-06-01", status:"paid",    ref:"EDM-39981" },
  { id:"PAY-8816", user:"Ama Darko",      type:"Rental",  amount:342.00,  method:"Mobile Money", date:"2025-05-28", status:"pending", ref:"EDM-61204" },
  { id:"PAY-8815", user:"Kofi Mensah",    type:"Purchase",amount:67000.00,method:"Bank Transfer", date:"2025-05-25", status:"pending", ref:"SL-003" },
];

const PS: Record<string,{bg:string;color:string}> = {
  paid:    {bg:"rgba(16,185,129,0.12)", color:"#10B981"},
  pending: {bg:"rgba(245,158,11,0.12)",color:"#F59E0B"},
  overdue: {bg:"rgba(239,68,68,0.12)", color:"#EF4444"},
};
const STATUS_COLOR: Record<string,string> = { paid:"#10B981", pending:"#F59E0B", overdue:"#EF4444" };
const STATUSES = ["paid","pending","overdue"];
const TYPE_COLOR: Record<string,string> = { Rental:"#3B82F6", Purchase:"#8B5CF6" };
const TYPES = ["Rental","Purchase"];
const totalPaid = PAYMENTS.filter(p=>p.status==="paid").reduce((a,p)=>a+p.amount,0);
const totalPending = PAYMENTS.filter(p=>p.status!=="paid").reduce((a,p)=>a+p.amount,0);

export default function AdminPaymentsPage() {
  const { dark, setDark, t } = useTheme();
  const [filters, setFilters] = useState<AdminFilters>({ search:"", status:"All", type:"All" });

  const statusCounts = useMemo(() => {
    const c: Record<string,number> = {};
    STATUSES.forEach(s => { c[s] = PAYMENTS.filter(p => p.status === s).length; });
    return c;
  }, []);
  const typeCounts = useMemo(() => {
    const c: Record<string,number> = {};
    TYPES.forEach(t => { c[t] = PAYMENTS.filter(p => p.type === t).length; });
    return c;
  }, []);

  const filtered = useMemo(() => PAYMENTS.filter(p => {
    if (filters.status !== "All" && p.status !== filters.status) return false;
    if (filters.type !== "All" && p.type !== filters.type) return false;
    if (filters.search) {
      const q = (filters.search as string).toLowerCase();
      if (!p.user.toLowerCase().includes(q) && !p.id.includes(q) && !p.ref.includes(q)) return false;
    }
    return true;
  }), [filters]);

  return (
    <AppShell active="Payments" dark={dark} setDark={setDark} t={t}>
      <TopBar title="Payments" subtitle="All transactions across rentals and sales" breadcrumb={["dashboard","super-admin","Payments"]} dark={dark} setDark={setDark} t={t}
        actions={<button style={{padding:"7px 16px",borderRadius:8,border:"none",background:t.accent,color:t.accentFg,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Export</button>}
      />
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        <AdminSidebar filters={filters} setFilters={setFilters} searchPlaceholder="Search payments…" t={t}
          groups={[
            { key:"status", label:"Payment Status", options:STATUSES, colors:STATUS_COLOR, counts:statusCounts },
            { key:"type", label:"Type", options:TYPES, colors:TYPE_COLOR, counts:typeCounts },
          ]}
        />
        <div style={{ flex:1, overflowY:"auto", padding:"24px 28px", background:t.bg }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
            {[
              {l:"Total Collected",v:`$${totalPaid.toLocaleString()}`,c:"#10B981"},
              {l:"Outstanding",v:`$${totalPending.toLocaleString()}`,c:"#F59E0B"},
              {l:"Transactions",v:PAYMENTS.length,c:t.textPri},
              {l:"Overdue",v:PAYMENTS.filter(p=>p.status==="overdue").length,c:"#EF4444"},
            ].map(s=>(
              <div key={s.l} style={{background:t.cardBg,borderRadius:12,border:`1px solid ${t.border}`,padding:"16px 20px"}}>
                <div style={{fontSize:11,color:t.textMuted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{s.l}</div>
                <div style={{fontSize:24,fontWeight:800,color:s.c}}>{s.v}</div>
              </div>
            ))}
          </div>
          <div style={{background:t.cardBg,borderRadius:14,border:`1px solid ${t.border}`,overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1.5fr 1fr 1fr 1fr 1fr 1fr",padding:"12px 20px",borderBottom:`1px solid ${t.border}`,fontSize:11,fontWeight:600,color:t.textMuted,textTransform:"uppercase",letterSpacing:1}}>
              <span>ID</span><span>User</span><span>Type</span><span>Method</span><span>Date</span><span>Amount</span><span>Status</span>
            </div>
            {filtered.map((p,i)=>{
              const sc=PS[p.status];
              return (
                <div key={p.id} style={{display:"grid",gridTemplateColumns:"1fr 1.5fr 1fr 1fr 1fr 1fr 1fr",padding:"13px 20px",borderBottom:i<filtered.length-1?`1px solid ${t.divider}`:"none",alignItems:"center",fontSize:12}}>
                  <span style={{color:t.textMuted,fontSize:10,fontFamily:"monospace"}}>{p.id}</span>
                  <span style={{fontWeight:600,color:t.textPri}}>{p.user}</span>
                  <span style={{color:t.textSec}}>{p.type}</span>
                  <span style={{color:t.textMuted}}>{p.method}</span>
                  <span style={{color:t.textMuted}}>{p.date}</span>
                  <span style={{fontWeight:800,color:t.textPri,fontSize:13}}>${p.amount.toLocaleString()}</span>
                  <span style={{fontSize:11,background:sc.bg,color:sc.color,borderRadius:20,padding:"3px 10px",fontWeight:600,textTransform:"capitalize",width:"fit-content"}}>{p.status}</span>
                </div>
              );
            })}
            {filtered.length === 0 && <div style={{ padding:40, textAlign:"center", color:t.textMuted, fontSize:13 }}>No payments found.</div>}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
