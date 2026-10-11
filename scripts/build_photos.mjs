// Referenzfotos (assets/refs) -> public/photos/*.webp + lib/photos.ts
// Aufruf: node scripts/build_photos.mjs
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sharp = createRequire(import.meta.url)("sharp");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const refs = path.join(root, "assets/refs");
const out = path.join(root, "public/photos");
fs.mkdirSync(out, { recursive: true });

// id, Quelle, Alt-Text, längste Kante, Fokuspunkt (für object-position)
const photos = [
  ["hero-hand", "ref-15.webp", "Hand hält eine Torte im Schokoladen-Spitzenmantel mit Feigen, Physalis und Beeren vor einem mintgrünen Vorhang", 1800, "50% 40%"],
  ["lace-berries", "ref-7.webp", "Torte im Schokoladen-Spitzenmantel, gefüllt mit Himbeeren, Erdbeeren und Blaubeeren", 1600, "50% 55%"],
  ["lace-fruit-top", "IMG_5739.jpg", "Torte mit Schokoladen-Spitze von oben, belegt mit Feigen, Physalis, Erdbeeren und Kiwibeeren", 1600, "50% 50%"],
  ["lace-dark-berries", "IMG_5736.jpg", "Dunkle Beerentorte mit Schokoladen-Spitze von oben, Brombeeren, Himbeeren und Heidelbeeren", 1400, "50% 40%"],
  ["tartlets", "IMG_5705.jpg", "Mürbeteig-Schiffchen mit Sahne und Himbeeren, frisch dekoriert", 1400, "50% 50%"],
  ["drip-roses", "ref-4.jpg", "Zweistöckige Drip-Torte mit Schokoladen-Ganache, Beeren und roten Rosen auf goldverziertem Teller", 1400, "50% 45%"],
  ["cream-roses", "ref-9.webp", "Sahnetorte mit roten Rosen, Erdbeeren, Himbeeren, Minze und Schokostreuseln", 1600, "50% 40%"],
  ["slice-blue", "ref-10.jpg", "Angeschnittenes Tortenstück mit blauem Biskuit, rosa Creme und Beeren", 1400, "50% 45%", false, "warm"],
  ["slice-blue-close", "ref-17.webp", "Stück blaue Biskuittorte mit Heidelbeeren, Himbeere und Minze auf einem Teller mit blau gezeichneter Taube, daneben Beeren und Krümel", 1400, "50% 45%"],
  ["easter-berries", "ref-19.webp", "Torte mit Schokoladen-Spitze, Beerenringen aus Erdbeeren, Himbeeren und Heidelbeeren und einem Schokoladenhasen im Gras-Nest", 1400, "50% 45%"],
  ["glaze-roses", "ref-21.jpg", "Torte mit glänzender dunkler Glasur, rosa Cremerosen und goldener Schrift", 1400, "50% 40%"],
  ["mirror-slice", "IMG_7611.jpg", "Tortenstück mit roter Spiegelglasur und einer Erdbeere auf einem blauen Teller", 1400, "50% 40%"],
  ["slice-table", "ref-11.webp", "Stück blaue Biskuittorte mit Beeren auf einem Teller mit Taube, gedeckter Tisch mit Stickerei-Tischdecke", 1600, "30% 60%"],
  ["tart-dove", "ref-6.jpg", "Beeren-Tarte mit Schokoladen-Spitze auf einem Teller mit blau gezeichneter Taube", 1400, "50% 50%"],
  ["lace-tights", "ref-5.webp", "Frucht-Torte im Schokoladen-Spitzenmantel auf festlich gedecktem Tisch, darüber Beine in weißer Spitzen-Strumpfhose", 1600, "50% 70%"],
  ["cupcake-shoes", "ref-3.webp", "Zwei Cupcakes mit Keks-Absatzschuhen auf einem silbernen Tortenständer vor grünem Hintergrund", 1400, "50% 55%"],
  ["jelly-slices", "ref-8.webp", "Drei Stücke Obst-Gelee-Torte mit Mandarinen auf silbernem Tortenständer vor grünem Hintergrund", 1400, "50% 55%"],
  ["flake-roses", "ref-12.jpg", "Torte mit Schokoladen-Raspeln und weißen Fondant-Rosen auf Spitzendeckchen", 1400, "50% 50%"],
  // freigestellt (Alpha), ohne Blur-Platzhalter
  ["lora", "lora-cutout.png", "Lora, die Konditorin hinter Loras Bakery, in weißer Bluse", 1100, "50% 30%", true],
  ["cake-cutout", "cake-cutout.webp", "Zweistöckige Torte in handgespritzter Schokoladen-Spitze mit frischen Beeren und Minze", 1100, "50% 50%", true],
];

const manifest = {};
for (const [id, src, alt, long, pos, alpha, grade] of photos) {
  const file = path.join(refs, src);
  let img = sharp(file).rotate();
  if (grade === "warm") {
    // Licht und Colour-Grading: weniger Rauschen, mehr Luft in den Schatten, warmes Weiß, kräftigeres Teal, weiche Vignette
    const m0 = await img.clone().metadata();
    const base = await img.clone().median(3).modulate({ brightness: 1.09, saturation: 1.2 }).gamma(1.12).recomb([[1.05, 0.01, 0], [0, 1.0, 0], [0, -0.01, 0.9]]).linear(1.04, 6).sharpen({ sigma: 0.8, m1: 0.6, m2: 1.4 }).toBuffer();
    const W = m0.width, H = m0.height;
    const vig = Buffer.from(`<svg width="${W}" height="${H}"><defs><radialGradient id="v" cx="50%" cy="48%" r="75%"><stop offset="55%" stop-color="#2f1a14" stop-opacity="0"/><stop offset="100%" stop-color="#2f1a14" stop-opacity="0.32"/></radialGradient><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff4e2" stop-opacity="0.16"/><stop offset="0.5" stop-color="#fff4e2" stop-opacity="0"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#v)"/><rect width="100%" height="100%" fill="url(#g)"/></svg>`);
    img = sharp(base).composite([{ input: vig }]);
  }
  const meta = await sharp(await img.clone().toBuffer()).metadata();
  const resized = img.clone().resize({ width: long, height: long, fit: "inside", withoutEnlargement: true });
  const buf = await resized.webp({ quality: alpha ? 88 : 84, alphaQuality: 92, effort: 5 }).toBuffer({ resolveWithObject: true });
  fs.writeFileSync(path.join(out, `${id}.webp`), buf.data);
  const blur = alpha ? null : await sharp(buf.data).resize(14).blur(0.6).jpeg({ quality: 55 }).toBuffer();
  manifest[id] = { id, alt, w: buf.info.width, h: buf.info.height, pos, blur: blur ? `data:image/jpeg;base64,${blur.toString("base64")}` : "" };
  console.log(id.padEnd(20), `${buf.info.width}x${buf.info.height}`, `${Math.round(buf.data.length / 1024)} kB`);
}

const ts = `// Automatisch erzeugt von scripts/build_photos.mjs. Nicht von Hand ändern.
export type Photo = { id: string; alt: string; w: number; h: number; pos: string; blur: string };

export const photos = ${JSON.stringify(manifest, null, 2)} as const satisfies Record<string, Photo>;

export type PhotoId = keyof typeof photos;
`;
fs.writeFileSync(path.join(root, "lib/photos.ts"), ts);
