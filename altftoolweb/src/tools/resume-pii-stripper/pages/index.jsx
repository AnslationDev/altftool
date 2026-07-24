"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Download,
  EyeOff,
  FileDown,
  FileText,
  FileUp,
  FlaskConical,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  UserRoundX,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";
import {
  buildCountsOnlyReport,
  DEFAULT_RESUME_PII_TYPES,
  RESUME_PII_TYPES,
  stripResumePii,
} from "../lib/stripResumePii.mjs";

const SAMPLE_RESUME = `Priya Sharma
Product Designer

Email: priya.sharma@example.com
Phone: +91 98765 43210
Address: Flat 12, Lake View Road, Pune 411001
Date of Birth: 14 August 1994
LinkedIn: https://linkedin.com/in/priya-sharma
Portfolio: https://priyasharma.example
Candidate ID: CAND-20481

SUMMARY
Product designer with six years of experience building accessible mobile and web products.

EXPERIENCE
Senior Product Designer — Example Studio
Led research, prototyping, and design-system work for financial products.

EDUCATION
Bachelor of Design, 2018`;

const MAX_FILE_BYTES = 15 * 1024 * 1024;

function downloadText(contents, filename, mimeType) {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function baseFilename(value) {
  return (
    String(value || "resume")
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "resume"
  );
}

async function extractPdfText(file) {
  const pdfModule = await import(/* webpackIgnore: true */ "/altflovepdf/pdf.min.mjs");
  const pdfjs = pdfModule?.getDocument ? pdfModule : pdfModule?.default || pdfModule;
  if (pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = "/altflovepdf/pdf.worker.min.mjs";
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const document = await pdfjs.getDocument({ data: bytes }).promise;
  const pages = [];

  try {
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      let previousY = null;
      let pageText = "";

      for (const item of content.items) {
        const y = item.transform?.[5];
        if (previousY !== null && typeof y === "number" && Math.abs(y - previousY) > 5) {
          pageText += "\n";
        } else if (pageText && !pageText.endsWith("\n")) {
          pageText += " ";
        }
        pageText += item.str || "";
        previousY = typeof y === "number" ? y : previousY;
      }
      pages.push(pageText.trim());
    }
  } finally {
    await document.destroy();
  }

  return pages.filter(Boolean).join("\n\n");
}

async function extractDocxText(file) {
  const mammothModule = await import("mammoth/mammoth.browser.js");
  const mammoth = mammothModule?.default || mammothModule;
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return String(result.value || "");
}

async function extractLocalFile(file) {
  const extension = file.name.toLowerCase().split(".").pop();
  if (extension === "txt") return file.text();
  if (extension === "docx") return extractDocxText(file);
  if (extension === "pdf") return extractPdfText(file);
  throw new Error("Choose a TXT, DOCX, or PDF file.");
}

function ActionButton({
  children,
  icon: Icon,
  onClick,
  disabled = false,
  primary = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-bold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 ${
        primary
          ? "bg-primary text-primary-foreground hover:bg-primary-hover"
          : "border border-border bg-surface text-foreground hover:border-primary hover:text-primary"
      }`}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

function Metric({ label, value, detail }) {
  return (
    <article className="rounded-lg border border-border bg-surface-soft p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-black leading-none text-foreground">{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{detail}</p>
    </article>
  );
}

export default function ResumePiiStripper() {
  const [source, setSource] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [enabledTypes, setEnabledTypes] = useState(DEFAULT_RESUME_PII_TYPES);
  const [mode, setMode] = useState("placeholder");
  const [isReading, setIsReading] = useState(false);
  const [fileError, setFileError] = useState("");
  const [copyState, setCopyState] = useState("idle");
  const fileInputRef = useRef(null);

  const result = useMemo(
    () => stripResumePii(source, { enabledTypes, mode }),
    [enabledTypes, mode, source],
  );

  const handleFile = async (file) => {
    setFileError("");
    setCopyState("idle");
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setFileError("This file is larger than 15 MB. Use a smaller resume.");
      return;
    }

    setIsReading(true);
    try {
      const text = await extractLocalFile(file);
      if (!text.trim()) {
        throw new Error(
          "No selectable text was found. Scanned or image-only PDFs need OCR before this tool can read them.",
        );
      }
      setSource(text);
      setSourceName(file.name);
    } catch (error) {
      setFileError(error instanceof Error ? error.message : "The file could not be read.");
    } finally {
      setIsReading(false);
    }
  };

  const clearAll = () => {
    setSource("");
    setSourceName("");
    setFileError("");
    setCopyState("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleType = (type) => {
    setEnabledTypes((current) =>
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type],
    );
  };

  const copyOutput = async () => {
    const copied = await safeCopyText(result.output);
    setCopyState(copied ? "copied" : "failed");
    window.setTimeout(() => setCopyState("idle"), 2000);
  };

  const downloadOutput = () => {
    downloadText(
      result.output,
      `${baseFilename(sourceName)}-anonymized.txt`,
      "text/plain;charset=utf-8",
    );
  };

  const downloadReport = () => {
    downloadText(
      JSON.stringify(buildCountsOnlyReport(result, mode), null, 2),
      `${baseFilename(sourceName)}-pii-counts.json`,
      "application/json;charset=utf-8",
    );
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 text-foreground sm:px-6 sm:pt-10 lg:px-8">
      <header className="tool-card overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <UserRoundX className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Resume PII Stripper
                </h1>
                <span className="rounded-pill border border-border bg-surface-soft px-3 py-1 text-xs font-bold text-muted-foreground">
                  Blind hiring
                </span>
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Create a review-ready anonymized text copy of a resume before screening or
                sharing it with a hiring panel.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Privacy guarantees">
            {[
              ["Local processing", LockKeyhole],
              ["No file upload", EyeOff],
              ["No saved history", ShieldCheck],
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
        aria-label="Important review notice"
      >
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-foreground">
          <strong>Human review is required.</strong> Pattern matching can miss unusual names,
          identifiers, or address formats. Importing DOCX or PDF extracts plain text, so layout
          and formatting may be lost. Image-only PDFs are not supported.
        </p>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <section className="tool-card min-w-0 p-5 sm:p-6 xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <FileUp className="h-5 w-5 text-primary" aria-hidden="true" />
                Add a resume
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Paste text or open one TXT, DOCX, or text-based PDF up to 15 MB.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ActionButton
                icon={FlaskConical}
                onClick={() => {
                  setSource(SAMPLE_RESUME);
                  setSourceName("sample-resume.txt");
                  setFileError("");
                }}
              >
                Load demo
              </ActionButton>
              <ActionButton icon={Trash2} onClick={clearAll} disabled={!source && !fileError}>
                Clear
              </ActionButton>
            </div>
          </div>

          <label
            htmlFor="resume-file"
            className="mt-5 block text-xs font-bold uppercase tracking-wide text-muted-foreground"
          >
            Optional local file
          </label>
          <input
            ref={fileInputRef}
            id="resume-file"
            type="file"
            accept=".txt,text/plain,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,application/pdf"
            onChange={(event) => handleFile(event.target.files?.[0])}
            disabled={isReading}
            className="mt-2 block min-h-11 w-full cursor-pointer rounded-md border border-border bg-background text-sm text-muted-foreground shadow-sm file:mr-4 file:min-h-11 file:border-0 file:bg-primary file:px-4 file:text-sm file:font-bold file:text-primary-foreground hover:file:bg-primary-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 disabled:cursor-wait disabled:opacity-60"
          />
          <p className="mt-2 text-xs text-muted-foreground" aria-live="polite">
            {isReading
              ? "Reading the file in this browser…"
              : sourceName
                ? `Loaded locally: ${sourceName}`
                : "The selected file is read in browser memory and is not sent to a server."}
          </p>
          {fileError ? (
            <p
              className="mt-3 rounded-md border border-danger bg-danger-soft p-3 text-sm text-danger"
              role="alert"
            >
              {fileError}
            </p>
          ) : null}

          <label
            htmlFor="resume-source"
            className="mt-5 block text-xs font-bold uppercase tracking-wide text-muted-foreground"
          >
            Resume text
          </label>
          <textarea
            id="resume-source"
            value={source}
            onChange={(event) => {
              setSource(event.target.value);
              setSourceName("");
              setCopyState("idle");
            }}
            spellCheck="false"
            placeholder="Paste resume text here…"
            className="mt-2 min-h-80 w-full resize-y rounded-md border border-border bg-background p-4 font-mono text-sm leading-relaxed text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-[3px] focus:ring-primary/35"
          />
          <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
            <span>{source.length.toLocaleString("en-IN")} characters</span>
            <span>Nothing is persisted by this tool.</span>
          </div>
        </section>

        <aside className="tool-card min-w-0 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <SlidersHorizontal className="h-5 w-5 text-primary" aria-hidden="true" />
                Detection scope
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {enabledTypes.length} of {RESUME_PII_TYPES.length} checks enabled
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setEnabledTypes(
                  enabledTypes.length === RESUME_PII_TYPES.length
                    ? []
                    : [...DEFAULT_RESUME_PII_TYPES],
                )
              }
              className="min-h-11 rounded-md px-3 text-xs font-bold text-primary hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35"
            >
              {enabledTypes.length === RESUME_PII_TYPES.length ? "Clear all" : "Select all"}
            </button>
          </div>

          <fieldset className="mt-5 grid gap-2">
            <legend className="sr-only">Personal data types to strip</legend>
            {RESUME_PII_TYPES.map((type) => {
              const checked = enabledTypes.includes(type.id);
              return (
                <label
                  key={type.id}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-border bg-surface-soft px-3 py-2 text-sm text-foreground transition hover:border-primary"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleType(type.id)}
                    className="h-4 w-4 rounded-sm border-border accent-primary focus:ring-primary"
                  />
                  <span className="min-w-0 flex-1 font-medium">{type.label}</span>
                  {checked ? (
                    <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  ) : null}
                </label>
              );
            })}
          </fieldset>

          <fieldset className="mt-6">
            <legend className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Output style
            </legend>
            <div className="mt-2 grid gap-2">
              {[
                {
                  id: "placeholder",
                  label: "Stable placeholders",
                  detail: "Repeated values reuse labels such as [EMAIL_1].",
                },
                {
                  id: "remove",
                  label: "Remove detected values",
                  detail: "Deletes matches while keeping the remaining text.",
                },
              ].map((option) => (
                <label
                  key={option.id}
                  className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-md border p-3 transition ${
                    mode === option.id
                      ? "border-primary bg-primary-soft"
                      : "border-border bg-surface"
                  }`}
                >
                  <input
                    type="radio"
                    name="resume-output-mode"
                    value={option.id}
                    checked={mode === option.id}
                    onChange={() => setMode(option.id)}
                    className="mt-1 h-4 w-4 accent-primary focus:ring-primary"
                  />
                  <span>
                    <span className="block text-sm font-bold text-foreground">{option.label}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                      {option.detail}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </aside>
      </div>

      <section className="tool-card mt-6 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
              Anonymized preview
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Read every line before sharing it with a hiring reviewer.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ActionButton
              icon={copyState === "copied" ? CheckCircle2 : Copy}
              onClick={copyOutput}
              disabled={!source}
              primary
            >
              {copyState === "copied"
                ? "Copied"
                : copyState === "failed"
                  ? "Copy failed"
                  : "Copy preview"}
            </ActionButton>
            <ActionButton icon={Download} onClick={downloadOutput} disabled={!source}>
              Download TXT
            </ActionButton>
          </div>
        </div>

        <label htmlFor="resume-output" className="sr-only">
          Anonymized resume output
        </label>
        <textarea
          id="resume-output"
          value={result.output}
          readOnly
          placeholder="An anonymized preview will appear here."
          className="mt-4 min-h-80 w-full resize-y rounded-md border border-border bg-surface-soft p-4 font-mono text-sm leading-relaxed text-foreground shadow-sm outline-none focus:ring-[3px] focus:ring-primary/35"
        />
        <p className="mt-2 text-xs text-muted-foreground" aria-live="polite">
          {copyState === "copied"
            ? "Anonymized text copied."
            : copyState === "failed"
              ? "Clipboard access failed. Select and copy the preview manually."
              : "Preview output remains in this tab only."}
        </p>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <Metric
          label="Detections"
          value={result.total}
          detail="Total matches replaced or removed."
        />
        <Metric
          label="Categories"
          value={result.categoryCount}
          detail="Types of personal data found."
        />
        <Metric
          label="Checks active"
          value={enabledTypes.length}
          detail="Detection categories currently enabled."
        />
      </section>

      <section className="tool-card mt-6 overflow-hidden p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
              Counts-only report
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              This report contains counts and category names only—never the resume or matched
              values.
            </p>
          </div>
          <ActionButton icon={FileDown} onClick={downloadReport} disabled={!source}>
            Download JSON
          </ActionButton>
        </div>

        {result.summary.length ? (
          <div className="mt-4 overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-md text-left text-sm">
              <thead className="bg-surface-soft text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-bold">
                    Category
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-bold">
                    Matches
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-bold">
                    Unique
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {result.summary.map((item) => (
                  <tr key={item.type}>
                    <th scope="row" className="px-4 py-3 font-semibold text-foreground">
                      {item.label}
                    </th>
                    <td className="px-4 py-3 text-right text-foreground">{item.count}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {item.uniqueValues}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-surface-soft p-4">
            <RotateCcw className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              Add resume text to generate a counts-only detection report.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
