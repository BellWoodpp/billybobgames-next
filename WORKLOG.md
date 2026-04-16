# BillyBobGames Migration Worklog

This file is the handoff record for this repo (`/home/lcl/nuxt-to-next/2.billybobgames`).

## Current Goal
- Deploy on Vercel (code on GitHub/Vercel).
- Offload **game media assets** (images/audio/video) to Cloudflare R2.
- Keep game HTML/JS/CSS in repo; keep iframe pointing to site-local `/games/.../index.html` (recommended).

## R2 Setup (what matters)
- Upload credentials are **local-only** (do **not** put secrets on Vercel):
  - `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` (or `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
  - `R2_ENDPOINT` (S3 endpoint, optional locally if default matches your account)
- Runtime (Vercel) should only need:
  - `R2_ASSET_DOMAIN` (optional; defaults to `https://r2bucket.billybobgames.org`)

## Implemented Behavior
- Next rewrites/proxy make games load missing media from R2, while keeping HTML/JS/CSS local.
  - Media under `/games/*` is rewritten to R2.
  - Sprunki has a dedicated fallback rule (see below).

## Key Files / Scripts
- Proxy rewrite for `/games/*` media: `src/proxy.ts`
- Next rewrites (Sprunki + games fallback): `next.config.ts`
- Upload media from `public/games/*` to R2: `scripts/upload-r2.js`
  - `npm run upload:r2:games`
- Prune local game media after upload (keeps repo small): `scripts/prune-games-media.js`
  - `npm run prune:games:media`
- Upload Sprunki hashed assets to R2 from `project.json`: `scripts/upload-r2-sprunki-assets.js`
  - `npm run upload:r2:sprunki`

## Fixes Done
- **BLOODMONEY** stuck at 98–99%:
  - Added decode failure handling so audio errors don’t block boot forever: `public/games/bloodmoney/js/rpg_core.js`
  - Preload plugin treats errored audio as “ready enough”: `public/games/bloodmoney/js/plugins/Aetherflow_PreloadEverything.js`
- **Sprunki slow load**:
  - Root issue: missing `/sprunki/<md5>.<ext>` assets in R2 caused long stalls/404s.
  - Uploaded all 596 hashed assets referenced by `public/games/incredibox-sprunki/project.json` to R2.
  - For fast local dev, copied hashed assets from `Incredibox - Sprunki/` into `public/games/incredibox-sprunki/` (these are gitignored, so not deployed).
  - Switched `public/games/incredibox-sprunki/index.html` asset URL to `./<md5>.<ext>`.
  - Added rewrite fallback so production can still fetch from R2 when local files are missing:
    - `/games/incredibox-sprunki/:path*` → `${R2_ASSET_DOMAIN}/sprunki/:path*` (fallback)

## Common Commands
- Upload all game media to R2:
  - `npm run upload:r2:games`
- Upload Sprunki hashed assets to R2:
  - `npm run upload:r2:sprunki`
- Prune local media (after upload):
  - `npm run prune:games:media`
- Build sanity check:
  - `npm run build`

## Status / Next Steps
- If Sprunki is still “slow” after assets exist:
  - Most likely due to large `.wav` payloads + browser decode time.
  - Next optimization would be re-packaging Sprunki to use compressed audio (ogg/mp3) or to reduce initial preload.

## 2026-01-02 (UI + navigation updates)
### Changed
- Added an app sidebar (desktop sticky, mobile drawer) and integrated it into the global layout/header.
- Sidebar styling updated to match the page chrome (light translucent panel); sidebar brand uses `https://r2bucket.billybobgames.org/logo/amazon-game-development.svg`.
- Removed the `/funkin` route and the Funkin entry from the homepage.
- Homepage section title renamed from “Other games” to “New Game”, and the homepage container widened to better align with the left sidebar.
- Friend links: `itch.io`, `Steam`, `Xbox` set to `rel="nofollow noopener noreferrer"`; `silksong` remains dofollow (no `nofollow`).
- Implemented a real “Recently played” feature:
  - Sidebar “Recently played” now routes to `/recently-played`.
  - `/recently-played` reads history from browser `localStorage`, shows a list, and supports clearing.
  - Game pages record visits via a small client tracker (covers `SimpleGamePage`-based games plus `sprunki`, `Spider-Solitaire`, and `/bloodmoney/play`).

### TODO (next time)
- Decide whether `/bloodmoney` (SEO page) should also record as “recently played” (currently `/bloodmoney/play` records).
- Consider adding thumbnails/labels for any future non-`SimpleGamePage` games so they appear nicely in “Recently played”.

## 2026-01-02 (workflow)
### Changed
- Updated repo `AGENTS.md` so saying “收工” also runs `git add .` → `git commit -m "new change"` → `git push` (skips if nothing to commit).
- Ensured local-only folder `Incredibox - Sprunki/` is gitignored to avoid committing large local assets.

## 2026-01-02 (homepage loading skeleton)
### Changed
- Added shadcn `Skeleton` UI component and used it on the homepage game cards so images show a skeleton placeholder until loaded (with fade-in).

### TODO (next time)
- Consider applying the same skeleton pattern to other image-heavy sections (e.g. future featured areas) if you want consistent loading UX.

## 2026-01-02 (Neon engagement / likes)
### Changed
- Added Neon-backed anonymous engagement (per-game per-visitor, cancellable):
  - API: `/api/games/:slug/engagement` (like/dislike/collect)
  - DB schema: `scripts/sql/neon-game-engagement.sql`
  - Neon helper: `src/lib/neon.ts`
  - BLOODMONEY UI wired to API: `src/app/(site)/bloodmoney/BloodmoneyEngagementClient.tsx`
- Kept the legacy `/api/games/:slug/like` endpoint (single-like) for compatibility, but recommended path is `engagement`.
- Added `.env.example` and updated `.gitignore` to allow committing it (and ignore local `.pnpm-store/`).

### BLOODMONEY page CTA
- `/bloodmoney` now uses a clickable hero image CTA to open `/bloodmoney/play`:
  - Image: `https://r2bucket.billybobgames.org/bloodmoney-webp/bloodmoney.webp`
  - Code: `src/app/(site)/bloodmoney/BloodmoneyContent.tsx`

### TODO (next time)
- In Neon: execute `scripts/sql/neon-game-engagement.sql` and set `DATABASE_URL` on Vercel.
- Decide whether to remove the legacy `/api/games/:slug/like` endpoint once all pages use `/engagement`.

## 2026-01-02 (AdSense Auto ads)
### Changed
- Enabled global AdSense Auto ads script in the Next root layout (loads on all Next pages): `src/app/layout.tsx`.

### TODO (next time)
- If you want ads inside raw static game HTML pages under `public/games/**`, inject the AdSense script into those `index.html` files too (currently intentionally skipped).

## 2026-04-16 (fullscreen controls + homepage video previews)
### Changed
- Unified game frame controls to the shared two-button pattern (`Wide mode` + `Game fullscreen`) used by `Evolve Idle`.
- Pages updated to use the shared controls:
  - `BLOODMONEY`
  - `Sprunki Remix`
  - `Spider Solitaire`
  - `Flappy Text`
  - `Pac-Man`
  - `Fruit Ninja`
  - `HTML5 Mario`
  - `Fish Joy Reloaded`
  - `HTML5 City Match`
  - `Mouse Hit Mania`
  - `HTML5 Fly`
  - `HTML5 Slot Machine`
- Extended the shared frame component so game pages can keep custom iframe refs / `onLoad` hooks and optional overlay controls.
- `BLOODMONEY` now reuses the shared frame controls instead of a custom fullscreen button.
- `Sprunki Remix` now reuses the shared frame controls while keeping its in-iframe reset button injection.
- `Spider Solitaire` now reuses the shared frame controls while keeping its audio toggle overlay and audio bridge logic.
- Added homepage hover-preview videos (same behavior as `Evolve Idle`) for:
  - `BLOODMONEY`
  - `Sprunki Remix`
  - `Spider Solitaire`
  - `Flappy Text`
- Created local preview videos with audio removed for:
  - `public/videos/bloodmoney-preview.mp4`
  - `public/games/incredibox-sprunki/sprunki-preview.mp4`
  - `public/games/spider-solitaire/spider-solitaire-preview.mp4`
  - `public/games/flappy-text/flappy-text-preview.mp4`
- Restored `BLOODMONEY` local `img/pictures` assets (`71` files) to stop runtime missing-picture errors during local play. These restored images are local-only because `/public/games/**/*.png` is gitignored.

### Important notes
- Superseded by later R2 preview-video work: production should use R2 preview URLs while local files remain useful for development.
- `BLOODMONEY` local `img/pictures` fixes also work locally, but those PNGs are gitignored and are not currently set up to be committed.
- Superseded by later homepage time-filter refactor: the `Date.now()` purity lint issue is resolved.

### TODO (next time)
- Decide whether to keep relying on R2 fallback for `BLOODMONEY` pictures or explicitly allow committing the restored local images.
- Review the untracked `Evolve` page/assets state before any production push.

## 2026-04-16 (R2 preview videos + homepage Date.now fix)
### Changed
- Uploaded homepage hover-preview videos to R2 so production can use remote assets:
  - `https://r2bucket.billybobgames.org/videos/bloodmoney-preview.mp4`
  - `https://r2bucket.billybobgames.org/games/evolve/evolve-preview.mp4`
  - `https://r2bucket.billybobgames.org/sprunki/sprunki-preview.mp4`
  - `https://r2bucket.billybobgames.org/games/spider-solitaire/spider-solitaire-preview.mp4`
  - `https://r2bucket.billybobgames.org/games/flappy-text/flappy-text-preview.mp4`
- Homepage preview videos now use local files only in development and use `R2_ASSET_DOMAIN` (default `https://r2bucket.billybobgames.org`) in non-development environments: `src/app/(site)/page.tsx`
- Fixed the homepage `Date.now()` purity lint issue by moving the "New" filter time logic into a client component: `src/app/(site)/_components/HomeGamesSection.tsx`
- Verified the updated homepage files with lint and TypeScript checks.

### Important notes
- Local preview video files are still useful for development, but production no longer depends on committing those `.mp4` files under `public/games/**`.
- The previous homepage `Date.now()` lint issue is resolved.

### TODO (next time)
- Decide whether to keep or clean up local preview video files that are now only needed for development.
- Decide whether to keep relying on R2 fallback for `BLOODMONEY` pictures or explicitly allow committing the restored local images.
- Review the untracked `Evolve` page/assets state before any production push.
