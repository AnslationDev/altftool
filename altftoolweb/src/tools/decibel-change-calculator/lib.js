/**
 * Decibel change maths.
 *
 * A decibel is a ratio, never an absolute amount, and the ratio you get depends
 * on which quantity is being compared:
 *
 *   power / intensity ratio      = 10 ^ (dB / 10)     (dB = 10 · log10(P2/P1))
 *   amplitude / pressure ratio   = 10 ^ (dB / 20)     (dB = 20 · log10(A2/A1))
 *
 * The factor of 10 versus 20 is not a convention chosen for convenience: power
 * is proportional to the square of a field quantity such as sound pressure or
 * voltage, and log10(A²) = 2·log10(A).
 *
 * Perceived loudness follows neither. Stevens' loudness scale (the sone, ISO 532)
 * puts a doubling of loudness at roughly +10 dB for steady broadband sound well
 * above threshold, so perceived ratio = 2 ^ (dB / 10).
 *
 * Distance: for a point source radiating into free space the inverse-square law
 * gives a 6.02 dB drop per doubling of distance, so the distance ratio that
 * would produce a change of dB is 10 ^ (−dB / 20).
 *
 * Sources: N identical but uncorrelated sources add in power, giving
 * 10·log10(N) dB, so the equivalent source count is the power ratio itself —
 * doubling the sources is +3.01 dB, not +6 dB.
 */

/** dB = 10 · log10(power ratio) — definition of the decibel for power quantities. */
export const DB_PER_POWER_DECADE = 10;

/** dB = 20 · log10(amplitude ratio) — field quantities (sound pressure, voltage). */
export const DB_PER_AMPLITUDE_DECADE = 20;

/** Stevens' rule for the sone scale: about +10 dB is heard as twice as loud. */
export const DB_PER_LOUDNESS_DOUBLING = 10;

/** Inverse-square law: 20·log10(2) dB lost per doubling of distance from a point source. */
export const DB_PER_DISTANCE_DOUBLING = 20 * Math.log10(2); // 6.0206 dB

/** Doubling the power (or the number of uncorrelated sources): 10·log10(2). */
export const DB_PER_POWER_DOUBLING = 10 * Math.log10(2); // 3.0103 dB

/**
 * Smallest level difference an average listener can detect for broadband sound
 * in a direct A/B comparison — about 1 dB. Used only to label the result.
 */
export const JUST_NOTICEABLE_DB = 1;

/** Beyond this the ratios stop being physically meaningful and start losing precision. */
export const DB_LIMIT = 200;

/**
 * Reference points people actually quote, each with the reason it is true.
 */
export const REFERENCE_POINTS = [
  { db: 1, note: "About the smallest difference most listeners can hear" },
  { db: 3, note: "Double the power (two identical uncorrelated sources)" },
  { db: 6, note: "Double the amplitude, or half the distance to a point source" },
  { db: 10, note: "Roughly twice as loud to the ear" },
  { db: 20, note: "Ten times the amplitude, one hundred times the power" },
];

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** What a change of this size actually sounds like. */
function describePerception(deltaDb) {
  const size = Math.abs(deltaDb);
  const louder = deltaDb > 0;
  if (size === 0) return "No change — the two levels are identical.";
  if (size < JUST_NOTICEABLE_DB) {
    return "Below about 1 dB — most listeners cannot hear this difference at all.";
  }
  if (size < 3) {
    return `Just perceptible in a direct A/B comparison, ${louder ? "slightly louder" : "slightly quieter"}.`;
  }
  if (size < 6) {
    return `Clearly audible as ${louder ? "louder" : "quieter"}, but nowhere near double.`;
  }
  if (size < 10) {
    return `Obviously ${louder ? "louder" : "quieter"} — a substantial change in level.`;
  }
  const factor = Math.pow(2, size / DB_PER_LOUDNESS_DOUBLING);
  const factorText =
    factor < 10
      ? factor.toFixed(1)
      : Math.round(factor).toLocaleString("en-US", { maximumFractionDigits: 0 });
  return louder
    ? `Heard as roughly ${factorText} times as loud.`
    : `Heard as roughly 1/${factorText} as loud.`;
}

/** Human-readable ratio: 2 -> "2", 1.4142 -> "1.414", 1e10 -> "1.0 × 10^10". */
export function formatRatio(value) {
  if (!isFiniteNumber(value) || value <= 0) return "—";
  if (value >= 1e6 || value < 1e-4) {
    const exponent = Math.floor(Math.log10(value));
    const mantissa = value / Math.pow(10, exponent);
    return `${mantissa.toFixed(2)} × 10^${exponent}`;
  }
  if (value >= 1000) return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (value >= 100) return value.toFixed(1);
  if (value >= 10) return value.toFixed(2);
  return value.toFixed(3);
}

/**
 * Turn a level change in decibels into every ratio it implies.
 *
 * @param {object} input
 * @param {number} input.deltaDb Level change in dB (positive = louder).
 * @returns {{error:string}|object}
 */
export function analyseDecibelChange({ deltaDb } = {}) {
  const delta = typeof deltaDb === "string" ? Number(deltaDb.trim()) : deltaDb;
  if (deltaDb === "" || deltaDb === null || deltaDb === undefined || !isFiniteNumber(delta)) {
    return { error: "Enter the level change in decibels, for example 6 or -3." };
  }
  if (Math.abs(delta) > DB_LIMIT) {
    return {
      error: `Keep the change within ±${DB_LIMIT} dB — beyond that the ratios stop describing anything physical.`,
    };
  }

  const powerRatio = Math.pow(10, delta / DB_PER_POWER_DECADE);
  const amplitudeRatio = Math.pow(10, delta / DB_PER_AMPLITUDE_DECADE);
  const loudnessRatio = Math.pow(2, delta / DB_PER_LOUDNESS_DOUBLING);
  // Inverse-square law, rearranged: r2/r1 = 10 ^ (−dB / 20).
  const distanceRatio = Math.pow(10, -delta / DB_PER_AMPLITUDE_DECADE);
  // N uncorrelated identical sources add 10·log10(N) dB, so N equals the power ratio.
  const sourceCount = powerRatio;

  return {
    deltaDb: delta,
    direction: delta > 0 ? "increase" : delta < 0 ? "decrease" : "no change",
    powerRatio,
    amplitudeRatio,
    loudnessRatio,
    distanceRatio,
    sourceCount,
    powerPercentChange: (powerRatio - 1) * 100,
    amplitudePercentChange: (amplitudeRatio - 1) * 100,
    loudnessPercentChange: (loudnessRatio - 1) * 100,
    powerDoublings: delta / DB_PER_POWER_DOUBLING,
    amplitudeDoublings: delta / DB_PER_DISTANCE_DOUBLING,
    loudnessDoublings: delta / DB_PER_LOUDNESS_DOUBLING,
    distanceDoublings: -delta / DB_PER_DISTANCE_DOUBLING,
    perception: describePerception(delta),
    audible: Math.abs(delta) >= JUST_NOTICEABLE_DB,
  };
}

/** Which quantity a ratio refers to, and the multiplier in dB = k · log10(ratio). */
export const RATIO_KINDS = [
  {
    id: "amplitude",
    label: "Amplitude / sound pressure / voltage",
    factor: DB_PER_AMPLITUDE_DECADE,
  },
  { id: "power", label: "Power / intensity / watts", factor: DB_PER_POWER_DECADE },
  { id: "distance", label: "Distance from a point source", factor: -DB_PER_AMPLITUDE_DECADE },
  { id: "sources", label: "Number of identical uncorrelated sources", factor: DB_PER_POWER_DECADE },
];

/**
 * Go the other way: a measured ratio into the decibel change it represents.
 *
 * @param {object} input
 * @param {number} input.ratio  The ratio (new ÷ old). Must be greater than zero.
 * @param {string} input.kindId One of RATIO_KINDS.
 * @returns {{error:string}|{deltaDb:number, kind:object, ratio:number}}
 */
export function decibelsFromRatio({ ratio, kindId = "amplitude" } = {}) {
  const kind = RATIO_KINDS.find((item) => item.id === kindId);
  if (!kind) return { error: "Choose which quantity the ratio describes." };
  const value = typeof ratio === "string" ? Number(ratio.trim()) : ratio;
  if (ratio === "" || ratio === null || ratio === undefined || !isFiniteNumber(value)) {
    return { error: "Enter the ratio as a number, for example 2 for double." };
  }
  if (value <= 0) {
    return { error: "A ratio must be greater than zero — log10 of zero or a negative is undefined." };
  }
  const deltaDb = kind.factor * Math.log10(value);
  if (!Number.isFinite(deltaDb)) {
    return { error: "That ratio is too extreme to express in decibels." };
  }
  return { deltaDb, kind, ratio: value };
}
