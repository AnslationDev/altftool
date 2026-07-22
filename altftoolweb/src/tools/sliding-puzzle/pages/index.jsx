"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play, RotateCcw, Trophy } from "lucide-react";
import GameShell from "@/tools/_shared/game/GameShell";
import useBestScore from "@/tools/_shared/game/useBestScore";
import Board from "./components/Board";
import { createSolvedBoard, isSolved, moveBlank, shuffleBoard, slideTiles } from "./lib/puzzle";
import createSoundEngine from "./lib/sound";

const SIZES = [3, 4, 5];

// Arrow keys / WASD move the blank cell by [deltaRow, deltaCol].
const KEY_DIRECTIONS = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
  w: [-1, 0],
  s: [1, 0],
  a: [0, -1],
  d: [0, 1],
};

const PRIMARY_BUTTON_CLASS =
  "inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function isTextEntryTarget(target) {
  if (!target || typeof target.tagName !== "string") return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

export default function SlidingPuzzleGame() {
  const [size, setSize] = useState(4);
  const [board, setBoard] = useState(() => createSolvedBoard(4));
  // State machine: ready -> playing <-> paused -> solved -> (restart) playing
  const [status, setStatus] = useState("ready");
  const [moves, setMoves] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [newBest, setNewBest] = useState(false);

  const elapsedRef = useRef(0);
  const soundRef = useRef(null);

  // Best moves per board size (lower is better). Fixed hook order, one per size.
  const [best3, submitBest3] = useBestScore("sliding-puzzle-3x3", { lowerIsBetter: true });
  const [best4, submitBest4] = useBestScore("sliding-puzzle-4x4", { lowerIsBetter: true });
  const [best5, submitBest5] = useBestScore("sliding-puzzle-5x5", { lowerIsBetter: true });
  const best = size === 3 ? best3 : size === 4 ? best4 : best5;
  const submitBest = size === 3 ? submitBest3 : size === 4 ? submitBest4 : submitBest5;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(query.matches);
    onChange();
    if (query.addEventListener) {
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    }
    query.addListener(onChange);
    return () => query.removeListener(onChange);
  }, []);

  // Timer runs only while playing; elapsed time survives pause/resume.
  useEffect(() => {
    if (status !== "playing") return undefined;
    const startedAt = Date.now() - elapsedRef.current;
    const id = window.setInterval(() => {
      elapsedRef.current = Date.now() - startedAt;
      setElapsedMs(elapsedRef.current);
    }, 250);
    return () => window.clearInterval(id);
  }, [status]);

  // Release the AudioContext on unmount.
  useEffect(
    () => () => {
      if (soundRef.current) {
        soundRef.current.dispose();
        soundRef.current = null;
      }
    },
    [],
  );

  const playSound = useCallback(
    (kind) => {
      if (!soundOn) return;
      // Lazily create the engine — this runs inside user-gesture handlers.
      if (!soundRef.current) soundRef.current = createSoundEngine();
      soundRef.current[kind]();
    },
    [soundOn],
  );

  const startGame = useCallback(
    (nextSize = size) => {
      setBoard(shuffleBoard(nextSize));
      setMoves(0);
      elapsedRef.current = 0;
      setElapsedMs(0);
      setNewBest(false);
      setStatus("playing");
    },
    [size],
  );

  const changeSize = useCallback(
    (nextSize) => {
      if (nextSize === size) return;
      setSize(nextSize);
      setBoard(createSolvedBoard(nextSize));
      setMoves(0);
      elapsedRef.current = 0;
      setElapsedMs(0);
      setNewBest(false);
      setStatus("ready");
    },
    [size],
  );

  const commitMove = useCallback(
    (nextBoard, shifted) => {
      const nextMoves = moves + shifted;
      setBoard(nextBoard);
      setMoves(nextMoves);
      if (isSolved(nextBoard)) {
        setStatus("solved");
        if (best === null || nextMoves < best) setNewBest(true);
        submitBest(nextMoves);
        playSound("win");
      } else {
        playSound("slide");
      }
    },
    [moves, best, submitBest, playSound],
  );

  const handleTileClick = useCallback(
    (index) => {
      if (status !== "playing") return;
      const result = slideTiles(board, size, index);
      if (result) commitMove(result.board, result.shifted);
    },
    [status, board, size, commitMove],
  );

  const handleTogglePause = useCallback(() => {
    setStatus((current) =>
      current === "playing" ? "paused" : current === "paused" ? "playing" : current,
    );
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (isTextEntryTarget(event.target)) return;
      const key = event.key;

      if (key === " " || key === "Spacebar") {
        // Let a focused button keep its native space activation.
        if (event.target && event.target.tagName === "BUTTON") return;
        event.preventDefault();
        if (status === "ready" || status === "solved") startGame();
        else handleTogglePause();
        return;
      }

      const direction = KEY_DIRECTIONS[key.length === 1 ? key.toLowerCase() : key];
      if (!direction) return;
      // Only capture arrows/WASD while actually playing so the page can
      // still be scrolled with the keyboard when the game is idle.
      if (status !== "playing") return;
      event.preventDefault();
      const next = moveBlank(board, size, direction[0], direction[1]);
      if (next) commitMove(next, 1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [status, board, size, commitMove, startGame, handleTogglePause]);

  // Deterministic decorative confetti; skipped entirely under reduced motion.
  const confetti = useMemo(() => {
    if (status !== "solved" || reducedMotion) return [];
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: (i * 53 + 7) % 100,
      delayMs: (i % 6) * 90,
      durationMs: 1000 + (i % 5) * 180,
      hue: (i * 47) % 360,
      driftPx: ((i % 7) - 3) * 16,
    }));
  }, [status, reducedMotion]);

  return (
    <GameShell
      title="Sliding Puzzle"
      stats={[
        { label: "Moves", value: moves },
        { label: "Time", value: formatTime(elapsedMs) },
        { label: "Best", value: best === null ? "—" : best },
      ]}
      onRestart={() => startGame()}
      paused={status === "paused"}
      onTogglePause={handleTogglePause}
      soundOn={soundOn}
      onToggleSound={() => setSoundOn((value) => !value)}
      help="Tap any tile in the blank's row or column to slide it (or the whole segment) toward the gap. Arrow keys / WASD move the blank, Space starts or pauses. Order the numbers with the blank last, in as few moves as you can."
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-center gap-2" role="group" aria-label="Board size">
          {SIZES.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => changeSize(n)}
              aria-pressed={n === size}
              className={
                n === size
                  ? "inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  : "inline-flex h-11 items-center justify-center rounded-md border border-border bg-muted px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              }
            >
              {n}×{n}
            </button>
          ))}
        </div>

        <div className="relative">
          <Board
            board={board}
            size={size}
            status={status}
            reducedMotion={reducedMotion}
            onTileClick={handleTileClick}
          />

          {status !== "playing" ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden rounded-lg bg-card/90 p-4 backdrop-blur-sm">
              {status === "ready" ? (
                <div className="flex flex-col items-center gap-4 text-center">
                  <p className="text-lg font-semibold text-foreground">Ready to slide?</p>
                  <p className="max-w-xs text-sm text-muted-foreground">
                    Shuffle the {size}×{size} board and put the numbers back in order.
                  </p>
                  <button type="button" onClick={() => startGame()} className={PRIMARY_BUTTON_CLASS}>
                    <Play className="h-4 w-4" aria-hidden="true" />
                    Start
                  </button>
                </div>
              ) : null}

              {status === "paused" ? (
                <div className="flex flex-col items-center gap-4 text-center">
                  <p className="text-lg font-semibold text-foreground">Paused</p>
                  <button type="button" onClick={handleTogglePause} className={PRIMARY_BUTTON_CLASS}>
                    <Play className="h-4 w-4" aria-hidden="true" />
                    Resume
                  </button>
                </div>
              ) : null}

              {status === "solved" ? (
                <>
                  {confetti.length > 0 ? (
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                      <style>{`@keyframes altft-sp-confetti { from { transform: translate(0, -16px) rotate(0deg); opacity: 1; } to { transform: translate(var(--sp-drift), 420px) rotate(540deg); opacity: 0; } }`}</style>
                      {confetti.map((piece) => (
                        <span
                          key={piece.id}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: `${piece.left}%`,
                            width: 8,
                            height: 14,
                            borderRadius: 2,
                            background: `hsl(${piece.hue} 90% 60%)`,
                            opacity: 0,
                            "--sp-drift": `${piece.driftPx}px`,
                            animation: `altft-sp-confetti ${piece.durationMs}ms ease-in ${piece.delayMs}ms forwards`,
                          }}
                        />
                      ))}
                    </div>
                  ) : null}
                  <div className="relative flex flex-col items-center gap-3 text-center" role="status">
                    <Trophy className="h-10 w-10 text-primary" aria-hidden="true" />
                    <p className="text-xl font-bold text-foreground">Solved!</p>
                    <p className="text-sm text-muted-foreground">
                      {moves} moves · {formatTime(elapsedMs)}
                    </p>
                    {newBest ? (
                      <span className="rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                        New best moves!
                      </span>
                    ) : null}
                    <button type="button" onClick={() => startGame()} className={PRIMARY_BUTTON_CLASS}>
                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                      Play again
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </GameShell>
  );
}
