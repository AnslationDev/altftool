/**
 * YouTube transcript generator.
 *
 * Turns YouTube caption data you already have — the text copied from the
 * "Show transcript" panel, or a downloaded .srt / .vtt / .json3 caption file —
 * into a clean, readable transcript with paragraphs, timestamps and stats.
 *
 * Everything runs on the caption text supplied by the caller: there is no
 * network call here, so the functions are pure and deterministic.
 *
 * Supported inputs
 *  - SubRip (.srt):      "00:00:01,000 --> 00:00:04,000" (comma decimal separator)
 *  - WebVTT (.vtt):      "00:00:01.000 --> 00:00:04.000" (dot decimal separator,
 *                        optional cue settings after the end time, optional
 *                        inline <00:00:01.234><c>word</c> karaoke tags)
 *  - YouTube json3:      { events: [{ tStartMs, dDurationMs, segs: [{ utf8 }] }] }
 *  - Transcript panel:   "0:12" on its own line (or leading the line) + text
 *  - Plain text:         no timing information at all
 */

/**
 * Mean silent reading rate for English non-fiction prose: 238 words per minute.
 * Source: Brysbaert, M. (2019), "How many words do we read per minute?
 * A review and meta-analysis of reading rate", Journal of Memory and Language.
 */
export const READING_WPM = 238;

/**
 * Start a new paragraph when the silence between two caption cues reaches this
 * many seconds. Two seconds is the pause length YouTube's own auto-captioner
 * uses to close a caption group, so it lines up with natural sentence breaks.
 * This is a formatting preference, not a measured constant.
 */
export const DEFAULT_PARAGRAPH_GAP_SECONDS = 2;

/** Hard cap on paragraph length so a monologue without pauses still breaks up. */
export const MAX_PARAGRAPH_WORDS = 90;

/**
 * Speaking rate used only to estimate how long a cue lasts when the source
 * format carries no end time (YouTube's transcript panel shows start times
 * only). 150 words per minute is the middle of the 120-160 wpm range normally
 * quoted for conversational English and presentations.
 */
export const ESTIMATED_SPEAKING_WPM = 150;

/** Allowed range for the user-facing paragraph gap control, in seconds. */
export const MIN_PARAGRAPH_GAP_SECONDS = 0.5;
export const MAX_PARAGRAPH_GAP_SECONDS = 10;

/**
 * Safety cap on pasted input. A three-hour video caption file is roughly
 * 200,000 characters, so 400,000 leaves generous headroom while keeping the
 * browser responsive.
 */
export const MAX_INPUT_CHARS = 400000;

/** Non-speech caption labels such as [Music], [Applause], [Laughter]. */
const SOUND_TAG_RE = /\[[^\]\n]{1,40}\]/g;

/** Whole-cue non-speech labels written with round brackets, e.g. "(upbeat music)". */
const WHOLE_CUE_ROUND_TAG_RE = /^\([^)\n]{1,60}\)$/;

/** WebVTT inline timing / styling tags: <00:00:01.234>, <c>, </c>, <v Speaker>. */
const INLINE_TAG_RE = /<[^>\n]*>/g;

/** A cue-timing line in SRT or WebVTT: "start --> end [cue settings]". */
const ARROW_LINE_RE = /-->/;

/** Timecode shapes: 1:02, 1:02:03, 00:01:02,500, 00:01:02.500 */
const TIMECODE_RE = /^(?:(\d{1,3}):)?(\d{1,2}):(\d{1,2})(?:[.,](\d{1,3}))?$/;

/** A transcript-panel line that begins with a timestamp, e.g. "0:12 hello". */
const PANEL_LINE_RE = /^((?:\d{1,3}:)?\d{1,2}:\d{2})\s*(.*)$/;

/** Seconds per minute / minutes per hour — used by the timecode helpers. */
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;

/**
 * Pull the 11-character video id out of any common YouTube URL shape
 * (watch?v=, youtu.be/, /embed/, /shorts/, /live/).
 *
 * @param {string} url
 * @returns {string|null} the video id, or null when none is present.
 */
export function extractVideoId(url) {
  const value = String(url ?? "").trim();
  if (!value) return null;
  if (/^[\w-]{11}$/.test(value)) return value;
  const match = value.match(
    /(?:youtube\.com\/(?:.*[?&]v=|(?:embed|shorts|live|v|e)\/)|youtu\.be\/)([\w-]{11})/,
  );
  return match ? match[1] : null;
}

/**
 * Parse a timecode string to seconds.
 *
 * @param {string} value
 * @returns {number|null} seconds, or null when the string is not a timecode.
 */
export function parseTimecode(value) {
  const match = String(value ?? "").trim().match(TIMECODE_RE);
  if (!match) return null;
  const hours = match[1] ? Number(match[1]) : 0;
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  const fraction = match[4] ? Number(`0.${match[4]}`) : 0;
  if (!Number.isFinite(hours + minutes + seconds + fraction)) return null;
  return hours * SECONDS_PER_HOUR + minutes * SECONDS_PER_MINUTE + seconds + fraction;
}

/**
 * Format seconds as a timecode.
 *
 * @param {number} totalSeconds
 * @param {{ withHours?: boolean, withMillis?: boolean }} [options]
 * @returns {string}
 */
export function formatTimecode(totalSeconds, options = {}) {
  const safe = Number.isFinite(totalSeconds) && totalSeconds > 0 ? totalSeconds : 0;
  const { withHours = safe >= SECONDS_PER_HOUR, withMillis = false } = options;
  const hours = Math.floor(safe / SECONDS_PER_HOUR);
  const minutes = Math.floor((safe % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const seconds = Math.floor(safe % SECONDS_PER_MINUTE);
  const millis = Math.round((safe - Math.floor(safe)) * 1000);
  const pad = (n, width = 2) => String(n).padStart(width, "0");
  const base = withHours
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${hours * SECONDS_PER_MINUTE + minutes}:${pad(seconds)}`;
  return withMillis ? `${base}.${pad(millis, 3)}` : base;
}

/**
 * Guess which caption format a block of text is in.
 *
 * @param {string} text
 * @returns {"json3"|"srt"|"vtt"|"panel"|"plain"}
 */
export function detectFormat(text) {
  const value = String(text ?? "").trim();
  if (!value) return "plain";
  if (value.startsWith("{") && value.includes("\"events\"")) return "json3";
  if (/^WEBVTT/m.test(value)) return "vtt";
  if (ARROW_LINE_RE.test(value)) {
    // SubRip writes the decimal separator as a comma; WebVTT uses a dot.
    return /\d,\d{3}\s*-->/.test(value) ? "srt" : "vtt";
  }
  const lines = value.split(/\r?\n/).filter((line) => line.trim());
  const stamped = lines.filter((line) => PANEL_LINE_RE.test(line.trim())).length;
  // The panel alternates timestamp and text lines, so roughly a fifth of the
  // lines starting with a timestamp is already a strong signal.
  if (stamped >= 2 && stamped / lines.length >= 0.2) return "panel";
  return "plain";
}

function cleanCueText(raw, { removeSoundTags }) {
  let text = String(raw ?? "").replace(INLINE_TAG_RE, " ");
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
  if (removeSoundTags) {
    text = text.replace(SOUND_TAG_RE, " ");
    if (WHOLE_CUE_ROUND_TAG_RE.test(text.trim())) text = "";
  }
  return text.replace(/\s+/g, " ").trim();
}

function parseArrowCues(text) {
  const lines = String(text).split(/\r?\n/);
  const cues = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (!ARROW_LINE_RE.test(lines[i])) continue;
    const [left, right = ""] = lines[i].split("-->");
    const start = parseTimecode(left);
    const end = parseTimecode(right.trim().split(/\s+/)[0]);
    if (start === null) continue;
    const body = [];
    for (let j = i + 1; j < lines.length; j += 1) {
      if (!lines[j].trim() || ARROW_LINE_RE.test(lines[j])) break;
      body.push(lines[j]);
    }
    cues.push({ start, end: end === null ? null : end, raw: body.join(" ") });
  }
  return cues;
}

function parseJson3Cues(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  if (!data || !Array.isArray(data.events)) return null;
  const cues = [];
  for (const event of data.events) {
    const segs = Array.isArray(event?.segs) ? event.segs : [];
    const raw = segs.map((seg) => String(seg?.utf8 ?? "")).join("");
    if (!raw.trim()) continue;
    const start = Number(event?.tStartMs);
    if (!Number.isFinite(start)) continue;
    const duration = Number(event?.dDurationMs);
    cues.push({
      start: start / 1000,
      end: Number.isFinite(duration) ? (start + duration) / 1000 : null,
      raw,
    });
  }
  return cues;
}

function parsePanelCues(text) {
  const lines = String(text).split(/\r?\n/);
  const cues = [];
  let pending = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const match = trimmed.match(PANEL_LINE_RE);
    if (match) {
      if (pending) cues.push(pending);
      pending = { start: parseTimecode(match[1]) ?? 0, end: null, raw: match[2] };
    } else if (pending) {
      pending.raw = `${pending.raw} ${trimmed}`;
    } else {
      cues.push({ start: null, end: null, raw: trimmed });
    }
  }
  if (pending) cues.push(pending);
  return cues;
}

/**
 * Parse caption text of any supported format into timed cues.
 *
 * @param {string} rawText
 * @param {{ removeSoundTags?: boolean, dedupeRollingCaptions?: boolean }} [options]
 * @returns {{ format: string, cues: Array<{start:number|null,end:number|null,text:string}> } | { error: string }}
 */
export function parseCaptions(rawText, options = {}) {
  const { removeSoundTags = true, dedupeRollingCaptions = true } = options;
  const text = String(rawText ?? "");
  if (!text.trim()) {
    return { error: "Paste caption text or upload a .srt, .vtt or .json3 file to start." };
  }
  if (text.length > MAX_INPUT_CHARS) {
    return {
      error: `That caption file is ${text.length.toLocaleString("en-IN")} characters. This tool handles up to ${MAX_INPUT_CHARS.toLocaleString("en-IN")} at a time.`,
    };
  }

  const format = detectFormat(text);
  let rawCues = null;
  if (format === "json3") rawCues = parseJson3Cues(text);
  else if (format === "srt" || format === "vtt") rawCues = parseArrowCues(text);
  else if (format === "panel") rawCues = parsePanelCues(text);
  else rawCues = [{ start: null, end: null, raw: text }];

  if (!rawCues || rawCues.length === 0) {
    return {
      error:
        "No caption lines were found. Check that the pasted text still has its timestamps, or paste the plain words instead.",
    };
  }

  const cues = [];
  let previousFull = "";
  for (const cue of rawCues) {
    const full = cleanCueText(cue.raw, { removeSoundTags });
    let cleaned = full;
    if (dedupeRollingCaptions && cleaned && previousFull) {
      // YouTube's rolling auto-captions repeat the previous cue at the top of
      // the next one; drop the repeated prefix so words are not counted twice.
      // The comparison uses the previous cue as it arrived, not as it was
      // trimmed, because the repetition accumulates across cues.
      if (cleaned === previousFull) cleaned = "";
      else if (cleaned.startsWith(`${previousFull} `)) {
        cleaned = cleaned.slice(previousFull.length + 1);
      }
    }
    if (full) previousFull = full;
    if (!cleaned) continue;
    cues.push({
      start: Number.isFinite(cue.start) ? cue.start : null,
      end: Number.isFinite(cue.end) ? cue.end : null,
      text: cleaned,
    });
  }

  if (cues.length === 0) {
    return {
      error:
        "Every caption line was empty after cleaning. Turn off “remove [Music] style tags” if the captions are only sound labels.",
    };
  }
  return { format, cues };
}

function countWords(text) {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * End time of a cue: the real one when the caption format supplies it,
 * otherwise the start plus the time those words take at ESTIMATED_SPEAKING_WPM.
 *
 * @param {{start:number|null,end:number|null,text:string}} cue
 * @returns {number|null}
 */
export function estimateCueEnd(cue) {
  if (Number.isFinite(cue?.end)) return cue.end;
  if (!Number.isFinite(cue?.start)) return null;
  const words = countWords(cue.text);
  return cue.start + (words / ESTIMATED_SPEAKING_WPM) * SECONDS_PER_MINUTE;
}

/**
 * Group cues into paragraphs: a new paragraph starts when the silence before a
 * cue reaches gapSeconds, or when the current paragraph reaches
 * MAX_PARAGRAPH_WORDS words.
 *
 * @param {Array<{start:number|null,end:number|null,text:string}>} cues
 * @param {number} gapSeconds
 * @returns {Array<{start:number|null, text:string, words:number}>}
 */
export function groupParagraphs(cues, gapSeconds = DEFAULT_PARAGRAPH_GAP_SECONDS) {
  const gap = Number.isFinite(gapSeconds) ? gapSeconds : DEFAULT_PARAGRAPH_GAP_SECONDS;
  const paragraphs = [];
  let current = null;
  let previousEnd = null;

  for (const cue of cues) {
    const words = countWords(cue.text);
    const silence =
      previousEnd !== null && cue.start !== null ? cue.start - previousEnd : null;
    const shouldBreak =
      current === null ||
      (silence !== null && silence >= gap) ||
      current.words + words > MAX_PARAGRAPH_WORDS;

    if (shouldBreak) {
      if (current) paragraphs.push(current);
      current = { start: cue.start, text: cue.text, words };
    } else {
      current.text = `${current.text} ${cue.text}`;
      current.words += words;
    }
    previousEnd = estimateCueEnd(cue);
  }
  if (current) paragraphs.push(current);
  return paragraphs;
}

/**
 * Render cues back out as a SubRip (.srt) file.
 *
 * @param {Array<{start:number|null,end:number|null,text:string}>} cues
 * @returns {string}
 */
export function toSrt(cues) {
  const rows = Array.isArray(cues) ? cues : [];
  /** Fallback cue length when the source format carried no end time. */
  const FALLBACK_CUE_SECONDS = 3;
  return rows
    .map((cue, index) => {
      const start = Number.isFinite(cue.start) ? cue.start : index * FALLBACK_CUE_SECONDS;
      const end = Number.isFinite(cue.end) && cue.end > start ? cue.end : start + FALLBACK_CUE_SECONDS;
      const stamp = (value) =>
        formatTimecode(value, { withHours: true, withMillis: true }).replace(".", ",");
      return `${index + 1}\n${stamp(start)} --> ${stamp(end)}\n${cue.text}\n`;
    })
    .join("\n");
}

/**
 * Build a clean transcript from raw caption text.
 *
 * @param {object} input
 * @param {string} input.text           caption text in any supported format
 * @param {number} [input.paragraphGapSeconds]
 * @param {boolean} [input.removeSoundTags]
 * @param {boolean} [input.dedupeRollingCaptions]
 * @param {string} [input.url]          optional video URL, used only for labelling
 * @returns {object} transcript result, or { error } when the input cannot be used.
 */
export function generateTranscript({
  text,
  paragraphGapSeconds = DEFAULT_PARAGRAPH_GAP_SECONDS,
  removeSoundTags = true,
  dedupeRollingCaptions = true,
  url = "",
} = {}) {
  const gapValue = Number(paragraphGapSeconds);
  if (!Number.isFinite(gapValue) || gapValue < MIN_PARAGRAPH_GAP_SECONDS || gapValue > MAX_PARAGRAPH_GAP_SECONDS) {
    return {
      error: `Paragraph gap must be between ${MIN_PARAGRAPH_GAP_SECONDS} and ${MAX_PARAGRAPH_GAP_SECONDS} seconds.`,
    };
  }

  const parsed = parseCaptions(text, { removeSoundTags, dedupeRollingCaptions });
  if (parsed.error) return { error: parsed.error };

  const { cues, format } = parsed;
  const paragraphs = groupParagraphs(cues, gapValue).map((paragraph) => ({
    ...paragraph,
    startLabel: paragraph.start === null ? null : formatTimecode(paragraph.start),
  }));

  const plainText = paragraphs.map((paragraph) => paragraph.text).join("\n\n");
  const timestampedText = paragraphs
    .map((paragraph) =>
      paragraph.startLabel ? `[${paragraph.startLabel}] ${paragraph.text}` : paragraph.text,
    )
    .join("\n\n");

  const words = paragraphs.reduce((sum, paragraph) => sum + paragraph.words, 0);
  const characters = plainText.length;

  const timedStarts = cues.filter((cue) => cue.start !== null);
  const firstStart = timedStarts.length ? timedStarts[0].start : null;
  const lastCue = timedStarts.length ? timedStarts[timedStarts.length - 1] : null;
  const lastEnd = lastCue ? estimateCueEnd(lastCue) : null;
  const durationSeconds =
    firstStart !== null && lastEnd !== null && lastEnd > firstStart ? lastEnd - firstStart : 0;

  const readingTimeMinutes = words > 0 ? Math.round((words / READING_WPM) * 10) / 10 : 0;
  const speakingRateWpm =
    durationSeconds > 0 && words > 0
      ? Math.round((words / durationSeconds) * SECONDS_PER_MINUTE)
      : null;

  return {
    format,
    videoId: extractVideoId(url),
    cueCount: cues.length,
    paragraphCount: paragraphs.length,
    words,
    characters,
    durationSeconds,
    durationLabel: durationSeconds > 0 ? formatTimecode(durationSeconds, { withHours: true }) : null,
    readingTimeMinutes,
    speakingRateWpm,
    paragraphs,
    plainText,
    timestampedText,
    srtText: toSrt(cues),
    cues,
  };
}
