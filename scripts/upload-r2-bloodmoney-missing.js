/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

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

function parseArgs(argv) {
  const opts = {
    report: path.resolve(__dirname, "..", "reports", "bloodmoney-missing-on-r2.txt"),
    localRoot: "/home/lcl/下载/BLOODMONEY/Click Me/www",
    prefix: "games/bloodmoney/",
    bucket: "billybobgames",
    endpoint:
      process.env.R2_ENDPOINT ||
      "https://64c6d2544469ef88b6ad4748b76cf416.r2.cloudflarestorage.com",
    concurrency: 8,
    dryRun: false,
    cacheControlImmutable: "public, max-age=31536000, immutable",
    cacheControlHtml: "public, max-age=60",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const readValue = () => {
      const value = argv[i + 1];
      if (!value || value.startsWith("-")) {
        console.error(`Missing value for ${arg}`);
        process.exit(1);
      }
      i += 1;
      return value;
    };

    if (arg === "--help" || arg === "-h") {
      console.log(`
Usage:
  node scripts/upload-r2-bloodmoney-missing.js [options]

Options:
  --report <path>       Path to reports/bloodmoney-missing-on-r2.txt
  --local-root <path>   Local BLOODMONEY www root (default: ${opts.localRoot})
  --prefix <prefix>     R2 key prefix (default: ${opts.prefix})
  --concurrency <n>     Parallel uploads (default: ${opts.concurrency})
  --dry-run             Print what would upload, no writes

Credentials:
  AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY (or R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY)
  Optional: R2_ENDPOINT
      `.trim());
      process.exit(0);
    }

    if (arg === "--report") {
      opts.report = path.resolve(process.cwd(), readValue());
      continue;
    }
    if (arg === "--local-root") {
      opts.localRoot = path.resolve(process.cwd(), readValue());
      continue;
    }
    if (arg === "--prefix") {
      opts.prefix = readValue();
      continue;
    }
    if (arg === "--concurrency") {
      opts.concurrency = Number(readValue());
      continue;
    }
    if (arg === "--dry-run") {
      opts.dryRun = true;
      continue;
    }

    console.error(`Unknown arg: ${arg} (use --help)`);
    process.exit(1);
  }

  if (!Number.isFinite(opts.concurrency) || opts.concurrency <= 0) {
    console.error("--concurrency must be a positive number");
    process.exit(1);
  }

  return opts;
}

function contentTypeFor(key) {
  const ext = path.extname(key).toLowerCase();
  if (ext === ".json") return "application/json; charset=utf-8";
  if (ext === ".js") return "application/javascript; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".ttf") return "font/ttf";
  if (ext === ".otf") return "font/otf";
  if (ext === ".woff") return "font/woff";
  if (ext === ".woff2") return "font/woff2";
  return "application/octet-stream";
}

function cacheControlFor(key, opts) {
  if (key.endsWith("/index.html") || key.endsWith("index.html")) return opts.cacheControlHtml;
  return opts.cacheControlImmutable;
}

function readMissingKeys(reportPath) {
  if (!fs.existsSync(reportPath)) {
    console.error(`Report not found: ${reportPath}`);
    process.exit(1);
  }
  const raw = fs.readFileSync(reportPath, "utf8");
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

async function runWithConcurrency(items, concurrency, worker) {
  let idx = 0;
  const results = { ok: 0, failed: 0 };
  const runners = Array.from({ length: concurrency }, async () => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const current = idx;
      idx += 1;
      if (current >= items.length) break;
      try {
        // eslint-disable-next-line no-await-in-loop
        await worker(items[current], current);
        results.ok += 1;
      } catch (err) {
        results.failed += 1;
        const msg = err && err.stack ? err.stack : String(err);
        console.error(msg);
      }
    }
  });

  await Promise.all(runners);
  return results;
}

async function main() {
  loadDotEnvFiles();
  const opts = parseArgs(process.argv.slice(2));

  const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY;
  if (!accessKeyId || !secretAccessKey) {
    throw new Error("Missing R2 credentials (set AWS_* or R2_* env vars).");
  }

  const keys = readMissingKeys(opts.report);
  if (!keys.length) {
    console.log("No missing keys in report; nothing to upload.");
    return;
  }

  const client = new S3Client({
    region: "auto",
    endpoint: opts.endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });

  const uploadJobs = [];
  const prefixNormalized = String(opts.prefix || "").replace(/^\/+/, "");
  for (const key of keys) {
    if (!key.startsWith(prefixNormalized)) {
      console.warn(`Skipping key outside prefix: ${key}`);
      continue;
    }
    const rel = key.slice(prefixNormalized.length);
    const relNoLeading = rel.replace(/^\/+/, "");
    const localPath = path.join(opts.localRoot, relNoLeading);
    uploadJobs.push({ key, localPath });
  }

  const missingLocal = uploadJobs.filter((j) => !fs.existsSync(j.localPath));
  if (missingLocal.length) {
    console.error("Some keys are missing locally (will not upload):");
    for (const j of missingLocal.slice(0, 50)) console.error(`- ${j.key} <- ${j.localPath}`);
    if (missingLocal.length > 50) console.error(`...and ${missingLocal.length - 50} more`);
  }

  const jobsToUpload = uploadJobs.filter((j) => fs.existsSync(j.localPath));
  console.log(`Missing keys in report: ${keys.length}`);
  console.log(`Will upload: ${jobsToUpload.length}`);
  if (opts.dryRun) {
    for (const j of jobsToUpload) console.log(`DRY: ${j.localPath} -> ${j.key}`);
    return;
  }

  let lastPrinted = Date.now();
  const res = await runWithConcurrency(jobsToUpload, opts.concurrency, async (job, i) => {
    const stat = await fs.promises.stat(job.localPath);
    const ContentType = contentTypeFor(job.key);
    const CacheControl = cacheControlFor(job.key, opts);

    await client.send(
      new PutObjectCommand({
        Bucket: opts.bucket,
        Key: job.key,
        Body: fs.createReadStream(job.localPath),
        ContentType,
        CacheControl,
        ContentLength: stat.size,
      })
    );

    const now = Date.now();
    if (now - lastPrinted > 1000) {
      lastPrinted = now;
      console.log(`Uploaded ${i + 1}/${jobsToUpload.length}...`);
    }
  });

  console.log(`Done. Uploaded OK=${res.ok}, failed=${res.failed}`);
  if (missingLocal.length) {
    console.log(`Skipped (missing locally): ${missingLocal.length}`);
  }
}

main().catch((err) => {
  console.error(err && err.stack ? err.stack : String(err));
  process.exit(1);
});

