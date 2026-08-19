"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, Music, RotateCcw } from "lucide-react";

import {
  INLINE_RECOMMENDED_MAX_BYTES,
  MAX_FILE_BYTES,
  buildDataUrl,
  buildSnippets,
  bytesToBase64,
  detectMimeType,
  estimateEncodedSize,
  formatBytes,
  parseDataUrl,
} from "../lib";

/** 30 seconds of 128 kbit/s MP3, so the size panel shows real figures before a
 * file is chosen: 128000 bits/s × 30 s ÷ 8 = 480,000 bytes. */
const SAMPLE_BYTES = 480000;
const SAMPLE_MIME = "audio/mpeg";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5 break-all text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const int = (value) => (Number.isFinite(value) ? INT.format(value) : DASH);
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);

export default function ToolHome() {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [mimeType, setMimeType] = useState(SAMPLE_MIME);
  const [byteLength, setByteLength] = useState(null);
  const [dataUrl, setDataUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [fileError, setFileError] = useState("");
  const [inspectInput, setInspectInput] = useState("");
  const [copied, setCopied] = useState(false);

  const activeBytes = byteLength === null ? SAMPLE_BYTES : byteLength;
  const estimate = useMemo(
    () => estimateEncodedSize(activeBytes, mimeType),
    [activeBytes, mimeType],
  );
  const hasError = Boolean(estimate.error);

  const snippets = useMemo(() => buildSnippets(dataUrl), [dataUrl]);
  const inspection = useMemo(
    () => (inspectInput.trim() ? parseDataUrl(inspectInput) : null),
    [inspectInput],
  );

  const onFile = useCallback(async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    setFileError("");
    if (file.size > MAX_FILE_BYTES) {
      setFileError(
        `That file is ${formatBytes(file.size)}. Encode files up to ${formatBytes(MAX_FILE_BYTES)}.`,
      );
      setFileName("");
      setMimeType(SAMPLE_MIME);
      setByteLength(null);
      setDataUrl("");
      return;
    }
    setBusy(true);
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const encoded = bytesToBase64(bytes);
      if (encoded.error) {
        setFileError(encoded.error);
        setFileName("");
        setMimeType(SAMPLE_MIME);
        setByteLength(null);
        setDataUrl("");
        return;
      }
      const type = detectMimeType(file.name, file.type);
      const wrapped = buildDataUrl({ base64: encoded.base64, mimeType: type });
      if (wrapped.error) {
        setFileError(wrapped.error);
        setFileName("");
        setMimeType(SAMPLE_MIME);
        setByteLength(null);
        setDataUrl("");
        return;
      }
      setFileName(file.name);
      setMimeType(type);
      setByteLength(bytes.length);
      setDataUrl(wrapped.dataUrl);
      setCopied(false);
    } catch {
      setFileError("That file could not be read. Try a different one.");
      setFileName("");
      setMimeType(SAMPLE_MIME);
      setByteLength(null);
      setDataUrl("");
    } finally {
      setBusy(false);
    }
  }, []);

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

  const downloadText = () => {
    if (!dataUrl) return;
    const blob = new Blob([dataUrl], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName || "audio"}.base64.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFileName("");
    setMimeType(SAMPLE_MIME);
    setByteLength(null);
    setDataUrl("");
    setFileError("");
    setInspectInput("");
    setCopied(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const preview =
    dataUrl.length > 300 ? `${dataUrl.slice(0, 240)}… (+${int(dataUrl.length - 240)} more characters)` : dataUrl;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Music className="h-4 w-4" aria-hidden="true" />
          Audio encoder
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Audio to Base64</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn an MP3, WAV, OGG or M4A file into a <code>data:</code> URL you can paste straight into
          HTML, CSS or JavaScript. Encoding happens in your browser — the file is never uploaded.
        </p>
      </header>

      <section className={CARD}>
        <label className={LABEL_CLASS} htmlFor="audio-file">
          Audio file
        </label>
        <input
          id="audio-file"
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={onFile}
          className="mt-2 block w-full cursor-pointer rounded-md border border-[var(--border)] bg-[var(--background)] p-2.5 text-sm text-[var(--muted-foreground)] file:mr-3 file:min-h-9 file:rounded-md file:border-0 file:bg-[var(--primary)] file:px-3 file:text-sm file:font-semibold file:text-[var(--primary-foreground)]"
        />
        <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
          {busy
            ? "Encoding…"
            : fileName
              ? `${fileName} · ${formatBytes(activeBytes)} · ${mimeType}`
              : `No file yet — the figures below describe a typical 30-second, 128 kbit/s MP3 (${formatBytes(SAMPLE_BYTES)}).`}
        </p>
      </section>

      {fileError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {fileError}
        </p>
      )}
      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {estimate.error}
        </p>
      )}

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Encoded data URL size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : formatBytes(estimate.dataUrlLength)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Choose a non-empty file."
                : `${formatBytes(estimate.byteLength)} original · +${num(estimate.overheadPercent)}% overhead`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the Base64 data URL to clipboard"
              className={GHOST_BTN}
              disabled={!dataUrl}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <span aria-live="polite" role="status" className="sr-only">
              {copied ? "Copied to clipboard." : ""}
            </span>
            <button
              type="button"
              onClick={downloadText}
              aria-label="Download the data URL as a text file"
              className={GHOST_BTN}
              disabled={!dataUrl}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download .txt
            </button>
            <button type="button" onClick={reset} aria-label="Reset the encoder" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Original size", hasError ? DASH : `${int(estimate.byteLength)} bytes`],
            ["Base64 characters", hasError ? DASH : int(estimate.base64Length)],
            ["Full data URL characters", hasError ? DASH : int(estimate.dataUrlLength)],
            ["Padding characters (=)", hasError ? DASH : int(estimate.paddingChars)],
            ["Extra bytes on the wire", hasError ? DASH : formatBytes(estimate.overheadBytes)],
            ["MIME type", mimeType],
            [
              "Safe to inline?",
              hasError ? DASH : estimate.withinRecommended ? "Yes" : "Not recommended",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {estimate.advice}
          </p>
        )}
      </section>

      {dataUrl && (
        <section className={`mt-6 ${CARD}`} aria-live="polite">
          <h2 className="text-base font-semibold">Result</h2>
          <audio className="mt-3 w-full" controls src={dataUrl}>
            Your browser cannot play this audio format.
          </audio>
          <label className={`mt-4 ${LABEL_CLASS}`} htmlFor="data-url-preview">
            Data URL (preview — use Copy for the whole string)
          </label>
          <textarea
            id="data-url-preview"
            rows={6}
            readOnly
            className={`mt-2 ${TEXTAREA_CLASS}`}
            value={preview}
          />
          <h3 className="mt-4 text-sm font-semibold">Paste it as</h3>
          <ul className="mt-2 space-y-2">
            {snippets.map((snippet) => (
              <li key={snippet.id} className="overflow-x-auto rounded-md bg-[var(--muted)] p-3">
                <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                  {snippet.label}
                </p>
                <code className="mt-1 block font-mono text-xs whitespace-pre">{snippet.code}</code>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">Inspect a data URL you already have</h2>
        <label className={`mt-3 ${LABEL_CLASS}`} htmlFor="inspect-input">
          Paste a data: URL
        </label>
        <textarea
          id="inspect-input"
          rows={4}
          className={`mt-2 ${TEXTAREA_CLASS}`}
          value={inspectInput}
          onChange={(event) => setInspectInput(event.target.value)}
          placeholder="data:audio/mpeg;base64,SUQzBAAAA…"
        />
        {inspection && inspection.error && (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {inspection.error}
          </p>
        )}
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {[
            ["Declared MIME type", inspection && !inspection.error ? inspection.mimeType : DASH],
            [
              "Decoded size",
              inspection && !inspection.error ? formatBytes(inspection.byteLength) : DASH,
            ],
            [
              "Base64 characters",
              inspection && !inspection.error ? int(inspection.base64.length) : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Base64 always costs 4 characters for every 3 bytes, so an inlined clip is about a third
        larger than the file it replaces. Keep inlined audio under{" "}
        {formatBytes(INLINE_RECOMMENDED_MAX_BYTES)} — anything bigger is better served as a normal
        file the browser can cache and seek.
      </p>
    </main>
  );
}
