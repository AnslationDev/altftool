/**
 * Ladder set-up geometry and load checks.
 *
 * Sources for every rule and constant used below:
 *  - OSHA 29 CFR 1926.1053(b)(5)(i): a non-self-supporting ladder is set so the horizontal
 *    distance from the top support to the foot is about one quarter of the WORKING LENGTH
 *    (the distance along the ladder between its foot and the top support). That is the
 *    "4 to 1 rule" and it fixes the set-up angle at arccos(1/4).
 *  - OSHA 29 CFR 1926.1053(b)(1): when a ladder is used to get onto an upper landing, the
 *    side rails must extend at least 3 ft (0.9 m) above that landing surface.
 *  - ANSI A14 rung spacing is 12 in (1 ft); the top three rungs of a leaning ladder are not
 *    a standing level, so the highest safe standing rung is 3 ft of rail below the top.
 *  - ANSI A14 duty ratings: Type IAA 375 lb, IA 300 lb, I 250 lb, II 225 lb, III 200 lb.
 *    The rating covers the climber plus clothing, tools and materials carried up.
 */

/** OSHA 1926.1053(b)(5)(i): horizontal base offset is 1/4 of the working length. */
export const BASE_RATIO = 4;

/** cos(setup angle) = 1/BASE_RATIO, so sin = sqrt(15)/4 and the angle is ~75.52 degrees. */
export const COS_SETUP = 1 / BASE_RATIO;
export const SIN_SETUP = Math.sqrt(BASE_RATIO * BASE_RATIO - 1) / BASE_RATIO;
export const SETUP_ANGLE_DEG = (Math.acos(COS_SETUP) * 180) / Math.PI;

/** OSHA 1926.1053(b)(1): rails must clear the landing by at least 3 ft for access. */
export const RAIL_EXTENSION_ABOVE_LANDING_FT = 3;

/** ANSI A14 rung spacing, in feet. */
export const RUNG_SPACING_FT = 1;

/** Top three rungs of a leaning/extension ladder are not a standing level. */
export const TOP_RUNGS_UNUSABLE = 3;

/**
 * Ladder makers publish reach as "highest standing level + about 4 ft", the vertical
 * distance an average adult can work above their own feet.
 */
export const REACH_ABOVE_STANDING_FT = 4;

/** ANSI A14 duty ratings. Rating is total load: person + clothing + tools + materials. */
export const DUTY_RATINGS = [
  { code: "IAA", label: "Type IAA - Special Duty", lb: 375 },
  { code: "IA", label: "Type IA - Extra Heavy Duty", lb: 300 },
  { code: "I", label: "Type I - Heavy Duty", lb: 250 },
  { code: "II", label: "Type II - Medium Duty", lb: 225 },
  { code: "III", label: "Type III - Light Duty", lb: 200 },
];

/** Exact conversions. 1 ft = 0.3048 m by definition; 1 lb = 0.45359237 kg by definition. */
export const FT_PER_M = 1 / 0.3048;
export const KG_PER_LB = 0.45359237;

/** Guard rails on input so the tool never reports nonsense geometry. */
export const MAX_LENGTH_FT = 60;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

/**
 * @param {object} input
 * @param {number} input.supportHeight  height of the top support point (eave, sill, landing)
 * @param {number} input.ladderLength   working length of the ladder that is actually available
 * @param {"ft"|"m"} [input.unit]       unit of the two lengths above, and of every length returned
 * @param {boolean} [input.roofAccess]  true if the climber steps off onto a roof or landing
 * @param {number} [input.dutyRatingLb] ANSI duty rating of the ladder, in pounds
 * @param {number} [input.climberKg]    climber weight in kilograms
 * @param {number} [input.gearKg]       tools and materials carried up, in kilograms
 * @returns {{error:string}|object}
 */
export function computeLadderSetup({
  supportHeight,
  ladderLength,
  unit = "ft",
  roofAccess = false,
  dutyRatingLb = 250,
  climberKg = 75,
  gearKg = 10,
}) {
  if (unit !== "ft" && unit !== "m") return { error: "Unit must be feet or metres." };
  if (![supportHeight, ladderLength, dutyRatingLb, climberKg, gearKg].every(isNum)) {
    return { error: "Enter a valid number in every field." };
  }
  if (supportHeight <= 0) return { error: "Support height must be greater than zero." };
  if (ladderLength <= 0) return { error: "Ladder length must be greater than zero." };
  if (climberKg <= 0) return { error: "Climber weight must be greater than zero." };
  if (gearKg < 0) return { error: "Tool and material weight cannot be negative." };
  if (dutyRatingLb <= 0) return { error: "Pick a ladder duty rating." };

  const toFt = (v) => (unit === "m" ? v * FT_PER_M : v);
  const fromFt = (v) => (unit === "m" ? v / FT_PER_M : v);

  const supportFt = toFt(supportHeight);
  const ladderFt = toFt(ladderLength);

  if (supportFt > MAX_LENGTH_FT || ladderFt > MAX_LENGTH_FT) {
    return {
      error: `Heights above ${unit === "m" ? "18 m" : "60 ft"} are outside portable-ladder territory - use scaffolding or a powered lift.`,
    };
  }

  // Working length is the rail distance from the foot to the top support point.
  const workingLengthFt = supportFt / SIN_SETUP;
  const baseDistanceFt = workingLengthFt * COS_SETUP;
  // The popular shortcut "1 ft out for every 4 ft of height" uses height, not rail length.
  const shortcutBaseFt = supportFt / BASE_RATIO;

  const requiredLadderFt = workingLengthFt + (roofAccess ? RAIL_EXTENSION_ABOVE_LANDING_FT : 0);
  const railExtensionFt = ladderFt - workingLengthFt;
  const shortfallFt = Math.max(0, requiredLadderFt - ladderFt);
  const longEnough = shortfallFt === 0;

  // Highest rung you may stand on sits 3 rungs (3 ft of rail) below the top of the ladder.
  const usableRailFt = Math.max(0, ladderFt - TOP_RUNGS_UNUSABLE * RUNG_SPACING_FT);
  const standingHeightFt = usableRailFt * SIN_SETUP;
  const reachHeightFt = standingHeightFt + REACH_ABOVE_STANDING_FT;

  const totalLoadKg = climberKg + gearKg;
  const ratingKg = dutyRatingLb * KG_PER_LB;
  const loadUsedPct = (totalLoadKg / ratingKg) * 100;
  const loadHeadroomKg = ratingKg - totalLoadKg;

  const warnings = [];
  if (!longEnough) {
    warnings.push(
      `This ladder is ${fromFt(shortfallFt).toFixed(2)} ${unit} too short for the job. At the correct angle it needs to be at least ${fromFt(requiredLadderFt).toFixed(2)} ${unit} long.`,
    );
  }
  if (roofAccess && longEnough && railExtensionFt < RAIL_EXTENSION_ABOVE_LANDING_FT) {
    warnings.push(
      `Rails clear the landing by only ${fromFt(railExtensionFt).toFixed(2)} ${unit}. OSHA asks for at least ${fromFt(RAIL_EXTENSION_ABOVE_LANDING_FT).toFixed(2)} ${unit} so you have something to hold while stepping off.`,
    );
  }
  if (roofAccess) {
    warnings.push("Tie the top of the ladder off at the landing and stake or foot the base before stepping across.");
  }
  if (totalLoadKg > ratingKg) {
    warnings.push(
      `Total load ${totalLoadKg.toFixed(0)} kg is over the ${dutyRatingLb} lb (${ratingKg.toFixed(0)} kg) duty rating. Move up a rating or take less weight up.`,
    );
  }
  if (!roofAccess && standingHeightFt > supportFt) {
    warnings.push(
      "The highest usable rung sits above the top support point. Either lean the ladder against something higher or keep your feet below the support - an unsupported rail flexes sideways.",
    );
  }

  return {
    unit,
    angleDeg: SETUP_ANGLE_DEG,
    baseDistance: fromFt(baseDistanceFt),
    shortcutBaseDistance: fromFt(shortcutBaseFt),
    workingLength: fromFt(workingLengthFt),
    requiredLadderLength: fromFt(requiredLadderFt),
    ladderLength: fromFt(ladderFt),
    railExtension: fromFt(railExtensionFt),
    railAboveSupport: fromFt(Math.max(0, railExtensionFt)),
    shortfall: fromFt(shortfallFt),
    longEnough,
    standingHeight: fromFt(standingHeightFt),
    reachHeight: fromFt(reachHeightFt),
    supportHeight: fromFt(supportFt),
    totalLoadKg,
    ratingKg,
    loadUsedPct,
    loadHeadroomKg,
    loadOk: totalLoadKg <= ratingKg,
    warnings,
  };
}
