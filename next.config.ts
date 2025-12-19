import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "r2bucket.billybobgames.org",
      },
      {
        protocol: "https",
        hostname: "r2boot.silksong.uk",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/games/:path*",
        destination: "https://r2bucket.billybobgames.org/games/:path*",
      },
    ];
  },
  reactCompiler: true,
};

export default nextConfig;
