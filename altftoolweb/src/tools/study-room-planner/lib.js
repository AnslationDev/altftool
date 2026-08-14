/**
 * Study room layout: desk run, chair clearance, shelving and lighting.
 *
 * Lighting uses the lumen method, the standard way a lighting designer sizes a
 * room:
 *
 *   total lumens = (target illuminance in lux * floor area in m^2)
 *                  / (utilisation factor * maintenance factor)
 *
 * Illuminance targets follow the reading/writing category in the interior
 * lighting recommendations (EN 12464-1 and IS 3646): 300 lux of general light in
 * the room and 500 lux on the task area where reading and writing actually
 * happen.
 *
 * Furniture clearances are the ergonomic minimums used in furniture layout
 * practice: 600 mm of desk depth for a monitor, 900 mm behind the desk edge for
 * the chair to be pushed back and sat in, and 750 mm for a walkway.
 */

/** Illuminance targets in lux for a study, from the reading/writing task category. */
export const AMBIENT_LUX_TARGET = 300;
export const TASK_LUX_TARGET = 500;

/**
 * Utilisation factor: the share of a lamp's lumens that lands on the working
 * plane. 0.5 is a fair value for a small room with light walls and a ceiling
 * fitting; a desk lamp sitting on the task gets almost all of it, so 0.9.
 */
export const AMBIENT_UTILISATION_FACTOR = 0.5;
export const TASK_UTILISATION_FACTOR = 0.9;

/** Maintenance factor allows for lumen depreciation and dust over the life of the lamp. */
export const MAINTENANCE_FACTOR = 0.8;

/** Ergonomic furniture minimums, in millimetres. */
export const DESK_DEPTH_MIN_MM = 600;
export const DESK_DEPTH_COMFORT_MM = 750;
export const DESK_WIDTH_PER_USER_MM = 1200;
export const DESK_WIDTH_MIN_PER_USER_MM = 750;
export const CHAIR_CLEARANCE_MM = 900;
export const WALKWAY_MM = 750;

/** Shelving: an average book spine is about 30 mm, and a shelf bay spans 900 mm. */
export const AVERAGE_BOOK_SPINE_MM = 30;
export const SHELF_BAY_WIDTH_MM = 900;
export const SHELVES_PER_BAY = 5;

/**
 * Anthropometric rules of thumb used in ergonomics guides: seat height is about
 * a quarter of standing height and desk (elbow) height about 0.42 of it. Use them
 * as a starting point and adjust to the person actually sitting there.
 */
export const SEAT_HEIGHT_RATIO = 0.25;
export const DESK_HEIGHT_RATIO = 0.42;

/** Comfortable eye-to-screen distance for a 22-27 inch monitor, in millimetres. */
export const SCREEN_DISTANCE_MIN_MM = 600;
export const SCREEN_DISTANCE_MAX_MM = 750;

const MAX_ROOM_SIDE_M = 30;
const MAX_USERS = 6;

/**
 * @returns {{error:string}|object}
 */
export function planStudyRoom({
  lengthM,
  widthM,
  users = 1,
  books = 0,
  userHeightCm = 170,
  fixtureLumens = 1200,
}) {
  const numbers = [lengthM, widthM, users, books, userHeightCm, fixtureLumens];
  if (numbers.some((n) => typeof n !== "number" || !Number.isFinite(n))) {
    return { error: "Enter a valid number in every field." };
  }
  if (lengthM <= 0 || widthM <= 0) {
    return { error: "Room length and width must both be greater than zero." };
  }
  if (lengthM > MAX_ROOM_SIDE_M || widthM > MAX_ROOM_SIDE_M) {
    return { error: `Each room side must be ${MAX_ROOM_SIDE_M} m or less.` };
  }
  if (!Number.isInteger(users) || users < 1 || users > MAX_USERS) {
    return { error: `Number of people using the room must be a whole number from 1 to ${MAX_USERS}.` };
  }
  if (books < 0) return { error: "Book count cannot be negative." };
  if (books > 5000) return { error: "Book count above 5,000 needs a library layout, not a study." };
  if (userHeightCm < 100 || userHeightCm > 220) {
    return { error: "Enter a standing height between 100 cm and 220 cm." };
  }
  if (fixtureLumens < 100 || fixtureLumens > 20000) {
    return { error: "Light output per fitting should be between 100 and 20,000 lumens." };
  }

  const floorArea = lengthM * widthM;
  const longWallM = Math.max(lengthM, widthM);
  const shortWallM = Math.min(lengthM, widthM);

  // Desk run along the longer wall, chair zone measured off that wall.
  const deskWidthMm = users * DESK_WIDTH_PER_USER_MM;
  const deskWidthMinMm = users * DESK_WIDTH_MIN_PER_USER_MM;
  const deskFits = deskWidthMm <= longWallM * 1000;
  const deskFitsMinimum = deskWidthMinMm <= longWallM * 1000;
  const usersThatFit = Math.max(0, Math.floor((longWallM * 1000) / DESK_WIDTH_MIN_PER_USER_MM));
  // Seats that fit at the *comfortable* per-user width (DESK_WIDTH_PER_USER_MM),
  // for the "drop to X seats" suggestion — usersThatFit above is the tight
  // 750mm/user minimum and is unrelated to the "comfortable desk" the
  // suggestion sentence quotes, so it could recommend a no-op seat count.
  const usersThatFitComfortably = Math.max(0, Math.floor((longWallM * 1000) / DESK_WIDTH_PER_USER_MM));

  const zoneDepthMm = DESK_DEPTH_COMFORT_MM + CHAIR_CLEARANCE_MM;
  const remainingDepthMm = shortWallM * 1000 - zoneDepthMm;
  const walkwayOk = remainingDepthMm >= WALKWAY_MM;

  // Lighting
  const ambientLumens =
    (AMBIENT_LUX_TARGET * floorArea) / (AMBIENT_UTILISATION_FACTOR * MAINTENANCE_FACTOR);
  const ceilingFittings = Math.ceil(ambientLumens / fixtureLumens);

  const taskAreaM2 = (deskWidthMm / 1000) * (DESK_DEPTH_COMFORT_MM / 1000);
  const taskLumensTotal =
    (TASK_LUX_TARGET * taskAreaM2) / (TASK_UTILISATION_FACTOR * MAINTENANCE_FACTOR);
  const taskLumensPerUser = taskLumensTotal / users;

  // Shelving
  const shelfLengthMm = books * AVERAGE_BOOK_SPINE_MM;
  const shelvesNeeded = Math.ceil(shelfLengthMm / SHELF_BAY_WIDTH_MM);
  const baysNeeded = Math.ceil(shelvesNeeded / SHELVES_PER_BAY);
  const wallLengthForShelvingMm = baysNeeded * SHELF_BAY_WIDTH_MM;

  // Ergonomics
  const deskHeightMm = Math.round(userHeightCm * 10 * DESK_HEIGHT_RATIO);
  const seatHeightMm = Math.round(userHeightCm * 10 * SEAT_HEIGHT_RATIO);

  const areaPerUser = floorArea / users;

  return {
    floorArea,
    areaPerUser,
    longWallM,
    shortWallM,
    deskWidthMm,
    deskWidthMinMm,
    deskFits,
    deskFitsMinimum,
    usersThatFit,
    usersThatFitComfortably,
    deskDepthMm: DESK_DEPTH_COMFORT_MM,
    zoneDepthMm,
    remainingDepthMm,
    walkwayOk,
    ambientLumens,
    ceilingFittings,
    taskAreaM2,
    taskLumensTotal,
    taskLumensPerUser,
    shelfLengthMm,
    shelfLengthM: shelfLengthMm / 1000,
    shelvesNeeded,
    baysNeeded,
    wallLengthForShelvingMm,
    deskHeightMm,
    seatHeightMm,
    screenDistanceMinMm: SCREEN_DISTANCE_MIN_MM,
    screenDistanceMaxMm: SCREEN_DISTANCE_MAX_MM,
    cramped: areaPerUser < 3.5,
  };
}
