/**
 * Exam Concentration Sound Timer — pacing maths.
 *
 * Splits the writing time of a paper across its sections in proportion to the
 * marks each section carries, then lays those minutes out as timed sound blocks
 * with clock checkpoints and warning cues. Pure module: no React, no DOM, no
 * clock reads — the start time is always passed in.
 */

/**
 * Reading time allowances. CBSE gives 15 minutes of reading time before board
 * papers; Cambridge International and most UK boards build reading into the
 * paper time instead, so the default there is 0.
 */
export const READING_TIME_PRESETS = [
  { id: "cbse", label: "CBSE board (15 min reading)", minutes: 15 },
  { id: "cie", label: "Cambridge / UK board (no separate reading)", minutes: 0 },
  { id: "custom-10", label: "10 minutes to scan the paper", minutes: 10 },
  { id: "custom-5", label: "5 minutes to scan the paper", minutes: 5 },
];

/** Sensible default slice kept back at the end to re-check answers. */
export const DEFAULT_REVIEW_MINUTES = 10;

/** How far before a block ends the warning cue sounds. */
export const DEFAULT_WARNING_LEAD_MIN = 5;

/** Shortest block worth naming; anything under this is flagged as too tight. */
export const MIN_BLOCK_MINUTES = 2;

/**
 * Sound beds available to a block. Frequencies are filter corners in Hz; the
 * player uses them to shape noise. "Silence" is a real option — reading and
 * checking are the phases where extra sound tends to hurt.
 */
export const SOUND_BEDS = {
  silence: {
    id: "silence",
    label: "Silence",
    lowpassHz: 0,
    highpassHz: 0,
    levelDb: -120,
    description: "No bed at all. Best for reading time and the final check.",
  },
  brown: {
    id: "brown",
    label: "Brown noise (deep, dull)",
    lowpassHz: 700,
    highpassHz: 30,
    levelDb: -26,
    description: "Low rumble that covers corridor noise without adding anything to listen to.",
  },
  pink: {
    id: "pink",
    label: "Pink noise (even hiss)",
    lowpassHz: 6000,
    highpassHz: 40,
    levelDb: -30,
    description: "Broadest coverage. Useful in a noisy room, more noticeable in a quiet one.",
  },
  rain: {
    id: "rain",
    label: "Rain-shaped noise",
    lowpassHz: 3500,
    highpassHz: 150,
    levelDb: -28,
    description: "Mid-weighted and less boxy on laptop speakers than brown noise.",
  },
};

/** Spectral slope per bed, in dB per octave: -3 is pink, -6 is brown. */
export const BED_SLOPES = { silence: -6, brown: -6, pink: -3, rain: -4 };

/** Cue tones. A5 = 880 Hz, E5 = 659.25 Hz, A4 = 440 Hz in equal temperament. */
export const CUE_TONES = {
  start: { id: "start", freqHz: 440, seconds: 0.35, label: "Block start" },
  warning: { id: "warning", freqHz: 659.25, seconds: 0.25, label: "Time warning" },
  end: { id: "end", freqHz: 880, seconds: 0.6, label: "Move on" },
};

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** "09:30" -> 570 minutes past midnight. Returns null on anything else. */
export function parseClock(value) {
  if (typeof value !== "string") return null;
  const match = /^\s*(\d{1,2}):([0-5]\d)\s*$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23) return null;
  return hours * 60 + minutes;
}

/** 570 -> "09:30". Wraps past midnight so a late paper still reads sensibly. */
export function formatClock(minutesPastMidnight) {
  if (!isNum(minutesPastMidnight)) return "—";
  const total = ((Math.round(minutesPastMidnight) % 1440) + 1440) % 1440;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** "1 h 25 m" style duration. */
export function formatDuration(minutes) {
  if (!isNum(minutes) || minutes < 0) return "—";
  const whole = Math.round(minutes);
  const hours = Math.floor(whole / 60);
  const rest = whole % 60;
  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} h`;
  return `${hours} h ${rest} min`;
}

/**
 * Distribute whole minutes across sections in proportion to marks, using the
 * largest-remainder method so the parts always add back to the total exactly.
 */
export function allocateMinutesByMarks(marksList, totalMinutes) {
  if (!Array.isArray(marksList) || marksList.length === 0) return null;
  if (!isNum(totalMinutes) || totalMinutes <= 0) return null;
  let totalMarks = 0;
  for (const marks of marksList) {
    if (!isNum(marks) || marks <= 0) return null;
    totalMarks += marks;
  }
  if (!(totalMarks > 0)) return null;

  const exact = marksList.map((marks) => (marks / totalMarks) * totalMinutes);
  const floors = exact.map((value) => Math.floor(value));
  let remainder = Math.round(totalMinutes) - floors.reduce((sum, value) => sum + value, 0);
  const order = exact
    .map((value, index) => ({ index, frac: value - Math.floor(value) }))
    .sort((a, b) => b.frac - a.frac);

  const result = floors.slice();
  let cursor = 0;
  while (remainder > 0 && order.length > 0) {
    result[order[cursor % order.length].index] += 1;
    remainder -= 1;
    cursor += 1;
  }
  return result;
}

/**
 * Build the full block plan.
 *
 * sections: [{ name, marks, bed }]
 */
export function buildExamPlan({
  sections = [],
  totalMinutes = 180,
  readingMinutes = 15,
  reviewMinutes = DEFAULT_REVIEW_MINUTES,
  startClock = "09:30",
  warningLeadMin = DEFAULT_WARNING_LEAD_MIN,
} = {}) {
  if (!Array.isArray(sections) || sections.length === 0) {
    return { error: "Add at least one section of the paper." };
  }
  if (sections.length > 12) return { error: "Twelve sections is the practical limit for one paper." };
  if (!isNum(totalMinutes) || totalMinutes <= 0) return { error: "Enter the total paper time in minutes." };
  if (totalMinutes > 480) return { error: "Paper time should be 480 minutes (8 hours) or less." };
  if (!isNum(readingMinutes) || readingMinutes < 0) return { error: "Reading time cannot be negative." };
  if (!isNum(reviewMinutes) || reviewMinutes < 0) return { error: "Review time cannot be negative." };
  if (!isNum(warningLeadMin) || warningLeadMin < 0) return { error: "Warning lead cannot be negative." };

  const startMin = parseClock(startClock);
  if (startMin === null) return { error: "Start time must look like 09:30 on a 24-hour clock." };

  const marksList = [];
  for (const section of sections) {
    const marks = Number(section?.marks);
    if (!isNum(marks) || marks <= 0) {
      return { error: `Section "${section?.name || "untitled"}" needs a mark value above zero.` };
    }
    marksList.push(marks);
  }
  const totalMarks = marksList.reduce((sum, value) => sum + value, 0);

  const writingMinutes = totalMinutes - readingMinutes - reviewMinutes;
  if (writingMinutes <= 0) {
    return {
      error: "Reading plus review time uses up the whole paper. Reduce one of them.",
    };
  }

  const allocated = allocateMinutesByMarks(marksList, writingMinutes);
  if (!allocated) return { error: "Could not split the time across those sections." };

  const minutesPerMark = writingMinutes / totalMarks;

  const blocks = [];
  let offset = 0;

  if (readingMinutes > 0) {
    blocks.push({
      id: "reading",
      name: "Reading time",
      kind: "reading",
      marks: 0,
      minutes: readingMinutes,
      startMin: 0,
      endMin: readingMinutes,
      startClock: formatClock(startMin),
      endClock: formatClock(startMin + readingMinutes),
      bed: "silence",
      warningAtMin: null,
      tight: false,
      minutesPerMark: null,
    });
    offset = readingMinutes;
  }

  sections.forEach((section, index) => {
    const minutes = allocated[index];
    const start = offset;
    const end = offset + minutes;
    const bed = SOUND_BEDS[section?.bed] ? section.bed : "brown";
    blocks.push({
      id: `section-${index}`,
      name: section?.name?.trim() || `Section ${index + 1}`,
      kind: "section",
      marks: marksList[index],
      minutes,
      startMin: start,
      endMin: end,
      startClock: formatClock(startMin + start),
      endClock: formatClock(startMin + end),
      bed,
      warningAtMin: minutes > warningLeadMin ? end - warningLeadMin : null,
      tight: minutes < MIN_BLOCK_MINUTES,
      minutesPerMark: marksList[index] > 0 ? minutes / marksList[index] : null,
    });
    offset = end;
  });

  if (reviewMinutes > 0) {
    blocks.push({
      id: "review",
      name: "Check and fix",
      kind: "review",
      marks: 0,
      minutes: reviewMinutes,
      startMin: offset,
      endMin: offset + reviewMinutes,
      startClock: formatClock(startMin + offset),
      endClock: formatClock(startMin + offset + reviewMinutes),
      bed: "silence",
      warningAtMin: null,
      tight: false,
      minutesPerMark: null,
    });
    offset += reviewMinutes;
  }

  const cues = [];
  for (const block of blocks) {
    cues.push({ atMin: block.startMin, type: "start", blockId: block.id, label: `Start ${block.name}` });
    if (block.warningAtMin !== null) {
      cues.push({
        atMin: block.warningAtMin,
        type: "warning",
        blockId: block.id,
        label: `${warningLeadMin} min left on ${block.name}`,
      });
    }
  }
  cues.push({ atMin: offset, type: "end", blockId: "finish", label: "Pens down" });
  cues.sort((a, b) => a.atMin - b.atMin);

  const tightSections = blocks.filter((block) => block.tight).map((block) => block.name);

  return {
    blocks,
    cues,
    totalMarks,
    totalMinutes,
    writingMinutes,
    readingMinutes,
    reviewMinutes,
    minutesPerMark,
    secondsPerMark: minutesPerMark * 60,
    startMin,
    endMin: startMin + offset,
    startClock: formatClock(startMin),
    finishClock: formatClock(startMin + offset),
    scheduledMinutes: offset,
    tightSections,
    warningLeadMin,
  };
}

/** Elapsed seconds expressed in minutes, for lookups against the plan. */
export function minutesFromSeconds(seconds) {
  if (!isNum(seconds) || seconds < 0) return 0;
  return seconds / 60;
}

/** Seconds left in the whole paper, floored at zero. */
export function secondsLeftInPaper(scheduledMinutes, elapsedSeconds) {
  if (!isNum(scheduledMinutes) || !isNum(elapsedSeconds)) return 0;
  return Math.max(0, scheduledMinutes * 60 - elapsedSeconds);
}

/** Seconds left in the block currently running, floored at zero. */
export function secondsLeftInBlock(block, elapsedSeconds) {
  if (!block || !isNum(block.endMin) || !isNum(elapsedSeconds)) return 0;
  return Math.max(0, block.endMin * 60 - elapsedSeconds);
}

/**
 * True once the timer has reached a cue. Half a second of tolerance stops a
 * one-second tick from stepping straight over a cue that lands mid-second.
 */
export function cueIsDue(cueAtMin, elapsedSeconds) {
  if (!isNum(cueAtMin) || !isNum(elapsedSeconds)) return false;
  return elapsedSeconds + 0.5 >= cueAtMin * 60;
}

/** Which block covers a given elapsed minute. Used by the running timer. */
export function blockAtElapsed(blocks, elapsedMin) {
  if (!Array.isArray(blocks) || !isNum(elapsedMin)) return null;
  for (const block of blocks) {
    if (elapsedMin >= block.startMin && elapsedMin < block.endMin) return block;
  }
  return null;
}

/** Deterministic PRNG so the same block always produces the same bed. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Shaped noise samples in [-1, 1] for the sound bed.
 * -3 dB/octave uses Paul Kellet's pink filter (a 1/f approximation);
 * -6 dB/octave uses a leaky integrator (1/f^2, "brown"); values in between
 * blend the two. Pure — the component copies these into an AudioBuffer.
 */
export function generateBedSamples(length, slopeDbPerOctave = -6, seed = 11) {
  const count = Math.floor(length);
  if (!Number.isInteger(count) || count <= 0 || count > 5000000) return null;
  const slope = isNum(slopeDbPerOctave) ? Math.max(-6, Math.min(-3, slopeDbPerOctave)) : -6;
  const brownMix = (-slope - 3) / 3;
  const rand = mulberry32(seed);
  const out = new Float32Array(count);
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  let brown = 0;
  let peak = 0;

  for (let i = 0; i < count; i += 1) {
    const white = rand() * 2 - 1;
    b0 = 0.99765 * b0 + white * 0.099046;
    b1 = 0.963 * b1 + white * 0.2965164;
    b2 = 0.57 * b2 + white * 1.0526913;
    const pink = (b0 + b1 + b2 + white * 0.1848) * 0.16;
    brown = (brown + white * 0.02) / 1.02;
    const value = pink * (1 - brownMix) + brown * 3.5 * brownMix;
    out[i] = value;
    const magnitude = Math.abs(value);
    if (magnitude > peak) peak = magnitude;
  }
  if (peak > 0) {
    const scale = 1 / peak;
    for (let i = 0; i < count; i += 1) out[i] *= scale;
  }
  return out;
}

/** Amplitude multiplier for a dB level: gain = 10^(dB/20), clamped to [0, 1]. */
export function gainFromDb(levelDb) {
  if (!isNum(levelDb)) return 0;
  const gain = Math.pow(10, levelDb / 20);
  if (!Number.isFinite(gain)) return 0;
  return Math.min(1, Math.max(0, gain));
}

/** mm:ss for the countdown display. */
export function formatCountdown(totalSeconds) {
  if (!isNum(totalSeconds) || totalSeconds < 0) return "00:00";
  const whole = Math.floor(totalSeconds);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const seconds = whole % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}
