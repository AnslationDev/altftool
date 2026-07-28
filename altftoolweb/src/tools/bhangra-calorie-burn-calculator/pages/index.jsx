"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Drum, RotateCcw } from "lucide-react";

import { BHANGRA_INTENSITIES, computeBhangraBurn } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const show = (value, formatter = NUM0) =>
  Number.isFinite(value) ? formatter.format(value) : DASH;

const DEFAULTS = {
  weight: "70",
  weightUnit: "kg",
  minutes: "45",
  intensityId: "typical",
  activeShare: "80",
  sessionsPerWeek: "3",
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
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [weightUnit, setWeightUnit] = useState(DEFAULTS.weightUnit);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [intensityId, setIntensityId] = useState(DEFAULTS.intensityId);
  const [activeShare, setActiveShare] = useState(DEFAULTS.activeShare);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(DEFAULTS.sessionsPerWeek);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeBhangraBurn({
        weight: toNumber(weight),
        weightUnit,
        minutes: toNumber(minutes),
        intensityId,
        activeSharePercent: toNumber(activeShare),
        sessionsPerWeek: toNumber(sessionsPerWeek),
      }),
    [weight, weightUnit, minutes, intensityId, activeShare, sessionsPerWeek],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Bhangra Calorie Burn",
      `Body weight: ${NUM1.format(result.weightKg)} kg`,
      `Session: ${minutes} min (${result.activeMinutes} min dancing, ${result.breakMinutes} min break)`,
      `Intensity: ${result.intensityLabel} — ${result.met} MET`,
      `Calories burned: ${NUM0.format(result.grossKcal)} kcal`,
      `Net of resting metabolism: ${NUM0.format(result.netKcal)} kcal`,
      `Rate while dancing: ${NUM2.format(result.kcalPerMinute)} kcal/min (${NUM0.format(result.kcalPerHour)} kcal/hour)`,
      `Weekly total at ${sessionsPerWeek} sessions: ${NUM0.format(result.weeklyGrossKcal)} kcal`,
    ].join("\n");
  }, [hasError, result, minutes, sessionsPerWeek]);

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
    setMinutes(DEFAULTS.minutes);
    setIntensityId(DEFAULTS.intensityId);
    setActiveShare(DEFAULTS.activeShare);
    setSessionsPerWeek(DEFAULTS.sessionsPerWeek);
    setCopied(false);
  };

  const rows = [
    ["Net of resting metabolism", hasError ? DASH : `${show(result.netKcal)} kcal`],
    ["Rate while dancing", hasError ? DASH : `${show(result.kcalPerMinute, NUM2)} kcal/min`],
    ["Per hour of non-stop bhangra", hasError ? DASH : `${show(result.kcalPerHour)} kcal`],
    ["Intensity used", hasError ? DASH : `${show(result.met, NUM1)} MET`],
    ["Average MET across the session", hasError ? DASH : show(result.averageMet, NUM2)],
    ["Time actually dancing", hasError ? DASH : `${show(result.activeMinutes, NUM1)} min`],
    ["Body-fat equivalent", hasError ? DASH : `${show(result.fatGramsEquivalent, NUM1)} g`],
    ["Weekly total", hasError ? DASH : `${show(result.weeklyGrossKcal)} kcal`],
    [
      "Weeks to burn 1 kg of fat at this rate",
      hasError || !result.weeksToBurnOneKgFat ? DASH : `${show(result.weeksToBurnOneKgFat, NUM1)} weeks`,
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Drum className="h-4 w-4" aria-hidden="true" />
          Dance calories
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Bhangra Calorie Burn Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Bhangra is one of the most demanding folk dances going — constant jumps, shoulder work and
          arm lifts. Enter your weight, how long you danced and how hard, and get a MET-based
          calorie estimate with the break time handled separately.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bhangra-weight">
              Body weight
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="bhangra-weight"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="10"
                step="0.5"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
              />
              <select
                aria-label="Weight unit"
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
            <label className={LABEL_CLASS} htmlFor="bhangra-minutes">
              Session length (minutes)
            </label>
            <input
              id="bhangra-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="600"
              step="5"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bhangra-intensity">
              How hard were you going?
            </label>
            <select
              id="bhangra-intensity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={intensityId}
              onChange={(event) => setIntensityId(event.target.value)}
            >
              {BHANGRA_INTENSITIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} ({item.met} MET)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="bhangra-active">
              Share of session actually dancing (%)
            </label>
            <input
              id="bhangra-active"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="10"
              max="100"
              step="5"
              value={activeShare}
              onChange={(event) => setActiveShare(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="bhangra-sessions">
              Sessions per week
            </label>
            <input
              id="bhangra-sessions"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="21"
              step="1"
              value={sessionsPerWeek}
              onChange={(event) => setSessionsPerWeek(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[15, 30, 45, 60, 90].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setMinutes(String(preset))}
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
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
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
                : `${show(result.activeMinutes, NUM1)} min dancing plus ${show(result.breakMinutes, NUM1)} min of breaks`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy bhangra calorie result"
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Intensity levels used</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Level
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  MET
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  kcal/hour at your weight
                </th>
              </tr>
            </thead>
            <tbody>
              {BHANGRA_INTENSITIES.map((item) => {
                const row = computeBhangraBurn({
                  weight: toNumber(weight),
                  weightUnit,
                  minutes: 60,
                  intensityId: item.id,
                  activeSharePercent: 100,
                  sessionsPerWeek: 1,
                });
                return (
                  <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{item.label}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{item.met}</td>
                    <td className="py-2 text-right">
                      {row.error ? DASH : `${show(row.grossKcal)} kcal`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        MET-based estimates describe an average adult and can be 15-20% out for any one person —
        fitness, technique, heat and how much of the routine is jumping all move the number. This is
        general information, not medical or dietary advice.
      </p>
    </main>
  );
}
