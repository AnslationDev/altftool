"use client";

import { useEffect, useMemo, useState } from "react";
import { Armchair, Check, Copy, Pause, Play, RotateCcw } from "lucide-react";

import {
  AREAS,
  buildRoutine,
  formatDuration,
  stepAtElapsed,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";
const TICK_MS = 200;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_AREAS = ["Neck", "Shoulders & chest", "Wrists & hands", "Spine", "Eyes"];

const DEFAULTS = {
  minutes: "5",
  transition: "5",
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [transition, setTransition] = useState(DEFAULTS.transition);
  const [areas, setAreas] = useState(DEFAULT_AREAS);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);

  const routine = useMemo(
    () =>
      buildRoutine({
        minutes: toNumber(minutes),
        areas,
        transitionSeconds: toNumber(transition),
      }),
    [minutes, areas, transition],
  );

  const hasError = Boolean(routine.error);

  useEffect(() => {
    if (!running || hasError) return undefined;
    const id = setInterval(() => setElapsed((value) => value + TICK_MS / 1000), TICK_MS);
    return () => clearInterval(id);
  }, [running, hasError]);

  const live = hasError ? null : stepAtElapsed(routine.steps, elapsed);

  useEffect(() => {
    if (running && !hasError && !live) setRunning(false);
  }, [running, hasError, live]);

  const toggleArea = (area) => {
    setAreas((current) =>
      current.includes(area) ? current.filter((item) => item !== area) : [...current, area],
    );
    setElapsed(0);
    setRunning(false);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Chair yoga desk routine — ${formatDuration(routine.routineSeconds)}`,
      `Areas: ${routine.areasCovered.join(", ")}`,
      "",
      ...routine.steps.map(
        (step, index) =>
          `${index + 1}. ${step.name} — ${step.holdSeconds}s${step.perSide ? " per side" : ""}`,
      ),
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

  const reset = () => {
    setMinutes(DEFAULTS.minutes);
    setTransition(DEFAULTS.transition);
    setAreas(DEFAULT_AREAS);
    setRunning(false);
    setElapsed(0);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Armchair className="h-4 w-4" aria-hidden="true" />
          Desk break
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Chair Yoga Desk Routine</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tell it how long your break is and which areas ache. It builds the longest seated routine
          that fits within your time, using longer holds to fill the break as closely as possible,
          with holds roughly 20-45 seconds per position, growing up to 60s to fill your break.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cy-minutes">
              Break length (minutes)
            </label>
            <input
              id="cy-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="45"
              step="1"
              value={minutes}
              onChange={(event) => {
                setMinutes(event.target.value);
                setElapsed(0);
                setRunning(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cy-transition">
              Seconds to change position
            </label>
            <input
              id="cy-transition"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="30"
              step="1"
              value={transition}
              onChange={(event) => {
                setTransition(event.target.value);
                setElapsed(0);
                setRunning(false);
              }}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>Where does it ache?</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {AREAS.map((area) => {
              const on = areas.includes(area);
              return (
                <button
                  key={area}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleArea(area)}
                  className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                    on
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {area}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-4 flex flex-wrap gap-2">
          {[3, 5, 10, 15].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setMinutes(String(preset));
                setElapsed(0);
                setRunning(false);
              }}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset} min
            </button>
          ))}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Routine length
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : formatDuration(routine.routineSeconds)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Adjust the break length or focus areas."
                : `${routine.stepCount} positions across ${routine.areasCovered.length} areas`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRunning((value) => !value)}
              disabled={hasError}
              aria-label={running ? "Pause the routine" : "Start the routine"}
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
              onClick={copyResult}
              aria-label="Copy the chair yoga routine"
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
            <button type="button" onClick={reset} aria-label="Reset the builder" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Positions", hasError ? DASH : NUM0.format(routine.stepCount)],
            ["Time actually stretching", hasError ? DASH : formatDuration(routine.holdTotal)],
            ["Time changing position", hasError ? DASH : formatDuration(routine.transitionTotal)],
            [
              "Unused time in your break",
              hasError ? DASH : `${NUM0.format(routine.leftoverSeconds)} s`,
            ],
            [
              "Areas not reached in this time",
              hasError
                ? DASH
                : routine.areasSkipped.length === 0
                  ? "none"
                  : routine.areasSkipped.join(", "),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-5 rounded-md bg-[var(--muted)] px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {live ? (live.inTransition ? "Next up" : "Now") : "Finished"}
            </p>
            <p className="mt-1 text-lg font-semibold" aria-live="polite">
              {live ? live.step.name : "Routine complete — back to work."}
            </p>
            {live && (
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {NUM0.format(Math.ceil(live.secondsLeft))} s ·{" "}
                {live.inTransition ? "change position" : live.step.cue}
              </p>
            )}
          </div>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Your routine, in order</h2>
          <ol className="mt-3 space-y-3">
            {routine.steps.map((step, index) => {
              const active = live && !live.inTransition && live.index === index;
              return (
                <li
                  key={step.id}
                  className={`rounded-md border px-3 py-3 text-sm ${
                    active
                      ? "border-[var(--primary)] bg-[var(--muted)]"
                      : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-semibold">
                      {index + 1}. {step.name}
                    </span>
                    <span className="text-[var(--muted-foreground)]">
                      {step.holdSeconds}s{step.perSide ? " per side" : ""} · starts at{" "}
                      {formatDuration(step.startsAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-[var(--muted-foreground)]">{step.cue}</p>
                  {step.caution && (
                    <p className="mt-1 text-xs font-medium text-[var(--warning)]">{step.caution}</p>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Stretch to mild tension, never to pain, and keep breathing throughout. Informational movement
        guidance only — if you have a disc problem, recent surgery, dizziness or nerve symptoms down
        an arm or leg, get personalised advice from a physiotherapist or your doctor.
      </p>
    </main>
  );
}
