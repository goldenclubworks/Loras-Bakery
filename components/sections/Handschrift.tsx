import Image from "next/image";
import Ingredients, { type Ingredient } from "../Ingredients";
import InView from "../InView";
import Parallax from "../Parallax";
import Reveal from "../Reveal";
import Script from "../Script";
import Sketch, { arrows } from "../Sketch";
import { photos } from "@/lib/photos";

const facts = [
  { n: "01", title: "Handgespritzte Spitze", text: "Jedes Muster wird frei aus Schokolade gespritzt, deshalb gleicht keines dem anderen." },
  { n: "02", title: "Frische statt Fertiges", text: "Beeren, Früchte und Minze kommen frisch auf die Torte, prall, glänzend und erst zum Schluss." },
  { n: "03", title: "Glanz und Details", text: "Ganache, Macarons, Windbeutel, Silberperlen: jedes Detail wird von Hand gesetzt." },
];

const ingredients: Ingredient[] = [
  { src: "raspberry-a", w: 100, x: 37, y: 6, depth: 1.0, rot: 20, spin: 44, hideSm: true },
  { src: "strawberry-e", w: 116, x: 38, y: 82, depth: 0.8, rot: -14, spin: 22, hideSm: true },
  { src: "currant-c", w: 70, x: 95, y: 3, depth: 0.6, rot: 24, spin: 18, hideSm: true },
  { src: "aril-a", w: 70, x: 44, y: 90, depth: 0.7, rot: 8, spin: 16, hideSm: true },
];

export default function Handschrift() {
  const p = photos["lace-berries"];
  return (
    <section id="handschrift" className="relative overflow-x-clip bg-cream py-28 lg:py-44">
      <div className="relative mx-auto grid max-w-[1500px] items-center gap-x-10 gap-y-20 px-5 md:px-10 lg:grid-cols-12">
        <div className="relative lg:col-span-5">
          <Parallax speed={0.03}>
            <InView className="relative mx-auto max-w-[520px]">
              <div aria-hidden className="absolute -inset-3 -translate-x-3 -translate-y-3 border border-rose/60" />
              <div className="clip-up relative aspect-[3/4] overflow-hidden bg-blush">
                <Image
                  src="/photos/lace-berries.webp"
                  alt={p.alt}
                  width={p.w}
                  height={p.h}
                  placeholder="blur"
                  blurDataURL={p.blur}
                  sizes="(min-width: 1024px) 36vw, 92vw"
                  className="h-full w-full object-cover"
                  style={{ objectPosition: p.pos }}
                />
              </div>
              {/* Lora's Marginalien: Zettel mit Pfeil direkt am Foto */}
              <div className="absolute -left-6 top-[9%] z-10 hidden bg-cream px-5 py-3 shadow-[var(--shadow-soft)] sm:block lg:-left-10">
                <Script lines={["Faden für Faden", "von Hand gespritzt"]} className="text-[1.9rem] text-berry" rotate={-3} delay={0.6} step={0.9} />
              </div>
              <Sketch d={arrows.curveRight} viewBox="0 0 90 60" className="absolute left-[15%] top-[24%] z-10 hidden h-16 w-28 text-cream sm:block" delay={2.2} width={2.2} />
              <div className="absolute -right-5 bottom-[11%] z-10 hidden bg-cream px-5 py-3 shadow-[var(--shadow-soft)] sm:block lg:-right-10">
                <Script lines={["erst ganz zum", "Schluss gesetzt"]} className="text-[1.9rem] text-blue" rotate={3} delay={1.6} step={0.9} />
              </div>
            </InView>
          </Parallax>
        </div>

        <div className="relative lg:col-span-7 lg:pl-14">
          <Reveal>
            <p className="eyebrow">Die Handschrift</p>
          </Reveal>
          <Reveal as="h2" delay={0.08} className="font-display mt-6 text-[clamp(2.8rem,6.4vw,6.2rem)] leading-[0.95]">
            Kein Muster
            <br />
            gleicht dem <em className="text-berry">anderen.</em>
          </Reveal>
          <Reveal delay={0.16} className="mt-9 max-w-[46ch] text-[1.12rem] leading-[1.75] text-cocoa">
            Loras Torten erkennt man an der Schokoladen-Spitze: dünn gespritzt, filigran und jedes Mal anders. Darunter
            frische Sahne, darüber alles, was glänzt und schmeckt.
          </Reveal>

          <ul className="mt-14 border-t border-choc/20">
            {facts.map((f, i) => (
              <Reveal as="li" key={f.n} delay={0.1 + i * 0.08} className="grid grid-cols-[3.4rem_1fr] gap-4 border-b border-choc/20 py-7">
                <span className="font-display text-[1.5rem] italic text-rose">
                  {f.n}
                </span>
                <div>
                  <h3 className="font-display text-[1.7rem] leading-tight">{f.title}</h3>
                  <p className="mt-1.5 max-w-[44ch] text-cocoa">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
      <Ingredients items={ingredients} amount={60} />
    </section>
  );
}
