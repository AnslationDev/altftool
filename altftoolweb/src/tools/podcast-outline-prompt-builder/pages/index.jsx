"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Mic, RotateCcw } from "lucide-react";

import { FORMATS, LIMITS, buildEpisodePrompt, formatTime, planEpisode } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  showName: "Ship It Weekly",
  topic: "what actually breaks when a startup scales past one million users",
  guest: "",
  audience: "engineers and founders at growing startups",
  formatId: "interview",
  cta: "",
  notes: "",
  runtimeMinutes: "60",
  segmentCount: "4",
  questionsPerSegment: "3",
  includeColdOpen: true,
};

const DASH = "—";

export default function ToolHome() {
  const [showName, setShowName] = useState(DEFAULTS.showName);
  const [topic, setTopic] = useState(DEFAULTS.topic);
  const [guest, setGuest] = useState(DEFAULTS.guest);
  const [audience, setAudience] = useState(DEFAULTS.audience);
  const [formatId, setFormatId] = useState(DEFAULTS.formatId);
  const [cta, setCta] = useState(DEFAULTS.cta);
  const [notes, setNotes] = useState(DEFAULTS.notes);
  const [runtimeMinutes, setRuntimeMinutes] = useState(DEFAULTS.runtimeMinutes);
  const [segmentCount, setSegmentCount] = useState(DEFAULTS.segmentCount);
  const [questionsPerSegment, setQuestionsPerSegment] = useState(
    DEFAULTS.questionsPerSegment,
  );
  const [includeColdOpen, setIncludeColdOpen] = useState(DEFAULTS.includeColdOpen);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const plan = planEpisode({
      runtimeMinutes,
      segmentCount,
      questionsPerSegment,
      includeColdOpen,
    });
    if (plan.error) return plan;
    return buildEpisodePrompt({
      showName,
      topic,
      guest,
      audience,
      formatId,
      cta,
      notes,
      plan,
    });
  }, [
    showName,
    topic,
    guest,
    audience,
    formatId,
    cta,
    notes,
    runtimeMinutes,
    segmentCount,
    questionsPerSegment,
    includeColdOpen,
  ]);

  const hasError = Boolean(result.error);
  const plan = hasError ? null : result.plan;

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setShowName(DEFAULTS.showName);
    setTopic(DEFAULTS.topic);
    setGuest(DEFAULTS.guest);
    setAudience(DEFAULTS.audience);
    setFormatId(DEFAULTS.formatId);
    setCta(DEFAULTS.cta);
    setNotes(DEFAULTS.notes);
    setRuntimeMinutes(DEFAULTS.runtimeMinutes);
    setSegmentCount(DEFAULTS.segmentCount);
    setQuestionsPerSegment(DEFAULTS.questionsPerSegment);
    setIncludeColdOpen(DEFAULTS.includeColdOpen);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Cold open", DASH],
        ["Intro", DASH],
        ["Segments", DASH],
        ["Time per question", DASH],
        ["Outro", DASH],
        ["Prompt length", DASH],
      ]
    : [
        [
          "Cold open",
          plan.coldOpenSeconds > 0 ? `${plan.coldOpenSeconds} seconds` : "Skipped",
        ],
        ["Intro", `${plan.introSeconds} seconds`],
        [
          "Segments",
          `${plan.segments} × ${formatTime(plan.segmentSecondsEach)}`,
        ],
        [
          "Time per question",
          plan.questionsPerSegment > 0
            ? `${plan.minutesPerQuestion.toFixed(1)} min (${plan.totalQuestions} questions total)`
            : "No question plan",
        ],
        ["Outro", `${plan.outroSeconds} seconds, starting ${plan.outroStartLabel}`],
        [
          "Prompt length",
          `${NUM.format(result.words)} words · ~${NUM.format(result.approxTokens)} tokens`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Mic className="h-4 w-4" aria-hidden="true" />
          AI Writing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Podcast Outline Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Splits your episode runtime into timed blocks — cold open, intro,
          segments and outro — checks each planned question gets a realistic
          2–3 minutes, and writes the outline prompt around that plan.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-show">
              Show name
            </label>
            <input
              id="pc-show"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={showName}
              onChange={(event) => setShowName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-guest">
              Guest (optional)
            </label>
            <input
              id="pc-guest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={guest}
              onChange={(event) => setGuest(event.target.value)}
              placeholder="e.g. Jane Doe, CTO at Acme"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pc-topic">
              Episode topic
            </label>
            <input
              id="pc-topic"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-audience">
              Who is listening
            </label>
            <input
              id="pc-audience"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-format">
              Format
            </label>
            <select
              id="pc-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={formatId}
              onChange={(event) => setFormatId(event.target.value)}
            >
              {FORMATS.map((format) => (
                <option key={format.id} value={format.id}>
                  {format.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-runtime">
              Runtime (minutes)
            </label>
            <input
              id="pc-runtime"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.runtimeMinutes.min}
              max={LIMITS.runtimeMinutes.max}
              step="5"
              value={runtimeMinutes}
              onChange={(event) => setRuntimeMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-segments">
              Segments
            </label>
            <input
              id="pc-segments"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.segments.min}
              max={LIMITS.segments.max}
              value={segmentCount}
              onChange={(event) => setSegmentCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-questions">
              Questions per segment
            </label>
            <input
              id="pc-questions"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.questionsPerSegment.min}
              max={LIMITS.questionsPerSegment.max}
              value={questionsPerSegment}
              onChange={(event) => setQuestionsPerSegment(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-cta">
              Outro CTA (optional)
            </label>
            <input
              id="pc-cta"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={cta}
              onChange={(event) => setCta(event.target.value)}
              placeholder="e.g. join the newsletter at…"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pc-notes">
              Extra instruction for the model (optional)
            </label>
            <input
              id="pc-notes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. keep one segment for listener questions"
            />
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
          htmlFor="pc-coldopen"
        >
          <input
            id="pc-coldopen"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={includeColdOpen}
            onChange={(event) => setIncludeColdOpen(event.target.checked)}
          />
          Start with a 45-second cold-open teaser clip
        </label>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      {!hasError && plan.warnings.length > 0 ? (
        <ul className="mt-6 space-y-2">
          {plan.warnings.map((warning) => (
            <li
              key={warning}
              className="rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
            >
              {warning}
            </li>
          ))}
        </ul>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Episode plan
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${plan.minutes} min`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `About ${NUM.format(plan.approxSpokenWords)} spoken words at 150 words per minute.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated episode outline prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4 py-2.5"
            >
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Generated prompt
          </h2>
          <div className="mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
            <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-[var(--foreground)]">
              {hasError ? DASH : result.text}
            </pre>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The 45-second cold open, 60-second intro, 90-second outro and 2–3
        minutes per interview question are production rules of thumb at a
        150-words-per-minute speaking pace — real episodes breathe around them.
      </p>
    </main>
  );
}
