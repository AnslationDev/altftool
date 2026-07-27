"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Table2 } from "lucide-react";

import { DELIMITERS, OUTPUT_FORMATS, convertCsv } from "../lib";

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)]";

const DASH = "—";

const SAMPLE_CSV = `id,name,city,signups,active
1,"Sharma, Priya",Mumbai,1420,true
2,Ade Okafor,Lagos,880,true
3,"Lee ""Jay"" Min",Seoul,0,false`;

const numberFormat = new Intl.NumberFormat("en-US");

export default function ToolHome() {
  const [source, setSource] = useState(SAMPLE_CSV);
  const [format, setFormat] = useState("json");
  const [delimiterKey, setDelimiterKey] = useState("comma");
  const [hasHeader, setHasHeader] = useState(true);
  const [inferTypes, setInferTypes] = useState(true);
  const [tableName, setTableName] = useState("customers");
  const [copied, setCopied] = useState(false);

  const delimiter = useMemo(
    () => (DELIMITERS.find((entry) => entry.key === delimiterKey) || DELIMITERS[0]).value,
    [delimiterKey],
  );

  const result = useMemo(
    () =>
      convertCsv(source, format, {
        delimiter,
        hasHeader,
        inferTypes,
        pretty: true,
        tableName,
      }),
    [source, format, delimiter, hasHeader, inferTypes, tableName],
  );

  const copyResult = async () => {
    if (result.error) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSource(SAMPLE_CSV);
    setFormat("json");
    setDelimiterKey("comma");
    setHasHeader(true);
    setInferTypes(true);
    setTableName("customers");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-xl font-bold text-[var(--foreground)] sm:text-2xl">
          <Table2 className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
          CSV Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn CSV into JSON, an HTML table, XML, SQL INSERT statements or Python dictionaries.
          Quoted fields, embedded commas and line breaks are handled per RFC 4180.
        </p>
      </header>

      <section className="grid gap-4">
        <div>
          <label className={LABEL_CLASS} htmlFor="csv-source">
            CSV input
          </label>
          <textarea
            id="csv-source"
            rows={8}
            spellCheck={false}
            value={source}
            onChange={(event) => setSource(event.target.value)}
            className={`${TEXTAREA_CLASS} mt-1.5`}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="csv-format">
              Convert to
            </label>
            <select
              id="csv-format"
              value={format}
              onChange={(event) => setFormat(event.target.value)}
              className={`${INPUT_CLASS} mt-1.5`}
            >
              {OUTPUT_FORMATS.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="csv-delimiter">
              Delimiter
            </label>
            <select
              id="csv-delimiter"
              value={delimiterKey}
              onChange={(event) => setDelimiterKey(event.target.value)}
              className={`${INPUT_CLASS} mt-1.5`}
            >
              {DELIMITERS.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {format === "sql" && (
          <div>
            <label className={LABEL_CLASS} htmlFor="csv-table">
              SQL table name
            </label>
            <input
              id="csv-table"
              type="text"
              spellCheck={false}
              value={tableName}
              onChange={(event) => setTableName(event.target.value)}
              className={`${INPUT_CLASS} mt-1.5`}
            />
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <label className={CHECK_ROW} htmlFor="csv-header">
            <input
              id="csv-header"
              type="checkbox"
              checked={hasHeader}
              onChange={(event) => setHasHeader(event.target.checked)}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            First row is a header
          </label>
          <label className={CHECK_ROW} htmlFor="csv-types">
            <input
              id="csv-types"
              type="checkbox"
              checked={inferTypes}
              onChange={(event) => setInferTypes(event.target.checked)}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            Detect numbers, booleans and blanks
          </label>
        </div>
      </section>

      {result.error && (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">Rows converted</p>
            <p className="text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
              {result.error ? DASH : numberFormat.format(result.rowCount)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error
                ? DASH
                : `${result.columnCount} columns · ${numberFormat.format(result.cellCount)} cells`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the converted output"
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy output"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset to the sample CSV" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Output format", result.error ? DASH : format.toUpperCase()],
            ["Columns", result.error ? DASH : numberFormat.format(result.columnCount)],
            ["Data rows", result.error ? DASH : numberFormat.format(result.rowCount)],
            [
              "Rows with a different column count",
              result.error ? DASH : numberFormat.format(result.ragged),
            ],
            ["Output length", result.error ? DASH : `${numberFormat.format(result.outputChars)} chars`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold text-[var(--foreground)]">{value}</dd>
            </div>
          ))}
        </dl>

        {!result.error && result.ragged > 0 && (
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Short rows were padded with empty values so every record has {result.columnCount}{" "}
            columns.
          </p>
        )}
      </section>

      {!result.error && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--foreground)]">Parsed preview</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                  {result.headers.map((header) => (
                    <th key={header} scope="col" className="py-2 pr-4 font-semibold whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.preview.map((row, rowIndex) => (
                  <tr key={`row-${rowIndex}`} className="border-b border-[var(--border)]">
                    {row.map((cell, cellIndex) => (
                      <td
                        key={`cell-${rowIndex}-${cellIndex}`}
                        className="py-2.5 pr-4 text-[var(--foreground)] whitespace-nowrap"
                      >
                        {cell === "" ? DASH : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.rowCount > result.preview.length && (
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">
              Showing the first {result.preview.length} of{" "}
              {numberFormat.format(result.rowCount)} rows. The output below contains all of them.
            </p>
          )}
        </section>
      )}

      {!result.error && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--foreground)]">Output</h2>
          <div className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] p-3">
            <pre className="min-w-0 font-mono text-xs leading-5 text-[var(--foreground)]">
              {result.output}
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        SQL output escapes single quotes by doubling them, which is the ANSI rule. Review generated
        INSERT statements before running them against a live database — column types are guessed
        from the data, not from your schema.
      </p>
    </main>
  );
}
