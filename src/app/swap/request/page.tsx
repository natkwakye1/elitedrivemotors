"use client";
// src/app/swap/request/page.tsx

import { useTheme } from "@/src/context/ThemeContext";
import { useState } from "react";
import { useRouter } from "next/navigation";

import AppShell from "@/src/components/layout/Appshell";
import PageHeader from "@/src/components/layout/PageHeader";

function Field({ label, t, children }: any) {
  return (
    <div style={{ marginBottom:18 }}>
      <label style={{ display:"block", fontSize:11, fontWeight:600, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:7 }}>{label}</label>
      {children}
    </div>
  );
}
function SI({ value, onChange, t, placeholder, type="text" }: any) {
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{ width:"100%", padding:"10px 14px", borderRadius:8, border:`1px solid ${t.border}`, background:t.inputBg, color:t.textPri, fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif" }} onFocus={e=>(e.target.style.borderColor=t.accent)} onBlur={e=>(e.target.style.borderColor=t.border)}/>;
}
function SSelect({ value, onChange, t, options }: any) {
  return <select value={value} onChange={onChange} style={{ width:"100%", padding:"10px 14px", borderRadius:8, border:`1px solid ${t.border}`, background:t.inputBg, color:t.textPri, fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:"none" }}>{options.map((o:string)=><option key={o}>{o}</option>)}</select>;
}

export default function SwapRequestPage() {
  const router = useRouter();
  const { dark, setDark, t } = useTheme();
  const [form, setForm] = useState({ myBrand:"", myModel:"", myYear:"2022", myMileage:"", myType:"Sedan", myFuel:"Gasoline", myPlate:"", myCondition:"Excellent", wantBrand:"", wantModel:"", wantYear:"", wantType:"Any", notes:"", topUp:"" });
  const [submitted, setSubmitted] = useState(false);
  const set = (k:string,v:string)=>setForm(p=>({...p,[k]:v}));

  if (submitted) return (
    <AppShell active="Submit Request" dark={dark} setDark={setDark} t={t}>
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", background:t.bg }}>
        <div style={{ textAlign:"center", background:t.cardBg, borderRadius:20, border:`1px solid ${t.border}`, padding:"48px 40px", maxWidth:400 }}>
          <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(16,185,129,0.15)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div style={{ fontSize:22, fontWeight:800, color:t.textPri, marginBottom:8 }}>Swap Request Submitted!</div>
          <div style={{ fontSize:13, color:t.textMuted, lineHeight:1.7, marginBottom:28 }}>Your swap listing is now live. We'll notify you when someone makes an offer.</div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={()=>router.push("/swap")} style={{ flex:1, border:`1px solid ${t.border}`, background:t.bg, color:t.textSec, borderRadius:10, padding:"11px 0", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Browse Swaps</button>
            <button onClick={()=>router.push("/swap/offers")} style={{ flex:1, background:t.accent, color:t.accentFg, borderRadius:10, padding:"11px 0", fontSize:13, fontWeight:700, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>My Offers</button>
          </div>
        </div>
      </div>
    </AppShell>
  );

  return (
    <AppShell active="Submit Request" dark={dark} setDark={setDark} t={t}>
      <PageHeader title="List Your Car for Swap" subtitle="Fill in your car details and what you're looking for" dark={dark} setDark={setDark} t={t}
        actions={<button onClick={()=>router.push("/swap")} style={{ padding:"7px 14px", borderRadius:8, border:`1px solid ${t.border}`, background:t.cardBg, color:t.textSec, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Back</button>}
      />
      <div style={{ flex:1, overflowY:"auto", padding:"24px 28px", background:t.bg }}>
        <div style={{ maxWidth:840, display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>

          {/* My car */}
          <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"22px 24px" }}>
            <div style={{ fontSize:14, fontWeight:700, color:t.textPri, marginBottom:18 }}>My Car (Offering)</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
              <Field label="Make" t={t}><SI value={form.myBrand} onChange={(e:any)=>set("myBrand",e.target.value)} t={t} placeholder="e.g. Audi"/></Field>
              <Field label="Model" t={t}><SI value={form.myModel} onChange={(e:any)=>set("myModel",e.target.value)} t={t} placeholder="e.g. A4"/></Field>
              <Field label="Year" t={t}><SSelect value={form.myYear} onChange={(e:any)=>set("myYear",e.target.value)} t={t} options={["2024","2023","2022","2021","2020","2019","2018","2017"]}/></Field>
              <Field label="Body Type" t={t}><SSelect value={form.myType} onChange={(e:any)=>set("myType",e.target.value)} t={t} options={["Sedan","SUV","Crossover","Hatchback","Coupe","Pickup","Van"]}/></Field>
              <Field label="Fuel" t={t}><SSelect value={form.myFuel} onChange={(e:any)=>set("myFuel",e.target.value)} t={t} options={["Gasoline","Diesel","Electric","Hybrid"]}/></Field>
              <Field label="Mileage (km)" t={t}><SI type="number" value={form.myMileage} onChange={(e:any)=>set("myMileage",e.target.value)} t={t} placeholder="e.g. 24000"/></Field>
            </div>
            <Field label="License Plate" t={t}><SI value={form.myPlate} onChange={(e:any)=>set("myPlate",e.target.value)} t={t} placeholder="e.g. GR-4421-22"/></Field>
            <Field label="Condition" t={t}><SSelect value={form.myCondition} onChange={(e:any)=>set("myCondition",e.target.value)} t={t} options={["Excellent","Very Good","Good","Fair"]}/></Field>

            {/* Image upload */}
            <div style={{ height:90, borderRadius:10, border:`2px dashed ${t.border}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6, cursor:"pointer", background:t.bg }}>
              <div style={{ opacity:0.4, display:"flex" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>
              <div style={{ fontSize:12, color:t.textMuted }}>Upload car photos</div>
            </div>
          </div>

          {/* Wanted car */}
          <div>
            <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"22px 24px", marginBottom:16 }}>
              <div style={{ fontSize:14, fontWeight:700, color:t.textPri, marginBottom:18 }}>What I Want</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
                <Field label="Preferred Make" t={t}><SI value={form.wantBrand} onChange={(e:any)=>set("wantBrand",e.target.value)} t={t} placeholder="e.g. BMW (or Any)"/></Field>
                <Field label="Preferred Model" t={t}><SI value={form.wantModel} onChange={(e:any)=>set("wantModel",e.target.value)} t={t} placeholder="e.g. 3 Series (or Any)"/></Field>
                <Field label="Year From" t={t}><SI type="number" value={form.wantYear} onChange={(e:any)=>set("wantYear",e.target.value)} t={t} placeholder="e.g. 2021"/></Field>
                <Field label="Body Type" t={t}><SSelect value={form.wantType} onChange={(e:any)=>set("wantType",e.target.value)} t={t} options={["Any","Sedan","SUV","Crossover","Hatchback","Coupe"]}/></Field>
              </div>
              <Field label="Top-up amount willing to pay ($)" t={t}><SI type="number" value={form.topUp} onChange={(e:any)=>set("topUp",e.target.value)} t={t} placeholder="e.g. 5000 (0 for equal swap)"/></Field>
              <Field label="Additional Notes" t={t}>
                <textarea value={form.notes} onChange={(e:any)=>set("notes",e.target.value)} placeholder="Any special requirements or details..." rows={3} style={{ width:"100%", padding:"10px 14px", borderRadius:8, border:`1px solid ${t.border}`, background:t.inputBg, color:t.textPri, fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", resize:"vertical" }} onFocus={e=>(e.target.style.borderColor=t.accent)} onBlur={e=>(e.target.style.borderColor=t.border)}/>
              </Field>
            </div>

            <button onClick={()=>setSubmitted(true)} style={{ width:"100%", padding:"13px 0", borderRadius:10, border:"none", background:t.accent, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
              Submit Swap Request
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}