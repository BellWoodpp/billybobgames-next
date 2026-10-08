#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SITE_ROOT = resolve(ROOT, "src/app/(site)");
const CATALOG_PATH = resolve(SITE_ROOT, "_data/game-catalog.ts");
const HOME_PATH = resolve(SITE_ROOT, "page.tsx");
const SITEMAP_PATH = resolve(ROOT, "src/app/sitemap.ts");
const QUEUE_PATH = resolve(ROOT, "game-queue.md");
const SCAFFOLD_MARKER = "// game-page-scaffold:v1";

const errors = [];
const warnings = [];

function addError(message) {
  errors.push(message);
}

function addWarning(message) {
  warnings.push(message);
}

function getQuotedField(source, field) {
  return source.match(new RegExp(`\\b${field}:\\s*"([^"]*)"`))?.[1];
}

function parseCatalog(source) {
  const categories = new Set(
    [...source.matchAll(/\bslug:\s*"([^"]+)"/g)].map((match) => match[1]),
  );
  const catalogStart = source.indexOf("export const catalogGames");
  const catalogEnd = source.indexOf("export function getCategory");
  const catalogSource = source.slice(catalogStart, catalogEnd);
  const games = [];
  const gamePattern = /\{\s*href:\s*"([^"]+)",([\s\S]*?)categories:\s*\[([^\]]*)\],\s*\n\s*\},/g;

  for (const match of catalogSource.matchAll(gamePattern)) {
    const [, href, body, categorySource] = match;
    games.push({
      href,
      title: getQuotedField(body, "title"),
      img: getQuotedField(body, "img"),
      alt: getQuotedField(body, "alt"),
      description: getQuotedField(body, "description"),
      categories: [...categorySource.matchAll(/"([^"]+)"/g)].map((categoryMatch) => categoryMatch[1]),
    });
  }

  return { categories, games };
}

function parseQueue(source) {
  const rows = new Map();

  for (const line of source.split("\n")) {
    if (!line.startsWith("|") || line.includes("| ---")) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    if (cells[0] === "Game" || !cells[1]?.startsWith("/")) continue;
    rows.set(cells[1], {
      title: cells[0],
      route: cells[1],
      category: cells[2],
      searchEvidence: cells[3],
      source: cells[4],
      playTest: cells[5],
      status: cells[6],
      nextAction: cells[7],
    });
  }

  return rows;
}

async function listPageFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listPageFiles(path)));
    } else if (entry.name === "page.tsx") {
      files.push(path);
    }
  }

  return files;
}

function routeFromPagePath(pagePath) {
  const directory = dirname(relative(SITE_ROOT, pagePath));
  return `/${directory.replaceAll("\\", "/")}`;
}

function hasPlaceholder(value) {
  return !value || /TODO|example\.(com|example)/i.test(value);
}

function validatePublishedScaffold({ route, source, catalogByHref, homeSource, queueRows }) {
  if (source.includes("TODO")) {
    addError(`${route}: published scaffold still contains TODO placeholders.`);
  }

  const game = catalogByHref.get(route);
  if (!game) {
    addError(`${route}: published scaffold is missing from game-catalog.ts.`);
  }
  if (!homeSource.includes(JSON.stringify(route))) {
    addError(`${route}: published scaffold is not linked from the homepage game list or recent updates.`);
  }

  const queueRow = queueRows.get(route);
  if (!queueRow) {
    addError(`${route}: published scaffold is missing from game-queue.md.`);
  } else {
    if (queueRow.status !== "published") {
      addError(`${route}: queue status must be published, currently ${queueRow.status || "blank"}.`);
    }
    for (const [label, value] of [
      ["Search Console evidence", queueRow.searchEvidence],
      ["source / license", queueRow.source],
      ["play test", queueRow.playTest],
    ]) {
      if (hasPlaceholder(value)) addError(`${route}: queue ${label} is incomplete.`);
    }
  }

  const expectedCanonical = `https://billybobgames.org${route}`;
  if (!source.includes(`canonical: ${JSON.stringify(expectedCanonical)}`)) {
    addError(`${route}: canonical URL must be ${expectedCanonical}.`);
  }
  if (!source.includes("<GameEditorialContent")) {
    addError(`${route}: the complete GameEditorialContent template is missing.`);
  }
  if (!source.includes("recentlyPlayed={{ href: GAME_PATH")) {
    addError(`${route}: RecentlyPlayed and VideoGame structured-data inputs are missing.`);
  }

  const testedDate = source.match(/lastTested="(\d{4}-\d{2}-\d{2})"/)?.[1];
  if (!testedDate || Number.isNaN(Date.parse(`${testedDate}T00:00:00Z`))) {
    addError(`${route}: lastTested must be a real YYYY-MM-DD date.`);
  }

  const developerUrl = source.match(/developerUrl:\s*"([^"]+)"/)?.[1];
  const sourceUrl = source.match(/sourceUrl:\s*"([^"]+)"/)?.[1];
  if (!developerUrl?.startsWith("https://")) addError(`${route}: verified developerUrl must use HTTPS.`);
  if (!sourceUrl?.startsWith("https://")) addError(`${route}: verified sourceUrl must use HTTPS.`);

  const relatedSource = source.match(/relatedGames=\{\[([\s\S]*?)\]\}/)?.[1] || "";
  const relatedGames = [...relatedSource.matchAll(/\{\s*href:\s*"([^"]+)",\s*title:\s*"([^"]+)"\s*\}/g)]
    .map((match) => ({ href: match[1], title: match[2] }));
  if (relatedGames.length < 3 || relatedGames.length > 6) {
    addError(`${route}: provide 3 to 6 related games; found ${relatedGames.length}.`);
  }
  for (const related of relatedGames) {
    const relatedCatalogGame = catalogByHref.get(related.href);
    if (!relatedCatalogGame) {
      addError(`${route}: related game ${related.href} is not in the catalog.`);
    } else if (relatedCatalogGame.title !== related.title) {
      addError(
        `${route}: related anchor "${related.title}" must match catalog title "${relatedCatalogGame.title}".`,
      );
    }
  }

  const screenshotSource = source.match(/screenshots=\{\[([\s\S]*?)\]\}/)?.[1] || "";
  if (![...screenshotSource.matchAll(/\bsrc:\s*"([^"]+)"/g)].length) {
    addError(`${route}: at least one real gameplay screenshot is required.`);
  }

  const iframeSrc = source.match(/iframeSrc="([^"]+)"/)?.[1];
  const gameImage = source.match(/const GAME_IMAGE = "([^"]+)"/)?.[1];
  if (hasPlaceholder(iframeSrc)) addError(`${route}: iframeSrc is incomplete.`);
  if (hasPlaceholder(gameImage)) addError(`${route}: GAME_IMAGE is incomplete.`);
}

async function main() {
  const [catalogSource, homeSource, sitemapSource, queueSource] = await Promise.all([
    readFile(CATALOG_PATH, "utf8"),
    readFile(HOME_PATH, "utf8"),
    readFile(SITEMAP_PATH, "utf8"),
    readFile(QUEUE_PATH, "utf8"),
  ]);

  if (!queueSource.includes("<!-- GAME_QUEUE_ROWS -->")) {
    addError("game-queue.md is missing the GAME_QUEUE_ROWS marker used by game:new.");
  }
  if (!sitemapSource.includes("catalogGames") || !sitemapSource.includes("gameCategories")) {
    addError("Sitemap must be generated from gameCategories and catalogGames.");
  }

  const { categories, games } = parseCatalog(catalogSource);
  const queueRows = parseQueue(queueSource);
  const catalogByHref = new Map();

  if (games.length === 0) addError("No catalog games could be parsed.");

  for (const game of games) {
    if (catalogByHref.has(game.href)) addError(`Duplicate catalog route: ${game.href}.`);
    catalogByHref.set(game.href, game);

    for (const field of ["title", "img", "alt", "description"]) {
      if (hasPlaceholder(game[field])) addError(`${game.href}: catalog ${field} is missing or contains a placeholder.`);
    }
    if (game.categories.length === 0) addError(`${game.href}: at least one category is required.`);
    for (const category of game.categories) {
      if (!categories.has(category)) addError(`${game.href}: unknown category ${category}.`);
    }

    const pagePath = resolve(SITE_ROOT, game.href.slice(1), "page.tsx");
    try {
      await readFile(pagePath, "utf8");
    } catch {
      addError(`${game.href}: catalog route has no page.tsx.`);
    }
  }

  for (const category of categories) {
    const categoryPage = resolve(SITE_ROOT, category, "page.tsx");
    try {
      await readFile(categoryPage, "utf8");
    } catch {
      addError(`/${category}: category has no page.tsx.`);
    }
  }

  const pageFiles = await listPageFiles(SITE_ROOT);
  let scaffoldCount = 0;
  let publishedScaffoldCount = 0;

  for (const pagePath of pageFiles) {
    const source = await readFile(pagePath, "utf8");
    if (!source.includes(SCAFFOLD_MARKER)) continue;

    scaffoldCount += 1;
    const route = routeFromPagePath(pagePath);
    const status = source.match(/const GAME_PAGE_STATUS = "([^"]+)"/)?.[1];
    if (!status || !["draft", "published"].includes(status)) {
      addError(`${route}: GAME_PAGE_STATUS must be draft or published.`);
      continue;
    }

    if (status === "draft") {
      if (catalogByHref.has(route)) {
        addError(`${route}: draft scaffold must not be added to the catalog or Sitemap.`);
      }
      addWarning(`${route}: draft remains 404/noindex and is not publishable yet.`);
      continue;
    }

    publishedScaffoldCount += 1;
    validatePublishedScaffold({ route, source, catalogByHref, homeSource, queueRows });
  }

  for (const warning of warnings) console.warn(`WARN ${warning}`);
  for (const error of errors) console.error(`ERROR ${error}`);

  if (errors.length > 0) {
    console.error(`\nGame publishing check failed with ${errors.length} error(s).`);
    process.exitCode = 1;
    return;
  }

  console.log(
    `Game publishing check passed: ${games.length} catalog games, ${categories.size} categories, ${scaffoldCount} generated scaffold(s), ${publishedScaffoldCount} published scaffold(s).`,
  );
  console.log("Reminder: this static check does not replace a real desktop/mobile play test or rights review.");
}

main().catch((error) => {
  console.error(`game:check failed: ${error.message}`);
  process.exitCode = 1;
});
