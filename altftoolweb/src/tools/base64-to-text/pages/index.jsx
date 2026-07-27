"use client";

import { useMemo, useRef, useState } from "react";
import { Binary, Check, Copy, RotateCcw } from "lucide-react";

import { decodeBase64Text, MAX_DECODED_BYTES, formatBytes } from "../lib";

const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

/** A short, multi-line UTF-8 sample so first paint shows a real decode. */
const SAMPLE_BASE64 =
  "QWx0RlRvb2wgZGVjb2RlcyBCYXNlNjQgaW4geW91ciBicm93c2VyLgpObyB1cGxvYWQsIG5vIHNlcnZlciwgbm8gbG9nLg==";

const DASH = "—";
const integer = new Intl.NumberFormat("en-US");

export default function ToolHome() {
  const [input, setInput] = useState(SAMPLE_BASE64);
  const [copied, setCopied] = useState("");
  const copyTimer = useRef(null);

  const result = useMemo(() => decodeBase64Text(input), [input]);
  const failed = Boolean(result.error);

  const copy = async (key, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("");
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <Binary aria-hidden="true" className="h-6 w-6 text-[var(--primary)]" />
          Base64 to Text
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Paste a Base64 string and read the text it encodes. Whitespace, missing padding and the URL-safe alphabet
          from RFC 4648 §5 are all handled, a byte-order mark is honoured, and invalid UTF-8 is reported rather than
          hidden. Everything happens in your browser.
        </p>
      </header>

      <div className="grid gap-4">
        <div>
          <label className={LABEL_CLASS} htmlFor="b64-in">
            Base64 input
          </label>
          <textarea
            id="b64-in"
            className={`${TEXTAREA_CLASS} mt-1.5 min-h-32`}
            value={input}
            spellCheck={false}
            onChange={(event) => setInput(event.target.value)}
            placeholder="SGVsbG8sIEFsdEZUb29sIQ=="
          />
          <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
            Limit {formatBytes(MAX_DECODED_BYTES)} decoded. Line breaks from wrapped MIME Base64 are ignored.
          </p>
        </div>

        {failed ? (
          <p
            role="alert"
            className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
        ) : null}

        <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Decoded characters
          </p>
          <p className="mt-1 text-3xl font-bold text-[var(--foreground)]">
            {failed ? DASH : integer.format(result.characters)}
          </p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {failed ? DASH : `${result.encoding.toUpperCase()} · ${result.sizeLabel}`}
          </p>

          <div className="mt-4">
            <label className={LABEL_CLASS} htmlFor="decoded-out">
              Decoded text
            </label>
            <textarea
              id="decoded-out"
              readOnly
              className={`${TEXTAREA_CLASS} mt-1.5 min-h-32`}
              value={failed ? "" : result.text}
              placeholder={DASH}
            />
          </div>

          <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Decoded bytes</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed ? DASH : integer.format(result.bytes)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Base64 characters</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed ? DASH : integer.format(result.base64Length)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Words</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed ? DASH : integer.format(result.words)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Lines</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed ? DASH : integer.format(result.lines)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Unicode code points</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed ? DASH : integer.format(result.codePoints)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Encoding overhead</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed ? DASH : `+${result.overheadPercent}%`}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Byte-order mark</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed ? DASH : result.bom || "None"}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-[var(--muted-foreground)]">Alphabet</dt>
              <dd className="font-semibold text-[var(--foreground)]">
                {failed ? DASH : result.urlSafe ? "URL-safe (RFC 4648 §5)" : "Standard (RFC 4648 §4)"}
              </dd>
            </div>
          </dl>

          {!failed && result.looksBinary ? (
            <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
              {result.controlPercent}% of the decoded bytes are non-printable control codes — this payload is a binary
              file (an image, PDF or archive), not text. The characters above are not meaningful.
            </p>
          ) : null}
          {!failed && !result.looksBinary && !result.validUtf8 ? (
            <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
              The bytes are not valid {result.encoding.toUpperCase()}. Invalid sequences were replaced with U+FFFD, so
              some characters above are wrong.
            </p>
          ) : null}
          {!failed && !result.looksBinary && result.validUtf8 ? (
            <p className="mt-3 text-xs text-[var(--success)]">
              Clean {result.encoding.toUpperCase()} decode
              {result.addedPadding > 0
                ? ` (${result.addedPadding} padding character${result.addedPadding === 1 ? "" : "s"} added).`
                : "."}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              className={PRIMARY_BTN}
              onClick={() => copy("text", failed ? "" : result.text)}
              disabled={failed}
              aria-label="Copy the decoded text to the clipboard"
            >
              {copied === "text" ? <Check aria-hidden="true" className="h-4 w-4" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
              {copied === "text" ? "Copied!" : "Copy decoded text"}
            </button>
            <button
              type="button"
              className={GHOST_BTN}
              onClick={() =>
                copy(
                  "summary",
                  failed
                    ? ""
                    : `${result.characters} characters, ${result.words} words, ${result.bytes} bytes, ${result.encoding}, valid: ${result.validUtf8}`,
                )
              }
              disabled={failed}
              aria-label="Copy the decode summary to the clipboard"
            >
              {copied === "summary" ? <Check aria-hidden="true" className="h-4 w-4" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
              {copied === "summary" ? "Copied!" : "Copy summary"}
            </button>
            <button
              type="button"
              className={GHOST_BTN}
              onClick={() => {
                setInput(SAMPLE_BASE64);
                setCopied("");
              }}
              aria-label="Reset to the sample Base64 string"
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              Reset
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
