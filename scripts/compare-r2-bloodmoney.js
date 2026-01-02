/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");

function loadDotEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const withoutExport = line.startsWith("export ") ? line.slice("export ".length).trim() : line;
    const eq = withoutExport.indexOf("=");
    if (eq === -1) continue;

    const key = withoutExport.slice(0, eq).trim();
    if (!key) continue;
    if (Object.prototype.hasOwnProperty.call(process.env, key)) continue;

    let value = withoutExport.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      const quote = value[0];
      value = value.slice(1, -1);
      if (quote === '"') {
        value = value
          .replace(/\\n/g, "\n")
          .replace(/\\r/g, "\r")
          .replace(/\\t/g, "\t")
          .replace(/\\\\"/g, '"')
          .replace(/\\\\/g, "\\");
      }
    }

    process.env[key] = value;
  }
}

function loadDotEnvFiles() {
  const projectRoot = path.resolve(__dirname, "..");
  loadDotEnvFile(path.join(projectRoot, ".env.local"));
  loadDotEnvFile(path.join(projectRoot, ".env"));
}

function toPosix(p) {
  return p.split(path.sep).join("/");
}

function walkFiles(rootDir) {
  const out = [];
  const stack = [rootDir];
  while (stack.length) {
    const dir = stack.pop();
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        stack.push(full);
      } else if (ent.isFile()) {
        out.push(full);
      }
    }
  }
  return out;
}

function defaultExcludes(relPosix) {
  if (relPosix === "package.json") return true;
  if (relPosix.endsWith("/package.json")) return true;
  if (relPosix.startsWith("data - Copy/")) return true;
  if (relPosix === "data - Copy") return true;
  if (relPosix === "js/plugins - Copy.js") return true;
  if (relPosix.startsWith("save/") || relPosix.includes("/save/")) return true;
  return false;
}

async function listR2Keys({ bucket, endpoint, prefix }) {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY;
  if (!accessKeyId || !secretAccessKey) {
    throw new Error("Missing R2 credentials (set AWS_* or R2_* env vars).");
  }

  const client = new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });

  const keys = new Set();
  let ContinuationToken = undefined;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken,
      })
    );
    for (const obj of res.Contents || []) {
      if (obj && obj.Key) keys.add(obj.Key);
    }
    if (!res.IsTruncated) break;
    ContinuationToken = res.NextContinuationToken;
    if (!ContinuationToken) break;
  }

  return keys;
}

function groupByTopLevel(keys, prefix) {
  const out = new Map();
  for (const key of keys) {
    const rel = key.startsWith(prefix) ? key.slice(prefix.length) : key;
    const top = rel.split("/")[0] || "(root)";
    out.set(top, (out.get(top) || 0) + 1);
  }
  return [...out.entries()].sort((a, b) => b[1] - a[1]);
}

async function main() {
  loadDotEnvFiles();

  const localArg = process.argv[2] || "/home/lcl/下载/BLOODMONEY/Click Me/www";
  const localRoot = path.resolve(localArg);
  if (!fs.existsSync(localRoot)) {
    console.error(`Local path not found: ${localRoot}`);
    process.exit(1);
  }

  const endpoint =
    process.env.R2_ENDPOINT ||
    "https://64c6d2544469ef88b6ad4748b76cf416.r2.cloudflarestorage.com";
  const bucket = "billybobgames";
  const prefix = "games/bloodmoney/";

  const allLocalFiles = walkFiles(localRoot)
    .map((full) => {
      const relPosix = toPosix(path.relative(localRoot, full));
      return { full, relPosix };
    })
    .filter(({ relPosix }) => !defaultExcludes(relPosix));

  console.log(`Local files considered: ${allLocalFiles.length}`);

  const remoteKeys = await listR2Keys({ bucket, endpoint, prefix });
  console.log(`R2 objects under ${prefix}: ${remoteKeys.size}`);

  const remoteLower = new Map();
  for (const k of remoteKeys) {
    const lower = k.toLowerCase();
    if (!remoteLower.has(lower)) remoteLower.set(lower, k);
  }

  const missing = [];
  const caseMismatch = [];
  for (const { relPosix } of allLocalFiles) {
    const key = prefix + relPosix;
    if (remoteKeys.has(key)) continue;
    const alt = remoteLower.get(key.toLowerCase());
    if (alt) {
      caseMismatch.push({ expected: key, actual: alt });
    } else {
      missing.push(key);
    }
  }

  missing.sort((a, b) => a.localeCompare(b));
  caseMismatch.sort((a, b) => a.expected.localeCompare(b.expected));

  const reportDir = path.resolve(__dirname, "..", "reports");
  fs.mkdirSync(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, "bloodmoney-missing-on-r2.txt");
  const casePath = path.join(reportDir, "bloodmoney-case-mismatch-on-r2.txt");

  fs.writeFileSync(reportPath, missing.join("\n") + (missing.length ? "\n" : ""), "utf8");
  fs.writeFileSync(
    casePath,
    caseMismatch.map((m) => `${m.expected}  ->  ${m.actual}`).join("\n") +
      (caseMismatch.length ? "\n" : ""),
    "utf8"
  );

  console.log(`Missing on R2: ${missing.length}`);
  console.log(`Case mismatches: ${caseMismatch.length}`);

  const byTop = groupByTopLevel(missing, prefix);
  if (byTop.length) {
    console.log("Missing breakdown (top-level):");
    for (const [k, n] of byTop) console.log(`- ${k}: ${n}`);
  }

  console.log(`Wrote: ${path.relative(process.cwd(), reportPath)}`);
  console.log(`Wrote: ${path.relative(process.cwd(), casePath)}`);
}

main().catch((err) => {
  console.error(err && err.stack ? err.stack : String(err));
  process.exit(1);
});

