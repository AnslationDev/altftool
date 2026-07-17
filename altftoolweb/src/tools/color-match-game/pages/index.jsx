"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Eye, RefreshCw, Trophy, Target, Check, X } from "lucide-react";

const COLORS = [
  "#FF6B6B", "#FFA502", "#FFD93D", "#6BCB77", "#4D96FF",
  "#9B59B6", "#FF6B9D", "#2DD4BF", "#8B5CF6", "#EC4899",
  "#F97316", "#14B8A6", "#0EA5E9", "#EAB308", "#EF4444",
  "#22C55E", "#A855F7", "#EC4899",
];

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function colorDistance(c1, c2) {
  const a = hexToRgb(c1);
  const b = hexToRgb(c2);
  return Math.sqrt(Math.pow(a.r - b.r, 2) + Math.pow(a.g - b.g, 2) + Math.pow(a.b - b.b, 2));
}

export default function ToolHome() {
  const [round, setRound] = useState(1);
  const [targetColor, setTargetColor] = useState("");
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const maxRounds = 10;

  const generateRound = useCallback((roundNum) => {
    const base = COLORS[Math.floor(Math.random() * COLORS.length)];
    setTargetColor(base);

    // Generate options with varying proximity to target
    const difficultyFactor = 1 - (roundNum / (maxRounds * 1.5)); // Gets harder
    const optionsList = [base];
    while (optionsList.length < 4) {
      const candidate = COLORS[Math.floor(Math.random() * COLORS.length)];
      if (optionsList.includes(candidate)) continue;
      const dist = colorDistance(base, candidate);
      if (dist > 30 + difficultyFactor * 60) {
        optionsList.push(candidate);
      }
    }
    setOptions(shuffle(optionsList));
    setSelected(null);
    setFeedback(null);
  }, []);

  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  useEffect(() => {
    generateRound(1);
  }, []);

  const handleSelect = useCallback((color) => {
    if (feedback) return;
    setSelected(color);
    const isCorrect = color === targetColor;
    if (isCorrect) {
      setScore((s) => s + 10 + streak * 2);
      setStreak((st) => {
        const newStreak = st + 1;
        if (newStreak > bestStreak) setBestStreak(newStreak);
        return newStreak;
      });
      setFeedback({ correct: true, message: "Correct! 🎯" });
    } else {
      setStreak(0);
      setFeedback({ correct: false, message: "Wrong! The target was highlighted." });
    }

    setTimeout(() => {
      if (round >= maxRounds) {
        setGameOver(true);
      } else {
        const nextRound = round + 1;
        setRound(nextRound);
        generateRound(nextRound);
      }
    }, 1200);
  }, [feedback, targetColor, streak, round, generateRound]);

  const restart = () => {
    setRound(1);
    setScore(0);
    setStreak(0);
    setGameOver(false);
    generateRound(1);
  };

  return (
    <div className="min-h-screen bg-(--background) p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-(--muted) px-3 py-1 text-xs font-semibold uppercase text-(--primary)">
            <Eye className="h-4 w-4" /> Perception Test
          </div>
          <h1 className="text-4xl font-bold text-(--foreground)">Color Match Game</h1>
          <p className="mt-2 text-(--muted-foreground)">Find the color that matches the target. Gets harder each round!</p>
        </div>

        {!gameOver ? (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-(--border) bg-(--card) p-4 text-center shadow-md">
                <p className="text-2xl font-bold text-(--primary)">{round}/{maxRounds}</p>
                <p className="text-xs uppercase text-(--muted-foreground)">Round</p>
              </div>
              <div className="rounded-xl border border-(--border) bg-(--card) p-4 text-center shadow-md">
                <p className="text-2xl font-bold text-(--primary)">{score}</p>
                <p className="text-xs uppercase text-(--muted-foreground)">Score</p>
              </div>
              <div className="rounded-xl border border-(--border) bg-(--card) p-4 text-center shadow-md">
                <p className="text-2xl font-bold text-(--primary)">{streak}</p>
                <p className="text-xs uppercase text-(--muted-foreground)">Streak</p>
              </div>
            </div>

            <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg">
              <p className="mb-4 text-center text-sm font-semibold text-(--muted-foreground)">Match this color:</p>
              <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-2xl shadow-lg" style={{ backgroundColor: targetColor }}>
                <span className="rounded bg-black/20 px-2 py-1 text-xs font-bold text-white">{targetColor.toUpperCase()}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {options.map((color, i) => {
                  const isSelected = selected === color;
                  const isTarget = color === targetColor;
                  let borderClass = "border-2 border-transparent";
                  if (feedback) {
                    if (isTarget) borderClass = "border-4 border-green-500";
                    else if (isSelected && !isTarget) borderClass = "border-4 border-red-500";
                  } else if (isSelected) {
                    borderClass = "border-4 border-(--primary)";
                  }
                  return (
                    <button key={i} onClick={() => handleSelect(color)} disabled={!!feedback} className={`flex h-24 items-center justify-center rounded-xl shadow-md transition-all hover:scale-105 ${borderClass}`} style={{ backgroundColor: color }}>
                      {feedback && isTarget && <Check className="h-8 w-8 text-white" />}
                      {feedback && isSelected && !isTarget && <X className="h-8 w-8 text-white" />}
                    </button>
                  );
                })}
              </div>

              {feedback && (
                <div className={`mt-4 animate-in fade-in rounded-xl p-3 text-center text-sm font-bold ${feedback.correct ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
                  {feedback.message}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-2xl border-2 border-(--border) bg-(--card) p-8 text-center shadow-lg">
            <Trophy className="mx-auto mb-3 h-12 w-12 text-(--primary)" />
            <p className="text-3xl font-black text-(--foreground)">Game Over!</p>
            <p className="mt-2 text-lg font-semibold text-(--primary)">Final Score: {score}</p>
            <p className="text-sm text-(--muted-foreground)">Best Streak: {bestStreak}</p>
            <button onClick={restart} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-(--primary) px-6 py-3 text-base font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98]">
              <RefreshCw className="h-5 w-5" /> Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
