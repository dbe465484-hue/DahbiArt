/**
 * Limite imposée par Vercel sur le corps des requêtes (~4,5 Mo).
 * Pas de compression côté navigateur — le fichier est envoyé tel quel.
 */
export const MAX_UPLOAD_BYTES = 4.5 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = "4,5 Mo";

const BLOCKED = new Set(["image/heic", "image/heif"]);

function formatMo(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

/** Pas de transformation : upload direct (JPEG, PNG, WebP, etc.). */
export async function prepareImageForUpload(file: File): Promise<File> {
  const type = (file.type || "").toLowerCase();
  if (BLOCKED.has(type) || /\.heic$/i.test(file.name)) {
    throw new Error(
      "HEIC (iPhone) : exportez la photo en JPEG depuis la galerie, puis réessayez.",
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `Fichier trop lourd (${formatMo(file.size)}). Maximum ${MAX_UPLOAD_LABEL} (limite de l’hébergeur Vercel).`,
    );
  }

  if (!file.size) {
    throw new Error("Fichier vide.");
  }

  return file;
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
