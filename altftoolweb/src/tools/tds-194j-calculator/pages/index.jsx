"use client";

import { useMemo, useState } from "react";
import { Briefcase, Check, Copy, RotateCcw } from "lucide-react";
import {
  NO_PAN_RATE,
  PAYMENT_NATURES,
  computeTds194J,
  getNature,
  thresholdForFy,
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

const FY_OPTIONS = [
  { value: 2025, label: "FY 2025-26 onwards (threshold Rs 50,000)" },
  { value: 2024, label: "FY 2024-25 or earlier (threshold Rs 30,000)" },
];

const DEFAULTS = {
  payment: "150000",
  prior: "0",
  natureId: "professional",
  fyStartYear: 2025,
  panFurnished: true,
  payerCovered: true,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 items-center gap-3 text-sm font-medium text-[var(--foreground)]";
const CHECKBOX =
  "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [payment, setPayment] = useState(DEFAULTS.payment);
  const [prior, setPrior] = useState(DEFAULTS.prior);
  const [natureId, setNatureId] = useState(DEFAULTS.natureId);
  const [fyStartYear, setFyStartYear] = useState(DEFAULTS.fyStartYear);
  const [panFurnished, setPanFurnished] = useState(DEFAULTS.panFurnished);
  const [payerCovered, setPayerCovered] = useState(DEFAULTS.payerCovered);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeTds194J({
        paymentAmount: toNumber(payment),
        priorPaymentsThisFy: toNumber(prior),
        natureId,
        fyStartYear,
        panFurnished,
        payerCovered,
      }),
    [payment, prior, natureId, fyStartYear, panFurnished, payerCovered],
  );

  const nature = getNature(natureId);
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Section 194J TDS",
      `Nature of payment: ${result.natureLabel}`,
      `This payment: ${money(result.paymentAmount)}`,
      `Already paid this year: ${money(result.priorPayments)}`,
      `Yearly aggregate: ${money(result.aggregate)}`,
      `Threshold: ${money0(result.threshold)}`,
      `Rate applied: ${result.appliedRate}%`,
      `TDS on this payment: ${money(result.tdsOnThisPayment)}`,
      `Net amount to pay: ${money(result.netPayable)}`,
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
    setNatureId(DEFAULTS.natureId);
    setFyStartYear(DEFAULTS.fyStartYear);
    setPanFurnished(DEFAULTS.panFurnished);
    setPayerCovered(DEFAULTS.payerCovered);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Briefcase className="h-4 w-4" aria-hidden="true" />
          Section 194J
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          TDS on Professional Fees (Section 194J)
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Deduct the right tax on professional fees, technical fees, royalty, non-compete payments
          and director&rsquo;s remuneration — with the yearly aggregate threshold and the section
          206AA no-PAN rate handled for you.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="j-nature">
              Nature of payment
            </label>
            <select
              id="j-nature"
              className={`mt-2 ${INPUT_CLASS}`}
              value={natureId}
              onChange={(event) => setNatureId(event.target.value)}
            >
              {PAYMENT_NATURES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} &mdash; {item.rate}%
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>{nature.note}</p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="j-payment">
              Amount being paid or credited now (INR)
            </label>
            <input
              id="j-payment"
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
            <label className={LABEL_CLASS} htmlFor="j-prior">
              Already paid to this payee this year (INR)
            </label>
            <input
              id="j-prior"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={prior}
              onChange={(event) => setPrior(event.target.value)}
            />
            <p className={HINT_CLASS}>Same category of payment only.</p>
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="j-fy">
              Financial year
            </label>
            <select
              id="j-fy"
              className={`mt-2 ${INPUT_CLASS}`}
              value={fyStartYear}
              onChange={(event) => setFyStartYear(Number(event.target.value))}
            >
              {FY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={CHECK_ROW} htmlFor="j-pan">
              <input
                id="j-pan"
                type="checkbox"
                className={CHECKBOX}
                checked={panFurnished}
                onChange={(event) => setPanFurnished(event.target.checked)}
              />
              Payee has furnished a valid PAN
            </label>
            <p className={HINT_CLASS}>Without PAN, section 206AA forces {NO_PAN_RATE}%.</p>
          </div>

          <div>
            <label className={CHECK_ROW} htmlFor="j-covered">
              <input
                id="j-covered"
                type="checkbox"
                className={CHECKBOX}
                checked={payerCovered}
                onChange={(event) => setPayerCovered(event.target.checked)}
              />
              Payer must deduct under 194J
            </label>
            <p className={HINT_CLASS}>
              Untick for an individual or HUF not covered by tax audit under section 44AB.
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
              aria-label="Copy section 194J TDS result"
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
            ["Statutory rate for this category", hasError ? DASH : `${result.statutoryRate}%`],
            [
              "Annual exemption limit",
              hasError ? DASH : result.threshold > 0 ? money0(result.threshold) : "No threshold",
            ],
            ["Payments to this payee so far", hasError ? DASH : money(result.priorPayments)],
            ["This payment", hasError ? DASH : money(result.paymentAmount)],
            ["Yearly aggregate", hasError ? DASH : money(result.aggregate)],
            ["TDS already deducted earlier", hasError ? DASH : money(result.tdsAlreadyDeducted)],
            ["Total TDS for the year so far", hasError ? DASH : money(result.cumulativeTds)],
            ["Net amount payable to the payee", hasError ? DASH : money(result.netPayable)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && !result.thresholdCrossed && result.headroom > 0 ? (
          <p className="mt-4 rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm text-[var(--success)]">
            You can pay {money(result.headroom)} more this year before the threshold bites.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Section 194J rate card</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Payment
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Rate
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Threshold ({fyStartYear >= 2025 ? "FY 2025-26" : "FY 2024-25"})
                </th>
              </tr>
            </thead>
            <tbody>
              {PAYMENT_NATURES.map((item) => (
                <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{item.label}</td>
                  <td className="py-2 pr-3 text-right font-semibold">{item.rate}%</td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">
                    {item.hasThreshold ? money0(thresholdForFy(fyStartYear)) : "Nil"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. TDS on payments to residents carries no surcharge or
        cess; deposit it by the 7th of the following month (30 April for a March deduction). Confirm
        the correct section and rate with your tax adviser before deducting.
      </p>
    </main>
  );
}
