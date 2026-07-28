/**
 * Twelve-tone equal temperament (12-TET).
 *
 * Every semitone is the twelfth root of two apart, so the frequency of any
 * MIDI note number n is:
 *
 *   f(n) = A4 x 2^((n - 69) / 12)
 *
 * MIDI note 69 is A4, the tuning reference, standardised at 440 Hz by
 * ISO 16:1975. Note names use scientific pitch notation, in which middle C is
 * C4 and equals MIDI note 60, so the octave number of MIDI note n is
 * floor(n / 12) - 1.
 */

/** MIDI note number of the tuning reference A4. */
export const A4_MIDI = 69;

/** ISO 16:1975 concert pitch. */
export const STANDARD_A4_HZ = 440;

/** Semitones in an octave. */
export const SEMITONES_PER_OCTAVE = 12;

/** Cents in a semitone (Ellis's cent: 1200 cents to the octave). */
export const CENTS_PER_SEMITONE = 100;

/** MIDI note numbers run 0 (C-1) to 127 (G9). */
export const MIN_MIDI = 0;
export const MAX_MIDI = 127;

/** Speed of sound in dry air at 20 degrees Celsius, in metres per second. */
export const SPEED_OF_SOUND_20C = 343.2;

export const SHARP_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export const FLAT_NAMES = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];

/** Common alternative tuning references, with what they are used for. */
export const TUNING_PRESETS = [
  { hz: 415, name: "A4 = 415 Hz", note: "Baroque pitch, roughly a semitone below modern." },
  { hz: 432, name: "A4 = 432 Hz", note: "Alternative tuning with no standards backing." },
  { hz: 440, name: "A4 = 440 Hz", note: "ISO 16 concert pitch, the modern standard." },
  { hz: 442, name: "A4 = 442 Hz", note: "Common in European orchestras." },
  { hz: 443, name: "A4 = 443 Hz", note: "Used by some German and Austrian orchestras." },
];

/** Named landmarks that help people orient in the table. */
export const LANDMARKS = [
  { midi: 21, label: "A0 — lowest key on an 88-key piano" },
  { midi: 28, label: "E1 — low E on a 4-string bass" },
  { midi: 40, label: "E2 — low E on a guitar in standard tuning" },
  { midi: 60, label: "C4 — middle C" },
  { midi: 69, label: "A4 — the tuning reference" },
  { midi: 108, label: "C8 — highest key on an 88-key piano" },
];

const isValidReference = (hz) => Number.isFinite(hz) && hz >= 380 && hz <= 500;

/** Note name and octave for a MIDI number. */
export function midiToName(midi, { useFlats = false } = {}) {
  const n = Number(midi);
  if (!Number.isFinite(n)) return null;
  const index = Math.round(n);
  const pitchClass = ((index % SEMITONES_PER_OCTAVE) + SEMITONES_PER_OCTAVE) % SEMITONES_PER_OCTAVE;
  const octave = Math.floor(index / SEMITONES_PER_OCTAVE) - 1;
  const names = useFlats ? FLAT_NAMES : SHARP_NAMES;
  return {
    pitchClass,
    octave,
    letter: names[pitchClass],
    name: `${names[pitchClass]}${octave}`,
    isBlackKey: SHARP_NAMES[pitchClass].includes("#"),
  };
}

/**
 * Frequency of a MIDI note.
 *
 * @param {number} midi     MIDI note number, may be fractional
 * @param {number} a4Hz     tuning reference for A4
 */
export function midiToFrequency({ midi, a4Hz = STANDARD_A4_HZ } = {}) {
  const n = Number(midi);
  const reference = Number(a4Hz);
  if (!Number.isFinite(n)) return { error: "Enter a MIDI note number." };
  if (!isValidReference(reference)) {
    return { error: "The A4 reference should be between 380 Hz and 500 Hz." };
  }
  if (n < MIN_MIDI || n > MAX_MIDI) {
    return { error: `MIDI note numbers run from ${MIN_MIDI} to ${MAX_MIDI}.` };
  }

  const frequency = reference * 2 ** ((n - A4_MIDI) / SEMITONES_PER_OCTAVE);
  const naming = midiToName(n);
  return {
    midi: n,
    frequency,
    periodMs: 1000 / frequency,
    wavelengthMetres: SPEED_OF_SOUND_20C / frequency,
    ...naming,
  };
}

/**
 * Nearest note to a measured frequency, with the tuning error in cents.
 *
 * @param {number} frequency Hz
 * @param {number} a4Hz      tuning reference for A4
 */
export function frequencyToNote({ frequency, a4Hz = STANDARD_A4_HZ } = {}) {
  const hz = Number(frequency);
  const reference = Number(a4Hz);
  if (!Number.isFinite(hz)) return { error: "Enter a frequency in hertz." };
  if (!isValidReference(reference)) {
    return { error: "The A4 reference should be between 380 Hz and 500 Hz." };
  }
  if (hz <= 0) return { error: "Frequency must be greater than zero." };

  const exactMidi = A4_MIDI + SEMITONES_PER_OCTAVE * Math.log2(hz / reference);
  if (!Number.isFinite(exactMidi)) return { error: "That frequency cannot be matched to a note." };

  const nearestMidi = Math.round(exactMidi);
  if (nearestMidi < MIN_MIDI || nearestMidi > MAX_MIDI) {
    return {
      error: `${hz} Hz falls outside the MIDI range (${MIN_MIDI}-${MAX_MIDI}, about 8 Hz to 12.5 kHz).`,
    };
  }

  const cents = (exactMidi - nearestMidi) * CENTS_PER_SEMITONE;
  const target = midiToFrequency({ midi: nearestMidi, a4Hz: reference });
  return {
    frequency: hz,
    exactMidi,
    midi: nearestMidi,
    cents,
    inTune: Math.abs(cents) <= 5,
    targetFrequency: target.error ? null : target.frequency,
    ...midiToName(nearestMidi),
  };
}

/**
 * Build a chart of notes between two MIDI numbers.
 *
 * @param {number} fromMidi inclusive
 * @param {number} toMidi   inclusive
 * @param {number} a4Hz     tuning reference
 */
export function buildChart({ fromMidi = 21, toMidi = 108, a4Hz = STANDARD_A4_HZ } = {}) {
  const start = Math.round(Number(fromMidi));
  const end = Math.round(Number(toMidi));
  const reference = Number(a4Hz);

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return { error: "Enter whole MIDI note numbers for the range." };
  }
  if (!isValidReference(reference)) {
    return { error: "The A4 reference should be between 380 Hz and 500 Hz." };
  }
  if (start < MIN_MIDI || end > MAX_MIDI) {
    return { error: `MIDI note numbers run from ${MIN_MIDI} to ${MAX_MIDI}.` };
  }
  if (end < start) return { error: "The end of the range must not be below the start." };

  const rows = [];
  for (let midi = start; midi <= end; midi += 1) {
    const entry = midiToFrequency({ midi, a4Hz: reference });
    if (entry.error) continue;
    rows.push({
      midi,
      name: entry.name,
      flatName: midiToName(midi, { useFlats: true }).name,
      octave: entry.octave,
      frequency: entry.frequency,
      periodMs: entry.periodMs,
      wavelengthMetres: entry.wavelengthMetres,
      isBlackKey: entry.isBlackKey,
    });
  }

  return { rows, count: rows.length, a4Hz: reference };
}

/** Interval between two frequencies, in cents. Never returns NaN. */
export function centsBetween(lowerHz, upperHz) {
  const a = Number(lowerHz);
  const b = Number(upperHz);
  if (!Number.isFinite(a) || !Number.isFinite(b) || a <= 0 || b <= 0) {
    return { error: "Both frequencies must be greater than zero." };
  }
  return { cents: 1200 * Math.log2(b / a) };
}
