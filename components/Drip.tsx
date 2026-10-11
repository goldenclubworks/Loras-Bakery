import InView from "./InView";

/**
 * Cremig-rosa Glasur, die oben an einem Abschnitt hängt und beim Einblenden nach unten läuft.
 * Eine glatte Fläche mit gerundeten Tropfen; Form ist fest (kein Zufall), damit Server und Client gleich rendern.
 */
const DROPS: [number, number][] = [[70, 46], [210, 74], [330, 38], [470, 88], [600, 52], [730, 70], [860, 40], [990, 96], [1110, 56], [1240, 80], [1370, 44], [1500, 66]];

function path() {
  const base = 26;
  let d = `M0 0 H1600 V${base}`;
  const sorted = [...DROPS].sort((a, b) => b[0] - a[0]);
  for (const [x, len] of sorted) {
    const w = 15;
    d += ` L${x + w + 22} ${base} C ${x + w + 8} ${base}, ${x + w} ${base + 4}, ${x + w} ${base + 14} V${base + len - w} a${w} ${w} 0 0 1 ${-2 * w} 0 V${base + 14} C ${x - w} ${base + 4}, ${x - w - 8} ${base}, ${x - w - 22} ${base}`;
  }
  return d + " L0 " + base + " Z";
}

export default function Drip({ className = "" }: { className?: string }) {
  return (
    <InView className={`pointer-events-none absolute inset-x-0 top-0 z-10 ${className}`} threshold={0.01} margin="0px 0px 0px 0px">
      <svg viewBox="0 0 1600 130" preserveAspectRatio="none" aria-hidden className="drip block h-[clamp(52px,7vw,110px)] w-full">
        <defs>
          <linearGradient id="drip-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f6d9d6" />
            <stop offset="0.7" stopColor="#ebc4c4" />
            <stop offset="1" stopColor="#d9a4a4" />
          </linearGradient>
        </defs>
        <path d={path()} fill="url(#drip-g)" />
        <path d="M0 6 H1600" stroke="#fff" strokeOpacity="0.55" strokeWidth="3" />
      </svg>
    </InView>
  );
}
