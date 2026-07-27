/**
 * NDJSON (newline-delimited JSON, also called JSON Lines) ↔ JSON array conversion.
 *
 * Format rules applied (ndjson spec / jsonlines.org):
 *  - Each line is one complete JSON value (RFC 8259); lines are separated by \n,
 *    and a trailing \r (from CRLF files) is stripped before parsing.
 *  - A JSON value in NDJSON must not contain a literal newline, so when writing
 *    NDJSON every value is serialised minified on a single line.
 *  - Empty lines are not values. Many producers end the file with a trailing
 *    newline, so blank lines are skipped and counted rather than treated as errors.
 *  - The whole-file equivalent of an NDJSON stream is a JSON ARRAY of its lines,
 *    which is exactly what jq -s (slurp) produces; converting back unwraps the
 *    array one element per line.
 */

/** Output indentation choices for the JSON-array direction. */
export const INDENT_OPTIONS = [
  { id: "2", label: "2 spaces", indent: 2 },
  { id: "4", label: "4 spaces", indent: 4 },
  { id: "min", label: "Minified", indent: 0 },
];

export const DEFAULT_NDJSON = `{"ts":"2026-07-27T10:00:00Z","level":"info","msg":"service started"}
{"ts":"2026-07-27T10:00:04Z","level":"warn","msg":"slow query","ms":1840}
{"ts":"2026-07-27T10:00:09Z","level":"error","msg":"upstream timeout","code":504}
`;

export const DEFAULT_JSON_ARRAY = `[
  { "id": 1, "name": "Ada" },
  { "id": 2, "name": "Grace" },
  { "id": 3, "name": "Edsger" }
]
`;

/**
 * NDJSON → JSON array.
 *
 * @param {object} input
 * @param {string} input.ndjsonText NDJSON source, one JSON value per line.
 * @param {string} [input.indentId] One of INDENT_OPTIONS ids.
 * @returns {object} { json, records, blankLines, warnings } or { error }.
 */
export function convertNdjsonToJson({ ndjsonText, indentId = "2" }) {
  const source = String(ndjsonText ?? "");
  if (source.trim() === "") return { error: "Paste some NDJSON to convert." };

  const option = INDENT_OPTIONS.find((entry) => entry.id === indentId) ?? INDENT_OPTIONS[0];
  const lines = source.split("\n");
  const values = [];
  let blankLines = 0;

  for (let index = 0; index < lines.length; index += 1) {
    // CRLF files leave a \r at the end of each line; the ndjson spec says to ignore it.
    const line = lines[index].endsWith("\r") ? lines[index].slice(0, -1) : lines[index];
    if (line.trim() === "") {
      blankLines += 1;
      continue;
    }
    try {
      values.push(JSON.parse(line));
    } catch (caught) {
      return {
        error: `Line ${index + 1} is not valid JSON: ${caught.message}. NDJSON requires one complete JSON value per line — a value split across lines (pretty-printed JSON) is not NDJSON.`,
      };
    }
  }

  if (values.length === 0) return { error: "No JSON values found — every line was blank." };

  const json =
    option.indent === 0 ? JSON.stringify(values) : JSON.stringify(values, null, option.indent);

  const warnings = [];
  // A trailing newline produces exactly one blank "line"; only extra blanks are notable.
  if (blankLines > 1) warnings.push(`${blankLines} blank line(s) were skipped.`);

  return {
    json,
    records: values.length,
    blankLines,
    inputChars: source.length,
    outputChars: json.length,
    warnings,
  };
}

/**
 * JSON array → NDJSON.
 *
 * @param {object} input
 * @param {string} input.jsonText JSON source whose top level is an array.
 * @returns {object} { ndjson, records, warnings } or { error }.
 */
export function convertJsonToNdjson({ jsonText }) {
  const source = String(jsonText ?? "");
  if (source.trim() === "") return { error: "Paste a JSON array to convert." };

  let data;
  try {
    data = JSON.parse(source);
  } catch (caught) {
    return { error: `Invalid JSON: ${caught.message}` };
  }

  if (!Array.isArray(data)) {
    return {
      error:
        "The top level must be a JSON array — NDJSON is the array's elements written one per line. Wrap a single object in [ ] first.",
    };
  }
  if (data.length === 0) return { error: "The array is empty — there are no records to write." };

  // Minified per line: an NDJSON value may not contain a literal newline.
  const ndjson = data.map((value) => JSON.stringify(value)).join("\n") + "\n";

  return {
    ndjson,
    records: data.length,
    inputChars: source.length,
    outputChars: ndjson.length,
    warnings: [],
  };
}
