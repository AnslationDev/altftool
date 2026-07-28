"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Goal, RotateCcw } from "lucide-react";

import {
  FOOTBALL_MODES,
  FOOTBALL_POSITIONS,
  computeFootballCalories,
  toKilograms,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DEFAULTS = {
  weight: "70",
  unit: "kg",
  minutes: "90",
  mode: "competitive",
  position: "central-midfielder",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [position, setPosition] = useState(DEFAULTS.position);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeFootballCalories({
        weightKg: toKilograms(weight, unit),
        minutes: Number(String(minutes).trim()),
        modeId: mode,
        positionId: position,
      }),
    [weight, unit, minutes, mode, position],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Football Calorie Burn",
      `${result.modeLabel} — ${result.positionLabel}`,
      `Body weight: ${NUM1.format(result.weightKg)} kg`,
      `Time played: ${NUM0.format(result.minutes)} min`,
      `MET used: ${NUM2.format(result.effectiveMet)}`,
      `Calories burned: ${NUM0.format(result.kcal)} kcal`,
      `Net of resting burn: ${NUM0.format(result.netKcal)} kcal`,
      `Burn rate: ${NUM1.format(result.kcalPerMinute)} kcal/min`,
      result.distanceKm === null
        ? null
        : `Typical distance covered: ${NUM1.format(result.distanceKm)} km`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, result]);

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
    setUnit(DEFAULTS.unit);
    setMinutes(DEFAULTS.minutes);
    setMode(DEFAULTS.mode);
    setPosition(DEFAULTS.position);
    setCopied(false);
  };

  const rows = [
    ["Net of resting metabolism", ok ? `${NUM0.format(result.netKcal)} kcal` : DASH],
    ["Burn rate", ok ? `${NUM1.format(result.kcalPerMinute)} kcal/min` : DASH],
    ["Per hour of play", ok ? `${NUM0.format(result.kcalPerHour)} kcal/hour` : DASH],
    ["MET used (intensity x position)", ok ? NUM2.format(result.effectiveMet) : DASH],
    ["Position workload factor", ok ? `${NUM2.format(result.positionFactor)}x` : DASH],
    [
      "Typical distance covered",
      ok ? (result.distanceKm === null ? "Not applicable to drills" : `${NUM1.format(result.distanceKm)} km`) : DASH,
    ],
    ["Calories per kg of body weight", ok ? `${NUM1.format(result.kcalPerKg)} kcal/kg` : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Goal className="h-4 w-4" aria-hidden="true" />
          Football
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Football Calorie Burn Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Estimate the calories you burn in a match or training session using MET values from the
          Compendium of Physical Activities, scaled by the distance your position actually covers.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fb-weight">
              Body weight
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="fb-weight"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="20"
                step="0.5"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
              />
              <select
                id="fb-unit"
                aria-label="Weight unit"
                className={`${INPUT_CLASS} w-24`}
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="fb-minutes">
              Minutes played
            </label>
            <input
              id="fb-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="5"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="fb-mode">
              Match or training intensity
            </label>
            <select
              id="fb-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              {FOOTBALL_MODES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} ({item.met} MET)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="fb-position">
              Position played
            </label>
            <select
              id="fb-position"
              className={`mt-2 ${INPUT_CLASS}`}
              value={position}
              onChange={(event) => setPosition(event.target.value)}
            >
              {FOOTBALL_POSITIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[45, 60, 90, 120].map((preset) => (
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

      {result.error ? (
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
              Calories burned
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${NUM0.format(result.kcal)} kcal` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? `${result.modeLabel} · ${result.positionLabel}` : "Fix the input above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy football calorie burn result"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
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
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">How much ground each position covers</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Position</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Distance / 90 min</th>
                <th scope="col" className="py-2 text-right font-semibold">Workload factor</th>
              </tr>
            </thead>
            <tbody>
              {FOOTBALL_POSITIONS.map((item) => (
                <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{item.label}</td>
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                    {NUM1.format(item.distanceKm)} km
                  </td>
                  <td className="py-2 text-right">{NUM2.format(item.factor)}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. MET tables describe an average adult, so real burn varies with
        fitness, pitch size, weather and how much of the match you spend at a sprint. Speak to a
        doctor or sports dietitian before using these numbers to plan weight loss or fuelling.
      </p>
    </main>
  );
}
