"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Layers, RefreshCw, Trophy, Timer, RotateCcw } from "lucide-react";

const EMOJI_SETS = {
  animals: ["🐶", "🐱", "🐼", "🦊", "🐸", "🐵", "🦁", "🐯"],
  food: ["🍕", "🍔", "🍟", "🌮", "🍩", "🍪", "🍎", "🍓"],
  sports: ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🎱"],
  space: ["🌟", "⭐", "🌙", "☀️", "🪐", "🌍", "🌛", "💫"],
};

const DIFFICULTIES = {
  easy: { pairs: 4, label: "Easy (4 pairs)", set: "animals" },
  medium: { pairs: 6, label: "Medium (6 pairs)", set: "food" },
  hard: { pairs: 8, label: "Hard (8 pairs)", set: "space" },
};

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function ToolHome() {
  const [difficulty, setDifficulty] = useState("medium");
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [bestTime, setBestTime] = useState(null);
  const timerRef = useRef(null);
  const lockRef = useRef(false);

  const startGame = useCallback((diff) => {
    const config = DIFFICULTIES[diff] || DIFFICULTIES.medium;
    const set = EMOJI_SETS[config.set] || EMOJI_SETS.animals;
    const selectedEmojis = set.slice(0, config.pairs);
    const deck = shuffle([...selectedEmojis, ...selectedEmojis]).map((emoji, i) => ({ id: i, emoji, flipped: false }));
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setSeconds(0);
    setIsRunning(true);
    setGameWon(false);
    lockRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }, []);

  useEffect(() => {
    startGame(difficulty);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const flipCard = useCallback((id) => {
    if (lockRef.current || flipped.includes(id) || matched.includes(id)) return;
    if (flipped.length === 2) return;

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = newFlipped;
      const firstCard = cards.find((c) => c.id === first);
      const secondCard = cards.find((c) => c.id === second);

      if (firstCard.emoji === secondCard.emoji) {
        setMatched((prev) => [...prev, first, second]);
        setFlipped([]);
        if (matched.length + 2 === cards.length) {
          setIsRunning(false);
          setGameWon(true);
          if (timerRef.current) clearInterval(timerRef.current);
          if (!bestTime || seconds < bestTime) setBestTime(seconds);
        }
      } else {
        lockRef.current = true;
        setTimeout(() => {
          setFlipped([]);
          lockRef.current = false;
        }, 800);
      }
    }
  }, [flipped, matched, cards, seconds, bestTime]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-(--background) p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-(--muted) px-3 py-1 text-xs font-semibold uppercase text-(--primary)">
            <Layers className="h-4 w-4" /> Memory Challenge
          </div>
          <h1 className="text-4xl font-bold text-(--foreground)">Memory Card Game</h1>
          <p className="mt-2 text-(--muted-foreground)">Match all pairs to win. Train your memory with fun themes!</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-(--border) bg-(--card) p-4 text-center shadow-md">
            <p className="text-2xl font-bold text-(--primary)">{moves}</p>
            <p className="text-xs uppercase text-(--muted-foreground)">Moves</p>
          </div>
          <div className="rounded-xl border border-(--border) bg-(--card) p-4 text-center shadow-md">
            <p className="text-2xl font-bold text-(--primary)">{formatTime(seconds)}</p>
            <p className="text-xs uppercase text-(--muted-foreground)">Time</p>
          </div>
          <div className="rounded-xl border border-(--border) bg-(--card) p-4 text-center shadow-md">
            <p className="text-2xl font-bold text-(--primary)">{matched.length / 2}/{cards.length / 2}</p>
            <p className="text-xs uppercase text-(--muted-foreground)">Pairs</p>
          </div>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg">
          <div className="mb-6 flex flex-wrap gap-2">
            {Object.entries(DIFFICULTIES).map(([key, config]) => (
              <button key={key} onClick={() => { setDifficulty(key); startGame(key); }} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${difficulty === key ? "bg-(--primary) text-white shadow-md" : "border border-(--border) bg-(--background) text-(--muted-foreground) hover:border-(--primary)"}`}>
                {config.label}
              </button>
            ))}
          </div>

          <div className={`grid gap-3 ${difficulty === "easy" ? "grid-cols-4" : difficulty === "medium" ? "grid-cols-4" : "grid-cols-4"}`}>
            {cards.map((card) => {
              const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
              return (
                <button key={card.id} onClick={() => flipCard(card.id)} disabled={isFlipped} className={`relative flex aspect-square items-center justify-center rounded-xl text-3xl font-bold shadow-md transition-transform duration-300 hover:scale-105 ${isFlipped ? "bg-(--primary)/10" : "bg-(--muted)"} ${matched.includes(card.id) ? "ring-2 ring-green-500" : ""}`}>
                  {isFlipped ? <span className="animate-in fade-in zoom-in-50 duration-300">{card.emoji}</span> : <span className="text-(--muted-foreground) opacity-30">?</span>}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex justify-center">
            <button onClick={() => startGame(difficulty)} className="inline-flex items-center gap-2 rounded-xl border border-(--border) bg-(--background) px-4 py-2 text-sm font-semibold text-(--muted-foreground) transition-all hover:border-(--primary)">
              <RotateCcw className="h-4 w-4" /> Restart
            </button>
          </div>
        </div>

        {gameWon && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-2xl border-2 border-green-500 bg-green-50 p-6 text-center shadow-lg dark:bg-green-950/20">
            <Trophy className="mx-auto mb-2 h-12 w-12 text-green-500" />
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">You Won! 🎉</p>
            <p className="mt-2 text-(--muted-foreground)">Completed in {moves} moves and {formatTime(seconds)}</p>
            {bestTime && <p className="text-sm text-(--muted-foreground)">Best time: {formatTime(bestTime)}</p>}
            <button onClick={() => startGame(difficulty)} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-(--primary) px-6 py-3 text-base font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98]">
              <RefreshCw className="h-5 w-5" /> Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
