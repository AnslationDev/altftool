"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Pause, Play, RotateCcw, TimerReset } from "lucide-react";
import {
  TABATA_REST_SECONDS,
  TABATA_ROUNDS,
  TABATA_WORK_SECONDS,
  buildTabataPlan,
  formatClock,
  tabataSchedule,
  tabataTimerState,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  work: String(TABATA_WORK_SECONDS),
  rest: String(TABATA_REST_SECONDS),
  rounds: String(TABATA_ROUNDS),
  sets: "2",
  setRest: "60",
  prep: "10",
};

const PRESETS = [
  { label: "Classic Tabata 20/10 x8", work: "20", rest: "10", rounds: "8" },
  { label: "30/15 x8", work: "30", rest: "15", rounds: "8" },
  { label: "40/20 x6", work: "40", rest: "20", rounds: "6" },
  { label: "10/20 beginner x8", work: "10", rest: "20", rounds: "8" },
];

const toNumber = (raw) => {
  const text = String(raw).trim();
  const value = Number(text);
  return text === "" || !Number.isFinite(value) ? NaN : value;
};

export default function ToolHome() {
  const [work, setWork] = useState(DEFAULTS.work);
  const [rest, setRest] = useState(DEFAULTS.rest);
  const [rounds, setRounds] = useState(DEFAULTS.rounds);
  const [sets, setSets] = useState(DEFAULTS.sets);
  const [setBreak, setSetBreak] = useState(DEFAULTS.setRest);
  const [prep, setPrep] = useState(DEFAULTS.prep);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      buildTabataPlan({
        workSeconds: toNumber(work),
        restSeconds: toNumber(rest),
        rounds: toNumber(rounds),
        sets: toNumber(sets),
        setRestSeconds: toNumber(setBreak),
        prepSeconds: toNumber(prep),
      }),
    [work, rest, rounds, sets, setBreak, prep],
  );
  const failed = Boolean(plan.error);

  useEffect(() => {
    if (!running || failed) return undefined;
    const id = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, [running, failed]);

  useEffect(() => {
    if (failed) setRunning(false);
  }, [failed]);

  const state = useMemo(() => tabataTimerState(plan, elapsed), [plan, elapsed]);

  useEffect(() => {
    if (state.phase === "done" && running) setRunning(false);
  }, [state.phase, running]);

  const schedule = useMemo(() => tabataSchedule(plan), [plan]);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Tabata Interval Timer",
      `${plan.workSeconds}s work / ${plan.restSeconds}s rest x ${plan.rounds} rounds`,
      `Sets: ${plan.sets}${plan.sets > 1 ? ` with ${plan.setRestSeconds}s between sets` : ""}`,
      `Work-to-rest ratio: ${plan.ratio}`,
      `Total work: ${formatClock(plan.totalWorkSeconds)} · total rest: ${formatClock(plan.totalRestSeconds)}`,
      `Whole session: ${formatClock(plan.totalSessionSeconds)} including ${plan.prepSeconds}s prep`,
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
    setWork(DEFAULTS.work);
    setRest(DEFAULTS.rest);
    setRounds(DEFAULTS.rounds);
    setSets(DEFAULTS.sets);
    setSetBreak(DEFAULTS.setRest);
    setPrep(DEFAULTS.prep);
    setRunning(false);
    setElapsed(0);
    setCopied(false);
  };

  const phaseLabel = {
    prep: "Get ready",
    work: "Work",
    rest: "Rest",
    "set-rest": "Set break",
    done: "Session complete",
  }[state.phase];

  const sessionProgress = failed
    ? 0
    : Math.min(100, (elapsed / plan.totalSessionSeconds) * 100);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <TimerReset className="h-4 w-4" aria-hidden="true" />
          Gym programming
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Tabata Interval Timer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Run the original 20 seconds on, 10 seconds off, eight rounds — or change the work, rest,
          rounds and sets and see the total work time and work-to-rest ratio before you start.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tabata-work">
              Work (seconds)
            </label>
            <input
              id="tabata-work"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="5"
              max="300"
              step="5"
              value={work}
              onChange={(event) => setWork(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tabata-rest">
              Rest (seconds)
            </label>
            <input
              id="tabata-rest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="300"
              step="5"
              value={rest}
              onChange={(event) => setRest(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tabata-rounds">
              Rounds per set
            </label>
            <input
              id="tabata-rounds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="60"
              step="1"
              value={rounds}
              onChange={(event) => setRounds(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tabata-sets">
              Sets
            </label>
            <input
              id="tabata-sets"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="20"
              step="1"
              value={sets}
              onChange={(event) => setSets(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tabata-setrest">
              Rest between sets (seconds)
            </label>
            <input
              id="tabata-setrest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="600"
              step="15"
              value={setBreak}
              onChange={(event) => setSetBreak(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tabata-prep">
              Prep countdown (seconds)
            </label>
            <input
              id="tabata-prep"
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
              className={CHIP_BTN}
              onClick={() => {
                setWork(preset.work);
                setRest(preset.rest);
                setRounds(preset.rounds);
                setElapsed(0);
                setRunning(false);
              }}
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
                ? "Fix the settings above to run the timer."
                : state.phase === "done"
                  ? `${plan.totalRounds} rounds finished`
                  : `Set ${state.set} of ${plan.sets} · round ${Math.max(1, state.round)} of ${plan.rounds} · ${formatClock(state.secondsLeftInSession)} left`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRunning((value) => !value)}
              disabled={failed}
              aria-label={running ? "Pause the Tabata timer" : "Start the Tabata timer"}
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
          aria-label={failed ? "Session progress unavailable" : `${NUM.format(sessionProgress)}% of the session complete`}
        >
          <span
            className="block h-full bg-[var(--primary)] transition-[width] duration-300 motion-reduce:transition-none"
            style={{ width: `${sessionProgress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]" aria-live="polite">
          {failed ? DASH : `${state.roundsDone} of ${plan.totalRounds} rounds done · elapsed ${formatClock(elapsed)}`}
        </p>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total session length
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : formatClock(plan.totalSessionSeconds)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "No plan yet"
                : plan.isClassic
                  ? "This is the original Tabata protocol: 20s on, 10s off, 8 rounds."
                  : `Tabata-style block at a ${plan.ratio} work-to-rest ratio.`}
            </p>
          </div>
          <button type="button" onClick={copyResult} aria-label="Copy the Tabata plan" className={GHOST_BTN}>
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy plan"}
          </button>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["One round (work + rest)", failed ? DASH : formatClock(plan.cycleSeconds)],
            ["One set", failed ? DASH : formatClock(plan.setSeconds)],
            ["Total rounds", failed ? DASH : String(plan.totalRounds)],
            ["Total working time", failed ? DASH : formatClock(plan.totalWorkSeconds)],
            ["Total resting time", failed ? DASH : formatClock(plan.totalRestSeconds)],
            ["Working share of the block", failed ? DASH : `${NUM.format(plan.workShare * 100)}%`],
            ["Work-to-rest ratio", failed ? DASH : plan.ratio],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4">
          <button type="button" onClick={reset} aria-label="Reset all settings to defaults" className={PRIMARY_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset settings
          </button>
        </div>
      </section>

      {!failed && schedule.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Phase-by-phase schedule</h2>
          <div className="mt-3 max-h-96 overflow-y-auto overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Starts</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Phase</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Set</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Round</th>
                  <th scope="col" className="py-2 text-right font-semibold">Length</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row) => (
                  <tr key={row.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 tabular-nums">{formatClock(row.startSeconds)}</td>
                    <td className="py-2 pr-3 font-semibold">{row.phase}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{row.set}</td>
                    <td className="py-2 pr-3 text-right tabular-nums text-[var(--muted-foreground)]">
                      {row.round || DASH}
                    </td>
                    <td className="py-2 text-right tabular-nums">{row.seconds}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Tabata intervals are designed to be genuinely maximal, which makes them unsuitable as a
        first session back. General fitness information only — check with a qualified professional
        before starting high-intensity interval training.
      </p>
    </main>
  );
}
