import type { NextConfig } from "next";

const nextConfig = {
  serverExternalPackages: ["pg"],
  outputFileTracingIncludes: {
    "/*": ["./node_modules/pg/**/*", "./db/**/*"],
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.vietqr.io", // ← thêm để QR load được
      },
    ],
  },
  output: "standalone",
};

export default nextConfig;
