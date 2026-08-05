// ============================================================================
// agentic.mjs — Tier-3 of the cascade: retrieval-grounded multi-agent generation
// for genuinely novel tools. Model-agnostic via ProviderPool.
//
//   Designer  (name + retrieval)     -> fields, presets, expected test vectors
//   Coder     (Designer's EXACT keys + retrieved algorithm) -> compute()
//   [verify]  sandbox + ladder (using the Designer's vectors + differential)
//   Reviewer  (a DIFFERENT provider) -> fix compute from the exact failure  ×N
//
// Keys stay in sync because the Coder is handed the Designer's field keys.
// Grounding (Wikipedia algorithm + npm + repo) means the Coder ADAPTS a known
// method instead of inventing one.
// ============================================================================
import { ProviderPool } from "./providers.mjs";
import { retrieve } from "../retrieval/index.mjs";
import { buildAndValidate } from "../lib/authoring.mjs";
import { checkInvariants, checkBehavior, scoreConfidence } from "../verify/ladder.mjs";
import { checkDifferential } from "../verify/differential.mjs";

function parseJSON(text) {
  let s = String(text).trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) s = fence[1].trim();
  const a = s.indexOf("{"), b = s.lastIndexOf("}");
  if (a >= 0 && b > a) s = s.slice(a, b + 1);
  return JSON.parse(s);
}

function contextBlock(r) {
  const lines = [];
  if (r.definition?.extract) lines.push("REFERENCE (Wikipedia — " + r.definition.title + "):\n" + r.definition.extract.slice(0, 700));
  if (r.packages?.length) lines.push("npm packages that implement this: " + r.packages.slice(0, 4).map((p) => p.name).join(", "));
  if (r.repoExamples?.length) lines.push("similar existing tools in this codebase: " + r.repoExamples.join(", "));
  return lines.join("\n\n") || "(no external reference found)";
}

export function makePools(cfg = {}) {
  return {
    designer: new ProviderPool(cfg.designer || ["gemini", "groq", "ollama"]),
    coder: new ProviderPool(cfg.coder || ["groq", "mistral", "cerebras", "ollama"]),
    // reviewer prefers a fast, live provider; add OPENROUTER_API_KEY for true
    // model diversity (a different family reviewing the coder's work).
    reviewer: new ProviderPool(cfg.reviewer || ["openrouter", "groq", "gemini", "ollama"]),
  };
}

const FIELD_TYPES = "number | text | textarea | password | select | date | range | toggle";

async function design(pool, entry, ctx) {
  const cats = (Array.isArray(entry.category) ? entry.category.join(", ") : entry.category) || "Utility";
  const prompt = `Design a single browser tool named "${entry.name}" (category: ${cats}).
Use the reference below to understand what it should do.

${ctx}

Return ONLY JSON:
{
  "description": "one sentence",
  "fields": [{"key":"snake_case_key","label":"Label","type":"${FIELD_TYPES}","default":"","choices":[{"value":"","label":""}]}],
  "presets": [{"label":"Example","values":{"snake_case_key":"..."}}],
  "vectors": [{"values":{"snake_case_key":"input"},"expect":"substring the result MUST contain"}],
  "note":"short disclaimer"
}
Rules: 2–4 fields, snake_case keys, realistic defaults, and 1–2 vectors with KNOWN correct expected output from the reference.`;
  const { text } = await pool.chat([{ role: "system", content: "You are a precise product designer. Output only valid JSON." }, { role: "user", content: prompt }], { json: true });
  return parseJSON(text);
}

async function code(pool, entry, dsg, ctx, priorError) {
  const keys = dsg.fields.map((f) => f.key).join(", ");
  const prompt = `Write the compute function for the tool "${entry.name}".

${ctx}

The input fields (use these EXACT keys on \`values\`): ${keys}
number/range fields arrive as Numbers.

Return ONLY JSON: {"compute":"(values) => { /* pure JS, real algorithm from the reference */ return { result: 'string', rows: [['Label','Value']] }; }"}
Rules: pure JS only (Math, Date, JSON, Intl, RegExp, crypto.subtle, TextEncoder, TextDecoder, btoa, atob). NO fetch/DOM/require. Use the EXACT field keys. Implement the REAL algorithm from the reference — never a placeholder or echo.${priorError ? "\n\nYour previous attempt failed validation: " + priorError + "\nFix it." : ""}`;
  const { text } = await pool.chat([{ role: "system", content: "You are an expert JS engineer. Output only valid JSON with a working pure function." }, { role: "user", content: prompt }], { json: true });
  return parseJSON(text).compute;
}

async function verifyAll(spec, vectors) {
  const inv = await checkInvariants(spec, []);
  const beh = await checkBehavior(spec, vectors || []);
  const differential = await checkDifferential(spec).catch(() => null);
  return { conf: scoreConfidence({ invariants: inv, behavior: beh, differential }), inv, beh, differential };
}

// Main entry. Returns { raw, verify, tier } or null.
export async function agenticGenerate(entry, pools, { minLevel = "medium", repairs = 2 } = {}) {
  const r = await retrieve(entry).catch(() => ({ definition: null, packages: [], repoExamples: [] }));
  const ctx = contextBlock(r);

  let dsg;
  try { dsg = await design(pools.designer, entry, ctx); } catch (e) { return { skip: "designer failed: " + (e.message || e) }; }
  if (!Array.isArray(dsg.fields) || !dsg.fields.length) return { skip: "designer produced no fields" };

  const baseRaw = { title: entry.name, category: entry.category, description: dsg.description, fields: dsg.fields, presets: dsg.presets || [], note: dsg.note };
  const vectors = Array.isArray(dsg.vectors) ? dsg.vectors : [];

  let priorError = "";
  for (let attempt = 0; attempt <= repairs; attempt++) {
    const pool = attempt === 0 ? pools.coder : pools.reviewer; // reviewer = different model
    let compute;
    try { compute = await code(pool, entry, dsg, ctx, priorError); } catch (e) { priorError = "code call failed: " + (e.message || e); continue; }

    const raw = { ...baseRaw, compute };
    const v = await buildAndValidate(entry, raw);
    if (!v.ok) { priorError = v.error; continue; }

    const { conf } = await verifyAll(v.spec, vectors);
    const levels = { low: 0, medium: 1, high: 2 };
    if (levels[conf.level] >= levels[minLevel]) {
      return { raw, verify: { vectors }, tier: "agentic" + (attempt ? "+repair" : ""), confidence: conf };
    }
    priorError = "verification: " + conf.failed.join("; ");
  }
  return { skip: "agentic exhausted: " + priorError.slice(0, 80) };
}
