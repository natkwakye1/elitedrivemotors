"use client";
// src/components/ui/Reveal.tsx
// Scroll-triggered reveal — adds .edm-visible when element enters viewport.

import { useEffect, useRef } from "react";

interface Props {
  children: React.ReactNode;
  delay?: number;
  variant?: "up" | "left" | "right" | "scale";
  className?: string;
  style?: React.CSSProperties;
  threshold?: number;
  tag?: keyof JSX.IntrinsicElements;
}

export default function Reveal({
  children, delay = 0, variant = "up",
  className = "", style, threshold = 0.1,
  tag: Tag = "div",
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("edm-visible");
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  const baseClass =
    variant === "scale" ? "edm-reveal-scale" :
    variant === "left"  ? "edm-reveal-left"  :
    variant === "right" ? "edm-reveal-right" :
    "edm-reveal";

  return (
    <Tag
      ref={ref as any}
      className={`${baseClass} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </Tag>
  );
}
