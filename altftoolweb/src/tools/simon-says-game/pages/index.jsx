"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Brain,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Timer,
  Sparkles,
  Trash2,
  ChevronDown,
} from "lucide-react";
import GameBoard from "../components/GameBoard";
import StatsPanel from "../components/StatsPanel";
import Leaderboard from "../components/Leaderboard";
import {
  COLORS,
  MODES,
  DIFFICULTIES,
  generateSequence,
  appendToSequence,
  getTimedModeTime,
  calculateScore,
  calculateAccuracy,
  getPerformanceMessage,
  INITIAL_STATS,
  loadStats,
  saveStats,
  updateStatsAfterGame,
  loadLeaderboard,
  saveToLeaderboard,
} from "../utils/gameEngine";
import {
  playColorSound,
  playCorrect,
  playWrong,
  playGameOver,
  playLevelUp,
  playClick,
  setMuted,
  setVolume,
  getMuted,
  getVolume,
  resumeAudioContext,
} from "../utils/soundEngine";

function HeaderMetric({ label, value }) {
  return (
    <div className="min-w-0 flex-1 px-3 py-2 text-center">
      <p className="whitespace-normal text-[11px] font-semibold uppercase leading-4 text-[var(--muted-foreground)]">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold leading-6 text-[var(--foreground)]">{value}</p>
    </div>
  );
}

const GAME_STATES = {
  IDLE: "idle",
  SHOWING: "showing",
  INPUT: "input",
  PAUSED: "paused",
  GAME_OVER: "gameover",
  WON: "won",
};

export default function ToolHome() {
  const [gameState, setGameState] = useState(GAME_STATES.IDLE);
  const [mode, setMode] = useState("classic");
  const [difficulty, setDifficulty] = useState("medium");
  const [sequence, setSequence] = useState([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [activePad, setActivePad] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [muted, setMutedState] = useState(false);
  const [vol, setVolState] = useState(0.6);
  const [stats, setStats] = useState(() => loadStats());
  const [leaderboard, setLeaderboard] = useState(() => loadLeaderboard());
  const [showSettings, setShowSettings] = useState(false);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAttempts, setCorrectAttempts] = useState(0);

  const timerRef = useRef(null);
  const inputTimerRef = useRef(null);
  const sequenceRef = useRef([]);
  const busyRef = useRef(false);
  const pausedRef = useRef(false);
  const startTimeRef = useRef(null);
  const totalAttemptsRef = useRef(0);
  const correctAttemptsRef = useRef(0);
  const gameActiveRef = useRef(false);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearTimeout(inputTimerRef.current);
    };
  }, []);

  function stopTimers() {
    clearInterval(timerRef.current);
    clearTimeout(inputTimerRef.current);
    timerRef.current = null;
    inputTimerRef.current = null;
  }

  function toggleMute() {
    const next = !muted;
    setMutedState(next);
    setMuted(next);
    playClick();
  }

  function handleVolumeChange(e) {
    const v = parseFloat(e.target.value);
    setVolState(v);
    setVolume(v);
  }

  function startGame() {
    resumeAudioContext();
    stopTimers();
    const initSeq = generateSequence(1);
    sequenceRef.current = initSeq;
    setSequence(initSeq);
    setPlayerIndex(0);
    setLevel(1);
    setScore(0);
    setLives(mode === "classic" ? 3 : mode === "endless" ? 1 : 3);
    setTimeLeft(0);
    totalAttemptsRef.current = 0;
    correctAttemptsRef.current = 0;
    setTotalAttempts(0);
    setCorrectAttempts(0);
    busyRef.current = false;
    pausedRef.current = false;
    gameActiveRef.current = true;
    setGameState(GAME_STATES.SHOWING);
    playSequence(initSeq, difficulty, () => {
      setGameState(GAME_STATES.INPUT);
      startInputTimer(1, difficulty);
    });
  }

  function playSequence(seq, diff, onDone) {
    const { speed, pauseMs } = DIFFICULTIES[diff];
    let i = 0;

    function showNext() {
      if (!gameActiveRef.current || pausedRef.current) return;
      if (i >= seq.length) {
        setActivePad(null);
        setTimeout(onDone, pauseMs);
        return;
      }
      const color = seq[i];
      setActivePad(color);
      playColorSound(color);
      setTimeout(() => {
        setActivePad(null);
        i++;
        setTimeout(showNext, pauseMs);
      }, speed);
    }

    showNext();
  }

  function startInputTimer(lvl, diff) {
    if (mode === "timed") {
      const time = getTimedModeTime(lvl, diff);
      setTimeLeft(time);
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            if (gameActiveRef.current && !pausedRef.current) {
              handleWrong();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (DIFFICULTIES[diff].inputTimeLimit > 0) {
      clearTimeout(inputTimerRef.current);
      inputTimerRef.current = setTimeout(() => {
        if (gameActiveRef.current && !pausedRef.current) {
          handleWrong();
        }
      }, DIFFICULTIES[diff].inputTimeLimit);
    }
  }

  function handleCorrectInput() {
    playCorrect();
    totalAttemptsRef.current += 1;
    correctAttemptsRef.current += 1;
    setTotalAttempts((value) => value + 1);
    setCorrectAttempts((value) => value + 1);
    setPlayerIndex((prev) => prev + 1);
  }

  function handleWrong() {
    playWrong();
    totalAttemptsRef.current += 1;
    setTotalAttempts((value) => value + 1);
    stopTimers();

    if (mode === "practice") {
      setGameState(GAME_STATES.SHOWING);
      playSequence(sequenceRef.current, difficulty, () => {
        setGameState(GAME_STATES.INPUT);
        startInputTimer(level, difficulty);
      });
      return;
    }

    const newLives = lives - 1;
    setLives(newLives);

    if (newLives <= 0 || mode === "endless") {
      endGame();
    } else {
      setGameState(GAME_STATES.SHOWING);
      setTimeout(() => {
        setPlayerIndex(0);
        playSequence(sequenceRef.current, difficulty, () => {
          setGameState(GAME_STATES.INPUT);
          startInputTimer(level, difficulty);
        });
      }, 800);
    }
  }

  function advanceLevel() {
    stopTimers();
    playLevelUp();
    const nextSeq = appendToSequence(sequenceRef.current);
    sequenceRef.current = nextSeq;
    setSequence(nextSeq);
    const nextLevel = level + 1;
    setLevel(nextLevel);
    setScore(calculateScore(nextLevel, difficulty));
    setPlayerIndex(0);

    if (mode === "classic" && nextLevel >= 20) {
      endGame(true);
      return;
    }

    setGameState(GAME_STATES.SHOWING);
    setTimeout(() => {
      playSequence(nextSeq, difficulty, () => {
        setGameState(GAME_STATES.INPUT);
        startInputTimer(nextLevel, difficulty);
      });
    }, 500);
  }

  function handlePadClick(color) {
    if (gameState !== GAME_STATES.INPUT || busyRef.current || pausedRef.current) return;

    setActivePad(color);
    playColorSound(color);
    setTimeout(() => setActivePad(null), 200);

    if (color === sequenceRef.current[playerIndex]) {
      handleCorrectInput();
      if (playerIndex + 1 >= sequenceRef.current.length) {
        advanceLevel();
      }
    } else {
      handleWrong();
    }
  }

  function endGame(won = false) {
    stopTimers();
    gameActiveRef.current = false;
    const finalScore = calculateScore(level, difficulty);
    const accuracy = calculateAccuracy(totalAttemptsRef.current, correctAttemptsRef.current);

    if (won) {
      setScore(finalScore + 100);
      playCorrect();
    } else {
      playGameOver();
    }

    setScore((prev) => {
      const finalVal = won ? prev + 100 : prev;
      const updatedStats = updateStatsAfterGame(stats, {
        level,
        score: finalVal,
        accuracy,
        won,
      });
      setStats(updatedStats);
      saveStats(updatedStats);
      const entry = saveToLeaderboard({
        score: finalVal,
        level,
        mode: MODES[mode].label,
        difficulty: DIFFICULTIES[difficulty].label,
        accuracy,
      });
      setLeaderboard(entry);
      return finalVal;
    });

    setGameState(won ? GAME_STATES.WON : GAME_STATES.GAME_OVER);
  }

  function pauseGame() {
    if (gameState !== GAME_STATES.SHOWING && gameState !== GAME_STATES.INPUT) return;
    pausedRef.current = true;
    stopTimers();
    setGameState(GAME_STATES.PAUSED);
  }

  function resumeGame() {
    pausedRef.current = false;
    setGameState(GAME_STATES.SHOWING);
    playSequence(sequenceRef.current, difficulty, () => {
      setGameState(GAME_STATES.INPUT);
      startInputTimer(level, difficulty);
    });
  }

  function resetGame() {
    stopTimers();
    gameActiveRef.current = false;
    pausedRef.current = false;
    busyRef.current = false;
    setGameState(GAME_STATES.IDLE);
    setSequence([]);
    setPlayerIndex(0);
    setLevel(0);
    setScore(0);
    setLives(3);
    setActivePad(null);
    setTimeLeft(0);
    totalAttemptsRef.current = 0;
    correctAttemptsRef.current = 0;
    setTotalAttempts(0);
    setCorrectAttempts(0);
  }

  function clearStats() {
    const fresh = { ...INITIAL_STATS };
    setStats(fresh);
    saveStats(fresh);
    setLeaderboard([]);
    localStorage.removeItem("simon-says-leaderboard");
  }

  const isPlaying =
    gameState === GAME_STATES.SHOWING ||
    gameState === GAME_STATES.INPUT ||
    gameState === GAME_STATES.PAUSED;

  const accuracy =
    totalAttempts > 0
      ? calculateAccuracy(totalAttempts, correctAttempts)
      : 0;

  const statusLabel =
    gameState === GAME_STATES.IDLE
      ? "Press Start to play"
      : gameState === GAME_STATES.SHOWING
      ? "Watch the sequence"
      : gameState === GAME_STATES.INPUT
      ? "Your turn — repeat the sequence"
      : gameState === GAME_STATES.PAUSED
      ? "Game paused"
      : gameState === GAME_STATES.WON
      ? "Congratulations!"
      : "Game Over";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Hero */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Brain className="h-4 w-4" />
            Memory training
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] xl:items-end">
            <div className="min-w-0">
              <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">
                Simon Says Game
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
                Test your memory and reflexes. Watch the pattern, then repeat it. Multiple modes
                and difficulty levels for every skill level.
              </p>
            </div>
            <div className="grid min-w-0 grid-cols-3 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)]">
              <HeaderMetric label="Level" value={level || "—"} />
              <HeaderMetric label="Score" value={score} />
              <HeaderMetric label="Accuracy" value={accuracy > 0 ? `${accuracy}%` : "—"} />
            </div>
          </div>
        </section>

        {/* Main Area */}
        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Game Panel */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-[var(--primary)]">Game board</p>
                <h2 className="mt-1 text-xl font-semibold">{statusLabel}</h2>
              </div>
              <div className="inline-flex items-center gap-2 text-sm">
                {muted ? (
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] transition hover:text-[var(--foreground)] focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)]"
                    aria-label="Unmute"
                  >
                    <VolumeX className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] transition hover:text-[var(--foreground)] focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)]"
                    aria-label="Mute"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                )}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={vol}
                  onChange={handleVolumeChange}
                  className="h-1.5 w-20 cursor-pointer accent-[var(--primary)]"
                  aria-label="Volume"
                />
              </div>
            </div>

            {/* Lives */}
            {isPlaying && mode !== "endless" && (
              <div className="mt-3 flex items-center gap-1.5" aria-label={`${lives} lives remaining`}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <span
                    key={i}
                    className={`inline-block h-3 w-3 rounded-full transition-colors ${
                      i < lives ? "bg-[var(--anslation-ds-danger)]" : "bg-[var(--muted)]"
                    }`}
                    aria-hidden="true"
                  />
                ))}
                <span className="ml-2 text-sm font-semibold text-[var(--muted-foreground)]">
                  {lives} {lives === 1 ? "life" : "lives"}
                </span>
              </div>
            )}

            {/* Timer for timed mode */}
            {isPlaying && mode === "timed" && (
              <div className="mt-3 flex items-center gap-2">
                <Timer className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--muted)]">
                  <div
                    className="h-full rounded-full bg-[var(--primary)] transition-all duration-1000"
                    style={{ width: `${Math.max(0, (timeLeft / (DIFFICULTIES[difficulty].inputTimeLimit || 8)) * 100)}%` }}
                  />
                </div>
                <span className="text-sm font-bold tabular-nums">{timeLeft}s</span>
              </div>
            )}

            {/* Game Board */}
            <div className="mt-6 flex items-center justify-center">
              <GameBoard
                activePad={activePad}
                onPadClick={handlePadClick}
                disabled={gameState !== GAME_STATES.INPUT}
              />
            </div>

            {/* Sequence indicator */}
            {isPlaying && (
              <p className="mt-4 text-center text-sm text-[var(--muted-foreground)]">
                Sequence length: <span className="font-semibold text-[var(--foreground)]">{sequence.length}</span>
              </p>
            )}

            {/* Controls */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              {gameState === GAME_STATES.IDLE ? (
                <button
                  type="button"
                  onClick={startGame}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[var(--primary)] bg-[var(--primary)] px-6 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90 focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  <Play className="h-4 w-4" />
                  Start Game
                </button>
              ) : gameState === GAME_STATES.PAUSED ? (
                <button
                  type="button"
                  onClick={resumeGame}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[var(--primary)] bg-[var(--primary)] px-6 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90 focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  <Play className="h-4 w-4" />
                  Resume
                </button>
              ) : (
                <button
                  type="button"
                  onClick={pauseGame}
                  disabled={gameState !== GAME_STATES.SHOWING && gameState !== GAME_STATES.INPUT}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-6 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Pause className="h-4 w-4" />
                  Pause
                </button>
              )}

              {gameState !== GAME_STATES.IDLE && (
                <button
                  type="button"
                  onClick={resetGame}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  <RotateCcw className="h-4 w-4" />
                  Restart
                </button>
              )}
            </div>

            {/* Game Over / Win */}
            {(gameState === GAME_STATES.GAME_OVER || gameState === GAME_STATES.WON) && (
              <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--background)] p-5 text-center">
                <p className="text-lg font-bold text-[var(--foreground)]">
                  {gameState === GAME_STATES.WON ? "You Won!" : "Game Over!"}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {getPerformanceMessage(accuracy, level)}
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-md bg-[var(--muted)] px-3 py-2">
                    <span className="block text-xs font-semibold uppercase text-[var(--muted-foreground)]">Level</span>
                    <span className="mt-1 block text-lg font-bold">{level}</span>
                  </div>
                  <div className="rounded-md bg-[var(--muted)] px-3 py-2">
                    <span className="block text-xs font-semibold uppercase text-[var(--muted-foreground)]">Score</span>
                    <span className="mt-1 block text-lg font-bold">{score}</span>
                  </div>
                  <div className="rounded-md bg-[var(--muted)] px-3 py-2">
                    <span className="block text-xs font-semibold uppercase text-[var(--muted-foreground)]">Accuracy</span>
                    <span className="mt-1 block text-lg font-bold">{accuracy}%</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={startGame}
                  className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[var(--primary)] bg-[var(--primary)] px-6 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90 focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  <RotateCcw className="h-4 w-4" />
                  Play Again
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-4">
            {/* Mode & Difficulty */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-xs font-semibold uppercase text-[var(--primary)]">Settings</p>
              <h3 className="mt-1 text-lg font-semibold">Game Config</h3>

              <label className="mt-3 block text-sm font-semibold" htmlFor="simon-mode">
                Game Mode
              </label>
              <div className="relative mt-1.5">
                <select
                  id="simon-mode"
                  value={mode}
                  onChange={(e) => {
                    setMode(e.target.value);
                    if (gameState === GAME_STATES.IDLE) playClick();
                  }}
                  disabled={isPlaying}
                  className="h-11 w-full appearance-none rounded-md border border-[var(--border)] bg-[var(--background)] px-3 pr-10 text-sm font-semibold text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)] disabled:opacity-60"
                >
                  {Object.entries(MODES).map(([key, m]) => (
                    <option key={key} value={key}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
              </div>
              <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">{MODES[mode].description}</p>

              <label className="mt-4 block text-sm font-semibold" htmlFor="simon-difficulty">
                Difficulty
              </label>
              <div className="relative mt-1.5">
                <select
                  id="simon-difficulty"
                  value={difficulty}
                  onChange={(e) => {
                    setDifficulty(e.target.value);
                    if (gameState === GAME_STATES.IDLE) playClick();
                  }}
                  disabled={isPlaying}
                  className="h-11 w-full appearance-none rounded-md border border-[var(--border)] bg-[var(--background)] px-3 pr-10 text-sm font-semibold text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)] disabled:opacity-60"
                >
                  {Object.entries(DIFFICULTIES).map(([key, d]) => (
                    <option key={key} value={key}>
                      {d.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
              </div>
              <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
                Speed: {DIFFICULTIES[difficulty].speed}ms
                {DIFFICULTIES[difficulty].inputTimeLimit > 0
                  ? ` · Time limit: ${DIFFICULTIES[difficulty].inputTimeLimit / 1000}s`
                  : ""}
              </p>

              {/* Mode info */}
              <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                <p className="text-sm font-semibold">How to Play</p>
                <ul className="mt-2 space-y-1 text-xs leading-5 text-[var(--muted-foreground)]">
                  <li>1. Watch the colored pads light up</li>
                  <li>2. Repeat the sequence by clicking pads</li>
                  <li>3. Each level adds one more step</li>
                  <li>4. Survive as long as you can!</li>
                </ul>
              </div>
            </div>

            <StatsPanel stats={stats} />
            <Leaderboard entries={leaderboard} />

            <button
              type="button"
              onClick={clearStats}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--anslation-ds-danger)] hover:text-[var(--anslation-ds-danger)] focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear All Data
            </button>
          </aside>
        </section>
      </div>
    </main>
  );
}
