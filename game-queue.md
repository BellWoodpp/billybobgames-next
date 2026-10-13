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

Aim for one completed game per week. Process qualified candidates from the top of the queue: GitHub stars determine popularity, forks break ties, and recent repository activity is the final tie-breaker. Skip a higher-ranked game when its source, asset rights, English-language experience, or playability cannot be verified; record the reason instead of forcing publication.

Every Sunday, GitHub Actions refreshes `reports/game-discovery.md` and may add up to three licensed candidates here, while keeping the candidate backlog at six or fewer. It does not copy code or assets, run third-party build scripts, create public pages, or deploy the website. Move a candidate forward only after verifying the developer, the license coverage of every bundled asset, and the actual game.

Every Monday at 11:30 Asia/Shanghai, the weekly publishing workflow deploys at most the first `ready` game in this table. If no reviewed game is ready, it exits without publishing anything. A successful deployment changes that row to `published` and appends an immutable entry to `data/game-release-log.json`; candidates are never published automatically.

## Queue

| Game | Route | Category | Popularity | Language | Search Console evidence | Source / license | Play test | Status | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
<!-- GAME_QUEUE_ROWS -->
| HTML5 Asteroids | /html5-asteroids | arcade-games | GitHub 355 stars; 336 forks | Language-neutral or text-light; confirm in play test | Automated GitHub discovery; no Search Console evidence yet | [dmcinnes/HTML5-Asteroids](https://github.com/dmcinnes/HTML5-Asteroids); MIT code; bundled font and audio rights unclear | Source inspected; third-party font has copyright but no license, and audio license evidence is absent | paused | Do not publish unless every bundled font and audio right is replaced or verified |
| C4 – Connect Four | /c4 | puzzle-games | GitHub 281 stars; 105 forks | English confirmed on desktop and 390px mobile | Automated GitHub discovery; no Search Console evidence yet | [kenrick95/c4](https://github.com/kenrick95/c4); MIT; notice preserved; upstream commit d90d199 | Offline AI and local two-player tested in Chrome 155 on desktop and 390 x 844 mobile; click and touch-style input passed | published | Published 2026-10-14; monitor page views, game starts, errors, and Search Console performance |
| Snake Game | /snake-game | arcade-games | GitHub 184 stars; 75 forks | English declared in HTML; confirm in play test | Automated GitHub discovery; no Search Console evidence yet | [ramazancetinkaya/snake-game](https://github.com/ramazancetinkaya/snake-game); MIT detected; bundled-assets review required | Not run; demo responded 200 | candidate | Verify English UI, developer, and every asset license, then build and play-test in isolation |
| Starfall Phaser3 Typescript | /starfall-phaser3-typescript | arcade-games | GitHub 54 stars; 17 forks | Language-neutral or text-light; confirm in play test | Automated GitHub discovery; no Search Console evidence yet | [mariyadavydova/starfall-phaser3-typescript](https://github.com/mariyadavydova/starfall-phaser3-typescript); MIT detected; bundled-assets review required | Not run; no live demo detected | candidate | Verify English UI, developer, and every asset license, then build and play-test in isolation |
| MedievalWar | /medievalwar | arcade-games | GitHub 39 stars; 7 forks | Language-neutral or text-light; confirm in play test | Automated GitHub discovery; no Search Console evidence yet | [tranchikhang/MedievalWar](https://github.com/tranchikhang/MedievalWar); MIT detected; bundled-assets review required | Not run; demo responded 200 | candidate | Verify English UI, developer, and every asset license, then build and play-test in isolation |
| StackQuest | /stackquest | arcade-games | GitHub 21 stars; 5 forks | Language-neutral or text-light; confirm in play test | Automated GitHub discovery; no Search Console evidence yet | [FinalStackQuest/StackQuest](https://github.com/FinalStackQuest/StackQuest); MIT detected; bundled-assets review required | Not run; no live demo detected | candidate | Verify English UI, developer, and every asset license, then build and play-test in isolation |

## Required evidence before publishing

- [ ] The game actually loads and can be played through its basic loop.
- [ ] Developer and primary source are identified without guessing.
- [ ] Hosting or distribution basis is recorded; unclear rights block publication.
- [ ] The running game is confirmed to use English, or to be genuinely language-neutral.
- [ ] Title, description, unique H1, and original introduction are complete.
- [ ] Controls and gameplay goal come from a real play test.
- [ ] Desktop and mobile behavior are described accurately.
- [ ] Black-screen, sound, and loading guidance reflects observed behavior.
- [ ] At least one real gameplay screenshot is present.
- [ ] The last-tested date is current and uses `YYYY-MM-DD`.
- [ ] Three to six related games use specific game names as anchor text.
- [ ] The game is added to `game-catalog.ts` with at least one real category.
- [ ] The homepage links the new game in its game list or recent-update section.
- [ ] `pnpm game:history -- --route /example-game --language english-confirmed` records the publication, source, and content revision.
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

Record a new English publication before the final check:

```bash
pnpm game:history -- --route /example-game --language english-confirmed
```

For a game with no player-facing language, use `language-neutral-confirmed` instead. Existing legacy games are recorded without invented publication dates; all new games must pass this language gate.

Refresh open-source candidates locally (this updates the report and queue):

```bash
pnpm game:discover
```

Preview discovery without changing files:

```bash
pnpm game:discover -- --dry-run --limit 3
```

Preview which reviewed game the weekly workflow would publish:

```bash
pnpm game:release -- select
```

The generator never adds a draft to the catalog or Sitemap. The generated route returns 404 until `GAME_PAGE_STATUS` is manually changed to `published` after all `TODO` items are replaced.
