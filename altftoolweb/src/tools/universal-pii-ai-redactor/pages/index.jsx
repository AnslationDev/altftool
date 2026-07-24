"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Download,
  EyeOff,
  FileJson,
  FileSearch,
  FlaskConical,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";
import {
  buildSafeReport,
  DEFAULT_ENABLED_TYPES,
  PII_TYPES,
  redactText,
} from "../lib/redact.mjs";

const SAMPLE_TEXT = `Please summarise this customer support case.

Name: Asha Mehta
Email: asha.mehta@example.com
Phone: +91 98765 43210
DOB: 12/08/1993
Address: 14 Lake View Road, Pune 411001
PAN: ABCDE1234F
Aadhaar: 2345 6789 0124
Account number: 12345678901
Card used for verification: 4111 1111 1111 1111
Last sign-in IP: 203.0.113.24
API key: sk-proj-example1234567890ABCDEFG

The customer asked for a callback about the delayed refund.`;

const MODES = [
  {
    id: "label",
    label: "Smart labels",
    example: "[EMAIL_1]",
    description: "Keeps repeated values consistent so an AI can follow context.",
  },
  {
    id: "partial",
    label: "Partial mask",
    example: "•••• 3210",
    description: "Keeps a small amount of structure for human review.",
  },
  {
    id: "remove",
    label: "Remove values",
    example: "[REDACTED]",
    description: "Replaces every detected value with the same generic marker.",
  },
];

const GROUPS = [...new Set(PII_TYPES.map((type) => type.group))];

function downloadFile(contents, filename, type) {
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

function ActionButton({
  children,
  icon: Icon,
  onClick,
  disabled = false,
  primary = false,
  pressed,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
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

export default function UniversalPiiAiRedactor() {
  const [source, setSource] = useState("");
  const [enabledTypes, setEnabledTypes] = useState(DEFAULT_ENABLED_TYPES);
  const [mode, setMode] = useState("label");
  const [copyState, setCopyState] = useState("idle");

  const result = useMemo(
    () => redactText(source, { enabledTypes, mode }),
    [enabledTypes, mode, source],
  );

  const selectedCount = enabledTypes.length;
  const inputCharacters = source.length.toLocaleString("en-IN");
  const categoriesFound = result.summary.length;

  const setCopyFeedback = (success) => {
    setCopyState(success ? "copied" : "failed");
    window.setTimeout(() => setCopyState("idle"), 2000);
  };

  const handleCopy = async () => {
    const success = await safeCopyText(result.output);
    setCopyFeedback(success);
  };

  const toggleType = (id) => {
    setEnabledTypes((current) =>
      current.includes(id) ? current.filter((type) => type !== id) : [...current, id],
    );
  };

  const toggleGroup = (group) => {
    const groupIds = PII_TYPES.filter((type) => type.group === group).map((type) => type.id);
    const allSelected = groupIds.every((id) => enabledTypes.includes(id));
    setEnabledTypes((current) =>
      allSelected
        ? current.filter((id) => !groupIds.includes(id))
        : [...new Set([...current, ...groupIds])],
    );
  };

  const downloadRedacted = () => {
    downloadFile(result.output, "redacted-ai-input.txt", "text/plain;charset=utf-8");
  };

  const downloadReport = () => {
    const report = buildSafeReport(result, mode);
    downloadFile(
      JSON.stringify(report, null, 2),
      "pii-redaction-report.json",
      "application/json;charset=utf-8",
    );
  };

  const clearAll = () => {
    setSource("");
    setCopyState("idle");
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 text-foreground sm:px-6 sm:pt-10 lg:px-8">
      <header className="tool-card overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Universal PII &amp; AI Input Redactor
                </h1>
                <span className="rounded-pill border border-border bg-surface-soft px-3 py-1 text-xs font-bold text-muted-foreground">
                  Privacy
                </span>
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Find personal data, financial identifiers, and secrets before pasting text into
                an AI chat, email, ticket, or public document.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Privacy guarantees">
            {[
              ["Runs locally", LockKeyhole],
              ["No upload", EyeOff],
              ["Deterministic", ClipboardCheck],
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
          <strong>Review before sharing.</strong> Pattern matching can miss unusual formats and
          unlabelled names or addresses. The original text never leaves this browser.
        </p>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <section className="tool-card min-w-0 p-5 sm:p-6 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <FileSearch className="h-5 w-5 text-primary" aria-hidden="true" />
                Source text
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Paste the text you want to make safer.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ActionButton icon={FlaskConical} onClick={() => setSource(SAMPLE_TEXT)}>
                Load safe demo
              </ActionButton>
              <ActionButton icon={Trash2} onClick={clearAll} disabled={!source}>
                Clear
              </ActionButton>
            </div>
          </div>

          <label htmlFor="pii-source" className="sr-only">
            Source text containing information to redact
          </label>
          <textarea
            id="pii-source"
            value={source}
            onChange={(event) => setSource(event.target.value)}
            spellCheck="false"
            placeholder="Paste text here. Processing begins instantly and stays on your device."
            className="mt-4 min-h-80 w-full resize-y rounded-md border border-border bg-background p-4 font-mono text-sm leading-relaxed text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-[3px] focus:ring-primary/35"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{inputCharacters} characters</span>
            <span>Nothing is stored or transmitted by this tool.</span>
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
                {selectedCount} of {PII_TYPES.length} checks enabled
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setEnabledTypes(
                  selectedCount === PII_TYPES.length ? [] : [...DEFAULT_ENABLED_TYPES],
                )
              }
              className="min-h-11 rounded-md px-3 text-xs font-bold text-primary hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35"
            >
              {selectedCount === PII_TYPES.length ? "Clear all" : "Select all"}
            </button>
          </div>

          <div className="mt-5 space-y-5">
            {GROUPS.map((group) => {
              const types = PII_TYPES.filter((type) => type.group === group);
              const allSelected = types.every((type) => enabledTypes.includes(type.id));
              return (
                <fieldset key={group}>
                  <legend className="flex min-h-11 w-full items-center justify-between gap-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    <span>{group}</span>
                    <button
                      type="button"
                      onClick={() => toggleGroup(group)}
                      className="rounded-md px-2 py-1 text-primary hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35"
                    >
                      {allSelected ? "Disable group" : "Enable group"}
                    </button>
                  </legend>
                  <div className="grid gap-2">
                    {types.map((type) => {
                      const checked = enabledTypes.includes(type.id);
                      return (
                        <label
                          key={type.id}
                          title={type.description}
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
                  </div>
                </fieldset>
              );
            })}
          </div>
        </aside>
      </div>

      <section className="tool-card mt-6 p-5 sm:p-6">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <EyeOff className="h-5 w-5 text-primary" aria-hidden="true" />
            Redaction style
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Smart labels are best for preserving context in AI prompts.
          </p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {MODES.map((option) => {
            const selected = mode === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setMode(option.id)}
                aria-pressed={selected}
                className={`min-h-24 rounded-lg border p-4 text-left transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 ${
                  selected
                    ? "border-primary bg-primary-soft"
                    : "border-border bg-surface hover:border-primary"
                }`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="font-bold text-foreground">{option.label}</span>
                  {selected ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  ) : null}
                </span>
                <code className="mt-2 block text-xs font-bold text-primary">{option.example}</code>
                <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="tool-card min-w-0 p-5 sm:p-6 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
                Safer output
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Copy this version after reviewing every line.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ActionButton
                icon={copyState === "copied" ? CheckCircle2 : Copy}
                onClick={handleCopy}
                disabled={!source}
                primary
              >
                {copyState === "copied"
                  ? "Copied"
                  : copyState === "failed"
                    ? "Copy failed"
                    : "Copy safe text"}
              </ActionButton>
              <ActionButton icon={Download} onClick={downloadRedacted} disabled={!source}>
                Download text
              </ActionButton>
            </div>
          </div>

          <label htmlFor="pii-output" className="sr-only">
            Redacted output
          </label>
          <textarea
            id="pii-output"
            value={result.output}
            readOnly
            placeholder="Redacted output will appear here."
            className="mt-4 min-h-80 w-full resize-y rounded-md border border-border bg-surface-soft p-4 font-mono text-sm leading-relaxed text-foreground shadow-sm outline-none focus:ring-[3px] focus:ring-primary/35"
          />
          <p className="mt-2 text-xs text-muted-foreground" aria-live="polite">
            {copyState === "copied"
              ? "Redacted text copied to the clipboard."
              : copyState === "failed"
                ? "Clipboard access failed. Select and copy the output manually."
                : source
                  ? `${result.total} detection${result.total === 1 ? "" : "s"} replaced.`
                  : "Waiting for source text."}
          </p>
        </div>

        <aside className="space-y-6">
          <div className="tool-card p-5 sm:p-6">
            <h2 className="text-lg font-bold text-foreground">Privacy summary</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Metric
                label="Detections"
                value={result.total}
                detail="Total replacements"
              />
              <Metric
                label="Categories"
                value={categoriesFound}
                detail="PII types found"
              />
            </div>

            <div className="mt-5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Detected categories
              </h3>
              {result.summary.length ? (
                <ul className="mt-3 space-y-2">
                  {result.summary.map((item) => (
                    <li
                      key={item.type}
                      className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-soft px-3 py-2 text-sm"
                    >
                      <span className="min-w-0 truncate font-medium text-foreground">
                        {item.label}
                      </span>
                      <span className="shrink-0 rounded-pill bg-primary-soft px-2 py-1 text-xs font-bold text-primary">
                        {item.count}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-3 rounded-md border border-border bg-surface-soft p-4 text-sm leading-relaxed text-muted-foreground">
                  {source
                    ? "No selected patterns were detected. Manual review is still recommended."
                    : "Paste text or load the synthetic demo to see a privacy summary."}
                </div>
              )}
            </div>

            <div className="mt-5 border-t border-border pt-5">
              <ActionButton
                icon={FileJson}
                onClick={downloadReport}
                disabled={!source}
              >
                Download counts-only report
              </ActionButton>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                The JSON report contains categories and counts, never the detected raw values.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-success bg-success-soft p-5">
            <h2 className="flex items-center gap-2 font-bold text-foreground">
              <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
              Safe workflow
            </h2>
            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-foreground">
              <li>1. Paste and select the relevant checks.</li>
              <li>2. Review highlighted category counts.</li>
              <li>3. Scan the output for context-specific details.</li>
              <li>4. Copy only the safer output.</li>
            </ol>
            <button
              type="button"
              onClick={() => {
                setEnabledTypes([...DEFAULT_ENABLED_TYPES]);
                setMode("label");
              }}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-bold text-primary hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset privacy settings
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
}
