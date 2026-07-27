/**
 * Release tag format generator.
 *
 * Rules implemented:
 * - Semantic Versioning 2.0.0 (semver.org): MAJOR.MINOR.PATCH as non-negative
 *   integers without leading zeroes; a pre-release is appended with a hyphen
 *   as dot-separated identifiers (spec item 9); build metadata is appended
 *   with a plus sign (item 10) and is IGNORED for precedence; pre-release
 *   versions have LOWER precedence than the associated normal version (item 11).
 * - The "v" prefix is NOT part of SemVer (semver.org FAQ: "is v1.2.3 a
 *   semantic version? No.") but is the near-universal git tag convention
 *   (v1.2.3), and tools like GoReleaser and semantic-release expect it.
 * - Tag-name legality per git-check-ref-format: no spaces, ~, ^, :, ?, *, [,
 *   backslash, "..", no trailing "." or ".lock".
 */

/** Prerelease channels in ascending maturity order (common convention). */
export const PRERELEASE_CHANNELS = [
  { id: "alpha", label: "alpha — internal, unstable" },
  { id: "beta", label: "beta — external testing" },
  { id: "rc", label: "rc — release candidate" },
];

/** Environment suffix styles. */
export const ENV_STYLES = [
  { id: "none", label: "No environment suffix" },
  {
    id: "prerelease",
    label: "As prerelease identifier (v1.2.3-staging.1) — SemVer compliant",
  },
  {
    id: "build",
    label: "As build metadata (v1.2.3+staging) — ignored for precedence",
  },
];

// SemVer numeric identifier: 0, or a positive integer without leading zeroes.
const SEMVER_NUM_SOURCE = "(?:0|[1-9]\\d*)";
// Simplified prerelease identifier for the channels we generate: channel.N
const CHANNEL_SOURCE = "(?:alpha|beta|rc)";

// git-check-ref-format forbidden characters (subset relevant to single-level tags).
const BAD_REF_CHARS_RE = /[\s~^:?*[\\]|\.\.|@\{/;

/** Validate an environment name usable as an identifier (SemVer alphanumeric id). */
const ENV_NAME_RE = /^[0-9A-Za-z-]+$/;

/**
 * Build a tag standard.
 *
 * @param {object} input
 * @param {boolean} input.vPrefix       Include the conventional "v" prefix.
 * @param {string}  input.customPrefix  Extra prefix before the version (e.g. "app@"). May be "".
 * @param {number}  input.major
 * @param {number}  input.minor
 * @param {number}  input.patch
 * @param {boolean} input.prerelease    Include a prerelease segment.
 * @param {string}  input.channel       One of PRERELEASE_CHANNELS ids.
 * @param {number}  input.prereleaseNum Iteration number, e.g. rc.2.
 * @param {string}  input.envStyle      One of ENV_STYLES ids.
 * @param {string}  input.envName       Environment name (staging, prod…).
 * @returns {object} { format, example, regexSource, semverCompliant, commands, notes } or { error }.
 */
export function buildTagStandard({
  vPrefix = true,
  customPrefix = "",
  major,
  minor,
  patch,
  prerelease = false,
  channel = "rc",
  prereleaseNum = 1,
  envStyle = "none",
  envName = "staging",
}) {
  const nums = [major, minor, patch].map(Number);
  if (nums.some((n) => !Number.isFinite(n) || !Number.isInteger(n) || n < 0)) {
    return { error: "MAJOR, MINOR and PATCH must be whole numbers of 0 or more (SemVer item 2)." };
  }
  const [M, m, p] = nums;

  const prefix = String(customPrefix || "").trim();
  if (prefix !== "" && BAD_REF_CHARS_RE.test(prefix)) {
    return {
      error:
        "Prefix contains characters git forbids in tag names (spaces, ~ ^ : ? * [ \\ or '..').",
    };
  }

  if (prerelease && !PRERELEASE_CHANNELS.some((c) => c.id === channel)) {
    return { error: "Choose a prerelease channel." };
  }
  const preNum = Number(prereleaseNum);
  if (prerelease && (!Number.isInteger(preNum) || preNum < 1)) {
    return { error: "Prerelease iteration must be a whole number of at least 1 (e.g. rc.1)." };
  }

  if (!ENV_STYLES.some((s) => s.id === envStyle)) return { error: "Choose an environment style." };
  const env = String(envName || "").trim();
  if (envStyle !== "none" && !ENV_NAME_RE.test(env)) {
    return {
      error: "Environment name may only contain letters, digits and hyphens (SemVer identifier rules).",
    };
  }

  // ---- assemble example ----------------------------------------------------
  const lead = `${prefix}${vPrefix ? "v" : ""}`;
  let version = `${M}.${m}.${p}`;
  const preIds = [];
  if (prerelease) preIds.push(`${channel}.${preNum}`);
  if (envStyle === "prerelease") preIds.push(`${env}.1`);
  if (preIds.length > 0) version += `-${preIds.join(".")}`;
  if (envStyle === "build") version += `+${env}`;
  const example = `${lead}${version}`;

  // ---- assemble format template -------------------------------------------
  let format = `${lead}<MAJOR>.<MINOR>.<PATCH>`;
  if (prerelease) format += `-${channel}.<N>`;
  if (envStyle === "prerelease") format += `${prerelease ? "." : "-"}<env>.<N>`;
  if (envStyle === "build") format += "+<env>";

  // ---- regex ---------------------------------------------------------------
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  let regexSource = `^${esc(prefix)}${vPrefix ? "v" : ""}${SEMVER_NUM_SOURCE}\\.${SEMVER_NUM_SOURCE}\\.${SEMVER_NUM_SOURCE}`;
  const preParts = [];
  if (prerelease) preParts.push(`${CHANNEL_SOURCE}\\.${SEMVER_NUM_SOURCE}`);
  if (envStyle === "prerelease") preParts.push(`[0-9A-Za-z-]+\\.${SEMVER_NUM_SOURCE}`);
  if (preParts.length > 0) regexSource += `-${preParts.join("\\.")}`;
  if (envStyle === "build") regexSource += `\\+[0-9A-Za-z-]+`;
  regexSource += "$";

  // ---- compliance & notes --------------------------------------------------
  const notes = [];
  // The bare version (without prefix/v) is SemVer; the tag itself is a convention.
  const semverCompliant = true;
  if (vPrefix) {
    notes.push(
      'The "v" is tag convention, not part of the SemVer string — strip it before comparing versions (semver.org FAQ).',
    );
  }
  if (prerelease) {
    notes.push(
      `Precedence: ${lead}${M}.${m}.${p}-${channel}.${preNum} sorts BELOW ${lead}${M}.${m}.${p} (SemVer item 11).`,
    );
  }
  if (envStyle === "prerelease") {
    notes.push(
      "An environment identifier in the prerelease slot makes the tag rank below the plain release — fine for staging, wrong for prod. Use build metadata for pure labels.",
    );
  }
  if (envStyle === "build") {
    notes.push(
      "Build metadata after + is ignored for version precedence (SemVer item 10) — two tags differing only in +env are the same version to SemVer-aware tools.",
    );
  }
  notes.push(
    "Use annotated tags (git tag -a) for releases — they store tagger, date and message, and git describe prefers them.",
  );

  const commands = [
    `git tag -a ${example} -m "Release ${example}"`,
    `git push origin ${example}`,
    `# verify the format in CI:`,
    `echo "${example}" | grep -Eq '${regexSource}' && echo ok`,
  ];

  return { format, example, regexSource, semverCompliant, commands, notes };
}
