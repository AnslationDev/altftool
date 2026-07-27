/**
 * Cooling-capacity conversion between BTU/h, tons of refrigeration, watts and
 * kcal/h, plus the electrical input those imply at a stated COP or EER.
 *
 * Definitions used, all exact:
 *
 *   1 BTU (IT)   = 1055.05585262 J           (International Table BTU)
 *   1 BTU/h      = 1055.05585262 / 3600 W    = 0.293071070172222 W
 *   1 ton of refrigeration = 12,000 BTU/h. This comes from the heat needed to
 *     melt one short ton of ice in 24 hours: 2,000 lb x 144 BTU/lb =
 *     288,000 BTU over 24 h. In watts that is 3,516.8528420667 W.
 *   1 kcal (IT)  = 4186.8 J, so 1 kcal/h = 1.163 W exactly. A ton is therefore
 *     3,023.95 kcal/h, the figure Indian and Middle-East datasheets often use.
 *
 * Efficiency ratios:
 *   COP = cooling watts / input watts (dimensionless)
 *   EER = cooling BTU/h / input watts, so EER = COP x 3.412141633
 * Input power is simply cooling capacity divided by COP.
 */

/** International Table BTU in joules. */
export const JOULES_PER_BTU = 1055.05585262;

/** 1 BTU/h in watts. */
export const WATTS_PER_BTU_H = JOULES_PER_BTU / 3600;

/** A ton of refrigeration is defined as 12,000 BTU/h. */
export const BTU_H_PER_TON = 12000;

/** Derived: 1 TR = 3516.8528420667 W. */
export const WATTS_PER_TON = BTU_H_PER_TON * WATTS_PER_BTU_H;

/** 1 kcal (IT) = 4186.8 J, so 1 kcal/h = 1.163 W. */
export const WATTS_PER_KCAL_H = 4186.8 / 3600;

/** BTU/h of cooling per watt of input at COP 1 — the EER/COP bridge. */
export const EER_PER_COP = 1 / WATTS_PER_BTU_H;

export const UNITS = [
  { id: "ton", label: "Tons of refrigeration (TR)", short: "TR", watts: WATTS_PER_TON, dp: 3 },
  { id: "btuh", label: "BTU per hour", short: "BTU/h", watts: WATTS_PER_BTU_H, dp: 0 },
  { id: "kbtuh", label: "Thousand BTU/h (MBH)", short: "kBTU/h", watts: WATTS_PER_BTU_H * 1000, dp: 2 },
  { id: "w", label: "Watts", short: "W", watts: 1, dp: 0 },
  { id: "kw", label: "Kilowatts", short: "kW", watts: 1000, dp: 3 },
  { id: "kcalh", label: "Kilocalories per hour", short: "kcal/h", watts: WATTS_PER_KCAL_H, dp: 0 },
];

/** Indian split-AC nominal sizes, in tons. */
export const AC_SIZES = [0.75, 1, 1.5, 2, 2.5, 3];

export const MIN_COP = 1;
export const MAX_COP = 10;

/** Ceiling that still covers a large chiller plant. */
export const MAX_WATTS = 1e9;

export function unitById(id) {
  return UNITS.find((u) => u.id === id) ?? null;
}

/** EER (BTU/h per W) for a given COP. */
export function copToEer(cop) {
  const c = Number(cop);
  return Number.isFinite(c) ? c * EER_PER_COP : Number.NaN;
}

/**
 * @param {object} input
 * @param {number} input.value    Capacity figure.
 * @param {string} input.fromUnit Unit id of that figure.
 * @param {number} [input.cop]    Coefficient of performance for the input-power estimate.
 * @returns {object} { watts, byUnit, power } or { error }.
 */
export function convertCooling({ value, fromUnit = "btuh", cop = 3.5 }) {
  const qty = Number(value);
  const unit = unitById(fromUnit);
  const c = Number(cop);

  if (!unit) return { error: "Choose a unit to convert from." };
  if (!Number.isFinite(qty)) return { error: "Enter a valid cooling capacity." };
  if (qty < 0) return { error: "Cooling capacity cannot be negative." };
  if (!Number.isFinite(c)) return { error: "Enter a valid COP." };
  if (c < MIN_COP || c > MAX_COP) {
    return { error: `COP should be between ${MIN_COP} and ${MAX_COP} for a real machine.` };
  }

  const watts = qty * unit.watts;
  if (watts > MAX_WATTS) {
    return { error: "That capacity is beyond the range this converter handles." };
  }

  const byUnit = {};
  for (const u of UNITS) byUnit[u.id] = watts / u.watts;

  const inputWatts = watts / c;
  const eer = copToEer(c);

  return {
    watts,
    byUnit,
    cop: c,
    eer,
    inputWatts,
    inputKw: inputWatts / 1000,
    unitsPerHour: inputWatts / 1000,
    nearestAcSize: AC_SIZES.reduce(
      (best, size) =>
        Math.abs(size - byUnit.ton) < Math.abs(best - byUnit.ton) ? size : best,
      AC_SIZES[0],
    ),
    fromUnit: unit,
  };
}
