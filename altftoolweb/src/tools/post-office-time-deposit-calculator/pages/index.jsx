"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw } from "lucide-react";

import {
  POSB_RATE,
  POTD_MIN_DEPOSIT,
  POTD_RATES,
  POTD_TENURES,
  SECTION_80C_LIMIT,
  computePrematureClosure,
  computeTimeDeposit,
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
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const money2 = (value) => INR2.format(Number.isFinite(value) ? value : 0);
const num2 = (value) => NUM2.format(Number.isFinite(value) ? value : 0);

const DASH = "—";

const SLABS = [0, 5, 10, 15, 20, 30];

const DEFAULTS = {
  amount: "200000",
  tenure: 5,
  rate: String(POTD_RATES[5]),
  slab: 30,
  senior: false,
  closeMonths: "30",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const cleaned = String(raw).replace(/,/g, "").trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [tenure, setTenure] = useState(DEFAULTS.tenure);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [slab, setSlab] = useState(DEFAULTS.slab);
  const [senior, setSenior] = useState(DEFAULTS.senior);
  const [closeMonths, setCloseMonths] = useState(DEFAULTS.closeMonths);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeTimeDeposit({
        principal: toNumber(amount),
        tenureYears: tenure,
        annualRate: toNumber(rate),
        taxSlabPercent: slab,
        isSenior: senior,
      }),
    [amount, tenure, rate, slab, senior],
  );

  const premature = useMemo(
    () =>
      computePrematureClosure({
        principal: toNumber(amount),
        monthsHeld: toNumber(closeMonths),
      }),
    [amount, closeMonths],
  );

  const hasError = Boolean(result.error);

  const pickTenure = (years) => {
    setTenure(years);
    setRate(String(POTD_RATES[years]));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Post Office Time Deposit Calculator",
      `Deposit: ${money(result.principal)} for ${result.tenureYears} year(s)`,
      `Rate: ${num2(result.annualRate)}% p.a. compounded quarterly, paid annually`,
      `Interest paid each year: ${money2(result.annualInterest)}`,
      `Total interest over the term: ${money2(result.totalInterest)}`,
      `Amount received at maturity: ${money2(result.maturityValue)}`,
      `Total cash received including all payouts: ${money2(result.totalReceived)}`,
      `Value if every payout is re-deposited: ${money2(result.reinvestedValue)}`,
      result.eligible80C
        ? `Section 80C deduction available: ${money(result.deduction80C)}`
        : "Section 80C deduction: not available on this tenure",
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
    setTenure(DEFAULTS.tenure);
    setRate(DEFAULTS.rate);
    setSlab(DEFAULTS.slab);
    setSenior(DEFAULTS.senior);
    setCloseMonths(DEFAULTS.closeMonths);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          POTD
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Post Office Time Deposit Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A Post Office Time Deposit compounds interest quarterly but pays it out once a year. Pick a
          tenure to see the annual payout, what lands at maturity, and how tax and section 80C treat
          it.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="potd-amount">
              Deposit amount (₹)
            </label>
            <input
              id="potd-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="100"
              step="100"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="potd-rate">
              Interest rate (% p.a.)
            </label>
            <input
              id="potd-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              max="25"
              step="0.1"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className={LABEL_CLASS}>Tenure</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {POTD_TENURES.map((years) => (
              <button
                key={years}
                type="button"
                onClick={() => pickTenure(years)}
                aria-pressed={tenure === years}
                className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  tenure === years
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                }`}
              >
                {years} year{years === 1 ? "" : "s"} · {num2(POTD_RATES[years])}%
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="potd-slab">
              Your income-tax slab rate
            </label>
            <select
              id="potd-slab"
              className={`mt-2 ${INPUT_CLASS}`}
              value={slab}
              onChange={(event) => setSlab(Number(event.target.value))}
            >
              {SLABS.map((value) => (
                <option key={value} value={value}>
                  {value}%
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label
              className="flex min-h-11 w-full items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="potd-senior"
            >
              <input
                id="potd-senior"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={senior}
                onChange={(event) => setSenior(event.target.checked)}
              />
              Senior citizen (higher TDS threshold)
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
              Interest paid each year
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money2(result.annualInterest)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the highlighted input to see the payout."
                : `Effective annual yield ${num2(result.effectiveYield)}% after quarterly compounding`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy Post Office Time Deposit result"
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
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Deposit amount", hasError ? DASH : money(result.principal)],
            [
              "Interest accruing each quarter",
              hasError ? DASH : money2(result.quarterlyAccrual),
            ],
            ["Total interest over the term", hasError ? DASH : money2(result.totalInterest)],
            [
              "Received at maturity (principal + last payout)",
              hasError ? DASH : money2(result.maturityValue),
            ],
            ["Total cash received in all", hasError ? DASH : money2(result.totalReceived)],
            [
              "If every payout is re-deposited",
              hasError ? DASH : money2(result.reinvestedValue),
            ],
            [
              `Tax at ${num2(slab)}% slab, per year`,
              hasError ? DASH : money2(result.taxPerYear),
            ],
            [
              "Interest kept after tax, per year",
              hasError ? DASH : money2(result.postTaxAnnualInterest),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Tax notes for this deposit</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
            <li>
              {result.eligible80C ? (
                <>
                  The 5-year account qualifies for a section 80C deduction, so{" "}
                  <strong className="text-[var(--foreground)]">
                    {money(result.deduction80C)}
                  </strong>{" "}
                  of this deposit can be claimed, within the overall{" "}
                  {money(SECTION_80C_LIMIT)} ceiling shared with your other 80C items.
                </>
              ) : (
                <>
                  Only the 5-year Time Deposit qualifies for section 80C. A {result.tenureYears}
                  -year account gives you no deduction on the amount deposited.
                </>
              )}
            </li>
            <li>
              Interest is taxable in full as income from other sources every year it is credited,
              whether or not you spend it.
            </li>
            <li>
              {result.tdsApplies ? (
                <>
                  Yearly interest of {money2(result.annualInterest)} is above the{" "}
                  {money(result.tdsThreshold)} section 194A threshold, so around{" "}
                  <strong className="text-[var(--foreground)]">{money2(result.tdsPerYear)}</strong>{" "}
                  may be deducted as 10% TDS. Claim it back against your total tax in the return.
                </>
              ) : (
                <>
                  Yearly interest of {money2(result.annualInterest)} is within the{" "}
                  {money(result.tdsThreshold)} section 194A threshold, so no TDS is expected — the
                  interest still has to be declared in your return.
                </>
              )}
            </li>
            <li>
              Closing a 5-year account before five years also reverses any section 80C deduction
              already claimed on it, which is added back to your income for that year.
            </li>
          </ul>
        </section>
      )}

      {!hasError && result.schedule.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Year-by-year payouts</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Year
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Interest
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    After tax
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Cumulative interest
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.map((row) => (
                  <tr key={row.year} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      {row.year}
                      {row.principalReturned > 0 ? " (principal returned)" : ""}
                    </td>
                    <td className="py-2 pr-3 text-right">{money2(row.interest)}</td>
                    <td className="py-2 pr-3 text-right">{money2(row.postTax)}</td>
                    <td className="py-2 text-right font-semibold">{money2(row.cumulative)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">If you close it early</h2>
          <div className="mt-3 max-w-xs">
            <label className={LABEL_CLASS} htmlFor="potd-close">
              Months the deposit will have run
            </label>
            <input
              id="potd-close"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="60"
              step="1"
              value={closeMonths}
              onChange={(event) => setCloseMonths(event.target.value)}
            />
          </div>
          {premature.error ? (
            <p
              role="alert"
              className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              {premature.error}
            </p>
          ) : (
            <>
              <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
                {[
                  [
                    "Rate applied on closure",
                    premature.allowed ? `${num2(premature.appliedRate)}%` : DASH,
                  ],
                  ["Interest paid", premature.allowed ? money2(premature.interest) : DASH],
                  ["Amount you get back", premature.allowed ? money2(premature.payout) : DASH],
                  [
                    "Interest given up versus holding on",
                    premature.allowed
                      ? money2(Math.max(result.totalInterest - premature.interest, 0))
                      : DASH,
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                    <dt className="text-[var(--muted-foreground)]">{label}</dt>
                    <dd className="text-right font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                {premature.reason} The savings account rate used for part periods is {POSB_RATE}%.
                This is an estimate; the post office computes the final figure on its own ledger.
              </p>
            </>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. The minimum deposit is {money(POTD_MIN_DEPOSIT)} and
        rates are reset every quarter by the Ministry of Finance for new accounts, while an existing
        account keeps the rate it was opened at for its whole tenure. Confirm current rates and your
        own tax position with the post office or a qualified professional.
      </p>
    </main>
  );
}
