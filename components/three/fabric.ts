import * as THREE from "three";
import { ARCH, CANVAS_H, CANVAS_W } from "./stage";

/** Zuschnitt im Bildschirmraum: der Bogen steht fest wie ein Fenster, Stoff und Tisch liegen dahinter. Braucht `uniform vec2 uRes`. */
export const ARCH_ALPHA_GLSL = /* glsl */ `
  vec2 sp = gl_FragCoord.xy / uRes * vec2(${CANVAS_W.toFixed(5)}, ${CANVAS_H.toFixed(5)});
  float dd = sp.y > ${(ARCH.top - ARCH.r).toFixed(5)}
    ? length(sp - vec2(${ARCH.cx.toFixed(5)}, ${(ARCH.top - ARCH.r).toFixed(5)})) - ${ARCH.r.toFixed(3)}
    : abs(sp.x - ${ARCH.cx.toFixed(5)}) - ${ARCH.r.toFixed(3)};
  dd = max(dd, ${ARCH.bottom.toFixed(5)} - sp.y);
  float aa = max(fwidth(dd), 1e-5);
  diffuseColor.a *= clamp(0.5 - dd / aa, 0.0, 1.0);
`;

/** Kachelbares Wertrauschen (wrap-around), mehrere Oktaven: weiches, gleichmäßiges Flor ohne Flecken. */
export function makeFleece({ size = 512, octaves = [[256, 14], [64, 7], [16, 4]], base = 236, seed = 5 }: { size?: number; octaves?: [number, number][]; base?: number; seed?: number } = {}) {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const field = new Float32Array(size * size);
  for (const [n, amp] of octaves) {
    const grid = new Float32Array(n * n).map(() => rnd() * 2 - 1);
    for (let y = 0; y < size; y++) {
      const fy = (y / size) * n;
      const y0 = Math.floor(fy) % n;
      const y1 = (y0 + 1) % n;
      const ty = fy - Math.floor(fy);
      const sy = ty * ty * (3 - 2 * ty);
      for (let x = 0; x < size; x++) {
        const fx = (x / size) * n;
        const x0 = Math.floor(fx) % n;
        const x1 = (x0 + 1) % n;
        const tx = fx - Math.floor(fx);
        const sx = tx * tx * (3 - 2 * tx);
        const a = grid[y0 * n + x0] * (1 - sx) + grid[y0 * n + x1] * sx;
        const b = grid[y1 * n + x0] * (1 - sx) + grid[y1 * n + x1] * sx;
        field[y * size + x] += (a * (1 - sy) + b * sy) * amp;
      }
    }
  }
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const img = g.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const v = Math.max(0, Math.min(255, Math.round(base + field[i])));
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
