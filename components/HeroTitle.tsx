"use client";

import { useEffect, useRef } from "react";
import Dove from "./Dove";
import Script from "./Script";

/**
 * Der große Schriftzug im Hero. Gleiche ruhige Sprache wie der Schriftzug im Kontaktbereich ganz unten: flach, elegant,
 * erscheint langsam aus dem Unscharfen und wird beim Scrollen klar. Damit er trotzdem die Blicke zieht, steht er auf einem
 * weichen rosa Schein mit einem Band echter Spitze dahinter. Daneben fliegt die Taube mit Bäckerhut, der beim Scrollen davonweht.
 */
export default function HeroTitle() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--ht-a", "1");
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const p = Math.min(1, window.scrollY / Math.max(window.innerHeight * 0.4, 1));
      const e = p * p * (3 - 2 * p);
      el.style.setProperty("--ht-a", (0.86 + 0.14 * e).toFixed(3));
      el.style.setProperty("--ht-s", p.toFixed(3));
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      window.removeEventListener("scroll", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={root} className="ht relative">
      {/* Hintergrund: weicher Schein und ein Band echter Spitze, damit die ruhige Schrift nicht untergeht */}
      <div aria-hidden className="ht-back pointer-events-none absolute -inset-x-[7%] -inset-y-[26%] -z-10">
        <div className="ht-glow" />
        <div className="ht-lace" />
      </div>

      <h1 aria-label="Loras Bakery" className="ht-h1 font-display relative text-[clamp(4.4rem,12.6vw,12.2rem)] leading-[0.84]">
        <span className="ht-word" aria-hidden style={{ "--d": "0.25s" } as React.CSSProperties}>
          Loras
        </span>
        <span className="ht-word ht-offset italic text-berry" aria-hidden style={{ "--d": "0.7s" } as React.CSSProperties}>
          Bakery
        </span>
      </h1>

      <div className="fade-in pointer-events-none absolute -right-[1%] bottom-[-2.4rem] z-10 text-[clamp(1.6rem,3.2vw,3.2rem)] md:bottom-[-3.2rem]" aria-hidden style={{ "--d": "2.3s" } as React.CSSProperties}>
        <Script lines={["mit Liebe gebacken"]} immediate delay={2.5} className="text-berry [text-shadow:0_1px_0_rgb(255_255_255/0.6)]" rotate={-6} />
      </div>

      <Dove
        hero
        blow
        delay={1.2}
        stroke="var(--blue)"
        className="pointer-events-none absolute -top-[2.7rem] right-[2%] w-[clamp(118px,13vw,215px)] sm:left-[56%] sm:right-auto lg:top-[0.1rem] lg:left-[58%]"
      />
    </div>
  );
}
