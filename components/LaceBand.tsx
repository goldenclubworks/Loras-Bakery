"use client";

import { useEffect, useRef, useState } from "react";
import { laceTile } from "@/lib/lace";

/**
 * Spitzenband als Übergang zwischen zwei Abschnitten. Loras echtes Spitzenband (nahtlos gespiegelt verlängert, siehe
 * scripts/build_lace.mjs) liegt auf der Naht: oben auf dem hellen Abschnitt, unten auf dem dunklen. Beim Scrollen zieht es
 * langsam seitlich durch das Bild (die Kachel wiederholt sich nahtlos). Das Bild wird erst kurz vor dem Sichtbereich
 * geladen, außer mit `eager` (im ersten Bildschirm).
 */
export default function LaceBand({ className = "", eager = false }: { className?: string; eager?: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(eager);

  useEffect(() => {
    const w = wrap.current;
    if (!w || eager) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setReady(true), io.disconnect()), { rootMargin: "1400px 0px" });
    io.observe(w);
    return () => io.disconnect();
  }, [eager]);

  useEffect(() => {
    const t = track.current;
    const w = wrap.current;
    if (!t || !w) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let tile = 1;
    const measure = () => {
      tile = (w.offsetHeight * laceTile.w) / laceTile.h;
    };
    const update = () => {
      raf = 0;
      const r = w.getBoundingClientRect();
      // Lage des Bandes im Fenster koppeln, damit es nur bewegt, wenn man es sieht
      const off = (r.top - window.innerHeight) * 0.22;
      const x = ((off % tile) + tile) % tile;
      t.style.transform = `translate3d(${(-x).toFixed(1)}px,0,0)`;
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      on();
    };
    measure();
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrap} aria-hidden className={`lace-band pointer-events-none absolute inset-x-0 top-0 z-10 overflow-x-clip ${className}`}>
      <div ref={track} className="lace-band-track" data-ready={ready ? "" : undefined} />
    </div>
  );
}
