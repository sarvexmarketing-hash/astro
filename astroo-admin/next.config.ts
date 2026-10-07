import type { NextConfig } from "next";

const configuredApi = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const nextConfig: NextConfig = {
  basePath: "/admin",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${configuredApi}/:path*`,
      },
    ];
  },
};

export default nextConfig;
