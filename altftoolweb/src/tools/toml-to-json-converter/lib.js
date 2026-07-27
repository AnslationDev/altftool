/**
 * TOML 1.0.0 → JSON converter, implemented from the TOML v1.0.0 specification
 * (https://toml.io/en/v1.0.0). No external parser library is used.
 *
 * Spec rules encoded:
 *  - Bare keys are A-Za-z0-9_- ; anything else must be a quoted key (§ Keys).
 *  - Defining a key or table twice is an error (§ Keys, § Table).
 *  - Dotted keys and [table] headers create intermediate tables implicitly; a table
 *    created implicitly may later be defined explicitly, but not twice explicitly.
 *  - [[name]] appends a new element to an array of tables (§ Array of Tables).
 *  - Basic strings support the escapes \b \t \n \f \r \" \\ \uXXXX \UXXXXXXXX only;
 *    literal strings support no escapes (§ String).
 *  - Multi-line strings trim the newline immediately after the opening delimiter, and
 *    a line-ending backslash in a multi-line basic string trims all following whitespace.
 *  - Integers may be decimal, 0x hex, 0o octal or 0b binary, with _ separators between
 *    digits; decimal integers may not have leading zeros (§ Integer).
 *  - Floats include inf and nan (§ Float) — JSON (RFC 8259) cannot express them, so the
 *    converter substitutes null and reports each substitution.
 *  - Date-times (offset, local, local date, local time — RFC 3339 shapes, § Local Date-Time)
 *    become JSON strings, since JSON has no date type.
 */

/** Output indentation choices. 2 spaces is the common default for JSON files. */
export const INDENT_OPTIONS = [
  { id: "2", label: "2 spaces", indent: 2 },
  { id: "4", label: "4 spaces", indent: 4 },
  { id: "tab", label: "Tabs", indent: "\t" },
  { id: "min", label: "Minified", indent: 0 },
];

export const DEFAULT_TOML = `# Example configuration
title = "TOML Example"

[owner]
name = "Ada Lovelace"
dob = 1815-12-10

[database]
server = "192.0.2.1"
ports = [ 8001, 8001, 8002 ]
connection_max = 5_000
enabled = true

[servers.alpha]
ip = "10.0.0.1"
role = "frontend"

[[products]]
name = "Hammer"
sku = 738594937

[[products]]
name = "Nail"
sku = 284758393
`;

const BARE_KEY = /^[A-Za-z0-9_-]+/;
// RFC 3339 shapes referenced by the TOML spec.
const OFFSET_DATETIME = /^\d{4}-\d{2}-\d{2}[Tt ]\d{2}:\d{2}:\d{2}(\.\d+)?([Zz]|[+-]\d{2}:\d{2})/;
const LOCAL_DATETIME = /^\d{4}-\d{2}-\d{2}[Tt ]\d{2}:\d{2}:\d{2}(\.\d+)?/;
const LOCAL_DATE = /^\d{4}-\d{2}-\d{2}/;
const LOCAL_TIME = /^\d{2}:\d{2}:\d{2}(\.\d+)?/;
// § Integer: decimal without leading zeros, or prefixed hex/octal/binary; _ between digits.
const INT_DEC = /^[+-]?(0|[1-9](_?\d)*)$/;
const INT_HEX = /^0x[0-9A-Fa-f](_?[0-9A-Fa-f])*$/;
const INT_OCT = /^0o[0-7](_?[0-7])*$/;
const INT_BIN = /^0b[01](_?[01])*$/;
// § Float: integer part plus fraction and/or exponent; also inf / nan with optional sign.
const FLOAT = /^[+-]?(0|[1-9](_?\d)*)((\.\d(_?\d)*)([eE][+-]?\d(_?\d)*)?|([eE][+-]?\d(_?\d)*))$/;
const SPECIAL_FLOAT = /^[+-]?(inf|nan)$/;

function makeState(text) {
  return {
    src: String(text ?? "").replace(/\r\n/g, "\n"),
    pos: 0,
    stats: { keys: 0, tables: 0, arrayTables: 0, datetimes: 0 },
  };
}

function lineOf(state) {
  let line = 1;
  for (let i = 0; i < state.pos && i < state.src.length; i += 1) {
    if (state.src[i] === "\n") line += 1;
  }
  return line;
}

function fail(state, message) {
  const error = new Error(`${message} (line ${lineOf(state)})`);
  error.isTomlError = true;
  throw error;
}

const eof = (state) => state.pos >= state.src.length;
const peek = (state) => state.src[state.pos];

function skipWs(state) {
  while (!eof(state) && (peek(state) === " " || peek(state) === "\t")) state.pos += 1;
}

function skipComment(state) {
  if (peek(state) === "#") {
    while (!eof(state) && peek(state) !== "\n") state.pos += 1;
  }
}

function skipBlankAndComments(state) {
  for (;;) {
    skipWs(state);
    if (peek(state) === "#") {
      skipComment(state);
      continue;
    }
    if (peek(state) === "\n") {
      state.pos += 1;
      continue;
    }
    break;
  }
}

function expectLineEnd(state) {
  skipWs(state);
  skipComment(state);
  if (eof(state)) return;
  if (peek(state) === "\n") {
    state.pos += 1;
    return;
  }
  fail(state, `Unexpected "${peek(state)}" after value`);
}

/* ---------------- strings ---------------- */

function parseEscape(state) {
  const ch = state.src[state.pos];
  state.pos += 1;
  switch (ch) {
    case "b":
      return "\b";
    case "t":
      return "\t";
    case "n":
      return "\n";
    case "f":
      return "\f";
    case "r":
      return "\r";
    case '"':
      return '"';
    case "\\":
      return "\\";
    case "u":
    case "U": {
      const length = ch === "u" ? 4 : 8;
      const hex = state.src.slice(state.pos, state.pos + length);
      if (!new RegExp(`^[0-9A-Fa-f]{${length}}$`).test(hex)) {
        fail(state, `Invalid \\${ch} escape`);
      }
      state.pos += length;
      const code = parseInt(hex, 16);
      if (code > 0x10ffff) fail(state, "Unicode escape out of range");
      return String.fromCodePoint(code);
    }
    default:
      state.pos -= 1;
      fail(state, `Invalid escape \\${ch} — TOML basic strings allow \\b \\t \\n \\f \\r \\" \\\\ \\u \\U only`);
      return "";
  }
}

function parseBasicString(state) {
  state.pos += 1; // opening "
  let out = "";
  for (;;) {
    if (eof(state) || peek(state) === "\n") fail(state, "Unterminated string");
    const ch = peek(state);
    state.pos += 1;
    if (ch === '"') return out;
    if (ch === "\\") out += parseEscape(state);
    else out += ch;
  }
}

function parseLiteralString(state) {
  state.pos += 1; // opening '
  let out = "";
  for (;;) {
    if (eof(state) || peek(state) === "\n") fail(state, "Unterminated literal string");
    const ch = peek(state);
    state.pos += 1;
    if (ch === "'") return out;
    out += ch;
  }
}

function parseMultilineBasic(state) {
  state.pos += 3; // """
  if (peek(state) === "\n") state.pos += 1; // spec: trim newline right after the delimiter
  let out = "";
  for (;;) {
    if (eof(state)) fail(state, 'Unterminated """ string');
    if (state.src.startsWith('"""', state.pos)) {
      // Allow up to two extra quotes to belong to the content (spec permits "" before delimiter).
      let extra = 0;
      while (state.src[state.pos + 3 + extra] === '"' && extra < 2) extra += 1;
      out += '"'.repeat(extra);
      state.pos += 3 + extra;
      return out;
    }
    const ch = peek(state);
    if (ch === "\\") {
      const next = state.src[state.pos + 1];
      if (next === "\n" || next === " " || next === "\t") {
        // Line-ending backslash: skip whitespace and newlines that follow.
        let cursor = state.pos + 1;
        while (cursor < state.src.length && (state.src[cursor] === " " || state.src[cursor] === "\t")) cursor += 1;
        if (state.src[cursor] === "\n") {
          cursor += 1;
          while (
            cursor < state.src.length &&
            (state.src[cursor] === " " || state.src[cursor] === "\t" || state.src[cursor] === "\n")
          ) {
            cursor += 1;
          }
          state.pos = cursor;
          continue;
        }
        fail(state, "Backslash in a multi-line string must escape a character or end the line");
      }
      state.pos += 1;
      out += parseEscape(state);
      continue;
    }
    out += ch;
    state.pos += 1;
  }
}

function parseMultilineLiteral(state) {
  state.pos += 3; // '''
  if (peek(state) === "\n") state.pos += 1;
  let out = "";
  for (;;) {
    if (eof(state)) fail(state, "Unterminated ''' string");
    if (state.src.startsWith("'''", state.pos)) {
      let extra = 0;
      while (state.src[state.pos + 3 + extra] === "'" && extra < 2) extra += 1;
      out += "'".repeat(extra);
      state.pos += 3 + extra;
      return out;
    }
    out += peek(state);
    state.pos += 1;
  }
}

/* ---------------- keys ---------------- */

function parseKey(state) {
  const ch = peek(state);
  if (ch === '"') return parseBasicString(state);
  if (ch === "'") return parseLiteralString(state);
  const match = BARE_KEY.exec(state.src.slice(state.pos));
  if (!match) fail(state, "Expected a key (bare keys may contain A-Z a-z 0-9 _ - only)");
  state.pos += match[0].length;
  return match[0];
}

/** A dotted key path such as fruit.apple."ripe level". */
function parseKeyPath(state) {
  const path = [parseKey(state)];
  for (;;) {
    skipWs(state);
    if (peek(state) !== ".") return path;
    state.pos += 1;
    skipWs(state);
    path.push(parseKey(state));
  }
}

/* ---------------- values ---------------- */

function classifyScalar(state, token) {
  if (token === "true") return true;
  if (token === "false") return false;
  if (SPECIAL_FLOAT.test(token)) {
    const negative = token.startsWith("-");
    if (token.endsWith("nan")) return Number.NaN;
    return negative ? -Infinity : Infinity;
  }
  if (INT_DEC.test(token)) return Number(token.replace(/_/g, ""));
  if (INT_HEX.test(token) || INT_OCT.test(token) || INT_BIN.test(token)) {
    return Number(token.replace(/_/g, ""));
  }
  if (FLOAT.test(token)) return Number(token.replace(/_/g, ""));
  if (LOCAL_TIME.test(token) && token === LOCAL_TIME.exec(token)[0]) {
    state.stats.datetimes += 1;
    return token;
  }
  fail(state, `Cannot parse value "${token}"`);
  return null;
}

function parseValue(state) {
  skipWs(state);
  if (eof(state)) fail(state, "Expected a value");
  const ch = peek(state);

  if (state.src.startsWith('"""', state.pos)) return parseMultilineBasic(state);
  if (ch === '"') return parseBasicString(state);
  if (state.src.startsWith("'''", state.pos)) return parseMultilineLiteral(state);
  if (ch === "'") return parseLiteralString(state);

  if (ch === "[") {
    state.pos += 1;
    const values = [];
    for (;;) {
      skipBlankAndComments(state);
      if (eof(state)) fail(state, "Unterminated array");
      if (peek(state) === "]") {
        state.pos += 1;
        return values;
      }
      values.push(parseValue(state));
      skipBlankAndComments(state);
      if (peek(state) === ",") {
        state.pos += 1;
        continue;
      }
      if (peek(state) === "]") {
        state.pos += 1;
        return values;
      }
      fail(state, "Expected , or ] in array");
    }
  }

  if (ch === "{") {
    state.pos += 1;
    const table = {};
    skipWs(state);
    if (peek(state) === "}") {
      state.pos += 1;
      return table;
    }
    for (;;) {
      skipWs(state);
      const path = parseKeyPath(state);
      skipWs(state);
      if (peek(state) !== "=") fail(state, "Expected = in inline table");
      state.pos += 1;
      const value = parseValue(state);
      assignPath(state, table, path, value);
      skipWs(state);
      if (peek(state) === ",") {
        state.pos += 1;
        continue;
      }
      if (peek(state) === "}") {
        state.pos += 1;
        return table;
      }
      fail(state, "Expected , or } in inline table (inline tables must stay on one line)");
    }
  }

  // Date-times first: they contain characters (- :) that also appear in numbers.
  const rest = state.src.slice(state.pos);
  for (const pattern of [OFFSET_DATETIME, LOCAL_DATETIME, LOCAL_DATE]) {
    const match = pattern.exec(rest);
    if (match) {
      state.pos += match[0].length;
      state.stats.datetimes += 1;
      return match[0];
    }
  }

  const tokenMatch = /^[^ \t\n,\]}#]+/.exec(rest);
  if (!tokenMatch) fail(state, "Expected a value");
  const token = tokenMatch[0];
  state.pos += token.length;
  return classifyScalar(state, token);
}

/* ---------------- assignment and table navigation ---------------- */

function isPlainTable(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** Assign a dotted-key value inside a table, creating intermediate tables (§ Keys). */
function assignPath(state, target, path, value) {
  let cursor = target;
  for (let i = 0; i < path.length - 1; i += 1) {
    const key = path[i];
    if (cursor[key] === undefined) cursor[key] = {};
    else if (!isPlainTable(cursor[key])) {
      fail(state, `Key "${path.slice(0, i + 1).join(".")}" is already a non-table value`);
    }
    cursor = cursor[key];
  }
  const leaf = path[path.length - 1];
  if (Object.prototype.hasOwnProperty.call(cursor, leaf)) {
    fail(state, `Duplicate key "${path.join(".")}" — TOML forbids defining a key twice`);
  }
  cursor[leaf] = value;
  state.stats.keys += 1;
}

/** Walk a [header] path from the root, descending into the last element of any array of tables. */
function descend(state, root, path, stopBeforeLast) {
  let cursor = root;
  const upto = stopBeforeLast ? path.length - 1 : path.length;
  for (let i = 0; i < upto; i += 1) {
    const key = path[i];
    if (cursor[key] === undefined) cursor[key] = {};
    let next = cursor[key];
    if (Array.isArray(next)) {
      if (next.length === 0 || !isPlainTable(next[next.length - 1])) {
        fail(state, `"${path.slice(0, i + 1).join(".")}" is a plain array, not an array of tables`);
      }
      next = next[next.length - 1];
    } else if (!isPlainTable(next)) {
      fail(state, `Key "${path.slice(0, i + 1).join(".")}" is already a non-table value`);
    }
    cursor = next;
  }
  return cursor;
}

/**
 * Parse a whole TOML document.
 * @returns {object} { data, stats } — throws on invalid TOML.
 */
export function parseToml(text) {
  const state = makeState(text);
  const root = {};
  const explicitHeaders = new Set(); // paths defined with [header]
  const arrayTablePaths = new Set(); // paths defined with [[header]]
  let currentTable = root;

  for (;;) {
    skipBlankAndComments(state);
    if (eof(state)) break;

    if (peek(state) === "[") {
      const isArrayTable = state.src.startsWith("[[", state.pos);
      state.pos += isArrayTable ? 2 : 1;
      skipWs(state);
      const path = parseKeyPath(state);
      skipWs(state);
      const closer = isArrayTable ? "]]" : "]";
      if (!state.src.startsWith(closer, state.pos)) fail(state, `Expected ${closer} to close the table header`);
      state.pos += closer.length;
      expectLineEnd(state);

      const pathKey = JSON.stringify(path);
      if (isArrayTable) {
        const parent = descend(state, root, path, true);
        const leaf = path[path.length - 1];
        if (parent[leaf] === undefined) parent[leaf] = [];
        if (!Array.isArray(parent[leaf]) || (explicitHeaders.has(pathKey) && !arrayTablePaths.has(pathKey))) {
          fail(state, `Cannot append to "${path.join(".")}" — it is already defined as something else`);
        }
        const element = {};
        parent[leaf].push(element);
        currentTable = element;
        arrayTablePaths.add(pathKey);
        state.stats.arrayTables += 1;
      } else {
        if (explicitHeaders.has(pathKey) || arrayTablePaths.has(pathKey)) {
          fail(state, `Table [${path.join(".")}] is defined twice — TOML forbids redefining a table`);
        }
        currentTable = descend(state, root, path, false);
        explicitHeaders.add(pathKey);
        state.stats.tables += 1;
      }
      continue;
    }

    const path = parseKeyPath(state);
    skipWs(state);
    if (peek(state) !== "=") fail(state, `Expected = after key "${path.join(".")}"`);
    state.pos += 1;
    const value = parseValue(state);
    assignPath(state, currentTable, path, value);
    expectLineEnd(state);
  }

  return { data: root, stats: state.stats };
}

/** Replace values RFC 8259 JSON cannot express (inf/nan), counting each substitution. */
function jsonSafe(value, counter) {
  if (typeof value === "number" && !Number.isFinite(value)) {
    counter.nonFinite += 1;
    return null;
  }
  if (Array.isArray(value)) return value.map((entry) => jsonSafe(entry, counter));
  if (isPlainTable(value)) {
    const out = {};
    for (const [key, entry] of Object.entries(value)) out[key] = jsonSafe(entry, counter);
    return out;
  }
  return value;
}

/**
 * Convert TOML text to formatted JSON.
 * @returns {object} { json, stats, warnings } or { error }.
 */
export function convertTomlToJson({ tomlText, indentId = "2" }) {
  const source = String(tomlText ?? "");
  if (source.trim() === "") return { error: "Paste some TOML to convert." };

  const option = INDENT_OPTIONS.find((entry) => entry.id === indentId) ?? INDENT_OPTIONS[0];

  let parsed;
  try {
    parsed = parseToml(source);
  } catch (caught) {
    return { error: caught && caught.message ? caught.message : "The TOML could not be parsed." };
  }

  const counter = { nonFinite: 0 };
  const safe = jsonSafe(parsed.data, counter);
  const json = option.indent === 0 ? JSON.stringify(safe) : JSON.stringify(safe, null, option.indent);

  const warnings = [];
  if (parsed.stats.datetimes > 0) {
    warnings.push(
      `${parsed.stats.datetimes} date/time value(s) became JSON strings — JSON has no date type.`,
    );
  }
  if (counter.nonFinite > 0) {
    warnings.push(`${counter.nonFinite} inf/nan value(s) became null — RFC 8259 JSON cannot express them.`);
  }

  return {
    json,
    keys: parsed.stats.keys,
    tables: parsed.stats.tables,
    arrayTables: parsed.stats.arrayTables,
    inputChars: source.length,
    outputChars: json.length,
    warnings,
  };
}
