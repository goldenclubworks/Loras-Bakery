/**
 * Kurzer Auftakt beim ersten Besuch: "Loras Bakery" wird in Schokolade gespritzt, dann hebt sich der Vorhang mit
 * Spitzensaum auf den Hero. Reines CSS (kein JS im kritischen Pfad), nur einmal pro Sitzung, bei reduzierter
 * Bewegung entfällt er. Die Seite liegt die ganze Zeit darunter, nichts wird blockiert.
 */
export default function Preloader() {
  return (
    <div className="preloader" aria-hidden>
      <div className="preloader-inner">
        <svg viewBox="0 0 700 170" className="preloader-svg" overflow="visible">
          <defs>
            <linearGradient id="pre-fill" x1="0" x2="1">
              <stop offset="0" stopColor="#f7efe6" />
              <stop offset="0.55" stopColor="#ebc4c4" />
              <stop offset="1" stopColor="#c9727a" />
            </linearGradient>
          </defs>
          <text x="350" y="118" textAnchor="middle" className="pre-text pre-draw">
            Loras <tspan fontStyle="italic">Bakery</tspan>
          </text>
          <text x="350" y="118" textAnchor="middle" className="pre-text pre-fill">
            Loras <tspan fontStyle="italic">Bakery</tspan>
          </text>
        </svg>
        <p className="preloader-label">Handmade Kuchen &amp; Torten</p>
      </div>
      <div className="preloader-hem" />
    </div>
  );
}
