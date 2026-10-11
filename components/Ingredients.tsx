"use client";

import { useEffect, useRef } from "react";
import { loadGsap } from "@/lib/gsap";

import { ingredientSize, type IngredientName } from "@/lib/ingredients";

export type Ingredient = {
  /** Dateiname in /public/ingredients ohne Endung */
  src: IngredientName;
  /** Breite in px (Desktop); auf Mobil skaliert via CSS */
  w: number;
  /** Position in % des Containers */
  x: number;
  y: number;
  /** Tiefe: 0.3 = weit hinten (langsam), 1.5 = nah an der Kamera (schnell). Vorzeichen = Richtung. */
  depth?: number;
  rot?: number;
  /** zusätzliche Drehung über den Scroll-Weg */
  spin?: number;
  /** weiche Unschärfe für Elemente "vor" der Schärfeebene */
  blur?: number;
  /** fällt von oben ein und bleibt liegen, statt zu driften */
  land?: boolean;
  /** auf kleinen Bildschirmen ausblenden */
  hideSm?: boolean;
};

/**
 * Freigestellte Zutaten aus Loras echten Fotos. Jede driftet beim Scrollen mit eigener Tiefe und Drehung;
 * "land"-Elemente fallen von oben und bleiben liegen. Nur transform wird animiert.
 */
export default function Ingredients({ items, amount = 90, className = "", style }: { items: Ingredient[]; amount?: number; className?: string; style?: React.CSSProperties }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const small = window.innerWidth < 1024;
    let dead = false;
    let undo: (() => void) | undefined;
    loadGsap().then(({ gsap }) => {
      if (dead) return;
      const ctx = gsap.context(() => {
        el.querySelectorAll<HTMLElement>("[data-ing]").forEach((node, i) => {
          const it = items[i];
          if (small && it.hideSm) return;
          const depth = it.depth ?? 1;
          const rot = it.rot ?? 0;
          if (it.land) {
            gsap.fromTo(
              node,
              { y: -amount * 4.2 * Math.abs(depth), rotate: rot - 55 * Math.sign(depth || 1), opacity: 0 },
              {
                y: 0,
                rotate: rot,
                opacity: 1,
                ease: "power2.out",
                scrollTrigger: { trigger: el, start: "top 85%", end: "center 55%", scrub: 0.7 },
              },
            );
          } else {
            gsap.fromTo(
              node,
              { y: amount * depth, rotate: rot - (it.spin ?? 14) / 2 },
              {
                y: -amount * depth,
                rotate: rot + (it.spin ?? 14) / 2,
                ease: "none",
                scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.8 },
              },
            );
          }
        });
      }, el);
      undo = () => ctx.revert();
    });
    return () => {
      dead = true;
      undo?.();
    };
  }, [items, amount]);

  return (
    <div ref={root} aria-hidden className={`pointer-events-none absolute inset-0 z-20 ${className}`} style={style}>
      {items.map((it) => {
        const [dw, dh] = ingredientSize[it.src as keyof typeof ingredientSize] ?? [1, 1];
        // gedrehtes Element: Halbdiagonale als Sicherheitsabstand zum Rand
        const m = (0.5 * (Math.sqrt(1 + (dh / dw) ** 2) - 1) + 0.08).toFixed(2);
        const w = `clamp(${Math.round(it.w * 0.55)}px, ${(it.w / 14.4).toFixed(2)}vw, ${it.w}px)`;
        return (
          <div
            key={`${it.src}-${it.x}-${it.y}`}
            data-ing
            className={`absolute will-change-transform ${it.hideSm ? "hidden lg:block" : ""}`}
            style={{
              ["--w" as string]: w,
              width: "var(--w)",
              // nie über den Rand hinaus: so wird nichts abgeschnitten
              left: `max(calc(var(--w) * ${m}), min(${it.x}%, calc(100% - var(--w) * ${(1 + Number(m)).toFixed(2)})))`,
              top: `${it.y}%`,
              transform: `rotate(${it.rot ?? 0}deg)`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/ingredients/${it.src}.webp`}
              alt=""
              width={dw}
              height={dh}
              loading="lazy"
              decoding="async"
              className="h-auto w-full select-none"
              style={{ backfaceVisibility: "hidden", ...(it.blur ? { filter: `blur(${it.blur}px)` } : {}) }}
              draggable={false}
            />
          </div>
        );
      })}
    </div>
  );
}
