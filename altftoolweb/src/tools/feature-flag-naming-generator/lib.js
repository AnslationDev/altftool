/**
 * Feature flag name generation.
 *
 * Rule sources:
 *
 *  - The four flag categories (release, experiment, operational, permission) and the
 *    guidance that release/experiment flags are TEMPORARY while operational and
 *    permission flags may be long-lived come from Pete Hodgson's canonical
 *    "Feature Toggles (aka Feature Flags)" article on martinfowler.com.
 *
 *  - Prefixing the flag key with its category and owning team, and tagging temporary
 *    flags with a removal/expiry marker, follows the published naming guidance of the
 *    major flag platforms (LaunchDarkly "flag naming conventions" docs, Flagsmith and
 *    Unleash best-practice guides). None of these is a formal standard — the point of
 *    a convention is consistency inside one codebase.
 *
 *  - Positive naming ("enable-x", never "disable-x" / "not-x") is the widely adopted
 *    rule that avoids double-negative checks like `if (!disableCheckout)`.
 *
 *  - MAX_RECOMMENDED_LENGTH: LaunchDarkly allows flag keys up to 256 characters, but
 *    keys are typed by hand in dashboards, YAML and analytics queries, so common
 *    lint rules cap them far lower. 64 is the ceiling this tool warns at.
 */

export const MAX_RECOMMENDED_LENGTH = 64;

/** Words that signal a negatively-named boolean flag. */
const NEGATIVE_WORDS = new Set(["disable", "disabled", "not", "no", "off", "hide", "prevent", "block"]);

/** Vague words that make a flag key meaningless in a dashboard list. */
const VAGUE_WORDS = new Set(["new", "temp", "test", "flag", "feature", "toggle", "v2", "misc", "stuff"]);

export const FLAG_TYPES = [
  {
    id: "release",
    prefix: "release",
    label: "Release toggle — ship dark, roll out gradually",
    temporary: true,
    note: "Temporary by definition. Should be deleted once the feature is fully rolled out; give it an expiry.",
  },
  {
    id: "experiment",
    prefix: "exp",
    label: "Experiment — A/B or multivariate test",
    temporary: true,
    note: "Lives only as long as the experiment needs statistical significance, then is removed.",
  },
  {
    id: "ops",
    prefix: "ops",
    label: "Operational — kill switch / circuit breaker",
    temporary: false,
    note: "Long-lived by design. No expiry tag; ownership matters most because someone flips it at 3 a.m.",
  },
  {
    id: "permission",
    prefix: "perm",
    label: "Permission — plan, entitlement or beta cohort gate",
    temporary: false,
    note: "Long-lived; effectively part of the product's entitlement model.",
  },
];

export const CASE_STYLES = [
  { id: "kebab", label: "kebab-case (LaunchDarkly key default)" },
  { id: "snake", label: "snake_case" },
  { id: "camel", label: "camelCase" },
  { id: "pascal", label: "PascalCase" },
  { id: "screaming", label: "SCREAMING_SNAKE (constants)" },
  { id: "dot", label: "dot.case (namespaced)" },
];

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Split any free text into lowercase alphanumeric words. Handles camelCase input. */
export function toWords(raw) {
  return String(raw ?? "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2") // split camelCase
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/** Join word arrays in the chosen case style. Word groups are separated logically. */
export function joinWords(words, styleId) {
  const list = words.filter(Boolean);
  if (list.length === 0) return "";
  switch (styleId) {
    case "snake":
      return list.join("_");
    case "camel":
      return list
        .map((w, i) => (i === 0 ? w : w[0].toUpperCase() + w.slice(1)))
        .join("");
    case "pascal":
      return list.map((w) => w[0].toUpperCase() + w.slice(1)).join("");
    case "screaming":
      return list.join("_").toUpperCase();
    case "dot":
      return list.join(".");
    case "kebab":
    default:
      return list.join("-");
  }
}

/**
 * Generate a flag name plus lint warnings.
 *
 * @param {object} input
 * @param {string} input.description   What the flag gates, free text.
 * @param {string} [input.team]        Owning team or squad, free text.
 * @param {string} input.typeId        One of FLAG_TYPES ids.
 * @param {string} input.caseStyle     One of CASE_STYLES ids.
 * @param {string} [input.expiry]      Planned removal date yyyy-mm-dd (temporary flags).
 * @param {boolean} [input.includeTeam]   Include the team segment.
 * @param {boolean} [input.includePrefix] Include the type prefix segment.
 * @returns {object} { name, variants, segments, warnings, length, type } or { error }
 */
export function generateFlagName({
  description,
  team = "",
  typeId,
  caseStyle,
  expiry = "",
  includeTeam = true,
  includePrefix = true,
}) {
  const type = FLAG_TYPES.find((t) => t.id === typeId);
  if (!type) return { error: "Choose a flag type." };
  if (!CASE_STYLES.some((s) => s.id === caseStyle)) {
    return { error: "Choose a case style." };
  }

  const descWords = toWords(description);
  if (descWords.length === 0) {
    return { error: "Describe what the flag gates, e.g. \"new checkout flow\"." };
  }

  const teamWords = toWords(team);
  if (includeTeam && teamWords.length === 0) {
    return { error: "Name the owning team, or untick the team segment." };
  }

  const expiryTrimmed = String(expiry ?? "").trim();
  if (expiryTrimmed && !DATE_PATTERN.test(expiryTrimmed)) {
    return { error: "Enter the expiry as yyyy-mm-dd, or leave it blank." };
  }

  // Expiry tag: YYYYMMDD keeps the key sortable and free of extra separators.
  const expiryWords = expiryTrimmed ? [expiryTrimmed.replace(/-/g, "")] : [];

  const segments = [];
  if (includePrefix) segments.push({ label: "Type prefix", words: [type.prefix] });
  if (includeTeam) segments.push({ label: "Owning team", words: teamWords });
  segments.push({ label: "What it gates", words: descWords });
  if (type.temporary && expiryWords.length) {
    segments.push({ label: "Planned removal", words: expiryWords });
  }

  const allWords = segments.flatMap((s) => s.words);
  const name = joinWords(allWords, caseStyle);

  const variants = CASE_STYLES.map((style) => ({
    id: style.id,
    label: style.label,
    name: joinWords(allWords, style.id),
  }));

  const warnings = [];
  if (name.length > MAX_RECOMMENDED_LENGTH) {
    warnings.push(
      `${name.length} characters is longer than the ${MAX_RECOMMENDED_LENGTH}-character ceiling most teams lint at — shorten the description.`,
    );
  }
  const negatives = descWords.filter((w) => NEGATIVE_WORDS.has(w));
  if (negatives.length) {
    warnings.push(
      `"${negatives.join('", "')}" reads as a negative flag. Name flags positively (what turning it ON enables) so code never checks a double negative.`,
    );
  }
  const vague = descWords.filter((w) => VAGUE_WORDS.has(w));
  if (vague.length) {
    warnings.push(
      `"${vague.join('", "')}" will be meaningless in a dashboard of 200 flags — say what the feature actually is.`,
    );
  }
  if (type.temporary && !expiryTrimmed) {
    warnings.push(
      `${type.id === "experiment" ? "Experiment" : "Release"} flags are temporary — add a planned removal date so the cleanup ticket writes itself.`,
    );
  }
  if (!type.temporary && expiryTrimmed) {
    warnings.push(
      "Operational and permission flags are long-lived — an expiry tag in the key usually just goes stale.",
    );
  }

  return {
    name,
    length: name.length,
    variants,
    segments: segments.map((s) => ({ label: s.label, text: s.words.join(" ") })),
    warnings,
    type,
  };
}
