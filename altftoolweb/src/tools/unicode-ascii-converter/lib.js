/**
 * Unicode / ASCII converter.
 *
 * Escapes text into the common code-point notations and parses them back.
 * All ranges below come from the Unicode Standard and ANSI X3.4-1986 (ASCII).
 */

/** ASCII printable range, ANSI X3.4-1986: space (0x20) through tilde (0x7E). */
export const ASCII_PRINTABLE_MIN = 0x20;
export const ASCII_PRINTABLE_MAX = 0x7e;

/** Highest code point in the Basic Multilingual Plane. */
export const BMP_MAX = 0xffff;

/** Highest valid Unicode code point (Unicode Standard, §3.4 D9). */
export const UNICODE_MAX = 0x10ffff;
export const UNICODE_MAX_LABEL = "U+10FFFF";

/** UTF-16 surrogate range — never a valid standalone code point. */
export const SURROGATE_MIN = 0xd800;
export const SURROGATE_MAX = 0xdfff;

/** Guard so a pasted document cannot lock the tab up. */
export const MAX_INPUT_CHARS = 100000;

export const OUTPUT_FORMATS = [
  { id: "js", label: "JavaScript \\uXXXX (UTF-16 units)" },
  { id: "jsCodePoint", label: "ES2015 \\u{XXXX} (code points)" },
  { id: "unicode", label: "U+XXXX notation" },
  { id: "decimal", label: "Decimal code points" },
  { id: "htmlDec", label: "HTML entity &#NNN;" },
  { id: "htmlHex", label: "HTML entity &#xHH;" },
];

export const ESCAPE_MODES = [
  { id: "nonAscii", label: "Only non-ASCII characters" },
  { id: "all", label: "Every character" },
];

const FORMAT_IDS = new Set(OUTPUT_FORMATS.map((format) => format.id));

/** True for printable ASCII (space to tilde). */
export function isPrintableAscii(codePoint) {
  return codePoint >= ASCII_PRINTABLE_MIN && codePoint <= ASCII_PRINTABLE_MAX;
}

/** True for a valid, non-surrogate Unicode scalar value. */
export function isValidCodePoint(codePoint) {
  return (
    Number.isInteger(codePoint) &&
    codePoint >= 0 &&
    codePoint <= UNICODE_MAX &&
    !(codePoint >= SURROGATE_MIN && codePoint <= SURROGATE_MAX)
  );
}

function hex(value, minDigits) {
  return value.toString(16).toUpperCase().padStart(minDigits, "0");
}

/** Format one code point in the chosen notation. Astral chars become surrogate pairs for "js". */
export function formatCodePoint(codePoint, format) {
  switch (format) {
    case "js": {
      if (codePoint <= BMP_MAX) return `\\u${hex(codePoint, 4)}`;
      // UTF-16 surrogate pair, Unicode Standard §3.9 D91.
      const offset = codePoint - 0x10000;
      const high = SURROGATE_MIN + (offset >> 10);
      const low = 0xdc00 + (offset & 0x3ff);
      return `\\u${hex(high, 4)}\\u${hex(low, 4)}`;
    }
    case "jsCodePoint":
      return `\\u{${hex(codePoint, 4)}}`;
    case "unicode":
      return `U+${hex(codePoint, 4)}`;
    case "decimal":
      return String(codePoint);
    case "htmlDec":
      return `&#${codePoint};`;
    case "htmlHex":
      return `&#x${hex(codePoint, 2)};`;
    default:
      return `U+${hex(codePoint, 4)}`;
  }
}

/** Split a string into Unicode code points (astral characters stay whole). */
export function toCodePoints(text) {
  return Array.from(text, (character) => character.codePointAt(0));
}

/** Counts that describe a piece of text. */
export function analyseText(text) {
  const points = toCodePoints(text);
  const nonAscii = points.filter((point) => !isPrintableAscii(point)).length;
  const astral = points.filter((point) => point > BMP_MAX).length;
  return {
    utf16Units: text.length,
    codePoints: points.length,
    nonAscii,
    astral,
    utf8Bytes: new TextEncoder().encode(text).length,
    maxCodePoint: points.length ? Math.max(...points) : 0,
  };
}

/**
 * Escape text into a code-point notation.
 * @param {{text:string, format:string, mode:string, separator:string}} input
 * @returns {{output:string, stats:object, escapedCount:number}|{error:string}}
 */
export function encodeText({ text = "", format = "unicode", mode = "nonAscii", separator = "" } = {}) {
  if (typeof text !== "string") return { error: "Input must be text." };
  if (text.length === 0) return { error: "Enter some text to convert." };
  if (text.length > MAX_INPUT_CHARS) {
    return {
      error: `Input is ${text.length.toLocaleString()} characters. The limit is ${MAX_INPUT_CHARS.toLocaleString()}.`,
    };
  }
  if (!FORMAT_IDS.has(format)) return { error: `"${format}" is not a supported output format.` };

  // Decimal and U+ notation are lists, so they always need a separator to be readable.
  const glue = format === "decimal" || format === "unicode" ? separator || " " : separator;

  const parts = [];
  let escapedCount = 0;
  for (const codePoint of toCodePoints(text)) {
    const keepAsIs = mode === "nonAscii" && isPrintableAscii(codePoint) && format !== "decimal" && format !== "unicode";
    if (keepAsIs) {
      parts.push(String.fromCodePoint(codePoint));
    } else {
      parts.push(formatCodePoint(codePoint, format));
      escapedCount += 1;
    }
  }

  return {
    output: parts.join(glue),
    escapedCount,
    stats: analyseText(text),
  };
}

const ESCAPE_PATTERN =
  /\\u\{([0-9a-fA-F]{1,6})\}|\\u([0-9a-fA-F]{4})|\\x([0-9a-fA-F]{2})|U\+([0-9a-fA-F]{4,6})|&#x([0-9a-fA-F]{1,6});|&#(\d{1,7});/g;

/** A string that is nothing but decimal numbers and separators. */
const DECIMAL_LIST_PATTERN = /^\s*\d{1,7}(?:[\s,;]+\d{1,7})*\s*$/;

/**
 * Parse escapes back to text. Accepts \\uXXXX, \\u{XXXX}, \\xHH, U+XXXX,
 * &#NNN;, &#xHH; and a plain list of decimal code points.
 * @returns {{output:string, decodedCount:number, stats:object}|{error:string}}
 */
export function decodeText({ value = "" } = {}) {
  if (typeof value !== "string") return { error: "Input must be text." };
  if (value.trim().length === 0) return { error: "Enter escapes or code points to decode." };
  if (value.length > MAX_INPUT_CHARS) {
    return {
      error: `Input is ${value.length.toLocaleString()} characters. The limit is ${MAX_INPUT_CHARS.toLocaleString()}.`,
    };
  }

  if (DECIMAL_LIST_PATTERN.test(value)) {
    const numbers = value.trim().split(/[\s,;]+/).map(Number);
    const out = [];
    for (const codePoint of numbers) {
      if (!isValidCodePoint(codePoint)) {
        return { error: `${codePoint} is not a valid Unicode code point (0 to 1114111, no surrogates).` };
      }
      out.push(String.fromCodePoint(codePoint));
    }
    const output = out.join("");
    return { output, decodedCount: numbers.length, stats: analyseText(output) };
  }

  let decodedCount = 0;
  let invalid = null;

  const output = value.replace(
    ESCAPE_PATTERN,
    (match, braceHex, jsHex, byteHex, uPlus, htmlHex, htmlDec) => {
      const raw = braceHex ?? jsHex ?? byteHex ?? uPlus ?? htmlHex;
      const codePoint = raw !== undefined ? parseInt(raw, 16) : parseInt(htmlDec, 10);

      // A surrogate half written as \uD83D is legal in JavaScript source, so keep
      // the raw UTF-16 unit and let it re-pair with its partner in the output.
      if (jsHex !== undefined && codePoint >= SURROGATE_MIN && codePoint <= SURROGATE_MAX) {
        decodedCount += 1;
        return String.fromCharCode(codePoint);
      }
      if (!isValidCodePoint(codePoint)) {
        invalid = match;
        return match;
      }
      decodedCount += 1;
      return String.fromCodePoint(codePoint);
    }
  );

  if (invalid) {
    return { error: `"${invalid}" is outside the valid Unicode range (U+0000 to U+10FFFF).` };
  }
  if (decodedCount === 0) {
    return { error: "No escapes found. Expected \\uXXXX, \\u{XXXX}, U+XXXX, &#NNN; or decimal code points." };
  }
  // A lone surrogate that never found its partner is not decodable text.
  if (/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(output)) {
    return { error: "The input contains an unpaired surrogate escape, which is not valid text." };
  }

  return { output, decodedCount, stats: analyseText(output) };
}
