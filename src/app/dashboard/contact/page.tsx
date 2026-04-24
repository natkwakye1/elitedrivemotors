"use client";
import { useTheme } from "@/src/context/ThemeContext";
// src/app/dashboard/contact/page.tsx

import { useState } from "react";
import AppShell from "@/src/components/layout/Appshell";
import TopBar from "@/src/components/layout/Topbar";
import { Ic } from "@/src/components/ui/Icons";

export default function ContactPage() {
  const { dark, setDark, t } = useTheme();

  return (
    <AppShell active="Contact" dark={dark} setDark={setDark} t={t}>
      <TopBar title="Contact" subtitle="Get in touch with EliteDriveMotors" dark={dark} setDark={setDark} t={t}/>
      <div style={{ flex:1, overflowY:"auto", padding:"24px", background:t.bg }}>
        <div style={{ maxWidth:640, margin:"0 auto", display:"flex", flexDirection:"column", gap:16 }}>

          <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"28px" }}>
            <div style={{ fontSize:16, fontWeight:700, color:t.textPri, marginBottom:6 }}>EliteDriveMotors</div>
            <div style={{ fontSize:13, color:t.textMuted, lineHeight:1.75 }}>
              For support, partnership or general enquiries, reach us via the channels below.
            </div>
          </div>

          {[
            { label:"Email",    value:"support@elitedrivemotors.com", icon:(c:string)=>Ic.Contact(c) },
            { label:"Phone",    value:"+233 30 123 4567",              icon:(c:string)=>Ic.Contact(c) },
            { label:"Location", value:"Osu, Accra, Ghana",             icon:(c:string)=>Ic.Pin(c)     },
          ].map(row => (
            <div key={row.label} style={{ background:t.cardBg, borderRadius:12, border:`1px solid ${t.border}`, padding:"18px 20px", display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:38, height:38, borderRadius:10, background:t.accent+"14", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span style={{ display:"flex" }}>{row.icon(t.accent)}</span>
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:600, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:3 }}>{row.label}</div>
                <div style={{ fontSize:13, fontWeight:600, color:t.textPri }}>{row.value}</div>
              </div>
            </div>
          ))}

        </div>
      </div>
    </AppShell>
  );
}
