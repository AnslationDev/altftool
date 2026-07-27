/**
 * Children's bicycle sizing.
 *
 * Kids' bikes are sold by wheel diameter, not by frame size, and the
 * measurement that decides the fit is the child's inseam (crotch to floor,
 * shoes off) — not their age. The inseam and height bands below are the
 * overlapping ranges published across children's bike sizing charts
 * (Woom, Frog, Islabikes, Trek/REI), rounded to whole centimetres.
 *
 * Saddle-height rules:
 *  - Beginners need both feet flat on the ground, so the saddle top sits at
 *    roughly the inseam height above the ground.
 *  - Once the child can start and stop confidently, the balls of the feet
 *    reaching the ground is enough: about 0.95 x inseam.
 *  - For efficient pedalling, the classic LeMond fit puts the saddle top at
 *    0.883 x inseam measured from the bottom-bracket centre. That leg
 *    extension is only appropriate once the child no longer needs to dab.
 *
 * Standover clearance: the top tube should sit at least 2.5 cm (1 inch) below
 * the inseam on a road/path bike and about 5 cm below for off-road riding, so
 * the child can stop astride the frame without injury.
 */

/** LeMond saddle-height factor: bottom bracket to saddle top = 0.883 x inseam. */
export const LEMOND_FACTOR = 0.883;

/** Balls-of-the-feet-down saddle height as a fraction of inseam. */
export const BALLS_OF_FEET_FACTOR = 0.95;

/** Minimum top-tube clearance below the inseam, in cm, for road/path use. */
export const STANDOVER_CLEARANCE_ROAD_CM = 2.5;

/** Minimum top-tube clearance below the inseam, in cm, for off-road use. */
export const STANDOVER_CLEARANCE_OFFROAD_CM = 5;

/**
 * Typical leg growth in mid-childhood. Stature grows about 5.5-6 cm a year
 * between ages 4 and 10, and leg length is roughly 48% of stature, giving
 * about 2.75 cm of inseam a year. Used only to estimate how long a bike fits.
 */
export const INSEAM_GROWTH_CM_PER_YEAR = 2.75;

/** Wheel sizes with their inseam, height and rough age bands. */
export const WHEEL_SIZES = [
  {
    id: "balance",
    wheel: 0,
    label: "Balance bike (no pedals)",
    minInseam: 30,
    maxInseam: 40,
    minHeight: 80,
    maxHeight: 98,
    ageFrom: 1.5,
    ageTo: 3,
    balance: true,
  },
  { id: "12", wheel: 12, label: '12" wheels', minInseam: 35, maxInseam: 42, minHeight: 85, maxHeight: 100, ageFrom: 2, ageTo: 4, balance: false },
  { id: "14", wheel: 14, label: '14" wheels', minInseam: 40, maxInseam: 48, minHeight: 95, maxHeight: 110, ageFrom: 3, ageTo: 5, balance: false },
  { id: "16", wheel: 16, label: '16" wheels', minInseam: 45, maxInseam: 55, minHeight: 105, maxHeight: 120, ageFrom: 4, ageTo: 6, balance: false },
  { id: "18", wheel: 18, label: '18" wheels', minInseam: 50, maxInseam: 58, minHeight: 112, maxHeight: 127, ageFrom: 5, ageTo: 7, balance: false },
  { id: "20", wheel: 20, label: '20" wheels', minInseam: 55, maxInseam: 63, minHeight: 120, maxHeight: 135, ageFrom: 6, ageTo: 9, balance: false },
  { id: "24", wheel: 24, label: '24" wheels', minInseam: 62, maxInseam: 72, minHeight: 135, maxHeight: 150, ageFrom: 8, ageTo: 11, balance: false },
  { id: "26", wheel: 26, label: '26" wheels / small adult frame', minInseam: 70, maxInseam: 82, minHeight: 145, maxHeight: 163, ageFrom: 11, ageTo: 14, balance: false },
];

export const EXPERIENCE_LEVELS = [
  { id: "beginner", label: "Beginner — still learning to balance and brake" },
  { id: "learning", label: "Improving — can start and stop unaided" },
  { id: "confident", label: "Confident — rides distance, handles hills" },
];

/** Plausible inseam range for a child, in cm. Outside this it is a typo. */
const MIN_INSEAM_CM = 25;
const MAX_INSEAM_CM = 95;

const MIN_AGE = 1;
const MAX_AGE = 16;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Recommend a wheel size and riding position for a child.
 *
 * @param {object} input
 * @param {number} input.inseamCm    Crotch-to-floor measurement, shoes off, in cm.
 * @param {number} [input.ageYears]  Child's age, used only as a cross-check.
 * @param {string} [input.experience] One of EXPERIENCE_LEVELS[].id
 * @param {boolean} [input.offRoad]  True if the bike will be ridden off-road.
 */
export function selectKidsBike({
  inseamCm,
  ageYears = 0,
  experience = "learning",
  offRoad = false,
}) {
  if (!isNum(inseamCm) || !isNum(ageYears)) {
    return { error: "Enter valid numbers for inseam and age." };
  }
  if (inseamCm <= 0) {
    return { error: "Inseam must be greater than zero." };
  }
  if (inseamCm < MIN_INSEAM_CM || inseamCm > MAX_INSEAM_CM) {
    return {
      error: `Inseam should be between ${MIN_INSEAM_CM} cm and ${MAX_INSEAM_CM} cm — measure crotch to floor with shoes off.`,
    };
  }
  if (ageYears !== 0 && (ageYears < MIN_AGE || ageYears > MAX_AGE)) {
    return { error: `Age should be between ${MIN_AGE} and ${MAX_AGE}, or left blank.` };
  }

  const matches = WHEEL_SIZES.filter(
    (size) => inseamCm >= size.minInseam && inseamCm <= size.maxInseam,
  );

  let candidates = matches;
  let belowRange = false;
  let aboveRange = false;
  if (matches.length === 0) {
    if (inseamCm < WHEEL_SIZES[0].minInseam) {
      belowRange = true;
      candidates = [WHEEL_SIZES[0]];
    } else {
      aboveRange = true;
      candidates = [WHEEL_SIZES[WHEEL_SIZES.length - 1]];
    }
  }

  // With overlapping bands, experience breaks the tie: a beginner gets the
  // smaller, more manageable bike; a confident rider gets the one they will
  // grow into. Never size up "for room to grow" on a beginner.
  let index;
  if (experience === "beginner") index = 0;
  else if (experience === "confident") index = candidates.length - 1;
  else index = Math.floor((candidates.length - 1) / 2);
  const recommended = candidates[index];

  const smaller = candidates.length > 1 && index > 0 ? candidates[0] : null;
  const larger =
    candidates.length > 1 && index < candidates.length - 1
      ? candidates[candidates.length - 1]
      : null;

  const nextSizeIndex = WHEEL_SIZES.findIndex((size) => size.id === recommended.id) + 1;
  const nextSize = nextSizeIndex < WHEEL_SIZES.length ? WHEEL_SIZES[nextSizeIndex] : null;

  const headroomCm = Math.max(0, recommended.maxInseam - inseamCm);
  const monthsOfFit = (headroomCm / INSEAM_GROWTH_CM_PER_YEAR) * 12;

  const saddleFlatFootCm = inseamCm;
  const saddleBallsOfFeetCm = inseamCm * BALLS_OF_FEET_FACTOR;
  const saddlePedallingCm = recommended.balance ? null : inseamCm * LEMOND_FACTOR;

  let targetSaddleCm;
  let targetSaddleNote;
  if (recommended.balance || experience === "beginner") {
    targetSaddleCm = saddleFlatFootCm;
    targetSaddleNote = "Saddle top level with the inseam so both feet sit flat on the ground.";
  } else if (experience === "confident" && !recommended.balance) {
    targetSaddleCm = saddlePedallingCm;
    targetSaddleNote =
      "Measured from the bottom-bracket centre to the saddle top for a near-full leg extension.";
  } else {
    targetSaddleCm = saddleBallsOfFeetCm;
    targetSaddleNote = "Balls of the feet reach the ground when stopped, knees still slightly bent.";
  }

  const clearance = offRoad ? STANDOVER_CLEARANCE_OFFROAD_CM : STANDOVER_CLEARANCE_ROAD_CM;
  const maxStandoverCm = Math.max(0, inseamCm - clearance);

  const ageGiven = ageYears > 0;
  const ageMatches =
    !ageGiven || (ageYears >= recommended.ageFrom && ageYears <= recommended.ageTo);
  const ageSuggestion = ageGiven
    ? WHEEL_SIZES.find((size) => ageYears >= size.ageFrom && ageYears <= size.ageTo) ?? null
    : null;

  return {
    inseamCm,
    recommended,
    smaller,
    larger,
    nextSize,
    candidates,
    belowRange,
    aboveRange,
    headroomCm,
    monthsOfFit,
    saddleFlatFootCm,
    saddleBallsOfFeetCm,
    saddlePedallingCm,
    targetSaddleCm,
    targetSaddleNote,
    maxStandoverCm,
    clearance,
    offRoad,
    ageGiven,
    ageMatches,
    ageSuggestion,
  };
}
