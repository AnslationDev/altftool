/**
 * Household electricity bill estimator.
 *
 * Rules implemented
 * -----------------
 * 1. Energy consumed by an appliance:  kWh = watts x quantity x hours per day / 1000.
 *    One "unit" on an Indian electricity bill is exactly one kilowatt-hour, so a 1000 W
 *    appliance run for one hour consumes one unit. This is the definition of the kWh, not
 *    a tariff rule, so it holds for every DISCOM and every country.
 * 2. Indian domestic LT-1 tariffs are telescopic: the first block of units is charged at the
 *    first block rate, the next block at the next rate and so on. Only the units that fall
 *    inside a block are charged at that block's rate — the whole bill is not re-priced at the
 *    top rate. (Non-telescopic slabs exist for a few categories; domestic supply is telescopic
 *    in every state listed below.)
 * 3. A monthly fixed charge (also called demand or meter charge) is added regardless of usage,
 *    and electricity duty / tax is levied as a percentage of (energy charge + fixed charge).
 * 4. Billing period: monthly figures use the number of days actually billed. Yearly figures
 *    scale the daily figure by 365 rather than multiplying a 30-day month by 12.
 *
 * The slab rates below are indicative domestic (LT-1, single phase) tariffs for the listed
 * states, rounded to the paise as published in the respective state regulator's retail supply
 * tariff order. Tariffs change every financial year and vary by DISCOM inside a state, so the
 * tool also accepts a flat rate read straight off the user's own bill, which is always exact.
 */

/** One unit of electricity = 1 kilowatt-hour = 1000 watt-hours. Definition of the kWh. */
export const WATTS_PER_KILOWATT = 1000;

/** Mean days per year used to annualise a daily figure (Gregorian calendar, ignoring leap rule). */
export const DAYS_PER_YEAR = 365;

/** Longest billing cycle accepted — bimonthly cycles run to about 62 days. */
export const MAX_BILLING_DAYS = 62;

/** An appliance cannot run more than 24 hours in a day. */
export const HOURS_PER_DAY = 24;

/**
 * Indicative domestic LT-1 slab tariffs (INR per unit), monthly fixed charge (INR) and
 * electricity duty (% of energy + fixed charge). `upto` is the cumulative unit ceiling of the
 * block; `null` means "everything above the previous ceiling".
 */
export const STATE_TARIFFS = [
  {
    id: "delhi",
    state: "Delhi",
    fixedCharge: 125,
    taxPercent: 5,
    slabs: [
      { upto: 200, rate: 3 },
      { upto: 400, rate: 4.5 },
      { upto: 800, rate: 6.5 },
      { upto: null, rate: 7 },
    ],
  },
  {
    id: "uttar-pradesh",
    state: "Uttar Pradesh",
    fixedCharge: 110,
    taxPercent: 5,
    slabs: [
      { upto: 150, rate: 5.5 },
      { upto: 300, rate: 6 },
      { upto: 500, rate: 6.5 },
      { upto: null, rate: 7 },
    ],
  },
  {
    id: "maharashtra",
    state: "Maharashtra",
    fixedCharge: 120,
    taxPercent: 16,
    slabs: [
      { upto: 100, rate: 4.71 },
      { upto: 300, rate: 10.29 },
      { upto: 500, rate: 14.55 },
      { upto: null, rate: 16.64 },
    ],
  },
  {
    id: "madhya-pradesh",
    state: "Madhya Pradesh",
    fixedCharge: 105,
    taxPercent: 9,
    slabs: [
      { upto: 50, rate: 4.21 },
      { upto: 150, rate: 5.17 },
      { upto: 300, rate: 6.55 },
      { upto: null, rate: 7.1 },
    ],
  },
  {
    id: "gujarat",
    state: "Gujarat",
    fixedCharge: 90,
    taxPercent: 5,
    slabs: [
      { upto: 50, rate: 3.2 },
      { upto: 200, rate: 3.95 },
      { upto: 250, rate: 5 },
      { upto: null, rate: 5.7 },
    ],
  },
  {
    id: "rajasthan",
    state: "Rajasthan",
    fixedCharge: 115,
    taxPercent: 8,
    slabs: [
      { upto: 50, rate: 4.75 },
      { upto: 150, rate: 6.5 },
      { upto: 300, rate: 7.35 },
      { upto: null, rate: 7.65 },
    ],
  },
  {
    id: "bihar",
    state: "Bihar",
    fixedCharge: 100,
    taxPercent: 6,
    slabs: [
      { upto: 100, rate: 6.1 },
      { upto: 200, rate: 6.4 },
      { upto: 300, rate: 6.7 },
      { upto: null, rate: 7.2 },
    ],
  },
  {
    id: "punjab",
    state: "Punjab",
    fixedCharge: 95,
    taxPercent: 5,
    slabs: [
      { upto: 100, rate: 4.49 },
      { upto: 300, rate: 6.34 },
      { upto: null, rate: 7.3 },
    ],
  },
  {
    id: "haryana",
    state: "Haryana",
    fixedCharge: 105,
    taxPercent: 5,
    slabs: [
      { upto: 100, rate: 2.5 },
      { upto: 800, rate: 6.5 },
      { upto: null, rate: 7.1 },
    ],
  },
  {
    id: "karnataka",
    state: "Karnataka",
    fixedCharge: 120,
    taxPercent: 9,
    slabs: [
      { upto: 50, rate: 4.15 },
      { upto: 100, rate: 5.6 },
      { upto: 200, rate: 7.15 },
      { upto: null, rate: 8.2 },
    ],
  },
];

/**
 * Typical nameplate wattage of common Indian household appliances, taken from BEE star-label
 * ranges and manufacturer rating plates. `hours` is a common daily run time, not a rule.
 */
export const APPLIANCE_PRESETS = [
  { id: "ac-15-split", label: "Split AC 1.5 ton (5 star)", watts: 1200, hours: 6 },
  { id: "ac-window", label: "Window AC 1.5 ton", watts: 1800, hours: 6 },
  { id: "fridge-double", label: "Refrigerator, double door", watts: 250, hours: 8 },
  { id: "fridge-single", label: "Refrigerator, single door", watts: 150, hours: 8 },
  { id: "ceiling-fan", label: "Ceiling fan", watts: 75, hours: 12 },
  { id: "bldc-fan", label: "BLDC ceiling fan", watts: 30, hours: 12 },
  { id: "led-bulb", label: "LED bulb 9 W", watts: 9, hours: 6 },
  { id: "tube-light", label: "LED tube light 20 W", watts: 20, hours: 5 },
  { id: "geyser", label: "Water geyser 15 L", watts: 2000, hours: 1 },
  { id: "washing-machine", label: "Washing machine", watts: 500, hours: 1 },
  { id: "tv-led", label: "LED TV 43 inch", watts: 90, hours: 5 },
  { id: "microwave", label: "Microwave oven", watts: 1200, hours: 0.5 },
  { id: "laptop", label: "Laptop", watts: 65, hours: 8 },
  { id: "desktop", label: "Desktop computer", watts: 200, hours: 6 },
  { id: "air-cooler", label: "Air cooler", watts: 200, hours: 8 },
  { id: "water-pump", label: "Water pump 0.5 hp", watts: 400, hours: 1 },
  { id: "induction", label: "Induction cooktop", watts: 1600, hours: 1 },
  { id: "mixer", label: "Mixer grinder", watts: 500, hours: 0.25 },
  { id: "iron", label: "Electric iron", watts: 1000, hours: 0.3 },
  { id: "router", label: "Wi-Fi router", watts: 10, hours: 24 },
];

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
const round1 = (value) => Math.round((value + Number.EPSILON) * 10) / 10;

const isBadNumber = (value) => typeof value !== "number" || !Number.isFinite(value);

/** Look up a tariff row by its id. Returns undefined when the id is unknown. */
export function getStateTariff(id) {
  return STATE_TARIFFS.find((row) => row.id === id);
}

/**
 * Telescopic slab pricing. Charges each block of units at that block's own rate.
 * @param {number} units  Units consumed in the billing period.
 * @param {Array<{upto: number|null, rate: number}>} slabs
 * @returns {{ energyCharge: number, rows: Array }} or { error }
 */
export function computeSlabEnergyCharge(units, slabs) {
  if (isBadNumber(units) || units < 0) {
    return { error: "Units consumed must be zero or more." };
  }
  if (!Array.isArray(slabs) || slabs.length === 0) {
    return { error: "No tariff slabs were supplied for this state." };
  }

  let remaining = units;
  let previousCeiling = 0;
  let energyCharge = 0;
  const rows = [];

  for (const slab of slabs) {
    if (remaining <= 0) break;
    const ceiling = slab.upto === null || slab.upto === undefined ? Infinity : slab.upto;
    if (isBadNumber(slab.rate) || slab.rate < 0) {
      return { error: "Tariff slab rates must be zero or more." };
    }
    const blockSize = ceiling - previousCeiling;
    const unitsInBlock = Math.min(remaining, blockSize);
    const charge = unitsInBlock * slab.rate;
    energyCharge += charge;
    rows.push({
      from: previousCeiling,
      to: ceiling === Infinity ? null : ceiling,
      rate: slab.rate,
      units: round1(unitsInBlock),
      charge: round2(charge),
    });
    remaining -= unitsInBlock;
    previousCeiling = ceiling;
  }

  return { energyCharge: round2(energyCharge), rows };
}

/**
 * Full household bill estimate.
 *
 * @param {object} input
 * @param {Array<{name: string, watts: number, hours: number, quantity: number}>} input.appliances
 * @param {"slab"|"flat"} [input.tariffMode]
 * @param {string} [input.stateId]          Required when tariffMode is "slab".
 * @param {number} [input.flatRate]         INR per unit, required when tariffMode is "flat".
 * @param {number} [input.fixedCharge]      Overrides the state fixed charge when supplied.
 * @param {number} [input.taxPercent]       Overrides the state duty percent when supplied.
 * @param {boolean} [input.includeTax]
 * @param {number} [input.billingDays]      Days in the billing cycle (1-62), default 30.
 * @returns {object} breakdown, or { error } when the input cannot produce a real answer.
 */
export function calculateElectricityBill(input = {}) {
  const {
    appliances,
    tariffMode = "slab",
    stateId = "delhi",
    flatRate = 0,
    fixedCharge,
    taxPercent,
    includeTax = true,
    billingDays = 30,
  } = input;

  if (!Array.isArray(appliances) || appliances.length === 0) {
    return { error: "Add at least one appliance to estimate a bill." };
  }
  if (isBadNumber(billingDays) || billingDays < 1 || billingDays > MAX_BILLING_DAYS) {
    return { error: `Billing days must be between 1 and ${MAX_BILLING_DAYS}.` };
  }
  if (tariffMode !== "slab" && tariffMode !== "flat") {
    return { error: "Choose either state slab tariff or a flat rate per unit." };
  }

  let tariff = null;
  if (tariffMode === "slab") {
    tariff = getStateTariff(stateId);
    if (!tariff) {
      return { error: "Choose a state whose slab tariff is available." };
    }
  } else if (isBadNumber(flatRate) || flatRate <= 0) {
    return { error: "Enter a flat rate per unit greater than zero." };
  } else if (flatRate > 100) {
    return { error: "A rate above INR 100 per unit is not a residential tariff." };
  }

  const items = [];
  let dailyUnits = 0;

  for (const appliance of appliances) {
    const watts = Number(appliance?.watts);
    const hours = Number(appliance?.hours);
    const quantity = Number(appliance?.quantity);

    if (isBadNumber(watts) || isBadNumber(hours) || isBadNumber(quantity)) {
      return { error: `Enter numbers for wattage, hours and quantity of "${appliance?.name || "appliance"}".` };
    }
    if (watts <= 0) {
      return { error: `Wattage of "${appliance?.name || "appliance"}" must be greater than zero.` };
    }
    if (watts > 20000) {
      return { error: `A ${watts} W household appliance is out of range — check the rating plate.` };
    }
    if (hours < 0 || hours > HOURS_PER_DAY) {
      return { error: `Hours per day for "${appliance?.name || "appliance"}" must be between 0 and 24.` };
    }
    if (quantity < 1 || quantity > 200 || !Number.isInteger(quantity)) {
      return { error: `Quantity of "${appliance?.name || "appliance"}" must be a whole number from 1 to 200.` };
    }

    const itemDailyUnits = (watts * quantity * hours) / WATTS_PER_KILOWATT;
    dailyUnits += itemDailyUnits;
    items.push({
      name: appliance?.name || "Appliance",
      watts,
      hours,
      quantity,
      dailyUnits: round2(itemDailyUnits),
      periodUnits: round1(itemDailyUnits * billingDays),
      yearlyUnits: Math.round(itemDailyUnits * DAYS_PER_YEAR),
    });
  }

  const periodUnits = dailyUnits * billingDays;

  let energyCharge;
  let slabRows = [];
  if (tariffMode === "slab") {
    const slabResult = computeSlabEnergyCharge(periodUnits, tariff.slabs);
    if (slabResult.error) return { error: slabResult.error };
    energyCharge = slabResult.energyCharge;
    slabRows = slabResult.rows;
  } else {
    energyCharge = round2(periodUnits * flatRate);
  }

  const appliedFixedCharge = isBadNumber(Number(fixedCharge))
    ? tariff
      ? tariff.fixedCharge
      : 0
    : Math.max(0, Number(fixedCharge));
  const appliedTaxPercent = isBadNumber(Number(taxPercent))
    ? tariff
      ? tariff.taxPercent
      : 0
    : Math.max(0, Math.min(100, Number(taxPercent)));

  const taxableAmount = energyCharge + appliedFixedCharge;
  const taxAmount = includeTax ? round2((taxableAmount * appliedTaxPercent) / 100) : 0;
  const totalCost = round2(taxableAmount + taxAmount);

  const effectiveRate = periodUnits > 0 ? round2(totalCost / periodUnits) : 0;

  const breakdown = items
    .map((item) => ({
      ...item,
      sharePercent: periodUnits > 0 ? round1((item.periodUnits / periodUnits) * 100) : 0,
      periodCost: round2(item.periodUnits * effectiveRate),
    }))
    .sort((a, b) => b.periodUnits - a.periodUnits);

  return {
    billingDays,
    tariffMode,
    stateName: tariff ? tariff.state : "Flat rate",
    dailyUnits: round2(dailyUnits),
    periodUnits: round1(periodUnits),
    yearlyUnits: Math.round(dailyUnits * DAYS_PER_YEAR),
    energyCharge,
    fixedCharge: round2(appliedFixedCharge),
    taxPercent: appliedTaxPercent,
    taxAmount,
    totalCost,
    dailyCost: round2(totalCost / billingDays),
    yearlyCost: round2((totalCost / billingDays) * DAYS_PER_YEAR),
    effectiveRate,
    slabRows,
    breakdown,
    biggestConsumer: breakdown.length > 0 ? breakdown[0] : null,
  };
}

/**
 * Money saved in a billing period by cutting one appliance's daily run time.
 * Uses the effective rate per unit so fixed charge and duty are shared fairly.
 */
export function estimateRuntimeSaving({ watts, quantity = 1, hoursSaved, effectiveRate, billingDays = 30 }) {
  if (
    isBadNumber(Number(watts)) ||
    isBadNumber(Number(hoursSaved)) ||
    isBadNumber(Number(effectiveRate)) ||
    isBadNumber(Number(billingDays))
  ) {
    return { error: "Enter valid numbers to estimate a saving." };
  }
  if (watts <= 0 || hoursSaved <= 0 || billingDays <= 0 || effectiveRate < 0) {
    return { error: "Wattage, hours saved and billing days must be greater than zero." };
  }
  const unitsSaved = (Number(watts) * Number(quantity) * Number(hoursSaved) * Number(billingDays)) / WATTS_PER_KILOWATT;
  return {
    unitsSaved: round1(unitsSaved),
    moneySaved: round2(unitsSaved * Number(effectiveRate)),
  };
}
