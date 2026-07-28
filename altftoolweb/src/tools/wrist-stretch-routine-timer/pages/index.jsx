"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Hand, Pause, Play, RotateCcw, SkipForward } from "lucide-react";

import {
  DEFAULT_HOLD_SECONDS,
  DEFAULT_REST_SECONDS,
  MAX_HOLD_SECONDS,
  MAX_REST_SECONDS,
  MIN_HOLD_SECONDS,
  MIN_REST_SECONDS,
  ROUTINE_LEVELS,
  SUGGESTED_BREAK_INTERVAL_MIN,
  buildRoutine,
  formatMmSs,
  stepAtElapsed,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [levelId, setLevelId] = useState("standard");
  const [holdSeconds, setHoldSeconds] = useState(String(DEFAULT_HOLD_SECONDS));
  const [restSeconds, setRestSeconds] = useState(String(DEFAULT_REST_SECONDS));
  const [includeNerveGlides, setIncludeNerveGlides] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const routine = useMemo(
    () => buildRoutine({ levelId, holdSeconds, restSeconds, includeNerveGlides }),
    [levelId, holdSeconds, restSeconds, includeNerveGlides],
  );

  const hasError = Boolean(routine.error);
  const totalSeconds = hasError ? 0 : routine.totalSeconds;

  // Any change to the routine shape restarts the session.
  useEffect(() => {
    setElapsed(0);
    setRunning(false);
  }, [levelId, holdSeconds, restSeconds, includeNerveGlides]);

  useEffect(() => {
    if (!running || hasError) return undefined;
    const id = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(id);
  }, [running, hasError]);

  useEffect(() => {
    if (totalSeconds > 0 && elapsed >= totalSeconds) setRunning(false);
  }, [elapsed, totalSeconds]);

  const current = hasError ? { error: routine.error } : stepAtElapsed(routine, elapsed);
  const currentStep = current.error ? null : current.step;
  const finished = Boolean(current.done);

  const skipStep = () => {
    if (hasError || !currentStep) return;
    setElapsed(Math.min(totalSeconds, currentStep.end));
  };

  const restart = () => {
    setElapsed(0);
    setRunning(false);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Wrist Stretch Routine — ${routine.levelLabel}`,
      `Total: ${formatMmSs(routine.totalSeconds)} · ${routine.stretchCount} stretch steps · ${routine.holdSeconds}s holds`,
      "",
      ...routine.steps
        .filter((step) => step.kind === "stretch")
        .map((step, index) => `${index + 1}. ${step.name} — ${step.seconds}s`),
    ].join("\n");
  }, [hasError, routine]);

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

  const rows = hasError
    ? [
        ["Stretch steps", DASH],
        ["Time actually stretching", DASH],
        ["Changeover time", DASH],
        ["Hold length", DASH],
        ["Three sessions a day", DASH],
      ]
    : [
        ["Stretch steps", `${routine.stretchCount}`],
        ["Time actually stretching", formatMmSs(routine.stretchSeconds)],
        ["Changeover time", formatMmSs(routine.restTotalSeconds)],
        ["Hold length", `${routine.holdSeconds} seconds`],
        ["Three sessions a day", formatMmSs(routine.dailySeconds)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Hand className="h-4 w-4" aria-hidden="true" />
          Posture &amp; ergonomics
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Wrist Stretch Routine Timer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A guided wrist and forearm sequence with per-side holds and changeover gaps. Set the hold
          length, press start and follow the cue on screen — no counting in your head.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="wsr-level">
              Routine
            </label>
            <select
              id="wsr-level"
              className={`mt-2 ${INPUT_CLASS}`}
              value={levelId}
              onChange={(event) => setLevelId(event.target.value)}
            >
              {ROUTINE_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label} — {level.blurb}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wsr-hold">
              Hold each stretch (seconds)
            </label>
            <input
              id="wsr-hold"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_HOLD_SECONDS}
              max={MAX_HOLD_SECONDS}
              step="5"
              value={holdSeconds}
              onChange={(event) => setHoldSeconds(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wsr-rest">
              Changeover gap (seconds)
            </label>
            <input
              id="wsr-rest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_REST_SECONDS}
              max={MAX_REST_SECONDS}
              step="5"
              value={restSeconds}
              onChange={(event) => setRestSeconds(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label
              className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)]"
              htmlFor="wsr-nerve"
            >
              <input
                id="wsr-nerve"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={includeNerveGlides}
                onChange={(event) => setIncludeNerveGlides(event.target.checked)}
              />
              Include median nerve glides (full session only)
            </label>
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {routine.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {hasError ? "Routine length" : finished ? "Session complete" : "Time left in this step"}
            </p>
            <p className="mt-1 text-5xl font-semibold tabular-nums text-[var(--primary)]">
              {hasError ? DASH : finished ? formatMmSs(0) : formatMmSs(current.remainingInStep)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Adjust the settings above to build a routine."
                : `${formatMmSs(current.remainingTotal ?? 0)} left of ${formatMmSs(totalSeconds)} total`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the stretch routine"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy routine"}
            </button>
            <button type="button" onClick={restart} aria-label="Reset the timer" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <>
            <div
              className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(current.progressPct ?? 0)}
              aria-label="Routine progress"
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, current.progressPct ?? 0))}%` }}
              />
            </div>

            <div
              className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
              aria-live="polite"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                {finished ? "Finished" : currentStep.kind === "rest" ? "Changeover" : "Now"}
              </p>
              <p className="mt-1 text-lg font-semibold">
                {finished ? "Routine complete — shake the hands out and get back to it." : currentStep.name}
              </p>
              {!finished && (
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{currentStep.cue}</p>
              )}
              {!finished && currentStep.caution && (
                <p className="mt-2 text-sm leading-6 font-medium text-[var(--danger)]">
                  {currentStep.caution}
                </p>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setRunning((value) => !value)}
                aria-label={running ? "Pause the routine" : "Start the routine"}
                className={PRIMARY_BTN}
                disabled={finished}
              >
                {running ? (
                  <Pause className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Play className="h-4 w-4" aria-hidden="true" />
                )}
                {running ? "Pause" : elapsed > 0 ? "Resume" : "Start"}
              </button>
              <button
                type="button"
                onClick={skipStep}
                aria-label="Skip to the next step"
                className={GHOST_BTN}
                disabled={finished}
              >
                <SkipForward className="h-4 w-4" aria-hidden="true" />
                Next step
              </button>
            </div>
          </>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">The sequence</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    #
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Stretch
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Hold
                  </th>
                </tr>
              </thead>
              <tbody>
                {routine.steps
                  .filter((step) => step.kind === "stretch")
                  .map((step, index) => (
                    <tr key={step.key} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{index + 1}</td>
                      <td className="py-2 pr-3">{step.name}</td>
                      <td className="py-2 text-right text-[var(--muted-foreground)] whitespace-nowrap">
                        {step.seconds}s
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            For sustained keyboard and mouse work, take a short break away from the keys roughly
            every {SUGGESTED_BREAK_INTERVAL_MIN} minutes; this routine fits inside one of them.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical advice. Stretch to a comfortable pull, never into pain. If
        you have persistent wrist or hand pain, numbness, tingling or weakness, stop and get it
        assessed by a clinician or hand therapist before continuing.
      </p>
    </main>
  );
}
