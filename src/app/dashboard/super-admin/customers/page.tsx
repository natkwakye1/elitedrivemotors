"use client";
import { useTheme } from "@/src/context/ThemeContext";
// src/app/dashboard/super-admin/customers/page.tsx

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/src/components/layout/Appshell";
import TopBar from "@/src/components/layout/Topbar";
import AdminSidebar from "@/src/components/layout/AdminSidebar";
import type { AdminFilters } from "@/src/components/layout/AdminSidebar";
import { MOCK_CUSTOMERS } from "@/src/context/Customerauthcontext";

const PLANS = ["Standard", "Pro"];
const PLAN_COLOR: Record<string, string> = { Standard: "#10B981", Pro: "#4F46E5" };

export default function CustomersPage() {
  const router = useRouter();
  const { dark, setDark, t } = useTheme();
  const [filters, setFilters] = useState<AdminFilters>({ search: "", plan: "All" });

  const planCounts = useMemo(() => ({
    Standard: MOCK_CUSTOMERS.filter(c => c.plan === "Standard").length,
    Pro:      MOCK_CUSTOMERS.filter(c => c.plan === "Pro").length,
  }), []);

  const filtered = useMemo(() => MOCK_CUSTOMERS.filter(c => {
    if (filters.search) {
      const q = (filters.search as string).toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q)) return false;
    }
    if (filters.plan !== "All" && c.plan !== filters.plan) return false;
    return true;
  }), [filters]);

  return (
    <AppShell active="Customers" dark={dark} setDark={setDark} t={t}>
      <TopBar
        title="Customers"
        subtitle="All registered customers"
        breadcrumb={["dashboard", "super-admin", "Customers"]}
        dark={dark} setDark={setDark} t={t}
      />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <AdminSidebar
          filters={filters}
          setFilters={setFilters}
          searchPlaceholder="Search customers…"
          t={t}
          groups={[
            { key: "plan", label: "Plan", options: PLANS, colors: PLAN_COLOR, counts: planCounts },
          ]}
        />
        <div style={{ flex: 1, overflowY: "auto", padding: 24, background: t.bg }}>
          <div style={{ background: t.cardBg, borderRadius: 14, border: `1px solid ${t.border}`, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr", padding: "10px 20px", borderBottom: `1px solid ${t.border}`, background: t.bg }}>
              {["Name", "Email", "Phone", "Plan", "Actions"].map(h => (
                <span key={h} style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>{h}</span>
              ))}
            </div>
            {filtered.map((c, i) => (
              <div key={c.id} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr", padding: "14px 20px", borderBottom: i < filtered.length - 1 ? `1px solid ${t.divider}` : "none", alignItems: "center", transition: "background 0.12s" }}
                onMouseEnter={e => (e.currentTarget.style.background = t.navActiveBg)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: t.accent + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: t.accent, flexShrink: 0 }}>{c.avatar}</div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.textPri }}>{c.name}</span>
                </div>
                <span style={{ fontSize: 12, color: t.textSec }}>{c.email}</span>
                <span style={{ fontSize: 12, color: t.textSec }}>{c.phone}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: c.plan === "Pro" ? t.accent : "#10B981", background: c.plan === "Pro" ? t.accent + "15" : "rgba(16,185,129,0.12)", borderRadius: 20, padding: "3px 10px", width: "fit-content" }}>{c.plan}</span>
                <button
                  onClick={() => router.push(`/dashboard/super-admin/customers/profile?id=${c.id}`)}
                  style={{ fontSize: 11, fontWeight: 600, color: t.accent, background: "none", border: `1px solid ${t.border}`, borderRadius: 7, padding: "5px 12px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", width: "fit-content" }}
                >
                  View
                </button>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: 40, textAlign: "center", color: t.textMuted, fontSize: 13 }}>No customers found.</div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
