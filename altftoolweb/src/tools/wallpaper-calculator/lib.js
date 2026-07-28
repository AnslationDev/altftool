/**
 * Wallpaper Calculator — how many rolls a room needs, by the drop method.
 *
 * Wallpaper is never bought by area. It is bought by the roll, and a roll is
 * cut into full-height strips called "drops". The whole calculation is:
 *
 *   drops needed   = ceil(wall run to paper / roll width)
 *   drop length    = wall height + trim allowance, rounded UP to the pattern
 *                    repeat when the pattern has to match across seams
 *   drops per roll = floor(roll length / drop length)      <- floor, never round
 *   rolls          = ceil(drops needed / drops per roll)
 *
 * Rounding direction matters: a roll that yields 3.9 drops yields 3 usable
 * drops, and 6.2 rolls means buying 7. Getting either rounding wrong is how
 * people end up one roll short of a finished wall.
 *
 * Pattern match types (the trade's three standard cases):
 *   free   — random/free match, no alignment needed, drop = height + trim
 *   straight — pattern lines up at the same height on the next drop, so each
 *              drop is rounded up to a whole number of repeats
 *   offset  — half-drop match; alternate drops start half a repeat down, so the
 *             conventional trade allowance is half a repeat of extra length
 *             per drop before rounding up to whole repeats
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Metres per foot (exact, by international definition). */
export const METRES_PER_FOOT = 0.3048;

/** Metres per inch (exact). */
export const METRES_PER_INCH = 0.0254;

/**
 * Standard roll sizes.
 * The European standard roll is 10.05 m x 0.53 m — the size almost all UK and
 * EU wallpaper is sold in. The wide "Euro" roll is 10.05 m x 0.70 m.
 * The American single roll is 27 in wide and about 4.1 m long (5 yards).
 */
export const ROLL_PRESETS = [
  { id: "euro", label: "European standard — 10.05 m x 53 cm", lengthM: 10.05, widthM: 0.53 },
  { id: "euro-wide", label: "European wide — 10.05 m x 70 cm", lengthM: 10.05, widthM: 0.7 },
  { id: "us-single", label: "American single roll — 5 yd x 27 in", lengthM: 5 * 3 * METRES_PER_FOOT, widthM: 27 * METRES_PER_INCH },
  { id: "custom", label: "Custom roll size", lengthM: null, widthM: null },
];

export const MATCH_TYPES = [
  { id: "free", label: "Free / random match (no alignment)" },
  { id: "straight", label: "Straight match (pattern lines up level)" },
  { id: "offset", label: "Offset / half-drop match" },
];

/** Trade default trim allowance: 10 cm total, 5 cm top and 5 cm bottom. */
export const DEFAULT_TRIM_M = 0.1;

/** Sanity bounds, in metres. */
export const MAX_WALL_HEIGHT_M = 10;
export const MAX_WALL_RUN_M = 500;
export const MAX_REPEAT_M = 2;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

/** Convert a length in the chosen unit into metres. */
export function toMetres(value, unit) {
  if (!isNum(value)) return NaN;
  if (unit === "ft") return value * METRES_PER_FOOT;
  if (unit === "cm") return value / 100;
  if (unit === "in") return value * METRES_PER_INCH;
  return value;
}

/** Perimeter of a rectangular room: 2 x (length + width). */
export function roomPerimeter(lengthM, widthM) {
  if (!isNum(lengthM) || !isNum(widthM) || lengthM <= 0 || widthM <= 0) {
    return { error: "Enter a room length and width greater than zero." };
  }
  return { perimeterM: 2 * (lengthM + widthM) };
}

/**
 * Length of one drop, given the wall height, trim allowance, and pattern.
 *
 * @param {{ wallHeightM: number, trimM: number, matchType: string, repeatM: number }} input
 */
export function dropLength({ wallHeightM, trimM, matchType, repeatM }) {
  if (!isNum(wallHeightM) || wallHeightM <= 0) return { error: "Wall height must be greater than zero." };
  if (wallHeightM > MAX_WALL_HEIGHT_M) return { error: `Wall height must be ${MAX_WALL_HEIGHT_M} m or less.` };
  if (!isNum(trimM) || trimM < 0) return { error: "Trim allowance cannot be negative." };
  const base = wallHeightM + trimM;

  if (matchType === "free") return { dropLengthM: base, repeatsPerDrop: null, wastePerDropM: trimM };

  if (!isNum(repeatM) || repeatM <= 0) {
    return { error: "Enter the pattern repeat printed on the roll label (it is greater than zero for a matched pattern)." };
  }
  if (repeatM > MAX_REPEAT_M) return { error: `A pattern repeat over ${MAX_REPEAT_M} m is outside this calculator's range.` };

  // Half-drop papers need half a repeat of extra length before rounding up,
  // because alternate drops start midway through the pattern.
  const needed = matchType === "offset" ? base + repeatM / 2 : base;
  const repeatsPerDrop = Math.ceil(needed / repeatM);
  const dropLengthM = repeatsPerDrop * repeatM;
  return { dropLengthM, repeatsPerDrop, wastePerDropM: dropLengthM - wallHeightM };
}

/**
 * Full roll calculation.
 *
 * @param {{ wallRunM: number, wallHeightM: number, rollLengthM: number,
 *           rollWidthM: number, matchType: string, repeatM: number,
 *           trimM: number, openingsWidthM?: number, extraRolls?: number,
 *           pricePerRoll?: number }} input
 */
export function calculateWallpaper({
  wallRunM,
  wallHeightM,
  rollLengthM,
  rollWidthM,
  matchType,
  repeatM,
  trimM,
  openingsWidthM = 0,
  extraRolls = 0,
  pricePerRoll = 0,
}) {
  if (!isNum(wallRunM) || wallRunM <= 0) return { error: "The wall run to paper must be greater than zero." };
  if (wallRunM > MAX_WALL_RUN_M) return { error: `The wall run must be ${MAX_WALL_RUN_M} m or less.` };
  if (!isNum(rollWidthM) || rollWidthM <= 0) return { error: "Roll width must be greater than zero." };
  if (!isNum(rollLengthM) || rollLengthM <= 0) return { error: "Roll length must be greater than zero." };
  if (!isNum(openingsWidthM) || openingsWidthM < 0) return { error: "Opening width cannot be negative." };
  if (openingsWidthM >= wallRunM) {
    return { error: "The full-height openings are as wide as the whole wall run — nothing is left to paper." };
  }
  if (!isNum(extraRolls) || extraRolls < 0) return { error: "Spare rolls cannot be negative." };

  const drop = dropLength({ wallHeightM, trimM, matchType, repeatM });
  if (drop.error) return drop;

  if (drop.dropLengthM > rollLengthM) {
    return {
      error: `Each drop needs ${drop.dropLengthM.toFixed(2)} m but a roll is only ${rollLengthM.toFixed(2)} m — this paper cannot cover a wall this tall.`,
    };
  }

  const papered = wallRunM - openingsWidthM;
  const dropsNeeded = Math.ceil(papered / rollWidthM);
  const dropsPerRoll = Math.floor(rollLengthM / drop.dropLengthM);
  if (dropsPerRoll < 1) return { error: "No full drop fits on a roll at this height and pattern repeat." };

  const rollsNeeded = Math.ceil(dropsNeeded / dropsPerRoll);
  const rollsToBuy = rollsNeeded + Math.round(extraRolls);

  const paperUsedM2 = papered * wallHeightM;
  const paperBoughtM2 = rollsToBuy * rollLengthM * rollWidthM;
  const offcutPerRollM = rollLengthM - dropsPerRoll * drop.dropLengthM;
  const wastePercent = paperBoughtM2 > 0 ? ((paperBoughtM2 - paperUsedM2) / paperBoughtM2) * 100 : 0;

  const totalCost = isNum(pricePerRoll) && pricePerRoll > 0 ? pricePerRoll * rollsToBuy : null;

  return {
    dropLengthM: drop.dropLengthM,
    repeatsPerDrop: drop.repeatsPerDrop,
    dropsNeeded,
    dropsPerRoll,
    rollsNeeded,
    rollsToBuy,
    sparesIncluded: Math.round(extraRolls),
    paperedRunM: papered,
    paperUsedM2,
    paperBoughtM2,
    offcutPerRollM,
    spareDrops: rollsToBuy * dropsPerRoll - dropsNeeded,
    wastePercent,
    totalCost,
  };
}
