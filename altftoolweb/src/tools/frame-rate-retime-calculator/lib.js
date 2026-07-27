/**
 * Frame rate conform and retime maths.
 *
 * Two different operations get muddled in editing software, so both are here:
 *
 * CONFORM (interpret footage). Every recorded frame becomes one timeline frame. The
 * frame count is preserved exactly, so:
 *     speed        = timelineFps / sourceFps
 *     newDuration  = frameCount / timelineFps
 *     duration x   = sourceFps / timelineFps
 * 60 fps conformed to a 24 fps timeline plays at 24/60 = 40% speed and lasts 2.5x
 * as long. Because no frames are created or discarded, the result is clean — this is
 * why slow motion is shot at a high frame rate rather than slowed down afterwards.
 *
 * RETIME (time remap to a target speed). The duration is set first and the software
 * then has to produce whatever frames the timeline needs:
 *     newDuration   = sourceDuration / (targetSpeed / 100)
 *     outputFrames  = newDuration x timelineFps
 * When outputFrames exceeds the frames actually recorded, the missing ones must be
 * duplicated, blended or optically-flow interpolated.
 *
 * Audio pitch: playing a recording at a speed factor f shifts its pitch by
 *     semitones = 12 x log2(f)
 * from the equal-tempered definition of a semitone as a frequency ratio of 2^(1/12).
 */

/** NTSC rates are the integer rate multiplied by 1000/1001 — the 0.1% pulldown. */
export const NTSC_FACTOR = 1000 / 1001;

/** Equal temperament: an octave is 12 semitones, a semitone a ratio of 2^(1/12). */
export const SEMITONES_PER_OCTAVE = 12;

/** Frame rates that actually appear on cameras and timelines. */
export const COMMON_FRAME_RATES = [
  { fps: 23.976, label: "23.976 (24 NTSC)" },
  { fps: 24, label: "24 (cinema)" },
  { fps: 25, label: "25 (PAL)" },
  { fps: 29.97, label: "29.97 (30 NTSC)" },
  { fps: 30, label: "30" },
  { fps: 48, label: "48" },
  { fps: 50, label: "50 (PAL high frame rate)" },
  { fps: 59.94, label: "59.94 (60 NTSC)" },
  { fps: 60, label: "60" },
  { fps: 100, label: "100" },
  { fps: 120, label: "120" },
  { fps: 240, label: "240" },
];

/** Beyond this, motion looks like a slideshow unless frames are interpolated. */
export const MIN_COMFORTABLE_OUTPUT_FPS = 24;

/** A pitch shift smaller than this is inaudible to most listeners. */
export const NEGLIGIBLE_SEMITONES = 0.05;

const isPositive = (value) => Number.isFinite(value) && value > 0;

/** True when a rate is one of the NTSC 1000/1001 rates, within rounding tolerance. */
export function isNtscRate(fps) {
  const value = Number(fps);
  if (!isPositive(value)) return false;
  return [24, 30, 60, 120].some((base) => Math.abs(value - base * NTSC_FACTOR) < 0.005);
}

/** Pitch shift in semitones for a playback speed factor (1 = unchanged). */
export function pitchShiftSemitones(speedFactor) {
  const factor = Number(speedFactor);
  if (!isPositive(factor)) return null;
  return SEMITONES_PER_OCTAVE * Math.log2(factor);
}

/**
 * Non-drop-frame timecode HH:MM:SS:FF.
 * For fractional rates such as 23.976 the frame field uses the rounded nominal rate,
 * which is what non-drop timecode does; the clock time will drift from wall clock.
 */
export function formatTimecode(seconds, fps) {
  const total = Number(seconds);
  const rate = Number(fps);
  if (!Number.isFinite(total) || total < 0 || !isPositive(rate)) return "—";
  const nominal = Math.max(1, Math.round(rate));
  let frames = Math.round(total * nominal);
  const hh = Math.floor(frames / (nominal * 3600));
  frames -= hh * nominal * 3600;
  const mm = Math.floor(frames / (nominal * 60));
  frames -= mm * nominal * 60;
  const ss = Math.floor(frames / nominal);
  const ff = frames - ss * nominal;
  const pad = (value, size = 2) => String(value).padStart(size, "0");
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}:${pad(ff)}`;
}

/**
 * Conform footage: reinterpret every recorded frame as one timeline frame.
 *
 * @param {object} input
 * @param {number} input.sourceFps rate the clip was recorded at
 * @param {number} input.timelineFps rate of the sequence it is being placed in
 * @param {number} input.sourceDurationSeconds recorded length in seconds
 * @returns {object} result, or { error }
 */
export function conformFootage({ sourceFps, timelineFps, sourceDurationSeconds }) {
  const source = Number(sourceFps);
  const timeline = Number(timelineFps);
  const duration = Number(sourceDurationSeconds);

  if (!isPositive(source)) return { error: "Source frame rate must be greater than zero." };
  if (!isPositive(timeline)) return { error: "Timeline frame rate must be greater than zero." };
  if (!Number.isFinite(duration) || duration < 0) return { error: "Clip length cannot be negative." };
  if (source > 10000 || timeline > 10000) return { error: "Frame rates above 10,000 fps are outside anything an edit timeline handles." };

  const frameCount = Math.round(duration * source);
  const speedFactor = timeline / source;
  const newDuration = frameCount / timeline;
  const semitones = pitchShiftSemitones(speedFactor);

  const notes = [];
  if (Math.abs(speedFactor - 1) < 1e-9) {
    notes.push("Source and timeline rates match, so nothing is retimed.");
  } else if (speedFactor < 1) {
    notes.push(`Playback slows to ${(speedFactor * 100).toFixed(2)}% — this is real slow motion with no invented frames.`);
  } else {
    notes.push(`Playback speeds up to ${(speedFactor * 100).toFixed(2)}%, so the clip finishes sooner and every recorded frame is still shown.`);
  }
  if (isNtscRate(source) !== isNtscRate(timeline)) {
    notes.push("One of these rates is an NTSC 1000/1001 rate. Mixing integer and NTSC rates gives a 0.1% speed change and audio that drifts about 3.6 seconds every hour.");
  }
  if (semitones !== null && Math.abs(semitones) >= NEGLIGIBLE_SEMITONES) {
    notes.push("If the audio is conformed with the picture it will shift in pitch — usually you keep the original audio at its native rate instead.");
  }

  return {
    mode: "conform",
    sourceFps: source,
    timelineFps: timeline,
    frameCount,
    sourceDuration: duration,
    newDuration,
    speedFactor,
    speedPercent: speedFactor * 100,
    durationMultiplier: source / timeline,
    pitchSemitones: semitones,
    framesCreated: 0,
    sourceTimecode: formatTimecode(duration, source),
    newTimecode: formatTimecode(newDuration, timeline),
    notes,
  };
}

/**
 * Retime to a target speed percentage on a fixed timeline rate.
 *
 * @param {object} input
 * @param {number} input.sourceFps
 * @param {number} input.timelineFps
 * @param {number} input.sourceDurationSeconds
 * @param {number} input.targetSpeedPercent 100 = unchanged, 50 = half speed
 * @returns {object} result, or { error }
 */
export function retimeToSpeed({ sourceFps, timelineFps, sourceDurationSeconds, targetSpeedPercent }) {
  const source = Number(sourceFps);
  const timeline = Number(timelineFps);
  const duration = Number(sourceDurationSeconds);
  const speedPercent = Number(targetSpeedPercent);

  if (!isPositive(source)) return { error: "Source frame rate must be greater than zero." };
  if (!isPositive(timeline)) return { error: "Timeline frame rate must be greater than zero." };
  if (!Number.isFinite(duration) || duration <= 0) return { error: "Enter a clip length greater than zero." };
  if (!isPositive(speedPercent)) return { error: "Target speed must be greater than 0%. A speed of zero would never end." };
  if (speedPercent > 10000) return { error: "Speeds above 10,000% leave almost nothing on screen — check the figure." };

  const factor = speedPercent / 100;
  const newDuration = duration / factor;
  const sourceFrames = Math.round(duration * source);
  const outputFrames = Math.round(newDuration * timeline);
  const uniqueFramesAvailable = Math.min(sourceFrames, outputFrames);
  const framesCreated = Math.max(0, outputFrames - sourceFrames);
  const effectiveUniqueFps = newDuration > 0 ? sourceFrames / newDuration : 0;

  const notes = [];
  if (framesCreated > 0) {
    notes.push(
      `The timeline needs ${outputFrames} frames but only ${sourceFrames} were recorded, so ${framesCreated} have to be duplicated, blended or interpolated.`,
    );
  } else if (outputFrames < sourceFrames) {
    notes.push(`${sourceFrames - outputFrames} recorded frames are discarded — the result is clean.`);
  } else {
    notes.push("Frame counts match, so no frames are created or discarded.");
  }
  if (effectiveUniqueFps > 0 && effectiveUniqueFps < MIN_COMFORTABLE_OUTPUT_FPS) {
    notes.push(
      `Only ${effectiveUniqueFps.toFixed(1)} unique frames per second reach the screen, below the ${MIN_COMFORTABLE_OUTPUT_FPS} fps at which motion stops looking stepped. Shoot at a higher rate or enable optical-flow interpolation.`,
    );
  }

  return {
    mode: "retime",
    sourceFps: source,
    timelineFps: timeline,
    speedPercent,
    speedFactor: factor,
    sourceDuration: duration,
    newDuration,
    sourceFrames,
    outputFrames,
    framesCreated,
    uniqueFramesAvailable,
    effectiveUniqueFps,
    interpolationRatio: sourceFrames > 0 ? outputFrames / sourceFrames : null,
    pitchSemitones: pitchShiftSemitones(factor),
    sourceTimecode: formatTimecode(duration, source),
    newTimecode: formatTimecode(newDuration, timeline),
    notes,
  };
}

/**
 * The frame rate you must shoot at to hit a target slow-motion speed cleanly on a
 * given timeline: sourceFps = timelineFps / (speed / 100).
 */
export function requiredCaptureFps({ timelineFps, targetSpeedPercent }) {
  const timeline = Number(timelineFps);
  const speedPercent = Number(targetSpeedPercent);
  if (!isPositive(timeline) || !isPositive(speedPercent)) return null;
  return timeline / (speedPercent / 100);
}

/** Seconds formatted as a readable duration, e.g. "1 min 05.2 s". */
export function formatDuration(seconds) {
  const total = Number(seconds);
  if (!Number.isFinite(total) || total < 0) return "—";
  if (total < 60) return `${total.toFixed(2)} s`;
  const minutes = Math.floor(total / 60);
  const rest = total - minutes * 60;
  if (minutes < 60) return `${minutes} min ${rest.toFixed(2).padStart(5, "0")} s`;
  const hours = Math.floor(minutes / 60);
  return `${hours} h ${minutes - hours * 60} min ${rest.toFixed(1)} s`;
}
