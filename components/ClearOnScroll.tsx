"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * Große Schrift, die beim Hineinscrollen von leicht transparent und weich zu klar und scharf wird.
 * Scroll-gekoppelt (kein Hijack), nur opacity und blur, bei reduzierter Bewegung sofort klar.
 */
export default function ClearOnScroll({ children, className = "", style, from = 0.8, blurPx = 3 }: { children: ReactNode; className?: string; style?: CSSProperties; from?: number; blurPx?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 wenn die Oberkante am unteren Rand erscheint, 1 wenn sie bei 45 % der Fensterhöhe ist
      const p = Math.max(0, Math.min(1, (vh - r.top) / (vh * 0.55)));
      const e = p * p * (3 - 2 * p);
      el.style.opacity = String(from + (1 - from) * e);
      el.style.filter = e >= 0.999 ? "none" : `blur(${(blurPx * (1 - e)).toFixed(2)}px)`;
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on, { passive: true });
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); if (raf) cancelAnimationFrame(raf); };
  }, [from, blurPx]);
  return <div ref={ref} className={className} style={style}>{children}</div>;
}
