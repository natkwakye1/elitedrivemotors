"use client";
// src/app/dashboard/super-admin/reports/page.tsx
import { useTheme } from "@/src/context/ThemeContext";
import { useState, useMemo } from "react";

import AppShell    from "@/src/components/layout/Appshell";
import TopBar      from "@/src/components/layout/Topbar";
import AdminSidebar from "@/src/components/layout/AdminSidebar";
import type { AdminFilters } from "@/src/components/layout/AdminSidebar";
import { Ic } from "@/src/components/ui/Icons";

// ─── Data ────────────────────────────────────────────────────────────────────
const REPORTS = [
  { title: "Monthly Revenue Report",    desc: "Full breakdown of rental and sales revenue",    date: "Jun 2025", period: "Jun 2025", size: "2.4 MB", type: "PDF"  },
  { title: "Fleet Utilisation Report",  desc: "Vehicle usage rates, idle time, mileage stats", date: "Jun 2025", period: "Jun 2025", size: "1.1 MB", type: "PDF"  },
  { title: "User Activity Report",      desc: "New registrations, active users, churn rate",   date: "Jun 2025", period: "Jun 2025", size: "890 KB", type: "XLSX" },
  { title: "Payments Reconciliation",   desc: "All transactions, outstanding balances",        date: "May 2025", period: "May 2025", size: "3.2 MB", type: "XLSX" },
  { title: "Swap Analysis Report",      desc: "Swap requests, approval rates, value trends",   date: "May 2025", period: "May 2025", size: "760 KB", type: "PDF"  },
  { title: "Q1 Performance Summary",    desc: "Quarterly KPIs across all business units",      date: "Mar 2025", period: "Mar 2025", size: "5.8 MB", type: "PDF"  },
];

const METRICS = [
  { label: "Revenue Growth",       value: "↑ 12.4%", sub: "vs last month",     bar: 72, color: "#10B981" },
  { label: "Fleet Utilisation",    value: "78.3%",   sub: "of fleet active",   bar: 78, color: "#4F46E5" },
  { label: "Rental Completion",    value: "94.1%",   sub: "bookings fulfilled", bar: 94, color: "#10B981" },
  { label: "Payment Collection",   value: "88.6%",   sub: "invoices settled",   bar: 89, color: "#F59E0B" },
  { label: "Customer Satisfaction",value: "4.7/5",   sub: "avg rating",         bar: 94, color: "#4F46E5" },
  { label: "Swap Approval Rate",   value: "66.7%",   sub: "of requests",        bar: 67, color: "#8B5CF6" },
];

const TYPES   = ["PDF", "XLSX"];
const PERIODS = ["Jun 2025", "May 2025", "Mar 2025"];

const TYPE_COLOR: Record<string, string> = { PDF: "#EF4444", XLSX: "#10B981" };

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminReportsPage() {
  const { dark, setDark, t } = useTheme();
  const [filters, setFilters] = useState<AdminFilters>({ search: "", type: "All", period: "All" });

  const typeCounts = useMemo(() => {
    const c: Record<string, number> = {};
    TYPES.forEach(tp => { c[tp] = REPORTS.filter(r => r.type === tp).length; });
    return c;
  }, []);

  const periodCounts = useMemo(() => {
    const c: Record<string, number> = {};
    PERIODS.forEach(p => { c[p] = REPORTS.filter(r => r.period === p).length; });
    return c;
  }, []);

  const filtered = useMemo(() => REPORTS.filter(r => {
    if (filters.type   !== "All" && r.type   !== filters.type)   return false;
    if (filters.period !== "All" && r.period !== filters.period) return false;
    if (filters.search) {
      const q = (filters.search as string).toLowerCase();
      if (!r.title.toLowerCase().includes(q) && !r.desc.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [filters]);

  return (
    <AppShell active="Reports" dark={dark} setDark={setDark} t={t}>
      <TopBar
        title="Reports & Analytics"
        subtitle="Platform performance overview and downloadable reports"
        dark={dark} setDark={setDark} t={t}
        actions={
          <button
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "none", background: t.accent, color: t.accentFg, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
          >
            <span style={{ display: "flex" }}>{Ic.Plus(t.accentFg)}</span>
            Generate Report
          </button>
        }
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── Filter sidebar ── */}
        <AdminSidebar
          filters={filters}
          setFilters={setFilters}
          searchPlaceholder="Search reports…"
          t={t}
          groups={[
            { key: "type",   label: "File Type", options: TYPES,   colors: TYPE_COLOR, counts: typeCounts   },
            { key: "period", label: "Period",     options: PERIODS,                     counts: periodCounts },
          ]}
        />

        {/* ── Main content ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", background: t.bg }}>

          {/* KPI strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
            {[
              { l: "Revenue YTD",   v: "$248,290", icon: (c: string) => Ic.Payment(c),  color: "#10B981" },
              { l: "Total Rentals", v: "412",       icon: (c: string) => Ic.Booking(c),  color: t.textPri },
              { l: "Total Sales",   v: "28",        icon: (c: string) => Ic.Buy(c),      color: t.textPri },
              { l: "Active Users",  v: "1,204",     icon: (c: string) => Ic.Profile(c),  color: t.textPri },
            ].map(s => (
              <div key={s.l}
                style={{ background: t.cardBg, borderRadius: 12, border: `1px solid ${t.border}`, padding: "16px 20px", transition: "border-color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = t.accent)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = t.border)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, fontFamily: "'DM Sans',sans-serif" }}>{s.l}</span>
                  <span style={{ display: "flex", opacity: 0.35 }}>{s.icon(t.textMuted)}</span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: "'DM Sans',sans-serif" }}>{s.v}</div>
              </div>
            ))}
          </div>

          {/* Key Metrics card */}
          <div style={{ background: t.cardBg, borderRadius: 14, border: `1px solid ${t.border}`, padding: "22px 24px", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: t.textPri, fontFamily: "'DM Sans',sans-serif" }}>Key Metrics — June 2025</span>
              <span style={{ fontSize: 11, color: t.textMuted, background: t.bg, border: `1px solid ${t.border}`, borderRadius: 20, padding: "3px 11px", fontFamily: "'DM Sans',sans-serif" }}>YTD</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 32px" }}>
              {METRICS.map(m => (
                <div key={m.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7, fontFamily: "'DM Sans',sans-serif" }}>
                    <span style={{ fontSize: 12, color: t.textSec }}>{m.label}</span>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 800, color: t.textPri }}>{m.value}</span>
                      <span style={{ fontSize: 10, color: t.textMuted, marginLeft: 6 }}>{m.sub}</span>
                    </div>
                  </div>
                  <div style={{ height: 5, background: dark ? "#1e1e1e" : "#ebebeb", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${m.bar}%`, background: m.color, borderRadius: 3, transition: "width 0.5s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reports list */}
          <div style={{ background: t.cardBg, borderRadius: 14, border: `1px solid ${t.border}`, overflow: "hidden" }}>
            {/* Header row */}
            <div style={{ padding: "12px 22px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: t.textPri, fontFamily: "'DM Sans',sans-serif" }}>Available Reports</span>
              <span style={{ fontSize: 11, color: t.textMuted, fontFamily: "'DM Sans',sans-serif" }}>
                Showing <strong style={{ color: t.textPri }}>{filtered.length}</strong> of {REPORTS.length}
              </span>
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: 48, textAlign: "center", color: t.textMuted, fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>
                No reports match your filters.
              </div>
            ) : (
              filtered.map((r, i) => {
                const tc = TYPE_COLOR[r.type] ?? t.textMuted;
                return (
                  <div key={r.title}
                    style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 22px", borderBottom: i < filtered.length - 1 ? `1px solid ${t.divider}` : "none", transition: "background 0.12s", fontFamily: "'DM Sans',sans-serif" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = t.navActiveBg; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                  >
                    {/* Type badge icon */}
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: tc + "14", border: `1px solid ${tc}28`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, gap: 1 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, color: tc, letterSpacing: 0.5 }}>{r.type}</span>
                      <div style={{ width: 18, height: 1.5, borderRadius: 1, background: tc + "60" }} />
                      <div style={{ width: 12, height: 1.5, borderRadius: 1, background: tc + "40" }} />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: t.textPri, marginBottom: 3 }}>{r.title}</div>
                      <div style={{ fontSize: 11, color: t.textMuted, display: "flex", alignItems: "center", gap: 10 }}>
                        <span>{r.desc}</span>
                        <span style={{ color: t.divider }}>·</span>
                        <span style={{ fontWeight: 600, color: t.textSec }}>{r.date}</span>
                        <span style={{ color: t.divider }}>·</span>
                        <span>{r.size}</span>
                      </div>
                    </div>

                    {/* Period pill */}
                    <span style={{ fontSize: 10, fontWeight: 600, color: t.textSec, background: t.bg, border: `1px solid ${t.border}`, borderRadius: 20, padding: "3px 11px", flexShrink: 0 }}>
                      {r.period}
                    </span>

                    {/* Download button */}
                    <button
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.textSec, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", flexShrink: 0, transition: "border-color 0.15s, color 0.15s" }}
                      onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = t.accent; b.style.color = t.accent; }}
                      onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = t.border; b.style.color = t.textSec; }}
                    >
                      <span style={{ display: "flex", opacity: 0.6 }}>{Ic.Download(t.textSec)}</span>
                      Download
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
