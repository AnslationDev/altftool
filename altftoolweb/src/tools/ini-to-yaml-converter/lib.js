/**
 * INI → YAML converter.
 *
 * INI has no formal specification, so the rules below follow the de facto conventions
 * shared by Python's configparser, git config and PHP's parse_ini_file:
 *
 *  - [section] lines open a section; keys before any section are global (top level).
 *  - Both `=` and `:` are accepted as key/value delimiters (configparser accepts both).
 *  - Full lines starting with `;` or `#` are comments (both markers are in common use).
 *  - Duplicate keys: the LAST value wins — configparser's strict=False behaviour —
 *    and each override is reported as a warning rather than silently applied.
 *  - Dotted section names ([database.primary]) nest, mirroring how git config maps
 *    [section "subsection"] and how systemd/PHP users emulate hierarchy.
 *  - Values are plain text in INI; optional type inference converts true/false,
 *    integers, floats and empty values to YAML types, while quoted values always
 *    stay strings (matching configparser's quote handling in common use).
 *
 * YAML output is produced by js-yaml's dump (YAML 1.2), which handles quoting of any
 * value that would otherwise change type — e.g. the string "yes" or "007".
 */

import { dump } from "js-yaml";

export const DEFAULT_INI = `; Application configuration
app_name = Demo Service
debug = false

[server]
host = 0.0.0.0
port = 8080
timeout = 2.5

[database.primary]
url = postgres://localhost/app
pool_size = 10

[database.replica]
url = postgres://replica.internal/app
read_only = true
`;

/** Matches [section] headers; the name may contain anything except ]. */
const SECTION_LINE = /^\[\s*([^\]]+?)\s*\]$/;
/** Integer per common INI usage (no leading-zero rule — "007" stays a string below). */
const INT_VALUE = /^[+-]?(0|[1-9]\d*)$/;
const FLOAT_VALUE = /^[+-]?(\d+\.\d*|\.\d+|\d+)([eE][+-]?\d+)?$/;

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** Strip one layer of matching single or double quotes. */
function unquote(raw) {
  if (raw.length >= 2) {
    const first = raw[0];
    const last = raw[raw.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return { value: raw.slice(1, -1), wasQuoted: true };
    }
  }
  return { value: raw, wasQuoted: false };
}

/** Infer a scalar type from an unquoted INI value. */
function inferValue(raw) {
  if (raw === "") return null;
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (INT_VALUE.test(raw)) return Number(raw);
  if (FLOAT_VALUE.test(raw) && /[.eE]/.test(raw)) {
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) return parsed;
  }
  return raw;
}

/**
 * Parse INI text into a plain object.
 *
 * @param {object} input
 * @param {string} input.iniText        INI source.
 * @param {boolean} [input.nestSections] Split dotted section names into nested maps.
 * @param {boolean} [input.inferTypes]   Convert true/false/numbers/empty to real types.
 * @returns {object} { data, warnings, stats } or { error }.
 */
export function parseIni({ iniText, nestSections = true, inferTypes = true }) {
  const source = String(iniText ?? "");
  if (source.trim() === "") return { error: "Paste some INI to convert." };

  const root = {};
  const warnings = [];
  const stats = { sections: 0, keys: 0, overridden: 0 };
  let current = root;
  let currentSection = "(global)";

  const lines = source.replace(/\r\n/g, "\n").split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    const lineNo = index + 1;
    const line = lines[index].trim();
    if (line === "" || line.startsWith(";") || line.startsWith("#")) continue;

    const sectionMatch = SECTION_LINE.exec(line);
    if (sectionMatch) {
      const name = sectionMatch[1];
      const path = nestSections ? name.split(".").map((part) => part.trim()) : [name];
      if (path.some((part) => part === "")) {
        return { error: `Empty section segment in [${name}] (line ${lineNo}).` };
      }
      let cursor = root;
      for (const part of path) {
        if (cursor[part] === undefined) cursor[part] = {};
        else if (!isPlainObject(cursor[part])) {
          return {
            error: `Section [${name}] collides with key "${part}", which already holds a value (line ${lineNo}).`,
          };
        }
        cursor = cursor[part];
      }
      current = cursor;
      currentSection = name;
      stats.sections += 1;
      continue;
    }

    // Key/value: the first unquoted = or : splits the line (configparser behaviour).
    const delimiterIndex = (() => {
      for (let i = 0; i < line.length; i += 1) {
        if (line[i] === "=" || line[i] === ":") return i;
      }
      return -1;
    })();
    if (delimiterIndex <= 0) {
      return {
        error: `Line ${lineNo} is not a comment, section header or key=value pair: "${line.slice(0, 60)}"`,
      };
    }

    const key = line.slice(0, delimiterIndex).trim();
    if (key === "") return { error: `Missing key before "${line[delimiterIndex]}" (line ${lineNo}).` };
    const rawValue = line.slice(delimiterIndex + 1).trim();
    const { value: unquoted, wasQuoted } = unquote(rawValue);
    const value = inferTypes && !wasQuoted ? inferValue(unquoted) : unquoted;

    if (Object.prototype.hasOwnProperty.call(current, key)) {
      if (isPlainObject(current[key])) {
        return {
          error: `Key "${key}" in [${currentSection}] collides with a section of the same name (line ${lineNo}).`,
        };
      }
      stats.overridden += 1;
      warnings.push(
        `"${key}" in [${currentSection}] was set more than once — the last value (line ${lineNo}) wins.`,
      );
    } else {
      stats.keys += 1;
    }
    current[key] = value;
  }

  return { data: root, warnings, stats };
}

/**
 * Convert INI text to YAML.
 * @returns {object} { yaml, sections, keys, warnings } or { error }.
 */
export function convertIniToYaml({ iniText, nestSections = true, inferTypes = true }) {
  const parsed = parseIni({ iniText, nestSections, inferTypes });
  if (parsed.error) return parsed;

  // js-yaml dump: 2-space indent (the YAML norm), keys kept in source order,
  // no refs/anchors are ever needed because INI cannot produce shared nodes.
  const yaml = dump(parsed.data, { indent: 2, lineWidth: -1, noRefs: true, sortKeys: false });

  return {
    yaml,
    sections: parsed.stats.sections,
    keys: parsed.stats.keys,
    overridden: parsed.stats.overridden,
    inputChars: String(iniText ?? "").length,
    outputChars: yaml.length,
    warnings: parsed.warnings,
  };
}
