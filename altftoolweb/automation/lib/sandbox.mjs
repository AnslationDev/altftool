// Safely evaluate a generated `compute` function in an isolated VM with an
// allow-listed set of globals. Used at BUILD time to prove a tool's logic runs
// before its code is ever written into the app. No network, no fs, no require.
import vm from "node:vm";
import { webcrypto } from "node:crypto";
import { createSeededRandom } from "../../src/tools/_shared/toolkit/runtimeHelpers.js";

const SAFE_GLOBALS = {
  Math,
  Date,
  Number,
  String,
  Boolean,
  Array,
  Object,
  JSON,
  Intl,
  BigInt,
  isNaN,
  isFinite,
  parseInt,
  parseFloat,
  RegExp,
  Map,
  Set,
  Symbol,
  Promise,
  encodeURIComponent,
  decodeURIComponent,
  TextEncoder,
  TextDecoder,
  URL,
  URLSearchParams,
  crypto: webcrypto,
  btoa: (s) => Buffer.from(String(s), "binary").toString("base64"),
  atob: (s) => Buffer.from(String(s), "base64").toString("binary"),
  console: { log() {}, warn() {}, error() {} },
};

// Field keys that a compute() body reads (values.x and destructured { x } = values).
export function referencedKeys(src) {
  const s = String(src || "");
  const keys = new Set();
  for (const m of s.matchAll(/values\.([a-zA-Z_$][\w$]*)/g)) keys.add(m[1]);
  for (const m of s.matchAll(/(?:const|let|var)\s*\{([^}]+)\}\s*=\s*values\b/g)) {
    for (const part of m[1].split(",")) {
      const name = part.trim().split(":")[0].trim().split(/\s|=/)[0];
      if (/^[a-zA-Z_$][\w$]*$/.test(name)) keys.add(name);
    }
  }
  return [...keys];
}

// Turn whatever the model produced into an evaluable function expression.
export function normalizeComputeSource(src) {
  let s = String(src || "").trim();
  // Strip a leading "const compute =" / "compute =" if present.
  s = s.replace(/^\s*(export\s+)?(const|let|var)\s+\w+\s*=\s*/, "");
  s = s.replace(/;\s*$/, "");
  const looksLikeFn = /^async\s+function|^function|^\(|^async\s*\(/.test(s);
  if (looksLikeFn) return s;
  // Bare body -> wrap as a function.
  return `(values, mode, random) => { ${s} }`;
}

// Mirror the browser runtime's coerceValues EXACTLY so validation is faithful:
// an empty number/range stays "" (not 0), which "leave one blank" tools rely on.
function coerce(fields, raw) {
  const out = {};
  for (const f of fields || []) {
    const v = raw[f.key];
    if (f.type === "number" || f.type === "range") out[f.key] = v === "" || v == null ? "" : Number(v);
    else if (f.type === "toggle") out[f.key] = !!v;
    else if (f.type === "file") out[f.key] = v || null;
    else out[f.key] = v ?? "";
  }
  return out;
}

async function withTimeout(promise, ms) {
  let t;
  const timeout = new Promise((_, rej) => (t = setTimeout(() => rej(new Error("compute timed out")), ms)));
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(t);
  }
}

/**
 * Run compute against several input sets. Returns { ok, error, samples }.
 * sampleValues: array of raw value objects (strings ok, we coerce).
 */
export async function runCompute(computeSrc, fields, sampleValues, mode = "") {
  const src = normalizeComputeSource(computeSrc);
  const context = vm.createContext({ ...SAFE_GLOBALS });
  let fn;
  try {
    fn = vm.runInContext(`(${src})`, context, { timeout: 2000 });
  } catch (e) {
    return { ok: false, error: "compile: " + (e.message || e), samples: [] };
  }
  if (typeof fn !== "function") return { ok: false, error: "compute is not a function", samples: [] };

  const samples = [];
  for (const raw of sampleValues) {
    try {
      const values = coerce(fields, raw);
      const out = await withTimeout(
        Promise.resolve(fn(values, mode, createSeededRandom(0))),
        2000,
      );
      if (out == null || (typeof out === "object" && out.result === undefined && !out.list && !out.rows && !out.table)) {
        return { ok: false, error: "compute returned no usable result for " + JSON.stringify(raw), samples };
      }
      const preview = typeof out === "object" ? out.result ?? (out.list || []).join(", ") : String(out);
      samples.push({ values: raw, preview: String(preview).slice(0, 60) });
    } catch (e) {
      return { ok: false, error: "runtime: " + (e.message || e) + " on " + JSON.stringify(raw), samples };
    }
  }
  return { ok: true, error: "", samples };
}

// Run compute ONCE and return the FULL result object (for invariant checks).
export async function runOnce(computeSrc, fields, rawValues, mode = "") {
  const src = normalizeComputeSource(computeSrc);
  const context = vm.createContext({ ...SAFE_GLOBALS });
  let fn;
  try {
    fn = vm.runInContext(`(${src})`, context, { timeout: 2000 });
  } catch (e) {
    return { ok: false, error: "compile: " + (e.message || e) };
  }
  try {
    const out = await withTimeout(
      Promise.resolve(
        fn(coerce(fields, rawValues), mode, createSeededRandom(0)),
      ),
      2000,
    );
    return { ok: true, output: out };
  } catch (e) {
    return { ok: false, error: "runtime: " + (e.message || e) };
  }
}

// Build representative sample inputs from a field list for validation.
export function buildSampleInputs(fields) {
  const FILE_SAMPLE = { name: "sample.txt", type: "text/plain", size: 11, text: "sample text", dataUrl: "data:text/plain;base64,c2FtcGxlIHRleHQ=" };
  const base = {};
  for (const f of fields || []) {
    if (f.type === "file") base[f.key] = FILE_SAMPLE;
    else if (f.default !== undefined && f.default !== "") base[f.key] = f.default;
    else if (f.type === "number" || f.type === "range") base[f.key] = f.min ?? 7;
    else if (f.type === "select") base[f.key] = (f.choices?.[0]?.value ?? f.choices?.[0]) ?? "";
    else if (f.type === "date") base[f.key] = "2020-01-15";
    else if (f.type === "toggle") base[f.key] = false;
    else base[f.key] = "sample text";
  }
  // A second variant to exercise different branches.
  const variant = { ...base };
  for (const f of fields || []) {
    if (f.type === "number" || f.type === "range") variant[f.key] = (f.max ?? 42);
    else if (f.type === "select" && f.choices?.length > 1) variant[f.key] = f.choices[1].value ?? f.choices[1];
    else if (f.type === "toggle") variant[f.key] = true;
  }
  // An adversarial / edge variant: empties, zero, negatives, and a long
  // repetitive string. The sandbox's 2s timeout turns a ReDoS/perf hang here
  // into a build-time rejection instead of a frozen user tab.
  const edge = { ...base };
  for (const f of fields || []) {
    if (f.type === "number" || f.type === "range") edge[f.key] = 0;
    else if (f.type === "text" || f.type === "textarea") edge[f.key] = "aaaaaaaaaaaaaaaaaaaa".repeat(50) + "! <>&";
  }
  return [base, variant, edge];
}
