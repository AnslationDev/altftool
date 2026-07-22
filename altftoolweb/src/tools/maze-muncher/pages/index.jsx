"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import GameShell from "@/tools/_shared/game/GameShell";
import useBestScore from "@/tools/_shared/game/useBestScore";
import TouchControls from "../components/TouchControls";
import createAudio from "../lib/audio";
import { DIRS, freshGame, queueDirection, togglePause, updateGame } from "../lib/engine";
import { BOARD_H, BOARD_W, drawGame } from "../lib/render";

const PRIMARY_BTN_CLASS =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

const SWIPE_THRESHOLD = 24;

const INITIAL_HUD = { state: "ready", score: 0, lives: 3, level: 1 };

export default function MazeMuncherGame() {
  const canvasRef = useRef(null);
  const [initialGame] = useState(() => freshGame("ready"));
  const gameRef = useRef(initialGame);

  const audioRef = useRef(null);
  const reducedMotionRef = useRef(false);
  const soundRef = useRef(false);
  const touchRef = useRef(null);
  const hudRef = useRef(INITIAL_HUD);

  const [hud, setHud] = useState(INITIAL_HUD);
  const [soundOn, setSoundOn] = useState(false);
  const [best, submitBest] = useBestScore("maze-muncher");
  const submitRef = useRef(submitBest);
  useEffect(() => {
    submitRef.current = submitBest;
  }, [submitBest]);

  // Web Audio synth lives for the lifetime of the component.
  useEffect(() => {
    const audio = createAudio();
    audio.setEnabled(soundRef.current);
    audioRef.current = audio;
    return () => {
      audio.dispose();
      if (audioRef.current === audio) audioRef.current = null;
    };
  }, []);

  // Track prefers-reduced-motion for decorative animation.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      reducedMotionRef.current = mq.matches;
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const startGame = useCallback(() => {
    audioRef.current?.unlock();
    const g = gameRef.current;
    if (g.state === "ready" || g.state === "gameover") {
      gameRef.current = freshGame("respawn");
      audioRef.current?.ready();
    }
  }, []);

  const restart = useCallback(() => {
    const g = gameRef.current;
    if (g.score > 0 && g.state !== "gameover") submitRef.current?.(g.score);
    gameRef.current = freshGame("ready");
  }, []);

  const onTogglePause = useCallback(() => {
    togglePause(gameRef.current);
  }, []);

  const onToggleSound = useCallback(() => {
    const next = !soundRef.current;
    soundRef.current = next;
    setSoundOn(next);
    const audio = audioRef.current;
    if (audio) {
      audio.setEnabled(next);
      if (next) audio.unlock(); // toggle click is a user gesture
    }
  }, []);

  const handleDir = useCallback(
    (dir) => {
      audioRef.current?.unlock();
      if (gameRef.current.state === "ready") startGame();
      queueDirection(gameRef.current, dir);
    },
    [startGame],
  );

  // Main loop: simulate, draw, and mirror HUD values into React state.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const c = canvas.getContext("2d");
    if (!c) return undefined;

    let raf = 0;
    let last = performance.now();
    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const g = gameRef.current;
      updateGame(g, dt, {
        audio: audioRef.current,
        submitBest: (score) => submitRef.current?.(score),
      });
      drawGame(c, g, now / 1000, reducedMotionRef.current);

      const h = hudRef.current;
      if (h.state !== g.state || h.score !== g.score || h.lives !== g.lives || h.level !== g.level) {
        const next = { state: g.state, score: g.score, lives: g.lives, level: g.level };
        hudRef.current = next;
        setHud(next);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Keyboard: arrows/WASD steer, Space starts or pauses, Enter starts, P pauses.
  useEffect(() => {
    const KEY_DIRS = {
      arrowup: DIRS.up,
      w: DIRS.up,
      arrowdown: DIRS.down,
      s: DIRS.down,
      arrowleft: DIRS.left,
      a: DIRS.left,
      arrowright: DIRS.right,
      d: DIRS.right,
    };
    const onKeyDown = (event) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      ) {
        return;
      }
      const key = event.key.toLowerCase();
      const dir = KEY_DIRS[key];
      if (dir) {
        event.preventDefault();
        handleDir(dir);
        return;
      }
      if (key === " " || key === "enter") {
        event.preventDefault();
        const state = gameRef.current.state;
        if (state === "ready" || state === "gameover") startGame();
        else if (key === " ") onTogglePause();
        return;
      }
      if (key === "p") onTogglePause();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleDir, startGame, onTogglePause]);

  // Swipe steering on the board (touch-action is disabled on the canvas).
  const onTouchStart = useCallback((event) => {
    const touch = event.touches[0];
    if (touch) touchRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const onTouchMove = useCallback(
    (event) => {
      const startPoint = touchRef.current;
      const touch = event.touches[0];
      if (!startPoint || !touch) return;
      const dx = touch.clientX - startPoint.x;
      const dy = touch.clientY - startPoint.y;
      if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;
      if (Math.abs(dx) > Math.abs(dy)) handleDir(dx > 0 ? DIRS.right : DIRS.left);
      else handleDir(dy > 0 ? DIRS.down : DIRS.up);
      touchRef.current = { x: touch.clientX, y: touch.clientY };
    },
    [handleDir],
  );

  const onTouchEnd = useCallback(() => {
    touchRef.current = null;
  }, []);

  const showOverlay = hud.state === "ready" || hud.state === "paused" || hud.state === "gameover";

  return (
    <GameShell
      title="Maze Muncher"
      stats={[
        { label: "Score", value: hud.score },
        { label: "Best", value: best ?? 0 },
        { label: "Level", value: hud.level },
        { label: "Lives", value: hud.lives },
      ]}
      onRestart={restart}
      paused={hud.state === "paused"}
      onTogglePause={onTogglePause}
      soundOn={soundOn}
      onToggleSound={onToggleSound}
      help="Steer with arrow keys, WASD, a swipe, or the on-screen pad. Clear every pellet to advance; grab a power pellet to turn the tables and munch the ghosts for bonus points. Space pauses."
    >
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-full max-w-[440px]">
          <canvas
            ref={canvasRef}
            width={BOARD_W}
            height={BOARD_H}
            className="block h-auto w-full touch-none rounded-lg border border-border"
            role="img"
            aria-label="Maze Muncher game board"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onTouchCancel={onTouchEnd}
          />

          {showOverlay ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg bg-card/85 p-4 text-center backdrop-blur-sm">
              {hud.state === "ready" ? (
                <>
                  <h3 className="text-xl font-bold text-foreground">Maze Muncher</h3>
                  <p className="max-w-[38ch] text-sm text-muted-foreground">
                    Gobble every pellet and dodge four ghosts, each with its own personality. Power
                    pellets make them edible for a few precious seconds.
                  </p>
                  <button type="button" onClick={startGame} className={PRIMARY_BTN_CLASS}>
                    <Play className="h-4 w-4" aria-hidden="true" />
                    Start game
                  </button>
                  <p className="text-xs text-muted-foreground">or press Space</p>
                </>
              ) : null}

              {hud.state === "paused" ? (
                <>
                  <h3 className="text-xl font-bold text-foreground">Paused</h3>
                  <button type="button" onClick={onTogglePause} className={PRIMARY_BTN_CLASS}>
                    <Play className="h-4 w-4" aria-hidden="true" />
                    Resume
                  </button>
                </>
              ) : null}

              {hud.state === "gameover" ? (
                <>
                  <h3 className="text-xl font-bold text-foreground">Game over</h3>
                  <p className="text-sm text-muted-foreground">
                    Score <span className="font-semibold text-foreground">{hud.score}</span>
                    {" · "}
                    Best <span className="font-semibold text-foreground">{best ?? hud.score}</span>
                  </p>
                  <button type="button" onClick={startGame} className={PRIMARY_BTN_CLASS}>
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Play again
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <TouchControls
          onUp={() => handleDir(DIRS.up)}
          onDown={() => handleDir(DIRS.down)}
          onLeft={() => handleDir(DIRS.left)}
          onRight={() => handleDir(DIRS.right)}
        />
      </div>
    </GameShell>
  );
}
