"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Milk, RotateCcw } from "lucide-react";

import {
  BASELINE_METHODS,
  CLIMATES,
  LACTATION_STAGES,
  MILK_WATER_FRACTION,
  computeLactationHydration,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const PCT = new Intl.NumberFormat("en-IN", { style: "percent", maximumFractionDigits: 0 });

const DASH = "—";
const ml = (value) => (Number.isFinite(value) ? `${NUM0.format(value)} ml` : DASH);
const litres = (value) => (Number.isFinite(value) ? `${NUM2.format(value)} L` : DASH);

const DEFAULTS = {
  baseline: "efsa",
  bodyMassKg: "62",
  stage: "exclusive",
  feedsPerDay: "8",
  babies: "1",
  climate: "temperate",
  activeMinutes: "20",
  measuredMilk: "",
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
  const [stage, setStage] = useState(DEFAULTS.stage);
  const [feedsPerDay, setFeedsPerDay] = useState(DEFAULTS.feedsPerDay);
  const [babies, setBabies] = useState(DEFAULTS.babies);
  const [climate, setClimate] = useState(DEFAULTS.climate);
  const [activeMinutes, setActiveMinutes] = useState(DEFAULTS.activeMinutes);
  const [measuredMilk, setMeasuredMilk] = useState(DEFAULTS.measuredMilk);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeLactationHydration({
        baseline,
        bodyMassKg: toNumber(bodyMassKg),
        stage,
        feedsPerDay: toNumber(feedsPerDay),
        babies: toNumber(babies),
        climate,
        activeMinutes: toNumber(activeMinutes),
        measuredMilkMlPerDay: toNumber(measuredMilk),
      }),
    [baseline, bodyMassKg, stage, feedsPerDay, babies, climate, activeMinutes, measuredMilk],
  );

  const hasError = Boolean(result.error);
  const plan = hasError ? null : result;

  const summary = useMemo(() => {
    if (!plan) return "";
    return [
      "Breastfeeding Hydration Target",
      plan.stageLabel,
      `Milk output (${plan.milkSource}): ${ml(plan.milkMlPerDay)} a day`,
      `Water leaving as milk: ${ml(plan.milkWaterMl)} a day`,
      `Total water target: ${ml(plan.totalWaterMl)} a day (food + drinks)`,
      `Drinks target: ${ml(plan.drinksMl)} a day`,
      `That is about ${ml(plan.perFeedMl)} at each of ${NUM0.format(toNumber(feedsPerDay))} feeds`,
    ].join("\n");
  }, [plan, feedsPerDay]);

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
    setStage(DEFAULTS.stage);
    setFeedsPerDay(DEFAULTS.feedsPerDay);
    setBabies(DEFAULTS.babies);
    setClimate(DEFAULTS.climate);
    setActiveMinutes(DEFAULTS.activeMinutes);
    setMeasuredMilk(DEFAULTS.measuredMilk);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Milk className="h-4 w-4" aria-hidden="true" />
          Lactation hydration
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Breastfeeding Hydration Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Your extra fluid need while nursing is the water leaving your body as milk — about{" "}
          {PCT.format(MILK_WATER_FRACTION)} of everything your baby drinks. This scales that with
          your stage, feeds and output.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bf-stage">
              Breastfeeding stage
            </label>
            <select
              id="bf-stage"
              className={`mt-2 ${INPUT_CLASS}`}
              value={stage}
              onChange={(event) => setStage(event.target.value)}
            >
              {Object.entries(LACTATION_STAGES).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bf-feeds">
              Feeds in 24 hours
            </label>
            <input
              id="bf-feeds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="20"
              step="1"
              value={feedsPerDay}
              onChange={(event) => setFeedsPerDay(event.target.value)}
            />
            <p className={HINT_CLASS}>Count pumping sessions as feeds.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bf-babies">
              Babies nursing
            </label>
            <input
              id="bf-babies"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="3"
              step="1"
              value={babies}
              onChange={(event) => setBabies(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bf-baseline">
              Baseline method
            </label>
            <select
              id="bf-baseline"
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
              <label className={LABEL_CLASS} htmlFor="bf-mass">
                Body weight (kg)
              </label>
              <input
                id="bf-mass"
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
            <label className={LABEL_CLASS} htmlFor="bf-climate">
              Climate
            </label>
            <select
              id="bf-climate"
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
            <label className={LABEL_CLASS} htmlFor="bf-active">
              Moderate activity (minutes a day)
            </label>
            <input
              id="bf-active"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="300"
              step="5"
              value={activeMinutes}
              onChange={(event) => setActiveMinutes(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bf-measured">
              Measured milk output (ml in 24 hours) — optional
            </label>
            <input
              id="bf-measured"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="2500"
              step="10"
              placeholder="Leave blank to estimate from stage and feeds"
              value={measuredMilk}
              onChange={(event) => setMeasuredMilk(event.target.value)}
            />
            <p className={HINT_CLASS}>
              If you exclusively pump, or have weighed feeds, this figure beats any average.
            </p>
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
                ? `About ${ml(plan.perFeedMl)} at every feed`
                : "Fix the input above to see your target"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!plan}
              aria-label="Copy breastfeeding hydration target"
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
            ["Baseline total water", plan ? ml(plan.baseTotalMl) : DASH],
            [
              "Milk produced a day",
              plan ? `${ml(plan.milkMlPerDay)} (${plan.milkSource})` : DASH,
            ],
            ["Average per feed", plan ? ml(plan.mlPerFeed) : DASH],
            ["Water leaving as milk", plan ? ml(plan.milkWaterMl) : DASH],
            ["EFSA flat lactation increment", plan ? ml(plan.efsaFlatIncrementMl) : DASH],
            ["Climate allowance", plan ? ml(plan.climateMl) : DASH],
            ["Activity allowance", plan ? ml(plan.activityMl) : DASH],
            ["Total water target (food + drinks)", plan ? ml(plan.totalWaterMl) : DASH],
            ["Water you get from food", plan ? ml(plan.foodWaterMl) : DASH],
            ["Drinks target", plan ? ml(plan.drinksMl) : DASH],
            [
              "As standard servings",
              plan ? `${plan.servingCount} x about ${ml(plan.servingMl)}` : DASH,
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
            This works out above {ml(plan.ceilingMl)} of drinks a day, which is beyond routine
            hydration. Check the inputs and discuss the target with a health professional before
            following it.
          </p>
        ) : (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            Drinking beyond thirst does not increase milk supply — the evidence is clear on that.
            Treat this as a floor to hit, not a quota to exceed.
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical advice. If you have concerns about milk supply, your baby's
        weight gain, or you have kidney, heart or thyroid conditions, speak to a lactation
        consultant, health visitor or doctor.
      </p>
    </main>
  );
}
