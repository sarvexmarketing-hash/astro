import type { NextConfig } from "next";

const backendUrl =
  process.env.BACKEND_URL
    ? (process.env.BACKEND_URL.endsWith('/api') ? process.env.BACKEND_URL : `${process.env.BACKEND_URL}/api`)
    : process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "https://astrowavebackend-production.up.railway.app/api";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  basePath: "/astrologer",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
