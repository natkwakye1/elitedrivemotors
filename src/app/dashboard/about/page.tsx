"use client";
// src/app/dashboard/about/page.tsx

import { useTheme } from "@/src/context/ThemeContext";
import { useState } from "react";

import AppShell from "@/src/components/layout/Appshell";
import TopBar   from "@/src/components/layout/Topbar";
import { Ic }   from "@/src/components/ui/Icons";

export default function AboutPage() {
  const { dark, setDark, t } = useTheme();

  const STATS = [
    { label:"Cars in Fleet",    value:"87+",    icon:(c:string)=>Ic.Vehicles(c) },
    { label:"Happy Customers",  value:"1,204",  icon:(c:string)=>Ic.Users(c)    },
    { label:"Cities Covered",   value:"5",      icon:(c:string)=>Ic.Pin(c)      },
    { label:"Years of Service", value:"6",      icon:(c:string)=>Ic.History(c)  },
  ];

  const TEAM = [
    { name:"Samuel Owusu",   role:"CEO & Founder",        avatar:"SO" },
    { name:"Grace Amponsah", role:"Head of Operations",   avatar:"GA" },
    { name:"Eric Boateng",   role:"Fleet Manager",        avatar:"EB" },
    { name:"Linda Mensah",   role:"Customer Experience",  avatar:"LM" },
  ];

  return (
    <AppShell active="About" dark={dark} setDark={setDark} t={t}>
      <TopBar title="About EliteDriveMotors" subtitle="Our story and mission" dark={dark} setDark={setDark} t={t}/>
      <div style={{ flex:1, overflowY:"auto", padding:"24px", background:t.bg }}>
        <div style={{ maxWidth:860, margin:"0 auto", display:"flex", flexDirection:"column", gap:18 }}>

          {/* hero card */}
          <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"32px", textAlign:"center" }}>
            <div style={{ width:60, height:60, background:t.accent, borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
              {Ic.CarLogo("#fff")}
            </div>
            <div style={{ fontSize:24, fontWeight:800, color:t.textPri, marginBottom:8 }}>EliteDriveMotors</div>
            <div style={{ fontSize:13, color:t.textMuted, maxWidth:520, margin:"0 auto", lineHeight:1.8 }}>
              Ghana's premier car rental, purchase and swap platform. We connect drivers with the perfect vehicle — whether you're looking to rent for a day, buy your dream car, or swap what you have for something better.
            </div>
          </div>

          {/* stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
            {STATS.map(s=>(
              <div key={s.label} style={{ background:t.cardBg, borderRadius:12, border:`1px solid ${t.border}`, padding:"20px", textAlign:"center", transition:"border-color 0.15s" }} onMouseEnter={e=>(e.currentTarget.style.borderColor=t.accent)} onMouseLeave={e=>(e.currentTarget.style.borderColor=t.border)}>
                <div style={{ width:36, height:36, borderRadius:9, background:t.accent+"15", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px" }}>
                  <span style={{ display:"flex" }}>{s.icon(t.accent)}</span>
                </div>
                <div style={{ fontSize:24, fontWeight:800, color:t.textPri, marginBottom:4 }}>{s.value}</div>
                <div style={{ fontSize:11, color:t.textMuted }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* mission */}
          <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"24px" }}>
            <div style={{ fontSize:14, fontWeight:700, color:t.textPri, marginBottom:14 }}>Our Mission</div>
            <div style={{ fontSize:13, color:t.textSec, lineHeight:1.8 }}>
              We believe everyone deserves access to a quality vehicle on their own terms. EliteDriveMotors was founded in Accra with a simple idea: make renting, buying and swapping cars as easy and transparent as possible. Our platform is built around trust, convenience and exceptional customer service — serving customers across Accra, Tema, Kumasi, Takoradi and Tamale.
            </div>
          </div>

          {/* team */}
          <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, padding:"24px" }}>
            <div style={{ fontSize:14, fontWeight:700, color:t.textPri, marginBottom:16 }}>Our Team</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
              {TEAM.map(m=>(
                <div key={m.name} style={{ textAlign:"center", padding:"20px 14px", background:t.bg, borderRadius:12, border:`1px solid ${t.border}`, transition:"border-color 0.15s" }} onMouseEnter={e=>(e.currentTarget.style.borderColor=t.accent)} onMouseLeave={e=>(e.currentTarget.style.borderColor=t.border)}>
                  <div style={{ width:48, height:48, borderRadius:"50%", background:t.accent+"20", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:800, color:t.accent, margin:"0 auto 12px" }}>{m.avatar}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:t.textPri, marginBottom:3 }}>{m.name}</div>
                  <div style={{ fontSize:11, color:t.textMuted }}>{m.role}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}