/**
 * Menstrual cup sizing guidance.
 *
 * The rules below are the sizing convention published, in near-identical form,
 * by most cup manufacturers. They are general guidance, not a medical
 * assessment, and no cup brand is assumed.
 *
 * DIAMETER / SIZE
 *   Small (often sold as size 1) is generally suggested under 30 with no
 *   vaginal birth. Large (size 2) is generally suggested from 30 onwards, or
 *   after a vaginal birth at any age, because vaginal muscle tone changes with
 *   both. A caesarean birth is normally treated as "no vaginal birth" for
 *   sizing, so age decides.
 *
 * LENGTH
 *   Cup length has to fit under the cervix, so it is set by cervix height,
 *   measured with a clean finger during your period:
 *     reachable at the first knuckle .... low, roughly under 45 mm
 *     second knuckle .................... average, roughly 45-55 mm
 *     barely reachable or out of reach .. high, roughly over 55 mm
 *
 * FIRMNESS
 *   Firmer cups spring open more readily and resist being compressed by a
 *   strong pelvic floor; softer cups are usually preferred when there is
 *   bladder pressure or general sensitivity.
 */

/** Age at which most brands switch their default suggestion to the larger size. */
export const SIZE_AGE_THRESHOLD = 30;

/** Cervix height bands in millimetres, measured from the vaginal opening. */
export const CERVIX_BANDS = [
  {
    id: "low",
    label: "Low cervix",
    maxMm: 44.9,
    fingerCue: "You reach it at about the first knuckle.",
    lengthAdvice: "A short cup, roughly 45 mm or less in body length, or a stemless design.",
    maxCupLengthMm: 45,
  },
  {
    id: "average",
    label: "Average cervix height",
    maxMm: 55,
    fingerCue: "You reach it at about the second knuckle.",
    lengthAdvice: "A standard cup, roughly 55 to 70 mm in total length including the stem.",
    maxCupLengthMm: 70,
  },
  {
    id: "high",
    label: "High cervix",
    maxMm: Infinity,
    fingerCue: "You can barely reach it, or cannot reach it at all.",
    lengthAdvice: "A longer cup, roughly 70 to 80 mm in total length, or one with a long stem you can trim later.",
    maxCupLengthMm: 80,
  },
];

/** Quick selector for people who have not measured in millimetres. */
export const KNUCKLE_OPTIONS = [
  { id: "first", label: "First knuckle — I reach it easily", approxMm: 40 },
  { id: "second", label: "Second knuckle — about halfway in", approxMm: 50 },
  { id: "third", label: "Third knuckle or cannot reach", approxMm: 65 },
];

/** Pelvic floor descriptions used for the firmness suggestion. */
export const PELVIC_FLOOR_OPTIONS = [
  {
    id: "strong",
    label: "Strong — I do a lot of running, lifting or pelvic floor work",
    firmness: "Firmer",
    reason: "A strong pelvic floor can compress a soft cup and break its seal.",
  },
  {
    id: "average",
    label: "Average — no particular issues",
    firmness: "Medium",
    reason: "A medium firmness opens reliably without feeling rigid.",
  },
  {
    id: "sensitive",
    label: "Sensitive — I notice bladder pressure or discomfort easily",
    firmness: "Softer",
    reason: "A softer cup presses less against the bladder and urethra.",
  },
];

/** Typical usable capacity ranges by size, millilitres. */
export const CAPACITY_ML = { small: { min: 20, max: 30 }, large: { min: 25, max: 40 } };

/** A cup should be emptied at least this often (standard cup labelling). */
export const CUP_MAX_WEAR_HOURS = 12;

/** Total blood loss reference (mL per cycle) used for the heavy-flow note. */
export const BLOOD_LOSS_REFERENCE = { typicalMinMl: 30, typicalMaxMl: 40, heavyThresholdMl: 80 };

export const LIMITS = {
  age: { min: 9, max: 65 },
  cervixMm: { min: 20, max: 100 },
};

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** The cervix band a measurement in millimetres falls into. */
export function cervixBand(cervixMm) {
  if (!isNum(cervixMm)) return null;
  return CERVIX_BANDS.find((band) => cervixMm <= band.maxMm) || CERVIX_BANDS[CERVIX_BANDS.length - 1];
}

/**
 * Produce cup sizing guidance.
 * @returns {{error:string}|object} plain result object.
 */
export function findCupSize({
  age,
  vaginalBirth = false,
  cervixMm,
  pelvicFloor = "average",
  heavyFlow = false,
  hasIud = false,
} = {}) {
  if (!isNum(age)) return { error: "Enter your age." };
  if (age < LIMITS.age.min || age > LIMITS.age.max) {
    return { error: `Age should be between ${LIMITS.age.min} and ${LIMITS.age.max}.` };
  }
  if (!isNum(cervixMm)) return { error: "Enter a cervix height, or pick the knuckle that matches." };
  if (cervixMm < LIMITS.cervixMm.min || cervixMm > LIMITS.cervixMm.max) {
    return {
      error: `Cervix height should be between ${LIMITS.cervixMm.min} and ${LIMITS.cervixMm.max} mm — measure with a clean finger during your period.`,
    };
  }

  const band = cervixBand(cervixMm);
  const floor =
    PELVIC_FLOOR_OPTIONS.find((item) => item.id === pelvicFloor) || PELVIC_FLOOR_OPTIONS[1];

  const olderThanThreshold = age >= SIZE_AGE_THRESHOLD;
  const sizeId = olderThanThreshold || vaginalBirth ? "large" : "small";
  const sizeLabel = sizeId === "large" ? "Large (often sold as size 2)" : "Small (often sold as size 1)";

  let sizeReason;
  if (vaginalBirth && olderThanThreshold) {
    sizeReason = `You are ${SIZE_AGE_THRESHOLD} or over and have given birth vaginally, and both point to the larger diameter.`;
  } else if (vaginalBirth) {
    sizeReason = "A vaginal birth is the main reason brands suggest the larger diameter, whatever your age.";
  } else if (olderThanThreshold) {
    sizeReason = `Most brands switch their default suggestion to the larger size from age ${SIZE_AGE_THRESHOLD}.`;
  } else {
    sizeReason = `Under ${SIZE_AGE_THRESHOLD} with no vaginal birth, the smaller diameter is the usual starting point.`;
  }

  const capacity = CAPACITY_ML[sizeId];

  const notes = [];
  if (heavyFlow) {
    notes.push(
      `On a heavy flow (total blood loss above about ${BLOOD_LOSS_REFERENCE.heavyThresholdMl} mL a cycle is generally considered heavy), look for a high-capacity cup within your size — a ${capacity.min}-${capacity.max} mL cup still needs emptying every ${CUP_MAX_WEAR_HOURS} hours at most.`,
    );
  }
  if (hasIud) {
    notes.push(
      "If you have an IUD, check with the clinician who fitted it before using a cup, and always break the seal fully before removing it so the strings are not pulled.",
    );
  }
  if (band.id === "low") {
    notes.push("With a low cervix, a cup that sits too high will feel like it is being pushed out — length matters more than diameter here.");
  }
  if (band.id === "high") {
    notes.push("With a high cervix, a short cup can be hard to reach at removal; a long stem you can trim later is easier to start with.");
  }
  if (age < 18) {
    notes.push(
      sizeId === "small"
        ? "If you are new to internal products, a small, soft cup is the usual starting point, and a parent, pharmacist or clinician can help you choose."
        : "Being under 18 does not change the larger diameter suggested above if you have had a vaginal birth — a soft, flexible cup in that size is still the usual starting point, and a parent, pharmacist or clinician can help you choose.",
    );
  }

  return {
    sizeId,
    sizeLabel,
    sizeReason,
    bandId: band.id,
    bandLabel: band.label,
    fingerCue: band.fingerCue,
    lengthAdvice: band.lengthAdvice,
    maxCupLengthMm: band.maxCupLengthMm,
    cervixMm,
    firmness: floor.firmness,
    firmnessReason: floor.reason,
    capacityMinMl: capacity.min,
    capacityMaxMl: capacity.max,
    maxWearHours: CUP_MAX_WEAR_HOURS,
    notes,
  };
}
