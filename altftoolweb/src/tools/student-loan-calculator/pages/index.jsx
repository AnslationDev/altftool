"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw } from "lucide-react";

import { STANDARD_TERM_YEARS, computeStudentLoan } from "../lib";

const DASH = "—";

const CURRENCIES = [
  { id: "USD", label: "US dollar (USD)", locale: "en-US" },
  { id: "GBP", label: "Pound sterling (GBP)", locale: "en-GB" },
  { id: "EUR", label: "Euro (EUR)", locale: "de-DE" },
  { id: "INR", label: "Indian rupee (INR)", locale: "en-IN" },
  { id: "CAD", label: "Canadian dollar (CAD)", locale: "en-CA" },
  { id: "AUD", label: "Australian dollar (AUD)", locale: "en-AU" },
];

const INT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const DEC1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  principal: "30000",
  annualRatePercent: "6.53",
  termYears: String(STANDARD_TERM_YEARS),
  graceMonths: "6",
  subsidised: false,
  extraMonthly: "0",
  currencyId: "USD",
};

export default function ToolHome() {
  const [principal, setPrincipal] = useState(DEFAULTS.principal);
  const [annualRatePercent, setAnnualRatePercent] = useState(DEFAULTS.annualRatePercent);
  const [termYears, setTermYears] = useState(DEFAULTS.termYears);
  const [graceMonths, setGraceMonths] = useState(DEFAULTS.graceMonths);
  const [subsidised, setSubsidised] = useState(DEFAULTS.subsidised);
  const [extraMonthly, setExtraMonthly] = useState(DEFAULTS.extraMonthly);
  const [currencyId, setCurrencyId] = useState(DEFAULTS.currencyId);
  const [copied, setCopied] = useState(false);

  const currency = CURRENCIES.find((c) => c.id === currencyId) ?? CURRENCIES[0];
  const money = useMemo(
    () =>
      new Intl.NumberFormat(currency.locale, {
        style: "currency",
        currency: currency.id,
        maximumFractionDigits: currency.id === "INR" ? 0 : 2,
      }),
    [currency],
  );

  const result = useMemo(
    () =>
      computeStudentLoan({
        principal: Number(principal),
        annualRatePercent: Number(annualRatePercent),
        termYears: Number(termYears),
        graceMonths: Number(graceMonths),
        subsidised,
        extraMonthly: Number(extraMonthly),
      }),
    [principal, annualRatePercent, termYears, graceMonths, subsidised, extraMonthly],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Student loan — ${money.format(result.principal)} over ${INT.format(result.termMonths)} months`,
      `Monthly payment: ${money.format(result.monthlyPayment)}`,
      `Interest capitalised before repayment: ${money.format(result.capitalisedInterest)}`,
      `Balance at repayment start: ${money.format(result.startingBalance)}`,
      `Interest paid during repayment: ${money.format(result.totalInterest)}`,
      `Total repaid: ${money.format(result.totalPaid)}`,
      result.withExtra
        ? `With ${money.format(result.extraMonthly)} extra a month: paid off in ${INT.format(result.withExtra.months)} months, saving ${money.format(result.withExtra.interestSaved)}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, result, money]);

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
    setAnnualRatePercent(DEFAULTS.annualRatePercent);
    setTermYears(DEFAULTS.termYears);
    setGraceMonths(DEFAULTS.graceMonths);
    setSubsidised(DEFAULTS.subsidised);
    setExtraMonthly(DEFAULTS.extraMonthly);
    setCurrencyId(DEFAULTS.currencyId);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Interest capitalised before repayment", DASH],
        ["Balance when repayment starts", DASH],
        ["Interest paid over the term", DASH],
        ["Total repaid", DASH],
        ["Total cost of borrowing", DASH],
        ["Payoff time", DASH],
      ]
    : [
        [
          "Interest capitalised before repayment",
          result.subsidised ? "None (subsidised)" : money.format(result.capitalisedInterest),
        ],
        ["Balance when repayment starts", money.format(result.startingBalance)],
        ["Interest paid over the term", money.format(result.totalInterest)],
        ["Total repaid", money.format(result.totalPaid)],
        ["Total cost of borrowing", money.format(result.totalCostOfBorrowing)],
        [
          "Payoff time",
          result.withExtra
            ? `${INT.format(result.withExtra.months)} months (${DEC1.format(result.withExtra.years)} years)`
            : `${INT.format(result.payoffMonths)} months (${DEC1.format(result.payoffYears)} years)`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          Education finance
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Student Loan Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out the monthly payment, the interest that capitalises before repayment starts, and
          the total cost of a student loan — plus what an extra payment each month would save.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sl-principal">
              Amount borrowed
            </label>
            <input
              id="sl-principal"
              type="number"
              inputMode="decimal"
              min="1"
              step="100"
              value={principal}
              onChange={(event) => setPrincipal(event.target.value)}
              className={`mt-2 ${INPUT_CLASS}`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sl-currency">
              Currency
            </label>
            <select
              id="sl-currency"
              value={currencyId}
              onChange={(event) => setCurrencyId(event.target.value)}
              className={`mt-2 ${INPUT_CLASS}`}
            >
              {CURRENCIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sl-rate">
              Annual interest rate (%)
            </label>
            <input
              id="sl-rate"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={annualRatePercent}
              onChange={(event) => setAnnualRatePercent(event.target.value)}
              className={`mt-2 ${INPUT_CLASS}`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sl-term">
              Repayment term (years)
            </label>
            <input
              id="sl-term"
              type="number"
              inputMode="numeric"
              min="1"
              max="30"
              step="1"
              value={termYears}
              onChange={(event) => setTermYears(event.target.value)}
              className={`mt-2 ${INPUT_CLASS}`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sl-grace">
              Months before repayment starts
            </label>
            <input
              id="sl-grace"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={graceMonths}
              onChange={(event) => setGraceMonths(event.target.value)}
              className={`mt-2 ${INPUT_CLASS}`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sl-extra">
              Extra payment each month
            </label>
            <input
              id="sl-extra"
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={extraMonthly}
              onChange={(event) => setExtraMonthly(event.target.value)}
              className={`mt-2 ${INPUT_CLASS}`}
            />
          </div>
          <div className="sm:col-span-2">
            <label
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold"
              htmlFor="sl-subsidised"
            >
              <input
                id="sl-subsidised"
                type="checkbox"
                checked={subsidised}
                onChange={(event) => setSubsidised(event.target.checked)}
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
              />
              Subsidised loan — interest is paid for me before repayment starts
            </label>
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
              Monthly payment
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money.format(result.monthlyPayment)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `Scheduled instalment for ${INT.format(result.termMonths)} months on a balance of ${money.format(result.startingBalance)}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the student loan summary"
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

        {!hasError && result.withExtra ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
            Paying {money.format(result.withExtra.payment)} a month instead of{" "}
            {money.format(result.monthlyPayment)} clears the loan{" "}
            {INT.format(result.withExtra.monthsSaved)} months early and saves{" "}
            {money.format(result.withExtra.interestSaved)} in interest.
          </p>
        ) : null}
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Scheduled repayment, year by year</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[460px] text-left text-sm">
              <thead>
                <tr className="text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Year
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Interest
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Principal
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {result.schedule.map((row) => (
                  <tr key={row.year}>
                    <td className="py-2.5 pr-3">{row.year}</td>
                    <td className="py-2.5 pr-3">{money.format(row.interest)}</td>
                    <td className="py-2.5 pr-3">{money.format(row.principal)}</td>
                    <td className="py-2.5 font-semibold">{money.format(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        An illustration, not financial advice. Real loans differ — income-driven plans, variable
        rates, loan fees, forgiveness programmes and daily rather than monthly interest accrual all
        change the numbers. Check the figures with your loan servicer.
      </p>
    </main>
  );
}
