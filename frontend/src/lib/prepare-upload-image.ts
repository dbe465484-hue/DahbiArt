/** Limite sûre pour Vercel (proxy + serverless ~4,5 Mo). */
const MAX_BYTES = 3.5 * 1024 * 1024;
const MAX_EDGE = 1920;
/** Limite navigateur (canvas) — les PNG pro ont souvent 6000+ px. */
const MAX_CANVAS_DIM = 4096;

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

function mimeFromFile(file: File): string {
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

/** Charge l’image — PNG via HTMLImageElement (plus fiable que createImageBitmap). */
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
      reject(new Error("Impossible de décoder l’image PNG."));
    };
    img.src = url;
  });
}

async function loadBitmap(file: File): Promise<ImageBitmap> {
  return createImageBitmap(file);
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
  let quality = 0.88;
  for (let i = 0; i < 8; i++) {
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", quality);
    });
    if (blob && blob.size <= MAX_BYTES) return blob;
    quality -= 0.08;
  }
  const last = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.55);
  });
  if (!last) {
    throw new Error("Impossible de convertir le PNG en JPEG.");
  }
  return last;
}

/**
 * Redimensionne et compresse l’image dans le navigateur avant upload.
 * Les PNG (transparence, très grande taille) sont convertis en JPEG.
 */
export async function prepareImageForUpload(file: File): Promise<File> {
  const type = mimeFromFile(file);

  if (type === "image/heic" || type === "image/heif" || /\.heic$/i.test(file.name)) {
    throw new Error(
      "Format HEIC (iPhone) non supporté. Exportez en JPEG ou activez « Plus compatible » dans Réglages iPhone.",
    );
  }

  if (type && !ALLOWED.has(type)) {
    throw new Error("Format non supporté. Utilisez JPEG ou PNG.");
  }

  if (file.size <= MAX_BYTES && type === "image/jpeg") {
    try {
      const bitmap = await loadBitmap(file);
      if (Math.max(bitmap.width, bitmap.height) <= MAX_EDGE) {
        bitmap.close();
        return file;
      }
      bitmap.close();
    } catch {
      /* resize below */
    }
  }

  let source: Awaited<ReturnType<typeof loadSource>>;
  try {
    source = await loadSource(file);
  } catch {
    throw new Error(
      isPng(file)
        ? "PNG illisible ou trop grand pour le navigateur. Ouvrez-le dans un éditeur, exportez en JPEG, puis réessayez."
        : "Impossible de lire cette image. Essayez JPEG ou PNG.",
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
  if (blob.size > MAX_BYTES) {
    throw new Error(
      `Image encore trop lourde après conversion (${formatMo(blob.size)}). Réduisez la résolution du PNG.`,
    );
  }

  const base = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${base}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}
