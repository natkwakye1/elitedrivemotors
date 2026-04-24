"use client";
// src/app/dashboard/super-admin/customers/my-purchases/page.tsx

import { useTheme } from "@/src/context/ThemeContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import AppShell from "@/src/components/layout/Appshell";
import TopBar   from "@/src/components/layout/Topbar";
import { Ic }   from "@/src/components/ui/Icons";

// ─── Data ─────────────────────────────────────────────────────────────────────
const PURCHASES = [
  {
    id:"PUR-001",
    car:"Audi A4 2023",
    image:"https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&q=80",
    price:"$18,500",
    date:"Feb 14, 2025",
    method:"Bank Transfer",
    status:"Completed",
    mileage:"12,400 km",
    fuel:"Petrol",
    transmission:"Automatic",
    color:"Phantom Black",
    receipt:"RCP-20250214",
  },
  {
    id:"PUR-002",
    car:"Toyota Corolla 2022",
    image:"https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&q=80",
    price:"$11,200",
    date:"Aug 30, 2024",
    method:"Cash",
    status:"Completed",
    mileage:"28,600 km",
    fuel:"Hybrid",
    transmission:"Automatic",
    color:"Pearl White",
    receipt:"RCP-20240830",
  },
];

const STATUS_COLOR: Record<string,string> = {
  Completed: "#10B981",
  Pending:   "#F59E0B",
  Cancelled: "#EF4444",
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MyPurchasesPage() {
  const router = useRouter();
  const { dark, setDark, t } = useTheme();
  const [search, setSearch] = useState("");
  const [selId, setSelId]   = useState<string|null>(null);

  const filtered = PURCHASES.filter(p =>
    p.car.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  const selected = PURCHASES.find(p => p.id === selId) ?? null;
  const totalSpent = PURCHASES.reduce((sum, p) => sum + parseInt(p.price.replace(/\D/g,"")), 0);

  return (
    <AppShell active="My Purchases" dark={dark} setDark={setDark} t={t}>
      <TopBar
        title="My Purchases"
        subtitle={`${PURCHASES.length} vehicles purchased`}
        breadcrumb={["dashboard", "super-admin", "Customers", "Purchases"]}
        dark={dark} setDark={setDark} t={t}
        actions={
          <button
            onClick={() => router.push("/buy")}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8, border:"none", background:t.accent, color:t.accentFg, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
          >
            <span style={{ display:"flex" }}>{Ic.Buy(t.accentFg)}</span>
            Browse for Sale
          </button>
        }
      />

      <div style={{ flex:1, overflowY:"auto", padding:"24px", background:t.bg }}>

        {/* ── KPI cards ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
          {[
            { label:"Cars Bought",   value:`${PURCHASES.length}`,                                         icon:(c:string)=>Ic.Buy(c)     },
            { label:"Total Spent",   value:`$${totalSpent.toLocaleString()}`,                              icon:(c:string)=>Ic.Payment(c) },
            { label:"Completed",     value:`${PURCHASES.filter(p=>p.status==="Completed").length}`,        icon:(c:string)=>Ic.Check()    },
            { label:"Pending",       value:`${PURCHASES.filter(p=>p.status==="Pending").length}`,          icon:(c:string)=>Ic.Notes(c)   },
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
              <div style={{ fontSize:24, fontWeight:800, color:t.textPri }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* ── Main layout ── */}
        <div style={{ display:"grid", gridTemplateColumns: selId ? "1fr 340px" : "1fr", gap:20, alignItems:"start" }}>

          {/* ── Purchase list ── */}
          <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, overflow:"hidden" }}>

            {/* list header */}
            <div style={{ padding:"16px 20px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontSize:13, fontWeight:700, color:t.textPri }}>Purchase History</span>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", display:"flex", opacity:0.4 }}>{Ic.Search(t.textMuted)}</span>
                <input
                  value={search} onChange={e=>setSearch(e.target.value)}
                  placeholder="Search…"
                  style={{ padding:"7px 12px 7px 30px", borderRadius:8, border:`1px solid ${t.border}`, background:t.bg, color:t.textPri, fontSize:12, outline:"none", fontFamily:"'DM Sans',sans-serif", width:180, transition:"border-color 0.15s" }}
                  onFocus={e=>(e.target.style.borderColor=t.accent)}
                  onBlur={e=>(e.target.style.borderColor=t.border)}
                />
              </div>
            </div>

            {/* rows */}
            {filtered.length === 0 ? (
              <div style={{ padding:"48px", textAlign:"center", color:t.textMuted }}>
                <div style={{ fontSize:13, fontWeight:600, color:t.textSec, marginBottom:4 }}>No purchases found</div>
                <div style={{ fontSize:12 }}>Try a different search term</div>
              </div>
            ) : (
              filtered.map((p, i) => {
                const isSel = selId === p.id;
                const sCol  = STATUS_COLOR[p.status] ?? t.accent;
                return (
                  <div key={p.id}
                    onClick={() => setSelId(prev => prev === p.id ? null : p.id)}
                    style={{
                      display:"flex", alignItems:"center", gap:16,
                      padding:"16px 20px", cursor:"pointer",
                      background: isSel ? t.navActiveBg : "transparent",
                      borderLeft: `3px solid ${isSel ? t.accent : "transparent"}`,
                      borderBottom: i < filtered.length-1 ? `1px solid ${t.divider}` : "none",
                      transition:"background 0.12s, border-color 0.12s",
                    }}
                    onMouseEnter={e=>{ if(!isSel)(e.currentTarget as HTMLDivElement).style.background=t.navActiveBg; }}
                    onMouseLeave={e=>{ if(!isSel)(e.currentTarget as HTMLDivElement).style.background="transparent"; }}
                  >
                    {/* car thumbnail */}
                    <div style={{ width:72, height:52, borderRadius:10, overflow:"hidden", flexShrink:0, position:"relative", background:dark?"#111122":"#f0f0f6", border:`1px solid ${isSel?t.accent:t.border}` }}>
                      <Image src={p.image} alt={p.car} fill style={{ objectFit:"cover" }}/>
                    </div>

                    {/* info */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:14, fontWeight:700, color:t.textPri, marginBottom:5 }}>{p.car}</div>
                      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                        <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:t.textMuted }}>
                          <span style={{ display:"flex", opacity:0.4 }}>{Ic.Booking(t.textMuted)}</span>
                          {p.date}
                        </span>
                        <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:t.textMuted }}>
                          <span style={{ display:"flex", opacity:0.4 }}>{Ic.Walk(t.textMuted)}</span>
                          {p.mileage}
                        </span>
                        <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:t.textMuted }}>
                          <span style={{ display:"flex", opacity:0.4 }}>{Ic.Payment(t.textMuted)}</span>
                          {p.method}
                        </span>
                      </div>
                    </div>

                    {/* price + status */}
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontSize:17, fontWeight:800, color:t.textPri, marginBottom:6 }}>{p.price}</div>
                      <span style={{ fontSize:9, fontWeight:700, color:sCol, background:sCol+"18", border:`1px solid ${sCol}30`, borderRadius:20, padding:"3px 10px" }}>
                        {p.status}
                      </span>
                    </div>

                    {/* ID tag */}
                    <span style={{ fontSize:10, fontWeight:600, color:t.textMuted, background:t.bg, border:`1px solid ${t.border}`, borderRadius:6, padding:"4px 10px", flexShrink:0 }}>
                      {p.id}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* ── Detail panel ── */}
          {selected && (
            <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, overflow:"hidden", position:"sticky", top:0 }}>

              {/* car image header */}
              <div style={{ position:"relative", height:160 }}>
                <Image src={selected.image} alt={selected.car} fill style={{ objectFit:"cover" }}/>
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)", pointerEvents:"none" }}/>
                <div style={{ position:"absolute", bottom:12, left:16, right:40 }}>
                  <div style={{ fontSize:16, fontWeight:800, color:"#fff" }}>{selected.car}</div>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,0.55)", marginTop:2 }}>{selected.id}</div>
                </div>
                <span style={{ position:"absolute", top:10, left:10, fontSize:9, fontWeight:700, color:STATUS_COLOR[selected.status], background:STATUS_COLOR[selected.status]+"25", border:`1px solid ${STATUS_COLOR[selected.status]}44`, borderRadius:20, padding:"3px 10px" }}>
                  {selected.status}
                </span>
                <button onClick={()=>setSelId(null)}
                  style={{ position:"absolute", top:10, right:10, width:26, height:26, borderRadius:"50%", background:"rgba(0,0,0,0.5)", border:"none", cursor:"pointer", color:"#fff", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  ✕
                </button>
              </div>

              <div style={{ padding:"18px" }}>

                {/* price row */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", background:t.bg, borderRadius:10, border:`1px solid ${t.border}`, marginBottom:16 }}>
                  <div>
                    <div style={{ fontSize:10, color:t.textMuted, marginBottom:3, textTransform:"uppercase", letterSpacing:0.6 }}>Purchase Price</div>
                    <div style={{ fontSize:22, fontWeight:800, color:t.textPri }}>{selected.price}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:10, color:t.textMuted, marginBottom:3, textTransform:"uppercase", letterSpacing:0.6 }}>Payment</div>
                    <div style={{ fontSize:13, fontWeight:600, color:t.textSec }}>{selected.method}</div>
                  </div>
                </div>

                {/* specs grid */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                  {[
                    { label:"Date",         value:selected.date,         icon:(c:string)=>Ic.Booking(c)  },
                    { label:"Mileage",      value:selected.mileage,      icon:(c:string)=>Ic.Walk(c)     },
                    { label:"Fuel",         value:selected.fuel,         icon:(c:string)=>Ic.Monitor(c)  },
                    { label:"Transmission", value:selected.transmission, icon:(c:string)=>Ic.Settings(c) },
                    { label:"Color",        value:selected.color,        icon:(c:string)=>Ic.Notes(c)    },
                    { label:"Receipt",      value:selected.receipt,      icon:(c:string)=>Ic.License(c)  },
                  ].map(row => (
                    <div key={row.label} style={{ background:t.bg, borderRadius:9, border:`1px solid ${t.border}`, padding:"10px 12px", display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ display:"flex", opacity:0.38 }}>{row.icon(t.textMuted)}</span>
                      <div style={{ minWidth:0 }}>
                        <div style={{ fontSize:9, color:t.textMuted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:2 }}>{row.label}</div>
                        <div style={{ fontSize:11, fontWeight:700, color:t.textPri, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{row.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* actions */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                  <button
                    onClick={() => router.push(`/cars/${selected.id}`)}
                    style={{ padding:"11px 0", borderRadius:9, border:`1px solid ${t.border}`, background:t.bg, color:t.textSec, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"border-color 0.15s" }}
                    onMouseEnter={e=>((e.currentTarget as HTMLButtonElement).style.borderColor=t.accent)}
                    onMouseLeave={e=>((e.currentTarget as HTMLButtonElement).style.borderColor=t.border)}
                  >
                    View Car
                  </button>
                  <button
                    onClick={() => router.push("/buy")}
                    style={{ padding:"11px 0", borderRadius:9, border:"none", background:t.accent, color:t.accentFg, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}
                  >
                    <span style={{ display:"flex" }}>{Ic.Buy(t.accentFg)}</span>
                    Buy Again
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}