// Validation pipeline for a raw generator output. Combines:
//   1. normalize into a canonical ToolSpec
//   2. structural shape checks
//   3. sandboxed execution of compute() on default + preset + variant inputs
// Returns { ok, spec, error }. The spec is safe to emit only when ok === true.
import { normalizeSpec, validateSpecShape } from "../lib/spec.mjs";
import { runCompute, buildSampleInputs, referencedKeys } from "../lib/sandbox.mjs";

// Placeholder / hollow output patterns — a tool must actually DO something.
const FAKE = /(in progress|coming soon|not implemented|please wait|currently working|will be (generated|ready|processed)|example\.com|\bsaved as\b|converted to|has been (converted|trimmed|processed|saved)|your .{0,30}is ready|placeholder|todo|lorem ipsum output)/i;
// Capabilities a pure browser compute() must not use.
const BANNED = /\b(fetch|XMLHttpRequest|WebSocket|require|process|__dirname)\b|\bimport\s*\(|\bdocument\b|\bwindow\.|\blocalStorage\b|\bnavigator\b/;

export async function validateRawSpec(entry, raw) {
  if (!raw || typeof raw !== "object") return { ok: false, error: "generator returned nothing" };

  let spec;
  try {
    spec = normalizeSpec(entry, raw);
  } catch (e) {
    return { ok: false, error: "normalize failed: " + (e.message || e) };
  }

  const shape = validateSpecShape(spec);
  if (!shape.ok) return { ok: false, spec, error: "shape: " + shape.errors.join("; ") };

  // 1. compute must not reference fields that don't exist (the NaN bug).
  const fieldKeys = new Set(spec.fields.map((f) => f.key));
  const missing = referencedKeys(spec.compute).filter((k) => !fieldKeys.has(k));
  if (missing.length) return { ok: false, spec, error: "compute references missing field(s): " + missing.join(", ") };

  // 2. no forbidden capabilities, no placeholder/fake output.
  if (BANNED.test(spec.compute)) return { ok: false, spec, error: "compute uses a forbidden capability (network/DOM/node)" };
  if (FAKE.test(spec.compute)) return { ok: false, spec, error: "compute returns placeholder/fake output" };

  // 3. must run cleanly on default + preset + variant inputs.
  const samples = buildSampleInputs(spec.fields);
  for (const p of spec.presets || []) samples.push(p.values);
  if (spec.regenerate && !samples.length) samples.push({});
  const mode = spec.modes?.[0]?.id || "";
  const run = await runCompute(spec.compute, spec.fields, samples.length ? samples : [{}], mode);
  if (!run.ok) return { ok: false, spec, error: run.error };

  // 4. output must not be NaN/undefined/Infinity for valid inputs.
  const bad = run.samples.find((s) => /\b(NaN|undefined|Infinity)\b/.test(s.preview));
  if (bad) return { ok: false, spec, error: "compute produced '" + bad.preview.trim() + "' for valid inputs" };

  return { ok: true, spec, error: "", samples: run.samples };
}
