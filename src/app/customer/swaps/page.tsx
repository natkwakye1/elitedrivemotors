"use client";
// src/app/customer/swaps/page.tsx

import { useTheme } from "@/src/context/ThemeContext";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CustomerShell from "@/src/components/layout/Customershell";
import { Ic } from "@/src/components/ui/Icons";
import { useCustomerAuth } from "@/src/context/Customerauthcontext";
import { useSwaps } from "@/src/hooks/useApi";
import type { ApiSwap } from "@/src/lib/api";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
function carName(car?: { make: string; model: string } | null) {
  return car ? `${car.make} ${car.model}` : "Unknown Vehicle";
}

const STATUS_COLOR: Record<string, string> = {
  Pending: "#F59E0B", Approved: "#10B981", Completed: "#4F46E5", Rejected: "#EF4444",
};
const STATUSES = ["All", "Pending", "Approved", "Completed", "Rejected"];

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

export default function CustomerSwapsPage() {
  const router = useRouter();
  const { t } = useTheme();
  const { customer } = useCustomerAuth();
  const { swaps, loading } = useSwaps();
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  if (!customer) return null;

  const all = swaps;
  const filtered = useMemo(() => all.filter((s: ApiSwap) => {
    if (status !== "All" && capitalize(s.status) !== status) return false;
    const offeredName = carName(s.offered_car).toLowerCase();
    const wantedName  = carName(s.wanted_car).toLowerCase();
    if (search && !offeredName.includes(search.toLowerCase()) && !wantedName.includes(search.toLowerCase())) return false;
    return true;
  }), [all, status, search]);

  const hasFilter = status !== "All" || !!search;
  const inputStyle: React.CSSProperties = { width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.textPri, fontSize: 12, outline: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box" };

  return (
    <CustomerShell title="My Swaps" subtitle={loading ? "Loading…" : `${all.length} swap request${all.length !== 1 ? "s" : ""}`}
      actions={
        <button onClick={() => router.push("/customer/swap-car")}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "none", background: t.accent, color: t.accentFg, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
          <span style={{ display: "flex" }}>{Ic.Swap(t.accentFg)}</span>New Swap Request
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
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by vehicle name…"
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
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"60%", color:t.textMuted, fontSize:13 }}>Loading swaps…</div>
          ) : all.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60%", gap: 16 }}>
              <div style={{ width: 60, height: 60, borderRadius: 16, background: t.cardBg, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ display: "flex", opacity: 0.4 }}>{Ic.Swap(t.textMuted)}</span>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.textPri, marginBottom: 6 }}>No swap requests yet</div>
                <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 18 }}>Submit a swap request to exchange your vehicle for another.</div>
                <button onClick={() => router.push("/customer/swap-car")}
                  style={{ padding: "10px 22px", borderRadius: 9, border: "none", background: t.accent, color: t.accentFg, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                  Submit a Swap Request
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* KPI strip */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 4 }}>
                {[
                  { label: "Pending",   value: all.filter((s: ApiSwap) => s.status === "pending").length,   color: "#F59E0B" },
                  { label: "Approved",  value: all.filter((s: ApiSwap) => s.status === "approved").length,  color: "#10B981" },
                  { label: "Completed", value: all.filter((s: ApiSwap) => s.status === "completed").length, color: "#4F46E5" },
                  { label: "Rejected",  value: all.filter((s: ApiSwap) => s.status === "rejected").length,  color: "#EF4444" },
                ].map(kpi => (
                  <div key={kpi.label} style={{ background: t.cardBg, borderRadius: 12, border: `1px solid ${t.border}`, padding: "14px 18px" }}>
                    <div style={{ fontSize: 9, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, marginBottom: 6 }}>{kpi.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: t.textMuted }}>
                Showing <strong style={{ color: t.textPri }}>{filtered.length}</strong> of {all.length} requests
              </div>
              {filtered.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: t.textMuted, fontSize: 13, background: t.cardBg, borderRadius: 12, border: `1px solid ${t.border}` }}>No swap requests match your filters.</div>
              ) : (
                filtered.map((s: ApiSwap) => {
                  const statusLabel = capitalize(s.status);
                  const sc  = STATUS_COLOR[statusLabel] ?? t.textMuted;
                  const sbg = sc + "12";
                  const offeredName = carName(s.offered_car);
                  const wantedName  = carName(s.wanted_car);
                  return (
                    <div key={s.id}
                      style={{ background: t.cardBg, borderRadius: 14, border: `1px solid ${t.border}`, padding: "20px 22px", transition: "border-color 0.15s, transform 0.15s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = t.accent; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = t.border; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                        <div style={{ fontSize: 11, color: t.textMuted }}>{s.id.slice(0, 8).toUpperCase()} · {fmtDate(s.created_at)}</div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: sc, background: sbg, border: `1px solid ${sc}30`, borderRadius: 20, padding: "4px 12px" }}>{statusLabel}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        {/* Offered car */}
                        <div style={{ flex: 1, display: "flex", gap: 12, alignItems: "center", padding: "14px", background: t.bg, borderRadius: 10, border: `1px solid ${t.border}` }}>
                          <div style={{ position: "relative", width: 72, height: 54, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: t.cardBg }}>
                            {s.offered_car?.cover_image_url
                              ? <Image src={s.offered_car.cover_image_url} alt={offeredName} fill sizes="72px" style={{ objectFit: "cover" }} />
                              : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:t.textMuted }}>No img</div>
                            }
                          </div>
                          <div>
                            <div style={{ fontSize: 10, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 3 }}>Offering</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: t.textPri, marginBottom: 3 }}>{offeredName}</div>
                            <div style={{ fontSize: 10, color: t.textMuted }}>{s.offered_car?.plate_number ?? "—"}</div>
                          </div>
                        </div>
                        <div style={{ flexShrink: 0 }}><span style={{ display: "flex" }}>{Ic.Swap(t.textMuted)}</span></div>
                        {/* Wanted car */}
                        <div style={{ flex: 1, padding: "14px", background: t.accent + "08", borderRadius: 10, border: `1px solid ${t.accent}20` }}>
                          <div style={{ fontSize: 10, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 3 }}>Wanting</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: t.textPri, marginBottom: 3 }}>{wantedName}</div>
                          <div style={{ fontSize: 10, color: t.textMuted }}>{s.wanted_car?.plate_number ?? "—"}</div>
                        </div>
                      </div>
                      {s.top_up_amount > 0 && (
                        <div style={{ marginTop: 10, padding: "8px 12px", background: t.bg, borderRadius: 8, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 10, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Top-up:</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: t.textPri }}>${s.top_up_amount.toLocaleString(undefined, { minimumFractionDigits:2, maximumFractionDigits:2 })}</span>
                        </div>
                      )}
                      {s.message && (
                        <div style={{ marginTop: 10, padding: "10px 12px", background: t.bg, borderRadius: 8, border: `1px solid ${t.border}` }}>
                          <div style={{ fontSize: 10, color: t.textMuted, marginBottom: 3 }}>Note</div>
                          <div style={{ fontSize: 12, color: t.textSec, fontStyle: "italic" }}>{s.message}</div>
                        </div>
                      )}
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12, paddingTop: 12, borderTop: `1px solid ${t.divider}` }}>
                        <button onClick={() => router.push("/customer/swap-car")}
                          style={{ fontSize: 11, fontWeight: 600, color: t.accent, background: "none", border: `1px solid ${t.border}`, borderRadius: 7, padding: "5px 12px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                          New Swap
                        </button>
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
