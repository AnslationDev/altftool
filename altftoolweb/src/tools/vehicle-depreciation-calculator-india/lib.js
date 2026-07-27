/**
 * Vehicle depreciation for India, on the two schedules that are actually written
 * down in law rather than guessed at.
 *
 * 1. MOTOR TARIFF SCHEDULE OF DEPRECIATION (used to fix the Insured Declared
 *    Value of a private vehicle). Depreciation is applied to the manufacturer's
 *    listed selling price of the vehicle by age:
 *        not exceeding 6 months            5%
 *        over 6 months to 1 year          15%
 *        over 1 year to 2 years           20%
 *        over 2 years to 3 years          30%
 *        over 3 years to 4 years          40%
 *        over 4 years to 5 years          50%
 *    Above 5 years the value is mutually agreed between insurer and insured;
 *    market practice is to keep reducing it, so this model continues at a rate
 *    you choose (10% a year by default).
 *
 * 2. INCOME TAX WRITTEN DOWN VALUE (Appendix I to the Income-tax Rules, 1962).
 *    Motor cars other than those used in a business of running them on hire are
 *    a 15% written-down-value block. Motor buses, lorries and taxis used in a
 *    business of running them on hire are a 30% block. If the asset is put to
 *    use for less than 180 days in the year it is acquired, only half the
 *    depreciation is allowed in that year (second proviso to section 32(1)).
 */

/** Age slabs from the motor tariff schedule of depreciation. */
export const TARIFF_SLABS = [
  { maxMonths: 6, percent: 5, label: "Not exceeding 6 months" },
  { maxMonths: 12, percent: 15, label: "Over 6 months to 1 year" },
  { maxMonths: 24, percent: 20, label: "Over 1 year to 2 years" },
  { maxMonths: 36, percent: 30, label: "Over 2 years to 3 years" },
  { maxMonths: 48, percent: 40, label: "Over 3 years to 4 years" },
  { maxMonths: 60, percent: 50, label: "Over 4 years to 5 years" },
];

/** Depreciation already applied when the tariff table runs out at 5 years. */
export const TARIFF_MAX_PERCENT = 50;
export const TARIFF_MAX_MONTHS = 60;

/** Default further reduction each year beyond 5 years, when it is mutually agreed. */
export const BEYOND_FIVE_DEFAULT_PERCENT_PA = 10;
export const BEYOND_FIVE_MAX_PERCENT_PA = 50;

/** Income tax depreciation blocks that a vehicle can fall into. */
export const INCOME_TAX_BLOCKS = [
  { id: "car", label: "Motor car not used in a hire business", rate: 15 },
  { id: "hire", label: "Motor bus, lorry or taxi used in a hire business", rate: 30 },
];

/** Less than this many days of use in the year of purchase halves the allowance. */
export const HALF_YEAR_DAYS = 180;

/** Oldest vehicle the model will value, in months. */
export const MAX_AGE_MONTHS = 480;

/** Tariff depreciation percentage for a given age in months. */
export function tariffPercentForAge(months) {
  const slab = TARIFF_SLABS.find((s) => months <= s.maxMonths);
  return slab ? slab.percent : TARIFF_MAX_PERCENT;
}

export function tariffSlabLabel(months) {
  const slab = TARIFF_SLABS.find((s) => months <= s.maxMonths);
  return slab ? slab.label : "Over 5 years — value mutually agreed";
}

/**
 * Value of the vehicle under the motor tariff schedule.
 *
 * @param {number} price        Manufacturer's listed selling price / ex-showroom price, INR.
 * @param {number} months       Age of the vehicle in months.
 * @param {number} beyondRatePa Further annual reduction after 5 years, %.
 */
export function tariffValue(price, months, beyondRatePa = BEYOND_FIVE_DEFAULT_PERCENT_PA) {
  if (months <= TARIFF_MAX_MONTHS) {
    const percent = tariffPercentForAge(months);
    return { value: price * (1 - percent / 100), percent, extraYears: 0 };
  }
  const extraYears = (months - TARIFF_MAX_MONTHS) / 12;
  const base = price * (1 - TARIFF_MAX_PERCENT / 100);
  const value = base * Math.pow(1 - beyondRatePa / 100, extraYears);
  return {
    value,
    percent: price > 0 ? (1 - value / price) * 100 : 0,
    extraYears,
  };
}

/**
 * Written down value under the income tax rules.
 *
 * @param {number} cost      Actual cost of the vehicle, INR.
 * @param {number} years     Complete financial years of ownership.
 * @param {number} rate      Depreciation rate for the block, %.
 * @param {boolean} halfFirst Put to use for under 180 days in year one.
 * @returns {{rows: Array, closing: number, totalDepreciation: number}}
 */
export function writtenDownValue(cost, years, rate, halfFirst = false) {
  const rows = [];
  let value = cost;
  let total = 0;
  for (let year = 1; year <= years; year += 1) {
    const applied = year === 1 && halfFirst ? rate / 2 : rate;
    const depreciation = (value * applied) / 100;
    total += depreciation;
    rows.push({ year, opening: value, ratePercent: applied, depreciation, closing: value - depreciation });
    value -= depreciation;
  }
  return { rows, closing: value, totalDepreciation: total };
}

/**
 * Full valuation.
 *
 * @param {object} input
 * @param {number} input.price          Ex-showroom / listed price, INR.
 * @param {number} input.ageMonths      Age of the vehicle in months.
 * @param {number} input.beyondRatePa   Annual reduction after 5 years, %.
 * @param {string} input.blockId        Income tax block id ("car" or "hire").
 * @param {boolean} input.halfFirstYear Used under 180 days in the first year.
 * @param {number} input.conditionAdjustPercent Your own adjustment for condition, %.
 * @returns {object} valuation or { error }
 */
export function valueVehicle({
  price,
  ageMonths,
  beyondRatePa = BEYOND_FIVE_DEFAULT_PERCENT_PA,
  blockId = "car",
  halfFirstYear = false,
  conditionAdjustPercent = 0,
}) {
  const nums = [price, ageMonths, beyondRatePa, conditionAdjustPercent];
  if (nums.some((n) => typeof n !== "number" || !Number.isFinite(n))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (price <= 0) return { error: "Ex-showroom price must be greater than zero." };
  if (ageMonths < 0) return { error: "Vehicle age cannot be negative." };
  if (ageMonths > MAX_AGE_MONTHS) {
    return { error: `This model values vehicles up to ${MAX_AGE_MONTHS / 12} years old.` };
  }
  if (beyondRatePa < 0 || beyondRatePa > BEYOND_FIVE_MAX_PERCENT_PA) {
    return { error: `The rate beyond 5 years should be between 0% and ${BEYOND_FIVE_MAX_PERCENT_PA}% a year.` };
  }
  if (conditionAdjustPercent < -50 || conditionAdjustPercent > 50) {
    return { error: "Condition adjustment should be between -50% and +50%." };
  }
  const block = INCOME_TAX_BLOCKS.find((b) => b.id === blockId);
  if (!block) return { error: "Choose an income tax depreciation block." };

  const months = Math.round(ageMonths);
  const tariff = tariffValue(price, months, beyondRatePa);
  const adjusted = tariff.value * (1 + conditionAdjustPercent / 100);

  const completedYears = Math.floor(months / 12);
  const wdv = writtenDownValue(price, completedYears, block.rate, halfFirstYear);

  const yearRows = [];
  for (let year = 0; year <= Math.max(5, Math.min(15, Math.ceil(months / 12))); year += 1) {
    const atMonths = year * 12 === 0 ? 0 : year * 12;
    const t = tariffValue(price, atMonths, beyondRatePa);
    yearRows.push({
      year,
      tariffValue: t.value,
      tariffPercent: t.percent,
    });
  }

  return {
    months,
    ageYears: months / 12,
    slabLabel: tariffSlabLabel(months),
    tariffPercent: tariff.percent,
    tariffValue: tariff.value,
    adjustedValue: adjusted,
    depreciationAmount: price - tariff.value,
    annualisedPercent: months > 0 ? (tariff.percent / (months / 12)) : 0,
    beyondFive: months > TARIFF_MAX_MONTHS,
    extraYears: tariff.extraYears,
    blockLabel: block.label,
    blockRate: block.rate,
    completedYears,
    wdvClosing: wdv.closing,
    wdvTotalDepreciation: wdv.totalDepreciation,
    wdvRows: wdv.rows,
    yearRows,
    price,
  };
}
