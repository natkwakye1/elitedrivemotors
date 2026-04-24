"use client";
// src/components/layout/CarsTopBar.tsx

import { Ic } from "@/src/components/ui/Icons";

interface Props {
  count:      number;
  search:     string;
  setSearch:  (v: string) => void;
  showMap:    boolean;
  setShowMap: (v: boolean) => void;
  dark:       boolean;
  setDark:    (v: boolean) => void;
  t:          any;
}

export default function CarsTopBar({ count, search, setSearch, showMap, setShowMap, dark, setDark, t }: Props) {
  return (
    <div style={{
      height:52, flexShrink:0,
      borderBottom:`1px solid ${t.border}`,
      background:t.cardBg,
      display:"flex", alignItems:"center",
      padding:"0 16px", gap:10,
      fontFamily:"'DM Sans',sans-serif",
    }}>
      {/* result count */}
      <span style={{ fontSize:13, fontWeight:700, color:t.textPri }}>{count}</span>
      <span style={{ fontSize:12, color:t.textMuted }}>vehicles found</span>

      <div style={{ flex:1 }}/>

      {/* map toggle */}
      <button onClick={()=>setShowMap(!showMap)}
        style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:8, border:`1px solid ${showMap?t.accent:t.border}`, background:showMap?t.accent+"18":t.bg, color:showMap?t.accent:t.textSec, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s", flexShrink:0 }}>
        <span style={{ display:"flex" }}>{Ic.Map(showMap?t.accent:t.textMuted)}</span>
        {showMap ? "Hide Map" : "Show Map"}
      </button>

      {/* ── compact search box with border ── */}
      <div style={{ position:"relative", width:190, flexShrink:0 }}>
        <span style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", display:"flex", opacity:0.4 }}>{Ic.Search(t.textMuted)}</span>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search…"
          style={{ width:"100%", padding:"7px 10px 7px 28px", borderRadius:8, border:`1px solid ${t.border}`, background:t.bg, color:t.textPri, fontSize:12, outline:"none", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box", transition:"border-color 0.15s" }}
          onFocus={e=>(e.target.style.borderColor=t.accent)}
          onBlur={e=>(e.target.style.borderColor=t.border)}
        />
      </div>

      {/* dark toggle */}
      <button onClick={()=>setDark(!dark)}
        style={{ width:34, height:34, borderRadius:8, border:`1px solid ${t.border}`, background:t.bg, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
        {dark ? Ic.Sun(t.textMuted) : Ic.Moon(t.textMuted)}
      </button>

      {/* avatar */}
      <div style={{ width:32, height:32, borderRadius:"50%", background:t.accent, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
        {Ic.Profile("#fff")}
      </div>
    </div>
  );
}