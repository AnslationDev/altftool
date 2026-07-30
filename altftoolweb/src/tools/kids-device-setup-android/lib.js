/**
 * Android Kids Device Setup Guide — age-aware setup plan and time budget.
 *
 * Pure module: no React, no DOM, no clocks. Every exported function is total —
 * unusable input returns { error } rather than NaN, Infinity or a wrong number.
 *
 * Two pieces of real logic live here:
 *
 * 1. An age-gated setup checklist. Steps declare the age range they apply to,
 *    because a supervised account for a seven-year-old and a supervision
 *    invitation accepted by a fifteen-year-old are different tasks. The score is
 *    calculated over the applicable steps only.
 * 2. A daily time budget built from published sleep guidance rather than from a
 *    number someone made up. See SLEEP_GUIDELINES and SCREEN_CAP_RULES.
 */

export const MINUTES_PER_DAY = 24 * 60;

/** Ages this guide covers. Below 2 the answer is "no device", not "settings". */
export const AGE_RANGE = { min: 2, max: 17 };

/** Bands used only for labelling, not for scoring. */
export const AGE_BANDS = [
  { id: "early", min: 2, max: 5, label: "2-5, early years" },
  { id: "primary", min: 6, max: 9, label: "6-9, primary school" },
  { id: "tween", min: 10, max: 12, label: "10-12, tween" },
  { id: "teen", min: 13, max: 17, label: "13-17, teen" },
];

/**
 * Recommended sleep, from the American Academy of Sleep Medicine consensus
 * statement endorsed by the American Academy of Pediatrics. Hours are per
 * 24-hour period and include naps for the youngest band.
 */
export const SLEEP_GUIDELINES = [
  { min: 1, max: 2, lowHours: 11, highHours: 14 },
  { min: 3, max: 5, lowHours: 10, highHours: 13 },
  { min: 6, max: 12, lowHours: 9, highHours: 12 },
  { min: 13, max: 18, lowHours: 8, highHours: 10 },
];

/**
 * Screen-time caps that an actual public health body publishes a number for.
 * WHO 2019 guidelines on physical activity, sedentary behaviour and sleep for
 * children under 5: no sedentary screen time for children under 2, and no more
 * than 1 hour for ages 2-4, with less being better. Above 4 no major body
 * publishes a numeric limit, so this returns null rather than inventing one.
 */
export const SCREEN_CAP_RULES = [
  {
    maxAge: 4,
    minutes: 60,
    basis:
      "WHO caps sedentary screen time at 1 hour a day for ages 2-4 and says less is better. Below age 2 it advises none at all, which is why this guide starts at 2.",
  },
];

/**
 * Non-negotiable daily minutes for meals, washing, dressing and travel.
 * An allowance, not a guideline — it is a named default so it can be changed.
 */
export const DEFAULT_ROUTINE_MINUTES = 150;

/**
 * The setup checklist.
 *
 * minAge/maxAge = the ages the step applies to, inclusive.
 * weight        = importance relative to the other steps that apply.
 * minutes       = realistic time to complete the step once.
 * critical      = skipping it leaves the device effectively unmanaged, so it
 *                 caps the score (see CRITICAL_CAP_PERCENT).
 */
export const CHECKLIST = [
  {
    id: "family-link-account",
    group: "Create the supervised account",
    title: "Create the child's Google Account inside Family Link",
    detail:
      "Google requires supervision below the local age of digital consent — 13 in India and the US, up to 16 in parts of the EU. Creating the account through the Family Link app is what attaches the controls; a normal sign-up made on the device cannot be retro-fitted the same way.",
    weight: 12,
    minutes: 15,
    minAge: 2,
    maxAge: 12,
    critical: true,
  },
  {
    id: "supervise-teen-account",
    group: "Create the supervised account",
    title: "Invite the existing teen account into supervision",
    detail:
      "A teenager's account is supervised only after they accept the invitation from Family Link, and they can ask to remove supervision once they reach the age of consent. Treat it as an agreement you both understand rather than a lock they cannot open.",
    weight: 10,
    minutes: 10,
    minAge: 13,
    maxAge: 17,
    critical: true,
  },
  {
    id: "device-lock",
    group: "Create the supervised account",
    title: "Set a screen lock the child knows and you know",
    detail:
      "A PIN or pattern stops a lost phone becoming an open account. Set it together and write it down somewhere at home — a lock only you know turns every handover into an argument.",
    weight: 8,
    minutes: 3,
    minAge: 2,
    maxAge: 17,
    critical: true,
  },
  {
    id: "separate-parent-account",
    group: "Create the supervised account",
    title: "Remove your own Google account from the device",
    detail:
      "If a parent account is still signed in, purchases, mail and browsing bypass every restriction and the activity report attributes it all to the child. One account per device is what makes the rest of this work.",
    weight: 6,
    minutes: 5,
    minAge: 2,
    maxAge: 17,
  },
  {
    id: "find-my-device",
    group: "Create the supervised account",
    title: "Turn on Find My Device and location sharing",
    detail:
      "Settings > Security > Find My Device on the phone, and the location toggle in Family Link. Tell the child it is on and why — undisclosed tracking is what teenagers work around.",
    weight: 6,
    minutes: 5,
    minAge: 2,
    maxAge: 17,
  },

  {
    id: "daily-limit",
    group: "Set the boundaries",
    title: "Set a daily limit and a bedtime schedule",
    detail:
      "Family Link sets a daily cap and a bedtime window per device; calls stay available while the device is locked. Bedtime matters more than the cap — device use in the hour before sleep is what displaces it.",
    weight: 9,
    minutes: 5,
    minAge: 2,
    maxAge: 17,
  },
  {
    id: "app-limits",
    group: "Set the boundaries",
    title: "Add per-app limits for the two apps that dominate",
    detail:
      "A whole-device cap gets spent on whatever is most compelling. Per-app limits on the one or two apps the activity report shows at the top do more than shaving the overall total.",
    weight: 6,
    minutes: 5,
    minAge: 6,
    maxAge: 17,
  },
  {
    id: "safesearch",
    group: "Set the boundaries",
    title: "Lock SafeSearch on and set Chrome site restrictions",
    detail:
      "In Family Link, set SafeSearch to filter and choose between allowing all sites, trying to block mature sites, or allowing only sites you approve. The approved-only mode is workable up to about nine and frustrating after that.",
    weight: 8,
    minutes: 5,
    minAge: 2,
    maxAge: 17,
  },
  {
    id: "play-content-ratings",
    group: "Set the boundaries",
    title: "Set Google Play content rating limits",
    detail:
      "Play Store > Settings > Family > Parental controls sets separate maximum ratings for apps and games, films, TV and books, and locks them behind a PIN. Set the PIN to something the child has never seen you type.",
    weight: 8,
    minutes: 6,
    minAge: 2,
    maxAge: 17,
  },
  {
    id: "youtube-route",
    group: "Set the boundaries",
    title: "Route video to YouTube Kids or a supervised experience",
    detail:
      "Main YouTube has no reliable middle setting for under-13s. Use YouTube Kids for younger children, or the supervised experience levels Family Link offers for tweens, and remove the standard app.",
    weight: 7,
    minutes: 6,
    minAge: 2,
    maxAge: 12,
  },
  {
    id: "assistant-restrict",
    group: "Set the boundaries",
    title: "Restrict Assistant results and voice purchases",
    detail:
      "Voice search bypasses the browser filters entirely for a child who cannot yet type. Turn on filters for Assistant and disable voice-initiated purchases.",
    weight: 4,
    minutes: 4,
    minAge: 2,
    maxAge: 9,
  },

  {
    id: "app-approval",
    group: "Control installs and spending",
    title: "Require your approval for every app install",
    detail:
      "Family Link sends an approval request to your phone before an install completes, including free apps. This is the single control that keeps the device roughly the shape you set up.",
    weight: 10,
    minutes: 4,
    minAge: 2,
    maxAge: 17,
    critical: true,
  },
  {
    id: "purchase-auth",
    group: "Control installs and spending",
    title: "Require authentication for all Play purchases",
    detail:
      "Play Store > Settings > Authentication > Require authentication for purchases, set to every purchase rather than every 30 minutes. In-app currency in a free game is the usual route to a surprise bill.",
    weight: 8,
    minutes: 3,
    minAge: 2,
    maxAge: 17,
    critical: true,
  },
  {
    id: "remove-payment",
    group: "Control installs and spending",
    title: "Take saved cards off the child's Play account",
    detail:
      "Gift balance or a top-up code makes spending visible and finite. A stored card plus an approval prompt is still one mistaken tap away from a charge.",
    weight: 6,
    minutes: 5,
    minAge: 2,
    maxAge: 17,
  },
  {
    id: "unknown-sources",
    group: "Control installs and spending",
    title: "Confirm sideloading is off and Play Protect is on",
    detail:
      "Install unknown apps should be off for every app, especially the browser and any chat app. Modded game APKs advertised on video sites are the usual way malware reaches a child's phone.",
    weight: 7,
    minutes: 4,
    minAge: 8,
    maxAge: 17,
  },
  {
    id: "permission-audit",
    group: "Control installs and spending",
    title: "Audit camera, microphone, location and file permissions",
    detail:
      "Settings > Privacy > Permission manager, one permission at a time. Set camera and microphone to while using the app at most, and revoke anything a torch or a colouring app has no reason to hold.",
    weight: 6,
    minutes: 8,
    minAge: 2,
    maxAge: 17,
  },

  {
    id: "agreement",
    group: "Make it stick",
    title: "Agree the rules out loud, including what to do about nasty content",
    detail:
      "Settle where the phone charges overnight, when it is away, and the promise that showing you something frightening never costs them the device. That promise is what makes them tell you.",
    weight: 8,
    minutes: 15,
    minAge: 2,
    maxAge: 17,
  },
  {
    id: "weekly-review",
    group: "Make it stick",
    title: "Read the weekly activity report together",
    detail:
      "Family Link reports time per app. Reviewing it with the child turns limits into a conversation about what the time went on, and shows you which app limit is worth setting next.",
    weight: 6,
    minutes: 10,
    minAge: 6,
    maxAge: 17,
  },
  {
    id: "updates",
    group: "Make it stick",
    title: "Leave system and Play system updates on",
    detail:
      "Most Android exploits that reach a child's phone are already patched. Automatic updates over Wi-Fi cost nothing and close them without you thinking about it.",
    weight: 5,
    minutes: 3,
    minAge: 2,
    maxAge: 17,
  },
  {
    id: "handover-plan",
    group: "Make it stick",
    title: "Plan how supervision ends",
    detail:
      "Supervision can be removed by the child once they reach the age of digital consent, and Google notifies you when it happens. Agree in advance which controls come off at which age so the ending is planned rather than a fight.",
    weight: 5,
    minutes: 10,
    minAge: 11,
    maxAge: 17,
  },
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = [
  "Create the supervised account",
  "Set the boundaries",
  "Control installs and spending",
  "Make it stick",
];

/** Sensible starting age and a couple of steps most people have already done. */
export const DEFAULT_AGE = 9;
export const DEFAULT_DONE = ["device-lock", "updates"];

/** Bands as a percentage of applicable weight; the first band reached wins. */
export const BANDS = [
  { id: "ready", min: 90, label: "Ready to hand over", hint: "Supervision, limits and spending are all set." },
  { id: "good", min: 70, label: "Mostly set up", hint: "The big controls are on. Finish the habits section." },
  { id: "partial", min: 40, label: "Half set up", hint: "Enough to feel safe and not enough to be safe." },
  { id: "open", min: 0, label: "Barely started", hint: "The device is effectively unmanaged." },
];

/** A missing critical step caps the band: an unsupervised account is not "mostly set up". */
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
    return {
      error: `This guide covers ages ${AGE_RANGE.min} to ${AGE_RANGE.max}. Below ${AGE_RANGE.min}, the answer is no personal device rather than different settings.`,
    };
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

/** Steps that apply at a given age, in listed order, or { error }. */
export function applicableSteps(age) {
  const parsed = readAge(age);
  if (parsed.error) return parsed;
  return CHECKLIST.filter((item) => parsed.value >= item.minAge && parsed.value <= item.maxAge);
}

/**
 * Score the setup for one child.
 *
 * Ticks on steps outside the child's age range are ignored, so changing the age
 * can never inflate the percentage.
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
  if (!(maxPoints > 0)) {
    return { error: "No setup steps apply at this age." };
  }

  const done = new Set();
  for (const raw of doneIds) {
    if (typeof raw === "string" && BY_ID.has(raw)) done.add(raw);
  }

  let points = 0;
  let remainingMinutes = 0;
  let doneMinutes = 0;
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
 * Whole minutes split into an "1 h 45 m" style label. Presentation helper, kept
 * here so the component holds no arithmetic of its own.
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

/** Published screen-time cap for an age in minutes, or null where none exists. */
export function screenCapFor(age) {
  const parsed = readAge(age);
  if (parsed.error) return parsed;
  const rule = SCREEN_CAP_RULES.find((entry) => parsed.value <= entry.maxAge);
  if (rule) return { minutes: rule.minutes, basis: rule.basis };
  return {
    minutes: null,
    basis:
      "No major health body publishes a numeric daily limit above age 4. The useful question is what the day has room for once sleep, school and activity are taken out.",
  };
}

/**
 * What the day actually has room for, once sleep and obligations are removed.
 *
 * Sleep uses the lower bound of the published range, which is the generous
 * reading: a child sleeping the upper bound has less discretionary time, not more.
 *
 * @param {object} input
 * @param {number} input.age child's age in whole years.
 * @param {number} input.schoolMinutes school or nursery, including travel.
 * @param {number} input.homeworkMinutes homework and reading.
 * @param {number} input.activityMinutes sport, play outdoors, clubs.
 * @param {number} [input.routineMinutes] meals, washing, dressing.
 */
export function dailyTimeBudget({
  age,
  schoolMinutes,
  homeworkMinutes,
  activityMinutes,
  routineMinutes = DEFAULT_ROUTINE_MINUTES,
} = {}) {
  const parsed = readAge(age);
  if (parsed.error) return parsed;

  const parts = { schoolMinutes, homeworkMinutes, activityMinutes, routineMinutes };
  for (const [key, raw] of Object.entries(parts)) {
    const value = Number(raw);
    if (!Number.isFinite(value)) {
      return { error: "Enter every daily total in whole minutes." };
    }
    if (value < 0) return { error: "Daily totals cannot be negative." };
    if (value > MINUTES_PER_DAY) return { error: "A single activity cannot exceed 24 hours." };
    parts[key] = value;
  }

  const sleep = SLEEP_GUIDELINES.find(
    (entry) => parsed.value >= entry.min && parsed.value <= entry.max
  );
  if (!sleep) {
    return { error: "No published sleep range covers this age." };
  }

  const sleepMinutes = sleep.lowHours * 60;
  const committed =
    sleepMinutes +
    parts.schoolMinutes +
    parts.homeworkMinutes +
    parts.activityMinutes +
    parts.routineMinutes;

  if (committed > MINUTES_PER_DAY) {
    return {
      error:
        "Sleep plus the totals entered add up to more than 24 hours. Reduce one of them to see what is left.",
    };
  }

  const cap = screenCapFor(parsed.value);
  const discretionary = MINUTES_PER_DAY - committed;
  const suggested =
    cap.minutes === null ? null : Math.min(discretionary, cap.minutes);

  return {
    age: parsed.value,
    sleepMinutes,
    sleepLowHours: sleep.lowHours,
    sleepHighHours: sleep.highHours,
    committedMinutes: committed,
    discretionaryMinutes: discretionary,
    capMinutes: cap.minutes,
    capBasis: cap.basis,
    suggestedScreenMinutes: suggested,
  };
}
