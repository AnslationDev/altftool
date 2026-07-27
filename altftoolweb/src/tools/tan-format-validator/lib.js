/**
 * TAN (Tax Deduction and Collection Account Number) structural validation.
 *
 * Basis
 *  - Section 203A of the Income-tax Act, 1961 requires every person deducting or collecting
 *    tax at source to obtain a TAN and quote it in every TDS/TCS challan, statement and
 *    certificate. Section 272BB imposes a penalty of Rs 10,000 for failing to apply for or
 *    for quoting a wrong TAN.
 *  - The number is allotted on Form 49B and is always ten characters:
 *      positions 1-3  three letters, the location code of the allotting income-tax office
 *      position  4    one letter, the initial of the deductor's name
 *      positions 5-9  five digits, a running serial
 *      position  10   one letter
 *  - There is no published checksum in a TAN, so no offline tool can prove a TAN exists.
 *    Only the Income Tax e-filing "Know your TAN" service can confirm that.
 */

/** Exact structure of a TAN: AAAA 99999 A. */
export const TAN_REGEX = /^[A-Z]{4}[0-9]{5}[A-Z]$/;
/** PAN structure, used only to tell the user they pasted the wrong identifier. */
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
/** Total characters in a TAN. */
export const TAN_LENGTH = 10;
/** Penalty under section 272BB for failure to apply for or wrongly quoting a TAN. */
export const SECTION_272BB_PENALTY = 10000;

/**
 * Location codes seen on TANs, keyed to the city of the allotting income-tax office.
 * This is a reference list only — the Income Tax Department assigns the codes and may use
 * codes that are not listed here, so an unlisted code never makes a TAN invalid.
 */
export const TAN_LOCATION_CODES = {
  AGR: "Agra",
  AHM: "Ahmedabad",
  ALD: "Prayagraj (Allahabad)",
  AMR: "Amritsar",
  BLR: "Bengaluru",
  BPL: "Bhopal",
  BRD: "Vadodara",
  CAL: "Kolkata",
  CHE: "Chennai",
  CHG: "Chandigarh",
  CMB: "Coimbatore",
  DEL: "Delhi",
  GAU: "Guwahati",
  HYD: "Hyderabad",
  JBP: "Jabalpur",
  JDH: "Jodhpur",
  JPR: "Jaipur",
  KNP: "Kanpur",
  LDH: "Ludhiana",
  MRT: "Meerut",
  MUM: "Mumbai",
  NAG: "Nagpur",
  NSK: "Nashik",
  PNE: "Pune",
  PTN: "Patna",
  RCH: "Ranchi",
  RTK: "Rohtak",
  SHL: "Shillong",
  SRT: "Surat",
  TVD: "Thiruvananthapuram",
};

/** Characters people most often swap between the letter block and the digit block. */
const LETTER_FOR_DIGIT = { 0: "O", 1: "I", 5: "S", 8: "B", 2: "Z", 6: "G" };
const DIGIT_FOR_LETTER = { O: "0", I: "1", L: "1", S: "5", B: "8", Z: "2", G: "6" };

/** Uppercase and strip spaces, hyphens and full stops. Returns "" for non-strings. */
export function normalizeTan(raw) {
  if (typeof raw !== "string") return "";
  return raw.toUpperCase().replace(/[\s\-.]/g, "");
}

/**
 * Validate one TAN.
 * @param {string} raw
 * @returns {{input:string, normalized:string, valid:boolean, errors:string[], suggestion:string|null, parts:object|null}}
 */
export function validateTan(raw) {
  const input = typeof raw === "string" ? raw : "";
  const normalized = normalizeTan(input);
  const errors = [];

  if (normalized.length === 0) {
    return {
      input,
      normalized,
      valid: false,
      errors: ["Enter a TAN — ten characters in the pattern AAAA99999A."],
      suggestion: null,
      parts: null,
    };
  }

  if (/[^A-Z0-9]/.test(normalized)) {
    const bad = Array.from(new Set(normalized.match(/[^A-Z0-9]/g))).join(" ");
    errors.push(`A TAN uses only letters and digits. Remove: ${bad}`);
  }

  if (normalized.length !== TAN_LENGTH) {
    errors.push(
      `A TAN is exactly ${TAN_LENGTH} characters; you entered ${normalized.length}.`,
    );
  }

  // A well-formed PAN is never a mistyped TAN, so say so and stop before guessing a fix.
  if (PAN_REGEX.test(normalized)) {
    return {
      input,
      normalized,
      valid: false,
      errors: [
        "That is a PAN (five letters, four digits, one letter), not a TAN. A deductor needs both, but they are different numbers.",
      ],
      suggestion: null,
      parts: null,
    };
  }

  // Position-by-position checks only make sense once the length is right — otherwise every
  // character after the missing one would be reported against the wrong position.
  const suggestionChars = normalized.split("");
  for (let index = 0; normalized.length === TAN_LENGTH && index < TAN_LENGTH; index += 1) {
    const character = normalized[index];
    const position = index + 1;
    const wantsDigit = position >= 5 && position <= 9;

    if (wantsDigit && !/[0-9]/.test(character)) {
      const fix = DIGIT_FOR_LETTER[character];
      errors.push(
        fix
          ? `Position ${position} must be a digit — "${character}" looks like a typo for "${fix}".`
          : `Position ${position} must be a digit, but it is "${character}".`,
      );
      if (fix) suggestionChars[index] = fix;
    }

    if (!wantsDigit && !/[A-Z]/.test(character)) {
      const fix = LETTER_FOR_DIGIT[character];
      errors.push(
        fix
          ? `Position ${position} must be a letter — "${character}" looks like a typo for "${fix}".`
          : `Position ${position} must be a letter, but it is "${character}".`,
      );
      if (fix) suggestionChars[index] = fix;
    }
  }

  const valid = errors.length === 0 && TAN_REGEX.test(normalized);
  const candidate = suggestionChars.join("");
  const suggestion =
    !valid && candidate !== normalized && TAN_REGEX.test(candidate) ? candidate : null;

  if (!valid) {
    return { input, normalized, valid: false, errors, suggestion, parts: null };
  }

  const locationCode = normalized.slice(0, 3);
  const nameInitial = normalized[3];
  const serial = normalized.slice(4, 9);
  const checkLetter = normalized[9];

  return {
    input,
    normalized,
    valid: true,
    errors: [],
    suggestion: null,
    parts: {
      locationCode,
      locationCity: TAN_LOCATION_CODES[locationCode] || null,
      nameInitial,
      serial,
      serialNumber: Number(serial),
      checkLetter,
      grouped: `${locationCode} ${nameInitial} ${serial} ${checkLetter}`,
    },
  };
}

/**
 * Validate a newline-, comma- or space-separated list of TANs.
 * Returns one result per non-empty entry plus a tally.
 */
export function validateTanList(text) {
  if (typeof text !== "string") {
    return { error: "Paste one TAN per line." };
  }
  const entries = text
    .split(/[\n,;\t]+/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  if (entries.length === 0) {
    return { error: "Nothing to check — paste at least one TAN." };
  }

  const results = entries.map(validateTan);
  const validCount = results.filter((result) => result.valid).length;

  return {
    results,
    total: results.length,
    validCount,
    invalidCount: results.length - validCount,
  };
}
