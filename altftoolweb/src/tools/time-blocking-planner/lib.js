/**
 * Time blocking planner — schedule arithmetic for a single day.
 *
 * A day is a window (start..end) in minutes past midnight. Blocks are
 * half-open intervals [start, end): a block ending at 10:00 and one starting
 * at 10:00 do not overlap.
 */

export const MINUTES_PER_DAY = 24 * 60;

export const DEFAULT_DAY_START = "09:00";
export const DEFAULT_DAY_END = "18:00";

/** Anything shorter than this is a calendar artefact, not a block of work. */
export const MIN_BLOCK_MINUTES = 5;

/** Gaps under 15 minutes are too short to start anything — counted as dead time. */
export const MIN_USEFUL_GAP_MINUTES = 15;

/**
 * DeskTime's 2014 analysis of its most productive 10% of users found a working
 * rhythm of 52 minutes on, 17 minutes off. Used to size the recommended break total.
 */
export const DESKTIME_WORK_MINUTES = 52;
export const DESKTIME_BREAK_MINUTES = 17;

/**
 * Cal Newport (Deep Work, 2016): even practised people top out at about four
 * hours of genuinely deep work per day.
 */
export const MAX_DEEP_WORK_MINUTES = 240;

/** Guard so a runaway paste cannot freeze the tab. */
export const MAX_BLOCKS = 60;

/** Dragging snaps to 5-minute steps, the smallest unit worth blocking. */
export const SNAP_MINUTES = 5;

export const BLOCK_CATEGORIES = [
  { id: "deep", label: "Deep work", counts: "focus" },
  { id: "shallow", label: "Shallow / admin", counts: "focus" },
  { id: "meeting", label: "Meeting", counts: "focus" },
  { id: "break", label: "Break", counts: "break" },
  { id: "personal", label: "Personal", counts: "break" },
];

export const PRIORITIES = ["high", "medium", "low"];

const CATEGORY_BY_ID = new Map(BLOCK_CATEGORIES.map((entry) => [entry.id, entry]));

/** "09:30" -> 570. Returns null for anything that is not a valid 24-hour time. */
export function parseTime(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 24 || minutes > 59) return null;
  const total = hours * 60 + minutes;
  if (total > MINUTES_PER_DAY) return null;
  return total;
}

/** 570 -> "09:30". */
export function formatTime(totalMinutes) {
  const clamped = Math.max(0, Math.min(MINUTES_PER_DAY, Math.round(totalMinutes)));
  const hours = Math.floor(clamped / 60);
  const minutes = clamped % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** 135 -> "2h 15m". */
export function formatDuration(totalMinutes) {
  const value = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/**
 * Move a block to a new start time, keeping its length, snapping to SNAP_MINUTES
 * and clamping so it cannot run past midnight. Returns the block unchanged if its
 * current times cannot be parsed.
 */
export function moveBlock(block, newStartMin, snap = SNAP_MINUTES) {
  const startMin = parseTime(block?.start);
  const endMin = parseTime(block?.end);
  if (startMin === null || endMin === null || !Number.isFinite(newStartMin)) return block;
  const length = endMin - startMin;
  const step = snap > 0 ? snap : 1;
  const snapped = Math.round(newStartMin / step) * step;
  const clamped = Math.max(0, Math.min(MINUTES_PER_DAY - length, snapped));
  return { ...block, start: formatTime(clamped), end: formatTime(clamped + length) };
}

function overlapMinutes(a, b) {
  return Math.max(0, Math.min(a.endMin, b.endMin) - Math.max(a.startMin, b.startMin));
}

/**
 * Analyse a day of time blocks.
 * @param {{blocks:Array, dayStart:string, dayEnd:string}} input
 * @returns {object|{error:string}}
 */
export function planDay({ blocks = [], dayStart = DEFAULT_DAY_START, dayEnd = DEFAULT_DAY_END } = {}) {
  const windowStart = parseTime(dayStart);
  const windowEnd = parseTime(dayEnd);

  if (windowStart === null) return { error: `Day start "${dayStart}" is not a valid 24-hour time.` };
  if (windowEnd === null) return { error: `Day end "${dayEnd}" is not a valid 24-hour time.` };
  if (windowEnd <= windowStart) return { error: "The day must end after it starts." };

  if (!Array.isArray(blocks)) return { error: "Blocks must be a list." };
  if (blocks.length === 0) return { error: "Add at least one time block to plan the day." };
  if (blocks.length > MAX_BLOCKS) {
    return { error: `That is ${blocks.length} blocks. The limit is ${MAX_BLOCKS} per day.` };
  }

  const parsed = [];
  for (const block of blocks) {
    const title = String(block?.title ?? "").trim() || "Untitled block";
    const startMin = parseTime(block?.start);
    const endMin = parseTime(block?.end);
    if (startMin === null) return { error: `"${title}" has an invalid start time.` };
    if (endMin === null) return { error: `"${title}" has an invalid end time.` };
    if (endMin <= startMin) {
      return { error: `"${title}" ends at or before it starts. Overnight blocks are not supported.` };
    }
    if (endMin - startMin < MIN_BLOCK_MINUTES) {
      return { error: `"${title}" is under ${MIN_BLOCK_MINUTES} minutes long.` };
    }
    const categoryId = CATEGORY_BY_ID.has(block?.category) ? block.category : "shallow";
    parsed.push({
      id: block?.id ?? title,
      title,
      startMin,
      endMin,
      minutes: endMin - startMin,
      category: categoryId,
      priority: PRIORITIES.includes(block?.priority) ? block.priority : "medium",
      done: Boolean(block?.done),
      notes: String(block?.notes ?? ""),
    });
  }

  parsed.sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);

  const windowMinutes = windowEnd - windowStart;

  // --- overlaps ---
  const overlaps = [];
  for (let i = 0; i < parsed.length; i += 1) {
    for (let j = i + 1; j < parsed.length; j += 1) {
      const minutes = overlapMinutes(parsed[i], parsed[j]);
      if (minutes > 0) {
        overlaps.push({ a: parsed[i].title, b: parsed[j].title, minutes });
      }
    }
  }
  const overlapIds = new Set();
  for (const block of parsed) {
    if (parsed.some((other) => other !== block && overlapMinutes(block, other) > 0)) {
      overlapIds.add(block.id);
    }
  }

  // --- merged occupancy inside the window, so overlaps are not double counted ---
  const merged = [];
  for (const block of parsed) {
    const start = Math.max(windowStart, block.startMin);
    const end = Math.min(windowEnd, block.endMin);
    if (end <= start) continue;
    const last = merged[merged.length - 1];
    if (last && start <= last.end) last.end = Math.max(last.end, end);
    else merged.push({ start, end });
  }
  const bookedMinutes = merged.reduce((sum, span) => sum + (span.end - span.start), 0);

  // --- gaps ---
  const gaps = [];
  let cursor = windowStart;
  for (const span of merged) {
    if (span.start > cursor) gaps.push({ startMin: cursor, endMin: span.start, minutes: span.start - cursor });
    cursor = Math.max(cursor, span.end);
  }
  if (cursor < windowEnd) gaps.push({ startMin: cursor, endMin: windowEnd, minutes: windowEnd - cursor });

  const deadTimeMinutes = gaps
    .filter((gap) => gap.minutes < MIN_USEFUL_GAP_MINUTES)
    .reduce((sum, gap) => sum + gap.minutes, 0);
  const freeMinutes = gaps.reduce((sum, gap) => sum + gap.minutes, 0);

  // --- totals by category (raw block durations, so a double-booked hour shows twice) ---
  const byCategory = {};
  for (const entry of BLOCK_CATEGORIES) byCategory[entry.id] = 0;
  for (const block of parsed) byCategory[block.category] += block.minutes;

  const focusMinutes = BLOCK_CATEGORIES.filter((entry) => entry.counts === "focus").reduce(
    (sum, entry) => sum + byCategory[entry.id],
    0
  );
  const breakMinutes = BLOCK_CATEGORIES.filter((entry) => entry.counts === "break").reduce(
    (sum, entry) => sum + byCategory[entry.id],
    0
  );

  const recommendedBreakMinutes = Math.round(
    (focusMinutes * DESKTIME_BREAK_MINUTES) / DESKTIME_WORK_MINUTES
  );
  const breakDeficit = Math.max(0, recommendedBreakMinutes - breakMinutes);

  // --- longest uninterrupted focus run (consecutive non-break blocks, no gap) ---
  let longestFocusRun = 0;
  let runStart = null;
  let runEnd = null;
  for (const block of parsed) {
    const isFocus = CATEGORY_BY_ID.get(block.category).counts === "focus";
    if (!isFocus) {
      runStart = null;
      runEnd = null;
      continue;
    }
    if (runEnd !== null && block.startMin <= runEnd) {
      runEnd = Math.max(runEnd, block.endMin);
    } else {
      runStart = block.startMin;
      runEnd = block.endMin;
    }
    longestFocusRun = Math.max(longestFocusRun, runEnd - runStart);
  }

  const doneMinutes = parsed.filter((block) => block.done).reduce((sum, block) => sum + block.minutes, 0);
  const totalBlockMinutes = parsed.reduce((sum, block) => sum + block.minutes, 0);

  const utilisation = Number(((bookedMinutes / windowMinutes) * 100).toFixed(1));
  const completion = totalBlockMinutes > 0
    ? Number(((doneMinutes / totalBlockMinutes) * 100).toFixed(1))
    : 0;

  const warnings = [];
  for (const clash of overlaps) {
    warnings.push(`"${clash.a}" and "${clash.b}" overlap by ${formatDuration(clash.minutes)}.`);
  }
  const outside = parsed.filter((block) => block.startMin < windowStart || block.endMin > windowEnd);
  for (const block of outside) {
    warnings.push(`"${block.title}" falls outside the ${dayStart}–${dayEnd} window.`);
  }
  if (byCategory.deep > MAX_DEEP_WORK_MINUTES) {
    warnings.push(
      `${formatDuration(byCategory.deep)} of deep work scheduled. Sustained deep work tops out near ${formatDuration(MAX_DEEP_WORK_MINUTES)} a day.`
    );
  }
  if (breakDeficit > 0) {
    warnings.push(
      `Only ${formatDuration(breakMinutes)} of breaks for ${formatDuration(focusMinutes)} of work — the 52/17 rhythm suggests about ${formatDuration(recommendedBreakMinutes)}.`
    );
  }
  if (deadTimeMinutes > 0) {
    warnings.push(
      `${formatDuration(deadTimeMinutes)} sits in gaps under ${MIN_USEFUL_GAP_MINUTES} minutes — too short to use.`
    );
  }

  return {
    windowStart,
    windowEnd,
    windowMinutes,
    bookedMinutes,
    freeMinutes,
    deadTimeMinutes,
    utilisation,
    completion,
    focusMinutes,
    breakMinutes,
    recommendedBreakMinutes,
    breakDeficit,
    longestFocusRun,
    byCategory,
    overlaps,
    gaps,
    warnings,
    blocks: parsed.map((block) => ({
      ...block,
      startLabel: formatTime(block.startMin),
      endLabel: formatTime(block.endMin),
      durationLabel: formatDuration(block.minutes),
      clashes: overlapIds.has(block.id),
      outsideWindow: block.startMin < windowStart || block.endMin > windowEnd,
    })),
  };
}

/** Plain-text day plan for pasting into notes or a standup message. */
export function buildDaySummary({ dayLabel = "Today", plan } = {}) {
  if (!plan || plan.error) return { error: plan?.error || "Nothing to summarise yet." };

  const lines = [
    `${dayLabel} — ${formatTime(plan.windowStart)} to ${formatTime(plan.windowEnd)}`,
    `Booked ${formatDuration(plan.bookedMinutes)} of ${formatDuration(plan.windowMinutes)} (${plan.utilisation}% utilisation)`,
    `Focus ${formatDuration(plan.focusMinutes)} · Breaks ${formatDuration(plan.breakMinutes)} · Longest focus run ${formatDuration(plan.longestFocusRun)}`,
    "",
  ];

  for (const block of plan.blocks) {
    const mark = block.done ? "[x]" : "[ ]";
    lines.push(
      `${mark} ${block.startLabel}–${block.endLabel}  ${block.title} (${CATEGORY_BY_ID.get(block.category).label}, ${block.priority})`
    );
  }

  if (plan.warnings.length) {
    lines.push("", "Warnings:");
    for (const warning of plan.warnings) lines.push(`- ${warning}`);
  }

  return { text: lines.join("\n") };
}
