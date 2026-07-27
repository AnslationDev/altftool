/**
 * Target-runtime speed maths.
 *
 * The core relationship is one division:
 *     multiplier = (sourceDuration - trimmed) / targetDuration
 * A 3-minute cut that has to land at 60 seconds needs 180 / 60 = 3.00x. If some of the
 * gap can be closed by cutting instead, the trim comes off the numerator first.
 *
 * The inverse is just as useful when a speed ceiling is fixed by the material:
 *     trimNeeded = sourceDuration - targetDuration x maxMultiplier
 *
 * Supporting figures:
 *   pitch shift (uncorrected)  semitones = 12 x log2(multiplier), from equal temperament
 *   speaking rate after change newWpm    = words / (targetDuration / 60)
 *   frames after the change    frames    = targetDuration x fps
 */

/** Platform runtime ceilings that people are usually cutting to hit. */
export const RUNTIME_TARGETS = [
  { id: "reel-90", label: "Instagram Reel (90 s)", seconds: 90 },
  { id: "tiktok-180", label: "TikTok standard (180 s)", seconds: 180 },
  { id: "shorts-60", label: "YouTube Shorts (60 s)", seconds: 60 },
  { id: "x-140", label: "X video (140 s)", seconds: 140 },
  { id: "ad-30", label: "30-second ad slot", seconds: 30 },
  { id: "ad-15", label: "15-second bumper", seconds: 15 },
];

/**
 * Speed guidance for spoken material. These are practical editing thresholds, not
 * measurements: past 1.25x most narration starts to sound rushed, past 1.5x listeners
 * have to concentrate, and past 2x speech is very hard to follow on first listen.
 */
export const SPEECH_COMFORT_MAX = 1.25;
export const SPEECH_TOLERABLE_MAX = 1.5;
export const SPEECH_HARD_MAX = 2;

/** Typical presentation pace in words per minute; scripts are usually written to this. */
export const TYPICAL_SPEAKING_WPM = 140;

export const SEMITONES_PER_OCTAVE = 12;

const isPositive = (value) => Number.isFinite(value) && value > 0;

/**
 * Parse a duration written as seconds, m:ss or h:mm:ss.
 * @returns {number|null} seconds, or null when it cannot be read
 */
export function parseDuration(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  if (/^\d+(\.\d+)?$/.test(raw)) return Number(raw);

  const parts = raw.split(":");
  if (parts.length < 2 || parts.length > 3) return null;
  const numbers = parts.map((part) => Number(part.trim()));
  if (numbers.some((n) => !Number.isFinite(n) || n < 0)) return null;

  if (parts.length === 2) {
    const [minutes, seconds] = numbers;
    if (seconds >= 60 || !Number.isInteger(minutes)) return null;
    return minutes * 60 + seconds;
  }
  const [hours, minutes, seconds] = numbers;
  if (minutes >= 60 || seconds >= 60 || !Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  return hours * 3600 + minutes * 60 + seconds;
}

/** Seconds as m:ss, or h:mm:ss past an hour. */
export function formatDuration(seconds) {
  const total = Number(seconds);
  if (!Number.isFinite(total) || total < 0) return "—";
  const whole = Math.floor(total);
  const frac = total - whole;
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const secs = whole % 60;
  const secText = `${String(secs).padStart(2, "0")}${frac >= 0.005 ? frac.toFixed(2).slice(1) : ""}`;
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${secText}`;
  return `${minutes}:${secText}`;
}

/** Pitch shift in semitones when audio is sped up without pitch correction. */
export function pitchShiftSemitones(multiplier) {
  const factor = Number(multiplier);
  if (!isPositive(factor)) return null;
  return SEMITONES_PER_OCTAVE * Math.log2(factor);
}

/** Words per minute a script ends up at once it has to fit a given runtime. */
export function effectiveWpm(wordCount, targetSeconds) {
  const words = Number(wordCount);
  const seconds = Number(targetSeconds);
  if (!Number.isFinite(words) || words < 0 || !isPositive(seconds)) return null;
  return (words / seconds) * 60;
}

/** How much has to be cut so the target is reachable at a given speed ceiling. */
export function trimRequired({ sourceSeconds, targetSeconds, maxMultiplier }) {
  const source = Number(sourceSeconds);
  const target = Number(targetSeconds);
  const max = Number(maxMultiplier);
  if (!isPositive(source) || !isPositive(target) || !isPositive(max)) return null;
  return Math.max(0, source - target * max);
}

/** Plain-language verdict for a multiplier applied to spoken material. */
export function speedVerdict(multiplier) {
  const factor = Number(multiplier);
  if (!isPositive(factor)) return { level: "unknown", label: "Not calculated" };
  if (factor < 1) return { level: "slow", label: "Slower than recorded — dialogue will drag" };
  if (factor <= 1.05) return { level: "clean", label: "Effectively unchanged" };
  if (factor <= SPEECH_COMFORT_MAX) return { level: "comfortable", label: `Under ${SPEECH_COMFORT_MAX}× — most viewers will not notice` };
  if (factor <= SPEECH_TOLERABLE_MAX) return { level: "brisk", label: `Between ${SPEECH_COMFORT_MAX}× and ${SPEECH_TOLERABLE_MAX}× — audibly quick but followable` };
  if (factor <= SPEECH_HARD_MAX) return { level: "hard", label: `Above ${SPEECH_TOLERABLE_MAX}× — hard work for spoken content` };
  return { level: "extreme", label: `Above ${SPEECH_HARD_MAX}× — treat as a montage, not narration` };
}

/**
 * Work out the speed needed to hit a target runtime.
 *
 * @param {object} input
 * @param {number} input.sourceSeconds current length
 * @param {number} input.targetSeconds required length
 * @param {number} [input.trimSeconds] material you are willing to cut first
 * @param {number} [input.fps] timeline frame rate, for the frame count
 * @param {number} [input.wordCount] script length, for the resulting speaking rate
 * @returns {object} result, or { error }
 */
export function targetSpeed({ sourceSeconds, targetSeconds, trimSeconds = 0, fps, wordCount }) {
  const source = Number(sourceSeconds);
  const target = Number(targetSeconds);
  const trim = Number(trimSeconds) || 0;

  if (!isPositive(source)) return { error: "Enter the current length of the video." };
  if (!isPositive(target)) return { error: "The target runtime must be greater than zero." };
  if (trim < 0) return { error: "Trim cannot be negative — enter the seconds you are cutting." };
  if (trim >= source) return { error: "You are cutting the whole video. Reduce the trim so something is left to speed up." };

  const remaining = source - trim;
  const multiplier = remaining / target;
  const percent = multiplier * 100;
  const timeChange = target - source;

  const verdict = speedVerdict(multiplier);
  const semitones = pitchShiftSemitones(multiplier);
  const frames = isPositive(Number(fps)) ? Math.round(target * Number(fps)) : null;
  const wpm = effectiveWpm(wordCount, target);

  const notes = [];
  if (multiplier > SPEECH_TOLERABLE_MAX) {
    const cut = trimRequired({ sourceSeconds: source, targetSeconds: target, maxMultiplier: SPEECH_TOLERABLE_MAX });
    notes.push(
      `To stay at or under ${SPEECH_TOLERABLE_MAX}× you would need to cut ${formatDuration(cut)} rather than speed the whole thing up.`,
    );
  }
  if (multiplier < 1) {
    notes.push("The target is longer than the source, so this is a slow-down. Frames will be duplicated or interpolated unless the footage was shot at a higher rate.");
  }
  if (semitones !== null && Math.abs(semitones) >= 0.5) {
    notes.push(
      `Uncorrected, the audio would shift ${semitones > 0 ? "up" : "down"} ${Math.abs(semitones).toFixed(2)} semitones. Use a pitch-preserving time stretch to avoid it.`,
    );
  }
  if (wpm !== null && wpm > TYPICAL_SPEAKING_WPM * 1.5) {
    notes.push(
      `The script would be delivered at about ${Math.round(wpm)} words per minute, well above the ${TYPICAL_SPEAKING_WPM} wpm most scripts are written for. Cut words instead of raising the speed.`,
    );
  }

  return {
    sourceSeconds: source,
    targetSeconds: target,
    trimSeconds: trim,
    remainingSeconds: remaining,
    multiplier,
    percent,
    timeChange,
    timeSaved: Math.max(0, -timeChange),
    verdict,
    pitchSemitones: semitones,
    outputFrames: frames,
    effectiveWpm: wpm,
    trimToStayComfortable: trimRequired({ sourceSeconds: source, targetSeconds: target, maxMultiplier: SPEECH_COMFORT_MAX }),
    trimToStayTolerable: trimRequired({ sourceSeconds: source, targetSeconds: target, maxMultiplier: SPEECH_TOLERABLE_MAX }),
    notes,
  };
}
