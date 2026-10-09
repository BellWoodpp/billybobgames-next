import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const DEFAULT_QUERY = "billybobgames";
const DEFAULT_SNAPSHOT_DIR = path.resolve("data/seo-review/snapshots");
const DEFAULT_REPORT_DIR = path.resolve("reports/seo-review");

function fail(message) {
  console.error(`SEO review failed: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--") continue;
    if (!token.startsWith("--")) fail(`unexpected argument: ${token}`);
    const key = token.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) fail(`missing value for --${key}`);
    result[key] = value;
    index += 1;
  }
  return result;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        value += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(value);
      value = "";
    } else if (character === "\n") {
      row.push(value.replace(/\r$/, ""));
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }

  row.push(value.replace(/\r$/, ""));
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
}

function readCsv(filePath) {
  return parseCsv(fs.readFileSync(filePath, "utf8"));
}

function findExportFile(directory, candidates) {
  const files = fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".csv"));
  for (const candidate of candidates) {
    const match = files.find((entry) => candidate.test(entry.name));
    if (match) return path.join(directory, match.name);
  }
  return null;
}

function headerIndex(headers, aliases) {
  const normalized = headers.map((header) => header.trim().toLowerCase());
  return normalized.findIndex((header) => aliases.includes(header));
}

function numberValue(value) {
  const normalized = String(value ?? "").replace(/,/g, "").replace(/%$/, "").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function tableMetrics(rows, sourceName) {
  if (rows.length < 2) fail(`${sourceName} contains no data rows`);
  const headers = rows[0];
  const clicksIndex = headerIndex(headers, ["点击次数", "clicks"]);
  const impressionsIndex = headerIndex(headers, ["展示", "impressions"]);
  const ctrIndex = headerIndex(headers, ["点击率", "ctr"]);
  const positionIndex = headerIndex(headers, ["排名", "position"]);
  if ([clicksIndex, impressionsIndex, ctrIndex, positionIndex].includes(-1)) {
    fail(`${sourceName} does not look like a Search Console performance export`);
  }
  return rows.slice(1).map((row) => ({
    dimension: String(row[0] ?? "").trim(),
    clicks: numberValue(row[clicksIndex]),
    impressions: numberValue(row[impressionsIndex]),
    ctr: numberValue(row[ctrIndex]),
    position: numberValue(row[positionIndex]),
  })).filter((item) => item.dimension);
}

function readOptionalList(filePath, kind) {
  if (!filePath) return null;
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) fail(`${kind} file not found: ${absolutePath}`);
  const rows = readCsv(absolutePath);
  const values = rows.flatMap((row, rowIndex) => {
    if (!row.length) return [];
    const raw = String(row[0] ?? "").trim();
    if (!raw) return [];
    if (rowIndex === 0 && /(url|page|网页|页面|domain|域名|网站|链接)/i.test(raw)) return [];
    if (kind === "link domains") {
      try {
        return [new URL(raw.includes("://") ? raw : `https://${raw}`).hostname.toLowerCase()];
      } catch {
        return [raw.toLowerCase()];
      }
    }
    return [raw];
  });
  return [...new Set(values)].sort();
}

function detectScope(filterFile, query) {
  if (!filterFile) return "unknown";
  const text = fs.readFileSync(filterFile, "utf8").toLowerCase();
  return /(查询|query)/i.test(text) && text.includes(query) ? "query-filtered" : "site-wide";
}

function buildSnapshot(args) {
  const exportDirectory = path.resolve(args.current || "");
  if (!args.current) fail("--current <Search Console export directory> is required");
  if (!fs.existsSync(exportDirectory) || !fs.statSync(exportDirectory).isDirectory()) {
    fail(`export directory not found: ${exportDirectory}`);
  }

  const queryFile = findExportFile(exportDirectory, [/^查询数\.csv$/i, /^queries\.csv$/i, /quer/i]);
  const countryFile = findExportFile(exportDirectory, [/^国家_地区\.csv$/i, /^countries\.csv$/i, /countr/i]);
  const deviceFile = findExportFile(exportDirectory, [/^设备\.csv$/i, /^devices\.csv$/i, /device/i]);
  const chartFile = findExportFile(exportDirectory, [/^图表\.csv$/i, /^chart\.csv$/i, /chart/i]);
  const filterFile = findExportFile(exportDirectory, [/^过滤器\.csv$/i, /^filters\.csv$/i, /filter/i]);
  if (!queryFile || !countryFile || !deviceFile || !chartFile) {
    fail("export must include Queries, Countries, Devices, and Chart CSV files");
  }

  const query = String(args.query || DEFAULT_QUERY).trim().toLowerCase();
  const queryRows = tableMetrics(readCsv(queryFile), path.basename(queryFile));
  const queryMetric = queryRows.find((item) => item.dimension.toLowerCase() === query);
  if (!queryMetric) fail(`query '${query}' was not found in ${path.basename(queryFile)}`);

  const chartRows = readCsv(chartFile);
  const dateIndex = headerIndex(chartRows[0] || [], ["日期", "date"]);
  if (dateIndex === -1) fail(`${path.basename(chartFile)} has no date column`);
  const dates = chartRows.slice(1).map((row) => row[dateIndex]).filter(Boolean).sort();
  if (!dates.length) fail(`${path.basename(chartFile)} has no dated rows`);

  const indexedPages = readOptionalList(args["indexed-pages"], "indexed pages");
  const linkDomains = readOptionalList(args["link-domains"], "link domains");
  const indexedCount = args["indexed-count"] === undefined ? null : numberValue(args["indexed-count"]);

  return {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    period: { start: dates[0], end: dates.at(-1), days: dates.length },
    query,
    scope: detectScope(filterFile, query),
    queryMetric,
    countries: tableMetrics(readCsv(countryFile), path.basename(countryFile)),
    devices: tableMetrics(readCsv(deviceFile), path.basename(deviceFile)),
    indexedCount,
    indexedPages,
    linkDomains,
  };
}

function loadPrevious(snapshotDirectory, currentEnd) {
  if (!fs.existsSync(snapshotDirectory)) return null;
  const candidates = fs.readdirSync(snapshotDirectory)
    .filter((name) => name.endsWith(".json") && name.slice(0, 10) < currentEnd)
    .sort()
    .reverse();
  if (!candidates.length) return null;
  return JSON.parse(fs.readFileSync(path.join(snapshotDirectory, candidates[0]), "utf8"));
}

function signed(value, digits = 0) {
  if (!Number.isFinite(value)) return "—";
  const formatted = value.toFixed(digits);
  return value > 0 ? `+${formatted}` : formatted;
}

function metricRow(label, current, previous) {
  const rankChange = previous ? current.position - previous.position : null;
  return `| ${label} | ${current.clicks} | ${previous ? signed(current.clicks - previous.clicks) : "—"} | ${current.impressions} | ${previous ? signed(current.impressions - previous.impressions) : "—"} | ${current.ctr.toFixed(2)}% | ${previous ? `${signed(current.ctr - previous.ctr, 2)} pp` : "—"} | ${current.position.toFixed(2)} | ${previous ? signed(rankChange, 2) : "—"} |`;
}

function dimensionRows(currentRows, previousRows, limit = 12) {
  const previousMap = new Map((previousRows || []).map((item) => [item.dimension, item]));
  return [...currentRows]
    .sort((left, right) => right.impressions - left.impressions)
    .slice(0, limit)
    .map((item) => metricRow(item.dimension, item, previousMap.get(item.dimension)))
    .join("\n");
}

function listDifference(current, previous) {
  if (!current || !previous) return null;
  const before = new Set(previous);
  return current.filter((item) => !before.has(item));
}

function optionalSection(title, currentList, previousList, currentCount, previousCount) {
  const additions = listDifference(currentList, previousList);
  const lines = [`## ${title}`, ""];
  if (currentCount !== null && currentCount !== undefined) {
    const delta = previousCount === null || previousCount === undefined ? "—" : signed(currentCount - previousCount);
    lines.push(`- 当前数量：${currentCount}（变化 ${delta}）`);
  }
  if (additions === null) {
    lines.push("- 本周期未提供可比较的导出文件，暂不判断变化。", "- 下次按复盘说明导出后重新运行命令。");
  } else if (!additions.length) {
    lines.push("- 未发现新增项目。");
  } else {
    lines.push(`- 新增 ${additions.length} 项：`, ...additions.slice(0, 50).map((item) => `  - ${item}`));
    if (additions.length > 50) lines.push(`  - 另有 ${additions.length - 50} 项未展开`);
  }
  return lines.join("\n");
}

function buildReport(current, previous) {
  const comparableDimensions = previous && previous.scope === current.scope;
  const previousCountries = comparableDimensions ? previous.countries : null;
  const previousDevices = comparableDimensions ? previous.devices : null;
  const scopeNote = current.scope === "query-filtered"
    ? `国家和设备数据已按查询 \`${current.query}\` 过滤。`
    : `国家和设备数据为全站范围；下次请先在 Search Console 添加查询过滤 \`${current.query}\` 再导出。`;
  const comparisonNote = previous && !comparableDimensions
    ? "上一期和本期的过滤范围不同，因此国家/设备变化不做数值比较。"
    : "排名变化为“本期排名减上期排名”，负数代表改善。";

  return `# Billy Bob Games 28 天 SEO 复盘\n\n` +
    `- 本期：${current.period.start} 至 ${current.period.end}（导出 ${current.period.days} 天）\n` +
    `- 上期：${previous ? `${previous.period.start} 至 ${previous.period.end}` : "无；本次作为基线"}\n` +
    `- 查询：\`${current.query}\`\n` +
    `- 数据范围：${scopeNote}\n` +
    `- 比较说明：${comparisonNote}\n\n` +
    `## 核心查询\n\n` +
    `| 查询 | 点击 | 点击变化 | 展示 | 展示变化 | CTR | CTR 变化 | 平均排名 | 排名变化 |\n` +
    `|---|---:|---:|---:|---:|---:|---:|---:|---:|\n` +
    `${metricRow(current.query, current.queryMetric, previous?.queryMetric)}\n\n` +
    `## 国家\n\n` +
    `| 国家 | 点击 | 点击变化 | 展示 | 展示变化 | CTR | CTR 变化 | 平均排名 | 排名变化 |\n` +
    `|---|---:|---:|---:|---:|---:|---:|---:|---:|\n` +
    `${dimensionRows(current.countries, previousCountries)}\n\n` +
    `## 设备\n\n` +
    `| 设备 | 点击 | 点击变化 | 展示 | 展示变化 | CTR | CTR 变化 | 平均排名 | 排名变化 |\n` +
    `|---|---:|---:|---:|---:|---:|---:|---:|---:|\n` +
    `${dimensionRows(current.devices, previousDevices)}\n\n` +
    `${optionalSection("新增收录页面", current.indexedPages, previous?.indexedPages, current.indexedCount, previous?.indexedCount)}\n\n` +
    `${optionalSection("新增外链域名", current.linkDomains, previous?.linkDomains, null, null)}\n\n` +
    `## 决策规则\n\n` +
    `- 不根据一天或一次手动搜索的名次修改 Title、H1 或正文。\n` +
    `- 至少比较完整的 28 天窗口，并同时看点击、展示、CTR 和平均排名。\n` +
    `- 先排除国家、设备、页面和查询结构变化，再判断是否需要修改。\n` +
    `- 本报告只提供数据，不会自动修改或部署网站。\n`;
}

const args = parseArgs(process.argv.slice(2));
const snapshotDirectory = path.resolve(args["snapshot-dir"] || DEFAULT_SNAPSHOT_DIR);
const reportDirectory = path.resolve(args["report-dir"] || DEFAULT_REPORT_DIR);
const current = buildSnapshot(args);
const previous = loadPrevious(snapshotDirectory, current.period.end);
fs.mkdirSync(snapshotDirectory, { recursive: true });
fs.mkdirSync(reportDirectory, { recursive: true });

const snapshotPath = path.join(snapshotDirectory, `${current.period.end}.json`);
const reportPath = path.join(reportDirectory, `${current.period.end}.md`);
fs.writeFileSync(snapshotPath, `${JSON.stringify(current, null, 2)}\n`);
fs.writeFileSync(reportPath, buildReport(current, previous));

console.log(previous
  ? `Compared ${current.period.end} with ${previous.period.end}.`
  : `Saved ${current.period.end} as the first baseline.`);
console.log(`Snapshot: ${snapshotPath}`);
console.log(`Report:   ${reportPath}`);
