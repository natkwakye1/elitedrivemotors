"use client";
// src/components/layout/AppShell.tsx
// Admin shell — reads theme from ThemeContext (persists across navigation).

import Navbar from "@/src/components/layout/Navbar";
import { useTheme } from "@/src/context/ThemeContext";
import { usePathname } from "next/navigation";

interface AppShellProps {
  active:       string;
  children:     React.ReactNode;
  // dark / setDark / t accepted but ignored — theme comes from context
  dark?:        boolean;
  setDark?:     (v: boolean) => void;
  t?:           any;
  hideSidebar?: boolean;
}

export default function AppShell({ active, children }: AppShellProps) {
  const { t } = useTheme();
  const pathname = usePathname();
  const [activeNav, setActiveNav] = [active, (_: string) => {}];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${t.bg}; transition: background 0.25s; }
        ::-webkit-scrollbar       { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${t.scrollThumb}; border-radius: 4px; }
        input[type=range] { -webkit-appearance: none; height: 4px; border-radius: 2px; background: ${t.rangeBg}; outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: ${t.accent}; cursor: pointer; box-shadow: 0 0 0 3px ${t.rangeShadow}; }
        select { outline: none; }
        input::placeholder  { color: ${t.inputText}; }
        input, textarea { font-family: 'DM Sans', sans-serif; }
        @keyframes pageFadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        button { transition: transform 0.1s ease; }
        button:active { transform: scale(0.96); }
      `}</style>

      <div style={{ display:"flex", height:"100vh", fontFamily:"'DM Sans',sans-serif", background:t.bg, overflow:"hidden", transition:"background 0.25s" }}>
        <Navbar active={activeNav} setActive={setActiveNav} t={t} />
        <main key={pathname} style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0, animation:"pageFadeIn 0.18s ease" }}>
          {children}
        </main>
      </div>
    </>
  );
}
