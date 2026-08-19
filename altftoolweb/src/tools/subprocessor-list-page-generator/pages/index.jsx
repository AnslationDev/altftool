"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, Plus, RotateCcw, Server, Trash2 } from "lucide-react";
import { TRANSFER_MECHANISMS, buildSubprocessorPage } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_ROWS = [
  {
    id: 1,
    vendor: "Amazon Web Services",
    entity: "AWS EMEA SARL",
    purpose: "Cloud hosting and storage of customer content",
    dataTypes: "Account data, uploaded content, logs",
    country: "Ireland",
    mechanism: "eea",
  },
  {
    id: 2,
    vendor: "Stripe",
    entity: "Stripe Payments Europe Ltd",
    purpose: "Subscription billing and payment processing",
    dataTypes: "Name, billing address, card token",
    country: "United States",
    mechanism: "sccs",
  },
  {
    id: 3,
    vendor: "Zoho",
    entity: "Zoho Corporation Pvt Ltd",
    purpose: "Customer support ticketing",
    dataTypes: "Support messages, contact email",
    country: "India",
    mechanism: "sccs",
  },
];

const DEFAULT_META = {
  company: "Acme SaaS Limited",
  product: "Acme Analytics",
  contactEmail: "privacy@acme.example",
  effectiveDate: "2026-07-01",
  noticeDays: "30",
};

const FORMATS = [
  ["markdown", "Markdown"],
  ["html", "HTML"],
  ["csv", "CSV"],
];

const EMPTY_ROW = {
  vendor: "",
  entity: "",
  purpose: "",
  dataTypes: "",
  country: "",
  mechanism: "sccs",
};

export default function ToolHome() {
  const [meta, setMeta] = useState(DEFAULT_META);
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [nextId, setNextId] = useState(DEFAULT_ROWS.length + 1);
  const [format, setFormat] = useState("markdown");
  const [copied, setCopied] = useState(false);

  const setMetaField = (key) => (event) => {
    const { value } = event.target;
    setMeta((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const updateRow = (id, key, value) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
    setCopied(false);
  };

  const addRow = () => {
    setRows((prev) => [...prev, { ...EMPTY_ROW, id: nextId }]);
    setNextId(nextId + 1);
    setCopied(false);
  };

  const removeRow = (id) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
    setCopied(false);
  };

  const result = useMemo(
    () =>
      buildSubprocessorPage({
        company: meta.company,
        product: meta.product,
        contactEmail: meta.contactEmail,
        effectiveDate: meta.effectiveDate,
        noticeDays: meta.noticeDays.trim() === "" ? 30 : Number(meta.noticeDays),
        rows,
      }),
    [meta, rows],
  );

  const output = result.error ? "" : result[format];
  const dash = "—";

  const copyResult = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setMeta(DEFAULT_META);
    setRows(DEFAULT_ROWS);
    setNextId(DEFAULT_ROWS.length + 1);
    setFormat("markdown");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Server className="h-4 w-4" aria-hidden="true" />
          GDPR Art. 28
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Subprocessor List Page Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build the public subprocessor table your data processing agreement points at — vendor,
          purpose, data, location and the Chapter V transfer mechanism for every destination
          outside the EEA.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sp-company">
              Publishing company
            </label>
            <input id="sp-company" className={`mt-2 ${INPUT_CLASS}`} value={meta.company} onChange={setMetaField("company")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sp-product">
              Product or service name
            </label>
            <input id="sp-product" className={`mt-2 ${INPUT_CLASS}`} value={meta.product} onChange={setMetaField("product")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sp-email">
              Change-notice subscription email
            </label>
            <input id="sp-email" type="email" className={`mt-2 ${INPUT_CLASS}`} value={meta.contactEmail} onChange={setMetaField("contactEmail")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sp-notice">
              Advance notice before a new subprocessor (days)
            </label>
            <input id="sp-notice" type="number" min="0" max="365" className={`mt-2 ${INPUT_CLASS}`} value={meta.noticeDays} onChange={setMetaField("noticeDays")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sp-date">
              Last updated
            </label>
            <input id="sp-date" type="date" className={`mt-2 ${INPUT_CLASS}`} value={meta.effectiveDate} onChange={setMetaField("effectiveDate")} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Subprocessors</h2>
          <button type="button" onClick={addRow} className={GHOST_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add subprocessor
          </button>
        </div>

        <div className="mt-4 space-y-5">
          {rows.map((row, index) => (
            <div key={row.id} className="rounded-lg border border-[var(--border)] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Row {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  aria-label={`Remove subprocessor row ${index + 1}`}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sp-vendor-${row.id}`}>
                    Vendor
                  </label>
                  <input id={`sp-vendor-${row.id}`} className={`mt-2 ${INPUT_CLASS}`} value={row.vendor} onChange={(event) => updateRow(row.id, "vendor", event.target.value)} />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sp-entity-${row.id}`}>
                    Contracting entity
                  </label>
                  <input id={`sp-entity-${row.id}`} className={`mt-2 ${INPUT_CLASS}`} value={row.entity} onChange={(event) => updateRow(row.id, "entity", event.target.value)} />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sp-purpose-${row.id}`}>
                    Purpose of processing
                  </label>
                  <input id={`sp-purpose-${row.id}`} className={`mt-2 ${INPUT_CLASS}`} value={row.purpose} onChange={(event) => updateRow(row.id, "purpose", event.target.value)} />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sp-data-${row.id}`}>
                    Data processed
                  </label>
                  <input id={`sp-data-${row.id}`} className={`mt-2 ${INPUT_CLASS}`} value={row.dataTypes} onChange={(event) => updateRow(row.id, "dataTypes", event.target.value)} />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sp-country-${row.id}`}>
                    Hosting country
                  </label>
                  <input id={`sp-country-${row.id}`} className={`mt-2 ${INPUT_CLASS}`} value={row.country} onChange={(event) => updateRow(row.id, "country", event.target.value)} />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sp-mech-${row.id}`}>
                    Transfer mechanism
                  </label>
                  <select id={`sp-mech-${row.id}`} className={`mt-2 ${INPUT_CLASS}`} value={row.mechanism} onChange={(event) => updateRow(row.id, "mechanism", event.target.value)}>
                    {TRANSFER_MECHANISMS.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {result.error && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5" aria-live="polite" aria-atomic="true">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Subprocessors listed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {result.error ? dash : result.stats.total}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error
                ? dash
                : `${result.stats.outsideEea} outside the EEA · ${result.stats.countryCount} countries${
                    result.stats.unknownLocation > 0 ? ` · ${result.stats.unknownLocation} location unknown` : ""
                  }`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy subprocessor page" className={GHOST_BTN} disabled={!output}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy page"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the subprocessor list" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Transfers with no documented tool", result.error ? dash : String(result.stats.gapCount)],
            ["Advance notice promised", result.error ? dash : `${result.stats.noticeDays} days`],
            ["Legal basis", "GDPR Art. 28(2), Art. 28(4) and Chapter V"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!result.error && result.warnings.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5" aria-live="polite" aria-atomic="true">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <AlertTriangle className="h-4 w-4 text-[var(--warning)]" aria-hidden="true" />
            Gaps to close
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {result.warnings.map((warning) => (
              <li key={warning} className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-[var(--warning)]">
                {warning}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!result.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Generated page</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {FORMATS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setFormat(id);
                  setCopied(false);
                }}
                aria-pressed={format === id}
                className={
                  format === id
                    ? "min-h-11 rounded-md bg-[var(--primary)] px-3 text-sm font-semibold text-[var(--primary-foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    : "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                }
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-3 overflow-x-auto">
            <pre
              aria-live="polite"
              aria-atomic="true"
              className="min-w-full whitespace-pre-wrap break-words rounded-md bg-[var(--muted)] p-4 text-xs leading-6 text-[var(--foreground)]"
            >
              {output}
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template only, not legal advice. Adequacy decisions change — confirm the
        current European Commission list and your own contracts, and involve counsel before you
        publish or rely on a transfer mechanism.
      </p>
    </main>
  );
}
