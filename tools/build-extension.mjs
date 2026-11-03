// Builds a Strator devtools browser extension into ./dist of the current package.
//
//   node ../../tools/build-extension.mjs chrome|firefox
//
// Every script is bundled on its own as a classic (IIFE) script, because content scripts and the
// Manifest V3 service worker cannot load shared ES module chunks. React is bundled into the panel.
import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";

const target = process.argv[2];
if (target !== "chrome" && target !== "firefox") {
  console.error("usage: build-extension.mjs chrome|firefox");
  process.exit(1);
}

const pkgDir = process.cwd();
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(pkgDir, "dist");
const pkg = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));

const ENTRIES = ["hook", "content", "background", "devtools", "panel"];

for (const [index, name] of ENTRIES.entries()) {
  await build({
    configFile: false,
    root: pkgDir,
    logLevel: "warn",
    publicDir: index === 0 ? join(pkgDir, "public") : false,
    define: { "process.env.NODE_ENV": JSON.stringify("production") },
    build: {
      outDir,
      emptyOutDir: index === 0,
      copyPublicDir: index === 0,
      target: target === "chrome" ? "chrome111" : "firefox128",
      minify: true,
      sourcemap: false,
      lib: {
        entry: join(pkgDir, "src", `${name}.ts`),
        formats: ["iife"],
        name: `StratorDevtools_${name}`,
        fileName: () => `${name}.js`,
      },
    },
  });
}

// The manifest's version follows the package version. Browsers only accept dotted numbers there, so a
// pre-release like 100.2.0-beta.1 becomes 100.2.0, and `version_name` keeps the full version.
const manifestPath = join(outDir, "manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
manifest.version = pkg.version.replace(/[-+].*$/, "");
manifest.version_name = pkg.version;
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

// Icons come from the website's brand assets.
mkdirSync(join(outDir, "icons"), { recursive: true });
for (const size of [16, 32, 48, 128]) {
  cpSync(join(repoRoot, "apps/website/public/brand", `logo-${size}.png`), join(outDir, "icons", `logo-${size}.png`));
}

console.log(`Built the ${target} extension v${pkg.version} into ${outDir}`);
