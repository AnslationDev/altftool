/**
 * Engine displacement comparison.
 *
 * Every figure below is derived from published engine specifications using
 * standard internal-combustion engineering relations. Nothing here is a guess
 * except the clearly-labelled tractability index, whose weights are exported so
 * the reader can see exactly how it is built.
 */

/** 1 metric horsepower (PS) = 735.49875 W exactly (DIN 66036). */
export const PS_TO_KW = 0.73549875;

/** 1 kW = 1.34102 bhp (imperial horsepower). */
export const KW_TO_BHP = 1.3410220896;

/** Crank revolutions per power cycle: 2 for a four-stroke, 1 for a two-stroke. */
export const REVS_PER_CYCLE = { four: 2, two: 1 };

/**
 * Descriptive bands for specific power output (PS per litre) on naturally
 * aspirated motorcycle engines. These describe how highly an engine is tuned;
 * they are not a quality ranking.
 */
export const TUNE_BANDS = [
  { max: 60, label: "Long-stroke, low-stress", note: "Relaxed cruiser or classic tune" },
  { max: 90, label: "Everyday commuter tune", note: "Built for mileage and low-rpm drive" },
  { max: 125, label: "Performance street tune", note: "Sport-touring and performance singles" },
  { max: 160, label: "Supersport-derived", note: "High-rpm, short-stroke design" },
  { max: Infinity, label: "Race-derived, high-rpm", note: "Peak power well past 12,000 rpm" },
];

/**
 * Weights of the heuristic city-tractability index. It is NOT a physical
 * quantity — it blends three things riders actually feel in traffic:
 * torque density, how early peak torque arrives, and kerb weight.
 */
export const TRACTABILITY_WEIGHTS = { torqueDensity: 0.4, torqueRpm: 0.35, weight: 0.25 };

/** Reference points used to normalise each tractability component to 0-1. */
export const TRACTABILITY_REFS = {
  /** 80 Nm/L is a strong figure for a naturally aspirated petrol engine. */
  torqueDensityCeilingNmPerLitre: 80,
  /** Peak torque at 3,000 rpm scores 1; at 7,000 rpm or higher it scores 0. */
  torqueRpmBest: 3000,
  torqueRpmWorst: 7000,
  /** 90 kg scores 1, 220 kg scores 0. */
  weightBestKg: 90,
  weightWorstKg: 220,
};

/**
 * Published manufacturer figures for popular Indian models, used as starting
 * points. Model years differ — edit the fields to match your exact variant.
 */
export const PRESETS = [
  {
    id: "splendor",
    name: "Hero Splendor Plus",
    displacementCc: 97.2,
    powerPs: 8.02,
    powerRpm: 8000,
    torqueNm: 8.05,
    torqueRpm: 6000,
    kerbWeightKg: 112,
    strokeMm: 49.5,
    cylinders: 1,
  },
  {
    id: "activa",
    name: "Honda Activa 110",
    displacementCc: 109.51,
    powerPs: 7.79,
    powerRpm: 8000,
    torqueNm: 8.9,
    torqueRpm: 5250,
    kerbWeightKg: 106,
    strokeMm: 63.1,
    cylinders: 1,
  },
  {
    id: "shine",
    name: "Honda Shine 125",
    displacementCc: 123.94,
    powerPs: 10.59,
    powerRpm: 7500,
    torqueNm: 11,
    torqueRpm: 6000,
    kerbWeightKg: 114,
    strokeMm: 57.5,
    cylinders: 1,
  },
  {
    id: "r15",
    name: "Yamaha YZF-R15",
    displacementCc: 155,
    powerPs: 18.4,
    powerRpm: 10000,
    torqueNm: 14.2,
    torqueRpm: 7500,
    kerbWeightKg: 142,
    strokeMm: 58.7,
    cylinders: 1,
  },
  {
    id: "ns200",
    name: "Bajaj Pulsar NS200",
    displacementCc: 199.5,
    powerPs: 24.5,
    powerRpm: 9750,
    torqueNm: 18.74,
    torqueRpm: 8000,
    kerbWeightKg: 158,
    strokeMm: 49,
    cylinders: 1,
  },
  {
    id: "classic350",
    name: "Royal Enfield Classic 350",
    displacementCc: 349.34,
    powerPs: 20.2,
    powerRpm: 6100,
    torqueNm: 27,
    torqueRpm: 4000,
    kerbWeightKg: 195,
    strokeMm: 85.8,
    cylinders: 1,
  },
  {
    id: "duke390",
    name: "KTM 390 Duke (373 cc)",
    displacementCc: 373.2,
    powerPs: 43.5,
    powerRpm: 9000,
    torqueNm: 37,
    torqueRpm: 7000,
    kerbWeightKg: 167,
    strokeMm: 60,
    cylinders: 1,
  },
  {
    id: "ninja650",
    name: "Kawasaki Ninja 650",
    displacementCc: 649,
    powerPs: 68,
    powerRpm: 8000,
    torqueNm: 64,
    torqueRpm: 6700,
    kerbWeightKg: 196,
    strokeMm: 60,
    cylinders: 2,
  },
];

const MAX_CC = 3000;
const MAX_PS = 400;
const MAX_NM = 300;
const MAX_RPM = 20000;
const MAX_WEIGHT_KG = 600;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const clamp01 = (value) => Math.min(1, Math.max(0, value));

/** Descriptive tuning band for a given specific power in PS per litre. */
export function classifyTune(specificPowerPsPerLitre) {
  const band = TUNE_BANDS.find((entry) => specificPowerPsPerLitre < entry.max);
  return band ?? TUNE_BANDS[TUNE_BANDS.length - 1];
}

/**
 * Brake mean effective pressure in bar.
 * BMEP[Pa] = 2*pi*n_r*T / V_d, with n_r crank revolutions per power cycle and
 * V_d in cubic metres. Converting cc to m^3 and Pa to bar collapses to
 * BMEP[bar] = 20*pi*n_r*T / V_d[cc].
 */
export function bmepBar(torqueNm, displacementCc, strokeCycle = "four") {
  const revs = REVS_PER_CYCLE[strokeCycle] ?? REVS_PER_CYCLE.four;
  if (!(displacementCc > 0) || !isNum(torqueNm)) return null;
  return (20 * Math.PI * revs * torqueNm) / displacementCc;
}

/**
 * Mean piston speed in m/s: v = 2 * stroke * rpm / 60.
 * Production four-strokes sit around 12-22 m/s at peak power; race engines go
 * past 24 m/s.
 */
export function meanPistonSpeed(strokeMm, rpm) {
  if (!(strokeMm > 0) || !(rpm > 0)) return null;
  return (2 * (strokeMm / 1000) * rpm) / 60;
}

/** Heuristic 0-100 index of how easy an engine is to ride at low revs. */
export function tractabilityIndex({ specificTorque, torqueRpm, kerbWeightKg }) {
  const refs = TRACTABILITY_REFS;
  const torqueScore = clamp01(specificTorque / refs.torqueDensityCeilingNmPerLitre);
  const rpmScore = clamp01(
    (refs.torqueRpmWorst - torqueRpm) / (refs.torqueRpmWorst - refs.torqueRpmBest),
  );
  const weightScore = clamp01(
    (refs.weightWorstKg - kerbWeightKg) / (refs.weightWorstKg - refs.weightBestKg),
  );
  const score =
    TRACTABILITY_WEIGHTS.torqueDensity * torqueScore +
    TRACTABILITY_WEIGHTS.torqueRpm * rpmScore +
    TRACTABILITY_WEIGHTS.weight * weightScore;
  return { score: score * 100, torqueScore, rpmScore, weightScore };
}

/** Derive every comparison metric for a single engine specification. */
export function analyseEngine(spec = {}) {
  const {
    name = "Engine",
    displacementCc,
    powerPs,
    powerRpm,
    torqueNm,
    torqueRpm,
    kerbWeightKg,
    strokeMm,
    cylinders = 1,
    strokeCycle = "four",
  } = spec;

  const required = [displacementCc, powerPs, powerRpm, torqueNm, torqueRpm, kerbWeightKg];
  if (required.some((value) => !isNum(value))) {
    return { error: `${name}: fill in displacement, power, torque, their rpm and kerb weight.` };
  }
  if (displacementCc <= 0 || displacementCc > MAX_CC) {
    return { error: `${name}: displacement must be between 1 and ${MAX_CC} cc.` };
  }
  if (powerPs <= 0 || powerPs > MAX_PS) {
    return { error: `${name}: power must be between 0 and ${MAX_PS} PS.` };
  }
  if (torqueNm <= 0 || torqueNm > MAX_NM) {
    return { error: `${name}: torque must be between 0 and ${MAX_NM} Nm.` };
  }
  if (powerRpm <= 0 || powerRpm > MAX_RPM || torqueRpm <= 0 || torqueRpm > MAX_RPM) {
    return { error: `${name}: engine speeds must be between 1 and ${MAX_RPM} rpm.` };
  }
  if (torqueRpm > powerRpm) {
    return { error: `${name}: peak torque cannot come after peak power in the rev range.` };
  }
  if (kerbWeightKg <= 0 || kerbWeightKg > MAX_WEIGHT_KG) {
    return { error: `${name}: kerb weight must be between 1 and ${MAX_WEIGHT_KG} kg.` };
  }
  const cyl = isNum(cylinders) && cylinders >= 1 ? Math.round(cylinders) : 1;

  const litres = displacementCc / 1000;
  const specificPower = powerPs / litres;
  const specificTorque = torqueNm / litres;
  const powerKw = powerPs * PS_TO_KW;
  const powerBhp = powerKw * KW_TO_BHP;
  const powerToWeight = (powerPs / kerbWeightKg) * 1000;
  const torqueToWeight = (torqueNm / kerbWeightKg) * 1000;
  const tract = tractabilityIndex({ specificTorque, torqueRpm, kerbWeightKg });

  return {
    name,
    displacementCc,
    cylinders: cyl,
    perCylinderCc: displacementCc / cyl,
    powerPs,
    powerKw,
    powerBhp,
    powerRpm,
    torqueNm,
    torqueRpm,
    kerbWeightKg,
    specificPower,
    specificTorque,
    powerToWeight,
    torqueToWeight,
    bmep: bmepBar(torqueNm, displacementCc, strokeCycle),
    pistonSpeed: meanPistonSpeed(strokeMm, powerRpm),
    revBand: powerRpm - torqueRpm,
    tune: classifyTune(specificPower),
    tractability: tract.score,
    tractabilityParts: tract,
  };
}

/** Compare two engines and report the percentage difference on each metric. */
export function compareEngines(specA, specB) {
  const a = analyseEngine(specA);
  if (a.error) return { error: a.error };
  const b = analyseEngine(specB);
  if (b.error) return { error: b.error };

  const metrics = [
    { key: "displacementCc", label: "Displacement (cc)", higherIsBetter: null, decimals: 1 },
    { key: "powerPs", label: "Peak power (PS)", higherIsBetter: true, decimals: 2 },
    { key: "torqueNm", label: "Peak torque (Nm)", higherIsBetter: true, decimals: 2 },
    { key: "specificPower", label: "Specific power (PS/L)", higherIsBetter: true, decimals: 1 },
    { key: "specificTorque", label: "Torque density (Nm/L)", higherIsBetter: true, decimals: 1 },
    { key: "powerToWeight", label: "Power to weight (PS/tonne)", higherIsBetter: true, decimals: 1 },
    { key: "torqueToWeight", label: "Torque to weight (Nm/tonne)", higherIsBetter: true, decimals: 1 },
    { key: "bmep", label: "BMEP (bar)", higherIsBetter: true, decimals: 2 },
    { key: "pistonSpeed", label: "Mean piston speed at peak power (m/s)", higherIsBetter: null, decimals: 2 },
    { key: "revBand", label: "Torque-to-power rev spread (rpm)", higherIsBetter: null, decimals: 0 },
    { key: "tractability", label: "City tractability index (heuristic, 0-100)", higherIsBetter: true, decimals: 0 },
  ];

  const rows = metrics.map((metric) => {
    const va = a[metric.key];
    const vb = b[metric.key];
    let deltaPct = null;
    if (isNum(va) && isNum(vb) && va !== 0) deltaPct = ((vb - va) / Math.abs(va)) * 100;
    let winner = null;
    if (metric.higherIsBetter && isNum(va) && isNum(vb) && va !== vb) winner = vb > va ? "b" : "a";
    return { ...metric, a: va, b: vb, deltaPct, winner };
  });

  return { a, b, rows };
}
