"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PenLine, RotateCcw, X } from "lucide-react";

import {
  MAX_WORDS,
  MIN_WORDS,
  POSITIONS,
  assessTopicSentence,
  generateTopicSentences,
  optionsToText,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  subject: "School uniforms",
  claim: "hide income differences without removing them",
  reason: "families still buy the shoes, bags and coats that mark income",
  counter: "uniforms make the school gate look equal",
  position: "middle",
  index: "2",
  draft: "School uniforms reduce visible income differences between students, but they do not change what happens after the final bell.",
};

export default function ToolHome() {
  const [subject, setSubject] = useState(DEFAULTS.subject);
  const [claim, setClaim] = useState(DEFAULTS.claim);
  const [reason, setReason] = useState(DEFAULTS.reason);
  const [counter, setCounter] = useState(DEFAULTS.counter);
  const [position, setPosition] = useState(DEFAULTS.position);
  const [index, setIndex] = useState(DEFAULTS.index);
  const [draft, setDraft] = useState(DEFAULTS.draft);
  const [copied, setCopied] = useState(false);

  const generated = useMemo(
    () => generateTopicSentences({ subject, claim, reason, counter, position, index: Number(index) || 1 }),
    [subject, claim, reason, counter, position, index],
  );

  const assessment = useMemo(() => assessTopicSentence(draft), [draft]);

  const plainText = useMemo(() => optionsToText(generated), [generated]);
  const hasError = Boolean(generated.error);

  const copyResult = async () => {
    if (!plainText) return;
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSubject(DEFAULTS.subject);
    setClaim(DEFAULTS.claim);
    setReason(DEFAULTS.reason);
    setCounter(DEFAULTS.counter);
    setPosition(DEFAULTS.position);
    setIndex(DEFAULTS.index);
    setDraft(DEFAULTS.draft);
    setCopied(false);
  };

  const stats = hasError
    ? [
        ["Subject", DASH],
        ["Controlling idea", DASH],
        ["Paragraph position", DASH],
        ["Patterns available", DASH],
      ]
    : [
        ["Subject", generated.subject],
        ["Controlling idea", generated.claim],
        ["Paragraph position", generated.positionLabel],
        ["Patterns available", String(generated.count)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PenLine className="h-4 w-4" aria-hidden="true" />
          Paragraph openers
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Topic Sentence Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A topic sentence needs two things: a subject and a controlling idea — the arguable claim
          the rest of the paragraph will prove. Supply both and get the standard sentence patterns
          built from them, then paste a sentence of your own for a seven-point check.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tsg-subject">
              Subject — what the paragraph is about
            </label>
            <input
              id="tsg-subject"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="School uniforms"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tsg-claim">
              Controlling idea — what you claim about it
            </label>
            <input
              id="tsg-claim"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={claim}
              onChange={(event) => setClaim(event.target.value)}
              placeholder="hide income differences without removing them"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tsg-reason">
              Supporting reason (optional)
            </label>
            <input
              id="tsg-reason"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="families still buy the shoes, bags and coats that mark income"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tsg-counter">
              Objection to concede (optional)
            </label>
            <input
              id="tsg-counter"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={counter}
              onChange={(event) => setCounter(event.target.value)}
              placeholder="uniforms make the school gate look equal"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tsg-position">
              Where this paragraph sits
            </label>
            <select
              id="tsg-position"
              className={`mt-2 ${INPUT_CLASS}`}
              value={position}
              onChange={(event) => setPosition(event.target.value)}
            >
              {Object.values(POSITIONS).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tsg-index">
              Which body paragraph number
            </label>
            <input
              id="tsg-index"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="6"
              step="1"
              value={index}
              onChange={(event) => setIndex(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {generated.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Topic sentence patterns
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : generated.count}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fill in the subject and controlling idea to build the sentences."
                : "Fill in the optional fields to unlock the concessive and reason-first shapes."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated topic sentences"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy sentences"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {stats.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your options</h2>
          <ul className="mt-4 space-y-3">
            {generated.options.map((option) => (
              <li key={option.id} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
                  {option.label}
                </p>
                <p className="mt-1.5 text-sm leading-6">{option.sentence}</p>
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">{option.when}</p>
                <button
                  type="button"
                  onClick={() => setDraft(option.sentence)}
                  className="mt-3 min-h-11 rounded-md px-2 text-xs font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  Send to the checker below
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Check a topic sentence</h2>
        <label className="mt-3 block text-sm font-semibold text-[var(--foreground)]" htmlFor="tsg-draft">
          Paste your sentence
        </label>
        <textarea
          id="tsg-draft"
          rows={3}
          className={`mt-2 ${TEXTAREA_CLASS}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />

        {assessment.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {assessment.error}
          </p>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <p className="text-4xl font-semibold text-[var(--primary)]">{assessment.score}%</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {assessment.passed} of {assessment.total} checks passed · {assessment.words} words
              </p>
            </div>
            <ul className="mt-4 space-y-2">
              {assessment.checks.map((check) => (
                <li
                  key={check.id}
                  className="flex items-start gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm"
                >
                  <span
                    className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                      check.pass
                        ? "bg-[var(--success)] text-[var(--card)]"
                        : "bg-[var(--danger-soft)] text-[var(--danger)]"
                    }`}
                    aria-hidden="true"
                  >
                    {check.pass ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                  </span>
                  <span>
                    <span className="font-semibold">
                      {check.label}
                      <span className="sr-only">{check.pass ? " — passed" : " — needs work"}</span>
                    </span>
                    {check.advisory && (
                      <span className="ml-1 text-xs text-[var(--muted-foreground)]">(advisory)</span>
                    )}
                    <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                      {check.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The {MIN_WORDS}-to-{MAX_WORDS} word band and the third-person check are conventions of
        academic prose, not universal rules — reflective writing, journalism and lab notebooks all
        break them for good reasons. Follow your own course rubric where it differs.
      </p>
    </main>
  );
}
