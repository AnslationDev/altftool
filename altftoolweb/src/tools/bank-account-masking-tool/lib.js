/**
 * Masking bank account, card and Aadhaar numbers for safe sharing.
 *
 * The display rules this module implements are the published ones:
 *
 *  - Payment cards: PCI DSS requires that when a primary account number (PAN) is
 *    displayed, at most the first six and the last four digits are shown. Six plus
 *    four is therefore the maximum, not a target - show fewer where you can.
 *  - Aadhaar: UIDAI's masked Aadhaar shows only the last four digits, with the first
 *    eight replaced. Storing or displaying the full number without authority is
 *    restricted under the Aadhaar Act, 2016.
 *  - Bank accounts: there is no single statutory format, and the convention banks
 *    themselves use on statements and in apps is to reveal the last four digits.
 *
 * Two checksums are implemented so a number can be classified before it is masked:
 * the Luhn algorithm from ISO/IEC 7812-1, which every payment card satisfies, and
 * the Verhoeff algorithm, which is the check-digit scheme used by Aadhaar numbers.
 *
 * Everything runs on the string you paste - nothing is transmitted anywhere.
 */

/** PCI DSS maximum elements that may be displayed for a card number. */
export const PCI_KEEP_FIRST = 6;
export const PCI_KEEP_LAST = 4;
/** UIDAI masked Aadhaar reveals the final four digits only. */
export const AADHAAR_LENGTH = 12;
export const AADHAAR_KEEP_LAST = 4;
/** Card numbers under ISO/IEC 7812 run from 13 to 19 digits. */
export const CARD_MIN_DIGITS = 13;
export const CARD_MAX_DIGITS = 19;
/** Indian bank account numbers are commonly 9 to 18 digits. */
export const ACCOUNT_MIN_DIGITS = 9;
export const ACCOUNT_MAX_DIGITS = 18;

export const MASK_CHARACTERS = ["X", "*", "•", "#"];

/** Ready-made presets matching the rules above. */
export const MASK_PRESETS = [
  { value: "card", label: "Payment card (PCI DSS: first 6, last 4)", keepFirst: PCI_KEEP_FIRST, keepLast: PCI_KEEP_LAST },
  { value: "account", label: "Bank account (last 4 only)", keepFirst: 0, keepLast: 4 },
  { value: "aadhaar", label: "Aadhaar (UIDAI masked: last 4)", keepFirst: 0, keepLast: AADHAAR_KEEP_LAST },
  { value: "strict", label: "Strict (last 2 only)", keepFirst: 0, keepLast: 2 },
  { value: "custom", label: "Custom", keepFirst: 0, keepLast: 4 },
];

/** Verhoeff multiplication table (dihedral group D5). */
const VERHOEFF_D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

/** Verhoeff permutation table. */
const VERHOEFF_P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

/** Verhoeff inverse table. */
const VERHOEFF_INV = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

const onlyDigits = (value) => String(value ?? "").replace(/\D/g, "");

/**
 * Luhn check (ISO/IEC 7812-1). Every payment card number satisfies it.
 * @param {string} value digits, separators allowed
 * @returns {boolean}
 */
export function luhnCheck(value) {
  const digits = onlyDigits(value);
  if (digits.length < 2) return false;
  let sum = 0;
  let double = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = digits.charCodeAt(index) - 48;
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

/**
 * Verhoeff check-digit validation, the scheme Aadhaar numbers use.
 * @param {string} value digits, separators allowed
 * @returns {boolean}
 */
export function verhoeffCheck(value) {
  const digits = onlyDigits(value);
  if (digits.length === 0) return false;
  let checksum = 0;
  const reversed = digits.split("").reverse();
  for (let index = 0; index < reversed.length; index += 1) {
    checksum = VERHOEFF_D[checksum][VERHOEFF_P[index % 8][reversed[index].charCodeAt(0) - 48]];
  }
  return checksum === 0;
}

/**
 * Verhoeff check digit for a payload, so a test number can be built.
 * @param {string} payload digits without the check digit
 * @returns {number|null}
 */
export function verhoeffDigit(payload) {
  const digits = onlyDigits(payload);
  if (digits.length === 0) return null;
  let checksum = 0;
  const reversed = digits.split("").reverse();
  for (let index = 0; index < reversed.length; index += 1) {
    checksum = VERHOEFF_D[checksum][VERHOEFF_P[(index + 1) % 8][reversed[index].charCodeAt(0) - 48]];
  }
  return VERHOEFF_INV[checksum];
}

/**
 * Classify a run of digits so the right preset can be recommended.
 * @param {string} value
 * @returns {{type:string, label:string, confident:boolean}}
 */
export function detectType(value) {
  const digits = onlyDigits(value);
  if (digits.length === AADHAAR_LENGTH && verhoeffCheck(digits) && digits[0] !== "0" && digits[0] !== "1") {
    return { type: "aadhaar", label: "Aadhaar number (Verhoeff checksum passes)", confident: true };
  }
  if (digits.length >= CARD_MIN_DIGITS && digits.length <= CARD_MAX_DIGITS && luhnCheck(digits)) {
    return { type: "card", label: "Payment card (Luhn checksum passes)", confident: true };
  }
  if (digits.length >= ACCOUNT_MIN_DIGITS && digits.length <= ACCOUNT_MAX_DIGITS) {
    return { type: "account", label: "Bank account number", confident: false };
  }
  if (digits.length > 0) {
    return { type: "other", label: "Unrecognised number", confident: false };
  }
  return { type: "none", label: "No digits found", confident: false };
}

/**
 * Mask a single number.
 *
 * @param {object} input
 * @param {string} input.value            The number as typed, separators allowed.
 * @param {number} [input.keepFirst]      Leading digits left visible.
 * @param {number} [input.keepLast]       Trailing digits left visible.
 * @param {string} [input.maskChar]       Character used to hide a digit.
 * @param {boolean} [input.preserveSeparators] Keep the spaces and hyphens as typed.
 * @param {number} [input.groupSize]      Regroup the output in blocks of this size, 0 to skip.
 * @returns {object} the masked value, or { error }.
 */
export function maskNumber({
  value,
  keepFirst = 0,
  keepLast = 4,
  maskChar = "X",
  preserveSeparators = true,
  groupSize = 0,
} = {}) {
  if (typeof value !== "string" || value.trim() === "") {
    return { error: "Enter the number you want to mask." };
  }
  if (!Number.isInteger(keepFirst) || keepFirst < 0) return { error: "Digits to keep at the start must be 0 or more." };
  if (!Number.isInteger(keepLast) || keepLast < 0) return { error: "Digits to keep at the end must be 0 or more." };
  if (typeof maskChar !== "string" || maskChar.length !== 1) {
    return { error: "The mask character must be a single character." };
  }
  if (!Number.isInteger(groupSize) || groupSize < 0 || groupSize > 8) {
    return { error: "Group size must be between 0 and 8." };
  }

  const digits = onlyDigits(value);
  if (digits.length === 0) return { error: "There are no digits in that value to mask." };
  if (keepFirst + keepLast >= digits.length) {
    return {
      error: `Keeping ${keepFirst} + ${keepLast} digits would reveal the whole ${digits.length}-digit number — reduce one of them.`,
    };
  }

  const maskedDigits = digits
    .split("")
    .map((digit, index) =>
      index < keepFirst || index >= digits.length - keepLast ? digit : maskChar,
    )
    .join("");

  let masked;
  if (preserveSeparators) {
    let cursor = 0;
    masked = value
      .split("")
      .map((character) => (/\d/.test(character) ? maskedDigits[cursor++] : character))
      .join("");
  } else if (groupSize > 0) {
    masked = maskedDigits.replace(new RegExp(`(.{${groupSize}})`, "g"), "$1 ").trim();
  } else {
    masked = maskedDigits;
  }

  const detection = detectType(digits);
  const warnings = [];
  if (detection.type === "card" && (keepFirst > PCI_KEEP_FIRST || keepLast > PCI_KEEP_LAST)) {
    warnings.push(
      `PCI DSS allows at most the first ${PCI_KEEP_FIRST} and last ${PCI_KEEP_LAST} digits of a card to be displayed — this setting reveals more.`,
    );
  }
  if (detection.type === "aadhaar" && (keepFirst > 0 || keepLast > AADHAAR_KEEP_LAST)) {
    warnings.push(
      `A UIDAI masked Aadhaar shows only the last ${AADHAAR_KEEP_LAST} digits — this setting reveals more.`,
    );
  }
  if (digits.length - keepFirst - keepLast < 2) {
    warnings.push("Fewer than two digits are hidden, which offers almost no protection.");
  }

  return {
    original: value,
    digitCount: digits.length,
    hiddenCount: digits.length - keepFirst - keepLast,
    visibleCount: keepFirst + keepLast,
    masked,
    maskedCompact: maskedDigits,
    detectedType: detection.type,
    detectedLabel: detection.label,
    luhnValid: luhnCheck(digits),
    verhoeffValid: verhoeffCheck(digits),
    warnings,
  };
}

/**
 * Find and mask every long digit run inside a block of text.
 *
 * @param {object} input
 * @param {string} input.text
 * @param {number} [input.keepFirst]
 * @param {number} [input.keepLast]
 * @param {string} [input.maskChar]
 * @param {number} [input.minDigits] Shortest run treated as sensitive.
 * @returns {object} redacted text and the list of findings, or { error }.
 */
export function redactText({ text, keepFirst = 0, keepLast = 4, maskChar = "X", minDigits = 9 } = {}) {
  if (typeof text !== "string" || text.trim() === "") {
    return { error: "Paste some text to scan." };
  }
  if (!Number.isInteger(minDigits) || minDigits < 4 || minDigits > 19) {
    return { error: "The minimum run length must be between 4 and 19 digits." };
  }

  const findings = [];
  // A run of digits that may contain single spaces or hyphens between groups.
  const pattern = /\d(?:[\d\s-]*\d)?/g;

  const redacted = text.replace(pattern, (match) => {
    const digits = onlyDigits(match);
    if (digits.length < minDigits) return match;
    const result = maskNumber({ value: match, keepFirst, keepLast, maskChar, preserveSeparators: true });
    if (result.error) return match;
    findings.push({
      original: match.trim(),
      masked: result.masked.trim(),
      type: result.detectedType,
      label: result.detectedLabel,
      digitCount: result.digitCount,
    });
    return result.masked;
  });

  return { redacted, findings, count: findings.length };
}
