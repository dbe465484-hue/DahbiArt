/**
 * Applique les placements de référence (mockup-placements.json) dans chaque metadata.json
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const mockupsDir = path.join(root, "public", "mockups");
const placements = JSON.parse(
  fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "mockup-placements.json"), "utf8"),
);

for (const [id, placement] of Object.entries(placements)) {
  const dir = path.join(mockupsDir, id);
  const metaPath = path.join(dir, "metadata.json");
  if (!fs.existsSync(metaPath)) {
    console.warn(`⚠ ${id} — metadata absent`);
    continue;
  }
  const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
  meta.mode = "hang";
  meta.placement = { ...placement, rotation: 0 };
  meta.feather = meta.feather ?? 0.012;
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n");
  console.log(`✓ ${id}`);
}

console.log("\nLancez: npm run mockups:sync-catalog");
