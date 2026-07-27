"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Target, Trash2 } from "lucide-react";

import { planSmartGoal } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_MILESTONES = [
  { id: "m1", title: "Pricing page rewritten and live", done: true },
  { id: "m2", title: "Onboarding email series shipped", done: true },
  { id: "m3", title: "Referral loop released", done: false },
];

const DEFAULTS = {
  statement: "Grow paying customers on the self-serve plan from 120 to 300",
  metric: "paying customers",
  baseline: "120",
  target: "300",
  current: "186",
  provenRatePerDay: "1.2",
  relevance: "Feeds the FY27 revenue plan, which needs 300 self-serve accounts by July.",
  startDate: "2026-01-01",
  dueDate: "2026-06-30",
  asOfDate: "2026-03-31",
};

const DASH = "—";

const num = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const pct = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [milestones, setMilestones] = useState(DEFAULT_MILESTONES);
  const [nextId, setNextId] = useState(4);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const result = useMemo(
    () => planSmartGoal({ ...form, milestones }),
    [form, milestones],
  );

  const hasError = Boolean(result.error);

  const addMilestone = () => {
    const id = `m${nextId}`;
    setNextId((value) => value + 1);
    setMilestones((list) => [...list, { id, title: "", done: false }]);
  };

  const updateMilestone = (id, patch) =>
    setMilestones((list) => list.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const removeMilestone = (id) =>
    setMilestones((list) => list.filter((item) => item.id !== id));

  const copyResult = async () => {
    if (hasError) return;
    const lines = [
      result.statement,
      `SMART score: ${result.smartScore}/100`,
      `Progress: ${result.progressPct}% of the way, ${result.timeElapsedPct}% of the time used`,
      `Status: ${result.status}`,
      `Needs ${result.requiredRatePerDayMagnitude ?? DASH} ${result.metric} per day for ${result.daysRemaining} days`,
      `Milestones done: ${result.milestones.done}/${result.milestones.total}`,
      ...result.criteria.map((item) => `${item.label}: ${item.points}/20 — ${item.note}`),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setMilestones(DEFAULT_MILESTONES);
    setNextId(4);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Target className="h-4 w-4" aria-hidden="true" />
          Goal setting
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">SMART Goal Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Score a goal against all five SMART criteria, then see whether the pace you are actually
          holding will land it by the deadline.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="sgp-statement">
              Goal statement
            </label>
            <textarea
              id="sgp-statement"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={2}
              value={form.statement}
              onChange={setField("statement")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sgp-relevance">
              Why it matters (the objective it serves)
            </label>
            <textarea
              id="sgp-relevance"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={2}
              value={form.relevance}
              onChange={setField("relevance")}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="sgp-metric">
                Metric being counted
              </label>
              <input
                id="sgp-metric"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={form.metric}
                onChange={setField("metric")}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="sgp-baseline">
                Baseline at start
              </label>
              <input
                id="sgp-baseline"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                value={form.baseline}
                onChange={setField("baseline")}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="sgp-target">
                Target
              </label>
              <input
                id="sgp-target"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                value={form.target}
                onChange={setField("target")}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="sgp-current">
                Current value
              </label>
              <input
                id="sgp-current"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                value={form.current}
                onChange={setField("current")}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="sgp-proven">
                Proven rate per day
              </label>
              <input
                id="sgp-proven"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                step="0.1"
                value={form.provenRatePerDay}
                onChange={setField("provenRatePerDay")}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="sgp-start">
                Start date
              </label>
              <input
                id="sgp-start"
                className={`mt-2 ${INPUT_CLASS}`}
                type="date"
                value={form.startDate}
                onChange={setField("startDate")}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="sgp-due">
                Due date
              </label>
              <input
                id="sgp-due"
                className={`mt-2 ${INPUT_CLASS}`}
                type="date"
                value={form.dueDate}
                onChange={setField("dueDate")}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="sgp-asof">
                Reading taken on
              </label>
              <input
                id="sgp-asof"
                className={`mt-2 ${INPUT_CLASS}`}
                type="date"
                value={form.asOfDate}
                onChange={setField("asOfDate")}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Milestones</h2>
          <button type="button" onClick={addMilestone} className={GHOST_BTN} aria-label="Add a milestone">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add milestone
          </button>
        </div>
        <div className="mt-4 grid gap-3">
          {milestones.map((milestone, index) => (
            <div
              key={milestone.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
            >
              <label className={LABEL_CLASS} htmlFor={`sgp-ms-${milestone.id}`}>
                Milestone {index + 1}
              </label>
              <input
                id={`sgp-ms-${milestone.id}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={milestone.title}
                onChange={(event) => updateMilestone(milestone.id, { title: event.target.value })}
              />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <label
                  className="flex min-h-11 items-center gap-3 text-sm"
                  htmlFor={`sgp-done-${milestone.id}`}
                >
                  <input
                    id={`sgp-done-${milestone.id}`}
                    type="checkbox"
                    className="h-5 w-5 accent-[var(--primary)]"
                    checked={Boolean(milestone.done)}
                    onChange={(event) => updateMilestone(milestone.id, { done: event.target.checked })}
                  />
                  Done
                </label>
                <button
                  type="button"
                  onClick={() => removeMilestone(milestone.id)}
                  aria-label={`Remove milestone ${index + 1}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
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
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              SMART score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
              {hasError ? DASH : result.smartScore}
              <span className="ml-1 text-xl font-medium text-[var(--muted-foreground)]">/100</span>
            </p>
            <p className="mt-1 text-sm font-semibold">
              {hasError ? DASH : `${result.status} · ${pct.format(result.progressPct)}% complete`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the goal plan"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the planner" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Time used", hasError ? DASH : `${pct.format(result.timeElapsedPct)}%`],
            [
              "Days left",
              hasError ? DASH : `${result.daysRemaining} of ${result.totalDays}`,
            ],
            [
              "Still to go",
              hasError ? DASH : `${num.format(result.remainingAmountMagnitude)} ${result.metric}`,
            ],
            [
              "Pace needed",
              hasError || result.requiredRatePerDayMagnitude === null
                ? DASH
                : `${num.format(result.requiredRatePerDayMagnitude)} / day`,
            ],
            [
              "Pace held so far",
              hasError || result.observedRatePerDayMagnitude === null
                ? DASH
                : `${num.format(result.observedRatePerDayMagnitude)} / day`,
            ],
            [
              "Projected at deadline",
              hasError
                ? DASH
                : `${num.format(result.projectedValue)} (${pct.format(result.projectedProgressPct)}%)`,
            ],
            ["Lands on, at this pace", hasError ? DASH : result.forecastDate || "Not at this pace"],
            [
              "Milestones",
              hasError
                ? DASH
                : `${result.milestones.done}/${result.milestones.total} (${pct.format(result.milestones.percent)}%)`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">SMART breakdown</h2>
          <ul className="mt-3 grid gap-3">
            {result.criteria.map((item) => (
              <li
                key={item.key}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold">{item.label}</span>
                  <span
                    className={`text-sm font-semibold ${
                      item.points === 20 ? "text-[var(--success)]" : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {item.points}/20
                  </span>
                </div>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{item.note}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Achievability is judged against the rate you have already proven, not against optimism. If
        the plan needs more than twice that rate, change the target, the date or the resources.
      </p>
    </main>
  );
}
