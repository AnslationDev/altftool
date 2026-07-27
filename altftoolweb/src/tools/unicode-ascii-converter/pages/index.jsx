"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Check, Copy, FileText, RotateCcw } from "lucide-react";

import {
  ESCAPE_MODES,
  OUTPUT_FORMATS,
  UNICODE_MAX_LABEL,
  decodeText,
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

const DEFAULT_TEXT = "Café 北京 😀 — naïve résumé";
const DEFAULT_ESCAPES = "\\u0043\\u0061\\u0066\\u00E9 \\u{4E2C}\\u{6587}";

const numberFmt = new Intl.NumberFormat("en-US");

export default function ToolHome() {
  const [mode, setMode] = useState("encode");
  const [text, setText] = useState(DEFAULT_TEXT);
  const [escapes, setEscapes] = useState(DEFAULT_ESCAPES);
  const [format, setFormat] = useState("js");
  const [escapeMode, setEscapeMode] = useState("nonAscii");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (mode === "encode") return encodeText({ text, format, mode: escapeMode });
    return decodeText({ value: escapes });
  }, [mode, text, escapes, format, escapeMode]);

  const error = result.error ?? null;
  const output = error ? "" : result.output;

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

  const handleSwap = () => {
    if (mode === "encode") {
      if (!error) setEscapes(result.output);
      setMode("decode");
    } else {
      if (!error) setText(result.output);
      setMode("encode");
    }
    setCopied(false);
  };

  const handleReset = () => {
    setMode("encode");
    setText(DEFAULT_TEXT);
    setEscapes(DEFAULT_ESCAPES);
    setFormat("js");
    setEscapeMode("nonAscii");
    setCopied(false);
  };

  const dash = "—";
  const stats = error ? null : result.stats;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <header className="mb-6 flex items-start gap-3">
        <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
          <FileText className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)] sm:text-2xl">
            Unicode / ASCII Converter
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Escape text into <code>\uXXXX</code>, <code>U+XXXX</code>, decimal code points or
            HTML entities — and parse any of them back. Surrogate pairs handled.
          </p>
        </div>
      </header>

      <div
        className="mb-4 inline-flex rounded-md border border-[var(--border)] p-1"
        role="group"
        aria-label="Direction"
      >
        {[
          ["encode", "Text → codes"],
          ["decode", "Codes → text"],
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

      {mode === "encode" ? (
        <>
          <div>
            <label className={LABEL_CLASS} htmlFor="text-input">
              Text
            </label>
            <textarea
              id="text-input"
              rows={4}
              className={`${TEXTAREA_CLASS} mt-1.5`}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Type or paste text…"
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="format-select">
                Output notation
              </label>
              <select
                id="format-select"
                className={`${INPUT_CLASS} mt-1.5`}
                value={format}
                onChange={(event) => setFormat(event.target.value)}
              >
                {OUTPUT_FORMATS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="mode-select">
                Escape which characters
              </label>
              <select
                id="mode-select"
                className={`${INPUT_CLASS} mt-1.5`}
                value={escapeMode}
                onChange={(event) => setEscapeMode(event.target.value)}
              >
                {ESCAPE_MODES.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      ) : (
        <div>
          <label className={LABEL_CLASS} htmlFor="escape-input">
            Escapes or code points
          </label>
          <textarea
            id="escape-input"
            rows={4}
            className={`${TEXTAREA_CLASS} mt-1.5`}
            value={escapes}
            onChange={(event) => setEscapes(event.target.value)}
            placeholder="é  \u{1F600}  U+0041  &#8364;  72 105"
          />
          <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
            Accepts \uXXXX, \u&#123;XXXX&#125;, \xHH, U+XXXX, &amp;#NNN;, &amp;#xHH; and plain
            decimal lists.
          </p>
        </div>
      )}

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
          {mode === "encode" ? "Escaped output" : "Decoded text"}
        </p>
        <p className="mt-2 break-all font-mono text-lg font-bold leading-7 text-[var(--foreground)]">
          {error ? dash : output || dash}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-4 text-sm">
          <div>
            <dt className="text-[var(--muted-foreground)]">Code points</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {stats ? numberFmt.format(stats.codePoints) : dash}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">UTF-16 units</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {stats ? numberFmt.format(stats.utf16Units) : dash}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Non-ASCII characters</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {stats ? numberFmt.format(stats.nonAscii) : dash}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Beyond the BMP</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {stats ? numberFmt.format(stats.astral) : dash}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">UTF-8 bytes</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {stats ? numberFmt.format(stats.utf8Bytes) : dash}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">
              {mode === "encode" ? "Characters escaped" : "Escapes decoded"}
            </dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error
                ? dash
                : numberFmt.format(
                    mode === "encode" ? result.escapedCount : result.decodedCount
                  )}
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
        <button type="button" className={GHOST_BTN} onClick={handleSwap} aria-label="Send the result to the other direction">
          <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
          Swap
        </button>
        <button type="button" className={GHOST_BTN} onClick={handleReset} aria-label="Reset to defaults">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      <p className="mt-4 text-xs text-[var(--muted-foreground)]">
        Valid code points run from U+0000 to {UNICODE_MAX_LABEL}. Nothing
        you type leaves this page.
      </p>
    </div>
  );
}
