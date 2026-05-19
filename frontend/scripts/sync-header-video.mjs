import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const candidates = [
  path.join(root, "public", "videos"),
  path.join(root, "..", "headervid"),
  path.join(root, "headervid"),
  path.join(root, "public", "headervid"),
  path.join(root, "..", "videos"),
];

const outDir = path.join(root, "public", "videos");
const VIDEO_EXT = /\.(mp4|webm|mov)$/i;

const sourceDir = candidates.find((d) => fs.existsSync(d));
if (!sourceDir) {
  console.error("Dossier headervid introuvable. Créez : Mayn/headervid/ et y placez votre .mp4");
  process.exit(1);
}

const files = fs
  .readdirSync(sourceDir)
  .filter((f) => VIDEO_EXT.test(f) && !/^hero\./i.test(f))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

if (files.length === 0) {
  console.error(`Aucune vidéo dans ${sourceDir}`);
  process.exit(1);
}

const src = path.join(sourceDir, files[0]);
const ext = path.extname(src).toLowerCase();
fs.mkdirSync(outDir, { recursive: true });

const dest = path.join(outDir, `hero${ext}`);
fs.copyFileSync(src, dest);

const rel = `/videos/hero${ext}`;
const generated = path.join(root, "src", "lib", "hero-video.generated.ts");
fs.writeFileSync(
  generated,
  `/** Généré par npm run video:sync — ne pas modifier */\nexport const HERO_VIDEO_SRC = "${rel}";\n`,
);

console.log(`✓ ${files[0]} → public/videos/hero${ext}`);
console.log(`✓ ${generated}`);
console.log(`  Lecture en boucle sur l'accueil : ${rel}`);
