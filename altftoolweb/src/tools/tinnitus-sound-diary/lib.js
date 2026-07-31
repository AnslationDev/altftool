/**
 * Tinnitus sound diary — record keeping and descriptive statistics.
 *
 * This is a self-monitoring log, not a diagnostic instrument. Two conventions are followed:
 *  - Loudness and annoyance are each rated on a 0-10 visual analogue scale, the rating
 *    format routinely used in tinnitus clinics and research alongside validated
 *    questionnaires such as the Tinnitus Handicap Inventory (THI) and the Tinnitus
 *    Functional Index (TFI). This tool does not compute THI or TFI scores.
 *  - The red-flag list mirrors the features that hearing guidance (for example NICE
 *    guideline NG155 on tinnitus assessment and management) treats as needing prompt
 *    professional assessment rather than watchful waiting.
 *
 * All statistics here are descriptive. A difference between days with and without a
 * suspected trigger is an association in your own log, not evidence of cause.
 */

/** Rating scale used for both loudness and annoyance. */
export const SCALE_MIN = 0;
export const SCALE_MAX = 10;

/** Minimum entries before a trend line is worth showing. */
export const MIN_ENTRIES_FOR_TREND = 4;

/** Minimum days in each group before a trigger comparison is shown. */
export const MIN_DAYS_PER_TRIGGER_GROUP = 2;

/** Commonly logged possible triggers. Association only — none of these is a proven cause. */
export const TRIGGERS = [
  { id: "loudnoise", label: "Loud noise exposure" },
  { id: "poorsleep", label: "Poor or short sleep" },
  { id: "stress", label: "High stress day" },
  { id: "caffeine", label: "Caffeine" },
  { id: "alcohol", label: "Alcohol" },
  { id: "salt", label: "Salty food" },
  { id: "congestion", label: "Cold, congestion or allergy" },
  { id: "jaw", label: "Jaw or neck tension" },
  { id: "medication", label: "Medication change" },
  { id: "exercise", label: "Hard exercise" },
];

/** Descriptions of the sound, for pattern-spotting rather than scoring. */
export const SOUND_TYPES = [
  { id: "ringing", label: "Ringing / tone" },
  { id: "hissing", label: "Hissing" },
  { id: "buzzing", label: "Buzzing" },
  { id: "roaring", label: "Roaring" },
  { id: "clicking", label: "Clicking" },
  { id: "pulsing", label: "Pulsing in time with heartbeat" },
];

/** Which ear the sound is in. */
export const EAR_OPTIONS = [
  { id: "both", label: "Both ears" },
  { id: "left", label: "Left only" },
  { id: "right", label: "Right only" },
  { id: "head", label: "Inside the head" },
];

/** Features that warrant prompt professional assessment. */
export const RED_FLAGS = [
  {
    id: "pulsatile",
    label: "The sound pulses in time with your heartbeat",
    advice:
      "Pulsatile tinnitus can have a treatable vascular cause and is usually assessed rather than monitored. Ask your doctor for an assessment.",
  },
  {
    id: "unilateral",
    label: "It is in one ear only",
    advice:
      "One-sided tinnitus is normally investigated to rule out a cause specific to that ear. Mention it to your doctor.",
  },
  {
    id: "suddenloss",
    label: "Hearing dropped suddenly in the last 30 days",
    advice:
      "Sudden hearing loss is treated as an emergency in most hearing guidance — seek same-day medical care.",
  },
  {
    id: "vertigo",
    label: "Spinning dizziness or balance problems",
    advice: "Tinnitus with vertigo needs assessment rather than self-monitoring. Contact your doctor.",
  },
  {
    id: "painDischarge",
    label: "Ear pain, discharge or a recent injury",
    advice: "Pain, discharge or injury should be seen by a clinician promptly.",
  },
  {
    id: "distress",
    label: "It is causing severe distress or affecting your safety",
    advice:
      "Severe distress is a reason to seek help now, not to keep logging. Contact your doctor or a local urgent helpline.",
  },
];

/** Today's date as an ISO yyyy-mm-dd string, in the browser's local time zone. */
export function todayIso() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/** Convert an ISO yyyy-mm-dd date to a whole number of days, for ordering and regression. */
export function isoToDayNumber(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const stamp = Date.UTC(year, month - 1, day);
  if (!Number.isFinite(stamp)) return null;
  const check = new Date(stamp);
  if (check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null;
  return Math.round(stamp / 86400000);
}

/**
 * Validate a single diary entry.
 * @returns {object} normalised entry or { error }
 */
export function validateEntry({
  date,
  loudness,
  annoyance,
  ear = "both",
  soundType = "ringing",
  triggers = [],
  sleepHours = null,
  note = "",
} = {}) {
  const dayNumber = isoToDayNumber(date);
  if (dayNumber === null) return { error: "Pick a valid date for this entry." };

  const todayDayNumber = isoToDayNumber(todayIso());
  if (todayDayNumber !== null && dayNumber > todayDayNumber) {
    return { error: "Entry date cannot be later than today." };
  }

  const loud = Number(loudness);
  const annoy = Number(annoyance);
  if (!Number.isFinite(loud) || loud < SCALE_MIN || loud > SCALE_MAX) {
    return { error: `Loudness must be between ${SCALE_MIN} and ${SCALE_MAX}.` };
  }
  if (!Number.isFinite(annoy) || annoy < SCALE_MIN || annoy > SCALE_MAX) {
    return { error: `Annoyance must be between ${SCALE_MIN} and ${SCALE_MAX}.` };
  }

  let sleep = null;
  if (sleepHours !== null && sleepHours !== "" && sleepHours !== undefined) {
    sleep = Number(sleepHours);
    if (!Number.isFinite(sleep) || sleep < 0 || sleep > 24) {
      return { error: "Sleep must be between 0 and 24 hours." };
    }
  }

  const validTriggers = Array.isArray(triggers)
    ? triggers.filter((id) => TRIGGERS.some((trigger) => trigger.id === id))
    : [];

  return {
    date: String(date),
    dayNumber,
    loudness: loud,
    annoyance: annoy,
    ear: EAR_OPTIONS.some((option) => option.id === ear) ? ear : "both",
    soundType: SOUND_TYPES.some((option) => option.id === soundType) ? soundType : "ringing",
    triggers: validTriggers,
    sleepHours: sleep,
    note: String(note).slice(0, 500),
  };
}

function mean(values) {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/** Least-squares slope of y against x. Returns null when x has no spread. */
export function linearSlope(points) {
  if (!Array.isArray(points) || points.length < 2) return null;
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const xBar = mean(xs);
  const yBar = mean(ys);
  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < points.length; i += 1) {
    const dx = xs[i] - xBar;
    numerator += dx * (ys[i] - yBar);
    denominator += dx * dx;
  }
  if (!(denominator > 0)) return null;
  return numerator / denominator;
}

/**
 * Descriptive summary of the diary.
 * @param {object[]} entries validated entries
 * @returns {object} summary or { error }
 */
export function summariseDiary(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return { error: "Add at least one entry to see a summary." };
  }

  const sorted = entries.slice().sort((a, b) => a.dayNumber - b.dayNumber);
  const loudness = sorted.map((entry) => entry.loudness);
  const annoyance = sorted.map((entry) => entry.annoyance);
  const latestDay = sorted[sorted.length - 1].dayNumber;

  const last7 = sorted.filter((entry) => entry.dayNumber > latestDay - 7);
  const prev7 = sorted.filter(
    (entry) => entry.dayNumber <= latestDay - 7 && entry.dayNumber > latestDay - 14,
  );

  const slope =
    sorted.length >= MIN_ENTRIES_FOR_TREND
      ? linearSlope(sorted.map((entry) => ({ x: entry.dayNumber, y: entry.loudness })))
      : null;

  let worst = sorted[0];
  let best = sorted[0];
  for (const entry of sorted) {
    if (entry.loudness > worst.loudness) worst = entry;
    if (entry.loudness < best.loudness) best = entry;
  }

  const sleepValues = sorted
    .filter((entry) => entry.sleepHours !== null)
    .map((entry) => entry.sleepHours);

  const spanDays = latestDay - sorted[0].dayNumber + 1;

  return {
    count: sorted.length,
    spanDays,
    coverage: spanDays > 0 ? (sorted.length / spanDays) * 100 : 0,
    meanLoudness: mean(loudness),
    meanAnnoyance: mean(annoyance),
    last7Mean: mean(last7.map((entry) => entry.loudness)),
    last7Count: last7.length,
    prev7Mean: prev7.length > 0 ? mean(prev7.map((entry) => entry.loudness)) : null,
    weekOverWeekChange:
      prev7.length > 0 ? mean(last7.map((e) => e.loudness)) - mean(prev7.map((e) => e.loudness)) : null,
    trendPerWeek: slope === null ? null : slope * 7,
    worst,
    best,
    meanSleepHours: sleepValues.length > 0 ? mean(sleepValues) : null,
    firstDate: sorted[0].date,
    lastDate: sorted[sorted.length - 1].date,
    sorted,
  };
}

/**
 * For each trigger, compare mean loudness on days it was logged against days it was not.
 * Descriptive only — a difference is an association, not a cause.
 * @returns {object[]} one row per trigger with enough data on both sides
 */
export function triggerAssociations(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return [];

  return TRIGGERS.map((trigger) => {
    const withTrigger = entries.filter((entry) => entry.triggers.includes(trigger.id));
    const withoutTrigger = entries.filter((entry) => !entry.triggers.includes(trigger.id));
    if (
      withTrigger.length < MIN_DAYS_PER_TRIGGER_GROUP ||
      withoutTrigger.length < MIN_DAYS_PER_TRIGGER_GROUP
    ) {
      return {
        id: trigger.id,
        label: trigger.label,
        enoughData: false,
        withCount: withTrigger.length,
        withoutCount: withoutTrigger.length,
      };
    }
    const withMean = mean(withTrigger.map((entry) => entry.loudness));
    const withoutMean = mean(withoutTrigger.map((entry) => entry.loudness));
    return {
      id: trigger.id,
      label: trigger.label,
      enoughData: true,
      withCount: withTrigger.length,
      withoutCount: withoutTrigger.length,
      withMean,
      withoutMean,
      difference: withMean - withoutMean,
    };
  })
    .filter((row) => row.withCount > 0)
    .sort((a, b) => {
      if (a.enoughData !== b.enoughData) return a.enoughData ? -1 : 1;
      if (!a.enoughData) return 0;
      return Math.abs(b.difference) - Math.abs(a.difference);
    });
}

/** Which red flags are ticked, with the guidance for each. */
export function checkRedFlags(flags) {
  const ticked = flags && typeof flags === "object" ? flags : {};
  return RED_FLAGS.filter((flag) => ticked[flag.id] === true);
}

/** Plain-text export suitable for taking to an appointment. */
export function diaryToText(entries, summary) {
  if (!Array.isArray(entries) || entries.length === 0) return "Tinnitus diary — no entries yet.";
  const lines = ["Tinnitus sound diary", ""];
  if (summary && !summary.error) {
    lines.push(`Entries: ${summary.count} over ${summary.spanDays} days`);
    lines.push(`Mean loudness: ${summary.meanLoudness.toFixed(1)} / 10`);
    lines.push(`Mean annoyance: ${summary.meanAnnoyance.toFixed(1)} / 10`);
    if (summary.last7Mean !== null) lines.push(`Last 7 days mean loudness: ${summary.last7Mean.toFixed(1)}`);
    if (summary.trendPerWeek !== null) {
      lines.push(`Trend: ${summary.trendPerWeek >= 0 ? "+" : ""}${summary.trendPerWeek.toFixed(2)} points per week`);
    }
    lines.push("");
  }
  lines.push("Date | Loudness | Annoyance | Ear | Sound | Triggers | Sleep | Note");
  for (const entry of entries.slice().sort((a, b) => b.dayNumber - a.dayNumber)) {
    const triggerLabels = entry.triggers
      .map((id) => (TRIGGERS.find((trigger) => trigger.id === id) || {}).label)
      .filter(Boolean)
      .join("; ");
    lines.push(
      [
        entry.date,
        entry.loudness,
        entry.annoyance,
        entry.ear,
        entry.soundType,
        triggerLabels || "none",
        entry.sleepHours === null ? "-" : `${entry.sleepHours}h`,
        entry.note || "",
      ].join(" | "),
    );
  }
  lines.push("");
  lines.push("Self-recorded log. Not a diagnosis and not a substitute for professional assessment.");
  return lines.join("\n");
}
