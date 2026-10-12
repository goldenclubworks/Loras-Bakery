"use client";

import { useEffect, useRef, useState } from "react";
import { loadGsap } from "@/lib/gsap";
import { ingredientSize, type IngredientName } from "@/lib/ingredients";

export type Ingredient = {
  /** Dateiname in /public/ingredients ohne Endung */
  src: IngredientName;
  /** Breite in px (Desktop); wird auf schmaleren Fenstern bis auf 55 % verkleinert */
  w: number;
  /** Position in % des Containers */
  x: number;
  y: number;
  /** Tiefe: 0.3 = weit hinten (langsam), 1.5 = nah an der Kamera (schnell). */
  depth?: number;
  rot?: number;
  /** zusätzliche Drehung über den Scroll-Weg */
  spin?: number;
  /** weiche Unschärfe für Elemente "vor" der Schärfeebene */
  blur?: number;
  /** fällt von oben ein und bleibt liegen, statt zu driften */
  land?: boolean;
  /** nur Mobil: Deckkraft im Ruhezustand (0–1), Standard 0.62 */
  o?: number;
  /** nur Mobil: ab 768 px (Tablet) ausblenden, wenn sich dort das Layout ändert */
  hideMd?: boolean;
};

/**
 * Freigestellte Zutaten (Loras eigene, saubere Ausschnitte). Keine Schatten, keine Kanten: das Bild wird unverändert gezeigt.
 *
 * Desktop (ab 1024 px): jede Zutat driftet beim Scrollen mit eigener Tiefe und Drehung, "land"-Elemente fallen von oben
 * und bleiben liegen, über dem Inhalt.
 *
 * Mobil (darunter): die `mobile`-Liste ist eigens platziert, klein und leicht transparent. Jede Zutat gleitet beim Scrollen
 * vom nächsten Seitenrand herein, ruht kurz im Rand und verschwindet zur anderen Seite wieder. Sie liegt hinter dem Text
 * (Abschnitt braucht `isolate`), so wird nie etwas verdeckt.
 */
export default function Ingredients({
  items,
  mobile = [],
  amount = 90,
  className = "",
  style,
  above = false,
  container = false,
  eager = false,
}: {
  items: Ingredient[];
  mobile?: Ingredient[];
  amount?: number;
  className?: string;
  style?: React.CSSProperties;
  /** auch mobil über dem Inhalt (z. B. auf einem Spitzenband), sonst liegt die Ebene mobil hinter dem Text */
  above?: boolean;
  /** x bezieht sich auf die Inhaltsbreite (max. 1500 px, mittig) statt auf die volle Breite: Früchte bleiben so an Bildern im Raster haften, auch auf sehr breiten Bildschirmen */
  container?: boolean;
  /** Bilder sofort laden (erster Bildschirm); sonst erst, wenn der Abschnitt bis auf ca. 1000 px herangescrollt ist */
  eager?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(eager);

  // Dekorative Früchte laden erst kurz vor dem Sichtbereich, damit sie beim Start nicht mit wichtigen Dateien um Bandbreite konkurrieren
  useEffect(() => {
    const el = root.current;
    if (!el || near) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setNear(true), io.disconnect()), { rootMargin: "1000px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    let dead = false;
    let undo: (() => void) | undefined;
    loadGsap().then(({ gsap }) => {
      if (dead) return;
      const ctx = gsap.context(() => {
        const nodes = el.querySelectorAll<HTMLElement>(isDesktop ? "[data-ing='d']" : "[data-ing='m']");
        nodes.forEach((node) => {
          const idx = Number(node.dataset.i);
          const it = (isDesktop ? items : mobile)[idx];
          if (!it) return;
          const depth = it.depth ?? 1;
          const rot = it.rot ?? 0;
          if (!isDesktop) {
            // Mobil: gleitet beim Hereinscrollen vom Seitenrand herein, steht, und gleitet beim Hinausscrollen zur Seite weg.
            // Start und Ende kommen aus der Lage im Abschnitt (nicht aus der Animation selbst), deshalb stehen Elemente, die
            // schon beim Laden im Bild sind, sofort da und beginnen erst nach etwas Scrollen auszublenden.
            const dir = it.x > 50 ? 1 : -1;
            const o = it.o ?? 0.62;
            const vh = () => window.innerHeight;
            const top = () => {
              const r = el.getBoundingClientRect();
              return r.top + window.scrollY + (it.y / 100) * r.height;
            };
            const bottom = () => top() + node.offsetHeight;
            gsap.set(node, { opacity: o });
            if (top() > vh() * 0.92) {
              gsap.fromTo(
                node,
                { x: dir * 64, y: 26, opacity: 0, rotate: rot + dir * 26 },
                {
                  x: 0, y: 0, opacity: o, rotate: rot, ease: "power2.out",
                  scrollTrigger: { trigger: node, start: () => top() - vh() * 1.04, end: () => top() - vh() * 0.7, scrub: 0.6, invalidateOnRefresh: true },
                },
              );
            }
            gsap.fromTo(
              node,
              { x: 0, opacity: o, rotate: rot },
              {
                x: dir * 44, y: -18 * depth, opacity: 0, rotate: rot - dir * 20, ease: "power1.in", immediateRender: false,
                scrollTrigger: { trigger: node, start: () => Math.max(bottom() - vh() * 0.3, 70), end: () => Math.max(bottom() + vh() * 0.04, 190), scrub: 0.6, invalidateOnRefresh: true },
              },
            );
            return;
          }
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
  }, [items, mobile, amount]);

  const render = (list: Ingredient[], kind: "d" | "m") =>
    list.map((it, i) => {
      const [dw, dh] = ingredientSize[it.src];
      // gedrehtes Element: Halbdiagonale als Sicherheitsabstand zum Rand
      const m = (0.5 * (Math.sqrt(1 + (dh / dw) ** 2) - 1) + 0.08).toFixed(2);
      const base = kind === "d" && container ? `calc(50% - min(100%, 1500px) / 2 + min(100%, 1500px) * ${(it.x / 100).toFixed(4)})` : `${it.x}%`;
      const w = kind === "d" ? `clamp(${Math.round(it.w * 0.55)}px, ${(it.w / 14.4).toFixed(2)}vw, ${it.w}px)` : `${it.w}px`;
      return (
        <div
          key={`${kind}-${it.src}-${it.x}-${it.y}`}
          data-ing={kind}
          data-i={i}
          className={`absolute will-change-transform ${kind === "d" ? "hidden lg:block" : it.hideMd ? "md:hidden" : "lg:hidden"}`}
          style={{
            ["--w" as string]: w,
            width: "var(--w)",
            // nie über den Rand hinaus: so wird nichts abgeschnitten
            left: `max(calc(var(--w) * ${m}), min(${base}, calc(100% - var(--w) * ${(1 + Number(m)).toFixed(2)})))`,
            top: `${it.y}%`,
            transform: `rotate(${it.rot ?? 0}deg)`,
            ...(kind === "m" ? { opacity: it.o ?? 0.62 } : {}),
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={near ? `/ingredients/${it.src}.webp` : undefined}
            alt=""
            width={dw}
            height={dh}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            className="h-auto w-full select-none"
            style={{ backfaceVisibility: "hidden", ...(it.blur ? { filter: `blur(${it.blur}px)` } : {}) }}
            draggable={false}
          />
        </div>
      );
    });

  return (
    <div ref={root} aria-hidden className={`ing-layer pointer-events-none absolute inset-0 z-20 overflow-x-clip ${above ? "" : "max-lg:-z-10"} ${className}`} style={style}>
      {render(items, "d")}
      {render(mobile, "m")}
    </div>
  );
}
