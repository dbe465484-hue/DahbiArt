import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(root, "..", "tableaux");
const outDir = path.join(root, "public", "paintings");
const catalogPath = path.join(root, "src", "data", "paintings-catalog.json");

const MAX_WIDTH = 1600;
const WEBP_QUALITY = 82;

if (!fs.existsSync(sourceDir)) {
  console.error("Dossier introuvable :", sourceDir);
  process.exit(1);
}

if (!fs.existsSync(catalogPath)) {
  console.error("Catalogue absent. Lancez : npm run tableaux:build-catalog");
  process.exit(1);
}

const { paintings } = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
fs.mkdirSync(outDir, { recursive: true });

console.log(`${paintings.length} œuvre(s) à synchroniser\n`);

const manifest = [];

for (const p of paintings) {
  const srcPath = path.join(sourceDir, p.sourceFile);
  if (!fs.existsSync(srcPath)) {
    console.warn(`⚠ ${p.slug} — fichier source manquant : ${p.sourceFile}`);
    continue;
  }

  const destPath = path.join(outDir, `${p.slug}.webp`);
  const before = fs.statSync(srcPath).size;

  await sharp(srcPath)
    .rotate()
    .resize(MAX_WIDTH, MAX_WIDTH, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(destPath);

  const after = fs.statSync(destPath).size;
  const pct = ((1 - after / before) * 100).toFixed(0);
  console.log(`✓ ${p.slug}.webp  ← ${p.sourceFile}  (${pct}% plus léger)`);
  manifest.push({ slug: p.slug, file: `/paintings/${p.slug}.webp`, source: p.sourceFile });
}

fs.writeFileSync(
  path.join(outDir, "manifest.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), items: manifest }, null, 2),
);

console.log(`\nTerminé. ${manifest.length} image(s) dans public/paintings/`);
