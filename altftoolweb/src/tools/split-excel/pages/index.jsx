"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Copy, Download, FileSpreadsheet, RotateCcw } from "lucide-react";

import { SPLIT_MODES, planExcelSplit } from "../lib";

const NUM = new Intl.NumberFormat("en-US");
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SAMPLE_SHEETS = [
  {
    name: "Orders",
    matrix: [
      ["order_id", "customer", "city", "amount"],
      [1001, "Aarav", "Pune", 2450],
      [1002, "Diya", "Delhi", 1890],
      [1003, "Kabir", "Pune", 3120],
      [1004, "Meera", "Mumbai", 760],
      [1005, "Rohan", "Delhi", 5400],
      [1006, "Anaya", "Mumbai", 1230],
      [1007, "Vivaan", "Pune", 980],
    ],
  },
  {
    name: "Refunds",
    matrix: [
      ["order_id", "reason", "amount"],
      [1002, "Damaged", 1890],
      [1006, "Late delivery", 400],
    ],
  },
];

const DEFAULTS = {
  sheetIndex: "0",
  hasHeader: true,
  mode: "rows",
  rowsPerFile: "3",
  fileCount: "2",
  columnIndex: "2",
  baseName: "workbook",
};

export default function ToolHome() {
  const [sheets, setSheets] = useState(SAMPLE_SHEETS);
  const [sheetIndex, setSheetIndex] = useState(DEFAULTS.sheetIndex);
  const [hasHeader, setHasHeader] = useState(DEFAULTS.hasHeader);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [rowsPerFile, setRowsPerFile] = useState(DEFAULTS.rowsPerFile);
  const [fileCount, setFileCount] = useState(DEFAULTS.fileCount);
  const [columnIndex, setColumnIndex] = useState(DEFAULTS.columnIndex);
  const [baseName, setBaseName] = useState(DEFAULTS.baseName);
  const [fileName, setFileName] = useState("");
  const [readError, setReadError] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef(null);

  const result = useMemo(
    () =>
      planExcelSplit({
        sheets,
        sheetIndex: Number(sheetIndex),
        hasHeader,
        mode,
        rowsPerFile: Number(rowsPerFile),
        fileCount: Number(fileCount),
        columnIndex: Number(columnIndex),
        baseName,
      }),
    [sheets, sheetIndex, hasHeader, mode, rowsPerFile, fileCount, columnIndex, baseName],
  );

  const errorMessage = readError || result.error || "";
  const hasError = Boolean(errorMessage);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Split Excel — ${result.partCount} file(s) from ${result.totalRows} data rows`,
      ...result.parts.map((part) => `${part.filename}: ${part.rowCount} rows`),
    ].join("\n");
  }, [hasError, result]);

  const onPickFile = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    setReadError("");
    setBusy(true);
    try {
      const XLSX = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const loaded = workbook.SheetNames.map((name) => ({
        name,
        matrix: XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1, blankrows: false }),
      }));
      if (loaded.length === 0) {
        setReadError("That workbook has no worksheets.");
        return;
      }
      setSheets(loaded);
      setSheetIndex("0");
      setColumnIndex("0");
      setFileName(file.name);
      const stem = file.name.replace(/\.[^.]+$/, "");
      if (stem) setBaseName(stem);
    } catch {
      setReadError("Could not read that file. Use .xlsx, .xls or .csv.");
    } finally {
      setBusy(false);
    }
  };

  const writeWorkbook = async (XLSX, part) => {
    const sheet = XLSX.utils.aoa_to_sheet(part.matrix);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, part.sheetName);
    return XLSX.write(book, { bookType: "xlsx", type: "array" });
  };

  const saveBlob = (data, name, type) => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  const downloadPart = async (part) => {
    setBusy(true);
    try {
      const XLSX = await import("xlsx");
      const data = await writeWorkbook(XLSX, part);
      saveBlob(data, part.filename, XLSX_MIME);
    } finally {
      setBusy(false);
    }
  };

  const downloadZip = async () => {
    if (hasError) return;
    setBusy(true);
    try {
      const [XLSX, { default: JSZip }] = await Promise.all([import("xlsx"), import("jszip")]);
      const zip = new JSZip();
      for (const part of result.parts) {
        const data = await writeWorkbook(XLSX, part);
        zip.file(part.filename, data);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      saveBlob(blob, `${baseName || "workbook"}-parts.zip`, "application/zip");
    } finally {
      setBusy(false);
    }
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

  const reset = () => {
    setSheets(SAMPLE_SHEETS);
    setSheetIndex(DEFAULTS.sheetIndex);
    setHasHeader(DEFAULTS.hasHeader);
    setMode(DEFAULTS.mode);
    setRowsPerFile(DEFAULTS.rowsPerFile);
    setFileCount(DEFAULTS.fileCount);
    setColumnIndex(DEFAULTS.columnIndex);
    setBaseName(DEFAULTS.baseName);
    setFileName("");
    setReadError("");
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
          <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
          Spreadsheet toolkit
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Split Excel</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Split an .xlsx, .xls or .csv workbook into separate spreadsheet files — one per worksheet,
          by rows per file, into equal parts, or one file per value in a column. Everything runs in
          your browser.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="xl-file">
              Workbook file
            </label>
            <input
              id="xl-file"
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={onPickFile}
              className="mt-2 block w-full text-sm text-[var(--muted-foreground)] file:mr-3 file:min-h-11 file:rounded-md file:border file:border-[var(--border)] file:bg-[var(--background)] file:px-4 file:text-sm file:font-semibold file:text-[var(--foreground)]"
            />
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {fileName ? `Loaded ${fileName}` : "Showing a sample workbook — upload your own to replace it."}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="xl-mode">
                Split mode
              </label>
              <select
                id="xl-mode"
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

            {mode !== "sheets" ? (
              <div>
                <label className={LABEL_CLASS} htmlFor="xl-sheet">
                  Worksheet to split
                </label>
                <select
                  id="xl-sheet"
                  value={sheetIndex}
                  onChange={(event) => setSheetIndex(event.target.value)}
                  className={`mt-2 ${INPUT_CLASS}`}
                >
                  {sheets.map((sheet, index) => (
                    <option key={`${sheet.name}-${index}`} value={String(index)}>
                      {sheet.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {mode === "rows" ? (
              <div>
                <label className={LABEL_CLASS} htmlFor="xl-rows-per-file">
                  Rows per file
                </label>
                <input
                  id="xl-rows-per-file"
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
                <label className={LABEL_CLASS} htmlFor="xl-file-count">
                  Number of files
                </label>
                <input
                  id="xl-file-count"
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
                <label className={LABEL_CLASS} htmlFor="xl-column">
                  Split on column
                </label>
                <select
                  id="xl-column"
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
              <label className={LABEL_CLASS} htmlFor="xl-base-name">
                Output file name prefix
              </label>
              <input
                id="xl-base-name"
                type="text"
                value={baseName}
                onChange={(event) => setBaseName(event.target.value)}
                className={`mt-2 ${INPUT_CLASS}`}
              />
            </div>

            <div className="flex items-end">
              <label
                className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-[var(--foreground)]"
                htmlFor="xl-has-header"
              >
                <input
                  id="xl-has-header"
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
          {errorMessage}
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
                : "Each part is a standalone .xlsx workbook with one worksheet."}
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
              aria-label="Download every split workbook as a ZIP archive"
              className={`${PRIMARY_BTN} disabled:opacity-50`}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              {busy ? "Working…" : "Download ZIP"}
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
            <table className="w-full min-w-[460px] text-left text-sm">
              <thead>
                <tr className="text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    File
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Sheet
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
                    <td className="py-2.5 pr-3">{part.sheetName}</td>
                    <td className="py-2.5 pr-3 font-semibold">{NUM.format(part.rowCount)}</td>
                    <td className="py-2.5">
                      <button
                        type="button"
                        onClick={() => downloadPart(part)}
                        disabled={busy}
                        aria-label={`Download ${part.filename}`}
                        className={`${GHOST_BTN} disabled:opacity-50`}
                      >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        XLSX
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
        Formulas, charts and cell formatting are not carried into the split files — output parts
        contain the cell values of the rows they receive.
      </p>
    </main>
  );
}
