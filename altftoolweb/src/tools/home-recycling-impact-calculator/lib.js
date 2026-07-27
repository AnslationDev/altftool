/**
 * Household recycling impact.
 *
 * The arithmetic is a straight sum of material quantity times a per-kilogram
 * saving factor:
 *
 *   saving = kg recycled x capture rate x factor per kg
 *
 * The factors are the interesting part. Each one is the difference between
 * making a material from recycled feedstock and making it from virgin raw
 * material, across the whole supply chain — mining, refining, transport and
 * manufacture. They come from the family of lifecycle datasets used in waste
 * policy (the US EPA WARM model for greenhouse gases, Bureau of International
 * Recycling and industry association figures for energy and water).
 *
 * They are indicative averages, not measurements of your local recycler:
 * energy grids, process routes and transport distances all move them. Every
 * factor is therefore exposed as an editable input rather than baked in, and
 * the one figure quoted with confidence is aluminium's, where recycling saves
 * about 95% of the energy of primary production — the largest and most
 * consistently reported saving of any common household material.
 */

export const WEEKS_PER_YEAR = 52;

/**
 * Average tailpipe CO2 of a petrol passenger car, in kg per km. Used only to
 * express the emissions saving as a distance, which is easier to picture.
 */
export const CAR_CO2_KG_PER_KM = 0.13;

/** A standard bucket, in litres, used to express the water saving. */
export const BUCKET_LITRES = 20;

/** Months in a year. */
export const MONTHS_PER_YEAR = 12;

/**
 * Per-kilogram savings from recycling instead of making the material new.
 *  kwhPerKg   - primary energy saved, in kWh
 *  co2PerKg   - greenhouse gases avoided, in kg CO2 equivalent
 *  waterPerKg - process water saved, in litres
 *  energySavingPct - saving as a share of primary production energy
 */
export const RECYCLABLE_MATERIALS = [
  { id: "aluminium", label: "Aluminium cans and foil", kwhPerKg: 14, co2PerKg: 9.1, waterPerKg: 100, energySavingPct: 95 },
  { id: "pet", label: "PET bottles (plastic 1)", kwhPerKg: 6, co2PerKg: 1.2, waterPerKg: 45, energySavingPct: 65 },
  { id: "hdpe", label: "HDPE containers (plastic 2)", kwhPerKg: 5.3, co2PerKg: 0.9, waterPerKg: 40, energySavingPct: 60 },
  { id: "steel", label: "Steel and tin cans", kwhPerKg: 3.4, co2PerKg: 1.8, waterPerKg: 40, energySavingPct: 62 },
  { id: "paper", label: "Mixed paper", kwhPerKg: 1.2, co2PerKg: 1, waterPerKg: 30, energySavingPct: 40 },
  { id: "cardboard", label: "Corrugated cardboard", kwhPerKg: 1.1, co2PerKg: 0.9, waterPerKg: 25, energySavingPct: 35 },
  { id: "glass", label: "Glass bottles and jars", kwhPerKg: 0.6, co2PerKg: 0.3, waterPerKg: 6, energySavingPct: 25 },
];

const MAX_KG_PER_WEEK = 500;
const MAX_FACTOR = 1000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * @param {object} input
 * @param {Array}  input.materials  [{ id, label, kgPerWeek, kwhPerKg, co2PerKg, waterPerKg }]
 * @param {number} [input.captureRatePct] Share that actually gets recycled, %.
 * @param {number} [input.monthlyUnits]   Household electricity a month, for context.
 */
export function computeRecyclingImpact({
  materials,
  captureRatePct = 100,
  monthlyUnits = 0,
}) {
  if (!Array.isArray(materials) || materials.length === 0) {
    return { error: "No materials were supplied." };
  }
  if (!isNum(captureRatePct) || !isNum(monthlyUnits)) {
    return { error: "Enter valid numbers for capture rate and monthly electricity units." };
  }
  if (captureRatePct <= 0 || captureRatePct > 100) {
    return { error: "Capture rate must be between 1% and 100%." };
  }
  if (monthlyUnits < 0) {
    return { error: "Monthly electricity units cannot be negative." };
  }

  const capture = captureRatePct / 100;
  const rows = [];

  for (const material of materials) {
    const kgPerWeek = Number(material.kgPerWeek);
    const kwhPerKg = Number(material.kwhPerKg);
    const co2PerKg = Number(material.co2PerKg);
    const waterPerKg = Number(material.waterPerKg);

    if (![kgPerWeek, kwhPerKg, co2PerKg, waterPerKg].every(isNum)) {
      return { error: `Check the numbers entered for ${material.label}.` };
    }
    if (kgPerWeek < 0 || kwhPerKg < 0 || co2PerKg < 0 || waterPerKg < 0) {
      return { error: `Values for ${material.label} cannot be negative.` };
    }
    if (kgPerWeek > MAX_KG_PER_WEEK) {
      return { error: `${MAX_KG_PER_WEEK} kg a week of ${material.label} is beyond a household.` };
    }
    if (kwhPerKg > MAX_FACTOR || co2PerKg > MAX_FACTOR || waterPerKg > MAX_FACTOR) {
      return { error: `A saving factor for ${material.label} looks too large — check it.` };
    }

    const kgPerYear = kgPerWeek * WEEKS_PER_YEAR * capture;

    rows.push({
      id: material.id,
      label: material.label,
      kgPerWeek,
      kgPerYear,
      kwhPerKg,
      co2PerKg,
      waterPerKg,
      energySavedKwh: kgPerYear * kwhPerKg,
      co2AvoidedKg: kgPerYear * co2PerKg,
      waterSavedLitres: kgPerYear * waterPerKg,
    });
  }

  const totalKgPerYear = rows.reduce((sum, row) => sum + row.kgPerYear, 0);

  if (totalKgPerYear <= 0) {
    return { error: "Enter how much of at least one material your household recycles." };
  }

  const energySavedKwh = rows.reduce((sum, row) => sum + row.energySavedKwh, 0);
  const co2AvoidedKg = rows.reduce((sum, row) => sum + row.co2AvoidedKg, 0);
  const waterSavedLitres = rows.reduce((sum, row) => sum + row.waterSavedLitres, 0);

  const ranked = [...rows]
    .filter((row) => row.kgPerYear > 0)
    .sort((a, b) => b.co2AvoidedKg - a.co2AvoidedKg);

  const annualUnits = monthlyUnits * MONTHS_PER_YEAR;

  return {
    rows,
    ranked,
    biggestContributor: ranked.length > 0 ? ranked[0] : null,
    captureRatePct,
    totalKgPerWeek: rows.reduce((sum, row) => sum + row.kgPerWeek, 0),
    totalKgPerYear,
    energySavedKwh,
    co2AvoidedKg,
    waterSavedLitres,
    // Comparisons that make the totals easier to picture.
    carKmEquivalent: co2AvoidedKg / CAR_CO2_KG_PER_KM,
    bucketsOfWater: waterSavedLitres / BUCKET_LITRES,
    householdElectricityMonths: annualUnits > 0 ? energySavedKwh / monthlyUnits : null,
    shareOfHouseholdElectricityPct:
      annualUnits > 0 ? (energySavedKwh / annualUnits) * 100 : null,
    energyPerKg: energySavedKwh / totalKgPerYear,
    co2PerKgAverage: co2AvoidedKg / totalKgPerYear,
  };
}
