"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Eraser, RotateCcw } from "lucide-react";

import { CLEAN_OPTIONS, cleanPromptText } from "../lib";

const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_TEXT = `## My “improved” prompt

**Summarise** the _attached_ report — don’t exceed 3 bullet points…

- Keep the tone ‘neutral’
- Cite the [source](https://example.com)`;

const DEFAULT_OPTIONS = ["invisible", "quotes", "markdown", "whitespace"];

const DASH = "—";

export default function ToolHome() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => cleanPromptText(text, options), [text, options]);
  const hasError = Boolean(result.error);

  const toggleOption = (id) => {
    setOptions((prev) => (prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]));
  };

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.cleaned);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setText(DEFAULT_TEXT);
    setOptions(DEFAULT_OPTIONS);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Invisible characters removed", DASH],
        ["Smart punctuation straightened", DASH],
        ["Markdown characters stripped", DASH],
        ["Whitespace trimmed", DASH],
      ]
    : [
        ["Invisible characters removed", String(result.stats.invisibleRemoved)],
        ["Smart punctuation straightened", String(result.stats.smartCharsReplaced)],
        ["Markdown characters stripped", String(result.stats.markdownCharsRemoved)],
        ["Whitespace characters trimmed", String(result.stats.whitespaceTrimmed)],
        ["Length", `${result.inputChars} → ${result.outputChars} chars`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Eraser className="h-4 w-4" aria-hidden="true" />
          Prompt Utilities
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Prompt Markdown Cleaner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste text copied from Word, Google Docs or a chat window; get it back with smart quotes
          straightened, markdown stripped and invisible characters deleted — safe to paste into any
          model.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="pmc-input">
          Text to clean
        </label>
        <textarea
          id="pmc-input"
          className={`mt-2 min-h-40 ${TEXTAREA_CLASS}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
        />

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">Cleaning passes</legend>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {CLEAN_OPTIONS.map((opt) => (
              <label
                key={opt.id}
                htmlFor={`pmc-opt-${opt.id}`}
                className="flex min-h-11 cursor-pointer items-start gap-3 py-1 text-sm"
              >
                <input
                  id={`pmc-opt-${opt.id}`}
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={options.includes(opt.id)}
                  onChange={() => toggleOption(opt.id)}
                />
                <span>
                  {opt.label}
                  <span className="block text-xs text-[var(--muted-foreground)]">{opt.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Characters fixed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.totalChanges}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the cleaned text"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy cleaned text"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the text and options to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <label className={`mt-4 ${LABEL_CLASS}`} htmlFor="pmc-output">
          Cleaned text
        </label>
        <textarea
          id="pmc-output"
          className={`mt-2 min-h-40 ${TEXTAREA_CLASS}`}
          value={hasError ? "" : result.cleaned}
          readOnly
          spellCheck={false}
        />

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything runs locally in your browser — the text never leaves this page. Cleaning is
        conservative: code inside fences is kept, only the fence markers are removed.
      </p>
    </main>
  );
}
