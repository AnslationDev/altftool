"use client";

import { useMemo, useState } from "react";
import { Atom, Check, Copy, RotateCcw } from "lucide-react";

import {
  JEE_ADVANCED_PATTERN,
  JEE_EVENT_DEFAULTS,
  JEE_MAIN_PATTERN,
  JEE_SUBJECT_DEFAULTS,
  buildCountdownBoard,
  computePace,
  toLocalISODate,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TONE_TEXT = {
  success: "text-[var(--success)]",
  warning: "text-[var(--warning)]",
  danger: "text-[var(--danger)]",
};

const toNumber = (raw) => {
  const value = Number(String(raw).trim());
  return Number.isFinite(value) ? value : NaN;
};

const dayLabel = (days) => {
  if (days === 0) return "Exam is today";
  const n = Math.abs(days);
  const unit = n === 1 ? "day" : "days";
  return days < 0 ? `${NUM0.format(n)} ${unit} ago` : `${NUM0.format(n)} ${unit} to go`;
};

export default function ToolHome() {
  const [today, setToday] = useState(() => toLocalISODate(new Date()));
  const [events, setEvents] = useState(() => JEE_EVENT_DEFAULTS.map((event) => ({ ...event })));
  const [targetId, setTargetId] = useState(JEE_EVENT_DEFAULTS[0].id);
  const [subjects, setSubjects] = useState(() => JEE_SUBJECT_DEFAULTS.map((s) => ({ ...s })));
  const [buffer, setBuffer] = useState("30");
  const [daysPerWeek, setDaysPerWeek] = useState("6");
  const [hoursPerDay, setHoursPerDay] = useState("5");
  const [copied, setCopied] = useState(false);

  const board = useMemo(() => buildCountdownBoard(today, events), [today, events]);

  const targetEvent = events.find((event) => event.id === targetId) || events[0];

  const pace = useMemo(
    () =>
      computePace({
        todayISO: today,
        targetISO: targetEvent ? targetEvent.date : "",
        subjects: subjects.map((subject) => ({
          ...subject,
          total: toNumber(subject.total),
          done: toNumber(subject.done),
        })),
        revisionBufferDays: toNumber(buffer),
        studyDaysPerWeek: toNumber(daysPerWeek),
        hoursPerDay: toNumber(hoursPerDay),
      }),
    [today, targetEvent, subjects, buffer, daysPerWeek, hoursPerDay],
  );

  const errorMessage = board.error || pace.error || "";
  const boardOk = !board.error;
  const paceOk = !pace.error;
  const ok = boardOk && paceOk;

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = ["JEE Exam Countdown", `As on ${today}`];
    board.rows.forEach((row) => {
      lines.push(
        row.error
          ? `${row.label}${row.date ? ` (${row.date})` : ""}: date needed`
          : `${row.label} (${row.date}): ${dayLabel(row.days)}`,
      );
    });
    lines.push(
      "",
      `Pacing towards: ${targetEvent.label}`,
      `Syllabus done: ${NUM0.format(pace.unitsDone)} of ${NUM0.format(pace.unitsTotal)} units (${NUM.format(pace.percentDone)}%)`,
      `First-pass days after revision buffer: ${NUM0.format(pace.prepDays)}`,
      `Study days available: ${NUM0.format(pace.studyDays)}`,
      `Required pace: ${pace.unitsPerStudyDay === null ? "not achievable" : `${NUM.format(pace.unitsPerStudyDay)} units per study day`}`,
      `Verdict: ${pace.band.label}`,
    );
    return lines.join("\n");
  }, [ok, today, board, targetEvent, pace]);

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
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Reset all exam dates and subject progress? This clears your entered dates, syllabus progress and pace settings and cannot be undone.",
      )
    ) {
      return;
    }
    setToday(toLocalISODate(new Date()));
    setEvents(JEE_EVENT_DEFAULTS.map((event) => ({ ...event })));
    setTargetId(JEE_EVENT_DEFAULTS[0].id);
    setSubjects(JEE_SUBJECT_DEFAULTS.map((s) => ({ ...s })));
    setBuffer("30");
    setDaysPerWeek("6");
    setHoursPerDay("5");
    setCopied(false);
  };

  const updateEvent = (id, date) => {
    setEvents((rows) => rows.map((row) => (row.id === id ? { ...row, date } : row)));
  };

  const updateSubject = (id, key, value) => {
    setSubjects((rows) => rows.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  };

  const headline =
    boardOk && pace.calendarDaysLeft >= 0 ? dayLabel(pace.calendarDaysLeft) : DASH;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Atom className="h-4 w-4" aria-hidden="true" />
          JEE countdown
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">JEE Exam Countdown</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Days left to JEE Main Session 1, Session 2 and JEE Advanced, plus the syllabus pace you
          need to hold to finish the first pass before revision starts.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Exam dates</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Defaults are the usual January, April and May windows. Replace them with the dates on your
          NTA bulletin or admit card.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="jee-today">
              Today&apos;s date
            </label>
            <input
              id="jee-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
          {events.map((event) => (
            <div key={event.id}>
              <label className={LABEL_CLASS} htmlFor={`jee-date-${event.id}`}>
                {event.label}
              </label>
              <input
                id={`jee-date-${event.id}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="date"
                value={event.date}
                onChange={(changeEvent) => updateEvent(event.id, changeEvent.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Syllabus pace tracker</h2>
        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="jee-target">
            Pace the syllabus towards
          </label>
          <select
            id="jee-target"
            className={`mt-2 ${INPUT_CLASS}`}
            value={targetId}
            onChange={(event) => setTargetId(event.target.value)}
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 space-y-4">
          {subjects.map((subject) => (
            <div key={subject.id} className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor={`jee-total-${subject.id}`}>
                  {subject.label} — total units
                </label>
                <input
                  id={`jee-total-${subject.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  value={subject.total}
                  onChange={(event) => updateSubject(subject.id, "total", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`jee-done-${subject.id}`}>
                  {subject.label} — units finished
                </label>
                <input
                  id={`jee-done-${subject.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  value={subject.done}
                  onChange={(event) => updateSubject(subject.id, "done", event.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="jee-buffer">
              Revision buffer before the exam (days)
            </label>
            <input
              id="jee-buffer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={buffer}
              onChange={(event) => setBuffer(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jee-dpw">
              Study days per week (1-7)
            </label>
            <input
              id="jee-dpw"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="7"
              step="1"
              value={daysPerWeek}
              onChange={(event) => setDaysPerWeek(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="jee-hours">
              Focused study hours on a study day
            </label>
            <input
              id="jee-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="18"
              step="0.5"
              value={hoursPerDay}
              onChange={(event) => setHoursPerDay(event.target.value)}
            />
          </div>
        </div>
      </section>

      {errorMessage ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {errorMessage}
        </p>
      ) : null}

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {boardOk ? `${targetEvent.label} · ${targetEvent.date}` : "Countdown"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{headline}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${NUM0.format(pace.studyDays)} study days left after a ${NUM0.format(pace.bufferDaysApplied)} day revision buffer`
                : "Fix the inputs above to see the countdown."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy JEE countdown and pace summary"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Required pace",
              paceOk && pace.unitsPerStudyDay !== null
                ? `${NUM.format(pace.unitsPerStudyDay)} units per study day`
                : DASH,
            ],
            [
              "Time you can give each unit",
              paceOk && pace.hoursPerUnit !== null ? `${NUM.format(pace.hoursPerUnit)} hours` : DASH,
            ],
            [
              "Syllabus finished",
              paceOk
                ? `${NUM0.format(pace.unitsDone)} of ${NUM0.format(pace.unitsTotal)} units (${NUM.format(pace.percentDone)}%)`
                : DASH,
            ],
            ["Units still to cover", paceOk ? NUM0.format(pace.unitsLeft) : DASH],
            ["First-pass days available", paceOk ? NUM0.format(pace.prepDays) : DASH],
            ["Study days inside those", paceOk ? NUM0.format(pace.studyDays) : DASH],
            ["Total study hours left", paceOk ? `${NUM0.format(pace.studyHours)} hours` : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {paceOk ? (
          <p className={`mt-4 text-sm font-semibold ${TONE_TEXT[pace.band.tone] || ""}`}>
            {pace.band.label} — <span className="font-normal">{pace.band.note}</span>
          </p>
        ) : null}
      </section>

      {boardOk ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Countdown board</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Exam
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Date
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Countdown
                  </th>
                </tr>
              </thead>
              <tbody>
                {board.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.date || DASH}</td>
                    <td
                      className={`py-2 text-right font-semibold ${
                        row.error
                          ? "text-[var(--danger)]"
                          : row.isPast
                            ? "text-[var(--muted-foreground)]"
                            : ""
                      }`}
                    >
                      {row.error ? "Date needed" : dayLabel(row.days)}
                      {!row.error && row.days > 6 ? (
                        <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                          {NUM0.format(row.weeks)} week{row.weeks === 1 ? "" : "s"}{" "}
                          {NUM0.format(row.spareDays)} day{row.spareDays === 1 ? "" : "s"}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {paceOk ? (
            <>
              <h3 className="mt-6 text-sm font-semibold">Subject progress</h3>
              <ul className="mt-3 space-y-3">
                {pace.perSubject.map((subject) => (
                  <li key={subject.id}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-semibold">{subject.label}</span>
                      <span className="text-[var(--muted-foreground)]">
                        {NUM0.format(subject.done)}/{NUM0.format(subject.total)} ·{" "}
                        {NUM.format(subject.percentDone)}%
                      </span>
                    </div>
                    <div
                      className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                      role="img"
                      aria-label={`${subject.label} is ${NUM.format(subject.percentDone)} percent complete`}
                    >
                      <span
                        className="block h-full bg-[var(--primary)]"
                        style={{ width: `${Math.max(0, Math.min(100, subject.percentDone))}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        JEE Main Paper 1 asks {JEE_MAIN_PATTERN.questionsAttempted} questions for{" "}
        {JEE_MAIN_PATTERN.totalMarks} marks in {JEE_MAIN_PATTERN.durationHours} hours, marked{" "}
        {JEE_MAIN_PATTERN.correctMark} for a correct answer and {JEE_MAIN_PATTERN.negativeMark} for a
        wrong one. JEE Advanced is {JEE_ADVANCED_PATTERN.papers} compulsory papers of{" "}
        {JEE_ADVANCED_PATTERN.paperDurationHours} hours each on a single day. Dates here are your
        entries — always confirm them against the official NTA and IIT notifications.
      </p>
    </main>
  );
}
