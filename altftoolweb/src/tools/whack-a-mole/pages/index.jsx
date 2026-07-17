"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Hammer, RefreshCw, Trophy, Timer, Bomb } from "lucide-react";

const GRID_SIZE = 9; // 3x3
const DURATION = 30; // seconds

export default function ToolHome() {
  const [phase, setPhase] = useState("idle"); // idle, running, done
  const [moleIndex, setMoleIndex] = useState(null);
  const [bombIndex, setBombIndex] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [bestScore, setBestScore] = useState(null);
  const [hitFeedback, setHitFeedback] = useState({});
  const timerRef = useRef(null);
  const moleTimerRef = useRef(null);
  const scoreRef = useRef(0);

  const spawnMole = useCallback(() => {
    const num = Math.floor(Math.random() * GRID_SIZE);
    const bombNum = Math.random() > 0.7 ? Math.floor(Math.random() * GRID_SIZE) : null;
    setMoleIndex(num);
    setBombIndex(bombNum === num ? (num + 1) % GRID_SIZE : bombNum);

    const hideDelay = 600 + Math.random() * 500;
    moleTimerRef.current = setTimeout(() => {
      setMoleIndex(null);
      setBombIndex(null);
    }, hideDelay);
  }, []);

  const startGame = useCallback(() => {
    scoreRef.current = 0;
    setScore(0);
    setTimeLeft(DURATION);
    setPhase("running");
    setMoleIndex(null);
    setBombIndex(null);

    if (timerRef.current) clearInterval(timerRef.current);
    if (moleTimerRef.current) clearTimeout(moleTimerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setPhase("done");
          if (!bestScore || scoreRef.current > bestScore) setBestScore(scoreRef.current);
          setMoleIndex(null);
          setBombIndex(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    moleTimerRef.current = setInterval(spawnMole, 800);
  }, [bestScore, spawnMole]);

  const whack = useCallback((index) => {
    if (phase !== "running") return;

    if (index === bombIndex) {
      // Hit a bomb — penalty
      scoreRef.current = Math.max(0, scoreRef.current - 5);
      setScore(scoreRef.current);
      setHitFeedback({ [index]: "bomb" });
      setTimeout(() => setHitFeedback((prev) => ({ ...prev, [index]: undefined })), 400);
      return;
    }

    if (index === moleIndex) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
      setHitFeedback({ [index]: "hit" });
      setMoleIndex(null);
      setTimeout(() => setHitFeedback((prev) => ({ ...prev, [index]: undefined })), 400);
    }
  }, [phase, moleIndex, bombIndex]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (moleTimerRef.current) clearInterval(moleTimerRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-(--background) p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-(--muted) px-3 py-1 text-xs font-semibold uppercase text-(--primary)">
            <Hammer className="h-4 w-4" /> Arcade Classic
          </div>
          <h1 className="text-4xl font-bold text-(--foreground)">Whack-a-Mole</h1>
          <p className="mt-2 text-(--muted-foreground)">Hit the moles, avoid the bombs. You have {DURATION} seconds!</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-(--border) bg-(--card) p-4 text-center shadow-md">
            <p className="text-2xl font-bold text-(--primary)">{score}</p>
            <p className="text-xs uppercase text-(--muted-foreground)">Score</p>
          </div>
          <div className="rounded-xl border border-(--border) bg-(--card) p-4 text-center shadow-md">
            <p className="text-2xl font-bold text-(--primary)">{timeLeft}s</p>
            <p className="text-xs uppercase text-(--muted-foreground)">Time</p>
          </div>
          <div className="rounded-xl border border-(--border) bg-(--card) p-4 text-center shadow-md">
            <p className="text-2xl font-bold text-(--primary)">{bestScore || "—"}</p>
            <p className="text-xs uppercase text-(--muted-foreground)">Best</p>
          </div>
        </div>

        {phase === "idle" && (
          <button onClick={startGame} className="flex h-64 w-full flex-col items-center justify-center rounded-2xl bg-(--primary) text-white shadow-lg transition-all hover:scale-[0.99] active:scale-95">
            <Hammer className="mb-3 h-12 w-12" />
            <span className="text-3xl font-black">Start Game</span>
            <span className="mt-2 text-sm opacity-90">Whack the moles, avoid bombs!</span>
          </button>
        )}

        {phase === "running" && (
          <div className="grid grid-cols-3 gap-3 rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg">
            {Array.from({ length: GRID_SIZE }).map((_, i) => {
              const isMole = moleIndex === i;
              const isBomb = bombIndex === i;
              const feedback = hitFeedback[i];
              return (
                <button key={i} onClick={() => whack(i)} className={`relative flex aspect-square items-center justify-center rounded-xl text-4xl shadow-md transition-all active:scale-95 ${
                  isMole ? "bg-green-500/20" : isBomb ? "bg-red-500/20" : "bg-(--muted)"
                }`}>
                  {feedback === "hit" && <span className="absolute text-2xl">💥</span>}
                  {feedback === "bomb" && <span className="absolute text-2xl">💣</span>}
                  {isMole && !feedback && <span className="animate-in zoom-in-50">🐹</span>}
                  {isBomb && !feedback && <Bomb className="h-10 w-10 text-red-500" />}
                </button>
              );
            })}
          </div>
        )}

        {phase === "done" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center rounded-2xl border-2 border-(--border) bg-(--card) p-8 text-center shadow-lg">
            <Trophy className="mb-3 h-12 w-12 text-(--primary)" />
            <p className="text-4xl font-black text-(--foreground)">{score}</p>
            <p className="text-sm uppercase text-(--muted-foreground)">moles whacked</p>
            {bestScore && <p className="mt-2 text-lg font-semibold text-(--primary)">Best: {bestScore}</p>}
            <button onClick={startGame} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-(--primary) px-6 py-3 text-base font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98]">
              <RefreshCw className="h-5 w-5" /> Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
