/** Limite corps de requête Vercel (~4,5 Mo). */
export const MAX_UPLOAD_BYTES = 4.5 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = "4,5 Mo";

const BLOCKED = new Set(["image/heic", "image/heif"]);
const MAX_EDGE_START = 3200;
const MAX_CANVAS_DIM = 8192;

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
  return `${Math.round(bytes / 1024)} Ko`;
}

export function mimeFromFile(file: File): string {
  if (file.type) return file.type;
  const n = file.name.toLowerCase();
  if (n.endsWith(".png")) return "image/png";
  if (n.endsWith(".webp")) return "image/webp";
  if (n.endsWith(".gif")) return "image/gif";
  if (n.endsWith(".avif")) return "image/avif";
  if (/\.(jpe?g)$/.test(n)) return "image/jpeg";
  return "";
}

function isJpeg(file: File) {
  const t = mimeFromFile(file);
  return t === "image/jpeg" || /\.jpe?g$/i.test(file.name);
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
      reject(new Error("Impossible de lire cette image."));
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

/**
 * Redimensionne (compression) puis convertit en JPEG pour réduire au maximum.
 */
async function compressAndConvertToJpeg(file: File): Promise<File> {
  const img = await loadHtmlImage(file);
  const withWhiteBg = !isJpeg(file);
  const base = file.name.replace(/\.[^.]+$/, "") || "image";
  let bestBlob: Blob | null = null;
  let maxEdge =
    file.size > 25 * 1024 * 1024 ? 2400 : file.size > 10 * 1024 * 1024 ? 2800 : MAX_EDGE_START;

  for (let round = 0; round < 12; round++) {
    const { width, height } = scaledSize(img.naturalWidth, img.naturalHeight, maxEdge);
    const canvas = drawToCanvas(img, width, height, withWhiteBg);

    for (let q = 0.92; q >= 0.4; q -= 0.06) {
      const blob = await canvasToJpeg(canvas, q);
      if (!blob) continue;
      if (!bestBlob || blob.size < bestBlob.size) bestBlob = blob;
      if (blob.size <= MAX_UPLOAD_BYTES) {
        return new File([blob], `${base}.jpg`, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });
      }
    }

    maxEdge = Math.round(maxEdge * 0.68);
  }

  const compressedSize = bestBlob?.size ?? 0;
  throw new Error(
    `Fichier trop lourd après compression.\n` +
      `• Votre fichier : ${formatSize(file.size)}\n` +
      `• Après réduction + conversion JPEG : ${compressedSize ? formatSize(compressedSize) : "échec"}\n` +
      `• Maximum autorisé : ${MAX_UPLOAD_LABEL} (limite Vercel)\n` +
      `Réduisez la résolution dans un éditeur (Photoshop, GIMP, Photos) puis réessayez.`,
  );
}

export type PrepareUploadResult = {
  file: File;
  converted: boolean;
  originalSize: number;
  finalSize: number;
};

/**
 * JPEG léger ≤ 4,5 Mo : envoyé tel quel.
 * Sinon : redimensionnement + conversion JPEG automatiques.
 */
export async function prepareImageForUpload(file: File): Promise<File> {
  const r = await prepareImageForUploadDetailed(file);
  return r.file;
}

export async function prepareImageForUploadDetailed(
  file: File,
): Promise<PrepareUploadResult> {
  const type = (file.type || "").toLowerCase();
  if (BLOCKED.has(type) || /\.heic$/i.test(file.name)) {
    throw new Error(
      "HEIC (iPhone) : exportez en JPEG depuis la galerie, puis réessayez.",
    );
  }

  if (!file.size) {
    throw new Error("Fichier vide.");
  }

  if (isJpeg(file) && file.size <= MAX_UPLOAD_BYTES) {
    try {
      const img = await loadHtmlImage(file);
      if (Math.max(img.naturalWidth, img.naturalHeight) <= MAX_EDGE_START) {
        return {
          file,
          converted: false,
          originalSize: file.size,
          finalSize: file.size,
        };
      }
    } catch {
      /* conversion ci-dessous */
    }
  }

  const converted = await compressAndConvertToJpeg(file);
  return {
    file: converted,
    converted: true,
    originalSize: file.size,
    finalSize: converted.size,
  };
}
