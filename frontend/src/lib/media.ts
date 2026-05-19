const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/** URL affichable pour une image (chemin local, upload API ou URL absolue) */
export function resolveMediaUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/uploads/")) return `${API_URL}${path}`;
  if (typeof window !== "undefined" && path.startsWith("/")) {
    return `${window.location.origin}${path}`;
  }
  return path;
}
