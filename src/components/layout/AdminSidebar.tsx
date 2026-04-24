"use client";
// src/components/layout/AdminSidebar.tsx
// Reusable vertical filter sidebar for admin data pages.
// Supports slide-in / slide-out collapse via a toggle button.

import { useState } from "react";
import { Ic } from "@/src/components/ui/Icons";

// ── Chevrons ──────────────────────────────────────────────────────────────────
function ChevronDown({ color }: { color: string }) {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5L7 9L11 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function ChevronUp({ color }: { color: string }) {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 9L7 5L11 9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

// ── Collapsible Section ───────────────────────────────────────────────────────
function Section({ title, children, t, defaultOpen = true }: {
  title: string; children: React.ReactNode; t: any; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: `1px solid ${t.divider}` }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0 9px", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
      >
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: t.textMuted }}>{title}</span>
        {open ? <ChevronUp color={t.textMuted} /> : <ChevronDown color={t.textMuted} />}
      </button>
      {open && <div style={{ paddingBottom: 14 }}>{children}</div>}
    </div>
  );
}

// ── Check SVG ─────────────────────────────────────────────────────────────────
function Check() {
  return <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3L3.5 5.5L8 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

// ── Filter group config ───────────────────────────────────────────────────────
export interface FilterGroup {
  key:      string;
  label:    string;
  options:  string[];
  colors?:  Record<string, string>;
  multi?:   boolean;
  counts?:  Record<string, number>;
}

export interface AdminFilters {
  search:  string;
  [key: string]: string | string[];
}

interface Props {
  filters:    AdminFilters;
  setFilters: (f: AdminFilters) => void;
  groups:     FilterGroup[];
  t:          any;
  searchPlaceholder?: string;
}

export default function AdminSidebar({ filters, setFilters, groups, t, searchPlaceholder = "Search…" }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  const hasActive = groups.some(g => {
    const val = filters[g.key];
    if (Array.isArray(val)) return val.length > 0;
    return val !== "All";
  }) || filters.search !== "";

  return (
    <div style={{
      width: collapsed ? 40 : 230,
      flexShrink: 0,
      background: t.cardBg,
      borderRight: `1px solid ${t.border}`,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      fontFamily: "'DM Sans',sans-serif",
      transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
      position: "relative",
    }}>

      {/* ── Toggle strip (always visible) ── */}
      <div style={{
        height: 52,
        flexShrink: 0,
        borderBottom: `1px solid ${t.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        padding: collapsed ? 0 : "0 16px",
      }}>
        {!collapsed && (
          <span style={{ fontSize: 14, fontWeight: 700, color: t.textPri }}>Filter by</span>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!collapsed && hasActive && (
            <button onClick={() => {
              const reset: AdminFilters = { search: "" };
              groups.forEach(g => { reset[g.key] = g.multi ? [] : "All"; });
              setFilters(reset);
            }}
              style={{ fontSize: 10, color: t.textMuted, background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 3 }}>
              Reset
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 2L10 10M10 2L2 10" stroke={t.textMuted} strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? "Expand filters" : "Collapse filters"}
            style={{
              width: 26, height: 26,
              borderRadius: 7,
              border: `1px solid ${t.border}`,
              background: t.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              transition: "border-color 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = t.accent; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = t.border; }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              {collapsed
                ? <path d="M2 4L6.5 8.5L11 4" stroke={t.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" transform="rotate(-90 6.5 6.5)"/>
                : <path d="M2 4L6.5 8.5L11 4" stroke={t.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" transform="rotate(90 6.5 6.5)"/>
              }
            </svg>
          </button>
        </div>
      </div>

      {/* ── Filter content (hidden when collapsed) ── */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        padding: collapsed ? 0 : "0 14px 24px",
        opacity: collapsed ? 0 : 1,
        pointerEvents: collapsed ? "none" : "auto",
        transition: "opacity 0.15s ease",
      }}>

        {/* Search */}
        <Section title="Search" t={t}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", display: "flex", opacity: 0.4 }}>{Ic.Search(t.textMuted)}</span>
            <input
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              placeholder={searchPlaceholder}
              style={{ width: "100%", padding: "8px 10px 8px 30px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.textPri, fontSize: 12, outline: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box" }}
              onFocus={e => (e.target.style.borderColor = t.accent)}
              onBlur={e => (e.target.style.borderColor = t.border)}
            />
          </div>
        </Section>

        {/* Filter groups */}
        {groups.map(g => {
          const val = filters[g.key];

          if (g.multi) {
            const selected = Array.isArray(val) ? val : [];
            return (
              <Section key={g.key} title={g.label} t={t}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {g.options.map(opt => {
                    const on = selected.includes(opt);
                    const color = g.colors?.[opt] ?? t.accent;
                    return (
                      <div key={opt}
                        onClick={() => {
                          const next = on ? selected.filter(x => x !== opt) : [...selected, opt];
                          setFilters({ ...filters, [g.key]: next });
                        }}
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 2px", cursor: "pointer" }}
                      >
                        <div style={{ width: 16, height: 16, borderRadius: 3, border: `1.5px solid ${on ? color : t.border}`, background: on ? color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.13s" }}>
                          {on && <Check />}
                        </div>
                        <span style={{ fontSize: 12, color: on ? t.textPri : t.textSec, fontWeight: on ? 600 : 400, userSelect: "none", flex: 1 }}>{opt}</span>
                        {g.counts && g.counts[opt] !== undefined && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, background: t.bg, borderRadius: 10, padding: "1px 7px", border: `1px solid ${t.border}` }}>{g.counts[opt]}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Section>
            );
          }

          const current = typeof val === "string" ? val : "All";
          return (
            <Section key={g.key} title={g.label} t={t}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {["All", ...g.options].map(opt => {
                  const on = current === opt;
                  const color = opt === "All" ? t.accent : (g.colors?.[opt] ?? t.accent);
                  return (
                    <div key={opt}
                      onClick={() => setFilters({ ...filters, [g.key]: opt })}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 8, cursor: "pointer", background: on ? color + "14" : "transparent", border: `1px solid ${on ? color + "44" : "transparent"}`, transition: "all 0.13s" }}
                    >
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: on ? color : t.border, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: on ? color : t.textSec, fontWeight: on ? 700 : 500, flex: 1 }}>{opt}</span>
                      {g.counts && g.counts[opt] !== undefined && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: on ? color : t.textMuted }}>{g.counts[opt]}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>
          );
        })}
      </div>

      {/* ── Collapsed indicator dots (active filters) ── */}
      {collapsed && hasActive && (
        <div style={{ position: "absolute", top: 14, right: 6, width: 7, height: 7, borderRadius: "50%", background: t.accent }} />
      )}
    </div>
  );
}
