"use client";
import { useTheme } from "@/src/context/ThemeContext";
// src/app/customer/cars/page.tsx

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import CustomerShell from "@/src/components/layout/Customershell";
import Sidebar from "@/src/components/layout/Sidebar";
import { Ic } from "@/src/components/ui/Icons";
import { useCars } from "@/src/hooks/useApi";
import type { ApiCar } from "@/src/lib/api";
import { Filters, DEFAULT_FILTERS } from "@/src/types/car";
import type { CarPin } from "@/src/components/tracking/LeafletMap";
import { useFavourites } from "@/src/context/FavouritesContext";
import { CARS } from "@/src/lib/data/cars";
import { FLEET_DATA } from "@/src/lib/data/fleet";
import CarGridSkeleton from "@/src/components/ui/Skeleton";

const LeafletMap = dynamic(() => import("@/src/components/tracking/LeafletMap"), { ssr: false });

// Static fleet fallback — all Available cars, listing_type set per fleet entry (first type wins).
// When API returns nothing (dev mode), the browse page shows these.
const STATIC_FLEET_CARS: ApiCar[] = CARS
  .filter(car => FLEET_DATA[car.id]?.status === "Available")
  .map(car => {
    const f = FLEET_DATA[car.id]!;
    const [make, ...rest] = car.name.split(" ");
    return {
      id:              String(car.id),
      make,
      model:           rest.join(" "),
      year:            f.year,
      plate_number:    f.plate,
      fuel_type:       car.fuel,
      transmission:    car.transmission,
      seats:           car.seats ?? 5,
      mileage_km:      f.mileage,
      listing_type:    f.listingTypes[0],   // primary type for badge display
      daily_rate:      car.price,
      sale_price:      f.salePrice || undefined,
      status:          "active",
      cover_image_url: car.image,
      location_city:   f.location,
      rating_avg:      car.rating,
      rating_count:    car.reviews,
      is_verified:     true,
      created_at:      "2026-01-01T00:00:00Z",
    } as ApiCar;
  });

const STATUS_COLOR: Record<string, string> = {
  "In Transit": "#10B981",
  "Parked": "#6B7280",
};

function vehicleStatus(car: ApiCar): "In Transit" | "Parked" {
  return car.status === "active" ? "In Transit" : "Parked";
}

function carLabel(car: ApiCar) { return `${car.make} ${car.model} ${car.year}`; }
function displayPrice(car: ApiCar, listingType: string) {
  if (listingType === "Buy") return car.sale_price ? `$${Number(car.sale_price).toLocaleString()}` : "Contact us";
  return car.daily_rate ? `$${car.daily_rate}/day` : "Contact us";
}

export default function CustomerCarsPage() {
  const { dark, setDark, t } = useTheme();
  const router = useRouter();
  const { toggle: toggleFav, isFav } = useFavourites();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [showMap, setShowMap] = useState(false);
  const [selected, setSelected] = useState<ApiCar | null>(null);

  const listingTypeParam = filters.listingType === "Rent" ? "rent"
    : filters.listingType === "Buy" ? "buy"
    : filters.listingType === "Swap" ? "swap"
    : undefined;

  const { cars: apiCars, loading: carsLoading } = useCars({ listing_type: listingTypeParam, limit: 100 });

  // Use API cars when available; fall back to static fleet (Available only) when API returns nothing
  const cars = !carsLoading && apiCars.length === 0 ? STATIC_FLEET_CARS : apiCars;

  const filtered = useMemo(() => cars.filter((c: ApiCar) => {
    const rate = c.daily_rate ?? c.sale_price ?? 0;
    if (rate < filters.priceMin || rate > filters.priceMax) return false;
    if (filters.transmission !== "Any" && c.transmission.toLowerCase() !== filters.transmission.toLowerCase()) return false;
    if (filters.listingType !== "Any") {
      const lt = filters.listingType.toLowerCase();
      // For static cars: check against fleet listingTypes; for API cars: check listing_type field
      const fleetEntry = FLEET_DATA[Number(c.id)];
      if (fleetEntry) {
        if (!fleetEntry.listingTypes.includes(lt as any)) return false;
      } else if (c.listing_type && c.listing_type.toLowerCase() !== lt) {
        return false;
      }
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!`${c.make} ${c.model} ${c.fuel_type}`.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [cars, filters]);

  const actionLabel = filters.listingType === "Buy" ? "Buy Now"
    : filters.listingType === "Swap" ? "Request Swap"
    : filters.listingType === "Rent" ? "Book Rental"
    : "View Details";

  const handleAction = (car: ApiCar) => {
    if (filters.listingType === "Buy")  router.push(`/customer/buy-car?carId=${car.id}`);
    else if (filters.listingType === "Swap") router.push(`/customer/swap-car?carId=${car.id}`);
    else if (filters.listingType === "Rent") router.push(`/customer/rent-car?carId=${car.id}`);
    else setSelected(car);
  };

  const handleFilters = (next: Filters) => {
    if (next.listingType !== filters.listingType) {
      if (next.listingType === "Buy")  { router.push("/customer/buy-car");  return; }
      if (next.listingType === "Swap") { router.push("/customer/swap-car"); return; }
      if (next.listingType === "Rent") { router.push("/customer/rent-car"); return; }
    }
    setFilters(next);
  };

  const selStatus = selected ? vehicleStatus(selected) : null;

  return (
    <CustomerShell
      title="Browse Cars"
      subtitle={carsLoading ? "Loading…" : `${filtered.length} vehicle${filtered.length !== 1 ? "s" : ""} found`}
      dark={dark} setDark={setDark} t={t}
      actions={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Count badge */}
          <span style={{ fontSize: 12, color: t.textMuted }}>{filtered.length} cars</span>

          {/* Map toggle */}
          <button
            onClick={() => setShowMap(v => !v)}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: `1px solid ${showMap ? t.accent : t.border}`, background: showMap ? t.accent + "18" : t.bg, color: showMap ? t.accent : t.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s" }}
          >
            <span style={{ display: "flex" }}>{Ic.Map(showMap ? t.accent : t.textMuted)}</span>
            {showMap ? "Hide Map" : "Show Map"}
          </button>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", display: "flex", opacity: 0.4 }}>{Ic.Search(t.textMuted)}</span>
            <input
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              placeholder="Search cars…"
              style={{ width: 170, padding: "7px 10px 7px 26px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.textPri, fontSize: 12, outline: "none", fontFamily: "'DM Sans',sans-serif", transition: "border-color 0.15s" }}
              onFocus={e => (e.target.style.borderColor = t.accent)}
              onBlur={e => (e.target.style.borderColor = t.border)}
            />
          </div>
        </div>
      }
    >
      {/* Active filter badges */}
      {(filters.listingType !== "Any" || filters.availableNow || filters.rentalType !== "Any") && (
        <div style={{ padding: "7px 16px", borderBottom: `1px solid ${t.border}`, background: t.cardBg, display: "flex", gap: 7, alignItems: "center", flexShrink: 0 }}>
          {filters.listingType !== "Any" && (
            <span style={{ fontSize: 11, fontWeight: 700, color: t.accent, background: t.accent + "14", border: `1px solid ${t.accent}30`, borderRadius: 20, padding: "3px 10px" }}>
              {filters.listingType === "Rent" ? "For Rent" : filters.listingType === "Buy" ? "For Sale" : "For Swap"}
            </span>
          )}
          {filters.rentalType !== "Any" && (
            <span style={{ fontSize: 11, fontWeight: 600, color: t.textSec, background: t.bg, border: `1px solid ${t.border}`, borderRadius: 20, padding: "3px 10px" }}>
              {filters.rentalType}
            </span>
          )}
          {filters.availableNow && (
            <span style={{ fontSize: 11, fontWeight: 600, color: "#10B981", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 20, padding: "3px 10px" }}>
              Available Now
            </span>
          )}
          <button onClick={() => setFilters(DEFAULT_FILTERS)} style={{ marginLeft: "auto", fontSize: 11, color: t.textMuted, background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
            Reset all
          </button>
        </div>
      )}

      {/* Main layout: Sidebar + content + right panel */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Filter sidebar */}
        <Sidebar f={filters} sf={handleFilters} t={t} />

        {/* Car grid / map */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
          <div style={{
            flex: 1, overflowY: "auto", padding: 16,
            display: showMap ? "flex" : "grid",
            gridTemplateColumns: showMap ? undefined : "repeat(auto-fill, minmax(230px, 1fr))",
            flexDirection: showMap ? "column" : undefined,
            gap: 12, alignContent: "start", background: t.bg,
          }}>
            {carsLoading ? (
              <div style={{ gridColumn: "1/-1" }}><CarGridSkeleton count={8} /></div>
            ) : filtered.length === 0 ? (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: t.textSec, marginBottom: 8 }}>No cars match your filters</div>
                <button onClick={() => setFilters(DEFAULT_FILTERS)}
                  style={{ fontSize: 12, color: t.accent, background: "none", border: `1px solid ${t.accent}`, borderRadius: 8, padding: "7px 16px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                  Reset filters
                </button>
              </div>
            ) : showMap ? (
              /* Map view */
              <LeafletMap
                dark={dark}
                t={t}
                cars={filtered.map((c: ApiCar): CarPin => ({
                  id: c.id as any,
                  name: `${c.make} ${c.model}`,
                  spec: `${c.year} · ${c.fuel_type}`,
                  price: c.daily_rate ?? 0,
                  image: c.cover_image_url ?? "",
                  type: c.fuel_type,
                  fuel: c.fuel_type,
                  transmission: c.transmission,
                  rating: Number(c.rating_avg),
                  status: vehicleStatus(c),
                  listingType: filters.listingType !== "Any" ? filters.listingType : undefined,
                  salePrice: filters.listingType === "Buy" && c.sale_price ? `$${Number(c.sale_price).toLocaleString()}` : undefined,
                }))}
                center={{ lat: 5.5908, lng: -0.2043 }}
                zoom={13}
                onCarClick={id => { const car = filtered.find(c => c.id === String(id)); if (car) setSelected(car); }}
              />
            ) : (
              filtered.map((car: ApiCar) => {
                const status = vehicleStatus(car);
                const sc = STATUS_COLOR[status];
                const isActive = selected?.id === car.id;
                const label = carLabel(car);
                return (
                  <div
                    key={car.id}
                    onClick={() => setSelected(isActive ? null : car)}
                    style={{ background: t.cardBg, borderRadius: 14, border: `2px solid ${isActive ? t.accent : t.border}`, overflow: "hidden", cursor: "pointer", transition: "all 0.15s", transform: isActive ? "translateY(-2px)" : "translateY(0)", boxShadow: isActive ? `0 0 0 3px ${t.accent}22` : "none" }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.borderColor = t.accent + "66"; }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.borderColor = t.border; }}
                  >
                    <div style={{ position: "relative", height: 150, background: dark ? "#111122" : "#f0f0f6" }}>
                      {car.cover_image_url
                        ? <Image src={car.cover_image_url} alt={label} fill sizes="230px" style={{ objectFit: "cover" }} />
                        : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:t.textMuted }}>No image</div>
                      }
                      <div style={{ position: "absolute", bottom: 8, left: 8, background: sc + "ee", backdropFilter: "blur(4px)", borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", display: "inline-block", opacity: status === "In Transit" ? 1 : 0.6 }}/>
                        {status}
                      </div>
                      {filters.listingType !== "Any" && (
                        <div style={{ position: "absolute", top: 8, right: 8, background: t.accent, borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 700, color: t.accentFg }}>
                          {filters.listingType === "Rent" ? "For Rent" : filters.listingType === "Buy" ? "For Sale" : "For Swap"}
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "10px 12px 12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: t.textPri }}>{car.make} {car.model}</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: t.accent }}>{displayPrice(car, filters.listingType)}</div>
                      </div>
                      <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 8, lineHeight: 1.3 }}>{car.year} · {car.fuel_type} · {car.seats} seats</div>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
                        {[car.fuel_type, car.transmission, car.location_city].filter(Boolean).map(tag => (
                          <span key={tag} style={{ fontSize: 9, fontWeight: 600, color: t.textSec, background: t.bg, border: `1px solid ${t.border}`, borderRadius: 5, padding: "2px 7px" }}>{tag}</span>
                        ))}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11 }}>
                          <span>★</span>
                          <span style={{ fontWeight: 700, color: t.textPri }}>{Number(car.rating_avg).toFixed(1)}</span>
                          <span style={{ color: t.textMuted }}>({car.rating_count})</span>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); handleAction(car); }}
                          style={{ padding: "5px 12px", borderRadius: 7, border: "none", background: t.accent, color: t.accentFg, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
                        >
                          {actionLabel}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right slide-in detail panel ── */}
        <div style={{
          width: selected ? 380 : 0,
          flexShrink: 0,
          overflow: "hidden",
          borderLeft: selected ? `1px solid ${t.border}` : "none",
          background: t.cardBg,
          display: "flex",
          flexDirection: "column",
          transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
          position: "relative",
        }}>
          {selected && (
            <div style={{ width: 380, height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>

              {/* Close + header */}
              <div style={{ padding: "14px 16px 12px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: t.textPri }}>{selected.make} {selected.model}</div>
                  <div style={{ fontSize: 10, color: t.textMuted }}>{selected.fuel_type} · {selected.id.slice(0, 8).toUpperCase()}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => toggleFav(selected.id)}
                    style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${isFav(selected.id) ? "rgba(239,68,68,0.4)" : t.border}`, background: isFav(selected.id) ? "rgba(239,68,68,0.08)" : t.bg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    title={isFav(selected.id) ? "Remove from favourites" : "Save to favourites"}
                  >
                    {Ic.Heart(isFav(selected.id) ? "#EF4444" : t.textMuted, isFav(selected.id))}
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${t.border}`, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, color: t.textMuted, lineHeight: 1 }}
                  >
                    ×
                  </button>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: "auto" }}>
                {/* Car image */}
                <div style={{ position: "relative", height: 180, background: dark ? "#111122" : "#f0f0f6", flexShrink: 0 }}>
                  {selected.cover_image_url
                    ? <Image src={selected.cover_image_url} alt={`${selected.make} ${selected.model}`} fill sizes="380px" style={{ objectFit: "cover" }} />
                    : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:t.textMuted }}>No image</div>
                  }
                  {/* Status overlay */}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 14px 12px", background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{selected.make} {selected.model}</div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: STATUS_COLOR[selStatus ?? "Parked"] + "cc", backdropFilter: "blur(4px)", border: `1px solid ${STATUS_COLOR[selStatus ?? "Parked"]}55`, borderRadius: 20, padding: "4px 12px", display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", display: "inline-block" }}/>
                      {selStatus}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div style={{ padding: "14px 16px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: t.textPri }}>
                      {filters.listingType === "Buy"
                        ? (selected.sale_price ? `$${Number(selected.sale_price).toLocaleString()}` : "Contact us")
                        : (selected.daily_rate ? `$${selected.daily_rate}` : "Contact us")}
                      {filters.listingType !== "Buy" && selected.daily_rate && <span style={{ fontSize: 12, fontWeight: 500, color: t.textMuted }}>/day</span>}
                    </div>
                    {filters.listingType === "Buy" && <div style={{ fontSize: 11, color: t.textMuted }}>Negotiable</div>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 14 }}>★</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: t.textPri }}>{Number(selected.rating_avg).toFixed(1)}</span>
                    <span style={{ fontSize: 11, color: t.textMuted }}>({selected.rating_count})</span>
                  </div>
                </div>

                {/* Details grid */}
                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${t.border}` }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                      { l: "Year",          v: String(selected.year)          },
                      { l: "Fuel",          v: selected.fuel_type             },
                      { l: "Transmission",  v: selected.transmission          },
                      { l: "Seats",         v: selected.seats ? `${selected.seats}` : "—" },
                      { l: "Location",      v: selected.location_city ?? "—"  },
                      { l: "Status",        v: selStatus ?? "Parked"                     },
                    ].map(row => (
                      <div key={row.l} style={{ background: t.bg, borderRadius: 7, border: `1px solid ${t.border}`, padding: "8px 10px" }}>
                        <div style={{ fontSize: 9, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>{row.l}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: row.l === "Status" ? STATUS_COLOR[selStatus ?? "Parked"] : t.textPri }}>{row.v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Spec */}
                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${t.border}` }}>
                  <div style={{ fontSize: 10, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Specification</div>
                  <div style={{ fontSize: 12, color: t.textSec, lineHeight: 1.5 }}>
                    {[selected.year, selected.fuel_type, selected.transmission, selected.seats ? `${selected.seats} seats` : null, selected.location_city].filter(Boolean).join(" · ")}
                  </div>
                </div>

                {/* Mini map — live tracking location */}
                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${t.border}` }}>
                  <div style={{ fontSize: 10, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Live Location</div>
                  <div style={{ height: 200, borderRadius: 10, overflow: "hidden", border: `1px solid ${t.border}` }}>
                    <LeafletMap
                      dark={dark}
                      t={t}
                      singleCar={{
                        id: selected.id as any,
                        name: `${selected.make} ${selected.model}`,
                        spec: `${selected.year} · ${selected.fuel_type}`,
                        price: selected.daily_rate ?? 0,
                        image: selected.cover_image_url ?? "",
                        type: selected.fuel_type,
                        fuel: selected.fuel_type,
                        transmission: selected.transmission,
                        rating: Number(selected.rating_avg),
                        status: vehicleStatus(selected),
                      }}
                      zoom={15}
                    />
                  </div>
                  {selStatus === "In Transit" && (
                    <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#10B981" }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981", display: "inline-block", animation: "ping 1.5s infinite" }}/>
                      Vehicle is currently in transit
                    </div>
                  )}
                </div>

                {/* Action */}
                <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <button
                    onClick={() => {
                      if (filters.listingType === "Buy") router.push(`/customer/buy-car?carId=${selected.id}`);
                      else if (filters.listingType === "Swap") router.push(`/customer/swap-car?carId=${selected.id}`);
                      else router.push(`/customer/rent-car?carId=${selected.id}`);
                    }}
                    style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: t.accent, color: t.accentFg, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  >
                    {filters.listingType === "Buy" ? <><span style={{ display:"flex" }}>{Ic.Buy(t.accentFg)}</span> Buy This Car</>
                     : filters.listingType === "Swap" ? <><span style={{ display:"flex" }}>{Ic.Swap(t.accentFg)}</span> Request Swap</>
                     : <><span style={{ display:"flex" }}>{Ic.Booking(t.accentFg)}</span> Book This Car</>}
                  </button>
                  {filters.listingType === "Any" && (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => router.push(`/customer/buy-car?carId=${selected.id}`)}
                        style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${t.border}`, background: "none", color: t.textSec, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                        Buy
                      </button>
                      <button onClick={() => router.push(`/customer/swap-car?carId=${selected.id}`)}
                        style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${t.border}`, background: "none", color: t.textSec, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                        Swap
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes ping {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
        }
      `}</style>
    </CustomerShell>
  );
}
