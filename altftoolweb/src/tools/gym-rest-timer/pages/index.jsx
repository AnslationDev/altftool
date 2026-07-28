"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Pause, Play, Plus, RotateCcw, SkipForward, Timer, Trash2 } from "lucide-react";

import {
  DEFAULT_WORK_SEC,
  REST_PRESETS,
  buildQueue,
  formatDuration,
  getPreset,
  offsetOfStep,
  stepAt,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SEED = [
  { id: 1, name: "Back squat", sets: "3", restSec: "180" },
  { id: 2, name: "Bench press", sets: "3", restSec: "180" },
  { id: 3, name: "Barbell row", sets: "3", restSec: "90" },
];

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

function playCue() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.value = 0.12;
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.18);
    window.setTimeout(() => ctx.close(), 500);
  } catch {
    /* audio may be blocked until the user interacts with the page */
  }
}

export default function ToolHome() {
  const [exercises, setExercises] = useState(SEED);
  const [workSec, setWorkSec] = useState(String(DEFAULT_WORK_SEC));
  const [running, setRunning] = useState(false);
  const [baseElapsed, setBaseElapsed] = useState(0);
  const [startedAtMs, setStartedAtMs] = useState(null);
  const [nowMs, setNowMs] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [copied, setCopied] = useState(false);
  const lastStepIndex = useRef(-1);

  const queue = useMemo(
    () =>
      buildQueue({
        exercises: exercises.map((exercise) => ({
          name: exercise.name,
          sets: toNumber(exercise.sets),
          restSec: toNumber(exercise.restSec),
        })),
        workSec: toNumber(workSec),
      }),
    [exercises, workSec]
  );

  const hasError = Boolean(queue.error);

  useEffect(() => {
    if (!running) return undefined;
    setNowMs(Date.now());
    const id = window.setInterval(() => setNowMs(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [running]);

  const elapsed =
    running && startedAtMs !== null
      ? baseElapsed + Math.max(0, (nowMs - startedAtMs) / 1000)
      : baseElapsed;

  const current = useMemo(
    () => (hasError ? { error: queue.error } : stepAt(queue, elapsed)),
    [queue, elapsed, hasError]
  );

  const active = !hasError && !current.error ? current : null;

  useEffect(() => {
    if (!active) return;
    if (lastStepIndex.current === -1) {
      lastStepIndex.current = active.index;
      return;
    }
    if (active.index !== lastStepIndex.current) {
      lastStepIndex.current = active.index;
      if (soundOn && running) playCue();
    }
  }, [active, soundOn, running]);

  // Freeze the clock at the end of the session instead of snapping back to the
  // last manual offset when the interval stops.
  useEffect(() => {
    if (active?.done && running) {
      setBaseElapsed(queue.totalSeconds);
      setStartedAtMs(null);
      setRunning(false);
    }
  }, [active, running, queue.totalSeconds]);

  const start = () => {
    setStartedAtMs(Date.now());
    setNowMs(Date.now());
    setRunning(true);
  };

  const pause = () => {
    setBaseElapsed(elapsed);
    setStartedAtMs(null);
    setRunning(false);
  };

  const resetTimer = () => {
    setBaseElapsed(0);
    setStartedAtMs(null);
    setRunning(false);
    lastStepIndex.current = -1;
  };

  const jumpTo = (index) => {
    if (hasError) return;
    const offset = offsetOfStep(queue, index);
    setBaseElapsed(offset);
    lastStepIndex.current = -1;
    if (running) {
      setStartedAtMs(Date.now());
      setNowMs(Date.now());
    }
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Gym Rest Timer session",
      ...queue.exercises.map(
        (exercise) =>
          `${exercise.name}: ${exercise.sets} sets, ${formatDuration(exercise.restSec)} rest`
      ),
      `Total sets: ${queue.totalSets}`,
      `Estimated session length: ${formatDuration(queue.totalSeconds)}`,
    ].join("\n");
  }, [hasError, queue]);

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

  const resetAll = () => {
    setExercises(SEED);
    setWorkSec(String(DEFAULT_WORK_SEC));
    resetTimer();
    setCopied(false);
  };

  const updateExercise = (id, patch) =>
    setExercises((list) =>
      list.map((exercise) => (exercise.id === id ? { ...exercise, ...patch } : exercise))
    );

  const addExercise = () =>
    setExercises((list) => {
      const nextId = list.reduce((max, exercise) => Math.max(max, exercise.id), 0) + 1;
      return [...list, { id: nextId, name: `Exercise ${list.length + 1}`, sets: "3", restSec: "90" }];
    });

  const removeExercise = (id) =>
    setExercises((list) => (list.length > 1 ? list.filter((exercise) => exercise.id !== id) : list));

  const rows = active
    ? [
        ["Phase", active.done ? "Session complete" : active.step.type === "rest" ? "Resting" : "Working set"],
        [
          "Set",
          active.done
            ? `${queue.totalSets} of ${queue.totalSets}`
            : `${active.step.setNumber} of ${active.step.totalSets} — ${active.step.exerciseName}`,
        ],
        ["Sets completed", `${NUM0.format(active.setsCompleted)} of ${NUM0.format(queue.totalSets)}`],
        ["Time left in the session", formatDuration(active.remainingTotal)],
        ["Total session length", formatDuration(queue.totalSeconds)],
        ["Working time vs rest", `${formatDuration(queue.totalWorkSeconds)} / ${formatDuration(queue.totalRestSeconds)}`],
      ]
    : [
        ["Phase", DASH],
        ["Set", DASH],
        ["Sets completed", DASH],
        ["Time left in the session", DASH],
        ["Total session length", DASH],
        ["Working time vs rest", DASH],
      ];

  const stepProgress =
    active && !active.done && active.step.seconds > 0
      ? Math.max(0, Math.min(100, (active.elapsedInStep / active.step.seconds) * 100))
      : 0;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          Gym programming
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Gym Rest Timer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set a rest interval per exercise and the timer walks the whole session — working set,
          rest, next set — without you touching the phone between rounds. Presets follow the usual
          resistance-training guidance: long rests for heavy work, short rests for endurance.
        </p>
      </header>

      {hasError && (
        <p
          role="alert"
          className="mb-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {queue.error}
        </p>
      )}

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {active && !active.done
                ? active.step.type === "rest"
                  ? `Rest — ${active.step.exerciseName}`
                  : `Set ${active.step.setNumber} — ${active.step.exerciseName}`
                : "Ready"}
            </p>
            <p
              className="mt-1 text-5xl font-semibold tabular-nums text-[var(--primary)]"
              aria-live="polite"
            >
              {active ? formatDuration(active.remainingInStep) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {active
                ? active.done
                  ? "Session complete."
                  : `${formatDuration(active.remainingTotal)} left in the session`
                : "Fix the session below to start the timer."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the session plan"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={resetAll}
              aria-label="Reset the session and the timer"
              className={GHOST_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={`Current interval ${NUM0.format(stepProgress)} percent complete`}
        >
          <span
            className={`block h-full ${
              active && !active.done && active.step.type === "rest"
                ? "bg-[var(--success)]"
                : "bg-[var(--primary)]"
            }`}
            style={{ width: `${stepProgress}%` }}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {running ? (
            <button type="button" onClick={pause} className={PRIMARY_BTN} aria-label="Pause the timer">
              <Pause className="h-4 w-4" aria-hidden="true" />
              Pause
            </button>
          ) : (
            <button
              type="button"
              onClick={start}
              className={PRIMARY_BTN}
              disabled={hasError || Boolean(active?.done)}
              aria-label="Start the timer"
            >
              <Play className="h-4 w-4" aria-hidden="true" />
              Start
            </button>
          )}
          <button
            type="button"
            onClick={() => jumpTo((active?.index ?? 0) + 1)}
            className={GHOST_BTN}
            disabled={hasError || Boolean(active?.done)}
            aria-label="Skip to the next interval"
          >
            <SkipForward className="h-4 w-4" aria-hidden="true" />
            Skip
          </button>
          <button
            type="button"
            onClick={resetTimer}
            className={GHOST_BTN}
            aria-label="Restart the session from the first set"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Restart
          </button>
          <button
            type="button"
            onClick={() => setSoundOn((value) => !value)}
            aria-pressed={soundOn}
            className={GHOST_BTN}
          >
            {soundOn ? "Sound on" : "Sound off"}
          </button>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Rest presets</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Goal
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Usual rest
                </th>
                <th scope="col" className="py-2 font-semibold">
                  When to use it
                </th>
              </tr>
            </thead>
            <tbody>
              {REST_PRESETS.map((preset) => (
                <tr key={preset.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{preset.label}</td>
                  <td className="py-2 pr-3">{preset.range}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{preset.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Session</h2>
        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="timer-workset">
            Typical working set length (seconds)
          </label>
          <input
            id="timer-workset"
            className={`mt-2 ${INPUT_CLASS}`}
            type="number"
            inputMode="numeric"
            min="5"
            max="600"
            step="5"
            value={workSec}
            onChange={(event) => setWorkSec(event.target.value)}
          />
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Used only to estimate how long the session runs; the rest countdowns are what matter.
          </p>
        </div>

        <div className="mt-5 space-y-5">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`timer-name-${exercise.id}`}>
                    Exercise name
                  </label>
                  <input
                    id={`timer-name-${exercise.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={exercise.name}
                    onChange={(event) => updateExercise(exercise.id, { name: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`timer-sets-${exercise.id}`}>
                    Sets
                  </label>
                  <input
                    id={`timer-sets-${exercise.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="20"
                    step="1"
                    value={exercise.sets}
                    onChange={(event) => updateExercise(exercise.id, { sets: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`timer-rest-${exercise.id}`}>
                    Rest between sets (seconds)
                  </label>
                  <input
                    id={`timer-rest-${exercise.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="900"
                    step="15"
                    value={exercise.restSec}
                    onChange={(event) => updateExercise(exercise.id, { restSec: event.target.value })}
                  />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {REST_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() =>
                      updateExercise(exercise.id, { restSec: String(getPreset(preset.id).seconds) })
                    }
                    aria-label={`Set ${exercise.name} rest to ${preset.label}`}
                    className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => removeExercise(exercise.id)}
                  aria-label={`Remove ${exercise.name}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  disabled={exercises.length <= 1}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={addExercise} className={`mt-4 w-full sm:w-auto ${PRIMARY_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add an exercise
        </button>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Rest ranges are general training guidance, not a prescription — heavier loads, larger muscle
        groups and hotter rooms all push the useful rest longer. The timer keeps running only while
        this tab is open.
      </p>
    </main>
  );
}
