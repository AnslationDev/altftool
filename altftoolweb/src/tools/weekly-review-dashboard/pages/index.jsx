"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, LayoutDashboard, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  MAX_WEIGHT,
  MIN_WEIGHT,
  OKR_ON_TARGET,
  buildSummary,
  reviewWeek,
} from "../lib";

const STORAGE_KEY = "altft.weekly-review-dashboard.v1";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_GOALS = [
  { id: "g1", title: "Ship the billing rewrite", target: 10, actual: 8, unit: "tickets", weight: 3 },
  { id: "g2", title: "Publish long-form posts", target: 2, actual: 1, unit: "posts", weight: 2 },
  { id: "g3", title: "Strength sessions", target: 3, actual: 3, unit: "sessions", weight: 1 },
];

const DEFAULT_TASKS = [
  { id: "t1", title: "Migrate invoice schema", done: true, carriedOver: false },
  { id: "t2", title: "Review partner contract", done: true, carriedOver: false },
  { id: "t3", title: "Draft Q3 roadmap", done: false, carriedOver: true },
  { id: "t4", title: "Fix flaky payment test", done: false, carriedOver: false },
];

const DEFAULTS = {
  weekLabel: "Week 30",
  plannedHours: 40,
  actualHours: 47,
  previousScore: 0.65,
  wins: "The billing rewrite finally moved after pairing on the schema.",
  blockers: "Three unplanned incident calls ate most of Wednesday.",
  nextWeek: "Close the last two billing tickets before starting anything new.",
};

const numberFmt = new Intl.NumberFormat("en-US");

export default function ToolHome() {
  const [weekLabel, setWeekLabel] = useState(DEFAULTS.weekLabel);
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [tasks, setTasks] = useState(DEFAULT_TASKS);
  const [plannedHours, setPlannedHours] = useState(DEFAULTS.plannedHours);
  const [actualHours, setActualHours] = useState(DEFAULTS.actualHours);
  const [previousScore, setPreviousScore] = useState(DEFAULTS.previousScore);
  const [wins, setWins] = useState(DEFAULTS.wins);
  const [blockers, setBlockers] = useState(DEFAULTS.blockers);
  const [nextWeek, setNextWeek] = useState(DEFAULTS.nextWeek);
  const [nextId, setNextId] = useState(5);
  const [copied, setCopied] = useState(false);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed?.goals) || parsed.goals.length === 0) return;
      setWeekLabel(parsed.weekLabel ?? DEFAULTS.weekLabel);
      setGoals(parsed.goals);
      setTasks(Array.isArray(parsed.tasks) ? parsed.tasks : []);
      setPlannedHours(parsed.plannedHours ?? DEFAULTS.plannedHours);
      setActualHours(parsed.actualHours ?? DEFAULTS.actualHours);
      setPreviousScore(parsed.previousScore ?? DEFAULTS.previousScore);
      setWins(parsed.wins ?? "");
      setBlockers(parsed.blockers ?? "");
      setNextWeek(parsed.nextWeek ?? "");
      setNextId(parsed.nextId ?? parsed.goals.length + parsed.tasks?.length + 1);
      setRestored(true);
    } catch {
      setRestored(false);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          weekLabel, goals, tasks, plannedHours, actualHours, previousScore,
          wins, blockers, nextWeek, nextId,
        })
      );
    } catch {
      /* storage unavailable — the dashboard still works for this session */
    }
  }, [weekLabel, goals, tasks, plannedHours, actualHours, previousScore, wins, blockers, nextWeek, nextId]);

  const review = useMemo(
    () =>
      reviewWeek({
        goals,
        tasks,
        plannedHours: Number(plannedHours),
        actualHours: Number(actualHours),
        previousScore: previousScore === "" ? null : Number(previousScore),
      }),
    [goals, tasks, plannedHours, actualHours, previousScore]
  );

  const error = review.error ?? null;

  const summary = useMemo(
    () => (error ? { error } : buildSummary({ weekLabel, wins, blockers, nextWeek, review })),
    [error, weekLabel, wins, blockers, nextWeek, review]
  );

  const updateGoal = (id, patch) =>
    setGoals((previous) => previous.map((goal) => (goal.id === id ? { ...goal, ...patch } : goal)));
  const updateTask = (id, patch) =>
    setTasks((previous) => previous.map((task) => (task.id === id ? { ...task, ...patch } : task)));

  const addGoal = () => {
    const id = `g${nextId}`;
    setGoals((previous) => [
      ...previous,
      { id, title: "New goal", target: 5, actual: 0, unit: "", weight: 1 },
    ]);
    setNextId((value) => value + 1);
  };

  const addTask = () => {
    const id = `t${nextId}`;
    setTasks((previous) => [...previous, { id, title: "New task", done: false, carriedOver: false }]);
    setNextId((value) => value + 1);
  };

  const handleCopy = async () => {
    if (summary.error) return;
    try {
      await navigator.clipboard.writeText(summary.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const handleReset = () => {
    setWeekLabel(DEFAULTS.weekLabel);
    setGoals(DEFAULT_GOALS);
    setTasks(DEFAULT_TASKS);
    setPlannedHours(DEFAULTS.plannedHours);
    setActualHours(DEFAULTS.actualHours);
    setPreviousScore(DEFAULTS.previousScore);
    setWins(DEFAULTS.wins);
    setBlockers(DEFAULTS.blockers);
    setNextWeek(DEFAULTS.nextWeek);
    setNextId(5);
    setCopied(false);
    setRestored(false);
  };

  const dash = "—";

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <header className="mb-6 flex items-start gap-3">
        <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
          <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)] sm:text-2xl">
            Weekly Review Dashboard
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Grade the week on the OKR 0.0–1.0 scale, weighted by how much each goal mattered,
            with task completion, time variance and an exportable summary. Saved locally.
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="week-label">
            Week
          </label>
          <input
            id="week-label"
            className={`${INPUT_CLASS} mt-1.5`}
            value={weekLabel}
            onChange={(event) => setWeekLabel(event.target.value)}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="previous-score">
            Last week&apos;s score (0–1, blank for none)
          </label>
          <input
            id="previous-score"
            type="number"
            min="0"
            max="1"
            step="0.01"
            className={`${INPUT_CLASS} mt-1.5`}
            value={previousScore}
            onChange={(event) => setPreviousScore(event.target.value)}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="planned-hours">
            Hours planned
          </label>
          <input
            id="planned-hours"
            type="number"
            min="0"
            step="0.5"
            className={`${INPUT_CLASS} mt-1.5`}
            value={plannedHours}
            onChange={(event) => setPlannedHours(event.target.value)}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="actual-hours">
            Hours actually worked
          </label>
          <input
            id="actual-hours"
            type="number"
            min="0"
            step="0.5"
            className={`${INPUT_CLASS} mt-1.5`}
            value={actualHours}
            onChange={(event) => setActualHours(event.target.value)}
          />
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Week score
        </p>
        <p className="mt-1 text-5xl font-bold text-[var(--foreground)]">
          {error ? dash : review.overallScore.toFixed(2)}
        </p>
        <p className="mt-1 text-base font-semibold text-[var(--primary)]">
          {error ? dash : `${review.grade} · ${review.overallPercent}%`}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {error ? dash : review.gradeNote}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-4 text-sm">
          <div>
            <dt className="text-[var(--muted-foreground)]">Goals reviewed</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error ? dash : numberFmt.format(review.goalCount)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Tasks closed</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error
                ? dash
                : `${review.doneTasks} of ${review.taskCount} (${review.taskCompletion}%)`}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Hours vs plan</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error
                ? dash
                : `${review.hoursVariance >= 0 ? "+" : ""}${review.hoursVariance}h${
                    review.hoursVariancePercent === null ? "" : ` (${review.hoursVariancePercent}%)`
                  }`}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Trend vs last week</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error || review.trend === null
                ? dash
                : `${review.trend >= 0 ? "+" : ""}${review.trend.toFixed(2)}`}
            </dd>
          </div>
        </dl>

        {!error ? (
          <div className="mt-4 border-t border-[var(--border)] pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Goal attainment
            </p>
            <ul className="mt-3 space-y-3">
              {review.byGoal.map((goal) => (
                <li key={goal.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                    <span className="font-semibold text-[var(--foreground)]">
                      {goal.title}{" "}
                      <span className="font-normal text-[var(--muted-foreground)]">
                        · weight {goal.weight}
                      </span>
                    </span>
                    <span className="text-[var(--muted-foreground)]">
                      {goal.actual} / {goal.target} {goal.unit} · {goal.score.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                    <div
                      className={`h-full rounded-full ${
                        goal.score >= OKR_ON_TARGET ? "bg-[var(--success)]" : "bg-[var(--primary)]"
                      }`}
                      style={{ width: `${goal.percent}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {!error && review.warnings.length > 0 ? (
          <ul className="mt-4 space-y-1.5 border-t border-[var(--border)] pt-4 text-sm text-[var(--danger)]">
            {review.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Goals</h2>
        <button type="button" className={GHOST_BTN} onClick={addGoal} aria-label="Add a goal">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add goal
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {goals.map((goal) => (
          <div key={goal.id} className="rounded-md border border-[var(--border)] bg-[var(--card)] p-3">
            <div>
              <label className={LABEL_CLASS} htmlFor={`title-${goal.id}`}>
                Goal
              </label>
              <input
                id={`title-${goal.id}`}
                className={`${INPUT_CLASS} mt-1.5`}
                value={goal.title}
                onChange={(event) => updateGoal(goal.id, { title: event.target.value })}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className={LABEL_CLASS} htmlFor={`target-${goal.id}`}>
                  Target
                </label>
                <input
                  id={`target-${goal.id}`}
                  type="number"
                  min="0"
                  step="0.5"
                  className={`${INPUT_CLASS} mt-1.5`}
                  value={goal.target}
                  onChange={(event) => updateGoal(goal.id, { target: Number(event.target.value) })}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`actual-${goal.id}`}>
                  Actual
                </label>
                <input
                  id={`actual-${goal.id}`}
                  type="number"
                  min="0"
                  step="0.5"
                  className={`${INPUT_CLASS} mt-1.5`}
                  value={goal.actual}
                  onChange={(event) => updateGoal(goal.id, { actual: Number(event.target.value) })}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`unit-${goal.id}`}>
                  Unit
                </label>
                <input
                  id={`unit-${goal.id}`}
                  className={`${INPUT_CLASS} mt-1.5`}
                  value={goal.unit}
                  onChange={(event) => updateGoal(goal.id, { unit: event.target.value })}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`weight-${goal.id}`}>
                  Weight ({MIN_WEIGHT}–{MAX_WEIGHT})
                </label>
                <input
                  id={`weight-${goal.id}`}
                  type="number"
                  min={MIN_WEIGHT}
                  max={MAX_WEIGHT}
                  step="1"
                  className={`${INPUT_CLASS} mt-1.5`}
                  value={goal.weight}
                  onChange={(event) => updateGoal(goal.id, { weight: Number(event.target.value) })}
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                className={GHOST_BTN}
                onClick={() => setGoals((previous) => previous.filter((entry) => entry.id !== goal.id))}
                aria-label={`Remove ${goal.title}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Tasks</h2>
        <button type="button" className={GHOST_BTN} onClick={addTask} aria-label="Add a task">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add task
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="rounded-md border border-[var(--border)] bg-[var(--card)] p-3">
            <label className={LABEL_CLASS} htmlFor={`task-${task.id}`}>
              Task
            </label>
            <input
              id={`task-${task.id}`}
              className={`${INPUT_CLASS} mt-1.5`}
              value={task.title}
              onChange={(event) => updateTask(task.id, { title: event.target.value })}
            />
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <label
                className="flex min-h-11 items-center gap-2 text-sm text-[var(--foreground)]"
                htmlFor={`done-${task.id}`}
              >
                <input
                  id={`done-${task.id}`}
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--primary)]"
                  checked={Boolean(task.done)}
                  onChange={(event) => updateTask(task.id, { done: event.target.checked })}
                />
                Done
              </label>
              <label
                className="flex min-h-11 items-center gap-2 text-sm text-[var(--foreground)]"
                htmlFor={`carried-${task.id}`}
              >
                <input
                  id={`carried-${task.id}`}
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--primary)]"
                  checked={Boolean(task.carriedOver)}
                  onChange={(event) => updateTask(task.id, { carriedOver: event.target.checked })}
                />
                Rolled over from last week
              </label>
              <button
                type="button"
                className={GHOST_BTN}
                onClick={() => setTasks((previous) => previous.filter((entry) => entry.id !== task.id))}
                aria-label={`Remove ${task.title}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4">
        {[
          ["wins", "What worked this week", wins, setWins],
          ["blockers", "What blocked me", blockers, setBlockers],
          ["nextWeek", "Focus for next week", nextWeek, setNextWeek],
        ].map(([id, label, value, setter]) => (
          <div key={id}>
            <label className={LABEL_CLASS} htmlFor={id}>
              {label}
            </label>
            <textarea
              id={id}
              rows={2}
              className={`${TEXTAREA_CLASS} mt-1.5`}
              value={value}
              onChange={(event) => setter(event.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          className={PRIMARY_BTN}
          onClick={handleCopy}
          aria-label="Copy the weekly review summary to clipboard"
          disabled={Boolean(summary.error)}
        >
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copied!" : "Copy summary"}
        </button>
        <button type="button" className={GHOST_BTN} onClick={handleReset} aria-label="Reset the dashboard">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      <p className="mt-4 text-xs text-[var(--muted-foreground)]">
        {restored ? "Restored from this browser's local storage. " : ""}
        A goal scores at most 1.00 however far past target it lands, and{" "}
        {OKR_ON_TARGET.toFixed(1)} is the OKR landing zone.
      </p>
    </div>
  );
}
