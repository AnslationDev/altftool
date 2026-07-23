// ============================================================================
// run.mjs — one orchestrator for the whole tool factory. Chains the individual
// commands so the pipeline runs hands-off, and is safe to re-run (every stage
// is idempotent / resumable).
//
//   node automation/run.mjs                 # full cycle: top-up ideas → build → test
//   node automation/run.mjs build [N]       # build N pending (auto-scrape if low) → test
//   node automation/run.mjs upgrade         # bring every remaining level-1 tool to level-5
//   node automation/run.mjs enhance [N]     # enhance N existing tools → test
//   node automation/run.mjs scrape          # fetch ideas → fold into manifest
//   node automation/run.mjs status          # show counts + what's left to do
//
//   pass-through flags: --provider ollama|template  --model <name>  --force
// ============================================================================
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readManifest } from "./lib/manifest.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TOOLS = path.join(ROOT, "src/tools");

const argv = process.argv.slice(2);
const cmd = (argv[0] && !argv[0].startsWith("--") ? argv[0] : "all");
const numArg = argv.find((a) => /^\d+$/.test(a));
const passthrough = argv.filter((a) => a.startsWith("--") || (argv[argv.indexOf(a) - 1] || "").startsWith("--"));

function node(script, extra = []) {
  console.log(`\n▶ node automation/${script} ${extra.join(" ")}`.trim());
  const r = spawnSync("node", [path.join("automation", script), ...extra], {
    cwd: ROOT,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, NODE_NO_WARNINGS: "1" },
  });
  if (r.status !== 0) throw new Error(`${script} exited with code ${r.status}`);
}

// Tools still rendered by the legacy primitives (no spec.js) = not yet level-5.
function legacyTools() {
  return fs
    .readdirSync(TOOLS, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .map((d) => d.name)
    .filter((slug) => {
      const page = path.join(TOOLS, slug, "pages", "index.jsx");
      if (!fs.existsSync(page)) return false;
      if (fs.existsSync(path.join(TOOLS, slug, "spec.js"))) return false; // already level-5
      return fs.readFileSync(page, "utf8").includes("_shared/batch");
    });
}

function pendingCount() {
  try {
    return readManifest().tools.filter((t) => t.status === "pending").length;
  } catch {
    return 0;
  }
}

function status() {
  const m = readManifest();
  const made = m.tools.filter((t) => t.status === "made").length;
  const pending = m.tools.filter((t) => t.status === "pending").length;
  const legacy = legacyTools().length;
  console.log("📊 Tool factory status");
  console.log(`   made:    ${made}`);
  console.log(`   pending: ${pending}`);
  console.log(`   level-1 tools awaiting upgrade: ${legacy}`);
  console.log(legacy ? `   → run: node automation/run.mjs upgrade` : "   → all tools are level-5 ✓");
}

async function main() {
  const N = numArg ? Number(numArg) : 50;

  if (cmd === "status") return status();

  if (cmd === "scrape") {
    node("scrape-tools.mjs", passthrough);
    node("generate-manifest.mjs");
    return;
  }

  if (cmd === "cascade") {
    // v2 factory: feasibility → cluster → memory → (generate) → verify → triage
    if (pendingCount() < N) { node("scrape-tools.mjs", passthrough); node("generate-manifest.mjs"); }
    node("build-cascade.mjs", ["--count", String(N), ...passthrough]);
    node("test-logic.mjs");
    return status();
  }

  if (cmd === "build" || cmd === "all") {
    if (pendingCount() < N) {
      console.log(`Pending (${pendingCount()}) < ${N} — topping up ideas first.`);
      node("scrape-tools.mjs", passthrough);
      node("generate-manifest.mjs");
    }
    node("build-batch.mjs", ["--count", String(N), ...passthrough]);
    node("test-logic.mjs");
    return status();
  }

  if (cmd === "upgrade") {
    const legacy = legacyTools();
    if (!legacy.length) {
      console.log("All tools are already level-5 ✓");
      return;
    }
    console.log(`Upgrading ${legacy.length} legacy tool(s) to level-5 (resumable)…`);
    node("build-batch.mjs", ["--slugs", legacy.join(","), ...passthrough]);
    node("test-logic.mjs");
    return status();
  }

  if (cmd === "enhance") {
    node("enhance-tools.mjs", ["--all", "--count", String(N), ...passthrough]);
    node("test-logic.mjs");
    return status();
  }

  console.log(`Unknown command "${cmd}". Try: status | scrape | build [N] | upgrade | enhance [N] | all [N]`);
}

main().catch((e) => {
  console.error("FATAL:", e.message || e);
  process.exit(1);
});
