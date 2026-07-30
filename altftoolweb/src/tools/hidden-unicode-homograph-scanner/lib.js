/**
 * Hidden Unicode and homograph scanner.
 *
 * Walks pasted text one codepoint at a time and reports:
 *  - invisible and zero-width formatting characters
 *  - bidirectional controls, with the embedding/isolate balance that makes the
 *    Trojan Source attack (CVE-2021-42574) work
 *  - Unicode tag characters (U+E0000 block), which carry a hidden ASCII payload
 *    that is decoded back here
 *  - variation selectors, private-use codepoints and non-standard whitespace
 *  - the script of every letter, so a token mixing Latin with Cyrillic, Greek,
 *    Armenian or Cherokee is flagged (UTS #39 mixed-script detection)
 *  - a confusable skeleton: what the token would read as if every look-alike
 *    were replaced by the Latin letter it imitates
 *  - for anything shaped like a hostname, the IDNA Punycode (xn--) form,
 *    computed with the RFC 3492 Bootstring algorithm
 *
 * Everything is derived from the pasted text. There is no network lookup and no
 * clock read; the same input always produces the same output.
 */

/* ------------------------------------------------------------------ */
/* Codepoint catalogue                                                 */
/* ------------------------------------------------------------------ */

/** Risk bands used across the report. */
export const RISK_ORDER = ["high", "medium", "low"];

export const CATEGORY_LABELS = {
  invisible: "Invisible / zero-width",
  bidi: "Bidirectional control",
  tag: "Unicode tag character",
  variation: "Variation selector",
  space: "Non-standard whitespace",
  control: "Control character",
  pua: "Private use area",
  deprecated: "Deprecated format character",
  confusable: "Look-alike letter",
};

/**
 * Individually named codepoints. Every entry is a real Unicode character name.
 */
const NAMED_CODEPOINTS = {
  0x00ad: ["invisible", "SOFT HYPHEN", "high", "Renders as nothing unless the line wraps there. Splits a word for a filter while a reader sees it whole."],
  0x061c: ["bidi", "ARABIC LETTER MARK", "high", "Invisible strong right-to-left mark."],
  0x115f: ["invisible", "HANGUL CHOSEONG FILLER", "medium", "Occupies width but draws nothing."],
  0x1160: ["invisible", "HANGUL JUNGSEONG FILLER", "medium", "Occupies width but draws nothing."],
  0x17b4: ["invisible", "KHMER VOWEL INHERENT AQ", "medium", "Zero-width in most fonts."],
  0x17b5: ["invisible", "KHMER VOWEL INHERENT AA", "medium", "Zero-width in most fonts."],
  0x180e: ["invisible", "MONGOLIAN VOWEL SEPARATOR", "high", "Zero-width; was once treated as a space, which is why filters disagree about it."],
  0x200b: ["invisible", "ZERO WIDTH SPACE", "high", "The classic word-splitter: breaks a keyword without changing what is read."],
  0x200c: ["invisible", "ZERO WIDTH NON-JOINER", "high", "Legitimate in Persian and Indic text; used elsewhere to break up a match."],
  0x200d: ["invisible", "ZERO WIDTH JOINER", "high", "Joins emoji sequences legitimately; invisible padding anywhere else."],
  0x200e: ["bidi", "LEFT-TO-RIGHT MARK", "medium", "Invisible direction hint. Harmless alone, a component of reordering attacks in bulk."],
  0x200f: ["bidi", "RIGHT-TO-LEFT MARK", "medium", "Invisible direction hint."],
  0x2028: ["control", "LINE SEPARATOR", "high", "Terminates a line for JavaScript's parser but not for most line-based tooling."],
  0x2029: ["control", "PARAGRAPH SEPARATOR", "high", "Same split-brain behaviour as LINE SEPARATOR."],
  0x202a: ["bidi", "LEFT-TO-RIGHT EMBEDDING", "high", "Opens a direction embedding that must be closed by U+202C."],
  0x202b: ["bidi", "RIGHT-TO-LEFT EMBEDDING", "high", "Opens a direction embedding that must be closed by U+202C."],
  0x202c: ["bidi", "POP DIRECTIONAL FORMATTING", "medium", "Closes the most recent embedding or override."],
  0x202d: ["bidi", "LEFT-TO-RIGHT OVERRIDE", "high", "Forces every following character to display left-to-right regardless of its own direction."],
  0x202e: ["bidi", "RIGHT-TO-LEFT OVERRIDE", "high", "Reverses the display order of everything after it — the character behind \"exe.txt\" filenames that are really .exe."],
  0x2060: ["invisible", "WORD JOINER", "high", "Zero-width and non-breaking."],
  0x2061: ["invisible", "FUNCTION APPLICATION", "high", "Invisible mathematical operator with no place in prose."],
  0x2062: ["invisible", "INVISIBLE TIMES", "high", "Invisible mathematical operator with no place in prose."],
  0x2063: ["invisible", "INVISIBLE SEPARATOR", "high", "Invisible mathematical operator with no place in prose."],
  0x2064: ["invisible", "INVISIBLE PLUS", "high", "Invisible mathematical operator with no place in prose."],
  0x2066: ["bidi", "LEFT-TO-RIGHT ISOLATE", "high", "Opens an isolate that must be closed by U+2069."],
  0x2067: ["bidi", "RIGHT-TO-LEFT ISOLATE", "high", "Opens an isolate that must be closed by U+2069."],
  0x2068: ["bidi", "FIRST STRONG ISOLATE", "high", "Opens an isolate that must be closed by U+2069."],
  0x2069: ["bidi", "POP DIRECTIONAL ISOLATE", "medium", "Closes the most recent isolate."],
  0xfeff: ["invisible", "ZERO WIDTH NO-BREAK SPACE (BOM)", "high", "A byte-order mark stranded mid-text; breaks JSON parsers and shell scripts."],
  0xfffc: ["invisible", "OBJECT REPLACEMENT CHARACTER", "medium", "Placeholder left behind by a rich-text paste."],
  0xfffd: ["control", "REPLACEMENT CHARACTER", "low", "Evidence that an earlier decode already failed."],
};

/** Whitespace that is not a plain space, tab or newline. */
const SPACE_CODEPOINTS = {
  0x00a0: "NO-BREAK SPACE",
  0x2000: "EN QUAD",
  0x2001: "EM QUAD",
  0x2002: "EN SPACE",
  0x2003: "EM SPACE",
  0x2004: "THREE-PER-EM SPACE",
  0x2005: "FOUR-PER-EM SPACE",
  0x2006: "SIX-PER-EM SPACE",
  0x2007: "FIGURE SPACE",
  0x2008: "PUNCTUATION SPACE",
  0x2009: "THIN SPACE",
  0x200a: "HAIR SPACE",
  0x202f: "NARROW NO-BREAK SPACE",
  0x205f: "MEDIUM MATHEMATICAL SPACE",
  0x3000: "IDEOGRAPHIC SPACE",
};

/** Bidi openers and their required terminators. */
const BIDI_OPENERS = { 0x202a: 0x202c, 0x202b: 0x202c, 0x202d: 0x202c, 0x202e: 0x202c, 0x2066: 0x2069, 0x2067: 0x2069, 0x2068: 0x2069 };
const BIDI_CLOSERS = new Set([0x202c, 0x2069]);

/** Format a codepoint the way Unicode charts do. */
export function toU(codepoint) {
  return `U+${codepoint.toString(16).toUpperCase().padStart(4, "0")}`;
}

/* ------------------------------------------------------------------ */
/* Scripts                                                             */
/* ------------------------------------------------------------------ */

const SCRIPT_RANGES = [
  [0x0041, 0x005a, "Latin"], [0x0061, 0x007a, "Latin"], [0x00c0, 0x024f, "Latin"],
  [0x1e00, 0x1eff, "Latin"], [0x2c60, 0x2c7f, "Latin"], [0xa720, 0xa7ff, "Latin"],
  [0xff21, 0xff3a, "Latin"], [0xff41, 0xff5a, "Latin"],
  [0x0370, 0x03ff, "Greek"], [0x1f00, 0x1fff, "Greek"],
  [0x0400, 0x04ff, "Cyrillic"], [0x0500, 0x052f, "Cyrillic"], [0x2de0, 0x2dff, "Cyrillic"], [0xa640, 0xa69f, "Cyrillic"],
  [0x0530, 0x058f, "Armenian"],
  [0x0590, 0x05ff, "Hebrew"],
  [0x0600, 0x06ff, "Arabic"], [0x0750, 0x077f, "Arabic"], [0x08a0, 0x08ff, "Arabic"], [0xfb50, 0xfdff, "Arabic"], [0xfe70, 0xfeff, "Arabic"],
  [0x0700, 0x074f, "Syriac"],
  [0x0900, 0x097f, "Devanagari"], [0x0980, 0x09ff, "Bengali"], [0x0a00, 0x0a7f, "Gurmukhi"],
  [0x0a80, 0x0aff, "Gujarati"], [0x0b00, 0x0b7f, "Oriya"], [0x0b80, 0x0bff, "Tamil"],
  [0x0c00, 0x0c7f, "Telugu"], [0x0c80, 0x0cff, "Kannada"], [0x0d00, 0x0d7f, "Malayalam"],
  [0x0d80, 0x0dff, "Sinhala"], [0x0e00, 0x0e7f, "Thai"], [0x0e80, 0x0eff, "Lao"],
  [0x0f00, 0x0fff, "Tibetan"], [0x1000, 0x109f, "Myanmar"], [0x10a0, 0x10ff, "Georgian"],
  [0x1200, 0x137f, "Ethiopic"], [0x13a0, 0x13ff, "Cherokee"], [0xab70, 0xabbf, "Cherokee"],
  [0x1100, 0x11ff, "Hangul"], [0xac00, 0xd7af, "Hangul"], [0x3130, 0x318f, "Hangul"],
  [0x3040, 0x309f, "Hiragana"], [0x30a0, 0x30ff, "Katakana"],
  [0x3400, 0x4dbf, "Han"], [0x4e00, 0x9fff, "Han"], [0xf900, 0xfaff, "Han"],
];

/**
 * Script of a single codepoint. Digits, punctuation and spaces are "Common";
 * combining marks are "Inherited"; both are ignored by mixed-script checks, as
 * UTS #39 specifies.
 */
export function scriptOf(codepoint) {
  if (codepoint >= 0x0300 && codepoint <= 0x036f) return "Inherited";
  for (const [start, end, name] of SCRIPT_RANGES) {
    if (codepoint >= start && codepoint <= end) return name;
  }
  return "Common";
}

/* ------------------------------------------------------------------ */
/* Confusables                                                         */
/* ------------------------------------------------------------------ */

/**
 * Cross-script look-alikes, taken from the Latin section of the Unicode
 * confusables data. NFKC already folds fullwidth forms, circled letters and the
 * mathematical alphanumeric blocks, so only genuine cross-script pairs are
 * listed here.
 */
export const CONFUSABLES = {
  // Cyrillic
  0x0405: "S", 0x0406: "I", 0x0408: "J", 0x0410: "A", 0x0412: "B", 0x0415: "E",
  0x041a: "K", 0x041c: "M", 0x041d: "H", 0x041e: "O", 0x0420: "P", 0x0421: "C",
  0x0422: "T", 0x0423: "Y", 0x0425: "X", 0x0430: "a", 0x0435: "e", 0x043e: "o",
  0x0440: "p", 0x0441: "c", 0x0443: "y", 0x0445: "x", 0x0455: "s", 0x0456: "i",
  0x0458: "j", 0x04bb: "h", 0x04cf: "l", 0x051a: "Q", 0x051b: "q", 0x051c: "W",
  0x051d: "w", 0x0501: "d", 0x04ae: "Y", 0x04c0: "I", 0x0500: "D",
  // Greek
  0x0391: "A", 0x0392: "B", 0x0395: "E", 0x0396: "Z", 0x0397: "H", 0x0399: "I",
  0x039a: "K", 0x039c: "M", 0x039d: "N", 0x039f: "O", 0x03a1: "P", 0x03a4: "T",
  0x03a5: "Y", 0x03a7: "X", 0x03b1: "a", 0x03b5: "e", 0x03b7: "n", 0x03b9: "i",
  0x03ba: "k", 0x03bd: "v", 0x03bf: "o", 0x03c1: "p", 0x03c4: "t", 0x03c5: "u",
  0x03c7: "x", 0x03f2: "c", 0x03f9: "C",
  // Armenian
  0x0555: "O", 0x054f: "S", 0x0570: "h", 0x0578: "n", 0x057d: "u", 0x0580: "r",
  0x0581: "g", 0x0585: "o", 0x0566: "q",
  // Cherokee
  0x13a1: "R", 0x13a2: "T", 0x13aa: "A", 0x13ab: "J", 0x13b3: "W", 0x13b7: "M",
  0x13bb: "H", 0x13c0: "G", 0x13c3: "Z", 0x13d2: "P", 0x13d4: "W", 0x13d9: "V",
  0x13de: "L", 0x13e6: "K", 0x13ac: "E", 0x13cf: "b",
  // Latin letters that imitate other Latin letters or digits
  0x0131: "i", 0x0142: "l", 0x0269: "i", 0x01c0: "l",
  // Symbols and letterlike forms
  0x2010: "-", 0x2011: "-", 0x2012: "-", 0x2013: "-", 0x2014: "-", 0x2015: "-",
  0x2212: "-", 0xff0d: "-",
  0x2018: "'", 0x2019: "'", 0x201a: "'", 0x201b: "'", 0x2032: "'", 0x02b9: "'",
  0x201c: '"', 0x201d: '"', 0x201e: '"', 0x2033: '"',
  0x2044: "/", 0x2215: "/", 0x29f8: "/",
  0x0589: ":", 0x05c3: ":", 0x2236: ":", 0xa789: ":",
  0x2024: ".", 0x0701: ".", 0x0702: ".", 0xff0e: ".", 0x3002: ".", 0x06d4: ".",
  0x00b7: ".", 0x2027: ".", 0x2219: ".", 0x22c5: ".",
  0x0130: "I", 0x212a: "K",
};

/**
 * Fold a string to its Latin skeleton: NFKC first (which normalises fullwidth,
 * circled and mathematical letter forms), then the cross-script table above.
 * This is the practical form of the UTS #39 skeleton operation.
 */
export function skeleton(text) {
  const normalised = String(text == null ? "" : text).normalize("NFKC");
  let out = "";
  for (const char of normalised) {
    const cp = char.codePointAt(0);
    if (isInvisible(cp)) continue;
    if (Object.prototype.hasOwnProperty.call(CONFUSABLES, cp)) out += CONFUSABLES[cp];
    else out += char;
  }
  return out;
}

function isInvisible(cp) {
  if (NAMED_CODEPOINTS[cp] && (NAMED_CODEPOINTS[cp][0] === "invisible" || NAMED_CODEPOINTS[cp][0] === "bidi")) {
    return true;
  }
  if (cp >= 0xfe00 && cp <= 0xfe0f) return true;
  if (cp >= 0xe0000 && cp <= 0xe007f) return true;
  if (cp >= 0xe0100 && cp <= 0xe01ef) return true;
  return false;
}

/* ------------------------------------------------------------------ */
/* Punycode (RFC 3492 Bootstring)                                      */
/* ------------------------------------------------------------------ */

const BASE = 36;
const TMIN = 1;
const TMAX = 26;
const SKEW = 38;
const DAMP = 700;
const INITIAL_BIAS = 72;
const INITIAL_N = 128;
const DELIMITER = "-";

function adaptBias(delta, numPoints, firstTime) {
  let value = firstTime ? Math.floor(delta / DAMP) : delta >> 1;
  value += Math.floor(value / numPoints);
  let k = 0;
  while (value > ((BASE - TMIN) * TMAX) >> 1) {
    value = Math.floor(value / (BASE - TMIN));
    k += BASE;
  }
  return k + Math.floor(((BASE - TMIN + 1) * value) / (value + SKEW));
}

function digitToChar(digit) {
  return String.fromCharCode(digit + 22 + (digit < 26 ? 75 : 0));
}

function charToDigit(char) {
  const code = char.charCodeAt(0);
  if (code >= 0x30 && code <= 0x39) return code - 0x30 + 26;
  if (code >= 0x41 && code <= 0x5a) return code - 0x41;
  if (code >= 0x61 && code <= 0x7a) return code - 0x61;
  return BASE;
}

/** Encode one label with RFC 3492 Bootstring (no "xn--" prefix). */
export function punycodeEncodeLabel(label) {
  const input = Array.from(String(label)).map((char) => char.codePointAt(0));
  const basic = input.filter((cp) => cp < 0x80);
  let output = basic.map((cp) => String.fromCodePoint(cp)).join("");
  let handled = basic.length;
  if (handled) output += DELIMITER;

  let n = INITIAL_N;
  let delta = 0;
  let bias = INITIAL_BIAS;

  while (handled < input.length) {
    let m = Infinity;
    for (const cp of input) if (cp >= n && cp < m) m = cp;
    delta += (m - n) * (handled + 1);
    n = m;
    for (const cp of input) {
      if (cp < n) delta += 1;
      if (cp !== n) continue;
      let q = delta;
      for (let k = BASE; ; k += BASE) {
        const t = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias;
        if (q < t) break;
        output += digitToChar(t + ((q - t) % (BASE - t)));
        q = Math.floor((q - t) / (BASE - t));
      }
      output += digitToChar(q);
      bias = adaptBias(delta, handled + 1, handled === basic.length);
      delta = 0;
      handled += 1;
    }
    delta += 1;
    n += 1;
  }
  return output;
}

/** Decode one Bootstring label (without the "xn--" prefix). */
export function punycodeDecodeLabel(label) {
  const text = String(label);
  const lastDelimiter = text.lastIndexOf(DELIMITER);
  const output = [];
  if (lastDelimiter > 0) {
    for (let i = 0; i < lastDelimiter; i += 1) {
      const code = text.charCodeAt(i);
      if (code >= 0x80) return null;
      output.push(code);
    }
  }
  let n = INITIAL_N;
  let bias = INITIAL_BIAS;
  let i = 0;
  let index = lastDelimiter > 0 ? lastDelimiter + 1 : 0;

  while (index < text.length) {
    const oldi = i;
    let w = 1;
    for (let k = BASE; ; k += BASE) {
      if (index >= text.length) return null;
      const digit = charToDigit(text[index]);
      index += 1;
      if (digit >= BASE) return null;
      i += digit * w;
      const t = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias;
      if (digit < t) break;
      w *= BASE - t;
    }
    bias = adaptBias(i - oldi, output.length + 1, oldi === 0);
    n += Math.floor(i / (output.length + 1));
    i %= output.length + 1;
    if (n > 0x10ffff) return null;
    output.splice(i, 0, n);
    i += 1;
  }
  try {
    return output.map((cp) => String.fromCodePoint(cp)).join("");
  } catch {
    return null;
  }
}

/**
 * Convert a hostname to its IDNA A-label form. Case folding and NFC are applied
 * first; this is the common UTS #46 non-transitional path, not the full
 * mapping table.
 */
export function hostToPunycode(host) {
  const clean = String(host == null ? "" : host).trim();
  if (!clean) return "";
  return clean
    .toLowerCase()
    .normalize("NFC")
    .split(".")
    .map((label) => {
      if (!label) return label;
      if (/^[\x00-\x7f]*$/.test(label)) return label;
      return `xn--${punycodeEncodeLabel(label)}`;
    })
    .join(".");
}

/** Convert an A-label hostname back to the Unicode form a browser renders. */
export function hostFromPunycode(host) {
  const clean = String(host == null ? "" : host).trim();
  if (!clean) return "";
  return clean
    .split(".")
    .map((label) => {
      if (!/^xn--/i.test(label)) return label;
      const decoded = punycodeDecodeLabel(label.slice(4));
      return decoded == null ? label : decoded;
    })
    .join(".");
}

/* ------------------------------------------------------------------ */
/* Character walk                                                      */
/* ------------------------------------------------------------------ */

function describeCodepoint(cp) {
  if (NAMED_CODEPOINTS[cp]) {
    const [category, name, risk, note] = NAMED_CODEPOINTS[cp];
    return { category, name, risk, note };
  }
  if (SPACE_CODEPOINTS[cp]) {
    return {
      category: "space",
      name: SPACE_CODEPOINTS[cp],
      risk: "medium",
      note: "Looks like a space but is a different codepoint, so exact-match comparisons and shell splitting behave differently.",
    };
  }
  if (cp >= 0xe0000 && cp <= 0xe007f) {
    const ascii = cp >= 0xe0020 && cp <= 0xe007e ? String.fromCharCode(cp - 0xe0000) : "";
    return {
      category: "tag",
      name:
        cp === 0xe0001
          ? "LANGUAGE TAG"
          : cp === 0xe007f
            ? "CANCEL TAG"
            : `TAG ${ascii === " " ? "SPACE" : ascii || "CHARACTER"}`,
      risk: "high",
      note: ascii
        ? `Carries the hidden ASCII character "${ascii}". Renders as nothing at all in every normal font.`
        : "Part of a deprecated tag sequence. Renders as nothing at all.",
      ascii,
    };
  }
  if (cp >= 0xfe00 && cp <= 0xfe0f) {
    return {
      category: "variation",
      name: `VARIATION SELECTOR-${cp - 0xfe00 + 1}`,
      risk: cp === 0xfe0f || cp === 0xfe0e ? "low" : "medium",
      note: "Changes the glyph chosen for the character before it. VS15 and VS16 are the ordinary text/emoji switches; the rest almost never appear in prose and can carry data.",
    };
  }
  if (cp >= 0xe0100 && cp <= 0xe01ef) {
    return {
      category: "variation",
      name: `VARIATION SELECTOR-${cp - 0xe0100 + 17}`,
      risk: "medium",
      note: "Supplementary variation selector. Invisible, and increasingly used to hide arbitrary bytes inside a visible string.",
    };
  }
  if ((cp >= 0xe000 && cp <= 0xf8ff) || (cp >= 0xf0000 && cp <= 0xffffd) || (cp >= 0x100000 && cp <= 0x10fffd)) {
    return {
      category: "pua",
      name: "PRIVATE USE CHARACTER",
      risk: "medium",
      note: "Has no assigned meaning. It renders differently — or not at all — depending on the font, so what you see is not what anyone else sees.",
    };
  }
  if (cp < 0x20 && cp !== 0x09 && cp !== 0x0a && cp !== 0x0d) {
    return {
      category: "control",
      name: `C0 CONTROL ${toU(cp)}`,
      risk: cp === 0x00 ? "high" : "medium",
      note: "A C0 control character inside text. NUL in particular truncates strings in C-based parsers while later bytes survive elsewhere.",
    };
  }
  if (cp >= 0x7f && cp <= 0x9f) {
    return {
      category: "control",
      name: cp === 0x7f ? "DELETE" : `C1 CONTROL ${toU(cp)}`,
      risk: "medium",
      note: "A C1 control character. Terminals and log viewers interpret these; text editors usually do not show them.",
    };
  }
  if (Object.prototype.hasOwnProperty.call(CONFUSABLES, cp)) {
    return {
      category: "confusable",
      name: `${scriptOf(cp)} look-alike for "${CONFUSABLES[cp]}"`,
      risk: "high",
      note: `This is ${scriptOf(cp)}, not Latin. It renders almost identically to "${CONFUSABLES[cp]}" but compares as a completely different string.`,
      replacement: CONFUSABLES[cp],
    };
  }
  return null;
}

/**
 * Walk the text by codepoint and return every flagged occurrence with its
 * position, line and column.
 */
export function scanCodepoints(text) {
  const source = String(text == null ? "" : text);
  const found = [];
  let line = 1;
  let column = 1;
  let offset = 0;
  let ordinal = 0;

  for (const char of source) {
    const cp = char.codePointAt(0);
    const info = describeCodepoint(cp);
    if (info) {
      found.push({
        char,
        codepoint: cp,
        hex: toU(cp),
        offset,
        ordinal,
        line,
        column,
        script: scriptOf(cp),
        ...info,
      });
    }
    if (cp === 0x0a) {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
    offset += char.length;
    ordinal += 1;
  }
  return found;
}

/**
 * Bidi embedding/isolate balance. An unterminated override is the signature of
 * the Trojan Source attack: the reordering leaks past the fragment the author
 * meant it to cover.
 */
export function analyzeBidi(text) {
  const source = String(text == null ? "" : text);
  const stack = [];
  let unmatchedClosers = 0;
  let overrides = 0;
  let isolates = 0;
  let embeddings = 0;

  for (const char of source) {
    const cp = char.codePointAt(0);
    if (BIDI_OPENERS[cp]) {
      stack.push(cp);
      if (cp === 0x202d || cp === 0x202e) overrides += 1;
      else if (cp >= 0x2066) isolates += 1;
      else embeddings += 1;
      continue;
    }
    if (BIDI_CLOSERS.has(cp)) {
      const expected = cp === 0x2069 ? [0x2066, 0x2067, 0x2068] : [0x202a, 0x202b, 0x202d, 0x202e];
      const index = [...stack].reverse().findIndex((open) => expected.includes(open));
      if (index === -1) unmatchedClosers += 1;
      else stack.splice(stack.length - 1 - index, 1);
    }
  }

  return {
    overrides,
    embeddings,
    isolates,
    unterminated: stack.length,
    unterminatedList: stack.map((cp) => ({ codepoint: cp, hex: toU(cp), name: NAMED_CODEPOINTS[cp][1] })),
    unmatchedClosers,
    balanced: stack.length === 0 && unmatchedClosers === 0,
    present: overrides + embeddings + isolates + unmatchedClosers > 0,
  };
}

/** Decode the ASCII payload hidden in a run of U+E0000-block tag characters. */
export function decodeTagCharacters(text) {
  let out = "";
  for (const char of String(text == null ? "" : text)) {
    const cp = char.codePointAt(0);
    if (cp >= 0xe0020 && cp <= 0xe007e) out += String.fromCharCode(cp - 0xe0000);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Tokens and hosts                                                    */
/* ------------------------------------------------------------------ */

const TRIM_PUNCTUATION = /^[\s"'`([{<,;:!?]+|[\s"'`)\]}>,;:!?.]+$/g;

/**
 * Split on whitespace and examine each token: which scripts it mixes, and what
 * it would read as once every look-alike is folded to Latin.
 */
export function analyzeTokens(text) {
  const raw = String(text == null ? "" : text).split(/\s+/);
  const tokens = [];
  const seen = new Set();

  for (const piece of raw) {
    const token = piece.replace(TRIM_PUNCTUATION, "");
    if (!token || seen.has(token)) continue;
    seen.add(token);

    const scripts = new Set();
    for (const char of token) {
      const script = scriptOf(char.codePointAt(0));
      if (script !== "Common" && script !== "Inherited") scripts.add(script);
    }
    const scriptList = [...scripts].sort();
    const folded = skeleton(token);
    const mixed = scriptList.length > 1;
    const disguised = folded !== token && /[A-Za-z0-9]/.test(folded);
    if (!mixed && !disguised) continue;

    tokens.push({
      token,
      scripts: scriptList,
      mixedScript: mixed,
      skeleton: folded,
      disguised,
      // A token that folds entirely to ASCII while containing non-Latin letters
      // is the classic homograph: it reads as English and is not.
      pureHomograph: disguised && /^[\x20-\x7e]+$/.test(folded) && scriptList.some((s) => s !== "Latin"),
    });
  }
  return tokens;
}

/** A trailing label that could be a TLD: letters, or an A-label. */
const TLD_LIKE = /^(?:xn--[a-z0-9-]{2,}|[^\s@/:.\d_]{2,})$/i;

function looksLikeHost(token) {
  const labels = token.split(".");
  if (labels.length < 2) return false;
  if (labels.some((label) => label === "")) return false;
  return TLD_LIKE.test(labels[labels.length - 1]);
}

/** Pull hostname-shaped tokens out of the text, including from URLs and emails. */
export function extractHosts(text) {
  const source = String(text == null ? "" : text);
  const candidates = new Set();

  for (const piece of source.split(/\s+/)) {
    let token = piece.replace(TRIM_PUNCTUATION, "");
    if (!token) continue;
    token = token.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, "");
    const at = token.lastIndexOf("@");
    if (at !== -1) token = token.slice(at + 1);
    token = token.split(/[/?#\\]/)[0];
    token = token.replace(/:\d+$/, "");
    token = token.replace(/^\.+|\.+$/g, "");
    if (!token || !looksLikeHost(token)) continue;
    candidates.add(token);
  }

  return [...candidates].map((host) => {
    const ascii = hostToPunycode(host);
    const unicode = hostFromPunycode(host);

    // UTS #39 applies mixed-script detection per label, not per whole name:
    // every internationalised domain ends in an ASCII TLD, so comparing across
    // the dot would flag every legitimate IDN.
    const labels = unicode.split(".").map((label) => {
      const scripts = new Set();
      for (const char of label) {
        const script = scriptOf(char.codePointAt(0));
        if (script !== "Common" && script !== "Inherited") scripts.add(script);
      }
      const scriptList = [...scripts].sort();
      const folded = skeleton(label);
      return {
        label,
        scripts: scriptList,
        mixedScript: scriptList.length > 1,
        skeleton: folded,
        // A label written entirely in one non-Latin script that still reads as
        // Latin — the whole-script confusable, and the hardest kind to see.
        wholeScriptConfusable:
          scriptList.length === 1 &&
          scriptList[0] !== "Latin" &&
          folded !== label &&
          /^[\x20-\x7e]+$/.test(folded),
      };
    });

    const scriptList = [...new Set(labels.flatMap((label) => label.scripts))].sort();
    const folded = skeleton(unicode);
    const isAscii = /^[\x00-\x7f]*$/.test(host);
    return {
      host,
      ascii,
      unicode,
      labels,
      wasPunycode: unicode !== host,
      needsPunycode: ascii !== host.toLowerCase(),
      scripts: scriptList,
      mixedScript: labels.some((label) => label.mixedScript),
      wholeScriptConfusable: labels.some((label) => label.wholeScriptConfusable),
      skeleton: folded,
      imitates: folded !== unicode ? folded : "",
      isAscii,
    };
  });
}

/* ------------------------------------------------------------------ */
/* Segments for display                                                */
/* ------------------------------------------------------------------ */

/**
 * Break the text into runs of plain text and single flagged characters, so the
 * page can render the original with markers in place.
 */
export function buildSegments(text, flagged) {
  const source = String(text == null ? "" : text);
  const byOffset = new Map(flagged.map((item) => [item.offset, item]));
  const segments = [];
  let buffer = "";
  let offset = 0;

  for (const char of source) {
    const hit = byOffset.get(offset);
    if (hit) {
      if (buffer) {
        segments.push({ kind: "text", text: buffer });
        buffer = "";
      }
      segments.push({ kind: "flag", text: char, item: hit });
    } else {
      buffer += char;
    }
    offset += char.length;
  }
  if (buffer) segments.push({ kind: "text", text: buffer });
  return segments;
}

/* ------------------------------------------------------------------ */
/* Cleaning                                                            */
/* ------------------------------------------------------------------ */

/**
 * Remove everything invisible and collapse odd whitespace to plain spaces.
 * Visible look-alike letters are left alone unless foldConfusables is set,
 * because rewriting a letter changes meaning in genuinely multilingual text.
 */
export function cleanText(text, options) {
  const settings = options || {};
  const source = String(text == null ? "" : text);
  let out = "";
  for (const char of source) {
    const cp = char.codePointAt(0);
    if (isInvisible(cp)) continue;
    if (cp < 0x20 && cp !== 0x09 && cp !== 0x0a && cp !== 0x0d) continue;
    if (cp >= 0x7f && cp <= 0x9f) continue;
    if (SPACE_CODEPOINTS[cp]) {
      out += " ";
      continue;
    }
    if (settings.foldConfusables && Object.prototype.hasOwnProperty.call(CONFUSABLES, cp)) {
      out += CONFUSABLES[cp];
      continue;
    }
    out += char;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Report                                                              */
/* ------------------------------------------------------------------ */

/**
 * Full scan.
 *
 * @param {string} text text to inspect
 * @returns {object} { error } or the report
 */
export function scanText(text) {
  const source = String(text == null ? "" : text);
  if (!source) return { error: "Paste or type some text to scan." };

  const codepoints = Array.from(source);
  const flagged = scanCodepoints(source);
  const bidi = analyzeBidi(source);
  const tagPayload = decodeTagCharacters(source);
  const tokens = analyzeTokens(source);
  const hosts = extractHosts(source);

  const byCategory = {};
  for (const item of flagged) {
    if (!byCategory[item.category]) byCategory[item.category] = [];
    byCategory[item.category].push(item);
  }

  const groups = [];
  const groupIndex = new Map();
  for (const item of flagged) {
    if (!groupIndex.has(item.codepoint)) {
      const group = {
        codepoint: item.codepoint,
        hex: item.hex,
        name: item.name,
        category: item.category,
        risk: item.risk,
        note: item.note,
        replacement: item.replacement || "",
        count: 0,
        positions: [],
      };
      groupIndex.set(item.codepoint, group);
      groups.push(group);
    }
    const group = groupIndex.get(item.codepoint);
    group.count += 1;
    if (group.positions.length < 12) group.positions.push({ line: item.line, column: item.column });
  }
  groups.sort(
    (a, b) => RISK_ORDER.indexOf(a.risk) - RISK_ORDER.indexOf(b.risk) || b.count - a.count || a.codepoint - b.codepoint,
  );

  const findings = [];
  const push = (level, title, detail) => findings.push({ level, title, detail });

  if (bidi.overrides > 0) {
    push(
      "high",
      `${bidi.overrides} bidirectional override${bidi.overrides === 1 ? "" : "s"}`,
      "U+202D and U+202E force a display direction on everything that follows. In source code this is the Trojan Source attack: the compiler reads one order, the reviewer sees another.",
    );
  }
  if (bidi.present && !bidi.balanced) {
    push(
      "high",
      `${bidi.unterminated} unterminated bidi control${bidi.unterminated === 1 ? "" : "s"}${bidi.unmatchedClosers ? ` and ${bidi.unmatchedClosers} stray terminator${bidi.unmatchedClosers === 1 ? "" : "s"}` : ""}`,
      "An embedding or isolate that is never closed keeps reordering the rest of the text — well past whatever the author appeared to be affecting.",
    );
  } else if (bidi.present) {
    push(
      "medium",
      "Balanced bidirectional controls",
      "Every embedding and isolate is closed. That is what correct mixed-direction text looks like, but the controls are still invisible, so read the character list below before trusting the rendering.",
    );
  }
  if (tagPayload) {
    push(
      "high",
      `Hidden ASCII payload of ${tagPayload.length} character${tagPayload.length === 1 ? "" : "s"}`,
      `Tag characters in the U+E0000 block decode to: ${tagPayload}. Nothing in this block draws a glyph, so the text carries an instruction or marker that no reader can see.`,
    );
  }
  const invisibleCount = (byCategory.invisible || []).length;
  if (invisibleCount) {
    push(
      "high",
      `${invisibleCount} invisible character${invisibleCount === 1 ? "" : "s"}`,
      "Zero-width and formatting codepoints occupy no space. They break keyword matching, hide watermarks that survive copy-paste, and split identifiers that look identical.",
    );
  }
  const puaCount = (byCategory.pua || []).length;
  if (puaCount) {
    push("medium", `${puaCount} private-use codepoint${puaCount === 1 ? "" : "s"}`, "These have no standard meaning. What they render as depends entirely on the reader's font.");
  }
  const spaceCount = (byCategory.space || []).length;
  if (spaceCount) {
    push("medium", `${spaceCount} non-standard space${spaceCount === 1 ? "" : "s"}`, "Non-breaking and typographic spaces read as spaces but do not compare equal to U+0020, which is why a pasted command or password can look right and fail.");
  }
  const controlCount = (byCategory.control || []).length;
  if (controlCount) {
    push("high", `${controlCount} control character${controlCount === 1 ? "" : "s"}`, "Control codes inside text change how terminals, parsers and loggers read it, while most editors show nothing.");
  }
  const variationCount = (byCategory.variation || []).length;
  if (variationCount) {
    push("medium", `${variationCount} variation selector${variationCount === 1 ? "" : "s"}`, "Variation selectors pick a glyph form. A long run of them attached to one visible character is a data-hiding channel, not typography.");
  }

  const homographTokens = tokens.filter((item) => item.pureHomograph);
  const mixedTokens = tokens.filter((item) => item.mixedScript);
  if (homographTokens.length) {
    push(
      "high",
      `${homographTokens.length} homograph token${homographTokens.length === 1 ? "" : "s"}`,
      `Written with non-Latin letters that imitate Latin ones: ${homographTokens.map((item) => `${item.token} reads as ${item.skeleton}`).join("; ")}.`,
    );
  }
  if (mixedTokens.length) {
    push(
      "high",
      `${mixedTokens.length} token${mixedTokens.length === 1 ? "" : "s"} mixing scripts`,
      `UTS #39 treats a single word drawn from more than one script as restricted: ${mixedTokens.map((item) => `${item.token} (${item.scripts.join(" + ")})`).join("; ")}.`,
    );
  }

  const riskyHosts = hosts.filter(
    (item) => item.mixedScript || item.wholeScriptConfusable || item.imitates || item.wasPunycode,
  );
  for (const host of riskyHosts) {
    const parts = [];
    if (host.wasPunycode) parts.push(`The A-label ${host.host} renders as ${host.unicode}.`);
    if (host.needsPunycode) parts.push(`A browser sends it on the wire as ${host.ascii}.`);
    if (host.imitates) parts.push(`Folded to Latin it reads as ${host.skeleton}.`);
    if (host.mixedScript) {
      parts.push(
        `A single label mixes ${host.scripts.join(" and ")}, which registries and browsers treat as restricted precisely because of this attack.`,
      );
    }
    if (host.wholeScriptConfusable) {
      parts.push(
        "One label is written entirely in a non-Latin script yet still reads as Latin — a whole-script confusable, which passes single-script registry rules and is invisible to the eye.",
      );
    }
    push(
      host.mixedScript || host.wholeScriptConfusable ? "high" : "medium",
      `Hostname ${host.unicode}`,
      parts.join(" "),
    );
  }

  const counts = {
    characters: source.length,
    codepoints: codepoints.length,
    flagged: flagged.length,
    high: flagged.filter((item) => item.risk === "high").length,
    medium: flagged.filter((item) => item.risk === "medium").length,
    low: flagged.filter((item) => item.risk === "low").length,
    distinct: groups.length,
  };

  const verdict = findings.some((item) => item.level === "high")
    ? "high"
    : findings.some((item) => item.level === "medium")
      ? "medium"
      : "clean";

  return {
    error: "",
    counts,
    groups,
    flagged,
    byCategory,
    bidi,
    tagPayload,
    tokens,
    hosts,
    findings,
    verdict,
    segments: buildSegments(source, flagged),
    cleaned: cleanText(source, { foldConfusables: false }),
    asciiFolded: cleanText(source, { foldConfusables: true }),
    limits: [
      "The confusable table is the widely abused Latin subset of the Unicode confusables data, not the whole file — an exotic look-alike may not be named, though it will still show its script.",
      "Script detection uses block ranges, so a character in a block shared by several scripts is reported by its block.",
      "Punycode conversion applies lower-casing and NFC, which is the usual UTS #46 non-transitional path; it does not implement the full IDNA mapping and validity tables.",
    ],
  };
}

/** Plain-text report for the copy button. */
export function formatReport(result) {
  if (!result || result.error) return "";
  const lines = ["HIDDEN UNICODE & HOMOGRAPH SCAN", ""];
  lines.push(
    `${result.counts.codepoints} codepoints · ${result.counts.flagged} flagged · ${result.counts.distinct} distinct · verdict ${result.verdict}`,
  );
  lines.push("");
  if (result.findings.length) {
    lines.push("FINDINGS");
    for (const item of result.findings) {
      lines.push(`  [${item.level}] ${item.title}`);
      lines.push(`      ${item.detail}`);
    }
    lines.push("");
  }
  if (result.groups.length) {
    lines.push("CHARACTERS");
    for (const group of result.groups) {
      lines.push(
        `  ${group.hex}  ${group.name}  x${group.count}  (${CATEGORY_LABELS[group.category] || group.category}, ${group.risk} risk)`,
      );
      lines.push(`      first at line ${group.positions[0].line}, column ${group.positions[0].column}`);
    }
    lines.push("");
  }
  if (result.hosts.length) {
    lines.push("HOSTNAMES");
    for (const host of result.hosts) {
      lines.push(`  ${host.unicode}  ->  ${host.ascii}${host.imitates ? `   reads like ${host.skeleton}` : ""}`);
    }
    lines.push("");
  }
  lines.push("CLEANED TEXT (invisibles removed)");
  lines.push(result.cleaned);
  return lines.join("\n");
}

/**
 * Default sample, written with explicit escapes so the file itself stays
 * readable. In order it contains: a Cyrillic homograph hostname, a zero-width
 * space splitting a keyword, a non-breaking space, the canonical Trojan Source
 * comment from CVE-2021-42574, a hidden tag-character payload, and the A-label
 * of the all-Cyrillic apple.com used in the 2017 browser demonstrations.
 */
export const SAMPLE_TEXT = [
  "Login at https://\u0430pple.com/account to restore access.",
  "Password\u200Breset requested for user\u00A0admin.",
  "if (isAdmin) { /*\u202E } \u2066// safe\u2069\u2066*/ return true;",
  "Support\u{E0020}\u{E0069}\u{E0067}\u{E006E}\u{E006F}\u{E0072}\u{E0065}\u{E0020}\u{E0070}\u{E0072}\u{E0069}\u{E006F}\u{E0072} desk: xn--80ak6aa92e.com",
].join("\n");
