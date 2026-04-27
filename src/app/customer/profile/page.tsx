"use client";
// src/app/customer/profile/page.tsx

import { useTheme } from "@/src/context/ThemeContext";
import { useState } from "react";
import { useRouter } from "next/navigation";

import CustomerShell from "@/src/components/layout/Customershell";
import { Ic } from "@/src/components/ui/Icons";
import { useCustomerAuth } from "@/src/context/Customerauthcontext";
import { useBookings, useSwaps } from "@/src/hooks/useApi";

export default function CustomerProfilePage() {
  const router = useRouter();
  const { dark, setDark, t } = useTheme();
  const { customer, logout } = useCustomerAuth();
  const { bookings } = useBookings();
  const { swaps } = useSwaps();
  if (!customer) return <div style={{ position:"fixed", inset:0, background:t.bg }}/>;

  const rentals   = bookings.filter(b => b.booking_type !== "buy");
  const purchases = bookings.filter(b => b.booking_type === "buy");
  const totalSpent = bookings.reduce((s, b) => s + b.total_amount, 0);

  return (
    <CustomerShell title="My Profile" subtitle="Manage your account details" dark={dark} setDark={setDark} t={t}>
      <div style={{ flex:1, overflowY:"auto", padding:"24px", background:t.bg }}>
        <div style={{ maxWidth:800, margin:"0 auto", display:"flex", flexDirection:"column", gap:16 }}>

          {/* avatar + name card */}
          <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"24px", display:"flex", alignItems:"center", gap:20 }}>
            <div style={{ width:64, height:64, borderRadius:"50%", background:t.accent+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, fontWeight:800, color:t.accent, flexShrink:0 }}>
              {customer.avatar}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:20, fontWeight:800, color:t.textPri, marginBottom:4 }}>{customer.name}</div>
              <div style={{ fontSize:12, color:t.textMuted }}>{customer.email} · Joined {customer.joined}</div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              {customer.plan === "Pro" && (
                <span style={{ fontSize:10, fontWeight:700, color:t.accent, background:t.accent+"15", border:`1px solid ${t.accent}25`, borderRadius:20, padding:"4px 14px" }}>PRO MEMBER</span>
              )}
              <span style={{ fontSize:10, fontWeight:600, color:t.textMuted, background:t.bg, border:`1px solid ${t.border}`, borderRadius:20, padding:"4px 14px" }}>{customer.id}</span>
            </div>
          </div>

          {/* stats */}
          <div className="kpi-grid" style={{ gap:14 }}>
            {[
              { label:"Rentals",    value: rentals.length,                                                    icon:(c:string)=>Ic.Rentals(c),  href:"/customer/rentals"   },
              { label:"Purchases",  value: purchases.length,                                                  icon:(c:string)=>Ic.Buy(c),      href:"/customer/purchases" },
              { label:"Swaps",      value: swaps.length,                                                      icon:(c:string)=>Ic.Swap(c),     href:"/customer/swaps"     },
              { label:"Total Spent",value: `$${totalSpent.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`, icon:(c:string)=>Ic.Payment(c), href:"/customer/rentals" },
            ].map(s => (
              <div key={s.label} onClick={()=>router.push(s.href)}
                style={{ background:t.cardBg, borderRadius:12, border:`1px solid ${t.border}`, padding:"16px 18px", cursor:"pointer", transition:"border-color 0.15s" }}
                onMouseEnter={e=>(e.currentTarget.style.borderColor=t.accent)}
                onMouseLeave={e=>(e.currentTarget.style.borderColor=t.border)}
              >
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <span style={{ fontSize:11, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, fontWeight:600 }}>{s.label}</span>
                  <span style={{ display:"flex", opacity:0.4 }}>{s.icon(t.textMuted)}</span>
                </div>
                <div style={{ fontSize:22, fontWeight:800, color:t.textPri }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* account details */}
          <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"22px" }}>
            <div style={{ fontSize:13, fontWeight:700, color:t.textPri, marginBottom:16 }}>Account Details</div>
            <div className="dash-two" style={{ gap:14 }}>
              {[
                { label:"Full Name",   value:customer.name,    icon:(c:string)=>Ic.Profile(c)  },
                { label:"Email",       value:customer.email,   icon:(c:string)=>Ic.Contact(c)  },
                { label:"Phone",       value:customer.phone,   icon:(c:string)=>Ic.Support(c)  },
                { label:"Member ID",   value:customer.id,      icon:(c:string)=>Ic.License(c)  },
                { label:"Plan",        value:customer.plan,    icon:(c:string)=>Ic.Favs(c)   },
                { label:"Member Since",value:customer.joined,  icon:(c:string)=>Ic.History(c)  },
              ].map(row => (
                <div key={row.label} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", background:t.bg, borderRadius:10, border:`1px solid ${t.border}` }}>
                  <div style={{ width:30, height:30, borderRadius:8, background:t.accent+"12", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span style={{ display:"flex" }}>{row.icon(t.accent)}</span>
                  </div>
                  <div>
                    <div style={{ fontSize:9, color:t.textMuted, textTransform:"uppercase", letterSpacing:0.6, marginBottom:2 }}>{row.label}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:t.textPri }}>{row.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* danger zone */}
          <div style={{ background:t.cardBg, borderRadius:14, border:"1px solid rgba(239,68,68,0.2)", padding:"20px" }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#EF4444", marginBottom:8 }}>Sign Out</div>
            <div style={{ fontSize:12, color:t.textMuted, marginBottom:14 }}>You'll be returned to the login page.</div>
            <button onClick={()=>{ logout(); router.push("/customer/login"); }}
              style={{ padding:"10px 20px", borderRadius:9, border:"1px solid rgba(239,68,68,0.3)", background:"rgba(239,68,68,0.06)", color:"#EF4444", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
              Sign Out
            </button>
          </div>

        </div>
      </div>
    </CustomerShell>
  );
}