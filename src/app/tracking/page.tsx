"use client";
// src/app/dashboard/super-admin/tracking/page.tsx
import { useTheme } from "@/src/context/ThemeContext";
import { useState } from "react";
import { useRouter } from "next/navigation";

import AppShell from "@/src/components/layout/Appshell";
import PageHeader from "@/src/components/layout/PageHeader";

const VEHICLES = [
  { id:1, name:"BMW 3 Series",    plate:"GR-1190-22", driver:"Kwame Asante",   speed:62, battery:null, fuel:78, lat:5.560, lng:-0.205, status:"moving",  since:"09:14" },
  { id:2, name:"Tesla Model S",   plate:"GR-8801-21", driver:"Abena Osei",     speed:0,  battery:61,   fuel:null,lat:5.574, lng:-0.186, status:"parked",  since:"10:42" },
  { id:3, name:"Mini Countryman", plate:"GR-3310-23", driver:"Ama Darko",      speed:44, battery:null, fuel:55, lat:5.548, lng:-0.220, status:"moving",  since:"08:55" },
  { id:4, name:"Ford Focus ST",   plate:"GR-5530-23", driver:"Efua Asare",     speed:88, battery:null, fuel:30, lat:5.591, lng:-0.172, status:"speeding", since:"10:58" },
  { id:5, name:"Porsche Macan",   plate:"GR-2201-22", driver:"Yaw Boateng",    speed:0,  battery:null, fuel:91, lat:5.535, lng:-0.238, status:"parked",  since:"07:30" },
];
const VS: Record<string,{bg:string;color:string;dot:string}> = {
  moving:   {bg:"rgba(16,185,129,0.12)", color:"#10B981", dot:"#10B981"},
  parked:   {bg:"rgba(156,163,175,0.15)",color:"#9CA3AF", dot:"#9CA3AF"},
  speeding: {bg:"rgba(239,68,68,0.12)",  color:"#EF4444", dot:"#EF4444"},
  idle:     {bg:"rgba(245,158,11,0.12)", color:"#F59E0B", dot:"#F59E0B"},
};

export default function AdminTrackingPage() {
  const router = useRouter();
  const { dark, setDark, t } = useTheme();
  const [sel, setSel] = useState<number|null>(null);

  return (
    <AppShell active="Fleet Tracking" dark={dark} setDark={setDark} t={t}>
      <PageHeader title="Fleet Tracking" subtitle="Live vehicle locations and telemetry" dark={dark} setDark={setDark} t={t}
        actions={
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>router.push("/tracking/live-map")}       style={{padding:"7px 14px",borderRadius:8,border:`1px solid ${t.border}`,background:t.cardBg,color:t.textSec,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Live Map</button>
            <button onClick={()=>router.push("/tracking/trip-history")}   style={{padding:"7px 14px",borderRadius:8,border:`1px solid ${t.border}`,background:t.cardBg,color:t.textSec,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Trip Logs</button>
            <button onClick={()=>router.push("/tracking/vehicle-status")} style={{padding:"7px 14px",borderRadius:8,border:"none",background:t.accent,color:t.accentFg,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Monitor</button>
          </div>
        }
      />
      <div style={{flex:1,overflowY:"auto",padding:"24px 28px",background:t.bg}}>
        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
          {[
            {l:"Active Vehicles",  v:VEHICLES.filter(v=>v.status==="moving").length,  c:"#10B981"},
            {l:"Parked",           v:VEHICLES.filter(v=>v.status==="parked").length,   c:t.textPri},
            {l:"Speeding Alerts",  v:VEHICLES.filter(v=>v.status==="speeding").length, c:"#EF4444"},
            {l:"Total Tracked",    v:VEHICLES.length,                                  c:t.textPri},
          ].map(s=>(
            <div key={s.l} style={{background:t.cardBg,borderRadius:12,border:`1px solid ${t.border}`,padding:"16px 20px"}}>
              <div style={{fontSize:11,color:t.textMuted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{s.l}</div>
              <div style={{fontSize:28,fontWeight:800,color:s.c}}>{s.v}</div>
            </div>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:20}}>
          {/* Map mock */}
          <div style={{background:t.mapBg,borderRadius:14,border:`1px solid ${t.border}`,position:"relative",minHeight:380,overflow:"hidden"}}>
            <svg style={{position:"absolute",inset:0,width:"100%",height:"100%"}} preserveAspectRatio="none">
              <defs><pattern id="mg2" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke={t.mapGrid} strokeWidth="1"/></pattern></defs>
              <rect width="100%" height="100%" fill="url(#mg2)"/>
              <path d="M 15% 35% Q 35% 30% 55% 38% T 100% 35%" stroke={t.mapRoad} strokeWidth="10" fill="none"/>
              <path d="M 0 55% Q 25% 50% 50% 58% T 100% 55%" stroke={t.mapRoad} strokeWidth="8"  fill="none"/>
              <path d="M 40% 0 Q 43% 38% 48% 58% T 52% 100%" stroke={t.mapRoad2}strokeWidth="7"  fill="none"/>
              <path d="M 70% 0 Q 67% 32% 62% 58% T 68% 100%" stroke={t.mapRoad2}strokeWidth="5"  fill="none"/>
            </svg>
            {VEHICLES.map((v,i)=>{
              const positions=[[20,30],[55,22],[35,55],[70,40],[15,65]];
              const [x,y]=positions[i];
              const vs2=VS[v.status];
              const active=sel===v.id;
              return (
                <div key={v.id} onClick={()=>setSel(active?null:v.id)} style={{position:"absolute",left:`${x}%`,top:`${y}%`,transform:"translate(-50%,-50%)",zIndex:active?3:2,cursor:"pointer"}}>
                  <div style={{background:active?t.accent:vs2.bg,border:`2px solid ${active?t.accent:vs2.dot}`,borderRadius:20,padding:"4px 10px",fontSize:11,fontWeight:700,color:active?"#fff":vs2.color,whiteSpace:"nowrap",boxShadow:`0 2px 10px ${t.shadow}`,transition:"all 0.15s"}}>
                    {v.speed>0?`${v.speed} km/h`:"Parked"}
                  </div>
                  <div style={{width:6,height:6,borderRadius:"50%",background:vs2.dot,margin:"3px auto 0",boxShadow:`0 0 6px ${vs2.dot}`}}/>
                </div>
              );
            })}
            {/* Selected popup */}
            {sel && (()=>{const v=VEHICLES.find(x=>x.id===sel)!;const vs2=VS[v.status];return(
              <div style={{position:"absolute",bottom:16,left:16,background:t.popupBg,border:`1px solid ${t.popupBorder}`,borderRadius:12,padding:"14px 16px",minWidth:220,boxShadow:`0 8px 28px ${t.shadowHov}`}}>
                <div style={{fontSize:14,fontWeight:700,color:t.textPri,marginBottom:2}}>{v.name}</div>
                <div style={{fontSize:11,color:t.textMuted,marginBottom:10}}>{v.plate} · Driver: {v.driver}</div>
                <div style={{display:"flex",gap:8}}>
                  <span style={{fontSize:11,background:vs2.bg,color:vs2.color,borderRadius:20,padding:"3px 10px",fontWeight:600,textTransform:"capitalize"}}>{v.status}</span>
                  {v.speed>0&&<span style={{fontSize:11,color:t.textSec}}>{v.speed} km/h</span>}
                  <span style={{fontSize:11,color:t.textSec}}>{v.fuel??v.battery}% {v.fuel?"fuel":"battery"}</span>
                </div>
              </div>
            );})()}
          </div>

          {/* Vehicle list */}
          <div style={{background:t.cardBg,borderRadius:14,border:`1px solid ${t.border}`,padding:"16px",display:"flex",flexDirection:"column",gap:0,overflowY:"auto",maxHeight:420}}>
            <div style={{fontSize:13,fontWeight:700,color:t.textPri,marginBottom:14,paddingBottom:10,borderBottom:`1px solid ${t.border}`}}>Active Vehicles</div>
            {VEHICLES.map((v,i)=>{
              const vs2=VS[v.status];
              return (
                <div key={v.id} onClick={()=>setSel(sel===v.id?null:v.id)} style={{padding:"12px 0",borderBottom:i<VEHICLES.length-1?`1px solid ${t.divider}`:"none",cursor:"pointer",background:sel===v.id?(dark?"#1E1E38":"#F5F5FA"):"transparent",borderRadius:8,paddingLeft:sel===v.id?8:0,transition:"all 0.15s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                    <span style={{fontSize:13,fontWeight:600,color:t.textPri}}>{v.name}</span>
                    <span style={{fontSize:10,background:vs2.bg,color:vs2.color,borderRadius:10,padding:"2px 7px",fontWeight:600,textTransform:"capitalize"}}>{v.status}</span>
                  </div>
                  <div style={{fontSize:11,color:t.textMuted,marginBottom:4}}>{v.driver} · {v.plate}</div>
                  <div style={{display:"flex",gap:12,fontSize:11,color:t.textSec}}>
                    <span>{v.speed} km/h</span>
                    <span>{v.fuel??v.battery}% {v.fuel?"fuel":"battery"}</span>
                    <span>Since {v.since}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}