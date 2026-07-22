"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Crosshair, Play, Timer } from "lucide-react";
import GameShell from "@/tools/_shared/game/GameShell";
import useBestScore from "@/tools/_shared/game/useBestScore";
import TargetDisc from "../components/TargetDisc";
import ResultsCard from "../components/ResultsCard";
import { closeAudio, sfx, unlockAudio } from "../lib/audio";
import {
  MIN_TARGET_PX,
  PRECISION_LIVES,
  TIMED_DURATION_MS,
  precisionLifetimeMs,
  precisionMaxSize,
  precisionSizeAt,
  randomTargetPosition,
  timedTargetSize,
} from "../lib/game";

const MODE_META = {
  timed: {
    label: "Timed · 30 seconds",
    icon: Timer,
    blurb:
      "Pop as many targets as you can before the clock runs out. Shots that hit empty space count as misses.",
  },
  precision: {
    label: "Precision",
    icon: Crosshair,
    blurb:
      "Each target swells, then shrinks away. One stray shot — or three escaped targets — ends the run.",
  },
};

const FRESH_STATS = () => ({ hits: 0, misses: 0, vanished: 0, totalHitMs: 0 });

export default function AimTrainerGame() {
  const [mode, setMode] = useState("timed");
  const [status, setStatus] = useState("ready"); // ready | playing | paused | over
  const [soundOn, setSoundOn] = useState(true);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [vanished, setVanished] = useState(0);
  const [clockTenths, setClockTenths] = useState(TIMED_DURATION_MS / 100);
  const [target, setTarget] = useState(null);
  const [, setFrame] = useState(0); // re-render driver for the precision animation
  const [effects, setEffects] = useState([]);
  const [results, setResults] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const [bestTimed, submitTimed] = useBestScore("aim-trainer-timed");
  const [bestPrecision, submitPrecision] = useBestScore("aim-trainer-precision");
  const best = mode === "timed" ? bestTimed : bestPrecision;

  const arenaRef = useRef(null);
  const arenaSizeRef = useRef({ w: 0, h: 0 });
  const statusRef = useRef(status);
  const modeRef = useRef(mode);
  const soundRef = useRef(soundOn);
  const targetRef = useRef(null);
  const statsRef = useRef(FRESH_STATS());
  const timeLeftRef = useRef(TIMED_DURATION_MS);
  const idRef = useRef(0);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  useEffect(() => {
    soundRef.current = soundOn;
  }, [soundOn]);

  // Track the arena's rendered size so spawns and target sizes scale with it.
  useEffect(() => {
    const node = arenaRef.current;
    if (!node) return undefined;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect) return;
      arenaSizeRef.current = { w: rect.width, h: rect.height };
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  // Release the AudioContext when the tool unmounts.
  useEffect(() => () => closeAudio(), []);

  const play = useCallback((name, ...args) => {
    if (soundRef.current) sfx[name]?.(...args);
  }, []);

  const addEffect = useCallback((type, x, y) => {
    const id = ++idRef.current;
    setEffects((prev) => [
      ...prev.slice(-11),
      { id, type, x, y, until: performance.now() + 450 },
    ]);
  }, []);

  const spawnTarget = useCallback(() => {
    const { w, h } = arenaSizeRef.current;
    const currentMode = modeRef.current;
    const maxSize = currentMode === "timed" ? timedTargetSize(w) : precisionMaxSize(w);
    const lifetime =
      currentMode === "timed" ? Infinity : precisionLifetimeMs(statsRef.current.hits);
    const { x, y } = randomTargetPosition(w || 320, h || 320, maxSize);
    const next = { id: ++idRef.current, x, y, age: 0, lifetime, maxSize };
    targetRef.current = next;
    setTarget(next);
  }, []);

  const endRun = useCallback(
    (reason) => {
      const stats = statsRef.current;
      const shots = stats.hits + stats.misses;
      const accuracy = shots > 0 ? Math.round((stats.hits / shots) * 100) : 0;
      const avgMs = stats.hits > 0 ? Math.round(stats.totalHitMs / stats.hits) : null;
      const currentMode = modeRef.current;
      const score = stats.hits;
      const prevBest = currentMode === "timed" ? bestTimed : bestPrecision;
      const isNewBest = score > 0 && (prevBest === null || score > prevBest);
      (currentMode === "timed" ? submitTimed : submitPrecision)(score);
      targetRef.current = null;
      setTarget(null);
      setEffects([]);
      setResults({ reason, score, accuracy, avgMs, isNewBest, hits: stats.hits });
      statusRef.current = "over";
      setStatus("over");
      play(isNewBest ? "best" : "over");
    },
    [bestTimed, bestPrecision, submitTimed, submitPrecision, play],
  );

  const handleVanish = useCallback(() => {
    const stats = statsRef.current;
    stats.vanished += 1;
    setVanished(stats.vanished);
    const escaped = targetRef.current;
    if (escaped) addEffect("vanish", escaped.x, escaped.y);
    play("vanish");
    if (stats.vanished >= PRECISION_LIVES) {
      endRun("escaped");
    } else {
      spawnTarget();
    }
  }, [addEffect, play, endRun, spawnTarget]);

  const startRun = useCallback(() => {
    statsRef.current = FRESH_STATS();
    timeLeftRef.current = TIMED_DURATION_MS;
    setHits(0);
    setMisses(0);
    setVanished(0);
    setClockTenths(TIMED_DURATION_MS / 100);
    setResults(null);
    setEffects([]);
    if (soundRef.current) unlockAudio();
    spawnTarget();
    statusRef.current = "playing";
    setStatus("playing");
    play("start");
  }, [spawnTarget, play]);

  const resetToReady = useCallback(() => {
    statusRef.current = "ready";
    setStatus("ready");
    targetRef.current = null;
    setTarget(null);
    setEffects([]);
    setResults(null);
    statsRef.current = FRESH_STATS();
    timeLeftRef.current = TIMED_DURATION_MS;
    setHits(0);
    setMisses(0);
    setVanished(0);
    setClockTenths(TIMED_DURATION_MS / 100);
  }, []);

  const togglePause = useCallback(() => {
    const current = statusRef.current;
    if (current !== "playing" && current !== "paused") return;
    const next = current === "playing" ? "paused" : "playing";
    statusRef.current = next;
    setStatus(next);
  }, []);

  const toggleSound = useCallback(() => {
    const next = !soundRef.current;
    soundRef.current = next;
    setSoundOn(next);
    if (next) unlockAudio();
  }, []);

  const selectMode = useCallback((nextMode) => {
    modeRef.current = nextMode;
    setMode(nextMode);
  }, []);

  const handleTargetHit = useCallback(
    (event, targetId) => {
      event.stopPropagation();
      if (event.button != null && event.button !== 0) return;
      if (statusRef.current !== "playing") return;
      const hitTarget = targetRef.current;
      // Ignore taps on a disc that was already popped this frame (e.g. a second
      // simultaneous touch) so a multi-touch tap can't double-count hits.
      if (!hitTarget || hitTarget.id !== targetId) return;
      const stats = statsRef.current;
      stats.hits += 1;
      stats.totalHitMs += hitTarget.age;
      setHits(stats.hits);
      addEffect("pop", hitTarget.x, hitTarget.y);
      play("hit", stats.hits);
      spawnTarget();
    },
    [addEffect, play, spawnTarget],
  );

  const handleArenaMiss = useCallback(
    (event) => {
      if (event.button != null && event.button !== 0) return;
      if (statusRef.current !== "playing") return;
      const rect = arenaRef.current?.getBoundingClientRect();
      const x = rect ? event.clientX - rect.left : 0;
      const y = rect ? event.clientY - rect.top : 0;
      const stats = statsRef.current;
      stats.misses += 1;
      setMisses(stats.misses);
      addEffect("miss", x, y);
      play("miss");
      if (modeRef.current === "precision") endRun("missed");
    },
    [addEffect, play, endRun],
  );

  // Main loop: delta-time accumulation means pausing simply stops the clock.
  useEffect(() => {
    if (status !== "playing") return undefined;
    let raf = 0;
    let last = performance.now();
    const step = (now) => {
      const delta = Math.min(100, Math.max(0, now - last));
      last = now;
      const liveTarget = targetRef.current;
      if (liveTarget) liveTarget.age += delta;

      if (modeRef.current === "timed") {
        timeLeftRef.current = Math.max(0, timeLeftRef.current - delta);
        const tenths = Math.ceil(timeLeftRef.current / 100);
        setClockTenths((prev) => (prev === tenths ? prev : tenths));
        if (timeLeftRef.current <= 0) {
          endRun("time");
          return;
        }
      } else {
        if (liveTarget && liveTarget.age >= liveTarget.lifetime) {
          handleVanish();
          if (statusRef.current !== "playing") return;
        }
        setFrame((frame) => (frame + 1) % 1000000);
      }

      setEffects((prev) =>
        prev.length && prev.some((fx) => fx.until <= now)
          ? prev.filter((fx) => fx.until > now)
          : prev,
      );
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [status, endRun, handleVanish]);

  // Keyboard: Space/Enter start · pause · restart, 1/2 pick a mode, P pauses.
  useEffect(() => {
    const onKey = (event) => {
      if (event.repeat) return;
      const el = event.target;
      if (
        el instanceof HTMLElement &&
        el.closest("button, a, input, select, textarea, [contenteditable]")
      ) {
        return;
      }
      const current = statusRef.current;
      if (event.code === "Space" || event.code === "Enter") {
        event.preventDefault();
        if (current === "ready" || current === "over") startRun();
        else togglePause();
      } else if (event.code === "Digit1" || event.code === "Digit2") {
        if (current === "ready" || current === "over") {
          event.preventDefault();
          selectMode(event.code === "Digit1" ? "timed" : "precision");
        }
      } else if (event.code === "KeyP") {
        if (current === "playing" || current === "paused") {
          event.preventDefault();
          togglePause();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [startRun, togglePause, selectMode]);

  // Current visual size/opacity of the live target (precision animates).
  let targetSize = 0;
  let targetOpacity = 1;
  if (target) {
    // `target` is the same object the rAF loop mutates (spawnTarget stores one
    // object in both the ref and state), and the `frame` tick re-renders, so
    // the state value always carries the freshest `age`.
    const live = target;
    if (mode === "timed") {
      targetSize = live.maxSize;
    } else {
      targetSize = precisionSizeAt(live.age, live.lifetime, live.maxSize);
      const progress = live.age / live.lifetime;
      targetOpacity = progress > 0.85 ? Math.max(0.45, 1 - (progress - 0.85) * 3) : 1;
    }
  }

  const shots = hits + misses;
  const accuracy = shots > 0 ? Math.round((hits / shots) * 100) : null;
  const stats = [
    { label: "Score", value: hits },
    mode === "timed"
      ? { label: "Time", value: `${(clockTenths / 10).toFixed(1)}s` }
      : {
          label: "Lives",
          value: `${Math.max(0, PRECISION_LIVES - vanished)}/${PRECISION_LIVES}`,
        },
    { label: "Acc", value: accuracy === null ? "—" : `${accuracy}%` },
    { label: "Best", value: best === null ? "—" : best },
  ];

  return (
    <GameShell
      title="Aim Trainer"
      stats={stats}
      onRestart={status === "ready" ? undefined : resetToReady}
      paused={status === "paused"}
      onTogglePause={status === "playing" || status === "paused" ? togglePause : undefined}
      soundOn={soundOn}
      onToggleSound={toggleSound}
      help="Timed: pop as many targets as you can in 30 seconds — shots on empty space count as misses. Precision: each target grows then shrinks away; one stray shot or three escaped targets ends the run. Space starts or pauses, 1 and 2 pick a mode, and your best score is saved on this device."
    >
      <style>{`
        @keyframes aimtr-pop {
          from { transform: translate(-50%, -50%) scale(0.4); opacity: 0.9; }
          to { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
        }
        @keyframes aimtr-fade {
          from { opacity: 0.9; }
          to { opacity: 0; }
        }
      `}</style>
      <div
        ref={arenaRef}
        onPointerDown={handleArenaMiss}
        onContextMenu={(event) => {
          if (statusRef.current === "playing") event.preventDefault();
        }}
        role="region"
        aria-label="Aim trainer arena. Click or tap the targets."
        className="relative aspect-square w-full touch-manipulation select-none overflow-hidden rounded-lg sm:aspect-[16/10]"
        style={{
          cursor: "crosshair",
          // Play-area art: fixed dark range backdrop, legible in both themes.
          background:
            "radial-gradient(120% 120% at 50% 35%, #1d3252 0%, #14213c 55%, #0c1428 100%)",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148, 184, 255, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 184, 255, 0.07) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        {target && status !== "over" ? (
          <TargetDisc
            x={target.x}
            y={target.y}
            size={Math.max(MIN_TARGET_PX, targetSize)}
            opacity={targetOpacity}
            onHit={(event) => handleTargetHit(event, target.id)}
          />
        ) : null}

        {effects.map((fx) => {
          if (fx.type === "miss") {
            return (
              <span
                key={fx.id}
                aria-hidden="true"
                className="pointer-events-none absolute text-lg font-bold"
                style={{
                  left: fx.x,
                  top: fx.y,
                  transform: "translate(-50%, -50%)",
                  color: "#fb7185",
                  opacity: reducedMotion ? 0.7 : undefined,
                  animation: reducedMotion ? undefined : "aimtr-fade 450ms ease-out forwards",
                }}
              >
                ✕
              </span>
            );
          }
          return (
            <span
              key={fx.id}
              aria-hidden="true"
              className="pointer-events-none absolute rounded-full"
              style={{
                left: fx.x,
                top: fx.y,
                width: 44,
                height: 44,
                transform: "translate(-50%, -50%)",
                border: `3px solid ${fx.type === "pop" ? "#fbbf24" : "#94a3b8"}`,
                opacity: reducedMotion ? 0.7 : undefined,
                animation: reducedMotion ? undefined : "aimtr-pop 450ms ease-out forwards",
              }}
            />
          );
        })}

        {status === "ready" ? (
          <div className="absolute inset-0 flex items-center justify-center overflow-y-auto p-3">
            <div className="w-full max-w-sm rounded-lg border border-border bg-card/95 p-4 shadow-md backdrop-blur-sm">
              <p className="text-center text-sm font-semibold text-foreground">Choose a mode</p>
              <div className="mt-3 grid gap-2">
                {Object.entries(MODE_META).map(([key, meta]) => {
                  const Icon = meta.icon;
                  const selected = mode === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => selectMode(key)}
                      aria-pressed={selected}
                      className={`rounded-md border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                        selected
                          ? "border-primary bg-primary/10"
                          : "border-border bg-muted hover:bg-muted/70"
                      }`}
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        {meta.label}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                        {meta.blurb}
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={startRun}
                className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                Start
              </button>
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                Space to start · 1 / 2 to switch modes
              </p>
            </div>
          </div>
        ) : null}

        {status === "paused" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-card/70 p-4 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-5 shadow-md">
              <p className="text-base font-semibold text-foreground">Paused</p>
              <button
                type="button"
                onClick={togglePause}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                Resume
              </button>
            </div>
          </div>
        ) : null}

        {status === "over" && results ? (
          <ResultsCard
            results={results}
            best={best}
            onPlayAgain={startRun}
            onChangeMode={resetToReady}
          />
        ) : null}
      </div>
    </GameShell>
  );
}
