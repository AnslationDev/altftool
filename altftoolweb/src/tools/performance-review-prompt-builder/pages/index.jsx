"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardList, Copy, RotateCcw } from "lucide-react";

import {
  FRAMEWORKS,
  GOAL_MAX,
  GOAL_MIN,
  RATING_SCALES,
  REVIEW_PERIODS,
  REVIEW_TYPES,
  buildPerformanceReviewPrompt,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const WARN_CLASS =
  "mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]";

const DEFAULTS = {
  personRole: "Senior Support Engineer",
  reviewType: REVIEW_TYPES[0],
  period: "Annual",
  periodLabel: "April 2025 to March 2026",
  framework: "STAR",
  ratingScale: "4point",
  context: "Took over the escalations queue mid-year after a team reshuffle",
  strengthsRaw:
    "Cut median first-response time from 9 hours to 4 hours in Q2\nResolved 340 tickets in H2 with a 4.6 CSAT\nMentored two new hires through onboarding in September",
  growthRaw: "Escalates late on ambiguous billing issues\nWriting in customer replies is often unclear",
  goalsRaw:
    "Hold median first response under 4 hours every quarter\nPublish 6 troubleshooting articles by December\nLead one incident review per quarter",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(() => buildPerformanceReviewPrompt(form), [form]);
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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          Performance review
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Performance Review Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste your rough notes. Each line is scored for a measurable result, a timeframe and a
          concrete action, then folded into a STAR or SBI prompt that refuses to invent evidence.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-role">
              Role being reviewed
            </label>
            <input
              id="pr-role"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.personRole}
              onChange={set("personRole")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-type">
              Review type
            </label>
            <select
              id="pr-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.reviewType}
              onChange={set("reviewType")}
            >
              {REVIEW_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-period">
              Cycle
            </label>
            <select
              id="pr-period"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.period}
              onChange={set("period")}
            >
              {REVIEW_PERIODS.map((period) => (
                <option key={period} value={period}>
                  {period}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-period-label">
              Period dates
            </label>
            <input
              id="pr-period-label"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.periodLabel}
              onChange={set("periodLabel")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-framework">
              Framework
            </label>
            <select
              id="pr-framework"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.framework}
              onChange={set("framework")}
            >
              {FRAMEWORKS.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-scale">
              Rating scale
            </label>
            <select
              id="pr-scale"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.ratingScale}
              onChange={set("ratingScale")}
            >
              {RATING_SCALES.map((entry) => (
                <option key={entry.key} value={entry.key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pr-context">
              Context the reader needs (optional)
            </label>
            <input
              id="pr-context"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.context}
              onChange={set("context")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pr-strengths">
              What went well (one note per line)
            </label>
            <textarea
              id="pr-strengths"
              className={`mt-2 ${AREA_CLASS}`}
              rows={5}
              value={form.strengthsRaw}
              onChange={set("strengthsRaw")}
            />
            <p className={HINT_CLASS}>
              A note scores full marks when it has a number, a date or quarter, and an action verb.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pr-growth">
              Where growth is needed (one note per line)
            </label>
            <textarea
              id="pr-growth"
              className={`mt-2 ${AREA_CLASS}`}
              rows={4}
              value={form.growthRaw}
              onChange={set("growthRaw")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pr-goals">
              Goals for next cycle (one per line)
            </label>
            <textarea
              id="pr-goals"
              className={`mt-2 ${AREA_CLASS}`}
              rows={4}
              value={form.goalsRaw}
              onChange={set("goalsRaw")}
            />
            <p className={HINT_CLASS}>
              {GOAL_MIN} to {GOAL_MAX} goals is the workable range for one cycle.
            </p>
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
              Evidence score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.overall.meanScore)} / 100`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : `${result.overall.band} — ${result.overall.advice}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              disabled={hasError}
              aria-label="Copy the generated performance review prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Notes scored", hasError ? DASH : NUM.format(result.totalNotes)],
            [
              "Notes with a measurable result",
              hasError ? DASH : `${NUM.format(result.overall.withResult)} of ${NUM.format(result.totalNotes)}`,
            ],
            [
              "Notes with a timeframe",
              hasError ? DASH : `${NUM.format(result.overall.withTimeframe)} of ${NUM.format(result.totalNotes)}`,
            ],
            [
              "Notes with an action verb",
              hasError ? DASH : `${NUM.format(result.overall.withAction)} of ${NUM.format(result.totalNotes)}`,
            ],
            ["Strengths score", hasError ? DASH : `${NUM.format(result.strengthSummary.meanScore)} / 100`],
            [
              "Development notes score",
              hasError || result.growth.length === 0
                ? DASH
                : `${NUM.format(result.growthSummary.meanScore)} / 100`,
            ],
            ["Goals supplied", hasError ? DASH : NUM.format(result.goals.length)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.balanceWarning ? (
        <p className={WARN_CLASS}>{result.balanceWarning}</p>
      ) : null}
      {!hasError && result.goalWarning ? <p className={WARN_CLASS}>{result.goalWarning}</p> : null}

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Note-by-note evidence check</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Note</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Score</th>
                  <th scope="col" className="py-2 font-semibold">Missing</th>
                </tr>
              </thead>
              <tbody>
                {result.overall.items.map((item, index) => (
                  <tr
                    key={`${index}-${item.text}`}
                    className="border-b border-[var(--border)] align-top last:border-0"
                  >
                    <td className="py-2 pr-3">{item.text}</td>
                    <td
                      className={`py-2 pr-3 text-right font-semibold ${
                        item.score >= 50 ? "text-[var(--success)]" : "text-[var(--danger)]"
                      }`}
                    >
                      {NUM.format(item.score)}
                    </td>
                    <td className="py-2 text-[var(--muted-foreground)]">
                      {item.missing.length === 0 ? "Nothing" : item.missing.join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your prompt</h2>
          <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-3 text-xs leading-5 text-[var(--foreground)]">
            {result.prompt}
          </pre>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Performance documentation can become evidence in an employment dispute,
        and record-keeping duties differ by country. Nothing here is entered or stored anywhere —
        everything runs in your browser. Check formal wording with your HR team before filing it.
      </p>
    </main>
  );
}
