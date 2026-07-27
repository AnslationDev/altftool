/**
 * Digital detox study planning with escalating targets.
 *
 * The plan applies graded exposure / progressive overload: each day's
 * phone-free block grows linearly until it hits a cap —
 *
 *   blockMinutes(day) = min(cap, start + (day − 1) × dailyIncrease)
 *
 * and the day's phone-free total is blockMinutes × blocksPerDay. Starting
 * small and escalating is the habit-formation approach behind graded exposure:
 * targets rise only as fast as yesterday's success, instead of demanding a
 * full phone-free day immediately.
 */

/** Sanity bounds. */
export const MIN_DAYS = 3;
export const MAX_DAYS = 60;
export const MIN_START_MINUTES = 10;
export const MAX_START_MINUTES = 240;
export const MAX_DAILY_INCREASE = 60;
export const MAX_CAP_MINUTES = 360; // a single block longer than 6h is not realistic
export const MIN_BLOCKS_PER_DAY = 1;
export const MAX_BLOCKS_PER_DAY = 6;

/**
 * No day's phone-free study total may exceed 12 hours — beyond that the plan
 * stops being a study schedule and becomes an unrealistic pledge.
 */
export const MAX_DAILY_TOTAL_MINUTES = 720;

const round1 = (v) => Math.round(v * 10) / 10;

/**
 * Build the escalating detox plan.
 *
 * @param {object} input
 * @param {number|string} input.days              Plan length in days.
 * @param {number|string} input.startMinutes      Day-1 block length.
 * @param {number|string} input.dailyIncreaseMinutes  Added to the block each day.
 * @param {number|string} input.capMinutes        Block length ceiling.
 * @param {number|string} input.blocksPerDay      Phone-free blocks per day.
 * @returns {object} plan, or { error }.
 */
export function buildDetoxPlan({
  days,
  startMinutes,
  dailyIncreaseMinutes,
  capMinutes,
  blocksPerDay,
}) {
  const nDays = Number(days);
  const start = Number(startMinutes);
  const increase = Number(dailyIncreaseMinutes);
  const cap = Number(capMinutes);
  const blocks = Number(blocksPerDay);

  if (!Number.isFinite(nDays) || !Number.isInteger(nDays) || nDays < MIN_DAYS || nDays > MAX_DAYS) {
    return { error: `Plan length must be a whole number of days from ${MIN_DAYS} to ${MAX_DAYS}.` };
  }
  if (!Number.isFinite(start) || start < MIN_START_MINUTES || start > MAX_START_MINUTES) {
    return {
      error: `Starting block must be between ${MIN_START_MINUTES} and ${MAX_START_MINUTES} minutes.`,
    };
  }
  if (!Number.isFinite(increase) || increase < 0 || increase > MAX_DAILY_INCREASE) {
    return { error: `Daily increase must be between 0 and ${MAX_DAILY_INCREASE} minutes.` };
  }
  if (!Number.isFinite(cap) || cap < start || cap > MAX_CAP_MINUTES) {
    return {
      error: `Block cap must be at least the starting block and no more than ${MAX_CAP_MINUTES} minutes.`,
    };
  }
  if (
    !Number.isFinite(blocks) ||
    !Number.isInteger(blocks) ||
    blocks < MIN_BLOCKS_PER_DAY ||
    blocks > MAX_BLOCKS_PER_DAY
  ) {
    return {
      error: `Blocks per day must be a whole number from ${MIN_BLOCKS_PER_DAY} to ${MAX_BLOCKS_PER_DAY}.`,
    };
  }
  if (cap * blocks > MAX_DAILY_TOTAL_MINUTES) {
    return {
      error: `${blocks} blocks of up to ${cap} minutes exceed ${MAX_DAILY_TOTAL_MINUTES} phone-free minutes a day — lower the cap or the block count.`,
    };
  }

  const schedule = [];
  let cumulativeMinutes = 0;
  let capReachedDay = null;
  for (let day = 1; day <= nDays; day += 1) {
    const blockMinutes = Math.min(cap, start + (day - 1) * increase);
    if (capReachedDay === null && blockMinutes >= cap) capReachedDay = day;
    const dailyTotal = blockMinutes * blocks;
    cumulativeMinutes += dailyTotal;
    schedule.push({ day, blockMinutes, dailyTotal, cumulativeMinutes });
  }

  const finalBlockMinutes = schedule[schedule.length - 1].blockMinutes;
  const firstDayTotal = schedule[0].dailyTotal;
  const finalDayTotal = schedule[schedule.length - 1].dailyTotal;

  return {
    schedule,
    capReachedDay,
    finalBlockMinutes,
    firstDayTotal,
    finalDayTotal,
    totalPhoneFreeMinutes: cumulativeMinutes,
    totalPhoneFreeHours: round1(cumulativeMinutes / 60),
    // How much bigger the last day is versus day one.
    growthFactor: round1(finalDayTotal / firstDayTotal),
  };
}
