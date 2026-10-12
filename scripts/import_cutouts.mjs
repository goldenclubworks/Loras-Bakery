// Freisteller aus Loras eigenen, sauber ausgeschnittenen PNGs (assets/refs/user/c-*.png) für das Web aufbereiten.
// Aufruf: node scripts/import_cutouts.mjs [--sheet=pfad.png]
//
// Pro Datei: Teile trennen (z. B. zwei Johannisbeeren), weißen Rand-Saum aus halbtransparenten Randpixeln entfernen,
// auf Objektgröße zuschneiden (mit 3 px transparentem Rand), auf höchstens 300 px verkleinern (angezeigt werden sie mit höchstens 130 px,
// also reicht das für 2x-Displays) und als WebP schreiben.
// Danach lib/ingredients.ts (Maße) neu erzeugen und jedes Teil prüfen: berührt die Maske den Bildrand, bricht das Skript ab.
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sharp = createRequire(import.meta.url)("sharp");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "assets/refs/user");
const out = path.join(root, "public/ingredients");
fs.mkdirSync(out, { recursive: true });

/** Datei → ein oder mehrere Teile (von links nach rechts bzw. oben nach unten benannt), max = längste Kante in px */
const items = [
  { file: "c-strawberry.png", names: ["strawberry"], max: 300 },
  { file: "c-blueberry.png", names: ["blueberry"], max: 300 },
  { file: "c-arils.png", names: ["aril-a", "aril-b"], max: 300 },
  { file: "c-mint-sprig.png", names: ["mint-sprig"], max: 320 },
  { file: "c-mint-leaves.png", names: ["mint-leaf-a", "mint-leaf-b"], max: 300 },
  { file: "c-raspberry-top.png", names: ["raspberry-top"], max: 300 },
  { file: "c-raspberry-side.png", names: ["raspberry-side"], max: 300 },
  { file: "c-sprinkles.png", names: ["sprinkles"], max: 340, keepAll: true },
  { file: "c-currants.png", names: ["currant-a", "currant-b"], max: 300 },
  { file: "c-currant-big.png", names: ["currant-big"], max: 300 },
];

const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

/** Zusammenhängende Teile (Alpha > thr). Gibt Label-Feld und Flächen zurück. */
function label(alpha, w, h, thr = 40) {
  const lab = new Int32Array(w * h);
  const areas = [0];
  const stack = [];
  let id = 0;
  for (let s = 0; s < alpha.length; s++) {
    if (alpha[s] <= thr || lab[s]) continue;
    id++;
    let area = 0;
    stack.push(s);
    lab[s] = id;
    while (stack.length) {
      const p = stack.pop();
      area++;
      const x = p % w;
      const y = (p / w) | 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          const xx = x + dx, yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
          const q = yy * w + xx;
          if (alpha[q] > thr && !lab[q]) { lab[q] = id; stack.push(q); }
        }
      }
    }
    areas.push(area);
  }
  return { lab, areas, count: id };
}

/** Halbtransparente Randpixel, die deutlich heller sind als das nächste solide Pixel, auf dessen Farbe zurückziehen. */
function despill(data, w, h) {
  const copy = Uint8ClampedArray.from(data);
  let fixed = 0;
  for (let y = 4; y < h - 4; y++) {
    for (let x = 4; x < w - 4; x++) {
      const i = (y * w + x) * 4;
      const a = copy[i + 3];
      if (a < 10 || a > 215) continue;
      let best = -1;
      outer: for (let r = 1; r <= 4; r++) {
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
            const j = ((y + dy) * w + (x + dx)) * 4;
            if (copy[j + 3] > 250) { best = j; break outer; }
          }
        }
      }
      if (best < 0) continue;
      const d = lum(copy[i], copy[i + 1], copy[i + 2]) - lum(copy[best], copy[best + 1], copy[best + 2]);
      if (d > 35) {
        const k = 0.8;
        data[i] = copy[i] * (1 - k) + copy[best] * k;
        data[i + 1] = copy[i + 1] * (1 - k) + copy[best + 1] * k;
        data[i + 2] = copy[i + 2] * (1 - k) + copy[best + 2] * k;
        fixed++;
      }
    }
  }
  return fixed;
}

const written = [];
for (const it of items) {
  const { data: raw, info } = await sharp(path.join(src, it.file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;
  const data = new Uint8ClampedArray(raw);
  const alpha = new Uint8Array(w * h);
  for (let i = 0; i < alpha.length; i++) alpha[i] = data[i * 4 + 3];
  const { lab, areas, count } = label(alpha, w, h);
  // Teile: alle, deren Fläche mindestens 8 % der größten beträgt (Rest = Staub), oder bei keepAll alles zusammen
  const maxArea = Math.max(...areas);
  let groups;
  if (it.keepAll) groups = [Array.from({ length: count }, (_, k) => k + 1).filter((k) => areas[k] > 60)];
  else groups = Array.from({ length: count }, (_, k) => k + 1).filter((k) => areas[k] >= maxArea * 0.08).map((k) => [k]);
  if (groups.length !== it.names.length) {
    console.log(`FEHLER ${it.file}: ${groups.length} Teile gefunden, ${it.names.length} erwartet`);
    process.exitCode = 1;
    continue;
  }
  // Reihenfolge links→rechts (bei fast gleicher x-Lage oben→unten)
  const boxes = groups.map((g) => {
    let x0 = w, y0 = h, x1 = 0, y1 = 0;
    const set = new Set(g);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (set.has(lab[y * w + x])) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    return { g, set, x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
  });
  boxes.sort((a, b) => (Math.abs(a.cx - b.cx) > 200 ? a.cx - b.cx : a.cy - b.cy));
  for (let n = 0; n < boxes.length; n++) {
    const b = boxes[n];
    const pad = 6;
    const x0 = Math.max(0, b.x0 - pad), y0 = Math.max(0, b.y0 - pad), x1 = Math.min(w - 1, b.x1 + pad), y1 = Math.min(h - 1, b.y1 + pad);
    const cw = x1 - x0 + 1, ch = y1 - y0 + 1;
    const piece = new Uint8ClampedArray(cw * ch * 4);
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        const s = (y0 + y) * w + (x0 + x);
        const d = (y * cw + x) * 4;
        // nur Pixel dieses Teils (und sein Rand-Halo bis Alpha > 0 in der Nähe) übernehmen
        const own = it.keepAll || b.set.has(lab[s]) || (lab[s] === 0 && alpha[s] > 0);
        if (!own) continue;
        piece[d] = data[s * 4]; piece[d + 1] = data[s * 4 + 1]; piece[d + 2] = data[s * 4 + 2];
        // Rand-Haze (Alpha < 24) abschneiden, Alpha darüber leicht straffen
        const a = data[s * 4 + 3];
        piece[d + 3] = a < 24 ? 0 : Math.min(255, Math.round(((a - 24) / (236 - 24)) * 255));
      }
    }
    const fixed = despill(piece, cw, ch);
    // auf tatsächlichen Alpha-Bereich zuschneiden, 3 px Luft
    let ax0 = cw, ay0 = ch, ax1 = 0, ay1 = 0;
    for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) if (piece[(y * cw + x) * 4 + 3] > 8) { if (x < ax0) ax0 = x; if (x > ax1) ax1 = x; if (y < ay0) ay0 = y; if (y > ay1) ay1 = y; }
    if (ax0 <= 0 || ay0 <= 0 || ax1 >= cw - 1 || ay1 >= ch - 1) { console.log(`FEHLER ${it.names[n]}: Maske berührt den Rand (angeschnitten)`); process.exitCode = 1; continue; }
    const tight = await sharp(Buffer.from(piece.buffer), { raw: { width: cw, height: ch, channels: 4 } })
      .extract({ left: Math.max(0, ax0 - 3), top: Math.max(0, ay0 - 3), width: Math.min(cw, ax1 - ax0 + 7), height: Math.min(ch, ay1 - ay0 + 7) })
      .toBuffer({ resolveWithObject: true });
    const scale = Math.min(1, it.max / Math.max(tight.info.width, tight.info.height));
    const img = sharp(tight.data, { raw: { width: tight.info.width, height: tight.info.height, channels: 4 } });
    const resized = scale < 1 ? img.resize(Math.round(tight.info.width * scale), Math.round(tight.info.height * scale), { kernel: "lanczos3" }) : img;
    const { data: webp, info: wi } = await resized.webp({ quality: 84, alphaQuality: 92, effort: 6, smartSubsample: false }).toBuffer({ resolveWithObject: true });
    fs.writeFileSync(path.join(out, `${it.names[n]}.webp`), webp);
    written.push(it.names[n]);
    console.log(it.names[n].padEnd(16), `${wi.width}x${wi.height}`.padEnd(10), `${Math.round(webp.length / 1024)} kB`.padEnd(8), `Saum korrigiert: ${fixed}`);
  }
}

// alte Freisteller entfernen, die nicht mehr zum Satz gehören
for (const f of fs.readdirSync(out)) {
  if (f.endsWith(".webp") && !written.includes(f.replace(".webp", ""))) { fs.unlinkSync(path.join(out, f)); console.log("entfernt:", f); }
}

// Maße für die Komponente
const all = {};
for (const f of fs.readdirSync(out).filter((f) => f.endsWith(".webp")).sort()) {
  const m = await sharp(path.join(out, f)).metadata();
  all[f.replace(".webp", "")] = [m.width, m.height];
}
fs.writeFileSync(
  path.join(root, "lib/ingredients.ts"),
  `// Automatisch erzeugt von scripts/import_cutouts.mjs. Nicht von Hand ändern.\nexport const ingredientSize = ${JSON.stringify(all, null, 2)} as const satisfies Record<string, readonly [number, number]>;\n\nexport type IngredientName = keyof typeof ingredientSize;\n`,
);

const sheetArg = process.argv.find((a) => a.startsWith("--sheet="))?.slice(8);
if (sheetArg) {
  const bgs = ["#f7efe6", "#ebc4c4", "#2f4f43", "#3c1e34", "#ffffff"];
  const names = Object.keys(all);
  const cell = 150, labelH = 14;
  const comps = [];
  for (let r = 0; r < names.length; r++) {
    const buf = await sharp(path.join(out, `${names[r]}.webp`)).resize(cell - 20, cell - 20, { fit: "inside" }).png().toBuffer();
    const m = await sharp(buf).metadata();
    for (let c = 0; c < bgs.length; c++) {
      comps.push({ input: { create: { width: cell, height: cell, channels: 3, background: bgs[c] } }, left: c * cell, top: r * (cell + labelH) });
      comps.push({ input: buf, left: c * cell + Math.round((cell - m.width) / 2), top: r * (cell + labelH) + Math.round((cell - m.height) / 2) });
    }
    comps.push({ input: Buffer.from(`<svg width="${cell * bgs.length}" height="${labelH}"><rect width="100%" height="100%" fill="#222"/><text x="4" y="11" font-size="11" fill="#fff" font-family="Arial">${names[r]}</text></svg>`), left: 0, top: r * (cell + labelH) + cell });
  }
  await sharp({ create: { width: cell * bgs.length, height: names.length * (cell + labelH), channels: 3, background: "#fff" } }).composite(comps).png().toFile(sheetArg);
  console.log("Kontaktbogen:", sheetArg);
}
