/** Local dev : localhost:3001. Vercel Services : NEXT_PUBLIC_BACKEND_URL = /api */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://localhost:3001";
