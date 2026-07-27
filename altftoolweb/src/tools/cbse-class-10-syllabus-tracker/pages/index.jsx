"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw } from "lucide-react";

import {
  CHAPTER_STATUSES,
  CLASS_10_SUBJECTS,
  DEFAULT_STATUS,
  INTERNAL_COMPONENTS,
  INTERNAL_MARKS,
  THEORY_MARKS,
  chapterKey,
  overallProgress,
  requiredPace,
  subjectById,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_SUBJECTS = ["science", "maths", "social-science", "english"];
const DEFAULT_DAYS_LEFT = "75";

const pct = (value) => `${NUM1.format(Number.isFinite(value) ? value : 0)}%`;

export default function ToolHome() {
  const [selected, setSelected] = useState(DEFAULT_SUBJECTS);
  const [statusMap, setStatusMap] = useState({});
  const [daysLeft, setDaysLeft] = useState(DEFAULT_DAYS_LEFT);
  const [openSubject, setOpenSubject] = useState(DEFAULT_SUBJECTS[0]);
  const [copied, setCopied] = useState(false);

  const overall = useMemo(() => overallProgress(selected, statusMap), [selected, statusMap]);

  const pace = useMemo(() => {
    if (overall.error) return { error: overall.error };
    return requiredPace({
      remainingChapters: overall.remainingChapters,
      daysLeft: Number(daysLeft),
    });
  }, [overall, daysLeft]);

  const toggleSubject = (id) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const setChapterStatus = (subjectId, index, statusId) => {
    setStatusMap((current) => ({ ...current, [chapterKey(subjectId, index)]: statusId }));
  };

  const setWholeSubject = (subjectId, statusId) => {
    const subject = subjectById(subjectId);
    if (!subject) return;
    setStatusMap((current) => {
      const next = { ...current };
      subject.chapters.forEach((_, index) => {
        next[chapterKey(subjectId, index)] = statusId;
      });
      return next;
    });
  };

  const summary = useMemo(() => {
    if (overall.error) return "";
    const lines = [
      "CBSE Class 10 syllabus progress",
      `Overall completion: ${pct(overall.percent)} (${overall.masteredChapters} of ${overall.totalChapters} chapters fully done)`,
    ];
    overall.subjects.forEach((subject) => {
      lines.push(`${subject.name}: ${pct(subject.percent)} — ${subject.done}/${subject.total} chapters mastered`);
    });
    if (!pace.error && !pace.finished) {
      lines.push(`Pace needed: ${NUM2.format(pace.perWeek)} chapters a week over ${daysLeft} days`);
    }
    return lines.join("\n");
  }, [overall, pace, daysLeft]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSelected(DEFAULT_SUBJECTS);
    setStatusMap({});
    setDaysLeft(DEFAULT_DAYS_LEFT);
    setOpenSubject(DEFAULT_SUBJECTS[0]);
    setCopied(false);
  };

  const hasResult = !overall.error;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          Class 10 boards
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          CBSE Class 10 Syllabus Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Mark each Class 10 chapter as read, revised or sample-paper ready and watch a single
          completion figure — plus the chapters-per-week pace you need to hold to finish before the
          board exams.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className={LABEL_CLASS} id="class10-subject-label">
          Subjects you are tracking
        </p>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-labelledby="class10-subject-label">
          {CLASS_10_SUBJECTS.map((subject) => {
            const active = selected.includes(subject.id);
            return (
              <label
                key={subject.id}
                htmlFor={`c10-subject-${subject.id}`}
                className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-semibold transition ${
                  active
                    ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                }`}
              >
                <input
                  id={`c10-subject-${subject.id}`}
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--primary)]"
                  checked={active}
                  onChange={() => toggleSubject(subject.id)}
                />
                {subject.name}
              </label>
            );
          })}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="c10-days-left">
              Days left before the board exam
            </label>
            <input
              id="c10-days-left"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={daysLeft}
              onChange={(event) => setDaysLeft(event.target.value)}
            />
          </div>
        </div>
      </section>

      {overall.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {overall.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Syllabus completed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasResult ? pct(overall.percent) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasResult
                ? `${overall.masteredChapters} of ${overall.totalChapters} chapters revised with sample papers done`
                : "Pick at least one subject."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy Class 10 syllabus progress"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all progress" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
          <span
            className="block h-full bg-[var(--primary)]"
            style={{ width: `${hasResult ? Math.max(0, Math.min(100, overall.percent)) : 0}%` }}
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Chapters being tracked", hasResult ? String(overall.totalChapters) : DASH],
            ["Chapters fully mastered", hasResult ? String(overall.masteredChapters) : DASH],
            ["Chapters not started yet", hasResult ? String(overall.notStartedChapters) : DASH],
            [
              "Board theory marks in play",
              hasResult ? `${overall.boardMarksInPlay} marks` : DASH,
            ],
            [
              "Chapters a week to finish in time",
              !hasResult || pace.error
                ? DASH
                : pace.finished
                  ? "Syllabus already complete"
                  : NUM2.format(pace.perWeek),
            ],
            [
              "Days available per remaining chapter",
              !hasResult || pace.error || pace.finished || pace.daysPerChapter === null
                ? DASH
                : NUM2.format(pace.daysPerChapter),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {hasResult && pace.error ? (
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">{pace.error}</p>
        ) : null}
      </section>

      {hasResult
        ? overall.subjects.map((subject) => {
            const full = subjectById(subject.id);
            const open = openSubject === subject.id;
            return (
              <section
                key={subject.id}
                className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold">{subject.name}</h2>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      {subject.total} chapters · {THEORY_MARKS} marks theory + {INTERNAL_MARKS}{" "}
                      marks internal · {subject.note}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenSubject(open ? "" : subject.id)}
                    aria-expanded={open}
                    className="min-h-11 rounded-md px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    {open ? "Hide chapters" : "Show chapters"}
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--muted)]">
                    <span
                      className="block h-full bg-[var(--primary)]"
                      style={{ width: `${Math.max(0, Math.min(100, subject.percent))}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold">{pct(subject.percent)}</span>
                </div>

                {open && full ? (
                  <>
                    <ul className="mt-4 space-y-2">
                      {full.chapters.map((chapter, index) => {
                        const key = chapterKey(subject.id, index);
                        const value = statusMap[key] || DEFAULT_STATUS;
                        return (
                          <li
                            key={key}
                            className="grid gap-2 rounded-md border border-[var(--border)] p-3 sm:grid-cols-[1fr_auto] sm:items-center"
                          >
                            <label className="text-sm font-medium" htmlFor={`c10-status-${key}`}>
                              {index + 1}. {chapter}
                            </label>
                            <select
                              id={`c10-status-${key}`}
                              className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none sm:w-60"
                              value={value}
                              onChange={(event) =>
                                setChapterStatus(subject.id, index, event.target.value)
                              }
                            >
                              {CHAPTER_STATUSES.map((status) => (
                                <option key={status.id} value={status.id}>
                                  {status.label}
                                </option>
                              ))}
                            </select>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setWholeSubject(subject.id, "mastered")}
                        className={GHOST_BTN}
                      >
                        Mark all mastered
                      </button>
                      <button
                        type="button"
                        onClick={() => setWholeSubject(subject.id, "not-started")}
                        className={GHOST_BTN}
                      >
                        Clear this subject
                      </button>
                    </div>
                  </>
                ) : null}
              </section>
            );
          })
        : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Where the 20 internal marks come from</h2>
        <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          {INTERNAL_COMPONENTS.map((item) => (
            <li
              key={item.label}
              className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] px-3 py-2"
            >
              <span>{item.label}</span>
              <span className="font-semibold">{item.marks} marks</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Chapter lists follow the rationalised NCERT books CBSE currently prescribes. Check your
        school&apos;s copy of the session curriculum for deletions and for the internal assessment
        scheme, which the board can revise from year to year.
      </p>
    </main>
  );
}
