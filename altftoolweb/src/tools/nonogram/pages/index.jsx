"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Paintbrush, Play, RefreshCw, Sparkles, X } from "lucide-react";
import GameShell from "@/tools/_shared/game/GameShell";
import useBestScore from "@/tools/_shared/game/useBestScore";
import NonogramBoard from "../components/NonogramBoard";
import {
  DIFFICULTIES,
  EMPTY,
  FILLED,
  MARKED,
  SIZES,
  computeClues,
  createEmptyGrid,
  formatTime,
  generateTarget,
  getColumn,
  lineRuns,
  runsEqual,
} from "../lib/nonogram";

const EMPTY_SET = new Set();

const SEGMENT_GROUP_CLASS =
  "inline-flex items-center gap-1 rounded-lg border border-border bg-muted p-1";

const segmentButtonClass = (active) =>
  `inline-flex h-11 min-w-11 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none ${
    active
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:bg-card hover:text-foreground"
  }`;

export default function ToolHome() {
  const [size, setSize] = useState(10);
  const [difficulty, setDifficulty] = useState("medium");
  const [seed, setSeed] = useState(0);

  const [puzzle, setPuzzle] = useState(null); // { target, rowClues, colClues }
  const [grid, setGrid] = useState(null);
  // ready -> playing -> paused -> won (game over) -> restart via new puzzle
  const [status, setStatus] = useState("ready");
  const [mode, setMode] = useState("fill"); // "fill" | "mark"
  const [elapsed, setElapsed] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [wrongCells, setWrongCells] = useState(EMPTY_SET);
  const [cursor, setCursor] = useState({ r: 0, c: 0 });
  const [message, setMessage] = useState(null);
  const [soundOn, setSoundOn] = useState(true);
  const [newBest, setNewBest] = useState(false);

  // One hook per board size (fixed keys, platform pattern): a dynamic key
  // would leave the previous size's best on screen when the new size has no
  // stored value, and submit() would then compare against the wrong baseline.
  const [best5, submitBest5] = useBestScore("nonogram-5x5", { lowerIsBetter: true });
  const [best10, submitBest10] = useBestScore("nonogram-10x10", { lowerIsBetter: true });
  const [best15, submitBest15] = useBestScore("nonogram-15x15", { lowerIsBetter: true });
  const best = size === 5 ? best5 : size === 15 ? best15 : best10;
  const submitBest = size === 5 ? submitBest5 : size === 15 ? submitBest15 : submitBest10;

  const strokeRef = useRef(null);
  const gridRef = useRef(null);
  const cursorRef = useRef(cursor);
  const soundOnRef = useRef(soundOn);
  const audioRef = useRef(null);
  const wrongTimerRef = useRef(null);
  const messageTimerRef = useRef(null);

  useEffect(() => {
    cursorRef.current = cursor;
  }, [cursor]);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);

  /* ---------- audio (Web Audio only, lazy on first gesture) ---------- */

  const playTone = useCallback((freq, duration = 0.08, type = "sine", volume = 0.05, delay = 0) => {
    if (!soundOnRef.current) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioRef.current) audioRef.current = new Ctx();
      const ctx = audioRef.current;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      const t = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(volume, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + duration + 0.02);
    } catch {
      // Audio is decorative; never break gameplay over it.
    }
  }, []);

  const playPaint = useCallback(
    (value) => {
      if (value === FILLED) playTone(620, 0.06, "triangle");
      else if (value === MARKED) playTone(380, 0.06, "triangle");
      else playTone(280, 0.05, "sine", 0.035);
    },
    [playTone],
  );

  const playError = useCallback(() => playTone(170, 0.22, "sawtooth", 0.045), [playTone]);
  const playGood = useCallback(() => {
    playTone(660, 0.09, "triangle");
    playTone(880, 0.12, "triangle", 0.05, 0.09);
  }, [playTone]);
  const playWin = useCallback(() => {
    playTone(523, 0.14, "triangle", 0.06, 0);
    playTone(659, 0.14, "triangle", 0.06, 0.12);
    playTone(784, 0.2, "triangle", 0.06, 0.24);
    playTone(1047, 0.3, "triangle", 0.05, 0.38);
  }, [playTone]);

  /* ---------- puzzle lifecycle ---------- */

  useEffect(() => {
    const density =
      DIFFICULTIES.find((d) => d.id === difficulty)?.density ?? 0.55;
    const target = generateTarget(size, density);
    const clues = computeClues(target);
    setPuzzle({ target, rowClues: clues.rows, colClues: clues.cols });
    setGrid(createEmptyGrid(size));
    setStatus("ready");
    setElapsed(0);
    setMistakes(0);
    setWrongCells(EMPTY_SET);
    setCursor({ r: 0, c: 0 });
    setMessage(null);
    setNewBest(false);
    strokeRef.current = null;
  }, [size, difficulty, seed]);

  const newPuzzle = useCallback(() => setSeed((s) => s + 1), []);

  const startGame = useCallback(() => {
    setStatus((s) => (s === "ready" ? "playing" : s));
    playTone(520, 0.08, "triangle");
  }, [playTone]);

  const togglePause = useCallback(() => {
    setStatus((s) => (s === "playing" ? "paused" : s === "paused" ? "playing" : s));
  }, []);

  /* ---------- timer ---------- */

  useEffect(() => {
    if (status !== "playing") return undefined;
    const id = window.setInterval(() => setElapsed((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [status]);

  /* ---------- clue satisfaction + win detection ---------- */

  const rowSat = useMemo(() => {
    if (!puzzle || !grid) return [];
    return puzzle.rowClues.map((clue, r) => runsEqual(lineRuns(grid[r]), clue));
  }, [puzzle, grid]);

  const colSat = useMemo(() => {
    if (!puzzle || !grid) return [];
    return puzzle.colClues.map((clue, c) =>
      runsEqual(lineRuns(getColumn(grid, c)), clue),
    );
  }, [puzzle, grid]);

  const solved =
    rowSat.length > 0 &&
    rowSat.every(Boolean) &&
    colSat.length > 0 &&
    colSat.every(Boolean);

  useEffect(() => {
    if (status !== "playing" || !solved) return;
    setStatus("won");
    setWrongCells(EMPTY_SET);
    setNewBest(best === null || elapsed < best);
    submitBest(elapsed);
    playWin();
  }, [solved, status, elapsed, best, submitBest, playWin]);

  /* ---------- painting ---------- */

  const clearFeedback = useCallback(() => {
    setWrongCells((current) => (current.size ? EMPTY_SET : current));
    setMessage(null);
  }, []);

  const paintCell = useCallback((r, c) => {
    const stroke = strokeRef.current;
    if (!stroke) return;
    setGrid((g) => {
      if (!g || g[r]?.[c] === undefined || g[r][c] !== stroke.from) return g;
      const next = g.map((row) => row.slice());
      next[r][c] = stroke.to;
      return next;
    });
  }, []);

  const handleStrokeStart = useCallback(
    (r, c, { alt = false } = {}) => {
      if (status !== "playing" || !grid) return;
      const useMark = alt || mode === "mark";
      const current = grid[r][c];
      const to = useMark
        ? current === MARKED
          ? EMPTY
          : MARKED
        : current === FILLED
          ? EMPTY
          : FILLED;
      strokeRef.current = { from: current, to };
      clearFeedback();
      setCursor({ r, c });
      paintCell(r, c);
      playPaint(to);
    },
    [status, grid, mode, clearFeedback, paintCell, playPaint],
  );

  const handleStrokeMove = useCallback(
    (r, c) => {
      if (status !== "playing") return;
      paintCell(r, c);
    },
    [status, paintCell],
  );

  const handleStrokeEnd = useCallback(() => {
    strokeRef.current = null;
  }, []);

  /* ---------- keyboard ---------- */

  const toggleAt = useCallback(
    (r, c, useMark) => {
      const g = gridRef.current;
      if (!g || g[r]?.[c] === undefined) return;
      const current = g[r][c];
      const to = useMark
        ? current === MARKED
          ? EMPTY
          : MARKED
        : current === FILLED
          ? EMPTY
          : FILLED;
      setGrid((prev) => {
        if (!prev || prev[r]?.[c] === undefined) return prev;
        const next = prev.map((row) => row.slice());
        next[r][c] = to;
        return next;
      });
      clearFeedback();
      playPaint(to);
    },
    [clearFeedback, playPaint],
  );

  useEffect(() => {
    if (status !== "playing") return undefined;
    const onKeyDown = (event) => {
      if (event.target?.closest?.("button, input, select, textarea, a")) return;
      const key = event.key;
      const move = (dr, dc) =>
        setCursor((cur) => ({
          r: Math.min(size - 1, Math.max(0, cur.r + dr)),
          c: Math.min(size - 1, Math.max(0, cur.c + dc)),
        }));

      if (key === "ArrowUp" || key === "w" || key === "W") move(-1, 0);
      else if (key === "ArrowDown" || key === "s" || key === "S") move(1, 0);
      else if (key === "ArrowLeft" || key === "a" || key === "A") move(0, -1);
      else if (key === "ArrowRight" || key === "d" || key === "D") move(0, 1);
      else if (key === " " || key === "Enter" || key === "f" || key === "F") {
        const { r, c } = cursorRef.current;
        toggleAt(r, c, false);
      } else if (key === "x" || key === "X") {
        const { r, c } = cursorRef.current;
        toggleAt(r, c, true);
      } else if (key === "m" || key === "M") {
        setMode((m) => (m === "fill" ? "mark" : "fill"));
      } else {
        return;
      }
      event.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [status, size, toggleAt]);

  /* ---------- check button ---------- */

  const showMessage = useCallback((text) => {
    setMessage(text);
    if (messageTimerRef.current) window.clearTimeout(messageTimerRef.current);
    messageTimerRef.current = window.setTimeout(() => setMessage(null), 3000);
  }, []);

  const handleCheck = useCallback(() => {
    if (status !== "playing" || !puzzle || !grid) return;
    const bad = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] === FILLED && !puzzle.target[r][c]) bad.push(`${r}:${c}`);
      }
    }
    if (bad.length > 0) {
      setWrongCells(new Set(bad));
      setMistakes((m) => m + bad.length);
      showMessage(
        `${bad.length} filled ${bad.length === 1 ? "square doesn't" : "squares don't"} belong to the hidden picture.`,
      );
      playError();
      if (wrongTimerRef.current) window.clearTimeout(wrongTimerRef.current);
      wrongTimerRef.current = window.setTimeout(
        () => setWrongCells(EMPTY_SET),
        2500,
      );
    } else {
      showMessage("No wrong fills so far — keep going!");
      playGood();
    }
  }, [status, puzzle, grid, size, showMessage, playError, playGood]);

  /* ---------- cleanup ---------- */

  useEffect(
    () => () => {
      if (wrongTimerRef.current) window.clearTimeout(wrongTimerRef.current);
      if (messageTimerRef.current) window.clearTimeout(messageTimerRef.current);
      audioRef.current?.close?.().catch?.(() => {});
    },
    [],
  );

  /* ---------- render ---------- */

  const difficultyLabel =
    DIFFICULTIES.find((d) => d.id === difficulty)?.label ?? "Medium";

  const overlayClass =
    "absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-md bg-card/95 p-4 text-center";
  const primaryButtonClass =
    "inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none";

  return (
    <main className="mx-auto w-full max-w-4xl px-3 py-6 sm:px-4">
      <GameShell
        title="Nonogram Puzzle"
        stats={[
          { label: "Time", value: formatTime(elapsed) },
          { label: "Best", value: best === null ? "—" : formatTime(best) },
          { label: "Mistakes", value: mistakes },
        ]}
        onRestart={newPuzzle}
        paused={status === "paused"}
        onTogglePause={
          status === "playing" || status === "paused" ? togglePause : undefined
        }
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((v) => !v)}
        help="Fill squares so every row and column matches its clues: the numbers are the lengths of filled runs, in order, with at least one empty square between runs. Drag to paint several squares; switch to Mark mode (or right-click) to note squares that must stay empty. Satisfied clues dim automatically, and any grid that satisfies every clue wins. Check compares your fills with the hidden picture and counts mistakes. Keyboard: arrows/WASD move, Space or F fills, X marks, M switches mode."
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className={SEGMENT_GROUP_CLASS} role="group" aria-label="Board size">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={segmentButtonClass(size === s)}
                  aria-pressed={size === s}
                >
                  {s}×{s}
                </button>
              ))}
            </div>
            <div className={SEGMENT_GROUP_CLASS} role="group" aria-label="Difficulty">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDifficulty(d.id)}
                  className={segmentButtonClass(difficulty === d.id)}
                  aria-pressed={difficulty === d.id}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              className={`${SEGMENT_GROUP_CLASS} flex-1 sm:flex-none`}
              role="group"
              aria-label="Paint mode"
            >
              <button
                type="button"
                onClick={() => setMode("fill")}
                className={`${segmentButtonClass(mode === "fill")} flex-1 gap-1.5 sm:flex-none`}
                aria-pressed={mode === "fill"}
              >
                <Paintbrush className="h-4 w-4" aria-hidden="true" />
                Fill
              </button>
              <button
                type="button"
                onClick={() => setMode("mark")}
                className={`${segmentButtonClass(mode === "mark")} flex-1 gap-1.5 sm:flex-none`}
                aria-pressed={mode === "mark"}
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Mark
              </button>
            </div>
            <button
              type="button"
              onClick={handleCheck}
              disabled={status !== "playing"}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              Check
            </button>
          </div>

          <div className="relative">
            {puzzle && grid ? (
              <NonogramBoard
                size={size}
                grid={grid}
                rowClues={puzzle.rowClues}
                colClues={puzzle.colClues}
                rowSat={rowSat}
                colSat={colSat}
                wrongCells={wrongCells}
                cursor={cursor}
                showCursor={status === "playing"}
                disabled={status !== "playing"}
                onStrokeStart={handleStrokeStart}
                onStrokeMove={handleStrokeMove}
                onStrokeEnd={handleStrokeEnd}
              />
            ) : (
              <div className="mx-auto aspect-square w-full max-w-[460px] animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
            )}

            {status === "ready" && puzzle ? (
              <div className={overlayClass}>
                <h3 className="text-lg font-semibold text-foreground">
                  Ready to solve?
                </h3>
                <p className="text-sm text-muted-foreground">
                  {size}×{size} · {difficultyLabel} — a hidden picture awaits.
                </p>
                <button type="button" onClick={startGame} className={primaryButtonClass}>
                  <Play className="h-4 w-4" aria-hidden="true" />
                  Start
                </button>
              </div>
            ) : null}

            {status === "paused" ? (
              <div className={overlayClass}>
                <h3 className="text-lg font-semibold text-foreground">Paused</h3>
                <p className="text-sm text-muted-foreground">
                  The board is hidden while paused.
                </p>
                <button type="button" onClick={togglePause} className={primaryButtonClass}>
                  <Play className="h-4 w-4" aria-hidden="true" />
                  Resume
                </button>
              </div>
            ) : null}

            {status === "won" ? (
              <div className={overlayClass}>
                <Sparkles
                  className="h-8 w-8 text-primary motion-safe:animate-pulse"
                  aria-hidden="true"
                />
                <h3 className="text-lg font-semibold text-foreground">
                  Puzzle solved!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Time {formatTime(elapsed)}
                  {mistakes > 0 ? ` · ${mistakes} mistakes` : " · no mistakes"}
                  {newBest ? " · new best time!" : ""}
                </p>
                <button type="button" onClick={newPuzzle} className={primaryButtonClass}>
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  New puzzle
                </button>
              </div>
            ) : null}
          </div>

          <p
            role="status"
            aria-live="polite"
            className="min-h-4 text-center text-xs text-muted-foreground"
          >
            {message}
          </p>
        </div>
      </GameShell>
    </main>
  );
}
