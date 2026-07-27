/**
 * Granite for a kitchen platform: running feet, area with wastage, cutouts and cost.
 *
 * Indian kitchen counters are measured in RUNNING FEET — the length of the counter — and the
 * stone is quoted either per running foot at a standard depth or per square foot. A complete
 * job is more than the counter top:
 *
 *   platform area  = running feet x platform depth
 *   skirting area  = running feet x skirting height   (the upstand against the wall)
 *   front band     = running feet x band height       (the strip under the front edge)
 *   ordered area   = (sum of the above) x (1 + wastage)
 *
 * A sink or hob cutout is NOT deducted from the area — the slab is bought whole and the hole
 * is cut out of it, so the cutout is a fabrication charge, not a saving. The offcut is usually
 * a usable piece, which is why its size is reported here.
 *
 * Rates are inputs. Granite is priced by variety, thickness and finish, and fabrication and
 * fitting rates are local; take yours from the quotation you are checking.
 */

/** A standard Indian kitchen counter is 24 inches (2 feet) deep over 600 mm base units. */
export const DEFAULT_PLATFORM_DEPTH_FT = 2;
/** Common skirting (upstand) height against the wall. */
export const DEFAULT_SKIRTING_INCHES = 4;
/** Common front band height under the counter edge, giving the platform a thicker look. */
export const DEFAULT_FRONT_BAND_INCHES = 2;
/**
 * Cutting loss and breakage allowance. Stone fabricators typically add 8-10% because pieces
 * cannot be nested perfectly and edges chip.
 */
export const DEFAULT_WASTAGE_PCT = 10;

export const INCHES_PER_FOOT = 12;

/** Sanity ceilings so a typo cannot produce a meaningless answer. */
export const MAX_RUNNING_FEET = 200;
export const MAX_DEPTH_FT = 6;

/**
 * @returns {{error:string}|object} areas, cutout details and the itemised cost
 */
export function estimateGraniteCost({
  runningFeet,
  platformDepthFt = DEFAULT_PLATFORM_DEPTH_FT,
  skirtingInches = DEFAULT_SKIRTING_INCHES,
  frontBandInches = DEFAULT_FRONT_BAND_INCHES,
  wastagePct = DEFAULT_WASTAGE_PCT,
  ratePerSqft,
  polishRunningFeet = 0,
  polishRatePerFoot = 0,
  sinkCutouts = 0,
  sinkCutoutRate = 0,
  sinkLengthInches = 0,
  sinkWidthInches = 0,
  hobCutouts = 0,
  hobCutoutRate = 0,
  fittingRatePerFoot = 0,
  transportCost = 0,
}) {
  const numbers = [
    runningFeet,
    platformDepthFt,
    skirtingInches,
    frontBandInches,
    wastagePct,
    ratePerSqft,
    polishRunningFeet,
    polishRatePerFoot,
    sinkCutouts,
    sinkCutoutRate,
    sinkLengthInches,
    sinkWidthInches,
    hobCutouts,
    hobCutoutRate,
    fittingRatePerFoot,
    transportCost,
  ];
  if (numbers.some((v) => typeof v !== "number" || !Number.isFinite(v))) {
    return { error: "Enter a valid number in every field." };
  }
  if (numbers.some((v) => v < 0)) {
    return { error: "Measurements and rates cannot be negative." };
  }
  if (!(runningFeet > 0)) {
    return { error: "Enter the counter length in running feet — it must be greater than zero." };
  }
  if (runningFeet > MAX_RUNNING_FEET) {
    return { error: `Counter length must be ${MAX_RUNNING_FEET} running feet or less.` };
  }
  if (!(platformDepthFt > 0) || platformDepthFt > MAX_DEPTH_FT) {
    return { error: `Platform depth must be between 0 and ${MAX_DEPTH_FT} feet.` };
  }
  if (skirtingInches > 48 || frontBandInches > 48) {
    return { error: "Skirting and front band heights must be 48 inches or less." };
  }
  if (wastagePct > 50) {
    return { error: "Wastage allowance must be 50% or less." };
  }
  if (!Number.isInteger(sinkCutouts) || !Number.isInteger(hobCutouts)) {
    return { error: "Cutout counts must be whole numbers." };
  }
  if (sinkCutouts > 10 || hobCutouts > 10) {
    return { error: "Cutout counts must be 10 or fewer." };
  }
  if (polishRunningFeet > MAX_RUNNING_FEET * 3) {
    return { error: "Edge polishing length looks too large — check the figure." };
  }

  const platformArea = runningFeet * platformDepthFt;
  const skirtingArea = runningFeet * (skirtingInches / INCHES_PER_FOOT);
  const frontBandArea = runningFeet * (frontBandInches / INCHES_PER_FOOT);
  const netArea = platformArea + skirtingArea + frontBandArea;
  const wastageArea = netArea * (wastagePct / 100);
  const orderArea = netArea + wastageArea;

  const stoneCost = orderArea * ratePerSqft;
  const polishCost = polishRunningFeet * polishRatePerFoot;
  const sinkCost = sinkCutouts * sinkCutoutRate;
  const hobCost = hobCutouts * hobCutoutRate;
  const fittingCost = runningFeet * fittingRatePerFoot;

  const items = [
    [`Granite (${orderArea.toFixed(2)} sq ft ordered)`, stoneCost],
    [`Edge polishing (${polishRunningFeet.toFixed(1)} rft)`, polishCost],
    [`Sink cutouts (${sinkCutouts})`, sinkCost],
    [`Hob cutouts (${hobCutouts})`, hobCost],
    [`Fabrication and fitting (${runningFeet.toFixed(1)} rft)`, fittingCost],
    ["Transport", transportCost],
  ];
  const total = items.reduce((sum, [, value]) => sum + value, 0);

  const costPerRunningFoot = total / runningFeet;
  const costPerSqft = orderArea > 0 ? total / orderArea : 0;

  // The piece cut out for the sink is usable stone, not waste — worth keeping for a chopping
  // insert or a small shelf.
  const sinkOffcutSqft =
    sinkCutouts *
    ((sinkLengthInches / INCHES_PER_FOOT) * (sinkWidthInches / INCHES_PER_FOOT));

  const notes = [];
  notes.push(
    `A cutout does not reduce the stone you buy — the slab is purchased whole and the hole is cut from it. ${
      sinkOffcutSqft > 0
        ? `The sink offcut alone is about ${sinkOffcutSqft.toFixed(2)} sq ft of usable granite; ask for it back.`
        : "Ask the fabricator to leave the cut-out piece with you."
    }`,
  );
  if (platformDepthFt !== DEFAULT_PLATFORM_DEPTH_FT) {
    notes.push(
      `Depth is set to ${platformDepthFt} ft. Standard Indian base units give a ${DEFAULT_PLATFORM_DEPTH_FT} ft counter, and going deeper often forces a wider slab and a higher rate per square foot.`,
    );
  }
  if (wastagePct < 8) {
    notes.push(
      "A wastage allowance under 8% is optimistic for stone. Pieces cannot be nested perfectly and edges chip in transit — most fabricators allow 8% to 10%.",
    );
  }
  if (polishRunningFeet < runningFeet && polishRatePerFoot > 0) {
    notes.push(
      `Only ${polishRunningFeet.toFixed(1)} of ${runningFeet.toFixed(1)} running feet are set for edge polishing. Every exposed edge, including the returns at each end and around a sink, needs finishing.`,
    );
  }
  if (skirtingInches === 0) {
    notes.push(
      "No skirting was included. Without the upstand against the wall, water runs into the junction behind the counter and lifts the plaster.",
    );
  }
  if (hobCutouts > 0) {
    notes.push(
      "A hob cutout needs clearance to the cabinet sides and, for a built-in hob, the manufacturer's cutout dimensions — cut it after the hob is on site, not from the brochure.",
    );
  }

  return {
    runningFeet,
    platformArea,
    skirtingArea,
    frontBandArea,
    netArea,
    wastageArea,
    orderArea,
    stoneCost,
    polishCost,
    sinkCost,
    hobCost,
    fittingCost,
    transportCost,
    items,
    total,
    costPerRunningFoot,
    costPerSqft,
    sinkOffcutSqft,
    notes,
  };
}
