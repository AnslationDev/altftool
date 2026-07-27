"use client";

import { useMemo, useState } from "react";
import { Copy, FileSpreadsheet, RotateCcw } from "lucide-react";

import { OUTPUT_TARGETS, TASK_TYPES, buildExcelCopilotPrompt } from "../lib";

const FIELD =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA =
  "min-h-24 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DEFAULTS = {
  sheetName: "Sales",
  range: "A1:F250",
  headerRow: "1",
  headers: "Date, Region, Salesperson, Product, Units, Revenue",
  taskId: "analyze",
  goal: "Find the regions and products driving most of the revenue change.",
  outputTarget: "summary",
  tableName: "SalesTable",
  extraContext: "The sheet is already filtered to FY 2026.",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [isTable, setIsTable] = useState(true);
  const [copied, setCopied] = useState(false);
  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(() => buildExcelCopilotPrompt({ ...form, isTable }), [form, isTable]);

  const copy = async () => {
    if (!result.prompt) return;
    await navigator.clipboard?.writeText(result.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const reset = () => {
    setForm(DEFAULTS);
    setIsTable(true);
    setCopied(false);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--primary)]">
            <FileSpreadsheet className="h-4 w-4" /> Spreadsheet prompt builder
          </p>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Excel Copilot Prompt Builder</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            Name the exact worksheet, range, headers and task so Copilot works from your grid instead of guessing.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Sheet name", "sheetName"],
                ["A1 range", "range"],
                ["Header row", "headerRow"],
                ["Table name", "tableName"],
              ].map(([label, key]) => (
                <label key={key} className="block">
                  <span className="mb-1 block text-sm font-medium">{label}</span>
                  <input className={FIELD} value={form[key]} onChange={set(key)} />
                </label>
              ))}
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Task</span>
                <select className={FIELD} value={form.taskId} onChange={set("taskId")}>
                  {TASK_TYPES.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Output target</span>
                <select className={FIELD} value={form.outputTarget} onChange={set("outputTarget")}>
                  {OUTPUT_TARGETS.map((target) => (
                    <option key={target.id} value={target.id}>
                      {target.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-sm font-medium">Column headers</span>
                <textarea className={AREA} value={form.headers} onChange={set("headers")} />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-sm font-medium">Goal</span>
                <textarea className={AREA} value={form.goal} onChange={set("goal")} />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-sm font-medium">Extra context</span>
                <textarea className={AREA} value={form.extraContext} onChange={set("extraContext")} />
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input checked={isTable} onChange={(event) => setIsTable(event.target.checked)} type="checkbox" />
                Range is an Excel table
              </label>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                aria-label="Copy the generated Excel Copilot prompt"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={Boolean(result.error)}
                onClick={copy}
                type="button"
              >
                <Copy aria-hidden="true" className="h-4 w-4" /> {copied ? "Copied!" : "Copy prompt"}
              </button>
              <button
                aria-label="Reset all inputs to their defaults"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] px-4 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                onClick={reset}
                type="button"
              >
                <RotateCcw aria-hidden="true" className="h-4 w-4" /> Reset
              </button>
            </div>
          </section>

          <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-lg font-semibold">Copilot-ready prompt</h2>
            {result.error ? (
              <>
                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                  <div className="rounded-lg bg-[var(--muted)]/30 p-3">&mdash;</div>
                  <div className="rounded-lg bg-[var(--muted)]/30 p-3">&mdash; data rows</div>
                  <div className="rounded-lg bg-[var(--muted)]/30 p-3">&mdash; headers</div>
                </div>
                <p
                  className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
                  role="alert"
                >
                  {result.error}
                </p>
              </>
            ) : (
              <>
                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                  <div className="rounded-lg bg-[var(--muted)]/30 p-3">{result.range.normalized}</div>
                  <div className="rounded-lg bg-[var(--muted)]/30 p-3">{result.dataRowCount.toLocaleString("en-IN")} data rows</div>
                  <div className="rounded-lg bg-[var(--muted)]/30 p-3">{result.headerCount} headers</div>
                </div>
                {result.warnings.length ? (
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
                    {result.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                ) : null}
                <pre className="mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap rounded-lg bg-[var(--background)] p-4 text-xs leading-5 ring-1 ring-[var(--border)]">
                  {result.prompt}
                </pre>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
