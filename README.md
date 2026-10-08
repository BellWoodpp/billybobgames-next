# Billy Bob Games

[![Billy Bob Games logo](https://r2bucket.billybobgames.org/logo/amazon-game-development.svg)](https://billybobgames.org)

Official website for this repository: **[https://billybobgames.org](https://billybobgames.org)**

Billy Bob Games is an independently maintained, one-person collection of free browser games. This repository contains
the website, game pages, browser integrations, and deployment configuration. It does not claim to be the official
project of every game, developer, publisher, or rights holder represented in the catalog.

- Brand name: **Billy Bob Games**
- Contact: **hello@billybobgames.org**
- Credits and source notes: **[billybobgames.org/credits](https://billybobgames.org/credits)**

## Getting Started

Install dependencies and run the local Cloudflare-compatible development server:

```bash
pnpm install
pnpm run dev:vinext
```

Open [http://localhost:3001](http://localhost:3001). For native Next.js compatibility testing, use `pnpm dev` and open port 3000.

The main site routes live under `src/app/(site)`.

## Cloudflare Workers (vinext)

The Cloudflare migration runs alongside the existing Next.js/Vercel setup.

- Develop: `pnpm run dev:vinext`
- Build: `pnpm run build:vinext`
- Preview the built Worker: `pnpm run start:vinext`
- Deploy: `pnpm run deploy:vinext`

The Worker is named `billybobgames-next`. `DATABASE_URL` is optional at deployment time; configure it as a Cloudflare Worker secret to enable the engagement APIs. Keep R2 upload credentials local; they are not Worker runtime secrets.

## R2 Game Media Offload (images/audio/video/WASM)

This repo keeps game HTML/JS/CSS under `public/games`, but serves **media files** (images/audio/video) from Cloudflare R2.

- Runtime: `src/proxy.ts` rewrites requests under `/games/**` for common media extensions to `R2_ASSET_DOMAIN` (default: `https://r2bucket.billybobgames.org`).
- Upload: `scripts/upload-r2.cjs` uploads supported media and WASM files from `public/` to the `billybobgames` R2 bucket.

### Upload game media to R2

Set credentials in your shell (do not commit):

- `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` (or `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`)
- Optional: `R2_ENDPOINT`, `R2_ASSET_DOMAIN`, `R2_CACHE_CONTROL`

Commands:

- Dry run: `npm run upload:r2:games:dry`
- Upload: `npm run upload:r2:games`

Optional (after upload): remove local media to keep the repo small (runtime will still load them from R2):

- Dry run: `npm run prune:games:media:dry`
- Delete: `npm run prune:games:media`

### About “iframe points to R2”

If you truly want `iframe src` to be on the R2 domain, then the game entry `index.html` (and any required JS/CSS) must also exist on R2.
If you keep HTML/JS/CSS only in GitHub, then the recommended setup is: keep `iframe src` on your site (e.g. `/games/<name>/index.html`) and let media load from R2 via the middleware rewrite.

## Likes (Neon Postgres)

This project supports **anonymous engagement** (like/dislike/collect, one vote per visitor per game, cancellable).

- API: `GET/POST /api/games/:slug/engagement`
- Storage: Neon (Postgres) via `DATABASE_URL`
- Visitor identity: an `HttpOnly` cookie `bbg_vid` (clearing cookies resets the engagement)

### Setup

1. Create the table in Neon: `scripts/sql/neon-game-engagement.sql`
2. Set `DATABASE_URL` in Vercel Project Settings → Environment Variables
