"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Download, RotateCcw, Table, Upload } from "lucide-react";

import { DELIMITERS, MAX_INPUT_BYTES, SAMPLE_XML, xmlToCsv } from "../lib";

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

export default function ToolHome() {
  const [xml, setXml] = useState(SAMPLE_XML);
  const [delimiterKey, setDelimiterKey] = useState("comma");
  const [includeHeader, setIncludeHeader] = useState(true);
  const [includeAttributes, setIncludeAttributes] = useState(true);
  const [fileName, setFileName] = useState("");
  const [readError, setReadError] = useState("");
  const [copied, setCopied] = useState(false);

  const delimiter = (DELIMITERS[delimiterKey] || DELIMITERS.comma).value;

  const result = useMemo(
    () => xmlToCsv(xml, { delimiter, includeHeader, includeAttributes }),
    [xml, delimiter, includeHeader, includeAttributes],
  );

  const error = readError || result.error || null;

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
    } catch {
      setReadError("That file could not be read in this browser.");
    }
  };

  const download = () => {
    if (result.error) return;
    const extension = delimiterKey === "tab" ? "tsv" : "csv";
    const base = fileName.replace(/\.xml$/i, "") || result.recordName || "data";
    // U+FEFF byte-order mark so Excel opens the file as UTF-8 rather than ANSI.
    const blob = new Blob(["﻿", result.csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${base}.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const copy = async () => {
    if (result.error) return;
    try {
      await navigator.clipboard.writeText(result.csv);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setXml(SAMPLE_XML);
    setDelimiterKey("comma");
    setIncludeHeader(true);
    setIncludeAttributes(true);
    setFileName("");
    setReadError("");
    setCopied(false);
  };

  const previewRows = result.error ? [] : result.rows.slice(0, PREVIEW_ROWS);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <Table className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          XML to CSV
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Turn repeating XML elements into spreadsheet rows. Everything is parsed in your browser —
          nothing is uploaded.
        </p>
      </header>

      <div>
        <label className={LABEL_CLASS} htmlFor="x2c-xml">
          XML input
        </label>
        <textarea
          id="x2c-xml"
          className={`${TEXTAREA_CLASS} mt-1`}
          value={xml}
          onChange={(event) => {
            setXml(event.target.value);
            setReadError("");
          }}
          spellCheck={false}
          placeholder="<catalog><book id='1'><title>…</title></book></catalog>"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="x2c-delimiter">
            Column delimiter
          </label>
          <select
            id="x2c-delimiter"
            className={`${INPUT_CLASS} mt-1`}
            value={delimiterKey}
            onChange={(event) => setDelimiterKey(event.target.value)}
          >
            {Object.entries(DELIMITERS).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className={LABEL_CLASS}>Options</span>
          <div className="mt-1 flex flex-col gap-2">
            <label className="flex min-h-11 items-center gap-2 text-sm text-[var(--foreground)]" htmlFor="x2c-header">
              <input
                id="x2c-header"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={includeHeader}
                onChange={(event) => setIncludeHeader(event.target.checked)}
              />
              Include a header row
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm text-[var(--foreground)]" htmlFor="x2c-attrs">
              <input
                id="x2c-attrs"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={includeAttributes}
                onChange={(event) => setIncludeAttributes(event.target.checked)}
              />
              Include attributes as columns
            </label>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className={GHOST_BTN} htmlFor="x2c-file">
          <Upload className="h-4 w-4" aria-hidden="true" />
          Upload .xml
          <input id="x2c-file" type="file" accept=".xml,text/xml,application/xml" className="sr-only" onChange={onFile} />
        </label>
        <button type="button" className={PRIMARY_BTN} onClick={download} disabled={Boolean(error)} aria-label="Download the converted CSV file">
          <Download className="h-4 w-4" aria-hidden="true" />
          Download
        </button>
        <button type="button" className={GHOST_BTN} onClick={copy} disabled={Boolean(error)} aria-label="Copy the CSV output to the clipboard">
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copied!" : "Copy CSV"}
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
        <p className="text-sm font-medium text-[var(--muted-foreground)]">Rows produced</p>
        <p className="mt-1 text-4xl font-bold tabular-nums text-[var(--foreground)]">
          {error ? DASH : NUM.format(result.recordCount)}
        </p>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
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
            <dt className="text-sm text-[var(--muted-foreground)]">Elements parsed</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {error ? DASH : NUM.format(result.elementCount)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-[var(--muted-foreground)]">CSV size</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {error ? DASH : `${NUM.format(result.csv.length)} characters`}
            </dd>
          </div>
        </dl>
      </section>

      {!error ? (
        <>
          <section className="mt-5">
            <h2 className="mb-2 text-sm font-semibold text-[var(--foreground)]">
              Preview {result.recordCount > PREVIEW_ROWS ? `(first ${PREVIEW_ROWS} of ${NUM.format(result.recordCount)} rows)` : ""}
            </h2>
            <div className="overflow-x-auto rounded-xl ring-1 ring-[var(--border)]">
              <table className="w-full border-collapse text-sm">
                <caption className="sr-only">Converted table preview</caption>
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
          </section>

          <section className="mt-5">
            <h2 className="mb-2 text-sm font-semibold text-[var(--foreground)]">CSV output</h2>
            <pre className="overflow-x-auto rounded-xl bg-[var(--card)] p-4 font-mono text-xs leading-relaxed text-[var(--foreground)] ring-1 ring-[var(--border)]">
              {result.csv}
            </pre>
          </section>
        </>
      ) : null}
    </div>
  );
}
