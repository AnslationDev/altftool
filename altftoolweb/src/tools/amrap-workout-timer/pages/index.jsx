"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Minus, Pause, Play, Plus, Repeat, RotateCcw } from "lucide-react";
import { amrapTimerState, buildAmrapPlan, formatClock, scoreAmrap } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  capMinutes: "20",
  repsPerRound: "15",
  prep: "10",
  usedMinutes: "10",
  rounds: "8",
  extra: "5",
};

const CAP_PRESETS = ["7", "12", "15", "20"];

const toNumber = (raw) => {
  const text = String(raw).trim();
  const value = Number(text);
  return text === "" || !Number.isFinite(value) ? NaN : value;
};

export default function ToolHome() {
  const [capMinutes, setCapMinutes] = useState(DEFAULTS.capMinutes);
  const [repsPerRound, setRepsPerRound] = useState(DEFAULTS.repsPerRound);
  const [prep, setPrep] = useState(DEFAULTS.prep);
  const [usedMinutes, setUsedMinutes] = useState(DEFAULTS.usedMinutes);
  const [rounds, setRounds] = useState(DEFAULTS.rounds);
  const [extra, setExtra] = useState(DEFAULTS.extra);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      buildAmrapPlan({
        capSeconds: toNumber(capMinutes) * 60,
        repsPerRound: toNumber(repsPerRound),
        prepSeconds: toNumber(prep),
      }),
    [capMinutes, repsPerRound, prep],
  );
  const planFailed = Boolean(plan.error);

  useEffect(() => {
    if (!running || planFailed) return undefined;
    const id = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, [running, planFailed]);

  useEffect(() => {
    if (planFailed) setRunning(false);
  }, [planFailed]);

  const clock = useMemo(() => amrapTimerState(plan, elapsed), [plan, elapsed]);

  useEffect(() => {
    if (clock.phase === "done" && running) setRunning(false);
  }, [clock.phase, running]);

  // Before the clock is ever started, score against the typed time; after that, against the clock.
  const scoringSeconds = elapsed > 0 ? clock.workSeconds : toNumber(usedMinutes) * 60;

  const result = useMemo(
    () =>
      scoreAmrap({
        capSeconds: toNumber(capMinutes) * 60,
        repsPerRound: toNumber(repsPerRound),
        roundsCompleted: toNumber(rounds),
        extraReps: toNumber(extra),
        elapsedSeconds: scoringSeconds,
      }),
    [capMinutes, repsPerRound, rounds, extra, scoringSeconds],
  );
  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "AMRAP Workout Timer",
      `Cap: ${capMinutes} minutes · ${repsPerRound} reps per round`,
      `Score: ${result.score} (${result.totalReps} reps)`,
      `Time used: ${formatClock(scoringSeconds)}`,
      `Pace: ${formatClock(result.secondsPerRound)} per round · ${NUM.format(result.repsPerMinute)} reps/min`,
      `Projected at this pace: ${result.projectedScore} (${result.projectedTotalReps} reps)`,
    ].join("\n");
  }, [failed, result, capMinutes, repsPerRound, scoringSeconds]);

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
    setCapMinutes(DEFAULTS.capMinutes);
    setRepsPerRound(DEFAULTS.repsPerRound);
    setPrep(DEFAULTS.prep);
    setUsedMinutes(DEFAULTS.usedMinutes);
    setRounds(DEFAULTS.rounds);
    setExtra(DEFAULTS.extra);
    setRunning(false);
    setElapsed(0);
    setCopied(false);
  };

  const bumpRound = (delta) => {
    setRounds((value) => {
      const current = toNumber(value);
      const base = Number.isNaN(current) ? 0 : Math.floor(current);
      return String(Math.max(0, base + delta));
    });
  };

  const bumpRep = (delta) => {
    setExtra((value) => {
      const current = toNumber(value);
      const base = Number.isNaN(current) ? 0 : Math.floor(current);
      return String(Math.max(0, base + delta));
    });
  };

  const phaseLabel = { prep: "Get ready", work: "Time remaining", done: "Cap reached" }[clock.phase];
  const capProgress = planFailed ? 0 : Math.min(100, (clock.workSeconds / plan.capSeconds) * 100);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Repeat className="h-4 w-4" aria-hidden="true" />
          Gym programming
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">AMRAP Workout Timer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Run the cap, tap each round as you finish it, and read your score in the standard
          &quot;rounds + reps&quot; format along with the pace you are holding and where it lands at
          the buzzer.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="amrap-cap">
              Time cap (minutes)
            </label>
            <input
              id="amrap-cap"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="120"
              step="1"
              value={capMinutes}
              onChange={(event) => setCapMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="amrap-reps">
              Reps in one full round
            </label>
            <input
              id="amrap-reps"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={repsPerRound}
              onChange={(event) => setRepsPerRound(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="amrap-prep">
              Prep countdown (seconds)
            </label>
            <input
              id="amrap-prep"
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
          <div>
            <label className={LABEL_CLASS} htmlFor="amrap-used">
              Time used so far (minutes)
            </label>
            <input
              id="amrap-used"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={elapsed > 0 ? String(Math.round((clock.workSeconds / 60) * 10) / 10) : usedMinutes}
              onChange={(event) => setUsedMinutes(event.target.value)}
              disabled={elapsed > 0}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {elapsed > 0 ? "Driven by the running clock — restart to edit." : "Used to score without running the clock."}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {CAP_PRESETS.map((minutes) => (
            <button
              key={minutes}
              type="button"
              onClick={() => {
                setCapMinutes(minutes);
                setElapsed(0);
                setRunning(false);
              }}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {minutes} min AMRAP
            </button>
          ))}
        </div>
      </section>

      {planFailed && (
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
              {planFailed ? "Clock" : phaseLabel}
            </p>
            <p className="mt-1 text-5xl font-semibold tabular-nums text-[var(--primary)]">
              {planFailed ? DASH : formatClock(Math.ceil(clock.secondsLeftInPhase))}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {planFailed
                ? "Fix the setup above to run the clock."
                : `${formatClock(clock.workSeconds)} of ${formatClock(plan.capSeconds)} used`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRunning((value) => !value)}
              disabled={planFailed}
              aria-label={running ? "Pause the AMRAP clock" : "Start the AMRAP clock"}
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
              aria-label="Restart the AMRAP clock"
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
          aria-label={planFailed ? "Cap progress unavailable" : `${NUM.format(capProgress)}% of the cap used`}
        >
          <span
            className="block h-full bg-[var(--primary)] transition-[width] duration-300 motion-reduce:transition-none"
            style={{ width: `${capProgress}%` }}
          />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-[var(--border)] p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Rounds finished
            </p>
            <div className="mt-2 flex items-center gap-2">
              <button type="button" onClick={() => bumpRound(-1)} aria-label="Remove one round" className={GHOST_BTN}>
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="min-w-12 flex-1 text-center text-2xl font-semibold tabular-nums">{rounds || "0"}</span>
              <button type="button" onClick={() => bumpRound(1)} aria-label="Add one round" className={PRIMARY_BTN}>
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Reps into the part round
            </p>
            <div className="mt-2 flex items-center gap-2">
              <button type="button" onClick={() => bumpRep(-1)} aria-label="Remove one rep" className={GHOST_BTN}>
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="min-w-12 flex-1 text-center text-2xl font-semibold tabular-nums">{extra || "0"}</span>
              <button type="button" onClick={() => bumpRep(1)} aria-label="Add one rep" className={PRIMARY_BTN}>
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {failed ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : result.score}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed ? "No score yet" : `${result.totalReps} total reps — the standard tiebreaker`}
            </p>
          </div>
          <button type="button" onClick={copyResult} aria-label="Copy the AMRAP result" className={GHOST_BTN}>
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy result"}
          </button>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Time per round", failed ? DASH : formatClock(result.secondsPerRound)],
            ["Time per rep", failed ? DASH : `${NUM.format(result.secondsPerRep)} s`],
            ["Rep rate", failed ? DASH : `${NUM.format(result.repsPerMinute)} reps/min`],
            ["Cap used", failed ? DASH : `${NUM.format(result.percentOfCapUsed)}%`],
            ["Time left in cap", failed ? DASH : formatClock(result.remainingSeconds)],
            ["Rounds left at this pace", failed ? DASH : NUM.format(result.remainingRoundsAtPace)],
            ["Projected final score", failed ? DASH : result.projectedScore],
            ["Projected total reps", failed ? DASH : String(result.projectedTotalReps)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4">
          <button type="button" onClick={reset} aria-label="Reset everything to defaults" className={PRIMARY_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset all
          </button>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The projection assumes your current pace holds to the buzzer; most athletes slow in the back
        half of a long AMRAP. General fitness information only, not medical or coaching advice.
      </p>
    </main>
  );
}
