/** Limite Vercel (corps de requête serverless). */
export const MAX_UPLOAD_BYTES = 4.5 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = "4,5 Mo";

const MAX_EDGE = 3200;
const MAX_CANVAS_DIM = 8192;

/** PNG/JPEG déjà légers : envoi tel quel (évite les échecs de conversion canvas). */
const PASSTHROUGH_BYTES = 4 * 1024 * 1024;
const PASSTHROUGH_EDGE = 3200;

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

function formatMo(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function formatKo(bytes: number) {
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

function isPng(file: File) {
  return mimeFromFile(file) === "image/png";
}

function targetSize(srcW: number, srcH: number) {
  const maxSrc = Math.max(srcW, srcH);
  const edgeScale = Math.min(1, MAX_EDGE / maxSrc);
  const dimScale = Math.min(1, MAX_CANVAS_DIM / srcW, MAX_CANVAS_DIM / srcH);
  const scale = Math.min(edgeScale, dimScale);
  return {
    width: Math.max(1, Math.round(srcW * scale)),
    height: Math.max(1, Math.round(srcH * scale)),
  };
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
      reject(new Error("Impossible de décoder l’image."));
    };
    img.src = url;
  });
}

async function loadBitmap(file: File): Promise<ImageBitmap> {
  return createImageBitmap(file);
}

async function readDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  if (isPng(file)) {
    const img = await loadHtmlImage(file);
    return { width: img.naturalWidth, height: img.naturalHeight };
  }
  try {
    const bitmap = await loadBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    const img = await loadHtmlImage(file);
    return { width: img.naturalWidth, height: img.naturalHeight };
  }
}

async function canPassthrough(file: File): Promise<boolean> {
  if (file.size > PASSTHROUGH_BYTES) return false;
  try {
    const { width, height } = await readDimensions(file);
    return Math.max(width, height) <= PASSTHROUGH_EDGE;
  } catch {
    return false;
  }
}

async function loadSource(
  file: File,
): Promise<{ width: number; height: number; draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void }> {
  if (isPng(file)) {
    const img = await loadHtmlImage(file);
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    return {
      width: w,
      height: h,
      draw: (ctx, tw, th) => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, tw, th);
        ctx.drawImage(img, 0, 0, tw, th);
      },
    };
  }

  try {
    const bitmap = await loadBitmap(file);
    const w = bitmap.width;
    const h = bitmap.height;
    return {
      width: w,
      height: h,
      draw: (ctx, tw, th) => {
        ctx.drawImage(bitmap, 0, 0, tw, th);
        bitmap.close();
      },
    };
  } catch {
    const img = await loadHtmlImage(file);
    return {
      width: img.naturalWidth,
      height: img.naturalHeight,
      draw: (ctx, tw, th) => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, tw, th);
        ctx.drawImage(img, 0, 0, tw, th);
      },
    };
  }
}

async function canvasToJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  let quality = 0.9;
  for (let i = 0; i < 10; i++) {
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", quality);
    });
    if (blob && blob.size <= MAX_UPLOAD_BYTES) return blob;
    quality -= 0.06;
  }
  const last = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.5);
  });
  if (!last) {
    throw new Error("Impossible de convertir l’image en JPEG.");
  }
  return last;
}

/**
 * Prépare l’image avant upload (max {MAX_UPLOAD_LABEL}).
 * Petits PNG/JPEG valides sont envoyés sans recompression.
 */
export async function prepareImageForUpload(file: File): Promise<File> {
  const type = mimeFromFile(file);

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `Fichier trop lourd (${formatMo(file.size)}). Maximum : ${MAX_UPLOAD_LABEL}.`,
    );
  }

  if (type === "image/heic" || type === "image/heif" || /\.heic$/i.test(file.name)) {
    throw new Error(
      "Format HEIC (iPhone) non supporté. Exportez en JPEG ou activez « Plus compatible » dans Réglages iPhone.",
    );
  }

  if (type && !ALLOWED.has(type)) {
    throw new Error("Format non supporté. Utilisez JPEG ou PNG.");
  }

  if (await canPassthrough(file)) {
    return file;
  }

  let source: Awaited<ReturnType<typeof loadSource>>;
  try {
    source = await loadSource(file);
  } catch {
    throw new Error(
      isPng(file)
        ? `PNG illisible (${formatKo(file.size)}). Réexportez en JPEG ou réduisez la résolution.`
        : "Impossible de lire cette image.",
    );
  }

  const { width, height } = targetSize(source.width, source.height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Impossible de préparer l’image.");
  }

  source.draw(ctx, width, height);

  const blob = await canvasToJpeg(canvas);
  if (blob.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `Image encore trop lourde après compression (${formatMo(blob.size)}). Maximum : ${MAX_UPLOAD_LABEL}.`,
    );
  }

  const base = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${base}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}
