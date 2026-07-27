/**
 * IELTS Writing task word counter and structure analyser.
 *
 * Rules per the IELTS Writing test instructions and band descriptors:
 *  - Task 1 requires a MINIMUM of 150 words; Task 2 requires a MINIMUM of 250.
 *    Under-length answers are penalised under Task Achievement / Task Response.
 *  - There is no maximum, but examiner guidance and timing (20 min for Task 1,
 *    40 min for Task 2) make roughly 150–200 and 250–300 words the practical
 *    target ranges encoded here as advisory, not statutory, numbers.
 *  - Word counting follows examiner practice: every word counts including
 *    articles and prepositions; numbers and symbols written as tokens count as
 *    words; hyphenated compounds ("well-known") count as ONE word.
 */

/** IELTS Writing minimums (test instructions printed on the question paper). */
export const TASKS = [
  { id: "task1", label: "Task 1 (report / letter)", minimum: 150, recommendedMax: 200 },
  { id: "task2", label: "Task 2 (essay)", minimum: 250, recommendedMax: 300 },
];

/**
 * Count words the way IELTS examiners do: whitespace-separated tokens that
 * contain at least one letter or digit; hyphenated compounds are one token.
 */
export function countWords(text) {
  if (typeof text !== "string" || text.trim() === "") return 0;
  return text.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
}

/** Split into paragraphs: non-empty blocks separated by one or more newlines. */
export function splitParagraphs(text) {
  if (typeof text !== "string") return [];
  return text
    .split(/\n+/)
    .map((block) => block.trim())
    .filter((block) => block !== "");
}

/** Count sentences: segments ending in . ! ? (or end of text) that contain a word. */
export function countSentences(text) {
  if (typeof text !== "string") return 0;
  return text
    .split(/[.!?]+(?:\s|$)/)
    .filter((segment) => /[\p{L}\p{N}]/u.test(segment)).length;
}

/**
 * Analyse an IELTS Writing answer against the task minimum.
 *
 * @param {object} input
 * @param {string} input.text    The candidate's answer.
 * @param {string} input.taskId  "task1" or "task2".
 * @returns {object} analysis or { error }.
 */
export function analyzeWriting({ text, taskId }) {
  const task = TASKS.find((t) => t.id === taskId);
  if (!task) return { error: "Choose Task 1 or Task 2." };
  if (typeof text !== "string") return { error: "Paste your answer text to analyse." };

  const words = countWords(text);
  const paragraphBlocks = splitParagraphs(text);
  const paragraphs = paragraphBlocks.map((block, index) => ({
    index: index + 1,
    words: countWords(block),
    preview: block.length > 60 ? `${block.slice(0, 60)}…` : block,
  }));
  const sentences = countSentences(text);
  const characters = text.replace(/\s/g, "").length;

  const meetsMinimum = words >= task.minimum;
  const shortfall = meetsMinimum ? 0 : task.minimum - words;
  const surplus = meetsMinimum ? words - task.minimum : 0;
  const overRecommended = words > task.recommendedMax;

  return {
    task,
    words,
    meetsMinimum,
    shortfall,
    surplus,
    overRecommended,
    paragraphs,
    paragraphCount: paragraphs.length,
    sentences,
    characters,
    avgWordsPerSentence: sentences === 0 ? 0 : Math.round((words / sentences) * 10) / 10,
    avgWordsPerParagraph:
      paragraphs.length === 0 ? 0 : Math.round((words / paragraphs.length) * 10) / 10,
  };
}
