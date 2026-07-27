"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Timer, Trash2 } from "lucide-react";

import { DEFAULT_WORK_WEEKS_PER_YEAR, computeTimeSaved } from "../lib";

const NUM1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const PCT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_TASKS = [
  { name: "Draft weekly status report", before: "45", after: "15", runs: "1" },
  { name: "Answer routine support emails", before: "10", after: "4", runs: "20" },
  { name: "Summarise meeting notes", before: "20", after: "5", runs: "3" },
];

const DASH = "—";

let nextRowId = DEFAULT_TASKS.length;

export default function ToolHome() {
  const [rows, setRows] = useState(
    DEFAULT_TASKS.map((t, i) => ({ ...t, id: `row-${i}` })),
  );
  const [workWeeks, setWorkWeeks] = useState(String(DEFAULT_WORK_WEEKS_PER_YEAR));
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeTimeSaved({
        tasks: rows.map((r) => ({
          name: r.name,
          beforeMinutes: r.before.trim() === "" ? Number.NaN : Number(r.before),
          afterMinutes: r.after.trim() === "" ? Number.NaN : Number(r.after),
          runsPerWeek: r.runs.trim() === "" ? Number.NaN : Number(r.runs),
        })),
        workWeeksPerYear: workWeeks.trim() === "" ? Number.NaN : Number(workWeeks),
      }),
    [rows, workWeeks],
  );

  const hasError = Boolean(result.error);

  const updateRow = (id, field, value) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const addRow = () => {
    nextRowId += 1;
    setRows((prev) => [
      ...prev,
      { id: `row-${nextRowId}`, name: "", before: "15", after: "5", runs: "1" },
    ]);
  };

  const removeRow = (id) => {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "AI time saved estimate",
      ...result.taskResults.map(
        (t) =>
          `${t.name}: ${NUM1.format(t.weeklySavedMinutes)} min/week (${PCT.format(t.reductionPct)}% faster per run)`,
      ),
      `Total: ${NUM1.format(result.weeklyHours)} h/week`,
      `Annual (${result.workWeeksPerYear} working weeks): ${NUM1.format(result.annualHours)} h ≈ ${NUM1.format(result.annualDaysEquivalent)} working days`,
    ].join("\n");
  }, [hasError, result]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setRows(DEFAULT_TASKS.map((t, i) => ({ ...t, id: `reset-${Date.now()}-${i}` })));
    setWorkWeeks(String(DEFAULT_WORK_WEEKS_PER_YEAR));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          AI Business
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AI Time Saved Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter how long each task took before AI, how long it takes now, and how often you do it —
          get weekly and annual hours saved from real timings, not vendor multipliers.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        {rows.map((row, index) => (
          <div
            key={row.id}
            className="mb-4 rounded-lg border border-[var(--border)] p-3 last:mb-0"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS} htmlFor={`${row.id}-name`}>
                  Task {index + 1} name
                </label>
                <input
                  id={`${row.id}-name`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  value={row.name}
                  onChange={(e) => updateRow(row.id, "name", e.target.value)}
                  placeholder={`Task ${index + 1}`}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`${row.id}-before`}>
                  Before AI (minutes per run)
                </label>
                <input
                  id={`${row.id}-before`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="1"
                  value={row.before}
                  onChange={(e) => updateRow(row.id, "before", e.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`${row.id}-after`}>
                  With AI (minutes per run)
                </label>
                <input
                  id={`${row.id}-after`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={row.after}
                  onChange={(e) => updateRow(row.id, "after", e.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`${row.id}-runs`}>
                  Times per week
                </label>
                <input
                  id={`${row.id}-runs`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={row.runs}
                  onChange={(e) => updateRow(row.id, "runs", e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length === 1}
                  aria-label={`Remove task ${index + 1}`}
                  className={`${GHOST_BTN} w-full disabled:opacity-50`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <button type="button" onClick={addRow} className={GHOST_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add task
          </button>
          <div>
            <label className={LABEL_CLASS} htmlFor="ts-weeks">
              Working weeks per year
            </label>
            <input
              id="ts-weeks"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="52"
              step="1"
              value={workWeeks}
              onChange={(e) => setWorkWeeks(e.target.value)}
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Hours saved per week
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM1.format(result.weeklyHours)} h`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.anyTaskSlower
                  ? "Note: at least one task is slower with AI — its saving is negative in the total."
                  : `≈ ${NUM1.format(result.annualDaysEquivalent)} full working days per year at ${result.workWeeksPerYear} working weeks.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the time saved breakdown"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
              aria-label="Reset all tasks to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {hasError ? (
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Breakdown</dt>
              <dd className="text-right font-semibold">{DASH}</dd>
            </div>
          ) : (
            <>
              {result.taskResults.map((t) => (
                <div key={t.name} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">
                    {t.name}{" "}
                    <span className="text-xs">
                      ({PCT.format(t.reductionPct)}% {t.slower ? "slower" : "faster"} per run)
                    </span>
                  </dt>
                  <dd
                    className={`text-right font-semibold ${t.slower ? "text-[var(--danger)]" : ""}`}
                  >
                    {NUM1.format(t.weeklySavedMinutes)} min/wk
                  </dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">Total per week</dt>
                <dd className="text-right font-semibold">
                  {NUM1.format(result.weeklyMinutes)} min ({NUM1.format(result.weeklyHours)} h)
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">
                  Per year ({result.workWeeksPerYear} working weeks)
                </dt>
                <dd className="text-right font-semibold">
                  {NUM1.format(result.annualHours)} h ≈ {NUM1.format(result.annualDaysEquivalent)}{" "}
                  days
                </dd>
              </div>
            </>
          )}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Use measured timings — time the task twice, once without AI and once with it, including the
        review pass. Defaults assume 46 working weeks per year (52 minus leave and holidays).
      </p>
    </main>
  );
}
