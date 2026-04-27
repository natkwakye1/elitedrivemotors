"use client";
// src/app/company/portal/employee/page.tsx
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/src/context/ThemeContext";
import { useSaas } from "@/src/context/SaasContext";
import { Ic } from "@/src/components/ui/Icons";

export default function EmployeePortal() {
  const router = useRouter();
  const { dark, setDark } = useTheme();
  const { currentUser, currentCompany, saasLogout, leaves, submitLeave } = useSaas();

  const [section,   setSection]   = useState<"overview"|"leave">("overview");
  const [leaveType, setLeaveType] = useState<"annual"|"sick"|"emergency"|"other">("annual");
  const [startDate, setStartDate] = useState("");
  const [endDate,   setEndDate]   = useState("");
  const [reason,    setReason]    = useState("");
  const [leaveError, setLeaveError]   = useState("");
  const [leaveSuccess, setLeaveSuccess] = useState(false);

  if (!currentUser || !currentCompany) {
    router.replace("/login");
    return null;
  }

  const ACC    = dark ? "#ffffff" : "#111111";
  const ACC_FG = dark ? "#000000" : "#ffffff";
  const BG     = dark ? "#0a0a0a" : "#f5f5f5";
  const CARD   = dark ? "#141414" : "#ffffff";
  const BORDER = dark ? "rgba(255,255,255,0.08)" : "#e8e8e8";
  const MUTED  = dark ? "rgba(255,255,255,0.42)" : "#888888";
  const HEAD   = dark ? "#f0f0f0" : "#111111";
  const SUBTLE = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";

  const canSubmitLeave = currentUser.permissions.includes("submit_leave");
  const myLeaves = leaves.filter(l => l.employeeId === currentUser.id);

  function handleSubmitLeave() {
    setLeaveError("");
    if (!startDate) { setLeaveError("Please select a start date."); return; }
    if (!endDate)   { setLeaveError("Please select an end date."); return; }
    if (!reason.trim()) { setLeaveError("Please provide a reason."); return; }
    submitLeave({ type:leaveType, startDate, endDate, reason: reason.trim() });
    setLeaveSuccess(true);
    setStartDate(""); setEndDate(""); setReason("");
  }

  const statusColor: Record<string,string> = {
    pending:"#F59E0B", approved:"#10B981", rejected:"#EF4444",
  };

  const NAV = [
    { id:"overview" as const, label:"Overview" },
    { id:"leave"    as const, label:"My Leaves" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700;9..40,800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${BG}; font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${dark?"rgba(255,255,255,0.15)":"#ccc"}; border-radius:4px; }
        input, select, textarea { outline:none; font-family:'DM Sans',sans-serif; }
        input:focus, select:focus, textarea:focus { border-color:${ACC} !important; }
        input::placeholder, textarea::placeholder { color:${MUTED}; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeUp 0.25s ease both; }
      `}</style>

      <div style={{ display:"flex", height:"100vh", background:BG, overflow:"hidden", fontFamily:"'DM Sans',sans-serif" }}>

        {/* Sidebar */}
        <div style={{ width:220, flexShrink:0, background: dark?"#111111":"#fafafa", borderRight:`1px solid ${BORDER}`, display:"flex", flexDirection:"column" }}>
          <div style={{ height:58, borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", padding:"0 16px", gap:10 }}>
            <div style={{ width:30, height:30, borderRadius:8, background: currentUser.avatarColor ?? ACC, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:11, fontWeight:800, color:"#fff" }}>{currentUser.avatar}</span>
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:12, fontWeight:800, color:HEAD, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{currentUser.name}</div>
              <div style={{ fontSize:10, color:MUTED }}>{currentCompany.name}</div>
            </div>
          </div>

          <nav style={{ flex:1, padding:"12px 8px" }}>
            {NAV.map(item => (
              <button key={item.id} onClick={()=>setSection(item.id)}
                style={{ display:"flex", alignItems:"center", width:"100%", padding:"9px 12px", borderRadius:9, border:"none", fontSize:13, fontWeight: section===item.id?700:500, color: section===item.id?ACC:MUTED, background: section===item.id?`${ACC}10`:"transparent", marginBottom:2, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", textAlign:"left" }}>
                {item.label}
              </button>
            ))}
          </nav>

          <div style={{ padding:"12px 10px", borderTop:`1px solid ${BORDER}` }}>
            <button onClick={()=>{ saasLogout(); router.replace("/login"); }}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px", border:"none", background:"transparent", color:MUTED, cursor:"pointer", fontSize:12, fontFamily:"'DM Sans',sans-serif", width:"100%", borderRadius:7 }}
              onMouseEnter={e=>(e.currentTarget.style.color="#ef4444")}
              onMouseLeave={e=>(e.currentTarget.style.color=MUTED)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Sign Out
            </button>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ height:58, borderBottom:`1px solid ${BORDER}`, background:CARD, display:"flex", alignItems:"center", padding:"0 24px", gap:12, flexShrink:0 }}>
            <div>
              <div style={{ fontSize:16, fontWeight:800, color:HEAD }}>{section === "overview" ? "Overview" : "My Leaves"}</div>
              <div style={{ fontSize:11, color:MUTED }}>Employee Portal</div>
            </div>
            <div style={{ flex:1 }}/>
            <button onClick={()=>setDark(!dark)} style={{ width:34, height:34, borderRadius:8, border:`1px solid ${BORDER}`, background:SUBTLE, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              {dark ? Ic.Sun(MUTED) : Ic.Moon(MUTED)}
            </button>
          </div>

          <div className="fade-in" key={section} style={{ flex:1, overflowY:"auto", padding:"28px 24px" }}>

            {/* ── OVERVIEW ── */}
            {section === "overview" && (
              <div>
                {/* Welcome */}
                <div style={{ background:CARD, borderRadius:14, border:`1px solid ${BORDER}`, padding:"24px", marginBottom:24 }}>
                  <div style={{ fontSize:22, fontWeight:900, color:HEAD, marginBottom:6 }}>Welcome, {currentUser.name.split(" ")[0]}</div>
                  <div style={{ fontSize:13, color:MUTED }}>Role: <strong style={{ color:HEAD, textTransform:"capitalize" }}>{currentUser.role}</strong> at {currentCompany.name}</div>
                  <div style={{ fontSize:12, color:MUTED, fontFamily:"monospace", marginTop:4 }}>{currentUser.email}</div>
                </div>

                {/* Leave summary */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:14, marginBottom:28 }}>
                  {[
                    { label:"Total Requests", value:myLeaves.length },
                    { label:"Approved",        value:myLeaves.filter(l=>l.status==="approved").length },
                    { label:"Pending",          value:myLeaves.filter(l=>l.status==="pending").length  },
                  ].map(s => (
                    <div key={s.label} style={{ background:CARD, borderRadius:12, border:`1px solid ${BORDER}`, padding:"18px 20px" }}>
                      <div style={{ fontSize:24, fontWeight:900, color:HEAD }}>{s.value}</div>
                      <div style={{ fontSize:12, color:MUTED, marginTop:4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Permissions summary */}
                <div style={{ background:CARD, borderRadius:14, border:`1px solid ${BORDER}`, padding:"20px 24px" }}>
                  <div style={{ fontSize:12, fontWeight:700, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:14 }}>Your Permissions</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {currentUser.permissions.map(p => (
                      <span key={p} style={{ fontSize:11, padding:"4px 10px", borderRadius:20, background:SUBTLE, color:MUTED, border:`1px solid ${BORDER}`, textTransform:"capitalize" }}>
                        {p.replace(/_/g," ")}
                      </span>
                    ))}
                    {currentUser.permissions.length === 0 && <span style={{ fontSize:12, color:MUTED }}>No permissions assigned.</span>}
                  </div>
                </div>
              </div>
            )}

            {/* ── LEAVE ── */}
            {section === "leave" && (
              <div style={{ maxWidth:560 }}>
                {!canSubmitLeave && (
                  <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:10, padding:"14px 18px", fontSize:13, color:"#ef4444", marginBottom:24 }}>
                    Your admin has disabled leave submissions for your account. Contact your manager.
                  </div>
                )}

                {canSubmitLeave && (
                  <div style={{ background:CARD, borderRadius:14, border:`1px solid ${BORDER}`, padding:"24px", marginBottom:24 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:HEAD, marginBottom:20 }}>Submit Leave Request</div>

                    {leaveSuccess && (
                      <div style={{ background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.25)", borderRadius:9, padding:"12px 16px", fontSize:13, color:"#10B981", marginBottom:16 }}>
                        Leave request submitted. You'll be notified once it's reviewed.
                      </div>
                    )}

                    <div style={{ marginBottom:16 }}>
                      <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:1, display:"block", marginBottom:7 }}>Leave Type</label>
                      <select value={leaveType} onChange={e=>setLeaveType(e.target.value as typeof leaveType)}
                        style={{ width:"100%", padding:"10px 12px", borderRadius:9, border:`1.5px solid ${BORDER}`, background: dark?"#1a1a1a":CARD, color:HEAD, fontSize:13, boxSizing:"border-box" as const }}>
                        <option value="annual"    style={{ color:"#000" }}>Annual Leave</option>
                        <option value="sick"      style={{ color:"#000" }}>Sick Leave</option>
                        <option value="emergency" style={{ color:"#000" }}>Emergency Leave</option>
                        <option value="other"     style={{ color:"#000" }}>Other</option>
                      </select>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 }}>
                      <div>
                        <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:1, display:"block", marginBottom:7 }}>Start Date</label>
                        <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)}
                          style={{ width:"100%", padding:"10px 12px", borderRadius:9, border:`1.5px solid ${BORDER}`, background:SUBTLE, color:HEAD, fontSize:13, boxSizing:"border-box" as const }}/>
                      </div>
                      <div>
                        <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:1, display:"block", marginBottom:7 }}>End Date</label>
                        <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)}
                          style={{ width:"100%", padding:"10px 12px", borderRadius:9, border:`1.5px solid ${BORDER}`, background:SUBTLE, color:HEAD, fontSize:13, boxSizing:"border-box" as const }}/>
                      </div>
                    </div>
                    <div style={{ marginBottom:16 }}>
                      <label style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:1, display:"block", marginBottom:7 }}>Reason</label>
                      <textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder="Brief explanation…" rows={3}
                        style={{ width:"100%", padding:"10px 12px", borderRadius:9, border:`1.5px solid ${BORDER}`, background:SUBTLE, color:HEAD, fontSize:13, boxSizing:"border-box" as const, resize:"vertical" }}/>
                    </div>
                    {leaveError && (
                      <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:8, padding:"8px 12px", fontSize:12, color:"#ef4444", marginBottom:12, display:"flex", alignItems:"center", gap:6 }}>
                        {Ic.Alert("#ef4444")} {leaveError}
                      </div>
                    )}
                    <button onClick={handleSubmitLeave}
                      style={{ padding:"10px 20px", borderRadius:9, border:"none", background:ACC, color:ACC_FG, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                      Submit Request
                    </button>
                  </div>
                )}

                {/* History */}
                <div style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:14 }}>Leave History</div>
                {myLeaves.length === 0 ? (
                  <div style={{ padding:"32px 0", textAlign:"center", color:MUTED, fontSize:13 }}>No leave requests yet.</div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {myLeaves.map(l => (
                      <div key={l.id} style={{ background:CARD, borderRadius:12, border:`1px solid ${BORDER}`, padding:"16px 18px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                          <span style={{ fontSize:12, fontWeight:700, color:HEAD, textTransform:"capitalize" }}>{l.type.replace("_"," ")} Leave</span>
                          <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, background:`${statusColor[l.status]}15`, color:statusColor[l.status], border:`1px solid ${statusColor[l.status]}25` }}>{l.status}</span>
                        </div>
                        <div style={{ fontSize:12, color:MUTED, marginBottom:4 }}>{l.startDate} — {l.endDate}</div>
                        <div style={{ fontSize:12, color:HEAD }}>{l.reason}</div>
                        {l.reviewedBy && <div style={{ fontSize:11, color:MUTED, marginTop:4 }}>Reviewed by {l.reviewedBy}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
