import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(root, "..", "tableaux");
const outPath = path.join(root, "src", "data", "paintings-catalog.json");

const files = fs
  .readdirSync(sourceDir)
  .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

/** Collections alignées sur le style réel des toiles (figuratif symbolique, oiseaux, ocres, nocturnes). */
const COLLECTION_THEMES = [
  {
    slug: "figures-symboliques",
    title: "Figures symboliques",
    description:
      "Silhouettes humaines stylisées, corps en mouvement et présences graphiques — l'émotion avant le réalisme.",
    themes: "Figures · Mouvement · Symbolisme",
    subjects: ["abstract", "people"],
    titles: [
      "Figure en méditation",
      "Silhouette debout",
      "Le danseur",
      "Corps en dialogue",
      "Figure solitaire",
      "Présence",
      "Le veilleur",
      "Ascension",
    ],
  },
  {
    slug: "oiseaux-et-envol",
    title: "Oiseaux & envol",
    description:
      "Oiseaux en vol, figures ailées et rencontres entre le ciel et le corps — messagers d'atelier.",
    themes: "Oiseaux · Vol · Liberté",
    subjects: ["abstract", "animals"],
    titles: [
      "Envol",
      "Oiseau d'or",
      "Vol suspendu",
      "Compagnons ailés",
      "L'envolée",
      "Messager",
      "Ailes ouvertes",
      "Vol nocturne",
    ],
  },
  {
    slug: "terres-chaudes",
    title: "Terres chaudes",
    description:
      "Ocres, jaunes miel et terres brûlées — la chaleur du Maroc dans des compositions lumineuses.",
    themes: "Ocre · Lumière · Chaleur",
    subjects: ["abstract"],
    titles: [
      "Chaleur d'ocre",
      "Lumière intérieure",
      "Soleil sur la toile",
      "Terre et souffle",
      "Rayon d'ambre",
      "Horizon ocre",
      "Feu doux",
    ],
  },
  {
    slug: "nocturnes",
    title: "Nocturnes",
    description:
      "Fonds bleu nuit, gris profond et contrastes — figures qui émergent de l'obscurité.",
    themes: "Nuit · Bleu · Contraste",
    subjects: ["abstract"],
    titles: [
      "Nuit bleue",
      "Silence nocturne",
      "Clair de lune",
      "Figure dans la nuit",
      "Bleu profond",
      "Veille nocturne",
      "Ombre et lumière",
    ],
  },
  {
    slug: "signes-et-etoiles",
    title: "Signes & étoiles",
    description:
      "Étoiles, symboles et marques graphiques — un langage intime entre signe et matière.",
    themes: "Étoiles · Signes · Graphisme",
    subjects: ["abstract"],
    titles: [
      "Constellation",
      "Étoiles et signes",
      "Carte du ciel",
      "Signes sur la toile",
      "Nuit étoilée",
      "Alphabet secret",
      "Marques du ciel",
    ],
  },
  {
    slug: "petits-formats",
    title: "Petits formats",
    description:
      "Toiles de format intime — idéales pour une première acquisition ou un cadeau précieux.",
    themes: "Format compact · Intimité",
    subjects: ["abstract"],
    titles: [
      "Étude I",
      "Étude II",
      "Petit envol",
      "Fragment",
      "Esquisse vive",
      "Miniature",
    ],
    dimensionsOnly: ["11×14", "9×12", "8×10", "12×16"],
  },
];

const DIMENSIONS = ["18×24", "24×30", "11×14", "16×20", "30×48", "12×16", "20×24", "9×12", "24×36", "8×10"];
const PRICES = [450, 650, 770, 1200, 1800, 2400, 3200, 3400, 5400];
const STUDIO = "rabat";

function photoNum(filename) {
  const m = filename.match(/U9A(\d+)/i);
  return m ? m[1] : filename.replace(/\.[^.]+$/, "").replace(/\W+/g, "");
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Répartition par fichier photo (équilibre ~6 œuvres par collection). */
const FILE_COLLECTION = {
  "9403": "oiseaux-et-envol",
  "9404": "figures-symboliques",
  "9405": "petits-formats",
  "9407": "oiseaux-et-envol",
  "9408": "nocturnes",
  "9409": "signes-et-etoiles",
  "9412": "oiseaux-et-envol",
  "9413": "figures-symboliques",
  "9414": "petits-formats",
  "9417": "oiseaux-et-envol",
  "9421": "nocturnes",
  "9425": "terres-chaudes",
  "9429": "petits-formats",
  "9431": "nocturnes",
  "9433": "signes-et-etoiles",
  "9434": "oiseaux-et-envol",
  "9437": "terres-chaudes",
  "9438": "petits-formats",
  "9439": "oiseaux-et-envol",
  "9440": "nocturnes",
  "9441": "signes-et-etoiles",
  "9442": "nocturnes",
  "9443": "figures-symboliques",
  "9444": "signes-et-etoiles",
  "9445": "terres-chaudes",
  "9446": "oiseaux-et-envol",
  "9447": "nocturnes",
  "9448": "petits-formats",
  "9449": "signes-et-etoiles",
  "9450": "terres-chaudes",
  "9451": "signes-et-etoiles",
  "9454": "oiseaux-et-envol",
  "9455": "nocturnes",
  "9457": "figures-symboliques",
  "9458": "petits-formats",
  "9459": "oiseaux-et-envol",
};

function collectionIndexForFile(sourceFile) {
  const n = photoNum(sourceFile);
  const slug = FILE_COLLECTION[n] ?? "figures-symboliques";
  const idx = COLLECTION_THEMES.findIndex((c) => c.slug === slug);
  return idx >= 0 ? idx : 0;
}

function buildEntry(index, sourceFile) {
  const num = photoNum(sourceFile);
  const colIdx = collectionIndexForFile(sourceFile);
  const theme = COLLECTION_THEMES[colIdx];
  const title = theme.titles[index % theme.titles.length];
  const slug = `oeuvre-${num}`;

  const dimensions =
    theme.dimensionsOnly?.[index % (theme.dimensionsOnly?.length ?? 1)] ??
    DIMENSIONS[index % DIMENSIONS.length];

  const isPetit = theme.slug === "petits-formats";
  const price = PRICES[index % PRICES.length];
  const available = index % 4 !== 1;
  const subject = theme.subjects[index % theme.subjects.length];

  return {
    id: String(index + 1),
    slug,
    title,
    year: 2020 + (index % 6),
    dimensions,
    price: available ? price : 0,
    status: available ? "available" : "sold",
    printAvailable: !available || index % 5 === 0,
    printPrice: available ? undefined : Math.round(Math.max(price, 450) * 0.08),
    description: `${title} — huile sur toile, style figuratif symbolique. Série ${theme.title}, réf. ${num}.`,
    subject,
    location: STUDIO,
    collection: theme.slug,
    featured: index === 0,
    bestSeller: index % 4 === 0,
    sourceFile,
  };
}

const paintings = files.map((sourceFile, index) => buildEntry(index, sourceFile));

const collectionDefs = COLLECTION_THEMES.map((def) => {
  const inCol = paintings.filter((p) => p.collection === def.slug);
  return {
    slug: def.slug,
    title: def.title,
    description: def.description,
    themes: def.themes,
    count: inCol.length,
    coverSlug: inCol[0]?.slug,
  };
});

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(
  outPath,
  JSON.stringify({ version: 2, paintings, collections: collectionDefs }, null, 2) + "\n",
);

console.log(`${paintings.length} œuvres → ${outPath}`);
for (const c of collectionDefs) {
  console.log(`  ${c.slug}: ${c.count} œuvres`);
}
