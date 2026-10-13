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
  const bag = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const p = path.current;
    const b = bag.current;
    const svg = p?.ownerSVGElement;
    if (!p || !svg) return;
    const len = p.getTotalLength();
    // Die Linie ist nicht skalierend (vectorEffect), Strichlängen zählen daher in Bildschirm-Pixeln: Länge der gestreckten Kurve messen
    let screenLen = len;
    const measure = () => {
      const r = svg.getBoundingClientRect();
      if (!r.width) return;
      let sum = 0;
      let prev = p.getPointAtLength(0);
      for (let i = 1; i <= 240; i++) {
        const q = p.getPointAtLength((len * i) / 240);
        sum += Math.hypot(((q.x - prev.x) / 1000) * r.width, ((q.y - prev.y) / 80) * r.height);
        prev = q;
      }
      screenLen = sum;
    };
    let t = 0;
    // Linie bis t zeichnen; die Spitze der Spritztüte sitzt am Ende, die Tüte kippt und wippt dabei leicht
    const render = (v: number) => {
      t = v;
      p.style.strokeDasharray = `${screenLen}`;
      p.style.strokeDashoffset = `${screenLen * (1 - v)}`;
      const r = svg.getBoundingClientRect();
      if (!b || !r.width) return;
      const a = p.getPointAtLength(len * v);
      const c = p.getPointAtLength(Math.min(len, len * v + 4));
      const slope = Math.atan2(((c.y - a.y) / 80) * r.height, ((c.x - a.x) / 1000) * r.width) * (180 / Math.PI);
      const rot = -14 + slope * 0.6 + Math.sin(v * 46) * 4.5;
      const lift = Math.abs(Math.sin(v * 23)) * -3;
      b.style.transform = `translate(${((a.x / 1000) * r.width).toFixed(1)}px, ${((a.y / 80) * r.height + lift).toFixed(1)}px) rotate(${rot.toFixed(1)}deg)`;
    };
    measure();
    const onResize = () => {
      measure();
      render(t);
    };
    window.addEventListener("resize", onResize);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      render(1);
      return () => window.removeEventListener("resize", onResize);
    }
    render(0);
    let dead = false;
    let undo: (() => void) | undefined;
    loadGsap().then(({ gsap }) => {
      if (dead) return;
      const prog = { v: 0 };
      const tween = gsap.to(prog, {
        v: 1,
        ease: "none",
        scrollTrigger: { trigger: p.closest("section"), start: "top 70%", end: "bottom 65%", scrub: 0.6 },
        onUpdate: () => render(prog.v),
      });
      undo = () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });
    return () => {
      dead = true;
      window.removeEventListener("resize", onResize);
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
          <div aria-hidden className="pointer-events-none absolute -top-3 left-0 hidden h-20 w-full md:block">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 80" preserveAspectRatio="none" fill="none">
            <path
              ref={path}
              d="M20 40 C 90 4, 140 76, 210 40 S 330 6, 400 42 S 540 76, 610 40 S 740 4, 800 40 S 920 74, 980 40"
              stroke="#3a2018"
              strokeWidth="5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={bag}
            src="/piping-bag.webp"
            alt=""
            width={360}
            height={386}
            decoding="async"
            draggable={false}
            className="absolute left-0 top-0 z-30 w-[66px] max-w-none select-none will-change-transform"
            style={{ transformOrigin: "2% 98%", marginLeft: -1.5, marginTop: -69.5 }}
          />
          </div>

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
