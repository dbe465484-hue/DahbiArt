import { upload } from "@vercel/blob/client";
import { slugify } from "@/lib/slugify";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/prepare-upload-image";

type UploadKind = "painting" | "blog";

/** Upload direct vers Vercel Blob (évite timeout API serverless). */
export async function uploadImageToBlob(
  kind: UploadKind,
  file: File,
  slug: string,
  token: string,
): Promise<{ url: string; filename: string }> {
  const safe = slugify(slug.trim());
  if (!safe) throw new Error("Indiquez un titre pour nommer l’image");

  const sub = kind === "painting" ? "paintings" : "blog";
  const ext = file.type === "image/png" ? "png" : "jpg";
  const pathname = `${sub}/${safe}.${ext}`;

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `Fichier trop lourd (${(file.size / (1024 * 1024)).toFixed(2)} Mo). Maximum ${MAX_UPLOAD_LABEL}.`,
    );
  }

  const blob = await upload(pathname, file, {
    access: "public",
    handleUploadUrl: "/api/admin/blob-upload",
    headers: { Authorization: `Bearer ${token}` },
    clientPayload: JSON.stringify({ kind }),
  });

  return { url: blob.url, filename: `${safe}.${ext}` };
}

export function blobUploadAvailable(): boolean {
  return typeof window !== "undefined";
}
