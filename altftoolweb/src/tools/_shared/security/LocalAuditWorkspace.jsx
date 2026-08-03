"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  Download,
  FileSearch,
  FileUp,
  LoaderCircle,
  Play,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

import { safeCopyText } from "@/shared/utils/clipboard";

const TONE_STYLES = {
  danger: {
    badge: "bg-danger-soft text-foreground",
    border: "border-danger",
    Icon: AlertTriangle,
  },
  warning: {
    badge: "bg-warning-soft text-foreground",
    border: "border-warning",
    Icon: AlertTriangle,
  },
  success: {
    badge: "bg-success-soft text-foreground",
    border: "border-success",
    Icon: CheckCircle2,
  },
  neutral: {
    badge: "bg-surface-soft text-muted-foreground",
    border: "border-border",
    Icon: FileSearch,
  },
};

function reportText(value) {
  if (!value) return "";
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 1) return "0 B";
  if (bytes < 1_024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${Math.ceil(bytes / 1_024)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

function downloadText(content, name, mime) {
  const url = URL.createObjectURL(
    new Blob([content], { type: `${mime};charset=utf-8` }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function optionDefaults(options) {
  return Object.fromEntries(
    options.map((option) => [option.key, option.defaultValue !== false]),
  );
}

function SummaryMetric({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-surface-soft p-3">
      <dt className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 break-words text-xl font-black text-foreground">
        {value}
      </dd>
    </div>
  );
}

export default function LocalAuditWorkspace({
  title,
  eyebrow = "Local security review",
  description,
  privacyNote,
  icon: ToolIcon = ShieldCheck,
  inputMode = "text",
  inputLabel = "Source text",
  inputHint,
  placeholder = "Paste text to inspect...",
  sample = "",
  sampleName = "Safe sample",
  accept = "text/plain",
  maxCharacters,
  maxTextFileBytes = 2 * 1_024 * 1_024,
  deferFileRead = false,
  readSelectedFileAsBytes = false,
  byteReadLimit,
  validateFile,
  analyze,
  summarize,
  buildReport,
  reportName = "local-audit-report.json",
  reportMime = "application/json",
  options = [],
}) {
  const fileInputRef = useRef(null);
  const operationRef = useRef(0);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState(() => optionDefaults(options));

  const view = useMemo(
    () => (result ? summarize(result) : null),
    [result, summarize],
  );
  const report = useMemo(
    () => (result ? reportText(buildReport(result)) : ""),
    [buildReport, result],
  );

  const invalidateOperation = () => {
    operationRef.current += 1;
  };

  const clearResult = () => {
    invalidateOperation();
    setResult(null);
    setError("");
    setCopied(false);
  };

  const hasUnsavedInput = () => Boolean(text.trim() || file);

  const chooseFile = async (selectedFile) => {
    if (
      selectedFile &&
      hasUnsavedInput() &&
      !window.confirm(
        "Replace the current input with the selected file? This cannot be undone.",
      )
    ) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    clearResult();
    const operation = operationRef.current;
    setFile(selectedFile || null);
    if (!selectedFile || inputMode === "file" || deferFileRead) return;
    if (selectedFile.size > maxTextFileBytes) {
      setFile(null);
      setError(
        `Choose a text file no larger than ${formatBytes(maxTextFileBytes)}.`,
      );
      return;
    }
    try {
      const nextText = await selectedFile.text();
      if (operation !== operationRef.current) return;
      if (maxCharacters && nextText.length > maxCharacters) {
        setFile(null);
        setError(
          `Text exceeds the ${maxCharacters.toLocaleString("en-US")}-character local limit.`,
        );
        return;
      }
      setText(nextText);
    } catch {
      if (operation !== operationRef.current) return;
      setFile(null);
      setError("The selected file could not be read in this browser.");
    }
  };

  const reset = () => {
    if (
      hasUnsavedInput() &&
      !window.confirm("Reset and clear the current input? This cannot be undone.")
    ) {
      return;
    }
    invalidateOperation();
    setText("");
    setFile(null);
    setResult(null);
    setError("");
    setCopied(false);
    setSettings(optionDefaults(options));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const loadSample = () => {
    if (
      hasUnsavedInput() &&
      !window.confirm(
        "Replace the current input with the sample text? This cannot be undone.",
      )
    ) {
      return;
    }
    setText(sample);
    setFile(null);
    clearResult();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const run = async () => {
    if (busy) return;
    if (inputMode === "file" && !file) {
      setError("Choose a local file before running the inspection.");
      return;
    }
    if (inputMode !== "file" && !text.trim() && !file) {
      setError("Add source text before running the inspection.");
      return;
    }

    if (file && validateFile) {
      let validation;
      try {
        validation = validateFile(file);
      } catch {
        setError("The selected file could not be validated safely.");
        return;
      }
      if (!validation?.ok) {
        setError(validation?.error || "The selected file is not supported.");
        return;
      }
    }

    const operation = operationRef.current + 1;
    operationRef.current = operation;
    setBusy(true);
    setError("");
    setCopied(false);
    try {
      await new Promise((resolve) => window.requestAnimationFrame(resolve));
      const byteSource =
        file && Number.isSafeInteger(byteReadLimit) && byteReadLimit > 0
          ? file.slice(0, byteReadLimit)
          : file;
      const bytes =
        byteSource && (inputMode === "file" || readSelectedFileAsBytes)
          ? new Uint8Array(await byteSource.arrayBuffer())
          : new Uint8Array();
      const nextResult = await analyze({
        text,
        file,
        bytes,
        options: settings,
      });
      if (operation !== operationRef.current) return;
      if (nextResult?.ok === false && nextResult?.error) {
        throw new Error(nextResult.error);
      }
      setResult(nextResult);
    } catch (runError) {
      if (operation !== operationRef.current) return;
      setResult(null);
      setError(
        runError instanceof Error
          ? runError.message
          : "The local inspection could not finish.",
      );
    } finally {
      setBusy(false);
    }
  };

  const copyReport = async () => {
    if (!report) return;
    const didCopy = await safeCopyText(report);
    setCopied(didCopy);
    if (didCopy) window.setTimeout(() => setCopied(false), 1_600);
  };

  const tone = TONE_STYLES[view?.tone] || TONE_STYLES.neutral;
  const ToneIcon = tone.Icon;
  const findings = view?.findings || [];
  const visibleFindings = findings.slice(0, 100);
  const outputPreview = String(view?.outputText || "").slice(0, 12_000);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="rounded-lg border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-active">
                <ToolIcon className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase text-primary-active">
                  {eyebrow}
                </p>
                <h1 className="mt-1 text-2xl font-black text-foreground sm:text-3xl">
                  {title}
                </h1>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {description}
            </p>
          </div>
          <aside className="rounded-lg border border-success bg-success-soft p-4 text-sm text-foreground lg:max-w-sm">
            <p className="flex items-center gap-2 font-bold text-foreground">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              Browser-only processing
            </p>
            <p className="mt-2 leading-relaxed">
              {privacyNote ||
                "Input stays in this browser tab. It is not uploaded, saved, or added to a scan history."}
            </p>
          </aside>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {inputLabel}
              </h2>
              {inputHint ? (
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {inputHint}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-bold text-foreground hover:bg-surface-soft focus-within:outline-none focus-within:shadow-[var(--anslation-ds-focus-ring)]">
                <FileUp className="h-4 w-4" aria-hidden="true" />
                Choose file
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={accept}
                  className="sr-only"
                  onChange={(event) =>
                    void chooseFile(event.target.files?.[0] || null)
                  }
                />
              </label>
              {inputMode !== "file" && sample ? (
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-bold text-foreground hover:bg-surface-soft focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)]"
                  onClick={loadSample}
                >
                  <Play className="h-4 w-4" aria-hidden="true" />
                  {sampleName}
                </button>
              ) : null}
            </div>
          </div>

          {file ? (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-surface-soft p-3">
              <FileSearch
                className="h-5 w-5 shrink-0 text-primary-active"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-foreground">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(file.size)}
                  {file.type ? ` · ${file.type}` : ""}
                </p>
              </div>
            </div>
          ) : null}

          {inputMode !== "file" ? (
            <>
              <label className="mt-4 block" htmlFor="local-audit-source">
                <span className="sr-only">{inputLabel}</span>
                <textarea
                  id="local-audit-source"
                  className="min-h-80 w-full resize-y rounded-md border border-border bg-canvas p-4 font-mono text-sm leading-relaxed text-foreground outline-none focus:border-primary focus:shadow-[var(--anslation-ds-focus-ring)]"
                  value={text}
                  maxLength={maxCharacters}
                  spellCheck={false}
                  placeholder={placeholder}
                  onChange={(event) => {
                    setText(event.target.value);
                    setFile(null);
                    clearResult();
                  }}
                />
              </label>
              <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                <span>{text.length.toLocaleString("en-US")} characters</span>
                {maxCharacters ? (
                  <span>Limit {maxCharacters.toLocaleString("en-US")}</span>
                ) : null}
              </div>
            </>
          ) : (
            <div className="mt-4 rounded-lg border border-dashed border-border bg-canvas p-8 text-center">
              <FileUp
                className="mx-auto h-9 w-9 text-primary-active"
                aria-hidden="true"
              />
              <p className="mt-3 font-bold text-foreground">
                {file
                  ? "File ready for local inspection"
                  : "Choose a local file"}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                The file is read only after you start the inspection.
              </p>
            </div>
          )}

          {options.length ? (
            <fieldset className="mt-5">
              <legend className="text-sm font-bold text-foreground">
                Sanitization options
              </legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {options.map((option) => (
                  <label
                    key={option.key}
                    className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-border bg-surface-soft p-3 text-sm text-foreground"
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 accent-primary"
                      checked={Boolean(settings[option.key])}
                      onChange={(event) => {
                        setSettings((current) => ({
                          ...current,
                          [option.key]: event.target.checked,
                        }));
                        clearResult();
                      }}
                    />
                    <span>
                      <span className="block font-bold">{option.label}</span>
                      {option.description ? (
                        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                          {option.description}
                        </span>
                      ) : null}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}

          {error ? (
            <div
              className="mt-4 flex gap-3 rounded-lg border border-danger bg-danger-soft p-4 text-sm text-foreground"
              role="alert"
            >
              <AlertTriangle
                className="mt-0.5 h-5 w-5 shrink-0 text-danger"
                aria-hidden="true"
              />
              <span>{error}</span>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary-hover px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-active focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={
                busy || (inputMode === "file" ? !file : !text.trim() && !file)
              }
              onClick={() => void run()}
            >
              {busy ? (
                <LoaderCircle
                  className="h-4 w-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              ) : (
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              )}
              {busy ? "Inspecting locally..." : "Run local inspection"}
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-bold text-foreground hover:bg-surface-soft focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)]"
              onClick={reset}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <aside className="space-y-4" aria-live="polite">
          {view ? (
            <>
              <section
                className={`rounded-lg border bg-surface p-5 shadow-sm ${tone.border}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${tone.badge}`}
                    >
                      <ToneIcon className="h-4 w-4" aria-hidden="true" />
                      {view.statusLabel}
                    </span>
                    <h2 className="mt-3 text-lg font-bold text-foreground">
                      {view.title || "Inspection summary"}
                    </h2>
                  </div>
                </div>
                {view.description ? (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {view.description}
                  </p>
                ) : null}
                {view.metrics?.length ? (
                  <dl className="mt-5 grid grid-cols-2 gap-3">
                    {view.metrics.map((metric) => (
                      <SummaryMetric
                        key={metric.label}
                        label={metric.label}
                        value={metric.value}
                      />
                    ))}
                  </dl>
                ) : null}
                {report ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-bold text-foreground hover:bg-surface-soft focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)]"
                      onClick={() =>
                        downloadText(report, reportName, reportMime)
                      }
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                      Download report
                    </button>
                    <button
                      type="button"
                      className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-bold text-foreground hover:bg-surface-soft focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)]"
                      onClick={() => void copyReport()}
                    >
                      <Clipboard className="h-4 w-4" aria-hidden="true" />
                      {copied ? "Copied" : "Copy report"}
                    </button>
                  </div>
                ) : null}
              </section>

              {view.limitations?.length ? (
                <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
                  <h2 className="font-bold text-foreground">
                    Scope and limitations
                  </h2>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                    {view.limitations.map((limitation) => (
                      <li key={limitation} className="flex gap-2">
                        <ShieldCheck
                          className="mt-0.5 h-4 w-4 shrink-0 text-primary-active"
                          aria-hidden="true"
                        />
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </>
          ) : (
            <section className="rounded-lg border border-border bg-surface p-6 text-center shadow-sm">
              <ToolIcon
                className="mx-auto h-10 w-10 text-primary-active"
                aria-hidden="true"
              />
              <h2 className="mt-4 text-lg font-bold text-foreground">
                Ready for a local review
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Add input and run the inspection. The result and export stay in
                this browser tab.
              </p>
            </section>
          )}
        </aside>
      </section>

      {view && findings.length ? (
        <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Review findings
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Showing {visibleFindings.length.toLocaleString("en-US")} of{" "}
                {findings.length.toLocaleString("en-US")} local finding
                {findings.length === 1 ? "" : "s"}.
              </p>
            </div>
          </div>
          <ol className="mt-4 grid gap-3 lg:grid-cols-2">
            {visibleFindings.map((finding, index) => {
              const findingTone =
                TONE_STYLES[finding.tone] || TONE_STYLES.neutral;
              return (
                <li
                  key={finding.id || `${finding.title}-${index}`}
                  className="rounded-lg border border-border bg-surface-soft p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-bold text-foreground">
                      {finding.title}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-bold ${findingTone.badge}`}
                    >
                      {finding.severity || "Review"}
                    </span>
                  </div>
                  {finding.location ? (
                    <p className="mt-2 text-xs font-semibold text-primary">
                      {finding.location}
                    </p>
                  ) : null}
                  {finding.detail ? (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {finding.detail}
                    </p>
                  ) : null}
                  {finding.evidence ? (
                    <code className="mt-3 block break-all rounded-lg border border-border bg-canvas p-3 text-xs text-foreground">
                      {finding.evidence}
                    </code>
                  ) : null}
                </li>
              );
            })}
          </ol>
          {findings.length > visibleFindings.length ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Additional findings were counted. The privacy-safe export may
              summarize them without source values.
            </p>
          ) : null}
        </section>
      ) : null}

      {view && outputPreview ? (
        <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <h2 className="text-lg font-bold text-foreground">
            {view.outputLabel || "Local output preview"}
          </h2>
          <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-border bg-canvas p-4 text-xs leading-relaxed text-foreground">
            {outputPreview}
            {String(view.outputText || "").length > outputPreview.length
              ? "\n\n[Preview truncated. Download the report for the complete output.]"
              : ""}
          </pre>
        </section>
      ) : null}
    </main>
  );
}
