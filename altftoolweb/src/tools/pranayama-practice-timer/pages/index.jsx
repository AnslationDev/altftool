"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Pause, Play, RotateCcw, Wind } from "lucide-react";

import {
  PATTERNS,
  computeCycle,
  formatDuration,
  phaseAtElapsed,
  planSession,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";
const TICK_MS = 100;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  patternId: "box",
  unit: "4",
  minutes: "5",
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [patternId, setPatternId] = useState(DEFAULTS.patternId);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);

  const cycle = useMemo(
    () => computeCycle({ patternId, unitSeconds: toNumber(unit) }),
    [patternId, unit],
  );

  const hasError = Boolean(cycle.error);

  const plan = useMemo(
    () =>
      hasError
        ? { error: cycle.error }
        : planSession({ cycleSeconds: cycle.cycleSeconds, minutes: toNumber(minutes) }),
    [hasError, cycle, minutes],
  );

  useEffect(() => {
    if (!running || hasError) return undefined;
    const id = setInterval(() => {
      setElapsed((value) => value + TICK_MS / 1000);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [running, hasError]);

  const sessionSeconds = plan.error ? 0 : plan.targetSeconds;

  useEffect(() => {
    if (running && sessionSeconds > 0 && elapsed >= sessionSeconds) {
      setRunning(false);
    }
  }, [running, elapsed, sessionSeconds]);

  const live = hasError
    ? null
    : phaseAtElapsed(cycle.timeline, cycle.cycleSeconds, Math.min(elapsed, sessionSeconds || elapsed));

  const pattern = PATTERNS.find((item) => item.id === patternId);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Pranayama pacing — ${pattern ? pattern.name : ""}`,
      `Ratio ${cycle.ratio.join(":")} at ${NUM1.format(cycle.unitSeconds)}s per count`,
      `Phases: ${cycle.phases.map((phase) => `${phase.label} ${NUM1.format(phase.seconds)}s`).join(", ")}`,
      `One breath: ${NUM1.format(cycle.cycleSeconds)}s (${NUM1.format(cycle.breathsPerMinute)} breaths/min)`,
      plan.error
        ? "Session: not planned"
        : `Session: ${NUM0.format(toNumber(minutes))} min = ${NUM0.format(plan.rounds)} full rounds (${formatDuration(plan.usedSeconds)})`,
    ].join("\n");
  }, [hasError, pattern, cycle, plan, minutes]);

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
    setPatternId(DEFAULTS.patternId);
    setUnit(DEFAULTS.unit);
    setMinutes(DEFAULTS.minutes);
    setRunning(false);
    setElapsed(0);
    setCopied(false);
  };

  const selectPattern = (id) => {
    const found = PATTERNS.find((item) => item.id === id);
    setPatternId(id);
    if (found) setUnit(String(found.defaultUnit));
    setRunning(false);
    setElapsed(0);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Wind className="h-4 w-4" aria-hidden="true" />
          Pranayama
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Pranayama Practice Timer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Choose a breath ratio, set how long one count lasts, and follow the pacer through inhale,
          retention and exhale. The ratio stays fixed while the count grows with your capacity.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pr-pattern">
              Breathing pattern
            </label>
            <select
              id="pr-pattern"
              className={`mt-2 ${INPUT_CLASS}`}
              value={patternId}
              onChange={(event) => selectPattern(event.target.value)}
            >
              {PATTERNS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} — {item.ratio.join(":")}
                </option>
              ))}
            </select>
            {pattern && (
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">{pattern.note}</p>
            )}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-unit">
              Seconds per count
            </label>
            <input
              id="pr-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="20"
              step="0.5"
              value={unit}
              onChange={(event) => {
                setUnit(event.target.value);
                setElapsed(0);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-minutes">
              Session length (minutes)
            </label>
            <input
              id="pr-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="120"
              step="1"
              value={minutes}
              onChange={(event) => {
                setMinutes(event.target.value);
                setElapsed(0);
              }}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {cycle.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {live ? `Round ${live.round}` : "Pacer"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]" aria-live="polite">
              {live ? live.phase.label : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {live
                ? `${NUM1.format(live.secondsLeftInPhase)}s left of ${NUM1.format(live.phase.seconds)}s`
                : "Fix the inputs above to start the pacer."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRunning((value) => !value)}
              disabled={hasError}
              aria-label={running ? "Pause the breathing pacer" : "Start the breathing pacer"}
              className={PRIMARY_BTN}
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
              onClick={() => {
                setRunning(false);
                setElapsed(0);
              }}
              aria-label="Restart the session from zero"
              className={GHOST_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Restart
            </button>
          </div>
        </div>

        <div
          className="mt-5 h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={
            live ? `${live.phase.label} is ${NUM0.format(live.progress * 100)} percent complete` : "Pacer idle"
          }
        >
          <span
            className="block h-full bg-[var(--primary)] transition-[width] duration-100 ease-linear motion-reduce:transition-none"
            style={{ width: `${live ? Math.max(0, Math.min(100, live.progress * 100)) : 0}%` }}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--muted-foreground)]">
          <span>
            Elapsed {formatDuration(Math.min(elapsed, sessionSeconds || elapsed))}
            {sessionSeconds > 0 ? ` of ${formatDuration(sessionSeconds)}` : ""}
          </span>
          {sessionSeconds > 0 && elapsed >= sessionSeconds && (
            <span className="font-semibold text-[var(--success)]">Session complete.</span>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              One breath takes
            </p>
            <p className="mt-1 text-3xl font-semibold">
              {hasError ? DASH : `${NUM1.format(cycle.cycleSeconds)} s`}
            </p>
          </div>
          <button
            type="button"
            onClick={copyResult}
            aria-label="Copy the pranayama pacing plan"
            className={GHOST_BTN}
            disabled={hasError}
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy plan"}
          </button>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Ratio", hasError ? DASH : cycle.ratio.join(" : ")],
            [
              "Inhale",
              hasError ? DASH : `${NUM1.format(cycle.inhaleSeconds)} s`,
            ],
            [
              "Retention (both holds)",
              hasError ? DASH : `${NUM1.format(cycle.holdSeconds)} s`,
            ],
            ["Exhale", hasError ? DASH : `${NUM1.format(cycle.exhaleSeconds)} s`],
            [
              "Breathing rate",
              hasError ? DASH : `${NUM1.format(cycle.breathsPerMinute)} breaths/min`,
            ],
            [
              "Full rounds in the session",
              hasError || plan.error ? DASH : NUM0.format(plan.rounds),
            ],
            [
              "Time those rounds take",
              hasError || plan.error ? DASH : formatDuration(plan.usedSeconds),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && plan.error && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {plan.error}
          </p>
        )}

        {!hasError && cycle.retentionShare > 0.4 && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
            Retention is {NUM0.format(cycle.retentionShare * 100)}% of each breath. Long holds are
            traditionally learned with a teacher and are not suitable in pregnancy, uncontrolled high
            blood pressure, glaucoma or heart conditions.
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 overflow-x-auto rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Phase timeline for one breath</h2>
          <table className="mt-3 w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Phase
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Seconds
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Starts at
                </th>
              </tr>
            </thead>
            <tbody>
              {cycle.timeline.map((phase) => (
                <tr key={phase.key} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{phase.label}</td>
                  <td className="py-2 pr-3 text-right">{NUM1.format(phase.seconds)}</td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">
                    {NUM1.format(phase.startsAt)} s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational pacing support, not medical advice. Practise seated and never force a breath —
        if you feel dizzy, stop and breathe normally. Ask your doctor first if you are pregnant or
        have a respiratory, cardiac or eye condition.
      </p>
    </main>
  );
}
