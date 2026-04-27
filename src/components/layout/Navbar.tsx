"use client";
// src/components/layout/Navbar.tsx — Admin-only navigation

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname }      from "next/navigation";
import { Theme }                       from "@/src/lib/theme";
import { Ic }                          from "@/src/components/ui/Icons";
import { useAdminAuth }                from "@/src/context/AdminAuthContext";
import { useAdminNotifications, AdminNotifType } from "@/src/context/AdminNotificationContext";
import { useAdminChat }                from "@/src/context/AdminChatContext";

// ─── Inline SVG icons ────────────────────────────────────────────────────────
const BellIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChatBubbleIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BackArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M15 7H2M7 2L2 7l5 5"/>
  </svg>
);

// ─── Notification type colours ────────────────────────────────────────────────
const NOTIF_COLORS: Record<AdminNotifType, string> = {
  customer: "#3B82F6",
  booking:  "#22C55E",
  payment:  "#A855F7",
  fleet:    "#F59E0B",
  swap:     "#F97316",
  alert:    "#EF4444",
};

// ─── Admin routes ─────────────────────────────────────────────────────────────
const ROUTES: Record<string, string> = {
  "Dashboard":   "/dashboard/super-admin",
  "Customers":   "/dashboard/super-admin/customers",
  "Fleet Cars":  "/dashboard/super-admin/cars",
  "All Rentals": "/dashboard/super-admin/rentals",
  "Sales":       "/dashboard/super-admin/sales",
  "All Swaps":   "/dashboard/super-admin/swaps",
  "Payments":    "/dashboard/super-admin/payments",
  "Live Map":    "/tracking/live-map",
  "Reports":     "/dashboard/super-admin/reports",
  "Settings":    "/dashboard/super-admin/settings",
  "About":       "/dashboard/about",
  "Contact":     "/dashboard/contact",
};

// ─── Nav structure ────────────────────────────────────────────────────────────
interface NavItem  { label: string; icon: (c: string) => React.ReactNode; badge?: string; }
interface NavGroup { group: string; items: NavItem[]; }

const NAV_GROUPS: NavGroup[] = [
  {
    group: "OVERVIEW",
    items: [{ label: "Dashboard", icon: Ic.Dashboard }],
  },
  {
    group: "MANAGEMENT",
    items: [
      { label: "Customers",  icon: Ic.Users    },
      { label: "Fleet Cars", icon: Ic.Vehicles },
      { label: "All Rentals",icon: Ic.Rentals  },
      { label: "Sales",      icon: Ic.Buy      },
      { label: "All Swaps",  icon: Ic.Swap     },
      { label: "Payments",   icon: Ic.Payment  },
    ],
  },
  {
    group: "TRACKING",
    items: [{ label: "Live Map", icon: Ic.Map }],
  },
  {
    group: "REPORTS & SYSTEM",
    items: [
      { label: "Reports",  icon: Ic.Reports  },
      { label: "Settings", icon: Ic.Settings },
      { label: "About",    icon: Ic.About    },
      { label: "Contact",  icon: Ic.Contact  },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
interface NavbarProps {
  active:    string;
  setActive: (label: string) => void;
  t:         Theme;
}

export default function Navbar({ active, setActive, t }: NavbarProps) {
  const router   = useRouter();
  const pathname = usePathname();

  const { admin } = useAdminAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [chatOpen,  setChatOpen]  = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isMobile,   setIsMobile]  = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const msgEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const { notifications, unread: notifUnread, markRead, markAllRead, dismiss } = useAdminNotifications();
  const { conversations, activeId, setActive: setActiveConv, sendMessage, totalUnread: chatUnread } = useAdminChat();

  const activeConv = conversations.find(c => c.id === activeId) ?? null;
  const navWidth   = collapsed ? 52 : 210;

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages.length, activeId]);

  const navigate = (label: string) => {
    setActive(label);
    const route = ROUTES[label];
    if (route) router.push(route);
  };

  const isActive = (label: string) => {
    if (active === label) return true;
    const route = ROUTES[label];
    return route ? pathname === route || pathname.startsWith(route + "/") : false;
  };

  const toggleNotif = () => { setNotifOpen(p => !p); if (chatOpen) setChatOpen(false); };
  const toggleChat  = () => { setChatOpen(p => !p);  if (notifOpen) setNotifOpen(false); };

  const initials  = (name: string) => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const roleLabel = (role: string) => (role === "super_admin" || role === "super-admin") ? "Super Admin" : "Admin";

  const handleSend = () => {
    if (!activeId || !chatInput.trim()) return;
    sendMessage(activeId, chatInput);
    setChatInput("");
  };

  // ── icon-only button style ─────────────────────────────────────────────────
  const iconOnlyBtn = (isOn: boolean): React.CSSProperties => ({
    width: "100%", display: "flex", alignItems: "center",
    justifyContent: collapsed ? "center" : "flex-start",
    gap: collapsed ? 0 : 9,
    padding: collapsed ? "8px 0" : "7px 10px",
    borderRadius: 7, background: isOn ? t.navActiveBg : "transparent",
    border: "none", cursor: "pointer", fontSize: 12,
    color: isOn ? t.navActive : t.navText,
    fontFamily: "'DM Sans',sans-serif", textAlign: "left",
    position: "relative", transition: "all 0.15s",
  });

  return (
    <>
      <style>{`
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-18px); }
          to   { opacity: 1; transform: translateX(0);     }
        }
        @keyframes edm-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* Mobile backdrop */}
      {isMobile && drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{ position:"fixed", inset:0, zIndex:499, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(3px)", animation:"edm-backdrop-in 0.2s ease" }}
        />
      )}

      {/* Mobile hamburger (fixed) */}
      {isMobile && !drawerOpen && (
        <button
          onClick={() => setDrawerOpen(true)}
          style={{ position:"fixed", top:12, left:12, zIndex:501, width:40, height:40, borderRadius:10, border:`1px solid ${t.border}`, background:t.navBg, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:t.textMuted, boxShadow:"0 2px 12px rgba(0,0,0,0.2)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M3 12h18M3 6h18M3 18h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      )}

      {/* ── Sidebar ── */}
      <nav style={{
        width: isMobile ? 272 : navWidth,
        flexShrink: 0,
        background: t.navBg,
        borderRight: `1px solid ${t.border}`,
        display: "flex", flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        ...(isMobile ? {
          position: "fixed" as const,
          top: 0, left: 0, bottom: 0,
          zIndex: 500,
          transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: drawerOpen ? "4px 0 40px rgba(0,0,0,0.4)" : "none",
        } : {
          position: "sticky" as const,
          top: 0,
          transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
        }),
      }}>

        {/* ── Logo + toggle ── */}
        <div style={{ padding: collapsed ? "14px 9px" : "18px 18px 14px", borderBottom: `1px solid ${t.border}`, flexShrink: 0, transition: "padding 0.22s" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between" }}>
            {/* Logo mark */}
            <div
              style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", overflow: "hidden", flexShrink: 0 }}
              onClick={() => !collapsed && router.push("/dashboard/super-admin")}
            >
              <div style={{ width: 34, height: 34, background: t.logoIconBg, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {Ic.CarLogo(t.logoIconFg)}
              </div>
              {!collapsed && (
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: t.textPri, letterSpacing: 2, lineHeight: 1.1, whiteSpace: "nowrap" }}>ELITE</div>
                  <div style={{ fontSize: 9, fontWeight: 600, color: t.textHint, letterSpacing: 1.5, whiteSpace: "nowrap" }}>ADMIN PORTAL</div>
                </div>
              )}
            </div>

            {/* Collapse toggle — only visible when expanded */}
            {!collapsed && (
              <button
                onClick={() => setCollapsed(true)}
                title="Collapse sidebar"
                style={{ width: 24, height: 24, borderRadius: 6, border: `1px solid ${t.border}`, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "border-color 0.15s", color: t.textMuted }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = t.accent)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = t.border)}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>

          {/* Admin profile card */}
          {admin && (
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: collapsed ? 0 : 8, justifyContent: collapsed ? "center" : "flex-start", padding: collapsed ? "5px 0" : "7px 8px", background: t.navActiveBg, borderRadius: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: t.accent, color: t.accentFg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                {initials(admin.name)}
              </div>
              {!collapsed && (
                <div style={{ minWidth: 0, overflow: "hidden" }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: t.textPri, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{admin.name}</div>
                  <div style={{ fontSize: 9.5, color: t.textHint, marginTop: 1 }}>{roleLabel(admin.role)}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Expand button (shown when collapsed, at top of nav) ── */}
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

        {/* ── Scrollable nav groups ── */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: collapsed ? "6px 4px" : "10px 8px 6px" }}>
          {NAV_GROUPS.map(group => (
            <div key={group.group} style={{ marginBottom: 4 }}>
              {/* Group label — hidden when collapsed */}
              {!collapsed && (
                <div style={{ fontSize: 9, fontWeight: 700, color: t.navGroupLabel, letterSpacing: 1.4, padding: "6px 10px 4px", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                  {group.group}
                </div>
              )}

              {group.items.map(item => {
                const itemActive = isActive(item.label);
                return (
                  <button
                    key={item.label}
                    onClick={() => { navigate(item.label); if (isMobile) setDrawerOpen(false); }}
                    title={collapsed ? item.label : undefined}
                    style={{
                      width: "100%", display: "flex", alignItems: "center",
                      justifyContent: collapsed ? "center" : "flex-start",
                      gap: collapsed ? 0 : 9,
                      padding: collapsed ? "9px 0" : "8px 10px",
                      borderRadius: 7, marginBottom: 1,
                      background: itemActive ? t.navActiveBg : "transparent",
                      border: "none", cursor: "pointer",
                      fontSize: 12.5, fontWeight: itemActive ? 700 : 400,
                      color: itemActive ? t.navActive : t.navText,
                      fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s", textAlign: "left",
                    }}
                    onMouseEnter={e => { if (!itemActive) (e.currentTarget as HTMLButtonElement).style.background = t.navActiveBg + "66"; }}
                    onMouseLeave={e => { if (!itemActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >
                    <span style={{ display: "flex", flexShrink: 0 }}>{item.icon(itemActive ? t.navIconAct : t.navIconDef)}</span>
                    {!collapsed && <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>}
                    {!collapsed && itemActive && <div style={{ width: 5, height: 5, borderRadius: "50%", background: t.accent, flexShrink: 0 }} />}
                    {!collapsed && item.badge && (
                      <span style={{ background: t.accent, color: t.accentFg, borderRadius: 10, fontSize: 9.5, fontWeight: 700, padding: "1px 6px", flexShrink: 0 }}>{item.badge}</span>
                    )}
                  </button>
                );
              })}

              {!collapsed && <div style={{ height: 1, background: t.divider, margin: "6px 4px 2px" }} />}
              {collapsed  && <div style={{ height: 1, background: t.divider, margin: "4px 8px" }} />}
            </div>
          ))}
        </div>

        {/* ── Bottom section ── */}
        <div style={{ padding: collapsed ? "8px 4px 14px" : "8px 8px 14px", borderTop: `1px solid ${t.divider}`, flexShrink: 0 }}>

          {/* Notification bell */}
          <button
            onClick={toggleNotif}
            title={collapsed ? "Notifications" : undefined}
            style={iconOnlyBtn(notifOpen)}
            onMouseEnter={e => { if (!notifOpen) (e.currentTarget as HTMLButtonElement).style.background = t.navActiveBg + "66"; }}
            onMouseLeave={e => { if (!notifOpen) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            <span style={{ display: "flex", position: "relative" }}>
              <BellIcon />
              {notifUnread > 0 && (
                <span style={{ position: "absolute", top: -5, right: -6, background: "#EF4444", color: "#fff", borderRadius: "50%", fontSize: 8, fontWeight: 700, minWidth: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 2px", lineHeight: 1 }}>
                  {notifUnread > 9 ? "9+" : notifUnread}
                </span>
              )}
            </span>
            {!collapsed && <span style={{ flex: 1 }}>Notifications</span>}
            {!collapsed && notifUnread > 0 && (
              <span style={{ background: t.accent, color: t.accentFg, borderRadius: 10, fontSize: 9.5, fontWeight: 700, padding: "1px 6px" }}>{notifUnread}</span>
            )}
          </button>

          {/* Chat button */}
          <button
            onClick={toggleChat}
            title={collapsed ? "Messages" : undefined}
            style={iconOnlyBtn(chatOpen)}
            onMouseEnter={e => { if (!chatOpen) (e.currentTarget as HTMLButtonElement).style.background = t.navActiveBg + "66"; }}
            onMouseLeave={e => { if (!chatOpen) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            <span style={{ display: "flex", position: "relative" }}>
              <ChatBubbleIcon />
              {chatUnread > 0 && (
                <span style={{ position: "absolute", top: -5, right: -6, background: "#EF4444", color: "#fff", borderRadius: "50%", fontSize: 8, fontWeight: 700, minWidth: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 2px", lineHeight: 1 }}>
                  {chatUnread > 9 ? "9+" : chatUnread}
                </span>
              )}
            </span>
            {!collapsed && <span style={{ flex: 1 }}>Messages</span>}
            {!collapsed && chatUnread > 0 && (
              <span style={{ background: t.accent, color: t.accentFg, borderRadius: 10, fontSize: 9.5, fontWeight: 700, padding: "1px 6px" }}>{chatUnread}</span>
            )}
          </button>

          {/* Support */}
          <button
            onClick={toggleChat}
            title={collapsed ? "Support" : undefined}
            style={{ ...iconOnlyBtn(false), opacity: 0.7 }}
            onMouseEnter={e => (e.currentTarget.style.background = t.navActiveBg + "66")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <span style={{ display: "flex" }}>{Ic.Support?.(t.navIconDef) ?? Ic.Contact(t.navIconDef)}</span>
            {!collapsed && <span>Support</span>}
          </button>

          {/* Sign out */}
          <button
            onClick={() => router.push("/auth/login")}
            title={collapsed ? "Sign Out" : undefined}
            style={{ ...iconOnlyBtn(false), color: "#EF4444", opacity: 1 }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.07)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <span style={{ display: "flex" }}>{Ic.Logout?.(t.navIconDef) ?? Ic.ArrowRight("#EF4444")}</span>
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════════════════════
          NOTIFICATION PANEL
      ════════════════════════════════════════════════════════════════════ */}
      {notifOpen && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setNotifOpen(false); }}
          style={{ position: "fixed", inset: 0, zIndex: 199 }}
        >
          <div style={{ position: "fixed", left: navWidth, top: 0, bottom: 0, width: 340, zIndex: 200, background: t.cardBg, borderRight: `1px solid ${t.border}`, display: "flex", flexDirection: "column", animation: "slideInLeft 0.25s cubic-bezier(0.4,0,0.2,1)" }}>
            <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: t.textPri, flex: 1 }}>Notifications</span>
              {notifUnread > 0 && <span style={{ background: "#EF4444", color: "#fff", borderRadius: 10, fontSize: 10, fontWeight: 700, padding: "2px 7px" }}>{notifUnread} new</span>}
              {notifUnread > 0 && (
                <button onClick={markAllRead} style={{ fontSize: 11, color: t.accent, background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", padding: "2px 0", opacity: 0.8 }}>
                  Mark all read
                </button>
              )}
              <button onClick={() => setNotifOpen(false)} style={{ width: 24, height: 24, borderRadius: 6, background: t.navActiveBg, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: t.textSec, fontSize: 14, flexShrink: 0 }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
              {notifications.length === 0 ? (
                <div style={{ textAlign: "center", color: t.textMuted, fontSize: 12, marginTop: 32 }}>No notifications</div>
              ) : notifications.map(n => (
                <div key={n.id}
                  onClick={() => { markRead(n.id); if (n.link) { router.push(n.link); setNotifOpen(false); } }}
                  style={{ display: "flex", gap: 0, cursor: n.link ? "pointer" : "default", background: n.read ? "transparent" : t.navActiveBg + "55", transition: "background 0.15s", borderLeft: `3px solid ${NOTIF_COLORS[n.type]}`, margin: "2px 10px", borderRadius: "0 6px 6px 0", overflow: "hidden" }}
                  onMouseEnter={e => (e.currentTarget.style.background = t.navActiveBg + "99")}
                  onMouseLeave={e => (e.currentTarget.style.background = n.read ? "transparent" : t.navActiveBg + "55")}
                >
                  <div style={{ flex: 1, padding: "9px 10px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 4 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: n.read ? t.textSec : t.textPri, flex: 1, lineHeight: 1.3 }}>{n.title}</span>
                      <span style={{ fontSize: 10, color: t.textMuted, flexShrink: 0, marginTop: 1 }}>{n.time}</span>
                    </div>
                    <div style={{ fontSize: 11, color: t.textMuted, marginTop: 3, lineHeight: 1.4 }}>{n.body}</div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); dismiss(n.id); }} style={{ width: 28, flexShrink: 0, background: "none", border: "none", cursor: "pointer", color: t.textMuted, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", alignSelf: "stretch" }} title="Dismiss">×</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          CHAT PANEL
      ════════════════════════════════════════════════════════════════════ */}
      {chatOpen && (
        <div
          onClick={e => { if (e.target === e.currentTarget) { setChatOpen(false); setActiveConv(null); } }}
          style={{ position: "fixed", inset: 0, zIndex: 199 }}
        >
          <div style={{ position: "fixed", left: navWidth, top: 0, bottom: 0, width: 340, zIndex: 200, background: t.cardBg, borderRight: `1px solid ${t.border}`, display: "flex", flexDirection: "column", animation: "slideInLeft 0.25s cubic-bezier(0.4,0,0.2,1)" }}>
            {!activeConv ? (
              <>
                <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: t.textPri, flex: 1 }}>Messages</span>
                  {chatUnread > 0 && <span style={{ background: "#EF4444", color: "#fff", borderRadius: 10, fontSize: 10, fontWeight: 700, padding: "2px 7px" }}>{chatUnread} unread</span>}
                  <button onClick={() => { setChatOpen(false); setActiveConv(null); }} style={{ width: 24, height: 24, borderRadius: 6, background: t.navActiveBg, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: t.textSec, fontSize: 14, flexShrink: 0 }}>×</button>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
                  {conversations.map(conv => (
                    <div key={conv.id} onClick={() => setActiveConv(conv.id)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", cursor: "pointer", transition: "background 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = t.navActiveBg + "66")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: t.accent, color: t.accentFg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{conv.avatar}</div>
                        {conv.online && <div style={{ position: "absolute", bottom: 1, right: 1, width: 9, height: 9, borderRadius: "50%", background: "#22C55E", border: `2px solid ${t.cardBg}` }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: t.textPri, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conv.customerName}</span>
                          <span style={{ fontSize: 10, color: t.textMuted, flexShrink: 0, marginLeft: 4 }}>{conv.lastTime}</span>
                        </div>
                        <div style={{ fontSize: 11, color: t.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>{conv.lastMsg}</div>
                      </div>
                      {conv.unread > 0 && <span style={{ background: t.accent, color: t.accentFg, borderRadius: 10, fontSize: 9.5, fontWeight: 700, padding: "2px 6px", flexShrink: 0 }}>{conv.unread}</span>}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div style={{ padding: "12px 14px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <button onClick={() => setActiveConv(null)} style={{ background: "none", border: "none", cursor: "pointer", color: t.textSec, display: "flex", padding: 4, borderRadius: 5 }} title="Back"><BackArrowIcon /></button>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: t.accent, color: t.accentFg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{activeConv.avatar}</div>
                    {activeConv.online && <div style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, borderRadius: "50%", background: "#22C55E", border: `2px solid ${t.cardBg}` }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: t.textPri, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeConv.customerName}</div>
                    <div style={{ fontSize: 10, color: activeConv.online ? "#22C55E" : t.textMuted, marginTop: 1 }}>{activeConv.online ? "Online" : "Offline"}</div>
                  </div>
                  <button onClick={() => { router.push(`/dashboard/super-admin/customers/profile?id=${activeConv.customerId}`); setChatOpen(false); setActiveConv(null); }} style={{ fontSize: 10, fontWeight: 600, color: t.accent, background: t.navActiveBg, border: `1px solid ${t.border}`, borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", flexShrink: 0 }}>View Profile</button>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 8px" }}>
                  {activeConv.messages.map(msg => {
                    const isAdmin = msg.from === "admin";
                    return (
                      <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isAdmin ? "flex-end" : "flex-start", marginBottom: 8 }}>
                        <div style={{ maxWidth: "82%", padding: "8px 11px", borderRadius: isAdmin ? "10px 10px 2px 10px" : "10px 10px 10px 2px", background: isAdmin ? t.accent : t.navActiveBg, color: isAdmin ? t.accentFg : t.textPri, fontSize: 12, lineHeight: 1.45 }}>{msg.text}</div>
                        <div style={{ fontSize: 9.5, color: t.textMuted, marginTop: 3 }}>{msg.time}</div>
                      </div>
                    );
                  })}
                  <div ref={msgEndRef} />
                </div>
                <div style={{ padding: "10px 12px 12px", borderTop: `1px solid ${t.border}`, display: "flex", gap: 8, flexShrink: 0 }}>
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Type a message…" style={{ flex: 1, background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 8, padding: "8px 11px", fontSize: 12, color: t.textPri, outline: "none", fontFamily: "'DM Sans',sans-serif" }} />
                  <button onClick={handleSend} disabled={!chatInput.trim()} style={{ background: t.accent, color: t.accentFg, border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: chatInput.trim() ? "pointer" : "not-allowed", fontFamily: "'DM Sans',sans-serif", opacity: chatInput.trim() ? 1 : 0.45, transition: "opacity 0.15s" }}>Send</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
