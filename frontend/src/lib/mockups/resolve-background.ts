import fs from "fs";
import path from "path";

export const BACKGROUND_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;

/** Nom de fichier background.* présent dans un dossier mockup */
export function findBackgroundFilename(mockupDir: string): string | null {
  if (!fs.existsSync(mockupDir)) return null;
  for (const ext of BACKGROUND_EXTENSIONS) {
    const file = `background${ext}`;
    if (fs.existsSync(path.join(mockupDir, file))) return file;
  }
  return (
    fs
      .readdirSync(mockupDir)
      .find((f) => /^background\./i.test(f) && /\.(jpe?g|png|webp)$/i.test(f)) ?? null
  );
}

/**
 * Chemin absolu vers l’image de fond (catalogue ou background.jpg/png/webp dans le dossier).
 */
export function resolveLocalBackgroundPath(
  publicRoot: string,
  mockupId: string,
  backgroundUrl: string,
): string | null {
  if (backgroundUrl.startsWith("/")) {
    const fromCatalog = path.join(publicRoot, backgroundUrl.replace(/^\//, ""));
    if (fs.existsSync(fromCatalog)) return fromCatalog;
  }

  const dir = path.join(publicRoot, "mockups", mockupId);
  const file = findBackgroundFilename(dir);
  return file ? path.join(dir, file) : null;
}
