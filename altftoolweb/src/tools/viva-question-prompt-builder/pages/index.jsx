"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MessageCircleQuestion, RotateCcw } from "lucide-react";

import {
  DEGREE_LEVELS,
  LIMITS,
  QUESTION_AREAS,
  buildVivaPrompt,
  distributeQuestions,
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

const DEFAULT_ABSTRACT =
  "This thesis examines how hybrid work arrangements affect the quality of mentorship received by junior software engineers in Indian IT-services firms. Using a convergent mixed-methods design, survey data from 214 engineers with under three years of experience were combined with 18 semi-structured interviews across four firms. Quantitative results show mentees co-located with their mentor at least two days a week reported significantly higher mentoring quality scores, while interview data suggest informal help-seeking, not scheduled meetings, drives the gap. The thesis contributes a two-factor model of mentorship access and proposes design principles for remote onboarding programmes.";

const DEFAULTS = {
  title: "Hybrid work and the mentorship of junior software engineers",
  abstract: DEFAULT_ABSTRACT,
  methods:
    "Convergent mixed methods: survey (n=214, validated mentoring quality scale) analysed with multiple regression; 18 semi-structured interviews analysed with reflexive thematic analysis.",
  degreeId: "phd",
  questionCount: "14",
  selected: QUESTION_AREAS.map((area) => area.id),
  includeFollowUps: true,
  includeModelAnswers: false,
};

const DASH = "—";

export default function ToolHome() {
  const [title, setTitle] = useState(DEFAULTS.title);
  const [abstract, setAbstract] = useState(DEFAULTS.abstract);
  const [methods, setMethods] = useState(DEFAULTS.methods);
  const [degreeId, setDegreeId] = useState(DEFAULTS.degreeId);
  const [questionCount, setQuestionCount] = useState(DEFAULTS.questionCount);
  const [selected, setSelected] = useState(DEFAULTS.selected);
  const [includeFollowUps, setIncludeFollowUps] = useState(DEFAULTS.includeFollowUps);
  const [includeModelAnswers, setIncludeModelAnswers] = useState(
    DEFAULTS.includeModelAnswers,
  );
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const plan = distributeQuestions({ questionCount, selectedAreaIds: selected });
    if (plan.error) return plan;
    return buildVivaPrompt({
      title,
      abstract,
      methods,
      degreeId,
      includeFollowUps,
      includeModelAnswers,
      plan,
    });
  }, [
    title,
    abstract,
    methods,
    degreeId,
    questionCount,
    selected,
    includeFollowUps,
    includeModelAnswers,
  ]);

  const hasError = Boolean(result.error);
  const plan = hasError ? null : result.plan;

  const toggleArea = (id) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

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
    setTitle(DEFAULTS.title);
    setAbstract(DEFAULTS.abstract);
    setMethods(DEFAULTS.methods);
    setDegreeId(DEFAULTS.degreeId);
    setQuestionCount(DEFAULTS.questionCount);
    setSelected(DEFAULTS.selected);
    setIncludeFollowUps(DEFAULTS.includeFollowUps);
    setIncludeModelAnswers(DEFAULTS.includeModelAnswers);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Areas covered", DASH],
        ["Abstract length", DASH],
        ["Prompt length", DASH],
      ]
    : [
        ["Areas covered", String(plan.areaPlan.length)],
        ["Abstract length", `${NUM.format(abstract.trim().length)} characters`],
        [
          "Prompt length",
          `${NUM.format(result.words)} words · ~${NUM.format(result.approxTokens)} tokens`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MessageCircleQuestion className="h-4 w-4" aria-hidden="true" />
          AI For Learning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Viva Question Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste your abstract and methods, pick the defence areas, and get a
          mock-examiner prompt whose every question quotes and probes your
          actual work — including the gaps an examiner would notice.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="vqp-title">
              Thesis title
            </label>
            <input
              id="vqp-title"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="vqp-abstract">
              Abstract (100–6,000 characters)
            </label>
            <textarea
              id="vqp-abstract"
              className={`mt-2 ${AREA_CLASS}`}
              rows={6}
              value={abstract}
              onChange={(event) => setAbstract(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="vqp-methods">
              Methods summary (optional)
            </label>
            <textarea
              id="vqp-methods"
              className={`mt-2 ${AREA_CLASS}`}
              rows={3}
              value={methods}
              onChange={(event) => setMethods(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vqp-degree">
              Examination level
            </label>
            <select
              id="vqp-degree"
              className={`mt-2 ${INPUT_CLASS}`}
              value={degreeId}
              onChange={(event) => setDegreeId(event.target.value)}
            >
              {DEGREE_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vqp-count">
              Total questions ({LIMITS.questions.min}–{LIMITS.questions.max})
            </label>
            <input
              id="vqp-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.questions.min}
              max={LIMITS.questions.max}
              value={questionCount}
              onChange={(event) => setQuestionCount(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Question areas
          </legend>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {QUESTION_AREAS.map((area) => (
              <label
                key={area.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-1 text-sm text-[var(--foreground)]"
                htmlFor={`vqp-area-${area.id}`}
              >
                <input
                  id={`vqp-area-${area.id}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={selected.includes(area.id)}
                  onChange={() => toggleArea(area.id)}
                />
                {area.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-2 grid gap-1 sm:grid-cols-2">
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-1 text-sm text-[var(--foreground)]"
            htmlFor="vqp-followups"
          >
            <input
              id="vqp-followups"
              type="checkbox"
              className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={includeFollowUps}
              onChange={(event) => setIncludeFollowUps(event.target.checked)}
            />
            Add a follow-up under each question
          </label>
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-1 text-sm text-[var(--foreground)]"
            htmlFor="vqp-answers"
          >
            <input
              id="vqp-answers"
              type="checkbox"
              className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={includeModelAnswers}
              onChange={(event) => setIncludeModelAnswers(event.target.checked)}
            />
            Sketch what a strong answer covers
          </label>
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
              Mock viva size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(plan.total)} questions`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : plan.areaPlan
                    .map((area) => `${area.label.split(" &")[0]} ${area.count}`)
                    .join(" · ")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated viva question prompt"
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
        The question areas follow the recurring clusters identified in
        doctoral-viva research (Trafford &amp; Leshem) and university defence
        guides. A generated mock viva supplements, never replaces, practice
        with your supervisor.
      </p>
    </main>
  );
}
