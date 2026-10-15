import type { CSSProperties } from "react";
import Image from "next/image";
import HeroStage from "../HeroStage";
import HeroGarnish, { Heart } from "../HeroGarnish";
import Ingredients, { type Ingredient } from "../Ingredients";
import LaceBand from "../LaceBand";
import Parallax from "../Parallax";
import HeroTitle from "../HeroTitle";
import { photos } from "@/lib/photos";

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

const ingredients: Ingredient[] = [
  { src: "raspberry-top", w: 104, x: 47, y: 9, depth: 0.9, rot: -14, spin: 36 },
  { src: "strawberry", w: 100, x: 90, y: 11, depth: 0.7, rot: 18, spin: 24 },
  { src: "currant-big", w: 66, x: 49, y: 77.25, depth: 0.5, rot: -8, spin: 14 },
  { src: "mint-leaf-b", w: 104, x: 86, y: 80, depth: 0.8, rot: 14, spin: 20 },
];

/** Mobil: klein, leicht transparent, gleiten vom Rand herein */
const ingredientsMobile: Ingredient[] = [
  { src: "raspberry-top", w: 52, x: 88, y: 17, rot: 14, o: 0.72 },
  { src: "currant-a", w: 44, x: 90, y: 46, rot: 22, o: 0.68 },
  { src: "mint-leaf-b", w: 62, x: 4, y: 7.75, rot: -18, o: 0.7, hideMd: true },
];

export default function Hero() {
  const hand = photos["hero-hand"];
  return (
    <section id="top" className="relative isolate overflow-x-clip">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{ background: "radial-gradient(60% 50% at 82% 32%, rgb(235 196 196 / 0.6), transparent 70%), radial-gradient(40% 40% at 4% 90%, rgb(92 184 177 / 0.12), transparent 70%), var(--cream)" }}
      />
      {/* nur Mobil: rosa Verlauf mit einem Band echter Spitze unter dem Header */}
      <div aria-hidden className="hero-top lg:hidden">
        <LaceBand eager className="hero-ribbon" />
      </div>
      <div className="mx-auto grid min-h-[100svh] max-w-[1500px] items-center gap-x-6 gap-y-24 px-5 pb-24 pt-[12.6rem] md:px-10 md:pt-[13.4rem] lg:grid-cols-12 lg:pb-16 lg:pt-28">
        <div className="relative z-10 lg:col-span-7">
          <HeroTitle />

          <p className="slide-in mt-16 text-[0.74rem] uppercase tracking-[0.42em] text-choc md:mt-20" style={d(1.0)}>
            Handmade Kuchen &amp; Torten
          </p>
          <p className="slide-in mt-9 max-w-[30rem] text-[1.12rem] leading-[1.7] text-cocoa" style={d(1.2)}>
            Mit Liebe gebacken. Einzigartige Torten mit handgespritzter Schokoladen-Spitze und frischen Früchten, für
            besondere Momente.
          </p>

          <div className="fade-in mt-11 flex flex-wrap items-center gap-4" style={d(1.45)}>
            <a href="#anfrage" className="btn btn-primary">
              Torte anfragen
              <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden>
                <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1" />
              </svg>
            </a>
            <a href="#galerie" className="btn btn-ghost">
              Galerie ansehen
            </a>
          </div>
        </div>

        <div className="relative lg:col-span-5">
          <Parallax speed={0.025}>
            <HeroStage>
              <HeroGarnish />
              <figure className="fade-in absolute -bottom-14 -left-3 z-20 w-[33%] rotate-[-4deg] bg-cream p-1.5 shadow-[var(--shadow-soft)] sm:-left-10" style={d(1.7)}>
                <Image
                  src={hand.src}
                  alt={hand.alt}
                  width={hand.w}
                  height={hand.h}
                  placeholder="blur"
                  blurDataURL={hand.blur}
                  sizes="(min-width: 1024px) 15vw, 34vw"
                  className="aspect-[4/5] w-full object-cover"
                  style={{ objectPosition: hand.pos }}
                />
                <Heart className="absolute -bottom-3 -right-2 h-9 w-10 text-rose" />
              </figure>
            </HeroStage>
          </Parallax>
        </div>
      </div>
      <Ingredients items={ingredients} mobile={ingredientsMobile} amount={70} className="fade-in" style={d(2.6)} eager />
    </section>
  );
}
