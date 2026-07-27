"use client";

import { useMemo, useState } from "react";
import { Baby, Check, Copy, RotateCcw } from "lucide-react";

import {
  BASELINE_METHODS,
  BEDTIME_CUTOFF_HOURS,
  CLIMATES,
  TRIMESTERS,
  computePregnancyHydration,
  parseClock,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const ml = (value) => (Number.isFinite(value) ? `${NUM0.format(value)} ml` : DASH);
const litres = (value) => (Number.isFinite(value) ? `${NUM2.format(value)} L` : DASH);
const mins = (value) => (Number.isFinite(value) ? `${NUM0.format(value)} min` : DASH);

const DEFAULTS = {
  baseline: "efsa",
  bodyMassKg: "65",
  trimester: "second",
  climate: "temperate",
  activeMinutes: "30",
  wakeTime: "07:00",
  wakingHours: "16",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
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
  const [baseline, setBaseline] = useState(DEFAULTS.baseline);
  const [bodyMassKg, setBodyMassKg] = useState(DEFAULTS.bodyMassKg);
  const [trimester, setTrimester] = useState(DEFAULTS.trimester);
  const [climate, setClimate] = useState(DEFAULTS.climate);
  const [activeMinutes, setActiveMinutes] = useState(DEFAULTS.activeMinutes);
  const [wakeTime, setWakeTime] = useState(DEFAULTS.wakeTime);
  const [wakingHours, setWakingHours] = useState(DEFAULTS.wakingHours);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computePregnancyHydration({
        baseline,
        bodyMassKg: toNumber(bodyMassKg),
        trimester,
        climate,
        activeMinutes: toNumber(activeMinutes),
        wakeMinuteOfDay: parseClock(wakeTime),
        wakingHours: toNumber(wakingHours),
      }),
    [baseline, bodyMassKg, trimester, climate, activeMinutes, wakeTime, wakingHours],
  );

  const hasError = Boolean(result.error);
  const plan = hasError ? null : result;

  const summary = useMemo(() => {
    if (!plan) return "";
    return [
      "Pregnancy Hydration Plan",
      plan.trimesterLabel,
      `Total water target: ${ml(plan.totalWaterMl)} a day (food + drinks)`,
      `Drinks target: ${ml(plan.drinksMl)} a day`,
      `${plan.servingCount} servings of about ${ml(plan.servingMl)}, roughly every ${mins(plan.intervalMin)}`,
      `Schedule: ${plan.servings.map((serving) => serving.time).join(", ")}`,
    ].join("\n");
  }, [plan]);

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
    setBaseline(DEFAULTS.baseline);
    setBodyMassKg(DEFAULTS.bodyMassKg);
    setTrimester(DEFAULTS.trimester);
    setClimate(DEFAULTS.climate);
    setActiveMinutes(DEFAULTS.activeMinutes);
    setWakeTime(DEFAULTS.wakeTime);
    setWakingHours(DEFAULTS.wakingHours);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Baby className="h-4 w-4" aria-hidden="true" />
          Pregnancy hydration
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Pregnancy Hydration Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A daily fluid target built from EFSA adequate intakes and the extra energy cost of your
          trimester, then spaced into servings that stop {BEDTIME_CUTOFF_HOURS} hours before bed.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pg-trimester">
              Trimester
            </label>
            <select
              id="pg-trimester"
              className={`mt-2 ${INPUT_CLASS}`}
              value={trimester}
              onChange={(event) => setTrimester(event.target.value)}
            >
              {Object.entries(TRIMESTERS).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pg-baseline">
              Baseline method
            </label>
            <select
              id="pg-baseline"
              className={`mt-2 ${INPUT_CLASS}`}
              value={baseline}
              onChange={(event) => setBaseline(event.target.value)}
            >
              {Object.entries(BASELINE_METHODS).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
          {baseline === "weight" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="pg-mass">
                Body weight (kg)
              </label>
              <input
                id="pg-mass"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="35"
                max="200"
                step="0.5"
                value={bodyMassKg}
                onChange={(event) => setBodyMassKg(event.target.value)}
              />
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="pg-climate">
              Climate
            </label>
            <select
              id="pg-climate"
              className={`mt-2 ${INPUT_CLASS}`}
              value={climate}
              onChange={(event) => setClimate(event.target.value)}
            >
              {Object.entries(CLIMATES).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pg-active">
              Moderate activity (minutes a day)
            </label>
            <input
              id="pg-active"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="300"
              step="5"
              value={activeMinutes}
              onChange={(event) => setActiveMinutes(event.target.value)}
            />
            <p className={HINT_CLASS}>Walking, prenatal yoga, swimming — not vigorous training.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pg-wake">
              Wake-up time
            </label>
            <input
              id="pg-wake"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={wakeTime}
              onChange={(event) => setWakeTime(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pg-waking">
              Hours awake
            </label>
            <input
              id="pg-waking"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="8"
              max="20"
              step="1"
              value={wakingHours}
              onChange={(event) => setWakingHours(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
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
              Drink each day
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {plan ? litres(plan.drinksL) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {plan
                ? `${plan.servingCount} servings of about ${ml(plan.servingMl)}`
                : "Fix the input above to see your target"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!plan}
              aria-label="Copy pregnancy hydration plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Baseline total water", plan ? ml(plan.baseTotalMl) : DASH],
            [
              "Trimester increment",
              plan ? `${ml(plan.trimesterMl)} (from +${plan.trimesterKcal} kcal a day)` : DASH,
            ],
            ["Climate allowance", plan ? ml(plan.climateMl) : DASH],
            ["Activity allowance", plan ? ml(plan.activityMl) : DASH],
            ["Total water target (food + drinks)", plan ? ml(plan.totalWaterMl) : DASH],
            ["Water you get from food", plan ? ml(plan.foodWaterMl) : DASH],
            ["Drinks target", plan ? ml(plan.drinksMl) : DASH],
            ["Gap between servings", plan ? mins(plan.intervalMin) : DASH],
            [
              "EFSA flat pregnancy increment, for comparison",
              plan ? ml(plan.efsaFlatIncrementMl) : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {plan?.aboveCeiling ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            This works out above {ml(plan.ceilingMl)} of drinks a day. That is more than routine
            hydration and should be discussed with your midwife or doctor before you follow it.
          </p>
        ) : null}
      </section>

      {plan ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Reminder schedule</h2>
          <p className={HINT_CLASS}>
            Evenly spaced from waking, finishing {BEDTIME_CUTOFF_HOURS} hours before bed.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[280px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    #
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Time
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {plan.servings.map((serving, index) => (
                  <tr
                    key={`${serving.time}-${index}`}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{index + 1}</td>
                    <td className="py-2 pr-3 font-semibold">{serving.time}</td>
                    <td className="py-2 text-right">{ml(serving.ml)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only and not a substitute for antenatal care. If you have severe vomiting,
        pre-eclampsia, gestational diabetes, kidney or heart conditions, or have been told to
        restrict fluid, follow your midwife or doctor rather than this target.
      </p>
    </main>
  );
}
