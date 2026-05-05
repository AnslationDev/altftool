import { useState, useEffect } from "react";

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

export function useStreak() {
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lastVisit, setLastVisit] = useState(null);

  useEffect(() => {
    const today = getTodayDate();
    const yesterday = getYesterdayDate();
    const stored = getStored();

    let newStreak = 1;
    let newBest = stored?.bestStreak || 1;

    if (stored) {
      if (stored.lastVisit === today) {
        // Aaj already visit kiya — same streak
        newStreak = stored.streak;
        newBest = stored.bestStreak;
      } else if (stored.lastVisit === yesterday) {
        // Kal bhi aaya tha — streak++
        newStreak = stored.streak + 1;
        newBest = Math.max(newStreak, stored.bestStreak);
      } else {
        // Gap aagya — reset
        newStreak = 1;
        newBest = stored.bestStreak;
      }
    }

    const newData = {
      lastVisit: today,
      streak: newStreak,
      bestStreak: newBest,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    setStreak(newStreak);
    setBestStreak(newBest);
    setLastVisit(today);
  }, []);

  return { streak, bestStreak, lastVisit };
}