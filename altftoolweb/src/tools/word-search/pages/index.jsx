"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play, RotateCcw, Settings2, Trophy } from "lucide-react";
import GameShell from "@/tools/_shared/game/GameShell";
import useBestScore from "@/tools/_shared/game/useBestScore";
import THEMES, { THEME_KEYS } from "../lib/words";
import { alignedPath, generatePuzzle, keyOf, snappedPath } from "../lib/generator";
import createSoundEngine from "../lib/sound";
import Board from "../components/Board";
import WordList from "../components/WordList";

const SIZES = [
  { size: 8, label: "8 × 8", wordCount: 6 },
  { size: 12, label: "12 × 12", wordCount: 10 },
  { size: 15, label: "15 × 15", wordCount: 14 },
];

const KEY_MOVES = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
};

const PRIMARY_BUTTON_CLASS =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

const SECONDARY_BUTTON_CLASS =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

function formatTime(ms) {
  if (ms === null || ms === undefined || !Number.isFinite(ms)) return "—";
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function ToolHome() {
  // ready -> playing -> (paused) -> won -> restart
  const [status, setStatus] = useState("ready");
  const [paused, setPaused] = useState(false);
  const [themeKey, setThemeKey] = useState(THEME_KEYS[0]);
  const [gridSize, setGridSize] = useState(12);
  const [puzzle, setPuzzle] = useState(null);
  const [foundMap, setFoundMap] = useState(() => new Map()); // word -> color index
  const [foundCells, setFoundCells] = useState(() => new Map()); // "r-c" -> color index
  const [selection, setSelection] = useState([]); // live drag / keyboard path
  const [invalidKeys, setInvalidKeys] = useState(null); // brief "wrong guess" flash
  const [cursor, setCursor] = useState(null); // keyboard cursor cell
  const [anchor, setAnchor] = useState(null); // keyboard selection start cell
  const [elapsedMs, setElapsedMs] = useState(0);
  const [finalMs, setFinalMs] = useState(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [lastFoundWord, setLastFoundWord] = useState("");

  const dragStartRef = useRef(null);
  const selectionRef = useRef([]);
  const invalidTimeoutRef = useRef(null);
  const soundRef = useRef(null);
  const startTimeRef = useRef(0);
  const pausedAccumRef = useRef(0);
  const pauseStartRef = useRef(0);

  const [best8, submitBest8] = useBestScore("word-search-8x8", { lowerIsBetter: true });
  const [best12, submitBest12] = useBestScore("word-search-12x12", { lowerIsBetter: true });
  const [best15, submitBest15] = useBestScore("word-search-15x15", { lowerIsBetter: true });
  const bestForSize = gridSize === 8 ? best8 : gridSize === 12 ? best12 : best15;
  const submitBestForSize = gridSize === 8 ? submitBest8 : gridSize === 12 ? submitBest12 : submitBest15;

  const sizeConf = SIZES.find((entry) => entry.size === gridSize) ?? SIZES[1];

  const playSfx = useCallback(
    (name) => {
      if (!soundOn) return;
      if (!soundRef.current) soundRef.current = createSoundEngine();
      soundRef.current[name]?.();
    },
    [soundOn],
  );

  // Dispose the audio context and any pending invalid-flash timeout on unmount.
  useEffect(
    () => () => {
      soundRef.current?.dispose();
      if (invalidTimeoutRef.current) clearTimeout(invalidTimeoutRef.current);
    },
    [],
  );

  // Timer: tick only while actively playing.
  useEffect(() => {
    if (status !== "playing" || paused) return undefined;
    const id = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current - pausedAccumRef.current);
    }, 500);
    return () => clearInterval(id);
  }, [status, paused]);

  const updateSelection = useCallback((cells) => {
    selectionRef.current = cells;
    setSelection(cells);
  }, []);

  const startGame = useCallback(() => {
    const next = generatePuzzle(THEMES[themeKey].words, gridSize, sizeConf.wordCount);
    setPuzzle(next);
    setFoundMap(new Map());
    setFoundCells(new Map());
    setInvalidKeys(null);
    setCursor(null);
    setAnchor(null);
    setLastFoundWord("");
    setIsNewBest(false);
    setFinalMs(null);
    dragStartRef.current = null;
    updateSelection([]);
    startTimeRef.current = Date.now();
    pausedAccumRef.current = 0;
    setElapsedMs(0);
    setPaused(false);
    setStatus("playing");
    playSfx("start");
  }, [themeKey, gridSize, sizeConf.wordCount, updateSelection, playSfx]);

  const togglePause = useCallback(() => {
    if (status !== "playing") return;
    if (!paused) {
      pauseStartRef.current = Date.now();
      dragStartRef.current = null;
      updateSelection([]);
      setAnchor(null);
      setPaused(true);
    } else {
      pausedAccumRef.current += Date.now() - pauseStartRef.current;
      setElapsedMs(Date.now() - startTimeRef.current - pausedAccumRef.current);
      setPaused(false);
    }
  }, [status, paused, updateSelection]);

  const commitSelection = useCallback(
    (cells) => {
      if (!puzzle || status !== "playing" || cells.length < 2) return;
      const letters = cells.map(({ r, c }) => puzzle.grid[r][c]).join("");
      const reversed = [...letters].reverse().join("");
      const match = puzzle.words.find(
        ({ word }) => !foundMap.has(word) && (word === letters || word === reversed),
      );

      if (!match) {
        playSfx("miss");
        setInvalidKeys(new Set(cells.map(({ r, c }) => keyOf(r, c))));
        if (invalidTimeoutRef.current) clearTimeout(invalidTimeoutRef.current);
        invalidTimeoutRef.current = setTimeout(() => setInvalidKeys(null), 450);
        return;
      }

      const colorIndex = foundMap.size;
      const nextFoundMap = new Map(foundMap);
      nextFoundMap.set(match.word, colorIndex);
      const nextFoundCells = new Map(foundCells);
      cells.forEach(({ r, c }) => nextFoundCells.set(keyOf(r, c), colorIndex));
      setFoundMap(nextFoundMap);
      setFoundCells(nextFoundCells);
      setLastFoundWord(match.word);

      if (nextFoundMap.size === puzzle.words.length) {
        const total = Date.now() - startTimeRef.current - pausedAccumRef.current;
        setFinalMs(total);
        setElapsedMs(total);
        setIsNewBest(bestForSize === null || total < bestForSize);
        submitBestForSize(total);
        setStatus("won");
        playSfx("win");
      } else {
        playSfx("found");
      }
    },
    [puzzle, status, foundMap, foundCells, bestForSize, submitBestForSize, playSfx],
  );

  // Pointer-drag selection (mouse + touch via pointer events).
  const handleSelectStart = useCallback(
    (cell) => {
      if (status !== "playing" || paused) return;
      dragStartRef.current = cell;
      setAnchor(null);
      setCursor(cell);
      updateSelection([cell]);
    },
    [status, paused, updateSelection],
  );

  const handleSelectMove = useCallback(
    (cell) => {
      const start = dragStartRef.current;
      if (!start) return;
      setCursor(cell);
      updateSelection(snappedPath(start, cell, gridSize));
    },
    [gridSize, updateSelection],
  );

  const handleSelectEnd = useCallback(() => {
    if (!dragStartRef.current) return;
    dragStartRef.current = null;
    commitSelection(selectionRef.current);
    updateSelection([]);
  }, [commitSelection, updateSelection]);

  // Keyboard selection: arrows move a cursor, Enter/Space anchors then commits,
  // Escape cancels, P pauses.
  useEffect(() => {
    if (status !== "playing") return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "p" || event.key === "P") {
        event.preventDefault();
        togglePause();
        return;
      }
      if (paused) return;

      const move = KEY_MOVES[event.key];
      if (move) {
        event.preventDefault();
        const base = cursor ?? { r: 0, c: 0 };
        const next = {
          r: Math.min(gridSize - 1, Math.max(0, base.r + move[0])),
          c: Math.min(gridSize - 1, Math.max(0, base.c + move[1])),
        };
        setCursor(next);
        if (anchor) updateSelection(alignedPath(anchor, next, gridSize) ?? [anchor]);
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (!cursor) {
          setCursor({ r: 0, c: 0 });
          return;
        }
        if (!anchor) {
          setAnchor(cursor);
          updateSelection([cursor]);
          return;
        }
        const path = alignedPath(anchor, cursor, gridSize);
        setAnchor(null);
        if (path && path.length > 1) commitSelection(path);
        updateSelection([]);
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setAnchor(null);
        updateSelection([]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, paused, cursor, anchor, gridSize, togglePause, commitSelection, updateSelection]);

  const selectedKeys = useMemo(
    () => new Set(selection.map(({ r, c }) => keyOf(r, c))),
    [selection],
  );

  const totalWords = puzzle ? puzzle.words.length : sizeConf.wordCount;
  const stats = [
    { label: "Time", value: formatTime(status === "won" ? finalMs : elapsedMs) },
    { label: "Found", value: `${foundMap.size}/${totalWords}` },
    { label: "Best", value: formatTime(bestForSize) },
  ];

  return (
    <GameShell
      title="Word Search"
      stats={stats}
      onRestart={status !== "ready" ? startGame : undefined}
      paused={paused}
      onTogglePause={status === "playing" ? togglePause : undefined}
      soundOn={soundOn}
      onToggleSound={() => setSoundOn((prev) => !prev)}
      help="Drag across letters (mouse or touch) to select a word — forwards or backwards, in any of 8 directions. Keyboard: arrows move the cursor, Enter or Space anchors the first letter and confirms the last, Escape cancels, P pauses."
    >
      <p aria-live="polite" className="sr-only">
        {status === "won"
          ? `Puzzle solved in ${formatTime(finalMs)}`
          : lastFoundWord
            ? `Found ${lastFoundWord}`
            : ""}
      </p>

      {status === "ready" ? (
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/40 p-4 sm:p-6">
          <div role="group" aria-label="Word theme" className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">Theme</p>
            <div className="grid grid-cols-2 gap-2">
              {THEME_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setThemeKey(key)}
                  aria-pressed={themeKey === key}
                  className={`min-h-11 rounded-md border px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    themeKey === key
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {THEMES[key].label}
                </button>
              ))}
            </div>
          </div>

          <div role="group" aria-label="Grid size" className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">Grid size</p>
            <div className="grid grid-cols-3 gap-2">
              {SIZES.map((entry) => (
                <button
                  key={entry.size}
                  type="button"
                  onClick={() => setGridSize(entry.size)}
                  aria-pressed={gridSize === entry.size}
                  className={`flex min-h-11 flex-col items-center justify-center rounded-md border px-2 py-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    gridSize === entry.size
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span className="text-sm font-semibold">{entry.label}</span>
                  <span className="text-xs opacity-80">{entry.wordCount} words</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 pt-1">
            <button type="button" onClick={startGame} className={PRIMARY_BUTTON_CLASS}>
              <Play className="h-4 w-4" aria-hidden="true" />
              Start puzzle
            </button>
            <p className="text-xs text-muted-foreground">
              {bestForSize !== null
                ? `Best time for ${sizeConf.label}: ${formatTime(bestForSize)}`
                : `No best time for ${sizeConf.label} yet — set one!`}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Board
              grid={puzzle.grid}
              size={gridSize}
              foundCells={foundCells}
              selectedKeys={selectedKeys}
              invalidKeys={invalidKeys}
              cursorKey={cursor && status === "playing" && !paused ? keyOf(cursor.r, cursor.c) : null}
              anchorKey={anchor ? keyOf(anchor.r, anchor.c) : null}
              disabled={status !== "playing" || paused}
              onSelectStart={handleSelectStart}
              onSelectMove={handleSelectMove}
              onSelectEnd={handleSelectEnd}
            />

            {paused ? (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg bg-card">
                <p className="text-lg font-semibold text-foreground">Paused</p>
                <p className="text-sm text-muted-foreground">The letters are hidden while you rest.</p>
                <button type="button" onClick={togglePause} className={PRIMARY_BUTTON_CLASS}>
                  <Play className="h-4 w-4" aria-hidden="true" />
                  Resume
                </button>
              </div>
            ) : null}
          </div>

          {status === "won" ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-muted/40 p-4 text-center">
              <Trophy className="h-7 w-7 text-primary" aria-hidden="true" />
              <p className="text-base font-semibold text-foreground">
                Puzzle solved in {formatTime(finalMs)}!
              </p>
              {isNewBest ? (
                <p className="text-sm font-medium text-primary">
                  New best time for {sizeConf.label}!
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Best for {sizeConf.label}: {formatTime(bestForSize)}
                </p>
              )}
              <div className="mt-1 flex flex-wrap justify-center gap-2">
                <button type="button" onClick={startGame} className={PRIMARY_BUTTON_CLASS}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Play again
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("ready")}
                  className={SECONDARY_BUTTON_CLASS}
                >
                  <Settings2 className="h-4 w-4" aria-hidden="true" />
                  Theme &amp; size
                </button>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              {THEMES[themeKey].label} · find {totalWords} words
            </p>
            <WordList words={puzzle.words} foundMap={foundMap} />
          </div>
        </div>
      )}
    </GameShell>
  );
}
