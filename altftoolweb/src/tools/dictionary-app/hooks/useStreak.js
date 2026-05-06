import { useState } from "react";

const STORAGE_KEY = "user_streak";

function getTodayDate() {
  return new Date().toLocaleDateString("en-IN");
}

function getYesterdayDate() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toLocaleDateString("en-IN");
}

function getStored() {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function getInitialStreakState() {
  const today = getTodayDate();
  const yesterday = getYesterdayDate();
  const stored = getStored();

  let newStreak = 1;
  let newBest = stored?.bestStreak || 1;

  if (stored) {
    if (stored.lastVisit === today) {
      newStreak = stored.streak;
      newBest = stored.bestStreak;
    } else if (stored.lastVisit === yesterday) {
      newStreak = stored.streak + 1;
      newBest = Math.max(newStreak, stored.bestStreak);
    } else {
      newStreak = 1;
      newBest = stored.bestStreak;
    }
  }

  const newData = {
    lastVisit: today,
    streak: newStreak,
    bestStreak: newBest,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  }

  return newData;
}

export function useStreak() {
  const [streakState] = useState(getInitialStreakState);
  const { streak, bestStreak, lastVisit } = streakState;

  return { streak, bestStreak, lastVisit };
}
