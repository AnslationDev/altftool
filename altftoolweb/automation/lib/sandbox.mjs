// Safely evaluate a generated `compute` function in an isolated VM with an
// allow-listed set of globals. Used at BUILD time to prove a tool's logic runs
// before its code is ever written into the app. No network, no fs, no require.
import vm from "node:vm";
import { webcrypto } from "node:crypto";

const EXECUTION_TIMEOUT_MS = 2000;

// Never expose a host-realm function or object to generated code. A host
// callback's `.constructor` is the host Function constructor, which would let
// code escape a vm context even when string code generation is disabled.
// The bridge is visible only while context-native wrappers are created; those
// wrappers capture it privately and exchange primitives (strings/numbers).
function createHostBridge() {
  return Object.freeze({
    atob(value) {
      return Buffer.from(value, "base64").toString("binary");
    },
    btoa(value) {
      return Buffer.from(value, "binary").toString("base64");
    },
    decode(bytesJson) {
      return new TextDecoder().decode(Uint8Array.from(JSON.parse(bytesJson)));
    },
    async digest(algorithm, bytesJson) {
      const bytes = Uint8Array.from(JSON.parse(bytesJson));
      const result = await webcrypto.subtle.digest(algorithm, bytes);
      return JSON.stringify(Array.from(new Uint8Array(result)));
    },
    encode(value) {
      return JSON.stringify(Array.from(new TextEncoder().encode(value)));
    },
    randomBytes(length) {
      const bytes = new Uint8Array(length);
      webcrypto.getRandomValues(bytes);
      return JSON.stringify(Array.from(bytes));
    },
    randomUUID() {
      return webcrypto.randomUUID();
    },
  });
}

const CONTEXT_BOOTSTRAP = `
(() => {
  const bridge = globalThis.__hostBridge;
  const hostAtob = bridge.atob;
  const hostBtoa = bridge.btoa;
  const hostDecode = bridge.decode;
  const hostDigest = bridge.digest;
  const hostEncode = bridge.encode;
  const hostRandomBytes = bridge.randomBytes;
  const hostRandomUUID = bridge.randomUUID;
  delete globalThis.__hostBridge;

  const SafeArray = Array;
  const SafeArrayBuffer = ArrayBuffer;
  const SafeNumber = Number;
  const SafeString = String;
  const SafeTypeError = TypeError;
  const SafeUint8Array = Uint8Array;
  const isView = SafeArrayBuffer.isView.bind(SafeArrayBuffer);
  const parse = JSON.parse.bind(JSON);
  const stringify = JSON.stringify.bind(JSON);
  const imul = Math.imul.bind(Math);

  const hostError = (error) =>
    new SafeTypeError(SafeString(error && error.message ? error.message : error));

  const bytesToJson = (value) => {
    let bytes;
    if (value instanceof SafeArrayBuffer) {
      bytes = new SafeUint8Array(value);
    } else if (isView(value)) {
      bytes = new SafeUint8Array(value.buffer, value.byteOffset, value.byteLength);
    } else {
      bytes = SafeUint8Array.from(value || []);
    }
    const list = new SafeArray(bytes.length);
    for (let index = 0; index < bytes.length; index += 1) list[index] = bytes[index];
    return stringify(list);
  };

  class SandboxTextEncoder {
    encode(value = "") {
      try {
        return SafeUint8Array.from(parse(hostEncode(SafeString(value))));
      } catch (error) {
        throw hostError(error);
      }
    }
  }

  class SandboxTextDecoder {
    decode(value = new SafeUint8Array()) {
      try {
        return hostDecode(bytesToJson(value));
      } catch (error) {
        throw hostError(error);
      }
    }
  }

  const subtle = Object.freeze({
    async digest(algorithm, value) {
      try {
        const result = await hostDigest(SafeString(algorithm), bytesToJson(value));
        return SafeUint8Array.from(parse(result)).buffer;
      } catch (error) {
        throw hostError(error);
      }
    },
  });

  const safeCrypto = Object.freeze({
    subtle,
    getRandomValues(value) {
      if (!isView(value) || value instanceof DataView) {
        throw new SafeTypeError("Expected an integer TypedArray");
      }
      const bytes = new SafeUint8Array(value.buffer, value.byteOffset, value.byteLength);
      try {
        const generated = parse(hostRandomBytes(bytes.length));
        for (let index = 0; index < bytes.length; index += 1) bytes[index] = generated[index];
        return value;
      } catch (error) {
        throw hostError(error);
      }
    },
    randomUUID() {
      try {
        return hostRandomUUID();
      } catch (error) {
        throw hostError(error);
      }
    },
  });

  const safeAtob = (value) => {
    try {
      return hostAtob(SafeString(value));
    } catch (error) {
      throw hostError(error);
    }
  };
  const safeBtoa = (value) => {
    try {
      return hostBtoa(SafeString(value));
    } catch (error) {
      throw hostError(error);
    }
  };

  const executeCompute = async (compute, inputJson, mode, seed) => {
    if (typeof compute !== "function") throw new SafeTypeError("compute is not a function");
    const values = parse(inputJson);
    let state = SafeNumber(seed) >>> 0;
    const random = () => {
      state = (state + 0x6d2b79f5) >>> 0;
      let value = imul(state ^ (state >>> 15), 1 | state);
      value ^= value + imul(value ^ (value >>> 7), 61 | value);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
    const output = await compute(values, mode, random);
    return stringify({ output }, (_key, value) => {
      if (typeof value === "number" && !SafeNumber.isFinite(value)) return SafeString(value);
      if (typeof value === "bigint") return SafeString(value);
      return value;
    });
  };

  Object.defineProperties(globalThis, {
    TextDecoder: { value: SandboxTextDecoder },
    TextEncoder: { value: SandboxTextEncoder },
    __executeCompute: { value: executeCompute },
    atob: { value: safeAtob },
    btoa: { value: safeBtoa },
    console: {
      value: Object.freeze({ log() {}, warn() {}, error() {} }),
    },
    crypto: { value: safeCrypto },
  });
})();
`;

const INVOKE_COMPUTE = `
(() => {
  const compute = globalThis.__compute;
  const inputJson = globalThis.__inputJson;
  const mode = globalThis.__mode;
  const seed = globalThis.__seed;
  delete globalThis.__compute;
  delete globalThis.__inputJson;
  delete globalThis.__mode;
  delete globalThis.__seed;
  return globalThis.__executeCompute(compute, inputJson, mode, seed);
})()
`;

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

function createSandboxContext() {
  const sandbox = Object.create(null);
  Object.defineProperty(sandbox, "__hostBridge", {
    configurable: true,
    value: createHostBridge(),
  });
  const context = vm.createContext(sandbox, {
    codeGeneration: { strings: false, wasm: false },
    name: "altftool-compute-validation",
  });
  vm.runInContext(CONTEXT_BOOTSTRAP, context, {
    timeout: EXECUTION_TIMEOUT_MS,
  });
  return context;
}

async function executeCompute(src, values, mode = "") {
  const context = createSandboxContext();
  try {
    vm.runInContext(`globalThis.__compute = (${src});`, context, {
      timeout: EXECUTION_TIMEOUT_MS,
    });
  } catch (error) {
    return { ok: false, stage: "compile", error };
  }

  context.__inputJson = JSON.stringify(values);
  context.__mode = String(mode);
  context.__seed = 0;

  try {
    const pending = vm.runInContext(INVOKE_COMPUTE, context, {
      timeout: EXECUTION_TIMEOUT_MS,
    });
    const serialized = await withTimeout(
      Promise.resolve(pending),
      EXECUTION_TIMEOUT_MS,
    );
    const envelope = JSON.parse(serialized);
    return { ok: true, output: envelope.output };
  } catch (error) {
    return { ok: false, stage: "runtime", error };
  }
}

/**
 * Run compute against several input sets. Returns { ok, error, samples }.
 * sampleValues: array of raw value objects (strings ok, we coerce).
 */
export async function runCompute(computeSrc, fields, sampleValues, mode = "") {
  const src = normalizeComputeSource(computeSrc);
  const samples = [];
  for (const raw of sampleValues) {
    const executed = await executeCompute(src, coerce(fields, raw), mode);
    if (!executed.ok) {
      const message = executed.error?.message || executed.error;
      return {
        ok: false,
        error: `${executed.stage}: ${message} on ${JSON.stringify(raw)}`,
        samples,
      };
    }
    const out = executed.output;
    if (
      out == null ||
      (typeof out === "object" &&
        out.result === undefined &&
        !out.list &&
        !out.rows &&
        !out.table)
    ) {
      return {
        ok: false,
        error: "compute returned no usable result for " + JSON.stringify(raw),
        samples,
      };
    }
    const preview =
      typeof out === "object"
        ? (out.result ?? (out.list || []).join(", "))
        : String(out);
    samples.push({ values: raw, preview: String(preview).slice(0, 60) });
  }
  return { ok: true, error: "", samples };
}

// Run compute ONCE and return the FULL result object (for invariant checks).
export async function runOnce(computeSrc, fields, rawValues, mode = "") {
  const src = normalizeComputeSource(computeSrc);
  const executed = await executeCompute(src, coerce(fields, rawValues), mode);
  if (executed.ok) return { ok: true, output: executed.output };
  return {
    ok: false,
    error: `${executed.stage}: ${executed.error?.message || executed.error}`,
  };
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
