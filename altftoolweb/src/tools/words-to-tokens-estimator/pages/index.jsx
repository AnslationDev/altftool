"use client";

import { useMemo, useState } from "react";
import { Calculator, Check, Copy, RotateCcw } from "lucide-react";

import { CONTENT_PRESETS, DEFAULT_MARGIN_PERCENT, estimateTokensFromWords } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const DEC = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  words: "1000",
  presetId: CONTENT_PRESETS[0].id,
  margin: String(DEFAULT_MARGIN_PERCENT),
};

const COMMON_COUNTS = ["300", "500", "1000", "2000", "5000"];

export default function ToolHome() {
  const [words, setWords] = useState(DEFAULTS.words);
  const [presetId, setPresetId] = useState(DEFAULTS.presetId);
  const [margin, setMargin] = useState(DEFAULTS.margin);
  const [copied, setCopied] = useState(false);

  const preset = CONTENT_PRESETS.find((p) => p.id === presetId) ?? CONTENT_PRESETS[0];

  const result = useMemo(
    () =>
      estimateTokensFromWords({
        words: words.trim() === "" ? Number.NaN : Number(words),
        tokensPerWord: preset.tokensPerWord,
        marginPercent: margin.trim() === "" ? Number.NaN : Number(margin),
      }),
    [words, preset.tokensPerWord, margin],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Words to tokens estimate",
      `Word count: ${NUM.format(result.words)}`,
      `Content type: ${preset.label} (${DEC.format(result.tokensPerWord)} tokens/word)`,
      `Estimated tokens: ${NUM.format(result.tokens)}`,
      `Recommended budget (+${result.marginPercent}% margin): ${NUM.format(result.budgetTokens)}`,
      `Approximate characters: ${NUM.format(result.chars)}`,
    ].join("\n");
  }, [hasError, result, preset]);

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
    setWords(DEFAULTS.words);
    setPresetId(DEFAULTS.presetId);
    setMargin(DEFAULTS.margin);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Calculator className="h-4 w-4" aria-hidden="true" />
          Token tools
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Words to Tokens Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Know your token bill before you write. Converts a planned word count into an estimated
          token count using the documented ~4/3 tokens-per-English-word rule, with heavier ratios
          for technical text, other languages and code, plus a safety margin for budgeting.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="wt-words">
              Planned word count
            </label>
            <input
              id="wt-words"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="50"
              value={words}
              onChange={(event) => setWords(event.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {COMMON_COUNTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setWords(c)}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {NUM.format(Number(c))} words
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wt-preset">
              Content type
            </label>
            <select
              id="wt-preset"
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
            <label className={LABEL_CLASS} htmlFor="wt-margin">
              Safety margin (%)
            </label>
            <input
              id="wt-margin"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="100"
              step="5"
              value={margin}
              onChange={(event) => setMargin(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Buffer added to the estimate to absorb tokenizer variance.
            </p>
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
              Estimated tokens
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.tokens)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `Budget ${NUM.format(result.budgetTokens)} tokens with your ${result.marginPercent}% safety margin.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the token estimate"
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
                ["Recommended budget", DASH],
                ["Approximate characters", DASH],
                ["Tokens per 1,000 words", DASH],
              ]
            : [
                [`Recommended budget (+${result.marginPercent}%)`, NUM.format(result.budgetTokens)],
                ["Approximate characters", NUM.format(result.chars)],
                ["Tokens per word used", DEC.format(result.tokensPerWord)],
                ["Tokens per 1,000 words", NUM.format(result.tokensPer1000Words)],
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
        Rule-of-thumb estimate; exact counts depend on the model's tokenizer. For billing-critical
        budgets, verify with the provider's own token counter before committing.
      </p>
    </main>
  );
}
