"use client";

import { useMemo, useState } from "react";
import { Check, Copy, LifeBuoy, RotateCcw } from "lucide-react";

import { CURRENCIES, EMPLOYMENT_LABELS, sizeEmergencyFund } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium text-[var(--foreground)]";

const DASH = "—";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);

const DEFAULTS = {
  currency: "INR",
  expenses: "60000",
  debt: "15000",
  employment: "permanent",
  singleIncome: false,
  dependants: "2",
  healthCover: true,
  jobSearch: "3",
  existing: "200000",
  saving: "20000",
};

const STATUS_TEXT = {
  funded: "Fully funded",
  "on-track": "Past the three-month floor",
  thin: "Thin — under three months of cover",
  critical: "Critical — under one month of cover",
};

export default function ToolHome() {
  const [currency, setCurrency] = useState(DEFAULTS.currency);
  const [expenses, setExpenses] = useState(DEFAULTS.expenses);
  const [debt, setDebt] = useState(DEFAULTS.debt);
  const [employment, setEmployment] = useState(DEFAULTS.employment);
  const [singleIncome, setSingleIncome] = useState(DEFAULTS.singleIncome);
  const [dependants, setDependants] = useState(DEFAULTS.dependants);
  const [healthCover, setHealthCover] = useState(DEFAULTS.healthCover);
  const [jobSearch, setJobSearch] = useState(DEFAULTS.jobSearch);
  const [existing, setExisting] = useState(DEFAULTS.existing);
  const [saving, setSaving] = useState(DEFAULTS.saving);
  const [copied, setCopied] = useState(false);

  const money = useMemo(() => {
    const entry = CURRENCIES.find((item) => item.code === currency) ?? CURRENCIES[0];
    const formatter = new Intl.NumberFormat(entry.locale, {
      style: "currency",
      currency: entry.code,
      maximumFractionDigits: 0,
    });
    return (value) => formatter.format(Number.isFinite(value) ? value : 0);
  }, [currency]);

  const result = useMemo(
    () =>
      sizeEmergencyFund({
        monthlyExpenses: expenses,
        monthlyDebt: debt,
        employment,
        singleIncome,
        dependants,
        healthCover,
        jobSearchMonths: jobSearch,
        existingSavings: existing,
        monthlySaving: saving,
      }),
    [expenses, debt, employment, singleIncome, dependants, healthCover, jobSearch, existing, saving],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Emergency Fund Plan",
      `Essential monthly outgo: ${money(result.monthlyOutgo)}`,
      `Runway recommended: ${num(result.targetMonths)} months`,
      `Target fund: ${money(result.targetFund)}`,
      `Already saved: ${money(result.existingSavings)} (${num(result.currentRunwayMonths)} months of cover)`,
      result.gap > 0
        ? `Still to save: ${money(result.gap)}`
        : `Surplus above target: ${money(result.surplus)}`,
      result.gap > 0
        ? result.monthsToFill === null
          ? "Set a monthly saving amount to see how long the gap takes to close."
          : `At ${money(result.monthlySaving)} a month the gap closes in ${result.monthsToFill} month(s).`
        : "Target already met.",
    ].join("\n");
  }, [hasError, money, result]);

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
    setCurrency(DEFAULTS.currency);
    setExpenses(DEFAULTS.expenses);
    setDebt(DEFAULTS.debt);
    setEmployment(DEFAULTS.employment);
    setSingleIncome(DEFAULTS.singleIncome);
    setDependants(DEFAULTS.dependants);
    setHealthCover(DEFAULTS.healthCover);
    setJobSearch(DEFAULTS.jobSearch);
    setExisting(DEFAULTS.existing);
    setSaving(DEFAULTS.saving);
    setCopied(false);
  };

  const numberFields = [
    { id: "ef-expenses", label: "Essential monthly expenses", value: expenses, set: setExpenses, step: "1000", min: "0" },
    { id: "ef-debt", label: "Loan & card instalments a month", value: debt, set: setDebt, step: "500", min: "0" },
    { id: "ef-dependants", label: "People depending on this income", value: dependants, set: setDependants, step: "1", min: "0" },
    { id: "ef-search", label: "Months you expect a job search to take", value: jobSearch, set: setJobSearch, step: "1", min: "0" },
    { id: "ef-existing", label: "Liquid savings already set aside", value: existing, set: setExisting, step: "5000", min: "0" },
    { id: "ef-saving", label: "Amount you can save each month", value: saving, set: setSaving, step: "1000", min: "0" },
  ];

  const rows = hasError
    ? [
        ["Essential monthly outgo", DASH],
        ["Runway recommended", DASH],
        ["Cover you have today", DASH],
        ["Still to save", DASH],
        ["Time to close the gap", DASH],
        ["Status", DASH],
      ]
    : [
        ["Essential monthly outgo", money(result.monthlyOutgo)],
        ["Runway recommended", `${num(result.targetMonths)} months`],
        [
          "Cover you have today",
          `${money(result.existingSavings)} · ${num(result.currentRunwayMonths)} months (${num(result.coveragePct)}%)`,
        ],
        [
          result.gap > 0 ? "Still to save" : "Surplus above target",
          result.gap > 0 ? money(result.gap) : money(result.surplus),
        ],
        [
          "Time to close the gap",
          result.gap <= 0
            ? "Already there"
            : result.monthsToFill === null
              ? "Enter a monthly saving amount"
              : `${result.monthsToFill} month(s)`,
        ],
        ["Status", STATUS_TEXT[result.status]],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <LifeBuoy className="h-4 w-4" aria-hidden="true" />
          Safety net
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Global Emergency Fund Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Start at the three-month floor, add months for unstable income, dependants, a single
          earner and missing health cover, then check the answer against how long a job search
          really takes where you live.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ef-currency">
              Currency
            </label>
            <select
              id="ef-currency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              {CURRENCIES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.code} — {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ef-employment">
              How your income is earned
            </label>
            <select
              id="ef-employment"
              className={`mt-2 ${INPUT_CLASS}`}
              value={employment}
              onChange={(event) => setEmployment(event.target.value)}
            >
              {Object.entries(EMPLOYMENT_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {numberFields.map((field) => (
            <div key={field.id}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min={field.min}
                step={field.step}
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
              />
            </div>
          ))}

          <div className={CHECK_ROW}>
            <input
              id="ef-single"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={singleIncome}
              onChange={(event) => setSingleIncome(event.target.checked)}
            />
            <label htmlFor="ef-single" className="flex-1 cursor-pointer">
              Only one earner in the household
            </label>
          </div>

          <div className={CHECK_ROW}>
            <input
              id="ef-health"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={healthCover}
              onChange={(event) => setHealthCover(event.target.checked)}
            />
            <label htmlFor="ef-health" className="flex-1 cursor-pointer">
              Household has health insurance
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Emergency fund target
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.targetFund)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to size your fund."
                : `${num(result.targetMonths)} months of ${money(result.monthlyOutgo)} essential outgo`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy emergency fund plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <div className="mt-5">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
              <div
                className="h-full rounded-full bg-[var(--primary)] transition-[width] motion-reduce:transition-none"
                style={{ width: `${Math.max(2, result.coveragePct)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {num(result.coveragePct)}% of the target is already saved.
            </p>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">How the {num(result.targetMonths)} months were built</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[300px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Factor</th>
                  <th scope="col" className="py-2 text-right font-semibold">Months</th>
                </tr>
              </thead>
              <tbody>
                {result.drivers.map((driver) => (
                  <tr key={driver.label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{driver.label}</td>
                    <td className="py-2 text-right font-semibold">
                      {driver.months > 0 ? `+${num(driver.months)}` : num(driver.months)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A planning guide, not financial advice. Notice periods, severance rules, unemployment
        benefits and healthcare costs differ by country — adjust the job-search input to match your
        own labour market, and speak to a licensed adviser about your situation.
      </p>
    </main>
  );
}
