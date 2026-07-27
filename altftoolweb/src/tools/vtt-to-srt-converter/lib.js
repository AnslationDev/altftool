/**
 * WebVTT (.vtt) -> SubRip (.srt) conversion.
 *
 * Rules implemented, from the W3C WebVTT specification and the de-facto SubRip
 * format:
 *  - A WebVTT file opens with "WEBVTT" (optionally followed by a space/tab and
 *    free text). That line, plus any NOTE, STYLE and REGION blocks, has no
 *    SubRip equivalent and is dropped.
 *  - WebVTT timestamps are "mm:ss.ttt" or "hh:mm:ss.ttt"; the hour field is
 *    optional. SubRip always writes "hh:mm:ss,mmm" with a comma.
 *  - Anything after the end timestamp on a timing line is a cue setting
 *    (vertical, line, position, size, align, region) — SubRip has no
 *    equivalent, so settings are removed. Alignment can optionally be
 *    re-expressed as a SubStation "{\anN}" override, which VLC and MPC honour.
 *  - Cue payload markup: <b>, <i>, <u> survive because SubRip renderers accept
 *    them. Class spans <c.loud>, language spans <lang>, ruby annotations and
 *    karaoke timestamp tags <00:00:01.000> have no SubRip equivalent and are
 *    unwrapped. A voice span <v Ada>text</v> becomes "Ada: text".
 *  - Cue text is HTML-escaped in WebVTT, so &amp; &lt; &gt; &nbsp; &lrm; &rlm;
 *    are decoded back to plain characters.
 *  - SubRip cues are renumbered from 1 regardless of the source cue identifiers.
 *
 * Pure module: no DOM, no I/O, no clock reads.
 */

/** Largest timestamp expressible with a two-digit hour field. */
export const MAX_TIMESTAMP_MS = 100 * 3600 * 1000 - 1;

/** A WebVTT timing line: "[hh:]mm:ss.ttt --> [hh:]mm:ss.ttt [settings]". */
export const VTT_TIMING_RE =
  /^\s*(?:(\d{1,3}):)?(\d{1,2}):(\d{1,2})[.,](\d{1,3})\s*-->\s*(?:(\d{1,3}):)?(\d{1,2}):(\d{1,2})[.,](\d{1,3})\s*(.*)$/;

/** Block headers that carry no cue payload and are dropped entirely. */
export const NON_CUE_BLOCKS = ["NOTE", "STYLE", "REGION"];

/**
 * WebVTT alignment -> SubStation numeric-keypad code.
 * Row comes from the `line` setting, column from `align`.
 * 7 8 9 = top row, 4 5 6 = middle, 1 2 3 = bottom (the SubRip default).
 */
export const ALIGN_TO_AN = {
  "top-left": 7,
  "top-center": 8,
  "top-right": 9,
  "middle-left": 4,
  "middle-center": 5,
  "middle-right": 6,
  "bottom-left": 1,
  "bottom-center": 2,
  "bottom-right": 3,
};

/** Named character references WebVTT permits inside cue text. */
export const VTT_ENTITIES = [
  ["&nbsp;", " "],
  ["&lrm;", "‎"],
  ["&rlm;", "‏"],
  ["&lt;", "<"],
  ["&gt;", ">"],
  ["&quot;", '"'],
  ["&#39;", "'"],
  ["&apos;", "'"],
  ["&amp;", "&"], // must come last so "&amp;lt;" survives as the literal "&lt;"
];

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

/** Decode the character references WebVTT allows in cue text. */
export function decodeEntities(text) {
  let out = text;
  VTT_ENTITIES.forEach(([entity, char]) => {
    out = out.split(entity).join(char);
  });
  return out;
}

/**
 * Read a WebVTT cue-settings string into a SubStation "{\anN}" override.
 * Returns "" when the cue uses the default bottom-centre placement.
 */
export function settingsToAlignTag(settings) {
  if (!settings) return "";
  const lineMatch = /(?:^|\s)line:(-?[\d.]+%?)/.exec(settings);
  const alignMatch = /(?:^|\s)align:(start|left|center|middle|end|right)/.exec(settings);

  let row = "bottom";
  if (lineMatch) {
    const value = lineMatch[1];
    if (value.endsWith("%")) {
      const percent = Number(value.slice(0, -1));
      // Percentages measure from the top of the video box.
      if (percent <= 25) row = "top";
      else if (percent < 75) row = "middle";
    } else {
      const lineNumber = Number(value);
      // Non-negative line numbers count down from the top; negatives from the bottom.
      if (lineNumber >= 0 && lineNumber <= 2) row = "top";
      else if (lineNumber >= 3) row = "middle";
    }
  }

  let column = "center";
  if (alignMatch) {
    const value = alignMatch[1];
    if (value === "start" || value === "left") column = "left";
    else if (value === "end" || value === "right") column = "right";
  }

  const code = ALIGN_TO_AN[`${row}-${column}`];
  return code && code !== 2 ? `{\\an${code}}` : "";
}

/**
 * Reduce WebVTT cue markup to what SubRip renderers understand.
 * @param {string} line
 * @param {boolean} speakerLabels Turn <v Name>…</v> into "Name: …".
 * @param {boolean} keepStyling   Keep <b>/<i>/<u>; otherwise strip all tags.
 */
export function cleanCueText(line, speakerLabels, keepStyling) {
  let text = line;

  // Voice spans: <v Ada Lovelace>Hello</v> or <v.first.loud Ada>Hello</v>
  text = text.replace(/<v(?:\.[^\s>]*)?\s*([^>]*)>/gi, (whole, name) =>
    speakerLabels && name.trim() ? `${name.trim()}: ` : "",
  );
  text = text.replace(/<\/v>/gi, "");

  // Karaoke timestamp tags: <00:00:01.000>
  text = text.replace(/<\d{2,3}:\d{2}:\d{2}[.,]\d{1,3}>/g, "");
  text = text.replace(/<\d{2}:\d{2}[.,]\d{1,3}>/g, "");

  // Class, language and ruby spans have no SubRip equivalent — unwrap them.
  text = text.replace(/<\/?(?:c|lang|ruby|rt)(?:\.[^\s>]*)?(?:\s[^>]*)?>/gi, "");

  if (!keepStyling) {
    text = text.replace(/<\/?[bius](?:\.[^\s>]*)?>/gi, "");
  }

  return decodeEntities(text).trimEnd();
}

/**
 * Parse a WebVTT document into cues, dropping the header and NOTE/STYLE/REGION blocks.
 */
export function parseVtt(raw) {
  const text = normaliseText(raw);
  const lines = text.split("\n");
  const cues = [];
  const issues = [];
  let sawHeader = false;
  let index = 0;

  if (lines.length > 0 && /^\s*WEBVTT(\s|$)/.test(lines[0])) {
    sawHeader = true;
    index = 1;
    // Skip the optional header metadata block up to the first blank line.
    while (index < lines.length && lines[index].trim() !== "") index += 1;
  }

  while (index < lines.length) {
    if (lines[index].trim() === "") {
      index += 1;
      continue;
    }

    const blockHead = lines[index].trim().split(/\s+/)[0];
    if (NON_CUE_BLOCKS.includes(blockHead) && !VTT_TIMING_RE.test(lines[index])) {
      while (index < lines.length && lines[index].trim() !== "") index += 1;
      continue;
    }

    let timingLine = index;
    let identifier = "";
    if (!VTT_TIMING_RE.test(lines[index])) {
      identifier = lines[index].trim();
      timingLine = index + 1;
    }

    const match = timingLine < lines.length ? VTT_TIMING_RE.exec(lines[timingLine]) : null;
    if (!match) {
      issues.push(`Line ${index + 1}: skipped a block with no WebVTT timing line.`);
      while (index < lines.length && lines[index].trim() !== "") index += 1;
      continue;
    }

    const startMs = partsToMs(
      Number(match[1] || 0),
      Number(match[2]),
      Number(match[3]),
      normaliseMillis(match[4]),
    );
    const endMs = partsToMs(
      Number(match[5] || 0),
      Number(match[6]),
      Number(match[7]),
      normaliseMillis(match[8]),
    );
    const settings = (match[9] || "").trim();

    index = timingLine + 1;
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

    cues.push({ identifier, startMs, endMs, settings, lines: body });
  }

  return { cues, issues, sawHeader };
}

/**
 * Convert a WebVTT document to SubRip.
 *
 * @param {string} raw
 * @param {object} [options]
 * @param {number} [options.offsetMs]          Shift every cue by this many ms.
 * @param {boolean} [options.speakerLabels]    Render <v Name> as "Name: ".
 * @param {boolean} [options.keepStyling]      Keep <b>/<i>/<u> tags.
 * @param {boolean} [options.preserveAlignment] Re-express cue settings as {\anN}.
 */
export function vttToSrt(raw, options = {}) {
  const {
    offsetMs = 0,
    speakerLabels = true,
    keepStyling = true,
    preserveAlignment = false,
  } = options;

  const shift = Number(offsetMs);
  if (!Number.isFinite(shift)) {
    return { error: "Timing offset must be a number of milliseconds." };
  }
  if (Math.abs(shift) > MAX_TIMESTAMP_MS) {
    return { error: "Timing offset is larger than a subtitle timestamp can represent." };
  }
  if (typeof raw !== "string" || raw.trim() === "") {
    return { error: "Paste or upload a WebVTT (.vtt) file first." };
  }

  const { cues, issues, sawHeader } = parseVtt(raw);
  if (cues.length === 0) {
    return {
      error:
        "No WebVTT cues found. Each cue needs a timing line like 00:00:01.000 --> 00:00:04.000.",
    };
  }

  const warnings = issues.slice();
  if (!sawHeader) {
    warnings.push("The file did not start with a WEBVTT header — cues were read anyway.");
  }

  let clamped = 0;
  let settingsDropped = 0;
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

    const alignTag = preserveAlignment ? settingsToAlignTag(cue.settings) : "";
    if (cue.settings && !alignTag) settingsDropped += 1;

    const body = cue.lines
      .map((line) => cleanCueText(line, speakerLabels, keepStyling))
      .filter((line, lineIndex, all) => line !== "" || lineIndex < all.length - 1);

    const first = alignTag ? `${alignTag}${body[0] || ""}` : body[0] || "";
    const rest = body.slice(1);

    blocks.push(
      [
        String(position + 1),
        `${formatSrtTimestamp(start)} --> ${formatSrtTimestamp(end)}`,
        first,
        ...rest,
      ].join("\n"),
    );
  });

  if (clamped > 0) {
    warnings.push(`${clamped} cue(s) would have started before 00:00 and were clamped to zero.`);
  }
  if (settingsDropped > 0) {
    warnings.push(`${settingsDropped} cue(s) had positioning settings that SubRip cannot store.`);
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
    warnings,
  };
}
