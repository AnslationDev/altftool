"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import GameShell from "@/tools/_shared/game/GameShell";
import useBestScore from "@/tools/_shared/game/useBestScore";
import { WORLD, createRun, getPaletteTarget, tryJump, updateRun } from "../lib/engine";
import { drawScene } from "../lib/render";
import GameAudio from "../lib/sound";

const PRIMARY_BUTTON =
  "inline-flex h-11 min-w-28 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

const TOUCH_BUTTON =
  "flex h-12 flex-1 select-none items-center justify-center gap-1.5 rounded-md border border-border bg-muted text-sm font-semibold text-foreground transition-colors hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export default function DinoDashRunner() {
  // status: "ready" -> "playing" <-> "paused"; "playing" -> "over" -> restart
  const [status, setStatus] = useState("ready");
  const [displayScore, setDisplayScore] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const [newBest, setNewBest] = useState(false);
  const [best, submitBest] = useBestScore("dino-runner");

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const runRef = useRef(null);
  if (runRef.current === null) runRef.current = createRun();
  const statusRef = useRef("ready");
  const inputRef = useRef({ key: false, pointer: false, button: false });
  const paletteMixRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const soundOnRef = useRef(false);
  const bestRef = useRef(null);
  const audioRef = useRef(null);
  const deathAtRef = useRef(0);
  const scoreShownRef = useRef(0);

  useEffect(() => {
    bestRef.current = best;
  }, [best]);

  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);

  const setGameStatus = useCallback((next) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) audioRef.current = new GameAudio();
    if (soundOnRef.current) audioRef.current.unlock();
  }, []);

  const startRun = useCallback(() => {
    runRef.current = createRun();
    inputRef.current = { key: false, pointer: false, button: false };
    scoreShownRef.current = 0;
    setDisplayScore(0);
    setNewBest(false);
    setGameStatus("playing");
  }, [setGameStatus]);

  // Context-aware primary input: start / resume / (delayed) restart / jump.
  const primaryAction = useCallback(() => {
    ensureAudio();
    const current = statusRef.current;
    if (current === "ready") {
      startRun();
      return;
    }
    if (current === "paused") {
      setGameStatus("playing");
      return;
    }
    if (current === "over") {
      // Brief lockout so a frantic last tap cannot instantly restart.
      if (performance.now() - deathAtRef.current > 400) startRun();
      return;
    }
    if (tryJump(runRef.current) && soundOnRef.current) audioRef.current?.jump();
  }, [ensureAudio, setGameStatus, startRun]);

  const handleTogglePause = useCallback(() => {
    if (statusRef.current === "playing") setGameStatus("paused");
    else if (statusRef.current === "paused") setGameStatus("playing");
  }, [setGameStatus]);

  const handleToggleSound = useCallback(() => {
    const next = !soundOnRef.current;
    soundOnRef.current = next;
    setSoundOn(next);
    if (next) {
      if (!audioRef.current) audioRef.current = new GameAudio();
      audioRef.current.unlock();
    }
  }, []);

  // Track prefers-reduced-motion.
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      reducedMotionRef.current = media.matches;
    };
    apply();
    if (media.addEventListener) {
      media.addEventListener("change", apply);
      return () => media.removeEventListener("change", apply);
    }
    media.addListener(apply);
    return () => media.removeListener(apply);
  }, []);

  // Keyboard controls on window.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (event.code === "Space" || event.code === "ArrowUp" || event.code === "KeyW") {
        event.preventDefault();
        if (!event.repeat) primaryAction();
      } else if (event.code === "ArrowDown" || event.code === "KeyS") {
        event.preventDefault();
        inputRef.current.key = true;
      } else if (event.code === "KeyP") {
        event.preventDefault();
        handleTogglePause();
      }
    };
    const onKeyUp = (event) => {
      if (event.code === "ArrowDown" || event.code === "KeyS") {
        inputRef.current.key = false;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [primaryAction, handleTogglePause]);

  // Keep the canvas backing store in sync with its CSS size.
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(container.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(container.clientHeight * dpr));
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Auto-pause when the tab is hidden mid-run.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && statusRef.current === "playing") setGameStatus("paused");
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [setGameStatus]);

  // Main loop: update while playing, always draw (cheap, keeps frame fresh).
  useEffect(() => {
    let raf = 0;
    let last = 0;
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      const run = runRef.current;

      if (statusRef.current === "playing" && dt > 0) {
        const input = inputRef.current;
        const events = updateRun(run, dt, {
          duck: input.key || input.pointer || input.button,
        });
        if (events.includes("crash")) {
          deathAtRef.current = now;
          setGameStatus("over");
          const finalScore = Math.floor(run.score);
          setNewBest(bestRef.current === null || finalScore > bestRef.current);
          submitBest(finalScore);
          if (soundOnRef.current) audioRef.current?.crash();
        } else if (events.includes("milestone") && soundOnRef.current) {
          audioRef.current?.milestone();
        }
        const shown = Math.floor(run.score);
        if (shown !== scoreShownRef.current) {
          scoreShownRef.current = shown;
          setDisplayScore(shown);
        }
      }

      // Day/night crossfade (snaps under reduced motion).
      const target = getPaletteTarget(run.score);
      if (reducedMotionRef.current || dt === 0) {
        paletteMixRef.current = target;
      } else {
        const diff = target - paletteMixRef.current;
        paletteMixRef.current =
          Math.abs(diff) < 0.01
            ? target
            : paletteMixRef.current + Math.sign(diff) * Math.min(Math.abs(diff), dt * 1.4);
      }

      const canvas = canvasRef.current;
      if (!canvas || canvas.width === 0 || canvas.height === 0) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(canvas.width / WORLD.width, 0, 0, canvas.height / WORLD.height, 0, 0);
      drawScene(ctx, run, {
        mix: paletteMixRef.current,
        reducedMotion: reducedMotionRef.current,
        dead: statusRef.current === "over",
      });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [setGameStatus, submitBest]);

  // Release the AudioContext on unmount.
  useEffect(
    () => () => {
      audioRef.current?.dispose();
      audioRef.current = null;
    },
    [],
  );

  // Touch/pointer: top half = jump, bottom half = hold to duck.
  const handlePlayAreaPointerDown = useCallback(
    (event) => {
      event.preventDefault();
      if (statusRef.current !== "playing") {
        primaryAction();
        return;
      }
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientY - rect.top < rect.height / 2) {
        primaryAction();
      } else {
        ensureAudio();
        inputRef.current.pointer = true;
        event.currentTarget.setPointerCapture?.(event.pointerId);
      }
    },
    [ensureAudio, primaryAction],
  );

  const releasePointerDuck = useCallback(() => {
    inputRef.current.pointer = false;
  }, []);

  const releaseButtonDuck = useCallback(() => {
    inputRef.current.button = false;
  }, []);

  return (
    <GameShell
      title="Dino Dash Runner"
      stats={[
        { label: "Score", value: displayScore },
        { label: "Best", value: best ?? "—" },
      ]}
      onRestart={startRun}
      paused={status === "paused"}
      onTogglePause={handleTogglePause}
      soundOn={soundOn}
      onToggleSound={handleToggleSound}
      help="Jump with Space, W, the up arrow, the Jump button, or a tap on the top half of the track. Duck with S, the down arrow, or by holding the Duck button or the bottom half. The pace keeps climbing, and the scenery shifts between day and night every 500 points."
    >
      <div className="flex flex-col gap-2">
        <div
          ref={containerRef}
          className="relative w-full select-none overflow-hidden rounded-lg border border-border bg-muted"
          style={{ aspectRatio: `${WORLD.width} / ${WORLD.height}`, touchAction: "none" }}
          onPointerDown={handlePlayAreaPointerDown}
          onPointerUp={releasePointerDuck}
          onPointerCancel={releasePointerDuck}
          onPointerLeave={releasePointerDuck}
          onContextMenu={(event) => event.preventDefault()}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full"
            role="img"
            aria-label="Endless runner track: a rounded critter sprints past pillars and drones"
          />

          {status !== "playing" ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 p-3">
              <div
                className="w-full max-w-xs rounded-lg border border-border bg-card p-4 text-center shadow-md"
                // Keep the card's buttons single-fire: without this, a press on
                // Start/Resume/Restart bubbles pointerdown to the play area
                // (which starts the run) and the button's own click then lands
                // as an unintended jump.
                onPointerDown={(event) => event.stopPropagation()}
              >
                {status === "ready" ? (
                  <>
                    <h3 className="text-base font-semibold text-foreground">
                      Dino Dash Runner
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Leap over pillars and duck under drones while the pace keeps
                      climbing.
                    </p>
                    <button
                      type="button"
                      className={`${PRIMARY_BUTTON} mt-3`}
                      onClick={primaryAction}
                    >
                      Start run
                    </button>
                  </>
                ) : null}
                {status === "paused" ? (
                  <>
                    <h3 className="text-base font-semibold text-foreground">Paused</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Take a breather — the track will wait.
                    </p>
                    <button
                      type="button"
                      className={`${PRIMARY_BUTTON} mt-3`}
                      onClick={primaryAction}
                    >
                      Resume
                    </button>
                  </>
                ) : null}
                {status === "over" ? (
                  <>
                    <h3 className="text-base font-semibold text-foreground">Run over</h3>
                    {newBest ? (
                      <p className="mt-1 text-xs font-semibold text-primary">
                        New best score!
                      </p>
                    ) : null}
                    <p className="mt-1 text-sm text-muted-foreground">
                      Score{" "}
                      <span className="font-semibold tabular-nums text-foreground">
                        {displayScore}
                      </span>
                      {" · "}Best{" "}
                      <span className="font-semibold tabular-nums text-foreground">
                        {best ?? displayScore}
                      </span>
                    </p>
                    <button
                      type="button"
                      className={`${PRIMARY_BUTTON} mt-3`}
                      onClick={primaryAction}
                    >
                      Restart
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Jump"
            className={TOUCH_BUTTON}
            onPointerDown={(event) => {
              event.preventDefault();
              primaryAction();
            }}
            onClick={(event) => {
              // Keyboard activation (Enter) arrives as a click with detail 0;
              // pointer taps were already handled in onPointerDown.
              if (event.detail === 0) primaryAction();
            }}
            onContextMenu={(event) => event.preventDefault()}
          >
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
            Jump
          </button>
          <button
            type="button"
            aria-label="Hold to duck"
            className={TOUCH_BUTTON}
            onPointerDown={(event) => {
              event.preventDefault();
              ensureAudio();
              inputRef.current.button = true;
            }}
            onPointerUp={releaseButtonDuck}
            onPointerCancel={releaseButtonDuck}
            onPointerLeave={releaseButtonDuck}
            onContextMenu={(event) => event.preventDefault()}
          >
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
            Duck
          </button>
        </div>
      </div>
    </GameShell>
  );
}
