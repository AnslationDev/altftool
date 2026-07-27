/**
 * Invoice late fee calculator — pure logic.
 *
 * Three things can be charged on an overdue invoice, and contracts mix them:
 *
 *   1. Interest on the outstanding principal for the time it was late.
 *   2. A one-off administrative or statutory compensation amount.
 *   3. A recurring penalty expressed as a percentage of the invoice.
 *
 * Interest depends on two choices that change the answer materially: the
 * day-count basis (how a year is measured) and whether interest compounds.
 * Both are exposed rather than assumed.
 *
 * Dates arrive as ISO "YYYY-MM-DD" strings and are compared in UTC, so the
 * module never reads the clock and never shifts with a viewer's timezone.
 */

const MS_PER_DAY = 86400000;
const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Strict ISO date parse that rejects impossible dates such as 2026-02-30. */
export function parseISODate(iso) {
  if (typeof iso !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    return { error: "Enter dates in YYYY-MM-DD form." };
  }
  const [y, m, d] = iso.split("-").map(Number);
  const ms = Date.UTC(y, m - 1, d);
  const back = new Date(ms);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== m - 1 || back.getUTCDate() !== d) {
    return { error: `${iso} is not a real calendar date.` };
  }
  return { ms, year: y, month: m, day: d };
}

/** Actual whole days between two ISO dates; positive when `toISO` is later. */
export function actualDays(fromISO, toISO) {
  const from = parseISODate(fromISO);
  if (from.error) return { error: from.error };
  const to = parseISODate(toISO);
  if (to.error) return { error: to.error };
  return { days: Math.round((to.ms - from.ms) / MS_PER_DAY) };
}

/**
 * 30/360 US (bond basis) day count, per the standard ISDA/US convention:
 *   if D1 is 31, set D1 = 30
 *   if D2 is 31 and D1 is 30 (after adjustment), set D2 = 30
 *   days = 360*(Y2-Y1) + 30*(M2-M1) + (D2-D1)
 */
export function days360(fromISO, toISO) {
  const a = parseISODate(fromISO);
  if (a.error) return { error: a.error };
  const b = parseISODate(toISO);
  if (b.error) return { error: b.error };
  let d1 = a.day;
  let d2 = b.day;
  if (d1 === 31) d1 = 30;
  if (d2 === 31 && d1 === 30) d2 = 30;
  return { days: 360 * (b.year - a.year) + 30 * (b.month - a.month) + (d2 - d1) };
}

/** Day-count bases. `denominator` is the assumed days in a year. */
export const DAY_COUNT_BASES = {
  "act/365": { id: "act/365", label: "Actual / 365 (most commercial contracts)", denominator: 365, actual: true },
  "act/360": { id: "act/360", label: "Actual / 360 (banking, US money market)", denominator: 360, actual: true },
  "30/360": { id: "30/360", label: "30 / 360 US bond basis", denominator: 360, actual: false },
};

/** How interest accrues once the grace period has passed. */
export const COMPOUNDING = {
  simple: { id: "simple", label: "Simple interest (no compounding)", periodsPerYear: 0 },
  monthly: { id: "monthly", label: "Compounded monthly (monthly rests)", periodsPerYear: 12 },
  daily: { id: "daily", label: "Compounded daily", periodsPerYear: 365 },
};

/**
 * Statutory fixed compensation under the UK Late Payment of Commercial Debts
 * (Interest) Act 1998, section 5A. The band is chosen by the size of the debt.
 */
export const UK_FIXED_COMPENSATION_BANDS = [
  { maxDebt: 1000, amount: 40 }, // debt under £1,000
  { maxDebt: 10000, amount: 70 }, // £1,000 to £9,999.99
  { maxDebt: Infinity, amount: 100 }, // £10,000 or more
];

/** Minimum recovery cost a creditor may claim under EU Directive 2011/7/EU. */
export const EU_MINIMUM_RECOVERY_EUR = 40;

/**
 * The fixed compensation payable on a UK commercial debt of this size.
 *
 * @param {number} debt
 * @returns {number} 40, 70 or 100
 */
export function ukFixedCompensation(debt) {
  if (!isNum(debt) || debt <= 0) return 0;
  for (const band of UK_FIXED_COMPENSATION_BANDS) {
    if (debt < band.maxDebt) return band.amount;
  }
  return UK_FIXED_COMPENSATION_BANDS[UK_FIXED_COMPENSATION_BANDS.length - 1].amount;
}

/** Ready-made term sets. Rates that float with a central bank rate are left for
 * the user to enter, because quoting a stale reference rate would be worse than
 * quoting none. */
export const PRESETS = {
  custom: { id: "custom", label: "My own contract terms" },
  "us-1-5-monthly": {
    id: "us-1-5-monthly",
    label: "1.5% per month (18% a year) — common US invoice term",
    annualRatePercent: 18,
    basis: "act/365",
    compounding: "simple",
    graceDays: 0,
  },
  uk: {
    id: "uk",
    label: "UK statutory: base rate + 8 points, plus fixed compensation",
    annualRatePercent: 12.75,
    basis: "act/365",
    compounding: "simple",
    graceDays: 0,
    fixedFeeRule: "uk",
  },
  eu: {
    id: "eu",
    label: "EU Directive 2011/7/EU: ECB reference + 8 points, plus €40",
    annualRatePercent: 11,
    basis: "act/365",
    compounding: "simple",
    graceDays: 0,
    fixedFeeRule: "eu",
  },
  "india-msme": {
    id: "india-msme",
    label: "India MSMED Act: 3× RBI bank rate, monthly rests, 45-day limit",
    annualRatePercent: 19.5,
    basis: "act/365",
    compounding: "monthly",
    graceDays: 0,
  },
};

/** A late fee is capped in many contracts and in several US states. */
export const MAX_RATE_PERCENT = 100;
export const MAX_YEARS_LATE = 20;

/**
 * Interest and fees on one overdue invoice.
 *
 * @param {object} input
 * @param {number} input.invoiceAmount principal outstanding on the due date
 * @param {string} input.dueDateISO
 * @param {string} input.paymentDateISO date paid, or today if still unpaid
 * @param {number} input.graceDays contractual grace before interest starts
 * @param {number} input.annualRatePercent annual interest rate
 * @param {string} input.basis key of DAY_COUNT_BASES
 * @param {string} input.compoundingId key of COMPOUNDING
 * @param {number} [input.flatFee] one-off administrative fee
 * @param {number} [input.percentFeePercent] one-off fee as a % of the invoice
 * @param {number} [input.capPercent] cap on total fees as a % of the invoice; 0 = no cap
 * @returns {object} full breakdown, or { error }
 */
export function computeLateFee({
  invoiceAmount,
  dueDateISO,
  paymentDateISO,
  graceDays = 0,
  annualRatePercent,
  basis = "act/365",
  compoundingId = "simple",
  flatFee = 0,
  percentFeePercent = 0,
  capPercent = 0,
}) {
  const basisMeta = DAY_COUNT_BASES[basis];
  if (!basisMeta) return { error: "Choose a day-count basis." };
  const compounding = COMPOUNDING[compoundingId];
  if (!compounding) return { error: "Choose how interest accrues." };
  if (!isNum(invoiceAmount) || invoiceAmount <= 0) {
    return { error: "The invoice amount must be greater than zero." };
  }
  if (!isNum(annualRatePercent) || annualRatePercent < 0) {
    return { error: "The interest rate cannot be negative." };
  }
  if (annualRatePercent > MAX_RATE_PERCENT) {
    return { error: `Enter an annual rate of ${MAX_RATE_PERCENT}% or less.` };
  }
  if (!isNum(graceDays) || graceDays < 0) return { error: "The grace period cannot be negative." };
  if (!isNum(flatFee) || flatFee < 0) return { error: "The flat fee cannot be negative." };
  if (!isNum(percentFeePercent) || percentFeePercent < 0) {
    return { error: "The percentage fee cannot be negative." };
  }
  if (!isNum(capPercent) || capPercent < 0) return { error: "The fee cap cannot be negative." };

  const elapsed = actualDays(dueDateISO, paymentDateISO);
  if (elapsed.error) return { error: elapsed.error };
  if (elapsed.days > MAX_YEARS_LATE * 365) {
    return { error: `This tool covers invoices up to ${MAX_YEARS_LATE} years overdue.` };
  }

  const daysLate = Math.max(0, elapsed.days);
  const grace = Math.round(graceDays);
  const chargeableActualDays = Math.max(0, daysLate - grace);

  // Nothing is chargeable until the invoice is past due and past its grace.
  if (chargeableActualDays === 0) {
    return {
      daysLate,
      graceDays: grace,
      chargeableDays: 0,
      basis: basisMeta.id,
      interest: 0,
      flatFee: 0,
      percentFee: 0,
      totalFee: 0,
      totalPayable: invoiceAmount,
      capApplied: false,
      effectiveAnnualPercent: 0,
      onTime: daysLate === 0,
    };
  }

  // The day-count basis decides how many "days" the interest formula sees.
  let countedDays = chargeableActualDays;
  if (!basisMeta.actual) {
    let startISO = dueDateISO;
    if (grace > 0) {
      const shifted = shiftISO(dueDateISO, grace);
      if (shifted.error) return { error: shifted.error };
      startISO = shifted.iso;
    }
    const counted = days360(startISO, paymentDateISO);
    if (counted.error) return { error: counted.error };
    countedDays = Math.max(0, counted.days);
  }

  const rate = annualRatePercent / 100;
  const years = countedDays / basisMeta.denominator;

  let interest;
  if (compounding.periodsPerYear === 0) {
    interest = invoiceAmount * rate * years;
  } else {
    const n = compounding.periodsPerYear;
    interest = invoiceAmount * (Math.pow(1 + rate / n, n * years) - 1);
  }
  if (!Number.isFinite(interest) || interest < 0) {
    return { error: "Those figures are too large to compute a sensible late fee." };
  }

  const percentFee = invoiceAmount * (percentFeePercent / 100);
  let totalFee = interest + flatFee + percentFee;
  let capApplied = false;
  const cap = capPercent > 0 ? invoiceAmount * (capPercent / 100) : Infinity;
  if (totalFee > cap) {
    totalFee = cap;
    capApplied = true;
  }

  const yearsActual = chargeableActualDays / 365;
  const effectiveAnnualPercent = yearsActual > 0 ? (totalFee / invoiceAmount / yearsActual) * 100 : 0;

  return {
    daysLate,
    graceDays: grace,
    chargeableDays: chargeableActualDays,
    countedDays,
    basis: basisMeta.id,
    interest,
    flatFee,
    percentFee,
    totalFee,
    totalPayable: invoiceAmount + totalFee,
    capApplied,
    capAmount: cap === Infinity ? null : cap,
    effectiveAnnualPercent,
    dailyInterest: interest / chargeableActualDays,
    onTime: false,
  };
}

/** Shift an ISO date by whole days. */
export function shiftISO(iso, days) {
  const parsed = parseISODate(iso);
  if (parsed.error) return { error: parsed.error };
  const next = new Date(parsed.ms + Math.round(days) * MS_PER_DAY);
  const pad = (value) => String(value).padStart(2, "0");
  return { iso: `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}` };
}

/**
 * Month-by-month accrual, so a client can see how the charge grew.
 *
 * @param {object} input same shape as computeLateFee
 * @param {number} months how many 30-day steps to show (capped at 24)
 * @returns {Array<{ day: number, interest: number, total: number }>}
 */
export function buildAccrualTable(input, months = 12) {
  const rows = [];
  const steps = Math.max(1, Math.min(24, Math.round(months)));
  for (let i = 1; i <= steps; i += 1) {
    const day = i * 30;
    const shifted = shiftISO(input.dueDateISO, day);
    if (shifted.error) break;
    const result = computeLateFee({ ...input, paymentDateISO: shifted.iso });
    if (result.error) break;
    rows.push({ day, interest: result.interest, total: result.totalFee, payable: result.totalPayable });
  }
  return rows;
}
