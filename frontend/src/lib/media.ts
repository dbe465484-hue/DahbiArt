import { API_URL } from "./api-url";

function withCacheBust(url: string, cacheKey?: string | number | null): string {
  if (cacheKey == null || cacheKey === "") return url;
  const token = encodeURIComponent(String(cacheKey));
  return url.includes("?") ? `${url}&v=${token}` : `${url}?v=${token}`;
}

/** URL affichable pour une image (chemin local, upload API ou URL absolue). */
export function resolveMediaUrl(
  path: string,
  /** updatedAt ou version — évite l’aperçu bloqué après remplacement (même URL Blob). */
  cacheKey?: string | number | null,
): string {
  if (!path) return "";
  let url: string;
  if (path.startsWith("http://") || path.startsWith("https://")) url = path;
  else if (path.startsWith("/uploads/")) url = `${API_URL}${path}`;
  else if (typeof window !== "undefined" && path.startsWith("/")) {
    url = `${window.location.origin}${path}`;
  } else url = path;
  return withCacheBust(url, cacheKey);
}
