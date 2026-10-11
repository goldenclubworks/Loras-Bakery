import type { CSSProperties } from "react";
import InView from "./InView";

/** Handgezeichnete Linie (Pfeil, Unterstreichung, Herz …), die sich beim Einblenden zeichnet. */
export default function Sketch({
  d,
  viewBox,
  className = "",
  stroke = "currentColor",
  width = 1.6,
  delay = 0,
  duration = 1.4,
  style,
}: {
  d: string | string[];
  viewBox: string;
  className?: string;
  stroke?: string;
  width?: number;
  delay?: number;
  duration?: number;
  style?: CSSProperties;
}) {
  const paths = Array.isArray(d) ? d : [d];
  return (
    <InView as="span" className={`block ${className}`} style={style} threshold={0.5}>
      <svg viewBox={viewBox} fill="none" aria-hidden className="h-full w-full overflow-visible">
        {paths.map((p, i) => (
          <path
            key={i}
            d={p}
            pathLength={1}
            stroke={stroke}
            strokeWidth={width}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="sketch"
            style={{ "--d": `${delay + i * duration * 0.55}s`, "--t": `${duration}s` } as CSSProperties}
          />
        ))}
      </svg>
    </InView>
  );
}

/** Fertige Motive, die auf mehreren Seiten gebraucht werden. */
export const arrows = {
  /** Bogen von links oben nach rechts unten, Pfeilspitze am Ende */
  curveDown: ["M4 6 C 28 2, 62 14, 70 52", "M60 42 L70 54 L80 40"],
  /** Bogen von rechts oben nach links unten */
  curveDownLeft: ["M76 6 C 52 2, 18 14, 10 52", "M20 42 L10 54 L0 40"],
  /** Bogen nach rechts */
  curveRight: ["M4 40 C 22 6, 56 4, 84 30", "M72 22 L86 32 L70 40"],
  underline: ["M2 8 C 40 2, 90 12, 150 5 S 220 6 258 4"],
  heart: ["M20 34 C 4 22, 6 6, 18 6 C 24 6, 28 10, 30 14 C 32 10, 36 6, 42 6 C 54 6, 56 22, 40 34 C 34 40, 26 40, 20 34 Z"],
};
