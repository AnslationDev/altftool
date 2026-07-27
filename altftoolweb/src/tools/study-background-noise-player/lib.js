/**
 * Study Background Noise Player — noise synthesis and volume-ramp maths.
 * No React, no JSX, no DOM: the caller copies the samples into an AudioBuffer.
 */

/**
 * Noise colours are defined by how power density falls with frequency:
 * white 0 dB/octave, pink -3 dB/octave, brown (red) -6 dB/octave.
 */
export const NOISE_TYPES = [
  {
    id: "white",
    label: "White noise",
    slopeDbPerOctave: 0,
    blurb: "Flat energy at every frequency — bright and hiss-like, best for masking speech.",
  },
  {
    id: "pink",
    label: "Pink noise",
    slopeDbPerOctave: -3,
    blurb: "Equal energy per octave — the balanced rainfall sound most people find easiest to ignore.",
  },
  {
    id: "brown",
    label: "Brown noise",
    slopeDbPerOctave: -6,
    blurb: "Steeply rolled-off highs — a deep rumble like distant surf or a waterfall.",
  },
];

export const NOISE_TYPE_IDS = NOISE_TYPES.map((type) => type.id);

/** Fader taper: 0% is silence and 100% is unity, spread over this many decibels. */
export const FADER_RANGE_DB = 50;

/** Peak amplitude the generated buffer is normalised to, leaving headroom before clipping. */
export const PEAK_AMPLITUDE = 0.95;

/** Default loop length. Long enough that the ear cannot hear the repeat. */
export const DEFAULT_LOOP_SECONDS = 6;

export const LIMITS = {
  sessionMinutes: { min: 1, max: 480 },
  rampMinutes: { min: 0, max: 60 },
  fadeOutMinutes: { min: 0, max: 60 },
  volumePercent: { min: 0, max: 100 },
};

const SECONDS_PER_MINUTE = 60;

/** Deterministic PRNG (mulberry32) so the same seed always renders the same noise. */
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
 * Fader percent -> linear amplitude, using a decibel taper so the slider feels
 * even to the ear (each equal step is an equal dB step, not an equal amplitude step).
 */
export function amplitudeFromPercent(percent) {
  const value = Number(percent);
  if (!Number.isFinite(value) || value <= 0) return 0;
  const clamped = Math.min(100, value);
  const db = -FADER_RANGE_DB * (1 - clamped / 100);
  return Math.pow(10, db / 20);
}

/**
 * Build the volume envelope for a session: ramp up, hold, fade out.
 * Percentages are fader positions; convert with amplitudeFromPercent.
 */
export function planSession({
  sessionMinutes = 60,
  rampMinutes = 5,
  fadeOutMinutes = 2,
  startVolumePercent = 10,
  targetVolumePercent = 60,
} = {}) {
  const session = Number(sessionMinutes);
  const ramp = Number(rampMinutes);
  const fade = Number(fadeOutMinutes);
  const startPct = Number(startVolumePercent);
  const targetPct = Number(targetVolumePercent);

  const checks = [
    [session, LIMITS.sessionMinutes, "Session length (minutes)"],
    [ramp, LIMITS.rampMinutes, "Volume ramp (minutes)"],
    [fade, LIMITS.fadeOutMinutes, "Fade out (minutes)"],
    [startPct, LIMITS.volumePercent, "Start volume (%)"],
    [targetPct, LIMITS.volumePercent, "Target volume (%)"],
  ];
  for (const [value, limit, label] of checks) {
    if (!Number.isFinite(value)) return { error: `${label} must be a number.` };
    if (value < limit.min || value > limit.max) {
      return { error: `${label} must be between ${limit.min} and ${limit.max}.` };
    }
  }
  if (ramp + fade > session) {
    return { error: "The ramp up plus the fade out cannot be longer than the session itself." };
  }

  const totalSeconds = Math.round(session * SECONDS_PER_MINUTE);
  const rampSeconds = Math.round(ramp * SECONDS_PER_MINUTE);
  const fadeSeconds = Math.round(fade * SECONDS_PER_MINUTE);
  const holdSeconds = Math.max(0, totalSeconds - rampSeconds - fadeSeconds);

  return {
    totalSeconds,
    rampSeconds,
    holdSeconds,
    fadeSeconds,
    startPercent: startPct,
    targetPercent: targetPct,
    fadeStartSeconds: totalSeconds - fadeSeconds,
    peakAmplitude: amplitudeFromPercent(targetPct),
    startAmplitude: amplitudeFromPercent(startPct),
  };
}

/** Fader percent at a point in the session (linear interpolation between the anchors). */
export function percentAt(plan, elapsedSeconds) {
  if (!plan || plan.error) return 0;
  const t = Number(elapsedSeconds);
  if (!Number.isFinite(t) || t <= 0) return plan.startPercent;
  if (t >= plan.totalSeconds) return 0;
  if (t < plan.rampSeconds) {
    const progress = plan.rampSeconds > 0 ? t / plan.rampSeconds : 1;
    return plan.startPercent + (plan.targetPercent - plan.startPercent) * progress;
  }
  if (t < plan.fadeStartSeconds) return plan.targetPercent;
  if (plan.fadeSeconds <= 0) return plan.targetPercent;
  const intoFade = t - plan.fadeStartSeconds;
  return plan.targetPercent * (1 - intoFade / plan.fadeSeconds);
}

/** Linear amplitude at a point in the session. */
export function amplitudeAt(plan, elapsedSeconds) {
  return amplitudeFromPercent(percentAt(plan, elapsedSeconds));
}

/**
 * Render one loopable noise buffer.
 * Pink noise uses Paul Kellet's filter bank; brown noise uses a leaky integrator.
 * The tail is equal-power crossfaded into the head so the loop point is inaudible.
 *
 * @returns {{error:string}|{samples:Float32Array,length:number,seconds:number}}
 */
export function generateNoise({
  type = "pink",
  sampleRate = 44100,
  seconds = DEFAULT_LOOP_SECONDS,
  seed = 1,
  crossfadeSeconds = 0.25,
} = {}) {
  if (!NOISE_TYPE_IDS.includes(type)) {
    return { error: `Noise type must be one of: ${NOISE_TYPE_IDS.join(", ")}.` };
  }
  const rate = Math.round(Number(sampleRate));
  const length = Math.round(Number(seconds) * rate);
  if (!Number.isFinite(rate) || rate < 8000 || rate > 192000) {
    return { error: "Sample rate must be between 8,000 and 192,000 Hz." };
  }
  if (!Number.isFinite(length) || length < rate) {
    return { error: "Loop length must be at least one second." };
  }

  const random = mulberry32(Number(seed) || 1);
  const raw = new Float32Array(length);

  if (type === "white") {
    for (let i = 0; i < length; i += 1) raw[i] = random() * 2 - 1;
  } else if (type === "pink") {
    // Paul Kellet's refined pink-noise filter: six one-pole sections summed.
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let b3 = 0;
    let b4 = 0;
    let b5 = 0;
    let b6 = 0;
    for (let i = 0; i < length; i += 1) {
      const white = random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      raw[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;
    }
  } else {
    // Brown noise: integrate white noise with a small leak so it cannot drift away.
    let last = 0;
    for (let i = 0; i < length; i += 1) {
      const white = random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      raw[i] = last;
    }
  }

  const fadeCount = Math.max(
    0,
    Math.min(Math.floor(length / 4), Math.round(Number(crossfadeSeconds) * rate)),
  );
  const outLength = length - fadeCount;
  const samples = new Float32Array(outLength);
  for (let i = 0; i < outLength; i += 1) samples[i] = raw[i];
  for (let i = 0; i < fadeCount; i += 1) {
    const position = fadeCount > 1 ? i / (fadeCount - 1) : 1;
    // Equal-power crossfade keeps perceived level constant across the seam.
    samples[i] = samples[i] * Math.sqrt(position) + raw[outLength + i] * Math.sqrt(1 - position);
  }

  let peak = 0;
  for (let i = 0; i < outLength; i += 1) {
    const value = Math.abs(samples[i]);
    if (value > peak) peak = value;
  }
  if (peak > 0) {
    const scale = PEAK_AMPLITUDE / peak;
    for (let i = 0; i < outLength; i += 1) samples[i] *= scale;
  }

  return { samples, length: outLength, seconds: outLength / rate };
}

/**
 * Crude brightness measure: mean absolute difference between neighbouring samples.
 * Higher means more high-frequency energy. Useful to confirm white > pink > brown.
 */
export function brightness(samples) {
  if (!samples || samples.length < 2) return 0;
  let sum = 0;
  for (let i = 1; i < samples.length; i += 1) sum += Math.abs(samples[i] - samples[i - 1]);
  return sum / (samples.length - 1);
}

/** Seconds -> "MM:SS" or "H:MM:SS". */
export function formatClock(seconds) {
  const value = Number(seconds);
  if (!Number.isFinite(value) || value < 0) return "00:00";
  const whole = Math.floor(value);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const secs = whole % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(secs).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}
