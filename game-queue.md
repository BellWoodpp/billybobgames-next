# Billy Bob Games publishing queue

This file is the small weekly queue for adding real, playable games without mass-producing thin pages.

## Status flow

`candidate` → `source-check` → `play-test` → `draft` → `ready` → `published`

- `candidate`: Search Console, audience evidence, or the automated open-source discovery report suggests the game may be useful. Discovery alone is not publication approval.
- `source-check`: Confirm the developer, primary source, and permission or license basis.
- `play-test`: Open the actual game and record controls, goal, device support, loading, sound, and failures.
- `draft`: The page scaffold exists but returns 404 and is marked `noindex`.
- `ready`: Content and assets are complete; run `pnpm game:check` before changing the scaffold to `published`.
- `published`: The game is in the catalog, category pages, homepage, related links, and Sitemap.
- Use `paused` for a temporarily broken game and `retired` for a removed game.

## Weekly rule

Aim for one completed game per week. Skip publication when the source is unclear, the game is not reliably playable, or the page would depend on invented information.

Every Sunday, GitHub Actions refreshes `reports/game-discovery.md` and may add up to three licensed candidates here, while keeping the candidate backlog at six or fewer. It does not copy code or assets, run third-party build scripts, create public pages, or deploy the website. Move a candidate forward only after verifying the developer, the license coverage of every bundled asset, and the actual game.

## Queue

| Game | Route | Category | Search Console evidence | Source / license | Play test | Status | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- |
<!-- GAME_QUEUE_ROWS -->
| Letreco | /letreco | puzzle-games | Automated GitHub discovery; no Search Console evidence yet | [gabtoschi/letreco](https://github.com/gabtoschi/letreco); MIT detected; bundled-assets review required | Not run; demo responded 200 | candidate | Verify developer and every asset license, then build and play-test in isolation |
| Tinyhumans | /tinyhumans | arcade-games | Automated GitHub discovery; no Search Console evidence yet | [thesephist/tinyhumans](https://github.com/thesephist/tinyhumans); MIT detected; bundled-assets review required | Not run; demo responded 200 | candidate | Verify developer and every asset license, then build and play-test in isolation |
| MedievalWar | /medievalwar | arcade-games | Automated GitHub discovery; no Search Console evidence yet | [tranchikhang/MedievalWar](https://github.com/tranchikhang/MedievalWar); MIT detected; bundled-assets review required | Not run; demo responded 200 | candidate | Verify developer and every asset license, then build and play-test in isolation |
| Snake Game | /snake-game | arcade-games | Automated GitHub discovery; no Search Console evidence yet | [ramazancetinkaya/snake-game](https://github.com/ramazancetinkaya/snake-game); MIT detected; bundled-assets review required | Not run; demo responded 200 | candidate | Verify developer and every asset license, then build and play-test in isolation |
| C4 | /c4 | arcade-games | Automated GitHub discovery; no Search Console evidence yet | [kenrick95/c4](https://github.com/kenrick95/c4); MIT detected; bundled-assets review required | Not run; demo responded 200 | candidate | Verify developer and every asset license, then build and play-test in isolation |
| Snakeball | /snakeball | arcade-games | Automated GitHub discovery; no Search Console evidence yet | [JIEJOE-Visual/snakeball](https://github.com/JIEJOE-Visual/snakeball); MIT detected; bundled-assets review required | Not run; demo responded 200 | candidate | Verify developer and every asset license, then build and play-test in isolation |

## Required evidence before publishing

- [ ] The game actually loads and can be played through its basic loop.
- [ ] Developer and primary source are identified without guessing.
- [ ] Hosting or distribution basis is recorded; unclear rights block publication.
- [ ] Title, description, unique H1, and original introduction are complete.
- [ ] Controls and gameplay goal come from a real play test.
- [ ] Desktop and mobile behavior are described accurately.
- [ ] Black-screen, sound, and loading guidance reflects observed behavior.
- [ ] At least one real gameplay screenshot is present.
- [ ] The last-tested date is current and uses `YYYY-MM-DD`.
- [ ] Three to six related games use specific game names as anchor text.
- [ ] The game is added to `game-catalog.ts` with at least one real category.
- [ ] The homepage links the new game in its game list or recent-update section.
- [ ] `pnpm game:check`, TypeScript, lint, and the Cloudflare build pass.

## Commands

Create a safe draft scaffold:

```bash
pnpm game:new -- --slug example-game --title "Example Game" --category arcade-games
```

Check the publishing structure:

```bash
pnpm game:check
```

Refresh open-source candidates locally (this updates the report and queue):

```bash
pnpm game:discover
```

Preview discovery without changing files:

```bash
pnpm game:discover -- --dry-run --limit 3
```

The generator never adds a draft to the catalog or Sitemap. The generated route returns 404 until `GAME_PAGE_STATUS` is manually changed to `published` after all `TODO` items are replaced.
