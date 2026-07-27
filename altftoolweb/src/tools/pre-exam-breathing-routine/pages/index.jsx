"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Pause, Play, RotateCcw, Wind } from "lucide-react";

import {
  BREATHING_PATTERNS,
  MAX_ROUNDS,
  buildBreathingSession,
  formatSeconds,
  phaseAt,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_PATTERN = BREATHING_PATTERNS[0];

const DASH = "—";

export default function ToolHome() {
  const [patternId, setPatternId] = useState(DEFAULT_PATTERN.id);
  const [rounds, setRounds] = useState(String(DEFAULT_PATTERN.defaultRounds));
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);

  const session = useMemo(
    () =>
      buildBreathingSession({
        patternId,
        rounds: rounds.trim() === "" ? Number.NaN : Number(rounds),
      }),
    [patternId, rounds],
  );

  const hasError = Boolean(session.error);

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const now = hasError ? null : phaseAt(session, elapsed);
  const isDone = Boolean(now?.done);

  useEffect(() => {
    if (isDone) setRunning(false);
  }, [isDone]);

  const selectPattern = (id) => {
    const pattern = BREATHING_PATTERNS.find((p) => p.id === id) ?? DEFAULT_PATTERN;
    setPatternId(pattern.id);
    setRounds(String(pattern.defaultRounds));
    setRunning(false);
    setElapsed(0);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Pre-exam breathing routine — ${session.pattern.label}`,
      `Rounds: ${session.rounds} (${session.secondsPerRound} s each)`,
      `Total time: ${formatSeconds(session.totalSeconds)}`,
      `Steps per round: ${session.steps
        .filter((step) => step.round === 1)
        .map((step) => `${step.label} ${step.seconds}s`)
        .join(" → ")}`,
      `Source: ${session.pattern.source}`,
    ].join("\n");
  }, [hasError, session]);

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
    selectPattern(DEFAULT_PATTERN.id);
    setCopied(false);
  };

  const bigText = hasError
    ? DASH
    : isDone
      ? "Done"
      : running || elapsed > 0
        ? now?.step
          ? `${now.step.label} ${Math.ceil(now.secondsLeftInStep)}`
          : DASH
        : formatSeconds(session.totalSeconds);

  const subText = hasError
    ? "Fix the input above to build the routine."
    : isDone
      ? "Routine complete. Unclench your jaw, drop your shoulders, and walk in steady."
      : running || elapsed > 0
        ? `Round ${now?.step?.round ?? session.rounds} of ${session.rounds} · ${formatSeconds(Math.max(0, session.totalSeconds - elapsed))} left`
        : `${session.rounds} rounds of ${session.pattern.label}. ${session.pattern.note}`;

  const rows = hasError
    ? [
        ["Pattern", DASH],
        ["Rounds", DASH],
        ["One round takes", DASH],
        ["Total time", DASH],
      ]
    : [
        ["Pattern", session.pattern.label],
        ["Rounds", String(session.rounds)],
        ["One round takes", `${session.secondsPerRound} s`],
        ["Total time", formatSeconds(session.totalSeconds)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Wind className="h-4 w-4" aria-hidden="true" />
          Exam wellness
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Pre Exam Breathing Routine
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Two to three minutes of paced breathing before you enter the hall. Pick a pattern, press
          start, and follow the on-screen count — inhale as the circle grows, exhale as it shrinks.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="peb-pattern">
              Breathing pattern
            </label>
            <select
              id="peb-pattern"
              className={`mt-2 ${INPUT_CLASS}`}
              value={patternId}
              onChange={(event) => selectPattern(event.target.value)}
            >
              {BREATHING_PATTERNS.map((pattern) => (
                <option key={pattern.id} value={pattern.id}>
                  {pattern.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="peb-rounds">
              Rounds (1–{MAX_ROUNDS})
            </label>
            <input
              id="peb-rounds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_ROUNDS}
              step="1"
              value={rounds}
              onChange={(event) => {
                setRounds(event.target.value);
                setRunning(false);
                setElapsed(0);
              }}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {session.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-col items-center gap-5 text-center">
          <div
            aria-hidden="true"
            className="flex h-40 w-40 items-center justify-center rounded-full bg-[var(--primary)]/10 ring-2 ring-[var(--primary)] transition-transform duration-1000 ease-in-out motion-reduce:transition-none"
            style={{
              transform:
                !hasError && now?.step
                  ? now.step.action === "grow"
                    ? "scale(1.15)"
                    : now.step.action === "shrink"
                      ? "scale(0.85)"
                      : "scale(1)"
                  : "scale(1)",
            }}
          >
            <span className="px-3 text-2xl font-semibold text-[var(--primary)]" aria-hidden="true">
              {hasError ? DASH : isDone ? "✓" : now?.step ? now.step.label : "Ready"}
            </span>
          </div>

          <div aria-live="polite">
            <p className="text-4xl font-semibold text-[var(--primary)]">{bigText}</p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">{subText}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (isDone) setElapsed(0);
                setRunning((value) => !value);
              }}
              disabled={hasError}
              aria-label={running ? "Pause the breathing timer" : "Start the breathing timer"}
              className={`${PRIMARY_BTN} disabled:opacity-50`}
            >
              {running ? (
                <Pause className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Play className="h-4 w-4" aria-hidden="true" />
              )}
              {running ? "Pause" : isDone ? "Go again" : elapsed > 0 ? "Resume" : "Start"}
            </button>
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the routine details"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy routine"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the routine" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-6 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">One round, step by step</h2>
          <ol className="mt-3 space-y-2 text-sm">
            {session.steps
              .filter((step) => step.round === 1)
              .map((step, index) => (
                <li
                  key={`${step.label}-${index}`}
                  className="flex items-center justify-between gap-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                >
                  <span className="font-semibold">{step.label}</span>
                  <span className="text-[var(--muted-foreground)]">{step.seconds} seconds</span>
                </li>
              ))}
          </ol>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">{session.pattern.source}.</p>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        General relaxation information, not medical advice. Breathe gently — never strain on holds.
        If you feel dizzy, return to normal breathing. People with respiratory or cardiovascular
        conditions, or who are pregnant, should check breath-hold practices with a doctor.
      </p>
    </main>
  );
}
