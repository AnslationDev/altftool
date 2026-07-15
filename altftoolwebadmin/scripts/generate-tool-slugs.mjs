// Regenerates src/config/toolSlugs.generated.js from the web app's canonical,
// auto-generated tool registry (altftoolweb/src/platform/registry/toolRuntimeMap.js).
//
// The Ads module pins ads to specific tool detail pages using this slug list.
// This runs automatically as part of `npm run build` and `npm run dev` (see
// package.json), so the list stays in sync with the live tools on every build —
// no manual step. When a new tool is added, its slug appears here on the next
// build/deploy. You can still run it by hand: node scripts/generate-tool-slugs.mjs
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const runtimeMapPath = path.resolve(
  here,
  "../../altftoolweb/src/platform/registry/toolRuntimeMap.js",
);
const outPath = path.resolve(here, "../src/config/toolSlugs.generated.js");

// Build-safe: if the web registry isn't present (e.g. a partial checkout that
// doesn't include the web app), keep the existing committed list instead of
// failing the build.
if (!existsSync(runtimeMapPath)) {
  console.warn(
    `[generate-tool-slugs] Source not found (${path.relative(process.cwd(), runtimeMapPath)}); keeping existing toolSlugs.generated.js.`,
  );
  process.exit(0);
}

const src = readFileSync(runtimeMapPath, "utf8");
// Keys are the quoted object keys: `"slug": () => import(...)`
const slugs = [...src.matchAll(/^\s*"([a-z0-9][a-z0-9-]*)"\s*:/gim)].map((m) => m[1]);
const unique = [...new Set(slugs)].sort((a, b) => a.localeCompare(b));

if (unique.length === 0) {
  console.warn("[generate-tool-slugs] No slugs parsed from source; keeping existing list.");
  process.exit(0);
}

const body =
  "// ⚠️ AUTO-GENERATED — DO NOT EDIT.\n" +
  "// Source: altftoolweb/src/platform/registry/toolRuntimeMap.js\n" +
  "// Regenerate: node scripts/generate-tool-slugs.mjs\n\n" +
  "export const TOOL_SLUGS = [\n" +
  unique.map((s) => `  "${s}",`).join("\n") +
  "\n];\n";

writeFileSync(outPath, body);
console.log(`[generate-tool-slugs] Wrote ${unique.length} tool slugs to ${path.relative(process.cwd(), outPath)}`);
