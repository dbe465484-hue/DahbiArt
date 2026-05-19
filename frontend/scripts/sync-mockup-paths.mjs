import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const mockupsDir = path.join(root, "public", "mockups");
const catalogPath = path.join(mockupsDir, "catalog.json");

const EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

function findBackgroundFile(id) {
  const dir = path.join(mockupsDir, id);
  if (!fs.existsSync(dir)) return null;
  for (const ext of EXTENSIONS) {
    const name = `background${ext}`;
    if (fs.existsSync(path.join(dir, name))) return name;
  }
  return (
    fs
      .readdirSync(dir)
      .find((f) => /^background\./i.test(f) && /\.(jpe?g|png|webp)$/i.test(f)) ?? null
  );
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
let updated = 0;

for (const mockup of catalog.mockups) {
  const file = findBackgroundFile(mockup.id);
  if (!file) {
    console.warn(`⚠ ${mockup.id} — aucune image background trouvée`);
    continue;
  }
  const next = `/mockups/${mockup.id}/${file}`;
  if (mockup.background !== next) {
    mockup.background = next;
    updated++;
    console.log(`✓ ${mockup.id} → ${file}`);
  }
}

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + "\n");
console.log(`\n${updated} chemin(s) mis à jour dans catalog.json`);
