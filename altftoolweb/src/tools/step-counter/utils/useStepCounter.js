"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ACHIEVEMENTS,
  MAX_GOAL,
  MIN_GOAL,
  createEmptyState,
  evaluateAchievements,
  getDay,
  getLifetimeStats,
  getMonthlyActiveDays,
  getStreak,
  getWeekSeries,
  loadState,
  saveState,
  todayKey,
} from "./stepStore";

// Calm, natural cadence for the simulated counter: steps tick in one-by-one,
// roughly one step every 0.8–1.2 seconds with a little random variation, so
// the count climbs 1, 2, 3… at an easy human walking rhythm — never in a rush.
const STEP_INTERVAL_MIN_MS = 800;
const STEP_INTERVAL_MAX_MS = 1200;
const MOTION_DEBOUNCE_MS = 400;

/**
 * All Step Counter behaviour in one hook:
 * - session-only persistence (per-day history, goal, achievements live in
 *   sessionStorage and reset when the browser session ends)
 * - real step detection via the devicemotion sensor on mobile
 * - clearly-labelled simulated pace on devices without a motion sensor
 * - active-time tracking + achievement unlocks
 */
export default function useStepCounter() {
  const [state, setState] = useState(createEmptyState);
  const [hydrated, setHydrated] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [sensorMode, setSensorMode] = useState(null); // "motion" | "simulated" | null
  const [errorMsg, setErrorMsg] = useState("");
  const [dayKey, setDayKey] = useState(todayKey);
  const lastStepTime = useRef(0);

  /* ------------------------------ persistence ------------------------------ */

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  /* ------------------------------- mutations ------------------------------- */

  const commit = useCallback((updater) => {
    setState((prev) => {
      const next = updater(prev);
      const { achievements } = evaluateAchievements(next);
      return { ...next, achievements };
    });
  }, []);

  const addSteps = useCallback(
    (count) => {
      const amount = Math.round(Number(count) || 0);
      if (amount <= 0) return;
      commit((prev) => {
        const key = todayKey();
        const day = getDay(prev.history, key);
        return {
          ...prev,
          history: {
            ...prev.history,
            [key]: { ...day, steps: day.steps + amount },
          },
        };
      });
    },
    [commit],
  );

  const addActiveTime = useCallback((ms) => {
    setState((prev) => {
      const key = todayKey();
      const day = getDay(prev.history, key);
      return {
        ...prev,
        history: {
          ...prev.history,
          [key]: { ...day, activeMs: (day.activeMs || 0) + ms },
        },
      };
    });
  }, []);

  const setGoal = useCallback((value) => {
    const parsed = Math.round(Number(value));
    if (!Number.isFinite(parsed)) return;
    setState((prev) => ({
      ...prev,
      goal: Math.min(MAX_GOAL, Math.max(MIN_GOAL, parsed)),
    }));
  }, []);

  const resetToday = useCallback(() => {
    setIsActive(false);
    setSensorMode(null);
    setErrorMsg("");
    setState((prev) => {
      const key = todayKey();
      return {
        ...prev,
        history: { ...prev.history, [key]: { steps: 0, activeMs: 0 } },
      };
    });
  }, []);

  /* ------------------------------ start / pause ----------------------------- */

  const pause = useCallback(() => {
    setIsActive(false);
  }, []);

  const start = useCallback(async () => {
    setErrorMsg("");

    const hasMotionEvent =
      typeof window !== "undefined" && typeof window.DeviceMotionEvent !== "undefined";
    const isTouchDevice =
      typeof navigator !== "undefined" && (navigator.maxTouchPoints || 0) > 0;

    // iOS asks for explicit permission before delivering motion events.
    if (
      hasMotionEvent &&
      typeof window.DeviceMotionEvent.requestPermission === "function"
    ) {
      try {
        const permission = await window.DeviceMotionEvent.requestPermission();
        if (permission === "granted") {
          setSensorMode("motion");
        } else {
          setErrorMsg("Motion permission denied — using demo pace instead.");
          setSensorMode("simulated");
        }
      } catch {
        setSensorMode(isTouchDevice ? "motion" : "simulated");
      }
      setIsActive(true);
      return;
    }

    // Desktops expose DeviceMotionEvent but never fire it — require a touch device.
    setSensorMode(hasMotionEvent && isTouchDevice ? "motion" : "simulated");
    setIsActive(true);
  }, []);

  /* ----------------------------- motion detection ---------------------------- */

  useEffect(() => {
    if (!isActive || sensorMode !== "motion") return undefined;

    const handleMotion = (event) => {
      const acc = event.acceleration;
      const accG = event.accelerationIncludingGravity;

      let magnitude = 0;
      let threshold = 0;

      if (acc && acc.x !== null) {
        magnitude = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
        threshold = 4.0;
      } else if (accG && accG.x !== null) {
        magnitude = Math.sqrt(accG.x * accG.x + accG.y * accG.y + accG.z * accG.z);
        threshold = 15.0;
      }

      if (magnitude > threshold) {
        const now = Date.now();
        if (now - lastStepTime.current > MOTION_DEBOUNCE_MS) {
          lastStepTime.current = now;
          addSteps(1);
        }
      }
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [isActive, sensorMode, addSteps]);

  /* ------------------------- simulated walking cadence ------------------------ */

  // Steps arrive one at a time on a human rhythm (~1 step every 0.5–0.75s with
  // natural jitter), so the counter climbs 1, 2, 3… like a real walk instead of
  // jumping in batches.
  useEffect(() => {
    if (!isActive || sensorMode !== "simulated") return undefined;

    let timeoutId;
    let cancelled = false;

    const scheduleNextStep = () => {
      const delay =
        STEP_INTERVAL_MIN_MS +
        Math.random() * (STEP_INTERVAL_MAX_MS - STEP_INTERVAL_MIN_MS);
      timeoutId = window.setTimeout(() => {
        if (cancelled) return;
        addSteps(1);
        scheduleNextStep();
      }, delay);
    };

    scheduleNextStep();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [isActive, sensorMode, addSteps]);

  /* ----------------------------- active-time ticker ---------------------------- */

  useEffect(() => {
    if (!isActive) return undefined;

    const tick = window.setInterval(() => {
      addActiveTime(1000);
      // Refresh the day key so the UI rolls over cleanly at midnight.
      setDayKey((prev) => {
        const next = todayKey();
        return prev === next ? prev : next;
      });
    }, 1000);

    return () => window.clearInterval(tick);
  }, [isActive, addActiveTime]);

  /* -------------------------------- selectors -------------------------------- */

  const today = getDay(state.history, dayKey);
  const goal = state.goal;
  const progress = goal > 0 ? Math.min((today.steps / goal) * 100, 100) : 0;

  const week = useMemo(() => getWeekSeries(state.history), [state.history, dayKey]);
  const streak = useMemo(() => getStreak(state.history), [state.history, dayKey]);
  const lifetime = useMemo(() => getLifetimeStats(state.history), [state.history]);
  const monthlyActiveDays = useMemo(
    () => getMonthlyActiveDays(state.history),
    [state.history, dayKey],
  );

  const unlocked = useMemo(
    () =>
      ACHIEVEMENTS.filter((def) => state.achievements[def.id])
        .map((def) => ({ ...def, unlockedAt: state.achievements[def.id] }))
        .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt)),
    [state.achievements],
  );

  return {
    hydrated,
    todaySteps: today.steps,
    activeMs: today.activeMs || 0,
    goal,
    progress,
    isActive,
    sensorMode,
    errorMsg,
    week,
    streak,
    lifetime,
    monthlyActiveDays,
    achievements: state.achievements,
    unlocked,
    addSteps,
    setGoal,
    start,
    pause,
    resetToday,
  };
}
