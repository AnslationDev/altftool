"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw } from "lucide-react";

import {
  MSSC_DEPOSIT_WINDOW_CLOSE,
  MSSC_GAP_BETWEEN_ACCOUNTS_MONTHS,
  MSSC_MAX_DEPOSIT,
  MSSC_PARTIAL_WITHDRAWAL_PCT,
  MSSC_RATE,
  MSSC_TENURE_YEARS,
  computeMsscMaturity,
  computeMsscPartialWithdrawal,
  computeMsscPrematureClosure,
} from "../lib";

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
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const money2 = (value) => (Number.isFinite(value) ? INR2.format(value) : "—");
const DASH = "—";

const DEFAULTS = {
  deposit: "200000",
  rate: String(MSSC_RATE),
  withdrawalPct: String(MSSC_PARTIAL_WITHDRAWAL_PCT),
  heldMonths: "12",
  ground: "voluntary",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const GROUNDS = [
  ["voluntary", "No stated reason (allowed after 6 months)"],
  ["death", "Death of the account holder"],
  ["compassionate", "Accepted compassionate grounds"],
];

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [deposit, setDeposit] = useState(DEFAULTS.deposit);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [withdrawalPct, setWithdrawalPct] = useState(DEFAULTS.withdrawalPct);
  const [heldMonths, setHeldMonths] = useState(DEFAULTS.heldMonths);
  const [ground, setGround] = useState(DEFAULTS.ground);
  const [copied, setCopied] = useState(false);

  const maturity = useMemo(
    () => computeMsscMaturity({ deposit: toNumber(deposit), annualRate: toNumber(rate) }),
    [deposit, rate],
  );

  const withdrawal = useMemo(
    () =>
      computeMsscPartialWithdrawal({
        deposit: toNumber(deposit),
        annualRate: toNumber(rate),
        withdrawalPct: toNumber(withdrawalPct),
      }),
    [deposit, rate, withdrawalPct],
  );

  const closure = useMemo(
    () =>
      computeMsscPrematureClosure({
        deposit: toNumber(deposit),
        annualRate: toNumber(rate),
        heldMonths: toNumber(heldMonths),
        ground,
      }),
    [deposit, rate, heldMonths, ground],
  );

  const ok = !maturity.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Mahila Samman Savings Certificate (MSSC)",
      `Deposit: ${money(maturity.deposit)}`,
      `Rate: ${NUM.format(maturity.annualRate)}% per year, compounded quarterly`,
      `Term: ${maturity.tenureYears} years (${maturity.totalQuarters} quarters)`,
      `Interest earned: ${money2(maturity.totalInterest)}`,
      `Maturity value: ${money2(maturity.maturityValue)}`,
      `Balance after 1 year: ${money2(withdrawal.balanceAtOneYear)}`,
      `Maximum 40% withdrawal after 1 year: ${money2(withdrawal.maxWithdrawal)}`,
    ].join("\n");
  }, [ok, maturity, withdrawal]);

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
    setDeposit(DEFAULTS.deposit);
    setRate(DEFAULTS.rate);
    setWithdrawalPct(DEFAULTS.withdrawalPct);
    setHeldMonths(DEFAULTS.heldMonths);
    setGround(DEFAULTS.ground);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          Small savings
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Mahila Samman Savings Certificate Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          MSSC compounds interest every quarter and pays everything at the end of two years.
          Value an existing certificate, see the {MSSC_PARTIAL_WITHDRAWAL_PCT}% withdrawal you can
          take after a year, and check what an early closure would pay.
        </p>
      </header>

      <p className="mb-6 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
        The scheme accepted fresh deposits only up to {MSSC_DEPOSIT_WINDOW_CLOSE}. Certificates
        opened inside that window continue to run to maturity, and this calculator values them.
      </p>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mssc-deposit">
              Deposit amount (INR)
            </label>
            <input
              id="mssc-deposit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1000"
              max={MSSC_MAX_DEPOSIT}
              step="100"
              value={deposit}
              onChange={(event) => setDeposit(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mssc-rate">
              Rate (% per year, compounded quarterly)
            </label>
            <input
              id="mssc-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[50000, 100000, 200000].map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => setDeposit(String(amount))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {money(amount)}
            </button>
          ))}
        </div>
      </section>

      {maturity.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {maturity.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Maturity value after {MSSC_TENURE_YEARS} years
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money2(maturity.maturityValue) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${money2(maturity.totalInterest)} of interest over ${maturity.totalQuarters} quarters of compounding`
                : "Fix the input above to see the maturity value"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the MSSC maturity result"
              className={GHOST_BTN}
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
            ["Amount deposited", ok ? money(maturity.deposit) : DASH],
            ["Interest earned", ok ? money2(maturity.totalInterest) : DASH],
            [
              "Effective simple return per year",
              ok ? `${NUM.format(maturity.simpleEquivalentRate)}%` : DASH,
            ],
            ["Headroom left under the ₹2 lakh cap", ok ? money(maturity.headroomToCap) : DASH],
            [
              "Deposit in multiples of ₹100",
              ok ? (maturity.depositIsValidMultiple ? "Yes" : "No — round to the nearest ₹100") : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <caption className="sr-only">Quarter-by-quarter balance</caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Quarter
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Interest added
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody>
                {maturity.schedule.map((row) => (
                  <tr key={row.quarter} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.quarter}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {money2(row.interest)}
                    </td>
                    <td className="py-2 text-right">{money2(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Partial withdrawal after one year</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mssc-withdraw">
              Share of the balance withdrawn (%)
            </label>
            <input
              id="mssc-withdraw"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max={MSSC_PARTIAL_WITHDRAWAL_PCT}
              step="5"
              value={withdrawalPct}
              onChange={(event) => setWithdrawalPct(event.target.value)}
            />
          </div>
        </div>

        {withdrawal.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {withdrawal.error}
          </p>
        ) : (
          <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
            {[
              ["Balance at the one-year mark", money2(withdrawal.balanceAtOneYear)],
              [`Maximum ${MSSC_PARTIAL_WITHDRAWAL_PCT}% withdrawal`, money2(withdrawal.maxWithdrawal)],
              ["Amount you take out now", money2(withdrawal.withdrawn)],
              ["Left to compound for four more quarters", money2(withdrawal.balanceAfterWithdrawal)],
              ["Paid at maturity after the withdrawal", money2(withdrawal.maturityAfterWithdrawal)],
              ["Total received either way", money2(withdrawal.totalReceived)],
              ["Interest given up by withdrawing", money2(withdrawal.costOfWithdrawing)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Closing the certificate early</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mssc-held">
              Months held
            </label>
            <input
              id="mssc-held"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="23"
              step="1"
              value={heldMonths}
              onChange={(event) => setHeldMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mssc-ground">
              Ground for closure
            </label>
            <select
              id="mssc-ground"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ground}
              onChange={(event) => setGround(event.target.value)}
            >
              {GROUNDS.map(([value, text]) => (
                <option key={value} value={value}>
                  {text}
                </option>
              ))}
            </select>
          </div>
        </div>

        {closure.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {closure.error}
          </p>
        ) : (
          <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
            {[
              ["Completed quarters counted", String(closure.completedQuarters)],
              [
                "Rate applied",
                `${NUM.format(closure.appliedRate)}%${
                  closure.rateReduction > 0
                    ? ` (${NUM.format(closure.rateReduction)} points below the scheme rate)`
                    : " (full scheme rate)"
                }`,
              ],
              ["Amount paid on closure", money2(closure.payout)],
              ["Interest earned", money2(closure.interestEarned)],
              ["Interest lost to the rate cut", money2(closure.interestGivenUp)],
              ["Maturity value if held the full term", money2(closure.maturityIfHeld)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax or investment advice. A second MSSC account can be opened only{" "}
        {MSSC_GAP_BETWEEN_ACCOUNTS_MONTHS} months after the first, and the {money(MSSC_MAX_DEPOSIT)}{" "}
        ceiling applies across all accounts held by one woman or girl. Confirm the balance and any
        closure terms with the post office or bank holding the certificate.
      </p>
    </main>
  );
}
