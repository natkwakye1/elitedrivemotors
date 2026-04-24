"use client";
import { useTheme } from "@/src/context/ThemeContext";
// src/app/customer/live-map/page.tsx

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import CustomerShell from "@/src/components/layout/Customershell";
import { Ic } from "@/src/components/ui/Icons";
import type { VehiclePin } from "@/src/components/tracking/LeafletMap";

const LeafletMap = dynamic(() => import("@/src/components/tracking/LeafletMap"), { ssr: false });

const TRACKED_VEHICLES: VehiclePin[] = [
  { id: "RNT-001", car: "BMW 3 Series",  plate: "GR-2341-22", status: "In Transit", driver: "Kwame D.",  speed: "62 km/h", location: "Accra Central → Tema",    eta: "14 mins" },
  { id: "RNT-005", car: "Audi A4",       plate: "GE-4490-23", status: "Idle",       driver: "Abena S.",  speed: "0 km/h",  location: "East Legon",              eta: "—"       },
  { id: "RNT-003", car: "Tesla Model S", plate: "GW-1122-24", status: "In Transit", driver: "Kofi M.",   speed: "55 km/h", location: "Osu → East Legon",        eta: "8 mins"  },
  { id: "RNT-002", car: "Toyota Camry",  plate: "GT-5512-23", status: "Parked",     driver: "N/A",       speed: "0 km/h",  location: "Airport Accra Depot",     eta: "—"       },
  { id: "RNT-006", car: "Honda Accord",  plate: "GS-7731-24", status: "In Transit", driver: "Yaw B.",    speed: "48 km/h", location: "Dome Market → University", eta: "22 mins" },
];

const VEH_IMAGES: Record<string, string> = {
  "RNT-001": "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80",
  "RNT-005": "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&q=80",
  "RNT-003": "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&q=80",
  "RNT-002": "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&q=80",
  "RNT-006": "https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=600&q=80",
};

const STATUS_COLOR: Record<string, string> = {
  "In Transit": "#10B981",
  "Idle":       "#F59E0B",
  "Parked":     "#6B7280",
};

export default function CustomerLiveMapPage() {
  const { dark, setDark, t } = useTheme();
  const [selected, setSelected] = useState<string | null>(null);
  const sel = TRACKED_VEHICLES.find(v => v.id === selected) ?? null;
  const sc = sel ? (STATUS_COLOR[sel.status] ?? "#6B7280") : "#6B7280";

  return (
    <CustomerShell
      title="Live Map"
      subtitle="Real-time vehicle tracking · Accra, Ghana"
      dark={dark} setDark={setDark} t={t}
    >
      <style>{`
        @keyframes drawerSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>

      <div style={{ flex: 1, display: "flex", overflow: "hidden", background: t.bg, position: "relative" }}>

        {/* Left panel — vehicle list */}
        <div style={{ width: 280, flexShrink: 0, borderRight: `1px solid ${t.border}`, display: "flex", flexDirection: "column", background: t.cardBg, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${t.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.textPri }}>Tracked Vehicles</div>
            <div style={{ fontSize: 10, color: t.textMuted, marginTop: 2 }}>
              {TRACKED_VEHICLES.filter(v => v.status === "In Transit").length} in transit · {TRACKED_VEHICLES.length} total
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
            {TRACKED_VEHICLES.map(v => {
              const sc2 = STATUS_COLOR[v.status] ?? t.textMuted;
              const active = selected === v.id;
              return (
                <div key={v.id} onClick={() => setSelected(active ? null : v.id)}
                  style={{ padding: "12px", borderRadius: 10, border: `1px solid ${active ? t.accent : t.border}`, background: active ? t.accent + "08" : t.bg, marginBottom: 8, cursor: "pointer", transition: "all 0.15s", overflow: "hidden" }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLDivElement).style.borderColor = t.accent + "66"; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLDivElement).style.borderColor = t.border; }}>
                  {/* Car image thumbnail */}
                  <div style={{ position: "relative", height: 72, borderRadius: 7, overflow: "hidden", marginBottom: 8, background: dark ? "#1a1a2e" : "#e8e8f0" }}>
                    <Image src={VEH_IMAGES[v.id] ?? ""} alt={v.car} fill sizes="240px" style={{ objectFit: "cover" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)", pointerEvents: "none" }} />
                    <span style={{ position: "absolute", bottom: 6, left: 8, fontSize: 9, fontWeight: 700, color: "#fff", background: sc2 + "cc", borderRadius: 20, padding: "2px 8px" }}>{v.status}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: t.textPri }}>{v.car}</div>
                      <div style={{ fontSize: 10, color: t.textMuted }}>{v.plate}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: t.textMuted, display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                    <span style={{ display: "flex", opacity: 0.5 }}>{Ic.Pin(t.textMuted)}</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.location}</span>
                  </div>
                  {v.status === "In Transit" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11 }}>
                      <span style={{ fontWeight: 600, color: t.textPri }}>{v.speed}</span>
                      {v.eta !== "—" && <span style={{ color: t.textMuted }}>ETA <span style={{ fontWeight: 600, color: t.accent }}>{v.eta}</span></span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Map */}
        <div style={{ flex: 1, position: "relative" }}>
          <LeafletMap
            dark={dark} t={t}
            vehicles={TRACKED_VEHICLES}
            center={{ lat: 5.5908, lng: -0.2043 }}
            zoom={13}
            onVehicleClick={id => setSelected(prev => prev === id ? null : id)}
          />
        </div>

        {/* Backdrop */}
        {sel && (
          <div onClick={() => setSelected(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 40 }} />
        )}

        {/* Slide-in drawer */}
        {sel && (
          <div style={{
            position: "fixed", top: 0, right: 0, bottom: 0, width: 360, zIndex: 50,
            background: t.cardBg, borderLeft: `1px solid ${t.border}`,
            display: "flex", flexDirection: "column",
            animation: "drawerSlideIn 0.28s cubic-bezier(0.4,0,0.2,1)",
            fontFamily: "'DM Sans',sans-serif",
          }}>
            {/* Image header */}
            <div style={{ position: "relative", height: 210, flexShrink: 0, background: dark ? "#111122" : "#e8e8f0" }}>
              <Image src={VEH_IMAGES[sel.id] ?? ""} alt={sel.car} fill sizes="360px" style={{ objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)", pointerEvents: "none" }} />
              {/* Close */}
              <button onClick={() => setSelected(null)}
                style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: 18, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(4px)" }}>
                ×
              </button>
              {/* Name + status */}
              <div style={{ position: "absolute", bottom: 14, left: 16, right: 16 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{sel.car}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: sc + "cc", border: `1px solid ${sc}55`, borderRadius: 20, padding: "3px 10px", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", display: "inline-block" }} />
                    {sel.status}
                  </span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.65)" }}>{sel.plate}</span>
                </div>
              </div>
            </div>

            {/* Scrollable body */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {/* ID row */}
              <div style={{ padding: "14px 16px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 11, color: t.textMuted }}>Rental ID</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.textPri }}>{sel.id}</div>
              </div>

              {/* Stats grid */}
              <div style={{ padding: "14px 16px", borderBottom: `1px solid ${t.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Vehicle Info</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { label: "Driver",   value: sel.driver,   icon: (c:string) => Ic.Users(c)    },
                    { label: "Speed",    value: sel.speed,    icon: (c:string) => Ic.Tracking(c) },
                    { label: "ETA",      value: sel.eta,      icon: (c:string) => Ic.History(c)  },
                    { label: "Location", value: sel.location, icon: (c:string) => Ic.Pin(c)      },
                  ].map(row => (
                    <div key={row.label} style={{ background: t.bg, borderRadius: 8, border: `1px solid ${t.border}`, padding: "10px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
                        <span style={{ display: "flex", opacity: 0.5 }}>{row.icon(t.textMuted)}</span>
                        <div style={{ fontSize: 9, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.8 }}>{row.label}</div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: row.label === "ETA" ? t.accent : t.textPri, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Route */}
              <div style={{ padding: "14px 16px", borderBottom: `1px solid ${t.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Current Route</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: sc, flexShrink: 0 }} />
                  <div style={{ fontSize: 12, color: t.textPri, lineHeight: 1.5 }}>{sel.location}</div>
                </div>
                {sel.status === "In Transit" && (
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#10B981" }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981", display: "inline-block", animation: "lmpulse 1.5s infinite" }} />
                    Vehicle is currently in transit
                  </div>
                )}
              </div>
            </div>

            {/* CTA */}
            <div style={{ padding: "14px 16px", borderTop: `1px solid ${t.border}`, flexShrink: 0, display: "flex", gap: 8 }}>
              <button
                onClick={() => setSelected(null)}
                style={{ flex: 1, padding: "12px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.bg, color: t.textSec, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
              >
                Close
              </button>
              <button
                onClick={() => setSelected(null)}
                style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: t.accent, color: t.accentFg, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <span style={{ display: "flex" }}>{Ic.Map(t.accentFg)}</span>
                View on Map
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes lmpulse { 0%,100% { opacity:0.4; transform:scale(1); } 50% { opacity:1; transform:scale(1.4); } }
      `}</style>
    </CustomerShell>
  );
}
