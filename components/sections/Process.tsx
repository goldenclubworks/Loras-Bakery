"use client";

import { useEffect, useRef } from "react";
import { loadGsap } from "@/lib/gsap";
import Ingredients from "../Ingredients";
import Reveal from "../Reveal";
import { ingredientSize } from "@/lib/ingredients";
import LaceFence from "../LaceFence";

const steps = [
  { n: "1", title: "Anfrage", text: "Du schreibst uns Anlass, Datum, Portionen und deine Wünsche. Fotos als Inspiration sind willkommen." },
  { n: "2", title: "Beratung", text: "Wir besprechen Stil, Geschmack und Preis und halten alles in einem klaren Angebot fest." },
  { n: "3", title: "Handarbeit", text: "Deine Torte entsteht frisch und von Hand: Boden, Creme, Spitze und jedes einzelne Detail." },
  { n: "4", title: "Übergabe", text: "Du holst sie ab oder wir vereinbaren die Lieferung. Dann darf gefeiert werden." },
];

const stepFruit = ["currant-a", "raspberry-top", "currant-b", "strawberry"] as const;

export default function Process() {
  const path = useRef<SVGPathElement>(null);
  useEffect(() => {
    const p = path.current;
    if (!p) return;
    const len = p.getTotalLength();
    p.style.strokeDasharray = `${len}`;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      p.style.strokeDashoffset = "0";
      return;
    }
    p.style.strokeDashoffset = `${len}`;
    let dead = false;
    let undo: (() => void) | undefined;
    loadGsap().then(({ gsap }) => {
      if (dead) return;
      const tween = gsap.to(p, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: { trigger: p.closest("section"), start: "top 70%", end: "bottom 65%", scrub: 0.6 },
      });
      undo = () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });
    return () => {
      dead = true;
      undo?.();
    };
  }, []);

  return (
    <section id="atelier" className="relative isolate overflow-x-clip bg-cream py-28 lg:py-40">
      <LaceFence tone="white" />
      <div className="mx-auto max-w-[1500px] px-5 md:px-10">
        <Reveal>
          <p className="eyebrow">So entsteht deine Torte</p>
        </Reveal>
        <Reveal as="h2" delay={0.08} className="font-display mt-6 max-w-[16ch] text-[clamp(2.6rem,5.4vw,5rem)] leading-[0.98]">
          Von der Idee zur <em className="text-berry">fertigen Torte.</em>
        </Reveal>

        <div className="relative mt-20">
          {/* the hand-drawn thread that connects the steps */}
          <svg
            aria-hidden
            className="pointer-events-none absolute -top-3 left-0 hidden h-20 w-full md:block"
            viewBox="0 0 1000 80"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              ref={path}
              d="M20 40 C 90 4, 140 76, 210 40 S 330 6, 400 42 S 540 76, 610 40 S 740 4, 800 40 S 920 74, 980 40"
              stroke="#3a2018"
              strokeWidth="5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <ol className="relative grid gap-12 md:grid-cols-4 md:gap-8">
            {steps.map((s, i) => (
              <Reveal as="li" key={s.n} delay={i * 0.1} className="relative">
                <span className="font-display relative z-10 grid h-14 w-14 place-items-center rounded-full border border-choc bg-cream text-2xl italic">
                  {s.n}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/ingredients/${stepFruit[i]}.webp`} alt="" width={ingredientSize[stepFruit[i]][0]} height={ingredientSize[stepFruit[i]][1]} loading="lazy" className="absolute left-[2.9rem] top-[-0.5rem] z-20 w-9 rotate-[14deg]" draggable={false} />
                <h3 className="font-display mt-6 text-[2rem]">{s.title}</h3>
                <p className="mt-2 max-w-[30ch] text-cocoa">{s.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
      <Ingredients
        items={[]}
        mobile={[
          { src: "raspberry-side", w: 46, x: 88, y: 23, rot: 16, o: 0.68, hideMd: true },
          { src: "strawberry", w: 46, x: 88, y: 42.5, rot: -14, o: 0.66, hideMd: true },
          { src: "mint-leaf-b", w: 52, x: 87, y: 61, rot: 20, o: 0.6, hideMd: true },
        ]}
        amount={30}
      />
    </section>
  );
}
