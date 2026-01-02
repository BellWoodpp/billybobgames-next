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
    out: "index.html",
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
  node scripts/package-scratch-html.js [options]

Options:
  --dir <path>      Scratch assets dir containing project.json (default: public/games/incredibox-sprunki)
  --title <text>    Window/page title (default: Sprunki Incredibox Remix)
  --out <file>      Output HTML filename inside --dir (default: index.html)
  --no-backup       Do not back up existing output file
  --no-autoplay     Do not auto-start project
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
    if (arg === "--out") {
      opts.out = readValue();
      continue;
    }
    if (arg === "--no-backup") {
      opts.backup = false;
      continue;
    }
    if (arg === "--no-autoplay") {
      opts.autoplay = false;
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
  const tmpSb3Path = path.join(os.tmpdir(), `scratch-${Date.now()}-${Math.random().toString(16).slice(2)}.sb3`);

  execFileSync(
    "zip",
    [
      "-qr",
      tmpSb3Path,
      ".",
      "-x",
      "index.html",
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

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  ensureProjectDir(opts.dir);

  const outputPath = path.join(opts.dir, opts.out);
  const backupPath = `${outputPath}.bak`;

  if (opts.backup && fs.existsSync(outputPath) && !fs.existsSync(backupPath)) {
    fs.copyFileSync(outputPath, backupPath);
    console.log(`Backed up ${path.relative(process.cwd(), outputPath)} -> ${path.relative(process.cwd(), backupPath)}`);
  }

  console.log("Creating temporary .sb3 from local assets...");
  const sb3Path = createSb3FromDir(opts.dir);

  try {
    console.log("Loading project into TurboWarp packager...");
    const projectData = fs.readFileSync(sb3Path);
    const loadedProject = await Packager.loadProject(projectData, (type, a, b) => {
      if (type === "assets" && typeof a === "number" && typeof b === "number" && b > 0) {
        const pct = Math.round((a / b) * 100);
        if (pct % 10 === 0) console.log(`Asset load: ${pct}%`);
      }
    });

    const packager = new Packager.Packager();
    packager.project = loadedProject;
    packager.options.target = "html";
    packager.options.autoplay = opts.autoplay;
    packager.options.app.windowTitle = opts.title;
    packager.options.app.packageName = "incredibox-sprunki";
    packager.options.controls.fullscreen.enabled = false;
    packager.options.controls.greenFlag.enabled = !opts.autoplay;
    packager.options.controls.stopAll.enabled = false;

    console.log("Packaging to HTML...");
    const result = await packager.package();

    if (result.type !== "text/html") {
      throw new Error(`Unexpected packager output type: ${result.type} (${result.filename})`);
    }

    fs.writeFileSync(outputPath, result.data);
    console.log(`Wrote ${path.relative(process.cwd(), outputPath)} (${(result.data.length / 1024 / 1024).toFixed(2)} MB)`);
  } finally {
    try {
      fs.unlinkSync(sb3Path);
    } catch {
      // ignore
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

