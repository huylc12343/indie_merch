import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "directus.indiindishow.com",
      },
    ],
  },
};



export default nextConfig;
