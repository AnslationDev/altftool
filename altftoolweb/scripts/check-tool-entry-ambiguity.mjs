#!/usr/bin/env node
/**
 * Fails the build when which file a tool boots from is decided by webpack's
 * extension order rather than by the registry.
 *
 * toolRuntimeMap.js imports tool entries without an extension. Next's webpack
 * resolve order tries .js before .jsx and next.config.mjs sets no override, so a
 * tool carrying BOTH entry.js and entry.jsx silently boots the .js one and its
 * entry.jsx is dead code — with nothing in the repo saying so.
 *
 * Five tools were in that state. Every one of them had entry.js importing a
 * legacy ./App.js or ./pages/main while entry.jsx followed the convention every
 * other tool uses ("use client", ./pages, a scoped wrapper). Which of the two is
 * wanted is a product call, so their registry entries now name entry.js
 * explicitly: the behaviour is unchanged, but it is written down instead of
 * being an accident of resolution order.
 *
 * This check keeps it that way. A tool may ship two entry files; the registry
 * just has to say which one it means.
 */
import fs from "node:fs";
import path from "node:path";

const TOOLS_DIR = "src/tools";
const REGISTRY = "src/platform/registry/toolRuntimeMap.js";

const registry = fs.existsSync(REGISTRY) ? fs.readFileSync(REGISTRY, "utf8") : "";

const offenders = [];
let dualEntry = 0;

for (const entry of fs.readdirSync(TOOLS_DIR, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const dir = path.join(TOOLS_DIR, entry.name);
  const hasJs = fs.existsSync(path.join(dir, "entry.js"));
  const hasJsx = fs.existsSync(path.join(dir, "entry.jsx"));
  if (!hasJs || !hasJsx) continue;
  dualEntry += 1;

  // Ambiguous only when the registry leaves the extension off.
  const bare = new RegExp(`import\\("@/tools/${entry.name}/entry"\\)`);
  if (bare.test(registry)) {
    offenders.push(entry.name);
  }
}

if (offenders.length === 0) {
  console.log(
    `Tool entry guard: OK (${dualEntry} tool(s) carry two entry files, all named explicitly).`,
  );
  process.exit(0);
}

console.error(
  `Tool entry guard: ${offenders.length} tool(s) boot from whichever entry file webpack resolves first.\n`,
);
for (const slug of offenders) {
  console.error(`  ${slug}\n    has entry.js and entry.jsx; registry imports "entry" with no extension\n`);
}
console.error(
  'Name the file in src/platform/registry/toolRuntimeMap.js — import(".../entry.js")\n' +
    'or import(".../entry.jsx") — so the choice is a decision in the repo rather than\n' +
    "a consequence of resolve order. Deleting the entry file you do not want works too.",
);
process.exit(1);
