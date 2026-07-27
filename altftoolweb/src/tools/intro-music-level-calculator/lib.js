/**
 * Ducking maths for a music bed under a voiceover.
 *
 * Two decibel conversions drive everything:
 *   amplitude ratio  = 10^(dB / 20)   — a fader is an amplitude control
 *   power ratio      = 10^(dB / 10)   — used when summing uncorrelated signals
 *
 * Summing two independent sources (speech and music are uncorrelated) adds
 * their POWERS, so the combined level is
 *     L = 10 · log10(10^(L1/10) + 10^(L2/10))
 * Two equal signals therefore sum to +3 dB, not +6 dB.
 *
 * "Separation" is the level difference the mixer wants to hear between the
 * voice and the ducked bed. Everything else is derived from it.
 */

/** Amplitude uses 20·log10, power uses 10·log10. */
export const AMPLITUDE_DB_FACTOR = 20;
export const POWER_DB_FACTOR = 10;

/** Practical dBFS range for a mix bus. Below −80 dBFS is effectively silence. */
export const MIN_LEVEL_DB = -80;
export const MAX_LEVEL_DB = 0;
/** Nobody needs more than 60 dB of separation; beyond that the bed is inaudible. */
export const MAX_SEPARATION_DB = 60;

/**
 * Separation conventions by content type. These are working practice in
 * dialogue mixing rather than a published standard, which is why every
 * figure stays editable.
 */
export const SEPARATION_PRESETS = [
  { id: "ambient", label: "Barely-there ambience", db: 26 },
  { id: "podcast", label: "Spoken-word podcast", db: 20 },
  { id: "narration", label: "Corporate narration / explainer", db: 18 },
  { id: "documentary", label: "Documentary underscore", db: 15 },
  { id: "promo", label: "Radio promo / advert", db: 12 },
  { id: "trailer", label: "Cinematic trailer", db: 8 },
];

/**
 * Published integrated-loudness delivery targets and their true-peak ceilings.
 * EBU R128 = −23 LUFS with a −1 dBTP ceiling (European broadcast).
 * ATSC A/85 = −24 LKFS with a −2 dBTP ceiling (US broadcast).
 * Apple Podcasts asks for −16 LUFS; Spotify and YouTube normalise near −14 LUFS.
 */
export const LOUDNESS_TARGETS = [
  { id: "ebu-r128", label: "EBU R128 broadcast", lufs: -23, ceiling: -1 },
  { id: "atsc-a85", label: "ATSC A/85 US broadcast", lufs: -24, ceiling: -2 },
  { id: "podcast", label: "Podcast (Apple)", lufs: -16, ceiling: -1 },
  { id: "streaming", label: "Spotify / YouTube", lufs: -14, ceiling: -1 },
];

/** Typical duck envelope times, in milliseconds. */
export const ENVELOPE_GUIDE = [
  { id: "attack", label: "Duck-down (attack)", fastMs: 80, slowMs: 250 },
  { id: "hold", label: "Hold between words", fastMs: 200, slowMs: 500 },
  { id: "release", label: "Return-up (release)", fastMs: 400, slowMs: 900 },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** dB difference -> amplitude multiplier (fader position). */
export function dbToAmplitude(db) {
  if (!isNum(db)) return NaN;
  return 10 ** (db / AMPLITUDE_DB_FACTOR);
}

/** Amplitude multiplier -> dB. Zero and negative amplitudes have no dB value. */
export function amplitudeToDb(amplitude) {
  if (!isNum(amplitude) || amplitude <= 0) return NaN;
  return AMPLITUDE_DB_FACTOR * Math.log10(amplitude);
}

/** Power-sum any number of levels expressed in dB. */
export function sumLevelsDb(levels) {
  if (!Array.isArray(levels) || levels.length === 0) return NaN;
  let power = 0;
  for (const level of levels) {
    if (!isNum(level)) return NaN;
    power += 10 ** (level / POWER_DB_FACTOR);
  }
  if (power <= 0) return NaN;
  return POWER_DB_FACTOR * Math.log10(power);
}

/**
 * @param {object} input
 * @param {number} input.voiceLevelDb     Voiceover level, dBFS or LUFS.
 * @param {number} input.musicFullLevelDb Music bed level when no one is talking.
 * @param {number} input.separationDb     Desired voice-minus-music difference.
 * @param {number} [input.ceilingDb]      True-peak / headroom ceiling.
 * @returns {object} duck figures, or { error }.
 */
export function computeDuck({
  voiceLevelDb,
  musicFullLevelDb,
  separationDb,
  ceilingDb = -1,
} = {}) {
  if (![voiceLevelDb, musicFullLevelDb, separationDb, ceilingDb].every(isNum)) {
    return { error: "Enter a number in every field." };
  }
  if (voiceLevelDb < MIN_LEVEL_DB || voiceLevelDb > MAX_LEVEL_DB) {
    return { error: `Voice level must be between ${MIN_LEVEL_DB} and ${MAX_LEVEL_DB} dB.` };
  }
  if (musicFullLevelDb < MIN_LEVEL_DB || musicFullLevelDb > MAX_LEVEL_DB) {
    return { error: `Music level must be between ${MIN_LEVEL_DB} and ${MAX_LEVEL_DB} dB.` };
  }
  if (separationDb < 0 || separationDb > MAX_SEPARATION_DB) {
    return { error: `Separation must be between 0 and ${MAX_SEPARATION_DB} dB.` };
  }
  if (ceilingDb < MIN_LEVEL_DB || ceilingDb > MAX_LEVEL_DB) {
    return { error: `The ceiling must be between ${MIN_LEVEL_DB} and ${MAX_LEVEL_DB} dB.` };
  }

  const duckedMusicDb = voiceLevelDb - separationDb;
  // Positive = cut the bed by this much; negative = the bed is already too quiet.
  const duckAmountDb = musicFullLevelDb - duckedMusicDb;
  const faderAmplitude = dbToAmplitude(-duckAmountDb);
  const mixDuringSpeechDb = sumLevelsDb([voiceLevelDb, duckedMusicDb]);
  const mixNoSpeechDb = musicFullLevelDb;
  const speechAddedDb = mixDuringSpeechDb - voiceLevelDb;
  const headroomDb = ceilingDb - Math.max(mixDuringSpeechDb, mixNoSpeechDb);

  const warnings = [];
  if (duckAmountDb < 0) {
    warnings.push(
      `The bed is already ${Math.abs(duckAmountDb).toFixed(1)} dB quieter than it needs to be — raise it, or the music will disappear under speech.`,
    );
  }
  if (duckedMusicDb < MIN_LEVEL_DB) {
    warnings.push("The ducked bed lands below −80 dB, which is silence rather than a duck.");
  }
  if (headroomDb < 0) {
    warnings.push(
      `The mix exceeds your ${ceilingDb} dB ceiling by ${Math.abs(headroomDb).toFixed(1)} dB — pull the whole bus down before limiting.`,
    );
  }
  if (separationDb < 8) {
    warnings.push("Under about 8 dB of separation, speech starts to fight the music on small speakers.");
  }

  return {
    voiceLevelDb,
    musicFullLevelDb,
    separationDb,
    ceilingDb,
    duckedMusicDb,
    duckAmountDb,
    faderAmplitude,
    faderPercent: faderAmplitude * 100,
    mixDuringSpeechDb,
    mixNoSpeechDb,
    speechAddedDb,
    headroomDb,
    warnings,
  };
}
