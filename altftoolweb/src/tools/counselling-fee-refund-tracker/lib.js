/**
 * Counselling / admission fee refund maths — India.
 *
 * The governing rule is the UGC fee-refund policy notified in October 2018
 * (UGC letter D.O.No.F.1-3/2018(CPP-II), reiterated in later academic-session
 * circulars), which all universities and their affiliated colleges must
 * follow. Refund of the aggregate fees is a percentage keyed to when the
 * student withdraws relative to the FORMALLY-NOTIFIED LAST DATE OF ADMISSION:
 *
 *   (i)   15 or more days before the last date .......... 100%
 *   (ii)  less than 15 days before (up to the date) ......  90%
 *   (iii) 15 or fewer days after the last date ...........  80%
 *   (iv)  more than 15, up to 30 days after ..............  50%
 *   (v)   more than 30 days after ........................   0%
 *
 * In case (i) the institution may deduct a processing fee of not more than
 * 5% of the aggregate fees paid, capped at Rs 5,000.
 *
 * Caution/security deposits are refundable separately and are not part of
 * the percentage slab, so they are handled as their own line here.
 */

/** UGC refund slabs, checked in order. daysBefore = lastDate - withdrawalDate. */
export const UGC_REFUND_SLABS = [
  {
    id: "full",
    percent: 100,
    label: "15+ days before the last date of admission",
  },
  {
    id: "ninety",
    percent: 90,
    label: "Less than 15 days before the last date",
  },
  {
    id: "eighty",
    percent: 80,
    label: "Up to 15 days after the last date",
  },
  {
    id: "fifty",
    percent: 50,
    label: "16 to 30 days after the last date",
  },
  {
    id: "zero",
    percent: 0,
    label: "More than 30 days after the last date",
  },
];

/** Slab (i) processing deduction: max 5% of aggregate fees... */
export const PROCESSING_FEE_RATE = 0.05;
/** ...capped at Rs 5,000 (UGC 2018 notification). */
export const PROCESSING_FEE_CAP = 5000;

/** Day-window constants from the UGC table. */
export const FULL_REFUND_MIN_DAYS_BEFORE = 15;
export const EIGHTY_PERCENT_MAX_DAYS_AFTER = 15;
export const FIFTY_PERCENT_MAX_DAYS_AFTER = 30;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Parse an ISO yyyy-mm-dd string into a UTC-midnight Date, or null. */
export function parseIsoDate(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Whole days between two UTC-midnight dates (to - from). */
export function daysBetween(from, to) {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

/** Add whole days to a UTC-midnight date; returns yyyy-mm-dd. */
export function addDaysIso(date, days) {
  const shifted = new Date(date.getTime() + days * MS_PER_DAY);
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const d = String(shifted.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Pick the UGC slab for a withdrawal.
 * @param {number} daysBefore  lastAdmissionDate minus withdrawalDate, in days
 *                             (negative when the withdrawal is after the last date).
 */
export function slabForTiming(daysBefore) {
  if (daysBefore >= FULL_REFUND_MIN_DAYS_BEFORE) return UGC_REFUND_SLABS[0];
  if (daysBefore >= 0) return UGC_REFUND_SLABS[1];
  const daysAfter = -daysBefore;
  if (daysAfter <= EIGHTY_PERCENT_MAX_DAYS_AFTER) return UGC_REFUND_SLABS[2];
  if (daysAfter <= FIFTY_PERCENT_MAX_DAYS_AFTER) return UGC_REFUND_SLABS[3];
  return UGC_REFUND_SLABS[4];
}

/**
 * Compute the expected refund on withdrawal from an admission.
 *
 * @param {object} input
 * @param {number} input.feePaid            Aggregate fees paid (tuition + other charges), Rs.
 * @param {number} [input.securityDeposit]  Refundable caution/security deposit, Rs.
 * @param {string} input.lastAdmissionDate  Formally-notified last date of admission, yyyy-mm-dd.
 * @param {string} input.withdrawalDate     Date the withdrawal request is submitted, yyyy-mm-dd.
 * @param {number} [input.processingDays]   Working days the institution takes to pay (estimate).
 * @returns {object} result, or { error }.
 */
export function computeRefund({
  feePaid,
  securityDeposit = 0,
  lastAdmissionDate,
  withdrawalDate,
  processingDays = 15,
}) {
  const fee = Number(feePaid);
  const deposit = Number(securityDeposit);
  const wait = Number(processingDays);

  if (!Number.isFinite(fee) || fee < 0) {
    return { error: "Enter the aggregate fees paid as a non-negative number." };
  }
  if (!Number.isFinite(deposit) || deposit < 0) {
    return { error: "The security deposit cannot be negative." };
  }
  if (!Number.isFinite(wait) || wait < 0 || wait > 365) {
    return { error: "Expected processing days must be between 0 and 365." };
  }

  const lastDate = parseIsoDate(lastAdmissionDate);
  const withdrawal = parseIsoDate(withdrawalDate);
  if (!lastDate) return { error: "Enter a valid last date of admission (yyyy-mm-dd)." };
  if (!withdrawal) return { error: "Enter a valid withdrawal date (yyyy-mm-dd)." };

  const daysBefore = daysBetween(withdrawal, lastDate);
  const slab = slabForTiming(daysBefore);

  const grossRefund = (fee * slab.percent) / 100;
  const processingDeduction =
    slab.percent === 100 ? Math.min(fee * PROCESSING_FEE_RATE, PROCESSING_FEE_CAP) : 0;
  const netFeeRefund = Math.max(0, grossRefund - processingDeduction);
  const forfeited = fee - netFeeRefund;

  return {
    slabId: slab.id,
    slabLabel: slab.label,
    refundPercent: slab.percent,
    daysBefore: Math.max(0, daysBefore),
    daysAfter: Math.max(0, -daysBefore),
    grossRefund: Math.round(grossRefund),
    processingDeduction: Math.round(processingDeduction),
    netFeeRefund: Math.round(netFeeRefund),
    securityDeposit: Math.round(deposit),
    totalExpected: Math.round(netFeeRefund + deposit),
    forfeited: Math.round(forfeited),
    expectedRefundDate: addDaysIso(withdrawal, wait),
  };
}
