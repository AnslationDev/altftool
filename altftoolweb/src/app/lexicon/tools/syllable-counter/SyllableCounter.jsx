"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { AudioLines, LoaderCircle } from "lucide-react";
import { countSyllables } from "@altftool/core/lexicon";

import {
  AREA_CLASS,
  CHIP_CLASS,
  EmptyState,
  GHOST_CLASS,
  HINT_CLASS,
  LABEL_CLASS,
  ToolPanel,
} from "../_shared/toolkit";

/*
 * The syllable counter.
 *
 * The only tool here that asks the server for nothing. `countSyllables` is a
 * pure function of the spelling — the same one that produced the syllable
 * division stored against every entry in the dictionary — so the text you
 * paste is counted in your browser and never sent anywhere.
 *
 * Counting is deferred rather than debounced: React keeps the textarea
 * responsive while a long passage is being measured, and the panel says so
 * instead of showing numbers that belong to the previous keystroke.
 */

const SAMPLE =
  "An old silent pond. A frog jumps into the pond, splash! Silence again. The syllable is the unit a reader hears, not the one a writer counts.";

/** Rendering every token of a pasted chapter would cost more than it tells
    you. The counts above the list are computed over all of it regardless. */
const MAX_TOKENS_SHOWN = 400;

/* Global — used only with String.match, which ignores and resets lastIndex. */
const WORD_PATTERN = /[A-Za-z][A-Za-z'’-]*/g;
/* Non-global twin for tests, so no call can leave lastIndex behind it. */
const HAS_WORD = /[A-Za-z]/;

/**
 * Flesch's own bands, with his labels.
 *
 * The scale is open at both ends — a long enough sentence of long enough words
 * scores below zero — so the outer bands are stated as "or below" and "or
 * above" rather than clamped to 0 and 100.
 */
const BANDS = [
  { min: 90, label: "Very easy", note: "Understood by an average 11-year-old." },
  { min: 80, label: "Easy", note: "Conversational English." },
  { min: 70, label: "Fairly easy", note: "Plain, direct prose." },
  { min: 60, label: "Standard", note: "Understood by 13- to 15-year-olds." },
  { min: 50, label: "Fairly difficult", note: "Upper secondary reading." },
  { min: 30, label: "Difficult", note: "College-level reading." },
  { min: -Infinity, label: "Very difficult", note: "Best understood by graduates." },
];

const bandFor = (score) => BANDS.find((band) => score >= band.min) || BANDS[BANDS.length - 1];

function analyse(text) {
  const tokens = text.match(WORD_PATTERN) || [];
  const words = tokens.map((word) => ({ word, syllables: countSyllables(word) }));
  const syllables = words.reduce((sum, entry) => sum + entry.syllables, 0);

  // A sentence ends at . ! ? or … followed by whitespace or the end of the
  // text. A trailing fragment with no terminator still counts as one sentence,
  // because a heading or a note is a unit of reading even without a full stop.
  const sentences = text
    .split(/[.!?…]+(?=\s|$)/u)
    .filter((part) => HAS_WORD.test(part)).length;

  const sentenceCount = words.length === 0 ? 0 : Math.max(1, sentences);
  const perWord = words.length === 0 ? 0 : syllables / words.length;
  const perSentence = sentenceCount === 0 ? 0 : words.length / sentenceCount;

  const flesch =
    words.length === 0 || sentenceCount === 0
      ? null
      : 206.835 - 1.015 * perSentence - 84.6 * perWord;

  const longest = words.reduce(
    (best, entry) => (entry.syllables > (best?.syllables || 0) ? entry : best),
    null,
  );

  return {
    words,
    wordCount: words.length,
    syllables,
    sentenceCount,
    perWord,
    perSentence,
    flesch,
    longest,
  };
}

export default function SyllableCounter() {
  const [text, setText] = useState("");
  const deferred = useDeferredValue(text);
  const counting = deferred !== text;

  const result = useMemo(() => analyse(deferred), [deferred]);

  const shown = result.words.slice(0, MAX_TOKENS_SHOWN);

  return (
    <ToolPanel className="mt-8">
      <form onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="syllable-text" className={LABEL_CLASS}>
          Your text
        </label>
        <textarea
          id="syllable-text"
          name="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          spellCheck="false"
          placeholder="Paste a line, a paragraph or a whole draft…"
          aria-describedby="syllable-text-hint"
          className={AREA_CLASS}
        />
        <p id="syllable-text-hint" className={HINT_CLASS}>
          Counted in your browser. Nothing you paste is sent to a server.
        </p>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setText(SAMPLE)} className={CHIP_CLASS}>
          Use a sample
        </button>
        {text ? (
          <button type="button" onClick={() => setText("")} className={GHOST_CLASS}>
            Clear
          </button>
        ) : null}
      </div>

      <div className="mt-6 border-t border-border pt-6">
        {counting ? (
          <p
            className="mb-4 flex items-center gap-2.5 text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            <LoaderCircle className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />
            Counting…
          </p>
        ) : null}

        {result.wordCount === 0 ? (
          text.trim().length > 0 ? (
            <EmptyState title="No words to count">
              The counter looks for runs of letters. What you pasted contains digits, punctuation
              or symbols but no alphabetic words, so there is nothing to divide into syllables.
            </EmptyState>
          ) : (
            <p className="flex items-center gap-2.5 py-8 text-sm text-muted-foreground">
              <AudioLines className="h-4 w-4 shrink-0" aria-hidden="true" />
              Paste or type something above. Counts appear as you write.
            </p>
          )
        ) : (
          <div className="space-y-8">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
              <Stat value={result.syllables.toLocaleString("en-US")} label="Syllables" />
              <Stat value={result.wordCount.toLocaleString("en-US")} label="Words" />
              <Stat value={result.sentenceCount.toLocaleString("en-US")} label="Sentences" />
              <Stat
                value={result.perWord.toFixed(2)}
                label="Syllables per word"
              />
              <Stat
                value={result.perSentence.toFixed(1)}
                label="Words per sentence"
              />
            </dl>

            {result.flesch !== null ? (
              <ReadingEase score={result.flesch} />
            ) : null}

            <section>
              <h3 className="flex flex-wrap items-baseline gap-2 border-b border-border pb-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
                Word by word
                <span className="normal-case tracking-normal text-muted-foreground">
                  {shown.length < result.wordCount
                    ? `first ${MAX_TOKENS_SHOWN.toLocaleString("en-US")} of ${result.wordCount.toLocaleString("en-US")}`
                    : `${result.wordCount.toLocaleString("en-US")} words`}
                </span>
              </h3>
              <ul
                className="mt-3 flex flex-wrap gap-1.5"
                style={{ listStyle: "none" }}
              >
                {shown.map((entry, index) => (
                  <li
                    key={`${entry.word}-${index}`}
                    className="flex min-h-[2.25rem] items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-sm text-foreground"
                  >
                    <span>{entry.word}</span>
                    <span className="font-mono text-xs font-semibold tabular-nums text-primary">
                      {entry.syllables}
                    </span>
                  </li>
                ))}
              </ul>
              {result.longest ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  Longest word by sound:{" "}
                  <span className="text-foreground">{result.longest.word}</span> at{" "}
                  {result.longest.syllables}{" "}
                  {result.longest.syllables === 1 ? "syllable" : "syllables"}.
                </p>
              ) : null}
            </section>
          </div>
        )}
      </div>
    </ToolPanel>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <dd className="font-mono text-2xl font-semibold tabular-nums text-foreground">{value}</dd>
      <dt className="mt-0.5 text-xs text-muted-foreground">{label}</dt>
    </div>
  );
}

function ReadingEase({ score }) {
  const band = bandFor(score);
  // The meter is clamped to the printed 0–100 range; the number beside it is
  // not, because a score of −12 is a real result and rounding it to zero would
  // hide the very thing it is telling you.
  const fill = Math.max(0, Math.min(100, score));

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h3 className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
          Flesch Reading Ease
        </h3>
        <p className="font-mono text-sm text-muted-foreground">
          <span className="text-2xl font-semibold tabular-nums text-foreground">
            {score.toFixed(1)}
          </span>{" "}
          / 100
        </p>
      </div>

      <div
        className="mt-3 h-2 w-full overflow-hidden rounded-full"
        style={{ background: "var(--afl-track)" }}
        role="img"
        aria-label={`Flesch Reading Ease ${score.toFixed(1)} out of 100 — ${band.label}`}
      >
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${fill}%` }}
        />
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{band.label}.</span> {band.note} A higher
        score means easier reading; shorter sentences and shorter words both push it up.
      </p>
    </section>
  );
}
