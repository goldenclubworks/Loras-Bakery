"use client";

import { useEffect, useRef } from "react";

/** Fades/rises children into view once. Pure CSS transition, one shared IntersectionObserver per element. */
export default function Reveal({
  children,
  delay = 0,
  y = 28,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "p" | "li" | "h2" | "h3" | "span";
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "none";
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const style: React.CSSProperties = {
    opacity: 0,
    transform: `translateY(${y}px)`,
    transition: `opacity .9s var(--ease-out) ${delay}s, transform 1.1s var(--ease-out) ${delay}s`,
  };
  const r = ref as React.RefObject<never>;
  switch (Tag) {
    case "li":
      return <li ref={r} className={className} style={style}>{children}</li>;
    case "h2":
      return <h2 ref={r} className={className} style={style}>{children}</h2>;
    case "h3":
      return <h3 ref={r} className={className} style={style}>{children}</h3>;
    case "p":
      return <p ref={r} className={className} style={style}>{children}</p>;
    case "span":
      return <span ref={r} className={className} style={style}>{children}</span>;
    default:
      return <div ref={r} className={className} style={style}>{children}</div>;
  }
}
