import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dropDir = path.join(root, "public", "mockups", "a-ajouter");
const mockupsDir = path.join(root, "public", "mockups");
const catalogPath = path.join(mockupsDir, "catalog.json");

const IMAGE_NAMES = ["background.jpg", "background.jpeg", "background.png"];

const DEFAULT_META = {
  category: "maison",
  styles: ["minimaliste"],
  mode: "hang",
  placement: { x: 0.38, y: 0.12, width: 0.2, height: 0.36 },
  feather: 0.012,
  wallTone: "#e5ddd3",
  blend: { brightness: 0.99, contrast: 1.01, saturation: 0.98 },
  recommendedOrientations: ["portrait", "landscape"],
  tags: ["personnalisé"],
};

function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function findImage(dir) {
  for (const name of IMAGE_NAMES) {
    const p = path.join(dir, name);
    if (fs.existsSync(p)) return p;
  }
  const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  return files[0] ? path.join(dir, files[0]) : null;
}

function loadMeta(dir, id) {
  const metaPath = path.join(dir, "metadata.json");
  const base = { ...DEFAULT_META, name: id.replace(/-/g, " ") };
  if (!fs.existsSync(metaPath)) return base;
  return { ...base, ...JSON.parse(fs.readFileSync(metaPath, "utf8")) };
}

function toCatalogEntry(id, meta, bgFile = "background.jpg") {
  return {
    id,
    name: meta.name,
    category: meta.category,
    styles: meta.styles ?? DEFAULT_META.styles,
    mode: meta.mode ?? "hang",
    background: `/mockups/${id}/${bgFile}`,
    placement: meta.placement,
    feather: meta.feather ?? DEFAULT_META.feather,
    wallTone: meta.wallTone ?? DEFAULT_META.wallTone,
    blend: meta.blend ?? DEFAULT_META.blend,
    recommendedOrientations:
      meta.recommendedOrientations ?? DEFAULT_META.recommendedOrientations,
    tags: meta.tags ?? DEFAULT_META.tags,
  };
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const entries = fs
  .readdirSync(dropDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith("_"));

if (entries.length === 0) {
  console.log("Aucun dossier à importer dans public/mockups/a-ajouter/");
  console.log("Créez par ex. a-ajouter/mon-salon/background.jpg");
  process.exit(0);
}

let imported = 0;

for (const entry of entries) {
  const id = slugify(entry.name);
  const srcDir = path.join(dropDir, entry.name);
  const imageSrc = findImage(srcDir);

  if (!imageSrc) {
    console.warn(`⊘ ${entry.name} — pas d'image (background.jpg ou .png attendu)`);
    continue;
  }

  const destDir = path.join(mockupsDir, id);
  fs.mkdirSync(destDir, { recursive: true });
  const ext = path.extname(imageSrc).toLowerCase() || ".jpg";
  const bgFile = `background${ext}`;
  fs.copyFileSync(imageSrc, path.join(destDir, bgFile));

  const meta = loadMeta(srcDir, id);
  fs.writeFileSync(path.join(destDir, "metadata.json"), JSON.stringify(meta, null, 2));

  const catalogEntry = toCatalogEntry(id, meta, bgFile);
  const idx = catalog.mockups.findIndex((m) => m.id === id);
  if (idx >= 0) catalog.mockups[idx] = catalogEntry;
  else catalog.mockups.push(catalogEntry);

  console.log(`✓ ${entry.name} → public/mockups/${id}/`);
  imported++;
}

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + "\n");
console.log(`\n${imported} mockup(s) importé(s). Catalogue mis à jour.`);
