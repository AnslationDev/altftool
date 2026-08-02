/**
 * IFSC (Indian Financial System Code) structural validation.
 *
 * The Reserve Bank of India specifies an eleven-character code:
 *
 *   positions 1-4   alphabetic  - the bank code
 *   position  5     always '0'  - reserved by the RBI for future use
 *   positions 6-11  alphanumeric- the branch identifier
 *
 * So HDFC0000123 is HDFC (bank), 0 (reserved), 000123 (branch). This module checks
 * that structure only. A code can be perfectly well formed and still not exist -
 * the authoritative list is the RBI's IFSC directory, which this tool does not call.
 *
 * The two mistakes that account for most rejected codes are typing the letter O in
 * the fifth position instead of the digit zero, and typing a zero inside the four
 * letter bank code. Both are detected and a corrected code is suggested.
 *
 * IFSC is not the same as the MICR code, which is the nine digit number printed at
 * the foot of a cheque (three digits city, three bank, three branch).
 */

/** An IFSC is exactly eleven characters. */
export const IFSC_LENGTH = 11;
/** The fifth character is reserved by the RBI and is always the digit zero. */
export const RESERVED_POSITION = 5;
export const RESERVED_CHARACTER = "0";
/** Full structural pattern for a normalised code. */
export const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;

/** 0-based index of the reserved character, derived from RESERVED_POSITION. */
const RESERVED_INDEX = RESERVED_POSITION - 1;
/** Length of the leading bank-code segment (everything before the reserved character). */
const BANK_CODE_LENGTH = RESERVED_INDEX;

/** Length of the MICR code, mentioned so the two are not confused. */
export const MICR_LENGTH = 9;

/**
 * Widely published bank codes, used only to add a friendly note. An unrecognised
 * prefix is NOT an error - there are hundreds of cooperative and regional banks.
 */
export const KNOWN_BANK_CODES = {
  SBIN: "State Bank of India",
  HDFC: "HDFC Bank",
  ICIC: "ICICI Bank",
  UTIB: "Axis Bank",
  KKBK: "Kotak Mahindra Bank",
  PUNB: "Punjab National Bank",
  BARB: "Bank of Baroda",
  CNRB: "Canara Bank",
  UBIN: "Union Bank of India",
  BKID: "Bank of India",
  IDIB: "Indian Bank",
  IOBA: "Indian Overseas Bank",
  CBIN: "Central Bank of India",
  MAHB: "Bank of Maharashtra",
  UCBA: "UCO Bank",
  PSIB: "Punjab & Sind Bank",
  YESB: "Yes Bank",
  INDB: "IndusInd Bank",
  IDFB: "IDFC First Bank",
  FDRL: "Federal Bank",
  RATN: "RBL Bank",
  KARB: "Karnataka Bank",
  CIUB: "City Union Bank",
  SIBL: "South Indian Bank",
  TMBL: "Tamilnad Mercantile Bank",
  DBSS: "DBS Bank India",
  SCBL: "Standard Chartered Bank",
  CITI: "Citibank",
  HSBC: "HSBC Bank",
  PYTM: "Paytm Payments Bank",
  AIRP: "Airtel Payments Bank",
};

const isUpperAlpha = (character) => character >= "A" && character <= "Z";

/** Strip spaces, hyphens and other separators, then uppercase. */
export function normaliseIfsc(raw) {
  if (typeof raw !== "string") return "";
  return raw.replace(/[^0-9A-Za-z]/g, "").toUpperCase();
}

/**
 * Suggest a corrected code for the two classic confusions:
 * letter O typed in the reserved position, and digit 0 typed inside the bank code.
 * @param {string} normalised an already normalised candidate
 * @returns {string|null} a suggestion that passes the pattern, or null
 */
export function suggestFix(normalised) {
  if (typeof normalised !== "string" || normalised.length !== IFSC_LENGTH) return null;
  const characters = normalised.split("");
  for (let index = 0; index < BANK_CODE_LENGTH; index += 1) {
    if (characters[index] === "0") characters[index] = "O";
    if (characters[index] === "1") characters[index] = "I";
  }
  if (characters[RESERVED_INDEX] === "O") characters[RESERVED_INDEX] = RESERVED_CHARACTER;
  const candidate = characters.join("");
  if (candidate === normalised) return null;
  return IFSC_PATTERN.test(candidate) ? candidate : null;
}

/**
 * Validate one IFSC.
 * @param {string} raw the code as typed
 * @returns {object} full diagnostic result, or { error } when nothing was entered
 */
export function validateIfsc(raw) {
  if (typeof raw !== "string" || raw.trim() === "") {
    return { error: "Enter an IFSC code to check." };
  }

  const input = raw.trim();
  const normalised = normaliseIfsc(input);
  const errors = [];

  if (normalised.length !== IFSC_LENGTH) {
    errors.push(
      `An IFSC has exactly ${IFSC_LENGTH} characters — this one has ${normalised.length} after removing spaces and separators.`,
    );
  }

  const bankCode = normalised.slice(0, BANK_CODE_LENGTH);
  const reserved = normalised.charAt(RESERVED_INDEX);
  const branchCode = normalised.slice(RESERVED_POSITION);

  if (bankCode.length === BANK_CODE_LENGTH && ![...bankCode].every(isUpperAlpha)) {
    errors.push("The first four characters are the bank code and must all be letters.");
  }
  if (normalised.length >= RESERVED_POSITION && reserved !== RESERVED_CHARACTER) {
    errors.push(
      reserved === "O"
        ? "The fifth character is the digit zero, not the letter O — this is the most common IFSC typo."
        : "The fifth character is reserved by the RBI and must be the digit 0.",
    );
  }
  // Note: no character-validity check is needed for branchCode here — normaliseIfsc()
  // already strips every character that isn't a letter or digit, so branchCode can only
  // ever contain A-Z/0-9 by construction. A length check is enough (see errors.push above).

  const valid = errors.length === 0 && IFSC_PATTERN.test(normalised);

  // Per-character diagnostics, padded so a short code still shows every slot.
  const characters = [];
  for (let index = 0; index < IFSC_LENGTH; index += 1) {
    const character = normalised.charAt(index) || "";
    let expected;
    let ok;
    if (index < BANK_CODE_LENGTH) {
      expected = "Letter (bank code)";
      ok = character !== "" && isUpperAlpha(character);
    } else if (index === RESERVED_INDEX) {
      expected = "Digit 0 (reserved)";
      ok = character === RESERVED_CHARACTER;
    } else {
      expected = "Letter or digit (branch)";
      // normaliseIfsc() already guarantees every character here is A-Z/0-9, so this
      // position can only ever be "Wrong" for being unfilled, never for a bad character.
      ok = character !== "";
    }
    characters.push({ position: index + 1, character, expected, ok });
  }

  // Track the two reformatting steps separately so the UI can describe exactly
  // what changed instead of always claiming both happened (see normaliseIfsc()).
  const stripped = input.replace(/[^0-9A-Za-z]/g, "");
  const hadSeparators = stripped !== input;
  const hadCaseChange = stripped !== stripped.toUpperCase();
  const wasReformatted = normalised !== input;

  return {
    input,
    normalised,
    valid,
    errors,
    bankCode: normalised.length >= BANK_CODE_LENGTH ? bankCode : "",
    bankName: KNOWN_BANK_CODES[bankCode] ?? null,
    reserved: normalised.length >= RESERVED_POSITION ? reserved : "",
    branchCode: normalised.length > RESERVED_POSITION ? branchCode : "",
    characters,
    wasReformatted,
    hadSeparators,
    hadCaseChange,
    suggestion: valid ? null : suggestFix(normalised),
  };
}

/**
 * Validate a block of codes, one per line or separated by commas.
 * @param {string} text
 * @returns {{rows: object[], total: number, validCount: number, invalidCount: number}}
 */
export function validateBatch(text) {
  if (typeof text !== "string") return { rows: [], total: 0, validCount: 0, invalidCount: 0 };
  const tokens = text
    .split(/[\n,;\t]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  const rows = tokens.map((token) => {
    const result = validateIfsc(token);
    return {
      input: token,
      normalised: result.normalised ?? "",
      valid: Boolean(result.valid),
      bankName: result.bankName ?? null,
      reason: result.valid ? "" : (result.errors?.[0] ?? result.error ?? "Invalid"),
      suggestion: result.suggestion ?? null,
    };
  });

  const validCount = rows.filter((row) => row.valid).length;
  return {
    rows,
    total: rows.length,
    validCount,
    invalidCount: rows.length - validCount,
  };
}
