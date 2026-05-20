import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "directus.indiindishow.com",
      },
      {
        protocol: "https",
        hostname: "api.vietqr.io",  // ← thêm để QR load được
      },
    ],
  },
};


export default nextConfig;
