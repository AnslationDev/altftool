/**
 * Whey scoop protein calculator — pure logic.
 *
 * Everything here is arithmetic on the nutrition panel of the tub:
 *   protein purity (%)   = protein per scoop / scoop weight x 100
 *   scoops per tub       = tub weight / scoop weight
 *   protein per tub      = tub weight x purity
 *   cost per g protein   = tub price / protein per tub
 *   cost per 25 g serving = cost per g protein x 25
 *
 * Energy uses the Atwater general factors (4 kcal/g protein, 4 kcal/g
 * carbohydrate, 9 kcal/g fat) used on nutrition labels worldwide.
 */

export const KCAL_PER_G_PROTEIN = 4;
export const KCAL_PER_G_CARB = 4;
export const KCAL_PER_G_FAT = 9;

/**
 * Standard comparison serving. 25 g of protein sits inside the 20-40 g
 * per-feeding band from the ISSN protein position stand, so it is a fair unit
 * for comparing tubs of different scoop sizes.
 */
export const REFERENCE_PROTEIN_SERVING_G = 25;

/**
 * Typical protein content by whey grade, percent by weight of the powder.
 * WPC80 concentrate is nominally 80% protein; whey protein isolate is
 * specified at 90% or higher on most manufacturer spec sheets.
 */
export const PURITY_BANDS = [
  {
    id: "isolate",
    label: "Isolate grade",
    min: 85,
    note: "Whey protein isolate is specified at roughly 90% protein by weight.",
  },
  {
    id: "concentrate",
    label: "Concentrate grade",
    min: 68,
    note: "Whey protein concentrate typically runs 70-80% protein by weight.",
  },
  {
    id: "blend",
    label: "Blend or gainer",
    min: 45,
    note: "Below concentrate grade — usually a blend with added carbohydrate.",
  },
  {
    id: "low",
    label: "Mostly non-protein",
    min: 0,
    note: "Less than 45% protein. Check the panel for added sugars, creamers or fillers.",
  },
];

export function purityBand(purityPct) {
  return PURITY_BANDS.find((band) => purityPct >= band.min) || PURITY_BANDS[PURITY_BANDS.length - 1];
}

const round1 = (value) => Math.round(value * 10) / 10;
const round2 = (value) => Math.round(value * 100) / 100;

/**
 * @param {object} input
 * @param {number} input.tubGrams - net weight of the tub in grams
 * @param {number} input.tubPrice - what you paid, in any single currency
 * @param {number} input.scoopGrams - scoop weight from the label
 * @param {number} input.proteinPerScoopG - protein per scoop from the label
 * @param {number} [input.carbPerScoopG]
 * @param {number} [input.fatPerScoopG]
 * @param {number} [input.targetProteinG] - protein you want in one shake
 * @param {number} [input.scoopsPerDay] - to work out how long a tub lasts
 * @returns {object|{error: string}}
 */
export function computeWheyValue({
  tubGrams,
  tubPrice = 0,
  scoopGrams,
  proteinPerScoopG,
  carbPerScoopG = 0,
  fatPerScoopG = 0,
  targetProteinG = REFERENCE_PROTEIN_SERVING_G,
  scoopsPerDay = 1,
}) {
  const tub = Number(tubGrams);
  if (!Number.isFinite(tub) || tub <= 0) {
    return { error: "Enter the net tub weight in grams." };
  }
  if (tub > 20000) return { error: "Tub weight should be 20000 g or less." };

  const price = Number(tubPrice);
  if (!Number.isFinite(price) || price < 0) {
    return { error: "Tub price cannot be negative." };
  }

  const scoop = Number(scoopGrams);
  if (!Number.isFinite(scoop) || scoop <= 0) {
    return { error: "Enter the scoop weight in grams, from the label." };
  }
  if (scoop > tub) return { error: "A scoop cannot weigh more than the whole tub." };

  const proteinPerScoop = Number(proteinPerScoopG);
  if (!Number.isFinite(proteinPerScoop) || proteinPerScoop <= 0) {
    return { error: "Enter the grams of protein per scoop, from the label." };
  }
  if (proteinPerScoop > scoop) {
    return { error: "Protein per scoop cannot exceed the scoop weight — check the label." };
  }

  const carb = Number(carbPerScoopG);
  const fat = Number(fatPerScoopG);
  if (!Number.isFinite(carb) || carb < 0 || !Number.isFinite(fat) || fat < 0) {
    return { error: "Carbohydrate and fat per scoop cannot be negative." };
  }
  if (proteinPerScoop + carb + fat > scoop + 0.001) {
    return { error: "Protein, carbs and fat add up to more than the scoop weighs — check the label." };
  }

  const target = Number(targetProteinG);
  if (!Number.isFinite(target) || target <= 0 || target > 200) {
    return { error: "Target protein per shake should be between 1 g and 200 g." };
  }

  const perDay = Number(scoopsPerDay);
  if (!Number.isFinite(perDay) || perDay <= 0 || perDay > 20) {
    return { error: "Scoops per day should be between 1 and 20." };
  }

  const purityPct = round1((proteinPerScoop / scoop) * 100);
  const band = purityBand(purityPct);

  const scoopsPerTub = round1(tub / scoop);
  const proteinPerTubG = round1(tub * (proteinPerScoop / scoop));

  const kcalPerScoop = Math.round(
    proteinPerScoop * KCAL_PER_G_PROTEIN + carb * KCAL_PER_G_CARB + fat * KCAL_PER_G_FAT,
  );
  const proteinKcalPct =
    kcalPerScoop > 0
      ? Math.round(((proteinPerScoop * KCAL_PER_G_PROTEIN) / kcalPerScoop) * 100)
      : 0;
  const otherGramsPerScoop = round1(scoop - proteinPerScoop);

  const scoopsForTarget = round2(target / proteinPerScoop);
  const powderForTargetG = round1(scoopsForTarget * scoop);
  const kcalForTarget = Math.round(scoopsForTarget * kcalPerScoop);

  const hasPrice = price > 0;
  const costPerGramProtein = hasPrice ? price / proteinPerTubG : null;
  const costPerScoop = hasPrice ? round2(price / (tub / scoop)) : null;
  const costPerReferenceServing = hasPrice
    ? round2(costPerGramProtein * REFERENCE_PROTEIN_SERVING_G)
    : null;
  const costPerTargetShake = hasPrice ? round2(costPerGramProtein * target) : null;

  const daysPerTub = Math.floor(tub / (scoop * perDay));
  const costPerDay = hasPrice ? round2((price / (tub / scoop)) * perDay) : null;

  return {
    tubGrams: tub,
    tubPrice: price,
    hasPrice,
    scoopGrams: scoop,
    proteinPerScoopG: round1(proteinPerScoop),
    carbPerScoopG: round1(carb),
    fatPerScoopG: round1(fat),
    otherGramsPerScoop,
    purityPct,
    purityLabel: band.label,
    purityNote: band.note,
    scoopsPerTub,
    proteinPerTubG,
    kcalPerScoop,
    proteinKcalPct,
    targetProteinG: target,
    scoopsForTarget,
    powderForTargetG,
    kcalForTarget,
    costPerScoop,
    costPerGramProtein: hasPrice ? round2(costPerGramProtein) : null,
    costPerReferenceServing,
    costPerTargetShake,
    referenceServingG: REFERENCE_PROTEIN_SERVING_G,
    scoopsPerDay: perDay,
    daysPerTub,
    costPerDay,
  };
}
