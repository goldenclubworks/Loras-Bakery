import type { CSSProperties } from "react";

/**
 * Die Taube aus dem Brand Board als Linienzeichnung. `hero` zeichnet sich per CSS beim Laden,
 * sonst wird sie vom umgebenden <InView> ausgelöst (Klasse .sketch).
 */
const strokes = [
  // Kopf, Schnabel, Auge
  "M40 70 C 38 58 50 50 60 55 C 68 60 66 72 58 78",
  "M40 70 L 17 76 L 40 79",
  "M52 64 L 52.5 64.5",
  // Rücken in den Flügel, Brust, Bauch
  "M62 58 C 80 60 98 66 112 74",
  "M46 82 C 56 100 84 110 112 105 C 140 100 164 88 186 76",
  // Flügel mit Federn
  "M104 76 C 94 50 100 24 130 4 C 130 24 142 38 158 42 C 164 26 182 14 210 10 C 206 38 190 66 164 84",
  "M130 4 C 126 32 122 56 120 80",
  "M158 42 C 152 58 146 72 142 86",
  "M184 26 C 178 46 172 64 164 82",
  // Schwanz
  "M186 76 C 202 80 220 94 234 114",
  "M184 70 C 204 70 222 76 238 88",
  "M176 82 C 190 92 202 106 212 124",
];

export default function Dove({
  className = "",
  stroke = "var(--blue)",
  width = 1.7,
  hero = false,
  delay = 0,
}: {
  className?: string;
  stroke?: string;
  width?: number;
  hero?: boolean;
  delay?: number;
}) {
  return (
    <svg viewBox="0 0 250 130" fill="none" aria-hidden className={className}>
      {strokes.map((d, i) => (
        <path
          key={i}
          d={d}
          pathLength={1}
          stroke={stroke}
          strokeWidth={width}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={hero ? "draw" : "sketch"}
          style={{ "--d": `${delay + i * 0.16}s`, "--t": "1.6s" } as CSSProperties}
        />
      ))}
    </svg>
  );
}
