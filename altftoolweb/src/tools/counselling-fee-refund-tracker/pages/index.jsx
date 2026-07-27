"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ReceiptIndianRupee, RotateCcw } from "lucide-react";

import {
  PROCESSING_FEE_CAP,
  UGC_REFUND_SLABS,
  computeRefund,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  feePaid: "100000",
  securityDeposit: "2000",
  lastAdmissionDate: "2026-08-31",
  withdrawalDate: "2026-08-11",
  processingDays: "15",
};

const DASH = "—";

export default function ToolHome() {
  const [feePaid, setFeePaid] = useState(DEFAULTS.feePaid);
  const [securityDeposit, setSecurityDeposit] = useState(DEFAULTS.securityDeposit);
  const [lastAdmissionDate, setLastAdmissionDate] = useState(DEFAULTS.lastAdmissionDate);
  const [withdrawalDate, setWithdrawalDate] = useState(DEFAULTS.withdrawalDate);
  const [processingDays, setProcessingDays] = useState(DEFAULTS.processingDays);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const toNum = (v) => (String(v).trim() === "" ? Number.NaN : Number(v));
    return computeRefund({
      feePaid: toNum(feePaid),
      securityDeposit: securityDeposit.trim() === "" ? 0 : Number(securityDeposit),
      lastAdmissionDate,
      withdrawalDate,
      processingDays: processingDays.trim() === "" ? 15 : Number(processingDays),
    });
  }, [feePaid, securityDeposit, lastAdmissionDate, withdrawalDate, processingDays]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Counselling fee refund estimate (UGC slabs)",
      `Slab: ${result.slabLabel} — ${result.refundPercent}% refund`,
      `Fees paid refund: ${money(result.netFeeRefund)} (deduction ${money(result.processingDeduction)})`,
      `Security deposit: ${money(result.securityDeposit)}`,
      `Total expected: ${money(result.totalExpected)}`,
      `Amount forfeited: ${money(result.forfeited)}`,
      `Expected refund by: ${result.expectedRefundDate}`,
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
    setFeePaid(DEFAULTS.feePaid);
    setSecurityDeposit(DEFAULTS.securityDeposit);
    setLastAdmissionDate(DEFAULTS.lastAdmissionDate);
    setWithdrawalDate(DEFAULTS.withdrawalDate);
    setProcessingDays(DEFAULTS.processingDays);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Refund slab", DASH],
        ["Refund percentage", DASH],
        ["Processing deduction", DASH],
        ["Security deposit returned", DASH],
        ["Amount forfeited", DASH],
        ["Expected refund by", DASH],
      ]
    : [
        ["Refund slab", result.slabLabel],
        ["Refund percentage", `${result.refundPercent}%`],
        ["Gross refund of fees", money(result.grossRefund)],
        ["Processing deduction", money(result.processingDeduction)],
        ["Security deposit returned", money(result.securityDeposit)],
        ["Amount forfeited", money(result.forfeited)],
        [
          result.daysAfter > 0
            ? `Withdrawal timing (${NUM.format(result.daysAfter)} days after last date)`
            : `Withdrawal timing (${NUM.format(result.daysBefore)} days before last date)`,
          result.daysAfter > 0 ? "After last date" : "On or before last date",
        ],
        ["Expected refund by", result.expectedRefundDate],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ReceiptIndianRupee className="h-4 w-4" aria-hidden="true" />
          Seat withdrawal
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Counselling Fee Refund Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter what you paid and when you are withdrawing relative to the formally-notified last
          date of admission. The refund follows the UGC slabs: 100 / 90 / 80 / 50 / 0 percent.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ref-fee">
              Aggregate fees paid (INR)
            </label>
            <input
              id="ref-fee"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={feePaid}
              onChange={(event) => setFeePaid(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Tuition and other non-refundable-labelled charges, excluding the caution deposit.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ref-deposit">
              Caution / security deposit (INR)
            </label>
            <input
              id="ref-deposit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={securityDeposit}
              onChange={(event) => setSecurityDeposit(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ref-last">
              Last date of admission (notified)
            </label>
            <input
              id="ref-last"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={lastAdmissionDate}
              onChange={(event) => setLastAdmissionDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ref-withdraw">
              Withdrawal request date
            </label>
            <input
              id="ref-withdraw"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={withdrawalDate}
              onChange={(event) => setWithdrawalDate(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ref-days">
              Expected processing time (days)
            </label>
            <input
              id="ref-days"
              className={`mt-2 ${INPUT_CLASS} sm:max-w-xs`}
              type="number"
              inputMode="numeric"
              min="0"
              max="365"
              value={processingDays}
              onChange={(event) => setProcessingDays(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Your estimate of how long the institute or counselling body takes to pay out — used
              only for the reminder date.
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
              Total expected refund
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.totalExpected)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${result.refundPercent}% of fees plus the security deposit, less any processing deduction.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the refund estimate"
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
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">UGC refund slabs</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[360px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  When you withdraw
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Refund of fees
                </th>
              </tr>
            </thead>
            <tbody>
              {UGC_REFUND_SLABS.map((slab) => (
                <tr key={slab.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{slab.label}</td>
                  <td className="py-2 text-right font-semibold">{slab.percent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          In the 100% slab the institution may deduct a processing charge of up to 5% of the fees,
          capped at {money(PROCESSING_FEE_CAP)}. Centralised counselling bodies (JoSAA, state CETs)
          publish their own seat-acceptance-fee rules in the business rules of each year — check
          them alongside this UGC baseline. Informational estimate, not legal advice.
        </p>
      </section>
    </main>
  );
}
