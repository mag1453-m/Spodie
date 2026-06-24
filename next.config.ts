import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sol alttaki Next.js geliştirme göstergesini (N butonu) gizle
  devIndicators: false,
  // Lokal geliştirmede 127.0.0.1 ve localhost'tan gelen istekleri kabul et
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    // Spotify albüm kapakları bu alan adlarından gelir
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.scdn.co",
      },
      {
        protocol: "https",
        hostname: "*.scdn.co",
      },
    ],
  },
};

export default nextConfig;
