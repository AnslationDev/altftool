"use client";

import { useMemo, useState } from "react";
import { Check, Copy, LayoutDashboard, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  DEFAULT_THRESHOLD,
  SCORE_MAX,
  SCORE_MIN,
  buildMatrix,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const num = (v) => (Number.isFinite(v) ? NUM.format(v) : DASH);
const pct = (v) => (Number.isFinite(v) ? `${NUM.format(v)}%` : DASH);

const toNumber = (raw) => {
  const cleaned = String(raw).trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

const DEFAULT_TASKS = [
  { id: "t1", title: "Fix the checkout bug", importance: "9", urgency: "9", hours: "4" },
  { id: "t2", title: "Draft next quarter's roadmap", importance: "9", urgency: "4", hours: "6" },
  { id: "t3", title: "Reply to the vendor thread", importance: "3", urgency: "8", hours: "1" },
  { id: "t4", title: "Reorganise the shared drive", importance: "2", urgency: "2", hours: "3" },
  { id: "t5", title: "Prep the board deck", importance: "8", urgency: "7", hours: "5" },
];

let seq = DEFAULT_TASKS.length;
const nextId = () => {
  seq += 1;
  return `t${seq}`;
};

export default function ToolHome() {
  const [tasks, setTasks] = useState(DEFAULT_TASKS);
  const [threshold, setThreshold] = useState(String(DEFAULT_THRESHOLD));
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildMatrix({
        tasks: tasks.map((t) => ({
          id: t.id,
          title: t.title,
          importance: toNumber(t.importance),
          urgency: toNumber(t.urgency),
          hours: toNumber(t.hours) || 0,
        })),
        threshold: toNumber(threshold),
      }),
    [tasks, threshold],
  );

  const hasError = Boolean(result.error);

  const patch = (id, p) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...p } : t)));
  const remove = (id) => setTasks((prev) => (prev.length > 1 ? prev.filter((t) => t.id !== id) : prev));
  const add = () =>
    setTasks((prev) => [...prev, { id: nextId(), title: "", importance: "5", urgency: "5", hours: "1" }]);
  const reset = () => {
    setTasks(DEFAULT_TASKS);
    setThreshold(String(DEFAULT_THRESHOLD));
    setCopied(false);
  };

  const copy = async () => {
    if (hasError) return;
    const lines = [`Eisenhower board — ${result.total} tasks, ${num(result.totalHours)} hours`, ""];
    for (const q of result.quadrants) {
      lines.push(`${q.label} (${q.subtitle}) — ${q.count} tasks, ${num(q.hours)}h`);
      for (const t of q.tasks) lines.push(`  - ${t.title} (I${t.importance}/U${t.urgency}, ${num(t.hours)}h)`);
    }
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <LayoutDashboard className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          Eisenhower Matrix Tool
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Score each task for importance and urgency from {SCORE_MIN} to {SCORE_MAX}. Anything at or
          above the threshold counts as high, which decides its quadrant and what you should do with it.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="threshold">
            High-score threshold ({SCORE_MIN + 0.1}–{SCORE_MAX})
          </label>
          <input
            id="threshold"
            className={`${INPUT_CLASS} mt-1`}
            type="number"
            inputMode="decimal"
            min={SCORE_MIN + 1}
            max={SCORE_MAX}
            step="0.5"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
          />
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Raise it to be stricter about what counts as important or urgent.
          </p>
        </div>
      </div>

      <section aria-labelledby="tasks-heading" className="mt-6">
        <h2 id="tasks-heading" className="mb-3 text-sm font-semibold text-[var(--foreground)]">
          Tasks
        </h2>
        <div className="space-y-4">
          {tasks.map((t, i) => (
            <div key={t.id} className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-4">
              <div>
                <label className={LABEL_CLASS} htmlFor={`title-${t.id}`}>
                  Task {i + 1}
                </label>
                <input
                  id={`title-${t.id}`}
                  className={`${INPUT_CLASS} mt-1`}
                  type="text"
                  placeholder="What is it?"
                  value={t.title}
                  onChange={(e) => patch(t.id, { title: e.target.value })}
                />
              </div>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`imp-${t.id}`}>
                    Importance ({SCORE_MIN}–{SCORE_MAX})
                  </label>
                  <input
                    id={`imp-${t.id}`}
                    className={`${INPUT_CLASS} mt-1`}
                    type="number"
                    inputMode="decimal"
                    min={SCORE_MIN}
                    max={SCORE_MAX}
                    step="1"
                    value={t.importance}
                    onChange={(e) => patch(t.id, { importance: e.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`urg-${t.id}`}>
                    Urgency ({SCORE_MIN}–{SCORE_MAX})
                  </label>
                  <input
                    id={`urg-${t.id}`}
                    className={`${INPUT_CLASS} mt-1`}
                    type="number"
                    inputMode="decimal"
                    min={SCORE_MIN}
                    max={SCORE_MAX}
                    step="1"
                    value={t.urgency}
                    onChange={(e) => patch(t.id, { urgency: e.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`hrs-${t.id}`}>
                    Estimated hours
                  </label>
                  <input
                    id={`hrs-${t.id}`}
                    className={`${INPUT_CLASS} mt-1`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    value={t.hours}
                    onChange={(e) => patch(t.id, { hours: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    className={`${GHOST_BTN} w-full`}
                    onClick={() => remove(t.id)}
                    disabled={tasks.length === 1}
                    aria-label={`Remove ${t.title || `task ${i + 1}`}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className={PRIMARY_BTN} onClick={add}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add task
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
          <button type="button" className={GHOST_BTN} onClick={copy} aria-label="Copy the sorted matrix to clipboard">
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy result"}
          </button>
        </div>
      </section>

      {hasError ? (
        <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
          {result.error}
        </p>
      ) : null}

      <section
        aria-labelledby="summary-heading"
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
      >
        <h2 id="summary-heading" className="text-sm font-semibold text-[var(--muted-foreground)]">
          Share of planned hours in Q2 (scheduled, important work)
        </h2>
        <p className="mt-1 text-4xl font-bold tracking-tight text-[var(--foreground)]">
          {hasError ? DASH : pct(result.focusPercent)}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {hasError
            ? DASH
            : result.balanced
              ? "Balanced board — planned work outweighs firefighting."
              : "Unbalanced board — see the notes below."}
        </p>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Tasks sorted</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">{hasError ? DASH : result.total}</dd>
          </div>
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Total hours</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">{hasError ? DASH : num(result.totalHours)}</dd>
          </div>
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Firefighting (Q1) hours</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {hasError ? DASH : pct(result.firefightingPercent)}
            </dd>
          </div>
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Hours you could delegate or drop</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {hasError ? DASH : num(result.delegatableHours + result.droppableHours)}
            </dd>
          </div>
        </dl>

        {!hasError ? (
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.advice.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <section aria-labelledby="matrix-heading" className="mt-6">
        <h2 id="matrix-heading" className="mb-3 text-sm font-semibold text-[var(--foreground)]">
          The matrix
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {(hasError ? [] : result.quadrants).map((q) => (
            <div key={q.key} className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-base font-bold text-[var(--foreground)]">{q.label}</h3>
                <span className="text-xs font-semibold text-[var(--muted-foreground)]">{q.key}</span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">{q.subtitle}</p>
              <p className="mt-3 text-2xl font-bold text-[var(--foreground)]">
                {q.count} <span className="text-sm font-normal text-[var(--muted-foreground)]">tasks · {num(q.hours)}h</span>
              </p>
              <ul className="mt-3 space-y-2">
                {q.tasks.length === 0 ? (
                  <li className="text-sm text-[var(--muted-foreground)]">Nothing here.</li>
                ) : (
                  q.tasks.map((t) => (
                    <li key={t.id} className="flex justify-between gap-3 border-b border-[var(--border)] pb-2 text-sm last:border-0">
                      <span className="text-[var(--foreground)]">{t.title}</span>
                      <span className="shrink-0 text-[var(--muted-foreground)]">
                        I{t.importance} · U{t.urgency}
                      </span>
                    </li>
                  ))
                )}
              </ul>
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">{q.action}</p>
            </div>
          ))}
          {hasError ? (
            <p className="text-sm text-[var(--muted-foreground)]">{DASH}</p>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="table-heading" className="mt-6">
        <h2 id="table-heading" className="mb-3 text-sm font-semibold text-[var(--foreground)]">
          Every task, sorted
        </h2>
        <div className="overflow-x-auto rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)]">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <caption className="sr-only">Task list with importance, urgency, hours and quadrant</caption>
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th scope="col" className="px-4 py-3 font-semibold text-[var(--foreground)]">Task</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold text-[var(--foreground)]">Importance</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold text-[var(--foreground)]">Urgency</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold text-[var(--foreground)]">Hours</th>
                <th scope="col" className="px-4 py-3 font-semibold text-[var(--foreground)]">Quadrant</th>
              </tr>
            </thead>
            <tbody>
              {hasError ? (
                <tr>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]" colSpan={5}>{DASH}</td>
                </tr>
              ) : (
                result.tasks.map((t) => (
                  <tr key={t.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3 text-[var(--foreground)]">{t.title}</td>
                    <td className="px-4 py-3 text-right text-[var(--foreground)]">{t.importance}</td>
                    <td className="px-4 py-3 text-right text-[var(--foreground)]">{t.urgency}</td>
                    <td className="px-4 py-3 text-right text-[var(--foreground)]">{num(t.hours)}</td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)]">
                      {result.byKey[t.quadrant].label}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs text-[var(--muted-foreground)]">
        Scores are yours to set. The board is recalculated as you type and is never sent anywhere.
      </p>
    </div>
  );
}
