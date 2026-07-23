// ============================================================================
// verify/ladder.mjs — the confidence ladder beyond the base sandbox.
//   invariants  — round-trip (decode(encode(x))===x) + idempotent (f(f(x))===f(x))
//   behavior    — actual output vs known test vectors
//   confidence  — aggregate into a score + level (high/medium/low)
// Differential (vs npm) is a separate optional module.
// ============================================================================
import { runOnce, buildSampleInputs } from "../lib/sandbox.mjs";

const asText = (o) => (o && typeof o === "object" ? String(o.result ?? "") : String(o ?? ""));

// Detect a mode select field with encode/decode-style options.
function encodeDecodeModes(spec) {
  const f = (spec.fields || []).find((x) => x.type === "select" && /mode/i.test(x.key + x.label));
  if (!f) return null;
  const vals = (f.choices || []).map((c) => String(c.value ?? c).toLowerCase());
  const enc = vals.find((v) => /enc|to /.test(v));
  const dec = vals.find((v) => /dec|from /.test(v));
  if (enc && dec) return { key: f.key, enc, dec };
  return null;
}

// A text field to feed as the round-trip subject.
const textField = (spec) => (spec.fields || []).find((x) => x.type === "textarea" || x.type === "text");

export async function checkInvariants(spec, declared = []) {
  const results = [];
  const src = String(spec.compute);
  const tf = textField(spec);

  // round-trip for encode/decode tools
  const ed = encodeDecodeModes(spec);
  if (ed && tf) {
    const x = "Hello World 123";
    const enc = await runOnce(src, spec.fields, { ...defaults(spec), [tf.key]: x, [ed.key]: ed.enc });
    if (enc.ok) {
      const y = asText(enc.output);
      const dec = await runOnce(src, spec.fields, { ...defaults(spec), [tf.key]: y, [ed.key]: ed.dec });
      const back = dec.ok ? asText(dec.output) : "";
      results.push({ name: "round-trip", pass: back === x, detail: back === x ? "" : `decode(encode) = "${back.slice(0, 20)}" ≠ "${x}"` });
    }
  }

  // idempotent for declared transforms: f(f(x)) === f(x)
  if (declared.includes("idempotent") && tf) {
    const x = "  Hello   World\nHello   World  ";
    const one = await runOnce(src, spec.fields, { ...defaults(spec), [tf.key]: x });
    if (one.ok) {
      const y = asText(one.output);
      const two = await runOnce(src, spec.fields, { ...defaults(spec), [tf.key]: y });
      const z = two.ok ? asText(two.output) : "";
      results.push({ name: "idempotent", pass: z === y, detail: z === y ? "" : "f(f(x)) ≠ f(x)" });
    }
  }

  return results;
}

// Behavior: run against explicit test vectors { values, expect } (expect is a
// substring the result must contain, or exact if wrapped in {exact:true}).
export async function checkBehavior(spec, vectors = []) {
  const results = [];
  for (const v of vectors) {
    const r = await runOnce(String(spec.compute), spec.fields, { ...defaults(spec), ...v.values }, v.mode || (spec.modes?.[0]?.id || ""));
    const got = r.ok ? asText(r.output) : "(error)";
    const pass = v.exact ? got === v.expect : got.includes(v.expect);
    results.push({ name: "vector", pass, detail: pass ? "" : `got "${got.slice(0, 24)}" want "${v.expect}"` });
  }
  return results;
}

function defaults(spec) {
  const [base] = buildSampleInputs(spec.fields);
  return base || {};
}

// Aggregate everything into a confidence score + level.
// sandbox is REQUIRED (caller guarantees it passed). Extra passing checks raise
// confidence; any failing check caps it.
export function scoreConfidence({ invariants = [], behavior = [], differential = null }) {
  const all = [...invariants, ...behavior, ...(differential ? [differential] : [])];
  const failed = all.filter((c) => !c.pass);
  const passed = all.filter((c) => c.pass);

  let score = 55; // sandbox-only baseline
  score += passed.length * 15;
  score -= failed.length * 40;
  score = Math.max(0, Math.min(100, score));

  const level = failed.length ? "low" : passed.length >= 1 ? "high" : "medium";
  return { score, level, passed: passed.map((c) => c.name), failed: failed.map((c) => c.name + (c.detail ? ` (${c.detail})` : "")) };
}
