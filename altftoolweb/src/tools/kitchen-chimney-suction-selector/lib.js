/**
 * Kitchen chimney (range hood) suction sizing.
 *
 * The airflow a kitchen needs is set by how many times an hour its air has to
 * be replaced:
 *
 *   airflow at the hood (m3/h) = kitchen volume (m3) x air changes per hour
 *
 * Ten to fifteen air changes an hour is the range published for domestic
 * kitchens; the top of that range is the one to use for Indian cooking, where
 * tempering and deep frying release oil aerosol in short bursts.
 *
 * Two corrections then separate that from the number printed on the box:
 *
 * 1. Capture. A hood only catches the plume that reaches it. More burners
 *    running and an open-plan layout — where cross-draughts pull the plume
 *    sideways — both need extra flow to capture the same smoke.
 *
 * 2. Duct resistance. Manufacturers quote suction as FREE AIR delivery, with
 *    no duct attached. Every metre of pipe and every bend costs flow, so the
 *    rating you must shop for is the required flow divided by the fraction the
 *    duct actually lets through.
 *
 *      rated = volume x ACH x burnerFactor x layoutFactor / ductEfficiency
 *
 * Finally the recommendation adds headroom so the chimney does the job on a
 * lower, quieter speed instead of screaming at maximum every evening.
 */

/** Air changes per hour by how heavily the kitchen is used. */
export const COOKING_INTENSITIES = [
  { id: "light", label: "Light — boiling, steaming, occasional cooking", ach: 10 },
  { id: "moderate", label: "Moderate — daily cooking, some frying", ach: 12 },
  { id: "heavy", label: "Heavy — daily tadka, deep frying, tandoor", ach: 15 },
];

/** Extra capture flow as more burners run at once. */
export const BURNER_FACTORS = [
  { burners: 2, factor: 1.0 },
  { burners: 3, factor: 1.08 },
  { burners: 4, factor: 1.15 },
  { burners: 5, factor: 1.22 },
];

/** Cross-draughts in an open kitchen scatter the plume before it is captured. */
export const LAYOUTS = [
  { id: "closed", label: "Closed kitchen with a door", factor: 1.0 },
  { id: "semi", label: "Semi-open, wide doorway or pass-through", factor: 1.15 },
  { id: "open", label: "Open plan, joined to the living area", factor: 1.3 },
];

/** Base free-air-to-installed efficiency before duct length and bends. */
export const DUCT_BASE_EFFICIENCY = 0.9;

/** Flow lost per straight metre of duct. */
export const LOSS_PER_METRE = 0.04;

/** Flow retained across each 90 degree bend. */
export const RETAINED_PER_BEND = 0.93;

/** Efficiency floor — below this the installation is not worth modelling. */
export const MIN_DUCT_EFFICIENCY = 0.3;

/** Recirculating (ductless) hoods push air through a charcoal filter instead. */
export const RECIRCULATION_EFFICIENCY = 0.5;

/** Headroom so the chimney runs on speed 1-2 rather than flat out. */
export const QUIET_HEADROOM = 1.25;

/** Suction ratings, in m3/h, that chimneys are actually sold at. */
export const STANDARD_SUCTION = [700, 800, 900, 1000, 1100, 1200, 1350, 1500, 1600, 1800, 2000];

/** Chimney widths sold, in cm. The chimney must be at least as wide as the hob. */
export const STANDARD_WIDTHS_CM = [60, 75, 90];

/** Installation height above the hob, in cm — the usual manufacturer window. */
export const MOUNT_HEIGHT_CM = [65, 75];

export const MAX_DIMENSION_M = 20;
export const MAX_DUCT_METRES = 15;
export const MAX_BENDS = 6;

/** Fraction of free-air suction that reaches the kitchen through a real duct. */
export function ductEfficiency({ ducted = true, metres = 0, bends = 0 }) {
  if (!ducted) return RECIRCULATION_EFFICIENCY;
  const m = Number(metres);
  const b = Number(bends);
  if (!Number.isFinite(m) || !Number.isFinite(b) || m < 0 || b < 0) return null;
  const raw = DUCT_BASE_EFFICIENCY * (1 - LOSS_PER_METRE * m) * Math.pow(RETAINED_PER_BEND, b);
  return Math.max(MIN_DUCT_EFFICIENCY, raw);
}

export function nextSuction(value) {
  return STANDARD_SUCTION.find((s) => s >= value - 1e-9) ?? null;
}

export function chimneyWidthFor(hobWidthCm) {
  const w = Number(hobWidthCm);
  if (!Number.isFinite(w) || w <= 0) return null;
  return STANDARD_WIDTHS_CM.find((width) => width >= w) ?? null;
}

function burnerFactorFor(burners) {
  const b = Number(burners);
  const exact = BURNER_FACTORS.find((entry) => entry.burners === b);
  if (exact) return exact.factor;
  if (b <= BURNER_FACTORS[0].burners) return BURNER_FACTORS[0].factor;
  return BURNER_FACTORS[BURNER_FACTORS.length - 1].factor;
}

/**
 * @param {object} input
 * @param {number} input.lengthM     Kitchen length in metres.
 * @param {number} input.widthM      Kitchen width in metres.
 * @param {number} input.heightM     Floor to ceiling height in metres.
 * @param {string} input.intensity   id from COOKING_INTENSITIES.
 * @param {number} input.burners     Burners on the hob.
 * @param {string} input.layout      id from LAYOUTS.
 * @param {boolean} input.ducted     False for a recirculating hood.
 * @param {number} input.ductMetres  Straight duct length.
 * @param {number} input.bends       Number of 90 degree bends.
 * @param {number} input.hobWidthCm  Hob width for the chimney width check.
 * @returns {object} sizing breakdown or { error }.
 */
export function selectChimney({
  lengthM,
  widthM,
  heightM,
  intensity = "heavy",
  burners = 4,
  layout = "closed",
  ducted = true,
  ductMetres = 3,
  bends = 2,
  hobWidthCm = 60,
}) {
  const l = Number(lengthM);
  const w = Number(widthM);
  const h = Number(heightM);
  const b = Number(burners);
  const duct = Number(ductMetres);
  const bendCount = Number(bends);
  const hob = Number(hobWidthCm);

  const cook = COOKING_INTENSITIES.find((c) => c.id === intensity);
  const lay = LAYOUTS.find((entry) => entry.id === layout);

  if (![l, w, h, b, duct, bendCount, hob].every((n) => Number.isFinite(n))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (!cook || !lay) return { error: "Choose a cooking intensity and a kitchen layout." };
  if (!(l > 0) || !(w > 0) || !(h > 0)) {
    return { error: "Kitchen length, width and height must all be greater than zero." };
  }
  if (l > MAX_DIMENSION_M || w > MAX_DIMENSION_M || h > MAX_DIMENSION_M) {
    return { error: `Each kitchen dimension should be under ${MAX_DIMENSION_M} m.` };
  }
  if (!(b >= 1) || b > 8 || !Number.isInteger(b)) {
    return { error: "Enter a whole number of burners between 1 and 8." };
  }
  if (duct < 0 || duct > MAX_DUCT_METRES) {
    return { error: `Duct length should be between 0 and ${MAX_DUCT_METRES} m.` };
  }
  if (bendCount < 0 || bendCount > MAX_BENDS || !Number.isInteger(bendCount)) {
    return { error: `Enter a whole number of bends between 0 and ${MAX_BENDS}.` };
  }
  if (!(hob >= 30) || hob > 150) {
    return { error: "Hob width should be between 30 cm and 150 cm." };
  }

  const volume = l * w * h;
  const baseAirflow = volume * cook.ach;
  const burnerFactor = burnerFactorFor(b);
  const captureAirflow = baseAirflow * burnerFactor * lay.factor;

  const efficiency = ductEfficiency({ ducted, metres: duct, bends: bendCount });
  if (efficiency === null || !(efficiency > 0)) {
    return { error: "Check the duct length and number of bends." };
  }

  const ratedRequired = captureAirflow / efficiency;
  const withHeadroom = ratedRequired * QUIET_HEADROOM;

  const largest = STANDARD_SUCTION[STANDARD_SUCTION.length - 1];
  const match = nextSuction(withHeadroom);
  const recommended = match ?? largest;

  const width = chimneyWidthFor(hob);

  return {
    volume,
    ach: cook.ach,
    baseAirflow,
    burnerFactor,
    layoutFactor: lay.factor,
    captureAirflow,
    ductEfficiency: efficiency,
    ductEfficiencyPct: efficiency * 100,
    ductLossPct: (1 - efficiency) * 100,
    ratedRequired,
    withHeadroom,
    recommended,
    exceedsCatalogue: match === null,
    minimumRating: nextSuction(ratedRequired) ?? largest,
    chimneyWidthCm: width,
    widthWarning: width === null,
    mountHeightCm: MOUNT_HEIGHT_CM,
    ducted,
  };
}
