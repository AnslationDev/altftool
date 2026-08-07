"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createStepDetector } from "./stepDetector";
import {
  ACHIEVEMENTS,
  MAX_GOAL,
  MIN_GOAL,
  VOICE_INTERVALS,
  createEmptyState,
  evaluateAchievements,
  getDay,
  getLast7Series,
  getLifetimeStats,
  getMonthlyActiveDays,
  getStreak,
  getWeekSeries,
  loadState,
  saveState,
  todayKey,
} from "./stepStore";

/**
 * All Step Counter behaviour in one hook:
 * - durable persistence (per-day history, goal, achievements and voice
 *   preferences live in localStorage and survive closing the browser);
 *   auto-saved on every change, plus an explicit save() for the Save button
 * - REAL step detection only: devicemotion samples run through the
 *   stepDetector pipeline (gravity removal → smoothing → hysteresis peaks →
 *   cadence gate → rhythm confirmation). No sensor → no steps, ever.
 *   There is deliberately no simulated/demo counting.
 * - active-time tracking + achievement unlocks
 * - explicit tracking state machine: idle → tracking ⇄ paused → stopped,
 *   with reset returning to idle. `isActive` stays exported (derived) so
 *   older consumers (StepApp.jsx) keep working unchanged.
 */
export default function useStepCounter() {
  const [state, setState] = useState(createEmptyState);
  const [hydrated, setHydrated] = useState(false);
  const [status, setStatus] = useState("idle"); // "idle" | "tracking" | "paused" | "stopped"
  const [sensorMode, setSensorMode] = useState(null); // "motion" | "unavailable" | null
  const [errorMsg, setErrorMsg] = useState("");
  const [dayKey, setDayKey] = useState(todayKey);

  const isActive = status === "tracking";
  // Mirrors StepAppV2's local `counting` derivation: tracking status alone
  // does not mean anything is actually being measured — motion access can be
  // blocked, or the device can have no usable sensor. Only this narrower flag
  // should drive stats that claim to reflect real activity (see below).
  const counting = isActive && sensorMode === "motion" && !errorMsg;

  /* ------------------------------ persistence ------------------------------ */

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  // Explicit "Save" action for the Settings sheet. Persistence is already
  // automatic (the effect above writes on every change), but this lets the
  // user deliberately commit their progress and get visible confirmation.
  const save = useCallback(() => {
    saveState(state);
    return true;
  }, [state]);

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

  const setVoiceEnabled = useCallback((enabled) => {
    setState((prev) => ({
      ...prev,
      voice: { ...prev.voice, enabled: Boolean(enabled) },
    }));
  }, []);

  const setVoiceInterval = useCallback((interval) => {
    const parsed = Number(interval);
    if (!VOICE_INTERVALS.includes(parsed)) return;
    setState((prev) => ({
      ...prev,
      voice: { ...prev.voice, interval: parsed },
    }));
  }, []);

  // Full reset: today's stats back to zero, session ended, sensors released.
  // (Milestone bookkeeping lives in useVoiceCoach and follows the step count
  // back down automatically.)
  const resetToday = useCallback(() => {
    setStatus("idle");
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

  /* ------------------------ start / pause / resume / stop ------------------------ */

  const pause = useCallback(() => {
    setStatus((prev) => (prev === "tracking" ? "paused" : prev));
  }, []);

  const resume = useCallback(() => {
    setStatus((prev) => (prev === "paused" ? "tracking" : prev));
  }, []);

  const stop = useCallback(() => {
    setStatus((prev) =>
      prev === "tracking" || prev === "paused" ? "stopped" : prev,
    );
  }, []);

  const start = useCallback(async () => {
    // Never spin up a second session — Start while tracking is a no-op.
    let alreadyTracking = false;
    setStatus((prev) => {
      alreadyTracking = prev === "tracking";
      return prev;
    });
    if (alreadyTracking) return;

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
          // No fake fallback: without the sensor, steps simply don't count.
          setErrorMsg("Motion permission denied — steps can't be counted.");
          setSensorMode("unavailable");
        }
      } catch {
        // No sensor → steps silently stay at zero. No banner, no fake counts.
        setSensorMode(isTouchDevice ? "motion" : "unavailable");
      }
      setStatus("tracking");
      return;
    }

    // Desktops expose DeviceMotionEvent but never fire it — require a touch
    // device. Without a sensor the session still runs (time/goal), steps just
    // never increment; the UI stays clean with no warning text.
    setSensorMode(hasMotionEvent && isTouchDevice ? "motion" : "unavailable");
    setStatus("tracking");
  }, []);

  /* ----------------------------- motion detection ---------------------------- */

  // Steps come ONLY from the devicemotion sensor, filtered through the
  // stepDetector pipeline (see utils/stepDetector.js): gravity removal,
  // smoothing, hysteresis peak detection, walking-cadence gating and a
  // rhythm-confirmation streak. Stationary phones, taps, scrolls, tilts and
  // one-off jolts all produce zero counts. A fresh detector per tracking
  // session means paused/stopped sessions never leak rhythm state.
  useEffect(() => {
    if (!isActive || sensorMode !== "motion") return undefined;

    const detector = createStepDetector((count) => addSteps(count));

    const handleMotion = (event) => {
      const ts =
        typeof event.timeStamp === "number" && event.timeStamp > 0
          ? event.timeStamp
          : Date.now();
      const acc = event.acceleration;
      const accG = event.accelerationIncludingGravity;

      if (acc && acc.x !== null && acc.x !== undefined) {
        detector.process({ linear: { x: acc.x, y: acc.y, z: acc.z } }, ts);
      } else if (accG && accG.x !== null && accG.x !== undefined) {
        detector.process({ gravity: { x: accG.x, y: accG.y, z: accG.z } }, ts);
      }
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => {
      window.removeEventListener("devicemotion", handleMotion);
      detector.reset();
    };
  }, [isActive, sensorMode, addSteps]);

  /* ----------------------------- active-time ticker ---------------------------- */

  // Walking time accrues from real Date.now() deltas, not a fixed +1000ms per
  // tick — setInterval drifts (and background tabs throttle it), so summing
  // actual elapsed time keeps the stat accurate.
  useEffect(() => {
    if (!counting) return undefined;

    let last = Date.now();
    const tick = window.setInterval(() => {
      const now = Date.now();
      addActiveTime(now - last);
      last = now;
      // Refresh the day key so the UI rolls over cleanly at midnight.
      setDayKey((prev) => {
        const next = todayKey();
        return prev === next ? prev : next;
      });
    }, 1000);

    return () => window.clearInterval(tick);
  }, [counting, addActiveTime]);

  /* -------------------------------- selectors -------------------------------- */

  const today = getDay(state.history, dayKey);
  const goal = state.goal;
  const progress = goal > 0 ? Math.min((today.steps / goal) * 100, 100) : 0;

  const week = useMemo(() => getWeekSeries(state.history), [state.history, dayKey]);
  const last7 = useMemo(() => getLast7Series(state.history), [state.history, dayKey]);
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
    status,
    isActive,
    sensorMode,
    errorMsg,
    week,
    last7,
    streak,
    lifetime,
    monthlyActiveDays,
    achievements: state.achievements,
    unlocked,
    voiceEnabled: state.voice?.enabled ?? true,
    voiceInterval: state.voice?.interval ?? 50,
    addSteps,
    setGoal,
    setVoiceEnabled,
    setVoiceInterval,
    start,
    pause,
    resume,
    stop,
    save,
    resetToday,
  };
}
