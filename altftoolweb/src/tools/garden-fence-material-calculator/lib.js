/**
 * Garden fence material take-off.
 *
 * Geometry
 *   netLength = totalLength - gateWidth
 *   bays      = ceil(netLength / postSpacing)          (a "bay" is one gap between posts)
 *   posts     = bays + 1 for an open run or a loop broken by a gate; bays for a closed loop
 *   actualSpacing = netLength / bays                   (evened out, never more than the max)
 *   panels    = ceil(netLength / panelWidth)
 *   wire      = netLength x strands x (1 + WIRE_SLACK)
 *
 * Post holes (standard carpentry/fencing rule)
 *   burial      = max(MIN_BURIAL_M, aboveGroundHeight / BURIAL_HEIGHT_DIVISOR)
 *   holeDia     = HOLE_DIA_MULTIPLIER x post width
 *   concrete    = (pi/4 x holeDia^2 - postSection) x burial      per hole
 */

/** Bury at least this much of any post, whatever the fence height. */
export const MIN_BURIAL_M = 0.6;

/** Standard fencing rule: set one third of the above-ground height into the ground. */
export const BURIAL_HEIGHT_DIVISOR = 3;

/** Post hole diameter as a multiple of the post's widest dimension (standard guidance is three times). */
export const HOLE_DIA_MULTIPLIER = 3;

/** Extra wire for tensioning, wrapping around straining posts and tie-offs. */
export const WIRE_SLACK = 0.1;

/**
 * Cement content of a nominal 1:2:4 (M15) concrete mix, kg per cubic metre.
 * IS 456 nominal-mix practice puts M15 at roughly 320 kg of cement per m3.
 */
export const CEMENT_KG_PER_M3 = 320;

/** Cement bag size used across India. */
export const CEMENT_BAG_KG = 50;

/** Length unit conversions to metres (international foot). */
export const LENGTH_UNITS = [
  { value: "m", label: "Metres", toM: 1 },
  { value: "ft", label: "Feet", toM: 0.3048 },
];

/** Typical maximum post spacing by fence type, in metres. */
export const FENCE_STYLES = [
  { value: "panel", label: "Prefab panel fence", spacing: 1.83, strands: 0, panelWidth: 1.83 },
  { value: "picket", label: "Picket or paling fence", spacing: 2.4, strands: 0, panelWidth: 2.4 },
  { value: "rail", label: "Post and rail", spacing: 2.7, strands: 0, panelWidth: 2.7 },
  { value: "chainlink", label: "Chain link mesh", spacing: 3, strands: 3, panelWidth: 15 },
  { value: "wire", label: "Strained wire / stock fence", spacing: 3, strands: 5, panelWidth: 0 },
];

export const MAX_SPACING_M = 6;
export const MIN_SPACING_M = 0.5;

const round = (value, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const findOption = (options, value) => options.find((option) => option.value === value) || null;

const toNumber = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : NaN;
};

/**
 * Express a preset value held in metres in whichever unit the user is working in,
 * rounded to two decimals so it reads cleanly in an input box.
 * @param {number} metres The preset value, in metres.
 * @param {string} unit One of LENGTH_UNITS values.
 * @returns {number} The same length in `unit`.
 */
export function presetInUnit(metres, unit) {
  const found = findOption(LENGTH_UNITS, unit);
  const toM = found && found.toM > 0 ? found.toM : 1;
  const value = Number(metres);
  if (!Number.isFinite(value)) return 0;
  return Math.round((value / toM) * 100) / 100;
}

/**
 * @param {object} input
 * @param {number|string} input.fenceLength Total run or perimeter, in `unit`.
 * @param {string} [input.unit] One of LENGTH_UNITS values.
 * @param {boolean} [input.closedLoop] True when the fence returns to its start.
 * @param {number|string} [input.gateWidth] Total width of gates, in `unit`.
 * @param {number|string} [input.postSpacing] Maximum centre-to-centre spacing, in `unit`.
 * @param {number|string} [input.fenceHeight] Above-ground fence height, in `unit`.
 * @param {number|string} [input.postWidthMm] Post section width in millimetres.
 * @param {number|string} [input.strands] Horizontal wire strands, if wire fencing.
 * @param {number|string} [input.panelWidth] Prefab panel or mesh roll width, in `unit`.
 * @param {number|string} [input.corners] Number of corner changes of direction.
 */
export function computeFenceMaterials({
  fenceLength,
  unit = "m",
  closedLoop = true,
  gateWidth = 1,
  postSpacing = 2.4,
  fenceHeight = 1.2,
  postWidthMm = 100,
  strands = 5,
  panelWidth = 1.83,
  corners = 4,
} = {}) {
  const lengthUnit = findOption(LENGTH_UNITS, unit);
  if (!lengthUnit) return { error: "Choose metres or feet." };
  const k = lengthUnit.toM;

  const raw = {
    length: toNumber(fenceLength),
    gate: toNumber(gateWidth),
    spacing: toNumber(postSpacing),
    height: toNumber(fenceHeight),
    postMm: toNumber(postWidthMm),
    strandCount: toNumber(strands),
    panel: toNumber(panelWidth),
    cornerCount: toNumber(corners),
  };

  if (Object.values(raw).some((value) => Number.isNaN(value))) {
    return { error: "Enter valid numbers in every field." };
  }

  const totalM = raw.length * k;
  const gateM = raw.gate * k;
  const spacingM = raw.spacing * k;
  const heightM = raw.height * k;
  const panelM = raw.panel * k;

  if (!(totalM > 0)) return { error: "Enter a fence length greater than zero." };
  if (totalM > 5000) return { error: "Over 5 km is a farm boundary job — this tool is sized for gardens and plots." };
  if (gateM < 0) return { error: "Gate width cannot be negative." };
  if (gateM >= totalM) return { error: "Gate width must be less than the total fence length." };
  if (spacingM < MIN_SPACING_M || spacingM > MAX_SPACING_M) {
    return { error: `Post spacing should be between ${MIN_SPACING_M} m and ${MAX_SPACING_M} m.` };
  }
  if (heightM <= 0 || heightM > 4) return { error: "Fence height should be between 0 and 4 metres." };
  if (raw.postMm < 25 || raw.postMm > 500) return { error: "Post width should be between 25 mm and 500 mm." };
  if (raw.strandCount < 0 || raw.strandCount > 30) return { error: "Wire strands should be between 0 and 30." };
  if (raw.cornerCount < 0 || raw.cornerCount > 100) return { error: "Corner count should be between 0 and 100." };
  if (panelM < 0) return { error: "Panel width cannot be negative." };

  const netM = totalM - gateM;
  const bays = Math.ceil(netM / spacingM);
  // A closed loop needs one post per bay; a run — or a loop opened by a gate — needs one more.
  const isRun = !closedLoop || gateM > 0;
  const posts = isRun ? bays + 1 : bays;
  const actualSpacingM = netM / bays;

  // Corner and end posts carry side load and need a bigger section or a strut.
  const endPosts = isRun ? 2 : 0;
  const bracedPosts = Math.min(posts, endPosts + Math.round(raw.cornerCount));
  const linePosts = Math.max(0, posts - bracedPosts);

  const panels = panelM > 0 ? Math.ceil(netM / panelM) : 0;
  const wireM = netM * raw.strandCount * (1 + WIRE_SLACK);

  const burialM = Math.max(MIN_BURIAL_M, heightM / BURIAL_HEIGHT_DIVISOR);
  const postLengthM = heightM + burialM;
  const totalPostTimberM = postLengthM * posts;

  const postWidthM = raw.postMm / 1000;
  const holeDiaM = HOLE_DIA_MULTIPLIER * postWidthM;
  const holeVolumeM3 = (Math.PI / 4) * holeDiaM * holeDiaM * burialM;
  const postVolumeInHoleM3 = postWidthM * postWidthM * burialM;
  const concretePerPostM3 = Math.max(0, holeVolumeM3 - postVolumeInHoleM3);
  const concreteTotalM3 = concretePerPostM3 * posts;
  const cementKg = concreteTotalM3 * CEMENT_KG_PER_M3;
  const cementBags = Math.ceil(cementKg / CEMENT_BAG_KG);

  const notes = [];
  if (actualSpacingM < spacingM - 0.001) {
    notes.push(
      `Spacing evens out to ${round(actualSpacingM, 2)} m so the last bay is not a short offcut.`,
    );
  }
  if (heightM >= 1.8) {
    notes.push("At 1.8 m and above, wind load is significant — use a heavier post section or add struts at every corner.");
  }
  if (raw.strandCount > 0 && bracedPosts > 0) {
    notes.push("Strained wire pulls end and corner posts inward; brace or strut every one of them before tensioning.");
  }
  notes.push("Concrete figures assume a 1:2:4 mix and no gravel base — add 100 mm of gravel under each post for drainage.");

  return {
    totalM: round(totalM, 2),
    gateM: round(gateM, 2),
    netM: round(netM, 2),
    bays,
    posts,
    linePosts,
    bracedPosts,
    requestedSpacingM: round(spacingM, 2),
    actualSpacingM: round(actualSpacingM, 2),
    panels,
    panelWidthM: round(panelM, 2),
    strands: Math.round(raw.strandCount),
    wireM: round(wireM, 1),
    heightM: round(heightM, 2),
    burialM: round(burialM, 2),
    postLengthM: round(postLengthM, 2),
    totalPostTimberM: round(totalPostTimberM, 1),
    postWidthMm: Math.round(raw.postMm),
    holeDiaMm: Math.round(holeDiaM * 1000),
    concretePerPostLitres: round(concretePerPostM3 * 1000, 1),
    concreteTotalM3: round(concreteTotalM3, 3),
    cementKg: round(cementKg),
    cementBags,
    notes,
  };
}
