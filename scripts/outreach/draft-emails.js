/* eslint-disable @typescript-eslint/no-require-imports */
const { readCsv, writeCsv } = require("./lib/csv");
const {
  MESSAGES_PATH,
  PROSPECTS_PATH,
  createDraftFromProspect,
  createMessageId,
  ensureDataDir,
  getMessageHeaders,
  loadDotEnvFiles,
  nowIso,
} = require("./lib/outreach");

function main() {
  loadDotEnvFiles();
  ensureDataDir();

  const prospects = readCsv(PROSPECTS_PATH);
  if (prospects.length === 0) {
    console.error(`No prospects found at ${PROSPECTS_PATH}`);
    process.exit(1);
  }

  const existingMessages = readCsv(MESSAGES_PATH);
  const existingById = new Map(existingMessages.map((message) => [message.message_id, message]));
  const nextMessages = [];
  let draftedCount = 0;
  let missingContactCount = 0;

  for (const prospect of prospects) {
    if (prospect.status !== "approved") {
      continue;
    }

    if (!(prospect.contact_email || "").trim()) {
      missingContactCount += 1;
      continue;
    }

    const draft = createDraftFromProspect(prospect);
    const messageId = createMessageId(prospect);
    const existing = existingById.get(messageId);
    const timestamp = nowIso();

    nextMessages.push({
      message_id: messageId,
      prospect_id: prospect.prospect_id,
      template_name: draft.template_name,
      to_email: prospect.contact_email,
      to_name: prospect.contact_name,
      domain: prospect.domain,
      recommended_url: prospect.recommended_url,
      source_url: prospect.source_url,
      subject: draft.subject,
      body: draft.body,
      status: existing?.status || "needs_review",
      created_at: existing?.created_at || timestamp,
      updated_at: timestamp,
      sent_at: existing?.sent_at || "",
      gmail_message_id: existing?.gmail_message_id || "",
      error: existing?.error || "",
    });
    draftedCount += 1;
  }

  writeCsv(MESSAGES_PATH, nextMessages, getMessageHeaders());
  console.log(`Drafted ${draftedCount} messages -> ${MESSAGES_PATH}`);

  if (missingContactCount > 0) {
    console.log(`Skipped ${missingContactCount} approved prospects without contact_email`);
  }
}

main();
