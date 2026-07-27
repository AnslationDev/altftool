/**
 * .env file diff.
 *
 * Parsing follows the de-facto dotenv rules established by motdotla/dotenv
 * (the npm "dotenv" package, whose format most runtimes copy):
 * - one KEY=VALUE per line, optional leading "export ";
 * - lines whose first non-blank character is "#" are comments;
 * - values may be wrapped in single, double or backtick quotes; double-quoted
 *   values expand \n, \r and \t escapes; quoted values may span lines;
 * - in UNQUOTED values a "#" starts an inline comment and the value is trimmed;
 * - when a key appears twice, the LAST assignment wins (dotenv's parse()
 *   overwrites earlier keys as it scans down the file).
 */

/** Escape sequences expanded inside double-quoted values, per dotenv. */
const DOUBLE_QUOTE_ESCAPES = [
  [/\\n/g, "\n"],
  [/\\r/g, "\r"],
  [/\\t/g, "\t"],
  [/\\"/g, '"'],
  [/\\\\/g, "\\"],
];

/** Find the first unescaped closing quote `q` in `text`, or -1. */
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
 * Parse a .env document.
 *
 * @param {string} text
 * @returns {{ entries: Array<{key:string,value:string,line:number}>,
 *             map: Map<string,{value:string,line:number}>,
 *             duplicates: string[], invalidLines: number[] }}
 */
export function parseEnv(text) {
  const entries = [];
  const invalidLines = [];
  const lines = String(text ?? "").split(/\r?\n/);

  for (let i = 0; i < lines.length; i += 1) {
    const startLine = i + 1;
    const trimmed = lines[i].trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^(?:export\s+)?([^=\s]+)\s*=\s*(.*)$/);
    if (!match) {
      invalidLines.push(startLine);
      continue;
    }

    const key = match[1];
    const rest = match[2];
    let value;
    const q = rest[0];

    if (q === '"' || q === "'" || q === "`") {
      let buf = rest.slice(1);
      let closed = false;
      while (true) {
        const idx = findClosingQuote(buf, q);
        if (idx !== -1) {
          value = buf.slice(0, idx);
          closed = true;
          break;
        }
        if (i + 1 >= lines.length) break;
        i += 1;
        buf += `\n${lines[i]}`;
      }
      if (!closed) value = buf; // tolerate an unclosed quote: take the remainder
      if (q === '"') {
        for (const [pattern, replacement] of DOUBLE_QUOTE_ESCAPES) {
          value = value.replace(pattern, replacement);
        }
      }
    } else {
      // Unquoted: "#" begins an inline comment; surrounding whitespace is trimmed.
      const hashIdx = rest.indexOf("#");
      value = (hashIdx === -1 ? rest : rest.slice(0, hashIdx)).trim();
    }

    entries.push({ key, value, line: startLine });
  }

  const map = new Map();
  const duplicates = [];
  for (const entry of entries) {
    if (map.has(entry.key) && !duplicates.includes(entry.key)) duplicates.push(entry.key);
    map.set(entry.key, { value: entry.value, line: entry.line }); // last wins, per dotenv
  }

  return { entries, map, duplicates, invalidLines };
}

/**
 * Diff two .env documents A ("left", e.g. .env.example or staging) and
 * B ("right", e.g. production). Values compare AFTER parsing, so FOO=bar and
 * FOO="bar" are treated as equal — quoting style is not a difference.
 *
 * @returns {object} { missingInB, missingInA, changed, unchanged, counts, ... }
 *   or { error } when both inputs are empty.
 */
export function diffEnv(textA, textB) {
  const a = parseEnv(textA);
  const b = parseEnv(textB);

  if (a.entries.length === 0 && b.entries.length === 0) {
    return { error: "Paste at least one variable into either file to compare." };
  }

  const missingInB = []; // present in A only
  const missingInA = []; // present in B only
  const changed = [];
  const unchanged = [];

  for (const [key, { value }] of a.map) {
    if (!b.map.has(key)) {
      missingInB.push({ key, valueA: value });
    } else {
      const valueB = b.map.get(key).value;
      if (valueB === value) unchanged.push({ key, value });
      else changed.push({ key, valueA: value, valueB });
    }
  }
  for (const [key, { value }] of b.map) {
    if (!a.map.has(key)) missingInA.push({ key, valueB: value });
  }

  const differences = missingInB.length + missingInA.length + changed.length;

  return {
    missingInB,
    missingInA,
    changed,
    unchanged,
    duplicatesA: a.duplicates,
    duplicatesB: b.duplicates,
    invalidLinesA: a.invalidLines,
    invalidLinesB: b.invalidLines,
    counts: {
      keysA: a.map.size,
      keysB: b.map.size,
      missingInB: missingInB.length,
      missingInA: missingInA.length,
      changed: changed.length,
      unchanged: unchanged.length,
      differences,
    },
    inSync: differences === 0,
  };
}

/** Plain-text report of a diff result, for the copy button. */
export function formatDiffReport(diff) {
  if (!diff || diff.error) return "";
  const lines = [
    `Env diff: ${diff.counts.differences} difference(s)`,
    ...diff.missingInB.map((r) => `- only in File A: ${r.key}`),
    ...diff.missingInA.map((r) => `+ only in File B: ${r.key}`),
    ...diff.changed.map((r) => `~ changed: ${r.key} ("${r.valueA}" -> "${r.valueB}")`),
  ];
  if (diff.counts.differences === 0) lines.push("Files define identical variables.");
  return lines.join("\n");
}
