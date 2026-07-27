/**
 * .env -> .env.example generator.
 *
 * The .env.example convention (popularised by dotenv's own README and by
 * Laravel/Rails starter templates) is: commit a file with the SAME keys,
 * comments and ordering as the real .env, but with secret values removed, so
 * new contributors know which variables to provide without seeing credentials.
 *
 * Line syntax handled follows the de-facto dotenv format (motdotla/dotenv):
 * optional "export " prefix, "#" comments, and single/double/backtick quoted
 * values that may span multiple lines (all continuation lines are consumed and
 * collapsed into one placeholder line).
 */

/** Placeholder styles for stripped values. */
export const PLACEHOLDER_STYLES = [
  { id: "empty", label: "KEY= (blank value)" },
  { id: "angle", label: "KEY=<KEY> (angle-bracket placeholder)" },
  { id: "changeme", label: "KEY=changeme" },
];

/**
 * Key-name fragments that always indicate a credential. Sourced from the
 * detector lists used by common secret scanners (gitleaks' default rules and
 * GitHub push-protection categories): these keys are ALWAYS stripped, even
 * when "keep non-secret values" is on.
 */
export const SECRET_KEY_PATTERN =
  /(SECRET|TOKEN|PASSWORD|PASSWD|PWD|API_?KEY|APIKEY|PRIVATE|CREDENTIAL|AUTH|DSN|SALT|SIGNATURE|CERT|LICENSE_?KEY|ACCESS_?KEY|CLIENT_?ID|CLIENT_?SECRET|WEBHOOK)/i;

/**
 * Keys whose values are conventionally NOT secrets and are useful to keep in
 * an example file (framework/runtime switches, ports, locales). Kept only when
 * the caller opts in AND the key does not also match SECRET_KEY_PATTERN.
 */
export const SAFE_KEY_PATTERN =
  /^(NODE_ENV|APP_ENV|RAILS_ENV|ENV|ENVIRONMENT|PORT|HOST|HOSTNAME|LOG_LEVEL|LOG_FORMAT|TZ|LANG|LOCALE|DEBUG|CI)$/i;

/** Values that are plainly non-sensitive booleans/modes, safe to keep. */
export const SAFE_VALUE_PATTERN =
  /^(true|false|0|1|development|production|test|staging|local|info|debug|warn|error)$/i;

function isQuote(ch) {
  return ch === '"' || ch === "'" || ch === "`";
}

/** Find the first unescaped `q` in `text`, or -1. */
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
 * Generate a .env.example from a real .env.
 *
 * @param {string} text .env contents.
 * @param {object} [options]
 * @param {"empty"|"angle"|"changeme"} [options.placeholderStyle="empty"]
 * @param {boolean} [options.keepComments=true]   Keep # comment lines.
 * @param {boolean} [options.keepBlankLines=true] Keep blank separator lines.
 * @param {boolean} [options.keepSafeValues=false] Keep values for well-known
 *   non-secret keys (NODE_ENV, PORT, ...) and plain boolean/mode values.
 * @returns {object} { output, totalVars, strippedCount, keptCount, keptKeys } or { error }.
 */
export function generateEnvExample(
  text,
  { placeholderStyle = "empty", keepComments = true, keepBlankLines = true, keepSafeValues = false } = {},
) {
  if (!PLACEHOLDER_STYLES.some((s) => s.id === placeholderStyle)) {
    return { error: "Unknown placeholder style." };
  }

  const lines = String(text ?? "").split(/\r?\n/);
  const out = [];
  let totalVars = 0;
  let keptCount = 0;
  const keptKeys = [];

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    const trimmed = raw.trim();

    if (trimmed === "") {
      if (keepBlankLines) out.push("");
      continue;
    }
    if (trimmed.startsWith("#")) {
      if (keepComments) out.push(raw);
      continue;
    }

    const match = trimmed.match(/^(export\s+)?([^=\s]+)\s*=\s*(.*)$/);
    if (!match) {
      // Not a KEY=VALUE line — keep it verbatim so nothing silently vanishes.
      out.push(raw);
      continue;
    }

    const exportPrefix = match[1] ? "export " : "";
    const key = match[2];
    let rest = match[3];
    totalVars += 1;

    // Consume multiline quoted values so the continuation lines are dropped.
    let value = rest;
    const q = rest[0];
    if (isQuote(q)) {
      let buf = rest.slice(1);
      while (findClosingQuote(buf, q) === -1 && i + 1 < lines.length) {
        i += 1;
        buf += `\n${lines[i]}`;
      }
      const idx = findClosingQuote(buf, q);
      value = idx === -1 ? buf : buf.slice(0, idx);
    } else {
      const hashIdx = rest.indexOf("#");
      value = (hashIdx === -1 ? rest : rest.slice(0, hashIdx)).trim();
    }

    const secretKey = SECRET_KEY_PATTERN.test(key);
    const keepValue =
      keepSafeValues &&
      !secretKey &&
      (SAFE_KEY_PATTERN.test(key) || SAFE_VALUE_PATTERN.test(value));

    if (keepValue) {
      keptCount += 1;
      keptKeys.push(key);
      out.push(`${exportPrefix}${key}=${value}`);
    } else if (placeholderStyle === "angle") {
      out.push(`${exportPrefix}${key}=<${key}>`);
    } else if (placeholderStyle === "changeme") {
      out.push(`${exportPrefix}${key}=changeme`);
    } else {
      out.push(`${exportPrefix}${key}=`);
    }
  }

  if (totalVars === 0) {
    return { error: "No KEY=VALUE variables found — paste a .env file to convert." };
  }

  return {
    output: out.join("\n"),
    totalVars,
    strippedCount: totalVars - keptCount,
    keptCount,
    keptKeys,
  };
}
