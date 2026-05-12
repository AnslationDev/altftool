"use client";

import { useCallback, useEffect, useState } from "react";
import { Timer, Coffee, SkipForward } from "lucide-react";

import ProgressRing from "./ProgressRing";
import ScoreBar from "./ScoreBar";
import PresetButtons from "./PresetButtons";
import TimerControls from "./TimerControls";
import DistractionTracker from "./DistractionTracker";
import TaskInput from "./TaskInput";
import BreakSuggestions from "./BreakSuggestions";
import CountdownAlert from "./CountdownAlert";
import FocusSounds from "./FocusSounds";

export default function FocusTimer({
  onSessionComplete,
  onDistraction,
  autoLoop,
  persistedStreak,
  onResetStreak,
}) {
  const [activePreset, setActivePreset] = useState("pomodoro");
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [customFocus, setCustomFocus] = useState("");
  const [customBreak, setCustomBreak] = useState("");
  const [skipBreak, setSkipBreak] = useState(false);
  const streak = persistedStreak || 0;

  const [seconds, setSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState("focus");

  const [score, setScore] = useState(0);
  const [lastEvent, setLastEvent] = useState("");

  const [lockMode, setLockMode] = useState(false);
  const [currentTask, setCurrentTask] = useState("");
  const [justCompleted, setJustCompleted] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);


  const [autoCountdown, setAutoCountdown] = useState(null);

  const totalSeconds =
    phase === "focus" ? focusMinutes * 60 : breakMinutes * 60;

  const addScore = useCallback((points, label) => {
    setScore((prev) => Math.min(Math.max(prev + points, 0), 100));
    setLastEvent(label);
    setTimeout(() => setLastEvent(""), 3000);
  }, []);

  const sendNotification = useCallback((title, body) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
      });
    }
  }, []);

  const handlePreset = (preset) => {
    if (isRunning) return;
    setActivePreset(preset.id);
    if (preset.id !== "custom") {
      setFocusMinutes(preset.focus);
      setBreakMinutes(preset.breakMin);
      setSeconds(preset.focus * 60);
      setPhase("focus");
    }
  };

  const applyCustom = () => {
    const f = Number(customFocus);
    const b = Number(customBreak);
    if (f > 0) {
      setFocusMinutes(f);
      setBreakMinutes(b || 0);
      setSeconds(f * 60);
      setPhase("focus");
    }
  };

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, phase, focusMinutes, breakMinutes]);

  useEffect(() => {
    if (seconds !== 0 || !isRunning) return;
    const completeSession = setTimeout(() => {
      setLockMode(false);
      setIsRunning(false);
      if (phase === "focus") {
        sendNotification("Session Complete!", "Time's up! Take a break.");
        addScore(20, "+20 Session completed!");
        onSessionComplete?.(focusMinutes);
        setJustCompleted(true);

        if (skipBreak || breakMinutes === 0) {
          setPhase("focus");
          setSeconds(focusMinutes * 60);
        } else {
          setPhase("break");
          setSeconds(breakMinutes * 60);
        }

        if (autoLoop) setAutoCountdown(3);
      } else {
        sendNotification("Break Over!", "Time to focus again.");
        addScore(10, "+10 Break taken properly!");
        setPhase("focus");
        setSeconds(focusMinutes * 60);
        if (autoLoop) setAutoCountdown(3);
      }
    }, 0);

    return () => clearTimeout(completeSession);
  }, [
    addScore,
    autoLoop,
    breakMinutes,
    focusMinutes,
    isRunning,
    onSessionComplete,
    phase,
    seconds,
    sendNotification,
    skipBreak,
  ]);

  useEffect(() => {
    if (autoCountdown === null) return;
    if (autoCountdown === 0) {
      const startNextSession = setTimeout(() => {
        setAutoCountdown(null);
        setIsRunning(true);
      }, 0);
      return () => clearTimeout(startNextSession);
    }
    const timer = setTimeout(() => setAutoCountdown((p) => p - 1), 1000);
    return () => clearTimeout(timer);
  }, [autoCountdown]);

  const startTimer = () => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    setIsRunning(true);
    setJustCompleted(false);
  };

  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    if (isRunning && phase === "focus") {
      addScore(-10, "-10 Session skipped");
      onResetStreak?.();
      setJustCompleted(false);
      setLockMode(false);
    }
    setIsRunning(false);
    setPhase("focus");
    setSeconds(focusMinutes * 60);
    setSessionKey((k) => k + 1);
    setAutoCountdown(null);
    setSkipBreak(false);
  };
  const toggleLock = () => {
    if (!isRunning) return;
    setLockMode((prev) => !prev);
  };

  return (
    <div>
      
      <CountdownAlert
        autoCountdown={autoCountdown}
        onCancel={() => setAutoCountdown(null)}
      />

      {/* RING + BREAK SUGGESTIONS + CONTROLS */}
      <div className="sm:bg-(--background) sm:border border-(--border) rounded-2xl py-4 px-4 text-center mb-4">
        <ProgressRing
          seconds={seconds}
          totalSeconds={totalSeconds}
          phase={phase}
          focusMinutes={focusMinutes} // ← add
          breakMinutes={breakMinutes} // ← add
        />

        <p className="text-xs text-(--muted-foreground) font-secondary">
          <span className="flex items-center justify-center gap-1">
            <Timer size={14} /> {focusMinutes}min focus
            {breakMinutes > 0 && (
              <>
                <span>→</span>
                <Coffee size={14} /> {breakMinutes}min break
              </>
            )}
          </span>
        </p>

        <BreakSuggestions phase={phase} />

        <TimerControls
          isRunning={isRunning}
          lockMode={lockMode}
          onStart={startTimer}
          onPause={pauseTimer}
          onReset={resetTimer}
          onToggleLock={toggleLock}
        />

        {phase === "break" && isRunning && (
          <div className="flex justify-center mt-3">
            <button
              onClick={() => {
                setPhase("focus");
                setSeconds(focusMinutes * 60);
                setIsRunning(false);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-primary font-bold text-sm bg-(--background) text-(--foreground) border border-(--border) cursor-pointer hover:border-(--primary) hover:text-(--primary) transition-all"
            >
              <SkipForward size={15} />
              Skip Break
            </button>
          </div>
        )}
      </div>

      {/* TASK INPUT */}
      <TaskInput
        isRunning={isRunning}
        justCompleted={justCompleted}
        onTaskChange={setCurrentTask}
        locked={lockMode}
      />
      <FocusSounds isRunning={isRunning} phase={phase} />

      {/* PRESET BUTTONS */}
      <PresetButtons
        activePreset={activePreset}
        isRunning={isRunning}
        lockMode={lockMode}
        onPreset={handlePreset}
        customFocus={customFocus}
        customBreak={customBreak}
        setCustomFocus={setCustomFocus}
        setCustomBreak={setCustomBreak}
        onApplyCustom={applyCustom}
      />

      {/* SCORE + STREAK */}
      <ScoreBar score={score} streak={streak} lastEvent={lastEvent} />

      {/* DISTRACTION TRACKER */}
      <DistractionTracker
        key={sessionKey}
        isRunning={isRunning}
        phase={phase}
        seconds={seconds}
        totalSeconds={totalSeconds}
        locked={lockMode}
        onDistraction={() => {
          addScore(-5, "-5 Got distracted");
          onDistraction?.();
        }}
      />
    </div>
  );
}
