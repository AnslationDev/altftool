/**
 * Tax invoice numbering under Rule 46(b) of the Central Goods and Services Tax Rules, 2017.
 *
 * Rule 46(b) requires "a consecutive serial number not exceeding sixteen characters, in one or
 * multiple series, containing alphabets or numerals or special characters - hyphen or dash and
 * slash symbolised as '-' and '/' respectively, and any combination thereof, unique for a
 * financial year".
 *
 * A separate, tighter rule applies to e-invoicing. The e-invoice schema notified under
 * Notification No. 13/2020-Central Tax rejects a document number that begins with 0, / or -,
 * and allows only alphanumerics together with / and -.
 */

/** Rule 46(b): the whole invoice number may not exceed sixteen characters. */
export const MAX_INVOICE_NUMBER_LENGTH = 16;

/** Rule 46(b): letters, digits, hyphen and slash only. */
export const ALLOWED_CHARACTERS = /^[A-Za-z0-9/-]*$/;

/** e-invoice schema: the document number cannot start with 0, / or -. */
export const EINVOICE_FORBIDDEN_FIRST_CHARACTERS = ["0", "/", "-"];

export const FY_STYLES = [
  { id: "long-short", label: "2025-26", build: (y) => `${y}-${String(y + 1).slice(2)}` },
  { id: "short-short", label: "25-26", build: (y) => `${String(y).slice(2)}-${String(y + 1).slice(2)}` },
  { id: "compact", label: "2526", build: (y) => `${String(y).slice(2)}${String(y + 1).slice(2)}` },
  { id: "long-long", label: "2025-2026", build: (y) => `${y}-${y + 1}` },
];

export const SEPARATORS = [
  { id: "slash", label: "Slash  /", value: "/" },
  { id: "hyphen", label: "Hyphen  -", value: "-" },
  { id: "none", label: "No separator", value: "" },
];

export const FY_POSITIONS = [
  { id: "after-prefix", label: "Prefix, year, number" },
  { id: "before-prefix", label: "Year, prefix, number" },
  { id: "omit", label: "No year in the number" },
];

export const MIN_FY_START = 2017;
export const MAX_FY_START = 2099;
export const MAX_PREVIEW = 50;

export function getFyStyle(id) {
  return FY_STYLES.find((style) => style.id === id);
}

export function getSeparator(id) {
  const found = SEPARATORS.find((entry) => entry.id === id);
  return found ? found.value : "/";
}

/** Financial year label for a start year, e.g. 2025 -> "2025-26" in the default style. */
export function financialYearLabel(startYear, styleId = "long-short") {
  const style = getFyStyle(styleId) ?? FY_STYLES[0];
  return style.build(Number(startYear));
}

/**
 * Check one invoice number against Rule 46(b) and against the stricter e-invoice schema.
 *
 * @param {string} value
 * @returns {{ valid: boolean, length: number, errors: string[], eInvoiceSafe: boolean, eInvoiceNote: string|null }}
 */
export function validateInvoiceNumber(value) {
  const text = String(value ?? "");
  const errors = [];

  if (text.length === 0) errors.push("The invoice number is empty.");
  if (text.length > MAX_INVOICE_NUMBER_LENGTH) {
    errors.push(
      `Rule 46(b) allows at most ${MAX_INVOICE_NUMBER_LENGTH} characters; this one is ${text.length}.`,
    );
  }
  if (!ALLOWED_CHARACTERS.test(text)) {
    errors.push("Only letters, digits, hyphen and slash are permitted by Rule 46(b).");
  }

  const first = text.charAt(0);
  const eInvoiceSafe =
    errors.length === 0 && !EINVOICE_FORBIDDEN_FIRST_CHARACTERS.includes(first);
  const eInvoiceNote = eInvoiceSafe
    ? null
    : EINVOICE_FORBIDDEN_FIRST_CHARACTERS.includes(first)
      ? `The e-invoice schema rejects a document number starting with "${first}".`
      : null;

  return {
    valid: errors.length === 0,
    length: text.length,
    errors,
    eInvoiceSafe,
    eInvoiceNote,
  };
}

/**
 * Assemble one invoice number from its parts.
 *
 * @param {object} input
 * @param {string} input.prefix
 * @param {string} input.fyLabel        Empty string to leave the year out.
 * @param {string} input.separator
 * @param {number} input.sequence
 * @param {number} input.padding        Minimum digits in the running number.
 * @param {string} input.fyPosition     "after-prefix" | "before-prefix" | "omit"
 * @returns {string}
 */
export function buildInvoiceNumber({
  prefix = "",
  fyLabel = "",
  separator = "/",
  sequence = 1,
  padding = 4,
  fyPosition = "after-prefix",
}) {
  const digits = String(Math.max(0, Math.trunc(Number(sequence) || 0))).padStart(
    Math.max(0, Math.trunc(Number(padding) || 0)),
    "0",
  );

  const parts = [];
  if (fyPosition === "before-prefix" && fyLabel) parts.push(fyLabel);
  if (prefix) parts.push(prefix);
  if (fyPosition === "after-prefix" && fyLabel) parts.push(fyLabel);
  parts.push(digits);

  return parts.join(separator);
}

/**
 * Generate a whole series and validate it.
 *
 * @param {object} input
 * @param {string} input.prefix
 * @param {number} input.startYear
 * @param {string} input.fyStyleId
 * @param {string} input.separatorId
 * @param {string} input.fyPosition
 * @param {number} input.start        First running number.
 * @param {number} input.count        How many numbers to preview.
 * @param {number} input.padding
 * @returns {object} { pattern, samples, validation, ... } or { error }.
 */
export function generateInvoiceSeries({
  prefix = "",
  startYear,
  fyStyleId = "long-short",
  separatorId = "slash",
  fyPosition = "after-prefix",
  start = 1,
  count = 10,
  padding = 4,
}) {
  const year = Number(startYear);
  const first = Number(start);
  const howMany = Number(count);
  const pad = Number(padding);
  const cleanPrefix = String(prefix ?? "").trim();

  if (!Number.isInteger(year) || year < MIN_FY_START || year > MAX_FY_START) {
    return { error: `Choose a financial year between ${MIN_FY_START} and ${MAX_FY_START}.` };
  }
  if (!Number.isFinite(first) || first < 0 || !Number.isInteger(first)) {
    return { error: "The starting number must be a whole number of zero or more." };
  }
  if (!Number.isFinite(howMany) || howMany < 1) {
    return { error: "Preview at least one invoice number." };
  }
  if (howMany > MAX_PREVIEW) {
    return { error: `Preview up to ${MAX_PREVIEW} numbers at a time.` };
  }
  if (!Number.isFinite(pad) || pad < 1 || pad > 10) {
    return { error: "Padding should be between 1 and 10 digits." };
  }
  if (!ALLOWED_CHARACTERS.test(cleanPrefix)) {
    return { error: "The prefix may contain only letters, digits, hyphen and slash." };
  }
  if (!FY_POSITIONS.some((entry) => entry.id === fyPosition)) {
    return { error: "Choose where the financial year sits in the number." };
  }

  const separator = getSeparator(separatorId);
  const fyLabel = fyPosition === "omit" ? "" : financialYearLabel(year, fyStyleId);

  const samples = [];
  for (let index = 0; index < Math.trunc(howMany); index += 1) {
    const number = buildInvoiceNumber({
      prefix: cleanPrefix,
      fyLabel,
      separator,
      sequence: first + index,
      padding: pad,
      fyPosition,
    });
    samples.push({ number, ...validateInvoiceNumber(number) });
  }

  const pattern = buildInvoiceNumber({
    prefix: cleanPrefix,
    fyLabel,
    separator,
    sequence: 0,
    padding: pad,
    fyPosition,
  }).replace(/0(?=0*$)/g, "N");

  const longest = samples.reduce((max, sample) => Math.max(max, sample.length), 0);
  const invalid = samples.filter((sample) => !sample.valid);
  const notEInvoiceSafe = samples.filter((sample) => sample.valid && !sample.eInvoiceSafe);

  // How many invoices fit before the padding widens and the number grows a character.
  const capacityAtPadding = 10 ** pad - first;
  const headroom = MAX_INVOICE_NUMBER_LENGTH - longest;

  return {
    pattern,
    financialYear: fyLabel || `${year}-${String(year + 1).slice(2)}`,
    samples,
    longestLength: longest,
    headroom,
    invalidCount: invalid.length,
    firstError: invalid.length > 0 ? invalid[0].errors[0] : null,
    eInvoiceSafe: notEInvoiceSafe.length === 0 && invalid.length === 0,
    eInvoiceNote: notEInvoiceSafe.length > 0 ? notEInvoiceSafe[0].eInvoiceNote : null,
    capacityAtPadding: capacityAtPadding > 0 ? capacityAtPadding : 0,
    separator,
    padding: pad,
    start: first,
  };
}
