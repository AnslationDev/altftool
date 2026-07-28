/**
 * Multi-length bio writer.
 *
 * Assembles the same facts into three standard bio lengths — the 50-word speaker
 * blurb, the 100-word about paragraph and the 250-word long form — in first or
 * third person, and measures each against the character limits of the places a
 * bio actually gets pasted.
 *
 * Pure module — no React, no DOM, no network, no clock reads.
 */

/** The three lengths conference organisers, editors and press kits usually ask for. */
export const TARGET_LENGTHS = [50, 100, 250];

/** A brief that says "50 words" means at most 50; below this share it reads thin. */
export const MIN_FILL_RATIO = 0.6;

/** Documented character limits of the fields a short bio is pasted into. */
export const PLATFORM_LIMITS = [
  { id: "x", label: "X (Twitter) bio", limit: 160 },
  { id: "instagram", label: "Instagram bio", limit: 150 },
  { id: "facebook", label: "Facebook page bio", limit: 255 },
  { id: "youtube", label: "YouTube channel description", limit: 1000 },
  { id: "linkedin", label: "LinkedIn About section", limit: 2600 },
];

export const VOICES = [
  { id: "first", label: "First person (I)" },
  { id: "third", label: "Third person (they / he / she)" },
];

export const PRONOUNS = [
  { id: "they", label: "they / them", subject: "they", possessive: "their", plural: true },
  { id: "she", label: "she / her", subject: "she", possessive: "her", plural: false },
  { id: "he", label: "he / him", subject: "he", possessive: "his", plural: false },
  { id: "name", label: "Repeat the name", subject: "", possessive: "", plural: false },
];

/** Verb pairs used by the sentence templates: [plural form, singular form]. */
const VERBS = {
  be: ["are", "is"],
  have: ["have", "has"],
  work: ["work", "works"],
  help: ["help", "helps"],
  focus: ["focus", "focuses"],
  write: ["write", "writes"],
  live: ["live", "lives"],
  speak: ["speak", "speaks"],
};

function conjugate(key, plural) {
  const pair = VERBS[key];
  if (!pair) return key;
  return plural ? pair[0] : pair[1];
}

export function countWords(text) {
  if (typeof text !== "string") return 0;
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/**
 * Split an achievement list. Semicolons and newlines win when present, so a single
 * achievement containing commas is not chopped into fragments.
 */
export function splitList(raw, limit = 6) {
  if (typeof raw !== "string") return [];
  const pieces = /[\n;]/.test(raw) ? raw.split(/[\n;]+/) : raw.split(",");
  return pieces
    .map((item) => item.trim().replace(/\.$/, ""))
    .filter(Boolean)
    .slice(0, limit);
}

/** Remove a leading subject pronoun so templates can supply their own. */
export function stripLeadingSubject(text) {
  return typeof text === "string"
    ? text.replace(/^(i|he|she|they|we)\s+/i, "").trim()
    : "";
}

export function joinList(items) {
  if (!Array.isArray(items) || items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function clean(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function stripStop(text) {
  return text ? text.replace(/[.\s]+$/, "") : "";
}

function sentence(text) {
  const trimmed = stripStop(text);
  if (!trimmed) return "";
  return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}.`;
}

/**
 * Build the sentence pool once; each length picks a different slice of it.
 * Returns an object of named sentences (empty strings where input is missing).
 */
function buildSentences(input) {
  const {
    name,
    role,
    specialism,
    audience,
    achievements,
    credentials,
    location,
    personal,
    cta,
    voice,
    pronoun,
  } = input;

  const first = voice === "first";
  const plural = first || pronoun.plural;
  // Subject used after the opening sentence.
  const subject = first ? "I" : pronoun.subject || name;
  const possessive = first ? "my" : pronoun.possessive || `${name}'s`;
  const v = (key) => conjugate(key, plural);

  // The opening subject is always "I" or the person's name, so the verb is fixed.
  const openerSubject = first ? "I am" : `${name} is`;
  const opener = sentence(
    `${openerSubject} a ${role}${location ? ` based in ${location}` : ""}${specialism ? `, working on ${specialism}` : ""}`,
  );

  const audienceSentence = audience
    ? sentence(`${subject} ${v("work")} mainly with ${audience}`)
    : "";

  const headline = achievements.length > 0 ? sentence(`${subject} ${v("have")} ${achievements[0]}`) : "";

  // Achievements are written as past-participle phrases ("shipped a design system"),
  // so they hang off "has also" rather than a noun like "recent work".
  const achievementsSentence =
    achievements.length > 1
      ? sentence(`${subject} ${v("have")} also ${joinList(achievements.slice(1))}`)
      : "";

  const credentialsSentence = credentials ? sentence(`${subject} ${v("have")} ${credentials}`) : "";

  const specialismDetail =
    specialism && audience
      ? sentence(
          `Most of ${possessive} time ${conjugate("focus", false)} on ${specialism}, and on making that work useful to ${audience}`,
        )
      : "";

  const personalSentence = personal
    ? sentence(`Away from work, ${subject} ${stripStop(lowerFirst(stripLeadingSubject(personal)))}`)
    : "";

  const ctaSentence = cta ? sentence(cta) : "";

  return {
    opener,
    audienceSentence,
    headline,
    achievementsSentence,
    credentialsSentence,
    specialismDetail,
    personalSentence,
    ctaSentence,
  };
}

function lowerFirst(text) {
  return text ? text.charAt(0).toLowerCase() + text.slice(1) : "";
}

/**
 * Build the three bios.
 * Returns { bios, platformFit, ... } or { error }.
 */
export function buildBios(input = {}) {
  const name = clean(input.name);
  if (!name) return { error: "Add your name — a third-person bio has to open with it." };

  const role = clean(input.role);
  if (!role) return { error: "Add the role or title the bio is built around." };

  const voice = input.voice === "first" ? "first" : "third";
  const pronoun = PRONOUNS.find((item) => item.id === clean(input.pronounId)) || PRONOUNS[0];

  const achievements = splitList(input.achievements, 5).map(lowerFirst);
  const parts = buildSentences({
    name,
    role,
    specialism: clean(input.specialism),
    audience: clean(input.audience),
    achievements,
    credentials: lowerFirst(clean(input.credentials)),
    location: clean(input.location),
    personal: clean(input.personal),
    cta: clean(input.cta),
    voice,
    pronoun,
  });

  // Each target length uses a wider slice of the same sentence pool.
  const compositions = {
    50: [parts.opener, parts.headline, parts.ctaSentence],
    100: [
      parts.opener,
      parts.audienceSentence,
      parts.headline,
      parts.credentialsSentence,
      parts.ctaSentence,
    ],
    250: [
      parts.opener,
      parts.audienceSentence,
      parts.headline,
      parts.achievementsSentence,
      parts.specialismDetail,
      parts.credentialsSentence,
      parts.personalSentence,
      parts.ctaSentence,
    ],
  };

  const bios = TARGET_LENGTHS.map((target) => {
    const text = compositions[target].filter(Boolean).join(" ");
    const wordCount = countWords(text);
    const floor = Math.round(target * MIN_FILL_RATIO);
    return {
      target,
      text,
      wordCount,
      charCount: text.length,
      floor,
      fitsLimit: wordCount <= target,
      thin: wordCount < floor,
      remaining: target - wordCount,
    };
  }).filter((bio) => bio.text.length > 0);

  if (bios.length === 0) {
    return { error: "Not enough detail to build a bio — add at least one achievement." };
  }

  const shortest = bios[0];
  const platformFit = PLATFORM_LIMITS.map((platform) => ({
    ...platform,
    fits: shortest.charCount <= platform.limit,
    over: Math.max(0, shortest.charCount - platform.limit),
  }));

  const checklist = [
    { label: "Opens with a role, not an adjective", ok: true },
    { label: "Names a specific audience", ok: Boolean(parts.audienceSentence) },
    { label: "Includes at least one achievement", ok: achievements.length > 0 },
    { label: "Includes a second achievement for the long bio", ok: achievements.length > 1 },
    { label: "Ends with a call to action", ok: Boolean(parts.ctaSentence) },
    { label: "50-word version fits an X or Instagram bio", ok: shortest.charCount <= 160 },
    { label: "Every version fits its word limit", ok: bios.every((bio) => bio.fitsLimit) },
  ];

  return {
    bios,
    platformFit,
    voice,
    pronounLabel: voice === "first" ? "First person" : pronoun.label,
    achievementCount: achievements.length,
    checklist,
    score: checklist.filter((item) => item.ok).length,
    scoreMax: checklist.length,
  };
}
