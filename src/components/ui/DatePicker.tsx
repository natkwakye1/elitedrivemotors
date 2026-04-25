"use client";
// src/components/ui/DatePicker.tsx
// Custom calendar picker — matches EliteDriveMotors design system.

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/src/context/ThemeContext";

interface Props {
  value:       string;                    // "YYYY-MM-DD" or ""
  onChange:    (v: string) => void;
  label?:      string;
  placeholder?: string;
  min?:        string;                    // "YYYY-MM-DD" — disables earlier dates
  className?:  string;
  style?:      React.CSSProperties;
}

const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function DatePicker({ value, onChange, label, placeholder = "Select date", min, style }: Props) {
  const { t, dark } = useTheme();
  const [open, setOpen]       = useState(false);
  const today                 = new Date();
  const parsed                = value ? new Date(value + "T12:00:00") : null;
  const [viewYear,  setViewYear]  = useState(parsed?.getFullYear()  ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth()     ?? today.getMonth());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  // Sync view when value changes externally
  useEffect(() => {
    if (parsed) { setViewYear(parsed.getFullYear()); setViewMonth(parsed.getMonth()); }
  }, [value]);

  /* ── calendar grid ─────────────────────────────────────────────────────── */
  const firstDay     = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const minDate = min ? new Date(min + "T00:00:00") : null;

  const isSelected = (d: number) =>
    !!parsed && parsed.getFullYear() === viewYear && parsed.getMonth() === viewMonth && parsed.getDate() === d;

  const isToday = (d: number) =>
    today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === d;

  const isDisabled = (d: number) => {
    if (!minDate) return false;
    return new Date(viewYear, viewMonth, d) < minDate;
  };

  const select = (d: number) => {
    if (isDisabled(d)) return;
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    onChange(`${viewYear}-${mm}-${dd}`);
    setOpen(false);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const displayValue = parsed
    ? parsed.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "";

  /* ── shared button style ────────────────────────────────────────────────── */
  const navBtn: React.CSSProperties = {
    width: 28, height: 28, borderRadius: 7,
    border: `1px solid ${t.border}`, background: "transparent",
    cursor: "pointer", color: t.textMuted,
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "border-color 0.15s, color 0.15s",
    flexShrink: 0,
  };

  return (
    <div ref={ref} style={{ position: "relative", width: "100%", ...style }}>
      {label && (
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.9, textTransform: "uppercase", color: t.textMuted, marginBottom: 5 }}>
          {label}
        </div>
      )}

      {/* ── Trigger button ── */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "9px 12px", borderRadius: 8,
          border: `1px solid ${open ? t.accent : t.border}`,
          background: t.bg, cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
          transition: "border-color 0.15s",
          boxSizing: "border-box",
        }}
        onMouseEnter={e => { if (!open) (e.currentTarget as HTMLButtonElement).style.borderColor = t.accent + "80"; }}
        onMouseLeave={e => { if (!open) (e.currentTarget as HTMLButtonElement).style.borderColor = t.border; }}
      >
        <span style={{ fontSize: 12, color: displayValue ? t.textPri : t.textMuted, fontFamily: "'DM Sans',sans-serif" }}>
          {displayValue || placeholder}
        </span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: open ? t.accent : t.textMuted, transition: "color 0.15s" }}>
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </button>

      {/* ── Calendar dropdown ── */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 600,
          background: t.cardBg, border: `1px solid ${t.border}`,
          borderRadius: 14, padding: "14px 14px 12px",
          boxShadow: dark ? "0 20px 60px rgba(0,0,0,0.65)" : "0 8px 32px rgba(0,0,0,0.13)",
          width: 262, animation: "pageFadeIn 0.13s ease",
        }}>

          {/* Month / year header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <button type="button" onClick={prevMonth} style={navBtn}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = t.accent; (e.currentTarget as HTMLButtonElement).style.color = t.accent; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = t.border; (e.currentTarget as HTMLButtonElement).style.color = t.textMuted; }}
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: t.textPri, letterSpacing: 0.3 }}>
                {MONTHS[viewMonth]}
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: t.textMuted }}>{viewYear}</span>
            </div>

            <button type="button" onClick={nextMonth} style={navBtn}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = t.accent; (e.currentTarget as HTMLButtonElement).style.color = t.accent; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = t.border; (e.currentTarget as HTMLButtonElement).style.color = t.textMuted; }}
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Day-of-week headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 9, fontWeight: 700, color: t.textMuted, letterSpacing: 0.6, padding: "2px 0" }}>
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
            {cells.map((d, i) => {
              if (d === null) return <div key={`e${i}`}/>;
              const sel = isSelected(d);
              const tod = isToday(d);
              const dis = isDisabled(d);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => select(d)}
                  disabled={dis}
                  style={{
                    width: "100%", aspectRatio: "1 / 1", borderRadius: 7, border: "none",
                    background: sel ? t.accent : tod && !sel ? t.accent + "1a" : "transparent",
                    color: sel ? t.accentFg : dis ? t.textHint ?? t.textMuted : tod ? t.accent : t.textPri,
                    fontSize: 12, fontWeight: sel ? 800 : tod ? 700 : 400,
                    cursor: dis ? "default" : "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.1s",
                    opacity: dis ? 0.3 : 1,
                    outline: tod && !sel ? `1.5px solid ${t.accent}40` : "none",
                  }}
                  onMouseEnter={e => { if (!sel && !dis) (e.currentTarget as HTMLButtonElement).style.background = t.accent + "25"; }}
                  onMouseLeave={e => { if (!sel && !dis) (e.currentTarget as HTMLButtonElement).style.background = tod ? t.accent + "1a" : "transparent"; }}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {/* Divider + today shortcut + clear */}
          <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px solid ${t.divider}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const mm = String(now.getMonth() + 1).padStart(2, "0");
                const dd = String(now.getDate()).padStart(2, "0");
                const v = `${now.getFullYear()}-${mm}-${dd}`;
                if (!minDate || new Date(v) >= minDate) { onChange(v); setOpen(false); }
              }}
              style={{ fontSize: 11, fontWeight: 600, color: t.accent, background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", padding: 0 }}
            >
              Today
            </button>
            {value && (
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); }}
                style={{ fontSize: 11, color: t.textMuted, background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", padding: 0 }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
