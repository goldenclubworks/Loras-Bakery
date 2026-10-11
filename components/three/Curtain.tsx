"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ARCH_ALPHA_GLSL } from "./fabric";

/** Dauer einer vollständigen Schleife. Alle Wind-Bewegungen sind ganzzahlige Vielfache davon: kein Sprung beim Neustart. */
export const LOOP_SECONDS = 18;

/** Palette vom Foto (sRGB), von den tiefsten Knicken bis zu den hellsten Bahnen */
const RAMP = ["#1f5a46", "#256a52", "#2f7f63", "#44967a", "#67ae8c", "#84c6a6", "#a2dac3"];

const DISPLACE = /* glsl */ `
  uniform float uPhase;   // 0..2π über eine Schleife
  uniform float uW;       // Breite des Stoffs
  uniform float uH;       // Höhe des Stoffs
  const float TAU = 6.28318530718;

  float h21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  // weiches Wertrauschen 0..1
  float vn(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float a = 0.5, s = 0.0;
    for (int i = 0; i < 3; i++) {
      s += a * vn(p);
      p = p * 2.03 + vec2(17.1, 9.3);
      a *= 0.5;
    }
    return s / 0.875;
  }

  // Faltenprofil: breite, fast ebene Bahnen und schmale Knicke dazwischen
  float foldProfile(float ph) {
    float s = sin(ph * 0.5);
    return pow(s * s + 0.02, 0.4);
  }

  // xyz = Verschiebung des Stoffs
  vec3 curtainDisp(vec2 p) {
    float nx = p.x / uW;               // -0.5 .. 0.5
    float ny = (p.y + uH * 0.5) / uH;  // 0 unten .. 1 oben (Stange)

    // Falten öffnen sich nach unten, wie bei einem an der Stange gerafften Stoff
    float spread = 1.0 + 0.28 * (1.0 - ny);
    // organisches Schwanken von Faltenlage und -breite (Rauschen statt Sinus, damit nichts regelmäßig wirkt)
    float m1 = (fbm(vec2(nx * 2.6 + 3.0, ny * 1.5 + 1.0)) - 0.5) * 2.0;
    float m2 = (vn(vec2(nx * 6.0 + 9.0, ny * 3.4 + 4.0)) - 0.5) * 2.0;

    // Wind: zusammenhängende Wellen laufen über den Stoff (von links unten nach rechts oben), dazu je Stelle ein eigener Versatz.
    // Alle Takte sind ganzzahlige Vielfache der Schleife, deshalb gibt es keinen Sprung beim Neustart.
    float a1 = vn(vec2(nx * 1.3 + 11.0, ny * 0.9 + 5.0)) * TAU;
    float a2 = vn(vec2(nx * 1.8 + 21.0, ny * 1.4 + 9.0)) * TAU;
    float a3 = vn(vec2(nx * 2.5 + 31.0, ny * 2.0 + 13.0)) * TAU;
    float edge = 1.0 - 0.55 * smoothstep(0.32, 0.5, abs(nx));  // Seiten etwas ruhiger
    float rod = 1.0 - 0.9 * smoothstep(0.6, 1.0, ny);          // Stange ruhiger, unten weht es am stärksten
    float swell = sin(2.0 * uPhase - nx * TAU * 0.95 + ny * TAU * 0.42 + a1 * 0.35);
    float swell2 = sin(3.0 * uPhase - nx * TAU * 1.7 - ny * TAU * 0.8 + a2 * 0.4 + 1.3);
    float swell3 = sin(1.0 * uPhase - nx * TAU * 0.5 + ny * TAU * 0.25 + a3 * 0.3 + 2.1);
    float sway = (0.75 * swell + 0.35 * swell2) * (1.2 - ny * 0.8) * edge;

    float ph = nx * 3.6 * spread * TAU + 1.15 * m1 + 0.3 * m2 + sway;

    float s1 = sin(ph);
    float broad = s1 + 0.42 * sin(2.0 * ph + 1.1 + 1.2 * m2);
    float f = foldProfile(ph + 2.2 + 0.6 * m1);
    float crease = -(1.0 - f) * 0.34;
    // feine Längsknitter
    float wr = (vn(vec2(nx * 46.0, ny * 5.0 + 7.0)) - 0.5) * 0.02 + (vn(vec2(nx * 70.0, ny * 12.0)) - 0.5) * 0.008;

    float amp = mix(0.36, 0.26, smoothstep(0.0, 1.0, ny)) * (0.78 + 0.44 * vn(vec2(nx * 4.0 + 2.0, ny * 1.5)));
    // Brise: der ganze Stoff wölbt sich in laufenden Wellen vor und zurück
    float billow = (0.20 * swell + 0.09 * swell2 + 0.07 * swell3) * rod * edge;

    float z = amp * (broad + crease) + wr + billow;
    // Grate hängen leicht über (S-Falten)
    float x = 0.09 * amp * s1 + 0.07 * swell * (1.0 - ny * 0.7) * edge;
    return vec3(x, 0.0, z);
  }
`;

/** Feines, gerichtetes Flor: Fasern laufen senkrecht, das Korn ist fein (kein Wolkenmuster). */
function makeNap() {
  // Auf Handys und schwachen Geräten genügt die halbe Auflösung (spart Rechenzeit beim Erzeugen)
  const strong = (navigator.hardwareConcurrency ?? 8) > 4 && !/Android|iPhone|iPad/i.test(navigator.userAgent);
  const size = strong ? 1024 : 512;
  let s = 13;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const field = new Float32Array(size * size);
  // [Zellen in x, Zellen in y, Stärke]: mehr Zellen quer als längs = senkrechte Fasern
  const layers: [number, number, number][] = [
    [1024, 340, 8],
    [512, 128, 8],
    [256, 48, 5],
    [96, 16, 3],
    [32, 8, 2],
  ];
  for (const [nx0, ny0, amp] of layers) {
    const nx = Math.min(nx0, size);
    const ny = Math.min(ny0, size);
    const grid = new Float32Array(nx * ny).map(() => rnd() * 2 - 1);
    for (let y = 0; y < size; y++) {
      const fy = (y / size) * ny;
      const y0 = Math.floor(fy) % ny;
      const y1 = (y0 + 1) % ny;
      const ty = fy - Math.floor(fy);
      const sy = ty * ty * (3 - 2 * ty);
      for (let x = 0; x < size; x++) {
        const fx = (x / size) * nx;
        const x0 = Math.floor(fx) % nx;
        const x1 = (x0 + 1) % nx;
        const tx = fx - Math.floor(fx);
        const sx = tx * tx * (3 - 2 * tx);
        const a = grid[y0 * nx + x0] * (1 - sx) + grid[y0 * nx + x1] * sx;
        const b = grid[y1 * nx + x0] * (1 - sx) + grid[y1 * nx + x1] * sx;
        field[y * size + x] += (a * (1 - sy) + b * sy) * amp;
      }
    }
  }
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const img = g.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const v = Math.max(0, Math.min(255, Math.round(238 + field[i])));
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 16;
  return t;
}

/**
 * Der große Vorhang hinter der Torte. Ein hochaufgelöstes Stoff-Mesh, das komplett auf der GPU verformt wird:
 * organische S-Falten (Rauschen statt Sinus), Faltenabstand weitet sich nach unten, dazu eine nahtlose Brise.
 * Er wirft Schatten auf sich selbst (hartes Seitenlicht wie im Foto), Samt-Glanz an den Graten, Selbstverschattung
 * in den Tälern und feines, senkrechtes Flor. Die Farben kommen über eine Palette direkt vom Foto.
 */
export default function Curtain({ width, height, segments = [160, 210] }: { width: number; height: number; segments?: [number, number] }) {
  const uniforms = useRef({
    uPhase: { value: 0 },
    uW: { value: width },
    uH: { value: height },
    uRes: { value: new THREE.Vector2(1, 1) },
    uRamp: { value: RAMP.map((c) => new THREE.Color(c)) },
  });
  const nap = useMemo(() => makeNap(), []);
  useEffect(() => () => nap.dispose(), [nap]);

  const material = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#ffffff"),
      map: nap,
      roughness: 0.92,
      metalness: 0,
      sheen: 1,
      sheenRoughness: 0.5,
      sheenColor: new THREE.Color("#e6fff4"),
      bumpMap: nap,
      bumpScale: 1.25,
      envMapIntensity: 0.28,
      side: THREE.DoubleSide,
      transparent: true,
    });
    nap.repeat.set(width / 3.0, height / 3.0);
    m.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms.current);
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          `#include <common>
          varying float vAo;
          varying vec2 vRest;
          ${DISPLACE}`,
        )
        .replace(
          "#include <beginnormal_vertex>",
          `vec2 rp = position.xy;
          float e = 0.012;
          float ec = 0.05;
          vec3 d0 = curtainDisp(rp);
          vec3 dx = curtainDisp(rp + vec2(e, 0.0));
          vec3 dy = curtainDisp(rp + vec2(0.0, e));
          vec3 tx = vec3(e, 0.0, 0.0) + (dx - d0);
          vec3 ty = vec3(0.0, e, 0.0) + (dy - d0);
          vec3 objectNormal = normalize(cross(tx, ty));
          // Krümmung quer zur Falte: Täler (Stoff weicht zurück) werden dunkler, Grate bleiben hell
          float curv = (curtainDisp(rp + vec2(ec, 0.0)).z + curtainDisp(rp - vec2(ec, 0.0)).z - 2.0 * d0.z) / (ec * ec);
          vAo = 1.0 - smoothstep(0.6, 7.0, curv);
          vRest = rp;`,
        )
        .replace("#include <begin_vertex>", "vec3 transformed = vec3(position.xy, 0.0) + d0;");
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
          varying float vAo;
          varying vec2 vRest;
          uniform float uW;
          uniform float uH;
          uniform vec2 uRes;
          uniform vec3 uRamp[7];
          // Helligkeit -> Farbe: die Palette des Fotos (Knicke tiefes Jade, Bahnen helles Mint)
          vec3 curtainRamp(float t) {
            float f = clamp(t, 0.0, 1.0) * 6.0;
            int i = int(min(floor(f), 5.0));
            return mix(uRamp[i], uRamp[i + 1], f - float(i));
          }`,
        )
        .replace(
          "#include <color_fragment>",
          `#include <color_fragment>
          diffuseColor.rgb *= mix(0.5, 1.0, vAo);
          // dunklere Kante unter der Stange
          diffuseColor.rgb *= mix(0.82, 1.0, smoothstep(uH * 0.5, uH * 0.22, vRest.y));
          ${ARCH_ALPHA_GLSL}`,
        )
        .replace(
          "#include <opaque_fragment>",
          `#include <opaque_fragment>
          {
            float nyy = vRest.y / uH + 0.5;
            float nxx = vRest.x / uW;
            float L = dot(gl_FragColor.rgb, vec3(0.2126, 0.7152, 0.0722));
            // Samt-Flor: an streifend gesehenen Graten leuchtet der Stoff heller
            float rim = pow(1.0 - clamp(abs(dot(normalize(vViewPosition), normal)), 0.0, 1.0), 2.6);
            L += rim * 0.22;
            L = pow(clamp((L + 0.02) / 1.02, 0.0, 1.0), 1.5);
            // oben rechts etwas heller, unten dunkler wie im Foto
            L *= 0.96 + 0.07 * (nxx + (nyy - 0.5) * 0.5);
            gl_FragColor.rgb = curtainRamp(L);
          }`,
        );
    };
    m.customProgramCacheKey = () => "hero-curtain-v10";
    return m;
  }, [nap, width, height]);

  // Schatten des Stoffs auf sich selbst: gleiche Verformung auch im Tiefenpass der Lichtquelle
  const depthMaterial = useMemo(() => {
    const d = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, side: THREE.DoubleSide });
    d.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms.current);
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", `#include <common>\n${DISPLACE}`)
        .replace("#include <begin_vertex>", "vec3 transformed = vec3(position.xy, 0.0) + curtainDisp(position.xy);");
    };
    d.customProgramCacheKey = () => "hero-curtain-depth-v1";
    return d;
  }, []);

  useEffect(
    () => () => {
      material.dispose();
      depthMaterial.dispose();
    },
    [material, depthMaterial],
  );

  useFrame((state) => {
    uniforms.current.uRes.value.set(state.size.width * state.viewport.dpr, state.size.height * state.viewport.dpr);
    uniforms.current.uPhase.value = ((state.clock.elapsedTime % LOOP_SECONDS) / LOOP_SECONDS) * Math.PI * 2;
  });

  return (
    <mesh material={material} customDepthMaterial={depthMaterial} castShadow receiveShadow frustumCulled={false}>
      <planeGeometry args={[width, height, segments[0], segments[1]]} />
    </mesh>
  );
}
