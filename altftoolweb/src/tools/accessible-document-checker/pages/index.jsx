"use client";

import { useMemo, useRef, useState } from "react";
import {
  Accessibility,
  AlertTriangle,
  CheckCircle2,
  Download,
  ExternalLink,
  Eye,
  FileCheck2,
  FileUp,
  Info,
  RefreshCw,
  SearchCheck,
  ShieldCheck,
} from "lucide-react";

import {
  DOCUMENT_LIMITS,
  buildAccessibilityCountsReport,
  inspectDocumentBytes,
  validateDocumentFile,
} from "../lib/documentAccessibility.mjs";

const SOURCES = [
  {
    title: "W3C — WCAG 2.2 techniques, including PDF techniques",
    href: "https://www.w3.org/WAI/WCAG22/Techniques/",
  },
  {
    title: "W3C Understanding SC 1.3.1 — Info and Relationships",
    href: "https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html",
  },
  {
    title: "W3C Understanding SC 3.1.1 — Language of Page",
    href: "https://www.w3.org/WAI/WCAG22/Understanding/language-of-page",
  },
  {
    title: "W3C Understanding SC 2.4.2 — Page Titled",
    href: "https://www.w3.org/WAI/WCAG22/Understanding/page-titled",
  },
];

const STATUS_STYLE = {
  present: "border-success bg-success-soft text-success",
  review: "border-warning bg-warning-soft text-warning",
  manual: "border-info bg-info-soft text-info",
};

function formatBytes(value) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function downloadJson(value) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "document-accessibility-cues-counts-only.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function AccessibleDocumentChecker() {
  const fileInputRef = useRef(null);
  const generationRef = useRef(0);
  const busyRef = useRef(false);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const report = useMemo(
    () => buildAccessibilityCountsReport(result),
    [result],
  );

  const clear = () => {
    generationRef.current += 1;
    busyRef.current = false;
    setFile(null);
    setResult(null);
    setError("");
    setBusy(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const chooseFile = (nextFile) => {
    if (!nextFile || busyRef.current) return;
    const validation = validateDocumentFile(nextFile);
    setResult(null);
    setError("");
    if (!validation.ok) {
      setFile(null);
      setError(validation.error);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setFile(nextFile);
  };

  const inspect = async () => {
    if (!file || busyRef.current) return;
    const generation = generationRef.current + 1;
    generationRef.current = generation;
    busyRef.current = true;
    setBusy(true);
    setResult(null);
    setError("");
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const next = await inspectDocumentBytes(bytes, {
        fileName: file.name,
        fileSize: file.size,
      });
      if (generation !== generationRef.current) return;
      if (!next.ok) {
        setError(next.error);
        return;
      }
      setResult(next);
    } catch {
      if (generation === generationRef.current) {
        setError("The document could not be inspected locally.");
      }
    } finally {
      if (generation === generationRef.current) {
        busyRef.current = false;
        setBusy(false);
      }
    }
  };

  return (
    <div className="tool-shell space-y-6">
      <header className="tool-hero">
        <div className="tool-hero-icon" aria-hidden="true">
          <Accessibility className="h-6 w-6" />
        </div>
        <div>
          <h1 className="tool-title">Accessible Document Checker</h1>
          <p className="tool-description">
            Screen a PDF, DOCX, XLSX, or PPTX for observable accessibility
            metadata and structure cues before completing a human review in the
            authoring app and assistive technology.
          </p>
        </div>
      </header>

      <div className="rounded-lg border border-primary/30 bg-primary-soft p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck
            className="mt-0.5 h-5 w-5 shrink-0 text-primary"
            aria-hidden="true"
          />
          <div>
            <p className="font-bold text-foreground">
              Local, static, and intentionally limited
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              The document stays in this tab. Macros, links, embedded content,
              and document code are never run. PDF checks are bounded raw-marker
              scans; Office checks inspect selected XML package parts.
            </p>
          </div>
        </div>
      </div>

      <section className="tool-card p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <label className="text-sm font-bold text-foreground">
              Document file
            </label>
            <button
              type="button"
              className="mt-2 flex min-h-28 w-full items-center gap-4 rounded-lg border border-dashed border-border-strong bg-surface-soft p-4 text-left transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
              disabled={busy}
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="rounded-lg bg-primary-soft p-3 text-primary">
                <FileUp className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-bold text-foreground">
                  {file ? file.name : "Choose PDF, DOCX, XLSX, or PPTX"}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {file
                    ? `${formatBytes(file.size)} • ready for local inspection`
                    : `Maximum ${DOCUMENT_LIMITS.fileBytes / (1024 * 1024)} MB`}
                </span>
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.xlsx,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              className="sr-only"
              aria-label="Choose PDF or modern Office document"
              disabled={busy}
              onChange={(event) => chooseFile(event.target.files?.[0])}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="btn-primary"
              disabled={!file || busy}
              onClick={inspect}
            >
              <SearchCheck className="h-4 w-4" aria-hidden="true" />
              {busy ? "Inspecting…" : "Inspect locally"}
            </button>
            <button type="button" className="btn-secondary" onClick={clear}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Clear
            </button>
          </div>
        </div>
      </section>

      {error ? (
        <div
          className="rounded-lg border border-danger bg-danger-soft p-4 text-sm text-danger"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            />
            <span>{error}</span>
          </div>
        </div>
      ) : null}

      {result ? (
        <>
          <section className="tool-card p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                  <FileCheck2
                    className="h-5 w-5 text-primary"
                    aria-hidden="true"
                  />
                  {result.formatLabel} screening summary
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {result.statusCounts.present} marker-present •{" "}
                  {result.statusCounts.review} review cue •{" "}
                  {result.statusCounts.manual} manual-only
                </p>
              </div>
              <button
                type="button"
                className="btn-secondary"
                disabled={!report}
                onClick={() => downloadJson(report)}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Export counts-only JSON
              </button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                ["Marker present", result.statusCounts.present],
                ["Needs review", result.statusCounts.review],
                ["Manual only", result.statusCounts.manual],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-border bg-surface-soft p-4"
                >
                  <p className="text-xs font-bold text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1 text-2xl font-black text-foreground">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            {result.checks.map((item) => (
              <article key={item.id} className="tool-card p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {item.status === "present" ? (
                      <CheckCircle2
                        className="mt-0.5 h-5 w-5 shrink-0 text-success"
                        aria-hidden="true"
                      />
                    ) : item.status === "review" ? (
                      <Eye
                        className="mt-0.5 h-5 w-5 shrink-0 text-warning"
                        aria-hidden="true"
                      />
                    ) : (
                      <Info
                        className="mt-0.5 h-5 w-5 shrink-0 text-info"
                        aria-hidden="true"
                      />
                    )}
                    <div>
                      <h3 className="font-bold text-foreground">
                        {item.label}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-1 text-xs font-black uppercase ${STATUS_STYLE[item.status]}`}
                  >
                    {item.status}
                  </span>
                </div>
              </article>
            ))}
          </section>

          {result.warnings.length ? (
            <section className="rounded-lg border border-warning bg-warning-soft p-4">
              <h2 className="font-bold text-foreground">
                Inspection completeness
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {result.warnings.map((warning) => (
                  <li key={warning} className="flex items-start gap-2">
                    <AlertTriangle
                      className="mt-0.5 h-4 w-4 shrink-0 text-warning"
                      aria-hidden="true"
                    />
                    {warning}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="tool-card p-4 sm:p-5">
            <h2 className="flex items-center gap-2 font-bold text-foreground">
              <Info className="h-5 w-5 text-primary" aria-hidden="true" />
              What this result does not prove
            </h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
              {result.limitations.map((limitation) => (
                <li key={limitation}>• {limitation}</li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              The exported report excludes the file name, document text,
              metadata values, XML, and binary content.
            </p>
          </section>
        </>
      ) : null}

      <section className="tool-card p-4 sm:p-5">
        <h2 className="flex items-center gap-2 font-bold text-foreground">
          <Info className="h-5 w-5 text-primary" aria-hidden="true" />
          Standards context
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          WCAG is technology-neutral, while format techniques are examples and
          not a complete test method. Apply the relevant standard and test the
          final document with real assistive technology. References accessed 24
          July 2026.
        </p>
        <ul className="mt-4 space-y-2">
          {SOURCES.map((source) => (
            <li key={source.href}>
              <a
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-primary underline-offset-4 hover:underline"
              >
                {source.title}
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
