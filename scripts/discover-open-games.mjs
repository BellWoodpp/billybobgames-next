#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG_PATH = resolve(ROOT, "config/game-discovery.json");
const QUEUE_PATH = resolve(ROOT, "game-queue.md");
const REPORT_PATH = resolve(ROOT, "reports/game-discovery.md");
const HISTORY_PATH = resolve(ROOT, "data/game-publication-history.json");
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
    .filter((cells) => cells[0] !== "Game" && cells[1]?.startsWith("/"))
    .map((cells) =>
      cells.length >= 10
        ? {
            game: cells[0], route: cells[1], category: cells[2], popularity: cells[3],
            language: cells[4], searchEvidence: cells[5], source: cells[6], playTest: cells[7],
            status: cells[8], nextAction: cells[9],
          }
        : {
            game: cells[0], route: cells[1], category: cells[2], popularity: "Not measured",
            language: "Not checked", searchEvidence: cells[3], source: cells[4], playTest: cells[5],
            status: cells[6], nextAction: cells[7],
          },
    );
}

function normalizeTitle(value) {
  return cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function repositoryUrlFromText(value) {
  return value.match(/https:\/\/github\.com\/[^\s)]+/)?.[0]?.replace(/[.,;]+$/, "") || null;
}

function queueRowLine(row) {
  return `| ${markdownCell(row.game)} | ${row.route} | ${row.category} | ${markdownCell(row.popularity)} | ${markdownCell(row.language)} | ${markdownCell(row.searchEvidence)} | ${row.source} | ${markdownCell(row.playTest)} | ${row.status} | ${markdownCell(row.nextAction)} |`;
}

function replaceQueueRows(source, rows) {
  const start = source.indexOf(QUEUE_MARKER);
  const end = source.indexOf("\n\n## Required evidence", start);
  if (start === -1 || end === -1) throw new Error("Could not locate the queue table body.");
  return `${source.slice(0, start)}${QUEUE_MARKER}\n${rows.map(queueRowLine).join("\n")}${source.slice(end)}`;
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

function detectLanguage(html, policy) {
  const declared = html.match(/<html[^>]*\blang=["']?([^\s"'>]+)/i)?.[1]?.toLowerCase();
  const declaredBase = declared?.split("-")[0];
  if (declaredBase && !policy.acceptedDeclaredLanguages.includes(declaredBase)) {
    return { accepted: false, label: `Non-English declared (${declared})`, reason: "language-not-english" };
  }

  const visible = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  const latinCount = (visible.match(/[A-Za-z]/g) || []).length;
  const nonLatinCount = (visible.match(/[\u0400-\u04ff\u0600-\u06ff\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/g) || []).length;
  if (nonLatinCount >= 8 && nonLatinCount > latinCount * 0.2) {
    return { accepted: false, label: "Non-English UI text detected", reason: "language-not-english" };
  }
  if (declaredBase === "en") {
    return { accepted: true, label: "English declared in HTML", kind: "english-likely" };
  }

  const englishUiWords = visible.match(/\b(play|start|score|level|game|pause|resume|new game|controls|instructions|restart|high score)\b/gi) || [];
  if (englishUiWords.length >= 2 && latinCount >= 12) {
    return { accepted: true, label: "English UI text detected", kind: "english-likely" };
  }
  if (policy.allowLanguageNeutral && latinCount + nonLatinCount < 30) {
    return { accepted: true, label: "Language-neutral or text-light", kind: "language-neutral-likely" };
  }
  return { accepted: false, label: "Language could not be verified", reason: "language-unverified" };
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

function comparePopularity(left, right) {
  return (
    right.repo.stargazers_count - left.repo.stargazers_count ||
    right.repo.forks_count - left.repo.forks_count ||
    Date.parse(right.repo.pushed_at) - Date.parse(left.repo.pushed_at)
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

  const files = (tree.tree || []).filter((item) => item.type === "blob");
  const paths = files.map((item) => item.path.toLowerCase());
  const entry = findWebEntry(paths);
  if (!entry) return { skipped: "no-web-entry" };

  const risks = riskMatches(repo, paths, config.excludedKeywords);
  if (risks.length || hasForbiddenBinary(paths)) return { skipped: "copyright-or-rom-risk" };

  const entryFile = files.find((item) => item.path.toLowerCase() === entry);
  if (!entryFile?.sha) return { skipped: "language-unverified" };
  let language;
  try {
    const blob = await github(`/repos/${repo.full_name}/git/blobs/${entryFile.sha}`);
    if (blob.encoding !== "base64" || blob.truncated) return { skipped: "language-unverified" };
    const html = Buffer.from(blob.content.replace(/\s/g, ""), "base64").toString("utf8");
    language = detectLanguage(html, config.languagePolicy);
  } catch (error) {
    if (error.status === 403 || error.status === 429) throw error;
    return { skipped: "language-unverified" };
  }
  if (!language.accepted) return { skipped: language.reason };

  const demo = await demoStatus(repo);
  const candidate = { repo, license, entry, demo, language, treeTruncated: Boolean(tree.truncated) };
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
  const rows = candidates.map(({ repo, license, entry, demo, language, treeTruncated }, index) =>
    `| ${index + 1} | [${markdownCell(repo.full_name)}](${repo.html_url}) | ${repo.stargazers_count} | ${repo.forks_count} | ${markdownCell(language.label)} | ${license} | \`${entry}\` | ${demo ? `[opens](${demo.url})` : "Not detected"} | ${treeTruncated ? "Yes" : "No"} |`,
  );

  return `# Open game candidate report

Generated: ${generatedAt}

This report is an automated first pass, not permission to publish. Candidates are ranked by GitHub stars, then forks, then recent repository activity. A repository license may not cover bundled art, music, fonts, trademarks, or third-party dependencies. Every candidate must still pass source review, an asset-by-asset rights check, an English-language check inside the running game, a clean-room build, and a real desktop/mobile play test.

## Search scope

${queries.map((query) => `- \`${query}\``).join("\n")}

## Candidates

| Rank | Repository | Stars | Forks | Language signal | License | Web entry | Live demo | Tree truncated |
| ---: | --- | ---: | ---: | --- | --- | --- | --- | --- |
${rows.length ? rows.join("\n") : "| — | No candidates passed this run | — | — | — | — | — | — | — |"}

## Rejected during automated checks

${Object.entries(skipped).map(([reason, count]) => `- ${reason}: ${count}`).join("\n") || "- None"}

## Safety boundary

- The workflow does not clone repositories, run third-party build scripts, copy assets, create game pages, or deploy the site.
- Only SPDX licenses in \`config/game-discovery.json\` pass the first filter.
- Brand, fan-game, emulator, ROM, and clone keywords are conservatively rejected.
- Non-English or language-unverified web entries are rejected; text-light games still require manual confirmation before publication.
- A human must verify that the named license applies to every redistributed asset and must identify the original developer/source.
`;
}

function updateCandidateQueue(queueSource, candidates, rejectedBySource, history, config, requestedLimit) {
  if (!queueSource.includes(QUEUE_MARKER)) throw new Error(`Missing ${QUEUE_MARKER} in game-queue.md.`);

  let rows = parseQueueRows(queueSource);
  const candidateBySource = new Map(candidates.map((candidate) => [candidate.repo.html_url, candidate]));
  const historicalRoutes = new Set(history.entries.map((entry) => entry.route));
  const historicalTitles = new Set(history.entries.map((entry) => normalizeTitle(entry.title)));
  const historicalSources = new Set(history.entries.flatMap((entry) => entry.sourceUrls || []));
  const removed = [];

  rows = rows.filter((row) => {
    const sourceUrl = repositoryUrlFromText(row.source);
    const rejection = sourceUrl && rejectedBySource.get(sourceUrl);
    if (row.status === "candidate" && rejection && ["language-not-english", "language-unverified"].includes(rejection)) {
      removed.push(`${row.game}: ${rejection}`);
      return false;
    }
    return true;
  });

  rows = rows.map((row) => {
    const candidate = candidateBySource.get(repositoryUrlFromText(row.source));
    if (!candidate) return row;
    return {
      ...row,
      popularity: `GitHub ${candidate.repo.stargazers_count} stars; ${candidate.repo.forks_count} forks`,
      language: `${candidate.language.label}; confirm in play test`,
      nextAction: "Verify English UI, developer, and every asset license, then build and play-test in isolation",
    };
  });

  const candidateBacklog = rows.filter((row) => row.status === "candidate").length;
  const capacity = Math.max(0, config.maxCandidateBacklog - candidateBacklog);
  const limit = Math.min(requestedLimit, capacity);
  const usedRoutes = new Set([...rows.map((row) => row.route), ...historicalRoutes]);
  const knownTitles = new Set([...rows.map((row) => normalizeTitle(row.game)), ...historicalTitles]);
  const knownSources = new Set([...rows.map((row) => repositoryUrlFromText(row.source)).filter(Boolean), ...historicalSources]);
  const additions = [];

  for (const candidate of candidates) {
    if (additions.length >= limit || knownSources.has(candidate.repo.html_url)) continue;
    const route = uniqueRoute(candidate.repo, usedRoutes);
    if (!route) continue;
    const title = titleFromName(candidate.repo.name);
    if (knownTitles.has(normalizeTitle(title))) continue;
    const category = inferCategory(candidate.repo);
    const demoNote = candidate.demo ? `; demo responded ${candidate.demo.status}` : "; no live demo detected";
    additions.push({
      game: title,
      route,
      category,
      popularity: `GitHub ${candidate.repo.stargazers_count} stars; ${candidate.repo.forks_count} forks`,
      language: `${candidate.language.label}; confirm in play test`,
      searchEvidence: "Automated GitHub discovery; no Search Console evidence yet",
      source: `[${markdownCell(candidate.repo.full_name)}](${candidate.repo.html_url}); ${candidate.license} detected; bundled-assets review required`,
      playTest: `Not run${demoNote}`,
      status: "candidate",
      nextAction: "Verify English UI, developer, and every asset license, then build and play-test in isolation",
    });
    knownSources.add(candidate.repo.html_url);
    knownTitles.add(normalizeTitle(title));
  }

  rows.push(...additions);
  const popularity = (row) => Number.parseInt(row.popularity.match(/GitHub (\d+) stars/)?.[1] || "-1", 10);
  rows.sort((left, right) => popularity(right) - popularity(left) || left.game.localeCompare(right.game));
  return { source: replaceQueueRows(queueSource, rows), additions, removed };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const [configSource, queueSource, historySource] = await Promise.all([
    readFile(CONFIG_PATH, "utf8"),
    readFile(QUEUE_PATH, "utf8"),
    readFile(HISTORY_PATH, "utf8"),
  ]);
  const config = JSON.parse(configSource);
  const history = JSON.parse(historySource);
  const repositories = await searchRepositories(config);
  const skipped = {};
  const candidates = [];
  const rejectedBySource = new Map();

  for (const repo of repositories) {
    const result = await inspectRepository(repo, config);
    if (result.candidate) candidates.push(result.candidate);
    else {
      skipped[result.skipped] = (skipped[result.skipped] || 0) + 1;
      rejectedBySource.set(repo.html_url, result.skipped);
    }
  }

  candidates.sort(comparePopularity);
  const reportCandidates = candidates.slice(0, config.reportCandidateLimit);
  const requestedLimit = options.limit ?? config.defaultAddLimit;
  const queueUpdate = updateCandidateQueue(queueSource, reportCandidates, rejectedBySource, history, config, requestedLimit);
  const report = buildReport({ candidates: reportCandidates, skipped, queries: config.queries });

  console.log(`Searched ${repositories.length} unique repositories.`);
  console.log(`${candidates.length} passed automated checks; ${reportCandidates.length} included in the report.`);
  console.log(`${queueUpdate.additions.length} new candidate(s) selected for the queue.`);
  console.log(`${queueUpdate.removed.length} non-English or language-unverified candidate(s) removed from the queue.`);

  if (options.dryRun) {
    for (const candidate of reportCandidates.slice(0, 5)) {
      console.log(`- ${candidate.repo.full_name} (${candidate.repo.stargazers_count} stars, ${candidate.language.label})`);
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
