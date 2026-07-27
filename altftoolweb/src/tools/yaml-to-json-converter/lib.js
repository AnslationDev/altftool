/**
 * YAML → JSON conversion on top of js-yaml v4.
 *
 * Standards applied:
 *  - YAML 1.2 (js-yaml's DEFAULT_SCHEMA is the YAML 1.2 core schema): anchors (&) and
 *    aliases (*) are resolved during load, merge keys (<<) are applied, and duplicate
 *    mapping keys raise an error as the spec requires a mapping's keys to be unique.
 *  - A YAML *stream* may contain multiple documents separated by `---` (YAML 1.2 §9.1.4);
 *    loadAll() parses them all, and the output becomes a JSON array of documents.
 *  - JSON (RFC 8259) has no NaN/Infinity and no recursion, so YAML values JSON cannot
 *    represent are reported as errors instead of being emitted as invalid JSON.
 */

import { loadAll, YAMLException } from "js-yaml";

/** Output indentation choices. 2 spaces is the npm/prettier default for JSON. */
export const INDENT_OPTIONS = [
  { id: "2", label: "2 spaces", indent: 2 },
  { id: "4", label: "4 spaces", indent: 4 },
  { id: "tab", label: "Tabs", indent: "\t" },
  { id: "min", label: "Minified", indent: 0 },
];

export const DEFAULT_YAML = `# Anchors are resolved during conversion
defaults: &defaults
  adapter: postgres
  host: localhost
  port: 5432

development:
  <<: *defaults
  database: app_dev

production:
  <<: *defaults
  host: db.internal
  database: app
`;

/** Depth-first check for structures JSON cannot serialise (recursive aliases). */
function findRecursion(value, seen) {
  if (value === null || typeof value !== "object") return false;
  if (seen.has(value)) return true;
  seen.add(value);
  const children = Array.isArray(value) ? value : Object.values(value);
  for (const child of children) {
    if (findRecursion(child, seen)) return true;
  }
  seen.delete(value);
  return false;
}

/** Replace values RFC 8259 JSON cannot express, counting each substitution. */
function jsonSafe(value, stats) {
  if (typeof value === "number" && !Number.isFinite(value)) {
    stats.nonFinite += 1;
    return null;
  }
  if (value === undefined) return null;
  if (Array.isArray(value)) return value.map((entry) => jsonSafe(entry, stats));
  if (value !== null && typeof value === "object") {
    const out = {};
    for (const [key, entry] of Object.entries(value)) out[key] = jsonSafe(entry, stats);
    return out;
  }
  return value;
}

/**
 * Convert YAML text to formatted JSON.
 *
 * @param {object} input
 * @param {string} input.yamlText  The YAML source.
 * @param {string} [input.indentId] One of INDENT_OPTIONS ids.
 * @returns {object} { json, documents, warnings } or { error }.
 */
export function convertYamlToJson({ yamlText, indentId = "2" }) {
  const source = String(yamlText ?? "");
  if (source.trim() === "") return { error: "Paste some YAML to convert." };

  const option = INDENT_OPTIONS.find((entry) => entry.id === indentId) ?? INDENT_OPTIONS[0];

  let documents;
  try {
    documents = loadAll(source);
  } catch (caught) {
    if (caught instanceof YAMLException) {
      const mark = caught.mark
        ? ` (line ${caught.mark.line + 1}, column ${caught.mark.column + 1})`
        : "";
      return { error: `YAML parse error${mark}: ${caught.reason || caught.message}` };
    }
    return { error: "The YAML could not be parsed." };
  }

  // loadAll on an empty document stream yields [undefined]; normalise to null docs.
  const normalised = documents.map((doc) => (doc === undefined ? null : doc));
  if (normalised.length === 0) return { error: "The input contains no YAML documents." };

  for (const doc of normalised) {
    if (findRecursion(doc, new Set())) {
      return {
        error:
          "The YAML contains a recursive alias (an anchor that refers to itself). JSON cannot represent recursion.",
      };
    }
  }

  const stats = { nonFinite: 0 };
  const safeDocs = normalised.map((doc) => jsonSafe(doc, stats));
  const payload = safeDocs.length === 1 ? safeDocs[0] : safeDocs;
  const json =
    option.indent === 0 ? JSON.stringify(payload) : JSON.stringify(payload, null, option.indent);

  const warnings = [];
  if (safeDocs.length > 1) {
    warnings.push(
      `The stream holds ${safeDocs.length} documents (separated by ---); they were emitted as one JSON array.`,
    );
  }
  if (stats.nonFinite > 0) {
    warnings.push(
      `${stats.nonFinite} value(s) of .inf/.nan were replaced with null — RFC 8259 JSON has no Infinity or NaN.`,
    );
  }

  return {
    json,
    documents: safeDocs.length,
    inputChars: source.length,
    outputChars: json.length,
    warnings,
  };
}
