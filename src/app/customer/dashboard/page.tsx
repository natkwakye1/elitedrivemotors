"use client";
// src/app/customer/dashboard/page.tsx

import { useTheme } from "@/src/context/ThemeContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import CustomerShell from "@/src/components/layout/Customershell";
import { Ic } from "@/src/components/ui/Icons";
import { useCustomerAuth } from "@/src/context/Customerauthcontext";
import { useBookings } from "@/src/hooks/useApi";
import { useSwaps } from "@/src/hooks/useApi";
import type { ApiBooking, ApiSwap } from "@/src/lib/api";

const STATUS_COLOR: Record<string,string> = {
  active:"#10B981", completed:"#4F46E5", upcoming:"#F59E0B", cancelled:"#EF4444",
  confirmed:"#10B981", pending:"#F59E0B", approved:"#10B981", rejected:"#EF4444",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
}
function fmtCurrency(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits:2, maximumFractionDigits:2 })}`;
}
function carName(b: ApiBooking) {
  return b.car ? `${b.car.make} ${b.car.model}` : `Vehicle #${b.car_id.slice(0,6).toUpperCase()}`;
}
function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

export default function CustomerDashboard() {
  const router = useRouter();
  const { dark, setDark, t } = useTheme();
  const { customer } = useCustomerAuth();
  const { bookings, loading: bookingsLoading } = useBookings();
  const { swaps, loading: swapsLoading } = useSwaps();

  useEffect(() => {
    if (!customer) router.replace("/customer/login");
  }, [customer, router]);
  if (!customer) return <div style={{ position:"fixed", inset:0, background:t.bg }}/>;

  const rentals   = bookings.filter(b => b.booking_type !== "buy");
  const purchases = bookings.filter(b => b.booking_type === "buy");

  const totalSpent = bookings
    .filter(b => b.status === "completed")
    .reduce((s, b) => s + b.total_amount, 0);

  const activeRental = rentals.find(b => b.status === "active" || b.status === "confirmed");
  const nextBooking  = bookings.find(b => b.status === "confirmed" || b.status === "pending");
  const pendingSwap  = swaps.find(s => s.status === "pending" || s.status === "approved");

  const isLoading = bookingsLoading || swapsLoading;

  return (
    <CustomerShell title={`Welcome, ${customer.name.split(" ")[0]}`} subtitle="Here's your account overview" dark={dark} setDark={setDark} t={t}
      actions={
        <button onClick={()=>router.push("/customer/rent-car")}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8, border:"none", background:t.accent, color:t.accentFg, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
          <span style={{ display:"flex" }}>{Ic.Booking(t.accentFg)}</span>
          Book a Rental
        </button>
      }
    >
      <div style={{ flex:1, overflowY:"auto", padding:"24px", background:t.bg }}>

        {/* ── KPI cards ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
          {[
            { label:"Total Rentals",  value: isLoading ? "—" : `${rentals.length}`,         icon:(c:string)=>Ic.Rentals(c),  href:"/customer/rentals"   },
            { label:"Purchases",      value: isLoading ? "—" : `${purchases.length}`,       icon:(c:string)=>Ic.Buy(c),      href:"/customer/purchases" },
            { label:"Bookings",       value: isLoading ? "—" : `${bookings.length}`,        icon:(c:string)=>Ic.Booking(c),  href:"/customer/bookings"  },
            { label:"Total Spent",    value: isLoading ? "—" : fmtCurrency(totalSpent),     icon:(c:string)=>Ic.Payment(c),  href:"/customer/rentals"   },
          ].map(s => (
            <div key={s.label} onClick={()=>router.push(s.href)}
              style={{ background:t.cardBg, borderRadius:12, border:`1px solid ${t.border}`, padding:"12px 16px", display:"flex", alignItems:"center", gap:11, cursor:"pointer", transition:"border-color 0.15s, transform 0.15s" }}
              onMouseEnter={e=>{ (e.currentTarget as HTMLDivElement).style.borderColor=t.accent; (e.currentTarget as HTMLDivElement).style.transform="translateY(-2px)"; }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLDivElement).style.borderColor=t.border; (e.currentTarget as HTMLDivElement).style.transform="translateY(0)"; }}
            >
              <div style={{ width:32, height:32, borderRadius:8, background:t.accent+"12", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span style={{ display:"flex" }}>{s.icon(t.accent)}</span>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:10, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, fontWeight:600, marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.label}</div>
                <div style={{ fontSize:18, fontWeight:800, color:t.textPri, lineHeight:1 }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }}>

          {/* active rental highlight */}
          <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, overflow:"hidden" }}>
            <div style={{ padding:"16px 18px 14px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ fontSize:13, fontWeight:700, color:t.textPri }}>Active Rental</div>
              <button onClick={()=>router.push("/customer/rentals")} style={{ fontSize:11, color:t.accent, background:"none", border:`1px solid ${t.border}`, borderRadius:7, padding:"4px 10px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>View all</button>
            </div>
            {activeRental ? (
              <div style={{ padding:"16px 18px" }}>
                <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:14 }}>
                  <div style={{ width:72, height:52, borderRadius:9, overflow:"hidden", flexShrink:0, position:"relative", background:dark?"#111122":"#f0f0f6" }}>
                    {activeRental.car?.cover_image_url
                      ? <Image src={activeRental.car.cover_image_url} alt={carName(activeRental)} fill style={{ objectFit:"cover" }}/>
                      : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:t.textMuted }}>No img</div>
                    }
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:t.textPri, marginBottom:3 }}>{carName(activeRental)}</div>
                    <div style={{ fontSize:11, color:t.textMuted }}>{activeRental.car?.plate_number} · {Math.ceil((new Date(activeRental.end_date).getTime() - new Date(activeRental.start_date).getTime()) / 86_400_000)} days</div>
                  </div>
                  <span style={{ marginLeft:"auto", fontSize:9, fontWeight:700, color:"#10B981", background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.25)", borderRadius:20, padding:"3px 10px" }}>{capitalize(activeRental.status)}</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {[
                    { label:"Pickup",   value:activeRental.pickup_location   },
                    { label:"Drop-off", value:activeRental.dropoff_location  },
                    { label:"Started",  value:fmtDate(activeRental.start_date) },
                    { label:"Amount",   value:fmtCurrency(activeRental.total_amount) },
                  ].map(row => (
                    <div key={row.label} style={{ background:t.bg, borderRadius:8, border:`1px solid ${t.border}`, padding:"8px 10px" }}>
                      <div style={{ fontSize:9, color:t.textMuted, marginBottom:2 }}>{row.label}</div>
                      <div style={{ fontSize:11, fontWeight:600, color:t.textPri }}>{row.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ padding:"32px 18px", textAlign:"center", color:t.textMuted }}>
                <div style={{ fontSize:12, fontWeight:600, color:t.textSec, marginBottom:6 }}>No active rentals</div>
                <button onClick={()=>router.push("/customer/rent-car")} style={{ fontSize:11, color:t.accent, background:"none", border:`1px solid ${t.accent}`, borderRadius:7, padding:"6px 14px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Book one now</button>
              </div>
            )}
          </div>

          {/* next booking */}
          <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, overflow:"hidden" }}>
            <div style={{ padding:"16px 18px 14px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ fontSize:13, fontWeight:700, color:t.textPri }}>Upcoming Booking</div>
              <button onClick={()=>router.push("/customer/bookings")} style={{ fontSize:11, color:t.accent, background:"none", border:`1px solid ${t.border}`, borderRadius:7, padding:"4px 10px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>View all</button>
            </div>
            {nextBooking ? (
              <div style={{ padding:"16px 18px" }}>
                <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:14 }}>
                  <div style={{ width:72, height:52, borderRadius:9, overflow:"hidden", flexShrink:0, position:"relative", background:dark?"#111122":"#f0f0f6" }}>
                    {nextBooking.car?.cover_image_url
                      ? <Image src={nextBooking.car.cover_image_url} alt={carName(nextBooking)} fill style={{ objectFit:"cover" }}/>
                      : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:t.textMuted }}>No img</div>
                    }
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:t.textPri, marginBottom:3 }}>{carName(nextBooking)}</div>
                    <div style={{ fontSize:11, color:t.textMuted }}>{fmtDate(nextBooking.start_date)}</div>
                  </div>
                  <span style={{ marginLeft:"auto", fontSize:9, fontWeight:700, color:STATUS_COLOR[nextBooking.status]??t.textMuted, background:(STATUS_COLOR[nextBooking.status]??"#888")+"18", border:`1px solid ${STATUS_COLOR[nextBooking.status]??"#888"}30`, borderRadius:20, padding:"3px 10px" }}>{capitalize(nextBooking.status)}</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {[
                    { label:"Pickup",   value:nextBooking.pickup_location  },
                    { label:"Drop-off", value:nextBooking.dropoff_location },
                    { label:"Duration", value:`${Math.ceil((new Date(nextBooking.end_date).getTime()-new Date(nextBooking.start_date).getTime())/86_400_000)} day(s)` },
                    { label:"Amount",   value:fmtCurrency(nextBooking.total_amount) },
                  ].map(row => (
                    <div key={row.label} style={{ background:t.bg, borderRadius:8, border:`1px solid ${t.border}`, padding:"8px 10px" }}>
                      <div style={{ fontSize:9, color:t.textMuted, marginBottom:2 }}>{row.label}</div>
                      <div style={{ fontSize:11, fontWeight:600, color:t.textPri }}>{row.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ padding:"32px 18px", textAlign:"center", color:t.textMuted }}>
                <div style={{ fontSize:12, fontWeight:600, color:t.textSec, marginBottom:6 }}>No upcoming bookings</div>
                <button onClick={()=>router.push("/customer/rent-car")} style={{ fontSize:11, color:t.accent, background:"none", border:`1px solid ${t.accent}`, borderRadius:7, padding:"6px 14px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Book now</button>
              </div>
            )}
          </div>
        </div>

        {/* ── Recent activity ── */}
        <div style={{ background:t.cardBg, borderRadius:14, border:`1px solid ${t.border}`, overflow:"hidden" }}>
          <div style={{ padding:"16px 18px 14px", borderBottom:`1px solid ${t.border}` }}>
            <div style={{ fontSize:13, fontWeight:700, color:t.textPri }}>Recent Activity</div>
          </div>
          <div>
            {isLoading ? (
              <div style={{ padding:"32px", textAlign:"center", color:t.textMuted, fontSize:12 }}>Loading…</div>
            ) : bookings.length === 0 && swaps.length === 0 ? (
              <div style={{ padding:"32px", textAlign:"center", color:t.textMuted, fontSize:12 }}>No activity yet</div>
            ) : (
              [
                ...bookings.map(b => ({
                  id: b.id,
                  kind: b.booking_type === "buy" ? "purchase" : "rental",
                  label: b.booking_type === "buy" ? `Purchased ${carName(b)}` : `Rented ${carName(b)}`,
                  date: b.created_at,
                  amount: fmtCurrency(b.total_amount),
                  status: capitalize(b.status),
                })),
                ...swaps.map(s => ({
                  id: s.id,
                  kind: "swap",
                  label: `Swap: ${s.offered_car ? `${s.offered_car.make} ${s.offered_car.model}` : "your car"}`,
                  date: s.created_at,
                  amount: s.top_up_amount > 0 ? fmtCurrency(s.top_up_amount) : "—",
                  status: capitalize(s.status),
                })),
              ]
              .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0,6)
              .map((item, i, arr) => {
                const kindColor: Record<string,string> = { rental:"#10B981", purchase:"#4F46E5", booking:"#F59E0B", swap:"#8B5CF6" };
                const kindIcon:  Record<string,(c:string)=>React.ReactNode> = { rental:(c)=>Ic.Rentals(c), purchase:(c)=>Ic.Buy(c), booking:(c)=>Ic.Booking(c), swap:(c)=>Ic.Swap(c) };
                const col = kindColor[item.kind];
                const sc = STATUS_COLOR[item.status.toLowerCase()] ?? t.textMuted;
                return (
                  <div key={item.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"13px 18px", borderBottom:i<arr.length-1?`1px solid ${t.divider}`:"none" }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:col+"14", border:`1px solid ${col}22`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span style={{ display:"flex" }}>{kindIcon[item.kind]?.(col)}</span>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:t.textPri, marginBottom:2 }}>{item.label}</div>
                      <div style={{ fontSize:11, color:t.textMuted }}>{fmtDate(item.date)}</div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:t.textPri }}>{item.amount}</div>
                      <span style={{ fontSize:9, fontWeight:700, color:sc, background:sc+"18", borderRadius:20, padding:"2px 8px" }}>{item.status}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </CustomerShell>
  );
}
