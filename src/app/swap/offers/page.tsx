"use client";
// src/app/swap/offers/page.tsx

import { useTheme } from "@/src/context/ThemeContext";
import { useState } from "react";
import { useRouter } from "next/navigation";

import AppShell from "@/src/components/layout/Appshell";
import PageHeader from "@/src/components/layout/PageHeader";

const OFFERS = [
  { id:"OFR-001", from:"Kofi Mensah",    fromCar:"VW Tiguan 2022",       fromKm:24000, fromImg:"https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=200&q=80", avatar:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=48&q=80", topUp:"+$5,000 from them", status:"pending",  date:"Jun 10" },
  { id:"OFR-002", from:"Efua Asare",     fromCar:"Mazda 6 2021",         fromKm:31200, fromImg:"https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=200&q=80",   avatar:"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=48&q=80", topUp:"Even swap",         status:"accepted", date:"Jun 8"  },
  { id:"OFR-003", from:"Nana Adjei",     fromCar:"Toyota Corolla 2023",  fromKm:8100,  fromImg:"https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=200&q=80",  avatar:"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=48&q=80", topUp:"+$2,000 from you",  status:"declined", date:"Jun 5"  },
  { id:"OFR-004", from:"Akosua Frimpong",fromCar:"Honda Civic 2022",     fromKm:15400, fromImg:"https://images.unsplash.com/photo-1585011664466-b7bbe92f34ef?w=200&q=80",  avatar:"https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=48&q=80", topUp:"+$3,500 from them", status:"pending",  date:"Jun 4"  },
];

const MY_LISTING = {
  car: "Audi A4 2022",
  image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&q=80",
  km: 24100, year: 2022, status: "active",
};

const SS: Record<string,{bg:string;color:string}> = {
  pending:  {bg:"rgba(245,158,11,0.12)", color:"#F59E0B"},
  accepted: {bg:"rgba(16,185,129,0.12)", color:"#10B981"},
  declined: {bg:"rgba(239,68,68,0.12)",  color:"#EF4444"},
};

export default function SwapOffersPage() {
  const router = useRouter();
  const { dark, setDark, t } = useTheme();
  const [tab, setTab] = useState("All");

  const filtered = OFFERS.filter(o => tab==="All" || o.status===tab.toLowerCase());

  return (
    <AppShell active="My Offers" dark={dark} setDark={setDark} t={t}>
      <PageHeader title="My Swap Offers" subtitle={`${OFFERS.filter(o=>o.status==="pending").length} pending offers on your listing`} dark={dark} setDark={setDark} t={t}
        actions={<button onClick={()=>router.push("/swap")} style={{ padding:"7px 14px", borderRadius:8, border:`1px solid ${t.border}`, background:t.cardBg, color:t.textSec, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Browse All Swaps</button>}
      />
      <div style={{ flex:1, overflowY:"auto", padding:"24px 28px", background:t.bg }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:24 }}>

          {/* Offers list */}
          <div>
            {/* Tabs */}
            <div style={{ display:"flex", gap:6, marginBottom:20 }}>
              {["All","Pending","Accepted","Declined"].map(tb=>(
                <button key={tb} onClick={()=>setTab(tb)} style={{ padding:"7px 14px", borderRadius:8, border:`1px solid ${tab===tb?t.accent:t.border}`, background:tab===tb?t.accent:t.cardBg, color:tab===tb?"#fff":t.textSec, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s", display:"flex", alignItems:"center", gap:6 }}>
                  {tb}
                  <span style={{ background:tab===tb?"rgba(255,255,255,0.25)":t.pill, color:tab===tb?"#fff":t.textMuted, borderRadius:10, fontSize:10, padding:"1px 6px", fontWeight:700 }}>
                    {tb==="All"?OFFERS.length:OFFERS.filter(o=>o.status===tb.toLowerCase()).length}
                  </span>
                </button>
              ))}
            </div>

            {filtered.length===0 && (
              <div style={{ textAlign:"center", padding:"60px 0", color:t.textMuted }}>
                <div style={{ marginBottom:12, opacity:0.3, display:"flex", justifyContent:"center" }}><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg></div>
                <div style={{ fontSize:14, fontWeight:600 }}>No {tab.toLowerCase()} offers yet</div>
              </div>
            )}

            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {filtered.map(o => {
                const sc=SS[o.status];
                return (
                  <div key={o.id} style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"18px 20px", display:"flex", alignItems:"center", gap:16 }}>
                    <img src={o.fromImg} alt={o.fromCar} style={{ width:80, height:58, objectFit:"cover", borderRadius:8, flexShrink:0 }}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                        <img src={o.avatar} alt={o.from} style={{ width:22, height:22, borderRadius:"50%", objectFit:"cover" }}/>
                        <span style={{ fontSize:13, fontWeight:700, color:t.textPri }}>{o.from}</span>
                        <span style={{ fontSize:11, background:sc.bg, color:sc.color, borderRadius:10, padding:"2px 8px", fontWeight:600, textTransform:"capitalize" }}>{o.status}</span>
                      </div>
                      <div style={{ fontSize:13, color:t.textSec, marginBottom:4 }}>{o.fromCar} · {o.fromKm.toLocaleString()} km</div>
                      <div style={{ fontSize:12, color:t.textMuted }}>{o.topUp} · {o.date}</div>
                    </div>
                    {o.status==="pending" && (
                      <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                        <button style={{ padding:"7px 14px", borderRadius:8, border:"none", background:"rgba(16,185,129,0.15)", color:"#10B981", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Accept</button>
                        <button style={{ padding:"7px 14px", borderRadius:8, border:"none", background:"rgba(239,68,68,0.12)", color:"#EF4444", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Decline</button>
                      </div>
                    )}
                    {o.status==="accepted" && (
                      <button style={{ padding:"7px 14px", borderRadius:8, border:`1px solid ${t.accent}`, background:"transparent", color:t.accent, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", flexShrink:0 }}>View Deal</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* My listing card */}
          <div style={{ alignSelf:"start", position:"sticky", top:0 }}>
            <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, overflow:"hidden" }}>
              <img src={MY_LISTING.image} alt={MY_LISTING.car} style={{ width:"100%", height:140, objectFit:"cover", display:"block" }}/>
              <div style={{ padding:"16px" }}>
                <div style={{ fontSize:11, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>My Listing</div>
                <div style={{ fontSize:15, fontWeight:700, color:t.textPri, marginBottom:4 }}>{MY_LISTING.car}</div>
                <div style={{ fontSize:12, color:t.textMuted, marginBottom:12 }}>{MY_LISTING.year} · {MY_LISTING.km.toLocaleString()} km</div>
                <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                  <span style={{ fontSize:11, background:"rgba(16,185,129,0.12)", color:"#10B981", borderRadius:20, padding:"3px 10px", fontWeight:600 }}>Active</span>
                  <span style={{ fontSize:11, background:t.tagBg, color:t.tagText, borderRadius:20, padding:"3px 10px", border:`1px solid ${t.tagBorder}` }}>{OFFERS.length} offers</span>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={()=>router.push("/swap/request")} style={{ flex:1, padding:"8px 0", borderRadius:8, border:`1px solid ${t.border}`, background:t.bg, color:t.textSec, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Edit</button>
                  <button style={{ flex:1, padding:"8px 0", borderRadius:8, border:"none", background:"rgba(239,68,68,0.12)", color:"#EF4444", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Remove</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}