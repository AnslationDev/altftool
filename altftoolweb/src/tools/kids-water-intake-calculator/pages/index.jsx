"use client";

import { useMemo, useState } from "react";
import { Baby, Check, Copy, RotateCcw } from "lucide-react";
import { CUP_ML, computeKidsWaterIntake } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const DEFAULTS = {
  years: "8",
  months: "0",
  weight: "25",
  sex: "male",
  activity: "60",
  hot: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [years, setYears] = useState(DEFAULTS.years);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [activity, setActivity] = useState(DEFAULTS.activity);
  const [hot, setHot] = useState(DEFAULTS.hot);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const y = years === "" ? NaN : Number(years);
    const m = months === "" ? 0 : Number(months);
    const ageMonths = Number.isFinite(y) && Number.isFinite(m) ? y * 12 + m : NaN;
    return computeKidsWaterIntake({
      ageMonths,
      weightKg: weight === "" ? NaN : Number(weight),
      sex,
      activityMins: activity === "" ? NaN : Number(activity),
      hotConditions: hot,
    });
  }, [years, months, weight, sex, activity, hot]);

  const hasError = Boolean(result.error);

  const headline = hasError
    ? DASH
    : result.infantMode
      ? `${NUM.format(result.infantPlainWaterMinMl)}–${NUM.format(result.infantPlainWaterMaxMl)} ml`
      : `${NUM.format(result.drinkTotalMl)} ml`;

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Kids Water Intake Calculator",
      `Age: ${result.ageYears} y ${result.ageMonthsRemainder} m — EFSA band ${result.bandLabel}`,
      `Weight: ${weight} kg`,
      `Holliday-Segar maintenance: ${NUM.format(result.hollidaySegarMl)} ml/day`,
      `EFSA total water guideline: ${NUM.format(result.efsaMl)} ml/day`,
      `Reference total water used: ${NUM.format(result.referenceTotalMl)} ml (${result.referenceSource})`,
    ];
    if (result.infantMode) {
      lines.push(
        `Plain water at this age: ${NUM.format(result.infantPlainWaterMinMl)}-${NUM.format(result.infantPlainWaterMaxMl)} ml/day alongside milk or formula`,
      );
    } else {
      lines.push(
        `Water and drinks: ${NUM.format(result.drinkBaseMl)} ml/day`,
        `Sport top-up: ${NUM.format(result.sportExtraMl)} ml`,
        `Total to drink: ${NUM.format(result.drinkTotalMl)} ml (about ${result.cups} cups of ${CUP_ML} ml)`,
      );
    }
    return lines.join("\n");
  }, [hasError, result, weight]);

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
    setYears(DEFAULTS.years);
    setMonths(DEFAULTS.months);
    setWeight(DEFAULTS.weight);
    setSex(DEFAULTS.sex);
    setActivity(DEFAULTS.activity);
    setHot(DEFAULTS.hot);
    setCopied(false);
  };

  const rows = [
    ["EFSA age band", hasError ? DASH : result.bandLabel],
    [
      "EFSA total water guideline",
      hasError
        ? DASH
        : result.efsaRange
          ? `${NUM.format(result.efsaRange.low)}–${NUM.format(result.efsaRange.high)} ml/day`
          : `${NUM.format(result.efsaMl)} ml/day`,
    ],
    [
      "Holliday-Segar maintenance (weight rule)",
      hasError ? DASH : `${NUM.format(result.hollidaySegarMl)} ml/day`,
    ],
    [
      "Reference total water used",
      hasError ? DASH : `${NUM.format(result.referenceTotalMl)} ml (${result.referenceSource})`,
    ],
    ["Water that comes from food", hasError ? DASH : `${NUM.format(result.fromFoodMl)} ml`],
    ["Base target from drinks", hasError ? DASH : `${NUM.format(result.drinkBaseMl)} ml`],
    [
      "Sport top-up",
      hasError
        ? DASH
        : `${NUM.format(result.sportExtraMl)} ml (${NUM.format(result.sportPerTwentyMinMl)} ml per 20 min)`,
    ],
    [
      "Spread across a 12-hour day",
      hasError ? DASH : `about ${NUM.format(result.hourlyMl)} ml per hour`,
    ],
    ["Roughly this many cups", hasError ? DASH : `${result.cups} × ${CUP_ML} ml`],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Baby className="h-4 w-4" aria-hidden="true" />
          Children's hydration
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Kids Water Intake Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Works out a daily water target for a child from two published references — the
          Holliday-Segar 100/50/20 weight rule and the EFSA adequate intake for their age — then
          adds a sport top-up from the American Academy of Pediatrics activity guidance.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="kwi-years">
              Age (years)
            </label>
            <input
              id="kwi-years"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="18"
              step="1"
              value={years}
              onChange={(event) => setYears(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kwi-months">
              Extra months
            </label>
            <input
              id="kwi-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="11"
              step="1"
              value={months}
              onChange={(event) => setMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kwi-weight">
              Weight (kg)
            </label>
            <input
              id="kwi-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="150"
              step="0.5"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kwi-sex">
              Sex (used from age 9 onwards)
            </label>
            <select
              id="kwi-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sex}
              onChange={(event) => setSex(event.target.value)}
            >
              <option value="male">Boy</option>
              <option value="female">Girl</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kwi-activity">
              Vigorous activity today (minutes)
            </label>
            <input
              id="kwi-activity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="480"
              step="10"
              value={activity}
              onChange={(event) => setActivity(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <label
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="kwi-hot"
            >
              <input
                id="kwi-hot"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={hot}
                onChange={(event) => setHot(event.target.checked)}
              />
              Hot or humid conditions
            </label>
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
              {hasError || !result.infantMode ? "Water and drinks per day" : "Plain water per day"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{headline}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a figure."
                : result.infantMode
                  ? "Alongside breast milk or formula, which still supplies most of the fluid at this age."
                  : `About ${result.cups} cups of ${CUP_ML} ml, including the sport top-up.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy children's water intake result"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && result.infantMode && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            Between 6 and 12 months, breast milk or formula still covers nearly all fluid needs. Small
            sips of water with meals are fine, but too much plain water displaces milk and can upset
            an infant's sodium balance. Check the amount with your paediatrician.
          </p>
        )}

        {!hasError && result.highSportExtra && (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            The sport top-up alone is over 2 litres. Spread it through the session rather than
            drinking it in one go, and for sessions this long ask a coach or clinician about an
            electrolyte drink instead of plain water.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational guidance for healthy children, not medical advice. Children with kidney, heart
        or metabolic conditions, or anyone on a prescribed fluid restriction, should follow the
        targets set by their paediatrician. Signs a child needs fluid urgently — very dark urine, no
        wet nappy for several hours, sunken eyes, unusual drowsiness — need medical attention, not a
        calculator.
      </p>
    </main>
  );
}
