"use client";
// src/components/ui/Skeleton.tsx
// Shimmer car-card skeletons for loading states.

import { useTheme } from "@/src/context/ThemeContext";

function SkeletonBlock({ w, h, r = 6, mb = 0 }: { w: string | number; h: number; r?: number; mb?: number }) {
  const { dark } = useTheme();
  const base  = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const shine = dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)";
  return (
    <div style={{
      width: typeof w === "number" ? w : w,
      height: h,
      borderRadius: r,
      marginBottom: mb,
      background: `linear-gradient(90deg, ${base} 25%, ${shine} 50%, ${base} 75%)`,
      backgroundSize: "200% 100%",
      animation: "skeletonShimmer 1.4s ease infinite",
      flexShrink: 0,
    }}/>
  );
}

function SkeletonCard() {
  const { t, dark } = useTheme();
  return (
    <div style={{
      background: t.cardBg,
      borderRadius: 14,
      border: `1px solid ${t.border}`,
      overflow: "hidden",
    }}>
      {/* Image area */}
      <div style={{ height: 160, background: dark ? "#111122" : "#f0f0f6" }}>
        <SkeletonBlock w="100%" h={160} r={0} />
      </div>
      {/* Body */}
      <div style={{ padding: "12px 14px 14px" }}>
        <SkeletonBlock w="65%" h={14} r={5} mb={8} />
        <SkeletonBlock w="45%" h={10} r={4} mb={12} />
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          <SkeletonBlock w={52} h={18} r={5} />
          <SkeletonBlock w={60} h={18} r={5} />
          <SkeletonBlock w={70} h={18} r={5} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <SkeletonBlock w={60} h={10} r={4} />
          <SkeletonBlock w={48} h={10} r={4} />
        </div>
      </div>
    </div>
  );
}

interface CarGridSkeletonProps {
  count?: number;
}

export default function CarGridSkeleton({ count = 8 }: CarGridSkeletonProps) {
  return (
    <>
      <style>{`
        @keyframes skeletonShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: 14,
        alignContent: "start",
      }}>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </>
  );
}
