"use client";
// src/app/rentals/history/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Past rentals history — timeline list with status, cost, duration,
// re-book shortcut and receipt download.

import { useTheme } from "@/src/context/ThemeContext";
import { useState } from "react";
import { useRouter } from "next/navigation";

import AppShell from "@/src/components/layout/Appshell";
import PageHeader from "@/src/components/layout/PageHeader";

const HISTORY = [
  { id:"EDM-84921", car:"BMW 3 Series",      image:"https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&q=80", from:"2025-06-10 09:00", to:"2025-06-10 18:00", hours:9,  total:342.00, status:"completed", plate:"GR-1190-22" },
  { id:"EDM-73310", car:"Tesla Model S",      image:"https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&q=80", from:"2025-05-28 14:00", to:"2025-05-29 10:00", hours:20, total:900.00, status:"completed", plate:"GR-8801-21" },
  { id:"EDM-61204", car:"Mini Countryman",    image:"https://images.unsplash.com/photo-1546614042-7df3c24c9e5d?w=400&q=80", from:"2025-05-15 08:00", to:"2025-05-15 20:00", hours:12, total:342.00, status:"completed", plate:"GR-3310-23" },
  { id:"EDM-58832", car:"Ford Focus ST",      image:"https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&q=80", from:"2025-04-22 10:00", to:"2025-04-22 16:00", hours:6,  total:160.50, status:"cancelled", plate:"GR-5530-23" },
  { id:"EDM-44510", car:"Porsche Macan",      image:"https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80", from:"2025-04-05 09:00", to:"2025-04-06 09:00", hours:24, total:1320.00,status:"completed", plate:"GR-2201-22" },
  { id:"EDM-39981", car:"Audi A4",            image:"https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&q=80", from:"2025-03-18 12:00", to:"2025-03-18 20:00", hours:8,  total:196.72, status:"completed", plate:"GR-4421-22" },
];

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  completed: { bg: "rgba(16,185,129,0.12)", color: "#10B981" },
  cancelled: { bg: "rgba(239,68,68,0.12)",  color: "#EF4444" },
  pending:   { bg: "rgba(245,158,11,0.12)", color: "#F59E0B" },
};

export default function RentalHistoryPage() {
  const router = useRouter();
  const { dark, setDark, t } = useTheme();
  const [search, setSearch] = useState("");

  const filtered = HISTORY.filter(h =>
    h.car.toLowerCase().includes(search.toLowerCase()) ||
    h.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalSpent = HISTORY.filter(h => h.status === "completed").reduce((s, h) => s + h.total, 0);

  return (
    <AppShell active="Rental History" dark={dark} setDark={setDark} t={t}>
      <PageHeader
        title="Rental History"
        subtitle={`${HISTORY.length} past rentals · $${totalSpent.toLocaleString()} total spent`}
        dark={dark} setDark={setDark} t={t}
        actions={
          <button onClick={()=>router.push("/rentals")} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: t.accent, color: t.accentFg, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
            + New Rental
          </button>
        }
      />

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", background: t.bg }}>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { label: "Total Rentals",    value: HISTORY.length,                                    unit: "" },
            { label: "Completed",        value: HISTORY.filter(h => h.status === "completed").length, unit: "" },
            { label: "Total Hours",      value: HISTORY.reduce((s, h) => s + h.hours, 0),          unit: "hrs" },
            { label: "Total Spent",      value: `$${totalSpent.toLocaleString()}`,                  unit: "" },
          ].map(s => (
            <div key={s.label} style={{ background: t.cardBg, borderRadius: 12, border: `1px solid ${t.border}`, padding: "16px 20px" }}>
              <div style={{ fontSize: 11, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: t.textPri }}>{s.value}<span style={{ fontSize: 13, fontWeight: 400, color: t.textMuted, marginLeft: 4 }}>{s.unit}</span></div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 10, padding: "8px 14px", marginBottom: 20, maxWidth: 400 }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke={t.textMuted} strokeWidth="1.5"><circle cx="6" cy="6" r="4.5"/><line x1="9.5" y1="9.5" x2="13" y2="13"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by car or booking ID..." style={{ border: "none", outline: "none", fontSize: 13, color: t.textPri, background: "transparent", width: "100%" }} />
        </div>

        {/* History list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(h => {
            const sc = STATUS_STYLE[h.status];
            return (
              <div key={h.id} style={{ background: t.cardBg, borderRadius: 14, border: `1px solid ${t.border}`, padding: "16px 20px", display: "flex", alignItems: "center", gap: 18 }}>
                {/* Car image */}
                <img src={h.image} alt={h.car} style={{ width: 88, height: 64, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />

                {/* Main info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: t.textPri }}>{h.car}</span>
                    <span style={{ fontSize: 10, background: sc.bg, color: sc.color, borderRadius: 20, padding: "2px 8px", fontWeight: 600, textTransform: "capitalize" }}>{h.status}</span>
                  </div>
                  <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 6 }}>Plate: {h.plate} · Booking #{h.id}</div>
                  <div style={{ display: "flex", gap: 20, fontSize: 12, color: t.textSec }}>
                    <span>{h.from.split(" ")[0]}</span>
                    <span>{h.hours} hrs</span>
                    <span>{h.from.split(" ")[1]} – {h.to.split(" ")[1]}</span>
                  </div>
                </div>

                {/* Price + actions */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: t.textPri, marginBottom: 4 }}>${h.total.toFixed(2)}</div>
                  <div style={{ fontSize: 10, color: t.textMuted, marginBottom: 12 }}>total charged</div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button style={{ padding: "6px 12px", borderRadius: 7, border: `1px solid ${t.border}`, background: t.cardBg, color: t.textSec, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Receipt</button>
                    {h.status === "completed" && (
                      <button onClick={()=>router.push("/rentals/booking")} style={{ padding: "6px 12px", borderRadius: 7, border: "none", background: t.accent, color: t.accentFg, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Rebook</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}