#!/usr/bin/env node
/**
 * Fail when an import shadows a built-in constructor used by the same file.
 * This is valid JavaScript, so eslint does not catch it, but `new Map()` can
 * accidentally construct an imported icon named Map instead of the global.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const CODE = /\.(jsx?|mjs|cjs|tsx?)$/;
const SHADOWABLE = new Set([
  "Map",
  "Set",
  "WeakMap",
  "WeakSet",
  "Image",
  "Audio",
  "Video",
  "Text",
  "Range",
  "Symbol",
  "Proxy",
  "Date",
  "Promise",
  "Array",
  "Object",
  "Number",
  "String",
  "Boolean",
  "RegExp",
  "Error",
  "Blob",
  "File",
  "FileReader",
  "Response",
  "Request",
  "Headers",
  "URL",
  "URLSearchParams",
  "WebSocket",
  "Worker",
  "Notification",
  "Option",
  "Event",
  "Path2D",
  "Intl",
]);

const IMPORT = /import\s+([\s\S]*?)\s+from\s*["'][^"']+["']/g;

function boundNames(clause) {
  // Type-only imports do not create a runtime binding and therefore cannot
  // shadow the constructor used by JavaScript at runtime.
  if (/^\s*type\b/.test(clause)) return [];

  const names = [];
  const braces = clause.match(/\{([\s\S]*)\}/);
  if (braces) {
    for (const part of braces[1].split(",")) {
      const [original, alias] = part.split(/\s+as\s+/).map((value) => value.trim());
      names.push(alias || original);
    }
  }

  const head = clause.replace(/\{[\s\S]*\}/, "").replace(/\*\s+as\s+/, "");
  for (const part of head.split(",")) {
    const name = part.trim();
    if (name && /^[A-Za-z_$][\w$]*$/.test(name)) names.push(name);
  }
  return names.filter(Boolean);
}

const tracked = execFileSync(
  "git",
  ["ls-files", "-z", "src", "packages", "scripts"],
  { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 },
)
  .split("\0")
  .filter((file) => file && CODE.test(file));

const hits = [];
for (const file of tracked) {
  let source;
  try {
    source = fs.readFileSync(file, "utf8");
  } catch {
    continue;
  }
  if (!source.includes("import")) continue;

  const bound = new Set();
  for (const match of source.matchAll(IMPORT)) {
    for (const name of boundNames(match[1])) {
      if (SHADOWABLE.has(name)) bound.add(name);
    }
  }

  for (const name of bound) {
    const construct = new RegExp(`new\\s+${name}\\s*\\(`);
    const line = source.split("\n").findIndex((value) => construct.test(value));
    if (line >= 0) hits.push({ file, name, line: line + 1 });
  }
}

if (hits.length) {
  console.error(
    `\nGlobal shadowing: ${hits.length} ${hits.length > 1 ? "imports shadow" : "import shadows"} a global the file constructs.\n`,
  );
  for (const hit of hits) {
    console.error(`  ${hit.file}:${hit.line}`);
    console.error(
      `    imports "${hit.name}", then calls new ${hit.name}() — alias the import before using the global.\n`,
    );
  }
  process.exit(1);
}

console.log(`Global shadowing guard: OK (${tracked.length} files).`);
