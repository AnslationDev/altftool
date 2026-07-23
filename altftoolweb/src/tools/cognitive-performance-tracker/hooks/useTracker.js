"use client";

import { useState, useCallback } from "react";
import {
  getCheckIns,
  saveCheckIn,
  deleteCheckIn,
  getGoals,
  saveGoals,
  getBadges,
  saveBadges,
  exportAllData,
  importData,
} from "../utils/storage";
import {
  calculateDailyScore,
  calculateStreak,
  getWeeklyAverage,
  getMonthlyAverage,
  getBestDay,
  getWorstDay,
  generateInsights,
  getChartTimelineData,
} from "../utils/analytics";
import { BADGES } from "../constants/trackerConfig";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function useTracker() {
  const [checkIns, setCheckIns] = useState(() => getCheckIns());
  const [goals, setGoalsState] = useState(() => getGoals());
  const [earnedBadges, setEarnedBadges] = useState(() => getBadges());

  const refreshCheckIns = useCallback(() => {
    setCheckIns(getCheckIns());
  }, []);

  const addCheckIn = useCallback((entry) => {
    const updated = saveCheckIn({ ...entry, date: entry.date || todayStr() });
    setCheckIns(updated);
    checkAndAwardBadges(updated, goals);
  }, [goals]);

  const removeCheckIn = useCallback((date) => {
    const updated = deleteCheckIn(date);
    setCheckIns(updated);
  }, []);

  const updateGoals = useCallback((newGoals) => {
    const updated = saveGoals(newGoals);
    setGoalsState(updated);
  }, []);

  const checkAndAwardBadges = useCallback(
    (currentCheckIns, currentGoals) => {
      const newBadges = [...earnedBadges];
      let changed = false;

      BADGES.forEach((badge) => {
        if (newBadges.find((b) => b.id === badge.id)) return;

        let earned = false;
        switch (badge.id) {
          case "first-checkin":
            earned = currentCheckIns.length >= 1;
            break;
          case "7-day-streak":
            earned = calculateStreak(currentCheckIns) >= 7;
            break;
          case "30-day-streak":
            earned = calculateStreak(currentCheckIns) >= 30;
            break;
          case "centurion":
            earned = currentCheckIns.length >= 100;
            break;
          case "high-focus":
            earned = currentCheckIns.some((c) => (c.energyLevel || 0) >= 5 && (c.mood || 0) >= 5);
            break;
          case "productivity-pro":
            earned = currentCheckIns.some((c) => calculateDailyScore(c) >= 95);
            break;
        }

        if (earned) {
          newBadges.push({ ...badge, earnedAt: new Date().toISOString() });
          changed = true;
        }
      });

      if (changed) {
        const saved = saveBadges(newBadges);
        setEarnedBadges(saved);
      }
    },
    [earnedBadges]
  );

  const exportData = useCallback(() => exportAllData(), []);

  const importTrackerData = useCallback((json) => {
    const ok = importData(json);
    if (ok) refreshCheckIns();
    return ok;
  }, [refreshCheckIns]);

  const streak = calculateStreak(checkIns);
  const weeklyAvg = getWeeklyAverage(checkIns);
  const monthlyAvg = getMonthlyAverage(checkIns);
  const bestDay = getBestDay(checkIns);
  const worstDay = getWorstDay(checkIns);
  const insights = generateInsights(checkIns);
  const timelineData = getChartTimelineData(checkIns);
  const todayCheckIn = checkIns.find((c) => c.date === todayStr());
  const todayScore = todayCheckIn ? calculateDailyScore(todayCheckIn) : null;
  const totalCheckIns = checkIns.length;

  return {
    checkIns,
    goals,
    earnedBadges,
    streak,
    weeklyAvg,
    monthlyAvg,
    bestDay,
    worstDay,
    insights,
    timelineData,
    todayCheckIn,
    todayScore,
    totalCheckIns,
    addCheckIn,
    removeCheckIn,
    updateGoals,
    exportData,
    importTrackerData,
    refreshCheckIns,
  };
}
