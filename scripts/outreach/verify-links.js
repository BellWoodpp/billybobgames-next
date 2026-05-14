/* eslint-disable @typescript-eslint/no-require-imports */
const { readCsv, writeCsv } = require("./lib/csv");
const {
  LINK_CHECKS_PATH,
  PROSPECTS_PATH,
  ensureDataDir,
  getLinkCheckHeaders,
  loadDotEnvFiles,
  normalizeUrl,
  nowIso,
} = require("./lib/outreach");

function normalizeHref(href, pageUrl) {
  try {
    return normalizeUrl(new URL(href, pageUrl).toString());
  } catch {
    return "";
  }
}

function findLink(html, sourceUrl, recommendedUrl) {
  const anchorRegex = /<a\b([^>]*?)href=(["'])(.*?)\2([^>]*)>([\s\S]*?)<\/a>/gi;
  const normalizedTarget = normalizeUrl(recommendedUrl);
  let match;

  while ((match = anchorRegex.exec(html)) !== null) {
    const href = normalizeHref(match[3], sourceUrl);
    if (!href) {
      continue;
    }

    if (href === normalizedTarget || href.startsWith(`${normalizedTarget}/`)) {
      const attributes = `${match[1]} ${match[4]}`;
      const relMatch = attributes.match(/\brel=(["'])(.*?)\1/i);
      const anchorText = match[5].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      return {
        matchedUrl: href,
        rel: relMatch ? relMatch[2] : "",
        anchorText,
      };
    }
  }

  return null;
}

async function fetchPage(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "BillyBobGames Outreach Verifier/1.0",
      },
      redirect: "follow",
      signal: controller.signal,
    });

    const body = await response.text();
    return {
      status: response.status,
      body,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  loadDotEnvFiles();
  ensureDataDir();

  const prospects = readCsv(PROSPECTS_PATH).filter((prospect) =>
    ["won", "link_live", "link_verified"].includes(prospect.status),
  );

  if (prospects.length === 0) {
    console.log(`No won/link_live prospects found in ${PROSPECTS_PATH}`);
    writeCsv(LINK_CHECKS_PATH, [], getLinkCheckHeaders());
    return;
  }

  const results = [];

  for (const prospect of prospects) {
    try {
      const page = await fetchPage(prospect.source_url);
      const match = findLink(page.body, prospect.source_url, prospect.recommended_url);

      results.push({
        prospect_id: prospect.prospect_id,
        source_url: prospect.source_url,
        recommended_url: prospect.recommended_url,
        checked_at: nowIso(),
        http_status: String(page.status),
        is_live: match ? "Yes" : "No",
        matched_url: match?.matchedUrl || "",
        rel: match?.rel || "",
        anchor_text: match?.anchorText || "",
        error: "",
      });
    } catch (error) {
      results.push({
        prospect_id: prospect.prospect_id,
        source_url: prospect.source_url,
        recommended_url: prospect.recommended_url,
        checked_at: nowIso(),
        http_status: "",
        is_live: "No",
        matched_url: "",
        rel: "",
        anchor_text: "",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  writeCsv(LINK_CHECKS_PATH, results, getLinkCheckHeaders());
  console.log(`Verified ${results.length} prospects -> ${LINK_CHECKS_PATH}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
