/**
 * Kitchen waste composting: carbon-to-nitrogen balancing and yield.
 *
 * Two pieces of real composting science drive everything here.
 *
 * 1. C:N BALANCING. A compost pile works best at a carbon-to-nitrogen ratio
 *    around 25:1 to 30:1. Kitchen scraps sit near 20:1, so they need a
 *    carbon-rich "brown" added. Balancing is done on dry mass:
 *
 *      Db = Dg x (1 - target/CNg) / (target/CNb - 1)
 *
 *    where D is dry mass and CN the carbon-to-nitrogen ratio. The carbon
 *    fraction of dry organic matter cancels out of both sides, so this needs
 *    no assumption about how much of the dry matter is carbon.
 *
 * 2. MASS LOSS. Composting loses mass two ways: water evaporates, and roughly
 *    half the dry organic matter is respired away as CO2 by the microbes.
 *    What is left is finished compost at around 40% moisture. Running those
 *    two losses through the numbers reproduces the 20-40% of wet feedstock
 *    yield that composting guides report, without hardcoding that range.
 *
 * Nitrogen is largely but not entirely conserved: 20-50% is typically lost to
 * ammonia volatilisation and leaching, so a retention factor is applied before
 * reporting the nitrogen in the finished compost.
 */

/** Weeks in a year, for annualising a weekly figure. */
export const WEEKS_PER_YEAR = 52;

/** Recommended starting C:N ratio for a compost pile. */
export const TARGET_CN_RATIO = 30;

/**
 * Share of the initial dry matter respired away as CO2 during composting.
 * Composting studies put dry-matter loss in the 45-60% range for a well-run
 * pile; 50% is the mid-point.
 */
export const DRY_MATTER_LOSS_FRACTION = 0.5;

/** Moisture content of mature, screened compost. Typically 35-45%. */
export const FINISHED_COMPOST_MOISTURE = 0.4;

/**
 * Fraction of the feedstock nitrogen that survives into finished compost.
 * The rest is lost as ammonia and to leaching; losses of 20-50% are typical.
 */
export const NITROGEN_RETENTION = 0.6;

/**
 * Carbon fraction of dry organic matter. Only used to report absolute
 * nitrogen mass — it cancels out of the C:N balance itself.
 */
export const CARBON_FRACTION_OF_DRY_MATTER = 0.5;

/** Nitrogen content of urea by mass: 46%. Used for the fertiliser equivalent. */
export const UREA_NITROGEN_FRACTION = 0.46;

/** Bulk density of a mixed, loosely filled compost pile, in kg per cubic metre. */
export const FEEDSTOCK_BULK_DENSITY_KG_PER_M3 = 400;

/** Litres in a cubic metre. */
const LITRES_PER_M3 = 1000;

/**
 * Carbon-to-nitrogen ratios and moisture of common composting materials.
 * These are the standard reference values used in composting literature.
 */
export const BROWN_MATERIALS = [
  { id: "dry-leaves", label: "Dry leaves", cn: 60, moisture: 0.15 },
  { id: "straw", label: "Straw", cn: 75, moisture: 0.12 },
  { id: "shredded-paper", label: "Shredded paper", cn: 170, moisture: 0.06 },
  { id: "cardboard", label: "Corrugated cardboard", cn: 350, moisture: 0.08 },
  { id: "sawdust", label: "Untreated sawdust", cn: 500, moisture: 0.12 },
  { id: "coir", label: "Coir pith / coco peat", cn: 100, moisture: 0.2 },
];

export const GREEN_MATERIALS = [
  { id: "mixed-kitchen", label: "Mixed kitchen scraps", cn: 20, moisture: 0.75 },
  { id: "vegetable-peel", label: "Vegetable and fruit peel", cn: 18, moisture: 0.8 },
  { id: "coffee-grounds", label: "Coffee grounds", cn: 20, moisture: 0.65 },
  { id: "grass-clippings", label: "Fresh grass clippings", cn: 17, moisture: 0.8 },
];

const MAX_WEEKLY_KG = 500;
const MAX_CN = 1000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Dry mass of browns needed per unit dry mass of greens to hit a target C:N.
 * Returns 0 when the greens are already at or above the target, and null when
 * the brown is not carbon-rich enough to ever reach it.
 */
export function brownsPerDryGreen({ greenCn, brownCn, targetCn = TARGET_CN_RATIO }) {
  if (![greenCn, brownCn, targetCn].every(isNum)) return null;
  if (greenCn <= 0 || brownCn <= 0 || targetCn <= 0) return null;
  if (brownCn <= targetCn) return null;
  const ratio = (1 - targetCn / greenCn) / (targetCn / brownCn - 1);
  return ratio > 0 ? ratio : 0;
}

/**
 * @param {object} input
 * @param {number} input.kitchenWasteKgPerWeek Wet weight of kitchen scraps a week.
 * @param {number} input.greenCn        C:N ratio of the scraps.
 * @param {number} input.greenMoisture  Moisture fraction of the scraps (0-1).
 * @param {number} input.brownCn        C:N ratio of the brown material.
 * @param {number} input.brownMoisture  Moisture fraction of the brown (0-1).
 * @param {number} [input.targetCn]     Target starting C:N ratio.
 * @param {number} [input.dryMatterLoss] Fraction of dry matter respired away.
 * @param {number} [input.cycleWeeks]   Weeks a batch takes to mature.
 */
export function estimateCompost({
  kitchenWasteKgPerWeek,
  greenCn,
  greenMoisture,
  brownCn,
  brownMoisture,
  targetCn = TARGET_CN_RATIO,
  dryMatterLoss = DRY_MATTER_LOSS_FRACTION,
  cycleWeeks = 12,
}) {
  const numbers = [
    kitchenWasteKgPerWeek,
    greenCn,
    greenMoisture,
    brownCn,
    brownMoisture,
    targetCn,
    dryMatterLoss,
    cycleWeeks,
  ];
  if (numbers.some((value) => !isNum(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (kitchenWasteKgPerWeek <= 0) {
    return { error: "Enter how many kilograms of kitchen waste you produce in a week." };
  }
  if (kitchenWasteKgPerWeek > MAX_WEEKLY_KG) {
    return { error: `${MAX_WEEKLY_KG} kg a week is beyond a household — check the figure.` };
  }
  if (greenMoisture < 0 || greenMoisture >= 1 || brownMoisture < 0 || brownMoisture >= 1) {
    return { error: "Moisture must be between 0% and 99% — nothing is entirely water." };
  }
  if (greenCn <= 0 || brownCn <= 0 || greenCn > MAX_CN || brownCn > MAX_CN) {
    return { error: `C:N ratios should be between 0 and ${MAX_CN}.` };
  }
  if (targetCn < 10 || targetCn > 60) {
    return { error: "A workable target C:N ratio is between 10 and 60; 25 to 30 is ideal." };
  }
  if (brownCn <= targetCn) {
    return {
      error: `That brown material has a C:N of ${brownCn}, which is not carbon-rich enough to lift the mix to ${targetCn}:1. Pick a drier, woodier material.`,
    };
  }
  if (dryMatterLoss <= 0 || dryMatterLoss >= 1) {
    return { error: "Dry-matter loss must be between 1% and 99%." };
  }
  if (cycleWeeks <= 0 || cycleWeeks > 104) {
    return { error: "A composting cycle should be between 1 and 104 weeks." };
  }

  const greenWetPerWeek = kitchenWasteKgPerWeek;
  const greenDryPerWeek = greenWetPerWeek * (1 - greenMoisture);

  if (greenDryPerWeek <= 0) {
    return { error: "With that moisture level there is no dry matter left to compost." };
  }

  const brownsRatio = brownsPerDryGreen({ greenCn, brownCn, targetCn });
  if (brownsRatio === null) {
    return { error: "That combination cannot reach the target C:N ratio." };
  }

  const brownDryPerWeek = greenDryPerWeek * brownsRatio;
  const brownWetPerWeek = brownDryPerWeek / (1 - brownMoisture);

  const totalWetPerWeek = greenWetPerWeek + brownWetPerWeek;
  const totalDryPerWeek = greenDryPerWeek + brownDryPerWeek;
  const waterInPerWeek = totalWetPerWeek - totalDryPerWeek;
  const startingMoisturePct = (waterInPerWeek / totalWetPerWeek) * 100;

  // Actual starting C:N of the blended mix, as a check on the balancing.
  const carbonPerWeek = totalDryPerWeek * CARBON_FRACTION_OF_DRY_MATTER;
  const nitrogenPerWeek =
    (greenDryPerWeek * CARBON_FRACTION_OF_DRY_MATTER) / greenCn +
    (brownDryPerWeek * CARBON_FRACTION_OF_DRY_MATTER) / brownCn;
  const actualStartingCn = nitrogenPerWeek > 0 ? carbonPerWeek / nitrogenPerWeek : null;

  const finishedDryPerWeek = totalDryPerWeek * (1 - dryMatterLoss);
  const finishedWetPerWeek = finishedDryPerWeek / (1 - FINISHED_COMPOST_MOISTURE);
  const massLostPerWeek = totalWetPerWeek - finishedWetPerWeek;
  const yieldPct = (finishedWetPerWeek / totalWetPerWeek) * 100;

  const finishedNitrogenPerWeek = nitrogenPerWeek * NITROGEN_RETENTION;
  const nitrogenPctOfDryCompost =
    finishedDryPerWeek > 0 ? (finishedNitrogenPerWeek / finishedDryPerWeek) * 100 : 0;
  const finishedCn =
    finishedNitrogenPerWeek > 0
      ? (finishedDryPerWeek * CARBON_FRACTION_OF_DRY_MATTER) / finishedNitrogenPerWeek
      : null;
  const ureaEquivalentPerYear =
    (finishedNitrogenPerWeek * WEEKS_PER_YEAR) / UREA_NITROGEN_FRACTION;

  const weeks = Math.round(cycleWeeks);
  const batchFeedstockKg = totalWetPerWeek * weeks;
  const binVolumeLitres =
    (batchFeedstockKg / FEEDSTOCK_BULK_DENSITY_KG_PER_M3) * LITRES_PER_M3;

  return {
    greenWetPerWeek,
    greenDryPerWeek,
    brownsRatio,
    brownDryPerWeek,
    brownWetPerWeek,
    totalWetPerWeek,
    totalDryPerWeek,
    startingMoisturePct,
    actualStartingCn,
    finishedWetPerWeek,
    finishedDryPerWeek,
    massLostPerWeek,
    yieldPct,

    kitchenWastePerYear: greenWetPerWeek * WEEKS_PER_YEAR,
    brownsPerYear: brownWetPerWeek * WEEKS_PER_YEAR,
    totalFeedstockPerYear: totalWetPerWeek * WEEKS_PER_YEAR,
    compostPerYear: finishedWetPerWeek * WEEKS_PER_YEAR,
    massLostPerYear: massLostPerWeek * WEEKS_PER_YEAR,

    nitrogenPerYear: finishedNitrogenPerWeek * WEEKS_PER_YEAR,
    nitrogenPctOfDryCompost,
    finishedCn,
    ureaEquivalentPerYear,

    cycleWeeks: weeks,
    batchFeedstockKg,
    batchCompostKg: finishedWetPerWeek * weeks,
    binVolumeLitres,
  };
}
