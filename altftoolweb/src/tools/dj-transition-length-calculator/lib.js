/**
 * DJ transition length maths.
 *
 * Three quantities matter in a blend between two tracks at different tempos:
 *
 * 1. Length at a fixed tempo. One beat lasts 60 / BPM seconds, so a blend of
 *    `bars` bars at `beatsPerBar` beats per bar lasts
 *    bars x beatsPerBar x 60 / BPM seconds.
 *
 * 2. Length when the tempo ramps. If the tempo moves linearly from BPM_a to
 *    BPM_b across N beats, the elapsed time is the integral of 60 / BPM(beat)
 *    over those beats, which has the closed form
 *      t = 60 x N x ln(BPM_b / BPM_a) / (BPM_b - BPM_a)
 *    the logarithmic mean of the two tempos. When the tempos are equal this
 *    collapses to the fixed-tempo formula, which the code handles explicitly
 *    because the expression is 0/0 at that point.
 *
 * 3. The pitch move needed to beatmatch: (BPM_b - BPM_a) / BPM_a x 100 percent.
 */

/** Below this BPM difference the ramp formula is numerically 0/0. */
const TEMPO_EPSILON = 1e-9;

export const SECONDS_PER_MINUTE = 60;

/** Sensible working limits for club and radio material. */
export const MIN_BPM = 20;
export const MAX_BPM = 300;
export const MAX_BARS = 512;

/** Pitch fader ranges found on standard DJ hardware, in percent. */
export const PITCH_RANGES = [
  { id: "6", percent: 6, name: "±6% (CDJ fine)" },
  { id: "8", percent: 8, name: "±8% (turntable / CDJ default)" },
  { id: "10", percent: 10, name: "±10% (Technics SL-1200 nominal)" },
  { id: "16", percent: 16, name: "±16% (CDJ wide)" },
  { id: "50", percent: 50, name: "±50% / WIDE" },
];

/** Blend lengths DJs actually use, in bars. */
export const COMMON_BAR_LENGTHS = [4, 8, 16, 32, 64];

/** How many bars make a phrase in most dance music. */
export const PHRASE_BARS = 8;

/**
 * Seconds for a number of beats at a constant tempo.
 * Returns null rather than Infinity for a non-positive tempo.
 */
export function beatsToSeconds(beats, bpm) {
  const b = Number(beats);
  const tempo = Number(bpm);
  if (!Number.isFinite(b) || !Number.isFinite(tempo) || tempo <= 0 || b < 0) return null;
  return (b * SECONDS_PER_MINUTE) / tempo;
}

/**
 * Seconds for a number of beats while the tempo ramps linearly from one BPM to
 * another. Uses the logarithmic mean of the two tempos.
 */
export function rampedBeatsToSeconds(beats, fromBpm, toBpm) {
  const b = Number(beats);
  const a = Number(fromBpm);
  const c = Number(toBpm);
  if (![b, a, c].every(Number.isFinite) || a <= 0 || c <= 0 || b < 0) return null;
  if (Math.abs(c - a) < TEMPO_EPSILON) return (b * SECONDS_PER_MINUTE) / a;
  return (SECONDS_PER_MINUTE * b * Math.log(c / a)) / (c - a);
}

/**
 * Work out a transition.
 *
 * @param {object} input
 * @param {number} input.bpmA        tempo of the outgoing track
 * @param {number} input.bpmB        tempo of the incoming track
 * @param {number} input.bars        length of the blend in bars
 * @param {number} input.beatsPerBar beats in a bar (4 for most dance music)
 * @param {number} input.pitchRange  the deck's pitch fader range in percent
 * @returns {object} lengths, pitch move and phrase fit, or { error }
 */
export function calculateTransition({
  bpmA,
  bpmB,
  bars,
  beatsPerBar = 4,
  pitchRange = 8,
} = {}) {
  const a = Number(bpmA);
  const b = Number(bpmB);
  const barCount = Number(bars);
  const perBar = Number(beatsPerBar);
  const range = Number(pitchRange);

  if (![a, b, barCount, perBar, range].every(Number.isFinite)) {
    return { error: "Enter a number in every field." };
  }
  if (a < MIN_BPM || a > MAX_BPM || b < MIN_BPM || b > MAX_BPM) {
    return { error: `Both tempos should be between ${MIN_BPM} and ${MAX_BPM} BPM.` };
  }
  if (barCount <= 0) return { error: "The blend must be at least one bar long." };
  if (barCount > MAX_BARS) return { error: `Keep the blend to ${MAX_BARS} bars or fewer.` };
  if (perBar < 1 || perBar > 16) return { error: "Beats per bar should be between 1 and 16." };
  if (range <= 0) return { error: "Pitch range must be greater than zero." };

  const beats = barCount * perBar;
  const secondsAtA = beatsToSeconds(beats, a);
  const secondsAtB = beatsToSeconds(beats, b);
  const secondsRamped = rampedBeatsToSeconds(beats, a, b);

  if (secondsAtA === null || secondsAtB === null || secondsRamped === null) {
    return { error: "Those tempos cannot produce a transition length." };
  }

  const pitchPercent = ((b - a) / a) * 100;
  const withinRange = Math.abs(pitchPercent) <= range;

  /** Halving or doubling the incoming tempo to mix across genres. */
  const halfTimePitch = ((b / 2 - a) / a) * 100;
  const doubleTimePitch = ((b * 2 - a) / a) * 100;

  return {
    bpmA: a,
    bpmB: b,
    bars: barCount,
    beatsPerBar: perBar,
    beats,
    secondsAtA,
    secondsAtB,
    secondsRamped,
    /** Difference between holding tempo A throughout and riding the pitch across. */
    rampDeltaSeconds: secondsRamped - secondsAtA,
    barSecondsA: beatsToSeconds(perBar, a),
    barSecondsB: beatsToSeconds(perBar, b),
    bpmDifference: b - a,
    pitchPercent,
    pitchRange: range,
    withinRange,
    halfTimePitch,
    doubleTimePitch,
    halfTimeWorks: Math.abs(halfTimePitch) <= range,
    doubleTimeWorks: Math.abs(doubleTimePitch) <= range,
    phrases: barCount / PHRASE_BARS,
    wholePhrases: Number.isInteger(barCount / PHRASE_BARS),
  };
}

/** The common blend lengths, timed at one tempo pair. */
export function barLengthTable({ bpmA, bpmB, beatsPerBar = 4 } = {}) {
  return COMMON_BAR_LENGTHS.map((bars) => {
    const result = calculateTransition({ bpmA, bpmB, bars, beatsPerBar });
    return {
      bars,
      beats: result.error ? null : result.beats,
      secondsAtA: result.error ? null : result.secondsAtA,
      secondsAtB: result.error ? null : result.secondsAtB,
      secondsRamped: result.error ? null : result.secondsRamped,
      error: result.error || null,
    };
  });
}

/** Format seconds as m:ss.d. Never returns NaN. */
export function formatClock(seconds) {
  const value = Number(seconds);
  if (!Number.isFinite(value) || value < 0) return "—";
  const minutes = Math.floor(value / 60);
  const rest = value - minutes * 60;
  const restText = rest < 10 ? `0${rest.toFixed(1)}` : rest.toFixed(1);
  return `${minutes}:${restText}`;
}
