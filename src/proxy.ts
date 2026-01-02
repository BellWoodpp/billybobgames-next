import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const DEFAULT_R2_ASSET_DOMAIN = "https://r2bucket.billybobgames.org";

const MEDIA_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".bmp",
  ".tiff",
  ".avif",
  ".ico",
  ".mp3",
  ".ogg",
  ".wav",
  ".m4a",
  ".flac",
  ".aac",
  ".opus",
  ".mp4",
  ".webm",
]);

function getExtension(pathname: string) {
  const dot = pathname.lastIndexOf(".");
  if (dot === -1) return "";
  return pathname.slice(dot).toLowerCase();
}

export function proxy(req: NextRequest) {
  // Only force `/games/*` media through R2 when explicitly enabled.
  // Default behavior should be: serve local assets when present, and let
  // `next.config.ts` fallback rewrites handle missing files via R2.
  if (process.env.GAMES_FROM_R2 !== "1") {
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;
  const ext = getExtension(pathname);
  if (!ext || !MEDIA_EXTENSIONS.has(ext)) {
    return NextResponse.next();
  }

  const assetDomain = process.env.R2_ASSET_DOMAIN || DEFAULT_R2_ASSET_DOMAIN;
  const rewritten = new URL(`${assetDomain}${pathname}`);
  rewritten.search = req.nextUrl.search;

  return NextResponse.rewrite(rewritten);
}

export const config = {
  matcher: ["/games/:path*"],
};
