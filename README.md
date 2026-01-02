This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# billybobgames-next

## R2 Game Media Offload (images/audio)

This repo keeps game HTML/JS/CSS under `public/games`, but serves **media files** (images/audio/video) from Cloudflare R2.

- Runtime: `src/proxy.ts` rewrites requests under `/games/**` for common media extensions to `R2_ASSET_DOMAIN` (default: `https://r2bucket.billybobgames.org`).
- Upload: `scripts/upload-r2.js` uploads only image/audio files from `public/` to the `billybobgames` R2 bucket.

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
