/**
 * Split AC installation extras when the outdoor unit is not right behind the indoor unit.
 *
 * A "standard installation" from a brand or dealer covers a fixed length of copper pair,
 * drain and interconnecting cable — commonly 3 m (10 ft). Everything past that is charged
 * per metre, and a long refrigerant line also needs extra gas: manufacturers publish a
 * chargeless pipe length and a top-up rate in grams per additional metre in the installation
 * manual. This module adds all of that up.
 *
 * Every rate here is an input, not a fixed price, because copper rates move with the
 * commodity market and labour is city-dependent. The defaults are order-of-magnitude
 * starting points to be replaced with your installer's actual quote.
 */

/** Copper pair, drain and cable normally bundled into a "standard installation". */
export const DEFAULT_INCLUDED_PIPE_M = 3;

/**
 * Copper pair sizes by cooling capacity, as specified in split AC installation manuals.
 * The pair is a small liquid line and a larger suction line.
 */
export const PIPE_GRADES = [
  { value: "quarter-three-eighth", label: '1/4" + 3/8" pair (up to 1.5 ton)', maxTons: 1.5 },
  { value: "quarter-half", label: '1/4" + 1/2" pair (1.8 to 2.5 ton)', maxTons: 2.5 },
  { value: "three-eighth-five-eighth", label: '3/8" + 5/8" pair (3 ton and above)', maxTons: 10 },
];

/**
 * Typical published limits for a 1 to 2 ton residential split. Manuals vary, so these
 * are the defaults for the warnings and are editable.
 */
export const DEFAULT_CHARGELESS_LENGTH_M = 7.5;
export const DEFAULT_TOPUP_GRAMS_PER_METRE = 20;
export const DEFAULT_MAX_PIPE_LENGTH_M = 15;
export const DEFAULT_MAX_VERTICAL_RISE_M = 5;

/** An oil trap is fitted roughly every 5 m of vertical rise so compressor oil returns. */
export const OIL_TRAP_INTERVAL_M = 5;

/**
 * @returns {{error:string}|object} itemised installation extras
 */
export function estimatePipingCost({
  pipeRunM,
  includedPipeM = DEFAULT_INCLUDED_PIPE_M,
  pipeRatePerM,
  drainRunM,
  includedDrainM = DEFAULT_INCLUDED_PIPE_M,
  drainRatePerM,
  cableRatePerM,
  coreHoles = 1,
  coreRate = 0,
  standCost = 0,
  installationBase = 0,
  verticalRiseM = 0,
  chargelessLengthM = DEFAULT_CHARGELESS_LENGTH_M,
  topUpGramsPerMetre = DEFAULT_TOPUP_GRAMS_PER_METRE,
  refrigerantPricePerKg = 0,
  maxPipeLengthM = DEFAULT_MAX_PIPE_LENGTH_M,
  maxVerticalRiseM = DEFAULT_MAX_VERTICAL_RISE_M,
}) {
  const numbers = [
    pipeRunM,
    includedPipeM,
    pipeRatePerM,
    drainRunM,
    includedDrainM,
    drainRatePerM,
    cableRatePerM,
    coreHoles,
    coreRate,
    standCost,
    installationBase,
    verticalRiseM,
    chargelessLengthM,
    topUpGramsPerMetre,
    refrigerantPricePerKg,
    maxPipeLengthM,
    maxVerticalRiseM,
  ];
  if (numbers.some((v) => typeof v !== "number" || !Number.isFinite(v))) {
    return { error: "Enter a valid number in every field." };
  }
  if (pipeRunM <= 0) return { error: "Copper pipe run must be greater than zero." };
  if (pipeRunM > 60) return { error: "Copper pipe run must be 60 m or less." };
  if (drainRunM < 0) return { error: "Drain pipe run cannot be negative." };
  if (includedPipeM < 0 || includedDrainM < 0) {
    return { error: "Included lengths cannot be negative." };
  }
  if (pipeRatePerM < 0 || drainRatePerM < 0 || cableRatePerM < 0) {
    return { error: "Per-metre rates cannot be negative." };
  }
  if (!Number.isInteger(coreHoles) || coreHoles < 0) {
    return { error: "Number of core holes must be a whole number of zero or more." };
  }
  if (coreRate < 0 || standCost < 0 || installationBase < 0 || refrigerantPricePerKg < 0) {
    return { error: "Costs cannot be negative." };
  }
  if (verticalRiseM < 0) return { error: "Vertical rise cannot be negative." };
  if (verticalRiseM > pipeRunM) {
    return { error: "Vertical rise cannot be more than the total pipe run." };
  }
  if (chargelessLengthM < 0 || topUpGramsPerMetre < 0) {
    return { error: "Refrigerant figures cannot be negative." };
  }
  if (maxPipeLengthM <= 0 || maxVerticalRiseM <= 0) {
    return { error: "Manufacturer limits must be greater than zero." };
  }

  const extraPipeM = Math.max(0, pipeRunM - includedPipeM);
  const extraDrainM = Math.max(0, drainRunM - includedDrainM);
  // Interconnecting cable is clipped to the copper, so it follows the same extra length.
  const extraCableM = extraPipeM;

  const pipeCost = extraPipeM * pipeRatePerM;
  const drainCost = extraDrainM * drainRatePerM;
  const cableCost = extraCableM * cableRatePerM;
  const coreCost = coreHoles * coreRate;

  const extraRefrigerantG = Math.max(0, pipeRunM - chargelessLengthM) * topUpGramsPerMetre;
  const refrigerantCost = (extraRefrigerantG / 1000) * refrigerantPricePerKg;

  const items = [
    [`Extra copper pair (${extraPipeM.toFixed(1)} m beyond ${includedPipeM} m)`, pipeCost],
    [`Extra drain pipe (${extraDrainM.toFixed(1)} m beyond ${includedDrainM} m)`, drainCost],
    [`Extra interconnecting cable (${extraCableM.toFixed(1)} m)`, cableCost],
    [`Core drilling (${coreHoles} hole${coreHoles === 1 ? "" : "s"})`, coreCost],
    ["Outdoor unit stand or bracket", standCost],
    [`Refrigerant top-up (${extraRefrigerantG.toFixed(0)} g)`, refrigerantCost],
    ["Installation labour", installationBase],
  ];
  const total = items.reduce((sum, [, value]) => sum + value, 0);

  const oilTraps = Math.max(0, Math.floor(verticalRiseM / OIL_TRAP_INTERVAL_M));

  const warnings = [];
  if (pipeRunM > maxPipeLengthM) {
    warnings.push(
      `A ${pipeRunM} m run is past the ${maxPipeLengthM} m limit these units are usually rated for. Long lines lose cooling capacity and stress the compressor — check the installation manual before committing to this position.`,
    );
  }
  if (verticalRiseM > maxVerticalRiseM) {
    warnings.push(
      `A ${verticalRiseM} m height difference is past the usual ${maxVerticalRiseM} m limit. Confirm the maximum elevation in the manual for your model.`,
    );
  }
  if (oilTraps > 0) {
    warnings.push(
      `Fit ${oilTraps} oil trap${oilTraps === 1 ? "" : "s"} on the suction line — one roughly every ${OIL_TRAP_INTERVAL_M} m of vertical rise — so compressor oil returns.`,
    );
  }
  if (extraPipeM === 0) {
    warnings.push("The run fits inside the standard installation, so no extra copper is chargeable.");
  }

  return {
    extraPipeM,
    extraDrainM,
    extraCableM,
    pipeCost,
    drainCost,
    cableCost,
    coreCost,
    standCost,
    installationBase,
    extraRefrigerantG,
    refrigerantCost,
    items,
    total,
    extraOverStandard: total - installationBase,
    oilTraps,
    warnings,
  };
}
