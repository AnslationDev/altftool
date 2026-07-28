/**
 * Loop length maths.
 *
 * Everything follows from one relationship: at a tempo of BPM beats per minute,
 * one beat lasts 60 / BPM seconds.
 *
 *   bar seconds   = beats per bar x 60 / BPM
 *   loop seconds  = bars x bar seconds
 *   loop samples  = loop seconds x sample rate
 *
 * Note divisions assume the quarter note is the beat, which is true for the x/4
 * time signatures that cover almost all popular music. A whole note is then four
 * beats, so a 1/n note lasts (4 / n) x 60 / BPM seconds. A dotted note adds half
 * its own length (x 1.5) and a triplet fits three in the space of two (x 2/3).
 */

export const SECONDS_PER_MINUTE = 60;

/** A whole note is four quarter-note beats in any x/4 time signature. */
export const BEATS_PER_WHOLE_NOTE = 4;

/** Dotted notes are one and a half times their plain length. */
export const DOTTED_FACTOR = 1.5;

/** Three triplets occupy the space of two plain notes. */
export const TRIPLET_FACTOR = 2 / 3;

export const MIN_BPM = 20;
export const MAX_BPM = 999;
export const MAX_BARS = 1024;

/** Sample rates in normal studio use, in hertz. */
export const SAMPLE_RATES = [44100, 48000, 88200, 96000, 176400, 192000];

/** Note divisions, as the denominator of the note value. */
export const NOTE_DIVISIONS = [1, 2, 4, 8, 16, 32, 64];

/** Loop lengths producers reach for, in bars. */
export const COMMON_BAR_LENGTHS = [1, 2, 4, 8, 16, 32];

/**
 * Convert a loop length in bars into every other unit.
 *
 * @param {object} input
 * @param {number} input.bars        loop length in bars
 * @param {number} input.bpm         tempo in beats per minute
 * @param {number} input.beatsPerBar beats in a bar
 * @param {number} input.sampleRate  sample rate in hertz
 * @returns {object} seconds, beats, samples and frames, or { error }
 */
export function loopFromBars({ bars, bpm, beatsPerBar = 4, sampleRate = 48000 } = {}) {
  const barCount = Number(bars);
  const tempo = Number(bpm);
  const perBar = Number(beatsPerBar);
  const rate = Number(sampleRate);

  if (![barCount, tempo, perBar, rate].every(Number.isFinite)) {
    return { error: "Enter a number in every field." };
  }
  if (tempo < MIN_BPM || tempo > MAX_BPM) {
    return { error: `Tempo should be between ${MIN_BPM} and ${MAX_BPM} BPM.` };
  }
  if (barCount <= 0) return { error: "The loop must be at least a fraction of a bar long." };
  if (barCount > MAX_BARS) return { error: `Keep the loop to ${MAX_BARS} bars or fewer.` };
  if (perBar < 1 || perBar > 16) return { error: "Beats per bar should be between 1 and 16." };
  if (rate <= 0) return { error: "Sample rate must be greater than zero." };

  const beatSeconds = SECONDS_PER_MINUTE / tempo;
  const barSeconds = beatSeconds * perBar;
  const seconds = barSeconds * barCount;

  return {
    bars: barCount,
    bpm: tempo,
    beatsPerBar: perBar,
    sampleRate: rate,
    beats: barCount * perBar,
    beatSeconds,
    barSeconds,
    seconds,
    milliseconds: seconds * 1000,
    samples: seconds * rate,
    /** Video editors cut loops to picture, so give the frame count too. */
    frames24: seconds * 24,
    frames25: seconds * 25,
    frames30: seconds * 30,
  };
}

/**
 * Convert a length in seconds back into bars and beats.
 *
 * @param {number} seconds
 * @param {number} bpm
 * @param {number} beatsPerBar
 */
export function loopFromSeconds({ seconds, bpm, beatsPerBar = 4 } = {}) {
  const time = Number(seconds);
  const tempo = Number(bpm);
  const perBar = Number(beatsPerBar);

  if (![time, tempo, perBar].every(Number.isFinite)) {
    return { error: "Enter a number for length, tempo and beats per bar." };
  }
  if (tempo < MIN_BPM || tempo > MAX_BPM) {
    return { error: `Tempo should be between ${MIN_BPM} and ${MAX_BPM} BPM.` };
  }
  if (time <= 0) return { error: "Loop length must be greater than zero." };
  if (perBar < 1 || perBar > 16) return { error: "Beats per bar should be between 1 and 16." };

  const beatSeconds = SECONDS_PER_MINUTE / tempo;
  const beats = time / beatSeconds;
  const bars = beats / perBar;
  const wholeBars = Math.floor(bars);
  const remainderBeats = beats - wholeBars * perBar;

  return {
    seconds: time,
    beats,
    bars,
    wholeBars,
    remainderBeats,
    exact: Math.abs(bars - Math.round(bars)) < 1e-6,
  };
}

/**
 * What tempo makes a fixed-length sample fit a whole number of bars?
 * bpm = beats per bar x bars x 60 / seconds
 */
export function tempoForLoop({ seconds, bars, beatsPerBar = 4 } = {}) {
  const time = Number(seconds);
  const barCount = Number(bars);
  const perBar = Number(beatsPerBar);

  if (![time, barCount, perBar].every(Number.isFinite)) {
    return { error: "Enter a number for length, bars and beats per bar." };
  }
  if (time <= 0) return { error: "Loop length must be greater than zero." };
  if (barCount <= 0) return { error: "Bar count must be greater than zero." };
  if (perBar < 1 || perBar > 16) return { error: "Beats per bar should be between 1 and 16." };

  const bpm = (perBar * barCount * SECONDS_PER_MINUTE) / time;
  if (!Number.isFinite(bpm) || bpm <= 0) {
    return { error: "Those values do not produce a usable tempo." };
  }
  return { bpm, inRange: bpm >= MIN_BPM && bpm <= MAX_BPM };
}

/**
 * The classic delay-time table: plain, dotted and triplet note values in
 * milliseconds at a given tempo.
 */
export function noteDivisionTable({ bpm } = {}) {
  const tempo = Number(bpm);
  if (!Number.isFinite(tempo) || tempo < MIN_BPM || tempo > MAX_BPM) {
    return { error: `Tempo should be between ${MIN_BPM} and ${MAX_BPM} BPM.` };
  }
  const beatSeconds = SECONDS_PER_MINUTE / tempo;
  const rows = NOTE_DIVISIONS.map((division) => {
    const plain = (BEATS_PER_WHOLE_NOTE / division) * beatSeconds * 1000;
    return {
      division,
      label: `1/${division}`,
      plainMs: plain,
      dottedMs: plain * DOTTED_FACTOR,
      tripletMs: plain * TRIPLET_FACTOR,
      plainHz: plain > 0 ? 1000 / plain : 0,
    };
  });
  return { rows, beatSeconds };
}

/** Format seconds as m:ss.mmm. Never returns NaN. */
export function formatLength(seconds) {
  const value = Number(seconds);
  if (!Number.isFinite(value) || value < 0) return "—";
  const minutes = Math.floor(value / 60);
  const rest = value - minutes * 60;
  const padded = rest < 10 ? `0${rest.toFixed(3)}` : rest.toFixed(3);
  return `${minutes}:${padded}`;
}
