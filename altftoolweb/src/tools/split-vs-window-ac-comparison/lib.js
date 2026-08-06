/**
 * Split vs window air conditioner: lifetime cost comparison.
 *
 * Electricity is derived from ISEER, the Indian Seasonal Energy Efficiency
 * Ratio printed on the BEE star label. ISEER is defined as the seasonal
 * cooling output in watt-hours divided by the seasonal electricity input in
 * watt-hours, so:
 *
 *   average input power (W) = rated cooling (W) / ISEER
 *   annual units (kWh)      = power x hours per day x days per year / 1000
 *   annual bill             = units x tariff
 *
 * Total cost of ownership over N years adds the purchase price, the
 * installation charge and each year's electricity and maintenance, with an
 * optional annual tariff escalation compounding on the electricity only.
 */

/** ASHRAE definition: 1 ton of refrigeration = 3516.85 W of cooling. */
export const WATTS_PER_TON = 3516.85;

/**
 * CEA CO2 Baseline Database for the Indian power sector: the weighted average
 * grid emission factor is close to 0.71 kg CO2 per kWh. Used only to express
 * the electricity difference in carbon terms.
 */
export const GRID_CO2_KG_PER_KWH = 0.71;

/**
 * Indicative ISEER values seen on BEE labels in the current label period.
 * These are starting points only — BEE revises the star thresholds
 * periodically, so always type in the ISEER printed on the unit you are
 * actually considering.
 */
export const TYPICAL_ISEER = {
  splitInverter5Star: 5.0,
  splitInverter3Star: 3.9,
  splitFixed3Star: 3.7,
  window5Star: 3.5,
  window3Star: 3.1,
};

/** Sanity bounds. ISEER below 2 or above 7 is not a real room-AC label value. */
export const MIN_ISEER = 2;
export const MAX_ISEER = 7;
export const MAX_HORIZON_YEARS = 20;

/** Average electrical input power of a unit at its rated capacity, in watts. */
export function averageInputWatts(tons, iseer) {
  if (!(tons > 0) || !(iseer > 0)) return 0;
  return (tons * WATTS_PER_TON) / iseer;
}

/** Units consumed in a year of use, in kWh. */
export function annualUnits(tons, iseer, hoursPerDay, daysPerYear) {
  const watts = averageInputWatts(tons, iseer);
  if (!(hoursPerDay > 0) || !(daysPerYear > 0)) return 0;
  return (watts * hoursPerDay * daysPerYear) / 1000;
}

function validateOption(name, { price, install, iseer, maintenance }) {
  if (![price, install, iseer, maintenance].every((v) => Number.isFinite(v))) {
    return `Enter valid numbers for the ${name} option.`;
  }
  if (price < 0 || install < 0 || maintenance < 0) {
    return `${name} costs cannot be negative.`;
  }
  if (iseer < MIN_ISEER || iseer > MAX_ISEER) {
    return `${name} ISEER should be between ${MIN_ISEER} and ${MAX_ISEER}.`;
  }
  return null;
}

/**
 * @param {object} input
 * @param {number} input.tons          Cooling capacity both units are compared at.
 * @param {number} input.hoursPerDay   Average hours of use on a cooling day.
 * @param {number} input.daysPerYear   Cooling days per year.
 * @param {number} input.tariff        Electricity tariff, currency per kWh.
 * @param {number} input.escalationPct Annual tariff increase, percent.
 * @param {number} input.years         Ownership horizon in years.
 * @param {object} input.split         { price, install, iseer, maintenance }
 * @param {object} input.window        { price, install, iseer, maintenance }
 * @returns {object} comparison or { error }.
 */
export function compareSplitVsWindow({
  tons,
  hoursPerDay,
  daysPerYear,
  tariff,
  escalationPct = 0,
  years,
  split,
  window: windowUnit,
}) {
  const t = Number(tons);
  const hours = Number(hoursPerDay);
  const days = Number(daysPerYear);
  const rate = Number(tariff);
  const esc = Number(escalationPct);
  const horizon = Math.round(Number(years));

  if (![t, hours, days, rate, esc, horizon].every((v) => Number.isFinite(v))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (t < 0.5 || t > 5) return { error: "Capacity should be between 0.5 and 5 ton." };
  if (hours < 1 || hours > 24) return { error: "Hours per day must be between 1 and 24." };
  if (days < 1 || days > 365) return { error: "Cooling days per year must be between 1 and 365." };
  if (rate < 0) return { error: "Electricity tariff cannot be negative." };
  if (esc < -20 || esc > 50) return { error: "Tariff escalation should be between -20% and 50% a year." };
  if (horizon < 1 || horizon > MAX_HORIZON_YEARS) {
    return { error: `Ownership horizon should be between 1 and ${MAX_HORIZON_YEARS} years.` };
  }

  const s = {
    price: Number(split?.price),
    install: Number(split?.install),
    iseer: Number(split?.iseer),
    maintenance: Number(split?.maintenance),
  };
  const w = {
    price: Number(windowUnit?.price),
    install: Number(windowUnit?.install),
    iseer: Number(windowUnit?.iseer),
    maintenance: Number(windowUnit?.maintenance),
  };
  const splitError = validateOption("split AC", s);
  if (splitError) return { error: splitError };
  const windowError = validateOption("window AC", w);
  if (windowError) return { error: windowError };

  const growth = 1 + esc / 100;

  const build = (unit) => {
    const units = annualUnits(t, unit.iseer, hours, days);
    const firstYearBill = units * rate;
    const upfront = unit.price + unit.install;
    return {
      iseer: unit.iseer,
      inputWatts: averageInputWatts(t, unit.iseer),
      annualUnits: units,
      firstYearBill,
      upfront,
      price: unit.price,
      install: unit.install,
      maintenance: unit.maintenance,
    };
  };

  const splitCalc = build(s);
  const windowCalc = build(w);

  const rows = [];
  let splitCum = splitCalc.upfront;
  let windowCum = windowCalc.upfront;

  for (let year = 1; year <= horizon; year += 1) {
    const factor = Math.pow(growth, year - 1);
    const splitYear = splitCalc.firstYearBill * factor + splitCalc.maintenance;
    const windowYear = windowCalc.firstYearBill * factor + windowCalc.maintenance;
    splitCum += splitYear;
    windowCum += windowYear;
    rows.push({
      year,
      splitYear,
      windowYear,
      splitCum,
      windowCum,
      gap: windowCum - splitCum,
    });
  }

  const splitTotal = splitCum;
  const windowTotal = windowCum;
  const cheaper = splitTotal <= windowTotal ? "split" : "window";
  const saving = Math.abs(windowTotal - splitTotal);

  // Breakeven year: the earliest year from which the eventual cheaper option's
  // cumulative lead holds continuously through to the end of the horizon. A
  // naive "first year the gap flips" can be reversed later — most easily with
  // negative tariff escalation, where a shrinking electricity gap lets a flat
  // maintenance disadvantage flip the lead back — which would otherwise report
  // a "breakeven" year that contradicts the final winner shown above it.
  let breakevenYear = null;
  const finalGap = rows.length > 0 ? rows[rows.length - 1].gap : 0;
  const finalSign = Math.sign(finalGap);
  if (finalSign !== 0) {
    for (let i = rows.length - 1; i >= 0; i -= 1) {
      const sign = Math.sign(rows[i].gap);
      if (sign !== 0 && sign !== finalSign) break;
      breakevenYear = rows[i].year;
    }
  }

  const unitsSavedPerYear = windowCalc.annualUnits - splitCalc.annualUnits;

  return {
    tons: t,
    horizon,
    split: splitCalc,
    window: windowCalc,
    rows,
    splitTotal,
    windowTotal,
    cheaper,
    saving,
    breakevenYear,
    firstYearBillGap: windowCalc.firstYearBill - splitCalc.firstYearBill,
    unitsSavedPerYear,
    co2SavedPerYear: unitsSavedPerYear * GRID_CO2_KG_PER_KWH,
    co2SavedOverHorizon: unitsSavedPerYear * GRID_CO2_KG_PER_KWH * horizon,
  };
}
