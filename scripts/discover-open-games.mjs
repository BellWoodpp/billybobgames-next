#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG_PATH = resolve(ROOT, "config/game-discovery.json");
const QUEUE_PATH = resolve(ROOT, "game-queue.md");
const REPORT_PATH = resolve(ROOT, "reports/game-discovery.md");
const QUEUE_MARKER = "<!-- GAME_QUEUE_ROWS -->";
const API_ROOT = "https://api.github.com";

function parseArgs(argv) {
  const args = argv.filter((arg) => arg !== "--");
  const options = { dryRun: false, limit: undefined };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--limit") {
      options.limit = Number.parseInt(args[index + 1], 10);
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (options.limit !== undefined && (!Number.isInteger(options.limit) || options.limit < 0)) {
    throw new Error("--limit must be a non-negative integer.");
  }
  return options;
}

function cleanText(value = "") {
  return String(value).replaceAll("\n", " ").replaceAll("\r", " ").replace(/\s+/g, " ").trim();
}

function markdownCell(value = "") {
  return cleanText(value).replaceAll("|", "\\|");
}

function titleFromName(name) {
  return name
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function parseQueueRows(source) {
  return source
    .split("\n")
    .filter((line) => line.startsWith("|") && !line.includes("| ---"))
    .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()))
    .filter((cells) => cells[0] !== "Game" && cells[1]?.startsWith("/"));
}

function inferCategory(repo) {
  const text = `${repo.name} ${repo.description || ""} ${(repo.topics || []).join(" ")}`.toLowerCase();
  if (/puzzle|sudoku|word|maze|logic/.test(text)) return "puzzle-games";
  if (/card|solitaire|poker|blackjack/.test(text)) return "card-games";
  if (/music|rhythm|piano|audio/.test(text)) return "music-games";
  if (/idle|clicker|incremental/.test(text)) return "idle-games";
  return "arcade-games";
}

function riskMatches(repo, paths, excludedKeywords) {
  const haystack = [
    repo.name,
    repo.full_name,
    repo.description || "",
    ...(repo.topics || []),
    ...paths.slice(0, 2000),
  ].join(" ").toLowerCase();
  return excludedKeywords.filter((term) => haystack.includes(term.toLowerCase()));
}

function findWebEntry(paths) {
  const preferred = ["index.html", "docs/index.html", "dist/index.html", "build/index.html", "public/index.html"];
  for (const entry of preferred) {
    if (paths.includes(entry)) return entry;
  }
  return paths.find((path) => path.endsWith("/index.html") && path.split("/").length <= 3) || null;
}

function hasForbiddenBinary(paths) {
  return paths.some((path) => /\.(nes|sfc|smc|gba|gbc|nds|n64|z64|iso|wad)$/i.test(path));
}

async function github(path) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "billybobgames-open-game-discovery",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_ROOT}${path}`, { headers });
  if (!response.ok) {
    const remaining = response.headers.get("x-ratelimit-remaining");
    const error = new Error(`GitHub API ${response.status} for ${path}${remaining ? ` (rate remaining: ${remaining})` : ""}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

async function demoStatus(repo) {
  const candidates = [];
  if (/^https?:\/\//i.test(repo.homepage || "")) candidates.push(repo.homepage);
  if (repo.has_pages) candidates.push(`https://${repo.owner.login}.github.io/${repo.name}/`);

  for (const url of [...new Set(candidates)]) {
    try {
      const response = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        signal: AbortSignal.timeout(8000),
        headers: { "User-Agent": "billybobgames-open-game-discovery" },
      });
      if (response.ok) return { url: response.url || url, status: response.status };
    } catch {
      // A demo is useful evidence, but its absence does not invalidate a repository with a web entry.
    }
  }
  return null;
}

function candidateScore(candidate) {
  const ageDays = (Date.now() - Date.parse(candidate.repo.pushed_at)) / 86_400_000;
  return (
    40 +
    (candidate.entry === "index.html" ? 20 : 14) +
    (candidate.demo ? 15 : 0) +
    (ageDays < 730 ? 10 : ageDays < 1460 ? 5 : 0) +
    Math.min(15, Math.log10(Math.max(1, candidate.repo.stargazers_count)) * 5)
  );
}

async function inspectRepository(repo, config) {
  const license = repo.license?.spdx_id;
  if (!config.allowedLicenses.includes(license)) {
    return { skipped: "license-not-allowed" };
  }

  let tree;
  try {
    tree = await github(`/repos/${repo.full_name}/git/trees/${encodeURIComponent(repo.default_branch)}?recursive=1`);
  } catch (error) {
    if (error.status === 403 || error.status === 429) throw error;
    return { skipped: "tree-unavailable" };
  }

  const paths = (tree.tree || []).filter((item) => item.type === "blob").map((item) => item.path.toLowerCase());
  const entry = findWebEntry(paths);
  if (!entry) return { skipped: "no-web-entry" };

  const risks = riskMatches(repo, paths, config.excludedKeywords);
  if (risks.length || hasForbiddenBinary(paths)) return { skipped: "copyright-or-rom-risk" };

  const demo = await demoStatus(repo);
  const candidate = { repo, license, entry, demo, treeTruncated: Boolean(tree.truncated) };
  candidate.score = candidateScore(candidate);
  return { candidate };
}

async function searchRepositories(config) {
  const repositories = new Map();
  for (const query of config.queries) {
    const result = await github(`/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=20`);
    for (const repo of result.items || []) repositories.set(repo.full_name, repo);
  }
  return [...repositories.values()];
}

function uniqueRoute(repo, usedRoutes) {
  let slug = slugify(repo.name);
  if (!slug || usedRoutes.has(`/${slug}`)) slug = slugify(`${repo.owner.login}-${repo.name}`);
  if (!slug || usedRoutes.has(`/${slug}`)) return null;
  usedRoutes.add(`/${slug}`);
  return `/${slug}`;
}

function buildReport({ candidates, skipped, queries }) {
  const generatedAt = new Date().toISOString();
  const rows = candidates.map(({ repo, license, entry, demo, score, treeTruncated }) =>
    `| [${markdownCell(repo.full_name)}](${repo.html_url}) | ${license} | ${repo.stargazers_count} | \`${entry}\` | ${demo ? `[opens](${demo.url})` : "Not detected"} | ${score.toFixed(1)} | ${treeTruncated ? "Yes" : "No"} |`,
  );

  return `# Open game candidate report

Generated: ${generatedAt}

This report is an automated first pass, not permission to publish. A repository license may not cover bundled art, music, fonts, trademarks, or third-party dependencies. Every candidate must still pass source review, an asset-by-asset rights check, a clean-room build, and a real desktop/mobile play test.

## Search scope

${queries.map((query) => `- \`${query}\``).join("\n")}

## Candidates

| Repository | Detected license | Stars | Web entry | Live demo | Score | Tree truncated |
| --- | --- | ---: | --- | --- | ---: | --- |
${rows.length ? rows.join("\n") : "| No candidates passed this run | — | — | — | — | — | — |"}

## Rejected during automated checks

${Object.entries(skipped).map(([reason, count]) => `- ${reason}: ${count}`).join("\n") || "- None"}

## Safety boundary

- The workflow does not clone repositories, run third-party build scripts, copy assets, create game pages, or deploy the site.
- Only SPDX licenses in \`config/game-discovery.json\` pass the first filter.
- Brand, fan-game, emulator, ROM, and clone keywords are conservatively rejected.
- A human must verify that the named license applies to every redistributed asset and must identify the original developer/source.
`;
}

function addCandidatesToQueue(queueSource, candidates, config, requestedLimit) {
  if (!queueSource.includes(QUEUE_MARKER)) throw new Error(`Missing ${QUEUE_MARKER} in game-queue.md.`);

  const rows = parseQueueRows(queueSource);
  const candidateBacklog = rows.filter((cells) => cells[6] === "candidate").length;
  const capacity = Math.max(0, config.maxCandidateBacklog - candidateBacklog);
  const limit = Math.min(requestedLimit, capacity);
  const usedRoutes = new Set(rows.map((cells) => cells[1]));
  const knownSources = new Set(rows.flatMap((cells) => [...cells.join(" ").matchAll(/https:\/\/github\.com\/[^\s)]+/g)].map((match) => match[0].replace(/[.,;]+$/, ""))));
  const additions = [];

  for (const candidate of candidates) {
    if (additions.length >= limit || knownSources.has(candidate.repo.html_url)) continue;
    const route = uniqueRoute(candidate.repo, usedRoutes);
    if (!route) continue;
    const title = titleFromName(candidate.repo.name);
    const category = inferCategory(candidate.repo);
    const demoNote = candidate.demo ? `; demo responded ${candidate.demo.status}` : "; no live demo detected";
    additions.push(
      `| ${markdownCell(title)} | ${route} | ${category} | Automated GitHub discovery; no Search Console evidence yet | [${markdownCell(candidate.repo.full_name)}](${candidate.repo.html_url}); ${candidate.license} detected; bundled-assets review required | Not run${demoNote} | candidate | Verify developer and every asset license, then build and play-test in isolation |`,
    );
    knownSources.add(candidate.repo.html_url);
  }

  if (!additions.length) return { source: queueSource, additions: [] };
  const insertion = `${QUEUE_MARKER}\n${additions.join("\n")}`;
  return { source: queueSource.replace(QUEUE_MARKER, insertion), additions };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const [configSource, queueSource] = await Promise.all([
    readFile(CONFIG_PATH, "utf8"),
    readFile(QUEUE_PATH, "utf8"),
  ]);
  const config = JSON.parse(configSource);
  const repositories = await searchRepositories(config);
  const skipped = {};
  const candidates = [];

  for (const repo of repositories) {
    const result = await inspectRepository(repo, config);
    if (result.candidate) candidates.push(result.candidate);
    else skipped[result.skipped] = (skipped[result.skipped] || 0) + 1;
  }

  candidates.sort((left, right) => right.score - left.score || right.repo.stargazers_count - left.repo.stargazers_count);
  const reportCandidates = candidates.slice(0, config.reportCandidateLimit);
  const requestedLimit = options.limit ?? config.defaultAddLimit;
  const queueUpdate = addCandidatesToQueue(queueSource, reportCandidates, config, requestedLimit);
  const report = buildReport({ candidates: reportCandidates, skipped, queries: config.queries });

  console.log(`Searched ${repositories.length} unique repositories.`);
  console.log(`${candidates.length} passed automated checks; ${reportCandidates.length} included in the report.`);
  console.log(`${queueUpdate.additions.length} new candidate(s) selected for the queue.`);

  if (options.dryRun) {
    for (const candidate of reportCandidates.slice(0, 5)) {
      console.log(`- ${candidate.repo.full_name} (${candidate.license}, score ${candidate.score.toFixed(1)})`);
    }
    console.log("Dry run: no files changed.");
    return;
  }

  await Promise.all([
    writeFile(REPORT_PATH, report, "utf8"),
    writeFile(QUEUE_PATH, queueUpdate.source, "utf8"),
  ]);
  console.log("Updated reports/game-discovery.md and game-queue.md.");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
