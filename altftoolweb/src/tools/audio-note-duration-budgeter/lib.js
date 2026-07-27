/**
 * Audio note / voice memo backlog budgeting.
 *
 *   raw audio        = sum of every recording's duration
 *   listening time   = raw audio / playback speed
 *   review time      = listening time x review factor (pausing, rewinding, writing notes)
 *   transcription    = raw audio x typing ratio (speed-independent — you type at your speed)
 *   sessions needed  = ceil(review time / session length)
 *   days to clear    = ceil(review time / (daily capacity - daily inflow))
 *   file size        = bitrate x duration / 8
 *
 * Every multiplier is an input you can change; the defaults are stated below
 * with the reason they were chosen.
 */

export const SECONDS_PER_MINUTE = 60;
export const SECONDS_PER_HOUR = 3600;

/** kbps is kilobits per second at 1,000 bits; 8 bits to a byte. */
export const BITS_PER_BYTE = 8;
export const BITS_PER_KILOBIT = 1000;
/** Decimal megabytes, matching how file managers and cloud drives report size. */
export const BYTES_PER_MEGABYTE = 1_000_000;

/**
 * Review factor 1.5 means every minute you listen costs another 30 seconds of
 * pausing, rewinding and writing the note down. Set it to 1 for pure playback.
 */
export const DEFAULT_REVIEW_FACTOR = 1.5;

/**
 * Manual transcription commonly runs about 4 minutes of typing per minute of
 * clear, single-speaker audio; noisy recordings or several speakers push the
 * ratio to 6:1 or worse. Change it to match your own measured pace.
 */
export const DEFAULT_TRANSCRIPTION_RATIO = 4;

/** Common voice-memo bitrates, in kbps. */
export const BITRATE_PRESETS = [32, 64, 96, 128, 192, 256];

/** Playback speeds offered by most voice-memo and podcast apps. */
export const SPEED_PRESETS = [1, 1.25, 1.5, 1.75, 2, 2.5, 3];

export const MIN_SPEED = 0.5;
export const MAX_SPEED = 4;
export const MAX_REVIEW_FACTOR = 5;
export const MAX_RECORDINGS = 200;

/** "12:30" -> 750, "1:02:03" -> 3723, "90" -> 90 seconds. Null when unparseable. */
export function parseDuration(text) {
  const raw = String(text ?? "").trim();
  if (raw === "") return null;
  if (/^\d+(\.\d+)?$/.test(raw)) return Number(raw) * SECONDS_PER_MINUTE; // bare number = minutes

  const parts = raw.split(":");
  if (parts.length < 2 || parts.length > 3) return null;
  if (!parts.every((part) => /^\d{1,3}$/.test(part))) return null;
  const numbers = parts.map(Number);
  const seconds = numbers[numbers.length - 1];
  const minutes = numbers[numbers.length - 2];
  const hours = numbers.length === 3 ? numbers[0] : 0;
  if (seconds > 59) return null;
  if (numbers.length === 3 && minutes > 59) return null;
  return hours * SECONDS_PER_HOUR + minutes * SECONDS_PER_MINUTE + seconds;
}

/** Seconds -> "1h 04m 45s" / "12m 30s" / "45s". */
export function formatDuration(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "—";
  const whole = Math.round(totalSeconds);
  const hours = Math.floor(whole / SECONDS_PER_HOUR);
  const minutes = Math.floor((whole % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const seconds = whole % SECONDS_PER_MINUTE;
  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
  }
  if (minutes > 0) return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  return `${seconds}s`;
}

/** Approximate encoded size in megabytes for a constant-bitrate recording. */
export function estimateSizeMb(seconds, bitrateKbps) {
  if (!Number.isFinite(seconds) || seconds < 0) return null;
  if (!Number.isFinite(bitrateKbps) || bitrateKbps <= 0) return null;
  return (bitrateKbps * BITS_PER_KILOBIT * seconds) / BITS_PER_BYTE / BYTES_PER_MEGABYTE;
}

/**
 * Turn rows captured as text into seconds, rejecting anything unparseable.
 * @returns {{recordings: Array}|{error: string}}
 */
export function prepareRecordings(rows) {
  if (!Array.isArray(rows)) return { error: "Recordings must be a list." };
  if (rows.length > MAX_RECORDINGS) {
    return { error: `Keep the list to ${MAX_RECORDINGS} recordings or fewer.` };
  }
  const recordings = [];
  for (const row of rows) {
    const raw = String(row?.durationText ?? "").trim();
    if (raw === "") {
      recordings.push({ id: row?.id, label: row?.label, seconds: 0 });
      continue;
    }
    const seconds = parseDuration(raw);
    if (seconds === null) {
      return { error: `"${raw}" is not a duration — use M:SS, H:MM:SS, or plain minutes.` };
    }
    recordings.push({ id: row?.id, label: row?.label, seconds });
  }
  return { recordings };
}

/**
 * @param {object} input
 * @param {Array}  input.recordings [{ id, label, seconds }]
 * @param {number} [input.playbackSpeed]
 * @param {number} [input.reviewFactor]
 * @param {number} [input.transcriptionRatio]
 * @param {number} [input.sessionMinutes]      length of one review sitting
 * @param {number} [input.dailyCapacityMinutes] minutes per day you can spend reviewing
 * @param {number} [input.dailyInflowMinutes]   new audio you record per day
 * @param {number} [input.bitrateKbps]
 * @returns {object} plan, or { error } when the input cannot produce a real answer
 */
export function budgetAudioNotes({
  recordings = [],
  playbackSpeed = 1.5,
  reviewFactor = DEFAULT_REVIEW_FACTOR,
  transcriptionRatio = DEFAULT_TRANSCRIPTION_RATIO,
  sessionMinutes = 25,
  dailyCapacityMinutes = 30,
  dailyInflowMinutes = 0,
  bitrateKbps = 128,
} = {}) {
  if (!Array.isArray(recordings)) return { error: "Recordings must be a list." };

  const speed = Number(playbackSpeed);
  if (!Number.isFinite(speed) || speed < MIN_SPEED || speed > MAX_SPEED) {
    return { error: `Playback speed must be between ${MIN_SPEED}x and ${MAX_SPEED}x.` };
  }

  const factor = Number(reviewFactor);
  if (!Number.isFinite(factor) || factor < 1 || factor > MAX_REVIEW_FACTOR) {
    return { error: `The review factor must be between 1 and ${MAX_REVIEW_FACTOR}.` };
  }

  const typingRatio = Number(transcriptionRatio);
  if (!Number.isFinite(typingRatio) || typingRatio < 0 || typingRatio > 20) {
    return { error: "The transcription ratio must be between 0 and 20 minutes per audio minute." };
  }

  const session = Number(sessionMinutes);
  if (!Number.isFinite(session) || session <= 0 || session > 600) {
    return { error: "A review session must be between 1 and 600 minutes long." };
  }

  const capacity = Number(dailyCapacityMinutes);
  if (!Number.isFinite(capacity) || capacity <= 0 || capacity > 1440) {
    return { error: "Daily review capacity must be between 1 and 1440 minutes." };
  }

  const inflow = Number(dailyInflowMinutes);
  if (!Number.isFinite(inflow) || inflow < 0 || inflow > 1440) {
    return { error: "Daily new recording time must be between 0 and 1440 minutes." };
  }

  const bitrate = Number(bitrateKbps);
  if (!Number.isFinite(bitrate) || bitrate <= 0 || bitrate > 3000) {
    return { error: "Bitrate must be between 1 and 3000 kbps." };
  }

  let rawSeconds = 0;
  for (const recording of recordings) {
    const seconds = Number(recording?.seconds);
    if (!Number.isFinite(seconds) || seconds < 0) {
      return { error: "Every recording needs a duration of zero or more." };
    }
    rawSeconds += seconds;
  }

  if (!(rawSeconds > 0)) {
    return { error: "Add at least one recording with a duration above zero." };
  }

  const listenSeconds = rawSeconds / speed;
  const reviewSeconds = listenSeconds * factor;
  const transcriptionSeconds = rawSeconds * typingRatio;
  const sessionSeconds = session * SECONDS_PER_MINUTE;
  const capacitySeconds = capacity * SECONDS_PER_MINUTE;
  const inflowSeconds = inflow * SECONDS_PER_MINUTE;

  // Each day of inflow adds review work at the same multipliers as the backlog.
  const inflowReviewPerDay = (inflowSeconds / speed) * factor;
  const netDrainPerDay = capacitySeconds - inflowReviewPerDay;
  const daysToClear = netDrainPerDay > 0 ? Math.ceil(reviewSeconds / netDrainPerDay) : null;

  const longest = recordings.reduce(
    (best, recording) => (Number(recording?.seconds) > Number(best?.seconds ?? -1) ? recording : best),
    recordings[0] ?? null,
  );

  return {
    count: recordings.length,
    rawSeconds,
    listenSeconds,
    reviewSeconds,
    transcriptionSeconds,
    timeSavedSeconds: rawSeconds - listenSeconds,
    averageSeconds: recordings.length > 0 ? rawSeconds / recordings.length : 0,
    longest: longest ? { label: longest.label, seconds: Number(longest.seconds) } : null,
    sessionsNeeded: Math.ceil(reviewSeconds / sessionSeconds),
    daysAtCapacity: Math.ceil(reviewSeconds / capacitySeconds),
    daysToClear,
    backlogGrowing: netDrainPerDay <= 0,
    inflowReviewPerDay,
    sizeMb: estimateSizeMb(rawSeconds, bitrate),
    playbackSpeed: speed,
    reviewFactor: factor,
  };
}
