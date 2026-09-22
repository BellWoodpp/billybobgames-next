/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..", "..", "..");
const DATA_DIR = path.join(PROJECT_ROOT, "data", "outreach");
const RAW_RESOURCES_PATH = path.join(DATA_DIR, "raw-resources.csv");
const PROSPECTS_PATH = path.join(DATA_DIR, "prospects.csv");
const MESSAGES_PATH = path.join(DATA_DIR, "messages.csv");
const LINK_CHECKS_PATH = path.join(DATA_DIR, "link-checks.csv");
const SUPPRESSIONS_PATH = path.join(DATA_DIR, "suppressions.csv");
const TEMPLATES_DIR = path.join(PROJECT_ROOT, "scripts", "outreach", "templates");
const DEFAULT_SITE_ORIGIN = "https://billybobgames.org";

function loadDotEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const withoutExport = line.startsWith("export ") ? line.slice("export ".length).trim() : line;
    const equalsIndex = withoutExport.indexOf("=");
    if (equalsIndex === -1) {
      continue;
    }

    const key = withoutExport.slice(0, equalsIndex).trim();
    if (!key || Object.prototype.hasOwnProperty.call(process.env, key)) {
      continue;
    }

    let value = withoutExport.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      const quote = value[0];
      value = value.slice(1, -1);

      if (quote === "\"") {
        value = value
          .replace(/\\n/g, "\n")
          .replace(/\\r/g, "\r")
          .replace(/\\t/g, "\t")
          .replace(/\\\\/g, "\\")
          .replace(/\\"/g, "\"");
      }
    }

    process.env[key] = value;
  }
}

function loadDotEnvFiles() {
  loadDotEnvFile(path.join(PROJECT_ROOT, ".env.local"));
  loadDotEnvFile(path.join(PROJECT_ROOT, ".env"));
}

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getSiteOrigin() {
  return (process.env.OUTREACH_SITE_ORIGIN || DEFAULT_SITE_ORIGIN).replace(/\/+$/, "");
}

function toYesNo(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "yes") {
    return "Yes";
  }
  if (normalized === "no") {
    return "No";
  }
  return "";
}

function normalizeUrl(rawUrl) {
  if (!rawUrl) {
    return "";
  }

  try {
    const url = new URL(String(rawUrl).trim());
    url.hash = "";
    url.host = url.host.toLowerCase();
    url.pathname = url.pathname.replace(/\/{2,}/g, "/");
    if (url.pathname.length > 1) {
      url.pathname = url.pathname.replace(/\/+$/, "");
    }

    const params = new URLSearchParams(Array.from(url.searchParams.entries()).sort());
    url.search = params.toString() ? `?${params.toString()}` : "";

    return url.toString();
  } catch {
    return String(rawUrl || "").trim();
  }
}

function extractDomain(rawUrl) {
  try {
    return new URL(rawUrl).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function hashToken(value, length = 10) {
  return crypto.createHash("sha1").update(String(value)).digest("hex").slice(0, length);
}

function buildProspectId(record) {
  const domain = extractDomain(record.URL || record.source_url || "") || "unknown";
  const seed = `${domain}|${record.URL || record.source_url || ""}|${record["Discovered From"] || ""}`;
  return `${slugify(domain)}-${hashToken(seed)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function clamp(number, min, max) {
  return Math.min(max, Math.max(min, number));
}

function inferRecommendedUrl(record) {
  const haystack = `${record["Discovered From"] || ""} ${record.URL || ""}`.toLowerCase();
  const siteOrigin = getSiteOrigin();

  if (haystack.includes("bloodmoney")) {
    return `${siteOrigin}/bloodmoney`;
  }
  if (haystack.includes("sprunki")) {
    return `${siteOrigin}/sprunki`;
  }
  if (haystack.includes("spider")) {
    return `${siteOrigin}/Spider-Solitaire`;
  }
  if (haystack.includes("evolve")) {
    return `${siteOrigin}/evolve`;
  }
  if (haystack.includes("flappy")) {
    return `${siteOrigin}/flappy-text`;
  }
  if (haystack.includes("mario")) {
    return `${siteOrigin}/html5-mario`;
  }
  if (haystack.includes("pac")) {
    return `${siteOrigin}/pac-man`;
  }

  return siteOrigin;
}

function inferTemplateName(prospect) {
  if (prospect.opportunity_type === "broken_link") {
    return "broken-link";
  }
  if (prospect.recommended_url && prospect.recommended_url !== getSiteOrigin()) {
    return "game-resource";
  }
  return "homepage-resource";
}

function inferOpportunityType(record) {
  const linkStrategy = String(record["Link Strategy"] || "").trim().toLowerCase();
  const type = String(record.Type || "").trim().toLowerCase();

  if (type === "profile" || type === "blog_comment") {
    return "manual_outreach_candidate";
  }

  if (linkStrategy === "in_content") {
    return "resource_page";
  }

  return "general_outreach";
}

function scoreProspect(rawRecord) {
  const type = String(rawRecord.Type || "").trim().toLowerCase();
  const linkStrategy = String(rawRecord["Link Strategy"] || "").trim().toLowerCase();
  const linkFormat = String(rawRecord["Link Format"] || "").trim().toLowerCase();
  const hasCaptcha = toYesNo(rawRecord["Has Captcha"]);
  const hasUrlField = toYesNo(rawRecord["Has URL Field"]);
  const sourceUrl = normalizeUrl(rawRecord.URL || "");
  const domain = extractDomain(sourceUrl);
  const riskFlags = [];
  let score = 60;
  let status = "needs_manual_review";

  if (type === "profile") {
    score -= 40;
    status = "research_only";
    riskFlags.push("ugc_profile", "do_not_auto_submit");
  }

  if (type === "blog_comment") {
    score -= 35;
    status = "research_only";
    riskFlags.push("ugc_comment", "do_not_auto_submit");
  }

  if (linkStrategy === "url_field") {
    score -= 15;
    riskFlags.push("url_field_only");
  }

  if (linkStrategy === "both") {
    score -= 10;
    riskFlags.push("user_generated_link_pattern");
  }

  if (linkStrategy === "in_content") {
    score += 10;
  }

  if (hasCaptcha === "Yes") {
    score -= 5;
    riskFlags.push("captcha");
  }

  if (hasUrlField === "No") {
    score -= 6;
    riskFlags.push("no_url_field");
  }

  if (!linkFormat || linkFormat === "unknown") {
    score -= 5;
    riskFlags.push("unknown_link_format");
  }

  if (type === "blog_comment" && (linkStrategy === "in_content" || linkStrategy === "both")) {
    status = "needs_manual_review";
  }

  if (sourceUrl.includes("/comments/") || sourceUrl.includes("comment-")) {
    riskFlags.push("comment_page");
  }

  const recommendedUrl = inferRecommendedUrl(rawRecord);
  const opportunityType =
    status === "research_only"
      ? "research_only"
      : type === "profile" || type === "blog_comment"
        ? "manual_outreach_candidate"
        : inferOpportunityType(rawRecord);

  return {
    prospect_id: buildProspectId(rawRecord),
    status,
    score: String(clamp(score, 0, 100)),
    opportunity_type: opportunityType,
    template_name: inferTemplateName({
      opportunity_type: opportunityType,
      recommended_url: recommendedUrl,
    }),
    recommended_url: recommendedUrl,
    domain,
    source_url: sourceUrl,
    type: rawRecord.Type || "",
    discovered_from: rawRecord["Discovered From"] || "",
    has_captcha: hasCaptcha,
    link_strategy: rawRecord["Link Strategy"] || "",
    link_format: rawRecord["Link Format"] || "",
    has_url_field: hasUrlField,
    risk_flags: Array.from(new Set(riskFlags)).join("|"),
    reason_why_fit:
      recommendedUrl === getSiteOrigin()
        ? "it is a curated browser-games destination with no-download play"
        : "it is directly playable in the browser with no install required",
    contact_name: "",
    contact_email: "",
    contact_role: "",
    personalization: "",
    notes:
      status === "research_only"
        ? "Imported for research only. Do not auto-post on profile/comment pages."
        : "Requires human review. Only proceed if you can find a real editor/owner contact.",
    last_contacted_at: "",
    reply_status: "",
  };
}

function getProspectHeaders() {
  return [
    "prospect_id",
    "status",
    "score",
    "opportunity_type",
    "template_name",
    "recommended_url",
    "domain",
    "source_url",
    "type",
    "discovered_from",
    "has_captcha",
    "link_strategy",
    "link_format",
    "has_url_field",
    "risk_flags",
    "reason_why_fit",
    "contact_name",
    "contact_email",
    "contact_role",
    "personalization",
    "notes",
    "last_contacted_at",
    "reply_status",
  ];
}

function getMessageHeaders() {
  return [
    "message_id",
    "prospect_id",
    "template_name",
    "to_email",
    "to_name",
    "domain",
    "recommended_url",
    "source_url",
    "subject",
    "body",
    "status",
    "created_at",
    "updated_at",
    "sent_at",
    "gmail_message_id",
    "error",
  ];
}

function getLinkCheckHeaders() {
  return [
    "prospect_id",
    "source_url",
    "recommended_url",
    "checked_at",
    "http_status",
    "is_live",
    "matched_url",
    "rel",
    "anchor_text",
    "error",
  ];
}

function createMessageId(prospect) {
  const emailToken = slugify(prospect.contact_email || "missing-email");
  return `${prospect.prospect_id}-${emailToken}`.slice(0, 120);
}

function getTemplatePath(templateName) {
  return path.join(TEMPLATES_DIR, `${templateName}.txt`);
}

function loadTemplate(templateName) {
  const resolvedPath = fs.existsSync(getTemplatePath(templateName))
    ? getTemplatePath(templateName)
    : getTemplatePath("game-resource");
  const content = fs.readFileSync(resolvedPath, "utf8");
  const [subjectLine = "Subject: Quick suggestion", ...bodyLines] = content.split(/\r?\n/);

  return {
    subject: subjectLine.replace(/^Subject:\s*/i, "").trim(),
    body: bodyLines.join("\n").replace(/^\n/, ""),
  };
}

function renderTemplate(input, variables) {
  return input.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key) => variables[key] ?? "");
}

function createDraftFromProspect(prospect) {
  const templateName = prospect.template_name || inferTemplateName(prospect);
  const { subject, body } = loadTemplate(templateName);
  const contactName = (prospect.contact_name || "").trim();
  const greeting = contactName ? `Hi ${contactName},` : "Hi there,";
  const personalizationBlock = prospect.personalization
    ? `${prospect.personalization.trim()}\n\n`
    : "";
  const replyTo = process.env.OUTREACH_REPLY_TO_EMAIL || process.env.OUTREACH_FROM_EMAIL || "";

  const variables = {
    greeting,
    domain: prospect.domain || "",
    source_url: prospect.source_url || "",
    recommended_url: prospect.recommended_url || getSiteOrigin(),
    reason_why_fit:
      prospect.reason_why_fit || "it is directly playable in the browser with no install required",
    personalization_block: personalizationBlock,
    sender_name: process.env.OUTREACH_FROM_NAME || "BillyBobGames",
    sender_role: process.env.OUTREACH_SENDER_ROLE || "BillyBobGames",
    sender_site: getSiteOrigin(),
    reply_to_email: replyTo,
  };

  return {
    template_name: templateName,
    subject: renderTemplate(subject, variables).trim(),
    body: renderTemplate(body, variables).trim(),
  };
}

function loadSuppressions(readCsv) {
  if (!fs.existsSync(SUPPRESSIONS_PATH)) {
    return [];
  }

  return readCsv(SUPPRESSIONS_PATH);
}

module.exports = {
  DATA_DIR,
  LINK_CHECKS_PATH,
  MESSAGES_PATH,
  PROJECT_ROOT,
  PROSPECTS_PATH,
  RAW_RESOURCES_PATH,
  SUPPRESSIONS_PATH,
  buildProspectId,
  clamp,
  createDraftFromProspect,
  createMessageId,
  ensureDataDir,
  extractDomain,
  getLinkCheckHeaders,
  getMessageHeaders,
  getProspectHeaders,
  getSiteOrigin,
  hashToken,
  inferRecommendedUrl,
  loadDotEnvFiles,
  loadSuppressions,
  normalizeUrl,
  nowIso,
  scoreProspect,
};
