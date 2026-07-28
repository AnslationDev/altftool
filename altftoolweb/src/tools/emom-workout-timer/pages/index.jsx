"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Pause, Play, RotateCcw, Timer } from "lucide-react";
import {
  DEFAULT_INTERVAL_SECONDS,
  buildEmomPlan,
  emomTimerState,
  formatClock,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  interval: String(DEFAULT_INTERVAL_SECONDS),
  rounds: "12",
  reps: "10",
  pace: "2.5",
  prep: "10",
};

const PRESETS = [
  { label: "EMOM 60s", interval: "60" },
  { label: "E90 (90s)", interval: "90" },
  { label: "E2MOM (120s)", interval: "120" },
  { label: "E30 (30s)", interval: "30" },
];

const toNumber = (raw) => {
  const value = Number(String(raw).trim());
  return String(raw).trim() === "" || !Number.isFinite(value) ? NaN : value;
};

const DASH = "—";

export default function ToolHome() {
  const [interval, setInterval_] = useState(DEFAULTS.interval);
  const [rounds, setRounds] = useState(DEFAULTS.rounds);
  const [reps, setReps] = useState(DEFAULTS.reps);
  const [pace, setPace] = useState(DEFAULTS.pace);
  const [prep, setPrep] = useState(DEFAULTS.prep);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      buildEmomPlan({
        intervalSeconds: toNumber(interval),
        rounds: toNumber(rounds),
        repsPerRound: toNumber(reps),
        secondsPerRep: toNumber(pace),
        prepSeconds: toNumber(prep),
      }),
    [interval, rounds, reps, pace, prep],
  );

  const failed = Boolean(plan.error);

  useEffect(() => {
    if (!running || failed) return undefined;
    const id = window.setInterval(() => {
      setElapsed((value) => value + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, failed]);

  useEffect(() => {
    if (failed) setRunning(false);
  }, [failed]);

  const state = useMemo(() => emomTimerState(plan, elapsed), [plan, elapsed]);

  useEffect(() => {
    if (state.phase === "done" && running) setRunning(false);
  }, [state.phase, running]);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "EMOM Workout Timer",
      `Interval: ${plan.intervalSeconds}s x ${plan.rounds} rounds`,
      `Reps per round: ${plan.repsPerRound} (${plan.totalReps} total)`,
      `Work per round: ${formatClock(plan.workPerRoundSeconds)}`,
      `Rest per round: ${plan.restPerRoundSeconds >= 0 ? formatClock(plan.restPerRoundSeconds) : "none — interval overrun"}`,
      `Density: ${plan.densityLabel} (${NUM.format(plan.workShare * 100)}% working)`,
      `Total session: ${formatClock(plan.totalSessionSeconds)} including ${plan.prepSeconds}s prep`,
    ].join("\n");
  }, [plan, failed]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setInterval_(DEFAULTS.interval);
    setRounds(DEFAULTS.rounds);
    setReps(DEFAULTS.reps);
    setPace(DEFAULTS.pace);
    setPrep(DEFAULTS.prep);
    setRunning(false);
    setElapsed(0);
    setCopied(false);
  };

  const phaseLabel = {
    prep: "Get ready",
    work: "Work",
    rest: "Rest",
    done: "Session complete",
  }[state.phase];

  const roundProgress = failed
    ? 0
    : Math.min(100, (state.secondsIntoRound / plan.intervalSeconds) * 100);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          Gym programming
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">EMOM Workout Timer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set the interval, rounds and reps, and see exactly how much rest is left inside each
          minute before you start. Then run the clock with a prep countdown and live round tracking.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="emom-interval">
              Interval length (seconds)
            </label>
            <input
              id="emom-interval"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="10"
              max="600"
              step="5"
              value={interval}
              onChange={(event) => setInterval_(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="emom-rounds">
              Rounds
            </label>
            <input
              id="emom-rounds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="200"
              step="1"
              value={rounds}
              onChange={(event) => setRounds(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="emom-reps">
              Reps per round
            </label>
            <input
              id="emom-reps"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={reps}
              onChange={(event) => setReps(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="emom-pace">
              Your pace (seconds per rep)
            </label>
            <input
              id="emom-pace"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.2"
              step="0.1"
              value={pace}
              onChange={(event) => setPace(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="emom-prep">
              Prep countdown (seconds)
            </label>
            <input
              id="emom-prep"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="60"
              step="5"
              value={prep}
              onChange={(event) => setPrep(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setInterval_(preset.interval);
                setElapsed(0);
                setRunning(false);
              }}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {failed ? "Timer" : phaseLabel}
            </p>
            <p className="mt-1 text-5xl font-semibold tabular-nums text-[var(--primary)]">
              {failed ? DASH : formatClock(Math.ceil(state.secondsLeftInPhase))}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs above to run the clock."
                : state.phase === "done"
                  ? `${plan.totalReps} reps done in ${formatClock(plan.totalSessionSeconds)}`
                  : `Round ${Math.max(1, state.round)} of ${plan.rounds} · ${formatClock(state.secondsLeftInSession)} left`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRunning((value) => !value)}
              disabled={failed}
              aria-label={running ? "Pause the EMOM timer" : "Start the EMOM timer"}
              className={`${PRIMARY_BTN} disabled:opacity-50`}
            >
              {running ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
              {running ? "Pause" : elapsed > 0 ? "Resume" : "Start"}
            </button>
            <button
              type="button"
              onClick={() => {
                setElapsed(0);
                setRunning(false);
              }}
              aria-label="Restart the timer from zero"
              className={GHOST_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Restart
            </button>
          </div>
        </div>

        <div
          className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={failed ? "Round progress unavailable" : `Round ${NUM.format(roundProgress)}% elapsed`}
        >
          <span
            className="block h-full bg-[var(--primary)] transition-[width] duration-300 motion-reduce:transition-none"
            style={{ width: `${roundProgress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]" aria-live="polite">
          {failed
            ? DASH
            : `Reps completed: ${state.repsDone} of ${plan.totalReps} · elapsed ${formatClock(elapsed)}`}
        </p>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Rest inside each interval
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed || plan.restPerRoundSeconds < 0 ? DASH : formatClock(plan.restPerRoundSeconds)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "No plan yet"
                : plan.restPerRoundSeconds < 0
                  ? `Work overruns the interval by ${formatClock(plan.overrunSeconds)}`
                  : `${plan.densityLabel} density — ${plan.densityNote}`}
            </p>
          </div>
          <button type="button" onClick={copyResult} aria-label="Copy the EMOM plan" className={GHOST_BTN}>
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy plan"}
          </button>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Work time per round", failed ? DASH : formatClock(plan.workPerRoundSeconds)],
            ["Working share of the interval", failed ? DASH : `${NUM.format(plan.workShare * 100)}%`],
            ["Total reps", failed ? DASH : String(plan.totalReps)],
            ["Total working time", failed ? DASH : formatClock(plan.totalWorkSeconds)],
            ["Total rest time", failed ? DASH : formatClock(plan.totalRestSeconds)],
            ["Rep pace demanded", failed ? DASH : `${NUM.format(plan.repsPerMinute)} reps per minute`],
            ["Whole session (with prep)", failed ? DASH : formatClock(plan.totalSessionSeconds)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset inputs
          </button>
        </div>
      </section>

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Round schedule</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Round</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Starts at</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Ends at</th>
                  <th scope="col" className="py-2 text-right font-semibold">Reps done</th>
                </tr>
              </thead>
              <tbody>
                {plan.schedule.map((row) => (
                  <tr
                    key={row.round}
                    className={`border-b border-[var(--border)] last:border-0 ${row.round === state.round ? "text-[var(--primary)]" : ""}`}
                  >
                    <td className="py-2 pr-3 font-semibold">{row.round}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{formatClock(row.startSeconds)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums text-[var(--muted-foreground)]">
                      {formatClock(row.endSeconds)}
                    </td>
                    <td className="py-2 text-right tabular-nums">{row.cumulativeReps}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The rest figure assumes the pace you enter holds for every round; in practice reps slow as
        fatigue builds, so leave a margin. General fitness information only — get clearance from a
        qualified professional before starting hard interval work.
      </p>
    </main>
  );
}
