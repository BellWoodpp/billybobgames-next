#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SITE_ROOT = resolve(ROOT, "src/app/(site)");
const CATALOG_PATH = resolve(SITE_ROOT, "_data/game-catalog.ts");
const QUEUE_PATH = resolve(ROOT, "game-queue.md");
const HISTORY_PATH = resolve(ROOT, "data/game-publication-history.json");
const VALID_LANGUAGES = new Set(["english-confirmed", "language-neutral-confirmed"]);

function parseArgs(argv) {
  const args = argv.filter((arg) => arg !== "--");
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const key = args[index];
    const value = args[index + 1];
    if (!["--route", "--language"].includes(key) || !value || value.startsWith("--")) {
      throw new Error(`Unknown or incomplete argument: ${key}`);
    }
    options[key.slice(2)] = value;
    index += 1;
  }
  if (options.route && !options.route.startsWith("/")) throw new Error("--route must start with /.");
  if (options.language && !VALID_LANGUAGES.has(options.language)) {
    throw new Error(`--language must be one of: ${[...VALID_LANGUAGES].join(", ")}`);
  }
  if (options.language && !options.route) throw new Error("--language requires --route.");
  return options;
}

function todayInShanghai() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getQuotedField(source, field) {
  return source.match(new RegExp(`\\b${field}:\\s*"([^"]*)"`))?.[1];
}

function parseCatalog(source) {
  const catalogStart = source.indexOf("export const catalogGames");
  const catalogEnd = source.indexOf("export function getCategory");
  const catalogSource = source.slice(catalogStart, catalogEnd);
  const games = [];
  const pattern = /\{\s*href:\s*"([^"]+)",([\s\S]*?)categories:\s*\[([^\]]*)\],\s*\n\s*\},/g;
  for (const match of catalogSource.matchAll(pattern)) {
    const [, route, body, categorySource] = match;
    games.push({
      route,
      title: getQuotedField(body, "title"),
      image: getQuotedField(body, "img"),
      description: getQuotedField(body, "description"),
      categories: [...categorySource.matchAll(/"([^"]+)"/g)].map((category) => category[1]),
    });
  }
  return games;
}

function normalizeTitle(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function sourceUrlsFor(route, pageSource, queueSource) {
  const urls = new Set();
  for (const match of pageSource.matchAll(/\bsourceUrl:\s*"(https:\/\/[^"\s]+)"/g)) urls.add(match[1]);
  const queueLine = queueSource.split("\n").find((line) => line.startsWith("|") && line.includes(`| ${route} |`));
  if (queueLine) {
    for (const match of queueLine.matchAll(/https:\/\/github\.com\/[^\s)]+/g)) {
      urls.add(match[0].replace(/[.,;]+$/, ""));
    }
  }
  return [...urls].sort();
}

function contentHash(game, pageSource) {
  return createHash("sha256")
    .update(JSON.stringify({ game, pageSource }))
    .digest("hex");
}

function assertNoDuplicates(entries) {
  for (const [label, values] of [
    ["route", entries.map((entry) => entry.route)],
    ["normalized title", entries.map((entry) => normalizeTitle(entry.title))],
  ]) {
    const seen = new Set();
    for (const value of values) {
      if (seen.has(value)) throw new Error(`Duplicate publication-history ${label}: ${value}`);
      seen.add(value);
    }
  }

  const sourceOwners = new Map();
  for (const entry of entries) {
    for (const sourceUrl of entry.sourceUrls || []) {
      const owner = sourceOwners.get(sourceUrl);
      if (owner && owner !== entry.route) {
        throw new Error(`Duplicate source URL ${sourceUrl} is assigned to ${owner} and ${entry.route}.`);
      }
      sourceOwners.set(sourceUrl, entry.route);
    }
  }
}

async function readExistingHistory() {
  try {
    return JSON.parse(await readFile(HISTORY_PATH, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const today = todayInShanghai();
  const [catalogSource, queueSource, existingHistory] = await Promise.all([
    readFile(CATALOG_PATH, "utf8"),
    readFile(QUEUE_PATH, "utf8"),
    readExistingHistory(),
  ]);
  const games = parseCatalog(catalogSource);
  const firstRun = !existingHistory;
  const existingByRoute = new Map((existingHistory?.entries || []).map((entry) => [entry.route, entry]));
  const entries = [];

  for (const game of games) {
    const pagePath = resolve(SITE_ROOT, game.route.slice(1), "page.tsx");
    const pageSource = await readFile(pagePath, "utf8");
    const hash = contentHash(game, pageSource);
    const existing = existingByRoute.get(game.route);
    const revisions = existing?.revisions ? [...existing.revisions] : [];
    if (revisions.at(-1)?.contentSha256 !== hash) {
      revisions.push({ recordedAt: today, contentSha256: hash });
    }

    const isLegacy = existing?.legacy ?? firstRun;
    const languageStatus =
      options.route === game.route && options.language
        ? options.language
        : existing?.languageStatus || (isLegacy ? "legacy-unverified" : "unverified");
    entries.push({
      title: game.title,
      route: game.route,
      currentlyPublished: true,
      legacy: isLegacy,
      firstRecordedAt: existing?.firstRecordedAt || today,
      publishedAt: existing?.publishedAt ?? (isLegacy ? null : today),
      publicationDateNote: isLegacy ? "Published before history tracking; original date unknown." : undefined,
      languageStatus,
      sourceUrls: sourceUrlsFor(game.route, pageSource, queueSource),
      catalogSnapshot: {
        description: game.description,
        image: game.image,
        categories: game.categories,
      },
      revisions,
    });
    existingByRoute.delete(game.route);
  }

  for (const oldEntry of existingByRoute.values()) {
    entries.push({ ...oldEntry, currentlyPublished: false });
  }
  assertNoDuplicates(entries);

  const history = {
    schemaVersion: 1,
    updatedAt: today,
    purpose: "Permanent publication ledger used to prevent duplicate game titles, routes, and source repositories.",
    entries,
  };
  await writeFile(HISTORY_PATH, `${JSON.stringify(history, null, 2)}\n`, "utf8");
  console.log(`Recorded ${games.length} currently published game(s) in ${HISTORY_PATH}.`);
  if (entries.some((entry) => entry.currentlyPublished && entry.languageStatus === "unverified")) {
    console.warn("New published entries remain language-unverified. Confirm English or language-neutral play, then rerun with --route and --language.");
  }
}

main().catch((error) => {
  console.error(`game:history failed: ${error.message}`);
  process.exitCode = 1;
});
