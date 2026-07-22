"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameShell from "@/tools/_shared/game/GameShell";
import useBestScore from "@/tools/_shared/game/useBestScore";
import {
  COLS,
  ROWS,
  PIECE_COLORS,
  LINE_SCORES,
  createEmptyBoard,
  shuffleBag,
  spawnPiece,
  tryRotate,
  collides,
  getDropY,
  lockPiece,
  findFullRows,
  clearRows,
  levelForLines,
  dropIntervalMs,
} from "../lib/engine";
import { createSoundEngine } from "../lib/audio";
import PiecePreview from "../components/PiecePreview";
import TouchControls from "../components/TouchControls";

const NEXT_COUNT = 3;
const CLEAR_FLASH_MS = 130;

// Play-area art palette (fixed on purpose so the board reads well in both themes).
const BOARD_BG = "#0b1220";
const GRID_LINE = "rgba(148, 163, 184, 0.12)";
const CELL_SHINE = "rgba(255, 255, 255, 0.22)";
const CLEAR_FLASH = "rgba(255, 255, 255, 0.65)";
const GHOST_ALPHA = 0.28;

function createGameState() {
  return {
    status: "ready", // ready -> playing <-> paused -> over -> (restart)
    board: createEmptyBoard(),
    bag: [],
    queue: [],
    current: null,
    hold: null,
    canHold: true,
    score: 0,
    lines: 0,
    level: 1,
    dropAccum: 0,
    lastTime: 0,
    clearing: null, // { rows: number[], until: timestamp }
  };
}

function refillQueue(s) {
  while (s.queue.length < NEXT_COUNT + 1) {
    if (s.bag.length === 0) s.bag = shuffleBag();
    s.queue.push(s.bag.shift());
  }
}

/** Pulls the next piece from the queue. Returns false when it spawns blocked. */
function trySpawnNext(s) {
  refillQueue(s);
  const piece = spawnPiece(s.queue.shift());
  refillQueue(s);
  s.current = piece;
  return !collides(s.board, piece.matrix, piece.x, piece.y);
}

export default function BlockStackerGame() {
  const canvasRef = useRef(null);
  const boardWrapRef = useRef(null);
  const [initialGameState] = useState(createGameState);
  const stateRef = useRef(initialGameState);
  const soundRef = useRef(null);
  const bestRef = useRef(null);
  const reducedMotionRef = useRef(false);
  const rafRef = useRef(0);
  const touchStartRef = useRef(null);

  const [best, submitBest] = useBestScore("block-stacker");
  const [soundOn, setSoundOn] = useState(true);
  const [newBest, setNewBest] = useState(false);
  const [hud, setHud] = useState({
    status: "ready",
    score: 0,
    lines: 0,
    level: 1,
    next: [],
    hold: null,
    canHold: true,
  });

  useEffect(() => {
    bestRef.current = best;
  }, [best]);

  const syncHud = useCallback(() => {
    const s = stateRef.current;
    setHud({
      status: s.status,
      score: s.score,
      lines: s.lines,
      level: s.level,
      next: s.queue.slice(0, NEXT_COUNT),
      hold: s.hold,
      canHold: s.canHold,
    });
  }, []);

  // ---- Rendering -----------------------------------------------------------

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;
    const w = canvas.width;
    const h = canvas.height;
    if (!w || !h) return;
    const cellW = w / COLS;
    const cellH = h / ROWS;

    ctx.fillStyle = BOARD_BG;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = GRID_LINE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let c = 1; c < COLS; c += 1) {
      const x = Math.round(c * cellW) + 0.5;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let r = 1; r < ROWS; r += 1) {
      const y = Math.round(r * cellH) + 0.5;
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    const drawCell = (col, row, color, alpha = 1) => {
      if (row < 0) return;
      const x = col * cellW;
      const y = row * cellH;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);
      ctx.fillStyle = CELL_SHINE;
      ctx.fillRect(x + 1, y + 1, cellW - 2, Math.max(2, cellH * 0.16));
      ctx.globalAlpha = 1;
    };

    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        const type = s.board[r][c];
        if (type) drawCell(c, r, PIECE_COLORS[type]);
      }
    }

    if (s.clearing) {
      ctx.fillStyle = CLEAR_FLASH;
      for (const r of s.clearing.rows) ctx.fillRect(0, r * cellH, w, cellH);
    }

    if (s.current) {
      const { matrix, x, y, type } = s.current;
      if (s.status === "playing") {
        const ghostY = getDropY(s.board, s.current);
        if (ghostY !== y) {
          for (let r = 0; r < matrix.length; r += 1) {
            for (let c = 0; c < matrix[r].length; c += 1) {
              if (matrix[r][c]) drawCell(x + c, ghostY + r, PIECE_COLORS[type], GHOST_ALPHA);
            }
          }
        }
      }
      for (let r = 0; r < matrix.length; r += 1) {
        for (let c = 0; c < matrix[r].length; c += 1) {
          if (matrix[r][c]) drawCell(x + c, y + r, PIECE_COLORS[type]);
        }
      }
    }
  }, []);

  // ---- Game transitions ----------------------------------------------------

  const endGame = useCallback(() => {
    const s = stateRef.current;
    s.status = "over";
    s.clearing = null;
    soundRef.current?.play("over");
    const prevBest = bestRef.current;
    setNewBest(s.score > 0 && (prevBest === null || s.score > prevBest));
    submitBest(s.score);
    syncHud();
  }, [submitBest, syncHud]);

  const finishLock = useCallback(() => {
    const s = stateRef.current;
    if (!s.current) return;
    const { board, toppedOut } = lockPiece(s.board, s.current);
    s.board = board;
    s.current = null;
    s.dropAccum = 0;
    s.lastTime = 0;
    if (toppedOut) {
      endGame();
      return;
    }
    s.canHold = true;
    const rows = findFullRows(s.board);
    if (rows.length > 0) {
      const prevLevel = s.level;
      s.score += LINE_SCORES[rows.length] * s.level;
      s.lines += rows.length;
      s.level = levelForLines(s.lines);
      soundRef.current?.play("clear");
      if (s.level > prevLevel) soundRef.current?.play("levelup");
      if (reducedMotionRef.current) {
        s.board = clearRows(s.board, rows);
        if (!trySpawnNext(s)) {
          endGame();
          return;
        }
      } else {
        s.clearing = { rows, until: performance.now() + CLEAR_FLASH_MS };
      }
    } else {
      soundRef.current?.play("lock");
      if (!trySpawnNext(s)) {
        endGame();
        return;
      }
    }
    syncHud();
  }, [endGame, syncHud]);

  const start = useCallback(() => {
    const s = createGameState();
    s.status = "playing";
    trySpawnNext(s);
    stateRef.current = s;
    setNewBest(false);
    soundRef.current?.unlock();
    syncHud();
  }, [syncHud]);

  const handleRestart = useCallback(() => {
    const s = stateRef.current;
    if (s.status === "playing" || s.status === "paused") submitBest(s.score);
    start();
  }, [start, submitBest]);

  const togglePause = useCallback(() => {
    const s = stateRef.current;
    if (s.status === "playing") {
      s.status = "paused";
    } else if (s.status === "paused") {
      s.status = "playing";
      s.lastTime = 0;
    } else {
      return;
    }
    syncHud();
  }, [syncHud]);

  // ---- Player actions ------------------------------------------------------

  const move = useCallback((dx) => {
    const s = stateRef.current;
    if (s.status !== "playing" || !s.current || s.clearing) return;
    if (!collides(s.board, s.current.matrix, s.current.x + dx, s.current.y)) {
      s.current.x += dx;
      soundRef.current?.play("move");
    }
  }, []);

  const rotatePiece = useCallback(() => {
    const s = stateRef.current;
    if (s.status !== "playing" || !s.current || s.clearing) return;
    const rotated = tryRotate(s.board, s.current, 1);
    if (rotated) {
      s.current = rotated;
      soundRef.current?.play("rotate");
    }
  }, []);

  const softDrop = useCallback(() => {
    const s = stateRef.current;
    if (s.status !== "playing" || !s.current || s.clearing) return;
    if (!collides(s.board, s.current.matrix, s.current.x, s.current.y + 1)) {
      s.current.y += 1;
      s.score += 1;
      s.dropAccum = 0;
      syncHud();
    } else {
      finishLock();
    }
  }, [finishLock, syncHud]);

  const hardDrop = useCallback(() => {
    const s = stateRef.current;
    if (s.status !== "playing" || !s.current || s.clearing) return;
    const dropY = getDropY(s.board, s.current);
    s.score += (dropY - s.current.y) * 2;
    s.current.y = dropY;
    soundRef.current?.play("harddrop");
    finishLock();
  }, [finishLock]);

  const holdPiece = useCallback(() => {
    const s = stateRef.current;
    if (s.status !== "playing" || !s.current || s.clearing || !s.canHold) return;
    const currentType = s.current.type;
    let ok = true;
    if (s.hold) {
      s.current = spawnPiece(s.hold);
      ok = !collides(s.board, s.current.matrix, s.current.x, s.current.y);
    } else {
      ok = trySpawnNext(s);
    }
    s.hold = currentType;
    s.canHold = false;
    s.dropAccum = 0;
    soundRef.current?.play("hold");
    if (!ok) {
      endGame();
      return;
    }
    syncHud();
  }, [endGame, syncHud]);

  // ---- Effects -------------------------------------------------------------

  // Sound engine lifecycle.
  useEffect(() => {
    if (!soundRef.current) soundRef.current = createSoundEngine();
    soundRef.current.setEnabled(soundOn);
  }, [soundOn]);

  useEffect(() => {
    return () => {
      soundRef.current?.dispose();
    };
  }, []);

  const handleToggleSound = useCallback(() => {
    soundRef.current?.unlock();
    setSoundOn((v) => !v);
  }, []);

  // Reduced-motion preference (skips the line-clear flash).
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reducedMotionRef.current = mq.matches;
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Canvas sizing (board scales via CSS; backing store follows devicePixelRatio).
  useEffect(() => {
    const wrap = boardWrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return undefined;
    const observer = new ResizeObserver(() => {
      const rect = wrap.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      draw();
    });
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [draw]);

  // Main loop: gravity + line-clear resolution + drawing.
  useEffect(() => {
    const frame = (t) => {
      rafRef.current = requestAnimationFrame(frame);
      const s = stateRef.current;
      if (s.status === "playing") {
        if (s.clearing) {
          if (t >= s.clearing.until) {
            s.board = clearRows(s.board, s.clearing.rows);
            s.clearing = null;
            s.lastTime = 0;
            if (!trySpawnNext(s)) endGame();
            else syncHud();
          }
        } else if (s.current) {
          if (!s.lastTime) s.lastTime = t;
          const dt = t - s.lastTime;
          s.lastTime = t;
          s.dropAccum += dt;
          const interval = dropIntervalMs(s.level);
          while (s.dropAccum >= interval) {
            s.dropAccum -= interval;
            if (!collides(s.board, s.current.matrix, s.current.x, s.current.y + 1)) {
              s.current.y += 1;
            } else {
              finishLock();
              break;
            }
          }
        }
      } else {
        s.lastTime = 0;
      }
      draw();
    };
    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw, endGame, finishLock, syncHud]);

  // Keyboard controls.
  useEffect(() => {
    const onKey = (event) => {
      const s = stateRef.current;
      const key = event.key;
      // Never hijack typing contexts elsewhere on the page.
      const target = event.target;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable) {
        return;
      }
      // Let Space/Enter activate a focused button (pause, sound, play) natively
      // instead of also triggering a game action.
      if ((key === " " || key === "Enter") && (tag === "BUTTON" || tag === "A")) return;
      if (s.status === "ready" || s.status === "over") {
        if ((key === "Enter" || key === " ") && !event.repeat) {
          event.preventDefault();
          start();
        }
        return;
      }
      if (key === "p" || key === "P" || key === "Escape") {
        event.preventDefault();
        togglePause();
        return;
      }
      if (s.status !== "playing") return;
      switch (key) {
        case "ArrowLeft":
        case "a":
        case "A":
          event.preventDefault();
          move(-1);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          event.preventDefault();
          move(1);
          break;
        case "ArrowDown":
        case "s":
        case "S":
          event.preventDefault();
          softDrop();
          break;
        case "ArrowUp":
        case "w":
        case "W":
        case "x":
        case "X":
          event.preventDefault();
          rotatePiece();
          break;
        case " ":
          event.preventDefault();
          // Key auto-repeat must not slam every following piece down too.
          if (!event.repeat) hardDrop();
          break;
        case "c":
        case "C":
          event.preventDefault();
          if (!event.repeat) holdPiece();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [start, togglePause, move, softDrop, rotatePiece, hardDrop, holdPiece]);

  // Auto-pause when the tab is hidden.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden" && stateRef.current.status === "playing") {
        togglePause();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [togglePause]);

  // Record the in-progress score if the player navigates away mid-game.
  useEffect(() => {
    return () => {
      const s = stateRef.current;
      if (s && s.status !== "ready") submitBest(s.score);
    };
  }, [submitBest]);

  // ---- Board touch gestures: swipe down = hard drop, tap = rotate ----------

  const onBoardTouchStart = useCallback((event) => {
    const touch = event.touches[0];
    if (touch) touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const onBoardTouchEnd = useCallback(
    (event) => {
      const startPoint = touchStartRef.current;
      touchStartRef.current = null;
      if (!startPoint) return;
      const s = stateRef.current;
      if (s.status !== "playing") return;
      const touch = event.changedTouches[0];
      if (!touch) return;
      const dx = touch.clientX - startPoint.x;
      const dy = touch.clientY - startPoint.y;
      if (dy > 48 && Math.abs(dx) < 40) hardDrop();
      else if (Math.abs(dx) < 10 && Math.abs(dy) < 10) rotatePiece();
    },
    [hardDrop, rotatePiece],
  );

  // ---- Render --------------------------------------------------------------

  const isRunning = hud.status === "playing" || hud.status === "paused";

  return (
    <GameShell
      title="Block Stacker"
      stats={[
        { label: "Score", value: hud.score },
        { label: "Lines", value: hud.lines },
        { label: "Level", value: hud.level },
        { label: "Best", value: best ?? "—" },
      ]}
      onRestart={handleRestart}
      paused={hud.status === "paused"}
      onTogglePause={isRunning ? togglePause : undefined}
      soundOn={soundOn}
      onToggleSound={handleToggleSound}
      help="Keyboard: arrows or WASD move and rotate, Space hard-drops, C holds a piece, P pauses. Touch: use the buttons, tap the board to rotate, or swipe down to hard-drop. Clear lines to score — every 10 lines speeds things up."
    >
      <div className="flex flex-col items-center gap-3">
        <div className="flex w-full max-w-sm items-start justify-center gap-2 sm:gap-3">
          <div className="flex w-14 shrink-0 flex-col gap-2 sm:w-20">
            <PiecePreview
              type={hud.hold}
              label="Hold"
              dimmed={hud.hold !== null && !hud.canHold}
            />
          </div>

          <div
            ref={boardWrapRef}
            className="relative aspect-[1/2] w-full max-w-[260px] flex-1 touch-none select-none overflow-hidden rounded-lg"
            onTouchStart={onBoardTouchStart}
            onTouchEnd={onBoardTouchEnd}
          >
            <canvas
              ref={canvasRef}
              role="img"
              aria-label="Block Stacker playing field"
              className="absolute inset-0 h-full w-full"
            />

            {hud.status === "ready" ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card/80 p-4 text-center backdrop-blur-sm">
                <p className="text-lg font-semibold text-foreground">Block Stacker</p>
                <p className="text-xs text-muted-foreground">
                  Stack the falling blocks and clear lines before the pile reaches the top.
                </p>
                <button
                  type="button"
                  onClick={start}
                  className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Play
                </button>
              </div>
            ) : null}

            {hud.status === "paused" ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card/80 p-4 text-center backdrop-blur-sm">
                <p className="text-lg font-semibold text-foreground">Paused</p>
                <button
                  type="button"
                  onClick={togglePause}
                  className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Resume
                </button>
              </div>
            ) : null}

            {hud.status === "over" ? (
              <div
                role="alert"
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-card/80 p-4 text-center backdrop-blur-sm"
              >
                <p className="text-lg font-semibold text-foreground">Game over</p>
                <p className="text-sm text-muted-foreground">
                  Score <span className="font-semibold text-foreground">{hud.score}</span>
                  {" · "}Lines{" "}
                  <span className="font-semibold text-foreground">{hud.lines}</span>
                </p>
                {newBest ? (
                  <p className="text-sm font-semibold text-primary">New best score!</p>
                ) : null}
                <button
                  type="button"
                  onClick={start}
                  className="mt-1 inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Play again
                </button>
              </div>
            ) : null}
          </div>

          <div className="flex w-14 shrink-0 flex-col gap-1.5 sm:w-20">
            <span className="text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Next
            </span>
            {Array.from({ length: NEXT_COUNT }, (_, i) => (
              <PiecePreview key={i} type={hud.next[i] ?? null} />
            ))}
          </div>
        </div>

        <TouchControls
          disabled={hud.status !== "playing"}
          onLeft={() => move(-1)}
          onRight={() => move(1)}
          onDown={softDrop}
          onRotate={rotatePiece}
          onHardDrop={hardDrop}
          onHold={holdPiece}
        />
      </div>
    </GameShell>
  );
}
