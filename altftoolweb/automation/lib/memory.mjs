// ============================================================================
// memory.mjs — self-RAG: every VERIFIED tool becomes a reusable recipe. New
// tools that closely match a past recipe are adapted from it (near-zero AI),
// so the more the factory builds, the less it needs to generate.
// ============================================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE = path.join(__dirname, "..", "data", "recipes.json");

const tokens = (s) => new Set(String(s).toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2));
const jaccard = (a, b) => { const A = tokens(a), B = tokens(b); if (!A.size || !B.size) return 0; let i = 0; for (const x of A) if (B.has(x)) i++; return i / (A.size + B.size - i); };
const primaryCat = (c) => (Array.isArray(c) ? c[0] : c) || "";

function load() {
  try { return JSON.parse(fs.readFileSync(STORE, "utf8")); } catch { return []; }
}

// Store a verified recipe (spec is the normalized ToolSpec; compute is a string).
export function remember(spec, meta = {}) {
  fs.mkdirSync(path.dirname(STORE), { recursive: true });
  const recipes = load();
  const rec = {
    slug: spec.slug, name: spec.title, category: spec.category,
    fields: spec.fields, computeSrc: String(spec.compute),
    modes: spec.modes || null, presets: spec.presets || [], regenerate: !!spec.regenerate,
    exportResultOnly: !!spec.exportResultOnly,
    icon: spec.icon, iconColor: spec.iconColor,
    clusterId: meta.clusterId || null, confidence: meta.confidence ?? null,
  };
  const i = recipes.findIndex((r) => r.slug === spec.slug);
  if (i >= 0) recipes[i] = rec; else recipes.push(rec);
  fs.writeFileSync(STORE, JSON.stringify(recipes, null, 2) + "\n");
}

// Find the closest past recipe and adapt it to this entry. Returns { raw } or null.
//
// SAFETY: adaptation reuses a past tool's compute() VERBATIM. That is only valid
// when the two tools are the *same* tool — but dedup already prevents exact
// duplicates, and "similar names" (connection-string-builder vs
// query-string-builder, css-clamp vs css-keyframes) do NOT imply same logic.
// Reusing logic across them ships the wrong tool under a new name. So adaptation
// is DISABLED by default: only a near-identical name (>= 0.92) whose non-generic
// core words all match will adapt. In practice this almost never fires, which is
// correct — cluster + agentic are the real build tiers.
const GENERIC_WORDS = new Set(["generator", "calculator", "converter", "builder", "tool", "maker", "online", "free", "css", "text", "string"]);
const coreWords = (s) => [...tokens(s)].filter((w) => !GENERIC_WORDS.has(w));

export function recall(entry, threshold = 0.92) {
  const recipes = load();
  let best = null, bestScore = 0;
  for (const r of recipes) {
    if (r.slug === entry.slug) continue;
    let s = jaccard(entry.name || entry.slug, r.name);
    if (primaryCat(entry.category).toLowerCase() === primaryCat(r.category).toLowerCase()) s += 0.1;
    if (s > bestScore) { bestScore = s; best = r; }
  }
  if (!best || bestScore < threshold) return null;
  // Extra guard: the meaningful (non-generic) words must be identical, so
  // "query string builder" never adapts from "connection string builder".
  const a = coreWords(entry.name || entry.slug).sort().join(",");
  const b = coreWords(best.name).sort().join(",");
  if (a !== b || !a) return null;
  // Adapt: keep the proven logic/fields, retitle to the new tool.
  const raw = {
    title: entry.name, category: entry.category?.length ? entry.category : best.category,
    icon: best.icon, iconColor: best.iconColor, description: best.name + " style tool.",
    fields: best.fields, compute: best.computeSrc, presets: best.presets,
    ...(best.modes ? { modes: best.modes } : {}), ...(best.regenerate ? { regenerate: true } : {}),
    ...(best.exportResultOnly ? { exportResultOnly: true } : {}),
  };
  return { raw, via: "memory:" + best.slug + "(" + bestScore.toFixed(2) + ")" };
}

export function memorySize() { return load().length; }
