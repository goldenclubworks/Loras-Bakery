"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { sendInquiry } from "@/app/actions";
import { contact } from "@/lib/contact";
import { useInquiry } from "@/lib/store";
import LaceFence from "../LaceFence";
import Reveal from "../Reveal";
import Script from "../Script";
import Sketch, { arrows } from "../Sketch";

const tiers = ["Die Feine", "Die Signature", "Das Meisterstück", "Weiß ich noch nicht"];
const occasions = ["Geburtstag", "Hochzeit", "Jubiläum", "Taufe / Kommunion", "Weihnachten", "Firmenfeier", "Anderer Anlass"];

const schema = z.object({
  name: z.string().trim().min(2, "Bitte gib deinen Namen an."),
  contact: z.string().trim().min(5, "Bitte gib E-Mail oder Telefon an."),
  occasion: z.string().min(1, "Bitte wähle einen Anlass."),
  date: z.string().min(1, "Bitte nenne dein Wunschdatum."),
  servings: z.string().regex(/^\d+$/, "Bitte eine Zahl angeben.").refine((v) => Number(v) >= 4, "Mindestens 4 Portionen."),
  tier: z.string().max(40).optional(),
  style: z.string().max(80).optional(),
  message: z.string().max(1500).optional(),
  consent: z.boolean().refine((v) => v, "Bitte stimme der Datenverarbeitung zu."),
  website: z.string().max(0).optional(),
});
type Values = z.infer<typeof schema>;

const field =
  "w-full border border-choc/25 bg-cream px-4 py-3.5 text-[1rem] outline-none transition-all duration-300 placeholder:text-choc/35 focus:border-berry focus:bg-white focus:shadow-[0_0_0_3px_rgba(184,34,58,0.14)]";

export default function Inquiry() {
  const [pending, start] = useTransition();
  const [done, setDone] = useState<null | { delivered: boolean; summary: string }>(null);
  const [serverErr, setServerErr] = useState("");
  const style = useInquiry((s) => s.style);
  const tier = useInquiry((s) => s.tier);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { consent: false } });

  useEffect(() => {
    if (style) setValue("style", style);
  }, [style, setValue]);
  useEffect(() => {
    if (tier) setValue("tier", tier);
  }, [tier, setValue]);

  const onSubmit = (v: Values) => {
    setServerErr("");
    const fd = new FormData();
    Object.entries(v).forEach(([k, val]) => val !== undefined && fd.set(k, k === "consent" ? (val ? "on" : "") : String(val)));
    start(async () => {
      const res = await sendInquiry(fd);
      if (!res.ok) {
        setServerErr(Object.values(res.errors)[0] ?? "Das hat leider nicht geklappt.");
        return;
      }
      const summary = `Hallo Lora, ich möchte eine Torte anfragen.\n\nName: ${v.name}\nKontakt: ${v.contact}\nAnlass: ${v.occasion}\nWunschdatum: ${v.date}\nPortionen: ${v.servings}\nRichtung: ${v.tier || "-"}\nStil: ${v.style || "-"}\n\n${v.message ?? ""}`;
      setDone({ delivered: res.delivered, summary });
    });
  };

  return (
    <section className="relative overflow-x-clip bg-paper py-28 lg:py-40">
      <LaceFence tone="blush" />
      <div className="mx-auto grid max-w-[1500px] gap-16 px-5 md:grid-cols-12 md:px-10">
        <div className="md:col-span-5">
          <Reveal>
            <p className="eyebrow">Anfrage</p>
          </Reveal>
          <Reveal as="h2" delay={0.08} className="font-display mt-6 text-[clamp(2.6rem,5.4vw,5rem)] leading-[0.98]">
            Erzähl uns von deinem <em className="text-berry">Anlass.</em>
          </Reveal>
          <div className="mt-6 hidden items-end gap-2 md:flex">
            <Script lines={["Schreib mir einfach."]} className="text-[2.1rem] text-berry" rotate={-4} delay={0.5} />
            <Sketch d={arrows.curveRight} viewBox="0 0 90 60" className="h-12 w-20 text-berry" delay={1.8} />
          </div>
          <Reveal delay={0.16} className="mt-6 max-w-[40ch] text-[1.08rem] text-cocoa">
            Je mehr du uns verrätst, desto genauer wird das Angebot. Die Anfrage ist unverbindlich.
          </Reveal>
          <Reveal delay={0.22} className="mt-8 space-y-2 text-cocoa">
            {contact.email && (
              <p>
                E-Mail: <a className="underline underline-offset-4" href={`mailto:${contact.email}`}>{contact.email}</a>
              </p>
            )}
            {contact.whatsapp && (
              <p>
                WhatsApp: <a className="underline underline-offset-4" href={`https://wa.me/${contact.whatsapp}`}>Nachricht schreiben</a>
              </p>
            )}
          </Reveal>
        </div>

        <Reveal className="md:col-span-7" delay={0.1}>
          {done ? (
            <div className="bg-cream p-8 shadow-[var(--shadow-soft)] md:p-12" role="status">
              <p className="font-display text-4xl">Danke dir!</p>
              <p className="mt-4 max-w-[46ch] text-cocoa">
                {done.delivered
                  ? "Deine Anfrage ist angekommen. Wir melden uns so bald wie möglich bei dir."
                  : "Deine Anfrage ist vorbereitet. Schick sie jetzt noch kurz ab, damit sie bei uns ankommt:"}
              </p>
              {!done.delivered && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {contact.whatsapp && (
                    <a className="btn btn-primary" href={`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(done.summary)}`}>
                      Per WhatsApp senden
                    </a>
                  )}
                  {contact.email && (
                    <a
                      className="btn btn-ghost"
                      href={`mailto:${contact.email}?subject=${encodeURIComponent("Tortenanfrage")}&body=${encodeURIComponent(done.summary)}`}
                    >
                      Per E-Mail senden
                    </a>
                  )}
                  {!contact.whatsapp && !contact.email && (
                    <p className="bg-berry/10 p-4 text-sm text-berry-deep">
                      Versand ist noch nicht eingerichtet (Kontaktdaten und Mail-Dienst fehlen in der Konfiguration).
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="relative grid gap-5 overflow-hidden bg-cream p-6 pt-14 shadow-[var(--shadow-soft)] sm:grid-cols-2 md:p-10 md:pt-16"
            >
              <div aria-hidden className="lace-trim lace-trim-choc lace-trim-top" style={{ top: 0, ["--lt" as string]: "34px" }} />
              <label className="block">
                <span className="mb-1.5 block text-[0.7rem] font-normal uppercase tracking-[0.24em]">Name</span>
                <input className={field} autoComplete="name" {...register("name")} aria-invalid={!!errors.name} />
                {errors.name && <span className="mt-1 block text-sm text-berry">{errors.name.message}</span>}
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[0.7rem] font-normal uppercase tracking-[0.24em]">E-Mail oder Telefon</span>
                <input className={field} autoComplete="email" {...register("contact")} aria-invalid={!!errors.contact} />
                {errors.contact && <span className="mt-1 block text-sm text-berry">{errors.contact.message}</span>}
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[0.7rem] font-normal uppercase tracking-[0.24em]">Anlass</span>
                <select className={field} defaultValue="" {...register("occasion")} aria-invalid={!!errors.occasion}>
                  <option value="" disabled>
                    Bitte wählen
                  </option>
                  {occasions.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
                {errors.occasion && <span className="mt-1 block text-sm text-berry">{errors.occasion.message}</span>}
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[0.7rem] font-normal uppercase tracking-[0.24em]">Wunschdatum</span>
                <input type="date" className={field} {...register("date")} aria-invalid={!!errors.date} />
                {errors.date && <span className="mt-1 block text-sm text-berry">{errors.date.message}</span>}
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[0.7rem] font-normal uppercase tracking-[0.24em]">Portionen</span>
                <input inputMode="numeric" placeholder="z. B. 16" className={field} {...register("servings")} aria-invalid={!!errors.servings} />
                {errors.servings && <span className="mt-1 block text-sm text-berry">{errors.servings.message}</span>}
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[0.7rem] font-normal uppercase tracking-[0.24em]">Richtung (optional)</span>
                <select className={field} defaultValue="" {...register("tier")}>
                  <option value="">Bitte wählen</option>
                  {tiers.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[0.7rem] font-normal uppercase tracking-[0.24em]">Stil (optional)</span>
                <input placeholder="z. B. Atelier-Spitze" className={field} {...register("style")} />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[0.7rem] font-normal uppercase tracking-[0.24em]">Deine Wünsche (optional)</span>
                <textarea
                  rows={4}
                  className={field}
                  placeholder="Geschmack, Farben, Allergien, Inspiration …"
                  {...register("message")}
                />
              </label>
              {/* honeypot: hidden from people, irresistible to bots */}
              <input tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px]" {...register("website")} />

              <label className="flex items-start gap-3 sm:col-span-2">
                <input type="checkbox" className="mt-1.5 h-4 w-4 accent-[var(--berry)]" {...register("consent")} />
                <span className="text-sm text-cocoa">
                  Ich bin einverstanden, dass meine Angaben zur Bearbeitung der Anfrage verarbeitet werden.
                </span>
              </label>
              {errors.consent && <span className="-mt-3 text-sm text-berry sm:col-span-2">{errors.consent.message}</span>}
              {serverErr && <p className="text-sm text-berry sm:col-span-2" role="alert">{serverErr}</p>}

              <div className="sm:col-span-2">
                <button type="submit" disabled={pending} className="btn btn-primary w-full justify-center disabled:opacity-60 sm:w-auto">
                  {pending ? "Wird gesendet …" : "Anfrage senden"}
                </button>
              </div>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
