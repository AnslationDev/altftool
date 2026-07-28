/**
 * Sit-Stand Ratio Planner — pure scheduling maths.
 *
 * Builds a clock-timed rotation of seated and standing blocks across a workday,
 * keeping fixed seated meeting time intact and honouring a daily standing target.
 */

/**
 * Buckley JP et al., "The sedentary office: an expert statement on the growing
 * case for change towards better health and productivity", Br J Sports Med 2015.
 * Recommends accumulating at least 2 hours/day of standing and light activity
 * during working hours, progressing eventually towards 4 hours/day.
 */
export const MIN_STANDING_MINUTES = 120;
export const TARGET_STANDING_MINUTES = 240;

/**
 * Common ergonomics guidance (e.g. NIOSH / OSHA computer-workstation advice):
 * change posture at least every 30-60 minutes. Continuous standing beyond about
 * an hour raises lower-limb discomfort, so both limits are set at 60 minutes.
 */
export const MAX_CONTINUOUS_STANDING_MIN = 60;
export const MAX_CONTINUOUS_SITTING_MIN = 60;

/**
 * Saeidifard F et al., "Differences of energy expenditure while sitting versus
 * standing: a systematic review and meta-analysis", Eur J Prev Cardiol 2018.
 * Pooled difference for an average adult: about 0.15 kcal per minute.
 */
export const EXTRA_KCAL_PER_STANDING_MINUTE = 0.15;

/** Rotation is rounded to whole 5-minute steps so it survives contact with a calendar. */
export const ROTATION_STEP_MIN = 5;

export const CYCLE_OPTIONS = [30, 45, 60, 90];

export const MEETING_PLACEMENTS = [
  { id: "morning", label: "Morning block" },
  { id: "midday", label: "Around midday" },
  { id: "afternoon", label: "Afternoon block" },
];

const MINUTES_PER_DAY = 1440;

/** "09:30" -> 570. Returns null for anything that is not a valid 24-hour clock time. */
export function parseClock(value) {
  const match = /^\s*(\d{1,2}):(\d{2})\s*$/.exec(String(value ?? ""));
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** 570 -> "9:30 am". Wraps past midnight so a late shift still reads sensibly. */
export function formatClock(totalMinutes) {
  if (!Number.isFinite(totalMinutes)) return "--:--";
  const wrapped = ((Math.round(totalMinutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours24 = Math.floor(wrapped / 60);
  const minutes = wrapped % 60;
  const suffix = hours24 < 12 ? "am" : "pm";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

/** 135 -> "2 h 15 min". */
export function formatDuration(totalMinutes) {
  if (!Number.isFinite(totalMinutes) || totalMinutes < 0) return "--";
  const whole = Math.round(totalMinutes);
  const hours = Math.floor(whole / 60);
  const minutes = whole % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

const toFinite = (value) => {
  const parsed = Number(String(value ?? "").trim());
  return Number.isFinite(parsed) ? parsed : NaN;
};

/**
 * Lay alternating sit/stand blocks across one stretch of flexible time.
 * `phase` carries the rotation state so a segment can resume after a meeting.
 */
function fillSegment(startMinute, durationMinutes, sitPerCycle, standPerCycle, phase) {
  const blocks = [];
  if (sitPerCycle + standPerCycle <= 0) return { blocks, phase };

  let cursor = startMinute;
  let remaining = durationMinutes;
  let mode = phase.mode;
  let left = phase.left;

  while (remaining > 0) {
    if (left > 0) {
      const length = Math.min(left, remaining);
      blocks.push({ mode, start: cursor, end: cursor + length, minutes: length });
      cursor += length;
      remaining -= length;
      left -= length;
    }
    if (left <= 0) {
      mode = mode === "sit" ? "stand" : "sit";
      left = mode === "sit" ? sitPerCycle : standPerCycle;
    }
  }

  return { blocks, phase: { mode, left } };
}

/** Collapse touching blocks that share a mode (a sit block resuming after a sit block). */
function mergeBlocks(blocks) {
  const merged = [];
  for (const block of blocks) {
    const previous = merged[merged.length - 1];
    if (previous && previous.mode === block.mode && previous.end === block.start) {
      previous.end = block.end;
      previous.minutes += block.minutes;
    } else {
      merged.push({ ...block });
    }
  }
  return merged;
}

/**
 * Build the day plan.
 *
 * @param {object} input
 * @param {number} input.workdayHours       Paid screen hours in the day, breaks excluded.
 * @param {number} input.meetingHours       Hours locked into seated meetings.
 * @param {number} input.standingTargetHours Standing hours you want to accumulate.
 * @param {number} input.cycleMinutes       Length of one sit + stand cycle.
 * @param {string} input.meetingPlacement   "morning" | "midday" | "afternoon".
 * @param {string} input.startTime          24-hour clock start, e.g. "09:00".
 */
export function planSitStand({
  workdayHours,
  meetingHours,
  standingTargetHours,
  cycleMinutes,
  meetingPlacement = "midday",
  startTime = "09:00",
} = {}) {
  const workday = toFinite(workdayHours);
  const meetings = toFinite(meetingHours);
  const standTarget = toFinite(standingTargetHours);
  const cycle = toFinite(cycleMinutes);

  if ([workday, meetings, standTarget, cycle].some((value) => Number.isNaN(value))) {
    return { error: "Enter a number in every field." };
  }
  if (workday <= 0) return { error: "Workday length must be greater than zero." };
  if (workday > 16) return { error: "Keep the workday at 16 hours or less." };
  if (meetings < 0 || standTarget < 0) return { error: "Hours cannot be negative." };
  if (meetings >= workday) {
    return { error: "Seated meeting hours must be less than the workday, or there is nothing left to rotate." };
  }
  if (standTarget > workday) {
    return { error: "Standing target cannot exceed the length of the workday." };
  }
  if (cycle < 20 || cycle > 120) {
    return { error: "Use a rotation cycle between 20 and 120 minutes." };
  }

  const dayStart = parseClock(startTime);
  if (dayStart === null) return { error: "Enter the start time as a 24-hour clock value, such as 09:00." };

  const totalMin = Math.round(workday * 60);
  const meetingMin = Math.round(meetings * 60);
  const flexibleMin = totalMin - meetingMin;
  if (flexibleMin <= 0) {
    return { error: "There is no flexible time left once meetings are booked." };
  }

  const requestedStandMin = Math.round(standTarget * 60);
  const shortfallMin = Math.max(0, requestedStandMin - flexibleMin);
  const plannedStandMin = Math.min(requestedStandMin, flexibleMin);
  const standShare = plannedStandMin / flexibleMin;
  const cycleLen = Math.round(cycle);

  let standPerCycle = Math.round((cycleLen * standShare) / ROTATION_STEP_MIN) * ROTATION_STEP_MIN;
  if (standShare >= 1) {
    standPerCycle = cycleLen;
  } else {
    if (plannedStandMin > 0 && standPerCycle < ROTATION_STEP_MIN) standPerCycle = ROTATION_STEP_MIN;
    if (standPerCycle > cycleLen - ROTATION_STEP_MIN) standPerCycle = cycleLen - ROTATION_STEP_MIN;
    if (standPerCycle < 0) standPerCycle = 0;
  }
  const sitPerCycle = cycleLen - standPerCycle;

  const firstFlex =
    meetingPlacement === "morning"
      ? 0
      : meetingPlacement === "afternoon"
        ? flexibleMin
        : Math.round(flexibleMin / 2);
  const secondFlex = flexibleMin - firstFlex;

  let cursor = dayStart;
  let phase = { mode: "sit", left: sitPerCycle };
  let raw = [];

  if (firstFlex > 0) {
    const filled = fillSegment(cursor, firstFlex, sitPerCycle, standPerCycle, phase);
    raw = raw.concat(filled.blocks);
    phase = filled.phase;
    cursor += firstFlex;
  }
  if (meetingMin > 0) {
    raw.push({ mode: "meeting", start: cursor, end: cursor + meetingMin, minutes: meetingMin });
    cursor += meetingMin;
  }
  if (secondFlex > 0) {
    const filled = fillSegment(cursor, secondFlex, sitPerCycle, standPerCycle, phase);
    raw = raw.concat(filled.blocks);
    phase = filled.phase;
    cursor += secondFlex;
  }

  const blocks = mergeBlocks(raw);

  let standingMin = 0;
  let longestStanding = 0;
  let longestSeated = 0;
  let seatedRun = 0;
  for (const block of blocks) {
    if (block.mode === "stand") {
      standingMin += block.minutes;
      if (block.minutes > longestStanding) longestStanding = block.minutes;
      seatedRun = 0;
    } else {
      seatedRun += block.minutes;
      if (seatedRun > longestSeated) longestSeated = seatedRun;
    }
  }
  const seatedMin = totalMin - standingMin;
  const standingSessions = blocks.filter((block) => block.mode === "stand").length;

  const warnings = [];
  if (shortfallMin > 0) {
    warnings.push(
      `Your standing target is ${formatDuration(shortfallMin)} more than the flexible time available, so the plan stands for the whole non-meeting day instead.`,
    );
  }
  if (standingMin < MIN_STANDING_MINUTES) {
    warnings.push(
      `Scheduled standing is ${formatDuration(standingMin)}, below the 2 hours a day the 2015 BJSM expert statement suggests for desk workers.`,
    );
  }
  if (longestStanding > MAX_CONTINUOUS_STANDING_MIN) {
    warnings.push(
      `One standing block runs ${formatDuration(longestStanding)}. Standing beyond about an hour at a stretch tends to cause leg and lower-back discomfort — shorten the cycle.`,
    );
  }
  if (longestSeated > MAX_CONTINUOUS_SITTING_MIN) {
    warnings.push(
      `You sit for ${formatDuration(longestSeated)} without a break. Aim to change posture at least once an hour, even during meetings.`,
    );
  }

  return {
    blocks,
    dayStart,
    dayEnd: cursor,
    totalMin,
    meetingMin,
    flexibleMin,
    requestedStandMin,
    plannedStandMin,
    shortfallMin,
    standingMin,
    seatedMin,
    standingSessions,
    postureChanges: Math.max(0, blocks.length - 1),
    sitPerCycle,
    standPerCycle,
    cycleMinutes: cycleLen,
    standingSharePct: (standingMin / totalMin) * 100,
    longestStanding,
    longestSeated,
    extraKcal: standingMin * EXTRA_KCAL_PER_STANDING_MINUTE,
    warnings,
  };
}
