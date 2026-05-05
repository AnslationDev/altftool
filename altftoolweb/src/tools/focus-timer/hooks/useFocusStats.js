"use client"

import { useState } from "react";

const KEY = "focusStats";
const STREAK_KEY = "focusStreak";

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

// Streak save/load functions
function getStreakData() {
  try {
    return JSON.parse(localStorage.getItem(STREAK_KEY)) || {
      streak: 0,
      lastSessionDate: null,
    };
  } catch {
    return { streak: 0, lastSessionDate: null };
  }
}

function saveStreakData(data) {
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

function getAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

function saveAll(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function useFocusStats() {
  const todayKey = getTodayKey();

  const getToday = () => {
    const all = getAll();
    return all[todayKey] || { focusMinutes: 0, sessions: 0, distractions: 0 };
  };

  const calcTotalSessions = () => {
    const all = getAll();
    return Object.values(all).reduce((acc, day) => acc + (day.sessions || 0), 0);
  };

    const calcStreak = () => {
    const { streak, lastSessionDate } = getStreakData();
    if (!lastSessionDate) return 0;

    const today = getTodayKey();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split("T")[0];

    if (lastSessionDate === today || lastSessionDate === yesterdayKey) {
      return streak;
    }
    return 0;
  };

  const [todayStats, setTodayStats] = useState(getToday);
  const [totalSessions, setTotalSessions] = useState(calcTotalSessions);
const [streak, setStreak] = useState(calcStreak);

  const refresh = () => {
    setTodayStats(getToday());
    setTotalSessions(calcTotalSessions());
  };

    // ── Streak increment ──
  const incrementStreak = () => {
    const today = getTodayKey();
    const { streak: currentStreak, lastSessionDate } = getStreakData();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split("T")[0];

    let newStreak;

    if (lastSessionDate === today) {
      newStreak = currentStreak;
    } else if (lastSessionDate === yesterdayKey) {
      newStreak = currentStreak + 1;
    } else {
      newStreak = 1;
    }

    saveStreakData({ streak: newStreak, lastSessionDate: today });
    setStreak(newStreak);
  };

   // ── Streak reset ──
  const resetStreak = () => {
    saveStreakData({ streak: 0, lastSessionDate: null });
    setStreak(0);
  };

  const addSession = (focusMinutes) => {
    const all = getAll();
    const today = all[todayKey] || { focusMinutes: 0, sessions: 0, distractions: 0 };
    today.sessions += 1;
    today.focusMinutes += focusMinutes;
    all[todayKey] = today;
    saveAll(all);
    incrementStreak();
    refresh();
  };

  const addDistraction = () => {
    const all = getAll();
    const today = all[todayKey] || { focusMinutes: 0, sessions: 0, distractions: 0 };
    today.distractions += 1;
    all[todayKey] = today;
    saveAll(all);
    refresh();
  };

  const getAllStats = () => getAll();

  return {
    todayStats,
    totalSessions,
    streak,    
    resetStreak,   
    addSession,
    addDistraction,
    getAllStats,
  };
}