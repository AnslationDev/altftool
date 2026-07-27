"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scale } from "lucide-react";

import { compareCoachingVsSelfStudy } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  months: "12",
  coachingFee: "85000",
  coachingMonthly: "1200",
  coachingOneTime: "2000",
  selfOneTime: "14000",
  selfMonthly: "600",
};

const CHEAPER_LABEL = {
  coaching: "Coaching works out cheaper",
  "self-study": "Self-study works out cheaper",
  equal: "Both plans cost the same",
};

export default function ToolHome() {
  const [months, setMonths] = useState(DEFAULTS.months);
  const [coachingFee, setCoachingFee] = useState(DEFAULTS.coachingFee);
  const [coachingMonthly, setCoachingMonthly] = useState(DEFAULTS.coachingMonthly);
  const [coachingOneTime, setCoachingOneTime] = useState(DEFAULTS.coachingOneTime);
  const [selfOneTime, setSelfOneTime] = useState(DEFAULTS.selfOneTime);
  const [selfMonthly, setSelfMonthly] = useState(DEFAULTS.selfMonthly);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      compareCoachingVsSelfStudy({
        months: months.trim() === "" ? Number.NaN : Number(months),
        coachingFee: coachingFee.trim() === "" ? 0 : Number(coachingFee),
        coachingMonthly: coachingMonthly.trim() === "" ? 0 : Number(coachingMonthly),
        coachingOneTime: coachingOneTime.trim() === "" ? 0 : Number(coachingOneTime),
        selfOneTime: selfOneTime.trim() === "" ? 0 : Number(selfOneTime),
        selfMonthly: selfMonthly.trim() === "" ? 0 : Number(selfMonthly),
      }),
    [months, coachingFee, coachingMonthly, coachingOneTime, selfOneTime, selfMonthly],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Coaching vs self-study cost",
      `Duration: ${result.months} months`,
      `Coaching total: ${money(result.coachingTotal)} (${money(result.coachingPerMonth)}/month)`,
      `Self-study total: ${money(result.selfTotal)} (${money(result.selfPerMonth)}/month)`,
      `${CHEAPER_LABEL[result.cheaper]} — difference ${money(result.difference)}`,
    ].join("\n");
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
    setMonths(DEFAULTS.months);
    setCoachingFee(DEFAULTS.coachingFee);
    setCoachingMonthly(DEFAULTS.coachingMonthly);
    setCoachingOneTime(DEFAULTS.coachingOneTime);
    setSelfOneTime(DEFAULTS.selfOneTime);
    setSelfMonthly(DEFAULTS.selfMonthly);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Coaching total", DASH],
        ["Self-study total", DASH],
        ["Difference", DASH],
      ]
    : [
        ["Coaching total", money(result.coachingTotal)],
        ["Coaching per month", money(result.coachingPerMonth)],
        ["Self-study total", money(result.selfTotal)],
        ["Self-study per month", money(result.selfPerMonth)],
        ["Difference over the full duration", money(result.difference)],
        ["Difference per month", money(result.differencePerMonth)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          Student Finance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Coaching Fee vs Self-Study Cost
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Put the full coaching bill — fee, travel, extras — next to a self-study plan with books,
          test series and subscriptions, over the same preparation window.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cvs-months">
              Preparation duration (months)
            </label>
            <input
              id="cvs-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="120"
              step="1"
              value={months}
              onChange={(event) => setMonths(event.target.value)}
            />
          </div>

          <fieldset className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Coaching plan
            </legend>
            <div className="space-y-3">
              <div>
                <label className={LABEL_CLASS} htmlFor="cvs-fee">
                  Total programme fee (INR)
                </label>
                <input
                  id="cvs-fee"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1000"
                  value={coachingFee}
                  onChange={(event) => setCoachingFee(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="cvs-cmonthly">
                  Extra monthly cost — travel, hostel premium (INR)
                </label>
                <input
                  id="cvs-cmonthly"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="100"
                  value={coachingMonthly}
                  onChange={(event) => setCoachingMonthly(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="cvs-conetime">
                  One-time extras — kit, extra books (INR)
                </label>
                <input
                  id="cvs-conetime"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="500"
                  value={coachingOneTime}
                  onChange={(event) => setCoachingOneTime(event.target.value)}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Self-study plan
            </legend>
            <div className="space-y-3">
              <div>
                <label className={LABEL_CLASS} htmlFor="cvs-sonetime">
                  One-time costs — books, test series (INR)
                </label>
                <input
                  id="cvs-sonetime"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="500"
                  value={selfOneTime}
                  onChange={(event) => setSelfOneTime(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="cvs-smonthly">
                  Monthly costs — subscriptions, internet, library (INR)
                </label>
                <input
                  id="cvs-smonthly"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="100"
                  value={selfMonthly}
                  onChange={(event) => setSelfMonthly(event.target.value)}
                />
              </div>
            </div>
          </fieldset>
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
              Cost difference
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.difference)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see the comparison." : CHEAPER_LABEL[result.cheaper]}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the cost comparison result"
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
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
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

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Money is only one side of the choice — discipline, doubt support, peer group and mock-test
        infrastructure differ between the two routes. Use the numbers here as the financial half of
        the decision.
      </p>
    </main>
  );
}
