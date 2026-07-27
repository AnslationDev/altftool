/**
 * Transform section verification harness (Phase 1 Step D / Phase 2 gate).
 *
 * Every transformer is a plain Node-executable module, so this one harness can
 * import and run all 64 regardless of their browser/server engine flag (the
 * flag only decides where the *client* runs them). For each slug it checks:
 *   - the module exists and exports a transform function
 *   - it exports a non-empty `sample`
 *   - transform(sample) resolves to { ok: true } with non-empty output
 * and prints the first 5 lines of output so the result is visible.
 *
 * Usage:
 *   node src/app/transform/_lib/__verify.mjs                # all tools
 *   node src/app/transform/_lib/__verify.mjs json-to-yaml json-to-toml   # subset
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(fs.readFileSync(path.join(here, "../_data/transform.manifest.json"), "utf8"));
const transformersDir = path.join(here, "transformers");

const argSlugs = process.argv.slice(2).filter(Boolean);
const tools = manifest.tools.filter((t) => (argSlugs.length ? argSlugs.includes(t.slug) : true));

const indent = (s) => s.split("\n").map((l) => "     " + l).join("\n");

let pass = 0;
let fail = 0;
let missing = 0;
const failures = [];

for (const tool of tools) {
  const file = path.join(transformersDir, `${tool.slug}.js`);
  if (!fs.existsSync(file)) {
    missing++;
    console.log(`—  ${tool.slug}: not implemented yet`);
    continue;
  }
  try {
    const mod = await import(pathToFileURL(file).href);
    const fn = mod.transform || mod.default;
    if (typeof fn !== "function") throw new Error("no `transform` (or default) export");
    if (typeof mod.sample !== "string" || !mod.sample.trim()) throw new Error("missing or empty `sample` export");
    const res = await fn(mod.sample, {});
    if (!res || typeof res !== "object") throw new Error("transform did not return a result object");
    if (res.ok !== true) throw new Error(`result not ok: ${res.error || "unknown error"}`);
    if (typeof res.output !== "string" || !res.output.trim()) throw new Error("ok result had empty output");
    pass++;
    const preview = res.output.split("\n").slice(0, 5).join("\n");
    console.log(`✅ ${tool.slug}  [${tool.engine}]  ${tool.lib}`);
    console.log(indent(preview));
    if (Array.isArray(res.warnings) && res.warnings.length) {
      console.log(`     ⚠ warnings: ${res.warnings.join("; ")}`);
    }
    console.log("");
  } catch (e) {
    fail++;
    failures.push([tool.slug, e.message]);
    console.log(`❌ ${tool.slug}: ${e.message}\n`);
  }
}

console.log("──────────────────────────────────────────");
console.log(`Summary: ${pass} passed · ${fail} failed · ${missing} not-yet-implemented  (of ${tools.length})`);
if (failures.length) {
  console.log("\nFailures:");
  for (const [slug, msg] of failures) console.log(`  - ${slug}: ${msg}`);
}
process.exit(fail ? 1 : 0);
