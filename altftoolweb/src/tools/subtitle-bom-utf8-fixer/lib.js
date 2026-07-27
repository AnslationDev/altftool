/**
 * Byte order mark and encoding hygiene for subtitle files (SRT, WebVTT, SBV).
 *
 * Pure functions only: no DOM, no React, no Date.now().
 * Every non-ASCII value is written as an escape so the source stays readable.
 */

/** U+FEFF, the ZERO WIDTH NO-BREAK SPACE code point used as a byte order mark. */
export const BOM_CHAR = "﻿";

/** The UTF-8 serialisation of U+FEFF is the three bytes EF BB BF (Unicode Standard, section 23.8). */
export const UTF8_BOM_BYTES = Object.freeze([0xef, 0xbb, 0xbf]);

/** Adding a UTF-8 BOM adds exactly these three bytes to the file. */
export const UTF8_BOM_BYTE_LENGTH = UTF8_BOM_BYTES.length;

/**
 * Byte order mark signatures, longest first so UTF-32LE (FF FE 00 00) is not
 * mistaken for UTF-16LE (FF FE). Source: Unicode Standard BOM byte sequences.
 */
export const BOM_SIGNATURES = Object.freeze([
  { encoding: "UTF-32LE", bytes: [0xff, 0xfe, 0x00, 0x00] },
  { encoding: "UTF-32BE", bytes: [0x00, 0x00, 0xfe, 0xff] },
  { encoding: "UTF-8", bytes: [0xef, 0xbb, 0xbf] },
  { encoding: "UTF-16LE", bytes: [0xff, 0xfe] },
  { encoding: "UTF-16BE", bytes: [0xfe, 0xff] },
]);

/**
 * A UTF-8 BOM (EF BB BF) decoded as Windows-1252 renders as U+00EF U+00BB
 * U+00BF. Seeing that trio at the start of the text proves the file was read
 * with the wrong code page instead of as UTF-8.
 */
export const MOJIBAKE_BOM = "ï»¿";

/**
 * Sequences produced when UTF-8 bytes are decoded as Windows-1252:
 *   E2 80 99 -> U+2019 right single quote
 *   E2 80 9C -> U+201C left double quote
 *   E2 80 94 -> U+2014 em dash
 *   C3 A9    -> U+00E9 e acute
 *   C3 B3    -> U+00F3 o acute
 *   C3 BC    -> U+00FC u diaeresis
 *   C2 A0    -> U+00A0 no-break space
 */
export const MOJIBAKE_MARKERS = Object.freeze([
  "â€™",
  "â€œ",
  "â€”",
  "Ã©",
  "Ã³",
  "Ã¼",
  "Â ",
]);

/** SRT timing line: 00:00:01,000 --> 00:00:04,000 (comma decimal separator). */
const SRT_CUE_RE = /^\s*\d{1,2}:\d{2}:\d{2},\d{1,3}\s*-->\s*\d{1,2}:\d{2}:\d{2},\d{1,3}/gm;

/** WebVTT timing line: 00:01.000 --> 00:04.000 (dot separator, hours optional). */
const VTT_CUE_RE = /^\s*(?:\d{1,3}:)?\d{2}:\d{2}\.\d{3}\s*-->\s*(?:\d{1,3}:)?\d{2}:\d{2}\.\d{3}/gm;

/** YouTube SBV timing line: 0:00:01.000,0:00:04.000 */
const SBV_CUE_RE = /^\s*\d{1,2}:\d{2}:\d{2}\.\d{3},\d{1,2}:\d{2}:\d{2}\.\d{3}\s*$/gm;

const BOM_GLOBAL_RE = /﻿/g;
const NON_ASCII_RE = /[^\x00-\x7F]/g;

const FORMAT_LABELS = {
  srt: "SubRip (.srt)",
  webvtt: "WebVTT (.vtt)",
  sbv: "YouTube SBV (.sbv)",
  unknown: "Unrecognised",
};

/**
 * Identify a byte order mark at the start of a byte array.
 *
 * @param {ArrayLike<number>} bytes - the first few bytes of the file.
 * @returns {{ hasBom: boolean, encoding: string|null, byteLength: number }}
 */
export function detectBomFromBytes(bytes) {
  if (!bytes || typeof bytes.length !== "number") {
    return { hasBom: false, encoding: null, byteLength: 0 };
  }
  for (const signature of BOM_SIGNATURES) {
    if (bytes.length < signature.bytes.length) continue;
    let match = true;
    for (let i = 0; i < signature.bytes.length; i += 1) {
      if (bytes[i] !== signature.bytes[i]) {
        match = false;
        break;
      }
    }
    if (match) {
      return { hasBom: true, encoding: signature.encoding, byteLength: signature.bytes.length };
    }
  }
  return { hasBom: false, encoding: null, byteLength: 0 };
}

/** True when the decoded text begins with U+FEFF. */
export function hasBom(text) {
  return typeof text === "string" && text.charCodeAt(0) === 0xfeff;
}

/** Remove a single leading U+FEFF. Leaves the rest of the string untouched. */
export function stripBom(text) {
  if (typeof text !== "string") return "";
  return hasBom(text) ? text.slice(1) : text;
}

/** Remove every U+FEFF, including strays inside cue text. */
export function stripAllBoms(text) {
  if (typeof text !== "string") return "";
  return text.replace(BOM_GLOBAL_RE, "");
}

/** Prepend a single U+FEFF, without doubling one that is already there. */
export function addBom(text) {
  if (typeof text !== "string") return BOM_CHAR;
  return hasBom(text) ? text : BOM_CHAR + text;
}

/** Convert every line break to CRLF or LF. */
export function normalizeLineEndings(text, style) {
  if (typeof text !== "string") return "";
  const lf = text.replace(/\r\n?/g, "\n");
  return style === "crlf" ? lf.replace(/\n/g, "\r\n") : lf;
}

/** Count matches of a global regex without leaking lastIndex between calls. */
function countMatches(text, re) {
  re.lastIndex = 0;
  let count = 0;
  while (re.exec(text) !== null) count += 1;
  re.lastIndex = 0;
  return count;
}

/**
 * Guess the subtitle format from its cue syntax.
 * @returns {"webvtt"|"srt"|"sbv"|"unknown"}
 */
export function detectSubtitleFormat(text) {
  if (typeof text !== "string") return "unknown";
  const body = stripBom(text);
  if (/^\s*WEBVTT\b/.test(body)) return "webvtt";
  if (countMatches(body, SRT_CUE_RE) > 0) return "srt";
  if (countMatches(body, VTT_CUE_RE) > 0) return "webvtt";
  if (countMatches(body, SBV_CUE_RE) > 0) return "sbv";
  return "unknown";
}

/** Number of bytes the string occupies once encoded as UTF-8. */
export function utf8ByteLength(text) {
  if (typeof text !== "string") return 0;
  let bytes = 0;
  for (const char of text) {
    const code = char.codePointAt(0);
    if (code < 0x80) bytes += 1;
    else if (code < 0x800) bytes += 2;
    else if (code < 0x10000) bytes += 3;
    else bytes += 4;
  }
  return bytes;
}

/**
 * Full report on a subtitle file's encoding hygiene.
 *
 * @param {object} input
 * @param {string} input.text - the decoded file contents.
 * @returns {object} report, or { error } when there is nothing to inspect.
 */
export function analyseSubtitle({ text = "" } = {}) {
  if (typeof text !== "string") return { error: "Subtitle content must be text." };
  if (text.length === 0) {
    return { error: "Paste or open a subtitle file to inspect its byte order mark." };
  }
  if (!stripAllBoms(text).trim()) {
    return { error: "The file contains only a byte order mark and whitespace - there are no cues." };
  }

  const bomPresent = hasBom(text);
  const body = stripBom(text);
  const strayBoms = countMatches(body, BOM_GLOBAL_RE);
  const format = detectSubtitleFormat(text);

  const crlfCount = countMatches(text, /\r\n/g);
  const loneLfCount = countMatches(text, /(?<!\r)\n/g);
  const loneCrCount = countMatches(text, /\r(?!\n)/g);
  const lineEnding =
    crlfCount + loneLfCount + loneCrCount === 0
      ? "none"
      : crlfCount > 0 && loneLfCount === 0 && loneCrCount === 0
        ? "CRLF"
        : loneLfCount > 0 && crlfCount === 0 && loneCrCount === 0
          ? "LF"
          : "mixed";

  const cueCount =
    format === "srt"
      ? countMatches(body, SRT_CUE_RE)
      : format === "webvtt"
        ? countMatches(body, VTT_CUE_RE)
        : format === "sbv"
          ? countMatches(body, SBV_CUE_RE)
          : 0;

  const mojibakeHits = MOJIBAKE_MARKERS.filter((marker) => body.includes(marker));
  const decodedBomVisible = body.includes(MOJIBAKE_BOM);

  const nonAsciiCount = countMatches(body, NON_ASCII_RE);
  const firstLine = body.split(/\r\n|\r|\n/, 1)[0] || "";
  const firstLineIsCueNumber = /^\s*\d+\s*$/.test(firstLine);

  const byteLengthWithoutBom = utf8ByteLength(body);
  const byteLength = byteLengthWithoutBom + (bomPresent ? UTF8_BOM_BYTE_LENGTH : 0);

  const issues = [];
  if (bomPresent && format === "srt" && firstLineIsCueNumber) {
    issues.push({
      level: "warning",
      message:
        "This SRT starts with a BOM immediately followed by the cue number. Strict parsers read that first line as non-numeric and silently drop subtitle 1.",
    });
  }
  if (!bomPresent && format === "srt" && nonAsciiCount > 0) {
    issues.push({
      level: "warning",
      message:
        "SRT with non-ASCII characters and no BOM. Some hardware players and older desktop apps fall back to a legacy code page and show garbled accents - add the BOM if that happens.",
    });
  }
  if (strayBoms > 0) {
    issues.push({
      level: "error",
      message: `${strayBoms} stray U+FEFF character${strayBoms > 1 ? "s" : ""} found inside the file rather than only at the start. They render as invisible glyphs inside cue text.`,
    });
  }
  if (decodedBomVisible) {
    issues.push({
      level: "error",
      message:
        "The text opens with U+00EF U+00BB U+00BF - a UTF-8 BOM that was decoded as Windows-1252. Re-open the original file as UTF-8 instead of patching the characters by hand.",
    });
  }
  if (mojibakeHits.length > 0) {
    issues.push({
      level: "error",
      message: `Mojibake detected in ${mojibakeHits.length} pattern${mojibakeHits.length > 1 ? "s" : ""}. UTF-8 bytes have been decoded with a single-byte code page; re-export from the source rather than search-and-replace.`,
    });
  }
  if (format === "webvtt" && !/^\s*WEBVTT/.test(body)) {
    issues.push({
      level: "error",
      message:
        "A WebVTT file must begin with the literal signature WEBVTT, after an optional BOM. Browsers reject the text track without it.",
    });
  }
  if (lineEnding === "mixed") {
    issues.push({
      level: "warning",
      message: "Mixed line endings. Normalise to CRLF for SRT or LF for WebVTT so cue blocks split predictably.",
    });
  }
  if (format === "unknown") {
    issues.push({
      level: "warning",
      message: "No SRT, WebVTT or SBV timing lines recognised. Check that this really is a subtitle file.",
    });
  }

  const status = issues.some((issue) => issue.level === "error")
    ? "error"
    : issues.some((issue) => issue.level === "warning")
      ? "warning"
      : "ok";

  return {
    bomPresent,
    strayBoms,
    format,
    formatLabel: FORMAT_LABELS[format],
    cueCount,
    lineEnding,
    crlfCount,
    loneLfCount,
    loneCrCount,
    charCount: Array.from(text).length,
    byteLength,
    byteLengthWithoutBom,
    nonAsciiCount,
    mojibakeHits,
    decodedBomVisible,
    firstLine,
    firstLineIsCueNumber,
    issues,
    status,
    // WebVTT is always UTF-8 so the BOM is redundant; SRT with accents often needs it.
    recommendedBom: format === "srt" && nonAsciiCount > 0 ? "add" : "strip",
  };
}

/**
 * Produce the fixed file.
 *
 * @param {object} input
 * @param {string} input.text        - original decoded contents.
 * @param {"add"|"strip"|"keep"} input.bomMode
 * @param {"crlf"|"lf"|"keep"} input.lineEndingMode
 * @param {boolean} [input.removeStrayBoms] - also delete U+FEFF found mid-file.
 * @returns {object} { output, changed, ... } or { error }.
 */
export function transformSubtitle({
  text = "",
  bomMode = "keep",
  lineEndingMode = "keep",
  removeStrayBoms = true,
} = {}) {
  if (typeof text !== "string") return { error: "Subtitle content must be text." };
  if (text.length === 0) return { error: "Paste or open a subtitle file first." };
  if (!["add", "strip", "keep"].includes(bomMode)) {
    return { error: "BOM mode must be add, strip or keep." };
  }
  if (!["crlf", "lf", "keep"].includes(lineEndingMode)) {
    return { error: "Line ending mode must be crlf, lf or keep." };
  }

  const startedWithBom = hasBom(text);
  let body = stripBom(text);
  if (removeStrayBoms) body = stripAllBoms(body);
  if (lineEndingMode !== "keep") body = normalizeLineEndings(body, lineEndingMode);

  const wantBom = bomMode === "add" ? true : bomMode === "strip" ? false : startedWithBom;
  const output = wantBom ? BOM_CHAR + body : body;

  const beforeBytes = utf8ByteLength(text);
  const afterBytes = utf8ByteLength(output);

  return {
    output,
    changed: output !== text,
    startedWithBom,
    endsWithBom: wantBom,
    bomAdded: wantBom && !startedWithBom,
    bomRemoved: !wantBom && startedWithBom,
    beforeBytes,
    afterBytes,
    byteDelta: afterBytes - beforeBytes,
  };
}
