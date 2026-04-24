"use client";
// src/components/layout/Sidebar.tsx

import { useState, useRef, useCallback, useEffect } from "react";

export interface Filters {
  search:       string;
  priceMin:     number;
  priceMax:     number;
  rentalType:   string;
  availableNow: boolean;
  listingType:  string;
  bodyTypes:    string[];
  fuelTypes:    string[];
  transmission: string;
}

// ── Price config per listing type ─────────────────────────────────────────────
const PRICE_CONFIG: Record<string, {
  max:        number;
  unit:       string;
  label:      string;
  defaultMin: number;
  defaultMax: number;
}> = {
  Any:  { max:500,    unit:"/day", label:"Daily Rate",          defaultMin:0, defaultMax:500    },
  Rent: { max:500,    unit:"/day", label:"Daily Rate",          defaultMin:0, defaultMax:500    },
  Buy:  { max:100000, unit:"",     label:"Purchase Price ($)",  defaultMin:0, defaultMax:100000 },
  Swap: { max:80000,  unit:"",     label:"Swap Value ($)",      defaultMin:0, defaultMax:80000  },
};

// ── Preset ranges per listing type ───────────────────────────────────────────
const PRICE_PRESETS: Record<string, { label:string; min:number; max:number }[]> = {
  Any:  [{ label:"Under $100", min:0,     max:100   }, { label:"$100–250",  min:100,   max:250    }, { label:"$250+",     min:250,   max:500    }],
  Rent: [{ label:"Under $100", min:0,     max:100   }, { label:"$100–250",  min:100,   max:250    }, { label:"$250+",     min:250,   max:500    }],
  Buy:  [{ label:"Under $20k", min:0,     max:20000 }, { label:"$20k–50k",  min:20000, max:50000  }, { label:"$50k+",     min:50000, max:100000 }],
  Swap: [{ label:"Under $15k", min:0,     max:15000 }, { label:"$15k–40k",  min:15000, max:40000  }, { label:"$40k+",     min:40000, max:80000  }],
};

const BODY_TYPES    = ["Sedan","Coupe","Pickup","Crossover","Wagon","Hatchback","Sport coupe","Van"];
const FUEL_TYPES    = ["Gasoline","Diesel","Electric","Other","Flex Fuel (E85)","Hybrid","Hydrogen"];
const TRANSMISSIONS = ["Any","Automatic","Manual"];
const RENTAL_TYPES  = ["Any","Per day"];
const LISTING_TYPES = ["Any","Rent","Buy","Swap"];
const BINS          = 28;

export const DEFAULT_FILTERS: Filters = {
  search:       "",
  priceMin:     0,
  priceMax:     500,
  rentalType:   "Any",
  availableNow: false,
  listingType:  "Any",
  bodyTypes:    [],
  fuelTypes:    [],
  transmission: "Any",
};

// ── Format price display ──────────────────────────────────────────────────────
function formatPrice(val: number, listingType: string): string {
  if (listingType === "Buy" || listingType === "Swap") {
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val}`;
  }
  return `$${val.toFixed(0)}`;
}

// ── Stable seeded histogram per listing type ──────────────────────────────────
function makeHistogram(listingType: string): number[] {
  const seeds: Record<string, number> = { Any:1, Rent:2, Buy:3, Swap:4 };
  const seed = seeds[listingType] ?? 1;
  const pseudoRand = (i: number) => {
    const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  return Array.from({ length: BINS }, (_, i) => {
    const center = listingType === "Buy"  ? BINS * 0.3
                 : listingType === "Swap" ? BINS * 0.35
                 : BINS * 0.4;
    const spread = BINS * 0.22;
    const v    = Math.exp(-0.5 * Math.pow((i - center) / spread, 2));
    const tail = i > BINS * 0.65;
    return tail ? v * 0.35 + pseudoRand(i) * 0.08 : v + pseudoRand(i) * 0.06;
  });
}

// ── SVG Chevrons ──────────────────────────────────────────────────────────────
function ChevronDown({ color, size = 14 }: { color:string; size?:number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M3 5L7 9L11 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function ChevronUp({ color, size = 14 }: { color:string; size?:number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M3 9L7 5L11 9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ── Collapsible Section ───────────────────────────────────────────────────────
function Section({ title, children, t, defaultOpen = true }: {
  title:string; children:React.ReactNode; t:any; defaultOpen?:boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom:`1px solid ${t.divider}` }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 0 9px", background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
      >
        <span style={{ fontSize:10, fontWeight:700, letterSpacing:1.2, textTransform:"uppercase", color:t.textMuted }}>
          {title}
        </span>
        {open ? <ChevronUp color={t.textMuted}/> : <ChevronDown color={t.textMuted}/>}
      </button>
      {open && <div style={{ paddingBottom:14 }}>{children}</div>}
    </div>
  );
}

// ── SVG Checkmark ─────────────────────────────────────────────────────────────
function Check() {
  return (
    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
      <path d="M1 3L3.5 5.5L8 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ── Dual Range Slider ─────────────────────────────────────────────────────────
function DualRange({ priceMin, priceMax, maxPrice, listingType, onChange, t }: {
  priceMin:    number;
  priceMax:    number;
  maxPrice:    number;
  listingType: string;
  onChange:    (min:number, max:number) => void;
  t:           any;
}) {
  const trackRef  = useRef<HTMLDivElement>(null);
  const dragging  = useRef<"min"|"max"|null>(null);
  const histogram = makeHistogram(listingType);
  const histMax   = Math.max(...histogram);

  const getVal = useCallback((clientX:number) => {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(pct * maxPrice);
  }, [maxPrice]);

  const onMouseDown = (thumb:"min"|"max") => (e:React.MouseEvent) => {
    e.preventDefault();
    dragging.current = thumb;
    const onMove = (ev:MouseEvent) => {
      const v = getVal(ev.clientX);
      if (dragging.current === "min") onChange(Math.min(v, priceMax - 1), priceMax);
      else                             onChange(priceMin, Math.max(v, priceMin + 1));
    };
    const onUp = () => {
      dragging.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
  };

  const onTouchStart = (thumb:"min"|"max") => (e:React.TouchEvent) => {
    e.preventDefault();
    dragging.current = thumb;
    const onMove = (ev:TouchEvent) => {
      const v = getVal(ev.touches[0].clientX);
      if (dragging.current === "min") onChange(Math.min(v, priceMax - 1), priceMax);
      else                             onChange(priceMin, Math.max(v, priceMin + 1));
    };
    const onEnd = () => {
      dragging.current = null;
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend",  onEnd);
    };
    window.addEventListener("touchmove", onMove, { passive:false });
    window.addEventListener("touchend",  onEnd);
  };

  const minPct = (priceMin / maxPrice) * 100;
  const maxPct = (priceMax / maxPrice) * 100;

  return (
    <div style={{ position:"relative", userSelect:"none" }}>

      {/* Histogram */}
      <div style={{ display:"flex", alignItems:"flex-end", gap:1.5, height:56 }}>
        {histogram.map((h, i) => {
          const binMin  = (i / BINS) * maxPrice;
          const binMax  = ((i + 1) / BINS) * maxPrice;
          const inRange = binMax >= priceMin && binMin <= priceMax;
          return (
            <div key={i} style={{ flex:1, display:"flex", alignItems:"flex-end", height:"100%" }}>
              <div style={{
                width:        "100%",
                height:       `${Math.max((h / histMax) * 100, 4)}%`,
                background:   inRange ? t.accent : t.border,
                opacity:      inRange ? 0.85 : 0.35,
                borderRadius: "2px 2px 0 0",
                transition:   "background 0.15s, opacity 0.15s",
              }}/>
            </div>
          );
        })}
      </div>

      {/* Track + thumbs */}
      <div ref={trackRef} style={{ position:"relative", height:28, cursor:"pointer" }}>
        <div style={{ position:"absolute", top:"50%", left:0, right:0, height:3, background:t.border, borderRadius:2, transform:"translateY(-50%)" }}/>
        <div style={{ position:"absolute", top:"50%", height:3, background:t.accent, borderRadius:2, transform:"translateY(-50%)", left:`${minPct}%`, right:`${100 - maxPct}%` }}/>

        {/* MIN thumb */}
        <div
          onMouseDown={onMouseDown("min")}
          onTouchStart={onTouchStart("min")}
          style={{ position:"absolute", top:"50%", left:`${minPct}%`, transform:"translate(-50%,-50%)", width:20, height:20, borderRadius:"50%", background:t.cardBg, border:`2.5px solid ${t.accent}`, cursor:"grab", zIndex:4, boxShadow:`0 0 0 3px ${t.accent}22, 0 1px 4px rgba(0,0,0,0.18)` }}
        />
        {/* MAX thumb */}
        <div
          onMouseDown={onMouseDown("max")}
          onTouchStart={onTouchStart("max")}
          style={{ position:"absolute", top:"50%", left:`${maxPct}%`, transform:"translate(-50%,-50%)", width:20, height:20, borderRadius:"50%", background:t.cardBg, border:`2.5px solid ${t.accent}`, cursor:"grab", zIndex:4, boxShadow:`0 0 0 3px ${t.accent}22, 0 1px 4px rgba(0,0,0,0.18)` }}
        />
      </div>

      {/* FROM / TO */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:6 }}>
        <div style={{ background:t.bg, borderRadius:8, border:`1px solid ${t.border}`, padding:"7px 12px" }}>
          <div style={{ fontSize:9, fontWeight:700, color:t.textMuted, letterSpacing:1, marginBottom:2 }}>FROM</div>
          <div style={{ fontSize:14, fontWeight:700, color:t.textPri }}>
            {formatPrice(priceMin, listingType)}
            {PRICE_CONFIG[listingType]?.unit && (
              <span style={{ fontSize:10, fontWeight:500, color:t.textMuted }}>{PRICE_CONFIG[listingType].unit}</span>
            )}
          </div>
        </div>
        <div style={{ background:t.bg, borderRadius:8, border:`1px solid ${t.border}`, padding:"7px 12px" }}>
          <div style={{ fontSize:9, fontWeight:700, color:t.textMuted, letterSpacing:1, marginBottom:2 }}>TO</div>
          <div style={{ fontSize:14, fontWeight:700, color:t.textPri }}>
            {formatPrice(priceMax, listingType)}
            {PRICE_CONFIG[listingType]?.unit && (
              <span style={{ fontSize:10, fontWeight:500, color:t.textMuted }}>{PRICE_CONFIG[listingType].unit}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
interface Props { f:Filters; sf:(v:Filters)=>void; t:any; }

export default function Sidebar({ f, sf, t }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  const toggle = (key:"bodyTypes"|"fuelTypes", val:string) => {
    const arr = f[key];
    sf({ ...f, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] });
  };

  // Reset price range when listing type changes
  const prevListingType = useRef(f.listingType);
  useEffect(() => {
    if (f.listingType !== prevListingType.current) {
      prevListingType.current = f.listingType;
      const cfg = PRICE_CONFIG[f.listingType] ?? PRICE_CONFIG["Any"];
      sf({ ...f, priceMin: cfg.defaultMin, priceMax: cfg.defaultMax });
    }
  }, [f.listingType]);

  const cfg      = PRICE_CONFIG[f.listingType] ?? PRICE_CONFIG["Any"];
  const presets  = PRICE_PRESETS[f.listingType] ?? PRICE_PRESETS["Any"];

  const hasActive =
    f.listingType !== "Any" || f.bodyTypes.length > 0 || f.fuelTypes.length > 0 ||
    f.transmission !== "Any" || f.priceMax < cfg.max || f.priceMin > 0 ||
    f.rentalType !== "Any" || f.availableNow;

  return (
    <div style={{
      width: collapsed ? 40 : 240,
      flexShrink:0,
      background:t.cardBg,
      borderRight:`1px solid ${t.border}`,
      display:"flex", flexDirection:"column",
      overflow:"hidden",
      fontFamily:"'DM Sans',sans-serif",
      transition:"width 0.22s cubic-bezier(0.4,0,0.2,1)",
      position:"relative",
    }}>

      {/* ── Toggle strip (always visible) ── */}
      <div style={{
        height:52,
        flexShrink:0,
        borderBottom:`1px solid ${t.border}`,
        display:"flex", alignItems:"center",
        justifyContent: collapsed ? "center" : "space-between",
        padding: collapsed ? 0 : "0 16px",
      }}>
        {!collapsed && (
          <span style={{ fontSize:14, fontWeight:700, color:t.textPri }}>Filter by</span>
        )}
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {!collapsed && hasActive && (
            <button onClick={() => sf(DEFAULT_FILTERS)}
              style={{ fontSize:10, color:t.textMuted, background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:3 }}>
              Reset
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 2L10 10M10 2L2 10" stroke={t.textMuted} strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? "Expand filters" : "Collapse filters"}
            style={{
              width:26, height:26,
              borderRadius:7,
              border:`1px solid ${t.border}`,
              background:t.bg,
              display:"flex", alignItems:"center", justifyContent:"center",
              cursor:"pointer",
              flexShrink:0,
              transition:"border-color 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = t.accent; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = t.border; }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              {collapsed
                ? <path d="M2 4L6.5 8.5L11 4" stroke={t.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" transform="rotate(-90 6.5 6.5)"/>
                : <path d="M2 4L6.5 8.5L11 4" stroke={t.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" transform="rotate(90 6.5 6.5)"/>
              }
            </svg>
          </button>
        </div>
      </div>

      {/* ── Filter content (hidden when collapsed) ── */}
      <div style={{
        flex:1, overflowY:"auto", overflowX:"hidden",
        padding: collapsed ? 0 : "0 14px 24px",
        opacity: collapsed ? 0 : 1,
        pointerEvents: collapsed ? "none" : "auto",
        transition:"opacity 0.15s ease",
      }}>

        {/* ── Listing Type ── */}
        <Section title="Listing Type" t={t}>
          <div style={{ display:"flex", gap:5 }}>
            {LISTING_TYPES.map(lt => {
              const on    = f.listingType === lt;
              const color = lt === "Rent" ? "#10B981"
                          : lt === "Buy"  ? "#4F46E5"
                          : lt === "Swap" ? "#F59E0B"
                          : t.accent;
              return (
                <button key={lt} onClick={() => sf({ ...f, listingType:lt })}
                  style={{ flex:1, padding:"7px 0", borderRadius:7, border:`1.5px solid ${on?color:t.border}`, background:on?color+"18":"transparent", color:on?color:t.textSec, fontSize:10, fontWeight:on?700:500, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.13s" }}>
                  {lt}
                </button>
              );
            })}
          </div>

          {f.listingType !== "Any" && (
            <div style={{ marginTop:8, padding:"6px 10px", borderRadius:7, background:t.bg, border:`1px solid ${t.border}` }}>
              <span style={{ fontSize:10, color:t.textMuted, lineHeight:1.5 }}>
                {f.listingType === "Rent" && "Price slider adjusts daily rental rate."}
                {f.listingType === "Buy"  && "Price slider adjusts full purchase value."}
                {f.listingType === "Swap" && "Price slider adjusts estimated swap value."}
              </span>
            </div>
          )}
        </Section>

        {/* ── Rental Type — hidden for Buy/Swap ── */}
        {(f.listingType === "Any" || f.listingType === "Rent") && (
          <Section title="Rental Type" t={t}>
            <div style={{ display:"flex", gap:5 }}>
              {RENTAL_TYPES.map(rt => {
                const on = f.rentalType === rt;
                return (
                  <button key={rt} onClick={() => sf({ ...f, rentalType:rt })}
                    style={{ flex:1, padding:"6px 0", borderRadius:7, border:`1.5px solid ${on?t.accent:t.border}`, background:on?t.accent+"14":"transparent", color:on?t.accent:t.textSec, fontSize:10, fontWeight:on?700:500, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.13s" }}>
                    {rt}
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {/* ── Availability ── */}
        <Section title="Availability" t={t}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontSize:12, color:t.textSec }}>Available cars only</span>
            <div onClick={() => sf({ ...f, availableNow:!f.availableNow })}
              style={{ width:38, height:20, borderRadius:10, background:f.availableNow?t.accent:t.border, cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
              <div style={{ position:"absolute", top:2, left:f.availableNow?20:2, width:16, height:16, borderRadius:"50%", background:"#fff", transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }}/>
            </div>
          </div>
        </Section>

        {/* ── Price Range ── */}
        <Section title={cfg.label} t={t}>
          <DualRange
            priceMin={f.priceMin}
            priceMax={f.priceMax}
            maxPrice={cfg.max}
            listingType={f.listingType}
            onChange={(mn, mx) => sf({ ...f, priceMin:mn, priceMax:mx })}
            t={t}
          />

          {/* ── Quick presets — stored in PRICE_PRESETS, no ternary .map() ── */}
          <div style={{ display:"flex", gap:5, marginTop:10, flexWrap:"wrap" }}>
            {presets.map(p => {
              const active = f.priceMin === p.min && f.priceMax === p.max;
              return (
                <button key={p.label} onClick={() => sf({ ...f, priceMin:p.min, priceMax:p.max })}
                  style={{ padding:"4px 9px", borderRadius:6, cursor:"pointer", fontSize:10, fontWeight:active?700:500, fontFamily:"'DM Sans',sans-serif", border:`1px solid ${active?t.accent:t.border}`, background:active?t.accent+"14":"transparent", color:active?t.accent:t.textSec, transition:"all 0.13s" }}>
                  {p.label}
                </button>
              );
            })}
          </div>
        </Section>

        {/* ── Body Type ── */}
        <Section title="Body Type" t={t}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 }}>
            {BODY_TYPES.map(bt => {
              const on = f.bodyTypes.includes(bt);
              return (
                <div key={bt} onClick={() => toggle("bodyTypes", bt)}
                  style={{ display:"flex", alignItems:"center", gap:7, padding:"5px 2px", cursor:"pointer" }}>
                  <div style={{ width:16, height:16, borderRadius:3, border:`1.5px solid ${on?t.accent:t.border}`, background:on?t.accent:"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.13s" }}>
                    {on && <Check/>}
                  </div>
                  <span style={{ fontSize:11, color:on?t.textPri:t.textSec, fontWeight:on?600:400, userSelect:"none" }}>{bt}</span>
                </div>
              );
            })}
          </div>
        </Section>

        {/* ── Transmission ── */}
        <Section title="Transmission" t={t}>
          <div style={{ display:"flex", gap:5 }}>
            {TRANSMISSIONS.map(tr => {
              const on = f.transmission === tr;
              return (
                <button key={tr} onClick={() => sf({ ...f, transmission:tr })}
                  style={{ flex:1, padding:"6px 0", borderRadius:7, border:`1.5px solid ${on?t.accent:t.border}`, background:on?t.accent+"14":"transparent", color:on?t.accent:t.textSec, fontSize:11, fontWeight:on?700:500, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.13s" }}>
                  {tr}
                </button>
              );
            })}
          </div>
        </Section>

        {/* ── Fuel Type ── */}
        <Section title="Fuel Type" t={t}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 }}>
            {FUEL_TYPES.map(ft => {
              const on = f.fuelTypes.includes(ft);
              return (
                <div key={ft} onClick={() => toggle("fuelTypes", ft)}
                  style={{ display:"flex", alignItems:"center", gap:7, padding:"5px 2px", cursor:"pointer" }}>
                  <div style={{ width:16, height:16, borderRadius:3, border:`1.5px solid ${on?t.accent:t.border}`, background:on?t.accent:"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.13s" }}>
                    {on && <Check/>}
                  </div>
                  <span style={{ fontSize:11, color:on?t.textPri:t.textSec, fontWeight:on?600:400, userSelect:"none", lineHeight:1.3 }}>{ft}</span>
                </div>
              );
            })}
          </div>
        </Section>

      </div>

      {/* ── Collapsed indicator dot (active filters) ── */}
      {collapsed && hasActive && (
        <div style={{ position:"absolute", top:14, right:6, width:7, height:7, borderRadius:"50%", background:t.accent }} />
      )}
    </div>
  );
}