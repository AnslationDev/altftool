"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MessageCircleQuestion, RotateCcw } from "lucide-react";

import {
  MAX_HINT_LEVELS,
  MIN_HINT_LEVELS,
  QUESTION_CATEGORIES,
  STUDENT_LEVELS,
  buildSocraticPrompt,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-US");
const DASH = "—";

const DEFAULTS = {
  subject: "Algebra",
  topic: "Solving linear equations in one variable",
  studentLevelId: "secondary",
  hintLevels: "4",
  allowReveal: true,
  categoryIds: QUESTION_CATEGORIES.map((category) => category.id),
};

export default function ToolHome() {
  const [subject, setSubject] = useState(DEFAULTS.subject);
  const [topic, setTopic] = useState(DEFAULTS.topic);
  const [studentLevelId, setStudentLevelId] = useState(DEFAULTS.studentLevelId);
  const [hintLevels, setHintLevels] = useState(DEFAULTS.hintLevels);
  const [allowReveal, setAllowReveal] = useState(DEFAULTS.allowReveal);
  const [categoryIds, setCategoryIds] = useState(DEFAULTS.categoryIds);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildSocraticPrompt({
        subject,
        topic,
        studentLevelId,
        hintLevels: hintLevels.trim() === "" ? Number.NaN : Number(hintLevels),
        allowReveal,
        categoryIds,
      }),
    [subject, topic, studentLevelId, hintLevels, allowReveal, categoryIds],
  );

  const hasError = Boolean(result.error);

  const toggleCategory = (id) => {
    setCategoryIds((current) =>
      current.includes(id) ? current.filter((categoryId) => categoryId !== id) : [...current, id],
    );
  };

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
    setSubject(DEFAULTS.subject);
    setTopic(DEFAULTS.topic);
    setStudentLevelId(DEFAULTS.studentLevelId);
    setHintLevels(DEFAULTS.hintLevels);
    setAllowReveal(DEFAULTS.allowReveal);
    setCategoryIds(DEFAULTS.categoryIds);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Student level", DASH],
        ["Question categories", DASH],
        ["Answer reveal", DASH],
      ]
    : [
        ["Student level", result.studentLevel],
        ["Question categories", NUM.format(result.categories.length)],
        ["Answer reveal", allowReveal ? "After the ladder is exhausted" : "Never"],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MessageCircleQuestion className="h-4 w-4" aria-hidden="true" />
          AI for learning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Socratic Tutor Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a tutor prompt that asks one guiding question per turn, escalates help through a
          graded hint ladder, and draws on Richard Paul&apos;s six categories of Socratic
          questioning — instead of just giving the answer away.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="soc-subject">
              Subject
            </label>
            <input
              id="soc-subject"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="soc-topic">
              Topic or problem (optional)
            </label>
            <input
              id="soc-topic"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="soc-level">
              Student level
            </label>
            <select
              id="soc-level"
              className={`mt-2 ${INPUT_CLASS}`}
              value={studentLevelId}
              onChange={(event) => setStudentLevelId(event.target.value)}
            >
              {STUDENT_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="soc-hints">
              Hint ladder rungs ({MIN_HINT_LEVELS}–{MAX_HINT_LEVELS})
            </label>
            <input
              id="soc-hints"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_HINT_LEVELS}
              max={MAX_HINT_LEVELS}
              step="1"
              value={hintLevels}
              onChange={(event) => setHintLevels(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className={LABEL_CLASS}>Socratic question categories (Paul&apos;s taxonomy)</legend>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {QUESTION_CATEGORIES.map((category) => (
              <label
                key={category.id}
                htmlFor={`soc-cat-${category.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
              >
                <input
                  id={`soc-cat-${category.id}`}
                  type="checkbox"
                  className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={categoryIds.includes(category.id)}
                  onChange={() => toggleCategory(category.id)}
                />
                {category.label}
              </label>
            ))}
          </div>
        </fieldset>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm"
          htmlFor="soc-reveal"
        >
          <input
            id="soc-reveal"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={allowReveal}
            onChange={(event) => setAllowReveal(event.target.checked)}
          />
          Allow revealing the full solution once every hint rung has been used
        </label>
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
              Hint ladder rungs
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.hintLevels)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              disabled={hasError}
              aria-label="Copy the generated Socratic tutor prompt"
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
          <h2 className="text-base font-semibold">Generated prompt</h2>
          <pre className="mt-2 max-h-96 overflow-x-auto overflow-y-auto whitespace-pre-wrap rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6">
            {hasError ? "Fix the input above to generate the prompt." : result.prompt}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The prompt is assembled locally in your browser. Paste it as the first message (or system
        prompt) of a new AI chat, then let the student take over the conversation from there.
      </p>
    </main>
  );
}
