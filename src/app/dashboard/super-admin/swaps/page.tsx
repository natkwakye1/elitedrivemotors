"use client";
// src/app/dashboard/super-admin/swaps/page.tsx
import { useTheme } from "@/src/context/ThemeContext";
import { useState, useMemo } from "react";

import AppShell    from "@/src/components/layout/Appshell";
import TopBar      from "@/src/components/layout/Topbar";
import AdminSidebar from "@/src/components/layout/AdminSidebar";
import type { AdminFilters } from "@/src/components/layout/AdminSidebar";

const SWAPS = [
  { id:"SW-84921", customer:"Kwame Asante",   avatar:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&q=80", from:"Audi A4 2022",        to:"BMW 3 Series 2023",    date:"2025-06-10", status:"pending",   topUp:"+$13,400" },
  { id:"SW-73310", customer:"Abena Osei",     avatar:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=48&q=80", from:"Tesla Model S",        to:"Porsche Macan 2023",   date:"2025-06-08", status:"approved",  topUp:"+$9,000"  },
  { id:"SW-61204", customer:"Ama Darko",      avatar:"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=48&q=80", from:"Mini Countryman 2020", to:"VW Tiguan 2022",       date:"2025-06-05", status:"rejected",  topUp:"-$2,000"  },
  { id:"SW-58832", customer:"Yaw Boateng",    avatar:"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&q=80", from:"Ford Focus ST",        to:"Mazda 6 2022",         date:"2025-06-03", status:"pending",   topUp:"+$4,200"  },
  { id:"SW-44510", customer:"Efua Asare",     avatar:"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=48&q=80", from:"BMW 3 Series 2020",    to:"Mercedes C-Class 2023",date:"2025-06-01", status:"approved",  topUp:"+$17,500" },
  { id:"SW-39981", customer:"Nana Adjei",     avatar:"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=48&q=80", from:"Honda Accord 2021",    to:"Toyota Camry 2023",    date:"2025-05-29", status:"completed", topUp:"+$3,800"  },
];

const STATUS_COLOR: Record<string, string> = {
  pending:   "#F59E0B",
  approved:  "#10B981",
  completed: "#4F46E5",
  rejected:  "#EF4444",
};
const STATUSES = ["pending", "approved", "completed", "rejected"];

const SS: Record<string, { bg: string; color: string }> = {
  pending:   { bg: "rgba(245,158,11,0.12)",  color: "#F59E0B" },
  approved:  { bg: "rgba(16,185,129,0.12)",  color: "#10B981" },
  completed: { bg: "rgba(79,70,229,0.12)",   color: "#4F46E5" },
  rejected:  { bg: "rgba(239,68,68,0.12)",   color: "#EF4444" },
};

export default function AdminSwapsPage() {
  const { dark, setDark, t } = useTheme();
  const [filters, setFilters] = useState<AdminFilters>({ search: "", status: "All" });

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = {};
    STATUSES.forEach(s => { c[s] = SWAPS.filter(sw => sw.status === s).length; });
    return c;
  }, []);

  const filtered = useMemo(() => SWAPS.filter(sw => {
    if (filters.status !== "All" && sw.status !== filters.status) return false;
    if (filters.search) {
      const q = (filters.search as string).toLowerCase();
      if (
        !sw.customer.toLowerCase().includes(q) &&
        !sw.from.toLowerCase().includes(q) &&
        !sw.to.toLowerCase().includes(q) &&
        !sw.id.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  }), [filters]);

  const pendingCount   = statusCounts.pending   ?? 0;
  const approvedCount  = statusCounts.approved  ?? 0;
  const completedCount = statusCounts.completed ?? 0;
  const rejectedCount  = statusCounts.rejected  ?? 0;

  return (
    <AppShell active="All Swaps" dark={dark} setDark={setDark} t={t}>
      <TopBar
        title="Swap Requests"
        subtitle={`${SWAPS.length} total · ${pendingCount} pending review`}
        dark={dark} setDark={setDark} t={t}
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        <AdminSidebar
          filters={filters}
          setFilters={setFilters}
          searchPlaceholder="Search swaps…"
          t={t}
          groups={[{
            key:     "status",
            label:   "Status",
            options: STATUSES,
            colors:  STATUS_COLOR,
            counts:  statusCounts,
          }]}
        />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", background: t.bg }}>

          {/* KPI strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
            {[
              { l: "Total",     v: SWAPS.length,    color: t.textPri    },
              { l: "Pending",   v: pendingCount,     color: "#F59E0B"    },
              { l: "Approved",  v: approvedCount,    color: "#10B981"    },
              { l: "Completed", v: completedCount,   color: "#4F46E5"    },
            ].map(s => (
              <div key={s.l} style={{ background: t.cardBg, borderRadius: 12, border: `1px solid ${t.border}`, padding: "16px 20px" }}>
                <div style={{ fontSize: 11, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, fontFamily: "'DM Sans',sans-serif" }}>{s.l}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: "'DM Sans',sans-serif" }}>{s.v}</div>
              </div>
            ))}
          </div>

          {/* Results count */}
          <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 16, fontFamily: "'DM Sans',sans-serif" }}>
            Showing <strong style={{ color: t.textPri }}>{filtered.length}</strong> of {SWAPS.length} requests
          </div>

          {/* Table card */}
          <div style={{ background: t.cardBg, borderRadius: 14, border: `1px solid ${t.border}`, overflow: "hidden" }}>
            {/* Table header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "110px 1.2fr 2.2fr 100px 1fr 120px",
              padding: "12px 20px",
              borderBottom: `1px solid ${t.border}`,
              fontSize: 11, fontWeight: 600, color: t.textMuted,
              textTransform: "uppercase", letterSpacing: 1,
              fontFamily: "'DM Sans',sans-serif",
            }}>
              <span>ID</span>
              <span>Customer</span>
              <span>Vehicle Swap</span>
              <span>Date</span>
              <span>Top-Up</span>
              <span>Status</span>
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: t.textMuted, fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>
                No swap requests match your filters.
              </div>
            ) : (
              filtered.map((sw, i) => {
                const sc = SS[sw.status];
                return (
                  <div key={sw.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "110px 1.2fr 2.2fr 100px 1fr 120px",
                      padding: "14px 20px",
                      borderBottom: i < filtered.length - 1 ? `1px solid ${t.divider}` : "none",
                      alignItems: "center",
                      fontSize: 13,
                      fontFamily: "'DM Sans',sans-serif",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = t.navActiveBg; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                  >
                    {/* ID */}
                    <span style={{ color: t.textMuted, fontSize: 11, fontFamily: "monospace" }}>{sw.id}</span>

                    {/* Customer */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <img src={sw.avatar} alt="" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                      <span style={{ color: t.textPri, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sw.customer}</span>
                    </div>

                    {/* Vehicle swap */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <span style={{ background: t.tagBg, borderRadius: 5, padding: "2px 8px", border: `1px solid ${t.tagBorder}`, color: t.textSec, fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sw.from}</span>
                      <span style={{ color: t.textMuted, fontSize: 13, flexShrink: 0 }}>→</span>
                      <span style={{ background: t.tagBg, borderRadius: 5, padding: "2px 8px", border: `1px solid ${t.tagBorder}`, color: t.textSec, fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sw.to}</span>
                    </div>

                    {/* Date */}
                    <span style={{ color: t.textMuted, fontSize: 12 }}>{sw.date}</span>

                    {/* Top-up */}
                    <span style={{ fontWeight: 700, fontSize: 14, color: sw.topUp.startsWith("+") ? t.textPri : "#EF4444" }}>{sw.topUp}</span>

                    {/* Status + actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, background: sc.bg, color: sc.color, borderRadius: 20, padding: "3px 10px", fontWeight: 700, textTransform: "capitalize", whiteSpace: "nowrap" }}>{sw.status}</span>
                      {sw.status === "pending" && (
                        <>
                          <button style={{ padding: "4px 9px", borderRadius: 6, border: "none", background: "rgba(16,185,129,0.14)", color: "#10B981", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>✓ Approve</button>
                          <button style={{ padding: "4px 9px", borderRadius: 6, border: "none", background: "rgba(239,68,68,0.12)", color: "#EF4444", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>✕ Reject</button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Rejected count note */}
          {rejectedCount > 0 && (
            <div style={{ marginTop: 16, padding: "10px 16px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: 9, fontSize: 12, color: "#EF4444", fontFamily: "'DM Sans',sans-serif" }}>
              {rejectedCount} swap request{rejectedCount !== 1 ? "s" : ""} rejected · review history for details
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
