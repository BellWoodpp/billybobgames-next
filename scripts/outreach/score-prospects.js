/* eslint-disable @typescript-eslint/no-require-imports */
const { readCsv, writeCsv } = require("./lib/csv");
const {
  PROSPECTS_PATH,
  RAW_RESOURCES_PATH,
  ensureDataDir,
  getProspectHeaders,
  loadDotEnvFiles,
  normalizeUrl,
  scoreProspect,
} = require("./lib/outreach");

function dedupeProspects(records) {
  const unique = new Map();

  for (const record of records) {
    const key = normalizeUrl(record.source_url || record.URL || "") || record.prospect_id;
    const existing = unique.get(key);

    if (!existing || Number(record.score) > Number(existing.score)) {
      unique.set(key, record);
    }
  }

  return Array.from(unique.values()).sort((left, right) => Number(right.score) - Number(left.score));
}

function summarizeByStatus(records) {
  return records.reduce((summary, record) => {
    summary[record.status] = (summary[record.status] || 0) + 1;
    return summary;
  }, {});
}

function main() {
  loadDotEnvFiles();
  ensureDataDir();

  const rawRecords = readCsv(RAW_RESOURCES_PATH);
  if (rawRecords.length === 0) {
    console.error(`No imported resource rows found at ${RAW_RESOURCES_PATH}`);
    process.exit(1);
  }

  const scored = dedupeProspects(rawRecords.map(scoreProspect));
  writeCsv(PROSPECTS_PATH, scored, getProspectHeaders());

  const summary = summarizeByStatus(scored);
  console.log(`Scored ${scored.length} prospects -> ${PROSPECTS_PATH}`);
  for (const [status, count] of Object.entries(summary)) {
    console.log(`- ${status}: ${count}`);
  }
}

main();
