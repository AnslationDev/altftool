/**
 * SubRip (.srt) -> WebVTT (.vtt) conversion.
 *
 * Rules implemented, from the W3C WebVTT specification:
 *  - A WebVTT file must begin with the string "WEBVTT" (an optional UTF-8 BOM
 *    may precede it, but emitting a BOM-free file is safest for <track src>).
 *  - Timestamps are "mm:ss.ttt" or "hh:mm:ss.ttt". The fractional separator is
 *    a FULL STOP; SubRip uses a COMMA, which is the main change on conversion.
 *  - Blocks are separated by a blank line; an optional cue identifier line may
 *    sit above the timing line.
 *  - Cue settings (line/position/align/size) go on the timing line, after the
 *    end timestamp, separated by spaces.
 *  - "&" and "<" are markup-significant in cue text and must be escaped as
 *    "&amp;" and "&lt;" when they are not part of an entity or a valid tag.
 *
 * Pure module: no DOM, no I/O, no clock reads.
 */

/** Largest timestamp WebVTT can express with a two-digit hour field. */
export const MAX_TIMESTAMP_MS = 100 * 3600 * 1000 - 1;

/** A SubRip timing line, e.g. "00:00:01,000 --> 00:00:04,000". */
export const SRT_TIMING_RE =
  /^\s*(\d{1,3}:)?(\d{1,2}):(\d{1,2})[,.](\d{1,3})\s*-->\s*(\d{1,3}:)?(\d{1,2}):(\d{1,2})[,.](\d{1,3})(.*)$/;

/**
 * SubStation "\anN" alignment overrides sometimes embedded in SubRip text.
 * N follows the numeric keypad: 1 bottom-left ... 9 top-right.
 * Mapped to the equivalent WebVTT cue settings.
 *   line:0   = first line box (top), line:-1 = last line box (bottom, default)
 *   line:50% = vertically centred
 */
export const ALIGN_TAG_SETTINGS = {
  1: "line:-1 align:left",
  2: "line:-1 align:center",
  3: "line:-1 align:right",
  4: "line:50% align:left",
  5: "line:50% align:center",
  6: "line:50% align:right",
  7: "line:0 align:left",
  8: "line:0 align:center",
  9: "line:0 align:right",
};

/** Inline tags WebVTT understands natively and that pass through untouched. */
export const VTT_SAFE_TAGS = ["b", "i", "u", "ruby", "rt", "v", "c", "lang"];

/** Strip a UTF-8 BOM and normalise CRLF / lone CR line endings to LF. */
export function normaliseText(raw) {
  if (typeof raw !== "string") return "";
  return raw.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
}

/** Convert h/m/s/ms parts to a millisecond total. */
export function partsToMs(hours, minutes, seconds, millis) {
  return hours * 3600000 + minutes * 60000 + seconds * 1000 + millis;
}

/** Pad the millisecond field, which SubRip files sometimes truncate to 1-2 digits. */
function normaliseMillis(fragment) {
  return Number(String(fragment).padEnd(3, "0").slice(0, 3));
}

/** Format milliseconds as a WebVTT timestamp "hh:mm:ss.ttt". */
export function formatVttTimestamp(ms) {
  if (!Number.isFinite(ms) || ms < 0) return "00:00:00.000";
  const total = Math.round(ms);
  const hours = Math.floor(total / 3600000);
  const minutes = Math.floor((total % 3600000) / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  const millis = total % 1000;
  return (
    `${String(hours).padStart(2, "0")}:` +
    `${String(minutes).padStart(2, "0")}:` +
    `${String(seconds).padStart(2, "0")}.` +
    String(millis).padStart(3, "0")
  );
}

/**
 * Escape the characters WebVTT treats as markup, leaving real tags and
 * existing HTML entities alone.
 *
 * A *bare* safe-tag name with no class/voice payload — a lone "<c>" or "<v>" —
 * is ambiguous: ordinary prose can sandwich single-letter tokens (b, i, u, v,
 * c are common variable names and text-speak) between stray "<"/">" symbols.
 * Only trust a bare tag when a matching closing tag is present elsewhere on
 * the line; a tag carrying a class or voice-name payload (e.g. "<c.loud>",
 * "<v Roger Bingham>") is unambiguous on its own and needs no closing pair.
 */
export function escapeCueText(line) {
  const tagPattern = new RegExp(`^/?(?:${VTT_SAFE_TAGS.join("|")})(?:[.\\s][^<>]*)?$`, "i");
  const closingTagNames = new Set(
    Array.from(line.matchAll(/<\/([^<>\s.]+)[^<>]*>/g), (m) => m[1].toLowerCase()),
  );

  return line
    // "&" that does not already start an entity such as &amp; or &#39;
    .replace(/&(?!(?:[a-zA-Z][a-zA-Z0-9]{1,8}|#\d{1,6}|#x[0-9a-fA-F]{1,6});)/g, "&amp;")
    // "<" that does not open a tag WebVTT understands
    .replace(/<([^<>]*)>|</g, (match, inner) => {
      if (inner === undefined) return "&lt;";
      const trimmed = inner.trim();
      if (!tagPattern.test(trimmed)) return `&lt;${inner}&gt;`;

      const isClosingTag = trimmed.startsWith("/");
      const bareName = trimmed.replace(/^\//, "");
      const hasPayload = /[.\s]/.test(bareName);
      const trusted = isClosingTag || hasPayload || closingTagNames.has(bareName.toLowerCase());
      return trusted ? `<${inner}>` : `&lt;${inner}&gt;`;
    });
}

/**
 * Parse a SubRip document into cues.
 * Tolerates missing cue numbers, extra blank lines and "." used in place of ",".
 */
export function parseSrt(raw) {
  const text = normaliseText(raw);
  const lines = text.split("\n");
  const cues = [];
  const issues = [];

  let index = 0;
  // Increments once per parse *attempt* — success or failure — so a warning
  // never ends up pointing at whichever different cue later happens to take
  // the same "cues.length + 1" slot after a skip.
  let attemptIndex = 0;
  while (index < lines.length) {
    if (lines[index].trim() === "") {
      index += 1;
      continue;
    }

    let timingLine = index;
    let originalNumber = null;
    // A bare number on its own line is the SubRip cue counter; the timing line follows.
    if (!SRT_TIMING_RE.test(lines[index]) && /^\s*\d+\s*$/.test(lines[index])) {
      originalNumber = Number(lines[index].trim());
      timingLine = index + 1;
    }

    const match = timingLine < lines.length ? SRT_TIMING_RE.exec(lines[timingLine]) : null;
    if (!match) {
      issues.push(`Line ${index + 1}: skipped text that is not a SubRip timing line.`);
      while (index < lines.length && lines[index].trim() !== "") index += 1;
      continue;
    }

    attemptIndex += 1;
    // Prefer the cue number actually written in the source SRT — it's what
    // the user sees when they cross-reference a warning against their file —
    // falling back to the attempt position only when the source has none.
    const cueLabel = originalNumber ?? attemptIndex;

    const startMs = partsToMs(
      Number((match[1] || "0:").slice(0, -1)),
      Number(match[2]),
      Number(match[3]),
      normaliseMillis(match[4]),
    );
    const endMs = partsToMs(
      Number((match[5] || "0:").slice(0, -1)),
      Number(match[6]),
      Number(match[7]),
      normaliseMillis(match[8]),
    );

    // Legacy SubRip coordinate block, e.g. "X1:100 X2:600 Y1:400 Y2:440".
    const trailing = (match[9] || "").trim();
    if (trailing) {
      issues.push(
        `Cue ${cueLabel}: dropped SubRip coordinates "${trailing}" — WebVTT uses line/position settings instead.`,
      );
    }

    index = timingLine + 1;
    const body = [];
    while (index < lines.length && lines[index].trim() !== "") {
      body.push(lines[index]);
      index += 1;
    }

    if (body.length === 0) {
      issues.push(`Cue ${cueLabel}: has timings but no text; skipped.`);
      continue;
    }
    if (endMs < startMs) {
      issues.push(`Cue ${cueLabel}: end time is before the start time.`);
    }

    // Preserve the SRT's own cue number when it had one; only synthesize a
    // dense sequential id (matching prior behaviour) for counterless files.
    cues.push({ number: originalNumber ?? cues.length + 1, startMs, endMs, lines: body });
  }

  return { cues, issues };
}

/**
 * Convert a SubRip document to WebVTT.
 *
 * @param {string} raw                 SubRip file contents.
 * @param {object} [options]
 * @param {number} [options.offsetMs]        Shift every cue by this many ms (may be negative).
 * @param {boolean} [options.keepCueNumbers] Emit the cue number as a WebVTT cue identifier.
 * @param {boolean} [options.convertAlignTags] Turn "{\anN}" into WebVTT cue settings.
 * @param {boolean} [options.stripFontTags]  Remove <font ...> tags, which WebVTT does not support.
 */
export function srtToVtt(raw, options = {}) {
  const {
    offsetMs = 0,
    keepCueNumbers = true,
    convertAlignTags = true,
    stripFontTags = true,
  } = options;

  const shift = Number(offsetMs);
  if (!Number.isFinite(shift)) {
    return { error: "Timing offset must be a number of milliseconds." };
  }
  if (Math.abs(shift) > MAX_TIMESTAMP_MS) {
    return { error: "Timing offset is larger than WebVTT can represent." };
  }
  if (typeof raw !== "string" || raw.trim() === "") {
    return { error: "Paste or upload a SubRip (.srt) file first." };
  }

  const { cues, issues } = parseSrt(raw);
  if (cues.length === 0) {
    return {
      error:
        "No SubRip cues found. Each cue needs a timing line like 00:00:01,000 --> 00:00:04,000.",
    };
  }

  const warnings = issues.slice();
  let clamped = 0;
  const out = ["WEBVTT", ""];

  cues.forEach((cue) => {
    let start = cue.startMs + shift;
    let end = cue.endMs + shift;
    if (start < 0 || end < 0) {
      clamped += 1;
      start = Math.max(0, start);
      end = Math.max(0, end);
    }
    if (end < start) end = start;

    let settings = "";
    const body = cue.lines.map((line) => {
      let text = line;
      if (convertAlignTags) {
        text = text.replace(/\{\\an([1-9])\}/g, (whole, digit) => {
          if (!settings) settings = ALIGN_TAG_SETTINGS[digit];
          return "";
        });
      }
      // Any other SubStation override block is meaningless in WebVTT.
      text = text.replace(/\{\\[^}]*\}/g, "");
      if (stripFontTags) text = text.replace(/<\/?font[^>]*>/gi, "");
      return escapeCueText(text).trimEnd();
    });

    const timing =
      `${formatVttTimestamp(start)} --> ${formatVttTimestamp(end)}` +
      (settings ? ` ${settings}` : "");

    if (keepCueNumbers) out.push(String(cue.number));
    out.push(timing);
    body.forEach((line) => out.push(line));
    out.push("");
  });

  if (clamped > 0) {
    warnings.push(`${clamped} cue(s) would have started before 00:00 and were clamped to zero.`);
  }

  const last = cues[cues.length - 1];
  return {
    vtt: out.join("\n"),
    cueCount: cues.length,
    firstStart: formatVttTimestamp(Math.max(0, cues[0].startMs + shift)),
    lastEnd: formatVttTimestamp(Math.max(0, last.endMs + shift)),
    durationMs: Math.max(0, last.endMs - cues[0].startMs),
    lineCount: cues.reduce((sum, cue) => sum + cue.lines.length, 0),
    warnings,
  };
}
