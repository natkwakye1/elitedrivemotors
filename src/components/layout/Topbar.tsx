"use client";
// src/components/layout/TopBar.tsx
// ─────────────────────────────────────────────────────────────────────────────
// General-purpose top bar used by all admin/dashboard pages.
// Shows page title + optional subtitle, optional action slot, dark toggle.

import { Ic } from "@/src/components/ui/Icons";
import { Theme } from "@/src/lib/theme";

interface Props {
  title:       string;
  subtitle?:   string;
  breadcrumb?: string[]; // kept for compatibility but ignored
  dark:        boolean;
  setDark:     (v: boolean) => void;
  t:           Theme;
  actions?:    React.ReactNode;
}

export default function TopBar({ title, subtitle, dark, setDark, t, actions }: Props) {
  return (
    <div style={{
      height: 52, flexShrink: 0,
      borderBottom: `1px solid ${t.border}`,
      background: t.cardBg,
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Left — title + subtitle */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, minWidth: 0 }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: t.textPri, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {title}
        </span>
        {subtitle && (
          <span style={{ fontSize: 11, color: t.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {subtitle}
          </span>
        )}
      </div>

      {/* Right — optional actions + dark toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        {actions}
        <button
          onClick={() => setDark(!dark)}
          style={{
            width: 34, height: 34, borderRadius: 8,
            border: `1px solid ${t.border}`,
            background: t.bg,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}
        >
          {dark ? Ic.Sun(t.textMuted) : Ic.Moon(t.textMuted)}
        </button>
      </div>
    </div>
  );
}
