/**
 * Granite kitchen countertop quantity and cost.
 *
 * Granite for a kitchen platform is measured three ways at once and quotes mix
 * them freely, which is where most confusion comes from:
 *
 *   area (sq ft)   = counter length x depth
 *                  + backsplash length x backsplash height
 *                  + counter length x facia height
 *   running feet   = the length of the run, quoted at a standard slab depth
 *   edge feet      = the exposed front edge that gets a profile ground on it
 *
 * A supplier quoting "per running foot" almost always means per foot of a
 * platform cut to a standard depth, so the honest conversion between the two is
 *
 *   equivalent running feet = total area / STANDARD_COUNTER_DEPTH_FT
 *
 * Cutting, breakage and matching the pattern across joints all consume stone
 * that never reaches the kitchen, which is what the wastage allowance covers.
 * Cutouts and edge profiles are charged separately from the stone itself.
 */

/** Inches in a foot - dimensions are entered in both. */
export const INCHES_PER_FOOT = 12;

/**
 * Indian kitchen platforms are conventionally cut about 24 inches deep, and
 * that is the depth a "per running foot" rate normally refers to.
 */
export const STANDARD_COUNTER_DEPTH_FT = 2;

export const MAX_LENGTH_FT = 200;
export const MAX_DEPTH_FT = 6;
export const MAX_HEIGHT_IN = 36;
export const MAX_WASTAGE_PCT = 40;
export const MAX_CUTOUTS = 20;

/**
 * Edge profiles, cheapest to dearest in fabrication effort.
 * `extraPerRft` is an indicative rupee rate for grinding and polishing that
 * profile onto the exposed edge, over and above the stone. Rates vary a lot by
 * city and by fabricator, so treat them as a starting point and overwrite them
 * with the rate you have actually been quoted. A mitred or laminated edge costs
 * most because a second strip of stone is bonded on to fake a thicker slab.
 */
export const EDGE_PROFILES = [
  { id: "eased", label: "Eased / square", extraPerRft: 0, note: "A straight machined edge, usually included in the base rate." },
  { id: "pencil", label: "Pencil round", extraPerRft: 40, note: "A small radius on the top arris - the common default." },
  { id: "half-bullnose", label: "Half bullnose", extraPerRft: 70, note: "Top half rounded over, bottom left square." },
  { id: "full-bullnose", label: "Full bullnose", extraPerRft: 100, note: "The whole edge rounded into a semicircle." },
  { id: "ogee", label: "Ogee", extraPerRft: 170, note: "An S-curve profile - the most decorative and the slowest to polish." },
  { id: "mitred", label: "Mitred / laminated", extraPerRft: 220, note: "A second strip bonded under the edge to imitate a thicker slab." },
];

const PROFILE_BY_ID = new Map(EDGE_PROFILES.map((p) => [p.id, p]));

const isNum = (v) => Number.isFinite(v);

/** Convert a height given in inches into feet. */
export function inchesToFeet(inches) {
  const v = Number(inches);
  return isNum(v) ? v / INCHES_PER_FOOT : 0;
}

/**
 * @param {object} input
 * @param {number} input.counterLengthFt   Total run of the platform.
 * @param {number} input.counterDepthFt    Front-to-back depth.
 * @param {number} input.backsplashLengthFt
 * @param {number} input.backsplashHeightIn
 * @param {number} input.faciaHeightIn     Vertical strip on the front, 0 for none.
 * @param {number} input.edgeLengthFt      Exposed edge that gets the profile.
 * @param {string} input.edgeProfileId
 * @param {number} input.edgeExtraPerRft   Overrides the profile default when given.
 * @param {number} input.ratePerSqft       Stone rate.
 * @param {number} input.fabricationPerSqft Cutting, polishing and fixing.
 * @param {number} input.sinkCutouts, input.sinkCutoutRate
 * @param {number} input.hobCutouts, input.hobCutoutRate
 * @param {number} input.wastagePct
 * @returns {object} areas, running feet and costs, or { error }.
 */
export function computeGraniteCountertop({
  counterLengthFt,
  counterDepthFt = STANDARD_COUNTER_DEPTH_FT,
  backsplashLengthFt,
  backsplashHeightIn = 4,
  faciaHeightIn = 0,
  edgeLengthFt,
  edgeProfileId = "pencil",
  edgeExtraPerRft,
  ratePerSqft = 0,
  fabricationPerSqft = 0,
  sinkCutouts = 0,
  sinkCutoutRate = 0,
  hobCutouts = 0,
  hobCutoutRate = 0,
  wastagePct = 10,
}) {
  const profile = PROFILE_BY_ID.get(edgeProfileId);
  if (!profile) return { error: "Pick an edge profile." };

  const length = Number(counterLengthFt);
  const depth = Number(counterDepthFt);
  const splashLen =
    backsplashLengthFt === undefined || backsplashLengthFt === null || backsplashLengthFt === ""
      ? length
      : Number(backsplashLengthFt);
  const splashHeight = Number(backsplashHeightIn);
  const facia = Number(faciaHeightIn);
  const edgeLen =
    edgeLengthFt === undefined || edgeLengthFt === null || edgeLengthFt === ""
      ? length
      : Number(edgeLengthFt);
  const edgeRate =
    edgeExtraPerRft === undefined || edgeExtraPerRft === null || edgeExtraPerRft === ""
      ? profile.extraPerRft
      : Number(edgeExtraPerRft);
  const stoneRate = Number(ratePerSqft);
  const fabRate = Number(fabricationPerSqft);
  const sinks = Math.round(Number(sinkCutouts));
  const sinkRate = Number(sinkCutoutRate);
  const hobs = Math.round(Number(hobCutouts));
  const hobRate = Number(hobCutoutRate);
  const waste = Number(wastagePct);

  const all = [length, depth, splashLen, splashHeight, facia, edgeLen, edgeRate, stoneRate, fabRate, sinks, sinkRate, hobs, hobRate, waste];
  if (!all.every(isNum)) return { error: "Enter valid numbers in every field." };

  if (length <= 0) return { error: "Counter length must be greater than zero." };
  if (length > MAX_LENGTH_FT) return { error: `Counter length above ${MAX_LENGTH_FT} ft is out of range.` };
  if (depth <= 0 || depth > MAX_DEPTH_FT) {
    return { error: `Counter depth should be between 0.5 ft and ${MAX_DEPTH_FT} ft.` };
  }
  if (splashLen < 0 || splashLen > MAX_LENGTH_FT) {
    return { error: "Backsplash length is out of range." };
  }
  if (splashHeight < 0 || splashHeight > MAX_HEIGHT_IN) {
    return { error: `Backsplash height should be between 0 and ${MAX_HEIGHT_IN} inches.` };
  }
  if (facia < 0 || facia > MAX_HEIGHT_IN) {
    return { error: `Front facia height should be between 0 and ${MAX_HEIGHT_IN} inches.` };
  }
  if (edgeLen < 0 || edgeLen > MAX_LENGTH_FT) return { error: "Edge length is out of range." };
  if (sinks < 0 || sinks > MAX_CUTOUTS || hobs < 0 || hobs > MAX_CUTOUTS) {
    return { error: `Cutout counts should be between 0 and ${MAX_CUTOUTS}.` };
  }
  if ([edgeRate, stoneRate, fabRate, sinkRate, hobRate].some((v) => v < 0 || v > 50000)) {
    return { error: "Rates should be between 0 and 50,000." };
  }
  if (waste < 0 || waste > MAX_WASTAGE_PCT) {
    return { error: `Wastage should be between 0% and ${MAX_WASTAGE_PCT}%.` };
  }

  const counterArea = length * depth;
  const backsplashArea = splashLen * inchesToFeet(splashHeight);
  const faciaArea = length * inchesToFeet(facia);
  const netArea = counterArea + backsplashArea + faciaArea;
  const orderArea = netArea * (1 + waste / 100);

  const stoneCost = orderArea * stoneRate;
  const fabricationCost = orderArea * fabRate;
  const edgeCost = edgeLen * edgeRate;
  const sinkCost = sinks * sinkRate;
  const hobCost = hobs * hobRate;
  const cutoutCost = sinkCost + hobCost;
  const totalCost = stoneCost + fabricationCost + edgeCost + cutoutCost;

  return {
    profile,
    edgeExtraPerRft: edgeRate,
    counterLengthFt: length,
    counterDepthFt: depth,
    counterArea,
    backsplashLengthFt: splashLen,
    backsplashHeightIn: splashHeight,
    backsplashArea,
    faciaHeightIn: facia,
    faciaArea,
    netArea,
    orderArea,
    wastageArea: orderArea - netArea,
    wastagePct: waste,
    runningFeet: length,
    edgeLengthFt: edgeLen,
    equivalentRunningFeet: orderArea / STANDARD_COUNTER_DEPTH_FT,
    stoneCost,
    fabricationCost,
    edgeCost,
    sinkCutouts: sinks,
    hobCutouts: hobs,
    sinkCost,
    hobCost,
    cutoutCost,
    totalCost,
    costPerSqft: netArea > 0 ? totalCost / netArea : null,
    costPerRunningFoot: length > 0 ? totalCost / length : null,
    stoneSharePct: totalCost > 0 ? (stoneCost / totalCost) * 100 : 0,
  };
}
