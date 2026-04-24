"use client";
// src/app/dashboard/super-admin/settings/page.tsx
import { useTheme } from "@/src/context/ThemeContext";
import { useState } from "react";
import { useRouter } from "next/navigation";

import AppShell from "@/src/components/layout/Appshell";
import PageHeader from "@/src/components/layout/PageHeader";

function Toggle({ on, change, t }: { on: boolean; change: (v: boolean) => void; t: any }) {
  return (
    <div onClick={() => change(!on)} style={{ width:44, height:24, borderRadius:12, cursor:"pointer", background:on?t.accent:t.toggleOff, position:"relative", transition:"background 0.2s", flexShrink:0 }}>
      <div style={{ position:"absolute", top:3, left:on?22:3, width:18, height:18, borderRadius:"50%", background:"#fff", transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.3)" }}/>
    </div>
  );
}

function Field({ label, t, children }: { label: string; t: any; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom:20 }}>
      <label style={{ display:"block", fontSize:11, fontWeight:600, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:7 }}>{label}</label>
      {children}
    </div>
  );
}

function SInput({ value, onChange, t, placeholder }: any) {
  return <input value={value} onChange={onChange} placeholder={placeholder} style={{ width:"100%", padding:"10px 14px", borderRadius:8, border:`1px solid ${t.border}`, background:t.inputBg, color:t.textPri, fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif" }} />;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { dark, setDark, t } = useTheme();
  const [tab, setTab] = useState("General");
  const [saved, setSaved] = useState(false);

  const [general, setGeneral] = useState({ bizName:"EliteDriveMotors", email:"admin@elitedrive.com", phone:"+233 20 000 0000", address:"Accra, Ghana", currency:"GHS", timezone:"Africa/Accra" });
  const [notifs, setNotifs] = useState({ newBooking:true, paymentReceived:true, swapRequest:true, userRegistered:false, lowFleet:true, systemAlerts:true });
  const [pricing, setPricing] = useState({ taxRate:"12", depositPct:"20", lateFeeHr:"5", minRental:"2" });

  const TABS = ["General","Notifications","Pricing","Security","Plan"];

  const save = () => { setSaved(true); setTimeout(() => router.back(), 1200); };

  return (
    <AppShell active="Settings" dark={dark} setDark={setDark} t={t}>
      <PageHeader title="Settings" subtitle="Platform configuration and preferences" breadcrumb={["dashboard", "super-admin", "Settings"]} dark={dark} setDark={setDark} t={t}
        actions={
          <button onClick={save} disabled={saved} style={{ padding:"7px 18px", borderRadius:8, border:"none", background:saved?"#10B981":t.accent, color:saved?"#fff":t.accentFg, fontSize:12, fontWeight:600, cursor:saved?"default":"pointer", fontFamily:"'DM Sans',sans-serif", transition:"background 0.3s" }}>
            {saved ? "Changes Saved" : "Save Changes"}
          </button>
        }
      />
      <div style={{ flex:1, overflowY:"auto", padding:"24px 28px", background:t.bg }}>
        {/* Tab bar */}
        <div style={{ display:"flex", gap:4, marginBottom:24, background:t.cardBg, borderRadius:10, padding:4, border:`1px solid ${t.border}`, width:"fit-content" }}>
          {TABS.map(tb=>(
            <button key={tb} onClick={()=>setTab(tb)} style={{ padding:"7px 18px", borderRadius:7, border:"none", background:tab===tb?t.accent:"transparent", color:tab===tb?t.accentFg:t.textSec, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s" }}>{tb}</button>
          ))}
        </div>

        <div style={{ maxWidth:680 }}>
          {/* General */}
          {tab==="General" && (
            <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"24px" }}>
              <div style={{ fontSize:14, fontWeight:700, color:t.textPri, marginBottom:20 }}>Business Information</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
                <Field label="Business Name" t={t}><SInput value={general.bizName} onChange={(e:any)=>setGeneral(p=>({...p,bizName:e.target.value}))} t={t}/></Field>
                <Field label="Email Address" t={t}><SInput value={general.email} onChange={(e:any)=>setGeneral(p=>({...p,email:e.target.value}))} t={t}/></Field>
                <Field label="Phone" t={t}><SInput value={general.phone} onChange={(e:any)=>setGeneral(p=>({...p,phone:e.target.value}))} t={t}/></Field>
                <Field label="Currency" t={t}>
                  <select value={general.currency} onChange={e=>setGeneral(p=>({...p,currency:e.target.value}))} style={{ width:"100%", padding:"10px 14px", borderRadius:8, border:`1px solid ${t.border}`, background:t.inputBg, color:t.textPri, fontSize:13, fontFamily:"'DM Sans',sans-serif" }}>
                    <option>GHS</option><option>USD</option><option>EUR</option><option>GBP</option>
                  </select>
                </Field>
              </div>
              <Field label="Business Address" t={t}><SInput value={general.address} onChange={(e:any)=>setGeneral(p=>({...p,address:e.target.value}))} t={t}/></Field>
              <Field label="Timezone" t={t}>
                <select value={general.timezone} onChange={e=>setGeneral(p=>({...p,timezone:e.target.value}))} style={{ width:"100%", padding:"10px 14px", borderRadius:8, border:`1px solid ${t.border}`, background:t.inputBg, color:t.textPri, fontSize:13, fontFamily:"'DM Sans',sans-serif" }}>
                  <option>Africa/Accra</option><option>UTC</option><option>Europe/London</option><option>America/New_York</option>
                </select>
              </Field>
            </div>
          )}

          {/* Notifications */}
          {tab==="Notifications" && (
            <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"24px" }}>
              <div style={{ fontSize:14, fontWeight:700, color:t.textPri, marginBottom:20 }}>Email & Push Notifications</div>
              {[
                { key:"newBooking",       label:"New Booking",        desc:"Alert when a customer completes a booking" },
                { key:"paymentReceived",  label:"Payment Received",   desc:"Notify when a payment is confirmed" },
                { key:"swapRequest",      label:"Swap Request",       desc:"Alert when a swap request is submitted" },
                { key:"userRegistered",   label:"User Registered",    desc:"Notify when a new user signs up" },
                { key:"lowFleet",         label:"Low Fleet Warning",  desc:"Alert when fewer than 5 cars are available" },
                { key:"systemAlerts",     label:"System Alerts",      desc:"Critical system events and errors" },
              ].map(n=>(
                <div key={n.key} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 0", borderBottom:`1px solid ${t.divider}` }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:t.textPri, marginBottom:2 }}>{n.label}</div>
                    <div style={{ fontSize:11, color:t.textMuted }}>{n.desc}</div>
                  </div>
                  <Toggle on={notifs[n.key as keyof typeof notifs]} change={v=>setNotifs(p=>({...p,[n.key]:v}))} t={t}/>
                </div>
              ))}
            </div>
          )}

          {/* Pricing */}
          {tab==="Pricing" && (
            <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"24px" }}>
              <div style={{ fontSize:14, fontWeight:700, color:t.textPri, marginBottom:20 }}>Pricing & Fees</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
                <Field label="Tax Rate (%)" t={t}><SInput value={pricing.taxRate} onChange={(e:any)=>setPricing(p=>({...p,taxRate:e.target.value}))} t={t} placeholder="e.g. 12"/></Field>
                <Field label="Security Deposit (%)" t={t}><SInput value={pricing.depositPct} onChange={(e:any)=>setPricing(p=>({...p,depositPct:e.target.value}))} t={t} placeholder="e.g. 20"/></Field>
                <Field label="Late Return Fee / hr ($)" t={t}><SInput value={pricing.lateFeeHr} onChange={(e:any)=>setPricing(p=>({...p,lateFeeHr:e.target.value}))} t={t} placeholder="e.g. 5"/></Field>
                <Field label="Minimum Rental (hrs)" t={t}><SInput value={pricing.minRental} onChange={(e:any)=>setPricing(p=>({...p,minRental:e.target.value}))} t={t} placeholder="e.g. 2"/></Field>
              </div>
            </div>
          )}

          {/* Plan */}
          {tab==="Plan" && (() => {
            const CURRENT_CARS = 8; // TODO: replace with real fleet count from data
            const PLANS = [
              {
                name: "Free",
                price: "$0",
                period: "forever",
                color: "#10B981",
                cars: "Up to 10 cars",
                carsMax: 10,
                features: ["Basic dashboard","Customer portal","Rental & booking management","Email support"],
                current: true,
              },
              {
                name: "Starter",
                price: "$29",
                period: "/month",
                color: t.accent,
                cars: "Up to 20 cars",
                carsMax: 20,
                features: ["Everything in Free","Swap management","Sales tracking","Priority email support","Basic reports"],
                current: false,
              },
              {
                name: "Professional",
                price: "$79",
                period: "/month",
                color: "#8B5CF6",
                cars: "Up to 50 cars",
                carsMax: 50,
                features: ["Everything in Starter","Full reports & analytics","Live GPS tracking","API access","Phone support","Custom branding"],
                current: false,
              },
              {
                name: "Enterprise",
                price: "$199",
                period: "/month",
                color: "#F59E0B",
                cars: "Unlimited cars",
                carsMax: Infinity,
                features: ["Everything in Professional","Unlimited fleet","Dedicated account manager","SLA guarantee","White-label option","Custom integrations"],
                current: false,
              },
            ];
            return (
              <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
                {/* Current usage */}
                <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"20px 24px" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, color:t.textPri, marginBottom:3 }}>Current Plan: <span style={{ color:"#10B981" }}>Free</span></div>
                      <div style={{ fontSize:12, color:t.textMuted }}>You are using {CURRENT_CARS} of 10 free car slots</div>
                    </div>
                    <span style={{ fontSize:11, fontWeight:700, color:"#10B981", background:"rgba(16,185,129,0.12)", border:"1px solid rgba(16,185,129,0.25)", borderRadius:20, padding:"4px 14px" }}>Active</span>
                  </div>
                  <div style={{ height:8, borderRadius:4, background:dark?"#2a2a3a":"#ebebf0", overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${(CURRENT_CARS/10)*100}%`, background:"#10B981", borderRadius:4, transition:"width 0.5s" }}/>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                    <span style={{ fontSize:10, color:t.textMuted }}>{CURRENT_CARS} cars used</span>
                    <span style={{ fontSize:10, color:t.textMuted }}>10 car limit</span>
                  </div>
                </div>

                {/* Plan cards */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16 }}>
                  {PLANS.map(plan => (
                    <div key={plan.name} style={{ background:t.cardBg, borderRadius:14, border:`2px solid ${plan.current ? plan.color : t.border}`, padding:"24px", position:"relative", transition:"border-color 0.2s" }}
                      onMouseEnter={e=>{ if(!plan.current)(e.currentTarget as HTMLDivElement).style.borderColor=plan.color+"88"; }}
                      onMouseLeave={e=>{ if(!plan.current)(e.currentTarget as HTMLDivElement).style.borderColor=t.border; }}>
                      {plan.current && (
                        <span style={{ position:"absolute", top:-12, left:20, fontSize:10, fontWeight:700, color:"#fff", background:plan.color, borderRadius:20, padding:"3px 12px" }}>Current Plan</span>
                      )}
                      {plan.name === "Professional" && !plan.current && (
                        <span style={{ position:"absolute", top:-12, left:20, fontSize:10, fontWeight:700, color:"#fff", background:plan.color, borderRadius:20, padding:"3px 12px" }}>Most Popular</span>
                      )}
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
                        <div>
                          <div style={{ fontSize:16, fontWeight:800, color:t.textPri, marginBottom:3 }}>{plan.name}</div>
                          <div style={{ fontSize:11, fontWeight:600, color:plan.color, background:plan.color+"15", borderRadius:6, padding:"2px 8px", display:"inline-block" }}>{plan.cars}</div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontSize:26, fontWeight:900, color:t.textPri, lineHeight:1 }}>{plan.price}</div>
                          <div style={{ fontSize:10, color:t.textMuted }}>{plan.period}</div>
                        </div>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:20 }}>
                        {plan.features.map(f => (
                          <div key={f} style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <span style={{ width:16, height:16, borderRadius:"50%", background:plan.color+"20", border:`1px solid ${plan.color}44`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                              <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-4" stroke={plan.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </span>
                            <span style={{ fontSize:12, color:t.textSec }}>{f}</span>
                          </div>
                        ))}
                      </div>
                      <button
                        disabled={plan.current}
                        style={{ width:"100%", padding:"10px 0", borderRadius:9, border:plan.current?"none":`1px solid ${plan.color}`, background:plan.current?plan.color+"20":plan.color, color:plan.current?plan.color:plan.color===t.accent?t.accentFg:"#fff", fontSize:12, fontWeight:700, cursor:plan.current?"default":"pointer", fontFamily:"'DM Sans',sans-serif", transition:"opacity 0.15s" }}
                        onMouseEnter={e=>{ if(!plan.current)(e.currentTarget as HTMLButtonElement).style.opacity="0.85"; }}
                        onMouseLeave={e=>{ if(!plan.current)(e.currentTarget as HTMLButtonElement).style.opacity="1"; }}>
                        {plan.current ? "Your Current Plan" : `Upgrade to ${plan.name}`}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Note */}
                <div style={{ background:t.cardBg, borderRadius:12, border:`1px solid ${t.border}`, padding:"16px 20px", display:"flex", alignItems:"center", gap:12 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={t.textMuted} strokeWidth="1.5"/><path d="M12 8v4m0 4h.01" stroke={t.textMuted} strokeWidth="1.5" strokeLinecap="round"/></svg>
                  <span style={{ fontSize:12, color:t.textMuted }}>Customers are not on any pricing plan — plans only apply to admin fleet management. Payments processed via Mobile Money or bank transfer.</span>
                </div>
              </div>
            );
          })()}

          {/* Security */}
          {tab==="Security" && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"24px" }}>
                <div style={{ fontSize:14, fontWeight:700, color:t.textPri, marginBottom:20 }}>Change Password</div>
                <Field label="Current Password" t={t}><SInput value="" onChange={()=>{}} t={t} placeholder="••••••••"/></Field>
                <Field label="New Password" t={t}><SInput value="" onChange={()=>{}} t={t} placeholder="••••••••"/></Field>
                <Field label="Confirm New Password" t={t}><SInput value="" onChange={()=>{}} t={t} placeholder="••••••••"/></Field>
              </div>
              <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"24px" }}>
                <div style={{ fontSize:14, fontWeight:700, color:t.textPri, marginBottom:16 }}>Danger Zone</div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", border:"1px solid rgba(239,68,68,0.3)", borderRadius:10, background:"rgba(239,68,68,0.05)" }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#EF4444" }}>Reset All Data</div>
                    <div style={{ fontSize:11, color:t.textMuted }}>This will permanently erase all platform data. Cannot be undone.</div>
                  </div>
                  <button style={{ padding:"7px 16px", borderRadius:8, border:"1px solid rgba(239,68,68,0.4)", background:"rgba(239,68,68,0.12)", color:"#EF4444", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Reset</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}