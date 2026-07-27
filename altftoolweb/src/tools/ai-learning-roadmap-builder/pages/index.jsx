"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Route } from "lucide-react";

import {
  CODING_LEVELS,
  GOALS,
  MAX_HOURS_PER_WEEK,
  MIN_HOURS_PER_WEEK,
  PROMPTING_LEVELS,
  buildRoadmap,
  roadmapToText,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US");
const ONE_DP = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  goalId: "builder",
  promptingLevel: "casual",
  codingLevel: "some-code",
  hoursPerWeek: "6",
  weeksAvailable: "",
};

const isoToday = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

/** Stable date for the first render, replaced with today once mounted. */
const FALLBACK_START = "2026-01-05";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [startDate, setStartDate] = useState(FALLBACK_START);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setStartDate(isoToday());
  }, []);

  const roadmap = useMemo(
    () =>
      buildRoadmap({
        goalId: form.goalId,
        promptingLevel: form.promptingLevel,
        codingLevel: form.codingLevel,
        hoursPerWeek: Number(form.hoursPerWeek),
        weeksAvailable: form.weeksAvailable === "" ? null : Number(form.weeksAvailable),
        startDate,
      }),
    [form, startDate]
  );

  const hasError = Boolean(roadmap.error);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const reset = () => {
    setForm(DEFAULTS);
    setStartDate(isoToday());
    setCopied(false);
  };

  const clipboardText = useMemo(() => (hasError ? "" : roadmapToText(roadmap)), [hasError, roadmap]);

  const copyResult = async () => {
    if (!clipboardText) return;
    try {
      await navigator.clipboard.writeText(clipboardText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const breakdown = [
    ["Modules to study", hasError ? DASH : NUM.format(roadmap.moduleCount)],
    ["Total study hours", hasError ? DASH : `${NUM.format(roadmap.totalHours)} h`],
    ["Hours per week", hasError ? DASH : `${ONE_DP.format(roadmap.hoursPerWeek)} h`],
    ["Calendar length", hasError ? DASH : `${ONE_DP.format(roadmap.totalMonths)} months`],
    ["Start", hasError ? DASH : roadmap.startDate],
    ["Target finish", hasError ? DASH : roadmap.finishDate],
    [
      "Skipped from your experience",
      hasError
        ? DASH
        : roadmap.skippedModules.length === 0
          ? "None"
          : `${NUM.format(roadmap.skippedModules.length)} module(s), ${NUM.format(roadmap.skippedHours)} h`,
    ],
  ];

  const selectedGoal = GOALS.find((goal) => goal.id === form.goalId);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Route className="h-4 w-4" aria-hidden="true" />
          Study path
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AI Learning Roadmap Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a goal and your starting point, and get an ordered study plan from prompting basics
          through retrieval, evaluation and fine-tuning — with every module placed in the week your
          available hours actually put it.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="alr-goal">
              What do you want to be able to do?
            </label>
            <select
              id="alr-goal"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.goalId}
              onChange={(event) => setField("goalId", event.target.value)}
            >
              {GOALS.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.label}
                </option>
              ))}
            </select>
            {selectedGoal && (
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">{selectedGoal.blurb}</p>
            )}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="alr-prompting">
              Prompting experience
            </label>
            <select
              id="alr-prompting"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.promptingLevel}
              onChange={(event) => setField("promptingLevel", event.target.value)}
            >
              {PROMPTING_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="alr-coding">
              Coding background
            </label>
            <select
              id="alr-coding"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.codingLevel}
              onChange={(event) => setField("codingLevel", event.target.value)}
            >
              {CODING_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="alr-hours">
              Study hours per week
            </label>
            <input
              id="alr-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={MIN_HOURS_PER_WEEK}
              max={MAX_HOURS_PER_WEEK}
              step="0.5"
              value={form.hoursPerWeek}
              onChange={(event) => setField("hoursPerWeek", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="alr-start">
              Start date
            </label>
            <input
              id="alr-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={startDate}
              onChange={(event) => {
                setStartDate(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="alr-deadline">
              Weeks available (optional)
            </label>
            <input
              id="alr-deadline"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              placeholder="e.g. 12 if you have a quarter"
              value={form.weeksAvailable}
              onChange={(event) => setField("weeksAvailable", event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {roadmap.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Plan length
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(roadmap.totalWeeks)} weeks`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs to see a plan"
                : `${NUM.format(roadmap.totalHours)} study hours across ${NUM.format(roadmap.moduleCount)} modules`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the roadmap"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {breakdown.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && roadmap.deadline && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
              roadmap.deadline.fits
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]"
            }`}
          >
            {roadmap.deadline.fits
              ? `Fits your ${NUM.format(roadmap.deadline.weeksAvailable)}-week window.`
              : `${NUM.format(roadmap.deadline.weeksOver)} week(s) over your window — you would need ${ONE_DP.format(roadmap.deadline.hoursPerWeekNeeded)} hours per week to finish in ${NUM.format(roadmap.deadline.weeksAvailable)}.`}
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Week-by-week modules</h2>
          <ol className="mt-4 space-y-4">
            {roadmap.plan.map((module, index) => (
              <li key={module.id} className="relative pl-9">
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-[var(--primary-foreground)]"
                >
                  {index + 1}
                </span>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
                  {module.weekStart === module.weekEnd
                    ? `Week ${module.weekStart}`
                    : `Weeks ${module.weekStart}-${module.weekEnd}`}{" "}
                  · {module.hours} h · {module.stageName}
                </p>
                <p className="mt-0.5 text-sm font-semibold">{module.title}</p>
                <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">{module.outcome}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {!hasError && roadmap.byStage.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Hours by stage</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Stage</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Modules</th>
                  <th scope="col" className="py-2 text-right font-semibold">Hours</th>
                </tr>
              </thead>
              <tbody>
                {roadmap.byStage.map((stage) => (
                  <tr key={stage.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{stage.name}</td>
                    <td className="py-2 pr-3 text-right">{NUM.format(stage.count)}</td>
                    <td className="py-2 text-right">{NUM.format(stage.hours)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {roadmap.skippedModules.length > 0 && (
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">
              Skipped because of your experience:{" "}
              {roadmap.skippedModules.map((module) => module.title).join(", ")}.
            </p>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Hour estimates are planning budgets that assume you build the practice project for each
        module, not just read about it. Real pace varies with background and with how much code you
        write.
      </p>
    </main>
  );
}
