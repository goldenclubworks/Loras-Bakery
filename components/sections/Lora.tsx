import Image from "next/image";
import Ingredients, { type Ingredient } from "../Ingredients";
import InView from "../InView";
import LaceFence from "../LaceFence";
import Parallax from "../Parallax";
import Reveal from "../Reveal";
import Script from "../Script";
import Sketch, { arrows } from "../Sketch";
import { photos } from "@/lib/photos";

/**
 * Über uns. Fakten, auf die sich der Text stützt: Lora kommt aus Russland, hat viel Erfahrung, viele Ideen und backt aus
 * Leidenschaft; sie spritzt die Schokoladen-Spitze selbst und sucht die Früchte einzeln aus. Alles andere ist Ton.
 * Lora sollte den Text einmal lesen und ändern, was nicht nach ihr klingt.
 */
const pillars = [
  { t: "Aus Russland", d: "Von dort bringt Lora die Liebe zur großen Torte mit: üppig, festlich, ein Moment, in dem am Tisch alle kurz still werden." },
  { t: "Mit Erfahrung", d: "Über die Jahre sind aus vielen Torten Ideen geworden, die nur sie so macht. Jedes Detail entsteht von Hand." },
  { t: "Aus Leidenschaft", d: "Backen ist für Lora keine Arbeit, sondern ihre Passion. Das siehst du, und das schmeckst du." },
];

const ingredients: Ingredient[] = [
  { src: "strawberry", w: 112, x: 44, y: 89.5, depth: 0.8, rot: -16, spin: 26 },
  { src: "raspberry-top", w: 92, x: 2, y: 8, depth: 1.1, rot: 22, spin: 40 },
  { src: "mint-sprig", w: 130, x: 84, y: 92, depth: 0.6, rot: -10, spin: 16 },
];

/** Mobil: klein, leicht transparent, gleiten vom Rand herein */
const ingredientsMobile: Ingredient[] = [
  { src: "raspberry-top", w: 48, x: 4, y: 2, rot: -12, o: 0.66 },
  { src: "mint-leaf-a", w: 50, x: 87, y: 2.4, rot: 24, o: 0.6 },
  { src: "currant-b", w: 38, x: 90, y: 94.2, rot: 18, o: 0.66 },
];

export default function Lora() {
  const p = photos["lora"];
  return (
    <section id="lora" className="relative isolate overflow-x-clip bg-blush/70 py-28 lg:py-44">
      <LaceFence tone="choc" />
      <div className="relative mx-auto grid max-w-[1500px] items-center gap-16 px-5 md:px-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Parallax speed={0.025}>
            <InView className="relative mx-auto w-full max-w-[500px]">
              <div aria-hidden className="absolute -inset-3 rounded-t-[999px] border border-choc/30" />
              <div
                className="clip-up relative aspect-[4/5] overflow-hidden rounded-t-[999px]"
                style={{ background: "radial-gradient(70% 55% at 50% 30%, #f7efe6 0%, #f1d5cf 55%, #e3a9a6 100%)" }}
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  width={p.w}
                  height={p.h}
                  sizes="(min-width: 1024px) 34vw, 90vw"
                  className="absolute inset-x-[-4%] bottom-0 h-[96%] w-[108%] max-w-none object-cover object-top"
                />
              </div>
              <div className="absolute -bottom-8 -right-2 z-10 rotate-[-5deg] bg-cream px-6 py-3 shadow-[var(--shadow-soft)] md:-right-10">
                <Script lines={["Hi, ich bin Lora."]} className="text-[2.1rem] text-berry" delay={0.5} />
              </div>
            </InView>
          </Parallax>
        </div>

        <div className="lg:col-span-7 lg:pl-12">
          <Reveal>
            <p className="eyebrow">Über uns</p>
          </Reveal>
          <Reveal as="h2" delay={0.08} className="font-display mt-6 text-[clamp(2.6rem,5.2vw,5rem)] leading-[1]">
            Hinter jeder Torte steckt <em className="text-berry">Lora.</em>
          </Reveal>

          <div className="mt-10 max-w-[58ch] space-y-5 text-[1.12rem] leading-[1.75] text-cocoa">
            <Reveal delay={0.14} as="p">
              Lora kommt aus Russland und hat einen Kopf voller Ideen. Wo sie herkommt, ist die Torte kein Nachtisch, sondern
              der Moment, in dem am Tisch alle kurz still werden. Genau dafür backt sie.
            </Reveal>
            <Reveal delay={0.2} as="p">
              Über die Jahre hat sie viel Erfahrung gesammelt und eine eigene Handschrift entwickelt: Schokoladen-Spitze, die
              Faden für Faden entsteht, Früchte, die einzeln ausgesucht werden, und Farben, die man so nicht kennt.
            </Reveal>
            <Reveal delay={0.26} as="p">
              Backen ist für Lora keine Arbeit, es ist ihre Passion. Deshalb sprichst du bei Loras Bakery immer direkt mit ihr:
              über deinen Anlass, deine Wünsche und die Idee, aus der deine Torte wird.
            </Reveal>
          </div>

          <ul className="mt-14 grid gap-x-8 gap-y-8 border-t border-choc/25 pt-8 sm:grid-cols-3">
            {pillars.map((x, i) => (
              <Reveal as="li" key={x.t} delay={0.1 + i * 0.08}>
                <p className="font-display text-[1.45rem] italic leading-snug text-berry">{x.t}</p>
                <p className="mt-2 text-[0.95rem] leading-[1.65] text-cocoa">{x.d}</p>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={0.2} className="mt-12 flex flex-wrap items-center gap-6">
            <a href="#anfrage" className="btn btn-primary">
              Erzähl Lora von deinem Anlass
            </a>
            <span className="relative inline-block">
              <Script lines={["Mit Liebe gebacken."]} className="text-[2.2rem] text-berry-deep" rotate={-3} />
              <Sketch d={arrows.underline} viewBox="0 0 260 10" className="absolute -bottom-1 left-0 h-3 w-full text-berry-deep" delay={1.4} />
            </span>
          </Reveal>
        </div>
      </div>
      <Ingredients items={ingredients} mobile={ingredientsMobile} amount={60} />
    </section>
  );
}
