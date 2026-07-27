"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Divide, RotateCcw } from "lucide-react";

import { BASELINE_TOKENS_PER_WORD, computeTokenWordRatio } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const DEC = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_TEXT =
  "Large language models bill by the token, not the word. Knowing your own tokens-per-word ratio turns any word count into a realistic token budget before you send a single request.";

export default function ToolHome() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [actualTokens, setActualTokens] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeTokenWordRatio({
        text,
        actualTokens: actualTokens.trim() === "" ? null : Number(actualTokens),
      }),
    [text, actualTokens],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Tokens-per-word ratio",
      `Ratio: ${DEC.format(result.ratio)} tokens/word (${result.band})`,
      `Words: ${NUM.format(result.words)}`,
      `Characters: ${NUM.format(result.chars)}`,
      `Tokens: ${NUM.format(result.tokens)}${result.tokensEstimated ? " (estimated at 4 chars/token)" : " (actual)"}`,
      `Tokens per 1,000 words: ${NUM.format(result.tokensPer1000Words)}`,
      `Vs ~1.33 English baseline: ${result.vsBaselinePercent >= 0 ? "+" : ""}${DEC.format(result.vsBaselinePercent)}%`,
    ].join("\n");
  }, [hasError, result]);

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
    setText(DEFAULT_TEXT);
    setActualTokens("");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Divide className="h-4 w-4" aria-hidden="true" />
          Token tools
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Token Per Word Ratio Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste a sample of your writing to measure how many tokens each word costs. Uses the
          published rule of thumb of 1 token per 4 characters, or your exact count from a provider
          tokenizer if you have one.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="tr-text">
            Text sample
          </label>
          <textarea
            id="tr-text"
            className="mt-2 min-h-40 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </div>
        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="tr-actual">
            Actual token count (optional)
          </label>
          <input
            id="tr-actual"
            className={`mt-2 ${INPUT_CLASS}`}
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            placeholder="Paste the count from tiktoken or your provider's token counter"
            value={actualTokens}
            onChange={(event) => setActualTokens(event.target.value)}
          />
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            If you ran this exact sample through a real tokenizer, enter the count here for an
            exact ratio instead of the character-based estimate.
          </p>
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
              Tokens per word
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : DEC.format(result.ratio)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${result.band} — ${result.bandNote}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the tokens-per-word result"
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
              aria-label="Reset the sample and token count"
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
                ["Words", DASH],
                ["Characters", DASH],
                ["Tokens", DASH],
                ["Tokens per 1,000 words", DASH],
              ]
            : [
                ["Words", NUM.format(result.words)],
                ["Characters", NUM.format(result.chars)],
                [
                  result.tokensEstimated ? "Tokens (estimated, 4 chars/token)" : "Tokens (actual)",
                  NUM.format(result.tokens),
                ],
                ["Characters per token", DEC.format(result.charsPerToken)],
                ["Tokens per 1,000 words", NUM.format(result.tokensPer1000Words)],
                [
                  `Vs English baseline (${DEC.format(BASELINE_TOKENS_PER_WORD)} tokens/word)`,
                  `${result.vsBaselinePercent >= 0 ? "+" : ""}${DEC.format(result.vsBaselinePercent)}%`,
                ],
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
        Character-based token estimates are approximate; exact counts depend on the model's
        tokenizer. For billing-critical budgets, verify with the provider's own token counter.
      </p>
    </main>
  );
}
