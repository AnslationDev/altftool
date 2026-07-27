/**
 * OMR answer-transfer time planner.
 *
 * Exam takers who solve in the question booklet must reserve time to transfer
 * (bubble) answers onto the OMR sheet. The planner computes that reserve:
 *
 *   transfer seconds = questions × seconds-per-answer × (1 + buffer%)
 *
 * and splits the remaining time across the questions. There is no statutory
 * rule here — the per-bubble time is an empirical figure; coaching guidance for
 * OMR exams (NEET, SSC, state boards) commonly quotes 3–5 seconds to darken one
 * bubble carefully, which is why the default is 4 seconds.
 */

/** Midpoint of the commonly advised 3–5 s per carefully darkened bubble. */
export const DEFAULT_SECONDS_PER_ANSWER = 4;
export const MIN_SECONDS_PER_ANSWER = 1;
export const MAX_SECONDS_PER_ANSWER = 30;

/**
 * Safety margin over the raw bubbling time for re-checking row alignment and
 * skipped questions — a planning heuristic, kept adjustable from 0 to 100%.
 */
export const DEFAULT_BUFFER_PERCENT = 25;
export const MAX_BUFFER_PERCENT = 100;

export const STRATEGIES = [
  {
    id: "end",
    label: "One batch at the end of the exam",
    note: "Fastest overall but riskiest — if time runs out, every unbubbled answer is lost.",
  },
  {
    id: "section",
    label: "In batches after each section / page",
    note: "Spreads the risk; alignment errors are caught early while the section is fresh.",
  },
  {
    id: "each",
    label: "Bubble immediately after every question",
    note: "Safest but slowest — each answer pays the pen-switch cost separately.",
  },
];

const SECONDS_PER_MINUTE = 60;

/**
 * Plan how much exam time to reserve for OMR answer transfer.
 *
 * @param {object} input
 * @param {number} input.examMinutes       Total exam duration in minutes.
 * @param {number} input.totalQuestions    Questions whose answers must be bubbled.
 * @param {number} input.secondsPerAnswer  Seconds to darken one bubble.
 * @param {number} input.bufferPercent     Safety margin percentage (0–100).
 * @param {string} input.strategy          One of STRATEGIES ids.
 * @param {number} [input.batches]         Number of batches for the "section" strategy.
 * @returns {object} plan or { error }.
 */
export function computeTransferPlan({
  examMinutes,
  totalQuestions,
  secondsPerAnswer = DEFAULT_SECONDS_PER_ANSWER,
  bufferPercent = DEFAULT_BUFFER_PERCENT,
  strategy = "end",
  batches = 4,
}) {
  const minutes = Number(examMinutes);
  const questions = Number(totalQuestions);
  const perAnswer = Number(secondsPerAnswer);
  const buffer = Number(bufferPercent);
  const batchCount = Number(batches);

  if (!Number.isFinite(minutes) || minutes <= 0) {
    return { error: "Exam duration must be a positive number of minutes." };
  }
  if (!Number.isInteger(questions) || questions <= 0) {
    return { error: "Enter a whole number of questions greater than zero." };
  }
  if (
    !Number.isFinite(perAnswer) ||
    perAnswer < MIN_SECONDS_PER_ANSWER ||
    perAnswer > MAX_SECONDS_PER_ANSWER
  ) {
    return {
      error: `Seconds per answer must be between ${MIN_SECONDS_PER_ANSWER} and ${MAX_SECONDS_PER_ANSWER}.`,
    };
  }
  if (!Number.isFinite(buffer) || buffer < 0 || buffer > MAX_BUFFER_PERCENT) {
    return { error: `Safety buffer must be between 0 and ${MAX_BUFFER_PERCENT} percent.` };
  }
  const strategyDef = STRATEGIES.find((s) => s.id === strategy);
  if (!strategyDef) return { error: "Choose a transfer strategy." };
  if (strategy === "section") {
    if (!Number.isInteger(batchCount) || batchCount < 1 || batchCount > questions) {
      return { error: "Batches must be a whole number between 1 and the question count." };
    }
  }

  const rawTransferSeconds = questions * perAnswer;
  const transferSeconds = Math.ceil(rawTransferSeconds * (1 + buffer / 100));
  const examSeconds = minutes * SECONDS_PER_MINUTE;

  if (transferSeconds >= examSeconds) {
    return {
      error:
        "Transferring answers would take the whole exam or longer — reduce the per-answer time, buffer or question count.",
    };
  }

  const solvingSeconds = examSeconds - transferSeconds;
  const effectiveBatches = strategy === "end" ? 1 : strategy === "each" ? questions : batchCount;
  const questionsPerBatch = Math.ceil(questions / effectiveBatches);
  const batchSeconds = Math.ceil(transferSeconds / effectiveBatches);

  return {
    strategy: strategyDef,
    transferSeconds,
    transferMinutes: transferSeconds / SECONDS_PER_MINUTE,
    rawTransferSeconds,
    bufferSeconds: transferSeconds - rawTransferSeconds,
    solvingSeconds,
    solvingMinutes: solvingSeconds / SECONDS_PER_MINUTE,
    secondsPerQuestionSolving: solvingSeconds / questions,
    // For the end strategy: the minute mark on the exam clock to stop solving.
    startTransferAtMinute: (examSeconds - transferSeconds) / SECONDS_PER_MINUTE,
    effectiveBatches,
    questionsPerBatch,
    batchSeconds,
    examMinutes: minutes,
    totalQuestions: questions,
  };
}

/** Format whole seconds as "Xm YYs" for display; negative-safe. */
export function formatSeconds(totalSeconds) {
  const s = Math.max(0, Math.round(Number(totalSeconds) || 0));
  const m = Math.floor(s / SECONDS_PER_MINUTE);
  const rest = s % SECONDS_PER_MINUTE;
  if (m === 0) return `${rest}s`;
  return `${m}m ${String(rest).padStart(2, "0")}s`;
}
