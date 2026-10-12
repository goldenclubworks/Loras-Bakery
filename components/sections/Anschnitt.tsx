import Image from "next/image";
import Ingredients, { type Ingredient } from "../Ingredients";
import InView from "../InView";
import LaceFence from "../LaceFence";
import Reveal from "../Reveal";
import Script from "../Script";
import Sketch, { arrows } from "../Sketch";
import { photos } from "@/lib/photos";

const steps = [
  { t: "Frische Beeren", d: "Ausgesucht und erst ganz zum Schluss gesetzt." },
  { t: "Leichte Creme", d: "Luftig und nicht zu süß, damit man noch ein zweites Stück will." },
  { t: "Biskuit in Farbe", d: "Saftig, kräftig, nicht trocken. Hier in Blau, auf Wunsch in deiner Farbe." },
];

const ingredients: Ingredient[] = [
  { src: "raspberry-side", w: 100, x: 22.6, y: 35.2, depth: 1, rot: 16, land: true },
  { src: "strawberry", w: 104, x: 63.4, y: 62.4, depth: 1.25, rot: -18, land: true },
  { src: "currant-b", w: 56, x: 57.8, y: 71.4, depth: 0.7, rot: -10, land: true },
  { src: "mint-leaf-a", w: 92, x: 67.4, y: 74.6, depth: 0.8, rot: 12, land: true },
];

/** Mobil: klein, leicht transparent, gleiten vom Rand herein */
const ingredientsMobile: Ingredient[] = [
  { src: "blueberry", w: 44, x: 89, y: 2.5, rot: 12, o: 0.64 },
  { src: "aril-b", w: 34, x: 3, y: 94, rot: -22, o: 0.68, hideMd: true },
  { src: "mint-leaf-b", w: 54, x: 87, y: 95, rot: 18, o: 0.58 },
];

export default function Anschnitt() {
  const p = photos["slice-blue"];
  return (
    <section id="anschnitt" className="relative isolate overflow-x-clip bg-sage py-28 text-cream lg:py-44">
      <LaceFence tone="white" />
      <div className="relative mx-auto max-w-[1500px] px-5 md:px-10">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="eyebrow !text-cream/70">Der Anschnitt</p>
            </Reveal>
            <Reveal as="h2" delay={0.08} className="font-display mt-6 text-[clamp(2.8rem,6vw,5.8rem)] leading-[0.96]">
              Schicht für Schicht,
              <br />
              <em className="text-blush">von Hand gebaut.</em>
            </Reveal>
          </div>
          <Reveal delay={0.16} className="max-w-[40ch] text-[1.1rem] leading-[1.75] text-cream/75 lg:col-span-5 lg:pb-3">
            Unter der Dekoration steckt Handwerk: saftiger Biskuit, leichte Creme und Früchte, die erst kurz vor dem Servieren
            ihren Platz bekommen.
          </Reveal>
        </div>

        <div className="relative mt-20 grid items-center gap-8 lg:grid-cols-12">
          {/* Notizen links */}
          <div className="relative hidden lg:col-span-3 lg:block lg:min-h-[28rem]">
            <div className="absolute right-4 top-[6%] text-right">
              <Script lines={["frische Beeren,", "erst zum Schluss"]} className="text-[2.2rem] text-blush" rotate={-5} delay={0.4} step={0.9} />
              <Sketch d={arrows.curveRight} viewBox="0 0 90 60" className="ml-auto mt-2 h-14 w-24 text-blush" delay={1.8} />
            </div>
            <div className="absolute bottom-[8%] right-4 text-right">
              <Script lines={["Biskuit in Farbe"]} className="text-[2.2rem] text-mint" rotate={3} delay={0.6} />
              <Sketch d={arrows.curveRight} viewBox="0 0 90 60" className="ml-auto mt-1 h-14 w-24 text-mint" delay={1.5} />
            </div>
          </div>

          <InView className="relative lg:col-span-6" threshold={0.2}>
            {/* Lichtkegel hinter dem Bild */}
            <div aria-hidden className="absolute -inset-[8%] -z-0 rounded-full opacity-70" style={{ background: "radial-gradient(closest-side, rgb(235 196 196 / 0.22), transparent 72%)" }} />
            <div className="clip-up relative overflow-hidden bg-plum shadow-[0_50px_80px_-40px_rgb(0,0,0,0.6)]">
              <Image
                src={p.src}
                alt={p.alt}
                width={p.w}
                height={p.h}
                placeholder="blur"
                blurDataURL={p.blur}
                sizes="(min-width: 1024px) 50vw, 92vw"
                className="h-auto w-full"
              />
              {/* feines Glanzlicht von links oben, wie Fensterlicht */}
              <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(125deg, rgb(255 244 226 / 0.14) 0%, rgb(255 244 226 / 0) 38%), radial-gradient(120% 90% at 50% 45%, transparent 60%, rgb(47 26 20 / 0.22) 100%)" }} />
            </div>
          </InView>

          {/* zwei kleine Bilder, rechts daneben (mobil unter dem großen Bild) */}
          <div className="relative grid grid-cols-2 gap-4 lg:col-span-3 lg:block lg:min-h-[28rem]">
            {[
              { id: "slice-blue-close" as const, cls: "lg:w-[92%] lg:-rotate-[2.5deg]", d: 0.15 },
              { id: "slice-table" as const, cls: "lg:ml-auto lg:mt-[-1.6rem] lg:w-[78%] lg:rotate-[2deg]", d: 0.3 },
            ].map((x) => {
              const q = photos[x.id];
              return (
                <InView key={x.id} className={`relative ${x.cls}`} threshold={0.2}>
                  <figure className="pop bg-cream p-1.5 shadow-[0_30px_50px_-28px_rgb(0,0,0,0.65)]" style={{ "--d": `${x.d}s` } as React.CSSProperties}>
                    <Image
                      src={q.src}
                      alt={q.alt}
                      width={q.w}
                      height={q.h}
                      placeholder="blur"
                      blurDataURL={q.blur}
                      sizes="(min-width: 1024px) 18vw, 44vw"
                      className="aspect-[4/5] w-full object-cover"
                      style={{ objectPosition: q.pos }}
                    />
                  </figure>
                </InView>
              );
            })}
            <div className="relative col-span-2 mt-2 hidden lg:mt-6 lg:block">
              <Sketch d={arrows.curveDownLeft} viewBox="0 0 90 60" className="mb-1 h-12 w-24 -rotate-[10deg] text-blush" delay={1.4} />
              <Script lines={["leichte Creme,", "nicht zu süß"]} className="text-[2.2rem] text-blush" rotate={4} delay={1} step={0.9} />
            </div>
          </div>
        </div>

        {/* mobil: gleiche Aussagen als ruhige Liste */}
        <ol className="mt-12 grid gap-8 sm:grid-cols-3 lg:hidden">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.t} delay={i * 0.08} className="border-t border-cream/25 pt-5">
              <span className="font-display italic text-blush">0{i + 1}</span>
              <p className="font-display mt-1 text-[1.5rem]">{s.t}</p>
              <p className="mt-2 text-cream/70">{s.d}</p>
            </Reveal>
          ))}
        </ol>
      </div>
      <Ingredients items={ingredients} mobile={ingredientsMobile} amount={60} container />
    </section>
  );
}
