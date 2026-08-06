"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  Clock3,
  Copy,
  Download,
  EyeOff,
  FileJson,
  FileText,
  FlaskConical,
  LockKeyhole,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";
import {
  anonymizeChat,
  buildLinePreview,
  buildPrivacyReport,
} from "../lib/anonymizeChat.mjs";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

const SAMPLE_CHAT = `[24/07/2026, 10:04 AM] Asha Mehta: Hi Kabir, email me at asha@example.com.
[24/07/2026, 10:05 AM] Kabir Shah: I will call +91 98765 43210.
[24/07/2026, 10:06 AM] Asha Mehta: Track customer ID: CUST-7788 at https://example.com/cases/7788.
[24/07/2026, 10:08 AM] Kabir Shah: Thanks, Asha.`;

const FORMAT_LABELS = {
  text: "TXT",
  json: "JSON",
  csv: "CSV",
};

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

function ActionButton({ children, icon: Icon, onClick, disabled = false, primary = false }) {
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

function SummaryCard({ label, count, unique }) {
  return (
    <article className="rounded-lg border border-border bg-surface-soft p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-black leading-none text-foreground">{count}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        {unique} unique {unique === 1 ? "value" : "values"}
      </p>
    </article>
  );
}

export default function ChatExportAnonymizer() {
  const [source, setSource] = useState("");
  const [format, setFormat] = useState("auto");
  const [removeTimestamps, setRemoveTimestamps] = useState(true);
  const [replaceParticipants, setReplaceParticipants] = useState(true);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [copyState, setCopyState] = useState("idle");
  const fileInputRef = useRef(null);

  const analysis = useMemo(() => {
    try {
      return {
        result: anonymizeChat(source, {
          format,
          removeTimestamps,
          replaceParticipants,
        }),
        error: "",
      };
    } catch (error) {
      return {
        result: null,
        error: error instanceof Error ? error.message : "This chat export could not be read.",
      };
    }
  }, [format, removeTimestamps, replaceParticipants, source]);

  const preview = useMemo(
    () => buildLinePreview(source, analysis.result?.output ?? "", { format: analysis.result?.format }),
    [analysis.result?.format, analysis.result?.output, source],
  );

  const visibleSummary = analysis.result?.summary.filter((item) => item.count > 0) ?? [];

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > MAX_FILE_BYTES) {
      setFileError("Choose a TXT, JSON, or CSV file smaller than 5 MB.");
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!["txt", "json", "csv"].includes(extension ?? "")) {
      setFileError("Only TXT, JSON, and CSV chat exports are supported.");
      return;
    }

    try {
      const contents = await file.text();
      setSource(contents);
      setFileName(file.name);
      setFormat(extension === "txt" ? "text" : extension);
      setFileError("");
      setCopyState("idle");
    } catch {
      setFileError("This file could not be read in your browser.");
    }
  };

  const handleCopy = async () => {
    const success = await safeCopyText(analysis.result?.output ?? "");
    setCopyState(success ? "copied" : "failed");
    window.setTimeout(() => setCopyState("idle"), 2000);
  };

  const handleDownload = () => {
    if (!analysis.result) return;
    const extension = analysis.result.format === "text" ? "txt" : analysis.result.format;
    const mediaType =
      analysis.result.format === "json"
        ? "application/json;charset=utf-8"
        : analysis.result.format === "csv"
          ? "text/csv;charset=utf-8"
          : "text/plain;charset=utf-8";

    downloadText(
      analysis.result.output,
      `anonymized-chat.${extension}`,
      mediaType,
    );
  };

  const clearAll = () => {
    setSource("");
    setFileName("");
    setFileError("");
    setCopyState("idle");
  };

  const privacyReport = analysis.result ? buildPrivacyReport(analysis.result) : null;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 text-foreground sm:px-6 sm:pt-10 lg:px-8">
      <header className="tool-card overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Chat Export Anonymizer
                </h1>
                <span className="rounded-pill border border-border bg-surface-soft px-3 py-1 text-xs font-bold text-muted-foreground">
                  Local privacy
                </span>
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Replace participant labels, contact details, links, and identifiers before sharing
                a chat export with another person or service.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Privacy guarantees">
            {[
              ["Runs locally", LockKeyhole],
              ["No upload", EyeOff],
              ["No history", FileText],
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
        aria-label="Review reminder"
      >
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-foreground">
          <strong>Review the preview before sharing.</strong> Detection is deliberately
          conservative, so unusual names or custom identifiers can remain. The source is processed
          only in this browser tab.
        </p>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <section className="tool-card min-w-0 p-5 sm:p-6 xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
                Chat export
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Paste content or choose a TXT, JSON, or CSV file up to 5 MB.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.json,.csv,text/plain,application/json,text/csv"
                onChange={handleFile}
                className="sr-only"
                aria-label="Choose chat export file"
              />
              <ActionButton icon={Upload} onClick={() => fileInputRef.current?.click()}>
                Choose file
              </ActionButton>
              <ActionButton
                icon={FlaskConical}
                onClick={() => {
                  setSource(SAMPLE_CHAT);
                  setFormat("text");
                  setFileName("");
                  setFileError("");
                }}
              >
                Load demo
              </ActionButton>
              <ActionButton icon={Trash2} onClick={clearAll} disabled={!source}>
                Clear
              </ActionButton>
            </div>
          </div>

          {fileName ? (
            <p className="mt-3 text-xs font-semibold text-primary" aria-live="polite">
              Loaded locally: {fileName}
            </p>
          ) : null}
          {fileError ? (
            <p
              className="mt-3 rounded-md border border-danger bg-danger-soft p-3 text-sm text-foreground"
              role="alert"
            >
              {fileError}
            </p>
          ) : null}

          <label htmlFor="chat-source" className="sr-only">
            Chat export contents
          </label>
          <textarea
            id="chat-source"
            value={source}
            onChange={(event) => {
              setSource(event.target.value);
              setFileName("");
            }}
            spellCheck="false"
            placeholder="Paste a chat export here. Processing starts locally as you type."
            className="mt-4 min-h-80 w-full resize-y rounded-md border border-border bg-background p-4 font-mono text-sm leading-relaxed text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-[3px] focus:ring-primary/35"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{source.length.toLocaleString("en-IN")} characters</span>
            <span>Nothing is uploaded or saved</span>
          </div>
        </section>

        <aside className="tool-card h-fit p-5 sm:p-6">
          <h2 className="text-lg font-bold text-foreground">Anonymization settings</h2>

          <label htmlFor="chat-format" className="mt-5 block text-sm font-bold text-foreground">
            Input format
          </label>
          <select
            id="chat-format"
            value={format}
            onChange={(event) => setFormat(event.target.value)}
            className="mt-2 min-h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/35"
          >
            <option value="auto">Detect automatically</option>
            <option value="text">TXT / plain text</option>
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
          </select>

          <div className="mt-5 space-y-3">
            <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface-soft p-3">
              <input
                type="checkbox"
                checked={replaceParticipants}
                onChange={(event) => setReplaceParticipants(event.target.checked)}
                className="mt-1 h-4 w-4 rounded-sm border-border text-primary focus:ring-primary"
              />
              <span>
                <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Users className="h-4 w-4 text-primary" aria-hidden="true" />
                  Replace participants
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  Uses stable labels such as Person 1 across the export.
                </span>
              </span>
            </label>

            <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface-soft p-3">
              <input
                type="checkbox"
                checked={removeTimestamps}
                onChange={(event) => setRemoveTimestamps(event.target.checked)}
                className="mt-1 h-4 w-4 rounded-sm border-border text-primary focus:ring-primary"
              />
              <span>
                <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Clock3 className="h-4 w-4 text-primary" aria-hidden="true" />
                  Remove timestamps
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  Clears common time fields and line prefixes while preserving message order.
                </span>
              </span>
            </label>
          </div>

          <div className="mt-5 rounded-lg border border-border bg-primary-soft p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-foreground">
              <LockKeyhole className="h-4 w-4 text-primary" aria-hidden="true" />
              Safe summary only
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Detection summaries contain counts, never the original chat or matched values.
            </p>
          </div>
        </aside>
      </div>

      {analysis.error ? (
        <section
          className="mt-6 rounded-lg border border-danger bg-danger-soft p-4"
          role="alert"
        >
          <p className="font-bold text-foreground">The selected format could not be processed.</p>
          <p className="mt-1 text-sm text-muted-foreground">{analysis.error}</p>
        </section>
      ) : null}

      {analysis.result && source ? (
        <>
          <section className="mt-6 tool-card p-5 sm:p-6" aria-labelledby="summary-heading">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 id="summary-heading" className="text-lg font-bold text-foreground">
                  Privacy summary
                </h2>
                <p className="mt-1 text-sm text-muted-foreground" aria-live="polite">
                  {analysis.result.totalChanges.toLocaleString("en-IN")} replacements in{" "}
                  {FORMAT_LABELS[analysis.result.format]} output. The summary has no raw chat data.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <ActionButton icon={copyState === "copied" ? Check : Copy} onClick={handleCopy}>
                  {copyState === "copied"
                    ? "Copied"
                    : copyState === "failed"
                      ? "Copy failed"
                      : "Copy output"}
                </ActionButton>
                <ActionButton icon={Download} onClick={handleDownload} primary>
                  Download anonymized
                </ActionButton>
              </div>
            </div>

            {visibleSummary.length ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {visibleSummary.map((item) => (
                  <SummaryCard
                    key={item.kind}
                    label={item.label}
                    count={item.count}
                    unique={item.unique}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-lg border border-border bg-surface-soft p-4">
                <p className="text-sm font-bold text-foreground">No supported patterns found</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  The output is unchanged. Check uncommon names and organization-specific IDs
                  manually.
                </p>
              </div>
            )}
          </section>

          <section className="mt-6 tool-card overflow-hidden" aria-labelledby="preview-heading">
            <div className="border-b border-border p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 id="preview-heading" className="text-lg font-bold text-foreground">
                    Side-by-side preview
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Changed lines are highlighted. Both columns remain only in this tab.
                  </p>
                </div>
                <span className="rounded-pill border border-border bg-surface-soft px-3 py-1 text-xs font-bold text-muted-foreground">
                  {preview.totalLines.toLocaleString("en-IN")} lines
                </span>
              </div>
            </div>

            <div className="grid border-b border-border bg-surface-soft text-xs font-bold uppercase tracking-wide text-muted-foreground sm:grid-cols-2">
              <div className="border-b border-border px-4 py-3 sm:border-b-0 sm:border-r">
                Original
              </div>
              <div className="px-4 py-3">Anonymized</div>
            </div>

            <div className="max-h-96 overflow-auto">
              {preview.rows.map((row) => (
                <div
                  key={row.number}
                  className={`grid border-b border-border last:border-b-0 sm:grid-cols-2 ${
                    row.changed ? "bg-warning-soft" : "bg-surface"
                  }`}
                >
                  <pre className="min-w-0 whitespace-pre-wrap break-words border-b border-border p-4 font-mono text-xs leading-relaxed text-foreground sm:border-b-0 sm:border-r">
                    <span className="mr-3 select-none text-muted-foreground" aria-hidden="true">
                      {row.number}
                    </span>
                    {row.original || " "}
                  </pre>
                  <pre className="min-w-0 whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed text-foreground">
                    <span className="mr-3 select-none text-muted-foreground" aria-hidden="true">
                      {row.number}
                    </span>
                    {row.anonymized || " "}
                  </pre>
                </div>
              ))}
            </div>

            {preview.truncated ? (
              <p className="border-t border-border bg-surface-soft p-3 text-center text-xs text-muted-foreground">
                Preview limited to the first 120 lines. The download includes the complete export.
              </p>
            ) : null}
          </section>

          <section className="mt-6 grid gap-4 md:grid-cols-3" aria-label="How privacy is handled">
            {[
              {
                icon: Users,
                title: "Stable pseudonyms",
                text: "Repeated labels receive the same Person number without exposing a mapping.",
              },
              {
                icon: FileJson,
                title: "Structure preserved",
                text: "JSON keys and CSV columns remain usable after sensitive values are replaced.",
              },
              {
                icon: ShieldCheck,
                title: "Metadata-only report",
                text: `${privacyReport?.totalChanges ?? 0} changes are counted without retaining raw matches.`,
              },
            ].map(({ icon: Icon, title, text }) => (
              <article key={title} className="tool-card p-5">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                <h3 className="mt-3 font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </article>
            ))}
          </section>
        </>
      ) : null}
    </main>
  );
}
