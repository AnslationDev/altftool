"use client";

import { useMemo, useState } from "react";
import { BookOpen, Check, Copy, RotateCcw } from "lucide-react";

import {
  CATEGORY_TARGETS,
  TYPICAL_CHAPTER_MAX_WORDS,
  TYPICAL_CHAPTER_MIN_WORDS,
  WEEKDAYS,
  addMonthsIso,
  planNovel,
  planToText,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN");

function todayIso() {
  const now = new Date();
  const yyyy = String(now.getFullYear()).padStart(4, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function ToolHome() {
  const [start] = useState(todayIso);
  const [startIso, setStartIso] = useState(start);
  const [deadlineIso, setDeadlineIso] = useState(() => addMonthsIso(start, 6));
  const [targetWords, setTargetWords] = useState("90000");
  const [chapters, setChapters] = useState("30");
  const [wordsSoFar, setWordsSoFar] = useState("0");
  const [writingDays, setWritingDays] = useState([1, 2, 3, 4, 5]);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planNovel({
        targetWords: targetWords === "" ? NaN : Number(targetWords),
        chapters: chapters === "" ? NaN : Number(chapters),
        startIso,
        deadlineIso,
        writingDays,
        wordsSoFar: wordsSoFar === "" ? 0 : Number(wordsSoFar),
      }),
    [targetWords, chapters, startIso, deadlineIso, writingDays, wordsSoFar],
  );

  const outline = useMemo(() => planToText(plan), [plan]);
  const hasError = Boolean(plan.error);

  const toggleDay = (id) => {
    setWritingDays((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const copyResult = async () => {
    if (!outline) return;
    try {
      await navigator.clipboard.writeText(outline);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setStartIso(start);
    setDeadlineIso(addMonthsIso(start, 6));
    setTargetWords("90000");
    setChapters("30");
    setWordsSoFar("0");
    setWritingDays([1, 2, 3, 4, 5]);
    setCopied(false);
  };

  const stats = hasError
    ? [
        ["Length category", DASH],
        ["Words per chapter", DASH],
        ["Calendar days", DASH],
        ["Writing days", DASH],
        ["Weekly target", DASH],
        ["Progress", DASH],
      ]
    : [
        ["Length category", plan.category.label],
        ["Words per chapter", `${NUM.format(Math.round(plan.averageChapter))} average`],
        ["Calendar days", `${NUM.format(plan.calendarDays)} from ${plan.startLabel} to ${plan.deadlineLabel}`],
        ["Writing days", `${NUM.format(plan.writingDayCount)} (${plan.daysPerWeek} days a week)`],
        ["Weekly target", `${NUM.format(plan.weeklyTarget)} words`],
        ["Progress", `${NUM.format(plan.wordsSoFar)} of ${NUM.format(plan.target)} (${plan.percentDone}%)`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          Manuscript planning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Novel Word Count Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set a word target and a deadline, say which days of the week you actually write, and get a
          real daily goal — counted against writing days rather than calendar days — plus a due date
          for every chapter.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nwc-target">
              Word target
            </label>
            <input
              id="nwc-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1000"
              max="500000"
              step="1000"
              value={targetWords}
              onChange={(event) => setTargetWords(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nwc-chapters">
              Chapters planned
            </label>
            <input
              id="nwc-chapters"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="200"
              step="1"
              value={chapters}
              onChange={(event) => setChapters(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nwc-start">
              Start date
            </label>
            <input
              id="nwc-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={startIso}
              onChange={(event) => setStartIso(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nwc-deadline">
              Deadline
            </label>
            <input
              id="nwc-deadline"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={deadlineIso}
              onChange={(event) => setDeadlineIso(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="nwc-sofar">
              Words already written
            </label>
            <input
              id="nwc-sofar"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="500"
              value={wordsSoFar}
              onChange={(event) => setWordsSoFar(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Days you actually write
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => {
              const active = writingDays.includes(day.id);
              return (
                <label
                  key={day.id}
                  htmlFor={`nwc-day-${day.id}`}
                  className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-semibold transition ${
                    active
                      ? "border-[var(--primary)] bg-[var(--muted)] text-[var(--foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                  }`}
                >
                  <input
                    id={`nwc-day-${day.id}`}
                    type="checkbox"
                    className="h-4 w-4 accent-[var(--primary)]"
                    checked={active}
                    onChange={() => toggleDay(day.id)}
                  />
                  <span>
                    {day.short}
                    <span className="sr-only"> {day.label}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-5">
          <label className={LABEL_CLASS} htmlFor="nwc-category">
            Or start from a category word count
          </label>
          <select
            id="nwc-category"
            className={`mt-2 ${INPUT_CLASS}`}
            value=""
            onChange={(event) => {
              const found = CATEGORY_TARGETS.find((item) => item.id === event.target.value);
              if (found) setTargetWords(String(found.typical));
            }}
          >
            <option value="">Choose a category…</option>
            {CATEGORY_TARGETS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label} — {NUM.format(item.min)} to {NUM.format(item.max)} words
              </option>
            ))}
          </select>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Words per writing day
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(plan.dailyTarget)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the highlighted input to build the schedule."
                : plan.complete
                  ? "Target already met — nothing left to write."
                  : `${NUM.format(plan.remaining)} words left across ${NUM.format(plan.writingDayCount)} writing days`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the chapter schedule"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy schedule"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {stats.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-4 space-y-2">
            {plan.chapterTooShort && (
              <p className="rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
                At {NUM.format(Math.round(plan.averageChapter))} words, chapters are shorter than the
                usual {NUM.format(TYPICAL_CHAPTER_MIN_WORDS)}-{NUM.format(TYPICAL_CHAPTER_MAX_WORDS)}{" "}
                band. That is a stylistic choice — thrillers often run short — not a mistake.
              </p>
            )}
            {plan.chapterTooLong && (
              <p className="rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
                At {NUM.format(Math.round(plan.averageChapter))} words, chapters are longer than the
                usual {NUM.format(TYPICAL_CHAPTER_MIN_WORDS)}-{NUM.format(TYPICAL_CHAPTER_MAX_WORDS)}{" "}
                band. Consider whether some chapters want a scene break instead.
              </p>
            )}
          </div>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Chapter schedule</h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Each due date is a real writing day from your selected weekdays.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <caption className="sr-only">Chapter word counts and due dates</caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Ch.</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Words</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Cumulative</th>
                  <th scope="col" className="py-2 text-right font-semibold">Due</th>
                </tr>
              </thead>
              <tbody>
                {plan.schedule.map((row) => (
                  <tr key={row.chapter} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.chapter}</td>
                    <td className="py-2 pr-3 text-right">{NUM.format(row.words)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {NUM.format(row.cumulativeWords)}
                    </td>
                    <td className="py-2 text-right whitespace-nowrap">{row.dueLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Category word counts are trade expectations quoted by agents and editors, not rules — the
        SFWA boundaries (40,000 words for a novel, 17,500 for a novella) are fixed for award
        purposes only. Nothing here accounts for revision, which routinely takes as long as the
        draft.
      </p>
    </main>
  );
}
