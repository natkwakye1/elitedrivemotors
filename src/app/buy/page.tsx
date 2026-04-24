"use client";
// src/app/buy/page.tsx

import { useTheme } from "@/src/context/ThemeContext";
import { useState } from "react";

import AppShell from "@/src/components/layout/Appshell";
import PageHeader from "@/src/components/layout/PageHeader";
import Stars from "@/src/components/ui/Stars";

const FOR_SALE = [
  { id:1,  name:"Mercedes C-Class",  spec:"C300 AMG Line · 2023 · 4MATIC",  price:38500, km:12000, fuel:"Gasoline", trans:"Automatic", type:"Sedan",    rating:4.9, reviews:189, image:"https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=80",  badge:"New Arrival" },
  { id:2,  name:"BMW 3 Series",      spec:"330i xDrive · 2022 · AWD",        price:29900, km:28000, fuel:"Gasoline", trans:"Automatic", type:"Sedan",    rating:4.8, reviews:211, image:"https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80",  badge:null },
  { id:3,  name:"Porsche Macan",     spec:"Macan S · 2022 · AWD",            price:67000, km:15600, fuel:"Gasoline", trans:"Automatic", type:"SUV",      rating:4.6, reviews:134, image:"https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80",  badge:"Featured" },
  { id:4,  name:"Tesla Model S",     spec:"Long Range · 2022 · AWD",         price:55000, km:18700, fuel:"Electric", trans:"Automatic", type:"Sedan",    rating:4.1, reviews:298, image:"https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&q=80",  badge:null },
  { id:5,  name:"Audi A4",           spec:"2.0 TFSI Sport · 2021 · Quattro", price:22000, km:41000, fuel:"Gasoline", trans:"Automatic", type:"Sedan",    rating:4.7, reviews:109, image:"https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&q=80",  badge:"Great Value" },
  { id:6,  name:"VW Tiguan",         spec:"2.0 TSI R-Line · 2022 · 4Motion", price:28500, km:22000, fuel:"Gasoline", trans:"Automatic", type:"Crossover",rating:4.6, reviews:134, image:"https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=600&q=80",  badge:null },
  { id:7,  name:"Ford Focus ST",     spec:"2.3 EcoBoost · 2023 · FWD",       price:18900, km:8200,  fuel:"Gasoline", trans:"Manual",    type:"Hatchback",rating:4.7, reviews:156, image:"https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&q=80",  badge:null },
  { id:8,  name:"Mini Countryman",   spec:"Cooper S ALL4 · 2023 · AWD",      price:32000, km:9800,  fuel:"Gasoline", trans:"Automatic", type:"Crossover",rating:4.9, reviews:142, image:"https://images.unsplash.com/photo-1546614042-7df3c24c9e5d?w=600&q=80",  badge:"New Arrival" },
];

const SORTS = ["Featured", "Price: Low to High", "Price: High to Low", "Lowest Mileage", "Best Rated"];
const TYPES = ["All", "Sedan", "SUV", "Crossover", "Hatchback"];

export default function BuyPage() {
  const { dark, setDark, t } = useTheme();
  const [typeF, setTypeF]   = useState("All");
  const [sort, setSort]     = useState("Featured");
  const [search, setSearch] = useState("");
  const [maxPrice, setMax]  = useState(70000);

  let list = FOR_SALE.filter(c => {
    const mt = typeF === "All" || c.type === typeF;
    const ms = c.name.toLowerCase().includes(search.toLowerCase());
    const mp = c.price <= maxPrice;
    return mt && ms && mp;
  });

  if (sort === "Price: Low to High")  list = [...list].sort((a,b) => a.price - b.price);
  if (sort === "Price: High to Low")  list = [...list].sort((a,b) => b.price - a.price);
  if (sort === "Lowest Mileage")      list = [...list].sort((a,b) => a.km - b.km);
  if (sort === "Best Rated")          list = [...list].sort((a,b) => b.rating - a.rating);

  return (
    <AppShell active="For Sale" dark={dark} setDark={setDark} t={t}>
      <PageHeader title="Cars for Sale" subtitle={`${list.length} vehicles available`} dark={dark} setDark={setDark} t={t} />
      <div style={{ flex:1, overflowY:"auto", background:t.bg, display:"flex" }}>

        {/* ── Filter sidebar ── */}
        <aside style={{ width:220, flexShrink:0, background:t.sidebarBg, borderRight:`1px solid ${t.border}`, padding:"20px 16px", overflowY:"auto" }}>
          <div style={{ fontSize:13, fontWeight:700, color:t.textPri, marginBottom:18 }}>Filter</div>

          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:10, fontWeight:600, color:t.sectionTitle, textTransform:"uppercase", letterSpacing:1.2, marginBottom:9 }}>Body Type</div>
            {TYPES.map(tp=>(
              <button key={tp} onClick={()=>setTypeF(tp)} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 10px", borderRadius:7, border:"none", background:typeF===tp?t.navActiveBg:"transparent", color:typeF===tp?t.navActive:t.navText, fontSize:12, fontWeight:typeF===tp?700:400, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", marginBottom:2 }}>
                {tp}
                {typeF===tp && <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke={t.navIconAct} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1.5 5 4 7.5 8.5 2"/></svg>}
              </button>
            ))}
          </div>

          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:10, fontWeight:600, color:t.sectionTitle, textTransform:"uppercase", letterSpacing:1.2, marginBottom:9 }}>Max Price</div>
            <input type="range" min={15000} max={70000} step={1000} value={maxPrice} onChange={e=>setMax(+e.target.value)} style={{ width:"100%", accentColor:t.accent }}/>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:5 }}>
              <span style={{ fontSize:11, color:t.textHint }}>$15,000</span>
              <span style={{ fontSize:11, fontWeight:700, color:t.textPri }}>${maxPrice.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:10, fontWeight:600, color:t.sectionTitle, textTransform:"uppercase", letterSpacing:1.2, marginBottom:9 }}>Sort By</div>
            {SORTS.map(s=>(
              <button key={s} onClick={()=>setSort(s)} style={{ width:"100%", textAlign:"left", padding:"7px 10px", borderRadius:7, border:"none", background:sort===s?t.navActiveBg:"transparent", color:sort===s?t.navActive:t.navText, fontSize:12, fontWeight:sort===s?700:400, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", marginBottom:2 }}>{s}</button>
            ))}
          </div>
        </aside>

        {/* ── Grid ── */}
        <div style={{ flex:1, overflowY:"auto", padding:"24px 24px" }}>
          {/* Search */}
          <div style={{ display:"flex", alignItems:"center", gap:8, background:t.cardBg, border:`1px solid ${t.border}`, borderRadius:10, padding:"8px 14px", marginBottom:20, maxWidth:360 }}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke={t.textMuted} strokeWidth="1.5"><circle cx="6" cy="6" r="4.5"/><line x1="9.5" y1="9.5" x2="13" y2="13"/></svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search cars for sale..." style={{ border:"none", outline:"none", fontSize:13, color:t.textPri, background:"transparent", width:"100%" }} />
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:16 }}>
            {list.map(c => (
              <div key={c.id} style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, overflow:"hidden", boxShadow:`0 2px 8px ${t.shadow}` }}>
                <div style={{ position:"relative", height:165 }}>
                  <img src={c.image} alt={c.name} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
                  <div style={{ position:"absolute", inset:0, background:t.imgOverlay }}/>
                  {c.badge && (
                    <div style={{ position:"absolute", top:10, left:10, background:t.accent, borderRadius:20, padding:"4px 10px", fontSize:11, fontWeight:700, color:"#fff" }}>{c.badge}</div>
                  )}
                  <div style={{ position:"absolute", bottom:10, right:10, background:"rgba(0,0,0,0.55)", borderRadius:6, padding:"3px 8px", fontSize:10, fontWeight:700, color:"#fff" }}>{c.km.toLocaleString()} km</div>
                </div>
                <div style={{ padding:"14px 16px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, color:t.textPri, marginBottom:2 }}>{c.name}</div>
                      <div style={{ fontSize:11, color:t.textMuted }}>{c.spec}</div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0, marginLeft:8 }}>
                      <div style={{ fontSize:17, fontWeight:800, color:t.textPri }}>${c.price.toLocaleString()}</div>
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:12 }}>
                    <Stars n={c.rating} isDark={dark} />
                    <span style={{ fontSize:11, color:t.textMuted }}>({c.reviews})</span>
                    <span style={{ marginLeft:"auto", fontSize:10, background:t.tagBg, color:t.tagText, borderRadius:5, padding:"2px 7px", border:`1px solid ${t.tagBorder}` }}>{c.type}</span>
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <a href={`/cars/${c.id}`} style={{ flex:1, textAlign:"center", padding:"8px 0", borderRadius:8, border:`1px solid ${t.border}`, background:t.bg, color:t.textSec, fontSize:12, fontWeight:600, textDecoration:"none" }}>Details</a>
                    <a href="/buy/checkout" style={{ flex:1, textAlign:"center", padding:"8px 0", borderRadius:8, border:"none", background:t.accent, color:"#fff", fontSize:12, fontWeight:700, textDecoration:"none" }}>Buy Now</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}