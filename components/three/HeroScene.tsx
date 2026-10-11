"use client";

import * as THREE from "three";
import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import ModelCake from "./ModelCake";
import Curtain from "./Curtain";
import { CANVAS_W } from "./stage";
import { pointer } from "@/lib/pointer";

const damp = THREE.MathUtils.damp;

/**
 * Maße der Bühne. Die Leinwand ist so groß wie der Bogen plus Überstand (oben 2 %, unten 14 %, Breite 106 %), die Welt wird
 * so gelegt, dass 1 Bogenbreite = U Einheiten. So sitzt der gerenderte Vorhang deckungsgleich im Bogen der Seite.
 */
const VIEW_W = 6.55; // sichtbare Breite bei z = 0
const U = VIEW_W / CANVAS_W; // Welteinheiten pro Bogenbreite
const Y_BOTTOM = -0.5867 * U; // Unterkante des Bogens
const Y_TOP = 0.7467 * U; // Scheitel des Bogens
const DIST = 14;
const CURTAIN_Z = -2.8;
const K = (DIST - CURTAIN_Z) / DIST; // Perspektiv-Ausgleich für die Tiefe des Vorhangs
const CAKE_Y = -1.5;
const CAKE_SCALE = 2.0; // die Torte füllt rund 80 % der Bogenbreite, der Teller ragt nicht mehr aus der Leinwand // Torte steht etwa 0,16 Bogenbreiten über dem Bogenfuß

function Stage({ url, onReady, mobile }: { url: string | null; onReady: () => void; mobile: boolean }) {
  const tilt = useRef<THREE.Group>(null);
  const intro = useRef<number | null>(null);
  const ready = useRef(false);
  const aspectRef = useRef(0);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, rawDt) => {
    const tl = tilt.current;
    if (!tl) return;
    const dt = Math.min(rawDt, 0.25);
    if (ready.current && intro.current == null) intro.current = state.clock.elapsedTime;
    tl.rotation.x = damp(tl.rotation.x, 0.5 + pointer.y * 0.07, 4, dt);
    tl.rotation.z = damp(tl.rotation.z, -pointer.x * 0.045, 4, dt);
    // leichte Kamera-Parallaxe: der Vorhang liegt weiter hinten und wandert dadurch minimal gegen die Torte
    const cam = state.camera as THREE.PerspectiveCamera;
    // feste sichtbare Breite, egal wie das Seitenverhältnis der Leinwand gerade ist
    const aspect = state.size.width / Math.max(state.size.height, 1);
    if (Math.abs(aspect - aspectRef.current) > 0.001) {
      aspectRef.current = aspect;
      cam.fov = THREE.MathUtils.radToDeg(2 * Math.atan(VIEW_W / aspect / 2 / DIST));
      cam.updateProjectionMatrix();
    }
    cam.position.x = damp(cam.position.x, pointer.x * 0.22, 3, dt);
    cam.position.y = damp(cam.position.y, -pointer.y * 0.12, 3, dt);
    cam.lookAt(0, 0, 0);
  });

  // etwas größer als der Bogen, damit hinter dem „Fenster“ immer Stoff hängt
  const curtainW = U * K * 1.16;
  const curtainH = (Y_TOP - Y_BOTTOM) * K * 1.12;
  const curtainCy = ((Y_TOP + Y_BOTTOM) / 2) * K;

  return (
    <>
      <group position={[0, curtainCy, CURTAIN_Z]}>
        <Curtain width={curtainW} height={curtainH} segments={mobile ? [90, 120] : [128, 168]} />
      </group>
      <group scale={CAKE_SCALE} position={[0, CAKE_Y, 0]}>
        <directionalLight
          castShadow
          position={[3.4, 4.6, 3.8]}
          intensity={2.6}
          color="#fff1dd"
          shadow-mapSize={[1536, 1536]}
          shadow-camera-near={1}
          shadow-camera-far={20}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={5}
          shadow-camera-bottom={-5}
          shadow-bias={-0.0006}
          shadow-normalBias={0.03}
          shadow-radius={4}
        />
        <directionalLight position={[-4, 3, -2.5]} intensity={1.3} color="#ffe9d0" />
        <group ref={tilt}>
          <group position={[0, -0.5, 0]}>
            <Suspense fallback={null}>
              {url && <ModelCake
                introStart={intro}
                url={url}
                onReady={() => {
                  ready.current = true;
                  onReady();
                }}
              />}
            </Suspense>
          </group>
        </group>
      </group>
    </>
  );
}

/** Eigenständiges Canvas im Hero: rendert nur, solange `active` gilt (Hero sichtbar, Tab im Vordergrund). */
export default function HeroScene({ url, active, onReady, mobile }: { url: string | null; active: boolean; onReady: () => void; mobile: boolean }) {
  // Auflösung passt sich der Grafikleistung an: bei schwachen Geräten fällt die Pixeldichte auf 1
  const [dpr, setDpr] = useState<[number, number]>([1, 1.5]);
  return (
    <Canvas
      shadows
      frameloop={active ? "always" : "never"}
      dpr={dpr}
      camera={{ fov: 36, position: [0, 0, DIST], near: 0.5, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.shadowMap.type = THREE.PCFShadowMap;
      }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      aria-hidden
    >
      <PerformanceMonitor onDecline={() => setDpr([0.85, 1])} flipflops={2} />
      <hemisphereLight args={["#fff4e4", "#d9bfa8", 0.55]} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={4.2} color="#fff3e0" position={[-5, 5, 5]} scale={[7, 5, 1]} onUpdate={(s) => s.lookAt(0, 0, 0)} />
        <Lightformer form="rect" intensity={2.8} color="#ffd8c4" position={[0, -3, 6]} scale={[10, 2, 1]} onUpdate={(s) => s.lookAt(0, 0, 0)} />
        <Lightformer form="rect" intensity={3} color="#e8eeff" position={[6, 3, -4]} scale={[4, 6, 1]} onUpdate={(s) => s.lookAt(0, 0, 0)} />
        <Lightformer form="rect" intensity={2.2} color="#fff8ee" position={[0, 9, 0]} scale={[10, 10, 1]} onUpdate={(s) => s.lookAt(0, 0, 0)} />
      </Environment>
      <Stage url={url} onReady={onReady} mobile={mobile} />
    </Canvas>
  );
}
