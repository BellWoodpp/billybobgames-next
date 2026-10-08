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

## Safe weekly game publishing

Use [`game-queue.md`](./game-queue.md) to move one candidate at a time through source review, play testing, drafting,
and publication.

Create a draft page:

```bash
pnpm game:new -- --slug example-game --title "Example Game" --category arcade-games
```

The generated route returns 404, uses `noindex`, and stays outside the catalog and Sitemap until it is manually marked
`published`. Replace every `TODO`, add the verified game to `game-catalog.ts` and the homepage, then run:

```bash
pnpm game:check
```

The same check runs automatically before `pnpm run deploy:vinext`. It verifies structural publishing requirements but
does not replace a real play test or a manual rights/source review.

## Daily popular-game ordering

The homepage defaults to a 28-day popularity order generated from real Billy Bob Games page views in MyWebAstra D1.

- Local update with the existing Wrangler login: `npm run update:popular-games:local`
- Cloudflare API update: `npm run update:popular-games`
- Generated file: `src/app/(site)/_data/popular-games.generated.ts`
- Daily GitHub Action: `.github/workflows/update-popular-games.yml` at 02:15 UTC (10:15 Asia/Shanghai)

The GitHub Action needs these repository secrets:

- `CLOUDFLARE_API_TOKEN`: a dedicated automation token limited to D1 query access and deployment of this Worker
- `CLOUDFLARE_ACCOUNT_ID`
- `MYWEBASTRA_DATABASE_ID`
- `MYWEBASTRA_SITE_ID`

The scheduled job queries the rolling 28-day totals, rebuilds and deploys the Cloudflare Worker, and then commits the
generated ranking back to GitHub. Do not copy a broad Wrangler OAuth credential into GitHub; create a dedicated token
for this job with only the required D1 and Workers permissions.

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
