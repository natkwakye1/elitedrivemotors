"use client";
// src/app/cars/page.tsx
import { useTheme } from "@/src/context/ThemeContext";

import { useState, useMemo } from "react";
import { useRouter }         from "next/navigation";
import { CARS }              from "@/src/lib/data/cars";
import { Filters, DEFAULT_FILTERS } from "@/src/types/car";
import Navbar     from "@/src/components/layout/Navbar";
import Sidebar    from "@/src/components/layout/Sidebar";
import CarsTopBar from "@/src/components/layout/CarsTopBar";
import CarCard    from "@/src/components/cars/Carcard";
import MapView    from "@/src/components/tracking/Mapview";

// ── Every car is available for Rent, Buy AND Swap ────────────────────────────
// listingType is a UI view filter only — it changes what ACTION button shows
// on the card, NOT which cars are visible. All cars are always shown.
// Only the real data filters (price, body, fuel, transmission, search) hide cars.

export default function CarsPage() {
  const router = useRouter();
  const { dark, setDark, t } = useTheme();
  const [activeNav, setActiveNav] = useState("Browse Cars");
  const [showMap, setShowMap]     = useState(false);
  const [filters, setFilters]     = useState<Filters>(DEFAULT_FILTERS);

  const filtered = useMemo(() => {
    return CARS.filter(c => {
      // price range
      if (c.price < filters.priceMin || c.price > filters.priceMax) return false;

      // body type
      if (filters.bodyTypes.length > 0 && !filters.bodyTypes.includes(c.type)) return false;

      // fuel type
      if (filters.fuelTypes.length > 0) {
        const carFuel = c.fuel.toLowerCase();
        const match   = filters.fuelTypes.some(ft => ft.toLowerCase() === carFuel);
        if (!match) return false;
      }

      // transmission
      if (filters.transmission !== "Any" && c.transmission !== filters.transmission) return false;

      // search
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (![c.name, c.spec, c.type, c.fuel].some(s => s.toLowerCase().includes(q))) return false;
      }

      // ── listingType does NOT filter out cars ──────────────────────────────
      // All cars support Rent / Buy / Swap. The selected listingType only
      // affects the label/badge shown on top — every car still shows.

      return true;
    });
  }, [filters]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${t.bg}; transition: background 0.25s; }
        ::-webkit-scrollbar       { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${t.scrollThumb}; border-radius: 4px; }
        input[type=range] {
          -webkit-appearance: none;
          width: 100%; height: 20px;
          background: transparent;
          outline: none; cursor: pointer;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: transparent;
          cursor: pointer;
        }
        input[type=range]::-moz-range-thumb {
          width: 20px; height: 20px;
          border-radius: 50%;
          background: transparent;
          cursor: pointer;
          border: none;
        }
        select { outline: none; }
        input::placeholder { color: ${t.inputText}; }
      `}</style>

      <div style={{ display:"flex", height:"100vh", fontFamily:"'DM Sans',sans-serif", background:t.bg, overflow:"hidden", transition:"background 0.25s" }}>

        <Navbar active={activeNav} setActive={setActiveNav} t={t} />
        <Sidebar f={filters} sf={setFilters} t={t} />

        <main style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>

          <CarsTopBar
            count={filtered.length}
            search={filters.search}
            setSearch={v => setFilters(f => ({ ...f, search:v }))}
            showMap={showMap}
            setShowMap={setShowMap}
            dark={dark}
            setDark={setDark}
            t={t}
          />

          {/* active filter badges */}
          {(filters.listingType !== "Any" || filters.availableNow || filters.rentalType !== "Any") && (
            <div style={{ padding:"7px 16px", borderBottom:`1px solid ${t.border}`, background:t.cardBg, display:"flex", gap:7, alignItems:"center", flexShrink:0 }}>
              {filters.listingType !== "Any" && (
                <span style={{ fontSize:11, fontWeight:700, color:t.accent, background:t.accent+"14", border:`1px solid ${t.accent}30`, borderRadius:20, padding:"3px 10px" }}>
                  {filters.listingType === "Rent" ? "For Rent" : filters.listingType === "Buy" ? "For Sale" : "For Swap"}
                </span>
              )}
              {filters.rentalType !== "Any" && (
                <span style={{ fontSize:11, fontWeight:600, color:t.textSec, background:t.bg, border:`1px solid ${t.border}`, borderRadius:20, padding:"3px 10px" }}>
                  {filters.rentalType}
                </span>
              )}
              {filters.availableNow && (
                <span style={{ fontSize:11, fontWeight:600, color:"#10B981", background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.25)", borderRadius:20, padding:"3px 10px" }}>
                  Available Now
                </span>
              )}
              {/* result count reminder */}
              <span style={{ marginLeft:"auto", fontSize:11, color:t.textMuted }}>
                {filtered.length} car{filtered.length !== 1 ? "s" : ""} shown
              </span>
            </div>
          )}

          <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
            {/* car grid */}
            <div style={{
              width: showMap ? 460 : "100%", flexShrink:0,
              overflowY:"auto", padding:"20px",
              display:"grid",
              gridTemplateColumns: showMap ? "1fr" : "repeat(auto-fill,minmax(270px,1fr))",
              gap:14, alignContent:"start",
              transition:"width 0.3s", background:t.bg,
            }}>
              {filtered.length === 0 ? (
                <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"60px 20px" }}>
                  <div style={{ fontSize:14, fontWeight:600, color:t.textSec, marginBottom:8 }}>
                    No cars match your filters
                  </div>
                  <div style={{ fontSize:12, color:t.textMuted, marginBottom:16 }}>
                    Try adjusting the price range or clearing some filters
                  </div>
                  <button onClick={()=>setFilters(DEFAULT_FILTERS)}
                    style={{ fontSize:12, color:t.accent, background:"none", border:`1px solid ${t.accent}`, borderRadius:8, padding:"7px 16px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                    Reset all filters
                  </button>
                </div>
              ) : (
                filtered.map(car => (
                  <div key={car.id}
                    onClick={() => {
                      // route based on listing type
                      if (filters.listingType === "Buy")  router.push(`/buy`);
                      else if (filters.listingType === "Swap") router.push(`/swap`);
                      else router.push(`/cars/${car.id}`);
                    }}
                    style={{ cursor:"pointer" }}
                  >
                    <CarCard car={car} t={t} isDark={dark} />
                  </div>
                ))
              )}
            </div>

            {showMap && <MapView cars={filtered} t={t} dark={dark} />}
          </div>
        </main>
      </div>
    </>
  );
}