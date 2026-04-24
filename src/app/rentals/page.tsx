"use client";
// src/app/rentals/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Rentals browse page — shows all available vehicles for rent with
// status badges, quick-book CTA, and a tab bar for All / Active / History.

import { useTheme } from "@/src/context/ThemeContext";
import { useState } from "react";
import { useRouter } from "next/navigation";

import AppShell from "@/src/components/layout/Appshell";
import PageHeader from "@/src/components/layout/PageHeader";
import { Ic } from "@/src/components/ui/Icons";
import Stars from "@/src/components/ui/Stars";

// ─── Mock data ────────────────────────────────────────────────────────────────
const RENTALS = [
  { id:1,  name:"Audi A4",           spec:"2.0 TFSI · Automatic",    price:24.59, rating:4.7, type:"Sedan",    status:"available", image:"https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&q=80", plate:"GR-4421-22" },
  { id:2,  name:"Tesla Model S",     spec:"Long Range · Automatic",  price:45.00, rating:4.1, type:"Sedan",    status:"rented",    image:"https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&q=80", plate:"GR-8801-21" },
  { id:3,  name:"Mini Countryman",   spec:"Cooper S · Automatic",    price:28.50, rating:4.9, type:"Crossover",status:"available", image:"https://images.unsplash.com/photo-1546614042-7df3c24c9e5d?w=600&q=80", plate:"GR-3310-23" },
  { id:4,  name:"VW Tiguan",         spec:"2.0 TSI · Automatic",     price:31.50, rating:4.6, type:"Crossover",status:"maintenance",image:"https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=600&q=80", plate:"GR-7742-20" },
  { id:5,  name:"BMW 3 Series",      spec:"330i xDrive · Automatic", price:38.00, rating:4.8, type:"Sedan",    status:"available", image:"https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80", plate:"GR-1190-22" },
  { id:6,  name:"Ford Focus ST",     spec:"2.3 EcoBoost · Manual",   price:26.75, rating:4.7, type:"Hatchback",status:"available", image:"https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&q=80", plate:"GR-5530-23" },
  { id:7,  name:"Mazda 6",           spec:"2.5 Turbo · Automatic",   price:22.99, rating:5.0, type:"Sedan",    status:"rented",    image:"https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&q=80", plate:"GR-9923-21" },
  { id:8,  name:"Porsche Macan",     spec:"Macan S · Automatic",     price:55.00, rating:4.6, type:"SUV",      status:"available", image:"https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80", plate:"GR-2201-22" },
];

const TABS = ["All", "Available", "Rented", "Maintenance"];

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  available:   { bg: "rgba(16,185,129,0.12)", text: "#10B981", dot: "#10B981" },
  rented:      { bg: "rgba(245,158,11,0.12)",  text: "#F59E0B", dot: "#F59E0B" },
  maintenance: { bg: "rgba(239,68,68,0.12)",   text: "#EF4444", dot: "#EF4444" },
};

export default function RentalsPage() {
  const router = useRouter();
  const { dark, setDark, t } = useTheme();
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = RENTALS.filter(r => {
    const matchTab = tab === "All" || r.status === tab.toLowerCase();
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const counts = {
    All: RENTALS.length,
    Available: RENTALS.filter(r => r.status === "available").length,
    Rented: RENTALS.filter(r => r.status === "rented").length,
    Maintenance: RENTALS.filter(r => r.status === "maintenance").length,
  };

  return (
    <AppShell active="Rentals" dark={dark} setDark={setDark} t={t}>
      <PageHeader
        title="Rentals"
        subtitle="Browse and book available vehicles"
        dark={dark}
        setDark={setDark}
        t={t}
        actions={
          <button onClick={()=>router.push("/rentals/history")} style={{ padding: "7px 16px", borderRadius: 8, border: `1px solid ${t.selectBorder}`, background: t.selectBg, color: t.selectText, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
            View History
          </button>
        }
      />

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", background: t.bg }}>

        {/* Search + Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 10, padding: "8px 14px", flex: 1, minWidth: 200 }}>
            {Ic.Search(t.textMuted)}
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search vehicles..."
              style={{ border: "none", outline: "none", fontSize: 13, color: t.textPri, background: "transparent", width: "100%" }}
            />
          </div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 6 }}>
            {TABS.map(tb => (
              <button
                key={tb}
                onClick={() => setTab(tb)}
                style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${tab === tb ? t.accent : t.border}`, background: tab === tb ? t.accent : t.cardBg, color: tab === tb ? "#fff" : t.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6 }}
              >
                {tb}
                <span style={{ background: tab === tb ? "rgba(255,255,255,0.25)" : t.pill, color: tab === tb ? "#fff" : t.textMuted, borderRadius: 10, fontSize: 10, fontWeight: 700, padding: "1px 6px" }}>
                  {counts[tb as keyof typeof counts]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
          {filtered.map(r => {
            const sc = STATUS_COLORS[r.status];
            return (
              <div key={r.id} style={{ background: t.cardBg, borderRadius: 14, border: `1px solid ${t.border}`, overflow: "hidden", transition: "box-shadow 0.2s", boxShadow: `0 2px 8px ${t.shadow}` }}>
                {/* Image */}
                <div style={{ position: "relative", height: 160, background: t.imgPlaceholder, overflow: "hidden" }}>
                  <img src={r.image} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  <div style={{ position: "absolute", inset: 0, background: t.imgOverlay }} />
                  {/* Status badge */}
                  <div style={{ position: "absolute", top: 10, left: 10, background: sc.bg, border: `1px solid ${sc.dot}22`, borderRadius: 20, padding: "4px 10px", display: "flex", alignItems: "center", gap: 5, backdropFilter: "blur(6px)" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: sc.text, textTransform: "capitalize" }}>{r.status}</span>
                  </div>
                  {/* Plate */}
                  <div style={{ position: "absolute", bottom: 10, right: 10, background: t.distBadge, backdropFilter: "blur(6px)", borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 700, color: t.distText, letterSpacing: 1 }}>{r.plate}</div>
                </div>
                {/* Info */}
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: t.textPri, marginBottom: 2 }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: t.textMuted }}>{r.spec}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800, fontSize: 16, color: t.textPri }}>${r.price.toFixed(2)}</div>
                      <div style={{ fontSize: 10, color: t.textMuted }}>/ hour</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
                    <Stars n={r.rating} isDark={dark} />
                    <span style={{ fontSize: 11, color: t.textMuted }}>{r.rating}</span>
                    <span style={{ marginLeft: "auto", fontSize: 10, background: t.tagBg, color: t.tagText, borderRadius: 5, padding: "2px 7px", border: `1px solid ${t.tagBorder}` }}>{r.type}</span>
                  </div>
                  <button
                    onClick={()=>r.status==="available"&&router.push("/rentals/booking")}
                    style={{ display: "block", width:"100%", textAlign: "center", background: r.status === "available" ? t.accent : t.toggleOff, color: r.status === "available" ? t.accentFg : t.textMuted, borderRadius: 8, padding: "9px 0", fontSize: 13, fontWeight: 700, border:"none", fontFamily: "'DM Sans',sans-serif", cursor: r.status === "available" ? "pointer" : "not-allowed", transition: "opacity 0.2s", opacity: r.status === "available" ? 1 : 0.5 }}
                  >
                    {r.status === "available" ? "Book Now" : r.status === "rented" ? "Currently Rented" : "Under Maintenance"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0", color: t.textMuted }}>
            <div style={{ marginBottom: 12, opacity: 0.4, display:"flex", justifyContent:"center" }}><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3v-5l2-6h14l2 6v5h-2"/><rect x="2" y="16" width="4" height="3" rx="1"/><rect x="18" y="16" width="4" height="3" rx="1"/><circle cx="8.5" cy="16.5" r="1.5"/><circle cx="15.5" cy="16.5" r="1.5"/></svg></div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>No vehicles found</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Try adjusting your search or filter</div>
          </div>
        )}
      </div>
    </AppShell>
  );
}