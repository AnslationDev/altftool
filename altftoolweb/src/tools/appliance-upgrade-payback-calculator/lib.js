/**
 * Payback and net-present-value maths for replacing a working but inefficient
 * appliance with a more efficient one.
 *
 * The three figures that matter:
 *   Simple payback (years)  = net upfront cost / first-year energy saving.
 *   Discounted payback      = the year in which the cumulative *discounted*
 *                             saving first covers the net upfront cost.
 *   NPV                     = sum of discounted savings over the new
 *                             appliance's life, minus the net upfront cost.
 *
 * Savings are escalated each year by the expected electricity tariff rise and
 * discounted back at the household's opportunity cost of money, so the answer
 * accounts for both a rising tariff and the fact that money spent today is
 * worth more than money saved in year ten.
 */

/**
 * Grid emission factor for India, in kg CO2 per kWh delivered. Central
 * Electricity Authority CO2 Baseline Database figure for the Indian grid,
 * which sits around 0.71 kg/kWh. Used only for the emissions line.
 */
export const GRID_EMISSION_FACTOR_KG_PER_KWH = 0.71;

/** Days used to annualise a daily usage figure. */
export const DAYS_PER_YEAR = 365;

/** Watts in a kilowatt. */
const W_PER_KW = 1000;

const MAX_LIFE_YEARS = 30;
const MAX_TARIFF = 100;
const MAX_DISCOUNT_PCT = 30;
const MIN_ESCALATION_PCT = -10;
const MAX_ESCALATION_PCT = 30;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Convert a nameplate rating and usage pattern into annual kWh.
 * Pure arithmetic: watts x hours x days / 1000.
 */
export function annualKwhFromUsage({ watts, hoursPerDay, daysPerYear = DAYS_PER_YEAR }) {
  if (!isNum(watts) || !isNum(hoursPerDay) || !isNum(daysPerYear)) return null;
  if (watts < 0 || hoursPerDay < 0 || daysPerYear < 0) return null;
  if (hoursPerDay > 24) return null;
  return (watts * hoursPerDay * daysPerYear) / W_PER_KW;
}

/**
 * @param {object} input
 * @param {number} input.oldAnnualKwh      Units the current appliance uses a year.
 * @param {number} input.newAnnualKwh      Units the replacement would use a year.
 * @param {number} input.newPrice          Purchase price of the new appliance.
 * @param {number} [input.oldResaleValue]  Trade-in or scrap value of the old one.
 * @param {number} input.tariffPerKwh      Electricity tariff, currency per kWh.
 * @param {number} [input.tariffEscalationPct] Expected annual tariff rise, %.
 * @param {number} [input.discountRatePct] Discount rate for the NPV, %.
 * @param {number} [input.applianceLifeYears] Expected life of the new appliance.
 */
export function computeAppliancePayback({
  oldAnnualKwh,
  newAnnualKwh,
  newPrice,
  oldResaleValue = 0,
  tariffPerKwh,
  tariffEscalationPct = 0,
  discountRatePct = 0,
  applianceLifeYears = 10,
}) {
  const values = [
    oldAnnualKwh,
    newAnnualKwh,
    newPrice,
    oldResaleValue,
    tariffPerKwh,
    tariffEscalationPct,
    discountRatePct,
    applianceLifeYears,
  ];
  if (values.some((value) => !isNum(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (oldAnnualKwh <= 0) {
    return { error: "The current appliance must use more than zero units a year." };
  }
  if (newAnnualKwh < 0 || newPrice < 0 || oldResaleValue < 0) {
    return { error: "Consumption, price and resale value cannot be negative." };
  }
  if (newPrice <= 0) {
    return { error: "Enter the purchase price of the new appliance." };
  }
  if (oldResaleValue > newPrice) {
    return { error: "Resale value cannot exceed the price of the new appliance." };
  }
  if (tariffPerKwh <= 0 || tariffPerKwh > MAX_TARIFF) {
    return { error: `Electricity tariff should be between 0 and ${MAX_TARIFF} per unit.` };
  }
  if (tariffEscalationPct < MIN_ESCALATION_PCT || tariffEscalationPct > MAX_ESCALATION_PCT) {
    return {
      error: `Tariff escalation should be between ${MIN_ESCALATION_PCT}% and ${MAX_ESCALATION_PCT}% a year.`,
    };
  }
  if (discountRatePct < 0 || discountRatePct > MAX_DISCOUNT_PCT) {
    return { error: `Discount rate should be between 0% and ${MAX_DISCOUNT_PCT}%.` };
  }
  if (applianceLifeYears <= 0 || applianceLifeYears > MAX_LIFE_YEARS) {
    return { error: `Appliance life should be between 1 and ${MAX_LIFE_YEARS} years.` };
  }

  const life = Math.round(applianceLifeYears);
  const netCost = newPrice - oldResaleValue;
  const annualKwhSaved = oldAnnualKwh - newAnnualKwh;
  const firstYearSaving = annualKwhSaved * tariffPerKwh;
  const efficiencyGainPct = (annualKwhSaved / oldAnnualKwh) * 100;

  const escalation = 1 + tariffEscalationPct / 100;
  const discount = 1 + discountRatePct / 100;

  const rows = [];
  let cumulativeNominal = 0;
  let cumulativeDiscounted = 0;
  let discountedPaybackYears = null;
  let simplePaybackYears = null;

  for (let year = 1; year <= life; year += 1) {
    const nominal = firstYearSaving * Math.pow(escalation, year - 1);
    const discounted = nominal / Math.pow(discount, year);
    const previousDiscounted = cumulativeDiscounted;
    cumulativeNominal += nominal;
    cumulativeDiscounted += discounted;

    if (
      discountedPaybackYears === null &&
      cumulativeDiscounted >= netCost &&
      discounted > 0
    ) {
      // Interpolate inside the year the cumulative saving crosses the cost.
      const shortfall = netCost - previousDiscounted;
      discountedPaybackYears = year - 1 + shortfall / discounted;
    }

    rows.push({
      year,
      nominal,
      discounted,
      cumulativeNominal,
      cumulativeDiscounted,
      netPosition: cumulativeDiscounted - netCost,
    });
  }

  const npv = cumulativeDiscounted - netCost;

  if (firstYearSaving > 0) {
    simplePaybackYears = netCost / firstYearSaving;
  }

  const noSaving = annualKwhSaved <= 0;
  const paysBackWithinLife =
    simplePaybackYears !== null && simplePaybackYears <= life && !noSaving;

  let verdict;
  if (noSaving) {
    verdict =
      "The replacement uses at least as much energy as the appliance you already own, so there is no energy saving to pay back the purchase.";
  } else if (!paysBackWithinLife) {
    verdict = `Simple payback is longer than the ${life}-year life you expect from the new appliance, so on energy savings alone this upgrade loses money.`;
  } else if (npv > 0 && discountedPaybackYears !== null) {
    verdict = `The saving covers the cost after about ${discountedPaybackYears.toFixed(1)} years once the tariff rise and discount rate are applied, leaving a positive net present value over ${life} years.`;
  } else {
    verdict = `The upgrade pays back in ${simplePaybackYears.toFixed(1)} years in plain cash, but after discounting at ${discountRatePct}% the ${life}-year net present value is not positive.`;
  }

  return {
    netCost,
    newPrice,
    oldResaleValue,
    annualKwhSaved,
    firstYearSaving,
    efficiencyGainPct,
    life,
    simplePaybackYears,
    discountedPaybackYears,
    npv,
    lifetimeNominalSaving: cumulativeNominal,
    lifetimeDiscountedSaving: cumulativeDiscounted,
    lifetimeKwhSaved: annualKwhSaved * life,
    annualCo2SavedKg: annualKwhSaved * GRID_EMISSION_FACTOR_KG_PER_KWH,
    lifetimeCo2SavedKg: annualKwhSaved * life * GRID_EMISSION_FACTOR_KG_PER_KWH,
    rows,
    noSaving,
    paysBackWithinLife,
    verdict,
  };
}
