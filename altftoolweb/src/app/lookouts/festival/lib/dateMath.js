// Pure date-resolution helpers for festival occurrences.
//
// resolveEstimatedDate() uses only the local dataset (festivals.js) and is
// always available, synchronously, with no network call — used as the
// immediate fallback and as the value rendered before a live upstream
// lookup resolves. applyLiveHolidayOverride() supersedes it whenever a
// matching Nager.Date public-holiday entry is found (see lib/upstream.js).

function pad2(value) {
  return String(value).padStart(2, "0");
}

export function toIsoDate(year, month, day) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// The festival's date *within one specific year*, regardless of whether that
// date has already passed.
//
// This is what a calendar needs, and it is not the same question
// resolveEstimatedDate() answers. That one finds the next occurrence from
// today and rolls forward, so on 4 Aug 2026 it reports Krishna Janmashtami as
// 4 Sep 2026 — correct for a countdown, wrong for deciding which month tab
// the festival belongs in. Filtering a calendar on `festival.month` is wrong
// too: that field is the month the festival *typically* falls in, and lunar
// festivals drift out of it (Krishna Janmashtami is filed under 8 but lands
// in September in 2026).
//
// Returns null when the festival has neither an override for the year nor a
// usable fixed month/day.
export function resolveDateInYear(festival, year) {
  const override = festival?.dateOverrides?.[year];
  // An override is only usable if it actually falls in the year it is keyed
  // under. A mis-keyed entry (festivals.js briefly had `2026: "2027-01-14"`)
  // would otherwise put a 2027 card in the 2026 calendar, since the month
  // reads the same either way. Falling through to the fixed month/day keeps
  // the festival on the calendar, in the right year, at its typical date.
  if (override && override.startsWith(`${year}-`)) return override;
  if (!festival?.month || !festival?.day) return null;
  return toIsoDate(year, festival.month, festival.day);
}

// The 1-12 month an ISO date falls in, read off the string rather than via
// `new Date()` — parsing "2026-09-04" as a Date and calling getMonth() shifts
// it a day (and sometimes a month) west of UTC.
export function getIsoMonth(iso) {
  if (!iso || iso.length < 7) return null;
  const month = Number(iso.slice(5, 7));
  return Number.isFinite(month) ? month : null;
}

// Finds the next occurrence on/after `now` from an explicit per-year map
// (dateOverrides) or, failing that, rolls a fixed month/day forward year by
// year until it lands on/after `now`.
export function resolveEstimatedDate(festival, { now = new Date() } = {}) {
  const today = startOfDay(now);
  const overrides = festival.dateOverrides || {};
  const overrideYears = Object.keys(overrides)
    .map(Number)
    .filter((year) => Number.isFinite(year))
    .sort((a, b) => a - b);

  for (const year of overrideYears) {
    const candidate = startOfDay(new Date(`${overrides[year]}T00:00:00`));
    if (candidate.getTime() >= today.getTime()) {
      return overrides[year];
    }
  }

  // No override covers a future date — roll the fixed month/day forward.
  let year = today.getFullYear();
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const iso = toIsoDate(year, festival.month, festival.day);
    const candidate = startOfDay(new Date(`${iso}T00:00:00`));
    if (candidate.getTime() >= today.getTime()) {
      return iso;
    }
    year += 1;
  }

  return toIsoDate(year, festival.month, festival.day);
}

// Given the raw Nager.Date PublicHolidays response for a single
// country+year, find an entry whose name/localName matches the festival's
// nagerMatch.nameContains list. Returns an ISO date string or null.
export function findNagerMatch(holidays, nagerMatch) {
  if (!Array.isArray(holidays) || !nagerMatch?.nameContains?.length) return null;

  const needles = nagerMatch.nameContains.map((s) => s.toLowerCase());

  const hit = holidays.find((holiday) => {
    const haystacks = [holiday.name, holiday.localName].filter(Boolean).map((s) => s.toLowerCase());
    return needles.some((needle) => haystacks.some((haystack) => haystack.includes(needle)));
  });

  return hit?.date || null;
}

// Resolves the best-known next occurrence for a festival: prefers a live
// Nager.Date match (checked against both `year` and `year + 1` holiday
// sets, since the estimated date may already have rolled into next year),
// falling back to the local estimate.
export function resolveNextOccurrence(festival, { now = new Date(), holidaysByYear = {} } = {}) {
  const estimatedIso = resolveEstimatedDate(festival, { now });
  const estimatedYear = Number(estimatedIso.slice(0, 4));

  if (festival.nagerMatch) {
    for (const year of [estimatedYear, estimatedYear + 1, estimatedYear - 1]) {
      const liveMatch = findNagerMatch(holidaysByYear[year], festival.nagerMatch);
      if (liveMatch && startOfDay(new Date(`${liveMatch}T00:00:00`)).getTime() >= startOfDay(now).getTime()) {
        return { date: liveMatch, source: "live" };
      }
    }
  }

  return { date: estimatedIso, source: "estimate" };
}

export function getCountdownParts(targetIso, now = new Date()) {
  const target = new Date(`${targetIso}T00:00:00`);
  // A missing/unparseable date would otherwise propagate NaN through every
  // arithmetic step below and render as "NaN" in the countdown pills.
  if (Number.isNaN(target.getTime())) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const diffMs = Math.max(0, target.getTime() - now.getTime());

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, isPast: diffMs <= 0 };
}

// Returns null (rather than the string "Invalid Date") when `iso` is missing
// or unparseable, so callers can render nothing instead of leaking it to the
// page.
export function formatDateLabel(iso, { month = "short", day = "numeric", year = "numeric" } = {}) {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { month, day, year });
}

export function getStatusLabel(targetIso, now = new Date()) {
  const target = new Date(`${targetIso}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;

  const { days } = getCountdownParts(targetIso, now);
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days <= 7) return "This Week";
  return "Upcoming";
}

export function getMonthName(monthNumber) {
  return new Date(2000, monthNumber - 1, 1).toLocaleDateString("en-US", { month: "long" });
}
