"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Printer, Receipt, RotateCcw } from "lucide-react";

import {
  FORM_26QC_DAYS,
  LANDLORD_PAN_RENT_LIMIT,
  MAX_MONTHS,
  REVENUE_STAMP_CASH_LIMIT,
  REVENUE_STAMP_DUTY,
  TDS_194IB_MONTHLY_LIMIT,
  generateRentReceipts,
  receiptsToText,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");

const DEFAULTS = {
  monthlyRent: "15000",
  startMonth: "2026-04",
  months: "12",
  paymentMode: "cash",
  landlordName: "Suresh Iyer",
  landlordPan: "",
  landlordAddress: "12 MG Road, Bengaluru 560001",
  tenantName: "Ananya Rao",
  propertyAddress: "Flat 4B, Lake View Apartments, Bengaluru 560001",
  receiptPrefix: "RR",
  tenantIsIndividual: true,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [monthlyRent, setMonthlyRent] = useState(DEFAULTS.monthlyRent);
  const [startMonth, setStartMonth] = useState(DEFAULTS.startMonth);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [paymentMode, setPaymentMode] = useState(DEFAULTS.paymentMode);
  const [landlordName, setLandlordName] = useState(DEFAULTS.landlordName);
  const [landlordPan, setLandlordPan] = useState(DEFAULTS.landlordPan);
  const [landlordAddress, setLandlordAddress] = useState(DEFAULTS.landlordAddress);
  const [tenantName, setTenantName] = useState(DEFAULTS.tenantName);
  const [propertyAddress, setPropertyAddress] = useState(DEFAULTS.propertyAddress);
  const [receiptPrefix, setReceiptPrefix] = useState(DEFAULTS.receiptPrefix);
  const [tenantIsIndividual, setTenantIsIndividual] = useState(DEFAULTS.tenantIsIndividual);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const rent = toNumber(monthlyRent);
    const count = toNumber(months);
    if (Number.isNaN(rent) || Number.isNaN(count)) {
      return { error: "Enter the monthly rent and how many receipts you need." };
    }
    return generateRentReceipts({
      monthlyRent: rent,
      startMonth,
      months: Math.round(count),
      paymentMode,
      landlordName: landlordName.trim(),
      landlordPan: landlordPan.trim().toUpperCase(),
      landlordAddress: landlordAddress.trim(),
      tenantName: tenantName.trim(),
      propertyAddress: propertyAddress.trim(),
      receiptPrefix: receiptPrefix.trim() || "RR",
      tenantIsIndividual,
    });
  }, [
    monthlyRent,
    startMonth,
    months,
    paymentMode,
    landlordName,
    landlordPan,
    landlordAddress,
    tenantName,
    propertyAddress,
    receiptPrefix,
    tenantIsIndividual,
  ]);

  const hasError = Boolean(result.error);
  const text = useMemo(() => (hasError ? "" : receiptsToText(result)), [hasError, result]);

  const copyResult = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const printReceipts = () => {
    if (typeof window !== "undefined") window.print();
  };

  const reset = () => {
    setMonthlyRent(DEFAULTS.monthlyRent);
    setStartMonth(DEFAULTS.startMonth);
    setMonths(DEFAULTS.months);
    setPaymentMode(DEFAULTS.paymentMode);
    setLandlordName(DEFAULTS.landlordName);
    setLandlordPan(DEFAULTS.landlordPan);
    setLandlordAddress(DEFAULTS.landlordAddress);
    setTenantName(DEFAULTS.tenantName);
    setPropertyAddress(DEFAULTS.propertyAddress);
    setReceiptPrefix(DEFAULTS.receiptPrefix);
    setTenantIsIndividual(DEFAULTS.tenantIsIndividual);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6 print:hidden">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Receipt className="h-4 w-4" aria-hidden="true" />
          HRA proof
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Rent Receipt Generator with Revenue Stamp Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Produces a month-by-month set of receipts with the amount written out in words, and tells
          you when the landlord&apos;s PAN, a revenue stamp or section 194-IB TDS comes into play.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 print:hidden">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-rent">
              Monthly rent (INR)
            </label>
            <input
              id="rr-rent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="500"
              value={monthlyRent}
              onChange={(event) => setMonthlyRent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-start">
              First month of rent
            </label>
            <input
              id="rr-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="month"
              value={startMonth}
              onChange={(event) => setStartMonth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-months">
              Number of receipts
            </label>
            <input
              id="rr-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_MONTHS}
              step="1"
              value={months}
              onChange={(event) => setMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-mode">
              How the rent was paid
            </label>
            <select
              id="rr-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={paymentMode}
              onChange={(event) => setPaymentMode(event.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank transfer, UPI or cheque</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-tenant">
              Tenant name
            </label>
            <input
              id="rr-tenant"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={tenantName}
              onChange={(event) => setTenantName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-landlord">
              Landlord name
            </label>
            <input
              id="rr-landlord"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={landlordName}
              onChange={(event) => setLandlordName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-pan">
              Landlord PAN
            </label>
            <input
              id="rr-pan"
              className={`mt-2 font-mono uppercase ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck={false}
              maxLength={10}
              placeholder="Needed once yearly rent crosses 1 lakh"
              value={landlordPan}
              onChange={(event) => setLandlordPan(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-prefix">
              Receipt number prefix
            </label>
            <input
              id="rr-prefix"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={10}
              value={receiptPrefix}
              onChange={(event) => setReceiptPrefix(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rr-property">
              Property address
            </label>
            <input
              id="rr-property"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={propertyAddress}
              onChange={(event) => setPropertyAddress(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rr-landlord-address">
              Landlord address
            </label>
            <input
              id="rr-landlord-address"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={landlordAddress}
              onChange={(event) => setLandlordAddress(event.target.value)}
            />
          </div>
        </div>

        <label className="mt-4 flex min-h-11 items-start gap-3 text-sm font-medium" htmlFor="rr-individual">
          <input
            id="rr-individual"
            type="checkbox"
            className="mt-0.5 h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={tenantIsIndividual}
            onChange={(event) => setTenantIsIndividual(event.target.checked)}
          />
          I am an individual or HUF not subject to a tax audit — apply section 194-IB rather than
          section 194-I
        </label>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)] print:hidden"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 print:hidden">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total rent covered
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                hasError ? "text-[var(--muted-foreground)]" : "text-[var(--primary)]"
              }`}
            >
              {hasError ? "—" : money(result.totalRent)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the inputs to build the receipts" : result.totalRentWords}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy all rent receipts as text"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={printReceipts}
              aria-label="Print the rent receipts"
              className={GHOST_BTN}
              disabled={hasError}
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              Print
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Receipts generated", hasError ? "—" : String(result.months)],
            ["Monthly rent", hasError ? "—" : money(result.monthlyRent)],
            [
              "Landlord PAN needed",
              hasError ? "—" : result.panRequired ? `Yes — rent is above ${money(LANDLORD_PAN_RENT_LIMIT)}` : "No",
            ],
            [
              "Revenue stamp on each receipt",
              hasError
                ? "—"
                : result.stampRequired
                  ? `Yes — ${money(result.stampDuty)} stamp, cash above ${money(REVENUE_STAMP_CASH_LIMIT)}`
                  : "No",
            ],
            [
              "Section 194-IB TDS",
              hasError
                ? "—"
                : result.tds194IBApplies
                  ? `${money(result.tdsAmount)} at ${result.tdsRatePercent}%`
                  : `Not applicable below ${money(TDS_194IB_MONTHLY_LIMIT)} a month`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.warnings.length > 0 && (
          <ul className="mt-4 space-y-2">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 space-y-4">
          <h2 className="text-base font-semibold print:hidden">Your receipts</h2>
          {result.receipts.map((receipt) => (
            <article
              key={receipt.number}
              className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 print:break-inside-avoid"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--border)] pb-3">
                <h3 className="text-base font-semibold uppercase tracking-wide">Rent receipt</h3>
                <span className="font-mono text-sm text-[var(--muted-foreground)]">{receipt.number}</span>
              </div>
              <dl className="mt-3 space-y-2 text-sm">
                {[
                  ["Received from", result.tenantName || "—"],
                  ["Amount", `${money(receipt.amount)} (${receipt.amountWords})`],
                  ["Rent for", receipt.monthLabel],
                  ["Period", `${receipt.periodStart} to ${receipt.periodEnd}`],
                  ["Property", result.propertyAddress || "—"],
                  ["Paid by", result.paymentMode === "cash" ? "Cash" : "Bank transfer, UPI or cheque"],
                  ["Landlord", result.landlordName || "—"],
                  ["Landlord PAN", result.landlordPan || "Not provided"],
                  ["Landlord address", result.landlordAddress || "—"],
                  ["Date", receipt.issueDate],
                ].map(([label, value]) => (
                  <div key={label} className="grid grid-cols-1 gap-0.5 sm:grid-cols-[11rem_1fr] sm:gap-3">
                    <dt className="text-[var(--muted-foreground)]">{label}</dt>
                    <dd className="font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                {receipt.stampRequired ? (
                  <span className="inline-flex h-16 w-24 items-center justify-center rounded-md border border-dashed border-[var(--border)] text-center text-xs text-[var(--muted-foreground)]">
                    Affix Re {REVENUE_STAMP_DUTY} revenue stamp
                  </span>
                ) : (
                  <span aria-hidden="true" />
                )}
                <span className="min-w-[12rem] border-t border-[var(--border)] pt-2 text-xs text-[var(--muted-foreground)]">
                  Landlord signature
                </span>
              </div>
            </article>
          ))}
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 print:hidden">
        <h2 className="text-base font-semibold">When you need a revenue stamp</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
          <li>
            Article 53 of the Indian Stamp Act charges Re {REVENUE_STAMP_DUTY} on a receipt for money
            above {money(REVENUE_STAMP_CASH_LIMIT)}, so any cash rent receipt over that figure should
            carry one.
          </li>
          <li>
            The landlord signs across the stamp, half on the stamp and half on the paper, so the
            stamp cannot be reused.
          </li>
          <li>
            Rent paid by bank transfer, UPI or cheque already has a bank trail, and receipts for it
            are not stamped in practice.
          </li>
          <li>
            Once monthly rent crosses {money(TDS_194IB_MONTHLY_LIMIT)}, deduct section 194-IB TDS in
            the last month and file Form 26QC within {FORM_26QC_DAYS} days of that month ending.
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)] print:hidden">
        Informational only, not tax advice. Receipts must record rent you actually paid — fabricated
        receipts are a false claim and the assessing officer can ask for bank statements, the
        agreement and the landlord&apos;s return. Stamp duty is a state subject, so confirm the local
        position where it matters.
      </p>
    </main>
  );
}
