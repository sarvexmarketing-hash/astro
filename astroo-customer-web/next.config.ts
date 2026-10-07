import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
const adminUrl = process.env.ADMIN_URL || "http://localhost:3001/admin";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
      },
      {
        source: "/admin",
        destination: `${adminUrl}`,
      },
      {
        source: "/admin/:path*",
        destination: `${adminUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
