/**
 * Music interval maths.
 *
 * Interval naming follows standard Western common-practice theory:
 *   - the NUMBER comes from the letter names (staff degrees) the two notes occupy,
 *   - the QUALITY comes from how the actual semitone distance compares with the
 *     major/perfect size of that number.
 * Pitch is in scientific pitch notation, where middle C is C4 = MIDI 60 and A4 = MIDI 69.
 */

/** Letter names in staff order starting from C, so index = staff degree above C. */
export const LETTERS = ["C", "D", "E", "F", "G", "A", "B"];

/** Semitones each natural letter sits above C in the same octave (the C major scale). */
export const LETTER_SEMITONES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** Accidentals shift a note by whole semitones; double accidentals are the practical limit. */
export const ACCIDENTALS = [
  { value: -2, symbol: "bb", label: "Double flat (bb)" },
  { value: -1, symbol: "b", label: "Flat (b)" },
  { value: 0, symbol: "", label: "Natural" },
  { value: 1, symbol: "#", label: "Sharp (#)" },
  { value: 2, symbol: "##", label: "Double sharp (##)" },
];

/** Octave numbers that stay inside the MIDI note range 0-127 (C-1 to G9). */
export const MIN_OCTAVE = -1;
export const MAX_OCTAVE = 9;

/** MIDI note number of A4, the tuning reference. */
const MIDI_A4 = 69;
/** Default concert pitch in hertz (ISO 16 standard tuning). */
export const DEFAULT_A4_HZ = 440;

/**
 * Semitones spanned by each SIMPLE generic interval at its major (2,3,6,7)
 * or perfect (1,4,5) size. Derived from the major scale: C-D 2, C-E 4, C-F 5,
 * C-G 7, C-A 9, C-B 11.
 */
const MAJOR_PERFECT_REFERENCE = { 1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11 };

/** Generic numbers whose unaltered size is called "perfect" rather than "major". */
const PERFECT_NUMBERS = new Set([1, 4, 5]);

/** Quality names for perfect-class intervals, keyed by (actual - perfect) semitones. */
const PERFECT_QUALITY = {
  "-2": { name: "Doubly diminished", short: "dd" },
  "-1": { name: "Diminished", short: "d" },
  0: { name: "Perfect", short: "P" },
  1: { name: "Augmented", short: "A" },
  2: { name: "Doubly augmented", short: "AA" },
};

/** Quality names for major-class intervals, keyed by (actual - major) semitones. */
const MAJOR_QUALITY = {
  "-3": { name: "Doubly diminished", short: "dd" },
  "-2": { name: "Diminished", short: "d" },
  "-1": { name: "Minor", short: "m" },
  0: { name: "Major", short: "M" },
  1: { name: "Augmented", short: "A" },
  2: { name: "Doubly augmented", short: "AA" },
};

/** Ordinal words for interval numbers; 1, 8 and 15 have special names. */
const ORDINALS = [
  null,
  "unison",
  "second",
  "third",
  "fourth",
  "fifth",
  "sixth",
  "seventh",
  "octave",
  "ninth",
  "tenth",
  "eleventh",
  "twelfth",
  "thirteenth",
  "fourteenth",
  "fifteenth",
];

/**
 * Five-limit just-intonation ratios for each semitone class, the tunings a
 * singer or string player naturally drifts toward. The tritone has no single
 * agreed just ratio; 45:32 is the common 5-limit choice.
 */
const JUST_RATIOS = {
  0: [1, 1],
  1: [16, 15],
  2: [9, 8],
  3: [6, 5],
  4: [5, 4],
  5: [4, 3],
  6: [45, 32],
  7: [3, 2],
  8: [8, 5],
  9: [5, 3],
  10: [16, 9],
  11: [15, 8],
  12: [2, 1],
};

/** Consonance grouping used in common-practice harmony, by semitone class. */
const CONSONANCE = {
  0: "Perfect consonance",
  7: "Perfect consonance",
  12: "Perfect consonance",
  3: "Imperfect consonance",
  4: "Imperfect consonance",
  8: "Imperfect consonance",
  9: "Imperfect consonance",
  5: "Conditional — consonant above a bass, dissonant against it",
  1: "Dissonance",
  2: "Dissonance",
  6: "Dissonance",
  10: "Dissonance",
  11: "Dissonance",
};

/** Shorthand names for each semitone class, used for the enharmonic reference table. */
const SEMITONE_NAMES = {
  0: "Perfect unison (P1)",
  1: "Minor second (m2)",
  2: "Major second (M2)",
  3: "Minor third (m3)",
  4: "Major third (M3)",
  5: "Perfect fourth (P4)",
  6: "Tritone (A4 / d5)",
  7: "Perfect fifth (P5)",
  8: "Minor sixth (m6)",
  9: "Major sixth (M6)",
  10: "Minor seventh (m7)",
  11: "Major seventh (M7)",
  12: "Perfect octave (P8)",
};

/** Cents in one equal-tempered semitone (1200 cents to the octave). */
const CENTS_PER_SEMITONE = 100;

function ordinal(number) {
  return ORDINALS[number] || `${number}th`;
}

function accidentalSymbol(value) {
  const found = ACCIDENTALS.find((item) => item.value === value);
  return found ? found.symbol : "";
}

/** Human-readable name of a structured note, e.g. { letter:"E", accidental:-1, octave:4 } -> "Eb4". */
export function formatNote(note) {
  if (!note) return "";
  return `${note.letter}${accidentalSymbol(note.accidental)}${note.octave}`;
}

/** MIDI note number for a structured note. Middle C (C4) is 60. */
export function noteToMidi(note) {
  if (!note || typeof note.letter !== "string") return null;
  const letter = note.letter.toUpperCase();
  if (!(letter in LETTER_SEMITONES)) return null;
  const accidental = Number(note.accidental ?? 0);
  const octave = Number(note.octave);
  if (!Number.isFinite(accidental) || !Number.isInteger(octave)) return null;
  if (accidental < -2 || accidental > 2) return null;
  if (octave < MIN_OCTAVE || octave > MAX_OCTAVE) return null;
  return (octave + 1) * 12 + LETTER_SEMITONES[letter] + accidental;
}

/** Equal-tempered frequency of a MIDI note: f = a4 * 2^((midi - 69) / 12). */
export function midiToFrequency(midi, a4Hz = DEFAULT_A4_HZ) {
  if (!Number.isFinite(midi) || !Number.isFinite(a4Hz) || a4Hz <= 0) return null;
  return a4Hz * Math.pow(2, (midi - MIDI_A4) / 12);
}

/** Parse text like "C#4", "Bb-1", "eb3" into a structured note. Returns null if unparseable. */
export function parseNote(text) {
  if (typeof text !== "string") return null;
  const match = text.trim().match(/^([A-Ga-g])(bb|##|[b#x]?)(-?\d+)$/);
  if (!match) return null;
  const symbol = match[2] === "x" ? "##" : match[2];
  const accidental = { bb: -2, b: -1, "": 0, "#": 1, "##": 2 }[symbol];
  const octave = Number(match[3]);
  if (octave < MIN_OCTAVE || octave > MAX_OCTAVE) return null;
  return { letter: match[1].toUpperCase(), accidental, octave };
}

/**
 * Name the interval between two notes.
 * @param {{from: object, to: object, a4Hz?: number}} input
 * @returns {object} full description, or { error } when the input cannot be named.
 */
export function computeInterval({ from, to, a4Hz = DEFAULT_A4_HZ } = {}) {
  const lowerFrom = from && typeof from.letter === "string" ? from.letter.toUpperCase() : null;
  const lowerTo = to && typeof to.letter === "string" ? to.letter.toUpperCase() : null;

  if (!lowerFrom || !(lowerFrom in LETTER_SEMITONES)) {
    return { error: "Pick a valid first note letter from A to G." };
  }
  if (!lowerTo || !(lowerTo in LETTER_SEMITONES)) {
    return { error: "Pick a valid second note letter from A to G." };
  }

  const midiFrom = noteToMidi({ ...from, letter: lowerFrom });
  const midiTo = noteToMidi({ ...to, letter: lowerTo });

  if (midiFrom === null || midiTo === null) {
    return {
      error: `Octave numbers must be whole numbers from ${MIN_OCTAVE} to ${MAX_OCTAVE}, with at most a double accidental.`,
    };
  }
  if (!Number.isFinite(a4Hz) || a4Hz < 380 || a4Hz > 500) {
    return { error: "Concert pitch for A4 should be between 380 Hz and 500 Hz." };
  }

  const degreeFrom = LETTERS.indexOf(lowerFrom) + 7 * Number(from.octave);
  const degreeTo = LETTERS.indexOf(lowerTo) + 7 * Number(to.octave);

  const descending = midiTo < midiFrom || (midiTo === midiFrom && degreeTo < degreeFrom);
  const lowDegree = descending ? degreeTo : degreeFrom;
  const highDegree = descending ? degreeFrom : degreeTo;
  const lowMidi = descending ? midiTo : midiFrom;
  const highMidi = descending ? midiFrom : midiTo;

  const number = highDegree - lowDegree + 1;
  const semitones = highMidi - lowMidi;

  if (number < 1) {
    return {
      error:
        "Those two spellings cross over — the higher-sounding note is written on a lower staff line. Simplify the accidentals and try again.",
    };
  }

  const simpleNumber = ((number - 1) % 7) + 1;
  const octavesSpanned = Math.floor((number - 1) / 7);
  const reference = MAJOR_PERFECT_REFERENCE[simpleNumber] + 12 * octavesSpanned;
  const alteration = semitones - reference;

  const table = PERFECT_NUMBERS.has(simpleNumber) ? PERFECT_QUALITY : MAJOR_QUALITY;
  const quality = table[String(alteration)];
  if (!quality) {
    return {
      error:
        "That pair of spellings makes an interval with no standard name (more than two chromatic alterations). Respell one of the notes.",
    };
  }

  // Reduce to a class of 0-12 so an exact octave reads as 12, not 0.
  const modulo = semitones % 12;
  const semitoneClass = modulo === 0 && semitones > 0 ? 12 : modulo;
  const justPair = JUST_RATIOS[semitoneClass];
  const justCents = 1200 * Math.log2(justPair[0] / justPair[1]);
  const temperedCents = semitoneClass * CENTS_PER_SEMITONE;

  const fullName = `${quality.name} ${ordinal(number)}`;
  const shortName = `${quality.short}${number}`;

  // Inversion only exists for simple intervals; reduce compound ones first.
  const reduceNumber = simpleNumber === 1 && number > 1 ? 8 : simpleNumber;
  const invertedNumber = 9 - reduceNumber;
  const invertedQuality = {
    P: "Perfect",
    M: "Minor",
    m: "Major",
    A: "Diminished",
    d: "Augmented",
    AA: "Doubly diminished",
    dd: "Doubly augmented",
  }[quality.short];

  return {
    fromNote: formatNote({ ...from, letter: lowerFrom }),
    toNote: formatNote({ ...to, letter: lowerTo }),
    midiFrom,
    midiTo,
    frequencyFrom: midiToFrequency(midiFrom, a4Hz),
    frequencyTo: midiToFrequency(midiTo, a4Hz),
    direction: descending ? "descending" : "ascending",
    isUnison: semitones === 0 && number === 1,
    number,
    simpleNumber: reduceNumber,
    semitones,
    semitoneClass,
    quality: quality.name,
    qualityShort: quality.short,
    alteration,
    fullName,
    shortName,
    cents: semitones * CENTS_PER_SEMITONE,
    ratio: Math.pow(2, semitones / 12),
    compound: number > 8,
    inversion: `${invertedQuality} ${ordinal(invertedNumber)}`,
    enharmonicName: SEMITONE_NAMES[semitoneClass],
    consonance: CONSONANCE[semitoneClass],
    just: {
      numerator: justPair[0],
      denominator: justPair[1],
      ratio: justPair[0] / justPair[1],
      cents: justCents,
      /** How sharp (+) or flat (-) equal temperament is against the pure ratio. */
      temperedDeviationCents: temperedCents - justCents,
    },
  };
}

/** Reference rows for 0-12 semitones: name, just ratio and tempering error. */
export const SIMPLE_INTERVAL_TABLE = Object.keys(SEMITONE_NAMES).map((key) => {
  const semitones = Number(key);
  const [numerator, denominator] = JUST_RATIOS[semitones];
  const justCents = 1200 * Math.log2(numerator / denominator);
  return {
    semitones,
    name: SEMITONE_NAMES[semitones],
    justRatio: `${numerator}:${denominator}`,
    justCents,
    temperedCents: semitones * CENTS_PER_SEMITONE,
    deviationCents: semitones * CENTS_PER_SEMITONE - justCents,
    consonance: CONSONANCE[semitones],
  };
});
