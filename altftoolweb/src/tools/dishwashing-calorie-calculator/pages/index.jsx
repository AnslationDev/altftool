"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Droplets, RotateCcw } from "lucide-react";

import { WASH_METHODS, computeDishwashingCalories } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = {
  weight: "70",
  weightUnit: "kg",
  method: "sink",
  minutesPerSession: "15",
  sessionsPerDay: "2",
  daysPerWeek: "7",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const num = (raw) => {
  const text = String(raw ?? "").trim();
  if (text === "") return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
};

export default function ToolHome() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [weightUnit, setWeightUnit] = useState(DEFAULTS.weightUnit);
  const [method, setMethod] = useState(DEFAULTS.method);
  const [minutesPerSession, setMinutesPerSession] = useState(DEFAULTS.minutesPerSession);
  const [sessionsPerDay, setSessionsPerDay] = useState(DEFAULTS.sessionsPerDay);
  const [daysPerWeek, setDaysPerWeek] = useState(DEFAULTS.daysPerWeek);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeDishwashingCalories({
        weight: num(weight),
        weightUnit,
        method,
        minutesPerSession: num(minutesPerSession),
        sessionsPerDay: num(sessionsPerDay),
        daysPerWeek: num(daysPerWeek),
      }),
    [weight, weightUnit, method, minutesPerSession, sessionsPerDay, daysPerWeek],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Dishwashing Calorie Calculator",
      `Body weight: ${NUM1.format(result.weightKg)} kg`,
      `Method: ${result.method.label} (${NUM1.format(result.method.met)} METs)`,
      `Per wash (${NUM0.format(result.sessionMinutes)} min): ${NUM0.format(result.sessionKcal)} kcal`,
      `Per day: ${NUM0.format(result.dayKcal)} kcal`,
      `Per week: ${NUM0.format(result.weekKcal)} kcal`,
      `Per year: ${NUM0.format(result.yearKcal)} kcal`,
      `Net above resting, per day: ${NUM0.format(result.dayNetKcal)} kcal`,
      result.daysToBurnKgFat
        ? `Days of washing up equal to 1 kg of body fat: ${NUM0.format(result.daysToBurnKgFat)}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
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
    setWeight(DEFAULTS.weight);
    setWeightUnit(DEFAULTS.weightUnit);
    setMethod(DEFAULTS.method);
    setMinutesPerSession(DEFAULTS.minutesPerSession);
    setSessionsPerDay(DEFAULTS.sessionsPerDay);
    setDaysPerWeek(DEFAULTS.daysPerWeek);
    setCopied(false);
  };

  const activeMethod = WASH_METHODS.find((item) => item.id === method) ?? WASH_METHODS[0];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Droplets className="h-4 w-4" aria-hidden="true" />
          Household activity
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Dishwashing Calorie Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Estimate the calories a wash-up costs, and what that adds up to over a week and a year,
          using compendium MET values for washing dishes at 1.8 to 3.3 METs.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dish-weight">
              Body weight
            </label>
            <input
              id="dish-weight"
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
            <label className={LABEL_CLASS} htmlFor="dish-unit">
              Weight unit
            </label>
            <select
              id="dish-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={weightUnit}
              onChange={(event) => setWeightUnit(event.target.value)}
            >
              <option value="kg">Kilograms (kg)</option>
              <option value="lb">Pounds (lb)</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dish-method">
              How you wash up
            </label>
            <select
              id="dish-method"
              className={`mt-2 ${INPUT_CLASS}`}
              value={method}
              onChange={(event) => setMethod(event.target.value)}
            >
              {WASH_METHODS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} — {item.met} METs
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{activeMethod.source}</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dish-minutes">
              Minutes per wash
            </label>
            <input
              id="dish-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={minutesPerSession}
              onChange={(event) => setMinutesPerSession(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dish-sessions">
              Washes per day
            </label>
            <input
              id="dish-sessions"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              step="1"
              value={sessionsPerDay}
              onChange={(event) => setSessionsPerDay(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dish-days">
              Days per week you wash up
            </label>
            <input
              id="dish-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="7"
              step="1"
              value={daysPerWeek}
              onChange={(event) => setDaysPerWeek(event.target.value)}
            />
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
              Calories per wash
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM0.format(result.sessionKcal)} kcal`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see a result."
                : `${NUM0.format(result.sessionMinutes)} minutes at ${NUM1.format(result.method.met)} METs`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy dishwashing calorie result"
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
            ["Burn rate", hasError ? DASH : `${NUM1.format(result.grossPerMin)} kcal/min`],
            ["Per day", hasError ? DASH : `${NUM0.format(result.dayKcal)} kcal`],
            ["Per week", hasError ? DASH : `${NUM0.format(result.weekKcal)} kcal`],
            ["Per year", hasError ? DASH : `${NUM0.format(result.yearKcal)} kcal`],
            [
              "Net above resting, per day",
              hasError ? DASH : `${NUM0.format(result.dayNetKcal)} kcal`,
            ],
            [
              "Net above resting, per year",
              hasError ? DASH : `${NUM0.format(result.yearNetKcal)} kcal`,
            ],
            [
              "Days of washing up worth 1 kg of body fat",
              hasError || !result.daysToBurnKgFat
                ? DASH
                : `${NUM0.format(result.daysToBurnKgFat)} days`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">MET values used</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Method
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  METs
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Code
                </th>
              </tr>
            </thead>
            <tbody>
              {WASH_METHODS.map((item) => (
                <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{item.label}</td>
                  <td className="py-2 pr-3 text-right">{NUM1.format(item.met)}</td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">{item.code}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        MET values describe an average adult, so your real burn depends on body composition and how
        briskly you work. The 7,700 kcal per kilogram fat equivalent is a rough textbook rule, not a
        prediction of weight change. Informational only — speak to a doctor or dietitian for advice.
      </p>
    </main>
  );
}
