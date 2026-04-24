// ─── src/components/ui/Stars.tsx ─────────────────────────────────────────────
// Reusable star rating display.
// Props:
//   n      – rating value (0–5)
//   isDark – true → gold stars, false → black stars

interface StarsProps {
  n: number;
  isDark: boolean;
}

export default function Stars({ n, isDark }: StarsProps) {
  const starColor = isDark ? "#F5A623" : "#111111";
  return (
    <span style={{ display: "inline-flex", gap: 1.5 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="10" height="10" viewBox="0 0 12 12"
          fill={i <= Math.round(n) ? starColor : "none"}
          stroke={starColor} strokeWidth="1.2">
          <polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9,11 6,9.5 3,11 3.5,7.5 1,5 4.5,4.5" />
        </svg>
      ))}
    </span>
  );
}