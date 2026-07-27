/**
 * Quiz Prompt Builder — assembles a structured quiz-generation prompt for an
 * AI assistant from a topic, an exact difficulty mix and question-type choices.
 *
 * The difficulty mix is turned into whole question counts with the
 * largest-remainder (Hare quota) apportionment method, which guarantees the
 * per-difficulty counts always sum exactly to the requested total.
 */

/** Question formats the prompt can ask for. */
export const QUESTION_TYPES = [
  { id: "mcq", label: "Multiple choice" },
  { id: "true-false", label: "True / false" },
  { id: "short-answer", label: "Short answer" },
  { id: "fill-blank", label: "Fill in the blank" },
];

/** Difficulty tiers used in the mix, in fixed order. */
export const DIFFICULTY_LEVELS = [
  { id: "easy", label: "Easy", guidance: "single-fact recall a first-time learner should manage" },
  { id: "medium", label: "Medium", guidance: "application of a concept to a slightly new situation" },
  { id: "hard", label: "Hard", guidance: "multi-step reasoning or combining two or more concepts" },
];

/** Practical bounds so the prompt stays usable inside one AI response. */
export const MIN_QUESTIONS = 1;
export const MAX_QUESTIONS = 100; // beyond ~100 questions a single model response degrades
export const MIN_MCQ_OPTIONS = 2; // fewer than 2 options is not a choice
export const MAX_MCQ_OPTIONS = 6; // standard test-writing practice tops out at 5-6 distractors
export const PERCENT_TOTAL = 100; // difficulty shares must be a complete percentage split

/**
 * Largest-remainder apportionment: split `total` whole items across
 * percentage `shares` so the parts always sum to `total`.
 * Floors each quota, then hands remaining items to the largest fractional
 * remainders (ties go to the earlier share for determinism).
 *
 * @param {number} total   Whole number of items to split.
 * @param {number[]} shares Percentages (assumed to sum to PERCENT_TOTAL).
 * @returns {number[]} whole counts summing to total.
 */
export function apportionByLargestRemainder(total, shares) {
  const quotas = shares.map((share) => (total * share) / PERCENT_TOTAL);
  const counts = quotas.map((quota) => Math.floor(quota));
  let leftover = total - counts.reduce((sum, count) => sum + count, 0);
  const order = quotas
    .map((quota, index) => ({ index, frac: quota - Math.floor(quota) }))
    .sort((a, b) => b.frac - a.frac || a.index - b.index);
  for (let i = 0; leftover > 0 && i < order.length; i += 1) {
    counts[order[i].index] += 1;
    leftover -= 1;
  }
  return counts;
}

/**
 * Build the quiz-generation prompt.
 *
 * @param {object} input
 * @param {string} input.topic            Subject matter of the quiz.
 * @param {string} [input.audience]       Who the quiz is for (grade / course level).
 * @param {number} input.totalQuestions   Whole number of questions wanted.
 * @param {number} input.easyPercent      Easy share of the mix (0-100).
 * @param {number} input.mediumPercent    Medium share of the mix (0-100).
 * @param {number} input.hardPercent      Hard share of the mix (0-100).
 * @param {string[]} input.questionTypes  Ids from QUESTION_TYPES, at least one.
 * @param {number} [input.mcqOptions]     Options per multiple-choice question.
 * @param {boolean} [input.includeAnswerKey]     Ask for a separate answer key.
 * @param {boolean} [input.includeExplanations]  Ask for a one-line rationale per answer.
 * @returns {object} { prompt, counts, totalQuestions } or { error }.
 */
export function buildQuizPrompt({
  topic,
  audience = "",
  totalQuestions,
  easyPercent,
  mediumPercent,
  hardPercent,
  questionTypes,
  mcqOptions = 4,
  includeAnswerKey = true,
  includeExplanations = false,
}) {
  const cleanTopic = typeof topic === "string" ? topic.trim() : "";
  if (!cleanTopic) return { error: "Enter the topic the quiz should cover." };

  const total = Number(totalQuestions);
  if (!Number.isInteger(total) || total < MIN_QUESTIONS || total > MAX_QUESTIONS) {
    return {
      error: `Number of questions must be a whole number between ${MIN_QUESTIONS} and ${MAX_QUESTIONS}.`,
    };
  }

  const shares = [Number(easyPercent), Number(mediumPercent), Number(hardPercent)];
  if (shares.some((share) => !Number.isFinite(share) || share < 0)) {
    return { error: "Difficulty percentages must be zero or positive numbers." };
  }
  const shareSum = shares.reduce((sum, share) => sum + share, 0);
  if (Math.round(shareSum) !== PERCENT_TOTAL) {
    return {
      error: `Difficulty mix must add up to ${PERCENT_TOTAL}% — it currently adds up to ${shareSum}%.`,
    };
  }

  const types = Array.isArray(questionTypes)
    ? questionTypes.filter((id) => QUESTION_TYPES.some((type) => type.id === id))
    : [];
  if (types.length === 0) return { error: "Pick at least one question type." };

  const options = Number(mcqOptions);
  if (
    types.includes("mcq") &&
    (!Number.isInteger(options) || options < MIN_MCQ_OPTIONS || options > MAX_MCQ_OPTIONS)
  ) {
    return {
      error: `Options per multiple-choice question must be a whole number between ${MIN_MCQ_OPTIONS} and ${MAX_MCQ_OPTIONS}.`,
    };
  }

  const perLevel = apportionByLargestRemainder(total, shares);
  const counts = {
    easy: perLevel[0],
    medium: perLevel[1],
    hard: perLevel[2],
  };

  const typeLabels = types.map(
    (id) => QUESTION_TYPES.find((type) => type.id === id).label.toLowerCase(),
  );

  const lines = [];
  lines.push(`You are an experienced teacher writing an assessment quiz.`);
  lines.push("");
  lines.push(`Write a quiz of exactly ${total} question${total === 1 ? "" : "s"} on: ${cleanTopic}.`);
  if (audience.trim()) lines.push(`Audience: ${audience.trim()}.`);
  lines.push("");
  lines.push("Difficulty mix (follow these counts exactly):");
  for (const level of DIFFICULTY_LEVELS) {
    lines.push(`- ${counts[level.id]} ${level.label.toLowerCase()} question${counts[level.id] === 1 ? "" : "s"} (${level.guidance})`);
  }
  lines.push("");
  lines.push(`Allowed question types: ${typeLabels.join(", ")}. Spread the types roughly evenly across the quiz.`);
  if (types.includes("mcq")) {
    lines.push(
      `Every multiple-choice question must have exactly ${options} options labelled A-${String.fromCharCode(64 + options)}, with one clearly correct answer and plausible distractors.`,
    );
  }
  lines.push("");
  lines.push("Formatting rules:");
  lines.push("- Number questions 1 to " + total + " and tag each with its difficulty in brackets, e.g. \"[Medium]\".");
  lines.push("- Order questions from easy to hard.");
  lines.push("- Do not repeat the same fact in two questions.");
  if (includeAnswerKey) {
    lines.push(
      `- After all questions, add a section titled \"Answer key\" listing every answer on its own line as \"1. B\" or \"1. <short answer>\".${includeExplanations ? " Add a one-sentence explanation after each answer." : ""}`,
    );
  } else if (includeExplanations) {
    lines.push("- After each question, state the correct answer with a one-sentence explanation.");
  } else {
    lines.push("- Do not include the answers.");
  }

  return {
    prompt: lines.join("\n"),
    counts,
    totalQuestions: total,
    typeCount: types.length,
  };
}
