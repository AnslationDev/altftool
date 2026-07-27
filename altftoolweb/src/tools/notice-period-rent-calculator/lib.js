/**
 * Rent still owed when a tenant leaves before the notice period or the lock-in has run out.
 *
 * How the liability arises
 *  - A notice clause makes the tenancy continue for a fixed number of months after notice is
 *    served. Leaving early does not end the rent; it ends occupation, and the rent for the unserved
 *    balance stays payable, which is why landlords adjust it against the deposit.
 *  - A lock-in clause fixes a minimum period from the start of the agreement during which neither
 *    side may terminate. Where a lock-in is still running, the liability ends on the later of the
 *    lock-in end date and the notice end date, not the earlier one.
 *  - Section 21(3) of the Model Tenancy Act, 2021 works the other way round: a tenant who does NOT
 *    vacate after the tenancy ends owes twice the monthly rent for the first two months and four
 *    times the rent after that.
 *
 * All dates are taken as arguments in YYYY-MM-DD form; nothing here reads the current date.
 */

/** Bases for converting a monthly rent into a daily rate. */
export const DAILY_RENT_BASES = {
  thirty: { label: "30-day month", divisor: 30 },
  actual: { label: "Actual days (x12 / 365)", divisor: 365 },
};

export const MONTHS_PER_YEAR = 12;
export const DAYS_PER_YEAR = 365;
export const MAX_NOTICE_MONTHS = 12;
export const MAX_LOCK_IN_MONTHS = 60;
/** Model Tenancy Act s.21(3) multipliers for overstaying, shown for context. */
export const OVERSTAY_MULTIPLIERS = { firstTwoMonths: 2, afterwards: 4 };

const MS_PER_DAY = 86400000;

function isNum(value) {
  return typeof value === "number" && Number.isFinite(value);
}

/** Parse "YYYY-MM-DD" into {year, month, day}, rejecting impossible dates like 2026-02-30. */
export function parseDate(value) {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1900 || year > 2200) return null;
  const stamp = Date.UTC(year, month - 1, day);
  const check = new Date(stamp);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day, stamp };
}

const pad = (value) => String(value).padStart(2, "0");

/** Format {year, month, day} back to "YYYY-MM-DD". */
export function formatDate(date) {
  return `${date.year}-${pad(date.month)}-${pad(date.day)}`;
}

/** Days in a month, Gregorian leap rule. */
export function daysInMonth(year, month) {
  if (month === 2) {
    const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return leap ? 29 : 28;
  }
  return [1, 3, 5, 7, 8, 10, 12].includes(month) ? 31 : 30;
}

/**
 * Add whole months to a date, clamping the day to the length of the target month so that
 * 31 January plus one month lands on 28 or 29 February rather than spilling into March.
 */
export function addMonthsToDate(date, count) {
  const zeroBased = date.year * 12 + (date.month - 1) + count;
  const year = Math.floor(zeroBased / 12);
  const month = (zeroBased % 12) + 1;
  const day = Math.min(date.day, daysInMonth(year, month));
  return { year, month, day, stamp: Date.UTC(year, month - 1, day) };
}

/** Whole days from one date to another. Negative when the second date is earlier. */
export function daysBetween(from, to) {
  return Math.round((to.stamp - from.stamp) / MS_PER_DAY);
}

/** Rent for a single day on the chosen basis. */
export function dailyRent(monthlyRent, basis = "thirty") {
  if (!isNum(monthlyRent) || monthlyRent <= 0) return 0;
  if (basis === "actual") return (monthlyRent * MONTHS_PER_YEAR) / DAYS_PER_YEAR;
  return monthlyRent / DAILY_RENT_BASES.thirty.divisor;
}

/**
 * Work out the rent owed for leaving early.
 *
 * @param {object} input
 * @param {number} input.monthlyRent
 * @param {number} input.noticeMonths        Months of notice the agreement requires.
 * @param {string} input.noticeGivenDate     Date written notice was served, YYYY-MM-DD.
 * @param {string} input.vacateDate          Date you plan to hand over the keys, YYYY-MM-DD.
 * @param {string} input.agreementStartDate  Needed only when a lock-in applies.
 * @param {number} input.lockInMonths        Lock-in length from the start of the agreement.
 * @param {"thirty"|"actual"} input.dailyRentBasis
 * @param {number} input.deposit             Deposit held, for the settlement view.
 * @param {boolean} input.adjustAgainstDeposit
 */
export function computeNoticeLiability({
  monthlyRent,
  noticeMonths,
  noticeGivenDate,
  vacateDate,
  agreementStartDate = "",
  lockInMonths = 0,
  dailyRentBasis = "thirty",
  deposit = 0,
  adjustAgainstDeposit = true,
}) {
  if (!isNum(monthlyRent) || monthlyRent <= 0) {
    return { error: "Monthly rent must be greater than zero." };
  }
  if (
    !isNum(noticeMonths) ||
    !Number.isInteger(noticeMonths) ||
    noticeMonths < 0 ||
    noticeMonths > MAX_NOTICE_MONTHS
  ) {
    return { error: `Notice period must be a whole number of months between 0 and ${MAX_NOTICE_MONTHS}.` };
  }
  if (
    !isNum(lockInMonths) ||
    !Number.isInteger(lockInMonths) ||
    lockInMonths < 0 ||
    lockInMonths > MAX_LOCK_IN_MONTHS
  ) {
    return { error: `Lock-in must be a whole number of months between 0 and ${MAX_LOCK_IN_MONTHS}.` };
  }
  if (!DAILY_RENT_BASES[dailyRentBasis]) {
    return { error: "Choose a 30-day month or actual days for the daily rent." };
  }
  if (!isNum(deposit) || deposit < 0) {
    return { error: "The deposit must be zero or more." };
  }

  const notice = parseDate(noticeGivenDate);
  if (!notice) return { error: "Enter a valid date for when notice was given." };

  const vacate = parseDate(vacateDate);
  if (!vacate) return { error: "Enter a valid date for when you will hand over the keys." };

  if (daysBetween(notice, vacate) < 0) {
    return { error: "You cannot hand over the keys before notice was served." };
  }

  let lockInEnd = null;
  let start = null;
  if (lockInMonths > 0) {
    start = parseDate(agreementStartDate);
    if (!start) {
      return { error: "A lock-in needs the date the agreement started." };
    }
    if (daysBetween(start, notice) < 0) {
      return { error: "Notice cannot be served before the agreement started." };
    }
    lockInEnd = addMonthsToDate(start, lockInMonths);
  }

  const noticeEnd = addMonthsToDate(notice, noticeMonths);
  const noticeBinds = !lockInEnd || daysBetween(lockInEnd, noticeEnd) >= 0;
  const liabilityEnd = noticeBinds ? noticeEnd : lockInEnd;

  const shortfallDays = Math.max(0, daysBetween(vacate, liabilityEnd));
  const perDay = dailyRent(monthlyRent, dailyRentBasis);
  const liability = shortfallDays * perDay;

  const depositApplied = adjustAgainstDeposit ? Math.min(deposit, liability) : 0;
  const balancePayable = liability - depositApplied;
  const depositReturned = Math.max(0, deposit - depositApplied);

  const noticeServedDays = Math.max(0, daysBetween(notice, vacate));
  const noticeRequiredDays = Math.max(0, daysBetween(notice, noticeEnd));

  return {
    monthlyRent,
    dailyRent: perDay,
    dailyRentBasisLabel: DAILY_RENT_BASES[dailyRentBasis].label,
    noticeGivenDate: formatDate(notice),
    vacateDate: formatDate(vacate),
    noticeEndDate: formatDate(noticeEnd),
    lockInEndDate: lockInEnd ? formatDate(lockInEnd) : null,
    liabilityEndDate: formatDate(liabilityEnd),
    bindingClause: noticeBinds ? "notice period" : "lock-in period",
    shortfallDays,
    shortfallMonthsEquivalent: shortfallDays / DAILY_RENT_BASES.thirty.divisor,
    liability,
    deposit,
    depositApplied,
    depositReturned,
    balancePayable,
    noticeServedDays,
    noticeRequiredDays,
    clean: shortfallDays === 0,
  };
}
