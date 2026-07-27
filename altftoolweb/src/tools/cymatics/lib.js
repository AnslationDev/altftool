/**
 * Cymatics / Chladni plate simulator — pure logic.
 *
 * Two pieces of real physics:
 *
 * 1. Resonant frequencies of a thin flat plate (Kirchhoff-Love plate theory).
 *    For a square plate of side L and thickness h, simply supported on all
 *    four edges, the natural frequencies are
 *
 *        f(m,n) = (pi / 2) * sqrt(D / (rho * h)) * [ (m/L)^2 + (n/L)^2 ]
 *
 *    with flexural rigidity  D = E h^3 / (12 (1 - v^2)),
 *    E = Young's modulus, v = Poisson's ratio, rho = density.
 *
 * 2. The Chladni figure itself. Sand collects on the nodal lines of the
 *    standing wave. For a square plate driven at its centre, the classic
 *    superposition used since Chladni's 1787 experiments is
 *
 *        u(x, y) = cos(n pi x) cos(m pi y) - cos(m pi x) cos(n pi y)
 *
 *    on the unit square, whose zero set is the pattern the sand traces.
 *
 * Drive amplitude away from resonance uses the standard single-degree-of-
 * freedom magnification factor  A = 1 / sqrt((1 - r^2)^2 + (2 z r)^2),
 * r = f / f(m,n), z = damping ratio.
 *
 * Everything is pure: no canvas, no DOM, no Date.now().
 */

/* ------------------------------------------------------------------ */
/* Material and physical constants                                     */
/* ------------------------------------------------------------------ */

/**
 * Plate materials. Young's modulus in GPa, density in kg/m^3, Poisson's ratio
 * dimensionless — standard engineering handbook values at room temperature.
 */
export const MATERIALS = [
  { key: "steel", label: "Mild steel", youngsModulusGpa: 200, densityKgM3: 7850, poissonRatio: 0.3 },
  { key: "aluminium", label: "Aluminium 6061", youngsModulusGpa: 69, densityKgM3: 2700, poissonRatio: 0.33 },
  { key: "brass", label: "Brass", youngsModulusGpa: 100, densityKgM3: 8500, poissonRatio: 0.34 },
  { key: "glass", label: "Soda-lime glass", youngsModulusGpa: 70, densityKgM3: 2500, poissonRatio: 0.22 },
  { key: "acrylic", label: "Acrylic (PMMA)", youngsModulusGpa: 3.2, densityKgM3: 1190, poissonRatio: 0.37 },
];

/** Speed of sound in dry air at 20 °C, in metres per second. */
export const SPEED_OF_SOUND_MS = 343;

/** Human hearing range, used to label the driving frequency. */
export const AUDIBLE_MIN_HZ = 20;
export const AUDIBLE_MAX_HZ = 20000;

/** Highest mode index searched when matching a frequency to a mode. */
export const MAX_MODE_INDEX = 12;

/** Simulation grid limits. A 121-point grid is smooth and still instant. */
export const MIN_RESOLUTION = 41;
export const MAX_RESOLUTION = 241;
export const DEFAULT_RESOLUTION = 121;

/** Input bounds, chosen so the plate stays a thin plate (L/h > 20). */
export const MIN_SIDE_MM = 40;
export const MAX_SIDE_MM = 1000;
export const MIN_THICKNESS_MM = 0.2;
export const MAX_THICKNESS_MM = 20;
export const MIN_DAMPING = 0.001;
export const MAX_DAMPING = 0.5;

/**
 * A grid point counts as "on a nodal line" when |u| falls below this fraction
 * of the pattern's peak amplitude. It is a drawing threshold, not physics:
 * sand piles up in a band of finite width, not on a mathematical line.
 */
export const NODAL_BAND = 0.03;

const GPA_TO_PA = 1e9;
const MM_TO_M = 1e-3;

/* ------------------------------------------------------------------ */
/* Plate physics                                                       */
/* ------------------------------------------------------------------ */

/** Look up a material by key, falling back to the first entry. */
export function getMaterial(key) {
  return MATERIALS.find((material) => material.key === key) || MATERIALS[0];
}

/**
 * Flexural rigidity D = E h^3 / (12 (1 - v^2)), in N·m.
 * Returns { error } for a non-physical thickness or Poisson ratio.
 */
export function flexuralRigidity({ youngsModulusGpa, thicknessMm, poissonRatio }) {
  const e = Number(youngsModulusGpa) * GPA_TO_PA;
  const h = Number(thicknessMm) * MM_TO_M;
  const v = Number(poissonRatio);
  if (!Number.isFinite(e) || e <= 0) return { error: "Young's modulus must be greater than zero." };
  if (!Number.isFinite(h) || h <= 0) return { error: "Plate thickness must be greater than zero." };
  if (!Number.isFinite(v) || v <= -1 || v >= 0.5) {
    return { error: "Poisson's ratio must be between -1 and 0.5." };
  }
  return { rigidity: (e * h ** 3) / (12 * (1 - v * v)) };
}

/**
 * Natural frequency of mode (m, n) of a simply supported square plate, in Hz.
 */
export function modeFrequency({ m, n, sideMm, thicknessMm, materialKey }) {
  const material = getMaterial(materialKey);
  const rigidity = flexuralRigidity({
    youngsModulusGpa: material.youngsModulusGpa,
    thicknessMm,
    poissonRatio: material.poissonRatio,
  });
  if (rigidity.error) return rigidity;

  const side = Number(sideMm) * MM_TO_M;
  const h = Number(thicknessMm) * MM_TO_M;
  if (!Number.isFinite(side) || side <= 0) return { error: "Plate side must be greater than zero." };
  const mi = Math.trunc(Number(m));
  const ni = Math.trunc(Number(n));
  if (!Number.isFinite(mi) || !Number.isFinite(ni) || mi < 1 || ni < 1) {
    return { error: "Mode indices must be whole numbers of 1 or more." };
  }

  const massPerArea = material.densityKgM3 * h; // rho * h, kg/m^2
  if (massPerArea <= 0) return { error: "Plate mass per unit area must be greater than zero." };

  const frequency =
    (Math.PI / 2) *
    Math.sqrt(rigidity.rigidity / massPerArea) *
    ((mi / side) ** 2 + (ni / side) ** 2);

  if (!Number.isFinite(frequency)) return { error: "Those plate values do not give a real frequency." };
  return { frequency, rigidity: rigidity.rigidity, massPerArea };
}

/**
 * Find the mode (m, n) whose natural frequency is closest to a drive
 * frequency, searching 1..MAX_MODE_INDEX in both directions.
 */
export function nearestMode({ frequencyHz, sideMm, thicknessMm, materialKey }) {
  const target = Number(frequencyHz);
  if (!Number.isFinite(target) || target <= 0) {
    return { error: "Drive frequency must be greater than zero hertz." };
  }
  let best = null;
  for (let m = 1; m <= MAX_MODE_INDEX; m += 1) {
    for (let n = m; n <= MAX_MODE_INDEX; n += 1) {
      const result = modeFrequency({ m, n, sideMm, thicknessMm, materialKey });
      if (result.error) return result;
      const distance = Math.abs(result.frequency - target);
      if (!best || distance < best.distance) {
        best = { m, n, frequency: result.frequency, distance, rigidity: result.rigidity };
      }
    }
  }
  if (!best) return { error: "No plate mode could be computed for those values." };
  return best;
}

/**
 * Single-degree-of-freedom magnification factor at a drive frequency.
 * A = 1 / sqrt((1 - r^2)^2 + (2 z r)^2). At resonance this is 1 / (2 z).
 */
export function amplitudeFactor(driveHz, modeHz, dampingRatio) {
  const f = Number(driveHz);
  const f0 = Number(modeHz);
  const z = Number(dampingRatio);
  if (!Number.isFinite(f) || f <= 0) return { error: "Drive frequency must be greater than zero." };
  if (!Number.isFinite(f0) || f0 <= 0) return { error: "Mode frequency must be greater than zero." };
  if (!Number.isFinite(z) || z <= 0) return { error: "Damping ratio must be greater than zero." };
  const r = f / f0;
  const denominator = Math.sqrt((1 - r * r) ** 2 + (2 * z * r) ** 2);
  // denominator is zero only when z = 0 and r = 1, which the guards exclude.
  if (denominator <= 0) return { error: "Damping ratio must be greater than zero." };
  return { factor: 1 / denominator, ratio: r };
}

/* ------------------------------------------------------------------ */
/* Chladni pattern field                                               */
/* ------------------------------------------------------------------ */

/**
 * Sample u(x, y) = cos(n pi x) cos(m pi y) - cos(m pi x) cos(n pi y) on a
 * square grid over the unit plate.
 *
 * @returns {{ values: Float64Array, size: number, peak: number, nodalFraction: number }}
 */
export function chladniField({ m, n, resolution = DEFAULT_RESOLUTION }) {
  const mi = Math.trunc(Number(m));
  const ni = Math.trunc(Number(n));
  if (!Number.isFinite(mi) || !Number.isFinite(ni) || mi < 1 || ni < 1) {
    return { error: "Mode indices must be whole numbers of 1 or more." };
  }
  let size = Math.trunc(Number(resolution));
  if (!Number.isFinite(size)) size = DEFAULT_RESOLUTION;
  size = Math.min(MAX_RESOLUTION, Math.max(MIN_RESOLUTION, size));

  const values = new Float64Array(size * size);
  let peak = 0;
  for (let row = 0; row < size; row += 1) {
    const y = row / (size - 1);
    for (let column = 0; column < size; column += 1) {
      const x = column / (size - 1);
      // When m equals n the two superposed terms cancel exactly, because the
      // (m, n) and (n, m) modes are the same mode rather than a degenerate
      // pair. The figure is then the plain product mode shape.
      const value =
        mi === ni
          ? Math.cos(mi * Math.PI * x) * Math.cos(ni * Math.PI * y)
          : Math.cos(ni * Math.PI * x) * Math.cos(mi * Math.PI * y) -
            Math.cos(mi * Math.PI * x) * Math.cos(ni * Math.PI * y);
      values[row * size + column] = value;
      const magnitude = Math.abs(value);
      if (magnitude > peak) peak = magnitude;
    }
  }

  // m === n makes u identically zero (the two terms cancel); treat the peak as
  // 1 so the caller never divides by zero and the plate renders flat.
  const safePeak = peak > 0 ? peak : 1;
  let nodal = 0;
  for (let index = 0; index < values.length; index += 1) {
    if (Math.abs(values[index]) / safePeak < NODAL_BAND) nodal += 1;
  }

  return {
    values,
    size,
    peak: safePeak,
    degenerate: peak === 0,
    nodalFraction: nodal / values.length,
  };
}

/**
 * Map one field sample to a 0-1 "how much sand sits here" value, so the
 * renderer needs no arithmetic of its own. Sand gathers where |u| is small,
 * so the intensity is 1 on a nodal line and falls to 0 at an antinode.
 *
 * @param {number} value  field sample
 * @param {number} peak   peak |u| of the field
 * @param {number} spread how far past the nodal band the sand fades out
 */
export function nodalIntensity(value, peak, spread = 6) {
  const safePeak = Number(peak) > 0 ? Number(peak) : 1;
  const normalised = Math.abs(Number(value) || 0) / safePeak;
  const width = NODAL_BAND * Math.max(1, Number(spread) || 1);
  if (normalised >= width) return 0;
  return 1 - normalised / width;
}

/* ------------------------------------------------------------------ */
/* Public entry point                                                  */
/* ------------------------------------------------------------------ */

/**
 * Full simulation for one set of controls.
 * Returns { error } for any non-physical input.
 */
export function simulatePlate({
  frequencyHz,
  sideMm,
  thicknessMm,
  materialKey = "steel",
  dampingRatio = 0.02,
  resolution = DEFAULT_RESOLUTION,
}) {
  const frequency = Number(frequencyHz);
  const side = Number(sideMm);
  const thickness = Number(thicknessMm);
  const damping = Number(dampingRatio);

  if (!Number.isFinite(frequency) || frequency <= 0) {
    return { error: "Enter a drive frequency above 0 Hz." };
  }
  if (!Number.isFinite(side) || side < MIN_SIDE_MM || side > MAX_SIDE_MM) {
    return { error: `Plate side must be between ${MIN_SIDE_MM} and ${MAX_SIDE_MM} mm.` };
  }
  if (!Number.isFinite(thickness) || thickness < MIN_THICKNESS_MM || thickness > MAX_THICKNESS_MM) {
    return { error: `Plate thickness must be between ${MIN_THICKNESS_MM} and ${MAX_THICKNESS_MM} mm.` };
  }
  if (!Number.isFinite(damping) || damping < MIN_DAMPING || damping > MAX_DAMPING) {
    return { error: `Damping ratio must be between ${MIN_DAMPING} and ${MAX_DAMPING}.` };
  }
  if (side / thickness < 20) {
    return {
      error: "Side divided by thickness must be at least 20 — thicker slabs are not thin plates.",
    };
  }

  const material = getMaterial(materialKey);
  const mode = nearestMode({ frequencyHz: frequency, sideMm: side, thicknessMm: thickness, materialKey });
  if (mode.error) return mode;

  const amplitude = amplitudeFactor(frequency, mode.frequency, damping);
  if (amplitude.error) return amplitude;

  const field = chladniField({ m: mode.m, n: mode.n, resolution });
  if (field.error) return field;

  const fundamental = modeFrequency({ m: 1, n: 1, sideMm: side, thicknessMm: thickness, materialKey });
  if (fundamental.error) return fundamental;

  const detunePercent = ((frequency - mode.frequency) / mode.frequency) * 100;

  return {
    material,
    mode: { m: mode.m, n: mode.n },
    modeFrequencyHz: mode.frequency,
    fundamentalHz: fundamental.frequency,
    driveHz: frequency,
    detunePercent,
    onResonance: Math.abs(detunePercent) <= 2,
    amplitudeFactor: amplitude.factor,
    peakAmplitudeFactor: 1 / (2 * damping),
    dampingRatio: damping,
    qualityFactor: 1 / (2 * damping),
    rigidityNm: mode.rigidity,
    airWavelengthM: SPEED_OF_SOUND_MS / frequency,
    audible: frequency >= AUDIBLE_MIN_HZ && frequency <= AUDIBLE_MAX_HZ,
    nodalLinesX: mode.m - 1,
    nodalLinesY: mode.n - 1,
    field,
  };
}
