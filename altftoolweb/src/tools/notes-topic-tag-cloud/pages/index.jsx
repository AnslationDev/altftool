"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Tags } from "lucide-react";

import { DEFAULT_MAX_TAGS, DEFAULT_MIN_COUNT, DEFAULT_MIN_WORD_LENGTH, MAX_TAGS_LIMIT, analyzeTopics } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const PCT = new Intl.NumberFormat("en-IN", { style: "percent", maximumFractionDigits: 1 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

/** Presentation-only mapping from lib tier (1-5) to a text size class. */
const TIER_CLASS = {
  1: "text-sm opacity-70",
  2: "text-base opacity-80",
  3: "text-lg",
  4: "text-2xl font-semibold",
  5: "text-3xl font-bold text-[var(--primary)]",
};

const SAMPLE_NOTES = `The French Revolution began in 1789 with the storming of the Bastille. The revolution abolished feudal privileges and the monarchy. Revolution leaders drafted the Declaration of the Rights of Man.
The Industrial Revolution transformed textile production in Britain. Steam power and railways spread industrial methods across Europe.
Nationalism grew across Europe in the nineteenth century. Nationalism unified Germany and Italy, and nationalism also strained the Austrian empire.
The Russian Revolution of 1917 ended Tsarist rule. Lenin led the Bolsheviks; the revolution created the Soviet state.`;

const DEFAULTS = {
  text: SAMPLE_NOTES,
  maxTags: String(DEFAULT_MAX_TAGS),
  minWordLength: String(DEFAULT_MIN_WORD_LENGTH),
  minCount: String(DEFAULT_MIN_COUNT),
};

export default function ToolHome() {
  const [text, setText] = useState(DEFAULTS.text);
  const [maxTags, setMaxTags] = useState(DEFAULTS.maxTags);
  const [minWordLength, setMinWordLength] = useState(DEFAULTS.minWordLength);
  const [minCount, setMinCount] = useState(DEFAULTS.minCount);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      analyzeTopics({
        text,
        maxTags: maxTags.trim() === "" ? Number.NaN : Number(maxTags),
        minWordLength: minWordLength.trim() === "" ? Number.NaN : Number(minWordLength),
        minCount: minCount.trim() === "" ? Number.NaN : Number(minCount),
      }),
    [text, maxTags, minWordLength, minCount],
  );
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Topic tag cloud for notes",
      `Total words: ${NUM.format(result.totalWords)} — distinct topic terms: ${NUM.format(result.uniqueTerms)}`,
      "",
      ...result.tags.map((tag) => `${tag.term}: ${tag.count} (${PCT.format(tag.share)})`),
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
    setText(DEFAULTS.text);
    setMaxTags(DEFAULTS.maxTags);
    setMinWordLength(DEFAULTS.minWordLength);
    setMinCount(DEFAULTS.minCount);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Tags className="h-4 w-4" aria-hidden="true" />
          Notes analysis
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Topic Tag Cloud For Notes</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste your notes and see which topics dominate them — and which are thin. Everything runs
          in your browser; nothing is uploaded.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="ttc-text">
          Your notes
        </label>
        <textarea
          id="ttc-text"
          className="mt-2 min-h-48 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className={LABEL_CLASS} htmlFor="ttc-max">
              Max tags shown
            </label>
            <input
              id="ttc-max"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_TAGS_LIMIT}
              step="1"
              value={maxTags}
              onChange={(event) => setMaxTags(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ttc-minlen">
              Min word length
            </label>
            <input
              id="ttc-minlen"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={minWordLength}
              onChange={(event) => setMinWordLength(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ttc-mincount">
              Min occurrences
            </label>
            <input
              id="ttc-mincount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={minCount}
              onChange={(event) => setMinCount(event.target.value)}
            />
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
              Dominant topic
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.dominant[0]}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the cloud."
                : `${NUM.format(result.shownTerms)} topic terms shown from ${NUM.format(result.totalWords)} words of notes.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the topic frequency list"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy list"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset notes and filters" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError ? (
          <>
            <ul className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-3" aria-label="Topic tag cloud">
              {result.tags.map((tag) => (
                <li key={tag.term} className={`leading-none ${TIER_CLASS[tag.tier]}`}>
                  {tag.term}
                  <span className="ml-1 align-super text-xs text-[var(--muted-foreground)]">{NUM.format(tag.count)}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-6 divide-y divide-[var(--border)] text-sm">
              <div className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">Dominant topics (largest tier)</dt>
                <dd className="text-right font-semibold">{result.dominant.join(", ")}</dd>
              </div>
              <div className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">Thin topics (lowest count shown)</dt>
                <dd className="text-right font-semibold">
                  {result.thin.slice(0, 12).join(", ")}
                  {result.thin.length > 12 ? ` +${NUM.format(result.thin.length - 12)} more` : ""}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">Total words analysed</dt>
                <dd className="text-right font-semibold">{NUM.format(result.totalWords)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">Distinct topic terms found</dt>
                <dd className="text-right font-semibold">{NUM.format(result.uniqueTerms)}</dd>
              </div>
            </dl>
          </>
        ) : (
          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {[
              ["Dominant topics", DASH],
              ["Thin topics", DASH],
              ["Total words analysed", DASH],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Term-frequency analysis with English stopwords removed and bare numbers ignored. Tag size is
        scaled linearly between the least and most frequent terms shown.
      </p>
    </main>
  );
}
