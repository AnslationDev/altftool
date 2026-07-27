/**
 * Pet Calming Sound Player — acoustics.
 *
 * Everything here is pure arithmetic on sound pressure levels. No React, no DOM,
 * no audio nodes: the component reads the preset numbers and the computed target
 * level from here and drives the Web Audio graph itself.
 */

/**
 * WHO Guidelines for Community Noise (1999) put 70 dB(A) as the 24-hour
 * average below which no measurable hearing damage occurs. We use it as the
 * ceiling for a loop that may run for hours next to a sleeping animal.
 */
export const SAFE_SUSTAINED_DBA = 70;

/**
 * NIOSH recommended exposure limit: 85 dB(A) time-weighted over 8 hours.
 * Anything at or above this is flagged as unsafe for a calming loop.
 */
export const NIOSH_LIMIT_DBA = 85;

/**
 * Reference distance for a quoted speaker level. Consumer speaker sensitivity
 * is specified at 1 metre, so all level maths is anchored there.
 */
export const REFERENCE_DISTANCE_M = 1;

/** Below this the inverse-square term blows up, so we refuse the input. */
export const MIN_DISTANCE_M = 0.25;

/**
 * A transient that pokes more than this far above the background is still
 * startling. Sound-masking practice treats roughly 10 dB of headroom as the
 * point where an intrusive sound stops drawing attention.
 */
export const MASKING_TARGET_MARGIN_DB = 10;

/**
 * Hearing ranges at 60 dB SPL. Dog: Heffner (1983). Cat: Heffner & Heffner
 * (1985). Humans are included for context only.
 */
export const SPECIES_PROFILES = {
  dog: {
    id: "dog",
    label: "Dog",
    hearingLowHz: 67,
    hearingHighHz: 45000,
    /** Dogs are most sensitive around 4 kHz, so we roll the loop off well below it. */
    recommendedLowpassHz: 900,
    /**
     * Kogan, Schoenfeld-Tacher & Simon (2012, J. Vet. Behav.) found slow
     * classical music (roughly 50-60 bpm) increased resting behaviour in
     * kennelled dogs. We use that tempo band for the optional pulse.
     */
    calmingPulseBpm: 55,
    note: "Dogs hear roughly 67 Hz to 45 kHz and are most sensitive near 4 kHz, so keep the loop low and dull.",
  },
  cat: {
    id: "cat",
    label: "Cat",
    hearingLowHz: 48,
    hearingHighHz: 85000,
    /** Cats extend far into ultrasound; an even lower roll-off avoids arousal. */
    recommendedLowpassHz: 600,
    /** Snyder & Wells (2015) used purr-tempo audio around 25 Hz pulsing. */
    calmingPulseBpm: 90,
    note: "Cats hear up to roughly 85 kHz. Anything bright or hissy is arousing, so a dark low-passed loop works best.",
  },
  rabbit: {
    id: "rabbit",
    label: "Rabbit or small pet",
    hearingLowHz: 96,
    hearingHighHz: 49000,
    recommendedLowpassHz: 500,
    calmingPulseBpm: 0,
    note: "Prey species startle at onsets. Use a steady, unmodulated loop with no pulse at all.",
  },
};

/**
 * Preset definitions. `slopeDbPerOctave` describes the spectrum, `lowpassHz`
 * and `highpassHz` are the filter corners the player applies, `trimDb` is a
 * per-preset loudness trim so all presets land near the same perceived level.
 */
export const SOUND_PRESETS = {
  brown: {
    id: "brown",
    label: "Brown noise (deep rumble)",
    slopeDbPerOctave: -6,
    highpassHz: 30,
    lowpassHz: 800,
    trimDb: 0,
    description:
      "Energy falls 6 dB per octave, so almost everything sits below 500 Hz — the same band as a distant firework thud.",
  },
  pink: {
    id: "pink",
    label: "Pink noise (soft hiss)",
    slopeDbPerOctave: -3,
    highpassHz: 40,
    lowpassHz: 2000,
    trimDb: -3,
    description:
      "Equal energy per octave. Broader than brown noise, so it covers crackle as well as thud, but it is brighter.",
  },
  rain: {
    id: "rain",
    label: "Rain-shaped noise",
    slopeDbPerOctave: -4,
    highpassHz: 120,
    lowpassHz: 4000,
    trimDb: -4,
    description:
      "Mid-weighted noise shaped like steady rainfall. Good for households where a deep rumble buzzes the furniture.",
  },
  heartbeat: {
    id: "heartbeat",
    label: "Warm loop with slow pulse",
    slopeDbPerOctave: -6,
    highpassHz: 30,
    lowpassHz: 500,
    trimDb: -2,
    description:
      "Very dark noise with a slow amplitude pulse at the species' calming tempo, layered under the masking bed.",
  },
};

/**
 * Typical indoor sound pressure levels, for people who cannot measure.
 * Values are the usual textbook A-weighted figures for a domestic room.
 */
export const AMBIENT_PRESETS = [
  { id: "very-quiet", label: "Very quiet room, night", dba: 28 },
  { id: "quiet", label: "Quiet room, appliances off", dba: 35 },
  { id: "normal", label: "Normal living room", dba: 45 },
  { id: "busy", label: "TV on, people talking", dba: 58 },
];

/**
 * Fireworks measured at the listener. A large display at 200 m or a neighbour's
 * garden shell heard through a closed double-glazed window typically lands in
 * the 60-85 dB(A) range indoors; open windows or a nearby launch site push
 * higher. Source levels of 150+ dB are measured at the shell, not indoors.
 */
export const EVENT_PRESETS = [
  { id: "distant", label: "Distant display, windows shut", dba: 62 },
  { id: "neighbourhood", label: "Neighbourhood fireworks", dba: 72 },
  { id: "close", label: "Close garden fireworks", dba: 82 },
  { id: "thunder", label: "Thunderstorm overhead", dba: 78 },
];

/** Default acclimatisation lead-in, in minutes, before the noise starts. */
export const DEFAULT_LEAD_IN_MIN = 30;
/** Default wind-down after the last bang, in minutes. */
export const DEFAULT_WIND_DOWN_MIN = 20;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Energetic addition of incoherent sources:
 *   L_total = 10 * log10( sum(10^(Li/10)) )
 */
export function combineDb(levels) {
  if (!Array.isArray(levels) || levels.length === 0) return null;
  let sum = 0;
  for (const level of levels) {
    if (!isNum(level)) return null;
    sum += Math.pow(10, level / 10);
  }
  if (!(sum > 0)) return null;
  return 10 * Math.log10(sum);
}

/**
 * Inverse-square spreading from a point source:
 *   L(d) = L(dRef) - 20 * log10(d / dRef)
 */
export function levelAtDistance({ levelDb, distanceM, refDistanceM = REFERENCE_DISTANCE_M }) {
  if (!isNum(levelDb) || !isNum(distanceM) || !isNum(refDistanceM)) return null;
  if (!(distanceM > 0) || !(refDistanceM > 0)) return null;
  return levelDb - 20 * Math.log10(distanceM / refDistanceM);
}

/** Amplitude multiplier for a dB change: gain = 10^(dB/20). */
export function linearGainFromDb(deltaDb) {
  if (!isNum(deltaDb)) return 0;
  const gain = Math.pow(10, deltaDb / 20);
  if (!Number.isFinite(gain)) return 0;
  return Math.min(1, Math.max(0, gain));
}

/**
 * How much masker is needed, on top of the room's own ambient, to hold the
 * combined background within `marginDb` of the event peak.
 * Solves  10log10(10^(m/10) + 10^(a/10)) = peak - margin  for m.
 * Returns null when the ambient is already loud enough (no masker required).
 */
export function requiredMaskerLevel({ eventDba, ambientDba, marginDb = MASKING_TARGET_MARGIN_DB }) {
  if (!isNum(eventDba) || !isNum(ambientDba) || !isNum(marginDb)) return null;
  const targetBackground = eventDba - marginDb;
  const energyGap = Math.pow(10, targetBackground / 10) - Math.pow(10, ambientDba / 10);
  if (!(energyGap > 0)) return null;
  return 10 * Math.log10(energyGap);
}

function verdictForProminence(prominenceDb) {
  if (prominenceDb <= 0) {
    return {
      id: "covered",
      label: "Bangs sit inside the loop",
      detail: "The background is at or above the peak, so individual bangs lose their edge.",
    };
  }
  if (prominenceDb <= MASKING_TARGET_MARGIN_DB) {
    return {
      id: "good",
      label: "Well masked",
      detail: `Peaks poke only ${prominenceDb.toFixed(1)} dB above the background — audible but not startling.`,
    };
  }
  if (prominenceDb <= 20) {
    return {
      id: "partial",
      label: "Partly masked",
      detail: "Peaks still stand out clearly. Move the pet further from windows or add soft furnishings.",
    };
  }
  return {
    id: "poor",
    label: "Barely masked",
    detail: "Peaks dominate the room. Sound alone will not be enough — change the room, not the volume.",
  };
}

/**
 * Build a full calming session: safe level, masking verdict and a timeline.
 *
 * All levels are A-weighted sound pressure levels in dB.
 */
export function planCalmingSession({
  species = "dog",
  presetId = "brown",
  speakerDbAt1m = 60,
  distanceM = 2,
  ambientDba = 35,
  eventDba = 72,
  eventDurationMin = 90,
  leadInMin = DEFAULT_LEAD_IN_MIN,
  windDownMin = DEFAULT_WIND_DOWN_MIN,
  loopLengthMin = 10,
} = {}) {
  const profile = SPECIES_PROFILES[species];
  const preset = SOUND_PRESETS[presetId];
  if (!profile) return { error: "Pick a species from the list." };
  if (!preset) return { error: "Pick one of the available sound presets." };

  const numbers = {
    speakerDbAt1m,
    distanceM,
    ambientDba,
    eventDba,
    eventDurationMin,
    leadInMin,
    windDownMin,
    loopLengthMin,
  };
  for (const [key, value] of Object.entries(numbers)) {
    if (!isNum(value)) return { error: `Enter a valid number for ${key.replace(/([A-Z])/g, " $1").toLowerCase()}.` };
  }

  if (distanceM < MIN_DISTANCE_M) {
    return { error: `Keep the speaker at least ${MIN_DISTANCE_M} m from the pet.` };
  }
  if (speakerDbAt1m < 20 || speakerDbAt1m > 100) {
    return { error: "Playback level at 1 m should be between 20 and 100 dB(A)." };
  }
  if (ambientDba < 0 || ambientDba > 100) return { error: "Room ambient level should be between 0 and 100 dB(A)." };
  if (eventDba < 30 || eventDba > 120) return { error: "Indoor event level should be between 30 and 120 dB(A)." };
  if (eventDurationMin <= 0 || eventDurationMin > 600) {
    return { error: "Event length should be between 1 and 600 minutes." };
  }
  if (leadInMin < 0 || windDownMin < 0) return { error: "Lead-in and wind-down cannot be negative." };
  if (loopLengthMin <= 0 || loopLengthMin > 120) return { error: "Loop length should be between 1 and 120 minutes." };

  const levelAtPet = levelAtDistance({ levelDb: speakerDbAt1m, distanceM });
  const background = combineDb([levelAtPet, ambientDba]);
  if (levelAtPet === null || background === null) {
    return { error: "Could not combine those levels — check the distance and ambient figures." };
  }

  const prominenceDb = eventDba - background;
  const needMasker = requiredMaskerLevel({ eventDba, ambientDba });
  const recommendedAtPet =
    needMasker === null ? null : Math.min(needMasker, SAFE_SUSTAINED_DBA);
  const recommendedAt1m =
    recommendedAtPet === null
      ? null
      : recommendedAtPet + 20 * Math.log10(distanceM / REFERENCE_DISTANCE_M);
  const adjustmentDb = recommendedAt1m === null ? 0 : recommendedAt1m - speakerDbAt1m;

  let safety;
  if (levelAtPet >= NIOSH_LIMIT_DBA) {
    safety = {
      id: "unsafe",
      label: "Too loud",
      detail: `${levelAtPet.toFixed(0)} dB(A) at the pet is at or above the 85 dB(A) 8-hour exposure limit. Turn it down.`,
    };
  } else if (levelAtPet > SAFE_SUSTAINED_DBA) {
    safety = {
      id: "caution",
      label: "Loud for a long loop",
      detail: `${levelAtPet.toFixed(0)} dB(A) is above the 70 dB(A) all-day guideline. Fine for an hour, not for overnight.`,
    };
  } else {
    safety = {
      id: "safe",
      label: "Within the all-day guideline",
      detail: `${levelAtPet.toFixed(0)} dB(A) at the pet stays under the 70 dB(A) 24-hour figure.`,
    };
  }

  const totalMin = leadInMin + eventDurationMin + windDownMin;
  const timeline = [];
  let cursor = 0;
  if (leadInMin > 0) {
    timeline.push({
      id: "lead-in",
      label: "Lead-in",
      startMin: 0,
      endMin: leadInMin,
      detail: "Start the loop before the first bang so it is already ordinary background by the time it matters.",
    });
    cursor = leadInMin;
  }
  timeline.push({
    id: "event",
    label: "Event window",
    startMin: cursor,
    endMin: cursor + eventDurationMin,
    detail: "Hold the level steady. Changing volume mid-event draws attention to the sound.",
  });
  cursor += eventDurationMin;
  if (windDownMin > 0) {
    timeline.push({
      id: "wind-down",
      label: "Wind-down",
      startMin: cursor,
      endMin: cursor + windDownMin,
      detail: "Fade out slowly rather than cutting; a sudden silence is itself an onset.",
    });
  }

  return {
    profile,
    preset,
    levelAtPet,
    background,
    prominenceDb,
    verdict: verdictForProminence(prominenceDb),
    safety,
    recommendedAtPet,
    recommendedAt1m,
    adjustmentDb,
    ambientAlreadyEnough: needMasker === null,
    cappedBySafety: needMasker !== null && needMasker > SAFE_SUSTAINED_DBA,
    lowpassHz: Math.min(preset.lowpassHz, profile.recommendedLowpassHz * 2),
    highpassHz: preset.highpassHz,
    pulseBpm: presetId === "heartbeat" ? profile.calmingPulseBpm : 0,
    trimDb: preset.trimDb,
    totalMin,
    loopCount: Math.ceil(totalMin / loopLengthMin),
    timeline,
  };
}

/**
 * A typical consumer speaker or laptop driven to digital full scale produces
 * roughly 100 dB(A) at 1 m. This is only used to map the level the user is
 * aiming for onto a player gain — it is a rough calibration, not a measurement.
 */
export const ASSUMED_FULL_SCALE_DBA = 100;

/** Player gain (0-1) for a target level at 1 m, including the preset trim. */
export function playerGainFor({ speakerDbAt1m, trimDb = 0 }) {
  if (!isNum(speakerDbAt1m)) return 0;
  const trim = isNum(trimDb) ? trimDb : 0;
  return linearGainFromDb(speakerDbAt1m + trim - ASSUMED_FULL_SCALE_DBA);
}

/** Deterministic 32-bit PRNG (mulberry32) so a given seed always sounds the same. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Shaped noise samples in [-1, 1], normalised to peak 1.
 *
 * -3 dB/octave is pink noise, produced with Paul Kellet's economical filter
 * approximation of 1/f. -6 dB/octave is brown noise, a leaky integration of
 * white noise (1/f^2). Slopes in between are a linear blend of the two.
 * The component hands these samples straight to an AudioBuffer.
 */
export function generateShapedNoise(length, slopeDbPerOctave = -6, seed = 1) {
  const count = Math.floor(length);
  if (!Number.isInteger(count) || count <= 0 || count > 5000000) return null;
  const slope = isNum(slopeDbPerOctave) ? Math.max(-6, Math.min(-3, slopeDbPerOctave)) : -6;
  // 0 = fully pink (-3), 1 = fully brown (-6)
  const brownMix = (slope * -1 - 3) / 3;
  const rand = mulberry32(seed);
  const out = new Float32Array(count);

  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  let brown = 0;
  let peak = 0;

  for (let i = 0; i < count; i += 1) {
    const white = rand() * 2 - 1;
    // Kellet pink filter (3-pole variant)
    b0 = 0.99765 * b0 + white * 0.099046;
    b1 = 0.963 * b1 + white * 0.2965164;
    b2 = 0.57 * b2 + white * 1.0526913;
    const pink = (b0 + b1 + b2 + white * 0.1848) * 0.16;
    // Leaky integrator for brown
    brown = (brown + white * 0.02) / 1.02;
    const value = pink * (1 - brownMix) + brown * 3.5 * brownMix;
    out[i] = value;
    const magnitude = Math.abs(value);
    if (magnitude > peak) peak = magnitude;
  }

  if (peak > 0) {
    const scale = 1 / peak;
    for (let i = 0; i < count; i += 1) out[i] *= scale;
  }
  return out;
}

/** "1 h 50 m" style duration for the timeline. Display helper, still pure. */
export function formatMinutes(totalMinutes) {
  if (!isNum(totalMinutes) || totalMinutes < 0) return "—";
  const whole = Math.round(totalMinutes);
  const hours = Math.floor(whole / 60);
  const minutes = whole % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}
