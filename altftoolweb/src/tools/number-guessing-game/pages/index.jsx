"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Brain, RefreshCw, Trophy, Target, Lightbulb } from "lucide-react";

const DIFFICULTIES = {
  easy: { max: 50, label: "Easy (1-50)", guesses: 10 },
  medium: { max: 100, label: "Medium (1-100)", guesses: 7 },
  hard: { max: 200, label: "Hard (1-200)", guesses: 6 },
};

export default function ToolHome() {
  const [difficulty, setDifficulty] = useState("medium");
  const [secret, setSecret] = useState(null);
  const [guess, setGuess] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(7);
  const [message, setMessage] = useState("");
  const [gameState, setGameState] = useState("playing"); // playing, won, lost
  const [history, setHistory] = useState([]);
  const [bestScore, setBestScore] = useState(null);

  const startGame = useCallback((diff) => {
    const config = DIFFICULTIES[diff] || DIFFICULTIES.medium;
    setSecret(Math.floor(Math.random() * config.max) + 1);
    setGuess("");
    setAttempts(0);
    setMaxAttempts(config.guesses);
    setMessage(`I'm thinking of a number between 1 and ${config.max}. You have ${config.guesses} guesses!`);
    setGameState("playing");
    setHistory([]);
  }, []);

  useEffect(() => {
    startGame(difficulty);
  }, []);

  const submitGuess = useCallback(() => {
    if (gameState !== "playing" || !secret) return;
    const num = parseInt(guess, 10);
    if (isNaN(num)) { setMessage("Please enter a valid number!"); return; }

    const config = DIFFICULTIES[difficulty];
    if (num < 1 || num > config.max) { setMessage(`Enter a number between 1 and ${config.max}!`); return; }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setHistory((prev) => [{ guess: num, result: num === secret ? "correct" : num < secret ? "higher" : "lower" }, ...prev]);

    if (num === secret) {
      setGameState("won");
      setMessage(`🎉 Correct! You guessed ${secret} in ${newAttempts} attempts!`);
      if (!bestScore || newAttempts < bestScore) setBestScore(newAttempts);
    } else if (newAttempts >= maxAttempts) {
      setGameState("lost");
      setMessage(`😞 Game over! The number was ${secret}. Better luck next time!`);
    } else {
      setMessage(num < secret ? "📈 Too low! Try higher." : "📉 Too high! Try lower.");
    }
    setGuess("");
  }, [guess, secret, attempts, maxAttempts, gameState, difficulty, bestScore]);

  return (
    <div className="min-h-screen bg-(--background) p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-(--muted) px-3 py-1 text-xs font-semibold uppercase text-(--primary)">
            <Brain className="h-4 w-4" /> Mind Game
          </div>
          <h1 className="text-4xl font-bold text-(--foreground)">Number Guessing Game</h1>
          <p className="mt-2 text-(--muted-foreground)">Guess the secret number. Use logic and hints to win!</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-(--border) bg-(--card) p-4 text-center shadow-md">
            <p className="text-2xl font-bold text-(--primary)">{attempts}</p>
            <p className="text-xs uppercase text-(--muted-foreground)">Attempts</p>
          </div>
          <div className="rounded-xl border border-(--border) bg-(--card) p-4 text-center shadow-md">
            <p className="text-2xl font-bold text-(--primary)">{maxAttempts - attempts}</p>
            <p className="text-xs uppercase text-(--muted-foreground)">Remaining</p>
          </div>
          <div className="rounded-xl border border-(--border) bg-(--card) p-4 text-center shadow-md">
            <p className="text-2xl font-bold text-(--primary)">{bestScore || "—"}</p>
            <p className="text-xs uppercase text-(--muted-foreground)">Best</p>
          </div>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg">
          <div className="mb-6 flex flex-wrap gap-2">
            {Object.entries(DIFFICULTIES).map(([key, config]) => (
              <button key={key} onClick={() => { setDifficulty(key); startGame(key); }} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${difficulty === key ? "bg-(--primary) text-white shadow-md" : "border border-(--border) bg-(--background) text-(--muted-foreground) hover:border-(--primary)"}`}>
                <Target className="h-4 w-4" /> {config.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <input type="number" value={guess} onChange={(e) => setGuess(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitGuess()} placeholder="Enter your guess..." disabled={gameState !== "playing"} className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-center text-lg font-semibold text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/30 disabled:opacity-50" />
            <div className="flex gap-3">
              <button onClick={submitGuess} disabled={gameState !== "playing"} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-(--primary) px-4 py-3 text-base font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
                <Brain className="h-5 w-5" /> Guess
              </button>
              <button onClick={() => startGame(difficulty)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-base font-semibold text-(--muted-foreground) transition-all hover:border-(--primary)">
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div className={`animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-2xl border-2 p-6 shadow-lg text-center ${
            gameState === "won" ? "border-green-500 bg-green-50 dark:bg-green-950/20" : gameState === "lost" ? "border-red-500 bg-red-50 dark:bg-red-950/20" : "border-(--border) bg-(--card)"
          }`}>
            <p className={`text-lg font-semibold ${gameState === "won" ? "text-green-700 dark:text-green-400" : gameState === "lost" ? "text-red-700 dark:text-red-400" : "text-(--foreground)"}`}>{message}</p>
            {(gameState === "won" || gameState === "lost") && (
              <button onClick={() => startGame(difficulty)} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-(--primary) px-6 py-3 text-base font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98]">
                <Trophy className="h-5 w-5" /> Play Again
              </button>
            )}
          </div>
        )}

        {history.length > 0 && gameState === "playing" && (
          <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-(--muted-foreground)"><Lightbulb className="h-4 w-4" /> Guess History</h3>
            <div className="flex flex-wrap gap-2">
              {history.map((h, i) => (
                <span key={i} className={`rounded-lg px-3 py-1 text-sm font-semibold ${
                  h.result === "correct" ? "bg-green-500 text-white" : h.result === "higher" ? "bg-blue-500/10 text-blue-600" : "bg-red-500/10 text-red-600"
                }`}>
                  {h.guess} {h.result === "higher" ? "↑" : h.result === "lower" ? "↓" : "✓"}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
