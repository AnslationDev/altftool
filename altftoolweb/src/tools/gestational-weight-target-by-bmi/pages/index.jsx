"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scale } from "lucide-react";
import {
  computeGestationalWeightTarget,
  feetInchesToCm,
  kgToPounds,
  poundsToKg,
} from "../lib";

const DEFAULTS = {
  units: "metric",
  preWeight: "60",
  heightCm: "165",
  heightFt: "5",
  heightIn: "5",
  week: "24",
  currentWeight: "68",
  twins: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const N1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const N2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 1 });

const STATUS_TEXT = {
  below: "text-[var(--foreground)]",
  within: "text-[var(--success)]",
  above: "text-[var(--danger)]",
};

export default function ToolHome() {
  const [units, setUnits] = useState(DEFAULTS.units);
  const [preWeight, setPreWeight] = useState(DEFAULTS.preWeight);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [heightFt, setHeightFt] = useState(DEFAULTS.heightFt);
  const [heightIn, setHeightIn] = useState(DEFAULTS.heightIn);
  const [week, setWeek] = useState(DEFAULTS.week);
  const [currentWeight, setCurrentWeight] = useState(DEFAULTS.currentWeight);
  const [twins, setTwins] = useState(DEFAULTS.twins);
  const [copied, setCopied] = useState(false);

  const imperial = units === "imperial";

  const result = useMemo(() => {
    const preKg = imperial ? poundsToKg(preWeight) : Number(preWeight);
    const currentKg =
      currentWeight === "" ? null : imperial ? poundsToKg(currentWeight) : Number(currentWeight);
    const cm = imperial ? feetInchesToCm(heightFt, heightIn) : Number(heightCm);
    return computeGestationalWeightTarget({
      prePregnancyWeightKg: preKg,
      heightCm: cm,
      week,
      currentWeightKg: currentKg,
      twins,
    });
  }, [imperial, preWeight, currentWeight, heightFt, heightIn, heightCm, week, twins]);

  const hasError = Boolean(result.error);
  const noGuideline = !hasError && result.noTwinGuideline === true;
  const usable = !hasError && !noGuideline;

  const showWeight = (kg) => {
    if (!Number.isFinite(kg)) return DASH;
    return imperial ? `${N1.format(kgToPounds(kg))} lb` : `${N1.format(kg)} kg`;
  };
  const showRange = (range) =>
    range ? `${showWeight(range.min)} – ${showWeight(range.max)}` : DASH;

  const summary = (() => {
    if (!usable) return "";
    const lines = [
      "Gestational Weight Target By BMI",
      `Pre-pregnancy BMI: ${N2.format(result.bmi)} (${result.category.label}, ${result.category.bmiLabel})`,
      `Recommended total gain${result.twins ? " (twins)" : ""}: ${showRange(result.totalRange)}`,
      `Expected gain by week ${result.week}: ${showRange(result.expected)}`,
    ];
    if (result.weeklyRange) {
      lines.push(
        `Weekly rate after week 13: ${showWeight(result.weeklyRange.min)} – ${showWeight(result.weeklyRange.max)} per week`,
      );
    }
    if (result.progress) {
      lines.push(
        `Gain so far: ${showWeight(result.progress.gain)} — ${result.progress.status} the expected range`,
      );
    }
    return lines.join("\n");
  })();

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
    setUnits(DEFAULTS.units);
    setPreWeight(DEFAULTS.preWeight);
    setHeightCm(DEFAULTS.heightCm);
    setHeightFt(DEFAULTS.heightFt);
    setHeightIn(DEFAULTS.heightIn);
    setWeek(DEFAULTS.week);
    setCurrentWeight(DEFAULTS.currentWeight);
    setTwins(DEFAULTS.twins);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          Pregnancy
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Gestational Weight Target By BMI
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Your recommended pregnancy weight gain depends on the BMI you started at. This applies the
          Institute of Medicine bands — total range, weekly rate after the first trimester, and where
          your gain should sit by the week you are in now.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gw-units">
              Units
            </label>
            <select
              id="gw-units"
              className={`mt-2 ${INPUT_CLASS}`}
              value={units}
              onChange={(event) => setUnits(event.target.value)}
            >
              <option value="metric">Metric (kg, cm)</option>
              <option value="imperial">Imperial (lb, ft/in)</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gw-week">
              Gestational week now
            </label>
            <input
              id="gw-week"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="42"
              step="1"
              value={week}
              onChange={(event) => setWeek(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gw-preweight">
              Pre-pregnancy weight ({imperial ? "lb" : "kg"})
            </label>
            <input
              id="gw-preweight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="0.5"
              value={preWeight}
              onChange={(event) => setPreWeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gw-currentweight">
              Current weight ({imperial ? "lb" : "kg"}, optional)
            </label>
            <input
              id="gw-currentweight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="0.5"
              value={currentWeight}
              onChange={(event) => setCurrentWeight(event.target.value)}
            />
          </div>

          {imperial ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="gw-feet">
                  Height (feet)
                </label>
                <input
                  id="gw-feet"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="3"
                  max="7"
                  step="1"
                  value={heightFt}
                  onChange={(event) => setHeightFt(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="gw-inches">
                  Height (inches)
                </label>
                <input
                  id="gw-inches"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="11"
                  step="1"
                  value={heightIn}
                  onChange={(event) => setHeightIn(event.target.value)}
                />
              </div>
            </>
          ) : (
            <div>
              <label className={LABEL_CLASS} htmlFor="gw-height">
                Height (cm)
              </label>
              <input
                id="gw-height"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="120"
                max="220"
                step="0.5"
                value={heightCm}
                onChange={(event) => setHeightCm(event.target.value)}
              />
            </div>
          )}

          <div className="flex items-end">
            <label
              className="flex min-h-11 w-full items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="gw-twins"
            >
              <input
                id="gw-twins"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={twins}
                onChange={(event) => setTwins(event.target.checked)}
              />
              Twin pregnancy
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
      {noGuideline && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.message}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Recommended total gain
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {usable ? showRange(result.totalRange) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {usable
                ? `Pre-pregnancy BMI ${N2.format(result.bmi)} — ${result.category.label} (${result.category.bmiLabel})${result.twins ? ", twin pregnancy" : ""}`
                : "Fix the inputs above to see your range."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy gestational weight target result"
              className={GHOST_BTN}
              disabled={!usable}
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
            ["Pre-pregnancy BMI", usable ? N2.format(result.bmi) : DASH],
            ["BMI category", usable ? result.category.label : DASH],
            [
              `Expected gain by week ${usable ? result.week : ""}`.trim(),
              usable ? showRange(result.expected) : DASH,
            ],
            [
              "Weekly rate after week 13",
              usable && result.weeklyRange
                ? `${showWeight(result.weeklyRange.min)} – ${showWeight(result.weeklyRange.max)}`
                : DASH,
            ],
            [
              "First trimester allowance",
              usable ? showRange(result.firstTrimesterRange) : DASH,
            ],
            [
              "Gain so far",
              usable && result.progress ? showWeight(result.progress.gain) : DASH,
            ],
            [
              "Still to gain for the lower target",
              usable && result.progress
                ? showWeight(result.progress.remainingToLowerTarget)
                : DASH,
            ],
            ["Weeks to 40", usable ? String(result.weeksLeft) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {usable && result.progress && (
          <p className={`mt-4 text-sm font-semibold ${STATUS_TEXT[result.progress.status]}`}>
            {result.progress.status === "within" &&
              "Your gain so far sits inside the expected range for this week."}
            {result.progress.status === "below" &&
              `Your gain is ${showWeight(result.progress.shortfall)} under the lower end of the expected range for this week.`}
            {result.progress.status === "above" &&
              `Your gain is ${showWeight(result.progress.excess)} over the upper end of the expected range for this week.`}
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. The Institute of Medicine ranges are population guidance for singleton
        and twin pregnancies and do not cover every situation — hyperemesis, gestational diabetes,
        bariatric surgery, higher-order multiples and short stature can all change the target. Your
        obstetrician or midwife sets your individual goal.
      </p>
    </main>
  );
}
