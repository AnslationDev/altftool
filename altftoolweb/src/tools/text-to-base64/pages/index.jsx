"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Binary, Check, Copy, RotateCcw } from "lucide-react";

import {
  LINE_WRAP_OPTIONS,
  MIME_LINE_LENGTH,
  decodeBase64,
  encodeText,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_TEXT = "Hello, ALTFTool! Base64 keeps binary safe in text-only channels.";
const DEFAULT_B64 = "SGVsbG8sIEFMVEZUb29sIQ==";

const numberFmt = new Intl.NumberFormat("en-US");

export default function ToolHome() {
  const [mode, setMode] = useState("encode");
  const [plain, setPlain] = useState(DEFAULT_TEXT);
  const [encoded, setEncoded] = useState(DEFAULT_B64);
  const [urlSafe, setUrlSafe] = useState(false);
  const [padding, setPadding] = useState(true);
  const [lineWrap, setLineWrap] = useState(0);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (mode === "encode") {
      return encodeText({ text: plain, urlSafe, padding, lineWrap });
    }
    return decodeBase64({ value: encoded });
  }, [mode, plain, encoded, urlSafe, padding, lineWrap]);

  const error = result.error ?? null;
  const output = error ? "" : mode === "encode" ? result.base64 : result.text;

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const handleReset = () => {
    setMode("encode");
    setPlain(DEFAULT_TEXT);
    setEncoded(DEFAULT_B64);
    setUrlSafe(false);
    setPadding(true);
    setLineWrap(0);
    setCopied(false);
  };

  const handleSwap = () => {
    if (mode === "encode") {
      if (!error && result.base64) setEncoded(result.base64);
      setMode("decode");
    } else {
      if (!error && typeof result.text === "string") setPlain(result.text);
      setMode("encode");
    }
    setCopied(false);
  };

  const dash = "—";
  const bytes = error ? dash : numberFmt.format(result.byteLength);
  const outLen = error ? dash : numberFmt.format(output.replace(/\n/g, "").length);
  const overhead = error || mode !== "encode" ? dash : `${result.overheadPercent}%`;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <header className="mb-6 flex items-start gap-3">
        <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
          <Binary className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)] sm:text-2xl">
            Text to Base64
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Encode text to Base64 or decode it back, entirely in your browser. Standard and
            URL-safe alphabets, RFC 4648.
          </p>
        </div>
      </header>

      <div
        className="mb-4 inline-flex rounded-md border border-[var(--border)] p-1"
        role="group"
        aria-label="Direction"
      >
        {[
          ["encode", "Text → Base64"],
          ["decode", "Base64 → Text"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setMode(value);
              setCopied(false);
            }}
            aria-pressed={mode === value}
            className={`min-h-11 rounded px-4 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
              mode === value
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "text-[var(--muted-foreground)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {mode === "encode" ? (
          <div>
            <label className={LABEL_CLASS} htmlFor="plain-input">
              Plain text
            </label>
            <textarea
              id="plain-input"
              rows={5}
              className={`${TEXTAREA_CLASS} mt-1.5`}
              value={plain}
              onChange={(event) => setPlain(event.target.value)}
              placeholder="Type or paste text…"
            />
          </div>
        ) : (
          <div>
            <label className={LABEL_CLASS} htmlFor="b64-input">
              Base64 string
            </label>
            <textarea
              id="b64-input"
              rows={5}
              className={`${TEXTAREA_CLASS} mt-1.5`}
              value={encoded}
              onChange={(event) => setEncoded(event.target.value)}
              placeholder="Paste Base64…"
            />
            <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
              Line breaks are ignored. Padding is optional and both alphabets are accepted.
            </p>
          </div>
        )}

        {mode === "encode" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="wrap-select">
                Line wrapping
              </label>
              <select
                id="wrap-select"
                className={`${INPUT_CLASS} mt-1.5`}
                value={lineWrap}
                onChange={(event) => setLineWrap(Number(event.target.value))}
              >
                {LINE_WRAP_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <fieldset className="rounded-md border border-[var(--border)] p-3">
              <legend className="px-1 text-sm font-semibold text-[var(--foreground)]">
                Alphabet
              </legend>
              <label
                className="flex min-h-11 items-center gap-2 text-sm text-[var(--foreground)]"
                htmlFor="urlsafe-toggle"
              >
                <input
                  id="urlsafe-toggle"
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--primary)]"
                  checked={urlSafe}
                  onChange={(event) => setUrlSafe(event.target.checked)}
                />
                URL-safe (- and _)
              </label>
              <label
                className="flex min-h-11 items-center gap-2 text-sm text-[var(--foreground)]"
                htmlFor="padding-toggle"
              >
                <input
                  id="padding-toggle"
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--primary)]"
                  checked={padding}
                  onChange={(event) => setPadding(event.target.checked)}
                />
                Add = padding
              </label>
            </fieldset>
          </div>
        ) : null}
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          {mode === "encode" ? "Base64 output" : "Decoded text"}
        </p>
        <p className="mt-2 break-all font-mono text-lg font-bold leading-7 text-[var(--foreground)] sm:text-xl">
          {error ? dash : output || dash}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-4 text-sm">
          <div>
            <dt className="text-[var(--muted-foreground)]">Payload bytes</dt>
            <dd className="font-semibold text-[var(--foreground)]">{bytes}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Output characters</dt>
            <dd className="font-semibold text-[var(--foreground)]">{error ? dash : outLen}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Size overhead</dt>
            <dd className="font-semibold text-[var(--foreground)]">{overhead}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">
              {mode === "encode" ? "Lines" : "Alphabet"}
            </dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error
                ? dash
                : mode === "encode"
                  ? numberFmt.format(result.lineCount)
                  : result.urlSafeChars
                    ? "URL-safe"
                    : "Standard"}
            </dd>
          </div>
        </dl>
      </section>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className={PRIMARY_BTN}
          onClick={handleCopy}
          aria-label="Copy result to clipboard"
          disabled={!output}
        >
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copied!" : "Copy result"}
        </button>
        <button type="button" className={GHOST_BTN} onClick={handleSwap} aria-label="Send result to the other direction">
          <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
          Swap
        </button>
        <button type="button" className={GHOST_BTN} onClick={handleReset} aria-label="Reset to defaults">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      <p className="mt-4 text-xs text-[var(--muted-foreground)]">
        MIME wraps Base64 at {MIME_LINE_LENGTH} characters per line. Nothing you type leaves
        this page.
      </p>
    </div>
  );
}
