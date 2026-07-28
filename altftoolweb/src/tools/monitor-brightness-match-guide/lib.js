/**
 * Monitor Brightness Match Guide — logic only. No React, no DOM.
 *
 * Formulas and where they come from:
 *  - Surround luminance from room illuminance. For a matte (Lambertian)
 *    surface, luminance L in cd/m2 = E * rho / pi, where E is the illuminance
 *    falling on it in lux and rho is the surface reflectance (0-1). The pi
 *    comes from integrating a perfectly diffuse reflector over the hemisphere.
 *  - Luminance-ratio limits. ISO 9241-303 and ANSI/HFES 100 set a maximum
 *    luminance ratio of about 3:1 between the screen and its immediate
 *    surround, and about 10:1 between the screen and the wider field of view.
 *    Ratios beyond that force repeated pupil and adaptation changes, which is
 *    what people feel as screen fatigue.
 *  - Absolute floor. ISO 3664:2009 specifies a minimum display white luminance
 *    of 80 cd/m2, with 120 cd/m2 or more preferred, so the recommendation is
 *    never allowed below 80 cd/m2 however dark the room is.
 *  - Room illuminance references follow EN 12464-1 maintained illuminance
 *    values for indoor workplaces: 300 lux general office areas, 500 lux for
 *    reading, writing and screen-based work.
 */

/** Lambertian conversion constant: L (cd/m2) = E (lux) * rho / PI. */
export const LAMBERT_DIVISOR = Math.PI;

/** ISO 9241-303 / ANSI-HFES 100 maximum screen-to-immediate-surround ratio. */
export const MAX_SURROUND_RATIO = 3;

/** Maximum screen-to-wider-field luminance ratio. */
export const MAX_FIELD_RATIO = 10;

/** ISO 3664:2009 minimum display white luminance, cd/m2. */
export const MIN_DISPLAY_LUMINANCE = 80;

/** ISO 3664:2009 preferred display white luminance, cd/m2. */
export const PREFERRED_DISPLAY_LUMINANCE = 120;

/** Default screen-to-surround ratio aimed for: comfortably inside the 3:1 limit. */
export const DEFAULT_TARGET_RATIO = 1.5;

/** Typical reflectance of a matte light-grey office wall or desk (fraction). */
export const DEFAULT_REFLECTANCE = 0.5;

/** Room light presets, in lux (EN 12464-1 workplace values where applicable). */
export const ROOM_PRESETS = [
  { id: "night", label: "Dark room, one lamp off to the side", lux: 30 },
  { id: "evening", label: "Living room in the evening", lux: 100 },
  { id: "home", label: "Home office, curtains half drawn", lux: 250 },
  { id: "office-general", label: "General office area (EN 12464-1: 300 lux)", lux: 300 },
  { id: "office-task", label: "Screen-based office work (EN 12464-1: 500 lux)", lux: 500 },
  { id: "bright", label: "Bright office or overcast daylight indoors", lux: 750 },
  { id: "window", label: "Desk beside a sunlit window", lux: 1500 },
];

/** Common surface reflectances (fraction of light reflected). */
export const REFLECTANCES = [
  { id: "white", label: "White / very light wall (0.75)", value: 0.75 },
  { id: "light", label: "Light grey or cream (0.5)", value: 0.5 },
  { id: "mid", label: "Mid grey or wood desk (0.35)", value: 0.35 },
  { id: "dark", label: "Dark wall or black desk (0.15)", value: 0.15 },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round1 = (value) => Math.round(value * 10) / 10;

/** Luminance in cd/m2 of a matte surface lit to `lux` with reflectance `rho`. */
export function surroundLuminance(lux, reflectance) {
  if (!isNum(lux) || lux < 0) return null;
  if (!isNum(reflectance) || reflectance <= 0 || reflectance > 1) return null;
  return (lux * reflectance) / LAMBERT_DIVISOR;
}

/**
 * @param {object} input
 * @param {number} input.roomLux         Measured or estimated room illuminance, lux.
 * @param {number} input.reflectance     Reflectance of the wall behind the screen, 0-1.
 * @param {number} input.targetRatio     Wanted screen : surround luminance ratio.
 * @param {number} input.monitorMaxNits  The panel's rated peak white luminance.
 * @param {number} input.currentPercent  The brightness slider position now, 0-100.
 * @returns {object} recommendation, or { error }.
 */
export function matchBrightness({
  roomLux,
  reflectance = DEFAULT_REFLECTANCE,
  targetRatio = DEFAULT_TARGET_RATIO,
  monitorMaxNits,
  currentPercent,
} = {}) {
  const values = { roomLux, reflectance, targetRatio, monitorMaxNits, currentPercent };
  const bad = Object.keys(values).find((key) => !isNum(values[key]));
  if (bad) return { error: "Enter a number in every field." };

  if (roomLux < 0) return { error: "Room light cannot be negative." };
  if (roomLux > 100000) return { error: "Enter a room level below 100000 lux — that is direct sunlight." };
  if (reflectance <= 0 || reflectance > 1) return { error: "Reflectance must be between 0 and 1." };
  if (targetRatio < 0.5 || targetRatio > MAX_SURROUND_RATIO) {
    return { error: `Aim for a screen-to-surround ratio between 0.5 and ${MAX_SURROUND_RATIO}:1.` };
  }
  if (monitorMaxNits <= 0) return { error: "The monitor's peak brightness must be greater than zero." };
  if (monitorMaxNits > 5000) return { error: "Enter a peak brightness below 5000 nits." };
  if (currentPercent < 0 || currentPercent > 100) {
    return { error: "The brightness slider is a percentage between 0 and 100." };
  }

  const surround = surroundLuminance(roomLux, reflectance);
  if (surround === null) return { error: "Room light and reflectance must produce a real surround luminance." };

  const rawTarget = surround * targetRatio;

  // Never below the ISO 3664 floor, never above what the panel can output.
  const clampedToFloor = Math.max(MIN_DISPLAY_LUMINANCE, rawTarget);
  const recommendedNits = Math.min(monitorMaxNits, clampedToFloor);

  let basis;
  if (clampedToFloor > monitorMaxNits) {
    basis = `Capped at the panel's ${Math.round(monitorMaxNits)} nit maximum — this room is brighter than the screen can match.`;
  } else if (rawTarget < MIN_DISPLAY_LUMINANCE) {
    basis = `Held at the ISO 3664 floor of ${MIN_DISPLAY_LUMINANCE} cd/m2 — the room is dim enough that the ratio alone would go lower.`;
  } else {
    basis = `Set by the ${round1(targetRatio)}:1 screen-to-surround ratio.`;
  }

  // Comfortable band: never below the floor, never above the 3:1 limit.
  const bandMin = Math.min(monitorMaxNits, MIN_DISPLAY_LUMINANCE);
  const bandMax = Math.min(monitorMaxNits, Math.max(MIN_DISPLAY_LUMINANCE, surround * MAX_SURROUND_RATIO));

  const sliderPercent = Math.round((recommendedNits / monitorMaxNits) * 100);
  const currentNits = (currentPercent / 100) * monitorMaxNits;
  const currentRatio = surround > 0 ? currentNits / surround : null;

  let verdict;
  if (currentNits < bandMin) {
    verdict = `Your screen is at about ${Math.round(currentNits)} nits, below the ${MIN_DISPLAY_LUMINANCE} cd/m2 floor. Turn it up.`;
  } else if (currentNits > bandMax) {
    verdict = `Your screen is at about ${Math.round(currentNits)} nits, above the comfortable ceiling of ${Math.round(bandMax)} nits for this room. Turn it down.`;
  } else {
    verdict = `Your screen is at about ${Math.round(currentNits)} nits, inside the comfortable band for this room.`;
  }

  const notes = [];
  if (currentRatio !== null && currentRatio > MAX_FIELD_RATIO) {
    notes.push(
      `The screen is currently more than ${MAX_FIELD_RATIO} times brighter than the wall behind it. That is the classic dark-room glare setup and the fastest thing to fix.`,
    );
  }
  if (roomLux < 50) {
    notes.push(
      "Working in near darkness forces the largest pupil and the biggest adaptation swing every time you look away. Add a low bias light behind the monitor rather than dimming the screen further.",
    );
  }
  if (roomLux > 1000) {
    notes.push(
      "At this light level most panels cannot match the surround, so reduce the light instead: move the desk side-on to the window, or use a blind.",
    );
  }
  if (recommendedNits < PREFERRED_DISPLAY_LUMINANCE && roomLux >= 300) {
    notes.push(
      `ISO 3664 prefers ${PREFERRED_DISPLAY_LUMINANCE} cd/m2 or more for colour-critical work, so raise the target ratio if you are matching prints.`,
    );
  }

  return {
    roomLux,
    reflectance,
    targetRatio,
    surroundNits: round1(surround),
    recommendedNits: round1(recommendedNits),
    sliderPercent,
    basis,
    bandMinNits: round1(bandMin),
    bandMaxNits: round1(bandMax),
    monitorMaxNits,
    currentPercent,
    currentNits: round1(currentNits),
    currentRatio: currentRatio === null ? null : round1(currentRatio),
    maxSurroundRatio: MAX_SURROUND_RATIO,
    maxFieldRatio: MAX_FIELD_RATIO,
    minDisplayLuminance: MIN_DISPLAY_LUMINANCE,
    preferredDisplayLuminance: PREFERRED_DISPLAY_LUMINANCE,
    verdict,
    notes,
  };
}
