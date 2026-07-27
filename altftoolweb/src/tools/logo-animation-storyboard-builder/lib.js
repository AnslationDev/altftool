/**
 * Logo sting storyboard timing.
 *
 * Turns a total duration plus weighted beats into frame-accurate in and out
 * points, timecodes and CSS easing curves.
 *
 * Pure functions only: no DOM, no React, no Date.now().
 */

/** Frame rates a sting is normally delivered at. */
export const FRAME_RATES = Object.freeze([24, 25, 30, 50, 60]);

/**
 * Material Design motion guidance, used here as the sanity band for a single
 * beat. Under 100ms a change reads as an instant jump rather than a move;
 * simple transitions land around 200ms, medium around 300ms, and anything past
 * 500ms starts to feel slow for a single element.
 */
export const MIN_PERCEPTIBLE_MS = 100;
export const SHORT_BEAT_MS = 200;
export const MEDIUM_BEAT_MS = 300;
export const LONG_BEAT_MS = 500;

/**
 * WCAG 2.1 SC 2.2.2 Pause, Stop, Hide: moving content that starts
 * automatically, runs for more than 5 seconds and is shown alongside other
 * content must offer a way to pause or hide it.
 */
export const PAUSABLE_THRESHOLD_MS = 5000;

/**
 * Standard easing curves as CSS cubic-bezier control points. The first four
 * are the Material Design motion curves.
 */
export const EASINGS = Object.freeze([
  { id: "standard", name: "Standard", bezier: [0.4, 0, 0.2, 1], use: "Elements moving within the frame." },
  { id: "decelerate", name: "Decelerate", bezier: [0, 0, 0.2, 1], use: "Something entering the frame." },
  { id: "accelerate", name: "Accelerate", bezier: [0.4, 0, 1, 1], use: "Something leaving the frame." },
  { id: "sharp", name: "Sharp", bezier: [0.4, 0, 0.6, 1], use: "A change that must snap back." },
  { id: "linear", name: "Linear", bezier: [0, 0, 1, 1], use: "Continuous motion such as a rotation or a wipe." },
]);

/** A conventional four-beat logo reveal, used as the starting storyboard. */
export const DEFAULT_BEATS = Object.freeze([
  { name: "Build", weight: 1, easing: "decelerate", note: "Shapes travel in from off-frame." },
  { name: "Form", weight: 2, easing: "standard", note: "Elements lock into the mark." },
  { name: "Wordmark", weight: 2, easing: "decelerate", note: "Type fades or wipes on." },
  { name: "Settle", weight: 1, easing: "sharp", note: "Overshoot resolves, everything holds." },
]);

/** Frames a duration occupies at a given frame rate, rounded to the nearest frame. */
export function msToFrames(ms, fps) {
  if (!(fps > 0)) return 0;
  return Math.round((ms / 1000) * fps);
}

/** Milliseconds a whole number of frames occupies. */
export function framesToMs(frames, fps) {
  if (!(fps > 0)) return 0;
  return (frames / fps) * 1000;
}

const pad = (value, size = 2) => String(Math.max(0, Math.floor(value))).padStart(size, "0");

/** Non-drop-frame SMPTE timecode HH:MM:SS:FF for a frame index. */
export function framesToTimecode(frameIndex, fps) {
  if (!(fps > 0) || !Number.isFinite(frameIndex) || frameIndex < 0) return "00:00:00:00";
  const rounded = Math.floor(frameIndex);
  const framesPerSecond = Math.round(fps);
  const totalSeconds = Math.floor(rounded / framesPerSecond);
  const frames = rounded % framesPerSecond;
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`;
}

/**
 * Split a whole number of frames across weighted beats so the parts add up to
 * the total exactly. Rounding is applied to the running cumulative total, so
 * error never accumulates and no beat is silently dropped or doubled.
 *
 * @param {number[]} weights
 * @param {number} totalFrames
 * @returns {number[]|{error:string}}
 */
export function distributeFrames(weights, totalFrames) {
  if (!Array.isArray(weights) || weights.length === 0) {
    return { error: "Add at least one beat before splitting the timeline." };
  }
  const values = weights.map(Number);
  if (values.some((value) => !Number.isFinite(value) || value < 0)) {
    return { error: "Every beat weight must be zero or a positive number." };
  }
  const totalWeight = values.reduce((sum, value) => sum + value, 0);
  if (totalWeight <= 0) {
    return { error: "At least one beat needs a weight above zero." };
  }
  const total = Math.round(Number(totalFrames));
  if (!Number.isFinite(total) || total < 0) {
    return { error: "Total frame count must be zero or more." };
  }

  const out = [];
  let cumulativeWeight = 0;
  let previousFrame = 0;
  for (const value of values) {
    cumulativeWeight += value;
    const boundary = Math.round((total * cumulativeWeight) / totalWeight);
    out.push(boundary - previousFrame);
    previousFrame = boundary;
  }
  return out;
}

/** Look up an easing definition, falling back to the standard curve. */
export function easingById(id) {
  return EASINGS.find((entry) => entry.id === id) || EASINGS[0];
}

/** Format an easing as a CSS timing-function value. */
export function easingToCss(id) {
  const easing = easingById(id);
  if (easing.id === "linear") return "linear";
  return `cubic-bezier(${easing.bezier.join(", ")})`;
}

/**
 * Build the storyboard.
 *
 * @param {object} input
 * @param {Array<{name:string,weight:number,easing:string,note?:string}>} input.beats
 * @param {number} input.totalMs - total sting length in milliseconds.
 * @param {number} input.fps
 * @returns {object} storyboard, or { error }.
 */
export function buildStoryboard({ beats = DEFAULT_BEATS, totalMs = 3000, fps = 30 } = {}) {
  const rate = Number(fps);
  if (!Number.isFinite(rate) || rate <= 0 || rate > 240) {
    return { error: "Frame rate must be between 1 and 240 frames per second." };
  }
  const duration = Number(totalMs);
  if (!Number.isFinite(duration) || duration <= 0) {
    return { error: "Total duration must be greater than zero milliseconds." };
  }
  if (duration > 600000) {
    return { error: "Total duration is capped at 10 minutes - a logo sting is seconds, not minutes." };
  }
  const list = Array.isArray(beats) ? beats.filter((beat) => beat && typeof beat === "object") : [];
  if (list.length === 0) {
    return { error: "Add at least one beat to the storyboard." };
  }
  if (list.length > 24) {
    return { error: "Keep the storyboard to 24 beats or fewer." };
  }

  const totalFrames = msToFrames(duration, rate);
  if (totalFrames < list.length) {
    return {
      error: `${list.length} beats need at least ${list.length} frames, but ${duration}ms at ${rate}fps is only ${totalFrames}. Lengthen the sting or remove a beat.`,
    };
  }

  const distributed = distributeFrames(list.map((beat) => beat.weight), totalFrames);
  if (distributed.error) return { error: distributed.error };

  let cursor = 0;
  const rows = list.map((beat, index) => {
    const frames = distributed[index];
    const startFrame = cursor;
    cursor += frames;
    const endFrame = cursor;
    const easing = easingById(beat.easing);
    const beatMs = framesToMs(frames, rate);
    return {
      index,
      name: String(beat.name || `Beat ${index + 1}`),
      note: String(beat.note || ""),
      weight: Number(beat.weight) || 0,
      frames,
      startFrame,
      endFrame,
      startMs: framesToMs(startFrame, rate),
      endMs: framesToMs(endFrame, rate),
      durationMs: beatMs,
      startTimecode: framesToTimecode(startFrame, rate),
      endTimecode: framesToTimecode(endFrame, rate),
      easingId: easing.id,
      easingName: easing.name,
      easingCss: easingToCss(easing.id),
      easingUse: easing.use,
      share: totalFrames > 0 ? (frames / totalFrames) * 100 : 0,
    };
  });

  const issues = [];
  const emptyBeats = rows.filter((row) => row.frames === 0);
  if (emptyBeats.length > 0) {
    issues.push({
      level: "error",
      message: `${emptyBeats.map((row) => row.name).join(", ")} rounds to zero frames. Raise the weight or lengthen the sting.`,
    });
  }
  const tooFast = rows.filter((row) => row.frames > 0 && row.durationMs < MIN_PERCEPTIBLE_MS);
  if (tooFast.length > 0) {
    issues.push({
      level: "warning",
      message: `${tooFast.map((row) => `${row.name} (${Math.round(row.durationMs)}ms)`).join(", ")} lands under ${MIN_PERCEPTIBLE_MS}ms, which reads as a cut rather than a move.`,
    });
  }
  const tooSlow = rows.filter((row) => row.durationMs > LONG_BEAT_MS * 3);
  if (tooSlow.length > 0) {
    issues.push({
      level: "info",
      message: `${tooSlow.map((row) => row.name).join(", ")} runs well past ${LONG_BEAT_MS}ms. That is fine for a hold, but a single moving element at that length will feel sluggish.`,
    });
  }
  if (duration > PAUSABLE_THRESHOLD_MS) {
    issues.push({
      level: "warning",
      message: `The sting runs longer than ${PAUSABLE_THRESHOLD_MS / 1000} seconds. WCAG 2.1 SC 2.2.2 asks for a pause, stop or hide control on auto-playing motion past that point.`,
    });
  }
  if (rows.every((row) => row.easingId === "linear")) {
    issues.push({
      level: "warning",
      message: "Every beat is linear. Without an accelerate or decelerate curve the motion reads as mechanical.",
    });
  }
  if (rows.length === 1) {
    issues.push({
      level: "info",
      message: "A single beat is a fade, not a storyboard. Split it into at least a build and a settle to give the reveal a shape.",
    });
  }

  const status = issues.some((issue) => issue.level === "error")
    ? "error"
    : issues.some((issue) => issue.level === "warning")
      ? "warning"
      : "ok";

  return {
    rows,
    totalFrames,
    totalMs: framesToMs(totalFrames, rate),
    requestedMs: duration,
    fps: rate,
    endTimecode: framesToTimecode(totalFrames, rate),
    issues,
    status,
  };
}

/** A plain-text shot list, one line per beat, ready to paste into a brief. */
export function storyboardToText(storyboard) {
  if (!storyboard || storyboard.error || !Array.isArray(storyboard.rows)) return "";
  const header = `Logo sting - ${Math.round(storyboard.totalMs)}ms, ${storyboard.totalFrames} frames at ${storyboard.fps}fps`;
  const lines = storyboard.rows.map(
    (row) =>
      `${row.startTimecode} -> ${row.endTimecode}  ${row.name} (${row.frames}f, ${Math.round(row.durationMs)}ms, ${row.easingName}: ${row.easingCss})${row.note ? ` - ${row.note}` : ""}`,
  );
  return [header, ...lines].join("\n");
}
