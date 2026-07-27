"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileText, RotateCcw } from "lucide-react";

import {
  documentStats,
  htmlToMarkdown,
  htmlToText,
  markdownToHtml,
  WORDS_PER_MINUTE,
} from "../lib";

const SAMPLE_MARKDOWN = `# Release notes

Version **2.4** ships three fixes and one *small* feature.

- Faster PDF export
- Fixed the \`--dry-run\` flag
- New keyboard shortcut

> Upgrading is safe: nothing in the data format changed.

| Change | Impact |
| --- | --- |
| PDF export | 40% faster |
| Dry run | Bug fixed |

Read the [full changelog](https://example.com/changelog).
`;

const MODES = [
  { id: "md2html", label: "Markdown → HTML" },
  { id: "html2md", label: "HTML → Markdown" },
  { id: "html2text", label: "HTML → plain text" },
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-48 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-60";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const fmt = (digits) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits });

function Row({ label, value }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--border)] py-2 last:border-b-0">
      <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
      <dd className="text-sm font-semibold text-[var(--foreground)]">{value}</dd>
    </div>
  );
}

export default function ToolHome() {
  const [source, setSource] = useState(SAMPLE_MARKDOWN);
  const [mode, setMode] = useState("md2html");
  const [allowHtml, setAllowHtml] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (mode === "md2html") {
      const converted = markdownToHtml(source, { allowHtml });
      return converted.error ? converted : { output: converted.html, blocks: converted.blocks };
    }
    if (mode === "html2md") {
      const converted = htmlToMarkdown(source);
      return converted.error ? converted : { output: converted.markdown };
    }
    const converted = htmlToText(source);
    return converted.error
      ? converted
      : { output: converted.text, words: converted.words, readingMinutes: converted.readingMinutes };
  }, [source, mode, allowHtml]);

  const hasError = Boolean(result.error);
  const output = hasError ? "" : result.output;

  const inputStats = useMemo(() => documentStats(source), [source]);
  const outputStats = useMemo(() => documentStats(output), [output]);

  const copyResult = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSource(SAMPLE_MARKDOWN);
    setMode("md2html");
    setAllowHtml(false);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <FileText className="h-4 w-4" aria-hidden="true" />
          Two-way converter
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Markdown / HTML Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn Markdown into clean HTML — headings, lists, tables, fenced code, blockquotes and
          GitHub-flavoured strikethrough — or take HTML back to Markdown or plain text. Text is
          escaped by default, and only http, https, mailto, tel and relative links survive the
          conversion.
        </p>
      </header>

      <section className="grid gap-4">
        <div>
          <label className={LABEL_CLASS} htmlFor="mdc-source">
            Input
          </label>
          <textarea
            id="mdc-source"
            className={`${TEXTAREA_CLASS} mt-1`}
            value={source}
            onChange={(event) => {
              setSource(event.target.value);
              setCopied(false);
            }}
            spellCheck="false"
            rows={12}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mdc-mode">
              Direction
            </label>
            <select
              id="mdc-mode"
              className={`${INPUT_CLASS} mt-1`}
              value={mode}
              onChange={(event) => {
                setMode(event.target.value);
                setCopied(false);
              }}
            >
              {MODES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex min-h-11 items-center gap-3 sm:mt-6">
            <input
              id="mdc-allow-html"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={allowHtml}
              disabled={mode !== "md2html"}
              onChange={(event) => setAllowHtml(event.target.checked)}
            />
            <label className={LABEL_CLASS} htmlFor="mdc-allow-html">
              Allow raw HTML in the Markdown
            </label>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        {hasError ? (
          <p role="alert" className="mb-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            {result.error}
          </p>
        ) : null}

        <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
          Output size
        </p>
        <p className="mt-1 text-4xl leading-none font-bold">
          {hasError ? DASH : `${fmt(0).format(outputStats.characters)} chars`}
        </p>

        <dl className="mt-4">
          <Row
            label="Input"
            value={
              hasError
                ? DASH
                : `${fmt(0).format(inputStats.characters)} chars · ${fmt(0).format(inputStats.words)} words · ${fmt(0).format(inputStats.lines)} lines`
            }
          />
          <Row
            label="Output"
            value={
              hasError
                ? DASH
                : `${fmt(0).format(outputStats.characters)} chars · ${fmt(0).format(outputStats.words)} words · ${fmt(0).format(outputStats.lines)} lines`
            }
          />
          {mode === "md2html" && !hasError ? (
            <Row label="Block elements produced" value={fmt(0).format(result.blocks)} />
          ) : null}
          <Row
            label={`Reading time at ${WORDS_PER_MINUTE} wpm`}
            value={hasError ? DASH : `${fmt(1).format(Math.max(outputStats.readingMinutes, 0))} min`}
          />
        </dl>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="mdc-output">
            Result
          </label>
          <textarea
            id="mdc-output"
            className={`${TEXTAREA_CLASS} mt-1`}
            value={output}
            readOnly
            rows={12}
            spellCheck="false"
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            className={PRIMARY_BTN}
            onClick={copyResult}
            aria-label="Copy the converted output to the clipboard"
            disabled={hasError}
          >
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy result"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
        Supported: ATX headings, paragraphs, hard line breaks, bold, italic, strikethrough, inline
        code, fenced code, links, images, blockquotes, ordered and unordered lists, thematic breaks
        and GitHub-flavoured tables. Reference-style links and nested blockquotes are not converted.
      </p>
    </main>
  );
}
