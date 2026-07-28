"use client";

import { useMemo, useState } from "react";
import { Check, Columns3, Copy, RotateCcw } from "lucide-react";

import { DELIMITERS, detectDelimiter, extractColumns, MODES } from "../lib";

const NUM = new Intl.NumberFormat("en-US");
const DASH = "—";

const SAMPLE = `id,name,city,amount
101,Asha Menon,Pune,1200
102,"Rao, Kiran",Delhi,3400
103,Bilal Ahmed,Kochi,900
104,Nita Shah,Surat,2750`;

const DEFAULTS = {
  text: SAMPLE,
  mode: "delimited",
  delimiter: "comma",
  customDelimiter: "",
  columnSpec: "2,4",
  fixedSpec: "1-10,12-20",
  skipRows: "1",
  trim: true,
  unique: false,
  dropEmpty: true,
  respectQuotes: true,
  outputDelimiter: "tab",
};

const OUTPUT_SEPARATORS = [
  { value: "tab", label: "Tab", char: "\t" },
  { value: "comma", label: "Comma", char: "," },
  { value: "newline", label: "New line", char: "\n" },
  { value: "space", label: "Space", char: " " },
  { value: "pipe", label: "Pipe", char: " | " },
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-medium text-[var(--foreground)]";

export default function ToolHome() {
  const [text, setText] = useState(DEFAULTS.text);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [delimiter, setDelimiter] = useState(DEFAULTS.delimiter);
  const [customDelimiter, setCustomDelimiter] = useState(DEFAULTS.customDelimiter);
  const [columnSpec, setColumnSpec] = useState(DEFAULTS.columnSpec);
  const [fixedSpec, setFixedSpec] = useState(DEFAULTS.fixedSpec);
  const [skipRows, setSkipRows] = useState(DEFAULTS.skipRows);
  const [trim, setTrim] = useState(DEFAULTS.trim);
  const [unique, setUnique] = useState(DEFAULTS.unique);
  const [dropEmpty, setDropEmpty] = useState(DEFAULTS.dropEmpty);
  const [respectQuotes, setRespectQuotes] = useState(DEFAULTS.respectQuotes);
  const [outputDelimiter, setOutputDelimiter] = useState(DEFAULTS.outputDelimiter);
  const [copied, setCopied] = useState(false);

  const joiner =
    OUTPUT_SEPARATORS.find((o) => o.value === outputDelimiter)?.char ?? "\t";

  const result = useMemo(
    () =>
      extractColumns({
        text,
        mode,
        delimiter,
        customDelimiter,
        columnSpec,
        fixedSpec,
        skipRows: Number(skipRows) || 0,
        trim,
        unique,
        dropEmpty,
        respectQuotes,
        outputDelimiter: joiner,
      }),
    [
      text,
      mode,
      delimiter,
      customDelimiter,
      columnSpec,
      fixedSpec,
      skipRows,
      trim,
      unique,
      dropEmpty,
      respectQuotes,
      joiner,
    ],
  );

  const error = result.error ? result.error : null;
  const ok = !error;

  const autoDetect = () => {
    setMode("delimited");
    setDelimiter(detectDelimiter(text));
  };

  const reset = () => {
    setText(DEFAULTS.text);
    setMode(DEFAULTS.mode);
    setDelimiter(DEFAULTS.delimiter);
    setCustomDelimiter(DEFAULTS.customDelimiter);
    setColumnSpec(DEFAULTS.columnSpec);
    setFixedSpec(DEFAULTS.fixedSpec);
    setSkipRows(DEFAULTS.skipRows);
    setTrim(DEFAULTS.trim);
    setUnique(DEFAULTS.unique);
    setDropEmpty(DEFAULTS.dropEmpty);
    setRespectQuotes(DEFAULTS.respectQuotes);
    setOutputDelimiter(DEFAULTS.outputDelimiter);
    setCopied(false);
  };

  const copy = async () => {
    if (!ok) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <header className="mb-6 flex items-start gap-3">
        <Columns3 className="mt-1 h-6 w-6 shrink-0 text-[var(--primary)]" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Text Column Extractor</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Paste delimited or fixed-width text and pull out just the columns you need.
            Quoted CSV fields, negative column numbers and ranges all work.
          </p>
        </div>
      </header>

      <div>
        <label className={LABEL_CLASS} htmlFor="tce-text">
          Text to extract from
        </label>
        <textarea
          id="tce-text"
          className={`${AREA_CLASS} mt-1`}
          rows={9}
          spellCheck={false}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <section className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="tce-mode">
            Splitting mode
          </label>
          <select
            id="tce-mode"
            className={`${INPUT_CLASS} mt-1`}
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            {MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {mode === "delimited" ? (
          <div>
            <label className={LABEL_CLASS} htmlFor="tce-delim">
              Input separator
            </label>
            <select
              id="tce-delim"
              className={`${INPUT_CLASS} mt-1`}
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
            >
              {DELIMITERS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className={LABEL_CLASS} htmlFor="tce-fixed">
              Character positions
            </label>
            <input
              id="tce-fixed"
              className={`${INPUT_CLASS} mt-1`}
              value={fixedSpec}
              onChange={(e) => setFixedSpec(e.target.value)}
            />
            <p className={HINT_CLASS}>1-based and inclusive, e.g. 1-10,12-20. A bare number runs to the end of the line.</p>
          </div>
        )}

        {mode === "delimited" && delimiter === "custom" ? (
          <div>
            <label className={LABEL_CLASS} htmlFor="tce-custom">
              Custom separator
            </label>
            <input
              id="tce-custom"
              className={`${INPUT_CLASS} mt-1`}
              value={customDelimiter}
              onChange={(e) => setCustomDelimiter(e.target.value)}
              placeholder="e.g. :: or \t"
            />
            <p className={HINT_CLASS}>Type \t for a tab.</p>
          </div>
        ) : null}

        {mode === "delimited" ? (
          <div>
            <label className={LABEL_CLASS} htmlFor="tce-cols">
              Columns to keep
            </label>
            <input
              id="tce-cols"
              className={`${INPUT_CLASS} mt-1`}
              value={columnSpec}
              onChange={(e) => setColumnSpec(e.target.value)}
            />
            <p className={HINT_CLASS}>1-based. Use 2,4 for two columns, 2-5 for a range, -1 for the last column.</p>
          </div>
        ) : null}

        <div>
          <label className={LABEL_CLASS} htmlFor="tce-skip">
            Header rows to skip
          </label>
          <input
            id="tce-skip"
            className={`${INPUT_CLASS} mt-1`}
            inputMode="numeric"
            value={skipRows}
            onChange={(e) => setSkipRows(e.target.value)}
          />
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="tce-out">
            Output separator
          </label>
          <select
            id="tce-out"
            className={`${INPUT_CLASS} mt-1`}
            value={outputDelimiter}
            onChange={(e) => setOutputDelimiter(e.target.value)}
          >
            {OUTPUT_SEPARATORS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="mt-4 grid gap-2 sm:grid-cols-2">
        <label className={CHECK_ROW} htmlFor="tce-trim">
          <input
            id="tce-trim"
            type="checkbox"
            className="h-4 w-4 accent-[var(--primary)]"
            checked={trim}
            onChange={(e) => setTrim(e.target.checked)}
          />
          Trim spaces around each field
        </label>
        <label className={CHECK_ROW} htmlFor="tce-quotes">
          <input
            id="tce-quotes"
            type="checkbox"
            className="h-4 w-4 accent-[var(--primary)]"
            checked={respectQuotes}
            onChange={(e) => setRespectQuotes(e.target.checked)}
          />
          Respect &quot;quoted&quot; CSV fields
        </label>
        <label className={CHECK_ROW} htmlFor="tce-unique">
          <input
            id="tce-unique"
            type="checkbox"
            className="h-4 w-4 accent-[var(--primary)]"
            checked={unique}
            onChange={(e) => setUnique(e.target.checked)}
          />
          Keep only unique rows
        </label>
        <label className={CHECK_ROW} htmlFor="tce-empty">
          <input
            id="tce-empty"
            type="checkbox"
            className="h-4 w-4 accent-[var(--primary)]"
            checked={dropEmpty}
            onChange={(e) => setDropEmpty(e.target.checked)}
          />
          Drop rows where every kept field is empty
        </label>
      </section>

      {error ? (
        <div
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </div>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">Rows extracted</p>
        <p className="mt-1 text-4xl font-bold tracking-tight text-[var(--primary)]">
          {ok ? NUM.format(result.rowsOut) : DASH}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {ok
            ? `${NUM.format(result.columnsRequested)} column${result.columnsRequested === 1 ? "" : "s"} kept from ${NUM.format(result.rowsIn)} data rows`
            : "Fix the settings above to see a result."}
        </p>

        <textarea
          readOnly
          aria-label="Extracted columns"
          className={`${AREA_CLASS} mt-4`}
          rows={9}
          spellCheck={false}
          value={ok ? result.output : DASH}
        />

        <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Widest row found</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {ok ? `${NUM.format(result.columnsDetected)} columns` : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Duplicate rows removed</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {ok ? NUM.format(result.duplicatesRemoved) : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Cells that did not exist</dt>
            <dd
              className={`text-sm font-semibold ${ok && result.missingCells > 0 ? "text-[var(--danger)]" : "text-[var(--foreground)]"}`}
            >
              {ok ? NUM.format(result.missingCells) : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Header rows skipped</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {ok ? NUM.format(result.headerLines.length) : DASH}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" className={PRIMARY_BTN} onClick={copy} aria-label="Copy the extracted columns to the clipboard">
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy result"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={autoDetect} aria-label="Detect the separator used in the pasted text">
            Detect separator
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset all inputs to their defaults">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {ok && result.rows.length > 0 ? (
        <section className="mt-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">First rows as a table</h2>
          <div className="mt-3 overflow-x-auto rounded-xl ring-1 ring-[var(--border)]">
            <table className="w-full border-collapse text-sm">
              <tbody>
                {result.rows.slice(0, 12).map((row, i) => (
                  <tr key={i} className="border-b border-[var(--border)] last:border-b-0">
                    {row.map((cell, j) => (
                      <td key={j} className="whitespace-nowrap px-3 py-2 font-mono text-[var(--foreground)]">
                        {cell === "" ? DASH : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.rows.length > 12 ? (
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Showing the first 12 of {NUM.format(result.rows.length)} rows. The copy button takes them all.
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
