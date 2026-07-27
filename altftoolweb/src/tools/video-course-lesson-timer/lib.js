/**
 * Video course lesson planning.
 *
 * Length guidance comes from Guo, Kim and Rubin, "How video production affects student
 * engagement" (ACM Learning at Scale, 2014), which measured median engagement across
 * millions of MOOC video views. The headline findings used here:
 *   - Videos of 6 minutes or less were watched close to all the way through.
 *   - Engagement fell steadily beyond that, with 9-12 minute videos holding only about
 *     half the viewer and longer videos less again.
 * The engagement estimate below is a stepwise approximation of those reported bands, not
 * a reproduction of the study's curve, and real retention depends on subject and audience.
 *
 * Script length uses an instructional speaking pace of 130-150 words per minute, slower
 * than conversational speech because on-screen demonstration needs pauses.
 */

/** Length bands and what the research says about each. */
export const LENGTH_BANDS = [
  { maxMinutes: 6, id: "ideal", label: "Ideal", note: "Watched close to the end by most viewers." },
  { maxMinutes: 9, id: "good", label: "Acceptable", note: "Engagement starts to fall away." },
  { maxMinutes: 12, id: "watch", label: "Watch it", note: "Around half the viewer is typically lost." },
  { maxMinutes: Infinity, id: "split", label: "Split it", note: "Long enough that most viewers stop before the end." },
];

/** Retention fractions applied to each slice of a lesson, from the engagement bands above. */
const ENGAGEMENT_SLICES = [
  { upTo: 6, retention: 1 },
  { upTo: 9, retention: 0.7 },
  { upTo: 12, retention: 0.5 },
  { upTo: Infinity, retention: 0.3 },
];

/** Default target length for a single lesson, in minutes. */
export const DEFAULT_TARGET_MINUTES = 6;

/** Instructional speaking pace in words per minute. */
export const DEFAULT_WPM = 140;
export const MIN_WPM = 80;
export const MAX_WPM = 220;

/** Default hours of editing per finished minute of video. */
export const DEFAULT_EDIT_RATIO = 4;

/** Format minutes as "1h 23m". */
export function formatHoursMinutes(totalMinutes) {
  if (!Number.isFinite(totalMinutes) || totalMinutes < 0) return "—";
  const rounded = Math.round(totalMinutes);
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

/** The band a lesson of a given length falls into. */
export function bandFor(minutes) {
  const value = Number(minutes);
  if (!Number.isFinite(value) || value <= 0) return LENGTH_BANDS[0];
  return LENGTH_BANDS.find((band) => value <= band.maxMinutes) || LENGTH_BANDS[LENGTH_BANDS.length - 1];
}

/** Estimated minutes actually watched, from the stepwise engagement model. */
export function estimatedWatchedMinutes(minutes) {
  const value = Number(minutes);
  if (!Number.isFinite(value) || value <= 0) return 0;
  let watched = 0;
  let previous = 0;
  for (const slice of ENGAGEMENT_SLICES) {
    const top = Math.min(value, slice.upTo);
    if (top > previous) watched += (top - previous) * slice.retention;
    previous = top;
    if (previous >= value) break;
  }
  return watched;
}

/** How many parts a lesson should be split into to reach the target length. */
export function splitInto(minutes, targetMinutes = DEFAULT_TARGET_MINUTES) {
  const value = Number(minutes);
  const target = Number(targetMinutes);
  if (!Number.isFinite(value) || value <= 0) return 1;
  if (!Number.isFinite(target) || target <= 0) return 1;
  return Math.max(1, Math.ceil(value / target));
}

function median(values) {
  if (values.length === 0) return null;
  const sorted = values.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

/**
 * Plan a whole course.
 * @param {object} input
 * @param {{id:string,title:string,module:string,minutes:number}[]} input.lessons
 * @returns {object} plan or { error }
 */
export function planCourse({
  lessons = [],
  targetMinutes = DEFAULT_TARGET_MINUTES,
  wordsPerMinute = DEFAULT_WPM,
  editHoursPerMinute = DEFAULT_EDIT_RATIO,
} = {}) {
  if (!Array.isArray(lessons) || lessons.length === 0) {
    return { error: "Add at least one lesson to plan the course." };
  }
  if (lessons.length > 500) return { error: "Keep the plan to 500 lessons or fewer." };

  const target = Number(targetMinutes);
  if (!Number.isFinite(target) || target <= 0 || target > 120) {
    return { error: "Target lesson length must be between 0 and 120 minutes." };
  }

  const wpm = Number(wordsPerMinute);
  if (!Number.isFinite(wpm) || wpm < MIN_WPM || wpm > MAX_WPM) {
    return { error: `Speaking pace should be between ${MIN_WPM} and ${MAX_WPM} words per minute.` };
  }

  const editRatio = Number(editHoursPerMinute);
  if (!Number.isFinite(editRatio) || editRatio < 0 || editRatio > 50) {
    return { error: "Editing hours per finished minute must be between 0 and 50." };
  }

  const rows = [];
  for (const lesson of lessons) {
    const minutes = Number(lesson && lesson.minutes);
    if (!Number.isFinite(minutes)) {
      return { error: `Lesson "${(lesson && lesson.title) || "untitled"}" needs a length in minutes.` };
    }
    if (minutes <= 0) {
      return { error: `Lesson "${(lesson && lesson.title) || "untitled"}" must be longer than zero minutes.` };
    }
    if (minutes > 600) {
      return { error: `Lesson "${(lesson && lesson.title) || "untitled"}" is longer than 10 hours — check the figure.` };
    }
    const band = bandFor(minutes);
    rows.push({
      id: String((lesson && lesson.id) || `${rows.length + 1}`),
      title: String((lesson && lesson.title) || `Lesson ${rows.length + 1}`),
      module: String((lesson && lesson.module) || "Module 1"),
      minutes,
      band,
      watchedMinutes: estimatedWatchedMinutes(minutes),
      scriptWords: Math.round(minutes * wpm),
      splitInto: splitInto(minutes, target),
      overTarget: minutes > target,
    });
  }

  const totalMinutes = rows.reduce((sum, row) => sum + row.minutes, 0);
  const watchedMinutes = rows.reduce((sum, row) => sum + row.watchedMinutes, 0);
  const lengths = rows.map((row) => row.minutes);

  const moduleMap = new Map();
  for (const row of rows) {
    const current = moduleMap.get(row.module) || { name: row.module, lessons: 0, minutes: 0 };
    current.lessons += 1;
    current.minutes += row.minutes;
    moduleMap.set(row.module, current);
  }
  const modules = Array.from(moduleMap.values()).map((entry) => ({
    ...entry,
    share: totalMinutes > 0 ? (entry.minutes / totalMinutes) * 100 : 0,
    averageLesson: entry.lessons > 0 ? entry.minutes / entry.lessons : 0,
  }));

  const longest = rows.reduce((best, row) => (row.minutes > best.minutes ? row : best), rows[0]);
  const shortest = rows.reduce((best, row) => (row.minutes < best.minutes ? row : best), rows[0]);

  return {
    rows,
    modules,
    lessonCount: rows.length,
    totalMinutes,
    totalHours: totalMinutes / 60,
    averageLesson: totalMinutes / rows.length,
    medianLesson: median(lengths),
    longest,
    shortest,
    overTargetCount: rows.filter((row) => row.overTarget).length,
    splitCount: rows.filter((row) => row.band.id === "split").length,
    watchedMinutes,
    retentionPercent: totalMinutes > 0 ? (watchedMinutes / totalMinutes) * 100 : 0,
    scriptWords: Math.round(totalMinutes * wpm),
    editHours: totalMinutes * editRatio,
    extraLessonsIfSplit: rows.reduce((sum, row) => sum + (row.splitInto - 1), 0),
    targetMinutes: target,
    wordsPerMinute: wpm,
  };
}

/** Plain-text export of the plan. */
export function planToText(plan, courseName = "") {
  if (!plan || plan.error) return "No course plan yet.";
  const lines = [courseName ? `Course plan — ${courseName}` : "Course plan", ""];
  lines.push(`Lessons: ${plan.lessonCount}`);
  lines.push(`Total runtime: ${formatHoursMinutes(plan.totalMinutes)}`);
  lines.push(`Average lesson: ${plan.averageLesson.toFixed(1)} min (median ${plan.medianLesson.toFixed(1)})`);
  lines.push(`Lessons over the ${plan.targetMinutes} minute target: ${plan.overTargetCount}`);
  lines.push(`Estimated watched time: ${formatHoursMinutes(plan.watchedMinutes)} (${plan.retentionPercent.toFixed(0)}%)`);
  lines.push(`Script length at ${plan.wordsPerMinute} wpm: ${plan.scriptWords} words`);
  lines.push(`Editing estimate: ${plan.editHours.toFixed(1)} hours`);
  lines.push("");
  for (const courseModule of plan.modules) {
    lines.push(`${courseModule.name} — ${courseModule.lessons} lessons, ${formatHoursMinutes(courseModule.minutes)}`);
    for (const row of plan.rows.filter((lesson) => lesson.module === courseModule.name)) {
      lines.push(`  ${row.title} — ${row.minutes} min (${row.band.label})`);
    }
    lines.push("");
  }
  return lines.join("\n");
}
