/**
 * iPad Study Device Setup Guide — setup plan and study-session schedule.
 *
 * Pure module: no React, no DOM, no clocks. Times are passed in as arguments so
 * the same input always produces the same output, and every exported function is
 * total — unusable input returns { error } rather than NaN or a wrong number.
 *
 * Two pieces of real logic live here:
 *
 * 1. A checklist gated on two dimensions rather than one. iPadOS has no ordinary
 *    multi-user accounts outside Shared iPad in Apple School Manager, so a
 *    "shared" family iPad is one Apple Account that everyone signs into. That
 *    changes the job completely: on a shared device the work is getting the
 *    parent's mail, messages and photo library off it; on a personal device it
 *    is giving the child their own account in Family Sharing.
 * 2. studySchedule(), which lays out study blocks and breaks from a start time
 *    and counts the 20-20-20 eye breaks that fall inside each block.
 */

export const MINUTES_PER_DAY = 24 * 60;

/** Ages this guide covers. */
export const AGE_RANGE = { min: 4, max: 17 };

/** The two ways a family iPad is actually used. */
export const MODES = [
  {
    id: "personal",
    label: "The child's own iPad",
    hint: "One Apple Account belonging to the child, inside your Family Sharing group.",
  },
  {
    id: "shared",
    label: "A shared family iPad",
    hint: "One account everyone signs into — iPadOS has no ordinary multi-user profiles.",
  },
];

const MODE_IDS = new Set(MODES.map((mode) => mode.id));

/**
 * The 20-20-20 rule as taught by optometry bodies for digital eye strain: every
 * 20 minutes, look at something about 20 feet (6 m) away for 20 seconds.
 */
export const EYE_BREAK_INTERVAL_MINUTES = 20;

/** Practical bounds for a study block, so the schedule stays a real plan. */
export const SESSION_LIMITS = { minMinutes: 5, maxMinutes: 180 };
export const BREAK_LIMITS = { minMinutes: 0, maxMinutes: 60 };
export const SESSION_COUNT_LIMITS = { min: 1, max: 12 };

/**
 * The setup checklist.
 *
 * modes         = which device arrangements the step applies to.
 * minAge/maxAge = inclusive age range the step applies to.
 * weight        = importance relative to the other applicable steps.
 * minutes       = realistic one-off time to complete the step.
 * critical      = without it the iPad is not actually set up for study, so it
 *                 caps the score (see CRITICAL_CAP_PERCENT).
 */
export const CHECKLIST = [
  {
    id: "decide-arrangement",
    group: "Decide whose iPad it is",
    title: "Decide shared or personal, and say which out loud",
    detail:
      "Everything else follows from this. A shared iPad means one account, one photo library and one message history for the whole family, so the work is subtraction; a personal iPad means the child gets their own account and you manage it.",
    weight: 6,
    minutes: 10,
    modes: ["personal", "shared"],
    minAge: 4,
    maxAge: 17,
  },
  {
    id: "own-apple-account",
    group: "Decide whose iPad it is",
    title: "Give the child their own Apple Account in Family Sharing",
    detail:
      "Created by the organiser inside Family Sharing, so Ask to Buy and Screen Time attach to it. Their own account also keeps their schoolwork, notes and photos separate from yours.",
    weight: 10,
    minutes: 15,
    modes: ["personal"],
    minAge: 4,
    maxAge: 17,
    critical: true,
  },
  {
    id: "sign-out-parent-data",
    group: "Decide whose iPad it is",
    title: "Sign the parent's mail, messages and password manager out",
    detail:
      "On a shared iPad the child is using your account. Remove the work mailbox, sign out of the password manager, and turn off Messages in iCloud on that device before it becomes the homework machine.",
    weight: 10,
    minutes: 10,
    modes: ["shared"],
    minAge: 4,
    maxAge: 17,
    critical: true,
  },
  {
    id: "device-passcode",
    group: "Decide whose iPad it is",
    title: "Set a passcode, and check the erase-after-10-attempts setting",
    detail:
      "A passcode is not optional on a device holding schoolwork. If younger children use it, turn off Erase Data after ten failed attempts — a toddler will reach ten.",
    weight: 8,
    minutes: 4,
    modes: ["personal", "shared"],
    minAge: 4,
    maxAge: 17,
    critical: true,
  },
  {
    id: "find-my",
    group: "Decide whose iPad it is",
    title: "Turn on Find My iPad",
    detail:
      "An iPad that travels to school is an iPad that gets left behind. Find My also enables Activation Lock, which makes a stolen one worth much less.",
    weight: 5,
    minutes: 4,
    modes: ["personal", "shared"],
    minAge: 4,
    maxAge: 17,
  },

  {
    id: "guided-access",
    group: "Lock the iPad to the task",
    title: "Turn on Guided Access and give it its own passcode",
    detail:
      "Settings > Accessibility > Guided Access. Triple-click the top button to pin the iPad to a single app, and circle any screen region — an ad slot, a chat button — to disable it. It is the single most useful control on a study iPad.",
    weight: 11,
    minutes: 6,
    modes: ["personal", "shared"],
    minAge: 4,
    maxAge: 17,
    critical: true,
  },
  {
    id: "guided-access-shortcut",
    group: "Lock the iPad to the task",
    title: "Put Guided Access on the Accessibility Shortcut",
    detail:
      "With the shortcut set, starting a locked session is three clicks rather than four menus. A control that takes effort is a control nobody uses on a Tuesday evening.",
    weight: 5,
    minutes: 3,
    modes: ["personal", "shared"],
    minAge: 4,
    maxAge: 17,
  },
  {
    id: "focus-mode",
    group: "Lock the iPad to the task",
    title: "Build a Study Focus with its own home screen",
    detail:
      "A Focus can silence every notification except a chosen few and show only the home screen page holding the school apps. It survives across sessions in a way that manually closing apps does not.",
    weight: 8,
    minutes: 8,
    modes: ["personal", "shared"],
    minAge: 4,
    maxAge: 17,
  },
  {
    id: "downtime-schedule",
    group: "Lock the iPad to the task",
    title: "Schedule Downtime around study and sleep hours",
    detail:
      "On the child's own iPad, Downtime silences everything except Always Allowed apps for the hours you set. Put the school apps in Always Allowed so homework still works while games do not.",
    weight: 7,
    minutes: 5,
    modes: ["personal"],
    minAge: 4,
    maxAge: 17,
  },
  {
    id: "app-limits",
    group: "Lock the iPad to the task",
    title: "Set App Limits on games and social during study hours",
    detail:
      "Limit by category rather than by app, and turn on Block at End of Limit so the limit asks for the Screen Time passcode instead of offering Ignore For Today.",
    weight: 6,
    minutes: 6,
    modes: ["personal", "shared"],
    minAge: 6,
    maxAge: 17,
  },
  {
    id: "notification-summary",
    group: "Lock the iPad to the task",
    title: "Move non-urgent notifications into a scheduled summary",
    detail:
      "Interruptions cost more than the seconds they take, because getting back into a maths problem is slow. A summary delivered twice a day removes most of them without hiding anything.",
    weight: 4,
    minutes: 5,
    modes: ["personal", "shared"],
    minAge: 4,
    maxAge: 17,
  },

  {
    id: "content-restrictions",
    group: "Filter what reaches the screen",
    title: "Turn on Content & Privacy Restrictions",
    detail:
      "Screen Time > Content & Privacy Restrictions is the master switch, and it is the setting most often left off after a restore or a device swap. Nothing below applies until it is on.",
    weight: 10,
    minutes: 3,
    modes: ["personal", "shared"],
    minAge: 4,
    maxAge: 17,
    critical: true,
  },
  {
    id: "web-filter",
    group: "Filter what reaches the screen",
    title: "Restrict Web Content and allow the school's sites explicitly",
    detail:
      "Limit Adult Websites filters automatically and takes your own always-allow list on top — add the school portal, the library catalogue and the exam board before the first homework session rather than during it.",
    weight: 9,
    minutes: 6,
    modes: ["personal", "shared"],
    minAge: 4,
    maxAge: 17,
  },
  {
    id: "airdrop-contacts",
    group: "Filter what reaches the screen",
    title: "Set AirDrop to Contacts Only",
    detail:
      "AirDrop left on Everyone is how unsolicited images reach a child on a train or in a classroom. Contacts Only costs nothing and closes it.",
    weight: 6,
    minutes: 2,
    modes: ["personal", "shared"],
    minAge: 4,
    maxAge: 17,
  },
  {
    id: "safari-extensions",
    group: "Filter what reaches the screen",
    title: "Review Safari extensions and content blockers",
    detail:
      "Extensions can read every page the child visits. Turn off anything you did not install deliberately, and keep any ad or tracker blocker you do want up to date.",
    weight: 4,
    minutes: 4,
    modes: ["personal", "shared"],
    minAge: 4,
    maxAge: 17,
  },
  {
    id: "purchase-controls",
    group: "Filter what reaches the screen",
    title: "Turn on Ask to Buy and require a password for every purchase",
    detail:
      "Set Media & Purchases to Always Require rather than Require After 15 Minutes. On a shared iPad this also stops a younger sibling buying inside a game the older one downloaded.",
    weight: 8,
    minutes: 4,
    modes: ["personal", "shared"],
    minAge: 4,
    maxAge: 17,
  },
  {
    id: "shared-photo-check",
    group: "Filter what reaches the screen",
    title: "Check which photo library the shared iPad is showing",
    detail:
      "On a shared account the Photos app shows the whole family library, including anything synced from a parent's phone. Review what is on the device, and consider a separate iCloud account for the study iPad if that is uncomfortable.",
    weight: 6,
    minutes: 5,
    modes: ["shared"],
    minAge: 4,
    maxAge: 17,
  },

  {
    id: "screen-distance",
    group: "Protect eyes, posture and attention",
    title: "Turn on Screen Distance",
    detail:
      "Screen Distance uses the front camera to warn when the iPad is held closer than about 30 cm for a sustained period. It is aimed at eye strain and childhood myopia rather than at content.",
    weight: 5,
    minutes: 3,
    modes: ["personal", "shared"],
    minAge: 4,
    maxAge: 12,
  },
  {
    id: "eye-breaks",
    group: "Protect eyes, posture and attention",
    title: "Build 20-20-20 breaks into the session",
    detail:
      "Every 20 minutes, look at something about 6 metres away for 20 seconds. Set it as a timer rather than as an instruction, because nobody remembers mid-essay.",
    weight: 6,
    minutes: 5,
    modes: ["personal", "shared"],
    minAge: 4,
    maxAge: 17,
  },
  {
    id: "posture-setup",
    group: "Protect eyes, posture and attention",
    title: "Fix the physical setup before blaming the software",
    detail:
      "A stand that raises the screen towards eye level and a separate keyboard remove most of the neck strain from long typing sessions. Auto-brightness and Night Shift help in the evening; the iPad still does not belong in the bed.",
    weight: 4,
    minutes: 4,
    modes: ["personal", "shared"],
    minAge: 4,
    maxAge: 17,
  },
  {
    id: "study-agreement",
    group: "Protect eyes, posture and attention",
    title: "Agree what the iPad is for during study hours",
    detail:
      "Settle which apps count as study, who starts Guided Access, and where the iPad lives once homework is done. Agreeing it once is worth more than renegotiating nightly.",
    weight: 7,
    minutes: 12,
    modes: ["personal", "shared"],
    minAge: 4,
    maxAge: 17,
  },
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = [
  "Decide whose iPad it is",
  "Lock the iPad to the task",
  "Filter what reaches the screen",
  "Protect eyes, posture and attention",
];

export const DEFAULT_AGE = 11;
export const DEFAULT_MODE = "personal";
export const DEFAULT_DONE = ["device-passcode", "find-my"];
export const DEFAULT_SCHEDULE = {
  startTime: "16:00",
  sessionMinutes: 25,
  breakMinutes: 5,
  sessionCount: 4,
};

/** Bands as a percentage of applicable weight; the first band reached wins. */
export const BANDS = [
  { id: "ready", min: 90, label: "Ready for homework", hint: "The iPad is locked to the task and filtered." },
  { id: "good", min: 70, label: "Mostly set up", hint: "The controls are on. Finish the eye and attention steps." },
  { id: "partial", min: 40, label: "Half set up", hint: "Study time will still leak into everything else." },
  { id: "open", min: 0, label: "Barely started", hint: "This is a general-purpose iPad, not a study device." },
];

/** A missing critical step caps the band; filters do not help an unlockable iPad. */
export const CRITICAL_CAP_PERCENT = 69;

const BY_ID = new Map(CHECKLIST.map((item) => [item.id, item]));

/** First band whose minimum the percent reaches. Percent is clamped to 0..100. */
export function bandFor(percent) {
  const value = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0;
  return BANDS.find((band) => value >= band.min) || BANDS[BANDS.length - 1];
}

function readAge(age) {
  const value = Number(age);
  if (!Number.isFinite(value)) return { error: "Enter the child's age in years." };
  if (!Number.isInteger(value)) return { error: "Enter the age in whole years." };
  if (value < AGE_RANGE.min || value > AGE_RANGE.max) {
    return { error: `This guide covers ages ${AGE_RANGE.min} to ${AGE_RANGE.max}.` };
  }
  return { value };
}

/**
 * Whole minutes as an "1 h 45 m" style label. Presentation helper kept here so
 * the component holds no arithmetic of its own.
 */
export function formatMinutes(total) {
  const value = Number(total);
  if (!Number.isFinite(value) || value < 0) return "—";
  const rounded = Math.round(value);
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

/** Minutes from midnight for a 24-hour "HH:MM" string, or { error }. */
export function parseTime(value) {
  if (typeof value !== "string" || !/^\d{2}:\d{2}$/.test(value)) {
    return { error: "Enter the start time as HH:MM on a 24-hour clock." };
  }
  const hours = Number(value.slice(0, 2));
  const minutes = Number(value.slice(3, 5));
  if (hours > 23 || minutes > 59) {
    return { error: "That is not a real clock time." };
  }
  return { minutes: hours * 60 + minutes };
}

/** Minutes from midnight back to "HH:MM", wrapping past midnight. */
export function formatTime(minutesFromMidnight) {
  const value = Number(minutesFromMidnight);
  if (!Number.isFinite(value)) return "—";
  const wrapped = ((Math.round(value) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(wrapped / 60);
  const minutes = wrapped % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** Steps that apply to a device arrangement and an age, or { error }. */
export function applicableSteps({ mode, age } = {}) {
  const parsed = readAge(age);
  if (parsed.error) return parsed;
  if (typeof mode !== "string" || !MODE_IDS.has(mode)) {
    return { error: "Choose whether this is the child's own iPad or a shared one." };
  }
  return CHECKLIST.filter(
    (item) =>
      item.modes.includes(mode) && parsed.value >= item.minAge && parsed.value <= item.maxAge
  );
}

/**
 * Score the setup. Ticks on steps that do not apply to this arrangement or age
 * are ignored, so switching mode can never inflate the percentage.
 *
 * @param {object} input
 * @param {string} input.mode "personal" or "shared".
 * @param {number} input.age child's age in whole years.
 * @param {string[]} input.doneIds completed step ids.
 */
export function scoreSetup({ mode, age, doneIds } = {}) {
  if (!Array.isArray(doneIds)) {
    return { error: "Completed steps must be provided as a list." };
  }
  const steps = applicableSteps({ mode, age });
  if (steps.error) return steps;

  const maxPoints = steps.reduce((sum, item) => sum + item.weight, 0);
  if (!(maxPoints > 0)) return { error: "No setup steps apply to this combination." };

  const done = new Set();
  for (const raw of doneIds) {
    if (typeof raw === "string" && BY_ID.has(raw)) done.add(raw);
  }

  let points = 0;
  let doneMinutes = 0;
  let remainingMinutes = 0;
  const remaining = [];
  const missingCritical = [];

  for (const item of steps) {
    if (done.has(item.id)) {
      points += item.weight;
      doneMinutes += item.minutes;
    } else {
      remaining.push(item);
      remainingMinutes += item.minutes;
      if (item.critical) missingCritical.push(item);
    }
  }

  const rawPercent = Math.round((points / maxPoints) * 100);
  const capped = missingCritical.length > 0 && rawPercent > CRITICAL_CAP_PERCENT;
  const percent = capped ? CRITICAL_CAP_PERCENT : rawPercent;
  const band = bandFor(percent);

  const groups = GROUPS.map((name) => {
    const items = steps.filter((item) => item.group === name);
    const doneCount = items.filter((item) => done.has(item.id)).length;
    return {
      name,
      done: doneCount,
      total: items.length,
      percent: items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0,
    };
  });

  const nextActions = remaining
    .slice()
    .sort((a, b) => Number(Boolean(b.critical)) - Number(Boolean(a.critical)) || b.weight - a.weight)
    .slice(0, 3);

  return {
    steps,
    points,
    maxPoints,
    rawPercent,
    percent,
    capped,
    completed: steps.length - remaining.length,
    total: steps.length,
    criticalTotal: steps.filter((item) => item.critical).length,
    doneMinutes,
    remainingMinutes,
    totalMinutes: doneMinutes + remainingMinutes,
    band: band.id,
    bandLabel: band.label,
    bandHint: band.hint,
    remaining,
    missingCritical,
    groups,
    nextActions,
  };
}

/**
 * Lay out a homework session as study blocks separated by breaks.
 *
 * Breaks sit between sessions only, so n sessions produce n-1 breaks and the
 * plan never ends on a break. Eye breaks are the 20-minute marks that fall
 * strictly inside a study block; a 20-minute block has none, because its end is
 * already a break.
 *
 * @param {object} input
 * @param {string} input.startTime "HH:MM" on a 24-hour clock.
 * @param {number} input.sessionMinutes length of one study block.
 * @param {number} input.breakMinutes length of each break.
 * @param {number} input.sessionCount how many study blocks.
 */
export function studySchedule({ startTime, sessionMinutes, breakMinutes, sessionCount } = {}) {
  const start = parseTime(startTime);
  if (start.error) return start;

  const session = Number(sessionMinutes);
  const pause = Number(breakMinutes);
  const count = Number(sessionCount);

  if (![session, pause, count].every((value) => Number.isFinite(value))) {
    return { error: "Enter the session length, break length and number of sessions as numbers." };
  }
  if (!Number.isInteger(count) || count < SESSION_COUNT_LIMITS.min || count > SESSION_COUNT_LIMITS.max) {
    return {
      error: `Plan between ${SESSION_COUNT_LIMITS.min} and ${SESSION_COUNT_LIMITS.max} study blocks.`,
    };
  }
  if (session < SESSION_LIMITS.minMinutes || session > SESSION_LIMITS.maxMinutes) {
    return {
      error: `A study block should be between ${SESSION_LIMITS.minMinutes} and ${SESSION_LIMITS.maxMinutes} minutes.`,
    };
  }
  if (pause < BREAK_LIMITS.minMinutes || pause > BREAK_LIMITS.maxMinutes) {
    return {
      error: `A break should be between ${BREAK_LIMITS.minMinutes} and ${BREAK_LIMITS.maxMinutes} minutes.`,
    };
  }

  const totalStudy = session * count;
  const totalBreak = pause * (count - 1);
  const elapsed = totalStudy + totalBreak;
  if (elapsed > MINUTES_PER_DAY) {
    return { error: "That plan runs for more than 24 hours. Reduce the blocks or their length." };
  }

  const blocks = [];
  let cursor = start.minutes;
  for (let index = 1; index <= count; index += 1) {
    blocks.push({
      key: `study-${index}`,
      type: "study",
      index,
      startMinutes: cursor,
      start: formatTime(cursor),
      end: formatTime(cursor + session),
      minutes: session,
    });
    cursor += session;
    if (index < count && pause > 0) {
      blocks.push({
        key: `break-${index}`,
        type: "break",
        index,
        startMinutes: cursor,
        start: formatTime(cursor),
        end: formatTime(cursor + pause),
        minutes: pause,
      });
      cursor += pause;
    }
  }

  const eyeBreaksPerSession = Math.floor((session - 1) / EYE_BREAK_INTERVAL_MINUTES);

  return {
    blocks,
    sessionCount: count,
    sessionMinutes: session,
    breakMinutes: pause,
    totalStudyMinutes: totalStudy,
    totalBreakMinutes: totalBreak,
    elapsedMinutes: elapsed,
    startTime: formatTime(start.minutes),
    endTime: formatTime(start.minutes + elapsed),
    crossesMidnight: start.minutes + elapsed >= MINUTES_PER_DAY,
    eyeBreaksPerSession,
    eyeBreaksTotal: eyeBreaksPerSession * count,
  };
}
