/**
 * Cost of turning recorded audio into text, and then into an AI summary.
 *
 * Two very different pricing units are involved:
 *   1. Speech-to-text is billed per minute of AUDIO.
 *   2. A language model summarising that transcript is billed per TOKEN of text.
 * This module converts audio duration into an estimated token count so both can
 * be added up and expressed back per audio minute.
 */

export const MINUTES_PER_HOUR = 60;
export const SECONDS_PER_MINUTE = 60;

/**
 * Tokens per word for English text. The widely used rule of thumb from OpenAI's
 * tokeniser guidance is that one token is roughly 4 characters, or about
 * three-quarters of a word — so words / 0.75 tokens.
 */
export const WORDS_PER_TOKEN = 0.75;

/**
 * Default speaking rate. Ordinary conversational English runs roughly
 * 110-160 words per minute; 150 is the common mid-point used for transcript
 * length estimates. Presentations run slower, fast interviews faster.
 */
export const DEFAULT_WORDS_PER_MINUTE = 150;

export const SPEAKING_RATE_PRESETS = [
  { label: "Slow / dictated", wordsPerMinute: 110 },
  { label: "Presentation", wordsPerMinute: 130 },
  { label: "Conversation", wordsPerMinute: 150 },
  { label: "Fast interview", wordsPerMinute: 180 },
];

/** Tokens are quoted per million by every major provider. */
export const TOKENS_PER_MILLION = 1_000_000;

/** Defensive ceiling so a mistyped duration cannot produce an unreadable result. */
export const MAX_AUDIO_MINUTES = 5_000_000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Convert an audio duration into an estimated transcript word and token count. */
export function estimateTranscriptSize(audioMinutes, wordsPerMinute = DEFAULT_WORDS_PER_MINUTE) {
  if (!isNum(audioMinutes) || audioMinutes < 0) return { error: "Audio duration must be zero or more." };
  if (!isNum(wordsPerMinute) || wordsPerMinute <= 0) return { error: "Speaking rate must be above zero words per minute." };
  const words = audioMinutes * wordsPerMinute;
  const tokens = words / WORDS_PER_TOKEN;
  return { words, tokens };
}

/**
 * @param {object} input
 * @param {number} input.files                    Number of recordings.
 * @param {number} input.minutesPerFile           Length of one recording, in minutes.
 * @param {number} input.sttPricePerAudioMinute   Speech-to-text price per audio minute.
 * @param {boolean} [input.summarise]             Whether an LLM summary is also produced.
 * @param {number} [input.wordsPerMinute]         Speaking rate used to size the transcript.
 * @param {number} [input.promptTokensPerFile]    Fixed system/instruction tokens per file.
 * @param {number} [input.summaryPercent]         Summary length as a % of transcript tokens.
 * @param {number} [input.inputPricePerMillion]   LLM input token price per 1M tokens.
 * @param {number} [input.outputPricePerMillion]  LLM output token price per 1M tokens.
 * @param {number} [input.cleanupMinutesPerAudioHour] Human proofing minutes per audio hour.
 * @param {number} [input.hourlyRate]             Hourly cost of that human.
 * @returns {object} Either { error } or the full cost breakdown.
 */
export function computeTranscriptionCost({
  files,
  minutesPerFile,
  sttPricePerAudioMinute,
  summarise = true,
  wordsPerMinute = DEFAULT_WORDS_PER_MINUTE,
  promptTokensPerFile = 0,
  summaryPercent = 10,
  inputPricePerMillion = 0,
  outputPricePerMillion = 0,
  cleanupMinutesPerAudioHour = 0,
  hourlyRate = 0,
} = {}) {
  const fields = {
    files,
    minutesPerFile,
    sttPricePerAudioMinute,
    wordsPerMinute,
    promptTokensPerFile,
    summaryPercent,
    inputPricePerMillion,
    outputPricePerMillion,
    cleanupMinutesPerAudioHour,
    hourlyRate,
  };
  for (const [key, value] of Object.entries(fields)) {
    if (!isNum(value)) return { error: `Enter a number for every field (${key} is missing or not a number).` };
  }

  if (files <= 0) return { error: "Enter at least one file." };
  if (minutesPerFile <= 0) return { error: "Each file must be longer than zero minutes." };
  if (wordsPerMinute <= 0) return { error: "Speaking rate must be above zero words per minute." };
  if (summaryPercent < 0) return { error: "Summary length cannot be negative." };
  if (summaryPercent > 100) return { error: "A summary longer than the transcript is not a summary — keep it at 100% or below." };
  for (const [key, value] of Object.entries({
    sttPricePerAudioMinute,
    promptTokensPerFile,
    inputPricePerMillion,
    outputPricePerMillion,
    cleanupMinutesPerAudioHour,
    hourlyRate,
  })) {
    if (value < 0) return { error: `${key} cannot be negative.` };
  }

  const totalAudioMinutes = files * minutesPerFile;
  if (totalAudioMinutes > MAX_AUDIO_MINUTES) {
    return { error: "That is more audio than this estimate can usefully model — split it into smaller batches." };
  }

  const totalAudioHours = totalAudioMinutes / MINUTES_PER_HOUR;
  const sttCost = totalAudioMinutes * sttPricePerAudioMinute;

  const size = estimateTranscriptSize(totalAudioMinutes, wordsPerMinute);
  const transcriptWords = size.words;
  const transcriptTokens = size.tokens;

  let inputTokens = 0;
  let outputTokens = 0;
  let llmInputCost = 0;
  let llmOutputCost = 0;
  if (summarise) {
    inputTokens = transcriptTokens + promptTokensPerFile * files;
    outputTokens = (transcriptTokens * summaryPercent) / 100;
    llmInputCost = (inputTokens / TOKENS_PER_MILLION) * inputPricePerMillion;
    llmOutputCost = (outputTokens / TOKENS_PER_MILLION) * outputPricePerMillion;
  }
  const llmCost = llmInputCost + llmOutputCost;

  const cleanupHours = (totalAudioHours * cleanupMinutesPerAudioHour) / MINUTES_PER_HOUR;
  const cleanupCost = cleanupHours * hourlyRate;

  const totalCost = sttCost + llmCost + cleanupCost;

  return {
    files,
    totalAudioMinutes,
    totalAudioHours,
    transcriptWords,
    transcriptTokens,
    inputTokens,
    outputTokens,
    sttCost,
    llmInputCost,
    llmOutputCost,
    llmCost,
    cleanupHours,
    cleanupCost,
    totalCost,
    costPerAudioMinute: totalCost / totalAudioMinutes,
    costPerAudioHour: (totalCost / totalAudioMinutes) * MINUTES_PER_HOUR,
    costPerFile: totalCost / files,
    sttShare: totalCost > 0 ? (sttCost / totalCost) * 100 : 0,
    llmShare: totalCost > 0 ? (llmCost / totalCost) * 100 : 0,
    cleanupShare: totalCost > 0 ? (cleanupCost / totalCost) * 100 : 0,
  };
}

/** Scale the same unit economics up to a monthly audio volume, given in hours. */
export function projectMonthly(result, monthlyAudioHours) {
  if (!result || result.error) return { error: "Fix the inputs above first." };
  if (!isNum(monthlyAudioHours) || monthlyAudioHours <= 0) {
    return { error: "Enter how many audio hours you expect each month." };
  }
  const minutes = monthlyAudioHours * MINUTES_PER_HOUR;
  return {
    monthlyAudioHours,
    monthlyMinutes: minutes,
    monthlyCost: minutes * result.costPerAudioMinute,
    annualCost: minutes * result.costPerAudioMinute * 12,
  };
}
