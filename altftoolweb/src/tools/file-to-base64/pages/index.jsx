"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Copy, FileUp, RotateCcw, Upload } from "lucide-react";

import {
  MAX_FILE_BYTES,
  MIME_LINE_LENGTH,
  encodeFile,
  formatBytes,
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

const SNIPPET_TABS = [
  ["dataUrl", "Data URL"],
  ["html", "HTML"],
  ["css", "CSS"],
  ["markdown", "Markdown"],
  ["json", "JSON"],
];

export default function ToolHome() {
  const [record, setRecord] = useState(() => sampleFile());
  const [urlSafe, setUrlSafe] = useState(false);
  const [padded, setPadded] = useState(true);
  const [wrapLines, setWrapLines] = useState(false);
  const [includePrefix, setIncludePrefix] = useState(true);
  const [tab, setTab] = useState("dataUrl");
  const [readError, setReadError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState("");
  const inputRef = useRef(null);

  const result = useMemo(
    () => encodeFile({ ...record, urlSafe, padded, wrapLines, includePrefix }),
    [record, urlSafe, padded, wrapLines, includePrefix],
  );

  const hasError = Boolean(result.error) || Boolean(readError);
  const errorMessage = readError || result.error || "";

  const loadFile = async (file) => {
    if (!file) return;
    setCopied("");
    if (file.size > MAX_FILE_BYTES) {
      setReadError(`That file is larger than the ${formatBytes(MAX_FILE_BYTES)} this encoder handles in one pass.`);
      return;
    }
    try {
      const buffer = await file.arrayBuffer();
      setReadError("");
      setRecord({
        name: file.name,
        size: file.size,
        type: file.type || "",
        bytes: new Uint8Array(buffer),
      });
    } catch {
      setReadError("The browser could not read that file. Try choosing it again.");
    }
  };

  const reset = () => {
    setRecord(sampleFile());
    setUrlSafe(false);
    setPadded(true);
    setWrapLines(false);
    setIncludePrefix(true);
    setTab("dataUrl");
    setReadError("");
    setCopied("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const copyText = async (text, key) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const snippet = hasError ? "" : tab === "dataUrl" ? result.output : result.snippets[tab];
  const preview = hasError ? "" : snippet.length > 4000 ? `${snippet.slice(0, 4000)}\n… (${num(snippet.length - 4000)} more characters)` : snippet;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <FileUp className="h-4 w-4" aria-hidden="true" />
          Base64 encoder
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">File to Base64</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn any local file into a Base64 string or a ready-to-paste{" "}
          <code className="rounded bg-[var(--muted)] px-1">data:</code> URL. The file is read in this
          tab with the browser File API — nothing is uploaded.
        </p>
      </header>

      <section className={CARD}>
        <label className={LABEL_CLASS} htmlFor="file-input">
          Choose a file to encode
        </label>
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            loadFile(event.dataTransfer?.files?.[0]);
          }}
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

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            ["prefix", "Include the data: URL prefix", includePrefix, setIncludePrefix],
            ["urlsafe", "URL-safe alphabet (- and _)", urlSafe, setUrlSafe],
            ["padded", "Keep = padding", padded, setPadded],
            [`wrap`, `Wrap at ${MIME_LINE_LENGTH} characters`, wrapLines, setWrapLines],
          ].map(([id, label, value, setter]) => (
            <label
              key={id}
              htmlFor={id}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
            >
              <input
                id={id}
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={value}
                onChange={(event) => {
                  setter(event.target.checked);
                  setCopied("");
                }}
              />
              {label}
            </label>
          ))}
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
              Base64 characters
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : num(result.encodedChars)}
            </p>
            <p className="mt-1 truncate text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Choose a readable file to encode."
                : `${result.fileName} — ${result.sizeLabel} in, ${result.encodedLabel} out`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copyText(snippet, "main")}
              aria-label="Copy the encoded output to clipboard"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied === "main" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "main" ? "Copied!" : "Copy output"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset back to the sample file" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Original size", hasError ? DASH : `${num(result.sizeBytes)} bytes (${result.sizeLabel})`],
            ["MIME type used", hasError ? DASH : result.mimeType],
            ["Encoded length", hasError ? DASH : `${num(result.encodedChars)} characters`],
            ["Size increase", hasError ? DASH : `+${num(result.growthBytes)} bytes (+${result.overheadPercent}%)`],
            ["3-byte groups encoded", hasError ? DASH : num(result.groups)],
            ["Padding characters", hasError ? DASH : num(result.paddingChars)],
            ["Full data URL length", hasError ? DASH : `${num(result.dataUrlChars)} characters`],
            ["Alphabet", hasError ? DASH : result.urlSafe ? "URL-safe (RFC 4648 §5)" : "Standard (RFC 4648 §4)"],
            ["Wrapped lines", hasError ? DASH : num(result.lines)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold break-all">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">Output</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {SNIPPET_TABS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              aria-pressed={tab === key}
              className={`inline-flex min-h-11 items-center rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                tab === key
                  ? "border-[var(--primary)] bg-[var(--muted)] text-[var(--foreground)]"
                  : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="sr-only" htmlFor="output-box">
          Encoded output
        </label>
        <textarea
          id="output-box"
          readOnly
          rows={8}
          value={hasError ? "" : preview}
          className="mt-3 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs break-all text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
        />
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          The box shows the first 4,000 characters for speed; Copy output always copies the whole
          string.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Base64 makes a file about 33% larger, so inline data URLs suit small assets — icons, fonts,
        one-pixel images — rather than photos. Above roughly 10 KB a normal file request is usually
        faster because it can be cached separately.
      </p>
    </main>
  );
}
