"use client";

import { useEffect, useRef } from "react";
import { loadGsap } from "@/lib/gsap";

/** Scroll-scrubbed vertical drift. speed is the fraction of the element's height moved over its travel. */
export default function Parallax({
  speed = 0.1,
  className = "",
  children,
}: {
  speed?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    let dead = false;
    let undo: (() => void) | undefined;
    loadGsap().then(({ gsap }) => {
      if (dead) return;
      const tween = gsap.fromTo(
        el,
        { yPercent: -speed * 100 },
        {
          yPercent: speed * 100,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
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
  }, [speed]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
