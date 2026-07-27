/**
 * Icon file-name auditing.
 *
 * Pure functions only: strings in, plain objects out. No DOM, no React.
 */

/** The four naming conventions an icon set realistically uses. */
export const CASE_STYLES = Object.freeze([
  { id: "kebab", name: "kebab-case", example: "arrow-left-24.svg" },
  { id: "snake", name: "snake_case", example: "arrow_left_24.svg" },
  { id: "camel", name: "camelCase", example: "arrowLeft24.svg" },
  { id: "pascal", name: "PascalCase", example: "ArrowLeft24.svg" },
]);

/**
 * POSIX NAME_MAX on ext4 and APFS, and the per-component limit on NTFS, are
 * both 255. A longer file name cannot be checked out on either.
 */
export const MAX_FILENAME_LENGTH = 255;

/**
 * Characters Windows forbids in a file name, plus the forward slash that
 * POSIX forbids. Control characters below 0x20 are rejected separately.
 */
export const INVALID_FILENAME_CHARS = Object.freeze(["<", ">", ":", '"', "/", "\\", "|", "?", "*"]);

/**
 * Any ASCII control character (U+0000 to U+001F) or whitespace inside a file
 * name. Control characters are illegal on every file system and whitespace
 * breaks unquoted shell commands and URLs.
 */
const CONTROL_OR_SPACE_RE = new RegExp("[\\u0000-\\u001F\\s]");

/**
 * MS-DOS device names that Windows still reserves. A file called con.svg
 * cannot be created on Windows regardless of extension.
 */
export const WINDOWS_RESERVED_NAMES = Object.freeze(
  new Set([
    "con", "prn", "aux", "nul",
    "com1", "com2", "com3", "com4", "com5", "com6", "com7", "com8", "com9",
    "lpt1", "lpt2", "lpt3", "lpt4", "lpt5", "lpt6", "lpt7", "lpt8", "lpt9",
  ]),
);

/**
 * Break a name into lowercase word tokens.
 *
 * Separators (- _ space .) split first, then camel and Pascal boundaries, then
 * acronym-to-word boundaries such as APIKey -> API Key.
 *
 * @param {string} name
 * @param {boolean} [splitDigits] - also break letter/digit boundaries, so
 *   arrowLeft24 becomes arrow left 24. Off by default because it would turn
 *   icon-24px into icon 24 px.
 */
export function splitWords(name, splitDigits = false) {
  if (typeof name !== "string") return [];
  let working = name.replace(/[-_.\s]+/g, " ");
  working = working.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  working = working.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
  if (splitDigits) {
    working = working.replace(/([A-Za-z])(\d)/g, "$1 $2").replace(/(\d)([A-Za-z])/g, "$1 $2");
  }
  return working
    .split(/\s+/)
    .map((token) => token.toLowerCase())
    .filter(Boolean);
}

const capitalise = (word) => (word ? word[0].toUpperCase() + word.slice(1) : word);

/** Join tokens using the requested convention. */
export function formatWords(words, style) {
  if (!Array.isArray(words) || words.length === 0) return "";
  switch (style) {
    case "snake":
      return words.join("_");
    case "camel":
      return words[0] + words.slice(1).map(capitalise).join("");
    case "pascal":
      return words.map(capitalise).join("");
    case "kebab":
    default:
      return words.join("-");
  }
}

/**
 * Which convention a base name already follows.
 * @returns {"kebab"|"snake"|"camel"|"pascal"|"lower"|"mixed"}
 */
export function detectCase(base) {
  if (typeof base !== "string" || base.length === 0) return "mixed";
  if (/^[a-z0-9]+$/.test(base)) return "lower";
  if (/^[a-z0-9]+(-[a-z0-9]+)+$/.test(base)) return "kebab";
  if (/^[a-z0-9]+(_[a-z0-9]+)+$/.test(base)) return "snake";
  if (/^[a-z][a-zA-Z0-9]*$/.test(base) && /[A-Z]/.test(base)) return "camel";
  if (/^[A-Z][a-zA-Z0-9]*$/.test(base)) return "pascal";
  return "mixed";
}

/** Split "arrow-left.svg" into { base: "arrow-left", ext: "svg" }. */
export function splitExtension(fileName) {
  const trimmed = String(fileName || "").trim();
  const dot = trimmed.lastIndexOf(".");
  if (dot <= 0 || dot === trimmed.length - 1) return { base: trimmed, ext: "" };
  return { base: trimmed.slice(0, dot), ext: trimmed.slice(dot + 1) };
}

const ISSUE_LABELS = {
  case: "Wrong naming convention",
  prefix: "Missing prefix",
  extension: "Wrong extension",
  suffix: "Missing required suffix",
  chars: "Illegal character",
  reserved: "Reserved Windows name",
  length: "Name too long",
  empty: "Empty name",
  duplicate: "Collides with another name",
  caseOnly: "Differs from another name only by letter case",
};

/**
 * Audit a list of icon file names.
 *
 * @param {object} input
 * @param {string[]|string} input.names - one file name per line, or an array.
 * @param {string} [input.style] - kebab | snake | camel | pascal.
 * @param {string} [input.prefix] - required leading token, e.g. "icon".
 * @param {string} [input.extension] - required extension without the dot.
 * @param {string} [input.requiredSuffixes] - comma separated; a name must end with one.
 * @param {boolean} [input.splitDigits]
 * @returns {object} report, or { error } when there is nothing to audit.
 */
export function auditIconNames({
  names = "",
  style = "kebab",
  prefix = "",
  extension = "",
  requiredSuffixes = "",
  splitDigits = false,
} = {}) {
  const styleIds = CASE_STYLES.map((entry) => entry.id);
  if (!styleIds.includes(style)) {
    return { error: `Naming convention must be one of ${styleIds.join(", ")}.` };
  }

  const list = (Array.isArray(names) ? names : String(names).split(/\r?\n/))
    .map((value) => String(value).trim())
    .filter(Boolean);
  if (list.length === 0) {
    return { error: "Paste at least one icon file name, one per line." };
  }

  const prefixTokens = splitWords(prefix, splitDigits);
  const wantedExt = String(extension).trim().replace(/^\./, "").toLowerCase();
  const suffixList = String(requiredSuffixes)
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  const rows = list.map((original) => {
    const { base, ext } = splitExtension(original);
    const foundIssues = [];

    if (!base) foundIssues.push("empty");
    if (base.length + (ext ? ext.length + 1 : 0) > MAX_FILENAME_LENGTH) foundIssues.push("length");
    if (INVALID_FILENAME_CHARS.some((char) => original.includes(char)) || CONTROL_OR_SPACE_RE.test(original)) {
      foundIssues.push("chars");
    }
    if (WINDOWS_RESERVED_NAMES.has(base.toLowerCase())) foundIssues.push("reserved");

    let words = splitWords(base, splitDigits);
    if (prefixTokens.length > 0) {
      const startsWithPrefix = prefixTokens.every((token, index) => words[index] === token);
      if (!startsWithPrefix) {
        foundIssues.push("prefix");
        words = [...prefixTokens, ...words];
      }
    }

    if (suffixList.length > 0) {
      const tail = words[words.length - 1];
      if (!suffixList.includes(tail)) foundIssues.push("suffix");
    }

    const formattedBase = formatWords(words, style);
    if (formattedBase !== base) foundIssues.push("case");

    const finalExt = wantedExt || ext.toLowerCase();
    if (wantedExt && ext.toLowerCase() !== wantedExt) foundIssues.push("extension");

    const suggestion = finalExt ? `${formattedBase}.${finalExt}` : formattedBase;

    return {
      original,
      base,
      ext,
      detected: detectCase(base),
      words,
      suggestion,
      issues: foundIssues,
      ok: foundIssues.length === 0,
    };
  });

  // Collisions: two different source names that normalise to the same target,
  // and names that differ only by letter case (broken on a case-insensitive
  // file system such as default macOS or Windows).
  const bySuggestion = new Map();
  const byLowerOriginal = new Map();
  for (const row of rows) {
    const key = row.suggestion.toLowerCase();
    bySuggestion.set(key, [...(bySuggestion.get(key) || []), row.original]);
    const lower = row.original.toLowerCase();
    byLowerOriginal.set(lower, [...(byLowerOriginal.get(lower) || []), row.original]);
  }
  const duplicateGroups = [];
  for (const [key, members] of bySuggestion) {
    if (members.length > 1) duplicateGroups.push({ target: key, members });
  }
  const caseOnlyGroups = [];
  for (const [, members] of byLowerOriginal) {
    const unique = Array.from(new Set(members));
    if (unique.length > 1) caseOnlyGroups.push({ members: unique });
  }
  const duplicateOriginals = new Set(duplicateGroups.flatMap((group) => group.members));
  const caseOnlyOriginals = new Set(caseOnlyGroups.flatMap((group) => group.members));
  for (const row of rows) {
    if (duplicateOriginals.has(row.original)) {
      row.issues = [...row.issues, "duplicate"];
      row.ok = false;
    }
    if (caseOnlyOriginals.has(row.original)) {
      row.issues = [...row.issues, "caseOnly"];
      row.ok = false;
    }
  }

  const styleCounts = {};
  for (const row of rows) {
    styleCounts[row.detected] = (styleCounts[row.detected] || 0) + 1;
  }
  const dominantStyle = Object.entries(styleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "mixed";

  const okCount = rows.filter((row) => row.ok).length;
  const conformance = (okCount / rows.length) * 100;

  const issues = [];
  if (duplicateGroups.length > 0) {
    issues.push({
      level: "error",
      message: `${duplicateGroups.length} name${duplicateGroups.length > 1 ? "s" : ""} would collide after renaming (${duplicateGroups.map((group) => group.target).join(", ")}). Rename the sources before running a bulk change.`,
    });
  }
  if (caseOnlyGroups.length > 0) {
    issues.push({
      level: "error",
      message: "Some names differ only by letter case. Default macOS and Windows file systems treat those as the same file, so one will overwrite the other in git.",
    });
  }
  if (rows.some((row) => row.issues.includes("reserved"))) {
    issues.push({
      level: "error",
      message: "A name matches a reserved MS-DOS device name (con, prn, aux, nul, com1-9, lpt1-9). Windows refuses to create it whatever the extension.",
    });
  }
  if (rows.some((row) => row.issues.includes("chars"))) {
    issues.push({
      level: "error",
      message: `A name contains a character that is illegal on Windows or POSIX: ${INVALID_FILENAME_CHARS.join(" ")}`,
    });
  }
  const mixedCount = rows.filter((row) => row.detected === "mixed").length;
  if (mixedCount > 0) {
    issues.push({
      level: "warning",
      message: `${mixedCount} name${mixedCount > 1 ? "s follow" : " follows"} no recognisable convention at all.`,
    });
  }
  const offStyle = rows.filter((row) => row.issues.includes("case")).length;
  if (offStyle > 0) {
    issues.push({
      level: "warning",
      message: `${offStyle} of ${rows.length} names are not in ${CASE_STYLES.find((entry) => entry.id === style)?.name}. Use the suggested column to rename them.`,
    });
  }
  if (okCount === rows.length) {
    issues.push({ level: "info", message: "Every name already matches the rules you set." });
  }

  const status = issues.some((issue) => issue.level === "error")
    ? "error"
    : issues.some((issue) => issue.level === "warning")
      ? "warning"
      : "ok";

  return {
    rows,
    total: rows.length,
    okCount,
    issueCount: rows.length - okCount,
    conformance,
    styleCounts,
    dominantStyle,
    duplicateGroups,
    caseOnlyGroups,
    issueLabels: ISSUE_LABELS,
    style,
    issues,
    status,
  };
}

/** Ready-to-paste `git mv` lines for every name that needs renaming. */
export function buildRenamePlan(report) {
  if (!report || report.error || !Array.isArray(report.rows)) return "";
  return report.rows
    .filter((row) => row.original !== row.suggestion)
    .map((row) => `git mv "${row.original}" "${row.suggestion}"`)
    .join("\n");
}
