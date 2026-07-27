"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MessageSquare, RotateCcw, TriangleAlert } from "lucide-react";

import {
  MAX_BULLETS,
  MAX_WORDS_PER_BULLET,
  MIN_BULLETS,
  MIN_WORDS_PER_BULLET,
  OUTPUT_FORMATS,
  SLACK_MESSAGE_MAX_CHARS,
  TASK_TYPES,
  TONES,
  buildSlackPrompt,
} from "../lib";

const COUNT = new Intl.NumberFormat("en-US");
const DASH = "—";

const DEFAULTS = {
  channel: "#q1-launch-plan",
  topic: "Whether to delay the pricing page launch to after the sales kickoff.",
  participants: "priya, dev, sam, aarti",
  messageCount: "64",
  timeWindow: "12-18 March",
  taskId: "decision-log",
  audience: "The leadership weekly, none of whom read the thread.",
  outputFormat: "thread-reply",
  bulletCount: "8",
  wordsPerBullet: "18",
  toneId: "exec",
  useMrkdwn: true,
  keepNames: true,
  extraContext: "",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) => {
    const { value } = event.target;
    setForm((previous) => ({ ...previous, [key]: value }));
  };
  const setToggle = (key) => (event) => {
    const { checked } = event.target;
    setForm((previous) => ({ ...previous, [key]: checked }));
  };

  const result = useMemo(() => buildSlackPrompt(form), [form]);
  const hasError = Boolean(result.error);

  const copyPrompt = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Channel Slack would use", DASH],
        ["Estimated words", DASH],
        ["Estimated characters", DASH],
        ["Fits one Slack message", DASH],
        ["Section blocks needed", DASH],
        ["People named", DASH],
      ]
    : [
        ["Channel Slack would use", `#${result.channelName}`],
        ["Estimated words", COUNT.format(result.plan.estimatedWords)],
        ["Estimated characters", COUNT.format(result.plan.estimatedChars)],
        [
          "Fits one Slack message",
          result.plan.fitsOneMessage
            ? `Yes, limit is ${COUNT.format(SLACK_MESSAGE_MAX_CHARS)}`
            : `No, over ${COUNT.format(SLACK_MESSAGE_MAX_CHARS)}`,
        ],
        ["Section blocks needed", COUNT.format(result.plan.sectionBlocksNeeded)],
        ["People named", COUNT.format(result.participantCount)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          Slack summaries
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Slack AI Prompt Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Ask for a thread summary, a channel recap or a clean list of action items — with fixed
          headings, a length you choose, and a check that the answer will actually fit in a Slack
          message or a Block Kit section.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sl-channel">
              Channel
            </label>
            <input
              id="sl-channel"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.channel}
              onChange={setField("channel")}
            />
            <p className={HINT_CLASS}>Lowercase, no spaces or periods, max 80 characters.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sl-window">
              Time window
            </label>
            <input
              id="sl-window"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.timeWindow}
              onChange={setField("timeWindow")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sl-messages">
              How many messages?
            </label>
            <input
              id="sl-messages"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={form.messageCount}
              onChange={setField("messageCount")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sl-task">
              What should it produce?
            </label>
            <select id="sl-task" className={`mt-2 ${INPUT_CLASS}`} value={form.taskId} onChange={setField("taskId")}>
              {TASK_TYPES.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="sl-topic">
            What is the conversation about?
          </label>
          <textarea
            id="sl-topic"
            className={`mt-2 ${TEXTAREA_CLASS}`}
            rows={2}
            value={form.topic}
            onChange={setField("topic")}
          />
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="sl-audience">
            Who reads the summary?
          </label>
          <textarea
            id="sl-audience"
            className={`mt-2 ${TEXTAREA_CLASS}`}
            rows={2}
            value={form.audience}
            onChange={setField("audience")}
          />
          <p className={HINT_CLASS}>This is what decides which details get cut.</p>
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="sl-people">
            People in the conversation
          </label>
          <textarea
            id="sl-people"
            className={`mt-2 ${TEXTAREA_CLASS}`}
            rows={2}
            value={form.participants}
            onChange={setField("participants")}
          />
          <p className={HINT_CLASS}>Commas or new lines. Needed to attribute decisions.</p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sl-bullets">
              Total bullet points
            </label>
            <input
              id="sl-bullets"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_BULLETS}
              max={MAX_BULLETS}
              step="1"
              value={form.bulletCount}
              onChange={setField("bulletCount")}
            />
            <p className={HINT_CLASS}>
              {MIN_BULLETS}&ndash;{MAX_BULLETS}
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sl-words">
              Words per bullet
            </label>
            <input
              id="sl-words"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_WORDS_PER_BULLET}
              max={MAX_WORDS_PER_BULLET}
              step="1"
              value={form.wordsPerBullet}
              onChange={setField("wordsPerBullet")}
            />
            <p className={HINT_CLASS}>
              {MIN_WORDS_PER_BULLET}&ndash;{MAX_WORDS_PER_BULLET}
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sl-format">
              Where does it get posted?
            </label>
            <select
              id="sl-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.outputFormat}
              onChange={setField("outputFormat")}
            >
              {OUTPUT_FORMATS.map((format) => (
                <option key={format.id} value={format.id}>
                  {format.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sl-tone">
              Tone
            </label>
            <select id="sl-tone" className={`mt-2 ${INPUT_CLASS}`} value={form.toneId} onChange={setField("toneId")}>
              {TONES.map((tone) => (
                <option key={tone.id} value={tone.id}>
                  {tone.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className={CHECK_ROW} htmlFor="sl-mrkdwn">
            <input
              id="sl-mrkdwn"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={form.useMrkdwn}
              onChange={setToggle("useMrkdwn")}
            />
            <span className="text-sm font-medium">Use Slack mrkdwn formatting</span>
          </label>
          <label className={CHECK_ROW} htmlFor="sl-names">
            <input
              id="sl-names"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={form.keepNames}
              onChange={setToggle("keepNames")}
            />
            <span className="text-sm font-medium">Keep real names and mentions</span>
          </label>
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="sl-context">
            Extra context (optional)
          </label>
          <textarea
            id="sl-context"
            className={`mt-2 ${TEXTAREA_CLASS}`}
            rows={2}
            value={form.extraContext}
            onChange={setField("extraContext")}
            placeholder="Legal already signed off on the copy. The launch date is contractual."
          />
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Requested length
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${COUNT.format(result.plan.estimatedWords)} words`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input below to build the prompt"
                : `${COUNT.format(result.plan.bullets)} bullets across ${COUNT.format(result.plan.sections)} headings`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              disabled={hasError}
              aria-label="Copy the generated Slack prompt"
              className={`${GHOST_BTN} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {hasError ? (
          <p
            role="alert"
            className="mt-5 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.warnings.length > 0 ? (
          <ul className="mt-5 space-y-2">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="flex gap-2 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
              >
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your prompt</h2>
          <div className="mt-3 overflow-x-auto">
            <pre className="min-w-full whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-4 text-sm leading-6 text-[var(--foreground)]">
              {result.prompt}
            </pre>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Nothing you type is uploaded — the prompt is assembled in your browser. Paste your Slack
        messages into your assistant yourself, and check your workspace policy before putting
        internal conversations into an external AI tool.
      </p>
    </main>
  );
}
