/**
 * iPhone Kids Device Setup Guide — age-aware Screen Time setup plan.
 *
 * Pure module: no React, no DOM, no clocks. Every exported function is total —
 * unusable input returns { error } rather than NaN or a wrong number.
 *
 * Two pieces of real logic live here:
 *
 * 1. An age-gated setup checklist. Creating a child Apple Account inside Family
 *    Sharing and inviting a sixteen-year-old's existing account into the family
 *    are different tasks, so steps declare the ages they apply to and the score
 *    counts only the applicable ones.
 * 2. ratingPlanFor(), which maps an age onto the actual values iOS offers in
 *    Settings > Screen Time > Content & Privacy Restrictions. Apple's App Store
 *    rating tiers are 4+, 9+, 12+ and 17+, and the web filter has exactly two
 *    restricted modes, so the mapping is to real options rather than adjectives.
 */

/** Ages this guide covers. Below 2 the answer is "no device", not "settings". */
export const AGE_RANGE = { min: 2, max: 17 };

/** Bands used for labelling only, not for scoring. */
export const AGE_BANDS = [
  { id: "early", min: 2, max: 5, label: "2-5, early years" },
  { id: "primary", min: 6, max: 8, label: "6-8, primary school" },
  { id: "tween", min: 9, max: 12, label: "9-12, tween" },
  { id: "teen", min: 13, max: 17, label: "13-17, teen" },
];

/** The four App Store rating tiers iOS offers, youngest first. */
export const APP_RATINGS = ["4+", "9+", "12+", "17+"];

/**
 * Age to App Store rating cap. The boundaries follow Apple's own tiers rather
 * than a judgement: a child of 6 is above the 4+ tier, a child of 9 is above 9+.
 */
export const RATING_BANDS = [
  { max: 5, rating: "4+" },
  { max: 8, rating: "9+" },
  { max: 15, rating: "12+" },
  { max: 17, rating: "17+" },
];

/**
 * Web Content has three settings: Unrestricted Access, Limit Adult Websites and
 * Allowed Websites Only. Allow-list mode is workable while a child's browsing is
 * mostly a handful of known sites, and unusable once schoolwork involves search.
 */
export const ALLOWLIST_MAX_AGE = 8;

/** Age at and above which explicit music and podcasts become a conversation. */
export const EXPLICIT_MUSIC_MIN_AGE = 16;

/** Family Sharing offers Ask to Buy for any family member under 18. */
export const ASK_TO_BUY_MAX_AGE = 17;

/**
 * The setup checklist.
 *
 * minAge/maxAge = inclusive age range the step applies to.
 * weight        = importance relative to the other applicable steps.
 * minutes       = realistic one-off time to complete the step.
 * critical      = without it the device is not actually managed, so it caps the
 *                 score (see CRITICAL_CAP_PERCENT).
 */
export const CHECKLIST = [
  {
    id: "child-apple-account",
    group: "Set up the child account",
    title: "Create the child's Apple Account through Family Sharing",
    detail:
      "A child below 13 cannot create an Apple Account themselves; the organiser makes it inside Family Sharing, which is what attaches Ask to Buy and parental controls. An account made by lying about the birth year has no parental controls at all and cannot be converted later.",
    weight: 12,
    minutes: 15,
    minAge: 2,
    maxAge: 12,
    critical: true,
  },
  {
    id: "join-family-teen",
    group: "Set up the child account",
    title: "Add the teenager's existing Apple Account to your family",
    detail:
      "Invite the account into Family Sharing rather than replacing it. You gain Ask to Buy, location sharing and shared purchases; they keep their photos, messages and app library, which is what makes them agree.",
    weight: 9,
    minutes: 10,
    minAge: 13,
    maxAge: 17,
    critical: true,
  },
  {
    id: "device-passcode",
    group: "Set up the child account",
    title: "Set a device passcode and Face ID or Touch ID",
    detail:
      "Six digits, not four, and not a birthday. Set it together so a lost phone is not also a lost account and an argument at the same time.",
    weight: 8,
    minutes: 3,
    minAge: 2,
    maxAge: 17,
    critical: true,
  },
  {
    id: "screen-time-passcode",
    group: "Set up the child account",
    title: "Set a Screen Time passcode different from the device passcode",
    detail:
      "If the two match, every restriction is one shoulder-surf away from being switched off. iOS asks for an Apple Account to recover a forgotten Screen Time passcode — supply one you can actually sign into.",
    weight: 11,
    minutes: 5,
    minAge: 2,
    maxAge: 17,
    critical: true,
  },
  {
    id: "find-my",
    group: "Set up the child account",
    title: "Turn on Find My and share location with the family",
    detail:
      "Find My locates a lost phone and, with Family Sharing, shows the child's location to the parents. Say plainly that it is on — quiet tracking is what teenagers route around.",
    weight: 6,
    minutes: 5,
    minAge: 2,
    maxAge: 17,
  },

  {
    id: "downtime",
    group: "Set the Screen Time limits",
    title: "Set Downtime around the sleep window",
    detail:
      "Downtime silences everything except calls and the apps you list under Always Allowed. Starting it an hour before bed does more for sleep than shaving the daily total.",
    weight: 9,
    minutes: 5,
    minAge: 2,
    maxAge: 17,
  },
  {
    id: "app-limits",
    group: "Set the Screen Time limits",
    title: "Add App Limits by category, and set Always Allowed",
    detail:
      "Limit the category — Social, Games, Entertainment — rather than chasing individual apps, and put Phone, Messages and any map app in Always Allowed so a limit never strands them.",
    weight: 7,
    minutes: 6,
    minAge: 6,
    maxAge: 17,
  },
  {
    id: "block-at-limit",
    group: "Set the Screen Time limits",
    title: "Turn on Block at End of Limit",
    detail:
      "Without it, the limit shows a notice the child can dismiss with One More Minute or Ignore Limit For Today. With it, the limit needs the Screen Time passcode, which is the point of having one.",
    weight: 6,
    minutes: 3,
    minAge: 2,
    maxAge: 17,
  },
  {
    id: "screen-distance",
    group: "Set the Screen Time limits",
    title: "Turn on Screen Distance",
    detail:
      "Screen Distance uses the front camera to warn when the device is held closer than about 30 cm for a sustained period. It is aimed at eye strain and myopia risk in children rather than at content.",
    weight: 4,
    minutes: 3,
    minAge: 2,
    maxAge: 12,
  },

  {
    id: "content-restrictions",
    group: "Set content and web limits",
    title: "Turn on Content & Privacy Restrictions",
    detail:
      "Screen Time > Content & Privacy Restrictions is the master switch. Every rating cap and web filter below is inert until it is on, and it is the setting most often left off after a device restore.",
    weight: 10,
    minutes: 3,
    minAge: 2,
    maxAge: 17,
    critical: true,
  },
  {
    id: "app-rating-cap",
    group: "Set content and web limits",
    title: "Set the App Store, films and TV rating caps",
    detail:
      "Content Restrictions holds separate caps for apps, films, TV shows and books, and uses your region's certificate system for video. Set the app cap to the tier matching the child's age rather than the one they argue for.",
    weight: 8,
    minutes: 4,
    minAge: 2,
    maxAge: 17,
  },
  {
    id: "web-filter",
    group: "Set content and web limits",
    title: "Set Web Content to a restricted mode",
    detail:
      "Limit Adult Websites filters automatically and lets you add specific allowed and blocked sites. Allowed Websites Only is an allow-list and is realistic only while browsing is a short, known list of sites.",
    weight: 9,
    minutes: 5,
    minAge: 2,
    maxAge: 17,
  },
  {
    id: "explicit-music",
    group: "Set content and web limits",
    title: "Set Music, Podcasts, News and Fitness to Clean",
    detail:
      "One toggle covers explicit tracks, podcast episodes and news items across Apple's own apps. It does not reach third-party streaming apps, which need their own setting.",
    weight: 5,
    minutes: 3,
    minAge: 2,
    maxAge: 15,
  },
  {
    id: "siri-web",
    group: "Set content and web limits",
    title: "Restrict Siri web search and explicit language",
    detail:
      "Voice search walks straight past the browser filter for a child who cannot yet type a query. Both switches sit under Content Restrictions, in the Siri section.",
    weight: 4,
    minutes: 3,
    minAge: 2,
    maxAge: 12,
  },
  {
    id: "privacy-locks",
    group: "Set content and web limits",
    title: "Lock the privacy and account settings against changes",
    detail:
      "Under Allow Changes, set Account Changes, Passcode Changes, Cellular Data Changes and Location Services to Don't Allow. This is what stops the restrictions being undone by signing out of the account.",
    weight: 7,
    minutes: 8,
    minAge: 2,
    maxAge: 17,
  },

  {
    id: "ask-to-buy",
    group: "Purchases, messaging and habits",
    title: "Turn on Ask to Buy for the child",
    detail:
      "Every download and in-app purchase, free ones included, sends an approval request to the organiser. Family Sharing offers it for any family member under 18 and it is on by default below 13.",
    weight: 10,
    minutes: 4,
    minAge: 2,
    maxAge: 17,
    critical: true,
  },
  {
    id: "require-password",
    group: "Purchases, messaging and habits",
    title: "Require a password for every purchase",
    detail:
      "In Media & Purchases, set Always Require rather than Require After 15 Minutes. The 15-minute window is exactly long enough for an in-game currency screen after an approved download.",
    weight: 7,
    minutes: 3,
    minAge: 2,
    maxAge: 17,
  },
  {
    id: "communication-safety",
    group: "Purchases, messaging and habits",
    title: "Turn on Communication Safety",
    detail:
      "It detects nude images in Messages, AirDrop, FaceTime and photo pickers on the device itself, blurs them and offers the child a way out, without sending anything to Apple. It is on by default for children under 13 and worth turning on for teenagers too.",
    weight: 8,
    minutes: 4,
    minAge: 2,
    maxAge: 17,
  },
  {
    id: "communication-limits",
    group: "Purchases, messaging and habits",
    title: "Set Communication Limits to contacts only",
    detail:
      "Communication Limits restrict who the child can call, FaceTime and message, using the managed contacts list, and can be tighter during Downtime than during allowed hours.",
    weight: 6,
    minutes: 5,
    minAge: 2,
    maxAge: 12,
  },
  {
    id: "agreement",
    group: "Purchases, messaging and habits",
    title: "Agree the rules out loud, including what to do about nasty content",
    detail:
      "Settle where the phone charges overnight and the promise that showing you something frightening never costs them the phone. That promise is what makes them tell you.",
    weight: 8,
    minutes: 15,
    minAge: 2,
    maxAge: 17,
  },
  {
    id: "weekly-report",
    group: "Purchases, messaging and habits",
    title: "Read the weekly Screen Time report together",
    detail:
      "The report shows time per app, pickups and notifications. Going through it together turns limits into a conversation and shows which category limit is worth setting next.",
    weight: 5,
    minutes: 10,
    minAge: 6,
    maxAge: 17,
  },
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = [
  "Set up the child account",
  "Set the Screen Time limits",
  "Set content and web limits",
  "Purchases, messaging and habits",
];

export const DEFAULT_AGE = 10;
export const DEFAULT_DONE = ["device-passcode", "find-my"];

/** Bands as a percentage of applicable weight; the first band reached wins. */
export const BANDS = [
  { id: "ready", min: 90, label: "Ready to hand over", hint: "Account, limits, content and purchases are all set." },
  { id: "good", min: 70, label: "Mostly set up", hint: "The controls are on. Finish the habits and the conversation." },
  { id: "partial", min: 40, label: "Half set up", hint: "Enough to feel safe and not enough to be safe." },
  { id: "open", min: 0, label: "Barely started", hint: "Screen Time is effectively not managing this device." },
];

/** A missing critical step caps the band — restrictions without a passcode are decoration. */
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
 * The concrete Screen Time values to choose for a given age.
 *
 * Every field maps to a setting that exists in iOS rather than to an opinion:
 * the App Store rating tiers, the two restricted Web Content modes, the Clean
 * toggle for Apple media apps, Ask to Buy and Communication Limits.
 */
export function ratingPlanFor(age) {
  const parsed = readAge(age);
  if (parsed.error) return parsed;

  const band = RATING_BANDS.find((entry) => parsed.value <= entry.max) ||
    RATING_BANDS[RATING_BANDS.length - 1];

  const allowlist = parsed.value <= ALLOWLIST_MAX_AGE;

  return {
    age: parsed.value,
    appRating: band.rating,
    webFilter: allowlist ? "Allowed Websites Only" : "Limit Adult Websites",
    webFilterNote: allowlist
      ? "An allow-list is realistic while browsing is a short list of known sites."
      : "Automatic filtering, with your own always-allow and never-allow entries on top.",
    explicitMedia: parsed.value >= EXPLICIT_MUSIC_MIN_AGE ? "Explicit allowed by agreement" : "Clean",
    askToBuy: parsed.value <= ASK_TO_BUY_MAX_AGE,
    communicationLimits: parsed.value <= 12 ? "Contacts only" : "Everyone, with Downtime tighter",
    communicationSafety: true,
  };
}

/**
 * Score the setup for one child. Ticks on steps outside the child's age range
 * are ignored, so changing the age can never inflate the percentage.
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
