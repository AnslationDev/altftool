/**
 * College fee instalment planner.
 *
 * A semester fee schedule is a series of dated withdrawals, so "total fee divided by
 * total months" is the wrong answer — it under-funds the instalment that falls due first.
 * The plan here treats every instalment as its own sinking fund:
 *
 *   monthsAvailable(j) = how many monthly deposits land on or before instalment j's due date
 *   shortfall(j)       = instalment amount - savings already allocated to it (earliest first)
 *   setAside(j)        = shortfall(j) * i / ((1 + i)^monthsAvailable(j) - 1)      when i > 0
 *                      = shortfall(j) / monthsAvailable(j)                        when i = 0
 *
 * where i is the monthly rate on the parked money. That is the standard future value of an
 * ordinary annuity solved for the payment. What you actually set aside in a given month is
 * the sum of the set-asides of every instalment not yet paid, so the monthly commitment
 * steps down each time a semester is cleared.
 *
 * Existing savings are allocated to the earliest due dates first, because those are the
 * ones with the least time left to fund.
 *
 * All dates are supplied by the caller — nothing here reads the system clock, so the same
 * inputs always produce the same schedule.
 */

/** Fee money is needed within months, so the default plan assumes a plain savings balance. */
export const DEFAULT_ANNUAL_RATE = 0;
/** How many days before a due date the reminder should fire. */
export const DEFAULT_REMINDER_LEAD_DAYS = 15;
export const MAX_INSTALMENTS = 24;
export const MAX_MONTHS_BETWEEN = 24;
/** Money you may need within a year should not be assumed to earn more than this. */
export const MAX_ANNUAL_RATE_PCT = 15;
export const MAX_REMINDER_LEAD_DAYS = 90;

const MS_PER_DAY = 86400000;

const toNumber = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : NaN;
};

const round0 = (value) => Math.round(value);
const round2 = (value) => Math.round(value * 100) / 100;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Parse a yyyy-mm-dd string into a UTC timestamp. Returns null if unusable. */
export function parseIsoDate(value) {
  if (typeof value !== "string" || !ISO_DATE.test(value.trim())) return null;
  const [y, m, d] = value.trim().split("-").map(Number);
  const stamp = Date.UTC(y, m - 1, d);
  const check = new Date(stamp);
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) {
    return null;
  }
  return stamp;
}

export function formatIsoDate(stamp) {
  const date = new Date(stamp);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Calendar month addition, clamping to the last day of a shorter month (31 Jan + 1 = 28 Feb). */
export function addMonths(stamp, count) {
  const date = new Date(stamp);
  const day = date.getUTCDate();
  const firstOfTarget = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + count, 1),
  );
  const daysInTargetMonth = new Date(
    Date.UTC(firstOfTarget.getUTCFullYear(), firstOfTarget.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return Date.UTC(
    firstOfTarget.getUTCFullYear(),
    firstOfTarget.getUTCMonth(),
    Math.min(day, daysInTargetMonth),
  );
}

const addDays = (stamp, days) => stamp + days * MS_PER_DAY;

/** Monthly deposits (on the same day of month as `from`) landing on or before `until`. */
function depositsBefore(from, until, cap) {
  let count = 0;
  while (count < cap && addMonths(from, count + 1) <= until) count += 1;
  return count;
}

/** Payment that grows to `target` in `months` at monthly rate `rate`, deposits at month end. */
function sinkingFundPayment(target, months, rate) {
  if (!(target > 0)) return 0;
  if (!(months > 0)) return null;
  if (rate <= 0) return target / months;
  return (target * rate) / (Math.pow(1 + rate, months) - 1);
}

/**
 * @param {object} input
 * @param {number|string} input.totalFee Total fee to be paid across all instalments.
 * @param {number|string} input.instalments How many instalments the fee is split into.
 * @param {string} input.firstDueDate yyyy-mm-dd of the first instalment.
 * @param {number|string} input.monthsBetween Gap between instalments, in months.
 * @param {string} input.today yyyy-mm-dd to plan from.
 * @param {number|string} [input.alreadySaved] Money already parked for these fees.
 * @param {number|string} [input.annualRate] Interest on the parked money, % per year.
 * @param {number|string} [input.reminderLeadDays] Days before a due date to be reminded.
 */
export function planFeeInstalments({
  totalFee,
  instalments,
  firstDueDate,
  monthsBetween,
  today,
  alreadySaved = 0,
  annualRate = DEFAULT_ANNUAL_RATE,
  reminderLeadDays = DEFAULT_REMINDER_LEAD_DAYS,
} = {}) {
  const fee = toNumber(totalFee);
  const count = toNumber(instalments);
  const gap = toNumber(monthsBetween);
  const saved = toNumber(alreadySaved);
  const rate = toNumber(annualRate);
  const lead = toNumber(reminderLeadDays);

  const numbers = [fee, count, gap, saved, rate, lead];
  if (numbers.some((value) => Number.isNaN(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (numbers.some((value) => value < 0)) {
    return { error: "Fees, counts and rates cannot be negative." };
  }
  if (!(fee > 0)) return { error: "Enter the total fee to be paid." };
  if (!(count >= 1) || count > MAX_INSTALMENTS || Math.round(count) !== count) {
    return { error: `Number of instalments must be a whole number from 1 to ${MAX_INSTALMENTS}.` };
  }
  if (gap < 1 || gap > MAX_MONTHS_BETWEEN || Math.round(gap) !== gap) {
    return {
      error: `Months between instalments must be a whole number from 1 to ${MAX_MONTHS_BETWEEN}.`,
    };
  }
  if (rate > MAX_ANNUAL_RATE_PCT) {
    return {
      error: `Money needed within months should not be assumed to earn more than ${MAX_ANNUAL_RATE_PCT}% a year.`,
    };
  }
  if (lead > MAX_REMINDER_LEAD_DAYS) {
    return { error: `Set a reminder lead of ${MAX_REMINDER_LEAD_DAYS} days or fewer.` };
  }

  const start = parseIsoDate(today);
  const firstDue = parseIsoDate(firstDueDate);
  if (start === null) return { error: "Enter a valid planning date in yyyy-mm-dd form." };
  if (firstDue === null) return { error: "Enter a valid first due date in yyyy-mm-dd form." };
  if (firstDue < start) {
    return { error: "The first due date is already past — plan from an earlier date." };
  }

  const perInstalment = fee / count;
  const monthlyRate = rate / 12 / 100;
  const depositCap = count * gap + 24;

  let remainingSavings = saved;
  const schedule = [];

  for (let n = 0; n < count; n += 1) {
    const due = addMonths(firstDue, n * gap);
    const months = depositsBefore(start, due, depositCap);
    const fromSavings = Math.min(remainingSavings, perInstalment);
    remainingSavings -= fromSavings;
    const shortfall = perInstalment - fromSavings;

    if (shortfall > 0.005 && months === 0) {
      return {
        error:
          "An instalment falls due before you can make even one monthly deposit, and your savings do not cover it. Pay that one from existing funds or plan from an earlier date.",
      };
    }

    const setAside = shortfall > 0.005 ? sinkingFundPayment(shortfall, months, monthlyRate) : 0;

    schedule.push({
      number: n + 1,
      dueDate: formatIsoDate(due),
      remindOn: formatIsoDate(addDays(due, -lead)),
      daysAway: Math.round((due - start) / MS_PER_DAY),
      monthsToSave: months,
      amount: round0(perInstalment),
      fundedFromSavings: round0(fromSavings),
      shortfall: round0(shortfall),
      monthlySetAside: setAside === null ? null : round2(setAside),
    });
  }

  // Monthly commitment steps down as each instalment is cleared.
  const phases = [];
  let previousMonths = 0;
  let totalDeposited = 0;
  for (let n = 0; n < schedule.length; n += 1) {
    const months = schedule[n].monthsToSave;
    const span = months - previousMonths;
    if (span > 0) {
      const monthly = schedule
        .slice(n)
        .reduce((sum, row) => sum + (row.monthlySetAside || 0), 0);
      phases.push({
        fromMonth: previousMonths + 1,
        toMonth: months,
        months: span,
        monthly: round2(monthly),
        untilDue: schedule[n].dueDate,
      });
      totalDeposited += monthly * span;
    }
    previousMonths = Math.max(previousMonths, months);
  }

  const firstMonthOutgo = phases.length ? phases[0].monthly : 0;
  const interestEarned = round0(Math.max(0, fee - saved - totalDeposited));

  return {
    totalFee: round0(fee),
    instalments: count,
    perInstalment: round0(perInstalment),
    firstMonthOutgo: round2(firstMonthOutgo),
    alreadySaved: round0(saved),
    savingsUsed: round0(saved - remainingSavings),
    savingsLeftOver: round0(remainingSavings),
    totalDeposited: round0(totalDeposited),
    interestEarned,
    firstDueDate: formatIsoDate(firstDue),
    lastDueDate: schedule[schedule.length - 1].dueDate,
    monthsOfSaving: schedule[schedule.length - 1].monthsToSave,
    reminderLeadDays: lead,
    fullyCovered: firstMonthOutgo === 0,
    phases,
    schedule,
  };
}
