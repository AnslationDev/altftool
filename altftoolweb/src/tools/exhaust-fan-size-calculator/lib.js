/**
 * Exhaust fan sizing.
 *
 * Core rule — the air-change method:
 *     airflow = room volume x air changes per hour (ACH)
 * expressed in m3/h, or in CFM as  volume(ft3) x ACH / 60.
 *
 * The ACH figures below are the long-standing residential ventilation rates
 * published by the Home Ventilating Institute (HVI) for each room type. They
 * are then floored by the local-exhaust minimums in ASHRAE 62.2, which requires
 * 50 CFM intermittent for a bathroom and 100 CFM intermittent for a vented
 * kitchen range hood.
 *
 * For bathrooms HVI adds a second method that governs on large rooms:
 *   - floor area up to 100 ft2: 1 CFM per square foot, never below 50 CFM
 *   - floor area above 100 ft2: add per fixture — 50 CFM each for a toilet,
 *     shower or bathtub, and 100 CFM for a jetted tub.
 * The larger of the air-change and HVI results is the requirement.
 */

/** 1 m3/h = 35.3147 ft3 / 60 min = 0.588578 CFM. */
export const CFM_PER_M3H = 0.588578;
/** 1 square metre = 10.7639 square feet. */
export const SQFT_PER_SQM = 10.7639;
/** 1 foot = 0.3048 m exactly. */
export const M_PER_FT = 0.3048;

/**
 * Residential branch ducts are sized around 4.5 m/s (roughly 900 ft/min).
 * Going faster makes the run audible; going slower wastes duct space.
 */
export const DUCT_VELOCITY_MS = 4.5;

/** HVI per-fixture allowances for bathrooms over 100 ft2, in CFM. */
export const FIXTURE_CFM = { toilet: 50, shower: 50, bathtub: 50, jettedTub: 100 };

/** Below this floor area the per-square-foot rule is used instead of fixtures. */
export const FIXTURE_METHOD_MIN_SQFT = 100;

/** HVI minimum for any bathroom, in CFM. */
export const BATHROOM_MIN_CFM = 50;

export const ROOM_TYPES = {
  bathroom: {
    key: "bathroom",
    label: "Bathroom (with shower or tub)",
    ach: 8,
    codeMinCfm: 50, // ASHRAE 62.2 intermittent local exhaust
    usesFixtures: true,
  },
  toilet: {
    key: "toilet",
    label: "Separate WC / powder room",
    ach: 10,
    codeMinCfm: 50,
    usesFixtures: true,
  },
  kitchen: {
    key: "kitchen",
    label: "Kitchen",
    ach: 15,
    codeMinCfm: 100, // ASHRAE 62.2 vented range hood, intermittent
    usesFixtures: false,
  },
  laundry: {
    key: "laundry",
    label: "Laundry / utility room",
    ach: 8,
    codeMinCfm: 50,
    usesFixtures: false,
  },
  garage: {
    key: "garage",
    label: "Garage / workshop",
    ach: 6,
    codeMinCfm: 100,
    usesFixtures: false,
  },
  general: {
    key: "general",
    label: "General room or basement",
    ach: 6,
    codeMinCfm: 50,
    usesFixtures: false,
  },
};

/**
 * Duct resistance allowance. Straight duct costs roughly 2% of airflow per
 * metre of run and each 90-degree bend roughly 5%, so a fan is chosen with
 * that much headroom over the bare requirement.
 */
export const DUCT_LOSS_PER_METRE = 0.02;
export const DUCT_LOSS_PER_ELBOW = 0.05;

/**
 * Nominal axial fan sizes with typical free-air delivery for domestic units.
 */
export const FAN_SIZES = [
  { mm: 100, inch: 4, m3h: 95 },
  { mm: 125, inch: 5, m3h: 170 },
  { mm: 150, inch: 6, m3h: 260 },
  { mm: 200, inch: 8, m3h: 480 },
  { mm: 250, inch: 10, m3h: 780 },
  { mm: 300, inch: 12, m3h: 1150 },
];

/** Standard round duct sizes stocked in both metric and imperial markets. */
export const DUCT_SIZES = [
  { mm: 100, inch: 4 },
  { mm: 125, inch: 5 },
  { mm: 150, inch: 6 },
  { mm: 180, inch: 7 },
  { mm: 200, inch: 8 },
  { mm: 250, inch: 10 },
  { mm: 300, inch: 12 },
];

const round = (value, decimals = 0) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

/**
 * Size an exhaust fan.
 *
 * @param {object} input
 * @param {number|string} input.length      room length
 * @param {number|string} input.width       room width
 * @param {number|string} input.height      ceiling height
 * @param {"m"|"ft"} input.unit             unit the dimensions are given in
 * @param {string} input.roomType           key of ROOM_TYPES
 * @param {number|string} input.ductLength  duct run length in metres
 * @param {number|string} input.elbows      number of 90-degree bends
 * @param {object} [input.fixtures]         { toilet, shower, bathtub, jettedTub } counts
 * @returns {object} sizing result, or { error } for invalid input
 */
export function sizeExhaustFan({
  length,
  width,
  height,
  unit = "m",
  roomType = "bathroom",
  ductLength = 3,
  elbows = 2,
  fixtures = {},
}) {
  const l = toNumber(length);
  const w = toNumber(width);
  const h = toNumber(height);
  const duct = toNumber(ductLength);
  const bends = toNumber(elbows);

  if ([l, w, h, duct, bends].some((value) => Number.isNaN(value))) {
    return { error: "Enter valid numbers for the room, duct run and bends." };
  }
  if (unit !== "m" && unit !== "ft") return { error: "Unit must be metres or feet." };

  const room = ROOM_TYPES[roomType];
  if (!room) return { error: "Choose one of the listed room types." };

  if (l <= 0 || w <= 0 || h <= 0) {
    return { error: "Room length, width and height must all be greater than zero." };
  }
  if (duct < 0 || bends < 0) return { error: "Duct length and bend count cannot be negative." };
  if (bends > 12) return { error: "More than 12 bends means the duct needs redesigning, not a bigger fan." };

  const factor = unit === "ft" ? M_PER_FT : 1;
  const lengthM = l * factor;
  const widthM = w * factor;
  const heightM = h * factor;

  if (heightM > 10) return { error: "Ceiling height above 10 m is outside residential fan sizing." };

  const volumeM3 = lengthM * widthM * heightM;
  if (volumeM3 > 3000) {
    return { error: "Rooms above 3,000 m³ need a commercial ventilation design." };
  }

  const floorSqm = lengthM * widthM;
  const floorSqft = floorSqm * SQFT_PER_SQM;

  // Method 1 — air changes per hour.
  const achM3h = volumeM3 * room.ach;
  const achCfm = achM3h * CFM_PER_M3H;

  // Method 2 — HVI bathroom rules, or the flat code minimum elsewhere.
  const fixtureCounts = {
    toilet: Math.max(0, toNumber(fixtures.toilet ?? 0) || 0),
    shower: Math.max(0, toNumber(fixtures.shower ?? 0) || 0),
    bathtub: Math.max(0, toNumber(fixtures.bathtub ?? 0) || 0),
    jettedTub: Math.max(0, toNumber(fixtures.jettedTub ?? 0) || 0),
  };
  const fixtureCfm =
    fixtureCounts.toilet * FIXTURE_CFM.toilet +
    fixtureCounts.shower * FIXTURE_CFM.shower +
    fixtureCounts.bathtub * FIXTURE_CFM.bathtub +
    fixtureCounts.jettedTub * FIXTURE_CFM.jettedTub;

  let hviCfm;
  let hviMethod;
  if (room.usesFixtures && floorSqft > FIXTURE_METHOD_MIN_SQFT) {
    hviCfm = Math.max(fixtureCfm, BATHROOM_MIN_CFM);
    hviMethod = "HVI per-fixture rule (room is over 100 ft²)";
  } else if (room.usesFixtures) {
    hviCfm = Math.max(floorSqft, BATHROOM_MIN_CFM);
    hviMethod = "HVI 1 CFM per ft² of floor, 50 CFM minimum";
  } else {
    hviCfm = room.codeMinCfm;
    hviMethod = "ASHRAE 62.2 intermittent local exhaust minimum";
  }

  const requiredCfm = Math.max(achCfm, hviCfm, room.codeMinCfm);
  const requiredM3h = requiredCfm / CFM_PER_M3H;
  const governing =
    achCfm >= hviCfm && achCfm >= room.codeMinCfm
      ? `Air-change method at ${room.ach} ACH`
      : hviCfm >= room.codeMinCfm
        ? hviMethod
        : "ASHRAE 62.2 intermittent local exhaust minimum";

  // Duct resistance headroom.
  const lossFactor = 1 + duct * DUCT_LOSS_PER_METRE + bends * DUCT_LOSS_PER_ELBOW;
  const ratedM3h = requiredM3h * lossFactor;
  const ratedCfm = ratedM3h * CFM_PER_M3H;

  // Duct diameter from continuity: A = Q / v, then d = sqrt(4A / pi).
  const areaM2 = ratedM3h / 3600 / DUCT_VELOCITY_MS;
  const exactDuctMm = Math.sqrt((4 * areaM2) / Math.PI) * 1000;
  const duct_ = DUCT_SIZES.find((size) => size.mm >= exactDuctMm) ?? null;

  const fan = FAN_SIZES.find((size) => size.m3h >= ratedM3h) ?? null;

  return {
    roomLabel: room.label,
    ach: room.ach,
    volumeM3: round(volumeM3, 2),
    volumeFt3: round(volumeM3 * 35.3147, 0),
    floorSqm: round(floorSqm, 2),
    floorSqft: round(floorSqft, 1),
    achCfm: round(achCfm, 0),
    hviCfm: round(hviCfm, 0),
    hviMethod,
    governing,
    requiredCfm: round(requiredCfm, 0),
    requiredM3h: round(requiredM3h, 0),
    lossFactor: round(lossFactor, 2),
    ratedCfm: round(ratedCfm, 0),
    ratedM3h: round(ratedM3h, 0),
    exactDuctMm: round(exactDuctMm, 1),
    ductMm: duct_ ? duct_.mm : null,
    ductInch: duct_ ? duct_.inch : null,
    fanMm: fan ? fan.mm : null,
    fanInch: fan ? fan.inch : null,
    fanTypicalM3h: fan ? fan.m3h : null,
    oversized: !fan,
    /** Minutes for the fan to move one full room volume at the required rate. */
    airChangeMinutes: round(60 / room.ach, 1),
  };
}
