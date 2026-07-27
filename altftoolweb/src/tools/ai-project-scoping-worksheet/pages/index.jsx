"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardList, Copy, RotateCcw } from "lucide-react";

import {
  OPTIONAL_FIELDS,
  REQUIRED_FIELDS,
  TIMELINE_MAX_WEEKS,
  TIMELINE_MIN_WEEKS,
  buildScopingDoc,
} from "../lib";

const PCT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-[5.5rem] w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_NAME = "Support ticket auto-triage";
const DEFAULT_TIMELINE = "8";
const DEFAULT_FIELDS = {
  problem:
    "Tier-1 agents spend the first four minutes of every ticket reading it and choosing a queue; mis-routed tickets bounce twice before reaching the right team.",
  users:
    "Tier-1 support agents route the output; end customers feel the delay when a ticket is mis-routed.",
  dataSources:
    "18 months of resolved Zendesk tickets with final queue labels, owned by the support ops team; no customer PII leaves our own tenancy.",
  successMetric: "Median first-response time on inbound tickets.",
  baseline: "Median first response is 46 minutes across Q2, measured from Zendesk reporting.",
  target: "Median first response under 25 minutes with routing accuracy at or above 90%.",
  fallback:
    "Below 70% model confidence the ticket goes to the existing manual queue; a feature flag turns routing off entirely in one click.",
  constraints:
    "Must stay inside our EU tenancy, respond in under two seconds, and support English and German.",
  owner: "Priya Nair, Head of Support Ops",
};

const EMPTY_FIELDS = Object.fromEntries(
  [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS].map((field) => [field.id, ""]),
);

export default function ToolHome() {
  const [projectName, setProjectName] = useState(DEFAULT_NAME);
  const [timelineWeeks, setTimelineWeeks] = useState(DEFAULT_TIMELINE);
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => buildScopingDoc({ projectName, fields, timelineWeeks }),
    [projectName, fields, timelineWeeks],
  );

  const hasError = Boolean(result.error);

  const setField = (id, value) => {
    setFields((previous) => ({ ...previous, [id]: value }));
  };

  const copyResult = async () => {
    if (hasError || !result.doc) return;
    try {
      await navigator.clipboard.writeText(result.doc);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setProjectName(DEFAULT_NAME);
    setTimelineWeeks(DEFAULT_TIMELINE);
    setFields(DEFAULT_FIELDS);
    setCopied(false);
  };

  const clearAll = () => {
    setProjectName("Untitled AI project");
    setTimelineWeeks("");
    setFields(EMPTY_FIELDS);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Core questions answered", DASH],
        ["Verdict", DASH],
        ["Still missing", DASH],
        ["Timeline to go/no-go", DASH],
      ]
    : [
        ["Core questions answered", `${result.answered} of ${result.requiredCount}`],
        ["Verdict", result.verdict.label],
        ["Still missing", result.missing.length ? result.missing.join(", ") : "Nothing"],
        [
          "Timeline to go/no-go",
          result.timeline === null
            ? "Not set"
            : `${result.timeline} week${result.timeline === 1 ? "" : "s"}`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          Scope before you build
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AI Project Scoping Worksheet
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Answer the seven questions every AI project needs settled before a line of code is
          written — problem, users, data, metric, baseline, target and fallback — and get a
          shareable scope document with a completeness score.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="scope-name">
              Project name
            </label>
            <input
              id="scope-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="scope-timeline">
              Weeks to a go/no-go decision (optional)
            </label>
            <input
              id="scope-timeline"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={TIMELINE_MIN_WEEKS}
              max={TIMELINE_MAX_WEEKS}
              step="1"
              value={timelineWeeks}
              onChange={(event) => setTimelineWeeks(event.target.value)}
            />
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">The seven core questions</h2>
        <div className="mt-3 grid gap-4">
          {REQUIRED_FIELDS.map((field) => (
            <div key={field.id}>
              <label className={LABEL_CLASS} htmlFor={`scope-${field.id}`}>
                {field.label}
              </label>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{field.hint}</p>
              <textarea
                id={`scope-${field.id}`}
                className={`mt-2 ${TEXTAREA_CLASS}`}
                value={fields[field.id] ?? ""}
                onChange={(event) => setField(field.id, event.target.value)}
              />
            </div>
          ))}
        </div>

        <h2 className="mt-6 text-base font-semibold">Optional context</h2>
        <div className="mt-3 grid gap-4">
          {OPTIONAL_FIELDS.map((field) => (
            <div key={field.id}>
              <label className={LABEL_CLASS} htmlFor={`scope-${field.id}`}>
                {field.label}
              </label>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{field.hint}</p>
              <textarea
                id={`scope-${field.id}`}
                className={`mt-2 ${TEXTAREA_CLASS}`}
                value={fields[field.id] ?? ""}
                onChange={(event) => setField(field.id, event.target.value)}
              />
            </div>
          ))}
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
              Scope completeness
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${PCT.format(result.completenessPct)}%`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a result." : result.verdict.advice}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the scoping document"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy document"}
            </button>
            <button
              type="button"
              onClick={clearAll}
              aria-label="Clear every answer and start from an empty worksheet"
              className={GHOST_BTN}
            >
              Start blank
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the worksheet to the example project"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Scope document</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Markdown you can paste straight into a ticket, wiki page or design doc. Unanswered
          questions are left in as explicit TBD lines rather than quietly dropped.
        </p>
        <div className="mt-3 overflow-x-auto">
          <pre className="min-w-full whitespace-pre-wrap break-words rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-xs leading-6 text-[var(--foreground)]">
            {hasError ? DASH : result.doc}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A scoping aid, not an assurance that the project will succeed. Data-protection, procurement
        and regulatory sign-off for an AI system should involve your legal and security teams before
        the pilot starts.
      </p>
    </main>
  );
}
