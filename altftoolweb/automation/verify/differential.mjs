// ============================================================================
// verify/differential.mjs — run the generated compute AND a trusted reference
// (Node's own crypto/zlib/Buffer) on the same input; they must agree.
// Real ground truth, nothing to install. Covers the algorithm families where a
// wrong implementation would otherwise pass the sandbox (e.g. Base32→btoa).
// ============================================================================
import crypto from "node:crypto";
import zlib from "node:zlib";
import { runOnce, buildSampleInputs } from "../lib/sandbox.mjs";

const TEXT = "The quick brown fox 123";

// reference implementations keyed by a name-detector
// trusted RFC-4648 Base32 reference (Node has no built-in) — catches the
// classic "Base32 implemented with btoa (Base64)" bug that round-trip misses.
function base32ref(t) {
  const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (let i = 0; i < t.length; i++) bits += t.charCodeAt(i).toString(2).padStart(8, "0");
  let out = "";
  for (let i = 0; i < bits.length; i += 5) out += A[parseInt(bits.substr(i, 5).padEnd(5, "0"), 2)];
  while (out.length % 8) out += "=";
  return out;
}

const REFS = [
  { id: "sha256", match: /sha-?256/i, ref: (t) => crypto.createHash("sha256").update(t).digest("hex") },
  { id: "sha1", match: /sha-?1\b/i, ref: (t) => crypto.createHash("sha1").update(t).digest("hex") },
  { id: "sha512", match: /sha-?512/i, ref: (t) => crypto.createHash("sha512").update(t).digest("hex") },
  { id: "md5", match: /\bmd5\b/i, ref: (t) => crypto.createHash("md5").update(t).digest("hex") },
  { id: "crc32", match: /crc-?32/i, ref: (t) => (zlib.crc32 ? "0x" + (zlib.crc32(t) >>> 0).toString(16).padStart(8, "0") : null) },
  { id: "base32", match: /base-?32/i, ref: (t) => base32ref(t) },
  { id: "base64", match: /base-?64/i, ref: (t) => Buffer.from(t, "utf8").toString("base64") },
];

const asText = (o) => (o && typeof o === "object" ? String(o.result ?? "") : String(o ?? ""));

// Returns a single check result or null if no reference applies.
export async function checkDifferential(spec) {
  const hay = `${spec.title} ${spec.slug}`;
  const r = REFS.find((x) => x.match.test(hay));
  if (!r) return null;
  const expected = r.ref(TEXT);
  if (expected == null) return null; // reference unavailable (e.g. old node)

  const tf = (spec.fields || []).find((x) => x.type === "textarea" || x.type === "text");
  if (!tf) return null;
  const [base] = buildSampleInputs(spec.fields);
  // force encode mode if present
  const values = { ...base, [tf.key]: TEXT };
  const modeField = (spec.fields || []).find((x) => x.type === "select" && /mode/i.test(x.key));
  if (modeField) values[modeField.key] = (modeField.choices.find((c) => /enc|to /i.test(c.label || c.value))?.value) ?? modeField.default;

  const out = await runOnce(String(spec.compute), spec.fields, values, spec.modes?.[0]?.id || "");
  const got = out.ok ? asText(out.output).toLowerCase() : "(error)";
  const want = String(expected).toLowerCase();
  const pass = got.includes(want) || want.includes(got);
  return { name: "differential:" + r.id, pass, detail: pass ? "" : `got "${got.slice(0, 24)}" vs ref "${want.slice(0, 24)}"` };
}
