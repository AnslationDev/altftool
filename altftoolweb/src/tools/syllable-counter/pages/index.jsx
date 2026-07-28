"use client";

import { useMemo, useState } from "react";
import { AudioLines, Check, Copy, RotateCcw } from "lucide-react";
import { HAIKU_PATTERN, analyzeText } from "../lib";

const DASH = "—";

const SAMPLE =
  "An old silent pond\nA frog jumps into the pond\nSplash! Silence again";

const intFmt = new Intl.NumberFormat("en-US");
const decimalFmt = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const percentFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

function Row({ label, value }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[var(--border)] py-2 last:border-b-0">
      <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
      <dd className="text-sm font-medium text-[var(--foreground)]">{value}</dd>
    </div>
  );
}

export default function SyllableCounterPage() {
  const [text, setText] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => analyzeText(text), [text]);
  const hasError = Boolean(result.error);

  const wordBreakdown = useMemo(() => {
    if (hasError) return [];
    const seen = new Map();
    for (const w of result.perWord) {
      if (!seen.has(w.word)) seen.set(w.word, w.syllables);
    }
    return Array.from(seen.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 40);
  }, [hasError, result]);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Syllables: ${intFmt.format(result.syllables)}`,
      `Words: ${intFmt.format(result.words)}`,
      `Sentences: ${intFmt.format(result.sentences)}`,
      `Syllables per word: ${decimalFmt.format(result.syllablesPerWord)}`,
      `Flesch Reading Ease: ${decimalFmt.format(result.fleschReadingEase)} (${result.band ? result.band.label : "n/a"})`,
      `Flesch–Kincaid Grade: ${decimalFmt.format(result.fleschKincaidGrade)}`,
    ].join("\n");
  }, [hasError, result]);

  async function handleCopy() {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  function handleReset() {
    setText(SAMPLE);
    setCopied(false);
  }

  const contentLines = hasError ? [] : result.lines.filter((l) => l.words > 0);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <header className="mb-6 flex items-start gap-3">
        <AudioLines className="mt-1 h-6 w-6 shrink-0 text-[var(--primary)]" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Syllable Counter</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Counts syllables in English word by word and line by line, and reports the Flesch
            readability scores that depend on them.
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="text" className="text-sm font-medium text-[var(--foreground)]">
          Your text (one line per line of verse)
        </label>
        <textarea
          id="text"
          rows={8}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setCopied(false);
          }}
          className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCopy}
          disabled={hasError}
          aria-label="Copy the syllable and readability summary"
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none disabled:opacity-50"
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
          onClick={handleReset}
          aria-label="Reset to the sample haiku"
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-medium text-[var(--foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      {hasError ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-sm text-[var(--muted-foreground)]">Syllables</p>
        <p className="mt-1 text-5xl leading-tight font-semibold text-[var(--foreground)]">
          {hasError ? DASH : intFmt.format(result.syllables)}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {hasError
            ? DASH
            : `${intFmt.format(result.words)} words · ${intFmt.format(result.sentences)} sentence${result.sentences === 1 ? "" : "s"}`}
        </p>

        <dl className="mt-4">
          <Row
            label="Syllables per word"
            value={hasError ? DASH : decimalFmt.format(result.syllablesPerWord)}
          />
          <Row
            label="Words per sentence"
            value={hasError ? DASH : decimalFmt.format(result.wordsPerSentence)}
          />
          <Row
            label="One-syllable words"
            value={
              hasError
                ? DASH
                : `${intFmt.format(result.monosyllabic)} (${percentFmt.format(result.monosyllabicShare)}%)`
            }
          />
          <Row
            label="Three-syllable-plus words"
            value={
              hasError
                ? DASH
                : `${intFmt.format(result.polysyllabic)} (${percentFmt.format(result.polysyllabicShare)}%)`
            }
          />
          <Row
            label="Longest word"
            value={
              hasError
                ? DASH
                : `${result.longestWord.word} (${result.longestWord.syllables})`
            }
          />
          <Row
            label="Flesch Reading Ease"
            value={
              hasError
                ? DASH
                : `${decimalFmt.format(result.fleschReadingEase)}${result.band ? ` · ${result.band.label}` : ""}`
            }
          />
          <Row
            label="Flesch–Kincaid Grade"
            value={hasError ? DASH : decimalFmt.format(result.fleschKincaidGrade)}
          />
        </dl>
      </section>

      {!hasError && result.haiku ? (
        <p
          className={`mt-4 rounded-md px-3 py-2 text-sm ${
            result.haiku.matches
              ? "bg-[var(--success-soft)] text-[var(--success)]"
              : "bg-[var(--warning-soft)] text-[var(--warning)]"
          }`}
        >
          {result.haiku.matches
            ? `Three lines of ${HAIKU_PATTERN.join("–")} — that is a haiku.`
            : `Three lines of ${result.haiku.counts.join("–")} — a haiku needs ${HAIKU_PATTERN.join("–")}.`}
        </p>
      ) : null}

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Line by line</h2>
        <div className="mt-3 overflow-x-auto rounded-xl ring-1 ring-[var(--border)]">
          <table className="w-full min-w-[24rem] text-left text-sm">
            <thead className="bg-[var(--card)] text-[var(--muted-foreground)]">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">
                  Line
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium">
                  Words
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium">
                  Syllables
                </th>
              </tr>
            </thead>
            <tbody>
              {hasError || contentLines.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-3 py-4 text-[var(--muted-foreground)]">
                    {DASH}
                  </td>
                </tr>
              ) : (
                contentLines.map((line, i) => (
                  <tr key={i} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--foreground)]">{line.text}</td>
                    <td className="px-3 py-2 text-right text-[var(--muted-foreground)]">
                      {intFmt.format(line.words)}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-[var(--foreground)]">
                      {intFmt.format(line.syllables)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Word by word (longest first)
        </h2>
        {hasError ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {wordBreakdown.map(([word, syllables]) => (
              <li
                key={word}
                className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm text-[var(--foreground)]"
              >
                <span>{word}</span>
                <span className="rounded bg-[var(--primary)] px-1.5 text-xs text-[var(--primary-foreground)]">
                  {syllables}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
