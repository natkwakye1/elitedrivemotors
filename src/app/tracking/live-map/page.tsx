"use client";
// src/app/tracking/live-map/page.tsx
import { useTheme } from "@/src/context/ThemeContext";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/src/components/layout/Appshell";
import TopBar   from "@/src/components/layout/Topbar";
import { Ic }   from "@/src/components/ui/Icons";

const FLEET = [
  { id:0, name:"Audi A4",          plate:"GR-4421-22", status:"Moving",     speed:"62 km/h", driver:"Kwame Asante", fuel:78, location:"N1 Highway, Accra",      image:"https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=280&q=80", coords:[5.5604,-0.2019] as [number,number] },
  { id:1, name:"Tesla Model S",    plate:"GW-1122-24", status:"Parked",     speed:"0 km/h",  driver:"Abena Osei",   fuel:84, location:"Osu, Oxford Street",      image:"https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=280&q=80", coords:[5.5572,-0.1955] as [number,number] },
  { id:2, name:"BMW 3 Series",     plate:"GR-2341-22", status:"Moving",     speed:"45 km/h", driver:"Kofi Mensah",  fuel:55, location:"Spintex Road",            image:"https://images.unsplash.com/photo-1555215695-3004980ad54e?w=280&q=80", coords:[5.5502,-0.2174] as [number,number] },
  { id:3, name:"Mercedes C-Class", plate:"GN-8821-22", status:"In Service", speed:"0 km/h",  driver:"—",            fuel:32, location:"East Legon Workshop",     image:"https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=280&q=80", coords:[5.6037,-0.1870] as [number,number] },
  { id:4, name:"Porsche Macan",    plate:"GE-9912-23", status:"Moving",     speed:"78 km/h", driver:"Yaw Boateng",  fuel:91, location:"Tema Motorway",           image:"https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=280&q=80", coords:[5.6145,-0.2057] as [number,number] },
  { id:5, name:"VW Tiguan",        plate:"GT-5512-23", status:"Moving",     speed:"38 km/h", driver:"Ama Darko",    fuel:67, location:"Ring Road, Accra",        image:"https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=280&q=80", coords:[5.6350,-0.1681] as [number,number] },
];

const SC: Record<string,string> = { Moving:"#10B981", Parked:"#4F46E5", "In Service":"#F59E0B" };

function LiveLeafletMap({ dark, t, fleet, selectedId, onSelect }:{dark:boolean;t:any;fleet:typeof FLEET;selectedId:number|null;onSelect:(id:number)=>void}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<any>(null);
  const markersRef   = useRef<Record<number,any>>({});

  useEffect(() => {
    if (!containerRef.current) return;
    import("leaflet").then(L => {
      if (!containerRef.current) return;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current=null; markersRef.current={}; }
      const map = L.map(containerRef.current,{center:[5.5908,-0.2043],zoom:13});
      mapRef.current = map;
      const key = process.env.NEXT_PUBLIC_MAPTILER_KEY??"";
      const hasMT = key && key!=="YOUR_MAPTILER_KEY_HERE";
      L.tileLayer(hasMT
        ? (dark?`https://api.maptiler.com/maps/streets-v2-dark/{z}/{x}/{y}.png?key=${key}`:`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${key}`)
        : (dark?"https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png":"https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"),
        {attribution:'&copy; OSM',maxZoom:19,...(hasMT?{tileSize:512,zoomOffset:-1}:{})}
      ).addTo(map);
      fleet.forEach(car => {
        const c=SC[car.status]??"#6B7280", pulse=car.status==="Moving"?"animation:lmPulse 2s infinite;":"";
        const html=`<div style="display:flex;flex-direction:column;align-items:center;gap:4px"><div style="width:38px;height:38px;border-radius:50%;background:${c};border:3px solid #fff;box-shadow:0 2px 14px ${c}99;display:flex;align-items:center;justify-content:center;${pulse}"><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h14l4 4v4a2 2 0 01-2 2h-2m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div style="background:rgba(0,0,0,0.82);color:#fff;border-radius:6px;padding:3px 9px;font-size:11px;font-weight:700;font-family:'DM Sans',sans-serif;white-space:nowrap">${car.name}</div></div>`;
        const icon=L.divIcon({html,className:"",iconAnchor:[19,19]});
        const marker=L.marker(car.coords,{icon}).addTo(map);
        markersRef.current[car.id]=marker;
        marker.on("click",()=>onSelect(car.id));
      });
    });
    return ()=>{if(mapRef.current){mapRef.current.remove();mapRef.current=null;markersRef.current={};}};
  },[dark]);

  useEffect(()=>{
    if(!mapRef.current) return;
    import("leaflet").then(L=>{
      fleet.forEach(car=>{
        const marker=markersRef.current[car.id]; if(!marker) return;
        const c=SC[car.status]??"#6B7280", isSel=car.id===selectedId, size=isSel?48:38, pulse=car.status==="Moving"?"animation:lmPulse 2s infinite;":"";
        const html=`<div style="display:flex;flex-direction:column;align-items:center;gap:4px"><div style="width:${size}px;height:${size}px;border-radius:50%;background:${isSel?"#fff":c};border:3px solid ${isSel?c:"#fff"};box-shadow:${isSel?`0 0 22px ${c}cc,0 2px 14px ${c}88`:`0 2px 14px ${c}99`};display:flex;align-items:center;justify-content:center;${pulse}"><svg width="${isSel?22:17}" height="${isSel?22:17}" viewBox="0 0 24 24" fill="none"><path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h14l4 4v4a2 2 0 01-2 2h-2m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" stroke="${isSel?c:"#fff"}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div style="background:${isSel?c:"rgba(0,0,0,0.82)"};color:#fff;border-radius:6px;padding:3px 9px;font-size:${isSel?12:11}px;font-weight:700;font-family:'DM Sans',sans-serif;white-space:nowrap">${car.name}</div></div>`;
        marker.setIcon(L.divIcon({html,className:"",iconAnchor:[size/2,size/2]}));
      });
      if(selectedId!==null){const car=fleet.find(c=>c.id===selectedId);if(car)mapRef.current.panTo(car.coords,{animate:true,duration:0.4});}
    });
  },[selectedId]);

  return (<>
    <style>{`@keyframes lmPulse{0%,100%{box-shadow:0 2px 12px rgba(16,185,129,0.45);}50%{box-shadow:0 0 22px rgba(16,185,129,0.9);}} .leaflet-container{background:${dark?"#111":"#f0f4f8"};} .leaflet-control-attribution{font-size:9px!important;opacity:0.4;}`}</style>
    <div ref={containerRef} style={{width:"100%",height:"100%"}}/>
  </>);
}

export default function LiveMapPage() {
  const router = useRouter();
  const { dark, setDark, t } = useTheme();
  const [selId, setSelId] = useState<number|null>(null);
  const [search, setSearch] = useState("");
  const sel = FLEET.find(c=>c.id===selId)??null;
  const filtered = FLEET.filter(c=>{
    const q=search.toLowerCase();
    return !search||c.name.toLowerCase().includes(q)||c.plate.toLowerCase().includes(q)||c.driver.toLowerCase().includes(q);
  });

  // panel bg colors for dark/light
  const panelBg   = dark?"rgba(14,14,14,0.97)":"rgba(255,255,255,0.97)";
  const panelCell = dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.05)";
  const panelBord = dark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.08)";
  const panelText = dark?"#fff":"#111";
  const panelSub  = dark?"rgba(255,255,255,0.5)":"rgba(0,0,0,0.4)";

  return (
    <AppShell active="Live Map" dark={dark} setDark={setDark} t={t}>
      <TopBar title="Live Tracking" subtitle={`${FLEET.length} vehicles · Accra, Ghana`} dark={dark} setDark={setDark} t={t}
        actions={
          <div style={{display:"flex",gap:6}}>
            {[{s:"Moving",c:"#10B981"},{s:"Parked",c:"#4F46E5"},{s:"In Service",c:"#F59E0B"}].map(item=>(
              <span key={item.s} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:700,color:t.textPri,background:t.bg,border:`1px solid ${t.border}`,borderRadius:20,padding:"5px 12px",fontFamily:"'DM Sans',sans-serif"}}>
                <span style={{width:8,height:8,borderRadius:"50%",background:item.c,display:"inline-block",boxShadow:item.s==="Moving"?`0 0 6px ${item.c}`:"none"}}/>
                {item.s} · {FLEET.filter(c=>c.status===item.s).length}
              </span>
            ))}
          </div>
        }
      />

      <div style={{flex:1,display:"flex",overflow:"hidden"}}>
        {/* Sidebar */}
        <div style={{width:300,flexShrink:0,borderRight:`1px solid ${t.border}`,display:"flex",flexDirection:"column",background:t.cardBg,overflow:"hidden",fontFamily:"'DM Sans',sans-serif"}}>

          {/* Header */}
          <div style={{padding:"14px 16px 12px",borderBottom:`1px solid ${t.border}`,flexShrink:0}}>
            <div style={{fontSize:15,fontWeight:800,color:t.textPri,marginBottom:10}}>Fleet Vehicles</div>
            <div style={{position:"relative"}}>
              <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",display:"flex",opacity:0.55}}>{Ic.Search(t.textPri)}</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search vehicles, plates, drivers…"
                style={{width:"100%",padding:"9px 12px 9px 32px",borderRadius:9,border:`1px solid ${t.border}`,background:t.bg,color:t.textPri,fontSize:13,outline:"none",fontFamily:"'DM Sans',sans-serif",boxSizing:"border-box",transition:"border-color 0.15s"}}
                onFocus={e=>(e.target.style.borderColor=t.accent)} onBlur={e=>(e.target.style.borderColor=t.border)}/>
            </div>
          </div>

          {/* Stat strip */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",borderBottom:`1px solid ${t.border}`,flexShrink:0}}>
            {[{label:"Moving",val:FLEET.filter(c=>c.status==="Moving").length,color:"#10B981"},{label:"Parked",val:FLEET.filter(c=>c.status==="Parked").length,color:"#4F46E5"},{label:"Service",val:FLEET.filter(c=>c.status==="In Service").length,color:"#F59E0B"}].map((s,i)=>(
              <div key={s.label} style={{padding:"12px 0",textAlign:"center",borderRight:i<2?`1px solid ${t.border}`:"none"}}>
                <div style={{fontSize:22,fontWeight:800,color:s.color,fontFamily:"'DM Sans',sans-serif"}}>{s.val}</div>
                <div style={{fontSize:11,fontWeight:700,color:t.textSec,marginTop:2,textTransform:"uppercase",letterSpacing:0.5}}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Vehicle list */}
          <div style={{flex:1,overflowY:"auto"}}>
            {filtered.map(car=>{
              const sCol=SC[car.status], isSel=selId===car.id;
              return (
                <div key={car.id} onClick={()=>setSelId(p=>p===car.id?null:car.id)}
                  style={{padding:"13px 16px",cursor:"pointer",background:isSel?t.navActiveBg:"transparent",borderLeft:`3px solid ${isSel?t.accent:"transparent"}`,borderBottom:`1px solid ${t.divider}`,transition:"all 0.12s"}}
                  onMouseEnter={e=>{if(!isSel)(e.currentTarget as HTMLDivElement).style.background=t.navActiveBg;}}
                  onMouseLeave={e=>{if(!isSel)(e.currentTarget as HTMLDivElement).style.background="transparent";}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:66,height:50,borderRadius:9,overflow:"hidden",flexShrink:0,border:`2px solid ${isSel?t.accent:t.border}`,background:t.bg,transition:"border-color 0.12s"}}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={car.image} alt={car.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontSize:14,fontWeight:700,color:t.textPri,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{car.name}</span>
                        <span style={{fontSize:10,fontWeight:700,color:sCol,background:sCol+"1a",border:`1px solid ${sCol}40`,borderRadius:20,padding:"2px 9px",flexShrink:0,marginLeft:6}}>{car.status}</span>
                      </div>
                      <div style={{fontSize:12,fontWeight:500,color:t.textSec,display:"flex",alignItems:"center",gap:5}}>
                        <span style={{display:"flex",opacity:0.6}}>{Ic.License(t.textPri)}</span>
                        {car.plate} · {car.driver}
                      </div>
                    </div>
                  </div>
                  {isSel&&(
                    <div style={{display:"flex",gap:6,marginTop:10,marginLeft:78,flexWrap:"wrap" as const}}>
                      <span style={{display:"flex",alignItems:"center",gap:4,fontSize:12,fontWeight:700,color:t.textPri,background:t.bg,border:`1px solid ${t.border}`,borderRadius:6,padding:"5px 10px"}}>
                        <span style={{display:"flex",opacity:0.6}}>{Ic.Tracking(t.textPri)}</span>{car.speed}
                      </span>
                      <span style={{fontSize:12,fontWeight:700,color:car.fuel>50?"#10B981":"#F59E0B",background:car.fuel>50?"rgba(16,185,129,0.1)":"rgba(245,158,11,0.1)",border:`1px solid ${car.fuel>50?"rgba(16,185,129,0.3)":"rgba(245,158,11,0.3)"}`,borderRadius:6,padding:"5px 10px"}}>
                        {car.fuel}% fuel
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{padding:"12px 16px",borderTop:`1px solid ${t.border}`,background:t.bg,flexShrink:0}}>
            <button onClick={()=>router.push("/tracking/trip-history")}
              style={{width:"100%",padding:"10px 0",borderRadius:9,border:`1px solid ${t.border}`,background:t.cardBg,color:t.textPri,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:7,transition:"border-color 0.15s"}}
              onMouseEnter={e=>((e.currentTarget as HTMLButtonElement).style.borderColor=t.accent)}
              onMouseLeave={e=>((e.currentTarget as HTMLButtonElement).style.borderColor=t.border)}>
              <span style={{display:"flex"}}>{Ic.History(t.textPri)}</span>View Trip History
            </button>
          </div>
        </div>

        {/* Map */}
        <div style={{flex:1,position:"relative",overflow:"hidden"}}>
          <LiveLeafletMap dark={dark} t={t} fleet={FLEET} selectedId={selId} onSelect={id=>setSelId(p=>p===id?null:id)}/>

          {!sel&&(
            <div style={{position:"absolute",bottom:22,left:"50%",transform:"translateX(-50%)",background:dark?"rgba(10,10,10,0.9)":"rgba(255,255,255,0.95)",border:`1px solid ${t.border}`,borderRadius:22,padding:"9px 20px",fontSize:13,fontWeight:600,color:t.textPri,pointerEvents:"none",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif",backdropFilter:"blur(8px)"}}>
              Click a vehicle on the map or list to see live details
            </div>
          )}

          {sel&&(()=>{
            const sc=SC[sel.status];
            return (
              <div style={{position:"absolute",bottom:16,right:16,width:308,background:panelBg,borderRadius:18,border:`1px solid ${panelBord}`,overflow:"hidden",boxShadow:dark?"0 20px 60px rgba(0,0,0,0.7)":"0 20px 60px rgba(0,0,0,0.18)",backdropFilter:"blur(16px)",animation:"slideUp 0.18s ease",fontFamily:"'DM Sans',sans-serif"}}>
                <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
                {/* Hero */}
                <div style={{position:"relative",height:156}}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sel.image} alt={sel.name} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.08) 55%)"}}/>
                  <span style={{position:"absolute",top:12,left:12,fontSize:11,fontWeight:700,color:sc,background:sc+"28",border:`1px solid ${sc}55`,borderRadius:20,padding:"4px 12px",backdropFilter:"blur(8px)"}}>● {sel.status}</span>
                  <button onClick={()=>setSelId(null)} style={{position:"absolute",top:12,right:12,width:30,height:30,borderRadius:"50%",background:"rgba(0,0,0,0.6)",border:"1px solid rgba(255,255,255,0.2)",cursor:"pointer",color:"#fff",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                  <div style={{position:"absolute",bottom:14,left:16,right:16}}>
                    <div style={{fontSize:18,fontWeight:800,color:"#fff",lineHeight:1.2,textShadow:"0 1px 4px rgba(0,0,0,0.5)"}}>{sel.name}</div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,0.7)",marginTop:3,display:"flex",alignItems:"center",gap:5}}>
                      <span style={{display:"flex",opacity:0.8}}>{Ic.License("#fff")}</span>{sel.plate}
                    </div>
                  </div>
                </div>

                <div style={{padding:"16px 16px 6px"}}>
                  {/* Stats grid */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                    {[{label:"Speed",value:sel.speed,icon:(c:string)=>Ic.Tracking(c)},{label:"Driver",value:sel.driver,icon:(c:string)=>Ic.Profile(c)},{label:"Fuel",value:`${sel.fuel}% remaining`,icon:(c:string)=>Ic.Monitor(c)},{label:"Location",value:sel.location.split(",")[0],icon:(c:string)=>Ic.Pin(c)}].map(row=>(
                      <div key={row.label} style={{background:panelCell,borderRadius:10,border:`1px solid ${panelBord}`,padding:"10px 12px",display:"flex",alignItems:"flex-start",gap:8}}>
                        <div style={{width:26,height:26,borderRadius:7,background:sc+"22",border:`1px solid ${sc}33`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                          <span style={{display:"flex"}}>{row.icon(sc)}</span>
                        </div>
                        <div style={{minWidth:0}}>
                          <div style={{fontSize:10,fontWeight:600,color:panelSub,textTransform:"uppercase",letterSpacing:0.6,marginBottom:3}}>{row.label}</div>
                          <div style={{fontSize:13,fontWeight:700,color:panelText,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{row.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Fuel bar */}
                  <div style={{background:panelCell,borderRadius:10,border:`1px solid ${panelBord}`,padding:"12px 14px",marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                      <span style={{fontSize:12,fontWeight:600,color:panelSub}}>Fuel Level</span>
                      <span style={{fontSize:14,fontWeight:800,color:sel.fuel>60?"#10B981":sel.fuel>30?"#F59E0B":"#EF4444"}}>{sel.fuel}%</span>
                    </div>
                    <div style={{height:6,borderRadius:4,background:dark?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.1)",overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${sel.fuel}%`,background:sel.fuel>60?"#10B981":sel.fuel>30?"#F59E0B":"#EF4444",borderRadius:4,transition:"width 0.6s ease"}}/>
                    </div>
                  </div>

                  {/* Location */}
                  <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 13px",background:panelCell,borderRadius:10,border:`1px solid ${panelBord}`,marginBottom:12}}>
                    <span style={{display:"flex",opacity:0.6}}>{Ic.Pin(panelText)}</span>
                    <span style={{fontSize:13,fontWeight:600,color:panelText,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sel.location}</span>
                  </div>

                  {/* Actions */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,paddingBottom:16}}>
                    <button onClick={()=>router.push("/dashboard/super-admin/cars")}
                      style={{padding:"11px 0",borderRadius:10,border:`1px solid ${panelBord}`,background:panelCell,color:panelText,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s"}}
                      onMouseEnter={e=>{const b=e.currentTarget as HTMLButtonElement;b.style.borderColor=sc;b.style.color=sc;}}
                      onMouseLeave={e=>{const b=e.currentTarget as HTMLButtonElement;b.style.borderColor=panelBord;b.style.color=panelText;}}>
                      Car Details
                    </button>
                    <button onClick={()=>router.push("/tracking/trip-history")}
                      style={{padding:"11px 0",borderRadius:10,border:"none",background:sc,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                      <span style={{display:"flex"}}>{Ic.History("#fff")}</span>Trip History
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Legend */}
          <div style={{position:"absolute",bottom:16,left:16,display:"flex",flexDirection:"column",gap:7}}>
            {[{s:"Moving",c:"#10B981"},{s:"Parked",c:"#4F46E5"},{s:"In Service",c:"#F59E0B"}].map(item=>(
              <div key={item.s} style={{display:"flex",alignItems:"center",gap:8,background:dark?"rgba(10,10,10,0.88)":"rgba(255,255,255,0.94)",border:`1px solid ${t.border}`,borderRadius:22,padding:"6px 14px",backdropFilter:"blur(8px)"}}>
                <span style={{width:8,height:8,borderRadius:"50%",background:item.c,display:"inline-block",flexShrink:0,boxShadow:item.s==="Moving"?`0 0 7px ${item.c}`:"none"}}/>
                <span style={{fontSize:12,fontWeight:700,color:t.textPri,fontFamily:"'DM Sans',sans-serif"}}>{item.s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
