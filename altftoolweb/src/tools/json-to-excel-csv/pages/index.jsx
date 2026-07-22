"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  Columns3,
  Download,
  FileJson2,
  FileSpreadsheet,
  RefreshCw,
  Rows3,
  Settings2,
  Sparkles,
  Table2,
  UploadCloud,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const SAMPLE_JSON = JSON.stringify(
  [
    {
      id: 101,
      customer: {
        name: "Saurabh Tiwari",
        email: "saurabh@example.com",
      },
      plan: "Pro",
      amount: 2499,
      currency: "INR",
      active: true,
      tags: ["tool", "export", "spreadsheet"],
      lastPayment: "2026-05-18",
    },
    {
      id: 102,
      customer: {
        name: "Maya Sharma",
        email: "maya@example.com",
      },
      plan: "Team",
      amount: 7999,
      currency: "INR",
      active: false,
      tags: ["invoice", "csv"],
      lastPayment: "2026-05-21",
    },
  ],
  null,
  2
);

const DELIMITERS = [
  { label: "Comma CSV", value: ",", helper: "Best for Excel and Sheets" },
  { label: "Semicolon CSV", value: ";", helper: "Useful for EU locales" },
  { label: "Tab TSV", value: "\t", helper: "Great for copy-paste tables" },
];

const DEFAULT_OPTIONS = {
  delimiter: ",",
  flattenNested: true,
  includeRowIndex: false,
  emptyValue: "",
  sheetName: "JSON Export",
};

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(value || 0);
}

function sanitizeFileName(value, fallback = "json-export") {
  const safe = String(value || "")
    .trim()
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return safe || fallback;
}

function scalarToCell(value) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

function flattenRecord(value, prefix = "", output = {}, stats = { nested: 0 }, flattenNested = true) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    output[prefix || "value"] = scalarToCell(value);
    return output;
  }

  Object.entries(value).forEach(([key, item]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    const isPlainObject = item && typeof item === "object" && !Array.isArray(item);

    if (isPlainObject && flattenNested) {
      stats.nested += 1;
      flattenRecord(item, path, output, stats, flattenNested);
      return;
    }

    if (Array.isArray(item)) {
      stats.nested += 1;
      output[path] = item.every((entry) => entry === null || typeof entry !== "object")
        ? item.map(scalarToCell).join(", ")
        : JSON.stringify(item);
      return;
    }

    output[path] = scalarToCell(item);
  });

  return output;
}

function isTabularArray(value) {
  return Array.isArray(value) && (value.length === 0 || value.some((item) => item && typeof item === "object" && !Array.isArray(item)));
}

function findArrayPath(value) {
  if (Array.isArray(value)) return { path: "root", value };
  if (!value || typeof value !== "object") return null;

  const direct = Object.entries(value).find(([, item]) => isTabularArray(item));
  if (direct) return { path: direct[0], value: direct[1] };

  for (const [key, item] of Object.entries(value)) {
    const nested = findArrayPath(item);
    if (nested) return { path: `${key}.${nested.path}`, value: nested.value };
  }

  return null;
}

function normalizeJson(value, options) {
  const stats = { nested: 0 };
  const arrayMatch = findArrayPath(value);
  const payload = arrayMatch ? arrayMatch.value : [value];
  const sourcePath = arrayMatch?.path || "root object";
  const safeRows = payload.length ? payload : [];

  const rows = safeRows.map((item, index) => {
    const row =
      item && typeof item === "object" && !Array.isArray(item)
        ? flattenRecord(item, "", {}, stats, options.flattenNested)
        : { value: scalarToCell(item) };

    return options.includeRowIndex ? { row_index: index + 1, ...row } : row;
  });

  if (!rows.length) {
    return { rows: [], headers: [], nestedCount: stats.nested, sourcePath };
  }

  const headers = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key));
      return set;
    }, new Set())
  );

  return { rows, headers, nestedCount: stats.nested, sourcePath };
}

function escapeCsvValue(value, delimiter) {
  const text = scalarToCell(value);
  const mustQuote = text.includes(delimiter) || text.includes("\n") || text.includes("\r") || text.includes('"');
  const escaped = text.replace(/"/g, '""');
  return mustQuote ? `"${escaped}"` : escaped;
}

function rowsToDelimitedText(rows, headers, options) {
  if (!headers.length) return "";
  const delimiter = options.delimiter;
  const lines = [
    headers.map((header) => escapeCsvValue(header, delimiter)).join(delimiter),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          return escapeCsvValue(value === "" || value === undefined || value === null ? options.emptyValue : value, delimiter);
        })
        .join(delimiter)
    ),
  ];
  return lines.join("\n");
}

function escapeHtml(value) {
  return scalarToCell(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rowsToExcelHtml(rows, headers, options) {
  const sheetName = escapeHtml(options.sheetName || "JSON Export");
  const headerHtml = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("");
  const bodyHtml = rows
    .map(
      (row) =>
        `<tr>${headers
          .map((header) => {
            const value = row[header];
            return `<td>${escapeHtml(value === "" || value === undefined || value === null ? options.emptyValue : value)}</td>`;
          })
          .join("")}</tr>`
    )
    .join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="ProgId" content="Excel.Sheet" />
  <meta name="Generator" content="AltFTool JSON to Excel/CSV Converter" />
  <title>${sheetName}</title>
  <style>
    table { border-collapse: collapse; font-family: Arial, sans-serif; }
    th { background: #2563eb; color: #ffffff; font-weight: 700; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 10px; mso-number-format: "\\@"; }
  </style>
</head>
<body>
  <table>
    <thead><tr>${headerHtml}</tr></thead>
    <tbody>${bodyHtml}</tbody>
  </table>
</body>
</html>`;
}

function downloadBlob(fileName, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function MetricCard({ icon: Icon, label, value, helper }) {
  return (
    <article className="tool-card min-w-0 overflow-hidden !p-4 text-center sm:!p-5">
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:text-left">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">{label}</p>
          <p className="mt-1 break-words text-2xl font-bold leading-tight text-[var(--foreground)] sm:text-3xl">{value}</p>
          <p className="mt-1 text-sm leading-5 text-[var(--muted-foreground)]">{helper}</p>
        </div>
      </div>
    </article>
  );
}

function ToggleOption({ active, label, helper, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-0 rounded-lg border px-4 py-3 text-left transition ${
        active
          ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200"
          : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:border-blue-300"
      }`}
    >
      <span className="block text-sm font-semibold">{label}</span>
      <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">{helper}</span>
    </button>
  );
}

export default function JSONToExcelCSV() {
  const fileRef = useRef(null);
  const [input, setInput] = useState(SAMPLE_JSON);
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [fileName, setFileName] = useState("sample-customers.json");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    try {
      const parsed = JSON.parse(input.trim() || "[]");
      const normalized = normalizeJson(parsed, options);
      return {
        ok: true,
        error: "",
        ...normalized,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || "Invalid JSON",
        rows: [],
        headers: [],
        nestedCount: 0,
        sourcePath: "not parsed",
      };
    }
  }, [input, options]);

  const csvOutput = useMemo(
    () => (result.ok ? rowsToDelimitedText(result.rows, result.headers, options) : ""),
    [result, options]
  );

  const previewRows = result.rows.slice(0, 10);
  const exportBaseName = sanitizeFileName(fileName.replace(/\.[^.]+$/, ""), "json-export");
  const delimiterLabel = DELIMITERS.find((item) => item.value === options.delimiter)?.label || "CSV";

  const updateOption = (key, value) => {
    setOptions((current) => ({ ...current, [key]: value }));
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    setInput(text);
    setFileName(file.name);
    event.target.value = "";
  };

  const handleCopy = async () => {
    if (!csvOutput) return;
    await safeCopyText(csvOutput);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const handleCsvDownload = () => {
    const extension = options.delimiter === "\t" ? "tsv" : "csv";
    downloadBlob(`${exportBaseName}.${extension}`, csvOutput, "text/csv;charset=utf-8");
  };

  const handleExcelDownload = () => {
    const excelHtml = rowsToExcelHtml(result.rows, result.headers, options);
    downloadBlob(`${exportBaseName}.xls`, excelHtml, "application/vnd.ms-excel;charset=utf-8");
  };

  return (
    <main className="mx-auto w-full max-w-[1240px] px-4 pb-12 pt-8 text-[var(--foreground)] sm:px-6 sm:pt-10 lg:px-8">
      <section className="text-center">
        <div className="flex flex-wrap justify-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-200">
            <Sparkles className="h-4 w-4" />
            Data converter
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
            <CheckCircle2 className="h-4 w-4" />
            Browser-side only
          </span>
        </div>
        <h1 className="tool-heading-accent mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          JSON to Excel/CSV Converter
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">
          Paste JSON content or select a JSON file, flatten nested records, preview spreadsheet rows, then export clean
          CSV, TSV, or Excel-ready files without sending data anywhere.
        </p>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Rows3} label="Rows" value={formatNumber(result.rows.length)} helper={`${result.sourcePath} source`} />
        <MetricCard icon={Columns3} label="Columns" value={formatNumber(result.headers.length)} helper="Auto-detected fields" />
        <MetricCard icon={Table2} label="Nested fields" value={formatNumber(result.nestedCount)} helper="Flattened or preserved" />
        <MetricCard icon={FileSpreadsheet} label="Export" value={delimiterLabel.replace(" CSV", "")} helper="CSV + Excel-ready XLS" />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="tool-card min-w-0 overflow-hidden !p-5 sm:!p-6">
          <div className="flex flex-col gap-4 min-[900px]:flex-row min-[900px]:items-start min-[900px]:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10">
                <FileJson2 className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <h2 className="text-2xl font-bold">JSON Input</h2>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Paste JSON, upload a file, or load a sample dataset.
                </p>
              </div>
            </div>
            <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:flex sm:flex-wrap sm:justify-end">
              <button
                type="button"
                className="btn-secondary min-w-[118px] justify-center whitespace-nowrap"
                onClick={() => {
                  setInput(SAMPLE_JSON);
                  setFileName("sample-customers.json");
                }}
              >
                <RefreshCw className="h-4 w-4" />
                Sample
              </button>
              <button
                type="button"
                className="btn-primary min-w-[118px] justify-center whitespace-nowrap"
                onClick={() => fileRef.current?.click()}
              >
                <UploadCloud className="h-4 w-4" />
                Upload JSON
              </button>
              <input ref={fileRef} type="file" accept=".json,.txt,application/json" className="hidden" onChange={handleFile} />
            </div>
          </div>

          <label className="mt-5 block text-sm font-semibold" htmlFor="json-excel-input">
            JSON content
          </label>
          <textarea
            id="json-excel-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            spellCheck={false}
            className="mt-2 min-h-[420px] w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 font-mono text-sm leading-6 text-[var(--foreground)] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />

          {!result.ok ? (
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <span className="break-words">JSON parse error: {result.error}</span>
            </div>
          ) : (
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <span className="break-words">
                JSON parsed successfully. {formatNumber(result.rows.length)} rows are ready for spreadsheet export.
              </span>
            </div>
          )}

          <div className="mt-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Settings2 className="h-4 w-4 text-blue-600" />
              Export Options
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <ToggleOption
                active={options.flattenNested}
                label="Flatten nested objects"
                helper="Turns customer.name into a column."
                onClick={() => updateOption("flattenNested", !options.flattenNested)}
              />
              <ToggleOption
                active={options.includeRowIndex}
                label="Add row index"
                helper="Adds row_index as the first column."
                onClick={() => updateOption("includeRowIndex", !options.includeRowIndex)}
              />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block min-w-0 text-sm font-semibold">
                Delimiter
                <select
                  value={options.delimiter}
                  onChange={(event) => updateOption("delimiter", event.target.value)}
                  className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  {DELIMITERS.map((item) => (
                    <option key={item.label} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block min-w-0 text-sm font-semibold">
                Sheet name
                <input
                  value={options.sheetName}
                  onChange={(event) => updateOption("sheetName", event.target.value)}
                  className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </label>
              <label className="block min-w-0 text-sm font-semibold sm:col-span-2">
                Empty value placeholder
                <input
                  value={options.emptyValue}
                  onChange={(event) => updateOption("emptyValue", event.target.value)}
                  placeholder="Leave blank for empty cells"
                  className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="tool-card min-w-0 overflow-hidden !p-5 sm:!p-6">
            <div className="flex flex-col gap-4 min-[900px]:flex-row min-[900px]:items-start min-[900px]:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10">
                  <Table2 className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Spreadsheet Preview</p>
                  <h2 className="text-2xl font-bold">Generated Table</h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Showing first {formatNumber(previewRows.length)} rows from the converted output.
                  </p>
                </div>
              </div>
              <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:flex sm:flex-wrap sm:justify-end">
                <button
                  type="button"
                  className="btn-secondary min-w-[112px] justify-center whitespace-nowrap"
                  disabled={!csvOutput}
                  onClick={handleCopy}
                >
                  <Clipboard className="h-4 w-4" />
                  {copied ? "Copied" : "Copy CSV"}
                </button>
                <button
                  type="button"
                  className="btn-primary min-w-[112px] justify-center whitespace-nowrap"
                  disabled={!csvOutput}
                  onClick={handleCsvDownload}
                >
                  <Download className="h-4 w-4" />
                  CSV
                </button>
                <button
                  type="button"
                  className="btn-primary col-span-2 min-w-[132px] justify-center whitespace-nowrap sm:col-span-1"
                  disabled={!csvOutput}
                  onClick={handleExcelDownload}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel XLS
                </button>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-lg border border-[var(--border)]">
              <div className="max-h-[360px] overflow-auto">
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead className="sticky top-0 bg-blue-600 text-white">
                    <tr>
                      {result.headers.length ? (
                        result.headers.map((header) => (
                          <th key={header} className="min-w-[140px] whitespace-nowrap px-3 py-3 font-semibold">
                            {header}
                          </th>
                        ))
                      ) : (
                        <th className="px-3 py-3 font-semibold">No columns yet</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.length ? (
                      previewRows.map((row, rowIndex) => (
                        <tr key={`${rowIndex}-${result.headers.join("-")}`} className="border-t border-[var(--border)]">
                          {result.headers.map((header) => (
                            <td key={header} className="max-w-[280px] break-words px-3 py-3 text-[var(--foreground)]">
                              {row[header] === "" || row[header] === undefined || row[header] === null
                                ? options.emptyValue || " "
                                : scalarToCell(row[header])}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-3 py-6 text-center text-[var(--muted-foreground)]">Valid rows will appear here.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="tool-card min-w-0 overflow-hidden !p-5 sm:!p-6">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
                <FileSpreadsheet className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Delimited Output</p>
                <h2 className="text-2xl font-bold">CSV / TSV Text</h2>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Ready to paste into Excel, Google Sheets, or a data pipeline.
                </p>
              </div>
            </div>
            <pre className="mt-5 max-h-[360px] min-h-[260px] overflow-auto rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 font-mono text-sm leading-6 text-[var(--foreground)]">
              <code>{csvOutput || "Delimited output will appear here."}</code>
            </pre>
          </div>
        </div>
      </section>
    </main>
  );
}
