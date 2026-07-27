"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, FileDown, RotateCcw } from "lucide-react";

import {
  HIGH_ENTROPY_THRESHOLD,
  MAX_ENTROPY_BITS,
  SAMPLE_PNG_BASE64,
  analyzeBase64File,
  buildDataUrl,
  formatBytes,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_INPUT = SAMPLE_PNG_BASE64;
const DEFAULT_FILENAME = "download";
const DASH = "—";
const BLANK_ROWS = ["Detected type", "MIME type", "Decoded size", "Suggested file name"];

const integer = new Intl.NumberFormat("en-US");

export default function ToolHome() {
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [filename, setFilename] = useState(DEFAULT_FILENAME);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef(null);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const result = useMemo(() => analyzeBase64File(input, { filename }), [input, filename]);
  const failed = Boolean(result.error);

  const rows = failed
    ? []
    : [
        ["Detected type", result.label],
        ["MIME type", result.mimeType],
        ["Decoded size", `${formatBytes(result.byteLength)} · ${integer.format(result.byteLength)} bytes`],
        ["Base64 length", `${integer.format(result.base64Chars)} chars (+${result.overheadPercent.toFixed(1)}%)`],
        ["First 8 bytes", result.headerHex || DASH],
        ["Byte-order mark", result.bom || "none"],
        ["Entropy", `${result.entropyBitsPerByte.toFixed(2)} of ${MAX_ENTROPY_BITS} bits/byte`],
        ["Declared media type", result.declaredMediaType || "not supplied"],
        ["Suggested file name", result.filename],
      ];

  const handleCopy = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(buildDataUrl(result.bytes, result.mimeType));
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleDownload = () => {
    if (failed) return;
    const blob = new Blob([result.bytes], { type: result.mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleReset = () => {
    setInput(DEFAULT_INPUT);
    setFilename(DEFAULT_FILENAME);
    setCopied(false);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <FileDown className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          Base64 to File
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Paste any Base64 string or <code>data:</code> URL. The bytes are decoded in your browser, the file type is
          read from its magic number, and the download is named with the right extension.
        </p>
      </header>

      <section className="grid gap-4">
        <div>
          <label className={LABEL_CLASS} htmlFor="b64-file-input">
            Base64 payload or data URL
          </label>
          <textarea
            id="b64-file-input"
            className={`${TEXTAREA_CLASS} mt-1.5 h-40`}
            value={input}
            spellCheck={false}
            onChange={(event) => setInput(event.target.value)}
            placeholder="iVBORw0KGgoAAAANSUhEUg…"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="b64-file-name">
              File name (extension is added for you)
            </label>
            <input
              id="b64-file-name"
              className={`${INPUT_CLASS} mt-1.5`}
              value={filename}
              onChange={(event) => setFilename(event.target.value)}
              placeholder="download"
            />
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <button type="button" className={PRIMARY_BTN} onClick={handleDownload} disabled={failed}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Save file
            </button>
            <button type="button" className={GHOST_BTN} onClick={handleReset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>
      </section>

      {failed ? (
        <p
          role="alert"
          className="mt-5 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">Decoded payload</p>
        <p className="mt-1 text-4xl font-bold tracking-tight text-[var(--foreground)]">
          {failed ? DASH : `${formatBytes(result.byteLength)} · .${result.extension}`}
        </p>

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {(failed ? BLANK_ROWS : rows).map((row) => {
            const label = failed ? row : row[0];
            return (
              <div key={label} className="flex flex-wrap items-baseline justify-between gap-2 py-2">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-medium break-all text-[var(--foreground)]">
                  {failed ? DASH : row[1]}
                </dd>
              </div>
            );
          })}
        </dl>

        {!failed && result.isText ? (
          <div className="mt-4">
            <p className="text-xs font-semibold text-[var(--muted-foreground)]">Text preview (first 240 characters)</p>
            <pre className="mt-1 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-xs whitespace-pre-wrap text-[var(--foreground)]">
              {result.textPreview}
            </pre>
          </div>
        ) : null}

        {!failed && result.warnings.length ? (
          <ul className="mt-3 space-y-1 text-xs text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning}>· {warning}</li>
            ))}
          </ul>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className={PRIMARY_BTN}
            onClick={handleCopy}
            disabled={failed}
            aria-label="Copy the payload as a data URL with the detected MIME type"
          >
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy as data URL"}
          </button>
        </div>
      </section>

      <p className="mt-4 text-xs text-[var(--muted-foreground)]">
        Entropy at or above {HIGH_ENTROPY_THRESHOLD} bits/byte means the payload is already compressed or encrypted.
        Nothing is uploaded — decoding and saving happen in this tab.
      </p>
    </div>
  );
}
