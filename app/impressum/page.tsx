import type { Metadata } from "next";
import LegalShell from "@/components/LegalShell";
import Ph from "@/components/Ph";

export const metadata: Metadata = { title: "Impressum – Loras Bakery" };

export default function Impressum() {
  return (
    <LegalShell title="Impressum">
      <section>
        <h2>Angaben gemäß § 5 DDG</h2>
        <p>
          <Ph>Vor- und Nachname bzw. Firmenname laut Gewerbeanmeldung</Ph>
          <br />
          Loras Bakery
          <br />
          <Ph>Straße und Hausnummer</Ph>
          <br />
          <Ph>PLZ und Ort</Ph>
        </p>
      </section>

      <section>
        <h2>Kontakt</h2>
        <p>
          Telefon: <Ph>Telefonnummer</Ph>
          <br />
          E-Mail: <Ph>E-Mail-Adresse</Ph>
        </p>
      </section>

      <section>
        <h2>Umsatzsteuer</h2>
        <p>
          <Ph>Entweder: Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: DE…</Ph>
        </p>
        <p>
          <Ph>
            Oder, falls Kleinunternehmerin: „Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.“
          </Ph>
        </p>
      </section>

      <section>
        <h2>Aufsichtsbehörde / Gewerbeaufsicht</h2>
        <p>
          <Ph>Zuständiges Ordnungs- bzw. Gewerbeamt und Lebensmittelüberwachung (falls anzugeben)</Ph>
        </p>
      </section>

      <section>
        <h2>Verantwortlich für den Inhalt (§ 18 Abs. 2 MStV)</h2>
        <p>
          <Ph>Name und Anschrift wie oben, falls abweichend bitte angeben</Ph>
        </p>
      </section>

      <section>
        <h2>Streitbeilegung</h2>
        <p>
          Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen. <Ph>Formulierung bei rechtlicher Prüfung bestätigen</Ph>
        </p>
      </section>

      <section>
        <h2>Haftung für Inhalte und Links</h2>
        <p>
          Die Inhalte dieser Seite wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und
          Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Für Inhalte externer Links sind ausschließlich
          deren Betreiber verantwortlich. Bei Bekanntwerden von Rechtsverletzungen entfernen wir entsprechende Links
          umgehend.
        </p>
      </section>

      <section>
        <h2>Bildnachweis</h2>
        <p>
          Alle Torten- und Portraitfotos stammen von Loras Bakery. <Ph>Falls Fotos von Dritten verwendet werden: Urheber ergänzen</Ph>
        </p>
      </section>
    </LegalShell>
  );
}
