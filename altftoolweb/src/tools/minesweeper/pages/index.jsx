"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Flag, Play } from "lucide-react";
import GameShell from "@/tools/_shared/game/GameShell";
import useBestScore from "@/tools/_shared/game/useBestScore";
import Board from "../components/Board";
import useSounds from "../lib/useSounds";
import {
  DIFFICULTIES,
  DIFFICULTY_ORDER,
  countFlags,
  createBoard,
  finalizeLoss,
  flagAllMines,
  forEachNeighbor,
  isWin,
  placeMines,
  revealCells,
  toggleFlagAt,
} from "../lib/board";

const pad3 = (n) => String(Math.max(0, Math.min(999, n))).padStart(3, "0");

const PILL_BUTTON =
  "inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-md border px-3 text-sm font-medium transition duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 motion-reduce:transition-none";
const PILL_ACTIVE = "border-transparent bg-primary text-primary-foreground";
const PILL_IDLE =
  "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground";
const PRIMARY_BUTTON =
  "inline-flex h-11 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition duration-150 hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 motion-reduce:transition-none";

export default function MinesweeperGame() {
  const [difficulty, setDifficulty] = useState("beginner");
  const cfg = DIFFICULTIES[difficulty];

  const [board, setBoard] = useState(() => createBoard(9, 9));
  // Status machine: ready -> playing (+ paused) -> won | lost -> ready.
  const [status, setStatus] = useState("ready");
  const [paused, setPaused] = useState(false);
  const [time, setTime] = useState(0);
  const [exploded, setExploded] = useState(null);
  const [flagMode, setFlagMode] = useState(false);
  const [cursor, setCursor] = useState([0, 0]);
  const [showCursor, setShowCursor] = useState(false);
  const [newBest, setNewBest] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const sounds = useSounds(soundOn);

  const [bestBeginner, submitBeginner] = useBestScore("minesweeper-beginner", {
    lowerIsBetter: true,
  });
  const [bestIntermediate, submitIntermediate] = useBestScore(
    "minesweeper-intermediate",
    { lowerIsBetter: true },
  );
  const [bestExpert, submitExpert] = useBestScore("minesweeper-expert", {
    lowerIsBetter: true,
  });
  const bestByDifficulty = {
    beginner: [bestBeginner, submitBeginner],
    intermediate: [bestIntermediate, submitIntermediate],
    expert: [bestExpert, submitExpert],
  };
  const [best, submitBest] = bestByDifficulty[difficulty];

  const minesLeft = useMemo(
    () => cfg.mines - countFlags(board),
    [board, cfg.mines],
  );

  // Timer: starts on the first reveal (ready -> playing), pauses with the game.
  useEffect(() => {
    if (status !== "playing" || paused) return undefined;
    const id = setInterval(() => {
      setTime((t) => Math.min(t + 1, 999));
    }, 1000);
    return () => clearInterval(id);
  }, [status, paused]);

  const reset = (key = difficulty) => {
    const d = DIFFICULTIES[key];
    setBoard(createBoard(d.rows, d.cols));
    setStatus("ready");
    setPaused(false);
    setTime(0);
    setExploded(null);
    setNewBest(false);
    setCursor([0, 0]);
  };

  const selectDifficulty = (key) => {
    if (key === difficulty) return;
    setDifficulty(key);
    reset(key);
  };

  const finishReveal = (nextBoard, hit, explodedKey, revealedCount) => {
    if (hit) {
      setBoard(finalizeLoss(nextBoard));
      setExploded(explodedKey);
      setStatus("lost");
      sounds.boom();
      return;
    }
    if (isWin(nextBoard, cfg.mines)) {
      setBoard(flagAllMines(nextBoard));
      setStatus("won");
      setNewBest(best === null || time < best);
      submitBest(time);
      sounds.win();
      return;
    }
    setBoard(nextBoard);
    if (revealedCount > 0) sounds.reveal();
  };

  const handleSecondary = (r, c) => {
    if (status === "won" || status === "lost" || paused) return;
    const cell = board[r][c];
    if (cell.revealed) return;
    setBoard(toggleFlagAt(board, r, c));
    if (cell.flagged) sounds.unflag();
    else sounds.flag();
  };

  const handlePrimary = (r, c) => {
    if (status === "won" || status === "lost" || paused) return;
    const cell = board[r][c];

    if (flagMode && !cell.revealed) {
      handleSecondary(r, c);
      return;
    }
    if (cell.flagged) return;

    if (cell.revealed) {
      // Chord: a satisfied number clears its unflagged neighbors.
      if (cell.adjacent === 0) return;
      let flags = 0;
      const targets = [];
      forEachNeighbor(cfg.rows, cfg.cols, r, c, (nr, nc) => {
        const ncell = board[nr][nc];
        if (ncell.flagged) flags += 1;
        else if (!ncell.revealed) targets.push([nr, nc]);
      });
      if (flags !== cell.adjacent || targets.length === 0) return;
      const result = revealCells(board, targets);
      finishReveal(result.board, result.hitMine, result.exploded, result.revealedCount);
      return;
    }

    let base = board;
    if (status === "ready") {
      // Mines are placed on the first reveal, never under it.
      base = placeMines(base, cfg.mines, r, c);
      setStatus("playing");
      setTime(0);
    }
    const result = revealCells(base, [[r, c]]);
    finishReveal(result.board, result.hitMine, result.exploded, result.revealedCount);
  };

  // Keyboard: window listener with a stable identity, latest logic via ref.
  const boardWrapRef = useRef(null);
  const keyHandlerRef = useRef(null);
  const handleKeyDown = (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const target = e.target;
    const tag = target?.tagName;
    if (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      tag === "SELECT" ||
      target?.isContentEditable
    ) {
      return;
    }
    // Buttons/links outside the board keep native Space/Enter activation;
    // inside the board (cells get focus after a click) game keys still apply.
    if (
      (tag === "BUTTON" || tag === "A") &&
      !boardWrapRef.current?.contains(target)
    ) {
      return;
    }

    const move = (dr, dc) => {
      setShowCursor(true);
      setCursor(([r, c]) => [
        Math.max(0, Math.min(cfg.rows - 1, r + dr)),
        Math.max(0, Math.min(cfg.cols - 1, c + dc)),
      ]);
    };

    let handled = true;
    switch (e.key) {
      case "ArrowUp":
      case "w":
      case "W":
        move(-1, 0);
        break;
      case "ArrowDown":
      case "s":
      case "S":
        move(1, 0);
        break;
      case "ArrowLeft":
      case "a":
      case "A":
        move(0, -1);
        break;
      case "ArrowRight":
      case "d":
      case "D":
        move(0, 1);
        break;
      case " ":
      case "Enter":
        setShowCursor(true);
        handlePrimary(cursor[0], cursor[1]);
        break;
      case "f":
      case "F":
        setShowCursor(true);
        handleSecondary(cursor[0], cursor[1]);
        break;
      case "p":
      case "P":
        if (status === "playing") setPaused((p) => !p);
        break;
      default:
        handled = false;
    }
    if (handled) e.preventDefault();
  };
  useEffect(() => {
    keyHandlerRef.current = handleKeyDown;
  });

  useEffect(() => {
    const onKeyDown = (e) => keyHandlerRef.current?.(e);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const announcement =
    status === "won"
      ? `You won in ${time} seconds${newBest ? ", a new best time" : ""}.`
      : status === "lost"
        ? "You hit a mine. Game over."
        : "";

  const pauseOverlay =
    status === "playing" && paused ? (
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg bg-card/95 backdrop-blur-sm motion-safe:animate-[altft-menu-in_200ms_ease-out]">
        <p className="text-sm font-semibold text-foreground">Paused</p>
        <button
          type="button"
          onClick={() => setPaused(false)}
          className={PRIMARY_BUTTON}
        >
          <Play className="h-4 w-4" aria-hidden="true" />
          Resume
        </button>
      </div>
    ) : null;

  return (
    <GameShell
      title="Minesweeper"
      stats={[
        { label: "Mines", value: String(minesLeft) },
        { label: "Time", value: pad3(time) },
        { label: "Best", value: best !== null ? `${best}s` : "—" },
      ]}
      onRestart={() => reset()}
      paused={paused}
      onTogglePause={
        status === "playing" ? () => setPaused((p) => !p) : undefined
      }
      soundOn={soundOn}
      onToggleSound={() => setSoundOn((s) => !s)}
      help="Reveal every safe tile without hitting a mine. Tap to reveal; long-press, right-click, or switch on flag mode to plant flags. Numbers count the mines touching that tile — tap a satisfied number to clear its remaining neighbors. Keyboard: arrows or WASD move, Space or Enter reveals, F flags, P pauses."
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div
            role="group"
            aria-label="Difficulty"
            className="flex flex-wrap gap-1.5"
          >
            {DIFFICULTY_ORDER.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => selectDifficulty(key)}
                aria-pressed={difficulty === key}
                className={`${PILL_BUTTON} ${
                  difficulty === key ? PILL_ACTIVE : PILL_IDLE
                }`}
              >
                {DIFFICULTIES[key].label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setFlagMode((f) => !f)}
            aria-pressed={flagMode}
            className={`${PILL_BUTTON} ${flagMode ? PILL_ACTIVE : PILL_IDLE}`}
          >
            <Flag className="h-4 w-4" aria-hidden="true" />
            Flag mode
          </button>
        </div>

        {(status === "won" || status === "lost") && (
          <div
            role="status"
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2 ring-1 ring-[var(--border)] motion-safe:animate-[altft-menu-in_200ms_ease-out]"
          >
            <p className="text-sm font-medium text-foreground">
              {status === "won" ? (
                <>
                  <span
                    className="mr-1.5 inline-block animate-bounce motion-reduce:animate-none"
                    aria-hidden="true"
                  >
                    {"\u{1F389}"}
                  </span>
                  Board cleared in {time}s!
                  {newBest ? " New best time!" : ""}
                </>
              ) : (
                <>
                  <span className="mr-1.5" aria-hidden="true">
                    {"\u{1F4A5}"}
                  </span>
                  Boom — you hit a mine.
                </>
              )}
            </p>
            <button
              type="button"
              onClick={() => reset()}
              className={PRIMARY_BUTTON}
            >
              Play again
            </button>
          </div>
        )}

        <div ref={boardWrapRef}>
          <Board
            board={board}
            config={cfg}
            exploded={exploded}
            cursor={cursor}
            showCursor={showCursor}
            onPrimary={handlePrimary}
            onSecondary={handleSecondary}
            overlay={pauseOverlay}
          />
        </div>

        {status === "ready" && (
          <p className="text-center text-xs text-muted-foreground">
            Tap any tile to start — your first tap is always safe.
          </p>
        )}

        <span className="sr-only" role="status" aria-live="polite">
          {announcement}
        </span>
      </div>
    </GameShell>
  );
}
