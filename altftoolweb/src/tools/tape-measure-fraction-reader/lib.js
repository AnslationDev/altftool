/**
 * Tape measure fraction reader.
 *
 * An imperial tape is divided by repeated halving: 1/2, 1/4, 1/8, 1/16 and, on finer
 * engineer's tapes, 1/32 and 1/64. Every mark is therefore a fraction with a power-of-two
 * denominator, which is why a reading like "5 3/8" is exact and a metric reading almost
 * never lands on one.
 *
 * The inch is defined as exactly 25.4 mm by the 1959 international yard and pound
 * agreement, and 1 foot is exactly 12 inches. Both are exact by definition, so every
 * conversion here is a definition, not an approximation.
 */

/** Exact by definition (international inch, 1959). */
export const MM_PER_INCH = 25.4;
export const INCHES_PER_FOOT = 12;

/** Mark densities found on real tapes, coarsest first. */
export const TAPE_DENOMINATORS = [2, 4, 8, 16, 32, 64];

/** Reject absurd input rather than returning a meaningless number. */
export const MAX_INCHES = 4000; // just over 100 m of tape

const isFiniteNumber = (v) => typeof v === "number" && Number.isFinite(v);

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

/**
 * Parse a tape reading written the way a person writes it.
 * Accepts: 3/8 | 5 3/8 | 5-3/8 | 5.375 | 5 3/8" | 6' 2 1/2" | 6ft 2in
 * @returns {{error:string}|{inches:number}}
 */
export function parseTapeReading(raw) {
  if (typeof raw !== "string") return { error: "Type a reading such as 5 3/8." };
  let text = raw.trim().toLowerCase();
  if (text === "") return { error: "Type a reading such as 5 3/8." };
  if (text.startsWith("-")) return { error: "A length cannot be negative." };

  // Normalise the many ways people write feet and inches.
  text = text
    .replace(/[′’]/g, "'")
    .replace(/[″”]/g, '"')
    .replace(/\bfeet\b|\bfoot\b|\bft\b/g, "'")
    .replace(/\binches\b|\binch\b|\bin\b/g, '"')
    .replace(/[–—]/g, "-");

  let feet = 0;
  const footSplit = text.split("'");
  if (footSplit.length > 2) return { error: "Use one foot mark, as in 6' 2 1/2\"." };
  if (footSplit.length === 2) {
    const feetText = footSplit[0].trim();
    if (!/^\d+(\.\d+)?$/.test(feetText)) return { error: "The feet part must be a plain number, as in 6' 2 1/2\"." };
    feet = Number(feetText);
    text = footSplit[1];
  }

  text = text.replace(/"/g, "").replace(/-/g, " ").trim();

  let inches = 0;
  if (text !== "") {
    const parts = text.split(/\s+/);
    if (parts.length > 2) return { error: 'Write inches as a whole number and one fraction, as in 5 3/8".' };
    for (const part of parts) {
      if (part.includes("/")) {
        const [numText, denText] = part.split("/");
        if (!/^\d+$/.test(numText) || !/^\d+$/.test(denText)) {
          return { error: "A fraction needs whole numbers on both sides, as in 3/8." };
        }
        const den = Number(denText);
        if (den === 0) return { error: "A fraction cannot have zero on the bottom." };
        inches += Number(numText) / den;
      } else {
        if (!/^\d+(\.\d+)?$/.test(part)) return { error: `"${part}" is not a number or a fraction.` };
        inches += Number(part);
      }
    }
  }

  const total = feet * INCHES_PER_FOOT + inches;
  if (!isFiniteNumber(total)) return { error: "That reading could not be read as a length." };
  if (total <= 0) return { error: "The reading must be greater than zero." };
  if (total > MAX_INCHES) return { error: "That is longer than any tape measure - keep it under 4000 inches." };
  return { inches: total };
}

/**
 * Snap a decimal inch value to the nearest mark at the given denominator and reduce it.
 * @returns {{error:string}|{whole:number,numerator:number,denominator:number,text:string,value:number,deviationInches:number,deviationMm:number}}
 */
export function toFraction(inches, denominator) {
  if (!isFiniteNumber(inches) || inches < 0) return { error: "Length must be zero or more." };
  if (!Number.isInteger(denominator) || denominator < 2) {
    return { error: "Denominator must be a whole number of 2 or more." };
  }

  const ticks = Math.round(inches * denominator);
  let whole = Math.floor(ticks / denominator);
  let numerator = ticks - whole * denominator;
  let den = denominator;

  if (numerator > 0) {
    const divisor = gcd(numerator, den);
    numerator /= divisor;
    den /= divisor;
  }

  const value = whole + (numerator > 0 ? numerator / den : 0);
  let text;
  if (numerator === 0) text = `${whole}`;
  else if (whole === 0) text = `${numerator}/${den}`;
  else text = `${whole} ${numerator}/${den}`;

  return {
    whole,
    numerator,
    denominator: numerator > 0 ? den : 1,
    text: `${text}"`,
    value,
    deviationInches: value - inches,
    deviationMm: (value - inches) * MM_PER_INCH,
  };
}

/** Format a decimal inch value as feet, inches and a fraction, e.g. 6' 2 1/2". */
export function toFeetInches(inches, denominator) {
  if (!isFiniteNumber(inches) || inches < 0) return { error: "Length must be zero or more." };
  const snapped = toFraction(inches, denominator);
  if (snapped.error) return snapped;
  const feet = Math.floor(snapped.value / INCHES_PER_FOOT);
  const remainder = snapped.value - feet * INCHES_PER_FOOT;
  const remainderText = toFraction(remainder, denominator);
  if (remainderText.error) return remainderText;
  return {
    feet,
    inchesPart: remainder,
    text: feet > 0 ? `${feet}' ${remainderText.text}` : remainderText.text,
  };
}

/**
 * Convert one reading into every other form.
 * @param {object} input
 * @param {string|number} input.value  the reading; a string when mode is "tape"
 * @param {"tape"|"mm"|"cm"|"in"} input.mode
 * @param {number} input.denominator   tape precision used for the fraction output
 */
export function convertReading({ value, mode, denominator = 16 }) {
  if (!TAPE_DENOMINATORS.includes(denominator)) {
    return { error: "Pick a tape precision of 1/2, 1/4, 1/8, 1/16, 1/32 or 1/64." };
  }

  let inches;
  if (mode === "tape") {
    const parsed = parseTapeReading(value);
    if (parsed.error) return parsed;
    inches = parsed.inches;
  } else {
    const num = typeof value === "number" ? value : Number(String(value).trim());
    if (String(value).trim() === "" || !isFiniteNumber(num)) return { error: "Enter a number." };
    if (num <= 0) return { error: "Length must be greater than zero." };
    if (mode === "mm") inches = num / MM_PER_INCH;
    else if (mode === "cm") inches = (num * 10) / MM_PER_INCH;
    else if (mode === "in") inches = num;
    else return { error: "Unknown input unit." };
    if (inches > MAX_INCHES) return { error: "That is longer than any tape measure - keep it under 100 m." };
  }

  const fraction = toFraction(inches, denominator);
  if (fraction.error) return fraction;
  const feetInches = toFeetInches(inches, denominator);
  if (feetInches.error) return feetInches;

  const ladder = TAPE_DENOMINATORS.map((den) => {
    const snapped = toFraction(inches, den);
    return {
      denominator: den,
      text: snapped.text,
      deviationMm: snapped.deviationMm,
      exact: Math.abs(snapped.deviationInches) < 1e-9,
    };
  });

  return {
    inches,
    mm: inches * MM_PER_INCH,
    cm: (inches * MM_PER_INCH) / 10,
    metres: (inches * MM_PER_INCH) / 1000,
    feet: inches / INCHES_PER_FOOT,
    fraction,
    feetInches,
    ladder,
    isExactAtPrecision: Math.abs(fraction.deviationInches) < 1e-9,
  };
}

/**
 * Every sixteenth-inch mark on a standard tape, with its decimal and metric value.
 * Built from the same conversion used everywhere else so the table can never drift.
 */
export const SIXTEENTHS_TABLE = Array.from({ length: 16 }, (_, index) => {
  const inches = (index + 1) / 16;
  const snapped = toFraction(inches, 16);
  return { fraction: snapped.text, inches, mm: inches * MM_PER_INCH };
});
