/**
 * Roll / registration number format validation.
 *
 * There is no single statute governing roll-number formats — every exam body
 * publishes its own convention in the admit card / information bulletin. This
 * module therefore validates a candidate's number against STRUCTURAL rules
 * (length, character set, fixed prefix, whitespace) that the user selects or
 * that a preset supplies. Preset lengths below reflect the format each body
 * has used in recent cycles; the admit card is always the final authority.
 */

/** Character-set rules a roll number may be required to follow. */
export const CHARSETS = [
  {
    id: "digits",
    label: "Digits only (0-9)",
    // ^\d+$ — the entire string must be numeric.
    pattern: /^[0-9]+$/,
    describe: "only the digits 0-9",
  },
  {
    id: "upper-alnum",
    label: "Capital letters and digits (A-Z, 0-9)",
    pattern: /^[A-Z0-9]+$/,
    describe: "capital letters A-Z and digits 0-9",
  },
  {
    id: "alnum",
    label: "Letters and digits, any case",
    pattern: /^[A-Za-z0-9]+$/,
    describe: "letters and digits only",
  },
];

/**
 * Common formats. Lengths are the ones these bodies have used in recent
 * cycles (e.g. JEE Main application numbers are 12-digit numeric, CBSE board
 * roll numbers are 8-digit numeric); they are presets, not guarantees —
 * candidates must confirm against their own admit card.
 */
export const FORMAT_PRESETS = [
  {
    id: "digits-12",
    label: "12-digit numeric — e.g. JEE Main application number",
    charset: "digits",
    minLen: 12,
    maxLen: 12,
    prefix: "",
  },
  {
    id: "digits-11",
    label: "11-digit numeric — e.g. NTA application numbers",
    charset: "digits",
    minLen: 11,
    maxLen: 11,
    prefix: "",
  },
  {
    id: "digits-8",
    label: "8-digit numeric — e.g. CBSE board roll number",
    charset: "digits",
    minLen: 8,
    maxLen: 8,
    prefix: "",
  },
  {
    id: "digits-7",
    label: "Up to 7-digit numeric — e.g. UPSC roll number",
    charset: "digits",
    minLen: 1,
    maxLen: 7,
    prefix: "",
  },
  {
    id: "upper-alnum-10",
    label: "10-character capitals + digits — many state boards",
    charset: "upper-alnum",
    minLen: 10,
    maxLen: 10,
    prefix: "",
  },
  {
    id: "custom",
    label: "Custom rule (set length, characters and prefix yourself)",
    charset: "digits",
    minLen: 1,
    maxLen: 20,
    prefix: "",
  },
];

/**
 * Digit/letter lookalike pairs that cause most transcription failures on
 * form portals: letter O vs zero, letters I/l vs one, letter S vs five,
 * letter B vs eight.
 */
const LOOKALIKES = [
  { chars: /[Oo]/, hint: "letter O found — did you mean the digit 0?" },
  { chars: /[Il]/, hint: "letter I or l found — did you mean the digit 1?" },
  { chars: /S/, hint: "letter S found — did you mean the digit 5?" },
  { chars: /B/, hint: "letter B found — did you mean the digit 8?" },
];

/** Hard ceiling so a pasted essay cannot masquerade as a roll number. */
export const MAX_SUPPORTED_LENGTH = 40;

/**
 * Validate a roll/registration number against a structural rule set.
 *
 * @param {object} input
 * @param {string} input.value    The number the candidate is about to submit.
 * @param {string} input.charset  One of CHARSETS ids.
 * @param {number} input.minLen   Minimum accepted length (inclusive).
 * @param {number} input.maxLen   Maximum accepted length (inclusive).
 * @param {string} [input.prefix] Required leading characters (exact match).
 * @returns {{valid:boolean, cleaned:string, checks:Array, hints:string[]}|{error:string}}
 */
export function validateRollNumber({ value, charset, minLen, maxLen, prefix = "" }) {
  if (typeof value !== "string") return { error: "Enter the roll number to check." };

  const min = Number(minLen);
  const max = Number(maxLen);
  if (!Number.isInteger(min) || !Number.isInteger(max) || min < 1 || max < 1) {
    return { error: "Length limits must be whole numbers of at least 1." };
  }
  if (min > max) {
    return { error: "Minimum length cannot be greater than maximum length." };
  }
  if (max > MAX_SUPPORTED_LENGTH) {
    return { error: `Maximum length supported is ${MAX_SUPPORTED_LENGTH} characters.` };
  }

  const charsetRule = CHARSETS.find((c) => c.id === charset);
  if (!charsetRule) return { error: "Choose which characters the number may contain." };

  const raw = value;
  if (raw.trim() === "") return { error: "Enter the roll number to check." };

  // What the candidate should actually paste into the portal.
  const cleaned = raw.trim();

  const checks = [];
  const hints = [];

  const hadOuterSpace = raw !== cleaned;
  checks.push({
    id: "outer-space",
    label: "No leading or trailing spaces",
    pass: !hadOuterSpace,
    detail: hadOuterSpace
      ? "Spaces around the number were found — portals often reject or silently store them."
      : "Clean.",
  });

  const hasInnerSpace = /\s/.test(cleaned);
  checks.push({
    id: "inner-space",
    label: "No spaces inside the number",
    pass: !hasInnerSpace,
    detail: hasInnerSpace ? "Remove every space inside the number." : "Clean.",
  });

  const charsetPass = !hasInnerSpace && charsetRule.pattern.test(cleaned);
  checks.push({
    id: "charset",
    label: `Contains ${charsetRule.describe}`,
    pass: charsetPass,
    detail: charsetPass
      ? "All characters allowed."
      : `Found characters outside the allowed set (${charsetRule.describe}).`,
  });

  const lengthPass = cleaned.length >= min && cleaned.length <= max;
  checks.push({
    id: "length",
    label:
      min === max
        ? `Exactly ${min} characters long`
        : `Between ${min} and ${max} characters long`,
    pass: lengthPass,
    detail: `Current length: ${cleaned.length}.`,
  });

  const wantedPrefix = String(prefix ?? "").trim();
  if (wantedPrefix !== "") {
    const prefixPass = cleaned.startsWith(wantedPrefix);
    checks.push({
      id: "prefix",
      label: `Starts with "${wantedPrefix}"`,
      pass: prefixPass,
      detail: prefixPass
        ? "Prefix matches."
        : `The number starts with "${cleaned.slice(0, wantedPrefix.length)}" instead.`,
    });
  }

  // Lookalike hints only matter when a digits-only rule failed on letters.
  if (charsetRule.id === "digits" && !charsetPass) {
    for (const { chars, hint } of LOOKALIKES) {
      if (chars.test(cleaned)) hints.push(hint);
    }
  }

  const valid = checks.every((c) => c.pass);
  return { valid, cleaned, checks, hints };
}
