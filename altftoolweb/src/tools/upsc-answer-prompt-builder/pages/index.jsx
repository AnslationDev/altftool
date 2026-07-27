"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw } from "lucide-react";

import { ANSWER_FORMATS, DIRECTIVES, PAPERS, buildUpscPrompt } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  question:
    "Discuss the role of the Finance Commission in maintaining fiscal federalism in India.",
  paperId: "gs2",
  formatId: "gs-15",
  directiveId: "discuss",
  includeCurrentAffairs: true,
  askEvaluation: true,
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const result = useMemo(
    () =>
      buildUpscPrompt({
        question: form.question,
        paperId: form.paperId,
        formatId: form.formatId,
        directiveId: form.directiveId,
        includeCurrentAffairs: form.includeCurrentAffairs,
        askEvaluation: form.askEvaluation,
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
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
    setForm(DEFAULTS);
    setCopied(false);
  };

  const budgetRows = hasError
    ? [
        ["Word limit", DASH],
        ["Exam-time budget", DASH],
        ["Writing speed needed", DASH],
        ["Intro / body / conclusion", DASH],
      ]
    : [
        ["Word limit", `${NUM.format(result.budget.wordLimit)} words (${result.format.marks} marks)`],
        ["Exam-time budget", `${NUM.format(result.budget.timeMin)} min (0.72 min per mark)`],
        ["Writing speed needed", `${NUM.format(result.budget.wpm)} words/min sustained`],
        [
          "Intro / body / conclusion",
          `${NUM.format(result.budget.introWords)} / ${NUM.format(result.budget.bodyWords)} / ${NUM.format(result.budget.conclusionWords)} words`,
        ],
        ["Directive", `${result.directive.label} — ${result.directive.meaning}`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          Exam prompts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          UPSC Answer Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn any Mains question into a structured AI practice prompt built on the exam&apos;s real
          numbers — 150/250-word limits, the 0.72 minutes each mark earns in a 250-mark paper, and
          the intro-body-conclusion split — with an examiner-style evaluation at the end.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="up-question">
              Mains question
            </label>
            <textarea
              id="up-question"
              className="mt-2 min-h-24 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              rows={3}
              maxLength={620}
              value={form.question}
              onChange={set("question")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="up-paper">
              Paper
            </label>
            <select id="up-paper" className={`mt-2 ${INPUT_CLASS}`} value={form.paperId} onChange={set("paperId")}>
              {PAPERS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="up-format">
              Question format
            </label>
            <select id="up-format" className={`mt-2 ${INPUT_CLASS}`} value={form.formatId} onChange={set("formatId")}>
              {ANSWER_FORMATS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="up-directive">
              Directive word
            </label>
            <select
              id="up-directive"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.directiveId}
              onChange={set("directiveId")}
            >
              {DIRECTIVES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col justify-end gap-2">
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="up-current">
              <input
                id="up-current"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                checked={form.includeCurrentAffairs}
                onChange={set("includeCurrentAffairs")}
              />
              Ask for current-affairs enrichment
            </label>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="up-eval">
              <input
                id="up-eval"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                checked={form.askEvaluation}
                onChange={set("askEvaluation")}
              />
              Ask for examiner-style evaluation
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
              Exam-time budget
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.budget.timeMin)} min`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the prompt."
                : `What ${result.format.marks} marks earn in a 250-mark, 180-minute paper.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the UPSC practice prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {budgetRows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Generated prompt
        </p>
        <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-[var(--muted)] p-3 font-mono text-xs leading-5">
          {hasError ? DASH : result.prompt}
        </pre>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Exam parameters reflect the UPSC CSE Mains pattern in force since 2013: 250-mark GS papers
        in 3 hours, 150-word 10-markers, 250-word 15-markers and 1,000-1,200-word essays. AI model
        answers are practice scaffolding — verify every article, case and report it cites, because
        models invent them.
      </p>
    </main>
  );
}
