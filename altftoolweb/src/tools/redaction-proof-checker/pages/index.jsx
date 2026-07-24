"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  Download,
  Eye,
  FileImage,
  FileSearch,
  FileText,
  Info,
  LoaderCircle,
  LockKeyhole,
  RotateCcw,
  ScanSearch,
  ShieldAlert,
  Upload,
} from "lucide-react";

import { safeCopyText } from "@/shared/utils/clipboard";
import { createDownloadReport } from "../lib/evaluateEvidence.mjs";
import { inspectFile } from "../lib/inspectFile";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const VERDICT_STYLES = {
  high: {
    className: "border-[var(--danger)] bg-[var(--danger-soft)]",
    iconClassName: "text-[var(--danger)]",
    Icon: ShieldAlert,
  },
  review: {
    className: "border-[var(--warning)] bg-[var(--warning-soft)]",
    iconClassName: "text-[var(--warning)]",
    Icon: AlertTriangle,
  },
  limited: {
    className: "border-[var(--success)] bg-[var(--success-soft)]",
    iconClassName: "text-[var(--success)]",
    Icon: CheckCircle2,
  },
};

const FINDING_STYLES = {
  high: {
    className: "border-l-[var(--danger)]",
    badgeClassName: "bg-[var(--danger-soft)] text-[var(--danger)]",
    label: "High risk",
  },
  review: {
    className: "border-l-[var(--warning)]",
    badgeClassName: "bg-[var(--warning-soft)] text-[var(--foreground)]",
    label: "Review",
  },
};

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** unitIndex;
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function downloadJson(filename, value) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function Section({ title, description, children }) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-bold text-[var(--foreground)]">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{description}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function FindingCard({ finding }) {
  const style = FINDING_STYLES[finding.severity] || FINDING_STYLES.review;

  return (
    <article
      className={`rounded-lg border border-[var(--border)] border-l-4 bg-[var(--background)] p-4 ${style.className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-[var(--foreground)]">{finding.title}</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{finding.detail}</p>
        </div>
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${style.badgeClassName}`}
        >
          {style.label}
        </span>
      </div>
      <div className="mt-3 rounded-md bg-[var(--section-highlight)] px-3 py-2 text-sm text-[var(--foreground)]">
        <span className="font-bold">Next step:</span> {finding.action}
      </div>
    </article>
  );
}

function EvidenceMetrics({ result }) {
  const metrics =
    result.kind === "pdf"
      ? [
          ["Pages", result.evidence.pageCount],
          ["Extracted text", `${result.evidence.extractedCharacters.toLocaleString()} chars`],
          ["Annotations", result.evidence.annotationCount],
          ["Image operations", result.evidence.imageCount],
        ]
      : [
          ["Dimensions", `${result.evidence.width} × ${result.evidence.height}`],
          ["Pixels inspected", result.evidence.totalPixels.toLocaleString()],
          ["Transparent", `${(result.evidence.transparencyRatio * 100).toFixed(2)}%`],
          ["Dark-band rows", result.evidence.darkBandRows],
        ];

  return (
    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map(([label, value]) => (
        <div
          key={label}
          className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
        >
          <dt className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
            {label}
          </dt>
          <dd className="mt-2 break-words text-lg font-bold text-[var(--foreground)]">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function RedactionProofChecker() {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const report = useMemo(
    () => (file && result ? createDownloadReport(file, result) : null),
    [file, result],
  );

  const selectFile = (nextFile) => {
    setResult(null);
    setError("");
    setCopied(false);

    if (!nextFile) {
      setFile(null);
      return;
    }

    if (nextFile.size > MAX_FILE_SIZE) {
      setFile(null);
      setError("Choose a file smaller than 50 MB so it can be inspected safely in this tab.");
      return;
    }

    const isPdf =
      nextFile.type === "application/pdf" || nextFile.name.toLowerCase().endsWith(".pdf");
    const isSupportedImage = ["image/png", "image/jpeg", "image/webp"].includes(nextFile.type);

    if (!isPdf && !isSupportedImage) {
      setFile(null);
      setError("Unsupported format. Choose a PDF, PNG, JPEG, or WebP file.");
      return;
    }

    setFile(nextFile);
  };

  const runInspection = async (event) => {
    event.preventDefault();
    if (!file || busy) return;
    setBusy(true);
    setResult(null);
    setError("");

    try {
      setResult(await inspectFile(file));
    } catch (inspectionError) {
      const message = String(inspectionError?.message || "");
      setError(
        /password/i.test(message)
          ? "This PDF is password protected. Open an authorized copy first, then inspect the exported file."
          : "The file could not be inspected. It may be damaged, unsupported, or too complex for this browser.",
      );
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError("");
    setCopied(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const copyReport = async () => {
    if (!report) return;
    const didCopy = await safeCopyText(JSON.stringify(report, null, 2));
    setCopied(didCopy);
    if (didCopy) window.setTimeout(() => setCopied(false), 1400);
  };

  const exportReport = () => {
    if (!report) return;
    const baseName = file.name.replace(/\.[^.]+$/, "") || "redaction-check";
    downloadJson(`${baseName}-redaction-check.json`, report);
  };

  const verdictStyle = result ? VERDICT_STYLES[result.verdict.level] : null;
  const VerdictIcon = verdictStyle?.Icon;

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
      <header className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary)]">
              <ScanSearch className="h-4 w-4" aria-hidden="true" />
              Local evidence check
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl">
              Redaction Proof Checker
            </h1>
            <p className="mt-3 text-base leading-7 text-[var(--muted-foreground)]">
              Inspect an already-redacted PDF or image for exposed text, annotations, metadata,
              embedded content, transparency, and visual warning signs before you share it.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--primary)] bg-[var(--primary-soft)] p-4 lg:max-w-sm">
            <p className="flex items-center gap-2 font-bold text-[var(--foreground)]">
              <LockKeyhole className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
              Files stay in this browser tab
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              No upload, account, or server processing. Closing or refreshing the tab clears the
              selected file and report.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.42fr)]">
        <Section
          title="Choose the final redacted file"
          description="Inspect the exact export you plan to share—not the editable source."
        >
          <form onSubmit={runInspection}>
            <label
              htmlFor="redaction-proof-file"
              className="flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border-strong)] bg-[var(--background)] p-6 text-center transition hover:border-[var(--primary)] focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/20"
            >
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
                {file?.type.startsWith("image/") ? (
                  <FileImage className="h-6 w-6" aria-hidden="true" />
                ) : file ? (
                  <FileText className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Upload className="h-6 w-6" aria-hidden="true" />
                )}
              </span>
              <span className="mt-4 font-bold text-[var(--foreground)]">
                {file ? file.name : "Select a PDF or image"}
              </span>
              <span className="mt-1 text-sm text-[var(--muted-foreground)]">
                {file ? `${formatBytes(file.size)} · ready for local inspection` : "PDF, PNG, JPEG, or WebP · up to 50 MB"}
              </span>
              <input
                ref={fileInputRef}
                id="redaction-proof-file"
                type="file"
                accept=".pdf,image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(event) => selectFile(event.target.files?.[0] || null)}
              />
            </label>

            {error ? (
              <p
                className="mt-4 rounded-lg border border-[var(--danger)] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="submit"
                className="btn-primary inline-flex min-h-11 items-center justify-center gap-2 px-5"
                disabled={!file || busy}
              >
                {busy ? (
                  <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                ) : (
                  <FileSearch className="h-4 w-4" aria-hidden="true" />
                )}
                {busy ? "Inspecting locally…" : "Check evidence"}
              </button>
              <button
                type="button"
                className="btn-secondary inline-flex min-h-11 items-center justify-center gap-2 px-5"
                onClick={reset}
                disabled={!file && !result}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Clear
              </button>
            </div>
            <p className="sr-only" aria-live="polite">
              {busy ? "File inspection in progress." : result ? "File inspection completed." : ""}
            </p>
          </form>
        </Section>

        <aside className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--foreground)]">
            <Info className="h-5 w-5 text-[var(--warning)]" aria-hidden="true" />
            What this result means
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--foreground)]">
            This is a risk-indicator report, not mathematical, legal, or forensic proof that
            redaction is safe.
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--foreground)]">
            <li className="flex gap-2">
              <Eye className="mt-1 h-4 w-4 shrink-0 text-[var(--warning)]" aria-hidden="true" />
              Images still need a careful human visual review.
            </li>
            <li className="flex gap-2">
              <FileText className="mt-1 h-4 w-4 shrink-0 text-[var(--warning)]" aria-hidden="true" />
              A black box is not safe if text remains extractable below it.
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[var(--warning)]" aria-hidden="true" />
              Use a second reviewer and a separate trusted viewer before release.
            </li>
          </ul>
        </aside>
      </div>

      {result && verdictStyle && VerdictIcon ? (
        <div className="space-y-6">
          <section
            className={`rounded-lg border p-5 shadow-sm sm:p-6 ${verdictStyle.className}`}
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <VerdictIcon
                className={`mt-0.5 h-6 w-6 shrink-0 ${verdictStyle.iconClassName}`}
                aria-hidden="true"
              />
              <div>
                <h2 className="text-xl font-bold text-[var(--foreground)]">{result.verdict.label}</h2>
                <p className="mt-1 text-sm leading-6 text-[var(--foreground)]">
                  {result.verdict.summary}
                </p>
              </div>
            </div>
          </section>

          <Section
            title="Inspection evidence"
            description="Counts describe what the browser could inspect; they do not certify what is absent."
          >
            <EvidenceMetrics result={result} />
          </Section>

          <Section
            title="Findings and next steps"
            description={`${result.findings.length} finding${result.findings.length === 1 ? "" : "s"} generated without exposing matched sensitive values in the report.`}
          >
            <div className="space-y-3">
              {result.findings.map((finding) => (
                <FindingCard key={finding.id} finding={finding} />
              ))}
            </div>
          </Section>

          <Section
            title="Report and limitations"
            description="Save an evidence summary for your review record. The selected file is never included."
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
              <ul className="space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
                {result.limitations.map((limitation) => (
                  <li key={limitation} className="flex gap-2">
                    <AlertTriangle
                      className="mt-1 h-4 w-4 shrink-0 text-[var(--warning)]"
                      aria-hidden="true"
                    />
                    {limitation}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn-secondary inline-flex min-h-11 items-center justify-center gap-2 px-4"
                  onClick={copyReport}
                >
                  <Clipboard className="h-4 w-4" aria-hidden="true" />
                  {copied ? "Copied" : "Copy JSON"}
                </button>
                <button
                  type="button"
                  className="btn-primary inline-flex min-h-11 items-center justify-center gap-2 px-4"
                  onClick={exportReport}
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download report
                </button>
              </div>
            </div>
          </Section>
        </div>
      ) : null}
    </main>
  );
}
