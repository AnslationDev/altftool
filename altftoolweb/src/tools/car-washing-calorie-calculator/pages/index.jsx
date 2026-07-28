"use client";

import { useMemo, useState } from "react";
import { CarFront, Check, Copy, RotateCcw } from "lucide-react";

import { VEHICLE_PRESETS, WASH_STAGES, computeCarWashCalories } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DEFAULT_WEIGHT = "70";
const DEFAULT_UNIT = "kg";
const DEFAULT_WASHES = "2";
const DEFAULT_PRESET = "sedan";

const presetMinutes = (id) => {
  const preset = VEHICLE_PRESETS.find((item) => item.id === id) ?? VEHICLE_PRESETS[0];
  const values = {};
  for (const stage of WASH_STAGES) {
    values[stage.id] = String(preset.minutes[stage.id] ?? 0);
  }
  return values;
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const num = (raw) => {
  const text = String(raw ?? "").trim();
  if (text === "") return 0;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
};

export default function ToolHome() {
  const [weight, setWeight] = useState(DEFAULT_WEIGHT);
  const [weightUnit, setWeightUnit] = useState(DEFAULT_UNIT);
  const [washesPerMonth, setWashesPerMonth] = useState(DEFAULT_WASHES);
  const [preset, setPreset] = useState(DEFAULT_PRESET);
  const [minutes, setMinutes] = useState(() => presetMinutes(DEFAULT_PRESET));
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const parsed = {};
    for (const stage of WASH_STAGES) {
      const value = num(minutes[stage.id]);
      if (value === null) return { error: "Enter minutes as plain numbers." };
      parsed[stage.id] = value;
    }
    return computeCarWashCalories({
      weight: num(weight),
      weightUnit,
      minutes: parsed,
      washesPerMonth: num(washesPerMonth),
    });
  }, [weight, weightUnit, minutes, washesPerMonth]);

  const hasError = Boolean(result.error);

  const applyPreset = (id) => {
    setPreset(id);
    setMinutes(presetMinutes(id));
  };

  const setStage = (id, value) => {
    setMinutes((current) => ({ ...current, [id]: value }));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Car Washing Calorie Calculator",
      `Body weight: ${NUM1.format(result.weightKg)} kg`,
      `One wash: ${NUM0.format(result.sessionMinutes)} min, ${NUM0.format(result.sessionKcal)} kcal`,
      `Net above resting: ${NUM0.format(result.sessionNetKcal)} kcal`,
      `Average intensity: ${NUM2.format(result.averageMet)} METs`,
      `Per month (${NUM0.format(result.washesPerMonth)} washes): ${NUM0.format(result.monthKcal)} kcal`,
      `Per year: ${NUM0.format(result.yearKcal)} kcal`,
      "",
      "Breakdown:",
    ];
    for (const row of result.rows) {
      lines.push(
        `- ${row.label}: ${NUM0.format(row.minutes)} min at ${NUM1.format(row.met)} METs = ${NUM0.format(row.kcal)} kcal`,
      );
    }
    return lines.join("\n");
  }, [hasError, result]);

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
    setWeight(DEFAULT_WEIGHT);
    setWeightUnit(DEFAULT_UNIT);
    setWashesPerMonth(DEFAULT_WASHES);
    setPreset(DEFAULT_PRESET);
    setMinutes(presetMinutes(DEFAULT_PRESET));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CarFront className="h-4 w-4" aria-hidden="true" />
          Household activity
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Car Washing Calorie Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Washing and waxing a vehicle is rated at 4.5 METs — moderate-intensity activity. Pick a
          vehicle size, adjust the minutes, and see what a hand wash actually costs you.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="wash-weight">
              Body weight
            </label>
            <input
              id="wash-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="20"
              step="0.5"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wash-unit">
              Weight unit
            </label>
            <select
              id="wash-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={weightUnit}
              onChange={(event) => setWeightUnit(event.target.value)}
            >
              <option value="kg">Kilograms (kg)</option>
              <option value="lb">Pounds (lb)</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="wash-frequency">
              Washes per month
            </label>
            <input
              id="wash-frequency"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="31"
              step="1"
              value={washesPerMonth}
              onChange={(event) => setWashesPerMonth(event.target.value)}
            />
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">Vehicle size preset</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {VEHICLE_PRESETS.map((item) => {
            const active = item.id === preset;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => applyPreset(item.id)}
                aria-pressed={active}
                className={`${CHIP_BTN} ${
                  active
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <h2 className="mt-6 text-base font-semibold">Minutes per stage</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {WASH_STAGES.map((stage) => (
            <div key={stage.id}>
              <label className={LABEL_CLASS} htmlFor={`wash-${stage.id}`}>
                {stage.label}
              </label>
              <input
                id={`wash-${stage.id}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={minutes[stage.id]}
                onChange={(event) => setStage(stage.id, event.target.value)}
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {NUM1.format(stage.met)} METs · code {stage.code}
              </p>
            </div>
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
              Calories per wash
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM0.format(result.sessionKcal)} kcal`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see a result."
                : `${NUM0.format(result.sessionMinutes)} minutes of hand washing`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy car washing calorie result"
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
          {[
            [
              "Net above resting, per wash",
              hasError ? DASH : `${NUM0.format(result.sessionNetKcal)} kcal`,
            ],
            ["Average intensity", hasError ? DASH : `${NUM2.format(result.averageMet)} METs`],
            ["Burn rate", hasError ? DASH : `${NUM1.format(result.kcalPerMin)} kcal/min`],
            ["Minutes per month", hasError ? DASH : NUM0.format(result.monthMinutes)],
            ["Calories per month", hasError ? DASH : `${NUM0.format(result.monthKcal)} kcal`],
            ["Calories per year", hasError ? DASH : `${NUM0.format(result.yearKcal)} kcal`],
            ["Net per year", hasError ? DASH : `${NUM0.format(result.yearNetKcal)} kcal`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.rows.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Stage-by-stage breakdown</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Stage
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Minutes
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    METs
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    kcal
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{row.label}</td>
                    <td className="py-2 pr-3 text-right">{NUM0.format(row.minutes)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {NUM1.format(row.met)}
                    </td>
                    <td className="py-2 text-right font-semibold">{NUM0.format(row.kcal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The vehicle presets are typical timings offered as a starting point — edit them to match how
        you actually wash. MET values describe an average adult. Informational only, not medical
        advice.
      </p>
    </main>
  );
}
