"use client";
// src/app/dashboard/super-admin/cars/add/page.tsx
import { useTheme } from "@/src/context/ThemeContext";
import { useState } from "react";
import { useRouter } from "next/navigation";

import AppShell from "@/src/components/layout/Appshell";
import TopBar from "@/src/components/layout/Topbar";

function Field({ label, t, children }: { label: string; t: any; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom:18 }}>
      <label style={{ display:"block", fontSize:11, fontWeight:600, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:7 }}>{label}</label>
      {children}
    </div>
  );
}
function SI({ value, onChange, t, placeholder, type="text" }: any) {
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{ width:"100%", padding:"10px 14px", borderRadius:8, border:`1px solid ${t.border}`, background:t.inputBg, color:t.textPri, fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box" }} />;
}
function SS2({ value, onChange, t, options }: any) {
  return (
    <select value={value} onChange={onChange} style={{ width:"100%", padding:"10px 14px", borderRadius:8, border:`1px solid ${t.border}`, background:t.inputBg, color:t.textPri, fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:"none" }}>
      {options.map((o: string) => <option key={o}>{o}</option>)}
    </select>
  );
}

interface Feature { header: string; description: string }

export default function AddCarPage() {
  const router = useRouter();
  const { dark, setDark, t } = useTheme();
  const [form, setForm] = useState({ name:"", brand:"", model:"", year:"2024", type:"Sedan", fuel:"Gasoline", transmission:"Automatic", plate:"", mileage:"0", rateHr:"", rateDy:"", color:"", seats:"5" });
  const [features, setFeatures] = useState<Feature[]>([{ header:"", description:"" }]);
  const [saved, setSaved] = useState(false);
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const addFeature = () => setFeatures(p => [...p, { header:"", description:"" }]);
  const removeFeature = (i: number) => setFeatures(p => p.filter((_, idx) => idx !== i));
  const updateFeature = (i: number, k: keyof Feature, v: string) => setFeatures(p => p.map((f, idx) => idx === i ? { ...f, [k]: v } : f));

  const save = () => {
    setSaved(true);
    setTimeout(() => router.back(), 1200);
  };

  return (
    <AppShell active="Fleet Cars" dark={dark} setDark={setDark} t={t}>
      <TopBar title="Add New Vehicle" subtitle="Add a vehicle to the fleet" dark={dark} setDark={setDark} t={t}
        actions={
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>router.back()} style={{ padding:"7px 16px", borderRadius:8, border:`1px solid ${t.border}`, background:t.cardBg, color:t.textSec, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
            <button onClick={save} disabled={saved} style={{ padding:"7px 18px", borderRadius:8, border:"none", background:saved?"#10B981":t.accent, color:saved?"#fff":t.accentFg, fontSize:12, fontWeight:600, cursor:saved?"default":"pointer", fontFamily:"'DM Sans',sans-serif", transition:"background 0.3s" }}>{saved?"Changes Saved":"Save Car"}</button>
          </div>
        }
      />
      <div style={{ flex:1, overflowY:"auto", padding:"24px 28px", background:t.bg }}>
        <div style={{ maxWidth:800, display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"22px 24px", gridColumn:"1/-1" }}>
            <div style={{ fontSize:13, fontWeight:700, color:t.textPri, marginBottom:18 }}>Vehicle Information</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
              <Field label="Make / Brand" t={t}><SI value={form.brand} onChange={(e:any)=>set("brand",e.target.value)} t={t} placeholder="e.g. BMW"/></Field>
              <Field label="Model" t={t}><SI value={form.model} onChange={(e:any)=>set("model",e.target.value)} t={t} placeholder="e.g. 3 Series"/></Field>
              <Field label="Year" t={t}><SS2 value={form.year} onChange={(e:any)=>set("year",e.target.value)} t={t} options={["2024","2023","2022","2021","2020","2019","2018"]}/></Field>
              <Field label="Body Type" t={t}><SS2 value={form.type} onChange={(e:any)=>set("type",e.target.value)} t={t} options={["Sedan","Coupe","SUV","Crossover","Hatchback","Pickup","Van"]}/></Field>
              <Field label="Fuel Type" t={t}><SS2 value={form.fuel} onChange={(e:any)=>set("fuel",e.target.value)} t={t} options={["Gasoline","Diesel","Electric","Hybrid","Hydrogen"]}/></Field>
              <Field label="Transmission" t={t}><SS2 value={form.transmission} onChange={(e:any)=>set("transmission",e.target.value)} t={t} options={["Automatic","Manual"]}/></Field>
              <Field label="License Plate" t={t}><SI value={form.plate} onChange={(e:any)=>set("plate",e.target.value)} t={t} placeholder="e.g. GR-1234-22"/></Field>
              <Field label="Colour" t={t}><SI value={form.color} onChange={(e:any)=>set("color",e.target.value)} t={t} placeholder="e.g. Midnight Black"/></Field>
              <Field label="Current Mileage (km)" t={t}><SI type="number" value={form.mileage} onChange={(e:any)=>set("mileage",e.target.value)} t={t} placeholder="0"/></Field>
              <Field label="Seats" t={t}><SS2 value={form.seats} onChange={(e:any)=>set("seats",e.target.value)} t={t} options={["2","4","5","7","8","9"]}/></Field>
            </div>
          </div>

          <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"22px 24px" }}>
            <div style={{ fontSize:13, fontWeight:700, color:t.textPri, marginBottom:18 }}>Pricing</div>
            <Field label="Hourly Rate ($)" t={t}><SI type="number" value={form.rateHr} onChange={(e:any)=>set("rateHr",e.target.value)} t={t} placeholder="e.g. 24.99"/></Field>
            <Field label="Daily Rate ($)" t={t}><SI type="number" value={form.rateDy} onChange={(e:any)=>set("rateDy",e.target.value)} t={t} placeholder="e.g. 180.00"/></Field>
          </div>

          <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"22px 24px" }}>
            <div style={{ fontSize:13, fontWeight:700, color:t.textPri, marginBottom:18 }}>Upload Images</div>
            <div style={{ height:120, borderRadius:10, border:`2px dashed ${t.border}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8, cursor:"pointer", background:t.bg }}>
              <div style={{ opacity:0.4, display:"flex" }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>
              <div style={{ fontSize:12, color:t.textMuted }}>Click to upload or drag & drop</div>
              <div style={{ fontSize:11, color:t.textHint }}>PNG, JPG, WEBP · max 5MB each</div>
            </div>
          </div>

          {/* ── Features Section ── */}
          <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"22px 24px", gridColumn:"1/-1" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:t.textPri }}>Features & Extras</div>
                <div style={{ fontSize:11, color:t.textMuted, marginTop:3 }}>Add custom features with a title and description</div>
              </div>
              <span style={{ fontSize:11, color:t.textMuted }}>{features.filter(f => f.header.trim()).length} feature{features.filter(f => f.header.trim()).length !== 1 ? "s" : ""}</span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {features.map((feat, i) => (
                <div key={i} style={{ padding:"16px 18px", borderRadius:10, border:`1.5px solid ${t.border}`, background:t.bg, position:"relative" }}>
                  {features.length > 1 && (
                    <button onClick={() => removeFeature(i)} style={{ position:"absolute", top:10, right:10, width:24, height:24, borderRadius:"50%", border:`1px solid ${t.border}`, background:t.cardBg, color:t.textMuted, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1, fontFamily:"'DM Sans',sans-serif" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#EF4444"; (e.currentTarget as HTMLButtonElement).style.color = "#EF4444"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = t.border; (e.currentTarget as HTMLButtonElement).style.color = t.textMuted; }}
                    >×</button>
                  )}
                  <div style={{ marginBottom:10 }}>
                    <label style={{ display:"block", fontSize:10, fontWeight:600, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:5 }}>Feature Title</label>
                    <input value={feat.header} onChange={e => updateFeature(i, "header", e.target.value)} placeholder="e.g. Apple CarPlay" style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:`1px solid ${t.border}`, background:t.cardBg, color:t.textPri, fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box" }} />
                  </div>
                  <div>
                    <label style={{ display:"block", fontSize:10, fontWeight:600, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:5 }}>Description</label>
                    <textarea value={feat.description} onChange={e => updateFeature(i, "description", e.target.value)} placeholder="Brief description of the feature…" rows={2} style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:`1px solid ${t.border}`, background:t.cardBg, color:t.textPri, fontSize:12, outline:"none", fontFamily:"'DM Sans',sans-serif", resize:"vertical", boxSizing:"border-box" }} />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addFeature} style={{ marginTop:14, width:"100%", padding:"10px 0", borderRadius:9, border:`2px dashed ${t.border}`, background:"transparent", color:t.accent, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"border-color 0.15s" }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = t.accent)}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = t.border)}
            >+ Add Another Feature</button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}