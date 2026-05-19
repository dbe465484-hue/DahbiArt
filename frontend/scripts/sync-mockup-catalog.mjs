/**
 * Synchronise catalog.json depuis chaque metadata.json + background.*
 * Mode par défaut : hang (comme salon-beige — pas de cadre blanc).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const mockupsDir = path.join(root, "public", "mockups");
const catalogPath = path.join(mockupsDir, "catalog.json");

const BG_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

const HANG_DEFAULTS = {
  mode: "hang",
  feather: 0.012,
  wallTone: "#e5ddd3",
  blend: { brightness: 0.99, contrast: 1.01, saturation: 0.98 },
};

function findBackgroundFile(dir) {
  for (const ext of BG_EXTENSIONS) {
    const name = `background${ext}`;
    if (fs.existsSync(path.join(dir, name))) return name;
  }
  return (
    fs
      .readdirSync(dir)
      .find((f) => /^background\./i.test(f) && /\.(jpe?g|png|webp)$/i.test(f)) ?? null
  );
}

function loadMeta(dir, id, existing) {
  const metaPath = path.join(dir, "metadata.json");
  const fromFile = fs.existsSync(metaPath)
    ? JSON.parse(fs.readFileSync(metaPath, "utf8"))
    : {};
  return {
    name: fromFile.name ?? existing?.name ?? id.replace(/-/g, " "),
    category: fromFile.category ?? existing?.category ?? "maison",
    styles: fromFile.styles ?? existing?.styles ?? ["minimaliste"],
    mode: fromFile.mode ?? HANG_DEFAULTS.mode,
    placement: fromFile.placement ?? existing?.placement ?? {
      x: 0.38,
      y: 0.14,
      width: 0.2,
      height: 0.34,
    },
    feather: fromFile.feather ?? HANG_DEFAULTS.feather,
    wallTone: fromFile.wallTone ?? HANG_DEFAULTS.wallTone,
    blend: fromFile.blend ?? existing?.blend ?? HANG_DEFAULTS.blend,
    recommendedOrientations:
      fromFile.recommendedOrientations ??
      existing?.recommendedOrientations ?? ["portrait", "landscape"],
    tags: fromFile.tags ?? existing?.tags ?? ["personnalisé"],
  };
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const byId = new Map(catalog.mockups.map((m) => [m.id, m]));

const dirs = fs
  .readdirSync(mockupsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith("a-ajouter") && d.name !== "_modele");

let updated = 0;

for (const d of dirs) {
  const id = d.name;
  const dir = path.join(mockupsDir, id);
  const bgFile = findBackgroundFile(dir);
  if (!bgFile) {
    console.warn(`⚠ ${id} — pas de background`);
    continue;
  }

  const existing = byId.get(id);
  const meta = loadMeta(dir, id, existing);

  const entry = {
    id,
    name: meta.name,
    category: meta.category,
    styles: meta.styles,
    mode: meta.mode,
    background: `/mockups/${id}/${bgFile}`,
    placement: meta.placement,
    feather: meta.feather,
    wallTone: meta.wallTone,
    blend: meta.blend,
    recommendedOrientations: meta.recommendedOrientations,
    tags: meta.tags,
  };

  if (existing) {
    byId.set(id, entry);
    updated++;
    console.log(`✓ ${id} → mode=${entry.mode}, ${bgFile}`);
  }
}

catalog.mockups = catalog.mockups.map((m) => byId.get(m.id) ?? m);
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + "\n");
console.log(`\n${updated} mockup(s) synchronisé(s) (mode hang par défaut).`);
