// ============================================================================
// generate-seo.mjs — writes UNIQUE per-tool SEO content (intro, use cases,
// benefits, FAQs) into src/app/tools/toolContentOverrides.js, so each tool page
// stops falling back to the generic category template ("Ship cleaner code…").
//
// Uses the free ProviderPool (Groq primary). Deterministic-friendly: skips tools
// that already have an override unless --force.
//
//   node automation/generate-seo.mjs [--slugs a,b] [--all] [--count N] [--force]
// ============================================================================
import "./lib/env.mjs";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { ProviderPool } from "./generator/providers.mjs";
import { mergeOverrides } from "./lib/overrides.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TOOLS = path.join(ROOT, "src/tools");
const OVERRIDES = path.join(ROOT, "src/app/tools/toolContentOverrides.js");

function parseArgs(a) {
  const o = { slugs: null, all: false, count: null, force: false };
  for (let i = 2; i < a.length; i++) {
    if (a[i] === "--slugs") o.slugs = a[++i].split(",").map((s) => s.trim());
    else if (a[i] === "--all") o.all = true;
    else if (a[i] === "--count") o.count = Number(a[++i]);
    else if (a[i] === "--force") o.force = true;
  }
  return o;
}

function parseJSON(text) {
  let s = String(text).trim();
  const f = s.match(/```(?:json)?\s*([\s\S]*?)```/); if (f) s = f[1].trim();
  const a = s.indexOf("{"), b = s.lastIndexOf("}"); if (a >= 0 && b > a) s = s.slice(a, b + 1);
  return JSON.parse(s);
}

async function seoFor(pool, spec) {
  const fields = (spec.fields || []).map((f) => f.label).join(", ") || "(a button)";
  const prompt = `Write UNIQUE marketing/SEO content for a specific browser tool. Do NOT be generic — everything must be about THIS tool only.

Tool: "${spec.title}"
What it does: ${spec.description}
Inputs: ${fields}
${spec.note ? "Note: " + spec.note : ""}

Return ONLY JSON:
{
  "intro": "2-3 sentences describing exactly what this tool does and who it's for",
  "steps": ["specific step referencing THIS tool's actual inputs", "step 2", "step 3"],
  "useCases": ["specific real scenario 1", "scenario 2", "scenario 3"],
  "benefits": [["Short benefit title","one specific sentence"],["...","..."],["...","..."]],
  "faqs": [["A real question about THIS tool?","A specific answer."],["...","..."],["...","..."]]
}
Be concrete and specific to "${spec.title}". No filler like "ship cleaner code" or "paste your data".`;
  const { text } = await pool.chat([{ role: "system", content: "You write concise, tool-specific SEO copy. Output only valid JSON." }, { role: "user", content: prompt }], { json: true });
  return parseJSON(text);
}

async function main() {
  const opts = parseArgs(process.argv);
  // existing overrides (to skip already-done unless --force)
  let existing = {};
  try { existing = (await import(pathToFileURL(OVERRIDES).href + "?t=" + Date.now())).toolContentOverrides || {}; } catch { /* none */ }

  // Metadata source: spec.js when present, else the live registry (so --all can
  // cover the original repo tools that predate the toolkit).
  const { toolMetaMap } = await import(pathToFileURL(path.join(ROOT, "src/platform/registry/toolMetaMap.js")).href);

  let slugs;
  if (opts.slugs) slugs = opts.slugs;
  else {
    slugs = opts.all ? Object.keys(toolMetaMap) : fs.readdirSync(TOOLS).filter((d) => fs.existsSync(path.join(TOOLS, d, "spec.js")));
    // Skip tools that already have custom content (preserves hand-written overrides).
    if (!opts.force) slugs = slugs.filter((s) => !existing[s]?.steps?.length && !existing[s]?.useCases?.length);
    if (opts.count) slugs = slugs.slice(0, opts.count);
  }
  if (!slugs.length) { console.log("Nothing to do (all have SEO; use --force to redo)."); return; }

  const pool = new ProviderPool(["groq", "gemini", "ollama"]);
  console.log(`✍️  SEO content via: ${(await pool.ready()).join(", ")}\n   ${slugs.length} tool(s)\n`);

  const overrides = {};
  let ok = 0, fail = 0;
  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    process.stdout.write(`[${i + 1}/${slugs.length}] ${slug} … `);
    try {
      let spec;
      const sp = path.join(TOOLS, slug, "spec.js");
      if (fs.existsSync(sp)) spec = (await import(pathToFileURL(sp).href + "?t=" + Date.now())).spec;
      else {
        const meta = toolMetaMap[slug];
        if (!meta) throw new Error("no metadata");
        spec = { title: meta.name, description: meta.description || meta.name, category: Array.isArray(meta.category) ? meta.category : [meta.category], fields: [], note: "" };
      }
      const c = await seoFor(pool, spec);
      overrides[slug] = {
        intro: String(c.intro || "").trim(),
        steps: (c.steps || []).map(String).slice(0, 4),
        useCases: (c.useCases || []).map(String).slice(0, 4),
        benefits: (c.benefits || []).map((b) => Array.isArray(b) ? [String(b[0]), String(b[1])] : [String(b.title), String(b.body)]).filter((b) => b[0]).slice(0, 3),
        faqs: (c.faqs || []).map((f) => Array.isArray(f) ? [String(f[0]), String(f[1])] : [String(f.q), String(f.a)]).filter((f) => f[0] && f[1]).slice(0, 4),
      };
      // flush every few so a crash doesn't lose everything
      if ((i + 1) % 8 === 0) { await mergeOverrides(OVERRIDES, overrides); }
      ok++; console.log("OK");
    } catch (e) { fail++; console.log("SKIP (" + (e.message || e).toString().slice(0, 40) + ")"); }
  }
  await mergeOverrides(OVERRIDES, overrides);
  console.log(`\n✅ wrote SEO for ${ok} tool(s)   ❌ ${fail} failed`);
}

main().catch((e) => { console.error("FATAL:", e.message || e); process.exit(1); });
