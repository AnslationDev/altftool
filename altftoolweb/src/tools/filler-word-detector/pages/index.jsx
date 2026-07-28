"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scissors } from "lucide-react";

import {
  CATEGORIES,
  LOOSE_DENSITY_PER_100,
  REPEAT_FLAG_COUNT,
  TIGHT_DENSITY_PER_100,
  detectFillers,
  reportToText,
  segmentText,
  stripFillers,
} from "../lib";

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN");

const SAMPLE =
  "I just really think that this proposal is very, very important. Basically, in order to move forward we need a large number of approvals, and it should be noted that the fact that nobody replied is a problem.";

const VERDICT_COPY = {
  tight: "Tight — under two per 100 words.",
  ordinary: "Ordinary — most published prose sits in this band.",
  loose: "Padded — worth a cutting pass.",
};

export default function ToolHome() {
  const [text, setText] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);
  const [copiedClean, setCopiedClean] = useState(false);

  const report = useMemo(() => detectFillers(text), [text]);
  const stripped = useMemo(() => stripFillers(text), [text]);
  const segments = useMemo(() => segmentText(text), [text]);

  const hasError = Boolean(report.error);
  const plainText = useMemo(() => reportToText(report), [report]);

  const copyReport = async () => {
    if (!plainText) return;
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const copyClean = async () => {
    if (stripped.error) return;
    try {
      await navigator.clipboard.writeText(stripped.text);
      setCopiedClean(true);
      setTimeout(() => setCopiedClean(false), 1500);
    } catch {
      setCopiedClean(false);
    }
  };

  const reset = () => {
    setText(SAMPLE);
    setCopied(false);
    setCopiedClean(false);
  };

  const stats = hasError
    ? [
        ["Words", DASH],
        ["Filler instances", DASH],
        ["Different fillers", DASH],
        ["Safe to cut automatically", DASH],
        ["Most frequent", DASH],
      ]
    : [
        ["Words", NUM.format(report.words)],
        ["Filler instances", NUM.format(report.total)],
        ["Different fillers", NUM.format(report.unique)],
        ["Safe to cut automatically", NUM.format(report.deletableCount)],
        [
          "Most frequent",
          report.worst ? `${report.worst.word} (${report.worst.count})` : "None found",
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Scissors className="h-4 w-4" aria-hidden="true" />
          Cutting pass
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Filler Word Detector</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Finds the four things that quietly pad prose: intensifiers propping up weak words, hedges
          that withdraw the claim, filler adverbs, and phrases doing one word&apos;s job. Each hit
          comes with a specific fix, and the stripped draft shows what is left without them.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="fwd-text">
          Paste your writing
        </label>
        <textarea
          id="fwd-text"
          rows={7}
          className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {report.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Filler density
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                !hasError && report.verdict === "loose"
                  ? "text-[var(--danger)]"
                  : "text-[var(--primary)]"
              }`}
            >
              {hasError ? DASH : `${report.densityPer100} / 100`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Paste some text to scan it." : VERDICT_COPY[report.verdict]}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyReport}
              disabled={hasError || report.total === 0}
              aria-label="Copy the filler report"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy report"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the text box" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {stats.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && report.overused.length > 0 && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
            Used {REPEAT_FLAG_COUNT} times or more:{" "}
            {report.overused.map((item) => `${item.word} (${item.count})`).join(", ")}. A repeated
            filler reads as a verbal tic even when each one is defensible.
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your text, marked up</h2>
          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7">
            {segments.map((segment, index) =>
              segment.filler ? (
                <mark
                  // eslint-disable-next-line react/no-array-index-key
                  key={`seg-${index}`}
                  className="rounded-sm bg-[var(--danger-soft)] px-0.5 font-semibold text-[var(--danger)]"
                  title={segment.filler.advice}
                >
                  {segment.text}
                </mark>
              ) : (
                // eslint-disable-next-line react/no-array-index-key
                <span key={`seg-${index}`}>{segment.text}</span>
              ),
            )}
          </p>
          {report.total === 0 && (
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              Nothing on the list appears here. That is a good sign, though it is not the same as
              tight writing — this checks a fixed list, not your sentences.
            </p>
          )}
        </section>
      )}

      {!hasError && report.total > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What to do about each one</h2>
          <div className="mt-4 space-y-5">
            {report.byCategory
              .filter((category) => category.count > 0)
              .map((category) => (
                <div key={category.id}>
                  <h3 className="text-sm font-semibold text-[var(--primary)]">
                    {category.label} · {category.count}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">{category.summary}</p>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full min-w-[320px] text-left text-sm">
                      <caption className="sr-only">{category.label} instances and fixes</caption>
                      <thead>
                        <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                          <th scope="col" className="py-2 pr-3 font-semibold">Word</th>
                          <th scope="col" className="py-2 pr-3 text-right font-semibold">Uses</th>
                          <th scope="col" className="py-2 font-semibold">Fix</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.items.map((item) => (
                          <tr key={item.word} className="border-b border-[var(--border)] last:border-0">
                            <td className="py-2 pr-3 font-semibold">{item.word}</td>
                            <td className="py-2 pr-3 text-right">{item.count}</td>
                            <td className="py-2">
                              <span className="block">
                                {item.replacement
                                  ? `Use "${item.replacement}".`
                                  : item.deletable
                                    ? "Delete."
                                    : "Judgement call."}
                              </span>
                              <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                                {item.advice}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {!stripped.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Stripped draft</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {NUM.format(stripped.removed)} deleted, {NUM.format(stripped.replaced)} replaced ·{" "}
                {NUM.format(stripped.wordsSaved)} words shorter
              </p>
            </div>
            <button
              type="button"
              onClick={copyClean}
              aria-label="Copy the stripped draft"
              className={GHOST_BTN}
            >
              {copiedClean ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copiedClean ? "Copied!" : "Copy draft"}
            </button>
          </div>
          <div className="mt-3 overflow-x-auto">
            <pre className="whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-4 text-sm leading-7 text-[var(--foreground)]">
              {stripped.text}
            </pre>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Read this before you use it. Deletions take the commas that fenced the filler off, which
            is usually right but not always — and a hedge you meant is not filler.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Density bands ({TIGHT_DENSITY_PER_100} and {LOOSE_DENSITY_PER_100} per 100 words) are this
        tool&apos;s editorial judgement, not a published standard. Dialogue, first-person voice and
        deliberately hesitant narration all need fillers to sound human — a score of zero is not the
        goal. Categories checked: {Object.values(CATEGORIES).map((item) => item.label).join(", ")}.
      </p>
    </main>
  );
}
