/**
 * SubRip (.srt) -> plain-text transcript.
 *
 * The conversion removes everything that only exists to drive a caption
 * renderer, then re-flows the surviving words into paragraphs:
 *
 *  - Cue numbers and "hh:mm:ss,mmm --> hh:mm:ss,mmm" timing lines are dropped.
 *  - Inline markup is removed: HTML-ish tags (<i>, <b>, <font ...>) and
 *    SubStation override blocks such as {\an8} or {\pos(320,240)}.
 *  - Non-speech captions are optional. The captioning convention (FCC and BBC
 *    subtitle guidelines) is that non-speech sound is written inside square
 *    brackets — [MUSIC], [door slams] — and music is marked with the ♪ symbol,
 *    so those are detected and can be stripped.
 *  - Scrolling/roll-up captions repeat the last line in the next cue; identical
 *    consecutive lines can be de-duplicated.
 *  - A new paragraph starts when the silence between two cues is longer than
 *    the paragraph gap, which is what a natural pause in speech looks like in
 *    the timings.
 *
 * Pure module: no DOM, no I/O, no clock reads.
 */

/**
 * Adult silent-reading rate for English non-fiction prose, in words per minute.
 * 238 wpm is the mean reported by Brysbaert's 2019 meta-analysis of 190 reading
 * studies (Journal of Memory and Language), and is used here for reading time.
 */
export const AVERAGE_SILENT_READING_WPM = 238;

/** Default silence, in milliseconds, that starts a new transcript paragraph. */
export const DEFAULT_PARAGRAPH_GAP_MS = 2000;

/** Bounds accepted for the paragraph gap control. */
export const MIN_PARAGRAPH_GAP_MS = 0;
export const MAX_PARAGRAPH_GAP_MS = 60000;

/** A SubRip timing line, e.g. "00:00:01,000 --> 00:00:04,000". */
export const SRT_TIMING_RE =
  /^\s*(\d{1,3}:)?(\d{1,2}):(\d{1,2})[,.](\d{1,3})\s*-->\s*(\d{1,3}:)?(\d{1,2}):(\d{1,2})[,.](\d{1,3})(.*)$/;

/** A whole line that is a non-speech caption: [MUSIC], (laughter), ♪ ♪ */
export const SOUND_CUE_LINE_RE = /^\s*(?:[[(].*[\])]|♪.*♪?|.*♪)\s*$/;

/** Broadcast-captioning speaker-change markers. */
export const SPEAKER_MARKER_RE = /^\s*(>>>|>>)\s*/;

/** Strip a UTF-8 BOM and normalise CRLF / lone CR line endings to LF. */
export function normaliseText(raw) {
  if (typeof raw !== "string") return "";
  return raw.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
}

/** Convert h/m/s/ms parts to a millisecond total. */
export function partsToMs(hours, minutes, seconds, millis) {
  return hours * 3600000 + minutes * 60000 + seconds * 1000 + millis;
}

function normaliseMillis(fragment) {
  return Number(String(fragment).padEnd(3, "0").slice(0, 3));
}

/** Format milliseconds as "hh:mm:ss" for a paragraph timestamp. */
export function formatClock(ms) {
  if (!Number.isFinite(ms) || ms < 0) return "00:00:00";
  const total = Math.floor(ms / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

/** Remove caption markup that has no meaning in prose. */
export function stripMarkup(line) {
  return line
    .replace(/\{\\[^}]*\}/g, "") // SubStation overrides: {\an8}, {\pos(..)}
    .replace(/<[^<>]*>/g, "") // <i>, <b>, <font color=...>
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/** True when a line is a non-speech caption rather than dialogue. */
export function isSoundCue(line) {
  const trimmed = line.trim();
  if (trimmed === "") return false;
  return SOUND_CUE_LINE_RE.test(trimmed);
}

/** Count words the way a word processor does: runs of non-whitespace. */
export function countWords(text) {
  const trimmed = String(text).trim();
  if (trimmed === "") return 0;
  return trimmed.split(/\s+/).length;
}

/** Parse a SubRip document into cues. */
export function parseSrt(raw) {
  const text = normaliseText(raw);
  const lines = text.split("\n");
  const cues = [];
  let index = 0;

  while (index < lines.length) {
    if (lines[index].trim() === "") {
      index += 1;
      continue;
    }

    let timingLine = index;
    if (!SRT_TIMING_RE.test(lines[index]) && /^\s*\d+\s*$/.test(lines[index])) {
      timingLine = index + 1;
    }

    const match = timingLine < lines.length ? SRT_TIMING_RE.exec(lines[timingLine]) : null;
    if (!match) {
      while (index < lines.length && lines[index].trim() !== "") index += 1;
      continue;
    }

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

    index = timingLine + 1;
    const body = [];
    while (index < lines.length && lines[index].trim() !== "") {
      // A source SRT missing the blank line between cues would otherwise have
      // the next cue's index number and raw timing line swallowed as if they
      // were part of this cue's dialogue. Recognise the start of the next cue
      // the same way the outer loop does, and stop before consuming it.
      const looksLikeNextCueNumber =
        /^\s*\d+\s*$/.test(lines[index]) &&
        index + 1 < lines.length &&
        SRT_TIMING_RE.test(lines[index + 1]);
      const looksLikeNextCueTiming = SRT_TIMING_RE.test(lines[index]);
      if (looksLikeNextCueNumber || looksLikeNextCueTiming) break;
      body.push(lines[index]);
      index += 1;
    }
    if (body.length > 0) cues.push({ startMs, endMs, lines: body });
  }

  return { cues };
}

/**
 * Turn a SubRip file into a readable transcript.
 *
 * @param {string} raw
 * @param {object} [options]
 * @param {number}  [options.paragraphGapMs]  Silence that starts a new paragraph.
 * @param {boolean} [options.removeSoundCues] Drop [MUSIC] / ♪ style non-speech lines.
 * @param {boolean} [options.dedupeLines]     Collapse repeated roll-up caption lines.
 * @param {boolean} [options.keepSpeakerMarkers] Keep ">>" speaker-change markers.
 * @param {boolean} [options.includeTimestamps] Prefix each paragraph with [hh:mm:ss].
 */
export function srtToTranscript(raw, options = {}) {
  const {
    paragraphGapMs = DEFAULT_PARAGRAPH_GAP_MS,
    removeSoundCues = true,
    dedupeLines = true,
    keepSpeakerMarkers = false,
    includeTimestamps = false,
  } = options;

  const gap = Number(paragraphGapMs);
  if (!Number.isFinite(gap)) {
    return { error: "Paragraph gap must be a number of milliseconds." };
  }
  if (gap < MIN_PARAGRAPH_GAP_MS || gap > MAX_PARAGRAPH_GAP_MS) {
    return {
      error: `Paragraph gap must be between ${MIN_PARAGRAPH_GAP_MS} and ${MAX_PARAGRAPH_GAP_MS} milliseconds.`,
    };
  }
  if (typeof raw !== "string" || raw.trim() === "") {
    return { error: "Paste or upload a SubRip (.srt) file first." };
  }

  const { cues } = parseSrt(raw);
  if (cues.length === 0) {
    return {
      error:
        "No SubRip cues found. Each cue needs a timing line like 00:00:01,000 --> 00:00:04,000.",
    };
  }

  const paragraphs = [];
  let current = null;
  let previousLine = "";
  let soundCuesRemoved = 0;
  let duplicatesRemoved = 0;
  let usedCues = 0;
  // Track the span of only the cues that actually survived filtering, so a
  // filtered-out [MUSIC]/non-speech cue at the start or end of the file does
  // not stretch the runtime used for the speaking-rate calculation.
  let firstUsedStartMs = null;
  let lastUsedEndMs = null;

  cues.forEach((cue, position) => {
    const kept = [];
    cue.lines.forEach((rawLine) => {
      let line = stripMarkup(rawLine);
      if (removeSoundCues) {
        if (isSoundCue(line)) {
          soundCuesRemoved += 1;
          return;
        }
        // Inline non-speech descriptions, e.g. "We're back [applause] after this."
        line = line.replace(/\[[^\]]*\]/g, " ");
      }
      if (!keepSpeakerMarkers) line = line.replace(SPEAKER_MARKER_RE, "");
      line = line.replace(/\s{2,}/g, " ").trim();
      if (line === "") return;
      if (dedupeLines && line === previousLine) {
        duplicatesRemoved += 1;
        return;
      }
      previousLine = line;
      kept.push(line);
    });

    if (kept.length === 0) return;
    usedCues += 1;
    if (firstUsedStartMs === null) firstUsedStartMs = cue.startMs;
    lastUsedEndMs = cue.endMs;

    const silenceBefore = position === 0 ? Infinity : cue.startMs - cues[position - 1].endMs;
    if (current === null || silenceBefore > gap) {
      current = { startMs: cue.startMs, parts: [] };
      paragraphs.push(current);
    }
    kept.forEach((line) => current.parts.push(line));
  });

  if (paragraphs.length === 0) {
    return { error: "Every cue was filtered out — try turning off the sound-cue filter." };
  }

  const blocks = paragraphs.map((paragraph) => {
    const body = paragraph.parts.join(" ").replace(/\s{2,}/g, " ").trim();
    return includeTimestamps ? `[${formatClock(paragraph.startMs)}] ${body}` : body;
  });

  const transcript = `${blocks.join("\n\n")}\n`;
  // The [hh:mm:ss] prefix is navigation, not speech, so it never counts as a word.
  const wordCount = paragraphs.reduce(
    (sum, paragraph) => sum + countWords(paragraph.parts.join(" ")),
    0,
  );

  // paragraphs.length > 0 (checked above) guarantees at least one cue was kept,
  // so firstUsedStartMs/lastUsedEndMs are set here.
  const durationMs = Math.max(0, lastUsedEndMs - firstUsedStartMs);
  const durationMinutes = durationMs / 60000;

  return {
    transcript,
    wordCount,
    charCount: transcript.trim().length,
    cueCount: cues.length,
    usedCues,
    paragraphCount: paragraphs.length,
    durationMs,
    // Words actually spoken per minute of runtime, from the cue timings.
    speakingRateWpm: durationMinutes > 0 ? Math.round(wordCount / durationMinutes) : 0,
    readingTimeMinutes: Math.round((wordCount / AVERAGE_SILENT_READING_WPM) * 10) / 10,
    soundCuesRemoved,
    duplicatesRemoved,
  };
}
