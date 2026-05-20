import { API_URL, serverApiBase } from "./api-url";

const FETCH_TIMEOUT_MS = 8_000;

function apiBaseForFetch(): string {
  if (typeof window !== "undefined") return API_URL;
  return serverApiBase();
}

/** Fetch API avec timeout — évite les builds Vercel bloqués si l’API est absente. */
export async function fetchApi(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const base = apiBaseForFetch().replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(`${base}${normalizedPath}`, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}
