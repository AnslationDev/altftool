/**
 * YAML Formatter — pure logic.
 *
 * Parsing and re-emitting are done with js-yaml (already a dependency) pinned to
 * the YAML 1.2 **core schema**. The core schema is the one defined in the YAML
 * 1.2 spec (§10.2): it resolves only null / bool / int / float / str. It does
 * NOT resolve the YAML 1.1 extras (`!!timestamp`, `!!binary`, `yes`/`no`/`on`/
 * `off` as booleans, sexagesimals), which is why `d: 2024-01-01` stays a string
 * and `enabled: no` stays the string "no". Fixing the schema keeps this module
 * pure: no Date objects, no timezone dependence, same input -> same output.
 */

import { CORE_SCHEMA, load, loadAll, dump, YAMLException } from "js-yaml";

/**
 * Indent widths offered. The YAML 1.2 spec only requires "one or more spaces"
 * for a block-level indent, but 2 spaces is the de-facto convention used by
 * Kubernetes manifests, Ansible playbooks and GitHub Actions workflows.
 */
export const INDENT_OPTIONS = [2, 4];

/** js-yaml's own default fold width for emitted scalars. */
export const DEFAULT_LINE_WIDTH = 80;

/** js-yaml treats a negative lineWidth as "never fold a long line". */
export const UNLIMITED_LINE_WIDTH = -1;

/** Line widths offered in the UI. */
export const LINE_WIDTH_OPTIONS = [80, 120, UNLIMITED_LINE_WIDTH];

/**
 * Input cap. 200 000 characters is roughly a 200 KB manifest — well past any
 * hand-written config, and it keeps a synchronous parse off the main thread's
 * budget on a mid-range phone.
 */
export const MAX_INPUT_CHARS = 200000;

/** Separator that starts every YAML document after the first (spec §9.1.2). */
export const DOCUMENT_SEPARATOR = "---";

/** How many characters of a scalar are shown in the key list preview. */
export const PREVIEW_LENGTH = 48;

/** Root mapping keys sit at depth 1. */
const ROOT_DEPTH = 1;

const textEncoder = typeof TextEncoder === "function" ? new TextEncoder() : null;

/** UTF-8 byte length of a string, without needing a DOM or Buffer. */
export function byteLength(text) {
  const value = String(text == null ? "" : text);
  if (textEncoder) return textEncoder.encode(value).length;
  // Fallback: count UTF-8 code units by code point.
  let bytes = 0;
  for (const char of value) {
    const cp = char.codePointAt(0);
    if (cp < 0x80) bytes += 1;
    else if (cp < 0x800) bytes += 2;
    else if (cp < 0x10000) bytes += 3;
    else bytes += 4;
  }
  return bytes;
}

/** YAML/JSON type name for a parsed value. */
export function describeType(value) {
  if (value === null || value === undefined) return "null";
  if (Array.isArray(value)) return "sequence";
  const type = typeof value;
  if (type === "object") return "mapping";
  if (type === "number") return "number";
  if (type === "boolean") return "boolean";
  return "string";
}

/** Short, single-line preview of a scalar for the key table. */
export function previewValue(value) {
  const type = describeType(value);
  if (type === "mapping") return `{${Object.keys(value).length} keys}`;
  if (type === "sequence") return `[${value.length} items]`;
  if (type === "null") return "null";
  const text = String(value).replace(/\s+/g, " ").trim();
  if (text.length <= PREVIEW_LENGTH) return text;
  return `${text.slice(0, PREVIEW_LENGTH - 1)}…`;
}

/**
 * A key path segment is written bare when it is a plain identifier and
 * bracket-quoted otherwise, matching the dotted-path convention used by
 * `yq`, JSONPath and most config linters.
 */
const BARE_KEY_RE = /^[A-Za-z_][A-Za-z0-9_-]*$/;

export function joinKeyPath(prefix, key) {
  const safe = BARE_KEY_RE.test(key) ? key : `["${String(key).replace(/"/g, '\\"')}"]`;
  if (!prefix) return BARE_KEY_RE.test(key) ? key : safe;
  return BARE_KEY_RE.test(key) ? `${prefix}.${key}` : `${prefix}${safe}`;
}

/**
 * Walk a parsed document and return every mapping key as a dotted path.
 * Sequence entries are addressed by index (`items[0].name`) but the index
 * itself is not reported as a key — only mapping keys are.
 */
export function flattenKeys(value, prefix = "", depth = ROOT_DEPTH, out = []) {
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      flattenKeys(value[index], `${prefix}[${index}]`, depth, out);
    }
    return out;
  }
  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) {
      const child = value[key];
      const path = joinKeyPath(prefix, key);
      out.push({ path, key, depth, type: describeType(child), preview: previewValue(child) });
      flattenKeys(child, path, depth + 1, out);
    }
  }
  return out;
}

function isContainer(value) {
  return Array.isArray(value) || (value !== null && typeof value === "object");
}

/**
 * Deepest nesting level reached, counting containers only: the root mapping is
 * level 1, a mapping or sequence inside it is level 2, and so on. A document
 * that is a bare scalar has depth 0.
 */
export function measureDepth(value, depth = ROOT_DEPTH) {
  if (!isContainer(value)) return depth - 1;
  const children = Array.isArray(value) ? value : Object.keys(value).map((key) => value[key]);
  return children.reduce((max, child) => Math.max(max, measureDepth(child, depth + 1)), depth);
}

/** Turn a js-yaml exception into a plain-language, line-numbered message. */
function toReadableError(err) {
  if (err instanceof YAMLException || (err && err.name === "YAMLException")) {
    const reason = err.reason || "the document could not be parsed";
    const line = err.mark && Number.isInteger(err.mark.line) ? err.mark.line + 1 : null;
    const column = err.mark && Number.isInteger(err.mark.column) ? err.mark.column + 1 : null;
    if (line !== null && column !== null) {
      return { error: `Invalid YAML on line ${line}, column ${column}: ${reason}.` };
    }
    return { error: `Invalid YAML: ${reason}.` };
  }
  return { error: "That input could not be parsed as YAML." };
}

function guardInput(text) {
  const value = String(text == null ? "" : text);
  if (value.trim() === "") return { error: "Paste some YAML to format." };
  if (value.length > MAX_INPUT_CHARS) {
    return {
      error: `Input is ${value.length.toLocaleString("en-US")} characters — the limit is ${MAX_INPUT_CHARS.toLocaleString("en-US")}.`,
    };
  }
  return { value };
}

/**
 * Parse every document in a YAML stream (documents separated by `---`).
 * Returns { documents } or { error }. Duplicate mapping keys are an error,
 * which is js-yaml's default and matches the YAML spec: a mapping's keys
 * must be unique.
 */
export function parseYaml(text) {
  const guard = guardInput(text);
  if (guard.error) return guard;
  try {
    const documents = [];
    loadAll(guard.value, (doc) => documents.push(doc === undefined ? null : doc), {
      schema: CORE_SCHEMA,
    });
    if (documents.length === 0) return { error: "No YAML document found in that input." };
    return { documents };
  } catch (err) {
    return toReadableError(err);
  }
}

function normaliseIndent(indent) {
  const value = Number(indent);
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < 1 || value > 8) {
    return INDENT_OPTIONS[0];
  }
  return value;
}

function normaliseLineWidth(lineWidth) {
  const value = Number(lineWidth);
  if (!Number.isFinite(value)) return DEFAULT_LINE_WIDTH;
  if (value < 0) return UNLIMITED_LINE_WIDTH;
  if (value < 20) return 20;
  return Math.trunc(value);
}

/**
 * Format a YAML stream: parse it, then re-emit it with consistent indentation.
 *
 * Options:
 *   indent      spaces per nesting level (default 2)
 *   sortKeys    alphabetise mapping keys (default false)
 *   lineWidth   fold long scalars at this column, -1 to never fold
 *   forceQuotes quote every scalar, so `no`, `1.0` and `null` cannot be
 *               re-read as a non-string by a YAML 1.1 parser
 *
 * Returns { output, json, keys, stats } or { error }.
 */
export function formatYaml(text, options = {}) {
  const parsed = parseYaml(text);
  if (parsed.error) return parsed;

  const indent = normaliseIndent(options.indent);
  const lineWidth = normaliseLineWidth(options.lineWidth);
  const sortKeys = Boolean(options.sortKeys);
  const forceQuotes = Boolean(options.forceQuotes);

  let output;
  try {
    output = parsed.documents
      .map((doc) =>
        dump(doc, {
          schema: CORE_SCHEMA,
          indent,
          lineWidth,
          sortKeys,
          forceQuotes,
          noRefs: true, // expand anchors/aliases so the output stands alone
        }),
      )
      .join(`${DOCUMENT_SEPARATOR}\n`);
  } catch (err) {
    return toReadableError(err);
  }

  const keys = parsed.documents.flatMap((doc) => flattenKeys(doc));
  const maxDepth = parsed.documents.reduce(
    (max, doc) => Math.max(max, measureDepth(doc)),
    0,
  );
  const inputText = String(text);
  const uniqueKeys = new Set(keys.map((entry) => entry.key));

  let json;
  try {
    const jsonValue = parsed.documents.length === 1 ? parsed.documents[0] : parsed.documents;
    json = JSON.stringify(jsonValue, null, indent);
  } catch {
    return { error: "The document contains a structure that cannot be written as JSON." };
  }

  return {
    output,
    json: json === undefined ? "null" : json,
    keys,
    stats: {
      documents: parsed.documents.length,
      keyCount: keys.length,
      uniqueKeyCount: uniqueKeys.size,
      maxDepth,
      inputLines: inputText.split("\n").length,
      outputLines: output.split("\n").length,
      inputBytes: byteLength(inputText),
      outputBytes: byteLength(output),
    },
  };
}

/** Convert a YAML stream to JSON text. Returns { json } or { error }. */
export function yamlToJson(text, options = {}) {
  const result = formatYaml(text, options);
  if (result.error) return { error: result.error };
  return { json: result.json };
}

/** Convert JSON text to YAML. Returns { yaml } or { error }. */
export function jsonToYaml(text, options = {}) {
  const guard = guardInput(text);
  if (guard.error) return { error: "Paste some JSON to convert." };
  let value;
  try {
    value = JSON.parse(guard.value);
  } catch (err) {
    return { error: `Invalid JSON: ${err && err.message ? err.message : "could not parse"}.` };
  }
  try {
    return {
      yaml: dump(value, {
        schema: CORE_SCHEMA,
        indent: normaliseIndent(options.indent),
        lineWidth: normaliseLineWidth(options.lineWidth),
        sortKeys: Boolean(options.sortKeys),
        noRefs: true,
      }),
    };
  } catch (err) {
    return toReadableError(err);
  }
}

/**
 * Validate only — cheaper than formatting when all the caller wants is a
 * pass/fail badge. Returns { valid: true, documents } or { valid: false, error }.
 */
export function validateYaml(text) {
  const parsed = parseYaml(text);
  if (parsed.error) return { valid: false, error: parsed.error };
  return { valid: true, documents: parsed.documents.length };
}

/** Parse a single-document YAML string; multi-document input is an error. */
export function parseSingleDocument(text) {
  const guard = guardInput(text);
  if (guard.error) return guard;
  try {
    const value = load(guard.value, { schema: CORE_SCHEMA });
    return { value: value === undefined ? null : value };
  } catch (err) {
    return toReadableError(err);
  }
}

export const SAMPLE_YAML = `# Deployment settings
name: checkout-api
replicas: 3
image:
  repository: registry.example.com/checkout
  tag: "1.4.2"
env:
  - name: LOG_LEVEL
    value: info
  - name: TIMEOUT_MS
    value: "2500"
featureFlags:
  newPricing: true
  legacyCheckout: false
`;
