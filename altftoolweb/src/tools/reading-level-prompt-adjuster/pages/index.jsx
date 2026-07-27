"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gauge, RotateCcw } from "lucide-react";

import { GRADE_BANDS, buildReadingLevelPrompt } from "../lib";

const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const DASH = "—";

const DEFAULTS = {
  text: "Photosynthesis is the biochemical process through which chlorophyll-containing organisms transform electromagnetic radiation into chemical energy, simultaneously assimilating atmospheric carbon dioxide and releasing molecular oxygen as a metabolic byproduct.",
  bandId: "g4-5",
  keepTerms: true,
};

export default function ToolHome() {
  const [text, setText] = useState(DEFAULTS.text);
  const [bandId, setBandId] = useState(DEFAULTS.bandId);
  const [keepTerms, setKeepTerms] = useState(DEFAULTS.keepTerms);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => buildReadingLevelPrompt({ text, bandId, keepTerms }),
    [text, bandId, keepTerms],
  );

  const hasError = Boolean(result.error);
  const analysis = hasError ? null : result.analysis;

  const copyPrompt = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setText(DEFAULTS.text);
    setBandId(DEFAULTS.bandId);
    setKeepTerms(DEFAULTS.keepTerms);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Words / sentences", DASH],
        ["Words per sentence", DASH],
        ["Syllables per word", DASH],
        ["Flesch Reading Ease", DASH],
        ["Target level", DASH],
      ]
    : [
        [
          "Words / sentences",
          `${NUM.format(analysis.wordCount)} / ${NUM.format(analysis.sentenceCount)}`,
        ],
        ["Words per sentence", NUM.format(analysis.wordsPerSentence)],
        ["Syllables per word", NUM2.format(analysis.syllablesPerWord)],
        ["Flesch Reading Ease", NUM.format(analysis.readingEase)],
        ["Target level", `${result.band} (grade ${result.fkTarget})`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          AI for learning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Reading Level Prompt Adjuster
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste any text or prompt and the tool scores it with the Flesch-Kincaid grade formula,
          then builds a rewrite prompt with concrete sentence-length and vocabulary rules for the
          grade band you pick.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="rl-text">
            Text or prompt to adjust
          </label>
          <textarea
            id="rl-text"
            className={`mt-2 min-h-36 ${TEXTAREA_CLASS}`}
            rows={6}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rl-band">
              Target reading level
            </label>
            <select
              id="rl-band"
              className={`mt-2 ${INPUT_CLASS}`}
              value={bandId}
              onChange={(event) => setBandId(event.target.value)}
            >
              {GRADE_BANDS.map((band) => (
                <option key={band.id} value={band.id}>
                  {band.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
              htmlFor="rl-terms"
            >
              <input
                id="rl-terms"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                checked={keepTerms}
                onChange={(event) => setKeepTerms(event.target.checked)}
              />
              Keep essential technical terms (defined on first use)
            </label>
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
              Current Flesch-Kincaid grade
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(analysis.fkGrade)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `Rewrite target: grade ${result.fkTarget}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              disabled={hasError}
              aria-label="Copy the generated rewrite prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy prompt"}
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5">
          <h2 className="text-base font-semibold">Generated rewrite prompt</h2>
          <pre className="mt-2 max-h-96 overflow-x-auto overflow-y-auto whitespace-pre-wrap rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6">
            {hasError ? "Fix the input above to generate the prompt." : result.prompt}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Scoring runs locally in your browser using the Flesch-Kincaid grade formula with a heuristic
        syllable counter, so scores can differ slightly from dictionary-based tools. Re-score the
        AI&apos;s rewrite here to confirm it hit the target band.
      </p>
    </main>
  );
}
