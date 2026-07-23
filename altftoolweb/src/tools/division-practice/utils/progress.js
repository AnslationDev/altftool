"use client";

const STORAGE_KEY = "ALTFT_DIVISION_PRACTICE_V1";

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { sessions: [], achievements: [], totalSolved: 0 };
  } catch {
    return { sessions: [], achievements: [], totalSolved: 0 };
  }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage full or unavailable
  }
}

export function addSession(progress, session) {
  const updated = {
    ...progress,
    sessions: [...progress.sessions.slice(-49), session],
    totalSolved: progress.totalSolved + (session.totalQuestions || 0),
  };
  saveProgress(updated);
  return updated;
}

export function unlockAchievement(progress, achievementId) {
  if (progress.achievements.includes(achievementId)) return progress;
  const updated = {
    ...progress,
    achievements: [...progress.achievements, achievementId],
  };
  saveProgress(updated);
  return updated;
}

export function getSolvedToday(progress) {
  const today = new Date().toISOString().split("T")[0];
  return progress.sessions
    .filter((s) => s.date && s.date.startsWith(today))
    .reduce((sum, s) => sum + (s.totalQuestions || 0), 0);
}

export function getWeeklyStats(progress) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return progress.sessions.filter((s) => s.date && new Date(s.date) >= weekAgo);
}
