"use client";
// src/components/ui/RouteProgress.tsx
// Slim animated bar at the top of the viewport that fires on every route change.

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/src/context/ThemeContext";

export default function RouteProgress() {
  const pathname          = usePathname();
  const { dark }          = useTheme();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clear = () => timers.current.forEach(clearTimeout);

  useEffect(() => {
    clear();
    setVisible(true);
    setWidth(0);

    // Animate across: 0 → 30 → 65 → 85 → 100, then fade out
    const t0 = setTimeout(() => setWidth(30),  30);
    const t1 = setTimeout(() => setWidth(65),  180);
    const t2 = setTimeout(() => setWidth(85),  400);
    const t3 = setTimeout(() => setWidth(100), 620);
    const t4 = setTimeout(() => setVisible(false), 900);

    timers.current = [t0, t1, t2, t3, t4];
    return clear;
  }, [pathname]);

  // Use a high-contrast glow color that looks great on both themes
  const barColor = dark ? "#ffffff" : "#000000";
  const glowColor = dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.2)";

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 99999,
        height: 2, pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.25s ease",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${width}%`,
          background: barColor,
          boxShadow: `0 0 10px ${glowColor}, 0 0 4px ${glowColor}`,
          transition: width === 0
            ? "none"
            : width === 100
              ? "width 0.15s ease-in"
              : "width 0.35s cubic-bezier(0.4,0,0.2,1)",
          borderRadius: "0 2px 2px 0",
        }}
      />
    </div>
  );
}
