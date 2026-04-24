"use client";
// src/app/tracking/vehicle-status/page.tsx

import { useTheme } from "@/src/context/ThemeContext";
import { useState } from "react";

import AppShell from "@/src/components/layout/Appshell";
import PageHeader from "@/src/components/layout/PageHeader";

const VEHICLES = [
  { id:1, name:"BMW 3 Series",    plate:"GR-1190-22", image:"https://images.unsplash.com/photo-1555215695-3004980ad54e?w=300&q=80", speed:62,  fuel:78,   battery:null, engine:"On",  doors:"Locked",   mileage:33400, status:"moving",   temp:88,  lastSeen:"Now" },
  { id:2, name:"Tesla Model S",   plate:"GR-8801-21", image:"https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=300&q=80", speed:0,   fuel:null, battery:61,  engine:"Off", doors:"Locked",   mileage:18700, status:"parked",   temp:null,lastSeen:"10:42" },
  { id:3, name:"Mini Countryman", plate:"GR-3310-23", image:"https://images.unsplash.com/photo-1546614042-7df3c24c9e5d?w=300&q=80", speed:44,  fuel:55,   battery:null, engine:"On",  doors:"Locked",   mileage:9800,  status:"moving",   temp:91,  lastSeen:"Now" },
  { id:4, name:"Ford Focus ST",   plate:"GR-5530-23", image:"https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300&q=80", speed:88,  fuel:30,   battery:null, engine:"On",  doors:"Locked",   mileage:8200,  status:"speeding", temp:102, lastSeen:"Now" },
  { id:5, name:"Porsche Macan",   plate:"GR-2201-22", image:"https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300&q=80", speed:0,  fuel:91,   battery:null, engine:"Off", doors:"Unlocked", mileage:15600, status:"parked",   temp:null,lastSeen:"07:30" },
];

const STATUS_S: Record<string,{bg:string;color:string;dot:string}> = {
  moving:   {bg:"rgba(16,185,129,0.12)", color:"#10B981", dot:"#10B981"},
  parked:   {bg:"rgba(156,163,175,0.15)",color:"#9CA3AF", dot:"#9CA3AF"},
  speeding: {bg:"rgba(239,68,68,0.12)",  color:"#EF4444", dot:"#EF4444"},
};

function GaugeBar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
        <span style={{ fontSize:11, color:"#9CA3AF" }}>{label}</span>
        <span style={{ fontSize:12, fontWeight:700 }}>{value}{label==="Speed"?" km/h":label==="Temp"?"°C":"%"}</span>
      </div>
      <div style={{ height:6, background:"rgba(255,255,255,0.1)", borderRadius:3, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${Math.min(100,(value/max)*100)}%`, background:color, borderRadius:3, transition:"width 0.5s" }}/>
      </div>
    </div>
  );
}

export default function VehicleStatusPage() {
  const { dark, setDark, t } = useTheme();
  const [sel, setSel] = useState(VEHICLES[0]);

  return (
    <AppShell active="Vehicle Status" dark={dark} setDark={setDark} t={t}>
      <PageHeader title="Vehicle Status" subtitle="Live telemetry for your active rentals" dark={dark} setDark={setDark} t={t} />
      <div style={{ flex:1, overflow:"hidden", display:"flex" }}>

        {/* Vehicle picker list */}
        <div style={{ width:260, flexShrink:0, borderRight:`1px solid ${t.border}`, overflowY:"auto", background:t.sidebarBg, padding:"12px" }}>
          {VEHICLES.map(v=>{
            const sc=STATUS_S[v.status];
            return (
              <div key={v.id} onClick={()=>setSel(v)} style={{ background:sel.id===v.id?t.navActiveBg:t.cardBg, borderRadius:10, border:`1.5px solid ${sel.id===v.id?t.accent:t.border}`, padding:"12px", marginBottom:8, cursor:"pointer", transition:"all 0.15s" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <img src={v.image} alt={v.name} style={{ width:44, height:32, objectFit:"cover", borderRadius:6, flexShrink:0 }}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:t.textPri, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{v.name}</div>
                    <div style={{ fontSize:10, color:t.textMuted }}>{v.plate}</div>
                  </div>
                </div>
                <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:sc.dot }}/>
                  <span style={{ fontSize:10, color:sc.color, fontWeight:600, textTransform:"capitalize" }}>{v.status}</span>
                  {v.speed>0 && <span style={{ fontSize:10, color:t.textMuted, marginLeft:"auto" }}>{v.speed} km/h</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        <div style={{ flex:1, overflowY:"auto", padding:"24px 28px", background:t.bg }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, maxWidth:900 }}>

            {/* Car card */}
            <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, overflow:"hidden", gridColumn:"1/-1" }}>
              <div style={{ position:"relative", height:180 }}>
                <img src={sel.image} alt={sel.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                <div style={{ position:"absolute", inset:0, background:t.imgOverlay }}/>
                <div style={{ position:"absolute", bottom:16, left:20 }}>
                  <div style={{ fontSize:20, fontWeight:800, color:"#fff" }}>{sel.name}</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.65)" }}>{sel.plate} · {sel.mileage.toLocaleString()} km</div>
                </div>
                <div style={{ position:"absolute", top:14, right:16 }}>
                  <span style={{ background:STATUS_S[sel.status].bg, color:STATUS_S[sel.status].color, borderRadius:20, padding:"5px 12px", fontSize:12, fontWeight:700, border:`1px solid ${STATUS_S[sel.status].dot}33`, textTransform:"capitalize" }}>{sel.status}</span>
                </div>
              </div>
            </div>

            {/* Telemetry gauges */}
            <div style={{ background:dark?"#16162A":"#111", borderRadius:14, border:`1px solid ${t.border}`, padding:"22px 24px" }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#fff", marginBottom:20 }}>Live Telemetry</div>
              <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
                <GaugeBar value={sel.speed} max={160} color="#4F46E5" label="Speed"/>
                {sel.fuel!=null && <GaugeBar value={sel.fuel} max={100} color={sel.fuel<30?"#EF4444":sel.fuel<60?"#F59E0B":"#10B981"} label="Fuel"/>}
                {sel.battery!=null && <GaugeBar value={sel.battery} max={100} color={sel.battery<20?"#EF4444":sel.battery<50?"#F59E0B":"#10B981"} label="Battery"/>}
                {sel.temp!=null && <GaugeBar value={sel.temp} max={130} color={sel.temp>100?"#EF4444":"#F59E0B"} label="Temp"/>}
              </div>
            </div>

            {/* Status grid */}
            <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"22px 24px" }}>
              <div style={{ fontSize:13, fontWeight:700, color:t.textPri, marginBottom:20 }}>Vehicle Status</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                {[
                  { label:"Engine",      value:sel.engine,  ok:sel.engine==="On" },
                  { label:"Doors",       value:sel.doors,   ok:sel.doors==="Locked" },
                  { label:"Last Seen",   value:sel.lastSeen,ok:true },
                  { label:"Mileage",     value:`${sel.mileage.toLocaleString()} km`, ok:true },
                ].map(s=>(
                  <div key={s.label} style={{ background:t.bg, borderRadius:10, padding:"14px 16px", border:`1px solid ${t.border}` }}>
                    <div style={{ fontSize:11, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>{s.label}</div>
                    <div style={{ fontSize:14, fontWeight:700, color:s.ok?t.textPri:"#EF4444" }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}