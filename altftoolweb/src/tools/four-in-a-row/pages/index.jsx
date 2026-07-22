"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bot, Play, Settings2, Users } from "lucide-react";
import GameShell from "@/tools/_shared/game/GameShell";
import useBestScore from "@/tools/_shared/game/useBestScore";
import Board, { DISC_ART } from "../components/Board";
import { COLS, bestMove, createBoard, findWinFrom, isFull, landingRow } from "../lib/engine";
import createSoundEngine from "../lib/sound";

const DIFFICULTIES = [
  { id: "easy", label: "Easy", depth: 2 },
  { id: "medium", label: "Medium", depth: 4 },
  { id: "hard", label: "Hard", depth: 6 },
];

const PRIMARY_BUTTON_CLASS =
  "inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

const SECONDARY_BUTTON_CLASS =
  "inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-card px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

const optionClass = (selected) =>
  `inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
    selected
      ? "border-primary bg-primary/10 text-foreground"
      : "border-border bg-card text-muted-foreground hover:text-foreground"
  }`;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(query.matches);
    onChange();
    query.addEventListener?.("change", onChange);
    return () => query.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

export default function FourInARowGame() {
  // Phase machine: ready -> playing <-> paused -> over -> (restart)
  const [phase, setPhase] = useState("ready");
  const [mode, setMode] = useState("ai"); // "ai" | "local"
  const [difficulty, setDifficulty] = useState("medium");
  const [board, setBoard] = useState(createBoard);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [lastMove, setLastMove] = useState(null);
  const [result, setResult] = useState(null); // { winner: 0|1|2, line }
  const [tally, setTally] = useState({ p1: 0, p2: 0, draws: 0 });
  const [activeCol, setActiveCol] = useState(3);
  const [soundOn, setSoundOn] = useState(true);
  const [best, submitBest] = useBestScore("four-in-a-row");
  const reducedMotion = usePrefersReducedMotion();

  // Refs mirror the state that timer callbacks need synchronously.
  const phaseRef = useRef("ready");
  const modeRef = useRef("ai");
  const boardRef = useRef(board);
  const turnRef = useRef(1);
  const lockRef = useRef(false);
  const depthRef = useRef(4);
  const starterRef = useRef(1);
  const streakRef = useRef(0);
  const moveKeyRef = useRef(0);
  const activeColRef = useRef(3);
  const soundOnRef = useRef(true);
  const reducedRef = useRef(false);
  const dropTimerRef = useRef(null);
  const aiTimerRef = useRef(null);
  const soundRef = useRef(null);
  const dropDiscRef = useRef(null);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    reducedRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(
    () => () => {
      clearTimeout(dropTimerRef.current);
      clearTimeout(aiTimerRef.current);
      soundRef.current?.dispose();
    },
    [],
  );

  const setPhaseBoth = useCallback((next) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const clearTimers = useCallback(() => {
    clearTimeout(dropTimerRef.current);
    clearTimeout(aiTimerRef.current);
  }, []);

  const getSound = useCallback(() => {
    if (!soundRef.current) soundRef.current = createSoundEngine();
    return soundRef.current;
  }, []);

  const playSound = useCallback(
    (name) => {
      if (!soundOnRef.current) return;
      const engine = getSound();
      engine[name]?.();
    },
    [getSound],
  );

  const toggleSound = useCallback(() => {
    setSoundOn((on) => {
      const next = !on;
      soundOnRef.current = next;
      if (next) getSound().unlock();
      return next;
    });
  }, [getSound]);

  const finishRound = useCallback(
    (winner, line) => {
      setResult({ winner, line });
      setPhaseBoth("over");
      setTally((t) =>
        winner === 1
          ? { ...t, p1: t.p1 + 1 }
          : winner === 2
            ? { ...t, p2: t.p2 + 1 }
            : { ...t, draws: t.draws + 1 },
      );
      if (modeRef.current === "ai") {
        if (winner === 1) {
          streakRef.current += 1;
          submitBest(streakRef.current);
          playSound("win");
        } else {
          streakRef.current = 0;
          playSound(winner === 2 ? "lose" : "draw");
        }
      } else {
        playSound(winner === 0 ? "draw" : "win");
      }
    },
    [playSound, setPhaseBoth, submitBest],
  );

  const scheduleAiMove = useCallback(() => {
    clearTimeout(aiTimerRef.current);
    aiTimerRef.current = setTimeout(
      () => {
        if (phaseRef.current !== "playing" || modeRef.current !== "ai" || turnRef.current !== 2) {
          return;
        }
        const col = bestMove(boardRef.current, 2, depthRef.current);
        if (col >= 0) dropDiscRef.current?.(col);
      },
      reducedRef.current ? 140 : 400,
    );
  }, []);

  const settleMove = useCallback(
    (nextBoard, row, col, player) => {
      const line = findWinFrom(nextBoard, row, col, player);
      if (line) {
        finishRound(player, line);
        return;
      }
      if (isFull(nextBoard)) {
        finishRound(0, null);
        return;
      }
      const nextPlayer = player === 1 ? 2 : 1;
      turnRef.current = nextPlayer;
      setCurrentPlayer(nextPlayer);
      if (modeRef.current === "ai" && nextPlayer === 2) scheduleAiMove();
    },
    [finishRound, scheduleAiMove],
  );

  const dropDisc = useCallback(
    (col) => {
      if (phaseRef.current !== "playing" || lockRef.current) return;
      const boardNow = boardRef.current;
      const row = landingRow(boardNow, col);
      if (row < 0) return;
      const player = turnRef.current;
      const next = boardNow.map((cells) => cells.slice());
      next[row][col] = player;
      boardRef.current = next;
      setBoard(next);
      moveKeyRef.current += 1;
      setLastMove({ row, col, player, key: moveKeyRef.current });
      playSound("drop");
      lockRef.current = true;
      const settleMs = reducedRef.current ? 50 : 220 + row * 50;
      dropTimerRef.current = setTimeout(() => {
        lockRef.current = false;
        settleMove(next, row, col, player);
      }, settleMs);
    },
    [playSound, settleMove],
  );

  useEffect(() => {
    dropDiscRef.current = dropDisc;
  }, [dropDisc]);

  const startRound = useCallback(
    (starter) => {
      clearTimers();
      lockRef.current = false;
      const fresh = createBoard();
      boardRef.current = fresh;
      setBoard(fresh);
      setLastMove(null);
      setResult(null);
      turnRef.current = starter;
      setCurrentPlayer(starter);
      activeColRef.current = 3;
      setActiveCol(3);
      setPhaseBoth("playing");
      if (modeRef.current === "ai" && starter === 2) scheduleAiMove();
    },
    [clearTimers, scheduleAiMove, setPhaseBoth],
  );

  const startGame = useCallback(() => {
    depthRef.current = DIFFICULTIES.find((d) => d.id === difficulty)?.depth ?? 4;
    playSound("select");
    starterRef.current = 1;
    startRound(1);
  }, [difficulty, playSound, startRound]);

  const nextRound = useCallback(() => {
    starterRef.current = starterRef.current === 1 ? 2 : 1;
    playSound("select");
    startRound(starterRef.current);
  }, [playSound, startRound]);

  const goToReady = useCallback(() => {
    clearTimers();
    lockRef.current = false;
    streakRef.current = 0;
    starterRef.current = 1;
    const fresh = createBoard();
    boardRef.current = fresh;
    setBoard(fresh);
    setLastMove(null);
    setResult(null);
    setTally({ p1: 0, p2: 0, draws: 0 });
    turnRef.current = 1;
    setCurrentPlayer(1);
    setPhaseBoth("ready");
  }, [clearTimers, setPhaseBoth]);

  const togglePause = useCallback(() => {
    if (phaseRef.current === "playing") {
      setPhaseBoth("paused");
    } else if (phaseRef.current === "paused") {
      setPhaseBoth("playing");
      // If the AI's move was skipped while paused, reschedule it.
      if (modeRef.current === "ai" && turnRef.current === 2 && !lockRef.current) {
        scheduleAiMove();
      }
    }
  }, [scheduleAiMove, setPhaseBoth]);

  const moveCursor = useCallback((delta) => {
    setActiveCol((c) => {
      const next = Math.min(COLS - 1, Math.max(0, c + delta));
      activeColRef.current = next;
      return next;
    });
  }, []);

  const setCursor = useCallback((col) => {
    activeColRef.current = col;
    setActiveCol(col);
  }, []);

  const handleColumnClick = useCallback(
    (col) => {
      if (modeRef.current === "ai" && turnRef.current === 2) return;
      setCursor(col);
      dropDisc(col);
    },
    [dropDisc, setCursor],
  );

  useEffect(() => {
    const onKeyDown = (event) => {
      const key = event.key;
      if (key === "p" || key === "P") {
        if (phaseRef.current === "playing" || phaseRef.current === "paused") {
          event.preventDefault();
          togglePause();
        }
        return;
      }
      if (phaseRef.current !== "playing") return;
      if (key === "ArrowLeft" || key === "a" || key === "A") {
        event.preventDefault();
        moveCursor(-1);
      } else if (key === "ArrowRight" || key === "d" || key === "D") {
        event.preventDefault();
        moveCursor(1);
      } else if (key === "Enter" || key === " " || key === "ArrowDown" || key === "s" || key === "S") {
        // Let focused buttons (columns, shell controls) keep their native
        // Enter/Space activation instead of double-firing.
        const target = event.target;
        if (target instanceof Element && target.closest("button, a, input, select, textarea")) return;
        event.preventDefault();
        if (modeRef.current === "ai" && turnRef.current === 2) return;
        dropDisc(activeColRef.current);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dropDisc, moveCursor, togglePause]);

  const statusText = useMemo(() => {
    if (phase === "ready") return "Choose a mode and start the game";
    if (phase === "paused") return "Game paused";
    if (phase === "over" && result) {
      if (result.winner === 0) return "Round over: it's a draw";
      if (mode === "ai") return result.winner === 1 ? "Round over: you win!" : "Round over: the AI wins";
      return `Round over: Player ${result.winner} wins!`;
    }
    if (mode === "ai") return currentPlayer === 1 ? "Your turn" : "AI is thinking…";
    return `Player ${currentPlayer}'s turn`;
  }, [phase, result, mode, currentPlayer]);

  const stats = useMemo(() => {
    const base =
      mode === "ai"
        ? [
            { label: "You", value: tally.p1 },
            { label: "AI", value: tally.p2 },
          ]
        : [
            { label: "P1", value: tally.p1 },
            { label: "P2", value: tally.p2 },
          ];
    base.push({ label: "Draws", value: tally.draws });
    base.push({ label: "Best streak", value: best ?? 0 });
    return base;
  }, [mode, tally, best]);

  const boardDisabled =
    phase !== "playing" || (mode === "ai" && currentPlayer === 2);

  return (
    <GameShell
      title="Four in a Row"
      stats={stats}
      onRestart={goToReady}
      paused={phase === "paused"}
      onTogglePause={phase === "playing" || phase === "paused" ? togglePause : undefined}
      soundOn={soundOn}
      onToggleSound={toggleSound}
      help="Tap or click a column to drop a disc. Keyboard: Left / Right arrows aim, Enter or Space drops, P pauses. Line up four of your discs in any direction to win the round."
    >
      <div aria-live="polite" className="sr-only">
        {statusText}
      </div>

      {phase === "ready" ? (
        <div className="mx-auto w-full max-w-md rounded-lg border border-border bg-muted/40 p-4 sm:p-6">
          <div className="space-y-4 text-center">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">Ready to play?</h3>
              <p className="text-sm text-muted-foreground">
                Drop discs into the 7x6 board and line up four in a row — across, down, or
                diagonally — before your opponent does.
              </p>
            </div>

            <div className="space-y-2 text-left">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Mode</p>
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="Game mode">
                <button
                  type="button"
                  onClick={() => {
                    setMode("ai");
                    playSound("select");
                  }}
                  className={optionClass(mode === "ai")}
                  aria-pressed={mode === "ai"}
                >
                  <Bot className="h-4 w-4" aria-hidden="true" />
                  vs AI
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("local");
                    playSound("select");
                  }}
                  className={optionClass(mode === "local")}
                  aria-pressed={mode === "local"}
                >
                  <Users className="h-4 w-4" aria-hidden="true" />
                  2 Players
                </button>
              </div>
            </div>

            {mode === "ai" ? (
              <div className="space-y-2 text-left">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Difficulty
                </p>
                <div className="grid grid-cols-3 gap-2" role="group" aria-label="AI difficulty">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        setDifficulty(d.id);
                        playSound("select");
                      }}
                      className={optionClass(difficulty === d.id)}
                      aria-pressed={difficulty === d.id}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <button type="button" onClick={startGame} className={`${PRIMARY_BUTTON_CLASS} w-full`}>
              <Play className="h-4 w-4" aria-hidden="true" />
              Start game
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="mb-2 flex min-h-8 items-center justify-center gap-2 text-sm font-medium text-foreground">
            {phase === "over" ? (
              <span>{statusText}</span>
            ) : (
              <>
                <span
                  className="h-3.5 w-3.5 rounded-full border"
                  style={DISC_ART[currentPlayer]}
                  aria-hidden="true"
                />
                <span
                  className={
                    mode === "ai" && currentPlayer === 2 && phase === "playing" && !reducedMotion
                      ? "animate-pulse"
                      : undefined
                  }
                >
                  {statusText}
                </span>
              </>
            )}
          </div>

          <Board
            board={board}
            lastMove={lastMove}
            winLine={result?.line}
            activeCol={activeCol}
            currentPlayer={currentPlayer}
            disabled={boardDisabled}
            reducedMotion={reducedMotion}
            onColumnEnter={setCursor}
            onColumnClick={handleColumnClick}
          />

          {phase === "paused" ? (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg bg-card/85 backdrop-blur-sm">
              <p className="text-lg font-semibold text-foreground">Paused</p>
              <button type="button" onClick={togglePause} className={PRIMARY_BUTTON_CLASS}>
                <Play className="h-4 w-4" aria-hidden="true" />
                Resume
              </button>
            </div>
          ) : null}

          {phase === "over" ? (
            <div className="mt-3 flex flex-col items-center gap-3 rounded-lg border border-border bg-muted p-4">
              <p className="text-base font-semibold text-foreground">
                {result?.winner === 0
                  ? "It's a draw"
                  : mode === "ai"
                    ? result?.winner === 1
                      ? "You win this round!"
                      : "The AI wins this round"
                    : `Player ${result?.winner} wins!`}
              </p>
              <p className="text-xs text-muted-foreground">
                {mode === "ai"
                  ? `Rounds — You ${tally.p1} · AI ${tally.p2} · Draws ${tally.draws}`
                  : `Rounds — P1 ${tally.p1} · P2 ${tally.p2} · Draws ${tally.draws}`}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <button type="button" onClick={nextRound} className={PRIMARY_BUTTON_CLASS}>
                  <Play className="h-4 w-4" aria-hidden="true" />
                  Play again
                </button>
                <button type="button" onClick={goToReady} className={SECONDARY_BUTTON_CLASS}>
                  <Settings2 className="h-4 w-4" aria-hidden="true" />
                  Change mode
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </GameShell>
  );
}
