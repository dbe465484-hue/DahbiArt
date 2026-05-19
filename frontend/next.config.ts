import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === "true";

const backendUrl = process.env.BACKEND_INTERNAL_URL?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  reactCompiler: true,
  ...(isStaticExport ? { output: "export" as const } : {}),
  async rewrites() {
    if (!backendUrl) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
  images: {
    unoptimized: isStaticExport,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "videos.pexels.com" },
    ],
  },
};

export default nextConfig;
