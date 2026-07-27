"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gauge, RotateCcw } from "lucide-react";

import { computeMafZone, mafTestPace, MAF_CATEGORIES, SENIOR_AGE } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const DEFAULTS = {
  age: "38",
  category: "c",
  seniorBonus: "0",
  restingHr: "",
  testDistance: "8",
  testMinutes: "48",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const toNumber = (raw) => {
  const text = String(raw).trim();
  if (text === "") return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [age, setAge] = useState(DEFAULTS.age);
  const [category, setCategory] = useState(DEFAULTS.category);
  const [seniorBonus, setSeniorBonus] = useState(DEFAULTS.seniorBonus);
  const [restingHr, setRestingHr] = useState(DEFAULTS.restingHr);
  const [testDistance, setTestDistance] = useState(DEFAULTS.testDistance);
  const [testMinutes, setTestMinutes] = useState(DEFAULTS.testMinutes);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const ageValue = toNumber(age);
    const bonusValue = toNumber(seniorBonus);
    const restingValue = toNumber(restingHr);

    if ([ageValue, bonusValue, restingValue].some((v) => Number.isNaN(v))) {
      return { error: "Enter numbers only — check the age, adjustment and resting pulse fields." };
    }

    return computeMafZone({
      age: ageValue === null ? undefined : ageValue,
      category,
      seniorBonus: bonusValue === null ? 0 : bonusValue,
      restingHr: restingValue,
    });
  }, [age, category, seniorBonus, restingHr]);

  const pace = useMemo(() => {
    const distanceValue = toNumber(testDistance);
    const minutesValue = toNumber(testMinutes);
    if (distanceValue === null || minutesValue === null) return null;
    if (Number.isNaN(distanceValue) || Number.isNaN(minutesValue)) {
      return { error: "MAF test distance and time must be numbers." };
    }
    return mafTestPace({ distanceKm: distanceValue, minutes: minutesValue });
  }, [testDistance, testMinutes]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "MAF 180 Training Zone",
      `Age: ${NUM.format(result.age)}`,
      `Category: ${result.categoryKey.toUpperCase()} — ${result.categoryLabel}`,
      ...result.steps.map((step) => `  ${step}`),
      `MAF heart rate ceiling: ${NUM.format(result.ceiling)} bpm`,
      `Aerobic training zone: ${NUM.format(result.floor)}–${NUM.format(result.ceiling)} bpm`,
    ];
    if (pace && !pace.error) {
      lines.push(`MAF test pace: ${pace.paceLabel} /km (${pace.milePaceLabel} /mi)`);
    }
    return lines.join("\n");
  }, [hasError, result, pace]);

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
    setAge(DEFAULTS.age);
    setCategory(DEFAULTS.category);
    setSeniorBonus(DEFAULTS.seniorBonus);
    setRestingHr(DEFAULTS.restingHr);
    setTestDistance(DEFAULTS.testDistance);
    setTestMinutes(DEFAULTS.testMinutes);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          180 Formula
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          MAF 180 Training Zone Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Maffetone&apos;s 180 Formula gives a maximum aerobic function heart rate — a ceiling you
          stay at or below during aerobic base work — by subtracting your age from 180 and adjusting
          for health and training history.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="maf-age">
              Age (years)
            </label>
            <input
              id="maf-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="5"
              max="100"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="maf-resting">
              Resting heart rate (optional)
            </label>
            <input
              id="maf-resting"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="25"
              max="130"
              step="1"
              placeholder="e.g. 52"
              value={restingHr}
              onChange={(event) => setRestingHr(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>Health and training category</legend>
          <div className="mt-2 grid gap-2">
            {MAF_CATEGORIES.map((item) => (
              <label
                key={item.key}
                htmlFor={`maf-cat-${item.key}`}
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)] has-checked:border-[var(--primary)]"
              >
                <input
                  id={`maf-cat-${item.key}`}
                  type="radio"
                  name="maf-category"
                  className="mt-1 h-4 w-4 accent-[var(--primary)]"
                  value={item.key}
                  checked={category === item.key}
                  onChange={(event) => setCategory(event.target.value)}
                />
                <span>
                  <span className="block text-sm font-semibold">
                    {item.key.toUpperCase()} · {item.adjustment >= 0 ? "+" : ""}
                    {item.adjustment} bpm
                  </span>
                  <span className="block text-sm text-[var(--foreground)]">{item.label}</span>
                  <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                    {item.detail}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5">
          <label className={LABEL_CLASS} htmlFor="maf-senior">
            Senior adjustment (0–10 bpm)
          </label>
          <input
            id="maf-senior"
            className={`mt-2 ${INPUT_CLASS}`}
            type="number"
            inputMode="numeric"
            min="0"
            max="10"
            step="1"
            value={seniorBonus}
            onChange={(event) => setSeniorBonus(event.target.value)}
          />
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Only applied at age {SENIOR_AGE} and over in category C or D
            {!hasError && !result.seniorEligible ? " — not applied to your entry." : "."}
          </p>
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              MAF heart rate ceiling
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.ceiling)} bpm`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your ceiling."
                : `Train in the ${NUM.format(result.floor)}–${NUM.format(result.ceiling)} bpm band and never above it.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy MAF training zone result"
              className={`${GHOST_BTN} disabled:opacity-50`}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Aerobic training zone",
              hasError
                ? DASH
                : `${NUM.format(result.floor)}–${NUM.format(result.ceiling)} bpm`,
            ],
            [
              "Starting value",
              hasError
                ? DASH
                : result.isYouth
                  ? `${NUM.format(result.baseValue)} bpm (age ${result.age}, fixed)`
                  : `180 − ${NUM.format(result.age)} = ${NUM.format(result.baseValue)} bpm`,
            ],
            [
              "Category adjustment",
              hasError
                ? DASH
                : `${result.categoryAdjustment >= 0 ? "+" : ""}${result.categoryAdjustment} bpm (${result.categoryKey.toUpperCase()})`,
            ],
            [
              "Senior adjustment applied",
              hasError ? DASH : `${result.appliedSeniorBonus > 0 ? "+" : ""}${result.appliedSeniorBonus} bpm`,
            ],
            [
              "Ceiling as % of heart rate reserve",
              hasError || result.percentOfReserve === null
                ? DASH
                : `${NUM.format(result.percentOfReserve)}%`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <ul className="mt-4 space-y-1 text-xs text-[var(--muted-foreground)]">
            {result.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">MAF test pace</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Warm up, then cover a fixed distance holding the ceiling above. Repeat monthly — the same
          heart rate should produce a faster pace as aerobic fitness builds.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="maf-distance">
              Distance covered (km)
            </label>
            <input
              id="maf-distance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={testDistance}
              onChange={(event) => setTestDistance(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="maf-minutes">
              Time taken (minutes)
            </label>
            <input
              id="maf-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={testMinutes}
              onChange={(event) => setTestMinutes(event.target.value)}
            />
          </div>
        </div>

        {pace && pace.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {pace.error}
          </p>
        ) : null}

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["Pace per kilometre", pace && !pace.error ? `${pace.paceLabel} /km` : DASH],
            ["Pace per mile", pace && !pace.error ? `${pace.milePaceLabel} /mi` : DASH],
            [
              "Average speed",
              pace && !pace.error ? `${NUM1.format(pace.kmPerHour)} km/h` : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. The 180 Formula is one coach&apos;s heuristic, not a clinical standard,
        and it deliberately errs on the conservative side. If you are on medication that affects
        heart rate, or have any cardiac or metabolic condition, discuss your training intensity with
        a doctor first.
      </p>
    </main>
  );
}
