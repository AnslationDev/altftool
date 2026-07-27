"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, TrendingUp } from "lucide-react";

import { computeTopUpSip, splitMonths } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const DASH = "—";

const DEFAULTS = {
  monthlySip: "10000",
  annualReturnPercent: "12",
  years: "10",
  annualTopUpPercent: "10",
  targetCorpus: "5000000",
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
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const duration = (months) => {
  if (months === null || months === undefined) return DASH;
  const { years, months: rest } = splitMonths(months);
  const parts = [];
  if (years) parts.push(`${years} yr`);
  if (rest || !years) parts.push(`${rest} mo`);
  return parts.join(" ");
};

export default function ToolHome() {
  const [monthlySip, setMonthlySip] = useState(DEFAULTS.monthlySip);
  const [annualReturnPercent, setAnnualReturnPercent] = useState(DEFAULTS.annualReturnPercent);
  const [years, setYears] = useState(DEFAULTS.years);
  const [annualTopUpPercent, setAnnualTopUpPercent] = useState(DEFAULTS.annualTopUpPercent);
  const [targetCorpus, setTargetCorpus] = useState(DEFAULTS.targetCorpus);
  const [showTable, setShowTable] = useState(true);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeTopUpSip({
        monthlySip: toNumber(monthlySip),
        annualReturnPercent: toNumber(annualReturnPercent),
        years: toNumber(years),
        annualTopUpPercent: toNumber(annualTopUpPercent),
        targetCorpus: toNumber(targetCorpus),
      }),
    [monthlySip, annualReturnPercent, years, annualTopUpPercent, targetCorpus],
  );

  const hasError = Boolean(result.error);
  const show = (value) => (hasError ? DASH : money(value));

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "SIP top-up projection",
      `Starting SIP: ${money(result.monthlySip)} a month`,
      `Annual top-up: ${pct(result.annualTopUpPercent)}`,
      `Expected return: ${pct(result.annualReturnPercent)} a year`,
      `Period: ${result.months} months`,
      `Final instalment: ${money(result.finalInstalment)} a month`,
      `Corpus with top-up: ${money(result.stepUpCorpus)}`,
      `Corpus without top-up: ${money(result.flatCorpus)}`,
      `Extra corpus: ${money(result.extraCorpus)} for ${money(result.extraInvested)} extra invested`,
      result.goalMonthsStepUp !== null
        ? `Goal ${money(result.targetCorpus)} reached in ${duration(result.goalMonthsStepUp)} with top-up vs ${duration(result.goalMonthsFlat)} without`
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
    setMonthlySip(DEFAULTS.monthlySip);
    setAnnualReturnPercent(DEFAULTS.annualReturnPercent);
    setYears(DEFAULTS.years);
    setAnnualTopUpPercent(DEFAULTS.annualTopUpPercent);
    setTargetCorpus(DEFAULTS.targetCorpus);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
          Step-up SIP
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          SIP Top Up Percentage Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Raise your instalment by a fixed percentage every twelve months and see the corpus, the
          extra money invested and how much sooner the goal arrives.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sip-amount">
              Starting monthly SIP (INR)
            </label>
            <input
              id="sip-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={monthlySip}
              onChange={(event) => setMonthlySip(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sip-topup">
              Annual top-up (%)
            </label>
            <input
              id="sip-topup"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={annualTopUpPercent}
              onChange={(event) => setAnnualTopUpPercent(event.target.value)}
            />
            <p className={HINT_CLASS}>Applied from the 13th instalment, then every 12 months.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sip-return">
              Expected return (% a year)
            </label>
            <input
              id="sip-return"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="40"
              step="0.5"
              value={annualReturnPercent}
              onChange={(event) => setAnnualReturnPercent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sip-years">
              Investment period (years)
            </label>
            <input
              id="sip-years"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="50"
              step="1"
              value={years}
              onChange={(event) => setYears(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sip-target">
              Goal amount (INR, optional)
            </label>
            <input
              id="sip-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100000"
              value={targetCorpus}
              onChange={(event) => setTargetCorpus(event.target.value)}
            />
            <p className={HINT_CLASS}>Set to 0 to skip the goal-date comparison.</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[0, 5, 10, 15, 20].map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => setAnnualTopUpPercent(String(step))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {step}% top-up
            </button>
          ))}
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
              Corpus with the top-up
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {show(result.stepUpCorpus)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your figures."
                : `${money(result.extraCorpus)} more than a flat SIP, ending at ${money(result.finalInstalment)} a month`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the SIP top-up projection"
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
            ["Total invested with top-up", show(result.stepUpInvested)],
            ["Gain with top-up", show(result.stepUpGain)],
            ["Corpus without any top-up", show(result.flatCorpus)],
            ["Total invested without top-up", show(result.flatInvested)],
            ["Extra corpus from the top-up", show(result.extraCorpus)],
            ["Extra money invested", show(result.extraInvested)],
            [
              "Corpus uplift",
              hasError ? DASH : pct(result.corpusUpliftPercent),
            ],
            [
              "Corpus per extra rupee invested",
              hasError ? DASH : `${NUM.format(result.corpusPerExtraRupee)}x`,
            ],
            ["Final monthly instalment", show(result.finalInstalment)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.targetCorpus > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Reaching {money(result.targetCorpus)}</h2>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            {[
              [
                "With the annual top-up",
                result.goalMonthsStepUp === null
                  ? "Not reached within 50 years"
                  : duration(result.goalMonthsStepUp),
              ],
              [
                "With a flat SIP",
                result.goalMonthsFlat === null
                  ? "Not reached within 50 years"
                  : duration(result.goalMonthsFlat),
              ],
              [
                "Time saved",
                result.goalMonthsSaved === null
                  ? DASH
                  : `${result.goalMonthsSaved} month${result.goalMonthsSaved === 1 ? "" : "s"}`,
              ],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Year-by-year build-up</h2>
            <button
              type="button"
              onClick={() => setShowTable((value) => !value)}
              aria-expanded={showTable}
              className="min-h-11 rounded-md px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {showTable ? "Hide" : "Show"}
            </button>
          </div>
          {showTable && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Year</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Monthly SIP</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Invested</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Gain</th>
                    <th scope="col" className="py-2 text-right font-semibold">Closing</th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearly.map((row) => (
                    <tr key={row.year} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.year}</td>
                      <td className="py-2 pr-3 text-right">{money(row.monthlySip)}</td>
                      <td className="py-2 pr-3 text-right">{money(row.invested)}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {money(row.gain)}
                      </td>
                      <td className="py-2 text-right font-semibold">{money(row.closing)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Mutual fund returns are not guaranteed and the projection assumes a constant rate with the
        instalment debited at the start of each month. Actual outcomes depend on market returns,
        expense ratio, exit load and taxation.
      </p>
    </main>
  );
}
