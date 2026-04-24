"use client";
// src/app/buy/checkout/page.tsx

import { useTheme } from "@/src/context/ThemeContext";
import { useState } from "react";
import { useRouter } from "next/navigation";

import AppShell from "@/src/components/layout/Appshell";
import PageHeader from "@/src/components/layout/PageHeader";

const CAR = { name:"Mercedes C-Class", spec:"C300 AMG Line · 2023 · 4MATIC", price:38500, km:12000, image:"https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80", features:["Full Service History","12 Month Warranty","Free Delivery in Accra","Finance Available"] };

function Field({ label, t, children }: any) {
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:"block", fontSize:11, fontWeight:600, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:7 }}>{label}</label>
      {children}
    </div>
  );
}
function SI({ value, onChange, t, placeholder, type="text" }: any) {
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{ width:"100%", padding:"10px 14px", borderRadius:8, border:`1px solid ${t.border}`, background:t.inputBg, color:t.textPri, fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif" }} onFocus={e=>(e.target.style.borderColor=t.accent)} onBlur={e=>(e.target.style.borderColor=t.border)}/>;
}

const PMIcon = ({ id, color }: { id: string; color: string }) => {
  if (id === "mobile")  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>;
  if (id === "card")    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
  if (id === "bank")    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>;
  return                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
};
const PAYMENT_METHODS = [
  { id:"mobile",  label:"Mobile Money",   desc:"MTN, Vodafone, AirtelTigo" },
  { id:"card",    label:"Credit / Debit", desc:"Visa, Mastercard, Amex" },
  { id:"bank",    label:"Bank Transfer",  desc:"Direct bank transfer" },
  { id:"finance", label:"Financing",      desc:"0% interest for 12 months" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { dark, setDark, t } = useTheme();
  const [step, setStep] = useState(1);
  const [payMethod, setPayMethod] = useState("card");
  const [form, setForm] = useState({ firstName:"", lastName:"", email:"", phone:"", address:"", city:"", cardNum:"", cardExp:"", cardCvc:"", momo:"" });
  const [done, setDone] = useState(false);
  const set = (k:string,v:string)=>setForm(p=>({...p,[k]:v}));

  const tax = Math.round(CAR.price * 0.12);
  const total = CAR.price + tax;

  if (done) return (
    <AppShell active="For Sale" dark={dark} setDark={setDark} t={t}>
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", background:t.bg }}>
        <div style={{ textAlign:"center", background:t.cardBg, borderRadius:20, border:`1px solid ${t.border}`, padding:"52px 44px", maxWidth:420 }}>
          <div style={{ width:68, height:68, borderRadius:"50%", background:"rgba(16,185,129,0.15)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 22px" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          <div style={{ fontSize:24, fontWeight:800, color:t.textPri, marginBottom:8 }}>Purchase Complete!</div>
          <div style={{ fontSize:13, color:t.textMuted, lineHeight:1.7, marginBottom:10 }}>Congratulations on your new <strong style={{ color:t.textPri }}>{CAR.name}</strong>!</div>
          <div style={{ background:t.tagBg, borderRadius:10, padding:"12px 16px", marginBottom:28, border:`1px solid ${t.tagBorder}` }}>
            <div style={{ fontSize:11, color:t.textMuted, marginBottom:4 }}>Transaction Reference</div>
            <div style={{ fontSize:18, fontWeight:800, color:t.textPri, letterSpacing:2 }}>EDM-SL-{Math.floor(Math.random()*90000+10000)}</div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={()=>router.push("/buy")} style={{ flex:1, border:`1px solid ${t.border}`, background:t.bg, color:t.textSec, borderRadius:10, padding:"11px 0", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Browse More</button>
            <button onClick={()=>router.push("/customer/purchases")} style={{ flex:1, background:t.accent, color:t.accentFg, borderRadius:10, padding:"11px 0", fontSize:13, fontWeight:700, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>My Purchases</button>
          </div>
        </div>
      </div>
    </AppShell>
  );

  return (
    <AppShell active="For Sale" dark={dark} setDark={setDark} t={t}>
      <PageHeader title="Checkout" subtitle={CAR.name} dark={dark} setDark={setDark} t={t} />
      <div style={{ flex:1, overflowY:"auto", background:t.bg }}>
        <div style={{ maxWidth:1060, margin:"0 auto", padding:"28px 28px", display:"grid", gridTemplateColumns:"1fr 340px", gap:24 }}>

          {/* ── LEFT ── */}
          <div>
            {/* Step indicator */}
            <div style={{ display:"flex", gap:8, marginBottom:28 }}>
              {["Details","Payment","Review"].map((s,i)=>(
                <div key={s} style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:26, height:26, borderRadius:"50%", background:step>i+1?"#10B981":step===i+1?t.accent:t.toggleOff, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:step>=i+1?"#fff":t.textMuted, transition:"background 0.2s" }}>
                    {step>i+1
                      ? <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 6 5 9 10 3"/></svg>
                      : i+1}
                  </div>
                  <span style={{ fontSize:12, fontWeight:step===i+1?700:400, color:step===i+1?t.textPri:t.textMuted }}>{s}</span>
                  {i<2&&<div style={{ width:28, height:1, background:t.border }}/>}
                </div>
              ))}
            </div>

            {/* Step 1: Personal details */}
            {step===1 && (
              <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"22px 24px" }}>
                <div style={{ fontSize:14, fontWeight:700, color:t.textPri, marginBottom:18 }}>Personal Information</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
                  <Field label="First Name" t={t}><SI value={form.firstName} onChange={(e:any)=>set("firstName",e.target.value)} t={t} placeholder="John"/></Field>
                  <Field label="Last Name"  t={t}><SI value={form.lastName}  onChange={(e:any)=>set("lastName",e.target.value)}  t={t} placeholder="Mensah"/></Field>
                </div>
                <Field label="Email" t={t}><SI type="email" value={form.email} onChange={(e:any)=>set("email",e.target.value)} t={t} placeholder="you@email.com"/></Field>
                <Field label="Phone" t={t}><SI value={form.phone} onChange={(e:any)=>set("phone",e.target.value)} t={t} placeholder="+233 XX XXX XXXX"/></Field>
                <Field label="Delivery Address" t={t}><SI value={form.address} onChange={(e:any)=>set("address",e.target.value)} t={t} placeholder="Street address"/></Field>
                <Field label="City" t={t}><SI value={form.city} onChange={(e:any)=>set("city",e.target.value)} t={t} placeholder="e.g. Accra"/></Field>
                <button onClick={()=>setStep(2)} style={{ width:"100%", padding:"12px 0", borderRadius:10, border:"none", background:t.accent, color:t.accentFg, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", marginTop:6 }}>Continue to Payment</button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step===2 && (
              <div>
                <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"22px 24px", marginBottom:16 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:t.textPri, marginBottom:18 }}>Payment Method</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
                    {PAYMENT_METHODS.map(pm=>(
                      <div key={pm.id} onClick={()=>setPayMethod(pm.id)} style={{ background:payMethod===pm.id?(dark?"#1E1E38":"#F0F0F8"):t.bg, border:`1.5px solid ${payMethod===pm.id?t.accent:t.border}`, borderRadius:10, padding:"12px 14px", cursor:"pointer", transition:"all 0.15s", display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ display:"flex", flexShrink:0 }}><PMIcon id={pm.id} color={payMethod===pm.id?t.accent:t.textMuted}/></span>
                        <div>
                          <div style={{ fontSize:12, fontWeight:700, color:t.textPri }}>{pm.label}</div>
                          <div style={{ fontSize:11, color:t.textMuted }}>{pm.desc}</div>
                        </div>
                        <div style={{ marginLeft:"auto", width:16, height:16, borderRadius:"50%", border:`2px solid ${payMethod===pm.id?t.accent:t.checkBorder}`, background:payMethod===pm.id?t.accent:"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          {payMethod===pm.id&&<div style={{ width:6, height:6, borderRadius:"50%", background:"#fff" }}/>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {payMethod==="card" && (
                    <>
                      <Field label="Card Number" t={t}><SI value={form.cardNum} onChange={(e:any)=>set("cardNum",e.target.value)} t={t} placeholder="1234 5678 9012 3456"/></Field>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
                        <Field label="Expiry" t={t}><SI value={form.cardExp} onChange={(e:any)=>set("cardExp",e.target.value)} t={t} placeholder="MM / YY"/></Field>
                        <Field label="CVC" t={t}><SI value={form.cardCvc} onChange={(e:any)=>set("cardCvc",e.target.value)} t={t} placeholder="123"/></Field>
                      </div>
                    </>
                  )}
                  {payMethod==="mobile" && (
                    <Field label="Mobile Money Number" t={t}><SI value={form.momo} onChange={(e:any)=>set("momo",e.target.value)} t={t} placeholder="+233 XX XXX XXXX"/></Field>
                  )}
                  {(payMethod==="bank"||payMethod==="finance") && (
                    <div style={{ background:t.tagBg, borderRadius:10, padding:"14px", border:`1px solid ${t.tagBorder}`, fontSize:12, color:t.textSec, lineHeight:1.7 }}>
                      {payMethod==="bank" ? "Bank details will be provided after order confirmation. Transfer must be completed within 48 hours." : "Our finance team will contact you within 24 hours to set up your 0% interest payment plan."}
                    </div>
                  )}
                </div>
                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={()=>setStep(1)} style={{ flex:1, padding:"12px 0", borderRadius:10, border:`1px solid ${t.border}`, background:t.cardBg, color:t.textSec, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Back</button>
                  <button onClick={()=>setStep(3)} style={{ flex:2, padding:"12px 0", borderRadius:10, border:"none", background:t.accent, color:t.accentFg, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Review Order</button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step===3 && (
              <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"22px 24px" }}>
                <div style={{ fontSize:14, fontWeight:700, color:t.textPri, marginBottom:18 }}>Order Review</div>
                <img src={CAR.image} alt={CAR.name} style={{ width:"100%", height:170, objectFit:"cover", borderRadius:10, marginBottom:16, display:"block" }}/>
                {[["Vehicle",CAR.name],["Spec",CAR.spec],["Mileage",`${CAR.km.toLocaleString()} km`],["Buyer",`${form.firstName} ${form.lastName}`],["Email",form.email],["Phone",form.phone],["Delivery",`${form.address}, ${form.city}`],["Payment",PAYMENT_METHODS.find(p=>p.id===payMethod)?.label||""]].map(([k,v])=>(
                  <div key={k as string} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${t.divider}` }}>
                    <span style={{ fontSize:12, color:t.textMuted }}>{k}</span>
                    <span style={{ fontSize:12, fontWeight:600, color:t.textPri }}>{v}</span>
                  </div>
                ))}
                <div style={{ display:"flex", gap:10, marginTop:20 }}>
                  <button onClick={()=>setStep(2)} style={{ flex:1, padding:"12px 0", borderRadius:10, border:`1px solid ${t.border}`, background:t.cardBg, color:t.textSec, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Back</button>
                  <button onClick={()=>setDone(true)} style={{ flex:2, padding:"12px 0", borderRadius:10, border:"none", background:t.accent, color:t.accentFg, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Confirm Purchase</button>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: order summary ── */}
          <div style={{ position:"sticky", top:24, alignSelf:"start" }}>
            <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, overflow:"hidden" }}>
              <img src={CAR.image} alt={CAR.name} style={{ width:"100%", height:140, objectFit:"cover", display:"block" }}/>
              <div style={{ padding:"18px 20px" }}>
                <div style={{ fontSize:15, fontWeight:700, color:t.textPri, marginBottom:2 }}>{CAR.name}</div>
                <div style={{ fontSize:12, color:t.textMuted, marginBottom:14 }}>{CAR.spec}</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:16 }}>
                  {CAR.features.map(f=>(
                    <span key={f} style={{ fontSize:10, background:t.tagBg, color:t.tagText, borderRadius:5, padding:"3px 8px", border:`1px solid ${t.tagBorder}`, display:"flex", alignItems:"center", gap:4 }}>
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1.5 5 4 7.5 8.5 2"/></svg>
                      {f}
                    </span>
                  ))}
                </div>
                <div style={{ height:1, background:t.divider, marginBottom:14 }}/>
                {[["Vehicle Price",`$${CAR.price.toLocaleString()}`],["Tax (12%)",`$${tax.toLocaleString()}`]].map(([k,v])=>(
                  <div key={k as string} style={{ display:"flex", justifyContent:"space-between", marginBottom:10, fontSize:13, color:t.textSec }}>
                    <span>{k}</span><span style={{ color:t.textPri, fontWeight:600 }}>{v}</span>
                  </div>
                ))}
                <div style={{ height:1, background:t.divider, margin:"12px 0" }}/>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:17, fontWeight:800, color:t.textPri }}>
                  <span>Total</span><span>${total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}