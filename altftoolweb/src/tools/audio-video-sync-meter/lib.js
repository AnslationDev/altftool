/**
 * Audio-Video Sync Meter — turns a clap or flash slate into a signed offset
 * in milliseconds and grades it against the published sync standards.
 *
 * Sign convention used throughout:
 *   positive offset = audio is LATE  (sound arrives after the picture)
 *   negative offset = audio is EARLY (sound arrives before the picture)
 *
 * Rules:
 *  - A frame numbered N (1-based) is displayed from (N-1)/fps seconds, so the
 *    flash frame's timestamp is (N-1)/fps and the offset is
 *      offset = audioSpikeSeconds - (N-1)/fps
 *  - ITU-R BT.1359-1 gives the perception thresholds: an error becomes
 *    detectable at 45 ms of audio lead or 125 ms of audio lag, and becomes
 *    unacceptable at 90 ms lead or 185 ms lag.
 *  - ATSC IS-191 (broadcast emission) allows at most 15 ms lead and 45 ms lag.
 *  - EBU R37 (programme production) allows at most 40 ms lead and 60 ms lag.
 *  - One frame is 1000/fps milliseconds, so an offset converts to frames by
 *    offsetMs x fps / 1000.
 */

/** Sync tolerance standards, in milliseconds. */
export const SYNC_STANDARDS = [
  {
    id: "atsc-is191",
    name: "ATSC IS-191",
    scope: "Broadcast emission",
    maxLeadMs: 15,
    maxLagMs: 45,
  },
  {
    id: "ebu-r37",
    name: "EBU R37",
    scope: "Programme production",
    maxLeadMs: 40,
    maxLagMs: 60,
  },
  {
    id: "itu-bt1359-detect",
    name: "ITU-R BT.1359-1 detectability",
    scope: "Point where viewers start to notice",
    maxLeadMs: 45,
    maxLagMs: 125,
  },
  {
    id: "itu-bt1359-accept",
    name: "ITU-R BT.1359-1 acceptability",
    scope: "Point where viewers object",
    maxLeadMs: 90,
    maxLagMs: 185,
  },
];

/** Common capture frame rates. */
export const FRAME_RATES = [23.976, 24, 25, 29.97, 30, 50, 59.94, 60, 120];

/** A measurement outside this range is a slate-reading mistake, not a sync error. */
export const MAX_PLAUSIBLE_OFFSET_MS = 10000;

/**
 * Offset from one slate: the flash (or clap) frame number and the audio spike
 * timestamp. `frameBase` is 1 when your player numbers the first frame 1.
 */
export function measureSync({ flashFrame = 1, fps = 25, audioSeconds = 0, frameBase = 1 } = {}) {
  const rate = Number(fps);
  if (!Number.isFinite(rate) || rate <= 0) {
    return { error: "Frame rate must be greater than zero." };
  }
  const frame = Number(flashFrame);
  if (!Number.isFinite(frame)) {
    return { error: "Enter the frame number the flash or clap appears on." };
  }
  const base = frameBase === 0 ? 0 : 1;
  const videoSeconds = (frame - base) / rate;
  if (videoSeconds < 0) {
    return { error: `With ${base}-based numbering the first frame is ${base}; a lower number has no timestamp.` };
  }
  const audio = Number(audioSeconds);
  if (!Number.isFinite(audio) || audio < 0) {
    return { error: "Audio spike time must be zero or more seconds." };
  }

  const offsetMs = (audio - videoSeconds) * 1000;
  if (Math.abs(offsetMs) > MAX_PLAUSIBLE_OFFSET_MS) {
    return {
      error: `That works out to ${Math.round(offsetMs)} ms, which is over ${MAX_PLAUSIBLE_OFFSET_MS / 1000} s — check that both readings come from the same slate.`,
    };
  }

  return {
    offsetMs,
    videoSeconds,
    audioSeconds: audio,
    fps: rate,
    frameMs: 1000 / rate,
    offsetFrames: (offsetMs * rate) / 1000,
    direction: offsetMs > 0 ? "audio late" : offsetMs < 0 ? "audio early" : "in sync",
  };
}

/** Grade an offset against every standard and describe what to do. */
export function gradeOffset(offsetMs) {
  const value = Number(offsetMs);
  if (!Number.isFinite(value)) return { error: "Offset must be a number of milliseconds." };
  const leadMs = value < 0 ? -value : 0;
  const lagMs = value > 0 ? value : 0;

  const results = SYNC_STANDARDS.map((standard) => ({
    ...standard,
    pass: leadMs <= standard.maxLeadMs && lagMs <= standard.maxLagMs,
    marginMs: value < 0 ? standard.maxLeadMs - leadMs : standard.maxLagMs - lagMs,
  }));

  const detect = results.find((entry) => entry.id === "itu-bt1359-detect");
  const accept = results.find((entry) => entry.id === "itu-bt1359-accept");
  const verdict = !detect.pass
    ? accept.pass
      ? "Viewers will notice this, though most will tolerate it. Correct it if you can."
      : "Past the point where viewers object — this must be corrected."
    : "Below the threshold where the error becomes detectable.";

  return { standards: results, passedCount: results.filter((entry) => entry.pass).length, verdict, leadMs, lagMs };
}

/**
 * ffmpeg correction. A positive offset (audio late) means the audio stream has
 * to start earlier, so the audio input gets a negative -itsoffset.
 */
export function correctionCommand(offsetMs, { input = "input.mp4", output = "synced.mp4" } = {}) {
  const value = Number(offsetMs);
  if (!Number.isFinite(value)) return { error: "Offset must be a number of milliseconds." };
  const seconds = -value / 1000;
  const signed = `${seconds >= 0 ? "" : "-"}${Math.abs(seconds).toFixed(3)}`;
  return {
    audioOffsetSeconds: seconds,
    command: `ffmpeg -i ${input} -itsoffset ${signed} -i ${input} -map 0:v -map 1:a -c copy ${output}`,
    explanation:
      value > 0
        ? `Audio is ${Math.abs(value).toFixed(0)} ms late, so the audio input is pulled ${Math.abs(seconds).toFixed(3)} s earlier.`
        : value < 0
          ? `Audio is ${Math.abs(value).toFixed(0)} ms early, so the audio input is pushed ${Math.abs(seconds).toFixed(3)} s later.`
          : "Already in sync — no correction needed.",
  };
}

/** Mean, spread and confidence over several slate measurements. */
export function averageOffsets(offsets) {
  const values = (Array.isArray(offsets) ? offsets : [])
    .map(Number)
    .filter((value) => Number.isFinite(value));
  if (values.length === 0) {
    return { error: "Add at least one measurement before averaging." };
  }
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.length > 1
      ? values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1)
      : 0;
  return {
    count: values.length,
    meanMs: mean,
    stdDevMs: Math.sqrt(variance),
    minMs: Math.min(...values),
    maxMs: Math.max(...values),
    rangeMs: Math.max(...values) - Math.min(...values),
  };
}

/** Parse "1.204" style seconds, or "00:00:01.204" timecode, into seconds. */
export function parseTimeToSeconds(text) {
  const raw = String(text || "").trim();
  if (!raw) return { error: "Enter a time." };
  if (/^\d*\.?\d+$/.test(raw)) return { seconds: Number(raw) };
  const parts = raw.split(":").map((part) => Number(part));
  if (parts.some((part) => !Number.isFinite(part))) return { error: "Time must be seconds or HH:MM:SS.mmm." };
  const seconds = parts.reduce((total, part) => total * 60 + part, 0);
  if (seconds < 0) return { error: "Time cannot be negative." };
  return { seconds };
}
