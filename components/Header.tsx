"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";

const links = [
  { href: "#handschrift", label: "Handschrift" },
  { href: "#lora", label: "Lora" },
  { href: "#atelier", label: "Atelier" },
  { href: "#galerie", label: "Galerie" },
  { href: "#preise", label: "Preise" },
];

export default function Header() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("keydown", esc);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,padding,box-shadow] duration-500 ${
        solid || open ? "bg-cream/90 py-3.5 shadow-[0_1px_0_var(--line)] backdrop-blur-md" : "py-6"
      }`}
    >
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 md:px-10">
        <a href="#top" aria-label="Loras Bakery, zum Seitenanfang" onClick={() => setOpen(false)}>
          <Logo className="whitespace-nowrap text-[1.55rem] sm:text-[1.7rem]" />
        </a>

        <nav aria-label="Hauptnavigation" className="hidden items-center gap-10 lg:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="link-line pb-1 text-[0.72rem] font-normal uppercase tracking-[0.26em]">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a href="#anfrage" className="btn btn-primary max-sm:!hidden !px-5 !py-3">
            Torte anfragen
          </a>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center lg:hidden"
            aria-expanded={open}
            aria-controls="menu"
            aria-label={open ? "Menü schließen" : "Menü öffnen"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-3 w-6">
              <span className={`absolute left-0 top-0 h-px w-full bg-choc transition-transform duration-500 ${open ? "translate-y-[6px] rotate-45" : ""}`} />
              <span className={`absolute left-0 bottom-0 h-px w-full bg-choc transition-transform duration-500 ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>

      <div
        id="menu"
        className={`fixed inset-x-0 top-[66px] h-[calc(100svh-66px)] bg-cream px-6 pb-10 pt-8 transition-[opacity,visibility] duration-500 lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <nav aria-label="Mobile Navigation" className="flex h-full flex-col justify-between">
          <ul className="space-y-1">
            {links.map((l, i) => (
              <li key={l.href} style={{ transitionDelay: open ? `${i * 60}ms` : "0ms" }} className={`transition-all duration-700 ${open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
                <a href={l.href} onClick={() => setOpen(false)} className="font-display block border-b border-choc/15 py-4 text-[2.6rem] leading-none">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a href="#anfrage" onClick={() => setOpen(false)} className="btn btn-primary justify-center">
            Torte anfragen
          </a>
        </nav>
      </div>
    </header>
  );
}
