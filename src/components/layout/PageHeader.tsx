"use client";
// src/components/layout/PageHeader.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Sticky top bar used on every page (replaces the cars-specific TopBar).
// Shows title, optional subtitle, action slot (buttons/controls), theme toggle.

import { Theme } from "@/src/lib/theme";
import { Ic } from "@/src/components/ui/Icons";

interface PageHeaderProps {
  title:       string;
  subtitle?:   string;
  breadcrumb?: string[];
  dark: boolean;
  setDark: (v: boolean) => void;
  t: Theme;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, breadcrumb, dark, setDark, t, actions }: PageHeaderProps) {
  return (
    <div style={{ background: t.topBarBg, borderBottom: `1px solid ${t.border}`, padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10, flexShrink: 0 }}>
      <div>
        {breadcrumb && breadcrumb.length > 0 ? (
          <div style={{ display: "flex", alignItems: "baseline", gap: 0, flexWrap: "nowrap" }}>
            {breadcrumb.map((segment, i) => {
              const isLast = i === breadcrumb.length - 1;
              return (
                <span key={i} style={{ display: "flex", alignItems: "baseline" }}>
                  {i > 0 && (
                    <span style={{ fontSize: 15, color: t.textMuted, margin: "0 6px", fontWeight: 400, fontFamily: "'DM Sans',sans-serif" }}>/</span>
                  )}
                  <span style={{
                    fontSize: isLast ? 20 : 15,
                    fontWeight: isLast ? 800 : 400,
                    color: isLast ? t.textPri : t.textMuted,
                    fontFamily: "'DM Sans',sans-serif",
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                  }}>
                    {segment}
                  </span>
                </span>
              );
            })}
          </div>
        ) : (
          <>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: t.textPri, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.2 }}>{title}</h1>
            {subtitle && <p style={{ margin: "2px 0 0", fontSize: 12, color: t.textMuted }}>{subtitle}</p>}
          </>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {actions}
        <button
          onClick={() => setDark(!dark)}
          title={dark ? "Light mode" : "Dark mode"}
          style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${t.selectBorder}`, background: t.selectBg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s", flexShrink: 0 }}
        >
          {dark ? Ic.Sun(t.selectText) : Ic.Moon(t.selectText)}
        </button>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: t.avatarBg, border: `2px solid ${t.accent}`, overflow: "hidden", flexShrink: 0 }}>
          <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&q=80" alt="User" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>
    </div>
  );
}