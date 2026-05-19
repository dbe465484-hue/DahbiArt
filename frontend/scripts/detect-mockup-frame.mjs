/**
 * Détecte la zone « mur / cadre » pour placer le tableau (mockups photo IA).
 * Cherche un rectangle compact de pixels très clairs ou très uniformes dans la partie haute.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const mockupsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "mockups");

function findBg(dir) {
  for (const ext of [".png", ".jpg", ".jpeg", ".webp"]) {
    const p = path.join(dir, `background${ext}`);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function luminance(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

async function analyze(bgPath) {
  const meta = await sharp(bgPath).metadata();
  const W0 = meta.width ?? 1536;
  const H0 = meta.height ?? 1024;
  const W = 480;
  const H = Math.round(H0 * (W / W0));

  const { data } = await sharp(bgPath)
    .resize(W, H, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const isLandscape = W0 >= H0;
  const yMax = Math.floor(H * (isLandscape ? 0.62 : 0.55));
  const xPad = Math.floor(W * 0.08);

  let best = null;
  let bestScore = -1;

  const widths = isLandscape
    ? [0.12, 0.15, 0.18, 0.21, 0.24]
    : [0.28, 0.32, 0.36, 0.4, 0.44];
  const heights = isLandscape
    ? [0.22, 0.26, 0.3, 0.34, 0.38]
    : [0.14, 0.16, 0.18, 0.2, 0.22];

  for (const wf of widths) {
    for (const hf of heights) {
      const rw = Math.floor(W * wf);
      const rh = Math.floor(H * hf);
      if (rw < 20 || rh < 20) continue;

      for (let y = Math.floor(H * 0.04); y <= yMax - rh; y += Math.max(4, Math.floor(H * 0.02))) {
        for (let x = xPad; x <= W - xPad - rw; x += Math.max(4, Math.floor(W * 0.02))) {
          let sum = 0;
          let sumSq = 0;
          let n = 0;
          let bright = 0;

          for (let dy = 0; dy < rh; dy += 2) {
            for (let dx = 0; dx < rw; dx += 2) {
              const i = ((y + dy) * W + (x + dx)) * 3;
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const L = luminance(r, g, b);
              sum += L;
              sumSq += L * L;
              n++;
              if (L > 200) bright++;
            }
          }

          const mean = sum / n;
          const variance = sumSq / n - mean * mean;
          const brightRatio = bright / n;
          const cx = (x + rw / 2) / W;
          const centerBias = 1 - Math.abs(cx - 0.5) * 1.8;
          const upperBias = 1 - (y / H) * 0.35;
          const aspect = rw / rh;
          const aspectBias =
            isLandscape
              ? aspect < 0.95
                ? 1.2
                : aspect < 1.2
                  ? 1
                  : 0.5
              : aspect > 1.1
                ? 1.2
                : aspect > 0.85
                  ? 1
                  : 0.5;

          const uniformity = 1 / (1 + variance / 400);
          const score =
            uniformity *
            centerBias *
            upperBias *
            aspectBias *
            (0.4 + brightRatio * 0.6) *
            (mean > 140 ? 1.1 : mean > 110 ? 0.85 : 0.5);

          if (score > bestScore) {
            bestScore = score;
            best = { x, y, rw, rh, cx, cy: (y + rh / 2) / H };
          }
        }
      }
    }
  }

  if (!best) return null;

  const inset = 0.04;
  return {
    x: best.x / W + inset * (best.rw / W),
    y: best.y / H + inset * (best.rh / H),
    width: (best.rw / W) * (1 - inset * 2),
    height: (best.rh / H) * (1 - inset * 2),
    score: bestScore,
    cx: (best.x + best.rw / 2) / W,
    cy: (best.y + best.rh / 2) / H,
  };
}

const dirs = fs
  .readdirSync(mockupsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith("a-ajouter"));

for (const d of dirs) {
  const id = d.name;
  const bg = findBg(path.join(mockupsDir, id));
  if (!bg) {
    console.warn(`⚠ ${id}`);
    continue;
  }
  const p = await analyze(bg);
  if (!p) {
    console.warn(`⚠ ${id} — rien trouvé`);
    continue;
  }
  console.log(
    `${id}: x=${p.x.toFixed(3)} y=${p.y.toFixed(3)} w=${p.width.toFixed(3)} h=${p.height.toFixed(3)} (cx=${p.cx.toFixed(2)} cy=${p.cy.toFixed(2)} score=${p.score.toFixed(2)})`,
  );
}
