"use client";

import { useMemo, useState } from "react";
import { AlignLeft, Check, Copy, Eye, EyeOff, RotateCcw } from "lucide-react";

import {
  DEFAULT_OPTIONS,
  MAX_BLANK_LINES_LIMIT,
  MAX_INPUT_CHARS,
  normalizeWhitespace,
  revealInvisibles,
} from "../lib";

const NBSP = String.fromCharCode(0x00a0);
const ZWSP = String.fromCharCode(0x200b);

const SAMPLE = [
  `You are a${NBSP}senior product analyst.   `,
  "",
  "",
  "",
  `\tSummarise the${ZWSP} attached churn report   in 5 bullets.  `,
  "Then  suggest  two  experiments.   ",
].join("\r\n");

const NUM = new Intl.NumberFormat("en-US");
const PCT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TOGGLES = [
  ["normalizeNewlines", "Normalise line breaks to LF"],
  ["stripZeroWidth", "Strip zero-width / invisible characters"],
  ["normalizeUnicodeSpaces", "Convert non-breaking and exotic spaces"],
  ["collapseSpaces", "Collapse repeated spaces"],
  ["trimLineEnds", "Trim trailing spaces on every line"],
  ["trimIndent", "Remove leading indentation"],
  ["trimDocument", "Trim blank space at start and end"],
];

const DASH = "—";

export default function ToolHome() {
  const [text, setText] = useState(SAMPLE);
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [reveal, setReveal] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => normalizeWhitespace(text, options), [text, options]);

  const hasError = Boolean(result.error);
  const stats = hasError ? null : result.stats;
  const found = hasError ? null : result.found;
  const output = hasError ? "" : result.text;

  const setOption = (key, value) => {
    setOptions((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

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
    setText(SAMPLE);
    setOptions(DEFAULT_OPTIONS);
    setReveal(false);
    setCopied(false);
  };

  const breakdown = [
    ["Characters", hasError ? DASH : `${NUM.format(stats.charsBefore)} → ${NUM.format(stats.charsAfter)}`],
    ["Reduction", hasError ? DASH : `${PCT.format(stats.reductionPercent)}%`],
    ["Lines", hasError ? DASH : `${NUM.format(stats.linesBefore)} → ${NUM.format(stats.linesAfter)}`],
    ["Words", hasError ? DASH : `${NUM.format(stats.wordsBefore)} → ${NUM.format(stats.wordsAfter)}`],
    [
      "Estimated tokens (~4 chars each)",
      hasError ? DASH : `${NUM.format(stats.tokensBefore)} → ${NUM.format(stats.tokensAfter)}`,
    ],
  ];

  const detected = hasError
    ? []
    : [
        ["Invisible / zero-width characters", found.zeroWidth],
        ["Non-breaking or exotic spaces", found.unicodeSpaces],
        ["Windows CRLF line breaks", found.windowsBreaks],
        ["Tab characters", found.tabs],
        ["Runs of 2+ spaces", found.doubleSpaces],
        ["Lines with trailing space", found.trailingSpaces],
      ].filter(([, count]) => count > 0);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <AlignLeft className="h-4 w-4" aria-hidden="true" />
          Prompt hygiene
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Prompt Whitespace Normalizer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste a prompt copied out of a doc, chat or PDF and strip the stray spaces, tabs, stacked
          blank lines and invisible Unicode characters that come with it — everything runs in your
          browser.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="pwn-input">
          Prompt to clean
        </label>
        <textarea
          id="pwn-input"
          className={`mt-2 ${AREA_CLASS}`}
          rows={8}
          spellCheck={false}
          maxLength={MAX_INPUT_CHARS}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setCopied(false);
          }}
          placeholder="Paste your prompt here…"
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {TOGGLES.map(([key, label]) => (
            <label
              key={key}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              htmlFor={`pwn-${key}`}
            >
              <input
                id={`pwn-${key}`}
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={Boolean(options[key])}
                onChange={(event) => setOption(key, event.target.checked)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pwn-tabmode">
              Tabs
            </label>
            <select
              id="pwn-tabmode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={options.tabMode}
              onChange={(event) => setOption("tabMode", event.target.value)}
            >
              <option value="space">Replace each run with one space</option>
              <option value="expand">Expand to spaces</option>
              <option value="keep">Keep tabs as they are</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pwn-blank">
              Maximum consecutive blank lines
            </label>
            <select
              id="pwn-blank"
              className={`mt-2 ${INPUT_CLASS}`}
              value={String(options.maxBlankLines)}
              onChange={(event) => setOption("maxBlankLines", Number(event.target.value))}
            >
              {Array.from({ length: MAX_BLANK_LINES_LIMIT + 1 }, (_, index) => (
                <option key={index} value={String(index)}>
                  {index === 0 ? "None — single-spaced" : `${index} blank line${index > 1 ? "s" : ""}`}
                </option>
              ))}
            </select>
          </div>
          {options.tabMode === "expand" && (
            <div>
              <label className={LABEL_CLASS} htmlFor="pwn-tabsize">
                Tab width (spaces)
              </label>
              <input
                id="pwn-tabsize"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="1"
                max="8"
                step="1"
                value={options.tabSize}
                onChange={(event) => setOption("tabSize", Number(event.target.value))}
              />
            </div>
          )}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Characters removed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(stats.charsRemoved)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Waiting for text"
                : stats.changed
                  ? `about ${NUM.format(stats.tokensSaved)} fewer estimated tokens`
                  : "Already clean — nothing to strip"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the cleaned prompt"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the tool" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {breakdown.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 flex items-center justify-between gap-3">
          <label className={LABEL_CLASS} htmlFor="pwn-output">
            Cleaned prompt
          </label>
          <button
            type="button"
            onClick={() => setReveal((value) => !value)}
            aria-pressed={reveal}
            className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
          >
            {reveal ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
            {reveal ? "Hide marks" : "Show whitespace"}
          </button>
        </div>
        <textarea
          id="pwn-output"
          className={`mt-2 ${AREA_CLASS}`}
          rows={8}
          readOnly
          spellCheck={false}
          value={hasError ? "" : reveal ? revealInvisibles(output) : output}
        />
      </section>

      {detected.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Found in the original paste</h2>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            {detected.map(([label, count]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{NUM.format(count)}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Token figures are an estimate based on roughly four characters per token in English; the
        exact count depends on the model&apos;s tokenizer and on the language you write in.
      </p>
    </main>
  );
}
