/* eslint-disable @typescript-eslint/no-require-imports */
const { readCsv, writeCsv } = require("./lib/csv");
const {
  MESSAGES_PATH,
  SUPPRESSIONS_PATH,
  ensureDataDir,
  extractDomain,
  getMessageHeaders,
  loadDotEnvFiles,
  loadSuppressions,
  nowIso,
} = require("./lib/outreach");
const { getAccessToken, sendViaGmail, validateRefreshEnv } = require("./lib/gmail");

function parseArgs(argv) {
  const options = {
    dryRun: false,
    limit: Number(process.env.OUTREACH_DAILY_LIMIT || 20),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg === "--limit") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("Missing value for --limit");
      }
      options.limit = Number(value);
      index += 1;
      continue;
    }

    throw new Error(`Unknown arg: ${arg}`);
  }

  if (!Number.isFinite(options.limit) || options.limit <= 0) {
    throw new Error("--limit must be a positive number");
  }

  return options;
}

function validateEnv() {
  const required = ["OUTREACH_FROM_EMAIL"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }

  validateRefreshEnv();
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function hasSuppression(suppressions, email, domain) {
  return suppressions.some((entry) => {
    const suppressedEmail = String(entry.email || "").trim().toLowerCase();
    const suppressedDomain = String(entry.domain || "").trim().toLowerCase();
    return (
      (suppressedEmail && suppressedEmail === email.toLowerCase()) ||
      (suppressedDomain && suppressedDomain === domain.toLowerCase())
    );
  });
}

function countSentTodayByDomain(messages) {
  const today = new Date().toISOString().slice(0, 10);
  const counts = new Map();

  for (const message of messages) {
    if (message.status !== "sent" || !message.sent_at.startsWith(today)) {
      continue;
    }

    counts.set(message.domain, (counts.get(message.domain) || 0) + 1);
  }

  return counts;
}

async function main() {
  loadDotEnvFiles();
  ensureDataDir();

  const options = parseArgs(process.argv.slice(2));
  const messages = readCsv(MESSAGES_PATH);
  if (messages.length === 0) {
    console.log(`No approved messages ready in ${MESSAGES_PATH}`);
    return;
  }

  const suppressions = loadSuppressions(readCsv);
  if (!options.dryRun) {
    validateEnv();
  }

  const domainDailyLimit = Number(process.env.OUTREACH_DOMAIN_DAILY_LIMIT || 1);
  const delayMs = Number(process.env.OUTREACH_SEND_DELAY_MS || 3000);
  const sentTodayByDomain = countSentTodayByDomain(messages);
  const accessToken = options.dryRun ? "" : await getAccessToken();
  let remaining = options.limit;
  let sentCount = 0;

  for (const message of messages) {
    if (remaining <= 0) {
      break;
    }

    if (message.status !== "approved" || message.sent_at) {
      continue;
    }

    const recipientEmail = String(message.to_email || "").trim();
    const domain = String(message.domain || extractDomain(`https://${recipientEmail.split("@")[1] || ""}`));
    if (!recipientEmail) {
      message.error = "Missing to_email";
      continue;
    }

    if (hasSuppression(suppressions, recipientEmail, domain)) {
      message.status = "skipped";
      message.error = `Suppressed via ${SUPPRESSIONS_PATH}`;
      continue;
    }

    const domainCount = sentTodayByDomain.get(domain) || 0;
    if (domainCount >= domainDailyLimit) {
      message.error = `Daily domain limit reached for ${domain}`;
      continue;
    }

    if (options.dryRun) {
      console.log(`[dry-run] ${recipientEmail} <- ${message.subject}`);
      remaining -= 1;
      continue;
    }

    try {
      const response = await sendViaGmail(accessToken, {
        toEmail: message.to_email,
        subject: message.subject,
        body: message.body,
      });
      message.status = "sent";
      message.sent_at = nowIso();
      message.gmail_message_id = response.id || "";
      message.error = "";
      sentTodayByDomain.set(domain, domainCount + 1);
      sentCount += 1;
      remaining -= 1;

      if (delayMs > 0 && remaining > 0) {
        await sleep(delayMs);
      }
    } catch (error) {
      message.status = "failed";
      message.error = error instanceof Error ? error.message : String(error);
    }
  }

  writeCsv(MESSAGES_PATH, messages, getMessageHeaders());
  console.log(
    options.dryRun
      ? `Dry run complete. Reviewed up to ${options.limit} approved messages.`
      : `Sent ${sentCount} messages. Updated ${MESSAGES_PATH}`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
