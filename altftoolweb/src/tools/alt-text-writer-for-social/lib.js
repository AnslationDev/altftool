/**
 * Social Alt Text Writer — pure analysis and drafting module.
 * No React, no DOM, no clock reads.
 */

/**
 * Practical ceiling for a text alternative. Several screen readers have
 * historically stopped announcing an alt attribute somewhere around this
 * length, which is why 125 characters is the long-standing working guideline
 * rather than a value written into WCAG itself.
 */
export const SCREEN_READER_GUIDELINE = 125;

/** Below this an alt attribute rarely says anything useful about the image. */
export const MIN_USEFUL_CHARS = 20;

/**
 * Platform targets.
 * `hardLimit` is a published field limit; `null` means the platform does not
 * publish one, so only the screen reader guideline applies.
 */
export const PLATFORMS = [
  {
    id: "web",
    label: "Website / HTML alt attribute",
    hardLimit: null,
    note: "WCAG 2.2 success criterion 1.1.1 requires a text alternative but sets no character limit.",
  },
  {
    id: "x",
    label: "X (Twitter) image description",
    hardLimit: 1000,
    note: "X accepts up to 1,000 characters in the image description field.",
  },
  {
    id: "linkedin",
    label: "LinkedIn image alt text",
    hardLimit: 120,
    note: "LinkedIn caps image alt text at 120 characters.",
  },
  {
    id: "instagram",
    label: "Instagram custom alt text",
    hardLimit: null,
    note: "Instagram does not publish a character limit for custom alt text; the 125-character guideline is the safer target.",
  },
  {
    id: "facebook",
    label: "Facebook alt text",
    hardLimit: null,
    note: "Facebook does not publish a character limit; keep it within the screen reader guideline.",
  },
];

/** Openers a screen reader makes redundant — it already announces "image". */
export const REDUNDANT_OPENERS = [
  "image of",
  "an image of",
  "a image of",
  "picture of",
  "a picture of",
  "photo of",
  "a photo of",
  "photograph of",
  "graphic of",
  "screenshot of",
  "icon of",
];

/** Words that describe the link rather than the picture. */
export const LINK_PHRASES = ["click here", "read more", "tap here", "learn more", "see link"];

/** Points removed from a 100-point start for each problem found. */
export const PENALTIES = {
  empty: 100,
  tooShort: 30,
  overGuideline: 15,
  overHardLimit: 40,
  redundantOpener: 15,
  filename: 30,
  hashtag: 10,
  linkPhrase: 15,
  allCaps: 10,
  emojiHeavy: 10,
  noSentenceEnd: 5,
  repeatedWord: 10,
};

const FILENAME_PATTERN = /(\b(img|dsc|pxl|screenshot|photo)[-_ ]?\d{2,}\b)|(\.(jpe?g|png|gif|webp|heic|svg)\b)/i;
const HASHTAG_PATTERN = /(^|\s)#[\p{L}\p{N}_]+/u;
const EMOJI_PATTERN = /\p{Extended_Pictographic}/gu;
const ALL_CAPS_PATTERN = /\b[A-Z]{4,}\b/g;

/** Words too common to count as repetition. */
const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "of", "in", "on", "at", "to", "with", "for",
  "is", "are", "was", "were", "it", "its", "as", "by", "from", "over", "into",
  "his", "her", "their", "this", "that", "two", "one",
]);

export function getPlatform(platformId) {
  return PLATFORMS.find((platform) => platform.id === platformId) || null;
}

/** Count characters the way a form field does, after trimming the ends. */
export function countCharacters(text) {
  return String(text ?? "").trim().length;
}

export function countWords(text) {
  const words = String(text ?? "").trim().split(/\s+/).filter(Boolean);
  return words.length;
}

/**
 * Analyse a draft alt text against a platform target.
 * Returns a score out of 100 plus every issue found, each with a fix.
 */
export function analyseAltText(text, platformId = "web") {
  const platform = getPlatform(platformId);
  if (!platform) return { error: "Choose a platform to check against." };

  const raw = String(text ?? "");
  const trimmed = raw.trim();

  if (trimmed.length === 0) {
    return {
      error:
        "Write a description of the image first. If the image is purely decorative, use an empty alt attribute instead of describing it.",
    };
  }

  const chars = trimmed.length;
  const words = countWords(trimmed);
  const lower = trimmed.toLowerCase();

  const issues = [];
  const passes = [];

  const opener = REDUNDANT_OPENERS.find((phrase) => lower.startsWith(phrase));
  if (opener) {
    issues.push({
      id: "redundantOpener",
      severity: "warn",
      message: `Starts with "${opener}" — screen readers already announce that it is an image.`,
      fix: "Delete the opener and lead with the subject.",
    });
  } else {
    passes.push("Leads with the subject rather than \"image of\".");
  }

  if (FILENAME_PATTERN.test(trimmed)) {
    issues.push({
      id: "filename",
      severity: "error",
      message: "Contains what looks like a file name rather than a description.",
      fix: "Replace the file name with what is actually in the picture.",
    });
  }

  if (HASHTAG_PATTERN.test(trimmed)) {
    issues.push({
      id: "hashtag",
      severity: "warn",
      message: "Contains a hashtag, which a screen reader reads out character by character or as one run-on word.",
      fix: "Keep hashtags in the caption and out of the alt text.",
    });
  }

  const linkPhrase = LINK_PHRASES.find((phrase) => lower.includes(phrase));
  if (linkPhrase) {
    issues.push({
      id: "linkPhrase",
      severity: "warn",
      message: `Contains "${linkPhrase}", which describes an action rather than the image.`,
      fix: "Describe the picture; put the call to action in the visible caption.",
    });
  }

  const capsRuns = trimmed.match(ALL_CAPS_PATTERN) || [];
  if (capsRuns.length > 0) {
    issues.push({
      id: "allCaps",
      severity: "warn",
      message: `Has ${capsRuns.length} all-caps run (${capsRuns.slice(0, 3).join(", ")}) — some screen readers spell these out letter by letter.`,
      fix: "Use sentence case unless the capitals are a genuine acronym.",
    });
  }

  const emoji = trimmed.match(EMOJI_PATTERN) || [];
  if (emoji.length > 1) {
    issues.push({
      id: "emojiHeavy",
      severity: "warn",
      message: `Has ${emoji.length} emoji, each read aloud by its full Unicode name.`,
      fix: "Keep at most one emoji, or move them to the caption.",
    });
  }

  if (chars < MIN_USEFUL_CHARS) {
    issues.push({
      id: "tooShort",
      severity: "error",
      message: `Only ${chars} characters — usually too short to describe what matters in the image.`,
      fix: "Say who or what is in the picture, what they are doing, and where.",
    });
  }

  if (platform.hardLimit !== null && chars > platform.hardLimit) {
    issues.push({
      id: "overHardLimit",
      severity: "error",
      message: `${chars} characters exceeds the ${platform.hardLimit}-character limit on ${platform.label}.`,
      fix: `Cut ${chars - platform.hardLimit} characters.`,
    });
  } else if (chars > SCREEN_READER_GUIDELINE) {
    issues.push({
      id: "overGuideline",
      severity: "warn",
      message: `${chars} characters is over the ${SCREEN_READER_GUIDELINE}-character working guideline.`,
      fix: "Move the extra detail into a visible caption or a long description.",
    });
  } else if (chars >= MIN_USEFUL_CHARS) {
    passes.push(`Fits the ${SCREEN_READER_GUIDELINE}-character guideline.`);
  }

  if (!/[.!?]$/.test(trimmed)) {
    issues.push({
      id: "noSentenceEnd",
      severity: "info",
      message: "Does not end with a full stop, so a screen reader runs straight into the next element.",
      fix: "End the description with a full stop.",
    });
  } else {
    passes.push("Ends with punctuation so the reader pauses.");
  }

  const seen = new Map();
  trimmed
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word))
    .forEach((word) => seen.set(word, (seen.get(word) || 0) + 1));
  const repeated = [...seen.entries()].filter(([, count]) => count > 2).map(([word]) => word);
  if (repeated.length > 0) {
    issues.push({
      id: "repeatedWord",
      severity: "warn",
      message: `Repeats "${repeated[0]}" more than twice, which usually means keyword stuffing.`,
      fix: "Say it once and describe the rest of the image instead.",
    });
  }

  const penalty = issues.reduce((total, issue) => total + (PENALTIES[issue.id] || 0), 0);
  const score = Math.max(0, Math.min(100, 100 - penalty));

  let verdict = "Ready to publish";
  if (score < 50) verdict = "Needs rewriting";
  else if (score < 80) verdict = "Usable, but fixable";

  return {
    platform,
    text: trimmed,
    chars,
    words,
    charsRemaining:
      platform.hardLimit === null ? SCREEN_READER_GUIDELINE - chars : platform.hardLimit - chars,
    limitUsedPct:
      platform.hardLimit === null
        ? (chars / SCREEN_READER_GUIDELINE) * 100
        : (chars / platform.hardLimit) * 100,
    score,
    verdict,
    issues,
    passes,
    errorCount: issues.filter((issue) => issue.severity === "error").length,
    warnCount: issues.filter((issue) => issue.severity === "warn").length,
  };
}

/** Capitalise the first letter without touching the rest. */
function sentenceCase(value) {
  const s = String(value ?? "").trim();
  if (s.length === 0) return "";
  return s[0].toUpperCase() + s.slice(1);
}

/**
 * Assemble a first draft from the four things a useful alt text almost always
 * needs: the subject, what it is doing, where it is, and any words printed in
 * the image itself.
 */
export function buildAltDraft({ subject, action, setting, textInImage, purpose } = {}) {
  const subjectText = String(subject ?? "").trim();
  if (subjectText.length === 0) {
    return { error: "Name the main subject of the image to build a draft." };
  }

  const parts = [subjectText];
  const actionText = String(action ?? "").trim();
  const settingText = String(setting ?? "").trim();
  const wordsText = String(textInImage ?? "").trim();
  const purposeText = String(purpose ?? "").trim();

  if (actionText) parts.push(actionText);
  if (settingText) parts.push(settingText.startsWith("in ") || settingText.startsWith("at ") || settingText.startsWith("on ") ? settingText : `in ${settingText}`);

  let draft = sentenceCase(parts.join(" "));
  if (!/[.!?]$/.test(draft)) draft += ".";

  if (wordsText) {
    draft += ` Text reads: ${wordsText}${/[.!?]$/.test(wordsText) ? "" : "."}`;
  }
  if (purposeText) {
    draft += ` ${sentenceCase(purposeText)}${/[.!?]$/.test(purposeText) ? "" : "."}`;
  }

  return { draft, chars: draft.length };
}
