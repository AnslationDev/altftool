"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  Download,
  ExternalLink,
  FileCode2,
  FileSearch,
  FileUp,
  Info,
  ListChecks,
  LockKeyhole,
  Paperclip,
  RefreshCw,
  ScanSearch,
  ShieldAlert,
  Workflow,
} from "lucide-react";

import {
  PDF_ACTIVE_CONTENT_LIMITATIONS,
  buildPdfActiveContentCountsReport,
  inspectPdfActiveContentBytes,
  validatePdfActiveContentFile,
} from "../lib/pdfActiveContent.mjs";

const SOURCES = [
  {
    title: "ISO — ISO 32000-2:2020, PDF 2.0",
    href: "https://www.iso.org/standard/75839.html",
  },
  {
    title: "Adobe Acrobat SDK — PDF action types",
    href: "https://opensource.adobe.com/dc-acrobat-sdk-docs/library/pdfmark/pdfmark_Actions.html",
  },
  {
    title: "PDF Association — PDF 2.0 technical resources",
    href: "https://pdfa.org/pdf-2-0/",
  },
];

const GROUP_ICONS = {
  javascript: FileCode2,
  automaticActions: Workflow,
  launchActions: ShieldAlert,
  submissionActions: Workflow,
  externalReferences: ExternalLink,
  attachments: Paperclip,
  forms: ListChecks,
  richMedia: FileSearch,
  namedCommands: ScanSearch,
};

function downloadJson(report) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "pdf-active-content-cue-counts.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function Metric({ detail, icon: Icon, label, value }) {
  return (
    <article className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary-active">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {detail}
          </p>
        </div>
      </div>
    </article>
  );
}

function GroupCard({ group }) {
  const Icon = GROUP_ICONS[group.id] || ScanSearch;
  return (
    <article className="rounded-lg border border-border bg-surface-soft p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary-active">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-semibold text-foreground">{group.label}</h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {group.description}
            </p>
          </div>
        </div>
        <span
          className={
            group.count
              ? "rounded-full bg-warning-soft px-3 py-1 text-sm font-bold text-foreground"
              : "rounded-full bg-surface px-3 py-1 text-sm font-bold text-muted-foreground"
          }
        >
          {group.count}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {group.markers.map((marker) => (
          <span
            key={marker.name}
            className="rounded-full border border-border bg-surface px-2 py-1 font-mono text-xs text-muted-foreground"
          >
            /{marker.name}: {marker.count}
          </span>
        ))}
      </div>
    </article>
  );
}

export default function PdfActiveContentInspector() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function clear() {
    setFile(null);
    setResult(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function inspect(nextFile) {
    const validation = validatePdfActiveContentFile(nextFile);
    if (!validation.ok) {
      setFile(null);
      setResult(null);
      setError(validation.error);
      return;
    }
    setFile(nextFile);
    setResult(null);
    setError("");
    setBusy(true);
    try {
      const bytes = new Uint8Array(await nextFile.arrayBuffer());
      const next = inspectPdfActiveContentBytes(bytes, {
        fileName: nextFile.name,
        fileSize: nextFile.size,
      });
      if (!next.ok) setError(next.error);
      else setResult(next);
    } catch {
      setError("The PDF could not be inspected locally.");
    } finally {
      setBusy(false);
    }
  }

  const hasCues = Boolean(result?.summary.selectedMarkerCount);
  const hasWarnings = Boolean(result?.warnings.length);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary bg-primary-soft px-3 py-1 text-xs font-bold text-primary-active">
                <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                Local static inspection · no execution
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                PDF Active Content Inspector
              </h1>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                Count bounded lexical cues for JavaScript, automatic actions,
                launching, form submission, remote links, attachments, forms,
                rich media, and named commands without rendering the PDF or
                decoding active payloads.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface-soft p-4 text-sm text-muted-foreground lg:max-w-sm">
              <p className="flex items-start gap-2 font-semibold text-foreground">
                <ShieldAlert
                  className="mt-0.5 h-4 w-4 shrink-0 text-warning"
                  aria-hidden="true"
                />
                A cue is not a malware verdict
              </p>
              <p className="mt-2 leading-6">
                Legitimate PDFs can contain interactive features. Conversely,
                encrypted or compressed objects can hide cues from this bounded
                lexical view.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-12 lg:px-8">
        <section className="space-y-6 lg:col-span-4">
          <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <FileUp
                className="h-5 w-5 text-primary-active"
                aria-hidden="true"
              />
              Select a local PDF
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              PDF files up to 20 MB. The source remains in this tab and no
              actions, URLs, files, scripts, forms, or media are opened.
            </p>
            <label
              htmlFor="pdf-active-file"
              className="mt-5 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border-strong bg-surface-soft p-5 text-center transition-colors hover:border-primary focus-within:outline-none focus-within:shadow-[var(--anslation-ds-focus-ring)]"
            >
              <ScanSearch
                className="h-8 w-8 text-primary-active"
                aria-hidden="true"
              />
              <span className="mt-2 text-sm font-bold text-foreground">
                {busy ? "Scanning bounded syntax…" : "Choose PDF"}
              </span>
              <span className="mt-1 max-w-full truncate text-xs text-muted-foreground">
                {file?.name || "One local PDF, maximum 20 MB"}
              </span>
              <input
                ref={inputRef}
                id="pdf-active-file"
                type="file"
                accept=".pdf,application/pdf"
                className="sr-only"
                disabled={busy}
                onChange={(event) => {
                  const nextFile = event.target.files?.[0];
                  if (nextFile) void inspect(nextFile);
                }}
              />
            </label>
            {error ? (
              <div
                className="mt-4 rounded-lg border border-danger bg-danger-soft p-3 text-sm text-foreground"
                role="alert"
              >
                {error}
              </div>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  const report = buildPdfActiveContentCountsReport(result);
                  if (report) downloadJson(report);
                }}
                disabled={!result}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary-hover px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary-active focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Export counts
              </button>
              <button
                type="button"
                onClick={clear}
                disabled={busy || (!file && !error)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-soft focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Clear
              </button>
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Export includes counts, marker names, warning totals, and
              limitations—never scripts, strings, URLs, payloads, or filename.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
              <ListChecks
                className="h-5 w-5 text-primary-active"
                aria-hidden="true"
              />
              Scanner behavior
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              <li>Skips comments and string values.</li>
              <li>Skips recognizable raw stream bodies.</li>
              <li>Decodes PDF #xx escapes in name tokens.</li>
              <li>Stops at 450,000 lexical tokens.</li>
              <li>Does not decode filters or object streams.</li>
            </ul>
          </div>
        </section>

        <section className="space-y-6 lg:col-span-8" aria-live="polite">
          {!result ? (
            <div className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-border bg-surface p-8 text-center shadow-sm">
              <FileSearch
                className="h-12 w-12 text-primary-active"
                aria-hidden="true"
              />
              <h2 className="mt-4 text-xl font-bold text-foreground">
                Active-content cue map appears here
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                The scanner never renders pages or lets the PDF viewer interpret
                embedded behavior.
              </p>
            </div>
          ) : (
            <>
              <div
                className={
                  hasCues || hasWarnings
                    ? "rounded-lg border border-warning bg-warning-soft p-5 text-foreground"
                    : "rounded-lg border border-info bg-info-soft p-5 text-foreground"
                }
              >
                <div className="flex items-start gap-3">
                  {hasCues || hasWarnings ? (
                    <AlertTriangle
                      className="mt-0.5 h-5 w-5 shrink-0"
                      aria-hidden="true"
                    />
                  ) : (
                    <Info
                      className="mt-0.5 h-5 w-5 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  <div>
                    <h2 className="font-bold">
                      {hasCues
                        ? "Selected active-content cues observed"
                        : hasWarnings
                          ? "Inspection completeness needs review"
                        : "No selected active-content cue observed"}
                    </h2>
                    <p className="mt-1 text-sm leading-6">
                      {hasCues
                        ? `${result.summary.selectedMarkerCount} marker occurrence(s) appeared across ${result.summary.groupsWithCues} group(s). Presence alone does not establish execution or malicious intent.`
                        : hasWarnings
                          ? "No selected cue was observed, but one or more parser limits or opaque structures prevented a complete lexical result."
                        : "This bounded lexical result does not prove that the PDF is inactive, safe, or attachment-free."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Metric
                  icon={ShieldAlert}
                  label="Selected cues"
                  value={result.summary.selectedMarkerCount.toLocaleString(
                    "en-US",
                  )}
                  detail={`${result.summary.groupsWithCues} groups with observations`}
                />
                <Metric
                  icon={ScanSearch}
                  label="Tokens inspected"
                  value={result.summary.tokensInspected.toLocaleString("en-US")}
                  detail="Bounded lexical tokens"
                />
                <Metric
                  icon={FileCode2}
                  label="Streams skipped"
                  value={result.summary.streamsSkipped.toLocaleString("en-US")}
                  detail="Raw stream bodies not decoded"
                />
                <Metric
                  icon={FileSearch}
                  label="Opaque cues"
                  value={(
                    result.summary.encryptedCues +
                    result.summary.objectStreamCues
                  ).toLocaleString("en-US")}
                  detail="Encrypt + object-stream markers"
                />
              </div>

              <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
                <h2 className="text-lg font-bold text-foreground">
                  Cue groups
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Exact PDF name-token counts outside skipped values and
                  recognizable streams. Context and reachability are not
                  established.
                </p>
                <div className="mt-4 grid gap-3 xl:grid-cols-2">
                  {result.groups.map((group) => (
                    <GroupCard key={group.id} group={group} />
                  ))}
                </div>
              </div>

              {result.warnings.length ? (
                <div className="rounded-lg border border-warning bg-warning-soft p-5 text-foreground">
                  <h2 className="flex items-center gap-2 font-bold">
                    <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                    Completeness warnings
                  </h2>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6">
                    {result.warnings.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          )}

          <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Info
                className="h-5 w-5 text-primary-active"
                aria-hidden="true"
              />
              Scope and limitations
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
              {PDF_ACTIVE_CONTENT_LIMITATIONS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="mt-5 border-t border-border pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Primary references
              </p>
              <div className="mt-2 flex flex-col gap-2">
                {SOURCES.map((source) => (
                  <a
                    key={source.href}
                    href={source.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-semibold text-primary-active hover:underline focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)]"
                  >
                    <ExternalLink
                      className="mt-0.5 h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />
                    {source.title}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
