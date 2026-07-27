/**
 * Noise Reduction Rating Calculator.
 *
 * Converts a hearing protector's labelled rating (US NRR or European SNR) into an estimated
 * A-weighted level at the ear, using the three published field-adjustment methods, and then
 * compares that level against the OSHA permissible exposure limit and the NIOSH recommended
 * exposure limit.
 *
 * Sources for every rule and constant below:
 *  - NRR labelling: US EPA, 40 CFR Part 211 Subpart B; measured per ANSI S3.19-1974.
 *  - SNR labelling: ISO 4869-2, applied to a C-weighted level.
 *  - OSHA field adjustment and the 50% safety factor: OSHA Technical Manual Section III
 *    Chapter 5 (Noise), and OSHA directive CPL 02-02-035 Appendix IV.
 *  - NIOSH derating and dual-protection rule: NIOSH Publication 98-126, "Criteria for a
 *    Recommended Standard: Occupational Noise Exposure", Chapter 6.
 *  - Permissible exposure durations: OSHA 29 CFR 1910.95 Appendix A (5 dB exchange rate);
 *    NIOSH 98-126 (3 dB exchange rate).
 *
 * Pure module: no clock, no DOM, no React.
 */

/* ------------------------------------------------------------------ *
 * Published constants
 * ------------------------------------------------------------------ */

/**
 * The 7 dB spectral correction. NRR is derived from C-weighted test data, so when the
 * workplace level was measured in dBA, 7 dB is subtracted from the NRR before it is applied.
 * (OSHA Technical Manual III:5; EPA 40 CFR 211.)
 */
export const C_TO_A_CORRECTION_DB = 7;

/**
 * OSHA's recommended safety factor: halve the field-adjusted NRR when using a protector in a
 * hearing conservation programme. (OSHA CPL 02-02-035 Appendix IV.)
 */
export const OSHA_SAFETY_FACTOR = 0.5;

/**
 * Bonus for wearing plugs and muffs together. Both OSHA and NIOSH allow 5 dB to be added to
 * the higher of the two labelled ratings — attenuation is not additive because bone
 * conduction sets a practical ceiling. (NIOSH 98-126 Ch. 6; OSHA CPL 02-02-035.)
 */
export const DUAL_PROTECTION_BONUS_DB = 5;

/**
 * Typical offset between the European SNR and the US NRR for the same protector: SNR labels
 * run about 3 dB higher because of the different test standard. Used only to bring an SNR
 * label into the NRR-based formulas below; it is an approximation, not a defined conversion.
 */
export const SNR_TO_NRR_OFFSET_DB = 3;

/**
 * NIOSH derating factors by device class — the proportion of the labelled rating NIOSH says
 * to discard to reflect real-world fit. (NIOSH 98-126 Ch. 6.)
 */
export const DEVICE_TYPES = [
  {
    id: "earmuff",
    label: "Earmuff",
    nioshDerate: 0.25,
    note: "NIOSH subtracts 25% from a labelled earmuff rating.",
  },
  {
    id: "foam-plug",
    label: "Formable (slow-recovery foam) earplug",
    nioshDerate: 0.5,
    note: "NIOSH subtracts 50% from a labelled formable earplug rating.",
  },
  {
    id: "other-plug",
    label: "Pre-moulded, flanged or banded earplug",
    nioshDerate: 0.7,
    note: "NIOSH subtracts 70% from all other earplug ratings.",
  },
];

/** The three field-adjustment methods this tool implements. */
export const METHODS = [
  {
    id: "osha",
    label: "OSHA (no safety factor)",
    description:
      "dBA exposure minus (NRR − 7); against a C-weighted measurement the full NRR is subtracted.",
  },
  {
    id: "osha50",
    label: "OSHA 50% derating",
    description:
      "dBA exposure minus [(NRR − 7) × 50%] — OSHA's recommended safety factor for hearing conservation programmes.",
  },
  {
    id: "niosh",
    label: "NIOSH device derating",
    description:
      "The labelled rating is cut by 25% (muffs), 50% (foam plugs) or 70% (other plugs) first, then the 7 dB A-weighting correction is applied.",
  },
];

/** Label systems the calculator accepts. */
export const RATING_TYPES = [
  { id: "nrr", label: "NRR (US, EPA label)" },
  { id: "snr", label: "SNR (Europe, ISO 4869-2)" },
];

/** Sound level meter weighting used for the workplace measurement. */
export const WEIGHTINGS = [
  { id: "A", label: "dBA (A-weighted)" },
  { id: "C", label: "dBC (C-weighted)" },
];

/** OSHA permissible exposure limit: 90 dBA as an 8-hour TWA. (29 CFR 1910.95(b)(2).) */
export const OSHA_PEL_DBA = 90;
/** OSHA hearing conservation action level: 85 dBA as an 8-hour TWA. (29 CFR 1910.95(c).) */
export const OSHA_ACTION_LEVEL_DBA = 85;
/** OSHA exchange rate: exposure time halves for every 5 dB. (29 CFR 1910.95 Appendix A.) */
export const OSHA_EXCHANGE_RATE_DB = 5;

/** NIOSH recommended exposure limit: 85 dBA as an 8-hour TWA. (NIOSH 98-126.) */
export const NIOSH_REL_DBA = 85;
/** NIOSH exchange rate: exposure time halves for every 3 dB. (NIOSH 98-126.) */
export const NIOSH_EXCHANGE_RATE_DB = 3;

/** The reference working day both criteria are built on. */
export const REFERENCE_SHIFT_HOURS = 8;

/**
 * Below roughly 70 dBA at the ear a worker starts losing warning signals, speech and machine
 * cues. NIOSH treats this as overprotection and advises a lower-rated device instead.
 */
export const OVERPROTECTION_THRESHOLD_DBA = 70;

/** Input bounds. Labelled ratings above these do not exist on real products. */
export const LIMITS = {
  level: { min: 40, max: 140 },
  nrr: { min: 0, max: 40 },
  snr: { min: 0, max: 45 },
  hours: { min: 0.1, max: 24 },
};

/** Any exposure time longer than this is reported as effectively unlimited for one shift. */
export const UNLIMITED_HOURS = 24;

export function getDeviceType(id) {
  return DEVICE_TYPES.find((device) => device.id === id) || null;
}

export function getMethod(id) {
  return METHODS.find((method) => method.id === id) || null;
}

/* ------------------------------------------------------------------ *
 * Core maths
 * ------------------------------------------------------------------ */

/** Round to one decimal place without floating-point tails. */
function round1(value) {
  return Math.round(value * 10) / 10;
}

/**
 * Bring an SNR label onto the NRR scale used by the OSHA and NIOSH formulas.
 * NRR labels pass through unchanged.
 */
export function toNrrEquivalent(rating, ratingType) {
  const value = Number(rating);
  if (!Number.isFinite(value)) return null;
  if (ratingType === "snr") return Math.max(0, value - SNR_TO_NRR_OFFSET_DB);
  return value;
}

/**
 * Effective attenuation in dB for one field-adjustment method.
 *
 * @param {number} nrr        Labelled NRR (or NRR-equivalent of an SNR).
 * @param {string} methodId   "osha" | "osha50" | "niosh"
 * @param {string} weighting  "A" | "C" — how the workplace level was measured.
 * @param {number} nioshDerate Proportion of the label NIOSH discards for this device class.
 * @returns {number} dB of attenuation, never negative.
 */
export function effectiveAttenuation({ nrr, methodId, weighting, nioshDerate }) {
  const label = Number(nrr);
  if (!Number.isFinite(label) || label < 0) return 0;
  // Against a C-weighted measurement the 7 dB spectral correction is not applied at all.
  const correction = weighting === "C" ? 0 : C_TO_A_CORRECTION_DB;

  let attenuation;
  if (methodId === "osha") {
    attenuation = label - correction;
  } else if (methodId === "osha50") {
    // OSHA applies the 7 dB correction first, then halves the result.
    attenuation = (label - correction) * OSHA_SAFETY_FACTOR;
  } else if (methodId === "niosh") {
    // NIOSH cuts the label by the device factor first, then the correction is applied.
    const derate = Number.isFinite(nioshDerate) ? nioshDerate : 0;
    attenuation = label * (1 - derate) - correction;
  } else {
    return 0;
  }
  return Math.max(0, round1(attenuation));
}

/**
 * Permissible exposure time at a given A-weighted level.
 *
 *   OSHA  (29 CFR 1910.95 App. A):  T = 8 / 2^((L − 90) / 5)   hours
 *   NIOSH (98-126):                 T = 480 / 2^((L − 85) / 3) minutes
 *
 * @returns {number} hours, capped at UNLIMITED_HOURS.
 */
export function allowedExposureHours(levelDba, criterion) {
  const level = Number(levelDba);
  if (!Number.isFinite(level)) return 0;
  const limit = criterion === "niosh" ? NIOSH_REL_DBA : OSHA_PEL_DBA;
  const exchange = criterion === "niosh" ? NIOSH_EXCHANGE_RATE_DB : OSHA_EXCHANGE_RATE_DB;
  const hours = REFERENCE_SHIFT_HOURS / Math.pow(2, (level - limit) / exchange);
  if (!Number.isFinite(hours) || hours <= 0) return 0;
  return Math.min(UNLIMITED_HOURS, hours);
}

/**
 * Daily noise dose as a percentage of the criterion, from the uncapped exposure-time formula:
 *
 *   dose% = 100 x hours / T,  where T = 8 / 2^((L − limit) / exchange)
 *         = 100 x hours x 2^((L − limit) / exchange) / 8
 *
 * 100% is exactly the permissible daily exposure. (OSHA 29 CFR 1910.95 Appendix A; the same
 * form with the NIOSH limit and 3 dB exchange rate gives the NIOSH dose.)
 */
export function noiseDosePercent(levelDba, hours, criterion) {
  const level = Number(levelDba);
  const time = Number(hours);
  if (!Number.isFinite(level) || !Number.isFinite(time) || time <= 0) return null;
  const limit = criterion === "niosh" ? NIOSH_REL_DBA : OSHA_PEL_DBA;
  const exchange = criterion === "niosh" ? NIOSH_EXCHANGE_RATE_DB : OSHA_EXCHANGE_RATE_DB;
  const dose = (100 * time * Math.pow(2, (level - limit) / exchange)) / REFERENCE_SHIFT_HOURS;
  if (!Number.isFinite(dose)) return null;
  return Math.round(dose * 10) / 10;
}

/** "6 h 12 m", "45 m", "over 24 h". */
export function formatHours(hours) {
  const value = Number(hours);
  if (!Number.isFinite(value) || value < 0) return "0 m";
  if (value >= UNLIMITED_HOURS) return "over 24 h";
  const whole = Math.floor(value);
  const minutes = Math.round((value - whole) * 60);
  if (whole === 0) return `${minutes} m`;
  if (minutes === 0) return `${whole} h`;
  if (minutes === 60) return `${whole + 1} h`;
  return `${whole} h ${minutes} m`;
}

/**
 * Full protected-level assessment.
 *
 * @param {object} input
 * @param {number} input.measuredLevel   Workplace level, in the weighting given below.
 * @param {string} input.weighting       "A" | "C"
 * @param {number} input.rating          Labelled NRR or SNR of the primary device.
 * @param {string} input.ratingType      "nrr" | "snr"
 * @param {string} input.deviceTypeId    Device class of the primary device.
 * @param {string} input.methodId        Field-adjustment method.
 * @param {boolean} [input.dualProtection] Plugs and muffs worn together.
 * @param {number} [input.secondRating]  Labelled rating of the second device.
 * @param {string} [input.secondDeviceTypeId] Device class of the second device.
 * @param {number} [input.exposureHours] Hours per shift spent in the noise.
 * @returns {{error:string}|object}
 */
export function calculateProtectedLevel({
  measuredLevel,
  weighting = "A",
  rating,
  ratingType = "nrr",
  deviceTypeId,
  methodId,
  dualProtection = false,
  secondRating,
  secondDeviceTypeId,
  exposureHours = REFERENCE_SHIFT_HOURS,
} = {}) {
  const level = Number(measuredLevel);
  if (!Number.isFinite(level)) {
    return { error: "Enter the measured noise level from your sound level meter." };
  }
  if (level < LIMITS.level.min || level > LIMITS.level.max) {
    return {
      error: `Measured level must be between ${LIMITS.level.min} and ${LIMITS.level.max} dB.`,
    };
  }
  if (weighting !== "A" && weighting !== "C") {
    return { error: "Choose whether the level was measured in dBA or dBC." };
  }

  const ratingBounds = ratingType === "snr" ? LIMITS.snr : LIMITS.nrr;
  const ratingLabel = ratingType === "snr" ? "SNR" : "NRR";
  const primary = Number(rating);
  if (!Number.isFinite(primary)) {
    return { error: `Enter the ${ratingLabel} printed on the protector's label.` };
  }
  if (primary < ratingBounds.min || primary > ratingBounds.max) {
    return {
      error: `${ratingLabel} must be between ${ratingBounds.min} and ${ratingBounds.max} dB — check the label.`,
    };
  }

  const device = getDeviceType(deviceTypeId);
  if (!device) return { error: "Choose the type of hearing protector." };

  const method = getMethod(methodId);
  if (!method) return { error: "Choose a field-adjustment method." };

  const hours = Number(exposureHours);
  if (!Number.isFinite(hours) || hours < LIMITS.hours.min || hours > LIMITS.hours.max) {
    return {
      error: `Hours in the noise must be between ${LIMITS.hours.min} and ${LIMITS.hours.max}.`,
    };
  }

  let workingNrr = toNrrEquivalent(primary, ratingType);
  let derateDevice = device;
  let secondDevice = null;
  let secondNrrEquivalent = null;

  if (dualProtection) {
    const second = Number(secondRating);
    if (!Number.isFinite(second)) {
      return { error: `Enter the ${ratingLabel} of the second device, or turn dual protection off.` };
    }
    if (second < ratingBounds.min || second > ratingBounds.max) {
      return {
        error: `The second device's ${ratingLabel} must be between ${ratingBounds.min} and ${ratingBounds.max} dB.`,
      };
    }
    secondDevice = getDeviceType(secondDeviceTypeId);
    if (!secondDevice) return { error: "Choose the type of the second hearing protector." };

    secondNrrEquivalent = toNrrEquivalent(second, ratingType);
    // NIOSH: add 5 dB to the higher of the two labelled ratings; the derating factor that
    // applies is the one belonging to that higher-rated device.
    if (secondNrrEquivalent > workingNrr) {
      workingNrr = secondNrrEquivalent;
      derateDevice = secondDevice;
    }
    workingNrr += DUAL_PROTECTION_BONUS_DB;
  }

  const attenuation = effectiveAttenuation({
    nrr: workingNrr,
    methodId: method.id,
    weighting,
    nioshDerate: derateDevice.nioshDerate,
  });

  const protectedLevel = round1(level - attenuation);

  const oshaHours = allowedExposureHours(protectedLevel, "osha");
  const nioshHours = allowedExposureHours(protectedLevel, "niosh");
  const oshaDosePercent = noiseDosePercent(protectedLevel, hours, "osha");
  const nioshDosePercent = noiseDosePercent(protectedLevel, hours, "niosh");

  const notes = [];
  if (ratingType === "snr") {
    notes.push(
      `The SNR label was brought onto the NRR scale by subtracting ${SNR_TO_NRR_OFFSET_DB} dB (${primary} SNR ≈ ${round1(toNrrEquivalent(primary, ratingType))} NRR). That offset is typical, not an exact conversion.`,
    );
  }
  if (dualProtection) {
    notes.push(
      `Dual protection: ${DUAL_PROTECTION_BONUS_DB} dB was added to the higher of the two ratings, and the ${derateDevice.label.toLowerCase()} derating factor was used. Attenuation from two devices is not additive.`,
    );
  }
  if (weighting === "C") {
    notes.push(
      "Because the level was measured in dBC, the 7 dB A-weighting correction was not applied.",
    );
  }
  if (method.id === "niosh") notes.push(derateDevice.note);

  const warnings = [];
  if (protectedLevel > OSHA_PEL_DBA) {
    warnings.push(
      `Still above the OSHA permissible exposure limit of ${OSHA_PEL_DBA} dBA — this protector is not enough on its own for a full shift.`,
    );
  } else if (protectedLevel > NIOSH_REL_DBA) {
    warnings.push(
      `Under the OSHA limit but above the NIOSH recommended limit of ${NIOSH_REL_DBA} dBA.`,
    );
  }
  if (protectedLevel < OVERPROTECTION_THRESHOLD_DBA) {
    warnings.push(
      `Below ${OVERPROTECTION_THRESHOLD_DBA} dBA at the ear counts as overprotection — speech, alarms and machine cues become hard to hear. Consider a lower-rated device.`,
    );
  }
  if (oshaDosePercent !== null && oshaDosePercent > 100) {
    warnings.push(
      `Estimated OSHA noise dose is ${oshaDosePercent}% for ${hours} h in the noise. Anything over 100% exceeds the permissible daily exposure.`,
    );
  }

  return {
    measuredLevel: round1(level),
    weighting,
    ratingLabel,
    labelledRating: primary,
    workingNrr: round1(workingNrr),
    method,
    device,
    secondDevice,
    derateDevice,
    dualProtection: Boolean(dualProtection),
    attenuation,
    protectedLevel,
    exposureHours: hours,
    oshaAllowedHours: oshaHours,
    nioshAllowedHours: nioshHours,
    oshaDosePercent,
    nioshDosePercent,
    meetsOshaPel: protectedLevel <= OSHA_PEL_DBA,
    meetsOshaActionLevel: protectedLevel <= OSHA_ACTION_LEVEL_DBA,
    meetsNioshRel: protectedLevel <= NIOSH_REL_DBA,
    overprotected: protectedLevel < OVERPROTECTION_THRESHOLD_DBA,
    notes,
    warnings,
  };
}

/**
 * Run the same protector through all three methods, for side-by-side comparison.
 * @returns {{error:string}|{rows:Array<object>}}
 */
export function compareMethods(input) {
  const rows = [];
  for (const method of METHODS) {
    const result = calculateProtectedLevel({ ...input, methodId: method.id });
    if (result.error) return { error: result.error };
    rows.push({
      id: method.id,
      label: method.label,
      attenuation: result.attenuation,
      protectedLevel: result.protectedLevel,
      meetsOshaPel: result.meetsOshaPel,
      meetsNioshRel: result.meetsNioshRel,
    });
  }
  return { rows };
}
