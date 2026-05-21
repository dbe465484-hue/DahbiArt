/** Limite corps de requête Vercel (~4,5 Mo). */
export const MAX_UPLOAD_BYTES = 4.5 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = "4,5 Mo";

const BLOCKED = new Set(["image/heic", "image/heif"]);
const MAX_EDGE_START = 3200;
const MAX_CANVAS_DIM = 8192;

function formatMo(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function mimeFromFile(file: File): string {
  if (file.type) return file.type;
  const n = file.name.toLowerCase();
  if (n.endsWith(".png")) return "image/png";
  if (n.endsWith(".webp")) return "image/webp";
  if (n.endsWith(".gif")) return "image/gif";
  if (n.endsWith(".avif")) return "image/avif";
  if (/\.(jpe?g)$/.test(n)) return "image/jpeg";
  if (n.endsWith(".bmp")) return "image/bmp";
  if (n.endsWith(".tif") || n.endsWith(".tiff")) return "image/tiff";
  return "";
}

function loadHtmlImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Impossible de lire l’image."));
    };
    img.src = url;
  });
}

function scaledSize(srcW: number, srcH: number, maxEdge: number) {
  const scale = Math.min(
    1,
    maxEdge / Math.max(srcW, srcH),
    MAX_CANVAS_DIM / srcW,
    MAX_CANVAS_DIM / srcH,
  );
  return {
    width: Math.max(1, Math.round(srcW * scale)),
    height: Math.max(1, Math.round(srcH * scale)),
  };
}

function drawToCanvas(
  img: HTMLImageElement,
  width: number,
  height: number,
  withWhiteBg: boolean,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Impossible de préparer l’image.");
  if (withWhiteBg) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

async function canvasToJpeg(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", quality);
  });
}

/** Compresse jusqu’à tenir sous la limite Vercel. */
async function compressToFit(file: File): Promise<File> {
  const img = await loadHtmlImage(file);
  const withWhiteBg =
    mimeFromFile(file) === "image/png" || mimeFromFile(file) === "image/webp";
  const base = file.name.replace(/\.[^.]+$/, "") || "image";

  let maxEdge = MAX_EDGE_START;
  for (let round = 0; round < 10; round++) {
    const { width, height } = scaledSize(img.naturalWidth, img.naturalHeight, maxEdge);
    const canvas = drawToCanvas(img, width, height, withWhiteBg);

    for (let q = 0.9; q >= 0.45; q -= 0.08) {
      const blob = await canvasToJpeg(canvas, q);
      if (blob && blob.size <= MAX_UPLOAD_BYTES) {
        return new File([blob], `${base}.jpg`, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });
      }
    }

    maxEdge = Math.round(maxEdge * 0.72);
  }

  throw new Error(
    `Impossible de compresser sous ${MAX_UPLOAD_LABEL} (fichier ${formatMo(file.size)}). Réduisez la résolution dans un éditeur.`,
  );
}

export type PrepareUploadResult = {
  file: File;
  /** true si le fichier a été compressé avant envoi */
  compressed: boolean;
};

/**
 * ≤ 4,5 Mo : envoyé tel quel (JPEG, PNG, WebP…).
 * > 4,5 Mo : compression automatique puis envoi.
 */
export async function prepareImageForUpload(file: File): Promise<File> {
  const result = await prepareImageForUploadDetailed(file);
  return result.file;
}

export async function prepareImageForUploadDetailed(
  file: File,
): Promise<PrepareUploadResult> {
  const type = (file.type || "").toLowerCase();
  if (BLOCKED.has(type) || /\.heic$/i.test(file.name)) {
    throw new Error(
      "HEIC (iPhone) : exportez la photo en JPEG depuis la galerie, puis réessayez.",
    );
  }

  if (!file.size) {
    throw new Error("Fichier vide.");
  }

  if (file.size <= MAX_UPLOAD_BYTES) {
    return { file, compressed: false };
  }

  const compressed = await compressToFit(file);
  return {
    file: compressed,
    compressed: true,
  };
}
