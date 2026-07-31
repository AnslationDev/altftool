"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Stethoscope } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

import {
  DIFFICULTY_LEVELS,
  LANGUAGES,
  NEET_SUBJECTS,
  STUDY_MODES,
  buildNeetPrompt,
  scoreNeetDrill,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  subject: "Biology",
  chapter: "Human Physiology",
  mode: "mcq-drill",
  difficulty: "mixed",
  questionCount: "20",
  timeMinutes: "22",
  weakAreas: "",
  language: "english",
  correct: "14",
  wrong: "4",
};

const DASH = "—";

export default function ToolHome() {
  const [subject, setSubject] = useState(DEFAULTS.subject);
  const [chapter, setChapter] = useState(DEFAULTS.chapter);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [difficulty, setDifficulty] = useState(DEFAULTS.difficulty);
  const [questionCount, setQuestionCount] = useState(DEFAULTS.questionCount);
  const [timeMinutes, setTimeMinutes] = useState(DEFAULTS.timeMinutes);
  const [weakAreas, setWeakAreas] = useState(DEFAULTS.weakAreas);
  const [language, setLanguage] = useState(DEFAULTS.language);
  const [correct, setCorrect] = useState(DEFAULTS.correct);
  const [wrong, setWrong] = useState(DEFAULTS.wrong);
  const { copy, isCopied, announcement, reset: resetCopyState } = useCopyToClipboard();

  const result = useMemo(
    () =>
      buildNeetPrompt({
        subject,
        chapter,
        mode,
        difficulty,
        questionCount,
        timeMinutes,
        weakAreas,
        language,
      }),
    [subject, chapter, mode, difficulty, questionCount, timeMinutes, weakAreas, language],
  );

  const score = useMemo(
    () => scoreNeetDrill({ questionCount, correct, wrong }),
    [questionCount, correct, wrong],
  );

  const metrics = result.error ? null : result.metrics;

  const onSubjectChange = (next) => {
    setSubject(next);
    setChapter(NEET_SUBJECTS[next][0]);
  };

  const copyPrompt = () => {
    if (result.error) return;
    copy("prompt", result.prompt, { label: "NEET study prompt" });
  };

  const reset = () => {
    setSubject(DEFAULTS.subject);
    setChapter(DEFAULTS.chapter);
    setMode(DEFAULTS.mode);
    setDifficulty(DEFAULTS.difficulty);
    setQuestionCount(DEFAULTS.questionCount);
    setTimeMinutes(DEFAULTS.timeMinutes);
    setWeakAreas(DEFAULTS.weakAreas);
    setLanguage(DEFAULTS.language);
    setCorrect(DEFAULTS.correct);
    setWrong(DEFAULTS.wrong);
    resetCopyState();
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Stethoscope className="h-4 w-4" aria-hidden="true" />
          NEET (UG)
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          NEET Study Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a syllabus unit and a study mode, and get a ready prompt that keeps any AI inside the
          NTA syllabus, on NCERT sources and on NEET&rsquo;s +4/&minus;1 marking.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="neet-subject">
              Subject
            </label>
            <select
              id="neet-subject"
              className={`mt-2 ${INPUT_CLASS}`}
              value={subject}
              onChange={(event) => onSubjectChange(event.target.value)}
            >
              {Object.keys(NEET_SUBJECTS).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="neet-chapter">
              Chapter / unit
            </label>
            <select
              id="neet-chapter"
              className={`mt-2 ${INPUT_CLASS}`}
              value={chapter}
              onChange={(event) => setChapter(event.target.value)}
            >
              {NEET_SUBJECTS[subject].map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="neet-mode">
              Study mode
            </label>
            <select
              id="neet-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              {Object.entries(STUDY_MODES).map(([key, spec]) => (
                <option key={key} value={key}>
                  {spec.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="neet-difficulty">
              Difficulty
            </label>
            <select
              id="neet-difficulty"
              className={`mt-2 ${INPUT_CLASS}`}
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
            >
              {Object.keys(DIFFICULTY_LEVELS).map((key) => (
                <option key={key} value={key}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="neet-count">
              Number of items
            </label>
            <input
              id="neet-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="180"
              step="1"
              value={questionCount}
              onChange={(event) => setQuestionCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="neet-time">
              Time limit (minutes)
            </label>
            <input
              id="neet-time"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="600"
              step="1"
              value={timeMinutes}
              onChange={(event) => setTimeMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="neet-language">
              Output language
            </label>
            <select
              id="neet-language"
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
            <label className={LABEL_CLASS} htmlFor="neet-weak">
              Weak areas to target (optional)
            </label>
            <textarea
              id="neet-weak"
              className="mt-2 min-h-24 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              placeholder="e.g. countercurrent mechanism in the nephron, hormonal control of the cardiac cycle"
              value={weakAreas}
              onChange={(event) => setWeakAreas(event.target.value)}
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
              Drill is worth
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {metrics ? `${metrics.maxMarks} marks` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {metrics
                ? `${metrics.questions} items in ${NUM.format(metrics.minutes)} minutes`
                : "Fix the inputs above to size the drill."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              aria-label={isCopied("prompt") ? "Copied NEET study prompt to clipboard" : "Copy the generated NEET study prompt"}
              className={PRIMARY_BTN}
              disabled={Boolean(result.error)}
            >
              {isCopied("prompt") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("prompt") ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md bg-[var(--muted)] px-3 py-2">
            <dt className="text-xs text-[var(--muted-foreground)]">Your pace per item</dt>
            <dd className="text-base font-semibold">
              {metrics ? `${NUM.format(metrics.secondsPerQuestion)} s` : DASH}
            </dd>
          </div>
          <div className="rounded-md bg-[var(--muted)] px-3 py-2">
            <dt className="text-xs text-[var(--muted-foreground)]">Real NEET pace (200 min / 180 Q)</dt>
            <dd className="text-base font-semibold">
              {metrics ? `${NUM.format(metrics.neetPaceSeconds)} s` : DASH}
            </dd>
          </div>
          <div className="rounded-md bg-[var(--muted)] px-3 py-2">
            <dt className="text-xs text-[var(--muted-foreground)]">Guessing breaks even at</dt>
            <dd className="text-base font-semibold">
              {metrics ? `${NUM.format(metrics.breakEvenAccuracyPct)}% accuracy` : DASH}
            </dd>
          </div>
          <div className="rounded-md bg-[var(--muted)] px-3 py-2">
            <dt className="text-xs text-[var(--muted-foreground)]">Pace vs the real paper</dt>
            <dd className="text-base font-semibold">
              {metrics
                ? `${NUM.format(metrics.paceRatio)}x ${
                    metrics.paceComparison === "tighter"
                      ? "(tighter)"
                      : metrics.paceComparison === "easier"
                        ? "(easier)"
                        : "(same as real NEET pace)"
                  }`
                : DASH}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-lg font-semibold">Generated prompt</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {result.error ? DASH : `${result.title} · ${result.wordCount} words`}
        </p>
        <pre className="mt-3 max-h-96 overflow-auto rounded-md bg-[var(--muted)] p-3 text-sm leading-6 whitespace-pre-wrap text-[var(--foreground)]">
          {result.error ? DASH : result.prompt}
        </pre>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-lg font-semibold">Score the drill afterwards</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          NEET marking: +4 correct, &minus;1 wrong, 0 unattempted.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="neet-correct">
              Correct answers
            </label>
            <input
              id="neet-correct"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={correct}
              onChange={(event) => setCorrect(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="neet-wrong">
              Wrong answers
            </label>
            <input
              id="neet-wrong"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={wrong}
              onChange={(event) => setWrong(event.target.value)}
            />
          </div>
        </div>

        {score.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {score.error}
          </p>
        ) : null}

        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-md bg-[var(--muted)] px-3 py-2">
            <dt className="text-xs text-[var(--muted-foreground)]">Net score</dt>
            <dd className="text-base font-semibold text-[var(--primary)]">
              {score.error ? DASH : `${score.net} / ${score.maxMarks}`}
            </dd>
          </div>
          <div className="rounded-md bg-[var(--muted)] px-3 py-2">
            <dt className="text-xs text-[var(--muted-foreground)]">Accuracy on attempts</dt>
            <dd className="text-base font-semibold">
              {score.error ? DASH : `${NUM.format(score.accuracyPct)}%`}
            </dd>
          </div>
          <div className="rounded-md bg-[var(--muted)] px-3 py-2">
            <dt className="text-xs text-[var(--muted-foreground)]">Left unattempted</dt>
            <dd className="text-base font-semibold">{score.error ? DASH : score.unattempted}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
