/**
 * Frames <-> seconds <-> SMPTE timecode.
 *
 * Two different numbers are in play for the NTSC family of rates:
 *  - the EXACT rate, e.g. 30000/1001 = 29.97002997..., which governs real elapsed time
 *  - the NOMINAL integer rate, e.g. 30, which governs how timecode labels count frames
 * Drop-frame timecode (SMPTE ST 12-1) does not drop pictures; it skips two frame
 * LABELS at the start of every minute except minutes divisible by ten, so a
 * one-hour timecode span matches one hour of clock time to within ~3 ms.
 */

/** NTSC pulldown divisor that turns 24/30/60 into 23.976/29.97/59.94. */
export const NTSC_DIVISOR = 1.001;

export const FRAME_RATES = [
  { id: "23.976", label: "23.976 fps (24 / 1.001)", exact: 24000 / 1001, nominal: 24, dropFrameAllowed: false },
  { id: "24", label: "24 fps (cinema)", exact: 24, nominal: 24, dropFrameAllowed: false },
  { id: "25", label: "25 fps (PAL)", exact: 25, nominal: 25, dropFrameAllowed: false },
  { id: "29.97", label: "29.97 fps (30 / 1.001)", exact: 30000 / 1001, nominal: 30, dropFrameAllowed: true },
  { id: "30", label: "30 fps", exact: 30, nominal: 30, dropFrameAllowed: false },
  { id: "48", label: "48 fps", exact: 48, nominal: 48, dropFrameAllowed: false },
  { id: "50", label: "50 fps (PAL HFR)", exact: 50, nominal: 50, dropFrameAllowed: false },
  { id: "59.94", label: "59.94 fps (60 / 1.001)", exact: 60000 / 1001, nominal: 60, dropFrameAllowed: true },
  { id: "60", label: "60 fps", exact: 60, nominal: 60, dropFrameAllowed: false },
  { id: "120", label: "120 fps", exact: 120, nominal: 120, dropFrameAllowed: false },
];

export function findRate(rateId) {
  return FRAME_RATES.find((rate) => rate.id === rateId) || null;
}

/** Upper sanity bound: 24 hours of 120 fps frames. */
export const MAX_FRAMES = 24 * 3600 * 120;

const pad = (value, size = 2) => String(Math.trunc(Math.abs(value))).padStart(size, "0");

/**
 * Frames dropped at each minute boundary: 2 at 29.97, 4 at 59.94.
 * Derived from the SMPTE rule of 0.066666 x nominal rate.
 */
export function dropFrameCount(nominal) {
  return Math.round(nominal * 0.066666);
}

/** Non-drop timecode: frame labels count straight up at the nominal rate. */
export function framesToNonDropTimecode(frames, nominal) {
  const total = Math.trunc(frames);
  const f = total % nominal;
  const totalSeconds = Math.floor(total / nominal);
  const s = totalSeconds % 60;
  const m = Math.floor(totalSeconds / 60) % 60;
  const h = Math.floor(totalSeconds / 3600);
  return `${pad(h)}:${pad(m)}:${pad(s)}:${pad(f)}`;
}

/**
 * Drop-frame timecode (SMPTE ST 12-1). Standard conversion: add back the
 * skipped labels for every completed minute that is not a tenth minute.
 */
export function framesToDropTimecode(frames, nominal) {
  const drop = dropFrameCount(nominal);
  const framesPer10Minutes = Math.round((nominal / NTSC_DIVISOR) * 600); // 17982 at 29.97
  const framesPerMinute = nominal * 60 - drop; // 1798 at 29.97
  let counter = Math.trunc(frames);

  const tenMinuteBlocks = Math.floor(counter / framesPer10Minutes);
  const remainder = counter % framesPer10Minutes;
  counter += drop * 9 * tenMinuteBlocks;
  if (remainder > drop) {
    counter += drop * Math.floor((remainder - drop) / framesPerMinute);
  }

  const f = counter % nominal;
  const totalSeconds = Math.floor(counter / nominal);
  const s = totalSeconds % 60;
  const m = Math.floor(totalSeconds / 60) % 60;
  const h = Math.floor(totalSeconds / 3600);
  return `${pad(h)}:${pad(m)}:${pad(s)};${pad(f)}`;
}

export function framesToTimecode(frames, nominal, dropFrame) {
  return dropFrame ? framesToDropTimecode(frames, nominal) : framesToNonDropTimecode(frames, nominal);
}

/** Accepts HH:MM:SS:FF, HH:MM:SS;FF, MM:SS:FF or SS:FF. */
export function parseTimecode(raw) {
  if (typeof raw !== "string") return null;
  const cleaned = raw.trim().replace(/;/g, ":");
  if (!/^\d{1,3}(:\d{1,3}){1,3}$/.test(cleaned)) return null;
  const parts = cleaned.split(":").map((part) => Number(part));
  while (parts.length < 4) parts.unshift(0);
  const [h, m, s, f] = parts;
  if ([h, m, s, f].some((value) => !Number.isFinite(value))) return null;
  return { hours: h, minutes: m, seconds: s, frames: f };
}

export function timecodeToFrames(parts, nominal, dropFrame) {
  const { hours, minutes, seconds, frames } = parts;
  const straight = ((hours * 60 + minutes) * 60 + seconds) * nominal + frames;
  if (!dropFrame) return straight;
  const drop = dropFrameCount(nominal);
  // Every minute except each tenth minute is missing `drop` labels.
  const totalMinutes = hours * 60 + minutes;
  const droppedLabels = drop * (totalMinutes - Math.floor(totalMinutes / 10));
  return straight - droppedLabels;
}

/** Human duration such as "1 h 02 m 03.500 s". */
export function formatDuration(totalSeconds) {
  if (!Number.isFinite(totalSeconds)) return "—";
  const sign = totalSeconds < 0 ? "-" : "";
  const abs = Math.abs(totalSeconds);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  const secondsText = `${s < 10 ? "0" : ""}${s.toFixed(3)}`;
  if (h > 0) return `${sign}${h} h ${pad(m)} m ${secondsText} s`;
  if (m > 0) return `${sign}${m} m ${secondsText} s`;
  return `${sign}${s.toFixed(3)} s`;
}

/**
 * Main conversion.
 * mode: "frames" | "seconds" | "timecode"
 * @returns {{error:string}|{
 *   frames:number, seconds:number, exactFps:number, nominalFps:number,
 *   timecode:string, otherTimecode:string|null, dropFrame:boolean,
 *   msPerFrame:number, framesPerMinute:number, durationText:string,
 *   nominalSeconds:number, driftSeconds:number
 * }}
 */
export function convertFrameTime({ mode = "frames", value = 0, timecode = "", rateId = "25", dropFrame = false } = {}) {
  const rate = findRate(rateId);
  if (!rate) return { error: "Pick a frame rate from the list." };
  const useDrop = Boolean(dropFrame) && rate.dropFrameAllowed;

  let frames;
  if (mode === "timecode") {
    const parts = parseTimecode(timecode);
    if (!parts) return { error: "Enter timecode as HH:MM:SS:FF, for example 00:01:30:12." };
    if (parts.frames >= rate.nominal) {
      return { error: `Frame field must be 0-${rate.nominal - 1} at ${rate.label.split(" ")[0]} fps.` };
    }
    if (parts.seconds > 59 || parts.minutes > 59) {
      return { error: "Minutes and seconds must be 0-59." };
    }
    frames = timecodeToFrames(parts, rate.nominal, useDrop);
    if (frames < 0) return { error: "That timecode does not exist in drop-frame counting." };
  } else if (mode === "seconds") {
    if (!Number.isFinite(value)) return { error: "Enter a duration in seconds." };
    if (value < 0) return { error: "Duration cannot be negative." };
    frames = Math.round(value * rate.exact);
  } else {
    if (!Number.isFinite(value)) return { error: "Enter a whole number of frames." };
    if (value < 0) return { error: "Frame count cannot be negative." };
    frames = Math.round(value);
  }

  if (frames > MAX_FRAMES) {
    return { error: "That is more than 24 hours of frames — try a smaller value." };
  }

  const seconds = frames / rate.exact;
  const nominalSeconds = frames / rate.nominal;

  return {
    frames,
    seconds,
    nominalSeconds,
    driftSeconds: seconds - nominalSeconds,
    exactFps: rate.exact,
    nominalFps: rate.nominal,
    dropFrame: useDrop,
    timecode: framesToTimecode(frames, rate.nominal, useDrop),
    otherTimecode: rate.dropFrameAllowed
      ? framesToTimecode(frames, rate.nominal, !useDrop)
      : null,
    msPerFrame: 1000 / rate.exact,
    framesPerMinute: rate.exact * 60,
    durationText: formatDuration(seconds),
  };
}
