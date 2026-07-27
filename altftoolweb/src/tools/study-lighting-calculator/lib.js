/**
 * Study / desk lighting calculator — the lumen method.
 *
 * The lumen method (CIBSE Code for Lighting; the same arithmetic underlies the
 * illuminance schedules in EN 12464-1 and IS 3646 Part 1) sizes a lighting
 * scheme as:
 *
 *   installed lumens = (target lux x floor area) / (utilisation factor x maintenance factor)
 *
 * The utilisation factor (UF) is the share of a luminaire's bare lumens that
 * actually lands on the working plane after bouncing off ceiling, walls and
 * floor. It is read from a photometric table against the ROOM INDEX
 *
 *   K = (L x W) / (Hm x (L + W))
 *
 * where Hm is the mounting height ABOVE THE WORKING PLANE, not above the floor.
 * The maintenance factor (MF) covers lumen depreciation and dirt over the
 * cleaning cycle.
 */

/** 1 ft = 0.3048 m exactly (international foot). */
export const METRES_PER_FOOT = 0.3048;

/**
 * EN 12464-1 puts the task area for reading and writing at desk height, which
 * is taken as 0.75 m above the floor for seated work.
 */
export const WORKING_PLANE_HEIGHT_M = 0.75;

/**
 * Maintained illuminance targets, lux.
 * Source: EN 12464-1 / IS 3646 Part 1 schedules for educational and office
 * tasks. These are maintained (end-of-cycle) values, not initial values.
 */
export const TASK_PRESETS = [
  { id: "general", label: "General room lighting", lux: 300 },
  { id: "study", label: "Reading, writing, homework", lux: 500 },
  { id: "exam", label: "Long study / exam prep desk", lux: 500 },
  { id: "drawing", label: "Technical drawing, drafting", lux: 750 },
  { id: "craft", label: "Fine craft, soldering, sewing", lux: 1000 },
];

/**
 * Maintenance factors for a sealed LED luminaire on a normal cleaning cycle.
 * CIBSE LG guidance: 0.8 clean interior, 0.7 normal, 0.6 dusty/industrial.
 */
export const MAINTENANCE_FACTORS = [
  { id: "clean", label: "Clean room, cleaned yearly", value: 0.8 },
  { id: "normal", label: "Normal home, some dust", value: 0.7 },
  { id: "dusty", label: "Dusty / roadside, rarely cleaned", value: 0.6 },
];

/**
 * Utilisation factor against room index for a direct surface or recessed LED
 * luminaire with 0.70 ceiling / 0.50 wall / 0.20 floor reflectances — the
 * standard light-coloured interior column of a CIBSE UF table.
 */
export const UF_TABLE = [
  [0.6, 0.38],
  [0.8, 0.45],
  [1.0, 0.51],
  [1.25, 0.56],
  [1.5, 0.6],
  [2.0, 0.66],
  [2.5, 0.7],
  [3.0, 0.73],
  [4.0, 0.77],
  [5.0, 0.79],
];

/**
 * Dark walls and ceiling swallow the inter-reflected component. A UF table for
 * 0.50/0.30/0.20 reflectances sits roughly 12% below the light-interior column,
 * and 0.30/0.10/0.10 sits roughly 24% below.
 */
export const REFLECTANCE_PRESETS = [
  { id: "light", label: "White ceiling, light walls", factor: 1.0 },
  { id: "medium", label: "White ceiling, mid-tone walls", factor: 0.88 },
  { id: "dark", label: "Dark ceiling or dark walls", factor: 0.76 },
];

/**
 * Spacing-to-height ratio. A luminaire spaced further apart than SHR x Hm
 * leaves scallops of dim floor between fittings. 1.25 is the usual maximum
 * quoted for flat LED panels and battens.
 */
export const MAX_SPACING_TO_HEIGHT_RATIO = 1.25;

/**
 * A desk lamp throws most of its output into a small pool, but a good share is
 * still lost to the shade and the surroundings. 0.4 is a conservative utilance
 * for an adjustable task lamp roughly 400 mm above the page.
 */
export const TASK_LAMP_UTILANCE = 0.4;

/** Recommended clearance from the lamp head to the page, millimetres. */
export const TASK_LAMP_HEIGHT_MM = 400;

/** Sanity bounds so a stray keystroke cannot produce a nonsense scheme. */
export const MAX_ROOM_SIDE_M = 30;
export const MIN_ROOM_SIDE_M = 0.5;
export const MAX_TARGET_LUX = 5000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round1 = (value) => Math.round(value * 10) / 10;
const round2 = (value) => Math.round(value * 100) / 100;
const round3 = (value) => Math.round(value * 1000) / 1000;

/** Convert a length to metres. Unit is "m" or "ft". */
export function toMetres(value, unit) {
  if (!isNum(value)) return NaN;
  return unit === "ft" ? value * METRES_PER_FOOT : value;
}

/**
 * Room index K = (L x W) / (Hm x (L + W)).
 * @returns {number} K, or NaN when the geometry is unusable.
 */
export function roomIndex(lengthM, widthM, mountingHeightM) {
  if (!isNum(lengthM) || !isNum(widthM) || !isNum(mountingHeightM)) return NaN;
  if (lengthM <= 0 || widthM <= 0 || mountingHeightM <= 0) return NaN;
  return (lengthM * widthM) / (mountingHeightM * (lengthM + widthM));
}

/**
 * Linear interpolation into UF_TABLE, clamped at both ends.
 * @returns {number} Utilisation factor for the light-interior reflectance set.
 */
export function utilisationFactor(k) {
  if (!isNum(k) || k <= 0) return NaN;
  const first = UF_TABLE[0];
  const last = UF_TABLE[UF_TABLE.length - 1];
  if (k <= first[0]) return first[1];
  if (k >= last[0]) return last[1];
  for (let i = 1; i < UF_TABLE.length; i += 1) {
    const [kHi, ufHi] = UF_TABLE[i];
    if (k <= kHi) {
      const [kLo, ufLo] = UF_TABLE[i - 1];
      return ufLo + ((k - kLo) / (kHi - kLo)) * (ufHi - ufLo);
    }
  }
  return last[1];
}

/**
 * Lay N luminaires out in a grid whose proportions follow the room.
 * @returns {{rows:number, cols:number, total:number}} rows run across the width.
 */
export function luminaireGrid(count, lengthM, widthM) {
  if (!isNum(count) || count < 1) return { rows: 0, cols: 0, total: 0 };
  if (!isNum(lengthM) || !isNum(widthM) || lengthM <= 0 || widthM <= 0) {
    return { rows: 0, cols: 0, total: 0 };
  }
  const n = Math.ceil(count);
  let best = null;
  for (let cols = 1; cols <= n; cols += 1) {
    const rows = Math.ceil(n / cols);
    const total = rows * cols;
    // Spacing along each axis if we used this grid.
    const spacingAlongLength = lengthM / cols;
    const spacingAlongWidth = widthM / rows;
    // Prefer square-ish cells (even light) and as few wasted positions as possible.
    const squareness = Math.max(
      spacingAlongLength / spacingAlongWidth,
      spacingAlongWidth / spacingAlongLength,
    );
    const penalty = (total - n) * 0.35 + squareness;
    if (!best || penalty < best.penalty) best = { rows, cols, total, penalty };
  }
  return { rows: best.rows, cols: best.cols, total: best.total };
}

/**
 * Full lumen-method scheme for a study room, plus the desk-lamp top-up that an
 * ambient-only scheme would still need.
 *
 * @param {object} input
 * @param {number} input.roomLength        Room length in `unit`.
 * @param {number} input.roomWidth         Room width in `unit`.
 * @param {number} input.ceilingHeight     Floor-to-luminaire height in `unit`.
 * @param {"m"|"ft"} [input.unit]          Unit of the three lengths above.
 * @param {number} input.targetLux         Maintained lux wanted on the desk.
 * @param {number} input.ambientLux        Lux the ceiling scheme alone will provide.
 * @param {number} input.luminaireLumens   Bare lumen output of one luminaire.
 * @param {number} input.luminaireWatts    Circuit watts of one luminaire.
 * @param {number} [input.maintenanceFactor]
 * @param {number} [input.reflectanceFactor]
 * @param {number} [input.taskAreaSqm]     Area of the page/keyboard zone, m^2.
 * @returns {object} Scheme, or { error } for unusable input.
 */
export function calculateStudyLighting({
  roomLength,
  roomWidth,
  ceilingHeight,
  unit = "m",
  targetLux,
  ambientLux,
  luminaireLumens,
  luminaireWatts,
  maintenanceFactor = 0.8,
  reflectanceFactor = 1.0,
  taskAreaSqm = 0.5,
} = {}) {
  const raw = {
    roomLength,
    roomWidth,
    ceilingHeight,
    targetLux,
    ambientLux,
    luminaireLumens,
    luminaireWatts,
    maintenanceFactor,
    reflectanceFactor,
    taskAreaSqm,
  };
  if (Object.values(raw).some((value) => !isNum(value))) {
    return { error: "Enter a valid number in every field." };
  }

  const lengthM = toMetres(roomLength, unit);
  const widthM = toMetres(roomWidth, unit);
  const ceilingM = toMetres(ceilingHeight, unit);

  if (lengthM < MIN_ROOM_SIDE_M || widthM < MIN_ROOM_SIDE_M) {
    return { error: "Room length and width must each be at least 0.5 m (about 1.6 ft)." };
  }
  if (lengthM > MAX_ROOM_SIDE_M || widthM > MAX_ROOM_SIDE_M) {
    return { error: "Rooms larger than 30 m a side need a proper lighting layout, not a single grid." };
  }
  if (ceilingM <= WORKING_PLANE_HEIGHT_M) {
    return {
      error: `Ceiling height must be above the ${WORKING_PLANE_HEIGHT_M} m desk plane — check the units.`,
    };
  }
  if (ceilingM > MAX_ROOM_SIDE_M) {
    return { error: "Ceiling height looks wrong — check whether you meant feet." };
  }
  if (targetLux <= 0 || ambientLux <= 0) return { error: "Lux targets must be greater than zero." };
  if (targetLux > MAX_TARGET_LUX || ambientLux > MAX_TARGET_LUX) {
    return { error: `Targets above ${MAX_TARGET_LUX} lux are outside the range of this tool.` };
  }
  if (ambientLux > targetLux) {
    return { error: "Ambient level cannot be higher than the desk target — swap the two figures." };
  }
  if (luminaireLumens <= 0) return { error: "Luminaire output must be greater than zero lumens." };
  if (luminaireWatts <= 0) return { error: "Luminaire wattage must be greater than zero." };
  if (maintenanceFactor <= 0 || maintenanceFactor > 1) {
    return { error: "Maintenance factor must be between 0 and 1." };
  }
  if (reflectanceFactor <= 0 || reflectanceFactor > 1) {
    return { error: "Reflectance factor must be between 0 and 1." };
  }
  if (taskAreaSqm <= 0) return { error: "Task area must be greater than zero." };

  const floorAreaSqm = lengthM * widthM;
  const mountingHeightM = ceilingM - WORKING_PLANE_HEIGHT_M;
  const k = roomIndex(lengthM, widthM, mountingHeightM);
  const ufBase = utilisationFactor(k);
  const uf = ufBase * reflectanceFactor;
  const effective = uf * maintenanceFactor;

  // Scheme A: ceiling lighting alone carries the full desk target.
  const requiredLumensFull = (targetLux * floorAreaSqm) / effective;
  const countFull = Math.ceil(requiredLumensFull / luminaireLumens);
  const installedFull = countFull * luminaireLumens;
  const achievedFullLux = (installedFull * effective) / floorAreaSqm;

  // Scheme B: ceiling lighting to the ambient level, desk lamp tops the rest up.
  const requiredLumensAmbient = (ambientLux * floorAreaSqm) / effective;
  const countAmbient = Math.ceil(requiredLumensAmbient / luminaireLumens);
  const installedAmbient = countAmbient * luminaireLumens;
  const achievedAmbientLux = (installedAmbient * effective) / floorAreaSqm;
  const deficitLux = Math.max(0, targetLux - achievedAmbientLux);
  const taskLampLumens = Math.ceil((deficitLux * taskAreaSqm) / TASK_LAMP_UTILANCE);

  const grid = luminaireGrid(countFull, lengthM, widthM);
  // Luminaires sit at the centre of each grid cell, so spacing = side / count and
  // the wall offset is half a spacing.
  const spacingLengthM = grid.cols > 0 ? lengthM / grid.cols : NaN;
  const spacingWidthM = grid.rows > 0 ? widthM / grid.rows : NaN;
  const maxSpacingM = mountingHeightM * MAX_SPACING_TO_HEIGHT_RATIO;
  const spacingOk =
    Number.isFinite(spacingLengthM) &&
    Number.isFinite(spacingWidthM) &&
    spacingLengthM <= maxSpacingM &&
    spacingWidthM <= maxSpacingM;

  const totalWattsFull = countFull * luminaireWatts;
  const totalWattsAmbient = countAmbient * luminaireWatts;

  return {
    floorAreaSqm: round2(floorAreaSqm),
    lengthM: round2(lengthM),
    widthM: round2(widthM),
    ceilingM: round2(ceilingM),
    mountingHeightM: round2(mountingHeightM),
    roomIndex: round2(k),
    utilisationFactorBase: round3(ufBase),
    utilisationFactor: round3(uf),
    maintenanceFactor: round2(maintenanceFactor),
    effectiveFactor: round3(effective),

    requiredLumensFull: Math.round(requiredLumensFull),
    luminaireCountFull: countFull,
    installedLumensFull: installedFull,
    achievedLuxFull: Math.round(achievedFullLux),
    totalWattsFull: round1(totalWattsFull),
    wattsPerSqmFull: round2(totalWattsFull / floorAreaSqm),

    luminaireCountAmbient: countAmbient,
    installedLumensAmbient: installedAmbient,
    achievedAmbientLux: Math.round(achievedAmbientLux),
    totalWattsAmbient: round1(totalWattsAmbient),
    deficitLux: Math.round(deficitLux),
    taskLampLumens,
    taskLampHeightMm: TASK_LAMP_HEIGHT_MM,

    gridRows: grid.rows,
    gridCols: grid.cols,
    gridPositions: grid.total,
    spacingLengthM: round2(spacingLengthM),
    spacingWidthM: round2(spacingWidthM),
    wallOffsetLengthM: round2(spacingLengthM / 2),
    wallOffsetWidthM: round2(spacingWidthM / 2),
    maxSpacingM: round2(maxSpacingM),
    spacingOk,
  };
}
