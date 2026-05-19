import { API_URL } from "./api-url";

const FETCH_TIMEOUT_MS = 8_000;

/** Fetch API avec timeout — évite les builds Vercel bloqués si l’API est absente. */
export async function fetchApi(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(`${API_URL}${path}`, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}
