/**
 * Editing Time Estimator — task-based post-production schedule maths.
 *
 * The model is additive rather than a single "edit ratio" guess. Post time is
 * split into the tasks an editor actually books:
 *
 *   ingest/transcode  = raw minutes x ingest factor
 *   review/logging    = raw minutes x review factor        (watching the rushes)
 *   assembly          = cut count   x minutes per cut      (cut density drives this)
 *   colour grade      = finished minutes x grade rate
 *   motion graphics   = shot count  x minutes per graphic
 *   audio mix         = finished minutes x mix rate
 *   export/QC         = finished minutes x export rate
 *
 * Base hours are the sum; each revision round adds a fixed percentage of base.
 *
 * Every rate below is a widely used editorial rule of thumb and a form default —
 * all of them are user-editable, none are treated as fixed facts.
 *
 * Pure module — no React, no DOM, no clocks.
 */

/** Ingest, transcode and proxy generation, in minutes per raw footage minute. */
export const DEFAULT_INGEST_FACTOR = 0.5;

/** Watching and logging rushes. 1.5x real time allows for scrubbing and notes. */
export const DEFAULT_REVIEW_FACTOR = 1.5;

/** Cuts per finished minute. ~12 is a normal talking-head/corporate pace;
 *  fast social edits run 30+, long interviews and documentary run 4-8. */
export const DEFAULT_CUTS_PER_MINUTE = 12;

/** Minutes of editorial work per cut, including selects, trims and retimes. */
export const DEFAULT_MINUTES_PER_CUT = 1.5;

/** Colour grade minutes per finished minute (shot matching + a creative pass). */
export const DEFAULT_GRADE_RATE = 6;

/** Minutes to build one motion-graphic element (lower third, title, transition). */
export const DEFAULT_MINUTES_PER_GRAPHIC = 20;

/** Audio: clean-up, levels, music and mix, in minutes per finished minute. */
export const DEFAULT_AUDIO_RATE = 5;

/** Export, QC watch-down and delivery packaging per finished minute. */
export const DEFAULT_EXPORT_RATE = 3;

/** Each revision round is charged as this share of the base edit. */
export const DEFAULT_REVISION_SHARE_PCT = 15;

/** A realistic focused editing day; used to convert hours into working days. */
export const DEFAULT_HOURS_PER_DAY = 6;

/** Sanity ceilings so a typo cannot generate a nonsense schedule. */
export const MAX_RAW_MINUTES = 100000;
export const MAX_FINISHED_MINUTES = 6000;
export const MAX_REVISION_ROUNDS = 20;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

const FIELD_LABELS = {
  rawMinutes: "raw footage minutes",
  finishedMinutes: "finished runtime",
  ingestFactor: "ingest factor",
  reviewFactor: "review factor",
  cutsPerMinute: "cuts per finished minute",
  minutesPerCut: "minutes per cut",
  gradeRate: "grade minutes per finished minute",
  graphicsCount: "graphics count",
  minutesPerGraphic: "minutes per graphic",
  audioRate: "audio minutes per finished minute",
  exportRate: "export minutes per finished minute",
  revisionRounds: "revision rounds",
  revisionSharePct: "revision share",
  hoursPerDay: "editing hours per day",
  hourlyRate: "editor hourly rate",
};

/**
 * @param {object} input see FIELD_LABELS for the accepted keys (all numbers).
 * @returns {object} task breakdown and totals, or { error } for bad input.
 */
export function estimateEditingTime({
  rawMinutes,
  finishedMinutes,
  ingestFactor = DEFAULT_INGEST_FACTOR,
  reviewFactor = DEFAULT_REVIEW_FACTOR,
  cutsPerMinute = DEFAULT_CUTS_PER_MINUTE,
  minutesPerCut = DEFAULT_MINUTES_PER_CUT,
  gradeRate = DEFAULT_GRADE_RATE,
  graphicsCount = 0,
  minutesPerGraphic = DEFAULT_MINUTES_PER_GRAPHIC,
  audioRate = DEFAULT_AUDIO_RATE,
  exportRate = DEFAULT_EXPORT_RATE,
  revisionRounds = 0,
  revisionSharePct = DEFAULT_REVISION_SHARE_PCT,
  hoursPerDay = DEFAULT_HOURS_PER_DAY,
  hourlyRate = 0,
} = {}) {
  const values = {
    rawMinutes,
    finishedMinutes,
    ingestFactor,
    reviewFactor,
    cutsPerMinute,
    minutesPerCut,
    gradeRate,
    graphicsCount,
    minutesPerGraphic,
    audioRate,
    exportRate,
    revisionRounds,
    revisionSharePct,
    hoursPerDay,
    hourlyRate,
  };
  for (const [key, value] of Object.entries(values)) {
    if (!isNum(value)) return { error: `Enter a valid number for ${FIELD_LABELS[key]}.` };
    if (value < 0) return { error: `${FIELD_LABELS[key]} cannot be negative.` };
  }

  if (finishedMinutes <= 0) return { error: "Finished runtime must be greater than zero." };
  if (finishedMinutes > MAX_FINISHED_MINUTES) {
    return { error: `Finished runtime must be ${MAX_FINISHED_MINUTES} minutes or less.` };
  }
  if (rawMinutes > MAX_RAW_MINUTES) {
    return { error: `Raw footage must be ${MAX_RAW_MINUTES} minutes or less.` };
  }
  if (rawMinutes < finishedMinutes) {
    return { error: "Raw footage cannot be shorter than the finished runtime." };
  }
  if (revisionRounds > MAX_REVISION_ROUNDS) {
    return { error: `Revision rounds must be ${MAX_REVISION_ROUNDS} or fewer.` };
  }
  if (revisionSharePct > 100) {
    return { error: "A revision round cannot cost more than 100% of the base edit." };
  }
  if (hoursPerDay <= 0) return { error: "Editing hours per day must be greater than zero." };
  if (hoursPerDay > 24) return { error: "Editing hours per day cannot exceed 24." };

  const cuts = Math.round(cutsPerMinute * finishedMinutes);

  const tasks = [
    { key: "ingest", label: "Ingest & transcode", minutes: rawMinutes * ingestFactor },
    { key: "review", label: "Review & logging", minutes: rawMinutes * reviewFactor },
    { key: "assembly", label: "Assembly & fine cut", minutes: cuts * minutesPerCut },
    { key: "grade", label: "Colour grade", minutes: finishedMinutes * gradeRate },
    { key: "graphics", label: "Motion graphics", minutes: graphicsCount * minutesPerGraphic },
    { key: "audio", label: "Audio clean-up & mix", minutes: finishedMinutes * audioRate },
    { key: "export", label: "Export, QC & delivery", minutes: finishedMinutes * exportRate },
  ];

  const baseMinutes = tasks.reduce((sum, task) => sum + task.minutes, 0);
  const revisionMinutes = (baseMinutes * revisionSharePct * revisionRounds) / 100;
  const totalMinutes = baseMinutes + revisionMinutes;
  const totalHours = totalMinutes / 60;

  return {
    tasks: tasks.map((task) => ({
      ...task,
      hours: task.minutes / 60,
      share: baseMinutes > 0 ? (task.minutes / baseMinutes) * 100 : 0,
    })),
    cuts,
    baseMinutes,
    baseHours: baseMinutes / 60,
    revisionMinutes,
    revisionHours: revisionMinutes / 60,
    totalMinutes,
    totalHours,
    /** Minutes of editing per finished minute — the classic "edit ratio". */
    minutesPerFinishedMinute: totalMinutes / finishedMinutes,
    workingDays: totalHours / hoursPerDay,
    /** Shooting-ratio style figure: raw runtime divided by finished runtime. */
    footageRatio: finishedMinutes > 0 ? rawMinutes / finishedMinutes : 0,
    cost: hourlyRate > 0 ? totalHours * hourlyRate : null,
  };
}

/** Format a duration given in minutes as "9h 01m". Pure display helper. */
export function formatDuration(totalMinutes) {
  if (!isNum(totalMinutes) || totalMinutes < 0) return "—";
  const rounded = Math.round(totalMinutes);
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}
