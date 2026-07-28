"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, Download, LockOpen, RotateCcw } from "lucide-react";
import {
  MAX_PDF_BYTES,
  formatBytes,
  inspectPdf,
  unlockPdf,
  unlockedFileName,
} from "../lib";

const DASH = "—";

export default function UnlockPdf() {
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [bytes, setBytes] = useState(null);
  const [info, setInfo] = useState(null);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!downloadUrl) return undefined;
    return () => URL.revokeObjectURL(downloadUrl);
  }, [downloadUrl]);

  const clearOutput = useCallback(() => {
    setResult(null);
    setError("");
    setCopied(false);
    setDownloadUrl("");
  }, []);

  const handleFile = useCallback(
    async (file) => {
      clearOutput();
      setInfo(null);
      setBytes(null);
      if (!file) {
        setFileName("");
        setFileSize(0);
        return;
      }
      setFileName(file.name);
      setFileSize(file.size);
      setBusy(true);
      try {
        const buffer = await file.arrayBuffer();
        const view = new Uint8Array(buffer);
        setBytes(view);
        const inspection = await inspectPdf(view);
        if (inspection.error) {
          setError(inspection.error);
          setInfo(null);
        } else {
          setInfo(inspection);
        }
      } catch {
        setError("That file could not be read. Try choosing it again.");
      } finally {
        setBusy(false);
      }
    },
    [clearOutput],
  );

  const runUnlock = useCallback(async () => {
    if (!bytes) {
      setError("Choose a PDF file first.");
      return;
    }
    clearOutput();
    setBusy(true);
    try {
      const outcome = await unlockPdf(bytes, password);
      if (outcome.error) {
        setError(outcome.error);
        setResult(null);
      } else {
        setResult(outcome);
        const blob = new Blob([outcome.bytes], { type: "application/pdf" });
        setDownloadUrl(URL.createObjectURL(blob));
      }
    } catch {
      setError("Something went wrong while unlocking this PDF.");
    } finally {
      setBusy(false);
    }
  }, [bytes, password, clearOutput]);

  const reset = useCallback(() => {
    clearOutput();
    setInfo(null);
    setBytes(null);
    setFileName("");
    setFileSize(0);
    setPassword("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [clearOutput]);

  const copySummary = useCallback(async () => {
    if (!result) return;
    const text = [
      `Unlocked: ${unlockedFileName(fileName)}`,
      `Encryption removed: ${result.algorithmLabel}`,
      `Pages: ${result.pageCount === null ? "unknown" : result.pageCount}`,
      `Output size: ${formatBytes(result.byteLength)}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }, [result, fileName]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <header className="mb-6 flex items-start gap-3">
        <LockOpen aria-hidden="true" className="mt-1 h-6 w-6 text-[var(--primary)]" />
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Unlock PDF</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Enter the password you already have and download a copy with the encryption removed.
            The file never leaves your browser, and no password is guessed or recovered.
          </p>
        </div>
      </header>

      <section className="grid gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="up-file" className="text-sm font-medium text-[var(--foreground)]">
            Password-protected PDF
          </label>
          <input
            id="up-file"
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={(event) => handleFile(event.target.files?.[0] || null)}
            className="h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] file:mr-3 file:rounded file:border-0 file:bg-[var(--primary)] file:px-3 file:py-1.5 file:text-[var(--primary-foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          />
          <p className="text-xs text-[var(--muted-foreground)]">
            Up to {formatBytes(MAX_PDF_BYTES)}. RC4 40/128-bit and AES-256 are supported.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="up-password" className="text-sm font-medium text-[var(--foreground)]">
            PDF password
          </label>
          <input
            id="up-password"
            type="password"
            autoComplete="off"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              clearOutput();
            }}
            placeholder="The password that opens this file"
            className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          />
        </div>
      </section>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={runUnlock}
          disabled={busy || !bytes}
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] transition active:scale-[0.98] disabled:opacity-50 motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
        >
          <LockOpen aria-hidden="true" className="h-4 w-4" />
          {busy ? "Working…" : "Remove password"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-medium text-[var(--foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
        >
          <RotateCcw aria-hidden="true" className="h-4 w-4" />
          Reset
        </button>
        <button
          type="button"
          onClick={copySummary}
          disabled={!result}
          aria-label="Copy unlock summary to clipboard"
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-medium text-[var(--foreground)] transition active:scale-[0.98] disabled:opacity-50 motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
        >
          {copied ? (
            <Check aria-hidden="true" className="h-4 w-4 text-[var(--success)]" />
          ) : (
            <Copy aria-hidden="true" className="h-4 w-4" />
          )}
          {copied ? "Copied!" : "Copy summary"}
        </button>
      </div>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-sm text-[var(--muted-foreground)]">Unlocked file</p>
        <p className="mt-1 text-2xl font-semibold break-all text-[var(--foreground)] sm:text-3xl">
          {result ? unlockedFileName(fileName) : DASH}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {result
            ? `${result.algorithmLabel} removed`
            : info
              ? info.encrypted
                ? `Encrypted with ${info.algorithmLabel} — enter the password above`
                : "This PDF is not password protected"
              : "Choose a PDF to begin"}
        </p>

        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
          >
            {error}
          </p>
        ) : null}

        {result && downloadUrl ? (
          <a
            href={downloadUrl}
            download={unlockedFileName(fileName)}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
          >
            <Download aria-hidden="true" className="h-4 w-4" />
            Download unlocked PDF
          </a>
        ) : null}

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Source file</dt>
            <dd className="max-w-[60%] truncate font-medium text-[var(--foreground)]">
              {fileName || DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Source size</dt>
            <dd className="font-medium text-[var(--foreground)]">
              {fileSize ? formatBytes(fileSize) : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Encryption detected</dt>
            <dd className="font-medium text-[var(--foreground)]">
              {info ? (info.encrypted ? info.algorithmLabel : "None") : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Key length</dt>
            <dd className="font-medium text-[var(--foreground)]">
              {info && info.keyLength ? `${info.keyLength} bits` : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Pages</dt>
            <dd className="font-medium text-[var(--foreground)]">
              {error ? DASH : result && result.pageCount !== null ? result.pageCount : DASH}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Output size</dt>
            <dd className="font-medium text-[var(--foreground)]">
              {error || !result ? DASH : formatBytes(result.byteLength)}
            </dd>
          </div>
        </dl>

        <p className="mt-4 text-xs text-[var(--muted-foreground)]">
          Only use this on documents you own or are authorised to open. The password is required —
          nothing here recovers or bypasses an unknown one.
        </p>
      </section>
    </div>
  );
}
