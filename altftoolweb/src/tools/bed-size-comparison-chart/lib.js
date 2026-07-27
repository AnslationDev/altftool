/**
 * Bed / mattress size reference data and comparison maths.
 *
 * Each standard defines its sizes in its own native unit, so the native unit is
 * stored as the source of truth and the other unit is derived. US and Indian
 * retail sizes are quoted in whole inches; UK and EU trade sizes are quoted in
 * whole centimetres (the UK also keeps an imperial nickname such as "4ft 6").
 */

/** Exact international inch: 1 in = 2.54 cm (defined, not measured). */
export const CM_PER_INCH = 2.54;

/** 1 sq ft = 12 in x 12 in = 30.48 cm x 30.48 cm = 929.0304 sq cm. */
export const SQ_CM_PER_SQ_FT = 30.48 * 30.48;

/** 1 sq m = 100 cm x 100 cm. */
export const SQ_CM_PER_SQ_M = 10000;

/**
 * Circulation clearance around a bed. Interior-planning guidance commonly puts
 * comfortable walking space at about 60 cm (24 in) on each side you use, with
 * roughly 45 cm (18 in) as the workable squeeze.
 */
export const CLEARANCE_COMFORT_CM = 60;
export const CLEARANCE_MIN_CM = 45;

export const REGIONS = [
  { id: "india", label: "India" },
  { id: "us", label: "United States" },
  { id: "uk", label: "United Kingdom" },
  { id: "eu", label: "Europe (EU)" },
];

/**
 * unit: the unit the standard itself is written in.
 * w / l: width and length in that native unit.
 */
export const BED_SIZES = [
  // ---- India: mainstream mattress-brand retail sizes (inches) ----
  {
    id: "india-single",
    region: "india",
    label: "Single",
    unit: "in",
    w: 36,
    l: 72,
    note: "Also stocked in 75 in and 78 in lengths; 30 in and 35 in widths exist as narrow singles.",
  },
  {
    id: "india-double",
    region: "india",
    label: "Double",
    unit: "in",
    w: 48,
    l: 72,
    note: "Sometimes sold as 4ft or 'diwan' size; 75 in length is the common alternative.",
  },
  {
    id: "india-queen",
    region: "india",
    label: "Queen",
    unit: "in",
    w: 60,
    l: 78,
    note: "The default Indian double-bed size; 72 in and 75 in lengths also exist.",
  },
  {
    id: "india-king",
    region: "india",
    label: "King",
    unit: "in",
    w: 72,
    l: 78,
    note: "Indian king is narrower than a US king (76 in) but 2 in shorter as well.",
  },

  // ---- United States (inches) ----
  { id: "us-twin", region: "us", label: "Twin", unit: "in", w: 38, l: 75, note: "The US single; standard for bunk beds." },
  { id: "us-twin-xl", region: "us", label: "Twin XL", unit: "in", w: 38, l: 80, note: "Same width as Twin, 5 in longer; two of them make a King." },
  { id: "us-full", region: "us", label: "Full / Double", unit: "in", w: 54, l: 75, note: "Only 27 in per sleeper when shared." },
  { id: "us-queen", region: "us", label: "Queen", unit: "in", w: 60, l: 80, note: "The best-selling US size; 30 in per sleeper." },
  { id: "us-king", region: "us", label: "King (Eastern)", unit: "in", w: 76, l: 80, note: "38 in per sleeper - the width of a Twin each." },
  { id: "us-cal-king", region: "us", label: "California King", unit: "in", w: 72, l: 84, note: "4 in narrower but 4 in longer than a standard King." },

  // ---- United Kingdom (centimetres, with imperial trade nickname) ----
  { id: "uk-small-single", region: "uk", label: "Small Single", unit: "cm", w: 75, l: 190, note: "Trade name 2ft 6." },
  { id: "uk-single", region: "uk", label: "Single", unit: "cm", w: 90, l: 190, note: "Trade name 3ft 0." },
  { id: "uk-small-double", region: "uk", label: "Small Double", unit: "cm", w: 120, l: 190, note: "Trade name 4ft 0, often called a 'queen' by UK retailers." },
  { id: "uk-double", region: "uk", label: "Double", unit: "cm", w: 135, l: 190, note: "Trade name 4ft 6 - the UK's standard couple's bed." },
  { id: "uk-king", region: "uk", label: "King", unit: "cm", w: 150, l: 200, note: "Trade name 5ft 0. Narrower than a US King." },
  { id: "uk-super-king", region: "uk", label: "Super King", unit: "cm", w: 180, l: 200, note: "Trade name 6ft 0." },

  // ---- Europe (centimetres) ----
  { id: "eu-single", region: "eu", label: "Single", unit: "cm", w: 90, l: 200, note: "Same width as a UK single but 10 cm longer." },
  { id: "eu-small-double", region: "eu", label: "Small Double", unit: "cm", w: 140, l: 200, note: "The common continental double." },
  { id: "eu-queen", region: "eu", label: "Queen / Double", unit: "cm", w: 160, l: 200, note: "Often built as two 80 x 200 cm mattresses side by side." },
  { id: "eu-king", region: "eu", label: "King", unit: "cm", w: 180, l: 200, note: "Often two 90 x 200 cm mattresses on one base." },
  { id: "eu-grand-king", region: "eu", label: "Grand King", unit: "cm", w: 200, l: 200, note: "A square bed - 200 cm each way." },
];

const round = (value, dp) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

/** Native dimensions converted to both units. Never throws. */
function toBoth(size) {
  const widthCm = size.unit === "cm" ? size.w : size.w * CM_PER_INCH;
  const lengthCm = size.unit === "cm" ? size.l : size.l * CM_PER_INCH;
  return {
    widthCm: round(widthCm, 1),
    lengthCm: round(lengthCm, 1),
    widthIn: round(widthCm / CM_PER_INCH, 1),
    lengthIn: round(lengthCm / CM_PER_INCH, 1),
  };
}

export function getRegionLabel(regionId) {
  const region = REGIONS.find((item) => item.id === regionId);
  return region ? region.label : regionId;
}

export function sizesForRegion(regionId) {
  return BED_SIZES.filter((size) => size.region === regionId);
}

export function getSize(sizeId) {
  return BED_SIZES.find((size) => size.id === sizeId) || null;
}

/**
 * Full description of one bed size.
 * @returns {{error:string}|object}
 */
export function describeSize(sizeId) {
  const size = getSize(sizeId);
  if (!size) return { error: "Pick a bed size from the list." };

  const dims = toBoth(size);
  const areaSqCm = dims.widthCm * dims.lengthCm;

  return {
    id: size.id,
    region: size.region,
    regionLabel: getRegionLabel(size.region),
    label: size.label,
    note: size.note,
    nativeUnit: size.unit,
    ...dims,
    widthFt: round(dims.widthIn / 12, 2),
    lengthFt: round(dims.lengthIn / 12, 2),
    areaSqM: round(areaSqCm / SQ_CM_PER_SQ_M, 2),
    areaSqFt: round(areaSqCm / SQ_CM_PER_SQ_FT, 1),
    // Shared width per sleeper if two adults use the bed.
    perSleeperWidthCm: round(dims.widthCm / 2, 1),
    perSleeperWidthIn: round(dims.widthIn / 2, 1),
  };
}

/**
 * Closest size in every region, ranked by total centimetre difference
 * (|width difference| + |length difference|).
 */
export function compareAcrossRegions(sizeId) {
  const base = describeSize(sizeId);
  if (base.error) return base;

  const rows = REGIONS.map((region) => {
    const candidates = sizesForRegion(region.id);
    let best = null;
    let bestScore = Infinity;

    candidates.forEach((candidate) => {
      const dims = toBoth(candidate);
      const score =
        Math.abs(dims.widthCm - base.widthCm) + Math.abs(dims.lengthCm - base.lengthCm);
      if (score < bestScore) {
        bestScore = score;
        best = { candidate, dims };
      }
    });

    if (!best) return null;

    return {
      regionId: region.id,
      regionLabel: region.label,
      sizeId: best.candidate.id,
      label: best.candidate.label,
      isSameSize: best.candidate.id === base.id,
      widthCm: best.dims.widthCm,
      lengthCm: best.dims.lengthCm,
      widthIn: best.dims.widthIn,
      lengthIn: best.dims.lengthIn,
      widthDiffCm: round(best.dims.widthCm - base.widthCm, 1),
      lengthDiffCm: round(best.dims.lengthCm - base.lengthCm, 1),
      totalDiffCm: round(bestScore, 1),
      // An exact match is any pair within half a centimetre on both sides.
      isExact: Math.abs(best.dims.widthCm - base.widthCm) <= 0.5 &&
        Math.abs(best.dims.lengthCm - base.lengthCm) <= 0.5,
    };
  }).filter(Boolean);

  return { base, rows };
}

/**
 * Does the bed leave usable walking space in a given room?
 * @param {object} input
 * @param {string} input.sizeId
 * @param {number} input.roomWidthCm  wall-to-wall width, the direction the bed's width runs
 * @param {number} input.roomLengthCm wall-to-wall length, headboard to foot
 * @param {boolean} input.headAgainstWall true if the head of the bed sits against a wall
 */
export function fitRoom({ sizeId, roomWidthCm, roomLengthCm, headAgainstWall = true }) {
  const base = describeSize(sizeId);
  if (base.error) return base;

  const width = Number(roomWidthCm);
  const length = Number(roomLengthCm);

  if (!Number.isFinite(width) || !Number.isFinite(length)) {
    return { error: "Enter the room width and length as numbers in centimetres." };
  }
  if (width <= 0 || length <= 0) {
    return { error: "Room width and length must both be greater than zero." };
  }
  if (width > 3000 || length > 3000) {
    return { error: "Room dimensions above 30 m are outside this planner's range." };
  }

  // Sides needing clearance: both long sides always; the foot always; the head
  // only when the bed is not pushed against a wall.
  const widthSides = 2;
  const lengthSides = headAgainstWall ? 1 : 2;

  const spareWidthCm = round(width - base.widthCm, 1);
  const spareLengthCm = round(length - base.lengthCm, 1);
  const clearanceEachSideCm = round(spareWidthCm / widthSides, 1);
  const clearanceEachEndCm = round(spareLengthCm / lengthSides, 1);

  const fits = spareWidthCm >= 0 && spareLengthCm >= 0;
  const worstClearanceCm = Math.min(clearanceEachSideCm, clearanceEachEndCm);

  let verdict;
  if (!fits) verdict = "too-small";
  else if (worstClearanceCm >= CLEARANCE_COMFORT_CM) verdict = "comfortable";
  else if (worstClearanceCm >= CLEARANCE_MIN_CM) verdict = "workable";
  else verdict = "tight";

  const roomAreaSqM = round((width * length) / SQ_CM_PER_SQ_M, 2);

  return {
    base,
    fits,
    verdict,
    spareWidthCm,
    spareLengthCm,
    clearanceEachSideCm,
    clearanceEachEndCm,
    worstClearanceCm: round(worstClearanceCm, 1),
    roomAreaSqM,
    bedShareOfRoomPct: roomAreaSqM > 0 ? round((base.areaSqM / roomAreaSqM) * 100, 1) : 0,
    headAgainstWall,
    needsWidthCm: round(base.widthCm + widthSides * CLEARANCE_COMFORT_CM, 1),
    needsLengthCm: round(base.lengthCm + lengthSides * CLEARANCE_COMFORT_CM, 1),
  };
}
