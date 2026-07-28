"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Zap } from "lucide-react";
import { computeJumpRopeCalories } from "../lib";

const N0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const N1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const kcal = (value) => (Number.isFinite(value) ? `${N0.format(value)} kcal` : DASH);
const one = (value) => (Number.isFinite(value) ? N1.format(value) : DASH);

const DEFAULTS = {
  weightKg: "70",
  skipsPerMinute: "120",
  totalMinutes: "20",
  workSeconds: "60",
  restSeconds: "30",
};

const PRESETS = [
  { label: "Continuous", workSeconds: "60", restSeconds: "0" },
  { label: "60 on / 30 off", workSeconds: "60", restSeconds: "30" },
  { label: "30 on / 30 off", workSeconds: "30", restSeconds: "30" },
  { label: "20 on / 10 off", workSeconds: "20", restSeconds: "10" },
];

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
  const [skipsPerMinute, setSkipsPerMinute] = useState(DEFAULTS.skipsPerMinute);
  const [totalMinutes, setTotalMinutes] = useState(DEFAULTS.totalMinutes);
  const [workSeconds, setWorkSeconds] = useState(DEFAULTS.workSeconds);
  const [restSeconds, setRestSeconds] = useState(DEFAULTS.restSeconds);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeJumpRopeCalories({
        weightKg: toNumber(weightKg),
        skipsPerMinute: toNumber(skipsPerMinute),
        totalMinutes: toNumber(totalMinutes),
        workSeconds: toNumber(workSeconds),
        restSeconds: toNumber(restSeconds),
      }),
    [weightKg, skipsPerMinute, totalMinutes, workSeconds, restSeconds],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Jump Rope Calorie Calculator",
      `${weightKg} kg, ${skipsPerMinute} skips/min, ${totalMinutes} min session`,
      `Intervals: ${workSeconds}s work / ${restSeconds}s rest`,
      `Calories burned: ${kcal(result.grossKcal)}`,
      `Above resting: ${kcal(result.netKcal)}`,
      `Working intensity: ${one(result.workMet)} METs (${result.paceLabel})`,
      `Session average: ${one(result.averageMet)} METs`,
      `Total skips: ${N0.format(result.totalSkips)}`,
      `Time actually skipping: ${one(result.workMinutes)} min`,
    ].join("\n");
  }, [ok, result, weightKg, skipsPerMinute, totalMinutes, workSeconds, restSeconds]);

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
    setSkipsPerMinute(DEFAULTS.skipsPerMinute);
    setTotalMinutes(DEFAULTS.totalMinutes);
    setWorkSeconds(DEFAULTS.workSeconds);
    setRestSeconds(DEFAULTS.restSeconds);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Zap className="h-4 w-4" aria-hidden="true" />
          Calorie burn
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Jump Rope Calorie Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Nobody skips flat out for twenty minutes. Enter your work and rest intervals and this
          blends the working intensity with the rest periods, so the answer reflects the session you
          actually did rather than the one on paper.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="jr-weight">
              Body weight (kg)
            </label>
            <input
              id="jr-weight"
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
            <label className={LABEL_CLASS} htmlFor="jr-rate">
              Skips per minute
            </label>
            <input
              id="jr-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="30"
              max="250"
              step="5"
              value={skipsPerMinute}
              onChange={(event) => setSkipsPerMinute(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jr-total">
              Total session (minutes)
            </label>
            <input
              id="jr-total"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="180"
              step="1"
              value={totalMinutes}
              onChange={(event) => setTotalMinutes(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS} htmlFor="jr-work">
                Work (sec)
              </label>
              <input
                id="jr-work"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="5"
                max="3600"
                step="5"
                value={workSeconds}
                onChange={(event) => setWorkSeconds(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="jr-rest">
                Rest (sec)
              </label>
              <input
                id="jr-rest"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="3600"
                step="5"
                value={restSeconds}
                onChange={(event) => setRestSeconds(event.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setWorkSeconds(preset.workSeconds);
                setRestSeconds(preset.restSeconds);
              }}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
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
                ? `${N0.format(result.totalSkips)} skips across ${one(result.workMinutes)} minutes of actual rope time`
                : "Fix the inputs above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy jump rope calorie result"
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
            ["Compendium band", ok ? result.paceLabel : DASH],
            ["Session average intensity", ok ? `${one(result.averageMet)} METs` : DASH],
            ["Burn rate while skipping", ok ? `${one(result.workKcalPerMin)} kcal/min` : DASH],
            [
              "Time skipping / resting",
              ok ? `${one(result.workMinutes)} / ${one(result.restMinutes)} min` : DASH,
            ],
            ["Rounds completed", ok ? N0.format(result.rounds) : DASH],
            ["Skips per calorie", ok ? one(result.skipsPerKcal) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates from population MET values, so an individual can sit 10 to 20 percent either side.
        Skipping is high impact — build up gradually, land softly through the forefoot, and stop if
        you get shin, knee or Achilles pain rather than pushing through it.
      </p>
    </main>
  );
}
