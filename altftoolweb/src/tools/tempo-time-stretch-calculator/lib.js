/**
 * Time-stretch maths for moving audio between two tempos.
 *
 *   speed ratio  = targetBPM / sourceBPM        (how much faster it plays)
 *   length ratio = sourceBPM / targetBPM        (new duration / old duration)
 *   stretch %    = length ratio x 100           (what most DAWs display)
 *
 * If the stretch is done by resampling (varispeed / tape-style), pitch follows
 * speed, and because equal temperament divides an octave into 12 equal
 * frequency ratios:
 *
 *   semitones = 12 * log2(speed ratio)
 *   cents     = semitones x 100
 *
 * A modern elastic/time-stretch algorithm decouples the two, so the same
 * ratio produces no pitch change at all — the semitone figure then tells you
 * how far the algorithm has to work away from a plain resample.
 *
 * Pure module: no React, no DOM, no clock.
 */

/** Equal temperament divides the octave into 12 equal frequency steps. */
export const SEMITONES_PER_OCTAVE = 12;

/** One semitone is defined as 100 cents (Ellis, 1885; ISO 16). */
export const CENTS_PER_SEMITONE = 100;

/** Practical tempo range, matching common DAW limits. */
export const MIN_BPM = 1;
export const MAX_BPM = 1000;

/**
 * Beyond roughly ±3 semitones, resampling or naive stretching starts to sound
 * obviously artificial on full mixes; this is a widely used engineering
 * guideline, not a hard limit.
 */
export const COMFORTABLE_SEMITONES = 3;

/** Interval names for whole-semitone shifts. */
export const INTERVAL_NAMES = [
  "unison",
  "minor 2nd",
  "major 2nd",
  "minor 3rd",
  "major 3rd",
  "perfect 4th",
  "tritone",
  "perfect 5th",
  "minor 6th",
  "major 6th",
  "minor 7th",
  "major 7th",
  "octave",
];

export const BPM_PRESETS = [70, 90, 100, 120, 128, 140, 174];

const isFiniteNumber = (value) => Number.isFinite(value);

/** Semitones between two frequencies or two playback speeds. */
export function ratioToSemitones(ratio) {
  if (!isFiniteNumber(ratio) || ratio <= 0) return null;
  return SEMITONES_PER_OCTAVE * Math.log2(ratio);
}

/** Playback speed ratio that corresponds to a semitone shift. */
export function semitonesToRatio(semitones) {
  if (!isFiniteNumber(semitones)) return null;
  return Math.pow(2, semitones / SEMITONES_PER_OCTAVE);
}

/** Nearest named interval plus how many cents off it the shift lands. */
export function describeInterval(semitones) {
  if (!isFiniteNumber(semitones)) return { name: "—", centsOff: 0 };
  const nearest = Math.round(semitones);
  const octaves = Math.trunc(nearest / SEMITONES_PER_OCTAVE);
  const remainder = Math.abs(nearest) % SEMITONES_PER_OCTAVE;
  const base = INTERVAL_NAMES[remainder] ?? "—";
  const centsOff = (semitones - nearest) * CENTS_PER_SEMITONE;
  const magnitude =
    Math.abs(octaves) >= 1 && remainder === 0
      ? `${Math.abs(octaves)} octave${Math.abs(octaves) > 1 ? "s" : ""}`
      : Math.abs(octaves) >= 1
        ? `${Math.abs(octaves)} octave + ${base}`
        : base;
  const direction = nearest === 0 ? "" : nearest > 0 ? " up" : " down";
  return { name: `${magnitude}${direction}`, centsOff };
}

/** Combine a minutes/seconds clip length into plain seconds. */
export function toSeconds({ minutes = 0, seconds = 0 }) {
  const m = Number(minutes);
  const s = Number(seconds);
  if (![m, s].every(isFiniteNumber)) return NaN;
  return m * 60 + s;
}

/** Seconds -> "3 m 30.5 s". */
export function formatDuration(totalSeconds) {
  if (!isFiniteNumber(totalSeconds) || totalSeconds < 0) return "—";
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds - m * 60;
  if (m > 0) return `${m} m ${s.toFixed(2)} s`;
  return `${s.toFixed(2)} s`;
}

/**
 * Everything that changes when a clip recorded at sourceBpm is played at
 * targetBpm.
 *
 * @returns {object} either { error } or the full breakdown.
 */
export function computeTimeStretch({
  sourceBpm,
  targetBpm,
  clipSeconds = 0,
  sampleRate = 48000,
}) {
  const from = Number(sourceBpm);
  const to = Number(targetBpm);
  const clip = Number(clipSeconds);
  const rate = Number(sampleRate);

  if (![from, to, clip, rate].every(isFiniteNumber)) {
    return { error: "Enter a number in every field." };
  }
  if (from <= 0 || to <= 0) return { error: "Both tempos must be greater than zero." };
  if (from < MIN_BPM || from > MAX_BPM || to < MIN_BPM || to > MAX_BPM) {
    return { error: `Tempos must be between ${MIN_BPM} and ${MAX_BPM} BPM.` };
  }
  if (clip < 0) return { error: "Clip length cannot be negative." };
  if (rate <= 0) return { error: "Sample rate must be greater than zero." };

  const speedRatio = to / from;
  const lengthRatio = from / to;
  const semitones = ratioToSemitones(speedRatio);
  const interval = describeInterval(semitones);

  return {
    sourceBpm: from,
    targetBpm: to,
    speedRatio,
    lengthRatio,
    stretchPercent: lengthRatio * 100,
    speedPercent: speedRatio * 100,
    tempoChangePercent: (speedRatio - 1) * 100,
    semitones,
    cents: semitones * CENTS_PER_SEMITONE,
    intervalName: interval.name,
    intervalCentsOff: interval.centsOff,
    faster: to > from,
    withinComfortZone: Math.abs(semitones) <= COMFORTABLE_SEMITONES,
    clipSeconds: clip,
    newDurationSeconds: clip * lengthRatio,
    durationChangeSeconds: clip * lengthRatio - clip,
    varispeedSampleRate: rate * speedRatio,
    /** Pitch compensation to dial in if you resample and want the key back. */
    pitchCorrectionSemitones: -semitones,
  };
}

/**
 * The reverse question: what tempo would a clip land on if it were resampled
 * by a given number of semitones?
 */
export function tempoAfterPitchShift({ sourceBpm, semitones }) {
  const from = Number(sourceBpm);
  const shift = Number(semitones);
  if (![from, shift].every(isFiniteNumber)) return { error: "Enter a number in every field." };
  if (from <= 0) return { error: "Tempo must be greater than zero." };
  if (Math.abs(shift) > 48) return { error: "Keep the shift within four octaves." };
  const ratio = semitonesToRatio(shift);
  return { ratio, targetBpm: from * ratio };
}
