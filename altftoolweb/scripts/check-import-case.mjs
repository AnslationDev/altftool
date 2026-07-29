#!/usr/bin/env node
/**
 * Fails the build when a relative import resolves only because the developer's
 * filesystem is case-insensitive.
 *
 * macOS resolves `./Pages/index` against a directory git records as `pages`;
 * Amplify's Linux builders do not. The mismatch is invisible locally and costs
 * a full remote build to discover — job 100 died seven minutes in on
 * `src/tools/event-tool/entry.jsx` importing `./Pages/index`.
 *
 * The oracle is git, not the working tree. A checkout on Linux materialises the
 * paths git recorded, so a working tree that has drifted to `Pages/` (a rename
 * a case-insensitive filesystem never reported) still builds here and still
 * breaks there. Reading `git ls-files` is what makes this guard see what the
 * builder will see.
 *
 * Also reports paths git holds under two different casings: those collapse into
 * one directory on checkout, so whichever file lands second silently wins.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const CODE = /\.(jsx?|mjs|cjs|tsx?)$/;
const SPEC =
  /(?:^|[^.\w])(?:import|export)[\s\S]{0,200}?from\s*["'](\.[^"']+)["']|(?:^|[^.\w])import\s*\(\s*["'](\.[^"']+)["']|require\(\s*["'](\.[^"']+)["']/g;
const EXTS = ["", ".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".json", ".css"];

const lsFiles = (dir) =>
  execFileSync("git", ["ls-files", "-z", dir], {
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  })
    .split("\0")
    .filter(Boolean);

const tracked = lsFiles("src");

// public/ is served by exact path, so a wrongly-cased asset URL fails the same
// way an import does — but silently: next/image returns an error and the page
// still renders, so nothing turns red. Two of these were live in production
// (a preloaded LCP image on /personality, the hero product on /sale) while
// every local page looked correct.
const ASSET = /\.(png|jpe?g|gif|webp|avif|svg|ico|mp[34]|wav|ogg|webm|woff2?|ttf|otf|pdf|json|txt|csv|glb|gltf|wasm)$/i;
const publicExact = new Set();
const publicByLower = new Map();
for (const file of lsFiles("public")) {
  const url = file.replace(/^public/, "");
  publicExact.add(url);
  publicByLower.set(url.toLowerCase(), url);
}

// dir -> Set of entry names, exactly as git records them.
const dirs = new Map();
const add = (dir, name) => {
  if (!dirs.has(dir)) dirs.set(dir, new Set());
  dirs.get(dir).add(name);
};
for (const file of tracked) {
  const parts = file.split("/");
  for (let i = 0; i < parts.length; i += 1) {
    add(parts.slice(0, i).join("/") || ".", parts[i]);
  }
}

/** Walks `spec` segment by segment, returning the first wrongly-cased one. */
function findCaseMismatch(fromFile, spec) {
  let dir = path.posix.dirname(fromFile);
  const segments = spec.split("/").filter((s) => s !== "" && s !== ".");

  for (let i = 0; i < segments.length; i += 1) {
    const seg = segments[i];
    if (seg === "..") {
      dir = path.posix.dirname(dir);
      continue;
    }
    const names = dirs.get(dir);
    if (!names) return null;
    const last = i === segments.length - 1;

    if (!last) {
      if (names.has(seg)) {
        dir = path.posix.join(dir, seg);
        continue;
      }
      const actual = [...names].find(
        (n) => n.toLowerCase() === seg.toLowerCase(),
      );
      // A genuinely missing path is webpack's error to report, not ours.
      return actual ? { spec, segment: seg, actual, dir } : null;
    }

    const candidates = EXTS.map((e) => seg + e);
    if (candidates.some((c) => names.has(c))) return null;
    const actual = [...names].find((n) =>
      candidates.some((c) => n.toLowerCase() === c.toLowerCase()),
    );
    return actual ? { spec, segment: seg, actual, dir } : null;
  }
  return null;
}

const problems = [];
const assetProblems = [];
const ASSET_LITERAL = /["'](\/[A-Za-z0-9._\-/@%()+ ]+)["']/g;

for (const file of tracked) {
  if (!CODE.test(file)) continue;
  let src;
  try {
    src = fs.readFileSync(file, "utf8");
  } catch {
    continue; // tracked but absent from this working tree
  }
  for (const match of src.matchAll(SPEC)) {
    const spec = match[1] || match[2] || match[3];
    if (!spec) continue;
    const hit = findCaseMismatch(file, spec);
    if (hit) problems.push({ file, ...hit });
  }
  for (const match of src.matchAll(ASSET_LITERAL)) {
    const url = match[1];
    if (!ASSET.test(url)) continue;
    // Only a casing difference is a defect here. A URL with no counterpart at
    // all is a route, an API path or an asset built at runtime — not ours to
    // judge, and guessing would bury the real hits in noise.
    if (publicExact.has(url)) continue;
    const actual = publicByLower.get(url.toLowerCase());
    if (actual) assetProblems.push({ file, url, actual });
  }
}

// Paths git holds twice under different casings collapse on a case-insensitive
// checkout, so one of the two files quietly disappears.
const collisions = [];
for (const [dir, names] of dirs) {
  const byLower = new Map();
  for (const name of names) {
    const key = name.toLowerCase();
    if (!byLower.has(key)) byLower.set(key, []);
    byLower.get(key).push(name);
  }
  for (const [, variants] of byLower) {
    if (variants.length > 1) collisions.push({ dir, variants });
  }
}

if (
  problems.length === 0 &&
  collisions.length === 0 &&
  assetProblems.length === 0
) {
  console.log(
    `Import case guard: OK (${tracked.length} source files, ${publicExact.size} public assets).`,
  );
  process.exit(0);
}

for (const c of collisions) {
  console.error(
    `Case collision in ${c.dir}: git tracks ${c.variants.map((v) => `"${v}"`).join(" and ")}.`,
  );
}
for (const p of problems) {
  console.error(`\n${p.file}\n  imports "${p.spec}"`);
  console.error(`  git records "${p.segment}" as "${p.actual}" in ${p.dir}`);
}
for (const a of assetProblems) {
  console.error(`\n${a.file}\n  references "${a.url}"`);
  console.error(`  git records that asset as "${a.actual}"`);
}
console.error(
  `\nImport case guard: ${problems.length} case-only import mismatch(es), ` +
    `${assetProblems.length} public-asset case mismatch(es), ` +
    `${collisions.length} collision(s). These resolve on macOS and fail on Linux.`,
);
process.exit(1);
