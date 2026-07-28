"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FlaskConical, RotateCcw } from "lucide-react";

import {
  ABSTRACT_MAX_WORDS,
  REPORT_STYLES,
  percentDifference,
  percentError,
  planLabReport,
  planToText,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN");
const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DEFAULTS = {
  style: "undergraduate",
  totalWords: "1500",
  experimental: "9.62",
  accepted: "9.81",
};

const WORD_PRESETS = [600, 1000, 1500, 2500];

export default function ToolHome() {
  const [style, setStyle] = useState(DEFAULTS.style);
  const [totalWords, setTotalWords] = useState(DEFAULTS.totalWords);
  const [doneIds, setDoneIds] = useState([]);
  const [experimental, setExperimental] = useState(DEFAULTS.experimental);
  const [accepted, setAccepted] = useState(DEFAULTS.accepted);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planLabReport({
        style,
        totalWords: totalWords === "" ? NaN : Number(totalWords),
        doneIds,
      }),
    [style, totalWords, doneIds],
  );

  const errorCheck = useMemo(
    () =>
      percentError({
        experimental: experimental === "" ? NaN : Number(experimental),
        accepted: accepted === "" ? NaN : Number(accepted),
      }),
    [experimental, accepted],
  );

  const diffCheck = useMemo(
    () =>
      percentDifference(
        experimental === "" ? NaN : Number(experimental),
        accepted === "" ? NaN : Number(accepted),
      ),
    [experimental, accepted],
  );

  const outline = useMemo(() => planToText(plan), [plan]);
  const hasError = Boolean(plan.error);

  const toggleDone = (id) => {
    setDoneIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const copyResult = async () => {
    if (!outline) return;
    try {
      await navigator.clipboard.writeText(outline);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setStyle(DEFAULTS.style);
    setTotalWords(DEFAULTS.totalWords);
    setDoneIds([]);
    setExperimental(DEFAULTS.experimental);
    setAccepted(DEFAULTS.accepted);
    setCopied(false);
  };

  const stats = hasError
    ? [
        ["Report style", DASH],
        ["Sections with a word budget", DASH],
        ["Longest section", DASH],
        ["Words allocated", DASH],
        ["Sections drafted", DASH],
      ]
    : [
        ["Report style", plan.styleLabel],
        ["Sections with a word budget", String(plan.sectionCount)],
        ["Longest section", `${plan.largestSection.label} (${NUM.format(plan.largestSection.words)} words)`],
        ["Words allocated", `${NUM.format(plan.allocated)} of ${NUM.format(plan.totalWords)}`],
        ["Sections drafted", `${plan.doneCount} of ${plan.sectionCount} (${plan.completionPercent}%)`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FlaskConical className="h-4 w-4" aria-hidden="true" />
          IMRaD skeleton
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Lab Report Structure Guide</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a report style and a word target and get the full section skeleton — what belongs in
          each section, which tense to write it in, how many words it should take, and the percent
          error your discussion needs to quote.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lrs-style">
              Report style
            </label>
            <select
              id="lrs-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={style}
              onChange={(event) => {
                setStyle(event.target.value);
                setDoneIds([]);
              }}
            >
              {Object.values(REPORT_STYLES).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lrs-words">
              Word target
            </label>
            <input
              id="lrs-words"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="300"
              max="8000"
              step="50"
              value={totalWords}
              onChange={(event) => setTotalWords(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {WORD_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setTotalWords(String(preset))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset} words
            </button>
          ))}
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Discussion word budget
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError
                ? DASH
                : NUM.format(
                    (plan.sections.find((section) => section.id === "discussion") || { words: 0 }).words,
                  )}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the highlighted input to see the skeleton."
                : "The discussion is the section that carries the marks — give it the most words."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the lab report skeleton"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy skeleton"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
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

        {!hasError && plan.abstractCapped && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
            The abstract was capped at {ABSTRACT_MAX_WORDS} words and the surplus given back to the
            other sections. Abstracts do not scale with report length.
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Section skeleton</h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Tick each section as you draft it. {plan.styleSummary}
          </p>
          <div className="mt-4 space-y-3">
            {plan.sections.map((section) => (
              <article
                key={section.id}
                className={`rounded-lg border p-4 transition ${
                  section.done
                    ? "border-[var(--primary)] bg-[var(--muted)]"
                    : "border-[var(--border)] bg-[var(--background)]"
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <label
                    className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold"
                    htmlFor={`lrs-done-${section.id}`}
                  >
                    <input
                      id={`lrs-done-${section.id}`}
                      type="checkbox"
                      className="h-4 w-4 accent-[var(--primary)]"
                      checked={section.done}
                      onChange={() => toggleDone(section.id)}
                    />
                    {section.label}
                  </label>
                  <p className="text-xs font-semibold text-[var(--primary)]">
                    {NUM.format(section.words)} words · {section.percent}%
                  </p>
                </div>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Tense: {section.tense}
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
                  {section.checklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <h3 className="mt-6 text-sm font-semibold">Also required, with no word budget</h3>
          <ul className="mt-2 space-y-1 text-sm text-[var(--muted-foreground)]">
            {plan.nonProse.map((item) => (
              <li key={item.id}>
                <span className="font-semibold text-[var(--foreground)]">{item.label}: </span>
                {item.note}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Percent error for your discussion</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          percent error = (measured − accepted) ÷ accepted × 100
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lrs-exp">
              Your measured value
            </label>
            <input
              id="lrs-exp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              step="any"
              value={experimental}
              onChange={(event) => setExperimental(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lrs-acc">
              Accepted / literature value
            </label>
            <input
              id="lrs-acc"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              step="any"
              value={accepted}
              onChange={(event) => setAccepted(event.target.value)}
            />
          </div>
        </div>

        {errorCheck.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {errorCheck.error}
          </p>
        ) : (
          <div className="mt-4">
            <p className="text-3xl font-semibold text-[var(--primary)]">
              {PCT.format(errorCheck.magnitude)}%
            </p>
            <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
              {[
                ["Signed percent error", `${PCT.format(errorCheck.signed)}%`],
                ["Absolute error", PCT.format(errorCheck.absoluteError)],
                ["Your result sits", `${errorCheck.direction} the accepted value`],
                [
                  "Percent difference (no accepted value)",
                  diffCheck.error ? DASH : `${PCT.format(diffCheck.value)}%`,
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Word shares follow common science writing-centre guidance and are a starting point, not a
        rule. Where your department, exam board or target journal publishes its own section
        structure, word limits or citation style, follow that brief instead.
      </p>
    </main>
  );
}
