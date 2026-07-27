"use client";

import { useMemo, useState } from "react";
import { BookOpen, Check, Copy, RotateCcw } from "lucide-react";

import {
  COMPLEX_SYLLABLE_MIN,
  LONG_WORD_MIN_LETTERS,
  MIN_WORDS_FOR_SCORE,
  analyseVocabulary,
  buildReport,
} from "../lib";

const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SAMPLES = [
  {
    id: "plain",
    label: "Plain guidance",
    text:
      "Send us the form before the end of the month. If you miss the date, we will write to you again. You can call the number on the letter if you are not sure what to do. We answer the phone between nine and five on weekdays.",
  },
  {
    id: "policy",
    label: "Corporate policy",
    text:
      "The implementation of comprehensive organisational restructuring necessitates considerable administrative deliberation regarding fundamental accountability mechanisms. Consequently, departmental representatives should facilitate consultative discussions prior to the ratification of any subsequent operational amendments.",
  },
  {
    id: "story",
    label: "Narrative",
    text:
      "She opened the door and the wind came in with her, carrying the smell of wet stone. Nobody looked up. The kettle was still boiling on the stove, and the radio was talking to itself about the weather. It felt, for a moment, as though the room had decided to wait for her to speak first.",
  },
];

const numberFmt = new Intl.NumberFormat("en-US");

export default function ToolHome() {
  const [text, setText] = useState(SAMPLES[1].text);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => analyseVocabulary({ text }), [text]);
  const error = result.error ?? null;
  const report = useMemo(() => (error ? { error } : buildReport(result)), [error, result]);

  const handleCopy = async () => {
    if (report.error) return;
    try {
      await navigator.clipboard.writeText(report.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const handleReset = () => {
    setText(SAMPLES[1].text);
    setCopied(false);
  };

  const dash = "—";

  const scores = error
    ? []
    : [
        ["Flesch-Kincaid grade", result.fleschKincaid, "US school grade needed"],
        ["Gunning Fog index", result.fog, "Years of formal education"],
        ["LIX", result.lix, "Under 40 is easy, over 55 is hard"],
      ];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <header className="mb-6 flex items-start gap-3">
        <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
          <BookOpen className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)] sm:text-2xl">
            Vocabulary Complexity Analyzer
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Measures how demanding your wording is: Flesch Reading Ease, Flesch-Kincaid grade,
            Gunning Fog, LIX and lexical diversity — all computed in your browser.
          </p>
        </div>
      </header>

      <div>
        <label className={LABEL_CLASS} htmlFor="text-input">
          Text to analyse
        </label>
        <textarea
          id="text-input"
          rows={8}
          className={`${TEXTAREA_CLASS} mt-1.5`}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={`Paste at least ${MIN_WORDS_FOR_SCORE} words…`}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {SAMPLES.map((sample) => (
          <button
            key={sample.id}
            type="button"
            className={GHOST_BTN}
            onClick={() => {
              setText(sample.text);
              setCopied(false);
            }}
            aria-label={`Load the ${sample.label} sample`}
          >
            {sample.label}
          </button>
        ))}
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Flesch Reading Ease
        </p>
        <p className="mt-1 text-5xl font-bold text-[var(--foreground)]">
          {error ? dash : numberFmt.format(result.flesch)}
        </p>
        <p className="mt-1 text-base font-semibold text-[var(--primary)]">
          {error ? dash : `${result.fleschLabel} · ${result.fleschAudience}`}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-4 text-sm">
          <div>
            <dt className="text-[var(--muted-foreground)]">Words</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error ? dash : numberFmt.format(result.words)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Sentences</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error ? dash : numberFmt.format(result.sentences)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Words per sentence</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error ? dash : result.wordsPerSentence}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Syllables per word</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error ? dash : result.syllablesPerWord}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">
              {COMPLEX_SYLLABLE_MIN}+ syllable words
            </dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error ? dash : `${result.complexWordPercent}%`}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">
              Words of {LONG_WORD_MIN_LETTERS}+ letters
            </dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error ? dash : `${result.longWordPercent}%`}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Unique words</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error ? dash : numberFmt.format(result.uniqueWords)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Type-token ratio</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error ? dash : `${result.typeTokenRatio} (root ${result.rootTypeTokenRatio})`}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Grade-level scores
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[380px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Formula</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Score</th>
                <th scope="col" className="py-2 font-semibold">Reads as</th>
              </tr>
            </thead>
            <tbody>
              {error ? (
                <tr>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{dash}</td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{dash}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{dash}</td>
                </tr>
              ) : (
                scores.map(([label, value, note]) => (
                  <tr key={label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 text-[var(--foreground)]">{label}</td>
                    <td className="py-2 pr-3 font-semibold text-[var(--foreground)]">{value}</td>
                    <td className="py-2 text-[var(--muted-foreground)]">{note}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Heaviest words
        </p>
        {error || result.hardestWords.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            {error ? dash : "No words of three or more syllables — this reads plainly."}
          </p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {result.hardestWords.map((entry) => (
              <li
                key={entry.word}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm text-[var(--foreground)]"
              >
                {entry.word}{" "}
                <span className="text-[var(--muted-foreground)]">
                  · {entry.syllables} syllables
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className={PRIMARY_BTN}
          onClick={handleCopy}
          aria-label="Copy the complexity report to clipboard"
          disabled={Boolean(report.error)}
        >
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copied!" : "Copy report"}
        </button>
        <button type="button" className={GHOST_BTN} onClick={handleReset} aria-label="Reset the text">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      <p className="mt-4 text-xs text-[var(--muted-foreground)]">
        Syllables are counted with the standard English vowel-group heuristic, which can be a
        syllable out on unusual spellings. All formulas are calibrated on English prose only.
      </p>
    </div>
  );
}
