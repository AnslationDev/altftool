// Age Calculator engine — a single source of truth for every derived stat.
// All functions are pure and accept an optional `now` for testability.

import { getBirthFacts } from "./factsData.js";

const MS = { sec: 1000, min: 60000, hour: 3600000, day: 86400000 };

export const formatDate = (date) =>
  date instanceof Date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
    : "";

export const formatShortDate = (date) =>
  date instanceof Date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "";

export const weekdayName = (date) =>
  date instanceof Date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString("en-GB", { weekday: "long" })
    : "";

// Exact calendar age (years, months, days) with correct month-length handling.
export function calculateExactAge(birth, now = new Date()) {
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

// Absolute totals lived, from the raw millisecond difference.
export function calculateTotals(birth, now = new Date()) {
  const diff = Math.max(0, now - birth);
  const totalDays = Math.floor(diff / MS.day);
  return {
    months: Math.floor(totalDays / 30.4375),
    weeks: Math.floor(totalDays / 7),
    days: totalDays,
    hours: Math.floor(diff / MS.hour),
    minutes: Math.floor(diff / MS.min),
    seconds: Math.floor(diff / MS.sec),
  };
}

// Fun "biology / cosmos" figures derived from time lived.
export function calculateBodyStats(totals) {
  return {
    heartbeats: totals.minutes * 72, // ~72 bpm average
    breaths: totals.minutes * 16, // ~16 breaths/min average
    sunrises: totals.days,
    weekends: totals.weeks,
    moonCycles: Math.floor(totals.days / 29.530588), // synodic month
    earthRevolutions: Math.floor(totals.days / 365.2425),
  };
}

// Countdown to the next birthday.
export function calculateNextBirthday(birth, now = new Date()) {
  const thisYear = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
  const next = thisYear < now ? new Date(now.getFullYear() + 1, birth.getMonth(), birth.getDate()) : thisYear;
  const diff = next - now;
  const turningAge = next.getFullYear() - birth.getFullYear();
  return {
    date: next,
    weekday: weekdayName(next),
    turningAge,
    days: Math.floor(diff / MS.day),
    hours: Math.floor((diff / MS.hour) % 24),
    minutes: Math.floor((diff / MS.min) % 60),
    seconds: Math.floor((diff / MS.sec) % 60),
  };
}

// Day-count milestones (1k / 5k / 10k / 25k days, 100 years).
export function calculateMilestones(birth, now = new Date()) {
  const dayMilestones = [1000, 5000, 10000, 25000].map((n) => {
    const date = new Date(birth.getTime() + n * MS.day);
    const reached = date <= now;
    return {
      label: `${n.toLocaleString("en-US")} Days`,
      date,
      reached,
      remainingDays: reached ? 0 : Math.ceil((date - now) / MS.day),
    };
  });
  const century = new Date(birth.getFullYear() + 100, birth.getMonth(), birth.getDate());
  dayMilestones.push({
    label: "100 Years",
    date: century,
    reached: century <= now,
    remainingDays: century <= now ? 0 : Math.ceil((century - now) / MS.day),
  });
  return dayMilestones;
}

// Life stages for the horizontal timeline.
export function calculateLifeTimeline(birth, now = new Date()) {
  const y = birth.getFullYear();
  return [
    { stage: "Birth", range: formatShortDate(birth), year: y, reached: true },
    { stage: "Childhood", range: `${y} – ${y + 12}`, year: y + 6, reached: now.getFullYear() >= y },
    { stage: "Teen Years", range: `${y + 13} – ${y + 19}`, year: y + 13, reached: now.getFullYear() >= y + 13 },
    { stage: "Adulthood", range: `${y + 20} – Now`, year: y + 20, reached: now.getFullYear() >= y + 20 },
    { stage: "Today", range: formatShortDate(now), year: now.getFullYear(), reached: true },
  ];
}

// One call → everything the page renders.
export function calculateAgeData(birth, now = new Date()) {
  const age = calculateExactAge(birth, now);
  const totals = calculateTotals(birth, now);
  return {
    age,
    totals,
    totalMinutes: totals.minutes,
    totalSeconds: totals.seconds,
    body: calculateBodyStats(totals),
    nextBirthday: calculateNextBirthday(birth, now),
    milestones: calculateMilestones(birth, now),
    timeline: calculateLifeTimeline(birth, now),
    facts: getBirthFacts(birth),
  };
}

// Compare two people's ages (for the "Compare With Someone" card).
export function compareAges(birthA, birthB, now = new Date()) {
  const a = calculateExactAge(birthA, now);
  const b = calculateExactAge(birthB, now);
  const diffMs = Math.abs(birthA - birthB);
  const diffDays = Math.floor(diffMs / MS.day);
  const older = birthA < birthB ? "A" : "B";
  return {
    a,
    b,
    older,
    diffYears: Math.floor(diffDays / 365.2425),
    diffDays,
  };
}
