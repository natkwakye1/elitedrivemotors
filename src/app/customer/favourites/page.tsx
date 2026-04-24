"use client";
// src/app/customer/favourites/page.tsx

import Image from "next/image";
import { useRouter } from "next/navigation";
import CustomerShell from "@/src/components/layout/Customershell";
import { useTheme } from "@/src/context/ThemeContext";
import { useFavourites } from "@/src/context/FavouritesContext";
import { useCars } from "@/src/hooks/useApi";
import { Ic } from "@/src/components/ui/Icons";

export default function FavouritesPage() {
  const router = useRouter();
  const { dark, t } = useTheme();
  const { favourites, toggle } = useFavourites();
  const { cars, loading } = useCars({ limit: 100 });

  const favCars = cars.filter(c => favourites.includes(c.id));

  return (
    <CustomerShell
      title="My Favourites"
      subtitle={favCars.length > 0 ? `${favCars.length} saved car${favCars.length !== 1 ? "s" : ""}` : undefined}
    >
      <div style={{ flex: 1, overflowY: "auto", padding: 24, background: t.bg }}>

        {/* Empty state */}
        {loading ? (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:400, color:t.textMuted, fontSize:13 }}>Loading…</div>
        ) : favCars.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 16 }}>
            {/* Heart icon */}
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: t.cardBg, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={t.textMuted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: t.textPri, marginBottom: 6 }}>No favourites yet</div>
              <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 24, maxWidth: 320 }}>
                Save cars you love by tapping the heart icon while browsing. They'll appear here for quick access.
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => router.push("/customer/cars")}
                style={{ padding: "10px 20px", borderRadius: 10, border: `1px solid ${t.border}`, background: "none", color: t.textSec, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = t.accent; (e.currentTarget as HTMLButtonElement).style.color = t.accent; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = t.border; (e.currentTarget as HTMLButtonElement).style.color = t.textSec; }}
              >
                Browse Cars
              </button>
              <button
                onClick={() => router.push("/customer/rent-car")}
                style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: t.accent, color: t.accentFg, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
              >
                Rent a Car
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Result count */}
            <div style={{ marginBottom: 20, fontSize: 13, fontWeight: 700, color: t.textPri }}>
              {favCars.length} <span style={{ fontWeight: 400, color: t.textMuted }}>saved vehicle{favCars.length !== 1 ? "s" : ""}</span>
            </div>

            {/* Car grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, alignContent: "start" }}>
              {favCars.map(car => (
                <div
                  key={car.id}
                  style={{ background: t.cardBg, borderRadius: 16, border: `1px solid ${t.border}`, overflow: "hidden", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.transform = "translateY(-2px)"; d.style.borderColor = t.accent + "66"; d.style.boxShadow = dark ? "0 10px 32px rgba(0,0,0,0.35)" : "0 10px 32px rgba(0,0,0,0.1)"; }}
                  onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.transform = "none"; d.style.borderColor = t.border; d.style.boxShadow = "none"; }}
                >
                  <div style={{ position: "relative", height: 200, background: dark ? "#111122" : "#f0f0f6", overflow: "hidden" }}>
                    {car.cover_image_url
                      ? <Image src={car.cover_image_url} alt={`${car.make} ${car.model}`} fill sizes="300px" style={{ objectFit: "cover" }} />
                      : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:t.textMuted }}>No image</div>
                    }
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.04) 55%)" }} />
                    <button
                      onClick={e => { e.stopPropagation(); toggle(car.id); }}
                      title="Remove from favourites"
                      style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: "50%", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    >
                      {Ic.Heart("#EF4444", true)}
                    </button>
                    <div style={{ position: "absolute", bottom: 14, left: 14, right: 14, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                          {car.sale_price ? `$${Number(car.sale_price).toLocaleString()}` : car.daily_rate ? `$${car.daily_rate}/day` : "—"}
                        </div>
                        {car.sale_price && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>Negotiable</div>}
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.85)", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 7, padding: "4px 9px" }}>
                        {car.fuel_type}
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: 16 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: t.textPri, marginBottom: 3 }}>{car.make} {car.model}</div>
                    <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 12, lineHeight: 1.5 }}>{car.year} · {car.transmission} · {car.seats} seats</div>
                    <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" as const }}>
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
                          onClick={() => router.push(`/customer/rent-car?carId=${car.id}`)}
                          style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${t.border}`, background: "none", color: t.textSec, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = t.accent; (e.currentTarget as HTMLButtonElement).style.color = t.accent; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = t.border; (e.currentTarget as HTMLButtonElement).style.color = t.textSec; }}
                        >
                          Rent
                        </button>
                        <button
                          onClick={() => router.push(`/customer/buy-car?carId=${car.id}`)}
                          style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: t.accent, color: t.accentFg, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 6 }}
                        >
                          <span style={{ display: "flex" }}>{Ic.Buy(t.accentFg)}</span>
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </CustomerShell>
  );
}
