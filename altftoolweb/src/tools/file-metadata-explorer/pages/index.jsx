"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Copy, FileSearch, RotateCcw, Upload } from "lucide-react";

import {
  MAX_FILE_BYTES,
  formatBytes,
  formatDuration,
  inspectFile,
  sampleFile,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN");

const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);

const titleise = (key) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .replace(/\bHz\b/i, "Hz")
    .trim();

const renderValue = (key, value) => {
  if (value === null || value === undefined || value === "") return DASH;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (key === "durationSeconds") return `${formatDuration(value)} (${value}s)`;
  if (typeof value === "number") return NUM.format(value);
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

export default function ToolHome() {
  const [record, setRecord] = useState(() => sampleFile());
  const [readError, setReadError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  const meta = useMemo(() => inspectFile(record), [record]);
  const hasError = Boolean(meta.error) || Boolean(readError);
  const errorMessage = readError || meta.error || "";

  const loadFile = async (file) => {
    if (!file) return;
    setCopied(false);
    if (file.size > MAX_FILE_BYTES) {
      setReadError(`That file is larger than the ${formatBytes(MAX_FILE_BYTES)} this reader handles.`);
      return;
    }
    try {
      const buffer = await file.arrayBuffer();
      setReadError("");
      setRecord({
        name: file.name,
        size: file.size,
        type: file.type || "",
        lastModified: file.lastModified ?? null,
        bytes: new Uint8Array(buffer),
      });
    } catch {
      setReadError("The browser could not read that file. Try choosing it again.");
    }
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    loadFile(event.dataTransfer?.files?.[0]);
  };

  const reset = () => {
    setRecord(sampleFile());
    setReadError("");
    setCopied(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const detailRows = useMemo(() => {
    if (hasError || !meta.details) return [];
    return Object.entries(meta.details)
      .filter(([key, value]) => key !== "error" && value !== null && value !== undefined && typeof value !== "object")
      .map(([key, value]) => [titleise(key), renderValue(key, value)]);
  }, [hasError, meta]);

  const exifRows = useMemo(() => {
    if (hasError || !meta.exif) return [];
    return Object.entries(meta.exif).map(([key, value]) => [titleise(key), renderValue(key, value)]);
  }, [hasError, meta]);

  const textRows = useMemo(() => {
    if (hasError || !meta.text || meta.text.error) return [];
    return [
      ["Characters", num(meta.text.characters)],
      ["Words", num(meta.text.words)],
      ["Lines", num(meta.text.lines)],
      ["Line endings", meta.text.lineEnding],
      ["Reading time", `${num(meta.text.readingMinutes)} min`],
    ];
  }, [hasError, meta]);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `File: ${meta.fileName}`,
      `Size: ${meta.sizeLabel} (${num(meta.sizeBytes)} bytes)`,
      `Detected format: ${meta.detected.label} (${meta.detected.mime})`,
      `Browser-reported type: ${meta.browserMimeType}`,
      `Magic bytes: ${meta.hexSignature}`,
      `CRC-32: ${meta.crc32}`,
      `Entropy: ${meta.entropyBitsPerByte} bits/byte`,
      ...detailRows.map(([label, value]) => `${label}: ${value}`),
      ...exifRows.map(([label, value]) => `EXIF ${label}: ${value}`),
      ...textRows.map(([label, value]) => `${label}: ${value}`),
    ].join("\n");
  }, [hasError, meta, detailRows, exifRows, textRows]);

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

  const modifiedLabel =
    !hasError && Number.isFinite(meta.lastModified)
      ? new Date(meta.lastModified).toLocaleString()
      : DASH;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <FileSearch className="h-4 w-4" aria-hidden="true" />
          Metadata explorer
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">File Metadata Explorer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Reads the real header bytes of a file — magic number, image dimensions, EXIF camera data,
          audio frame headers, PDF structure — and checks that the extension matches what the bytes
          actually say. Everything is parsed in this tab; nothing is uploaded.
        </p>
      </header>

      <section className={CARD}>
        <label className={LABEL_CLASS} htmlFor="file-input">
          Choose a file to inspect
        </label>
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`mt-2 rounded-lg border-2 border-dashed p-5 text-center transition ${
            dragging ? "border-[var(--primary)] bg-[var(--muted)]" : "border-[var(--border)]"
          }`}
        >
          <Upload className="mx-auto h-6 w-6 text-[var(--muted-foreground)]" aria-hidden="true" />
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Drag a file here, or pick one below. Up to {formatBytes(MAX_FILE_BYTES)}.
          </p>
          <input
            id="file-input"
            ref={inputRef}
            type="file"
            className={`mt-3 ${INPUT_CLASS} py-2 file:mr-3 file:h-8 file:rounded-md file:border-0 file:bg-[var(--primary)] file:px-3 file:text-sm file:font-semibold file:text-[var(--primary-foreground)]`}
            onChange={(event) => loadFile(event.target.files?.[0])}
          />
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

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              File size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : meta.sizeLabel}
            </p>
            <p className="mt-1 truncate text-sm text-[var(--muted-foreground)]">
              {hasError ? "Choose a readable file to see its metadata." : `${meta.fileName} — ${meta.detected.label}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the extracted metadata to clipboard"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy metadata"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset back to the sample file"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && meta.extensionMatches === false && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-semibold text-[var(--danger)]">
            Extension mismatch: the name ends in .{meta.extension || "(none)"} but the bytes are a{" "}
            {meta.detected.label}.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Exact size", hasError ? DASH : `${num(meta.sizeBytes)} bytes`],
            ["Detected format", hasError ? DASH : meta.detected.label],
            ["True MIME type (from bytes)", hasError ? DASH : meta.detected.mime],
            ["Type the browser reported", hasError ? DASH : meta.browserMimeType],
            ["First 16 bytes (hex)", hasError ? DASH : meta.hexSignature],
            ["CRC-32 checksum", hasError ? DASH : meta.crc32],
            [
              "Entropy",
              hasError ? DASH : `${meta.entropyBitsPerByte} bits/byte (8 = fully compressed or encrypted)`,
            ],
            ["Last modified", modifiedLabel],
            ["Pixel dimensions", hasError || !meta.details?.width ? DASH : `${num(meta.details.width)} x ${num(meta.details.height)}`],
            ["Aspect ratio", hasError || !meta.aspectRatio ? DASH : meta.aspectRatio],
            ["Megapixels", hasError || !meta.megapixels ? DASH : `${meta.megapixels} MP`],
            ["Bytes per pixel", hasError || !meta.bytesPerPixel ? DASH : meta.bytesPerPixel],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="min-w-0 text-right font-mono text-xs break-all sm:text-sm">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && detailRows.length > 0 && (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Format-specific header fields</h2>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            {detailRows.map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold break-all">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {!hasError && exifRows.length > 0 && (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">EXIF camera data</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Read straight from the APP1 / TIFF tags in the file. GPS coordinates appear here when the
            camera recorded them.
          </p>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            {exifRows.map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold break-all">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {!hasError && textRows.length > 0 && (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Text statistics</h2>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            {textRows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Files never leave your device — the bytes are read with the browser File API and parsed in
        this tab. Header fields come from each format&apos;s own specification, so anything a file
        does not record (for example EXIF on a screenshot) is simply absent rather than guessed.
      </p>
    </main>
  );
}
