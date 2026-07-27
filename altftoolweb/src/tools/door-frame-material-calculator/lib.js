/**
 * Door frame (chowkat) timber take-off and shutter sizing.
 *
 * A frame is three or four straight members cut from one section of timber:
 * two jambs the full height, one head across the top, and optionally a bottom
 * sill. So the running length of timber is
 *
 *   running = 2 x outer height + outer width            (three-sided)
 *   running = 2 x outer height + 2 x outer width        (with a sill)
 *
 * and the timber volume is that running length times the member's cross
 * section:
 *
 *   volume = running x section width x section thickness
 *
 * The clear opening left inside the frame is the outer size less one member
 * width on each side the frame occupies. The shutter is slightly bigger than
 * the clear opening because it sits into the rebate cut in the frame:
 *
 *   shutter width  = clear width  + 2 x rebate depth
 *   shutter height = clear height + 1 x rebate depth   (no sill)
 */

export const CFT_PER_M3 = 35.3146667;
export const SQFT_PER_M2 = 10.7639104;
export const FT_PER_M = 3.280839895;

/** Frame sections commonly milled in India, width x thickness in millimetres. */
export const SECTION_PRESETS = [
  { id: "100x65", label: "100 × 65 mm (4\" × 2½\") — standard internal door", width: 100, thickness: 65 },
  { id: "115x65", label: "115 × 65 mm (4½\" × 2½\") — 115 mm partition wall", width: 115, thickness: 65 },
  { id: "125x65", label: "125 × 65 mm (5\" × 2½\") — heavier internal frame", width: 125, thickness: 65 },
  { id: "150x75", label: "150 × 75 mm (6\" × 3\") — main / external door", width: 150, thickness: 75 },
  { id: "custom", label: "Custom section", width: 100, thickness: 65 },
];

/**
 * Rough seasoned timber densities in kg/m3, used only to estimate handling
 * weight. Values are the usual seasoned-condition figures quoted in IS 399.
 */
export const TIMBER_SPECIES = [
  { id: "sal", label: "Sal", densityKgM3: 880 },
  { id: "teak", label: "Teak", densityKgM3: 660 },
  { id: "deodar", label: "Deodar", densityKgM3: 560 },
  { id: "mango", label: "Mango", densityKgM3: 690 },
  { id: "rubberwood", label: "Rubberwood", densityKgM3: 640 },
  { id: "meranti", label: "Meranti / hardwood ply core", densityKgM3: 550 },
];

/** Three butt hinges up to this shutter height, four above it (millimetres). */
export const HINGE_HEIGHT_THRESHOLD_MM = 2100;
export const HINGES_STANDARD = 3;
export const HINGES_TALL = 4;

/** Holdfasts / MS clamps built into the masonry, per vertical jamb. */
export const HOLDFASTS_PER_JAMB = 3;

/** Typical rebate depth cut into the frame for the shutter to close against, mm. */
export const DEFAULT_REBATE_MM = 12;

/**
 * @param {object} input
 * @param {number} input.outerHeightMm  frame outer height (masonry opening height)
 * @param {number} input.outerWidthMm   frame outer width
 * @param {number} input.sectionWidthMm face width of the frame member
 * @param {number} input.sectionThicknessMm depth of the frame member into the wall
 * @param {boolean} input.includeSill   true if a bottom member is fitted
 * @param {number} input.rebateMm       rebate depth the shutter closes into
 * @param {number} input.doors          number of identical door frames
 * @param {number} input.wastagePct     cutting and planing allowance on timber
 * @param {string} input.species        id from TIMBER_SPECIES
 * @param {number} input.timberRatePerCft
 * @param {number} input.shutterRatePerSqft
 * @returns {object} take-off, or { error }
 */
export function computeDoorFrame({
  outerHeightMm,
  outerWidthMm,
  sectionWidthMm,
  sectionThicknessMm,
  includeSill = false,
  rebateMm = DEFAULT_REBATE_MM,
  doors = 1,
  wastagePct = 8,
  species = "sal",
  timberRatePerCft = 0,
  shutterRatePerSqft = 0,
}) {
  const H = Number(outerHeightMm);
  const W = Number(outerWidthMm);
  const sw = Number(sectionWidthMm);
  const st = Number(sectionThicknessMm);
  const rebate = Number(rebateMm);
  const count = Number(doors);
  const waste = Number(wastagePct);
  const timberRate = Number(timberRatePerCft);
  const shutterRate = Number(shutterRatePerSqft);

  const wood = TIMBER_SPECIES.find((entry) => entry.id === species);
  if (!wood) return { error: "Choose a timber species." };

  if (![H, W, sw, st, rebate, count, waste, timberRate, shutterRate].every((v) => Number.isFinite(v))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (H <= 0 || W <= 0) return { error: "Frame height and width must be greater than zero." };
  if (H > 5000 || W > 5000) return { error: "Frame height and width are limited to 5000 mm." };
  if (sw <= 0 || st <= 0) return { error: "Section width and thickness must be greater than zero." };
  if (sw > 400 || st > 400) return { error: "Frame section is limited to 400 mm each way." };
  if (rebate < 0 || rebate > 40) return { error: "Rebate depth should be between 0 and 40 mm." };
  if (!Number.isInteger(count) || count < 1 || count > 500) {
    return { error: "Number of doors must be a whole number between 1 and 500." };
  }
  if (waste < 0 || waste > 50) return { error: "Wastage should be between 0% and 50%." };
  if (timberRate < 0 || shutterRate < 0) return { error: "Rates cannot be negative." };

  if (2 * sw >= W) {
    return { error: `A ${sw} mm section on both jambs leaves no opening in a ${W} mm wide frame.` };
  }
  const horizontalMembers = includeSill ? 2 : 1;
  if (horizontalMembers * sw >= H) {
    return { error: `A ${sw} mm section leaves no opening in a ${H} mm tall frame.` };
  }

  const runningMm = 2 * H + horizontalMembers * W;
  const runningM = runningMm / 1000;
  const sectionAreaM2 = (sw / 1000) * (st / 1000);
  const volumeM3 = runningM * sectionAreaM2;

  const clearWidthMm = W - 2 * sw;
  const clearHeightMm = H - horizontalMembers * sw;
  const shutterWidthMm = clearWidthMm + 2 * rebate;
  const shutterHeightMm = clearHeightMm + horizontalMembers * rebate;
  const shutterAreaM2 = (shutterWidthMm / 1000) * (shutterHeightMm / 1000);

  const hingesPerDoor = shutterHeightMm > HINGE_HEIGHT_THRESHOLD_MM ? HINGES_TALL : HINGES_STANDARD;
  const holdfastsPerDoor = HOLDFASTS_PER_JAMB * 2;

  const wasteFactor = 1 + waste / 100;
  const orderVolumeM3 = volumeM3 * count * wasteFactor;
  const orderVolumeCft = orderVolumeM3 * CFT_PER_M3;
  const totalShutterAreaM2 = shutterAreaM2 * count;
  const totalShutterAreaSqft = totalShutterAreaM2 * SQFT_PER_M2;

  const timberCost = timberRate > 0 ? orderVolumeCft * timberRate : 0;
  const shutterCost = shutterRate > 0 ? totalShutterAreaSqft * shutterRate : 0;

  return {
    doors: count,
    membersPerFrame: 2 + horizontalMembers,
    runningLengthM: runningM,
    runningLengthFt: runningM * FT_PER_M,
    totalRunningLengthM: runningM * count,
    totalRunningLengthFt: runningM * count * FT_PER_M,
    jambLengthMm: H,
    headLengthMm: W,
    hasSill: Boolean(includeSill),
    sectionWidthMm: sw,
    sectionThicknessMm: st,
    volumePerFrameM3: volumeM3,
    volumePerFrameCft: volumeM3 * CFT_PER_M3,
    orderVolumeM3,
    orderVolumeCft,
    wastagePct: waste,
    timberWeightKg: orderVolumeM3 * wood.densityKgM3,
    species: wood.label,
    clearWidthMm,
    clearHeightMm,
    shutterWidthMm,
    shutterHeightMm,
    shutterAreaM2,
    shutterAreaSqft: shutterAreaM2 * SQFT_PER_M2,
    totalShutterAreaM2,
    totalShutterAreaSqft,
    hingesPerDoor,
    totalHinges: hingesPerDoor * count,
    holdfastsPerDoor,
    totalHoldfasts: holdfastsPerDoor * count,
    architraveLengthM: runningM * count,
    timberCost,
    shutterCost,
    totalCost: timberCost + shutterCost,
  };
}
