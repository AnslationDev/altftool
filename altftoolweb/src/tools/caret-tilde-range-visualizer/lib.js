/**
 * Caret / tilde version-window maths, per the node-semver "Ranges" documentation
 * (github.com/npm/node-semver#ranges) implemented by npm, pnpm and yarn:
 *
 *   Caret — allows changes that do not modify the left-most non-zero digit:
 *     ^1.2.3 := >=1.2.3 <2.0.0
 *     ^0.2.3 := >=0.2.3 <0.3.0
 *     ^0.0.3 := >=0.0.3 <0.0.4
 *   Tilde — allows patch-level changes when a minor is specified:
 *     ~1.2.3 := >=1.2.3 <1.3.0
 */

const VERSION_RE = /^(\d+)\.(\d+)\.(\d+)$/;

/** Parse a plain x.y.z version (no pre-release — windows are about release lines). */
export function parseVersion(text) {
  const match = String(text ?? "").trim().match(VERSION_RE);
  if (!match) return null;
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) };
}

export function formatVersion(v) {
  return `${v.major}.${v.minor}.${v.patch}`;
}

export function compareVersions(a, b) {
  for (const key of ["major", "minor", "patch"]) {
    if (a[key] !== b[key]) return a[key] < b[key] ? -1 : 1;
  }
  return 0;
}

/** First version EXCLUDED by ^version (left-most non-zero digit stays fixed). */
export function caretUpperBound(v) {
  if (v.major > 0) return { major: v.major + 1, minor: 0, patch: 0 };
  if (v.minor > 0) return { major: 0, minor: v.minor + 1, patch: 0 };
  return { major: 0, minor: v.minor, patch: v.patch + 1 };
}

/** First version EXCLUDED by ~version (patch-level changes only). */
export function tildeUpperBound(v) {
  return { major: v.major, minor: v.minor + 1, patch: 0 };
}

export const OPERATORS = [
  { id: "^", label: "Caret ^ — minor + patch updates" },
  { id: "~", label: "Tilde ~ — patch updates only" },
];

/**
 * Compute the allowed window and a set of neighbouring versions for the number line.
 * @param {object} input
 * @param {string} input.op          "^" or "~".
 * @param {string} input.versionText Base version, x.y.z.
 * @returns {{rangeText:string, comparators:string, min:string, maxExclusive:string, rule:string,
 *            sameWindow:boolean, candidates:Array<{version:string, allowed:boolean, kind:string, isBase:boolean}>}|{error:string}}
 */
export function computeWindow({ op, versionText }) {
  if (op !== "^" && op !== "~") return { error: "Choose the caret (^) or tilde (~) operator." };
  const v = parseVersion(versionText);
  if (!v) return { error: "Enter the base version as three numbers, e.g. 1.2.3." };

  const upper = op === "^" ? caretUpperBound(v) : tildeUpperBound(v);
  const caretBound = caretUpperBound(v);
  const tildeBound = tildeUpperBound(v);
  const sameWindow = compareVersions(caretBound, tildeBound) === 0;

  let rule;
  if (op === "~") {
    rule = "Tilde allows patch-level changes: the major and minor digits are frozen.";
  } else if (v.major > 0) {
    rule = "Caret freezes the left-most non-zero digit — here the major — so minor and patch may move.";
  } else if (v.minor > 0) {
    rule = "Caret on a 0.x version freezes the minor digit, so only patch updates are allowed.";
  } else {
    rule = "Caret on a 0.0.x version freezes everything — only this exact version matches.";
  }

  // Neighbours to plot: below the window, the base, inside, and at/after the bound.
  const raw = [];
  if (v.patch > 0) raw.push({ v: { ...v, patch: v.patch - 1 }, kind: "previous patch" });
  else if (v.minor > 0) raw.push({ v: { major: v.major, minor: v.minor - 1, patch: 0 }, kind: "previous minor" });
  else if (v.major > 0) raw.push({ v: { major: v.major - 1, minor: 0, patch: 0 }, kind: "previous major" });
  raw.push({ v, kind: "base version" });
  raw.push({ v: { ...v, patch: v.patch + 1 }, kind: "next patch" });
  raw.push({ v: { ...v, patch: v.patch + 2 }, kind: "later patch" });
  raw.push({ v: { major: v.major, minor: v.minor + 1, patch: 0 }, kind: "next minor" });
  raw.push({ v: { major: v.major + 1, minor: 0, patch: 0 }, kind: "next major" });
  raw.push({ v: upper, kind: "first excluded" });

  const seen = new Set();
  const candidates = [];
  for (const entry of raw.sort((a, b) => compareVersions(a.v, b.v))) {
    const key = formatVersion(entry.v);
    if (seen.has(key)) continue;
    seen.add(key);
    candidates.push({
      version: key,
      kind: entry.kind,
      isBase: compareVersions(entry.v, v) === 0,
      allowed: compareVersions(entry.v, v) >= 0 && compareVersions(entry.v, upper) < 0,
    });
  }

  return {
    rangeText: `${op}${formatVersion(v)}`,
    comparators: `>=${formatVersion(v)} <${formatVersion(upper)}`,
    min: formatVersion(v),
    maxExclusive: formatVersion(upper),
    rule,
    sameWindow,
    candidates,
  };
}
