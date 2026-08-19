"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, FileCode2, RotateCcw } from "lucide-react";

import { DEFAULT_INDENT, INDENT_OPTIONS, processCss } from "../lib";

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const SELECT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const SAMPLE_CSS = `/*! app.css v2 */
.card , .card > .body {
  padding : 16px   24px;
  border-radius: 12px;
  font-family: 'Inter', system-ui, sans-serif;
}

@media (min-width : 640px) {
  .card { padding: 24px 32px; }
  .legacy-unused {}
}
`;

const numberFormat = new Intl.NumberFormat("en-US");
const percentFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

export default function ToolHome() {
  const [source, setSource] = useState(SAMPLE_CSS);
  const [mode, setMode] = useState("minify");
  const [indent, setIndent] = useState(String(DEFAULT_INDENT));
  const [keepBang, setKeepBang] = useState(true);
  const [dropEmpty, setDropEmpty] = useState(true);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const result = useMemo(
    () =>
      processCss(source, mode, {
        indent: Number(indent),
        keepBangComments: keepBang,
        dropEmptyRules: dropEmpty,
      }),
    [source, mode, indent, keepBang, dropEmpty],
  );

  const copyResult = async () => {
    if (result.error) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSource(SAMPLE_CSS);
    setMode("minify");
    setIndent(String(DEFAULT_INDENT));
    setKeepBang(true);
    setDropEmpty(true);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-xl font-bold text-[var(--foreground)] sm:text-2xl">
          <FileCode2 className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
          CSS Formatter &amp; Minifier
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tidy a stylesheet into readable blocks, or squeeze it down for production. Everything runs
          in your browser — nothing is uploaded.
        </p>
      </header>

      <section className="grid gap-4">
        <div>
          <label className={LABEL_CLASS} htmlFor="css-source">
            CSS input
          </label>
          <textarea
            id="css-source"
            rows={10}
            spellCheck={false}
            value={source}
            onChange={(event) => setSource(event.target.value)}
            className={`${TEXTAREA_CLASS} mt-1.5`}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="css-mode">
              Mode
            </label>
            <select
              id="css-mode"
              value={mode}
              onChange={(event) => setMode(event.target.value)}
              className={`${SELECT_CLASS} mt-1.5`}
            >
              <option value="minify">Minify for production</option>
              <option value="format">Format for reading</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="css-indent">
              Indent (format mode)
            </label>
            <select
              id="css-indent"
              value={indent}
              onChange={(event) => setIndent(event.target.value)}
              disabled={mode !== "format"}
              className={`${SELECT_CLASS} mt-1.5 disabled:opacity-60`}
            >
              {INDENT_OPTIONS.map((width) => (
                <option key={width} value={String(width)}>
                  {width} spaces
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label
            className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)]"
            htmlFor="css-keep-bang"
          >
            <input
              id="css-keep-bang"
              type="checkbox"
              checked={keepBang}
              onChange={(event) => setKeepBang(event.target.checked)}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            Keep <code className="font-mono">{"/*!"}</code> licence comments
          </label>
          <label
            className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)]"
            htmlFor="css-drop-empty"
          >
            <input
              id="css-drop-empty"
              type="checkbox"
              checked={dropEmpty}
              onChange={(event) => setDropEmpty(event.target.checked)}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            Drop empty rules when minifying
          </label>
        </div>
      </section>

      {result.error && (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">
              {mode === "minify" ? "Size saved" : "Output size"}
            </p>
            <p className="text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
              {result.error
                ? DASH
                : mode === "minify"
                  ? `${percentFormat.format(result.savedPercent)}%`
                  : `${numberFormat.format(result.outputBytes)} B`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error
                ? DASH
                : `${numberFormat.format(result.inputBytes)} B in · ${numberFormat.format(
                    result.outputBytes,
                  )} B out`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the processed CSS"
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy CSS"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset to the sample stylesheet" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm" aria-live="polite" aria-atomic="true">
          {[
            ["Rules", result.error ? DASH : numberFormat.format(result.rules)],
            ["Declarations", result.error ? DASH : numberFormat.format(result.declarations)],
            ["Comments found", result.error ? DASH : numberFormat.format(result.comments)],
            ["Bytes saved", result.error ? DASH : `${numberFormat.format(result.savedBytes)} B`],
            [
              "Size",
              result.error ? DASH : `${result.inputKib} KiB → ${result.outputKib} KiB`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold text-[var(--foreground)]">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!result.error && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--foreground)]">Output</h2>
          <div className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] p-3">
            <pre
              className="min-w-0 font-mono text-xs leading-5 text-[var(--foreground)]"
              aria-live="polite"
            >
              {result.output}
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The parser understands strings, comments and <code className="font-mono">url()</code>{" "}
        tokens, so semicolons inside a base64 data URI are left intact. Minification is
        whitespace-and-comment only — no property values are rewritten, so nothing can change how
        the page renders.
      </p>
    </main>
  );
}
