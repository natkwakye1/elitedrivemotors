"use client";
// src/app/rentals/booking/page.tsx

import { useTheme } from "@/src/context/ThemeContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import AppShell from "@/src/components/layout/Appshell";
import TopBar from "@/src/components/layout/Topbar";
import { Ic } from "@/src/components/ui/Icons";

// ─── Data ─────────────────────────────────────────────────────────────────────
const CAR = {
  name:     "Audi A4",
  spec:     "2.0 TFSI Sport · Automatic · Quattro AWD",
  price:    24.59,
  plate:    "GR-4421-22",
  year:     2023,
  fuel:     "Petrol",
  seats:    5,
  image:    "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&q=80",
  features: ["GPS Navigation", "Bluetooth", "Heated Seats", "360° Camera"],
};

const ADDONS = [
  { id:"gps",       label:"GPS Navigator",    price:3.00,  icon:(c:string)=>Ic.Map(c)      },
  { id:"insurance", label:"Full Insurance",   price:8.50,  icon:(c:string)=>Ic.License(c)  },
  { id:"child",     label:"Child Seat",       price:2.50,  icon:(c:string)=>Ic.Favs(c)     },
  { id:"driver",    label:"Chauffeur Driver", price:15.00, icon:(c:string)=>Ic.Profile(c)  },
];

// ─── Shared Field wrapper ─────────────────────────────────────────────────────
function Field({ label, t, children }: { label:string; t:any; children:React.ReactNode }) {
  return (
    <div style={{ marginBottom:18 }}>
      <label style={{ display:"block", fontSize:11, fontWeight:600, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:7 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepBar({ step, t }: { step:number; t:any }) {
  const steps = ["Vehicle & Add-ons", "Schedule", "Your Details"];
  return (
    <div style={{ display:"flex", alignItems:"center", marginBottom:28 }}>
      {steps.map((s, i) => {
        const done   = step > i + 1;
        const active = step === i + 1;
        return (
          <div key={s} style={{ display:"flex", alignItems:"center", flex: i < steps.length - 1 ? 1 : 0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
              <div style={{
                width:28, height:28, borderRadius:"50%",
                display:"flex", alignItems:"center", justifyContent:"center",
                background: done ? "#10B981" : active ? t.accent : t.bg,
                border:`2px solid ${done ? "#10B981" : active ? t.accent : t.border}`,
                transition:"all 0.2s",
              }}>
                {done
                  ? <span style={{ display:"flex" }}>{Ic.Check()}</span>
                  : <span style={{ fontSize:11, fontWeight:700, color: active ? "#fff" : t.textMuted }}>{i+1}</span>
                }
              </div>
              <span style={{ fontSize:12, fontWeight: active ? 700 : 400, color: active ? t.textPri : t.textMuted, whiteSpace:"nowrap" }}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex:1, height:1, background: done ? "#10B981" : t.border, margin:"0 12px", transition:"background 0.2s" }}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BookingPage() {
  const router = useRouter();
  const { dark, setDark, t } = useTheme();
  const [step, setStep]         = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [addons, setAddons]     = useState<string[]>([]);
  const [form, setForm]         = useState({
    pickupDate:"", pickupTime:"09:00",
    returnDate:"", returnTime:"18:00",
    pickupLocation:"", fullName:"", phone:"", email:"",
  });

  const set = (k:string, v:string) => setForm(p => ({ ...p, [k]:v }));

  const toggleAddon = (id:string) =>
    setAddons(prev => prev.includes(id) ? prev.filter(a=>a!==id) : [...prev, id]);

  const hours = (() => {
    if (!form.pickupDate || !form.returnDate) return 0;
    const d1 = new Date(`${form.pickupDate}T${form.pickupTime}`);
    const d2 = new Date(`${form.returnDate}T${form.returnTime}`);
    return Math.max(0, (d2.getTime() - d1.getTime()) / 3600000);
  })();

  const addonTotal = addons.reduce((sum, id) => {
    const a = ADDONS.find(x=>x.id===id);
    return sum + (a ? a.price * Math.max(1, hours) : 0);
  }, 0);
  const baseTotal  = CAR.price * Math.max(1, hours);
  const grandTotal = baseTotal + addonTotal;

  // ── Confirmation screen ──────────────────────────────────────────────────
  if (submitted) {
    const ref = `EDM-${Math.floor(Math.random() * 90000 + 10000)}`;
    return (
      <AppShell active="Book a Rental" dark={dark} setDark={setDark} t={t}>
        <TopBar title="Booking Confirmed" dark={dark} setDark={setDark} t={t}/>
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", background:t.bg, padding:40 }}>
          <div style={{ background:t.cardBg, borderRadius:16, border:`1px solid ${t.border}`, padding:"44px 40px", maxWidth:420, width:"100%", textAlign:"center" }}>

            <div style={{ width:60, height:60, borderRadius:"50%", background:"rgba(16,185,129,0.12)", border:"2px solid rgba(16,185,129,0.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
              <span style={{ display:"flex", color:"#10B981", transform:"scale(1.4)" }}>{Ic.Check()}</span>
            </div>

            <div style={{ fontSize:22, fontWeight:800, color:t.textPri, marginBottom:8 }}>Booking Confirmed</div>
            <div style={{ fontSize:13, color:t.textMuted, lineHeight:1.7, marginBottom:28 }}>
              Your <strong style={{ color:t.textPri }}>{CAR.name}</strong> has been booked. A confirmation has been sent to <strong style={{ color:t.textPri }}>{form.email || "your email"}</strong>.
            </div>

            {/* car image on confirmation */}
            <div style={{ position:"relative", height:120, margin:"0 0 20px", borderRadius:12, overflow:"hidden", background: t.tagBg, border:`1px solid ${t.border}` }}>
              <Image src={CAR.image} alt={CAR.name} fill style={{ objectFit:"cover" }}/>
            </div>

            <div style={{ background:t.bg, borderRadius:12, border:`1px solid ${t.border}`, padding:"16px 20px", marginBottom:28 }}>
              <div style={{ fontSize:10, fontWeight:600, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Booking Reference</div>
              <div style={{ fontSize:22, fontWeight:800, color:t.textPri, letterSpacing:3 }}>{ref}</div>
            </div>

            <div style={{ display:"flex", gap:10, justifyContent:"center", marginBottom:28, flexWrap:"wrap" }}>
              {[
                { icon:(c:string)=>Ic.Vehicles(c), label:CAR.name              },
                { icon:(c:string)=>Ic.Booking(c),  label:form.pickupDate||"—"  },
                { icon:(c:string)=>Ic.Payment(c),  label:`$${grandTotal.toFixed(2)}` },
              ].map(p => (
                <span key={p.label} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:t.textSec, background:t.bg, border:`1px solid ${t.border}`, borderRadius:20, padding:"5px 12px" }}>
                  <span style={{ display:"flex", opacity:0.5 }}>{p.icon(t.textMuted)}</span>
                  {p.label}
                </span>
              ))}
            </div>

            <button onClick={()=>router.push("/rentals")} style={{ width:"100%", padding:"12px 0", borderRadius:10, border:"none", background:t.accent, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
              Back to Rentals
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  // ── Main form ────────────────────────────────────────────────────────────
  return (
    <AppShell active="Book a Rental" dark={dark} setDark={setDark} t={t}>
      <TopBar title="Book a Rental" subtitle={CAR.name} dark={dark} setDark={setDark} t={t}/>

      <div style={{ flex:1, overflowY:"auto", background:t.bg }}>
        <div style={{ maxWidth:1060, margin:"0 auto", padding:"28px 28px 48px", display:"grid", gridTemplateColumns:"1fr 320px", gap:24, alignItems:"start" }}>

          {/* ══════════ LEFT: steps ══════════ */}
          <div>
            <StepBar step={step} t={t}/>

            {/* ── STEP 1: Vehicle & Add-ons ── */}
            {step === 1 && (
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

                {/* car card with real image */}
                <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"20px 22px" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:t.textPri, marginBottom:14 }}>Selected Vehicle</div>
                  <div style={{ display:"flex", alignItems:"center", gap:18 }}>

                    {/* ── car image ── */}
                    <div style={{ width:130, height:80, borderRadius:10, overflow:"hidden", border:`1px solid ${t.border}`, flexShrink:0, position:"relative", background: t.tagBg }}>
                      <Image
                        src={CAR.image}
                        alt={CAR.name}
                        fill
                        style={{ objectFit:"cover" }}
                        priority
                      />
                    </div>

                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:16, fontWeight:800, color:t.textPri, marginBottom:3 }}>{CAR.name}</div>
                      <div style={{ fontSize:12, color:t.textMuted, marginBottom:10 }}>{CAR.spec}</div>
                      <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                        {CAR.features.map(f => (
                          <span key={f} style={{ fontSize:10, fontWeight:600, color:t.textSec, background:t.bg, border:`1px solid ${t.border}`, borderRadius:6, padding:"3px 9px" }}>{f}</span>
                        ))}
                      </div>
                    </div>

                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontSize:22, fontWeight:800, color:t.textPri }}>${CAR.price}</div>
                      <div style={{ fontSize:11, color:t.textMuted }}>per hour</div>
                    </div>
                  </div>

                  {/* quick specs */}
                  <div style={{ display:"flex", gap:20, marginTop:16, paddingTop:14, borderTop:`1px solid ${t.divider}` }}>
                    {[
                      { icon:(c:string)=>Ic.License(c), val:CAR.plate          },
                      { icon:(c:string)=>Ic.History(c),  val:CAR.year           },
                      { icon:(c:string)=>Ic.Monitor(c),  val:CAR.fuel           },
                      { icon:(c:string)=>Ic.Profile(c),  val:`${CAR.seats} seats` },
                    ].map((s,i) => (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ display:"flex", opacity:0.45 }}>{s.icon(t.textMuted)}</span>
                        <span style={{ fontSize:12, color:t.textSec }}>{s.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* add-ons */}
                <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"20px 22px" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:t.textPri, marginBottom:4 }}>Optional Add-ons</div>
                  <div style={{ fontSize:12, color:t.textMuted, marginBottom:16 }}>Select any extras to add to your booking</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    {ADDONS.map(a => {
                      const on = addons.includes(a.id);
                      return (
                        <div key={a.id} onClick={()=>toggleAddon(a.id)}
                          style={{ background: on?(dark?"#1a1a2e":"#f5f5fc"):t.bg, border:`1.5px solid ${on?t.accent:t.border}`, borderRadius:10, padding:"14px 16px", cursor:"pointer", transition:"all 0.15s", display:"flex", alignItems:"center", gap:12 }}
                          onMouseEnter={e=>{ if(!on)(e.currentTarget as HTMLDivElement).style.borderColor=t.accent; }}
                          onMouseLeave={e=>{ if(!on)(e.currentTarget as HTMLDivElement).style.borderColor=t.border; }}
                        >
                          <div style={{ width:36, height:36, borderRadius:9, background: on?t.accent+"22":t.cardBg, border:`1px solid ${on?t.accent+"40":t.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            <span style={{ display:"flex" }}>{a.icon(on?t.accent:t.textMuted)}</span>
                          </div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:13, fontWeight:600, color:t.textPri }}>{a.label}</div>
                            <div style={{ fontSize:11, color:t.textMuted }}>${a.price.toFixed(2)} / hr</div>
                          </div>
                          <div style={{ width:18, height:18, borderRadius:"50%", border:`2px solid ${on?t.accent:t.border}`, background:on?t.accent:"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s" }}>
                            {on && <div style={{ width:6, height:6, borderRadius:"50%", background:"#fff" }}/>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button onClick={()=>setStep(2)} style={{ width:"100%", padding:"13px 0", borderRadius:10, border:"none", background:t.accent, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  Continue to Schedule <span style={{ display:"flex" }}>{Ic.ArrowRight("#fff")}</span>
                </button>
              </div>
            )}

            {/* ── STEP 2: Schedule ── */}
            {step === 2 && (
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"22px 24px" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:t.textPri, marginBottom:18 }}>Pickup & Return</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                    <Field label="Pickup Date" t={t}>
                      <input type="date" value={form.pickupDate} onChange={e=>set("pickupDate",e.target.value)} style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:`1.5px solid ${t.border}`, background:t.inputBg, color:t.textPri, fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box" }} onFocus={e=>(e.target.style.borderColor=t.accent)} onBlur={e=>(e.target.style.borderColor=t.border)}/>
                    </Field>
                    <Field label="Pickup Time" t={t}>
                      <input type="time" value={form.pickupTime} onChange={e=>set("pickupTime",e.target.value)} style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:`1.5px solid ${t.border}`, background:t.inputBg, color:t.textPri, fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box" }} onFocus={e=>(e.target.style.borderColor=t.accent)} onBlur={e=>(e.target.style.borderColor=t.border)}/>
                    </Field>
                    <Field label="Return Date" t={t}>
                      <input type="date" value={form.returnDate} onChange={e=>set("returnDate",e.target.value)} style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:`1.5px solid ${t.border}`, background:t.inputBg, color:t.textPri, fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box" }} onFocus={e=>(e.target.style.borderColor=t.accent)} onBlur={e=>(e.target.style.borderColor=t.border)}/>
                    </Field>
                    <Field label="Return Time" t={t}>
                      <input type="time" value={form.returnTime} onChange={e=>set("returnTime",e.target.value)} style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:`1.5px solid ${t.border}`, background:t.inputBg, color:t.textPri, fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box" }} onFocus={e=>(e.target.style.borderColor=t.accent)} onBlur={e=>(e.target.style.borderColor=t.border)}/>
                    </Field>
                  </div>

                  <Field label="Pickup Location" t={t}>
                    <div style={{ position:"relative" }}>
                      <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", display:"flex", opacity:0.4 }}>{Ic.Pin(t.textMuted)}</span>
                      <input value={form.pickupLocation} onChange={e=>set("pickupLocation",e.target.value)} placeholder="Enter address or landmark…"
                        style={{ width:"100%", padding:"10px 14px 10px 34px", borderRadius:10, border:`1.5px solid ${t.border}`, background:t.inputBg, color:t.textPri, fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box" }}
                        onFocus={e=>(e.target.style.borderColor=t.accent)} onBlur={e=>(e.target.style.borderColor=t.border)}
                      />
                    </div>
                  </Field>

                  {hours > 0 && (
                    <div style={{ display:"flex", alignItems:"center", gap:10, background:t.bg, border:`1px solid ${t.border}`, borderRadius:10, padding:"12px 16px" }}>
                      <span style={{ display:"flex", opacity:0.5 }}>{Ic.History(t.textMuted)}</span>
                      <span style={{ fontSize:12, color:t.textSec }}>Duration:</span>
                      <span style={{ fontSize:12, fontWeight:700, color:t.textPri }}>{hours.toFixed(1)} hours</span>
                      <span style={{ marginLeft:"auto", fontSize:13, fontWeight:800, color:t.textPri }}>${grandTotal.toFixed(2)} est.</span>
                    </div>
                  )}
                </div>

                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={()=>setStep(1)} style={{ flex:1, padding:"12px 0", borderRadius:10, border:`1px solid ${t.border}`, background:t.cardBg, color:t.textSec, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Back</button>
                  <button onClick={()=>setStep(3)} style={{ flex:2, padding:"13px 0", borderRadius:10, border:"none", background:t.accent, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                    Continue to Details <span style={{ display:"flex" }}>{Ic.ArrowRight("#fff")}</span>
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Details ── */}
            {step === 3 && (
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"22px 24px" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:t.textPri, marginBottom:18 }}>Your Details</div>
                  {[
                    { key:"fullName", label:"Full Name",     icon:(c:string)=>Ic.Profile(c), placeholder:"John Mensah",     type:"text"  },
                    { key:"phone",    label:"Phone Number",  icon:(c:string)=>Ic.Support(c), placeholder:"+233 XX XXX XXXX",type:"tel"   },
                    { key:"email",    label:"Email Address", icon:(c:string)=>Ic.Contact(c), placeholder:"you@email.com",   type:"email" },
                  ].map(f => (
                    <Field key={f.key} label={f.label} t={t}>
                      <div style={{ position:"relative" }}>
                        <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", display:"flex", opacity:0.4 }}>{f.icon(t.textMuted)}</span>
                        <input type={f.type} value={(form as any)[f.key]} onChange={e=>set(f.key,e.target.value)} placeholder={f.placeholder}
                          style={{ width:"100%", padding:"10px 14px 10px 34px", borderRadius:10, border:`1.5px solid ${t.border}`, background:t.inputBg, color:t.textPri, fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box", transition:"border-color 0.15s" }}
                          onFocus={e=>(e.target.style.borderColor=t.accent)} onBlur={e=>(e.target.style.borderColor=t.border)}
                        />
                      </div>
                    </Field>
                  ))}
                </div>

                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={()=>setStep(2)} style={{ flex:1, padding:"12px 0", borderRadius:10, border:`1px solid ${t.border}`, background:t.cardBg, color:t.textSec, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Back</button>
                  <button onClick={()=>setSubmitted(true)} style={{ flex:2, padding:"13px 0", borderRadius:10, border:"none", background:t.accent, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                    <span style={{ display:"flex" }}>{Ic.Check()}</span> Confirm Booking
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ══════════ RIGHT: price summary ══════════ */}
          <div style={{ position:"sticky", top:24 }}>

            {/* car image preview in sidebar */}
            <div style={{ position:"relative", height:140, borderRadius:14, overflow:"hidden", border:`1px solid ${t.border}`, background: t.tagBg, marginBottom:14 }}>
              <Image
                src={CAR.image}
                alt={CAR.name}
                fill
                style={{ objectFit:"cover" }}
              />
              <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"10px 14px", background:"linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)" }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{CAR.name}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)" }}>{CAR.plate}</div>
              </div>
            </div>

            {/* price breakdown */}
            <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"20px 22px" }}>
              <div style={{ fontSize:13, fontWeight:700, color:t.textPri, marginBottom:16 }}>Price Summary</div>

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <span style={{ fontSize:12, color:t.textSec }}>${CAR.price}/hr × {hours > 0 ? hours.toFixed(1)+" hrs" : "—"}</span>
                <span style={{ fontSize:13, fontWeight:600, color:t.textPri }}>${baseTotal.toFixed(2)}</span>
              </div>

              {addons.map(id => {
                const a = ADDONS.find(x=>x.id===id)!;
                return (
                  <div key={id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ display:"flex", opacity:0.45 }}>{a.icon(t.textMuted)}</span>
                      <span style={{ fontSize:12, color:t.textSec }}>{a.label}</span>
                    </div>
                    <span style={{ fontSize:13, fontWeight:600, color:t.textPri }}>${(a.price * Math.max(1,hours)).toFixed(2)}</span>
                  </div>
                );
              })}

              <div style={{ height:1, background:t.divider, margin:"14px 0" }}/>

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:14, fontWeight:700, color:t.textPri }}>Total</span>
                <span style={{ fontSize:20, fontWeight:800, color:t.textPri }}>${grandTotal.toFixed(2)}</span>
              </div>

              {hours > 0 && (
                <div style={{ marginTop:12, padding:"10px 12px", background:t.bg, borderRadius:8, border:`1px solid ${t.border}`, fontSize:11, color:t.textMuted, lineHeight:1.6 }}>
                  {hours.toFixed(1)} hrs · {form.pickupDate||"—"} {form.pickupTime} → {form.returnDate||"—"} {form.returnTime}
                </div>
              )}
            </div>

            {/* selected add-ons */}
            {addons.length > 0 && (
              <div style={{ marginTop:14, background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"16px 18px" }}>
                <div style={{ fontSize:12, fontWeight:700, color:t.textPri, marginBottom:10 }}>Selected Add-ons</div>
                {addons.map(id => {
                  const a = ADDONS.find(x=>x.id===id)!;
                  return (
                    <div key={id} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 0", borderBottom:`1px solid ${t.divider}` }}>
                      <span style={{ display:"flex", opacity:0.5 }}>{a.icon(t.textMuted)}</span>
                      <span style={{ fontSize:12, color:t.textSec, flex:1 }}>{a.label}</span>
                      <button onClick={()=>toggleAddon(id)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:11, color:"#EF4444", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>Remove</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </AppShell>
  );
}