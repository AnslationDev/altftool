"use client";

import { useMemo, useState } from "react";
import { Captions, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  CAPTION_EFFORT_PRESETS,
  TRANSCRIPT_EFFORT_PRESETS,
  WCAG_REFS,
  computeCoverage,
  formatMinutes,
} from "../lib";

const DEFAULT_LESSONS = [
  { id: "lesson-0", title: "01 · Welcome and setup", minutes: "6", captioned: true, transcribed: true },
  { id: "lesson-1", title: "02 · Core concepts", minutes: "24", captioned: true, transcribed: false },
  { id: "lesson-2", title: "03 · Hands-on walkthrough", minutes: "38", captioned: false, transcribed: false },
  { id: "lesson-3", title: "04 · Common mistakes", minutes: "17", captioned: true, transcribed: false },
  { id: "lesson-4", title: "05 · Wrap-up and next steps", minutes: "9", captioned: false, transcribed: false },
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

export default function ToolHome() {
  const [lessons, setLessons] = useState(DEFAULT_LESSONS);
  const [seq, setSeq] = useState(DEFAULT_LESSONS.length);
  const [captionMultiplier, setCaptionMultiplier] = useState("3");
  const [transcriptMultiplier, setTranscriptMultiplier] = useState("0.5");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeCoverage({
        lessons: lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          minutes: Number(lesson.minutes),
          captioned: lesson.captioned,
          transcribed: lesson.transcribed,
        })),
        captionMultiplier: Number(captionMultiplier),
        transcriptMultiplier: Number(transcriptMultiplier),
      }),
    [lessons, captionMultiplier, transcriptMultiplier],
  );

  const hasError = Boolean(result.error);

  const updateLesson = (id, patch) => {
    setLessons((current) => current.map((lesson) => (lesson.id === id ? { ...lesson, ...patch } : lesson)));
    setCopied(false);
  };

  const addLesson = () => {
    setLessons((current) => [
      ...current,
      { id: `lesson-${seq}`, title: `Lesson ${current.length + 1}`, minutes: "10", captioned: false, transcribed: false },
    ]);
    setSeq((value) => value + 1);
    setCopied(false);
  };

  const removeLesson = (id) => {
    setLessons((current) => (current.length > 1 ? current.filter((lesson) => lesson.id !== id) : current));
    setCopied(false);
  };

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setLessons(DEFAULT_LESSONS);
    setSeq(DEFAULT_LESSONS.length);
    setCaptionMultiplier("3");
    setTranscriptMultiplier("0.5");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Captions className="h-4 w-4" aria-hidden="true" />
          Course production
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Course Caption Coverage Tracker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          See how much of your course is captioned and transcribed — by lesson count and, more
          importantly, by runtime — and how many hours of work are still queued up.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Lessons</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Lesson</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Minutes</th>
                <th scope="col" className="py-2 pr-3 text-center font-semibold">Captions</th>
                <th scope="col" className="py-2 pr-3 text-center font-semibold">Transcript</th>
                <th scope="col" className="py-2 font-semibold"><span className="sr-only">Remove</span></th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson) => (
                <tr key={lesson.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">
                    <label className="sr-only" htmlFor={`ccc-title-${lesson.id}`}>
                      Lesson title
                    </label>
                    <input
                      id={`ccc-title-${lesson.id}`}
                      className={INPUT_CLASS}
                      type="text"
                      value={lesson.title}
                      onChange={(event) => updateLesson(lesson.id, { title: event.target.value })}
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <label className="sr-only" htmlFor={`ccc-mins-${lesson.id}`}>
                      {lesson.title} duration in minutes
                    </label>
                    <input
                      id={`ccc-mins-${lesson.id}`}
                      className={`${INPUT_CLASS} w-24`}
                      type="number"
                      inputMode="decimal"
                      min="1"
                      step="1"
                      value={lesson.minutes}
                      onChange={(event) => updateLesson(lesson.id, { minutes: event.target.value })}
                    />
                  </td>
                  <td className="py-2 pr-3 text-center">
                    <label className="sr-only" htmlFor={`ccc-cap-${lesson.id}`}>
                      {lesson.title} captions done
                    </label>
                    <input
                      id={`ccc-cap-${lesson.id}`}
                      type="checkbox"
                      checked={lesson.captioned}
                      onChange={(event) => updateLesson(lesson.id, { captioned: event.target.checked })}
                      className="h-5 w-5 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    />
                  </td>
                  <td className="py-2 pr-3 text-center">
                    <label className="sr-only" htmlFor={`ccc-tra-${lesson.id}`}>
                      {lesson.title} transcript done
                    </label>
                    <input
                      id={`ccc-tra-${lesson.id}`}
                      type="checkbox"
                      checked={lesson.transcribed}
                      onChange={(event) => updateLesson(lesson.id, { transcribed: event.target.checked })}
                      className="h-5 w-5 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    />
                  </td>
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() => removeLesson(lesson.id)}
                      aria-label={`Remove ${lesson.title}`}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--muted-foreground)] transition hover:text-[var(--danger)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button type="button" onClick={addLesson} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add lesson
        </button>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ccc-cap-mult">
              Captioning effort (x runtime)
            </label>
            <input
              id="ccc-cap-mult"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              max="20"
              step="0.1"
              value={captionMultiplier}
              onChange={(event) => setCaptionMultiplier(event.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {CAPTION_EFFORT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setCaptionMultiplier(String(preset.multiplier))}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ccc-tra-mult">
              Transcript effort (x runtime)
            </label>
            <input
              id="ccc-tra-mult"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              max="20"
              step="0.1"
              value={transcriptMultiplier}
              onChange={(event) => setTranscriptMultiplier(event.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {TRANSCRIPT_EFFORT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setTranscriptMultiplier(String(preset.multiplier))}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {preset.label}
                </button>
              ))}
            </div>
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
              Captioned runtime
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.captionRuntimePercent}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the lesson list to see coverage."
                : `${formatMinutes(result.captionedMinutes)} captioned of ${result.totalRuntimeLabel} total`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the caption coverage summary"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy summary"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the tracker" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Lessons tracked", hasError ? DASH : String(result.lessonCount)],
            ["Total runtime", hasError ? DASH : result.totalRuntimeLabel],
            [
              "Captions done",
              hasError ? DASH : `${result.captionedCount}/${result.lessonCount} lessons (${result.captionCountPercent}%)`,
            ],
            [
              "Transcripts done",
              hasError
                ? DASH
                : `${result.transcribedCount}/${result.lessonCount} lessons (${result.transcriptCountPercent}%) · ${result.transcriptRuntimePercent}% of runtime`,
            ],
            ["Lessons with both", hasError ? DASH : `${result.bothCount}/${result.lessonCount}`],
            [
              "Media still to caption",
              hasError
                ? DASH
                : `${formatMinutes(result.remainingCaptionMinutes)} · about ${result.captionWorkHours} h at ${result.captionMultiplier}x`,
            ],
            [
              "Media still to transcribe",
              hasError
                ? DASH
                : `${formatMinutes(result.remainingTranscriptMinutes)} · about ${result.transcriptWorkHours} h at ${result.transcriptMultiplier}x`,
            ],
            ["Total work remaining", hasError ? DASH : `about ${result.totalWorkHours} h`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {hasError ? null : (
          <>
            <div className="mt-5">
              <div
                className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="img"
                aria-label={`Captions cover ${result.captionRuntimePercent} percent of runtime`}
              >
                <span
                  className="block h-full bg-[var(--primary)]"
                  style={{ width: `${result.captionRuntimePercent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Captioned runtime {result.captionRuntimePercent}% · transcribed runtime{" "}
                {result.transcriptRuntimePercent}%
              </p>
            </div>

            <p
              className={`mt-4 rounded-md px-3 py-2 text-xs leading-5 ${
                result.captionsComplete
                  ? "bg-[var(--success-soft)] text-[var(--success)]"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)]"
              }`}
            >
              {result.captionsComplete
                ? `Every minute of the course is captioned, which is what WCAG 2.2 SC ${WCAG_REFS.captions.sc} "${WCAG_REFS.captions.name}" (Level ${WCAG_REFS.captions.level}) asks for on prerecorded media.`
                : `WCAG 2.2 SC ${WCAG_REFS.captions.sc} "${WCAG_REFS.captions.name}" is Level ${WCAG_REFS.captions.level} and applies to every prerecorded lesson, not a sample of them.`}
            </p>

            {result.nextUp.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold">Longest uncaptioned lessons</h3>
                <ul className="mt-2 space-y-1 text-sm text-[var(--muted-foreground)]">
                  {result.nextUp.map((row) => (
                    <li key={row.id} className="flex items-center justify-between gap-3">
                      <span className="min-w-0 truncate">{row.title}</span>
                      <span className="shrink-0 font-semibold text-[var(--foreground)]">
                        {formatMinutes(row.minutes)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Effort figures are planning estimates based on multiples of runtime, and the WCAG notes are
        informational — for a formal conformance claim, get an accessibility audit.
      </p>
    </main>
  );
}
