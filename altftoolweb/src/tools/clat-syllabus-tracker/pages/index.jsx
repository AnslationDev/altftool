"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scale } from "lucide-react";

import {
  CLAT_SECTIONS,
  DEFAULT_STATUS,
  DURATION_MINUTES,
  MARK_CORRECT,
  PENALTY_WRONG,
  READING_LOG_DAYS,
  TOPIC_STATUSES,
  TOTAL_QUESTIONS,
  expectedScore,
  overallReadiness,
  readingConsistency,
  sectionById,
  topicKey,
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

const DEFAULT_ATTEMPTED = "100";
const DEFAULT_ACCURACY = "70";
const emptyLog = () => Array.from({ length: READING_LOG_DAYS }, () => false);

const pct = (value) => `${NUM1.format(Number.isFinite(value) ? value : 0)}%`;

export default function ToolHome() {
  const [statusMap, setStatusMap] = useState({});
  const [log, setLog] = useState(emptyLog);
  const [attempted, setAttempted] = useState(DEFAULT_ATTEMPTED);
  const [accuracy, setAccuracy] = useState(DEFAULT_ACCURACY);
  const [openSection, setOpenSection] = useState(CLAT_SECTIONS[0].id);
  const [copied, setCopied] = useState(false);

  const readiness = useMemo(() => overallReadiness(statusMap), [statusMap]);
  const streak = useMemo(() => readingConsistency(log), [log]);
  const score = useMemo(
    () => expectedScore({ attempted: Number(attempted), accuracyPercent: Number(accuracy) }),
    [attempted, accuracy],
  );

  const setTopicStatus = (sectionId, index, statusId) => {
    setStatusMap((current) => ({ ...current, [topicKey(sectionId, index)]: statusId }));
  };

  const setWholeSection = (sectionId, statusId) => {
    const section = sectionById(sectionId);
    if (!section) return;
    setStatusMap((current) => {
      const next = { ...current };
      section.topics.forEach((_, index) => {
        next[topicKey(sectionId, index)] = statusId;
      });
      return next;
    });
  };

  const toggleDay = (index) => {
    setLog((current) => current.map((day, position) => (position === index ? !day : day)));
  };

  const summary = useMemo(() => {
    const lines = [
      "CLAT preparation status",
      `Weighted syllabus readiness: ${pct(readiness.percent)}`,
    ];
    readiness.sections.forEach((section) => {
      lines.push(
        `${section.name} (${section.weightPercent}% of the paper): ${pct(section.percent)}`,
      );
    });
    if (!streak.error) {
      lines.push(
        `Reading practice: ${streak.daysLogged}/${streak.days} days, current streak ${streak.currentStreak} days`,
      );
    }
    if (!score.error) {
      lines.push(
        `Projected score: ${NUM2.format(score.marks)} of ${TOTAL_QUESTIONS} from ${attempted} attempts at ${accuracy}% accuracy`,
      );
    }
    return lines.join("\n");
  }, [readiness, streak, score, attempted, accuracy]);

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setStatusMap({});
    setLog(emptyLog());
    setAttempted(DEFAULT_ATTEMPTED);
    setAccuracy(DEFAULT_ACCURACY);
    setOpenSection(CLAT_SECTIONS[0].id);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          CLAT UG
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">CLAT Syllabus Tracker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Track all five CLAT sections against the weights the Consortium publishes, log your daily
          reading practice, and see what {TOTAL_QUESTIONS} questions at your attempt rate and
          accuracy actually score under the +{MARK_CORRECT} / −{PENALTY_WRONG} marking scheme.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Weighted syllabus readiness
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {pct(readiness.percent)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {readiness.mastered} of {readiness.topics} topics mastered · weighted by each
              section&apos;s share of the paper
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy CLAT preparation summary"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all CLAT tracking" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
          <span
            className="block h-full bg-[var(--primary)]"
            style={{ width: `${Math.max(0, Math.min(100, readiness.percent))}%` }}
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Topics tracked", String(readiness.topics)],
            [
              "Weakest section right now",
              readiness.weakest ? `${readiness.weakest.name} (${pct(readiness.weakest.percent)})` : DASH,
            ],
            [
              "Time per question in the paper",
              `${NUM1.format(readiness.minutesPerQuestion)} min (${DURATION_MINUTES} min for ${TOTAL_QUESTIONS} questions)`,
            ],
            [
              "Reading practice streak",
              streak.error ? DASH : `${streak.currentStreak} days (best ${streak.longestStreak})`,
            ],
            [
              "Reading consistency this month",
              streak.error ? DASH : `${pct(streak.consistencyPercent)} of ${streak.days} days`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Daily reading practice</h2>
        <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
          One box per day for the last {READING_LOG_DAYS} days, oldest on the left. Tick a day on
          which you read a newspaper editorial or a full-length passage.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Reading practice log">
          {log.map((done, index) => (
            <button
              key={`day-${index}`}
              type="button"
              onClick={() => toggleDay(index)}
              aria-pressed={done}
              aria-label={`Day ${index + 1} of the last ${READING_LOG_DAYS} days${done ? ", read" : ", not read"}`}
              className={`h-11 w-11 rounded-md border text-xs font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                done
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        {streak.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {streak.error}
          </p>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            {streak.daysLogged} days read · {streak.missed} missed · current streak{" "}
            <span className="font-semibold text-[var(--foreground)]">{streak.currentStreak}</span>{" "}
            days
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What your attempt strategy scores</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="clat-attempted">
              Questions attempted (of {TOTAL_QUESTIONS})
            </label>
            <input
              id="clat-attempted"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={TOTAL_QUESTIONS}
              step="1"
              value={attempted}
              onChange={(event) => setAttempted(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="clat-accuracy">
              Accuracy on what you attempt (%)
            </label>
            <input
              id="clat-accuracy"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={accuracy}
              onChange={(event) => setAccuracy(event.target.value)}
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

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["Projected marks", score.error ? DASH : `${NUM2.format(score.marks)} / ${TOTAL_QUESTIONS}`],
            ["Correct answers", score.error ? DASH : NUM1.format(score.correct)],
            ["Wrong answers", score.error ? DASH : NUM1.format(score.wrong)],
            [
              "Marks lost to negative marking",
              score.error ? DASH : NUM2.format(score.wrong * PENALTY_WRONG),
            ],
            ["Questions left blank", score.error ? DASH : NUM1.format(score.unattempted)],
            [
              "Accuracy at which guessing breaks even",
              score.error ? DASH : pct(score.breakEvenAccuracy),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {readiness.sections.map((section) => {
        const full = sectionById(section.id);
        const open = openSection === section.id;
        return (
          <section
            key={section.id}
            className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">{section.name}</h2>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {section.weightPercent}% of the paper · {section.minQuestions}–
                  {section.maxQuestions} questions · {section.total} topics
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpenSection(open ? "" : section.id)}
                aria-expanded={open}
                className="min-h-11 rounded-md px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                {open ? "Hide topics" : "Show topics"}
              </button>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--muted)]">
                <span
                  className="block h-full bg-[var(--primary)]"
                  style={{ width: `${Math.max(0, Math.min(100, section.percent))}%` }}
                />
              </div>
              <span className="text-sm font-semibold">{pct(section.percent)}</span>
            </div>

            {open && full ? (
              <>
                <ul className="mt-4 space-y-2">
                  {full.topics.map((topic, index) => {
                    const key = topicKey(section.id, index);
                    const value = statusMap[key] || DEFAULT_STATUS;
                    return (
                      <li
                        key={key}
                        className="grid gap-2 rounded-md border border-[var(--border)] p-3 sm:grid-cols-[1fr_auto] sm:items-center"
                      >
                        <label className="text-sm font-medium" htmlFor={`clat-status-${key}`}>
                          {index + 1}. {topic}
                        </label>
                        <select
                          id={`clat-status-${key}`}
                          className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none sm:w-56"
                          value={value}
                          onChange={(event) => setTopicStatus(section.id, index, event.target.value)}
                        >
                          {TOPIC_STATUSES.map((status) => (
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
                    onClick={() => setWholeSection(section.id, "mastered")}
                    className={GHOST_BTN}
                  >
                    Mark all mastered
                  </button>
                  <button
                    type="button"
                    onClick={() => setWholeSection(section.id, "not-started")}
                    className={GHOST_BTN}
                  >
                    Clear this section
                  </button>
                </div>
              </>
            ) : null}
          </section>
        );
      })}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Section weights and the question band follow the Consortium of NLUs&apos; published pattern
        for the CLAT UG paper. The Consortium can revise the pattern between cycles, so read the
        current notification before you finalise an attempt strategy.
      </p>
    </main>
  );
}
