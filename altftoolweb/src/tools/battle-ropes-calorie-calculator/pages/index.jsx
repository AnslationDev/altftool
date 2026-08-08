"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Waves } from "lucide-react";
import { EFFORT_LEVELS, LIMITS, WAVE_STYLES, computeBattleRopeCalories, roundsForTarget } from "../lib";

const N0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const N1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const kcal = (value) => (Number.isFinite(value) ? `${N0.format(value)} kcal` : DASH);
const one = (value) => (Number.isFinite(value) ? N1.format(value) : DASH);

const DEFAULTS = {
  weightKg: "80",
  rounds: "10",
  workSeconds: "30",
  restSeconds: "30",
  style: "alternating",
  effort: "moderate",
  targetKcal: "200",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : NaN;
};

export default function ToolHome() {
  const [weightKg, setWeightKg] = useState(DEFAULTS.weightKg);
  const [rounds, setRounds] = useState(DEFAULTS.rounds);
  const [workSeconds, setWorkSeconds] = useState(DEFAULTS.workSeconds);
  const [restSeconds, setRestSeconds] = useState(DEFAULTS.restSeconds);
  const [style, setStyle] = useState(DEFAULTS.style);
  const [effort, setEffort] = useState(DEFAULTS.effort);
  const [targetKcal, setTargetKcal] = useState(DEFAULTS.targetKcal);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeBattleRopeCalories({
        weightKg: toNumber(weightKg),
        rounds: toNumber(rounds),
        workSeconds: toNumber(workSeconds),
        restSeconds: toNumber(restSeconds),
        style,
        effort,
      }),
    [weightKg, rounds, workSeconds, restSeconds, style, effort],
  );

  const ok = !result.error;
  const roundsNeeded = ok ? roundsForTarget(result.kcalPerRound, toNumber(targetKcal)) : null;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Battle Ropes Calorie Calculator",
      `${weightKg} kg — ${result.rounds} rounds of ${workSeconds}s work / ${restSeconds}s rest`,
      `${result.styleLabel}, ${result.effortLabel}`,
      `Calories burned: ${kcal(result.grossKcal)}`,
      `Above resting: ${kcal(result.netKcal)}`,
      `Working intensity: ${one(result.workMet)} METs`,
      `Session average: ${one(result.averageMet)} METs`,
      `Session length: ${one(result.totalMinutes)} min (${one(result.workMinutes)} min on the ropes)`,
      `Afterburn (EPOC) estimate: ${one(result.epocLowKcal)}-${one(result.epocHighKcal)} kcal`,
    ].join("\n");
  }, [ok, result, weightKg, workSeconds, restSeconds]);

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
    setWeightKg(DEFAULTS.weightKg);
    setRounds(DEFAULTS.rounds);
    setWorkSeconds(DEFAULTS.workSeconds);
    setRestSeconds(DEFAULTS.restSeconds);
    setStyle(DEFAULTS.style);
    setEffort(DEFAULTS.effort);
    setTargetKcal(DEFAULTS.targetKcal);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Waves className="h-4 w-4" aria-hidden="true" />
          Calorie burn
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Battle Ropes Calorie Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Rope work is done in short, very hard bursts, so the rest periods matter as much as the
          rounds. Enter the interval you actually run and this costs the work and the recovery
          separately, then adds a range for the afterburn.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="br-weight">
              Body weight (kg)
            </label>
            <input
              id="br-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="25"
              max="250"
              step="0.5"
              value={weightKg}
              onChange={(event) => setWeightKg(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="br-rounds">
              Rounds
            </label>
            <input
              id="br-rounds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="100"
              step="1"
              value={rounds}
              onChange={(event) => setRounds(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="br-work">
              Work per round (seconds)
            </label>
            <input
              id="br-work"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="5"
              max="600"
              step="5"
              value={workSeconds}
              onChange={(event) => setWorkSeconds(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="br-rest">
              Rest per round (seconds)
            </label>
            <input
              id="br-rest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="600"
              step="5"
              value={restSeconds}
              onChange={(event) => setRestSeconds(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="br-style">
              Rope movement
            </label>
            <select
              id="br-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={style}
              onChange={(event) => setStyle(event.target.value)}
            >
              {Object.values(WAVE_STYLES).map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="br-effort">
              Effort
            </label>
            <select
              id="br-effort"
              className={`mt-2 ${INPUT_CLASS}`}
              value={effort}
              onChange={(event) => setEffort(event.target.value)}
            >
              {Object.values(EFFORT_LEVELS).map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="br-target">
              Calorie target (optional)
            </label>
            <input
              id="br-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="10"
              max="3000"
              step="10"
              value={targetKcal}
              onChange={(event) => setTargetKcal(event.target.value)}
            />
          </div>
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Calories burned
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? kcal(result.grossKcal) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${one(result.totalMinutes)} minute session, ${one(result.workMinutes)} of it on the ropes`
                : "Fix the inputs above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy battle ropes calorie result"
              className={`${GHOST_BTN} disabled:opacity-50`}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Calories above resting (exercise only)", ok ? kcal(result.netKcal) : DASH],
            ["Working intensity", ok ? `${one(result.workMet)} METs` : DASH],
            ["Session average intensity", ok ? `${one(result.averageMet)} METs` : DASH],
            ["Burned during work intervals", ok ? kcal(result.workKcal) : DASH],
            ["Burned during recovery", ok ? kcal(result.restKcal) : DASH],
            ["Calories per round", ok ? kcal(result.kcalPerRound) : DASH],
            [
              "Work-to-rest ratio",
              ok ? (result.workRestRatio ? `${one(result.workRestRatio)} : 1` : "Continuous") : DASH,
            ],
            [
              "Afterburn (EPOC) estimate",
              ok ? `${one(result.epocLowKcal)}–${one(result.epocHighKcal)} kcal` : DASH,
            ],
            [
              "Rounds to hit your calorie target",
              ok && roundsNeeded
                ? roundsNeeded > LIMITS.rounds[1]
                  ? `${LIMITS.rounds[1]}+ rounds — split across sessions`
                  : `${N0.format(roundsNeeded)} rounds`
                : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The Compendium of Physical Activities has no battling-rope entry, so the working intensity
        here is anchored on published laboratory measurements of roughly 8 to 11 METs and scaled by
        movement and effort. Treat it as a good estimate, not a measurement. The afterburn figure is
        a range because EPOC varies enormously between people and sessions.
      </p>
    </main>
  );
}
