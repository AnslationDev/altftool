/**
 * Semantic Versioning bump decision rules, straight from the SemVer 2.0.0
 * specification (semver.org):
 *   item 8 — MAJOR when you make incompatible API changes;
 *   item 7 — MINOR when you add functionality in a backward compatible manner,
 *            or deprecate public API functionality;
 *   item 6 — PATCH when you make backward compatible bug fixes;
 *   item 4 — major version zero (0.y.z): anything MAY change at any time
 *            (the widespread convention, matched by npm's caret behaviour, is
 *            to treat 0.x minor bumps as the "breaking" slot);
 *   item 5 — 1.0.0 defines the public API.
 * Version increment behaviour on pre-releases mirrors node-semver's inc():
 * bumping the level a pre-release already targets just clears the tag.
 */

export const QUESTIONS = [
  {
    id: "removedApi",
    label: "Removed or renamed anything public (function, endpoint, option, export)",
    hint: "Existing consumer code stops compiling or resolving.",
    severity: "breaking",
  },
  {
    id: "changedBehavior",
    label: "Changed documented behaviour, types, defaults or error contracts incompatibly",
    hint: "Same call, different observable result.",
    severity: "breaking",
  },
  {
    id: "raisedRequirements",
    label: "Raised platform requirements (Node/OS/runtime versions, peer dependencies)",
    hint: "Consumers on the old platform can no longer install or run it.",
    severity: "breaking",
  },
  {
    id: "addedFeature",
    label: "Added new backwards-compatible functionality",
    hint: "New API surface; everything existing still works.",
    severity: "feature",
  },
  {
    id: "deprecatedApi",
    label: "Deprecated public API (still works, now warns)",
    hint: "Spec item 7 requires at least a MINOR bump for deprecations.",
    severity: "feature",
  },
  {
    id: "bugFix",
    label: "Fixed a bug without changing the documented contract",
    hint: "Behaviour now matches what the docs always promised.",
    severity: "fix",
  },
  {
    id: "internalOnly",
    label: "Internal refactor, docs, tests or build changes only",
    hint: "No observable difference for consumers.",
    severity: "fix",
  },
];

const VERSION_RE = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-.]+))?(?:\+[0-9A-Za-z-.]+)?$/;

/** Parse "1.2.3" / "1.2.3-rc.1" into parts, or null. */
export function parseVersion(text) {
  const match = String(text ?? "").trim().match(VERSION_RE);
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4] ? match[4].split(".") : [],
  };
}

/** node-semver inc() semantics for major/minor/patch on a possibly pre-release version. */
export function bumpVersion(versionText, level) {
  const v = parseVersion(versionText);
  if (!v) return null;
  const hasPre = v.prerelease.length > 0;
  if (level === "major") {
    // Pre-major (x.0.0-tag) just finalises; otherwise increment major.
    if (hasPre && v.minor === 0 && v.patch === 0) return `${v.major}.0.0`;
    return `${v.major + 1}.0.0`;
  }
  if (level === "minor") {
    // Pre-minor (x.y.0-tag) just finalises; otherwise increment minor.
    if (hasPre && v.patch === 0) return `${v.major}.${v.minor}.0`;
    return `${v.major}.${v.minor + 1}.0`;
  }
  // patch: a pre-release just finalises to its own x.y.z; otherwise increment patch.
  if (hasPre) return `${v.major}.${v.minor}.${v.patch}`;
  return `${v.major}.${v.minor}.${v.patch + 1}`;
}

/**
 * Decide the bump from the answered checklist.
 *
 * @param {object} input
 * @param {string} input.currentVersion       Current released version, e.g. "1.4.2".
 * @param {object} input.answers              Map of question id -> boolean.
 * @param {boolean} [input.declareStable]     Promote a 0.x package to 1.0.0 with this release.
 * @returns {{bump:string, nextVersion:string, reason:string, specRule:string, zeroMajor:boolean, notes:string[]}|{error:string}}
 */
export function decideBump({ currentVersion, answers = {}, declareStable = false }) {
  const version = parseVersion(currentVersion);
  if (!version) {
    return { error: "Enter the current version in x.y.z form, e.g. 1.4.2 or 0.9.0-rc.1." };
  }

  const checked = QUESTIONS.filter((question) => answers[question.id] === true);
  if (checked.length === 0 && !declareStable) {
    return { error: "Tick at least one statement that describes this release." };
  }

  const hasBreaking = checked.some((question) => question.severity === "breaking");
  const hasFeature = checked.some((question) => question.severity === "feature");
  const zeroMajor = version.major === 0;
  const notes = [];

  if (declareStable) {
    if (!zeroMajor) {
      notes.push("Already at or past 1.0.0 — 'declare stable' only applies to 0.x packages.");
    } else {
      return {
        bump: "major",
        nextVersion: "1.0.0",
        reason:
          "You chose to declare the public API stable. SemVer item 5 says 1.0.0 defines the public API; from here on the normal major/minor/patch rules bind you.",
        specRule: "SemVer 2.0.0, item 5",
        zeroMajor,
        notes,
      };
    }
  }

  if (hasBreaking) {
    if (zeroMajor) {
      return {
        bump: "minor",
        nextVersion: bumpVersion(currentVersion, "minor"),
        reason:
          "Breaking change on a 0.x package: SemVer item 4 says anything may change during initial development, and the ecosystem convention (matched by npm's ^0.x behaviour) is to signal breakage by bumping the minor digit.",
        specRule: "SemVer 2.0.0, item 4 (major version zero)",
        zeroMajor,
        notes: [...notes, "If the API is actually stable, consider releasing 1.0.0 instead (item 5)."],
      };
    }
    return {
      bump: "major",
      nextVersion: bumpVersion(currentVersion, "major"),
      reason:
        "You made an incompatible API change, so the major version must be incremented. Removing, renaming, or changing documented behaviour of public API all qualify.",
      specRule: "SemVer 2.0.0, item 8",
      zeroMajor,
      notes,
    };
  }

  if (hasFeature) {
    return {
      bump: zeroMajor ? "patch" : "minor",
      nextVersion: bumpVersion(currentVersion, zeroMajor ? "patch" : "minor"),
      reason: zeroMajor
        ? "New backwards-compatible functionality on a 0.x package: the common 0.x convention keeps additive changes in the patch digit, reserving minor for breakage."
        : "You added backwards-compatible functionality or deprecated public API, which requires at least a minor bump. Deprecations alone also mandate a minor bump under item 7.",
      specRule: zeroMajor ? "SemVer 2.0.0, item 4 (major version zero)" : "SemVer 2.0.0, item 7",
      zeroMajor,
      notes,
    };
  }

  return {
    bump: "patch",
    nextVersion: bumpVersion(currentVersion, "patch"),
    reason:
      "Only backwards-compatible bug fixes or internal changes: a patch bump is enough. Item 3 still requires any modified release to get a new version number.",
    specRule: "SemVer 2.0.0, items 6 and 3",
    zeroMajor,
    notes,
  };
}
