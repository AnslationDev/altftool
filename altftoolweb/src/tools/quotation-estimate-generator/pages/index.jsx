"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardList, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  LINE_KINDS,
  SCHEDULE_PRESETS,
  VALIDITY_PRESETS,
  addDaysToIsoDate,
  buildEstimateRange,
  buildPaymentSchedule,
  computeQuotationTotals,
} from "../lib";

const PCT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const pct = (value) => `${PCT.format(Number.isFinite(value) ? value : 0)}%`;
const DASH = "—";

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "AUD", "CAD", "SGD", "AED"];

const START_ITEMS = [
  { id: 1, description: "Porcelain floor tiles", kind: "material", unit: "sqm", quantity: "20", unitPrice: "50", discountPercent: "0", taxPercent: "10" },
  { id: 2, description: "Tiling labour", kind: "labour", unit: "hr", quantity: "8", unitPrice: "75", discountPercent: "0", taxPercent: "10" },
];

const DEFAULTS = {
  documentType: "quotation",
  business: "Meridian Interiors",
  client: "Riverside Cafe",
  reference: "Q-2026-014",
  currency: "USD",
  issueDate: "2026-01-15",
  validityDays: "30",
  overallDiscount: "5",
  contingency: "10",
  contingencyTax: "10",
  variance: "15",
  schedule: "30 / 40 / 30",
  terms: "Prices exclude anything not listed above. Work starts within 10 working days of a signed acceptance and cleared deposit.",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-24 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs leading-5 text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [items, setItems] = useState(START_ITEMS);
  const [documentType, setDocumentType] = useState(DEFAULTS.documentType);
  const [business, setBusiness] = useState(DEFAULTS.business);
  const [client, setClient] = useState(DEFAULTS.client);
  const [reference, setReference] = useState(DEFAULTS.reference);
  const [currency, setCurrency] = useState(DEFAULTS.currency);
  const [issueDate, setIssueDate] = useState(DEFAULTS.issueDate);
  const [validityDays, setValidityDays] = useState(DEFAULTS.validityDays);
  const [overallDiscount, setOverallDiscount] = useState(DEFAULTS.overallDiscount);
  const [contingency, setContingency] = useState(DEFAULTS.contingency);
  const [contingencyTax, setContingencyTax] = useState(DEFAULTS.contingencyTax);
  const [variance, setVariance] = useState(DEFAULTS.variance);
  const [schedule, setSchedule] = useState(DEFAULTS.schedule);
  const [terms, setTerms] = useState(DEFAULTS.terms);
  const [copied, setCopied] = useState(false);

  const isEstimate = documentType === "estimate";

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [currency],
  );
  const money = (value) => formatter.format(Number.isFinite(value) ? value : 0);

  const totals = useMemo(
    () =>
      computeQuotationTotals({
        items: items.map((item) => ({
          description: item.description,
          kind: item.kind,
          unit: item.unit,
          quantity: toNumber(item.quantity),
          unitPrice: toNumber(item.unitPrice),
          discountPercent: toNumber(item.discountPercent),
          taxPercent: toNumber(item.taxPercent),
        })),
        overallDiscountPercent: toNumber(overallDiscount),
        contingencyPercent: toNumber(contingency),
        contingencyTaxPercent: toNumber(contingencyTax),
      }),
    [items, overallDiscount, contingency, contingencyTax],
  );

  const hasError = Boolean(totals.error);

  const range = useMemo(
    () => (hasError ? { error: totals.error } : buildEstimateRange(totals.grandTotal, toNumber(variance))),
    [hasError, totals, variance],
  );

  const selectedSchedule =
    SCHEDULE_PRESETS.find((preset) => preset.name === schedule) || SCHEDULE_PRESETS[0];

  const payments = useMemo(
    () =>
      hasError
        ? { error: totals.error }
        : buildPaymentSchedule(totals.grandTotal, selectedSchedule.milestones),
    [hasError, totals, selectedSchedule],
  );

  const validity = useMemo(
    () => addDaysToIsoDate(issueDate, Math.trunc(toNumber(validityDays))),
    [issueDate, validityDays],
  );

  const updateItem = (id, field, value) => {
    setItems((previous) =>
      previous.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const addItem = () => {
    setItems((previous) => {
      // Next id comes from existing state, never from a ref read during render.
      const nextId = previous.reduce((max, item) => Math.max(max, item.id), 0) + 1;
      return [
        ...previous,
        {
          id: nextId,
          description: "",
          kind: "material",
          unit: "unit",
          quantity: "1",
          unitPrice: "0",
          discountPercent: "0",
          taxPercent: "0",
        },
      ];
    });
  };

  const removeItem = (id) => {
    setItems((previous) => (previous.length > 1 ? previous.filter((item) => item.id !== id) : previous));
  };

  const documentText = useMemo(() => {
    if (hasError) return "";
    const headline = isEstimate && !range.error
      ? `ESTIMATED RANGE: ${money(range.low)} to ${money(range.high)}`
      : `QUOTED PRICE: ${money(totals.grandTotal)}`;
    return [
      isEstimate ? "ESTIMATE" : "QUOTATION",
      `From: ${business}`,
      `For: ${client}`,
      `Reference: ${reference}`,
      `Issued: ${issueDate}`,
      validity.error ? `Valid for: ${validityDays} days` : `Valid until: ${validity.isoDate}`,
      "",
      ...totals.lines.map(
        (line, index) =>
          `${index + 1}. ${line.description} — ${line.quantity} ${line.unit} x ${money(line.unitPrice)} = ${money(line.total)}`,
      ),
      "",
      `Materials: ${money(totals.materialsNet)}`,
      `Labour: ${money(totals.labourNet)}`,
      `Discount: -${money(totals.totalDiscount)}`,
      `Net total: ${money(totals.netTotal)}`,
      `Contingency (${pct(totals.contingencyPercent)}): ${money(totals.contingency)}`,
      `Tax: ${money(totals.totalTax)}`,
      headline,
      "",
      "Payment schedule",
      ...(payments.error
        ? [payments.error]
        : payments.milestones.map((row) => `- ${row.label} (${pct(row.percent)}): ${money(row.amount)}`)),
      "",
      "Terms",
      terms,
      isEstimate
        ? "This is an estimate, not a fixed price. The final amount may fall anywhere in the range above."
        : "This is a fixed-price quotation. Accepting it in writing forms a contract on these terms.",
    ].join("\n");
  }, [
    business,
    client,
    hasError,
    isEstimate,
    issueDate,
    money,
    payments,
    range,
    reference,
    terms,
    totals,
    validity,
    validityDays,
  ]);

  const copyResult = async () => {
    if (!documentText) return;
    try {
      await navigator.clipboard.writeText(documentText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setItems(START_ITEMS);
    setDocumentType(DEFAULTS.documentType);
    setBusiness(DEFAULTS.business);
    setClient(DEFAULTS.client);
    setReference(DEFAULTS.reference);
    setCurrency(DEFAULTS.currency);
    setIssueDate(DEFAULTS.issueDate);
    setValidityDays(DEFAULTS.validityDays);
    setOverallDiscount(DEFAULTS.overallDiscount);
    setContingency(DEFAULTS.contingency);
    setContingencyTax(DEFAULTS.contingencyTax);
    setVariance(DEFAULTS.variance);
    setSchedule(DEFAULTS.schedule);
    setTerms(DEFAULTS.terms);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          Sales documents
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Quotation and Estimate Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Price a job line by line with materials and labour split out, add contingency and tax,
          set a validity date and a payment schedule — as a fixed quotation or a ranged estimate.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            What are you issuing?
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              ["quotation", "Quotation — a fixed price"],
              ["estimate", "Estimate — a range"],
            ].map(([value, label]) => (
              <label
                key={value}
                htmlFor={`qe-type-${value}`}
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm font-medium ${
                  documentType === value
                    ? "border-[var(--primary)] bg-[var(--muted)] text-[var(--foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                }`}
              >
                <input
                  id={`qe-type-${value}`}
                  type="radio"
                  name="qe-type"
                  className="h-4 w-4 accent-[var(--primary)]"
                  value={value}
                  checked={documentType === value}
                  onChange={(event) => setDocumentType(event.target.value)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="qe-business">
              Your business
            </label>
            <input
              id="qe-business"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={business}
              onChange={(event) => setBusiness(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="qe-client">
              Client
            </label>
            <input
              id="qe-client"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={client}
              onChange={(event) => setClient(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="qe-reference">
              Reference
            </label>
            <input
              id="qe-reference"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="qe-currency">
              Currency
            </label>
            <select
              id="qe-currency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              {CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="qe-issue">
              Issue date
            </label>
            <input
              id="qe-issue"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={issueDate}
              onChange={(event) => setIssueDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="qe-validity">
              Valid for (days)
            </label>
            <select
              id="qe-validity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={validityDays}
              onChange={(event) => setValidityDays(event.target.value)}
            >
              {VALIDITY_PRESETS.map((days) => (
                <option key={days} value={String(days)}>
                  {days} days
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>
              {validity.error ? validity.error : `Expires on ${validity.isoDate}.`}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Priced lines</h2>
          <button type="button" onClick={addItem} className={GHOST_BTN} aria-label="Add a priced line">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add line
          </button>
        </div>

        <div className="mt-4 grid gap-5">
          {items.map((item, index) => (
            <div key={item.id} className="rounded-md border border-[var(--border)] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[var(--muted-foreground)]">
                  Line {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                  aria-label={`Remove line ${index + 1}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`qe-desc-${item.id}`}>
                    Description
                  </label>
                  <input
                    id={`qe-desc-${item.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={item.description}
                    onChange={(event) => updateItem(item.id, "description", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`qe-kind-${item.id}`}>
                    Type
                  </label>
                  <select
                    id={`qe-kind-${item.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={item.kind}
                    onChange={(event) => updateItem(item.id, "kind", event.target.value)}
                  >
                    {LINE_KINDS.map((kind) => (
                      <option key={kind.value} value={kind.value}>
                        {kind.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`qe-unit-${item.id}`}>
                    Unit
                  </label>
                  <input
                    id={`qe-unit-${item.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={item.unit}
                    onChange={(event) => updateItem(item.id, "unit", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`qe-qty-${item.id}`}>
                    Quantity
                  </label>
                  <input
                    id={`qe-qty-${item.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.5"
                    value={item.quantity}
                    onChange={(event) => updateItem(item.id, "quantity", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`qe-rate-${item.id}`}>
                    Rate ({currency})
                  </label>
                  <input
                    id={`qe-rate-${item.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(event) => updateItem(item.id, "unitPrice", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`qe-disc-${item.id}`}>
                    Line discount (%)
                  </label>
                  <input
                    id={`qe-disc-${item.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    step="0.5"
                    value={item.discountPercent}
                    onChange={(event) => updateItem(item.id, "discountPercent", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`qe-tax-${item.id}`}>
                    Tax (%)
                  </label>
                  <input
                    id={`qe-tax-${item.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    step="0.5"
                    value={item.taxPercent}
                    onChange={(event) => updateItem(item.id, "taxPercent", event.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="qe-overall-discount">
              Overall discount (%)
            </label>
            <input
              id="qe-overall-discount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              value={overallDiscount}
              onChange={(event) => setOverallDiscount(event.target.value)}
            />
            <p className={HINT_CLASS}>Applied before tax, spread across every line pro rata.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="qe-contingency">
              Contingency / margin (%)
            </label>
            <input
              id="qe-contingency"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              value={contingency}
              onChange={(event) => setContingency(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="qe-contingency-tax">
              Tax on contingency (%)
            </label>
            <input
              id="qe-contingency-tax"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              value={contingencyTax}
              onChange={(event) => setContingencyTax(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="qe-variance">
              Estimate variance (± %)
            </label>
            <input
              id="qe-variance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={variance}
              onChange={(event) => setVariance(event.target.value)}
            />
            <p className={HINT_CLASS}>Only used when you issue an estimate rather than a quotation.</p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="qe-schedule">
              Payment schedule
            </label>
            <select
              id="qe-schedule"
              className={`mt-2 ${INPUT_CLASS}`}
              value={schedule}
              onChange={(event) => setSchedule(event.target.value)}
            >
              {SCHEDULE_PRESETS.map((preset) => (
                <option key={preset.name} value={preset.name}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="qe-terms">
              Terms and exclusions
            </label>
            <textarea
              id="qe-terms"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={terms}
              onChange={(event) => setTerms(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {totals.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {isEstimate ? "Estimated range" : "Quoted price"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError
                ? DASH
                : isEstimate && !range.error
                  ? `${money(range.low)} – ${money(range.high)}`
                  : money(totals.grandTotal)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the priced lines to see a total."
                : isEstimate
                  ? `Midpoint ${money(totals.grandTotal)}, ± ${pct(toNumber(variance))}`
                  : `Fixed price including ${money(totals.totalTax)} of tax`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the quotation text"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy document"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the quotation"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Gross before any discount", hasError ? DASH : money(totals.grossTotal)],
            ["Line discounts", hasError ? DASH : `-${money(totals.lineDiscountTotal)}`],
            [
              `Overall discount (${hasError ? DASH : pct(totals.overallDiscountPercent)})`,
              hasError ? DASH : `-${money(totals.overallDiscount)}`,
            ],
            ["Materials", hasError ? DASH : money(totals.materialsNet)],
            [
              `Labour (${hasError ? DASH : pct(totals.labourSharePercent)} of net)`,
              hasError ? DASH : money(totals.labourNet),
            ],
            ["Net total after discounts", hasError ? DASH : money(totals.netTotal)],
            [
              `Contingency (${hasError ? DASH : pct(totals.contingencyPercent)})`,
              hasError ? DASH : money(totals.contingency),
            ],
            ["Tax", hasError ? DASH : money(totals.totalTax)],
            ["Total payable", hasError ? DASH : money(totals.grandTotal)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Payment schedule</h2>
        {payments.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {payments.error}
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Milestone</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Share</th>
                  <th scope="col" className="py-2 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.milestones.map((row) => (
                  <tr key={row.label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 pr-3">{row.label}</td>
                    <td className="py-2.5 pr-3 text-right text-[var(--muted-foreground)]">
                      {pct(row.percent)}
                    </td>
                    <td className="py-2.5 text-right font-semibold">{money(row.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Document tooling, not legal advice. A quotation the customer accepts in writing generally
        binds you to the price, while an estimate does not — how a document is worded, and local
        consumer law, decide which one you have issued.
      </p>
    </main>
  );
}
