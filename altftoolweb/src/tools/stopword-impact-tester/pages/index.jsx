"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Filter, RotateCcw } from "lucide-react";

import { READING_WPM, STOPWORDS, analyseStopwordImpact } from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const DEFAULT_TEXT = `The onboarding flow is really just a bit too long at the moment, and it does not clearly explain what happens after the first step. We should basically simplify the copy on the second screen so that new users can actually finish the setup without any help from support.`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_CLASS =
  "h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

/** Presentation only — no arithmetic beyond formatting what lib returned. */
const seconds = (value) => {
  if (value === null || value === undefined) return DASH;
  if (value < 60) return `${Math.round(value)} s`;
  return `${NUM1.format(value / 60)} min`;
};

export default function ToolHome() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [removeStopwords, setRemoveStopwords] = useState(true);
  const [removeFillers, setRemoveFillers] = useState(true);
  const [protectMeaningCritical, setProtectMeaningCritical] = useState(true);
  const [customStopwords, setCustomStopwords] = useState("");
  const [keepWords, setKeepWords] = useState("");
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const result = useMemo(
    () =>
      analyseStopwordImpact({
        text,
        removeStopwords,
        removeFillers,
        protectMeaningCritical,
        customStopwords,
        keepWords,
      }),
    [text, removeStopwords, removeFillers, protectMeaningCritical, customStopwords, keepWords],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.filteredText);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
        copyTimeoutRef.current = null;
      }, 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setText(DEFAULT_TEXT);
    setRemoveStopwords(true);
    setRemoveFillers(true);
    setProtectMeaningCritical(true);
    setCustomStopwords("");
    setKeepWords("");
    setCopied(false);
  };

  const rows = [
    [
      "Words",
      hasError
        ? DASH
        : `${NUM.format(result.originalWords)} → ${NUM.format(result.filteredWords)} (−${NUM.format(result.wordsRemoved)})`,
    ],
    [
      "Characters",
      hasError
        ? DASH
        : `${NUM.format(result.originalChars)} → ${NUM.format(result.filteredChars)} (−${NUM1.format(result.charReduction)}%)`,
    ],
    [
      "Estimated tokens",
      hasError
        ? DASH
        : `${NUM.format(result.originalTokens)} → ${NUM.format(result.filteredTokens)} (−${NUM.format(result.tokensSaved)})`,
    ],
    [
      `Reading time at ${READING_WPM} wpm`,
      hasError
        ? DASH
        : `${seconds(result.originalReadingSeconds)} → ${seconds(result.filteredReadingSeconds)}`,
    ],
    [
      "Meaning-critical words protected",
      hasError
        ? DASH
        : NUM.format(result.protectedWords.reduce((total, item) => total + item.count, 0)),
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Filter className="h-4 w-4" aria-hidden="true" />
          Token tools
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Stopword Impact Tester</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Strip the {STOPWORDS.length}-word English stopword list and common prose filler, then see
          what it saved in words, characters and estimated tokens — and, more usefully, what it
          would have cost in meaning if negations were not protected.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="sw-text">
          Your text
        </label>
        <textarea
          id="sw-text"
          className={`mt-2 ${AREA_CLASS}`}
          rows={7}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setCopied(false);
          }}
        />

        <div className="mt-4 grid gap-3">
          <label className="flex min-h-11 items-center gap-2 text-sm" htmlFor="sw-stop">
            <input
              id="sw-stop"
              type="checkbox"
              className={CHECK_CLASS}
              checked={removeStopwords}
              onChange={(event) => {
                setRemoveStopwords(event.target.checked);
                setCopied(false);
              }}
            />
            Remove standard English stopwords
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm" htmlFor="sw-filler">
            <input
              id="sw-filler"
              type="checkbox"
              className={CHECK_CLASS}
              checked={removeFillers}
              onChange={(event) => {
                setRemoveFillers(event.target.checked);
                setCopied(false);
              }}
            />
            Remove filler and hedge words (really, basically, actually)
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm" htmlFor="sw-protect">
            <input
              id="sw-protect"
              type="checkbox"
              className={CHECK_CLASS}
              checked={protectMeaningCritical}
              onChange={(event) => {
                setProtectMeaningCritical(event.target.checked);
                setCopied(false);
              }}
            />
            Protect negations and contrastives (not, no, but, than)
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sw-custom">
              Also remove these words
            </label>
            <input
              id="sw-custom"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="comma or space separated"
              value={customStopwords}
              onChange={(event) => {
                setCustomStopwords(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sw-keep">
              Never remove these words
            </label>
            <input
              id="sw-keep"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="comma or space separated"
              value={keepWords}
              onChange={(event) => {
                setKeepWords(event.target.value);
                setCopied(false);
              }}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5" aria-live="polite">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Words removed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM1.format(result.wordReduction)}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Paste some text to see the impact."
                : `${NUM.format(result.wordsRemoved)} of ${NUM.format(result.originalWords)} words stripped`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the stripped text"
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
              aria-label="Reset the text and all options"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
          <pre className="whitespace-pre-wrap break-words p-3 text-sm leading-6 text-[var(--foreground)]">
            {hasError ? DASH : result.filteredText || DASH}
          </pre>
        </div>

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError &&
          result.warnings.map((warning) => (
            <p
              key={warning}
              className="mt-3 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm leading-6 text-[var(--warning)]"
            >
              {warning}
            </p>
          ))}
      </section>

      {!hasError && result.removed.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What was removed</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[280px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Word
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Times removed
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.removed.slice(0, 40).map((item) => (
                  <tr key={item.word} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-mono">{item.word}</td>
                    <td className="py-2 text-right font-semibold">{NUM.format(item.count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.protectedWords.length > 0 && (
            <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
              Kept because they change meaning:{" "}
              {result.protectedWords.map((item) => `${item.word} (${item.count})`).join(", ")}.
            </p>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Token figures are estimates from the usual English rules of thumb of about four characters
        or 0.75 words per token, not the output of a real tokeniser — your model&apos;s count will
        differ. Reading time uses 238 words per minute, the mean silent reading rate for English
        non-fiction reported in Brysbaert&apos;s 2019 meta-analysis.
      </p>
    </main>
  );
}
