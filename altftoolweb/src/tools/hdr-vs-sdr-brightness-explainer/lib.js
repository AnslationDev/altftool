/**
 * HDR vs SDR Brightness Explainer — transfer-function maths.
 *
 * Pure module: PQ (SMPTE ST 2084), HLG (ITU-R BT.2100) and extended Reinhard
 * tone mapping, with no React, DOM or clock dependency.
 */

/** SMPTE ST 2084 (PQ) constants, exactly as published. */
export const PQ = {
  m1: 2610 / 16384, // 0.1593017578125
  m2: (2523 / 4096) * 128, // 78.84375
  c1: 3424 / 4096, // 0.8359375
  c2: (2413 / 4096) * 32, // 18.8515625
  c3: (2392 / 4096) * 32, // 18.6875
  peakNits: 10000, // PQ is defined against a 10,000 cd/m^2 ceiling
};

/** ITU-R BT.2100 HLG OETF constants. */
export const HLG = {
  a: 0.17883277,
  b: 0.28466892,
  c: 0.55991073,
  crossover: 1 / 12, // below this the curve is a square root
};

/** ITU-R BT.2408 puts HDR reference (graphics) white at 203 cd/m^2. */
export const HDR_REFERENCE_WHITE_NITS = 203;

/** Rec. 709 / BT.1886 mastering reference white for SDR in a dim room. */
export const SDR_REFERENCE_WHITE_NITS = 100;

/** BT.1886 grading gamma for a dim surround. */
export const SDR_DISPLAY_GAMMA = 2.4;

export const LIMITS = {
  minHdrPeak: 100,
  maxHdrPeak: 10000,
  minSdrPeak: 50,
  maxSdrPeak: 4000,
  minDiffuseWhite: 50,
  maxDiffuseWhite: 1000,
  minSampleNits: 0,
  maxSampleNits: 10000,
};

/**
 * PQ inverse EOTF: absolute luminance in cd/m^2 to a 0-1 code value.
 * N = ((c1 + c2 * Y^m1) / (1 + c3 * Y^m1))^m2, with Y = nits / 10000.
 */
export function pqEncode(nits) {
  const value = Number(nits);
  if (!Number.isFinite(value) || value <= 0) return 0;
  const y = Math.min(1, value / PQ.peakNits);
  const ym = Math.pow(y, PQ.m1);
  return Math.pow((PQ.c1 + PQ.c2 * ym) / (1 + PQ.c3 * ym), PQ.m2);
}

/** PQ EOTF: a 0-1 code value back to absolute luminance in cd/m^2. */
export function pqDecode(code) {
  const value = Number(code);
  if (!Number.isFinite(value) || value <= 0) return 0;
  const n = Math.pow(Math.min(1, value), 1 / PQ.m2);
  const numerator = Math.max(n - PQ.c1, 0);
  const denominator = PQ.c2 - PQ.c3 * n;
  if (!(denominator > 0)) return PQ.peakNits;
  return Math.pow(numerator / denominator, 1 / PQ.m1) * PQ.peakNits;
}

/**
 * HLG OETF (BT.2100): scene-referred linear 0-1 to a 0-1 signal.
 * sqrt(3E) below E = 1/12, a * ln(12E - b) + c above it.
 */
export function hlgOetf(scene) {
  const e = Number(scene);
  if (!Number.isFinite(e) || e <= 0) return 0;
  const clamped = Math.min(1, e);
  if (clamped <= HLG.crossover) return Math.sqrt(3 * clamped);
  return HLG.a * Math.log(12 * clamped - HLG.b) + HLG.c;
}

/** Inverse HLG OETF: 0-1 signal back to scene-referred linear 0-1. */
export function hlgInverseOetf(signal) {
  const v = Number(signal);
  if (!Number.isFinite(v) || v <= 0) return 0;
  const clamped = Math.min(1, v);
  if (clamped <= 0.5) return (clamped * clamped) / 3;
  return (Math.exp((clamped - HLG.c) / HLG.a) + HLG.b) / 12;
}

/** Ratio between two luminance levels expressed in photographic stops. */
export function stopsBetween(brighter, darker) {
  const a = Number(brighter);
  const b = Number(darker);
  if (!Number.isFinite(a) || !Number.isFinite(b) || a <= 0 || b <= 0) return 0;
  return Math.log2(a / b);
}

/**
 * Extended Reinhard tone map with a white point:
 * Lout = L * (1 + L / Lwhite^2) / (1 + L)
 * L and Lwhite are relative to the SDR display peak, so Lwhite = hdrPeak/sdrPeak.
 */
export function reinhardToneMap({ nits, hdrPeakNits, sdrPeakNits } = {}) {
  const value = Number(nits);
  const hdrPeak = Number(hdrPeakNits);
  const sdrPeak = Number(sdrPeakNits);
  if (![value, hdrPeak, sdrPeak].every(Number.isFinite)) return 0;
  if (value <= 0 || sdrPeak <= 0 || hdrPeak <= 0) return 0;

  const l = value / sdrPeak;
  const white = hdrPeak / sdrPeak;
  const mapped = (l * (1 + l / (white * white))) / (1 + l);
  return Math.min(1, Math.max(0, mapped)) * sdrPeak;
}

/**
 * What a naive SDR player does with an HDR signal: it takes the PQ code value
 * and feeds it to a BT.1886 gamma display as if it were an SDR signal.
 * output = sdrPeak * code^gamma
 */
export function naiveSdrPlayback({ nits, sdrPeakNits, gamma = SDR_DISPLAY_GAMMA } = {}) {
  const code = pqEncode(nits);
  const sdrPeak = Number(sdrPeakNits);
  const g = Number(gamma);
  if (!Number.isFinite(sdrPeak) || sdrPeak <= 0 || !Number.isFinite(g) || g <= 0) return 0;
  return sdrPeak * Math.pow(Math.min(1, Math.max(0, code)), g);
}

/** Luminance levels worth showing on a comparison ladder, in cd/m^2. */
export const REFERENCE_LEVELS = [
  { id: "shadow", label: "Deep shadow detail", nits: 0.1 },
  { id: "dark", label: "Dark interior", nits: 1 },
  { id: "midtone", label: "Midtone", nits: 20 },
  { id: "sdr-white", label: "SDR reference white", nits: SDR_REFERENCE_WHITE_NITS },
  { id: "hdr-white", label: "HDR reference white (BT.2408)", nits: HDR_REFERENCE_WHITE_NITS },
  { id: "skin-specular", label: "Specular highlight on skin", nits: 600 },
  { id: "chrome", label: "Sun on chrome", nits: 1000 },
  { id: "cloud", label: "Bright cloud edge", nits: 4000 },
  { id: "sun", label: "PQ ceiling", nits: PQ.peakNits },
];

/**
 * Full comparison for one HDR/SDR pairing.
 *
 * @param {object} input
 * @param {number} input.hdrPeakNits      HDR mastering or display peak.
 * @param {number} input.sdrPeakNits      SDR display peak white.
 * @param {number} input.diffuseWhiteNits diffuse (paper) white in the HDR grade.
 * @param {number} input.sampleNits       the level you want explained.
 */
export function analyseHdrVsSdr({
  hdrPeakNits,
  sdrPeakNits,
  diffuseWhiteNits = HDR_REFERENCE_WHITE_NITS,
  sampleNits,
} = {}) {
  const hdrPeak = Number(hdrPeakNits);
  const sdrPeak = Number(sdrPeakNits);
  const diffuse = Number(diffuseWhiteNits);
  const sample = Number(sampleNits);

  if (![hdrPeak, sdrPeak, diffuse, sample].every(Number.isFinite)) {
    return { error: "Enter valid numbers for every brightness value." };
  }
  if (hdrPeak < LIMITS.minHdrPeak || hdrPeak > LIMITS.maxHdrPeak) {
    return { error: `HDR peak must be between ${LIMITS.minHdrPeak} and ${LIMITS.maxHdrPeak} nits.` };
  }
  if (sdrPeak < LIMITS.minSdrPeak || sdrPeak > LIMITS.maxSdrPeak) {
    return { error: `SDR display peak must be between ${LIMITS.minSdrPeak} and ${LIMITS.maxSdrPeak} nits.` };
  }
  if (diffuse < LIMITS.minDiffuseWhite || diffuse > LIMITS.maxDiffuseWhite) {
    return {
      error: `Diffuse white must be between ${LIMITS.minDiffuseWhite} and ${LIMITS.maxDiffuseWhite} nits.`,
    };
  }
  if (diffuse > hdrPeak) {
    return { error: "Diffuse white cannot be brighter than the HDR peak." };
  }
  if (sample < LIMITS.minSampleNits || sample > LIMITS.maxSampleNits) {
    return { error: `The sample level must be between 0 and ${LIMITS.maxSampleNits} nits.` };
  }

  const toneMapped = reinhardToneMap({ nits: sample, hdrPeakNits: hdrPeak, sdrPeakNits: sdrPeak });
  const naive = naiveSdrPlayback({ nits: sample, sdrPeakNits: sdrPeak });

  const ladder = REFERENCE_LEVELS.map((level) => ({
    ...level,
    pqCode: pqEncode(level.nits),
    hlgSignal: hlgOetf(Math.min(1, level.nits / hdrPeak)),
    toneMappedNits: reinhardToneMap({
      nits: level.nits,
      hdrPeakNits: hdrPeak,
      sdrPeakNits: sdrPeak,
    }),
    stopsOverDiffuse: stopsBetween(level.nits, diffuse),
    clippedOnSdr: level.nits > sdrPeak,
  }));

  return {
    hdrPeakNits: hdrPeak,
    sdrPeakNits: sdrPeak,
    diffuseWhiteNits: diffuse,
    sampleNits: sample,
    samplePqCode: pqEncode(sample),
    sampleHlgSignal: hlgOetf(Math.min(1, sample / hdrPeak)),
    specularHeadroomStops: stopsBetween(hdrPeak, diffuse),
    sdrHeadroomStops: stopsBetween(sdrPeak, diffuse),
    peakAdvantageStops: stopsBetween(hdrPeak, sdrPeak),
    toneMappedNits: toneMapped,
    naivePlaybackNits: naive,
    naiveLossStops: naive > 0 && toneMapped > 0 ? stopsBetween(toneMapped, naive) : 0,
    sampleClipsOnSdr: sample > sdrPeak,
    ladder,
  };
}
