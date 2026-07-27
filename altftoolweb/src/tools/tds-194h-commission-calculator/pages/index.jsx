"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Handshake, RotateCcw } from "lucide-react";
import {
  NO_PAN_RATE,
  OUT_OF_SCOPE,
  RATE_CHANGE_DATE,
  commissionFromSale,
  computeTds194H,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const INR0 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const money0 = (value) => (Number.isFinite(value) ? INR0.format(value) : DASH);

const DEFAULTS = {
  payment: "50000",
  prior: "0",
  paymentDate: "2026-01-15",
  panFurnished: true,
  payerCovered: true,
  saleValue: "2500000",
  commissionPercent: "2",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW = "flex min-h-11 items-center gap-3 text-sm font-medium text-[var(--foreground)]";
const CHECKBOX = "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [payment, setPayment] = useState(DEFAULTS.payment);
  const [prior, setPrior] = useState(DEFAULTS.prior);
  const [paymentDate, setPaymentDate] = useState(DEFAULTS.paymentDate);
  const [panFurnished, setPanFurnished] = useState(DEFAULTS.panFurnished);
  const [payerCovered, setPayerCovered] = useState(DEFAULTS.payerCovered);
  const [saleValue, setSaleValue] = useState(DEFAULTS.saleValue);
  const [commissionPercent, setCommissionPercent] = useState(DEFAULTS.commissionPercent);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeTds194H({
        paymentAmount: toNumber(payment),
        priorPaymentsThisFy: toNumber(prior),
        paymentDate,
        panFurnished,
        payerCovered,
      }),
    [payment, prior, paymentDate, panFurnished, payerCovered],
  );

  const derived = useMemo(
    () => commissionFromSale(toNumber(saleValue), toNumber(commissionPercent)),
    [saleValue, commissionPercent],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Section 194H TDS on commission or brokerage",
      `Payment date: ${result.paymentDate} (${result.financialYearLabel})`,
      `Commission now: ${money(result.paymentAmount)}`,
      `Commission earlier this year: ${money(result.priorPayments)}`,
      `Yearly aggregate: ${money(result.aggregate)}`,
      `Threshold: ${money0(result.threshold)}`,
      `Rate applied: ${result.appliedRate}%`,
      `TDS on this payment: ${money(result.tdsOnThisPayment)}`,
      `Net payable: ${money(result.netPayable)}`,
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
    setPayment(DEFAULTS.payment);
    setPrior(DEFAULTS.prior);
    setPaymentDate(DEFAULTS.paymentDate);
    setPanFurnished(DEFAULTS.panFurnished);
    setPayerCovered(DEFAULTS.payerCovered);
    setSaleValue(DEFAULTS.saleValue);
    setCommissionPercent(DEFAULTS.commissionPercent);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Handshake className="h-4 w-4" aria-hidden="true" />
          Section 194H
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          TDS on Commission and Brokerage (Section 194H)
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The rate fell from 5% to 2% for payments made on or after {RATE_CHANGE_DATE}, and the
          annual exemption limit rose from Rs 15,000 to Rs 20,000 on 1 April 2025. This picks the
          right pair from your payment date and applies the aggregate test.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="h-payment">
              Commission or brokerage being paid (INR)
            </label>
            <input
              id="h-payment"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={payment}
              onChange={(event) => setPayment(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="h-prior">
              Commission already paid to this payee this year (INR)
            </label>
            <input
              id="h-prior"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={prior}
              onChange={(event) => setPrior(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="h-date">
              Date of payment or credit
            </label>
            <input
              id="h-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={paymentDate}
              onChange={(event) => setPaymentDate(event.target.value)}
            />
            <p className={HINT_CLASS}>Sets both the rate and the financial year threshold.</p>
          </div>

          <div>
            <label className={CHECK_ROW} htmlFor="h-pan">
              <input
                id="h-pan"
                type="checkbox"
                className={CHECKBOX}
                checked={panFurnished}
                onChange={(event) => setPanFurnished(event.target.checked)}
              />
              Agent has furnished a valid PAN
            </label>
            <p className={HINT_CLASS}>Without PAN, section 206AA forces {NO_PAN_RATE}%.</p>
          </div>

          <div className="sm:col-span-2">
            <label className={CHECK_ROW} htmlFor="h-covered">
              <input
                id="h-covered"
                type="checkbox"
                className={CHECKBOX}
                checked={payerCovered}
                onChange={(event) => setPayerCovered(event.target.checked)}
              />
              Payer is required to deduct under 194H
            </label>
            <p className={HINT_CLASS}>
              Untick for an individual or HUF not audited under section 44AB in the preceding year.
            </p>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              TDS to deduct now
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.tdsOnThisPayment)}
            </p>
            <p className="mt-1 max-w-prose text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see the deduction." : result.reason}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy section 194H TDS result"
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
            ["Rate applied", hasError ? DASH : `${result.appliedRate}%`],
            ["Statutory rate on this date", hasError ? DASH : `${result.statutoryRate}%`],
            ["Financial year", hasError ? DASH : result.financialYearLabel],
            ["Annual exemption limit", hasError ? DASH : money0(result.threshold)],
            ["Commission earlier this year", hasError ? DASH : money(result.priorPayments)],
            ["This payment", hasError ? DASH : money(result.paymentAmount)],
            ["Yearly aggregate", hasError ? DASH : money(result.aggregate)],
            ["TDS already deducted earlier", hasError ? DASH : money(result.tdsAlreadyDeducted)],
            ["Total TDS for the year so far", hasError ? DASH : money(result.cumulativeTds)],
            ["Net amount payable to the agent", hasError ? DASH : money(result.netPayable)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && !result.thresholdCrossed && result.headroom > 0 ? (
          <p className="mt-4 rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm text-[var(--success)]">
            Another {money(result.headroom)} of commission this year stays below the limit.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Work the commission out from a sale</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="h-sale">
              Transaction value (INR)
            </label>
            <input
              id="h-sale"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={saleValue}
              onChange={(event) => setSaleValue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="h-pct">
              Agreed commission (%)
            </label>
            <input
              id="h-pct"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.25"
              value={commissionPercent}
              onChange={(event) => setCommissionPercent(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[var(--muted-foreground)]">
            Commission works out to{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {derived.error ? DASH : money(derived.commission)}
            </span>
          </p>
          <button
            type="button"
            className={GHOST_BTN}
            disabled={Boolean(derived.error)}
            onClick={() => {
              if (derived.error) return;
              setPayment(String(derived.commission));
            }}
          >
            Use this amount above
          </button>
        </div>
        {derived.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {derived.error}
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Not covered by 194H</h2>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {OUT_OF_SCOPE.map(([title, note]) => (
            <div key={title} className="py-2.5">
              <dt className="font-semibold">{title}</dt>
              <dd className="text-[var(--muted-foreground)]">{note}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. TDS on commission to a resident carries no surcharge or
        cess; deposit it by the 7th of the following month (30 April for a March deduction). Whether
        a payment is commission or a trade discount depends on the contract — check with your tax
        adviser.
      </p>
    </main>
  );
}
