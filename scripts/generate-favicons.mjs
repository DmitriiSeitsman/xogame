import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pngToIco from "png-to-ico";
import sharp from "sharp";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(rootDir, "public");
const svgPath = join(publicDir, "favicon.svg");
const svg = readFileSync(svgPath);

const icoSizes = [16, 32, 48];
const icoPngs = await Promise.all(
  icoSizes.map((size) => sharp(svg).resize(size, size).png().toBuffer()),
);

writeFileSync(join(publicDir, "favicon.ico"), await pngToIco(icoPngs));

await sharp(svg).resize(180, 180).png().toFile(join(publicDir, "apple-touch-icon.png"));

console.log("Generated public/favicon.ico and public/apple-touch-icon.png from public/favicon.svg");
