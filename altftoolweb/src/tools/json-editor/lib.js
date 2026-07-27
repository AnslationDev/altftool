/**
 * JSON Editor — validate, format, minify, sort, flatten and export JSON.
 *
 * Parsing uses the engine's own `JSON.parse` (ECMA-404 / RFC 8259), so what
 * validates here is exactly what will validate in your application. The extra
 * work this module does is turning a parser error into a line and column,
 * walking the parsed value for structure statistics, and re-serialising it in
 * the shapes people actually need (pretty, minified, key-sorted, dot-path
 * flattened, RFC 4180 CSV).
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Indent choices for pretty-printing. `JSON.stringify` caps indent at 10. */
export const INDENT_PRESETS = [
  { id: "2", label: "2 spaces", value: 2 },
  { id: "4", label: "4 spaces", value: 4 },
  { id: "tab", label: "Tab", value: "\t" },
];

/** Guard against pasting a whole database dump into a text box (2 MB). */
export const MAX_INPUT_CHARS = 2000000;

/** RFC 4180 §2: a field must be quoted if it contains a comma, quote or CRLF. */
const CSV_MUST_QUOTE = /[",\r\n]/;

/**
 * Convert a character offset in the source into a 1-based line and column.
 *
 * @param {string} source
 * @param {number} offset
 * @returns {{ line: number, column: number }}
 */
export function offsetToLineColumn(source, offset) {
  if (typeof source !== "string" || !Number.isFinite(offset) || offset < 0) {
    return { line: 1, column: 1 };
  }
  const clamped = Math.min(offset, source.length);
  const before = source.slice(0, clamped);
  const line = before.split("\n").length;
  const lastBreak = before.lastIndexOf("\n");
  return { line, column: clamped - lastBreak };
}

/**
 * Hand-rolled RFC 8259 scanner.
 *
 * `JSON.parse` decides validity, but modern V8 no longer reports a character
 * offset in its error message, so this walker exists to say exactly where the
 * document broke — and, as a bonus, to spot duplicate object keys, which
 * `JSON.parse` silently collapses to the last occurrence.
 *
 * @param {string} source
 * @returns {{ ok: true, duplicateKeys: string[] } | { ok: false, position: number, message: string }}
 */
export function scanJson(source) {
  let index = 0;
  const duplicateKeys = [];
  const length = source.length;

  const fail = (message, position = index) => ({ ok: false, position, message });

  const skipWhitespace = () => {
    // RFC 8259 §2 allows only space, tab, LF and CR between tokens.
    while (index < length && (source[index] === " " || source[index] === "\t" || source[index] === "\n" || source[index] === "\r")) {
      index += 1;
    }
  };

  const readString = () => {
    if (source[index] !== '"') return fail("Expected a string in double quotes here.");
    const start = index;
    index += 1;
    while (index < length) {
      const char = source[index];
      if (char === '"') {
        index += 1;
        return { ok: true, value: source.slice(start + 1, index - 1) };
      }
      if (char === "\\") {
        const escape = source[index + 1];
        if (escape === undefined) return fail("The string ends in the middle of an escape.", index);
        if (!'"\\/bfnrtu'.includes(escape)) {
          return fail(`\\${escape} is not a valid JSON escape sequence.`, index);
        }
        if (escape === "u") {
          const hex = source.slice(index + 2, index + 6);
          if (!/^[0-9a-fA-F]{4}$/.test(hex)) {
            return fail("A \\u escape needs exactly four hexadecimal digits.", index);
          }
          index += 6;
          continue;
        }
        index += 2;
        continue;
      }
      if (char < " ") {
        return fail("A raw control character is not allowed inside a JSON string — escape it.", index);
      }
      index += 1;
    }
    return fail("This string is never closed.", start);
  };

  const readNumber = () => {
    const start = index;
    if (source[index] === "-") index += 1;
    if (source[index] === "0") index += 1;
    else if (/[1-9]/.test(source[index] ?? "")) {
      while (/[0-9]/.test(source[index] ?? "")) index += 1;
    } else return fail("Expected a digit here.", start);

    if (source[index] === ".") {
      index += 1;
      if (!/[0-9]/.test(source[index] ?? "")) return fail("A decimal point must be followed by a digit.", index);
      while (/[0-9]/.test(source[index] ?? "")) index += 1;
    }
    if (source[index] === "e" || source[index] === "E") {
      index += 1;
      if (source[index] === "+" || source[index] === "-") index += 1;
      if (!/[0-9]/.test(source[index] ?? "")) return fail("The exponent needs at least one digit.", index);
      while (/[0-9]/.test(source[index] ?? "")) index += 1;
    }
    return { ok: true };
  };

  const readValue = () => {
    skipWhitespace();
    if (index >= length) return fail("The document ends where a value was expected.", length);
    const char = source[index];

    if (char === "{") {
      index += 1;
      const seen = new Set();
      skipWhitespace();
      if (source[index] === "}") {
        index += 1;
        return { ok: true };
      }
      for (;;) {
        skipWhitespace();
        const key = readString();
        if (!key.ok) return key;
        if (seen.has(key.value)) duplicateKeys.push(key.value);
        seen.add(key.value);
        skipWhitespace();
        if (source[index] !== ":") return fail('Expected ":" after the property name.');
        index += 1;
        const value = readValue();
        if (!value.ok) return value;
        skipWhitespace();
        if (source[index] === ",") {
          index += 1;
          skipWhitespace();
          if (source[index] === "}") return fail("Trailing comma — JSON does not allow one before }.");
          continue;
        }
        if (source[index] === "}") {
          index += 1;
          return { ok: true };
        }
        return fail('Expected "," or "}" here.');
      }
    }

    if (char === "[") {
      index += 1;
      skipWhitespace();
      if (source[index] === "]") {
        index += 1;
        return { ok: true };
      }
      for (;;) {
        const value = readValue();
        if (!value.ok) return value;
        skipWhitespace();
        if (source[index] === ",") {
          index += 1;
          skipWhitespace();
          if (source[index] === "]") return fail("Trailing comma — JSON does not allow one before ].");
          continue;
        }
        if (source[index] === "]") {
          index += 1;
          return { ok: true };
        }
        return fail('Expected "," or "]" here.');
      }
    }

    if (char === '"') return readString();
    if (char === "-" || /[0-9]/.test(char)) return readNumber();
    if (source.startsWith("true", index)) {
      index += 4;
      return { ok: true };
    }
    if (source.startsWith("false", index)) {
      index += 5;
      return { ok: true };
    }
    if (source.startsWith("null", index)) {
      index += 4;
      return { ok: true };
    }
    if (char === "'") return fail("JSON strings use double quotes, not single quotes.");
    return fail(`Unexpected character "${char}" where a value was expected.`);
  };

  const root = readValue();
  if (!root.ok) return root;
  skipWhitespace();
  if (index < length) return fail("Extra content after the end of the JSON value.", index);
  return { ok: true, duplicateKeys };
}

/**
 * Parse JSON and, on failure, say where it broke.
 *
 * @param {string} source
 * @returns {{ valid: true, value: unknown, duplicateKeys: string[] } | { valid: false, error: string, line: number, column: number }}
 */
export function validateJson(source) {
  if (typeof source !== "string" || source.trim() === "") {
    return { valid: false, error: "Paste some JSON to check.", line: 1, column: 1 };
  }
  if (source.length > MAX_INPUT_CHARS) {
    return {
      valid: false,
      error: `Keep the document under ${MAX_INPUT_CHARS.toLocaleString("en-US")} characters.`,
      line: 1,
      column: 1,
    };
  }

  const scan = scanJson(source);
  if (!scan.ok) {
    const spot = offsetToLineColumn(source, scan.position);
    return { valid: false, error: scan.message, line: spot.line, column: spot.column };
  }

  try {
    return { valid: true, value: JSON.parse(source), duplicateKeys: scan.duplicateKeys };
  } catch (error) {
    // The scanner passed but the engine disagreed — report the engine verbatim.
    return {
      valid: false,
      error: String(error && error.message ? error.message : "Invalid JSON."),
      line: 1,
      column: 1,
    };
  }
}

/**
 * Pretty-print JSON.
 *
 * @param {string} source
 * @param {{ indent?: number|string, sortKeys?: boolean }} [options]
 * @returns {{ code: string, characters: number, lines: number } | { error: string, line?: number, column?: number }}
 */
export function formatJson(source, options = {}) {
  const parsed = validateJson(source);
  if (!parsed.valid) return { error: parsed.error, line: parsed.line, column: parsed.column };

  const indent = options.indent === undefined ? 2 : options.indent;
  const value = options.sortKeys ? sortKeysDeep(parsed.value) : parsed.value;
  const code = JSON.stringify(value, null, indent);
  return { code, characters: code.length, lines: code.split("\n").length };
}

/**
 * Strip every byte of insignificant whitespace.
 *
 * @param {string} source
 * @returns {{ code: string, originalChars: number, minifiedChars: number, savedChars: number, savedPercent: number } | { error: string }}
 */
export function minifyJson(source) {
  const parsed = validateJson(source);
  if (!parsed.valid) return { error: parsed.error, line: parsed.line, column: parsed.column };

  const code = JSON.stringify(parsed.value);
  const originalChars = source.length;
  const minifiedChars = code.length;
  const savedChars = originalChars - minifiedChars;
  return {
    code,
    originalChars,
    minifiedChars,
    savedChars,
    savedPercent: originalChars === 0 ? 0 : (savedChars / originalChars) * 100,
  };
}

/**
 * Recursively sort object keys with the default lexicographic (UTF-16 code
 * unit) order. Arrays keep their order — order is meaningful in an array.
 *
 * @param {unknown} value
 * @returns {unknown}
 */
export function sortKeysDeep(value) {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === "object") {
    const sorted = {};
    for (const key of Object.keys(value).sort()) sorted[key] = sortKeysDeep(value[key]);
    return sorted;
  }
  return value;
}

/**
 * Flatten nested structures into dot/bracket paths, the form used by config
 * loaders and i18n files: `user.address.city`, `items[0].sku`.
 *
 * @param {unknown} value
 * @param {string} [prefix]
 * @returns {Record<string, unknown>}
 */
export function flattenJson(value, prefix = "") {
  const output = {};

  const walk = (node, path) => {
    if (Array.isArray(node)) {
      if (node.length === 0) {
        output[path || "[]"] = [];
        return;
      }
      node.forEach((item, index) => walk(item, `${path}[${index}]`));
      return;
    }
    if (node && typeof node === "object") {
      const keys = Object.keys(node);
      if (keys.length === 0) {
        output[path || "{}"] = {};
        return;
      }
      for (const key of keys) walk(node[key], path ? `${path}.${key}` : key);
      return;
    }
    output[path || "value"] = node;
  };

  walk(value, prefix);
  return output;
}

/**
 * Flattened value rendered one `path = value` per line, the form you can paste
 * into a diff or a `.env`-style review.
 *
 * @param {unknown} value
 * @param {{ sort?: boolean }} [options]
 * @returns {{ code: string, paths: number }}
 */
export function flattenToLines(value, options = {}) {
  const flat = flattenJson(value);
  const lines = Object.entries(flat).map(([path, item]) => `${path} = ${JSON.stringify(item)}`);
  const ordered = options.sort ? [...lines].sort() : lines;
  return { code: ordered.join("\n"), paths: ordered.length };
}

/** Quote one CSV field per RFC 4180 §2. */
export function csvField(value) {
  if (value === null || value === undefined) return "";
  const text = typeof value === "object" ? JSON.stringify(value) : String(value);
  if (!CSV_MUST_QUOTE.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

/**
 * Convert an array of objects into CSV. Columns are the union of every row's
 * keys, in first-seen order, so a row missing a field yields an empty cell.
 *
 * @param {unknown} value parsed JSON — must be an array of objects
 * @returns {{ csv: string, columns: string[], rows: number } | { error: string }}
 */
export function jsonToCsv(value) {
  if (!Array.isArray(value)) {
    return { error: "CSV export needs a top-level array, for example [ { \"id\": 1 } ]." };
  }
  if (value.length === 0) return { error: "The array is empty, so there are no rows to export." };

  const columns = [];
  const flatRows = value.map((row) => {
    const flat =
      row && typeof row === "object" && !Array.isArray(row) ? flattenJson(row) : { value: row };
    for (const key of Object.keys(flat)) if (!columns.includes(key)) columns.push(key);
    return flat;
  });

  const lines = [columns.map(csvField).join(",")];
  for (const row of flatRows) {
    lines.push(columns.map((column) => csvField(row[column])).join(","));
  }

  return { csv: lines.join("\r\n"), columns, rows: flatRows.length };
}

/**
 * Structure statistics for a parsed JSON value.
 *
 * `depth` counts nesting levels: a scalar is depth 0, `{"a":1}` is depth 1.
 *
 * @param {unknown} value
 * @returns {object}
 */
export function analyseJson(value) {
  const counts = { object: 0, array: 0, string: 0, number: 0, boolean: 0, null: 0 };
  let depth = 0;
  let keys = 0;
  let longestArray = 0;
  let longestStringLength = 0;

  const walk = (node, level) => {
    if (level > depth) depth = level;
    if (node === null) {
      counts.null += 1;
      return;
    }
    if (Array.isArray(node)) {
      counts.array += 1;
      if (node.length > longestArray) longestArray = node.length;
      for (const item of node) walk(item, level + 1);
      return;
    }
    const type = typeof node;
    if (type === "object") {
      counts.object += 1;
      const objectKeys = Object.keys(node);
      keys += objectKeys.length;
      for (const key of objectKeys) walk(node[key], level + 1);
      return;
    }
    if (type === "string") {
      counts.string += 1;
      if (node.length > longestStringLength) longestStringLength = node.length;
      return;
    }
    if (type === "number") counts.number += 1;
    else if (type === "boolean") counts.boolean += 1;
  };

  walk(value, 0);

  const rootType = Array.isArray(value) ? "array" : value === null ? "null" : typeof value;
  const totalNodes = Object.values(counts).reduce((sum, entry) => sum + entry, 0);

  return {
    rootType,
    depth,
    keys,
    totalNodes,
    counts,
    longestArray,
    longestStringLength,
    topLevelEntries: Array.isArray(value)
      ? value.length
      : value && typeof value === "object"
        ? Object.keys(value).length
        : 0,
  };
}

/**
 * Byte length of a string once encoded as UTF-8 — the number that matters for
 * a payload size, not `.length`, which counts UTF-16 code units.
 *
 * @param {string} text
 * @returns {number}
 */
export function utf8Bytes(text) {
  if (typeof text !== "string") return 0;
  return new TextEncoder().encode(text).length;
}
