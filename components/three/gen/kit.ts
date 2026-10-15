import * as THREE from "three";

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const easeInOut = (x: number) => x * x * (3 - 2 * x);
export const easeOutBack = (x: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

/** Gravity drop with a small hop and scale pop. Returns [yOffset, scale]. */
export function drop(t: number, delay: number, H = 1.7): [number, number] {
  const tau = t - delay;
  if (tau < 0) return [H, 0];
  const D = 0.42;
  const pop = Math.min(1, tau / 0.14);
  if (tau < D) return [H * (1 - (tau / D) ** 2), pop];
  const t2 = tau - D;
  return [0.07 * Math.abs(Math.sin(t2 * 11)) * Math.exp(-t2 * 8), 1];
}

export type Spec = {
  p: [number, number, number];
  r: [number, number, number];
  s: number;
  /** optional extra stretch along the local Y axis (sticks) */
  sy?: number;
  delay: number;
};

export function makePlateGeometry() {
  return new THREE.LatheGeometry(
    [
      [0, 0],
      [1.12, 0],
      [1.3, 0.04],
      [1.42, 0.09],
      [1.44, 0.1],
      [1.4, 0.106],
      [1.27, 0.078],
      [1.07, 0.05],
      [0, 0.05],
    ].map(([x, y]) => new THREE.Vector2(x, y)),
    128,
  );
}

export function makePlateMaterial() {
  const m = new THREE.MeshPhysicalMaterial({
    color: "#eee8de",
    roughness: 0.28,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2,
    side: THREE.DoubleSide,
  });
  // Porzellan mit Tiefe: dunkler Kontaktschatten dicht am Tortenrand, der nach außen rasch verläuft,
  // und ein leicht warmer Verlauf zur Fahne hin. Radius in Lokalkoordinaten der Platte (Rand bei 1,44).
  m.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vPlateP;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvPlateP = position;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vPlateP;")
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        {
          float pr = length(vPlateP.xz);
          float occ = 0.55 * exp(-max(pr - 1.3, 0.0) * 16.0);
          float well = 0.0;
          float rim = smoothstep(1.2, 1.42, pr);
          diffuseColor.rgb *= 1.0 - occ - well;
          diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(1.02, 0.99, 0.95), rim);
        }`,
      );
  };
  m.customProgramCacheKey = () => "plate-v3";
  return m;
}

/** Tier body with a softly rounded top edge. */
export function latheProfile(r: number, h: number, b = 0.045) {
  const pts: THREE.Vector2[] = [new THREE.Vector2(0, 0), new THREE.Vector2(r, 0), new THREE.Vector2(r, h - b)];
  for (let i = 1; i <= 5; i++) {
    const a = (i / 5) * (Math.PI / 2);
    pts.push(new THREE.Vector2(r - b + Math.cos(a) * b, h - b + Math.sin(a) * b));
  }
  pts.push(new THREE.Vector2(0, h));
  return pts;
}

/** Hash noise in 0..1 from a 3D position (for vertex-colour variation). */
export function hash3(x: number, y: number, z: number) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
}
