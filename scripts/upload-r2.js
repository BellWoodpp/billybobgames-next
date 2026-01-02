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
  // Prefer local overrides first.
  loadDotEnvFile(path.join(projectRoot, ".env.local"));
  loadDotEnvFile(path.join(projectRoot, ".env"));
}

loadDotEnvFiles();

const BUCKET = "billybobgames";
const ENDPOINT =
  process.env.R2_ENDPOINT ||
  "https://64c6d2544469ef88b6ad4748b76cf416.r2.cloudflarestorage.com";
const ASSET_DOMAIN =
  process.env.R2_ASSET_DOMAIN || "https://r2bucket.billybobgames.org";
const PUBLIC_DIR = path.resolve(__dirname, "..", "public");
const MAP_PATH = path.resolve(__dirname, "..", "uploaded-images-map.json");
const DEFAULT_CACHE_CONTROL = "public, max-age=31536000, immutable";
const DEFAULT_MAX_ATTEMPTS = 5;

const imageExts = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".bmp",
  ".tiff",
  ".avif",
  ".ico",
]);

const audioExts = new Set([
  ".mp3",
  ".ogg",
  ".wav",
  ".m4a",
  ".flac",
  ".aac",
  ".opus",
]);

const mimeByExt = {
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

const toPosix = (inputPath) => inputPath.split(path.sep).join("/");

function parseArgs(argv) {
  const opts = {
    dir: null,
    kind: "all", // all | image | audio
    concurrency: 8,
    mapPath: MAP_PATH,
    writeMap: true,
    dryRun: false,
    cacheControl: process.env.R2_CACHE_CONTROL || DEFAULT_CACHE_CONTROL,
    maxAttempts: Number(process.env.R2_MAX_ATTEMPTS || DEFAULT_MAX_ATTEMPTS),
    keyPrefix: null,
    strip: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--help" || arg === "-h") {
      console.log(`
Usage:
  node scripts/upload-r2.js [options]

Options:
  --dir <public-subdir>   Upload only from a subdir under public/ (e.g. "sprunki")
  --kind <all|image|audio> Filter what to upload (default: all)
  -c, --concurrency <n>   Parallel uploads (default: 8)
  --cache-control <v>     Cache-Control header (default: ${DEFAULT_CACHE_CONTROL})
  --max-attempts <n>      Max attempts per file (default: ${DEFAULT_MAX_ATTEMPTS})
  --map <path>            Write mapping JSON to path (default: uploaded-images-map.json)
  --no-map                Do not write mapping JSON
  --dry-run               List files without uploading

Credentials (set in your shell, do not commit):
  AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY
  (or) R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY
  Optional: R2_ENDPOINT, R2_ASSET_DOMAIN
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

    if (arg === "--dir") {
      opts.dir = readValue();
      continue;
    }
    if (arg === "--key-prefix") {
      opts.keyPrefix = readValue();
      continue;
    }
    if (arg === "--strip") {
      opts.strip = readValue();
      continue;
    }
    if (arg === "--kind") {
      opts.kind = readValue();
      continue;
    }
    if (arg === "--concurrency" || arg === "-c") {
      opts.concurrency = Number(readValue());
      continue;
    }
    if (arg === "--map") {
      opts.mapPath = path.resolve(process.cwd(), readValue());
      continue;
    }
    if (arg === "--no-map") {
      opts.writeMap = false;
      continue;
    }
    if (arg === "--dry-run") {
      opts.dryRun = true;
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

  if (!["all", "image", "audio"].includes(opts.kind)) {
    console.error("--kind must be one of: all, image, audio");
    process.exit(1);
  }

  return opts;
}

function isAssetByKind(filePath, kind) {
  if (kind === "all") return true;
  const ext = path.extname(filePath).toLowerCase();
  if (kind === "image") return imageExts.has(ext);
  if (kind === "audio") return audioExts.has(ext);
  return false;
}

function normalizeKeyPrefix(prefix) {
  const trimmed = String(prefix || "").trim().replace(/^\/+/, "").replace(/\/+$/, "");
  return trimmed.length ? trimmed : null;
}

function computeKey({ filePath, publicDir, stripRoot, keyPrefix }) {
  const relativePublic = toPosix(path.relative(publicDir, filePath));
  const relativeStrip = stripRoot ? toPosix(path.relative(stripRoot, filePath)) : relativePublic;

  if (stripRoot) {
    const check = path.relative(stripRoot, filePath);
    if (check.startsWith("..") || path.isAbsolute(check)) {
      throw new Error(`File is outside --strip root: ${filePath}`);
    }
  }

  const prefix = normalizeKeyPrefix(keyPrefix);
  if (!prefix) return relativePublic;
  return `${prefix}/${relativeStrip}`.replace(/\/{2,}/g, "/");
}

async function collectAssets(dir, kind, acc) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectAssets(fullPath, kind, acc);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if ((imageExts.has(ext) || audioExts.has(ext)) && isAssetByKind(fullPath, kind)) {
        acc.push(fullPath);
      }
    }
  }
}

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeByExt[ext] || "application/octet-stream";
}

function createS3Client() {
  const accessKeyId =
    process.env.AWS_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID || "";
  const secretAccessKey =
    process.env.AWS_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY || "";

  if (!accessKeyId || !secretAccessKey) {
    console.error(
      "Missing credentials. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY (or R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY).",
    );
    process.exit(1);
  }

  return new S3Client({
    region: "auto",
    endpoint: ENDPOINT,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(err) {
  const status = err?.$metadata?.httpStatusCode;
  if ([429, 500, 502, 503, 504].includes(status)) return true;

  const code = err?.code || err?.errno || err?.name;
  if (typeof code === "string") {
    if (
      [
        "ECONNRESET",
        "EPIPE",
        "ETIMEDOUT",
        "ECONNREFUSED",
        "EHOSTUNREACH",
        "ENETUNREACH",
        "ENOTFOUND",
        "TimeoutError",
        "RequestTimeout",
        "Throttling",
      ].includes(code)
    ) {
      return true;
    }
  }

  const msg = String(err?.message || "");
  if (msg.includes("non-retryable streaming request")) return true;

  return false;
}

function computeBackoffMs(attempt) {
  const base = 350;
  const cap = 12_000;
  const exp = Math.min(cap, base * 2 ** Math.max(0, attempt - 1));
  const jitter = Math.floor(Math.random() * 250);
  return Math.min(cap, exp + jitter);
}

async function uploadFile(s3, filePath, dryRun, key, cacheControl, maxAttempts) {
  const relative = path.relative(PUBLIC_DIR, filePath);
  if (!dryRun) {
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const body = fs.createReadStream(filePath);
      try {
        await s3.send(
          new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: body,
            ContentType: contentTypeFor(filePath),
            CacheControl: cacheControl,
          }),
        );
        break;
      } catch (err) {
        body.destroy();
        const retryable = isRetryableError(err);
        if (!retryable || attempt >= maxAttempts) {
          console.error(`Failed ${toPosix(relative)} (attempt ${attempt}/${maxAttempts}): ${err?.message || err}`);
          throw err;
        }
        const waitMs = computeBackoffMs(attempt);
        console.warn(
          `Retrying ${key} (attempt ${attempt + 1}/${maxAttempts}) after ${waitMs}ms: ${err?.message || err}`,
        );
        await sleep(waitMs);
      }
    }
  }
  return { local: key, remote: `${ASSET_DOMAIN}/${key}` };
}

async function uploadAll(s3, files, opts) {
  const results = [];
  let index = 0;
  const { concurrency, dryRun } = opts;

  async function worker() {
    while (true) {
      const current = index++;
      if (current >= files.length) break;
      const file = files[current];
      const relative = toPosix(path.relative(PUBLIC_DIR, file));
      try {
        const key = computeKey({
          filePath: file,
          publicDir: PUBLIC_DIR,
          stripRoot: opts.stripRoot,
          keyPrefix: opts.keyPrefix,
        });

        await uploadFile(s3, file, dryRun, key, opts.cacheControl, opts.maxAttempts);
        results.push({
          local: relative,
          key,
          remote: `${ASSET_DOMAIN}/${key}`,
        });
        console.log(`${dryRun ? "Would upload" : "Uploaded"} ${key}`);
      } catch (err) {
        console.error(`Failed ${relative}: ${err.message}`);
        throw err;
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  const scanRoot = opts.dir
    ? path.resolve(PUBLIC_DIR, opts.dir)
    : PUBLIC_DIR;

  const scanRelative = path.relative(PUBLIC_DIR, scanRoot);
  if (scanRelative.startsWith("..") || path.isAbsolute(scanRelative)) {
    console.error("--dir must be under public/");
    process.exit(1);
  }

  opts.keyPrefix = normalizeKeyPrefix(opts.keyPrefix);
  opts.stripRoot = opts.strip ? path.resolve(PUBLIC_DIR, opts.strip) : null;
  if (opts.stripRoot) {
    const stripRelative = path.relative(PUBLIC_DIR, opts.stripRoot);
    if (stripRelative.startsWith("..") || path.isAbsolute(stripRelative)) {
      console.error("--strip must be under public/");
      process.exit(1);
    }
  }

  const files = [];
  await collectAssets(scanRoot, opts.kind, files);

  if (!files.length) {
    console.log(`No ${opts.kind === "all" ? "images or audio" : opts.kind} found under ${toPosix(path.relative(PUBLIC_DIR, scanRoot) || ".")}/.`);
    return;
  }

  const s3 = opts.dryRun ? null : createS3Client();

  console.log(`${opts.dryRun ? "Scanning" : "Uploading"} ${files.length} file(s) to ${BUCKET}...`);
  const results = await uploadAll(s3, files, opts);

  if (opts.writeMap) {
    await fs.promises.writeFile(
      opts.mapPath,
      JSON.stringify(results, null, 2),
      "utf8",
    );
    console.log(`Wrote mapping to ${opts.mapPath}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
