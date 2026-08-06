"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw, Shuffle } from "lucide-react";

import {
  buildExamWishes,
  EXAMS,
  LANGUAGES,
  MAX_NAME_LENGTH,
  MAX_STUDY_HOURS_PER_DAY,
  MAX_SUBJECTS,
  MAX_VARIANTS,
  RELATIONSHIPS,
  TONES,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  name: "Aarav",
  exam: "board12",
  relationship: "child",
  tone: "motivating",
  language: "en",
  todayISO: "2026-07-28",
  examISO: "2026-09-01",
  hoursPerDay: 4,
  subjects: 5,
  sender: "Papa",
  count: 3,
};

const DASH = "—";

export default function ToolHome() {
  const [name, setName] = useState(DEFAULTS.name);
  const [exam, setExam] = useState(DEFAULTS.exam);
  const [relationship, setRelationship] = useState(DEFAULTS.relationship);
  const [tone, setTone] = useState(DEFAULTS.tone);
  const [language, setLanguage] = useState(DEFAULTS.language);
  const [todayISO, setTodayISO] = useState(DEFAULTS.todayISO);
  const [examISO, setExamISO] = useState(DEFAULTS.examISO);
  const [hoursPerDay, setHoursPerDay] = useState(DEFAULTS.hoursPerDay);
  const [subjects, setSubjects] = useState(DEFAULTS.subjects);
  const [sender, setSender] = useState(DEFAULTS.sender);
  const [count, setCount] = useState(DEFAULTS.count);
  const [seed, setSeed] = useState(1);
  const [copiedId, setCopiedId] = useState(0);

  const result = useMemo(
    () =>
      buildExamWishes({
        name,
        exam,
        relationship,
        tone,
        language,
        todayISO,
        examISO,
        hoursPerDay,
        subjects,
        sender,
        seed,
        count,
      }),
    [
      name,
      exam,
      relationship,
      tone,
      language,
      todayISO,
      examISO,
      hoursPerDay,
      subjects,
      sender,
      seed,
      count,
    ],
  );

  const hasError = Boolean(result.error);
  const variants = hasError ? [] : result.variants;
  const lead = variants[0];
  const budget = hasError ? null : result.budget;
  const budgetError = hasError ? null : result.budgetError;

  const copyText = async (text, id) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(0), 1500);
    } catch {
      setCopiedId(0);
    }
  };

  const reset = () => {
    setName(DEFAULTS.name);
    setExam(DEFAULTS.exam);
    setRelationship(DEFAULTS.relationship);
    setTone(DEFAULTS.tone);
    setLanguage(DEFAULTS.language);
    setTodayISO(DEFAULTS.todayISO);
    setExamISO(DEFAULTS.examISO);
    setHoursPerDay(DEFAULTS.hoursPerDay);
    setSubjects(DEFAULTS.subjects);
    setSender(DEFAULTS.sender);
    setCount(DEFAULTS.count);
    setSeed(1);
    setCopiedId(0);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          Exam wishes
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Exam Best Wishes Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Write good luck messages for boards, JEE, NEET, UPSC, CAT or a semester paper in seven
          languages — and see how many revision hours per subject are actually left.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ebw-name">
              Student&rsquo;s name
            </label>
            <input
              id="ebw-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={MAX_NAME_LENGTH}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ebw-sender">
              Sign off as (optional)
            </label>
            <input
              id="ebw-sender"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={MAX_NAME_LENGTH}
              value={sender}
              onChange={(e) => setSender(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ebw-exam">
              Exam
            </label>
            <select
              id="ebw-exam"
              className={`mt-2 ${INPUT_CLASS}`}
              value={exam}
              onChange={(e) => setExam(e.target.value)}
            >
              {EXAMS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ebw-relationship">
              They are your
            </label>
            <select
              id="ebw-relationship"
              className={`mt-2 ${INPUT_CLASS}`}
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
            >
              {RELATIONSHIPS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ebw-today">
              Message date
            </label>
            <input
              id="ebw-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={todayISO}
              onChange={(e) => setTodayISO(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ebw-exam-date">
              First exam date
            </label>
            <input
              id="ebw-exam-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              min={todayISO || undefined}
              value={examISO}
              onChange={(e) => setExamISO(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ebw-hours">
              Study hours available per day
            </label>
            <input
              id="ebw-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max={MAX_STUDY_HOURS_PER_DAY}
              step="0.5"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value))}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ebw-subjects">
              Subjects or papers left
            </label>
            <input
              id="ebw-subjects"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_SUBJECTS}
              step="1"
              value={subjects}
              onChange={(e) => setSubjects(Number(e.target.value))}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ebw-language">
              Language
            </label>
            <select
              id="ebw-language"
              className={`mt-2 ${INPUT_CLASS}`}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {LANGUAGES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ebw-count">
              Messages to show
            </label>
            <input
              id="ebw-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_VARIANTS}
              step="1"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="mt-4">
          <p className={LABEL_CLASS}>Tone</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {TONES.map((item) => {
              const active = item.id === tone;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setTone(item.id)}
                  className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
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
              Days left to the exam
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError || result.daysLeft == null ? DASH : NUM.format(Math.max(0, result.daysLeft))}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the highlighted field to see the messages."
                : `${result.examLabel} · ${result.relationship}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSeed((value) => value + 1)}
              aria-label="Shuffle to different wording"
              className={GHOST_BTN}
            >
              <Shuffle className="h-4 w-4" aria-hidden="true" />
              Shuffle
            </button>
            <button
              type="button"
              onClick={() => copyText(lead?.text, 1)}
              aria-label="Copy the first exam wishes message"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copiedId === 1 ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copiedId === 1 ? "Copied!" : "Copy"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {budgetError ? (
          <p
            role="status"
            aria-live="polite"
            className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning-text)]"
          >
            Revision budget unavailable: {budgetError}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Total revision hours left", hasError || !budget ? DASH : NUM.format(budget.totalHours)],
            ["Hours per subject", hasError || !budget ? DASH : NUM.format(budget.hoursPerSubject)],
            [
              "Minutes per subject per day",
              hasError || !budget ? DASH : NUM.format(budget.minutesPerSubjectPerDay),
            ],
            ["Characters in message 1", hasError ? DASH : NUM.format(lead.chars)],
            ["Messages generated", hasError ? DASH : NUM.format(variants.length)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 space-y-4">
          {variants.map((variant) => (
            <article
              key={variant.id}
              className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-[var(--muted-foreground)]">
                  Message {variant.id}
                </h2>
                <button
                  type="button"
                  onClick={() => copyText(variant.text, 100 + variant.id)}
                  aria-label={`Copy exam wishes message ${variant.id}`}
                  className={GHOST_BTN}
                >
                  {copiedId === 100 + variant.id ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copiedId === 100 + variant.id ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="mt-3 whitespace-pre-wrap break-words text-[15px] leading-7">
                {variant.text}
              </p>
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                {NUM.format(variant.chars)} characters · {NUM.format(variant.words)} words
              </p>
            </article>
          ))}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The revision figures are a rough budget, not a study plan — they assume every available hour
        is usable and divide it evenly across subjects. Weight the harder papers more heavily.
      </p>
    </main>
  );
}
