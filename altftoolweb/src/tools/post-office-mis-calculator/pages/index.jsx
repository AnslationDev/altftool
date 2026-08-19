"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Mailbox, RotateCcw } from "lucide-react";

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

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const money2 = (value) => INR2.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);

/** POMIS deposit ceilings, revised with effect from 1 April 2023. */
const LIMITS = { single: 900000, joint: 1500000 };
const MIN_DEPOSIT = 1000;
/** POMIS always runs for a fixed 5-year term. */
const TERM_YEARS = 5;

const DEFAULTS = {
  deposit: "900000",
  rate: "7.4",
  accountType: "single",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

/**
 * POMIS pays simple interest every month and returns the principal intact
 * after 5 years. Monthly income = deposit x annual rate / 1200.
 */
export function computePomis(deposit, rate, years = TERM_YEARS) {
  const monthly = (deposit * rate) / 1200;
  const months = Math.round(years * 12);
  return {
    monthly,
    quarterly: monthly * 3,
    annual: monthly * 12,
    months,
    totalInterest: monthly * months,
    totalReceived: deposit + monthly * months,
    penalty1to3: deposit * 0.02,
    penalty3to5: deposit * 0.01,
  };
}

export default function ToolHome() {
  const [deposit, setDeposit] = useState(DEFAULTS.deposit);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [accountType, setAccountType] = useState(DEFAULTS.accountType);
  const [copied, setCopied] = useState(false);

  const limit = LIMITS[accountType];

  const calc = useMemo(() => {
    const d = toNumber(deposit);
    const r = toNumber(rate);
    const cap = LIMITS[accountType];

    if ([d, r].some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers for the deposit and interest rate." };
    }
    if (d % 1000 !== 0) {
      return { error: "POMIS deposits must be in multiples of ₹1,000." };
    }
    if (d < MIN_DEPOSIT) {
      return { error: `The minimum POMIS deposit is ${money(MIN_DEPOSIT)}.` };
    }
    if (d > cap) {
      return {
        error: `A ${accountType} POMIS account can hold at most ${money(cap)}. Reduce the deposit or switch account type.`,
      };
    }
    if (r <= 0 || r > 20) {
      return { error: "Enter an interest rate between 0% and 20% per year." };
    }

    return { deposit: d, rate: r, cap, ...computePomis(d, r) };
  }, [deposit, rate, accountType]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Post Office MIS Calculator",
      `Deposit: ${money(calc.deposit)} (${accountType} account)`,
      `Interest rate: ${num(calc.rate)}% per year, paid monthly`,
      `Monthly income: ${money2(calc.monthly)}`,
      `Annual income: ${money2(calc.annual)}`,
      `Total interest over 5 years: ${money2(calc.totalInterest)}`,
      `Principal returned at maturity: ${money(calc.deposit)}`,
      `Total received: ${money2(calc.totalReceived)}`,
    ].join("\n");
  }, [calc, accountType]);

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
    setAccountType(DEFAULTS.accountType);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Mailbox className="h-4 w-4" aria-hidden="true" />
          POMIS
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Post Office MIS Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Find the fixed monthly income a Post Office Monthly Income Scheme deposit will pay for
          five years, with the correct single and joint account ceilings, total interest earned and
          the premature-closure penalties.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mis-deposit">
              Deposit amount (INR)
            </label>
            <input
              id="mis-deposit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={MIN_DEPOSIT}
              max={limit}
              step="1000"
              value={deposit}
              onChange={(event) => setDeposit(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              In multiples of ₹1,000, up to {money(limit)} for this account type.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mis-rate">
              Interest rate (% per year)
            </label>
            <input
              id="mis-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="20"
              step="0.1"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Notified quarterly by the Ministry of Finance.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mis-type">
              Account type
            </label>
            <select
              id="mis-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={accountType}
              onChange={(event) => setAccountType(event.target.value)}
            >
              <option value="single">Single account — max {money(LIMITS.single)}</option>
              <option value="joint">Joint account (up to 3 adults) — max {money(LIMITS.joint)}</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[100000, 500000, 900000, 1500000]
            .filter((value) => value <= limit)
            .map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setDeposit(String(value))}
                className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                {money(value)}
              </button>
            ))}
        </div>
      </section>

      {calc.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {calc.error}
        </p>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <span className="sr-only" role="status" aria-live="polite">
              {!calc.error
                ? `Monthly income: ${money2(calc.monthly)}. Quarterly: ${money2(calc.quarterly)}. Annual: ${money2(calc.annual)}.`
                : ""}
            </span>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Monthly income
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {money2(calc.monthly)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Credited every month for {TERM_YEARS} years on a {money(calc.deposit)} deposit at{" "}
                  {num(calc.rate)}%
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy Post Office MIS result"
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
                ["Deposit", money(calc.deposit)],
                ["Income per quarter", money2(calc.quarterly)],
                ["Income per year", money2(calc.annual)],
                [`Total interest over ${TERM_YEARS} years`, money2(calc.totalInterest)],
                ["Principal returned at maturity", money(calc.deposit)],
                ["Total received (principal + interest)", money2(calc.totalReceived)],
                ["Deposit headroom left", money(Math.max(0, calc.cap - calc.deposit))],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Monthly income at other deposit amounts</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Deposit
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Monthly income
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Interest over 5 years
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[100000, 200000, 500000, 900000, 1500000]
                    .filter((value) => value <= calc.cap)
                    .map((value) => {
                      const row = computePomis(value, calc.rate);
                      return (
                        <tr key={value} className="border-b border-[var(--border)] last:border-0">
                          <td className="py-2 pr-3 font-semibold">{money(value)}</td>
                          <td className="py-2 pr-3 text-right">{money2(row.monthly)}</td>
                          <td className="py-2 text-right text-[var(--muted-foreground)]">
                            {money2(row.totalInterest)}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">If you close the account early</h2>
            <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
              {[
                ["Before 1 year", "Closure not allowed"],
                ["Between 1 and 3 years", `2% of deposit deducted = ${money2(calc.penalty1to3)}`],
                ["Between 3 and 5 years", `1% of deposit deducted = ${money2(calc.penalty3to5)}`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. POMIS interest is fully taxable as income from other sources and gets no
        section 80C deduction, though the post office does not deduct TDS on it. Rates are fixed for
        the whole term at the rate in force when the account is opened — confirm the current rate at
        your post office.
      </p>
    </main>
  );
}
