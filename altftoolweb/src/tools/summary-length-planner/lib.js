/**
 * Summary Length Planner — pure logic.
 *
 * Converts a source length and a chosen compression into a target word count,
 * an estimated sentence and paragraph count, a token budget and the reading
 * time saved.
 *
 * No React, no DOM, no Date.now(). Same input -> same output.
 */

/**
 * Silent reading rate for adult non-fiction prose. Brysbaert's 2019
 * meta-analysis of 190 studies put the mean at about 238 words per minute.
 */
export const DEFAULT_READING_WPM = 238;
export const MIN_WPM = 80;
export const MAX_WPM = 1000;

/**
 * OpenAI's published rule of thumb for English: 100 tokens is about 75 words,
 * so tokens are roughly words divided by 0.75.
 */
export const WORDS_PER_TOKEN = 0.75;

/**
 * Plain-English style guidance puts a comfortable average sentence at 15 to 20
 * words; 17 is used here as the midpoint for estimating sentence counts.
 */
export const AVG_SENTENCE_WORDS = 17;
/** Typical body paragraph in business and web prose. */
export const AVG_PARAGRAPH_SENTENCES = 3;

export const MIN_SOURCE_WORDS = 20;
export const MAX_SOURCE_WORDS = 2000000;
export const MIN_TARGET_WORDS = 5;
export const MIN_RATIO_PERCENT = 0.05;
export const MAX_RATIO_PERCENT = 90;

/**
 * Preset lengths. Fixed-word presets follow published conventions: APA style
 * asks for abstracts of 150 to 250 words and many journals cap them at 250,
 * while "an executive summary is about a tenth of the report" is the standard
 * business-writing convention. Percentage presets are conventions, not rules.
 */
export const SUMMARY_PRESETS = [
  { id: "one-line", label: "One-line takeaway", kind: "words", minWords: 15, maxWords: 30 },
  { id: "tldr", label: "TL;DR (2-3 sentences)", kind: "words", minWords: 35, maxWords: 60 },
  { id: "abstract", label: "Academic abstract (APA 150-250 words)", kind: "words", minWords: 150, maxWords: 250 },
  { id: "meta-description", label: "Meta description (155 characters)", kind: "words", minWords: 20, maxWords: 26 },
  { id: "exec-summary", label: "Executive summary (about 10%)", kind: "ratio", percent: 10 },
  { id: "bullet-digest", label: "Bullet digest (about 15%)", kind: "ratio", percent: 15 },
  { id: "condensed", label: "Condensed rewrite (about 30%)", kind: "ratio", percent: 30 },
  { id: "chapter", label: "Chapter or section summary (about 5%)", kind: "ratio", percent: 5 },
  { id: "custom", label: "Custom ratio", kind: "custom" },
];

/**
 * Density bands describing what survives at a given compression. These are the
 * tool's own descriptive bands, not an external standard.
 */
export const DENSITY_BANDS = [
  { minRatio: 30, id: "light", label: "Light edit", note: "most supporting detail and examples survive" },
  { minRatio: 15, id: "condensed", label: "Condensed", note: "arguments survive, examples mostly do not" },
  { minRatio: 5, id: "summary", label: "Summary", note: "claims and conclusions only, one example at most" },
  { minRatio: 1, id: "abstract", label: "Abstract level", note: "purpose, method and finding — nothing else fits" },
  { minRatio: 0, id: "headline", label: "Headline", note: "one idea; expect real information loss" },
];

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

export function countWords(text) {
  const trimmed = String(text || "").trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function densityBandFor(ratioPercent) {
  if (!isFiniteNumber(ratioPercent) || ratioPercent < 0) return null;
  return DENSITY_BANDS.find((band) => ratioPercent >= band.minRatio) || DENSITY_BANDS[DENSITY_BANDS.length - 1];
}

export function formatMinutes(minutes) {
  if (!isFiniteNumber(minutes) || minutes < 0) return "—";
  if (minutes < 1) return "under a minute";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

/** Full plan for one source length and one compression choice. */
export function planSummary(input) {
  const { sourceWords, preset = "exec-summary", ratioPercent, readingWpm = DEFAULT_READING_WPM } = input || {};

  const source = Number(sourceWords);
  if (!isFiniteNumber(source)) return { error: "Enter the source length as a number of words." };
  if (source < MIN_SOURCE_WORDS) {
    return { error: `The source needs at least ${MIN_SOURCE_WORDS} words before a summary plan means anything.` };
  }
  if (source > MAX_SOURCE_WORDS) return { error: "That source length is out of range." };

  const wpm = Number(readingWpm);
  if (!isFiniteNumber(wpm) || wpm < MIN_WPM || wpm > MAX_WPM) {
    return { error: `Reading speed should be between ${MIN_WPM} and ${MAX_WPM} words per minute.` };
  }

  const presetEntry = SUMMARY_PRESETS.find((item) => item.id === preset);
  if (!presetEntry) return { error: "Choose a summary type." };

  let targetWords;
  let targetMin = null;
  let targetMax = null;

  if (presetEntry.kind === "words") {
    targetMin = presetEntry.minWords;
    targetMax = presetEntry.maxWords;
    targetWords = (presetEntry.minWords + presetEntry.maxWords) / 2;
  } else {
    const percent =
      presetEntry.kind === "ratio" ? presetEntry.percent : Number(ratioPercent);
    if (!isFiniteNumber(percent)) return { error: "Enter the compression ratio as a number of percent." };
    if (percent < MIN_RATIO_PERCENT || percent > MAX_RATIO_PERCENT) {
      return { error: `Compression ratio should be between ${MIN_RATIO_PERCENT}% and ${MAX_RATIO_PERCENT}% of the source.` };
    }
    targetWords = (source * percent) / 100;
  }

  if (targetWords >= source) {
    return { error: "That target is not shorter than the source — pick a tighter ratio or a shorter preset." };
  }

  const belowUsable = targetWords < MIN_TARGET_WORDS;
  const effectiveTarget = Math.max(targetWords, MIN_TARGET_WORDS);
  const ratio = (effectiveTarget / source) * 100;
  const band = densityBandFor(ratio);

  const sentences = effectiveTarget / AVG_SENTENCE_WORDS;
  const paragraphs = sentences / AVG_PARAGRAPH_SENTENCES;
  const sourceMinutes = source / wpm;
  const summaryMinutes = effectiveTarget / wpm;

  return {
    sourceWords: source,
    targetWords: effectiveTarget,
    targetMin,
    targetMax,
    belowUsable,
    ratio,
    reductionPercent: 100 - ratio,
    compressionFactor: source / effectiveTarget,
    sentences,
    paragraphs,
    sourceMinutes,
    summaryMinutes,
    savedMinutes: sourceMinutes - summaryMinutes,
    sourceTokens: Math.ceil(source / WORDS_PER_TOKEN),
    targetTokens: Math.ceil(effectiveTarget / WORDS_PER_TOKEN),
    readingWpm: wpm,
    presetLabel: presetEntry.label,
    bandLabel: band.label,
    bandNote: band.note,
  };
}

/** A prompt that pins the assistant to the planned length. */
export function buildSummaryPrompt(plan, options) {
  if (!plan || plan.error) return "";
  const { subject = "", mustKeep = "", audience = "" } = options || {};
  const target = Math.round(plan.targetWords);
  const sentences = Math.max(1, Math.round(plan.sentences));

  return [
    "You are an editor who hits a word count exactly.",
    "",
    `Summarise the text I will paste next${subject.trim() ? ` about ${subject.trim()}` : ""} in ${target} words, plus or minus 10 percent.`,
    "",
    "CONSTRAINTS",
    `- The source is about ${plan.sourceWords} words, so this is ${plan.ratio.toFixed(1)}% of it — roughly a ${plan.compressionFactor.toFixed(1)}x compression.`,
    `- At that compression, expect "${plan.bandLabel.toLowerCase()}" depth: ${plan.bandNote}. Do not try to keep everything.`,
    `- Aim for about ${sentences} sentence${sentences === 1 ? "" : "s"} at an average of ${AVG_SENTENCE_WORDS} words.`,
    audience.trim() ? `- Written for: ${audience.trim()}.` : null,
    mustKeep.trim() ? `- These must survive the cut: ${mustKeep.trim()}.` : null,
    "- Keep every number, name and date you retain exactly as written in the source.",
    "- Do not add framing sentences such as 'this article discusses'. Start with the substance.",
    "- If the source contradicts itself, say so in one clause rather than picking a side.",
    "",
    "OUTPUT FORMAT",
    "The summary only, followed by a single line giving its actual word count.",
  ]
    .filter((line) => line !== null)
    .join("\n");
}
