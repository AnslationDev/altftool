"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Pause, Play, RotateCcw, Timer } from "lucide-react";

import {
  SESSION_PRESETS,
  buildSessionPlan,
  formatClock,
  sessionStatus,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  totalMinutes: "180",
  readingMinutes: "15",
  reviewMinutes: "15",
  checkpointEvery: "30",
};

export default function ToolHome() {
  const [totalMinutes, setTotalMinutes] = useState(DEFAULTS.totalMinutes);
  const [readingMinutes, setReadingMinutes] = useState(DEFAULTS.readingMinutes);
  const [reviewMinutes, setReviewMinutes] = useState(DEFAULTS.reviewMinutes);
  const [checkpointEvery, setCheckpointEvery] = useState(DEFAULTS.checkpointEvery);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      buildSessionPlan({
        totalMinutes: totalMinutes.trim() === "" ? Number.NaN : totalMinutes,
        readingMinutes: readingMinutes.trim() === "" ? Number.NaN : readingMinutes,
        reviewMinutes: reviewMinutes.trim() === "" ? Number.NaN : reviewMinutes,
        checkpointEveryMinutes:
          checkpointEvery.trim() === "" ? Number.NaN : checkpointEvery,
      }),
    [totalMinutes, readingMinutes, reviewMinutes, checkpointEvery],
  );
  const hasError = Boolean(plan.error);

  const status = useMemo(
    () => (hasError ? null : sessionStatus({ elapsedSeconds, plan })),
    [hasError, elapsedSeconds, plan],
  );

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (status?.finished) setRunning(false);
  }, [status?.finished]);

  const applyPreset = (preset) => {
    setTotalMinutes(String(preset.minutes));
    setElapsedSeconds(0);
    setRunning(false);
  };

  const summary = useMemo(() => {
    if (hasError || !status) return "";
    return [
      "Deep work exam session",
      `Length: ${plan.totalMinutes} min (solving ${plan.solvingMinutes} min)`,
      `Elapsed: ${formatClock(status.elapsedSeconds)}`,
      `Remaining: ${formatClock(status.remainingSeconds)}`,
      `Phase: ${status.currentPhaseLabel}`,
      plan.checkpoints.length > 0
        ? `Checkpoints at minute: ${plan.checkpoints.join(", ")}`
        : "No mid-session checkpoints",
    ].join("\n");
  }, [hasError, status, plan]);

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

  const reset = () => {
    setTotalMinutes(DEFAULTS.totalMinutes);
    setReadingMinutes(DEFAULTS.readingMinutes);
    setReviewMinutes(DEFAULTS.reviewMinutes);
    setCheckpointEvery(DEFAULTS.checkpointEvery);
    setElapsedSeconds(0);
    setRunning(false);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          Study habits
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Deep Work Session Timer — Exam Mode
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Run a study block the way a real paper runs: reading time first, a long solving
          phase with pacing checkpoints, and a protected review buffer at the end.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dws-total">
              Session length (minutes)
            </label>
            <input
              id="dws-total"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="30"
              max="360"
              step="5"
              value={totalMinutes}
              onChange={(event) => setTotalMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dws-checkpoint">
              Checkpoint every (minutes)
            </label>
            <input
              id="dws-checkpoint"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="5"
              max="120"
              step="5"
              value={checkpointEvery}
              onChange={(event) => setCheckpointEvery(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dws-reading">
              Reading / planning time (minutes)
            </label>
            <input
              id="dws-reading"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="60"
              step="5"
              value={readingMinutes}
              onChange={(event) => setReadingMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dws-review">
              Final review buffer (minutes)
            </label>
            <input
              id="dws-review"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="60"
              step="5"
              value={reviewMinutes}
              onChange={(event) => setReviewMinutes(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {SESSION_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {hasError || !status ? "Time remaining" : status.currentPhaseLabel}
            </p>
            <p
              className="mt-1 font-mono text-5xl font-semibold tabular-nums text-[var(--primary)]"
              role="timer"
              aria-live="off"
            >
              {hasError || !status ? DASH : formatClock(status.remainingSeconds)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError || !status
                ? "Fix the input above to start the session."
                : status.finished
                  ? "Session complete — put the pen down."
                  : status.nextCheckpointMinute !== null
                    ? `Next pacing checkpoint at minute ${status.nextCheckpointMinute} (in ${formatClock(status.nextCheckpointInSeconds)}).`
                    : `Phase ends in ${formatClock(status.phaseRemainingSeconds)}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRunning((r) => !r)}
              disabled={hasError || (status ? status.finished : false)}
              aria-label={running ? "Pause the session timer" : "Start the session timer"}
              className={`${PRIMARY_BTN} disabled:opacity-50`}
            >
              {running ? (
                <Pause className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Play className="h-4 w-4" aria-hidden="true" />
              )}
              {running ? "Pause" : "Start"}
            </button>
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the session status"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy status"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the timer and all inputs"
              className={GHOST_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && status ? (
          <div className="mt-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="progressbar"
              aria-valuenow={Math.round(status.progressPercent)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Session progress"
            >
              <div
                className="h-full rounded-full bg-[var(--primary)]"
                style={{ width: `${status.progressPercent}%` }}
              />
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Phase
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Window
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Length
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {plan.phases.map((phase) => (
                    <tr
                      key={phase.id}
                      className={`border-b border-[var(--border)] last:border-0 ${
                        status.currentPhaseId === phase.id ? "font-semibold text-[var(--primary)]" : ""
                      }`}
                    >
                      <td className="py-2 pr-3">{phase.label}</td>
                      <td className="py-2 pr-3">
                        min {phase.startMinute}–{phase.endMinute}
                      </td>
                      <td className="py-2 text-right">
                        {phase.endMinute - phase.startMinute} min
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {plan.checkpoints.length > 0 ? (
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                Pacing checkpoints at minute {plan.checkpoints.join(", ")} — glance up and ask
                whether you are where the clock says you should be.
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The default 15-minute reading phase mirrors CBSE board-exam reading time, and the
        final buffer reflects the standard advice to keep the last 10-15 minutes for
        checking answers. The timer keeps running only while this page stays open.
      </p>
    </main>
  );
}
