"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  CalendarDays,
  Flame,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trophy,
  Lightbulb,
  Share2,
  RefreshCcw,
} from "lucide-react";
import { WORDS } from "../constants/data";

// ────────────────────────────────────────────────────────────────
// LocalStorage helpers
// ────────────────────────────────────────────────────────────────
const LS_STATE = "altf_daily_word_state";
const LS_STATS = "altf_daily_word_stats";

function loadLS(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveLS(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function getDayId() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export default function DailyWordChallengePage() {
  const dayId = getDayId();

  // Daily Word Selection (Cycles based on day of month)
  const wordData = useMemo(() => {
    const d = new Date();
    const idx = (d.getFullYear() * 100 + d.getMonth() * 31 + d.getDate()) % WORDS.length;
    return WORDS[idx];
  }, []);

  const MAX_GUESSES = 5;

  // States
  const [guess, setGuess] = useState("");
  const [gameState, setGameState] = useState(() => {
    const saved = loadLS(LS_STATE, null);
    if (saved && saved.dayId === dayId) return saved;
    return {
      dayId,
      guesses: [],
      status: "playing", // playing | won | lost
      hintsUsed: 0,
    };
  });

  const [stats, setStats] = useState(() => {
    return loadLS(LS_STATS, {
      played: 0,
      won: 0,
      currentStreak: 0,
      maxStreak: 0,
      lastPlayedDate: null,
    });
  });

  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  // Save game state on change
  useEffect(() => {
    saveLS(LS_STATE, gameState);
  }, [gameState]);

  const handleGuess = (e) => {
    e.preventDefault();
    if (gameState.status !== "playing") return;

    const currentGuess = guess.trim().toLowerCase();

    if (!currentGuess || currentGuess.length !== wordData.word.length) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    const isCorrect = currentGuess === wordData.word;
    const newGuesses = [...gameState.guesses, currentGuess];

    let newStatus = "playing";
    if (isCorrect) newStatus = "won";
    else if (newGuesses.length >= MAX_GUESSES) newStatus = "lost";

    setGameState((prev) => ({
      ...prev,
      guesses: newGuesses,
      status: newStatus,
    }));

    setGuess("");

    // Update stats if game over
    if (newStatus !== "playing") {
      updateStats(newStatus === "won");
    }
  };

  const updateStats = (won) => {
    setStats((prev) => {
      // Check if streak continues (was played yesterday)
      const today = new Date();
      today.setHours(0,0,0,0);
      let streak = prev.currentStreak;

      if (prev.lastPlayedDate) {
        const last = new Date(prev.lastPlayedDate);
        last.setHours(0,0,0,0);
        const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24));
        if (diffDays > 1) {
          streak = 0; // Streak broken
        }
      }

      if (won) streak += 1;
      else streak = 0;

      const newStats = {
        played: prev.played + 1,
        won: prev.won + (won ? 1 : 0),
        currentStreak: streak,
        maxStreak: Math.max(prev.maxStreak, streak),
        lastPlayedDate: dayId,
      };

      saveLS(LS_STATS, newStats);
      return newStats;
    });
  };

  const useHint = () => {
    if (gameState.hintsUsed < 2) {
      setGameState((prev) => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
    }
  };

  const giveUp = () => {
    if (gameState.status !== "playing") return;
    setGameState((prev) => ({ ...prev, status: "lost" }));
    updateStats(false);
  };

  // Render character boxes for past guesses
  const renderGuess = (g, i) => {
    const isCorrectWord = g === wordData.word;

    // Very simple Wordle logic for char coloring
    const targetArr = wordData.word.split('');
    const guessArr = g.split('');
    const result = new Array(wordData.length).fill('absent');

    // 1. Find correct letters (green)
    for (let j = 0; j < wordData.length; j++) {
      if (guessArr[j] === targetArr[j]) {
        result[j] = 'correct';
        targetArr[j] = null; // Mark used
      }
    }

    // 2. Find present letters (yellow)
    for (let j = 0; j < wordData.length; j++) {
      if (result[j] !== 'correct' && targetArr.includes(guessArr[j])) {
        result[j] = 'present';
        targetArr[targetArr.indexOf(guessArr[j])] = null; // Mark used
      }
    }

    return (
      <div key={i} className="flex justify-center gap-1.5 mb-2">
        {guessArr.map((char, j) => {
          let bg = "bg-[var(--card)] border-[var(--border)] text-[var(--foreground)]";
          if (result[j] === 'correct') bg = "bg-emerald-500 border-emerald-600 text-white shadow-sm";
          else if (result[j] === 'present') bg = "bg-amber-500 border-amber-600 text-white shadow-sm";
          else bg = "bg-[var(--muted)] border-[var(--border)] text-[var(--muted-foreground)] opacity-50";

          return (
            <div key={j} className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg border-2 text-lg sm:text-xl font-bold uppercase transition-all ${bg}`}>
              {char}
            </div>
          );
        })}
      </div>
    );
  };

  // Render empty boxes for current guess
  const renderCurrentRow = () => {
    const chars = guess.split('').slice(0, wordData.length);
    const emptyCount = Math.max(0, wordData.length - chars.length);
    const empties = new Array(emptyCount).fill('');

    return (
      <div className={`flex justify-center gap-1.5 mb-2 ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        {chars.map((char, j) => (
          <div key={`c-${j}`} className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg border-2 border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--foreground)] text-lg sm:text-xl font-bold uppercase">
            {char}
          </div>
        ))}
        {empties.map((_, j) => (
          <div key={`e-${j}`} className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg border-2 border-[var(--border)] bg-[var(--card)] opacity-50"></div>
        ))}
      </div>
    );
  };

  // Render empty rows for remaining guesses
  const renderEmptyRows = () => {
    const remaining = MAX_GUESSES - gameState.guesses.length - (gameState.status === 'playing' ? 1 : 0);
    const rows = [];
    for (let i = 0; i < remaining; i++) {
      rows.push(
        <div key={`r-${i}`} className="flex justify-center gap-1.5 mb-2 opacity-30">
          {new Array(wordData.length).fill('').map((_, j) => (
            <div key={`re-${j}`} className="flex h-10 w-10 sm:h-12 sm:w-12 rounded-lg border-2 border-[var(--border)] bg-[var(--card)]"></div>
          ))}
        </div>
      );
    }
    return rows;
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-8 sm:px-6">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}} />

      <div className="mx-auto max-w-2xl space-y-6">

        {/* Header */}
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-4 py-2">
            <CalendarDays className="h-5 w-5 text-[var(--primary)]" />
            <span className="text-sm font-semibold text-[var(--primary)]">Daily Puzzle</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Word Challenge
          </h1>
          <p className="mx-auto mt-2 text-sm text-[var(--muted-foreground)]">
            A new word every day. You have {MAX_GUESSES} attempts to guess it.
          </p>
        </div>

        {/* Stats Strip */}
        <div className="flex justify-center gap-4">
          <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 shadow-sm">
            <Trophy className="h-4 w-4 text-amber-500" />
            <div className="text-sm">
              <span className="text-[var(--muted-foreground)]">Wins: </span>
              <span className="font-bold">{stats.won}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 shadow-sm">
            <Flame className="h-4 w-4 text-orange-500" />
            <div className="text-sm">
              <span className="text-[var(--muted-foreground)]">Streak: </span>
              <span className="font-bold">{stats.currentStreak}</span>
            </div>
          </div>
        </div>

        {/* Clues Box */}
        <div className="rounded-2xl border border-[var(--primary)]/20 bg-gradient-to-br from-[var(--primary)]/5 to-[var(--card)] p-5 shadow-sm text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <HelpCircle className="h-24 w-24" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--primary)] mb-2 relative z-10">
            Definition
          </p>
          <p className="text-lg font-bold text-[var(--foreground)] relative z-10">
            &quot;{wordData.definition}&quot;
          </p>

          {gameState.hintsUsed >= 1 && (
            <div className="mt-4 pt-4 border-t border-[var(--primary)]/10 relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-1">
                Hint 1: Synonyms
              </p>
              <p className="text-sm font-medium text-[var(--foreground)]">
                {wordData.synonyms.join(", ")}
              </p>
            </div>
          )}

          {gameState.hintsUsed >= 2 && (
            <div className="mt-3 relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-1">
                Hint 2: Structure
              </p>
              <p className="text-sm font-medium text-[var(--foreground)]">
                {wordData.hint}
              </p>
            </div>
          )}
        </div>

        {/* Game Board */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm overflow-x-auto">
          <div className="min-w-max mx-auto">
            {gameState.guesses.map((g, i) => renderGuess(g, i))}
            {gameState.status === "playing" && renderCurrentRow()}
            {renderEmptyRows()}
          </div>

          {/* Input Area */}
          {gameState.status === "playing" ? (
            <form onSubmit={handleGuess} className="mt-8 max-w-sm mx-auto">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={guess}
                  onChange={(e) => {
                    // Only allow letters and limit to word length
                    const val = e.target.value.replace(/[^a-zA-Z]/g, '').slice(0, wordData.length);
                    setGuess(val);
                  }}
                  placeholder={`Type a ${wordData.length}-letter word`}
                  className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-center text-lg font-bold tracking-[0.2em] uppercase focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                  autoFocus
                />
              </div>
              <div className="mt-4 flex justify-between gap-2">
                <button
                  type="button"
                  onClick={useHint}
                  disabled={gameState.hintsUsed >= 2}
                  className="flex items-center justify-center gap-1.5 flex-1 rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 py-2.5 text-sm font-bold text-[var(--foreground)] transition-colors hover:bg-[var(--muted)] disabled:opacity-50"
                >
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  {gameState.hintsUsed >= 2 ? "No more hints" : "Get a Hint"}
                </button>
                <button
                  type="submit"
                  disabled={guess.length !== wordData.length}
                  className="flex-1 rounded-xl bg-[var(--primary)] py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  Guess
                </button>
              </div>
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={giveUp}
                  className="text-xs font-bold text-[var(--muted-foreground)] hover:text-red-500 transition-colors"
                >
                  I give up, show me the word.
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-8 text-center max-w-md mx-auto space-y-4">
              {gameState.status === "won" ? (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-2" />
                  <h3 className="text-xl font-bold text-emerald-600 mb-1">Brilliant!</h3>
                  <p className="text-sm text-[var(--foreground)] font-medium">
                    You guessed it in {gameState.guesses.length} {gameState.guesses.length === 1 ? 'try' : 'tries'}.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5">
                  <XCircle className="mx-auto h-12 w-12 text-red-500 mb-2" />
                  <h3 className="text-xl font-bold text-red-600 mb-1">Game Over</h3>
                  <p className="text-sm text-[var(--foreground)] font-medium">
                    The word was <span className="uppercase font-bold text-red-600">{wordData.word}</span>.
                  </p>
                </div>
              )}

              {/* Word Details (Always show at end) */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 p-4 text-left">
                <p className="text-lg font-bold text-[var(--primary)] uppercase mb-2">
                  {wordData.word}
                </p>
                <p className="text-sm text-[var(--foreground)] italic mb-3">
                  {wordData.example}
                </p>
                <div className="flex gap-2">
                  <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase">Synonyms:</span>
                  <span className="text-xs font-medium text-[var(--foreground)]">{wordData.synonyms.join(", ")}</span>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] py-4 text-sm font-semibold text-[var(--muted-foreground)]">
                Come back tomorrow for a new word challenge!
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
