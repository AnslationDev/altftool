/**
 * JSON → TOML serializer, following the TOML v1.0.0 specification
 * (https://toml.io/en/v1.0.0).
 *
 * Spec rules encoded:
 *  - A TOML document IS a table, so the JSON root must be an object (§ Table).
 *  - Bare keys may contain only A-Za-z0-9_- ; every other key is emitted as a quoted
 *    basic-string key (§ Keys).
 *  - Nested objects become [dotted.header] tables; arrays in which every element is an
 *    object become [[array of tables]] (§ Array of Tables).
 *  - Objects inside mixed arrays are emitted as inline tables, which the spec requires
 *    to stay on a single line (§ Inline Table).
 *  - TOML floats must carry a fractional or exponent part, so the integer-valued float
 *    problem is avoided by emitting JS safe integers without a decimal point and
 *    everything else with one (§ Float / § Integer).
 *  - TOML has NO null (§ Spec — value types). Null handling is therefore explicit:
 *    omit the key (default, reported) or fail the conversion.
 *  - Basic strings escape \b \t \n \f \r \" \\ and all other control characters as
 *    \uXXXX (§ String).
 */

export const NULL_MODES = [
  { id: "omit", label: "Omit null keys (report them)" },
  { id: "fail", label: "Fail on null values" },
];

export const DEFAULT_JSON = `{
  "title": "TOML Example",
  "owner": {
    "name": "Ada Lovelace",
    "active": true
  },
  "database": {
    "server": "192.0.2.1",
    "ports": [8001, 8001, 8002],
    "connection_max": 5000
  },
  "products": [
    { "name": "Hammer", "sku": 738594937 },
    { "name": "Nail", "sku": 284758393 }
  ]
}
`;

const BARE_KEY = /^[A-Za-z0-9_-]+$/;

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** Escape a string as a TOML basic string body (§ String). */
export function escapeTomlString(value) {
  let out = "";
  for (const ch of String(value)) {
    const code = ch.codePointAt(0);
    if (ch === "\\") out += "\\\\";
    else if (ch === '"') out += '\\"';
    else if (ch === "\b") out += "\\b";
    else if (ch === "\t") out += "\\t";
    else if (ch === "\n") out += "\\n";
    else if (ch === "\f") out += "\\f";
    else if (ch === "\r") out += "\\r";
    else if (code < 0x20 || code === 0x7f) out += `\\u${code.toString(16).padStart(4, "0").toUpperCase()}`;
    else out += ch;
  }
  return out;
}

/** Emit a single key: bare when legal, quoted basic string otherwise (§ Keys). */
export function formatKey(key) {
  return BARE_KEY.test(key) ? key : `"${escapeTomlString(key)}"`;
}

/** Join path segments into a [header] path. */
function formatPath(path) {
  return path.map(formatKey).join(".");
}

/** Format a number as a TOML integer or float (§ Integer, § Float). */
function formatNumber(value, stats) {
  if (Number.isNaN(value)) return "nan";
  if (!Number.isFinite(value)) {
    // Overflowed IEEE-754 double range (e.g. a JSON literal like 1e400) — precision is
    // completely lost, so this counts toward the same "may lose precision" warning.
    stats.bigIntegers += 1;
    return value > 0 ? "inf" : "-inf";
  }
  const unsafeInteger = Number.isInteger(value) && Math.abs(value) > Number.MAX_SAFE_INTEGER;
  if (Number.isInteger(value) && !unsafeInteger) return String(value);
  if (unsafeInteger) stats.bigIntegers += 1;
  const text = String(value);
  // A TOML float needs a fractional or exponent part; 1e21 stringifies as "1e+21" which is fine.
  if (!/[.eE]/.test(text)) return `${text}.0`;
  return text;
}

class NullValueError extends Error {}

/** Format any value inline (used inside arrays and inline tables). */
function formatInline(value, stats, nullMode, keyPath) {
  if (value === null) {
    // Reached only for "fail" mode: array elements and inline-table properties both
    // resolve "omit" mode nulls (dropping them, below) before ever calling back in here.
    throw new NullValueError(`"${keyPath}" is null — TOML has no null value.`);
  }
  if (typeof value === "string") return `"${escapeTomlString(value)}"`;
  if (typeof value === "number") return formatNumber(value, stats);
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) {
    const parts = [];
    value.forEach((entry, index) => {
      const entryPath = `${keyPath}[${index}]`;
      if (entry === null && nullMode === "omit") {
        stats.nullsOmitted += 1;
        return;
      }
      parts.push(formatInline(entry, stats, nullMode, entryPath));
    });
    return `[ ${parts.join(", ")} ]`;
  }
  if (isPlainObject(value)) {
    stats.inlineTables += 1;
    const parts = [];
    for (const [key, entry] of Object.entries(value)) {
      if (entry === null && nullMode === "omit") {
        stats.nullsOmitted += 1;
        continue;
      }
      parts.push(`${formatKey(key)} = ${formatInline(entry, stats, nullMode, `${keyPath}.${key}`)}`);
    }
    return `{ ${parts.join(", ")} }`;
  }
  throw new NullValueError(`"${keyPath}" has a type TOML cannot represent.`);
}

/**
 * True when the array should be emitted as [[array of tables]]. In "omit" null mode, null
 * entries are dropped from the array (elsewhere, per-element) before this array ever reaches
 * TOML, so they must also be ignored here — otherwise a single null placeholder in an
 * otherwise-homogeneous array of objects wrongly demotes the whole array to an inline-table
 * fallback that's meant only for genuinely mixed (object + scalar) arrays.
 */
function isArrayOfTables(value, nullMode) {
  if (!Array.isArray(value) || value.length === 0) return false;
  const candidates = nullMode === "omit" ? value.filter((entry) => entry !== null) : value;
  return candidates.length > 0 && candidates.every(isPlainObject);
}

/** Serialize one table's contents; recurses into sub-tables and arrays of tables. */
function serializeTable(obj, path, stats, nullMode, lines) {
  const scalars = [];
  const subTables = [];
  const tableArrays = [];

  for (const [key, value] of Object.entries(obj)) {
    if (value === null) {
      if (nullMode === "fail") {
        throw new NullValueError(`"${[...path, key].join(".")}" is null — TOML has no null value.`);
      }
      stats.nullsOmitted += 1;
      continue;
    }
    if (isPlainObject(value)) subTables.push([key, value]);
    else if (isArrayOfTables(value, nullMode)) tableArrays.push([key, value]);
    else scalars.push([key, value]);
  }

  for (const [key, value] of scalars) {
    stats.keys += 1;
    lines.push(`${formatKey(key)} = ${formatInline(value, stats, nullMode, [...path, key].join("."))}`);
  }

  for (const [key, value] of subTables) {
    const childPath = [...path, key];
    stats.tables += 1;
    if (lines.length > 0) lines.push("");
    lines.push(`[${formatPath(childPath)}]`);
    serializeTable(value, childPath, stats, nullMode, lines);
  }

  for (const [key, value] of tableArrays) {
    const childPath = [...path, key];
    for (const element of value) {
      if (element === null) {
        // Only reachable in "omit" mode — isArrayOfTables() only lets a null-containing
        // array through when nullMode === "omit" (see its filter above).
        stats.nullsOmitted += 1;
        continue;
      }
      stats.arrayTables += 1;
      if (lines.length > 0) lines.push("");
      lines.push(`[[${formatPath(childPath)}]]`);
      serializeTable(element, childPath, stats, nullMode, lines);
    }
  }
}

/**
 * Convert JSON text to TOML.
 *
 * @param {object} input
 * @param {string} input.jsonText  JSON source text.
 * @param {string} [input.nullMode] "omit" (default) or "fail".
 * @returns {object} { toml, keys, tables, arrayTables, nullsOmitted, warnings } or { error }.
 */
export function convertJsonToToml({ jsonText, nullMode = "omit" }) {
  const source = String(jsonText ?? "");
  if (source.trim() === "") return { error: "Paste some JSON to convert." };
  if (!NULL_MODES.some((mode) => mode.id === nullMode)) {
    return { error: "Choose how null values should be handled." };
  }

  let data;
  try {
    data = JSON.parse(source);
  } catch (caught) {
    return { error: `Invalid JSON: ${caught.message}` };
  }

  if (!isPlainObject(data)) {
    return {
      error:
        "The JSON root must be an object — a TOML document is a table, so a top-level array or scalar has no TOML equivalent.",
    };
  }

  const stats = { keys: 0, tables: 0, arrayTables: 0, inlineTables: 0, nullsOmitted: 0, bigIntegers: 0 };
  const lines = [];
  try {
    serializeTable(data, [], stats, nullMode, lines);
  } catch (caught) {
    if (caught instanceof NullValueError) return { error: caught.message };
    throw caught;
  }

  const toml = lines.join("\n") + (lines.length > 0 ? "\n" : "");

  const warnings = [];
  if (stats.nullsOmitted > 0) {
    warnings.push(`${stats.nullsOmitted} null key(s) were omitted — TOML has no null value.`);
  }
  if (stats.inlineTables > 0) {
    warnings.push(
      `${stats.inlineTables} object(s) inside mixed arrays were emitted as single-line inline tables, as TOML requires.`,
    );
  }
  if (stats.bigIntegers > 0) {
    warnings.push(
      `${stats.bigIntegers} number(s) beyond JavaScript's safe-integer range were written as floats and may lose precision.`,
    );
  }

  return {
    toml,
    keys: stats.keys,
    tables: stats.tables,
    arrayTables: stats.arrayTables,
    nullsOmitted: stats.nullsOmitted,
    inputChars: source.length,
    outputChars: toml.length,
    warnings,
  };
}
