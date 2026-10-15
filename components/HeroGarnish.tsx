"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { loadGsap } from "@/lib/gsap";

type Layer = {
  src: string;
  w: number;
  h: number;
  /** Lage und Breite relativ zur Bühne (Prozent), eine Variante für Desktop, eine für Mobil */
  d: { x: string; y: string; w: string; rot: number; z: number };
  m: { x: string; y: string; w: string; rot: number; z: number };
  /** Scroll-Weg: wie weit (px) und wie stark gedreht (Grad) die Lage beim Scrollen driftet */
  drift: number;
  twist: number;
  sway: number;
  delay: number;
};

/** Loras eigene Ausschnitte: Spitzenband mit Früchten, Satinband links und rechts. */
const layers: Layer[] = [
  {
    // Satinband rechts: rahmt den Bogen von oben rechts
    src: "/hero/lace-ribbon-r.webp", w: 500, h: 1176, drift: 120, twist: 5, sway: 14, delay: 0.5,
    d: { x: "right:-15%", y: "top:-2%", w: "33%", rot: 0, z: 18 },
    m: { x: "right:-21%", y: "bottom:-24%", w: "40%", rot: 0, z: 18 },
  },
  {
    // Spitzenschwung mit Erdbeere, Himbeere, Heidelbeere: liegt vorn links unten
    src: "/hero/lace-swirl.webp", w: 660, h: 811, drift: -90, twist: -6, sway: -10, delay: 0.7,
    d: { x: "left:-40%", y: "bottom:-24%", w: "62%", rot: -6, z: 12 },
    m: { x: "left:-26%", y: "bottom:-27%", w: "58%", rot: -8, z: 12 },
  },
  {
    // Satinband links: schlingt sich oben links um den Bogen
    src: "/hero/lace-ribbon-l.webp", w: 470, h: 1571, drift: 70, twist: -4, sway: -8, delay: 0.9,
    d: { x: "left:-17%", y: "top:-12%", w: "25%", rot: 10, z: 3 },
    m: { x: "left:-22%", y: "top:-12%", w: "34%", rot: 0, z: 18 },
  },
];

/** Zarte Zeichnungen aus dem Moodboard: Herz an der Polaroid-Ecke, Brösel, Dampfschwung. */
export function Heart({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 40 36" aria-hidden className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 31 C 8 22 4 14 8 8 C 12 3 19 5 20 11 C 22 4 30 3 33 9 C 36 16 30 24 20 31 Z" />
      <path d="M6 30 C 14 34 26 35 36 30" />
    </svg>
  );
}

/**
 * Spitzen-, Band- und Früchte-Ausschnitte rund um die Hero-Bühne. Jede Lage driftet beim Scrollen mit eigenem Weg, leichter Drehung
 * und seitlichem Pendeln; so wirkt es, als schwebe das Spitzentuch um die Torte. Ohne Bewegung (reduzierte Bewegung) bleibt alles stehen.
 */
export default function HeroGarnish() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let dead = false;
    let undo: (() => void) | undefined;
    loadGsap().then(({ gsap }) => {
      if (dead) return;
      const k = window.matchMedia("(min-width: 1024px)").matches ? 1 : 0.55;
      const ctx = gsap.context(() => {
        el.querySelectorAll<HTMLElement>("[data-layer]").forEach((node) => {
          const l = layers[Number(node.dataset.layer)];
          gsap.fromTo(
            node,
            { y: -l.drift * k * 0.5, x: -l.sway * k * 0.5, rotate: -l.twist * 0.5 },
            {
              y: l.drift * k * 0.5, x: l.sway * k * 0.5, rotate: l.twist * 0.5, ease: "none",
              scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.9 },
            },
          );
        });
      }, el);
      undo = () => ctx.revert();
    });
    return () => {
      dead = true;
      undo?.();
    };
  }, []);

  return (
    <div ref={root} aria-hidden className="hero-garnish pointer-events-none absolute inset-0">
      {layers.map((l, i) => (
        <div
          key={l.src}
          data-layer={i}
          className="hero-layer absolute will-change-transform"
          style={{ ...pos(l, "d"), ...pos(l, "m") } as CSSProperties}
        >
          <div className="fade-in" style={{ "--d": `${l.delay}s` } as CSSProperties}>
            <div className="hero-layer-in">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.src} alt="" width={l.w} height={l.h} loading="eager" decoding="async" draggable={false} className="h-auto w-full select-none" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function pos(l: Layer, kind: "d" | "m") {
  const v = l[kind];
  const [side, off] = v.x.split(":");
  const [vert, voff] = v.y.split(":");
  const p = kind === "d" ? "--d" : "--m";
  return { [`${p}-${side}`]: off, [`${p}-${vert}`]: voff, [`${p}-w`]: v.w, [`${p}-rot`]: `${v.rot}deg`, [`${p}-z`]: v.z } as Record<string, string | number>;
}
