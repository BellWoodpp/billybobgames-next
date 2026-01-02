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
