"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw } from "lucide-react";

import {
  ASSESSMENT_TYPES,
  BLOOM_LEVELS,
  DIFFERENTIATION_OPTIONS,
  LESSON_FRAMEWORKS,
  MAX_CLASS_SIZE,
  MAX_LESSON_MINUTES,
  MIN_CLASS_SIZE,
  MIN_LESSON_MINUTES,
  buildLessonPlanPrompt,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-[5.5rem] w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs leading-5 text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_CLASS =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm transition hover:border-[var(--primary)]";
const CARD_CLASS = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const DASH = "—";

const DEFAULTS = {
  topic: "Photosynthesis and the leaf as an organ",
  subject: "Biology",
  gradeLevel: "Year 8",
  durationMinutes: "60",
  classSize: "28",
  frameworkId: "five-e",
  bloomLevelIds: ["understand", "apply"],
  priorKnowledge: "Students can name the parts of a plant and know that plants need light and water.",
  materials: "Projector, class set of leaves, iodine, hot plate, one lab per group of four.",
  assessmentIds: ["exit-ticket", "observation"],
  differentiationIds: ["eal", "extension"],
  includeHomework: true,
};

const toggle = (list, id) =>
  list.includes(id) ? list.filter((item) => item !== id) : [...list, id];

export default function ToolHome() {
  const [topic, setTopic] = useState(DEFAULTS.topic);
  const [subject, setSubject] = useState(DEFAULTS.subject);
  const [gradeLevel, setGradeLevel] = useState(DEFAULTS.gradeLevel);
  const [durationMinutes, setDurationMinutes] = useState(DEFAULTS.durationMinutes);
  const [classSize, setClassSize] = useState(DEFAULTS.classSize);
  const [frameworkId, setFrameworkId] = useState(DEFAULTS.frameworkId);
  const [bloomLevelIds, setBloomLevelIds] = useState(DEFAULTS.bloomLevelIds);
  const [priorKnowledge, setPriorKnowledge] = useState(DEFAULTS.priorKnowledge);
  const [materials, setMaterials] = useState(DEFAULTS.materials);
  const [assessmentIds, setAssessmentIds] = useState(DEFAULTS.assessmentIds);
  const [differentiationIds, setDifferentiationIds] = useState(DEFAULTS.differentiationIds);
  const [includeHomework, setIncludeHomework] = useState(DEFAULTS.includeHomework);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildLessonPlanPrompt({
        topic,
        subject,
        gradeLevel,
        durationMinutes:
          durationMinutes.trim() === "" ? Number.NaN : Number(durationMinutes),
        classSize: classSize.trim() === "" ? Number.NaN : Number(classSize),
        frameworkId,
        bloomLevelIds,
        priorKnowledge,
        materials,
        assessmentIds,
        differentiationIds,
        includeHomework,
      }),
    [
      topic,
      subject,
      gradeLevel,
      durationMinutes,
      classSize,
      frameworkId,
      bloomLevelIds,
      priorKnowledge,
      materials,
      assessmentIds,
      differentiationIds,
      includeHomework,
    ],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError || !result.prompt) return;
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
    setSubject(DEFAULTS.subject);
    setGradeLevel(DEFAULTS.gradeLevel);
    setDurationMinutes(DEFAULTS.durationMinutes);
    setClassSize(DEFAULTS.classSize);
    setFrameworkId(DEFAULTS.frameworkId);
    setBloomLevelIds(DEFAULTS.bloomLevelIds);
    setPriorKnowledge(DEFAULTS.priorKnowledge);
    setMaterials(DEFAULTS.materials);
    setAssessmentIds(DEFAULTS.assessmentIds);
    setDifferentiationIds(DEFAULTS.differentiationIds);
    setIncludeHomework(DEFAULTS.includeHomework);
    setCopied(false);
  };

  const stat = (value) => (hasError ? DASH : NUM.format(value));

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          Bloom + 5E / Hunter / Gagné
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Lesson Plan Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Describe the lesson once and get a prompt that forces measurable Bloom&rsquo;s objectives,
          a minute-by-minute phase budget for the instructional model you teach with, and
          assessment tied to the objectives.
        </p>
      </header>

      <section className={`${CARD_CLASS} mb-6`} aria-labelledby="lesson-basics">
        <h2 id="lesson-basics" className="mb-4 text-lg font-semibold">
          The lesson
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="lp-topic">
              Topic
            </label>
            <input
              id="lp-topic"
              className={INPUT_CLASS}
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
            />
            <p className={HINT_CLASS}>Be specific — &ldquo;the leaf as an organ&rdquo; beats &ldquo;plants&rdquo;.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lp-subject">
              Subject
            </label>
            <input
              id="lp-subject"
              className={INPUT_CLASS}
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lp-grade">
              Year group or age band
            </label>
            <input
              id="lp-grade"
              className={INPUT_CLASS}
              value={gradeLevel}
              onChange={(event) => setGradeLevel(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lp-duration">
              Lesson length (minutes)
            </label>
            <input
              id="lp-duration"
              className={INPUT_CLASS}
              type="number"
              min={MIN_LESSON_MINUTES}
              max={MAX_LESSON_MINUTES}
              step="1"
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(event.target.value)}
            />
            <p className={HINT_CLASS}>
              {MIN_LESSON_MINUTES}&ndash;{MAX_LESSON_MINUTES} minutes.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lp-class-size">
              Class size
            </label>
            <input
              id="lp-class-size"
              className={INPUT_CLASS}
              type="number"
              min={MIN_CLASS_SIZE}
              max={MAX_CLASS_SIZE}
              step="1"
              value={classSize}
              onChange={(event) => setClassSize(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="lp-framework">
              Instructional model
            </label>
            <select
              id="lp-framework"
              className={INPUT_CLASS}
              value={frameworkId}
              onChange={(event) => setFrameworkId(event.target.value)}
            >
              {LESSON_FRAMEWORKS.map((framework) => (
                <option key={framework.id} value={framework.id}>
                  {framework.label}
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>{result.frameworkSource ?? ""}</p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="lp-prior">
              Prior knowledge
            </label>
            <textarea
              id="lp-prior"
              className={TEXTAREA_CLASS}
              value={priorKnowledge}
              onChange={(event) => setPriorKnowledge(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="lp-materials">
              Materials and constraints
            </label>
            <textarea
              id="lp-materials"
              className={TEXTAREA_CLASS}
              value={materials}
              onChange={(event) => setMaterials(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className={`${CARD_CLASS} mb-6`} aria-labelledby="lesson-bloom">
        <h2 id="lesson-bloom" className="mb-1 text-lg font-semibold">
          Cognitive levels
        </h2>
        <p className="mb-4 text-sm text-[var(--muted-foreground)]">
          One objective is written per level you tick — revised Bloom&rsquo;s taxonomy, Anderson &amp;
          Krathwohl (2001).
        </p>
        <fieldset>
          <legend className="sr-only">Bloom&rsquo;s taxonomy levels</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {BLOOM_LEVELS.map((level) => (
              <label className={CHECK_CLASS} htmlFor={`lp-bloom-${level.id}`} key={level.id}>
                <input
                  id={`lp-bloom-${level.id}`}
                  type="checkbox"
                  className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={bloomLevelIds.includes(level.id)}
                  onChange={() => setBloomLevelIds((current) => toggle(current, level.id))}
                />
                <span>
                  <span className="font-semibold">
                    {level.order}. {level.label}
                  </span>
                  <span className="block text-xs leading-5 text-[var(--muted-foreground)]">
                    {level.description} Verbs: {level.verbs.slice(0, 3).join(", ")}.
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className={`${CARD_CLASS} mb-6`} aria-labelledby="lesson-assessment">
        <h2 id="lesson-assessment" className="mb-4 text-lg font-semibold">
          Assessment and differentiation
        </h2>
        <fieldset className="mb-5">
          <legend className={`${LABEL_CLASS} mb-3`}>Assessment</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {ASSESSMENT_TYPES.map((item) => (
              <label className={CHECK_CLASS} htmlFor={`lp-assess-${item.id}`} key={item.id}>
                <input
                  id={`lp-assess-${item.id}`}
                  type="checkbox"
                  className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={assessmentIds.includes(item.id)}
                  onChange={() => setAssessmentIds((current) => toggle(current, item.id))}
                />
                <span>
                  <span className="font-semibold">{item.label}</span>
                  <span className="block text-xs leading-5 text-[var(--muted-foreground)]">
                    {item.note}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="mb-5">
          <legend className={`${LABEL_CLASS} mb-3`}>Differentiation</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {DIFFERENTIATION_OPTIONS.map((item) => (
              <label className={CHECK_CLASS} htmlFor={`lp-diff-${item.id}`} key={item.id}>
                <input
                  id={`lp-diff-${item.id}`}
                  type="checkbox"
                  className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={differentiationIds.includes(item.id)}
                  onChange={() => setDifferentiationIds((current) => toggle(current, item.id))}
                />
                <span>
                  <span className="font-semibold">{item.label}</span>
                  <span className="block text-xs leading-5 text-[var(--muted-foreground)]">
                    {item.note}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <label className={CHECK_CLASS} htmlFor="lp-homework">
          <input
            id="lp-homework"
            type="checkbox"
            className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
            checked={includeHomework}
            onChange={(event) => setIncludeHomework(event.target.checked)}
          />
          <span className="font-semibold">Ask for follow-up work</span>
        </label>
      </section>

      <section className={CARD_CLASS} aria-labelledby="lesson-result">
        <h2 id="lesson-result" className="mb-4 text-lg font-semibold">
          Your prompt
        </h2>

        {hasError ? (
          <p
            role="alert"
            className="mb-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
        ) : null}

        <p className="text-sm font-medium text-[var(--muted-foreground)]">Lesson time budgeted</p>
        <p className="text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
          {hasError ? DASH : `${NUM.format(result.totalMinutes)} min`}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {hasError ? DASH : result.frameworkLabel}
        </p>

        <dl className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Phases</dt>
            <dd className="text-sm font-semibold tabular-nums">{stat(result.phaseCount)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Objectives requested</dt>
            <dd className="text-sm font-semibold tabular-nums">{stat(result.objectiveCount)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Assessment types</dt>
            <dd className="text-sm font-semibold tabular-nums">{stat(result.assessmentCount)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Differentiation levers</dt>
            <dd className="text-sm font-semibold tabular-nums">
              {stat(result.differentiationCount)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Class size</dt>
            <dd className="text-sm font-semibold tabular-nums">{stat(result.classSize)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Prompt length</dt>
            <dd className="text-sm font-semibold tabular-nums">
              {hasError ? DASH : `${NUM.format(result.wordCount)} words`}
            </dd>
          </div>
        </dl>

        {!hasError ? (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
              <caption className="sr-only">Minutes allocated to each phase of the lesson</caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Phase
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Minutes
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Purpose
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.phases.map((phase) => (
                  <tr key={phase.name} className="border-b border-[var(--border)]">
                    <td className="py-2 pr-3 font-medium">{phase.name}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{phase.minutes}</td>
                    <td className="py-2 text-[var(--muted-foreground)]">{phase.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {!hasError ? (
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-semibold">Prompt to paste into your AI assistant</h3>
            <pre className="max-h-96 overflow-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-xs leading-6 whitespace-pre-wrap text-[var(--foreground)]">
              {result.prompt}
            </pre>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className={PRIMARY_BTN}
            onClick={copyResult}
            disabled={hasError}
            aria-label="Copy the lesson plan prompt to the clipboard"
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy prompt"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset all fields">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>
    </main>
  );
}
