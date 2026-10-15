// Baut die hochauflösende Torte (cake-ultra.glb) aus dem Original: 1,67 Mio. Dreiecke (aus 5,7 Mio.), Normal-Map in 4K
// aus dem Original gebacken (blender/bake_hq.py), neu gegradetes 4K-Albedo, AO in 2K. Meshopt + WebP.
// Aufruf (Abhängigkeiten @gltf-transform/{core,extensions,functions}, meshoptimizer, sharp liegen im Werkzeugordner):
//   node build_model_ultra.mjs <assets/model> <out.glb>
import { NodeIO } from "@gltf-transform/core";
import { EXTMeshoptCompression, KHRMeshQuantization, EXTTextureWebP } from "@gltf-transform/extensions";
import { textureCompress, meshopt, quantize, prune } from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptDecoder } from "meshoptimizer";
import sharp from "sharp";
import { readFileSync } from "node:fs";

const [dir, out] = process.argv.slice(2);
await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMeshQuantization, EXTTextureWebP]).registerDependencies({ "meshopt.encoder": MeshoptEncoder, "meshopt.decoder": MeshoptDecoder });
const doc = await io.read(`${dir}/mid15.glb`);
const mat = doc.getRoot().listMaterials()[0];
const mk = (name, buf, mime) => doc.createTexture(name).setImage(buf).setMimeType(mime);
const old = [mat.getBaseColorTexture(), mat.getNormalTexture()];
const aoBuf = await sharp(`${dir}/ao15.png`).resize(2048, 2048).blur(1.2).png().toBuffer();
mat.setBaseColorTexture(mk("albedo", readFileSync(`${dir}/base_graded.png`), "image/png"));
mat.setNormalTexture(mk("normal", readFileSync(`${dir}/n15.png`), "image/png"));
mat.setOcclusionTexture(mk("ao", aoBuf, "image/png")).setOcclusionStrength(1.0);
old.forEach((t) => t && t.dispose());
mat.setDoubleSided(false);
await doc.transform(
  textureCompress({ encoder: sharp, targetFormat: "webp", slots: /baseColor/, quality: 90 }),
  textureCompress({ encoder: sharp, targetFormat: "webp", slots: /normal/, quality: 94 }),
  textureCompress({ encoder: sharp, targetFormat: "webp", slots: /occlusion|metallicRoughness/, quality: 86 }),
  prune(),
  quantize(),
  meshopt({ encoder: MeshoptEncoder, level: "high" }),
);
await io.write(out, doc);
console.log("written", out);
