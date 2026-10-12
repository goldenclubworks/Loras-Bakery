// Spitzenband aus Loras Referenz (assets/refs/user/lace-band.png) nahtlos verlängern.
// Aufruf: node scripts/build_lace.mjs [--preview=pfad.png]
//
// Das Foto zeigt drei große Blüten, die jeweils fast perfekt spiegelsymmetrisch sind (Achsen bei x = 408, 1086, 1766).
// Wir schneiden zwischen zwei Blütenachsen ein Stück aus und hängen es gespiegelt wieder an. An den Spiegelachsen sind
// die Pixelspalten identisch, deshalb gibt es keine Naht, und die Kachel lässt sich beliebig oft wiederholen.
//
// Ergebnis: public/lace/lace-band.avif + .webp (weiße Spitze mit transparentem Grund, horizontal wiederholbar) und lib/lace.ts (Maße).
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sharp = createRequire(import.meta.url)("sharp");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcFile = path.join(root, "assets/refs/user/lace-band.png");
const outDir = path.join(root, "public/lace");
fs.mkdirSync(outDir, { recursive: true });

const AXIS_A = 408, AXIS_B = 1086; // Spiegelachsen zweier Blüten (Original-Pixel)
const TOP = 111, BOTTOM = 601; // Bandhöhe mit 8 px Luft
const SCALE = 0.62; // Rastergröße der Kachel (für 2x-Displays bei 150 px CSS-Höhe)

const segW = AXIS_B - AXIS_A;
const seg = await sharp(srcFile).ensureAlpha().extract({ left: AXIS_A, top: TOP, width: segW, height: BOTTOM - TOP }).png().toBuffer();
const flip = await sharp(seg).flop().png().toBuffer();
const tileFull = await sharp({ create: { width: segW * 2, height: BOTTOM - TOP, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: seg, left: 0, top: 0 }, { input: flip, left: segW, top: 0 }])
  .png()
  .toBuffer();

// auf Zielgröße (gerade Breite, damit Kacheln exakt aneinanderstoßen)
const tw = Math.round((segW * 2 * SCALE) / 2) * 2;
const th = Math.round((BOTTOM - TOP) * SCALE);
const { data: lace, info } = await sharp(tileFull).resize(tw, th, { kernel: "lanczos3" }).raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height;
const laceWebp = await sharp(lace, { raw: { width: W, height: H, channels: 4 } }).webp({ quality: 80, alphaQuality: 85, effort: 6 }).toBuffer();
fs.writeFileSync(path.join(outDir, "lace-band.webp"), laceWebp);
// AVIF ist bei gleicher Optik etwa halb so groß; Browser ohne AVIF nehmen die WebP-Datei (siehe image-set in globals.css)
const laceAvif = await sharp(lace, { raw: { width: W, height: H, channels: 4 } }).avif({ quality: 58, effort: 6 }).toBuffer();
fs.writeFileSync(path.join(outDir, "lace-band.avif"), laceAvif);
const stale = path.join(outDir, "lace-plum.webp");
if (fs.existsSync(stale)) fs.unlinkSync(stale);

fs.writeFileSync(
  path.join(root, "lib/lace.ts"),
  `// Automatisch erzeugt von scripts/build_lace.mjs. Nicht von Hand ändern.\n/** Rastermaße der Kachel in px (Breite = eine volle Wiederholung, gespiegelt zusammengesetzt) */\nexport const laceTile = { w: ${W}, h: ${H} } as const;\n`,
);
console.log(`Kachel ${W}x${H}, lace-band.webp ${Math.round(laceWebp.length / 1024)} kB, lace-band.avif ${Math.round(laceAvif.length / 1024)} kB`);

const prev = process.argv.find((a) => a.startsWith("--preview="))?.slice(10);
if (prev) {
  // vier Kacheln nebeneinander auf Creme und Plum, um die Nähte zu prüfen
  const tile = await sharp(laceWebp).png().toBuffer();
  const n = 4;
  const comps = [];
  for (let i = 0; i < n; i++) { comps.push({ input: tile, left: i * W, top: 20 }); comps.push({ input: tile, left: i * W, top: H + 60 }); }
  await sharp({ create: { width: W * n, height: H * 2 + 100, channels: 3, background: "#3c1e34" } })
    .composite([{ input: { create: { width: W * n, height: H + 40, channels: 3, background: "#f0e4d6" } }, left: 0, top: 0 }, ...comps])
    .png()
    .toFile(prev);
  console.log("Vorschau:", prev);
}
