/**
 * Semver range parser and plain-English explainer.
 *
 * Range grammar and desugaring rules follow the node-semver "Ranges" documentation
 * (github.com/npm/node-semver#ranges), which is what npm, pnpm and yarn implement:
 *   ^1.2.3 := >=1.2.3 <2.0.0      (left-most non-zero digit stays fixed)
 *   ^0.2.3 := >=0.2.3 <0.3.0
 *   ^0.0.3 := >=0.0.3 <0.0.4
 *   ~1.2.3 := >=1.2.3 <1.3.0      (patch-level changes when minor given)
 *   ~1.2   := >=1.2.0 <1.3.0
 *   ~1     := >=1.0.0 <2.0.0
 *   1.2.x  := >=1.2.0 <1.3.0      (X-range)
 *   1.x    := >=1.0.0 <2.0.0
 *   *      := any version
 *   1.2.3 - 2.3.4 := >=1.2.3 <=2.3.4   (hyphen range; partial right end rounds up:
 *   1.2.3 - 2.3   := >=1.2.3 <2.4.0,   1.2.3 - 2 := >=1.2.3 <3.0.0)
 *   >1.2   := >=1.3.0,  <=1.2 := <1.3.0  (partials in comparators)
 * Precedence/ordering of versions follows SemVer 2.0.0 spec item 11 (semver.org),
 * including pre-release identifier comparison.
 */

const PARTIAL_RE = /^(\d+|x|X|\*)(?:\.(\d+|x|X|\*))?(?:\.(\d+|x|X|\*))?(?:-([0-9A-Za-z-.]+))?(?:\+[0-9A-Za-z-.]+)?$/;

function isWildcard(part) {
  return part === undefined || part === "x" || part === "X" || part === "*";
}

/** Parse "1.2.3-beta.1" (or a partial like "1.2", "1.x", "*") into a structured form, or null. */
export function parsePartial(text) {
  const raw = String(text ?? "").trim();
  if (raw === "" || raw === "*" || raw === "x" || raw === "X") {
    return { major: null, minor: null, patch: null, prerelease: [] };
  }
  const match = raw.match(PARTIAL_RE);
  if (!match) return null;
  const [, majorRaw, minorRaw, patchRaw, prereleaseRaw] = match;
  return {
    major: isWildcard(majorRaw) ? null : Number(majorRaw),
    minor: isWildcard(minorRaw) ? null : Number(minorRaw),
    patch: isWildcard(patchRaw) ? null : Number(patchRaw),
    prerelease: prereleaseRaw ? prereleaseRaw.split(".") : [],
  };
}

/** Parse a FULL version "1.2.3" / "1.2.3-rc.1" — no wildcards allowed. */
export function parseVersion(text) {
  const partial = parsePartial(text);
  if (!partial || partial.major === null || partial.minor === null || partial.patch === null) return null;
  return partial;
}

export function formatVersion(v) {
  const core = `${v.major}.${v.minor}.${v.patch}`;
  return v.prerelease.length > 0 ? `${core}-${v.prerelease.join(".")}` : core;
}

/** SemVer 2.0.0 item 11: compare two parsed full versions. Returns -1 | 0 | 1. */
export function compareVersions(a, b) {
  for (const key of ["major", "minor", "patch"]) {
    if (a[key] !== b[key]) return a[key] < b[key] ? -1 : 1;
  }
  const aPre = a.prerelease;
  const bPre = b.prerelease;
  if (aPre.length === 0 && bPre.length === 0) return 0;
  // A version without a pre-release has higher precedence (item 11.3).
  if (aPre.length === 0) return 1;
  if (bPre.length === 0) return -1;
  const len = Math.min(aPre.length, bPre.length);
  for (let i = 0; i < len; i += 1) {
    const ai = aPre[i];
    const bi = bPre[i];
    const aNum = /^\d+$/.test(ai);
    const bNum = /^\d+$/.test(bi);
    if (aNum && bNum) {
      if (Number(ai) !== Number(bi)) return Number(ai) < Number(bi) ? -1 : 1;
    } else if (aNum !== bNum) {
      // Numeric identifiers have lower precedence than alphanumeric (item 11.4.3).
      return aNum ? -1 : 1;
    } else if (ai !== bi) {
      return ai < bi ? -1 : 1;
    }
  }
  if (aPre.length !== bPre.length) return aPre.length < bPre.length ? -1 : 1;
  return 0;
}

const ZERO = { major: 0, minor: 0, patch: 0, prerelease: [] };
const ver = (major, minor, patch, prerelease = []) => ({ major, minor, patch, prerelease });

/** Desugar one primitive token (^x, ~x, >=x, plain x, x-range) into comparators. */
function desugarToken(token) {
  const opMatch = token.match(/^(>=|<=|>|<|=|\^|~)?(.*)$/);
  const op = opMatch[1] ?? "";
  const partial = parsePartial(opMatch[2]);
  if (!partial) return null;
  const { major, minor, patch, prerelease } = partial;

  // Fully wildcard: matches anything.
  if (major === null) return [];

  if (op === "^") {
    // Caret: left-most non-zero digit stays fixed (node-semver "Caret Ranges").
    const lower = ver(major, minor ?? 0, patch ?? 0, prerelease);
    let upper;
    if (major > 0 || minor === null) upper = ver(major + 1, 0, 0);
    else if (minor > 0 || patch === null) upper = ver(0, minor + 1, 0);
    else upper = ver(0, minor, patch + 1);
    return [
      { op: ">=", v: lower },
      { op: "<", v: upper },
    ];
  }

  if (op === "~") {
    // Tilde: patch-level changes if minor given, minor-level if not.
    const lower = ver(major, minor ?? 0, patch ?? 0, prerelease);
    const upper = minor === null ? ver(major + 1, 0, 0) : ver(major, minor + 1, 0);
    return [
      { op: ">=", v: lower },
      { op: "<", v: upper },
    ];
  }

  if (op === "" || op === "=") {
    if (minor === null) {
      return [
        { op: ">=", v: ver(major, 0, 0) },
        { op: "<", v: ver(major + 1, 0, 0) },
      ];
    }
    if (patch === null) {
      return [
        { op: ">=", v: ver(major, minor, 0) },
        { op: "<", v: ver(major, minor + 1, 0) },
      ];
    }
    return [{ op: "=", v: ver(major, minor, patch, prerelease) }];
  }

  // Comparators with partial versions (node-semver "X-Ranges" in comparators).
  if (minor === null) {
    if (op === ">") return [{ op: ">=", v: ver(major + 1, 0, 0) }];
    if (op === "<") return [{ op: "<", v: ver(major, 0, 0) }];
    if (op === ">=") return [{ op: ">=", v: ver(major, 0, 0) }];
    return [{ op: "<", v: ver(major + 1, 0, 0) }]; // <=
  }
  if (patch === null) {
    if (op === ">") return [{ op: ">=", v: ver(major, minor + 1, 0) }];
    if (op === "<") return [{ op: "<", v: ver(major, minor, 0) }];
    if (op === ">=") return [{ op: ">=", v: ver(major, minor, 0) }];
    return [{ op: "<", v: ver(major, minor + 1, 0) }]; // <=
  }
  return [{ op, v: ver(major, minor, patch, prerelease) }];
}

/** Desugar one space-separated comparator set, handling hyphen ranges. */
function desugarAlternative(text) {
  const trimmed = text.trim();
  if (trimmed === "") return [];

  const hyphen = trimmed.match(/^(\S+)\s+-\s+(\S+)$/);
  if (hyphen) {
    const left = parsePartial(hyphen[1]);
    const right = parsePartial(hyphen[2]);
    if (!left || !right) return null;
    const comparators = [];
    if (left.major !== null) {
      comparators.push({ op: ">=", v: ver(left.major, left.minor ?? 0, left.patch ?? 0, left.prerelease) });
    }
    if (right.major !== null) {
      if (right.minor === null) comparators.push({ op: "<", v: ver(right.major + 1, 0, 0) });
      else if (right.patch === null) comparators.push({ op: "<", v: ver(right.major, right.minor + 1, 0) });
      else comparators.push({ op: "<=", v: ver(right.major, right.minor, right.patch, right.prerelease) });
    }
    return comparators;
  }

  const tokens = trimmed.split(/\s+/);
  const comparators = [];
  for (const token of tokens) {
    const set = desugarToken(token);
    if (set === null) return null;
    comparators.push(...set);
  }
  return comparators;
}

function satisfiesComparator(version, { op, v }) {
  const cmp = compareVersions(version, v);
  if (op === "=") return cmp === 0;
  if (op === ">") return cmp > 0;
  if (op === ">=") return cmp >= 0;
  if (op === "<") return cmp < 0;
  return cmp <= 0; // <=
}

function satisfiesSet(version, comparators) {
  if (!comparators.every((comparator) => satisfiesComparator(version, comparator))) return false;
  // node-semver rule: a pre-release version only satisfies a set that contains a
  // comparator with a pre-release on the SAME [major, minor, patch] tuple.
  if (version.prerelease.length > 0) {
    return comparators.some(
      (comparator) =>
        comparator.v.prerelease.length > 0 &&
        comparator.v.major === version.major &&
        comparator.v.minor === version.minor &&
        comparator.v.patch === version.patch,
    );
  }
  return true;
}

/** Does `versionText` satisfy `rangeText`? Returns boolean, or null when either fails to parse. */
export function satisfies(versionText, rangeText) {
  const version = parseVersion(versionText);
  if (!version) return null;
  const alternatives = String(rangeText ?? "")
    .split("||")
    .map((part) => desugarAlternative(part));
  if (alternatives.some((set) => set === null)) return null;
  return alternatives.some((set) => satisfiesSet(version, set));
}

function englishForSet(comparators) {
  if (comparators.length === 0) return "any version at all";
  const eq = comparators.find((comparator) => comparator.op === "=");
  if (eq) return `exactly version ${formatVersion(eq.v)} and nothing else`;
  const lower = comparators.filter((comparator) => comparator.op === ">=" || comparator.op === ">");
  const upper = comparators.filter((comparator) => comparator.op === "<" || comparator.op === "<=");
  const parts = [];
  for (const bound of lower) {
    parts.push(bound.op === ">=" ? `${formatVersion(bound.v)} or newer` : `newer than ${formatVersion(bound.v)}`);
  }
  for (const bound of upper) {
    parts.push(
      bound.op === "<"
        ? `below ${formatVersion(bound.v)} (${formatVersion(bound.v)} itself is NOT allowed)`
        : `up to and including ${formatVersion(bound.v)}`,
    );
  }
  return parts.join(", and ");
}

function bump(version, level) {
  if (level === "patch") return ver(version.major, version.minor, version.patch + 1);
  if (level === "minor") return ver(version.major, version.minor + 1, 0);
  return ver(version.major + 1, 0, 0);
}

/**
 * Explain a full range expression (alternatives separated by ||).
 * @returns {{alternatives:Array<{source:string,comparators:string[],english:string}>, english:string, examples:{allowed:string[], blocked:string[]}}|{error:string}}
 */
export function explainRange(rangeText) {
  const raw = String(rangeText ?? "").trim();
  if (raw === "") return { error: "Enter a version range, e.g. ^1.2.3 or >=2.0.0 <3.0.0." };

  const sources = raw.split("||").map((part) => part.trim());
  const alternatives = [];
  for (const source of sources) {
    const set = desugarAlternative(source);
    if (set === null) {
      return { error: `Could not parse "${source}" — expected forms like ^1.2.3, ~1.2, 1.x, >=1.2.3 <2.0.0 or 1.2.3 - 2.0.0.` };
    }
    alternatives.push({
      source: source === "" ? "*" : source,
      comparators: set.map((comparator) => `${comparator.op}${formatVersion(comparator.v)}`),
      english: englishForSet(set),
      set,
    });
  }

  // Build example versions around each alternative's bounds.
  const candidates = new Map();
  const addCandidate = (version) => candidates.set(formatVersion(version), version);
  for (const alternative of alternatives) {
    if (alternative.set.length === 0) {
      addCandidate(ZERO);
      addCandidate(ver(1, 0, 0));
      addCandidate(ver(999, 0, 0));
      continue;
    }
    for (const comparator of alternative.set) {
      addCandidate(comparator.v);
      addCandidate(bump(comparator.v, "patch"));
      addCandidate(bump(comparator.v, "minor"));
      addCandidate(bump(comparator.v, "major"));
      if (comparator.v.patch > 0) addCandidate(ver(comparator.v.major, comparator.v.minor, comparator.v.patch - 1));
    }
  }

  const allowed = [];
  const blocked = [];
  const sorted = [...candidates.values()].sort(compareVersions);
  for (const candidate of sorted) {
    const ok = alternatives.some((alternative) => satisfiesSet(candidate, alternative.set));
    (ok ? allowed : blocked).push(formatVersion(candidate));
  }

  const english =
    alternatives.length === 1
      ? `This range accepts ${alternatives[0].english}.`
      : `This range accepts ${alternatives.map((alternative) => alternative.english).join(", OR ")}.`;

  return {
    alternatives: alternatives.map(({ source, comparators, english: setEnglish }) => ({
      source,
      comparators,
      english: setEnglish,
    })),
    english,
    examples: { allowed: allowed.slice(0, 6), blocked: blocked.slice(0, 6) },
  };
}

/** Preset ranges surfaced as one-tap examples in the UI. */
export const PRESET_RANGES = ["^1.2.3", "~1.2.3", "^0.2.3", "1.2.x", ">=1.2.3 <2.0.0", "1.2.3 - 2.3.4", "^1.0.0 || ^2.0.0", "*"];
