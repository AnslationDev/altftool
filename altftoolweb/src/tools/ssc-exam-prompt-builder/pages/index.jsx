"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw } from "lucide-react";

import {
  DIFFICULTY_LEVELS,
  LANGUAGES,
  PROMPT_MODES,
  SECTION_TOPICS,
  SSC_EXAMS,
  attemptsForTarget,
  buildSscPrompt,
  scoreSscAttempt,
  topicBankFor,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DIFFICULTY_LABELS = {
  easy: "Easy",
  moderate: "Moderate",
  hard: "Hard",
  mixed: "Mixed",
};

const DEFAULTS = {
  examKey: "cgl-tier1",
  section: "Quantitative Aptitude",
  topic: "Time and work",
  mode: "shortcut-tricks",
  difficulty: "moderate",
  itemCount: "8",
  language: "english",
  notes: "",
  targetMarks: "140",
  accuracyPct: "80",
  attemptCorrect: "",
  attemptWrong: "",
};

const DASH = "—";

const firstSection = (examKey) => Object.keys(SSC_EXAMS[examKey].sections)[0];
const firstTopic = (section) => SECTION_TOPICS[topicBankFor(section)][0];

export default function ToolHome() {
  const [examKey, setExamKey] = useState(DEFAULTS.examKey);
  const [section, setSection] = useState(DEFAULTS.section);
  const [topic, setTopic] = useState(DEFAULTS.topic);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [difficulty, setDifficulty] = useState(DEFAULTS.difficulty);
  const [itemCount, setItemCount] = useState(DEFAULTS.itemCount);
  const [language, setLanguage] = useState(DEFAULTS.language);
  const [notes, setNotes] = useState(DEFAULTS.notes);
  const [targetMarks, setTargetMarks] = useState(DEFAULTS.targetMarks);
  const [accuracyPct, setAccuracyPct] = useState(DEFAULTS.accuracyPct);
  const [attemptCorrect, setAttemptCorrect] = useState(DEFAULTS.attemptCorrect);
  const [attemptWrong, setAttemptWrong] = useState(DEFAULTS.attemptWrong);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildSscPrompt({
        examKey,
        section,
        topic,
        mode,
        difficulty,
        itemCount,
        language,
        notes,
      }),
    [examKey, section, topic, mode, difficulty, itemCount, language, notes],
  );

  const plan = useMemo(
    () => attemptsForTarget({ examKey, targetMarks, accuracyPct }),
    [examKey, targetMarks, accuracyPct],
  );

  const attemptScoreInput = useMemo(
    () => ({
      examKey,
      correct: attemptCorrect === "" ? Number.NaN : Number(attemptCorrect),
      wrong: attemptWrong === "" ? Number.NaN : Number(attemptWrong),
    }),
    [examKey, attemptCorrect, attemptWrong],
  );
  const attemptScoreEntered = attemptCorrect !== "" || attemptWrong !== "";
  const attemptScore = useMemo(
    () => (attemptScoreEntered ? scoreSscAttempt(attemptScoreInput) : null),
    [attemptScoreEntered, attemptScoreInput],
  );

  const ok = !result.error;
  // Paper pacing/marking metrics depend only on the exam, so buildSscPrompt returns them even
  // when a separate field (like item count) is out of range — read them directly rather than
  // gating on the overall `ok` flag.
  const metrics = result.metrics || null;
  const topics = SECTION_TOPICS[topicBankFor(section)];

  const onExamChange = (next) => {
    const nextSection = firstSection(next);
    setExamKey(next);
    setSection(nextSection);
    setTopic(firstTopic(nextSection));
  };

  const onSectionChange = (next) => {
    setSection(next);
    setTopic(firstTopic(next));
  };

  const copyPrompt = async () => {
    if (!ok) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Reset all fields? This clears your weak-spots notes and every other field back to the defaults — anything you entered will be lost.",
      )
    ) {
      return;
    }
    setExamKey(DEFAULTS.examKey);
    setSection(DEFAULTS.section);
    setTopic(DEFAULTS.topic);
    setMode(DEFAULTS.mode);
    setDifficulty(DEFAULTS.difficulty);
    setItemCount(DEFAULTS.itemCount);
    setLanguage(DEFAULTS.language);
    setNotes(DEFAULTS.notes);
    setTargetMarks(DEFAULTS.targetMarks);
    setAccuracyPct(DEFAULTS.accuracyPct);
    setAttemptCorrect(DEFAULTS.attemptCorrect);
    setAttemptWrong(DEFAULTS.attemptWrong);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          SSC
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">SSC Exam Prompt Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build practice, shortcut and error-log prompts for CGL, CHSL, MTS, CPO, GD and JE — each
          one carrying that paper&rsquo;s real marking, per-question pace and skip-or-guess line.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ssc-exam">
              Paper
            </label>
            <select
              id="ssc-exam"
              className={`mt-2 ${INPUT_CLASS}`}
              value={examKey}
              onChange={(event) => onExamChange(event.target.value)}
            >
              {Object.entries(SSC_EXAMS).map(([key, spec]) => (
                <option key={key} value={key}>
                  {spec.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssc-section">
              Section
            </label>
            <select
              id="ssc-section"
              className={`mt-2 ${INPUT_CLASS}`}
              value={section}
              onChange={(event) => onSectionChange(event.target.value)}
            >
              {Object.entries(SSC_EXAMS[examKey].sections).map(([name, count]) => (
                <option key={name} value={name}>
                  {name} ({count} Q)
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ssc-topic">
              Topic
            </label>
            <select
              id="ssc-topic"
              className={`mt-2 ${INPUT_CLASS}`}
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
            >
              {topics.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssc-mode">
              Prompt mode
            </label>
            <select
              id="ssc-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              {Object.entries(PROMPT_MODES).map(([key, spec]) => (
                <option key={key} value={key}>
                  {spec.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssc-difficulty">
              Difficulty
            </label>
            <select
              id="ssc-difficulty"
              className={`mt-2 ${INPUT_CLASS}`}
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
            >
              {Object.keys(DIFFICULTY_LEVELS).map((key) => (
                <option key={key} value={key}>
                  {DIFFICULTY_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssc-count">
              Number of items
            </label>
            <input
              id="ssc-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="50"
              step="1"
              value={itemCount}
              onChange={(event) => setItemCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssc-language">
              Language
            </label>
            <select
              id="ssc-language"
              className={`mt-2 ${INPUT_CLASS}`}
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              {Object.entries(LANGUAGES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ssc-notes">
              Your weak spots or mistake list (optional)
            </label>
            <textarea
              id="ssc-notes"
              className="mt-2 min-h-24 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              placeholder="e.g. I lose time on pipes and cisterns and misread negative work questions"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Seconds per question in this paper
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {metrics ? `${NUM.format(metrics.secondsPerQuestion)} s` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {metrics
                ? `${metrics.questions} questions · ${metrics.maxMarks} marks · ${metrics.minutes} minutes`
                : "Fix the inputs above to size the paper."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              aria-label="Copy the generated SSC study prompt"
              className={PRIMARY_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-md bg-[var(--muted)] px-3 py-2">
            <dt className="text-xs text-[var(--muted-foreground)]">Marks per correct</dt>
            <dd className="text-base font-semibold">{metrics ? metrics.marksPerCorrect : DASH}</dd>
          </div>
          <div className="rounded-md bg-[var(--muted)] px-3 py-2">
            <dt className="text-xs text-[var(--muted-foreground)]">Deducted per wrong</dt>
            <dd className="text-base font-semibold">
              {metrics ? (metrics.penalty > 0 ? metrics.penalty : "None") : DASH}
            </dd>
          </div>
          <div className="rounded-md bg-[var(--muted)] px-3 py-2">
            <dt className="text-xs text-[var(--muted-foreground)]">Guessing breaks even at</dt>
            <dd className="text-base font-semibold">
              {metrics
                ? metrics.penalty > 0
                  ? `${NUM.format(metrics.breakEvenAccuracyPct)}%`
                  : "Always attempt"
                : DASH}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-lg font-semibold">Attempt plan for a target score</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          How many questions you must attempt at a given accuracy to reach the score you want.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ssc-target">
              Target marks
            </label>
            <input
              id="ssc-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={targetMarks}
              onChange={(event) => setTargetMarks(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssc-accuracy">
              Expected accuracy (%)
            </label>
            <input
              id="ssc-accuracy"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="1"
              value={accuracyPct}
              onChange={(event) => setAccuracyPct(event.target.value)}
            />
          </div>
        </div>

        {plan.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {plan.error}
          </p>
        ) : null}

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md bg-[var(--muted)] px-3 py-2">
            <dt className="text-xs text-[var(--muted-foreground)]">Questions to attempt</dt>
            <dd className="text-base font-semibold text-[var(--primary)]">
              {plan.error ? DASH : plan.attempts}
            </dd>
          </div>
          <div className="rounded-md bg-[var(--muted)] px-3 py-2">
            <dt className="text-xs text-[var(--muted-foreground)]">Projected net score</dt>
            <dd className="text-base font-semibold">{plan.error ? DASH : plan.projectedNet}</dd>
          </div>
          <div className="rounded-md bg-[var(--muted)] px-3 py-2">
            <dt className="text-xs text-[var(--muted-foreground)]">Split at that accuracy</dt>
            <dd className="text-base font-semibold">
              {plan.error ? DASH : `${plan.correct} right / ${plan.wrong} wrong`}
            </dd>
          </div>
          <div className="rounded-md bg-[var(--muted)] px-3 py-2">
            <dt className="text-xs text-[var(--muted-foreground)]">Time per attempted question</dt>
            <dd className="text-base font-semibold">
              {plan.error ? DASH : `${NUM.format(plan.secondsAvailablePerAttempt)} s`}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-lg font-semibold">Score a completed attempt</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Already sat a real or mock paper? Enter how many you got right and wrong to see the net
          score under {SSC_EXAMS[examKey].label}&rsquo;s own marking scheme. Optional — leave both
          blank to skip.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ssc-attempt-correct">
              Correct answers
            </label>
            <input
              id="ssc-attempt-correct"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={attemptCorrect}
              placeholder="e.g. 62"
              onChange={(event) => setAttemptCorrect(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssc-attempt-wrong">
              Wrong answers
            </label>
            <input
              id="ssc-attempt-wrong"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={attemptWrong}
              placeholder="e.g. 18"
              onChange={(event) => setAttemptWrong(event.target.value)}
            />
          </div>
        </div>

        {attemptScore?.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger-text)]"
          >
            {attemptScore.error}
          </p>
        ) : null}

        <dl className="mt-4 grid gap-3 sm:grid-cols-2" role="status" aria-live="polite">
          <div className="rounded-md bg-[var(--muted)] px-3 py-2">
            <dt className="text-xs text-[var(--muted-foreground)]">Net score</dt>
            <dd className="text-base font-semibold text-[var(--primary)]">
              {attemptScore && !attemptScore.error
                ? `${attemptScore.net} / ${attemptScore.maxMarks}`
                : DASH}
            </dd>
          </div>
          <div className="rounded-md bg-[var(--muted)] px-3 py-2">
            <dt className="text-xs text-[var(--muted-foreground)]">Percent of max marks</dt>
            <dd className="text-base font-semibold">
              {attemptScore && !attemptScore.error ? `${NUM.format(attemptScore.percentOfMax)}%` : DASH}
            </dd>
          </div>
          <div className="rounded-md bg-[var(--muted)] px-3 py-2">
            <dt className="text-xs text-[var(--muted-foreground)]">Accuracy on attempted</dt>
            <dd className="text-base font-semibold">
              {attemptScore && !attemptScore.error ? `${NUM.format(attemptScore.accuracyPct)}%` : DASH}
            </dd>
          </div>
          <div className="rounded-md bg-[var(--muted)] px-3 py-2">
            <dt className="text-xs text-[var(--muted-foreground)]">Left unattempted</dt>
            <dd className="text-base font-semibold">
              {attemptScore && !attemptScore.error ? attemptScore.unattempted : DASH}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-lg font-semibold">Generated prompt</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {ok ? `${result.title} · ${result.wordCount} words` : DASH}
        </p>
        <pre className="mt-3 max-h-96 overflow-auto rounded-md bg-[var(--muted)] p-3 text-sm leading-6 whitespace-pre-wrap text-[var(--foreground)]">
          {ok ? result.prompt : DASH}
        </pre>
      </section>
    </main>
  );
}
