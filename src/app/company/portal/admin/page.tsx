"use client";
// src/app/company/portal/admin/page.tsx
// Reusable portal — same URL for every dealership admin. Content driven by SaasContext.

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/src/context/ThemeContext";
import { useSaas } from "@/src/context/SaasContext";
import {
  CompanyRole, CompanyUser, LeaveRequest, PermissionKey,
  DEFAULT_ROLE_PERMISSIONS, PLANS, CompanyCar, ServiceType, CarStatus,
} from "@/src/lib/saas-types";
import { Ic } from "@/src/components/ui/Icons";

type Section = "overview" | "team" | "permissions" | "leaves" | "cars" | "settings";

const PERM_LABELS: Record<PermissionKey, string> = {
  manage_cars:"Manage Cars", manage_customers:"Manage Customers",
  manage_bookings:"Manage Bookings", manage_payments:"Manage Payments",
  view_reports:"View Reports", manage_employees:"Manage Employees",
  manage_roles:"Manage Roles", approve_leave:"Approve Leave",
  submit_leave:"Submit Leave", view_payroll:"View Payroll",
  manage_settings:"Manage Settings", manage_swaps:"Manage Swaps",
  manage_rentals:"Manage Rentals",
};
const ALL_PERMS = Object.keys(PERM_LABELS) as PermissionKey[];
const ROLE_OPTIONS: CompanyRole[] = ["admin", "finance", "employee"];

interface CredModal { email:string; tempPassword:string; name:string }

export default function CompanyAdminPortal() {
  const router = useRouter();
  const { dark, setDark } = useTheme();
  const {
    currentUser, currentCompany, saasLogout,
    allUsers, addUser, removeUser, updateUser,
    grantPermission, revokePermission, setUserRole,
    blockUser, unblockUser, resetCredentials,
    leaves, reviewLeave,
    companyCars, addCar, updateCar, removeCar,
  } = useSaas();

  const [section,  setSection]  = useState<Section>("overview");
  const [sideOpen, setSideOpen] = useState(true);

  // Add user form
  const [showAdd,     setShowAdd]     = useState(false);
  const [newName,     setNewName]     = useState("");
  const [newRole,     setNewRole]     = useState<CompanyRole>("employee");
  const [newPos,      setNewPos]      = useState("");
  const [newPhone,    setNewPhone]    = useState("");
  const [addErr,      setAddErr]      = useState("");
  const [addLoading,  setAddLoading]  = useState(false);

  // Credential modal (shown after add or reset)
  const [credModal,   setCredModal]   = useState<CredModal | null>(null);
  const [copied,      setCopied]      = useState(false);

  // Permissions
  const [selUserId,   setSelUserId]   = useState("");

  // Cars
  const [showAddCar,  setShowAddCar]  = useState(false);
  const [editCarId,   setEditCarId]   = useState<string|null>(null);
  const [carName,     setCarName]     = useState("");
  const [carSpec,     setCarSpec]     = useState("");
  const [carService,  setCarService]  = useState<ServiceType>("rental");
  const [carPrice,    setCarPrice]    = useState("");
  const [carImage,    setCarImage]    = useState("");
  const [carBody,     setCarBody]     = useState("");
  const [carFuel,     setCarFuel]     = useState("Petrol");
  const [carTrans,    setCarTrans]    = useState("Automatic");
  const [carSeats,    setCarSeats]    = useState("5");
  const [carYear,     setCarYear]     = useState(String(new Date().getFullYear()));
  const [carErr,      setCarErr]      = useState("");
  const [carLoading,  setCarLoading]  = useState(false);
  const [carFilter,   setCarFilter]   = useState<ServiceType|"all">("all");

  // Redirects
  if (!currentUser || !currentCompany) { router.replace("/login"); return null; }

  // Non-null aliases — safe after the guard above
  const cUser    = currentUser!;
  const cCompany = currentCompany!;

  const canTeam    = cUser.permissions.includes("manage_employees");
  const canRoles   = cUser.permissions.includes("manage_roles");
  const canLeave   = cUser.permissions.includes("approve_leave");
  const canSettings= cUser.permissions.includes("manage_settings");
  const canCars    = cUser.permissions.includes("manage_cars");

  const plan       = PLANS.find(p => p.tier === cCompany.plan)!;
  const activeCount= allUsers.filter(u => u.status === "active").length;
  const limit      = plan.employeeLimit === Infinity ? null : plan.employeeLimit;
  const siteUrl    = `elitedrivemotors.vercel.app/dealers/${cCompany.slug}`;
  const pendingLeaves = leaves.filter(l => l.status === "pending");

  // Theme
  const ACC    = dark ? "#ffffff" : "#111111";
  const ACC_FG = dark ? "#000000" : "#ffffff";
  const BG     = dark ? "#0a0a0a" : "#f5f5f5";
  const CARD   = dark ? "#141414" : "#ffffff";
  const SIDE   = dark ? "#111111" : "#fafafa";
  const BORDER = dark ? "rgba(255,255,255,0.08)" : "#e8e8e8";
  const MUTED  = dark ? "rgba(255,255,255,0.42)" : "#888888";
  const HEAD   = dark ? "#f0f0f0" : "#111111";
  const SUBTLE = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";
  const SIDE_W = sideOpen ? 230 : 60;

  const NAV: { id:Section; label:string; icon:React.ReactNode }[] = [
    { id:"overview",    label:"Overview",    icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6"/></svg> },
    { id:"team",        label:"Team",        icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { id:"permissions", label:"Permissions", icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg> },
    { id:"leaves",      label:"Leaves",      icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg> },
    { id:"cars",        label:"Cars",        icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 17H3a2 2 0 01-2-2v-5l2.5-5h13l2.5 5v5a2 2 0 01-2 2h-2M7 17a2 2 0 104 0 2 2 0 00-4 0zm6 0a2 2 0 104 0 2 2 0 00-4 0z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { id:"settings",    label:"Settings",    icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.6"/></svg> },
  ];

  // ── Add user ──────────────────────────────────────────────────────────────
  async function handleAddUser() {
    if (!newName.trim()) { setAddErr("Enter a full name."); return; }
    setAddLoading(true); setAddErr("");
    const res = await addUser({ name:newName.trim(), role:newRole, position:newPos||undefined, phone:newPhone||undefined });
    setAddLoading(false);
    if (res.ok && res.user) {
      const tempPw = `${res.user.name.split(" ")[0].toLowerCase()}@${cCompany.slug}`;
      setCredModal({ email:res.user.email, tempPassword:tempPw, name:res.user.name });
      setShowAdd(false); setNewName(""); setNewRole("employee"); setNewPos(""); setNewPhone("");
    } else { setAddErr(res.error ?? "Failed to add."); }
  }

  async function handleReset(user:CompanyUser) {
    const creds = await resetCredentials(user.id);
    setCredModal({ ...creds, name:user.name });
  }

  function resetCarForm() {
    setCarName(""); setCarSpec(""); setCarService("rental"); setCarPrice("");
    setCarImage(""); setCarBody(""); setCarFuel("Petrol"); setCarTrans("Automatic");
    setCarSeats("5"); setCarYear(String(new Date().getFullYear())); setCarErr("");
    setEditCarId(null);
  }

  function loadCarIntoForm(car: CompanyCar) {
    setCarName(car.name); setCarSpec(car.spec); setCarService(car.serviceType);
    setCarPrice(String(car.price)); setCarImage(car.imageUrl); setCarBody(car.bodyType);
    setCarFuel(car.fuel); setCarTrans(car.transmission); setCarSeats(String(car.seats));
    setCarYear(String(car.year)); setEditCarId(car.id); setCarErr(""); setShowAddCar(true);
  }

  async function handleSaveCar() {
    if (!carName.trim()) { setCarErr("Car name is required."); return; }
    if (!carBody.trim()) { setCarErr("Body type is required (e.g. SUV, Sedan)."); return; }
    const priceNum = parseFloat(carPrice);
    if (isNaN(priceNum) || priceNum < 0) { setCarErr("Enter a valid price."); return; }
    setCarLoading(true); setCarErr("");
    const payload = {
      name: carName.trim(), spec: carSpec.trim(),
      serviceType: carService, price: priceNum, currency: "GHS",
      imageUrl: carImage.trim() || "/car-placeholder.jpg",
      bodyType: carBody.trim(), fuel: carFuel, transmission: carTrans,
      seats: parseInt(carSeats) || 5, year: parseInt(carYear) || new Date().getFullYear(),
      status: "available" as CarStatus,
    };
    if (editCarId) {
      updateCar(editCarId, payload);
    } else {
      addCar(payload);
    }
    setCarLoading(false);
    resetCarForm(); setShowAddCar(false);
  }

  function copyCredentials() {
    if (!credModal) return;
    navigator.clipboard.writeText(`Company: ${cCompany.name}\nEmail: ${credModal.email}\nPassword: ${credModal.tempPassword}\nPortal: ${window.location.origin}/company/portal/${cUser.role}`);
    setCopied(true);
    setTimeout(()=>setCopied(false), 2000);
  }

  function shareWhatsApp() {
    if (!credModal) return;
    const text = encodeURIComponent(`Hi ${credModal.name}, here are your login credentials for ${cCompany.name} portal:\n\nEmail: ${credModal.email}\nPassword: ${credModal.tempPassword}\nLogin: ${window.location.origin}/login\n\nPlease change your password after first login.`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  function shareEmail() {
    if (!credModal) return;
    const sub = encodeURIComponent(`Your ${cCompany.name} Portal Access`);
    const body = encodeURIComponent(`Hi ${credModal.name},\n\nYour login credentials:\n\nEmail: ${credModal.email}\nPassword: ${credModal.tempPassword}\nPortal: ${window.location.origin}/login\n\nPlease update your password after first login.\n\n${cCompany.name}`);
    window.open(`mailto:?subject=${sub}&body=${body}`, "_self");
  }

  const selUser = allUsers.find(u => u.id === selUserId) ?? null;

  // ── Stat card ─────────────────────────────────────────────────────────────
  const Stat = ({ label, value, sub }: { label:string; value:string|number; sub?:string }) => (
    <div style={{ background:CARD, borderRadius:14, border:`1px solid ${BORDER}`, padding:"20px 22px" }}>
      <div style={{ fontSize:28, fontWeight:900, color:HEAD, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:12, color:MUTED, marginTop:5 }}>{label}</div>
      {sub && <div style={{ fontSize:10, color:MUTED, marginTop:2 }}>{sub}</div>}
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:${BG};font-family:'DM Sans',sans-serif}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:${dark?"rgba(255,255,255,0.12)":"#ddd"};border-radius:4px}
        input,select,textarea{outline:none;font-family:'DM Sans',sans-serif}
        input:focus,select:focus,textarea:focus{border-color:${ACC}!important}
        input::placeholder,textarea::placeholder{color:${MUTED}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .fade{animation:fadeUp 0.25s ease both}
        @keyframes scaleIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
        .modal-in{animation:scaleIn 0.2s ease both}
        .form-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .form-grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}
        .form-grid-4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:14px}
        @media(max-width:700px){
          .form-grid-2,.form-grid-3,.form-grid-4{grid-template-columns:1fr 1fr}
        }
        @media(max-width:480px){
          .form-grid-2,.form-grid-3,.form-grid-4{grid-template-columns:1fr}
        }
        .portal-layout{display:flex;height:100vh;overflow:hidden}
        @media(max-width:600px){
          .portal-layout{flex-direction:column;height:auto;min-height:100vh}
          .portal-sidebar{width:100%!important;height:auto;flex-direction:row!important;border-right:none!important;border-bottom:1px solid ${BORDER}}
          .portal-main{overflow-y:auto}
        }
      `}</style>

      {/* Credential modal */}
      {credModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div className="modal-in" style={{ background:CARD, borderRadius:18, border:`1px solid ${BORDER}`, padding:"28px 28px", maxWidth:440, width:"100%", boxShadow:"0 24px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ fontSize:15, fontWeight:800, color:HEAD, marginBottom:4 }}>Credentials Ready</div>
            <div style={{ fontSize:12, color:MUTED, marginBottom:22 }}>Share these login details with <strong style={{ color:HEAD }}>{credModal.name}</strong></div>

            {[
              { label:"Login Portal", value:`${typeof window!=="undefined"?window.location.origin:""}/login` },
              { label:"Email",        value:credModal.email },
              { label:"Password",     value:credModal.tempPassword },
            ].map(r => (
              <div key={r.label} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${BORDER}` }}>
                <span style={{ fontSize:12, color:MUTED }}>{r.label}</span>
                <span style={{ fontSize:12, fontWeight:700, color:HEAD, fontFamily:"monospace" }}>{r.value}</span>
              </div>
            ))}

            <div style={{ fontSize:11, color:MUTED, marginTop:14, marginBottom:22, padding:"10px 14px", borderRadius:9, background:SUBTLE, border:`1px solid ${BORDER}` }}>
              Employee must change their password on first login. These credentials expire once they log in.
            </div>

            <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:14 }}>
              <button onClick={copyCredentials} style={{ flex:1, minWidth:110, padding:"9px 0", borderRadius:9, border:`1px solid ${BORDER}`, background:copied?`${ACC}15`:SUBTLE, color:copied?"#10B981":HEAD, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s" }}>
                {copied ? "Copied!" : "Copy All"}
              </button>
              <button onClick={shareWhatsApp} style={{ flex:1, minWidth:110, padding:"9px 0", borderRadius:9, border:"1px solid rgba(37,211,102,0.3)", background:"rgba(37,211,102,0.06)", color:"#25D366", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                WhatsApp
              </button>
              <button onClick={shareEmail} style={{ flex:1, minWidth:110, padding:"9px 0", borderRadius:9, border:`1px solid ${BORDER}`, background:SUBTLE, color:HEAD, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                Email
              </button>
            </div>
            <button onClick={()=>setCredModal(null)} style={{ width:"100%", padding:"10px 0", borderRadius:9, border:"none", background:ACC, color:ACC_FG, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Done</button>
          </div>
        </div>
      )}

      <div className="portal-layout" style={{ background:BG, fontFamily:"'DM Sans',sans-serif" }}>

        {/* ── Sidebar ── */}
        <div className="portal-sidebar" style={{ width:SIDE_W, flexShrink:0, background:SIDE, borderRight:`1px solid ${BORDER}`, display:"flex", flexDirection:"column", transition:"width 0.22s ease", overflow:"hidden" }}>
          {/* Logo */}
          <div style={{ height:58, borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", padding:"0 14px", gap:10, overflow:"hidden" }}>
            <div style={{ width:30, height:30, borderRadius:8, flexShrink:0, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", background: cCompany.logoDataUrl?"transparent":ACC }}>
              {cCompany.logoDataUrl
                ? <img src={cCompany.logoDataUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                : <span style={{ fontSize:11, fontWeight:800, color:ACC_FG }}>{cCompany.name[0]}</span>}
            </div>
            {sideOpen && (
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:800, color:HEAD, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{cCompany.name}</div>
                <div style={{ fontSize:10, color:MUTED }}>{plan.name} plan</div>
              </div>
            )}
            <div style={{ marginLeft:"auto", flexShrink:0, cursor:"pointer", padding:4 }} onClick={()=>setSideOpen(s=>!s)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d={sideOpen?"M15 18l-6-6 6-6":"M9 18l6-6-6-6"} stroke={MUTED} strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex:1, padding:"10px 8px", display:"flex", flexDirection:"column", gap:3, overflowY:"auto" }}>
            {NAV.map(item => {
              const active = section === item.id;
              return (
                <button key={item.id} onClick={()=>setSection(item.id)}
                  style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 10px", borderRadius:9, border:"none", background:active?`${ACC}10`:"transparent", color:active?ACC:MUTED, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:active?700:500, textAlign:"left", transition:"all 0.15s", whiteSpace:"nowrap", overflow:"hidden", position:"relative" }}>
                  <span style={{ flexShrink:0 }}>{item.icon}</span>
                  {sideOpen && <span>{item.label}</span>}
                  {sideOpen && item.id === "leaves" && pendingLeaves.length > 0 && (
                    <span style={{ marginLeft:"auto", background:ACC, color:ACC_FG, fontSize:9, fontWeight:800, padding:"2px 6px", borderRadius:20, lineHeight:1.4 }}>{pendingLeaves.length}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User footer */}
          <div style={{ borderTop:`1px solid ${BORDER}`, padding:"12px 10px" }}>
            {sideOpen && (
              <div style={{ marginBottom:8, padding:"8px 8px", borderRadius:8, background:SUBTLE }}>
                <div style={{ fontSize:12, fontWeight:700, color:HEAD }}>{cUser.name}</div>
                <div style={{ fontSize:10, color:MUTED, textTransform:"capitalize" }}>{cUser.role}</div>
              </div>
            )}
            <button onClick={()=>{ saasLogout(); router.replace("/login"); }}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 8px", border:"none", background:"transparent", color:MUTED, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12, width:"100%", borderRadius:7, transition:"color 0.15s" }}
              onMouseEnter={e=>(e.currentTarget.style.color="#ef4444")}
              onMouseLeave={e=>(e.currentTarget.style.color=MUTED)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {sideOpen && "Sign Out"}
            </button>
          </div>
        </div>

        {/* ── Main ── */}
        <div className="portal-main" style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>

          {/* Top bar */}
          <div style={{ height:58, borderBottom:`1px solid ${BORDER}`, background:CARD, display:"flex", alignItems:"center", padding:"0 24px", gap:12, flexShrink:0 }}>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:15, fontWeight:800, color:HEAD }}>{NAV.find(n=>n.id===section)?.label}</div>
              <div style={{ fontSize:11, color:MUTED, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{cCompany.name} · Admin Portal</div>
            </div>
            <div style={{ flex:1 }}/>
            <button onClick={()=>router.push(`/dealers/${cCompany.slug}`)} title="View public page"
              style={{ display:"flex", alignItems:"center", gap:7, padding:"7px 14px", borderRadius:8, border:`1px solid ${BORDER}`, background:SUBTLE, color:MUTED, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Public Page
            </button>
            <button onClick={()=>setDark(!dark)} style={{ width:34, height:34, borderRadius:8, border:`1px solid ${BORDER}`, background:SUBTLE, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
              {dark?Ic.Sun(MUTED):Ic.Moon(MUTED)}
            </button>
          </div>

          {/* Content */}
          <div className="fade" key={section} style={{ flex:1, overflowY:"auto", padding:"28px 24px" }}>

            {/* ════ OVERVIEW ════ */}
            {section === "overview" && (
              <div>
                {/* Site URL banner */}
                <div style={{ background:CARD, borderRadius:14, border:`1px solid ${BORDER}`, padding:"18px 22px", marginBottom:24, display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Your Public Dealership URL</div>
                    <div style={{ fontSize:13, fontWeight:700, color:HEAD, fontFamily:"monospace", wordBreak:"break-all" }}>{siteUrl}</div>
                  </div>
                  <button onClick={()=>{ navigator.clipboard.writeText(`https://${siteUrl}`); }}
                    style={{ padding:"8px 16px", borderRadius:8, border:`1px solid ${BORDER}`, background:SUBTLE, color:HEAD, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", flexShrink:0 }}>
                    Copy URL
                  </button>
                  <button onClick={()=>router.push(`/dealers/${cCompany.slug}`)}
                    style={{ padding:"8px 16px", borderRadius:8, border:"none", background:ACC, color:ACC_FG, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", flexShrink:0 }}>
                    View Page
                  </button>
                </div>

                {/* Stats */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))", gap:14, marginBottom:28 }}>
                  <Stat label="Total Members"   value={allUsers.length}/>
                  <Stat label="Active"           value={activeCount} sub={limit ? `${activeCount}/${limit} used` : "Unlimited"}/>
                  <Stat label="Pending Onboard"  value={allUsers.filter(u=>u.status==="pending").length}/>
                  <Stat label="Blocked"          value={allUsers.filter(u=>u.status==="inactive").length}/>
                  <Stat label="Leave Requests"   value={pendingLeaves.length} sub="awaiting review"/>
                  <Stat label="Cars Listed"      value={companyCars.length} sub={`${companyCars.filter(c=>c.status==="available").length} available`}/>
                </div>

                {/* Plan bar */}
                {limit && (
                  <div style={{ background:CARD, borderRadius:14, border:`1px solid ${BORDER}`, padding:"18px 22px", marginBottom:24 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:HEAD }}>{plan.name} Plan — Team Capacity</div>
                      <div style={{ fontSize:12, color:MUTED }}>{activeCount}/{limit}</div>
                    </div>
                    <div style={{ height:6, borderRadius:3, background:BORDER, overflow:"hidden" }}>
                      <div style={{ height:"100%", borderRadius:3, width:`${Math.min((activeCount/limit)*100,100)}%`, background: activeCount/limit > 0.85 ? "#ef4444" : ACC, transition:"width 0.4s" }}/>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
                      <span style={{ fontSize:11, color:MUTED }}>{limit - activeCount} seats remaining</span>
                      <span onClick={()=>router.push("/onboarding")} style={{ fontSize:11, color:MUTED, cursor:"pointer", textDecoration:"underline" }}>Upgrade plan</span>
                    </div>
                  </div>
                )}

                {/* Team snapshot */}
                <div style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:12 }}>Team</div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {allUsers.slice(0,6).map(u => <UserRow key={u.id} u={u} t={{ CARD,BORDER,HEAD,MUTED,ACC,ACC_FG,SUBTLE }} compact/>)}
                  {allUsers.length === 0 && <Empty label="No team members yet — go to Team to add one." t={{ MUTED }}/>}
                </div>
              </div>
            )}

            {/* ════ TEAM ════ */}
            {section === "team" && (
              <div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:10 }}>
                  <div style={{ fontSize:13, color:MUTED }}>{allUsers.length} member{allUsers.length!==1?"s":""}{limit?` · ${limit-activeCount} seats left`:""}</div>
                  {canTeam && (
                    <button onClick={()=>{ setShowAdd(true); setAddErr(""); }}
                      style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 18px", borderRadius:9, border:"none", background:ACC, color:ACC_FG, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke={ACC_FG} strokeWidth="2.2" strokeLinecap="round"/></svg>
                      Add Member
                    </button>
                  )}
                </div>

                {/* Add panel */}
                {showAdd && canTeam && (
                  <div style={{ background:CARD, borderRadius:14, border:`1px solid ${BORDER}`, padding:"22px 24px", marginBottom:20 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:HEAD, marginBottom:18 }}>New Team Member</div>
                    <div className="form-grid-2" style={{ marginBottom:14 }}>
                      <LabeledInput label="Full Name *" value={newName} onChange={setNewName} placeholder="e.g. Ama Boateng" t={{ BORDER, SUBTLE, HEAD, MUTED }}/>
                      <div>
                        <div style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:1, marginBottom:7 }}>Role</div>
                        <select value={newRole} onChange={e=>setNewRole(e.target.value as CompanyRole)}
                          style={{ width:"100%", padding:"10px 12px", borderRadius:9, border:`1.5px solid ${BORDER}`, background:dark?"#1a1a1a":CARD, color:HEAD, fontSize:13, boxSizing:"border-box" as const }}>
                          {ROLE_OPTIONS.map(r=><option key={r} value={r} style={{ color:"#000" }}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-grid-2" style={{ marginBottom:16 }}>
                      <LabeledInput label="Position" value={newPos} onChange={setNewPos} placeholder="e.g. Fleet Manager" t={{ BORDER, SUBTLE, HEAD, MUTED }}/>
                      <LabeledInput label="Phone" value={newPhone} onChange={setNewPhone} placeholder="+233 20 000 0000" t={{ BORDER, SUBTLE, HEAD, MUTED }}/>
                    </div>
                    {addErr && <ErrBox msg={addErr} t={{ BORDER }}/>}
                    <div style={{ display:"flex", gap:10 }}>
                      <button onClick={()=>setShowAdd(false)} style={{ padding:"9px 18px", borderRadius:9, border:`1px solid ${BORDER}`, background:"transparent", color:HEAD, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
                      <button onClick={handleAddUser} disabled={addLoading}
                        style={{ padding:"9px 22px", borderRadius:9, border:"none", background:ACC, color:ACC_FG, fontSize:13, fontWeight:700, cursor:addLoading?"not-allowed":"pointer", fontFamily:"'DM Sans',sans-serif", opacity:addLoading?0.6:1 }}>
                        {addLoading?"Adding…":"Add & Generate Credentials"}
                      </button>
                    </div>
                  </div>
                )}

                {/* User list */}
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {allUsers.map(u => {
                    const isOwner = u.role === "owner";
                    const isSelf  = u.id === cUser.id;
                    return (
                      <div key={u.id} style={{ background:CARD, borderRadius:12, border:`1px solid ${u.status==="inactive"?"rgba(239,68,68,0.18)":BORDER}`, padding:"14px 18px", display:"flex", alignItems:"center", gap:14, flexWrap:"wrap", opacity:u.status==="inactive"?0.75:1 }}>
                        <AvatarChip name={u.name} color={u.avatarColor} avatar={u.avatar}/>
                        <div style={{ flex:1, minWidth:120 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:HEAD }}>
                            {u.name}
                            {isSelf && <span style={{ fontSize:10, color:MUTED, marginLeft:6 }}>(you)</span>}
                            {u.status === "inactive" && <span style={{ fontSize:10, color:"#ef4444", marginLeft:6 }}>BLOCKED</span>}
                          </div>
                          <div style={{ fontSize:11, color:MUTED, fontFamily:"monospace" }}>{u.email}</div>
                          {u.position && <div style={{ fontSize:11, color:MUTED }}>{u.position}</div>}
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                          <RoleBadge role={u.role} t={{ SUBTLE, BORDER, MUTED }}/>
                          <StatusBadge status={u.status}/>
                        </div>
                        {canTeam && !isOwner && !isSelf && (
                          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                            <button onClick={()=>handleReset(u)}
                              style={outlineBtn(BORDER, MUTED)}>Reset PW</button>
                            {u.status === "inactive"
                              ? <button onClick={()=>unblockUser(u.id)} style={outlineBtn("rgba(16,185,129,0.3)","#10B981")}>Unblock</button>
                              : <button onClick={()=>blockUser(u.id)} style={outlineBtn("rgba(239,68,68,0.3)","#ef4444")}>Block</button>}
                            {u.status === "pending" && (
                              <button onClick={()=>updateUser(u.id,{status:"active"})} style={outlineBtn("rgba(16,185,129,0.3)","#10B981")}>Activate</button>
                            )}
                            <button onClick={()=>{ if(confirm(`Remove ${u.name}?`)) removeUser(u.id); }} style={outlineBtn("rgba(239,68,68,0.2)","#ef4444")}>Remove</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {allUsers.length === 0 && <Empty label="No team members. Add your first." t={{ MUTED }}/>}
                </div>
              </div>
            )}

            {/* ════ PERMISSIONS ════ */}
            {section === "permissions" && (
              <div>
                {!canRoles && <PermWarn t={{ BORDER, MUTED }}/>}
                <div style={{ marginBottom:22 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Select Team Member</div>
                  <select value={selUserId} onChange={e=>setSelUserId(e.target.value)}
                    style={{ padding:"10px 14px", borderRadius:10, border:`1.5px solid ${BORDER}`, background:dark?"#1a1a1a":CARD, color:HEAD, fontSize:13, minWidth:260, fontFamily:"'DM Sans',sans-serif" }}>
                    <option value="">Choose a team member…</option>
                    {allUsers.filter(u=>u.role!=="owner").map(u=>(
                      <option key={u.id} value={u.id} style={{ color:"#000" }}>{u.name} — {u.role}</option>
                    ))}
                  </select>
                </div>

                {selUser && (
                  <div>
                    {/* Role change */}
                    <div style={{ background:CARD, borderRadius:14, border:`1px solid ${BORDER}`, padding:"20px 22px", marginBottom:16 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:HEAD, marginBottom:12 }}>Role — {selUser.name}</div>
                      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                        {ROLE_OPTIONS.map(r => (
                          <button key={r} onClick={()=>canRoles&&setUserRole(selUser.id,r)}
                            style={{ padding:"8px 18px", borderRadius:9, border:`1.5px solid ${selUser.role===r?ACC:BORDER}`, background:selUser.role===r?`${ACC}10`:"transparent", color:selUser.role===r?ACC:MUTED, fontSize:12, fontWeight:600, cursor:canRoles?"pointer":"not-allowed", fontFamily:"'DM Sans',sans-serif", opacity:canRoles?1:0.5 }}>
                            {r.charAt(0).toUpperCase()+r.slice(1)}
                          </button>
                        ))}
                      </div>
                      <div style={{ fontSize:11, color:MUTED, marginTop:10 }}>Changing role resets all permissions to role defaults.</div>
                    </div>

                    {/* Permission toggles */}
                    <div style={{ background:CARD, borderRadius:14, border:`1px solid ${BORDER}`, padding:"20px 22px" }}>
                      <div style={{ fontSize:13, fontWeight:700, color:HEAD, marginBottom:4 }}>Individual Permissions</div>
                      <div style={{ fontSize:11, color:MUTED, marginBottom:16 }}>Toggle access for this member. Changes apply instantly.</div>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:8 }}>
                        {ALL_PERMS.map(perm => {
                          const has = selUser.permissions.includes(perm);
                          return (
                            <div key={perm} onClick={()=>{ if(!canRoles) return; has?revokePermission(selUser.id,perm):grantPermission(selUser.id,perm); }}
                              style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px", borderRadius:10, border:`1px solid ${has?ACC:BORDER}`, background:has?`${ACC}06`:SUBTLE, cursor:canRoles?"pointer":"not-allowed", opacity:canRoles?1:0.5, transition:"all 0.15s", userSelect:"none" as const }}>
                              <div style={{ width:18, height:18, borderRadius:5, border:`1.5px solid ${has?ACC:BORDER}`, background:has?ACC:"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s" }}>
                                {has && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke={ACC_FG} strokeWidth="1.8" strokeLinecap="round"/></svg>}
                              </div>
                              <span style={{ fontSize:12, color:has?HEAD:MUTED, fontWeight:has?600:400 }}>{PERM_LABELS[perm]}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ════ LEAVES ════ */}
            {section === "leaves" && (
              <div>
                {!canLeave && <PermWarn t={{ BORDER, MUTED }}/>}
                {pendingLeaves.length > 0 && (
                  <div style={{ marginBottom:28 }}>
                    <SectionLabel label="Pending" t={{ MUTED }}/>
                    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                      {pendingLeaves.map(l=><LeaveCard key={l.id} leave={l} canApprove={canLeave} onReview={reviewLeave} t={{ CARD,BORDER,HEAD,MUTED,SUBTLE }}/>)}
                    </div>
                  </div>
                )}
                {leaves.filter(l=>l.status!=="pending").length > 0 && (
                  <div>
                    <SectionLabel label="Reviewed" t={{ MUTED }}/>
                    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                      {leaves.filter(l=>l.status!=="pending").map(l=><LeaveCard key={l.id} leave={l} canApprove={false} onReview={reviewLeave} t={{ CARD,BORDER,HEAD,MUTED,SUBTLE }}/>)}
                    </div>
                  </div>
                )}
                {leaves.length === 0 && <Empty label="No leave requests yet." t={{ MUTED }}/>}
              </div>
            )}

            {/* ════ CARS ════ */}
            {section === "cars" && (
              <div>
                {!canCars && <PermWarn t={{ BORDER, MUTED }}/>}

                {/* Header row */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:10 }}>
                  <div>
                    <div style={{ fontSize:13, color:MUTED }}>{companyCars.length} car{companyCars.length!==1?"s":""} in inventory</div>
                  </div>
                  {canCars && (
                    <button onClick={()=>{ resetCarForm(); setShowAddCar(true); }}
                      style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 18px", borderRadius:9, border:"none", background:ACC, color:ACC_FG, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke={ACC_FG} strokeWidth="2.2" strokeLinecap="round"/></svg>
                      Add Car
                    </button>
                  )}
                </div>

                {/* Service filter tabs */}
                {companyCars.length > 0 && (
                  <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
                    {(["all","rental","sale","swap"] as const).map(f => (
                      <button key={f} onClick={()=>setCarFilter(f)}
                        style={{ padding:"6px 16px", borderRadius:20, border:`1.5px solid ${carFilter===f?ACC:BORDER}`, background:carFilter===f?`${ACC}10`:"transparent", color:carFilter===f?ACC:MUTED, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", textTransform:"capitalize" as const, transition:"all 0.15s" }}>
                        {f === "all" ? `All (${companyCars.length})` : `${f.charAt(0).toUpperCase()+f.slice(1)} (${companyCars.filter(c=>c.serviceType===f).length})`}
                      </button>
                    ))}
                  </div>
                )}

                {/* Add / Edit car form */}
                {showAddCar && canCars && (
                  <div style={{ background:CARD, borderRadius:14, border:`1px solid ${BORDER}`, padding:"22px 24px", marginBottom:22 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:HEAD, marginBottom:18 }}>{editCarId ? "Edit Car" : "Add New Car"}</div>

                    <div className="form-grid-2" style={{ marginBottom:14 }}>
                      <LabeledInput label="Car Name *" value={carName} onChange={setCarName} placeholder="e.g. Toyota Land Cruiser" t={{ BORDER, SUBTLE, HEAD, MUTED }}/>
                      <LabeledInput label="Spec / Short Description" value={carSpec} onChange={setCarSpec} placeholder="e.g. V8, 4WD, 2023" t={{ BORDER, SUBTLE, HEAD, MUTED }}/>
                    </div>

                    <div className="form-grid-3" style={{ marginBottom:14 }}>
                      {/* Service type */}
                      <div>
                        <div style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase" as const, letterSpacing:1, marginBottom:7 }}>Service Type</div>
                        <select value={carService} onChange={e=>setCarService(e.target.value as ServiceType)}
                          style={{ width:"100%", padding:"10px 12px", borderRadius:9, border:`1.5px solid ${BORDER}`, background:dark?"#1a1a1a":CARD, color:HEAD, fontSize:13, boxSizing:"border-box" as const, fontFamily:"'DM Sans',sans-serif" }}>
                          <option value="rental" style={{ color:"#000" }}>Rental</option>
                          <option value="sale"   style={{ color:"#000" }}>For Sale</option>
                          <option value="swap"   style={{ color:"#000" }}>Swap</option>
                        </select>
                      </div>
                      {/* Price */}
                      <div>
                        <div style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase" as const, letterSpacing:1, marginBottom:7 }}>
                          Price (GHS){carService==="rental"?" /day":""}
                        </div>
                        <input value={carPrice} onChange={e=>setCarPrice(e.target.value)} type="number" min="0" placeholder="0.00"
                          style={{ width:"100%", padding:"10px 12px", borderRadius:9, border:`1.5px solid ${BORDER}`, background:SUBTLE, color:HEAD, fontSize:13, boxSizing:"border-box" as const, fontFamily:"'DM Sans',sans-serif" }}/>
                      </div>
                      {/* Body type */}
                      <LabeledInput label="Body Type *" value={carBody} onChange={setCarBody} placeholder="SUV, Sedan, Hatchback…" t={{ BORDER, SUBTLE, HEAD, MUTED }}/>
                    </div>

                    <div className="form-grid-4" style={{ marginBottom:14 }}>
                      {/* Fuel */}
                      <div>
                        <div style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase" as const, letterSpacing:1, marginBottom:7 }}>Fuel</div>
                        <select value={carFuel} onChange={e=>setCarFuel(e.target.value)}
                          style={{ width:"100%", padding:"10px 12px", borderRadius:9, border:`1.5px solid ${BORDER}`, background:dark?"#1a1a1a":CARD, color:HEAD, fontSize:13, boxSizing:"border-box" as const, fontFamily:"'DM Sans',sans-serif" }}>
                          {["Petrol","Diesel","Hybrid","Electric"].map(f=><option key={f} value={f} style={{ color:"#000" }}>{f}</option>)}
                        </select>
                      </div>
                      {/* Transmission */}
                      <div>
                        <div style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase" as const, letterSpacing:1, marginBottom:7 }}>Transmission</div>
                        <select value={carTrans} onChange={e=>setCarTrans(e.target.value)}
                          style={{ width:"100%", padding:"10px 12px", borderRadius:9, border:`1.5px solid ${BORDER}`, background:dark?"#1a1a1a":CARD, color:HEAD, fontSize:13, boxSizing:"border-box" as const, fontFamily:"'DM Sans',sans-serif" }}>
                          {["Automatic","Manual"].map(t=><option key={t} value={t} style={{ color:"#000" }}>{t}</option>)}
                        </select>
                      </div>
                      {/* Seats */}
                      <div>
                        <div style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase" as const, letterSpacing:1, marginBottom:7 }}>Seats</div>
                        <input value={carSeats} onChange={e=>setCarSeats(e.target.value)} type="number" min="1" max="50"
                          style={{ width:"100%", padding:"10px 12px", borderRadius:9, border:`1.5px solid ${BORDER}`, background:SUBTLE, color:HEAD, fontSize:13, boxSizing:"border-box" as const, fontFamily:"'DM Sans',sans-serif" }}/>
                      </div>
                      {/* Year */}
                      <div>
                        <div style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase" as const, letterSpacing:1, marginBottom:7 }}>Year</div>
                        <input value={carYear} onChange={e=>setCarYear(e.target.value)} type="number" min="1990" max="2030"
                          style={{ width:"100%", padding:"10px 12px", borderRadius:9, border:`1.5px solid ${BORDER}`, background:SUBTLE, color:HEAD, fontSize:13, boxSizing:"border-box" as const, fontFamily:"'DM Sans',sans-serif" }}/>
                      </div>
                    </div>

                    {/* Image URL */}
                    <div style={{ marginBottom:14 }}>
                      <LabeledInput label="Image URL (optional)" value={carImage} onChange={setCarImage} placeholder="https://…/car.jpg — leave blank for placeholder" t={{ BORDER, SUBTLE, HEAD, MUTED }}/>
                      {carImage && (
                        <div style={{ marginTop:8, width:120, height:72, borderRadius:9, overflow:"hidden", border:`1px solid ${BORDER}` }}>
                          <img src={carImage} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>{ (e.target as HTMLImageElement).style.display="none"; }}/>
                        </div>
                      )}
                    </div>

                    {carErr && <ErrBox msg={carErr} t={{ BORDER }}/>}
                    <div style={{ display:"flex", gap:10 }}>
                      <button onClick={()=>{ resetCarForm(); setShowAddCar(false); }}
                        style={{ padding:"9px 18px", borderRadius:9, border:`1px solid ${BORDER}`, background:"transparent", color:HEAD, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
                      <button onClick={handleSaveCar} disabled={carLoading}
                        style={{ padding:"9px 22px", borderRadius:9, border:"none", background:ACC, color:ACC_FG, fontSize:13, fontWeight:700, cursor:carLoading?"not-allowed":"pointer", fontFamily:"'DM Sans',sans-serif", opacity:carLoading?0.6:1 }}>
                        {carLoading ? "Saving…" : editCarId ? "Save Changes" : "Add Car"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Car grid */}
                {companyCars.length === 0 && !showAddCar && (
                  <Empty label="No cars yet — click Add Car to list your first vehicle." t={{ MUTED }}/>
                )}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
                  {companyCars.filter(c=>carFilter==="all"||c.serviceType===carFilter).map(car => (
                    <CarCard key={car.id} car={car} canCars={canCars}
                      onEdit={()=>loadCarIntoForm(car)}
                      onRemove={()=>{ if(confirm(`Remove "${car.name}"?`)) removeCar(car.id); }}
                      onStatusChange={(s)=>updateCar(car.id,{status:s})}
                      t={{ CARD, BORDER, HEAD, MUTED, SUBTLE, ACC, ACC_FG, dark }}/>
                  ))}
                </div>
              </div>
            )}

            {/* ════ SETTINGS ════ */}
            {section === "settings" && (
              <div style={{ maxWidth:600 }}>
                {!canSettings && <PermWarn t={{ BORDER, MUTED }}/>}

                {/* Portal URLs */}
                <div style={{ background:CARD, borderRadius:14, border:`1px solid ${BORDER}`, padding:"22px 24px", marginBottom:18 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:HEAD, marginBottom:16 }}>Portal URLs</div>
                  {[
                    { label:"Public Dealership Page", value:`https://${siteUrl}` },
                    { label:"Admin Login",             value:`${typeof window!=="undefined"?window.location.origin:""}/login` },
                    { label:"Company Slug",            value:cCompany.slug },
                    { label:"Email Domain",            value:`name@${cCompany.slug}.com` },
                  ].map(r => (
                    <div key={r.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${BORDER}`, gap:10 }}>
                      <span style={{ fontSize:12, color:MUTED, flexShrink:0 }}>{r.label}</span>
                      <span style={{ fontSize:12, fontWeight:600, color:HEAD, fontFamily:"monospace", wordBreak:"break-all", textAlign:"right" }}>{r.value}</span>
                    </div>
                  ))}
                </div>

                {/* Plan & limits */}
                <div style={{ background:CARD, borderRadius:14, border:`1px solid ${BORDER}`, padding:"22px 24px", marginBottom:18 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:HEAD, marginBottom:4 }}>Plan — {plan.name}</div>
                  <div style={{ fontSize:12, color:MUTED, marginBottom:16 }}>
                    {plan.price === 0 ? "Free forever" : `GHS ${plan.price}/month`}
                    {" · "}
                    {limit ? `${activeCount}/${limit} active members` : "Unlimited members"}
                  </div>
                  <div style={{ marginBottom:16 }}>
                    {plan.features.map(f => (
                      <div key={f} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 0" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round"/></svg>
                        <span style={{ fontSize:12, color:MUTED }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>router.push("/onboarding")} style={{ padding:"9px 18px", borderRadius:9, border:`1px solid ${BORDER}`, background:SUBTLE, color:HEAD, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                    {plan.price === 0 ? "Upgrade Plan" : "Change Plan"}
                  </button>
                </div>

                {/* Member roles summary */}
                <div style={{ background:CARD, borderRadius:14, border:`1px solid ${BORDER}`, padding:"22px 24px", marginBottom:18 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:HEAD, marginBottom:14 }}>Team by Role</div>
                  {(["admin","finance","employee"] as CompanyRole[]).map(role => {
                    const count = allUsers.filter(u=>u.role===role).length;
                    return (
                      <div key={role} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${BORDER}` }}>
                        <span style={{ fontSize:13, color:MUTED, textTransform:"capitalize" }}>{role}</span>
                        <span style={{ fontSize:13, fontWeight:700, color:HEAD }}>{count}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Danger zone */}
                <div style={{ background:CARD, borderRadius:14, border:"1px solid rgba(239,68,68,0.2)", padding:"22px 24px" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#ef4444", marginBottom:8 }}>Danger Zone</div>
                  <div style={{ fontSize:12, color:MUTED, marginBottom:16 }}>Irreversible actions. Proceed with caution.</div>
                  <button style={{ padding:"9px 18px", borderRadius:9, border:"1px solid rgba(239,68,68,0.3)", background:"transparent", color:"#ef4444", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                    Deactivate Company
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function AvatarChip({ name, color, avatar }: { name:string; color?:string; avatar?:string }) {
  return (
    <div style={{ width:38, height:38, borderRadius:"50%", background:color??"#555", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <span style={{ fontSize:13, fontWeight:800, color:"#fff" }}>{avatar ?? name[0]}</span>
    </div>
  );
}

function UserRow({ u, t, compact=false }: { u:CompanyUser; t:any; compact?:boolean }) {
  return (
    <div style={{ background:t.CARD, borderRadius:12, border:`1px solid ${t.BORDER}`, padding:compact?"12px 18px":"14px 18px", display:"flex", alignItems:"center", gap:14, opacity:u.status==="inactive"?0.6:1 }}>
      <AvatarChip name={u.name} color={u.avatarColor} avatar={u.avatar}/>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:600, color:t.HEAD, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.name}</div>
        <div style={{ fontSize:11, color:t.MUTED, fontFamily:"monospace" }}>{u.email}</div>
      </div>
      <RoleBadge role={u.role} t={t}/>
      <StatusBadge status={u.status}/>
    </div>
  );
}

function RoleBadge({ role, t }: { role:CompanyRole; t:any }) {
  return (
    <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, background:t.SUBTLE, color:t.MUTED, border:`1px solid ${t.BORDER}`, textTransform:"uppercase" as const, letterSpacing:0.5, whiteSpace:"nowrap" as const }}>
      {role}
    </span>
  );
}

function StatusBadge({ status }: { status:CompanyUser["status"] }) {
  const c = status==="active"?"#10B981":status==="pending"?"#F59E0B":"#EF4444";
  return (
    <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, background:`${c}15`, color:c, border:`1px solid ${c}25`, whiteSpace:"nowrap" as const }}>
      {status}
    </span>
  );
}

function LeaveCard({ leave, canApprove, onReview, t }: { leave:LeaveRequest; canApprove:boolean; onReview:(id:string,action:"approved"|"rejected")=>void; t:any }) {
  const c = leave.status==="approved"?"#10B981":leave.status==="rejected"?"#EF4444":"#F59E0B";
  return (
    <div style={{ background:t.CARD, borderRadius:12, border:`1px solid ${t.BORDER}`, padding:"15px 20px" }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:5 }}>
            <span style={{ fontSize:13, fontWeight:700, color:t.HEAD }}>{leave.employeeName}</span>
            <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, background:`${c}15`, color:c, border:`1px solid ${c}25` }}>{leave.status}</span>
            <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background:t.SUBTLE, color:t.MUTED, border:`1px solid ${t.BORDER}`, textTransform:"capitalize" as const }}>{leave.type}</span>
          </div>
          <div style={{ fontSize:12, color:t.MUTED, marginBottom:4 }}>{leave.startDate} — {leave.endDate}</div>
          <div style={{ fontSize:12, color:t.HEAD }}>{leave.reason}</div>
        </div>
        {canApprove && leave.status === "pending" && (
          <div style={{ display:"flex", gap:7, flexShrink:0 }}>
            <button onClick={()=>onReview(leave.id,"approved")} style={{ padding:"6px 12px", borderRadius:8, border:"1px solid rgba(16,185,129,0.3)", background:"transparent", color:"#10B981", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Approve</button>
            <button onClick={()=>onReview(leave.id,"rejected")} style={{ padding:"6px 12px", borderRadius:8, border:"1px solid rgba(239,68,68,0.3)", background:"transparent", color:"#ef4444", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Reject</button>
          </div>
        )}
      </div>
    </div>
  );
}

function LabeledInput({ label, value, onChange, placeholder, t }: { label:string; value:string; onChange:(v:string)=>void; placeholder:string; t:any }) {
  return (
    <div>
      <div style={{ fontSize:11, fontWeight:700, color:t.MUTED, textTransform:"uppercase" as const, letterSpacing:1, marginBottom:7 }}>{label}</div>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{ width:"100%", padding:"10px 12px", borderRadius:9, border:`1.5px solid ${t.BORDER}`, background:t.SUBTLE, color:t.HEAD, fontSize:13, boxSizing:"border-box" as const }}/>
    </div>
  );
}

function ErrBox({ msg, t }: { msg:string; t:any }) {
  return (
    <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:8, padding:"8px 12px", fontSize:12, color:"#ef4444", marginBottom:12 }}>{msg}</div>
  );
}

function PermWarn({ t }: { t:any }) {
  return (
    <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:10, padding:"12px 16px", fontSize:12, color:"#ef4444", marginBottom:20 }}>
      You don't have permission for this action. Contact the company owner.
    </div>
  );
}

function Empty({ label, t }: { label:string; t:any }) {
  return <div style={{ padding:"40px 0", textAlign:"center", color:t.MUTED, fontSize:13 }}>{label}</div>;
}

function SectionLabel({ label, t }: { label:string; t:any }) {
  return <div style={{ fontSize:11, fontWeight:700, color:t.MUTED, letterSpacing:1, textTransform:"uppercase" as const, marginBottom:12 }}>{label}</div>;
}

function CarCard({ car, canCars, onEdit, onRemove, onStatusChange, t }: {
  car: CompanyCar;
  canCars: boolean;
  onEdit: ()=>void;
  onRemove: ()=>void;
  onStatusChange: (s: CarStatus)=>void;
  t: any;
}) {
  const serviceColors: Record<ServiceType, string> = { rental:"#6366f1", sale:"#10B981", swap:"#F59E0B" };
  const statusColors: Record<CarStatus, string>   = { available:"#10B981", booked:"#F59E0B", maintenance:"#EF4444" };
  const sc = serviceColors[car.serviceType];
  const stc = statusColors[car.status];

  return (
    <div style={{ background:t.CARD, borderRadius:14, border:`1px solid ${t.BORDER}`, overflow:"hidden", display:"flex", flexDirection:"column" }}>
      {/* Image */}
      <div style={{ height:150, background:t.SUBTLE, position:"relative", overflow:"hidden", flexShrink:0 }}>
        <img src={car.imageUrl} alt={car.name}
          style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.25s" }}
          onMouseEnter={e=>(e.currentTarget.style.transform="scale(1.04)")}
          onMouseLeave={e=>(e.currentTarget.style.transform="scale(1)")}
          onError={e=>{ (e.target as HTMLImageElement).src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='150'%3E%3Crect fill='%23333' width='280' height='150'/%3E%3Ctext fill='%23888' font-size='14' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E"; }}/>
        {/* Service badge */}
        <div style={{ position:"absolute", top:10, left:10, padding:"3px 10px", borderRadius:20, background:`${sc}22`, border:`1px solid ${sc}44`, color:sc, fontSize:10, fontWeight:700, backdropFilter:"blur(4px)", textTransform:"uppercase", letterSpacing:0.5 }}>
          {car.serviceType}
        </div>
        {/* Status badge */}
        <div style={{ position:"absolute", top:10, right:10, padding:"3px 10px", borderRadius:20, background:`${stc}22`, border:`1px solid ${stc}44`, color:stc, fontSize:10, fontWeight:700, backdropFilter:"blur(4px)", textTransform:"uppercase", letterSpacing:0.5 }}>
          {car.status}
        </div>
      </div>

      {/* Details */}
      <div style={{ padding:"14px 16px", flex:1, display:"flex", flexDirection:"column", gap:6 }}>
        <div style={{ fontSize:14, fontWeight:700, color:t.HEAD, lineHeight:1.3 }}>{car.name}</div>
        {car.spec && <div style={{ fontSize:12, color:t.MUTED }}>{car.spec}</div>}

        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:2 }}>
          <Chip label={car.bodyType} t={t}/>
          <Chip label={car.fuel} t={t}/>
          <Chip label={car.transmission} t={t}/>
          <Chip label={`${car.seats} seats`} t={t}/>
          <Chip label={String(car.year)} t={t}/>
        </div>

        <div style={{ fontSize:15, fontWeight:800, color:t.HEAD, marginTop:4 }}>
          GHS {car.price.toLocaleString()}
          {car.serviceType === "rental" && <span style={{ fontSize:11, fontWeight:400, color:t.MUTED }}> /day</span>}
        </div>
      </div>

      {/* Actions */}
      {canCars && (
        <div style={{ padding:"10px 16px 14px", display:"flex", gap:8, alignItems:"center", flexWrap:"wrap", borderTop:`1px solid ${t.BORDER}` }}>
          {/* Status change */}
          <select value={car.status} onChange={e=>onStatusChange(e.target.value as CarStatus)}
            style={{ padding:"5px 10px", borderRadius:7, border:`1px solid ${t.BORDER}`, background:t.dark?"#1a1a1a":t.CARD, color:t.MUTED, fontSize:11, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
            <option value="available" style={{ color:"#000" }}>Available</option>
            <option value="booked"    style={{ color:"#000" }}>Booked</option>
            <option value="maintenance" style={{ color:"#000" }}>Maintenance</option>
          </select>
          <div style={{ flex:1 }}/>
          <button onClick={onEdit} style={outlineBtn(t.BORDER, t.MUTED)}>Edit</button>
          <button onClick={onRemove} style={outlineBtn("rgba(239,68,68,0.3)","#ef4444")}>Remove</button>
        </div>
      )}
    </div>
  );
}

function Chip({ label, t }: { label:string; t:any }) {
  return (
    <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background:t.SUBTLE, color:t.MUTED, border:`1px solid ${t.BORDER}`, whiteSpace:"nowrap" as const }}>{label}</span>
  );
}

function outlineBtn(borderColor:string, color:string): React.CSSProperties {
  return { padding:"5px 11px", borderRadius:7, border:`1px solid ${borderColor}`, background:"transparent", color, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" };
}
