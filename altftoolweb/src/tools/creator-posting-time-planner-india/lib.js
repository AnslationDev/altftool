/**
 * Weekly posting-slot planning for an India-based creator.
 *
 * The time-zone conversion is exact: India Standard Time is a fixed UTC+05:30
 * with no daylight saving, so an IST wall-clock time maps to a single UTC
 * instant, which is then formatted in each target zone using the IANA database
 * (so northern-hemisphere daylight saving is handled correctly).
 *
 * The window scoring is a planning heuristic describing typical daily activity
 * patterns — it is not measured platform data.
 */

/** India Standard Time is UTC+05:30 all year; India observes no daylight saving. */
export const IST_OFFSET_MINUTES = 330;

export const MIN_SLOTS_PER_WEEK = 1;
export const MAX_SLOTS_PER_WEEK = 14;

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * Daily activity windows in IST, with the minute-of-day this tool posts at.
 * Times are minutes past midnight IST.
 */
export const WINDOWS = [
  {
    id: "early",
    label: "Early morning",
    startMin: 6 * 60 + 30,
    endMin: 8 * 60,
    postMin: 7 * 60,
    note: "Small but attentive; also the slot that lands in US evening for diaspora viewers.",
  },
  {
    id: "commute",
    label: "Morning commute",
    startMin: 8 * 60,
    endMin: 10 * 60,
    postMin: 9 * 60,
    note: "Phone-in-hand time on metros and buses in the metro cities.",
  },
  {
    id: "midmorning",
    label: "Mid-morning",
    startMin: 10 * 60 + 30,
    endMin: 12 * 60,
    postMin: 11 * 60,
    note: "Daytime-at-home audiences and second-screen viewing at work.",
  },
  {
    id: "lunch",
    label: "Lunch break",
    startMin: 12 * 60 + 30,
    endMin: 14 * 60 + 30,
    postMin: 13 * 60 + 30,
    note: "Reliable weekday spike; short-form performs better than long here.",
  },
  {
    id: "afternoon",
    label: "Late afternoon",
    startMin: 16 * 60,
    endMin: 18 * 60,
    postMin: 17 * 60,
    note: "School and college let-out; strong for student-facing content.",
  },
  {
    id: "primeEvening",
    label: "Prime evening",
    startMin: 19 * 60,
    endMin: 21 * 60,
    postMin: 20 * 60,
    note: "The densest window nationally, and also the most competitive.",
  },
  {
    id: "lateEvening",
    label: "Late evening",
    startMin: 21 * 60,
    endMin: 23 * 60,
    postMin: 22 * 60,
    note: "Long-form and podcasts hold attention better here than at 8 pm.",
  },
  {
    id: "night",
    label: "Night",
    startMin: 23 * 60,
    endMin: 24 * 60 + 60,
    postMin: 23 * 60 + 30,
    note: "Students and night-shift viewers; low competition, loyal repeat audience.",
  },
];

/**
 * Relative weight of each window by audience type, 0 to 1.
 * Planning heuristic based on when each group is typically free, not measured data.
 */
export const AUDIENCE_PROFILES = [
  {
    id: "professionals",
    label: "Working professionals (metro)",
    note: "Prime evening and the morning commute carry the week, with late evening a strong third and weekday lunch a dependable fourth.",
    weights: {
      early: 0.35,
      commute: 0.85,
      midmorning: 0.3,
      lunch: 0.7,
      afternoon: 0.35,
      primeEvening: 0.95,
      lateEvening: 0.75,
      night: 0.3,
    },
  },
  {
    id: "students",
    label: "Students and young adults",
    note: "Activity shifts late: afternoons after class and the 10 pm to midnight stretch.",
    weights: {
      early: 0.15,
      commute: 0.4,
      midmorning: 0.3,
      lunch: 0.55,
      afternoon: 0.8,
      primeEvening: 0.85,
      lateEvening: 0.95,
      night: 0.7,
    },
  },
  {
    id: "regional",
    label: "Tier-2 / Tier-3 and regional language",
    note: "Daytime usage runs higher and the evening peak starts a little earlier.",
    weights: {
      early: 0.4,
      commute: 0.6,
      midmorning: 0.6,
      lunch: 0.7,
      afternoon: 0.65,
      primeEvening: 0.9,
      lateEvening: 0.6,
      night: 0.25,
    },
  },
  {
    id: "homemakers",
    label: "Daytime-at-home audience",
    note: "The mid-morning to afternoon block outperforms the crowded evening peak.",
    weights: {
      early: 0.35,
      commute: 0.45,
      midmorning: 0.9,
      lunch: 0.8,
      afternoon: 0.75,
      primeEvening: 0.6,
      lateEvening: 0.4,
      night: 0.15,
    },
  },
  {
    id: "diaspora",
    label: "NRI / global diaspora",
    note: "Early morning and late night IST are the slots that land in waking hours abroad.",
    weights: {
      early: 0.9,
      commute: 0.5,
      midmorning: 0.35,
      lunch: 0.4,
      afternoon: 0.5,
      primeEvening: 0.55,
      lateEvening: 0.7,
      night: 0.85,
    },
  },
];

export const TARGET_ZONES = [
  { id: "Asia/Kolkata", label: "India (IST)" },
  { id: "Asia/Dubai", label: "UAE (Gulf)" },
  { id: "Europe/London", label: "United Kingdom" },
  { id: "America/New_York", label: "US East Coast" },
  { id: "America/Los_Angeles", label: "US West Coast" },
  { id: "Asia/Singapore", label: "Singapore / Malaysia" },
  { id: "Australia/Sydney", label: "Australia (east)" },
  { id: "Africa/Nairobi", label: "East Africa" },
];

export const DEFAULT_ZONE_IDS = [
  "Asia/Kolkata",
  "Asia/Dubai",
  "Europe/London",
  "America/New_York",
];

export function getAudienceProfile(profileId) {
  return AUDIENCE_PROFILES.find((profile) => profile.id === profileId) || AUDIENCE_PROFILES[0];
}

/** Minutes past midnight to "HH:MM", wrapping past 24h. */
export function formatClock(minutes) {
  const value = ((Math.round(Number(minutes) || 0) % 1440) + 1440) % 1440;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(Math.floor(value / 60))}:${pad(value % 60)}`;
}

/**
 * The UTC instant for a wall-clock IST time on a given date.
 * @param {string} isoDate "YYYY-MM-DD"
 * @param {number} minuteOfDay minutes past midnight IST (may exceed 1440)
 * @returns {Date|null}
 */
export function istInstant(isoDate, minuteOfDay) {
  const match = String(isoDate ?? "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const minutes = Number(minuteOfDay);
  if (!Number.isFinite(minutes)) return null;
  const [, y, m, d] = match;
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  const base = Date.UTC(year, month - 1, day);
  // Date.UTC silently rolls invalid calendar dates (e.g. Feb 30) into the
  // next valid date instead of erroring, so round-trip the components to
  // reject them here rather than plan a week from the wrong start date.
  const check = new Date(base);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  const instant = new Date(base + (minutes - IST_OFFSET_MINUTES) * 60000);
  return Number.isNaN(instant.getTime()) ? null : instant;
}

/**
 * Format a UTC instant as the local wall clock in an IANA time zone.
 * Returns { time, weekday, dayShift } where dayShift is -1, 0 or +1 relative
 * to the IST calendar date.
 */
export function formatInZone(instant, timeZone, istDateIso) {
  if (!(instant instanceof Date) || Number.isNaN(instant.getTime())) return null;
  let parts;
  try {
    parts = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short",
    }).formatToParts(instant);
  } catch {
    return null;
  }

  const get = (type) => (parts.find((part) => part.type === type) || {}).value || "";
  const localDate = `${get("year")}-${get("month")}-${get("day")}`;
  const hour = get("hour") === "24" ? "00" : get("hour");
  const time = `${hour}:${get("minute")}`;

  let dayShift = 0;
  if (istDateIso && /^\d{4}-\d{2}-\d{2}$/.test(istDateIso) && localDate !== istDateIso) {
    dayShift = localDate > istDateIso ? 1 : -1;
  }

  return { time, weekday: get("weekday"), date: localDate, dayShift };
}

/**
 * Build a weekly posting plan.
 * @param {object} input
 * @param {string} input.audienceId
 * @param {number} input.slotsPerWeek
 * @param {string} input.weekStartDate "YYYY-MM-DD", the date of the first slot
 * @param {string[]} [input.zoneIds]
 */
export function planPostingWeek(input = {}) {
  const {
    audienceId = AUDIENCE_PROFILES[0].id,
    slotsPerWeek,
    weekStartDate,
    zoneIds = DEFAULT_ZONE_IDS,
  } = input;

  const slots = Number(slotsPerWeek);
  if (!Number.isInteger(slots) || slots < MIN_SLOTS_PER_WEEK || slots > MAX_SLOTS_PER_WEEK) {
    return {
      error: `Posts per week must be a whole number between ${MIN_SLOTS_PER_WEEK} and ${MAX_SLOTS_PER_WEEK}.`,
    };
  }

  const startCheck = istInstant(weekStartDate, 0);
  if (!startCheck) {
    return { error: "Week start must be a real date in YYYY-MM-DD form." };
  }

  const zones = TARGET_ZONES.filter((zone) => zoneIds.includes(zone.id));
  if (zones.length === 0) {
    return { error: "Select at least one audience time zone." };
  }

  const profile = getAudienceProfile(audienceId);

  const ranked = WINDOWS.map((window) => ({
    ...window,
    score: profile.weights[window.id] ?? 0,
  }))
    .slice()
    .sort((a, b) => b.score - a.score || a.postMin - b.postMin);

  const startMatch = String(weekStartDate).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const startBase = Date.UTC(
    Number(startMatch[1]),
    Number(startMatch[2]) - 1,
    Number(startMatch[3]),
  );
  const startWeekday = new Date(startBase).getUTCDay();

  // Spread the slots evenly across the seven days of the week.
  const plan = [];
  for (let i = 0; i < slots; i += 1) {
    const dayOffset = Math.floor((i * 7) / slots);
    const window = ranked[i % ranked.length];
    const dateMs = startBase + dayOffset * 86400000;
    const dateObj = new Date(dateMs);
    const pad = (n) => String(n).padStart(2, "0");
    const istDate = `${dateObj.getUTCFullYear()}-${pad(dateObj.getUTCMonth() + 1)}-${pad(dateObj.getUTCDate())}`;
    const instant = istInstant(istDate, window.postMin);

    plan.push({
      key: `${istDate}-${window.id}-${i}`,
      istDate,
      dayName: DAY_NAMES[(startWeekday + dayOffset) % 7],
      dayOffset,
      window: {
        id: window.id,
        label: window.label,
        note: window.note,
        score: window.score,
        range: `${formatClock(window.startMin)}–${formatClock(window.endMin)}`,
      },
      istTime: formatClock(window.postMin),
      zones: zones.map((zone) => ({
        id: zone.id,
        label: zone.label,
        ...(formatInZone(instant, zone.id, istDate) || {
          time: "—",
          weekday: "",
          date: "",
          dayShift: 0,
        }),
      })),
    });
  }

  const usedWindows = [...new Set(plan.map((item) => item.window.id))];
  const averageScore = plan.reduce((sum, item) => sum + item.window.score, 0) / plan.length;

  return {
    profile: { id: profile.id, label: profile.label, note: profile.note },
    slotsPerWeek: slots,
    weekStartDate,
    ranked,
    plan,
    zones,
    usedWindows: usedWindows.length,
    averageScore,
    topWindow: ranked[0],
  };
}
