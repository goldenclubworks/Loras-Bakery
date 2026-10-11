"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * Setzt einmalig `data-in`, sobald das Element ins Bild kommt. Alles Weitere (Schreiben, Zeichnen, Aufdecken)
 * ist reines CSS, siehe .write / .sketch / .clip-up / .pop in globals.css.
 */
export default function InView({
  children,
  className,
  style,
  as = "div",
  threshold = 0.25,
  margin = "0px 0px -8% 0px",
  ...rest
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "span" | "p" | "figure";
  threshold?: number;
  margin?: string;
  [k: string]: unknown;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const Tag = as as "div";
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.setAttribute("data-in", "");
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.setAttribute("data-in", "");
          io.disconnect();
        }
      },
      { threshold, rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, margin]);
  return (
    <Tag ref={ref} className={className} style={style} {...rest}>
      {children}
    </Tag>
  );
}
