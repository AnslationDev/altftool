/**
 * The six change types defined by Keep a Changelog 1.1.0, in the order the
 * specification prints them. `impact` is the smallest Semantic Versioning 2.0.0
 * bump the type can justify on its own:
 *   - MAJOR for an incompatible API change (SemVer §8)
 *   - MINOR for backwards-compatible new functionality (SemVer §7)
 *   - PATCH for backwards-compatible bug fixes (SemVer §6)
 */
export const CHANGE_TYPES = [
  {
    key: "added",
    label: "Added",
    hint: "New endpoints, fields, query parameters or scopes.",
    impact: "minor",
    alwaysBreaking: false,
  },
  {
    key: "changed",
    label: "Changed",
    hint: "Existing behaviour that now works differently.",
    impact: "minor",
    alwaysBreaking: false,
  },
  {
    key: "deprecated",
    label: "Deprecated",
    hint: "Still works, but scheduled for removal — announce the sunset date.",
    impact: "minor",
    alwaysBreaking: false,
  },
  {
    key: "removed",
    label: "Removed",
    hint: "Endpoints, fields or values that no longer exist.",
    impact: "major",
    alwaysBreaking: true,
  },
  {
    key: "fixed",
    label: "Fixed",
    hint: "Bug fixes that restore documented behaviour.",
    impact: "patch",
    alwaysBreaking: false,
  },
  {
    key: "security",
    label: "Security",
    hint: "Vulnerability fixes — link the advisory, not the exploit.",
    impact: "patch",
    alwaysBreaking: false,
  },
];

export const CHANGE_TYPE_KEYS = CHANGE_TYPES.map((type) => type.key);

/** Bump levels ordered from largest to smallest. */
export const BUMP_LEVELS = ["major", "minor", "patch"];

const BUMP_RANK = { major: 3, minor: 2, patch: 1, none: 0 };

/**
 * Semantic Versioning 2.0.0 §9/§10 — MAJOR.MINOR.PATCH with an optional
 * pre-release and build-metadata suffix. Leading zeroes are not allowed.
 */
export const SEMVER_RE =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;

/** ISO 8601 calendar date, the format Keep a Changelog requires for headings. */
export const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse a Semantic Versioning string. Returns null when it is not valid SemVer. */
export function parseSemver(version) {
  const match = SEMVER_RE.exec(String(version == null ? "" : version).trim());
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4] || "",
    build: match[5] || "",
  };
}

/**
 * Apply a SemVer bump. Pre-release and build metadata are dropped, and a patch
 * bump on a pre-release simply promotes it to the final release — the same
 * behaviour as `npm version patch` on `1.0.0-rc.1`.
 */
export function bumpVersion(current, level) {
  const parsed = parseSemver(current);
  if (!parsed) {
    return { error: `"${current}" is not a valid Semantic Version — use MAJOR.MINOR.PATCH.` };
  }
  if (!BUMP_LEVELS.includes(level)) {
    return { error: "Bump level must be major, minor or patch." };
  }

  if (parsed.prerelease && level === "patch") {
    return { version: `${parsed.major}.${parsed.minor}.${parsed.patch}`, promotedPrerelease: true };
  }
  if (level === "major") return { version: `${parsed.major + 1}.0.0`, promotedPrerelease: false };
  if (level === "minor") {
    return { version: `${parsed.major}.${parsed.minor + 1}.0`, promotedPrerelease: false };
  }
  return { version: `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`, promotedPrerelease: false };
}

/**
 * Work out the smallest bump that covers every entry. Any entry flagged
 * breaking, and every "Removed" entry, forces a MAJOR bump.
 */
export function recommendBumpLevel(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return "none";
  let best = "none";
  for (const entry of entries) {
    if (!entry || typeof entry !== "object") continue;
    const summary = String(entry.summary || "").trim();
    if (summary === "") continue;
    const type = CHANGE_TYPES.find((item) => item.key === entry.type);
    if (!type) continue;
    const level = entry.breaking || type.alwaysBreaking ? "major" : type.impact;
    if (BUMP_RANK[level] > BUMP_RANK[best]) best = level;
  }
  return best;
}

/** Count usable entries per change type. */
export function summariseEntries(entries) {
  const counts = Object.fromEntries(CHANGE_TYPE_KEYS.map((key) => [key, 0]));
  let total = 0;
  let breaking = 0;
  if (!Array.isArray(entries)) return { counts, total, breaking };

  for (const entry of entries) {
    if (!entry || typeof entry !== "object") continue;
    if (String(entry.summary || "").trim() === "") continue;
    if (!CHANGE_TYPE_KEYS.includes(entry.type)) continue;
    counts[entry.type] += 1;
    total += 1;
    const type = CHANGE_TYPES.find((item) => item.key === entry.type);
    if (entry.breaking || (type && type.alwaysBreaking)) breaking += 1;
  }
  return { counts, total, breaking };
}

/** Validate an ISO date and confirm the calendar day actually exists. */
export function isValidIsoDate(value) {
  const match = ISO_DATE_RE.exec(String(value == null ? "" : value).trim());
  if (!match) return false;
  const [, y, m, d] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  return (
    date.getUTCFullYear() === Number(y) &&
    date.getUTCMonth() === Number(m) - 1 &&
    date.getUTCDate() === Number(d)
  );
}

function escapeLine(text) {
  return String(text).replace(/\s+/g, " ").trim();
}

/**
 * Render a Keep a Changelog 1.1.0 release section for an API.
 *
 * @returns {{ markdown: string, version: string, level: string, stats: object } | { error: string }}
 */
export function generateChangelog(input = {}) {
  const {
    apiName = "API",
    currentVersion = "1.0.0",
    releaseDate = "2026-01-01",
    entries = [],
    compareBaseUrl = "",
    overrideLevel = "auto",
    includeUnreleasedHeading = false,
  } = input;

  const stats = summariseEntries(entries);
  if (stats.total === 0) {
    return { error: "Add at least one change with a summary before generating a changelog." };
  }
  if (!isValidIsoDate(releaseDate)) {
    return { error: "Release date must be a real date in YYYY-MM-DD format." };
  }

  const recommended = recommendBumpLevel(entries);
  const level = overrideLevel === "auto" ? recommended : overrideLevel;
  const bumped = bumpVersion(currentVersion, level);
  if (bumped.error) return { error: bumped.error };

  const name = escapeLine(apiName) || "API";
  const lines = [`## [${bumped.version}] - ${releaseDate}`, ""];

  if (stats.breaking > 0) {
    lines.push(
      `> **Breaking release.** ${stats.breaking} change${stats.breaking === 1 ? "" : "s"} in this version ${stats.breaking === 1 ? "is" : "are"} not backwards compatible. Read the migration notes before upgrading.`,
      "",
    );
  }

  for (const type of CHANGE_TYPES) {
    const items = (Array.isArray(entries) ? entries : []).filter(
      (entry) =>
        entry && entry.type === type.key && String(entry.summary || "").trim() !== "",
    );
    if (items.length === 0) continue;

    lines.push(`### ${type.label}`);
    for (const item of items) {
      const isBreaking = item.breaking || type.alwaysBreaking;
      const endpoint = escapeLine(item.endpoint || "");
      const prefix = [isBreaking ? "**BREAKING**" : "", endpoint ? `\`${endpoint}\`` : ""]
        .filter(Boolean)
        .join(" ");
      const body = escapeLine(item.summary);
      lines.push(`- ${prefix ? `${prefix} — ${body}` : body}`);
      const migration = escapeLine(item.migration || "");
      if (migration) lines.push(`  - Migration: ${migration}`);
    }
    lines.push("");
  }

  const previous = parseSemver(currentVersion);
  if (compareBaseUrl && previous) {
    const base = String(compareBaseUrl).replace(/\/+$/, "");
    lines.push(
      `[${bumped.version}]: ${base}/compare/v${previous.major}.${previous.minor}.${previous.patch}...v${bumped.version}`,
      "",
    );
  }

  const header = includeUnreleasedHeading
    ? [`# ${name} Changelog`, "", "All notable changes to this API are documented here. The format follows Keep a Changelog 1.1.0 and this API uses Semantic Versioning 2.0.0.", "", "## [Unreleased]", ""]
    : [`# ${name} Changelog`, "", "All notable changes to this API are documented here. The format follows Keep a Changelog 1.1.0 and this API uses Semantic Versioning 2.0.0.", ""];

  return {
    markdown: `${header.concat(lines).join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`,
    version: bumped.version,
    previousVersion: currentVersion,
    level,
    recommendedLevel: recommended,
    stats,
  };
}
