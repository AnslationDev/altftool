/**
 * Practice-log maths: tempo descriptions, log summaries and tempo ladders.
 * All functions are pure — dates are passed in, never read from the clock.
 */

/** Slowest and fastest tempos a practice log realistically holds. */
export const MIN_BPM = 20;
export const MAX_BPM = 300;

/** The traditional Maelzel mechanical metronome scale runs 40-208 BPM. */
export const MAELZEL_MIN_BPM = 40;
export const MAELZEL_MAX_BPM = 208;

/** Longest single logged block accepted, in minutes (24 hours). */
export const MAX_SESSION_MINUTES = 1440;

const MS_PER_MINUTE = 60000;
const MS_PER_DAY = 86400000;

/**
 * Conventional Italian tempo markings with their commonly published BPM bands.
 * Ranges are the widely used performance-practice conventions, not a legal standard;
 * editions differ by a few beats at the boundaries.
 */
export const TEMPO_MARKINGS = [
  { name: "Grave", min: 20, max: 40, note: "Very slow and solemn" },
  { name: "Largo", min: 40, max: 60, note: "Broad" },
  { name: "Larghetto", min: 60, max: 66, note: "Rather broad" },
  { name: "Adagio", min: 66, max: 76, note: "Slow and stately" },
  { name: "Andante", min: 76, max: 108, note: "Walking pace" },
  { name: "Moderato", min: 108, max: 120, note: "Moderate" },
  { name: "Allegro", min: 120, max: 168, note: "Fast and bright" },
  { name: "Presto", min: 168, max: 200, note: "Very fast" },
  { name: "Prestissimo", min: 200, max: 300, note: "As fast as possible" },
];

/** Common note-value subdivisions of one beat. */
export const SUBDIVISIONS = [
  { name: "Quarter (the beat)", perBeat: 1 },
  { name: "Eighths", perBeat: 2 },
  { name: "Triplets", perBeat: 3 },
  { name: "Sixteenths", perBeat: 4 },
  { name: "Sextuplets", perBeat: 6 },
];

function isIsoDate(text) {
  const match = typeof text === "string" ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(text) : null;
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
  );
}

function dayNumber(isoDate) {
  return Math.round(Date.parse(`${isoDate}T00:00:00Z`) / MS_PER_DAY);
}

/** Round to a fixed number of decimals without ever producing -0 or NaN. */
function round(value, decimals) {
  if (!Number.isFinite(value)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor + 0;
}

/**
 * Describe a tempo: its Italian marking, the millisecond gap between clicks,
 * how many clicks a minute of practice produces, and subdivision timings.
 */
export function describeTempo(bpm, beatsPerBar = 4) {
  const tempo = Number(bpm);
  const bar = Number(beatsPerBar);
  if (!Number.isFinite(tempo) || tempo < MIN_BPM || tempo > MAX_BPM) {
    return { error: `Tempo must be between ${MIN_BPM} and ${MAX_BPM} BPM.` };
  }
  if (!Number.isFinite(bar) || bar < 1 || bar > 16 || !Number.isInteger(bar)) {
    return { error: "Beats per bar must be a whole number from 1 to 16." };
  }

  const marking =
    TEMPO_MARKINGS.find((band) => tempo >= band.min && tempo < band.max) ||
    TEMPO_MARKINGS[TEMPO_MARKINGS.length - 1];

  const beatMs = MS_PER_MINUTE / tempo;

  return {
    bpm: tempo,
    marking: marking.name,
    markingNote: marking.note,
    beatMs: round(beatMs, 2),
    barSeconds: round((beatMs * bar) / 1000, 3),
    barsPerMinute: round(tempo / bar, 2),
    withinMaelzelRange: tempo >= MAELZEL_MIN_BPM && tempo <= MAELZEL_MAX_BPM,
    subdivisions: SUBDIVISIONS.map((item) => ({
      name: item.name,
      perMinute: round(tempo * item.perBeat, 1),
      noteMs: round(beatMs / item.perBeat, 2),
    })),
  };
}

/**
 * Summarise a practice log.
 * @param {Array<{date:string, exercise:string, bpm:number, minutes:number}>} entries
 * @param {string} todayIso reference date "YYYY-MM-DD" for streak counting
 */
export function summarisePractice(entries, todayIso) {
  if (!Array.isArray(entries)) return { error: "The practice log must be a list of entries." };
  if (!isIsoDate(todayIso)) return { error: "Reference date must be a valid YYYY-MM-DD date." };

  const clean = [];
  let skipped = 0;

  for (const entry of entries) {
    const bpm = Number(entry?.bpm);
    const minutes = Number(entry?.minutes);
    const exercise = typeof entry?.exercise === "string" ? entry.exercise.trim() : "";
    if (
      !isIsoDate(entry?.date) ||
      !exercise ||
      !Number.isFinite(bpm) ||
      bpm < MIN_BPM ||
      bpm > MAX_BPM ||
      !Number.isFinite(minutes) ||
      minutes <= 0 ||
      minutes > MAX_SESSION_MINUTES
    ) {
      skipped += 1;
      continue;
    }
    clean.push({ date: entry.date, exercise, bpm, minutes });
  }

  if (clean.length === 0) {
    return {
      isEmpty: true,
      skipped,
      totalMinutes: 0,
      totalHours: 0,
      sessionCount: 0,
      dayCount: 0,
      averageMinutesPerDay: 0,
      weightedAverageBpm: 0,
      fastestBpm: 0,
      currentStreak: 0,
      longestStreak: 0,
      exercises: [],
      days: [],
    };
  }

  clean.sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? -1 : 1));

  const totalMinutes = clean.reduce((sum, item) => sum + item.minutes, 0);
  const bpmMinuteProduct = clean.reduce((sum, item) => sum + item.bpm * item.minutes, 0);

  // Per-day totals.
  const dayMap = new Map();
  for (const item of clean) {
    const current = dayMap.get(item.date) || { date: item.date, minutes: 0, blocks: 0 };
    current.minutes += item.minutes;
    current.blocks += 1;
    dayMap.set(item.date, current);
  }
  const days = [...dayMap.values()].sort((a, b) => (a.date < b.date ? -1 : 1));

  // Per-exercise totals; first/last BPM come from the chronological order above.
  const exerciseMap = new Map();
  for (const item of clean) {
    const current = exerciseMap.get(item.exercise) || {
      exercise: item.exercise,
      minutes: 0,
      blocks: 0,
      firstBpm: item.bpm,
      lastBpm: item.bpm,
      slowestBpm: item.bpm,
      fastestBpm: item.bpm,
      bpmMinutes: 0,
      firstDate: item.date,
      lastDate: item.date,
    };
    current.minutes += item.minutes;
    current.blocks += 1;
    current.lastBpm = item.bpm;
    current.lastDate = item.date;
    current.slowestBpm = Math.min(current.slowestBpm, item.bpm);
    current.fastestBpm = Math.max(current.fastestBpm, item.bpm);
    current.bpmMinutes += item.bpm * item.minutes;
    exerciseMap.set(item.exercise, current);
  }

  const exercises = [...exerciseMap.values()]
    .map((item) => ({
      ...item,
      shareOfMinutes: round((item.minutes / totalMinutes) * 100, 1),
      averageBpm: round(item.bpmMinutes / item.minutes, 1),
      bpmGain: item.lastBpm - item.firstBpm,
      bpmGainPercent: round(((item.lastBpm - item.firstBpm) / item.firstBpm) * 100, 1),
    }))
    .sort((a, b) => b.minutes - a.minutes);

  // Streaks: a day counts if it holds at least one valid block.
  const dayNumbers = days.map((day) => dayNumber(day.date));
  let longestStreak = 1;
  let running = 1;
  for (let i = 1; i < dayNumbers.length; i += 1) {
    running = dayNumbers[i] - dayNumbers[i - 1] === 1 ? running + 1 : 1;
    if (running > longestStreak) longestStreak = running;
  }

  // Current streak counts back from today, and still counts if today is a rest day
  // but yesterday was practised.
  const todayNumber = dayNumber(todayIso);
  const daySet = new Set(dayNumbers);
  let currentStreak = 0;
  let cursor = daySet.has(todayNumber) ? todayNumber : todayNumber - 1;
  while (daySet.has(cursor)) {
    currentStreak += 1;
    cursor -= 1;
  }

  const bestDay = days.reduce((best, day) => (day.minutes > best.minutes ? day : best), days[0]);
  const spanDays = dayNumbers[dayNumbers.length - 1] - dayNumbers[0] + 1;

  return {
    isEmpty: false,
    skipped,
    totalMinutes: round(totalMinutes, 1),
    totalHours: round(totalMinutes / 60, 2),
    sessionCount: clean.length,
    dayCount: days.length,
    spanDays,
    averageMinutesPerDay: round(totalMinutes / days.length, 1),
    averageMinutesPerCalendarDay: round(totalMinutes / spanDays, 1),
    weightedAverageBpm: round(bpmMinuteProduct / totalMinutes, 1),
    fastestBpm: clean.reduce((max, item) => Math.max(max, item.bpm), MIN_BPM),
    slowestBpm: clean.reduce((min, item) => Math.min(min, item.bpm), MAX_BPM),
    currentStreak,
    longestStreak,
    bestDay,
    firstDate: days[0].date,
    lastDate: days[days.length - 1].date,
    exercises,
    days,
  };
}

/**
 * Build a tempo ladder: the classic method of repeating a passage at a slow tempo
 * and nudging the metronome up by a fixed step until the target tempo is reached.
 */
export function buildTempoLadder({ startBpm, targetBpm, stepBpm, minutesPerStep } = {}) {
  const start = Number(startBpm);
  const target = Number(targetBpm);
  const step = Number(stepBpm);
  const minutes = Number(minutesPerStep);

  if (![start, target, step, minutes].every((value) => Number.isFinite(value))) {
    return { error: "Enter numbers for start tempo, target tempo, step size and minutes per step." };
  }
  if (start < MIN_BPM || start > MAX_BPM || target < MIN_BPM || target > MAX_BPM) {
    return { error: `Tempos must be between ${MIN_BPM} and ${MAX_BPM} BPM.` };
  }
  if (target <= start) return { error: "Target tempo must be faster than the starting tempo." };
  if (step <= 0) return { error: "Step size must be greater than zero." };
  if (minutes <= 0 || minutes > MAX_SESSION_MINUTES) {
    return { error: `Minutes per step must be between 0 and ${MAX_SESSION_MINUTES}.` };
  }

  const stepCount = Math.ceil((target - start) / step) + 1;
  if (stepCount > 200) {
    return { error: "That step size makes more than 200 rungs — use a bigger step." };
  }

  const steps = [];
  for (let index = 0; index < stepCount; index += 1) {
    const bpm = Math.min(target, start + index * step);
    steps.push({
      index: index + 1,
      bpm: round(bpm, 2),
      minutes,
      cumulativeMinutes: round(minutes * (index + 1), 1),
    });
  }

  return {
    steps,
    stepCount,
    totalMinutes: round(minutes * stepCount, 1),
    totalHours: round((minutes * stepCount) / 60, 2),
    gainBpm: round(target - start, 2),
    gainPercent: round(((target - start) / start) * 100, 1),
  };
}
