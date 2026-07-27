/**
 * Teleprompter scroll speed maths.
 *
 * Three chained calculations:
 *   1. Delivery pace      wpm = words / (targetSeconds / 60)
 *   2. Line count         charsPerLine = viewportWidth / (fontSize x meanGlyphWidth)
 *                         lines = sum over paragraphs of ceil(paragraphChars / charsPerLine)
 *   3. Scroll speed       totalScroll = lines x fontSize x lineHeightRatio
 *                         pixelsPerSecond = totalScroll / speakingSeconds
 *                         linesPerMinute  = lines / (speakingSeconds / 60)
 *
 * Pause time for paragraph breaks is subtracted from the runtime first, because the
 * prompter has to be still while the presenter breathes, and the remaining seconds are
 * what the scroll has to cover.
 */

/** Mean glyph advance for a humanist sans in mixed case, as a fraction of font size. */
export const MEAN_GLYPH_WIDTH_RATIO = 0.5;

/** Teleprompter copy is set loose — 1.5 is the usual line height for prompter software. */
export const DEFAULT_LINE_HEIGHT_RATIO = 1.5;

/** A natural breath at a paragraph break. Presenters take roughly this long. */
export const PARAGRAPH_PAUSE_SECONDS = 0.7;

/**
 * Delivery pace bands in words per minute. These are the long-standing working ranges
 * used in broadcast and voiceover: conversational presenting sits around 130-150,
 * scripted broadcast news runs a little quicker, and past about 190 an audience stops
 * being able to take in new information.
 */
export const PACE_BANDS = [
  { id: "slow", label: "Deliberate — technical or emotional material", min: 0, max: 120 },
  { id: "conversational", label: "Conversational presenting", min: 120, max: 150 },
  { id: "broadcast", label: "Broadcast news pace", min: 150, max: 170 },
  { id: "brisk", label: "Brisk — fine for familiar material", min: 170, max: 190 },
  { id: "rushed", label: "Rushed — cut words rather than speed up", min: 190, max: Infinity },
];

/** Prompter type is normally set this large so the presenter can read it at distance. */
export const TYPICAL_PROMPTER_FONT_SIZES = [36, 48, 56, 64, 72, 84, 96];

const isPositive = (value) => Number.isFinite(value) && value > 0;

/** Count words, characters, sentences and paragraphs in a script. */
export function analyseScript(text) {
  const body = String(text || "");
  const trimmed = body.trim();
  const words = trimmed ? (trimmed.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []).length : 0;
  const paragraphs = trimmed ? trimmed.split(/\n\s*\n|\n/).map((p) => p.trim()).filter(Boolean) : [];
  const sentences = trimmed ? (trimmed.match(/[^.!?]+[.!?]+/g) || [trimmed]).length : 0;
  return {
    words,
    characters: body.length,
    charactersNoSpaces: body.replace(/\s/g, "").length,
    sentences,
    paragraphs,
    paragraphCount: paragraphs.length,
  };
}

/** Words per minute needed to deliver a script in a given number of seconds. */
export function requiredWpm(words, seconds) {
  const w = Number(words);
  const s = Number(seconds);
  if (!Number.isFinite(w) || w < 0 || !isPositive(s)) return null;
  return (w / s) * 60;
}

/** Seconds a script takes at a chosen pace. */
export function durationForWpm(words, wpm) {
  const w = Number(words);
  const rate = Number(wpm);
  if (!Number.isFinite(w) || w < 0 || !isPositive(rate)) return null;
  return (w / rate) * 60;
}

/** Which pace band a words-per-minute figure falls into. */
export function paceBand(wpm) {
  const rate = Number(wpm);
  if (!Number.isFinite(rate) || rate < 0) return null;
  return PACE_BANDS.find((band) => rate >= band.min && rate < band.max) || PACE_BANDS[PACE_BANDS.length - 1];
}

/** Characters that fit on one prompter line at a given width and type size. */
export function charactersPerLine({ viewportWidthPx, fontSizePx, glyphRatio = MEAN_GLYPH_WIDTH_RATIO }) {
  const width = Number(viewportWidthPx);
  const size = Number(fontSizePx);
  if (!isPositive(width) || !isPositive(size) || !isPositive(glyphRatio)) return null;
  return Math.max(1, Math.floor(width / (size * glyphRatio)));
}

/**
 * Lines the script occupies once wrapped, counting each paragraph separately because a
 * paragraph break always starts a new line.
 */
export function estimateLineCount({ text, viewportWidthPx, fontSizePx, glyphRatio = MEAN_GLYPH_WIDTH_RATIO }) {
  const perLine = charactersPerLine({ viewportWidthPx, fontSizePx, glyphRatio });
  if (perLine === null) return null;
  const { paragraphs } = analyseScript(text);
  if (paragraphs.length === 0) return 0;
  return paragraphs.reduce((total, paragraph) => total + Math.max(1, Math.ceil(paragraph.length / perLine)), 0);
}

/**
 * Full scroll plan.
 *
 * @param {object} input
 * @param {string} input.text the script
 * @param {number} input.targetSeconds required runtime
 * @param {number} input.viewportWidthPx readable width of the prompter text column
 * @param {number} input.fontSizePx prompter type size
 * @param {number} [input.lineHeightRatio]
 * @param {boolean} [input.allowParagraphPauses] subtract a breath at each paragraph break
 * @returns {object} plan, or { error }
 */
export function scrollPlan(input = {}) {
  const script = analyseScript(input.text);
  if (script.words === 0) return { error: "Paste the script so it can be counted." };

  const targetSeconds = Number(input.targetSeconds);
  if (!isPositive(targetSeconds)) return { error: "Target runtime must be greater than zero seconds." };

  const fontSizePx = Number(input.fontSizePx);
  const viewportWidthPx = Number(input.viewportWidthPx);
  if (!isPositive(fontSizePx)) return { error: "Font size must be greater than zero." };
  if (!isPositive(viewportWidthPx)) return { error: "Prompter text width must be greater than zero." };

  const lineHeightRatio = isPositive(Number(input.lineHeightRatio)) ? Number(input.lineHeightRatio) : DEFAULT_LINE_HEIGHT_RATIO;
  const allowPauses = input.allowParagraphPauses !== false;

  const pauseSeconds = allowPauses ? Math.max(0, script.paragraphCount - 1) * PARAGRAPH_PAUSE_SECONDS : 0;
  const speakingSeconds = targetSeconds - pauseSeconds;
  if (speakingSeconds <= 0) {
    return { error: `Paragraph breaks alone account for ${pauseSeconds.toFixed(1)} seconds, which is the whole runtime. Lengthen the target or turn pauses off.` };
  }

  const wpm = requiredWpm(script.words, speakingSeconds);
  const band = paceBand(wpm);

  const perLine = charactersPerLine({ viewportWidthPx, fontSizePx });
  const lines = estimateLineCount({ text: input.text, viewportWidthPx, fontSizePx });
  const lineHeightPx = fontSizePx * lineHeightRatio;
  const totalScrollPx = lines * lineHeightPx;
  const pixelsPerSecond = totalScrollPx / speakingSeconds;
  const linesPerMinute = (lines / speakingSeconds) * 60;
  const secondsPerLine = lines > 0 ? speakingSeconds / lines : null;

  const notes = [];
  if (band && band.id === "rushed") {
    const comfortable = durationForWpm(script.words, 150);
    notes.push(
      `At ${Math.round(wpm)} words per minute this is too fast to take in. The same script at a broadcast pace of 150 wpm would run ${Math.round(comfortable)} seconds — cut about ${Math.max(0, Math.round(script.words - (150 * speakingSeconds) / 60))} words instead.`,
    );
  }
  if (band && band.id === "slow" && wpm < 90) {
    notes.push("Under 90 words per minute the prompter will feel like it has stalled. Either add material or shorten the runtime.");
  }
  if (perLine !== null && perLine < 25) {
    notes.push(`Only about ${perLine} characters fit per line, so the presenter's eyes will travel constantly. Widen the text column or reduce the font size.`);
  }
  if (perLine !== null && perLine > 60) {
    notes.push(`About ${perLine} characters per line is wide for a prompter — long lines are harder to track. Narrow the column or increase the font size.`);
  }

  return {
    script,
    targetSeconds,
    pauseSeconds,
    speakingSeconds,
    wpm,
    band,
    charactersPerLine: perLine,
    lines,
    lineHeightPx,
    totalScrollPx,
    pixelsPerSecond,
    linesPerMinute,
    secondsPerLine,
    wordsPerSecond: script.words / speakingSeconds,
    durationAtConversational: durationForWpm(script.words, 140),
    durationAtBroadcast: durationForWpm(script.words, 160),
    notes,
  };
}

/** Seconds as m:ss. */
export function formatDuration(seconds) {
  const total = Number(seconds);
  if (!Number.isFinite(total) || total < 0) return "—";
  const whole = Math.round(total);
  const minutes = Math.floor(whole / 60);
  return `${minutes}:${String(whole % 60).padStart(2, "0")}`;
}
