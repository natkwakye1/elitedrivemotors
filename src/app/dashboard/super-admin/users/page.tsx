"use client";
// src/app/dashboard/super-admin/users/page.tsx

import { useTheme } from "@/src/context/ThemeContext";
import { useState, useMemo } from "react";

import AppShell from "@/src/components/layout/Appshell";
import TopBar from "@/src/components/layout/Topbar";
import AdminSidebar from "@/src/components/layout/AdminSidebar";
import type { AdminFilters } from "@/src/components/layout/AdminSidebar";

const USERS = [
  { id:1, name:"Kwame Asante", email:"kwame@gmail.com", role:"customer", status:"active", rentals:12, joined:"2024-01-15", avatar:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&q=80" },
  { id:2, name:"Abena Osei", email:"abena@yahoo.com", role:"customer", status:"active", rentals:7, joined:"2024-03-02", avatar:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&q=80" },
  { id:3, name:"Kofi Mensah", email:"kofi@outlook.com", role:"admin", status:"active", rentals:0, joined:"2023-11-20", avatar:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&q=80" },
  { id:4, name:"Ama Darko", email:"ama@gmail.com", role:"customer", status:"suspended", rentals:3, joined:"2024-05-10", avatar:"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&q=80" },
  { id:5, name:"Yaw Boateng", email:"yaw@email.com", role:"customer", status:"active", rentals:18, joined:"2023-09-07", avatar:"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&q=80" },
  { id:6, name:"Efua Asare", email:"efua@mail.com", role:"customer", status:"active", rentals:5, joined:"2024-07-22", avatar:"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&q=80" },
  { id:7, name:"Nana Adjei", email:"nana@gmail.com", role:"customer", status:"inactive", rentals:1, joined:"2024-08-01", avatar:"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&q=80" },
  { id:8, name:"Akosua Frimpong", email:"akosua@email.com", role:"customer", status:"active", rentals:9, joined:"2024-02-14", avatar:"https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=64&q=80" },
];

const STATUS_S: Record<string,{bg:string;color:string}> = {
  active: { bg:"rgba(16,185,129,0.12)", color:"#10B981" },
  suspended: { bg:"rgba(239,68,68,0.12)", color:"#EF4444" },
  inactive: { bg:"rgba(156,163,175,0.15)", color:"#9CA3AF" },
};
const ROLE_S: Record<string,{bg:string;color:string}> = {
  admin: { bg:"rgba(79,70,229,0.12)", color:"#4F46E5" },
  customer: { bg:"rgba(16,185,129,0.1)", color:"#059669" },
};
const STATUS_COLOR: Record<string,string> = { active:"#10B981", suspended:"#EF4444", inactive:"#9CA3AF" };
const ROLE_COLOR: Record<string,string> = { admin:"#4F46E5", customer:"#059669" };
const USER_STATUSES = ["active","suspended","inactive"];
const ROLES = ["admin","customer"];

export default function AdminUsersPage() {
  const { dark, setDark, t } = useTheme();
  const [filters, setFilters] = useState<AdminFilters>({ search:"", status:"All", role:"All" });

  const statusCounts = useMemo(() => {
    const c: Record<string,number> = {};
    USER_STATUSES.forEach(s => { c[s] = USERS.filter(u => u.status === s).length; });
    return c;
  }, []);
  const roleCounts = useMemo(() => {
    const c: Record<string,number> = {};
    ROLES.forEach(r => { c[r] = USERS.filter(u => u.role === r).length; });
    return c;
  }, []);

  const filtered = useMemo(() => USERS.filter(u => {
    if (filters.status !== "All" && u.status !== filters.status) return false;
    if (filters.role !== "All" && u.role !== (filters.role as string).toLowerCase()) return false;
    if (filters.search) {
      const q = (filters.search as string).toLowerCase();
      if (!u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [filters]);

  return (
    <AppShell active="All Users" dark={dark} setDark={setDark} t={t}>
      <TopBar title="User Management" subtitle={`${USERS.length} registered users`} breadcrumb={["dashboard","super-admin","Users"]} dark={dark} setDark={setDark} t={t}
        actions={<button style={{ padding:"7px 16px", borderRadius:8, border:"none", background:t.accent, color:t.accentFg, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>+ Invite User</button>}
      />
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        <AdminSidebar filters={filters} setFilters={setFilters} searchPlaceholder="Search users…" t={t}
          groups={[
            { key:"role", label:"Role", options:ROLES, colors:ROLE_COLOR, counts:roleCounts },
            { key:"status", label:"Account Status", options:USER_STATUSES, colors:STATUS_COLOR, counts:statusCounts },
          ]}
        />
        <div style={{ flex:1, overflowY:"auto", padding:"24px 28px", background:t.bg }}>
          <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, overflow:"hidden" }}>
            <div style={{ display:"grid", gridTemplateColumns:"2fr 2fr 1fr 1fr 1fr 1fr", padding:"12px 20px", borderBottom:`1px solid ${t.border}`, fontSize:11, fontWeight:600, color:t.textMuted, textTransform:"uppercase", letterSpacing:1 }}>
              <span>User</span><span>Email</span><span>Role</span><span>Status</span><span>Rentals</span><span>Actions</span>
            </div>
            {filtered.map((u, i) => {
              const ss = STATUS_S[u.status]; const rs = ROLE_S[u.role];
              return (
                <div key={u.id} style={{ display:"grid", gridTemplateColumns:"2fr 2fr 1fr 1fr 1fr 1fr", padding:"14px 20px", borderBottom: i < filtered.length-1 ? `1px solid ${t.divider}` : "none", alignItems:"center", transition:"background 0.15s" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <img src={u.avatar} alt={u.name} style={{ width:32, height:32, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
                    <div><div style={{ fontSize:13, fontWeight:600, color:t.textPri }}>{u.name}</div><div style={{ fontSize:11, color:t.textMuted }}>Joined {u.joined}</div></div>
                  </div>
                  <span style={{ fontSize:12, color:t.textSec }}>{u.email}</span>
                  <span style={{ fontSize:11, background:rs.bg, color:rs.color, borderRadius:20, padding:"3px 10px", fontWeight:600, textTransform:"capitalize", width:"fit-content" }}>{u.role}</span>
                  <span style={{ fontSize:11, background:ss.bg, color:ss.color, borderRadius:20, padding:"3px 10px", fontWeight:600, textTransform:"capitalize", width:"fit-content" }}>{u.status}</span>
                  <span style={{ fontSize:13, fontWeight:600, color:t.textPri }}>{u.rentals}</span>
                  <div style={{ display:"flex", gap:6 }}>
                    <button style={{ padding:"5px 10px", borderRadius:6, border:`1px solid ${t.border}`, background:t.bg, color:t.textSec, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Edit</button>
                    <button style={{ padding:"5px 10px", borderRadius:6, border:"1px solid rgba(239,68,68,0.3)", background:"rgba(239,68,68,0.08)", color:"#EF4444", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Ban</button>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && <div style={{ padding:40, textAlign:"center", color:t.textMuted, fontSize:13 }}>No users found.</div>}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
