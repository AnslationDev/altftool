/**
 * Lyric line splitting for karaoke / subtitle display.
 *
 * Character-per-line (CPL) and reading-speed limits follow published timed-text
 * conventions rather than invented numbers:
 *  - Netflix Timed Text Style Guide caps a subtitle line at 42 characters.
 *  - BBC Subtitle Guidelines recommend roughly 37 characters per line.
 *  - Karaoke lines are normally shorter still (28-34) so the singer can read a
 *    whole phrase in one glance, hence the 32-character default.
 */

/** Shortest line limit that is still usable (below this almost every word wraps). */
export const MIN_LINE_LIMIT = 10;

/** Netflix Timed Text Style Guide hard ceiling for one subtitle line. */
export const MAX_LINE_LIMIT = 42;

/** Common karaoke line width - short enough to read in a single glance. */
export const DEFAULT_LINE_LIMIT = 32;

/** Netflix adult reading speed: 17 characters per second. */
export const READING_CHARS_PER_SECOND = 17;

/** Netflix minimum subtitle duration: 5/6 second (20 frames at 24 fps). */
export const MIN_DISPLAY_SECONDS = 5 / 6;

/** Netflix maximum subtitle duration: 7 seconds. */
export const MAX_DISPLAY_SECONDS = 7;

/** Default number of lyric lines shown on screen at once. */
export const DEFAULT_LINES_PER_SCREEN = 2;

/**
 * Punctuation that marks a natural singing breath. A wrapped line is closed
 * early when it already ends with one of these and is long enough to stand alone.
 */
const BREATH_PUNCTUATION = /[,;:!?.—–]["')\]]?$/;

/** Fraction of the limit a line must reach before a punctuation break is honoured. */
const PUNCTUATION_BREAK_RATIO = 0.5;

/** A line shorter than this fraction of the limit is treated as an orphan fragment. */
const ORPHAN_RATIO = 0.5;

/**
 * Minimum seconds a line of `chars` characters must stay on screen,
 * clamped to the published minimum and maximum subtitle durations.
 */
export function minDisplaySeconds(chars) {
  if (!Number.isFinite(chars) || chars <= 0) return MIN_DISPLAY_SECONDS;
  const raw = chars / READING_CHARS_PER_SECOND;
  return Math.min(MAX_DISPLAY_SECONDS, Math.max(MIN_DISPLAY_SECONDS, raw));
}

/** Greedy word wrap with a preference for breaking after breath punctuation. */
export function wrapLine(line, limit) {
  const words = String(line).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const out = [];
  let current = "";

  for (const word of words) {
    if (!current) {
      current = word;
    } else if (current.length + 1 + word.length <= limit) {
      current = `${current} ${word}`;
    } else {
      out.push(current);
      current = word;
    }

    if (
      BREATH_PUNCTUATION.test(current) &&
      current.length >= Math.ceil(limit * PUNCTUATION_BREAK_RATIO)
    ) {
      out.push(current);
      current = "";
    }
  }

  if (current) out.push(current);
  return out;
}

/** Merge an orphan fragment into its neighbour when the pair still fits the limit. */
function mergeOrphans(lines, limit) {
  const orphanLimit = Math.ceil(limit * ORPHAN_RATIO);
  const merged = [];

  for (const line of lines) {
    const previous = merged[merged.length - 1];
    const bothShort = previous && previous.length <= orphanLimit && line.length <= orphanLimit;
    const fits = previous && previous.length + 1 + line.length <= limit;
    if (bothShort && fits) {
      merged[merged.length - 1] = `${previous} ${line}`;
    } else {
      merged.push(line);
    }
  }

  return merged;
}

/**
 * Split raw lyrics into karaoke lines.
 *
 * @param {object} options
 * @param {string} options.text          Raw pasted lyrics.
 * @param {number} options.limit         Maximum characters per output line.
 * @param {boolean} options.mergeShort   Merge consecutive short fragments.
 * @param {boolean} options.keepStanzas  Keep blank-line stanza breaks.
 * @param {number} options.linesPerScreen Lines displayed together.
 * @returns {object} stanzas, flat lines and statistics, or { error }.
 */
export function splitLyrics({
  text,
  limit = DEFAULT_LINE_LIMIT,
  mergeShort = true,
  keepStanzas = true,
  linesPerScreen = DEFAULT_LINES_PER_SCREEN,
} = {}) {
  const source = typeof text === "string" ? text : "";
  if (!source.trim()) {
    return { error: "Paste some lyrics to split." };
  }

  const cpl = Number(limit);
  if (!Number.isFinite(cpl)) {
    return { error: "Characters per line must be a number." };
  }
  if (cpl < MIN_LINE_LIMIT || cpl > MAX_LINE_LIMIT) {
    return {
      error: `Characters per line must be between ${MIN_LINE_LIMIT} and ${MAX_LINE_LIMIT}.`,
    };
  }

  const perScreen = Number(linesPerScreen);
  if (!Number.isFinite(perScreen) || perScreen < 1 || perScreen > 4) {
    return { error: "Lines per screen must be between 1 and 4." };
  }

  const cap = Math.floor(cpl);
  const normalised = source.replace(/\r\n?/g, "\n");
  const blocks = keepStanzas
    ? normalised.split(/\n[ \t]*\n+/)
    : [normalised.replace(/\n[ \t]*\n+/g, "\n")];

  const stanzas = [];
  const flat = [];
  let longest = 0;
  let totalChars = 0;
  let overLimit = 0;
  let totalSeconds = 0;
  let screens = 0;

  for (const block of blocks) {
    let lines = [];
    for (const raw of block.split("\n")) {
      lines = lines.concat(wrapLine(raw, cap));
    }
    if (mergeShort) lines = mergeOrphans(lines, cap);
    if (lines.length === 0) continue;

    const built = lines.map((lineText) => {
      const chars = lineText.length;
      const seconds = minDisplaySeconds(chars);
      longest = Math.max(longest, chars);
      totalChars += chars;
      totalSeconds += seconds;
      if (chars > cap) overLimit += 1;
      const entry = { text: lineText, chars, seconds };
      flat.push(entry);
      return entry;
    });

    screens += Math.ceil(built.length / Math.floor(perScreen));
    stanzas.push({ lines: built });
  }

  if (flat.length === 0) {
    return { error: "No words found in the pasted text." };
  }

  return {
    stanzas,
    lines: flat,
    limit: cap,
    lineCount: flat.length,
    stanzaCount: stanzas.length,
    longestLine: longest,
    averageChars: totalChars / flat.length,
    overLimit,
    totalSeconds,
    screens,
  };
}

/** Render a split result back to plain text, one line per row, blank line per stanza. */
export function formatLyrics(result) {
  if (!result || result.error || !Array.isArray(result.stanzas)) return "";
  return result.stanzas
    .map((stanza) => stanza.lines.map((line) => line.text).join("\n"))
    .join("\n\n");
}
