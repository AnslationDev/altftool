#!/usr/bin/env node
/**
 * Fails the build when an import binds a name that shadows a global the same
 * file then constructs.
 *
 * `import { Map } from "lucide-react"` is valid JavaScript and eslint reports
 * nothing, but it replaces the global `Map` for the whole module. A later
 * `new Map()` then calls a React component as a constructor and throws
 * `TypeError: X is not a constructor`.
 *
 * This is invisible until it is expensive. The failure surfaces during Next's
 * page-data collection, minified, attributed to whichever route imported the
 * module rather than to the module itself: `src/platform/navigation/siteRoutes.js`
 * imported lucide's `Map`, and the build died on `/_not-found` — a route whose
 * only involvement is that `src/app/not-found.jsx` imports siteRoutes. Two more
 * instances (lucide's `Image` shadowing the `Image` constructor in
 * `logo-similarity-checker` and `twin-finder`) never failed the build at all;
 * they just broke `new Image()` at runtime in the image upload and download
 * paths, where nothing turns red.
 *
 * The fix is always an alias: `import { Map as MapIcon }`.
 *
 * Only flags a file that BOTH binds the name and constructs it, so a module
 * that imports `Map` purely as an icon and never calls `new Map()` stays quiet.

 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const CODE = /\.(jsx?|mjs|cjs|tsx?)$/;

// Globals that are routinely also icon/component names. Constructing any of
// these while a same-named import is in scope is the bug this guard exists for.
const SHADOWABLE = new Set([
  "Map", "Set", "WeakMap", "WeakSet", "Image", "Audio", "Video", "Text", "Range",
  "Symbol", "Proxy", "Date", "Promise", "Array", "Object", "Number", "String",
  "Boolean", "RegExp", "Error", "Blob", "File", "FileReader", "Response",
  "Request", "Headers", "URL", "URLSearchParams", "WebSocket", "Worker",
  "Notification", "Option", "Event", "Path2D", "Intl",
]);

// Named ({ A, B as C }), default (X), and namespace (* as X) bindings.
const IMPORT = /import\s+([\s\S]*?)\s+from\s*["'][^"']+["']/g;

function boundNames(clause) {
  // Type-only imports do not create runtime bindings.
  if (/^\s*type\b/.test(clause)) return [];


  const names = [];
  const braces = clause.match(/\{([\s\S]*)\}/);
  if (braces) {
    for (const part of braces[1].split(",")) {
      const [orig, alias] = part.split(/\s+as\s+/).map((s) => s.trim());
      // An aliased import is the fix, not the bug — only the bound name matters.
      names.push(alias || orig);
    }
  }
  const head = clause.replace(/\{[\s\S]*\}/, "").replace(/\*\s+as\s+/, "");
  for (const part of head.split(",")) {
    const n = part.trim();
    if (n && /^[A-Za-z_$][\w$]*$/.test(n)) names.push(n);

  }
  return names.filter(Boolean);
}

/**
 * Scan comment-stripped source. The guard's own docblock — and any file that
 * DOCUMENTS the bug pattern — contains `import { Map } …` + `new Map()` as
 * prose, and the regexes cannot tell prose from code; on raw source the guard
 * flagged itself and failed every build. Block comments are replaced by the
 * same number of newlines so reported line numbers stay true. Line comments
 * are left alone: stripping `//` naively would truncate `https://…` inside
 * string literals, a worse trade than the unlikely false positive of a real
 * shadowing import sharing a file with a `// new Map()` remark.
 */
function stripBlockComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ""));
}

const tracked = execFileSync("git", ["ls-files", "-z", "src", "packages", "scripts"], {
  encoding: "utf8",
  maxBuffer: 256 * 1024 * 1024,
})
  .split("\0")
  .filter((f) => f && CODE.test(f));

const hits = [];

for (const file of tracked) {
  let src;
  try {
    src = fs.readFileSync(file, "utf8");
  } catch {
    continue; // sparse checkout, or a path git holds but the tree does not
  }
  if (!src.includes("import")) continue;
  const code = stripBlockComments(src);

  const bound = new Set();
  for (const m of code.matchAll(IMPORT)) {
    for (const n of boundNames(m[1])) if (SHADOWABLE.has(n)) bound.add(n);
  }
  if (!bound.size) continue;

  for (const name of bound) {
    const construct = new RegExp(`new\\s+${name}\\s*\\(`);
    const line = code.split("\n").findIndex((l) => construct.test(l));

    if (line >= 0) hits.push({ file, name, line: line + 1 });
  }
}

if (hits.length) {
  console.error(
    `\nGlobal shadowing: ${hits.length} ${hits.length > 1 ? "imports shadow" : "import shadows"} a global the file constructs.\n`,
  );
  for (const h of hits) {
    console.error(`  ${h.file}:${h.line}`);
    console.error(`    imports "${h.name}", then calls new ${h.name}() — that constructs the import, not the global.`);
    console.error(`    Fix: import { ${h.name} as ${h.name}Icon } and update the JSX usage.\n`);
  }
  console.error("This throws at build or at runtime, and eslint does not report it.\n");

  process.exit(1);
}

console.log(`Global shadowing guard: OK (${tracked.length} files).`);
