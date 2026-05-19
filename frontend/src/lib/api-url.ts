function configuredApiUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    (process.env.VERCEL ? "/api" : "http://localhost:3001")
  );
}

/**
 * Local : http://localhost:3001
 * Vercel prod : /api (rewrite → dahbi-art-api)
 * Si le build embarque localhost par erreur, on corrige côté navigateur.
 */
function resolveApiUrl(): string {
  const url = configuredApiUrl();
  if (typeof window === "undefined") return url;

  const onLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  if (
    !onLocal &&
    (url.startsWith("http://localhost") || url.startsWith("http://127.0.0.1"))
  ) {
    return "/api";
  }

  return url;
}

export const API_URL = resolveApiUrl();
