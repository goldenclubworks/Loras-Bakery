import { contact } from "@/lib/contact";
import ClearOnScroll from "./ClearOnScroll";
import Dove from "./Dove";
import InView from "./InView";
import LaceFence from "./LaceFence";
import Script from "./Script";

export default function Footer() {
  return (
    <footer className="relative bg-plum text-cream">
      <LaceFence tone="blush" />
      <div className="mx-auto grid max-w-[1500px] gap-14 px-5 pb-10 pt-24 md:grid-cols-12 md:px-10 md:pt-32">
        <div className="md:col-span-7">
          <ClearOnScroll>
            <p className="font-display text-[clamp(3.6rem,10vw,9rem)] leading-[0.86]">
              Loras
              <br />
              <em className="ml-[0.3em] text-rose">Bakery</em>
            </p>
          </ClearOnScroll>
          <p className="mt-8 text-[0.72rem] uppercase tracking-[0.34em] text-cream/70">Handmade Kuchen &amp; Torten</p>
        </div>
        <div className="relative md:col-span-5 md:pt-6">
          <Script lines={["Kleine Momente,", "großes Glück."]} className="text-[clamp(2.4rem,4.4vw,3.8rem)] text-blush" rotate={-4} />
          <InView className="mt-6 w-[170px]">
            <Dove className="w-full opacity-90" stroke="var(--blush)" />
          </InView>
          <nav aria-label="Fußnavigation" className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-[0.72rem] uppercase tracking-[0.26em] text-cream/80">
            <a href="#lora" className="link-line hover:text-cream">Lora</a>
            <a href="#galerie" className="link-line hover:text-cream">Galerie</a>
            <a href="#anfrage" className="link-line hover:text-cream">Anfrage</a>
            {contact.instagram && (
              <a href={contact.instagram} className="link-line hover:text-cream" rel="noopener">Instagram</a>
            )}
            <a href="/impressum" className="link-line hover:text-cream">Impressum</a>
            <a href="/datenschutz" className="link-line hover:text-cream">Datenschutz</a>
          </nav>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1500px] items-center gap-6 px-5 pb-8 text-[0.68rem] uppercase tracking-[0.3em] text-cream/55 md:px-10">
        <span>Loras Bakery</span>
        <span aria-hidden className="h-px flex-1 bg-cream/20" />
        <span>Seit 2024</span>
      </div>
    </footer>
  );
}
