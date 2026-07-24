"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeftRight,
  CheckCircle2,
  Download,
  FileJson2,
  FileText,
  Info,
  Landmark,
  ListChecks,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  ScanSearch,
  ShieldCheck,
  Upload,
} from "lucide-react";

import {
  buildCountsOnlyChangeReport,
  compareInvoiceFields,
  createEmptyInvoiceFields,
  extractInvoiceFields,
  INVOICE_FIELDS,
} from "../lib/invoiceComparison.mjs";
import { extractTextBasedInvoicePdf } from "../lib/extractPdfText";

const BASELINE_SAMPLE = `Invoice Number: INV-2026-1042
Invoice Date: 20 July 2026
Vendor: Example Office Supplies
GSTIN: 22AAAAA0000A1Z5
Bank Account: 000011112222
IBAN: GB82 WEST 1234 5698 7654 32
UPI ID: billing@examplebank
Currency: INR
Description Qty Amount
Workspace chairs 2 20000
Delivery 1 1000
Subtotal: 21000
Tax Amount: 3780
Grand Total: 24780`;

const CURRENT_SAMPLE = `Invoice Number: INV-2026-1042
Invoice Date: 20 July 2026
Vendor: Example Office Supplies
GSTIN: 22AAAAA0000A1Z5
Bank Account: 999988887777
IBAN: GB29 NWBK 6016 1331 9268 19
UPI ID: collections@examplebank
Currency: INR
Description Qty Amount
Workspace chairs 2 20000
Priority delivery 1 2500
Subtotal: 22500
Tax Amount: 4050
Grand Total: 26550`;

const INPUT_CLASS =
  "min-h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:shadow-[var(--anslation-ds-focus-ring)]";

function emptySide(source = "") {
  return {
    fields: createEmptyInvoiceFields(),
    notices: [],
    reviewed: false,
    source,
  };
}

function countPresentFields(fields) {
  return INVOICE_FIELDS.filter((field) => String(fields[field.key] ?? "").trim())
    .length;
}

function SourcePanel({
  busy,
  id,
  onExtract,
  onPdf,
  onSourceChange,
  pdfInputRef,
  side,
  title,
}) {
  return (
    <section className="tool-card min-w-0">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
          <FileJson2 aria-hidden="true" className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <p id={`${id}-source-help`} className="mt-1 text-sm leading-6 text-muted-foreground">
            Paste invoice text or JSON, or extract the text layer from a local PDF.
          </p>
        </div>
      </div>

      <label htmlFor={`${id}-source`} className="sr-only">
        {title} text or JSON
      </label>
      <textarea
        id={`${id}-source`}
        value={side.source}
        onChange={(event) => onSourceChange(event.target.value)}
        aria-describedby={`${id}-source-help`}
        spellCheck="false"
        className="mt-4 min-h-72 w-full resize-y rounded-md border border-border bg-background p-4 font-mono text-sm leading-6 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:shadow-[var(--anslation-ds-focus-ring)]"
        placeholder="Paste extracted invoice text or a JSON invoice object…"
      />

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className="btn-secondary" onClick={onExtract}>
          <ScanSearch aria-hidden="true" className="h-4 w-4" />
          Extract fields
        </button>
        <input
          ref={pdfInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={onPdf}
          className="sr-only"
          tabIndex={-1}
        />
        <button
          type="button"
          className="btn-secondary"
          onClick={() => pdfInputRef.current?.click()}
          disabled={busy}
        >
          {busy ? (
            <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : (
            <Upload aria-hidden="true" className="h-4 w-4" />
          )}
          {busy ? "Reading PDF…" : "Choose text PDF"}
        </button>
      </div>

      {side.notices.length ? (
        <ul className="mt-4 space-y-2">
          {side.notices.map((notice) => (
            <li
              key={notice}
              className="flex items-start gap-2 rounded-lg border border-warning bg-warning-soft p-3 text-sm leading-6 text-foreground"
            >
              <AlertTriangle
                aria-hidden="true"
                className="mt-0.5 h-4 w-4 shrink-0 text-warning"
              />
              <span>{notice}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function FieldEditor({ id, onFieldChange, onReviewedChange, side, title }) {
  return (
    <section className="tool-card min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Review every extracted value and correct or add missing fields manually.
          </p>
        </div>
        <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
          {countPresentFields(side.fields)} of {INVOICE_FIELDS.length} filled
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {INVOICE_FIELDS.map((field) => (
          <label
            key={field.key}
            htmlFor={`${id}-${field.key}`}
            className={field.key === "lineSummary" ? "sm:col-span-2" : ""}
          >
            <span className="text-sm font-semibold text-foreground">{field.label}</span>
            {field.key === "lineSummary" ? (
              <textarea
                id={`${id}-${field.key}`}
                value={side.fields[field.key]}
                onChange={(event) => onFieldChange(field.key, event.target.value)}
                className={`${INPUT_CLASS} mt-2 min-h-28 resize-y`}
                placeholder="Confirmed line descriptions or summaries"
              />
            ) : (
              <input
                id={`${id}-${field.key}`}
                type="text"
                value={side.fields[field.key]}
                onChange={(event) => onFieldChange(field.key, event.target.value)}
                className={`${INPUT_CLASS} mt-2`}
                autoComplete="off"
              />
            )}
          </label>
        ))}
      </div>

      <label
        htmlFor={`${id}-reviewed`}
        className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface-soft p-4"
      >
        <input
          id={`${id}-reviewed`}
          type="checkbox"
          checked={side.reviewed}
          onChange={(event) => onReviewedChange(event.target.checked)}
          className="mt-1 h-4 w-4 rounded-sm border-border accent-primary focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)]"
        />
        <span>
          <span className="font-semibold text-foreground">
            I reviewed these extracted fields against the original invoice
          </span>
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
            This confirms only the transcription above—not authenticity, sender
            identity, legitimacy or payment safety.
          </span>
        </span>
      </label>
    </section>
  );
}

function MetricCard({ detail, icon: Icon, label, tone = "primary", value }) {
  const toneClass =
    tone === "warning"
      ? "text-warning"
      : tone === "success"
        ? "text-success"
        : "text-primary";
  return (
    <article className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className={`mt-1 text-2xl font-bold ${toneClass}`}>
            {value.toLocaleString("en-US")}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
        </div>
      </div>
    </article>
  );
}

function ChangeCard({ comparison }) {
  const routingChange = comparison.attention === "payment-routing";
  const message =
    comparison.state === "added"
      ? "Only the newer invoice has a confirmed value."
      : comparison.state === "removed"
        ? "Only the earlier invoice has a confirmed value."
        : "The two confirmed values are different.";

  return (
    <article
      className={`rounded-lg border p-4 ${
        routingChange
          ? "border-warning bg-warning-soft"
          : "border-border bg-surface"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-foreground">{comparison.label}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{message}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            routingChange
              ? "bg-warning-soft text-warning"
              : "bg-primary-soft text-primary"
          }`}
        >
          {comparison.state}
        </span>
      </div>
      {routingChange ? (
        <p className="mt-3 text-xs leading-5 text-foreground">
          Payment-routing change: independently verify it through a previously known
          contact channel before acting.
        </p>
      ) : null}
    </article>
  );
}

export default function InvoiceFraudChangeInspector() {
  const baselinePdfRef = useRef(null);
  const currentPdfRef = useRef(null);
  const [sides, setSides] = useState({
    baseline: emptySide(),
    current: emptySide(),
  });
  const [pdfBusy, setPdfBusy] = useState("");
  const [error, setError] = useState("");
  const [comparison, setComparison] = useState(null);

  function updateSide(sideKey, updates) {
    setSides((current) => ({
      ...current,
      [sideKey]: { ...current[sideKey], ...updates },
    }));
  }

  function updateSource(sideKey, source) {
    updateSide(sideKey, {
      fields: createEmptyInvoiceFields(),
      notices: [],
      reviewed: false,
      source,
    });
    setComparison(null);
    setError("");
  }

  function extractSide(sideKey) {
    const extracted = extractInvoiceFields(sides[sideKey].source);
    updateSide(sideKey, {
      fields: extracted.fields,
      notices: extracted.warnings,
      reviewed: false,
    });
    setComparison(null);
    setError("");
  }

  async function handlePdf(sideKey, event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setPdfBusy(sideKey);
    setError("");
    try {
      const pdfResult = await extractTextBasedInvoicePdf(file);
      const extracted = extractInvoiceFields(pdfResult.text);
      updateSide(sideKey, {
        fields: extracted.fields,
        notices: [...pdfResult.warnings, ...extracted.warnings],
        reviewed: false,
        source: pdfResult.text,
      });
      setComparison(null);
    } catch (pdfError) {
      updateSide(sideKey, {
        notices: [
          pdfError instanceof Error
            ? pdfError.message
            : "The PDF text layer could not be read locally.",
        ],
        reviewed: false,
      });
      setComparison(null);
    } finally {
      setPdfBusy("");
    }
  }

  function updateField(sideKey, fieldKey, value) {
    setSides((current) => ({
      ...current,
      [sideKey]: {
        ...current[sideKey],
        fields: { ...current[sideKey].fields, [fieldKey]: value },
        reviewed: false,
      },
    }));
    setComparison(null);
    setError("");
  }

  function loadSample() {
    const baseline = extractInvoiceFields(BASELINE_SAMPLE);
    const current = extractInvoiceFields(CURRENT_SAMPLE);
    setSides({
      baseline: {
        fields: baseline.fields,
        notices: baseline.warnings,
        reviewed: false,
        source: BASELINE_SAMPLE,
      },
      current: {
        fields: current.fields,
        notices: current.warnings,
        reviewed: false,
        source: CURRENT_SAMPLE,
      },
    });
    setComparison(null);
    setError("");
  }

  function clearAll() {
    setSides({ baseline: emptySide(), current: emptySide() });
    setComparison(null);
    setError("");
  }

  function runComparison() {
    if (!sides.baseline.reviewed || !sides.current.reviewed) {
      setError(
        "Review and confirm the extracted fields for both invoices before comparing them.",
      );
      setComparison(null);
      return;
    }
    if (
      !countPresentFields(sides.baseline.fields) ||
      !countPresentFields(sides.current.fields)
    ) {
      setError("Each invoice needs at least one confirmed field before comparison.");
      setComparison(null);
      return;
    }

    setComparison(
      compareInvoiceFields(
        sides.baseline.fields,
        sides.current.fields,
        {
          baseline: sides.baseline.reviewed,
          current: sides.current.reviewed,
        },
      ),
    );
    setError("");
  }

  function downloadReport() {
    if (!comparison) return;
    const report = buildCountsOnlyChangeReport(comparison);
    const url = URL.createObjectURL(
      new Blob([report], { type: "application/json;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "altftool-invoice-change-counts.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  const changes = comparison?.comparisons.filter((field) =>
    ["added", "changed", "removed"].includes(field.state),
  );

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 text-foreground sm:px-6 sm:pt-10 lg:px-8">
      <header className="rounded-xl border border-border bg-surface p-5 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <ScanSearch aria-hidden="true" className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
          Invoice Fraud Change Inspector
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
          Compare confirmed invoice references, identities, payment-routing details,
          amounts and line summaries. The result reports observable changes only—it
          never declares an invoice fraudulent or legitimate.
        </p>
        <div className="mx-auto mt-5 flex max-w-3xl items-start gap-3 rounded-lg border border-success bg-success-soft p-4 text-left">
          <LockKeyhole
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-success"
          />
          <div>
            <p className="font-semibold text-foreground">
              Local comparison with no raw-value export
            </p>
            <p className="mt-1 text-sm leading-6 text-foreground">
              Invoice text stays in this tab. Nothing is uploaded, sent over a
              network, stored, or used to contact a vendor or bank. Reports contain
              aggregate change counts—not invoice numbers, tax IDs, bank details,
              UPI IDs, amounts or line descriptions.
            </p>
          </div>
        </div>
      </header>

      <section className="mt-6 grid gap-6 xl:grid-cols-2" aria-label="Invoice sources">
        <SourcePanel
          id="baseline"
          title="Earlier or trusted invoice"
          side={sides.baseline}
          busy={pdfBusy === "baseline"}
          pdfInputRef={baselinePdfRef}
          onSourceChange={(value) => updateSource("baseline", value)}
          onExtract={() => extractSide("baseline")}
          onPdf={(event) => handlePdf("baseline", event)}
        />
        <SourcePanel
          id="current"
          title="New invoice to inspect"
          side={sides.current}
          busy={pdfBusy === "current"}
          pdfInputRef={currentPdfRef}
          onSourceChange={(value) => updateSource("current", value)}
          onExtract={() => extractSide("current")}
          onPdf={(event) => handlePdf("current", event)}
        />
      </section>

      <section className="tool-card mt-6" aria-label="Source controls">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Info
              aria-hidden="true"
              className="mt-0.5 h-5 w-5 shrink-0 text-primary"
            />
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              PDF support reads an existing text layer locally. It does not use OCR,
              inspect images, logos or signatures, or detect visual tampering.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn-secondary" onClick={loadSample}>
              <FileText aria-hidden="true" className="h-4 w-4" />
              Load safe sample
            </button>
            <button type="button" className="btn-secondary" onClick={clearAll}>
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>
      </section>

      {(countPresentFields(sides.baseline.fields) > 0 ||
        countPresentFields(sides.current.fields) > 0) ? (
        <>
          <section className="mt-6 grid gap-6 xl:grid-cols-2" aria-label="Manual field review">
            <FieldEditor
              id="baseline-fields"
              title="Confirm earlier invoice fields"
              side={sides.baseline}
              onFieldChange={(field, value) =>
                updateField("baseline", field, value)
              }
              onReviewedChange={(reviewed) => {
                updateSide("baseline", { reviewed });
                setComparison(null);
                setError("");
              }}
            />
            <FieldEditor
              id="current-fields"
              title="Confirm new invoice fields"
              side={sides.current}
              onFieldChange={(field, value) =>
                updateField("current", field, value)
              }
              onReviewedChange={(reviewed) => {
                updateSide("current", { reviewed });
                setComparison(null);
                setError("");
              }}
            />
          </section>

          <section className="tool-card mt-6" aria-label="Comparison controls">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                Comparison results show field names and change states only. Raw values
                remain in the editable forms above.
              </p>
              <button type="button" className="btn-primary" onClick={runComparison}>
                <ArrowLeftRight aria-hidden="true" className="h-4 w-4" />
                Compare confirmed fields
              </button>
            </div>

            {error ? (
              <div
                role="alert"
                className="mt-5 flex items-start gap-3 rounded-lg border border-danger bg-danger-soft p-4"
              >
                <AlertTriangle
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-danger"
                />
                <p className="text-sm leading-6 text-foreground">{error}</p>
              </div>
            ) : null}
          </section>
        </>
      ) : null}

      {comparison ? (
        <div aria-live="polite">
          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              icon={ListChecks}
              label="Fields reviewed"
              value={comparison.summary.comparedFields}
              detail="Supported comparison fields"
            />
            <MetricCard
              icon={ArrowLeftRight}
              label="Observable changes"
              value={
                comparison.summary.added +
                comparison.summary.changed +
                comparison.summary.removed
              }
              detail="Added, removed or different"
              tone="warning"
            />
            <MetricCard
              icon={Landmark}
              label="Routing changes"
              value={comparison.summary.paymentRoutingChanges}
              detail="Bank, IBAN or UPI fields"
              tone="warning"
            />
            <MetricCard
              icon={CheckCircle2}
              label="Unchanged"
              value={comparison.summary.unchanged}
              detail="Normalized confirmed values match"
              tone="success"
            />
            <MetricCard
              icon={Info}
              label="Unavailable"
              value={comparison.summary.unavailable}
              detail="No confirmed value on either side"
            />
          </section>

          {comparison.summary.paymentRoutingChanges ? (
            <section className="mt-6 rounded-xl border border-warning bg-warning-soft p-5">
              <div className="flex items-start gap-3">
                <Landmark
                  aria-hidden="true"
                  className="mt-0.5 h-6 w-6 shrink-0 text-warning"
                />
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Payment-routing details changed
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-foreground">
                    This is not proof of fraud or malicious intent. Before paying,
                    verify the new details through a previously known phone number,
                    portal or contact—not a channel supplied only in the new invoice.
                  </p>
                </div>
              </div>
            </section>
          ) : null}

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <section className="tool-card" aria-labelledby="changes-title">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                  <ArrowLeftRight aria-hidden="true" className="h-5 w-5" />
                </span>
                <div>
                  <h2 id="changes-title" className="text-2xl font-bold text-foreground">
                    Observable changes
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Values are deliberately hidden from this result view.
                  </p>
                </div>
              </div>

              {changes.length ? (
                <div className="mt-5 space-y-3">
                  {changes.map((change) => (
                    <ChangeCard key={change.key} comparison={change} />
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-lg border border-success bg-success-soft p-5 text-center">
                  <CheckCircle2
                    aria-hidden="true"
                    className="mx-auto h-6 w-6 text-success"
                  />
                  <p className="mt-2 font-semibold text-foreground">
                    No supported confirmed field changed after normalization.
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This does not establish authenticity or payment safety.
                  </p>
                </div>
              )}
            </section>

            <section className="tool-card" aria-labelledby="report-title">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                  <Download aria-hidden="true" className="h-5 w-5" />
                </span>
                <div>
                  <h2 id="report-title" className="text-2xl font-bold text-foreground">
                    Counts-only report
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Safe summary without filenames, field values or line descriptions.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-lg border border-border bg-surface-soft p-4">
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Added values</dt>
                    <dd className="mt-1 text-lg font-bold text-foreground">
                      {comparison.summary.added}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Different values</dt>
                    <dd className="mt-1 text-lg font-bold text-foreground">
                      {comparison.summary.changed}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Removed values</dt>
                    <dd className="mt-1 text-lg font-bold text-foreground">
                      {comparison.summary.removed}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Routing changes</dt>
                    <dd className="mt-1 text-lg font-bold text-foreground">
                      {comparison.summary.paymentRoutingChanges}
                    </dd>
                  </div>
                </dl>
              </div>

              <button
                type="button"
                className="btn-primary mt-5 w-full"
                onClick={downloadReport}
              >
                <Download aria-hidden="true" className="h-4 w-4" />
                Download change counts
              </button>
            </section>
          </div>
        </div>
      ) : (
        <section className="mt-6 rounded-xl border border-dashed border-border bg-surface p-8 text-center">
          <ArrowLeftRight aria-hidden="true" className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 text-xl font-bold text-foreground">
            Confirm both invoices to compare
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Extract fields, correct them against the originals, check both review
            confirmations, and then compare the confirmed values.
          </p>
        </section>
      )}

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="tool-card">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-warning-soft text-warning">
              <AlertTriangle aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                What this comparison cannot establish
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Treat every extraction and change as a review prompt, not a verdict.
              </p>
            </div>
          </div>
          <ul className="mt-5 space-y-3">
            {[
              "It cannot identify a sender, authenticate a document, prove intent, or decide whether an invoice is fraudulent or legitimate.",
              "It does not inspect email headers, digital signatures, PDF metadata, logos, typography, images or visual alterations.",
              "Label and JSON-key extraction is heuristic. Locale-specific dates, number formats, currencies and unusual layouts can be misread.",
              "A missing or unchanged field does not prove it is safe, complete or correctly extracted.",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-lg bg-surface-soft p-3 text-sm leading-6 text-foreground"
              >
                <Info
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-warning"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="tool-card">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
              <ShieldCheck aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                PDF and OCR coverage
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                PDF extraction is bounded to 8 MB, 20 pages and 250,000 text
                characters.
              </p>
            </div>
          </div>
          <ul className="mt-5 space-y-3">
            {[
              "Only embedded PDF text is read locally. Scanned and image-only invoices are not OCR-processed.",
              "Run OCR separately for scans, paste the reviewed output, and expect recognition errors in account numbers, dates and totals.",
              "Complex tables can lose reading order during PDF text extraction; confirm every field and line summary against the visible invoice.",
              "Verify any payment-detail change using a previously known independent channel before transferring funds.",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-lg bg-surface-soft p-3 text-sm leading-6 text-foreground"
              >
                <CheckCircle2
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
