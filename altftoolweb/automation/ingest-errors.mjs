// ============================================================================
// ingest-errors.mjs — closes the production loop. The app's error boundary
// emits `altftool:tool-runtime-error`; a reporter writes them to
// automation/data/runtime-errors.json ([{slug, message, url}]). This script
// dedupes them into a rebuild queue so the cascade re-generates failing tools.
//
//   node automation/ingest-errors.mjs [--rebuild]
// --rebuild also deletes each tool's spec.js so the next cascade run rebuilds it.
// ============================================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ERRORS = path.join(__dirname, "data", "runtime-errors.json");
const QUEUE = path.join(__dirname, "data", "rebuild-queue.json");
const TOOLS = path.resolve(__dirname, "..", "src/tools");

const rebuild = process.argv.includes("--rebuild");

let errors = [];
try { errors = JSON.parse(fs.readFileSync(ERRORS, "utf8")); } catch {
  console.log("No runtime-errors.json found. A client reporter should write");
  console.log("[{slug, message, url}] there from the altftool:tool-runtime-error event.");
  process.exit(0);
}

const counts = {};
for (const e of errors) if (e.slug) counts[e.slug] = (counts[e.slug] || 0) + 1;
const slugs = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);

fs.mkdirSync(path.dirname(QUEUE), { recursive: true });
fs.writeFileSync(QUEUE, JSON.stringify(slugs, null, 2) + "\n");
console.log(`Queued ${slugs.length} tool(s) for rebuild (by error frequency):`);
for (const s of slugs) console.log(`  ${String(counts[s]).padStart(4)}×  ${s}`);

if (rebuild) {
  for (const s of slugs) { const f = path.join(TOOLS, s, "spec.js"); if (fs.existsSync(f)) fs.rmSync(f); }
  console.log(`\nDeleted spec.js for ${slugs.length} tool(s). Now run:`);
  console.log(`  node automation/build-cascade.mjs --slugs ${slugs.join(",")} --force --allow-generate`);
}
