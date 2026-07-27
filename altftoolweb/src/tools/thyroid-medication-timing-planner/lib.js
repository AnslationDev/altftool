/**
 * Levothyroxine timing maths.
 *
 * Levothyroxine is absorbed in the jejunum and ileum and its bioavailability
 * falls sharply when food, coffee or binding minerals are in the gut at the
 * same time. The separations used here are the ones in the product labelling
 * and the trials behind it:
 *
 *  - Empty stomach, water only, at least 30 minutes before breakfast; most
 *    labels and endocrine societies prefer 60 minutes (US prescribing
 *    information for levothyroxine sodium; American Thyroid Association
 *    hypothyroidism guideline, Thyroid 2014).
 *  - Bedtime dosing is an accepted alternative if the last meal was at least
 *    3 hours earlier (Bolk N et al., Arch Intern Med 2010;170:1996-2003 —
 *    randomised crossover showing bedtime dosing lowered TSH).
 *  - Coffee, including espresso, cuts absorption when taken with or shortly
 *    after the tablet; leave 60 minutes (Benvenga S et al., Thyroid
 *    2008;18:293-301).
 *  - Calcium carbonate and ferrous sulfate form insoluble complexes with
 *    levothyroxine; separate by at least 4 hours (labelling; Singh N et al.,
 *    JAMA 2000 for calcium, Campbell NR et al., Ann Intern Med 1992 for iron).
 *  - Aluminium/magnesium antacids, proton-pump inhibitors, sucralfate and
 *    multivitamins containing iron or calcium: 4 hours.
 *  - Bile acid sequestrants (cholestyramine, colestipol, colesevelam) and
 *    soy or high-fibre meals: 4 hours.
 *
 * Times are minutes since midnight so the maths stays pure; the caller
 * supplies every clock time.
 */

export const MINUTES_PER_DAY = 1440;

/** Minimum and preferred gap between the tablet and the first food of the day. */
export const FOOD_GAP_MIN = 30;
export const FOOD_GAP_PREFERRED = 60;

/** Bedtime dosing needs this long after the last meal. */
export const BEDTIME_FASTING_GAP = 180;

/** Coffee gap either side of the tablet. */
export const COFFEE_GAP = 60;

/** Standard 4-hour separation for binding minerals and acid-changing drugs. */
export const BINDER_GAP = 240;

export const DOSE_MODES = {
  morning: {
    key: "morning",
    label: "Morning, before breakfast",
    blurb: `Tablet with water on waking, first food at least ${FOOD_GAP_MIN} minutes later (${FOOD_GAP_PREFERRED} is better).`,
  },
  bedtime: {
    key: "bedtime",
    label: "Bedtime",
    blurb: `Tablet at least ${BEDTIME_FASTING_GAP / 60} hours after the last meal or snack of the day.`,
  },
};

/**
 * Everything the tablet has to be kept away from.
 * `gap` is in minutes. `direction`:
 *   "after"  - the item must come at least `gap` minutes AFTER the tablet
 *   "either" - the item must be at least `gap` minutes away in either direction
 */
export const INTERACTIONS = [
  {
    key: "breakfast",
    label: "Breakfast / first food",
    gap: FOOD_GAP_MIN,
    preferredGap: FOOD_GAP_PREFERRED,
    direction: "after",
    modes: ["morning"],
    why: "Food roughly halves levothyroxine absorption; the tablet needs a genuinely empty stomach.",
  },
  {
    key: "coffee",
    label: "Coffee or espresso",
    gap: COFFEE_GAP,
    direction: "either",
    modes: ["morning", "bedtime"],
    why: "Coffee taken within an hour of the tablet cuts absorption measurably, even without milk.",
  },
  {
    key: "calcium",
    label: "Calcium supplement or antacid",
    gap: BINDER_GAP,
    direction: "either",
    modes: ["morning", "bedtime"],
    why: "Calcium carbonate binds levothyroxine in the gut and the complex is not absorbed.",
  },
  {
    key: "iron",
    label: "Iron / multivitamin with iron",
    gap: BINDER_GAP,
    direction: "either",
    modes: ["morning", "bedtime"],
    why: "Ferrous sulfate forms an insoluble complex with levothyroxine.",
  },
  {
    key: "acidDrug",
    label: "PPI, sucralfate or bile acid binder",
    gap: BINDER_GAP,
    direction: "either",
    modes: ["morning", "bedtime"],
    why: "These change stomach acidity or bind the tablet directly; 4 hours is the usual separation.",
  },
  {
    key: "soyFibre",
    label: "Soy, walnuts or a high-fibre meal",
    gap: BINDER_GAP,
    direction: "either",
    modes: ["morning", "bedtime"],
    why: "Soy protein and dietary fibre both reduce the fraction of the dose that reaches the blood.",
  },
];

/** Circular forward distance from `from` to `to`, in minutes (0-1439). */
export function forwardGap(from, to) {
  return (((to - from) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
}

/** Shortest distance between two clock times, in minutes (0-720). */
export function clockDistance(a, b) {
  const forward = forwardGap(a, b);
  return Math.min(forward, MINUTES_PER_DAY - forward);
}

/** Parse "HH:MM" (24-hour) into minutes since midnight, or null. */
export function parseClockTime(text) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(text ?? "").trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Render minutes-since-midnight as "7:30 AM". */
export function formatClockTime(minutes) {
  if (!Number.isFinite(minutes)) return "—";
  const wrapped = ((Math.round(minutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours24 = Math.floor(wrapped / 60);
  const mins = wrapped % 60;
  const suffix = hours24 < 12 ? "AM" : "PM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(mins).padStart(2, "0")} ${suffix}`;
}

/** "3 h 30 min" style label for a duration in minutes. */
export function formatGap(totalMinutes) {
  if (!Number.isFinite(totalMinutes)) return "—";
  const safe = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} h`;
  return `${hours} h ${mins} min`;
}

/**
 * Score a levothyroxine routine.
 *
 * @param {object} input
 * @param {"morning"|"bedtime"} input.mode
 * @param {number} input.doseMinutes        When the tablet is taken.
 * @param {number} [input.lastMealMinutes]  Bedtime mode only: last food of the day.
 * @param {Object<string, number|null>} input.itemMinutes
 *        Clock time for each interaction key that applies, or null/undefined to skip it.
 * @returns {object} plan, or { error }.
 */
export function planThyroidTiming({ mode = "morning", doseMinutes, lastMealMinutes, itemMinutes = {} }) {
  const modeSpec = DOSE_MODES[mode];
  if (!modeSpec) return { error: "Choose a morning or a bedtime routine." };
  if (typeof doseMinutes !== "number" || !Number.isFinite(doseMinutes)) {
    return { error: "Enter the time you take the tablet." };
  }
  if (doseMinutes < 0 || doseMinutes >= MINUTES_PER_DAY) {
    return { error: "The dose time must be a valid time of day." };
  }

  const checks = [];

  if (mode === "bedtime") {
    if (typeof lastMealMinutes !== "number" || !Number.isFinite(lastMealMinutes)) {
      return { error: "Bedtime dosing needs the time of your last meal or snack." };
    }
    if (lastMealMinutes < 0 || lastMealMinutes >= MINUTES_PER_DAY) {
      return { error: "The last meal time must be a valid time of day." };
    }
    const gap = forwardGap(lastMealMinutes, doseMinutes);
    checks.push({
      key: "lastMeal",
      label: "Last meal or snack",
      why: "A bedtime tablet only works if the stomach has emptied first.",
      itemMinutes: lastMealMinutes,
      itemLabel: formatClockTime(lastMealMinutes),
      requiredGap: BEDTIME_FASTING_GAP,
      actualGap: gap,
      // A gap over 12 h means the meal is really after the dose, not before it.
      ok: gap >= BEDTIME_FASTING_GAP && gap <= 720,
      shortfall: Math.max(0, BEDTIME_FASTING_GAP - gap),
      direction: "before",
      suggestion:
        gap >= BEDTIME_FASTING_GAP && gap <= 720
          ? null
          : `Take the tablet at ${formatClockTime(lastMealMinutes + BEDTIME_FASTING_GAP)} or later, or finish eating by ${formatClockTime(doseMinutes - BEDTIME_FASTING_GAP)}.`,
    });
  }

  for (const item of INTERACTIONS) {
    if (!item.modes.includes(mode)) continue;
    const at = itemMinutes[item.key];
    if (typeof at !== "number" || !Number.isFinite(at)) continue;
    if (at < 0 || at >= MINUTES_PER_DAY) {
      return { error: `The time entered for ${item.label.toLowerCase()} is not a valid time of day.` };
    }

    if (item.direction === "after") {
      const gap = forwardGap(doseMinutes, at);
      const ok = gap >= item.gap && gap <= 720;
      checks.push({
        key: item.key,
        label: item.label,
        why: item.why,
        itemMinutes: at,
        itemLabel: formatClockTime(at),
        requiredGap: item.gap,
        preferredGap: item.preferredGap ?? null,
        actualGap: gap,
        ok,
        best: ok && item.preferredGap ? gap >= item.preferredGap : ok,
        shortfall: Math.max(0, item.gap - gap),
        direction: "after",
        suggestion: ok
          ? null
          : `Push it to ${formatClockTime(doseMinutes + (item.preferredGap ?? item.gap))} or take the tablet by ${formatClockTime(at - (item.preferredGap ?? item.gap))}.`,
      });
    } else {
      const distance = clockDistance(doseMinutes, at);
      const ok = distance >= item.gap;
      const forward = forwardGap(doseMinutes, at);
      const itemIsAfter = forward <= 720;
      checks.push({
        key: item.key,
        label: item.label,
        why: item.why,
        itemMinutes: at,
        itemLabel: formatClockTime(at),
        requiredGap: item.gap,
        preferredGap: null,
        actualGap: distance,
        ok,
        best: ok,
        shortfall: Math.max(0, item.gap - distance),
        direction: itemIsAfter ? "after" : "before",
        suggestion: ok
          ? null
          : `Move it to ${formatClockTime(doseMinutes + item.gap)} or earlier than ${formatClockTime(doseMinutes - item.gap)}.`,
      });
    }
  }

  const failures = checks.filter((check) => !check.ok);
  const warnings = checks.filter((check) => check.ok && check.best === false);

  // A suggested dose time that would clear the breakfast rule with room to spare.
  let recommendedDoseMinutes = null;
  if (mode === "morning" && Number.isFinite(itemMinutes.breakfast)) {
    recommendedDoseMinutes =
      ((itemMinutes.breakfast - FOOD_GAP_PREFERRED) % MINUTES_PER_DAY + MINUTES_PER_DAY) %
      MINUTES_PER_DAY;
  } else if (mode === "bedtime" && Number.isFinite(lastMealMinutes)) {
    recommendedDoseMinutes = (lastMealMinutes + BEDTIME_FASTING_GAP) % MINUTES_PER_DAY;
  }

  const timeline = checks
    .map((check) => ({
      minutes: check.itemMinutes,
      label: check.itemLabel,
      what: check.label,
      ok: check.ok,
    }))
    .concat([{ minutes: doseMinutes, label: formatClockTime(doseMinutes), what: "Levothyroxine tablet", ok: true, isDose: true }])
    .sort((a, b) => a.minutes - b.minutes);

  return {
    mode: modeSpec,
    doseMinutes,
    doseLabel: formatClockTime(doseMinutes),
    checks,
    checkedCount: checks.length,
    clearCount: checks.length - failures.length,
    failures,
    warnings,
    allClear: failures.length === 0,
    worstShortfall: failures.reduce((max, check) => Math.max(max, check.shortfall), 0),
    recommendedDoseMinutes,
    recommendedDoseLabel:
      recommendedDoseMinutes === null ? null : formatClockTime(recommendedDoseMinutes),
    timeline,
  };
}
