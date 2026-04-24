"use client";
export const dynamic = "force-dynamic";
// src/app/customer/buy-car/page.tsx

import { useTheme } from "@/src/context/ThemeContext";
import { useState, useMemo, useEffect, useRef } from "react";
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

const BUY_DEFAULTS: Filters = { ...DEFAULT_FILTERS, listingType: "Buy", priceMax: 200000 };

const LOCATIONS = [
  "Accra Central", "Airport Accra", "East Legon", "Osu, Accra",
  "Cantonments", "Tema", "Kumasi", "Spintex",
];

const STATIC_BUY_CARS: ApiCar[] = CARS
  .filter(car => {
    const f = FLEET_DATA[car.id];
    return f?.status === "Available" && f.listingTypes.includes("buy");
  })
  .map(car => {
    const f = FLEET_DATA[car.id]!;
    const [make, ...rest] = car.name.split(" ");
    return {
      id: String(car.id), make, model: rest.join(" "),
      year: f.year, plate_number: f.plate,
      fuel_type: car.fuel, transmission: car.transmission,
      seats: car.seats ?? 5, mileage_km: f.mileage,
      listing_type: "buy", daily_rate: f.rentalRate,
      sale_price: f.salePrice, status: "active",
      cover_image_url: car.image, location_city: f.location,
      rating_avg: car.rating, rating_count: car.reviews,
      is_verified: true, created_at: "2026-01-01T00:00:00Z",
    } as ApiCar;
  });

export default function CustomerBuyCarPage() {
  const { dark, t } = useTheme();
  const searchParams = useSearchParams();
  const { toggle: toggleFav, isFav } = useFavourites();
  const { cars: apiCars, loading: carsLoading } = useCars({ listing_type: "buy", limit: 100 });
  const cars = !carsLoading && apiCars.length === 0 ? STATIC_BUY_CARS : apiCars;
  const [filters, setFilters] = useState<Filters>(BUY_DEFAULTS);
  const [sort, setSort] = useState("price-asc");
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Purchase flow state
  const [buying, setBuying] = useState<ApiCar | null>(null);
  const [pickupLocation, setPickupLocation] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"mobile_money" | "stripe">("mobile_money");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [purchased, setPurchased] = useState<ApiCar | null>(null);

  useEffect(() => {
    const id = searchParams.get("carId");
    if (id && cars.length > 0) {
      const car = cars.find(c => c.id === id);
      if (car) {
        setHighlighted(id);
        setTimeout(() => {
          cardRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
      }
    }
  }, [searchParams, cars]);

  const filtered = useMemo(() => {
    let list = cars.filter((c: ApiCar) => {
      const price = Number(c.sale_price ?? 0);
      if (price < filters.priceMin || price > filters.priceMax) return false;
      if (filters.transmission !== "Any" && c.transmission.toLowerCase() !== filters.transmission.toLowerCase()) return false;
      if (filters.listingType !== "Any" && filters.listingType !== "Buy") return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!`${c.make} ${c.model} ${c.fuel_type}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    if (sort === "price-asc")  list = [...list].sort((a, b) => Number(a.sale_price ?? 0) - Number(b.sale_price ?? 0));
    if (sort === "price-desc") list = [...list].sort((a, b) => Number(b.sale_price ?? 0) - Number(a.sale_price ?? 0));
    if (sort === "rating")     list = [...list].sort((a, b) => Number(b.rating_avg) - Number(a.rating_avg));
    return list;
  }, [cars, filters, sort]);

  const handleBuyNow = async () => {
    if (!buying || !pickupLocation) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const today = new Date().toISOString();
      const booking = await bookingsApi.create({
        car_id: buying.id,
        booking_type: "buy",
        start_date: today,
        end_date: today,
        pickup_location: pickupLocation,
        dropoff_location: pickupLocation,
        payment_method: paymentMethod,
      });
      const payment = await paymentsApi.initiate({ booking_id: booking.id, method: paymentMethod });
      if (paymentMethod === "stripe" && payment.checkout_url) {
        window.location.href = payment.checkout_url;
        return;
      }
      setPurchased(buying);
      setBuying(null);
      setPickupLocation("");
    } catch (err: any) {
      setSubmitError(err?.response?.data?.detail || "Purchase failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CustomerShell
      title="Buy a Car"
      subtitle={carsLoading ? "Loading vehicles…" : `${filtered.length} vehicles for sale`}
      actions={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", display: "flex", opacity: 0.4 }}>{Ic.Search(t.textMuted)}</span>
            <input
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              placeholder="Search make or model…"
              style={{ width: 190, padding: "7px 10px 7px 28px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.textPri, fontSize: 12, outline: "none", fontFamily: "'DM Sans',sans-serif" }}
              onFocus={e => (e.target.style.borderColor = t.accent)}
              onBlur={e  => (e.target.style.borderColor = t.border)}
            />
          </div>
          <span style={{ fontSize: 11, color: t.textMuted }}>Sort:</span>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            style={{ fontSize: 11, color: t.textSec, background: t.bg, border: `1px solid ${t.border}`, borderRadius: 7, padding: "6px 10px", outline: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
          >
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Best Rated</option>
          </select>
        </div>
      }
    >
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Filter sidebar */}
        <Sidebar f={filters} sf={setFilters} t={t} />

        {/* Car grid */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20, background: t.bg }}>

          {highlighted && cars.find(c => c.id === highlighted) && (() => {
            const car = cars.find(c => c.id === highlighted)!;
            return (
              <div style={{ marginBottom: 14, padding: "10px 14px", borderRadius: 10, background: t.accent + "12", border: `1px solid ${t.accent}30`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ display: "flex", opacity: 0.8 }}>{Ic.Buy(t.accent)}</span>
                  <span style={{ fontSize: 12, color: t.accent, fontWeight: 600 }}>{car.make} {car.model} — selected from Browse Cars</span>
                </div>
                <button onClick={() => setHighlighted(null)} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, fontSize: 18, lineHeight: 1, padding: "0 2px" }}>×</button>
              </div>
            );
          })()}

          <div style={{ marginBottom: 16, fontSize: 13, fontWeight: 700, color: t.textPri }}>
            {carsLoading ? "Loading…" : <>{filtered.length} <span style={{ fontWeight: 400, color: t.textMuted }}>vehicles for sale</span></>}
          </div>

          {carsLoading ? (
            <CarGridSkeleton count={6} />
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: t.textSec, marginBottom: 8 }}>No vehicles match your filters</div>
              <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 20 }}>Try adjusting the price range or clearing filters</div>
              <button onClick={() => setFilters(BUY_DEFAULTS)} style={{ fontSize: 12, color: t.accent, background: "none", border: `1px solid ${t.accent}`, borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>Reset all filters</button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, alignContent: "start" }}>
              {filtered.map((car: ApiCar) => {
                const price = car.sale_price ? `$${Number(car.sale_price).toLocaleString()}` : "Contact us";
                const isHighlighted = highlighted === car.id;
                return (
                  <div
                    key={car.id}
                    ref={el => { cardRefs.current[car.id] = el; }}
                    style={{ background: t.cardBg, borderRadius: 16, border: `${isHighlighted ? "2px" : "1px"} solid ${isHighlighted ? t.accent : t.border}`, overflow: "hidden", cursor: "pointer", transition: "all 0.2s", boxShadow: isHighlighted ? `0 0 0 4px ${t.accent}20` : "none" }}
                    onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.transform = "translateY(-2px)"; d.style.boxShadow = dark ? "0 10px 32px rgba(0,0,0,0.35)" : "0 10px 32px rgba(0,0,0,0.1)"; }}
                    onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.transform = "none"; d.style.boxShadow = isHighlighted ? `0 0 0 4px ${t.accent}20` : "none"; }}
                  >
                    {/* Image */}
                    <div style={{ position: "relative", height: 200, background: dark ? "#111122" : "#f0f0f6", overflow: "hidden" }}>
                      {car.cover_image_url
                        ? <Image src={car.cover_image_url} alt={`${car.make} ${car.model}`} fill sizes="300px" style={{ objectFit: "cover" }} />
                        : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:t.textMuted }}>No image</div>
                      }
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.04) 55%)" }} />

                      {/* Favourite */}
                      <button
                        onClick={e => { e.stopPropagation(); toggleFav(car.id); }}
                        style={{ position: "absolute", top: 10, right: 10, width: 30, height: 30, borderRadius: "50%", border: `1px solid ${isFav(car.id) ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.2)"}`, background: isFav(car.id) ? "rgba(239,68,68,0.15)" : "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(4px)" }}
                      >
                        {Ic.Heart(isFav(car.id) ? "#EF4444" : "#fff", isFav(car.id))}
                      </button>

                      {/* Price overlay */}
                      <div style={{ position: "absolute", bottom: 14, left: 14, right: 14, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{price}</div>
                          {car.sale_price && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>Negotiable</div>}
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.85)", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 7, padding: "4px 9px" }}>
                          {car.fuel_type}
                        </span>
                      </div>
                    </div>

                    {/* Card body */}
                    <div style={{ padding: 16 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: t.textPri, marginBottom: 3 }}>{car.make} {car.model}</div>
                      <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 12, lineHeight: 1.5 }}>{car.year} · {car.transmission} · {car.seats} seats</div>

                      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                        {[car.fuel_type, car.transmission, car.location_city].filter(Boolean).map(tag => (
                          <span key={tag} style={{ fontSize: 10, fontWeight: 600, color: t.textSec, background: t.bg, border: `1px solid ${t.border}`, borderRadius: 6, padding: "3px 9px" }}>{tag}</span>
                        ))}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: `1px solid ${t.divider}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{ color: "#F59E0B", fontSize: 13 }}>★</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: t.textPri }}>{Number(car.rating_avg).toFixed(1)}</span>
                          <span style={{ fontSize: 11, color: t.textMuted }}>({car.rating_count})</span>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => setBuying(car)}
                            style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${t.border}`, background: "none", color: t.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = t.accent; (e.currentTarget as HTMLButtonElement).style.color = t.accent; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = t.border; (e.currentTarget as HTMLButtonElement).style.color = t.textSec; }}
                          >
                            Enquire
                          </button>
                          <button
                            onClick={() => setBuying(car)}
                            style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: t.accent, color: t.accentFg, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 6 }}
                          >
                            <span style={{ display: "flex" }}>{Ic.Buy(t.accentFg)}</span>
                            Buy Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Buy Now modal ─────────────────────────────────────────────────────── */}
      {buying && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: t.cardBg, borderRadius: 18, border: `1px solid ${t.border}`, width: "100%", maxWidth: 420, padding: "28px 28px 24px", boxShadow: dark ? "0 24px 80px rgba(0,0,0,0.6)" : "0 24px 80px rgba(0,0,0,0.18)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: t.textPri }}>{buying.make} {buying.model}</div>
                <div style={{ fontSize: 12, color: t.textMuted }}>{buying.year} · {buying.fuel_type}</div>
              </div>
              <button onClick={() => { setBuying(null); setSubmitError(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, fontSize: 22, lineHeight: 1 }}>×</button>
            </div>

            <div style={{ fontSize: 26, fontWeight: 800, color: t.accent, marginBottom: 20 }}>
              {buying.sale_price ? `$${Number(buying.sale_price).toLocaleString()}` : "Contact us"}
            </div>

            {/* Pickup location */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: 0.9, textTransform: "uppercase", color: t.textMuted, marginBottom: 6 }}>Pickup Location</label>
              <select
                value={pickupLocation}
                onChange={e => setPickupLocation(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: pickupLocation ? t.textPri : t.textMuted, fontSize: 12, outline: "none", fontFamily: "'DM Sans',sans-serif", appearance: "none", cursor: "pointer", boxSizing: "border-box" }}
              >
                <option value="">Select pickup location</option>
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {/* Payment method */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: 0.9, textTransform: "uppercase", color: t.textMuted, marginBottom: 6 }}>Payment Method</label>
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

            {submitError && (
              <div style={{ marginBottom: 14, padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", fontSize: 12, color: "#EF4444" }}>
                {submitError}
              </div>
            )}

            <button
              onClick={handleBuyNow}
              disabled={!pickupLocation || submitting}
              style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: pickupLocation && !submitting ? t.accent : t.border, color: pickupLocation && !submitting ? t.accentFg : t.textMuted, fontSize: 13, fontWeight: 700, cursor: pickupLocation && !submitting ? "pointer" : "not-allowed", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <span style={{ display: "flex" }}>{Ic.Buy(pickupLocation && !submitting ? t.accentFg : t.textMuted)}</span>
              {submitting ? "Processing…" : paymentMethod === "stripe" ? "Pay with Card" : "Confirm Purchase"}
            </button>
          </div>
        </div>
      )}

      {/* ── Purchase success toast ─────────────────────────────────────────── */}
      {purchased && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, boxShadow: dark ? "0 12px 40px rgba(0,0,0,0.5)" : "0 12px 40px rgba(0,0,0,0.15)", zIndex: 200, maxWidth: 380 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {Ic.Check("#10B981")}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.textPri }}>Purchase Submitted!</div>
            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 1 }}>
              Our team will contact you about the <strong style={{ color: t.textPri }}>{purchased.make} {purchased.model}</strong>.
            </div>
          </div>
          <button onClick={() => setPurchased(null)} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, fontSize: 20, lineHeight: 1, padding: "0 4px", flexShrink: 0 }}>×</button>
        </div>
      )}
    </CustomerShell>
  );
}
