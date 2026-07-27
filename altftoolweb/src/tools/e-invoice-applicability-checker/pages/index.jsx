"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileCheck2, RotateCcw } from "lucide-react";
import {
  CURRENT_THRESHOLD_CR,
  ENTITY_TYPES,
  E_INVOICE_PHASES,
  checkEInvoiceApplicability,
  irpReportingDeadline,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DATE = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const crore = (value) => (Number.isFinite(value) ? `Rs ${NUM.format(value)} crore` : DASH);
const isoToLabel = (iso) => (iso ? DATE.format(new Date(`${iso}T00:00:00Z`)) : DASH);

const DEFAULTS = {
  highest: "12",
  lastYear: "12",
  entityType: "regular",
  hasB2B: true,
  documentDate: "2026-04-15",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
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
  const [highest, setHighest] = useState(DEFAULTS.highest);
  const [lastYear, setLastYear] = useState(DEFAULTS.lastYear);
  const [entityType, setEntityType] = useState(DEFAULTS.entityType);
  const [hasB2B, setHasB2B] = useState(DEFAULTS.hasB2B);
  const [documentDate, setDocumentDate] = useState(DEFAULTS.documentDate);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      checkEInvoiceApplicability({
        highestTurnoverCr: toNumber(highest),
        lastYearTurnoverCr: toNumber(lastYear),
        entityType,
        hasB2BSupplies: hasB2B,
      }),
    [highest, lastYear, entityType, hasB2B],
  );

  const deadline = useMemo(() => irpReportingDeadline(documentDate), [documentDate]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "GST E-Invoice Applicability Check",
      `Highest aggregate turnover (any FY from 2017-18): ${crore(result.highestTurnoverCr)}`,
      `Entity type: ${result.entityLabel}`,
      `E-invoicing applicable: ${result.applicable ? "Yes" : "No"}`,
      result.applicable
        ? `Mandatory from: ${isoToLabel(result.mandateFrom)} (threshold crossed: ${crore(result.thresholdCrossedCr)})`
        : `Reason: ${result.reason}`,
      `30-day IRP reporting limit: ${result.reportingWindowApplies ? "Applies" : "Does not apply"}`,
      `Dynamic QR on B2C invoices: ${result.dynamicQrApplies ? "Applies" : "Does not apply"}`,
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
    setHighest(DEFAULTS.highest);
    setLastYear(DEFAULTS.lastYear);
    setEntityType(DEFAULTS.entityType);
    setHasB2B(DEFAULTS.hasB2B);
    setDocumentDate(DEFAULTS.documentDate);
    setCopied(false);
  };

  const verdictLabel = hasError
    ? DASH
    : result.applicable
      ? "E-invoicing applies"
      : "Not applicable";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileCheck2 className="h-4 w-4" aria-hidden="true" />
          GST Rule 48(4)
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          E-Invoice Applicability Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your PAN-level aggregate turnover and entity type to see whether GST e-invoicing is
          mandatory, from which date, and whether the 30-day IRP reporting window binds you.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="einv-highest">
              Highest aggregate turnover in any FY since 2017-18 (Rs crore)
            </label>
            <input
              id="einv-highest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={highest}
              onChange={(event) => setHighest(event.target.value)}
            />
            <p className={HINT_CLASS}>All-India, all GSTINs on the same PAN.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="einv-last">
              Aggregate turnover in the last completed FY (Rs crore)
            </label>
            <input
              id="einv-last"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={lastYear}
              onChange={(event) => setLastYear(event.target.value)}
            />
            <p className={HINT_CLASS}>Drives the 30-day IRP reporting limit.</p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="einv-entity">
              Entity type
            </label>
            <select
              id="einv-entity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={entityType}
              onChange={(event) => setEntityType(event.target.value)}
            >
              {ENTITY_TYPES.map((entity) => (
                <option key={entity.id} value={entity.id}>
                  {entity.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="flex min-h-11 items-center gap-3 text-sm font-medium" htmlFor="einv-b2b">
              <input
                id="einv-b2b"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={hasB2B}
                onChange={(event) => setHasB2B(event.target.checked)}
              />
              I make B2B, export, SEZ or deemed-export supplies
            </label>
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
              Verdict
            </p>
            <p
              className={`mt-1 text-3xl font-semibold sm:text-4xl ${
                hasError
                  ? "text-[var(--muted-foreground)]"
                  : result.applicable
                    ? "text-[var(--primary)]"
                    : "text-[var(--success)]"
              }`}
            >
              {verdictLabel}
            </p>
            <p className="mt-1 max-w-prose text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a verdict." : result.reason}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy e-invoice applicability result"
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
            [
              "Threshold crossed",
              hasError || !result.thresholdCrossedCr ? DASH : crore(result.thresholdCrossedCr),
            ],
            [
              "Mandatory from",
              hasError || !result.applicable ? DASH : isoToLabel(result.mandateFrom),
            ],
            [
              "Notification",
              hasError || !result.applicable ? DASH : result.notification,
            ],
            ["Lowest notified threshold today", crore(CURRENT_THRESHOLD_CR)],
            [
              "Headroom before you cross it",
              hasError ? DASH : result.headroomCr > 0 ? crore(result.headroomCr) : "Already crossed",
            ],
            [
              "Turnover in rupees",
              hasError ? DASH : money(result.highestTurnoverRupees),
            ],
            [
              "30-day IRP reporting limit",
              hasError ? DASH : result.reportingWindowApplies ? "Applies to you" : "Not applicable",
            ],
            [
              "Dynamic QR code on B2C invoices",
              hasError ? DASH : result.dynamicQrApplies ? "Applies to you" : "Not applicable",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.entityNote ? (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
            {result.entityNote}
          </p>
        ) : null}
      </section>

      {!hasError && result.reportingWindowApplies ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">30-day IRP reporting deadline</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            An invoice dated after the window closes is rejected by the IRP, and without an IRN it is
            not a valid document for your buyer&rsquo;s input tax credit.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="einv-docdate">
                Invoice / document date
              </label>
              <input
                id="einv-docdate"
                className={`mt-2 ${INPUT_CLASS}`}
                type="date"
                value={documentDate}
                onChange={(event) => setDocumentDate(event.target.value)}
              />
            </div>
            <div>
              <p className={LABEL_CLASS}>Report to the IRP by</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--primary)]">
                {deadline.error ? DASH : isoToLabel(deadline.deadline)}
              </p>
              {deadline.error ? (
                <p role="alert" className="mt-1 text-xs font-medium text-[var(--danger)]">
                  {deadline.error}
                </p>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Needs an IRN</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.documents?.map((item) => (
              <li key={item} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Outside Rule 48(4)</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.excluded?.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true" className="text-[var(--muted-foreground)]">
                  &times;
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">How the threshold came down</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Turnover exceeds
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Mandatory from
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Notification
                </th>
              </tr>
            </thead>
            <tbody>
              {E_INVOICE_PHASES.map((phase) => (
                <tr key={phase.thresholdCr} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{crore(phase.thresholdCr)}</td>
                  <td className="py-2 pr-3">{isoToLabel(phase.from)}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{phase.notification}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not professional advice. Applicability turns on your actual aggregate
        turnover as defined in section 2(6) of the CGST Act and on the notification in force for your
        entity class — confirm on the GST e-invoice portal or with your tax adviser before relying on
        this result.
      </p>
    </main>
  );
}
