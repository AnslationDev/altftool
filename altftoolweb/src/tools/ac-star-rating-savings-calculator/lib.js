/**
 * Payback of a higher BEE star rating.
 *
 * Annual electricity for each unit comes from its ISEER:
 *
 *   annual kWh = (tons x 3516.85 / ISEER) x hours x days / 1000
 *
 * The saving in year 1 is the kWh difference times the tariff. With the tariff
 * escalating at rate g, cumulative saving after n years is a geometric series:
 *
 *   C(n) = S1 x ((1+g)^n - 1) / g          (g > 0)
 *   C(n) = S1 x n                          (g = 0)
 *
 * Setting C(n) equal to the price premium P and solving gives the exact
 * fractional payback period:
 *
 *   n = ln(1 + P x g / S1) / ln(1 + g)     (g > 0)
 *   n = P / S1                             (g = 0)
 */

/** ASHRAE definition: 1 ton of refrigeration = 3516.85 W of cooling. */
export const WATTS_PER_TON = 3516.85;

/** CEA CO2 Baseline Database: about 0.71 kg CO2 per kWh on the Indian grid. */
export const GRID_CO2_KG_PER_KWH = 0.71;

/**
 * Indicative ISEER values by star band for split ACs in the current BEE label
 * period. BEE revises the star thresholds every few years and the exact
 * boundary depends on the capacity band, so treat these as starting points and
 * type in the ISEER actually printed on the label of the model you are buying.
 */
export const STAR_PRESETS = [
  { stars: 1, iseer: 3.3 },
  { stars: 2, iseer: 3.5 },
  { stars: 3, iseer: 3.7 },
  { stars: 4, iseer: 4.3 },
  { stars: 5, iseer: 5.0 },
];

export const MIN_ISEER = 2;
export const MAX_ISEER = 7;
export const MAX_LIFE_YEARS = 25;

/** Annual electricity consumption of one unit, in kWh. */
export function annualUnits({ tons, iseer, hoursPerDay, daysPerYear }) {
  if (!(tons > 0) || !(iseer > 0) || !(hoursPerDay > 0) || !(daysPerYear > 0)) return 0;
  return ((tons * WATTS_PER_TON) / iseer) * hoursPerDay * daysPerYear * 0.001;
}

/** Cumulative saving after n whole years with the tariff escalating at g (fraction). */
export function cumulativeSaving(firstYearSaving, growthRate, years) {
  if (!Number.isFinite(firstYearSaving) || !Number.isFinite(years) || years <= 0) return 0;
  if (Math.abs(growthRate) < 1e-12) return firstYearSaving * years;
  return (firstYearSaving * (Math.pow(1 + growthRate, years) - 1)) / growthRate;
}

/** Exact fractional payback period, or null when the premium is never recovered. */
export function paybackYears(premium, firstYearSaving, growthRate) {
  if (!(firstYearSaving > 0)) return null;
  if (premium <= 0) return 0;
  if (Math.abs(growthRate) < 1e-12) return premium / firstYearSaving;
  const inner = 1 + (premium * growthRate) / firstYearSaving;
  if (inner <= 0) return null;
  const n = Math.log(inner) / Math.log(1 + growthRate);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * @param {object} input
 * @param {number} input.tons             Capacity both models are compared at.
 * @param {number} input.hoursPerDay      Hours of running on a cooling day.
 * @param {number} input.daysPerYear      Cooling days per year.
 * @param {number} input.tariff           Currency per kWh in year 1.
 * @param {number} input.escalationPct    Annual tariff increase, percent.
 * @param {number} input.efficientIseer   ISEER of the higher-rated model.
 * @param {number} input.efficientPrice   Price of the higher-rated model.
 * @param {number} input.baseIseer        ISEER of the lower-rated model.
 * @param {number} input.basePrice        Price of the lower-rated model.
 * @param {number} input.lifeYears        Years you expect to keep the AC.
 * @returns {object} breakdown or { error }.
 */
export function computeStarRatingSavings({
  tons,
  hoursPerDay,
  daysPerYear,
  tariff,
  escalationPct = 0,
  efficientIseer,
  efficientPrice,
  baseIseer,
  basePrice,
  lifeYears = 10,
}) {
  const t = Number(tons);
  const hours = Number(hoursPerDay);
  const days = Number(daysPerYear);
  const rate = Number(tariff);
  const esc = Number(escalationPct);
  const hiE = Number(efficientIseer);
  const hiP = Number(efficientPrice);
  const loE = Number(baseIseer);
  const loP = Number(basePrice);
  const life = Math.round(Number(lifeYears));

  if (![t, hours, days, rate, esc, hiE, hiP, loE, loP, life].every((v) => Number.isFinite(v))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (t <= 0 || t > 5) return { error: "Capacity should be between 0.5 and 5 ton." };
  if (hours <= 0 || hours > 24) return { error: "Hours per day must be between 1 and 24." };
  if (days <= 0 || days > 365) return { error: "Cooling days per year must be between 1 and 365." };
  if (rate <= 0) return { error: "Electricity tariff must be greater than zero." };
  if (esc < -20 || esc > 50) return { error: "Tariff escalation should be between -20% and 50% a year." };
  if (hiE < MIN_ISEER || hiE > MAX_ISEER || loE < MIN_ISEER || loE > MAX_ISEER) {
    return { error: `Both ISEER values should be between ${MIN_ISEER} and ${MAX_ISEER}.` };
  }
  if (hiP < 0 || loP < 0) return { error: "Prices cannot be negative." };
  if (life < 1 || life > MAX_LIFE_YEARS) {
    return { error: `Expected life should be between 1 and ${MAX_LIFE_YEARS} years.` };
  }
  if (hiE <= loE) {
    return { error: "The efficient model's ISEER must be higher than the one you are comparing it with." };
  }

  const growth = esc / 100;
  const efficientUnits = annualUnits({ tons: t, iseer: hiE, hoursPerDay: hours, daysPerYear: days });
  const baseUnits = annualUnits({ tons: t, iseer: loE, hoursPerDay: hours, daysPerYear: days });
  const unitsSaved = baseUnits - efficientUnits;
  const firstYearSaving = unitsSaved * rate;
  const premium = hiP - loP;

  const simplePayback = firstYearSaving > 0 ? premium / firstYearSaving : null;
  const payback = paybackYears(premium, firstYearSaving, growth);
  const lifetimeSaving = cumulativeSaving(firstYearSaving, growth, life);
  const netBenefit = lifetimeSaving - premium;

  const rows = [];
  let cumulative = 0;
  for (let year = 1; year <= life; year += 1) {
    const yearSaving = firstYearSaving * Math.pow(1 + growth, year - 1);
    cumulative += yearSaving;
    rows.push({ year, yearSaving, cumulative, net: cumulative - premium });
  }

  return {
    efficientUnits,
    baseUnits,
    unitsSaved,
    unitsSavedPct: baseUnits > 0 ? (unitsSaved / baseUnits) * 100 : 0,
    efficientBill: efficientUnits * rate,
    baseBill: baseUnits * rate,
    firstYearSaving,
    premium,
    simplePayback,
    paybackYears: payback,
    paybackMonths: payback === null ? null : payback * 12,
    worthIt: payback !== null && payback <= life,
    lifetimeSaving,
    netBenefit,
    lifeYears: life,
    rows,
    co2SavedPerYearKg: unitsSaved * GRID_CO2_KG_PER_KWH,
    co2SavedLifetimeKg: unitsSaved * GRID_CO2_KG_PER_KWH * life,
  };
}
