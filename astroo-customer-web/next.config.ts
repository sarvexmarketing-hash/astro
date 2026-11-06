import type { NextConfig } from "next";

const backendUrl =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://astrowavebackend-production.up.railway.app/api"
    : "http://localhost:5001/api");

const adminUrl = process.env.ADMIN_URL || "http://localhost:3001/admin";
const astrologerUrl = process.env.ASTROLOGER_URL || "http://localhost:3002/astrologer";

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://*.razorpay.com https://www.google.com https://www.gstatic.com https://apis.google.com https://*.firebaseapp.com https://*.googleapis.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com;
  font-src 'self' https://fonts.gstatic.com data:;
  img-src 'self' blob: data: https: https://*.razorpay.com https://www.google.com https://www.gstatic.com https://lh3.googleusercontent.com;
  frame-src 'self' https://api.razorpay.com https://*.razorpay.com https://www.google.com https://recaptcha.google.com https://*.firebaseapp.com;
  connect-src 'self' https://api.razorpay.com https://*.razorpay.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.googleapis.com https://*.firebaseio.com https://www.google.com http://localhost:5001 http://127.0.0.1:5001 ws://localhost:5001 ws://127.0.0.1:5001 wss: https:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
`.replace(/\s{2,}/g, ' ').trim();

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
      {
        source: "/astrologer",
        destination: `${astrologerUrl}`,
      },
      {
        source: "/astrologer/:path*",
        destination: `${astrologerUrl}/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(self), geolocation=(self)",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
