/**
 * Car detailing cost comparison.
 *
 * The point of this calculation is that sticker price is the wrong comparison.
 * A wax costs a fraction of a ceramic coating but lasts about three months, so
 * over a five-year ownership period you buy it twenty times. The honest
 * comparison is cost per year over the period you actually keep the car:
 *
 *   applications = ceil(period in months / durability in months)
 *   total        = applications x treatment price
 *                + annual upkeep x years
 *                + routine wash cost over the whole period
 *
 * Durability figures are the typical real-world life quoted for each treatment,
 * which is usually shorter than the marketing claim. Prices are indicative
 * starting points for a hatchback and are all editable, because detailing
 * rates vary enormously by city and studio.
 */

/** Body size multiplier applied to every treatment price. */
export const CAR_SIZES = [
  { id: "hatchback", label: "Hatchback", multiplier: 1 },
  { id: "sedan", label: "Sedan", multiplier: 1.2 },
  { id: "compactSuv", label: "Compact SUV", multiplier: 1.35 },
  { id: "suv", label: "Full-size SUV / MPV", multiplier: 1.6 },
];

/**
 * durabilityMonths is how long the treatment actually protects for.
 * annualUpkeep covers the maintenance products or top-up a coating needs.
 */
export const TREATMENTS = [
  {
    id: "wax",
    label: "Carnauba wax",
    baseCost: 1500,
    durabilityMonths: 3,
    annualUpkeep: 0,
    note: "Deepest gloss of the lot, and the shortest life. Washes off with strong shampoo.",
  },
  {
    id: "sealant",
    label: "Polymer paint sealant",
    baseCost: 3500,
    durabilityMonths: 6,
    annualUpkeep: 0,
    note: "Synthetic, more durable than wax, less glossy. A sensible middle option.",
  },
  {
    id: "teflon",
    label: "Teflon / PTFE coating",
    baseCost: 6000,
    durabilityMonths: 9,
    annualUpkeep: 0,
    note: "The upsell at most dealerships. Closer to a long-life sealant than to a true ceramic.",
  },
  {
    id: "polish",
    label: "Machine polish (paint correction)",
    baseCost: 5000,
    durabilityMonths: 12,
    annualUpkeep: 0,
    note: "Not protection. It removes a thin layer of clear coat to cut swirls, so it cannot be repeated indefinitely.",
  },
  {
    id: "ceramic",
    label: "Ceramic coating (9H)",
    baseCost: 18000,
    durabilityMonths: 24,
    annualUpkeep: 2500,
    note: "Real chemical resistance and easy cleaning. Needs correct prep and periodic maintenance to reach its rated life.",
  },
  {
    id: "graphene",
    label: "Graphene coating",
    baseCost: 25000,
    durabilityMonths: 36,
    annualUpkeep: 2500,
    note: "A ceramic variant claiming better heat behaviour and less water spotting.",
  },
  {
    id: "ppfPartial",
    label: "Paint protection film — front end only",
    baseCost: 35000,
    durabilityMonths: 60,
    annualUpkeep: 0,
    note: "Covers bonnet, bumper and mirrors — where stone chips actually happen.",
  },
  {
    id: "ppf",
    label: "Paint protection film — full body",
    baseCost: 110000,
    durabilityMonths: 60,
    annualUpkeep: 0,
    note: "The only option that stops physical damage rather than just chemical damage.",
  },
];

/** Routine wash options, priced per visit. */
export const WASH_TYPES = [
  { id: "basic", label: "Basic water wash", cost: 250 },
  { id: "foam", label: "Foam wash with vacuum", cost: 500 },
  { id: "premium", label: "Foam wash with interior detail", cost: 1200 },
];

export const MAX_YEARS = 15;
export const MONTHS_PER_YEAR = 12;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round2 = (value) => Math.round(value * 100) / 100;

export function getCarSize(id) {
  return CAR_SIZES.find((size) => size.id === id) || null;
}

export function getWashType(id) {
  return WASH_TYPES.find((type) => type.id === id) || null;
}

export function getTreatment(id) {
  return TREATMENTS.find((treatment) => treatment.id === id) || null;
}

/**
 * @param {object} input
 * @param {string} input.carSize          CAR_SIZES[].id
 * @param {number} input.years            ownership period being compared
 * @param {number} input.washesPerMonth   routine washes per month
 * @param {number} input.washCost         cost of one routine wash
 * @param {string[]} [input.treatmentIds] TREATMENTS[].id values to compare
 * @param {object} [input.costOverrides]  { [treatmentId]: price } for a hatchback-equivalent quote
 */
export function compareDetailingCost({
  carSize,
  years,
  washesPerMonth,
  washCost,
  treatmentIds = [],
  costOverrides = {},
}) {
  const size = getCarSize(carSize);
  if (!size) return { error: "Choose your car size." };

  if (![years, washesPerMonth, washCost].every(isNum)) {
    return { error: "Enter valid numbers for years, wash frequency and wash cost." };
  }
  if (years <= 0) return { error: "The comparison period must be at least a fraction of a year." };
  if (years > MAX_YEARS) return { error: `Compare over at most ${MAX_YEARS} years.` };
  if (washesPerMonth < 0 || washCost < 0) {
    return { error: "Wash frequency and wash cost cannot be negative." };
  }

  const selected = TREATMENTS.filter((treatment) =>
    Array.isArray(treatmentIds) ? treatmentIds.includes(treatment.id) : false,
  );
  if (selected.length === 0) {
    return { error: "Select at least one treatment to compare." };
  }

  const months = years * MONTHS_PER_YEAR;
  const washTotal = washCost * washesPerMonth * months;

  const overrides = costOverrides && typeof costOverrides === "object" ? costOverrides : {};

  const rows = [];
  for (const treatment of selected) {
    const rawBase = overrides[treatment.id];
    const baseCost = isNum(rawBase) && rawBase >= 0 ? rawBase : treatment.baseCost;
    const unitCost = baseCost * size.multiplier;
    const applications = Math.ceil(months / treatment.durabilityMonths);
    const treatmentTotal = applications * unitCost;
    const upkeepTotal = treatment.annualUpkeep * size.multiplier * years;
    const total = treatmentTotal + upkeepTotal + washTotal;

    rows.push({
      id: treatment.id,
      label: treatment.label,
      note: treatment.note,
      durabilityMonths: treatment.durabilityMonths,
      unitCost: round2(unitCost),
      applications,
      treatmentTotal: round2(treatmentTotal),
      upkeepTotal: round2(upkeepTotal),
      washTotal: round2(washTotal),
      total: round2(total),
      perYear: round2(total / years),
      perMonth: round2(total / months),
      protectionCostPerYear: round2((treatmentTotal + upkeepTotal) / years),
    });
  }

  rows.sort((a, b) => a.total - b.total);

  const baseline = {
    id: "washOnly",
    label: "Routine washing only, no protection",
    total: round2(washTotal),
    perYear: round2(washTotal / years),
    perMonth: round2(washTotal / months),
  };

  return {
    sizeLabel: size.label,
    sizeMultiplier: size.multiplier,
    years,
    months,
    washesPerYear: round2(washesPerMonth * MONTHS_PER_YEAR),
    washTotal: round2(washTotal),
    baseline,
    rows,
    cheapest: rows[0],
    dearest: rows[rows.length - 1],
    spread: round2(rows[rows.length - 1].total - rows[0].total),
  };
}

/**
 * Break-even: how many years a longer-lasting treatment must survive before it
 * costs less per year than a cheaper, shorter-lived one.
 */
export function breakEvenYears({ cheapCost, cheapMonths, premiumCost, premiumMonths }) {
  if (![cheapCost, cheapMonths, premiumCost, premiumMonths].every(isNum)) {
    return { error: "Enter both prices and both durabilities as numbers." };
  }
  if (cheapCost < 0 || premiumCost < 0) return { error: "Prices cannot be negative." };
  if (cheapMonths <= 0 || premiumMonths <= 0) {
    return { error: "Durability must be greater than zero months." };
  }

  const cheapPerYear = (cheapCost * MONTHS_PER_YEAR) / cheapMonths;
  const premiumPerYear = (premiumCost * MONTHS_PER_YEAR) / premiumMonths;

  if (premiumPerYear <= cheapPerYear) {
    return {
      cheapPerYear: round2(cheapPerYear),
      premiumPerYear: round2(premiumPerYear),
      alreadyCheaper: true,
      note: "The longer-lasting option already costs less per year, from the first application.",
    };
  }

  return {
    cheapPerYear: round2(cheapPerYear),
    premiumPerYear: round2(premiumPerYear),
    alreadyCheaper: false,
    annualPremium: round2(premiumPerYear - cheapPerYear),
    note: "The longer-lasting option costs more per year at these figures; it only wins on convenience and finish.",
  };
}
