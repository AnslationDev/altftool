"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Pause, Play, RotateCcw, Waves } from "lucide-react";
import {
  MAX_BASE_COUNT,
  MAX_ROUNDS,
  MIN_BASE_COUNT,
  MIN_ROUNDS,
  RATIO_PRESETS,
  buildNadiSession,
  formatClock,
  stepAtTime,
} from "../lib";

const DASH = "—";
const TICK_MS = 100;

const DEFAULTS = { rounds: "6", base: "4", preset: "extendedExhale" };

const SELECT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const INPUT_CLASS = SELECT_CLASS;
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const PHASE_TONE = {
  inhale: "text-[var(--primary)]",
  retain: "text-[var(--foreground)]",
  exhale: "text-[var(--success)]",
  done: "text-[var(--primary)]",
};

const activeNostril = (stepKey) => {
  if (stepKey === "inhale-left" || stepKey === "exhale-left") return "left";
  if (stepKey === "inhale-right" || stepKey === "exhale-right") return "right";
  return "none";
};

export default function ToolHome() {
  const [rounds, setRounds] = useState(DEFAULTS.rounds);
  const [base, setBase] = useState(DEFAULTS.base);
  const [preset, setPreset] = useState(DEFAULTS.preset);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);

  const session = useMemo(
    () => buildNadiSession({ rounds: Number(rounds), baseCount: Number(base), preset }),
    [rounds, base, preset],
  );
  const ok = !session.error;
  const position = useMemo(() => (ok ? stepAtTime(elapsed, session) : null), [ok, elapsed, session]);

  useEffect(() => {
    setRunning(false);
    setElapsed(0);
  }, [rounds, base, preset]);

  useEffect(() => {
    if (!running || !ok) return undefined;
    const id = setInterval(() => setElapsed((value) => value + TICK_MS / 1000), TICK_MS);
    return () => clearInterval(id);
  }, [running, ok]);

  const finished = Boolean(position && position.done);
  useEffect(() => {
    if (finished) setRunning(false);
  }, [finished]);

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Alternate Nostril Breathing (nadi shodhana)",
      `Ratio: ${session.ratioLabel} at ${session.baseCount}s per count (${session.ratioLevel})`,
      `Rounds: ${session.rounds} (${session.totalBreaths} breaths)`,
      `One round: ${session.roundSeconds}s`,
      `Session length: ${formatClock(session.totalSeconds)}`,
      `Breathing rate: ${session.breathsPerMinute} breaths per minute`,
      "",
      ...session.steps.map((step, index) => `${index + 1}. ${step.label} - ${step.seconds}s - ${step.instruction}`),
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

  const reset = () => {
    setRounds(DEFAULTS.rounds);
    setBase(DEFAULTS.base);
    setPreset(DEFAULTS.preset);
    setRunning(false);
    setElapsed(0);
    setCopied(false);
  };

  const nostril = position ? activeNostril(position.stepKey) : "none";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Waves className="h-4 w-4" aria-hidden="true" />
          Nadi shodhana
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Alternate Nostril Breathing Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          One round of nadi shodhana is two breaths: in through the left, out through the right, in
          through the right, out through the left. This guide tells you which nostril and which
          finger at every step, holds the ratio you choose, and counts the rounds for you.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="nadi-preset">
              Breathing ratio (inhale : hold : exhale)
            </label>
            <select
              id="nadi-preset"
              className={`mt-2 ${SELECT_CLASS}`}
              value={preset}
              onChange={(event) => setPreset(event.target.value)}
            >
              {Object.values(RATIO_PRESETS).map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label} · {item.level}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {RATIO_PRESETS[preset] ? RATIO_PRESETS[preset].note : ""}
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nadi-base">
              Seconds per count
            </label>
            <input
              id="nadi-base"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={MIN_BASE_COUNT}
              max={MAX_BASE_COUNT}
              step="0.5"
              value={base}
              onChange={(event) => setBase(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nadi-rounds">
              Rounds
            </label>
            <input
              id="nadi-rounds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_ROUNDS}
              max={MAX_ROUNDS}
              step="1"
              value={rounds}
              onChange={(event) => setRounds(event.target.value)}
            />
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
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            {ok ? `Round ${position.roundNumber} of ${session.rounds}` : "Round"}
          </p>
          <p
            className={`mt-1 text-3xl font-semibold ${ok ? PHASE_TONE[position.phase] || "" : "text-[var(--muted-foreground)]"}`}
          >
            {ok ? position.stepLabel : DASH}
          </p>
          <p className="mt-1 text-5xl font-semibold tabular-nums">
            {ok ? Math.ceil(position.stepRemaining) : DASH}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3" aria-hidden="true">
          {["left", "right"].map((side) => (
            <div
              key={side}
              className={`rounded-lg border px-3 py-3 text-center text-sm font-semibold capitalize transition ${
                nostril === side
                  ? "border-[var(--primary)] bg-[var(--primary)]/12 text-[var(--primary)]"
                  : "border-[var(--border)] text-[var(--muted-foreground)]"
              }`}
            >
              {side} nostril
              <span className="mt-1 block text-xs font-normal">
                {nostril === side ? "open" : "closed"}
              </span>
            </div>
          ))}
        </div>

        <p
          className="mt-4 min-h-[3rem] text-center text-sm text-[var(--muted-foreground)]"
          aria-live="polite"
        >
          {ok ? position.instruction : "Fix the settings above to start."}
        </p>

        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {running ? (
            <button
              type="button"
              onClick={() => setRunning(false)}
              aria-label="Pause the practice"
              className={PRIMARY_BTN}
            >
              <Pause className="h-4 w-4" aria-hidden="true" />
              Pause
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (!ok) return;
                if (finished) setElapsed(0);
                setRunning(true);
              }}
              aria-label="Start the practice"
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
            aria-label="Copy the practice plan"
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
          <button type="button" onClick={reset} aria-label="Reset the guide" className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
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
            ["Time left", ok ? formatClock(position.remainingSeconds) : DASH],
            ["One round", ok ? `${session.roundSeconds} s` : DASH],
            ["Whole session", ok ? formatClock(session.totalSeconds) : DASH],
            ["Total breaths", ok ? `${session.totalBreaths}` : DASH],
            ["Breathing rate", ok ? `${session.breathsPerMinute} breaths / minute` : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">One round, step by step</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{session.handNote}</p>
          <ol className="mt-3 grid gap-2 text-sm">
            {session.steps.map((step, index) => (
              <li
                key={step.key}
                className={`rounded-md border px-3 py-2 ${
                  position && !position.done && position.stepIndex === index
                    ? "border-[var(--primary)] bg-[var(--primary)]/10"
                    : "border-[var(--border)]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">
                    {index + 1}. {step.label}
                  </span>
                  <span className="shrink-0 tabular-nums text-[var(--muted-foreground)]">
                    {step.seconds}s
                  </span>
                </div>
                <p className="mt-1 text-[var(--muted-foreground)]">{step.instruction}</p>
              </li>
            ))}
          </ol>

          {session.hasRetention ? (
            <p
              role="alert"
              className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              This ratio includes a {session.longestHold}-second breath retention. Retention is
              traditionally taught in person and is not advised in pregnancy, uncontrolled high
              blood pressure, glaucoma or heart conditions.
            </p>
          ) : null}
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Sit upright with a straight spine, breathe silently and never force the
        breath. Stop if you feel dizzy, and speak to a doctor before practising breath retention if
        you are pregnant or have a respiratory, cardiac or blood pressure condition.
      </p>
    </main>
  );
}
