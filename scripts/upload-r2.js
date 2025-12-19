const fs = require("fs");
const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const BUCKET = "billybobgames";
const ENDPOINT =
  process.env.R2_ENDPOINT ||
  "https://64c6d2544469ef88b6ad4748b76cf416.r2.cloudflarestorage.com";
const ASSET_DOMAIN =
  process.env.R2_ASSET_DOMAIN || "https://r2bucket.billybobgames.org";
const PUBLIC_DIR = path.resolve(__dirname, "..", "public");
const MAP_PATH = path.resolve(__dirname, "..", "uploaded-images-map.json");

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

const s3 = new S3Client({
  region: "auto",
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

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

async function collectAssets(dir, acc) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectAssets(fullPath, acc);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (imageExts.has(ext) || audioExts.has(ext)) {
      acc.push(fullPath);
      }
    }
  }
}

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeByExt[ext] || "application/octet-stream";
}

async function uploadFile(filePath) {
  const relative = path.relative(PUBLIC_DIR, filePath);
  const key = toPosix(relative);
  const body = fs.createReadStream(filePath);
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentTypeFor(filePath),
    }),
  );
  return { local: key, remote: `${ASSET_DOMAIN}/${key}` };
}

async function uploadAll(files, concurrency = 8) {
  const results = [];
  let index = 0;

  async function worker() {
    while (true) {
      const current = index++;
      if (current >= files.length) break;
      const file = files[current];
      const relative = toPosix(path.relative(PUBLIC_DIR, file));
      try {
        await uploadFile(file);
        results.push({
          local: relative,
          remote: `${ASSET_DOMAIN}/${relative}`,
        });
        console.log(`Uploaded ${relative}`);
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
  const files = [];
  await collectAssets(PUBLIC_DIR, files);

  if (!files.length) {
    console.log("No images or audio found under public/.");
    return;
  }

  console.log(`Uploading ${files.length} images/audio files to ${BUCKET}...`);
  const results = await uploadAll(files);

  await fs.promises.writeFile(
    MAP_PATH,
    JSON.stringify(results, null, 2),
    "utf8",
  );
  console.log(`Wrote mapping to ${MAP_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
