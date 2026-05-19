import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = path.join(
  root,
  "..",
  "frontend",
  "src",
  "data",
  "paintings-catalog.json",
);
const outPath = path.join(root, "src", "data", "paintings-seed.json");

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

const paintings = catalog.paintings.map((p) => ({
  title: p.title,
  slug: p.slug,
  year: p.year,
  dimensions: p.dimensions,
  medium: p.medium ?? "Huile sur toile",
  price: p.price,
  status: p.status,
  printAvailable: Boolean(p.printAvailable),
  printPrice: p.printPrice ?? undefined,
  image: `/paintings/${p.slug}.webp`,
  description: p.description,
  subject: p.subject,
  location: p.location,
  collection: p.collection,
  featured: Boolean(p.featured),
  bestSeller: Boolean(p.bestSeller),
}));

fs.writeFileSync(outPath, JSON.stringify({ paintings }, null, 2) + "\n");
console.log(`${paintings.length} œuvres → ${outPath}`);
