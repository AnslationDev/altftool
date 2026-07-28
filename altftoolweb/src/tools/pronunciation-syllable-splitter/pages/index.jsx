"use client";

import { useMemo, useState } from "react";
import { AudioLines, Check, Copy, RotateCcw } from "lucide-react";

import { PARTS_OF_SPEECH, analyseList, analyseWord } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const POS_LABELS = {
  unknown: "Not sure",
  noun: "Noun",
  verb: "Verb",
  adjective: "Adjective",
};

const DEFAULT_WORD = "pronunciation";
const DEFAULT_LIST = "information, photography, comfortable, entrepreneur, vocabulary";

export default function ToolHome() {
  const [word, setWord] = useState(DEFAULT_WORD);
  const [partOfSpeech, setPartOfSpeech] = useState("noun");
  const [list, setList] = useState(DEFAULT_LIST);
  const [copied, setCopied] = useState(false);

  const single = useMemo(() => analyseWord(word, partOfSpeech), [word, partOfSpeech]);
  const batch = useMemo(() => analyseList(list, partOfSpeech), [list, partOfSpeech]);

  const hasError = Boolean(single.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(
        `${single.word}: ${single.marked} (${single.count} syllable${single.count === 1 ? "" : "s"}) — ${single.rule}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setWord(DEFAULT_WORD);
    setPartOfSpeech("noun");
    setList(DEFAULT_LIST);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <AudioLines className="h-4 w-4" aria-hidden="true" />
          Pronunciation
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Pronunciation Syllable Splitter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Break a long English word into syllables and see which one takes the stress. Splitting uses
          the phonics rules for vowel nuclei, consonant blends and silent e; stress uses the suffix
          rules taught in pronunciation courses, and says when it is only an estimate.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="syl-word">
              Word to split
            </label>
            <input
              id="syl-word"
              className={`mt-2 ${INPUT_CLASS}`}
              value={word}
              onChange={(event) => setWord(event.target.value)}
              placeholder="entrepreneur"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="syl-pos">
              Part of speech
            </label>
            <select
              id="syl-pos"
              className={`mt-2 ${INPUT_CLASS}`}
              value={partOfSpeech}
              onChange={(event) => setPartOfSpeech(event.target.value)}
            >
              {PARTS_OF_SPEECH.map((value) => (
                <option key={value} value={value}>
                  {POS_LABELS[value]}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Only matters for two-syllable words: a REC-ord but to re-CORD.
            </p>
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {single.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Stressed syllable in capitals
            </p>
            <p className="mt-1 break-words text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : single.marked}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : `${single.count} syllable${single.count === 1 ? "" : "s"} · ${single.ipaStyle}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the syllable breakdown" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Syllables", hasError ? DASH : single.hyphenated],
            ["Syllable count", hasError ? DASH : NUM.format(single.count)],
            ["Stressed syllable", hasError ? DASH : `${single.stressedSyllable} (number ${single.stressIndex + 1})`],
            ["Rule applied", hasError ? DASH : single.rule],
            [
              "Confidence",
              hasError
                ? DASH
                : single.confidence === "rule"
                  ? "Rule-based — the ending fixes the stress"
                  : "Estimate — check a dictionary for this word",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Split a list</h2>
        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="syl-list">
            Words separated by spaces, commas or new lines
          </label>
          <textarea
            id="syl-list"
            rows={3}
            className={`mt-2 ${AREA_CLASS}`}
            value={list}
            onChange={(event) => setList(event.target.value)}
            spellCheck={false}
          />
        </div>

        {batch.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {batch.error}
          </p>
        ) : (
          <>
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              {NUM.format(batch.wordCount)} words · {NUM.format(batch.totalSyllables)} syllables ·{" "}
              {NUM.format(batch.averageSyllables)} per word
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[340px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Word</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Split with stress</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Syllables</th>
                    <th scope="col" className="py-2 text-right font-semibold">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {batch.items.map((item, index) => (
                    <tr key={`${item.word}-${index}`} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 text-[var(--muted-foreground)]">{item.word}</td>
                      <td className="py-2 pr-3 font-semibold">{item.error ? DASH : item.marked}</td>
                      <td className="py-2 pr-3 text-right">{item.error ? DASH : NUM.format(item.count)}</td>
                      <td className="py-2 text-right text-xs text-[var(--muted-foreground)]">
                        {item.error ? "not a word" : item.confidence === "rule" ? "rule" : "estimate"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        These are spelling-based rules, not a pronunciation dictionary. They handle regular words
        well, but English stress is lexical: loanwords, compounds and names can break every rule, and
        British and American English sometimes stress the same word differently. Anything marked as
        an estimate is worth checking against a dictionary recording.
      </p>
    </main>
  );
}
