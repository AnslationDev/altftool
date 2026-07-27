/**
 * Ceiling fan sizing.
 *
 * Two independent questions decide a ceiling fan: how wide it should be (sweep,
 * chosen from floor area so the moving column of air covers the room) and how far
 * it should hang (downrod, chosen so the blades sit at a comfortable height without
 * being choked against the ceiling).
 *
 * The sweep bands below follow the long-standing floor-area guidance used by fan
 * makers and by ENERGY STAR's sizing table, converted to metric. The air delivery
 * figures are the values a fan of that sweep is typically rated at; IS 374, the
 * Indian standard for ceiling fans, sets 210 m³/min as the minimum air delivery for
 * a 1200 mm fan, which is the reference point for the rest.
 */

export const SWEEP_OPTIONS = [
  { sweepMm: 600, inches: 24, airDeliveryCmm: 65, maxAreaM2: 3.5 },
  { sweepMm: 750, inches: 30, airDeliveryCmm: 90, maxAreaM2: 5 },
  { sweepMm: 900, inches: 36, airDeliveryCmm: 130, maxAreaM2: 7 },
  { sweepMm: 1050, inches: 42, airDeliveryCmm: 160, maxAreaM2: 9.5 },
  { sweepMm: 1200, inches: 48, airDeliveryCmm: 210, maxAreaM2: 13.5 },
  { sweepMm: 1400, inches: 56, airDeliveryCmm: 250, maxAreaM2: 21 },
  { sweepMm: 1500, inches: 60, airDeliveryCmm: 270, maxAreaM2: 26 },
];

/** Sweep used when a room is too large for one fan, so the load is split. */
const MULTI_FAN_OPTION = SWEEP_OPTIONS.find((option) => option.sweepMm === 1400);

/** Blades this high above the floor give good airflow without being a head hazard. */
export const TARGET_BLADE_HEIGHT_M = 2.4;

/** Absolute minimum blade height for safety; below this, use a wall or pedestal fan. */
export const MIN_BLADE_HEIGHT_M = 2.1;

/** Ceiling to blade plane with the short rod supplied in the box, for a standard fan. */
export const STANDARD_MOTOR_DROP_M = 0.3;

/** Blade tip to the nearest wall. Closer than this and the fan stalls against the wall. */
export const MIN_WALL_CLEARANCE_M = 0.45;

/** Downrod lengths sold off the shelf, in mm. */
export const STANDARD_DOWNRODS_MM = [0, 100, 150, 250, 300, 450, 600, 900, 1200];

const MAX_ROOM_SIDE_M = 30;
const MAX_CEILING_HEIGHT_M = 6;

/** Largest standard downrod that does not exceed the ideal length. */
export function nearestDownrodMm(idealMm) {
  let chosen = STANDARD_DOWNRODS_MM[0];
  for (const value of STANDARD_DOWNRODS_MM) {
    if (value <= idealMm) chosen = value;
  }
  return chosen;
}

/**
 * @returns {{error:string}|object} sweep, fan count, downrod and airflow check
 */
export function selectCeilingFan({ roomLengthM, roomWidthM, ceilingHeightM }) {
  const numbers = [roomLengthM, roomWidthM, ceilingHeightM];
  if (numbers.some((v) => typeof v !== "number" || !Number.isFinite(v))) {
    return { error: "Enter a valid number for length, width and ceiling height." };
  }
  if (roomLengthM <= 0 || roomWidthM <= 0) {
    return { error: "Room length and width must both be greater than zero." };
  }
  if (roomLengthM > MAX_ROOM_SIDE_M || roomWidthM > MAX_ROOM_SIDE_M) {
    return { error: `Each room side must be ${MAX_ROOM_SIDE_M} m or less.` };
  }
  if (ceilingHeightM < 2 || ceilingHeightM > MAX_CEILING_HEIGHT_M) {
    return { error: `Ceiling height must be between 2 m and ${MAX_CEILING_HEIGHT_M} m.` };
  }

  const areaM2 = roomLengthM * roomWidthM;
  const volumeM3 = areaM2 * ceilingHeightM;
  const largest = SWEEP_OPTIONS[SWEEP_OPTIONS.length - 1];

  let option;
  let fanCount;
  if (areaM2 <= largest.maxAreaM2) {
    option = SWEEP_OPTIONS.find((item) => areaM2 <= item.maxAreaM2) ?? largest;
    fanCount = 1;
  } else {
    // Too big for a single fan: split the area across 1400 mm fans, which is the
    // largest sweep still widely available with a matching regulator.
    option = MULTI_FAN_OPTION;
    fanCount = Math.ceil((areaM2 - 1e-9) / MULTI_FAN_OPTION.maxAreaM2);
  }

  const totalAirDeliveryCmm = option.airDeliveryCmm * fanCount;
  const airChangesPerMinute = volumeM3 > 0 ? totalAirDeliveryCmm / volumeM3 : 0;

  const idealDownrodM = ceilingHeightM - TARGET_BLADE_HEIGHT_M - STANDARD_MOTOR_DROP_M;
  const downrodMm = idealDownrodM > 0 ? nearestDownrodMm(idealDownrodM * 1000) : 0;
  const bladeHeightM = ceilingHeightM - STANDARD_MOTOR_DROP_M - downrodMm / 1000;

  const shortestSideM = Math.min(roomLengthM, roomWidthM);
  const neededSideM = option.sweepMm / 1000 + 2 * MIN_WALL_CLEARANCE_M;

  const warnings = [];
  if (bladeHeightM < MIN_BLADE_HEIGHT_M) {
    warnings.push(
      `Blades would sit only ${bladeHeightM.toFixed(2)} m above the floor. Use a low-profile (flush or hugger) fan, or a wall-mounted fan instead.`,
    );
  }
  if (idealDownrodM > 1.2) {
    warnings.push(
      "The ceiling is high enough to need a downrod longer than 1200 mm — order an extension rod with the fan rather than hanging it flush.",
    );
  }
  if (shortestSideM < neededSideM) {
    warnings.push(
      `A ${option.sweepMm} mm fan needs a room at least ${neededSideM.toFixed(2)} m across to keep ${Math.round(MIN_WALL_CLEARANCE_M * 100)} cm of blade-to-wall clearance; your shortest side is ${shortestSideM.toFixed(2)} m.`,
    );
  }
  if (fanCount > 1) {
    warnings.push(
      `${fanCount} fans are needed for this floor area — space them about ${(Math.max(roomLengthM, roomWidthM) / fanCount).toFixed(1)} m apart along the long axis.`,
    );
  }

  return {
    areaM2,
    volumeM3,
    sweepMm: option.sweepMm,
    sweepInches: option.inches,
    fanCount,
    airDeliveryPerFanCmm: option.airDeliveryCmm,
    totalAirDeliveryCmm,
    airChangesPerMinute,
    airChangesPerHour: airChangesPerMinute * 60,
    idealDownrodMm: Math.max(0, idealDownrodM * 1000),
    downrodMm,
    bladeHeightM,
    minWallClearanceNeededM: neededSideM,
    shortestSideM,
    warnings,
  };
}
