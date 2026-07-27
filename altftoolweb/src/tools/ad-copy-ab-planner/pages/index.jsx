"use client";

import { useMemo, useState } from "react";
import { Check, Columns2, Copy, RotateCcw } from "lucide-react";

import {
  analyseCopy,
  copyDifference,
  detectableLift,
  METRIC_UNITS,
  MIN_SOUND_TEST_DAYS,
  planAbTest,
  PLATFORM_SPECS,
  Z_BY_CONFIDENCE,
  Z_BY_POWER,
} from "../lib";

const DEFAULTS = {
  platform: "google-rsa",
  baseline: "2",
  lift: "20",
  volume: "5000",
  confidence: "95",
  power: "80",
  unit: "impressions",
  unitCost: "200",
  variantA: "Free delivery on every order",
  variantB: "Save 20% — shop the sale today",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "min-h-24 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const toNumber = (raw) => {
  const cleaned = String(raw).replace(/,/g, "").trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [platform, setPlatform] = useState(DEFAULTS.platform);
  const [baseline, setBaseline] = useState(DEFAULTS.baseline);
  const [lift, setLift] = useState(DEFAULTS.lift);
  const [volume, setVolume] = useState(DEFAULTS.volume);
  const [confidence, setConfidence] = useState(DEFAULTS.confidence);
  const [power, setPower] = useState(DEFAULTS.power);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [unitCost, setUnitCost] = useState(DEFAULTS.unitCost);
  const [variantA, setVariantA] = useState(DEFAULTS.variantA);
  const [variantB, setVariantB] = useState(DEFAULTS.variantB);
  const [copied, setCopied] = useState(false);

  const spec = PLATFORM_SPECS[platform];
  const primaryField = spec.fields[0];

  const plan = useMemo(
    () =>
      planAbTest({
        baselineRatePercent: toNumber(baseline),
        relativeLiftPercent: toNumber(lift),
        dailyVolume: toNumber(volume),
        confidence: Number(confidence),
        power: Number(power),
        unitCost: toNumber(unitCost),
        unit,
      }),
    [baseline, lift, volume, confidence, power, unitCost, unit],
  );

  const hasError = Boolean(plan.error);

  const weekPlan = useMemo(() => {
    if (hasError) return null;
    return detectableLift({
      baselineRatePercent: toNumber(baseline),
      dailyVolume: toNumber(volume),
      days: MIN_SOUND_TEST_DAYS,
      confidence: Number(confidence),
      power: Number(power),
    });
  }, [hasError, baseline, volume, confidence, power]);

  const copyA = useMemo(() => analyseCopy(variantA, primaryField.limit), [variantA, primaryField]);
  const copyB = useMemo(() => analyseCopy(variantB, primaryField.limit), [variantB, primaryField]);
  const difference = useMemo(() => copyDifference(variantA, variantB), [variantA, variantB]);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Ad Copy A/B Plan",
      `Baseline rate: ${baseline}% · minimum detectable lift: +${lift}% relative`,
      `Confidence ${confidence}% · power ${power}%`,
      `Sample per variant: ${INT.format(plan.perVariant)} ${unit}`,
      `Total needed: ${INT.format(plan.totalSample)} ${unit}`,
      `Run time at ${INT.format(plan.dailyVolume)}/day: ${plan.days} days (${plan.wholeWeeks} whole weeks)`,
      plan.estimatedCost > 0 ? `Estimated media cost: ${INR.format(plan.estimatedCost)}` : "",
      "",
      `Variant A (${copyA.characters}/${primaryField.limit}): ${variantA}`,
      `Variant B (${copyB.characters}/${primaryField.limit}): ${variantB}`,
      `Wording difference: ${NUM.format(difference.differencePercent)}%`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [
    hasError, plan, baseline, lift, confidence, power, unit,
    copyA, copyB, variantA, variantB, difference, primaryField,
  ]);

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
    setPlatform(DEFAULTS.platform);
    setBaseline(DEFAULTS.baseline);
    setLift(DEFAULTS.lift);
    setVolume(DEFAULTS.volume);
    setConfidence(DEFAULTS.confidence);
    setPower(DEFAULTS.power);
    setUnit(DEFAULTS.unit);
    setUnitCost(DEFAULTS.unitCost);
    setVariantA(DEFAULTS.variantA);
    setVariantB(DEFAULTS.variantB);
    setCopied(false);
  };

  const variantPanel = (id, label, text, setText, analysis) => (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <label className={LABEL_CLASS} htmlFor={id}>
        {label} — {primaryField.label}
      </label>
      <textarea
        id={id}
        className={`mt-2 ${AREA_CLASS}`}
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <p
        className={`mt-2 text-xs font-semibold ${
          analysis.withinLimit ? "text-[var(--muted-foreground)]" : "text-[var(--danger)]"
        }`}
      >
        {analysis.characters}/{primaryField.limit} characters
        {analysis.withinLimit ? "" : ` · ${analysis.overBy} over the limit`}
      </p>
      <ul className="mt-3 space-y-1 text-xs text-[var(--muted-foreground)]">
        <li>Words: {analysis.words}</li>
        <li>Contains a number: {analysis.hasNumber ? "yes" : "no"}</li>
        <li>Contains a call to action: {analysis.hasCta ? "yes" : "no"}</li>
        <li>Asks a question: {analysis.hasQuestion ? "yes" : "no"}</li>
      </ul>
      <div
        className="mt-3 rounded-md border border-[var(--border)] bg-[var(--card)] p-3"
        aria-label={`${label} preview`}
      >
        <p className="text-xs tracking-wide uppercase text-[var(--muted-foreground)]">Preview</p>
        <p className="mt-1 text-sm font-semibold break-words text-[var(--primary)]">
          {text || "Your copy appears here"}
        </p>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">{spec.label}</p>
      </div>
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Columns2 className="h-4 w-4" aria-hidden="true" />
          Copy testing
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Ad Copy A/B Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Write two variants side by side against the real character limits, then size the test with
          the two-proportion sample formula so you know how long it must run before the winner means
          anything.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Test inputs</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="platform">
              Platform
            </label>
            <select
              id="platform"
              className={`mt-2 ${INPUT_CLASS}`}
              value={platform}
              onChange={(event) => setPlatform(event.target.value)}
            >
              {Object.entries(PLATFORM_SPECS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="unit">
              Metric being tested
            </label>
            <select
              id="unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              {Object.entries(METRIC_UNITS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="baseline">
              Current rate (%)
            </label>
            <input
              id="baseline"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={baseline}
              onChange={(event) => setBaseline(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lift">
              Smallest lift worth detecting (% relative)
            </label>
            <input
              id="lift"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={lift}
              onChange={(event) => setLift(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="volume">
              Daily {unit} across both variants
            </label>
            <input
              id="volume"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="100"
              value={volume}
              onChange={(event) => setVolume(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="unit-cost">
              {METRIC_UNITS[unit].costLabel} in ₹
            </label>
            <input
              id="unit-cost"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={unitCost}
              onChange={(event) => setUnitCost(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="confidence">
              Confidence level
            </label>
            <select
              id="confidence"
              className={`mt-2 ${INPUT_CLASS}`}
              value={confidence}
              onChange={(event) => setConfidence(event.target.value)}
            >
              {Object.keys(Z_BY_CONFIDENCE).map((level) => (
                <option key={level} value={level}>
                  {level}%
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="power">
              Statistical power
            </label>
            <select
              id="power"
              className={`mt-2 ${INPUT_CLASS}`}
              value={power}
              onChange={(event) => setPower(event.target.value)}
            >
              {Object.keys(Z_BY_POWER).map((level) => (
                <option key={level} value={level}>
                  {level}%
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Run the test for
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${INT.format(plan.days)} days`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to size the test."
                : `${INT.format(plan.perVariant)} ${unit} per variant`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the A/B test plan to clipboard"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the planner" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Sample per variant", hasError ? DASH : INT.format(plan.perVariant)],
            ["Total sample needed", hasError ? DASH : INT.format(plan.totalSample)],
            [
              "Schedule rounded to whole weeks",
              hasError ? DASH : `${plan.wholeWeeks} week${plan.wholeWeeks === 1 ? "" : "s"}`,
            ],
            [
              "Variant rate you are testing for",
              hasError ? DASH : `${NUM.format(plan.variantRate * 100)}%`,
            ],
            [
              "Absolute lift being detected",
              hasError ? DASH : `${NUM.format(plan.absoluteLiftPoints)} percentage points`,
            ],
            [
              "Expected events on control",
              hasError ? DASH : INT.format(plan.expectedControlEvents),
            ],
            [
              "Expected events on variant",
              hasError ? DASH : INT.format(plan.expectedVariantEvents),
            ],
            [
              "Estimated media cost",
              hasError || plan.estimatedCost <= 0 ? DASH : INR.format(plan.estimatedCost),
            ],
            [
              `Lift a ${MIN_SOUND_TEST_DAYS}-day test could detect`,
              hasError || !weekPlan || weekPlan.error
                ? DASH
                : `+${NUM.format(weekPlan.relativeLiftPercent)}% relative`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && plan.tooShort && (
          <p className="mt-4 rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            The maths clears in under a week. Run it for {MIN_SOUND_TEST_DAYS} full days anyway so
            weekday and weekend behaviour are both represented.
          </p>
        )}
        {!hasError && plan.tooLong && (
          <p className="mt-4 rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            This schedule runs past eight weeks. Either accept a bigger minimum lift, raise the
            traffic, or test a bolder change.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Variants side by side</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {variantPanel("variant-a", "Variant A (control)", variantA, setVariantA, copyA)}
          {variantPanel("variant-b", "Variant B (challenger)", variantB, setVariantB, copyB)}
        </div>
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          Wording difference: {NUM.format(difference.differencePercent)}% of the distinct words are
          unique to one variant. Below roughly 30% the two lines usually say the same thing and the
          test will read as a tie.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[360px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Field</th>
                <th scope="col" className="py-2 text-right font-semibold">Character limit</th>
              </tr>
            </thead>
            <tbody>
              {spec.fields.map((field) => (
                <tr key={field.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{field.label}</td>
                  <td className="py-2 text-right font-semibold">{field.limit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Sizes a fixed-horizon test: decide once, at the end. Peeking daily and stopping the moment a
        variant looks ahead inflates the false-positive rate well past the confidence level you chose.
      </p>
    </main>
  );
}
