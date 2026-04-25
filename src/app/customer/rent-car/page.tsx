"use client";
export const dynamic = "force-dynamic";
// src/app/customer/rent-car/page.tsx

import { useTheme } from "@/src/context/ThemeContext";
import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import CustomerShell from "@/src/components/layout/Customershell";
import Sidebar from "@/src/components/layout/Sidebar";
import { Ic } from "@/src/components/ui/Icons";
import { useCars } from "@/src/hooks/useApi";
import { bookingsApi, paymentsApi } from "@/src/lib/api";
import type { ApiCar } from "@/src/lib/api";
import { Filters, DEFAULT_FILTERS } from "@/src/types/car";
import { useFavourites } from "@/src/context/FavouritesContext";
import { CARS } from "@/src/lib/data/cars";
import { FLEET_DATA } from "@/src/lib/data/fleet";
import CarGridSkeleton from "@/src/components/ui/Skeleton";
import DatePicker from "@/src/components/ui/DatePicker";

const LOCATIONS = [
  "Accra Central", "Airport Accra", "East Legon", "Osu, Accra",
  "Cantonments", "Tema", "Kumasi", "Spintex",
];

const RENT_DEFAULTS: Filters = { ...DEFAULT_FILTERS, listingType: "Rent" };

/* ── Small Field wrapper ─────────────────────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{
        display: "block", marginBottom: 5,
        fontSize: 10, fontWeight: 700, letterSpacing: 0.9,
        textTransform: "uppercase", color: "var(--lbl)",
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const STATIC_RENT_CARS: ApiCar[] = CARS
  .filter(car => {
    const f = FLEET_DATA[car.id];
    return f?.status === "Available" && f.listingTypes.includes("rent");
  })
  .map(car => {
    const f = FLEET_DATA[car.id]!;
    const [make, ...rest] = car.name.split(" ");
    return {
      id: String(car.id), make, model: rest.join(" "),
      year: f.year, plate_number: f.plate,
      fuel_type: car.fuel, transmission: car.transmission,
      seats: car.seats ?? 5, mileage_km: f.mileage,
      listing_type: "rent", daily_rate: car.price,
      sale_price: f.salePrice || undefined, status: "active",
      cover_image_url: car.image, location_city: f.location,
      rating_avg: car.rating, rating_count: car.reviews,
      is_verified: true, created_at: "2026-01-01T00:00:00Z",
    } as ApiCar;
  });

export default function CustomerRentCarPage() {
  const { dark, setDark, t } = useTheme();
  const searchParams = useSearchParams();
  const { toggle: toggleFav, isFav } = useFavourites();
  const { cars: apiCars, loading: carsLoading } = useCars({ listing_type: "rent", limit: 50 });
  const cars = !carsLoading && apiCars.length === 0 ? STATIC_RENT_CARS : apiCars;
  const [filters, setFilters]   = useState<Filters>(RENT_DEFAULTS);
  const [selected, setSelected] = useState<ApiCar | null>(null);

  useEffect(() => {
    const id = searchParams.get("carId");
    if (id && cars.length > 0) {
      const car = cars.find(c => c.id === id);
      if (car) setSelected(car);
    }
  }, [searchParams, cars]);
  const [pickup, setPickup]     = useState("");
  const [dropoff, setDropoff]   = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]   = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"mobile_money" | "stripe">("mobile_money");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [addons, setAddons] = useState<Record<string, boolean>>({
    insurance: false,
    driver: false,
    childSeat: false,
    gps: false,
    roadside: false,
  });
  const toggleAddon = (key: string) => setAddons(a => ({ ...a, [key]: !a[key] }));

  const ADDON_LIST = [
    { key: "insurance", label: "Full Insurance",       desc: "Comprehensive cover — zero excess",  price: 12, icon: (c:string) => Ic.License(c)  },
    { key: "driver",    label: "Personal Driver",       desc: "Professional chauffeur included",    price: 45, icon: (c:string) => Ic.Users(c)    },
    { key: "childSeat", label: "Child Seat",            desc: "EU-certified safety seat",           price: 8,  icon: (c:string) => Ic.Support(c)  },
    { key: "gps",       label: "GPS Navigation",        desc: "Pre-loaded maps for Ghana",          price: 5,  icon: (c:string) => Ic.Tracking(c) },
    { key: "roadside",  label: "Roadside Assistance",   desc: "24/7 breakdown support",             price: 10, icon: (c:string) => Ic.Map(c)      },
  ];

  /* ── Filtered cars ─────────────────────────────────────────────────────── */
  const filtered = useMemo(() => cars.filter(c => {
    const rate = c.daily_rate ?? 0;
    if (rate < filters.priceMin || rate > filters.priceMax) return false;
    if (filters.transmission !== "Any" && c.transmission.toLowerCase() !== filters.transmission.toLowerCase()) return false;
    if (filters.listingType !== "Any" && filters.listingType !== "Rent") return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!`${c.make} ${c.model} ${c.fuel_type}`.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [cars, filters]);

  /* ── Derived booking values ────────────────────────────────────────────── */
  const days = startDate && endDate
    ? Math.max(1, Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86_400_000
      ))
    : 0;
  const addonTotal = ADDON_LIST.filter(a => addons[a.key]).reduce((s, a) => s + a.price, 0);
  const dailyRate = selected?.daily_rate ?? 0;
  const total    = selected && days > 0 ? ((dailyRate * days) + (addonTotal * days)).toFixed(2) : null;
  const canBook  = !!(selected && pickup && dropoff && startDate && endDate);

  const handleSubmit = async () => {
    if (!canBook || !selected) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const booking = await bookingsApi.create({
        car_id: selected.id,
        booking_type: "self_drive",
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        pickup_location: pickup,
        dropoff_location: dropoff,
        payment_method: paymentMethod,
      });
      const payment = await paymentsApi.initiate({ booking_id: booking.id, method: paymentMethod });
      if (paymentMethod === "stripe" && payment.checkout_url) {
        window.location.href = payment.checkout_url;
        return;
      }
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.detail || "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Input style helper ────────────────────────────────────────────────── */
  const inputStyle = (hasValue: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "9px 12px",
    borderRadius: 8,
    border: `1px solid ${t.border}`,
    background: t.bg,
    color: hasValue ? t.textPri : t.textMuted,
    fontSize: 12,
    outline: "none",
    fontFamily: "'DM Sans',sans-serif",
    transition: "border-color 0.15s",
    boxSizing: "border-box" as const,
  });

  /* ── Success screen ────────────────────────────────────────────────────── */
  if (submitted && selected) {
    return (
      <CustomerShell title="Rent a Car" dark={dark} setDark={setDark} t={t}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: t.bg, padding: 24 }}>
          <div style={{
            background: t.cardBg, borderRadius: 20, border: `1px solid ${t.border}`,
            padding: "44px 52px", textAlign: "center", maxWidth: 420, width: "100%",
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: "50%",
              background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 18px",
            }}>
              {Ic.Check("#10B981")}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: t.textPri, marginBottom: 8 }}>
              Booking Submitted!
            </div>
            <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.6, marginBottom: 24 }}>
              Your rental for the <strong style={{ color: t.textPri }}>{selected.make} {selected.model}</strong> has been submitted.
              We&apos;ll confirm your booking shortly.
            </div>

            {/* Summary */}
            <div style={{
              background: t.bg, borderRadius: 12, border: `1px solid ${t.border}`,
              padding: "14px 18px", marginBottom: 24, textAlign: "left",
            }}>
              {[
                { l: "Vehicle",   v: `${selected.make} ${selected.model}` },
                { l: "Pickup",    v: pickup        },
                { l: "Drop-off",  v: dropoff       },
                { l: "From",      v: startDate ? new Date(startDate).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }) : "—" },
                { l: "To",        v: endDate   ? new Date(endDate  ).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }) : "—" },
                { l: "Duration",  v: `${days} day${days > 1 ? "s" : ""}` },
                { l: "Total",     v: `$${total}`   },
              ].map(row => (
                <div key={row.l} style={{
                  display: "flex", justifyContent: "space-between",
                  fontSize: 12, padding: "5px 0",
                  borderBottom: `1px solid ${t.divider}`,
                }}>
                  <span style={{ color: t.textMuted }}>{row.l}</span>
                  <span style={{ fontWeight: 700, color: t.textPri }}>{row.v}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setSubmitted(false);
                setSelected(null);
                setPickup(""); setDropoff("");
                setStartDate(""); setEndDate("");
              }}
              style={{
                padding: "11px 28px", borderRadius: 10, border: "none",
                background: t.accent, color: t.accentFg, fontSize: 13,
                fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
              }}
            >
              Book Another
            </button>
          </div>
        </div>
      </CustomerShell>
    );
  }

  /* ── Main page ─────────────────────────────────────────────────────────── */
  return (
    <CustomerShell
      title="Rent a Car"
      subtitle={carsLoading ? "Loading vehicles…" : `${filtered.length} vehicle${filtered.length !== 1 ? "s" : ""} available`}
      dark={dark} setDark={setDark} t={t}
      actions={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", display: "flex", opacity: 0.4 }}>
              {Ic.Search(t.textMuted)}
            </span>
            <input
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              placeholder="Search vehicles…"
              style={{
                width: 190, padding: "7px 10px 7px 28px",
                borderRadius: 8, border: `1px solid ${t.border}`,
                background: t.bg, color: t.textPri, fontSize: 12,
                outline: "none", fontFamily: "'DM Sans',sans-serif",
              }}
              onFocus={e => (e.target.style.borderColor = t.accent)}
              onBlur={e  => (e.target.style.borderColor = t.border)}
            />
          </div>
        </div>
      }
    >

      {/* ── 3-panel layout ───────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Left – filter sidebar */}
        <Sidebar f={filters} sf={setFilters} t={t} />

        {/* Center – car grid */}
        <div style={{ flex: 1, overflowY: "auto", padding: 16, background: t.bg }}>

          {carsLoading ? (
            <CarGridSkeleton count={8} />
          ) : filtered.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60%", gap: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: t.textSec }}>No vehicles match your filters</div>
              <button
                onClick={() => setFilters(RENT_DEFAULTS)}
                style={{ fontSize: 12, color: t.accent, background: "none", border: `1px solid ${t.accent}`, borderRadius: 8, padding: "7px 18px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 14, alignContent: "start",
            }}>
              {filtered.map((car: ApiCar) => {
                const isActive = selected?.id === car.id;
                const carLabel = `${car.make} ${car.model} ${car.year}`;
                return (
                  <div
                    key={car.id}
                    onClick={() => setSelected(isActive ? null : car)}
                    style={{
                      background: t.cardBg, borderRadius: 14,
                      border: `2px solid ${isActive ? t.accent : t.border}`,
                      overflow: "hidden", cursor: "pointer", transition: "all 0.15s",
                      transform: isActive ? "translateY(-2px)" : "translateY(0)",
                      boxShadow: isActive ? `0 0 0 3px ${t.accent}22` : "none",
                    }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.borderColor = t.accent + "66"; }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.borderColor = t.border; }}
                  >
                    {/* Image */}
                    <div style={{ position: "relative", height: 160, background: dark ? "#111122" : "#f0f0f6" }}>
                      {car.cover_image_url
                        ? <Image src={car.cover_image_url} alt={carLabel} fill sizes="240px" style={{ objectFit: "cover" }} />
                        : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:t.textMuted }}>No image</div>
                      }

                      {/* Price gradient overlay */}
                      <div style={{
                        position: "absolute", bottom: 0, left: 0, right: 0,
                        padding: "28px 12px 10px",
                        background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)",
                      }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                          ${car.daily_rate ?? "—"}
                          <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.85 }}>/day</span>
                        </div>
                      </div>

                      {/* Selected checkmark */}
                      {isActive && (
                        <div style={{
                          position: "absolute", top: 10, right: 10,
                          width: 26, height: 26, borderRadius: "50%",
                          background: t.accent,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                        }}>
                          <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                            <path d="M1 4L4.5 7.5L11 1" stroke={t.accentFg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Card body */}
                    <div style={{ padding: "12px 14px 14px" }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: isActive ? t.accent : t.textPri, marginBottom: 3 }}>
                        {car.make} {car.model}
                      </div>
                      <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 8, lineHeight: 1.4 }}>
                        {car.year} · {car.fuel_type} · {car.seats} seats
                      </div>

                      {/* Tags */}
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                        {[car.fuel_type, car.transmission].map(tag => (
                          <span key={tag} style={{
                            fontSize: 9, fontWeight: 600, color: t.textSec,
                            background: t.bg, border: `1px solid ${t.border}`,
                            borderRadius: 5, padding: "2px 7px",
                          }}>
                            {tag}
                          </span>
                        ))}
                        {car.location_city && (
                          <span style={{ fontSize: 9, fontWeight: 600, color: t.textSec, background: t.bg, border: `1px solid ${t.border}`, borderRadius: 5, padding: "2px 7px" }}>
                            {car.location_city}
                          </span>
                        )}
                      </div>

                      {/* Footer */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ fontSize: 11, color: t.textMuted }}>
                          <span style={{ color: "#F59E0B" }}>★</span>{" "}
                          <span style={{ fontWeight: 700, color: t.textPri }}>{Number(car.rating_avg).toFixed(1)}</span>{" "}
                          <span>({car.rating_count})</span>
                        </div>
                        <span style={{ fontSize: 10, color: t.accent, fontWeight: 600 }}>For Rent</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right – booking form */}
        <div style={{
          width: 340, flexShrink: 0,
          borderLeft: `1px solid ${t.border}`,
          background: t.cardBg,
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          {/* Panel header */}
          <div style={{ padding: "14px 20px 12px", borderBottom: `1px solid ${t.border}`, flexShrink: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: t.textPri }}>Book a Rental</div>
            <div style={{ fontSize: 11, color: t.textMuted }}>Select a vehicle and fill in your details</div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>

            {/* Selected vehicle preview */}
            {selected ? (
              <div style={{
                display: "flex", gap: 10, marginBottom: 18,
                padding: "10px 12px", background: t.bg, borderRadius: 10,
                border: `1.5px solid ${t.accent}40`,
              }}>
                <div style={{ position: "relative", width: 64, height: 48, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: dark ? "#111122" : "#f0f0f6" }}>
                  {selected.cover_image_url
                    ? <Image src={selected.cover_image_url} alt={`${selected.make} ${selected.model}`} fill sizes="64px" style={{ objectFit: "cover" }} />
                    : null
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.textPri, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {selected.make} {selected.model} {selected.year}
                  </div>
                  <div style={{ fontSize: 11, color: t.accent, fontWeight: 600 }}>
                    ${selected.daily_rate}/day · {selected.fuel_type}
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, fontSize: 20, lineHeight: 1, padding: "0 2px", alignSelf: "flex-start" }}
                >
                  ×
                </button>
              </div>
            ) : (
              <div style={{
                padding: "16px 12px", background: t.bg, borderRadius: 10,
                border: `1px dashed ${t.border}`, textAlign: "center", marginBottom: 18,
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.textSec, marginBottom: 4 }}>No vehicle selected</div>
                <div style={{ fontSize: 11, color: t.textMuted }}>← Click any car from the grid</div>
              </div>
            )}

            <style>{`.dm-input:focus { border-color: ${t.accent} !important; }`}</style>

            {/* Pickup Location */}
            <Field label="Pickup Location">
              <select
                value={pickup}
                onChange={e => setPickup(e.target.value)}
                className="dm-input"
                style={{ ...inputStyle(!!pickup), appearance: "none" as const, cursor: "pointer" }}
              >
                <option value="">Select location</option>
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </Field>

            {/* Drop-off Location */}
            <Field label="Drop-off Location">
              <select
                value={dropoff}
                onChange={e => setDropoff(e.target.value)}
                className="dm-input"
                style={{ ...inputStyle(!!dropoff), appearance: "none" as const, cursor: "pointer" }}
              >
                <option value="">Select location</option>
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </Field>

            {/* Dates — 2-column */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                placeholder="Pick start date"
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                placeholder="Pick end date"
                min={startDate || undefined}
              />
            </div>

            {/* Add-ons */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Add-ons & Extras</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {ADDON_LIST.map(a => {
                  const on = addons[a.key];
                  return (
                    <div key={a.key} onClick={() => toggleAddon(a.key)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9, border: `1.5px solid ${on ? t.accent : t.border}`, background: on ? t.accent + "08" : t.bg, cursor: "pointer", transition: "all 0.15s" }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: on ? t.accent + "18" : t.cardBg, border: `1px solid ${on ? t.accent + "44" : t.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ display: "flex" }}>{a.icon(on ? t.accent : t.textMuted)}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: t.textPri }}>{a.label}</div>
                        <div style={{ fontSize: 10, color: t.textMuted, marginTop: 1 }}>{a.desc}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: on ? t.accent : t.textPri }}>+${a.price}/day</div>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${on ? t.accent : t.border}`, background: on ? t.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", marginLeft: "auto", marginTop: 3 }}>
                          {on && <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment method */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Payment Method</div>
              <div style={{ display: "flex", gap: 8 }}>
                {([
                  { value: "mobile_money", label: "Mobile Money" },
                  { value: "stripe",       label: "Card (Stripe)" },
                ] as const).map(opt => {
                  const on = paymentMethod === opt.value;
                  return (
                    <button key={opt.value} onClick={() => setPaymentMethod(opt.value)}
                      style={{ flex: 1, padding: "9px 10px", borderRadius: 9, border: `1.5px solid ${on ? t.accent : t.border}`, background: on ? t.accent + "12" : t.bg, color: on ? t.accent : t.textSec, fontSize: 12, fontWeight: on ? 700 : 400, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s" }}>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price summary */}
            {total && (
              <div style={{
                background: t.bg, borderRadius: 10, border: `1px solid ${t.border}`,
                padding: "12px 14px", marginBottom: 16,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: t.textMuted }}>{days} day{days > 1 ? "s" : ""}</span>
                  <span style={{ color: t.textMuted }}>× ${selected!.daily_rate}/day</span>
                </div>
                {addonTotal > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                    <span style={{ color: t.textMuted }}>Add-ons</span>
                    <span style={{ color: t.textMuted }}>+${addonTotal}/day × {days} day{days > 1 ? "s" : ""}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 800, borderTop: `1px solid ${t.divider}`, paddingTop: 8 }}>
                  <span style={{ color: t.textPri }}>Total</span>
                  <span style={{ color: t.accent }}>${total}</span>
                </div>
                <div style={{ fontSize: 10, color: t.textMuted, marginTop: 4 }}>Taxes & fees included</div>
              </div>
            )}

            {/* Error */}
            {submitError && (
              <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", fontSize: 12, color: "#EF4444" }}>
                {submitError}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!canBook || submitting}
              style={{
                width: "100%", padding: "12px", borderRadius: 10, border: "none",
                background: canBook && !submitting ? t.accent : t.border,
                color: canBook && !submitting ? "#fff" : t.textMuted,
                fontSize: 13, fontWeight: 700,
                cursor: canBook && !submitting ? "pointer" : "not-allowed",
                fontFamily: "'DM Sans',sans-serif",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background 0.15s",
              }}
            >
              <span style={{ display: "flex" }}>{Ic.Booking(canBook && !submitting ? "#fff" : t.textMuted)}</span>
              {submitting ? "Submitting…" : "Confirm Booking"}
            </button>

            {!canBook && (
              <div style={{ marginTop: 10, fontSize: 11, color: t.textMuted, textAlign: "center", lineHeight: 1.5 }}>
                {!selected && "Select a vehicle ·"} {(!pickup || !dropoff) && "Set locations ·"} {(!startDate || !endDate) && "Choose dates"}
              </div>
            )}
          </div>
        </div>

      </div>
    </CustomerShell>
  );
}
