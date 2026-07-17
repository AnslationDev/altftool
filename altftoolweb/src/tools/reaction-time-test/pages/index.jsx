"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Zap, RefreshCw, Trophy, Timer, Gauge } from "lucide-react";

export default function ToolHome() {
  const [phase, setPhase] = useState("idle"); // idle, waiting, go, result
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(null);
  const [bestTime, setBestTime] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [history, setHistory] = useState([]);
  const [timeoutId, setTimeoutId] = useState(null);

  const startWaiting = useCallback(() => {
    setPhase("waiting");
    const delay = Math.random() * 2000 + 1000; // 1-3 seconds
    const id = setTimeout(() => {
      setStartTime(performance.now());
      setPhase("go");
    }, delay);
    setTimeoutId(id);
  }, []);

  const handleClick = useCallback(() => {
    if (phase === "idle") {
      startWaiting();
    } else if (phase === "waiting") {
      // Clicked too early
      if (timeoutId) clearTimeout(timeoutId);
      setPhase("tooearly");
      setTimeout(() => setPhase("idle"), 1500);
    } else if (phase === "go") {
      const time = Math.round(performance.now() - startTime);
      setReactionTime(time);
      setPhase("result");
      setAttempts((a) => a + 1);
      setHistory((prev) => [time, ...prev].slice(0, 10));
      if (!bestTime || time < bestTime) setBestTime(time);
    }
  }, [phase, startTime, timeoutId, startWaiting, bestTime]);

  const reset = () => {
    setPhase("idle");
    setReactionTime(null);
    if (timeoutId) clearTimeout(timeoutId);
  };

  useEffect(() => {
    return () => { if (timeoutId) clearTimeout(timeoutId); };
  }, [timeoutId]);

  const getRating = (time) => {
    if (time < 200) return { label: "Superhuman! 🚀", color: "text-purple-500" };
    if (time < 250) return { label: "Excellent! ⚡", color: "text-green-500" };
    if (time < 300) return { label: "Great! 💪", color: "text-teal-500" };
    if (time < 350) return { label: "Good 👍", color: "text-blue-500" };
    if (time < 400) return { label: "Average", color: "text-amber-500" };
    return { label: "Keep practicing 🐢", color: "text-red-500" };
  };

  const PHASE_CONFIG = {
    idle: { text: "Click to Start", bg: "bg-(--primary)", sub: "Wait for green, then click as fast as you can!" },
    waiting: { text: "Wait for green...", bg: "bg-red-500", sub: "Don't click yet!" },
    go: { text: "CLICK NOW!", bg: "bg-green-500", sub: "Click as fast as you can!" },
    tooearly: { text: "Too early! 😅", bg: "bg-amber-500", sub: "Wait for green next time." },
    result: { text: `${reactionTime} ms`, bg: "bg-(--primary)", sub: getRating(reactionTime || 0).label },
  };

  return (
    <div className="min-h-screen bg-(--background) p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-(--muted) px-3 py-1 text-xs font-semibold uppercase text-(--primary)">
            <Zap className="h-4 w-4" /> Reflex Test
          </div>
          <h1 className="text-4xl font-bold text-(--foreground)">Reaction Time Test</h1>
          <p className="mt-2 text-(--muted-foreground)">Test your reflexes. Click as fast as possible when the screen turns green.</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-(--border) bg-(--card) p-4 text-center shadow-md">
            <p className="text-2xl font-bold text-(--primary)">{reactionTime || "—"}</p>
            <p className="text-xs uppercase text-(--muted-foreground)">Last (ms)</p>
          </div>
          <div className="rounded-xl border border-(--border) bg-(--card) p-4 text-center shadow-md">
            <p className="text-2xl font-bold text-(--primary)">{bestTime || "—"}</p>
            <p className="text-xs uppercase text-(--muted-foreground)">Best (ms)</p>
          </div>
          <div className="rounded-xl border border-(--border) bg-(--card) p-4 text-center shadow-md">
            <p className="text-2xl font-bold text-(--primary)">{attempts}</p>
            <p className="text-xs uppercase text-(--muted-foreground)">Attempts</p>
          </div>
        </div>

        <button onClick={handleClick} className={`flex h-64 w-full flex-col items-center justify-center rounded-2xl text-white shadow-lg transition-all duration-200 ${PHASE_CONFIG[phase].bg} ${phase !== "go" ? "hover:scale-[0.99] active:scale-95" : "animate-pulse"}`}>
          <span className="text-3xl font-black">{PHASE_CONFIG[phase].text}</span>
          <span className="mt-2 text-sm opacity-90">{PHASE_CONFIG[phase].sub}</span>
        </button>

        {phase === "result" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex justify-center">
            <button onClick={reset} className="inline-flex items-center gap-2 rounded-xl bg-(--primary) px-6 py-3 text-base font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98]">
              <RefreshCw className="h-5 w-5" /> Try Again
            </button>
          </div>
        )}

        {history.length > 0 && (
          <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-(--muted-foreground)"><Gauge className="h-4 w-4" /> Recent Times</h3>
            <div className="flex flex-wrap gap-2">
              {history.map((h, i) => (
                <span key={i} className={`rounded-lg px-3 py-1 text-sm font-semibold ${getRating(h).color} bg-(--muted)`}>
                  {h} ms
                </span>
              ))}
            </div>
            <div className="mt-4 border-t border-(--border) pt-4">
              <p className="text-sm text-(--muted-foreground)">Average: {Math.round(history.reduce((a, b) => a + b, 0) / history.length)} ms</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
