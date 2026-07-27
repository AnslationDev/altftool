/**
 * Home compost bin sizing.
 *
 * A compost bin is sized by the VOLUME of material sitting in it at any moment, not by
 * the weight you throw in. The heap is charged daily and shrinks continuously, so the
 * average volume occupied over one retention cycle is:
 *
 *   workingVolume = dailyChargeVolume x retentionDays x (1 + (1 - volumeReduction)) / 2
 *
 * i.e. the mean of a full-volume fresh charge and the shrunken finished charge. A bin is
 * then oversized by a headspace allowance so the heap can be turned without spilling:
 *
 *   binVolume = workingVolume / (1 - HEADSPACE_FRACTION)
 *
 * Sources of the constants are noted against each one.
 */

/**
 * Loose bulk density of mixed household kitchen/food waste.
 * Reported ranges for uncompacted food waste are roughly 400-600 kg/m3
 * (0.40-0.60 kg per litre); 0.50 kg/L is the mid-range working value.
 */
export const GREEN_DENSITY_KG_PER_LITRE = 0.5;

/**
 * Free space kept above the heap for turning, aeration and surge days.
 * Composting guidance is to fill a bin to about three-quarters, so 25% headspace.
 */
export const HEADSPACE_FRACTION = 0.25;

/**
 * Finished compost recovered as a fraction of the WET mass fed in. Kitchen waste is
 * 70-80% water and loses further carbon as CO2, so mature compost is typically
 * 20-30% of the original wet weight. 0.25 is the mid value.
 */
export const COMPOST_MASS_YIELD = 0.25;

/**
 * "Browns" (dry carbon) added per unit VOLUME of "greens" (wet kitchen waste),
 * to reach the 25-30:1 carbon-to-nitrogen ratio aerobic composting needs.
 * Bulkier, lower-carbon-per-litre browns need a bigger volume ratio.
 */
export const BROWN_MATERIALS = [
  { value: "leaves", label: "Dry leaves / garden trimmings", ratio: 2, note: "C:N about 60:1, very bulky" },
  { value: "cardboard", label: "Shredded cardboard or paper", ratio: 1.5, note: "C:N about 300:1 but low density" },
  { value: "cocopeat", label: "Cocopeat / coir pith", ratio: 1, note: "C:N about 100:1, compact and absorbent" },
  { value: "sawdust", label: "Sawdust or fine wood shavings", ratio: 0.5, note: "C:N about 400:1, very carbon dense" },
  { value: "remix", label: "Ready compost remix powder", ratio: 0.5, note: "Pre-blended, dosed sparingly" },
];

/**
 * Turning regime sets both how long material stays in the bin and how far it shrinks.
 * More turning finishes faster; a longer total cycle decomposes more completely and
 * therefore shrinks more. Retention days follow standard composting guidance:
 * turned/hot piles finish in 6-10 weeks, unturned cold heaps take 4-6 months.
 */
export const TURNING_METHODS = [
  { value: "daily", label: "Tumbler, turned daily", days: 45, reduction: 0.55 },
  { value: "frequent", label: "Turned every 3-4 days (hot compost)", days: 60, reduction: 0.6 },
  { value: "weekly", label: "Turned weekly or fortnightly", days: 90, reduction: 0.65 },
  { value: "static", label: "Static cold heap, rarely turned", days: 150, reduction: 0.7 },
];

/** Chambers below this are a single-batch system with no curing bin. */
export const MIN_RECOMMENDED_CHAMBERS = 2;

/** Practical upper limit for a household tool; above this it is a community/institutional job. */
export const MAX_DAILY_WASTE_KG = 100;

const round = (value, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const findOption = (options, value) => options.find((option) => option.value === value) || null;

const toNumber = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : NaN;
};

/**
 * @param {object} input
 * @param {number|string} input.dailyWasteKg Wet kitchen waste added per day, in kg.
 * @param {string} [input.brownMaterial] One of BROWN_MATERIALS values.
 * @param {string} [input.method] One of TURNING_METHODS values.
 * @param {number|string} [input.retentionDays] Override the method's default cycle length.
 * @param {number|string} [input.chambers] Number of bins/pots the system is split across.
 */
export function computeCompostBin({
  dailyWasteKg,
  brownMaterial = "cocopeat",
  method = "frequent",
  retentionDays,
  chambers = 3,
} = {}) {
  const wasteKg = toNumber(dailyWasteKg);
  const chamberCount = toNumber(chambers);

  const brown = findOption(BROWN_MATERIALS, brownMaterial);
  const turning = findOption(TURNING_METHODS, method);
  if (!brown || !turning) {
    return { error: "Choose a valid browns material and turning method." };
  }

  const days = retentionDays === undefined || retentionDays === "" ? turning.days : toNumber(retentionDays);

  if ([wasteKg, chamberCount, days].some((value) => Number.isNaN(value))) {
    return { error: "Enter valid numbers for waste, cycle length and chamber count." };
  }
  if (wasteKg <= 0) {
    return { error: "Enter the kitchen waste you add per day — it must be more than zero." };
  }
  if (wasteKg > MAX_DAILY_WASTE_KG) {
    return {
      error: `Above ${MAX_DAILY_WASTE_KG} kg a day this is a community or institutional composting job, not a home bin.`,
    };
  }
  if (days < 14 || days > 365) {
    return { error: "A composting cycle should be between 14 and 365 days." };
  }
  if (!Number.isInteger(chamberCount) || chamberCount < 1 || chamberCount > 6) {
    return { error: "Choose between 1 and 6 chambers." };
  }

  // Daily charge, by volume.
  const greenLitresPerDay = wasteKg / GREEN_DENSITY_KG_PER_LITRE;
  const brownLitresPerDay = greenLitresPerDay * brown.ratio;
  const chargeLitresPerDay = greenLitresPerDay + brownLitresPerDay;

  // Mean occupied volume across one retention cycle (fresh charge -> shrunken charge).
  const shrinkMultiplier = (1 + (1 - turning.reduction)) / 2;
  const workingLitres = chargeLitresPerDay * days * shrinkMultiplier;

  // Add headspace for turning.
  const binLitres = workingLitres / (1 - HEADSPACE_FRACTION);
  const litresPerChamber = binLitres / chamberCount;

  // A cube of this side (in metres) holds the whole system volume; 1000 L = 1 m3.
  const cubeSideMetres = Math.cbrt(binLitres / 1000);
  const chamberCubeSideMetres = Math.cbrt(litresPerChamber / 1000);

  // Throughput and yield.
  const annualWasteKg = wasteKg * 365;
  const annualCompostKg = annualWasteKg * COMPOST_MASS_YIELD;
  const compostPerCycleKg = wasteKg * days * COMPOST_MASS_YIELD;

  const notes = [];
  if (chamberCount < MIN_RECOMMENDED_CHAMBERS) {
    notes.push(
      "With a single chamber you must stop adding waste while the batch cures. Two or three chambers let one fill while another matures.",
    );
  }
  if (brown.ratio === 0) {
    notes.push("Greens alone go anaerobic and smell. Always mix in a dry carbon material.");
  }
  if (turning.value === "static") {
    notes.push(
      "A cold heap holds material for months, so it needs roughly two to three times the volume of a turned bin for the same daily input.",
    );
  }

  return {
    dailyWasteKg: round(wasteKg, 2),
    brownLabel: brown.label,
    brownRatio: brown.ratio,
    brownNote: brown.note,
    methodLabel: turning.label,
    retentionDays: round(days),
    volumeReductionPct: round(turning.reduction * 100),
    greenLitresPerDay: round(greenLitresPerDay, 1),
    brownLitresPerDay: round(brownLitresPerDay, 1),
    chargeLitresPerDay: round(chargeLitresPerDay, 1),
    workingLitres: round(workingLitres),
    binLitres: round(binLitres),
    chambers: chamberCount,
    litresPerChamber: round(litresPerChamber),
    cubeSideCm: round(cubeSideMetres * 100),
    chamberCubeSideCm: round(chamberCubeSideMetres * 100),
    headspaceLitres: round(binLitres - workingLitres),
    annualWasteKg: round(annualWasteKg),
    annualCompostKg: round(annualCompostKg, 1),
    compostPerCycleKg: round(compostPerCycleKg, 1),
    notes,
  };
}
