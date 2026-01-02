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
    const useR2Games = process.env.GAMES_FROM_R2 === "1";
    const r2AssetDomain = process.env.R2_ASSET_DOMAIN || "https://r2bucket.billybobgames.org";

    const sprunkiRewrite = {
      source: "/r2/sprunki/:path*",
      destination: `${r2AssetDomain}/sprunki/:path*`,
    };

    // Sprunki is a TurboWarp-packaged Scratch project that references hashed assets
    // next to its HTML (e.g. `./<md5>.<ext>`). In this repo we may keep those files
    // locally for fast dev, but in production we can fall back to R2 when missing.
    const sprunkiGameAssetsRewrite = {
      source: "/games/incredibox-sprunki/:path*",
      destination: `${r2AssetDomain}/sprunki/:path*`,
    };

    const gamesRewrite = {
      source: "/games/:path*",
      destination: `${r2AssetDomain}/games/:path*`,
    };

    if (useR2Games) {
      return [sprunkiRewrite, sprunkiGameAssetsRewrite, gamesRewrite];
    }

    // Many game bundles are intentionally incomplete in `public/games` (to keep repo size down),
    // but the missing assets are available in R2. Use a fallback rewrite so local files win when
    // present, and only missing `/games/*` assets are proxied to R2.
    return {
      beforeFiles: [sprunkiRewrite],
      afterFiles: [],
      fallback: [sprunkiGameAssetsRewrite, gamesRewrite],
    };
  },
  reactCompiler: true,
};

export default nextConfig;
