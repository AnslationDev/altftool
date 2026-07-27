"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Mailbox, RotateCcw } from "lucide-react";

import {
  BASE_TERM_MONTHS,
  EXTENDED_TERM_MONTHS,
  MAX_DEFAULTS,
  MIN_MONTHLY_DEPOSIT,
  NOTIFIED_RATE,
  POSB_RATE,
  PREMATURE_MIN_MONTHS,
  computePostOfficeRd,
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

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  monthlyDeposit: "1000",
  rate: String(NOTIFIED_RATE),
  term: String(BASE_TERM_MONTHS),
  defaults: "0",
  advance: "0",
  closeAfter: "0",
};

const toNumber = (raw) => {
  const text = String(raw ?? "").replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [fields, setFields] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setFields((current) => ({ ...current, [key]: value }));

  const result = useMemo(
    () =>
      computePostOfficeRd({
        monthlyDeposit: toNumber(fields.monthlyDeposit),
        annualRate: toNumber(fields.rate),
        termMonths: toNumber(fields.term),
        defaultedMonths: toNumber(fields.defaults) || 0,
        advanceMonths: toNumber(fields.advance) || 0,
        closeAfterMonths: toNumber(fields.closeAfter) || 0,
      }),
    [fields],
  );

  const hasError = Boolean(result.error);
  const show = (value, formatter = money) => (hasError ? DASH : formatter(value));

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Post Office Recurring Deposit Calculator",
      `${money(result.monthlyDeposit)} a month for ${result.termMonths} months at ${pct(result.annualRate)}`,
      `Total deposited: ${money(result.totalDeposited)}`,
      `Maturity value: ${money(result.maturityValue)}`,
      `Interest earned: ${money(result.totalInterest)}`,
    ];
    if (result.defaultFee > 0) lines.push(`Default fee payable: ${money(result.defaultFee)}`);
    if (result.advanceRebate > 0) lines.push(`Advance deposit rebate: ${money(result.advanceRebate)}`);
    if (result.premature?.allowed) {
      lines.push(
        `Closed after ${result.premature.monthsHeld} months: ${money(result.premature.payout)} at the ${POSB_RATE}% savings rate`,
      );
    }
    return lines.join("\n");
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
    setFields(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Mailbox className="h-4 w-4" aria-hidden="true" />
          Small savings
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Post Office Recurring Deposit Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The National Savings Recurring Deposit runs for five years with interest compounded
          quarterly at the notified small savings rate. This works out the maturity value, the
          default fee on missed instalments, the advance deposit rebate and what premature closure
          would pay.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="po-deposit">
              Monthly deposit (INR)
            </label>
            <input
              id="po-deposit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={MIN_MONTHLY_DEPOSIT}
              step="10"
              value={fields.monthlyDeposit}
              onChange={(event) => setField("monthlyDeposit", event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Minimum {money(MIN_MONTHLY_DEPOSIT)} a month, in multiples of ₹10.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="po-rate">
              Notified rate (% per year)
            </label>
            <input
              id="po-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="15"
              step="0.05"
              value={fields.rate}
              onChange={(event) => setField("rate", event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Revised every quarter by the Ministry of Finance.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="po-term">
              Account term
            </label>
            <select
              id="po-term"
              className={`mt-2 ${INPUT_CLASS}`}
              value={fields.term}
              onChange={(event) => setField("term", event.target.value)}
            >
              <option value={String(BASE_TERM_MONTHS)}>Five years (60 instalments)</option>
              <option value={String(EXTENDED_TERM_MONTHS)}>
                Ten years — extended once (120 instalments)
              </option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="po-defaults">
              Instalments missed and paid late
            </label>
            <input
              id="po-defaults"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={fields.defaults}
              onChange={(event) => setField("defaults", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="po-advance">
              Instalments paid in advance
            </label>
            <select
              id="po-advance"
              className={`mt-2 ${INPUT_CLASS}`}
              value={fields.advance}
              onChange={(event) => setField("advance", event.target.value)}
            >
              <option value="0">None</option>
              <option value="6">Six months in advance</option>
              <option value="12">Twelve months in advance</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="po-close">
              Close the account after (months, 0 = hold to maturity)
            </label>
            <input
              id="po-close"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={fields.closeAfter}
              onChange={(event) => setField("closeAfter", event.target.value)}
            />
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
              Maturity value
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {show(result.maturityValue)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see your figures."
                : `${money(result.totalDeposited)} paid in over ${result.termMonths} months`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy post office recurring deposit result"
              className={`${GHOST_BTN} disabled:opacity-40`}
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
            ["Interest earned", show(result.totalInterest)],
            ["Interest as a share of what you paid in", show(result.interestOnDeposits, pct)],
            ["Effective annual yield (quarterly compounding)", show(result.effectiveYield, pct)],
            ["Default fee on missed instalments", show(result.defaultFee)],
            ["Advance deposit rebate", show(result.advanceRebate)],
            ["Maturity value after default fee", show(result.netMaturity)],
            ["Net cash you actually put in", show(result.netOutlay)],
            [
              `Loan available after ${result.loanEligibleAfter ?? 12} instalments`,
              show(result.loanAvailableAtYearOne),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.discontinued && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-xs leading-5 text-[var(--danger)]">
            More than {MAX_DEFAULTS} defaults means the account is treated as discontinued. It can
            be revived within {result.revivalWindowMonths} months of the month of the fourth
            default; after that no further deposits are accepted.
          </p>
        )}
        {!hasError && result.offMultiple && (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            Deposits must be in multiples of ₹10, so the post office will not accept{" "}
            {money(result.monthlyDeposit)} as a monthly denomination.
          </p>
        )}
      </section>

      {!hasError && result.premature && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">If you close the account early</h2>
          {result.premature.allowed ? (
            <>
              <p className="mt-1 text-3xl font-semibold text-[var(--primary)]">
                {money(result.premature.payout)}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {result.premature.reason}
              </p>
              <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
                {[
                  ["Deposited by then", money(result.premature.paidIn)],
                  ["Interest paid at the savings rate", money(result.premature.interest)],
                  ["Interest given up by closing early", money(result.premature.interestLost)],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                    <dt className="text-[var(--muted-foreground)]">{label}</dt>
                    <dd className="text-right font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </>
          ) : (
            <p
              role="alert"
              className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              {result.premature.reason}
            </p>
          )}
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Balance year by year</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    End of year
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Paid in
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Interest so far
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
                    <td className="py-2 pr-3 text-right">{money(row.paidIn)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {money(row.interest)}
                    </td>
                    <td className="py-2 text-right font-semibold">{money(row.closing)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            Premature closure is barred for the first {PREMATURE_MIN_MONTHS} months, except on the
            death of the depositor.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. Small savings rates are notified each quarter and the post office
        rounds figures to the rupee, so your passbook may differ slightly. Interest on this account
        is taxable and does not qualify for a section 80C deduction. Check the current rules at your
        post office before opening an account.
      </p>
    </main>
  );
}
