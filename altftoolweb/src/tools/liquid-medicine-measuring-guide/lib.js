/**
 * Liquid medicine dose-to-volume maths.
 *
 * The arithmetic is a single proportion:
 *
 *     volume (mL) = prescribed dose (mg) / concentration (mg per mL)
 *
 * and a suspension labelled "125 mg / 5 mL" has a concentration of
 * 125 / 5 = 25 mg per mL.
 *
 * The measuring rules come from medicines-safety guidance:
 *  - A metric teaspoon is 5 mL and a tablespoon is 15 mL by definition, but
 *    household spoons have been measured anywhere from about 2.5 mL to 7 mL,
 *    which is why the FDA, ISMP and the American Academy of Pediatrics all
 *    say to dose oral liquids in millilitres with a syringe or dosing cup and
 *    never with a kitchen spoon.
 *  - Choose the smallest device that holds the whole dose in one draw. A dose
 *    measured in a syringe far larger than itself has a much bigger relative
 *    error, so ISMP advises against measuring a volume smaller than about
 *    40% of the syringe's capacity where a smaller syringe exists.
 *  - You can only measure to the nearest printed graduation, so the delivered
 *    dose is the rounded volume multiplied back by the concentration.
 *
 * Everything here is pure arithmetic on numbers the caller supplies.
 */

/** Metric definitions used on medicine spoons and dosing cups. */
export const TEASPOON_ML = 5;
export const TABLESPOON_ML = 15;

/** Measured spread of real household teaspoons, millilitres — why they are unsafe. */
export const HOUSEHOLD_TEASPOON_RANGE = { min: 2.5, max: 7.3 };

/**
 * Typical oral syringes and the smallest interval printed on the barrel.
 * Graduations vary by brand — the tool states its assumption so it can be checked.
 */
export const ORAL_SYRINGES = [
  { capacityMl: 1, stepMl: 0.05, label: "1 mL oral syringe" },
  { capacityMl: 3, stepMl: 0.1, label: "3 mL oral syringe" },
  { capacityMl: 5, stepMl: 0.2, label: "5 mL oral syringe" },
  { capacityMl: 10, stepMl: 0.2, label: "10 mL oral syringe" },
];

/** Below this fraction of a syringe's capacity, a smaller syringe is preferred. */
export const MIN_FILL_FRACTION = 0.4;

/** Sanity limits so a typo cannot produce a plausible-looking dose. */
export const LIMITS = {
  doseMg: { min: 0.01, max: 20000 },
  concentrationMgPerMl: { min: 0.01, max: 2000 },
  volumeMl: { min: 0.05, max: 500 },
  dosesPerDay: { min: 1, max: 6 },
  bottleMl: { min: 5, max: 1000 },
  weightKg: { min: 1, max: 200 },
};

export const CONCENTRATION_UNITS = {
  per5ml: { key: "per5ml", label: "mg per 5 mL", perMl: (value) => value / 5 },
  perMl: { key: "perMl", label: "mg per mL", perMl: (value) => value },
};

const round = (value, dp = 2) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

/** Round a volume to the nearest printed graduation on a syringe. */
export function roundToStep(volumeMl, stepMl) {
  if (!Number.isFinite(volumeMl) || !Number.isFinite(stepMl) || stepMl <= 0) return null;
  // Work in whole steps to avoid binary floating point drift on values like 0.15.
  const steps = Math.round(volumeMl / stepMl);
  return round(steps * stepMl, 4);
}

/** Smallest listed syringe that holds the whole volume in one draw, or null. */
export function pickSyringe(volumeMl) {
  if (!Number.isFinite(volumeMl) || volumeMl <= 0) return null;
  return ORAL_SYRINGES.find((syringe) => volumeMl <= syringe.capacityMl + 1e-9) ?? null;
}

/**
 * Work out the volume to measure and how to measure it.
 *
 * @param {object} input
 * @param {number} [input.doseMg]        Prescribed dose in milligrams (omit if dosing in mL).
 * @param {number} [input.volumeMlDirect] Prescribed dose already in mL (omit if dosing in mg).
 * @param {number} input.concentrationValue Number printed on the bottle.
 * @param {"per5ml"|"perMl"} input.concentrationUnit  What that number means.
 * @param {number} [input.dosesPerDay]   For the daily totals.
 * @param {number} [input.bottleMl]      Bottle size, for days-of-supply.
 * @param {number} [input.weightKg]      Optional, to show mg per kg.
 * @returns {object} measuring plan, or { error }.
 */
export function planLiquidDose({
  doseMg,
  volumeMlDirect,
  concentrationValue,
  concentrationUnit = "per5ml",
  dosesPerDay = 3,
  bottleMl,
  weightKg,
}) {
  const unit = CONCENTRATION_UNITS[concentrationUnit];
  if (!unit) return { error: "Choose whether the strength is per 5 mL or per mL." };
  if (!Number.isFinite(concentrationValue) || concentrationValue <= 0) {
    return { error: "Enter the strength printed on the bottle, for example 125 mg per 5 mL." };
  }

  const mgPerMl = unit.perMl(concentrationValue);
  if (
    !Number.isFinite(mgPerMl) ||
    mgPerMl < LIMITS.concentrationMgPerMl.min ||
    mgPerMl > LIMITS.concentrationMgPerMl.max
  ) {
    return {
      error: `That works out to ${round(mgPerMl, 3)} mg per mL, outside the ${LIMITS.concentrationMgPerMl.min}-${LIMITS.concentrationMgPerMl.max} mg/mL range this guide handles.`,
    };
  }

  let volumeMl;
  let prescribedMg;

  if (Number.isFinite(volumeMlDirect)) {
    if (volumeMlDirect <= 0) return { error: "The dose volume must be greater than zero." };
    if (volumeMlDirect > LIMITS.volumeMl.max) {
      return { error: `A single oral dose above ${LIMITS.volumeMl.max} mL is outside this guide.` };
    }
    volumeMl = volumeMlDirect;
    prescribedMg = volumeMl * mgPerMl;
  } else {
    if (!Number.isFinite(doseMg)) return { error: "Enter the prescribed dose." };
    if (doseMg <= 0) return { error: "The prescribed dose must be greater than zero." };
    if (doseMg < LIMITS.doseMg.min || doseMg > LIMITS.doseMg.max) {
      return {
        error: `The dose must be between ${LIMITS.doseMg.min} mg and ${LIMITS.doseMg.max} mg.`,
      };
    }
    prescribedMg = doseMg;
    volumeMl = doseMg / mgPerMl;
  }

  if (!Number.isFinite(volumeMl) || volumeMl <= 0) {
    return { error: "That dose and strength do not produce a measurable volume." };
  }
  if (volumeMl < LIMITS.volumeMl.min) {
    return {
      error: `That dose is only ${round(volumeMl, 3)} mL — smaller than the finest ${LIMITS.volumeMl.min} mL marking on an oral syringe. Ask the pharmacist for a more dilute strength.`,
    };
  }
  if (volumeMl > LIMITS.volumeMl.max) {
    return { error: `That dose is ${round(volumeMl, 1)} mL, beyond the range of this guide.` };
  }

  const largest = ORAL_SYRINGES[ORAL_SYRINGES.length - 1];
  const syringe = pickSyringe(volumeMl) ?? largest;
  const singleDraw = volumeMl <= syringe.capacityMl + 1e-9;
  const drawCount = singleDraw ? 1 : Math.ceil(volumeMl / largest.capacityMl);

  const measuredMl = roundToStep(volumeMl, syringe.stepMl);
  const deliveredMg = measuredMl * mgPerMl;
  const accuracyPct = prescribedMg > 0 ? ((deliveredMg - prescribedMg) / prescribedMg) * 100 : 0;

  const fillFraction = volumeMl / syringe.capacityMl;
  const smallerExists = ORAL_SYRINGES.some((s) => s.capacityMl < syringe.capacityMl);

  const notes = [];
  if (singleDraw && smallerExists && fillFraction < MIN_FILL_FRACTION) {
    notes.push(
      `This dose fills only ${Math.round(fillFraction * 100)}% of a ${syringe.capacityMl} mL syringe. A smaller syringe would measure it more accurately.`,
    );
  }
  if (!singleDraw) {
    notes.push(
      `${round(volumeMl, 2)} mL needs ${drawCount} draws of a ${largest.capacityMl} mL syringe. Count them out loud so a draw is not missed or repeated.`,
    );
  }
  if (Math.abs(accuracyPct) >= 5) {
    notes.push(
      `Rounding to the nearest ${syringe.stepMl} mL marking changes the dose by ${round(accuracyPct, 1)}%. Check with the pharmacist whether to round up or down.`,
    );
  }
  notes.push(
    `Never use a kitchen spoon: real household teaspoons have been measured from ${HOUSEHOLD_TEASPOON_RANGE.min} mL to ${HOUSEHOLD_TEASPOON_RANGE.max} mL against the 5 mL a medicine spoon means.`,
  );

  const perDay =
    Number.isFinite(dosesPerDay) && dosesPerDay >= LIMITS.dosesPerDay.min && dosesPerDay <= LIMITS.dosesPerDay.max
      ? { doses: dosesPerDay, volumeMl: volumeMl * dosesPerDay, mg: prescribedMg * dosesPerDay }
      : null;

  let supply = null;
  if (Number.isFinite(bottleMl) && bottleMl > 0) {
    if (bottleMl < LIMITS.bottleMl.min || bottleMl > LIMITS.bottleMl.max) {
      return {
        error: `Bottle size must be between ${LIMITS.bottleMl.min} mL and ${LIMITS.bottleMl.max} mL.`,
      };
    }
    const dosesInBottle = Math.floor(bottleMl / measuredMl);
    supply = {
      bottleMl,
      dosesInBottle,
      daysOfSupply: perDay ? Math.floor(dosesInBottle / perDay.doses) : null,
      leftoverMl: round(bottleMl - dosesInBottle * measuredMl, 2),
    };
  }

  let perKg = null;
  if (Number.isFinite(weightKg) && weightKg > 0) {
    if (weightKg < LIMITS.weightKg.min || weightKg > LIMITS.weightKg.max) {
      return {
        error: `Weight must be between ${LIMITS.weightKg.min} kg and ${LIMITS.weightKg.max} kg.`,
      };
    }
    perKg = {
      perDoseMgPerKg: round(prescribedMg / weightKg, 2),
      perDayMgPerKg: perDay ? round(perDay.mg / weightKg, 2) : null,
    };
  }

  return {
    mgPerMl: round(mgPerMl, 3),
    prescribedMg: round(prescribedMg, 2),
    volumeMl: round(volumeMl, 3),
    measuredMl,
    deliveredMg: round(deliveredMg, 2),
    accuracyPct: round(accuracyPct, 2),
    syringe,
    singleDraw,
    drawCount,
    fillPercent: Math.round(fillFraction * 100),
    teaspoons: round(volumeMl / TEASPOON_ML, 2),
    tablespoons: round(volumeMl / TABLESPOON_ML, 2),
    perDay: perDay
      ? { doses: perDay.doses, volumeMl: round(perDay.volumeMl, 2), mg: round(perDay.mg, 2) }
      : null,
    supply,
    perKg,
    notes,
  };
}
