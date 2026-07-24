"use client";

import { useMemo, useRef, useState } from "react";
import {
  Check,
  CheckCircle2,
  Clipboard,
  FileCheck2,
  Fingerprint,
  LoaderCircle,
  RotateCcw,
  ShieldAlert,
  Upload,
  XCircle,
} from "lucide-react";

import { safeCopyText } from "@/shared/utils/clipboard";
import {
  ALGORITHMS,
  compareChecksums,
  digestFile,
  validateExpectedChecksum,
} from "../lib/checksum.mjs";

const MAX_FILE_SIZE = 512 * 1024 * 1024;

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

export default function FileChecksumComparator() {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [expected, setExpected] = useState("");
  const [algorithm, setAlgorithm] = useState("auto");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const expectedValidation = useMemo(
    () => (expected.trim() ? validateExpectedChecksum(expected, algorithm) : null),
    [algorithm, expected],
  );

  const chooseFile = (nextFile) => {
    setResult(null);
    setError("");
    setCopied(false);
    if (!nextFile) {
      setFile(null);
      return;
    }
    if (nextFile.size > MAX_FILE_SIZE) {
      setFile(null);
      setError("Choose a file up to 512 MB so this tab does not run out of memory.");
      return;
    }
    setFile(nextFile);
  };

  const compare = async (event) => {
    event.preventDefault();
    if (!file || busy) return;

    const validation = validateExpectedChecksum(expected, algorithm);
    if (!validation.ok) {
      setError(validation.error);
      setResult(null);
      return;
    }

    setBusy(true);
    setError("");
    setResult(null);
    setCopied(false);

    try {
      const actual = await digestFile(file, validation.algorithm);
      setResult({
        actual,
        expected: validation.checksum,
        algorithm: validation.algorithm,
        matches: compareChecksums(actual, validation.checksum),
      });
    } catch {
      setError("The file could not be hashed in this browser. Try a smaller file or a current browser.");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setFile(null);
    setExpected("");
    setAlgorithm("auto");
    setResult(null);
    setError("");
    setCopied(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const copyActual = async () => {
    if (!result) return;
    const didCopy = await safeCopyText(result.actual);
    setCopied(didCopy);
    if (didCopy) window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
      <header className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary)]">
              <Fingerprint className="h-4 w-4" aria-hidden="true" />
              Local SHA-2 verification
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl">
              File Checksum Comparator
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
              Verify that a downloaded file matches a checksum published by its provider. The file
              is read only inside this browser tab.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--primary)] bg-[var(--primary-soft)] p-4 lg:max-w-sm">
            <p className="flex items-center gap-2 font-bold text-[var(--foreground)]">
              <FileCheck2 className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
              What a match means
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              It shows both byte sequences produced the same digest. Trust still depends on getting
              the expected checksum from an authentic source.
            </p>
          </div>
        </div>
      </header>

      <form
        onSubmit={compare}
        className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(20rem,1fr)]"
      >
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-[var(--foreground)]">1. Choose the file</h2>
          <label
            htmlFor="checksum-file"
            className="mt-4 flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border-strong)] bg-[var(--background)] p-6 text-center transition hover:border-[var(--primary)] focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/20"
          >
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
              <Upload className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="mt-4 max-w-full break-all font-bold text-[var(--foreground)]">
              {file ? file.name : "Select any local file"}
            </span>
            <span className="mt-1 text-sm text-[var(--muted-foreground)]">
              {file ? `${formatBytes(file.size)} · ready to hash` : "Up to 512 MB"}
            </span>
            <input
              ref={fileInputRef}
              id="checksum-file"
              type="file"
              className="sr-only"
              onChange={(event) => chooseFile(event.target.files?.[0] || null)}
            />
          </label>
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-[var(--foreground)]">2. Paste and compare</h2>
          <div className="mt-4 space-y-4">
            <label className="block space-y-2 text-sm font-bold text-[var(--foreground)]">
              Algorithm
              <select
                className="input-field min-h-11 w-full"
                value={algorithm}
                onChange={(event) => {
                  setAlgorithm(event.target.value);
                  setResult(null);
                }}
              >
                <option value="auto">Detect from checksum length</option>
                {Object.keys(ALGORITHMS).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-2 text-sm font-bold text-[var(--foreground)]">
              Expected checksum
              <textarea
                className="input-field min-h-32 w-full resize-y font-mono text-sm"
                value={expected}
                onChange={(event) => {
                  setExpected(event.target.value);
                  setResult(null);
                }}
                placeholder="Paste the official hexadecimal checksum"
                spellCheck="false"
              />
            </label>
            {expectedValidation && !expectedValidation.ok ? (
              <p className="text-sm text-[var(--danger)]">{expectedValidation.error}</p>
            ) : expectedValidation ? (
              <p className="text-sm text-[var(--muted-foreground)]">
                Detected:{" "}
                <strong className="text-[var(--foreground)]">
                  {expectedValidation.algorithm}
                </strong>
              </p>
            ) : null}

            {error ? (
              <p
                className="rounded-lg border border-[var(--danger)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="btn-primary inline-flex min-h-11 items-center gap-2 px-5"
                disabled={!file || !expected.trim() || busy}
              >
                {busy ? (
                  <LoaderCircle
                    className="h-4 w-4 animate-spin motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                ) : (
                  <Fingerprint className="h-4 w-4" aria-hidden="true" />
                )}
                {busy ? "Hashing locally…" : "Compare checksum"}
              </button>
              <button
                type="button"
                className="btn-secondary inline-flex min-h-11 items-center gap-2 px-5"
                onClick={reset}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Clear
              </button>
            </div>
          </div>
        </section>
      </form>

      {result ? (
        <section
          className={`rounded-lg border p-5 shadow-sm sm:p-6 ${
            result.matches
              ? "border-[var(--success)] bg-[var(--success-soft)]"
              : "border-[var(--danger)] bg-[var(--danger-soft)]"
          }`}
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            {result.matches ? (
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-[var(--success)]" aria-hidden="true" />
            ) : (
              <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-[var(--danger)]" aria-hidden="true" />
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-[var(--foreground)]">
                {result.matches ? "Checksums match" : "Checksums do not match"}
              </h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                {result.matches
                  ? `The local ${result.algorithm} digest exactly matches the expected value.`
                  : "Do not open or install the file until you confirm the correct checksum and download source."}
              </p>
              <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Calculated {result.algorithm}
                </p>
                <p className="mt-2 break-all font-mono text-sm leading-6 text-[var(--foreground)]">
                  {result.actual}
                </p>
                <button
                  type="button"
                  className="btn-secondary mt-3 inline-flex min-h-10 items-center gap-2 px-4"
                  onClick={copyActual}
                >
                  {copied ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Clipboard className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied ? "Copied" : "Copy calculated hash"}
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-5">
        <p className="flex gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
          <ShieldAlert
            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]"
            aria-hidden="true"
          />
          A checksum detects byte-level differences; it does not scan malware or prove the
          publisher’s identity. Obtain the expected value from a separate, trusted official page
          whenever possible.
        </p>
      </section>
    </main>
  );
}
