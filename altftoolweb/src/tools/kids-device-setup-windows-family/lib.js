/**
 * Windows Family Account Setup Guide — setup plan and weekly screen-time maths.
 *
 * Pure module: no React, no DOM, no clocks. Every exported function is total —
 * unusable input returns { error } rather than NaN or a wrong number.
 *
 * Two pieces of real logic live here:
 *
 * 1. An age-gated setup checklist for a Windows child account and Microsoft
 *    Family Safety. The two facts that catch people out are baked into it: a
 *    child account with administrator rights can uninstall every control, and
 *    Microsoft's web filtering works only in Microsoft Edge, so switching it on
 *    deliberately blocks other browsers for that account.
 * 2. weeklyScreenTimePlan(), which turns the weekday and weekend daily limits
 *    Family Safety asks for into the weekly and yearly totals they actually mean.
 */

export const MINUTES_PER_DAY = 24 * 60;
export const DAYS_PER_WEEK = 7;
export const WEEKDAYS = 5;
export const WEEKEND_DAYS = 2;
export const WEEKS_PER_YEAR = 52;

/** Ages this guide covers. */
export const AGE_RANGE = { min: 3, max: 17 };

/** Bands used for labelling only, not for scoring. */
export const AGE_BANDS = [
  { id: "early", min: 3, max: 5, label: "3-5, early years" },
  { id: "primary", min: 6, max: 9, label: "6-9, primary school" },
  { id: "tween", min: 10, max: 12, label: "10-12, tween" },
  { id: "teen", min: 13, max: 17, label: "13-17, teen" },
];

/** Day labels for the weekly table, Monday first. */
export const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/**
 * The setup checklist.
 *
 * minAge/maxAge = inclusive age range the step applies to.
 * weight        = importance relative to the other applicable steps.
 * minutes       = realistic one-off time to complete the step.
 * critical      = without it Family Safety is not actually in control of the PC,
 *                 so it caps the score (see CRITICAL_CAP_PERCENT).
 */
export const CHECKLIST = [
  {
    id: "child-microsoft-account",
    group: "Create the child account",
    title: "Add the child to your family group with their own Microsoft account",
    detail:
      "Create it from the family settings page rather than on the PC, so the account is a member of your family group from the start. Controls attach to family membership, not to the Windows profile, and an account added later has to be invited and accepted.",
    weight: 12,
    minutes: 15,
    minAge: 3,
    maxAge: 17,
    critical: true,
  },
  {
    id: "standard-not-admin",
    group: "Create the child account",
    title: "Confirm the child's Windows account is a standard user",
    detail:
      "An administrator can uninstall the filtering, install anything, create a second local account and switch off Defender. This single setting decides whether any of the rest survives contact with a curious eleven-year-old.",
    weight: 10,
    minutes: 5,
    minAge: 3,
    maxAge: 17,
    critical: true,
  },
  {
    id: "sign-in-on-device",
    group: "Create the child account",
    title: "Sign the child into Windows with that account",
    detail:
      "Family Safety reports and limits only apply while the child is signed in as themselves. A shared household login that everyone uses produces a report of nothing and enforces nothing.",
    weight: 9,
    minutes: 8,
    minAge: 3,
    maxAge: 17,
    critical: true,
  },
  {
    id: "windows-hello",
    group: "Create the child account",
    title: "Set a PIN or Windows Hello sign-in for the child",
    detail:
      "A PIN is device-local and easier for a child than a long password, which matters because the alternative is them learning your password and using your profile.",
    weight: 5,
    minutes: 4,
    minAge: 3,
    maxAge: 17,
  },
  {
    id: "separate-parent-session",
    group: "Create the child account",
    title: "Stop sharing the parent password and lock the parent session",
    detail:
      "Every control here is bypassed by signing into your account instead. Set the PC to lock on sleep, and treat the parent password like a bank PIN rather than household knowledge.",
    weight: 7,
    minutes: 5,
    minAge: 3,
    maxAge: 17,
  },

  {
    id: "device-screen-time",
    group: "Set screen time and schedules",
    title: "Set device screen time limits and allowed hours",
    detail:
      "Family Safety takes a separate schedule for each day, combining a daily total with a window of allowed hours. Both matter: a two-hour allowance that can be spent at 06:00 is a different rule from one that can only be spent after school.",
    weight: 9,
    minutes: 8,
    minAge: 3,
    maxAge: 17,
  },
  {
    id: "app-game-limits",
    group: "Set screen time and schedules",
    title: "Add limits for the specific apps and games that dominate",
    detail:
      "A device-wide cap gets spent on whatever is most compelling. Per-app limits on the one or two names at the top of the activity report do more than shaving the overall total.",
    weight: 6,
    minutes: 6,
    minAge: 6,
    maxAge: 17,
  },
  {
    id: "xbox-link",
    group: "Set screen time and schedules",
    title: "Extend the same limits to Xbox",
    detail:
      "The same Microsoft account and the same family group cover an Xbox console. Without this, the PC limit simply moves the play to the front room.",
    weight: 5,
    minutes: 6,
    minAge: 6,
    maxAge: 17,
  },
  {
    id: "bedtime-block",
    group: "Set screen time and schedules",
    title: "Block the overnight hours outright",
    detail:
      "A total-minutes cap does nothing about 02:00. Setting the allowed-hours window to end before bedtime is what protects sleep, and sleep is the outcome most closely tied to how children fare.",
    weight: 7,
    minutes: 4,
    minAge: 3,
    maxAge: 17,
  },
  {
    id: "extension-plan",
    group: "Set screen time and schedules",
    title: "Decide in advance how you answer requests for more time",
    detail:
      "Family Safety sends a request to your phone when the limit runs out, usually mid-game. Agree the rule beforehand — for example, homework finished and one extension a week — so the answer is not a negotiation every evening.",
    weight: 4,
    minutes: 5,
    minAge: 3,
    maxAge: 17,
  },

  {
    id: "content-filters",
    group: "Filter web, apps and games",
    title: "Turn on web and search filtering",
    detail:
      "Filtering blocks adult sites and locks SafeSearch for the child's account. Read the next step before switching it on, because of how Microsoft enforces it.",
    weight: 10,
    minutes: 6,
    minAge: 3,
    maxAge: 17,
    critical: true,
  },
  {
    id: "browser-block",
    group: "Filter web, apps and games",
    title: "Accept that other browsers get blocked, or plan around it",
    detail:
      "Microsoft's filtering works only in Microsoft Edge, so turning it on blocks Chrome, Firefox and other browsers for that account. That is deliberate — an unfiltered browser would make the filter pointless — but tell the child before they find out during homework.",
    weight: 6,
    minutes: 4,
    minAge: 3,
    maxAge: 17,
  },
  {
    id: "age-rating-limits",
    group: "Filter web, apps and games",
    title: "Set the age rating limit for apps and games",
    detail:
      "Family Safety filters the Microsoft Store by the rating system used in your region — PEGI in Europe and India, ESRB in North America. Anything above the limit needs your approval before it installs.",
    weight: 8,
    minutes: 5,
    minAge: 3,
    maxAge: 17,
  },
  {
    id: "allow-block-lists",
    group: "Filter web, apps and games",
    title: "Add the allowed and blocked site lists",
    detail:
      "Automatic filtering misses things in both directions. Add the school portal and the sites the child actually needs to the allow list, and add the specific sites you have decided against to the block list.",
    weight: 6,
    minutes: 4,
    minAge: 3,
    maxAge: 17,
  },
  {
    id: "defender-updates",
    group: "Filter web, apps and games",
    title: "Leave Microsoft Defender and Windows Update on",
    detail:
      "Most malware reaching a child's PC arrives with a cracked game or a modded installer, and is already known. Automatic updates and the built-in antivirus close it without you thinking about it.",
    weight: 6,
    minutes: 3,
    minAge: 3,
    maxAge: 17,
  },
  {
    id: "privacy-permissions",
    group: "Filter web, apps and games",
    title: "Review camera, microphone and location permissions",
    detail:
      "Windows privacy settings list which apps may use the camera, microphone and location. Turn off everything that has no reason to hold them, and check it again after any big game installs.",
    weight: 5,
    minutes: 6,
    minAge: 3,
    maxAge: 17,
  },

  {
    id: "no-saved-card",
    group: "Spending and review",
    title: "Take saved cards off the child's account",
    detail:
      "Account balance topped up with a gift card makes spending visible and finite. A stored card behind an approval prompt is still one mistaken tap from a charge.",
    weight: 8,
    minutes: 5,
    minAge: 3,
    maxAge: 17,
  },
  {
    id: "purchase-approval",
    group: "Spending and review",
    title: "Require organiser approval for purchases",
    detail:
      "Family Safety can require your approval before anything is bought or downloaded from the Microsoft Store, free items included. Without it, in-game currency in a free title is the usual route to a surprise bill.",
    weight: 9,
    minutes: 4,
    minAge: 3,
    maxAge: 17,
    critical: true,
  },
  {
    id: "activity-reporting",
    group: "Spending and review",
    title: "Turn on activity reporting and the weekly email",
    detail:
      "Reporting shows time per app, sites visited and searches. It is off by default for some accounts, and a control you never look at is a control you do not have.",
    weight: 6,
    minutes: 4,
    minAge: 3,
    maxAge: 17,
  },
  {
    id: "review-together",
    group: "Spending and review",
    title: "Read the weekly report with the child",
    detail:
      "Going through it together turns limits into a conversation about where the time went, and shows which app limit is worth setting next. Reading it in secret produces the opposite.",
    weight: 6,
    minutes: 10,
    minAge: 6,
    maxAge: 17,
  },
  {
    id: "agreement",
    group: "Spending and review",
    title: "Agree the rules out loud, including what to do about nasty content",
    detail:
      "Settle where the laptop lives overnight, what counts as homework time, and the promise that showing you something upsetting never costs them the PC. That promise is what makes them tell you.",
    weight: 8,
    minutes: 15,
    minAge: 3,
    maxAge: 17,
  },
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = [
  "Create the child account",
  "Set screen time and schedules",
  "Filter web, apps and games",
  "Spending and review",
];

export const DEFAULT_AGE = 10;
export const DEFAULT_DONE = ["windows-hello", "defender-updates"];
export const DEFAULT_LIMITS = { weekdayMinutes: 60, weekendMinutes: 120 };

/** Bands as a percentage of applicable weight; the first band reached wins. */
export const BANDS = [
  { id: "ready", min: 90, label: "Ready to hand over", hint: "Account type, filtering, limits and spending are all set." },
  { id: "good", min: 70, label: "Mostly set up", hint: "The controls are on. Finish the reporting and the conversation." },
  { id: "partial", min: 40, label: "Half set up", hint: "Enough to feel safe and not enough to be safe." },
  { id: "open", min: 0, label: "Barely started", hint: "Family Safety is not really managing this PC." },
];

/** A missing critical step caps the band — limits mean nothing on an admin account. */
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

/** The labelling band for an age, or { error }. */
export function ageBandFor(age) {
  const parsed = readAge(age);
  if (parsed.error) return parsed;
  const band = AGE_BANDS.find((entry) => parsed.value >= entry.min && parsed.value <= entry.max);
  return band || AGE_BANDS[AGE_BANDS.length - 1];
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

/** Steps that apply at a given age, in listed order, or { error }. */
export function applicableSteps(age) {
  const parsed = readAge(age);
  if (parsed.error) return parsed;
  return CHECKLIST.filter((item) => parsed.value >= item.minAge && parsed.value <= item.maxAge);
}

/**
 * Score the setup. Ticks on steps outside the child's age range are ignored, so
 * changing the age can never inflate the percentage.
 *
 * @param {object} input
 * @param {number} input.age child's age in whole years.
 * @param {string[]} input.doneIds completed step ids.
 */
export function scoreSetup({ age, doneIds } = {}) {
  const parsed = readAge(age);
  if (parsed.error) return parsed;
  if (!Array.isArray(doneIds)) {
    return { error: "Completed steps must be provided as a list." };
  }

  const steps = applicableSteps(parsed.value);
  if (steps.error) return steps;

  const maxPoints = steps.reduce((sum, item) => sum + item.weight, 0);
  if (!(maxPoints > 0)) return { error: "No setup steps apply at this age." };

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
    age: parsed.value,
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
 * What the two daily limits Family Safety asks for add up to.
 *
 * Family Safety schedules screen time per day, so parents usually set one figure
 * for school nights and another for Saturday and Sunday. This converts that pair
 * into the weekly and yearly totals it actually means, which is the number worth
 * arguing about.
 *
 * @param {object} input
 * @param {number} input.weekdayMinutes daily limit, Monday to Friday.
 * @param {number} input.weekendMinutes daily limit, Saturday and Sunday.
 */
export function weeklyScreenTimePlan({ weekdayMinutes, weekendMinutes } = {}) {
  const weekday = Number(weekdayMinutes);
  const weekend = Number(weekendMinutes);

  if (!Number.isFinite(weekday) || !Number.isFinite(weekend)) {
    return { error: "Enter both daily limits in whole minutes." };
  }
  if (weekday < 0 || weekend < 0) {
    return { error: "A daily limit cannot be negative." };
  }
  if (weekday > MINUTES_PER_DAY || weekend > MINUTES_PER_DAY) {
    return { error: "A daily limit cannot exceed 24 hours." };
  }

  const weekdayTotal = weekday * WEEKDAYS;
  const weekendTotal = weekend * WEEKEND_DAYS;
  const weeklyMinutes = weekdayTotal + weekendTotal;

  const days = DAY_NAMES.map((name, index) => ({
    name,
    weekend: index >= WEEKDAYS,
    minutes: index >= WEEKDAYS ? weekend : weekday,
  }));

  return {
    days,
    weekdayMinutes: weekday,
    weekendMinutes: weekend,
    weekdayTotalMinutes: weekdayTotal,
    weekendTotalMinutes: weekendTotal,
    weeklyMinutes,
    dailyAverageMinutes: Math.round(weeklyMinutes / DAYS_PER_WEEK),
    weekendSharePercent:
      weeklyMinutes > 0 ? Math.round((weekendTotal / weeklyMinutes) * 100) : 0,
    yearlyHours: Math.round((weeklyMinutes * WEEKS_PER_YEAR) / 60),
  };
}
