"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArchiveX,
  BarChart3,
  CheckCircle2,
  Database,
  Download,
  FileJson,
  FileSearch,
  FileText,
  FolderSearch,
  HardDrive,
  Info,
  ListTree,
  LoaderCircle,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Tags,
  Upload,
} from "lucide-react";

import {
  analyzeExportFile,
  createMetadataReport,
  detectExportFormat,
  formatBytes,
  summarizeExportAudit,
} from "../lib/auditExport.mjs";

const MAX_FILES = 24;
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_TOTAL_BYTES = 24 * 1024 * 1024;

const STATUS_STYLES = {
  analyzed: "bg-success-soft text-success",
  invalid: "bg-danger-soft text-danger",
  partial: "bg-warning-soft text-warning",
  "read-error": "bg-danger-soft text-danger",
  "too-large": "bg-warning-soft text-warning",
  unsupported: "bg-surface-soft text-muted-foreground",
};

const STATUS_LABELS = {
  analyzed: "Analyzed",
  invalid: "Invalid",
  partial: "Partial",
  "read-error": "Read error",
  "too-large": "Too large",
  unsupported: "Not opened",
};

const SAMPLE_JSON = JSON.stringify({
  locationHistory: [
    {
      deviceInformation: { deviceId: "sample-device" },
      latitude: 0,
      longitude: 0,
    },
  ],
  security: {
    sessions: [{ loginTime: "2026-07-24T00:00:00Z" }],
  },
});
const SAMPLE_CSV =
  "contact_id,message_thread,ad_interests\nsample-contact,sample-thread,technology\n";
const SAMPLE_TEXT = "Synthetic activity line\nAnother synthetic activity line\n";

function MetricCard({ detail, icon: Icon, label, value }) {
  return (
    <article className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {value.toLocaleString("en-US")}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
        </div>
      </div>
    </article>
  );
}

function FileIcon({ kind }) {
  const Icon = kind === "json" ? FileJson : kind === "archive" ? ArchiveX : FileText;
  return <Icon aria-hidden="true" className="h-5 w-5" />;
}

function FileResult({ file }) {
  const statusStyle = STATUS_STYLES[file.parseStatus] ?? STATUS_STYLES.unsupported;
  const statusLabel = STATUS_LABELS[file.parseStatus] ?? "Needs review";

  return (
    <article className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
            <FileIcon kind={file.kind} />
          </span>
          <div className="min-w-0">
            <h3 className="break-all text-sm font-bold text-foreground">{file.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {file.format} · {formatBytes(file.size)}
            </p>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle}`}
        >
          {statusLabel}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-3 rounded-lg bg-surface-soft p-3 text-center">
        <div>
          <dt className="text-xs text-muted-foreground">Records</dt>
          <dd className="mt-1 font-bold text-foreground">
            {file.recordCount.toLocaleString("en-US")}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Fields</dt>
          <dd className="mt-1 font-bold text-foreground">
            {file.fieldCount.toLocaleString("en-US")}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Unique keys</dt>
          <dd className="mt-1 font-bold text-foreground">
            {file.uniqueFieldCount.toLocaleString("en-US")}
          </dd>
        </div>
      </dl>

      {file.categories.length ? (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Category signals
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {file.categories.map((category) => (
              <span
                key={category.id}
                className="rounded-full border border-border bg-primary-soft px-3 py-1 text-xs font-semibold text-primary"
              >
                {category.label}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {file.schemaFields.length ? (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Schema sample
          </p>
          <ul className="mt-2 space-y-1 font-mono text-xs text-muted-foreground">
            {file.schemaFields.slice(0, 4).map((field) => (
              <li key={field} className="break-all rounded-md bg-surface-soft px-3 py-2">
                {field}
              </li>
            ))}
          </ul>
          {file.schemaFields.length > 4 ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {file.schemaFields.length - 4} more schema path
              {file.schemaFields.length - 4 === 1 ? "" : "s"} are included in the
              metadata report.
            </p>
          ) : null}
        </div>
      ) : null}

      {file.warnings.length ? (
        <ul className="mt-4 space-y-2">
          {file.warnings.map((warning) => (
            <li
              key={warning}
              className="flex items-start gap-2 rounded-md bg-warning-soft p-3 text-xs leading-5 text-foreground"
            >
              <AlertTriangle
                aria-hidden="true"
                className="mt-0.5 h-4 w-4 shrink-0 text-warning"
              />
              <span>{warning}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export default function PersonalDataExportAuditor() {
  const fileInputRef = useRef(null);
  const [analyses, setAnalyses] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const audit = useMemo(() => summarizeExportAudit(analyses), [analyses]);

  async function handleFiles(event) {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!selectedFiles.length) return;

    if (selectedFiles.length > MAX_FILES) {
      setError(`Choose no more than ${MAX_FILES} files at once.`);
      return;
    }

    const totalBytes = selectedFiles.reduce((total, file) => total + file.size, 0);
    if (totalBytes > MAX_TOTAL_BYTES) {
      setError(
        `The selected batch is ${formatBytes(totalBytes)}. Keep each batch at or below ${formatBytes(MAX_TOTAL_BYTES)}.`,
      );
      return;
    }

    setBusy(true);
    setError("");

    try {
      const nextAnalyses = [];

      for (const file of selectedFiles) {
        const format = detectExportFormat(file.name, file.type);
        const descriptor = {
          name: file.name,
          size: file.size,
          text: "",
          type: file.type,
        };

        if (
          ["json", "csv", "txt"].includes(format.kind) &&
          file.size <= MAX_FILE_BYTES
        ) {
          try {
            descriptor.text = await file.text();
          } catch {
            const unreadable = analyzeExportFile(descriptor, {
              maxTextCharacters: MAX_FILE_BYTES,
            });
            nextAnalyses.push({
              ...unreadable,
              parseStatus: "read-error",
              warnings: ["The browser could not read this file. No contents were retained."],
            });
            continue;
          }
        }

        nextAnalyses.push(
          analyzeExportFile(descriptor, {
            maxTextCharacters: MAX_FILE_BYTES,
          }),
        );
      }

      setAnalyses(nextAnalyses);
    } finally {
      setBusy(false);
    }
  }

  function loadSample() {
    const sampleFiles = [
      {
        name: "Location History.json",
        size: SAMPLE_JSON.length,
        text: SAMPLE_JSON,
        type: "application/json",
      },
      {
        name: "Meta Activity.csv",
        size: SAMPLE_CSV.length,
        text: SAMPLE_CSV,
        type: "text/csv",
      },
      {
        name: "messages-summary.txt",
        size: SAMPLE_TEXT.length,
        text: SAMPLE_TEXT,
        type: "text/plain",
      },
    ];
    setAnalyses(
      sampleFiles.map((file) =>
        analyzeExportFile(file, { maxTextCharacters: MAX_FILE_BYTES }),
      ),
    );
    setError("");
  }

  function reset() {
    setAnalyses([]);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function downloadReport() {
    if (!analyses.length) return;
    const report = createMetadataReport(audit);
    const url = URL.createObjectURL(
      new Blob([report], { type: "application/json;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "altftool-personal-data-export-audit.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 text-foreground sm:px-6 sm:pt-10 lg:px-8">
      <header className="rounded-xl border border-border bg-surface p-5 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <FolderSearch aria-hidden="true" className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
          Personal Data Export Auditor
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
          Inventory Google, Meta and similar JSON, CSV or TXT exports, then map
          schema-only signals for sensitive data categories without revealing the
          source values.
        </p>
        <div className="mx-auto mt-5 flex max-w-3xl items-start gap-3 rounded-lg border border-success bg-success-soft p-4 text-left">
          <LockKeyhole
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-success"
          />
          <div>
            <p className="font-semibold text-foreground">Local and ephemeral</p>
            <p className="mt-1 text-sm leading-6 text-foreground">
              Files are read in this browser tab only. Nothing is uploaded, sent to
              an AI service, saved to storage or kept after you close or refresh the
              page. Source text is discarded after its counts and schema metadata are
              calculated.
            </p>
          </div>
        </div>
      </header>

      <section className="tool-card mt-6" aria-labelledby="export-input-title">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
              <Upload aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 id="export-input-title" className="text-2xl font-bold text-foreground">
                Select extracted export files
              </h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
                Choose up to {MAX_FILES} JSON, CSV or TXT files. Each file can be up
                to {formatBytes(MAX_FILE_BYTES)} and each batch up to{" "}
                {formatBytes(MAX_TOTAL_BYTES)}.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <input
              ref={fileInputRef}
              id="personal-export-files"
              type="file"
              multiple
              accept=".json,.csv,.txt,.zip,.tar,.gz,.tgz,.rar,.7z,application/json,text/csv,text/plain"
              onChange={handleFiles}
              className="sr-only"
            />
            <button
              type="button"
              className="btn-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload aria-hidden="true" className="h-4 w-4" />
              Choose files
            </button>
            <button type="button" className="btn-secondary" onClick={loadSample}>
              <FileSearch aria-hidden="true" className="h-4 w-4" />
              Load safe sample
            </button>
            {analyses.length ? (
              <button type="button" className="btn-secondary" onClick={reset}>
                <RotateCcw aria-hidden="true" className="h-4 w-4" />
                Clear
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-lg border border-warning bg-warning-soft p-4">
          <ArchiveX
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-warning"
          />
          <div>
            <p className="font-semibold text-foreground">Archives are never opened</p>
            <p className="mt-1 text-sm leading-6 text-foreground">
              ZIP, TAR, GZ, RAR and 7Z files are inventoried as unsupported only.
              Extract the archive yourself and select just the files you want audited.
            </p>
          </div>
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

        {busy ? (
          <div
            role="status"
            aria-live="polite"
            className="mt-5 flex items-center gap-3 rounded-lg bg-surface-soft p-4 text-sm font-semibold text-foreground"
          >
            <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin text-primary" />
            Building the local metadata inventory…
          </div>
        ) : null}
      </section>

      {analyses.length ? (
        <div aria-live="polite">
          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={HardDrive}
              label="Files inventoried"
              value={audit.summary.fileCount}
              detail={`${formatBytes(audit.summary.totalBytes)} selected`}
            />
            <MetricCard
              icon={Tags}
              label="Category signals"
              value={audit.summary.detectedCategories}
              detail="Keyword-based schema inferences"
            />
            <MetricCard
              icon={Database}
              label="Records counted"
              value={audit.summary.recordCount}
              detail="JSON records, CSV rows and TXT lines"
            />
            <MetricCard
              icon={ListTree}
              label="Fields counted"
              value={audit.summary.fieldCount}
              detail="JSON properties and CSV row cells"
            />
          </section>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <section className="tool-card min-w-0" aria-labelledby="inventory-title">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 id="inventory-title" className="text-2xl font-bold text-foreground">
                    File inventory
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    File names, types, sizes and structural counts only.
                  </p>
                </div>
                <button type="button" className="btn-primary" onClick={downloadReport}>
                  <Download aria-hidden="true" className="h-4 w-4" />
                  Download metadata report
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {analyses.map((file, index) => (
                  <FileResult key={`${file.name}-${index}`} file={file} />
                ))}
              </div>
            </section>

            <div className="space-y-6">
              <section className="tool-card" aria-labelledby="categories-title">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                    <BarChart3 aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <div>
                    <h2
                      id="categories-title"
                      className="text-2xl font-bold text-foreground"
                    >
                      Detected category signals
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Matches come from file names, JSON keys and CSV headers—not
                      stored field values.
                    </p>
                  </div>
                </div>

                {audit.categories.length ? (
                  <div className="mt-5 space-y-3">
                    {audit.categories.map((category) => (
                      <article
                        key={category.id}
                        className="rounded-lg border border-border bg-surface p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-bold text-foreground">{category.label}</h3>
                          <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                            {category.fileCount} file
                            {category.fileCount === 1 ? "" : "s"}
                          </span>
                        </div>
                        <ul className="mt-3 space-y-2 text-xs leading-5 text-muted-foreground">
                          {category.evidence.slice(0, 4).map((entry) => (
                            <li key={entry} className="break-all">
                              {entry}
                            </li>
                          ))}
                        </ul>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-lg border border-dashed border-border bg-surface-soft p-5 text-center">
                    <Info aria-hidden="true" className="mx-auto h-5 w-5 text-primary" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No supported category keywords were found in the available
                      schema metadata.
                    </p>
                  </div>
                )}
              </section>

              <section className="tool-card" aria-labelledby="limits-title">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-warning-soft text-warning">
                    <ShieldCheck aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 id="limits-title" className="text-2xl font-bold text-foreground">
                      Read the result carefully
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      This is an inventory aid, not a compliance certification or a
                      complete privacy assessment.
                    </p>
                  </div>
                </div>

                <ul className="mt-5 space-y-3">
                  {[
                    "A category match signals a relevant key name; it does not prove what a service collected, inferred, shared or secured.",
                    "JSON property names are inspected. CSV assumes the first non-empty row is a comma-delimited header.",
                    "TXT contents are not classified; the tool only counts non-empty lines and characters.",
                    "Binary, encrypted and archived content is not opened. Deep or very large structures can be partially counted at safe limits.",
                    "A missing category can mean different naming, unsupported formats or incomplete export coverage—not that the data is absent.",
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
              </section>
            </div>
          </div>
        </div>
      ) : (
        <section className="mt-6 rounded-xl border border-dashed border-border bg-surface p-8 text-center">
          <FileSearch aria-hidden="true" className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 text-xl font-bold text-foreground">
            Your local audit will appear here
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Start with a small set of extracted export files or load the synthetic
            sample to see the metadata-only report structure.
          </p>
        </section>
      )}
    </main>
  );
}
