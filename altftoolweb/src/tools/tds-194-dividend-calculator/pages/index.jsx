"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ReceiptIndianRupee, RotateCcw } from "lucide-react";

import {
  FINANCIAL_YEARS,
  PAYMENT_MODES,
  SHAREHOLDER_TYPES,
  computeDividendTds,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const CHECK_ROW =
  "flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3";
const CHECKBOX_CLASS =
  "h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  grossDividend: "50000",
  financialYear: "2025-26",
  shareholderType: "individual",
  paymentMode: "non_cash",
  hasPan: true,
  age: "40",
  regime: "new",
  declarationFiled: false,
  nilTaxLiability: false,
  otherCoveredIncome: "0",
  lowerDeductionCertificate: false,
  certificateRate: "2",
};

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setValue = (key) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const setChecked = (key) => (event) => {
    const value = event.target.checked;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const result = useMemo(
    () =>
      computeDividendTds({
        grossDividend: toNumber(form.grossDividend),
        financialYear: form.financialYear,
        shareholderType: form.shareholderType,
        paymentMode: form.paymentMode,
        hasPan: form.hasPan,
        age: toNumber(form.age),
        regime: form.regime,
        declarationFiled: form.declarationFiled,
        nilTaxLiability: form.nilTaxLiability,
        otherCoveredIncome: toNumber(form.otherCoveredIncome),
        lowerDeductionCertificate: form.lowerDeductionCertificate,
        certificateRate: toNumber(form.certificateRate),
      }),
    [form],
  );

  const error = result.error || null;

  const handleCopy = async () => {
    if (error) return;
    const lines = [
      `Section 194 TDS on dividend — ${result.financialYearLabel}`,
      `Gross dividend: ${INR.format(result.grossDividend)}`,
      `Rate applied: ${PCT.format(result.rate)}% (${result.basis})`,
      `TDS deducted: ${INR.format(result.tds)}`,
      `Net credited: ${INR.format(result.netDividend)}`,
    ];
    if (result.exemptReason) lines.push(result.exemptReason);
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-6 px-4 py-6">
      <section className="grid gap-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--foreground)]">
          <ReceiptIndianRupee aria-hidden="true" className="h-5 w-5 text-[var(--primary)]" />
          Dividend details
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <label className={LABEL_CLASS} htmlFor="td-gross">
              Dividend for the year from this company (₹)
            </label>
            <input
              className={INPUT_CLASS}
              id="td-gross"
              inputMode="decimal"
              onChange={setValue("grossDividend")}
              type="text"
              value={form.grossDividend}
            />
          </div>

          <div className="grid gap-1.5">
            <label className={LABEL_CLASS} htmlFor="td-fy">
              Financial year
            </label>
            <select
              className={INPUT_CLASS}
              id="td-fy"
              onChange={setValue("financialYear")}
              value={form.financialYear}
            >
              {FINANCIAL_YEARS.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-1.5">
            <label className={LABEL_CLASS} htmlFor="td-type">
              Shareholder
            </label>
            <select
              className={INPUT_CLASS}
              id="td-type"
              onChange={setValue("shareholderType")}
              value={form.shareholderType}
            >
              {SHAREHOLDER_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-1.5">
            <label className={LABEL_CLASS} htmlFor="td-mode">
              Mode of payment
            </label>
            <select
              className={INPUT_CLASS}
              id="td-mode"
              onChange={setValue("paymentMode")}
              value={form.paymentMode}
            >
              {PAYMENT_MODES.map((mode) => (
                <option key={mode.id} value={mode.id}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-1.5">
            <label className={LABEL_CLASS} htmlFor="td-age">
              Shareholder age on 31 March
            </label>
            <input
              className={INPUT_CLASS}
              id="td-age"
              inputMode="numeric"
              onChange={setValue("age")}
              type="text"
              value={form.age}
            />
          </div>

          <div className="grid gap-1.5">
            <label className={LABEL_CLASS} htmlFor="td-regime">
              Tax regime for the year
            </label>
            <select
              className={INPUT_CLASS}
              id="td-regime"
              onChange={setValue("regime")}
              value={form.regime}
            >
              <option value="new">New regime (Section 115BAC, default)</option>
              <option value="old">Old regime</option>
            </select>
          </div>

          <div className={CHECK_ROW}>
            <input
              checked={form.hasPan}
              className={CHECKBOX_CLASS}
              id="td-pan"
              onChange={setChecked("hasPan")}
              type="checkbox"
            />
            <label className="text-sm font-semibold text-[var(--foreground)]" htmlFor="td-pan">
              Valid PAN on record with the company
            </label>
          </div>

          <div className={CHECK_ROW}>
            <input
              checked={form.declarationFiled}
              className={CHECKBOX_CLASS}
              id="td-decl"
              onChange={setChecked("declarationFiled")}
              type="checkbox"
            />
            <label className="text-sm font-semibold text-[var(--foreground)]" htmlFor="td-decl">
              Form 15G / 15H filed with the company
            </label>
          </div>

          <div className={CHECK_ROW}>
            <input
              checked={form.nilTaxLiability}
              className={CHECKBOX_CLASS}
              id="td-nil"
              onChange={setChecked("nilTaxLiability")}
              type="checkbox"
            />
            <label className="text-sm font-semibold text-[var(--foreground)]" htmlFor="td-nil">
              Estimated tax for the whole year is nil
            </label>
          </div>

          <div className="grid gap-1.5">
            <label className={LABEL_CLASS} htmlFor="td-other">
              Other income covered by the declaration (₹)
            </label>
            <input
              className={INPUT_CLASS}
              id="td-other"
              inputMode="decimal"
              onChange={setValue("otherCoveredIncome")}
              type="text"
              value={form.otherCoveredIncome}
            />
          </div>

          <div className={CHECK_ROW}>
            <input
              checked={form.lowerDeductionCertificate}
              className={CHECKBOX_CLASS}
              id="td-cert"
              onChange={setChecked("lowerDeductionCertificate")}
              type="checkbox"
            />
            <label className="text-sm font-semibold text-[var(--foreground)]" htmlFor="td-cert">
              Section 197 lower-deduction certificate held
            </label>
          </div>

          <div className="grid gap-1.5">
            <label className={LABEL_CLASS} htmlFor="td-certrate">
              Certificate rate (%)
            </label>
            <input
              className={INPUT_CLASS}
              disabled={!form.lowerDeductionCertificate}
              id="td-certrate"
              inputMode="decimal"
              onChange={setValue("certificateRate")}
              type="text"
              value={form.certificateRate}
            />
          </div>
        </div>
      </section>

      <section
        aria-live="polite"
        role="status"
        className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
      >
        {error ? (
          <p
            className="mb-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-semibold text-[var(--danger)]"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <p className="text-sm font-semibold text-[var(--muted-foreground)]">TDS to be deducted</p>
        <p className="text-4xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-5xl">
          {error ? "—" : INR.format(result.tds)}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {error ? "—" : `${PCT.format(result.rate)}% — ${result.basis}`}
        </p>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="grid gap-0.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Gross dividend
            </dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {error ? "—" : INR.format(result.grossDividend)}
            </dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Net amount credited
            </dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {error ? "—" : INR.format(result.netDividend)}
            </dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Section 194 threshold for the year
            </dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {error
                ? "—"
                : result.thresholdAvailable
                  ? INR.format(result.threshold)
                  : "Not available on this payout"}
            </dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Effective rate on the dividend
            </dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {error ? "—" : `${PCT.format(result.effectiveRate)}%`}
            </dd>
          </div>
        </dl>

        {!error && result.exemptReason ? (
          <p className="mt-4 rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm font-semibold text-[var(--success-text)]">
            {result.exemptReason}
          </p>
        ) : null}

        {!error && result.warnings.length > 0 ? (
          <ul className="mt-3 grid gap-2">
            {result.warnings.map((warning) => (
              <li
                className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning-text)]"
                key={warning}
              >
                {warning}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            aria-label="Copy the TDS calculation to the clipboard"
            className={PRIMARY_BTN}
            onClick={handleCopy}
            type="button"
          >
            {copied ? (
              <Check aria-hidden="true" className="h-4 w-4" />
            ) : (
              <Copy aria-hidden="true" className="h-4 w-4" />
            )}
            {copied ? "Copied!" : "Copy result"}
          </button>
          <button aria-label="Reset all inputs" className={GHOST_BTN} onClick={reset} type="button">
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            Reset
          </button>
        </div>
      </section>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-lg font-bold text-[var(--foreground)]">
          Form {error ? "15G / 15H" : result.declaration.form} eligibility
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {error
            ? "—"
            : result.declaration.eligible
              ? "Every statutory condition is met, so the company may accept the declaration and deduct nothing."
              : "At least one condition below is not met, so the declaration cannot be accepted."}
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="py-2 pr-3 font-semibold text-[var(--muted-foreground)]" scope="col">
                  Condition
                </th>
                <th className="py-2 pr-3 font-semibold text-[var(--muted-foreground)]" scope="col">
                  Met
                </th>
                <th className="py-2 font-semibold text-[var(--muted-foreground)]" scope="col">
                  Why
                </th>
              </tr>
            </thead>
            <tbody>
              {error ? (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={3}>
                    —
                  </td>
                </tr>
              ) : (
                result.declaration.checks.map((check) => (
                  <tr className="border-b border-[var(--border)] align-top" key={check.label}>
                    <td className="py-3 pr-3 font-semibold text-[var(--foreground)]">{check.label}</td>
                    <td
                      className={`py-3 pr-3 font-semibold whitespace-nowrap ${
                        check.pass ? "text-[var(--success)]" : "text-[var(--danger)]"
                      }`}
                    >
                      {check.pass ? "Yes" : "No"}
                    </td>
                    <td className="py-3 text-[var(--muted-foreground)]">{check.detail}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs text-[var(--muted-foreground)]">
        Section 194 covers dividend paid by a domestic company to a resident shareholder only. Dividend
        paid to a non-resident is deducted under Section 195 and is outside this calculator. TDS is a
        credit, not a final tax — the dividend is still taxed at your slab rate and the deduction shows in
        Form 26AS and the AIS. This is general information, not tax advice.
      </p>
    </div>
  );
}
