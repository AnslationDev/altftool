/**
 * SBV (YouTube SubViewer) -> SubRip (.srt) conversion.
 *
 * The SBV format, which YouTube Studio still offers as a caption download:
 *   - No file header and no cue numbers.
 *   - One timing line per cue: "H:MM:SS.mmm,H:MM:SS.mmm". The hour field is a
 *     single digit, and the START and END times are separated by a COMMA, not
 *     by "-->". The fractional separator is a full stop.
 *   - One or more text lines follow, then a blank line ends the cue.
 *   - A speaker change is marked with a leading ">>" (and ">>>" for a new
 *     topic) — a convention inherited from broadcast captioning, not a tag.
 *
 * SubRip differs on every one of those points: cues are numbered from 1, the
 * timestamp is zero-padded to "hh:mm:ss,mmm", the separator is " --> ", and the
 * fractional separator is a comma.
 *
 * Pure module: no DOM, no I/O, no clock reads.
 */

/** Largest timestamp expressible with a two-digit hour field. */
export const MAX_TIMESTAMP_MS = 100 * 3600 * 1000 - 1;

/** An SBV timing line: "H:MM:SS.mmm,H:MM:SS.mmm". */
export const SBV_TIMING_RE =
  /^\s*(\d{1,3}):(\d{1,2}):(\d{1,2})[.,](\d{1,3})\s*,\s*(\d{1,3}):(\d{1,2}):(\d{1,2})[.,](\d{1,3})\s*$/;

/** Broadcast-captioning speaker markers YouTube writes at the start of a line. */
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

/** Format milliseconds as a SubRip timestamp "hh:mm:ss,mmm". */
export function formatSrtTimestamp(ms) {
  if (!Number.isFinite(ms) || ms < 0) return "00:00:00,000";
  const total = Math.round(ms);
  const hours = Math.floor(total / 3600000);
  const minutes = Math.floor((total % 3600000) / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  const millis = total % 1000;
  return (
    `${String(hours).padStart(2, "0")}:` +
    `${String(minutes).padStart(2, "0")}:` +
    `${String(seconds).padStart(2, "0")},` +
    String(millis).padStart(3, "0")
  );
}

/** Parse an SBV document into cues. */
export function parseSbv(raw) {
  const text = normaliseText(raw);
  const lines = text.split("\n");
  const cues = [];
  const issues = [];
  let index = 0;

  while (index < lines.length) {
    if (lines[index].trim() === "") {
      index += 1;
      continue;
    }

    const match = SBV_TIMING_RE.exec(lines[index]);
    if (!match) {
      issues.push(`Line ${index + 1}: skipped a block with no SBV timing line.`);
      while (index < lines.length && lines[index].trim() !== "") index += 1;
      continue;
    }

    const startMs = partsToMs(
      Number(match[1]),
      Number(match[2]),
      Number(match[3]),
      normaliseMillis(match[4]),
    );
    const endMs = partsToMs(
      Number(match[5]),
      Number(match[6]),
      Number(match[7]),
      normaliseMillis(match[8]),
    );

    index += 1;
    const body = [];
    while (index < lines.length && lines[index].trim() !== "") {
      body.push(lines[index]);
      index += 1;
    }

    if (body.length === 0) {
      issues.push(`Cue ${cues.length + 1}: has timings but no text; skipped.`);
      continue;
    }
    if (endMs < startMs) {
      issues.push(`Cue ${cues.length + 1}: end time is before the start time.`);
    }

    cues.push({ startMs, endMs, lines: body });
  }

  return { cues, issues };
}

/**
 * Convert an SBV document to SubRip.
 *
 * @param {string} raw
 * @param {object} [options]
 * @param {number} [options.offsetMs]        Shift every cue by this many ms.
 * @param {boolean} [options.keepSpeakerMarkers] Keep the ">>" / ">>>" prefixes.
 * @param {boolean} [options.mergeLines]     Join a cue's lines into one line.
 */
export function sbvToSrt(raw, options = {}) {
  const { offsetMs = 0, keepSpeakerMarkers = true, mergeLines = false } = options;

  const shift = Number(offsetMs);
  if (!Number.isFinite(shift)) {
    return { error: "Timing offset must be a number of milliseconds." };
  }
  if (Math.abs(shift) > MAX_TIMESTAMP_MS) {
    return { error: "Timing offset is larger than a subtitle timestamp can represent." };
  }
  if (typeof raw !== "string" || raw.trim() === "") {
    return { error: "Paste or upload a YouTube SBV caption file first." };
  }

  const { cues, issues } = parseSbv(raw);
  if (cues.length === 0) {
    return {
      error:
        "No SBV cues found. Each cue needs a timing line like 0:00:01.000,0:00:04.000 with a comma between the two times.",
    };
  }

  const warnings = issues.slice();
  let clamped = 0;
  let speakerChanges = 0;
  const blocks = [];

  cues.forEach((cue, position) => {
    let start = cue.startMs + shift;
    let end = cue.endMs + shift;
    if (start < 0 || end < 0) {
      clamped += 1;
      start = Math.max(0, start);
      end = Math.max(0, end);
    }
    if (end < start) end = start;

    let body = cue.lines.map((line) => {
      if (SPEAKER_MARKER_RE.test(line)) {
        speakerChanges += 1;
        if (!keepSpeakerMarkers) return line.replace(SPEAKER_MARKER_RE, "").trimEnd();
      }
      return line.trimEnd();
    });

    if (mergeLines) body = [body.join(" ").replace(/\s{2,}/g, " ").trim()];

    blocks.push(
      [
        String(position + 1),
        `${formatSrtTimestamp(start)} --> ${formatSrtTimestamp(end)}`,
        ...body,
      ].join("\n"),
    );
  });

  if (clamped > 0) {
    warnings.push(`${clamped} cue(s) would have started before 00:00 and were clamped to zero.`);
  }

  // Overlaps are legal in SBV output from auto-captioning but confuse some players.
  let overlaps = 0;
  for (let i = 1; i < cues.length; i += 1) {
    if (cues[i].startMs < cues[i - 1].endMs) overlaps += 1;
  }
  if (overlaps > 0) {
    warnings.push(`${overlaps} cue(s) overlap the one before them — common in auto-generated captions.`);
  }

  const last = cues[cues.length - 1];
  const srt = `${blocks.join("\n\n")}\n`;

  return {
    srt,
    cueCount: cues.length,
    firstStart: formatSrtTimestamp(Math.max(0, cues[0].startMs + shift)),
    lastEnd: formatSrtTimestamp(Math.max(0, last.endMs + shift)),
    durationMs: Math.max(0, last.endMs - cues[0].startMs),
    lineCount: cues.reduce((sum, cue) => sum + cue.lines.length, 0),
    speakerChanges,
    overlaps,
    warnings,
  };
}
