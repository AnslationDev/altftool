/**
 * Student distraction log analysis.
 *
 * The tool counts distraction events per category over one study session and
 * reports the interruption rate per hour, the top three triggers, and an
 * estimate of study time lost:
 *
 *   time lost = total distractions × average minutes lost per distraction
 *
 * The default cost per distraction is a deliberately conservative 3 minutes
 * (roughly one minute of interaction plus a couple of minutes to re-enter the
 * problem). Task-switching research (e.g. Gloria Mark's interruption studies)
 * finds full refocusing after a major interruption can take far longer, so
 * the field lets you raise the figure for your own experience.
 */

/** Default minutes lost per distraction — conservative rubric, user adjustable. */
export const DEFAULT_MINUTES_LOST_PER_DISTRACTION = 3;

/** Categories with a concrete countermeasure each. */
export const DISTRACTION_CATEGORIES = [
  {
    id: "phone",
    label: "Phone notifications / checking",
    fix: "Keep the phone in another room or in a drawer on Do Not Disturb — out of sight, not just face down.",
  },
  {
    id: "social",
    label: "Social media / videos",
    fix: "Use a website blocker for the session and schedule a fixed scroll break after it.",
  },
  {
    id: "people",
    label: "Family / friends interrupting",
    fix: "Announce the block in advance and use a visible signal (closed door, headphones) that you are unavailable.",
  },
  {
    id: "noise",
    label: "Noise around you",
    fix: "Move sessions to the quietest available hour, or mask noise with earplugs or steady background sound.",
  },
  {
    id: "daydreaming",
    label: "Mind wandering / daydreaming",
    fix: "Park the thought on paper in one line and return; shorten the block if wandering starts early.",
  },
  {
    id: "hunger",
    label: "Hunger / thirst / fatigue",
    fix: "Eat and fill a water bottle before the block; do not study through obvious sleep debt.",
  },
  {
    id: "other",
    label: "Other",
    fix: "Write down exactly what pulled you away — a named trigger is a fixable trigger.",
  },
];

/**
 * Interruption-rate bands (distractions per hour) — this tool's rubric.
 * Under 2/hour leaves blocks of 30+ unbroken minutes (enough for deep work);
 * beyond 12/hour means an interruption every 5 minutes, so no depth at all.
 */
export const RATE_BANDS = [
  { maxPerHour: 2, id: "deep", label: "Deep focus — rarely interrupted" },
  { maxPerHour: 6, id: "workable", label: "Workable — but trimmable" },
  { maxPerHour: 12, id: "fragmented", label: "Fragmented — focus keeps breaking" },
  { maxPerHour: Infinity, id: "severe", label: "Severe — interrupted every few minutes" },
];

const round1 = (v) => Math.round(v * 10) / 10;

/**
 * Analyse a session's distraction log.
 *
 * @param {object} input
 * @param {Array<{category:string, count:number|string}>} input.entries
 * @param {number|string} input.studyMinutes  Session length in minutes.
 * @param {number|string} [input.minutesLostPerDistraction]
 * @returns {object} analysis, or { error }.
 */
export function analyseDistractions({
  entries,
  studyMinutes,
  minutesLostPerDistraction = DEFAULT_MINUTES_LOST_PER_DISTRACTION,
}) {
  const minutes = Number(studyMinutes);
  const costPer = Number(minutesLostPerDistraction);

  if (!Number.isFinite(minutes) || minutes <= 0) {
    return { error: "Session length must be more than zero minutes." };
  }
  if (minutes > 24 * 60) {
    return { error: "Session length cannot exceed 24 hours." };
  }
  if (!Number.isFinite(costPer)) {
    return { error: "Enter a minutes-lost-per-distraction value (0 or more)." };
  }
  if (costPer < 0) {
    return { error: "Minutes lost per distraction cannot be negative." };
  }
  if (!Array.isArray(entries) || entries.length === 0) {
    return { error: "Log at least one distraction category (0 counts are fine)." };
  }

  const byCategory = [];
  let total = 0;
  for (const entry of entries) {
    const category = DISTRACTION_CATEGORIES.find((c) => c.id === entry.category);
    if (!category) return { error: "Unknown distraction category in the log." };
    const count = Number(entry.count);
    if (!Number.isFinite(count) || count < 0 || !Number.isInteger(count)) {
      return { error: `Count for "${category.label}" must be a whole number of 0 or more.` };
    }
    byCategory.push({ id: category.id, label: category.label, fix: category.fix, count });
    total += count;
  }

  const perHour = round1(total / (minutes / 60));
  const band = RATE_BANDS.find((b) => perHour < b.maxPerHour) ?? RATE_BANDS[RATE_BANDS.length - 1];

  const topTriggers = byCategory
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const minutesLost = Math.min(minutes, round1(total * costPer));
  const percentLost = round1((minutesLost / minutes) * 100);

  return {
    totalDistractions: total,
    perHour,
    bandId: band.id,
    bandLabel: band.label,
    topTriggers,
    byCategory,
    minutesLost,
    percentLost,
    effectiveMinutes: round1(minutes - minutesLost),
    studyMinutes: minutes,
  };
}
