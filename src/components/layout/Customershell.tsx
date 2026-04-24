"use client";
// src/components/layout/CustomerShell.tsx
// Customer portal shell — reads theme from ThemeContext (persists across navigation).

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCustomerAuth } from "@/src/context/Customerauthcontext";
import { useTheme } from "@/src/context/ThemeContext";
import { Ic } from "@/src/components/ui/Icons";
import { useNotifications } from "@/src/context/NotificationContext";
import { useChat } from "@/src/context/ChatContext";

/* ── Inline SVG icons not in Ic ─────────────────────────────────────────────── */
const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "#EF4444" : "none"}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={filled ? "#EF4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ── Notif type icons ────────────────────────────────────────────────────────── */
function NotifTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "booking":
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
    case "payment":
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="1" y="4" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M1 10h22" stroke="currentColor" strokeWidth="2"/></svg>;
    case "rental":
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v7a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="7.5" cy="17.5" r="2.5" stroke="currentColor" strokeWidth="2"/><circle cx="17.5" cy="17.5" r="2.5" stroke="currentColor" strokeWidth="2"/></svg>;
    case "swap":
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 16H3v-4M17 8h4v4M3 12a9 9 0 0 1 14-7.46M21 12a9 9 0 0 1-14 7.46" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    default:
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
  }
}

/* ── Nav groups ──────────────────────────────────────────────────────────────── */
interface NavItem  { label: string; href: string; icon: (c: string) => React.ReactNode; }
interface NavGroup { group: string; items: NavItem[]; }

const NAV_GROUPS: NavGroup[] = [
  {
    group: "OVERVIEW",
    items: [
      { label: "Dashboard",    href: "/customer/dashboard",   icon: (c) => Ic.Dashboard(c) },
    ],
  },
  {
    group: "MY ACCOUNT",
    items: [
      { label: "My Rentals",   href: "/customer/rentals",     icon: (c) => Ic.Rentals(c)  },
      { label: "My Purchases", href: "/customer/purchases",   icon: (c) => Ic.Buy(c)       },
      { label: "My Swaps",     href: "/customer/swaps",       icon: (c) => Ic.Swap(c)      },
      { label: "Favourites",   href: "/customer/favourites",  icon: (c) => Ic.Heart(c)     },
      { label: "Profile",      href: "/customer/profile",     icon: (c) => Ic.Profile(c)   },
    ],
  },
  {
    group: "DISCOVER",
    items: [
      { label: "Browse Cars",  href: "/customer/cars",        icon: (c) => Ic.Vehicles(c) },
      { label: "Rent a Car",   href: "/customer/rent-car",    icon: (c) => Ic.Rentals(c)  },
      { label: "Buy a Car",    href: "/customer/buy-car",     icon: (c) => Ic.Buy(c)       },
      { label: "Swap a Car",   href: "/customer/swap-car",    icon: (c) => Ic.Swap(c)      },
      { label: "Live Map",     href: "/customer/live-map",    icon: (c) => Ic.Map(c)       },
    ],
  },
];

interface Props {
  children:  React.ReactNode;
  title:     string;
  subtitle?: string;
  actions?:  React.ReactNode;
  dark?:     boolean;
  setDark?:  (v: boolean) => void;
  t?:        any;
}

export default function CustomerShell({ children, title, subtitle, actions }: Props) {
  const router   = useRouter();
  const pathname = usePathname();
  const { customer, logout } = useCustomerAuth();
  const { dark, setDark, t } = useTheme();
  const { notifications, unread, markRead, markAllRead, dismiss } = useNotifications();
  const { conversations, activeId, setActive, sendMessage, totalUnread } = useChat();

  /* ── Panel open/close state ─────────────────────────────────────────────── */
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [chatOpen,  setChatOpen]  = useState(false);
  const [chatInput, setChatInput] = useState("");

  const navWidth = collapsed ? 52 : 220;

  /* ── Click-outside for notification dropdown ────────────────────────────── */
  const notifRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  /* ── Prefetch all nav routes on mount for instant navigation ───────────── */
  useEffect(() => {
    NAV_GROUPS.flatMap(g => g.items).forEach(item => router.prefetch(item.href));
  }, [router]);

  /* ── Auth guard ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!customer) router.replace("/customer/login");
  }, [customer, router]);

  if (!customer) return null;

  const handleLogout = () => {
    logout();
    router.push("/customer/login");
  };

  const activeConv = conversations.find(c => c.id === activeId) ?? null;

  const handleSend = () => {
    if (!chatInput.trim() || !activeId) return;
    sendMessage(activeId, chatInput.trim());
    setChatInput("");
  };

  /* ── Icon button style helper ───────────────────────────────────────────── */
  const iconBtn = (active?: boolean): React.CSSProperties => ({
    width: 34, height: 34, borderRadius: 8,
    border: `1px solid ${active ? t.accent : t.border}`,
    background: active ? t.accent + "15" : t.bg,
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", position: "relative", color: active ? t.accent : t.textMuted,
    transition: "all 0.15s",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${t.bg}; }
        ::-webkit-scrollbar       { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${t.scrollThumb}; border-radius: 4px; }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
        @keyframes fadeInDown {
          from { transform: translateY(-8px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes pageFadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        button { transition: transform 0.1s ease; }
        button:active { transform: scale(0.96); }
      `}</style>

      <div style={{ display:"flex", height:"100vh", fontFamily:"'DM Sans',sans-serif", background:t.bg, overflow:"hidden" }}>

        {/* ── LEFT NAVBAR ─────────────────────────────────────────────────── */}
        <div style={{
          width: navWidth, flexShrink: 0,
          background: t.cardBg, borderRight: `1px solid ${t.border}`,
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
        }}>

          {/* Logo + collapse toggle */}
          <div style={{ padding: collapsed ? "14px 9px" : "18px 16px 14px", borderBottom: `1px solid ${t.border}`, flexShrink: 0, transition: "padding 0.22s" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", overflow: "hidden", flexShrink: 0 }}
                onClick={() => !collapsed && router.push("/")}
              >
                <div style={{ width: 32, height: 32, background: t.accent, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {Ic.CarLogo(t.accentFg)}
                </div>
                {!collapsed && (
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: t.textPri, letterSpacing: 2, lineHeight: 1.1, whiteSpace: "nowrap" }}>ELITE</div>
                    <div style={{ fontSize: 9, fontWeight: 600, color: t.textMuted, letterSpacing: 1.5, whiteSpace: "nowrap" }}>DRIVE MOTORS</div>
                  </div>
                )}
              </div>
              {!collapsed && (
                <button
                  onClick={() => setCollapsed(true)}
                  title="Collapse sidebar"
                  style={{ width: 24, height: 24, borderRadius: 6, border: `1px solid ${t.border}`, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, color: t.textMuted, transition: "border-color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = t.accent)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = t.border)}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Expand button when collapsed */}
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              title="Expand sidebar"
              style={{ margin: "8px auto 0", width: 32, height: 32, borderRadius: 7, border: `1px solid ${t.border}`, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: t.textMuted, flexShrink: 0, transition: "border-color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = t.accent)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = t.border)}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

          {/* Customer card */}
          <div style={{ padding: collapsed ? "10px 0" : "14px 16px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: collapsed ? 0 : 10, transition: "padding 0.22s" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: t.accent + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: t.accent, flexShrink: 0 }}>
              {customer.avatar}
            </div>
            {!collapsed && (
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.textPri, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{customer.name}</div>
                <div style={{ fontSize: 10, color: t.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{customer.email}</div>
              </div>
            )}
            {!collapsed && customer.plan === "Pro" && (
              <span style={{ fontSize: 9, fontWeight: 700, color: t.accent, background: t.accent + "15", border: `1px solid ${t.accent}25`, borderRadius: 20, padding: "2px 7px", flexShrink: 0 }}>PRO</span>
            )}
          </div>

          {/* Scrollable nav */}
          <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: collapsed ? "6px 4px" : "10px 8px 6px" }}>
            {NAV_GROUPS.map(group => (
              <div key={group.group} style={{ marginBottom: 4 }}>
                {!collapsed && (
                  <div style={{ fontSize: 9, fontWeight: 700, color: t.navGroupLabel ?? t.textMuted, letterSpacing: 1.4, padding: "6px 10px 4px", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                    {group.group}
                  </div>
                )}

                {group.items.map(item => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <button
                      key={item.href}
                      onClick={() => router.push(item.href)}
                      title={collapsed ? item.label : undefined}
                      style={{
                        width: "100%", display: "flex", alignItems: "center",
                        justifyContent: collapsed ? "center" : "flex-start",
                        gap: collapsed ? 0 : 9,
                        padding: collapsed ? "9px 0" : "8px 10px",
                        borderRadius: 7, marginBottom: 1,
                        background: active ? t.navActiveBg : "transparent",
                        border: "none", cursor: "pointer",
                        fontSize: 12.5, fontWeight: active ? 700 : 400,
                        color: active ? (t.navActive ?? t.accent) : (t.navText ?? t.textSec),
                        fontFamily: "'DM Sans',sans-serif",
                        transition: "all 0.15s", textAlign: "left",
                      }}
                      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = (t.navActiveBg ?? t.border) + "66"; }}
                      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                    >
                      <span style={{ display: "flex", flexShrink: 0 }}>
                        {item.icon(active ? (t.navIconAct ?? t.accent) : (t.navIconDef ?? t.textMuted))}
                      </span>
                      {!collapsed && (
                        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.label}
                        </span>
                      )}
                      {!collapsed && active && <div style={{ width: 5, height: 5, borderRadius: "50%", background: t.accent, flexShrink: 0 }}/>}
                    </button>
                  );
                })}

                {!collapsed && <div style={{ height: 1, background: t.divider, margin: "6px 4px 2px" }}/>}
                {collapsed  && <div style={{ height: 1, background: t.divider, margin: "4px 8px" }}/>}
              </div>
            ))}
          </div>

          {/* Logout footer */}
          <div style={{ padding: collapsed ? "8px 4px 14px" : "8px 8px 14px", borderTop: `1px solid ${t.divider}`, flexShrink: 0 }}>
            <button
              onClick={handleLogout}
              title={collapsed ? "Sign Out" : undefined}
              style={{
                width: "100%", display: "flex", alignItems: "center",
                justifyContent: collapsed ? "center" : "flex-start",
                gap: collapsed ? 0 : 9,
                padding: collapsed ? "8px 0" : "7px 10px",
                borderRadius: 7, background: "transparent", border: "none",
                cursor: "pointer", fontSize: 12, color: "#EF4444",
                fontFamily: "'DM Sans',sans-serif", textAlign: "left",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.07)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ display: "flex", flexShrink: 0 }}>{Ic.Logout?.("#EF4444") ?? Ic.ArrowRight("#EF4444")}</span>
              {!collapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>

        {/* ── MAIN ────────────────────────────────────────────────────────── */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>

          {/* TopBar */}
          <div style={{ height:52, flexShrink:0, borderBottom:`1px solid ${t.border}`, background:t.cardBg, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px" }}>
            <div style={{ display:"flex", alignItems:"baseline", gap:10, minWidth:0 }}>
              <span style={{ fontSize:14, fontWeight:800, color:t.textPri, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{title}</span>
              {subtitle && <span style={{ fontSize:11, color:t.textMuted, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{subtitle}</span>}
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              {actions}

              {/* Favourites heart button */}
              <button
                onClick={() => router.push("/customer/favourites")}
                title="My Favourites"
                style={iconBtn(pathname === "/customer/favourites")}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#EF4444"; (e.currentTarget as HTMLButtonElement).style.color = "#EF4444"; }}
                onMouseLeave={e => { const active = pathname === "/customer/favourites"; (e.currentTarget as HTMLButtonElement).style.borderColor = active ? t.accent : t.border; (e.currentTarget as HTMLButtonElement).style.color = active ? t.accent : t.textMuted; }}
              >
                <HeartIcon filled={pathname === "/customer/favourites"} />
              </button>

              {/* Chat button */}
              <button
                onClick={() => { setChatOpen(o => !o); setNotifOpen(false); }}
                title="Messages"
                style={iconBtn(chatOpen)}
                onMouseEnter={e => { if (!chatOpen) { (e.currentTarget as HTMLButtonElement).style.borderColor = t.accent; (e.currentTarget as HTMLButtonElement).style.color = t.accent; } }}
                onMouseLeave={e => { if (!chatOpen) { (e.currentTarget as HTMLButtonElement).style.borderColor = t.border; (e.currentTarget as HTMLButtonElement).style.color = t.textMuted; } }}
              >
                <ChatIcon />
                {totalUnread > 0 && (
                  <span style={{ position:"absolute", top:5, right:5, width:8, height:8, borderRadius:"50%", background:"#3B82F6", border:`1.5px solid ${t.cardBg}` }}/>
                )}
              </button>

              {/* Notification bell button */}
              <div ref={notifRef} style={{ position: "relative" }}>
                <button
                  onClick={() => { setNotifOpen(o => !o); setChatOpen(false); }}
                  title="Notifications"
                  style={iconBtn(notifOpen)}
                  onMouseEnter={e => { if (!notifOpen) { (e.currentTarget as HTMLButtonElement).style.borderColor = t.accent; (e.currentTarget as HTMLButtonElement).style.color = t.accent; } }}
                  onMouseLeave={e => { if (!notifOpen) { (e.currentTarget as HTMLButtonElement).style.borderColor = t.border; (e.currentTarget as HTMLButtonElement).style.color = t.textMuted; } }}
                >
                  <BellIcon />
                  {unread > 0 && (
                    <span style={{ position:"absolute", top:5, right:5, width:8, height:8, borderRadius:"50%", background:"#EF4444", border:`1.5px solid ${t.cardBg}` }}/>
                  )}
                </button>

                {/* ── Notification dropdown ──────────────────────────────── */}
                {notifOpen && (
                  <div
                    style={{
                      position: "fixed", top: 52, right: 60, width: 340, zIndex: 200,
                      background: t.cardBg, border: `1px solid ${t.border}`,
                      borderRadius: 14, overflow: "hidden",
                      boxShadow: dark ? "0 16px 48px rgba(0,0,0,0.6)" : "0 16px 48px rgba(0,0,0,0.14)",
                      animation: "fadeInDown 0.2s ease",
                    }}
                  >
                    {/* Header */}
                    <div style={{ padding: "14px 16px 12px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: t.textPri }}>Notifications</span>
                        {unread > 0 && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: t.accentFg, background: "#EF4444", borderRadius: 20, padding: "2px 7px", lineHeight: 1.4 }}>
                            {unread}
                          </span>
                        )}
                      </div>
                      {unread > 0 && (
                        <button
                          onClick={markAllRead}
                          style={{ fontSize: 11, color: t.accent, background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, padding: "3px 0" }}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Notification list */}
                    <div style={{ maxHeight: 380, overflowY: "auto" }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: "40px 20px", textAlign: "center", color: t.textMuted, fontSize: 12 }}>
                          No notifications
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => markRead(n.id)}
                            style={{
                              padding: "12px 16px",
                              background: n.read ? "transparent" : (dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"),
                              borderBottom: `1px solid ${t.divider}`,
                              display: "flex", alignItems: "flex-start", gap: 10,
                              cursor: "pointer", transition: "background 0.15s",
                            }}
                            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"}
                            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = n.read ? "transparent" : (dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)")}
                          >
                            {/* Type icon */}
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: t.bg, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <NotifTypeIcon type={n.type} />
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 2 }}>
                                <span style={{ fontSize: 12, fontWeight: n.read ? 600 : 700, color: t.textPri, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {n.title}
                                </span>
                                {!n.read && (
                                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#3B82F6", flexShrink: 0 }}/>
                                )}
                              </div>
                              <div style={{ fontSize: 11, color: t.textMuted, lineHeight: 1.5, marginBottom: 4 }}>{n.body}</div>
                              <div style={{ fontSize: 10, color: t.textHint }}>{n.time}</div>
                            </div>

                            {/* Dismiss */}
                            <button
                              onClick={e => { e.stopPropagation(); dismiss(n.id); }}
                              style={{ background: "none", border: "none", cursor: "pointer", color: t.textHint, fontSize: 16, lineHeight: 1, padding: "0 2px", flexShrink: 0 }}
                              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "#EF4444"}
                              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = t.textHint}
                            >
                              ×
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div style={{ padding: "10px 16px", borderTop: `1px solid ${t.border}`, textAlign: "center" }}>
                        <span style={{ fontSize: 11, color: t.textMuted }}>{notifications.length} total notification{notifications.length !== 1 ? "s" : ""}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Theme toggle */}
              <div
                onClick={() => setDark(!dark)}
                title={dark ? "Switch to light mode" : "Switch to dark mode"}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 12px", borderRadius: 20, cursor: "pointer", flexShrink: 0,
                  background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
                  border: `1.5px solid ${dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"}`,
                  transition: "all 0.2s",
                  userSelect: "none",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.opacity = "0.75"}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.opacity = "1"}
              >
                {dark ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="5" stroke="#ffffff" strokeWidth="2"/>
                      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#ffffff" }}>Light</span>
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#0a0a0a" }}>Dark</span>
                  </>
                )}
              </div>

              {/* Profile avatar */}
              <div
                onClick={() => router.push("/customer/profile")}
                style={{ width:32, height:32, borderRadius:"50%", background:t.accent+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:t.accent, cursor:"pointer" }}
              >
                {customer.avatar}
              </div>
            </div>
          </div>

          {/* Page content */}
          <div
            key={pathname}
            style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", animation:"pageFadeIn 0.18s ease" }}
          >
            {children}
          </div>
        </div>
      </div>

      {/* ── CHAT PANEL (fixed, slides in from right) ─────────────────────────── */}
      {chatOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setChatOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 199, background: "transparent" }}
          />

          {/* Panel */}
          <div
            style={{
              position: "fixed", top: 0, right: 0, bottom: 0, width: 340, zIndex: 200,
              background: t.cardBg, borderLeft: `1px solid ${t.border}`,
              display: "flex", flexDirection: "column",
              boxShadow: dark ? "-16px 0 48px rgba(0,0,0,0.5)" : "-16px 0 48px rgba(0,0,0,0.1)",
              animation: "slideInRight 0.22s ease",
            }}
          >
            {activeConv ? (
              /* ── Active conversation ──────────────────────────────────── */
              <>
                {/* Conversation header */}
                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    onClick={() => setActive(null)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, padding: "4px 6px 4px 0", display: "flex", alignItems: "center" }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = t.accent}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = t.textMuted}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: t.accent + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: t.accent, flexShrink: 0 }}>
                    {activeConv.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: t.textPri }}>{activeConv.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: activeConv.online ? "#10B981" : t.textHint, flexShrink: 0 }}/>
                      <span style={{ fontSize: 10, color: t.textMuted }}>{activeConv.online ? "Online" : "Offline"} · {activeConv.role}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setChatOpen(false)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, fontSize: 20, lineHeight: 1, padding: "0 2px" }}
                  >×</button>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {activeConv.messages.map(msg => (
                    <div
                      key={msg.id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: msg.from === "me" ? "flex-end" : "flex-start",
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "80%",
                          padding: "9px 13px",
                          borderRadius: msg.from === "me" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                          background: msg.from === "me" ? t.accent : t.bg,
                          color: msg.from === "me" ? t.accentFg : t.textPri,
                          fontSize: 12.5,
                          lineHeight: 1.5,
                          border: msg.from === "me" ? "none" : `1px solid ${t.border}`,
                        }}
                      >
                        {msg.text}
                      </div>
                      <span style={{ fontSize: 10, color: t.textHint, marginTop: 3, paddingLeft: 2, paddingRight: 2 }}>{msg.time}</span>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div style={{ padding: "12px 14px", borderTop: `1px solid ${t.border}`, display: "flex", gap: 8, alignItems: "flex-end" }}>
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Type a message…"
                    style={{
                      flex: 1, padding: "9px 12px", borderRadius: 10,
                      border: `1px solid ${t.border}`, background: t.bg,
                      color: t.textPri, fontSize: 12.5, outline: "none",
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                    onFocus={e => (e.target.style.borderColor = t.accent)}
                    onBlur={e  => (e.target.style.borderColor = t.border)}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!chatInput.trim()}
                    style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      border: "none", background: chatInput.trim() ? t.accent : t.border,
                      color: chatInput.trim() ? t.accentFg : t.textMuted,
                      cursor: chatInput.trim() ? "pointer" : "default",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.15s",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              /* ── Conversation list ────────────────────────────────────── */
              <>
                {/* Chat header */}
                <div style={{ padding: "14px 16px 12px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: t.textPri }}>Messages</span>
                    {totalUnread > 0 && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: "#3B82F6", borderRadius: 20, padding: "2px 7px", lineHeight: 1.4 }}>
                        {totalUnread}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setChatOpen(false)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, fontSize: 20, lineHeight: 1, padding: "0 2px" }}
                  >×</button>
                </div>

                {/* Conversation items */}
                <div style={{ flex: 1, overflowY: "auto" }}>
                  {conversations.map(conv => (
                    <div
                      key={conv.id}
                      onClick={() => setActive(conv.id)}
                      style={{
                        padding: "12px 16px", display: "flex", alignItems: "center", gap: 11,
                        borderBottom: `1px solid ${t.divider}`, cursor: "pointer", transition: "background 0.15s",
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                    >
                      {/* Avatar with online dot */}
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <div style={{ width: 38, height: 38, borderRadius: "50%", background: t.accent + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: t.accent }}>
                          {conv.avatar}
                        </div>
                        {conv.online && (
                          <span style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: "#10B981", border: `2px solid ${t.cardBg}` }}/>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: t.textPri, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conv.name}</span>
                          <span style={{ fontSize: 10, color: t.textHint, flexShrink: 0, marginLeft: 6 }}>{conv.lastTime}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 11, color: t.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{conv.lastMsg}</span>
                          {conv.unread > 0 && (
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: "#3B82F6", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 6 }}>
                              {conv.unread}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 10, color: t.textHint, marginTop: 1 }}>{conv.role}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer hint */}
                <div style={{ padding: "12px 16px", borderTop: `1px solid ${t.border}`, textAlign: "center" }}>
                  <span style={{ fontSize: 11, color: t.textMuted }}>Support is available Mon–Sat, 8am–6pm</span>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
