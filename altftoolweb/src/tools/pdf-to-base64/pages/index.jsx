"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download, FileUp, RotateCcw } from "lucide-react";

import {
  bytesToBase64,
  dataUrlPrefix,
  formatBytes,
  inspectPdfBytes,
  inspectPdfFile,
  MAX_FILE_BYTES,
  PDF_MIME,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] file:mr-3 file:h-8 file:rounded-md file:border-0 file:bg-[var(--muted)] file:px-3 file:text-sm file:font-semibold file:text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export default function ToolHome() {
  const [fileMeta, setFileMeta] = useState(null);
  const [fileHandle, setFileHandle] = useState(null);
  const [dataUrl, setDataUrl] = useState("");
  const [header, setHeader] = useState(null);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const [copied, setCopied] = useState(false);

  const report = useMemo(() => (fileMeta ? inspectPdfFile(fileMeta) : null), [fileMeta]);
  const reportError = report ? report.error : "";
  const errorMessage = failure || reportError || "";
  const hasError = Boolean(errorMessage);

  const onPick = (event) => {
    const file = event.target.files && event.target.files[0];
    setDataUrl("");
    setHeader(null);
    setFailure("");
    setCopied(false);
    if (!file) {
      setFileMeta(null);
      setFileHandle(null);
      return;
    }
    setFileHandle(file);
    setFileMeta({ name: file.name, size: file.size, type: file.type });
  };

  const convert = async () => {
    if (!fileHandle || hasError) return;
    setBusy(true);
    setFailure("");
    try {
      const buffer = await fileHandle.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const inspected = inspectPdfBytes(bytes);
      setHeader(inspected);
      if (!inspected.isPdf) {
        setFailure("That file does not start with %PDF-, so it is not a PDF. Check the file and try again.");
        setDataUrl("");
        return;
      }
      setDataUrl(dataUrlPrefix(PDF_MIME) + bytesToBase64(bytes));
    } catch {
      setFailure("The file could not be read. It may be too large for this browser tab.");
      setDataUrl("");
    } finally {
      setBusy(false);
    }
  };

  const copyResult = async () => {
    if (!dataUrl) return;
    try {
      await navigator.clipboard.writeText(dataUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const download = () => {
    if (!dataUrl || !report) return;
    const blob = new Blob([dataUrl], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${report.name || "document"}.base64.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFileMeta(null);
    setFileHandle(null);
    setDataUrl("");
    setHeader(null);
    setFailure("");
    setBusy(false);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <FileUp className="h-4 w-4" aria-hidden="true" />
          RFC 4648 · RFC 2397
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">PDF to Base64</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert a local PDF into a Base64 data URL for an email API, a JSON payload or an inline
          preview. The file is read and encoded in this browser tab — nothing is uploaded.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <label className={LABEL_CLASS} htmlFor="pdf-file">
          Choose a PDF (up to {formatBytes(MAX_FILE_BYTES)})
        </label>
        <input
          id="pdf-file"
          className={`mt-2 ${INPUT_CLASS}`}
          type="file"
          accept="application/pdf,.pdf"
          onChange={onPick}
        />
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          The header is checked for the %PDF- marker before encoding, so a renamed file is caught
          early.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={convert}
            disabled={!fileHandle || hasError || busy}
            className={PRIMARY_BTN}
            aria-label="Convert the selected PDF to Base64"
          >
            {busy ? "Encoding…" : "Convert to Base64"}
          </button>
          <button type="button" onClick={reset} className={GHOST_BTN} aria-label="Clear the selected file">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {errorMessage}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Base64 output size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError || !report ? DASH : formatBytes(report.dataUrlLength)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError || !report
                ? "Pick a PDF to see the encoded size."
                : `${formatBytes(report.size)} of PDF becomes ${NUM.format(report.dataUrlLength)} characters`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the Base64 data URL to the clipboard"
              className={GHOST_BTN}
              disabled={!dataUrl}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy data URL"}
            </button>
            <button
              type="button"
              onClick={download}
              aria-label="Download the Base64 text as a file"
              className={GHOST_BTN}
              disabled={!dataUrl}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download .txt
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["File name", hasError || !report ? DASH : report.name],
            ["MIME type", hasError || !report ? DASH : report.mime],
            [
              "Original size",
              hasError || !report ? DASH : formatBytes(report.size),
            ],
            [
              "Base64 characters (payload only)",
              hasError || !report ? DASH : NUM.format(report.base64Length),
            ],
            [
              "Padding characters",
              hasError || !report ? DASH : `${report.paddingChars} "=" at the end`,
            ],
            ["Size increase", hasError || !report ? DASH : `+${report.growthPercent.toFixed(1)}%`],
            ["PDF version", hasError || !header ? DASH : header.version || "not declared"],
            [
              "Ends with %%EOF",
              hasError || !header ? DASH : header.hasEofMarker ? "Yes" : "No — file may be truncated",
            ],
            [
              "Fast web view (linearised)",
              hasError || !header ? DASH : header.linearHint ? "Yes" : "No",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold break-all">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {dataUrl && !hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Data URL</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            First 400 characters shown. Use the copy button for the full string.
          </p>
          <pre className="mt-3 max-h-48 overflow-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-xs break-all whitespace-pre-wrap">
            {dataUrl.slice(0, 400)}
            {dataUrl.length > 400 ? "…" : ""}
          </pre>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Base64 stores three bytes as four characters, so the text is always about 33% larger than
        the PDF. That is why email APIs that accept Base64 attachments quote a smaller effective
        size limit than the raw file size suggests.
      </p>
    </main>
  );
}
