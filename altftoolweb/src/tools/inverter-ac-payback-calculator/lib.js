/**
 * Inverter vs fixed-speed air conditioner payback.
 *
 * Energy model — the equivalent full-load hours (EFLH) method:
 *
 *     annual kWh = rated cooling capacity (W) x EFLH / (ISEER x 1000)
 *
 * ISEER (Indian Seasonal Energy Efficiency Ratio) is the BEE star-label metric,
 * defined as the seasonal cooling load in Wh divided by the seasonal energy
 * consumed in Wh. Because it is a *seasonal* ratio it must be paired with
 * equivalent full-load hours, not with wall-clock running hours: BEE's label
 * methodology assumes 1,600 operating hours a year, and the bin-weighted
 * cooling load across those hours averages roughly half of rated capacity,
 * which is the 800 EFLH default used here. That reproduces published BEE label
 * figures closely — a 1.5 TR unit at ISEER 5.2 gives about 810 kWh a year,
 * and the same unit at ISEER 3.65 gives about 1,156 kWh.
 *
 * Savings are escalated annually by the tariff growth rate and accumulated
 * until they cover the price premium; the crossing year is interpolated.
 */

/** 1 ton of refrigeration = 3,516.85 W (12,000 BTU/h). */
export const WATTS_PER_TON = 3516.85;

/** BEE ISEER label methodology assumes 1,600 operating hours per year. */
export const BEE_ANNUAL_HOURS = 1600;

/**
 * Equivalent full-load hours presets. EFLH is lower than wall-clock hours
 * because a unit rarely runs at rated capacity: the seasonal average load is
 * a fraction of the nameplate figure.
 */
export const USAGE_PRESETS = {
  light: { key: "light", label: "Light use — a few months, evenings only", eflh: 500 },
  standard: { key: "standard", label: "BEE label basis — 1,600 h/yr at average load", eflh: 800 },
  heavy: { key: "heavy", label: "Heavy use — long summer, most of the day", eflh: 1400 },
  extreme: { key: "extreme", label: "Very heavy — near year-round cooling", eflh: 2000 },
};

/**
 * Grid emission factor for India, from the CEA CO2 Baseline Database
 * (weighted average of the combined margin, ~0.71 kg CO2 per kWh).
 */
export const GRID_KG_CO2_PER_KWH = 0.71;

/** Practical bounds so the model is not asked for nonsense. */
export const MAX_HORIZON_YEARS = 25;
export const MAX_ISEER = 12;

const round = (value, decimals = 0) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

/**
 * Annual electricity for one unit.
 * @param {number} capacityW rated cooling capacity in watts
 * @param {number} eflh equivalent full-load hours per year
 * @param {number} iseer seasonal efficiency ratio
 * @returns {number} kWh per year
 */
export function annualKwh(capacityW, eflh, iseer) {
  if (!(capacityW > 0) || !(eflh > 0) || !(iseer > 0)) return 0;
  return (capacityW * eflh) / (iseer * 1000);
}

/**
 * Compare an inverter AC against a fixed-speed AC and find the payback period.
 *
 * @param {object} input
 * @param {number|string} input.capacity        rated cooling capacity
 * @param {"ton"|"kw"} input.capacityUnit       unit for capacity
 * @param {number|string} input.eflh            equivalent full-load hours per year
 * @param {number|string} input.inverterIseer   ISEER of the inverter unit
 * @param {number|string} input.fixedIseer      ISEER of the fixed-speed unit
 * @param {number|string} input.inverterPrice   installed price of the inverter unit
 * @param {number|string} input.fixedPrice      installed price of the fixed-speed unit
 * @param {number|string} input.tariff          electricity tariff per kWh
 * @param {number|string} input.escalation      annual tariff increase, percent
 * @param {number|string} input.horizon         analysis period in years
 * @returns {object} payback result, or { error } for invalid input
 */
export function computeInverterPayback({
  capacity = 1.5,
  capacityUnit = "ton",
  eflh = USAGE_PRESETS.standard.eflh,
  inverterIseer = 5.2,
  fixedIseer = 3.65,
  inverterPrice = 42000,
  fixedPrice = 32000,
  tariff = 8,
  escalation = 5,
  horizon = 10,
}) {
  const cap = toNumber(capacity);
  const hours = toNumber(eflh);
  const invE = toNumber(inverterIseer);
  const fixE = toNumber(fixedIseer);
  const invP = toNumber(inverterPrice);
  const fixP = toNumber(fixedPrice);
  const rate = toNumber(tariff);
  const esc = toNumber(escalation);
  const years = Math.round(toNumber(horizon));

  if ([cap, hours, invE, fixE, invP, fixP, rate, esc, years].some((v) => Number.isNaN(v))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (capacityUnit !== "ton" && capacityUnit !== "kw") {
    return { error: "Capacity unit must be tons or kilowatts." };
  }
  if (cap <= 0) return { error: "Cooling capacity must be greater than zero." };
  if (hours <= 0) return { error: "Equivalent full-load hours must be greater than zero." };
  if (hours > 8760) return { error: "A year has 8,760 hours — reduce the running hours." };
  if (invE <= 0 || fixE <= 0) return { error: "ISEER values must be greater than zero." };
  if (invE > MAX_ISEER || fixE > MAX_ISEER) {
    return { error: `No room air conditioner reaches ISEER ${MAX_ISEER} — check the label figures.` };
  }
  if (invP < 0 || fixP < 0) return { error: "Prices cannot be negative." };
  if (rate < 0) return { error: "Electricity tariff cannot be negative." };
  if (esc < -20 || esc > 30) return { error: "Tariff escalation should be between -20% and 30% a year." };
  if (years < 1 || years > MAX_HORIZON_YEARS) {
    return { error: `Analysis period must be between 1 and ${MAX_HORIZON_YEARS} years.` };
  }

  const capacityW = capacityUnit === "ton" ? cap * WATTS_PER_TON : cap * 1000;

  const invKwh = annualKwh(capacityW, hours, invE);
  const fixKwh = annualKwh(capacityW, hours, fixE);
  const kwhSaved = fixKwh - invKwh;
  const energySavingPct = fixKwh > 0 ? (kwhSaved / fixKwh) * 100 : 0;

  const premium = invP - fixP;
  const firstYearSaving = kwhSaved * rate;
  const growth = 1 + esc / 100;

  // Year-by-year cash flow.
  const schedule = [];
  let cumulative = 0;
  let paybackYears = null;
  for (let year = 1; year <= years; year += 1) {
    const saving = firstYearSaving * growth ** (year - 1);
    const previous = cumulative;
    cumulative += saving;
    if (paybackYears === null && premium > 0 && cumulative >= premium && saving > 0) {
      paybackYears = year - 1 + (premium - previous) / saving;
    }
    schedule.push({
      year,
      saving,
      cumulative,
      invKwh,
      fixKwh,
    });
  }

  if (premium <= 0) paybackYears = 0;

  const totalSavings = cumulative;
  const netBenefit = totalSavings - premium;
  const co2SavedKg = kwhSaved * years * GRID_KG_CO2_PER_KWH;

  let verdict;
  if (kwhSaved <= 0) {
    verdict =
      "The inverter unit is no more efficient than the fixed-speed one on these ISEER figures, so it never pays back on running cost alone.";
  } else if (premium <= 0) {
    verdict =
      "The inverter unit costs no more up front, so it is ahead from day one — there is no premium to repay.";
  } else if (paybackYears === null) {
    verdict = `The premium is not repaid within ${years} years at this tariff and usage.`;
  } else {
    verdict = `The extra cost is repaid in about ${round(paybackYears, 1)} years, after which the saving is yours.`;
  }

  return {
    capacityW: round(capacityW, 0),
    invKwh: round(invKwh, 0),
    fixKwh: round(fixKwh, 0),
    kwhSaved: round(kwhSaved, 0),
    energySavingPct: round(energySavingPct, 1),
    premium: round(premium, 0),
    firstYearSaving: round(firstYearSaving, 0),
    paybackYears: paybackYears === null ? null : round(paybackYears, 2),
    totalSavings: round(totalSavings, 0),
    netBenefit: round(netBenefit, 0),
    co2SavedKg: round(co2SavedKg, 0),
    years,
    verdict,
    schedule: schedule.map((row) => ({
      year: row.year,
      saving: round(row.saving, 0),
      cumulative: round(row.cumulative, 0),
    })),
  };
}
