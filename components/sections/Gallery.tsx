"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { photos, type PhotoId } from "@/lib/photos";
import LaceFence from "../LaceFence";
import Ingredients from "../Ingredients";
import Reveal from "../Reveal";
import Script from "../Script";

/** Alle Referenzbilder, als Geschichte sortiert: Format und Farbwelt wechseln sich ab. */
const ids: PhotoId[] = [
  "drip-roses", "tart-dove", "lace-fruit-top", "slice-blue-close", "glaze-roses", "lace-tights",
  "easter-berries", "cupcake-shoes", "mirror-slice", "cream-roses", "jelly-slices", "slice-table",
  "lace-dark-berries", "tartlets", "tartlets-berries", "lace-berries", "flake-roses", "slice-blue", "hero-hand",
];
const list = ids.map((id) => photos[id]);

export default function Gallery() {
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const strip = useRef<HTMLUListElement>(null);
  const [pos, setPos] = useState({ i: 0, p: 0 });
  const raf = useRef(0);
  const onScroll = useCallback(() => {
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      const el = strip.current;
      if (!el) return;
      const max = Math.max(el.scrollWidth - el.clientWidth, 1);
      const p = Math.min(1, el.scrollLeft / max);
      setPos({ p, i: Math.min(list.length - 1, Math.round(p * (list.length - 1))) });
    });
  }, []);

  const close = useCallback(() => {
    dialog.current?.close();
    setOpen(null);
  }, []);
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + list.length) % list.length)), []);
  const scroll = (d: number) => strip.current?.scrollBy({ left: d * Math.min(640, strip.current.clientWidth * 0.8), behavior: "smooth" });

  useEffect(() => {
    if (open !== null && !dialog.current?.open) dialog.current?.showModal();
  }, [open]);
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  const current = open !== null ? list[open] : null;

  return (
    <section id="galerie" className="relative isolate overflow-x-clip bg-sage py-28 text-cream lg:py-40">
      <LaceFence tone="choc" />
      <div className="mx-auto max-w-[1500px] px-5 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <Reveal>
              <p className="eyebrow !text-cream/70">Galerie</p>
            </Reveal>
            <Reveal as="h2" delay={0.08} className="font-display mt-6 text-[clamp(2.6rem,5.4vw,5rem)] leading-[0.98]">
              Inspiration aus <em className="text-blush">echten Momenten.</em>
            </Reveal>
          </div>
          <div className="flex items-center gap-4">
            <Script lines={["Mehr als nur Dessert."]} className="mr-4 hidden text-[2.2rem] text-blush md:block" rotate={-4} />
            <button onClick={() => scroll(-1)} aria-label="Zurück blättern" className="grid h-11 w-11 place-items-center border border-cream/40 transition-colors hover:bg-cream hover:text-choc">
              ←
            </button>
            <button onClick={() => scroll(1)} aria-label="Weiter blättern" className="grid h-11 w-11 place-items-center border border-cream/40 transition-colors hover:bg-cream hover:text-choc">
              →
            </button>
          </div>
        </div>
      </div>

      <ul
        ref={strip}
        onScroll={onScroll}
        className="hide-scrollbar mt-14 flex snap-x snap-mandatory items-start gap-5 overflow-x-auto overscroll-x-contain scroll-pl-5 px-5 pb-8 md:gap-7 md:scroll-pl-10 md:px-10"
        aria-label="Fotos von Loras Torten"
      >
        {list.map((p, i) => (
          <li key={p.id} className={`shrink-0 snap-start ${i % 2 ? "mt-10 md:mt-16" : ""}`}>
            <button
              onClick={() => setOpen(i)}
              className="group relative block overflow-hidden bg-paper text-left"
            >
              <Image
                src={p.src}
                alt={p.alt}
                width={p.w}
                height={p.h}
                placeholder="blur"
                blurDataURL={p.blur}
                sizes="(min-width: 768px) 420px, 70vw"
                className="h-[min(48svh,360px)] w-auto max-w-none object-cover transition-transform duration-[1400ms] [transition-timing-function:var(--ease-out)] group-hover:scale-[1.05] md:h-[min(52svh,430px)]"
              />
              <span aria-hidden className="absolute bottom-3 left-4 font-display text-[1.1rem] italic text-cream drop-shadow-[0_1px_6px_rgb(0,0,0,0.55)]">0{i + 1}</span>
            </button>
          </li>
        ))}
        <li aria-hidden className="w-4 shrink-0 md:w-10" />
      </ul>

      {/* Fortschritt: Zähler und feine Linie */}
      <div className="mx-auto mt-4 flex max-w-[1500px] items-center gap-5 px-5 md:px-10" aria-hidden>
        <span className="font-display text-[1.1rem] italic text-blush tabular-nums">{String(pos.i + 1).padStart(2, "0")}</span>
        <span className="relative h-px flex-1 bg-cream/25">
          <span className="absolute inset-y-[-0.5px] left-0 h-[2px] origin-left bg-blush" style={{ width: "100%", transform: `scaleX(${0.06 + 0.94 * pos.p})` }} />
        </span>
        <span className="text-[0.72rem] tracking-[0.3em] text-cream/70 tabular-nums">{String(list.length).padStart(2, "0")}</span>
      </div>

      <Ingredients
        items={[]}
        mobile={[
          { src: "sprinkles", w: 80, x: 4, y: 88.5, rot: 8, o: 0.7 },
          { src: "blueberry", w: 42, x: 88, y: 91, rot: 10, o: 0.62 },
        ]}
        amount={30}
      />

      <dialog
        ref={dialog}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === dialog.current && close()}
        className="m-auto max-h-[94svh] w-[min(94vw,1100px)] overflow-visible bg-transparent p-0 backdrop:bg-plum/92 backdrop:backdrop-blur-sm"
        aria-label="Bildansicht"
      >
        {current && (
          <figure className="relative grid place-items-center">
            <Image
              key={current.id}
              src={current.src}
              alt={current.alt}
              width={current.w}
              height={current.h}
              sizes="94vw"
              className="max-h-[86svh] w-auto object-contain"
            />
            <figcaption className="mt-3 max-w-[60ch] text-center text-sm text-cream/80">{current.alt}</figcaption>
            <button onClick={close} aria-label="Schließen" className="absolute -top-3 right-0 grid h-11 w-11 place-items-center bg-cream text-choc md:-right-3">
              ✕
            </button>
            <button onClick={() => step(-1)} aria-label="Vorheriges Bild" className="absolute left-1 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center bg-cream/90 text-choc md:-left-6">
              ←
            </button>
            <button onClick={() => step(1)} aria-label="Nächstes Bild" className="absolute right-1 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center bg-cream/90 text-choc md:-right-6">
              →
            </button>
          </figure>
        )}
      </dialog>
    </section>
  );
}
