/**
 * .env -> docker compose `environment:` converter.
 *
 * Rules implemented, with sources (Compose Specification,
 * github.com/compose-spec/compose-spec/blob/master/05-services.md and
 * 12-interpolation.md):
 * - `environment` accepts two syntaxes: a LIST of "KEY=value" strings, or a
 *   MAP of KEY: value pairs.
 * - Compose performs ${VAR} interpolation on the compose file itself; a
 *   literal "$" must be written "$$" (Interpolation section). Values coming
 *   from a real .env usually want to stay literal, so escaping is on by
 *   default.
 * - YAML 1.1 gotcha: unquoted true/false/yes/no/on/off/null and numbers are
 *   not strings in map form ("the Norway problem" — NO parses as false), so
 *   such values are quoted. The Compose spec itself recommends quoting.
 * - `env_file` is the third route: reference the file instead of inlining it.
 *
 * .env parsing follows the de-facto dotenv format (motdotla/dotenv):
 * "#" comments, optional "export ", quoted values, last duplicate wins.
 */

export const OUTPUT_STYLES = [
  { id: "list", label: "environment: list form (- KEY=value)" },
  { id: "map", label: "environment: map form (KEY: value)" },
  { id: "env_file", label: "env_file: reference (keep values in .env)" },
];

/** YAML 1.1 scalars that silently stop being strings when unquoted. */
const YAML_AMBIGUOUS_PATTERN = /^(true|false|yes|no|on|off|null|~|y|n)$/i;

function findClosingQuote(text, q) {
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] !== q) continue;
    let backslashes = 0;
    for (let j = i - 1; j >= 0 && text[j] === "\\"; j -= 1) backslashes += 1;
    if (backslashes % 2 === 0) return i;
  }
  return -1;
}

// dotenv (motdotla/dotenv, the format this parser follows per the file-header
// comment) only ever unescapes \n and \r inside a double-quoted value - never
// \t, \" or \\. Adding those would corrupt perfectly ordinary content that
// merely contains a backslash followed by that letter (e.g. a Windows path
// like "C:\temp\node_modules"), since each rule is a blanket regex over the
// whole value, not scoped to a deliberately-typed escape sequence.
const DOUBLE_QUOTE_ESCAPES = [
  [/\\n/g, "\n"],
  [/\\r/g, "\r"],
];

/** Parse .env text into an ordered key->value map (dotenv rules, last wins). */
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
    const q = rest[0];
    if (q === '"' || q === "'" || q === "`") {
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
    map.set(key, value);
  }
  return map;
}

/** Quote as a YAML double-quoted scalar (JSON string syntax is valid YAML). */
function yamlQuote(value) {
  return JSON.stringify(String(value));
}

/** Does this scalar need quoting to survive YAML 1.1 parsing as a string? */
function needsYamlQuoting(value) {
  if (value === "") return true;
  if (YAML_AMBIGUOUS_PATTERN.test(value)) return true;
  if (/^[-+]?[0-9]/.test(value)) return true; // numbers, dates, versions like 1.10
  if (/^[-+]?\.[0-9]/.test(value)) return true; // leading-dot decimals: .5, .75, -.5
  if (/^[-+]?\.(?:inf|nan)$/i.test(value)) return true; // YAML 1.1 special floats: .inf, -.inf, +.inf, .nan
  if (/[\n\r\t]/.test(value)) return true;
  if (/^[\s]|[\s]$/.test(value)) return true;
  if (/[:#{}[\],&*!|>'"%@`]/.test(value)) return true;
  if (/^[-?](\s|$)/.test(value)) return true; // YAML block-sequence/mapping-key indicators: "-", "- foo", "?", "? foo"
  return false;
}

/**
 * Convert .env text into a docker compose environment block.
 *
 * @param {string} text .env contents.
 * @param {object} options
 * @param {"list"|"map"|"env_file"} [options.style="list"]
 * @param {string} [options.serviceName="app"]
 * @param {string} [options.envFileName=".env"]  Used by the env_file style.
 * @param {boolean} [options.escapeDollar=true]  Write literal $ as $$ (compose interpolation escape).
 * @returns {object} { output, count, keys, escapedCount } or { error }.
 */
export function convertEnvToCompose(
  text,
  { style = "list", serviceName = "app", envFileName = ".env", escapeDollar = true } = {},
) {
  if (!OUTPUT_STYLES.some((s) => s.id === style)) return { error: "Unknown output style." };

  const service = String(serviceName ?? "").trim();
  // Compose service names must match [a-zA-Z0-9._-]+ (Compose spec, services top-level element).
  if (!/^[a-zA-Z0-9._-]+$/.test(service)) {
    return { error: "Service name may only contain letters, digits, '.', '_' and '-'." };
  }

  const map = parseEnv(text);
  if (style !== "env_file" && map.size === 0) {
    return { error: "No KEY=VALUE variables found — paste a .env file to convert." };
  }

  let escapedCount = 0;
  const escape = (value) => {
    if (!escapeDollar || !value.includes("$")) return value;
    escapedCount += 1;
    return value.replace(/\$/g, "$$$$"); // "$$$$" in a replacement string emits "$$"
  };

  const lines = ["services:", `  ${service}:`];

  if (style === "env_file") {
    const file = String(envFileName ?? "").trim() || ".env";
    lines.push("    env_file:", `      - ${file}`);
  } else if (style === "list") {
    lines.push("    environment:");
    for (const [key, rawValue] of map) {
      const value = escape(rawValue);
      const entry = `${key}=${value}`;
      lines.push(`      - ${needsYamlQuoting(value) ? yamlQuote(entry) : entry}`);
    }
  } else {
    lines.push("    environment:");
    for (const [key, rawValue] of map) {
      const value = escape(rawValue);
      lines.push(`      ${key}: ${needsYamlQuoting(value) ? yamlQuote(value) : value}`);
    }
  }

  return {
    output: `${lines.join("\n")}\n`,
    count: map.size,
    keys: [...map.keys()],
    escapedCount,
  };
}
