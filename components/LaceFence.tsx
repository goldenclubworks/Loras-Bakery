"use client";

import { useEffect, useRef } from "react";
import { loadGsap } from "@/lib/gsap";

/**
 * Loras Schokoladen-Zaun: die echte, von Hand gespritzte Spitze (lace-edge.svg) als Maske, eingefärbt je nach Untergrund.
 * Beim Scrollen wird sie von links nach rechts „gespritzt“ und schiebt sich dabei leicht nach links, wie ein
 * Spitzenband, das an der Torte vorbeizieht. Steht auf der Kante des folgenden Abschnitts.
 */
export default function LaceFence({
  tone = "choc",
  flip = false,
  className = "",
}: {
  tone?: "choc" | "white" | "blush";
  /** an der Unterkante hängend statt auf der Oberkante stehend */
  flip?: boolean;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--r", "120%");
      return;
    }
    let dead = false;
    let undo: (() => void) | undefined;
    loadGsap().then(({ gsap }) => {
      if (dead) return;
      const tween = gsap.fromTo(
        el,
        { "--r": "0%", "--shift": "0px" },
        {
          "--r": "120%",
          "--shift": "-260px",
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 92%", end: "top 38%", scrub: 0.8 },
        },
      );
      undo = () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });
    return () => {
      dead = true;
      undo?.();
    };
  }, []);

  return (
    <div
      ref={root}
      aria-hidden
      className={`lace lace-${tone} pointer-events-none absolute inset-x-0 z-10 ${flip ? "top-full" : "bottom-full"} ${className}`}
      style={{ ["--r" as string]: "120%" }}
    >
      <div className="lace-art" style={{ transform: flip ? "scaleY(-1)" : undefined }} />
    </div>
  );
}
