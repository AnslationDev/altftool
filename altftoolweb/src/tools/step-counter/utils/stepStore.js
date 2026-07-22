"use client";

/**
 * Step Counter — persistence + derived stats.
 * All data lives in the visitor's browser and PERSISTS across visits
 * (localStorage — it survives reloads, navigation AND closing the browser,
 * so today's steps, goal, achievements and preferences are still there when
 * the visitor returns). Nothing is uploaded — no network calls.
 */

export const STORAGE_KEY = "ALTFT_STEP_COUNTER_V1";

export const DEFAULT_GOAL = 10000;
export const MIN_GOAL = 500;
export const MAX_GOAL = 100000;

export const METERS_PER_STEP = 0.762;
export const CALORIES_PER_STEP = 0.04;
export const STEPS_PER_FLOOR = 650; // rough estimate used for the "floors" tile

// Voice-coach milestone intervals the user can pick from (steps).
export const VOICE_INTERVALS = [50, 100, 250, 500, 1000];
export const DEFAULT_VOICE = { enabled: true, interval: 50 };

export const ACHIEVEMENTS = [
  {
    id: "first-steps",
    name: "First Steps",
    description: "Complete your first 1,000 steps",
  },
  {
    id: "5k-day",
    name: "5K Achiever",
    description: "Reach 5,000 steps in a day",
  },
  {
    id: "10k-day",
    name: "10K Achiever",
    description: "Reach 10,000 steps in a day",
  },
  {
    id: "streak-7",
    name: "Consistency King",
    description: "Maintain a 7 day streak",
  },
  {
    id: "monthly-30",
    name: "Monthly Warrior",
    description: "Be active for 30 days in a month",
  },
];

export const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/* ---------------------------------- dates --------------------------------- */

export function dateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayKey() {
  return dateKey(new Date());
}

/* ---------------------------------- state --------------------------------- */

export function createEmptyState() {
  return {
    goal: DEFAULT_GOAL,
    history: {},
    achievements: {},
    voice: { ...DEFAULT_VOICE },
  };
}

function sanitizeState(raw) {
  const base = createEmptyState();
  if (!raw || typeof raw !== "object") return base;

  const goal = Number(raw.goal);
  if (Number.isFinite(goal)) {
    base.goal = Math.min(MAX_GOAL, Math.max(MIN_GOAL, Math.round(goal)));
  }

  if (raw.history && typeof raw.history === "object") {
    for (const [key, value] of Object.entries(raw.history)) {
      const steps = Number(value?.steps);
      const activeMs = Number(value?.activeMs);
      if (/^\d{4}-\d{2}-\d{2}$/.test(key) && Number.isFinite(steps)) {
        base.history[key] = {
          steps: Math.max(0, Math.round(steps)),
          activeMs: Number.isFinite(activeMs) ? Math.max(0, activeMs) : 0,
        };
      }
    }
  }

  if (raw.achievements && typeof raw.achievements === "object") {
    for (const def of ACHIEVEMENTS) {
      const unlockedAt = raw.achievements[def.id];
      if (typeof unlockedAt === "string" && !Number.isNaN(Date.parse(unlockedAt))) {
        base.achievements[def.id] = unlockedAt;
      }
    }
  }

  if (raw.voice && typeof raw.voice === "object") {
    if (typeof raw.voice.enabled === "boolean") {
      base.voice.enabled = raw.voice.enabled;
    }
    const interval = Number(raw.voice.interval);
    if (VOICE_INTERVALS.includes(interval)) {
      base.voice.interval = interval;
    }
  }

  return base;
}

export function loadState() {
  if (typeof window === "undefined") return createEmptyState();
  try {
    // Prefer durable localStorage; fall back to any data an older build left
    // in sessionStorage so a returning visitor keeps their in-progress day.
    const raw =
      window.localStorage.getItem(STORAGE_KEY) ??
      window.sessionStorage.getItem(STORAGE_KEY);
    return sanitizeState(JSON.parse(raw || "null"));
  } catch {
    return createEmptyState();
  }
}

export function saveState(state) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage may be unavailable (private mode / quota) — the tool keeps working in memory */
  }
}

/* ------------------------------ derived stats ------------------------------ */

export function getDay(history, key) {
  return history[key] || { steps: 0, activeMs: 0 };
}

export function getWeekSeries(history, ref = new Date()) {
  const mondayOffset = (ref.getDay() + 6) % 7; // 0 = Monday
  const monday = new Date(ref);
  monday.setDate(ref.getDate() - mondayOffset);
  const tk = dateKey(ref);

  return WEEK_LABELS.map((label, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    const key = dateKey(day);
    return {
      key,
      label,
      steps: getDay(history, key).steps,
      isToday: key === tk,
      isFuture: key > tk,
    };
  });
}

// Rolling last-7-days window ending today (today is always the LAST point) —
// used by the redesigned app screen's weekly chart, where "today" sits at the
// right edge with a highlight ring (vs. getWeekSeries' fixed Mon–Sun week).
export function getLast7Series(history, ref = new Date()) {
  const tk = dateKey(ref);
  const days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const day = new Date(ref);
    day.setDate(ref.getDate() - i);
    const key = dateKey(day);
    days.push({
      key,
      label: day.toLocaleDateString("en-US", { weekday: "short" }),
      steps: getDay(history, key).steps,
      isToday: key === tk,
    });
  }
  return days;
}

export function getStreak(history, ref = new Date()) {
  const cursor = new Date(ref);
  // An empty "today" doesn't break the streak — the day isn't over yet.
  if (getDay(history, dateKey(cursor)).steps <= 0) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (getDay(history, dateKey(cursor)).steps > 0) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function getLifetimeStats(history) {
  let totalSteps = 0;
  let daysActive = 0;
  let bestDay = { key: null, steps: 0 };

  for (const [key, value] of Object.entries(history)) {
    const steps = value?.steps || 0;
    if (steps <= 0) continue;
    totalSteps += steps;
    daysActive += 1;
    if (steps > bestDay.steps) bestDay = { key, steps };
  }

  return {
    totalSteps,
    daysActive,
    bestDay,
    avgSteps: daysActive ? Math.round(totalSteps / daysActive) : 0,
  };
}

export function getMonthlyActiveDays(history, ref = new Date()) {
  const monthPrefix = dateKey(ref).slice(0, 7);
  return Object.entries(history).filter(
    ([key, value]) => key.startsWith(monthPrefix) && (value?.steps || 0) > 0,
  ).length;
}

export function evaluateAchievements(state, now = new Date()) {
  const { history } = state;
  const { totalSteps, bestDay } = getLifetimeStats(history);
  const streak = getStreak(history, now);
  const monthlyDays = getMonthlyActiveDays(history, now);

  const conditions = {
    "first-steps": totalSteps >= 1000,
    "5k-day": bestDay.steps >= 5000,
    "10k-day": bestDay.steps >= 10000,
    "streak-7": streak >= 7,
    "monthly-30": monthlyDays >= 30,
  };

  const achievements = { ...state.achievements };
  const unlockedNow = [];

  for (const def of ACHIEVEMENTS) {
    if (conditions[def.id] && !achievements[def.id]) {
      achievements[def.id] = now.toISOString();
      unlockedNow.push(def.id);
    }
  }

  return { achievements, unlockedNow };
}

/* -------------------------------- formatting ------------------------------- */

export function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-US");
}

export function distanceKm(steps) {
  return ((steps * METERS_PER_STEP) / 1000).toFixed(2);
}

export function caloriesBurned(steps) {
  return Math.round(steps * CALORIES_PER_STEP);
}

export function estimateFloors(steps) {
  return Math.floor(steps / STEPS_PER_FLOOR);
}

// Walking pace in steps-per-minute. Needs ≥30s of active time before the
// number is meaningful — below that we report 0 instead of a wild spike.
export function paceSpm(steps, activeMs) {
  if (!activeMs || activeMs < 30000) return 0;
  return Math.round(steps / (activeMs / 60000));
}

export function stepsRemaining(goal, steps) {
  return Math.max(0, (goal || 0) - (steps || 0));
}

export function formatActiveTime(activeMs) {
  const totalMinutes = Math.floor((activeMs || 0) / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes}m`;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

export function timeAgo(iso, now = Date.now()) {
  const diffMs = Math.max(0, now - new Date(iso).getTime());
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}
