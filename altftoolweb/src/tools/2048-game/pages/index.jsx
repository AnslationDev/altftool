"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Gamepad2, RefreshCw, RotateCcw, Timer, Trophy, Play, Pause, Zap } from "lucide-react";

const SIZE = 4;
const WIN_VALUE = 2048;

function createEmptyGrid() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function cloneGrid(grid) {
  return grid.map((row) => [...row]);
}

function getEmptyCells(grid) {
  const cells = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) cells.push([r, c]);
    }
  }
  return cells;
}

function addRandomTile(grid) {
  const empty = getEmptyCells(grid);
  if (empty.length === 0) return grid;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const newGrid = cloneGrid(grid);
  newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
  return newGrid;
}

function slideRow(row) {
  const filtered = row.filter((v) => v !== 0);
  const newRow = [];
  let score = 0;
  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const merged = filtered[i] * 2;
      newRow.push(merged);
      score += merged;
      i += 2;
    } else {
      newRow.push(filtered[i]);
      i += 1;
    }
  }
  while (newRow.length < SIZE) newRow.push(0);
  return { row: newRow, score };
}

function moveLeft(grid) {
  let newGrid = [];
  let totalScore = 0;
  for (let r = 0; r < SIZE; r++) {
    const { row, score } = slideRow(grid[r]);
    newGrid.push(row);
    totalScore += score;
  }
  return { grid: newGrid, score: totalScore };
}

function moveRight(grid) {
  let newGrid = [];
  let totalScore = 0;
  for (let r = 0; r < SIZE; r++) {
    const { row, score } = slideRow([...grid[r]].reverse());
    newGrid.push(row.reverse());
    totalScore += score;
  }
  return { grid: newGrid, score: totalScore };
}

function moveUp(grid) {
  let newGrid = cloneGrid(grid);
  let totalScore = 0;
  for (let c = 0; c < SIZE; c++) {
    const col = [];
    for (let r = 0; r < SIZE; r++) col.push(grid[r][c]);
    const { row, score } = slideRow(col);
    totalScore += score;
    for (let r = 0; r < SIZE; r++) newGrid[r][c] = row[r];
  }
  return { grid: newGrid, score: totalScore };
}

function moveDown(grid) {
  let newGrid = cloneGrid(grid);
  let totalScore = 0;
  for (let c = 0; c < SIZE; c++) {
    const col = [];
    for (let r = SIZE - 1; r >= 0; r--) col.push(grid[r][c]);
    const { row, score } = slideRow(col);
    totalScore += score;
    for (let r = SIZE - 1; r >= 0; r--) newGrid[r][c] = row[SIZE - 1 - r];
  }
  return { grid: newGrid, score: totalScore };
}

function gridsEqual(a, b) {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (a[r][c] !== b[r][c]) return false;
  return true;
}

function hasAvailableMoves(grid) {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) return true;
      if (c < SIZE - 1 && grid[r][c] === grid[r][c + 1]) return true;
      if (r < SIZE - 1 && grid[r][c] === grid[r + 1][c]) return true;
    }
  return false;
}

function hasWon(grid) {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (grid[r][c] === WIN_VALUE) return true;
  return false;
}

function getTileColor(value) {
  const colors = {
    0: "bg-[var(--surface-soft)] text-transparent",
    2: "bg-[#EEE4DA] text-[#776E65]",
    4: "bg-[#EDE0C8] text-[#776E65]",
    8: "bg-[#F2B179] text-white",
    16: "bg-[#F59563] text-white",
    32: "bg-[#F67C5F] text-white",
    64: "bg-[#F65E3B] text-white",
    128: "bg-[#EDCF72] text-white",
    256: "bg-[#EDCC61] text-white",
    512: "bg-[#EDC850] text-white",
    1024: "bg-[#EDC53F] text-white",
    2048: "bg-[#EDC22E] text-white",
    4096: "bg-[#3C3A32] text-white",
    8192: "bg-[#3C3A32] text-white",
  };
  return colors[value] || "bg-[#3C3A32] text-white";
}

function getTileFontSize(value) {
  const len = String(value).length;
  if (len <= 2) return "text-2xl sm:text-3xl";
  if (len === 3) return "text-xl sm:text-2xl";
  if (len === 4) return "text-lg sm:text-xl";
  return "text-sm sm:text-base";
}

export default function ToolHome() {
  const [grid, setGrid] = useState(() => addRandomTile(addRandomTile(createEmptyGrid())));
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [continued, setContinued] = useState(false);
  const [gameMode, setGameMode] = useState("classic");
  const [timeLeft, setTimeLeft] = useState(null);
  const [movesCount, setMovesCount] = useState(0);
  const [startTime, setStartTime] = useState(null);

const TIME_LIMIT = gameMode === "classic" ? null : 60;

  const move = useCallback(
    (direction) => {
      if (gameOver || won) return;

      if (TIME_LIMIT) {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }

      let result;
      switch (direction) {
        case "left":
          result = moveLeft(grid);
          break;
        case "right":
          result = moveRight(grid);
          break;
        case "up":
          result = moveUp(grid);
          break;
        case "down":
          result = moveDown(grid);
          break;
        default:
          return;
      }

      if (gridsEqual(grid, result.grid)) return;

      const withNew = addRandomTile(result.grid);
      const newScore = score + result.score;
      setGrid(withNew);
      setScore(newScore);
      setMovesCount(prev => prev + 1);
      if (newScore > bestScore) setBestScore(newScore);

      if (hasWon(withNew) && !continued) {
        setWon(true);
      }

      if (!hasAvailableMoves(withNew)) {
        setGameOver(true);
      }
    },
    [grid, score, bestScore, gameOver, won, continued]
  );

  const formattedTime = () => {
    if (!TIME_LIMIT) return "";
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return mins > 0 ? `${mins}:${secs < 10 ? "0" : ""}${secs}` : `0:${secs < 10 ? "0" : ""}${secs}`;
  };

  useEffect(() => {
    if (TIME_LIMIT && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [TIME_LIMIT, timeLeft]);

  useEffect(() => {
    const handleKey = (e) => {
      const keyMap = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down",
      };
      const dir = keyMap[e.key];
      if (dir) {
        e.preventDefault();
        move(dir);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [move]);

  const newGame = useCallback(() => {
    setGrid(addRandomTile(addRandomTile(createEmptyGrid())));
    setScore(0);
    setMovesCount(0);
    setGameOver(false);
    setWon(false);
    setContinued(false);
    setStartTime(Date.now());
    if (gameMode === "timed") {
      setTimeLeft(60);
    } else {
      setTimeLeft(null);
    }
  }, [gameMode]);

  const keepPlaying = useCallback(() => {
    setContinued(true);
    setWon(false);
  }, []);

  const gameClasses =
    gameOver || won
      ? "after:absolute after:inset-0 after:rounded-xl after:bg-black/50 after:flex after:items-center after:justify-center"
      : "";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-lg">
        <header className="mb-6 text-center">
          <div className="mx-auto mb-4 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600">
              <Gamepad2 className="h-3.5 w-3.5" />
              2048 Game
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs font-bold text-[var(--foreground)]">
              <RotateCcw className="h-3.5 w-3.5 text-[var(--primary)]" />
              Sliding Puzzle
            </span>
            {TIME_LIMIT && (
              <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-600">
                <Timer className="h-3.5 w-3.5" />
                Time: {formattedTime()}
              </span>
            )}
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs font-bold text-[var(--foreground)]">
              <Trophy className="h-3.5 w-3.5 text-[var(--primary)]" />
              Moves: {movesCount}
            </span>
          </div>
          <h1 className="heading mx-auto max-w-5xl text-center">2048</h1>
          <p className="description mx-auto mt-3 max-w-4xl text-center">
            Merge tiles with arrow keys or swipe buttons to reach 2048!
          </p>
        </header>

        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)]">
            <Trophy className="h-3.5 w-3.5 text-[var(--primary)]" />
            Achievements: {movesCount >= 10 ? ("🎯 Sixth Move!") : movesCount >= 5 ? ("⭐ Fifth Move!") : movesCount >= 3 ? ("🎯 Third Move!") : movesCount >= 1 ? ("🚀 First Move!") : "----"}
          </span>
          {[
            { key: "classic", label: "Classic", icon: Play, desc: "No time limit" },
            { key: "timed", label: "Timed", icon: Timer, desc: "60 seconds" },
            { key: "challenge", label: "Challenge", icon: Zap, desc: "Hard mode + timer" },
          ].map((mode) => (
            <button
              key={mode.key}
              type="button"
              onClick={() => {
                setGameMode(mode.key);
                setContinued(false);
                setGrid(addRandomTile(addRandomTile(createEmptyGrid())));
                setScore(0);
                setMovesCount(0);
                setStartTime(Date.now());
                if (mode.key === "timed") {
                  setTimeLeft(60);
                } else {
                  setTimeLeft(null);
                }
                setGameOver(false);
                setWon(false);
              }}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                gameMode === mode.key
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
              }`}
            >
              <mode.icon className="h-3.5 w-3.5" />
              {mode.label}
              <span className="hidden text-[10px] opacity-70 sm:inline">({mode.desc})</span>
            </button>
          ))}
        </div>

        <div className="w-full max-w-md mx-auto mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--muted-foreground)] w-12">Progress:</span>
            <div className="flex-1 h-2 bg-[var(--surface-soft)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--primary)] rounded-full transition-all duration-300"
                style={{ width: `${Math.min(movesCount * 10, 100)}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-[var(--foreground)]">{movesCount}/10</span>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex gap-3">
              <div className="rounded-lg bg-[var(--muted)] px-4 py-2 text-center">
                <p className="text-[10px] font-bold uppercase text-[var(--muted-foreground)]">Score</p>
                <p className="text-lg font-black text-[var(--foreground)]">{score.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-[var(--muted)] px-4 py-2 text-center">
                <p className="text-[10px] font-bold uppercase text-[var(--muted-foreground)]">Best</p>
                <p className="text-lg font-black text-[var(--foreground)]">{bestScore.toLocaleString()}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={newGame}
              className="btn-primary flex items-center gap-1.5 px-3 py-2 text-sm"
              title="New Game"
            >
              <RefreshCw className="h-4 w-4" />
              New
            </button>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[400px]">
            <div className="grid h-full w-full grid-cols-4 gap-2 rounded-xl bg-[var(--surface-soft)] p-2">
              {grid.flat().map((value, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-center rounded-lg font-bold transition-all duration-100 ${getTileColor(value)} ${getTileFontSize(value)}`}
                >
                  {value !== 0 ? value : ""}
                </div>
              ))}
            </div>

            {gameOver && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-black/60">
                <p className="text-3xl font-black text-white">Game Over!</p>
                <p className="mt-2 text-sm text-white/70">Score: {score.toLocaleString()}</p>
                <button
                  type="button"
                  onClick={newGame}
                  className="btn-primary mt-4 flex items-center gap-2 px-6 py-3 text-sm"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </button>
              </div>
            )}

            {won && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-black/60">
                <p className="text-3xl font-black text-amber-400">You Win!</p>
                <p className="mt-2 text-sm text-white/70">Score: {score.toLocaleString()}</p>
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={keepPlaying}
                    className="btn-secondary flex items-center gap-2 px-4 py-2.5 text-sm"
                  >
                    Keep Going
                  </button>
                  <button
                    type="button"
                    onClick={newGame}
                    className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm"
                  >
                    <RefreshCw className="h-4 w-4" />
                    New Game
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5">
            <p className="mb-2 text-center text-xs font-semibold text-[var(--muted-foreground)]">
              Use arrow keys or tap the buttons
            </p>
            <div className="mx-auto grid w-48 grid-cols-3 gap-2">
              <div />
              <button
                type="button"
                onClick={() => move("up")}
                className="flex h-12 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] transition-all active:scale-95 active:bg-[var(--primary)]/10"
                aria-label="Move up"
              >
                <ArrowUp className="h-5 w-5" />
              </button>
              <div />
              <button
                type="button"
                onClick={() => move("left")}
                className="flex h-12 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] transition-all active:scale-95 active:bg-[var(--primary)]/10"
                aria-label="Move left"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => move("down")}
                className="flex h-12 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] transition-all active:scale-95 active:bg-[var(--primary)]/10"
                aria-label="Move down"
              >
                <ArrowDown className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => move("right")}
                className="flex h-12 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] transition-all active:scale-95 active:bg-[var(--primary)]/10"
                aria-label="Move right"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
