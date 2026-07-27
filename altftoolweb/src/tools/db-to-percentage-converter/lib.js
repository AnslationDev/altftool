/**
 * Decibel <-> linear conversions.
 *
 * The decibel is a logarithmic ratio, and which multiplier you use depends on
 * whether the quantity is a field/amplitude quantity or a power quantity:
 *
 *   amplitude (voltage, sound pressure, sample value):
 *       dB = 20 * log10(A / A_ref)      A / A_ref = 10^(dB / 20)
 *   power (watts, intensity, energy):
 *       dB = 10 * log10(P / P_ref)      P / P_ref = 10^(dB / 10)
 *
 * Power is proportional to amplitude squared, which is exactly why the factor
 * is 20 for amplitude and 10 for power (log of a square doubles the log).
 *
 * Pure module: no React, no DOM, no clock.
 */

/** dB = 20*log10(ratio) for field/amplitude quantities (IEC 60027-3). */
export const AMPLITUDE_DB_FACTOR = 20;

/** dB = 10*log10(ratio) for power quantities (IEC 60027-3). */
export const POWER_DB_FACTOR = 10;

/**
 * Roughly a 10 dB change in sound pressure level is heard as a doubling or
 * halving of loudness (Stevens' sone scale: loudness doubles per 10 phon).
 * A rule of thumb for perception, not an exact physical identity.
 */
export const LOUDNESS_DOUBLING_DB = 10;

/** Working range. Beyond ±200 dB the numbers stop meaning anything in audio. */
export const MIN_DB = -200;
export const MAX_DB = 200;

/** Percentage inputs are capped at +100 dB of amplitude gain. */
export const MAX_PERCENT = 1e7;

export const INPUT_MODES = [
  { id: "db", label: "Decibels (dB)", unit: "dB" },
  { id: "amplitudePercent", label: "Amplitude percentage", unit: "%" },
  { id: "powerPercent", label: "Power percentage", unit: "%" },
  { id: "amplitudeRatio", label: "Linear amplitude ratio (gain)", unit: "×" },
];

/** Handy landmarks people actually look up. */
export const REFERENCE_ROWS = [
  { db: 6.0206, note: "double amplitude" },
  { db: 3.0103, note: "double power" },
  { db: 0, note: "unity — no change" },
  { db: -1, note: "just noticeable on a mix bus" },
  { db: -3.0103, note: "half power" },
  { db: -6.0206, note: "half amplitude" },
  { db: -10, note: "about half as loud" },
  { db: -12, note: "quarter amplitude" },
  { db: -20, note: "one tenth amplitude" },
  { db: -40, note: "1% amplitude" },
  { db: -60, note: "0.1% amplitude — typical noise floor target" },
];

const isFiniteNumber = (value) => Number.isFinite(value);

/** Linear amplitude ratio from decibels: 10^(dB/20). */
export function dbToAmplitude(db) {
  return Math.pow(10, db / AMPLITUDE_DB_FACTOR);
}

/** Linear power ratio from decibels: 10^(dB/10). */
export function dbToPower(db) {
  return Math.pow(10, db / POWER_DB_FACTOR);
}

/** Decibels from a linear amplitude ratio: 20*log10(ratio). Null at zero. */
export function amplitudeToDb(ratio) {
  if (!isFiniteNumber(ratio) || ratio <= 0) return null;
  return AMPLITUDE_DB_FACTOR * Math.log10(ratio);
}

/** Decibels from a linear power ratio: 10*log10(ratio). Null at zero. */
export function powerToDb(ratio) {
  if (!isFiniteNumber(ratio) || ratio <= 0) return null;
  return POWER_DB_FACTOR * Math.log10(ratio);
}

/**
 * Build every representation from a decibel value.
 * Returns { error } for anything outside the working range.
 */
export function fromDb(db) {
  const value = Number(db);
  if (!isFiniteNumber(value)) return { error: "Enter a number." };
  if (value < MIN_DB || value > MAX_DB) {
    return { error: `Stay between ${MIN_DB} dB and +${MAX_DB} dB.` };
  }
  const amplitude = dbToAmplitude(value);
  const power = dbToPower(value);
  return {
    db: value,
    silent: false,
    amplitudeRatio: amplitude,
    amplitudePercent: amplitude * 100,
    powerRatio: power,
    powerPercent: power * 100,
    perceivedLoudnessRatio: Math.pow(2, value / LOUDNESS_DOUBLING_DB),
  };
}

/** Result object representing true silence (a ratio of exactly zero). */
function silence() {
  return {
    db: null,
    silent: true,
    amplitudeRatio: 0,
    amplitudePercent: 0,
    powerRatio: 0,
    powerPercent: 0,
    perceivedLoudnessRatio: 0,
  };
}

/**
 * Single entry point. mode is one of INPUT_MODES ids.
 * @returns {object} either { error } or the full conversion set.
 */
export function convertLevel({ mode, value }) {
  const raw = Number(value);
  if (!isFiniteNumber(raw)) return { error: "Enter a number." };

  if (mode === "db") return fromDb(raw);

  if (mode === "amplitudePercent" || mode === "amplitudeRatio") {
    const ratio = mode === "amplitudePercent" ? raw / 100 : raw;
    if (ratio < 0) return { error: "A linear ratio cannot be negative — use decibels instead." };
    if (ratio === 0) return silence();
    if (ratio * 100 > MAX_PERCENT) return { error: "That is more than +100 dB of gain." };
    const db = amplitudeToDb(ratio);
    if (db === null) return silence();
    if (db < MIN_DB) return { error: `That is quieter than ${MIN_DB} dB.` };
    return fromDb(db);
  }

  if (mode === "powerPercent") {
    const ratio = raw / 100;
    if (ratio < 0) return { error: "A power ratio cannot be negative." };
    if (ratio === 0) return silence();
    if (ratio * 100 > MAX_PERCENT) return { error: "That is more than +50 dB of power gain." };
    const db = powerToDb(ratio);
    if (db === null) return silence();
    if (db < MIN_DB) return { error: `That is quieter than ${MIN_DB} dB.` };
    return fromDb(db);
  }

  return { error: "Unknown conversion mode." };
}
