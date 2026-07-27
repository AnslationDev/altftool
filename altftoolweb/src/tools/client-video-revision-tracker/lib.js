/**
 * Client video revision tracking.
 *
 * Two jobs, both pure:
 *  1. Turn a written timecode ("2:14", "1:02:03", "134") into seconds so notes
 *     can be sorted and validated against the cut's runtime.
 *  2. Roll a list of notes up into per-round and per-status counts, a
 *     resolution percentage, an estimate of remaining edit time, and the
 *     billable overage when the job passes the rounds your contract includes.
 *
 *     resolved            = notes marked done or wont-fix
 *     resolution rate     = resolved / total notes x 100
 *     rounds used         = highest round number present on any note
 *     billable rounds     = max(0, rounds used - rounds included in contract)
 *     overage charge      = billable rounds x fee per extra round
 *     remaining edit time = unresolved notes x minutes budgeted per note
 */

export const SECONDS_PER_MINUTE = 60;
export const SECONDS_PER_HOUR = 3600;

/** Statuses a single note can hold. `done` and `wont-fix` both count as resolved. */
export const NOTE_STATUSES = [
  { id: "open", label: "Open", resolved: false },
  { id: "in-progress", label: "In progress", resolved: false },
  { id: "done", label: "Done", resolved: true },
  { id: "wont-fix", label: "Won't fix", resolved: true },
];

/** Two rounds of revisions is the most common allowance in a video SOW. */
export const DEFAULT_INCLUDED_ROUNDS = 2;

/** Planning default: assume 15 minutes of edit time per outstanding note. */
export const DEFAULT_MINUTES_PER_NOTE = 15;

/** Guard rails. */
export const MAX_ROUNDS = 50;
export const MAX_NOTES = 500;

const RESOLVED_IDS = new Set(NOTE_STATUSES.filter((s) => s.resolved).map((s) => s.id));
const STATUS_IDS = new Set(NOTE_STATUSES.map((s) => s.id));

/** True when a status counts towards the resolution rate. */
export function isResolvedStatus(statusId) {
  return RESOLVED_IDS.has(statusId);
}

/**
 * "2:14" -> 134, "1:02:03" -> 3723, "45" -> 45.
 * Returns null when the text is not a timecode.
 */
export function parseTimecode(text) {
  const raw = String(text ?? "").trim();
  if (raw === "") return null;
  if (/^\d+$/.test(raw)) return Number(raw);

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

/** 134 -> "2:14", 3723 -> "1:02:03". */
export function formatTimecode(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "—";
  const whole = Math.floor(totalSeconds);
  const hours = Math.floor(whole / SECONDS_PER_HOUR);
  const minutes = Math.floor((whole % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const seconds = whole % SECONDS_PER_MINUTE;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** Minutes -> "2h 30m" / "45m". */
export function formatMinutes(totalMinutes) {
  if (!Number.isFinite(totalMinutes) || totalMinutes < 0) return "—";
  const whole = Math.round(totalMinutes);
  const hours = Math.floor(whole / 60);
  const minutes = whole % 60;
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  return `${minutes}m`;
}

/**
 * @param {object} input
 * @param {Array}  input.notes [{ id, round, timecode (seconds|null), text, status }]
 * @param {number} [input.videoLengthSeconds] 0 = unknown, skips the range check
 * @param {number} [input.includedRounds]     rounds covered by the contract
 * @param {number} [input.feePerExtraRound]   charge for each round beyond that
 * @param {number} [input.minutesPerNote]     edit time budgeted per outstanding note
 * @returns {object} summary, or { error } when the input cannot be summarised
 */
export function summariseRevisions({
  notes = [],
  videoLengthSeconds = 0,
  includedRounds = DEFAULT_INCLUDED_ROUNDS,
  feePerExtraRound = 0,
  minutesPerNote = DEFAULT_MINUTES_PER_NOTE,
} = {}) {
  if (!Array.isArray(notes)) return { error: "Notes must be a list." };
  if (notes.length > MAX_NOTES) return { error: `Keep the tracker to ${MAX_NOTES} notes or fewer.` };

  const length = Number(videoLengthSeconds);
  if (!Number.isFinite(length) || length < 0) return { error: "Video length cannot be negative." };

  const included = Number(includedRounds);
  if (!Number.isInteger(included) || included < 0 || included > MAX_ROUNDS) {
    return { error: `Included rounds must be a whole number between 0 and ${MAX_ROUNDS}.` };
  }

  const fee = Number(feePerExtraRound);
  if (!Number.isFinite(fee) || fee < 0) return { error: "The fee per extra round cannot be negative." };

  const perNote = Number(minutesPerNote);
  if (!Number.isFinite(perNote) || perNote < 0 || perNote > 600) {
    return { error: "Minutes per note must be between 0 and 600." };
  }

  const statusCounts = Object.fromEntries(NOTE_STATUSES.map((status) => [status.id, 0]));
  const roundMap = new Map();
  let resolved = 0;
  let roundsUsed = 0;

  for (const note of notes) {
    const round = Number(note?.round);
    if (!Number.isInteger(round) || round < 1 || round > MAX_ROUNDS) {
      return { error: `Every note needs a round number between 1 and ${MAX_ROUNDS}.` };
    }
    const status = String(note?.status ?? "");
    if (!STATUS_IDS.has(status)) {
      return { error: "Every note needs a status of Open, In progress, Done or Won't fix." };
    }
    if (note?.timecode !== null && note?.timecode !== undefined) {
      const seconds = Number(note.timecode);
      if (!Number.isFinite(seconds) || seconds < 0) {
        return { error: "Timecodes must be written as M:SS or H:MM:SS." };
      }
      if (length > 0 && seconds > length) {
        return { error: `A note is timecoded at ${formatTimecode(seconds)}, past the end of the cut.` };
      }
    }

    statusCounts[status] += 1;
    if (isResolvedStatus(status)) resolved += 1;
    roundsUsed = Math.max(roundsUsed, round);

    const bucket = roundMap.get(round) ?? { round, total: 0, resolved: 0 };
    bucket.total += 1;
    if (isResolvedStatus(status)) bucket.resolved += 1;
    roundMap.set(round, bucket);
  }

  const total = notes.length;
  const outstanding = total - resolved;
  const billableRounds = Math.max(0, roundsUsed - included);

  const byRound = [...roundMap.values()]
    .sort((a, b) => a.round - b.round)
    .map((bucket) => ({
      ...bucket,
      outstanding: bucket.total - bucket.resolved,
      resolutionPct: bucket.total > 0 ? (bucket.resolved / bucket.total) * 100 : 0,
      billable: bucket.round > included,
    }));

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.round !== b.round) return a.round - b.round;
    const at = a.timecode === null || a.timecode === undefined ? Infinity : Number(a.timecode);
    const bt = b.timecode === null || b.timecode === undefined ? Infinity : Number(b.timecode);
    return at - bt;
  });

  return {
    total,
    resolved,
    outstanding,
    statusCounts,
    resolutionPct: total > 0 ? (resolved / total) * 100 : null,
    roundsUsed,
    includedRounds: included,
    billableRounds,
    overageCharge: billableRounds * fee,
    remainingMinutes: outstanding * perNote,
    byRound,
    sortedNotes,
  };
}

/**
 * Convert rows captured as text ({ timecodeText, round: "3", ... }) into the
 * shape summariseRevisions expects, rejecting timecodes that cannot be parsed.
 * @returns {{notes: Array}|{error: string}}
 */
export function prepareNotes(rawNotes) {
  if (!Array.isArray(rawNotes)) return { error: "Notes must be a list." };
  const prepared = [];
  for (const raw of rawNotes) {
    const stamp = String(raw?.timecodeText ?? "").trim();
    let timecode = null;
    if (stamp !== "") {
      timecode = parseTimecode(stamp);
      if (timecode === null) {
        return { error: `"${stamp}" is not a valid timecode — use M:SS or H:MM:SS.` };
      }
    }
    prepared.push({
      id: raw?.id,
      round: Number(raw?.round),
      timecode,
      text: raw?.text,
      status: raw?.status,
    });
  }
  return { notes: prepared };
}

/** Plain-text changelog you can paste back to the client. */
export function buildRevisionExport(sortedNotes) {
  if (!Array.isArray(sortedNotes) || sortedNotes.length === 0) return "No notes logged yet.";
  const labelOf = (id) => NOTE_STATUSES.find((status) => status.id === id)?.label ?? id;
  const lines = [];
  let currentRound = null;
  for (const note of sortedNotes) {
    if (note.round !== currentRound) {
      currentRound = note.round;
      lines.push(`Round ${currentRound}`);
    }
    const stamp =
      note.timecode === null || note.timecode === undefined ? "general" : formatTimecode(note.timecode);
    lines.push(`  [${labelOf(note.status)}] ${stamp} — ${String(note.text ?? "").trim() || "(no detail)"}`);
  }
  return lines.join("\n");
}
