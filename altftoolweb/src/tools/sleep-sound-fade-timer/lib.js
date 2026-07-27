/**
 * Sleep Sound Fade Timer — fade-curve maths and sound rendering.
 * No React, no JSX, no DOM. All timing is passed in, never read from the clock.
 */

/**
 * A fade is treated as finished once the level drops below -60 dB, which is
 * inaudible against normal bedroom background noise (about 30 dBA).
 */
export const FADE_FLOOR_DB = -60;

/** Fader taper for the volume control: 0% is silence, 100% unity, spread over 50 dB. */
export const FADER_RANGE_DB = 50;

/** Peak amplitude of the rendered buffer, leaving headroom before clipping. */
export const PEAK_AMPLITUDE = 0.95;

/** Loop buffer length. Long enough that the repeat is not obvious at night. */
export const DEFAULT_LOOP_SECONDS = 8;

/** Ocean swell period is typically 8-15 seconds; 12.5 s is 0.08 Hz. */
export const SURF_LFO_HZ = 0.08;

export const LIMITS = {
  totalMinutes: { min: 1, max: 480 },
  fadeMinutes: { min: 1, max: 120 },
  volumePercent: { min: 1, max: 100 },
};

export const SOUNDS = [
  { id: "brown", label: "Brown noise", blurb: "Deep, rolled-off rumble — the darkest of the noise colours." },
  { id: "rain", label: "Steady rain", blurb: "Pink noise with a lifted top end, like rain on a window." },
  { id: "surf", label: "Ocean surf", blurb: "Brown noise swelling roughly every 12 seconds, like waves on a shore." },
  { id: "fan", label: "Fan hum", blurb: "Twice low-passed noise, close to a bedroom fan on low." },
];

export const SOUND_IDS = SOUNDS.map((sound) => sound.id);

export const FADE_CURVES = [
  {
    id: "logarithmic",
    label: "Logarithmic (recommended)",
    blurb: "Level drops by an equal number of decibels each minute, which the ear hears as an even fade.",
  },
  {
    id: "linear",
    label: "Linear",
    blurb: "Amplitude drops in a straight line, so the last part of the fade seems to vanish quickly.",
  },
  {
    id: "scurve",
    label: "S-curve",
    blurb: "Raised-cosine fade: gentle at the start, steepest in the middle, gentle into silence.",
  },
];

export const FADE_CURVE_IDS = FADE_CURVES.map((curve) => curve.id);

const SECONDS_PER_MINUTE = 60;

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

/** Fader percent -> linear amplitude on a decibel taper. */
export function amplitudeFromPercent(percent) {
  const value = Number(percent);
  if (!Number.isFinite(value) || value <= 0) return 0;
  const clamped = Math.min(100, value);
  return Math.pow(10, (-FADER_RANGE_DB * (1 - clamped / 100)) / 20);
}

/**
 * Fade multiplier for a fade that is `progress` of the way through (0 = start, 1 = silence).
 * Returns a value in 0..1 that multiplies the playing volume.
 */
export function fadeMultiplier(progress, curve = "logarithmic") {
  const p = Number(progress);
  if (!Number.isFinite(p) || p <= 0) return 1;
  if (p >= 1) return 0;
  if (curve === "linear") return 1 - p;
  if (curve === "scurve") return 0.5 * (1 + Math.cos(Math.PI * p));
  // Logarithmic: level falls linearly in decibels from 0 dB to the floor.
  return Math.pow(10, (FADE_FLOOR_DB * p) / 20);
}

/**
 * Build the sleep-timer envelope: hold at volume, then fade to silence.
 *
 * @returns {{error:string}|{totalSeconds:number,holdSeconds:number,fadeSeconds:number,fadeStartSeconds:number,volumePercent:number,startAmplitude:number,curve:string}}
 */
export function planFade({
  totalMinutes = 45,
  fadeMinutes = 15,
  volumePercent = 60,
  curve = "logarithmic",
} = {}) {
  const total = Number(totalMinutes);
  const fade = Number(fadeMinutes);
  const volume = Number(volumePercent);

  const checks = [
    [total, LIMITS.totalMinutes, "Total time (minutes)"],
    [fade, LIMITS.fadeMinutes, "Fade length (minutes)"],
    [volume, LIMITS.volumePercent, "Volume (%)"],
  ];
  for (const [value, limit, label] of checks) {
    if (!Number.isFinite(value)) return { error: `${label} must be a number.` };
    if (value < limit.min || value > limit.max) {
      return { error: `${label} must be between ${limit.min} and ${limit.max}.` };
    }
  }
  if (!FADE_CURVE_IDS.includes(curve)) {
    return { error: `Fade curve must be one of: ${FADE_CURVE_IDS.join(", ")}.` };
  }
  if (fade > total) {
    return { error: "The fade cannot be longer than the total time — shorten the fade." };
  }

  const totalSeconds = Math.round(total * SECONDS_PER_MINUTE);
  const fadeSeconds = Math.round(fade * SECONDS_PER_MINUTE);

  return {
    totalSeconds,
    fadeSeconds,
    holdSeconds: totalSeconds - fadeSeconds,
    fadeStartSeconds: totalSeconds - fadeSeconds,
    volumePercent: volume,
    startAmplitude: amplitudeFromPercent(volume),
    curve,
  };
}

/** Linear amplitude at a point in the timer. */
export function amplitudeAt(plan, elapsedSeconds) {
  if (!plan || plan.error) return 0;
  const t = Number(elapsedSeconds);
  if (!Number.isFinite(t) || t <= 0) return plan.startAmplitude;
  if (t >= plan.totalSeconds) return 0;
  if (t <= plan.fadeStartSeconds) return plan.startAmplitude;
  const progress = plan.fadeSeconds > 0 ? (t - plan.fadeStartSeconds) / plan.fadeSeconds : 1;
  return plan.startAmplitude * fadeMultiplier(progress, plan.curve);
}

/** Amplitude expressed as a percentage of the starting level, for display. */
export function levelPercentAt(plan, elapsedSeconds) {
  if (!plan || plan.error || !(plan.startAmplitude > 0)) return 0;
  return (amplitudeAt(plan, elapsedSeconds) / plan.startAmplitude) * 100;
}

/** Clock time the sound goes silent, given the start time as "HH:MM" (24-hour). */
export function silenceClock(startHHMM, totalSeconds) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(startHHMM ?? "").trim());
  if (!match) return { error: "Start time must look like 22:45." };
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return { error: "Start time must be a real 24-hour clock time." };
  const total = Number(totalSeconds);
  if (!Number.isFinite(total) || total < 0) return { error: "Timer length is not valid." };
  const endRaw = hours * 60 + minutes + Math.round(total / SECONDS_PER_MINUTE);
  const dayRollover = Math.floor(endRaw / (24 * 60));
  const endMinutes = ((endRaw % (24 * 60)) + 24 * 60) % (24 * 60);
  return {
    time: `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`,
    dayRollover,
  };
}

/** One-pole low-pass, in place. */
function lowPass(samples, cutoffHz, sampleRate) {
  const a = Math.exp((-2 * Math.PI * cutoffHz) / sampleRate);
  let previous = 0;
  for (let i = 0; i < samples.length; i += 1) {
    previous = (1 - a) * samples[i] + a * previous;
    samples[i] = previous;
  }
}

/** One-pole high-pass, in place. */
function highPass(samples, cutoffHz, sampleRate) {
  const rc = 1 / (2 * Math.PI * cutoffHz);
  const dt = 1 / sampleRate;
  const alpha = rc / (rc + dt);
  let lastIn = 0;
  let lastOut = 0;
  for (let i = 0; i < samples.length; i += 1) {
    const input = samples[i];
    lastOut = alpha * (lastOut + input - lastIn);
    lastIn = input;
    samples[i] = lastOut;
  }
}

/**
 * Render one loopable buffer of the chosen sleep sound.
 * The tail is equal-power crossfaded into the head so the loop point is inaudible.
 *
 * @returns {{error:string}|{samples:Float32Array,length:number,seconds:number}}
 */
export function renderSound({
  soundId = "brown",
  sampleRate = 44100,
  seconds = DEFAULT_LOOP_SECONDS,
  seed = 3,
  crossfadeSeconds = 0.4,
} = {}) {
  if (!SOUND_IDS.includes(soundId)) {
    return { error: `Sound must be one of: ${SOUND_IDS.join(", ")}.` };
  }
  const rate = Math.round(Number(sampleRate));
  if (!Number.isFinite(rate) || rate < 8000 || rate > 192000) {
    return { error: "Sample rate must be between 8,000 and 192,000 Hz." };
  }
  const length = Math.round(Number(seconds) * rate);
  if (!Number.isFinite(length) || length < rate) {
    return { error: "Loop length must be at least one second." };
  }

  const random = mulberry32(Number(seed) || 3);
  const raw = new Float32Array(length);

  if (soundId === "rain") {
    // Pink noise (Paul Kellet filter bank) with the top end lifted back in.
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
      raw[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362 + white * 0.25;
      b6 = white * 0.115926;
    }
    highPass(raw, 180, rate);
  } else if (soundId === "fan") {
    for (let i = 0; i < length; i += 1) raw[i] = random() * 2 - 1;
    lowPass(raw, 400, rate);
    lowPass(raw, 400, rate);
  } else {
    // Brown noise: leaky integration of white noise.
    let last = 0;
    for (let i = 0; i < length; i += 1) {
      const white = random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      raw[i] = last;
    }
    if (soundId === "surf") {
      // Amplitude-modulate with a raised-cosine swell. The LFO period is chosen so a
      // whole number of swells fits the buffer, keeping the loop seamless.
      const swells = Math.max(1, Math.round((length / rate) * SURF_LFO_HZ));
      for (let i = 0; i < length; i += 1) {
        const phase = (2 * Math.PI * swells * i) / length;
        raw[i] *= 0.25 + 0.75 * (0.5 * (1 - Math.cos(phase)));
      }
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
