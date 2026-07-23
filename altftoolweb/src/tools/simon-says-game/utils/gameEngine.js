"use client";

export const COLORS = ["green", "red", "yellow", "blue"];

export const MODES = {
  classic: { label: "Classic", description: "Repeat the sequence until you make a mistake." },
  endless: { label: "Endless", description: "Keep going as long as you can. No lives." },
  timed: { label: "Timed", description: "Race the clock. Each level adds more time." },
  practice: { label: "Practice", description: "Learn at your own pace. Unlimited retries." },
};

export const DIFFICULTIES = {
  easy: { label: "Easy", speed: 700, pauseMs: 400, inputTimeLimit: 0, maxSequenceLength: Infinity },
  medium: { label: "Medium", speed: 500, pauseMs: 300, inputTimeLimit: 0, maxSequenceLength: Infinity },
  hard: { label: "Hard", speed: 350, pauseMs: 200, inputTimeLimit: 4000, maxSequenceLength: Infinity },
  expert: { label: "Expert", speed: 200, pauseMs: 150, inputTimeLimit: 2500, maxSequenceLength: Infinity },
};

const TIME_PER_LEVEL = {
  easy: 10,
  medium: 8,
  hard: 6,
  expert: 4,
};

export function generateSequence(length) {
  const seq = [];
  for (let i = 0; i < length; i++) {
    seq.push(COLORS[Math.floor(Math.random() * COLORS.length)]);
  }
  return seq;
}

export function appendToSequence(sequence) {
  return [...sequence, COLORS[Math.floor(Math.random() * COLORS.length)]];
}

export function getTimedModeTime(level, difficulty) {
  const base = TIME_PER_LEVEL[difficulty] || 8;
  return Math.max(3, base + Math.floor(level / 3));
}

export function calculateScore(level, difficulty) {
  const multipliers = { easy: 1, medium: 2, hard: 3, expert: 5 };
  return level * (multipliers[difficulty] || 1) * 10;
}

export function calculateAccuracy(totalAttempts, correctAttempts) {
  if (totalAttempts === 0) return 0;
  return Math.round((correctAttempts / totalAttempts) * 100);
}

export function getAccuracyGrade(accuracy) {
  if (accuracy >= 98) return "S+";
  if (accuracy >= 95) return "S";
  if (accuracy >= 90) return "A";
  if (accuracy >= 80) return "B";
  if (accuracy >= 70) return "C";
  if (accuracy >= 60) return "D";
  return "F";
}

export function getPerformanceMessage(accuracy, level) {
  if (level <= 2) return "Just getting started!";
  if (accuracy >= 98) return "Perfect memory! Incredible!";
  if (accuracy >= 90) return "Outstanding reflexes!";
  if (accuracy >= 80) return "Sharp memory skills!";
  if (accuracy >= 70) return "Good focus, keep practicing!";
  if (accuracy >= 60) return "Room for improvement.";
  return "Try an easier difficulty!";
}

export const INITIAL_STATS = {
  gamesPlayed: 0,
  gamesWon: 0,
  highestLevel: 0,
  highestScore: 0,
  totalAccuracy: 0,
  accuracyCount: 0,
  bestReactionTime: Infinity,
};

export function loadStats() {
  try {
    const raw = localStorage.getItem("simon-says-stats");
    return raw ? { ...INITIAL_STATS, ...JSON.parse(raw) } : { ...INITIAL_STATS };
  } catch {
    return { ...INITIAL_STATS };
  }
}

export function saveStats(stats) {
  try {
    localStorage.setItem("simon-says-stats", JSON.stringify(stats));
  } catch { /* silent */ }
}

export function updateStatsAfterGame(stats, { level, score, accuracy, won }) {
  const updated = { ...stats };
  updated.gamesPlayed += 1;
  if (won) updated.gamesWon += 1;
  updated.highestLevel = Math.max(updated.highestLevel, level);
  updated.highestScore = Math.max(updated.highestScore, score);
  updated.totalAccuracy += accuracy;
  updated.accuracyCount += 1;
  return updated;
}

export function getAverageAccuracy(stats) {
  if (stats.accuracyCount === 0) return 0;
  return Math.round(stats.totalAccuracy / stats.accuracyCount);
}

const LEADERBOARD_KEY = "simon-says-leaderboard";
const MAX_LEADERBOARD = 10;

export function loadLeaderboard() {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToLeaderboard(entry) {
  try {
    const board = loadLeaderboard();
    board.push({
      ...entry,
      date: new Date().toLocaleDateString(),
    });
    board.sort((a, b) => b.score - a.score || b.level - a.level);
    const trimmed = board.slice(0, MAX_LEADERBOARD);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(trimmed));
    return trimmed;
  } catch {
    return [];
  }
}
