"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw } from "lucide-react";

import {
  DEGREE_PRESETS,
  LIMITS,
  METHODOLOGIES,
  buildThesisPrompt,
  planThesis,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  topic: "The effect of remote work on junior employee mentorship outcomes",
  field: "Organisational psychology",
  methodologyId: "mixed",
  scope: "Indian IT-services firms, employees with under three years of experience, 2020 onwards",
  notes: "",
  totalWords: "20000",
  rqCount: "3",
};

const DASH = "—";

export default function ToolHome() {
  const [topic, setTopic] = useState(DEFAULTS.topic);
  const [field, setField] = useState(DEFAULTS.field);
  const [methodologyId, setMethodologyId] = useState(DEFAULTS.methodologyId);
  const [scope, setScope] = useState(DEFAULTS.scope);
  const [notes, setNotes] = useState(DEFAULTS.notes);
  const [totalWords, setTotalWords] = useState(DEFAULTS.totalWords);
  const [rqCount, setRqCount] = useState(DEFAULTS.rqCount);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const plan = planThesis({ totalWords, researchQuestionCount: rqCount });
    if (plan.error) return plan;
    return buildThesisPrompt({ topic, field, methodologyId, scope, notes, plan });
  }, [topic, field, methodologyId, scope, notes, totalWords, rqCount]);

  const hasError = Boolean(result.error);
  const plan = hasError ? null : result.plan;

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setTopic(DEFAULTS.topic);
    setField(DEFAULTS.field);
    setMethodologyId(DEFAULTS.methodologyId);
    setScope(DEFAULTS.scope);
    setNotes(DEFAULTS.notes);
    setTotalWords(DEFAULTS.totalWords);
    setRqCount(DEFAULTS.rqCount);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Research questions", DASH],
        ["Chapters planned", DASH],
        ["Largest chapter", DASH],
        ["Prompt length", DASH],
      ]
    : [
        ["Research questions", String(plan.researchQuestions)],
        ["Chapters planned", String(plan.chapterCount)],
        [
          "Largest chapter",
          `Literature Review — ${NUM.format(plan.chapterPlan[1].words)} words`,
        ],
        [
          "Prompt length",
          `${NUM.format(result.words)} words · ~${NUM.format(result.approxTokens)} tokens`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          AI For Learning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Thesis Outline Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Splits your thesis word count across the six standard chapters, then
          writes a chapter-outline prompt that demands numbered research
          questions, an explicit scope and a per-chapter word budget.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="top-topic">
              Thesis topic or working title
            </label>
            <input
              id="top-topic"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="top-field">
              Field / discipline
            </label>
            <input
              id="top-field"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={field}
              onChange={(event) => setField(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="top-method">
              Methodology
            </label>
            <select
              id="top-method"
              className={`mt-2 ${INPUT_CLASS}`}
              value={methodologyId}
              onChange={(event) => setMethodologyId(event.target.value)}
            >
              {METHODOLOGIES.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="top-preset">
              Degree preset (fills the word count)
            </label>
            <select
              id="top-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value=""
              onChange={(event) => {
                const preset = DEGREE_PRESETS.find(
                  (item) => item.id === event.target.value,
                );
                if (preset) setTotalWords(String(preset.words));
              }}
            >
              <option value="">Choose a preset…</option>
              {DEGREE_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="top-words">
              Total length (words)
            </label>
            <input
              id="top-words"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.totalWords.min}
              max={LIMITS.totalWords.max}
              step="1000"
              value={totalWords}
              onChange={(event) => setTotalWords(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="top-rqs">
              Research questions (1–6)
            </label>
            <input
              id="top-rqs"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.researchQuestions.min}
              max={LIMITS.researchQuestions.max}
              value={rqCount}
              onChange={(event) => setRqCount(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="top-scope">
              Scope — population, place, period (optional)
            </label>
            <textarea
              id="top-scope"
              className={`mt-2 ${AREA_CLASS}`}
              rows={2}
              value={scope}
              onChange={(event) => setScope(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="top-notes">
              Extra instruction for the model (optional)
            </label>
            <input
              id="top-notes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. APA 7th edition, my university requires a separate ethics section"
            />
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
              Planned thesis length
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(plan.total)} words`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : "Chapter shares: 10% intro, 25% literature, 20% methodology, 20% results, 15% discussion, 10% conclusion."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated thesis outline prompt"
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

        {!hasError ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[20rem] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-4 font-semibold">
                    Chapter
                  </th>
                  <th scope="col" className="py-2 pr-4 text-right font-semibold">
                    Share
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Words
                  </th>
                </tr>
              </thead>
              <tbody>
                {plan.chapterPlan.map((chapter) => (
                  <tr key={chapter.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-4">{chapter.label}</td>
                    <td className="py-2 pr-4 text-right text-[var(--muted-foreground)]">
                      {chapter.sharePercent}%
                    </td>
                    <td className="py-2 text-right font-semibold">
                      {NUM.format(chapter.words)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="mt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Generated prompt
          </h2>
          <div className="mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
            <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-[var(--foreground)]">
              {hasError ? DASH : result.text}
            </pre>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Chapter shares and degree-length presets are planning rules of thumb
        drawn from common university dissertation guidance. Your institution's
        handbook and your supervisor always take precedence.
      </p>
    </main>
  );
}
