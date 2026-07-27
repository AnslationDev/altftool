"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileText, Plus, RotateCcw, Trash2 } from "lucide-react";

import { MARKER_PRESETS, OPERATORS, buildRequirementsFile } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const CHECK_CLASS =
  "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_ROWS = [
  { name: "requests", extras: "", operator: "==", version: "2.31.0", marker: "" },
  { name: "tomli", extras: "", operator: ">=", version: "1.1.0", marker: 'python_version < "3.11"' },
];

const EMPTY_ROW = { name: "", extras: "", operator: "==", version: "", marker: "" };
const DASH = "—";

export default function ToolHome() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [sortAlpha, setSortAlpha] = useState(true);
  const [includeHeader, setIncludeHeader] = useState(true);
  const [copied, setCopied] = useState(false);

  const setRow = (index, key) => (event) =>
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: event.target.value } : row)));

  const addRow = () => setRows((prev) => [...prev, { ...EMPTY_ROW }]);
  const removeRow = (index) => setRows((prev) => prev.filter((_, i) => i !== index));

  const result = useMemo(
    () => buildRequirementsFile({ rows, sortAlpha, includeHeader }),
    [rows, sortAlpha, includeHeader],
  );
  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setRows(DEFAULT_ROWS);
    setSortAlpha(true);
    setIncludeHeader(true);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileText className="h-4 w-4" aria-hidden="true" />
          Package management
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Requirements TXT Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a pip requirements.txt with pinned versions, extras and environment markers — every
          line validated against PEP 508 names and PEP 440 version specifiers.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <ul className="space-y-5">
          {rows.map((row, index) => (
            <li key={index} className="rounded-lg border border-[var(--border)] p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`req-name-${index}`}>
                    Package name
                  </label>
                  <input
                    id={`req-name-${index}`}
                    className={`mt-2 ${INPUT_CLASS} font-mono`}
                    type="text"
                    value={row.name}
                    onChange={setRow(index, "name")}
                    placeholder="requests"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`req-extras-${index}`}>
                    Extras (comma separated)
                  </label>
                  <input
                    id={`req-extras-${index}`}
                    className={`mt-2 ${INPUT_CLASS} font-mono`}
                    type="text"
                    value={row.extras}
                    onChange={setRow(index, "extras")}
                    placeholder="socks, security"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`req-op-${index}`}>
                    Version operator
                  </label>
                  <select
                    id={`req-op-${index}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={row.operator}
                    onChange={setRow(index, "operator")}
                  >
                    {OPERATORS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`req-ver-${index}`}>
                    Version
                  </label>
                  <input
                    id={`req-ver-${index}`}
                    className={`mt-2 ${INPUT_CLASS} font-mono`}
                    type="text"
                    value={row.version}
                    onChange={setRow(index, "version")}
                    placeholder="2.31.0"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`req-marker-${index}`}>
                    Environment marker (optional)
                  </label>
                  <input
                    id={`req-marker-${index}`}
                    className={`mt-2 ${INPUT_CLASS} font-mono`}
                    type="text"
                    value={row.marker}
                    onChange={setRow(index, "marker")}
                    list={`req-marker-list-${index}`}
                    placeholder='python_version < "3.11"'
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <datalist id={`req-marker-list-${index}`}>
                    {MARKER_PRESETS.filter((preset) => preset.value).map((preset) => (
                      <option key={preset.value} value={preset.value}>
                        {preset.label}
                      </option>
                    ))}
                  </datalist>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  disabled={rows.length === 1}
                  aria-label={`Remove package row ${index + 1}`}
                  className={`${GHOST_BTN} disabled:opacity-50`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button type="button" onClick={addRow} aria-label="Add another package" className={GHOST_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add package
          </button>
          <label htmlFor="req-sort" className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
            <input
              id="req-sort"
              type="checkbox"
              className={CHECK_CLASS}
              checked={sortAlpha}
              onChange={(event) => setSortAlpha(event.target.checked)}
            />
            Sort alphabetically
          </label>
          <label htmlFor="req-header" className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
            <input
              id="req-header"
              type="checkbox"
              className={CHECK_CLASS}
              checked={includeHeader}
              onChange={(event) => setIncludeHeader(event.target.checked)}
            />
            Include header comment
          </label>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              requirements.txt
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.count} packages`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the requirements.txt content"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy file"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
          <pre className="min-w-[320px] p-4 text-xs leading-5">
            <code>{hasError ? "# Fix the input above to generate requirements.txt." : result.content}</code>
          </pre>
        </div>

        {!hasError && result.warnings.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning} className="flex gap-2">
                <span aria-hidden="true" className="text-[var(--primary)]">
                  •
                </span>
                {warning}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Syntax follows PEP 508 (names, extras, markers) and PEP 440 (version specifiers). For fully
        reproducible environments, pin exact versions and consider hash-checking with pip-compile
        --generate-hashes.
      </p>
    </main>
  );
}
