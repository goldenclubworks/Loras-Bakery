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

type Quality = { url: string; mb: number };

/**
 * Drei Stufen, je nach Gerät: Handy und schwache Rechner das leichte Modell (6,5 MB), normale Rechner das Standardmodell
 * (13 MB, 500 000 Dreiecke), starke Rechner mit schneller Leitung die Ultra-Stufe (21 MB, 1,67 Mio. Dreiecke aus dem
 * 180-MB-Original, feinere Spitze, schärfere Früchte).
 */
function pickModel(): Quality {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { effectiveType?: string } };
  const cores = navigator.hardwareConcurrency ?? 8;
  if (/Android|iPhone|iPad/i.test(navigator.userAgent) || cores <= 4) return { url: "/models/cake-lite.glb", mb: 6.5 };
  const strong = cores >= 8 && (nav.deviceMemory ?? 8) >= 8 && (nav.connection?.effectiveType ?? "4g") === "4g";
  return strong ? { url: "/models/cake-ultra.glb", mb: 21.3 } : { url: "/models/cake.glb", mb: 13.3 };
}

/** Lädt die Datei selbst, damit der Fortschritt sichtbar wird; useGLTF bekommt danach eine lokale Blob-URL. */
async function download(q: Quality, onProgress: (p: number) => void, signal: AbortSignal) {
  const res = await fetch(q.url, { signal });
  if (!res.ok || !res.body) throw new Error("model");
  const total = Number(res.headers.get("content-length")) || q.mb * 1024 * 1024;
  const reader = res.body.getReader();
  const parts: BlobPart[] = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    parts.push(value as BlobPart);
    got += value.length;
    onProgress(Math.min(0.99, got / total));
  }
  return URL.createObjectURL(new Blob(parts, { type: "model/gltf-binary" }));
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
  const [load, setLoad] = useState<number | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!canRun3d()) return;
    const q = pickModel();
    const ctl = new AbortController();
    let blob: string | undefined;
    let timer = 0;
    const start = () => {
      setLoad(0.01);
      download(q, setLoad, ctl.signal)
        .then((u) => {
          blob = u;
          setLoad(1);
          setMount(u);
        })
        .catch(() => setLoad(null));
    };
    // Die Seite zuerst: das Modell startet nach dem Laden der Seite, kurz nachdem der Preloader den Vorhang hebt.
    // Bis es fertig ist, steht das Foto der Torte da und ein feiner Fortschrittsbalken zeigt den Stand.
    const arm = () => {
      timer = window.setTimeout(start, 900);
    };
    if (document.readyState === "complete") arm();
    else window.addEventListener("load", arm, { once: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("load", arm);
      ctl.abort();
      if (blob) URL.revokeObjectURL(blob);
    };
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
    <div className="relative mx-auto w-full max-w-[600px] max-sm:w-[84%] lg:ml-auto">
      {/* weißer Bilderrahmen um Bogen, Vorhang und Torte, dahinter eine dünne Versatzlinie */}
      <div aria-hidden className="stage-echo fade-in" style={{ "--d": "0.1s" } as React.CSSProperties} />
      <div aria-hidden className="stage-frame fade-in" style={{ "--d": "0.1s" } as React.CSSProperties} />

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
        {/* Foto der Torte: sofort da, wird vom 3D-Modell abgelöst. Gleiche Größe wie die 3D-Torte: der Teller steht ganz im Rahmen */}
        <div className="fade-in absolute inset-x-[7.15%] bottom-[13.8%] aspect-square" style={{ "--d": "0.25s" } as React.CSSProperties}>
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 1024px) 34vw, (min-width: 640px) 490px, 76vw"
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
      {/* Ladestand der 3D-Torte: feine Linie unter dem Bogen, verschwindet, sobald die Torte steht */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-9 left-1/2 z-[19] w-[46%] -translate-x-1/2 text-center transition-opacity duration-700"
        style={{ opacity: load !== null && !ready ? 1 : 0 }}
      >
        <div className="h-px w-full bg-rose/25">
          <div className="h-full origin-left bg-rose transition-transform duration-300 ease-out" style={{ transform: `scaleX(${load ?? 0})` }} />
        </div>
        <p className="mt-2 text-[0.62rem] uppercase tracking-[0.34em] text-cocoa/70">Torte wird gebacken · {Math.round((load ?? 0) * 100)} %</p>
      </div>
      {/* feine Innenkante des Rahmens, liegt über Vorhang und Torte */}
      <div aria-hidden className="stage-inset fade-in" style={{ "--d": "0.1s" } as React.CSSProperties} />
      {children}
    </div>
  );
}
