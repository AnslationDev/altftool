/**
 * Protein and energy from a serving of dal.
 *
 * Everything is calculated from the raw (uncooked) weight of dal, because a
 * katori of cooked dal can hold anywhere from 15 g to 40 g of raw dal depending
 * on how thin it is made. Composition figures are the typical values published
 * for Indian pulses in national food composition tables, per 100 g raw.
 *
 * Protein targets use the ICMR-NIN recommendation for Indian adults of about
 * 0.83 g of protein per kg of body weight per day for a healthy sedentary
 * adult; higher intakes of roughly 1.0-1.2 g/kg are commonly advised for older
 * adults and people training hard. Informational only, not a prescription.
 */

/** Per 100 g of raw, dry dal. */
export const DALS = [
  { id: "toor", name: "Toor / arhar dal", proteinG: 22.3, energyKcal: 335, carbG: 57.6, fatG: 1.7, fibreG: 15.5 },
  { id: "moong-dhuli", name: "Moong dal (split, skinned)", proteinG: 24.5, energyKcal: 348, carbG: 59.9, fatG: 1.2, fibreG: 8.2 },
  { id: "moong-whole", name: "Whole green moong", proteinG: 24.0, energyKcal: 334, carbG: 56.7, fatG: 1.2, fibreG: 16.3 },
  { id: "masoor", name: "Masoor dal (red lentil)", proteinG: 25.1, energyKcal: 343, carbG: 59.0, fatG: 0.7, fibreG: 10.8 },
  { id: "chana", name: "Chana dal (split bengal gram)", proteinG: 20.8, energyKcal: 372, carbG: 59.8, fatG: 5.6, fibreG: 15.1 },
  { id: "urad", name: "Urad dal (black gram)", proteinG: 24.0, energyKcal: 347, carbG: 59.6, fatG: 1.4, fibreG: 12.3 },
  { id: "rajma", name: "Rajma (kidney beans)", proteinG: 22.9, energyKcal: 346, carbG: 60.6, fatG: 1.3, fibreG: 15.5 },
  { id: "kabuli", name: "Kabuli chana (chickpeas)", proteinG: 17.1, energyKcal: 360, carbG: 60.9, fatG: 5.3, fibreG: 15.8 },
  { id: "lobia", name: "Lobia (cowpea)", proteinG: 24.1, energyKcal: 323, carbG: 54.5, fatG: 1.0, fibreG: 15.0 },
  { id: "matar", name: "Dried green peas", proteinG: 19.7, energyKcal: 315, carbG: 56.5, fatG: 1.1, fibreG: 16.0 },
];

/** Per 100 g of cooking oil used for the tadka. */
export const OIL_PER_100G = { energyKcal: 900, fatG: 100 };

/** How much raw dal a katori of cooked dal typically holds, in grams. */
export const CONSISTENCIES = [
  { id: "thin", label: "Thin, pourable dal", rawGramsPerKatori: 15 },
  { id: "regular", label: "Everyday dal", rawGramsPerKatori: 25 },
  { id: "thick", label: "Thick dal (dal makhani style)", rawGramsPerKatori: 40 },
];

/** ICMR-NIN protein recommendation for a healthy sedentary Indian adult, g per kg per day. */
export const RDA_G_PER_KG = 0.83;
/** Commonly advised range for older adults and hard training, g per kg per day. */
export const HIGHER_TARGET_G_PER_KG = 1.2;

export const MIN_WEIGHT_KG = 20;
export const MAX_WEIGHT_KG = 250;
export const MAX_KATORIS = 12;
export const MAX_RAW_PER_KATORI_G = 120;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Look up a dal by id. */
export function getDal(id) {
  return DALS.find((dal) => dal.id === id) || null;
}

/**
 * Average composition of a mixed (panchmel) dal made from several pulses in equal parts.
 * @param {string[]} ids
 * @returns {object|null}
 */
export function mixDals(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return null;
  const parts = ids.map(getDal).filter(Boolean);
  if (parts.length === 0) return null;
  const mean = (key) => parts.reduce((sum, dal) => sum + dal[key], 0) / parts.length;
  return {
    id: "mixed",
    name: `Mixed dal (${parts.map((dal) => dal.name.split(" ")[0]).join(", ")})`,
    proteinG: mean("proteinG"),
    energyKcal: mean("energyKcal"),
    carbG: mean("carbG"),
    fatG: mean("fatG"),
    fibreG: mean("fibreG"),
  };
}

/**
 * Protein, energy and target share for a dal serving.
 *
 * @param {object} input
 * @param {string} [input.dalId]           A single dal.
 * @param {string[]} [input.mixIds]        Or several, for a mixed dal.
 * @param {number} input.katoris
 * @param {number} input.rawGramsPerKatori
 * @param {number} [input.tadkaOilG]       Oil or ghee added to the whole pot.
 * @param {number} [input.bodyWeightKg]    For the daily target comparison.
 * @returns {object} result or { error }
 */
export function computeDalServing({
  dalId,
  mixIds,
  katoris,
  rawGramsPerKatori,
  tadkaOilG = 0,
  bodyWeightKg,
} = {}) {
  const dal = Array.isArray(mixIds) && mixIds.length > 0 ? mixDals(mixIds) : getDal(dalId);
  if (!dal) return { error: "Choose which dal you are eating." };

  if (!isNum(katoris) || !isNum(rawGramsPerKatori) || !isNum(tadkaOilG)) {
    return { error: "Katoris, dal per katori and oil must all be numbers." };
  }
  if (katoris <= 0) return { error: "Enter at least a part of a katori." };
  if (katoris > MAX_KATORIS) return { error: `More than ${MAX_KATORIS} katoris is beyond this calculator.` };
  if (rawGramsPerKatori <= 0) return { error: "Raw dal per katori must be greater than zero grams." };
  if (rawGramsPerKatori > MAX_RAW_PER_KATORI_G) {
    return { error: `${MAX_RAW_PER_KATORI_G} g of raw dal in one katori would not fit once cooked.` };
  }
  if (tadkaOilG < 0) return { error: "Tadka oil cannot be negative." };
  if (tadkaOilG > 100) return { error: "More than 100 g of oil in the tadka is outside this estimate." };

  const rawG = katoris * rawGramsPerKatori;
  const proteinG = (dal.proteinG * rawG) / 100;
  const carbG = (dal.carbG * rawG) / 100;
  const fibreG = (dal.fibreG * rawG) / 100;
  const dalFatG = (dal.fatG * rawG) / 100;
  const oilFatG = (OIL_PER_100G.fatG * tadkaOilG) / 100;
  const energyKcal = (dal.energyKcal * rawG) / 100 + (OIL_PER_100G.energyKcal * tadkaOilG) / 100;

  const result = {
    dal,
    katoris,
    rawG,
    rawGramsPerKatori,
    proteinG,
    proteinPerKatoriG: proteinG / katoris,
    carbG,
    fibreG,
    fatG: dalFatG + oilFatG,
    tadkaOilG,
    energyKcal,
    energyPerKatoriKcal: energyKcal / katoris,
    proteinPer100Kcal: energyKcal > 0 ? (proteinG / energyKcal) * 100 : 0,
  };

  if (isNum(bodyWeightKg)) {
    if (bodyWeightKg < MIN_WEIGHT_KG || bodyWeightKg > MAX_WEIGHT_KG) {
      return { error: `Body weight should be between ${MIN_WEIGHT_KG} kg and ${MAX_WEIGHT_KG} kg.` };
    }
    const rdaG = bodyWeightKg * RDA_G_PER_KG;
    const higherG = bodyWeightKg * HIGHER_TARGET_G_PER_KG;
    result.bodyWeightKg = bodyWeightKg;
    result.rdaG = rdaG;
    result.higherTargetG = higherG;
    result.rdaPercent = rdaG > 0 ? (proteinG / rdaG) * 100 : 0;
    result.higherTargetPercent = higherG > 0 ? (proteinG / higherG) * 100 : 0;
    result.rdaRemainingG = Math.max(0, rdaG - proteinG);
  }

  return result;
}

/**
 * Protein per katori for every dal at the same consistency — for comparison.
 * @param {number} rawGramsPerKatori
 * @returns {Array} rows, or [] if the input is unusable.
 */
export function compareDals(rawGramsPerKatori) {
  if (!isNum(rawGramsPerKatori) || rawGramsPerKatori <= 0) return [];
  return DALS.map((dal) => ({
    dal,
    proteinPerKatoriG: (dal.proteinG * rawGramsPerKatori) / 100,
    energyPerKatoriKcal: (dal.energyKcal * rawGramsPerKatori) / 100,
  })).sort((a, b) => b.proteinPerKatoriG - a.proteinPerKatoriG);
}
