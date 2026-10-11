// Freisteller (Zutaten) aus den Referenzfotos. Aufruf: node scripts/make_ingredients.mjs [name,name] [--sheet=pfad.png]
// Schreibt public/ingredients/*.webp und lib/ingredients.ts, prüft jedes Objekt (nicht angeschnitten) und erzeugt auf Wunsch einen Kontaktbogen.
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { matte } from "./lib/matte.mjs";

const sharp = createRequire(import.meta.url)("sharp");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const refs = path.join(root, "assets/refs");
const outDir = path.join(root, "public/ingredients");
const work = path.join(root, "assets/ingredients/_work");
fs.mkdirSync(path.join(work, "crops"), { recursive: true });
fs.mkdirSync(path.join(work, "cut"), { recursive: true });
fs.mkdirSync(outDir, { recursive: true });

const red = (r, g, b) => r > 100 && r > g * 1.5 && r > b * 1.3;
const green = (r, g, b) => g > 60 && g > r * 1.04 && g > b * 1.06;
const teal = (r, g, b) => g > r * 1.35 && b > r * 1.1 && g > 70;

// name, Quelle, Ausschnitt [x0,y0,x1,y1] im (EXIF-gedrehten) Original, Optionen für matte()
const items = [
  ["raspberry-a", "ref-17.webp", [520, 880, 710, 1060], { keep: red }],
  ["raspberry-b", "IMG_5736.jpg", [2330, 2050, 2770, 2470], {}],
  ["currant-b", "ref-17.webp", [80, 985, 205, 1100], { circle: [62, 55, 34] }],
  ["currant-c", "ref-17.webp", [150, 985, 290, 1105], { circle: [62, 59, 38] }],
  ["aril-a", "ref-17.webp", [315, 1060, 450, 1185], {}],
  ["mint-a", "ref-17.webp", [570, 285, 790, 420], { keep: green }],
  ["strawberry-e", "IMG_5739.jpg", [1480, 2780, 2180, 3480], {
    poly: [[100,300],[120,240],[170,190],[240,155],[300,140],[350,140],[420,185],[470,235],[510,300],[540,370],[548,430],[540,480],[500,515],[430,540],[392,548],[392,620],[360,615],[345,560],[300,540],[280,560],[250,600],[220,640],[205,640],[205,600],[235,550],[260,530],[200,500],[120,490],[85,475],[90,455],[110,440]],
    keep: (r, g, b, x, y) => !(x < 150 && y < 460 && g > r) && !(x > 380 && y < 340 && g > 140 && b > 100 && r > 180),
  }],
];

const args = process.argv.slice(2);
const only = args.find((a) => !a.startsWith("--"))?.split(",") ?? null;
const sheetArg = args.find((a) => a.startsWith("--sheet="))?.slice(8);
const manifest = fs.existsSync(path.join(root, "lib/ingredients.json")) ? JSON.parse(fs.readFileSync(path.join(root, "lib/ingredients.json"), "utf8")) : {};
let failed = 0;

for (const [name, src, [x0, y0, x1, y1], opts] of items) {
  if (only && !only.includes(name)) continue;
  const crop = path.join(work, "crops", `${name}.png`);
  await sharp(path.join(refs, src)).rotate().extract({ left: x0, top: y0, width: x1 - x0, height: y1 - y0 }).png().toFile(crop);
  const cut = path.join(work, "cut", `${name}.png`);
  try {
    execFileSync(path.join(root, ".venv/bin/python"), [path.join(root, "scripts/cutout.py"), crop, cut], { stdio: "pipe" });
  } catch (e) {
    console.log(name.padEnd(14), "FEHLER Vision", String(e.stderr || e.message).slice(0, 80));
    failed++; continue;
  }
  const m = await matte(cut, opts);
  if (m.touchesEdge) { console.log(name.padEnd(14), "FEHLER: angeschnitten (Ausschnitt größer wählen)"); failed++; continue; }
  const img = sharp(m.rgba, { raw: { width: m.width, height: m.height, channels: 4 } });
  const scale = Math.min(1, 420 / Math.max(m.width, m.height));
  const resized = scale < 1 ? img.resize(Math.round(m.width * scale), Math.round(m.height * scale), { kernel: "lanczos3" }) : img;
  const { data, info } = await resized.webp({ quality: 92, alphaQuality: 100, effort: 5, smartSubsample: false }).toBuffer({ resolveWithObject: true });
  fs.writeFileSync(path.join(outDir, `${name}.webp`), data);
  manifest[name] = [info.width, info.height];
  console.log(name.padEnd(14), `${info.width}x${info.height}`, `${Math.round(data.length / 1024)} kB`);
}

// Maße für die Komponente (immer aus den Dateien auf der Platte, damit nichts von Hand gepflegt wird)
const all = {};
for (const f of fs.readdirSync(outDir).filter((f) => f.endsWith(".webp")).sort()) { const m = await sharp(path.join(outDir, f)).metadata(); all[f.replace(".webp", "")] = [m.width, m.height]; }
fs.writeFileSync(path.join(root, "lib/ingredients.ts"), `// Automatisch erzeugt von scripts/make_ingredients.mjs. Nicht von Hand ändern.\nexport const ingredientSize = ${JSON.stringify(all, null, 2)} as const satisfies Record<string, readonly [number, number]>;\n\nexport type IngredientName = keyof typeof ingredientSize;\n`);

if (sheetArg) {
  const bgs = ["#f7efe6", "#ebc4c4", "#2f4f43", "#3c1e34", "#ffffff"];
  const names = Object.keys(all);
  const cell = 150, labelH = 14;
  const cols = bgs.length, rows = names.length;
  const comps = [];
  for (let r = 0; r < rows; r++) {
    const buf = await sharp(path.join(outDir, `${names[r]}.webp`)).resize(cell - 20, cell - 20, { fit: "inside" }).png().toBuffer();
    const m = await sharp(buf).metadata();
    for (let c = 0; c < cols; c++) {
      comps.push({ input: { create: { width: cell, height: cell, channels: 3, background: bgs[c] } }, left: c * cell, top: r * (cell + labelH) });
      comps.push({ input: buf, left: c * cell + Math.round((cell - m.width) / 2), top: r * (cell + labelH) + Math.round((cell - m.height) / 2) });
    }
    comps.push({ input: Buffer.from(`<svg width="${cell * cols}" height="${labelH}"><rect width="100%" height="100%" fill="#222"/><text x="4" y="11" font-size="11" fill="#fff" font-family="Arial">${names[r]}</text></svg>`), left: 0, top: r * (cell + labelH) + cell });
  }
  await sharp({ create: { width: cell * cols, height: rows * (cell + labelH), channels: 3, background: "#fff" } }).composite(comps).png().toFile(sheetArg);
  console.log("Kontaktbogen:", sheetArg);
}
if (failed) { console.log(`\n${failed} Objekt(e) nicht erzeugt`); process.exitCode = 1; }
