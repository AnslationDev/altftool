"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Copy, Download, RotateCcw, Scissors, Upload } from "lucide-react";

import { DELIMITERS, SPLIT_MODES, splitCsv } from "../lib";

const NUM = new Intl.NumberFormat("en-US");
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SAMPLE_CSV = [
  "order_id,customer,city,amount",
  "1001,Aarav,Pune,2450",
  "1002,Diya,Delhi,1890",
  "1003,Kabir,Pune,3120",
  "1004,Meera,Mumbai,760",
  "1005,Rohan,Delhi,5400",
  "1006,Anaya,Mumbai,1230",
  "1007,Vivaan,Pune,980",
].join("\n");

const DEFAULTS = {
  text: SAMPLE_CSV,
  delimiterId: "auto",
  hasHeader: true,
  mode: "rows",
  rowsPerFile: "3",
  fileCount: "2",
  columnIndex: "2",
  baseName: "orders",
};

export default function ToolHome() {
  const [text, setText] = useState(DEFAULTS.text);
  const [delimiterId, setDelimiterId] = useState(DEFAULTS.delimiterId);
  const [hasHeader, setHasHeader] = useState(DEFAULTS.hasHeader);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [rowsPerFile, setRowsPerFile] = useState(DEFAULTS.rowsPerFile);
  const [fileCount, setFileCount] = useState(DEFAULTS.fileCount);
  const [columnIndex, setColumnIndex] = useState(DEFAULTS.columnIndex);
  const [baseName, setBaseName] = useState(DEFAULTS.baseName);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  const result = useMemo(
    () =>
      splitCsv({
        text,
        delimiterId,
        hasHeader,
        mode,
        rowsPerFile: Number(rowsPerFile),
        fileCount: Number(fileCount),
        columnIndex: Number(columnIndex),
        baseName,
      }),
    [text, delimiterId, hasHeader, mode, rowsPerFile, fileCount, columnIndex, baseName],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Split CSV — ${result.partCount} file(s) from ${result.totalRows} data rows`,
      ...result.parts.map((part) => `${part.filename}: ${part.rowCount} rows`),
    ].join("\n");
  }, [hasError, result]);

  const onPickFile = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const stem = file.name.replace(/\.[^.]+$/, "");
    if (stem) setBaseName(stem);
    const content = await file.text();
    setText(content);
  };

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const downloadPart = (part) => {
    const blob = new Blob([part.csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = part.filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const downloadZip = async () => {
    if (hasError) return;
    setBusy(true);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      result.parts.forEach((part) => zip.file(part.filename, part.csv));
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${baseName || "split"}-csv-parts.zip`;
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setText(DEFAULTS.text);
    setDelimiterId(DEFAULTS.delimiterId);
    setHasHeader(DEFAULTS.hasHeader);
    setMode(DEFAULTS.mode);
    setRowsPerFile(DEFAULTS.rowsPerFile);
    setFileCount(DEFAULTS.fileCount);
    setColumnIndex(DEFAULTS.columnIndex);
    setBaseName(DEFAULTS.baseName);
    setFileName("");
    setCopied(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const columns = hasError ? [] : result.columns;

  const rows = hasError
    ? [
        ["Data rows read", DASH],
        ["Files produced", DASH],
        ["Largest file", DASH],
        ["Smallest file", DASH],
      ]
    : [
        ["Data rows read", NUM.format(result.totalRows)],
        ["Files produced", NUM.format(result.partCount)],
        ["Largest file", `${NUM.format(result.largestPart)} rows`],
        ["Smallest file", `${NUM.format(result.smallestPart)} rows`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Scissors className="h-4 w-4" aria-hidden="true" />
          CSV toolkit
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Split CSV</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Break one CSV into several smaller CSV files — by rows per file, by an equal number of
          files, or one file per value in a column. The header row is repeated in every part and
          everything runs in your browser.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="csv-file">
              Upload a .csv file (optional)
            </label>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <input
                id="csv-file"
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv,text/plain"
                onChange={onPickFile}
                className="block w-full text-sm text-[var(--muted-foreground)] file:mr-3 file:min-h-11 file:rounded-md file:border file:border-[var(--border)] file:bg-[var(--background)] file:px-4 file:text-sm file:font-semibold file:text-[var(--foreground)]"
              />
            </div>
            {fileName ? (
              <p className="mt-2 inline-flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                Loaded {fileName}
              </p>
            ) : null}
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="csv-text">
              CSV content
            </label>
            <textarea
              id="csv-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={8}
              spellCheck={false}
              className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="csv-delimiter">
                Delimiter
              </label>
              <select
                id="csv-delimiter"
                value={delimiterId}
                onChange={(event) => setDelimiterId(event.target.value)}
                className={`mt-2 ${INPUT_CLASS}`}
              >
                {DELIMITERS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="csv-mode">
                Split mode
              </label>
              <select
                id="csv-mode"
                value={mode}
                onChange={(event) => setMode(event.target.value)}
                className={`mt-2 ${INPUT_CLASS}`}
              >
                {SPLIT_MODES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {mode === "rows" ? (
              <div>
                <label className={LABEL_CLASS} htmlFor="csv-rows-per-file">
                  Rows per file
                </label>
                <input
                  id="csv-rows-per-file"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  value={rowsPerFile}
                  onChange={(event) => setRowsPerFile(event.target.value)}
                  className={`mt-2 ${INPUT_CLASS}`}
                />
              </div>
            ) : null}

            {mode === "parts" ? (
              <div>
                <label className={LABEL_CLASS} htmlFor="csv-file-count">
                  Number of files
                </label>
                <input
                  id="csv-file-count"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  value={fileCount}
                  onChange={(event) => setFileCount(event.target.value)}
                  className={`mt-2 ${INPUT_CLASS}`}
                />
              </div>
            ) : null}

            {mode === "column" ? (
              <div>
                <label className={LABEL_CLASS} htmlFor="csv-column">
                  Split on column
                </label>
                <select
                  id="csv-column"
                  value={columnIndex}
                  onChange={(event) => setColumnIndex(event.target.value)}
                  className={`mt-2 ${INPUT_CLASS}`}
                >
                  {columns.map((name, index) => (
                    <option key={`${name}-${index}`} value={String(index)}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div>
              <label className={LABEL_CLASS} htmlFor="csv-base-name">
                Output file name prefix
              </label>
              <input
                id="csv-base-name"
                type="text"
                value={baseName}
                onChange={(event) => setBaseName(event.target.value)}
                className={`mt-2 ${INPUT_CLASS}`}
              />
            </div>

            <div className="flex items-end">
              <label
                className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-[var(--foreground)]"
                htmlFor="csv-has-header"
              >
                <input
                  id="csv-has-header"
                  type="checkbox"
                  checked={hasHeader}
                  onChange={(event) => setHasHeader(event.target.checked)}
                  className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                />
                First row is a header
              </label>
            </div>
          </div>
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Files produced
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.partCount)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `Every part is a valid CSV${result.header ? " with the header row repeated" : ""}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the split summary"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={downloadZip}
              disabled={hasError || busy}
              aria-label="Download all split CSV files as a ZIP archive"
              className={`${PRIMARY_BTN} disabled:opacity-50`}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              {busy ? "Zipping…" : "Download ZIP"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={GHOST_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Parts</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    File
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Rows
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Download
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {result.parts.map((part) => (
                  <tr key={part.filename}>
                    <td className="py-2.5 pr-3 font-mono text-xs break-all">{part.filename}</td>
                    <td className="py-2.5 pr-3 font-semibold">{NUM.format(part.rowCount)}</td>
                    <td className="py-2.5">
                      <button
                        type="button"
                        onClick={() => downloadPart(part)}
                        aria-label={`Download ${part.filename}`}
                        className={GHOST_BTN}
                      >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        CSV
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Files are parsed and split entirely in your browser — nothing is uploaded to a server.
      </p>
    </main>
  );
}
