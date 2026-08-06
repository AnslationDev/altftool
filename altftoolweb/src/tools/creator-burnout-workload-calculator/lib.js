/**
 * Creator Workload Burnout Calculator — pure calculation module.
 *
 * The maths is deliberately simple and auditable: weekly production hours are
 * summed from output counts, compared with published working-time thresholds,
 * and combined with recovery inputs (sleep, rest days, time since a real break)
 * into a 0-100 load score.
 *
 * This is an informational workload model, not a clinical burnout instrument
 * (it is not the Maslach Burnout Inventory or any validated diagnostic scale).
 */

/** WHO/ILO joint estimates of the work-related burden of disease (2021): working
 *  55+ hours a week is associated with higher stroke and ischaemic heart disease risk. */
export const HIGH_RISK_WEEKLY_HOURS = 55;

/** EU Working Time Directive 2003/88/EC: average weekly working time, including
 *  overtime, must not exceed 48 hours over the reference period. */
export const WORKING_TIME_LIMIT_HOURS = 48;

/** Conventional full-time working week used as the "sustainable" reference point. */
export const FULL_TIME_HOURS = 40;

/** AASM & Sleep Research Society consensus (2015): adults aged 18-60 should sleep
 *  7 or more hours per night on a regular basis. */
export const MIN_ADULT_SLEEP_HOURS = 7;

/** ILO Weekly Rest (Industry) Convention No. 14: at least 24 consecutive hours of
 *  rest in every seven-day period. */
export const MIN_REST_DAYS_PER_WEEK = 1;

/** Rest days at or above this count score zero on the recovery component. */
const HEALTHY_REST_DAYS = 2;

/** Weeks since the last full week away: below this it costs nothing, above the
 *  upper bound it maxes the component out. Heuristic, not a statutory figure. */
const BREAK_FREE_WEEKS = 4;
const BREAK_MAX_WEEKS = 16;

/** Hours in a day and days in a week — used to bound physically impossible input. */
const HOURS_PER_DAY = 24;
const DAYS_PER_WEEK = 7;

/**
 * Component weights for the 0-100 load score. They sum to 100.
 * Hours dominate because they are the only input tied to a published threshold.
 */
export const SCORE_WEIGHTS = {
  hours: 45,
  sleep: 25,
  restDays: 20,
  timeSinceBreak: 10,
};

/**
 * Breakpoints mapping weekly hours to the 0-100 hours component.
 * Anchored on 40 h (full time), 48 h (EU directive ceiling) and 55 h (WHO/ILO
 * elevated-risk threshold); linear interpolation in between.
 */
const HOURS_CURVE = [
  [0, 0],
  [35, 10],
  [FULL_TIME_HOURS, 30],
  [WORKING_TIME_LIMIT_HOURS, 55],
  [HIGH_RISK_WEEKLY_HOURS, 80],
  [70, 100],
];

/** Score bands for the final 0-100 figure. */
export const LOAD_BANDS = [
  { max: 24, level: "Sustainable", note: "Workload and recovery are both inside healthy limits." },
  { max: 49, level: "Manageable", note: "Busy but recoverable — watch the weeks where output spikes." },
  { max: 74, level: "Elevated", note: "Either the hours or the recovery gap is past a safe level." },
  { max: 100, level: "High load", note: "This schedule is above published working-time risk thresholds." },
];

/**
 * Default hours per finished piece. These are editable starting points for a
 * solo creator (idea, script, shoot, edit, thumbnail, upload, description),
 * not measured industry figures — users are expected to override them.
 */
export const FORMAT_PRESETS = [
  { id: "longVideo", label: "Long-form video (8-15 min)", hoursEach: 9, count: 1 },
  { id: "shortVideo", label: "Short / Reel / vertical clip", hoursEach: 1.5, count: 5 },
  { id: "post", label: "Static post or carousel", hoursEach: 1, count: 3 },
  { id: "newsletter", label: "Newsletter or long blog post", hoursEach: 4, count: 1 },
  { id: "stream", label: "Live stream (incl. prep)", hoursEach: 3, count: 0 },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** Linear interpolation over an ascending [x, y] breakpoint table. */
function interpolate(curve, x) {
  if (x <= curve[0][0]) return curve[0][1];
  const last = curve[curve.length - 1];
  if (x >= last[0]) return last[1];
  for (let i = 1; i < curve.length; i += 1) {
    const [x0, y0] = curve[i - 1];
    const [x1, y1] = curve[i];
    if (x <= x1) {
      const span = x1 - x0;
      if (span <= 0) return y1;
      return y0 + ((x - x0) / span) * (y1 - y0);
    }
  }
  return last[1];
}

export function bandForScore(score) {
  const safe = clamp(isFiniteNumber(score) ? score : 0, 0, 100);
  return LOAD_BANDS.find((band) => safe <= band.max) ?? LOAD_BANDS[LOAD_BANDS.length - 1];
}

/**
 * Compute the weekly production load.
 *
 * @param {object} input
 * @param {Array<{id:string,label:string,count:number,hoursEach:number}>} input.items output formats
 * @param {number} input.adminHours weekly hours on email, brand deals, analytics, community
 * @param {number} input.daysOffPerWeek whole days with no creator work (0-6)
 * @param {number} input.sleepHours average sleep per night
 * @param {number} input.weeksSinceBreak weeks since the last full week away from posting
 * @param {number} input.targetHours the weekly hours the creator wants to work
 * @returns {object} result, or { error } when the input cannot produce a real answer
 */
export function computeWorkload({
  items = [],
  adminHours = 0,
  daysOffPerWeek = 1,
  sleepHours = 7,
  weeksSinceBreak = 0,
  targetHours = FULL_TIME_HOURS,
} = {}) {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Add at least one content format to estimate a workload." };
  }

  const numeric = [adminHours, daysOffPerWeek, sleepHours, weeksSinceBreak, targetHours];
  if (numeric.some((value) => !isFiniteNumber(value))) {
    return { error: "Enter valid numbers in every field." };
  }

  const cleaned = [];
  for (const item of items) {
    const count = Number(item?.count);
    const hoursEach = Number(item?.hoursEach);
    if (!isFiniteNumber(count) || !isFiniteNumber(hoursEach)) {
      return { error: "Every format needs a numeric count and hours per piece." };
    }
    if (count < 0 || hoursEach < 0) {
      return { error: "Counts and hours per piece cannot be negative." };
    }
    if (count > 500 || hoursEach > 100) {
      return { error: "That output is outside a realistic weekly range — check the counts." };
    }
    cleaned.push({
      id: String(item?.id ?? cleaned.length),
      label: String(item?.label ?? "Format"),
      count,
      hoursEach,
      hours: count * hoursEach,
    });
  }

  if (adminHours < 0) return { error: "Admin hours cannot be negative." };
  if (daysOffPerWeek < 0 || daysOffPerWeek > DAYS_PER_WEEK - 1) {
    return { error: "Days off must be between 0 and 6 — a 7-day week off means no workload to score." };
  }
  if (sleepHours < 3 || sleepHours > 12) {
    return { error: "Average sleep should be between 3 and 12 hours a night." };
  }
  if (weeksSinceBreak < 0 || weeksSinceBreak > 260) {
    return { error: "Weeks since your last break should be between 0 and 260." };
  }
  if (targetHours <= 0 || targetHours > 100) {
    return { error: "Set a target week between 1 and 100 hours." };
  }

  const productionHours = cleaned.reduce((sum, item) => sum + item.hours, 0);
  const totalHours = productionHours + adminHours;

  const wakingHoursPerDay = HOURS_PER_DAY - sleepHours;
  const wakingHoursPerWeek = wakingHoursPerDay * DAYS_PER_WEEK;
  if (totalHours > wakingHoursPerWeek) {
    return {
      error: `That schedule needs ${Math.round(totalHours)} hours but you are only awake about ${Math.round(
        wakingHoursPerWeek,
      )} hours a week — recheck the counts or hours per piece.`,
    };
  }

  const workingDays = DAYS_PER_WEEK - daysOffPerWeek;
  const hoursPerWorkingDay = totalHours / workingDays;
  // The weekly check above can pass while the same hours are crammed into too
  // few working days to be physically possible — guard the per-day rate too.
  if (hoursPerWorkingDay > wakingHoursPerDay) {
    return {
      error: `Spread over ${workingDays} working day${workingDays === 1 ? "" : "s"}, that schedule needs ${Math.round(
        hoursPerWorkingDay,
      )} hours on each working day, but you are only awake about ${Math.round(
        wakingHoursPerDay,
      )} hours on a working day — spread the work over more days or lower the counts.`,
    };
  }
  const shareOfWakingDay = wakingHoursPerDay > 0 ? (hoursPerWorkingDay / wakingHoursPerDay) * 100 : 0;

  const sleepDeficitPerNight = Math.max(0, MIN_ADULT_SLEEP_HOURS - sleepHours);
  const weeklySleepDebt = sleepDeficitPerNight * DAYS_PER_WEEK;

  // Component scores, each 0-100.
  const hoursScore = interpolate(HOURS_CURVE, totalHours);
  // Two hours below the 7-hour floor scores the component out.
  const sleepScore = clamp(sleepDeficitPerNight / 2, 0, 1) * 100;
  const restScore = clamp((HEALTHY_REST_DAYS - daysOffPerWeek) / HEALTHY_REST_DAYS, 0, 1) * 100;
  const breakScore =
    clamp((weeksSinceBreak - BREAK_FREE_WEEKS) / (BREAK_MAX_WEEKS - BREAK_FREE_WEEKS), 0, 1) * 100;

  const rawScore = clamp(
    (hoursScore * SCORE_WEIGHTS.hours +
      sleepScore * SCORE_WEIGHTS.sleep +
      restScore * SCORE_WEIGHTS.restDays +
      breakScore * SCORE_WEIGHTS.timeSinceBreak) /
      100,
    0,
    100,
  );
  // Round once, here, so every downstream consumer (the displayed number, the
  // band/level lookup and the score bar width) reads the same value — a raw
  // score that rounds up to the next band's floor must not show that band's
  // label next to a number that still reads like the band below it.
  const score = Math.round(rawScore);

  const band = bandForScore(score);

  // What the same mix looks like if it is scaled to the target week. Admin
  // hours (email, brand deals, analytics, community) are not reducible by
  // cutting output the way production hours are, so they are held fixed and
  // only the production side is scaled down to close the gap. Scaling both
  // together (targetHours / totalHours) previously under-cut production and
  // still left the reconstructed total above the target whenever adminHours
  // was non-trivial.
  const adminAloneExceedsTarget = totalHours > targetHours && adminHours >= targetHours;
  let scale;
  if (totalHours <= targetHours) {
    // Already at or under target — nothing to trim.
    scale = 1;
  } else if (adminAloneExceedsTarget) {
    // Admin hours alone already meet or exceed the target: no amount of
    // trimming production gets there, so every suggested count drops to zero.
    scale = 0;
  } else if (productionHours > 0) {
    scale = clamp((targetHours - adminHours) / productionHours, 0, 10);
  } else {
    scale = 1;
  }
  const trimmed = cleaned.map((item) => ({
    ...item,
    share: totalHours > 0 ? (item.hours / totalHours) * 100 : 0,
    suggestedCount: scale >= 1 ? item.count : Math.floor(item.count * scale),
  }));

  const flags = [];
  if (totalHours >= HIGH_RISK_WEEKLY_HOURS) {
    flags.push(
      `${Math.round(totalHours)} h/week is at or above the 55-hour mark the WHO/ILO links to higher stroke and heart disease risk.`,
    );
  } else if (totalHours > WORKING_TIME_LIMIT_HOURS) {
    flags.push(
      `${Math.round(totalHours)} h/week is above the 48-hour average ceiling in the EU Working Time Directive.`,
    );
  }
  if (daysOffPerWeek < MIN_REST_DAYS_PER_WEEK) {
    flags.push("No full rest day — ILO Convention No. 14 sets 24 consecutive rest hours in every 7 days.");
  }
  if (sleepDeficitPerNight > 0) {
    flags.push(
      `Sleeping ${sleepHours} h against the 7-hour adult floor builds about ${weeklySleepDebt.toFixed(1)} h of sleep debt a week.`,
    );
  }
  if (weeksSinceBreak >= BREAK_MAX_WEEKS) {
    flags.push(`${Math.round(weeksSinceBreak)} weeks without a full week off — schedule one and bank content first.`);
  }
  if (adminAloneExceedsTarget) {
    flags.push(
      `Admin & comms alone (${Math.round(adminHours)} h) already meets or exceeds your ${Math.round(
        targetHours,
      )}-hour target, so no amount of trimming production output reaches it — the target hours need to go up, or admin time needs to come down first.`,
    );
  }
  if (flags.length === 0) {
    flags.push("No threshold breached — this schedule is inside published working-time and sleep guidance.");
  }

  return {
    productionHours,
    adminHours,
    totalHours,
    workingDays,
    hoursPerWorkingDay,
    shareOfWakingDay,
    sleepDeficitPerNight,
    weeklySleepDebt,
    score,
    level: band.level,
    bandNote: band.note,
    components: {
      hours: hoursScore,
      sleep: sleepScore,
      restDays: restScore,
      timeSinceBreak: breakScore,
    },
    hoursVsTarget: totalHours - targetHours,
    hoursVsFullTime: totalHours - FULL_TIME_HOURS,
    hoursVsWorkingTimeLimit: totalHours - WORKING_TIME_LIMIT_HOURS,
    hoursVsHighRisk: totalHours - HIGH_RISK_WEEKLY_HOURS,
    targetHours,
    scale,
    adminAloneExceedsTarget,
    items: trimmed,
    flags,
  };
}
