"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MessageSquareQuote, RotateCcw } from "lucide-react";

import {
  CHANNELS,
  FOCUS_AREAS,
  MAX_COMFORTABLE_QUESTIONS,
  MIN_POLITE_DEADLINE_DAYS,
  TONES,
  buildTestimonialRequest,
  toPlainText,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const SELECT_CLASS = INPUT_CLASS;
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  clientName: "Priya Menon",
  senderName: "Arjun Rao",
  projectName: "the Q3 website rebuild",
  outcome: "checkout drop-off fell by 22%",
  channel: "email",
  tone: "warm",
  focuses: ["problem", "result", "recommend"],
  deadlineDays: "7",
  offerDraft: true,
  allowVideo: false,
};

/** Today as yyyy-mm-dd in the browser's local timezone, computed once per mount. */
function localToday() {
  const now = new Date();
  const yyyy = String(now.getFullYear()).padStart(4, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const DASH = "—";

export default function ToolHome() {
  const [clientName, setClientName] = useState(DEFAULTS.clientName);
  const [senderName, setSenderName] = useState(DEFAULTS.senderName);
  const [projectName, setProjectName] = useState(DEFAULTS.projectName);
  const [outcome, setOutcome] = useState(DEFAULTS.outcome);
  const [channel, setChannel] = useState(DEFAULTS.channel);
  const [tone, setTone] = useState(DEFAULTS.tone);
  const [focuses, setFocuses] = useState(DEFAULTS.focuses);
  const [deadlineDays, setDeadlineDays] = useState(DEFAULTS.deadlineDays);
  const [offerDraft, setOfferDraft] = useState(DEFAULTS.offerDraft);
  const [allowVideo, setAllowVideo] = useState(DEFAULTS.allowVideo);
  const [today] = useState(localToday);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildTestimonialRequest({
        clientName,
        senderName,
        projectName,
        outcome,
        channel,
        tone,
        focuses,
        deadlineDays: deadlineDays === "" ? 0 : Number(deadlineDays),
        todayIso: today,
        offerDraft,
        allowVideo,
      }),
    [clientName, senderName, projectName, outcome, channel, tone, focuses, deadlineDays, today, offerDraft, allowVideo],
  );

  const plainText = useMemo(() => toPlainText(result), [result]);
  const hasError = Boolean(result.error);

  const toggleFocus = (id) => {
    setFocuses((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const copyResult = async () => {
    if (!plainText) return;
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setClientName(DEFAULTS.clientName);
    setSenderName(DEFAULTS.senderName);
    setProjectName(DEFAULTS.projectName);
    setOutcome(DEFAULTS.outcome);
    setChannel(DEFAULTS.channel);
    setTone(DEFAULTS.tone);
    setFocuses(DEFAULTS.focuses);
    setDeadlineDays(DEFAULTS.deadlineDays);
    setOfferDraft(DEFAULTS.offerDraft);
    setAllowVideo(DEFAULTS.allowVideo);
    setCopied(false);
  };

  const stats = hasError
    ? [
        ["Channel", DASH],
        ["Questions asked", DASH],
        ["Length", DASH],
        ["Reading time", DASH],
        ["Reply by", DASH],
      ]
    : [
        ["Channel", result.channelLabel],
        ["Questions asked", String(result.questions.length)],
        [
          "Length",
          result.channel === "sms"
            ? `${result.chars} characters · ${result.segments} SMS segment${result.segments === 1 ? "" : "s"}`
            : `${result.chars} characters · ${result.words} words`,
        ],
        ["Reading time", `${result.readSeconds} seconds`],
        ["Reply by", result.deadlineLabel || "No deadline set"],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MessageSquareQuote className="h-4 w-4" aria-hidden="true" />
          Testimonial outreach
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Testimonial Request Message Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn a vague &ldquo;could you write me a review?&rdquo; into a specific, two-minute ask.
          Pick the questions, the channel and the reply-by date, and get a message that is already
          within the length limits of email, WhatsApp, LinkedIn or SMS.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="trm-client">
              Client&apos;s name
            </label>
            <input
              id="trm-client"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={clientName}
              onChange={(event) => setClientName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="trm-sender">
              Your name (sign-off)
            </label>
            <input
              id="trm-sender"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={senderName}
              onChange={(event) => setSenderName(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="trm-project">
              Project or service
            </label>
            <input
              id="trm-project"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="trm-outcome">
              Result you want them to remember (optional)
            </label>
            <input
              id="trm-outcome"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="checkout drop-off fell by 22%"
              value={outcome}
              onChange={(event) => setOutcome(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="trm-channel">
              Send it on
            </label>
            <select
              id="trm-channel"
              className={`mt-2 ${SELECT_CLASS}`}
              value={channel}
              onChange={(event) => setChannel(event.target.value)}
            >
              {Object.values(CHANNELS).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="trm-tone">
              Tone
            </label>
            <select
              id="trm-tone"
              className={`mt-2 ${SELECT_CLASS}`}
              value={tone}
              onChange={(event) => setTone(event.target.value)}
            >
              {Object.values(TONES).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="trm-deadline">
              Ask for a reply within (days, 0 = none)
            </label>
            <input
              id="trm-deadline"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="90"
              step="1"
              value={deadlineDays}
              onChange={(event) => setDeadlineDays(event.target.value)}
            />
          </div>
          <div className="flex flex-col justify-end gap-2">
            <label className="flex min-h-11 items-center gap-2 text-sm" htmlFor="trm-draft">
              <input
                id="trm-draft"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={offerDraft}
                onChange={(event) => setOfferDraft(event.target.checked)}
              />
              Offer to write the first draft for them
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm" htmlFor="trm-video">
              <input
                id="trm-video"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={allowVideo}
                onChange={(event) => setAllowVideo(event.target.checked)}
              />
              Offer a 30-second video instead
            </label>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Questions to include
          </legend>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Keep it to {MAX_COMFORTABLE_QUESTIONS} or fewer — longer asks get postponed, then
            forgotten.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {FOCUS_AREAS.map((focus) => {
              const active = focuses.includes(focus.id);
              return (
                <label
                  key={focus.id}
                  htmlFor={`trm-focus-${focus.id}`}
                  className={`flex min-h-11 cursor-pointer items-start gap-2 rounded-md border p-3 text-sm transition ${
                    active
                      ? "border-[var(--primary)] bg-[var(--muted)]"
                      : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <input
                    id={`trm-focus-${focus.id}`}
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
                    checked={active}
                    onChange={() => toggleFocus(focus.id)}
                  />
                  <span>
                    <span className="font-semibold">{focus.label}</span>
                    <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                      {focus.question}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Estimated time to answer
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.readSeconds}s read`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the highlighted problem to generate the message."
                : `${result.questions.length} question${result.questions.length === 1 ? "" : "s"} · ${result.chars} characters on ${result.channelLabel}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the testimonial request message"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy message"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {stats.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-4 space-y-2">
            {result.subjectTruncated && (
              <p className="rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
                Subject line is {result.subjectChars} characters. Inboxes typically show about the
                first {result.subjectLimit} — the key words should come early.
              </p>
            )}
            {result.tooManyQuestions && (
              <p className="rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
                You are asking {result.questions.length} questions. Dropping one usually gets a
                faster reply than chasing this message twice.
              </p>
            )}
            {result.rushedDeadline && (
              <p className="rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
                A reply window under {MIN_POLITE_DEADLINE_DAYS} days reads as pressure. Seven days is
                the usual sweet spot.
              </p>
            )}
            {result.droppedQuestions > 0 && (
              <p className="rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
                SMS keeps one question only, so {result.droppedQuestions} question
                {result.droppedQuestions === 1 ? " was" : "s were"} left out. Send the rest by email
                once they reply.
              </p>
            )}
            {result.overLimit && (
              <p className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-xs font-medium text-[var(--danger)]">
                This draft is longer than the {result.maxChars}-character limit for{" "}
                {result.channelLabel}. Remove a question or shorten the project name.
              </p>
            )}
          </div>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your message</h2>
          {result.subject && (
            <p className="mt-3 text-sm">
              <span className="text-[var(--muted-foreground)]">Subject: </span>
              <span className="font-semibold">{result.subject}</span>
            </p>
          )}
          <div className="mt-3 overflow-x-auto">
            <pre className="min-w-0 whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-4 text-sm leading-6 text-[var(--foreground)]">
              {result.body}
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Always get written permission before publishing a client&apos;s name, company or words, and
        send the final wording back for approval first. Some industries — finance, healthcare and
        legal among them — restrict what a testimonial may claim; check your regulator&apos;s rules
        before you publish.
      </p>
    </main>
  );
}
