/**
 * Hostel vs PG (paying guest) total cost comparison.
 *
 * Plain cost arithmetic, no statutory rules:
 *   total(option) = (sum of monthly costs) × stay months
 *                   + non-refundable one-time charges
 * Refundable security deposits are NOT added to the total cost — they come
 * back at the end — but the tool reports them separately as cash you must
 * lock up. Effective monthly cost = total ÷ months.
 */

/**
 * Compute one option's totals.
 * @param {object} option
 * @param {number} option.rent        Monthly rent / hostel fee (INR).
 * @param {number} option.food        Monthly mess / food cost (INR).
 * @param {number} option.utilities   Monthly electricity, wifi, laundry (INR).
 * @param {number} option.travel      Monthly commute cost from this stay (INR).
 * @param {number} option.oneTime     NON-refundable one-time charges — admission,
 *                                    brokerage, joining fee (INR).
 * @param {number} option.deposit     REFUNDABLE security deposit (INR) — reported,
 *                                    not added to cost.
 * @param {number} months             Stay length in months.
 */
function computeOption(option, months) {
  const monthly = option.rent + option.food + option.utilities + option.travel;
  const total = monthly * months + option.oneTime;
  return {
    monthlyRecurring: monthly,
    total,
    effectiveMonthly: total / months,
    deposit: option.deposit,
    upfrontCash: option.oneTime + option.deposit,
  };
}

const FIELDS = ["rent", "food", "utilities", "travel", "oneTime", "deposit"];

function sanitizeOption(raw, label) {
  const clean = {};
  for (const field of FIELDS) {
    const value = raw?.[field] === undefined || raw?.[field] === "" ? 0 : Number(raw[field]);
    if (!Number.isFinite(value)) {
      return { error: `${label}: every cost must be a number (0 is fine).` };
    }
    if (value < 0) {
      return { error: `${label}: costs cannot be negative.` };
    }
    clean[field] = value;
  }
  return { clean };
}

/**
 * @param {object} input
 * @param {number} input.months  Planned stay in months (e.g. 10 for an academic year).
 * @param {object} input.hostel  Hostel option costs (see computeOption).
 * @param {object} input.pg      PG option costs (see computeOption).
 * @returns {object} comparison or { error }.
 */
export function compareHostelVsPg({ months, hostel, pg }) {
  const m = Number(months);
  if (!Number.isFinite(m) || m <= 0) {
    return { error: "Stay duration must be at least 1 month." };
  }
  if (m > 72) {
    return { error: "Stay duration looks too long — enter 72 months (6 years) or less." };
  }

  const hostelClean = sanitizeOption(hostel, "Hostel");
  if (hostelClean.error) return { error: hostelClean.error };
  const pgClean = sanitizeOption(pg, "PG");
  if (pgClean.error) return { error: pgClean.error };

  const hostelResult = computeOption(hostelClean.clean, m);
  const pgResult = computeOption(pgClean.clean, m);

  const difference = pgResult.total - hostelResult.total; // positive => PG costs more
  const cheaper = difference > 0 ? "hostel" : difference < 0 ? "pg" : "equal";

  return {
    months: m,
    hostel: hostelResult,
    pg: pgResult,
    difference: Math.abs(difference),
    differencePerMonth: Math.abs(difference) / m,
    cheaper,
  };
}
