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

/** Pronouns that pair with the base/plural verb form ("I train", "they train"). */
const PLURAL_FORM_SUBJECTS = new Set(["i", "they", "we"]);

/**
 * Split a leading subject pronoun off free text, same as stripLeadingSubject,
 * but also reports which pronoun was removed (or null) so the caller can tell
 * whether the sentence was originally written for a singular ("she"/"he") or
 * plural/base ("I"/"they"/"we") subject.
 */
function splitLeadingSubject(text) {
  if (typeof text !== "string") return { subject: null, rest: "" };
  const match = /^(i|he|she|they|we)\s+/i.exec(text);
  if (!match) return { subject: null, rest: text.trim() };
  return { subject: match[1].toLowerCase(), rest: text.slice(match[0].length).trim() };
}

const IRREGULAR_VERB_FORMS = [
  ["is", "are"],
  ["was", "were"],
  ["has", "have"],
  ["does", "do"],
  ["goes", "go"],
];

/** "trains" -> "train", "has" -> "have", "carries" -> "carry" (3rd-person-singular -> plural/base). */
function toBaseVerbForm(word) {
  const lower = word.toLowerCase();
  for (const [singular, base] of IRREGULAR_VERB_FORMS) {
    if (lower === singular) return matchCase(word, base);
  }
  if (/ies$/i.test(word)) return matchCase(word, word.slice(0, -3) + "y");
  if (/(ches|shes|xes|zes|sses)$/i.test(word)) return matchCase(word, word.slice(0, -2));
  if (/s$/i.test(word) && !/ss$/i.test(word)) return matchCase(word, word.slice(0, -1));
  return word;
}

/** "train" -> "trains", "have" -> "has", "carry" -> "carries" (plural/base -> 3rd-person-singular). */
function toSingularVerbForm(word) {
  const lower = word.toLowerCase();
  for (const [singular, base] of IRREGULAR_VERB_FORMS) {
    if (lower === base) return matchCase(word, singular);
  }
  if (/[^aeiou]y$/i.test(word)) return matchCase(word, word.slice(0, -1) + "ies");
  if (/(s|x|z|ch|sh)$/i.test(word)) return matchCase(word, `${word}es`);
  return matchCase(word, `${word}s`);
}

function matchCase(original, replacement) {
  return original.charAt(0) === original.charAt(0).toUpperCase()
    ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
    : replacement;
}

/**
 * Re-conjugate the verb leading a free-text clause so it agrees with a new
 * subject's number, e.g. "trains hard" (written for "she") becomes
 * "train hard" when the subject becomes "they". Only the first word (the
 * main verb tied directly to the subject) is touched — arbitrary free text
 * can't be reliably re-conjugated further without real grammatical parsing,
 * but the leading verb is the one directly next to the subject pronoun and
 * is what actually reads as broken ("they trains") when left alone.
 */
function reconjugateLeadingVerb(rest, wantPlural) {
  const match = /^(\S+)(\s*)([\s\S]*)$/.exec(rest);
  if (!match) return rest;
  const [, verb, gap, remainder] = match;
  const fixed = wantPlural ? toBaseVerbForm(verb) : toSingularVerbForm(verb);
  return `${fixed}${gap}${remainder}`;
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

  // The free-text "personal" field may have been written with its own
  // subject in mind (e.g. "she trains..."). If that subject's number
  // (singular "he"/"she" vs. plural/base "I"/"they"/"we") differs from the
  // subject this bio is actually using, the leading verb is re-conjugated so
  // the swap doesn't produce "they trains" / "she train".
  const { subject: personalSubjectWord, rest: personalRest } = splitLeadingSubject(personal);
  let personalBody = stripStop(lowerFirst(personalRest));
  if (personalSubjectWord) {
    const personalWasPlural = PLURAL_FORM_SUBJECTS.has(personalSubjectWord);
    if (personalWasPlural !== plural) {
      personalBody = reconjugateLeadingVerb(personalBody, plural);
    }
  }
  const personalSentence = personal ? sentence(`Away from work, ${subject} ${personalBody}`) : "";

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
 * Resume-filler adjectives that describe the person rather than naming a
 * role, e.g. "passionate results-driven visionary" — exactly the pattern
 * this tool's own FAQ (seo.js) tells writers to avoid. Checked against the
 * first word of the role field, since that's the word a reader hits first.
 */
const FILLER_OPENER_ADJECTIVES = new Set([
  "passionate",
  "results-driven",
  "driven",
  "dynamic",
  "innovative",
  "visionary",
  "dedicated",
  "proven",
  "seasoned",
  "motivated",
  "ambitious",
  "strategic",
  "creative",
  "versatile",
  "accomplished",
  "skilled",
  "experienced",
  "talented",
  "enthusiastic",
  "energetic",
  "detail-oriented",
  "goal-oriented",
  "hardworking",
  "self-motivated",
]);

function opensWithFillerAdjective(role) {
  const firstWord = clean(role).toLowerCase().split(/\s+/)[0] || "";
  return FILLER_OPENER_ADJECTIVES.has(firstWord);
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
      // specialismDetail already restates the audience ("...useful to
      // {audience}") whenever both specialism and audience are set, so
      // audienceSentence is dropped here to avoid naming the same audience
      // twice in one paragraph. When there's no specialism, specialismDetail
      // is empty and audienceSentence is the only mention.
      parts.specialismDetail ? "" : parts.audienceSentence,
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

  // name and role are already required above, and the 50-word composition
  // is built from them alone (opener + optional headline/cta), so `bios`
  // always has at least that entry — this is a defensive check that can't
  // actually fire, kept out rather than left in with a misleading message.

  const shortest = bios[0];
  const platformFit = PLATFORM_LIMITS.map((platform) => ({
    ...platform,
    fits: shortest.charCount <= platform.limit,
    over: Math.max(0, shortest.charCount - platform.limit),
  }));

  const xFits = platformFit.find((platform) => platform.id === "x")?.fits ?? false;
  const instagramFits = platformFit.find((platform) => platform.id === "instagram")?.fits ?? false;

  const checklist = [
    { label: "Opens with a role, not an adjective", ok: !opensWithFillerAdjective(role) },
    { label: "Names a specific audience", ok: Boolean(parts.audienceSentence) },
    { label: "Includes at least one achievement", ok: achievements.length > 0 },
    { label: "Includes a second achievement for the long bio", ok: achievements.length > 1 },
    { label: "Ends with a call to action", ok: Boolean(parts.ctaSentence) },
    { label: "50-word version fits an X or Instagram bio", ok: xFits && instagramFits },
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
