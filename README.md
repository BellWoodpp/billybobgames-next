# Billy Bob Games

<p align="center">
  <a href="https://billybobgames.org">
    <img
      src="https://r2bucket.billybobgames.org/logo/amazon-game-development.svg"
      alt="Billy Bob Games logo"
      width="96"
      height="96"
    />
  </a>
</p>

<p align="center">
  <strong>Free browser games that launch directly in your browser.</strong>
</p>

<p align="center">
  <a href="https://billybobgames.org"><strong>Play on BillyBobGames.org</strong></a>
</p>

Billy Bob Games is an independently maintained browser-game collection. This repository contains the website,
game-page integrations, publishing tools, and Cloudflare deployment configuration used by
[billybobgames.org](https://billybobgames.org).

Billy Bob Games is not presented as the official website of every game, developer, publisher, or rights holder in
the catalog. Individual credits and source information are recorded on the website.

## Browse the collection

- [Arcade games](https://billybobgames.org/arcade-games)
- [Idle games](https://billybobgames.org/idle-games)
- [Music games](https://billybobgames.org/music-games)
- [Card games](https://billybobgames.org/card-games)
- [Puzzle games](https://billybobgames.org/puzzle-games)
- [Retro games](https://billybobgames.org/retro-games)

## Project goals

- Keep every published game genuinely playable.
- Provide clear controls, compatibility notes, troubleshooting, credits, and source information.
- Test important pages on desktop and mobile before publication.
- Publish slowly and deliberately instead of generating large numbers of low-value pages.
- Keep draft or broken games out of the catalog and Sitemap.

## Local development

Install dependencies:

```bash
pnpm install
```

Start the Cloudflare-compatible development server:

```bash
pnpm dev:vinext
```

Open [http://localhost:3001](http://localhost:3001).

For native Next.js development, run `pnpm dev` and open [http://localhost:3000](http://localhost:3000).

## Game publishing workflow

New games move through the queue in [`game-queue.md`](./game-queue.md):

```text
candidate -> source-check -> play-test -> draft -> ready -> published
```

The automated discovery job ranks candidates by GitHub stars, using forks and recent activity only as tie-breakers.
Only games with an English or language-neutral signal enter the queue, and the running game must be manually
confirmed before publication.

Create a draft page:

```bash
pnpm game:new -- --slug example-game --title "Example Game" --category arcade-games
```

Draft pages remain excluded from the public catalog and Sitemap. Before publishing, verify the source and license,
test the English experience on desktop and mobile, replace every placeholder, record the publication, and run:

```bash
pnpm game:history -- --route /example-game --language english-confirmed
pnpm game:check
```

[`data/game-publication-history.json`](./data/game-publication-history.json) permanently records published titles,
routes, primary sources, catalog snapshots, and content hashes so retired or renamed games are not accidentally
published again.

The same validation runs before a Cloudflare deployment.

## Deployment

The production site runs on Cloudflare Workers, with large game assets served through Cloudflare R2.

```bash
pnpm build:vinext
pnpm deploy:vinext
```

Never commit Cloudflare, R2, database, email, or other service credentials to this repository.

## Credits, rights, and contact

- Website: [https://billybobgames.org](https://billybobgames.org)
- Credits and game sources: [billybobgames.org/credits](https://billybobgames.org/credits)
- DMCA and rights requests: [billybobgames.org/dmca](https://billybobgames.org/dmca)
- Contact: [hello@billybobgames.org](mailto:hello@billybobgames.org)

Game developers and rights holders retain their respective rights. If you own content represented on the site and
believe its attribution or availability needs to be corrected, please use the contact or DMCA page above.
