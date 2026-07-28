"use client";

import { useMemo, useState } from "react";
import { Check, Copy, HeartPulse, RotateCcw } from "lucide-react";

import { AEROBICS_CLASSES, computeAerobicsBurn } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const show = (value, formatter = NUM0) =>
  Number.isFinite(value) ? formatter.format(value) : DASH;

const DEFAULTS = {
  weight: "75",
  weightUnit: "kg",
  minutes: "45",
  classId: "high",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw ?? "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [weightUnit, setWeightUnit] = useState(DEFAULTS.weightUnit);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [classId, setClassId] = useState(DEFAULTS.classId);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeAerobicsBurn({
        weight: toNumber(weight),
        weightUnit,
        minutes: toNumber(minutes),
        classId,
      }),
    [weight, weightUnit, minutes, classId],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Aerobics Calorie Estimate",
      `Body weight: ${NUM1.format(result.weightKg)} kg`,
      `Class: ${result.classLabel} — ${result.met} MET (${result.intensityBand} intensity)`,
      `Length: ${minutes} minutes`,
      `Calories burned: ${NUM0.format(result.grossKcal)} kcal`,
      `Net of resting metabolism: ${NUM0.format(result.netKcal)} kcal`,
      `Rate: ${NUM2.format(result.kcalPerMinute)} kcal/min (${NUM0.format(result.kcalPerHour)} kcal/hour)`,
      `Same energy as walking ${NUM2.format(result.walkKm)} km or running ${NUM2.format(result.runKm)} km`,
    ].join("\n");
  }, [hasError, result, minutes]);

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
    setClassId(DEFAULTS.classId);
    setCopied(false);
  };

  const rows = [
    ["Net of resting metabolism", hasError ? DASH : `${show(result.netKcal)} kcal`],
    ["Burn rate", hasError ? DASH : `${show(result.kcalPerMinute, NUM2)} kcal/min`],
    ["Per hour at this intensity", hasError ? DASH : `${show(result.kcalPerHour)} kcal`],
    ["Intensity used", hasError ? DASH : `${show(result.met, NUM1)} MET`],
    ["WHO intensity band", hasError ? DASH : result.intensityBand],
    [
      "Same as a brisk walk of",
      hasError ? DASH : `${show(result.walkMinutes, NUM1)} min · ${show(result.walkKm, NUM2)} km`,
    ],
    [
      "Same as running",
      hasError ? DASH : `${show(result.runMinutes, NUM1)} min · ${show(result.runKm, NUM2)} km`,
    ],
    ["Body-fat equivalent", hasError ? DASH : `${show(result.fatGramsEquivalent, NUM1)} g`],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <HeartPulse className="h-4 w-4" aria-hidden="true" />
          Class calories
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Aerobics Calorie Burn Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Low impact, high impact, aqua or step — and if it is step, the riser height changes the
          answer more than anything else. Every option here uses its own published MET value.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="aerobics-weight">
              Body weight
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="aerobics-weight"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="25"
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
            <label className={LABEL_CLASS} htmlFor="aerobics-minutes">
              Class length (minutes)
            </label>
            <input
              id="aerobics-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="300"
              step="5"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="aerobics-class">
              Class type
            </label>
            <select
              id="aerobics-class"
              className={`mt-2 ${INPUT_CLASS}`}
              value={classId}
              onChange={(event) => setClassId(event.target.value)}
            >
              {AEROBICS_CLASSES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} ({item.met} MET)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[30, 45, 60, 75].map((preset) => (
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
                : `${result.classLabel} · ${result.intensityBand} intensity`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy aerobics calorie result"
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
        <h2 className="text-base font-semibold">Every class type at your weight</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Class
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  MET
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  This length
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Per hour
                </th>
              </tr>
            </thead>
            <tbody>
              {AEROBICS_CLASSES.map((item) => {
                const row = computeAerobicsBurn({
                  weight: toNumber(weight),
                  weightUnit,
                  minutes: toNumber(minutes),
                  classId: item.id,
                });
                return (
                  <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{item.label}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{item.met}</td>
                    <td className="py-2 pr-3 text-right">
                      {row.error ? DASH : `${show(row.grossKcal)} kcal`}
                    </td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {row.error ? DASH : `${show(row.kcalPerHour)} kcal`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Published MET values assume you keep up with the class throughout; modifying moves or
        skipping the high-impact options moves the real figure down. General information only — not
        medical or dietary advice.
      </p>
    </main>
  );
}
