"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileUser, RotateCcw } from "lucide-react";

import { SENIORITY_OPTIONS, TASKS, TONE_OPTIONS, buildResumePrompt } from "../lib";

const NUM = new Intl.NumberFormat("en-US");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  taskId: "bullets",
  role: "Data Analyst",
  seniorityId: "mid",
  industry: "fintech",
  toneId: "impact",
  metrics: "Cut monthly reporting time from 3 days to 4 hours; owned dashboards used by 120 people",
  keywords: "SQL, Python, dbt, Tableau, A/B testing",
  hasJobDescription: false,
};

const DASH = "—";

export default function ToolHome() {
  const [taskId, setTaskId] = useState(DEFAULTS.taskId);
  const [role, setRole] = useState(DEFAULTS.role);
  const [seniorityId, setSeniorityId] = useState(DEFAULTS.seniorityId);
  const [industry, setIndustry] = useState(DEFAULTS.industry);
  const [toneId, setToneId] = useState(DEFAULTS.toneId);
  const [metrics, setMetrics] = useState(DEFAULTS.metrics);
  const [keywords, setKeywords] = useState(DEFAULTS.keywords);
  const [hasJobDescription, setHasJobDescription] = useState(DEFAULTS.hasJobDescription);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildResumePrompt({
        taskId,
        role,
        seniorityId,
        industry,
        toneId,
        metrics,
        keywords,
        hasJobDescription,
      }),
    [taskId, role, seniorityId, industry, toneId, metrics, keywords, hasJobDescription],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
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
    setTaskId(DEFAULTS.taskId);
    setRole(DEFAULTS.role);
    setSeniorityId(DEFAULTS.seniorityId);
    setIndustry(DEFAULTS.industry);
    setToneId(DEFAULTS.toneId);
    setMetrics(DEFAULTS.metrics);
    setKeywords(DEFAULTS.keywords);
    setHasJobDescription(DEFAULTS.hasJobDescription);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Task", DASH],
        ["Target role", DASH],
        ["Seniority framing", DASH],
        ["Tone", DASH],
        ["ATS keywords included", DASH],
      ]
    : [
        ["Task", result.taskLabel],
        ["Target role", result.targetRole],
        ["Seniority framing", result.seniorityLabel],
        ["Tone", result.toneLabel],
        ["ATS keywords included", NUM.format(result.keywordCount)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileUser className="h-4 w-4" aria-hidden="true" />
          Career Prompts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AI Resume Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Assemble a resume-rewriting prompt that names the target role, the seniority framing, the
          XYZ achievement formula and your real numbers — with a no-fabrication rule baked in.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rp-task">
              What should the AI do?
            </label>
            <select
              id="rp-task"
              className={`mt-2 ${INPUT_CLASS}`}
              value={taskId}
              onChange={(event) => setTaskId(event.target.value)}
            >
              {TASKS.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rp-role">
              Target role
            </label>
            <input
              id="rp-role"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              placeholder="e.g. Senior Product Manager"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rp-seniority">
              Seniority level
            </label>
            <select
              id="rp-seniority"
              className={`mt-2 ${INPUT_CLASS}`}
              value={seniorityId}
              onChange={(event) => setSeniorityId(event.target.value)}
            >
              {SENIORITY_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rp-industry">
              Industry (optional)
            </label>
            <input
              id="rp-industry"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={industry}
              onChange={(event) => setIndustry(event.target.value)}
              placeholder="e.g. healthcare, SaaS, public sector"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rp-tone">
              Tone
            </label>
            <select
              id="rp-tone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={toneId}
              onChange={(event) => setToneId(event.target.value)}
            >
              {TONE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rp-metrics">
              Real achievements and numbers to work in (optional)
            </label>
            <textarea
              id="rp-metrics"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={3}
              value={metrics}
              onChange={(event) => setMetrics(event.target.value)}
              placeholder="e.g. grew trial-to-paid conversion from 4% to 6.5% in two quarters"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rp-keywords">
              ATS keywords, comma separated (optional)
            </label>
            <textarea
              id="rp-keywords"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={2}
              value={keywords}
              onChange={(event) => setKeywords(event.target.value)}
              placeholder="Copy the exact terms used in the job description"
            />
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
          htmlFor="rp-jd"
        >
          <input
            id="rp-jd"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={hasJobDescription}
            onChange={(event) => setHasJobDescription(event.target.checked)}
          />
          I will paste the job description along with my resume (required for tailoring)
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
              Prompt length
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.wordCount)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a prompt." : "words in the generated prompt"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated resume prompt"
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

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Your prompt
          </p>
          <p className="mt-2 whitespace-pre-wrap rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6">
            {hasError ? DASH : result.prompt}
          </p>
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
        <h2 className="text-base font-semibold">Before you send it</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {(hasError ? [] : result.checklist).map((item) => (
            <li key={item} className="flex gap-2">
              <Check
                className="mt-1 h-4 w-4 shrink-0 text-[var(--success)]"
                aria-hidden="true"
              />
              <span>{item}</span>
            </li>
          ))}
          {hasError ? <li>{DASH}</li> : null}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The prompt tells the model never to invent employers, dates, titles or metrics, but the
        responsibility for accuracy stays with you. Read every line of the output before it goes to
        an employer.
      </p>
    </main>
  );
}
