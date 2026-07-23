// ============================================================================
// verify/quality.mjs — deterministic UX/design quality lint (0 AI). Catches the
// mechanically-detectable defects a human tester spots: dead fields, weak
// labels, thin selects, shallow output, missing presets/notes. Feeds the
// confidence score so poor-design tools land in review instead of auto-shipping.
//
//   qualityLint(spec) -> { score, grade, issues: [{sev, code, msg}] }
// ============================================================================
import { referencedKeys } from "../lib/sandbox.mjs";

const GENERIC = new Set(["value", "input", "text", "field", "basic", "number", "data", "amount", "result", "output", "enter", "type"]);
const WEIGHT = { high: 35, medium: 12, low: 4 };

export function qualityLint(spec) {
  const issues = [];
  const fields = spec.fields || [];
  const src = String(spec.compute || "");
  const refs = new Set(referencedKeys(src));

  // 1. DEAD FIELDS — declared but never read by compute (the glob bug; also the
  //    `mode` field vs `mode` param confusion). Highest severity: real defect.
  for (const f of fields) {
    if (!refs.has(f.key)) issues.push({ sev: "high", code: "dead-field", msg: `field "${f.key}" is never used by compute()` });
  }

  // 2. LABELS — missing / raw-identifier / duplicate / generic.
  // A raw identifier label = snake_case or camelCase (e.g. "commit_scope",
  // "inputString"). Title-Case ("Host", "Length") and single letters ("a") are fine.
  const isRawId = (s) => (/_/.test(s) && /^[a-z0-9_]+$/.test(s)) || /^[a-z]+[A-Z][a-z]/.test(s);
  const labelCounts = {};
  for (const f of fields) {
    const raw = String(f.label || "").trim();
    labelCounts[raw.toLowerCase()] = (labelCounts[raw.toLowerCase()] || 0) + 1;
    if (!raw) issues.push({ sev: "medium", code: "weak-label", msg: `field "${f.key}" has no label` });
    else if (isRawId(raw)) issues.push({ sev: "medium", code: "weak-label", msg: `field "${f.key}" label "${raw}" is a raw identifier` });
    else if (fields.length > 1 && GENERIC.has(raw.toLowerCase())) issues.push({ sev: "low", code: "generic-label", msg: `field "${f.key}" label "${raw}" is generic` });
  }
  for (const [lab, n] of Object.entries(labelCounts)) if (n > 1 && lab) issues.push({ sev: "medium", code: "dup-label", msg: `label "${lab}" used on ${n} fields` });

  // 3. THIN SELECT — a dropdown with fewer than 2 options is pointless.
  for (const f of fields) if (f.type === "select" && (f.choices || []).length < 2) issues.push({ sev: "medium", code: "thin-select", msg: `select "${f.key}" has < 2 choices` });

  // 4. SHALLOW OUTPUT — calculators/converters that return only a bare result.
  const hasRich = /\brows\s*:/.test(src) || /\blist\s*:/.test(src) || /\btable\s*:/.test(src);
  const hay = ((spec.category || []).join(" ") + " " + (spec.slug || "")).toLowerCase();
  const looksCalc = /calc|convert|finance|math|ratio|rate|interest/.test(hay);
  if (looksCalc && !hasRich && !spec.regenerate) issues.push({ sev: "low", code: "shallow-output", msg: "single result only — consider supporting rows/breakdown" });

  // 5/6. missing presets / note (thin product + SEO).
  if (!(spec.presets || []).length && !spec.regenerate) issues.push({ sev: "low", code: "no-presets", msg: "no example presets" });
  if (!spec.note) issues.push({ sev: "low", code: "no-note", msg: "no note/disclaimer" });

  let score = 100;
  for (const i of issues) score -= WEIGHT[i.sev];
  score = Math.max(0, score);
  const grade = issues.some((i) => i.sev === "high") ? "poor" : score >= 85 ? "good" : score >= 65 ? "fair" : "weak";
  return { score, grade, issues };
}
