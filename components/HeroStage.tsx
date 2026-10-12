"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { drag } from "@/lib/pointer";
import { photos } from "@/lib/photos";

const HeroScene = dynamic(() => import("./three/HeroScene"), { ssr: false });

function canRun3d() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };
  if (nav.connection?.saveData || /(^|-)2g|3g/.test(nav.connection?.effectiveType ?? "")) return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Phones and low-core machines get the lighter model (about half the triangles, 2K maps). */
function modelUrl() {
  const low = /Android|iPhone|iPad/i.test(navigator.userAgent) || (navigator.hardwareConcurrency ?? 8) <= 4;
  return low ? "/models/cake-lite.glb" : "/models/cake.glb";
}

/**
 * Die 3D-Torte aus dem Hero. Das Foto der Torte (freigestellt) steht sofort da, das 3D-Modell wird erst nach dem
 * ersten Bild und im Leerlauf geladen und blendet das Foto ab, sobald es fertig kompiliert ist. Ohne WebGL, mit
 * reduzierter Bewegung oder Datensparmodus bleibt es beim Foto. Ziehen dreht die Torte, Scrollen auch.
 */
export default function HeroStage({ children }: { children?: React.ReactNode }) {
  const photo = photos["cake-cutout"];
  const root = useRef<HTMLDivElement>(null);
  const last = useRef(0);
  const [mount, setMount] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!canRun3d()) return;
    const url = modelUrl();
    let done = false;
    const events = ["pointerdown", "pointermove", "wheel", "scroll", "keydown", "touchstart"] as const;
    const go = () => {
      if (done) return;
      done = true;
      cleanup();
      // einen Frame später, damit die Eingabe selbst nicht ruckelt
      window.setTimeout(() => setMount(url), 120);
    };
    // Das 3D-Modell ist groß: erst bei der ersten Eingabe laden, spätestens nach ein paar Sekunden im Leerlauf.
    let timer = 0;
    const arm = () => {
      timer = window.setTimeout(go, 10000);
    };
    const cleanup = () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, go));
      window.removeEventListener("load", arm);
    };
    events.forEach((e) => window.addEventListener(e, go, { passive: true, once: true }));
    if (document.readyState === "complete") arm();
    else window.addEventListener("load", arm, { once: true });
    return cleanup;
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "80px" });
    io.observe(el);
    const vis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", vis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);

  const mobile = typeof navigator !== "undefined" && /Android|iPhone|iPad/i.test(navigator.userAgent);

  return (
    <div className="relative mx-auto w-full max-w-[540px] lg:ml-auto">
      <div aria-hidden className="absolute -inset-3 translate-x-3 translate-y-3 rounded-t-[999px] border border-rose/60" />

      {/* Bühne: solange das 3D lädt (oder ohne WebGL) hängt hier der CSS-Vorhang im Bogen */}
      <div className="fade-in relative aspect-[3/4]" style={{ "--d": "0.1s" } as React.CSSProperties}>
        <div
          className="curtain absolute inset-0 overflow-hidden rounded-t-[999px] transition-opacity duration-[900ms]"
          style={{ opacity: ready ? 0 : 1 }}
        />
      </div>

      {/* Leinwand: Bogenbreite × 1,06, vom Scheitel (−2 %) bis unter den Teller (+14 %) */}
      <div
        ref={root}
        className={`absolute bottom-[-14%] left-1/2 top-[-2%] w-[106%] -translate-x-1/2 ${ready ? "cursor-grab active:cursor-grabbing" : ""}`}
        style={{ pointerEvents: ready ? "auto" : "none", touchAction: "pan-y" }}
        onPointerDown={(e) => {
          drag.dragging = true;
          last.current = e.clientX;
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.dragging) return;
          drag.yaw += (e.clientX - last.current) * 0.011;
          last.current = e.clientX;
        }}
        onPointerUp={() => {
          drag.dragging = false;
        }}
        onPointerCancel={() => {
          drag.dragging = false;
        }}
      >
        {/* Foto der Torte: sofort da, wird vom 3D-Modell abgelöst */}
        <div className="fade-in absolute inset-x-0 bottom-[5.2%] aspect-square" style={{ "--d": "0.25s" } as React.CSSProperties}>
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 1024px) 42vw, 90vw"
            className="object-contain drop-shadow-[0_34px_34px_rgba(60,30,52,0.35)] transition-opacity duration-[900ms]"
            style={{ opacity: ready ? 0 : 1 }}
          />
        </div>
        {mount && (
          <div className="absolute inset-0 transition-opacity duration-[900ms]" style={{ opacity: ready ? 1 : 0 }}>
            <HeroScene url={mount} active={visible} onReady={() => setReady(true)} mobile={mobile} />
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
