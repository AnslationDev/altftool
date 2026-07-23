// ============================================================================
// build-cascade.mjs — the v2 factory. For each pending tool it walks the
// escalating cascade (cheapest reliable path first), verifies through the
// confidence ladder, and ships by triage. 0 AI for everything a cluster or
// memory can build; optional local generation only with --allow-generate.
//
//   node automation/build-cascade.mjs [--count N] [--slugs a,b]
//        [--min high|medium] [--allow-generate] [--dry] [--no-regen] [--force]
// ============================================================================
import "./lib/env.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readManifest, getPending } from "./lib/manifest.mjs";
import { classify } from "./lib/capability.mjs";
import { buildCluster } from "./clusters.mjs";
import { recall, remember, memorySize } from "./lib/memory.mjs";
import { buildAndValidate } from "./lib/authoring.mjs";
import { emitTool } from "./lib/spec.mjs";
import { mergeOverrides } from "./lib/overrides.mjs";
import { checkInvariants, checkBehavior, scoreConfidence } from "./verify/ladder.mjs";
import { checkDifferential as diff } from "./verify/differential.mjs";
import { qualityLint } from "./verify/quality.mjs";
import { agenticGenerate, makePools } from "./generator/agentic.mjs";
import { ProviderPool } from "./generator/providers.mjs";
import { generateSeo } from "./lib/seo.mjs";
import { TOOLS_DIR, OVERRIDES_FILE, lintDirs, removeDir, regenRegistries, refreshManifest } from "./lib/pipeline.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEVELS = { low: 0, medium: 1, high: 2 };

function parseArgs(a) {
  const o = { count: null, slugs: null, min: "medium", gen: false, dry: false, regen: true, force: false, seo: true };
  for (let i = 2; i < a.length; i++) {
    const t = a[i];
    if (t === "--count") o.count = Number(a[++i]);
    else if (t === "--slugs") o.slugs = a[++i].split(",").map((s) => s.trim()).filter(Boolean);
    else if (t === "--min") o.min = a[++i];
    else if (t === "--allow-generate") o.gen = true;
    else if (t === "--dry") o.dry = true;
    else if (t === "--no-regen") o.regen = false;
    else if (t === "--force") o.force = true;
    else if (t === "--no-seo") o.seo = false;
  }
  return o;
}

const alreadyBuilt = (slug) => fs.existsSync(path.join(TOOLS_DIR, slug, "spec.js"));

// Escalating cascade → { raw, tier, verifyMeta } | { skip, reason }
async function cascade(entry, opts, gens) {
  const cap = classify(entry);
  if (!cap.ok) return { skip: true, reason: "unsupported: " + cap.reason };

  // Tier 1 — cluster template (0 AI)
  const c = buildCluster(entry);
  if (c) return { raw: c.raw, tier: "cluster:" + c.clusterId, verifyMeta: c.verify };

  // Tier 2 — self-RAG memory (near-0 AI)
  const mem = recall(entry);
  if (mem) return { raw: mem.raw, tier: mem.via, verifyMeta: { invariants: [] } };

  // Tier 3 — retrieval-grounded multi-agent generation (optional)
  if (opts.gen && gens?.pools) {
    const res = await agenticGenerate(entry, gens.pools, { minLevel: opts.min });
    if (res.skip) return { skip: true, reason: res.skip };
    return { raw: res.raw, tier: res.tier, verifyMeta: res.verify };
  }
  return { skip: true, reason: "no tier could build it (enable --allow-generate for Tier 3)" };
}

async function verify(spec, verifyMeta) {
  const inv = await checkInvariants(spec, verifyMeta?.invariants || []);
  const beh = await checkBehavior(spec, verifyMeta?.vectors || []);
  const differential = await diff(spec).catch(() => null);
  const conf = scoreConfidence({ invariants: inv, behavior: beh, differential });
  // Fold deterministic UX/design quality into the level: a dead-field tool is
  // never "high"; a weak-design tool can't auto-ship as "high".
  const quality = qualityLint(spec);
  let level = conf.level;
  if (quality.grade === "poor") level = "low";
  else if (quality.grade === "weak" && level === "high") level = "medium";
  const failed = [...conf.failed, ...quality.issues.filter((i) => i.sev === "high").map((i) => i.code)];
  return { ...conf, level, quality, failed };
}

async function main() {
  const opts = parseArgs(process.argv);
  const manifest = readManifest();
  let entries = getPending(manifest, opts.count ?? 50, opts.slugs);
  if (!opts.force) entries = entries.filter((e) => !alreadyBuilt(e.slug));

  let gens = null;
  if (opts.gen) {
    const pools = makePools();
    const live = await pools.designer.ready();
    console.log(`   Tier-3 agents live via: ${live.join(", ")}`);
    gens = { pools };
  }

  // Per-tool unique SEO content (best-effort; falls back to the category
  // template if no provider is available or a call fails). --no-seo to skip.
  let seoPool = null;
  if (opts.seo && !opts.dry) {
    seoPool = new ProviderPool(["groq", "gemini", "ollama"]);
    const live = await seoPool.ready();
    if (!live.length) seoPool = null;
    else console.log(`   SEO content via: ${live.join(", ")}`);
  }

  console.log(`🏭 Cascade factory  (memory: ${memorySize()} recipes, min confidence: ${opts.min})\n`);
  const built = [], skipped = [], overrides = {}, byTier = {}, byLevel = {};

  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    process.stdout.write(`[${i + 1}/${entries.length}] ${e.slug} … `);
    try {
      const res = await cascade(e, opts, gens);
      if (res.skip) { skipped.push({ slug: e.slug, reason: res.reason }); console.log("SKIP (" + res.reason.slice(0, 50) + ")"); continue; }

      const v = await buildAndValidate(e, res.raw);
      if (!v.ok) { skipped.push({ slug: e.slug, reason: "sandbox: " + v.error.slice(0, 40) }); console.log("SKIP (sandbox)"); continue; }

      const conf = await verify(v.spec, res.verifyMeta);
      byLevel[conf.level] = (byLevel[conf.level] || 0) + 1;
      if (LEVELS[conf.level] < LEVELS[opts.min]) { skipped.push({ slug: e.slug, reason: `confidence ${conf.level}: ${conf.failed.join(", ")}` }); console.log(`SKIP (conf ${conf.level}: ${conf.failed[0] || ""})`); continue; }

      if (!opts.dry) {
        const dir = emitTool(v.spec, TOOLS_DIR);
        const lint = lintDirs([dir]);
        if (!lint.ok) { removeDir(dir); skipped.push({ slug: e.slug, reason: "lint" }); console.log("SKIP (lint)"); continue; }
        let seo = null;
        if (seoPool) { try { seo = await generateSeo(seoPool, v.spec); } catch { /* keep template fallback */ } }
        overrides[e.slug] = seo || { intro: v.spec.intro, useCases: v.spec.useCases, benefits: v.spec.benefits, faqs: v.spec.faqs };
        remember(v.spec, { clusterId: res.tier, confidence: conf.score });
      }
      byTier[res.tier.split(":")[0]] = (byTier[res.tier.split(":")[0]] || 0) + 1;
      built.push({ slug: e.slug, tier: res.tier, level: conf.level, score: conf.score });
      console.log(`OK  ${res.tier}  ·  conf ${conf.level}(${conf.score})${conf.passed.length ? " ✓" + conf.passed.join(",") : ""}`);
    } catch (err) {
      skipped.push({ slug: e.slug, reason: "unexpected: " + (err.message || err) });
      console.log("SKIP (unexpected: " + (err.message || err).toString().slice(0, 50) + ")");
    }
  }

  if (!opts.dry && built.length) {
    await mergeOverrides(OVERRIDES_FILE, overrides);
    if (opts.regen) { regenRegistries(); refreshManifest(); }
  }
  fs.writeFileSync(path.join(__dirname, "last-cascade.json"), JSON.stringify({ built, skipped }, null, 2) + "\n");

  console.log(`\n✅ built ${built.length}  ·  ⏭ skipped ${skipped.length}`);
  console.log("   by tier:  " + Object.entries(byTier).map(([k, v]) => `${k}=${v}`).join("  "));
  console.log("   confidence: " + Object.entries(byLevel).map(([k, v]) => `${k}=${v}`).join("  "));
}

main().catch((e) => { console.error("FATAL:", e.message || e); process.exit(1); });
