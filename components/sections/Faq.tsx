import Divider from "../Divider";
import Reveal from "../Reveal";
import Script from "../Script";

const faqs = [
  {
    q: "Wie früh sollte ich anfragen?",
    a: "So früh wie möglich. Nenne in der Anfrage dein Wunschdatum, dann bestätigen wir dir zeitnah, ob es klappt.",
  },
  {
    q: "Kann ich einen eigenen Wunsch oder ein Motiv mitbringen?",
    a: "Ja. Schick uns Fotos oder Ideen, wir sprechen Machbarkeit, Aufwand und Preis offen mit dir durch.",
  },
  {
    q: "Was ist mit Allergien und Unverträglichkeiten?",
    a: "Bitte gib sie direkt in der Anfrage an. Wir besprechen dann gemeinsam, was möglich ist und welche Zutaten verwendet werden.",
  },
  {
    q: "Wie bekomme ich meine Torte?",
    a: "Abholung oder Lieferung vereinbaren wir persönlich mit dir, passend zu Ort und Zeitpunkt deiner Feier.",
  },
  {
    q: "Wann zahle ich?",
    a: "Preis und Zahlungsweise stehen im Angebot, bevor etwas gebacken wird. Du weißt also immer, woran du bist.",
  },
];

export default function Faq() {
  return (
    <section id="faq" className="relative bg-cream py-28 lg:py-36">
      <Divider className="absolute inset-x-5 top-0 md:inset-x-10" />
      <div className="mx-auto grid max-w-[1200px] gap-12 px-5 md:grid-cols-12 md:px-10">
        <div className="md:col-span-4">
          <Reveal>
            <p className="eyebrow">Gut zu wissen</p>
          </Reveal>
          <Reveal as="h2" delay={0.08} className="font-display mt-6 text-[clamp(2.4rem,4.4vw,4rem)] leading-[1]">
            Häufige <em className="text-berry">Fragen.</em>
          </Reveal>
          <div className="mt-8 hidden md:block">
            <Script lines={["noch Fragen?", "frag Lora einfach."]} className="text-[2rem] text-berry" rotate={-4} delay={0.4} step={0.9} />
          </div>
        </div>
        <div className="md:col-span-8">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.05}>
              <details className="group border-b border-choc/15 py-6 first:border-t">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-[1.45rem] marker:hidden">
                  {f.q}
                  <span className="grid h-10 w-10 shrink-0 place-items-center transition-transform duration-500 [transition-timing-function:var(--ease-out)] group-open:rotate-[135deg]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/ingredients/currant-b.webp" alt="" width={72} height={70} className="h-8 w-8" draggable={false} />
                  </span>
                </summary>
                <p className="mt-4 max-w-[60ch] text-cocoa">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
