"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { MousePointerClick, RefreshCw, Trophy, Timer, Flame } from "lucide-react";

const DURATION = 10; // seconds

export default function ToolHome() {
  const [phase, setPhase] = useState("idle"); // idle, running, done
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [bestCps, setBestCps] = useState(null);
  const [history, setHistory] = useState([]);
  const timerRef = useRef(null);
  const countRef = useRef(0);

  const startGame = useCallback(() => {
    countRef.current = 0;
    setClicks(0);
    setTimeLeft(DURATION);
    setPhase("running");
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setPhase("done");
          const finalClicks = countRef.current;
          const cps = (finalClicks / DURATION).toFixed(1);
          setHistory((prev) => [{ clicks: finalClicks, cps: parseFloat(cps) }, ...prev].slice(0, 10));
          if (!bestCps || parseFloat(cps) > bestCps) setBestCps(parseFloat(cps));
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, [bestCps]);

  const handleClick = useCallback(() => {
    if (phase !== "running") return;
    countRef.current += 1;
    setClicks(countRef.current);
  }, [phase]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const cps = phase === "done" ? (clicks / DURATION).toFixed(1) : (0).toFixed(1);

  const getRating = (c) => {
    const val = parseFloat(c);
    if (val >= 10) return { label: "Clicking God! 👑", color: "text-purple-500" };
    if (val >= 8) return { label: "Lightning Fast! ⚡", color: "text-green-500" };
    if (val >= 6) return { label: "Fast! 💪", color: "text-teal-500" };
    if (val >= 4) return { label: "Decent 👍", color: "text-blue-500" };
    if (val >= 2) return { label: "Getting there 🐢", color: "text-amber-500" };
    return { label: "Slow and steady 🐌", color: "text-red-500" };
  };

  return (
    <div className="min-h-screen bg-(--background) p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-(--muted) px-3 py-1 text-xs font-semibold uppercase text-(--primary)">
            <MousePointerClick className="h-4 w-4" /> Speed Challenge
          </div>
          <h1 className="text-4xl font-bold text-(--foreground)">Fast Click Challenge</h1>
          <p className="mt-2 text-(--muted-foreground)">Click as fast as you can in 10 seconds. Beat your CPS record!</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-(--border) bg-(--card) p-4 text-center shadow-md">
            <p className="text-2xl font-bold text-(--primary)">{clicks}</p>
            <p className="text-xs uppercase text-(--muted-foreground)">Clicks</p>
          </div>
          <div className="rounded-xl border border-(--border) bg-(--card) p-4 text-center shadow-md">
            <p className="text-2xl font-bold text-(--primary)">{cps}</p>
            <p className="text-xs uppercase text-(--muted-foreground)">CPS</p>
          </div>
          <div className="rounded-xl border border-(--border) bg-(--card) p-4 text-center shadow-md">
            <p className="text-2xl font-bold text-(--primary)">{bestCps || "—"}</p>
            <p className="text-xs uppercase text-(--muted-foreground)">Best CPS</p>
          </div>
        </div>

        {phase === "idle" && (
          <button onClick={startGame} className="flex h-64 w-full flex-col items-center justify-center rounded-2xl bg-(--primary) text-white shadow-lg transition-all hover:scale-[0.99] active:scale-95">
            <MousePointerClick className="mb-3 h-12 w-12" />
            <span className="text-3xl font-black">Start Challenge</span>
            <span className="mt-2 text-sm opacity-90">You have {DURATION} seconds!</span>
          </button>
        )}

        {phase === "running" && (
          <button onClick={handleClick} className="flex h-64 w-full flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg transition-all active:scale-95">
            <Flame className="mb-3 h-12 w-12 animate-pulse" />
            <span className="text-5xl font-black">{clicks}</span>
            <span className="mt-2 text-xl font-bold">{timeLeft}s left</span>
          </button>
        )}

        {phase === "done" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center rounded-2xl border-2 border-(--border) bg-(--card) p-8 text-center shadow-lg">
            <Trophy className="mb-3 h-12 w-12 text-(--primary)" />
            <p className="text-4xl font-black text-(--foreground)">{clicks}</p>
            <p className="text-sm uppercase text-(--muted-foreground)">clicks in {DURATION} seconds</p>
            <p className={`mt-2 text-xl font-bold ${getRating(cps).color}`}>{getRating(cps).label}</p>
            <p className="text-lg font-semibold text-(--primary)">{cps} CPS</p>
            <button onClick={startGame} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-(--primary) px-6 py-3 text-base font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98]">
              <RefreshCw className="h-5 w-5" /> Try Again
            </button>
          </div>
        )}

        {history.length > 0 && phase === "done" && (
          <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-(--muted-foreground)"><Timer className="h-4 w-4" /> Recent Scores</h3>
            <div className="space-y-2">
              {history.map((h, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-(--muted) px-4 py-2">
                  <span className="font-semibold text-(--foreground)">{h.clicks} clicks</span>
                  <span className={`font-bold ${getRating(h.cps).color}`}>{h.cps} CPS</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
