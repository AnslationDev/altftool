"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Pause, PersonStanding, Play, RotateCcw } from "lucide-react";

import {
  ROUTINE_LEVELS,
  buildRoutine,
  formatMmSs,
  planBreaks,
  stepAtElapsed,
} from "../lib";

const DEFAULTS = {
  levelId: "standard",
  holdSeconds: "25",
  restSeconds: "5",
  workdayHours: "8",
  blockMinutes: "50",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const routine = useMemo(
    () =>
      buildRoutine({
        levelId: values.levelId,
        holdSeconds: values.holdSeconds,
        restSeconds: values.restSeconds,
      }),
    [values.holdSeconds, values.levelId, values.restSeconds],
  );

  const hasError = Boolean(routine.error);
  const current = useMemo(() => stepAtElapsed(routine, elapsed), [elapsed, routine]);
  const breaks = useMemo(
    () =>
      planBreaks({
        workdayHours: values.workdayHours,
        blockMinutes: values.blockMinutes,
        routineSeconds: hasError ? 0 : routine.totalSeconds,
      }),
    [hasError, routine.totalSeconds, values.blockMinutes, values.workdayHours],
  );

  useEffect(() => {
    if (!running || hasError) return undefined;
    const id = window.setInterval(() => {
      setElapsed((currentElapsed) => {
        const next = currentElapsed + 1;
        if (next >= routine.totalSeconds) {
          window.clearInterval(id);
          setRunning(false);
          return routine.totalSeconds;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [hasError, routine.totalSeconds, running]);

  useEffect(() => {
    setElapsed(0);
    setRunning(false);
  }, [values.holdSeconds, values.levelId, values.restSeconds]);

  const update = (key, value) => {
    setValues((currentValues) => ({ ...currentValues, [key]: value }));
  };

  const reset = () => {
    setValues(DEFAULTS);
    setElapsed(0);
    setRunning(false);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Neck and Shoulder Stretch Timer",
      `Routine: ${routine.levelLabel}`,
      `Total time: ${formatMmSs(routine.totalSeconds)}`,
      `Stretch steps: ${routine.stretchCount}`,
      `Daily breaks: ${breaks.error ? "not scheduled" : breaks.breaks}`,
      "",
      ...routine.steps.map((step) => `${step.name} — ${formatMmSs(step.seconds)}: ${step.cue}`),
    ].join("\n");
  }, [breaks, hasError, routine]);

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

  const progress = hasError ? 0 : Math.min(100, Math.round((elapsed / routine.totalSeconds) * 100));
  const step = current?.step;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PersonStanding className="h-4 w-4" aria-hidden="true" />
          Micro break timer
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Neck and Shoulder Stretch Timer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Run a gentle desk-friendly release sequence and see how many breaks fit between your
          focus blocks.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="stretch-level">
              Routine
            </label>
            <select id="stretch-level" className={`mt-2 ${INPUT_CLASS}`} value={values.levelId} onChange={(event) => update("levelId", event.target.value)}>
              {ROUTINE_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label} — {level.blurb}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stretch-hold">
              Hold length (seconds)
            </label>
            <input id="stretch-hold" className={`mt-2 ${INPUT_CLASS}`} type="number" min="10" max="45" step="5" value={values.holdSeconds} onChange={(event) => update("holdSeconds", event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stretch-rest">
              Changeover (seconds)
            </label>
            <input id="stretch-rest" className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" max="30" step="5" value={values.restSeconds} onChange={(event) => update("restSeconds", event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stretch-workday">
              Workday (hours)
            </label>
            <input id="stretch-workday" className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" max="16" step="0.5" value={values.workdayHours} onChange={(event) => update("workdayHours", event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stretch-block">
              Focus block length (minutes)
            </label>
            <input id="stretch-block" className={`mt-2 ${INPUT_CLASS}`} type="number" min="15" max="180" step="5" value={values.blockMinutes} onChange={(event) => update("blockMinutes", event.target.value)} />
          </div>
        </div>
      </section>

      {hasError && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {routine.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Current step
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : current.done ? "Done" : step?.name}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the settings above to start." : step?.cue}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setRunning((value) => !value)} disabled={hasError} className={`${PRIMARY_BTN} disabled:opacity-50`}>
              {running ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
              {running ? "Pause" : "Start"}
            </button>
            <button type="button" onClick={() => { setElapsed(0); setRunning(false); }} className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Restart
            </button>
          </div>
        </div>

        <div className="mt-5">
          <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-soft)]">
            <div className="h-full rounded-full bg-[var(--primary)] transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-xs text-[var(--muted-foreground)]">
            <span>{hasError ? DASH : formatMmSs(elapsed)}</span>
            <span>{hasError ? DASH : formatMmSs(routine.totalSeconds)}</span>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            ["Routine length", hasError ? DASH : formatMmSs(routine.totalSeconds)],
            ["Stretch steps", hasError ? DASH : String(routine.stretchCount)],
            ["Daily breaks", breaks.error ? DASH : String(breaks.breaks)],
            ["Stretch share", breaks.error ? DASH : `${NUM1.format(breaks.stretchSharePct)}% of the workday`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-[var(--background)] p-3 ring-1 ring-[var(--border)]">
              <dt className="text-xs font-medium text-[var(--muted-foreground)]">{label}</dt>
              <dd className="mt-1 text-sm font-semibold text-[var(--foreground)]">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={copyResult} disabled={hasError} className={`${GHOST_BTN} disabled:opacity-50`}>
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy routine"}
          </button>
          <button type="button" onClick={reset} className={GHOST_BTN}>
            Reset settings
          </button>
        </div>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Routine steps</h2>
          <ol className="mt-3 space-y-2">
            {routine.steps.map((item) => (
              <li key={item.key} className="rounded-lg bg-[var(--background)] p-3 ring-1 ring-[var(--border)]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{formatMmSs(item.seconds)}</p>
                </div>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{item.cue}</p>
                {item.caution && (
                  <p className="mt-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-xs font-medium text-[var(--warning)]">
                    {item.caution}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        No step rolls the head backwards through a full circle, since full neck circles compress the
        joints at the back of the neck. Informational only, not medical advice — move within a
        comfortable range and stop if a stretch causes pain, dizziness or tingling down the arm.
        Persistent neck pain, headaches or arm symptoms should be assessed by a clinician or
        physiotherapist.
      </p>
    </main>
  );
}
