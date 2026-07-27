/**
 * dotenv <-> JSON converter.
 *
 * .env parsing follows the de-facto dotenv format (motdotla/dotenv): "#"
 * comments, optional "export ", single/double/backtick quotes (double quotes
 * expand \n, \r, \t), "#" starts an inline comment in unquoted values, and the
 * last duplicate key wins.
 *
 * Type coercion mirrors what config loaders like nconf/convict and
 * dotenv-parse-variables do: "true"/"false" -> boolean, "null" -> null,
 * strictly-numeric strings -> number. Values that were QUOTED in the .env are
 * always kept as strings, so NAME="42" survives as "42".
 *
 * Nesting uses the double-underscore convention popularised by
 * ASP.NET Core configuration and nconf's env({ separator: '__' }):
 * DB__HOST=x  ->  { "DB": { "HOST": "x" } }.
 */

/** Default nesting delimiter — the ASP.NET Core / nconf "__" convention. */
export const DEFAULT_DELIMITER = "__";

/** Strictly numeric: optional sign, digits, optional decimal part / exponent. */
const NUMERIC_PATTERN = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/;

const DOUBLE_QUOTE_ESCAPES = [
  [/\\n/g, "\n"],
  [/\\r/g, "\r"],
  [/\\t/g, "\t"],
  [/\\"/g, '"'],
  [/\\\\/g, "\\"],
];

function findClosingQuote(text, q) {
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] !== q) continue;
    let backslashes = 0;
    for (let j = i - 1; j >= 0 && text[j] === "\\"; j -= 1) backslashes += 1;
    if (backslashes % 2 === 0) return i;
  }
  return -1;
}

/**
 * Parse .env text. Tracks whether each value was quoted, so coercion can
 * respect explicit strings.
 * @returns {Map<string,{value:string,quoted:boolean}>}
 */
export function parseEnv(text) {
  const map = new Map();
  const lines = String(text ?? "").split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const trimmed = lines[i].trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^(?:export\s+)?([^=\s]+)\s*=\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    const rest = match[2];
    let value;
    let quoted = false;
    const q = rest[0];
    if (q === '"' || q === "'" || q === "`") {
      quoted = true;
      let buf = rest.slice(1);
      let idx = findClosingQuote(buf, q);
      while (idx === -1 && i + 1 < lines.length) {
        i += 1;
        buf += `\n${lines[i]}`;
        idx = findClosingQuote(buf, q);
      }
      value = idx === -1 ? buf : buf.slice(0, idx);
      if (q === '"') {
        for (const [pattern, replacement] of DOUBLE_QUOTE_ESCAPES) value = value.replace(pattern, replacement);
      }
    } else {
      const hashIdx = rest.indexOf("#");
      value = (hashIdx === -1 ? rest : rest.slice(0, hashIdx)).trim();
    }
    map.set(key, { value, quoted });
  }
  return map;
}

/** Coerce a raw string value to boolean/null/number per config-loader rules. */
export function coerceValue(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  if (NUMERIC_PATTERN.test(value)) {
    const num = Number(value);
    if (Number.isFinite(num)) return num;
  }
  return value;
}

/**
 * Convert .env text to a JSON string.
 *
 * @param {string} text
 * @param {object} [options]
 * @param {boolean} [options.coerceTypes=true] Coerce unquoted true/false/null/numbers.
 * @param {boolean} [options.nested=false]     Split keys on the delimiter into nested objects.
 * @param {string} [options.delimiter="__"]
 * @param {number} [options.indent=2]
 * @returns {object} { json, object, count } or { error }.
 */
export function envToJson(text, { coerceTypes = true, nested = false, delimiter = DEFAULT_DELIMITER, indent = 2 } = {}) {
  const map = parseEnv(text);
  if (map.size === 0) return { error: "No KEY=VALUE variables found — paste a .env file to convert." };
  if (nested && String(delimiter) === "") return { error: "Nesting delimiter cannot be empty." };

  const root = {};
  for (const [key, { value, quoted }] of map) {
    const finalValue = coerceTypes && !quoted ? coerceValue(value) : value;
    if (!nested) {
      root[key] = finalValue;
      continue;
    }
    const segments = key.split(delimiter).filter((s) => s !== "");
    if (segments.length === 0) {
      return { error: `Key "${key}" contains only delimiters and cannot be nested.` };
    }
    let node = root;
    for (let s = 0; s < segments.length - 1; s += 1) {
      const seg = segments[s];
      if (!(seg in node)) node[seg] = {};
      else if (typeof node[seg] !== "object" || node[seg] === null || Array.isArray(node[seg])) {
        return {
          error: `Nesting conflict: "${key}" needs "${segments.slice(0, s + 1).join(delimiter)}" to be an object, but it already holds a value.`,
        };
      }
      node = node[seg];
    }
    const leaf = segments[segments.length - 1];
    if (typeof node[leaf] === "object" && node[leaf] !== null) {
      return { error: `Nesting conflict: "${key}" would overwrite the object at "${leaf}".` };
    }
    node[leaf] = finalValue;
  }

  return { json: JSON.stringify(root, null, indent), object: root, count: map.size };
}

/**
 * Convert a JSON object string back to .env lines.
 *
 * Nested objects flatten with the delimiter (DB.host -> DB__HOST style path
 * join); arrays flatten by index. Booleans, numbers and null are written as
 * bare literals; strings needing protection are double-quoted with dotenv's
 * escape rules.
 *
 * @param {string} jsonText
 * @param {object} [options]
 * @param {string} [options.delimiter="__"]
 * @param {boolean} [options.uppercaseKeys=true]
 * @returns {object} { output, count } or { error }.
 */
export function jsonToEnv(jsonText, { delimiter = DEFAULT_DELIMITER, uppercaseKeys = true } = {}) {
  if (String(jsonText ?? "").trim() === "") return { error: "Paste a JSON object to convert." };
  let data;
  try {
    data = JSON.parse(jsonText);
  } catch (err) {
    return { error: `Invalid JSON: ${err.message}` };
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return { error: "The top level must be a JSON object of key/value pairs." };
  }

  const lines = [];
  const walk = (node, path) => {
    for (const [rawKey, value] of Object.entries(node)) {
      const key = String(rawKey);
      const nextPath = path === "" ? key : `${path}${delimiter}${key}`;
      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        walk(value, nextPath);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          const itemPath = `${nextPath}${delimiter}${index}`;
          if (item !== null && typeof item === "object" && !Array.isArray(item)) walk(item, itemPath);
          else lines.push([itemPath, item]);
        });
      } else {
        lines.push([nextPath, value]);
      }
    }
  };
  walk(data, "");

  if (lines.length === 0) return { error: "The JSON object contains no convertible values." };

  const formatKey = (key) => {
    let name = key.replace(/[^A-Za-z0-9_]/g, "_");
    if (uppercaseKeys) name = name.toUpperCase();
    if (/^[0-9]/.test(name)) name = `_${name}`;
    return name;
  };

  const formatValue = (value) => {
    if (value === null) return "null";
    if (typeof value === "boolean" || typeof value === "number") return String(value);
    const str = String(value);
    // Quote when the value would be misread unquoted: whitespace edges, #, =,
    // newlines, quotes, or values that look like other types.
    if (
      str === "" ||
      /^\s|\s$/.test(str) ||
      /[#\n\r"'`]/.test(str) ||
      str === "true" ||
      str === "false" ||
      str === "null" ||
      NUMERIC_PATTERN.test(str)
    ) {
      return `"${str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t")}"`;
    }
    return str;
  };

  const output = lines.map(([key, value]) => `${formatKey(key)}=${formatValue(value)}`).join("\n");
  return { output, count: lines.length };
}
