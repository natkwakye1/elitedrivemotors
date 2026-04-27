"use client";
// src/app/customer/bookings/page.tsx

import { useTheme } from "@/src/context/ThemeContext";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CustomerShell from "@/src/components/layout/Customershell";
import { Ic } from "@/src/components/ui/Icons";
import { useCustomerAuth } from "@/src/context/Customerauthcontext";
import { useBookings } from "@/src/hooks/useApi";
import type { ApiBooking } from "@/src/lib/api";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
}
function fmtCurrency(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits:2, maximumFractionDigits:2 })}`;
}
function carName(b: ApiBooking) {
  return b.car ? `${b.car.make} ${b.car.model}` : `Vehicle #${b.car_id.slice(0,6).toUpperCase()}`;
}
function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

const STATUS_COLOR: Record<string, string> = {
  Confirmed: "#10B981", Pending: "#F59E0B", Completed: "#4F46E5", Cancelled: "#EF4444",
};
const STATUSES = ["All", "Confirmed", "Pending", "Completed", "Cancelled"];

function PanelSection({ title, children, t }: { title: string; children: React.ReactNode; t: any }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ borderBottom: `1px solid ${t.divider}` }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0 9px", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: t.textMuted }}>{title}</span>
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
          <path d={open ? "M3 9L7 5L11 9" : "M3 5L7 9L11 5"} stroke={t.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && <div style={{ paddingBottom: 14 }}>{children}</div>}
    </div>
  );
}

export default function CustomerBookingsPage() {
  const router = useRouter();
  const { dark, t } = useTheme();
  const { customer } = useCustomerAuth();
  const { bookings, loading } = useBookings();
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  if (!customer) return <div style={{ position:"fixed", inset:0, background:t.bg }}/>;

  const all = bookings;
  const filtered = useMemo(() => all.filter((b: ApiBooking) => {
    if (status !== "All" && capitalize(b.status) !== status) return false;
    if (search && !carName(b).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [all, status, search]);

  const hasFilter = status !== "All" || !!search;
  const totalAmount = all.reduce((s, b) => s + b.total_amount, 0);
  const inputStyle: React.CSSProperties = { width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.textPri, fontSize: 12, outline: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box" };

  return (
    <CustomerShell title="My Bookings" subtitle={loading ? "Loading…" : `${all.length} booking${all.length !== 1 ? "s" : ""}`}
      actions={
        <button onClick={() => router.push("/customer/rent-car")}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "none", background: t.accent, color: t.accentFg, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
          <span style={{ display: "flex" }}>{Ic.Booking(t.accentFg)}</span>New Booking
        </button>
      }
    >
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Filter panel */}
        <div style={{ width: panelCollapsed ? 40 : 240, flexShrink: 0, background: t.cardBg, borderRight: `1px solid ${t.border}`, display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "'DM Sans',sans-serif", transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)", position: "relative" }}>
          <div style={{ padding: panelCollapsed ? "13px 0 11px" : "13px 16px 11px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: panelCollapsed ? "center" : "space-between", flexShrink: 0, transition: "padding 0.22s" }}>
            {!panelCollapsed && <span style={{ fontSize: 14, fontWeight: 700, color: t.textPri }}>Filter by</span>}
            {!panelCollapsed && hasFilter && (
              <button onClick={() => { setStatus("All"); setSearch(""); }}
                style={{ fontSize: 11, color: t.textMuted, background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                Reset all <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2L10 10M10 2L2 10" stroke={t.textMuted} strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            )}
            <button onClick={() => setPanelCollapsed(v => !v)} style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${t.border}`, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d={panelCollapsed ? "M4 2L8 6L4 10" : "M8 2L4 6L8 10"} stroke={t.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          {panelCollapsed && hasFilter && (
            <div style={{ position: "absolute", top: 10, right: 6, width: 6, height: 6, borderRadius: "50%", background: t.accent, zIndex: 2 }}/>
          )}
          <div style={{ flex: 1, overflowY: "auto", padding: panelCollapsed ? 0 : "0 14px 24px", opacity: panelCollapsed ? 0 : 1, pointerEvents: panelCollapsed ? "none" : "auto", transition: "opacity 0.15s" }}>
            <PanelSection title="Search" t={t}>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", display: "flex", opacity: 0.4 }}>{Ic.Search(t.textMuted)}</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by car name…"
                  style={{ ...inputStyle, paddingLeft: 30 }}
                  onFocus={e => (e.target.style.borderColor = t.accent)}
                  onBlur={e  => (e.target.style.borderColor = t.border)} />
              </div>
            </PanelSection>
            <PanelSection title="Status" t={t}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {STATUSES.map(s => {
                  const on = status === s;
                  const col = s === "All" ? t.accent : STATUS_COLOR[s] ?? t.accent;
                  return (
                    <button key={s} onClick={() => setStatus(s)}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, border: `1.5px solid ${on ? col : t.border}`, background: on ? col + "14" : "transparent", color: on ? col : t.textSec, fontSize: 12, fontWeight: on ? 700 : 400, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.13s", textAlign: "left" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: s === "All" ? t.accent : STATUS_COLOR[s] ?? t.accent, opacity: on ? 1 : 0.35, flexShrink: 0 }}/>
                      {s}
                    </button>
                  );
                })}
              </div>
            </PanelSection>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", background: t.bg }}>
          {loading ? (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"60%", color:t.textMuted, fontSize:13 }}>Loading bookings…</div>
          ) : all.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60%", gap: 16 }}>
              <div style={{ width: 60, height: 60, borderRadius: 16, background: t.cardBg, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ display: "flex", opacity: 0.4 }}>{Ic.Booking(t.textMuted)}</span>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.textPri, marginBottom: 6 }}>No bookings yet</div>
                <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 18 }}>Book a car rental and it will appear here.</div>
                <button onClick={() => router.push("/customer/rent-car")}
                  style={{ padding: "10px 22px", borderRadius: 9, border: "none", background: t.accent, color: t.accentFg, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                  Book a Rental
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* KPI strip */}
              <div className="kpi-grid" style={{ marginBottom: 4 }}>
                {[
                  { label: "Total Bookings", value: all.length,                                                       icon: (c:string) => Ic.Booking(c) },
                  { label: "Confirmed",      value: all.filter(b => b.status === "confirmed").length,                  icon: () => Ic.Check()            },
                  { label: "Pending",        value: all.filter(b => b.status === "pending").length,                    icon: (c:string) => Ic.History(c) },
                  { label: "Total Value",    value: fmtCurrency(totalAmount),                                          icon: (c:string) => Ic.Payment(c) },
                ].map(s => (
                  <div key={s.label} style={{ background: t.cardBg, borderRadius: 12, border: `1px solid ${t.border}`, padding: "14px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 10, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>{s.label}</span>
                      <span style={{ display: "flex", opacity: 0.35 }}>{s.icon(t.textMuted)}</span>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: t.textPri }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: t.textMuted }}>
                Showing <strong style={{ color: t.textPri }}>{filtered.length}</strong> of {all.length} bookings
              </div>
              {filtered.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: t.textMuted, fontSize: 13, background: t.cardBg, borderRadius: 12, border: `1px solid ${t.border}` }}>No bookings match your filters.</div>
              ) : (
                filtered.map((b: ApiBooking) => {
                  const sc = STATUS_COLOR[capitalize(b.status)] ?? t.textMuted;
                  const days = Math.max(1, Math.ceil((new Date(b.end_date).getTime() - new Date(b.start_date).getTime()) / 86_400_000));
                  const name = carName(b);
                  return (
                    <div key={b.id}
                      style={{ background: t.cardBg, borderRadius: 14, border: `1px solid ${t.border}`, overflow: "hidden", transition: "border-color 0.15s, transform 0.15s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = t.accent; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = t.border; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}>
                      <div className="card-row" style={{ display: "flex" }}>
                        <div className="card-img" style={{ position: "relative", width: 160, flexShrink: 0, background: dark ? "#111122" : "#f0f0f6" }}>
                          {b.car?.cover_image_url
                            ? <Image src={b.car.cover_image_url} alt={name} fill sizes="160px" style={{ objectFit: "cover" }} />
                            : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:t.textMuted }}>No image</div>
                          }
                          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 55%, " + (dark ? "#1C1C30" : "#ffffff") + " 100%)", pointerEvents: "none" }} />
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: sc }} />
                        </div>
                        <div className="card-body" style={{ flex: 1, padding: "18px 20px" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                            <div>
                              <div style={{ fontSize: 15, fontWeight: 800, color: t.textPri, marginBottom: 3 }}>{name}</div>
                              <div style={{ fontSize: 10, color: t.textMuted }}>{b.car?.plate_number ?? "—"} · {b.id.slice(0,8).toUpperCase()}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: 17, fontWeight: 800, color: t.textPri }}>{fmtCurrency(b.total_amount)}</div>
                              <span style={{ fontSize: 10, fontWeight: 700, color: sc, background: sc + "18", border: `1px solid ${sc}30`, borderRadius: 20, padding: "3px 10px" }}>{capitalize(b.status)}</span>
                            </div>
                          </div>
                          <div className="kpi-grid" style={{ gap: 8 }}>
                            {[{ label:"Start", value:fmtDate(b.start_date) },{ label:"End", value:fmtDate(b.end_date) },{ label:"Pickup", value:b.pickup_location },{ label:"Drop-off", value:b.dropoff_location }].map(row => (
                              <div key={row.label} style={{ background: t.bg, borderRadius: 7, border: `1px solid ${t.border}`, padding: "8px 10px" }}>
                                <div style={{ fontSize: 9, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>{row.label}</div>
                                <div style={{ fontSize: 11, fontWeight: 600, color: t.textPri, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.value}</div>
                              </div>
                            ))}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTop: `1px solid ${t.divider}` }}>
                            <div style={{ fontSize: 11, color: t.textMuted }}><span style={{ fontWeight: 600 }}>{days} day{days > 1 ? "s" : ""}</span> · ${b.daily_rate}/day</div>
                            <button onClick={() => router.push(b.booking_type === "buy" ? "/customer/buy-car" : "/customer/rent-car")}
                              style={{ fontSize: 11, fontWeight: 600, color: t.accent, background: "none", border: `1px solid ${t.border}`, borderRadius: 7, padding: "5px 12px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                              {b.booking_type === "buy" ? "Buy Again" : "Rent Again"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </CustomerShell>
  );
}
