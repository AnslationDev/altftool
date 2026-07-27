"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PhoneForwarded, RotateCcw } from "lucide-react";

import {
  DEFAULT_CONFIDENCE_THRESHOLD,
  DEFAULT_FAILED_ATTEMPTS,
  HOURS_OPTIONS,
  MAX_CONFIDENCE,
  MAX_FAILED_ATTEMPTS,
  MIN_CONFIDENCE,
  MIN_FAILED_ATTEMPTS,
  SENSITIVE_TOPIC_OPTIONS,
  buildEscalationPlan,
  planToMarkdown,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  failedAttempts: String(DEFAULT_FAILED_ATTEMPTS),
  confidenceThreshold: String(DEFAULT_CONFIDENCE_THRESHOLD),
  sentimentTrigger: true,
  highValueThreshold: "500",
  sensitiveTopicIds: ["safety", "billing-dispute", "account-security"],
  hoursId: "business-hours",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  const setBool = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.checked }));

  const toggleTopic = (topicId) => {
    setForm((prev) => ({
      ...prev,
      sensitiveTopicIds: prev.sensitiveTopicIds.includes(topicId)
        ? prev.sensitiveTopicIds.filter((id) => id !== topicId)
        : [...prev.sensitiveTopicIds, topicId],
    }));
  };

  const result = useMemo(
    () =>
      buildEscalationPlan({
        ...form,
        failedAttempts:
          form.failedAttempts.trim() === "" ? Number.NaN : Number(form.failedAttempts),
        confidenceThreshold:
          form.confidenceThreshold.trim() === "" ? Number.NaN : Number(form.confidenceThreshold),
        highValueThreshold:
          form.highValueThreshold.trim() === "" ? 0 : Number(form.highValueThreshold),
      }),
    [form],
  );
  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(planToMarkdown(result));
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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PhoneForwarded className="h-4 w-4" aria-hidden="true" />
          Chatbot Design
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Chatbot Escalation Rules Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Define exactly when your bot must hand a conversation to a human — built on the
          two-strikes repair convention, an NLU confidence floor and safety-first rule ordering.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="esc-attempts">
              Failed attempts before escalating ({MIN_FAILED_ATTEMPTS}–{MAX_FAILED_ATTEMPTS})
            </label>
            <input
              id="esc-attempts"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_FAILED_ATTEMPTS}
              max={MAX_FAILED_ATTEMPTS}
              step="1"
              value={form.failedAttempts}
              onChange={set("failedAttempts")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="esc-confidence">
              Intent confidence floor ({MIN_CONFIDENCE}–{MAX_CONFIDENCE})
            </label>
            <input
              id="esc-confidence"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={MIN_CONFIDENCE}
              max={MAX_CONFIDENCE}
              step="0.05"
              value={form.confidenceThreshold}
              onChange={set("confidenceThreshold")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="esc-value">
              High-value threshold (0 disables)
            </label>
            <input
              id="esc-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={form.highValueThreshold}
              onChange={set("highValueThreshold")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="esc-hours">
              Human agent availability
            </label>
            <select
              id="esc-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.hoursId}
              onChange={set("hoursId")}
            >
              {HOURS_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Sensitive topics that always escalate
          </legend>
          <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-6">
            {SENSITIVE_TOPIC_OPTIONS.map((topic) => (
              <label
                key={topic.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                htmlFor={`esc-topic-${topic.id}`}
              >
                <input
                  id={`esc-topic-${topic.id}`}
                  type="checkbox"
                  className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={topic.always || form.sensitiveTopicIds.includes(topic.id)}
                  disabled={topic.always}
                  onChange={() => toggleTopic(topic.id)}
                />
                {topic.label}
                {topic.always ? " (always on)" : ""}
              </label>
            ))}
          </div>
        </fieldset>

        <label
          className="mt-2 flex min-h-11 cursor-pointer items-center gap-3 text-sm"
          htmlFor="esc-sentiment"
        >
          <input
            id="esc-sentiment"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={form.sentimentTrigger}
            onChange={setBool("sentimentTrigger")}
          />
          Escalate on frustration / negative sentiment
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Escalation rules
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.ruleCount)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to generate the rule set."
                : `Evaluated top to bottom · ${result.hoursLabel.toLowerCase()}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the escalation rules as Markdown"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy as Markdown"}
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

        {hasError ? (
          <p className="mt-5 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        ) : (
          <ol className="mt-5 space-y-3">
            {result.rules.map((rule) => (
              <li
                key={rule.priority}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <p className="text-sm font-semibold">
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-bold text-[var(--primary)]">
                    {rule.priority}
                  </span>
                  {rule.trigger}
                </p>
                <dl className="mt-2 space-y-1 text-sm leading-6">
                  <div>
                    <dt className="inline font-semibold text-[var(--muted-foreground)]">When: </dt>
                    <dd className="inline">{rule.condition}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-[var(--muted-foreground)]">Then: </dt>
                    <dd className="inline">{rule.action}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ol>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Rules are ordered safety-first and evaluated top to bottom — the first matching rule wins.
        Tune the confidence floor to your NLU platform&apos;s scoring before going live.
      </p>
    </main>
  );
}
