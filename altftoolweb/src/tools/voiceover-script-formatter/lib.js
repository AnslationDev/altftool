/**
 * Voiceover script formatter.
 *
 * Turns raw prose into numbered narration blocks. A block never breaks in the middle of a
 * sentence unless that single sentence is longer than the block limit, in which case it is
 * broken at clause punctuation (comma, semicolon, colon, dash) instead.
 *
 * Timing uses the standard words-per-minute model: seconds = words / wpm * 60.
 * Anything inside square brackets is treated as a stage direction — it is shown but not
 * counted as spoken words, because the narrator does not read it aloud.
 */

/**
 * Default narration pace. Audiobook and e-learning narration is commonly delivered at
 * 150-160 finished words per minute; 150 is the conservative middle used here.
 */
export const DEFAULT_WORDS_PER_MINUTE = 150;

/** Seconds in a minute — used to convert the wpm pace into a per-block duration. */
export const SECONDS_PER_MINUTE = 60;

/** Practical block-length limits: below 5 words a cue is not worth numbering, above 120 it stops being readable on a stand. */
export const MIN_WORDS_PER_BLOCK = 5;
export const MAX_WORDS_PER_BLOCK = 120;

/** Pace range accepted. Under 80 wpm is slower than any human read; over 260 wpm is beyond intelligible speech. */
export const MIN_WPM = 80;
export const MAX_WPM = 260;

/**
 * Words that end in a full stop but do not end a sentence. Without this list a script
 * containing "Dr. Rao" would be split into two cues.
 */
export const NON_TERMINAL_ABBREVIATIONS = new Set([
  "mr", "mrs", "ms", "dr", "prof", "sr", "jr", "st", "vs", "etc", "eg", "ie",
  "approx", "inc", "ltd", "co", "fig", "vol", "dept", "govt",
]);

const CLOSERS = /["'”’)\]]/;
const CLAUSE_BREAK = /[,;:—–]/;

/** True when a chunk is a bracketed stage direction rather than spoken copy. */
export function isDirection(text) {
  const trimmed = String(text).trim();
  return trimmed.startsWith("[") && trimmed.endsWith("]") && trimmed.length > 2;
}

/** Counts spoken words, ignoring anything inside square brackets. */
export function countSpokenWords(text) {
  const spoken = String(text).replace(/\[[^\]]*\]/g, " ");
  const words = spoken.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

/** Splits a paragraph into sentences, respecting common abbreviations. */
export function splitSentences(paragraph) {
  const chars = Array.from(String(paragraph));
  const out = [];
  let buffer = "";

  for (let i = 0; i < chars.length; i += 1) {
    const ch = chars[i];
    buffer += ch;
    if (ch !== "." && ch !== "!" && ch !== "?") continue;

    let j = i + 1;
    while (j < chars.length && CLOSERS.test(chars[j])) {
      buffer += chars[j];
      j += 1;
    }

    const rest = chars.slice(j).join("");
    const endsHere = j >= chars.length || /^\s*$/.test(rest);
    const startsNewSentence = /^\s+["'“([A-Z0-9]/.test(rest);

    if (!endsHere && !startsNewSentence) {
      i = j - 1;
      continue;
    }

    if (ch === ".") {
      const tail = buffer.slice(0, -1).split(/[\s([]/).pop() || "";
      if (NON_TERMINAL_ABBREVIATIONS.has(tail.toLowerCase())) {
        i = j - 1;
        continue;
      }
    }

    out.push(buffer.trim());
    buffer = "";
    i = j - 1;
  }

  if (buffer.trim()) out.push(buffer.trim());
  return out;
}

/** Breaks one over-long sentence at clause punctuation, then hard-splits if still too long. */
function splitLongSentence(sentence, limit) {
  const words = sentence.trim().split(/\s+/).filter(Boolean);
  if (words.length <= limit) return [sentence.trim()];

  const pieces = [];
  let current = [];
  for (const word of words) {
    current.push(word);
    const atClause = CLAUSE_BREAK.test(word.slice(-1));
    if (current.length >= limit || (atClause && current.length >= Math.ceil(limit / 2))) {
      pieces.push(current.join(" "));
      current = [];
    }
  }
  if (current.length) {
    const previousWords = pieces.length
      ? pieces[pieces.length - 1].split(/\s+/).filter(Boolean).length
      : 0;
    const canMerge =
      pieces.length > 0 &&
      current.length < Math.ceil(limit / 4) &&
      previousWords + current.length <= limit;
    if (canMerge) {
      pieces.push(`${pieces.pop()} ${current.join(" ")}`);
    } else {
      pieces.push(current.join(" "));
    }
  }
  return pieces;
}

/** Formats a whole-second count as m:ss (or h:mm:ss past an hour). */
export function formatClock(totalSeconds) {
  const safe = Number.isFinite(totalSeconds) && totalSeconds > 0 ? Math.round(totalSeconds) : 0;
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const mm = hours > 0 ? String(minutes).padStart(2, "0") : String(minutes);
  return hours > 0
    ? `${hours}:${mm}:${String(seconds).padStart(2, "0")}`
    : `${mm}:${String(seconds).padStart(2, "0")}`;
}

/**
 * @returns {{error:string}|{
 *   blocks:Array<{cue:number,label:string,text:string,words:number,seconds:number,startSeconds:number,start:string,direction:boolean}>,
 *   formatted:string, blockCount:number, spokenBlockCount:number, directionCount:number,
 *   totalWords:number, totalSeconds:number, longestBlockWords:number,
 *   averageWordsPerBlock:number, wordsPerMinute:number
 * }}
 */
export function formatScript({
  text = "",
  maxWordsPerBlock = 35,
  wordsPerMinute = DEFAULT_WORDS_PER_MINUTE,
  cuePrefix = "CUE",
} = {}) {
  const source = String(text ?? "");
  if (!source.trim()) {
    return { error: "Paste a script to format." };
  }
  if (!Number.isFinite(maxWordsPerBlock) || !Number.isFinite(wordsPerMinute)) {
    return { error: "Block size and reading pace must be numbers." };
  }
  if (maxWordsPerBlock < MIN_WORDS_PER_BLOCK || maxWordsPerBlock > MAX_WORDS_PER_BLOCK) {
    return {
      error: `Words per block must be between ${MIN_WORDS_PER_BLOCK} and ${MAX_WORDS_PER_BLOCK}.`,
    };
  }
  if (wordsPerMinute < MIN_WPM || wordsPerMinute > MAX_WPM) {
    return { error: `Reading pace must be between ${MIN_WPM} and ${MAX_WPM} words per minute.` };
  }

  const limit = Math.floor(maxWordsPerBlock);
  const paragraphs = source.split(/\n\s*\n+/).map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean);

  const chunks = [];
  for (const paragraph of paragraphs) {
    const sentences = splitSentences(paragraph);
    let pending = [];
    let pendingWords = 0;

    const flush = () => {
      if (pending.length) {
        chunks.push(pending.join(" "));
        pending = [];
        pendingWords = 0;
      }
    };

    for (const sentence of sentences) {
      if (isDirection(sentence)) {
        flush();
        chunks.push(sentence);
        continue;
      }
      const words = sentence.split(/\s+/).filter(Boolean).length;
      if (words > limit) {
        flush();
        for (const piece of splitLongSentence(sentence, limit)) chunks.push(piece);
        continue;
      }
      if (pendingWords + words > limit) flush();
      pending.push(sentence);
      pendingWords += words;
    }
    flush();
  }

  if (!chunks.length) {
    return { error: "Nothing to format — the script has no readable text." };
  }

  const blocks = [];
  let cue = 0;
  let elapsed = 0;
  let totalWords = 0;
  let longestBlockWords = 0;
  let directionCount = 0;

  for (const chunk of chunks) {
    const direction = isDirection(chunk);
    const words = direction ? 0 : countSpokenWords(chunk);
    const seconds = (words / wordsPerMinute) * SECONDS_PER_MINUTE;
    cue += 1;
    blocks.push({
      cue,
      label: direction ? `${cuePrefix} ${cue} · direction` : `${cuePrefix} ${cue}`,
      text: chunk,
      words,
      seconds,
      startSeconds: elapsed,
      start: formatClock(elapsed),
      direction,
    });
    if (direction) directionCount += 1;
    elapsed += seconds;
    totalWords += words;
    if (words > longestBlockWords) longestBlockWords = words;
  }

  const spokenBlockCount = blocks.length - directionCount;
  const formatted = blocks
    .map((block) =>
      block.direction
        ? `${block.label}\n${block.text}`
        : `${block.label}  [${block.start}]  (${block.words} words)\n${block.text}`,
    )
    .join("\n\n");

  return {
    blocks,
    formatted,
    blockCount: blocks.length,
    spokenBlockCount,
    directionCount,
    totalWords,
    totalSeconds: elapsed,
    longestBlockWords,
    averageWordsPerBlock: spokenBlockCount > 0 ? totalWords / spokenBlockCount : 0,
    wordsPerMinute,
  };
}
