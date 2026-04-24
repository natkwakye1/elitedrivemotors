"use client";
// src/context/ThemeContext.tsx
// Global dark/light mode — persists to localStorage so theme survives navigation.

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { DARK, LIGHT, Theme } from "@/src/lib/theme";

const KEY = "edm-dark";

interface ThemeContextValue {
  dark:    boolean;
  setDark: (v: boolean) => void;
  t:       Theme;
}

const ThemeContext = createContext<ThemeContextValue>({
  dark:    false,
  setDark: () => {},
  t:       LIGHT,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDarkState] = useState(false);

  // Hydrate from localStorage on first mount (client only)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "true") setDarkState(true);
    } catch {}
    // Also apply immediately from system preference as fallback
    if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      try { if (!localStorage.getItem(KEY)) setDarkState(true); } catch {}
    }
  }, []);

  // Sync body/root CSS variables with dark state
  useEffect(() => {
    document.documentElement.style.setProperty("--background", dark ? "#0a0a0a" : "#ffffff");
    document.documentElement.style.setProperty("--foreground", dark ? "#ededed" : "#171717");
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  const setDark = (v: boolean) => {
    setDarkState(v);
    try { localStorage.setItem(KEY, String(v)); } catch {}
  };

  return (
    <ThemeContext.Provider value={{ dark, setDark, t: dark ? DARK : LIGHT }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
