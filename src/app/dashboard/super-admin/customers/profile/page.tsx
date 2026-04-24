"use client";
export const dynamic = "force-dynamic";
// src/app/dashboard/super-admin/customers/profile/page.tsx

import { useTheme } from "@/src/context/ThemeContext";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import AppShell from "@/src/components/layout/Appshell";
import TopBar from "@/src/components/layout/Topbar";
import { Ic } from "@/src/components/ui/Icons";
import { MOCK_CUSTOMERS } from "@/src/context/Customerauthcontext";

// Per-customer extended data not stored in MOCK_CUSTOMERS
const EXTENDED: Record<string, {
  location: string; role: string;
  rentals: number; purchases: number; swaps: number; spent: string;
}> = {
  "CUS-001": { location:"Accra, Ghana",    role:"Pro Customer",      rentals:14, purchases:2, swaps:3, spent:"$9,870" },
  "CUS-002": { location:"Kumasi, Ghana",   role:"Standard Customer", rentals:8,  purchases:1, swaps:1, spent:"$4,320" },
  "CUS-003": { location:"Takoradi, Ghana", role:"Standard Customer", rentals:5,  purchases:0, swaps:2, spent:"$2,150" },
};

function ProfileContent() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id") ?? "CUS-001";
  const { dark, setDark, t } = useTheme();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const base = MOCK_CUSTOMERS.find(c => c.id === id) ?? MOCK_CUSTOMERS[0];
  const ext  = EXTENDED[base.id] ?? EXTENDED["CUS-001"];

  const PROFILE = {
    name:      base.name,
    email:     base.email,
    phone:     base.phone,
    location:  ext.location,
    joined:    base.joined,
    role:      ext.role,
    rentals:   ext.rentals,
    purchases: ext.purchases,
    swaps:     ext.swaps,
    spent:     ext.spent,
  };

  const FIELDS = [
    { label:"Full Name",     value:PROFILE.name,     icon:(c:string)=>Ic.Profile(c) },
    { label:"Email Address", value:PROFILE.email,    icon:(c:string)=>Ic.Contact(c) },
    { label:"Phone Number",  value:PROFILE.phone,    icon:(c:string)=>Ic.Support(c) },
    { label:"Location",      value:PROFILE.location, icon:(c:string)=>Ic.Pin(c)     },
    { label:"Member Since",  value:PROFILE.joined,   icon:(c:string)=>Ic.History(c) },
    { label:"Account Role",  value:PROFILE.role,     icon:(c:string)=>Ic.License(c) },
  ];

  return (
    <AppShell active="Customers" dark={dark} setDark={setDark} t={t}>
      <TopBar
        title={PROFILE.name}
        subtitle={`Customer profile · ${base.id}`}
        breadcrumb={["dashboard", "super-admin", "Customers", base.id]}
        dark={dark} setDark={setDark} t={t}
        actions={
          <button onClick={() => {
            if (editing) {
              setSaved(true);
              setTimeout(() => router.back(), 1200);
            } else {
              setEditing(true);
            }
          }} disabled={saved} style={{
            display:"flex", alignItems:"center", gap:6,
            padding:"7px 14px", borderRadius:8,
            border: editing ? "none" : `1px solid ${t.border}`,
            background: saved ? "#10B981" : editing ? t.accent : t.cardBg,
            color: saved ? "#fff" : editing ? t.accentFg : t.textPri,
            cursor: saved ? "default" : "pointer", fontSize:12, fontWeight:600,
            fontFamily:"'DM Sans',sans-serif", transition:"background 0.3s",
          }}>
            <span style={{ display:"flex" }}>{saved ? Ic.Check("#fff") : editing ? Ic.Check(t.accentFg) : Ic.Notes(t.textMuted)}</span>
            {saved ? "Changes Saved" : editing ? "Save Changes" : "Edit Profile"}
          </button>
        }
      />

      <div style={{ flex:1, overflowY:"auto", padding:"28px", background:t.bg }}>
        <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:20 }}>

          {/* left: avatar + stats */}
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"28px 20px", display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
              <div style={{ width:72, height:72, borderRadius:"50%", background:t.accent, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, fontWeight:800, color:t.accentFg }}>
                {base.avatar}
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:15, fontWeight:800, color:t.textPri }}>{PROFILE.name}</div>
                <div style={{ fontSize:12, color:t.textMuted, marginTop:3 }}>{PROFILE.email}</div>
              </div>
              <span style={{ fontSize:10, fontWeight:700, letterSpacing:1, background:t.accent+"18", color:t.accent, border:`1px solid ${t.accent}33`, borderRadius:20, padding:"4px 14px" }}>
                {base.plan.toUpperCase()}
              </span>
            </div>

            {[
              { label:"Total Rentals", value:PROFILE.rentals,   icon:(c:string)=>Ic.Rentals(c)  },
              { label:"Purchases",     value:PROFILE.purchases, icon:(c:string)=>Ic.Buy(c)       },
              { label:"Swaps",         value:PROFILE.swaps,     icon:(c:string)=>Ic.Swap(c)      },
              { label:"Total Spent",   value:PROFILE.spent,     icon:(c:string)=>Ic.Payment(c)   },
            ].map(s => (
              <div key={s.label} style={{ background:t.cardBg, borderRadius:12, border:`1px solid ${t.border}`, padding:"14px 18px", display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ display:"flex", opacity:0.45 }}>{s.icon(t.textMuted)}</span>
                <div>
                  <div style={{ fontSize:11, color:t.textMuted, marginBottom:2 }}>{s.label}</div>
                  <div style={{ fontSize:17, fontWeight:800, color:t.textPri }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* right: fields */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"24px" }}>
              <div style={{ fontSize:14, fontWeight:700, color:t.textPri, marginBottom:20 }}>Personal Information</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                {FIELDS.map(f => (
                  <div key={f.label}>
                    <label style={{ display:"block", fontSize:11, fontWeight:600, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:7 }}>{f.label}</label>
                    <div style={{ position:"relative" }}>
                      <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", display:"flex", opacity:0.35 }}>{f.icon(t.textPri)}</span>
                      <input defaultValue={f.value} disabled={!editing} style={{ width:"100%", padding:"10px 14px 10px 34px", borderRadius:10, border:`1.5px solid ${editing ? t.accent : t.border}`, background: editing ? t.inputBg : t.bg, color:t.textPri, fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box", transition:"border-color 0.15s" }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"24px" }}>
              <div style={{ fontSize:14, fontWeight:700, color:t.textPri, marginBottom:16 }}>Security</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
                {["Current Password","New Password","Confirm Password"].map(lbl => (
                  <div key={lbl}>
                    <label style={{ display:"block", fontSize:11, fontWeight:600, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:7 }}>{lbl}</label>
                    <input type="password" placeholder="••••••••" disabled={!editing} style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:`1.5px solid ${editing ? t.accent : t.border}`, background: editing ? t.inputBg : t.bg, color:t.textPri, fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box" }}/>
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

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfileContent />
    </Suspense>
  );
}
