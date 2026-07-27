"use client";

import { useMemo, useState } from "react";
import { ArrowRightLeft, Check, Copy, RotateCcw } from "lucide-react";

import { CONTENT_PRESETS, PAGE_PRESETS, READING_WPM, convertTokensToWords } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const DEC = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  tokens: "4096",
  presetId: CONTENT_PRESETS[0].id,
  pageId: PAGE_PRESETS[0].id,
};

const COMMON_BUDGETS = ["1024", "4096", "8192", "32768", "128000"];

export default function ToolHome() {
  const [tokens, setTokens] = useState(DEFAULTS.tokens);
  const [presetId, setPresetId] = useState(DEFAULTS.presetId);
  const [pageId, setPageId] = useState(DEFAULTS.pageId);
  const [copied, setCopied] = useState(false);

  const preset = CONTENT_PRESETS.find((p) => p.id === presetId) ?? CONTENT_PRESETS[0];
  const page = PAGE_PRESETS.find((p) => p.id === pageId) ?? PAGE_PRESETS[0];

  const result = useMemo(
    () =>
      convertTokensToWords({
        tokens: tokens.trim() === "" ? Number.NaN : Number(tokens),
        wordsPerToken: preset.wordsPerToken,
        wordsPerPage: page.wordsPerPage,
      }),
    [tokens, preset.wordsPerToken, page.wordsPerPage],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Tokens to words conversion",
      `Token budget: ${NUM.format(result.tokens)}`,
      `Content type: ${preset.label} (${preset.wordsPerToken} words/token)`,
      `Approximate words: ${NUM.format(result.words)}`,
      `Approximate characters: ${NUM.format(result.chars)}`,
      `Pages (${page.label}): ${DEC.format(result.pages)}`,
      `Reading time at ${READING_WPM} wpm: ${DEC.format(result.readingMinutes)} min`,
    ].join("\n");
  }, [hasError, result, preset, page]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setTokens(DEFAULTS.tokens);
    setPresetId(DEFAULTS.presetId);
    setPageId(DEFAULTS.pageId);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
          Token tools
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Tokens to Words Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn a token budget into an approximate word count, page count and reading time, using
          the documented rule of thumb of about ¾ of an English word per token — adjusted for
          heavier content like code or non-English text.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tw-tokens">
              Token budget
            </label>
            <input
              id="tw-tokens"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={tokens}
              onChange={(event) => setTokens(event.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {COMMON_BUDGETS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setTokens(b)}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {NUM.format(Number(b))}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tw-preset">
              Content type
            </label>
            <select
              id="tw-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={presetId}
              onChange={(event) => setPresetId(event.target.value)}
            >
              {CONTENT_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{preset.note}</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tw-page">
              Page convention
            </label>
            <select
              id="tw-page"
              className={`mt-2 ${INPUT_CLASS}`}
              value={pageId}
              onChange={(event) => setPageId(event.target.value)}
            >
              {PAGE_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
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
              Approximate words
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.words)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${NUM.format(result.tokens)} tokens of ${preset.label.toLowerCase()} at ${preset.wordsPerToken} words per token.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the token conversion result"
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
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError
            ? [
                ["Approximate characters", DASH],
                ["Pages", DASH],
                ["Reading time", DASH],
              ]
            : [
                ["Approximate characters", NUM.format(result.chars)],
                [`Pages (${page.label.toLowerCase()})`, DEC.format(result.pages)],
                [`Reading time (${READING_WPM} words/min)`, `${DEC.format(result.readingMinutes)} min`],
                ["Words per token used", String(result.wordsPerToken)],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Approximations based on published tokenizer rules of thumb; exact counts vary by model
        tokenizer and text. For billing-critical estimates, use the provider's own token counter.
      </p>
    </main>
  );
}
