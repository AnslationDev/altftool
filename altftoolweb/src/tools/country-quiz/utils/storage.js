const STATS_KEY = "altft_country_quiz_stats";
const HISTORY_KEY = "altft_country_quiz_history";
const LEADERBOARD_KEY = "altft_country_quiz_leaderboard";
const DAILY_KEY = "altft_country_quiz_daily";
const MAX_HISTORY = 50;
const MAX_LEADERBOARD = 20;

export function loadStats() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(STATS_KEY)) || null;
  } catch {
    return null;
  }
}

export function saveStats(stats) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {}
}

export function loadHistory() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveHistory(entry) {
  if (typeof window === "undefined") return;
  try {
    const history = loadHistory();
    history.unshift(entry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
  } catch {}
}

export function loadLeaderboard() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LEADERBOARD_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveLeaderboard(entry) {
  if (typeof window === "undefined") return;
  try {
    const board = loadLeaderboard();
    board.push(entry);
    board.sort((a, b) => b.accuracy - a.accuracy || a.time - b.time);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(board.slice(0, MAX_LEADERBOARD)));
  } catch {}
}

export function getDailyChallenge() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveDailyChallenge(data) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DAILY_KEY, JSON.stringify(data));
  } catch {}
}

export function getTodaySeed() {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

export function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
