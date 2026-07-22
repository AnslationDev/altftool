"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameShell from "@/tools/_shared/game/GameShell";
import useBestScore from "@/tools/_shared/game/useBestScore";
import GameOverlay from "../components/GameOverlay";
import createSynth from "../lib/audio";
import {
  GAME_H,
  GAME_W,
  LEVEL_COUNT,
  createGame,
  drawGame,
  launchBalls,
  movePaddleTo,
  resetBallOnPaddle,
  startLevel,
  stepGame,
} from "../lib/engine";

const STATUS_MESSAGES = {
  ready: "Ball ready. Tap, click, or press Space to launch.",
  playing: "Game in progress.",
  paused: "Game paused.",
  cleared: "Level cleared.",
  gameover: "Game over.",
  won: "All levels cleared. You win!",
};

export default function BrickBreakerGame() {
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const gameRef = useRef(null);
  if (gameRef.current === null) gameRef.current = createGame();

  const synthRef = useRef(null);
  const soundOnRef = useRef(true);
  const draggingRef = useRef(false);
  const eventsRef = useRef({});

  const [status, setStatus] = useState("ready");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [soundOn, setSoundOn] = useState(true);
  const [best, submitBest] = useBestScore("brick-breaker");

  const recordScore = useCallback(
    (value) => {
      if (value > 0) submitBest(value);
    },
    [submitBest],
  );

  const playSound = useCallback((name, arg) => {
    if (!soundOnRef.current || !synthRef.current) return;
    synthRef.current[name]?.(arg);
  }, []);

  // Must be called from a user gesture so the AudioContext can start.
  const unlockAudio = useCallback(() => {
    if (!soundOnRef.current) return;
    if (!synthRef.current) synthRef.current = createSynth();
    synthRef.current.unlock();
  }, []);

  const toggleSound = useCallback(() => {
    const next = !soundOnRef.current;
    soundOnRef.current = next;
    setSoundOn(next);
    if (next) {
      if (!synthRef.current) synthRef.current = createSynth();
      synthRef.current.unlock(); // the toggle click is a user gesture
    }
  }, []);

  const launch = useCallback(() => {
    const g = gameRef.current;
    if (g.status !== "ready") return;
    launchBalls(g);
    g.status = "playing";
    setStatus("playing");
    playSound("paddle");
  }, [playSound]);

  const nextLevel = useCallback(() => {
    const g = gameRef.current;
    if (g.status !== "cleared") return;
    startLevel(g, g.level + 1);
    setLevel(g.level);
    g.status = "ready";
    setStatus("ready");
  }, []);

  const restart = useCallback(() => {
    const g = gameRef.current;
    recordScore(g.score);
    const fresh = createGame();
    fresh.reduceMotion = g.reduceMotion;
    gameRef.current = fresh;
    setScore(0);
    setLives(3);
    setLevel(1);
    setStatus("ready");
  }, [recordScore]);

  const togglePause = useCallback(() => {
    const g = gameRef.current;
    if (g.status === "playing") {
      g.status = "paused";
      setStatus("paused");
    } else if (g.status === "paused") {
      g.status = "playing";
      setStatus("playing");
    }
  }, []);

  const handleCleared = useCallback(() => {
    const g = gameRef.current;
    recordScore(g.score);
    if (g.level >= LEVEL_COUNT) {
      g.status = "won";
      setStatus("won");
      playSound("win");
    } else {
      g.status = "cleared";
      setStatus("cleared");
      playSound("levelClear");
    }
  }, [playSound, recordScore]);

  const handleBallsLost = useCallback(() => {
    const g = gameRef.current;
    g.effects.wideMs = 0;
    g.effects.slowMs = 0;
    g.powerups = [];
    recordScore(g.score);
    if (g.lives <= 1) {
      g.lives = 0;
      setLives(0);
      g.status = "gameover";
      setStatus("gameover");
      playSound("gameOver");
    } else {
      g.lives -= 1;
      setLives(g.lives);
      resetBallOnPaddle(g);
      g.status = "ready";
      setStatus("ready");
      playSound("lifeLost");
    }
  }, [playSound, recordScore]);

  // Keep the engine's event callbacks fresh without restarting the loop.
  useEffect(() => {
    eventsRef.current = {
      wall: () => playSound("wall"),
      paddle: () => playSound("paddle"),
      brick: (destroyed, tier) => playSound(destroyed ? "brickBreak" : "brickHit", tier),
      power: () => playSound("power"),
      cleared: handleCleared,
      ballsLost: handleBallsLost,
    };
  }, [playSound, handleCleared, handleBallsLost]);

  // Main render/physics loop.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = GAME_W * dpr;
    canvas.height = GAME_H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotionPref = () => {
      gameRef.current.reduceMotion = media.matches;
    };
    applyMotionPref();
    media.addEventListener?.("change", applyMotionPref);

    let raf = 0;
    let last = performance.now();
    let lastScore = -1;
    const frame = (now) => {
      const g = gameRef.current;
      const dt = Math.min((now - last) / 1000, 0.035);
      last = now;
      if (g.status === "playing" || g.status === "ready") {
        stepGame(g, dt, eventsRef.current);
      }
      if (g.score !== lastScore) {
        lastScore = g.score;
        setScore(g.score);
      }
      drawGame(ctx, g);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      media.removeEventListener?.("change", applyMotionPref);
    };
  }, []);

  // Keyboard controls.
  useEffect(() => {
    const onKeyDown = (event) => {
      const target = event.target;
      // Don't hijack keys while the user is typing in a form field.
      if (
        target instanceof HTMLElement &&
        target.closest("input, textarea, select, [contenteditable='true']")
      ) {
        return;
      }
      const g = gameRef.current;
      const key = event.key;
      if (key === "ArrowLeft" || key === "a" || key === "A") {
        event.preventDefault();
        g.keys.left = true;
        return;
      }
      if (key === "ArrowRight" || key === "d" || key === "D") {
        event.preventDefault();
        g.keys.right = true;
        return;
      }
      if (key === " " || key === "Spacebar") {
        // A focused button keeps native Space activation (shell + overlay
        // controls) — only hijack Space for the game elsewhere.
        if (target instanceof HTMLElement && target.closest("button")) return;
        event.preventDefault();
        if (event.repeat) return;
        unlockAudio();
        if (g.status === "ready") launch();
        else if (g.status === "cleared") nextLevel();
        else if (g.status === "gameover" || g.status === "won") restart();
        return;
      }
      if (key === "p" || key === "P") togglePause();
      if (key === "Enter") {
        // Enter activates a focused button natively — don't double-fire.
        if (target instanceof HTMLElement && target.closest("button")) return;
        if (event.repeat) return;
        if (g.status === "cleared") nextLevel();
        else if (g.status === "gameover" || g.status === "won") restart();
      }
    };
    const onKeyUp = (event) => {
      const g = gameRef.current;
      const key = event.key;
      if (key === "ArrowLeft" || key === "a" || key === "A") g.keys.left = false;
      if (key === "ArrowRight" || key === "d" || key === "D") g.keys.right = false;
    };
    const onBlur = () => {
      // Keys released while the window is unfocused never fire keyup here.
      const g = gameRef.current;
      g.keys.left = false;
      g.keys.right = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [launch, nextLevel, restart, togglePause, unlockAudio]);

  // Auto-pause when the tab is hidden.
  useEffect(() => {
    const onVisibility = () => {
      const g = gameRef.current;
      if (document.hidden && g.status === "playing") {
        g.status = "paused";
        setStatus("paused");
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Persist an in-progress score and release the audio context on unmount.
  useEffect(
    () => () => {
      recordScore(gameRef.current.score);
      synthRef.current?.dispose();
      synthRef.current = null;
    },
    [recordScore],
  );

  const pointerToGameX = (clientX) => {
    const rect = stageRef.current.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * GAME_W;
  };

  const onPointerDown = (event) => {
    if (event.button !== 0) return; // primary button / touch contact only
    unlockAudio();
    const g = gameRef.current;
    // Only treat presses as gameplay input while the paddle is live;
    // overlay buttons handle the other states.
    if (g.status !== "ready" && g.status !== "playing") return;
    draggingRef.current = true;
    stageRef.current?.setPointerCapture?.(event.pointerId);
    movePaddleTo(g, pointerToGameX(event.clientX));
    if (g.status === "ready") launch();
  };

  const onPointerMove = (event) => {
    const g = gameRef.current;
    if (!draggingRef.current && event.pointerType !== "mouse") return;
    if (g.status !== "playing" && g.status !== "ready") return;
    movePaddleTo(g, pointerToGameX(event.clientX));
  };

  const onPointerUp = (event) => {
    draggingRef.current = false;
    const stage = stageRef.current;
    if (stage?.hasPointerCapture?.(event.pointerId)) {
      stage.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <GameShell
      title="Brick Breaker"
      stats={[
        { label: "Score", value: score },
        { label: "Best", value: best ?? 0 },
        { label: "Level", value: `${level}/${LEVEL_COUNT}` },
        { label: "Lives", value: lives },
      ]}
      onRestart={restart}
      paused={status === "paused"}
      onTogglePause={togglePause}
      soundOn={soundOn}
      onToggleSound={toggleSound}
      help="Move the paddle with your mouse, a touch drag, or the arrow keys. Launch with a tap, click, or Space; press P to pause. Catch falling capsules: W widens the paddle, S slows the ball, M splits it into a multiball. Tougher bricks change color as they crack."
    >
      <div
        ref={stageRef}
        className="relative mx-auto w-full max-w-[30rem] touch-none select-none overflow-hidden rounded-lg border border-border"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <canvas
          ref={canvasRef}
          width={GAME_W}
          height={GAME_H}
          role="img"
          aria-label="Brick breaker play area"
          className="block h-auto w-full"
        />

        {status === "ready" ? (
          <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-16">
            <div className="rounded-lg bg-card/90 px-4 py-3 text-center shadow-md">
              <p className="text-sm font-semibold text-foreground">Level {level}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Tap, click, or press Space to launch
              </p>
            </div>
          </div>
        ) : null}

        {status === "paused" ? (
          <GameOverlay title="Paused" actionLabel="Resume" onAction={togglePause}>
            <p className="text-sm text-muted-foreground">
              Press P or the pause button to continue.
            </p>
          </GameOverlay>
        ) : null}

        {status === "cleared" ? (
          <GameOverlay
            title={`Level ${level} cleared!`}
            actionLabel="Next level"
            onAction={nextLevel}
          >
            <p className="text-sm text-muted-foreground">
              Score <span className="font-semibold text-foreground">{score}</span> — the ball
              speeds up next level.
            </p>
          </GameOverlay>
        ) : null}

        {status === "gameover" ? (
          <GameOverlay title="Game over" actionLabel="Play again" onAction={restart}>
            <p className="text-sm text-muted-foreground">
              Final score <span className="font-semibold text-foreground">{score}</span> · Best{" "}
              <span className="font-semibold text-foreground">{best ?? score}</span>
            </p>
          </GameOverlay>
        ) : null}

        {status === "won" ? (
          <GameOverlay title="You smashed every level!" actionLabel="Play again" onAction={restart}>
            <p className="text-sm text-muted-foreground">
              Final score <span className="font-semibold text-foreground">{score}</span> · Best{" "}
              <span className="font-semibold text-foreground">{best ?? score}</span>
            </p>
          </GameOverlay>
        ) : null}
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {STATUS_MESSAGES[status]}
      </p>
    </GameShell>
  );
}
