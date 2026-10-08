#!/usr/bin/env node

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CATALOG_PATH = resolve(ROOT, "src/app/(site)/_data/game-catalog.ts");
const QUEUE_PATH = resolve(ROOT, "game-queue.md");
const QUEUE_MARKER = "<!-- GAME_QUEUE_ROWS -->";

function usage() {
  console.log(`Create a safe, non-indexable game page draft.

Usage:
  pnpm game:new -- --slug <game-slug> --title "Game title" --category <category-slug>

Example:
  pnpm game:new -- --slug example-game --title "Example Game" --category arcade-games`);
}

function parseArguments(argv) {
  const values = {};

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--") continue;
    if (argument === "--help" || argument === "-h") {
      usage();
      process.exit(0);
    }
    if (!argument.startsWith("--")) {
      throw new Error(`Unexpected argument: ${argument}`);
    }

    const key = argument.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }
    values[key] = value;
    index += 1;
  }

  return values;
}

function toComponentName(slug) {
  return `${slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("")}Page`;
}

function escapeMarkdownCell(value) {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}

async function pathExists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function buildPage({ slug, title }) {
  const pageName = toComponentName(slug);
  const path = `/${slug}`;
  const canonical = `https://billybobgames.org${path}`;
  const titleLiteral = JSON.stringify(title);

  return `// game-page-scaffold:v1
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GameEditorialContent from "../_components/GameEditorialContent";
import SimpleGamePage from "../_components/SimpleGamePage";
import styles from "../styles/game-page.module.css";

const GAME_PAGE_STATUS = "draft" as string;
const GAME_TITLE = ${titleLiteral};
const GAME_PATH = ${JSON.stringify(path)};
const GAME_IMAGE = "TODO: real gameplay image URL";

export const metadata: Metadata = {
  title: GAME_TITLE,
  description: "TODO: Write an accurate description based on your own play test.",
  alternates: {
    canonical: ${JSON.stringify(canonical)},
  },
  robots:
    GAME_PAGE_STATUS === "published"
      ? { index: true, follow: true }
      : { index: false, follow: false },
};

export default function ${pageName}() {
  if (GAME_PAGE_STATUS !== "published") notFound();

  return (
    <SimpleGamePage
      title={GAME_TITLE}
      subtitle="TODO: One accurate sentence describing the playable experience."
      recentlyPlayed={{ href: GAME_PATH, title: GAME_TITLE, img: GAME_IMAGE }}
      iframeSrc="TODO: /games/${slug}/index.html"
      iframeTitle=${JSON.stringify(`${title} game`)}
      allow="autoplay; fullscreen; gamepad"
      allowFullScreen
      showFullscreenButton
      frameClassName={styles.gameFrameWide}
      creatorName="TODO: Verified developer name"
      creatorUrl="TODO: https://primary-developer-source.example"
      howToItems={[
        "TODO: Describe the first real control you tested.",
        "TODO: Describe another real control or interaction.",
        "TODO: Explain how the player makes progress.",
        "TODO: Add a useful tip observed during play.",
      ]}
      showRelatedGames={false}
      extraContent={
        <GameEditorialContent
          title={GAME_TITLE}
          introduction={[
            "TODO: Write an original introduction from your own play session.",
            "TODO: Explain what makes this version useful without copying another site.",
          ]}
          controls={[
            "TODO: Keyboard, mouse, touch, or gamepad control.",
            "TODO: Secondary control.",
          ]}
          goal="TODO: State the real objective and success condition."
          desktopCompatibility="TODO: Record the browsers and desktop behavior you tested."
          mobileCompatibility="TODO: Record the actual phone behavior, or clearly state that mobile is unsupported."
          troubleshooting={[
            "TODO: Record the observed loading behavior.",
            "TODO: Add a real black-screen recovery step.",
            "TODO: Add the tested sound-unlock step.",
          ]}
          screenshots={[
            {
              src: "TODO: real screenshot URL",
              alt: "TODO: Describe what is visibly happening in the screenshot.",
              width: 1280,
              height: 720,
              caption: "TODO: Explain the gameplay moment shown.",
            },
          ]}
          attribution={{
            developer: "TODO: Verified developer name",
            developerUrl: "TODO: https://primary-developer-source.example",
            source: "TODO: Primary source or repository name",
            sourceUrl: "TODO: https://primary-source.example",
            note: "TODO: State the hosting, port, or license basis without claiming ownership.",
          }}
          lastTested="TODO: YYYY-MM-DD"
          relatedGames={[
            { href: "/TODO-related-game-1", title: "TODO: Related game 1" },
            { href: "/TODO-related-game-2", title: "TODO: Related game 2" },
            { href: "/TODO-related-game-3", title: "TODO: Related game 3" },
          ]}
        />
      }
    />
  );
}
`;
}

async function main() {
  const { slug, title, category } = parseArguments(process.argv.slice(2));

  if (!slug || !title || !category) {
    usage();
    throw new Error("--slug, --title, and --category are required.");
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Slug must use lowercase letters, numbers, and single hyphens only.");
  }
  if (title.trim().length < 2) {
    throw new Error("Title must contain at least two characters.");
  }

  const catalogSource = await readFile(CATALOG_PATH, "utf8");
  const validCategories = new Set(
    [...catalogSource.matchAll(/\bslug:\s*"([^"]+)"/g)].map((match) => match[1]),
  );
  if (!validCategories.has(category)) {
    throw new Error(
      `Unknown category "${category}". Choose one of: ${[...validCategories].join(", ")}`,
    );
  }

  const pagePath = resolve(ROOT, `src/app/(site)/${slug}/page.tsx`);
  if (await pathExists(pagePath)) {
    throw new Error(`Refusing to overwrite existing page: ${pagePath}`);
  }

  const queueSource = await readFile(QUEUE_PATH, "utf8");
  if (!queueSource.includes(QUEUE_MARKER)) {
    throw new Error(`Queue marker is missing from ${QUEUE_PATH}`);
  }
  if (queueSource.includes(`| /${slug} |`)) {
    throw new Error(`The queue already contains /${slug}.`);
  }

  const row = `| ${escapeMarkdownCell(title.trim())} | /${slug} | ${category} | TODO | TODO | TODO | draft | Replace every TODO and complete a real play test |`;
  const updatedQueue = queueSource.replace(QUEUE_MARKER, `${row}\n${QUEUE_MARKER}`);

  await mkdir(dirname(pagePath), { recursive: true });
  await Promise.all([
    writeFile(pagePath, buildPage({ slug, title: title.trim() }), "utf8"),
    writeFile(QUEUE_PATH, updatedQueue, "utf8"),
  ]);

  console.log(`Created draft: ${pagePath}`);
  console.log(`Added /${slug} to ${QUEUE_PATH}`);
  console.log("The draft returns 404 and stays out of the catalog and Sitemap until manually published.");
  console.log("Next: replace every TODO, run a real play test, add the game to game-catalog.ts and the homepage, then run pnpm game:check.");
}

main().catch((error) => {
  console.error(`game:new failed: ${error.message}`);
  process.exitCode = 1;
});
