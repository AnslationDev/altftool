/**
 * Gym cost-per-visit maths.
 *
 * The headline membership price is rarely the real cost. This module totals the
 * fixed cost of a membership term (plan fee + one-off joining fee + recurring
 * add-ons such as locker or app charges), adds the variable per-visit cost
 * (travel, parking, a post-workout shake), and divides by the visits you
 * actually make:
 *
 *     cost per visit = (fixed cost + per-visit cost x visits) / visits
 *
 * It also solves the break-even against a drop-in / day-pass price:
 *
 *     break-even visits = fixed cost / drop-in price
 *
 * because the per-visit extras are paid either way and cancel out.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** 52 weeks in a year divided by 12 months — the exact weeks-per-month factor used here. */
export const WEEKS_PER_MONTH = 52 / 12;

/** Membership terms commonly sold by gyms, in months. */
export const PLAN_TERMS = [
  { id: "monthly", label: "Monthly", months: 1 },
  { id: "quarterly", label: "Quarterly (3 months)", months: 3 },
  { id: "halfyearly", label: "Half-yearly (6 months)", months: 6 },
  { id: "annual", label: "Annual (12 months)", months: 12 },
];

/** Guard rails so a mis-typed figure cannot produce a nonsense answer. */
export const MAX_FEE = 10000000;
export const MAX_VISITS_PER_WEEK = 14;

/** How the resulting cost per visit compares with a typical day-pass. */
export const VALUE_BANDS = [
  { maxRatio: 0.34, label: "Excellent value", note: "Each session costs about a third of a day pass or less." },
  { maxRatio: 0.67, label: "Good value", note: "Clearly cheaper than paying per session." },
  { maxRatio: 1, label: "Marginal", note: "Barely cheaper than a day pass — a small drop in attendance flips it." },
  { maxRatio: Infinity, label: "Poor value", note: "You are paying more per session than a day pass would cost." },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Look up a plan term by id; falls back to monthly. */
export function findTerm(id) {
  return PLAN_TERMS.find((term) => term.id === id) ?? PLAN_TERMS[0];
}

/** Value band for a cost-per-visit against a drop-in price. */
export function valueBand(costPerVisit, dropInPrice) {
  if (!isNum(costPerVisit) || !isNum(dropInPrice) || dropInPrice <= 0) return null;
  const ratio = costPerVisit / dropInPrice;
  return VALUE_BANDS.find((band) => ratio <= band.maxRatio) ?? VALUE_BANDS[VALUE_BANDS.length - 1];
}

/**
 * Cost per gym visit over one membership term.
 *
 * @param {object} input
 * @param {number} input.planFee          Price of the membership term.
 * @param {number} input.planMonths       Length of the term in months.
 * @param {number} [input.joiningFee=0]   One-off admission/registration fee.
 * @param {number} [input.monthlyExtras=0] Recurring add-ons per month (locker, app, towel).
 * @param {number} [input.perVisitCost=0] Travel, parking or food spent per session.
 * @param {number} input.visitsPerWeek    Sessions you realistically attend each week.
 * @param {number} [input.dropInPrice=0]  Day-pass price for the comparison; 0 skips it.
 */
export function computeCostPerVisit({
  planFee,
  planMonths,
  joiningFee = 0,
  monthlyExtras = 0,
  perVisitCost = 0,
  visitsPerWeek,
  dropInPrice = 0,
} = {}) {
  const values = [
    planFee,
    planMonths,
    joiningFee,
    monthlyExtras,
    perVisitCost,
    visitsPerWeek,
    dropInPrice,
  ];
  if (!values.every(isNum)) return { error: "Enter a number in every field." };
  if (values.some((value) => value < 0)) return { error: "Amounts cannot be negative." };
  if (planFee > MAX_FEE || joiningFee > MAX_FEE) {
    return { error: "That fee is outside the range this calculator handles." };
  }
  if (planMonths < 1 || planMonths > 60) {
    return { error: "Membership term must be between 1 and 60 months." };
  }
  if (visitsPerWeek <= 0) {
    return { error: "Enter at least a fraction of a visit per week — otherwise cost per visit is undefined." };
  }
  if (visitsPerWeek > MAX_VISITS_PER_WEEK) {
    return { error: `More than ${MAX_VISITS_PER_WEEK} visits a week is beyond twice a day, every day.` };
  }

  const months = Math.round(planMonths);
  const weeks = months * WEEKS_PER_MONTH;
  const visits = visitsPerWeek * weeks;

  const fixedCost = planFee + joiningFee + monthlyExtras * months;
  const variableCost = perVisitCost * visits;
  const totalCost = fixedCost + variableCost;

  const costPerVisit = totalCost / visits;
  const membershipOnlyPerVisit = fixedCost / visits;

  const hasDropIn = dropInPrice > 0;
  const breakEvenVisits = hasDropIn ? fixedCost / dropInPrice : null;
  const breakEvenVisitsPerWeek = hasDropIn && weeks > 0 ? breakEvenVisits / weeks : null;
  const dropInTotalCost = hasDropIn ? (dropInPrice + perVisitCost) * visits : null;
  const savingsVsDropIn = hasDropIn ? dropInTotalCost - totalCost : null;

  return {
    months,
    weeks,
    visits,
    visitsPerMonth: visitsPerWeek * WEEKS_PER_MONTH,
    fixedCost,
    variableCost,
    totalCost,
    costPerVisit,
    membershipOnlyPerVisit,
    monthlyEquivalent: totalCost / months,
    breakEvenVisits,
    breakEvenVisitsPerWeek,
    dropInTotalCost,
    savingsVsDropIn,
    beatsDropIn: hasDropIn ? savingsVsDropIn > 0 : null,
    band: valueBand(costPerVisit, dropInPrice),
  };
}

/**
 * Cost per visit across a range of weekly attendance levels, for a sensitivity table.
 * Returns [] on invalid input rather than throwing.
 */
export function attendanceTable(input, attendanceLevels = [1, 2, 3, 4, 5, 6]) {
  if (!Array.isArray(attendanceLevels)) return [];
  return attendanceLevels
    .map((visitsPerWeek) => {
      const result = computeCostPerVisit({ ...input, visitsPerWeek });
      if (result.error) return null;
      return {
        visitsPerWeek,
        visits: result.visits,
        costPerVisit: result.costPerVisit,
        totalCost: result.totalCost,
      };
    })
    .filter(Boolean);
}
