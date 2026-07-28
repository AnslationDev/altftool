"use client";

import { useMemo, useState } from "react";
import { Ban, Check, Copy, RotateCcw } from "lucide-react";

import {
  ACCOUNT_TYPES,
  CHARGE_MODES,
  CHEQUE_VALIDITY_MONTHS,
  STOP_REASONS,
  buildStopPaymentRequest,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] transition hover:border-[var(--primary)]";
const CHECKBOX =
  "mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  accountHolderName: "Sneha Deshpande",
  accountNumber: "50100234789012",
  bankName: "HDFC Bank",
  branchName: "Aundh Branch, Pune 411007",
  ifsc: "HDFC0001234",
  micr: "411240012",
  payeeName: "Sunrise Interiors",
  contactPhone: "+91 98220 44113",
  contactEmail: "sneha.d@example.com",
  address: "Flat 7, Sahyadri Apartments, Aundh, Pune 411007",
  fromChequeNumber: "000101",
  toChequeNumber: "000105",
  chequeDate: "2026-06-15",
  requestDate: "2026-07-28",
  policeReference: "",
  extraNotes: "",
  accountTypeId: "savings",
  reasonId: "lost",
  chargeModeId: "perCheque",
  isRange: false,
  requestNewChequebook: false,
  amount: "85000",
  feePerUnit: "100",
  taxPercent: "18",
};

const NUMERIC_FIELDS = ["amount", "feePerUnit", "taxPercent"];

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const result = useMemo(() => {
    const numbers = {};
    for (const key of NUMERIC_FIELDS) {
      numbers[key] = form[key] === "" ? NaN : Number(form[key]);
    }
    return buildStopPaymentRequest({ ...form, ...numbers });
  }, [form]);

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.letterText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Cheques covered", DASH],
        ["Valid for presentation until", DASH],
        ["Days of validity left", DASH],
        ["Days since the cheque date", DASH],
        ["Cheque amount at risk", DASH],
        ["Charge before tax", DASH],
        ["Tax on the charge", DASH],
        ["Total charge", DASH],
      ]
    : [
        [
          "Cheques covered",
          result.chequeCount === 1
            ? `1 (no. ${result.firstCheque})`
            : `${result.chequeCount} (${result.firstCheque} to ${result.lastCheque})`,
        ],
        ["Valid for presentation until", result.validity.validUntil],
        [
          "Days of validity left",
          result.validity.stale
            ? `Expired ${NUM.format(Math.abs(result.validity.daysRemaining))} days ago`
            : NUM.format(result.validity.daysRemaining),
        ],
        [
          "Days since the cheque date",
          result.validity.postDated
            ? `Post-dated by ${NUM.format(Math.abs(result.validity.daysSinceIssue))} days`
            : NUM.format(result.validity.daysSinceIssue),
        ],
        ["Cheque amount at risk", result.amount > 0 ? INR.format(result.amount) : "Blank cheque"],
        [
          "Charge before tax",
          `${INR.format(result.feeBeforeTax)} (${result.chargeableUnits} x ${INR.format(result.feePerUnit)})`,
        ],
        ["Tax on the charge", `${INR.format(result.feeTax)} at ${result.taxPercent}%`],
        ["Total charge", INR.format(result.feeTotal)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Ban className="h-4 w-4" aria-hidden="true" />
          Banking letters
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Cheque Stop Payment Request Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Write the instruction your branch needs, with the cheque number and IFSC checked for
          format, the {CHEQUE_VALIDITY_MONTHS}-month presentation clock worked out, and the stop
          payment charge totalled including tax.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Account</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="csp-holder">
              Account holder name
            </label>
            <input
              id="csp-holder"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.accountHolderName}
              onChange={(event) => set("accountHolderName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="csp-account">
              Account number
            </label>
            <input
              id="csp-account"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="numeric"
              value={form.accountNumber}
              onChange={(event) => set("accountNumber", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="csp-type">
              Account type
            </label>
            <select
              id="csp-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.accountTypeId}
              onChange={(event) => set("accountTypeId", event.target.value)}
            >
              {ACCOUNT_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="csp-bank">
              Bank
            </label>
            <input
              id="csp-bank"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.bankName}
              onChange={(event) => set("bankName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="csp-branch">
              Branch
            </label>
            <input
              id="csp-branch"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.branchName}
              onChange={(event) => set("branchName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="csp-ifsc">
              Branch IFSC
            </label>
            <input
              id="csp-ifsc"
              className={`mt-2 ${INPUT_CLASS} uppercase`}
              type="text"
              maxLength={11}
              placeholder="HDFC0001234"
              value={form.ifsc}
              onChange={(event) => set("ifsc", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="csp-micr">
              MICR code (9 digits)
            </label>
            <input
              id="csp-micr"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="numeric"
              maxLength={9}
              value={form.micr}
              onChange={(event) => set("micr", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="csp-phone">
              Your phone
            </label>
            <input
              id="csp-phone"
              className={`mt-2 ${INPUT_CLASS}`}
              type="tel"
              value={form.contactPhone}
              onChange={(event) => set("contactPhone", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="csp-email">
              Your email
            </label>
            <input
              id="csp-email"
              className={`mt-2 ${INPUT_CLASS}`}
              type="email"
              value={form.contactEmail}
              onChange={(event) => set("contactEmail", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="csp-address">
              Your address
            </label>
            <input
              id="csp-address"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.address}
              onChange={(event) => set("address", event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Cheque</h2>
        <label className={`mt-4 ${CHECK_ROW}`} htmlFor="csp-range">
          <input
            id="csp-range"
            className={CHECKBOX}
            type="checkbox"
            checked={form.isRange}
            onChange={(event) => set("isRange", event.target.checked)}
          />
          <span>Stop a range of cheque numbers, not just one</span>
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="csp-from">
              {form.isRange ? "First cheque number" : "Cheque number"} (6 digits)
            </label>
            <input
              id="csp-from"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={form.fromChequeNumber}
              onChange={(event) => set("fromChequeNumber", event.target.value)}
            />
          </div>
          {form.isRange && (
            <div>
              <label className={LABEL_CLASS} htmlFor="csp-to">
                Last cheque number (6 digits)
              </label>
              <input
                id="csp-to"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={form.toChequeNumber}
                onChange={(event) => set("toChequeNumber", event.target.value)}
              />
            </div>
          )}
          <div>
            <label className={LABEL_CLASS} htmlFor="csp-cheque-date">
              Date written on the cheque
            </label>
            <input
              id="csp-cheque-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.chequeDate}
              onChange={(event) => set("chequeDate", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="csp-request-date">
              Date of this request
            </label>
            <input
              id="csp-request-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.requestDate}
              onChange={(event) => set("requestDate", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="csp-amount">
              Amount on the cheque (0 if blank)
            </label>
            <input
              id="csp-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={form.amount}
              onChange={(event) => set("amount", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="csp-payee">
              Payee written on the cheque
            </label>
            <input
              id="csp-payee"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.payeeName}
              onChange={(event) => set("payeeName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="csp-reason">
              Reason for stopping
            </label>
            <select
              id="csp-reason"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.reasonId}
              onChange={(event) => set("reasonId", event.target.value)}
            >
              {STOP_REASONS.map((reason) => (
                <option key={reason.id} value={reason.id}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="csp-police">
              Police complaint / FIR reference
            </label>
            <input
              id="csp-police"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="Only if lost or stolen"
              value={form.policeReference}
              onChange={(event) => set("policeReference", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="csp-notes">
              Anything else the branch should know
            </label>
            <textarea
              id="csp-notes"
              className={`mt-2 ${AREA_CLASS}`}
              rows={2}
              value={form.extraNotes}
              onChange={(event) => set("extraNotes", event.target.value)}
            />
          </div>
        </div>

        <label className={`mt-4 ${CHECK_ROW}`} htmlFor="csp-newbook">
          <input
            id="csp-newbook"
            className={CHECKBOX}
            type="checkbox"
            checked={form.requestNewChequebook}
            onChange={(event) => set("requestNewChequebook", event.target.checked)}
          />
          <span>Also request a fresh chequebook</span>
        </label>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Charges</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="csp-fee">
              Stop payment charge quoted
            </label>
            <input
              id="csp-fee"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={form.feePerUnit}
              onChange={(event) => set("feePerUnit", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="csp-mode">
              How the bank charges it
            </label>
            <select
              id="csp-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.chargeModeId}
              onChange={(event) => set("chargeModeId", event.target.value)}
            >
              {CHARGE_MODES.map((mode) => (
                <option key={mode.id} value={mode.id}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="csp-tax">
              Tax on the charge (%)
            </label>
            <input
              id="csp-tax"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="40"
              step="0.5"
              value={form.taxPercent}
              onChange={(event) => set("taxPercent", event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total stop payment charge
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : INR.format(result.feeTotal)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the problem below to generate the letter"
                : `${result.chequeCount} cheque${result.chequeCount === 1 ? "" : "s"} ${DASH} ${result.chargeModeLabel.toLowerCase()}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the stop payment letter"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy letter"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {hasError && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.warnings.length > 0 && (
          <ul className="mt-4 grid gap-2 text-sm text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
              >
                {warning}
              </li>
            ))}
          </ul>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Stop payment letter</h2>
          <div className="mt-3 overflow-x-auto">
            <pre className="min-w-full whitespace-pre-wrap break-words font-sans text-sm leading-6">
              {result.letterText}
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template only, not legal or financial advice. The three-month validity rule and
        the IFSC and MICR formats apply to instruments drawn on banks in India. Stopping a cheque
        issued for a genuine debt can still leave you exposed under the Negotiable Instruments Act,
        1881 {DASH} take advice from a qualified professional where the payment is disputed.
      </p>
    </main>
  );
}
