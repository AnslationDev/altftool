/**
 * Eye-friendly study planning: alternate screen and paper blocks and insert
 * eye-rest pauses.
 *
 * Rules encoded:
 *  - 20-20-20 rule: every 20 minutes of screen work, look ~20 feet (6 m) away
 *    for at least 20 seconds (American Academy of Ophthalmology / American
 *    Optometric Association guidance on digital eye strain).
 *  - Task alternation: optometric advice for computer vision syndrome favours
 *    alternating near-screen work with non-screen tasks and taking a longer
 *    rest roughly every hour of close work (AOA computer vision syndrome
 *    guidance).
 */

/** 20-20-20 rule interval in minutes (AAO/AOA). */
export const EYE_MICRO_BREAK_INTERVAL_MIN = 20;
/** 20-20-20 rule: look away for at least 20 seconds. */
export const EYE_MICRO_BREAK_SECONDS = 20;

/** Practical bounds so the plan stays meaningful. */
export const MIN_TOTAL_MINUTES = 25;
export const MAX_TOTAL_MINUTES = 720; // 12 hours
export const MIN_BLOCK_MINUTES = 15;
export const MAX_BLOCK_MINUTES = 120;
export const MAX_REST_MINUTES = 30;

/**
 * Plan a session alternating screen and paper blocks.
 *
 * Screen blocks are spread as evenly as possible through the session (screen
 * first when shares are equal), each screen block is annotated with its
 * 20-20-20 micro-break count, and a screen-free rest separates blocks.
 *
 * @param {object} input
 * @param {number} input.totalMinutes         Total study time (excludes rests).
 * @param {number} [input.blockMinutes]       Length of one block (default 25).
 * @param {number} [input.screenSharePercent] % of blocks on screen (default 50).
 * @param {number} [input.restMinutes]        Rest between blocks (default 5).
 * @returns {{blocks, totals}|{error:string}}
 */
export function planEyeFriendlyStudy({
  totalMinutes,
  blockMinutes = 25,
  screenSharePercent = 50,
  restMinutes = 5,
}) {
  const total = Number(totalMinutes);
  const block = Number(blockMinutes);
  const share = Number(screenSharePercent);
  const rest = Number(restMinutes);

  if (!Number.isFinite(total)) return { error: "Enter your total study time in minutes." };
  if (total < MIN_TOTAL_MINUTES) {
    return { error: `Plan at least ${MIN_TOTAL_MINUTES} minutes — shorter sessions do not need alternation.` };
  }
  if (total > MAX_TOTAL_MINUTES) {
    return { error: "Keep one plan at 12 hours or less — split longer days into two plans." };
  }
  if (!Number.isFinite(block) || block < MIN_BLOCK_MINUTES || block > MAX_BLOCK_MINUTES) {
    return { error: `Block length must be between ${MIN_BLOCK_MINUTES} and ${MAX_BLOCK_MINUTES} minutes.` };
  }
  if (!Number.isFinite(share) || share < 0 || share > 100) {
    return { error: "Screen share must be between 0 and 100 percent." };
  }
  if (!Number.isFinite(rest) || rest < 0 || rest > MAX_REST_MINUTES) {
    return { error: `Rest between blocks must be between 0 and ${MAX_REST_MINUTES} minutes.` };
  }

  const blockCount = Math.ceil(total / block);
  const lastBlockMinutes = total - (blockCount - 1) * block;
  const screenBlockCount = Math.round((blockCount * share) / 100);
  const paperBlockCount = blockCount - screenBlockCount;

  const blocks = [];
  let clock = 0; // running elapsed time including rests
  for (let i = 0; i < blockCount; i += 1) {
    // Even distribution of paper blocks (Bresenham-style), so screen leads
    // when shares are equal.
    const isPaper =
      Math.floor(((i + 1) * paperBlockCount) / blockCount) >
      Math.floor((i * paperBlockCount) / blockCount);
    const minutes = i === blockCount - 1 ? lastBlockMinutes : block;
    // Micro-breaks strictly inside the block (a break at the block's end
    // merges into the between-block rest).
    const microBreaks = isPaper
      ? 0
      : Math.floor(Math.max(0, minutes - 1) / EYE_MICRO_BREAK_INTERVAL_MIN);
    blocks.push({
      index: i + 1,
      type: isPaper ? "paper" : "screen",
      minutes,
      startsAtMinute: clock,
      microBreaks,
    });
    clock += minutes;
    if (i < blockCount - 1) clock += rest;
  }

  const screenMinutes = blocks
    .filter((b) => b.type === "screen")
    .reduce((sum, b) => sum + b.minutes, 0);
  const microBreakCount = blocks.reduce((sum, b) => sum + b.microBreaks, 0);

  return {
    blocks,
    totals: {
      studyMinutes: total,
      screenMinutes,
      paperMinutes: total - screenMinutes,
      screenBlockCount,
      paperBlockCount,
      restBreakCount: blockCount - 1,
      restMinutesTotal: (blockCount - 1) * rest,
      microBreakCount,
      microBreakSecondsTotal: microBreakCount * EYE_MICRO_BREAK_SECONDS,
      elapsedMinutes: clock,
    },
  };
}
