#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const QUEUE_PATH = resolve(ROOT, "game-queue.md");
const HISTORY_PATH = resolve(ROOT, "data/game-publication-history.json");
const RELEASE_LOG_PATH = resolve(ROOT, "data/game-release-log.json");

function parseArgs(argv) {
  const [command, ...rest] = argv.filter((arg) => arg !== "--");
  const options = { command };
  for (let index = 0; index < rest.length; index += 1) {
    const key = rest[index];
    const value = rest[index + 1];
    if (!key?.startsWith("--") || !value || value.startsWith("--")) throw new Error(`Invalid argument: ${key}`);
    options[key.slice(2)] = value;
    index += 1;
  }
  if (!["select", "mark"].includes(command)) throw new Error("Use weekly-game-release.mjs select or mark --route /game.");
  return options;
}

function queueRows(source) {
  return source
    .split("\n")
    .filter((line) => line.startsWith("|") && !line.includes("| ---"))
    .map((line) => ({ line, cells: line.split("|").slice(1, -1).map((cell) => cell.trim()) }))
    .filter(({ cells }) => cells[0] !== "Game" && cells[1]?.startsWith("/"));
}

function todayInShanghai() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

async function selectReadyGame() {
  const [queueSource, historySource] = await Promise.all([
    readFile(QUEUE_PATH, "utf8"),
    readFile(HISTORY_PATH, "utf8"),
  ]);
  const row = queueRows(queueSource).find(({ cells }) => cells[8] === "ready");
  if (!row) {
    console.log("has_ready=false");
    return;
  }

  const route = row.cells[1];
  const history = JSON.parse(historySource);
  const entry = history.entries.find((item) => item.route === route && item.currentlyPublished);
  if (!entry) throw new Error(`${route} is ready but missing from active publication history.`);
  if (!["english-confirmed", "language-neutral-confirmed"].includes(entry.languageStatus)) {
    throw new Error(`${route} is ready but its language is not confirmed.`);
  }
  const pageSource = await readFile(resolve(ROOT, `src/app/(site)${route}/page.tsx`), "utf8");
  if (!pageSource.includes('const GAME_PAGE_STATUS = "published"')) {
    throw new Error(`${route} is ready but GAME_PAGE_STATUS is not published.`);
  }

  console.log("has_ready=true");
  console.log(`route=${route}`);
  console.log(`title=${row.cells[0]}`);
}

async function markPublished(route) {
  if (!route?.startsWith("/")) throw new Error("mark requires --route /game.");
  const [queueSource, releaseLogSource] = await Promise.all([
    readFile(QUEUE_PATH, "utf8"),
    readFile(RELEASE_LOG_PATH, "utf8"),
  ]);
  const row = queueRows(queueSource).find(({ cells }) => cells[1] === route);
  if (!row) throw new Error(`Queue route not found: ${route}`);
  if (row.cells[8] !== "ready") throw new Error(`${route} must be ready before it can be marked published.`);

  const date = todayInShanghai();
  row.cells[8] = "published";
  row.cells[9] = `Published ${date}; monitor page views, game starts, errors, and Search Console performance`;
  const updatedLine = `| ${row.cells.join(" | ")} |`;
  const updatedQueue = queueSource.replace(row.line, updatedLine);

  const releaseLog = JSON.parse(releaseLogSource);
  if (releaseLog.releases.some((release) => release.route === route)) {
    throw new Error(`${route} is already present in the release log.`);
  }
  releaseLog.updatedAt = date;
  releaseLog.releases.push({
    route,
    title: row.cells[0],
    publishedAt: date,
    popularityAtRelease: row.cells[3],
    languageAtRelease: row.cells[4],
    deploymentRun: process.env.GITHUB_RUN_ID
      ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : "manual",
  });

  await Promise.all([
    writeFile(QUEUE_PATH, updatedQueue, "utf8"),
    writeFile(RELEASE_LOG_PATH, `${JSON.stringify(releaseLog, null, 2)}\n`, "utf8"),
  ]);
  console.log(`Marked ${route} published and recorded the release.`);
}

const options = parseArgs(process.argv.slice(2));
if (options.command === "select") await selectReadyGame();
else await markPublished(options.route);
