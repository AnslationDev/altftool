// ============================================================================
// build-batch.mjs — manifest-driven, model-agnostic tool factory.
//
// Reads pending tools from tools-manifest.json, generates each via the
// ToolGenerator interface (Ollama by default, deterministic template fallback),
// validates every tool in a sandbox + lint BEFORE it touches the app, writes
// only the ones that pass, regenerates registries, and refreshes the manifest.
//
// No per-tool code. Any new manifest entry is buildable with zero code changes.
//
//   node automation/build-batch.mjs [--count N] [--slugs a,b,c]
//                                   [--provider auto|ollama|template]
//                                   [--model <name>] [--dry] [--no-regen]
// ============================================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createGenerator } from "./generator/index.mjs";
import { emitTool } from "./lib/spec.mjs";
import { mergeOverrides } from "./lib/overrides.mjs";
import { readManifest, getPending } from "./lib/manifest.mjs";
import { classify } from "./lib/capability.mjs";
import {
  TOOLS_DIR, OVERRIDES_FILE, generateOne, lintDirs, removeDir, regenRegistries, refreshManifest,
} from "./lib/pipeline.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const a = { count: null, slugs: null, provider: undefined, model: undefined, dry: false, regen: true, force: false, regenEvery: 8 };
  for (let i = 2; i < argv.length; i++) {
    const t = argv[i];
    if (t === "--count") a.count = Number(argv[++i]);
    else if (t === "--slugs") a.slugs = argv[++i].split(",").map((s) => s.trim()).filter(Boolean);
    else if (t === "--provider") a.provider = argv[++i];
    else if (t === "--model") a.model = argv[++i];
    else if (t === "--dry") a.dry = true;
    else if (t === "--no-regen") a.regen = false;
    else if (t === "--force") a.force = true;
    else if (t === "--regen-every") a.regenEvery = Math.max(1, Number(argv[++i]) || 8);
  }
  return a;
}

// A tool is already built if it renders through the toolkit (has spec.js).
function alreadyBuilt(slug) {
  return fs.existsSync(path.join(TOOLS_DIR, slug, "spec.js"));
}

async function main() {
  const args = parseArgs(process.argv);
  const manifest = readManifest();
  const count = args.count ?? manifest.automation?.batchSize ?? 50;
  let entries = getPending(manifest, count, args.slugs);

  // Idempotent resume: skip tools already built (spec.js present) unless --force.
  const skippedExisting = [];
  if (!args.force) {
    entries = entries.filter((e) => {
      if (alreadyBuilt(e.slug)) {
        skippedExisting.push(e.slug);
        return false;
      }
      return true;
    });
  }

  if (!entries.length) {
    console.log(skippedExisting.length
      ? `Nothing to do — ${skippedExisting.length} target(s) already built. Use --force to rebuild.`
      : "No pending tools to build. Run: node automation/scrape-tools.mjs  to add more.");
    return;
  }

  const gens = await createGenerator({ provider: args.provider, model: args.model });
  console.log(`🏭 Tool factory`);
  console.log(`   generator:  ${gens.provider}${gens.fallback ? " (+ template fallback)" : ""}`);
  console.log(`   building:   ${entries.length} tool(s)${args.dry ? " [dry run]" : ""}`);
  if (skippedExisting.length) console.log(`   resuming:   ${skippedExisting.length} already built, skipped`);
  console.log(`   checkpoint: every ${args.regenEvery} tool(s)\n`);

  const built = [];
  const failed = [];
  const overrides = {};
  let lastFlushed = 0;

  // Persist progress + sync registries so an interruption never leaves the app
  // in an inconsistent state. Safe to call repeatedly.
  const flush = async (final = false) => {
    if (args.dry) return;
    const pending = built.slice(lastFlushed);
    if (!pending.length && !final) return;
    if (Object.keys(overrides).length) await mergeOverrides(OVERRIDES_FILE, overrides);
    if (args.regen) {
      regenRegistries();
      refreshManifest();
    }
    lastFlushed = built.length;
    fs.writeFileSync(
      path.join(__dirname, "last-run.json"),
      JSON.stringify({ at: new Date().toISOString().slice(0, 19), provider: gens.provider, built, failed, skippedExisting }, null, 2) + "\n",
    );
  };

  // Flush on Ctrl-C / termination so partial progress is preserved + consistent.
  let stopping = false;
  const onSignal = () => {
    if (stopping) return;
    stopping = true;
    console.log("\n⏸  interrupted — flushing progress…");
    flush(true).finally(() => process.exit(0));
  };
  process.on("SIGINT", onSignal);
  process.on("SIGTERM", onSignal);

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    process.stdout.write(`[${i + 1}/${entries.length}] ${entry.slug} … `);
    // Feasibility gate: never fake a tool that can't run purely in the browser.
    const cap = classify(entry);
    if (!cap.ok) {
      failed.push({ slug: entry.slug, error: "unsupported: " + cap.reason });
      console.log(`SKIP (unsupported — ${cap.reason})`);
      continue;
    }
    try {
      const res = await generateOne(entry, gens, { mode: "generate" });
      if (!res.ok) {
        failed.push({ slug: entry.slug, error: res.error });
        console.log(`SKIP (${res.error.slice(0, 90)})`);
        continue;
      }
      if (args.dry) {
        built.push({ slug: entry.slug, via: res.via });
        console.log(`OK (dry, via ${res.via})`);
        continue;
      }
      const dir = emitTool(res.spec, TOOLS_DIR);
      const lint = lintDirs([dir]);
      if (!lint.ok) {
        removeDir(dir);
        failed.push({ slug: entry.slug, error: "lint: " + lint.output.split("\n").filter(Boolean).slice(-2).join(" ") });
        console.log("SKIP (lint)");
        continue;
      }
      overrides[entry.slug] = { intro: res.spec.intro, useCases: res.spec.useCases, benefits: res.spec.benefits, faqs: res.spec.faqs };
      built.push({ slug: entry.slug, via: res.via });
      console.log(`OK (via ${res.via})`);
    } catch (e) {
      failed.push({ slug: entry.slug, error: "unexpected: " + (e.message || e) });
      console.log(`SKIP (unexpected: ${(e.message || e).toString().slice(0, 80)})`);
    }

    // Periodic checkpoint.
    if (!args.dry && built.length - lastFlushed >= args.regenEvery) {
      process.stdout.write("   · checkpoint (registries + manifest)… ");
      await flush();
      console.log("done");
    }
  }

  await flush(true);
  console.log(`\n✅ built ${built.length}/${entries.length}   ❌ failed ${failed.length}${skippedExisting.length ? `   ⏭ skipped ${skippedExisting.length}` : ""}`);
  if (failed.length) console.log("   failures logged to automation/last-run.json");
}

main().catch((e) => {
  console.error("FATAL:", e.message || e);
  process.exit(1);
});
