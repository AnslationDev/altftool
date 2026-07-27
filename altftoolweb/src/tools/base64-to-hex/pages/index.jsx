"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Hash, RotateCcw } from "lucide-react";

import {
  DUMP_BYTES_PER_LINE,
  HEX_DIGITS_PER_BYTE,
  OUTPUT_FORMATS,
  base64ToHex,
  formatBytes,
} from "../lib";

const SELECT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_INPUT = "SGVsbG8sIHdvcmxkISBUaGlzIGlzIGEgaGV4IGR1bXAgdGVzdC4=";
const DEFAULT_FORMAT = "spaced";
const DASH = "—";
const BLANK_ROWS = ["Bytes decoded", "Hex digits", "Base64 length", "First 8 bytes"];

const integer = new Intl.NumberFormat("en-US");

export default function ToolHome() {
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [format, setFormat] = useState(DEFAULT_FORMAT);
  const [uppercase, setUppercase] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef(null);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const result = useMemo(() => base64ToHex(input, { format, uppercase }), [input, format, uppercase]);
  const failed = Boolean(result.error);

  const rows = failed
    ? []
    : [
        ["Bytes decoded", `${integer.format(result.byteLength)} (${formatBytes(result.byteLength)})`],
        ["Hex digits", `${integer.format(result.hexDigits)} (${HEX_DIGITS_PER_BYTE} per byte)`],
        ["Base64 length", `${integer.format(result.base64Chars)} characters`],
        ["First 8 bytes", result.firstEightBytes || DASH],
        ["Hex dump lines", `${integer.format(result.dumpLines)} × ${DUMP_BYTES_PER_LINE} bytes`],
      ];

  const handleCopy = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(result.hex);
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleReset = () => {
    setInput(DEFAULT_INPUT);
    setFormat(DEFAULT_FORMAT);
    setUppercase(false);
    setCopied(false);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <Hash className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          Base64 to Hex
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Decode a Base64 string into its raw bytes and read them as hexadecimal — spaced, continuous, as a C array,
          or as a <code>hexdump -C</code> style listing with offsets and an ASCII gutter.
        </p>
      </header>

      <section className="grid gap-4">
        <div>
          <label className={LABEL_CLASS} htmlFor="b64-hex-input">
            Base64 input
          </label>
          <textarea
            id="b64-hex-input"
            className={`${TEXTAREA_CLASS} mt-1.5 h-32`}
            value={input}
            spellCheck={false}
            onChange={(event) => setInput(event.target.value)}
            placeholder="SGVsbG8sIHdvcmxkIQ=="
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="b64-hex-format">
              Output layout
            </label>
            <select
              id="b64-hex-format"
              className={`${SELECT_CLASS} mt-1.5`}
              value={format}
              onChange={(event) => setFormat(event.target.value)}
            >
              {OUTPUT_FORMATS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label} — {option.hint}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium text-[var(--foreground)]"
              htmlFor="b64-hex-uppercase"
            >
              <input
                id="b64-hex-uppercase"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={uppercase}
                onChange={(event) => setUppercase(event.target.checked)}
              />
              Uppercase hex digits (A–F)
            </label>
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
        <p className="text-sm font-medium text-[var(--muted-foreground)]">Decoded length</p>
        <p className="mt-1 text-4xl font-bold tracking-tight text-[var(--foreground)]">
          {failed ? DASH : `${integer.format(result.byteLength)} bytes`}
        </p>

        <div className="mt-4">
          <p className="text-xs font-semibold text-[var(--muted-foreground)]">Hexadecimal output</p>
          <pre className="mt-1 max-h-72 overflow-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5 text-[var(--foreground)]">
            {failed ? DASH : result.hex}
          </pre>
        </div>

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
            aria-label="Copy the hexadecimal output to the clipboard"
          >
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy hex"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={handleReset}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      <p className="mt-4 text-xs text-[var(--muted-foreground)]">
        Everything is decoded in this tab — the string is never uploaded.
      </p>
    </div>
  );
}
