/** Limite sûre pour Vercel (proxy + serverless ~4,5 Mo). */
const MAX_BYTES = 3.5 * 1024 * 1024;
const MAX_EDGE = 2400;

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

/**
 * Redimensionne et compresse l’image dans le navigateur avant upload.
 * Évite les échecs réseau sur les grosses photos (iPhone, RAW, etc.).
 */
export async function prepareImageForUpload(file: File): Promise<File> {
  const type = file.type || "";
  if (type === "image/heic" || type === "image/heif" || /\.heic$/i.test(file.name)) {
    throw new Error(
      "Format HEIC (iPhone) non supporté ici. Sur iPhone : Réglages → Appareil photo → Formats → « Plus compatible » (JPEG), ou exportez la photo en JPEG.",
    );
  }

  if (type && !ALLOWED.has(type)) {
    throw new Error(
      "Format non supporté. Utilisez JPEG, PNG, WebP, GIF ou AVIF.",
    );
  }

  if (file.size <= MAX_BYTES && type === "image/jpeg") {
    try {
      const bitmap = await createImageBitmap(file);
      if (Math.max(bitmap.width, bitmap.height) <= MAX_EDGE) {
        bitmap.close();
        return file;
      }
      bitmap.close();
    } catch {
      /* continue with resize */
    }
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(
      "Impossible de lire cette image. Essayez JPEG ou PNG (évitez HEIC / fichiers corrompus).",
    );
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Impossible de préparer l’image.");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let quality = 0.88;
  let blob: Blob | null = null;
  for (let i = 0; i < 6; i++) {
    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", quality);
    });
    if (!blob) break;
    if (blob.size <= MAX_BYTES) break;
    quality -= 0.08;
  }

  if (!blob) {
    throw new Error("Impossible de compresser l’image.");
  }

  if (blob.size > MAX_BYTES) {
    throw new Error(
      `Image encore trop lourde après compression (${formatMo(blob.size)}). Choisissez une photo plus petite.`,
    );
  }

  const base = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
}
