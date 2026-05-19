/**
 * Détecte la zone blanche (cadre vide) sur chaque background et met à jour metadata.json
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const mockupsDir = path.join(root, "public", "mockups");
const BG_EXT = [".jpg", ".jpeg", ".png", ".webp"];

function findBg(dir) {
  for (const ext of BG_EXT) {
    const p = path.join(dir, `background${ext}`);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function isWhite(r, g, b, threshold = 238) {
  return r >= threshold && g >= threshold && b >= threshold;
}

async function detectWhiteFrame(bgPath) {
  const meta = await sharp(bgPath).metadata();
  const W = meta.width ?? 1920;
  const H = meta.height ?? 1280;
  const sampleW = 640;
  const sampleH = Math.round(H * (sampleW / W));

  const { data } = await sharp(bgPath)
    .resize(sampleW, sampleH, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const wallLimitY = Math.floor(sampleH * 0.78);
  let minX = sampleW;
  let minY = sampleH;
  let maxX = 0;
  let maxY = 0;
  let count = 0;

  for (let y = 0; y < wallLimitY; y++) {
    for (let x = 0; x < sampleW; x++) {
      const i = (y * sampleW + x) * 3;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (isWhite(r, g, b)) {
        count++;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (count < sampleW * sampleH * 0.002 || maxX <= minX) return null;

  const padX = Math.round((maxX - minX) * 0.04);
  const padY = Math.round((maxY - minY) * 0.04);
  minX = Math.max(0, minX + padX);
  minY = Math.max(0, minY + padY);
  maxX = Math.min(sampleW - 1, maxX - padX);
  maxY = Math.min(sampleH - 1, maxY - padY);

  return {
    x: minX / sampleW,
    y: minY / sampleH,
    width: (maxX - minX) / sampleW,
    height: (maxY - minY) / sampleH,
  };
}

const dirs = fs
  .readdirSync(mockupsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith("a-ajouter"));

for (const d of dirs) {
  const id = d.name;
  const dir = path.join(mockupsDir, id);
  const bg = findBg(dir);
  if (!bg) {
    console.warn(`⚠ ${id} — pas de background`);
    continue;
  }

  const placement = await detectWhiteFrame(bg);
  if (!placement) {
    console.warn(`⚠ ${id} — cadre blanc non détecté`);
    continue;
  }

  const metaPath = path.join(dir, "metadata.json");
  const existing = fs.existsSync(metaPath)
    ? JSON.parse(fs.readFileSync(metaPath, "utf8"))
    : { name: id };

  const updated = {
    ...existing,
    mode: "hang",
    placement: {
      x: Math.round(placement.x * 1000) / 1000,
      y: Math.round(placement.y * 1000) / 1000,
      width: Math.round(placement.width * 1000) / 1000,
      height: Math.round(placement.height * 1000) / 1000,
      rotation: 0,
    },
    feather: existing.feather ?? 0.012,
    wallTone: existing.wallTone ?? "#ffffff",
  };

  fs.writeFileSync(metaPath, JSON.stringify(updated, null, 2) + "\n");
  console.log(
    `✓ ${id} → x=${updated.placement.x} y=${updated.placement.y} w=${updated.placement.width} h=${updated.placement.height}`,
  );
}

console.log("\nLancez: npm run mockups:sync-catalog");
