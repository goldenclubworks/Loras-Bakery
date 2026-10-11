"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import Dove from "./Dove";
import Script from "./Script";

const LAYERS = 18;

function hex(h: string) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(a: string, b: string, t: number) {
  const [r1, g1, b1] = hex(a);
  const [r2, g2, b2] = hex(b);
  return `rgb(${Math.round(r1 + (r2 - r1) * t)} ${Math.round(g1 + (g2 - g1) * t)} ${Math.round(b1 + (b2 - b1) * t)} / var(--t3-la, 0.2))`;
}

/** Ein Wort als echter Tiefenkörper: viele gestapelte Ebenen im 3D-Raum, nach hinten dunkler. */
function Word({ text, face, back, className = "", delay }: { text: string; face: string; back: string; className?: string; delay: number }) {
  return (
    <span className={`t3-word ${className}`} aria-hidden style={{ "--d": `${delay}s` } as CSSProperties}>
      {Array.from({ length: LAYERS }, (_, i) => {
        const k = LAYERS - i; // hinterste Ebene zuerst im DOM
        return (
          <span
            key={k}
            className={`t3-layer ${k === LAYERS ? "t3-last" : ""}`}
            style={{ transform: `translateZ(calc(${-k} * var(--t3-step)))`, color: mix(face, back, Math.min(1, k / LAYERS)) }}
          >
            {text}
          </span>
        );
      })}
      <span className="t3-face" style={{ ["--face" as string]: face }}>
        {text}
      </span>
    </span>
  );
}

/**
 * Der Schriftzug im Hero mit echtem 3D-Effekt: neigt sich mit Maus, Scrollen und sanftem Eigenleben
 * und trägt Loras Handschrift in der vordersten Ebene.
 */
export default function Title3D() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let tx = 0;
    let ty = 0;
    let cx = -9;
    let cy = 3;
    let raf = 0;
    let on = true;
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const loop = (t: number) => {
      if (!on) return;
      const sc = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1.2);
      const wantY = -9 + tx * 13 + Math.sin(t * 0.0006) * 4.5 + sc * 14;
      const wantX = 3 - ty * 7 + Math.cos(t * 0.0008) * 2.2 - sc * 6;
      // Klarwerden: der Titel startet leicht transparent und wird beim Scrollen deckend (über Farb-Alpha, nie opacity: das würde 3D abflachen)
      const p = Math.min(1, window.scrollY / Math.max(window.innerHeight * 0.5, 1));
      const e = p * p * (3 - 2 * p);
      const a = 0.5 + 0.5 * e;
      el.style.setProperty("--t3-a", a.toFixed(3));
      el.style.setProperty("--t3-la", (1 - Math.pow(1 - a, 1 / LAYERS)).toFixed(4));
      el.style.setProperty("--t3-d", (0.55 + 0.45 * e).toFixed(3));
      cx += (wantY - cx) * 0.06;
      cy += (wantX - cy) * 0.06;
      el.style.setProperty("--ry", `${cx.toFixed(2)}deg`);
      el.style.setProperty("--rx", `${cy.toFixed(2)}deg`);
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([e]) => {
      on = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (on) raf = requestAnimationFrame(loop);
    });
    io.observe(el);
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      on = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div className="t3-scene relative">
      <div ref={root} className="t3">
        <h1 aria-label="Loras Bakery" className="t3-h1 font-display text-[clamp(4.4rem,12.6vw,12.2rem)] leading-[0.8]">
          <Word text="Loras" face="#4a2e24" back="#1d0f0a" delay={0.15} />
          <Word text="Bakery" face="#b8223a" back="#4a0a18" className="t3-offset italic" delay={0.35} />
        </h1>

        {/* Loras Handschrift und die Taube schweben vor den Buchstaben */}
        <div className="t3-front pointer-events-none absolute -right-[1%] bottom-[-2.6rem] z-10 text-[clamp(1.6rem,3.2vw,3.2rem)] md:bottom-[-3.4rem]" aria-hidden>
          <Script lines={["mit Liebe gebacken"]} immediate delay={1.7 + 0} className="text-berry [text-shadow:0_2px_0_rgb(255_255_255/0.6)]" rotate={-6} />
        </div>
        <Dove
          hero
          delay={1.0}
          stroke="var(--blue)"
          className="t3-front pointer-events-none absolute -top-[2.4rem] left-[56%] hidden w-[clamp(120px,13vw,210px)] sm:block lg:-top-[1.8rem]"
        />
      </div>
    </div>
  );
}
