/**
 * Tempo -> time maths for delay, reverb pre-delay and LFO settings.
 *
 * BPM in every DAW counts quarter notes per minute, so:
 *
 *   quarter note (ms) = 60000 / BPM
 *   any note (ms)     = quarter note (ms) x beats-in-that-note x modifier
 *
 * where a dotted note adds half its own length (x 1.5) and a triplet fits
 * three in the space of two (x 2/3). Frequency is simply 1000 / ms, and the
 * same interval in samples is ms / 1000 x sample rate.
 *
 * Pure module: no React, no DOM, no clock.
 */

/** 60,000 milliseconds in a minute — the whole basis of tempo-to-time. */
export const MS_PER_MINUTE = 60000;

/** A dot adds half the note's own value again. */
export const DOTTED_FACTOR = 1.5;

/** A triplet plays three notes in the time of two: 2/3 of the straight value. */
export const TRIPLET_FACTOR = 2 / 3;

/** Practical tempo range; DAWs generally allow roughly 20-999 BPM. */
export const MIN_BPM = 1;
export const MAX_BPM = 1000;

/** Note values expressed in quarter-note beats. */
export const NOTE_DIVISIONS = [
  { id: "1-1", label: "Whole (1/1)", beats: 4 },
  { id: "1-2", label: "Half (1/2)", beats: 2 },
  { id: "1-4", label: "Quarter (1/4)", beats: 1 },
  { id: "1-8", label: "Eighth (1/8)", beats: 0.5 },
  { id: "1-16", label: "Sixteenth (1/16)", beats: 0.25 },
  { id: "1-32", label: "Thirty-second (1/32)", beats: 0.125 },
  { id: "1-64", label: "Sixty-fourth (1/64)", beats: 0.0625 },
];

export const TIME_SIGNATURE_PRESETS = [
  { label: "4/4", beatsPerBar: 4, beatUnit: 4 },
  { label: "3/4", beatsPerBar: 3, beatUnit: 4 },
  { label: "6/8", beatsPerBar: 6, beatUnit: 8 },
  { label: "5/4", beatsPerBar: 5, beatUnit: 4 },
  { label: "7/8", beatsPerBar: 7, beatUnit: 8 },
  { label: "12/8", beatsPerBar: 12, beatUnit: 8 },
];

export const SAMPLE_RATE_OPTIONS = [44100, 48000, 88200, 96000, 192000];

const isFiniteNumber = (value) => Number.isFinite(value);

/** Milliseconds for one quarter note at the given tempo. */
export function quarterNoteMs(bpm) {
  return MS_PER_MINUTE / bpm;
}

/** Convert a millisecond interval to its frequency in hertz. */
export function msToHz(ms) {
  if (!isFiniteNumber(ms) || ms <= 0) return null;
  return 1000 / ms;
}

/**
 * Full delay-time table for a tempo.
 *
 * @returns {object} either { error } or { quarterMs, barMs, rows }
 */
export function computeDelayTimes({ bpm, sampleRate = 48000, beatsPerBar = 4, beatUnit = 4 }) {
  const tempo = Number(bpm);
  const rate = Number(sampleRate);
  const perBar = Number(beatsPerBar);
  const unit = Number(beatUnit);

  if (![tempo, rate, perBar, unit].every(isFiniteNumber)) {
    return { error: "Enter a number in every field." };
  }
  if (tempo <= 0) return { error: "Tempo must be greater than zero." };
  if (tempo < MIN_BPM || tempo > MAX_BPM) {
    return { error: `Tempo must be between ${MIN_BPM} and ${MAX_BPM} BPM.` };
  }
  if (rate <= 0) return { error: "Sample rate must be greater than zero." };
  if (perBar <= 0 || perBar > 64) return { error: "Beats per bar must be between 1 and 64." };
  if (unit <= 0 || unit > 64) return { error: "The beat unit must be between 1 and 64." };

  const quarterMs = quarterNoteMs(tempo);
  // A bar holds beatsPerBar notes of length (4 / beatUnit) quarter notes each.
  const barMs = quarterMs * perBar * (4 / unit);

  const rows = NOTE_DIVISIONS.map((division) => {
    const build = (factor) => {
      const ms = quarterMs * division.beats * factor;
      return {
        ms,
        hz: msToHz(ms),
        samples: (ms / 1000) * rate,
      };
    };
    return {
      id: division.id,
      label: division.label,
      beats: division.beats,
      straight: build(1),
      dotted: build(DOTTED_FACTOR),
      triplet: build(TRIPLET_FACTOR),
    };
  });

  return {
    bpm: tempo,
    sampleRate: rate,
    beatsPerBar: perBar,
    beatUnit: unit,
    quarterMs,
    quarterHz: msToHz(quarterMs),
    barMs,
    barHz: msToHz(barMs),
    barsPerMinute: MS_PER_MINUTE / barMs,
    rows,
    /** Convenience lookup so callers never re-derive a note length themselves. */
    byId: Object.fromEntries(rows.map((row) => [row.id, row])),
  };
}

/**
 * Nearest note value to a delay time you already have (for example the ms a
 * hardware unit is set to, or a delay you tapped in by ear).
 *
 * @returns {object} either { error } or the closest match plus its error in ms.
 */
export function matchMsToNote({ bpm, targetMs }) {
  const table = computeDelayTimes({ bpm });
  if (table.error) return table;
  const target = Number(targetMs);
  if (!isFiniteNumber(target) || target <= 0) {
    return { error: "Enter a delay time in milliseconds greater than zero." };
  }

  let best = null;
  for (const row of table.rows) {
    for (const [variant, key] of [
      ["straight", "straight"],
      ["dotted", "dotted"],
      ["triplet", "triplet"],
    ]) {
      const ms = row[key].ms;
      const diff = Math.abs(ms - target);
      if (!best || diff < best.diffMs) {
        best = { label: row.label, variant, ms, diffMs: diff };
      }
    }
  }
  return { ...best, targetMs: target, driftPercent: (best.diffMs / target) * 100 };
}
