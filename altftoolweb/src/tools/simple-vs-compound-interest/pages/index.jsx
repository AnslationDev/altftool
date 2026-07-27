"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scale } from "lucide-react";

import { COMPOUNDING_OPTIONS, MAX_YEARS, compareInterest } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const money2 = (value) => (Number.isFinite(value) ? INR2.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  principal: "100000",
  annualRatePct: "10",
  years: "10",
  compoundsPerYear: "1",
};

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [principal, setPrincipal] = useState(DEFAULTS.principal);
  const [annualRatePct, setAnnualRatePct] = useState(DEFAULTS.annualRatePct);
  const [years, setYears] = useState(DEFAULTS.years);
  const [compoundsPerYear, setCompoundsPerYear] = useState(DEFAULTS.compoundsPerYear);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const values = {
      principal: toNumber(principal),
      annualRatePct: toNumber(annualRatePct),
      years: toNumber(years),
      compoundsPerYear: toNumber(compoundsPerYear),
    };
    if (Object.values(values).some((value) => Number.isNaN(value))) {
      return { error: "Principal, rate and period all need a number." };
    }
    return compareInterest(values);
  }, [principal, annualRatePct, years, compoundsPerYear]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Simple vs compound interest",
      `Principal: ${money(result.principal)} at ${result.nominalRatePct}% for ${result.years} years`,
      `Compounding: ${result.compoundsPerYear} time(s) a year, effective ${result.effectiveAnnualRatePct}%`,
      "",
      `Simple interest: ${money2(result.simpleInterest)} — matures at ${money2(result.simpleAmount)}`,
      `Compound interest: ${money2(result.compoundInterest)} — matures at ${money2(result.compoundAmount)}`,
      `Difference: ${money2(result.difference)}`,
      result.interestMultiple
        ? `Compound interest is ${result.interestMultiple}x the simple interest`
        : "",
      result.doublingYearsSimple
        ? `Doubles in ${result.doublingYearsSimple} years simple, ${result.doublingYearsCompound} years compound`
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
    setPrincipal(DEFAULTS.principal);
    setAnnualRatePct(DEFAULTS.annualRatePct);
    setYears(DEFAULTS.years);
    setCompoundsPerYear(DEFAULTS.compoundsPerYear);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          P(1 + rt) against P(1 + r/m)^mt
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Simple vs Compound Interest Comparator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Same principal, same rate, same period — one method pays interest on the principal only,
          the other pays interest on the interest as well. This shows the rupee gap and the year it
          opens up.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="svc-principal">
              Principal (INR)
            </label>
            <input
              id="svc-principal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1000"
              value={principal}
              onChange={(event) => setPrincipal(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="svc-rate">
              Annual rate (%)
            </label>
            <input
              id="svc-rate"
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
            <label className={LABEL_CLASS} htmlFor="svc-years">
              Period in years (max {MAX_YEARS})
            </label>
            <input
              id="svc-years"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.25"
              max={MAX_YEARS}
              step="0.25"
              value={years}
              onChange={(event) => setYears(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="svc-compounds">
              Compounding on the compound side
            </label>
            <select
              id="svc-compounds"
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
              {hasError || !result.simpleAheadAtEnd
                ? "Compounding gains you"
                : "Simple interest is still ahead by"}
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {hasError ? "—" : money2(Math.abs(result.difference))}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "—"
                : result.simpleAheadAtEnd
                  ? "Inside the first compounding period simple interest is fractionally ahead; compounding overtakes it at the first compounding date."
                  : result.interestMultiple
                    ? `Compound interest is ${result.interestMultiple} times the simple interest`
                    : "At a zero rate both methods pay nothing"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the simple versus compound comparison"
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

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] p-4">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Simple interest
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {hasError ? "—" : money2(result.simpleAmount)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Interest {hasError ? "—" : money2(result.simpleInterest)}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--primary)] p-4">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
              Compound interest
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {hasError ? "—" : money2(result.compoundAmount)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Interest {hasError ? "—" : money2(result.compoundInterest)}
            </p>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Principal", hasError ? "—" : money(result.principal)],
            [
              "Effective annual rate",
              hasError ? "—" : `${result.effectiveAnnualRatePct}% (nominal ${result.nominalRatePct}%)`,
            ],
            [
              "Years to double at simple interest",
              hasError || result.doublingYearsSimple === null ? "—" : `${result.doublingYearsSimple} years`,
            ],
            [
              "Years to double at compound interest",
              hasError || result.doublingYearsCompound === null
                ? "—"
                : `${result.doublingYearsCompound} years`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Year by year</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[440px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-medium">
                    Year
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">
                    Simple
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">
                    Compound
                  </th>
                  <th scope="col" className="py-2 text-right font-medium">
                    Gap
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.map((row) => (
                  <tr key={row.year} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{row.year}</td>
                    <td className="py-2 pr-3 text-right">{money(row.simpleAmount)}</td>
                    <td className="py-2 pr-3 text-right font-semibold">
                      {money(row.compoundAmount)}
                    </td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {money(row.gap)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Educational only, not investment advice. Deposits and loans in practice add tax on
        interest, processing charges and penalties for early closure, none of which are modelled
        here. Check the actual terms of the product before comparing two offers.
      </p>
    </main>
  );
}
