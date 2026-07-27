/**
 * Decoding a BEE (Bureau of Energy Efficiency) star label into running cost.
 *
 * A star label carries two useful numbers and one decorative one. The stars
 * are the decorative part: BEE revises the star bands every few years, so a
 * 5-star model from an older table can rate 3 stars against the current one.
 * The numbers that survive a revision are:
 *
 *  - Annual energy consumption in kWh/year, printed on refrigerator, washing
 *    machine and television labels. Running cost = kWh x tariff.
 *  - ISEER, the Indian Seasonal Energy Efficiency Ratio, printed on room air
 *    conditioner labels. ISEER is defined as the cooling seasonal total load
 *    divided by the cooling seasonal energy consumption, both in watt-hours,
 *    so it is dimensionless and the arithmetic inverts cleanly:
 *
 *      annual kWh = capacity (W) x annual operating hours / ISEER / 1000
 *
 * This module deliberately hardcodes no star-band thresholds, because those
 * thresholds change on a published schedule and a stale table would give
 * wrong answers. Compare the kWh or ISEER figure between two labels instead.
 */

/**
 * One ton of refrigeration in watts. Defined as 12,000 BTU/h, which is
 * 3516.8528 W. Used to convert an air conditioner's rating in tons.
 */
export const TON_OF_REFRIGERATION_W = 3516.8528;

/**
 * Annual operating hours assumed by BEE's ISEER test procedure for room air
 * conditioners in India: 1,600 hours of cooling a year.
 */
export const BEE_ISEER_ANNUAL_HOURS = 1600;

/**
 * Grid emission factor for India, kg CO2 per kWh. Central Electricity
 * Authority CO2 Baseline Database, approximately 0.71 kg/kWh.
 */
export const GRID_EMISSION_FACTOR_KG_PER_KWH = 0.71;

/** What each field on a BEE label actually means. */
export const LABEL_FIELDS = [
  {
    field: "Stars (1 to 5)",
    meaning:
      "The efficiency band the model fell into when it was certified. Five is the most efficient band of that year, not an absolute measure.",
  },
  {
    field: "Annual energy consumption",
    meaning:
      "Units (kWh) the model uses in a year under the standard test cycle. This is the number to compare, and the one that drives your bill.",
  },
  {
    field: "ISEER (air conditioners)",
    meaning:
      "Cooling delivered divided by electricity consumed across a simulated Indian cooling season. Higher is better; it already accounts for part-load running.",
  },
  {
    field: "Star label period / valid up to",
    meaning:
      "The table edition the rating was awarded against. A label from an earlier period was scored on easier thresholds than a current one.",
  },
  {
    field: "Brand, model and capacity",
    meaning:
      "Ties the rating to one exact variant. A different capacity of the same model line carries its own rating and its own kWh figure.",
  },
];

const MAX_TARIFF = 100;
const MAX_LIFE_YEARS = 30;
const MAX_ISEER = 30;
const MAX_ANNUAL_HOURS = 8760;
const MAX_TONS = 30;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Convert an air conditioner rating in tons to watts of cooling capacity. */
export function tonsToWatts(tons) {
  if (!isNum(tons) || tons < 0) return null;
  return tons * TON_OF_REFRIGERATION_W;
}

/**
 * Annual electricity for a room air conditioner from its ISEER.
 * ISEER = seasonal cooling load / seasonal energy consumed, so inverting it
 * gives energy consumed for a given load.
 */
export function annualKwhFromIseer({ capacityWatts, iseer, hoursPerYear = BEE_ISEER_ANNUAL_HOURS }) {
  if (![capacityWatts, iseer, hoursPerYear].every(isNum)) return null;
  if (capacityWatts < 0 || hoursPerYear < 0 || iseer <= 0) return null;
  return (capacityWatts * hoursPerYear) / iseer / 1000;
}

/**
 * Compare two labelled models and price the difference.
 *
 * @param {object} input
 * @param {"kwh"|"iseer"} input.mode  Which figure the label carries.
 * @param {number} [input.annualKwhA] Label kWh/year for model A (mode "kwh").
 * @param {number} [input.annualKwhB] Label kWh/year for model B (mode "kwh").
 * @param {number} [input.capacityTons] AC capacity in tons (mode "iseer").
 * @param {number} [input.iseerA]     ISEER of model A (mode "iseer").
 * @param {number} [input.iseerB]     ISEER of model B (mode "iseer").
 * @param {number} [input.hoursPerYear] Cooling hours a year (mode "iseer").
 * @param {number} input.tariffPerKwh Electricity tariff per unit.
 * @param {number} [input.priceDifference] How much more model B costs.
 * @param {number} [input.lifeYears]  Years you expect to keep it.
 */
export function decodeEnergyLabel({
  mode = "kwh",
  annualKwhA = 0,
  annualKwhB = 0,
  capacityTons = 0,
  iseerA = 0,
  iseerB = 0,
  hoursPerYear = BEE_ISEER_ANNUAL_HOURS,
  tariffPerKwh,
  priceDifference = 0,
  lifeYears = 10,
}) {
  if (mode !== "kwh" && mode !== "iseer") {
    return { error: "Choose whether the label states kWh per year or an ISEER value." };
  }
  if (![tariffPerKwh, priceDifference, lifeYears].every(isNum)) {
    return { error: "Enter valid numbers for tariff, price difference and years kept." };
  }
  if (tariffPerKwh <= 0 || tariffPerKwh > MAX_TARIFF) {
    return { error: `Electricity tariff should be between 0 and ${MAX_TARIFF} per unit.` };
  }
  if (priceDifference < 0) {
    return { error: "Enter the price difference as a positive amount — B is the costlier model." };
  }
  if (lifeYears <= 0 || lifeYears > MAX_LIFE_YEARS) {
    return { error: `Years kept should be between 1 and ${MAX_LIFE_YEARS}.` };
  }

  let kwhA;
  let kwhB;
  let capacityWatts = null;

  if (mode === "kwh") {
    if (![annualKwhA, annualKwhB].every(isNum)) {
      return { error: "Enter the annual kWh figure printed on both labels." };
    }
    if (annualKwhA <= 0 || annualKwhB <= 0) {
      return { error: "Annual consumption must be greater than zero for both models." };
    }
    kwhA = annualKwhA;
    kwhB = annualKwhB;
  } else {
    if (![capacityTons, iseerA, iseerB, hoursPerYear].every(isNum)) {
      return { error: "Enter valid numbers for capacity, both ISEER values and cooling hours." };
    }
    if (capacityTons <= 0 || capacityTons > MAX_TONS) {
      return { error: `Capacity should be between 0 and ${MAX_TONS} tons.` };
    }
    if (iseerA <= 0 || iseerB <= 0 || iseerA > MAX_ISEER || iseerB > MAX_ISEER) {
      return { error: `ISEER should be between 0 and ${MAX_ISEER} — it is typically 3 to 6.` };
    }
    if (hoursPerYear <= 0 || hoursPerYear > MAX_ANNUAL_HOURS) {
      return { error: "Cooling hours a year should be between 1 and 8,760." };
    }
    capacityWatts = capacityTons * TON_OF_REFRIGERATION_W;
    kwhA = (capacityWatts * hoursPerYear) / iseerA / 1000;
    kwhB = (capacityWatts * hoursPerYear) / iseerB / 1000;
  }

  const costA = kwhA * tariffPerKwh;
  const costB = kwhB * tariffPerKwh;

  const annualKwhSaved = kwhA - kwhB;
  const annualCostSaved = costA - costB;
  const efficiencyGainPct = kwhA > 0 ? (annualKwhSaved / kwhA) * 100 : 0;

  const life = Math.round(lifeYears);
  const lifetimeCostSaved = annualCostSaved * life;
  const netLifetimeGain = lifetimeCostSaved - priceDifference;

  const paybackYears =
    annualCostSaved > 0 && priceDifference > 0 ? priceDifference / annualCostSaved : null;
  const paysBackWithinLife = paybackYears !== null ? paybackYears <= life : annualCostSaved > 0;

  let verdict;
  if (annualKwhSaved <= 0) {
    verdict =
      "Model B is not the more efficient one — its label figure is the same or worse, so paying more for it buys nothing on the bill.";
  } else if (priceDifference === 0) {
    verdict = `Model B uses ${efficiencyGainPct.toFixed(1)}% less energy at no extra cost, so there is nothing to weigh up.`;
  } else if (paysBackWithinLife) {
    verdict = `The extra you pay for model B comes back in about ${paybackYears.toFixed(1)} years, leaving roughly ${Math.max(0, netLifetimeGain).toFixed(0)} in savings across ${life} years.`;
  } else {
    verdict = `At this tariff the price premium takes about ${paybackYears.toFixed(1)} years to recover, longer than the ${life} years you expect to keep it.`;
  }

  return {
    mode,
    capacityWatts,
    hoursPerYear: mode === "iseer" ? hoursPerYear : null,
    modelA: { annualKwh: kwhA, annualCost: costA, monthlyCost: costA / 12 },
    modelB: { annualKwh: kwhB, annualCost: costB, monthlyCost: costB / 12 },
    annualKwhSaved,
    annualCostSaved,
    efficiencyGainPct,
    life,
    lifetimeKwhSaved: annualKwhSaved * life,
    lifetimeCostSaved,
    priceDifference,
    netLifetimeGain,
    paybackYears,
    paysBackWithinLife,
    annualCo2SavedKg: annualKwhSaved * GRID_EMISSION_FACTOR_KG_PER_KWH,
    lifetimeCo2SavedKg: annualKwhSaved * life * GRID_EMISSION_FACTOR_KG_PER_KWH,
    verdict,
  };
}
