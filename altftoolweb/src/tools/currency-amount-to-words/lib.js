/**
 * Money amount -> words, in either the Indian or the international numbering system.
 *
 * Two numbering systems are in use for the same digits:
 *  - International (short scale): a new name every three digits after "hundred" —
 *    thousand 10^3, million 10^6, billion 10^9, trillion 10^12.
 *  - Indian: groups run 2-2-3, so the names are thousand 10^3, lakh 10^5, crore 10^7.
 *    There is no standard name above crore in ordinary use, so larger figures are read
 *    as a count of crores (1,23,45,67,89,012 = "One Thousand Two Hundred Thirty Four
 *    Crore ..."). This module applies the crore rule recursively so any size works.
 *
 * Minor units: almost every currency here divides into 100 minor units (ISO 4217
 * "minor unit = 2"), so the fractional part is rounded to two decimals and spelled out
 * of one hundred. The Japanese yen has no minor unit in circulation (ISO 4217 minor
 * unit = 0), so it is treated as a whole-number currency.
 */

/** Largest amount accepted, so the words stay readable and stay inside Number.MAX_SAFE_INTEGER once scaled to minor units. */
export const MAX_AMOUNT = 999999999999999;

/**
 * Currency table.
 * minorPerMajor follows the ISO 4217 minor-unit exponent (100 for exponent 2, 1 for exponent 0).
 */
export const CURRENCIES = {
  INR: {
    code: "INR",
    label: "Indian Rupee (₹)",
    major: "Rupees",
    majorSingular: "Rupee",
    minor: "Paise",
    minorSingular: "Paisa",
    minorPerMajor: 100,
    locale: "en-IN",
    defaultSystem: "indian",
  },
  USD: {
    code: "USD",
    label: "US Dollar ($)",
    major: "Dollars",
    majorSingular: "Dollar",
    minor: "Cents",
    minorSingular: "Cent",
    minorPerMajor: 100,
    locale: "en-US",
    defaultSystem: "international",
  },
  EUR: {
    code: "EUR",
    label: "Euro (€)",
    major: "Euros",
    majorSingular: "Euro",
    minor: "Cents",
    minorSingular: "Cent",
    minorPerMajor: 100,
    locale: "en-IE",
    defaultSystem: "international",
  },
  GBP: {
    code: "GBP",
    label: "Pound Sterling (£)",
    major: "Pounds",
    majorSingular: "Pound",
    minor: "Pence",
    minorSingular: "Penny",
    minorPerMajor: 100,
    locale: "en-GB",
    defaultSystem: "international",
  },
  AED: {
    code: "AED",
    label: "UAE Dirham (د.إ)",
    major: "Dirhams",
    majorSingular: "Dirham",
    minor: "Fils",
    minorSingular: "Fils",
    minorPerMajor: 100,
    locale: "en-AE",
    defaultSystem: "international",
  },
  AUD: {
    code: "AUD",
    label: "Australian Dollar (A$)",
    major: "Dollars",
    majorSingular: "Dollar",
    minor: "Cents",
    minorSingular: "Cent",
    minorPerMajor: 100,
    locale: "en-AU",
    defaultSystem: "international",
  },
  CAD: {
    code: "CAD",
    label: "Canadian Dollar (C$)",
    major: "Dollars",
    majorSingular: "Dollar",
    minor: "Cents",
    minorSingular: "Cent",
    minorPerMajor: 100,
    locale: "en-CA",
    defaultSystem: "international",
  },
  JPY: {
    code: "JPY",
    label: "Japanese Yen (¥)",
    major: "Yen",
    majorSingular: "Yen",
    minor: "",
    minorSingular: "",
    // ISO 4217 gives the yen a minor-unit exponent of 0 — there is no sen in circulation.
    minorPerMajor: 1,
    locale: "ja-JP",
    defaultSystem: "international",
  },
};

export const NUMBERING_SYSTEMS = ["indian", "international"];
export const LETTER_CASES = ["title", "upper", "lower", "sentence"];

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

/** Short-scale group names, largest first. */
const INTERNATIONAL_SCALES = [
  { value: 1e12, name: "Trillion" },
  { value: 1e9, name: "Billion" },
  { value: 1e6, name: "Million" },
  { value: 1e3, name: "Thousand" },
];

const CRORE = 10000000; // 10^7
const LAKH = 100000; // 10^5
const THOUSAND = 1000; // 10^3

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Words for 0-99. Hyphenates compound tens (Twenty-One) when asked. */
function twoDigitWords(n, hyphenate) {
  if (n < 20) return ONES[n];
  const tens = TENS[Math.floor(n / 10)];
  const ones = ONES[n % 10];
  if (!ones) return tens;
  return hyphenate ? `${tens}-${ones}` : `${tens} ${ones}`;
}

/** Words for 0-999, without the leading "and" that British usage puts before the tens. */
function threeDigitWords(n, hyphenate, useAnd) {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  if (hundreds === 0) return twoDigitWords(rest, hyphenate);
  const head = `${ONES[hundreds]} Hundred`;
  if (rest === 0) return head;
  return `${head}${useAnd ? " and" : ""} ${twoDigitWords(rest, hyphenate)}`;
}

/**
 * Spell a non-negative whole number.
 *
 * @param {number} n
 * @param {object} [options]
 * @param {"indian"|"international"} [options.system]
 * @param {boolean} [options.hyphenate] Twenty-One instead of Twenty One.
 * @param {boolean} [options.useAnd] British "One Thousand and Five".
 * @returns {string} "" for zero, so callers choose how to say nothing.
 */
export function integerToWords(n, { system = "indian", hyphenate = false, useAnd = false } = {}) {
  if (!isNum(n) || n < 0) return "";
  const value = Math.floor(n);
  if (value === 0) return "";

  const parts = [];
  let remaining = value;

  if (system === "indian") {
    const crore = Math.floor(remaining / CRORE);
    if (crore > 0) {
      // The count of crores is itself read in the Indian system, so 1234 crore works.
      parts.push(`${integerToWords(crore, { system, hyphenate, useAnd })} Crore`);
      remaining %= CRORE;
    }
    const lakh = Math.floor(remaining / LAKH);
    if (lakh > 0) {
      parts.push(`${twoDigitWords(lakh, hyphenate)} Lakh`);
      remaining %= LAKH;
    }
    const thousand = Math.floor(remaining / THOUSAND);
    if (thousand > 0) {
      parts.push(`${twoDigitWords(thousand, hyphenate)} Thousand`);
      remaining %= THOUSAND;
    }
  } else {
    for (const scale of INTERNATIONAL_SCALES) {
      const count = Math.floor(remaining / scale.value);
      if (count > 0) {
        parts.push(`${integerToWords(count, { system, hyphenate, useAnd })} ${scale.name}`);
        remaining %= scale.value;
      }
    }
  }

  if (remaining > 0) {
    const tail = threeDigitWords(remaining, hyphenate, useAnd);
    // British usage: "One Thousand and Five" when the tail is under a hundred.
    parts.push(useAnd && parts.length > 0 && remaining < 100 ? `and ${tail}` : tail);
  }

  return parts.join(" ");
}

/** Apply the requested letter casing to a finished phrase. */
export function applyCase(text, mode = "title") {
  if (typeof text !== "string") return "";
  if (mode === "upper") return text.toUpperCase();
  if (mode === "lower") return text.toLowerCase();
  if (mode === "sentence") {
    const lower = text.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }
  return text;
}

/**
 * Convert a money amount into the wordings used on cheques, invoices and agreements.
 *
 * @param {object} input
 * @param {number} input.amount            Amount in major units (decimals are minor units).
 * @param {string} [input.currency]        A key of CURRENCIES.
 * @param {"indian"|"international"} [input.system]
 * @param {"title"|"upper"|"lower"|"sentence"} [input.letterCase]
 * @param {boolean} [input.includeOnly]    Close the cheque line with "Only".
 * @param {boolean} [input.minorAsFraction] Write the minor part as 75/100.
 * @param {boolean} [input.hyphenate]
 * @param {boolean} [input.useAnd]
 * @returns {object} the renderings, or { error }.
 */
export function amountToWords({
  amount,
  currency = "INR",
  system,
  letterCase = "title",
  includeOnly = true,
  minorAsFraction = false,
  hyphenate = false,
  useAnd = false,
} = {}) {
  const money = CURRENCIES[currency];
  if (!money) return { error: "Choose one of the supported currencies." };
  if (!isNum(amount)) return { error: "Enter the amount as a number." };
  if (amount < 0) return { error: "An amount in words cannot be negative — enter zero or more." };
  if (amount > MAX_AMOUNT) {
    return { error: "That amount is too large to spell out — enter up to 15 digits." };
  }
  if (!LETTER_CASES.includes(letterCase)) return { error: "Choose a valid letter case." };

  const numbering = NUMBERING_SYSTEMS.includes(system) ? system : money.defaultSystem;
  const opts = { system: numbering, hyphenate, useAnd };

  // Work in whole minor units so binary float error can never leak into the words.
  const scale = money.minorPerMajor;
  const totalMinor = Math.round(amount * scale);
  const majorValue = Math.floor(totalMinor / scale);
  const minorValue = totalMinor % scale;

  const majorWords = majorValue === 0 ? "Zero" : integerToWords(majorValue, opts);
  const minorWords = minorValue === 0 ? "" : twoDigitWords(minorValue, hyphenate);
  const majorNoun = majorValue === 1 ? money.majorSingular : money.major;
  const minorNoun = minorValue === 1 ? money.minorSingular : money.minor;
  const hasMinor = minorValue > 0 && scale > 1;

  // Cheque courtesy line: currency name first, minor part stated separately, "Only" at the end.
  const chequeParts = [`${money.major} ${majorWords}`];
  if (hasMinor) {
    chequeParts.push(minorAsFraction ? `and ${minorValue}/${scale}` : `and ${minorNoun} ${minorWords}`);
  }
  if (includeOnly) chequeParts.push("Only");

  // Invoice line: number first, then the currency noun.
  const invoiceParts = [`${majorWords} ${majorNoun}`];
  if (hasMinor) invoiceParts.push(`and ${minorWords} ${minorNoun}`);
  if (includeOnly) invoiceParts.push("Only");

  const decimals = scale > 1 ? 2 : 0;
  const plainNumber = new Intl.NumberFormat(money.locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(totalMinor / scale);
  const currencyNumber = new Intl.NumberFormat(money.locale, {
    style: "currency",
    currency: money.code,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(totalMinor / scale);

  const cheque = applyCase(chequeParts.join(" "), letterCase);
  const invoice = applyCase(invoiceParts.join(" "), letterCase);
  const wordsOnly = applyCase(majorWords, letterCase);
  // Contract style keeps the figures next to the words so the two can be checked against each other.
  const legal = `${currencyNumber} (${applyCase(
    hasMinor
      ? `${money.major} ${majorWords} and ${minorNoun} ${minorWords} only`
      : `${money.major} ${majorWords} only`,
    letterCase,
  )})`;

  return {
    currency: money.code,
    numbering,
    majorValue,
    minorValue,
    hasMinor,
    chequeLine: cheque,
    invoiceLine: invoice,
    legalLine: legal,
    wordsOnly,
    minorWordsOnly: applyCase(minorWords, letterCase),
    formattedNumber: plainNumber,
    formattedCurrency: currencyNumber,
  };
}
