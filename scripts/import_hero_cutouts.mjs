// Bereitet Loras freigestellte Spitzen-/Band-/Früchte-Ausschnitte für den Hero auf: trimmt, skaliert, schreibt WebP nach public/hero.
// Aufruf: node scripts/import_hero_cutouts.mjs <ordner mit 3.webp 4.webp 5.webp>
import sharp from "sharp";
const D = process.argv[2];
for (const [n, f, w] of [["lace-swirl", "3.webp", 660], ["lace-ribbon-r", "4.webp", 500], ["lace-ribbon-l", "5.webp", 470]]) {
  const t = await sharp(`${D}/${f}`).trim({ threshold: 2 }).toBuffer({ resolveWithObject: true });
  const info = await sharp(t.data).resize({ width: w }).webp({ quality: 78, alphaQuality: 90, effort: 5 }).toFile(`public/hero/${n}.webp`);
  console.log(n, `${info.width}x${info.height}`, info.size);
}
