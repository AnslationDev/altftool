/**
 * Neutral-density filter exposure maths.
 *
 * An ND filter is specified either as a filter factor, an optical density, or
 * a number of stops. They are three views of the same quantity:
 *
 *   filter factor = 2^stops
 *   density D     = stops * log10(2)          (so 10 stops = D 3.0)
 *   transmittance = 1 / 2^stops = 10^-D
 *
 * Each stop halves the light, so the shutter has to double:
 *
 *   filtered shutter = metered shutter x 2^stops
 *
 * Stacking filters adds their stop counts, because the factors multiply.
 *
 * Pure module: no React, no DOM, no clock.
 */

/** log10(2) — converts a stop count to optical density. */
export const LOG10_2 = Math.log10(2);

/** Most cameras stop metering/timing at 30 s and require bulb beyond it. */
export const BULB_THRESHOLD_SECONDS = 30;

/** Film reciprocity failure generally begins to bite past about one second. */
export const RECIPROCITY_WATCH_SECONDS = 1;

export const MAX_STOPS = 24;
export const MAX_SHUTTER_SECONDS = 24 * 60 * 60; // one day

/**
 * Common filters. `stops` is the real light loss; the name is the marketed
 * filter factor, which for the big ones is rounded (an "ND1000" is 10 stops,
 * a true factor of 1024).
 */
export const ND_PRESETS = [
  { id: "none", name: "No filter", stops: 0 },
  { id: "nd2", name: "ND2 (0.3)", stops: 1 },
  { id: "nd4", name: "ND4 (0.6)", stops: 2 },
  { id: "nd8", name: "ND8 (0.9)", stops: 3 },
  { id: "nd16", name: "ND16 (1.2)", stops: 4 },
  { id: "nd32", name: "ND32 (1.5)", stops: 5 },
  { id: "nd64", name: "ND64 (1.8)", stops: 6 },
  { id: "nd128", name: "ND128 (2.1)", stops: 7 },
  { id: "nd256", name: "ND256 (2.4)", stops: 8 },
  { id: "nd512", name: "ND512 (2.7)", stops: 9 },
  { id: "nd1000", name: "ND1000 (3.0)", stops: 10 },
  { id: "nd2000", name: "ND2000 (3.3)", stops: 11 },
  { id: "nd4000", name: "ND4000 (3.6)", stops: 12 },
  { id: "nd8000", name: "ND8000 (3.9)", stops: 13 },
  { id: "nd100000", name: "ND100000 (4.8) — solar", stops: 16 },
];

/** Full-stop shutter speeds a camera dial actually offers, in seconds. */
export const STANDARD_SHUTTERS = [
  1 / 8000, 1 / 4000, 1 / 2000, 1 / 1000, 1 / 500, 1 / 250, 1 / 125, 1 / 60,
  1 / 30, 1 / 15, 1 / 8, 1 / 4, 1 / 2, 1, 2, 4, 8, 15, 30,
];

const isFiniteNumber = (value) => Number.isFinite(value);

/** Stops of a preset by id; unknown ids contribute nothing. */
export function stopsForFilterId(id) {
  return ND_PRESETS.find((preset) => preset.id === id)?.stops ?? 0;
}

/** Stacked filters multiply their factors, which means their stops add. */
export function totalStopsForFilterIds(ids) {
  if (!Array.isArray(ids)) return 0;
  return ids.reduce((sum, id) => sum + stopsForFilterId(id), 0);
}

/** Light-blocking factor of an ND: 2^stops. */
export function stopsToFactor(stops) {
  return Math.pow(2, stops);
}

/** Optical density of an ND: stops x log10(2). */
export function stopsToDensity(stops) {
  return stops * LOG10_2;
}

/** Fraction of light that gets through: 1 / 2^stops. */
export function stopsToTransmittance(stops) {
  return 1 / Math.pow(2, stops);
}

/** Stops implied by an optical density figure printed on a filter ring. */
export function densityToStops(density) {
  if (!isFiniteNumber(density)) return null;
  return density / LOG10_2;
}

/** Seconds -> "1/125 s", "8.2 s" or "2 min 14 s". */
export function formatExposure(seconds) {
  if (!isFiniteNumber(seconds) || seconds <= 0) return "—";
  if (seconds < 1) return `1/${Math.round(1 / seconds)} s`;
  if (seconds < 60) return `${seconds.toFixed(seconds < 10 ? 2 : 1)} s`;
  const totalRounded = Math.round(seconds);
  const minutes = Math.floor(totalRounded / 60);
  const rest = totalRounded - minutes * 60;
  if (minutes < 60) return `${minutes} min ${rest} s`;
  const hours = Math.floor(minutes / 60);
  return `${hours} h ${minutes - hours * 60} min`;
}

/**
 * Convert a metered shutter speed into the filtered one.
 *
 * @returns {object} either { error } or the full result.
 */
export function computeNdExposure({ baseShutterSeconds, filterStops, extraStops = 0 }) {
  const base = Number(baseShutterSeconds);
  const nd = Number(filterStops);
  const extra = Number(extraStops);

  if (![base, nd, extra].every(isFiniteNumber)) {
    return { error: "Enter a number in every field." };
  }
  if (base <= 0) return { error: "The metered shutter speed must be greater than zero." };
  if (base > MAX_SHUTTER_SECONDS) return { error: "Metered exposures over 24 hours are out of range." };
  if (nd < 0 || extra < 0) return { error: "Filter strength cannot be negative." };

  const totalStops = nd + extra;
  if (totalStops > MAX_STOPS) return { error: `Total filtration is capped at ${MAX_STOPS} stops.` };

  const factor = stopsToFactor(totalStops);
  const filteredSeconds = base * factor;

  if (filteredSeconds > MAX_SHUTTER_SECONDS) {
    return { error: "That combination needs an exposure longer than 24 hours." };
  }

  return {
    baseShutterSeconds: base,
    totalStops,
    filterFactor: factor,
    opticalDensity: stopsToDensity(totalStops),
    transmittance: stopsToTransmittance(totalStops),
    transmittancePercent: stopsToTransmittance(totalStops) * 100,
    filteredSeconds,
    needsBulb: filteredSeconds > BULB_THRESHOLD_SECONDS,
    watchReciprocity: filteredSeconds >= RECIPROCITY_WATCH_SECONDS,
  };
}

/**
 * The reverse question: how much ND do I need to reach a target exposure time?
 * stops = log2(target / metered)
 */
export function stopsForTargetExposure({ baseShutterSeconds, targetSeconds }) {
  const base = Number(baseShutterSeconds);
  const target = Number(targetSeconds);
  if (![base, target].every(isFiniteNumber)) return { error: "Enter a number in every field." };
  if (base <= 0) return { error: "The metered shutter speed must be greater than zero." };
  if (target <= 0) return { error: "The target exposure must be greater than zero." };
  if (target < base) {
    return { error: "The target is shorter than the metered exposure — no ND filter needed." };
  }
  const stops = Math.log2(target / base);
  const suggestion = ND_PRESETS.reduce((best, preset) =>
    Math.abs(preset.stops - stops) < Math.abs(best.stops - stops) ? preset : best,
  );
  return { stops, nearestFilter: suggestion, stopsShort: stops - suggestion.stops };
}

/**
 * Table of the filtered exposure for every metered shutter speed at a given
 * filter strength — the field-reference card photographers actually use.
 */
export function buildNdTable(filterStops) {
  const stops = Number(filterStops);
  if (!isFiniteNumber(stops) || stops < 0 || stops > MAX_STOPS) return [];
  return STANDARD_SHUTTERS.map((seconds) => {
    const filtered = seconds * stopsToFactor(stops);
    return {
      baseSeconds: seconds,
      filteredSeconds: filtered,
      needsBulb: filtered > BULB_THRESHOLD_SECONDS,
    };
  }).filter((row) => row.filteredSeconds <= MAX_SHUTTER_SECONDS);
}
