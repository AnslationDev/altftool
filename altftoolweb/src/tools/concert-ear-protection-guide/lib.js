/**
 * Concert hearing protection maths.
 *
 * Three rating systems are supported, each with its own published derivation:
 *
 * 1. NRR (Noise Reduction Rating, US EPA label under 40 CFR Part 211, measured to ANSI S3.19).
 *    When the noise level is measured in dB(A), the OSHA method subtracts a 7 dB correction:
 *        protected dB(A) = level dB(A) - (NRR - 7)
 *    Laboratory NRR badly overstates real-world fit, so NIOSH (Criteria for a Recommended
 *    Standard: Occupational Noise Exposure, 1998) recommends derating the NRR before use —
 *    by 25% for earmuffs, 50% for slow-recovery formable earplugs and 70% for all other
 *    earplugs. This tool applies the NIOSH derating by default and shows the figure
 *    before derating alongside it for comparison.
 *
 * 2. SNR (Single Number Rating, EN ISO 4869-2, used on European packaging). SNR is subtracted
 *    from the C-weighted level:
 *        protected dB(A) = level dB(C) - SNR
 *
 * 3. Uniform / flat attenuation, as quoted for musician filters (an ER-20 style filter is
 *    sold as roughly 20 dB of near-flat attenuation). The stated figure is subtracted directly.
 *
 * Exposure time uses the NIOSH recommended exposure limit: 85 dB(A) for 8 hours a day with a
 * 3 dB exchange rate, so permitted time halves for every 3 dB increase.
 *
 * Informational only. Real-world attenuation depends almost entirely on fit.
 */

/** OSHA correction applied when an NRR is used against an A-weighted level. */
export const NRR_A_WEIGHTED_CORRECTION_DB = 7;

/** NIOSH real-world derating factors for laboratory NRR values. */
export const NIOSH_DERATING = {
  earmuff: 0.25,
  formable: 0.5,
  other: 0.7,
};

export const PROTECTOR_TYPES = [
  { value: "earmuff", label: "Earmuffs", derate: NIOSH_DERATING.earmuff },
  { value: "formable", label: "Foam / formable earplugs", derate: NIOSH_DERATING.formable },
  { value: "other", label: "Pre-moulded, custom or banded plugs", derate: NIOSH_DERATING.other },
];

/** NIOSH recommended exposure limit: 85 dB(A) for 8 hours, 3 dB exchange rate. */
export const NIOSH_LEVEL_DB = 85;
export const NIOSH_HOURS = 8;
export const EXCHANGE_RATE_DB = 3;

/** Accepted input ranges. Marketed NRR tops out around 33-34 dB; SNR around 37 dB. */
export const MIN_LEVEL_DB = 60;
export const MAX_LEVEL_DB = 140;
export const MAX_NRR_DB = 40;
export const MAX_SNR_DB = 40;
export const MAX_UNIFORM_DB = 40;
export const MAX_DURATION_MINUTES = 1440;

/** Typical measured levels at live events, for orientation only (dB(A)). */
export const VENUE_LEVELS = [
  { level: 85, label: "Acoustic set, small bar" },
  { level: 95, label: "Club night, back of the room" },
  { level: 100, label: "Rock gig, mid floor" },
  { level: 105, label: "Front rows / near the stacks" },
  { level: 110, label: "Festival main stage, front barrier" },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** NIOSH permitted hours at an A-weighted level (85 dB(A) / 8 h, 3 dB exchange rate). */
export function permittedHours(levelDb) {
  if (!isNum(levelDb)) return NaN;
  return NIOSH_HOURS * 2 ** ((NIOSH_LEVEL_DB - levelDb) / EXCHANGE_RATE_DB);
}

/** Renders a duration given in hours as a readable string. */
export function formatHours(hours) {
  if (!isNum(hours) || hours < 0) return "—";
  const totalSeconds = Math.round(hours * 3600);
  if (totalSeconds < 60) return `${totalSeconds} s`;
  const totalMinutes = Math.round(totalSeconds / 60);
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0 ? `${wholeHours} h` : `${wholeHours} h ${minutes} min`;
}

/**
 * @param {{
 *   levelDb:number, method:"nrr"|"snr"|"uniform", ratingDb:number,
 *   protectorType:"earmuff"|"formable"|"other", cMinusA:number, durationMinutes:number
 * }} input
 * @returns {{error:string}|{
 *   method:string, unprotectedLevelDb:number, protectedLevelDb:number, reductionDb:number,
 *   labelReductionDb:number|null, deratedRatingDb:number|null, derateFactor:number|null,
 *   levelCDb:number|null,
 *   permittedHoursUnprotected:number, permittedHoursProtected:number,
 *   doseWithoutPercent:number, doseWithPercent:number,
 *   durationMinutes:number, safeWithProtection:boolean, safeWithout:boolean,
 *   verdict:string
 * }}
 */
export function computeProtection({
  levelDb = 100,
  method = "nrr",
  ratingDb = 33,
  protectorType = "formable",
  cMinusA = 3,
  durationMinutes = 180,
} = {}) {
  if (![levelDb, ratingDb, durationMinutes].every(isNum)) {
    return { error: "Enter valid numbers for level, rating and duration." };
  }
  if (levelDb < MIN_LEVEL_DB || levelDb > MAX_LEVEL_DB) {
    return { error: `Venue level must be between ${MIN_LEVEL_DB} and ${MAX_LEVEL_DB} dB(A).` };
  }
  if (durationMinutes <= 0 || durationMinutes > MAX_DURATION_MINUTES) {
    return { error: `Time at the venue must be between 1 and ${MAX_DURATION_MINUTES} minutes.` };
  }
  if (ratingDb < 0) return { error: "A protection rating cannot be negative." };

  let protectedLevelDb;
  let labelReductionDb = null;
  let deratedRatingDb = null;
  let derateFactor = null;
  let levelCDb = null;

  if (method === "nrr") {
    if (ratingDb > MAX_NRR_DB) {
      return { error: `NRR values above ${MAX_NRR_DB} dB are not sold — check the label.` };
    }
    const type = PROTECTOR_TYPES.find((entry) => entry.value === protectorType);
    if (!type) return { error: "Choose a protector type so the NIOSH derating can be applied." };
    derateFactor = type.derate;
    deratedRatingDb = ratingDb * (1 - derateFactor);
    labelReductionDb = Math.max(0, ratingDb - NRR_A_WEIGHTED_CORRECTION_DB);
    protectedLevelDb = levelDb - Math.max(0, deratedRatingDb - NRR_A_WEIGHTED_CORRECTION_DB);
  } else if (method === "snr") {
    if (ratingDb > MAX_SNR_DB) {
      return { error: `SNR values above ${MAX_SNR_DB} dB are not sold — check the label.` };
    }
    if (!isNum(cMinusA)) {
      return { error: "Enter a valid number for the C minus A offset." };
    }
    if (cMinusA < 0 || cMinusA > 15) {
      return { error: "The C minus A offset should be between 0 and 15 dB." };
    }
    levelCDb = levelDb + cMinusA;
    labelReductionDb = ratingDb;
    protectedLevelDb = levelCDb - ratingDb;
  } else if (method === "uniform") {
    if (ratingDb > MAX_UNIFORM_DB) {
      return { error: `Flat attenuation above ${MAX_UNIFORM_DB} dB is not realistic for a filter.` };
    }
    labelReductionDb = ratingDb;
    protectedLevelDb = levelDb - ratingDb;
  } else {
    return { error: "Choose NRR, SNR or a flat musician filter rating." };
  }

  // Protection cannot take the level below the venue's own quiet floor in any useful sense;
  // clamp so absurd label maths never returns a level below normal conversation.
  protectedLevelDb = Math.max(protectedLevelDb, 30);

  const reductionDb = levelDb - protectedLevelDb;
  const durationHours = durationMinutes / 60;
  const permittedUnprotected = permittedHours(levelDb);
  const permittedProtected = permittedHours(protectedLevelDb);

  const doseWithoutPercent =
    permittedUnprotected > 0 ? (durationHours / permittedUnprotected) * 100 : Infinity;
  const doseWithPercent =
    permittedProtected > 0 ? (durationHours / permittedProtected) * 100 : Infinity;

  const safeWithProtection = doseWithPercent <= 100;
  const safeWithout = doseWithoutPercent <= 100;

  let verdict;
  if (safeWithProtection) verdict = "Inside the NIOSH daily exposure limit with this protection";
  else if (doseWithPercent <= 200) verdict = "Slightly over the NIOSH daily exposure limit";
  else verdict = "Well over the NIOSH daily exposure limit — stronger protection or less time";

  return {
    method,
    unprotectedLevelDb: levelDb,
    protectedLevelDb,
    reductionDb,
    labelReductionDb,
    deratedRatingDb,
    derateFactor,
    levelCDb,
    permittedHoursUnprotected: permittedUnprotected,
    permittedHoursProtected: permittedProtected,
    doseWithoutPercent,
    doseWithPercent,
    durationMinutes,
    safeWithProtection,
    safeWithout,
    verdict,
  };
}
