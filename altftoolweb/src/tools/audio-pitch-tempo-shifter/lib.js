/**
 * Audio Pitch & Tempo Shifter — the maths behind changing pitch and speed
 * independently, plus the exact filter chains that perform it.
 *
 * Rules used:
 *  - Twelve-tone equal temperament: one semitone is a frequency ratio of
 *    2^(1/12) ≈ 1.059463, and 100 cents make a semitone, so any shift is
 *    ratio = 2^((semitones + cents/100) / 12).
 *  - Resampling changes pitch and speed together: playing a file at rate r
 *    multiplies both. To move only pitch you resample by r and then time-stretch
 *    by 1/r — which is what `asetrate=SR*r, aresample=SR, atempo=1/r` does.
 *  - ffmpeg's atempo filter accepts a factor from 0.5 to 2.0 only, so larger
 *    changes must be split into a chain of atempo filters whose product is the
 *    requested factor.
 *  - Duration scales as original ÷ tempo factor; tempo in BPM scales with it.
 *  - Reference pitch A4 = 440 Hz (ISO 16).
 */

/** Frequency ratio of one semitone in twelve-tone equal temperament. */
export const SEMITONE_RATIO = 2 ** (1 / 12);

/** Cents per semitone. */
export const CENTS_PER_SEMITONE = 100;

/** Concert pitch reference, ISO 16. */
export const A4_HZ = 440;

/** ffmpeg's atempo filter is only valid in this range. */
export const ATEMPO_MIN = 0.5;
export const ATEMPO_MAX = 2;

/** Shifts beyond this move vowel formants enough to sound unnatural. */
export const FORMANT_WARNING_SEMITONES = 4;

/** Accepted tempo range, as a percentage of the original speed. */
export const TEMPO_PERCENT_RANGE = { min: 10, max: 400 };

/** Accepted pitch range in semitones. */
export const SEMITONE_RANGE = { min: -24, max: 24 };

export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

/** Frequency ratio for a pitch shift given in semitones plus cents. */
export function shiftRatio(semitones = 0, cents = 0) {
  const total = Number(semitones) + Number(cents) / CENTS_PER_SEMITONE;
  if (!Number.isFinite(total)) return { error: "Pitch shift must be a number of semitones." };
  return { ratio: 2 ** (total / 12), semitonesTotal: total };
}

/** Convert a playback-rate ratio back to semitones. */
export function ratioToSemitones(ratio) {
  const r = Number(ratio);
  if (!Number.isFinite(r) || r <= 0) return { error: "Ratio must be greater than zero." };
  return { semitones: 12 * Math.log2(r) };
}

/**
 * Split a tempo factor into a chain of atempo values, each inside ffmpeg's
 * legal 0.5-2.0 window, whose product is the requested factor.
 */
export function atempoChain(factor) {
  const f = Number(factor);
  if (!Number.isFinite(f) || f <= 0) return { error: "Tempo factor must be greater than zero." };
  if (f >= ATEMPO_MIN && f <= ATEMPO_MAX) return { chain: [f] };
  const steps = f > ATEMPO_MAX
    ? Math.ceil(Math.log(f) / Math.log(ATEMPO_MAX))
    : Math.ceil(Math.log(f) / Math.log(ATEMPO_MIN));
  const each = f ** (1 / steps);
  return { chain: Array.from({ length: steps }, () => each) };
}

/** Transpose a note name by a number of semitones. */
export function transposeNote(note, semitones) {
  const index = NOTE_NAMES.indexOf(String(note || "").toUpperCase());
  if (index < 0) return { error: `"${note}" is not one of ${NOTE_NAMES.join(", ")}.` };
  const steps = Math.round(Number(semitones) || 0);
  const next = ((index + steps) % 12 + 12) % 12;
  return { note: NOTE_NAMES[next], octaveShift: Math.floor((index + steps) / 12) };
}

function formatSeconds(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  const minutes = Math.floor(whole / 60);
  const rest = whole % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

/**
 * Full plan for an independent pitch and tempo change.
 * Returns { error } for out-of-range or non-numeric input.
 */
export function planShift({
  semitones = 0,
  cents = 0,
  tempoPercent = 100,
  sampleRate = 44100,
  durationSeconds = 180,
  bpm = 120,
  sourceKey = "C",
} = {}) {
  const st = Number(semitones);
  if (!Number.isFinite(st) || st < SEMITONE_RANGE.min || st > SEMITONE_RANGE.max) {
    return { error: `Pitch shift must be between ${SEMITONE_RANGE.min} and ${SEMITONE_RANGE.max} semitones.` };
  }
  const tempo = Number(tempoPercent);
  if (!Number.isFinite(tempo) || tempo < TEMPO_PERCENT_RANGE.min || tempo > TEMPO_PERCENT_RANGE.max) {
    return { error: `Tempo must be between ${TEMPO_PERCENT_RANGE.min}% and ${TEMPO_PERCENT_RANGE.max}% of the original.` };
  }
  const rate = Number(sampleRate);
  if (!Number.isFinite(rate) || rate <= 0) {
    return { error: "Sample rate must be a positive number of hertz." };
  }
  const duration = Number(durationSeconds);
  if (!Number.isFinite(duration) || duration <= 0) {
    return { error: "Clip length must be longer than zero seconds." };
  }

  const pitch = shiftRatio(st, cents);
  if (pitch.error) return pitch;

  const tempoFactor = tempo / 100;
  const newDuration = duration / tempoFactor;

  // Resample by the pitch ratio, restore the sample rate, then correct the
  // speed so only pitch moved — combined with the requested tempo change.
  const correction = tempoFactor / pitch.ratio;
  const chain = atempoChain(correction);
  if (chain.error) return chain;

  const resampleRate = Math.round(rate * pitch.ratio);
  const atempoPart = chain.chain.map((value) => `atempo=${value.toFixed(6)}`).join(",");
  const ffmpegResample = `ffmpeg -i input.wav -af "asetrate=${resampleRate},aresample=${Math.round(rate)},${atempoPart}" output.wav`;
  const ffmpegRubberband = `ffmpeg -i input.wav -af "rubberband=pitch=${pitch.ratio.toFixed(6)}:tempo=${tempoFactor.toFixed(6)}" output.wav`;

  const transposed = transposeNote(sourceKey, Math.round(pitch.semitonesTotal));
  const newBpm = Number(bpm) > 0 ? Number(bpm) * tempoFactor : null;

  const notes = [];
  if (Math.abs(pitch.semitonesTotal) > FORMANT_WARNING_SEMITONES) {
    notes.push(
      `A shift of ${pitch.semitonesTotal.toFixed(2)} semitones moves vowel formants with the pitch, so voices start to sound unnatural. The rubberband chain has a formant-preserving option.`,
    );
  }
  if (chain.chain.length > 1) {
    notes.push(`atempo only accepts 0.5-2.0, so the ${correction.toFixed(4)}× speed correction is split into ${chain.chain.length} filters.`);
  }
  if (Math.abs(tempoFactor - 1) < 1e-9 && Math.abs(pitch.semitonesTotal) < 1e-9) {
    notes.push("Nothing changes at 0 semitones and 100% tempo — the output is a copy of the input.");
  }

  return {
    semitones: st,
    cents: Number(cents) || 0,
    semitonesTotal: pitch.semitonesTotal,
    pitchRatio: pitch.ratio,
    pitchPercent: (pitch.ratio - 1) * 100,
    tempoFactor,
    tempoPercent: tempo,
    originalSeconds: duration,
    newSeconds: newDuration,
    originalLabel: formatSeconds(duration),
    newLabel: formatSeconds(newDuration),
    sampleRate: Math.round(rate),
    resampleRate,
    speedCorrection: correction,
    atempoValues: chain.chain,
    a4After: A4_HZ * pitch.ratio,
    newBpm,
    transposedKey: transposed.error ? null : transposed.note,
    linkedPlaybackRate: pitch.ratio, // one <audio> playbackRate moves both
    linkedSemitones: 12 * Math.log2(tempoFactor),
    ffmpegResample,
    ffmpegRubberband,
    notes,
  };
}
