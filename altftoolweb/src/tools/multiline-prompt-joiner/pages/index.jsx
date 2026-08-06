"use client";

import { useMemo, useState } from "react";
import { Check, Code, Copy, RotateCcw } from "lucide-react";

import { NEWLINE_MODES, OUTPUT_FORMATS, getFormat, joinPromptLines } from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const DEFAULT_TEXT = `You are a senior technical editor.
Rewrite the text below so it is clear and concise.
Keep every factual claim, and never invent new numbers.
Return only the rewritten text.`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_CLASS =
  "h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [format, setFormat] = useState("json");
  const [newlineMode, setNewlineMode] = useState("escape");
  const [trimLines, setTrimLines] = useState(true);
  const [dropEmptyLines, setDropEmptyLines] = useState(false);
  const [wrapInQuotes, setWrapInQuotes] = useState(true);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      joinPromptLines({
        text,
        format,
        newlineMode,
        trimLines,
        dropEmptyLines,
        wrapInQuotes,
      }),
    [text, format, newlineMode, trimLines, dropEmptyLines, wrapInQuotes],
  );

  const active = getFormat(format);
  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError || !result.output) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Reset the joiner? This clears your pasted prompt and all options and cannot be undone.")
    ) {
      return;
    }
    setText(DEFAULT_TEXT);
    setFormat("json");
    setNewlineMode("escape");
    setTrimLines(true);
    setDropEmptyLines(false);
    setWrapInQuotes(true);
    setCopied(false);
  };

  const rows = [
    ["Lines joined", hasError ? DASH : NUM.format(result.lineCount)],
    ["Characters in", hasError ? DASH : NUM.format(result.inputChars)],
    ["Characters out", hasError ? DASH : NUM.format(result.outputChars)],
    ["Escape characters added", hasError ? DASH : NUM.format(result.escapedCount)],
    ["Target", active ? active.label : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Code className="h-4 w-4" aria-hidden="true" />
          Prompt formatting
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Multiline Prompt Joiner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste a prompt written across many lines and get back one properly escaped string
          literal you can drop straight into JSON, JavaScript, Python, Java, YAML or a shell
          command.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="join-text">
          Prompt (one idea per line)
        </label>
        <textarea
          id="join-text"
          className={`mt-2 ${AREA_CLASS}`}
          rows={8}
          spellCheck={false}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="join-format">
              Output format
            </label>
            <select
              id="join-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={format}
              onChange={(event) => setFormat(event.target.value)}
            >
              {OUTPUT_FORMATS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="join-mode">
              Line breaks
            </label>
            <select
              id="join-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={newlineMode}
              onChange={(event) => setNewlineMode(event.target.value)}
            >
              {NEWLINE_MODES.map((mode) => (
                <option key={mode.id} value={mode.id}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="flex min-h-11 items-center gap-2 text-sm" htmlFor="join-trim">
            <input
              id="join-trim"
              type="checkbox"
              className={CHECK_CLASS}
              checked={trimLines}
              onChange={(event) => setTrimLines(event.target.checked)}
            />
            Trim each line
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm" htmlFor="join-drop">
            <input
              id="join-drop"
              type="checkbox"
              className={CHECK_CLASS}
              checked={dropEmptyLines}
              onChange={(event) => setDropEmptyLines(event.target.checked)}
            />
            Drop blank lines
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm" htmlFor="join-wrap">
            <input
              id="join-wrap"
              type="checkbox"
              className={CHECK_CLASS}
              checked={wrapInQuotes}
              onChange={(event) => setWrapInQuotes(event.target.checked)}
            />
            Include quotes
          </label>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5" aria-live="polite">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Literal length
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.outputChars)} chars`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the options above to generate a literal."
                : `${NUM.format(result.lineCount)} lines collapsed into one ${active.label.toLowerCase()}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the escaped string literal"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the prompt and all options"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
          <pre className="min-w-0 whitespace-pre-wrap break-all p-3 font-mono text-sm leading-6 text-[var(--foreground)]">
            {hasError ? DASH : result.output}
          </pre>
        </div>

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {active && (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">{active.note}</p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything runs in your browser — the prompt text never leaves this page. Always paste the
        result into a syntax-highlighted editor and confirm the literal closes cleanly before you
        ship it.
      </p>
    </main>
  );
}
