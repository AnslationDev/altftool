"use client";

import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Check, Copy, Download, FileSpreadsheet, RotateCcw, Upload } from "lucide-react";

import { MAX_INPUT_BYTES, SAMPLE_XML, xmlToWorkbookData } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full min-h-56 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-relaxed text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN");
const PREVIEW_ROWS = 25;

const FORMATS = {
  xlsx: { label: "Excel workbook (.xlsx)", bookType: "xlsx", extension: "xlsx" },
  xls: { label: "Excel 97–2003 (.xls)", bookType: "biff8", extension: "xls" },
  ods: { label: "OpenDocument sheet (.ods)", bookType: "ods", extension: "ods" },
};

export default function ToolHome() {
  const [xml, setXml] = useState(SAMPLE_XML);
  const [sheetName, setSheetName] = useState("");
  const [format, setFormat] = useState("xlsx");
  const [includeHeader, setIncludeHeader] = useState(true);
  const [includeAttributes, setIncludeAttributes] = useState(true);
  const [detectNumbers, setDetectNumbers] = useState(true);
  const [fileName, setFileName] = useState("");
  const [readError, setReadError] = useState("");
  const [writeError, setWriteError] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      xmlToWorkbookData(xml, {
        includeHeader,
        includeAttributes,
        detectNumbers,
        detectBooleans: detectNumbers,
        sheetName: sheetName.trim() || undefined,
      }),
    [xml, includeHeader, includeAttributes, detectNumbers, sheetName],
  );

  const error = readError || writeError || result.error || null;

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const onFile = async (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_INPUT_BYTES) {
      setReadError(`"${file.name}" is larger than the ${Math.round(MAX_INPUT_BYTES / 1024 / 1024)} MB limit.`);
      return;
    }
    try {
      const text = await file.text();
      setXml(text);
      setFileName(file.name);
      setReadError("");
      setWriteError("");
    } catch {
      setReadError("That file could not be read in this browser.");
    }
  };

  const download = () => {
    if (result.error) return;
    const chosen = FORMATS[format] || FORMATS.xlsx;
    try {
      const sheet = XLSX.utils.aoa_to_sheet(result.aoa);
      sheet["!cols"] = result.widths;
      const book = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(book, sheet, result.sheetName);
      const base = fileName.replace(/\.xml$/i, "") || result.recordName || "data";
      XLSX.writeFile(book, `${base}.${chosen.extension}`, { bookType: chosen.bookType });
      setWriteError("");
    } catch {
      setWriteError("The spreadsheet could not be written in this browser. Try the .xlsx format.");
    }
  };

  const copy = async () => {
    if (result.error) return;
    const text = result.aoa.map((row) => row.map((cell) => (cell === "" ? "" : String(cell))).join("\t")).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setXml(SAMPLE_XML);
    setSheetName("");
    setFormat("xlsx");
    setIncludeHeader(true);
    setIncludeAttributes(true);
    setDetectNumbers(true);
    setFileName("");
    setReadError("");
    setWriteError("");
    setCopied(false);
  };

  const previewRows = result.error ? [] : result.rows.slice(0, PREVIEW_ROWS);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <FileSpreadsheet className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          XML to Excel
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Convert repeating XML elements into a real .xlsx worksheet with typed number and boolean
          cells. Parsing and writing both happen in your browser.
        </p>
      </header>

      <div>
        <label className={LABEL_CLASS} htmlFor="x2e-xml">
          XML input
        </label>
        <textarea
          id="x2e-xml"
          className={`${TEXTAREA_CLASS} mt-1`}
          value={xml}
          onChange={(event) => {
            setXml(event.target.value);
            setReadError("");
            setWriteError("");
          }}
          spellCheck={false}
          placeholder="<invoices><invoice number='INV-1'><amount>100</amount></invoice></invoices>"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="x2e-format">
            Output format
          </label>
          <select
            id="x2e-format"
            className={`${INPUT_CLASS} mt-1`}
            value={format}
            onChange={(event) => setFormat(event.target.value)}
          >
            {Object.entries(FORMATS).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="x2e-sheet">
            Worksheet name (max 31 characters)
          </label>
          <input
            id="x2e-sheet"
            type="text"
            className={`${INPUT_CLASS} mt-1`}
            value={sheetName}
            onChange={(event) => setSheetName(event.target.value)}
            placeholder={result.error ? "Sheet1" : result.sheetName}
            maxLength={40}
          />
        </div>

        <div className="sm:col-span-2">
          <span className={LABEL_CLASS}>Options</span>
          <div className="mt-1 grid gap-2 sm:grid-cols-3">
            <label className="flex min-h-11 items-center gap-2 text-sm text-[var(--foreground)]" htmlFor="x2e-header">
              <input
                id="x2e-header"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={includeHeader}
                onChange={(event) => setIncludeHeader(event.target.checked)}
              />
              Header row
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm text-[var(--foreground)]" htmlFor="x2e-attrs">
              <input
                id="x2e-attrs"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={includeAttributes}
                onChange={(event) => setIncludeAttributes(event.target.checked)}
              />
              Attributes as columns
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm text-[var(--foreground)]" htmlFor="x2e-types">
              <input
                id="x2e-types"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={detectNumbers}
                onChange={(event) => setDetectNumbers(event.target.checked)}
              />
              Type numbers &amp; booleans
            </label>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className={GHOST_BTN} htmlFor="x2e-file">
          <Upload className="h-4 w-4" aria-hidden="true" />
          Upload .xml
          <input id="x2e-file" type="file" accept=".xml,text/xml,application/xml" className="sr-only" onChange={onFile} />
        </label>
        <button
          type="button"
          className={PRIMARY_BTN}
          onClick={download}
          disabled={Boolean(error)}
          aria-label="Download the converted spreadsheet"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Download spreadsheet
        </button>
        <button
          type="button"
          className={GHOST_BTN}
          onClick={copy}
          disabled={Boolean(error)}
          aria-label="Copy the table as tab-separated values for pasting into a spreadsheet"
        >
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copied!" : "Copy for paste"}
        </button>
        <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset to the sample XML document">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
        {fileName ? <span className="text-xs text-[var(--muted-foreground)]">{fileName}</span> : null}
      </div>

      {error ? (
        <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">Spreadsheet rows ready</p>
        <p className="mt-1 text-4xl font-bold tabular-nums text-[var(--foreground)]">
          {error ? DASH : NUM.format(result.recordCount)}
        </p>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-[var(--muted-foreground)]">Worksheet name</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">{error ? DASH : result.sheetName}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-[var(--muted-foreground)]">Row element detected</dt>
            <dd className="font-mono text-sm font-semibold text-[var(--foreground)]">
              {error ? DASH : `<${result.recordName}>`}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-[var(--muted-foreground)]">Columns</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {error ? DASH : NUM.format(result.columns.length)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-[var(--muted-foreground)]">Cell types</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {error
                ? DASH
                : `${NUM.format(result.numberCells)} number · ${NUM.format(result.booleanCells)} boolean · ${NUM.format(result.textCells)} text`}
            </dd>
          </div>
        </dl>
      </section>

      {!error ? (
        <section className="mt-5">
          <h2 className="mb-2 text-sm font-semibold text-[var(--foreground)]">
            Preview{" "}
            {result.recordCount > PREVIEW_ROWS
              ? `(first ${PREVIEW_ROWS} of ${NUM.format(result.recordCount)} rows)`
              : ""}
          </h2>
          <div className="overflow-x-auto rounded-xl ring-1 ring-[var(--border)]">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">Worksheet preview</caption>
              <thead>
                <tr className="bg-[var(--card)]">
                  {result.columns.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="whitespace-nowrap px-3 py-2 text-left font-mono text-xs font-semibold text-[var(--foreground)]"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, rowIndex) => (
                  <tr key={`row-${rowIndex}`} className="border-t border-[var(--border)]">
                    {row.map((cell, cellIndex) => (
                      <td
                        key={`cell-${rowIndex}-${cellIndex}`}
                        className="max-w-xs truncate px-3 py-2 text-[var(--muted-foreground)]"
                      >
                        {cell === "" ? DASH : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Values such as 007 or a 20-digit reference stay as text so Excel does not drop leading
            zeros or round them.
          </p>
        </section>
      ) : null}
    </div>
  );
}
