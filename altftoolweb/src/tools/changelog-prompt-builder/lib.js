/**
 * Changelog Prompt Builder.
 *
 * Parses Conventional Commits 1.0.0 subject lines, maps each commit type to a
 * Keep a Changelog 1.1.0 section, works out the Semantic Versioning 2.0.0
 * release bump implied by the set, and writes a prompt for a user-facing
 * changelog entry.
 *
 * Pure module: no React, no DOM, no clock reads. Dates arrive as arguments.
 */

/**
 * Conventional Commits 1.0.0 defines "feat" and "fix" and allows any other
 * noun as a type; these are the commonly used ones from the Angular
 * convention the spec cites. `section` maps to Keep a Changelog 1.1.0.
 */
export const COMMIT_TYPES = [
  { type: "feat", label: "Feature", section: "Added", release: "minor" },
  { type: "fix", label: "Bug fix", section: "Fixed", release: "patch" },
  { type: "perf", label: "Performance", section: "Changed", release: "patch" },
  { type: "refactor", label: "Refactor", section: "Changed", release: "none" },
  { type: "revert", label: "Revert", section: "Changed", release: "patch" },
  { type: "docs", label: "Documentation", section: "Changed", release: "none" },
  { type: "style", label: "Formatting", section: "Changed", release: "none" },
  { type: "test", label: "Tests", section: "Changed", release: "none" },
  { type: "build", label: "Build system", section: "Changed", release: "none" },
  { type: "ci", label: "CI config", section: "Changed", release: "none" },
  { type: "chore", label: "Chore", section: "Changed", release: "none" },
  { type: "security", label: "Security fix", section: "Security", release: "patch" },
  { type: "deprecate", label: "Deprecation", section: "Deprecated", release: "minor" },
  { type: "remove", label: "Removal", section: "Removed", release: "major" },
];

/** Keep a Changelog 1.1.0 section order. */
export const CHANGELOG_SECTIONS = [
  "Added",
  "Changed",
  "Deprecated",
  "Removed",
  "Fixed",
  "Security",
];

/** Who the entry is written for, which changes how much detail survives. */
export const AUDIENCES = [
  {
    id: "endUser",
    label: "End users",
    directive:
      "Describe the change in terms of what the user can now do or no longer has to do. No file names, no internal service names, no ticket IDs.",
  },
  {
    id: "developer",
    label: "Developers using the API or SDK",
    directive:
      "Name the exact endpoint, parameter, field or method that changed, and show the before and after signature for anything breaking.",
  },
  {
    id: "admin",
    label: "Admins and operators",
    directive:
      "Say what needs configuring, what defaults changed, and whether any action is required before upgrading.",
  },
];

export const TONES = [
  { id: "neutral", label: "Neutral and factual", directive: "Past tense, one clause per entry, no adjectives." },
  { id: "friendly", label: "Friendly product voice", directive: "Second person, short sentences, still specific about what changed." },
];

/** Practical bounds. */
export const LIMITS = { commits: { min: 1, max: 200 } };

/** Roughly four characters per token for ordinary English prose. */
export const AVERAGE_CHARS_PER_TOKEN = 4;

/** Release ranks so the highest bump in a set wins. */
const RELEASE_RANK = { none: 0, patch: 1, minor: 2, major: 3 };

/**
 * Conventional Commits subject line:
 *   type(optional scope)optional !: description
 */
const COMMIT_PATTERN = /^([a-zA-Z]+)(?:\(([^)]*)\))?(!)?:\s*(.+)$/;

/** Semantic Versioning 2.0.0 core version, ignoring pre-release and build metadata. */
const SEMVER_PATTERN = /^v?(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/;

/** A leading "* " or "- " from a git log or PR list is stripped before parsing. */
const BULLET_PREFIX = /^\s*(?:[-*•]|\d+[.)])\s*/;

/** Conventional Commits marks a breaking change with "!" or this footer token. */
const BREAKING_FOOTER = /BREAKING[ -]CHANGE/i;

export function getCommitType(type) {
  if (typeof type !== "string") return null;
  const key = type.toLowerCase();
  return COMMIT_TYPES.find((item) => item.type === key) || null;
}

export function getAudience(id) {
  return AUDIENCES.find((item) => item.id === id) || null;
}

export function getTone(id) {
  return TONES.find((item) => item.id === id) || null;
}

/**
 * Parse a semantic version.
 * @returns {{error:string}|{major:number,minor:number,patch:number}}
 */
export function parseVersion(text) {
  if (typeof text !== "string" || !SEMVER_PATTERN.test(text.trim())) {
    return { error: "Enter the current version as MAJOR.MINOR.PATCH, for example 1.4.2." };
  }
  const [, major, minor, patch] = text.trim().match(SEMVER_PATTERN);
  return { major: Number(major), minor: Number(minor), patch: Number(patch) };
}

/**
 * Apply a SemVer 2.0.0 bump: major resets minor and patch, minor resets patch.
 * @returns {{error:string}|{version:string}}
 */
export function bumpVersion(currentText, release) {
  const current = parseVersion(currentText);
  if (current.error) return current;
  if (release === "none") {
    return { version: `${current.major}.${current.minor}.${current.patch}` };
  }
  if (release === "major") return { version: `${current.major + 1}.0.0` };
  if (release === "minor") return { version: `${current.major}.${current.minor + 1}.0` };
  if (release === "patch") {
    return { version: `${current.major}.${current.minor}.${current.patch + 1}` };
  }
  return { error: "Unknown release type." };
}

/**
 * Parse commit subject lines.
 * Unrecognised lines are kept as "other" so nothing silently disappears, and
 * lines that match the Conventional Commits shape but use a type word this
 * tool does not recognise (e.g. "feature" instead of "feat") are counted in
 * `unknownType` so callers can flag them for human re-classification instead
 * of silently trusting the patch-level default release they were given.
 * @returns {{error:string}|{commits:Array,bySection:object,breaking:Array,unparsed:number,unknownType:number,release:string}}
 */
export function parseCommits(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { error: "Paste at least one commit or merged pull request title." };
  }
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(BULLET_PREFIX, "").trim())
    .filter((line) => line.length > 0);

  if (lines.length < LIMITS.commits.min) {
    return { error: "Paste at least one commit or merged pull request title." };
  }
  if (lines.length > LIMITS.commits.max) {
    return {
      error: `Keep it to ${LIMITS.commits.max} commits per release — split a bigger range into separate entries.`,
    };
  }

  const commits = [];
  const bySection = {};
  const breaking = [];
  let unparsed = 0;
  let unknownType = 0;
  let release = "none";

  for (const line of lines) {
    const match = line.match(COMMIT_PATTERN);
    if (!match) {
      unparsed += 1;
      const commit = {
        raw: line,
        type: null,
        scope: null,
        breaking: BREAKING_FOOTER.test(line),
        subject: line,
        section: "Changed",
      };
      if (commit.breaking) breaking.push(commit);
      commits.push(commit);
      bySection.Changed = (bySection.Changed || 0) + 1;
      if (commit.breaking) release = "major";
      continue;
    }

    const [, rawType, rawScope, bang, subject] = match;
    const known = getCommitType(rawType);
    const isBreaking = Boolean(bang) || BREAKING_FOOTER.test(line);
    const section = isBreaking && known && known.section === "Added"
      ? "Changed"
      : known
        ? known.section
        : "Changed";

    const commit = {
      raw: line,
      type: rawType.toLowerCase(),
      known: Boolean(known),
      scope: rawScope ? rawScope.trim() : null,
      breaking: isBreaking,
      subject: subject.trim(),
      section,
    };
    commits.push(commit);
    if (commit.breaking) breaking.push(commit);
    if (!commit.known) unknownType += 1;

    bySection[section] = (bySection[section] || 0) + 1;

    const commitRelease = isBreaking ? "major" : known ? known.release : "patch";
    if (RELEASE_RANK[commitRelease] > RELEASE_RANK[release]) release = commitRelease;
  }

  return { commits, bySection, breaking, unparsed, unknownType, release };
}

export function measureText(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { characters: 0, words: 0, approxTokens: 0 };
  }
  const characters = text.length;
  const words = text.trim().split(/\s+/).length;
  return {
    characters,
    words,
    approxTokens: Math.max(1, Math.ceil(characters / AVERAGE_CHARS_PER_TOKEN)),
  };
}

/**
 * Build the changelog prompt.
 * @returns {{error:string}|{text:string,...}}
 */
export function buildChangelogPrompt({
  productName,
  currentVersion,
  releaseDate,
  commitText,
  audienceId,
  toneId,
  notes,
} = {}) {
  const name = typeof productName === "string" ? productName.trim() : "";
  if (!name) return { error: "Enter the product or package name." };

  const audience = getAudience(audienceId);
  if (!audience) return { error: "Choose who the changelog is for." };
  const tone = getTone(toneId);
  if (!tone) return { error: "Choose a tone." };

  const parsed = parseCommits(commitText);
  if (parsed.error) return { error: parsed.error };

  const next = bumpVersion(currentVersion, parsed.release);
  if (next.error) return { error: next.error };

  const current = parseVersion(currentVersion);
  const preRelease = current.major === 0;
  const date = typeof releaseDate === "string" ? releaseDate.trim() : "";
  const extra = typeof notes === "string" ? notes.trim() : "";

  const usedSections = CHANGELOG_SECTIONS.filter((section) => parsed.bySection[section] > 0);

  const lines = [
    `Write the changelog entry for ${name} version ${next.version}${date ? `, released ${date}` : ""}.`,
    "",
    `AUDIENCE: ${audience.label}`,
    audience.directive,
    `TONE: ${tone.label}. ${tone.directive}`,
    "",
    `VERSION: current ${current.major}.${current.minor}.${current.patch} → ${next.version} (a ${parsed.release === "none" ? "no-op" : parsed.release} bump under Semantic Versioning 2.0.0${
      parsed.breaking.length > 0 ? ", because the set contains a breaking change" : ""
    }).`,
  ];

  if (preRelease) {
    lines.push(
      "NOTE: the major version is 0, so under SemVer 2.0.0 the public API is not yet considered stable. State that clearly if a breaking change ships without a major bump.",
    );
  }

  lines.push("", `COMMITS (${parsed.commits.length}):`);
  for (const commit of parsed.commits) {
    const scope = commit.scope ? ` [${commit.scope}]` : "";
    const flag = commit.breaking ? " (BREAKING)" : "";
    const typeFlag = commit.type && !commit.known ? " (type not recognized — verify classification)" : "";
    lines.push(`- ${commit.section}${scope}${flag}${typeFlag}: ${commit.subject}`);
  }

  lines.push(
    "",
    "STRUCTURE — Keep a Changelog 1.1.0. Use only the sections that have entries, in this order:",
    ...CHANGELOG_SECTIONS.map(
      (section) =>
        `- ${section}${parsed.bySection[section] ? ` (${parsed.bySection[section]} commit${parsed.bySection[section] === 1 ? "" : "s"})` : " — omit, nothing to report"}`,
    ),
    "",
    "RULES:",
    "- One line per change, written for a human reading the release notes — not the commit message copied across.",
    "- Say what changed and what it means for the reader. \"Fixed a crash when importing a CSV with no header row\" beats \"fix csv import\".",
    "- Merge duplicate or follow-up commits into a single line. Drop pure chore, style, refactor, CI and test commits unless they change behaviour.",
    "- Never invent a change that is not in the list above.",
    "- Link each line to its issue or PR number if one appears in the commit; otherwise leave no link.",
  );

  if (parsed.breaking.length > 0) {
    lines.push(
      "",
      `BREAKING CHANGES (${parsed.breaking.length}) — put these first, under their own heading, and for each one give: what broke, why, and the exact migration step.`,
      ...parsed.breaking.map((commit) => `- ${commit.subject}`),
    );
  }
  if (parsed.unparsed > 0) {
    lines.push(
      "",
      `${parsed.unparsed} line${parsed.unparsed === 1 ? " was" : "s were"} not in Conventional Commits format and defaulted to Changed. Re-classify ${parsed.unparsed === 1 ? "it" : "them"} from the wording and flag anything ambiguous as TODO(verify).`,
    );
  }
  if (parsed.unknownType > 0) {
    lines.push(
      "",
      `${parsed.unknownType} commit${parsed.unknownType === 1 ? " uses" : "s use"} a type word this tool does not recognize and ${parsed.unknownType === 1 ? "was" : "were"} defaulted to Changed with a patch-level version contribution, marked "(type not recognized)" above. Re-classify ${parsed.unknownType === 1 ? "it" : "them"} from the wording — for example a synonym for "feat" such as "feature" is a MINOR change, not patch — and raise VERSION above if a higher bump is warranted.`,
    );
  }
  if (extra) lines.push("", `EXTRA INSTRUCTION: ${extra}`);

  const text = lines.join("\n");
  return {
    text,
    parsed,
    nextVersion: next.version,
    release: parsed.release,
    breakingCount: parsed.breaking.length,
    commitCount: parsed.commits.length,
    unparsed: parsed.unparsed,
    unknownType: parsed.unknownType,
    usedSections,
    preRelease,
    audience,
    tone,
    ...measureText(text),
  };
}
