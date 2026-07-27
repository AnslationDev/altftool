"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Waves } from "lucide-react";

import { SWIM_STROKES, computeSwimCalories } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const n0 = (v) => (Number.isFinite(v) ? NUM0.format(v) : DASH);
const n1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);
const n2 = (v) => (Number.isFinite(v) ? NUM2.format(v) : DASH);

const paceText = (minutesPer100m) => {
  if (!Number.isFinite(minutesPer100m)) return DASH;
  const total = Math.round(minutesPer100m * 60);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, "0")} min/100 m`;
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  weight: "70",
  weightUnit: "kg",
  strokeId: "freestyle-slow",
  minutes: "30",
  laps: "40",
  poolLength: "25",
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [weightUnit, setWeightUnit] = useState(DEFAULTS.weightUnit);
  const [strokeId, setStrokeId] = useState(DEFAULTS.strokeId);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [laps, setLaps] = useState(DEFAULTS.laps);
  const [poolLength, setPoolLength] = useState(DEFAULTS.poolLength);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeSwimCalories({
        weight: toNumber(weight),
        weightUnit,
        strokeId,
        minutes: toNumber(minutes),
        laps: String(laps).trim() === "" ? 0 : toNumber(laps),
        poolLength: toNumber(poolLength),
      }),
    [weight, weightUnit, strokeId, minutes, laps, poolLength],
  );

  const error = result.error || "";

  const summary = useMemo(() => {
    if (error) return "";
    return [
      "Swimming Calorie Burn Calculator",
      `Stroke: ${result.strokeLabel} (${result.met} MET)`,
      `Body weight: ${n1(result.weightKg)} kg`,
      `Time in the water: ${n0(result.minutes)} min`,
      result.distanceM ? `Distance: ${n0(result.distanceM)} m` : null,
      result.pacePer100mMin ? `Pace: ${paceText(result.pacePer100mMin)}` : null,
      `Calories burned (gross): ${n0(result.grossKcal)} kcal`,
      `Calories burned (net of resting): ${n0(result.netKcal)} kcal`,
      `Burn rate: ${n1(result.kcalPerMinute)} kcal/min (${n0(result.kcalPerHour)} kcal/hour)`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [error, result]);

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
    setStrokeId(DEFAULTS.strokeId);
    setMinutes(DEFAULTS.minutes);
    setLaps(DEFAULTS.laps);
    setPoolLength(DEFAULTS.poolLength);
    setCopied(false);
  };

  const rows = [
    ["Net calories (resting burn removed)", error ? DASH : `${n0(result.netKcal)} kcal`],
    ["Burn rate", error ? DASH : `${n1(result.kcalPerMinute)} kcal/min`],
    ["If you kept going for an hour", error ? DASH : `${n0(result.kcalPerHour)} kcal`],
    ["Intensity of this stroke", error ? DASH : `${n1(result.met)} MET`],
    ["Distance covered", error || !result.distanceM ? DASH : `${n0(result.distanceM)} m`],
    ["Pace", error || !result.pacePer100mMin ? DASH : paceText(result.pacePer100mMin)],
    ["Calories per 100 m", error || !result.kcalPer100m ? DASH : `${n1(result.kcalPer100m)} kcal`],
    ["Calories per length", error || !result.kcalPerLap ? DASH : `${n1(result.kcalPerLap)} kcal`],
    ["Body-fat equivalent", error ? DASH : `${n1(result.fatGrams)} g`],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Waves className="h-4 w-4" aria-hidden="true" />
          Swimming
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Swimming Calorie Burn Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Estimate the calories burned in the pool from your body weight, stroke and time in the
          water, using the MET values published in the 2011 Compendium of Physical Activities. Add
          your lengths to see distance, pace and calories per 100 m.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="swim-weight">
              Body weight
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="swim-weight"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="20"
                step="0.5"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
              />
              <select
                id="swim-weight-unit"
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
            <label className={LABEL_CLASS} htmlFor="swim-minutes">
              Time in the water (minutes)
            </label>
            <input
              id="swim-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="swim-stroke">
              Stroke and effort
            </label>
            <select
              id="swim-stroke"
              className={`mt-2 ${INPUT_CLASS}`}
              value={strokeId}
              onChange={(event) => setStrokeId(event.target.value)}
            >
              {SWIM_STROKES.map((stroke) => (
                <option key={stroke.id} value={stroke.id}>
                  {stroke.label} — {stroke.met} MET
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="swim-laps">
              Lengths swum (optional)
            </label>
            <input
              id="swim-laps"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={laps}
              onChange={(event) => setLaps(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="swim-pool">
              Pool length (metres)
            </label>
            <input
              id="swim-pool"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="5"
              max="100"
              step="1"
              value={poolLength}
              onChange={(event) => setPoolLength(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[15, 30, 45, 60].map((preset) => (
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

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Calories burned
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error ? DASH : `${n0(result.grossKcal)} kcal`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error
                ? "Fix the input above to see your estimate."
                : `${n0(result.minutes)} minutes of ${result.strokeLabel.toLowerCase()}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy swimming calorie result"
              className={GHOST_BTN}
              disabled={Boolean(error)}
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
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Same session, other strokes</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Stroke
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  MET
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Calories
                </th>
              </tr>
            </thead>
            <tbody>
              {SWIM_STROKES.map((stroke) => {
                const row = computeSwimCalories({
                  weight: toNumber(weight),
                  weightUnit,
                  strokeId: stroke.id,
                  minutes: toNumber(minutes),
                });
                return (
                  <tr key={stroke.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{stroke.label}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {n2(stroke.met)}
                    </td>
                    <td className="py-2 text-right font-semibold">
                      {row.error ? DASH : `${n0(row.grossKcal)} kcal`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        MET-based estimates describe an average adult, so your real burn varies with technique,
        water temperature, body composition and rest between sets. This is informational only and is
        not medical or dietary advice.
      </p>
    </main>
  );
}
