// ============================================================================
// repair-tools.mjs — deterministic, no-LLM in-place fixer for already-built
// toolkit tools. Currently repairs the field-key ⇆ compute-key case mismatch
// (the main NaN cause): if compute reads values.faceValue but the field key is
// "facevalue", rename the field key to "faceValue".
//
// Reports (and leaves for rebuild) anything it can't fix deterministically:
//   - compute references a key with NO matching field at all
//   - unsupported/fake concepts (deleted separately)
//
//   node automation/repair-tools.mjs [--dry]
// ============================================================================
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { referencedKeys } from "./lib/sandbox.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOLS = path.resolve(__dirname, "..", "src/tools");
const DRY = process.argv.includes("--dry");

const dirs = fs.readdirSync(TOOLS).filter((d) => fs.existsSync(path.join(TOOLS, d, "spec.js"))).sort();

const fixed = [];
const unfixable = [];

for (const slug of dirs) {
  const file = path.join(TOOLS, slug, "spec.js");
  let text = fs.readFileSync(file, "utf8");
  const mod = await import(pathToFileURL(file).href + "?t=" + Date.now());
  const spec = mod.spec;
  const fieldKeys = (spec.fields || []).map((f) => f.key);
  const refs = referencedKeys(String(spec.compute));
  const missing = refs.filter((k) => !fieldKeys.includes(k));
  if (!missing.length) continue;

  const renames = [];
  const noMatch = [];
  for (const ref of missing) {
    // Find a field whose key matches case-insensitively (or ignoring separators).
    const norm = (s) => s.toLowerCase().replace(/[_-]/g, "");
    const match = fieldKeys.find((k) => norm(k) === norm(ref));
    if (match && match !== ref) renames.push([match, ref]);
    else noMatch.push(ref);
  }

  for (const [from, to] of renames) {
    // Only touch the field definition key, not compute (compute already uses `to`).
    text = text.replace(new RegExp(`("key":\\s*)"${from}"`), `$1"${to}"`);
  }

  if (renames.length && !DRY) fs.writeFileSync(file, text);
  if (renames.length) fixed.push([slug, renames.map((r) => r[0] + "→" + r[1]).join(", ")]);
  if (noMatch.length) unfixable.push([slug, "no field for: " + noMatch.join(", ")]);
}

console.log(`${DRY ? "[dry] " : ""}Key-repair complete.`);
console.log(`\n✅ fixed ${fixed.length}:`);
for (const [slug, r] of fixed) console.log(`   ${slug.padEnd(36)} ${r}`);
if (unfixable.length) {
  console.log(`\n⚠ needs rebuild (${unfixable.length}) — compute references a field that doesn't exist:`);
  for (const [slug, r] of unfixable) console.log(`   ${slug.padEnd(36)} ${r}`);
}
