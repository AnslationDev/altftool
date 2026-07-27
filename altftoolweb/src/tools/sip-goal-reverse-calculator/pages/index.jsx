"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Target } from "lucide-react";

import { COMMON_MIN_SIP, computeGoalSip } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

function isoToday() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function isoPlusYears(iso, years) {
  const [y, m, d] = iso.split("-");
  return `${Number(y) + years}-${m}-${d}`;
}

const DEFAULT_START = isoToday();
const DEFAULTS = {
  targetAmount: "2500000",
  startDate: DEFAULT_START,
  targetDate: isoPlusYears(DEFAULT_START, 10),
  annualReturn: "12",
  existingCorpus: "0",
  stepUpRate: "0",
  inflationRate: "0",
};

export default function ToolHome() {
  const [targetAmount, setTargetAmount] = useState(DEFAULTS.targetAmount);
  const [startDate, setStartDate] = useState(DEFAULTS.startDate);
  const [targetDate, setTargetDate] = useState(DEFAULTS.targetDate);
  const [annualReturn, setAnnualReturn] = useState(DEFAULTS.annualReturn);
  const [existingCorpus, setExistingCorpus] = useState(DEFAULTS.existingCorpus);
  const [stepUpRate, setStepUpRate] = useState(DEFAULTS.stepUpRate);
  const [inflationRate, setInflationRate] = useState(DEFAULTS.inflationRate);
  const [showSchedule, setShowSchedule] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeGoalSip({
        targetAmount: toNumber(targetAmount),
        startDate,
        targetDate,
        annualReturn: toNumber(annualReturn),
        existingCorpus: toNumber(existingCorpus),
        stepUpRate: toNumber(stepUpRate),
        inflationRate: toNumber(inflationRate),
      }),
    [targetAmount, startDate, targetDate, annualReturn, existingCorpus, stepUpRate, inflationRate],
  );

  const failed = Boolean(result.error);
  const stepUp = toNumber(stepUpRate) > 0;

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "SIP Goal Reverse Calculator",
      `Goal: ${money(result.futureTarget)} by ${targetDate}`,
      `Horizon: ${result.months} monthly instalments (${NUM.format(result.years)} years)`,
      `Assumed return: ${annualReturn}% per year`,
      `Monthly SIP needed: ${money(result.monthlySip)}`,
      stepUp ? `Final-year instalment after step-up: ${money(result.finalYearSip)}` : "",
      `Total you invest: ${money(result.totalInvested)}`,
      `Growth earned: ${money(result.wealthGained)}`,
      `Projected value on target date: ${money(result.projectedValue)}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [failed, result, targetDate, annualReturn, stepUp]);

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
    setTargetAmount(DEFAULTS.targetAmount);
    setStartDate(DEFAULTS.startDate);
    setTargetDate(DEFAULTS.targetDate);
    setAnnualReturn(DEFAULTS.annualReturn);
    setExistingCorpus(DEFAULTS.existingCorpus);
    setStepUpRate(DEFAULTS.stepUpRate);
    setInflationRate(DEFAULTS.inflationRate);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Target className="h-4 w-4" aria-hidden="true" />
          Goal planning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          SIP Goal Reverse Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Start from the amount you need and the date you need it, and get the monthly SIP that
          gets you there — after credit for money already invested, an optional annual step-up and
          an optional inflation adjustment.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sipgoal-target">
              Target amount (INR)
            </label>
            <input
              id="sipgoal-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="10000"
              value={targetAmount}
              onChange={(event) => setTargetAmount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sipgoal-return">
              Expected return (% per year)
            </label>
            <input
              id="sipgoal-return"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="30"
              step="0.5"
              value={annualReturn}
              onChange={(event) => setAnnualReturn(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sipgoal-start">
              First instalment date
            </label>
            <input
              id="sipgoal-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sipgoal-date">
              Target date
            </label>
            <input
              id="sipgoal-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={targetDate}
              onChange={(event) => setTargetDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sipgoal-existing">
              Already invested for this goal (INR)
            </label>
            <input
              id="sipgoal-existing"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={existingCorpus}
              onChange={(event) => setExistingCorpus(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sipgoal-stepup">
              Annual SIP step-up (%)
            </label>
            <input
              id="sipgoal-stepup"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="1"
              value={stepUpRate}
              onChange={(event) => setStepUpRate(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sipgoal-inflation">
              Inflate the goal by (% per year) — leave 0 if your target is already in future rupees
            </label>
            <input
              id="sipgoal-inflation"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="20"
              step="0.5"
              value={inflationRate}
              onChange={(event) => setInflationRate(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[3, 5, 10, 15, 20].map((years) => (
            <button
              key={years}
              type="button"
              onClick={() => setTargetDate(isoPlusYears(startDate, years))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {years} years
            </button>
          ))}
        </div>
      </section>

      {failed && (
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
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Monthly SIP needed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : money(result.monthlySip)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the input above to see a result."
                : `${result.months} instalments to reach ${money(result.futureTarget)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy the required monthly SIP result"
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

        {!failed && result.alreadyFunded && (
          <p className="mt-4 rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm font-medium text-[var(--success)]">
            What you have already invested grows to {money(result.existingAtMaturity)} on its own,
            which already covers the goal. No fresh SIP is mathematically required.
          </p>
        )}

        {!failed && !result.alreadyFunded && result.belowCommonMinimum && (
          <p className="mt-4 rounded-md bg-[var(--info-soft)] px-3 py-2 text-sm font-medium text-[var(--info)]">
            This works out to under {money(COMMON_MIN_SIP)} a month, which is below the minimum
            monthly instalment most fund houses accept. Consider a shorter horizon or a bigger goal.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Goal in target-date rupees", failed ? DASH : money(result.futureTarget)],
            [
              "Instalments / horizon",
              failed ? DASH : `${result.months} months (${NUM.format(result.years)} years)`,
            ],
            [
              "Existing investment grows to",
              failed ? DASH : money(result.existingAtMaturity),
            ],
            ["Gap the SIP must fund", failed ? DASH : money(result.gapToFund)],
            stepUp
              ? ["Final-year instalment after step-up", failed ? DASH : money(result.finalYearSip)]
              : null,
            ["Total you invest", failed ? DASH : money(result.totalInvested)],
            ["Growth earned", failed ? DASH : money(result.wealthGained)],
            ["Projected value on target date", failed ? DASH : money(result.projectedValue)],
          ]
            .filter(Boolean)
            .map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Year-by-year projection</h2>
          <button
            type="button"
            onClick={() => setShowSchedule((value) => !value)}
            aria-expanded={showSchedule}
            className="min-h-11 rounded-md px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
          >
            {showSchedule ? "Hide" : "Show"}
          </button>
        </div>
        {showSchedule &&
          (failed ? (
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">{DASH}</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Year
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Monthly SIP
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Invested
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Growth
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.schedule.map((row) => (
                    <tr key={row.year} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.year}</td>
                      <td className="py-2 pr-3 text-right">{money(row.monthlyInstalment)}</td>
                      <td className="py-2 pr-3 text-right">{money(row.invested)}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {money(row.growth)}
                      </td>
                      <td className="py-2 text-right font-semibold">{money(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Mutual fund returns are not guaranteed; this is an informational projection at a constant
        assumed rate, not advice to invest. Actual market returns vary year to year, and exit load
        or capital gains tax on redemption are not deducted here. Review the plan with a SEBI
        registered investment adviser before committing.
      </p>
    </main>
  );
}
