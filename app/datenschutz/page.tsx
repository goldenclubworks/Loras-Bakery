import type { Metadata } from "next";
import LegalShell from "@/components/LegalShell";
import Ph from "@/components/Ph";

export const metadata: Metadata = { title: "Datenschutzerklärung – Loras Bakery" };

export default function Datenschutz() {
  return (
    <LegalShell title="Datenschutzerklärung">
      <section>
        <h2>1. Verantwortliche</h2>
        <p>
          Verantwortlich für die Datenverarbeitung auf dieser Website ist:
          <br />
          <Ph>Name, Anschrift und E-Mail wie im Impressum</Ph>
        </p>
      </section>

      <section>
        <h2>2. Hosting und Server-Logfiles</h2>
        <p>
          Diese Website wird bei <Ph>Hosting-Anbieter, z. B. Vercel Inc. / Netlify / Hetzner, mit Sitz und Serverstandort</Ph>{" "}
          gehostet. Beim Aufruf der Seite werden automatisch technisch notwendige Daten verarbeitet (IP-Adresse, Datum und
          Uhrzeit, aufgerufene Seite, Browsertyp). Das ist erforderlich, um die Seite auszuliefern und sicher zu betreiben
          (Art. 6 Abs. 1 lit. f DSGVO). Die Logfiles werden nach <Ph>Speicherdauer laut Hosting-Anbieter, z. B. 7 Tage</Ph> gelöscht.
        </p>
        <p>
          Mit dem Hosting-Anbieter besteht ein Vertrag zur Auftragsverarbeitung. <Ph>AV-Vertrag abschließen und bestätigen</Ph>
        </p>
      </section>

      <section>
        <h2>3. Anfrageformular</h2>
        <p>
          Wenn du das Anfrageformular nutzt, verarbeiten wir die Angaben, die du eingibst: Name, E-Mail oder Telefon, Anlass,
          Wunschdatum, Portionen, Stil, Kategorie und deine Nachricht. Wir nutzen sie ausschließlich, um deine Anfrage zu
          beantworten und ein Angebot zu erstellen (Art. 6 Abs. 1 lit. b DSGVO, vorvertragliche Maßnahmen).
        </p>
        <p>
          Zum Versand der Anfrage per E-Mail nutzen wir den Dienst <Ph>Resend (Resend, Inc., USA) bzw. den tatsächlich eingesetzten Anbieter</Ph>.
          Dabei kann eine Übermittlung in Drittländer stattfinden. <Ph>Rechtsgrundlage, z. B. EU-US Data Privacy Framework oder Standardvertragsklauseln, prüfen und angeben</Ph>
        </p>
        <p>
          Wir löschen deine Daten, sobald deine Anfrage erledigt ist und keine gesetzlichen Aufbewahrungspflichten
          bestehen, spätestens nach <Ph>Löschfrist, z. B. 12 Monate</Ph>.
        </p>
      </section>

      <section>
        <h2>4. Kontakt per WhatsApp oder E-Mail</h2>
        <p>
          Wenn du uns über einen Link auf dieser Seite per WhatsApp oder E-Mail schreibst, werden deine Nachricht und deine
          Kontaktdaten bei uns und beim jeweiligen Anbieter verarbeitet. Bei WhatsApp gelten zusätzlich die
          Datenschutzbestimmungen von WhatsApp Ireland Ltd. Es wird erst Kontakt hergestellt, wenn du den Link anklickst.
          <Ph>Nur aufnehmen, wenn WhatsApp tatsächlich genutzt wird</Ph>
        </p>
      </section>

      <section>
        <h2>5. Schriftarten</h2>
        <p>
          Die verwendeten Schriftarten werden von unserem eigenen Server ausgeliefert. Es findet keine Verbindung zu Servern
          von Google statt.
        </p>
      </section>

      <section>
        <h2>6. Cookies und Tracking</h2>
        <p>
          Diese Website setzt keine Tracking- oder Marketing-Cookies und verwendet keine Analyse-Tools.{" "}
          <Ph>Aktualisieren, falls später Analyse oder Einbindungen wie Instagram hinzukommen</Ph>
        </p>
      </section>

      <section>
        <h2>7. Externe Links</h2>
        <p>
          Wenn du auf einen Link zu externen Seiten klickst (z. B. Instagram), verlässt du diese Website. Für deren
          Datenverarbeitung ist der jeweilige Anbieter verantwortlich.
        </p>
      </section>

      <section>
        <h2>8. Deine Rechte</h2>
        <p>Du hast das Recht auf:</p>
        <ul>
          <li>Auskunft über die zu dir gespeicherten Daten (Art. 15 DSGVO)</li>
          <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
          <li>Löschung (Art. 17 DSGVO) und Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
          <li>Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)</li>
        </ul>
        <p>
          Schreib uns dafür einfach an <Ph>E-Mail-Adresse</Ph>.
        </p>
      </section>

      <section>
        <h2>9. Beschwerderecht</h2>
        <p>
          Du kannst dich bei einer Datenschutz-Aufsichtsbehörde beschweren. Zuständig ist{" "}
          <Ph>Landesdatenschutzbehörde des Bundeslandes des Firmensitzes</Ph>.
        </p>
      </section>

      <section>
        <h2>10. Stand</h2>
        <p>
          <Ph>Datum der letzten Aktualisierung</Ph>
        </p>
      </section>
    </LegalShell>
  );
}
