/**
 * Local : localhost:3001
 * Vercel (rewrites) : /api → projet API NestJS
 */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  (process.env.VERCEL ? "/api" : "http://localhost:3001");
