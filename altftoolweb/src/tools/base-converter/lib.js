/**
 * Positional number-base conversion, bases 2 to 36, with exact fractions.
 *
 * A number written in base b is the sum of digit_i × b^i. Converting the
 * integer part is repeated division by the target base, taking remainders from
 * least to most significant. Converting the fraction is repeated multiplication
 * by the target base, taking the integer part off the top each round.
 *
 * Both are done here in BigInt, not floating point, so nothing is lost:
 *  - the integer part is an exact BigInt of any length;
 *  - the fraction is kept as an exact rational numerator/denominator, where
 *    the denominator is sourceBase^(number of fraction digits).
 *
 * That matters because a fraction that terminates in one base usually does not
 * terminate in another — 0.1 decimal is 0.0001100110011… in binary forever —
 * and a Number-based converter silently rounds it at 17 significant digits.
 *
 * The alphabet is 0-9 then A-Z, giving 36 digits, which is why 36 is the
 * ceiling (the same limit as JavaScript's own Number.prototype.toString).
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Digit alphabet, index = digit value. */
export const DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Smallest and largest positional base this alphabet can express. */
export const MIN_BASE = 2;
export const MAX_BASE = 36;

/** Bases shown side by side in the results panel. */
export const COMMON_BASES = [
  { base: 2, label: "Binary", prefix: "0b" },
  { base: 8, label: "Octal", prefix: "0o" },
  { base: 10, label: "Decimal", prefix: "" },
  { base: 16, label: "Hexadecimal", prefix: "0x" },
  { base: 36, label: "Base 36", prefix: "" },
];

/** Default number of fraction digits to emit before giving up on a
 * non-terminating expansion. */
export const DEFAULT_FRACTION_DIGITS = 20;
export const MAX_FRACTION_DIGITS = 200;

/** Longest input accepted. 4096 digits is far past any practical need and
 * keeps the BigInt work instant. */
export const MAX_INPUT_LENGTH = 4096;

/** Fixed-width integer types checked in the "fits in" report. */
export const INTEGER_WIDTHS = [8, 16, 32, 64, 128];

const isBase = (base) =>
  typeof base === "number" && Number.isInteger(base) && base >= MIN_BASE && base <= MAX_BASE;

/** Prefixes stripped when they match the chosen base. */
const BASE_PREFIXES = { 2: "0B", 8: "0O", 16: "0X" };

/**
 * Parse a number written in `base` into an exact sign / integer / fraction triple.
 *
 * @param {string} text
 * @param {number} base 2-36
 * @returns {{ negative:boolean, intValue:bigint, fracNum:bigint, fracDen:bigint,
 *             fractionDigits:number } | { error:string }}
 */
export function parseInBase(text, base) {
  if (!isBase(base)) {
    return { error: `Base must be a whole number from ${MIN_BASE} to ${MAX_BASE}.` };
  }
  const raw = String(text ?? "").trim();
  if (!raw) return { error: "Enter a number to convert." };
  if (raw.length > MAX_INPUT_LENGTH) {
    return { error: `That is longer than ${MAX_INPUT_LENGTH} characters — trim it down.` };
  }

  // Separators people actually type: spaces, underscores, commas, apostrophes.
  let body = raw.replace(/[\s_,']/g, "").toUpperCase();

  let negative = false;
  if (body.startsWith("-")) {
    negative = true;
    body = body.slice(1);
  } else if (body.startsWith("+")) {
    body = body.slice(1);
  }

  const prefix = BASE_PREFIXES[base];
  if (prefix && body.startsWith(prefix)) body = body.slice(prefix.length);

  if (!body) return { error: "Enter a number to convert." };
  if ((body.match(/\./g) || []).length > 1) {
    return { error: "There is more than one decimal point in that number." };
  }

  const [intPart = "", fracPart = ""] = body.split(".");
  if (!intPart && !fracPart) return { error: "Enter a number to convert." };

  const bigBase = BigInt(base);
  const readDigits = (part) => {
    let value = 0n;
    for (const character of part) {
      const digit = DIGITS.indexOf(character);
      if (digit < 0 || digit >= base) {
        return {
          error: `"${character}" is not a valid digit in base ${base}. Base ${base} uses ${describeAlphabet(base)}.`,
        };
      }
      value = value * bigBase + BigInt(digit);
    }
    return { value };
  };

  const intRead = readDigits(intPart);
  if (intRead.error) return { error: intRead.error };
  const fracRead = readDigits(fracPart);
  if (fracRead.error) return { error: fracRead.error };

  return {
    negative,
    intValue: intRead.value,
    fracNum: fracRead.value,
    fracDen: bigBase ** BigInt(fracPart.length),
    fractionDigits: fracPart.length,
  };
}

/** Human description of a base's digit set, for error messages. */
export function describeAlphabet(base) {
  if (!isBase(base)) return "";
  if (base <= 10) return `the digits 0-${base - 1}`;
  return `the digits 0-9 and the letters A-${DIGITS[base - 1]}`;
}

/**
 * Render an exact parsed value in a target base.
 *
 * @param {object} value result of parseInBase
 * @param {number} base target base
 * @param {number} [fractionDigits] maximum fraction digits to emit
 * @returns {{ text:string, truncated:boolean, exact:boolean } | { error:string }}
 */
export function toBase(value, base, fractionDigits = DEFAULT_FRACTION_DIGITS) {
  if (!value || typeof value.intValue !== "bigint") {
    return { error: "There is no parsed number to render." };
  }
  if (!isBase(base)) {
    return { error: `Base must be a whole number from ${MIN_BASE} to ${MAX_BASE}.` };
  }
  const limit = Math.max(0, Math.min(MAX_FRACTION_DIGITS, Math.floor(fractionDigits)));
  const bigBase = BigInt(base);

  let intText = "";
  let remaining = value.intValue;
  if (remaining === 0n) {
    intText = "0";
  } else {
    while (remaining > 0n) {
      intText = DIGITS[Number(remaining % bigBase)] + intText;
      remaining /= bigBase;
    }
  }

  let fracText = "";
  let numerator = value.fracNum;
  const denominator = value.fracDen;
  let emitted = 0;
  // Two different things can stop fraction-digit generation, and the UI needs
  // to tell them apart: the expansion may genuinely never terminate in this
  // base (recurring), or it may simply need more digits than the current cap
  // allows even though it does terminate (truncated). We detect "genuinely
  // recurring" by watching for a remainder that has already appeared — once a
  // remainder repeats, the digit sequence from that point on is guaranteed to
  // repeat too, which is the standard long-division proof of periodicity.
  const seenRemainders = new Map();
  let recurring = false;
  let truncated = false;
  while (numerator > 0n) {
    if (emitted >= limit) {
      truncated = true;
      break;
    }
    const remainderKey = numerator.toString();
    if (seenRemainders.has(remainderKey)) {
      recurring = true;
      break;
    }
    seenRemainders.set(remainderKey, emitted);
    numerator *= bigBase;
    const digit = numerator / denominator;
    fracText += DIGITS[Number(digit)];
    numerator -= digit * denominator;
    emitted += 1;
  }

  const exact = numerator === 0n;
  const sign = value.negative && (value.intValue > 0n || value.fracNum > 0n) ? "-" : "";
  return {
    text: `${sign}${intText}${fracText ? `.${fracText}` : ""}`,
    // `truncated` now means specifically "display was cut off by the digit
    // cap, with no proof either way of termination" — not "not exact".
    truncated,
    // `recurring` means the expansion is genuinely, provably non-terminating
    // in this base (a repeating remainder was observed).
    recurring,
    exact,
  };
}

/**
 * Bit-width facts about the integer part.
 *
 * @param {bigint} intValue
 * @returns {{ bitLength:number, byteLength:number, fits:Array<{width:number,signed:boolean,ok:boolean}> }}
 */
export function integerFacts(intValue, negative = false) {
  if (typeof intValue !== "bigint") return { bitLength: 0, byteLength: 0, fits: [] };
  const magnitude = intValue < 0n ? -intValue : intValue;
  const bitLength = magnitude === 0n ? 0 : magnitude.toString(2).length;
  const byteLength = Math.ceil(bitLength / 8);

  const fits = [];
  for (const width of INTEGER_WIDTHS) {
    const unsignedMax = (1n << BigInt(width)) - 1n;
    const signedMax = (1n << BigInt(width - 1)) - 1n;
    const signedMin = -(1n << BigInt(width - 1));
    const signedValue = negative ? -magnitude : magnitude;
    fits.push({
      width,
      unsigned: !negative && magnitude <= unsignedMax,
      signed: signedValue >= signedMin && signedValue <= signedMax,
    });
  }
  return { bitLength, byteLength, fits };
}

/**
 * Group a digit string for readability: 4 digits for binary, 2 for hex, 3 for
 * everything else — the conventions used in specs and hex dumps.
 *
 * @param {string} text digits only (no sign, no point)
 * @param {number} base
 * @returns {string}
 */
export function groupDigits(text, base) {
  const size = base === 2 ? 4 : base === 16 ? 2 : 3;
  const source = String(text ?? "");
  const negative = source.startsWith("-");
  const body = negative ? source.slice(1) : source;
  const [intPart = "", fracPart = ""] = body.split(".");
  const grouped = intPart.replace(new RegExp(`\\B(?=(.{${size}})+$)`, "g"), " ");
  const fracGrouped = fracPart
    ? `.${fracPart.replace(new RegExp(`(.{${size}})`, "g"), "$1 ").trim()}`
    : "";
  return `${negative ? "-" : ""}${grouped}${fracGrouped}`;
}

/**
 * Convert one number into every base at once.
 *
 * @param {object} input
 * @param {string} input.text the number as typed
 * @param {number} input.fromBase base it is written in
 * @param {number[]} [input.targetBases] bases to render (defaults to COMMON_BASES)
 * @param {number} [input.fractionDigits]
 * @returns {object} conversions, or { error: string }
 */
export function convertAll({
  text,
  fromBase,
  targetBases,
  fractionDigits = DEFAULT_FRACTION_DIGITS,
} = {}) {
  const parsed = parseInBase(text, fromBase);
  if (parsed.error) return { error: parsed.error };

  const bases = Array.isArray(targetBases) && targetBases.length > 0
    ? targetBases
    : COMMON_BASES.map((entry) => entry.base);

  const results = [];
  for (const base of bases) {
    const rendered = toBase(parsed, base, fractionDigits);
    if (rendered.error) return { error: rendered.error };
    const meta = COMMON_BASES.find((entry) => entry.base === base);
    results.push({
      base,
      label: meta ? meta.label : `Base ${base}`,
      prefix: meta ? meta.prefix : "",
      text: rendered.text,
      grouped: groupDigits(rendered.text, base),
      truncated: rendered.truncated,
      recurring: rendered.recurring,
      exact: rendered.exact,
    });
  }

  const facts = integerFacts(parsed.intValue, parsed.negative);
  const decimal = toBase(parsed, 10, fractionDigits);

  return {
    parsed,
    results,
    decimalText: decimal.error ? null : decimal.text,
    hasFraction: parsed.fracNum > 0n,
    fractionExactIn: results.filter((row) => row.exact).map((row) => row.base),
    ...facts,
  };
}
