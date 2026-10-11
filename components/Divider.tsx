import type { CSSProperties } from "react";
import InView from "./InView";

/** Gespritzte Schokoladen-Linie als Trenner: zeichnet sich beim Einblenden von links nach rechts. */
export default function Divider({ className = "", color = "var(--choc)" }: { className?: string; color?: string }) {
  return (
    <InView className={`pointer-events-none ${className}`} threshold={0.6}>
      <svg viewBox="0 0 1000 24" preserveAspectRatio="none" fill="none" aria-hidden className="block h-5 w-full overflow-visible">
        <path
          d="M0 14 C 60 4, 110 22, 170 12 S 280 2, 340 12 S 450 22, 510 12 S 620 3, 680 12 S 790 21, 850 11 S 950 6, 1000 12"
          pathLength={1}
          stroke={color}
          strokeWidth="3.2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="sketch"
          style={{ "--t": "2.4s" } as CSSProperties}
        />
        <path
          d="M0 12.6 C 60 2.6, 110 20.6, 170 10.6 S 280 0.6, 340 10.6 S 450 20.6, 510 10.6 S 620 1.6, 680 10.6 S 790 19.6, 850 9.6 S 950 4.6, 1000 10.6"
          pathLength={1}
          stroke="#fff"
          strokeOpacity="0.45"
          strokeWidth="1"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="sketch"
          style={{ "--t": "2.4s", "--d": "0.1s" } as CSSProperties}
        />
      </svg>
    </InView>
  );
}
