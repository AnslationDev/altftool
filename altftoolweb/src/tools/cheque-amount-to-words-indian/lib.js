/**
 * Rupee amount to words in the Indian numbering system.
 *
 * The Indian system groups digits as 2-2-3 after the hundreds place, so the
 * place names are hundred (10^2), thousand (10^3), lakh (10^5) and crore (10^7).
 * Above a crore there is no further name in ordinary banking use, so a number is
 * expressed as a count of crores - 1,23,45,67,890 reads as
 * "One Hundred Twenty Three Crore Forty Five Lakh Sixty Seven Thousand Eight
 * Hundred Ninety". This module applies the crore rule recursively so any size works.
 *
 * Cheque convention followed here is the one banks print on the courtesy line:
 * the words begin with "Rupees", the paise are stated separately, and the line ends
 * with "Only" so nothing can be appended to it. One hundred paise make one rupee,
 * so the fractional part is always rounded to two decimal places.
 */

/** One rupee is one hundred paise. */
export const PAISE_PER_RUPEE = 100;
/** Largest amount the converter will accept, to keep the output readable. */
export const MAX_AMOUNT = 999999999999999;

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

/** International scale names, for the secondary million/billion rendering. */
const INTERNATIONAL_SCALES = [
  { value: 1e12, name: "Trillion" },
  { value: 1e9, name: "Billion" },
  { value: 1e6, name: "Million" },
  { value: 1e3, name: "Thousand" },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Words for an integer from 0 to 99. */
function twoDigitWords(n) {
  if (n < 20) return ONES[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return ones === 0 ? TENS[tens] : `${TENS[tens]} ${ONES[ones]}`;
}

/** Words for an integer from 0 to 999. */
function threeDigitWords(n) {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  const parts = [];
  if (hundreds > 0) parts.push(`${ONES[hundreds]} Hundred`);
  if (rest > 0) parts.push(twoDigitWords(rest));
  return parts.join(" ");
}

/**
 * Words for a whole number in the Indian system (crore / lakh / thousand / hundred).
 * @param {number} n non-negative integer
 * @returns {string} "" for zero, so callers can decide how to say nothing
 */
export function indianWords(n) {
  if (!isNum(n) || n < 0) return "";
  const value = Math.floor(n);
  if (value === 0) return "";

  const crore = Math.floor(value / 10000000);
  const afterCrore = value % 10000000;
  const lakh = Math.floor(afterCrore / 100000);
  const afterLakh = afterCrore % 100000;
  const thousand = Math.floor(afterLakh / 1000);
  const rest = afterLakh % 1000;

  const parts = [];
  // The count of crores is itself spelled with the Indian system, so 1234 crore works.
  if (crore > 0) parts.push(`${indianWords(crore)} Crore`);
  if (lakh > 0) parts.push(`${twoDigitWords(lakh)} Lakh`);
  if (thousand > 0) parts.push(`${twoDigitWords(thousand)} Thousand`);
  if (rest > 0) parts.push(threeDigitWords(rest));
  return parts.join(" ");
}

/** Words for a whole number in the international system (million / billion). */
export function internationalWords(n) {
  if (!isNum(n) || n < 0) return "";
  let remaining = Math.floor(n);
  if (remaining === 0) return "";
  const parts = [];
  for (const scale of INTERNATIONAL_SCALES) {
    const count = Math.floor(remaining / scale.value);
    if (count > 0) {
      parts.push(`${internationalWords(count)} ${scale.name}`);
      remaining %= scale.value;
    }
  }
  if (remaining > 0) parts.push(threeDigitWords(remaining));
  return parts.join(" ");
}

const CASE_MODES = ["title", "upper", "sentence"];

/** Apply the requested letter casing to a finished phrase. */
export function applyCase(text, mode = "title") {
  if (typeof text !== "string") return "";
  if (mode === "upper") return text.toUpperCase();
  if (mode === "sentence") {
    const lower = text.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }
  return text;
}

/**
 * Convert a rupee amount into cheque words.
 *
 * @param {object} input
 * @param {number} input.amount              The amount in rupees, paise as decimals.
 * @param {"title"|"upper"|"sentence"} [input.letterCase]
 * @param {boolean} [input.includeOnly]      Append "Only" the way a cheque requires.
 * @param {boolean} [input.usePaiseFraction] Write paise as "78/100" instead of words.
 * @returns {object} the renderings, or { error }.
 */
export function amountToWords({
  amount,
  letterCase = "title",
  includeOnly = true,
  usePaiseFraction = false,
} = {}) {
  if (!isNum(amount)) return { error: "Enter the amount as a number." };
  if (amount < 0) return { error: "A cheque cannot be written for a negative amount." };
  if (amount > MAX_AMOUNT) {
    return { error: "That amount is too large to spell out — enter up to 15 digits." };
  }
  if (!CASE_MODES.includes(letterCase)) return { error: "Choose a valid letter case." };

  // Work in paise so 0.1 + 0.2 style float error cannot leak into the words.
  const totalPaise = Math.round(amount * PAISE_PER_RUPEE);
  const rupees = Math.floor(totalPaise / PAISE_PER_RUPEE);
  const paise = totalPaise % PAISE_PER_RUPEE;

  const rupeeWords = rupees === 0 ? "Zero" : indianWords(rupees);
  const paiseWords = paise === 0 ? "" : twoDigitWords(paise);

  const segments = [`Rupees ${rupeeWords}`];
  if (paise > 0) {
    segments.push(usePaiseFraction ? `and ${paise}/100` : `and Paise ${paiseWords}`);
  }
  if (includeOnly) segments.push("Only");
  const cheque = applyCase(segments.join(" "), letterCase);

  const plainSegments = [`${rupeeWords} Rupees`];
  if (paise > 0) plainSegments.push(`and ${paiseWords} Paise`);
  const plain = applyCase(plainSegments.join(" "), letterCase);

  const internationalBase = rupees === 0 ? "Zero" : internationalWords(rupees);
  const international = applyCase(
    paise > 0 ? `${internationalBase} Rupees and ${paiseWords} Paise` : `${internationalBase} Rupees`,
    letterCase,
  );

  return {
    rupees,
    paise,
    /** 12,34,567.89 — Indian 2-2-3 digit grouping. */
    formattedIndian: new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(totalPaise / PAISE_PER_RUPEE),
    /** 1,234,567.89 — international 3-digit grouping, for comparison. */
    formattedInternational: new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(totalPaise / PAISE_PER_RUPEE),
    chequeWords: cheque,
    plainWords: plain,
    internationalWords: international,
    rupeeWordsOnly: applyCase(rupeeWords, letterCase),
    paiseWordsOnly: applyCase(paiseWords, letterCase),
    hasPaise: paise > 0,
  };
}
