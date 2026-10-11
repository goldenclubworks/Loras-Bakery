"use server";

import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2, "Bitte gib deinen Namen an.").max(80),
  contact: z.string().trim().min(5, "Bitte gib E-Mail oder Telefon an.").max(120),
  occasion: z.string().trim().min(1, "Bitte wähle einen Anlass.").max(60),
  date: z.string().trim().min(1, "Bitte nenne dein Wunschdatum.").max(20),
  servings: z.coerce.number().int().min(4, "Mindestens 4 Portionen.").max(300),
  tier: z.string().trim().max(40).optional().default(""),
  style: z.string().trim().max(80).optional().default(""),
  message: z.string().trim().max(1500).optional().default(""),
  consent: z.literal("on", { message: "Bitte stimme der Datenverarbeitung zu." }),
  website: z.string().max(0).optional(), // honeypot
});

export type InquiryResult =
  | { ok: true; delivered: boolean }
  | { ok: false; errors: Record<string, string> };

export async function sendInquiry(formData: FormData): Promise<InquiryResult> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0] ?? "form")] ??= issue.message;
    return { ok: false, errors };
  }
  const d = parsed.data;

  const key = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_TO_EMAIL;
  const from = process.env.INQUIRY_FROM_EMAIL ?? "Loras Bakery <onboarding@resend.dev>";
  if (!key || !to) return { ok: true, delivered: false };

  const text = [
    `Name: ${d.name}`,
    `Kontakt: ${d.contact}`,
    `Anlass: ${d.occasion}`,
    `Wunschdatum: ${d.date}`,
    `Portionen: ${d.servings}`,
    `Richtung: ${d.tier || "-"}`,
    `Stil: ${d.style || "-"}`,
    "",
    d.message || "(keine Nachricht)",
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject: `Tortenanfrage von ${d.name}`, text }),
  });
  return { ok: true, delivered: res.ok };
}
