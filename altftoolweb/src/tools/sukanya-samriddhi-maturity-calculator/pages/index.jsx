"use client";

import { useMemo, useState } from "react";
import { Baby, Check, Copy, RotateCcw } from "lucide-react";

import {
  DEPOSIT_YEARS,
  MATURITY_YEARS,
  MAX_ANNUAL_DEPOSIT,
  MIN_ANNUAL_DEPOSIT,
  NOTIFIED_RATE_PERCENT,
  computeSukanyaSamriddhi,
} from "../lib";

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
  annualDeposit: "150000",
  ageAtOpening: "5",
  annualRatePercent: String(NOTIFIED_RATE_PERCENT),
  depositYears: String(DEPOSIT_YEARS),
  depositTiming: "start",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [annualDeposit, setAnnualDeposit] = useState(DEFAULTS.annualDeposit);
  const [ageAtOpening, setAgeAtOpening] = useState(DEFAULTS.ageAtOpening);
  const [annualRatePercent, setAnnualRatePercent] = useState(DEFAULTS.annualRatePercent);
  const [depositYears, setDepositYears] = useState(DEFAULTS.depositYears);
  const [depositTiming, setDepositTiming] = useState(DEFAULTS.depositTiming);
  const [showSchedule, setShowSchedule] = useState(true);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeSukanyaSamriddhi({
        annualDeposit: toNumber(annualDeposit),
        ageAtOpening: toNumber(ageAtOpening),
        annualRatePercent: toNumber(annualRatePercent),
        depositYears: toNumber(depositYears),
        depositTiming,
      }),
    [annualDeposit, ageAtOpening, annualRatePercent, depositYears, depositTiming],
  );

  const hasError = Boolean(result.error);
  const show = (value) => (hasError ? DASH : money(value));

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Sukanya Samriddhi projection",
      `Deposit: ${money(result.annualDeposit)} a year for ${result.depositYears} years`,
      `Rate: ${pct(result.annualRatePercent)} a year, compounded annually`,
      `Girl's age at opening: ${result.ageAtOpening}; at maturity: ${result.ageAtMaturity}`,
      `Total deposited: ${money(result.totalDeposited)}`,
      `Total interest: ${money(result.totalInterest)}`,
      `Maturity value after ${result.maturityYears} years: ${money(result.maturityValue)}`,
      `Partial withdrawal available at 18: up to ${money(result.partialWithdrawalLimit)}`,
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
    setAnnualDeposit(DEFAULTS.annualDeposit);
    setAgeAtOpening(DEFAULTS.ageAtOpening);
    setAnnualRatePercent(DEFAULTS.annualRatePercent);
    setDepositYears(DEFAULTS.depositYears);
    setDepositTiming(DEFAULTS.depositTiming);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Baby className="h-4 w-4" aria-hidden="true" />
          Sukanya Samriddhi
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Sukanya Samriddhi Maturity Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Deposits run for {DEPOSIT_YEARS} years, the balance keeps compounding annually, and the
          account matures {MATURITY_YEARS} years after it is opened. See the corpus, the interest and
          the age your daughter will be when it pays out.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ssy-deposit">
              Deposit each financial year (INR)
            </label>
            <input
              id="ssy-deposit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={String(MIN_ANNUAL_DEPOSIT)}
              max={String(MAX_ANNUAL_DEPOSIT)}
              step="500"
              value={annualDeposit}
              onChange={(event) => setAnnualDeposit(event.target.value)}
            />
            <p className={HINT_CLASS}>
              Between {money(MIN_ANNUAL_DEPOSIT)} and {money(MAX_ANNUAL_DEPOSIT)} a financial year.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssy-age">
              Girl&apos;s age when the account is opened
            </label>
            <input
              id="ssy-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="9"
              step="1"
              value={ageAtOpening}
              onChange={(event) => setAgeAtOpening(event.target.value)}
            />
            <p className={HINT_CLASS}>The account can only be opened before she turns 10.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssy-rate">
              Interest rate (% a year)
            </label>
            <input
              id="ssy-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="15"
              step="0.1"
              value={annualRatePercent}
              onChange={(event) => setAnnualRatePercent(event.target.value)}
            />
            <p className={HINT_CLASS}>
              Notified quarterly by the Ministry of Finance; {pct(NOTIFIED_RATE_PERCENT)} is the rate
              in force.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssy-years">
              Years you will actually deposit
            </label>
            <input
              id="ssy-years"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={String(DEPOSIT_YEARS)}
              step="1"
              value={depositYears}
              onChange={(event) => setDepositYears(event.target.value)}
            />
            <p className={HINT_CLASS}>The scheme allows deposits for up to {DEPOSIT_YEARS} years.</p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ssy-timing">
              When you deposit
            </label>
            <select
              id="ssy-timing"
              className={`mt-2 ${INPUT_CLASS}`}
              value={depositTiming}
              onChange={(event) => setDepositTiming(event.target.value)}
            >
              <option value="start">Start of the financial year (April)</option>
              <option value="end">End of the financial year (March)</option>
            </select>
            <p className={HINT_CLASS}>
              Depositing in April earns a full year of interest on that deposit; depositing in March
              earns none for that year.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[12000, 24000, 60000, 100000, 150000].map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => setAnnualDeposit(String(amount))}
              className={CHIP_BTN}
            >
              {money(amount)} a year
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
              Maturity value
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {show(result.maturityValue)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your figures."
                : `Paid out ${result.maturityYears} years after opening, when she is ${result.ageAtMaturity}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the Sukanya Samriddhi projection"
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
            ["Total deposited", show(result.totalDeposited)],
            ["Total interest earned", show(result.totalInterest)],
            ["Growth on the money put in", hasError ? DASH : `${NUM.format(result.growthMultiple)}x`],
            ["Interest as a share of the corpus", hasError ? DASH : pct(result.interestShare)],
            [
              "Balance when deposits stop",
              hasError
                ? DASH
                : `${money(result.balanceWhenDepositsStop)} at age ${result.ageWhenDepositsStop}`,
            ],
            ["Growth after the last deposit", show(result.growthAfterDeposits)],
            [
              "Partial withdrawal available at 18",
              hasError
                ? DASH
                : `${money(result.partialWithdrawalLimit)} (50% of ${money(result.balanceBeforeWithdrawal)})`,
            ],
            [
              "Deduction available under section 80C",
              hasError
                ? DASH
                : `${money(result.section80cEligible)} a year, inside the ${money(result.section80cLimit)} cap`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-5">
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Deposits are ${pct(100 - result.interestShare)} and interest is ${pct(result.interestShare)} of the maturity amount`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, 100 - result.interestShare))}%` }}
              />
              <span
                className="block h-full bg-[var(--success)]"
                style={{ width: `${Math.max(0, Math.min(100, result.interestShare))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Your deposits {pct(100 - result.interestShare)} · Interest {pct(result.interestShare)}
            </p>
          </div>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Year-by-year balance</h2>
            <button
              type="button"
              onClick={() => setShowSchedule((value) => !value)}
              aria-expanded={showSchedule}
              className="min-h-11 rounded-md px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {showSchedule ? "Hide" : "Show"}
            </button>
          </div>
          {showSchedule && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[440px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Year</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Her age</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Deposit</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Interest</th>
                    <th scope="col" className="py-2 text-right font-semibold">Closing</th>
                  </tr>
                </thead>
                <tbody>
                  {result.schedule.map((row) => (
                    <tr key={row.year} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.year}</td>
                      <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.ageDuringYear}</td>
                      <td className="py-2 pr-3 text-right">{money(row.deposit)}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {money(row.interest)}
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
        Projection only. The interest rate is notified every quarter and will change over the
        21 years, so the actual maturity amount will differ. Post office interest is calculated on
        the lowest balance between the fifth day and the end of each month. Not tax or investment
        advice — check the current scheme rules before opening an account.
      </p>
    </main>
  );
}
