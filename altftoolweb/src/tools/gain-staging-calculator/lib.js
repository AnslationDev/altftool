/**
 * Gain-staging unit conversion.
 *
 * The three level scales in common use are anchored to different references:
 *   dBu   — 0 dBu = 0.774597 V RMS, the voltage that dissipates 1 mW in 600 Ω.
 *   dBV   — 0 dBV = 1 V RMS.
 *   dBFS  — 0 dBFS = digital full scale, the largest sample a converter holds.
 *
 * dBu and dBV are absolute (they describe a voltage), so
 *     dBV = dBu + 20·log10(0.774597) = dBu − 2.2185
 * dBFS is not absolute: linking it to a voltage needs an ALIGNMENT STANDARD
 * that fixes how much analogue headroom sits above the reference level. That
 * one number — the dBu that corresponds to 0 dBFS — is the only thing that
 * changes between regions.
 */

/** 0 dBu reference: sqrt(0.6) volts = 1 mW into 600 Ω. */
export const V_REF_DBU = Math.sqrt(0.6);
/** 0 dBV reference: 1 volt RMS. */
export const V_REF_DBV = 1;
/** Fixed offset between the two voltage scales: 20·log10(0.774597). */
export const DBU_TO_DBV_OFFSET = 20 * Math.log10(V_REF_DBU);

/** Amplitude ratios use 20·log10. */
export const AMPLITUDE_DB_FACTOR = 20;

/** Full-scale integer values for the two common PCM word lengths. */
export const FULL_SCALE_16BIT = 32767;
export const FULL_SCALE_24BIT = 8388607;

/**
 * Published alignment standards. Each fixes a reference dBu level at a
 * particular dBFS level; "zeroDbfsDbu" is the analogue level that would
 * correspond to digital full scale.
 *  - EBU R68: alignment signal 0 dBu recorded at −18 dBFS (18 dB headroom).
 *  - SMPTE RP155: 0 VU (+4 dBu) recorded at −20 dBFS (24 dBu at full scale).
 *  - ARD/German broadcast PPM: +6 dBu at −9 dBFS.
 */
export const ALIGNMENT_PRESETS = [
  {
    id: "ebu-r68",
    label: "EBU R68 — 0 dBu at −18 dBFS",
    referenceDbu: 0,
    referenceDbfs: -18,
    zeroDbfsDbu: 18,
  },
  {
    id: "smpte-rp155",
    label: "SMPTE RP155 — +4 dBu at −20 dBFS",
    referenceDbu: 4,
    referenceDbfs: -20,
    zeroDbfsDbu: 24,
  },
  {
    id: "ard-ppm",
    label: "ARD / German PPM — +6 dBu at −9 dBFS",
    referenceDbu: 6,
    referenceDbfs: -9,
    zeroDbfsDbu: 15,
  },
  {
    id: "ebu-r68-plus4",
    label: "EBU R68 with +4 dBu line-up — +4 dBu at −18 dBFS",
    referenceDbu: 4,
    referenceDbfs: -18,
    zeroDbfsDbu: 22,
  },
];

/**
 * Practical working targets. These are studio convention, not standards:
 * tracking peaks are kept well below clipping so converters and plugins stay
 * in their linear range, and −18 dBFS RMS is the level most analogue-modelled
 * plugins are calibrated to treat as 0 VU.
 */
export const STAGE_TARGETS = [
  { id: "record", label: "Recording peaks", peakDbfs: -12, note: "Leaves 12 dB for transients you did not rehearse" },
  { id: "track-avg", label: "Track average (RMS)", peakDbfs: -18, note: "Sweet spot for analogue-modelled plugins" },
  { id: "bus", label: "Bus / subgroup peaks", peakDbfs: -10, note: "Keeps summing away from the ceiling" },
  { id: "master", label: "Master true peak", peakDbfs: -1, note: "Standard streaming true-peak ceiling" },
];

/** Units the converter accepts. */
export const UNITS = [
  { id: "dbfs", label: "dBFS (digital)" },
  { id: "dbu", label: "dBu (analogue)" },
  { id: "dbv", label: "dBV (analogue)" },
  { id: "volts", label: "Volts RMS" },
  { id: "percent", label: "% of full scale" },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

export function dbuToVolts(dbu) {
  if (!isNum(dbu)) return NaN;
  return V_REF_DBU * 10 ** (dbu / AMPLITUDE_DB_FACTOR);
}

export function voltsToDbu(volts) {
  if (!isNum(volts) || volts <= 0) return NaN;
  return AMPLITUDE_DB_FACTOR * Math.log10(volts / V_REF_DBU);
}

export function dbvToVolts(dbv) {
  if (!isNum(dbv)) return NaN;
  return V_REF_DBV * 10 ** (dbv / AMPLITUDE_DB_FACTOR);
}

export function voltsToDbv(volts) {
  if (!isNum(volts) || volts <= 0) return NaN;
  return AMPLITUDE_DB_FACTOR * Math.log10(volts / V_REF_DBV);
}

/** dBFS -> linear sample amplitude (0…1 at or below full scale). */
export function dbfsToAmplitude(dbfs) {
  if (!isNum(dbfs)) return NaN;
  return 10 ** (dbfs / AMPLITUDE_DB_FACTOR);
}

export function amplitudeToDbfs(amplitude) {
  if (!isNum(amplitude) || amplitude <= 0) return NaN;
  return AMPLITUDE_DB_FACTOR * Math.log10(amplitude);
}

/** Lowest level worth showing; below this the numbers are meaningless. */
export const MIN_DBFS = -144;

/**
 * Convert one entered level into every other unit.
 *
 * @param {object} input
 * @param {number} input.value        The number the user typed.
 * @param {string} input.unit         Which unit it is in (see UNITS).
 * @param {number} input.zeroDbfsDbu  Analogue dBu level equal to 0 dBFS.
 * @returns {object} the level in all units, or { error }.
 */
export function convertLevel({ value, unit, zeroDbfsDbu } = {}) {
  if (!isNum(value) || !isNum(zeroDbfsDbu)) {
    return { error: "Enter a number for both the level and the alignment." };
  }
  if (!UNITS.some((u) => u.id === unit)) {
    return { error: "Choose a unit for the level you entered." };
  }
  if (zeroDbfsDbu < 0 || zeroDbfsDbu > 40) {
    return { error: "Alignment must place 0 dBFS between 0 and +40 dBu." };
  }

  let dbfs;
  if (unit === "dbfs") {
    dbfs = value;
  } else if (unit === "dbu") {
    dbfs = value - zeroDbfsDbu;
  } else if (unit === "dbv") {
    dbfs = value - DBU_TO_DBV_OFFSET - zeroDbfsDbu;
  } else if (unit === "volts") {
    if (value <= 0) return { error: "Voltage must be greater than zero." };
    dbfs = voltsToDbu(value) - zeroDbfsDbu;
  } else {
    if (value <= 0) return { error: "Percentage of full scale must be greater than zero." };
    if (value > 100) return { error: "Percentage of full scale cannot exceed 100%." };
    dbfs = amplitudeToDbfs(value / 100);
  }

  if (!isNum(dbfs)) return { error: "That level could not be converted." };
  if (dbfs > 0) {
    return { error: "That level is above 0 dBFS — it would clip the converter." };
  }
  if (dbfs < MIN_DBFS) {
    return { error: `Levels below ${MIN_DBFS} dBFS are below the noise floor of 24-bit audio.` };
  }

  const dbu = dbfs + zeroDbfsDbu;
  const dbv = dbu + DBU_TO_DBV_OFFSET;
  const volts = dbuToVolts(dbu);
  const amplitude = dbfsToAmplitude(dbfs);

  return {
    dbfs,
    dbu,
    dbv,
    volts,
    millivolts: volts * 1000,
    amplitude,
    percent: amplitude * 100,
    sample16: Math.round(amplitude * FULL_SCALE_16BIT),
    sample24: Math.round(amplitude * FULL_SCALE_24BIT),
    headroomDb: -dbfs,
    zeroDbfsDbu,
  };
}

/**
 * Gain change needed to move from one dBFS level to another,
 * plus the fader multiplier that represents.
 */
export function gainToTarget(currentDbfs, targetDbfs) {
  if (!isNum(currentDbfs) || !isNum(targetDbfs)) return { error: "Enter both levels." };
  if (currentDbfs > 0 || targetDbfs > 0) return { error: "Levels cannot be above 0 dBFS." };
  const gainDb = targetDbfs - currentDbfs;
  return { gainDb, multiplier: dbfsToAmplitude(gainDb) };
}
