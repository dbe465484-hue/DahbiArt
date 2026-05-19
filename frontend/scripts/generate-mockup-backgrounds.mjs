/**
 * Génère des scènes d'intérieur avec cadre blanc vide sur le mur.
 * Garantit un rendu cohérent (plus de photos Pexels aléatoires).
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public", "mockups");

/** @type {Array<{id:string,name:string,category:string,wall:string,floor:string,accent?:string,frame:{x:number,y:number,w:number,h:number}}>} */
const scenes = [
  {
    id: "salon-blanc",
    name: "Salon blanc",
    category: "maison",
    wall: "#e8e4de",
    floor: "#c9bfb0",
    accent: "#d4c4b0",
    frame: { x: 0.36, y: 0.14, w: 0.22, h: 0.34 },
  },
  {
    id: "salon-beige",
    name: "Salon beige",
    category: "maison",
    wall: "#ebe6dc",
    floor: "#b8a99a",
    frame: { x: 0.32, y: 0.12, w: 0.26, h: 0.38 },
  },
  {
    id: "chambre-douce",
    name: "Chambre douce",
    category: "maison",
    wall: "#f0ebe4",
    floor: "#d9cfc4",
    frame: { x: 0.52, y: 0.1, w: 0.2, h: 0.3 },
  },
  {
    id: "couloir-minimal",
    name: "Couloir minimal",
    category: "maison",
    wall: "#eceae6",
    floor: "#d5ccc3",
    frame: { x: 0.4, y: 0.18, w: 0.14, h: 0.42 },
  },
  {
    id: "salle-manger",
    name: "Salle à manger",
    category: "maison",
    wall: "#e6e0d6",
    floor: "#b5a594",
    accent: "#8a7a6a",
    frame: { x: 0.28, y: 0.16, w: 0.24, h: 0.32 },
  },
  {
    id: "galerie-blanche",
    name: "Galerie blanche",
    category: "commercial",
    wall: "#f5f5f3",
    floor: "#e0ddd8",
    frame: { x: 0.38, y: 0.2, w: 0.18, h: 0.42 },
  },
  {
    id: "loft-industriel",
    name: "Loft industriel",
    category: "commercial",
    wall: "#d8d4cc",
    floor: "#6b6560",
    frame: { x: 0.34, y: 0.1, w: 0.28, h: 0.4 },
  },
  {
    id: "cafe-chaleureux",
    name: "Café chaleureux",
    category: "commercial",
    wall: "#e8dfd0",
    floor: "#9c8570",
    accent: "#7a6248",
    frame: { x: 0.1, y: 0.2, w: 0.2, h: 0.28 },
  },
  {
    id: "bureau-moderne",
    name: "Bureau moderne",
    category: "commercial",
    wall: "#eae8e4",
    floor: "#c5beb6",
    frame: { x: 0.44, y: 0.12, w: 0.16, h: 0.26 },
  },
  {
    id: "hotel-elegant",
    name: "Hôtel élégant",
    category: "commercial",
    wall: "#ebe7e0",
    floor: "#b0a396",
    frame: { x: 0.36, y: 0.08, w: 0.26, h: 0.24 },
  },
  {
    id: "mur-sombre",
    name: "Mur sombre premium",
    category: "style",
    wall: "#3a3836",
    floor: "#2a2826",
    frame: { x: 0.38, y: 0.16, w: 0.2, h: 0.38 },
  },
  {
    id: "scandinave",
    name: "Scandinave",
    category: "style",
    wall: "#f2efe9",
    floor: "#ddd5cb",
    frame: { x: 0.35, y: 0.15, w: 0.22, h: 0.32 },
  },
];

const W = 1920;
const H = 1280;

async function renderScene(scene) {
  const fx = Math.round(scene.frame.x * W);
  const fy = Math.round(scene.frame.y * H);
  const fw = Math.round(scene.frame.w * W);
  const fh = Math.round(scene.frame.h * H);

  const wallSvg = `
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${scene.wall}"/>
          <stop offset="85%" stop-color="${scene.wall}"/>
          <stop offset="100%" stop-color="${scene.floor}"/>
        </linearGradient>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${scene.floor}" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="${scene.floor}"/>
        </linearGradient>
        <filter id="frameShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="6" dy="10" stdDeviation="12" flood-color="#000" flood-opacity="0.25"/>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#wall)"/>
      <rect y="${H * 0.72}" width="100%" height="${H * 0.28}" fill="url(#floor)"/>
      ${scene.accent ? `<rect x="0" y="${H * 0.75}" width="${W}" height="${H * 0.12}" fill="${scene.accent}" opacity="0.35"/>` : ""}
      <!-- canapé simplifié -->
      <rect x="${W * 0.08}" y="${H * 0.68}" width="${W * 0.35}" height="${H * 0.14}" rx="8" fill="${scene.accent ?? scene.floor}" opacity="0.5"/>
      <rect x="${W * 0.55}" y="${H * 0.7}" width="${W * 0.32}" height="${H * 0.1}" rx="6" fill="${scene.accent ?? scene.floor}" opacity="0.35"/>
      <!-- cadre vide sur le mur -->
      <rect x="${fx - 14}" y="${fy - 14}" width="${fw + 28}" height="${fh + 28}" fill="#d8d4ce" filter="url(#frameShadow)"/>
      <rect x="${fx - 8}" y="${fy - 8}" width="${fw + 16}" height="${fh + 16}" fill="#f7f5f2"/>
      <rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" fill="#ffffff"/>
    </svg>`;

  const dir = path.join(publicDir, scene.id);
  fs.mkdirSync(dir, { recursive: true });

  const bgPath = path.join(dir, "background.jpg");
  await sharp(Buffer.from(wallSvg)).jpeg({ quality: 92 }).toFile(bgPath);

  const placement = {
    x: scene.frame.x + 0.008,
    y: scene.frame.y + 0.008,
    width: scene.frame.w - 0.016,
    height: scene.frame.h - 0.016,
  };

  fs.writeFileSync(
    path.join(dir, "metadata.json"),
    JSON.stringify({ name: scene.name, placement, wallTone: "#ffffff" }, null, 2),
  );

  return {
    id: scene.id,
    name: scene.name,
    category: scene.category,
    styles: ["minimaliste"],
    mode: "inset",
    background: `/mockups/${scene.id}/background.jpg`,
    placement,
    feather: 0.028,
    wallTone: "#ffffff",
    blend: { brightness: 0.99, contrast: 1.01, saturation: 0.98 },
    recommendedOrientations: ["portrait", "landscape"],
    tags: ["généré", scene.category],
  };
}

const mockups = [];
for (const scene of scenes) {
  process.stdout.write(`→ ${scene.id} `);
  mockups.push(await renderScene(scene));
  console.log("ok");
}

const catalog = { version: 3, mockups };
fs.writeFileSync(path.join(publicDir, "catalog.json"), JSON.stringify(catalog, null, 2));
console.log(`\n${mockups.length} mockups générés dans public/mockups/`);
