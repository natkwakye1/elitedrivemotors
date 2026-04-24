"use client";
// src/app/swap/page.tsx

import { useTheme } from "@/src/context/ThemeContext";
import { useState } from "react";

import AppShell from "@/src/components/layout/Appshell";
import PageHeader from "@/src/components/layout/PageHeader";

const LISTINGS = [
  { id:1, owner:"Kwame A.",  offering:"Audi A4 2022",          wants:"BMW 3 Series / Mercedes C",  diff:"+$13,400", image:"https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&q=80", avatar:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&q=80", km:24100, year:2022, type:"Sedan", status:"open" },
  { id:2, owner:"Abena O.",  offering:"Tesla Model S 2021",    wants:"Porsche Macan / Audi Q5",    diff:"+$9,000",  image:"https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&q=80", avatar:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=48&q=80", km:18700, year:2021, type:"Sedan",    status:"open" },
  { id:3, owner:"Kofi M.",   offering:"VW Tiguan 2020",        wants:"Toyota RAV4 / Honda CR-V",   diff:"-$2,000",  image:"https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=400&q=80", avatar:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=48&q=80", km:51200, year:2020, type:"Crossover",status:"open" },
  { id:4, owner:"Ama D.",    offering:"BMW 3 Series 2020",     wants:"Mercedes C-Class 2022+",     diff:"+$17,500", image:"https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&q=80", avatar:"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=48&q=80", km:38000, year:2020, type:"Sedan",    status:"matched" },
  { id:5, owner:"Yaw B.",    offering:"Ford Focus ST 2023",    wants:"Mazda 3 / Honda Civic",      diff:"+$4,200",  image:"https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&q=80", avatar:"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&q=80", km:8200,  year:2023, type:"Hatchback", status:"open" },
  { id:6, owner:"Efua A.",   offering:"Porsche Macan 2022",    wants:"Range Rover Evoque / BMW X3", diff:"+$22,000", image:"https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80", avatar:"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=48&q=80", km:15600, year:2022, type:"SUV",       status:"open" },
];

const TYPES = ["All","Sedan","SUV","Crossover","Hatchback"];

export default function SwapPage() {
  const { dark, setDark, t } = useTheme();
  const [typeFilter, setTypeFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = LISTINGS.filter(l => {
    const mt = typeFilter==="All" || l.type===typeFilter;
    const ms = l.offering.toLowerCase().includes(search.toLowerCase()) || l.wants.toLowerCase().includes(search.toLowerCase());
    return mt && ms;
  });

  return (
    <AppShell active="Swap Listings" dark={dark} setDark={setDark} t={t}>
      <PageHeader title="Swap Listings" subtitle="Browse cars available for swapping" dark={dark} setDark={setDark} t={t}
        actions={
          <a href="/swap/request" style={{ padding:"7px 16px", borderRadius:8, border:"none", background:t.accent, color:"#fff", fontSize:12, fontWeight:600, textDecoration:"none", fontFamily:"'DM Sans',sans-serif" }}>
            + List My Car
          </a>
        }
      />
      <div style={{ flex:1, overflowY:"auto", padding:"24px 28px", background:t.bg }}>

        {/* Filters */}
        <div style={{ display:"flex", gap:10, marginBottom:24, flexWrap:"wrap", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:t.cardBg, border:`1px solid ${t.border}`, borderRadius:10, padding:"8px 14px", flex:1, minWidth:200, maxWidth:360 }}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke={t.textMuted} strokeWidth="1.5"><circle cx="6" cy="6" r="4.5"/><line x1="9.5" y1="9.5" x2="13" y2="13"/></svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by car or wanted..." style={{ border:"none", outline:"none", fontSize:13, color:t.textPri, background:"transparent", width:"100%" }} />
          </div>
          {TYPES.map(tp=>(
            <button key={tp} onClick={()=>setTypeFilter(tp)} style={{ padding:"7px 14px", borderRadius:8, border:`1px solid ${typeFilter===tp?t.accent:t.border}`, background:typeFilter===tp?t.accent:t.cardBg, color:typeFilter===tp?"#fff":t.textSec, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s" }}>{tp}</button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
          {filtered.map(l => {
            const isPos = l.diff.startsWith("+");
            return (
              <div key={l.id} style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, overflow:"hidden", boxShadow:`0 2px 8px ${t.shadow}` }}>
                <div style={{ position:"relative", height:170 }}>
                  <img src={l.image} alt={l.offering} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
                  <div style={{ position:"absolute", inset:0, background:t.imgOverlay }}/>
                  {l.status==="matched" && (
                    <div style={{ position:"absolute", top:10, left:10, background:"rgba(16,185,129,0.2)", border:"1px solid #10B981", borderRadius:20, padding:"4px 10px", fontSize:11, fontWeight:600, color:"#10B981" }}>Matched</div>
                  )}
                  <div style={{ position:"absolute", bottom:10, right:10, background:isPos?"rgba(16,185,129,0.2)":"rgba(239,68,68,0.2)", border:`1px solid ${isPos?"#10B981":"#EF4444"}`, borderRadius:20, padding:"4px 10px", fontSize:12, fontWeight:800, color:isPos?"#10B981":"#EF4444" }}>{l.diff}</div>
                </div>
                <div style={{ padding:"14px 16px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                    <img src={l.avatar} alt={l.owner} style={{ width:28, height:28, borderRadius:"50%", objectFit:"cover" }}/>
                    <span style={{ fontSize:12, fontWeight:600, color:t.textSec }}>{l.owner}</span>
                    <span style={{ marginLeft:"auto", fontSize:10, background:t.tagBg, color:t.tagText, borderRadius:5, padding:"2px 7px", border:`1px solid ${t.tagBorder}` }}>{l.type}</span>
                  </div>
                  <div style={{ fontSize:14, fontWeight:700, color:t.textPri, marginBottom:4 }}>{l.offering}</div>
                  <div style={{ fontSize:11, color:t.textMuted, marginBottom:10 }}>{l.year} · {l.km.toLocaleString()} km</div>
                  <div style={{ fontSize:12, color:t.textSec, marginBottom:14, padding:"8px 10px", background:t.tagBg, borderRadius:7, border:`1px solid ${t.tagBorder}` }}>
                    <span style={{ color:t.textMuted }}>Wants: </span>{l.wants}
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <a href="/swap/offers" style={{ flex:1, textAlign:"center", padding:"8px 0", borderRadius:8, border:`1px solid ${t.border}`, background:t.bg, color:t.textSec, fontSize:12, fontWeight:600, textDecoration:"none" }}>View Offers</a>
                    <a href="/swap/request" style={{ flex:1, textAlign:"center", padding:"8px 0", borderRadius:8, border:"none", background:t.accent, color:"#fff", fontSize:12, fontWeight:700, textDecoration:"none" }}>Make Offer</a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}