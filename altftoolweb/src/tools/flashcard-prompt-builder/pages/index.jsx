"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Layers, RotateCcw } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { CARD_FORMATS, MAX_CARDS, MIN_CARDS, buildFlashcardPrompt } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-US");
const DASH = "—";

const DEFAULTS = {
  topic: "French irregular verbs in the present tense",
  source: "",
  cardCount: "30",
  formatId: "basic",
  tsvOutput: true,
  addTags: false,
};

export default function ToolHome() {
  const [topic, setTopic] = useState(DEFAULTS.topic);
  const [source, setSource] = useState(DEFAULTS.source);
  const [cardCount, setCardCount] = useState(DEFAULTS.cardCount);
  const [formatId, setFormatId] = useState(DEFAULTS.formatId);
  const [tsvOutput, setTsvOutput] = useState(DEFAULTS.tsvOutput);
  const [addTags, setAddTags] = useState(DEFAULTS.addTags);
  const { copy, isCopied, announcement } = useCopyToClipboard();

  const result = useMemo(
    () =>
      buildFlashcardPrompt({
        topic,
        source,
        cardCount: cardCount.trim() === "" ? Number.NaN : Number(cardCount),
        formatId,
        tsvOutput,
        addTags,
      }),
    [topic, source, cardCount, formatId, tsvOutput, addTags],
  );

  const hasError = Boolean(result.error);

  const copyPrompt = () => {
    if (hasError) return;
    copy("prompt", result.prompt, { label: "Flashcard prompt" });
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset every field? This will replace your topic and pasted source notes with the demo example values and cannot be undone.",
      )
    ) {
      return;
    }
    setTopic(DEFAULTS.topic);
    setSource(DEFAULTS.source);
    setCardCount(DEFAULTS.cardCount);
    setFormatId(DEFAULTS.formatId);
    setTsvOutput(DEFAULTS.tsvOutput);
    setAddTags(DEFAULTS.addTags);
  };

  const rows = hasError
    ? [
        ["Card format", DASH],
        ["Batches", DASH],
        ["Output style", DASH],
      ]
    : [
        ["Card format", result.format],
        [
          "Batches",
          result.batches === 1
            ? "1 (single response)"
            : `${NUM.format(result.batches)} (${result.batchSizes.join(", ")} cards)`,
        ],
        ["Output style", tsvOutput ? "Tab-separated for SRS import" : "Numbered Q / A pairs"],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Layers className="h-4 w-4" aria-hidden="true" />
          AI for learning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Flashcard Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Generate a prompt that makes an AI write one-fact-per-card flashcards following the
          minimum information principle, output as clean tab-separated lines you can import
          straight into Anki or any SRS app.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fc-topic">
              Deck topic
            </label>
            <input
              id="fc-topic"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fc-count">
              Number of cards ({MIN_CARDS}–{MAX_CARDS})
            </label>
            <input
              id="fc-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_CARDS}
              max={MAX_CARDS}
              step="1"
              value={cardCount}
              onChange={(event) => setCardCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fc-format">
              Card format
            </label>
            <select
              id="fc-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={formatId}
              onChange={(event) => setFormatId(event.target.value)}
            >
              {CARD_FORMATS.map((format) => (
                <option key={format.id} value={format.id}>
                  {format.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fc-source">
              Source notes (optional — cards will be limited to this material)
            </label>
            <textarea
              id="fc-source"
              className={`mt-2 min-h-28 ${TEXTAREA_CLASS}`}
              rows={5}
              placeholder="Paste lecture notes or a textbook passage here..."
              value={source}
              onChange={(event) => setSource(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
            htmlFor="fc-tsv"
          >
            <input
              id="fc-tsv"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={tsvOutput}
              onChange={(event) => setTsvOutput(event.target.checked)}
            />
            Tab-separated output for Anki import
          </label>
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
            htmlFor="fc-tags"
          >
            <input
              id="fc-tags"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={addTags}
              onChange={(event) => setAddTags(event.target.checked)}
              disabled={!tsvOutput}
            />
            Add a topic tag column
          </label>
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
              Cards in the deck
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.cardCount)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              disabled={hasError}
              aria-label={isCopied("prompt") ? "Copied the generated flashcard prompt" : "Copy the generated flashcard prompt"}
              className={`${PRIMARY_BTN} disabled:opacity-50`}
            >
              {isCopied("prompt") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("prompt") ? "Copied!" : "Copy prompt"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={GHOST_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5">
          <h2 className="text-base font-semibold">Generated prompt</h2>
          <pre className="mt-2 max-h-96 overflow-x-auto overflow-y-auto whitespace-pre-wrap rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6">
            {hasError ? "Fix the input above to generate the prompt." : result.prompt}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The prompt is assembled locally in your browser. Check AI-generated cards against your
        course material before importing — a wrong card practised daily is worse than no card.
      </p>
    </main>
  );
}
