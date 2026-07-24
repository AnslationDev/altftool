"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Columns2,
  Download,
  FileDiff,
  FileText,
  FileUp,
  ListTree,
  Play,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

import {
  DEFAULT_COMPARISON_OPTIONS,
  MAX_SOURCE_CHARACTERS,
  buildCountsOnlyVersionReport,
  compareDocumentVersions,
} from "../lib/compareVersions.mjs";
import {
  MAX_DOCUMENT_FILE_BYTES,
  extractLocalDocument,
} from "../lib/extractDocumentText";

const MAX_RENDERED_ROWS = 800;

const FORMAT_OPTIONS = [
  { value: "text", label: "Plain text / extracted PDF" },
  { value: "markdown", label: "Markdown" },
  { value: "json", label: "JSON fields" },
  { value: "csv", label: "CSV rows and columns" },
];

const SAMPLE_ORIGINAL = `{
  "product": "AltFTool",
  "version": "1.2",
  "features": {
    "localProcessing": true,
    "exportFormat": "JSON"
  },
  "legacyMode": true
}`;

const SAMPLE_UPDATED = `{
  "product": "AltFTool",
  "version": "1.3",
  "features": {
    "localProcessing": true,
    "exportFormat": "CSV",
    "comparisonView": "side-by-side"
  }
}`;

const EMPTY_DOCUMENT = {
  text: "",
  name: "",
  sourceType: "Pasted text",
  warnings: [],
};

const CHANGE_LABELS = {
  added: "Added",
  removed: "Removed",
  changed: "Changed",
};

function downloadJson(value) {
  if (!value) return;
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "document-version-counts-only.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function OptionToggle({ checked, label, help, onChange }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 accent-[var(--primary)]"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>
        <span className="block text-sm font-bold text-[var(--foreground)]">
          {label}
        </span>
        <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
          {help}
        </span>
      </span>
    </label>
  );
}

function DocumentPanel({
  title,
  subtitle,
  document,
  inputRef,
  busy,
  onFile,
  onText,
}) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            {title}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {subtitle}
          </p>
        </div>
        <label className="btn-secondary inline-flex min-h-10 cursor-pointer items-center gap-2 px-4">
          <FileUp className="h-4 w-4" aria-hidden="true" />
          {busy ? "Reading..." : "Open file"}
          <input
            ref={inputRef}
            type="file"
            accept=".txt,.md,.markdown,.json,.csv,.pdf,text/plain,text/markdown,text/csv,application/json,application/pdf"
            className="sr-only"
            disabled={busy}
            onChange={(event) => void onFile(event.target.files?.[0] || null)}
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--muted-foreground)]">
        <span className="rounded-full border border-[var(--border)] bg-[var(--background)] px-2 py-1 font-bold">
          {document.sourceType}
        </span>
        {document.name ? (
          <span className="max-w-full truncate rounded-full border border-[var(--border)] bg-[var(--background)] px-2 py-1">
            {document.name}
          </span>
        ) : null}
      </div>

      {document.warnings.length ? (
        <ul className="mt-3 space-y-1 rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-3 text-xs leading-5 text-[var(--foreground)]">
          {document.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ) : null}

      <label className="mt-4 block">
        <span className="sr-only">{title} contents</span>
        <textarea
          className="input-field min-h-80 w-full resize-y font-mono text-sm leading-6"
          value={document.text}
          onChange={(event) => onText(event.target.value)}
          placeholder="Paste this document version here..."
          spellCheck="false"
        />
      </label>
      <p className="mt-2 text-xs text-[var(--muted-foreground)]">
        {document.text.length.toLocaleString("en-US")} /{" "}
        {MAX_SOURCE_CHARACTERS.toLocaleString("en-US")} characters
      </p>
    </section>
  );
}

function SummaryCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
      <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
        <Icon className="h-4 w-4" aria-hidden="true" />
        <p className="text-xs font-bold uppercase tracking-wide">{label}</p>
      </div>
      <p className="mt-2 break-words text-2xl font-black text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
}

function StructuralSummary({ result }) {
  if (result.structuralChanges.length) {
    return (
      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <ListTree
            className="mt-0.5 h-5 w-5 text-[var(--primary)]"
            aria-hidden="true"
          />
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              Observable field and row changes
            </h2>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              Labels and values appear only in this local view and are excluded
              from the downloadable report.
            </p>
          </div>
        </div>
        <ul className="mt-5 space-y-3">
          {result.structuralChanges.map((change, index) => {
            const stateClasses =
              change.type === "added"
                ? "border-[var(--success)] bg-[var(--success-soft)]"
                : change.type === "removed"
                  ? "border-[var(--danger)] bg-[var(--danger-soft)]"
                  : "border-[var(--warning)] bg-[var(--warning-soft)]";
            return (
              <li
                key={`${change.type}-${change.label}-${index}`}
                className={`rounded-lg border p-4 ${stateClasses}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="break-all text-sm font-bold text-[var(--foreground)]">
                    {change.label}
                  </p>
                  <span className="rounded-full border border-[var(--border-strong)] bg-[var(--card)] px-2 py-1 text-xs font-bold text-[var(--foreground)]">
                    {CHANGE_LABELS[change.type]}
                  </span>
                </div>
                <dl className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="font-bold text-[var(--muted-foreground)]">
                      Original
                    </dt>
                    <dd className="mt-1 break-words font-mono text-[var(--foreground)]">
                      {change.beforePreview}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold text-[var(--muted-foreground)]">
                      Updated
                    </dt>
                    <dd className="mt-1 break-words font-mono text-[var(--foreground)]">
                      {change.afterPreview}
                    </dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
        {result.structuralTruncated ? (
          <p className="mt-4 rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-3 text-sm text-[var(--foreground)]">
            The local structural list is capped at 500 entries. Counts may
            include additional changes.
          </p>
        ) : null}
      </section>
    );
  }

  if (result.sectionSummaries.length) {
    return (
      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <ListTree
            className="mt-0.5 h-5 w-5 text-[var(--primary)]"
            aria-hidden="true"
          />
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              Changed sections
            </h2>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              Section labels come from observable headings, without interpreting
              document meaning.
            </p>
          </div>
        </div>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {result.sectionSummaries.map((section) => (
            <li
              key={section.section}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <p className="break-words font-bold text-[var(--foreground)]">
                {section.section}
              </p>
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                {section.additions} added · {section.removals} removed ·{" "}
                {section.changes} changed
              </p>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return null;
}

function lineCellClasses(type, side) {
  if (type === "changed") return "bg-[var(--warning-soft)]";
  if (type === "removed" && side === "before") return "bg-[var(--danger-soft)]";
  if (type === "added" && side === "after") return "bg-[var(--success-soft)]";
  return "bg-[var(--card)]";
}

export default function DocumentVersionVerifier() {
  const beforeInputRef = useRef(null);
  const afterInputRef = useRef(null);
  const [beforeDocument, setBeforeDocument] = useState(EMPTY_DOCUMENT);
  const [afterDocument, setAfterDocument] = useState(EMPTY_DOCUMENT);
  const [format, setFormat] = useState("text");
  const [options, setOptions] = useState(DEFAULT_COMPARISON_OPTIONS);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busySide, setBusySide] = useState("");
  const [showUnchanged, setShowUnchanged] = useState(false);

  const report = useMemo(
    () => (result?.ok ? buildCountsOnlyVersionReport(result) : null),
    [result],
  );
  const displayedRows = useMemo(() => {
    if (!result?.ok) return [];
    const selected = showUnchanged
      ? result.rows
      : result.rows.filter((row) => row.type !== "equal");
    return selected.slice(0, MAX_RENDERED_ROWS);
  }, [result, showUnchanged]);
  const selectedRowCount = result?.ok
    ? showUnchanged
      ? result.rows.length
      : result.rows.filter((row) => row.type !== "equal").length
    : 0;

  const invalidate = () => {
    setResult(null);
    setError("");
  };

  const updateText = (side, text) => {
    const setter = side === "before" ? setBeforeDocument : setAfterDocument;
    setter((current) => ({ ...current, text }));
    invalidate();
  };

  const loadFile = async (side, file) => {
    if (!file) return;
    setBusySide(side);
    setResult(null);
    setError("");
    try {
      const extracted = await extractLocalDocument(file);
      const setter = side === "before" ? setBeforeDocument : setAfterDocument;
      setter({
        text: extracted.text,
        name: file.name,
        sourceType: extracted.sourceType,
        warnings: extracted.warnings,
      });
      setFormat(extracted.format);
    } catch (fileError) {
      setError(
        fileError instanceof Error
          ? fileError.message
          : "The selected document could not be read locally.",
      );
    } finally {
      setBusySide("");
    }
  };

  const updateOption = (key, value) => {
    setOptions((current) => ({ ...current, [key]: value }));
    invalidate();
  };

  const compare = () => {
    const next = compareDocumentVersions(
      beforeDocument.text,
      afterDocument.text,
      { format, options },
    );
    if (!next.ok) {
      setResult(null);
      setError(next.error);
      return;
    }
    setError("");
    setResult(next);
  };

  const loadSample = () => {
    setBeforeDocument({
      ...EMPTY_DOCUMENT,
      text: SAMPLE_ORIGINAL,
      sourceType: "Sample JSON",
    });
    setAfterDocument({
      ...EMPTY_DOCUMENT,
      text: SAMPLE_UPDATED,
      sourceType: "Sample JSON",
    });
    setFormat("json");
    setResult(null);
    setError("");
    if (beforeInputRef.current) beforeInputRef.current.value = "";
    if (afterInputRef.current) afterInputRef.current.value = "";
  };

  const clearAll = () => {
    setBeforeDocument(EMPTY_DOCUMENT);
    setAfterDocument(EMPTY_DOCUMENT);
    setFormat("text");
    setOptions(DEFAULT_COMPARISON_OPTIONS);
    setResult(null);
    setError("");
    setShowUnchanged(false);
    if (beforeInputRef.current) beforeInputRef.current.value = "";
    if (afterInputRef.current) afterInputRef.current.value = "";
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary)]">
              <FileDiff className="h-4 w-4" aria-hidden="true" />
              Local version evidence
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl">
              Document Version Verifier
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted-foreground)]">
              Compare two TXT, Markdown, JSON, CSV, or text-based PDF versions
              side by side. Review observable line, section, field, row, and
              cell changes without assigning intent.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--primary)] bg-[var(--primary-soft)] p-4 lg:max-w-sm">
            <p className="flex items-center gap-2 font-bold text-[var(--foreground)]">
              <ShieldCheck
                className="h-5 w-5 text-[var(--primary)]"
                aria-hidden="true"
              />
              No uploads or saved history
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Documents are read and compared in this browser tab. The optional
              report contains counts and settings only.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <DocumentPanel
          title="1. Original version"
          subtitle="The earlier or reference copy."
          document={beforeDocument}
          inputRef={beforeInputRef}
          busy={busySide === "before"}
          onFile={(file) => loadFile("before", file)}
          onText={(text) => updateText("before", text)}
        />
        <DocumentPanel
          title="2. Updated version"
          subtitle="The later or comparison copy."
          document={afterDocument}
          inputRef={afterInputRef}
          busy={busySide === "after"}
          onFile={(file) => loadFile("after", file)}
          onText={(text) => updateText("after", text)}
        />
      </div>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <SlidersHorizontal
            className="mt-0.5 h-5 w-5 text-[var(--primary)]"
            aria-hidden="true"
          />
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              3. Comparison settings
            </h2>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              Normalization changes only the comparison representation. It never
              edits the source text shown above.
            </p>
          </div>
        </div>

        <label className="mt-5 block max-w-md">
          <span className="text-sm font-bold text-[var(--foreground)]">
            Document structure
          </span>
          <select
            className="input-field mt-2 w-full"
            value={format}
            onChange={(event) => {
              setFormat(event.target.value);
              invalidate();
            }}
          >
            {FORMAT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <OptionToggle
            checked={options.normalizeLineEndings}
            label="Normalize line endings"
            help="Compare CRLF and CR line breaks as LF."
            onChange={(value) => updateOption("normalizeLineEndings", value)}
          />
          <OptionToggle
            checked={options.trimLineWhitespace}
            label="Ignore line-edge whitespace"
            help="Ignore leading and trailing whitespace on each line."
            onChange={(value) => updateOption("trimLineWhitespace", value)}
          />
          <OptionToggle
            checked={options.collapseWhitespace}
            label="Collapse spaces and tabs"
            help="Compare each run of horizontal whitespace as one space."
            onChange={(value) => updateOption("collapseWhitespace", value)}
          />
        </div>

        <div className="mt-5 rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-4">
          <p className="text-sm font-bold text-[var(--foreground)]">
            Selected normalization disclosure
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-[var(--muted-foreground)]">
            {(
              result?.normalization || [
                options.normalizeLineEndings
                  ? "CRLF and CR line endings are compared as LF."
                  : "Line-ending differences remain observable.",
                options.trimLineWhitespace
                  ? "Leading and trailing line whitespace is ignored."
                  : "Leading and trailing line whitespace remains observable.",
                options.collapseWhitespace
                  ? "Runs of spaces and tabs are compared as one space."
                  : "Runs of spaces and tabs remain observable.",
              ]
            ).map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      </section>

      {error ? (
        <p
          className="rounded-lg border border-[var(--danger)] bg-[var(--danger-soft)] p-4 text-sm font-medium text-[var(--danger)]"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="btn-primary inline-flex min-h-11 items-center gap-2 px-5 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={compare}
          disabled={
            !beforeDocument.text || !afterDocument.text || Boolean(busySide)
          }
        >
          <Columns2 className="h-4 w-4" aria-hidden="true" />
          Compare versions
        </button>
        <button
          type="button"
          className="btn-secondary inline-flex min-h-11 items-center gap-2 px-5"
          onClick={loadSample}
        >
          <Play className="h-4 w-4" aria-hidden="true" />
          Load sample
        </button>
        <button
          type="button"
          className="btn-secondary inline-flex min-h-11 items-center gap-2 px-5"
          onClick={clearAll}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Clear
        </button>
      </div>

      {result ? (
        <section className="space-y-6" aria-live="polite">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <SummaryCard
              icon={FileText}
              label="Unit"
              value={result.comparisonUnit}
            />
            <SummaryCard
              icon={FileDiff}
              label="Added"
              value={result.summary.additions}
            />
            <SummaryCard
              icon={FileDiff}
              label="Removed"
              value={result.summary.removals}
            />
            <SummaryCard
              icon={FileDiff}
              label="Changed"
              value={result.summary.changes}
            />
            <SummaryCard
              icon={CheckCircle2}
              label="Unchanged lines"
              value={result.lineStats.unchanged}
            />
          </div>

          <div
            className={`rounded-lg border p-4 ${
              result.identical
                ? "border-[var(--success)] bg-[var(--success-soft)]"
                : "border-[var(--warning)] bg-[var(--warning-soft)]"
            }`}
          >
            <p className="flex items-start gap-2 text-sm leading-6 text-[var(--foreground)]">
              {result.identical ? (
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success)]"
                  aria-hidden="true"
                />
              ) : (
                <AlertTriangle
                  className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]"
                  aria-hidden="true"
                />
              )}
              {result.identical
                ? "No difference was found under the selected parser and normalization settings."
                : "Observable differences were found under the selected parser and normalization settings."}{" "}
              This result is not proof of identity, authenticity, or
              completeness.
            </p>
          </div>

          <StructuralSummary result={result} />

          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-[var(--foreground)]">
                  Side-by-side line evidence
                </h2>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                  JSON is rendered with sorted keys. CSV retains its line
                  representation. This view is evidence of text comparison only.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="btn-secondary inline-flex min-h-10 cursor-pointer items-center gap-2 px-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[var(--primary)]"
                    checked={showUnchanged}
                    onChange={(event) => setShowUnchanged(event.target.checked)}
                  />
                  Show unchanged
                </label>
                <button
                  type="button"
                  className="btn-secondary inline-flex min-h-10 items-center gap-2 px-4"
                  onClick={() => downloadJson(report)}
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Counts-only report
                </button>
              </div>
            </div>

            <ul className="mt-4 space-y-1 text-xs leading-5 text-[var(--muted-foreground)]">
              {result.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>

            {displayedRows.length ? (
              <div className="mt-5 overflow-x-auto rounded-lg border border-[var(--border)]">
                <table className="w-full min-w-3xl border-collapse text-left">
                  <thead className="bg-[var(--surface-soft)]">
                    <tr>
                      <th className="w-1/2 border-r border-[var(--border)] p-3 text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
                        Original
                      </th>
                      <th className="w-1/2 p-3 text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
                        Updated
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedRows.map((row, index) => (
                      <tr
                        key={`${row.beforeLine}-${row.afterLine}-${index}`}
                        className="border-t border-[var(--border)] align-top"
                      >
                        <td
                          className={`border-r border-[var(--border)] p-0 ${lineCellClasses(
                            row.type,
                            "before",
                          )}`}
                        >
                          <div className="flex">
                            <span className="w-14 shrink-0 border-r border-[var(--border)] p-3 text-right font-mono text-xs text-[var(--muted-foreground)]">
                              {row.beforeLine ?? "—"}
                            </span>
                            <pre className="min-w-0 flex-1 whitespace-pre-wrap break-words p-3 font-mono text-xs leading-5 text-[var(--foreground)]">
                              {row.before || " "}
                            </pre>
                          </div>
                        </td>
                        <td
                          className={`p-0 ${lineCellClasses(row.type, "after")}`}
                        >
                          <div className="flex">
                            <span className="w-14 shrink-0 border-r border-[var(--border)] p-3 text-right font-mono text-xs text-[var(--muted-foreground)]">
                              {row.afterLine ?? "—"}
                            </span>
                            <pre className="min-w-0 flex-1 whitespace-pre-wrap break-words p-3 font-mono text-xs leading-5 text-[var(--foreground)]">
                              {row.after || " "}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-5 rounded-lg border border-[var(--success)] bg-[var(--success-soft)] p-4 text-sm text-[var(--foreground)]">
                No changed lines are visible under the selected settings. Enable
                “Show unchanged” to inspect the aligned representation.
              </p>
            )}

            {selectedRowCount > MAX_RENDERED_ROWS ? (
              <p className="mt-4 rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-3 text-sm text-[var(--foreground)]">
                The table shows the first{" "}
                {MAX_RENDERED_ROWS.toLocaleString("en-US")} of{" "}
                {selectedRowCount.toLocaleString("en-US")} selected rows to keep
                the page responsive.
              </p>
            ) : null}
          </section>
        </section>
      ) : null}

      <section className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-5 sm:p-6">
        <h2 className="font-bold text-[var(--foreground)]">
          Verification boundary
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>
            This tool compares observable representations. It cannot prove
            authenticity, authorship, provenance, completeness, approval status,
            or semantic equivalence.
          </li>
          <li>
            JSON fields and CSV cells are structural comparisons, not judgments
            about what changed values mean.
          </li>
          <li>
            PDF support reads an existing text layer only. It does not OCR scans
            or compare visual layout, images, annotations, attachments, hidden
            content, or digital signatures.
          </li>
          <li>
            For signed, regulated, or high-stakes documents, verify the original
            file, signature chain, trusted source, and full visual rendering
            separately.
          </li>
        </ul>
        <p className="mt-4 text-xs text-[var(--muted-foreground)]">
          File limit: {MAX_DOCUMENT_FILE_BYTES / (1024 * 1024)} MB. Comparison
          text limit: {MAX_SOURCE_CHARACTERS.toLocaleString("en-US")} characters
          per version.
        </p>
      </section>
    </main>
  );
}
