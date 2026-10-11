// Saubere Freisteller: Maske verfeinern, Saum entfernen, Randfarben dekontaminieren, prüfen.
import { createRequire } from "node:module";
const sharp = createRequire(import.meta.url)("sharp");

export async function readRGBA(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data: new Uint8ClampedArray(data), w: info.width, h: info.height };
}

/** Binärmaske (1 = Objekt) aus Alpha. */
export function maskFromAlpha(img, thr = 128) {
  const m = new Uint8Array(img.w * img.h);
  for (let i = 0; i < m.length; i++) m[i] = img.data[i * 4 + 3] >= thr ? 1 : 0;
  return m;
}

/** Nur die größte zusammenhängende Komponente (oder die, die den Punkt enthält) behalten, Löcher füllen. */
export function largestComponent(mask, w, h, seed, multi = 0) {
  const lab = new Int32Array(w * h);
  let best = 0, bestSize = 0, id = 0;
  const stack = [];
  const sizes = [0];
  for (let s = 0; s < mask.length; s++) {
    if (!mask[s] || lab[s]) continue;
    id++; let size = 0; stack.push(s); lab[s] = id;
    while (stack.length) {
      const p = stack.pop(); size++;
      const x = p % w, y = (p / w) | 0;
      if (x > 0 && mask[p - 1] && !lab[p - 1]) { lab[p - 1] = id; stack.push(p - 1); }
      if (x < w - 1 && mask[p + 1] && !lab[p + 1]) { lab[p + 1] = id; stack.push(p + 1); }
      if (y > 0 && mask[p - w] && !lab[p - w]) { lab[p - w] = id; stack.push(p - w); }
      if (y < h - 1 && mask[p + w] && !lab[p + w]) { lab[p + w] = id; stack.push(p + w); }
    }
    sizes.push(size);
    if (size > bestSize) { bestSize = size; best = id; }
  }
  if (seed && lab[seed[1] * w + seed[0]]) best = lab[seed[1] * w + seed[0]];
  const out = new Uint8Array(w * h);
  const keepIds = new Set([best]);
  if (multi) for (let k = 1; k < sizes.length; k++) if (sizes[k] >= bestSize * multi) keepIds.add(k);
  for (let i = 0; i < out.length; i++) out[i] = keepIds.has(lab[i]) ? 1 : 0;
  // Löcher füllen: Hintergrund vom Rand aus fluten, alles Unerreichte ist Objekt
  const bg = new Uint8Array(w * h);
  const st = [];
  const push = (p) => { if (!out[p] && !bg[p]) { bg[p] = 1; st.push(p); } };
  for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }
  while (st.length) {
    const p = st.pop(); const x = p % w, y = (p / w) | 0;
    if (x > 0) push(p - 1); if (x < w - 1) push(p + 1); if (y > 0) push(p - w); if (y < h - 1) push(p + w);
  }
  for (let i = 0; i < out.length; i++) if (!bg[i]) out[i] = 1;
  return out;
}

/** Erosion mit rundem Element (Radius r). */
export function erode(mask, w, h, r) {
  if (r <= 0) return mask;
  const out = new Uint8Array(mask.length);
  const offs = [];
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (dx * dx + dy * dy <= r * r) offs.push([dx, dy]);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let ok = 1;
    for (const [dx, dy] of offs) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h || !mask[yy * w + xx]) { ok = 0; break; } }
    out[y * w + x] = ok;
  }
  return out;
}

/** Weiche Kante: Binärmaske leicht verwischen (nur Randbereich), Innenfläche bleibt 255. */
export async function feather(mask, w, h, sigma = 0.9) {
  const a = Buffer.alloc(w * h);
  for (let i = 0; i < a.length; i++) a[i] = mask[i] ? 255 : 0;
  const { data: blurred, info } = await sharp(a, { raw: { width: w, height: h, channels: 1 } }).blur(sigma).raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  const out = new Uint8ClampedArray(w * h);
  for (let i = 0; i < out.length; i++) out[i] = Math.max(0, Math.min(255, ((blurred[i * ch] - 40) / 175) * 255));
  return out;
}

/** Randfarben aus dem Objektinneren nach außen „bluten“, damit nirgends Hintergrundfarbe im Rand steckt. */
export function decontaminate(img, interior) {
  const { data, w, h } = img;
  const known = new Uint8Array(w * h);
  for (let i = 0; i < known.length; i++) known[i] = interior[i];
  for (let it = 0; it < 14; it++) {
    const add = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const p = y * w + x;
      if (known[p]) continue;
      let r = 0, g = 0, b = 0, n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const q = yy * w + xx;
        if (known[q]) { r += data[q * 4]; g += data[q * 4 + 1]; b += data[q * 4 + 2]; n++; }
      }
      if (n) add.push([p, r / n, g / n, b / n]);
    }
    if (!add.length) break;
    for (const [p, r, g, b] of add) { data[p * 4] = r; data[p * 4 + 1] = g; data[p * 4 + 2] = b; known[p] = 1; }
  }
}

export function bbox(mask, w, h) {
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (mask[y * w + x]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return { x0, y0, x1, y1 };
}

/** Kompletter Ablauf. opts: { erodePx, featherSigma, keep(r,g,b,x,y) -> bool, circle:[cx,cy,r], poly:[[x,y]...], seed:[x,y], pad } */
export async function matte(visionPng, opts = {}) {
  const img = await readRGBA(visionPng);
  const { w, h } = img;
  let m = maskFromAlpha(img, 128);
  if (opts.keep) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (m[i] && !opts.keep(img.data[i * 4], img.data[i * 4 + 1], img.data[i * 4 + 2], x, y)) m[i] = 0; }
  if (opts.circle) { const [cx, cy, r] = opts.circle; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if ((x - cx) ** 2 + (y - cy) ** 2 > r * r) m[y * w + x] = 0; }
  if (opts.poly) {
    const inside = (x, y) => { let c = false; const P = opts.poly; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (m[y * w + x] && !inside(x, y)) m[y * w + x] = 0;
  }
  m = largestComponent(m, w, h, opts.seed, opts.multi ?? 0);
  if (opts.roundFit) {
    // runde Früchte: Maske durch die passende Kreisscheibe ersetzen (kein Einbiss durch Überdeckung)
    const b0 = bbox(m, w, h);
    const cx = (b0.x0 + b0.x1) / 2, cy = (b0.y0 + b0.y1) / 2, r = (Math.max(b0.x1 - b0.x0, b0.y1 - b0.y0) / 2) * (opts.roundFit === true ? 0.97 : opts.roundFit);
    m = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) m[y * w + x] = 1;
  }
  m = erode(m, w, h, opts.erodePx ?? 2);
  const interior = erode(m, w, h, 3);
  decontaminate(img, interior);
  const alpha = await feather(m, w, h, opts.featherSigma ?? 0.9);
  for (let i = 0; i < alpha.length; i++) img.data[i * 4 + 3] = alpha[i];
  // zuschneiden mit transparentem Rand
  const bb = bbox(m, w, h);
  const pad = opts.pad ?? 4;
  const x0 = Math.max(0, bb.x0 - pad), y0 = Math.max(0, bb.y0 - pad), x1 = Math.min(w - 1, bb.x1 + pad), y1 = Math.min(h - 1, bb.y1 + pad);
  const cw = x1 - x0 + 1, ch = y1 - y0 + 1;
  const out = Buffer.alloc(cw * ch * 4);
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) { const s = ((y0 + y) * w + (x0 + x)) * 4, d = (y * cw + x) * 4; out[d] = img.data[s]; out[d + 1] = img.data[s + 1]; out[d + 2] = img.data[s + 2]; out[d + 3] = img.data[s + 3]; }
  // Prüfung: berührt das Objekt den Rand des Ausgangsausschnitts? (= angeschnitten)
  const touches = bb.x0 <= 1 || bb.y0 <= 1 || bb.x1 >= w - 2 || bb.y1 >= h - 2;
  return { rgba: out, width: cw, height: ch, touchesEdge: touches, area: m.reduce((a, b) => a + b, 0) };
}
