/**
 * Power Nap Planner — pure calculation module.
 *
 * The whole problem with napping is sleep inertia: the grogginess you feel on
 * waking, which is worst when the alarm pulls you out of slow-wave (N3) sleep.
 * Slow-wave sleep typically begins 20-30 minutes into a nap, which is why a
 * 10-20 minute nap leaves you sharp and a 30-45 minute nap leaves you worse
 * than before. A full ~90 minute cycle works too, because it returns you to
 * light sleep before it ends.
 *
 * All times are minutes after midnight and are passed in as arguments — nothing
 * here reads the system clock, so the same input always gives the same output.
 */

/** Average time to fall asleep for a healthy adult, minutes. */
export const DEFAULT_SLEEP_LATENCY_MIN = 12;

/** A full sleep cycle averages about 90 minutes (individual range 70-120). */
export const SLEEP_CYCLE_MIN = 90;

/** Slow-wave sleep generally starts this far into a nap. Waking after this
 *  point is what produces heavy grogginess. */
export const SLOW_WAVE_ONSET_MIN = 20;

/** A nap should end at least this long before bedtime, or it eats into the
 *  sleep pressure you need to fall asleep at night. */
export const NAP_CUTOFF_HOURS_BEFORE_BED = 6;

/** The circadian post-lunch dip, when napping comes most easily. */
export const DIP_WINDOW_START_MIN = 13 * 60;
export const DIP_WINDOW_END_MIN = 15 * 60;

/** Napping later than this tends to interfere with night sleep for most people. */
export const LATE_NAP_CUTOFF_MIN = 16 * 60;

/** Sleep debt below this many hours last night makes a full-cycle recovery nap
 *  the better choice than a short power nap. */
export const SLEEP_DEBT_THRESHOLD_HOURS = 6;

/** Caffeine reaches peak plasma concentration 20-30 minutes after drinking,
 *  which is what makes a "coffee nap" of 20 minutes or less work. */
export const CAFFEINE_PEAK_MIN = 25;

/**
 * Nap options. `inertiaMin` is the typical grogginess after waking:
 * short naps end in N1/N2 and cost almost nothing, 30-60 minute naps are
 * interrupted mid slow-wave and cost the most, and a full cycle ends light again.
 * `preference` ranks which option to recommend when several fit; lower is better.
 */
export const NAP_OPTIONS = [
  {
    id: "micro",
    minutes: 10,
    label: "Micro nap",
    inertiaMin: 3,
    preference: 3,
    note: "Barely into light sleep. A quick alertness top-up with almost no grogginess.",
  },
  {
    id: "power",
    minutes: 20,
    label: "Power nap",
    inertiaMin: 5,
    preference: 1,
    note: "The default choice. Ends before slow-wave sleep starts, so you wake clear-headed.",
  },
  {
    id: "awkward",
    minutes: 30,
    label: "30-minute nap",
    inertiaMin: 20,
    preference: 5,
    note: "The worst length — the alarm lands in early slow-wave sleep, so you wake heavier than you lay down.",
  },
  {
    id: "slowwave",
    minutes: 60,
    label: "60-minute nap",
    inertiaMin: 25,
    preference: 4,
    note: "Good for factual memory, but it ends deep in slow-wave sleep and grogginess is real.",
  },
  {
    id: "cycle",
    minutes: SLEEP_CYCLE_MIN,
    label: "Full cycle nap",
    inertiaMin: 10,
    preference: 2,
    note: "A complete cycle through to lighter sleep. The best choice when you are genuinely short on sleep.",
  },
];

/** "HH:MM" -> minutes after midnight, or null when unparseable. */
export function parseTime(value) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value).trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

/** Minutes after midnight -> "HH:MM", wrapping across midnight. */
export function formatTime(minutes) {
  const total = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Minutes from `from` to `to`, treating a smaller `to` as being the next day. */
export function minutesUntil(from, to) {
  const diff = to - from;
  return diff >= 0 ? diff : diff + 1440;
}

function formatDuration(minutes) {
  const total = Math.max(0, Math.round(minutes));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

/**
 * @param {object} input
 * @param {string} input.nowTime        "HH:MM" when you would lie down
 * @param {string} input.nextCommitment "HH:MM" when you must be sharp again
 * @param {string} input.bedtime        "HH:MM" tonight's intended bedtime
 * @param {number} input.latencyMin     minutes you take to fall asleep
 * @param {number} input.sleptLastNight hours of sleep last night
 */
export function computeNapPlan({
  nowTime,
  nextCommitment,
  bedtime,
  latencyMin = DEFAULT_SLEEP_LATENCY_MIN,
  sleptLastNight = 7,
} = {}) {
  const now = parseTime(nowTime);
  const commitment = parseTime(nextCommitment);
  const bed = parseTime(bedtime);
  const latency = Number(latencyMin);
  const slept = Number(sleptLastNight);

  if (now === null || commitment === null || bed === null) {
    return { error: "Enter all three times as HH:MM, for example 14:00." };
  }
  if (!Number.isFinite(latency) || !Number.isFinite(slept)) {
    return { error: "Enter a number for how long you take to fall asleep and how long you slept." };
  }
  if (latency < 0 || latency > 60) {
    return { error: "Time to fall asleep should be between 0 and 60 minutes." };
  }
  if (slept < 0 || slept > 24) return { error: "Hours slept last night must be between 0 and 24." };

  const windowMin = minutesUntil(now, commitment);
  if (windowMin === 0) {
    return { error: "Your next commitment is right now — there is no window to nap in." };
  }
  if (windowMin > 12 * 60) {
    return { error: "That is more than 12 hours away. Enter the next thing you actually need to be sharp for." };
  }

  // Which options physically fit: latency + nap + inertia must sit inside the window.
  const evaluated = NAP_OPTIONS.map((option) => {
    const totalMin = latency + option.minutes + option.inertiaMin;
    const asleepAt = now + latency;
    const wakeAt = asleepAt + option.minutes;
    const alertAt = wakeAt + option.inertiaMin;
    const gapToBedMin = minutesUntil(wakeAt, bed);
    return {
      ...option,
      totalMin,
      fits: totalMin <= windowMin,
      asleepAt: formatTime(asleepAt),
      wakeAt: formatTime(wakeAt),
      alertAt: formatTime(alertAt),
      gapToBedMin,
      protectsNightSleep: gapToBedMin >= NAP_CUTOFF_HOURS_BEFORE_BED * 60,
      entersSlowWave: option.minutes > SLOW_WAVE_ONSET_MIN,
      wakeAtMinutes: wakeAt,
    };
  });

  const fitting = evaluated.filter((option) => option.fits);
  if (fitting.length === 0) {
    return {
      noFit: true,
      windowMin,
      windowLabel: formatDuration(windowMin),
      latency,
      options: evaluated,
      shortestNeededMin: Math.min(...evaluated.map((option) => option.totalMin)),
    };
  }

  // Prefer a full cycle when genuinely short on sleep, otherwise the 20-minute nap.
  const sleepDebt = slept < SLEEP_DEBT_THRESHOLD_HOURS;
  const ranked = [...fitting].sort((a, b) => {
    if (sleepDebt) {
      const aCycle = a.id === "cycle" ? 0 : 1;
      const bCycle = b.id === "cycle" ? 0 : 1;
      if (aCycle !== bCycle) return aCycle - bCycle;
    }
    return a.preference - b.preference;
  });
  const best = ranked[0];

  const startsInDip = now >= DIP_WINDOW_START_MIN && now <= DIP_WINDOW_END_MIN;
  const startsLate = now >= LATE_NAP_CUTOFF_MIN && now < 22 * 60;

  return {
    noFit: false,
    recommended: best,
    windowMin,
    windowLabel: formatDuration(windowMin),
    spareMin: windowMin - best.totalMin,
    spareLabel: formatDuration(windowMin - best.totalMin),
    latency,
    lieDownAt: formatTime(now),
    sleepDebt,
    sleptLastNight: slept,
    startsInDip,
    startsLate,
    protectsNightSleep: best.protectsNightSleep,
    gapToBedLabel: formatDuration(best.gapToBedMin),
    coffeeNapSuitable: best.minutes <= SLOW_WAVE_ONSET_MIN,
    caffeinePeakMin: CAFFEINE_PEAK_MIN,
    options: evaluated,
  };
}

export default computeNapPlan;
