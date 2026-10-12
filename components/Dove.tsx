"use client";

import { useEffect, useRef, type CSSProperties } from "react";

/**
 * Die Taube aus dem Brand Board als Linienzeichnung, jetzt mit Bäckerhut im selben Strich.
 * `hero` zeichnet sich per CSS beim Laden, sonst löst das umgebende <InView> die Zeichnung aus (Klasse .sketch).
 * Mit `blow` weht der Hut beim Scrollen davon: er hebt ab, dreht sich im Wind, die Linien löschen sich von hinten aus
 * (gleiche Zeichen-Technik rückwärts) und kleine Windstriche zeichnen sich kurz daneben. Zurückscrollen setzt den Hut wieder auf.
 */
const strokes = [
  // Kopf, Schnabel, Auge
  "M40 70 C 38 58 50 50 60 55 C 68 60 66 72 58 78",
  "M40 70 L 17 76 L 40 79",
  "M52 64 L 52.5 64.5",
  // Rücken in den Flügel, Brust, Bauch
  "M62 58 C 80 60 98 66 112 74",
  "M46 82 C 56 100 84 110 112 105 C 140 100 164 88 186 76",
  // Flügel mit Federn
  "M104 76 C 94 50 100 24 130 4 C 130 24 142 38 158 42 C 164 26 182 14 210 10 C 206 38 190 66 164 84",
  "M130 4 C 126 32 122 56 120 80",
  "M158 42 C 152 58 146 72 142 86",
  "M184 26 C 178 46 172 64 164 82",
  // Schwanz
  "M186 76 C 202 80 220 94 234 114",
  "M184 70 C 204 70 222 76 238 88",
  "M176 82 C 190 92 202 106 212 124",
];

/** Bäckerhut (Toque): Rand, Stirnband, Wolkenkrone, zwei Falten. Sitzt auf dem Scheitel bei etwa (53, 53). */
const hat = [
  "M43 61 C 47 54 56 50 64 56", // unterer Rand, folgt dem Kopf
  "M43.5 52 C 47 45 56 41 64.5 47", // oberer Bandrand
  "M43 61 L 43.5 52",
  "M64 56 L 64.5 47",
  "M43.5 52 C 35 51 32 41 38 36 C 35 27 43 19 51 22 C 54 13 67 13 70 22 C 79 20 85 30 78 37 C 83 44 74 50 64.5 47", // Wolkenkrone
  "M49.5 24 C 48.5 33 48.5 42 49 49", // Falten
  "M58 20.5 C 59 29 59 37 58.5 45.5",
];

/** Windstriche rechts vom Hut */
const wind = ["M2 20 C 12 16 22 18 33 12", "M0 34 C 11 30 23 33 36 27", "M7 47 C 15 44 22 45 30 41"];

export default function Dove({
  className = "",
  stroke = "var(--blue)",
  width = 1.7,
  hero = false,
  delay = 0,
  withHat = true,
  blow = false,
}: {
  className?: string;
  stroke?: string;
  width?: number;
  hero?: boolean;
  delay?: number;
  withHat?: boolean;
  /** Hut weht beim Scrollen davon (nur Hero) */
  blow?: boolean;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const hatG = useRef<SVGGElement>(null);
  const windG = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!blow) return;
    const el = svg.current;
    const h = hatG.current;
    const w = windG.current;
    if (!el || !h || !w) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let target = 0;
    let cur = 0;
    const ease = (t: number) => t * t * (3 - 2 * t);
    const render = (p: number) => {
      // einmal losgelöst, bleibt die Zeichnung steuerbar (zurück am Anfang sitzt der Hut wieder auf)
      if (p > 0.004) el.classList.add("free");
      const e = ease(p);
      // Hut: hebt kurz ab, kippt und wird vom Wind nach rechts getragen; flattert dabei
      const x = 6 + 330 * e;
      const y = -2 - 26 * Math.sin(Math.min(1, p * 1.5) * Math.PI * 0.5) + 44 * e * e + Math.sin(p * 11) * 5 * (1 - Math.abs(p - 0.5));
      const r = -7 + 62 * e + Math.sin(p * 13 + 1) * 6;
      h.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${r.toFixed(1)}deg)`;
      // Linien des Hutes löschen sich im letzten Drittel von hinten aus und blenden aus
      const u = Math.max(0, (p - 0.55) / 0.45);
      h.style.setProperty("--u", u.toFixed(3));
      h.style.opacity = String(Math.max(0, 1 - Math.max(0, p - 0.84) / 0.16));
      // Windstriche: zeichnen sich zwischen 5 % und 35 %, löschen sich bis 75 %
      const wi = Math.max(0, Math.min(1, (p - 0.05) / 0.3));
      const wo = Math.max(0, Math.min(1, (p - 0.4) / 0.35));
      w.style.setProperty("--wo", (1 - wi - wo).toFixed(3));
    };
    const frame = () => {
      raf = 0;
      cur += (target - cur) * 0.07;
      if (Math.abs(target - cur) < 0.002) cur = target;
      render(cur);
      if (cur !== target) raf = requestAnimationFrame(frame);
    };
    // Schon wenige Pixel Scrollen lösen den Windstoß aus; die Bewegung läuft dann weich zu Ende, auch wenn die Taube
    // beim Weiterscrollen schon aus dem Bild ist. Ganz oben (≤ 2 px) sitzt der Hut wieder auf.
    const on = () => {
      target = window.scrollY <= 2 ? 0 : Math.max(0, Math.min(1, window.scrollY / 44));
      if (!raf && cur !== target) raf = requestAnimationFrame(frame);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      window.removeEventListener("scroll", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [blow]);

  const common = (i: number, extra = 0) =>
    ({
      pathLength: 1,
      stroke,
      strokeWidth: width,
      strokeLinecap: "round" as const,
      strokeLinejoin: "round" as const,
      className: hero ? "draw" : "sketch",
      style: { "--d": `${delay + (i + extra) * 0.16}s`, "--t": "1.6s" } as CSSProperties,
    }) as const;

  return (
    <svg ref={svg} viewBox="0 0 250 130" fill="none" aria-hidden className={`dove overflow-visible ${className}`}>
      {strokes.map((d, i) => (
        <path key={i} d={d} {...common(i)} />
      ))}
      {withHat && (
        <g ref={hatG} className="dove-hat" style={{ transformOrigin: "53px 52px" }}>
          <g className="dove-hat-wobble">
            {/* Hut etwas größer als im Entwurf und tiefer auf dem Scheitel */}
            <g transform="translate(-10.6 -7.2) scale(1.2)">
              {hat.map((d, i) => (
                <path key={i} d={d} {...common(i, strokes.length - 4)} strokeWidth={width / 1.2} />
              ))}
            </g>
          </g>
        </g>
      )}
      {blow && (
        <g ref={windG} className="dove-wind">
          {wind.map((d, i) => (
            <path key={i} d={d} pathLength={1} stroke={stroke} strokeWidth={width * 0.8} strokeLinecap="round" />
          ))}
        </g>
      )}
    </svg>
  );
}
