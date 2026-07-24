"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  ClipboardCopy,
  Download,
  EyeOff,
  FileJson,
  FileLock2,
  FileText,
  FlaskConical,
  Info,
  LoaderCircle,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Upload,
} from "lucide-react";

import { safeCopyText } from "@/shared/utils/clipboard";
import {
  buildCountsOnlyReport,
  DEFAULT_ENABLED_CATEGORIES,
  deidentifyMedicalText,
  IDENTIFIER_CATEGORIES,
} from "../lib/deidentify.mjs";

const MAX_FILE_BYTES = 15 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = new Set(["txt", "docx", "pdf"]);

const DEMO_REPORT = `Patient name: Asha Mehta
MRN: MH-204991
DOB: 12/08/1993
Phone: +91 98765 43210
Email: asha.mehta@example.com
Address: 14 Lake View Road, Pune 411001
Visit date: 24 July 2026
Physician: Dr. Nisha Rao
Hospital: North Star Medical Centre

Clinical note:
The patient attended a routine follow-up. This synthetic example contains no real medical data.`;

const primaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-colors hover:border-border-strong hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60";

function extensionOf(filename = "") {
  return filename.split(".").pop()?.toLocaleLowerCase("en") || "";
}

function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function safeBaseName(filename = "") {
  return (
    filename
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70) || "medical-report"
  );
}

function downloadText(contents, filename, type) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function extractDocx(file) {
  const mammothModule = await import("mammoth/mammoth.browser.js");
  const mammoth = mammothModule.default || mammothModule;
  const result = await mammoth.extractRawText({
    arrayBuffer: await file.arrayBuffer(),
  });

  return {
    kind: "DOCX",
    notices: (result.messages || []).map((message) => message.message),
    text: result.value,
  };
}

async function extractTextPdf(file) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/altflovepdf/pdf.worker.min.mjs";
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    isEvalSupported: false,
    useWorkerFetch: false,
  });
  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;
  const pages = [];

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      try {
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item) => `${item.str || ""}${item.hasEOL ? "\n" : " "}`)
          .join("")
          .replace(/[ \t]+\n/g, "\n")
          .replace(/[ \t]{2,}/g, " ")
          .trim();
        if (pageText) pages.push(`Page ${pageNumber}\n${pageText}`);
      } finally {
        page.cleanup();
      }
    }
  } finally {
    await pdf.destroy();
  }

  const text = pages.join("\n\n");
  if (text.replace(/\s/g, "").length < 10) {
    throw new Error(
      "No usable text layer was found. Scanned or image-only PDFs are not supported; run OCR first, then paste the reviewed text.",
    );
  }

  return {
    kind: `text PDF (${totalPages} page${totalPages === 1 ? "" : "s"})`,
    notices: [],
    text,
  };
}

async function extractLocalFile(file) {
  const extension = extensionOf(file.name);
  if (!ACCEPTED_EXTENSIONS.has(extension)) {
    throw new Error("Choose a TXT, DOCX, or text-based PDF file.");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("This file is larger than the 15 MB local-processing limit.");
  }

  if (extension === "txt") {
    return { kind: "TXT", notices: [], text: await file.text() };
  }
  if (extension === "docx") return extractDocx(file);
  return extractTextPdf(file);
}

function Metric({ detail, label, value }) {
  return (
    <article className="rounded-lg border border-border bg-surface-soft p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black leading-none text-foreground">
        {value}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {detail}
      </p>
    </article>
  );
}

export default function MedicalReportDeIdentifier() {
  const fileInputRef = useRef(null);
  const [source, setSource] = useState("");
  const [sourceKind, setSourceKind] = useState("pasted text");
  const [sourceName, setSourceName] = useState("medical-report");
  const [enabledCategories, setEnabledCategories] = useState(
    DEFAULT_ENABLED_CATEGORIES,
  );
  const [fileState, setFileState] = useState({
    busy: false,
    error: "",
    notice: "",
  });
  const [copyState, setCopyState] = useState("idle");

  const result = useMemo(
    () => deidentifyMedicalText(source, { enabledCategories }),
    [enabledCategories, source],
  );

  const countsReport = useMemo(
    () =>
      buildCountsOnlyReport(result, {
        enabledCategories,
        sourceKind,
      }),
    [enabledCategories, result, sourceKind],
  );

  const toggleCategory = (categoryId) => {
    setEnabledCategories((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    );
  };

  const handleFile = async (file) => {
    if (!file) return;
    setFileState({ busy: true, error: "", notice: "" });
    setCopyState("idle");

    try {
      const extracted = await extractLocalFile(file);
      setSource(extracted.text);
      setSourceKind(extracted.kind);
      setSourceName(safeBaseName(file.name));
      setFileState({
        busy: false,
        error: "",
        notice: extracted.notices.filter(Boolean).join(" "),
      });
    } catch (error) {
      setFileState({
        busy: false,
        error:
          error instanceof Error
            ? error.message
            : "The file could not be read locally.",
        notice: "",
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCopy = async () => {
    const copied = await safeCopyText(result.output);
    setCopyState(copied ? "copied" : "failed");
    window.setTimeout(() => setCopyState("idle"), 2000);
  };

  const clearAll = () => {
    setSource("");
    setSourceKind("pasted text");
    setSourceName("medical-report");
    setFileState({ busy: false, error: "", notice: "" });
    setCopyState("idle");
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 text-foreground sm:px-6 sm:pt-10 lg:px-8">
      <header className="tool-card overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <FileLock2 className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Medical Report De-identifier
                </h1>
                <span className="rounded-pill border border-border bg-surface-soft px-3 py-1 text-xs font-bold text-muted-foreground">
                  Local privacy helper
                </span>
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Replace common patient, contact, clinician, facility, and date
                identifiers before sharing a text copy of a medical report.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Privacy properties">
            {[
              ["Runs locally", LockKeyhole],
              ["No upload", EyeOff],
              ["No saved report", ShieldCheck],
            ].map(([label, Icon]) => (
              <span
                key={label}
                className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-border bg-surface-soft px-3 text-xs font-bold text-foreground"
              >
                <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </header>

      <section
        className="mt-6 flex items-start gap-3 rounded-lg border border-warning bg-warning-soft p-4"
        aria-label="Important limitations"
      >
        <AlertTriangle
          className="mt-0.5 h-5 w-5 shrink-0 text-warning"
          aria-hidden="true"
        />
        <div className="text-sm leading-relaxed text-foreground">
          <p className="font-bold">Always review every replacement.</p>
          <p className="mt-1">
            Pattern matching cannot guarantee complete de-identification or
            legal compliance. This is not medical advice and does not diagnose,
            interpret, or change clinical content. Scanned/image-only PDFs and
            handwritten text are not supported.
          </p>
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <section className="tool-card min-w-0 p-5 sm:p-6 xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
                Report text
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Paste text or extract it locally from TXT, DOCX, or a text-based
                PDF.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.docx,.pdf,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="sr-only"
                id="medical-report-file"
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
              <label
                htmlFor="medical-report-file"
                className={`${secondaryButton} ${
                  fileState.busy ? "pointer-events-none opacity-60" : "cursor-pointer"
                }`}
              >
                {fileState.busy ? (
                  <LoaderCircle
                    className="h-4 w-4 animate-spin motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                ) : (
                  <Upload className="h-4 w-4" aria-hidden="true" />
                )}
                {fileState.busy ? "Reading locally…" : "Choose file"}
              </label>
              <button
                type="button"
                className={secondaryButton}
                onClick={() => {
                  setSource(DEMO_REPORT);
                  setSourceKind("synthetic demo");
                  setSourceName("medical-report-demo");
                  setFileState({ busy: false, error: "", notice: "" });
                }}
              >
                <FlaskConical className="h-4 w-4" aria-hidden="true" />
                Load demo
              </button>
              <button
                type="button"
                className={secondaryButton}
                onClick={clearAll}
                disabled={!source && !fileState.error}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Clear
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-pill border border-border bg-surface-soft px-3 py-1.5 font-semibold">
              TXT · DOCX · text PDF
            </span>
            <span>Maximum {formatBytes(MAX_FILE_BYTES)} · processed in this browser</span>
          </div>

          {fileState.error ? (
            <div
              className="mt-4 flex items-start gap-2 rounded-md border border-danger bg-danger-soft p-3 text-sm text-foreground"
              role="alert"
            >
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0 text-danger"
                aria-hidden="true"
              />
              {fileState.error}
            </div>
          ) : null}

          {fileState.notice ? (
            <div
              className="mt-4 flex items-start gap-2 rounded-md border border-info bg-info-soft p-3 text-sm text-foreground"
              role="status"
            >
              <Info
                className="mt-0.5 h-4 w-4 shrink-0 text-info"
                aria-hidden="true"
              />
              DOCX extraction notice: {fileState.notice}
            </div>
          ) : null}

          <label
            htmlFor="medical-report-source"
            className="mt-4 block text-sm font-bold text-foreground"
          >
            Source text
          </label>
          <textarea
            id="medical-report-source"
            value={source}
            onChange={(event) => {
              setSource(event.target.value);
              setSourceKind("pasted or edited text");
              setSourceName("medical-report");
              setCopyState("idle");
            }}
            spellCheck="false"
            placeholder="Paste report text here. Nothing is uploaded or stored."
            className="mt-2 min-h-80 w-full resize-y rounded-md border border-border bg-background p-4 font-mono text-sm leading-relaxed text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary"
          />
          <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
            <span>Source: {sourceKind}</span>
            <span>{source.length.toLocaleString("en-IN")} characters in memory</span>
          </div>
        </section>

        <aside className="tool-card min-w-0 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <SlidersHorizontal
                  className="h-5 w-5 text-primary"
                  aria-hidden="true"
                />
                Identifier categories
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Select what should be replaced.
              </p>
            </div>
            <span className="rounded-pill bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
              {enabledCategories.length}/{IDENTIFIER_CATEGORIES.length}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className={secondaryButton}
              onClick={() =>
                setEnabledCategories(IDENTIFIER_CATEGORIES.map(({ id }) => id))
              }
              disabled={
                enabledCategories.length === IDENTIFIER_CATEGORIES.length
              }
            >
              Select all
            </button>
            <button
              type="button"
              className={secondaryButton}
              onClick={() => setEnabledCategories([])}
              disabled={!enabledCategories.length}
            >
              Select none
            </button>
          </div>

          <fieldset className="mt-4 space-y-2">
            <legend className="sr-only">Identifiers to replace</legend>
            {IDENTIFIER_CATEGORIES.map((category) => {
              const checked = enabledCategories.includes(category.id);
              return (
                <label
                  key={category.id}
                  className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-border bg-surface-soft p-3 transition-colors hover:border-primary"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCategory(category.id)}
                    className="mt-0.5 h-5 w-5 shrink-0 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-foreground">
                      {category.label}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                      {category.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </fieldset>
        </aside>
      </div>

      <section className="tool-card mt-6 min-w-0 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
              Anonymized preview
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Stable placeholders keep repeated identifiers consistent.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={secondaryButton}
              onClick={handleCopy}
              disabled={!result.output}
            >
              {copyState === "copied" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ClipboardCopy className="h-4 w-4" aria-hidden="true" />
              )}
              {copyState === "copied"
                ? "Copied"
                : copyState === "failed"
                  ? "Copy failed"
                  : "Copy text"}
            </button>
            <button
              type="button"
              className={primaryButton}
              disabled={!result.output}
              onClick={() =>
                downloadText(
                  result.output,
                  `${sourceName}-anonymized.txt`,
                  "text/plain;charset=utf-8",
                )
              }
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download TXT
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Metric
            label="Replacements"
            value={result.total}
            detail="Every detected occurrence"
          />
          <Metric
            label="Unique values"
            value={result.uniqueValues}
            detail="Stable placeholder sequences"
          />
          <Metric
            label="Categories found"
            value={result.summary.length}
            detail="Enabled identifier types detected"
          />
        </div>

        <label
          htmlFor="medical-report-output"
          className="mt-5 block text-sm font-bold text-foreground"
        >
          Reviewable output
        </label>
        <textarea
          id="medical-report-output"
          readOnly
          value={result.output}
          placeholder="Anonymized text appears here."
          className="mt-2 min-h-80 w-full resize-y rounded-md border border-border bg-surface-soft p-4 font-mono text-sm leading-relaxed text-foreground shadow-sm outline-none focus:ring-2 focus:ring-primary"
        />

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface-soft p-4">
            <h3 className="text-sm font-bold text-foreground">
              Counts-only report
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              This report contains category counts and settings only—never the
              source text, filename, or detected values.
            </p>
            {result.summary.length ? (
              <ul className="mt-3 space-y-2" aria-label="Replacement counts">
                {result.summary.map((item) => (
                  <li
                    key={item.category}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-foreground">{item.label}</span>
                    <span className="rounded-pill border border-border bg-surface px-2.5 py-1 text-xs font-bold text-foreground">
                      {item.count}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                No selected identifiers detected yet.
              </p>
            )}
            <button
              type="button"
              className={`${secondaryButton} mt-4`}
              disabled={!source}
              onClick={() =>
                downloadText(
                  JSON.stringify(countsReport, null, 2),
                  `${sourceName}-counts-only.json`,
                  "application/json;charset=utf-8",
                )
              }
            >
              <FileJson className="h-4 w-4" aria-hidden="true" />
              Download counts JSON
            </button>
          </div>

          <div className="rounded-lg border border-info bg-info-soft p-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Info className="h-4 w-4 text-info" aria-hidden="true" />
              Before you share
            </h3>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-foreground">
              <li>• Read the full output and check names in unlabelled prose.</li>
              <li>• Check rare identifier formats and dates written in other languages.</li>
              <li>• Confirm the remaining clinical text is appropriate to disclose.</li>
              <li>• Use your organization’s approved privacy process for regulated data.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
