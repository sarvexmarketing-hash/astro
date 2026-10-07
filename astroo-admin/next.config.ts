import type { NextConfig } from "next";

const configuredApi = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "https://astrowavebackend-production.up.railway.app/api";

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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
