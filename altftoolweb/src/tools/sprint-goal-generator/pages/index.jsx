"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Flag, RotateCcw } from "lucide-react";

import { generateSprintGoal } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  sprintName: "Sprint 24",
  sprintLengthWeeks: "2",
  teamSize: "6",
  hoursPerDay: "6",
  focusFactor: "0.8",
  averageVelocity: "34",
  committedPoints: "32",
  outcome: "guest checkout completes on mobile without a login",
  beneficiary: "first-time buyers",
  metric: "mobile checkout completion rate",
  baseline: "41",
  target: "55",
  scopeIn: "Guest checkout API\nMobile payment sheet\nError states for declined cards",
  scopeOut: "Desktop checkout redesign\nLoyalty points at checkout",
  risks: "Payment gateway sandbox has been flaky\nOne Developer on call in week two",
};

const DASH = "—";

const num = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const result = useMemo(() => generateSprintGoal(form), [form]);
  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.markdown);
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
          <Flag className="h-4 w-4" aria-hidden="true" />
          Agile planning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Sprint Goal Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Write the one objective for the Sprint, attach a measure to it, and check the commitment
          against the velocity the team has actually delivered.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The goal</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sgg-name">
              Sprint name
            </label>
            <input
              id="sgg-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.sprintName}
              onChange={setField("sprintName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sgg-beneficiary">
              Who benefits
            </label>
            <input
              id="sgg-beneficiary"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.beneficiary}
              onChange={setField("beneficiary")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sgg-outcome">
              The one outcome (finish: “By the end of the Sprint, …”)
            </label>
            <textarea
              id="sgg-outcome"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={2}
              value={form.outcome}
              onChange={setField("outcome")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sgg-metric">
              Metric that proves it
            </label>
            <input
              id="sgg-metric"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.metric}
              onChange={setField("metric")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sgg-baseline">
              Baseline
            </label>
            <input
              id="sgg-baseline"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              value={form.baseline}
              onChange={setField("baseline")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sgg-target">
              Target
            </label>
            <input
              id="sgg-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              value={form.target}
              onChange={setField("target")}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Capacity and commitment</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sgg-weeks">
              Sprint length (weeks)
            </label>
            <input
              id="sgg-weeks"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="4"
              step="1"
              value={form.sprintLengthWeeks}
              onChange={setField("sprintLengthWeeks")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sgg-team">
              Developers on the team
            </label>
            <input
              id="sgg-team"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={form.teamSize}
              onChange={setField("teamSize")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sgg-hours">
              Nominal hours per day
            </label>
            <input
              id="sgg-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="24"
              step="0.5"
              value={form.hoursPerDay}
              onChange={setField("hoursPerDay")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sgg-focus">
              Focus factor (0-1)
            </label>
            <input
              id="sgg-focus"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              max="1"
              step="0.05"
              value={form.focusFactor}
              onChange={setField("focusFactor")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sgg-velocity">
              Average velocity (points)
            </label>
            <input
              id="sgg-velocity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={form.averageVelocity}
              onChange={setField("averageVelocity")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sgg-committed">
              Committed points
            </label>
            <input
              id="sgg-committed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={form.committedPoints}
              onChange={setField("committedPoints")}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Scope and risks</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="sgg-in">
              In scope (one per line)
            </label>
            <textarea
              id="sgg-in"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={3}
              value={form.scopeIn}
              onChange={setField("scopeIn")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sgg-out">
              Explicitly not this Sprint (one per line)
            </label>
            <textarea
              id="sgg-out"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={3}
              value={form.scopeOut}
              onChange={setField("scopeOut")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sgg-risks">
              Risks (one per line)
            </label>
            <textarea
              id="sgg-risks"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={3}
              value={form.risks}
              onChange={setField("risks")}
            />
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
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Sprint goal focus score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
              {hasError ? DASH : result.focusScore}
              <span className="ml-1 text-xl font-medium text-[var(--muted-foreground)]">/100</span>
            </p>
            <p className="mt-2 max-w-md text-sm leading-6">
              {hasError ? DASH : result.goalStatement}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the sprint goal sheet"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy sheet"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the generator" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Working days", hasError ? DASH : String(result.workingDays)],
            [
              "Focused capacity",
              hasError ? DASH : `${num.format(result.capacityHours)} h of ${num.format(result.nominalHours)} h`,
            ],
            ["Hours per point", hasError ? DASH : `${num.format(result.hoursPerPoint)} h`],
            [
              "Commitment",
              hasError ? DASH : `${num.format(result.commitmentRatio)}x — ${result.commitmentBand}`,
            ],
            [
              "Headroom to the 1.1x line",
              hasError ? DASH : `${num.format(result.pointsHeadroom)} points`,
            ],
            [
              "Metric change sought",
              hasError || result.measureChangePct === null
                ? DASH
                : `${num.format(result.measureDelta)} (${num.format(result.measureChangePct)}%)`,
            ],
            ["Goal length", hasError ? DASH : `${result.goalWords} words`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Goal checks</h2>
            <ul className="mt-3 grid gap-3">
              {result.checks.map((item) => (
                <li
                  key={item.key}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold">{item.label}</span>
                    <span
                      className={`text-sm font-semibold ${
                        item.pass ? "text-[var(--success)]" : "text-[var(--danger)]"
                      }`}
                    >
                      {item.pass ? "Pass" : "Fix"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{item.note}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Sprint review prompts</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
              {result.reviewPrompts.map((prompt) => (
                <li key={prompt}>{prompt}</li>
              ))}
            </ol>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Sheet</h2>
            <div className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] p-3">
              <pre className="min-w-0 font-mono text-xs leading-5 text-[var(--foreground)]">
                {result.markdown}
              </pre>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The Scrum Guide allows exactly one Sprint Goal per Sprint. If you need two, you have two
        Sprints' worth of work — pick the one you would defend if the other had to be dropped.
      </p>
    </main>
  );
}
