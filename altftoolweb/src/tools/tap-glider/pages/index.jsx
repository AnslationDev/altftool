"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameShell from "@/tools/_shared/game/GameShell";
import useBestScore from "@/tools/_shared/game/useBestScore";
import GameOverCard from "../components/GameOverCard";
import createSoundEngine from "../lib/audio";
import {
  GLIDER,
  WORLD,
  makeWorld,
  medalForScore,
  stepFall,
  stepIdle,
  stepWorld,
} from "../lib/engine";
import { drawFrame } from "../lib/render";

const RESTART_INPUT_DELAY_MS = 600;

// State machine: ready -> playing <-> paused; playing -> over -> ready.
export default function TapGlider() {
  const [phase, setPhase] = useState("ready");
  const [score, setScore] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [isNewBest, setIsNewBest] = useState(false);
  const [best, submitBest] = useBestScore("tap-glider");

  const canvasRef = useRef(null);
  const worldRef = useRef(null);
  const phaseRef = useRef("ready");
  const scoreRef = useRef(0);
  const bestRef = useRef(best);
  const soundOnRef = useRef(true);
  const soundRef = useRef(null);
  const reduceMotionRef = useRef(false);
  const overAtRef = useRef(0);

  if (worldRef.current === null) {
    worldRef.current = makeWorld();
  }

  useEffect(() => {
    bestRef.current = best;
  }, [best]);

  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);

  const playSound = useCallback((name) => {
    if (!soundOnRef.current) return;
    if (!soundRef.current) soundRef.current = createSoundEngine();
    soundRef.current[name]();
  }, []);

  const setPhaseBoth = useCallback((next) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const goToReady = useCallback(() => {
    worldRef.current = makeWorld();
    scoreRef.current = 0;
    setScore(0);
    setIsNewBest(false);
    setPhaseBoth("ready");
  }, [setPhaseBoth]);

  const flap = useCallback(() => {
    const world = worldRef.current;
    world.gliderVy = GLIDER.flapVelocity;
    world.wingTime = 0;
    playSound("flap");
  }, [playSound]);

  const endGame = useCallback(() => {
    overAtRef.current = performance.now();
    const finalScore = scoreRef.current;
    setIsNewBest(
      bestRef.current === null ? finalScore > 0 : finalScore > bestRef.current,
    );
    submitBest(finalScore);
    setPhaseBoth("over");
    playSound("hit");
  }, [playSound, setPhaseBoth, submitBest]);

  // One input to rule the whole state machine: tap / click / Space / Up / W.
  const primaryAction = useCallback(() => {
    switch (phaseRef.current) {
      case "ready":
        setPhaseBoth("playing");
        flap();
        break;
      case "playing":
        flap();
        break;
      case "paused":
        setPhaseBoth("playing");
        break;
      case "over":
        if (performance.now() - overAtRef.current > RESTART_INPUT_DELAY_MS) {
          goToReady();
        }
        break;
      default:
        break;
    }
  }, [flap, goToReady, setPhaseBoth]);

  const togglePause = useCallback(() => {
    if (phaseRef.current === "playing") {
      setPhaseBoth("paused");
    } else if (phaseRef.current === "paused") {
      setPhaseBoth("playing");
    }
  }, [setPhaseBoth]);

  const toggleSound = useCallback(() => {
    const next = !soundOnRef.current;
    soundOnRef.current = next;
    setSoundOn(next);
    if (next) {
      // This runs from a click, so it is a valid gesture to unlock audio.
      if (!soundRef.current) soundRef.current = createSoundEngine();
      soundRef.current.unlock();
    }
  }, []);

  // Track prefers-reduced-motion (decorative parallax/bobbing is skipped).
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      reduceMotionRef.current = query.matches;
    };
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  // Keep the canvas backing store crisp at any layout width / DPR.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const resize = () => {
      const cssWidth = canvas.clientWidth;
      if (!cssWidth) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(cssWidth * dpr);
      const height = Math.round(cssWidth * (WORLD.height / WORLD.width) * dpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  // Keyboard controls.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.repeat) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest("button, input, textarea, select, a, [contenteditable]")
      ) {
        return;
      }
      if (event.code === "Space" || event.code === "ArrowUp" || event.code === "KeyW") {
        event.preventDefault();
        primaryAction();
      } else if (event.code === "KeyP") {
        event.preventDefault();
        togglePause();
      } else if (event.code === "Enter" && phaseRef.current === "over") {
        event.preventDefault();
        goToReady();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goToReady, primaryAction, togglePause]);

  // Auto-pause when the tab is hidden mid-run.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && phaseRef.current === "playing") {
        setPhaseBoth("paused");
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [setPhaseBoth]);

  // Main loop: simulate by phase, then paint. Runs while mounted; a single
  // cancelAnimationFrame cleans it up.
  useEffect(() => {
    let rafId = 0;
    let last = performance.now();

    const update = (dt) => {
      const world = worldRef.current;
      switch (phaseRef.current) {
        case "ready":
          stepIdle(world, dt, reduceMotionRef.current);
          break;
        case "playing": {
          const result = stepWorld(world, dt, scoreRef.current);
          if (result.scored > 0) {
            scoreRef.current += result.scored;
            setScore(scoreRef.current);
            playSound("score");
          }
          if (result.dead) endGame();
          break;
        }
        case "over":
          stepFall(world, dt);
          break;
        default:
          break; // paused: freeze the world
      }
    };

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas || canvas.width === 0) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const scale = canvas.width / WORLD.width;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      drawFrame(ctx, worldRef.current, {
        phase: phaseRef.current,
        reduceMotion: reduceMotionRef.current,
      });
    };

    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.032);
      last = now;
      update(dt);
      draw();
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [endGame, playSound]);

  // Release the audio context on unmount.
  useEffect(() => {
    return () => {
      soundRef.current?.dispose();
      soundRef.current = null;
    };
  }, []);

  const handlePointerDown = useCallback(
    (event) => {
      event.preventDefault();
      primaryAction();
    },
    [primaryAction],
  );

  const stopPointer = useCallback((event) => {
    event.stopPropagation();
  }, []);

  return (
    <GameShell
      title="Tap Glider"
      stats={[
        { label: "Score", value: score },
        { label: "Best", value: best ?? "–" },
      ]}
      onRestart={goToReady}
      paused={phase === "paused"}
      onTogglePause={togglePause}
      soundOn={soundOn}
      onToggleSound={toggleSound}
      help="Tap, click, or press Space / Up / W to flap and glide through the gaps — each gap is a point, and the gaps slowly narrow. Press P to pause. Medals: Bronze 10+, Silver 20+, Gold 40+."
    >
      <div
        className="relative mx-auto w-full max-w-[420px] touch-none select-none"
        onPointerDown={handlePointerDown}
      >
        <canvas
          ref={canvasRef}
          width={WORLD.width}
          height={WORLD.height}
          className="block aspect-[3/4] h-auto w-full rounded-lg"
          role="img"
          aria-label="Tap Glider play area: a glider flying between pillar gaps"
        />

        <p className="sr-only" role="status">
          {phase === "over"
            ? `Flight over. Final score ${score}.`
            : phase === "paused"
              ? "Game paused."
              : ""}
        </p>

        {phase === "ready" ? (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-xs rounded-lg border border-border bg-card/90 p-5 text-center shadow-md backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-foreground">Ready to glide?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Tap, click, or press Space to flap. Slip through the gaps to score.
              </p>
              <button
                type="button"
                onClick={primaryAction}
                onPointerDown={stopPointer}
                className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Start flying
              </button>
              <p className="mt-3 animate-pulse text-xs text-muted-foreground motion-reduce:animate-none">
                or tap anywhere to take off
              </p>
            </div>
          </div>
        ) : null}

        {phase === "paused" ? (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/50 p-4">
            <div className="rounded-lg border border-border bg-card px-6 py-4 text-center shadow-md">
              <p className="text-base font-semibold text-foreground">Paused</p>
              <p className="mt-1 text-xs text-muted-foreground">Tap or press P to resume</p>
            </div>
          </div>
        ) : null}

        {phase === "over" ? (
          <GameOverCard
            score={score}
            best={best}
            isNewBest={isNewBest}
            medal={medalForScore(score)}
            onPlayAgain={goToReady}
          />
        ) : null}
      </div>
    </GameShell>
  );
}
