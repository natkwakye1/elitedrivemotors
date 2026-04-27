"use client";
// src/app/company/portal/finance/page.tsx

import { useRouter } from "next/navigation";
import { useTheme } from "@/src/context/ThemeContext";
import { useSaas } from "@/src/context/SaasContext";
import { Ic } from "@/src/components/ui/Icons";

export default function FinancePortal() {
  const router = useRouter();
  const { dark, setDark } = useTheme();
  const { currentUser, currentCompany, saasLogout } = useSaas();

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

  const canViewPayroll  = currentUser.permissions.includes("view_payroll");
  const canViewReports  = currentUser.permissions.includes("view_reports");
  const canManagePay    = currentUser.permissions.includes("manage_payments");

  const MOCK_TRANSACTIONS = [
    { id:"TXN-001", customer:"Kwame Mensah",   type:"Rental",  amount:450,  date:"2026-04-20", status:"paid"    },
    { id:"TXN-002", customer:"Ama Owusu",      type:"Sale",    amount:8500, date:"2026-04-19", status:"paid"    },
    { id:"TXN-003", customer:"Kofi Asante",    type:"Rental",  amount:300,  date:"2026-04-18", status:"pending" },
    { id:"TXN-004", customer:"Abena Darko",    type:"Swap",    amount:1200, date:"2026-04-17", status:"paid"    },
    { id:"TXN-005", customer:"Yaw Boateng",    type:"Rental",  amount:600,  date:"2026-04-15", status:"refunded"},
  ];

  const totalRevenue = MOCK_TRANSACTIONS.filter(t=>t.status==="paid").reduce((a,t)=>a+t.amount,0);
  const pending      = MOCK_TRANSACTIONS.filter(t=>t.status==="pending").reduce((a,t)=>a+t.amount,0);

  const statusColor: Record<string,string> = {
    paid:"#10B981", pending:"#F59E0B", refunded:"#888888",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700;9..40,800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${BG}; font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${dark?"rgba(255,255,255,0.15)":"#ccc"}; border-radius:4px; }
      `}</style>

      <div style={{ display:"flex", height:"100vh", background:BG, overflow:"hidden", fontFamily:"'DM Sans',sans-serif" }}>

        {/* Thin sidebar */}
        <div style={{ width:220, flexShrink:0, background: dark?"#111111":"#fafafa", borderRight:`1px solid ${BORDER}`, display:"flex", flexDirection:"column" }}>
          <div style={{ height:58, borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", padding:"0 16px", gap:10 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:ACC, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:11, fontWeight:800, color:ACC_FG }}>{currentCompany.name[0]}</span>
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:12, fontWeight:800, color:HEAD, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{currentCompany.name}</div>
              <div style={{ fontSize:10, color:MUTED }}>Finance Portal</div>
            </div>
          </div>

          <nav style={{ flex:1, padding:"12px 8px" }}>
            {["Overview", "Transactions", "Payroll", "Reports"].map(item => (
              <div key={item} style={{ padding:"9px 12px", borderRadius:9, fontSize:13, fontWeight:500, color:item==="Overview"?ACC:MUTED, background:item==="Overview"?`${ACC}10`:"transparent", marginBottom:2, cursor:"pointer" }}>
                {item}
              </div>
            ))}
          </nav>

          <div style={{ padding:"12px 10px", borderTop:`1px solid ${BORDER}` }}>
            <div style={{ fontSize:12, fontWeight:600, color:HEAD, marginBottom:2 }}>{currentUser.name}</div>
            <div style={{ fontSize:10, color:MUTED, marginBottom:10 }}>Finance</div>
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
              <div style={{ fontSize:16, fontWeight:800, color:HEAD }}>Finance Overview</div>
              <div style={{ fontSize:11, color:MUTED }}>{currentCompany.name}</div>
            </div>
            <div style={{ flex:1 }}/>
            <button onClick={()=>setDark(!dark)} style={{ width:34, height:34, borderRadius:8, border:`1px solid ${BORDER}`, background:SUBTLE, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              {dark ? Ic.Sun(MUTED) : Ic.Moon(MUTED)}
            </button>
          </div>

          <div style={{ flex:1, overflowY:"auto", padding:"28px 24px" }}>

            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:16, marginBottom:32 }}>
              {[
                { label:"Total Revenue",   value:`GHS ${totalRevenue.toLocaleString()}`, shown: canViewReports },
                { label:"Pending Payments",value:`GHS ${pending.toLocaleString()}`,      shown: canManagePay  },
                { label:"Transactions",    value:MOCK_TRANSACTIONS.length,               shown: true          },
                { label:"Refunds",         value:MOCK_TRANSACTIONS.filter(t=>t.status==="refunded").length, shown: canViewReports },
              ].map(s => (
                <div key={s.label} style={{ background:CARD, borderRadius:14, border:`1px solid ${BORDER}`, padding:"20px" }}>
                  {s.shown
                    ? <div style={{ fontSize:24, fontWeight:900, color:HEAD, lineHeight:1 }}>{s.value}</div>
                    : <div style={{ fontSize:24, fontWeight:900, color:MUTED, lineHeight:1 }}>—</div>
                  }
                  <div style={{ fontSize:12, color:MUTED, marginTop:6 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Transactions */}
            {canManagePay ? (
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:14 }}>Recent Transactions</div>
                <div style={{ background:CARD, borderRadius:14, border:`1px solid ${BORDER}`, overflow:"hidden" }}>
                  {MOCK_TRANSACTIONS.map((tx, i) => (
                    <div key={tx.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 20px", borderBottom: i < MOCK_TRANSACTIONS.length-1 ? `1px solid ${BORDER}` : "none" }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:600, color:HEAD }}>{tx.customer}</div>
                        <div style={{ fontSize:11, color:MUTED }}>{tx.type} · {tx.date}</div>
                      </div>
                      <div style={{ fontSize:13, fontWeight:700, color:HEAD }}>GHS {tx.amount.toLocaleString()}</div>
                      <span style={{ fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:20, background:`${statusColor[tx.status]}15`, color:statusColor[tx.status], border:`1px solid ${statusColor[tx.status]}25`, textTransform:"capitalize" }}>{tx.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ padding:"40px 0", textAlign:"center", color:MUTED, fontSize:13 }}>
                You don't have permission to view transactions.
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
