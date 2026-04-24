"use client";
// src/components/ui/NavigationProgress.tsx
// Thin top-bar progress indicator that fires on every router.push() navigation.
// Nav buttons dispatch "nav:start" → bar crawls → pathname change → bar completes.

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/src/context/ThemeContext";

type Phase = "idle" | "loading" | "finishing";

export default function NavigationProgress() {
  const pathname        = usePathname();
  const { t }           = useTheme();
  const [phase, setPhase]   = useState<Phase>("idle");
  const [width, setWidth]   = useState(0);
  const prevRef         = useRef(pathname);
  const activeRef       = useRef(false);
  const tickRef         = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hideRef         = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function start() {
    clearTimeout(tickRef.current);
    clearTimeout(hideRef.current);
    activeRef.current = true;
    setPhase("loading");
    setWidth(0);

    // Jump to 25% immediately, then crawl toward 90%
    setTimeout(() => setWidth(25), 10);

    let current = 25;
    const crawl = () => {
      current = current + (90 - current) * 0.08;
      setWidth(Math.min(current, 89));
      if (current < 89) tickRef.current = setTimeout(crawl, 250);
    };
    tickRef.current = setTimeout(crawl, 200);
  }

  function finish() {
    clearTimeout(tickRef.current);
    setPhase("finishing");
    setWidth(100);
    hideRef.current = setTimeout(() => {
      setPhase("idle");
      setWidth(0);
      activeRef.current = false;
    }, 450);
  }

  // Listen for nav:start events dispatched by navigation buttons
  useEffect(() => {
    const handler = () => start();
    window.addEventListener("nav:start", handler);
    return () => {
      window.removeEventListener("nav:start", handler);
      clearTimeout(tickRef.current);
      clearTimeout(hideRef.current);
    };
  }, []);

  // Complete the bar when the route actually changes
  useEffect(() => {
    if (pathname !== prevRef.current) {
      prevRef.current = pathname;
      if (activeRef.current) finish();
    }
  }, [pathname]);

  if (phase === "idle") return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        height: 3,
        zIndex: 99999,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${width}%`,
          borderRadius: "0 3px 3px 0",
          background: `linear-gradient(90deg, ${t.accent} 0%, ${t.accent}cc 100%)`,
          boxShadow: `0 0 12px ${t.accent}88, 0 0 4px ${t.accent}55`,
          opacity: phase === "finishing" ? 0 : 1,
          transition: phase === "finishing"
            ? "width 0.2s ease-out, opacity 0.3s ease 0.18s"
            : "width 0.15s ease-out",
        }}
      />
    </div>
  );
}
