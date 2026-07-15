// Regenerates src/config/toolSlugs.generated.js from the web app's canonical,
// auto-generated tool registry (altftoolweb/src/platform/registry/toolRuntimeMap.js).
//
// The Ads module pins ads to specific tool detail pages using this slug list.
// It MUST stay in sync with the live tools, otherwise newly-added tools do not
// appear as ad targets. Run this whenever tools are added/removed:
//   node scripts/generate-tool-slugs.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const runtimeMapPath = path.resolve(
  here,
  "../../altftoolweb/src/platform/registry/toolRuntimeMap.js",
);
const outPath = path.resolve(here, "../src/config/toolSlugs.generated.js");

const src = readFileSync(runtimeMapPath, "utf8");
// Keys are the quoted object keys: `"slug": () => import(...)`
const slugs = [...src.matchAll(/^\s*"([a-z0-9][a-z0-9-]*)"\s*:/gim)].map((m) => m[1]);
const unique = [...new Set(slugs)].sort((a, b) => a.localeCompare(b));

if (unique.length === 0) {
  console.error("[generate-tool-slugs] No slugs found — aborting to avoid wiping the list.");
  process.exit(1);
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
