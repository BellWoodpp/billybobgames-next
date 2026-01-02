/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const Packager = require("@turbowarp/packager");

function parseArgs(argv) {
  const opts = {
    dir: path.resolve(__dirname, "..", "public", "games", "incredibox-sprunki"),
    title: "Sprunki Incredibox Remix",
    r2RouteBase: "/r2/sprunki",
    autoplay: true,
    backup: true,
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
  node scripts/package-sprunki-r2-runtime.js [options]

Creates a minimal runtime in public/games/incredibox-sprunki:
  - index.html + script.js (from packager zip output)
  - keeps project.json local
  - rewrites asset URLs to use \`/r2/sprunki/<hash>.<ext>\`

Options:
  --dir <path>          Scratch assets dir containing project.json (default: public/games/incredibox-sprunki)
  --title <text>        Page title (default: Sprunki Incredibox Remix)
  --r2-route <path>     Local proxy route base (default: /r2/sprunki)
  --no-autoplay         Do not auto-start project
  --no-backup           Do not create .bak backups
      `.trim());
      process.exit(0);
    }

    if (arg === "--dir") {
      opts.dir = path.resolve(process.cwd(), readValue());
      continue;
    }
    if (arg === "--title") {
      opts.title = readValue();
      continue;
    }
    if (arg === "--r2-route") {
      opts.r2RouteBase = readValue().replace(/\/+$/, "");
      continue;
    }
    if (arg === "--no-autoplay") {
      opts.autoplay = false;
      continue;
    }
    if (arg === "--no-backup") {
      opts.backup = false;
      continue;
    }

    console.error(`Unknown arg: ${arg} (use --help)`);
    process.exit(1);
  }

  return opts;
}

function ensureProjectDir(dir) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    throw new Error(`Not a directory: ${dir}`);
  }
  const projectJsonPath = path.join(dir, "project.json");
  if (!fs.existsSync(projectJsonPath)) {
    throw new Error(`Missing project.json in ${dir}`);
  }
}

function createSb3FromDir(dir) {
  const tmpSb3Path = path.join(
    os.tmpdir(),
    `sprunki-${Date.now()}-${Math.random().toString(16).slice(2)}.sb3`,
  );

  execFileSync(
    "zip",
    [
      "-qr",
      tmpSb3Path,
      ".",
      "-x",
      "index.html",
      "-x",
      "index.html.bak",
      "-x",
      "index.html.packaged.bak",
      "-x",
      "script.js",
      "-x",
      "styles.css",
      "-x",
      "*.sb3",
      "-x",
      ".DS_Store",
    ],
    { cwd: dir, stdio: "inherit" },
  );

  return tmpSb3Path;
}

function patchIndexHtml(html, { title, r2RouteBase }) {
  let out = html;

  out = out.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);

  // Packager zip output loads project.json from ./assets/project.json
  out = out.replace(/"\.\/assets\/project\.json"/g, "\"./project.json\"");

  // Replace asset resolver to route images + audio via r2RouteBase, keep everything else local.
  const resolverRe = /\(asset\)\s*=>\s*new URL\('\.\/assets\/'\s*\+\s*asset\.assetId\s*\+\s*'\.'\s*\+\s*asset\.dataFormat,\s*location\)\.href/;
  if (!resolverRe.test(out)) {
    throw new Error("Failed to find asset resolver in index.html; packager output format changed.");
  }

  out = out.replace(
    resolverRe,
    `(asset) => {
            const ext = String(asset.dataFormat || "").toLowerCase();
            const filename = \`\${asset.assetId}.\${ext}\`;
            if (
              ext === "png" ||
              ext === "jpg" ||
              ext === "jpeg" ||
              ext === "gif" ||
              ext === "webp" ||
              ext === "svg" ||
              ext === "bmp" ||
              ext === "avif" ||
              ext === "wav" ||
              ext === "mp3" ||
              ext === "ogg" ||
              ext === "m4a" ||
              ext === "flac" ||
              ext === "aac" ||
              ext === "opus"
            ) {
              return new URL(\`${r2RouteBase}/\${filename}\`, location).href;
            }
            return new URL(\`./\${filename}\`, location).href;
          }`,
  );

  return out;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  ensureProjectDir(opts.dir);

  const indexPath = path.join(opts.dir, "index.html");
  const scriptPath = path.join(opts.dir, "script.js");

  if (opts.backup) {
    if (fs.existsSync(indexPath) && !fs.existsSync(`${indexPath}.bak`)) {
      fs.copyFileSync(indexPath, `${indexPath}.bak`);
    }
    if (fs.existsSync(scriptPath) && !fs.existsSync(`${scriptPath}.bak`)) {
      fs.copyFileSync(scriptPath, `${scriptPath}.bak`);
    }
  }

  const tmpSb3Path = createSb3FromDir(opts.dir);
  const tmpZipPath = path.join(os.tmpdir(), `sprunki-runtime-${Date.now()}.zip`);

  try {
    const projectData = fs.readFileSync(tmpSb3Path);
    const loadedProject = await Packager.loadProject(projectData);

    const packager = new Packager.Packager();
    packager.project = loadedProject;
    packager.options.target = "zip";
    packager.options.autoplay = opts.autoplay;

    const result = await packager.package();
    if (result.type !== "application/zip") {
      throw new Error(`Unexpected packager output type: ${result.type}`);
    }

    fs.writeFileSync(tmpZipPath, result.data);

    const zipIndex = execFileSync("unzip", ["-p", tmpZipPath, "index.html"]).toString("utf8");
    const zipScript = execFileSync("unzip", ["-p", tmpZipPath, "script.js"]);

    const patchedIndex = patchIndexHtml(zipIndex, {
      title: opts.title,
      r2RouteBase: opts.r2RouteBase,
    });

    fs.writeFileSync(indexPath, patchedIndex, "utf8");
    fs.writeFileSync(scriptPath, zipScript);

    console.log(`Wrote ${path.relative(process.cwd(), indexPath)}`);
    console.log(`Wrote ${path.relative(process.cwd(), scriptPath)}`);
  } finally {
    try {
      fs.unlinkSync(tmpSb3Path);
    } catch {
      // ignore
    }
    try {
      fs.unlinkSync(tmpZipPath);
    } catch {
      // ignore
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

