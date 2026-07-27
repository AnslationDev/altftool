"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Layers, RotateCcw } from "lucide-react";

import {
  ACTIVITY_TYPES,
  classifyMudraLoan,
  ENTITY_TYPES,
  GUARANTEE_SCHEME,
  MUDRA_CATEGORIES,
  MUDRA_MAX_LOAN,
  TYPICAL_RATE_RANGE,
} from "../lib";

const DEFAULTS = {
  amount: "400000",
  entityType: "proprietorship",
  activity: "services",
  age: "34",
  isDefaulter: false,
  repaidPriorTarun: false,
  annualRate: "11",
  tenureMonths: "60",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const DASH = "—";

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
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [entityType, setEntityType] = useState(DEFAULTS.entityType);
  const [activity, setActivity] = useState(DEFAULTS.activity);
  const [age, setAge] = useState(DEFAULTS.age);
  const [isDefaulter, setIsDefaulter] = useState(DEFAULTS.isDefaulter);
  const [repaidPriorTarun, setRepaidPriorTarun] = useState(DEFAULTS.repaidPriorTarun);
  const [annualRate, setAnnualRate] = useState(DEFAULTS.annualRate);
  const [tenureMonths, setTenureMonths] = useState(DEFAULTS.tenureMonths);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      classifyMudraLoan({
        amount: toNumber(amount),
        entityType,
        activity,
        age: toNumber(age),
        isDefaulter,
        repaidPriorTarun,
        annualRate: toNumber(annualRate),
        tenureMonths: toNumber(tenureMonths),
      }),
    [amount, entityType, activity, age, isDefaulter, repaidPriorTarun, annualRate, tenureMonths],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Mudra Loan Category Selector",
      `Loan needed: ${INR.format(result.amount)}`,
      `Category: ${result.categoryName || "outside PMMY"}`,
      `Eligible on the checks entered: ${result.eligible ? "yes" : "no"}`,
      `Collateral required: ${result.collateralRequired ? "yes" : "no"} (${result.guaranteeScheme})`,
      `Indicative EMI at ${result.annualRate}% for ${result.tenureMonths} months: ${INR.format(result.indicativeEmi)}`,
      ...(result.blockers.length ? ["Blockers:", ...result.blockers.map((b) => `- ${b}`)] : []),
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
    setAmount(DEFAULTS.amount);
    setEntityType(DEFAULTS.entityType);
    setActivity(DEFAULTS.activity);
    setAge(DEFAULTS.age);
    setIsDefaulter(DEFAULTS.isDefaulter);
    setRepaidPriorTarun(DEFAULTS.repaidPriorTarun);
    setAnnualRate(DEFAULTS.annualRate);
    setTenureMonths(DEFAULTS.tenureMonths);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Layers className="h-4 w-4" aria-hidden="true" />
          PMMY slabs
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Mudra Loan Category Selector
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the amount you need and what the business does. The selector places the loan in
          Shishu, Kishore, Tarun or Tarun Plus and lists every scheme condition that would stop it.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="loan-amount">
              Loan amount needed (INR)
            </label>
            <input
              id="loan-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="10000"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="entity-type">
              Type of borrower
            </label>
            <select
              id="entity-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={entityType}
              onChange={(event) => setEntityType(event.target.value)}
            >
              {ENTITY_TYPES.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="activity">
              What the money is for
            </label>
            <select
              id="activity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={activity}
              onChange={(event) => setActivity(event.target.value)}
            >
              {ACTIVITY_TYPES.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="borrower-age">
              Borrower age (years)
            </label>
            <input
              id="borrower-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="120"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="tenure-months">
              Indicative tenure (months)
            </label>
            <input
              id="tenure-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="6"
              max="84"
              step="6"
              value={tenureMonths}
              onChange={(event) => setTenureMonths(event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="annual-rate">
              Indicative interest rate (% per year, typically{" "}
              {TYPICAL_RATE_RANGE[0]}–{TYPICAL_RATE_RANGE[1]})
            </label>
            <input
              id="annual-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="40"
              step="0.25"
              value={annualRate}
              onChange={(event) => setAnnualRate(event.target.value)}
            />
          </div>

          <div className="sm:col-span-2 grid gap-3">
            <label
              htmlFor="prior-tarun"
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium"
            >
              <input
                id="prior-tarun"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={repaidPriorTarun}
                onChange={(event) => setRepaidPriorTarun(event.target.checked)}
              />
              I have already taken and fully repaid a Tarun loan
            </label>
            <label
              htmlFor="is-defaulter"
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium"
            >
              <input
                id="is-defaulter"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={isDefaulter}
                onChange={(event) => setIsDefaulter(event.target.checked)}
              />
              I am currently a defaulter with a bank or financial institution
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Mudra category
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.categoryName || "Outside PMMY"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see the category."
                : result.category
                  ? `${result.category.meaning} · ${INR.format(result.category.min)} to ${INR.format(result.category.max)}`
                  : `Above the ${INR.format(MUDRA_MAX_LOAN)} PMMY ceiling`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the Mudra classification to the clipboard"
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
            [
              "Eligible on the checks entered",
              hasError ? DASH : result.eligible ? "Yes" : "No — see the blockers below",
            ],
            [
              "Headroom left in this slab",
              hasError || !result.category ? DASH : INR.format(result.headroom),
            ],
            ["Collateral required", hasError ? DASH : result.collateralRequired ? "Yes" : "No"],
            ["Credit guarantee", hasError ? DASH : result.guaranteeScheme],
            [
              "Indicative EMI",
              hasError ? DASH : `${INR.format(result.indicativeEmi)} per month`,
            ],
            [
              "Indicative total interest",
              hasError ? DASH : INR.format(result.indicativeTotalInterest),
            ],
            [
              "Typical use of this slab",
              hasError || !result.category ? DASH : result.category.typicalUse,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.blockers.length > 0 && (
          <div className="mt-4 space-y-2">
            {result.blockers.map((note) => (
              <p
                key={note}
                role="alert"
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {note}
              </p>
            ))}
          </div>
        )}

        {!hasError && result.warnings.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.warnings.map((note) => (
              <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {note}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The four PMMY slabs</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[460px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Category</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Sanctioned amount</th>
                <th scope="col" className="py-2 font-semibold">Prior loan needed</th>
              </tr>
            </thead>
            <tbody>
              {MUDRA_CATEGORIES.map((slab) => (
                <tr key={slab.key} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{slab.name}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">
                    {INR.format(slab.min)} – {INR.format(slab.max)}
                  </td>
                  <td className="py-2 text-[var(--muted-foreground)]">
                    {slab.priorLoanRequired ? "Yes — a repaid Tarun loan" : "No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        PMMY loans carry no collateral because credit risk sits with {GUARANTEE_SCHEME}. Interest is
        not fixed by the scheme — each lender prices it under RBI&apos;s deregulated regime. This is
        an eligibility guide, not a sanction; the lender&apos;s own credit appraisal decides.
      </p>
    </main>
  );
}
