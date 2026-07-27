/**
 * Running feet to square feet for carpentry and modular furniture quotes.
 *
 * A running foot (rft) is a linear measure along the wall. It only becomes an area once
 * you know how tall the unit is:
 *
 *   square feet = running feet x height of the unit in feet
 *
 * That single multiplication is why a per-running-foot quote is impossible to compare
 * with a per-square-foot quote until the height is stated. It also means a per-rft rate
 * hides very different per-sq-ft prices: at the same rate per rft, a 2.5 ft base unit
 * costs far more per square foot than a 7 ft wardrobe, because
 *
 *   effective rate per sq ft = rate per running foot / height in feet
 *
 * The heights below are the sizes commonly used in Indian modular quotes. They are typical
 * trade practice, not a standard, so every one of them is editable.
 *
 * 1 ft = 0.3048 m exactly, so 1 sq ft = 0.09290304 sq m exactly.
 */

export const M_PER_FT = 0.3048;
export const SQM_PER_SQFT = M_PER_FT * M_PER_FT;

/** Typical heights used when quoting each kind of unit, in feet. */
export const TYPICAL_HEIGHTS = [
  { id: "base", label: "Kitchen base unit", heightFt: 2.5, note: "Carcass about 30 in under a 36 in counter" },
  { id: "wall", label: "Kitchen wall unit", heightFt: 2.5, note: "Commonly 24 to 30 in tall" },
  { id: "tall", label: "Tall / larder unit", heightFt: 7, note: "Floor to just under the loft" },
  { id: "wardrobe", label: "Wardrobe", heightFt: 7, note: "Standard wardrobe shutter height" },
  { id: "loft", label: "Loft storage", heightFt: 2, note: "Above the wardrobe or tall unit" },
  { id: "tvunit", label: "TV unit / sideboard", heightFt: 2, note: "Low console height" },
];

/** Guard rails so a typo cannot produce a fantasy quote. */
export const MAX_RUNNING_FEET = 500;
export const MAX_HEIGHT_FT = 20;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

/**
 * Cost a set of carpentry runs and compare a per-rft quote with a per-sq-ft quote.
 *
 * @param {object} input
 * @param {Array<{id:string,label:string,runningFeet:number,heightFt:number}>} input.runs
 * @param {number} [input.ratePerRft]   contractor's quote per running foot, 0 to skip
 * @param {number} [input.ratePerSqft]  competing quote per square foot, 0 to skip
 * @returns {{error:string}|object}
 */
export function computeCarpentryQuote({ runs, ratePerRft = 0, ratePerSqft = 0 }) {
  if (!Array.isArray(runs) || runs.length === 0) return { error: "Add at least one run of carpentry." };
  if (!isNum(ratePerRft) || !isNum(ratePerSqft)) return { error: "Enter a valid number for each rate." };
  if (ratePerRft < 0 || ratePerSqft < 0) return { error: "Rates cannot be negative." };

  const rows = [];
  let totalRunningFeet = 0;
  let totalSqft = 0;

  for (const run of runs) {
    const { runningFeet, heightFt } = run;
    if (!isNum(runningFeet) || !isNum(heightFt)) {
      return { error: `Enter a number for the length and height of the ${run.label ?? "run"}.` };
    }
    if (runningFeet < 0 || heightFt < 0) return { error: "Lengths and heights cannot be negative." };
    if (runningFeet > MAX_RUNNING_FEET) {
      return { error: `A single run over ${MAX_RUNNING_FEET} running feet is almost certainly a typo.` };
    }
    if (heightFt > MAX_HEIGHT_FT) {
      return { error: `A unit taller than ${MAX_HEIGHT_FT} ft is almost certainly a typo.` };
    }
    if (runningFeet > 0 && heightFt === 0) {
      return { error: `Give the ${run.label ?? "run"} a height - running feet alone is not an area.` };
    }

    const sqft = runningFeet * heightFt;
    totalRunningFeet += runningFeet;
    totalSqft += sqft;
    rows.push({
      id: run.id,
      label: run.label,
      runningFeet,
      heightFt,
      sqft,
      // What a flat per-rft quote really charges per square foot on this run.
      effectiveRatePerSqft: ratePerRft > 0 && heightFt > 0 ? ratePerRft / heightFt : null,
      costAtRftRate: ratePerRft > 0 ? runningFeet * ratePerRft : null,
      costAtSqftRate: ratePerSqft > 0 ? sqft * ratePerSqft : null,
    });
  }

  if (totalRunningFeet <= 0 || totalSqft <= 0) {
    return { error: "Enter a length and a height for at least one run." };
  }

  const runningMetres = totalRunningFeet * M_PER_FT;
  const sqm = totalSqft * SQM_PER_SQFT;
  const averageHeightFt = totalSqft / totalRunningFeet;

  const totalAtRftRate = ratePerRft > 0 ? totalRunningFeet * ratePerRft : null;
  const totalAtSqftRate = ratePerSqft > 0 ? totalSqft * ratePerSqft : null;

  const blendedPerSqftFromRft = totalAtRftRate === null ? null : totalAtRftRate / totalSqft;
  const blendedPerRftFromSqft = totalAtSqftRate === null ? null : totalAtSqftRate / totalRunningFeet;

  let comparison = null;
  if (totalAtRftRate !== null && totalAtSqftRate !== null) {
    const difference = totalAtRftRate - totalAtSqftRate;
    comparison = {
      difference: Math.abs(difference),
      cheaper: difference === 0 ? "equal" : difference < 0 ? "rft" : "sqft",
    };
  }

  return {
    rows,
    totalRunningFeet,
    totalSqft,
    runningMetres,
    sqm,
    averageHeightFt,
    totalAtRftRate,
    totalAtSqftRate,
    blendedPerSqftFromRft,
    blendedPerRftFromSqft,
    ratePerRunningMetre: ratePerRft > 0 ? ratePerRft / M_PER_FT : null,
    comparison,
  };
}

/**
 * Convert a single running-foot figure to square feet at a given height.
 * @returns {{error:string}|{sqft:number}}
 */
export function runningFeetToSqft({ runningFeet, heightFt }) {
  if (!isNum(runningFeet) || !isNum(heightFt)) return { error: "Enter a number for both length and height." };
  if (runningFeet < 0 || heightFt < 0) return { error: "Length and height cannot be negative." };
  return { sqft: runningFeet * heightFt };
}
