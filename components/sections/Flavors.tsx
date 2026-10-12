import Image from "next/image";
import { photos, type PhotoId } from "@/lib/photos";
import Ph from "../Ph";
import Reveal from "../Reveal";
import Script from "../Script";
import Ingredients from "../Ingredients";

/**
 * Flavours are read off the photos (layers, fillings, toppings) and still need Lora's confirmation.
 */
const flavors: { photo: PhotoId; name: string; text: string; pos?: string }[] = [
  {
    photo: "choc-two-tier",
    name: "Dunkle Schokolade & Beeren",
    text: "Kräftiger Schoko-Biskuit, leichte Creme, dazu Himbeeren, Brombeeren und Heidelbeeren. Der Klassiker.",
  },
  {
    photo: "cream-roses",
    name: "Vanille & Beeren",
    text: "Heller Biskuit, leichte Sahne, Erdbeeren und Himbeeren. Frisch, fruchtig, nicht zu süß.",
  },
  {
    photo: "slice-table",
    name: "Bunt fürs Kinderfest",
    text: "Farbige Biskuit-Schichten mit Beeren-Creme. Sieht aus wie Magie, schmeckt nach Geburtstag.",
    pos: "26% 66%",
  },
  {
    photo: "drip-roses",
    name: "Ganache & rote Früchte",
    text: "Dunkle Ganache, frische Beeren und Schokoladen-Splitter auf heller Creme.",
  },
];

export default function Flavors() {
  return (
    <section id="geschmack" className="relative isolate overflow-x-clip bg-paper py-28 lg:py-40">
      <div className="mx-auto max-w-[1500px] px-5 md:px-10">
        <Reveal>
          <p className="eyebrow">Geschmack</p>
        </Reveal>
        <Reveal as="h2" delay={0.08} className="font-display mt-6 max-w-[18ch] text-[clamp(2.6rem,5.4vw,5rem)] leading-[0.98]">
          Schön ansehen ist die <em className="text-berry">halbe Miete.</em>
        </Reveal>
        <Reveal delay={0.14} className="mt-7 max-w-[52ch] text-[1.1rem] leading-[1.75] text-cocoa">
          Die andere Hälfte ist der Biss. Hier ein Auszug dessen, was bei mir aus dem Ofen und aus der Küche kommt.
        </Reveal>

        <ul className="mt-16 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {flavors.map((f, i) => {
            const p = photos[f.photo];
            return (
              <Reveal as="li" key={f.name} delay={i * 0.07} className={`group ${i % 2 ? "lg:mt-14" : ""}`}>
                <div className="relative overflow-hidden bg-blush">
                  <Image
                    src={p.src}
                    alt={p.alt}
                    width={p.w}
                    height={p.h}
                    placeholder="blur"
                    blurDataURL={p.blur}
                    sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                    style={{ objectPosition: f.pos ?? p.pos }}
                    className="aspect-[4/5] w-full object-cover transition-transform duration-[1400ms] [transition-timing-function:var(--ease-out)] group-hover:scale-[1.06]"
                  />
                <div aria-hidden className="lace-trim" style={{ bottom: 0, ["--lt" as string]: "46px" }} />
                </div>
                <div className="mt-5 flex items-center gap-4 text-[0.7rem] uppercase tracking-[0.3em] text-rose">
                  0{i + 1}
                  {i === 0 && <Script lines={["mein Favorit"]} className="text-[1.5rem] normal-case tracking-normal text-berry" rotate={-4} delay={0.6} />}
                </div>
                <h3 className="font-display mt-1 text-[1.75rem] leading-tight">{f.name}</h3>
                <p className="mt-2 text-cocoa">{f.text}</p>
              </Reveal>
            );
          })}
        </ul>

        <Reveal delay={0.1} className="mt-20 flex flex-col gap-6 border-y border-choc/25 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-[1.8rem]">Du hast einen Lieblingsgeschmack im Kopf?</p>
            <p className="mt-1 text-cocoa">Schreib ihn in die Anfrage. Wir finden einen Weg.</p>
            <p className="mt-3 text-sm">
              <Ph>Lora: Sortenliste prüfen und ergänzen, Allergene und Sonderwünsche (laktosefrei, glutenfrei …) angeben</Ph>
            </p>
          </div>
          <a href="#anfrage" className="btn btn-primary shrink-0">
            Wunschgeschmack nennen
          </a>
        </Reveal>
      </div>
      <Ingredients
        items={[
          { src: "currant-a", w: 72, x: 93, y: 12, depth: 0.5, rot: 18, spin: 20 },
          { src: "raspberry-side", w: 92, x: 72, y: 11, depth: 0.7, rot: -16, spin: 24 },
          { src: "sprinkles", w: 120, x: 53, y: 40, depth: 0.5, rot: 8, spin: 12 },
        ]}
        mobile={[
          { src: "currant-a", w: 40, x: 88, y: 3.75, rot: 18, o: 0.66 },
          { src: "sprinkles", w: 62, x: 58, y: 2, rot: 8, o: 0.7 },
          { src: "raspberry-side", w: 46, x: 88, y: 47.75, rot: -16, o: 0.64 },
          { src: "mint-leaf-b", w: 52, x: 3, y: 96.25, rot: -18, o: 0.6 },
        ]}
        amount={50}
      />
    </section>
  );
}
