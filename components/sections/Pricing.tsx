"use client";

import { useInquiry } from "@/lib/store";
import Drip from "../Drip";
import Reveal from "../Reveal";

/**
 * No prices on purpose: three directions that signal effort and level, a clear "what moves the price"
 * list, and a no-risk exit. The real figure always comes with the personal offer.
 */
const tiers = [
  {
    id: "Die Feine",
    kicker: "Der charmante Einstieg",
    lead: "Für den Geburtstag im kleinen Kreis, den Kaffeetisch, das Dankeschön.",
    items: ["Einstöckig, frische Sahne", "Beeren oder Früchte", "Handgespritzte Details"],
    level: 1,
  },
  {
    id: "Die Signature",
    kicker: "Lora empfiehlt",
    lead: "Hier siehst du meine Handschrift. Für Feste, bei denen alle fragen: „Woher ist die?“",
    items: ["Schokoladen-Spitze oder Drip", "Macarons, Windbeutel, Beeren-Krone", "Dein Farb- und Motivwunsch"],
    level: 2,
    featured: true,
  },
  {
    id: "Das Meisterstück",
    kicker: "Maßanfertigung",
    lead: "Für die Feier, über die man noch in zehn Jahren spricht. Hochzeit, Jubiläum, großes Fest.",
    items: ["Mehrstöckig, nach deinem Entwurf", "Figuren, Motive, Sonderwünsche", "Persönliche Abstimmung von A bis Z"],
    level: 3,
  },
];

const movers = ["Größe und Portionen", "Anzahl der Etagen", "Aufwand der Deko", "Motive, Figuren, Sonderwünsche", "Saison-Zutaten"];

function Level({ n, light }: { n: number; light?: boolean }) {
  return (
    <span className="flex items-center gap-1.5" role="img" aria-label={`Aufwand ${n} von 3`}>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={`h-2.5 w-2.5 rounded-full ${i <= n ? (light ? "bg-berry" : "bg-gold") : light ? "bg-choc/15" : "bg-ivory/20"}`}
        />
      ))}
    </span>
  );
}

export default function Pricing() {
  const setTier = useInquiry((s) => s.setTier);
  return (
    <section id="preise" className="relative bg-plum py-28 text-cream lg:py-40">
      <Drip />
      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        <div className="mx-auto max-w-[760px] text-center">
          <Reveal>
            <p className="eyebrow !text-rose">Preisorientierung</p>
          </Reveal>
          <Reveal as="h2" delay={0.08} className="font-display mt-6 text-[clamp(2.6rem,5.4vw,5rem)] leading-[0.98]">
            Starte beim Anlass, <em className="text-rose">nicht beim Preis.</em>
          </Reveal>
          <Reveal delay={0.16} className="mt-6 text-[1.1rem] text-ivory/75">
            Jede Torte ist ein Unikat, deshalb gibt es bei mir keine Preisliste von der Stange. Such dir die Richtung aus,
            die zu deinem Fest passt. Dein persönliches Angebot bekommst du, bevor irgendetwas gebacken wird.
          </Reveal>
        </div>

        <ul className="mt-16 grid items-stretch gap-6 lg:grid-cols-3">
          {tiers.map((t, i) => (
            <Reveal
              as="li"
              key={t.id}
              delay={i * 0.09}
              className={`relative flex flex-col rounded-none p-7 md:p-9 ${
                t.featured
                  ? "bg-cream text-choc shadow-[0_40px_70px_-30px_rgba(0,0,0,0.7)] lg:-my-4 lg:py-12"
                  : "border border-ivory/15 bg-ivory/[0.04]"
              }`}
            >
              <p className={`eyebrow ${t.featured ? "!text-berry" : "!text-rose"}`}>{t.kicker}</p>
              <h3 className="font-display mt-4 text-[2.2rem] leading-none">{t.id}</h3>
              <p className={`mt-4 ${t.featured ? "text-cocoa" : "text-ivory/75"}`}>{t.lead}</p>
              <ul className="mt-6 space-y-2.5 text-[0.98rem]">
                {t.items.map((it) => (
                  <li key={it} className="flex gap-3">
                    <span aria-hidden className={`mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full ${t.featured ? "bg-berry" : "bg-gold"}`} />
                    {it}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex items-center justify-between border-t border-current/15 pt-5 text-sm">
                <span className={t.featured ? "text-cocoa" : "text-ivory/60"}>Aufwand &amp; Level</span>
                <Level n={t.level} light={t.featured} />
              </div>
              <a
                href="#anfrage"
                onClick={() => setTier(t.id)}
                className={`btn mt-6 justify-center ${t.featured ? "btn-primary" : "btn-light"}`}
              >
                Dazu unverbindlich anfragen
              </a>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={0.1} className="mx-auto mt-20 max-w-[860px] text-center">
          <p className="font-display text-[1.7rem]">Was den Preis bewegt</p>
          <ul className="mt-6 flex flex-wrap justify-center gap-2.5">
            {movers.map((m) => (
              <li key={m} className="border border-ivory/25 px-4 py-2 text-[0.95rem] text-ivory/85">
                {m}
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-8 max-w-[52ch] text-ivory/70">
            Alles davon steht offen in deinem Angebot. Keine versteckten Posten, keine Überraschung an der Kasse.
          </p>
          <p className="mt-6 inline-flex items-center gap-3 bg-ivory/10 px-5 py-3 text-[0.98rem]">
            <span aria-hidden className="text-gold">✓</span>
            Angebot ansehen. Nein sagen, wenn es nicht passt. Kostet dich nichts.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
