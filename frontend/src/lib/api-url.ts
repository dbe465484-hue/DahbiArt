/** Origines API connues (upload direct, évite la limite 4,5 Mo du proxy Next). */
const KNOWN_API_ORIGINS: Record<string, string> = {
  "dahbi-art.vercel.app": "https://dahbi-art-api.vercel.app",
};

function configuredApiUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    (process.env.VERCEL ? "/api" : "http://localhost:3001");

  if (
    process.env.VERCEL &&
    (url.startsWith("http://localhost") || url.startsWith("http://127.0.0.1"))
  ) {
    return "/api";
  }

  return url;
}

/**
 * Local : http://localhost:3001
 * Vercel prod (navigateur) : /api (rewrite → dahbi-art-api)
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

/** URL absolue pour les fetch SSR (les URLs relatives échouent côté serveur). */
export function serverApiBase(): string {
  const internal = process.env.BACKEND_INTERNAL_URL?.replace(/\/$/, "");
  if (internal) return internal;

  const url = configuredApiUrl();
  if (url.startsWith("http")) return url;

  const host = process.env.VERCEL_URL;
  if (host) {
    const path = url.startsWith("/") ? url : `/${url}`;
    return `https://${host}${path}`;
  }

  const port = process.env.PORT ?? "3000";
  const path = url.startsWith("/") ? url : `/${url}`;
  return `http://127.0.0.1:${port}${path}`;
}

/**
 * Upload multipart : appeler l’API directement en prod (évite le proxy Next / limite body).
 * Définir NEXT_PUBLIC_API_ORIGIN sur le projet dahbi-art si le domaine change.
 */
export function uploadApiBase(): string {
  const explicit =
    process.env.NEXT_PUBLIC_UPLOAD_API_URL ??
    process.env.NEXT_PUBLIC_API_ORIGIN;
  if (explicit) return explicit.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const mapped = KNOWN_API_ORIGINS[window.location.hostname];
    if (mapped) return mapped;
  }

  return API_URL;
}
