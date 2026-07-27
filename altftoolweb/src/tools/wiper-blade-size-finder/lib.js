/**
 * Wiper blade sizing from a measurement of the blade you already have.
 *
 * There is no universal formula from car model to blade length, so this works
 * the way a parts counter does: measure the rubber from tip to tip, convert,
 * and snap to the nearest size actually sold. Blades are retailed on a fixed
 * ladder of lengths in both millimetres and inches, and the two ladders do not
 * line up exactly — 22 in is 558.8 mm, which sits between the 550 mm and
 * 575 mm metric sizes.
 */

/** Exact definition of the inch. */
export const MM_PER_INCH = 25.4;

/** Blade lengths commonly stocked in millimetres. */
export const STANDARD_MM_SIZES = [
  250, 280, 300, 325, 350, 375, 400, 425, 450, 475, 500, 525, 550, 575, 600, 650, 700,
];

/** Blade lengths commonly stocked in inches. */
export const STANDARD_INCH_SIZES = [
  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 26, 28,
];

/**
 * Going longer than the original risks the two blades striking each other or
 * running off the glass at the top of the sweep. Going a little shorter is
 * mechanically safe and only leaves an unwiped strip.
 */
export const MAX_OVERSIZE_MM = 10;

/** Sanity bounds on a measured blade. */
export const MIN_BLADE_MM = 200;
export const MAX_BLADE_MM = 1000;

/** Arm-to-blade attachments, with the feature that identifies each one. */
export const FITTING_TYPES = [
  {
    id: "hook",
    label: "Hook / J-hook (9 x 3 or 9 x 4)",
    identify: "The arm ends in a J-shaped hook that curls back on itself.",
    commonOn: "By far the most common fitting on older and mid-range cars worldwide.",
  },
  {
    id: "pushButton",
    label: "Push button (16 mm or 19 mm)",
    identify: "Flat rectangular arm end with a release button on top of the connector.",
    commonOn: "Most modern European hatchbacks and saloons; measure the arm width to pick 16 or 19 mm.",
  },
  {
    id: "pinchTab",
    label: "Pinch tab / top lock",
    identify: "Two small tabs you squeeze on the sides of the connector to release it.",
    commonOn: "Volkswagen group and several Japanese models.",
  },
  {
    id: "sidePin",
    label: "Side pin / bayonet",
    identify: "A round pin sticking out sideways from the flat end of the arm.",
    commonOn: "Older French and some commercial vehicles.",
  },
  {
    id: "clawSideLock",
    label: "Claw / side lock",
    identify: "The blade clips over a slot in the side of a flat arm end.",
    commonOn: "Several Korean and Japanese models.",
  },
  {
    id: "bayonetArm",
    label: "Bayonet arm (straight slot)",
    identify: "The arm is a flat blade that slides straight into the wiper and pins.",
    commonOn: "Older Renault, Peugeot and Citroen.",
  },
];

/** Blade constructions, for choosing between them once the size is known. */
export const BLADE_STYLES = [
  {
    id: "conventional",
    label: "Conventional framed",
    pros: "Cheapest to replace and easy to find in any size.",
    cons: "The metal frame collects dust and can lift off the glass at highway speed.",
  },
  {
    id: "beam",
    label: "Flat beam (frameless)",
    pros: "Even pressure across the whole length and better contact at speed.",
    cons: "Costs more and needs the right adapter for your fitting.",
  },
  {
    id: "hybrid",
    label: "Hybrid",
    pros: "A framed blade inside an aerodynamic shell; good compromise in dusty conditions.",
    cons: "Heavier than a beam blade and priced close to one.",
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

function nearestFrom(list, targetMm, toMm) {
  let best = list[0];
  let bestDiff = Math.abs(toMm(list[0]) - targetMm);
  for (const candidate of list) {
    const diff = Math.abs(toMm(candidate) - targetMm);
    if (diff < bestDiff) {
      best = candidate;
      bestDiff = diff;
    }
  }
  return best;
}

const round1 = (value) => Math.round(value * 10) / 10;

/**
 * @param {object} input
 * @param {number} input.measuredValue length of the rubber, tip to tip
 * @param {string} input.unit          "mm" or "in"
 */
export function findBladeSize({ measuredValue, unit = "mm" }) {
  if (unit !== "mm" && unit !== "in") return { error: "Choose millimetres or inches." };
  if (!isNum(measuredValue)) return { error: "Enter the measured blade length as a number." };
  if (measuredValue <= 0) return { error: "Blade length must be greater than zero." };

  const mm = unit === "in" ? measuredValue * MM_PER_INCH : measuredValue;
  if (mm < MIN_BLADE_MM || mm > MAX_BLADE_MM) {
    return {
      error: `Measure again — wiper blades run from ${MIN_BLADE_MM} mm (${round1(MIN_BLADE_MM / MM_PER_INCH)} in) to ${MAX_BLADE_MM} mm (${round1(MAX_BLADE_MM / MM_PER_INCH)} in).`,
    };
  }

  const nearestMm = nearestFrom(STANDARD_MM_SIZES, mm, (size) => size);
  const nearestInch = nearestFrom(STANDARD_INCH_SIZES, mm, (size) => size * MM_PER_INCH);
  const nearestInchMm = nearestInch * MM_PER_INCH;

  const mmDiff = nearestMm - mm;
  const inchDiff = nearestInchMm - mm;

  const advice = [];
  if (Math.abs(mmDiff) <= 2) {
    advice.push(`Your blade is a standard ${nearestMm} mm size — buy exactly that.`);
  } else if (mmDiff > MAX_OVERSIZE_MM) {
    advice.push(
      `The nearest metric size up is ${nearestMm} mm, which is ${round1(mmDiff)} mm longer than what you measured — check the size below it first, because oversize blades can strike each other.`,
    );
  } else {
    advice.push(
      `Buy the ${nearestMm} mm blade; it is within ${round1(Math.abs(mmDiff))} mm of your measurement.`,
    );
  }
  advice.push(
    `In inches that is ${nearestInch} in (${round1(nearestInchMm)} mm), so either marking on the pack is the right blade.`,
  );
  advice.push(
    "Never fit a blade longer than the original by more than about a centimetre — the arms are set to sweep a fixed arc.",
  );

  return {
    measuredMm: round1(mm),
    measuredInch: round1(mm / MM_PER_INCH),
    nearestMm,
    nearestMmDiff: round1(mmDiff),
    nearestInch,
    nearestInchMm: round1(nearestInchMm),
    nearestInchDiff: round1(inchDiff),
    isExactMmSize: Math.abs(mmDiff) < 0.5,
    isExactInchSize: Math.abs(inchDiff) < 0.5,
    advice,
  };
}

/** Convert a length between mm and inches. Returns null on bad input. */
export function convertLength(value, fromUnit) {
  if (!isNum(value) || value <= 0) return null;
  if (fromUnit === "in") return { mm: round1(value * MM_PER_INCH), inch: round1(value) };
  return { mm: round1(value), inch: round1(value / MM_PER_INCH) };
}

/**
 * Sanity-check a driver/passenger pair. On almost every car the driver's side
 * blade is the same length or longer than the passenger's.
 */
export function checkWiperPair({ driverMm, passengerMm }) {
  if (![driverMm, passengerMm].every(isNum)) {
    return { error: "Enter both blade lengths in millimetres." };
  }
  if (driverMm <= 0 || passengerMm <= 0) {
    return { error: "Blade lengths must be greater than zero." };
  }
  if (
    driverMm < MIN_BLADE_MM ||
    driverMm > MAX_BLADE_MM ||
    passengerMm < MIN_BLADE_MM ||
    passengerMm > MAX_BLADE_MM
  ) {
    return { error: `Both blades should measure between ${MIN_BLADE_MM} mm and ${MAX_BLADE_MM} mm.` };
  }

  const difference = driverMm - passengerMm;
  const notes = [];
  if (difference === 0) {
    notes.push("Equal-length pair — buy two of the same blade and fit either side.");
  } else if (difference < 0) {
    notes.push(
      "The passenger blade is longer than the driver blade, which is unusual — check you have not swapped the two measurements.",
    );
  } else {
    notes.push(
      `Normal pattern: the driver blade is ${Math.abs(difference)} mm longer, so the two are not interchangeable.`,
    );
  }
  notes.push("Replace both blades together; a fresh blade beside a worn one leaves a smeared band.");

  return {
    driverMm,
    passengerMm,
    difference,
    sameSize: difference === 0,
    likelySwapped: difference < 0,
    notes,
  };
}
