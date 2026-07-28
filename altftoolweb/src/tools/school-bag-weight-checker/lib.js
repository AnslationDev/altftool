/**
 * School bag weight checker.
 *
 * Two rules are applied together:
 *
 * 1. The percentage rule. India's School Bag Policy 2020 (Ministry of Education /
 *    NCERT) states that the weight of the school bag should not exceed 10% of the
 *    child's body weight. The American Occupational Therapy Association gives the
 *    same 10% figure, and paediatric guidance generally treats anything above
 *    15% of body weight as clearly excessive.
 *
 * 2. The absolute class-wise limits published in the School Bag Policy 2020,
 *    reproduced below. The policy also says pre-primary children should carry
 *    no school bag at all.
 *
 * Informational only — a bag inside these limits can still hurt if it is worn on
 * one shoulder or packed with the heaviest items away from the back.
 */

/** Bag should not exceed this share of body weight. */
export const PERCENT_LIMIT = 10;

/** Above this share, guidance treats the load as clearly excessive. */
export const PERCENT_CAUTION = 15;

/** Class-wise bag weight limits in kilograms, School Bag Policy 2020 (India). */
export const CLASS_LIMITS = [
  { key: "pre", label: "Pre-primary", minKg: 0, maxKg: 0, note: "The policy says pre-primary children should carry no school bag." },
  { key: "1-2", label: "Class I-II", minKg: 1.6, maxKg: 2.2 },
  { key: "3-5", label: "Class III-V", minKg: 1.7, maxKg: 2.5 },
  { key: "6-7", label: "Class VI-VII", minKg: 2.0, maxKg: 3.0 },
  { key: "8", label: "Class VIII", minKg: 2.5, maxKg: 4.0 },
  { key: "9-10", label: "Class IX-X", minKg: 2.5, maxKg: 4.5 },
  { key: "11-12", label: "Class XI-XII", minKg: 3.5, maxKg: 5.0 },
];

/** Typical weights of things that live in a school bag, in kilograms. */
export const ITEM_WEIGHTS = [
  { key: "textbook", label: "Hardback textbook", kg: 0.6 },
  { key: "notebook", label: "Ruled notebook", kg: 0.3 },
  { key: "bottle", label: "Full 750 ml water bottle", kg: 0.8 },
  { key: "lunch", label: "Steel lunch box with food", kg: 0.7 },
  { key: "laptop", label: "School laptop or tablet", kg: 1.4 },
  { key: "geometry", label: "Geometry box and stationery pouch", kg: 0.4 },
];

const MAX_BODY_KG = 150;
const MAX_BAG_KG = 40;

function round2(value) {
  return Math.round(value * 100) / 100;
}

export function classLimitFor(key) {
  return CLASS_LIMITS.find((row) => row.key === key) || null;
}

/**
 * Check one bag against both rules.
 *
 * @param {object} input
 * @param {number} input.bodyWeightKg child's body weight in kg
 * @param {number} input.bagWeightKg  loaded bag weight in kg
 * @param {string} input.classKey     one of CLASS_LIMITS[].key
 * @returns {object} assessment, or { error }
 */
export function checkSchoolBag({ bodyWeightKg, bagWeightKg, classKey } = {}) {
  const body = Number(bodyWeightKg);
  if (!Number.isFinite(body)) return { error: "Enter the child's body weight in kilograms." };
  if (body <= 0) return { error: "Body weight must be greater than zero." };
  if (body > MAX_BODY_KG) return { error: `Enter a body weight below ${MAX_BODY_KG} kg.` };

  const bag = Number(bagWeightKg);
  if (!Number.isFinite(bag)) return { error: "Enter the loaded bag weight in kilograms." };
  if (bag < 0) return { error: "Bag weight cannot be negative." };
  if (bag > MAX_BAG_KG) return { error: `Enter a bag weight below ${MAX_BAG_KG} kg.` };

  const classRow = classLimitFor(classKey);
  if (!classRow) return { error: "Choose the child's class group." };

  const percent = (bag / body) * 100;
  const percentSafeKg = (body * PERCENT_LIMIT) / 100;
  // The binding limit is whichever of the two rules is stricter.
  const effectiveLimitKg = Math.min(percentSafeKg, classRow.maxKg);
  // Rounded before use so binary floating point does not turn 1.2 into 1.2000000000000002.
  const excessKg = round2(Math.max(0, bag - effectiveLimitKg));

  let band;
  if (percent <= PERCENT_LIMIT && bag <= classRow.maxKg) {
    band = { code: "ok", label: "Within both limits", note: "The bag is inside the 10% body weight rule and inside the class-wise policy limit." };
  } else if (percent <= PERCENT_LIMIT) {
    band = {
      code: "over-policy",
      label: "Over the class-wise policy limit",
      note: `The bag is under 10% of body weight but heavier than the ${classRow.maxKg} kg ceiling the School Bag Policy 2020 sets for ${classRow.label}.`,
    };
  } else if (percent <= PERCENT_CAUTION) {
    band = {
      code: "over-percent",
      label: "Over the recommended 10%",
      note: `At ${round2(percent)}% of body weight the bag is above the recommended ${PERCENT_LIMIT}% limit, though still under the ${PERCENT_CAUTION}% level treated as clearly excessive.`,
    };
  } else {
    band = {
      code: "excessive",
      label: "Clearly too heavy",
      note: `At ${round2(percent)}% of body weight the bag is above the ${PERCENT_CAUTION}% level that guidance treats as excessive for a growing child.`,
    };
  }

  const removals = ITEM_WEIGHTS.map((item) => ({
    ...item,
    // 1e-9 tolerance so an exact multiple does not round up one extra item.
    countToRemove: excessKg > 0 ? Math.ceil(excessKg / item.kg - 1e-9) : 0,
  }));

  return {
    bodyWeightKg: round2(body),
    bagWeightKg: round2(bag),
    classRow,
    percent: round2(percent),
    // Position on a gauge whose full width is the PERCENT_CAUTION level.
    gaugePercent: Math.max(0, Math.min(100, round2((percent / PERCENT_CAUTION) * 100))),
    percentLimit: PERCENT_LIMIT,
    percentCaution: PERCENT_CAUTION,
    percentSafeKg: round2(percentSafeKg),
    policyMaxKg: classRow.maxKg,
    policyMinKg: classRow.minKg,
    effectiveLimitKg: round2(effectiveLimitKg),
    excessKg,
    headroomKg: round2(Math.max(0, effectiveLimitKg - bag)),
    band,
    removals,
  };
}
