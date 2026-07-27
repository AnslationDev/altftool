"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardList, Copy, RotateCcw } from "lucide-react";

import {
  CBSE_MIN_WORKING_DAYS,
  CBSE_STAGES,
  DIFFERENTIATION,
  FRAMEWORKS,
  PLAN_FORMATS,
  buildLessonPlanPrompt,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DIFFERENTIATION_LABELS = {
  none: "No differentiation block",
  mixed: "Three-way (support, core, extension)",
  slow: "Scaffold for students below grade level",
  gifted: "Extension for high attainers",
};

const FORMAT_LABELS = {
  table: "Period-by-period table",
  narrative: "Narrative / inspection file",
  bullets: "Tight bullet points",
};

const DEFAULTS = {
  stage: "9-10",
  classLevel: "10",
  subject: "Science",
  topic: "Chemical Reactions and Equations",
  periodMinutes: "45",
  periodCount: "2",
  framework: "5e",
  planFormat: "table",
  differentiation: "mixed",
  includeRubric: true,
  includeHomework: true,
};

const DASH = "—";

export default function ToolHome() {
  const [stage, setStage] = useState(DEFAULTS.stage);
  const [classLevel, setClassLevel] = useState(DEFAULTS.classLevel);
  const [subject, setSubject] = useState(DEFAULTS.subject);
  const [topic, setTopic] = useState(DEFAULTS.topic);
  const [periodMinutes, setPeriodMinutes] = useState(DEFAULTS.periodMinutes);
  const [periodCount, setPeriodCount] = useState(DEFAULTS.periodCount);
  const [framework, setFramework] = useState(DEFAULTS.framework);
  const [planFormat, setPlanFormat] = useState(DEFAULTS.planFormat);
  const [differentiation, setDifferentiation] = useState(DEFAULTS.differentiation);
  const [includeRubric, setIncludeRubric] = useState(DEFAULTS.includeRubric);
  const [includeHomework, setIncludeHomework] = useState(DEFAULTS.includeHomework);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildLessonPlanPrompt({
        stage,
        classLevel,
        subject,
        topic,
        periodMinutes,
        periodCount,
        framework,
        planFormat,
        differentiation,
        includeRubric,
        includeHomework,
      }),
    [
      stage,
      classLevel,
      subject,
      topic,
      periodMinutes,
      periodCount,
      framework,
      planFormat,
      differentiation,
      includeRubric,
      includeHomework,
    ],
  );

  const ok = !result.error;

  const onStageChange = (next) => {
    setStage(next);
    setClassLevel(CBSE_STAGES[next].classes[0]);
    setSubject(CBSE_STAGES[next].subjects[0]);
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
    setStage(DEFAULTS.stage);
    setClassLevel(DEFAULTS.classLevel);
    setSubject(DEFAULTS.subject);
    setTopic(DEFAULTS.topic);
    setPeriodMinutes(DEFAULTS.periodMinutes);
    setPeriodCount(DEFAULTS.periodCount);
    setFramework(DEFAULTS.framework);
    setPlanFormat(DEFAULTS.planFormat);
    setDifferentiation(DEFAULTS.differentiation);
    setIncludeRubric(DEFAULTS.includeRubric);
    setIncludeHomework(DEFAULTS.includeHomework);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          CBSE
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          CBSE Lesson Plan Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Choose the class, subject and period length. You get a prompt with the 5E or Herbartian
          time split worked out to the minute and the correct CBSE marks scheme written in.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cbse-stage">
              Stage
            </label>
            <select
              id="cbse-stage"
              className={`mt-2 ${INPUT_CLASS}`}
              value={stage}
              onChange={(event) => onStageChange(event.target.value)}
            >
              {Object.entries(CBSE_STAGES).map(([key, spec]) => (
                <option key={key} value={key}>
                  {spec.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cbse-class">
              Class
            </label>
            <select
              id="cbse-class"
              className={`mt-2 ${INPUT_CLASS}`}
              value={classLevel}
              onChange={(event) => setClassLevel(event.target.value)}
            >
              {CBSE_STAGES[stage].classes.map((value) => (
                <option key={value} value={value}>
                  Class {value}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cbse-subject">
              Subject
            </label>
            <select
              id="cbse-subject"
              className={`mt-2 ${INPUT_CLASS}`}
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            >
              {CBSE_STAGES[stage].subjects.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cbse-topic">
              Chapter or topic
            </label>
            <input
              id="cbse-topic"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="e.g. Chemical Reactions and Equations"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cbse-period-minutes">
              Period length (minutes)
            </label>
            <input
              id="cbse-period-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="10"
              max="180"
              step="5"
              value={periodMinutes}
              onChange={(event) => setPeriodMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cbse-period-count">
              Number of periods
            </label>
            <input
              id="cbse-period-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="20"
              step="1"
              value={periodCount}
              onChange={(event) => setPeriodCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cbse-framework">
              Framework
            </label>
            <select
              id="cbse-framework"
              className={`mt-2 ${INPUT_CLASS}`}
              value={framework}
              onChange={(event) => setFramework(event.target.value)}
            >
              {Object.entries(FRAMEWORKS).map(([key, spec]) => (
                <option key={key} value={key}>
                  {spec.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cbse-format">
              Output format
            </label>
            <select
              id="cbse-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={planFormat}
              onChange={(event) => setPlanFormat(event.target.value)}
            >
              {Object.keys(PLAN_FORMATS).map((key) => (
                <option key={key} value={key}>
                  {FORMAT_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cbse-diff">
              Differentiation
            </label>
            <select
              id="cbse-diff"
              className={`mt-2 ${INPUT_CLASS}`}
              value={differentiation}
              onChange={(event) => setDifferentiation(event.target.value)}
            >
              {Object.keys(DIFFERENTIATION).map((key) => (
                <option key={key} value={key}>
                  {DIFFERENTIATION_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] px-3 text-sm font-medium"
            htmlFor="cbse-rubric"
          >
            <input
              id="cbse-rubric"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={includeRubric}
              onChange={(event) => setIncludeRubric(event.target.checked)}
            />
            Include a 4-level rubric
          </label>
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] px-3 text-sm font-medium"
            htmlFor="cbse-homework"
          >
            <input
              id="cbse-homework"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={includeHomework}
              onChange={(event) => setIncludeHomework(event.target.checked)}
            />
            Include homework
          </label>
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
              Teaching time planned
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${result.allocation.totalMinutes} min` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.allocation.periods} period(s) of ${result.allocation.periodMinutes} min · ${result.allocation.framework}`
                : "Fix the inputs above to build the plan."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              aria-label="Copy the generated CBSE lesson plan prompt"
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

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {(ok ? result.allocation.phases : FRAMEWORKS[framework].phases.map(([name]) => ({ name }))).map(
            (phase) => (
              <div key={phase.name} className="rounded-md bg-[var(--muted)] px-3 py-2">
                <dt className="text-xs text-[var(--muted-foreground)]">{phase.name}</dt>
                <dd className="text-base font-semibold">
                  {ok ? `${phase.minutes} min (${phase.weight}%)` : DASH}
                </dd>
              </div>
            ),
          )}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-lg font-semibold">Marks scheme written into the prompt</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {ok ? result.assessment.scheme : DASH}
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[22rem] text-left text-sm">
            <thead>
              <tr className="text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-medium">
                  Component
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  Marks
                </th>
                <th scope="col" className="py-2 font-medium">
                  What it covers
                </th>
              </tr>
            </thead>
            <tbody>
              {ok ? (
                result.assessment.components.map(([name, marks, note]) => (
                  <tr key={name} className="border-t border-[var(--border)]">
                    <td className="py-2 pr-3 font-medium">{name}</td>
                    <td className="py-2 pr-3">{marks}</td>
                    <td className="py-2 text-[var(--muted-foreground)]">{note}</td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-[var(--border)]">
                  <td className="py-2 pr-3">{DASH}</td>
                  <td className="py-2 pr-3">{DASH}</td>
                  <td className="py-2">{DASH}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-lg font-semibold">Generated prompt</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {ok ? `${result.title} · ${result.wordCount} words` : DASH}
        </p>
        <pre className="mt-3 max-h-96 overflow-auto rounded-md bg-[var(--muted)] p-3 text-sm leading-6 whitespace-pre-wrap text-[var(--foreground)]">
          {ok ? result.prompt : DASH}
        </pre>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          CBSE affiliation bye-laws require a minimum of {CBSE_MIN_WORKING_DAYS} teaching days in a
          session — useful when you spread a unit across the year.
        </p>
      </section>
    </main>
  );
}
