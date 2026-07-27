/**
 * Two-round (two-pass) attempt strategy planner for objective papers.
 *
 * The strategy, standard in competitive-exam coaching (banking, SSC, JEE,
 * CAT): Round 1 sweeps every question quickly, answering only the ones you
 * are sure of and flagging the rest; Round 2 returns to the flagged
 * questions with the remaining time. The planner turns a chosen time split
 * and an expected flag rate into per-question second budgets for each round.
 */

/**
 * Coaching convention: give the first sweep roughly 60-70% of working time.
 * 65% is used as the default split.
 */
export const DEFAULT_ROUND1_SHARE_PERCENT = 65;

/**
 * Typical share of questions a well-prepared candidate flags for a second
 * look on a competitive paper — used only as a starting default.
 */
export const DEFAULT_FLAG_PERCENT = 30;

/** Keep a small end buffer for bubbling/OMR transfer and final checks. */
export const DEFAULT_BUFFER_MINUTES = 5;

/**
 * Build the two-round plan.
 *
 * @param {object} input
 * @param {number} input.totalQuestions       Questions on the paper.
 * @param {number} input.totalMinutes         Full paper duration in minutes.
 * @param {number} input.round1SharePercent   % of working time given to round 1 (1-99).
 * @param {number} input.flagPercent          Expected % of questions flagged for round 2 (0-100).
 * @param {number} input.bufferMinutes        End buffer kept outside both rounds.
 * @returns {object} plan or { error }
 */
export function planTwoRounds({
  totalQuestions,
  totalMinutes,
  round1SharePercent,
  flagPercent,
  bufferMinutes,
}) {
  const questions = Number(totalQuestions);
  const minutes = Number(totalMinutes);
  const share = Number(round1SharePercent);
  const flagPct = Number(flagPercent);
  const buffer = Number(bufferMinutes);

  if (!Number.isFinite(questions) || !Number.isInteger(questions) || questions < 1) {
    return { error: "Enter a whole number of questions (at least 1)." };
  }
  if (questions > 1000) return { error: "That is more than 1,000 questions — check the number." };
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return { error: "Paper duration must be a positive number of minutes." };
  }
  if (!Number.isFinite(share) || share < 1 || share > 99) {
    return { error: "Round 1 share must be between 1% and 99% of the working time." };
  }
  if (!Number.isFinite(flagPct) || flagPct < 0 || flagPct > 100) {
    return { error: "Flagged share must be between 0% and 100% of questions." };
  }
  if (!Number.isFinite(buffer) || buffer < 0) {
    return { error: "Buffer minutes cannot be negative." };
  }

  const workingMinutes = minutes - buffer;
  if (workingMinutes <= 0) {
    return { error: "The buffer uses up the whole paper — reduce it so attempt time remains." };
  }

  const round1Minutes = (workingMinutes * share) / 100;
  const round2Minutes = workingMinutes - round1Minutes;

  // Round 1 visits every question once.
  const round1SecondsPerQuestion = (round1Minutes * 60) / questions;

  // Round 2 revisits only the flagged subset.
  const flaggedQuestions = Math.round((questions * flagPct) / 100);
  const round2SecondsPerFlagged =
    flaggedQuestions > 0 ? (round2Minutes * 60) / flaggedQuestions : null;

  const round1 = {
    minutes: Math.round(round1Minutes * 10) / 10,
    secondsPerQuestion: Math.round(round1SecondsPerQuestion),
    questions,
  };
  const round2 = {
    minutes: Math.round(round2Minutes * 10) / 10,
    flaggedQuestions,
    secondsPerFlagged:
      round2SecondsPerFlagged === null ? null : Math.round(round2SecondsPerFlagged),
  };

  return {
    workingMinutes: Math.round(workingMinutes * 10) / 10,
    bufferMinutes: buffer,
    round1,
    round2,
    // Overall average if the paper were done in a single pass, for comparison.
    singlePassSecondsPerQuestion: Math.round((workingMinutes * 60) / questions),
  };
}
