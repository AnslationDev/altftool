"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Pause, Play, RotateCcw, Volume2, VolumeX, Wind } from "lucide-react";
import {
  BEGINNER_MAX_CYCLES,
  MAX_CYCLES,
  MIN_CYCLES,
  RECOMMENDED_CYCLES,
  buildSession,
  formatClock,
  phaseAtTime,
} from "../lib";

const DASH = "—";
const TICK_MS = 100;

const PACE_OPTIONS = [
  { value: "0.75", label: "Quick (0.75 s per count)" },
  { value: "1", label: "Standard (1 s per count)" },
  { value: "1.25", label: "Relaxed (1.25 s per count)" },
  { value: "1.5", label: "Slow (1.5 s per count)" },
];

const PHASE_TONE = {
  inhale: "text-[var(--primary)]",
  hold: "text-[var(--foreground)]",
  exhale: "text-[var(--success)]",
  done: "text-[var(--primary)]",
};

/** Circle size for each phase, as a fraction of the container. Presentation only. */
const PHASE_SCALE = { inhale: [0.45, 1], hold: [1, 1], exhale: [1, 0.45], done: [0.45, 0.45] };

const SELECT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [cycles, setCycles] = useState(String(RECOMMENDED_CYCLES));
  const [pace, setPace] = useState("1");
  const [soundOn, setSoundOn] = useState(true);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef(null);

  const session = useMemo(
    () => buildSession({ cycles: Number(cycles), secondsPerCount: Number(pace) }),
    [cycles, pace],
  );
  const ok = !session.error;

  const position = useMemo(() => (ok ? phaseAtTime(elapsed, session) : null), [ok, elapsed, session]);

  // Changing the plan restarts the session so the clock never describes an old plan.
  useEffect(() => {
    setRunning(false);
    setElapsed(0);
  }, [cycles, pace]);

  useEffect(() => {
    if (!running || !ok) return undefined;
    const id = setInterval(() => setElapsed((value) => value + TICK_MS / 1000), TICK_MS);
    return () => clearInterval(id);
  }, [running, ok]);

  const finished = Boolean(position && position.done);
  useEffect(() => {
    if (finished) setRunning(false);
  }, [finished]);

  const phaseKey = position ? position.phaseKey : "inhale";
  const cycleNumber = position ? position.cycleNumber : 1;

  // Audio cue on every phase change while the session is running.
  useEffect(() => {
    if (!running || !soundOn) return;
    const ctx = audioRef.current;
    if (!ctx) return;
    const frequency = phaseKey === "inhale" ? 660 : phaseKey === "hold" ? 520 : 392;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.14, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } catch {
      /* audio is a nicety - never break the timer for it */
    }
  }, [phaseKey, cycleNumber, running, soundOn]);

  useEffect(
    () => () => {
      const ctx = audioRef.current;
      if (ctx && typeof ctx.close === "function") ctx.close();
      audioRef.current = null;
    },
    [],
  );

  const start = () => {
    if (!ok) return;
    if (typeof window !== "undefined" && soundOn && !audioRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioRef.current = new Ctx();
    }
    const ctx = audioRef.current;
    if (ctx && ctx.state === "suspended" && typeof ctx.resume === "function") ctx.resume();
    if (finished) setElapsed(0);
    setRunning(true);
  };

  const reset = () => {
    setRunning(false);
    setElapsed(0);
    setCycles(String(RECOMMENDED_CYCLES));
    setPace("1");
    setSoundOn(true);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "4-7-8 Breathing Timer",
      `Pattern: inhale 4, hold 7, exhale 8 (${session.secondsPerCount}s per count)`,
      `Breaths this session: ${session.cycles}`,
      `One breath: ${session.cycleSeconds}s (inhale ${session.phases[0].seconds}s / hold ${session.phases[1].seconds}s / exhale ${session.phases[2].seconds}s)`,
      `Session length: ${formatClock(session.totalSeconds)}`,
      `Breathing rate: ${session.breathsPerMinute} breaths per minute`,
    ].join("\n");
  }, [ok, session]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const scaleRange = PHASE_SCALE[phaseKey] || PHASE_SCALE.done;
  const progress = position ? position.phaseProgress : 0;
  const circleScale = scaleRange[0] + (scaleRange[1] - scaleRange[0]) * Math.min(1, Math.max(0, progress));

  const cycleOptions = [];
  for (let i = MIN_CYCLES; i <= MAX_CYCLES; i += 1) cycleOptions.push(i);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Wind className="h-4 w-4" aria-hidden="true" />
          Breathing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">4-7-8 Breathing Timer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Inhale through the nose for 4 counts, hold for 7, exhale through the mouth for 8. The
          pacer expands, holds and contracts with each phase, with an optional tone at every
          change.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="breath-cycles">
              Breaths in this session
            </label>
            <select
              id="breath-cycles"
              className={`mt-2 ${SELECT_CLASS}`}
              value={cycles}
              onChange={(event) => setCycles(event.target.value)}
            >
              {cycleOptions.map((count) => (
                <option key={count} value={String(count)}>
                  {count} breath{count === 1 ? "" : "s"}
                  {count === RECOMMENDED_CYCLES ? " (recommended)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="breath-pace">
              Pace of one count
            </label>
            <select
              id="breath-pace"
              className={`mt-2 ${SELECT_CLASS}`}
              value={pace}
              onChange={(event) => setPace(event.target.value)}
            >
              {PACE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="breath-sound"
            >
              <input
                id="breath-sound"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={soundOn}
                onChange={(event) => setSoundOn(event.target.checked)}
              />
              {soundOn ? (
                <Volume2 className="h-4 w-4" aria-hidden="true" />
              ) : (
                <VolumeX className="h-4 w-4" aria-hidden="true" />
              )}
              Play a tone at each phase change
            </label>
          </div>
        </div>
      </section>

      {session.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {session.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-col items-center">
          <div className="relative flex h-56 w-56 items-center justify-center">
            <span
              className="absolute h-56 w-56 rounded-full bg-[var(--muted)]"
              aria-hidden="true"
            />
            <span
              className="absolute h-56 w-56 rounded-full bg-[var(--primary)]/25 transition-transform duration-200 ease-linear motion-reduce:transition-none"
              style={{ transform: `scale(${ok ? circleScale : 0.45})` }}
              aria-hidden="true"
            />
            <div className="relative text-center">
              <p
                className={`text-2xl font-semibold ${ok ? PHASE_TONE[phaseKey] || "" : "text-[var(--muted-foreground)]"}`}
              >
                {ok ? position.phaseLabel : DASH}
              </p>
              <p className="mt-1 text-5xl font-semibold tabular-nums">
                {ok ? Math.ceil(position.phaseRemaining) : DASH}
              </p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {ok ? `Breath ${position.cycleNumber} of ${session.cycles}` : "Fix the settings"}
              </p>
            </div>
          </div>

          <p className="mt-4 min-h-[2.5rem] max-w-sm text-center text-sm text-[var(--muted-foreground)]" aria-live="polite">
            {ok ? position.instruction : "Choose a valid number of breaths and pace."}
          </p>

          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {running ? (
              <button
                type="button"
                onClick={() => setRunning(false)}
                aria-label="Pause the breathing session"
                className={PRIMARY_BTN}
              >
                <Pause className="h-4 w-4" aria-hidden="true" />
                Pause
              </button>
            ) : (
              <button
                type="button"
                onClick={start}
                aria-label="Start the breathing session"
                className={PRIMARY_BTN}
                disabled={!ok}
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                {elapsed > 0 && !finished ? "Resume" : "Start"}
              </button>
            )}
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the session plan"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the timer and settings" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-6 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
          <span
            className="block h-full bg-[var(--primary)]"
            style={{ width: `${ok ? Math.min(100, Math.max(0, position.overallProgress * 100)) : 0}%` }}
            aria-hidden="true"
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Time left in session", ok ? formatClock(position.remainingSeconds) : DASH],
            ["Length of one breath", ok ? `${session.cycleSeconds} s` : DASH],
            ["Whole session", ok ? formatClock(session.totalSeconds) : DASH],
            ["Breathing rate", ok ? `${session.breathsPerMinute} breaths / minute` : DASH],
            [
              "Phase split",
              ok
                ? `${session.phases[0].seconds}s in · ${session.phases[1].seconds}s hold · ${session.phases[2].seconds}s out`
                : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && session.aboveBeginnerLimit ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]" role="alert">
            More than {BEGINNER_MAX_CYCLES} breaths in one sitting is beyond the usual beginner
            limit for this pattern. Build up gradually and stop if you feel light-headed.
          </p>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Practise sitting or lying down — the long hold can cause brief
        light-headedness. Stop if you feel dizzy or breathless, and speak to a doctor first if you
        have a respiratory condition, uncontrolled blood pressure, or are pregnant.
      </p>
    </main>
  );
}
