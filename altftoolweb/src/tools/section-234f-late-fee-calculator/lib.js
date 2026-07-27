/**
 * Section 234F (fee for default in furnishing return of income) and section 234A
 * (interest for defaults in furnishing return) of the Income-tax Act, 1961 — India.
 *
 * All rules encoded here are the post-Finance Act 2021 position, i.e. applicable to
 * assessment year 2021-22 and later, when the two-slab (Rs 5,000 / Rs 10,000) structure
 * was replaced by a single Rs 5,000 ceiling.
 */

/** Section 234F(1)(a): fee where the return is furnished after the due date u/s 139(1). */
export const LATE_FEE_STANDARD = 5000;

/**
 * Proviso to section 234F(1): the fee shall not exceed Rs 1,000 where the total income
 * does not exceed Rs 5,00,000.
 */
export const LATE_FEE_REDUCED = 1000;
export const REDUCED_FEE_INCOME_CEILING = 500000;

/** Section 234A(1): simple interest at 1% for every month or part of a month of delay. */
export const INTEREST_234A_MONTHLY_RATE = 0.01;

/**
 * Basic exemption limits. Section 234F bites only when a return was required u/s 139(1),
 * so a person whose total income is below the exemption limit (and who is not caught by
 * the seventh proviso to 139(1)) pays no fee.
 * New regime limits are those enacted under section 115BAC.
 */
export const EXEMPTION_LIMIT_OPTIONS = [
  {
    id: "new-fy2025-26",
    label: "New regime u/s 115BAC — FY 2025-26 onwards",
    limit: 400000,
  },
  {
    id: "new-fy2023-25",
    label: "New regime u/s 115BAC — FY 2023-24 / 2024-25",
    limit: 300000,
  },
  { id: "old-below-60", label: "Old regime — below 60 years", limit: 250000 },
  { id: "old-senior", label: "Old regime — senior citizen (60 to 79)", limit: 300000 },
  { id: "old-super-senior", label: "Old regime — super senior citizen (80+)", limit: 500000 },
];

/**
 * Ordinary due dates under section 139(1). CBDT extends these by notification in many
 * years, so the tool always lets the user type the date that actually applied.
 */
export const DUE_DATE_PRESETS = [
  { id: "non-audit", label: "Individual / HUF, no audit — 31 July", month: 7, day: 31 },
  { id: "audit", label: "Accounts requiring audit — 31 October", month: 10, day: 31 },
  { id: "transfer-pricing", label: "Transfer pricing report u/s 92E — 30 November", month: 11, day: 30 },
];

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Parse an ISO yyyy-mm-dd string into a UTC-midnight Date, or null when invalid. */
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

/** Whole days between two UTC-midnight dates. */
export function daysBetween(from, to) {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

/**
 * Section 234A counts "every month or part of a month" from the day after the due date
 * to the date the return is furnished. A calendar month is used, and any spill-over of
 * even a single day counts as a further whole month.
 */
export function monthsOrPartMonths(dueDate, filingDate) {
  if (filingDate <= dueDate) return 0;
  let months =
    (filingDate.getUTCFullYear() - dueDate.getUTCFullYear()) * 12 +
    (filingDate.getUTCMonth() - dueDate.getUTCMonth());
  if (filingDate.getUTCDate() > dueDate.getUTCDate()) months += 1;
  return Math.max(1, months);
}

/**
 * Compute the section 234F fee plus section 234A interest for a belated return.
 *
 * @param {object} input
 * @param {number} input.totalIncome        Total income assessed, in rupees.
 * @param {number} input.exemptionLimit     Basic exemption limit applicable to the taxpayer.
 * @param {string} input.dueDate            Due date u/s 139(1), yyyy-mm-dd.
 * @param {string} input.filingDate         Date the return is (or will be) furnished, yyyy-mm-dd.
 * @param {number} [input.taxOutstanding]   Self-assessment tax still unpaid, for 234A interest.
 * @param {boolean} [input.mustFileAnyway]  True when the seventh proviso to 139(1) forces a return.
 * @returns {object} result, or { error } when the input cannot produce a meaningful answer.
 */
export function computeLateFilingFee({
  totalIncome,
  exemptionLimit,
  dueDate,
  filingDate,
  taxOutstanding = 0,
  mustFileAnyway = false,
}) {
  const income = Number(totalIncome);
  const limit = Number(exemptionLimit);
  const unpaidTax = Number(taxOutstanding);

  if (!Number.isFinite(income)) return { error: "Enter your total income as a number." };
  if (income < 0) return { error: "Total income cannot be negative." };
  if (!Number.isFinite(limit) || limit <= 0) {
    return { error: "Choose the basic exemption limit that applies to you." };
  }
  if (!Number.isFinite(unpaidTax) || unpaidTax < 0) {
    return { error: "Unpaid self-assessment tax cannot be negative." };
  }

  const due = parseIsoDate(dueDate);
  const filed = parseIsoDate(filingDate);
  if (!due) return { error: "Enter a valid due date in yyyy-mm-dd form." };
  if (!filed) return { error: "Enter a valid filing date in yyyy-mm-dd form." };

  const daysLate = daysBetween(due, filed);
  const isLate = daysLate > 0;

  // Section 234F applies only where a return was required under section 139(1).
  const filingRequired = mustFileAnyway || income > limit;

  let lateFee = 0;
  let feeReason;
  if (!isLate) {
    feeReason = "Return furnished on or before the due date — no fee under section 234F.";
  } else if (!filingRequired) {
    feeReason =
      "Total income is below the basic exemption limit and no other filing trigger applies, so section 234F does not levy a fee.";
  } else if (income <= REDUCED_FEE_INCOME_CEILING) {
    lateFee = LATE_FEE_REDUCED;
    feeReason =
      "Total income does not exceed Rs 5,00,000, so the proviso to section 234F caps the fee at Rs 1,000.";
  } else {
    lateFee = LATE_FEE_STANDARD;
    feeReason = "Total income exceeds Rs 5,00,000, so the full section 234F fee of Rs 5,000 applies.";
  }

  const interestMonths = monthsOrPartMonths(due, filed);
  const interest234A = Math.floor(unpaidTax * INTEREST_234A_MONTHLY_RATE * interestMonths);

  return {
    isLate,
    daysLate: Math.max(0, daysLate),
    filingRequired,
    lateFee,
    feeReason,
    interestMonths,
    interest234A,
    interestRatePercent: INTEREST_234A_MONTHLY_RATE * 100,
    unpaidTax,
    totalPayable: lateFee + interest234A,
    totalIncome: income,
    exemptionLimit: limit,
  };
}
