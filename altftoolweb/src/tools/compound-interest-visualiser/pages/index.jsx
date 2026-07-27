"use client";

import { useMemo, useState } from "react";
import { Check, ChartLine, Copy, RotateCcw } from "lucide-react";

import {
  COMPOUNDING_OPTIONS,
  MAX_YEARS,
  buildGrowthSeries,
  sampleSeries,
  toChartGeometry,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const COMPACT = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const compact = (value) => (Number.isFinite(value) ? COMPACT.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  principal: "100000",
  monthlyContribution: "5000",
  annualRatePct: "12",
  years: "25",
  compoundsPerYear: "12",
  contributionTiming: "end",
};

const CHART_BOX = { width: 640, height: 260, padLeft: 6, padRight: 6, padTop: 14, padBottom: 26 };

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [principal, setPrincipal] = useState(DEFAULTS.principal);
  const [monthlyContribution, setMonthlyContribution] = useState(DEFAULTS.monthlyContribution);
  const [annualRatePct, setAnnualRatePct] = useState(DEFAULTS.annualRatePct);
  const [years, setYears] = useState(DEFAULTS.years);
  const [compoundsPerYear, setCompoundsPerYear] = useState(DEFAULTS.compoundsPerYear);
  const [contributionTiming, setContributionTiming] = useState(DEFAULTS.contributionTiming);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const values = {
      principal: toNumber(principal),
      monthlyContribution: toNumber(monthlyContribution),
      annualRatePct: toNumber(annualRatePct),
      years: toNumber(years),
      compoundsPerYear: toNumber(compoundsPerYear),
    };
    if (Object.values(values).some((value) => Number.isNaN(value))) {
      return { error: "Every box needs a number before the chart can be drawn." };
    }
    return buildGrowthSeries({ ...values, contributionTiming });
  }, [principal, monthlyContribution, annualRatePct, years, compoundsPerYear, contributionTiming]);

  const hasError = Boolean(result.error);

  const geometry = useMemo(() => {
    if (hasError) return null;
    const built = toChartGeometry(result.series, CHART_BOX);
    return built.error ? null : built;
  }, [hasError, result]);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Compound interest projection",
      `Starting amount: ${money(result.series[0].balance)}`,
      `Monthly contribution: ${money(toNumber(monthlyContribution))}`,
      `Return: ${result.nominalRatePct}% nominal, ${result.effectiveAnnualRatePct}% effective`,
      `Period: ${result.years} years`,
      "",
      `Final balance: ${money(result.finalBalance)}`,
      `Total paid in: ${money(result.totalContributed)}`,
      `Interest earned: ${money(result.totalInterest)} (${result.interestShareOfFinalPct}% of the balance)`,
      `Same money at simple interest: ${money(result.simpleFinalBalance)}`,
      `Interest earned on interest: ${money(result.interestOnInterest)}`,
      result.doublingYearsExact
        ? `Money doubles every ${result.doublingYearsExact} years (rule of 72 says ${result.doublingYearsRule72})`
        : "At a zero return nothing doubles",
    ].join("\n");
  }, [hasError, result, monthlyContribution]);

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
    setPrincipal(DEFAULTS.principal);
    setMonthlyContribution(DEFAULTS.monthlyContribution);
    setAnnualRatePct(DEFAULTS.annualRatePct);
    setYears(DEFAULTS.years);
    setCompoundsPerYear(DEFAULTS.compoundsPerYear);
    setContributionTiming(DEFAULTS.contributionTiming);
    setCopied(false);
  };

  const tableRows = hasError ? [] : sampleSeries(result.series, 13);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ChartLine className="h-4 w-4" aria-hidden="true" />
          Compounding vs simple interest
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Compound Interest Visualiser
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The curve bends because interest starts earning interest. Change the rate, the period or
          the compounding frequency and watch the gap against a straight simple-interest line open
          up.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="civ-principal">
              Starting amount (INR)
            </label>
            <input
              id="civ-principal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={principal}
              onChange={(event) => setPrincipal(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="civ-monthly">
              Added every month (INR)
            </label>
            <input
              id="civ-monthly"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={monthlyContribution}
              onChange={(event) => setMonthlyContribution(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="civ-rate">
              Annual return (%)
            </label>
            <input
              id="civ-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.25"
              value={annualRatePct}
              onChange={(event) => setAnnualRatePct(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="civ-years">
              Years ({MAX_YEARS} max)
            </label>
            <input
              id="civ-years"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_YEARS}
              step="1"
              value={years}
              onChange={(event) => setYears(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="civ-compounds">
              Compounding frequency
            </label>
            <select
              id="civ-compounds"
              className={`mt-2 ${INPUT_CLASS}`}
              value={compoundsPerYear}
              onChange={(event) => setCompoundsPerYear(event.target.value)}
            >
              {COMPOUNDING_OPTIONS.map((option) => (
                <option key={option.value} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="civ-timing">
              Contribution goes in
            </label>
            <select
              id="civ-timing"
              className={`mt-2 ${INPUT_CLASS}`}
              value={contributionTiming}
              onChange={(event) => setContributionTiming(event.target.value)}
            >
              <option value="end">At the end of each month</option>
              <option value="start">At the start of each month</option>
            </select>
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Balance after {hasError ? "—" : result.years} years
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {hasError ? "—" : money(result.finalBalance)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "—"
                : `${result.interestShareOfFinalPct}% of that is interest you never paid in`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the compound interest projection"
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
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Total paid in", hasError ? "—" : money(result.totalContributed)],
            ["Interest earned", hasError ? "—" : money(result.totalInterest)],
            ["Same money at simple interest", hasError ? "—" : money(result.simpleFinalBalance)],
            ["Extra from interest on interest", hasError ? "—" : money(result.interestOnInterest)],
            [
              "Effective annual rate",
              hasError ? "—" : `${result.effectiveAnnualRatePct}% (nominal ${result.nominalRatePct}%)`,
            ],
            [
              "Doubling period",
              hasError || result.doublingYearsExact === null
                ? "—"
                : `${result.doublingYearsExact} years (rule of 72: ${result.doublingYearsRule72})`,
            ],
            [
              "Year interest overtakes contributions",
              hasError ? "—" : result.crossoverYear ? `Year ${result.crossoverYear}` : "Not within this period",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {geometry ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Growth curve</h2>
          <div className="mt-4 overflow-x-auto">
            <svg
              viewBox={`0 0 ${CHART_BOX.width} ${CHART_BOX.height}`}
              className="h-64 w-full min-w-[320px]"
              role="img"
              aria-label={`Balance grows from ${money(result.series[0].balance)} to ${money(result.finalBalance)} over ${result.years} years, against ${money(result.simpleFinalBalance)} at simple interest.`}
            >
              {geometry.gridLines.map((line) => (
                <line
                  key={line.value}
                  x1={CHART_BOX.padLeft}
                  x2={CHART_BOX.width - CHART_BOX.padRight}
                  y1={line.y}
                  y2={line.y}
                  stroke="var(--border)"
                  strokeWidth="1"
                />
              ))}
              <path d={geometry.area} fill="var(--primary)" opacity="0.12" />
              <path
                d={geometry.contributedLine}
                fill="none"
                stroke="var(--muted-foreground)"
                strokeWidth="2"
                strokeDasharray="2 4"
              />
              <path
                d={geometry.simpleLine}
                fill="none"
                stroke="var(--muted-foreground)"
                strokeWidth="2"
                strokeDasharray="6 4"
              />
              <path
                d={geometry.compoundLine}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {geometry.xTicks.map((tick) => (
                <text
                  key={tick.year}
                  x={tick.x}
                  y={CHART_BOX.height - 8}
                  textAnchor="middle"
                  fontSize="11"
                  fill="var(--muted-foreground)"
                >
                  {tick.year}y
                </text>
              ))}
            </svg>
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--muted-foreground)]">
            <li className="flex items-center gap-2">
              <span className="h-0.5 w-6 rounded bg-[var(--primary)]" aria-hidden="true" />
              Compound balance
            </li>
            <li className="flex items-center gap-2">
              <span
                className="h-0.5 w-6 rounded bg-[var(--muted-foreground)] opacity-80"
                aria-hidden="true"
              />
              Simple interest, dashed long
            </li>
            <li className="flex items-center gap-2">
              <span
                className="h-0.5 w-6 rounded bg-[var(--muted-foreground)] opacity-50"
                aria-hidden="true"
              />
              Money paid in, dotted
            </li>
          </ul>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Top gridline is {compact(geometry.scaleMax)}.
          </p>
        </section>
      ) : null}

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Year by year</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-medium">
                    Year
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">
                    Paid in
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">
                    Interest
                  </th>
                  <th scope="col" className="py-2 text-right font-medium">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => (
                  <tr key={row.year} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{row.year}</td>
                    <td className="py-2 pr-3 text-right">{money(row.contributed)}</td>
                    <td className="py-2 pr-3 text-right">{money(row.interest)}</td>
                    <td className="py-2 text-right font-semibold">{money(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Educational only, not investment advice. A constant annual return is a teaching assumption
        — real market returns vary year to year, and tax on interest or gains, plus fund charges,
        will reduce every figure shown here.
      </p>
    </main>
  );
}
