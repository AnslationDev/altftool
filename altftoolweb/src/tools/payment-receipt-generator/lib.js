/**
 * Payment receipt generator — pure logic.
 *
 * A payment receipt is the document a seller issues to acknowledge money
 * actually received. It is not an invoice (a demand for payment); it records a
 * settled part or whole of one. The three pieces of arithmetic it needs are:
 *
 *   totalPaidToDate = previouslyPaid + amountPaid
 *   balanceDue      = invoiceTotal - totalPaidToDate      (floored at 0)
 *   overpayment     = totalPaidToDate - invoiceTotal      (when positive)
 *
 * Money is rounded to the ISO 4217 minor-unit count for the chosen currency
 * (2 for INR/USD/EUR/GBP, 0 for JPY), because a receipt must state an exact
 * payable figure rather than a floating-point remainder.
 *
 * Pure module: no React, no DOM, no clock reads. Dates arrive as ISO strings.
 */

/** ISO 4217 currencies with their minor-unit exponent and spoken unit names.
 * `system: "indian"` selects lakh/crore grouping for the amount-in-words line,
 * which is the convention on Indian receipts; everything else uses short scale
 * (thousand / million / billion). */
export const CURRENCIES = {
  INR: { code: "INR", locale: "en-IN", decimals: 2, unit: "Rupees", subunit: "Paise", system: "indian" },
  USD: { code: "USD", locale: "en-US", decimals: 2, unit: "Dollars", subunit: "Cents", system: "short" },
  EUR: { code: "EUR", locale: "en-IE", decimals: 2, unit: "Euro", subunit: "Cents", system: "short" },
  GBP: { code: "GBP", locale: "en-GB", decimals: 2, unit: "Pounds", subunit: "Pence", system: "short" },
  AED: { code: "AED", locale: "en-AE", decimals: 2, unit: "Dirhams", subunit: "Fils", system: "short" },
  SGD: { code: "SGD", locale: "en-SG", decimals: 2, unit: "Dollars", subunit: "Cents", system: "short" },
  AUD: { code: "AUD", locale: "en-AU", decimals: 2, unit: "Dollars", subunit: "Cents", system: "short" },
  CAD: { code: "CAD", locale: "en-CA", decimals: 2, unit: "Dollars", subunit: "Cents", system: "short" },
  JPY: { code: "JPY", locale: "ja-JP", decimals: 0, unit: "Yen", subunit: "Sen", system: "short" },
};

/** Payment instruments a receipt normally has to name, because the proof of
 * payment differs: a cheque needs its number, a transfer needs a reference. */
export const PAYMENT_MODES = [
  { id: "cash", label: "Cash", needsReference: false },
  { id: "bank-transfer", label: "Bank transfer / NEFT / wire", needsReference: true },
  { id: "upi", label: "UPI", needsReference: true },
  { id: "cheque", label: "Cheque", needsReference: true },
  { id: "card", label: "Debit / credit card", needsReference: true },
  { id: "gateway", label: "Online payment gateway", needsReference: true },
  { id: "other", label: "Other", needsReference: false },
];

/** Tokens accepted in a receipt-number pattern. */
export const DEFAULT_RECEIPT_PATTERN = "{PREFIX}-{YYYY}-{SEQ}";
export const PATTERN_TOKENS = ["{PREFIX}", "{YYYY}", "{YY}", "{MM}", "{DD}", "{SEQ}"];

/** Zero padding is capped so a receipt number stays readable. */
export const MIN_PADDING = 1;
export const MAX_PADDING = 10;

/** Largest integer this module will spell out: 999,999,999,999,999.
 * Above that the short-scale table runs out at "trillion" and the result would
 * be wrong rather than merely long. */
export const MAX_WORDS_INTEGER = 999999999999999;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Round to a currency's minor units without float drift on .005 cases. */
export function roundMoney(value, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/* ------------------------------------------------------------------ *
 * Amount in words
 * ------------------------------------------------------------------ */

const ONES = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen",
];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const SHORT_SCALE = ["", "thousand", "million", "billion", "trillion"];

/** 0-999 in words. Returns "" for 0 so callers can skip empty groups. */
function chunkToWords(n) {
  if (n <= 0) return "";
  const parts = [];
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  if (hundreds > 0) parts.push(`${ONES[hundreds]} hundred`);
  if (rest > 0) {
    if (hundreds > 0) parts.push("and");
    if (rest < 20) parts.push(ONES[rest]);
    else {
      const tens = Math.floor(rest / 10);
      const ones = rest % 10;
      parts.push(ones > 0 ? `${TENS[tens]}-${ONES[ones]}` : TENS[tens]);
    }
  }
  return parts.join(" ");
}

/**
 * Non-negative integer to words using the short scale (thousand, million,
 * billion, trillion) — the convention in the US, UK and international trade.
 *
 * @param {number} n
 * @returns {string|null} null when n is not a usable non-negative integer
 */
export function integerToWordsShortScale(n) {
  if (!isNum(n) || n < 0 || !Number.isInteger(n) || n > MAX_WORDS_INTEGER) return null;
  if (n === 0) return "zero";
  const groups = [];
  let rest = n;
  while (rest > 0) {
    groups.push(rest % 1000);
    rest = Math.floor(rest / 1000);
  }
  const words = [];
  for (let i = groups.length - 1; i >= 0; i -= 1) {
    if (groups[i] === 0) continue;
    const scale = SHORT_SCALE[i];
    words.push(scale ? `${chunkToWords(groups[i])} ${scale}` : chunkToWords(groups[i]));
  }
  return words.join(" ");
}

/**
 * Non-negative integer to words using the Indian system: the last three digits
 * form the units group, then digits are grouped in pairs as thousand (10^3),
 * lakh (10^5) and crore (10^7).
 *
 * @param {number} n
 * @returns {string|null}
 */
export function integerToWordsIndian(n) {
  if (!isNum(n) || n < 0 || !Number.isInteger(n) || n > MAX_WORDS_INTEGER) return null;
  if (n === 0) return "zero";
  const CRORE = 10000000; // 10^7
  const LAKH = 100000; // 10^5
  const crore = Math.floor(n / CRORE);
  const lakh = Math.floor((n % CRORE) / LAKH);
  const thousand = Math.floor((n % LAKH) / 1000);
  const rest = n % 1000;
  const words = [];
  if (crore > 0) {
    // Above 999 crore the count itself needs the Indian grouping again.
    const croreWords = crore > 999 ? integerToWordsIndian(crore) : chunkToWords(crore);
    words.push(`${croreWords} crore`);
  }
  if (lakh > 0) words.push(`${chunkToWords(lakh)} lakh`);
  if (thousand > 0) words.push(`${chunkToWords(thousand)} thousand`);
  if (rest > 0) words.push(chunkToWords(rest));
  return words.join(" ");
}

const capitalise = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : text);

/**
 * Money amount to the legal "amount in words" line printed on receipts.
 *
 * @param {number} amount
 * @param {string} currencyCode key of CURRENCIES
 * @returns {{ words: string } | { error: string }}
 */
export function amountInWords(amount, currencyCode) {
  const currency = CURRENCIES[currencyCode];
  if (!currency) return { error: "Choose a supported currency." };
  if (!isNum(amount) || amount < 0) return { error: "Enter a non-negative amount." };

  const factor = Math.pow(10, currency.decimals);
  const scaled = Math.round((amount + Number.EPSILON) * factor);
  const whole = Math.floor(scaled / factor);
  const frac = scaled - whole * factor;

  const spell = currency.system === "indian" ? integerToWordsIndian : integerToWordsShortScale;
  const wholeWords = spell(whole);
  if (wholeWords === null) {
    return { error: "That amount is too large to spell out on a receipt." };
  }

  let words = `${capitalise(wholeWords)} ${currency.unit}`;
  if (frac > 0) {
    const fracWords = spell(frac);
    words += ` and ${fracWords} ${currency.subunit}`;
  }
  return { words: `${words} only` };
}

/* ------------------------------------------------------------------ *
 * Receipt number
 * ------------------------------------------------------------------ */

/**
 * Fill a receipt-number pattern. Serial receipts must be unique and gapless,
 * so the sequence is a plain integer the issuer increments; the pattern only
 * decides how it is displayed.
 *
 * @param {object} input
 * @param {string} input.pattern e.g. "{PREFIX}-{YYYY}-{SEQ}"
 * @param {string} input.prefix
 * @param {number} input.sequence non-negative integer
 * @param {number} input.padding zero padding applied to {SEQ}
 * @param {string} input.dateISO "YYYY-MM-DD"
 * @returns {{ number: string } | { error: string }}
 */
export function buildReceiptNumber({ pattern, prefix, sequence, padding, dateISO }) {
  const shape = typeof pattern === "string" && pattern.trim() ? pattern.trim() : DEFAULT_RECEIPT_PATTERN;
  if (!isNum(sequence) || !Number.isInteger(sequence) || sequence < 0) {
    return { error: "The receipt serial number must be a whole number of zero or more." };
  }
  if (!isNum(padding) || padding < MIN_PADDING || padding > MAX_PADDING) {
    return { error: `Zero padding must be between ${MIN_PADDING} and ${MAX_PADDING} digits.` };
  }
  const parts = parseISODate(dateISO);
  if (parts.error) return { error: parts.error };

  const seq = String(sequence).padStart(Math.round(padding), "0");
  const number = shape
    .replace(/\{PREFIX\}/g, String(prefix ?? "").trim())
    .replace(/\{YYYY\}/g, parts.year)
    .replace(/\{YY\}/g, parts.year.slice(2))
    .replace(/\{MM\}/g, parts.month)
    .replace(/\{DD\}/g, parts.day)
    .replace(/\{SEQ\}/g, seq)
    .replace(/^[-/\s]+|[-/\s]+$/g, "")
    .replace(/([-/])\1+/g, "$1");

  if (!number) return { error: "That pattern produces an empty receipt number." };
  return { number };
}

/** Parse "YYYY-MM-DD" by string, so no timezone shifts the printed date. */
export function parseISODate(dateISO) {
  if (typeof dateISO !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) {
    return { error: "Enter the receipt date as YYYY-MM-DD." };
  }
  const [year, month, day] = dateISO.split("-");
  const m = Number(month);
  const d = Number(day);
  if (m < 1 || m > 12 || d < 1 || d > 31) return { error: "That receipt date is not a real date." };
  return { year, month, day };
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "2026-03-09" -> "09 March 2026". Pure string work, no Date object. */
export function formatLongDate(dateISO) {
  const parts = parseISODate(dateISO);
  if (parts.error) return "";
  return `${parts.day} ${MONTH_NAMES[Number(parts.month) - 1]} ${parts.year}`;
}

/* ------------------------------------------------------------------ *
 * Receipt totals
 * ------------------------------------------------------------------ */

/** Settlement state of the invoice after this receipt. */
export const RECEIPT_STATUS = {
  PAID: "Paid in full",
  PARTIAL: "Partially paid",
  OVERPAID: "Overpaid — credit due",
};

/**
 * Balance arithmetic for one receipt against one invoice.
 *
 * @param {object} input
 * @param {number} input.invoiceTotal full amount of the invoice being settled
 * @param {number} input.previouslyPaid amount already receipted before today
 * @param {number} input.amountPaid amount received on this receipt
 * @param {string} input.currency key of CURRENCIES
 * @returns {object} totals, or { error }
 */
export function computeReceipt({ invoiceTotal, previouslyPaid, amountPaid, currency }) {
  const meta = CURRENCIES[currency];
  if (!meta) return { error: "Choose a supported currency." };
  if (![invoiceTotal, previouslyPaid, amountPaid].every(isNum)) {
    return { error: "Enter valid numbers for the invoice total and the amounts paid." };
  }
  if (invoiceTotal <= 0) return { error: "The invoice total must be greater than zero." };
  if (previouslyPaid < 0 || amountPaid < 0) return { error: "Amounts paid cannot be negative." };
  if (amountPaid === 0) return { error: "A receipt has to acknowledge an amount greater than zero." };
  if (previouslyPaid > invoiceTotal) {
    return { error: "The amount already paid is larger than the invoice total — check the earlier receipts." };
  }

  const d = meta.decimals;
  const total = roundMoney(invoiceTotal, d);
  const before = roundMoney(previouslyPaid, d);
  const paid = roundMoney(amountPaid, d);
  const totalPaid = roundMoney(before + paid, d);
  const rawBalance = roundMoney(total - totalPaid, d);

  const balanceDue = Math.max(0, rawBalance);
  const overpayment = rawBalance < 0 ? Math.abs(rawBalance) : 0;
  const status = overpayment > 0
    ? RECEIPT_STATUS.OVERPAID
    : balanceDue === 0
      ? RECEIPT_STATUS.PAID
      : RECEIPT_STATUS.PARTIAL;

  return {
    currency: meta.code,
    decimals: d,
    locale: meta.locale,
    invoiceTotal: total,
    previouslyPaid: before,
    amountPaid: paid,
    totalPaid,
    balanceDue,
    overpayment,
    status,
    settledPercent: total > 0 ? Math.min(100, (totalPaid / total) * 100) : 0,
  };
}

/**
 * Plain-text receipt, ready to paste into an email or a print dialog.
 *
 * @param {object} input every field already validated/computed by the caller
 * @returns {string}
 */
export function buildReceiptText({
  receiptNumber,
  dateISO,
  receivedFrom,
  issuedBy,
  invoiceRef,
  modeLabel,
  reference,
  note,
  totals,
  words,
  formatMoney,
}) {
  const fmt = typeof formatMoney === "function" ? formatMoney : (value) => String(value);
  const lines = [
    "PAYMENT RECEIPT",
    `Receipt no: ${receiptNumber}`,
    `Date: ${formatLongDate(dateISO) || dateISO}`,
    issuedBy ? `Issued by: ${issuedBy}` : null,
    `Received from: ${receivedFrom || "—"}`,
    invoiceRef ? `Against invoice: ${invoiceRef}` : null,
    "",
    `Amount received: ${fmt(totals.amountPaid)}`,
    `Amount in words: ${words}`,
    `Payment mode: ${modeLabel}${reference ? ` (ref ${reference})` : ""}`,
    "",
    `Invoice total: ${fmt(totals.invoiceTotal)}`,
    `Paid earlier: ${fmt(totals.previouslyPaid)}`,
    `Paid to date: ${fmt(totals.totalPaid)}`,
    totals.overpayment > 0
      ? `Overpayment / credit: ${fmt(totals.overpayment)}`
      : `Balance due: ${fmt(totals.balanceDue)}`,
    `Status: ${totals.status}`,
    note ? "" : null,
    note ? `Note: ${note}` : null,
  ];
  return lines.filter((line) => line !== null).join("\n");
}
