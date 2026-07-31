/**
 * PAN (Permanent Account Number) structural validation and holder-type decoding.
 *
 * Basis
 *  - A PAN is ten characters: AAAAA9999A.
 *      positions 1-5  five letters. Positions 1-3 are an alphabetic series run by the
 *                     Income Tax Department; position 4 is the status of the holder;
 *                     position 5 is the first character of the surname (for an individual)
 *                     or of the entity name (for everyone else).
 *      positions 6-9  a four-digit sequence from 0001 to 9999.
 *      position  10   an alphabetic check character.
 *  - The algorithm behind the tenth character has never been published by the Income Tax
 *    Department, so no offline tool can prove a PAN was actually allotted. Only the
 *    department's own verification service can do that.
 *  - Rule 114B lists the transactions where quoting PAN is compulsory. Section 272B provides
 *    a penalty of Rs 10,000 for quoting a false PAN.
 *  - CBDT Circular No. 8/2013 requires an employee to report the landlord's PAN to the
 *    employer where annual rent paid exceeds Rs 1,00,000 in order to claim HRA exemption.
 */

/** Exact structure of a PAN. */
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
/** TAN structure, used only to tell the user they pasted the wrong identifier. */
export const TAN_REGEX = /^[A-Z]{4}[0-9]{5}[A-Z]$/;
export const PAN_LENGTH = 10;
/** Penalty under section 272B for quoting a false PAN. */
export const SECTION_272B_PENALTY = 10000;
/** Annual rent above which the landlord's PAN must be reported for HRA (Circular 8/2013). */
export const LANDLORD_PAN_RENT_LIMIT = 100000;
/** The four-digit block runs 0001 to 9999, so 0000 is outside the allotted range. */
export const MIN_SEQUENCE = 1;
export const MAX_SEQUENCE = 9999;

/**
 * Status of the holder, taken from the fourth character of the PAN.
 * `common` marks the ten codes that appear on almost every PAN in circulation.
 */
export const PAN_HOLDER_TYPES = {
  P: {
    label: "Individual",
    description: "A natural person. The fifth character is the first letter of the surname.",
    common: true,
  },
  C: {
    label: "Company",
    description: "A company registered under the Companies Act, including a one person company.",
    common: true,
  },
  H: {
    label: "Hindu Undivided Family (HUF)",
    description: "A HUF, assessed separately from its members, with the karta signing for it.",
    common: true,
  },
  F: {
    label: "Firm",
    description: "A partnership firm. Limited liability partnerships (LLPs) also carry this code — there is no separate LLP status code.",
    common: true,
  },
  A: {
    label: "Association of Persons (AOP)",
    description: "Two or more persons joining for a common purpose, such as a housing society.",
    common: true,
  },
  T: {
    label: "Trust",
    description: "A trust, including charitable and religious trusts registered under section 12A.",
    common: true,
  },
  B: {
    label: "Body of Individuals (BOI)",
    description: "A group of individuals carrying on an activity without forming an association.",
    common: true,
  },
  L: {
    label: "Local Authority",
    description: "A municipality, panchayat, cantonment board or similar local body.",
    common: true,
  },
  J: {
    label: "Artificial Juridical Person",
    description: "A legal entity that fits none of the other statuses, such as a deity or a university.",
    common: true,
  },
  G: {
    label: "Government",
    description: "A central or state government office or department.",
    common: true,
  },
};

const LETTER_FOR_DIGIT = { 0: "O", 1: "I", 5: "S", 8: "B", 2: "Z", 6: "G" };
const DIGIT_FOR_LETTER = { O: "0", I: "1", L: "1", S: "5", B: "8", Z: "2", G: "6" };

/** Uppercase and strip spaces, hyphens and full stops. Returns "" for non-strings. */
export function normalizePan(raw) {
  if (typeof raw !== "string") return "";
  return raw.toUpperCase().replace(/[\s\-.]/g, "");
}

/**
 * Redaction that keeps the series and the holder-type character visible and masks the
 * identifying part. Useful for logs and screenshots.
 */
export function redactPan(pan) {
  const normalized = normalizePan(pan);
  if (!PAN_REGEX.test(normalized)) return "";
  return `${normalized.slice(0, 4)}${"X".repeat(5)}${normalized[9]}`;
}

/**
 * Decode one PAN.
 * @param {string} raw
 * @returns {{input:string, normalized:string, valid:boolean, errors:string[], warnings:string[], suggestion:string|null, parts:object|null}}
 */
export function decodePan(raw) {
  const input = typeof raw === "string" ? raw : "";
  const normalized = normalizePan(input);
  const errors = [];
  const warnings = [];

  if (normalized.length === 0) {
    return {
      input,
      normalized,
      valid: false,
      errors: ["Enter a PAN — ten characters in the pattern AAAAA9999A."],
      warnings,
      suggestion: null,
      parts: null,
    };
  }

  if (/[^A-Z0-9]/.test(normalized)) {
    const bad = Array.from(new Set(normalized.match(/[^A-Z0-9]/g))).join(" ");
    errors.push(`A PAN uses only letters and digits. Remove: ${bad}`);
  }

  if (normalized.length !== PAN_LENGTH) {
    errors.push(`A PAN is exactly ${PAN_LENGTH} characters; you entered ${normalized.length}.`);
  }

  // A well-formed TAN is never a mistyped PAN, so say so and stop before guessing a fix.
  if (TAN_REGEX.test(normalized)) {
    return {
      input,
      normalized,
      valid: false,
      errors: [
        "That is a TAN (four letters, five digits, one letter), not a PAN. A deductor holds both, but they are different numbers.",
      ],
      warnings,
      suggestion: null,
      parts: null,
    };
  }

  // Position checks only once the length is right, otherwise positions shift and mislead.
  const suggestionChars = normalized.split("");
  for (let index = 0; normalized.length === PAN_LENGTH && index < PAN_LENGTH; index += 1) {
    const character = normalized[index];
    const position = index + 1;
    const wantsDigit = position >= 6 && position <= 9;

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

  const shapeOk = errors.length === 0 && PAN_REGEX.test(normalized);
  const candidate = suggestionChars.join("");
  const suggestion =
    !shapeOk && candidate !== normalized && PAN_REGEX.test(candidate) ? candidate : null;

  if (!shapeOk) {
    return { input, normalized, valid: false, errors, warnings, suggestion, parts: null };
  }

  const series = normalized.slice(0, 3);
  const holderTypeCode = normalized[3];
  const nameInitial = normalized[4];
  const sequence = normalized.slice(5, 9);
  const sequenceNumber = Number(sequence);
  const checkLetter = normalized[9];
  const holderType = PAN_HOLDER_TYPES[holderTypeCode] || null;

  if (!holderType) {
    errors.push(
      `Position 4 is "${holderTypeCode}", which is not a status code the Income Tax Department uses. Valid codes are ${Object.keys(PAN_HOLDER_TYPES).join(", ")}.`,
    );
    return { input, normalized, valid: false, errors, warnings, suggestion: null, parts: null };
  }

  if (sequenceNumber < MIN_SEQUENCE || sequenceNumber > MAX_SEQUENCE) {
    warnings.push(
      `The four-digit block runs from ${String(MIN_SEQUENCE).padStart(4, "0")} to ${MAX_SEQUENCE}, so "${sequence}" is outside the allotted range.`,
    );
  }

  if (!holderType.common) {
    warnings.push(
      `"${holderTypeCode}" is a valid but uncommon status code — double-check it against the PAN card before relying on it.`,
    );
  }

  return {
    input,
    normalized,
    valid: true,
    errors: [],
    warnings,
    suggestion: null,
    parts: {
      series,
      holderTypeCode,
      holderType,
      nameInitial,
      sequence,
      sequenceNumber,
      checkLetter,
      redacted: redactPan(normalized),
      grouped: `${series} ${holderTypeCode} ${nameInitial} ${sequence} ${checkLetter}`,
      isIndividual: holderTypeCode === "P",
    },
  };
}

/**
 * Decode a PAN and, when a name is supplied, check the fifth character against it.
 * For an individual the fifth character is the first letter of the SURNAME, so pass the
 * surname only; for any other holder pass the entity name.
 */
export function decodePanWithName({ pan, name = "" }) {
  const decoded = decodePan(pan);
  if (!decoded.valid) return { ...decoded, nameCheck: null };

  const cleaned = typeof name === "string" ? name.trim().toUpperCase() : "";
  if (cleaned.length === 0) return { ...decoded, nameCheck: null };

  const firstLetterMatch = cleaned.match(/[A-Z]/);
  if (!firstLetterMatch) {
    return {
      ...decoded,
      nameCheck: {
        checked: false,
        matches: false,
        message: "The name has no letters to compare against the fifth character.",
      },
    };
  }

  const expected = firstLetterMatch[0];
  const matches = expected === decoded.parts.nameInitial;
  const subject = decoded.parts.isIndividual ? "surname" : "entity name";

  return {
    ...decoded,
    nameCheck: {
      checked: true,
      matches,
      expected,
      actual: decoded.parts.nameInitial,
      message: matches
        ? `The fifth character "${decoded.parts.nameInitial}" matches the first letter of the ${subject}.`
        : `The fifth character is "${decoded.parts.nameInitial}" but the ${subject} starts with "${expected}". For an individual this character comes from the surname, not the first name.`,
    },
  };
}

/** Validate a newline-, comma- or tab-separated list of PANs. */
export function decodePanList(text) {
  if (typeof text !== "string") return { error: "Paste one PAN per line." };

  const entries = text
    .split(/[\n,;\t]+/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  if (entries.length === 0) return { error: "Nothing to check — paste at least one PAN." };

  const results = entries.map(decodePan);
  const validCount = results.filter((result) => result.valid).length;

  return {
    results,
    total: results.length,
    validCount,
    invalidCount: results.length - validCount,
  };
}
