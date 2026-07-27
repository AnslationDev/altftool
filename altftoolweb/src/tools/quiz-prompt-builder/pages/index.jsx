"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ListChecks, RotateCcw } from "lucide-react";

import {
  DIFFICULTY_LEVELS,
  MAX_MCQ_OPTIONS,
  MAX_QUESTIONS,
  MIN_MCQ_OPTIONS,
  MIN_QUESTIONS,
  QUESTION_TYPES,
  buildQuizPrompt,
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
  topic: "Photosynthesis — light and dark reactions",
  audience: "Grade 10 biology class",
  totalQuestions: "10",
  easyPercent: "50",
  mediumPercent: "30",
  hardPercent: "20",
  questionTypes: ["mcq", "true-false"],
  mcqOptions: "4",
  includeAnswerKey: true,
  includeExplanations: false,
};

export default function ToolHome() {
  const [topic, setTopic] = useState(DEFAULTS.topic);
  const [audience, setAudience] = useState(DEFAULTS.audience);
  const [totalQuestions, setTotalQuestions] = useState(DEFAULTS.totalQuestions);
  const [easyPercent, setEasyPercent] = useState(DEFAULTS.easyPercent);
  const [mediumPercent, setMediumPercent] = useState(DEFAULTS.mediumPercent);
  const [hardPercent, setHardPercent] = useState(DEFAULTS.hardPercent);
  const [questionTypes, setQuestionTypes] = useState(DEFAULTS.questionTypes);
  const [mcqOptions, setMcqOptions] = useState(DEFAULTS.mcqOptions);
  const [includeAnswerKey, setIncludeAnswerKey] = useState(DEFAULTS.includeAnswerKey);
  const [includeExplanations, setIncludeExplanations] = useState(DEFAULTS.includeExplanations);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildQuizPrompt({
        topic,
        audience,
        totalQuestions: totalQuestions.trim() === "" ? Number.NaN : Number(totalQuestions),
        easyPercent: easyPercent.trim() === "" ? Number.NaN : Number(easyPercent),
        mediumPercent: mediumPercent.trim() === "" ? Number.NaN : Number(mediumPercent),
        hardPercent: hardPercent.trim() === "" ? Number.NaN : Number(hardPercent),
        questionTypes,
        mcqOptions: mcqOptions.trim() === "" ? Number.NaN : Number(mcqOptions),
        includeAnswerKey,
        includeExplanations,
      }),
    [
      topic,
      audience,
      totalQuestions,
      easyPercent,
      mediumPercent,
      hardPercent,
      questionTypes,
      mcqOptions,
      includeAnswerKey,
      includeExplanations,
    ],
  );

  const hasError = Boolean(result.error);

  const toggleType = (id) => {
    setQuestionTypes((current) =>
      current.includes(id) ? current.filter((typeId) => typeId !== id) : [...current, id],
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
    setTopic(DEFAULTS.topic);
    setAudience(DEFAULTS.audience);
    setTotalQuestions(DEFAULTS.totalQuestions);
    setEasyPercent(DEFAULTS.easyPercent);
    setMediumPercent(DEFAULTS.mediumPercent);
    setHardPercent(DEFAULTS.hardPercent);
    setQuestionTypes(DEFAULTS.questionTypes);
    setMcqOptions(DEFAULTS.mcqOptions);
    setIncludeAnswerKey(DEFAULTS.includeAnswerKey);
    setIncludeExplanations(DEFAULTS.includeExplanations);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Easy questions", DASH],
        ["Medium questions", DASH],
        ["Hard questions", DASH],
        ["Question types allowed", DASH],
      ]
    : [
        ["Easy questions", NUM.format(result.counts.easy)],
        ["Medium questions", NUM.format(result.counts.medium)],
        ["Hard questions", NUM.format(result.counts.hard)],
        ["Question types allowed", NUM.format(result.typeCount)],
        ["Answer key", includeAnswerKey ? "Included" : "Not included"],
      ];

  const percentFields = [
    ["quiz-easy", "Easy %", easyPercent, setEasyPercent],
    ["quiz-medium", "Medium %", mediumPercent, setMediumPercent],
    ["quiz-hard", "Hard %", hardPercent, setHardPercent],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          AI for learning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Quiz Prompt Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set a topic, an exact difficulty mix and the question formats you allow. The tool converts
          your percentages into whole question counts and writes a paste-ready prompt for any AI
          assistant, including a formatted answer key.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="quiz-topic">
              Quiz topic
            </label>
            <input
              id="quiz-topic"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="quiz-audience">
              Audience (optional)
            </label>
            <input
              id="quiz-audience"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="quiz-total">
              Number of questions ({MIN_QUESTIONS}–{MAX_QUESTIONS})
            </label>
            <input
              id="quiz-total"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_QUESTIONS}
              max={MAX_QUESTIONS}
              step="1"
              value={totalQuestions}
              onChange={(event) => setTotalQuestions(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className={LABEL_CLASS}>Difficulty mix (must total 100%)</legend>
          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {percentFields.map(([id, label, value, setValue]) => (
              <div key={id}>
                <label
                  className="block text-xs font-semibold text-[var(--muted-foreground)]"
                  htmlFor={id}
                >
                  {label}
                </label>
                <input
                  id={id}
                  className={`mt-1 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="100"
                  step="5"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                />
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-4">
          <legend className={LABEL_CLASS}>Question types</legend>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {QUESTION_TYPES.map((type) => (
              <label
                key={type.id}
                htmlFor={`quiz-type-${type.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
              >
                <input
                  id={`quiz-type-${type.id}`}
                  type="checkbox"
                  className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={questionTypes.includes(type.id)}
                  onChange={() => toggleType(type.id)}
                />
                {type.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="quiz-mcq-options">
              Options per MCQ ({MIN_MCQ_OPTIONS}–{MAX_MCQ_OPTIONS})
            </label>
            <input
              id="quiz-mcq-options"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_MCQ_OPTIONS}
              max={MAX_MCQ_OPTIONS}
              step="1"
              value={mcqOptions}
              onChange={(event) => setMcqOptions(event.target.value)}
              disabled={!questionTypes.includes("mcq")}
            />
          </div>
          <div className="flex flex-col justify-end gap-2">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
              htmlFor="quiz-answer-key"
            >
              <input
                id="quiz-answer-key"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                checked={includeAnswerKey}
                onChange={(event) => setIncludeAnswerKey(event.target.checked)}
              />
              Include a separate answer key
            </label>
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
              htmlFor="quiz-explanations"
            >
              <input
                id="quiz-explanations"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                checked={includeExplanations}
                onChange={(event) => setIncludeExplanations(event.target.checked)}
              />
              Add a one-line explanation per answer
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
              Questions in the prompt
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.totalQuestions)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              disabled={hasError}
              aria-label="Copy the generated quiz prompt"
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
        The prompt is generated locally in your browser — nothing is sent to a server. Paste it into
        the AI assistant of your choice and always review generated questions before using them in a
        real assessment.
      </p>
    </main>
  );
}
