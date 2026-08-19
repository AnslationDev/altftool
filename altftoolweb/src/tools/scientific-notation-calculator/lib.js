/**
 * Scientific Notation Calculator.
 *
 * Rules implemented:
 *
 *  - Scientific (standard) form: a x 10^n where 1 <= |a| < 10 and n is an
 *    integer. Zero is written 0 x 10^0 because log10(0) is undefined.
 *  - Engineering notation: same value, but n is constrained to a multiple of 3
 *    so the exponent lines up with an SI prefix (BIPM SI Brochure, 9th ed.,
 *    extended by CGPM 2022 which added ronna/quetta and ronto/quecto).
 *  - Significant figures: all non-zero digits count; zeros between significant
 *    digits count; leading zeros never count; trailing zeros count only when a
 *    decimal point is written.
 *  - Multiplication and division: the result carries the SMALLEST number of
 *    significant figures of the operands.
 *  - Addition and subtraction: the result is rounded to the COARSEST
 *    last-significant decimal place of the operands.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** IEEE-754 doubles carry about 17 significant decimal digits. */
export const MAX_SIG_FIGS = 17;
export const MIN_SIG_FIGS = 1;

/** Largest and smallest magnitudes a double can represent. */
const MAX_SAFE_MAGNITUDE = Number.MAX_VALUE; // ~1.797e308

/**
 * SI prefixes by power of ten. 10^30 to 10^-30 per the SI Brochure and the
 * 2022 CGPM resolution that added ronna (R), quetta (Q), ronto (r), quecto (q).
 */
export const SI_PREFIXES = [
  { exponent: 30, symbol: "Q", name: "quetta" },
  { exponent: 27, symbol: "R", name: "ronna" },
  { exponent: 24, symbol: "Y", name: "yotta" },
  { exponent: 21, symbol: "Z", name: "zetta" },
  { exponent: 18, symbol: "E", name: "exa" },
  { exponent: 15, symbol: "P", name: "peta" },
  { exponent: 12, symbol: "T", name: "tera" },
  { exponent: 9, symbol: "G", name: "giga" },
  { exponent: 6, symbol: "M", name: "mega" },
  { exponent: 3, symbol: "k", name: "kilo" },
  { exponent: 0, symbol: "", name: "(none)" },
  { exponent: -3, symbol: "m", name: "milli" },
  { exponent: -6, symbol: "µ", name: "micro" },
  { exponent: -9, symbol: "n", name: "nano" },
  { exponent: -12, symbol: "p", name: "pico" },
  { exponent: -15, symbol: "f", name: "femto" },
  { exponent: -18, symbol: "a", name: "atto" },
  { exponent: -21, symbol: "z", name: "zepto" },
  { exponent: -24, symbol: "y", name: "yocto" },
  { exponent: -27, symbol: "r", name: "ronto" },
  { exponent: -30, symbol: "q", name: "quecto" },
];

export const OPERATIONS = [
  { id: "add", label: "Add (a + b)", symbol: "+" },
  { id: "subtract", label: "Subtract (a − b)", symbol: "−" },
  { id: "multiply", label: "Multiply (a × b)", symbol: "×" },
  { id: "divide", label: "Divide (a ÷ b)", symbol: "÷" },
];

/**
 * Parse a number written as plain decimal, E-notation, or "a x 10^n".
 * @param {string} text
 * @returns {{value: number, raw: string} | {error: string}}
 */
export function parseNumberInput(text) {
  if (typeof text !== "string") return { error: "Enter a number." };
  const raw = text.trim();
  if (raw === "") return { error: "Enter a number." };

  // Normalise "1.23 x 10^-4", "1.23 × 10^-4", "1.23*10^-4" into E-notation.
  const normalised = raw
    .replace(/\s+/g, "")
    .replace(/[×xX*·]10\^?/, "e")
    .replace(/−/g, "-") // unicode minus
    .replace(/E/g, "e");

  const value = Number(normalised);
  if (!Number.isFinite(value)) {
    return { error: `"${raw}" is not a number this calculator can read.` };
  }
  return { value, raw };
}

/**
 * Count significant figures in a written number, using the standard rules.
 * @param {string} text
 * @returns {number|null} null when the text is not a readable number
 */
export function countSignificantFigures(text) {
  const parsed = parseNumberInput(text);
  if (parsed.error) return null;

  let body = String(text).trim().replace(/\s+/g, "").replace(/−/g, "-");
  // Keep only the mantissa: the exponent never contributes significant figures.
  body = body.split(/[eE]|[×xX*·]10/)[0];
  body = body.replace(/^[+-]/, "");

  const hasDecimalPoint = body.includes(".");
  const digits = body.replace(".", "");
  if (!/[1-9]/.test(digits)) return 1; // the number is zero: one significant figure by convention

  const firstSignificant = digits.search(/[1-9]/);
  let trimmed = digits.slice(firstSignificant);
  if (!hasDecimalPoint) trimmed = trimmed.replace(/0+$/, ""); // trailing zeros are ambiguous without a point
  return Math.max(1, trimmed.length);
}

/**
 * Decimal place of the last significant digit (0 = units, -2 = hundredths).
 * Used by the addition/subtraction rounding rule.
 * @param {string} text
 * @returns {number|null}
 */
export function lastSignificantPlace(text) {
  const parsed = parseNumberInput(text);
  if (parsed.error) return null;
  const sig = countSignificantFigures(text);
  if (sig === null) return null;
  if (parsed.value === 0) return 0;
  const exponent = scientificExponent(parsed.value);
  return exponent - (sig - 1);
}

/** Base-10 exponent of a non-zero finite number, taken from its exponential form. */
export function scientificExponent(value) {
  if (!Number.isFinite(value) || value === 0) return 0;
  const [, exp] = Math.abs(value).toExponential().split("e");
  return Number(exp);
}

/**
 * Convert a number into scientific notation.
 * @param {number} value
 * @param {number} sigFigs - 1..17
 * @returns {{coefficient: number, coefficientText: string, exponent: number, text: string, plain: string} | {error: string}}
 */
export function toScientific(value, sigFigs = 6) {
  if (!Number.isFinite(value)) return { error: "Enter a finite number." };
  const digits = Math.trunc(Number(sigFigs));
  if (!Number.isFinite(digits) || digits < MIN_SIG_FIGS || digits > MAX_SIG_FIGS) {
    return { error: `Significant figures must be between ${MIN_SIG_FIGS} and ${MAX_SIG_FIGS}.` };
  }
  if (value === 0) {
    return {
      coefficient: 0,
      coefficientText: (0).toFixed(digits - 1),
      exponent: 0,
      text: `${(0).toFixed(digits - 1)} × 10^0`,
      plain: "0",
    };
  }

  const exponential = value.toExponential(digits - 1); // rounds and re-normalises carries
  const [mantissaText, expText] = exponential.split("e");
  const exponent = Number(expText);
  return {
    coefficient: Number(mantissaText),
    coefficientText: mantissaText,
    exponent,
    text: `${mantissaText} × 10^${exponent}`,
    plain: Number(exponential).toString(),
  };
}

/**
 * Convert a number into engineering notation (exponent a multiple of 3).
 * @param {number} value
 * @param {number} sigFigs
 * @returns {{coefficient: number, coefficientText: string, exponent: number, text: string, prefix: object|null} | {error: string}}
 */
export function toEngineering(value, sigFigs = 6) {
  const sci = toScientific(value, sigFigs);
  if (sci.error) return sci;
  if (value === 0) {
    return {
      coefficient: 0,
      coefficientText: "0",
      exponent: 0,
      text: "0 × 10^0",
      prefix: SI_PREFIXES.find((entry) => entry.exponent === 0) ?? null,
    };
  }

  const engExponent = Math.floor(sci.exponent / 3) * 3;
  const shift = sci.exponent - engExponent; // 0, 1 or 2
  const coefficient = sci.coefficient * 10 ** shift;
  const digits = Math.trunc(Number(sigFigs));
  const decimalPlaces = Math.max(digits - shift - 1, 0);
  const coefficientText = coefficient.toFixed(decimalPlaces);

  return {
    coefficient,
    coefficientText,
    exponent: engExponent,
    text: `${coefficientText} × 10^${engExponent}`,
    prefix: SI_PREFIXES.find((entry) => entry.exponent === engExponent) ?? null,
  };
}

/**
 * Expand a x 10^n back to an ordinary decimal number.
 * @param {number} coefficient
 * @param {number} exponent
 * @returns {{value: number, text: string} | {error: string}}
 */
export function fromScientific(coefficient, exponent) {
  const a = Number(coefficient);
  const n = Number(exponent);
  if (!Number.isFinite(a)) return { error: "The coefficient must be a finite number." };
  if (!Number.isInteger(n)) return { error: "The exponent must be a whole number." };
  if (n > 308 || n < -323) {
    return { error: "That exponent is outside the range a JavaScript number can hold (10^-323 to 10^308)." };
  }
  const value = Number(`${a}e${n}`);
  if (!Number.isFinite(value) || Math.abs(value) > MAX_SAFE_MAGNITUDE) {
    return { error: "The result is too large to represent." };
  }
  return { value, text: value.toString() };
}

/** Round a value to a given decimal place (0 = units, -2 = hundredths). */
function roundToPlace(value, place) {
  if (!Number.isFinite(value)) return Number.NaN;
  const factor = 10 ** -place;
  if (!Number.isFinite(factor) || factor === 0) return value;
  return Math.round(value * factor) / factor;
}

/**
 * Apply an arithmetic operation to two written numbers and report the result
 * with the correct significant figures.
 *
 * @param {{a: string, b: string, operation: string, displaySigFigs?: number}} input
 * @returns {object|{error: string}}
 */
export function calculate({ a, b, operation, displaySigFigs = 6 }) {
  const op = OPERATIONS.find((entry) => entry.id === operation);
  if (!op) return { error: "Choose add, subtract, multiply or divide." };

  const parsedA = parseNumberInput(a);
  if (parsedA.error) return { error: `First number: ${parsedA.error}` };
  const parsedB = parseNumberInput(b);
  if (parsedB.error) return { error: `Second number: ${parsedB.error}` };

  const x = parsedA.value;
  const y = parsedB.value;

  if (op.id === "divide" && y === 0) {
    return { error: "Division by zero is undefined — enter a non-zero second number." };
  }

  let exact;
  if (op.id === "add") exact = x + y;
  else if (op.id === "subtract") exact = x - y;
  else if (op.id === "multiply") exact = x * y;
  else exact = x / y;

  if (!Number.isFinite(exact)) {
    return { error: "The result overflows the range a JavaScript number can hold." };
  }

  const sigA = countSignificantFigures(a);
  const sigB = countSignificantFigures(b);

  let rounded = exact;
  let significantFigures;
  let rule;

  if (op.id === "multiply" || op.id === "divide") {
    significantFigures = Math.min(sigA ?? MAX_SIG_FIGS, sigB ?? MAX_SIG_FIGS);
    rule = `Multiplication and division keep the fewest significant figures of the operands: min(${sigA}, ${sigB}) = ${significantFigures}.`;
    rounded = exact === 0 ? 0 : Number(exact.toPrecision(Math.min(significantFigures, MAX_SIG_FIGS)));
  } else {
    const placeA = lastSignificantPlace(a);
    const placeB = lastSignificantPlace(b);
    const place = Math.max(placeA ?? 0, placeB ?? 0);
    rounded = roundToPlace(exact, place);
    rule = `Addition and subtraction round to the coarsest last significant place: 10^${place}.`;
    significantFigures =
      rounded === 0 ? 1 : Math.max(1, scientificExponent(rounded) - place + 1);
  }

  const display = Math.min(Math.max(significantFigures, MIN_SIG_FIGS), MAX_SIG_FIGS);
  const scientific = toScientific(rounded, display);
  const engineering = toEngineering(rounded, display);
  const scientificExact = toScientific(exact, Math.min(Math.max(Math.trunc(displaySigFigs), MIN_SIG_FIGS), MAX_SIG_FIGS));

  return {
    operation: op,
    a: x,
    b: y,
    exact,
    rounded,
    significantFigures,
    sigFiguresA: sigA,
    sigFiguresB: sigB,
    rule,
    scientific,
    engineering,
    scientificExact,
    decimal: rounded.toString(),
  };
}
