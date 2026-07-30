"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Dumbbell, RotateCcw } from "lucide-react";

import {
  LIFT_INTENSITIES,
  REST_MET,
  WARMUP_MET,
  compareIntensities,
  computeLiftingCalories,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const show = (value, formatter = NUM0) =>
  Number.isFinite(value) ? formatter.format(value) : DASH;

const DEFAULTS = {
  weight: "80",
  weightUnit: "kg",
  sets: "20",
  secondsPerSet: "45",
  restSeconds: "90",
  warmupMinutes: "10",
  intensity: "compound",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";

const toNumber = (raw) => {
  const trimmed = String(raw ?? "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [weightUnit, setWeightUnit] = useState(DEFAULTS.weightUnit);
  const [sets, setSets] = useState(DEFAULTS.sets);
  const [secondsPerSet, setSecondsPerSet] = useState(DEFAULTS.secondsPerSet);
  const [restSeconds, setRestSeconds] = useState(DEFAULTS.restSeconds);
  const [warmupMinutes, setWarmupMinutes] = useState(DEFAULTS.warmupMinutes);
  const [intensity, setIntensity] = useState(DEFAULTS.intensity);
  const [copied, setCopied] = useState(false);

  const input = useMemo(
    () => ({
      weight: toNumber(weight),
      weightUnit,
      sets: toNumber(sets),
      secondsPerSet: toNumber(secondsPerSet),
      restSeconds: toNumber(restSeconds),
      warmupMinutes: toNumber(warmupMinutes),
    }),
    [weight, weightUnit, sets, secondsPerSet, restSeconds, warmupMinutes],
  );

  const result = useMemo(() => computeLiftingCalories({ ...input, intensity }), [input, intensity]);
  const comparison = useMemo(() => compareIntensities(input), [input]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Weightlifting Session Energy",
      `Body weight: ${NUM1.format(result.weightKg)} kg`,
      `Intensity: ${result.intensityLabel} — ${result.liftMet} MET (${result.liftMetSource})`,
      `${result.setCount} working sets of ${secondsPerSet}s, ${result.restIntervals} rests of ${restSeconds}s, ${NUM0.format(result.warmupMinutes)} min warm-up`,
      `Session length: ${NUM1.format(result.totalMinutes)} minutes`,
      "",
      `Working sets: ${NUM0.format(result.workKcal)} kcal (${NUM0.format(result.workShare)}%)`,
      `Rest between sets: ${NUM0.format(result.restKcal)} kcal (${NUM0.format(result.restShare)}%)`,
      `Warm-up: ${NUM0.format(result.warmupKcal)} kcal (${NUM0.format(result.warmupShare)}%)`,
      `Total burned: ${NUM0.format(result.grossKcal)} kcal`,
      `Net of resting metabolism: ${NUM0.format(result.netKcal)} kcal`,
      `Average intensity: ${NUM2.format(result.averageMet)} MET across the whole session`,
      "",
      result.basis,
    ].join("\n");
  }, [hasError, result, secondsPerSet, restSeconds]);

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
    setWeight(DEFAULTS.weight);
    setWeightUnit(DEFAULTS.weightUnit);
    setSets(DEFAULTS.sets);
    setSecondsPerSet(DEFAULTS.secondsPerSet);
    setRestSeconds(DEFAULTS.restSeconds);
    setWarmupMinutes(DEFAULTS.warmupMinutes);
    setIntensity(DEFAULTS.intensity);
    setCopied(false);
  };

  const breakdown = hasError
    ? []
    : [
        {
          phase: "Working sets",
          detail: `${result.setCount} × ${secondsPerSet}s at ${result.liftMet} MET`,
          minutes: result.workMinutes,
          kcal: result.workKcal,
          share: result.workShare,
        },
        {
          phase: "Rest between sets",
          detail: `${result.restIntervals} × ${restSeconds}s at ${REST_MET} MET`,
          minutes: result.restMinutes,
          kcal: result.restKcal,
          share: result.restShare,
        },
        {
          phase: "Warm-up / cool-down",
          detail: `${NUM0.format(result.warmupMinutes)} min at ${WARMUP_MET} MET`,
          minutes: result.warmupMinutes,
          kcal: result.warmupKcal,
          share: result.warmupShare,
        },
      ];

  const rows = [
    ["Net of resting metabolism", hasError ? DASH : `${show(result.netKcal)} kcal`],
    ["Session length", hasError ? DASH : `${show(result.totalMinutes, NUM1)} min`],
    ["Average intensity", hasError ? DASH : `${show(result.averageMet, NUM2)} MET`],
    ["Burn rate", hasError ? DASH : `${show(result.kcalPerMinute, NUM2)} kcal/min`],
    ["If you lifted for a full hour", hasError ? DASH : `${show(result.kcalPerHour)} kcal`],
    ["Per working set", hasError ? DASH : `${show(result.kcalPerSet, NUM1)} kcal`],
    ["Body-fat equivalent", hasError ? DASH : `${show(result.fatGramsEquivalent, NUM1)} g`],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Dumbbell className="h-4 w-4" aria-hidden="true" />
          Sets and rest priced separately
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Weightlifting Calorie Burn Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          An hour in the weights room is not an hour of effort. The working sets are short and hard;
          the rest between them is barely above standing. This calculator times the two separately and
          applies the published Compendium MET value for each, instead of smearing one average across
          the whole session.
        </p>
      </header>

      <section className={CARD}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lift-weight">
              Body weight
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="lift-weight"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="20"
                step="0.5"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
              />
              <select
                aria-label="Body weight unit"
                className={`${INPUT_CLASS} w-24`}
                value={weightUnit}
                onChange={(event) => setWeightUnit(event.target.value)}
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="lift-sets">
              Working sets in the session
            </label>
            <input
              id="lift-sets"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="100"
              step="1"
              value={sets}
              onChange={(event) => setSets(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Count only the sets you actually worked, not warm-up singles.
            </p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="lift-set-seconds">
              Seconds per working set
            </label>
            <input
              id="lift-set-seconds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="600"
              step="5"
              value={secondsPerSet}
              onChange={(event) => setSecondsPerSet(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Time under tension: roughly 3 seconds per rep for a controlled tempo.
            </p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="lift-rest-seconds">
              Rest between sets (seconds)
            </label>
            <input
              id="lift-rest-seconds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="1200"
              step="15"
              value={restSeconds}
              onChange={(event) => setRestSeconds(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="lift-warmup">
              Warm-up and cool-down (minutes)
            </label>
            <input
              id="lift-warmup"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="120"
              step="5"
              value={warmupMinutes}
              onChange={(event) => setWarmupMinutes(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="lift-intensity">
              What the working sets were
            </label>
            <select
              id="lift-intensity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={intensity}
              onChange={(event) => setIntensity(event.target.value)}
            >
              {LIFT_INTENSITIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} ({item.met} MET)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { label: "Short rest (60s)", value: "60" },
            { label: "Standard (90s)", value: "90" },
            { label: "Strength (180s)", value: "180" },
          ].map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setRestSeconds(preset.value)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Calories burned
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${show(result.grossKcal)} kcal`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see an estimate."
                : `${result.setCount} sets · ${show(result.totalMinutes, NUM1)} minutes in the gym`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the session breakdown"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.basis}
          </p>
        )}
      </section>

      {!hasError && (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Where the energy actually went</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Phase</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">How it was timed</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Minutes</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">kcal</th>
                  <th scope="col" className="py-2 text-right font-semibold">Share</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map((row) => (
                  <tr key={row.phase} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.phase}</td>
                    <td className="py-2 pr-3 text-xs text-[var(--muted-foreground)]">{row.detail}</td>
                    <td className="py-2 pr-3 text-right">{show(row.minutes, NUM1)}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{show(row.kcal)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {show(row.share, NUM0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            Rest is counted {result.restIntervals} times, not {result.setCount}: {result.setCount} sets have{" "}
            {result.restIntervals} gaps between them, and you do not rest after the last one.
          </p>
        </section>
      )}

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">The same session at each Compendium intensity</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Working sets</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">MET</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Total</th>
                <th scope="col" className="py-2 font-semibold">Compendium code</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b border-[var(--border)] last:border-0 ${
                    item.id === intensity ? "font-semibold text-[var(--primary)]" : ""
                  }`}
                >
                  <td className="py-2 pr-3">{item.label}</td>
                  <td className="py-2 pr-3 text-right">{item.met}</td>
                  <td className="py-2 pr-3 text-right">
                    {item.result.error ? DASH : `${show(item.result.grossKcal)} kcal`}
                  </td>
                  <td className="py-2 text-xs text-[var(--muted-foreground)]">{item.code}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        MET values are population averages from the 2011 Compendium of Physical Activities, applied through the
        ACSM oxygen-cost equation. They describe the energy spent during the session itself and do not include
        the raised metabolic rate that follows a hard lift. General information only — not medical or dietary
        advice.
      </p>
    </main>
  );
}
