/**
 * Savings goal countdown.
 *
 * A goal fund has two engines: the balance you already hold, which compounds, and the
 * monthly contribution, which is an ordinary annuity. With monthly rate i = r/12 and n
 * months elapsed, the balance is
 *
 *     FV(n) = A * (1 + i)^n + C * ((1 + i)^n - 1) / i
 *
 * Setting FV(n) = target and solving for n gives the countdown in closed form:
 *
 *     (1 + i)^n = (target + C/i) / (A + C/i)
 *     n = ln[(target + C/i) / (A + C/i)] / ln(1 + i)
 *
 * When i = 0 the annuity collapses to simple addition and n = (target - A) / C.
 * The goal is unreachable when the bracketed ratio is <= 0 or C = 0 with i = 0, which is
 * reported as an error rather than as Infinity.
 *
 * The same solve, run against 25%, 50% and 75% of the target, produces milestone dates.
 *
 * For a deadline, the direction is reversed: the contribution needed to land exactly on
 * the target in n months is
 *
 *     C = (target - A * (1 + i)^n) * i / ((1 + i)^n - 1)      (i > 0)
 *     C = (target - A) / n                                     (i = 0)
 *
 * Dates are derived only from the reference date passed in, so the module stays pure.
 */

/** Average calendar month, from the 365.25-day Gregorian year. Used for date gaps only. */
export const DAYS_PER_MONTH = 365.25 / 12;
/** A goal that takes longer than 60 years is not a plan. */
export const MAX_MONTHS = 720;
/** Above this, an assumed return stops being a projection and becomes a fantasy. */
export const MAX_RATE_PCT = 30;
/** Progress checkpoints reported as dates. */
export const MILESTONES = [0.25, 0.5, 0.75, 1];

const toNumber = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : NaN;
};

const round0 = (value) => Math.round(value);
const round1 = (value) => Math.round(value * 10) / 10;
const round2 = (value) => Math.round(value * 100) / 100;

/** Parse an ISO yyyy-mm-dd string into a UTC date, or null. Avoids timezone drift. */
export function parseIsoDate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  if (Number.isNaN(date.getTime())) return null;
  if (date.getUTCMonth() !== Number(m) - 1) return null;
  return date;
}

export function formatIsoDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

/**
 * Add whole months, clamping the day so 31 Jan + 1 month is 28/29 Feb rather than 2/3 Mar.
 */
export function addMonths(date, months) {
  const day = date.getUTCDate();
  const shifted = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const lastDay = new Date(
    Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, 0),
  ).getUTCDate();
  shifted.setUTCDate(Math.min(day, lastDay));
  return shifted;
}

/** Months needed for A to reach goal at monthly rate i with contribution C. */
function monthsToReach(goal, principal, contribution, monthlyRate) {
  if (principal >= goal) return 0;
  if (monthlyRate <= 0) {
    if (!(contribution > 0)) return null;
    return (goal - principal) / contribution;
  }
  const base = contribution / monthlyRate;
  const numerator = goal + base;
  const denominator = principal + base;
  if (!(denominator > 0) || !(numerator > 0)) return null;
  const ratio = numerator / denominator;
  if (!(ratio > 1)) return null;
  const months = Math.log(ratio) / Math.log(1 + monthlyRate);
  return Number.isFinite(months) && months > 0 ? months : null;
}

/**
 * @param {object} input
 * @param {number|string} input.targetAmount Amount you are saving towards.
 * @param {number|string} [input.savedSoFar] Balance already in the goal fund.
 * @param {number|string} [input.monthlyContribution] Amount added at the end of each month.
 * @param {number|string} [input.annualReturn] Annual return on the balance, % per year.
 * @param {string} input.asOfDate Reference date, ISO yyyy-mm-dd. Supplied by the caller.
 * @param {string} [input.deadlineDate] Optional date you want the goal met by, ISO yyyy-mm-dd.
 */
export function trackSavingsGoal({
  targetAmount,
  savedSoFar = 0,
  monthlyContribution = 0,
  annualReturn = 0,
  asOfDate,
  deadlineDate = "",
} = {}) {
  const target = toNumber(targetAmount);
  const saved = toNumber(savedSoFar);
  const contribution = toNumber(monthlyContribution);
  const ratePct = toNumber(annualReturn);

  const numbers = [target, saved, contribution, ratePct];
  if (numbers.some((value) => Number.isNaN(value))) {
    return { error: "Enter valid numbers for the target, balance, contribution and return." };
  }
  if (numbers.some((value) => value < 0)) {
    return { error: "Amounts and the return rate cannot be negative." };
  }
  if (!(target > 0)) return { error: "Enter the amount you are saving towards." };
  if (ratePct > MAX_RATE_PCT) {
    return { error: `An assumed return above ${MAX_RATE_PCT}% a year is not a realistic plan.` };
  }

  const start = parseIsoDate(asOfDate);
  if (!start) return { error: "Enter a valid start date." };

  const deadline = deadlineDate ? parseIsoDate(deadlineDate) : null;
  if (deadlineDate && !deadline) return { error: "Enter a valid deadline date, or leave it blank." };
  if (deadline && deadline.getTime() <= start.getTime()) {
    return { error: "The deadline must be after the start date." };
  }

  const monthlyRate = ratePct / 100 / 12;
  const remaining = Math.max(0, target - saved);
  const progressPct = Math.min(100, (saved / target) * 100);
  const alreadyMet = saved >= target;

  const rawMonths = monthsToReach(target, saved, contribution, monthlyRate);
  if (rawMonths === null) {
    return {
      error:
        contribution > 0
          ? "With this contribution the balance never reaches the target — increase the monthly amount."
          : "With no monthly contribution and no return the balance never grows. Add a monthly amount.",
    };
  }
  if (rawMonths > MAX_MONTHS) {
    return { error: "This target is more than 60 years away. Raise the monthly amount or lower the target." };
  }

  const wholeMonths = Math.max(0, Math.ceil(rawMonths - 1e-9));
  const goalDate = addMonths(start, wholeMonths);
  const daysAway = Math.round((goalDate.getTime() - start.getTime()) / 86400000);

  const milestones = MILESTONES.map((fraction) => {
    const amount = target * fraction;
    const reached = saved >= amount;
    const months = reached ? 0 : monthsToReach(amount, saved, contribution, monthlyRate);
    const whole = months === null ? null : Math.max(0, Math.ceil(months - 1e-9));
    return {
      pct: Math.round(fraction * 100),
      amount: round0(amount),
      reached,
      months: whole,
      date: whole === null ? null : formatIsoDate(addMonths(start, whole)),
    };
  });

  // Contributions vs growth over the countdown, so the split is visible.
  const totalContributed = contribution * wholeMonths;
  const growthTotal = Math.max(0, target - saved - totalContributed);

  let deadlinePlan = null;
  if (deadline) {
    const monthsToDeadline = (deadline.getTime() - start.getTime()) / 86400000 / DAYS_PER_MONTH;
    const n = Math.max(1, Math.round(monthsToDeadline));
    let required;
    if (alreadyMet) {
      required = 0;
    } else if (monthlyRate <= 0) {
      required = (target - saved) / n;
    } else {
      const growth = Math.pow(1 + monthlyRate, n);
      required = ((target - saved * growth) * monthlyRate) / (growth - 1);
    }
    required = Math.max(0, Number.isFinite(required) ? required : 0);
    deadlinePlan = {
      months: n,
      date: formatIsoDate(deadline),
      requiredMonthly: round0(required),
      extraMonthly: round0(Math.max(0, required - contribution)),
      onTrack: wholeMonths <= n,
      monthsLate: Math.max(0, wholeMonths - n),
      monthsEarly: Math.max(0, n - wholeMonths),
    };
  }

  return {
    target: round0(target),
    saved: round0(saved),
    remaining: round0(remaining),
    progressPct: round1(progressPct),
    alreadyMet,
    monthsExact: round2(rawMonths),
    months: wholeMonths,
    years: round1(wholeMonths / 12),
    goalDate: formatIsoDate(goalDate),
    daysAway,
    monthlyContribution: round0(contribution),
    totalContributed: round0(totalContributed),
    growthTotal: round0(growthTotal),
    milestones,
    deadlinePlan,
  };
}
