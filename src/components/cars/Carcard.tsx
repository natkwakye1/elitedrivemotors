"use client";
// ─── src/components/cars/CarCard.tsx ─────────────────────────────────────────
// Individual vehicle card with image, distance badge, favourite heart,
// name, spec, price and star rating.
//
// Props:
//   car    – Car object
//   t      – Theme object
//   isDark – needed to pick star colour (gold in dark, black in light)

import { useState } from "react";
import { Car } from "@/src/types/car";
import { Theme } from "@/src/lib/theme";
import { Ic } from "@/src/components/ui/Icons";
import Stars from "@/src/components/ui/Stars";

interface CarCardProps {
  car: Car;
  t: Theme;
  isDark: boolean;
}

export default function CarCard({ car, t, isDark }: CarCardProps) {
  const [liked, setLiked] = useState(car.favourite ?? false);
  const [hov, setHov]     = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ background: hov ? t.cardBgHov : t.cardBg, borderRadius: 14, border: `1px solid ${hov ? t.borderHov : t.border}`, overflow: "hidden", cursor: "pointer", transition: "transform 0.2s,border-color 0.2s,box-shadow 0.2s", transform: hov ? "translateY(-2px)" : "translateY(0)", boxShadow: hov ? `0 8px 28px ${t.shadowHov}` : `0 2px 8px ${t.shadow}`, display: "flex", flexDirection: "column" }}
    >
      {/* Image area */}
      <div style={{ position: "relative", background: t.imgPlaceholder, overflow: "hidden", height: 170 }}>
        <img src={car.image} alt={car.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s", transform: hov ? "scale(1.04)" : "scale(1)", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: t.imgOverlay }} />

        {/* Distance badge */}
        <div style={{ position: "absolute", top: 10, left: 10, background: t.distBadge, backdropFilter: "blur(8px)", borderRadius: 20, padding: "4px 10px", display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ color: t.textMuted, display: "flex" }}>{Ic.Walk(t.textMuted)}</span>
          <span style={{ fontSize: 11, color: t.distText, fontWeight: 500 }}>{car.dist}</span>
          <span style={{ fontSize: 10, color: t.distTextSec }}>({car.walkMin} min)</span>
        </div>

        {/* Heart / favourite */}
        <button
          onClick={e => { e.stopPropagation(); setLiked(l => !l); }}
          style={{ position: "absolute", top: 10, right: 10, background: liked ? "rgba(239,68,68,0.15)" : t.likeHeart, backdropFilter: "blur(8px)", border: `1px solid ${liked ? "rgba(239,68,68,0.35)" : t.likeHeartBorder}`, borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}
        >
          {Ic.Heart(t.textMuted, liked)}
        </button>
      </div>

      {/* Info area */}
      <div style={{ padding: "12px 14px 14px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: t.textPri, marginBottom: 3, fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{car.name}</div>
            <div style={{ fontSize: 11, color: t.textMuted, lineHeight: 1.3 }}>{car.spec}</div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: t.textPri, fontFamily: "'DM Sans',sans-serif" }}>${car.price.toFixed(2)}</div>
            <div style={{ fontSize: 10, color: t.textMuted }}>/ hour</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Stars n={car.rating} isDark={isDark} />
          <span style={{ fontSize: 12, fontWeight: 700, color: t.textSec }}>{car.rating}</span>
          <span style={{ fontSize: 11, color: t.textMuted }}>({car.reviews})</span>
          <div style={{ marginLeft: "auto", fontSize: 10, background: t.tagBg, color: t.tagText, borderRadius: 5, padding: "2px 7px", border: `1px solid ${t.tagBorder}` }}>{car.type}</div>
        </div>
      </div>
    </div>
  );
}