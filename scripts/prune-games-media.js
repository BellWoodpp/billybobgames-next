/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const GAMES_DIR = path.join(PROJECT_ROOT, "public", "games");

const MEDIA_EXTENSIONS = new Set([
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
  ".mp3",
  ".ogg",
  ".wav",
  ".m4a",
  ".flac",
  ".aac",
  ".opus",
  ".mp4",
  ".webm",
]);

function parseArgs(argv) {
  const opts = { dryRun: true, yes: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") {
      opts.dryRun = true;
      continue;
    }
    if (arg === "--yes") {
      opts.yes = true;
      opts.dryRun = false;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      console.log(`
Usage:
  node scripts/prune-games-media.js --dry-run
  node scripts/prune-games-media.js --yes

Deletes common media file types under public/games/ (images/audio/video).
Intended workflow: upload media to R2, then prune from git to keep the repo small.
`.trim());
      process.exit(0);
    }
    console.error(`Unknown arg: ${arg} (use --help)`);
    process.exit(1);
  }
  return opts;
}

function walk(dir, acc) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
}

function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(GAMES_DIR)) {
    console.log("No public/games directory found.");
    return;
  }

  const files = [];
  walk(GAMES_DIR, files);

  const mediaFiles = files.filter((file) =>
    MEDIA_EXTENSIONS.has(path.extname(file).toLowerCase()),
  );

  console.log(`${opts.dryRun ? "Would delete" : "Deleting"} ${mediaFiles.length} file(s) under public/games/`);
  for (const file of mediaFiles.slice(0, 50)) {
    console.log(`- ${path.relative(PROJECT_ROOT, file).split(path.sep).join("/")}`);
  }
  if (mediaFiles.length > 50) {
    console.log(`...and ${mediaFiles.length - 50} more`);
  }

  if (opts.dryRun) return;
  if (!opts.yes) {
    console.error("Refusing to delete without --yes");
    process.exit(1);
  }

  for (const file of mediaFiles) {
    fs.unlinkSync(file);
  }
}

main();

