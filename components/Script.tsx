import type { CSSProperties } from "react";
import InView from "./InView";

/**
 * Lora's Handschrift: schreibt sich zeilenweise von links nach rechts auf, sobald sie sichtbar wird.
 * `lines` getrennt, damit jede Zeile nacheinander geschrieben wird (wie von Hand).
 */
export default function Script({
  lines,
  className = "",
  rotate = 0,
  delay = 0,
  step = 1.1,
  duration,
  style,
  immediate = false,
}: {
  lines: string[];
  className?: string;
  rotate?: number;
  delay?: number;
  /** Pause zwischen den Zeilen in Sekunden */
  step?: number;
  duration?: number;
  style?: CSSProperties;
  /** ohne Sichtbarkeits-Trigger sofort schreiben (Hero) */
  immediate?: boolean;
}) {
  const body = lines.map((l, i) => (
    <span key={l} className="block">
      <span
        className="write"
        style={{ "--d": `${delay + i * step}s`, "--t": `${duration ?? Math.max(1.1, l.length * 0.075)}s` } as CSSProperties}
        {...(immediate ? { "data-in": "" } : {})}
      >
        {l}
      </span>
    </span>
  ));
  return (
    <InView
      className={`font-script ${className}`}
      style={{ transform: `rotate(${rotate}deg)`, transformOrigin: "left center", ...style }}
      threshold={0.6}
    >
      {body}
    </InView>
  );
}
