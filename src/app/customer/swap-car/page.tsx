"use client";
export const dynamic = "force-dynamic";
// src/app/customer/swap-car/page.tsx

import { useTheme } from "@/src/context/ThemeContext";
import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import CustomerShell from "@/src/components/layout/Customershell";
import Sidebar from "@/src/components/layout/Sidebar";
import { Ic } from "@/src/components/ui/Icons";
import { useCars, useMyCars } from "@/src/hooks/useApi";
import { swapsApi } from "@/src/lib/api";
import type { ApiCar } from "@/src/lib/api";
import { Filters, DEFAULT_FILTERS } from "@/src/types/car";
import { useFavourites } from "@/src/context/FavouritesContext";
import { CARS } from "@/src/lib/data/cars";
import { FLEET_DATA } from "@/src/lib/data/fleet";
import CarGridSkeleton from "@/src/components/ui/Skeleton";

const STATIC_SWAP_CARS: ApiCar[] = CARS
  .filter(car => {
    const f = FLEET_DATA[car.id];
    return f?.status === "Available" && f.listingTypes.includes("swap");
  })
  .map(car => {
    const f = FLEET_DATA[car.id]!;
    const [make, ...rest] = car.name.split(" ");
    return {
      id: String(car.id), make, model: rest.join(" "),
      year: f.year, plate_number: f.plate,
      fuel_type: car.fuel, transmission: car.transmission,
      seats: car.seats ?? 5, mileage_km: f.mileage,
      listing_type: "swap", daily_rate: f.rentalRate,
      sale_price: f.salePrice || undefined, status: "active",
      cover_image_url: car.image, location_city: f.location,
      rating_avg: car.rating, rating_count: car.reviews,
      is_verified: true, created_at: "2026-01-01T00:00:00Z",
    } as ApiCar;
  });

const SWAP_DEFAULTS: Filters = { ...DEFAULT_FILTERS, listingType: "Swap" };

function inputStyle(accent: string, border: string, bg: string, textPri: string): React.CSSProperties {
  return {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: `1px solid ${border}`, background: bg,
    color: textPri, fontSize: 12, outline: "none",
    fontFamily: "'DM Sans',sans-serif", transition: "border-color 0.15s",
    boxSizing: "border-box" as const,
  };
}

export default function CustomerSwapCarPage() {
  const { dark, setDark, t } = useTheme();
  const searchParams = useSearchParams();
  const { toggle: toggleFav, isFav } = useFavourites();
  const { cars: apiFleetCars, loading: fleetLoading } = useCars({ listing_type: "swap", limit: 100 });
  const fleetCars = !fleetLoading && apiFleetCars.length === 0 ? STATIC_SWAP_CARS : apiFleetCars;
  const { cars: myCars, loading: myCarsLoading } = useMyCars();
  const [filters, setFilters]     = useState<Filters>(SWAP_DEFAULTS);
  const [wanting, setWanting]     = useState<ApiCar | null>(null);
  const [offeredCarId, setOfferedCarId] = useState("");
  const [topUp, setTopUp]         = useState("");
  const [note, setNote]           = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const id = searchParams.get("carId");
    if (id && fleetCars.length > 0 && !wanting) {
      const car = fleetCars.find(c => c.id === id);
      if (car) setWanting(car);
    }
  }, [searchParams, fleetCars]);

  const canSubmit = !!(offeredCarId && wanting);

  const filtered = useMemo(() => fleetCars.filter((c: ApiCar) => {
    const rate = c.daily_rate ?? c.sale_price ?? 0;
    if (rate < filters.priceMin || rate > filters.priceMax) return false;
    if (filters.transmission !== "Any" && c.transmission.toLowerCase() !== filters.transmission.toLowerCase()) return false;
    if (filters.listingType !== "Any" && filters.listingType !== "Swap") return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!`${c.make} ${c.model} ${c.fuel_type}`.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [fleetCars, filters]);

  const handleSubmit = async () => {
    if (!canSubmit || !wanting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await swapsApi.create({
        offered_car_id: offeredCarId,
        wanted_car_id: wanting.id,
        message: note || undefined,
        top_up_amount: topUp ? parseFloat(topUp) : 0,
      });
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.detail || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Success screen ───────────────────────────────────────────────────────── */
  if (submitted && wanting) {
    const offeredCar = myCars.find(c => c.id === offeredCarId);
    return (
      <CustomerShell title="Swap a Car" dark={dark} setDark={setDark} t={t}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: t.bg, padding: 24 }}>
          <div style={{ background: t.cardBg, borderRadius: 20, border: `1px solid ${t.border}`, padding: "44px 52px", textAlign: "center", maxWidth: 420, width: "100%" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
              {Ic.Check("#10B981")}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: t.textPri, marginBottom: 8 }}>Swap Request Submitted!</div>
            <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.6, marginBottom: 24 }}>
              Your request to swap{offeredCar ? <> your <strong style={{ color: t.textPri }}>{offeredCar.make} {offeredCar.model}</strong></> : " your car"} for the{" "}
              <strong style={{ color: t.textPri }}>{wanting.make} {wanting.model}</strong> is pending review.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center", marginBottom: 28 }}>
              <div style={{ background: t.bg, borderRadius: 10, border: `1px solid ${t.border}`, padding: "12px 14px", textAlign: "left" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: t.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Offering</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.textPri }}>{offeredCar ? `${offeredCar.make} ${offeredCar.model}` : "Your car"}</div>
              </div>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="13" stroke={t.border} strokeWidth="1.5"/>
                <path d="M8 14h12M16 10l4 4-4 4" stroke={t.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div style={{ background: t.bg, borderRadius: 10, border: `1.5px solid ${t.accent}40`, padding: "12px 14px", textAlign: "left" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: t.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Wanting</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.textPri }}>{wanting.make} {wanting.model}</div>
                <div style={{ fontSize: 10, color: t.textMuted, marginTop: 2 }}>{wanting.fuel_type} · {wanting.transmission}</div>
              </div>
            </div>
            <button
              onClick={() => { setSubmitted(false); setWanting(null); setOfferedCarId(""); setTopUp(""); setNote(""); }}
              style={{ padding: "11px 28px", borderRadius: 10, border: "none", background: t.accent, color: t.accentFg, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
            >
              Submit Another
            </button>
          </div>
        </div>
      </CustomerShell>
    );
  }

  /* ── Main page ────────────────────────────────────────────────────────────── */
  return (
    <CustomerShell
      title="Swap a Car"
      subtitle={fleetLoading ? "Loading…" : `${filtered.length} vehicle${filtered.length !== 1 ? "s" : ""} available to swap`}
      dark={dark} setDark={setDark} t={t}
      actions={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", display: "flex", opacity: 0.4 }}>{Ic.Search(t.textMuted)}</span>
            <input
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              placeholder="Search vehicles…"
              style={{ width: 190, padding: "7px 10px 7px 28px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.textPri, fontSize: 12, outline: "none", fontFamily: "'DM Sans',sans-serif" }}
              onFocus={e => (e.target.style.borderColor = t.accent)}
              onBlur={e  => (e.target.style.borderColor = t.border)}
            />
          </div>
        </div>
      }
    >
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Filter sidebar */}
        <Sidebar f={filters} sf={setFilters} t={t} />

        {/* Fleet grid */}
        <div style={{ flex: 1, overflowY: "auto", padding: 16, background: t.bg }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.textPri, marginBottom: 2 }}>Available Fleet</div>
            <div style={{ fontSize: 11, color: t.textMuted }}>Click a vehicle to set it as your desired swap target.</div>
          </div>

          {fleetLoading ? (
            <CarGridSkeleton count={6} />
          ) : filtered.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "50%", gap: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: t.textSec }}>No vehicles match your filters</div>
              <button onClick={() => setFilters(SWAP_DEFAULTS)} style={{ fontSize: 12, color: t.accent, background: "none", border: `1px solid ${t.accent}`, borderRadius: 8, padding: "7px 18px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Reset filters</button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14, alignContent: "start" }}>
              {filtered.map((car: ApiCar) => {
                const isWanted = wanting?.id === car.id;
                return (
                  <div
                    key={car.id}
                    onClick={() => setWanting(isWanted ? null : car)}
                    style={{ background: t.cardBg, borderRadius: 14, border: `2px solid ${isWanted ? t.accent : t.border}`, overflow: "hidden", cursor: "pointer", transition: "all 0.15s", transform: isWanted ? "translateY(-2px)" : "translateY(0)", boxShadow: isWanted ? `0 0 0 3px ${t.accent}22` : "none" }}
                    onMouseEnter={e => { if (!isWanted) (e.currentTarget as HTMLDivElement).style.borderColor = t.accent + "66"; }}
                    onMouseLeave={e => { if (!isWanted) (e.currentTarget as HTMLDivElement).style.borderColor = t.border; }}
                  >
                    <div style={{ position: "relative", height: 148, background: dark ? "#111122" : "#f0f0f6" }}>
                      {car.cover_image_url
                        ? <Image src={car.cover_image_url} alt={`${car.make} ${car.model}`} fill sizes="220px" style={{ objectFit: "cover" }} />
                        : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:t.textMuted }}>No image</div>
                      }
                      <button
                        onClick={e => { e.stopPropagation(); toggleFav(car.id); }}
                        style={{ position: "absolute", top: 10, left: 10, width: 28, height: 28, borderRadius: "50%", border: `1px solid ${isFav(car.id) ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.2)"}`, background: isFav(car.id) ? "rgba(239,68,68,0.15)" : "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(4px)" }}
                      >
                        {Ic.Heart(isFav(car.id) ? "#EF4444" : "#fff", isFav(car.id))}
                      </button>
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 10px 8px", background: "linear-gradient(to top, rgba(0,0,0,0.68) 0%, transparent 100%)" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.75)" }}>Swap Value</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
                          {car.sale_price ? `$${Number(car.sale_price).toLocaleString()}` : car.daily_rate ? `$${car.daily_rate}/day` : "—"}
                        </div>
                      </div>
                      {isWanted && (
                        <div style={{ position: "absolute", top: 10, right: 10, width: 26, height: 26, borderRadius: "50%", background: t.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="12" height="9" viewBox="0 0 12 9" fill="none"><path d="M1 4L4.5 7.5L11 1" stroke={t.accentFg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      )}
                      <div style={{ position: "absolute", top: 10, right: isWanted ? 42 : 10, background: "rgba(245,158,11,0.9)", borderRadius: 6, padding: "3px 8px", fontSize: 9, fontWeight: 700, color: "#fff" }}>For Swap</div>
                    </div>
                    <div style={{ padding: "12px 14px 14px" }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: isWanted ? t.accent : t.textPri, marginBottom: 3 }}>{car.make} {car.model}</div>
                      <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 8, lineHeight: 1.4 }}>{car.year} · {car.fuel_type} · {car.seats} seats</div>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
                        {[car.fuel_type, car.transmission, car.location_city].filter(Boolean).map(tag => (
                          <span key={tag} style={{ fontSize: 9, fontWeight: 600, color: t.textSec, background: t.bg, border: `1px solid ${t.border}`, borderRadius: 5, padding: "2px 7px" }}>{tag}</span>
                        ))}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ fontSize: 11, color: t.textMuted }}>
                          <span style={{ color: "#F59E0B" }}>★</span>{" "}
                          <span style={{ fontWeight: 700, color: t.textPri }}>{Number(car.rating_avg).toFixed(1)}</span>{" "}
                          <span>({car.rating_count})</span>
                        </div>
                        <span style={{ fontSize: 10, color: t.textMuted }}>{car.location_city ?? "—"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Swap request form */}
        <div style={{ width: 340, flexShrink: 0, borderLeft: `1px solid ${t.border}`, background: t.cardBg, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px 12px", borderBottom: `1px solid ${t.border}`, flexShrink: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: t.textPri }}>Swap Request</div>
            <div style={{ fontSize: 11, color: t.textMuted }}>Exchange your vehicle for one from our fleet</div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>

            {/* Desired vehicle */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 10, fontWeight: 700, letterSpacing: 0.9, textTransform: "uppercase", color: t.textMuted }}>Desired Vehicle</label>
              {wanting ? (
                <div style={{ display: "flex", gap: 10, padding: "10px 12px", background: t.bg, borderRadius: 10, border: `1.5px solid ${t.accent}40` }}>
                  <div style={{ position: "relative", width: 56, height: 44, borderRadius: 7, overflow: "hidden", flexShrink: 0, background: dark ? "#111122" : "#f0f0f6" }}>
                    {wanting.cover_image_url && <Image src={wanting.cover_image_url} alt={`${wanting.make} ${wanting.model}`} fill sizes="56px" style={{ objectFit: "cover" }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: t.textPri, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{wanting.make} {wanting.model}</div>
                    <div style={{ fontSize: 11, color: t.accent, fontWeight: 600 }}>{wanting.fuel_type} · {wanting.transmission}</div>
                  </div>
                  <button onClick={() => setWanting(null)} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, fontSize: 20, lineHeight: 1, padding: "0 2px", alignSelf: "flex-start" }}>×</button>
                </div>
              ) : (
                <div style={{ padding: "14px 12px", background: t.bg, borderRadius: 10, border: `1px dashed ${t.border}`, textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.textSec, marginBottom: 4 }}>No vehicle selected</div>
                  <div style={{ fontSize: 11, color: t.textMuted }}>← Click a car from the fleet</div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: t.divider }} />
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: t.bg, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ display: "flex", opacity: 0.6 }}>{Ic.Swap(t.textMuted)}</span>
              </div>
              <div style={{ flex: 1, height: 1, background: t.divider }} />
            </div>

            {/* Your vehicle (from registered cars) */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 5, fontSize: 10, fontWeight: 700, letterSpacing: 0.9, textTransform: "uppercase", color: t.textMuted }}>Your Vehicle (Offering)</label>
              {myCarsLoading ? (
                <div style={{ fontSize: 12, color: t.textMuted, padding: "9px 12px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg }}>Loading your cars…</div>
              ) : myCars.length === 0 ? (
                <div style={{ fontSize: 12, color: t.textMuted, padding: "10px 12px", borderRadius: 8, border: `1px dashed ${t.border}`, background: t.bg, lineHeight: 1.5 }}>
                  No registered cars found. Register your car in your profile to submit a swap request.
                </div>
              ) : (
                <select
                  value={offeredCarId}
                  onChange={e => setOfferedCarId(e.target.value)}
                  style={{ ...inputStyle(t.accent, t.border, t.bg, t.textPri), appearance: "none", cursor: "pointer" }}
                  onFocus={e => (e.target.style.borderColor = t.accent)}
                  onBlur={e  => (e.target.style.borderColor = t.border)}
                >
                  <option value="">Select your car</option>
                  {myCars.map(c => (
                    <option key={c.id} value={c.id}>{c.make} {c.model} {c.year} · {c.plate_number}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Top-up amount */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 5, fontSize: 10, fontWeight: 700, letterSpacing: 0.9, textTransform: "uppercase", color: t.textMuted }}>
                Top-up Amount <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span>
              </label>
              <input
                type="number"
                value={topUp}
                onChange={e => setTopUp(e.target.value)}
                placeholder="e.g. 500"
                min="0"
                style={inputStyle(t.accent, t.border, t.bg, t.textPri)}
                onFocus={e => (e.target.style.borderColor = t.accent)}
                onBlur={e  => (e.target.style.borderColor = t.border)}
              />
            </div>

            {/* Note */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", marginBottom: 5, fontSize: 10, fontWeight: 700, letterSpacing: 0.9, textTransform: "uppercase", color: t.textMuted }}>
                Note <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span>
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Any extras, condition notes, negotiation terms…"
                rows={3}
                style={{ ...inputStyle(t.accent, t.border, t.bg, t.textPri), resize: "vertical" }}
                onFocus={e => (e.target.style.borderColor = t.accent)}
                onBlur={e  => (e.target.style.borderColor = t.border)}
              />
            </div>

            {submitError && (
              <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", fontSize: 12, color: "#EF4444" }}>{submitError}</div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: canSubmit && !submitting ? t.accent : t.border, color: canSubmit && !submitting ? "#fff" : t.textMuted, fontSize: 13, fontWeight: 700, cursor: canSubmit && !submitting ? "pointer" : "not-allowed", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.15s" }}
            >
              <span style={{ display: "flex" }}>{Ic.Swap(canSubmit && !submitting ? "#fff" : t.textMuted)}</span>
              {submitting ? "Submitting…" : "Submit Swap Request"}
            </button>

            {!canSubmit && (
              <div style={{ marginTop: 10, fontSize: 11, color: t.textMuted, textAlign: "center", lineHeight: 1.5 }}>
                {!wanting && "Select a desired vehicle · "}{!offeredCarId && "Choose your car"}
              </div>
            )}
          </div>
        </div>
      </div>
    </CustomerShell>
  );
}
