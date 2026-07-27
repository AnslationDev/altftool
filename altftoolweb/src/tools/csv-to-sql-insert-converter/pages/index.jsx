"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileSpreadsheet, RotateCcw } from "lucide-react";

import { DIALECTS, MAX_BATCH, MIN_BATCH, convertCsvToInserts } from "../lib";

const INPUT_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_CLASS =
  "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const SAMPLE_CSV = `id,name,price,active
1,"O'Neill, Sam",9.5,true
2,Bea,12,false
3,,3.25,true`;

const DEFAULTS = {
  csv: SAMPLE_CSV,
  tableName: "products",
  dialect: "postgres",
  hasHeader: true,
  batchSize: "100",
  nullifyEmpty: true,
  delimiter: ",",
};

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN");

export default function ToolHome() {
  const [csv, setCsv] = useState(DEFAULTS.csv);
  const [tableName, setTableName] = useState(DEFAULTS.tableName);
  const [dialect, setDialect] = useState(DEFAULTS.dialect);
  const [hasHeader, setHasHeader] = useState(DEFAULTS.hasHeader);
  const [batchSize, setBatchSize] = useState(DEFAULTS.batchSize);
  const [nullifyEmpty, setNullifyEmpty] = useState(DEFAULTS.nullifyEmpty);
  const [delimiter, setDelimiter] = useState(DEFAULTS.delimiter);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      convertCsvToInserts({
        csv,
        tableName,
        dialect,
        hasHeader,
        batchSize: batchSize.trim() === "" ? Number.NaN : Number(batchSize),
        nullifyEmpty,
        delimiter: delimiter === "\\t" ? "\t" : delimiter,
      }),
    [csv, tableName, dialect, hasHeader, batchSize, nullifyEmpty, delimiter],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setCsv(DEFAULTS.csv);
    setTableName(DEFAULTS.tableName);
    setDialect(DEFAULTS.dialect);
    setHasHeader(DEFAULTS.hasHeader);
    setBatchSize(DEFAULTS.batchSize);
    setNullifyEmpty(DEFAULTS.nullifyEmpty);
    setDelimiter(DEFAULTS.delimiter);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
          Database design
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          CSV to SQL Insert Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste CSV, pick a dialect, and get batched INSERT statements with inferred column types,
          correct quote escaping and NULL handling. Everything runs in your browser.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="c2s-csv">
            CSV data
          </label>
          <textarea
            id="c2s-csv"
            className={`mt-2 min-h-40 py-2 font-mono text-sm ${INPUT_CLASS}`}
            value={csv}
            onChange={(event) => setCsv(event.target.value)}
            spellCheck={false}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="c2s-table">
              Table name
            </label>
            <input
              id="c2s-table"
              className={`mt-2 h-11 font-mono ${INPUT_CLASS}`}
              type="text"
              value={tableName}
              onChange={(event) => setTableName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="c2s-dialect">
              SQL dialect
            </label>
            <select
              id="c2s-dialect"
              className={`mt-2 h-11 ${INPUT_CLASS}`}
              value={dialect}
              onChange={(event) => setDialect(event.target.value)}
            >
              {DIALECTS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="c2s-batch">
              Rows per INSERT ({MIN_BATCH}–{MAX_BATCH})
            </label>
            <input
              id="c2s-batch"
              className={`mt-2 h-11 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_BATCH}
              max={MAX_BATCH}
              step="1"
              value={batchSize}
              onChange={(event) => setBatchSize(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="c2s-delim">
              Delimiter
            </label>
            <select
              id="c2s-delim"
              className={`mt-2 h-11 ${INPUT_CLASS}`}
              value={delimiter}
              onChange={(event) => setDelimiter(event.target.value)}
            >
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="\t">Tab</option>
              <option value="|">Pipe (|)</option>
            </select>
          </div>
        </div>
        <div className="mt-3 grid gap-1 sm:grid-cols-2">
          <label htmlFor="c2s-header" className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input
              id="c2s-header"
              type="checkbox"
              className={CHECK_CLASS}
              checked={hasHeader}
              onChange={(event) => setHasHeader(event.target.checked)}
            />
            First row is a header with column names
          </label>
          <label htmlFor="c2s-null" className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input
              id="c2s-null"
              type="checkbox"
              className={CHECK_CLASS}
              checked={nullifyEmpty}
              onChange={(event) => setNullifyEmpty(event.target.checked)}
            />
            Treat empty cells as NULL (instead of &apos;&apos;)
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Rows converted
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.rowCount)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated INSERT statements"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy SQL"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the converter to the sample CSV"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["INSERT statements", hasError ? DASH : NUM.format(result.statements)],
            [
              "Inferred column types",
              hasError
                ? DASH
                : result.columns.map((column) => `${column.name}: ${column.type}`).join(", "),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold break-all">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.warnings.length > 0 ? (
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[var(--danger)]">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}

        <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
          <pre className="max-h-96 overflow-y-auto whitespace-pre font-mono text-sm leading-6 text-[var(--foreground)]">
            {hasError ? DASH : result.sql}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Parsing follows RFC 4180 (quoted fields, doubled-quote escapes, embedded newlines). Review
        the generated SQL before running it against production data — type inference is based only
        on the values present in the file.
      </p>
    </main>
  );
}
