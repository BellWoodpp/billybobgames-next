/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const { S3Client, HeadObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");

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

loadDotEnvFiles();

const BUCKET = "billybobgames";
const ENDPOINT =
  process.env.R2_ENDPOINT ||
  "https://64c6d2544469ef88b6ad4748b76cf416.r2.cloudflarestorage.com";
const DEFAULT_CACHE_CONTROL = "public, max-age=31536000, immutable";

const CONTENT_TYPE_BY_EXT = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".bmp": "image/bmp",
  ".tiff": "image/tiff",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".flac": "audio/flac",
  ".aac": "audio/aac",
  ".opus": "audio/opus",
};

function parseArgs(argv) {
  const opts = {
    projectJson: path.resolve(__dirname, "..", "public", "games", "incredibox-sprunki", "project.json"),
    keyPrefix: "sprunki",
    concurrency: 3,
    cacheControl: process.env.R2_CACHE_CONTROL || DEFAULT_CACHE_CONTROL,
    dryRun: false,
    skipExisting: true,
    maxAttempts: Number(process.env.R2_MAX_ATTEMPTS || 6),
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--help" || arg === "-h") {
      console.log(`
Usage:
  node scripts/upload-r2-sprunki-assets.js [options]

Options:
  --project <path>       Path to project.json (default: public/games/incredibox-sprunki/project.json)
  --key-prefix <prefix>  R2 key prefix (default: sprunki)
  -c, --concurrency <n>  Parallel downloads/uploads (default: 6)
  --cache-control <v>    Cache-Control header (default: ${DEFAULT_CACHE_CONTROL})
  --max-attempts <n>     Max attempts per asset (default: 6)
  --no-skip-existing     Reupload even if object exists
  --dry-run              Print what would be uploaded

Credentials (set in your shell or .env.local; do not commit):
  AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY
  (or) R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY
  Optional: R2_ENDPOINT
      `.trim());
      process.exit(0);
    }

    const readValue = () => {
      const value = argv[i + 1];
      if (!value || value.startsWith("-")) {
        console.error(`Missing value for ${arg}`);
        process.exit(1);
      }
      i += 1;
      return value;
    };

    if (arg === "--project") {
      opts.projectJson = path.resolve(process.cwd(), readValue());
      continue;
    }
    if (arg === "--key-prefix") {
      opts.keyPrefix = readValue();
      continue;
    }
    if (arg === "--concurrency" || arg === "-c") {
      opts.concurrency = Number(readValue());
      continue;
    }
    if (arg === "--cache-control") {
      opts.cacheControl = readValue();
      continue;
    }
    if (arg === "--max-attempts") {
      opts.maxAttempts = Number(readValue());
      continue;
    }
    if (arg === "--dry-run") {
      opts.dryRun = true;
      continue;
    }
    if (arg === "--no-skip-existing") {
      opts.skipExisting = false;
      continue;
    }

    console.error(`Unknown arg: ${arg} (use --help)`);
    process.exit(1);
  }

  if (!Number.isFinite(opts.concurrency) || opts.concurrency <= 0) {
    console.error("--concurrency must be a positive number");
    process.exit(1);
  }
  if (!Number.isFinite(opts.maxAttempts) || opts.maxAttempts <= 0) {
    console.error("--max-attempts must be a positive number");
    process.exit(1);
  }

  return opts;
}

function getCredentials() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY;
  if (!accessKeyId || !secretAccessKey) return null;
  return { accessKeyId, secretAccessKey };
}

function collectMd5exts(projectJsonPath) {
  const raw = fs.readFileSync(projectJsonPath, "utf8");
  const json = JSON.parse(raw);
  const set = new Set();

  const walk = (value) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      for (const item of value) walk(item);
      return;
    }
    if (typeof value.md5ext === "string" && value.md5ext.includes(".")) {
      set.add(value.md5ext);
    }
    for (const key of Object.keys(value)) walk(value[key]);
  };

  walk(json);
  return Array.from(set);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function withRetry(fn, { maxAttempts, baseDelayMs = 300 }) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastError = err;
      const delay = Math.min(5000, baseDelayMs * Math.pow(2, attempt - 1));
      await sleep(delay);
    }
  }
  throw lastError;
}

async function headObject(client, bucket, key) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (err) {
    const statusCode = err?.$metadata?.httpStatusCode;
    if (statusCode === 404) return false;
    if (err?.name === "NotFound") return false;
    if (err?.Code === "NotFound") return false;
    return false;
  }
}

async function fetchScratchAsset(md5ext) {
  const url = `https://assets.scratch.mit.edu/internalapi/asset/${encodeURIComponent(md5ext)}/get/`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Fetch failed ${res.status} for ${md5ext}`);
  }

  const ext = path.extname(md5ext).toLowerCase();
  const contentType = CONTENT_TYPE_BY_EXT[ext] || res.headers.get("content-type") || "application/octet-stream";
  const body = Buffer.from(await res.arrayBuffer());
  return { body, contentType, contentLength: body.length };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const creds = getCredentials();
  if (!creds) {
    console.error(
      "Missing credentials. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY (or R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY).",
    );
    process.exit(1);
  }

  if (!fs.existsSync(opts.projectJson)) {
    console.error(`project.json not found: ${opts.projectJson}`);
    process.exit(1);
  }

  const keys = collectMd5exts(opts.projectJson);
  console.log(`Found ${keys.length} asset(s) in ${path.relative(process.cwd(), opts.projectJson)}`);

  const s3 = new S3Client({
    region: "auto",
    endpoint: ENDPOINT,
    credentials: creds,
  });

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  const queue = keys.slice();

  const worker = async () => {
    while (queue.length) {
      const md5ext = queue.pop();
      const key = `${opts.keyPrefix}/${md5ext}`;

      try {
        if (opts.skipExisting && (await headObject(s3, BUCKET, key))) {
          skipped += 1;
          continue;
        }

        if (opts.dryRun) {
          console.log(`[dry-run] Would upload ${key}`);
          continue;
        }

        await withRetry(
          async () => {
            const { body, contentType, contentLength } = await fetchScratchAsset(md5ext);
            await s3.send(
              new PutObjectCommand({
                Bucket: BUCKET,
                Key: key,
                Body: body,
                CacheControl: opts.cacheControl,
                ContentType: contentType,
                ...(Number.isFinite(contentLength) ? { ContentLength: contentLength } : {}),
              }),
            );
          },
          { maxAttempts: opts.maxAttempts },
        );

        uploaded += 1;
        if (uploaded % 25 === 0) {
          console.log(`Uploaded ${uploaded}…`);
        }
      } catch (err) {
        failed += 1;
        console.error(`Failed ${key}: ${err && err.message ? err.message : String(err)}`);
      }
    }
  };

  await Promise.all(Array.from({ length: opts.concurrency }, () => worker()));

  console.log(`Done. Uploaded: ${uploaded}, skipped: ${skipped}, failed: ${failed}`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
