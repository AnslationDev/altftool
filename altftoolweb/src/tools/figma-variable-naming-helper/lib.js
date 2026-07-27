/**
 * Variable / style naming scheme builder and linter for design files.
 *
 * A name is modelled as an ordered list of segments. The scheme decides:
 *   - how segments are joined (the group separator; "/" creates folders in Figma)
 *   - how the words inside one segment are cased
 *   - whether a prefix and/or a collection name is prepended
 *
 * No network, no file parsing — pure string work so the same scheme can be
 * applied to generated starter tokens and to a pasted list of existing names.
 */

/** Word-casing applied inside a single segment. */
export const CASE_STYLES = ["kebab", "camel", "pascal", "snake", "flat"];

/**
 * Group separators. Figma treats "/" as a folder separator in both style names
 * and variable names, which is why it is the default here.
 */
export const SEPARATORS = ["/", ".", "-", "_"];

/** Segments longer than this are hard to scan in the layers panel. */
export const MAX_SEGMENT_LENGTH = 24;

/** Practical depth range: fewer than 2 is ambiguous, more than 5 is unreadable. */
export const MIN_DEPTH = 2;
export const MAX_DEPTH = 5;

/** Abbreviations that read differently to different people; spell them out. */
export const DISCOURAGED_ABBREVIATIONS = ["clr", "colr", "col", "txt", "bkg", "bg1", "sz", "bdr", "hgt", "wdt"];

/** CSS/platform length units that should live in the value, never in the name. */
export const UNIT_SUFFIXES = ["px", "rem", "em", "pt", "dp", "sp", "vh", "vw"];

/** Matches a number glued to a unit ("16px", "size-1.5rem") anywhere in a segment. */
const UNIT_PATTERN = new RegExp(`\\d\\s?(${UNIT_SUFFIXES.join("|")})\\b`, "i");

/** True when a segment bakes a measurement into the name. */
export function hasUnitInName(segment) {
  if (typeof segment !== "string") return false;
  if (UNIT_PATTERN.test(segment)) return true;
  return splitWords(segment).some((word) => UNIT_SUFFIXES.includes(word));
}

/**
 * Starter token set. Paths are stored as plain lowercase words so any scheme can
 * be applied to them. Tiers follow the common primitive -> semantic split.
 */
export const STARTER_TOKENS = [
  { tier: "primitive", parts: ["color", "neutral", "0"], note: "White end of the neutral ramp" },
  { tier: "primitive", parts: ["color", "neutral", "900"], note: "Darkest neutral" },
  { tier: "primitive", parts: ["color", "teal", "500"], note: "Brand hue, mid step" },
  { tier: "semantic", parts: ["color", "background", "canvas"], note: "Page background" },
  { tier: "semantic", parts: ["color", "background", "surface"], note: "Card and panel background" },
  { tier: "semantic", parts: ["color", "foreground", "default"], note: "Body text" },
  { tier: "semantic", parts: ["color", "foreground", "muted"], note: "Secondary text" },
  { tier: "semantic", parts: ["color", "foreground", "on", "primary"], note: "Text on a primary fill" },
  { tier: "semantic", parts: ["color", "border", "default"], note: "Default 1px border" },
  { tier: "semantic", parts: ["color", "border", "focus"], note: "Keyboard focus ring" },
  { tier: "semantic", parts: ["color", "action", "primary", "rest"], note: "Primary button, resting" },
  { tier: "semantic", parts: ["color", "action", "primary", "hover"], note: "Primary button, hover" },
  { tier: "semantic", parts: ["color", "feedback", "danger"], note: "Destructive and error" },
  { tier: "semantic", parts: ["color", "feedback", "success"], note: "Positive confirmation" },
  { tier: "primitive", parts: ["space", "100"], note: "4px base step" },
  { tier: "primitive", parts: ["space", "200"], note: "8px" },
  { tier: "primitive", parts: ["space", "400"], note: "16px" },
  { tier: "primitive", parts: ["space", "600"], note: "24px" },
  { tier: "primitive", parts: ["radius", "small"], note: "Inputs and chips" },
  { tier: "primitive", parts: ["radius", "medium"], note: "Cards" },
  { tier: "primitive", parts: ["radius", "full"], note: "Pills and avatars" },
  { tier: "semantic", parts: ["font", "size", "body"], note: "Base reading size" },
  { tier: "semantic", parts: ["font", "size", "heading", "1"], note: "Largest heading" },
  { tier: "semantic", parts: ["font", "weight", "regular"], note: "Body weight" },
  { tier: "semantic", parts: ["font", "weight", "bold"], note: "Emphasis weight" },
  { tier: "semantic", parts: ["font", "line", "height", "body"], note: "Body leading" },
  { tier: "semantic", parts: ["elevation", "raised"], note: "Card shadow" },
  { tier: "semantic", parts: ["elevation", "overlay"], note: "Modal and popover shadow" },
];

const NAME_SAFE = /^[A-Za-z0-9]+$/;

/** Split any input segment into lowercase words, handling camelCase boundaries. */
export function splitWords(segment) {
  if (typeof segment !== "string") return [];
  return segment
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Za-z])([0-9])/g, "$1 $2")
    .split(/[\s\-_.]+/)
    .map((word) => word.trim().toLowerCase())
    .filter(Boolean);
}

const capitalise = (word) => word.charAt(0).toUpperCase() + word.slice(1);

/** Apply a case style to one segment. */
export function applyCase(segment, caseStyle) {
  const words = splitWords(segment);
  if (words.length === 0) return "";
  switch (caseStyle) {
    case "camel":
      return words.map((word, index) => (index === 0 ? word : capitalise(word))).join("");
    case "pascal":
      return words.map(capitalise).join("");
    case "snake":
      return words.join("_");
    case "flat":
      return words.join("");
    case "kebab":
    default:
      return words.join("-");
  }
}

/** Fill in defaults and reject an unusable scheme. */
export function normaliseScheme(input) {
  const raw = input && typeof input === "object" ? input : {};
  const caseStyle = typeof raw.caseStyle === "string" ? raw.caseStyle : "kebab";
  const separator = typeof raw.separator === "string" ? raw.separator : "/";
  if (!CASE_STYLES.includes(caseStyle)) {
    return { error: `Case style must be one of: ${CASE_STYLES.join(", ")}.` };
  }
  if (!SEPARATORS.includes(separator)) {
    return { error: "Separator must be one of / . - or _." };
  }
  const prefix = typeof raw.prefix === "string" ? raw.prefix.trim() : "";
  if (prefix && !NAME_SAFE.test(prefix.replace(/[\s\-_.]/g, ""))) {
    return { error: "Prefix may only contain letters, numbers and word separators." };
  }
  const collection = typeof raw.collection === "string" ? raw.collection.trim() : "";
  if (collection && !NAME_SAFE.test(collection.replace(/[\s\-_.]/g, ""))) {
    return { error: "Collection name may only contain letters, numbers and word separators." };
  }
  return {
    caseStyle,
    separator,
    prefix,
    collection,
    includeTier: raw.includeTier === true,
  };
}

/** Join segments into a finished name under the given scheme. */
export function formatName(parts, scheme) {
  const normalised = normaliseScheme(scheme);
  if (normalised.error) return normalised;
  const segments = (Array.isArray(parts) ? parts : [])
    .map((part) => applyCase(part, normalised.caseStyle))
    .filter(Boolean);
  if (segments.length === 0) return { error: "Give at least one name segment." };
  const lead = [];
  if (normalised.prefix) lead.push(applyCase(normalised.prefix, normalised.caseStyle));
  if (normalised.collection) lead.push(applyCase(normalised.collection, normalised.caseStyle));
  return { name: [...lead, ...segments].join(normalised.separator), depth: lead.length + segments.length };
}

/** Generate the starter token set rendered in the chosen scheme. */
export function generateTokenNames(scheme, tierFilter) {
  const normalised = normaliseScheme(scheme);
  if (normalised.error) return normalised;

  const wanted =
    tierFilter === "primitive" || tierFilter === "semantic" ? tierFilter : "all";

  const rows = [];
  for (const token of STARTER_TOKENS) {
    if (wanted !== "all" && token.tier !== wanted) continue;
    const parts = normalised.includeTier ? [token.tier, ...token.parts] : token.parts;
    const built = formatName(parts, normalised);
    if (built.error) return built;
    rows.push({ name: built.name, depth: built.depth, tier: token.tier, note: token.note });
  }
  if (rows.length === 0) return { error: "No tokens match that tier filter." };

  const maxDepth = rows.reduce((max, row) => Math.max(max, row.depth), 0);
  const longest = rows.reduce((max, row) => Math.max(max, row.name.length), 0);
  return { rows, count: rows.length, maxDepth, longestName: longest, scheme: normalised };
}

/** Human-readable description of the scheme, used as documentation for the team. */
export function schemeSummary(scheme) {
  const normalised = normaliseScheme(scheme);
  if (normalised.error) return normalised;
  const caseText = {
    kebab: "kebab-case",
    camel: "camelCase",
    pascal: "PascalCase",
    snake: "snake_case",
    flat: "flatcase",
  }[normalised.caseStyle];
  const parts = [
    `Segments are joined with "${normalised.separator}".`,
    `Words inside a segment use ${caseText}.`,
    `Depth is kept between ${MIN_DEPTH} and ${MAX_DEPTH} segments.`,
  ];
  if (normalised.prefix) parts.push(`Every name starts with the prefix "${applyCase(normalised.prefix, normalised.caseStyle)}".`);
  if (normalised.collection) parts.push(`Names are grouped under the collection "${applyCase(normalised.collection, normalised.caseStyle)}".`);
  if (normalised.includeTier) parts.push("The tier (primitive or semantic) is the first content segment.");
  if (normalised.separator === "-" && normalised.caseStyle === "kebab") {
    parts.push("Warning: a hyphen separator with kebab-case makes group boundaries ambiguous.");
  }
  if (normalised.separator !== "/") {
    parts.push('Note: only "/" creates folders in the Figma variables and styles panels.');
  }
  return { text: parts.join(" "), lines: parts };
}

const ISSUE_LABELS = {
  empty: "Empty segment (leading, trailing or doubled separator)",
  space: "Contains a space",
  charset: "Contains characters outside letters, numbers and separators",
  separator: "Uses a separator that is not the scheme separator",
  case: "Segment casing does not match the scheme",
  shallow: `Fewer than ${MIN_DEPTH} segments — too ambiguous to reuse`,
  deep: `More than ${MAX_DEPTH} segments — hard to scan`,
  long: `Segment longer than ${MAX_SEGMENT_LENGTH} characters`,
  abbreviation: "Uses a discouraged abbreviation",
  unit: "Encodes a unit in the name; keep units in the value",
  duplicate: "Duplicate of an earlier name once casing is ignored",
};

/** Severity per issue: "error" breaks the scheme, "warning" is a smell. */
const ISSUE_SEVERITY = {
  empty: "error",
  space: "error",
  charset: "error",
  separator: "error",
  case: "warning",
  shallow: "warning",
  deep: "warning",
  long: "warning",
  abbreviation: "warning",
  unit: "warning",
  duplicate: "error",
};

export function issueLabel(id) {
  return ISSUE_LABELS[id] || id;
}

export function issueSeverity(id) {
  return ISSUE_SEVERITY[id] || "warning";
}

/**
 * Lint a newline-separated list of existing names against the scheme.
 * Returns one row per non-empty line plus a totals summary.
 */
export function lintNames(text, scheme) {
  const normalised = normaliseScheme(scheme);
  if (normalised.error) return normalised;
  if (typeof text !== "string" || text.trim() === "") {
    return { error: "Paste at least one existing name to lint." };
  }

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return { error: "Paste at least one existing name to lint." };

  const seen = new Map();
  // kebab-case joins words with "-" and snake_case with "_", so those characters
  // are legal inside a segment and must not be reported as a stray separator.
  const intraWordChar = { kebab: "-", snake: "_" }[normalised.caseStyle] || "";
  const otherSeparators = SEPARATORS.filter(
    (value) => value !== normalised.separator && value !== intraWordChar,
  );
  const rows = [];
  let errorCount = 0;
  let warningCount = 0;
  let cleanCount = 0;

  for (const line of lines) {
    const issues = [];
    if (/\s/.test(line)) issues.push("space");
    if (otherSeparators.some((value) => line.includes(value))) issues.push("separator");
    if (/[^A-Za-z0-9/._\-\s]/.test(line)) issues.push("charset");

    const segments = line.split(normalised.separator);
    if (segments.some((segment) => segment.trim() === "")) issues.push("empty");
    if (segments.length < MIN_DEPTH) issues.push("shallow");
    if (segments.length > MAX_DEPTH) issues.push("deep");
    if (segments.some((segment) => segment.length > MAX_SEGMENT_LENGTH)) issues.push("long");

    const words = segments.flatMap((segment) => splitWords(segment));
    if (words.some((word) => DISCOURAGED_ABBREVIATIONS.includes(word))) issues.push("abbreviation");
    if (segments.some(hasUnitInName)) issues.push("unit");

    const suggested = segments
      .map((segment) => applyCase(segment, normalised.caseStyle))
      .filter(Boolean)
      .join(normalised.separator);
    if (suggested !== line && !issues.includes("space") && !issues.includes("separator")) {
      issues.push("case");
    }

    const key = line.toLowerCase();
    if (seen.has(key)) issues.push("duplicate");
    else seen.set(key, true);

    const severities = issues.map(issueSeverity);
    const status = severities.includes("error")
      ? "error"
      : severities.length > 0
        ? "warning"
        : "clean";
    if (status === "error") errorCount += 1;
    else if (status === "warning") warningCount += 1;
    else cleanCount += 1;

    rows.push({ input: line, suggested, issues, status, segments: segments.length });
  }

  const total = rows.length;
  return {
    rows,
    total,
    errorCount,
    warningCount,
    cleanCount,
    passRate: total > 0 ? Math.round((cleanCount / total) * 1000) / 10 : 0,
  };
}
