import Link from "next/link";

export default function LegalShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-choc/10">
        <div className="mx-auto flex max-w-[860px] items-center justify-between px-5 py-6 md:px-10">
          <Link href="/" className="font-display text-2xl tracking-tight">
            Loras <em className="text-berry">Bakery</em>
          </Link>
          <Link href="/" className="text-sm font-medium underline underline-offset-4">
            Zurück zur Startseite
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-[860px] px-5 py-16 md:px-10 md:py-24">
        <h1 className="font-display text-[clamp(2.4rem,6vw,4rem)] leading-none">{title}</h1>
        <p className="mt-6 border border-rose/40 bg-rose/10 p-4 text-sm text-cocoa">
          <strong>Entwurf mit Platzhaltern.</strong> Alle markierten Stellen müssen vor dem Livegang ausgefüllt werden. Die
          Texte sind eine Arbeitsgrundlage und ersetzen keine Rechtsberatung. Bitte vor Veröffentlichung rechtlich
          prüfen lassen (z. B. über einen Generator wie eRecht24 oder eine Anwältin).
        </p>
        <div className="legal mt-12 space-y-10 text-[1.02rem] leading-[1.75] text-choc/90">{children}</div>
      </main>
    </div>
  );
}
