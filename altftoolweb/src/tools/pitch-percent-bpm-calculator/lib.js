/**
 * Pitch percentage <-> tempo maths.
 *
 * A pitch fader changes the playback rate, so every quantity scales by the same
 * factor r = 1 + pitch / 100:
 *
 *   resulting BPM   = base BPM x r
 *   playing time    = original time / r
 *   pitch to reach a target tempo = (target / base - 1) x 100
 *
 * Because pitch is a frequency ratio, the musical shift is logarithmic, not
 * linear: an octave is a doubling, twelve equal semitones to the octave, so
 *
 *   semitones = 12 x log2(r)        cents = 1200 x log2(r)
 *
 * That is why +6% is about one semitone rather than "6% of an octave", and why
 * key lock exists — without it, pitching a track also transposes it.
 */

export const SEMITONES_PER_OCTAVE = 12;
export const CENTS_PER_OCTAVE = 1200;

export const MIN_BPM = 20;
export const MAX_BPM = 300;

/** A ratio of zero or less would stop or reverse playback. */
export const MIN_PITCH_PERCENT = -99;
export const MAX_PITCH_PERCENT = 100;

/** Pitch fader ranges on standard DJ hardware, in percent. */
export const PITCH_RANGES = [
  { id: "6", percent: 6, name: "±6% (CDJ fine)" },
  { id: "8", percent: 8, name: "±8% (turntable / CDJ default)" },
  { id: "10", percent: 10, name: "±10% (Technics SL-1200 nominal)" },
  { id: "16", percent: 16, name: "±16% (CDJ wide)" },
  { id: "50", percent: 50, name: "±50% / WIDE" },
];

/** The two vinyl platter speeds, in revolutions per minute. */
export const RPM_33 = 100 / 3;
export const RPM_45 = 45;

/**
 * Pitch change from playing a record at the wrong platter speed, in percent.
 * 45 on a 33 1/3 record is (45 / 33.333 - 1) x 100 = +35%.
 */
export const SPEED_SWAPS = [
  {
    id: "33-to-45",
    name: "33 1/3 rpm record played at 45",
    percent: ((RPM_45 - RPM_33) / RPM_33) * 100,
  },
  {
    id: "45-to-33",
    name: "45 rpm record played at 33 1/3",
    percent: ((RPM_33 - RPM_45) / RPM_45) * 100,
  },
];

const ratioFromPercent = (percent) => 1 + percent / 100;

/**
 * Apply a pitch percentage to a tempo.
 *
 * @param {object} input
 * @param {number} input.baseBpm        the track's written tempo
 * @param {number} input.pitchPercent   fader position in percent
 * @param {number} input.trackSeconds   original running time, for the duration figures
 * @param {number} input.pitchRange     hardware fader range, for the in-range check
 * @returns {object} resulting tempo, key shift and timing, or { error }
 */
export function applyPitch({
  baseBpm,
  pitchPercent,
  trackSeconds = 0,
  pitchRange = 8,
} = {}) {
  const base = Number(baseBpm);
  const percent = Number(pitchPercent);
  const seconds = Number(trackSeconds);
  const range = Number(pitchRange);

  if (![base, percent, seconds, range].every(Number.isFinite)) {
    return { error: "Enter a number in every field." };
  }
  if (base < MIN_BPM || base > MAX_BPM) {
    return { error: `The written tempo should be between ${MIN_BPM} and ${MAX_BPM} BPM.` };
  }
  if (percent <= MIN_PITCH_PERCENT || percent > MAX_PITCH_PERCENT) {
    return {
      error: `Pitch must be above ${MIN_PITCH_PERCENT}% and at most ${MAX_PITCH_PERCENT}%.`,
    };
  }
  if (seconds < 0) return { error: "Track length cannot be negative." };
  if (range <= 0) return { error: "Pitch range must be greater than zero." };

  const ratio = ratioFromPercent(percent);
  if (!(ratio > 0)) return { error: "That pitch would stop playback." };

  const resultingBpm = base * ratio;
  const cents = CENTS_PER_OCTAVE * Math.log2(ratio);
  const semitones = SEMITONES_PER_OCTAVE * Math.log2(ratio);
  const newSeconds = seconds > 0 ? seconds / ratio : 0;

  return {
    baseBpm: base,
    pitchPercent: percent,
    ratio,
    resultingBpm,
    bpmChange: resultingBpm - base,
    cents,
    semitones,
    originalSeconds: seconds,
    newSeconds,
    secondsSaved: seconds > 0 ? seconds - newSeconds : 0,
    beatSecondsBefore: 60 / base,
    beatSecondsAfter: 60 / resultingBpm,
    pitchRange: range,
    withinRange: Math.abs(percent) <= range,
    keyLockAdvised: Math.abs(cents) >= 50,
  };
}

/**
 * Work backwards: what pitch reaches a target tempo?
 *
 * @param {number} baseBpm
 * @param {number} targetBpm
 * @param {number} pitchRange
 */
export function pitchForTarget({ baseBpm, targetBpm, pitchRange = 8 } = {}) {
  const base = Number(baseBpm);
  const target = Number(targetBpm);
  const range = Number(pitchRange);

  if (![base, target, range].every(Number.isFinite)) {
    return { error: "Enter a number for both tempos." };
  }
  if (base < MIN_BPM || base > MAX_BPM || target < MIN_BPM || target > MAX_BPM) {
    return { error: `Both tempos should be between ${MIN_BPM} and ${MAX_BPM} BPM.` };
  }
  if (base <= 0) return { error: "The written tempo must be greater than zero." };

  const percent = (target / base - 1) * 100;
  return {
    percent,
    withinRange: Math.abs(percent) <= range,
    cents: CENTS_PER_OCTAVE * Math.log2(target / base),
    semitones: SEMITONES_PER_OCTAVE * Math.log2(target / base),
  };
}

/** Tempo at each notch of a fader, for the reference table. */
export function pitchTable({ baseBpm, pitchRange = 8, steps = 8 } = {}) {
  const range = Number(pitchRange);
  const count = Math.max(1, Math.min(24, Math.round(Number(steps) || 8)));
  if (!Number.isFinite(range) || range <= 0) return [];
  const rows = [];
  for (let i = -count; i <= count; i += 1) {
    const percent = (range * i) / count;
    const result = applyPitch({ baseBpm, pitchPercent: percent, pitchRange: range });
    rows.push({
      percent,
      bpm: result.error ? null : result.resultingBpm,
      cents: result.error ? null : result.cents,
      error: result.error || null,
    });
  }
  return rows;
}

/** Format seconds as m:ss. Never returns NaN. */
export function formatClock(seconds) {
  const value = Number(seconds);
  if (!Number.isFinite(value) || value < 0) return "—";
  const minutes = Math.floor(value / 60);
  const rest = Math.round(value - minutes * 60);
  const carry = rest === 60 ? 1 : 0;
  const shown = rest === 60 ? 0 : rest;
  return `${minutes + carry}:${shown < 10 ? "0" : ""}${shown}`;
}
