"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  CheckCheck,
  Eraser,
  Flame,
  Grid3x3,
  Infinity as InfinityIcon,
  Lightbulb,
  Pause,
  Pencil,
  Play,
  RotateCcw,
  Timer,
  Trophy,
} from "lucide-react";
import {
  CLUE_TARGETS,
  PEERS,
  computeStreaks,
  dailySeed,
  dateKey,
  generatePuzzle,
} from "../lib";

const KEY_STATE = "altf:sudoku:state";
const KEY_STATS = "altf:sudoku:stats";
const KEY_DAILY = "altf:sudoku:daily";
const MAX_HINTS = 3;

const DIFFICULTIES = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
  { id: "expert", label: "Expert" },
];

const difficultyLabel = (id) =>
  DIFFICULTIES.find((item) => item.id === id)?.label || "Medium";

const formatClock = (totalSeconds) => {
  const safe = Math.max(0, Math.floor(totalSeconds || 0));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

function buildGame(mode, difficulty, seed) {
  const { puzzle, solution, clues } = generatePuzzle(seed, difficulty);
  return {
    id: `${mode}-${difficulty}-${seed}-${Date.now()}`,
    mode,
    difficulty,
    seed,
    clues,
    puzzle,
    solution,
    board: puzzle.slice(),
    notes: new Array(81).fill(0),
    hinted: [],
    mistakes: 0,
    hintsUsed: 0,
    status: "playing",
    dailyKey: mode === "daily" ? dateKey(new Date()) : null,
  };
}

function isUsableSavedGame(saved, todayKey) {
  if (!saved || saved.status !== "playing") return false;
  const grids = [saved.puzzle, saved.solution, saved.board, saved.notes];
  if (grids.some((grid) => !Array.isArray(grid) || grid.length !== 81)) return false;
  if (saved.mode === "daily" && saved.dailyKey !== todayKey) return false;
  if (saved.mode === "unlimited" && !CLUE_TARGETS[saved.difficulty]) return false;
  return true;
}

function celebrate() {
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  } catch {
    return;
  }
  import("canvas-confetti")
    .then((mod) => {
      const confetti = mod.default;
      confetti({ particleCount: 130, spread: 75, origin: { y: 0.6 } });
      window.setTimeout(
        () => confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 } }),
        220
      );
      window.setTimeout(
        () => confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 } }),
        380
      );
    })
    .catch(() => {});
}

function AssistToggle({ label, active, onToggle }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      onClick={onToggle}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "border-[var(--primary)] text-[var(--primary)]"
          : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${active ? "bg-[var(--primary)]" : "bg-[var(--border)]"}`}
      />
      {label}
    </button>
  );
}

function StatTile({ label, value }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-center">
      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

export default function ToolHome() {
  const [hydrated, setHydrated] = useState(false);
  const [tab, setTab] = useState("daily");
  const [difficulty, setDifficulty] = useState("medium");
  const [game, setGame] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState(null);
  const [notesMode, setNotesMode] = useState(false);
  const [assists, setAssists] = useState({ conflicts: true, counts: true });
  const [checkedWrong, setCheckedWrong] = useState([]);
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState(null);
  const [daily, setDaily] = useState({ completed: {} });
  const [pendingResume, setPendingResume] = useState(null);
  const [todayKey, setTodayKey] = useState(null);
  const [todayLabel, setTodayLabel] = useState("");

  const elapsedRef = useRef(0);
  const winHandledRef = useRef(null);
  const flashTimerRef = useRef(null);
  const cellRefs = useRef([]);

  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  useEffect(() => {
    let savedState = null;
    let savedStats = null;
    let savedDaily = null;
    try {
      savedState = JSON.parse(window.localStorage.getItem(KEY_STATE) || "null");
      savedStats = JSON.parse(window.localStorage.getItem(KEY_STATS) || "null");
      savedDaily = JSON.parse(window.localStorage.getItem(KEY_DAILY) || "null");
    } catch {
      savedState = null;
    }

    const now = new Date();
    const key = dateKey(now);
    setTodayKey(key);
    setTodayLabel(
      now.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })
    );
    setStats(savedStats && typeof savedStats === "object" ? savedStats : {});
    if (savedDaily && typeof savedDaily === "object" && savedDaily.completed) {
      setDaily(savedDaily);
    }

    const savedGame = savedState?.game;
    if (isUsableSavedGame(savedGame, key)) {
      setPendingResume({ game: savedGame, elapsed: Number(savedState.elapsed) || 0 });
      if (savedState.assists && typeof savedState.assists === "object") {
        setAssists({
          conflicts: savedState.assists.conflicts !== false,
          counts: savedState.assists.counts !== false,
        });
      }
      setTab(savedGame.mode === "daily" ? "daily" : "unlimited");
      if (savedGame.mode === "unlimited") setDifficulty(savedGame.difficulty);
    } else if (!savedDaily?.completed?.[key]) {
      setGame(buildGame("daily", "medium", dailySeed(now)));
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (game && game.status === "playing") {
        window.localStorage.setItem(KEY_STATE, JSON.stringify({ game, elapsed, assists }));
      } else if (game && game.status === "won") {
        window.localStorage.removeItem(KEY_STATE);
      }
    } catch {}
  }, [hydrated, game, elapsed, assists]);

  useEffect(() => {
    if (!hydrated || stats == null) return;
    try {
      window.localStorage.setItem(KEY_STATS, JSON.stringify(stats));
    } catch {}
  }, [hydrated, stats]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY_DAILY, JSON.stringify(daily));
    } catch {}
  }, [hydrated, daily]);

  const gameId = game?.id;
  const gameStatus = game?.status;

  useEffect(() => {
    if (!gameId || gameStatus !== "playing" || paused || pendingResume) return undefined;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [gameId, gameStatus, paused, pendingResume]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) setPaused(true);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(
    () => () => {
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    },
    []
  );

  useEffect(() => {
    if (selected != null) cellRefs.current[selected]?.focus();
  }, [selected]);

  const flash = useCallback((text) => {
    setMessage(text);
    if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    flashTimerRef.current = window.setTimeout(() => setMessage(""), 3200);
  }, []);

  const placeValue = useCallback(
    (index, value) => {
      setGame((prev) => {
        if (!prev || prev.status !== "playing") return prev;
        if (prev.puzzle[index] !== 0) return prev;
        const board = prev.board.slice();
        const notes = prev.notes.slice();
        let mistakes = prev.mistakes;

        if (value === 0) {
          if (board[index] === 0 && notes[index] === 0) return prev;
          board[index] = 0;
          notes[index] = 0;
        } else if (notesMode && board[index] === 0) {
          notes[index] ^= 1 << (value - 1);
        } else if (board[index] === value) {
          board[index] = 0;
        } else {
          board[index] = value;
          notes[index] = 0;
          const peers = PEERS[index];
          let conflictHit = false;
          for (let k = 0; k < peers.length; k += 1) {
            notes[peers[k]] &= ~(1 << (value - 1));
            if (board[peers[k]] === value) conflictHit = true;
          }
          if (conflictHit) mistakes += 1;
        }

        let status = prev.status;
        if (board.every((cell, i) => cell !== 0 && cell === prev.solution[i])) {
          status = "won";
        }
        return { ...prev, board, notes, mistakes, status };
      });
      setCheckedWrong((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : prev));
    },
    [notesMode]
  );

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      ) {
        return;
      }
      if (!game || game.mode !== tab || game.status !== "playing") return;
      if (event.key === "n" || event.key === "N") {
        setNotesMode((value) => !value);
        return;
      }
      if (paused || pendingResume) return;
      if (event.key.startsWith("Arrow")) {
        event.preventDefault();
        setSelected((prev) => {
          const current = prev == null ? 40 : prev;
          const row = Math.floor(current / 9);
          const col = current % 9;
          if (event.key === "ArrowUp") return Math.max(0, row - 1) * 9 + col;
          if (event.key === "ArrowDown") return Math.min(8, row + 1) * 9 + col;
          if (event.key === "ArrowLeft") return row * 9 + Math.max(0, col - 1);
          return row * 9 + Math.min(8, col + 1);
        });
        return;
      }
      if (selected == null) return;
      if (event.key >= "1" && event.key <= "9") {
        placeValue(selected, Number(event.key));
        return;
      }
      if (event.key === "0" || event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        placeValue(selected, 0);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [game, tab, paused, pendingResume, selected, placeValue]);

  useEffect(() => {
    if (!game || game.status !== "won" || winHandledRef.current === game.id) return;
    winHandledRef.current = game.id;
    const finishTime = elapsedRef.current;
    setSelected(null);
    setStats((prev) => {
      const base = prev || {};
      const entry = base[game.difficulty] || { won: 0, best: null };
      return {
        ...base,
        [game.difficulty]: {
          won: entry.won + 1,
          best: entry.best == null ? finishTime : Math.min(entry.best, finishTime),
        },
      };
    });
    if (game.mode === "daily" && game.dailyKey) {
      setDaily((prev) => ({
        ...prev,
        completed: {
          ...(prev.completed || {}),
          [game.dailyKey]: {
            time: finishTime,
            mistakes: game.mistakes,
            hints: game.hintsUsed,
          },
        },
      }));
    }
    celebrate();
  }, [game]);

  const startGame = useCallback((mode, level) => {
    const seed =
      mode === "daily" ? dailySeed(new Date()) : Math.floor(Math.random() * 0x7fffffff);
    setGame(buildGame(mode, mode === "daily" ? "medium" : level, seed));
    setElapsed(0);
    setPaused(false);
    setSelected(null);
    setNotesMode(false);
    setCheckedWrong([]);
    setMessage("");
    setPendingResume(null);
  }, []);

  const restartGame = () => {
    if (!game) return;
    setGame((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        id: `${prev.mode}-${prev.difficulty}-${prev.seed}-${Date.now()}`,
        board: prev.puzzle.slice(),
        notes: new Array(81).fill(0),
        hinted: [],
        mistakes: 0,
        hintsUsed: 0,
        status: "playing",
      };
    });
    setElapsed(0);
    setPaused(false);
    setSelected(null);
    setNotesMode(false);
    setCheckedWrong([]);
    setMessage("");
    setPendingResume(null);
    if (game.mode === "daily") setTab("daily");
  };

  const resumeSaved = () => {
    if (!pendingResume) return;
    setGame(pendingResume.game);
    setElapsed(pendingResume.elapsed);
    setPaused(false);
    setSelected(null);
    setNotesMode(false);
    setCheckedWrong([]);
    setPendingResume(null);
  };

  const discardSaved = () => {
    const savedMode = pendingResume?.game?.mode || tab;
    startGame(savedMode, savedMode === "daily" ? "medium" : difficulty);
  };

  const switchTab = (next) => {
    if (next === tab) return;
    setTab(next);
    setSelected(null);
    if (game && game.status === "playing" && game.mode !== next) setPaused(true);
  };

  const viewGame = game && game.mode === tab ? game : null;
  const isPaused = Boolean(paused && viewGame && viewGame.status === "playing");
  const showResume = Boolean(pendingResume && pendingResume.game.mode === tab);
  const canInput = Boolean(viewGame && viewGame.status === "playing" && !isPaused && !showResume);

  const useHint = () => {
    if (!viewGame || viewGame.status !== "playing" || viewGame.hintsUsed >= MAX_HINTS) return;
    const pool = [];
    for (let i = 0; i < 81; i += 1) {
      if (viewGame.puzzle[i] === 0 && viewGame.board[i] !== viewGame.solution[i]) pool.push(i);
    }
    if (pool.length === 0) return;
    const index =
      selected != null && pool.includes(selected)
        ? selected
        : pool[Math.floor(Math.random() * pool.length)];
    setGame((prev) => {
      if (!prev || prev.status !== "playing" || prev.hintsUsed >= MAX_HINTS) return prev;
      const board = prev.board.slice();
      const notes = prev.notes.slice();
      const value = prev.solution[index];
      board[index] = value;
      notes[index] = 0;
      for (const peer of PEERS[index]) notes[peer] &= ~(1 << (value - 1));
      let status = prev.status;
      if (board.every((cell, i) => cell !== 0 && cell === prev.solution[i])) status = "won";
      return {
        ...prev,
        board,
        notes,
        status,
        hintsUsed: prev.hintsUsed + 1,
        hinted: [...prev.hinted, index],
      };
    });
    setCheckedWrong((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : prev));
    setSelected(index);
  };

  const runCheck = () => {
    if (!viewGame || viewGame.status !== "playing") return;
    const wrong = [];
    for (let i = 0; i < 81; i += 1) {
      if (
        viewGame.puzzle[i] === 0 &&
        viewGame.board[i] !== 0 &&
        viewGame.board[i] !== viewGame.solution[i]
      ) {
        wrong.push(i);
      }
    }
    setCheckedWrong(wrong);
    flash(
      wrong.length === 0
        ? "Everything placed so far matches the solution."
        : `${wrong.length} ${wrong.length === 1 ? "cell doesn't" : "cells don't"} match the solution.`
    );
  };

  const conflicts = useMemo(() => {
    const set = new Set();
    if (!viewGame) return set;
    const board = viewGame.board;
    for (let i = 0; i < 81; i += 1) {
      const value = board[i];
      if (!value) continue;
      const peers = PEERS[i];
      for (let k = 0; k < peers.length; k += 1) {
        if (board[peers[k]] === value) {
          set.add(i);
          break;
        }
      }
    }
    return set;
  }, [viewGame]);

  const remaining = useMemo(() => {
    const counts = new Array(10).fill(9);
    if (!viewGame) return counts;
    for (let i = 0; i < 81; i += 1) {
      const value = viewGame.board[i];
      if (value) counts[value] -= 1;
    }
    return counts;
  }, [viewGame]);

  const peerSet = useMemo(
    () => (selected == null ? null : new Set(PEERS[selected])),
    [selected]
  );
  const hintedSet = useMemo(() => new Set(viewGame?.hinted || []), [viewGame]);
  const wrongSet = useMemo(() => new Set(checkedWrong), [checkedWrong]);
  const streaks = useMemo(() => {
    if (!todayKey) return { current: 0, longest: 0, total: 0 };
    const [y, m, d] = todayKey.split("-").map(Number);
    return computeStreaks(daily.completed || {}, new Date(y, m - 1, d));
  }, [daily, todayKey]);

  const selectedValue = selected != null && viewGame ? viewGame.board[selected] : 0;
  const dailyDoneToday = Boolean(todayKey && daily.completed?.[todayKey]);
  const dailyRecord = todayKey ? daily.completed?.[todayKey] : null;

  const renderCell = (index) => {
    const row = Math.floor(index / 9);
    const col = index % 9;
    const value = viewGame.board[index];
    const isGiven = viewGame.puzzle[index] !== 0;
    const isSelected = selected === index;
    const inConflict = assists.conflicts && conflicts.has(index) && value !== 0;
    const isWrong = wrongSet.has(index);
    const isPeer = peerSet != null && peerSet.has(index);
    const isSameNumber = !isSelected && selectedValue !== 0 && value === selectedValue;

    let background;
    if (isSelected) background = "color-mix(in srgb, var(--primary) 26%, transparent)";
    else if (isWrong || inConflict)
      background = "color-mix(in srgb, var(--anslation-ds-danger) 16%, transparent)";
    else if (isSameNumber) background = "color-mix(in srgb, var(--primary) 13%, transparent)";
    else if (isPeer) background = "var(--muted)";

    let textClass = isGiven
      ? "text-[var(--foreground)]"
      : hintedSet.has(index)
        ? "text-[var(--anslation-ds-success)]"
        : "text-[var(--primary)]";
    if ((inConflict || isWrong) && !isGiven) textClass = "text-[var(--anslation-ds-danger)]";

    const borders = `${
      col < 8
        ? col % 3 === 2
          ? "border-r-2 border-r-[var(--muted-foreground)]"
          : "border-r border-r-[var(--border)]"
        : ""
    } ${
      row < 8
        ? row % 3 === 2
          ? "border-b-2 border-b-[var(--muted-foreground)]"
          : "border-b border-b-[var(--border)]"
        : ""
    }`;

    return (
      <button
        key={index}
        ref={(el) => {
          cellRefs.current[index] = el;
        }}
        type="button"
        tabIndex={isSelected || (selected == null && index === 40) ? 0 : -1}
        aria-label={`Row ${row + 1}, column ${col + 1}${
          value ? `, ${value}` : ", empty"
        }${isGiven ? ", given" : ""}`}
        onClick={() => canInput && setSelected(index)}
        className={`relative flex touch-manipulation select-none items-center justify-center text-lg font-semibold outline-none sm:text-2xl ${borders} ${textClass}`}
        style={background ? { background } : undefined}
      >
        {value !== 0 ? (
          value
        ) : viewGame.notes[index] !== 0 ? (
          <span className="grid h-full w-full grid-cols-3 grid-rows-3 p-0.5 text-[8px] font-medium leading-none text-[var(--muted-foreground)] sm:text-[10px]">
            {Array.from({ length: 9 }, (_, digit) => (
              <span key={digit} className="flex items-center justify-center">
                {viewGame.notes[index] & (1 << digit) ? digit + 1 : ""}
              </span>
            ))}
          </span>
        ) : null}
      </button>
    );
  };

  const boardPanel = (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 shadow-[var(--anslation-ds-shadow-sm)] sm:p-6">
      {showResume ? (
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-12 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--primary)]">
            <Play className="h-6 w-6" />
          </span>
          <h2 className="text-xl font-semibold">Resume your saved game?</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            {pendingResume.game.mode === "daily" ? "Daily Challenge" : "Unlimited"} ·{" "}
            {difficultyLabel(pendingResume.game.difficulty)} ·{" "}
            {formatClock(pendingResume.elapsed)} on the clock ·{" "}
            {pendingResume.game.mistakes} mistakes
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={resumeSaved}
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-5 font-semibold text-[var(--primary-foreground)]"
            >
              <Play className="h-4 w-4" />
              Resume
            </button>
            <button type="button" onClick={discardSaved} className="btn-secondary min-h-11 px-5">
              <RotateCcw className="h-4 w-4" />
              Start fresh
            </button>
          </div>
        </div>
      ) : viewGame && viewGame.status === "won" ? (
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-10 text-center" role="status">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--primary)]">
            <Trophy className="h-7 w-7" />
          </span>
          <h2 className="text-2xl font-semibold">Puzzle solved!</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            {viewGame.mode === "daily" ? "Daily Challenge" : "Unlimited"} ·{" "}
            {difficultyLabel(viewGame.difficulty)}
          </p>
          <div className="grid w-full grid-cols-3 gap-2">
            <StatTile label="Time" value={formatClock(elapsed)} />
            <StatTile label="Mistakes" value={viewGame.mistakes} />
            <StatTile label="Hints" value={viewGame.hintsUsed} />
          </div>
          {viewGame.mode === "daily" && (
            <p className="inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-4 py-2 text-sm font-semibold">
              <Flame className="h-4 w-4 text-[var(--primary)]" />
              {streaks.current} day streak · longest {streaks.longest}
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-2">
            {viewGame.mode === "daily" ? (
              <button
                type="button"
                onClick={() => switchTab("unlimited")}
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-5 font-semibold text-[var(--primary-foreground)]"
              >
                <InfinityIcon className="h-4 w-4" />
                Play Unlimited
              </button>
            ) : (
              <button
                type="button"
                onClick={() => startGame("unlimited", difficulty)}
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-5 font-semibold text-[var(--primary-foreground)]"
              >
                <Play className="h-4 w-4" />
                New game
              </button>
            )}
          </div>
        </div>
      ) : viewGame ? (
        <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
                {viewGame.mode === "daily" ? "Daily" : "Unlimited"} ·{" "}
                {difficultyLabel(viewGame.difficulty)}
              </span>
              <span className="text-xs text-[var(--muted-foreground)]">
                {viewGame.clues} clues
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-sm font-semibold ${
                  viewGame.mistakes > 0
                    ? "text-[var(--anslation-ds-danger)]"
                    : "text-[var(--muted-foreground)]"
                }`}
              >
                Mistakes {viewGame.mistakes}
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums">
                <Timer className="h-4 w-4 text-[var(--muted-foreground)]" />
                {formatClock(elapsed)}
              </span>
              <button
                type="button"
                onClick={() => setPaused((value) => !value)}
                className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                aria-label={isPaused ? "Resume game" : "Pause game"}
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[540px]">
            <div
              role="group"
              aria-label="Sudoku board"
              className={`grid aspect-square w-full grid-cols-9 grid-rows-9 overflow-hidden rounded-md border-2 border-[var(--muted-foreground)] bg-[var(--card)] ${
                isPaused ? "blur-md" : ""
              }`}
            >
              {Array.from({ length: 81 }, (_, index) => renderCell(index))}
            </div>
            {isPaused && (
              <div
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-md"
                style={{ background: "color-mix(in srgb, var(--background) 72%, transparent)" }}
              >
                <p className="text-lg font-semibold">Paused</p>
                <button
                  type="button"
                  onClick={() => setPaused(false)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-6 font-semibold text-[var(--primary-foreground)]"
                >
                  <Play className="h-4 w-4" />
                  Resume
                </button>
              </div>
            )}
          </div>

          <p aria-live="polite" className="mt-3 min-h-5 text-center text-sm text-[var(--muted-foreground)]">
            {message}
          </p>
          <p className="hidden text-center text-xs text-[var(--muted-foreground)] sm:block">
            Keyboard: arrows move · 1-9 place · 0 or Backspace erase · N toggles notes
          </p>
        </>
      ) : tab === "daily" && dailyDoneToday ? (
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-12 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--anslation-ds-success)]">
            <CheckCheck className="h-7 w-7" />
          </span>
          <h2 className="text-xl font-semibold">Today&apos;s puzzle is solved</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            {dailyRecord?.time != null
              ? `Finished in ${formatClock(dailyRecord.time)} with ${dailyRecord.mistakes ?? 0} mistakes.`
              : "Come back tomorrow for a fresh challenge."}
          </p>
          <p className="inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-4 py-2 text-sm font-semibold">
            <Flame className="h-4 w-4 text-[var(--primary)]" />
            {streaks.current} day streak · longest {streaks.longest}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => switchTab("unlimited")}
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-5 font-semibold text-[var(--primary-foreground)]"
            >
              <InfinityIcon className="h-4 w-4" />
              Play Unlimited
            </button>
            <button
              type="button"
              onClick={() => startGame("daily", "medium")}
              className="btn-secondary min-h-11 px-5"
            >
              <RotateCcw className="h-4 w-4" />
              Replay today&apos;s puzzle
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-12 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--primary)]">
            {tab === "daily" ? <CalendarDays className="h-6 w-6" /> : <InfinityIcon className="h-6 w-6" />}
          </span>
          <h2 className="text-xl font-semibold">
            {tab === "daily" ? "Start today's challenge" : "Start a new puzzle"}
          </h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            {tab === "daily"
              ? "One Medium puzzle per day — the same for every player. Keep your streak alive."
              : `Unlimited ${difficultyLabel(difficulty)} puzzles, generated fresh every game.`}
          </p>
          <button
            type="button"
            onClick={() =>
              tab === "daily" ? startGame("daily", "medium") : startGame("unlimited", difficulty)
            }
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-6 font-semibold text-[var(--primary-foreground)]"
          >
            <Play className="h-4 w-4" />
            {tab === "daily" ? "Play today's puzzle" : "New game"}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Grid3x3 className="h-4 w-4" />
            Daily puzzle game
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Sudoku</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Play a shared daily challenge or unlimited puzzles across four difficulties — with
            notes, smart highlights, hints, and streak tracking. Every puzzle has exactly one
            solution.
          </p>
        </section>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => switchTab("daily")}
            aria-pressed={tab === "daily"}
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold transition ${
              tab === "daily"
                ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
            }`}
          >
            <CalendarDays className="h-4 w-4" />
            Daily Challenge{todayLabel ? ` · ${todayLabel}` : ""}
          </button>
          <button
            type="button"
            onClick={() => switchTab("unlimited")}
            aria-pressed={tab === "unlimited"}
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold transition ${
              tab === "unlimited"
                ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
            }`}
          >
            <InfinityIcon className="h-4 w-4" />
            Unlimited
          </button>
        </div>

        {!hydrated ? (
          <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-10 text-center text-sm text-[var(--muted-foreground)] shadow-[var(--anslation-ds-shadow-sm)]">
            Setting up the board…
          </section>
        ) : (
          <section className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
            <div>{boardPanel}</div>

            <div className="grid content-start gap-6">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
                {tab === "unlimited" && (
                  <div className="mb-4">
                    <p className="mb-2 text-sm font-semibold">Difficulty</p>
                    <div className="grid grid-cols-4 gap-2">
                      {DIFFICULTIES.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setDifficulty(item.id)}
                          aria-pressed={difficulty === item.id}
                          className={`rounded-md border px-2 py-2 text-xs font-semibold transition ${
                            difficulty === item.id
                              ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                              : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => startGame("unlimited", difficulty)}
                      className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[var(--primary)] font-semibold text-[var(--primary-foreground)]"
                    >
                      <Play className="h-4 w-4" />
                      New game
                    </button>
                  </div>
                )}

                <p className="mb-2 text-sm font-semibold">Number pad</p>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                    <button
                      key={digit}
                      type="button"
                      disabled={!canInput}
                      onClick={() => {
                        if (selected == null) {
                          flash("Select a cell on the board first.");
                          return;
                        }
                        placeValue(selected, digit);
                      }}
                      className="flex min-h-12 flex-col items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] py-1.5 text-xl font-semibold transition hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span className={remaining[digit] <= 0 ? "text-[var(--muted-foreground)]" : ""}>
                        {digit}
                      </span>
                      {assists.counts && (
                        <span className="text-[10px] font-medium leading-none text-[var(--muted-foreground)]">
                          {Math.max(0, remaining[digit])}
                        </span>
                      )}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={!canInput}
                    onClick={() => {
                      if (selected == null) {
                        flash("Select a cell on the board first.");
                        return;
                      }
                      placeValue(selected, 0);
                    }}
                    aria-label="Erase cell"
                    className="flex min-h-12 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] transition hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Eraser className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNotesMode((value) => !value)}
                    disabled={!canInput}
                    aria-pressed={notesMode}
                    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                      notesMode
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <Pencil className="h-4 w-4" />
                    Notes {notesMode ? "on" : "off"}
                  </button>
                  <button
                    type="button"
                    onClick={useHint}
                    disabled={!canInput || (viewGame?.hintsUsed ?? 0) >= MAX_HINTS}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Lightbulb className="h-4 w-4" />
                    Hint ({MAX_HINTS - (viewGame?.hintsUsed ?? 0)} left)
                  </button>
                  <button
                    type="button"
                    onClick={runCheck}
                    disabled={!canInput}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <CheckCheck className="h-4 w-4" />
                    Check
                  </button>
                  <button
                    type="button"
                    onClick={restartGame}
                    disabled={!viewGame}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restart
                  </button>
                </div>

                <div className="mt-4 border-t border-[var(--border)] pt-4">
                  <p className="mb-2 text-sm font-semibold">Assists</p>
                  <div className="flex flex-wrap gap-2">
                    <AssistToggle
                      label="Highlight conflicts"
                      active={assists.conflicts}
                      onToggle={() =>
                        setAssists((prev) => ({ ...prev, conflicts: !prev.conflicts }))
                      }
                    />
                    <AssistToggle
                      label="Remaining counts"
                      active={assists.counts}
                      onToggle={() => setAssists((prev) => ({ ...prev, counts: !prev.counts }))}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
                {tab === "daily" ? (
                  <>
                    <p className="mb-3 text-sm font-semibold">Daily streak</p>
                    <div className="flex items-center gap-3 rounded-md bg-[var(--muted)] p-4">
                      <Flame className="h-8 w-8 text-[var(--primary)]" />
                      <div>
                        <p className="text-2xl font-semibold leading-none">
                          {streaks.current} {streaks.current === 1 ? "day" : "days"}
                        </p>
                        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                          Current streak
                        </p>
                      </div>
                    </div>
                    <div className="tool-compact-grid mt-3">
                      <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                        <p className="text-xs text-[var(--muted-foreground)]">Longest streak</p>
                        <p className="mt-1 font-semibold">{streaks.longest} days</p>
                      </div>
                      <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                        <p className="text-xs text-[var(--muted-foreground)]">Dailies solved</p>
                        <p className="mt-1 font-semibold">{streaks.total}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mb-3 text-sm font-semibold">Your stats</p>
                    <div className="grid gap-2">
                      {DIFFICULTIES.map((item) => {
                        const entry = stats?.[item.id];
                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                          >
                            <span className="font-semibold">{item.label}</span>
                            <span className="text-[var(--muted-foreground)]">
                              {entry?.won || 0} won · best{" "}
                              {entry?.best != null ? formatClock(entry.best) : "—"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              <details className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
                <summary className="cursor-pointer text-sm font-semibold">How to play</summary>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  <li>1. Every row must contain the digits 1-9 with no repeats.</li>
                  <li>2. Every column must contain 1-9 with no repeats.</li>
                  <li>3. Every 3×3 box must contain 1-9 with no repeats.</li>
                  <li className="rounded-md bg-[var(--muted)] p-3">
                    Tip: toggle Notes (N) to pencil in small candidate digits while you reason —
                    they clear automatically when a real number lands in the same row, column, or
                    box.
                  </li>
                </ul>
              </details>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
