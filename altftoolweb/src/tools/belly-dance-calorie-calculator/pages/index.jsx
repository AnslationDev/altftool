"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Waves } from "lucide-react";

import { BELLY_DANCE_PROPS, BELLY_DANCE_STYLES, computeBellyDanceBurn } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const show = (value, formatter = NUM0) =>
  Number.isFinite(value) ? formatter.format(value) : DASH;

const DEFAULTS = {
  weight: "60",
  weightUnit: "kg",
  minutes: "50",
  styleId: "class",
  propId: "veil",
  targetKcal: "300",
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
  const [styleId, setStyleId] = useState(DEFAULTS.styleId);
  const [propId, setPropId] = useState(DEFAULTS.propId);
  const [targetKcal, setTargetKcal] = useState(DEFAULTS.targetKcal);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeBellyDanceBurn({
        weight: toNumber(weight),
        weightUnit,
        minutes: toNumber(minutes),
        styleId,
        propId,
        targetKcal: toNumber(targetKcal),
      }),
    [weight, weightUnit, minutes, styleId, propId, targetKcal],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Belly Dance Calorie Estimate",
      `Body weight: ${NUM1.format(result.weightKg)} kg`,
      `Style: ${result.styleLabel} — ${result.met} MET`,
      `Prop: ${result.propLabel}`,
      `Time: ${minutes} minutes`,
      `Calories burned: ${NUM0.format(result.grossKcal)} kcal`,
      `Net of resting metabolism: ${NUM0.format(result.netKcal)} kcal`,
      `Rate: ${NUM2.format(result.kcalPerMinute)} kcal/min (${NUM0.format(result.kcalPerHour)} kcal/hour)`,
    ];
    if (result.minutesForTarget !== null) {
      lines.push(
        `To reach ${targetKcal} kcal: ${NUM1.format(result.minutesForTarget)} minutes at this intensity`,
      );
    }
    return lines.join("\n");
  }, [hasError, result, minutes, targetKcal]);

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
    setStyleId(DEFAULTS.styleId);
    setPropId(DEFAULTS.propId);
    setTargetKcal(DEFAULTS.targetKcal);
    setCopied(false);
  };

  const rows = [
    ["Net of resting metabolism", hasError ? DASH : `${show(result.netKcal)} kcal`],
    ["Burn rate", hasError ? DASH : `${show(result.kcalPerMinute, NUM2)} kcal/min`],
    ["Per hour at this intensity", hasError ? DASH : `${show(result.kcalPerHour)} kcal`],
    ["Intensity used", hasError ? DASH : `${show(result.met, NUM1)} MET`],
    [
      "Extra from the prop",
      hasError ? DASH : `${show(result.propExtraKcal, NUM1)} kcal (${show(result.propKg, NUM1)} kg)`,
    ],
    ["Body-fat equivalent", hasError ? DASH : `${show(result.fatGramsEquivalent, NUM1)} g`],
    [
      "Minutes needed for your calorie goal",
      hasError || result.minutesForTarget === null
        ? DASH
        : `${show(result.minutesForTarget, NUM1)} min`,
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Waves className="h-4 w-4" aria-hidden="true" />
          Dance calories
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Belly Dance Calorie Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Belly dance is one of the few styles named directly in published MET tables. Pick what you
          actually did — slow drills, a full class, tribal fusion, a drum solo or a cardio format —
          and add any prop you carried.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="belly-weight">
              Body weight
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="belly-weight"
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
            <label className={LABEL_CLASS} htmlFor="belly-minutes">
              Time dancing (minutes)
            </label>
            <input
              id="belly-minutes"
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
            <label className={LABEL_CLASS} htmlFor="belly-style">
              What kind of session
            </label>
            <select
              id="belly-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={styleId}
              onChange={(event) => setStyleId(event.target.value)}
            >
              {BELLY_DANCE_STYLES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} ({item.met} MET)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="belly-prop">
              Prop carried
            </label>
            <select
              id="belly-prop"
              className={`mt-2 ${INPUT_CLASS}`}
              value={propId}
              onChange={(event) => setPropId(event.target.value)}
            >
              {BELLY_DANCE_PROPS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                  {item.kg > 0 ? ` (${item.kg} kg)` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="belly-target">
              Calorie goal (optional)
            </label>
            <input
              id="belly-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="5000"
              step="25"
              value={targetKcal}
              onChange={(event) => setTargetKcal(event.target.value)}
            />
            {result.targetNote && (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{result.targetNote}</p>
            )}
          </div>
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
              {hasError ? "Fix the input above to see an estimate." : result.styleLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy belly dance calorie result"
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
        <h2 className="text-base font-semibold">This session at each intensity</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Session type
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
              {BELLY_DANCE_STYLES.map((item) => {
                const row = computeBellyDanceBurn({
                  weight: toNumber(weight),
                  weightUnit,
                  minutes: toNumber(minutes),
                  styleId: item.id,
                  propId,
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
        Prop weight is converted using the finding that hand-carried load costs roughly 1.7 times as
        much as the same load on the torso, so the effect is real but small. General information
        only — not medical or dietary advice.
      </p>
    </main>
  );
}
